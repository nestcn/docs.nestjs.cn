### 网关

本文档其他部分讨论的大多数概念，如依赖注入、装饰器、异常过滤器、管道、守卫和拦截器，同样适用于网关。只要可能，Nest 都会抽象实现细节，使得相同的组件可以跨基于 HTTP 的平台、WebSocket 和微服务运行。本节将介绍 Nest 中特定于 WebSocket 的方面。

在 Nest 中，网关只是一个用 `@WebSocketGateway()` 装饰器注解的类。从技术上讲，网关是与平台无关的，这使得它们在创建适配器后可以与任何 WebSocket 库兼容。目前内置支持两种 WS 平台：[socket.io](https://github.com/socketio/socket.io) 和 [ws](https://github.com/websockets/ws)。您可以选择最适合您需求的平台。此外，您也可以按照这个[指南](/websockets/adapter)构建自己的适配器。

![](/assets/Gateways_1.png)

> info **提示** 网关可以被视为[提供者](/providers) ；这意味着它们可以通过类构造函数注入依赖项。同时，网关也可以被其他类（提供者和控制器）注入。

#### 安装

要开始构建基于 WebSocket 的应用程序，首先需要安装所需的包：

```bash
$ npm i --save @nestjs/websockets @nestjs/platform-socket.io
```

#### 概述

通常情况下，每个网关都会监听与 **HTTP 服务器**相同的端口，除非您的应用程序不是 Web 应用，或者您已手动更改了端口。可以通过向 `@WebSocketGateway(80)` 装饰器传递参数来修改此默认行为，其中 `80` 是选定的端口号。您还可以使用以下结构设置网关使用的[命名空间](https://socket.io/docs/v4/namespaces/) ：

```typescript
@WebSocketGateway(80, { namespace: 'events' })
```

> warning **注意** 网关在被现有模块的 providers 数组引用之前不会被实例化。

您可以通过 `@WebSocketGateway()` 装饰器的第二个参数，向 socket 构造函数传递任何受支持的[选项](https://socket.io/docs/v4/server-options/) ，如下所示：

```typescript
@WebSocketGateway(81, { transports: ['websocket'] })
```

网关已开始监听，但尚未订阅任何传入消息。让我们创建一个处理器来订阅 `events` 消息，并用完全相同的数据向用户响应。

```typescript
@SubscribeMessage('events')
handleEvent(@MessageBody() data: string): string {
  return data;
}
```

> info **提示** `@SubscribeMessage()` 和 `@MessageBody()` 装饰器是从 `@nestjs/websockets` 包导入的。

网关创建完成后，我们可以在模块中注册它。

```typescript
import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';

@Module({
  providers: [EventsGateway]
})
export class EventsModule {}
```

您还可以在装饰器中传入属性键来从消息正文中提取它：

```typescript
@SubscribeMessage('events')
handleEvent(@MessageBody('id') id: number): number {
  // id === messageBody.id
  return id;
}
```

如果您不想使用装饰器，以下代码在功能上是等效的：

```typescript
@SubscribeMessage('events')
handleEvent(client: Socket, data: string): string {
  return data;
}
```

在上面的示例中，`handleEvent()` 函数有两个参数。第一个是平台特定的[套接字实例](https://socket.io/docs/v4/server-api/#socket) ，第二个是从客户端接收的数据。不过，不建议使用这种方法，因为它需要在每个单元测试中模拟 `socket` 实例。

一旦收到 `events` 消息，处理器就会发送一个确认，其中包含通过网络发送的相同数据。此外，还可以使用特定于库的方法发出消息，例如，使用 `client.emit()` 方法。为了访问连接的套接字实例，请使用 `@ConnectedSocket()` 装饰器。

```typescript
@SubscribeMessage('events')
handleEvent(
  @MessageBody() data: string,
  @ConnectedSocket() client: Socket,
): string {
  return data;
}
```

> info **提示** `@ConnectedSocket()` 装饰器是从 `@nestjs/websockets` 包导入的。

但是，在这种情况下，您将无法利用拦截器。如果您不想向用户回应，可以简单地跳过 `return` 语句（或明确返回"虚假"值，例如 `undefined`）。

现在当客户端发出如下消息时：

```typescript
socket.emit('events', { name: 'Nest' });
```

`handleEvent()` 方法将被执行。为了监听上述处理程序内部发出的消息，客户端必须附加相应的确认监听器：

```typescript
socket.emit('events', { name: 'Nest' }, (data) => console.log(data));
```

#### 多重响应

确认通知仅会发送一次。此外，原生 WebSockets 实现并不支持此功能。为解决这一限制，您可以返回一个包含两个属性的对象：`event` 表示触发事件的名称，`data` 则是需要转发给客户端的数据。

```typescript
@SubscribeMessage('events')
handleEvent(@MessageBody() data: unknown): WsResponse<unknown> {
  const event = 'events';
  return { event, data };
}
```

> info **提示** `WsResponse` 接口是从 `@nestjs/websockets` 包中导入的。

> warning **注意** 如果您的 `data` 字段依赖于 `ClassSerializerInterceptor`，则应返回实现 `WsResponse` 的类实例，因为该拦截器会忽略普通的 JavaScript 对象响应。

客户端需要添加另一个事件监听器才能接收传入的响应。

```typescript
socket.on('events', (data) => console.log(data));
```

#### 异步响应

消息处理器能够以**同步**或**异步**方式响应。因此，支持 `async` 方法。消息处理器还能返回一个 `Observable`，在这种情况下，结果值将持续发射直到流完成。

```typescript
@SubscribeMessage('events')
onEvent(@MessageBody() data: unknown): Observable<WsResponse<number>> {
  const event = 'events';
  const response = [1, 2, 3];

  return from(response).pipe(
    map(data => ({ event, data })),
  );
}
```

在上例中，消息处理器将**响应 3 次** （对应数组中的每个元素）。

#### 生命周期钩子

提供了 3 个实用的生命周期钩子。它们都有对应的接口，如下表所述：

<table>
  <tr>
    <td>
      <code>OnGatewayInit</code>
    </td>
    <td>
      强制实现 <code>afterInit()</code> 方法。接收特定库的服务器实例作为参数（如果需要会展开其余部分）
    </td>
  </tr>
  <tr>
    <td>
      <code>OnGatewayConnection</code>
    </td>
    <td>
      强制实现 <code>handleConnection()</code> 方法。接收特定库的客户端套接字实例作为参数
    </td>
  </tr>
  <tr>
    <td>
      <code>OnGatewayDisconnect</code>
    </td>
    <td>
      强制实现 <code>handleDisconnect()</code> 方法。接收特定库的客户端套接字实例作为参数
    </td>
  </tr>
</table>

> info **提示** 每个生命周期接口都从 `@nestjs/websockets` 包中导出。

#### 服务器与命名空间

有时您可能需要直接访问原生的**平台特定**服务器实例。该对象的引用会作为参数传递给 `afterInit()` 方法（`OnGatewayInit` 接口）。另一种方式是使用 `@WebSocketServer()` 装饰器。

```typescript
@WebSocketServer()
server: Server;
```

您还可以通过 `namespace` 属性获取对应的命名空间，如下所示：

```typescript
@WebSocketServer({ namespace: 'my-namespace' })
namespace: Namespace;
```

> warning **注意** `@WebSocketServer()` 装饰器需要从 `@nestjs/websockets` 包中导入。

一旦服务器实例准备就绪，Nest 会自动将其分配给该属性。

#### 示例

一个可用的示例在[此处](https://github.com/nestjs/nest/tree/master/sample/02-gateways)查看。
import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';

@@filename(events.module)
@Module({
  providers: [EventsGateway]
})
export class EventsModule {}
```

你也可以向装饰器传入属性键，以便从传入消息体中提取特定属性：

```typescript
@@filename(events.gateway)
@SubscribeMessage('events')
handleEvent(@MessageBody('id') id: number): number {
  // id === messageBody.id
  return id;
}
```

如果您不想使用装饰器，以下代码在功能上是等效的：

```typescript
@@filename(events.gateway)
@SubscribeMessage('events')
handleEvent(client: Socket, data: string): string {
  return data;
}
```

在上面的示例中，`handleEvent()` 函数接受两个参数。第一个是平台特定的 [socket 实例](https://socket.io/docs/v4/server-api/#socket) ，第二个是从客户端接收的数据。不过不建议采用这种方法，因为它需要在每个单元测试中模拟 `socket` 实例。

当接收到 `events` 消息时，处理程序会发送一个包含网络传输数据的确认响应。此外，还可以使用库特定的方式发送消息，例如利用 `client.emit()` 方法。要访问已连接的 socket 实例，请使用 `@ConnectedSocket()` 装饰器。

```typescript
@@filename(events.gateway)
@SubscribeMessage('events')
handleEvent(
  @MessageBody() data: string,
  @ConnectedSocket() client: Socket,
): string {
  return data;
}
```

> info **提示**`@ConnectedSocket()` 装饰器是从 `@nestjs/websockets` 包中导入的。

然而，在这种情况下，您将无法利用拦截器。若不想对用户作出响应，可直接跳过 `return` 语句（或显式返回"falsy"值，例如 `undefined`）。

现在当客户端发出如下消息时：

```typescript
socket.emit('events', { name: 'Nest' });
```

`handleEvent()` 方法将被执行。为了监听上述处理程序内部发出的消息，客户端必须附加相应的确认监听器：

```typescript
socket.emit('events', { name: 'Nest' }, (data) => console.log(data));
```

#### 多重响应

确认通知仅会发送一次。此外，原生 WebSockets 实现并不支持此功能。为解决这一限制，您可以返回一个包含两个属性的对象：`event` 表示触发事件的名称，`data` 则是需要转发给客户端的数据。

```typescript
@@filename(events.gateway)
@SubscribeMessage('events')
handleEvent(@MessageBody() data: unknown): WsResponse<unknown> {
  const event = 'events';
  return { event, data };
}
```

> info **提示** `WsResponse` 接口是从 `@nestjs/websockets` 包中导入的。

> warning **注意** 如果您的 `data` 字段依赖于 `ClassSerializerInterceptor`，则应返回实现 `WsResponse` 的类实例，因为该拦截器会忽略普通的 JavaScript 对象响应。

客户端需要添加另一个事件监听器才能接收传入的响应。

```typescript
socket.on('events', (data) => console.log(data));
```

#### 异步响应

消息处理器能够以**同步**或**异步**方式响应。因此，支持 `async` 方法。消息处理器还能返回一个 `Observable`，在这种情况下，结果值将持续发射直到流完成。

```typescript
@@filename(events.gateway)
@SubscribeMessage('events')
onEvent(@MessageBody() data: unknown): Observable<WsResponse<number>> {
  const event = 'events';
  const response = [1, 2, 3];

  return from(response).pipe(
    map(data => ({ event, data })),
  );
}
```

在上例中，消息处理器将**响应 3 次** （对应数组中的每个元素）。

#### 生命周期钩子

提供了 3 个实用的生命周期钩子。它们都有对应的接口，如下表所述：

| 钩子                    | 描述                                             |
| ----------------------- | ------------------------------------------------ |
| `OnGatewayInit`         | 强制实现 `afterInit()` 方法。接收特定库的服务器实例作为参数（如果需要会展开其余部分） |
| `OnGatewayConnection`   | 强制实现 `handleConnection()` 方法。接收特定库的客户端套接字实例作为参数 |
| `OnGatewayDisconnect`   | 强制实现 `handleDisconnect()` 方法。接收特定库的客户端套接字实例作为参数 |

> **提示** 每个生命周期接口都从 `@nestjs/websockets` 包中导出。

以下是实现这些生命周期钩子的完整示例：

```typescript
import {
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway()
export class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private logger: Logger = new Logger('EventsGateway');

  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    this.logger.log('WebSocket 服务器初始化完成');
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`客户端连接: ${client.id}`);
    // 可以在这里执行连接时的逻辑，如用户认证
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`客户端断开连接: ${client.id}`);
    // 可以在这里执行断开连接时的清理逻辑
  }
}
```

#### 服务器与命名空间

有时您可能需要直接访问原生的**平台特定**服务器实例。该对象的引用会作为参数传递给 `afterInit()` 方法（`OnGatewayInit` 接口）。另一种方式是使用 `@WebSocketServer()` 装饰器。

```typescript
@WebSocketServer()
server: Server;
```

您还可以通过 `namespace` 属性获取对应的命名空间，如下所示：

```typescript
@WebSocketServer({ namespace: 'my-namespace' })
namespace: Namespace;
```

> warning **注意** `@WebSocketServer()` 装饰器需要从 `@nestjs/websockets` 包中导入。

一旦服务器实例准备就绪，Nest 会自动将其分配给该属性。

#### 认证和授权

在 WebSocket 应用中实现认证通常需要在连接建立时验证用户身份：

```typescript
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@WebSocketGateway()
export class AuthenticatedGateway implements OnGatewayConnection {
  handleConnection(client: Socket) {
    // 从 JWT 令牌中获取用户信息
    const user = client.request.user;
    console.log('用户已连接:', user.username);
  }

  @SubscribeMessage('private-message')
  handlePrivateMessage(
    @MessageBody() data: string,
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.request.user;
    return `私人消息来自 ${user.username}: ${data}`;
  }
}
```

#### 自定义中间件

可以在网关中使用自定义中间件来处理连接：

```typescript
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Socket } from 'socket.io';

export class AuthenticatedSocketIoAdapter extends IoAdapter {
  createIOServer(port: number, options?: any): any {
    const server = super.createIOServer(port, options);
    
    server.use((socket: Socket, next) => {
      // 验证令牌
      const token = socket.handshake.auth.token;
      if (this.validateToken(token)) {
        next();
      } else {
        next(new Error('Authentication error'));
      }
    });

    return server;
  }

  private validateToken(token: string): boolean {
    // 实现令牌验证逻辑
    return token === 'valid-token';
  }
}
```

#### 错误处理

正确处理 WebSocket 错误：

```typescript
@WebSocketGateway()
export class ErrorHandlingGateway {
  @SubscribeMessage('risky-operation')
  async handleRiskyOperation(@MessageBody() data: any) {
    try {
      // 可能抛出异常的操作
      const result = await this.performRiskyOperation(data);
      return result;
    } catch (error) {
      throw new WsException({
        status: 'error',
        message: error.message,
        code: 'RISKY_OPERATION_FAILED'
      });
    }
  }

  private async performRiskyOperation(data: any) {
    // 模拟可能失败的操作
    if (Math.random() > 0.5) {
      throw new Error('操作失败');
    }
    return { success: true, data };
  }
}
```

#### 房间和命名空间管理

高级房间管理功能：

```typescript
@WebSocketGateway({ namespace: 'chat' })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userRooms = new Map<string, Set<string>>();

  handleConnection(client: Socket) {
    console.log(`客户端 ${client.id} 已连接`);
  }

  handleDisconnect(client: Socket) {
    // 清理用户的房间信息
    this.leaveAllRooms(client.id);
    console.log(`客户端 ${client.id} 已断开连接`);
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(
    @MessageBody() room: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(room);
    
    // 记录用户的房间
    if (!this.userRooms.has(client.id)) {
      this.userRooms.set(client.id, new Set());
    }
    this.userRooms.get(client.id).add(room);

    client.to(room).emit('user-joined', {
      userId: client.id,
      message: `用户 ${client.id} 加入了房间 ${room}`
    });

    return { status: 'success', room };
  }

  @SubscribeMessage('leave-room')
  handleLeaveRoom(
    @MessageBody() room: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(room);
    
    // 更新用户房间记录
    if (this.userRooms.has(client.id)) {
      this.userRooms.get(client.id).delete(room);
    }

    client.to(room).emit('user-left', {
      userId: client.id,
      message: `用户 ${client.id} 离开了房间 ${room}`
    });

    return { status: 'success', room };
  }

  @SubscribeMessage('broadcast-to-room')
  handleBroadcastToRoom(
    @MessageBody() data: { room: string; message: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.server.to(data.room).emit('room-message', {
      from: client.id,
      message: data.message,
      timestamp: new Date(),
    });
  }

  private leaveAllRooms(clientId: string) {
    if (this.userRooms.has(clientId)) {
      const rooms = this.userRooms.get(clientId);
      rooms.forEach(room => {
        this.server.to(room).emit('user-left', {
          userId: clientId,
          message: `用户 ${clientId} 离开了房间 ${room}`
        });
      });
      this.userRooms.delete(clientId);
    }
  }

  // 获取房间信息
  @SubscribeMessage('get-room-info')
  async handleGetRoomInfo(@MessageBody() room: string) {
    const sockets = await this.server.in(room).fetchSockets();
    return {
      room,
      userCount: sockets.length,
      users: sockets.map(socket => socket.id),
    };
  }
}
```

#### 性能优化

WebSocket 性能优化建议：

```typescript
@WebSocketGateway({
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  },
  transports: ['websocket'], // 仅使用 WebSocket，避免轮询
  maxHttpBufferSize: 1e6, // 限制消息大小
  pingTimeout: 60000,
  pingInterval: 25000,
})
export class OptimizedGateway {
  @WebSocketServer()
  server: Server;

  // 使用节流来限制消息频率
  @SubscribeMessage('high-frequency-event')
  @Throttle(10, 60) // 每 60 秒最多 10 次
  handleHighFrequencyEvent(@MessageBody() data: any) {
    return { received: data, timestamp: Date.now() };
  }

  // 批量处理消息
  private messageQueue: any[] = [];
  private processingTimer: NodeJS.Timeout;

  @SubscribeMessage('bulk-message')
  handleBulkMessage(@MessageBody() message: any) {
    this.messageQueue.push(message);
    
    if (!this.processingTimer) {
      this.processingTimer = setTimeout(() => {
        this.processBulkMessages();
        this.processingTimer = null;
      }, 100); // 100ms 后批量处理
    }
  }

  private processBulkMessages() {
    if (this.messageQueue.length > 0) {
      const messages = [...this.messageQueue];
      this.messageQueue = [];
      
      // 批量处理并广播
      this.server.emit('bulk-processed', {
        count: messages.length,
        processedAt: new Date(),
      });
    }
  }
}
```

#### 测试 WebSocket 网关

测试 WebSocket 网关的示例：

```typescript
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { Socket, io } from 'socket.io-client';
import { EventsGateway } from './events.gateway';

describe('EventsGateway', () => {
  let app: INestApplication;
  let gateway: EventsGateway;
  let clientSocket: Socket;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [EventsGateway],
    }).compile();

    app = moduleRef.createNestApplication();
    gateway = moduleRef.get<EventsGateway>(EventsGateway);
    
    await app.listen(3001);
    
    clientSocket = io('http://localhost:3001');
  });

  afterAll(async () => {
    clientSocket.close();
    await app.close();
  });

  it('应该处理消息事件', (done) => {
    clientSocket.emit('events', { test: 'data' });
    
    clientSocket.on('events', (data) => {
      expect(data).toEqual({ test: 'data' });
      done();
    });
  });

  it('应该处理连接', () => {
    expect(gateway.server).toBeDefined();
  });
});
```

#### 监控和调试

添加监控和调试功能：

```typescript
@WebSocketGateway()
export class MonitoredGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectionCount = 0;
  private messageCount = 0;

  afterInit(server: Server) {
    console.log('WebSocket 服务器已初始化');
    
    // 定期报告统计信息
    setInterval(() => {
      console.log(`连接数: ${this.connectionCount}, 消息数: ${this.messageCount}`);
    }, 30000);
  }

  handleConnection(client: Socket) {
    this.connectionCount++;
    console.log(`新连接: ${client.id}, 总连接数: ${this.connectionCount}`);
    
    // 发送连接统计
    this.server.emit('stats', {
      connections: this.connectionCount,
      messages: this.messageCount,
    });
  }

  handleDisconnect(client: Socket) {
    this.connectionCount--;
    console.log(`连接断开: ${client.id}, 剩余连接数: ${this.connectionCount}`);
    
    this.server.emit('stats', {
      connections: this.connectionCount,
      messages: this.messageCount,
    });
  }

  @SubscribeMessage('any-message')
  handleAnyMessage(@MessageBody() data: any) {
    this.messageCount++;
    return data;
  }

  // 健康检查端点
  @SubscribeMessage('health-check')
  handleHealthCheck() {
    return {
      status: 'healthy',
      uptime: process.uptime(),
      connections: this.connectionCount,
      messages: this.messageCount,
      memory: process.memoryUsage(),
    };
  }
}
```

#### 示例

一个可用的示例[在此处](https://github.com/nestjs/nest/tree/master/sample/02-gateways)查看。
