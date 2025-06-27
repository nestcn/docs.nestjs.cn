### 守卫

WebSocket 守卫与[常规 HTTP 应用守卫](/guards)没有本质区别。唯一的不同在于，你应该使用 `WsException` 而不是抛出 `HttpException`。

> info **注意** `WsException` 类是从 `@nestjs/websockets` 包中导出的。

#### 绑定守卫

以下示例使用了方法作用域的守卫。与基于 HTTP 的应用一样，你也可以使用网关作用域的守卫（即在网关类前添加 `@UseGuards()` 装饰器）。

```typescript
@@filename()
### 守卫

WebSocket 守卫与[常规 HTTP 应用守卫](/guards)没有本质区别。唯一的不同在于，你应该使用 `WsException` 而不是抛出 `HttpException`。

> info **注意** `WsException` 类是从 `@nestjs/websockets` 包中导出的。

#### 绑定守卫

以下示例使用了方法作用域的守卫。与基于 HTTP 的应用一样，你也可以使用网关作用域的守卫（即在网关类前添加 `@UseGuards()` 装饰器）。

```typescript
@@filename()
@UseGuards(AuthGuard)
@SubscribeMessage('events')
handleEvent(client: Client, data: unknown): WsResponse<unknown> {
  const event = 'events';
  return { event, data };
}
```

#### JWT 认证守卫

实现 WebSocket JWT 认证守卫：

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: Socket = context.switchToWs().getClient<Socket>();
      const authToken = this.extractTokenFromSocket(client);
      
      if (!authToken) {
        throw new WsException('未找到认证令牌');
      }

      const payload = await this.jwtService.verifyAsync(authToken);
      
      // 将用户信息添加到 socket 中
      client.data.user = payload;
      
      return true;
    } catch (error) {
      throw new WsException('认证失败');
    }
  }

  private extractTokenFromSocket(client: Socket): string | undefined {
    const authHeader = client.handshake.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    
    // 也可以从查询参数中获取令牌
    return client.handshake.query.token as string;
  }
}
```

#### 角色守卫

实现基于角色的访问控制：

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
export class WsRolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    
    if (!requiredRoles) {
      return true;
    }

    const client: Socket = context.switchToWs().getClient<Socket>();
    const user = client.data.user;

    if (!user) {
      throw new WsException('用户未认证');
    }

    const hasRole = requiredRoles.some(role => user.roles?.includes(role));
    
    if (!hasRole) {
      throw new WsException('权限不足');
    }

    return true;
  }
}

// 角色装饰器
import { SetMetadata } from '@nestjs/common';

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

// 使用示例
@UseGuards(WsJwtGuard, WsRolesGuard)
@Roles('admin', 'moderator')
@SubscribeMessage('admin-message')
handleAdminMessage(@MessageBody() data: any) {
  return { message: '管理员消息已处理' };
}
```

#### 速率限制守卫

防止消息洪水攻击：

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
export class WsRateLimitGuard implements CanActivate {
  private readonly clients = new Map<string, { count: number; resetTime: number }>();
  private readonly maxRequests = 10; // 每分钟最大请求数
  private readonly windowMs = 60 * 1000; // 1 分钟窗口

  canActivate(context: ExecutionContext): boolean {
    const client: Socket = context.switchToWs().getClient<Socket>();
    const clientId = client.id;
    const now = Date.now();

    if (!this.clients.has(clientId)) {
      this.clients.set(clientId, { count: 1, resetTime: now + this.windowMs });
      return true;
    }

    const clientData = this.clients.get(clientId);

    if (now > clientData.resetTime) {
      // 重置计数器
      clientData.count = 1;
      clientData.resetTime = now + this.windowMs;
      return true;
    }

    if (clientData.count >= this.maxRequests) {
      throw new WsException('请求过于频繁，请稍后再试');
    }

    clientData.count++;
    return true;
  }
}
```

#### 房间权限守卫

检查用户是否有权限访问特定房间：

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
export class WsRoomGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient<Socket>();
    const data = context.switchToWs().getData();
    
    const user = client.data.user;
    const roomId = data.roomId || data.room;

    if (!user) {
      throw new WsException('用户未认证');
    }

    if (!roomId) {
      throw new WsException('房间ID未指定');
    }

    // 检查用户是否有权限访问房间
    const hasAccess = await this.checkRoomAccess(user.id, roomId);
    
    if (!hasAccess) {
      throw new WsException('无权限访问该房间');
    }

    return true;
  }

  private async checkRoomAccess(userId: string, roomId: string): Promise<boolean> {
    // 实现房间访问权限逻辑
    // 例如：检查数据库中的用户-房间关系
    return true; // 简化示例
  }
}
```

#### 连接守卫

在连接建立时进行认证：

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class WsConnectionGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient<Socket>();
    
    try {
      const token = client.handshake.query.token as string;
      
      if (!token) {
        client.disconnect();
        return false;
      }

      const payload = await this.jwtService.verifyAsync(token);
      client.data.user = payload;
      
      return true;
    } catch (error) {
      client.disconnect();
      return false;
    }
  }
}
```

#### 组合守卫

创建一个组合多个检查的守卫：

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
export class WsCompositeGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient<Socket>();
    
    // 1. 检查用户认证
    if (!client.data.user) {
      throw new WsException('用户未认证');
    }

    // 2. 检查用户状态
    if (client.data.user.status !== 'active') {
      throw new WsException('用户账户已被禁用');
    }

    // 3. 检查连接数限制
    const userConnections = await this.getUserConnectionCount(client.data.user.id);
    if (userConnections >= 5) {
      throw new WsException('连接数超过限制');
    }

    // 4. 检查 IP 白名单（如果需要）
    const clientIp = client.handshake.address;
    if (!this.isIpAllowed(clientIp)) {
      throw new WsException('IP 地址不在允许列表中');
    }

    return true;
  }

  private async getUserConnectionCount(userId: string): Promise<number> {
    // 实现获取用户连接数的逻辑
    return 1; // 简化示例
  }

  private isIpAllowed(ip: string): boolean {
    // 实现 IP 白名单检查
    return true; // 简化示例
  }
}
```

#### 全局 WebSocket 守卫

设置全局 WebSocket 守卫：

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { WsJwtGuard } from './guards/ws-jwt.guard';

@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: WsJwtGuard,
    },
  ],
})
export class AppModule {}
```

#### 使用示例

完整的使用示例：

```typescript
@WebSocketGateway()
@UseGuards(WsJwtGuard) // 网关级别的守卫
export class SecureGateway {
  
  @UseGuards(WsRateLimitGuard)
  @SubscribeMessage('public-message')
  handlePublicMessage(@MessageBody() data: any) {
    return { message: '公共消息已处理' };
  }

  @UseGuards(WsRolesGuard, WsRoomGuard)
  @Roles('admin')
  @SubscribeMessage('admin-room-message')
  handleAdminRoomMessage(@MessageBody() data: any) {
    return { message: '管理员房间消息已处理' };
  }

  @UseGuards(WsCompositeGuard)
  @SubscribeMessage('secure-operation')
  handleSecureOperation(@MessageBody() data: any) {
    return { message: '安全操作已执行' };
  }
}
```

通过这些守卫，你可以为 WebSocket 应用实现完整的安全控制，包括认证、授权、速率限制和访问控制。
```
