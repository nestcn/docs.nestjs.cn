# WebSocket

本文档其他地方讨论的大多数概念，如依赖注入、装饰器、异常过滤器、管道、守卫和拦截器，同样适用于网关。无论在哪里，Nest 都会抽象实现细节，以便相同的组件可以在基于 HTTP 的平台、WebSocket 和微服务上运行。本节涵盖 Nest 中特定于 WebSocket 的方面。

在 Nest 中，网关只是一个用 `@WebSocketGateway()` 装饰器注释的类。从技术上讲，网关是平台无关的，这使得它们一旦创建了适配器就与任何 WebSocket 库兼容。有两个开箱即用支持的 WS 平台：[socket.io](https://github.com/socketio/socket.io) 和 [ws](https://github.com/websockets/ws)。您可以选择最适合您需求的平台。此外，您还可以按照此[指南](./adapter.md)构建自己的适配器。

![网关架构图](https://docs.nestjs.com/assets/Gateways_1.png)

> **提示** 网关可以被视为[提供者](../overview/providers.md)；这意味着它们可以通过类构造函数注入依赖项。此外，网关也可以被其他类（提供者和控制器）注入。

## 安装

要开始构建基于 WebSocket 的应用程序，首先安装所需的包：

```bash
$ npm i --save @nestjs/websockets @nestjs/platform-socket.io
```

## 主要特性

### 核心功能

- **Socket.IO 支持** - 完整的 Socket.IO 库集成
- **原生 WebSocket** - 支持原生 WebSocket 协议
- **平台无关** - 可适配不同的 WebSocket 库
- **装饰器支持** - 丰富的装饰器系统
- **生命周期钩子** - 连接管理和事件处理

### 高级功能

- **命名空间** - 逻辑分组连接
- **房间** - 动态分组用户
- **适配器** - 多实例和集群支持
- **守卫和拦截器** - WebSocket 层面的安全和拦截
- **异步响应** - 支持 Promise 和 Observable

## 快速开始

### 创建网关

创建一个基本的网关：

```typescript
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('events')
  handleEvent(@MessageBody() data: string): string {
    return data;
  }
}
```

### 注册网关

在模块中注册网关：

```typescript
import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';

@Module({
  providers: [EventsGateway]
})
export class EventsModule {}
```

### 配置选项

通过装饰器参数配置网关：

```typescript
@WebSocketGateway(80, { 
  namespace: 'events',
  transports: ['websocket']
})
export class EventsGateway {
  // 网关实现
}
```

## 消息处理

### 订阅消息

使用 `@SubscribeMessage()` 装饰器处理传入消息：

```typescript
@SubscribeMessage('events')
handleEvent(@MessageBody() data: string): string {
  return data;
}
```

### 提取消息属性

从消息体中提取特定属性：

```typescript
@SubscribeMessage('events')
handleEvent(@MessageBody('id') id: number): number {
  // id === messageBody.id
  return id;
}
```

### 访问 Socket 实例

使用 `@ConnectedSocket()` 装饰器访问 socket 实例：

```typescript
@SubscribeMessage('events')
handleEvent(
  @MessageBody() data: string,
  @ConnectedSocket() client: Socket,
): string {
  return data;
}
```

## 响应模式

### 单次响应

返回简单值作为确认响应：

```typescript
@SubscribeMessage('events')
handleEvent(@MessageBody() data: unknown): string {
  return 'received';
}
```

### 多次响应

使用 `WsResponse` 接口发送命名事件：

```typescript
import { WsResponse } from '@nestjs/websockets';

@SubscribeMessage('events')
handleEvent(@MessageBody() data: unknown): WsResponse<unknown> {
  const event = 'events';
  return { event, data };
}
```

### 异步响应

支持异步方法和 Observable：

```typescript
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@SubscribeMessage('events')
onEvent(@MessageBody() data: unknown): Observable<WsResponse<number>> {
  const event = 'events';
  const response = [1, 2, 3];

  return from(response).pipe(
    map(data => ({ event, data })),
  );
}
```

## 生命周期钩子

### 可用钩子

| 钩子 | 接口 | 描述 |
|------|------|------|
| `afterInit()` | `OnGatewayInit` | 服务器初始化后调用 |
| `handleConnection()` | `OnGatewayConnection` | 客户端连接时调用 |
| `handleDisconnect()` | `OnGatewayDisconnect` | 客户端断开连接时调用 |

### 实现示例

```typescript
import {
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';

@WebSocketGateway()
export class EventsGateway 
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  
  afterInit(server: Server) {
    console.log('WebSocket server initialized');
  }

  handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
  }
}
```

## 服务器和命名空间

### 访问服务器实例

使用 `@WebSocketServer()` 装饰器获取服务器实例：

```typescript
@WebSocketServer()
server: Server;
```

### 访问命名空间

获取特定命名空间：

```typescript
import { Namespace } from 'socket.io';

@WebSocketServer({ namespace: 'my-namespace' })
namespace: Namespace;
```

## 应用场景

### 实时聊天应用

```typescript
@WebSocketGateway()
export class ChatGateway {
  @SubscribeMessage('message')
  handleMessage(
    @MessageBody() message: string,
    @ConnectedSocket() client: Socket,
  ) {
    // 广播消息给所有客户端
    client.broadcast.emit('message', message);
    return message;
  }
}
```

### 实时通知系统

```typescript
@WebSocketGateway()
export class NotificationGateway {
  @WebSocketServer()
  server: Server;

  sendNotification(userId: string, notification: any) {
    this.server.to(userId).emit('notification', notification);
  }
}
```

### 协作应用

```typescript
@WebSocketGateway()
export class CollaborationGateway {
  @SubscribeMessage('join-room')
  handleJoinRoom(
    @MessageBody() room: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(room);
    client.to(room).emit('user-joined', client.id);
  }

  @SubscribeMessage('document-update')
  handleDocumentUpdate(
    @MessageBody() data: { room: string; changes: any },
    @ConnectedSocket() client: Socket,
  ) {
    client.to(data.room).emit('document-changed', data.changes);
  }
}
```

### 实时监控面板

```typescript
@WebSocketGateway()
export class MonitoringGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    // 每秒发送系统状态
    setInterval(() => {
      const systemStatus = this.getSystemStatus();
      server.emit('system-status', systemStatus);
    }, 1000);
  }

  private getSystemStatus() {
    // 获取系统状态数据
    return {
      cpu: Math.random() * 100,
      memory: Math.random() * 100,
      timestamp: new Date(),
    };
  }
}
```

## 最佳实践

### 1. 错误处理策略

```typescript
@WebSocketGateway()
export class RobustGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    try {
      // 连接验证逻辑
      this.validateConnection(client);
      console.log(`客户端 ${client.id} 连接成功`);
    } catch (error) {
      console.error('连接验证失败:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`客户端 ${client.id} 断开连接`);
    // 清理资源
    this.cleanup(client.id);
  }

  @SubscribeMessage('message')
  async handleMessage(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const result = await this.processMessage(data);
      return { success: true, data: result };
    } catch (error) {
      this.handleError(client, error);
      throw new WsException('消息处理失败');
    }
  }

  private validateConnection(client: Socket) {
    // 实现连接验证逻辑
  }

  private cleanup(clientId: string) {
    // 实现资源清理逻辑
  }

  private async processMessage(data: any) {
    // 实现消息处理逻辑
    return data;
  }

  private handleError(client: Socket, error: Error) {
    console.error(`客户端 ${client.id} 错误:`, error);
    client.emit('error', { message: '操作失败，请重试' });
  }
}
```

### 2. 性能优化

```typescript
@WebSocketGateway({
  transports: ['websocket'], // 仅使用 WebSocket 传输
  pingTimeout: 60000,
  pingInterval: 25000,
  maxHttpBufferSize: 1e6, // 限制消息大小
})
export class OptimizedGateway {
  private messageQueue = new Map<string, any[]>();
  private batchTimer: NodeJS.Timeout;

  @SubscribeMessage('batch-message')
  handleBatchMessage(
    @MessageBody() message: any,
    @ConnectedSocket() client: Socket,
  ) {
    // 批量处理消息以提高性能
    const clientId = client.id;
    
    if (!this.messageQueue.has(clientId)) {
      this.messageQueue.set(clientId, []);
    }
    
    this.messageQueue.get(clientId).push(message);
    
    // 延迟批量处理
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
    }
    
    this.batchTimer = setTimeout(() => {
      this.processBatchMessages();
    }, 100);
  }

  private processBatchMessages() {
    for (const [clientId, messages] of this.messageQueue.entries()) {
      if (messages.length > 0) {
        console.log(`处理客户端 ${clientId} 的 ${messages.length} 条消息`);
        // 批量处理逻辑
        messages.length = 0; // 清空队列
      }
    }
  }
}
```

### 3. 安全考虑

```typescript
import { UseGuards, UsePipes } from '@nestjs/common';
import { AuthGuard } from './guards/auth.guard';
import { ValidationPipe } from './pipes/validation.pipe';
import { RateLimitGuard } from './guards/rate-limit.guard';

@WebSocketGateway()
@UseGuards(AuthGuard, RateLimitGuard)
export class SecureGateway {
  
  @UsePipes(new ValidationPipe())
  @SubscribeMessage('secure-action')
  handleSecureAction(@MessageBody() data: SecureActionDto) {
    // 已通过认证、速率限制和数据验证的安全操作
    return { success: true };
  }

  @SubscribeMessage('admin-action')
  @UseGuards(AdminGuard)
  handleAdminAction(@MessageBody() data: any) {
    // 仅管理员可执行的操作
    return { adminAction: 'completed' };
  }
}
```

### 4. 监控和日志

```typescript
import { UseInterceptors } from '@nestjs/common';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { MetricsInterceptor } from './interceptors/metrics.interceptor';

@WebSocketGateway()
@UseInterceptors(LoggingInterceptor, MetricsInterceptor)
export class MonitoredGateway {
  
  @SubscribeMessage('tracked-event')
  handleTrackedEvent(@MessageBody() data: any) {
    // 自动记录日志和指标
    return { processed: data };
  }
}
```

## 部署注意事项

### 负载均衡

在多实例部署中，需要使用 Redis 适配器来同步 WebSocket 消息：

```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import { RedisIoAdapter } from './adapters/redis-io.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const redisIoAdapter = new RedisIoAdapter(app);
  await redisIoAdapter.connectToRedis();
  
  app.useWebSocketAdapter(redisIoAdapter);
  
  await app.listen(3000);
}
bootstrap();
```

### 健康检查

```typescript
@WebSocketGateway()
export class HealthCheckGateway {
  
  @SubscribeMessage('health')
  handleHealthCheck() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };
  }
}
```

## 测试策略

### 单元测试

```typescript
import { Test } from '@nestjs/testing';
import { EventsGateway } from './events.gateway';

describe('EventsGateway', () => {
  let gateway: EventsGateway;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [EventsGateway],
    }).compile();

    gateway = module.get<EventsGateway>(EventsGateway);
  });

  it('应该处理事件消息', () => {
    const result = gateway.handleEvent('test data', {} as any);
    expect(result).toBe('test data');
  });
});
```

### 集成测试

```typescript
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { Socket, io } from 'socket.io-client';

describe('WebSocket Integration', () => {
  let app: INestApplication;
  let client: Socket;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.listen(3001);
    
    client = io('http://localhost:3001');
  });

  afterAll(async () => {
    client.close();
    await app.close();
  });

  it('应该建立连接并接收消息', (done) => {
    client.emit('test-event', { data: 'test' });
    client.on('response', (data) => {
      expect(data).toBeDefined();
      done();
    });
  });
});
```

## 高级特性

### 自定义装饰器

创建自定义装饰器来简化 WebSocket 开发：

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Socket } from 'socket.io';

// 获取当前用户装饰器
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const client: Socket = ctx.switchToWs().getClient();
    return client.data.user;
  },
);

// 获取客户端 IP 装饰器
export const ClientIp = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const client: Socket = ctx.switchToWs().getClient();
    return client.handshake.address;
  },
);

// 获取房间信息装饰器
export const RoomInfo = createParamDecorator(
  (roomName: string, ctx: ExecutionContext) => {
    const client: Socket = ctx.switchToWs().getClient();
    const rooms = Array.from(client.rooms);
    return {
      currentRooms: rooms,
      inTargetRoom: roomName ? rooms.includes(roomName) : false,
    };
  },
);

// 使用示例
@WebSocketGateway()
export class CustomDecoratorGateway {
  
  @SubscribeMessage('user-action')
  handleUserAction(
    @MessageBody() data: any,
    @CurrentUser() user: any,
    @ClientIp() ip: string,
    @RoomInfo('general') roomInfo: any,
  ) {
    return {
      message: `用户 ${user.username} 从 ${ip} 执行操作`,
      inGeneralRoom: roomInfo.inTargetRoom,
      data,
    };
  }
}
```

### 中间件集成

与 HTTP 中间件集成，实现统一的身份验证：

```typescript
import { IoAdapter } from '@nestjs/platform-socket.io';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';

export class AuthenticatedSocketIoAdapter extends IoAdapter {
  constructor(
    app: any,
    private readonly jwtService: JwtService,
  ) {
    super(app);
  }

  createIOServer(port: number, options?: any): any {
    const server: Server = super.createIOServer(port, {
      ...options,
      cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        credentials: true,
      },
    });

    // 连接中间件
    server.use(async (socket: Socket, next) => {
      try {
        const token = this.extractTokenFromSocket(socket);
        
        if (!token) {
          throw new Error('认证令牌缺失');
        }

        const payload = await this.jwtService.verifyAsync(token);
        socket.data.user = payload;
        
        next();
      } catch (error) {
        console.error('WebSocket 认证失败:', error.message);
        next(new Error('认证失败'));
      }
    });

    return server;
  }

  private extractTokenFromSocket(socket: Socket): string | null {
    // 从查询参数获取令牌
    const tokenFromQuery = socket.handshake.query.token as string;
    if (tokenFromQuery) return tokenFromQuery;

    // 从认证头获取令牌
    const authHeader = socket.handshake.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // 从 Cookie 获取令牌
    const cookies = socket.handshake.headers.cookie;
    if (cookies) {
      const tokenMatch = cookies.match(/token=([^;]+)/);
      if (tokenMatch) return tokenMatch[1];
    }

    return null;
  }
}

// 在 main.ts 中使用
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const jwtService = app.get(JwtService);
  const authenticatedAdapter = new AuthenticatedSocketIoAdapter(app, jwtService);
  
  app.useWebSocketAdapter(authenticatedAdapter);
  
  await app.listen(3000);
}
```

### 状态管理

实现复杂的连接状态管理：

```typescript
interface ClientState {
  userId: string;
  username: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  joinedAt: Date;
  lastActivity: Date;
  rooms: Set<string>;
  metadata: Record<string, any>;
}

@Injectable()
export class ConnectionStateService {
  private clients = new Map<string, ClientState>();
  private userConnections = new Map<string, Set<string>>();

  addClient(socketId: string, user: any): void {
    const state: ClientState = {
      userId: user.id,
      username: user.username,
      status: 'online',
      joinedAt: new Date(),
      lastActivity: new Date(),
      rooms: new Set(),
      metadata: {},
    };

    this.clients.set(socketId, state);

    // 跟踪用户的多个连接
    if (!this.userConnections.has(user.id)) {
      this.userConnections.set(user.id, new Set());
    }
    this.userConnections.get(user.id).add(socketId);
  }

  removeClient(socketId: string): ClientState | null {
    const state = this.clients.get(socketId);
    if (!state) return null;

    // 清理用户连接映射
    const userConnections = this.userConnections.get(state.userId);
    if (userConnections) {
      userConnections.delete(socketId);
      if (userConnections.size === 0) {
        this.userConnections.delete(state.userId);
      }
    }

    this.clients.delete(socketId);
    return state;
  }

  updateActivity(socketId: string): void {
    const state = this.clients.get(socketId);
    if (state) {
      state.lastActivity = new Date();
    }
  }

  updateStatus(socketId: string, status: ClientState['status']): void {
    const state = this.clients.get(socketId);
    if (state) {
      state.status = status;
    }
  }

  joinRoom(socketId: string, room: string): void {
    const state = this.clients.get(socketId);
    if (state) {
      state.rooms.add(room);
    }
  }

  leaveRoom(socketId: string, room: string): void {
    const state = this.clients.get(socketId);
    if (state) {
      state.rooms.delete(room);
    }
  }

  getClientState(socketId: string): ClientState | null {
    return this.clients.get(socketId) || null;
  }

  getUserConnections(userId: string): ClientState[] {
    const connections = this.userConnections.get(userId);
    if (!connections) return [];

    return Array.from(connections)
      .map(socketId => this.clients.get(socketId))
      .filter(Boolean) as ClientState[];
  }

  getOnlineUsers(): Array<{ userId: string; username: string; status: string }> {
    const users = new Map();
    
    for (const state of this.clients.values()) {
      users.set(state.userId, {
        userId: state.userId,
        username: state.username,
        status: state.status,
      });
    }

    return Array.from(users.values());
  }

  getRoomMembers(room: string): ClientState[] {
    return Array.from(this.clients.values())
      .filter(state => state.rooms.has(room));
  }

  // 清理不活跃的连接
  cleanupInactiveConnections(maxInactiveMinutes = 30): string[] {
    const cutoff = new Date(Date.now() - maxInactiveMinutes * 60 * 1000);
    const inactiveClients: string[] = [];

    for (const [socketId, state] of this.clients.entries()) {
      if (state.lastActivity < cutoff) {
        inactiveClients.push(socketId);
        this.removeClient(socketId);
      }
    }

    return inactiveClients;
  }
}

@WebSocketGateway()
export class StateManagementGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly stateService: ConnectionStateService,
  ) {}

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    const user = client.data.user;
    if (user) {
      this.stateService.addClient(client.id, user);
      
      // 广播用户上线
      client.broadcast.emit('user_online', {
        userId: user.id,
        username: user.username,
      });

      // 发送在线用户列表
      client.emit('online_users', this.stateService.getOnlineUsers());
    }
  }

  handleDisconnect(client: Socket) {
    const state = this.stateService.removeClient(client.id);
    if (state) {
      // 检查用户是否还有其他连接
      const remainingConnections = this.stateService.getUserConnections(state.userId);
      
      if (remainingConnections.length === 0) {
        // 用户完全离线
        client.broadcast.emit('user_offline', {
          userId: state.userId,
          username: state.username,
        });
      }
    }
  }

  @SubscribeMessage('update_status')
  handleStatusUpdate(
    @MessageBody() data: { status: 'online' | 'away' | 'busy' },
    @ConnectedSocket() client: Socket,
  ) {
    this.stateService.updateStatus(client.id, data.status);
    this.stateService.updateActivity(client.id);

    const state = this.stateService.getClientState(client.id);
    if (state) {
      client.broadcast.emit('user_status_changed', {
        userId: state.userId,
        status: data.status,
      });
    }

    return { success: true };
  }
}
```

### 消息队列集成

与消息队列系统集成，实现可靠的消息传递：

```typescript
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

@Injectable()
export class WebSocketMessageService {
  constructor(
    @InjectQueue('websocket-messages') private messageQueue: Queue,
  ) {}

  async queueMessage(userId: string, message: any, priority = 0): Promise<void> {
    await this.messageQueue.add(
      'send-message',
      { userId, message },
      {
        priority,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    );
  }

  async queueBroadcast(message: any, excludeUsers: string[] = []): Promise<void> {
    await this.messageQueue.add(
      'broadcast-message',
      { message, excludeUsers },
      { priority: 1 },
    );
  }

  async queueRoomMessage(room: string, message: any): Promise<void> {
    await this.messageQueue.add(
      'room-message',
      { room, message },
      { priority: 2 },
    );
  }
}

// 消息队列处理器
import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';

@Processor('websocket-messages')
export class WebSocketMessageProcessor {
  constructor(
    private readonly stateService: ConnectionStateService,
  ) {}

  @Process('send-message')
  async handleSendMessage(job: Job<{ userId: string; message: any }>) {
    const { userId, message } = job.data;
    
    const connections = this.stateService.getUserConnections(userId);
    
    for (const connection of connections) {
      // 通过 Socket.IO 服务器发送消息
      // 这里需要访问 Socket.IO 服务器实例
      // server.to(socketId).emit('message', message);
    }
  }

  @Process('broadcast-message')
  async handleBroadcast(job: Job<{ message: any; excludeUsers: string[] }>) {
    const { message, excludeUsers } = job.data;
    // 实现广播逻辑
  }

  @Process('room-message')
  async handleRoomMessage(job: Job<{ room: string; message: any }>) {
    const { room, message } = job.data;
    // 实现房间消息逻辑
  }
}
```

### 压力测试工具

创建 WebSocket 压力测试工具：

```typescript
// test/websocket-load-test.ts
import { io, Socket } from 'socket.io-client';

interface LoadTestConfig {
  serverUrl: string;
  concurrentConnections: number;
  messagesPerConnection: number;
  messageInterval: number;
  testDuration: number;
}

class WebSocketLoadTester {
  private clients: Socket[] = [];
  private stats = {
    connected: 0,
    disconnected: 0,
    messagesSent: 0,
    messagesReceived: 0,
    errors: 0,
    startTime: 0,
    endTime: 0,
  };

  async runLoadTest(config: LoadTestConfig): Promise<void> {
    console.log(`开始压力测试: ${config.concurrentConnections} 个连接`);
    
    this.stats.startTime = Date.now();

    // 创建连接
    const connectionPromises = Array.from(
      { length: config.concurrentConnections },
      (_, index) => this.createConnection(config, index),
    );

    await Promise.all(connectionPromises);

    // 运行测试
    await this.runTest(config);

    // 清理连接
    await this.cleanup();

    this.stats.endTime = Date.now();
    this.printResults();
  }

  private async createConnection(config: LoadTestConfig, index: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const client = io(config.serverUrl, {
        transports: ['websocket'],
        query: { testClient: index },
      });

      client.on('connect', () => {
        this.stats.connected++;
        console.log(`客户端 ${index} 连接成功`);
        resolve();
      });

      client.on('disconnect', (reason) => {
        this.stats.disconnected++;
      });

      client.on('message', () => {
        this.stats.messagesReceived++;
      });

      client.on('error', (error) => {
        this.stats.errors++;
        console.error(`客户端 ${index} 错误:`, error);
      });

      client.on('connect_error', (error) => {
        this.stats.errors++;
        console.error(`客户端 ${index} 连接错误:`, error);
        reject(error);
      });

      this.clients.push(client);

      // 连接超时
      setTimeout(() => {
        if (!client.connected) {
          reject(new Error(`客户端 ${index} 连接超时`));
        }
      }, 5000);
    });
  }

  private async runTest(config: LoadTestConfig): Promise<void> {
    const messageInterval = setInterval(() => {
      this.clients.forEach(client => {
        if (client.connected) {
          client.emit('test-message', {
            clientIndex: Math.floor(Math.random() * config.concurrentConnections),
            timestamp: Date.now(),
            data: this.generateRandomString(config.messageSize),
          });
        }
      });
    }, config.messageInterval);

    // 运行指定时间
    await new Promise(resolve => setTimeout(resolve, config.testDuration));

    clearInterval(messageInterval);
  }

  private generateRandomString(size: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < size; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private async cleanup(): Promise<void> {
    const disconnectPromises = this.clients.map(client => {
      return new Promise<void>(resolve => {
        if (client.connected) {
          client.on('disconnect', () => resolve());
          client.disconnect();
        } else {
          resolve();
        }
      });
    });

    await Promise.all(disconnectPromises);
  }

  private printResults(): void {
    const duration = (this.stats.endTime - this.stats.startTime) / 1000;
    
    console.log('\n=== 压力测试结果 ===');
    console.log(`测试时长: ${duration.toFixed(2)} 秒`);
    console.log(`连接数: ${this.stats.connected}`);
    console.log(`断开连接数: ${this.stats.disconnected}`);
    console.log(`发送消息数: ${this.stats.messagesSent}`);
    console.log(`接收消息数: ${this.stats.messagesReceived}`);
    console.log(`错误数: ${this.stats.errors}`);
    console.log(`消息发送速率: ${(this.stats.messagesSent / duration).toFixed(2)} 消息/秒`);
    console.log(`消息接收速率: ${(this.stats.messagesReceived / duration).toFixed(2)} 消息/秒`);
  }
}

// 使用示例
async function runLoadTest() {
  const tester = new WebSocketLoadTester();
  
  await tester.runLoadTest({
    serverUrl: 'http://localhost:3000',
    concurrentConnections: 100,
    messagesPerConnection: 10,
    messageInterval: 100, // 100ms
    testDuration: 30000, // 30 秒
  });
}

// runLoadTest().catch(console.error);
```

## 常见用例和模式

### 消息广播模式

```typescript
@WebSocketGateway()
export class BroadcastGateway {
  @WebSocketServer()
  server: Server;

  // 1. 全局广播
  @SubscribeMessage('global-announcement')
  handleGlobalAnnouncement(@MessageBody() message: string) {
    this.server.emit('announcement', {
      message,
      timestamp: new Date(),
      type: 'global'
    });
    return { success: true };
  }

  // 2. 房间广播
  @SubscribeMessage('room-broadcast')
  handleRoomBroadcast(
    @MessageBody() data: { room: string; message: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.to(data.room).emit('room-message', {
      message: data.message,
      sender: client.id,
      timestamp: new Date(),
    });
    return { success: true };
  }

  // 3. 私人消息
  @SubscribeMessage('private-message')
  handlePrivateMessage(
    @MessageBody() data: { targetUserId: string; message: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.server.to(data.targetUserId).emit('private-message', {
      from: client.data.user.id,
      message: data.message,
      timestamp: new Date(),
    });
    return { success: true };
  }

  // 4. 条件广播
  @SubscribeMessage('conditional-broadcast')
  handleConditionalBroadcast(
    @MessageBody() data: { condition: string; message: string },
  ) {
    // 根据条件发送给特定用户群体
    this.server.fetchSockets().then(sockets => {
      sockets
        .filter(socket => this.matchesCondition(socket, data.condition))
        .forEach(socket => {
          socket.emit('conditional-message', {
            message: data.message,
            condition: data.condition,
            timestamp: new Date(),
          });
        });
    });
    return { success: true };
  }

  private matchesCondition(socket: any, condition: string): boolean {
    // 实现条件匹配逻辑
    switch (condition) {
      case 'premium':
        return socket.data.user?.isPremium === true;
      case 'admin':
        return socket.data.user?.role === 'admin';
      default:
        return true;
    }
  }
}
```

### 文件传输模式

```typescript
@WebSocketGateway()
export class FileTransferGateway {
  private fileTransfers = new Map<string, {
    chunks: Buffer[];
    totalChunks: number;
    receivedChunks: number;
    filename: string;
    fileType: string;
  }>();

  @SubscribeMessage('file-transfer-start')
  handleFileTransferStart(
    @MessageBody() data: {
      transferId: string;
      filename: string;
      fileType: string;
      totalChunks: number;
      fileSize: number;
    },
    @ConnectedSocket() client: Socket,
  ) {
    // 验证文件大小和类型
    if (data.fileSize > 10 * 1024 * 1024) { // 10MB 限制
      throw new WsException('文件大小超过限制');
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(data.fileType)) {
      throw new WsException('不支持的文件类型');
    }

    this.fileTransfers.set(data.transferId, {
      chunks: new Array(data.totalChunks),
      totalChunks: data.totalChunks,
      receivedChunks: 0,
      filename: data.filename,
      fileType: data.fileType,
    });

    client.emit('file-transfer-ready', { transferId: data.transferId });
    return { success: true };
  }

  @SubscribeMessage('file-chunk')
  handleFileChunk(
    @MessageBody() data: {
      transferId: string;
      chunkIndex: number;
      chunk: string; // Base64 编码的数据
    },
    @ConnectedSocket() client: Socket,
  ) {
    const transfer = this.fileTransfers.get(data.transferId);
    if (!transfer) {
      throw new WsException('文件传输会话不存在');
    }

    // 存储文件块
    transfer.chunks[data.chunkIndex] = Buffer.from(data.chunk, 'base64');
    transfer.receivedChunks++;

    // 发送进度更新
    const progress = (transfer.receivedChunks / transfer.totalChunks) * 100;
    client.emit('file-transfer-progress', {
      transferId: data.transferId,
      progress: Math.round(progress),
    });

    // 检查是否完成
    if (transfer.receivedChunks === transfer.totalChunks) {
      this.completeFileTransfer(data.transferId, client);
    }

    return { success: true };
  }

  private async completeFileTransfer(transferId: string, client: Socket) {
    const transfer = this.fileTransfers.get(transferId);
    if (!transfer) return;

    try {
      // 合并文件块
      const completeFile = Buffer.concat(transfer.chunks);
      
      // 保存文件（这里应该使用适当的存储服务）
      const fileUrl = await this.saveFile(completeFile, transfer.filename, transfer.fileType);
      
      client.emit('file-transfer-complete', {
        transferId,
        fileUrl,
        filename: transfer.filename,
      });

      // 清理传输数据
      this.fileTransfers.delete(transferId);
    } catch (error) {
      client.emit('file-transfer-error', {
        transferId,
        error: '文件保存失败',
      });
    }
  }

  private async saveFile(fileBuffer: Buffer, filename: string, fileType: string): Promise<string> {
    // 实现文件保存逻辑
    // 这里应该集成云存储服务如 AWS S3、阿里云 OSS 等
    const fileName = `${Date.now()}_${filename}`;
    // 假设保存到本地文件系统
    const fs = await import('fs').then(m => m.promises);
    const path = `./uploads/${fileName}`;
    await fs.writeFile(path, fileBuffer);
    return `/uploads/${fileName}`;
  }
}
```

### 游戏状态同步模式

```typescript
interface GameState {
  id: string;
  players: Map<string, PlayerState>;
  status: 'waiting' | 'playing' | 'finished';
  currentTurn?: string;
  board?: any;
  startTime?: Date;
  settings: GameSettings;
}

interface PlayerState {
  id: string;
  name: string;
  score: number;
  position: { x: number; y: number };
  status: 'online' | 'offline' | 'playing';
  lastAction?: Date;
}

interface GameSettings {
  maxPlayers: number;
  timeLimit: number;
  gameMode: string;
}

@Injectable()
export class GameStateService {
  private games = new Map<string, GameState>();
  private playerToGame = new Map<string, string>();

  createGame(gameId: string, settings: GameSettings): GameState {
    const game: GameState = {
      id: gameId,
      players: new Map(),
      status: 'waiting',
      settings,
    };
    this.games.set(gameId, game);
    return game;
  }

  joinGame(gameId: string, player: PlayerState): boolean {
    const game = this.games.get(gameId);
    if (!game || game.players.size >= game.settings.maxPlayers) {
      return false;
    }

    game.players.set(player.id, player);
    this.playerToGame.set(player.id, gameId);
    return true;
  }

  leaveGame(playerId: string): void {
    const gameId = this.playerToGame.get(playerId);
    if (gameId) {
      const game = this.games.get(gameId);
      if (game) {
        game.players.delete(playerId);
        if (game.players.size === 0) {
          this.games.delete(gameId);
        }
      }
      this.playerToGame.delete(playerId);
    }
  }

  updatePlayerState(playerId: string, updates: Partial<PlayerState>): void {
    const gameId = this.playerToGame.get(playerId);
    if (gameId) {
      const game = this.games.get(gameId);
      if (game && game.players.has(playerId)) {
        const player = game.players.get(playerId);
        Object.assign(player, updates);
      }
    }
  }

  getGame(gameId: string): GameState | null {
    return this.games.get(gameId) || null;
  }

  getPlayerGame(playerId: string): GameState | null {
    const gameId = this.playerToGame.get(playerId);
    return gameId ? this.getGame(gameId) : null;
  }
}

@WebSocketGateway()
export class GameGateway {
  constructor(private gameService: GameStateService) {}

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('create-game')
  handleCreateGame(
    @MessageBody() data: { gameId: string; settings: GameSettings },
    @ConnectedSocket() client: Socket,
  ) {
    const game = this.gameService.createGame(data.gameId, data.settings);
    client.join(data.gameId);
    
    return {
      success: true,
      gameId: data.gameId,
      game: this.serializeGame(game),
    };
  }

  @SubscribeMessage('join-game')
  handleJoinGame(
    @MessageBody() data: { gameId: string; playerName: string },
    @ConnectedSocket() client: Socket,
  ) {
    const player: PlayerState = {
      id: client.id,
      name: data.playerName,
      score: 0,
      position: { x: 0, y: 0 },
      status: 'online',
    };

    const success = this.gameService.joinGame(data.gameId, player);
    if (!success) {
      throw new WsException('无法加入游戏');
    }

    client.join(data.gameId);
    
    // 通知房间内其他玩家
    client.to(data.gameId).emit('player-joined', {
      player: this.serializePlayer(player),
    });

    const game = this.gameService.getGame(data.gameId);
    return {
      success: true,
      game: this.serializeGame(game),
    };
  }

  @SubscribeMessage('player-action')
  handlePlayerAction(
    @MessageBody() data: { action: string; payload: any },
    @ConnectedSocket() client: Socket,
  ) {
    const game = this.gameService.getPlayerGame(client.id);
    if (!game || game.status !== 'playing') {
      throw new WsException('游戏状态无效');
    }

    // 处理玩家动作
    const result = this.processPlayerAction(client.id, data.action, data.payload, game);
    
    // 更新玩家状态
    this.gameService.updatePlayerState(client.id, {
      lastAction: new Date(),
      ...result.playerUpdates,
    });

    // 广播状态更新
    this.server.to(game.id).emit('game-state-update', {
      gameId: game.id,
      updates: result.gameUpdates,
      timestamp: new Date(),
    });

    return { success: true };
  }

  @SubscribeMessage('start-game')
  handleStartGame(
    @MessageBody() data: { gameId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const game = this.gameService.getGame(data.gameId);
    if (!game || game.status !== 'waiting') {
      throw new WsException('无法开始游戏');
    }

    game.status = 'playing';
    game.startTime = new Date();
    
    // 通知所有玩家游戏开始
    this.server.to(data.gameId).emit('game-started', {
      gameId: data.gameId,
      startTime: game.startTime,
    });

    return { success: true };
  }

  handleDisconnect(client: Socket) {
    // 玩家断线处理
    const game = this.gameService.getPlayerGame(client.id);
    if (game) {
      this.gameService.updatePlayerState(client.id, { status: 'offline' });
      
      // 通知其他玩家
      client.to(game.id).emit('player-disconnected', {
        playerId: client.id,
      });

      // 如果是游戏进行中，可能需要暂停游戏
      if (game.status === 'playing') {
        this.handlePlayerDisconnectDuringGame(game, client.id);
      }
    }
  }

  private processPlayerAction(playerId: string, action: string, payload: any, game: GameState): {
    playerUpdates: Partial<PlayerState>;
    gameUpdates: any;
  } {
    // 根据游戏类型和动作处理逻辑
    switch (action) {
      case 'move':
        return this.handleMoveAction(playerId, payload, game);
      case 'attack':
        return this.handleAttackAction(playerId, payload, game);
      case 'use-item':
        return this.handleUseItemAction(playerId, payload, game);
      default:
        throw new WsException('无效的游戏动作');
    }
  }

  private handleMoveAction(playerId: string, payload: { x: number; y: number }, game: GameState) {
    return {
      playerUpdates: {
        position: payload,
      },
      gameUpdates: {
        type: 'player-moved',
        playerId,
        newPosition: payload,
      },
    };
  }

  private handleAttackAction(playerId: string, payload: { targetId: string }, game: GameState) {
    const target = game.players.get(payload.targetId);
    if (!target) {
      throw new WsException('目标玩家不存在');
    }

    // 计算伤害等游戏逻辑
    const damage = Math.floor(Math.random() * 20) + 10;
    
    return {
      playerUpdates: {},
      gameUpdates: {
        type: 'attack',
        attackerId: playerId,
        targetId: payload.targetId,
        damage,
      },
    };
  }

  private handleUseItemAction(playerId: string, payload: { itemId: string }, game: GameState) {
    // 实现物品使用逻辑
    return {
      playerUpdates: {},
      gameUpdates: {
        type: 'item-used',
        playerId,
        itemId: payload.itemId,
      },
    };
  }

  private handlePlayerDisconnectDuringGame(game: GameState, playerId: string) {
    // 实现断线重连或替换机制
    setTimeout(() => {
      const player = game.players.get(playerId);
      if (player && player.status === 'offline') {
        // 如果玩家在规定时间内没有重连，移除玩家
        this.gameService.leaveGame(playerId);
        this.server.to(game.id).emit('player-removed', { playerId });
      }
    }, 30000); // 30秒重连时间
  }

  private serializeGame(game: GameState): any {
    return {
      id: game.id,
      players: Array.from(game.players.values()),
      status: game.status,
      currentTurn: game.currentTurn,
      startTime: game.startTime,
      settings: game.settings,
    };
  }

  private serializePlayer(player: PlayerState): any {
    return {
      id: player.id,
      name: player.name,
      score: player.score,
      position: player.position,
      status: player.status,
    };
  }
}
```

## 性能基准测试

### WebSocket 性能测试工具

```typescript
// benchmark/websocket-benchmark.ts
import { io, Socket } from 'socket.io-client';
import { performance } from 'perf_hooks';

interface BenchmarkConfig {
  serverUrl: string;
  concurrentConnections: number;
  messagesPerConnection: number;
  messageSize: number;
  testDuration: number;
  warmupTime: number;
}

interface BenchmarkResult {
  totalConnections: number;
  successfulConnections: number;
  failedConnections: number;
  totalMessages: number;
  messagesPerSecond: number;
  averageLatency: number;
  p95Latency: number;
  p99Latency: number;
  errors: number;
  duration: number;
  memoryUsage: {
    initial: number;
    peak: number;
    final: number;
  };
}

export class WebSocketBenchmark {
  private clients: Socket[] = [];
  private latencies: number[] = [];
  private messageCount = 0;
  private errorCount = 0;
  private startTime = 0;
  private memoryStats = {
    initial: 0,
    peak: 0,
    final: 0,
  };

  async runBenchmark(config: BenchmarkConfig): Promise<BenchmarkResult> {
    console.log('开始 WebSocket 性能基准测试...');
    console.log(`配置: ${config.concurrentConnections} 连接, ${config.messagesPerConnection} 消息/连接`);

    this.memoryStats.initial = process.memoryUsage().heapUsed;
    
    // 创建连接
    await this.createConnections(config);
    
    // 预热
    if (config.warmupTime > 0) {
      console.log(`预热 ${config.warmupTime}ms...`);
      await this.warmup(config.warmupTime);
    }

    // 运行基准测试
    this.startTime = performance.now();
    await this.runTest(config);
    const duration = performance.now() - this.startTime;

    // 清理连接
    await this.cleanup();

    this.stats.endTime = Date.now();
    this.memoryStats.final = process.memoryUsage().heapUsed;

    return this.generateReport(config, duration);
  }

  private async createConnections(config: BenchmarkConfig): Promise<void> {
    console.log('创建连接...');
    
    const connectionPromises = Array.from(
      { length: config.concurrentConnections },
      (_, index) => this.createConnection(config.serverUrl, index),
    );

    const results = await Promise.allSettled(connectionPromises);
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.length - successful;
    
    console.log(`连接创建完成: ${successful} 成功, ${failed} 失败`);
  }

  private createConnection(url: string, index: number): Promise<Socket> {
    return new Promise((resolve, reject) => {
      const client = io(url, {
        transports: ['websocket'],
        forceNew: true,
      });

      const timeout = setTimeout(() => {
        reject(new Error(`连接 ${index} 超时`));
      }, 5000);

      client.on('connect', () => {
        clearTimeout(timeout);
        this.clients.push(client);
        resolve(client);
      });

      client.on('connect_error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });

      client.on('error', () => {
        this.errorCount++;
      });

      client.on('pong', (startTime: number) => {
        const latency = performance.now() - startTime;
        this.latencies.push(latency);
      });
    });
  }

  private async warmup(duration: number): Promise<void> {
    const startTime = performance.now();
    
    while (performance.now() - startTime < duration) {
      // 发送少量消息进行预热
      const randomClients = this.clients
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.min(10, this.clients.length));
      
      randomClients.forEach(client => {
        if (client.connected) {
          client.emit('ping', performance.now());
        }
      });

      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  private async runTest(config: BenchmarkConfig): Promise<void> {
    console.log('开始性能测试...');
    
    const messageInterval = setInterval(() => {
      this.clients.forEach(client => {
        if (client.connected && this.messageCount < config.concurrentConnections * config.messagesPerConnection) {
          const message = this.generateMessage(config.messageSize);
          const startTime = performance.now();
          
          client.emit('benchmark-message', {
            data: message,
            timestamp: startTime,
          });
          
          this.messageCount++;
          
          // 监控内存使用
          const currentMemory = process.memoryUsage().heapUsed;
          if (currentMemory > this.memoryStats.peak) {
            this.memoryStats.peak = currentMemory;
          }
        }
      });
    }, 10); // 每10ms发送一批消息

    // 等待测试完成
    while (this.messageCount < config.concurrentConnections * config.messagesPerConnection) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    clearInterval(messageInterval);
    
    // 等待所有响应
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  private generateMessage(size: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < size; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private async cleanup(): Promise<void> {
    const disconnectPromises = this.clients.map(client => {
      return new Promise<void>(resolve => {
        if (client.connected) {
          client.on('disconnect', () => resolve());
          client.disconnect();
        } else {
          resolve();
        }
      });
    });

    await Promise.all(disconnectPromises);
  }

  private generateReport(config: BenchmarkConfig, duration: number): BenchmarkResult {
    const sortedLatencies = this.latencies.sort((a, b) => a - b);
    
    return {
      totalConnections: config.concurrentConnections,
      successfulConnections: this.clients.length,
      failedConnections: config.concurrentConnections - this.clients.length,
      totalMessages: this.messageCount,
      messagesPerSecond: Math.round(this.messageCount / (duration / 1000)),
      averageLatency: this.calculateAverage(this.latencies),
      p95Latency: this.calculatePercentile(sortedLatencies, 95),
      p99Latency: this.calculatePercentile(sortedLatencies, 99),
      errors: this.errorCount,
      duration: Math.round(duration),
      memoryUsage: {
        initial: Math.round(this.memoryStats.initial / 1024 / 1024),
        peak: Math.round(this.memoryStats.peak / 1024 / 1024),
        final: Math.round(this.memoryStats.final / 1024 / 1024),
      },
    };
  }

  private calculateAverage(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return Math.round(numbers.reduce((sum, num) => sum + num, 0) / numbers.length * 100) / 100;
  }

  private calculatePercentile(sortedNumbers: number[], percentile: number): number {
    if (sortedNumbers.length === 0) return 0;
    const index = Math.ceil((percentile / 100) * sortedNumbers.length) - 1;
    return Math.round(sortedNumbers[index] * 100) / 100;
  }
}

// 使用示例
async function runBenchmarkSuite() {
  const benchmark = new WebSocketBenchmark();
  
  const configs: BenchmarkConfig[] = [
    {
      serverUrl: 'http://localhost:3001',
      concurrentConnections: 100,
      messagesPerConnection: 100,
      messageSize: 100,
      testDuration: 30000,
      warmupTime: 5000,
    },
    {
      serverUrl: 'http://localhost:3001',
      concurrentConnections: 500,
      messagesPerConnection: 50,
      messageSize: 1000,
      testDuration: 60000,
      warmupTime: 10000,
    },
    {
      serverUrl: 'http://localhost:3001',
      concurrentConnections: 1000,
      messagesPerConnection: 20,
      messageSize: 500,
      testDuration: 45000,
      warmupTime: 15000,
    },
  ];

  for (const config of configs) {
    console.log(`\n=== 基准测试 ${config.concurrentConnections} 连接 ===`);
    
    try {
      const result = await benchmark.runBenchmark(config);
      
      console.log('测试结果:');
      console.log(`- 总连接数: ${result.totalConnections}`);
      console.log(`- 成功连接: ${result.successfulConnections}`);
      console.log(`- 失败连接: ${result.failedConnections}`);
      console.log(`- 总消息数: ${result.totalMessages}`);
      console.log(`- 消息/秒: ${result.messagesPerSecond}`);
      console.log(`- 平均延迟: ${result.averageLatency}ms`);
      console.log(`- P95 延迟: ${result.p95Latency}ms`);
      console.log(`- P99 延迟: ${result.p99Latency}ms`);
      console.log(`- 错误数: ${result.errors}`);
      console.log(`- 测试时长: ${result.duration}ms`);
      console.log(`- 内存使用: ${result.memoryUsage.initial}MB -> ${result.memoryUsage.peak}MB -> ${result.memoryUsage.final}MB`);
      
    } catch (error) {
      console.error(`基准测试失败:`, error);
    }
    
    // 测试间隔
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
}

// runBenchmarkSuite().catch(console.error);
```
