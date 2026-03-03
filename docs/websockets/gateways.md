<!-- 此文件从 content/websockets/gateways.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-03T04:17:57.612Z -->
<!-- 源文件: content/websockets/gateways.md -->

### 网关

本文档其他地方讨论的大多数概念，如依赖注入、装饰器、异常过滤器、管道、守卫和拦截器，也同样适用于网关。只要可能，Nest 就会抽象实现细节，以便相同的组件可以运行在基于 HTTP 的平台、WebSockets 和微服务上。本节涵盖了 Nest 中特定于 WebSockets 的方面。

在 Nest 中，网关只是一个使用 `@WebSocketGateway()` 装饰器注释的类。从技术上讲，网关是平台无关的，这使得它们在创建适配器后与任何 WebSockets 库兼容。开箱即用支持两个 WS 平台：[socket.io](https://github.com/socketio/socket.io) 和 [ws](https://github.com/websockets/ws)。您可以选择最适合您需求的一个。此外，您还可以按照此 [指南](/websockets/adapter) 构建自己的适配器。

<figure><img class="illustrative-image" src="/assets/Gateways_1.png" /></figure>

> info **提示** 网关可以被视为 [提供者](/providers)；这意味着它们可以通过类构造函数注入依赖项。此外，网关也可以被其他类（提供者和控制器）注入。

#### 安装

要开始构建基于 WebSockets 的应用程序，首先安装所需的包：

```bash
@@filename()
$ npm i --save @nestjs/websockets @nestjs/platform-socket.io
@@switch
$ npm i --save @nestjs/websockets @nestjs/platform-socket.io
```

#### 概述

通常，每个网关都在与 **HTTP 服务器** 相同的端口上监听，除非您的应用程序不是 Web 应用程序，或者您手动更改了端口。可以通过向 `@WebSocketGateway(80)` 装饰器传递一个参数来修改此默认行为，其中 `80` 是选定的端口号。您还可以使用以下构造设置网关使用的 [命名空间](https://socket.io/docs/v4/namespaces/)：

```typescript
@WebSocketGateway(80, { namespace: 'events' })
```

> warning **警告** 在现有模块的 providers 数组中引用网关之前，它们不会被实例化。

您可以通过 `@WebSocketGateway()` 装饰器的第二个参数将任何受支持的 [选项](https://socket.io/docs/v4/server-options/) 传递给 socket 构造函数，如下所示：

```typescript
@WebSocketGateway(81, { transports: ['websocket'] })
```

网关现在正在监听，但我们尚未订阅任何传入消息。让我们创建一个处理器，它将订阅 `events` 消息并使用完全相同的数据响应用户。

```typescript
@@filename(events.gateway)
@SubscribeMessage('events')
handleEvent(@MessageBody() data: string): string {
  return data;
}
@@switch
@Bind(MessageBody())
@SubscribeMessage('events')
handleEvent(data) {
  return data;
}
```

> info **提示** `@SubscribeMessage()` 和 `@MessageBody()` 装饰器是从 `@nestjs/websockets` 包中导入的。

一旦创建了网关，我们就可以在我们的模块中注册它。

```typescript
import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';

@@filename(events.module)
@Module({
  providers: [EventsGateway]
})
export class EventsModule {}
```

您还可以将属性键传递给装饰器以从传入消息正文中提取它：

```typescript
@@filename(events.gateway)
@SubscribeMessage('events')
handleEvent(@MessageBody('id') id: number): number {
  // id === messageBody.id
  return id;
}
@@switch
@Bind(MessageBody('id'))
@SubscribeMessage('events')
handleEvent(id) {
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
@@switch
@SubscribeMessage('events')
handleEvent(client, data) {
  return data;
}
```

在上面的示例中，`handleEvent()` 函数有两个参数。第一个是平台特定的 [socket 实例](https://socket.io/docs/v4/server-api/#socket)，而第二个是从客户端接收的数据。但不推荐这种方法，因为它需要在每个单元测试中模拟 `socket` 实例。

一旦接收到 `events` 消息，处理器就会发送一个包含在网络上发送的相同数据的确认。此外，可以使用库特定的方法发射消息，例如，利用 `client.emit()` 方法。为了访问连接的 socket 实例，使用 `@ConnectedSocket()` 装饰器。

```typescript
@@filename(events.gateway)
@SubscribeMessage('events')
handleEvent(
  @MessageBody() data: string,
  @ConnectedSocket() client: Socket,
): string {
  return data;
}
@@switch
@Bind(MessageBody(), ConnectedSocket())
@SubscribeMessage('events')
handleEvent(data, client) {
  return data;
}
```

> info **提示** `@ConnectedSocket()` 装饰器是从 `@nestjs/websockets` 包中导入的。

但是，在这种情况下，您将无法利用拦截器。如果您不想响应用户，只需跳过 `return` 语句（或显式返回一个“假”值，例如 `undefined`）。

现在，当客户端按如下方式发射消息时：

```typescript
socket.emit('events', { name: 'Nest' });
```

`handleEvent()` 方法将被执行。为了监听从上述处理器内部发射的消息，客户端必须附加一个相应的确认监听器：

```typescript
socket.emit('events', { name: 'Nest' }, (data) => console.log(data));
```

虽然从消息处理器返回值本质上会发送确认，但高级场景通常需要直接控制确认回调。

`@Ack()` 参数装饰器允许将 `ack` 回调函数直接注入消息处理器。
如果不使用装饰器，此回调将作为方法的第三个参数传递。

```typescript
@@filename(events.gateway)
@SubscribeMessage('events')
handleEvent(
  @MessageBody() data: string,
  @Ack() ack: (response: { status: string; data: string }) => void,
) {
  ack({ status: 'received', data });
}
@@switch
@Bind(MessageBody(), Ack())
@SubscribeMessage('events')
handleEvent(data, ack) {
  ack({ status: 'received', data });
}
```

#### 多个响应

确认仅调度一次。此外，原生 WebSockets 实现不支持它。为了解决此限制，您可以返回一个由两个属性组成的对象。`event` 是发射的事件名称，`data` 是必须转发给客户端的数据。

```typescript
@@filename(events.gateway)
@SubscribeMessage('events')
handleEvent(@MessageBody() data: unknown): WsResponse<unknown> {
  const event = 'events';
  return { event, data };
}
@@switch
@Bind(MessageBody())
@SubscribeMessage('events')
handleEvent(data) {
  const event = 'events';
  return { event, data };
}
```

> info **提示** `WsResponse` 接口是从 `@nestjs/websockets` 包中导入的。

> warning **警告** 如果您的 `data` 字段依赖于 `ClassSerializerInterceptor`，则应该返回一个实现 `WsResponse` 的类实例，因为它会忽略纯 JavaScript 对象响应。

为了监听传入的响应，客户端必须应用另一个事件监听器。

```typescript
socket.on('events', (data) => console.log(data));
```

#### 异步响应

消息处理器能够以同步或 **异步** 方式响应。因此，支持 `async` 方法。消息处理器还能够返回一个 `Observable`，在这种情况下，结果值将被发射直到流完成。

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
@@switch
@Bind(MessageBody())
@SubscribeMessage('events')
onEvent(data) {
  const event = 'events';
  const response = [1, 2, 3];

  return from(response).pipe(
    map(data => ({ event, data })),
  );
}
```

在上面的示例中，消息处理器将响应 **3 次**（数组中的每个项目对应一次）。

#### 生命周期钩子

有 3 个有用的生命周期钩子可用。它们都有相应的接口，并在下表中进行了描述：

<table>
  <tr>
    <td>
      <code>OnGatewayInit</code>
    </td>
    <td>
      强制实现 <code>afterInit()</code> 方法。将库特定的服务器实例作为参数（如果需要，还会展开其余部分）。
    </td>
  </tr>
  <tr>
    <td>
      <code>OnGatewayConnection</code>
    </td>
    <td>
      强制实现 <code>handleConnection()</code> 方法。将库特定的客户端 socket 实例作为参数。
    </td>
  </tr>
  <tr>
    <td>
      <code>OnGatewayDisconnect</code>
    </td>
    <td>
      强制实现 <code>handleDisconnect()</code> 方法。将库特定的客户端 socket 实例作为参数。
    </td>
  </tr>
</table>

> info **提示** 每个生命周期接口均从 `@nestjs/websockets` 包中公开。

#### 服务器和命名空间

有时，您可能希望直接访问原生的、**平台特定** 的服务器实例。对此对象的引用作为参数传递给 `afterInit()` 方法（`OnGatewayInit` 接口）。另一种选择是使用 `@WebSocketServer()` 装饰器。

```typescript
@WebSocketServer()
server: Server;
```

此外，您可以使用 `namespace` 属性检索相应的命名空间，如下所示：

```typescript
@WebSocketGateway({ namespace: 'my-namespace' })
export class EventsGateway {
  @WebSocketServer()
  namespace: Namespace;
}
```

`@WebSocketServer()` 装饰器通过引用 `@WebSocketGateway()` 装饰器存储的元数据来注入服务器实例。如果您为 `@WebSocketGateway()` 装饰器提供了命名空间选项，则 `@WebSocketServer()` 装饰器将返回 `Namespace` 实例而不是 `Server` 实例。

> warning **注意** `@WebSocketServer()` 装饰器是从 `@nestjs/websockets` 包中导入的。

一旦服务器实例准备就绪，Nest 将自动将其分配给此属性。

<app-banner-enterprise></app-banner-enterprise>

#### 示例

一个工作的例子可以在[这里](https://github.com/nestjs/nest/tree/master/sample/02-gateways)查看。