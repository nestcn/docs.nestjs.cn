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

## 示例应用

完整的工作示例可在[这里](https://github.com/nestjs/nest/tree/master/sample/02-gateways)找到。

## 相关章节

- [网关](./gateways.md) - 网关详细介绍
- [异常过滤器](./exception-filters.md) - WebSocket 异常处理
- [管道](./pipes.md) - WebSocket 管道
- [守卫](./guards.md) - WebSocket 守卫
- [拦截器](./interceptors.md) - WebSocket 拦截器
- [适配器](./adapter.md) - 自定义适配器

通过 NestJS 的 WebSocket 支持，您可以轻松构建实时、交互式的应用程序，提供出色的用户体验。
