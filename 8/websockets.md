# Websocket

## 网关

本文档中其他地方讨论的大多数概念，如依赖注入、装饰器、异常过滤器、管道、守卫和拦截器，都同样适用于网关。只要有可能，Nest将抽象实现细节，以便相同的组件可以跨基于 `http` 的平台、`WebSockets` 和微服务运行。本节将介绍 `WebSockets` 在 `Nest` 中的应用。

在 `Nest` 中，网关只是一个用 `@WebSocketGateway()` 装饰器注解的类。从技术上讲，网关与平台无关，这使得它们在创建适配器之后就可以与任何 `WebSockets` 库兼容。有两个开箱即用的WS平台:[socket.io](https://github.com/socketio/socket.io)和[ws](https://github.com/websockets/ws)。你可以选择最适合你需要的。另外，您可以按照本指南构建自己的适配器。

![](https://docs.nestjs.com/assets/Gateways_1.png)

?> 网关可以被看作是`provider`，这意味着它可以毫不费力地通过构造函数注入依赖关系。另外，网关也可以由其他类（提供者和控制器）注入。

### 安装

要开始构建基于WebSockets的应用，首先，我们需要安装所需的软件包：

```bash
$ npm i --save @nestjs/websockets @nestjs/platform-socket.io
$ npm i --save-dev @types/socket.io
```

### 概述

一般来说，除非你的应用程序不是 `Web` 应用程序，或者您已手动更改端口，否则每个网关都会在**HTTP服务器**运行时监听相同的端口。我们可以通过将参数传递给 `@WebSocketGateway(80)` 装饰器来改变这种行为，其中 `80` 是一个选定的端口号。另外，您可以使用以下构造来设置此网关使用的[命名空间](https://socket.io/docs/rooms-and-namespaces/)：

```typescript
@WebSocketGateway(80, { namespace: 'events' })
```

!> 只有将网关放入当前模块的 `providers` 数组中，网关才会实例化。

你可以在 `@WebSocketGateway()` 装饰器的第二个参数中给socket构造函数传入任何支持的选项，如下所示:

```typescript
@WebSocketGateway(81, { transports: ['websocket'] })
```

现在，网关现在正在监听，但我们目前尚未订阅收到的消息。让我们创建一个处理程序，它将订阅`events`消息并使用完全相同的数据响应用户。

>events.gateway.ts

```typescript
@SubscribeMessage('events')
handleEvent(@MessageBody() data: string): string {
  return data;
}
```

?> `@SubscribeMessage()` 和 `@MessageBody()` 装饰器是从 `@nestjs/websockets` 包中导入的。

如果你不想使用装饰器，下面的代码在功能上是等价的:

> events.gateway.ts

```typescript
@SubscribeMessage('events')
handleEvent(client: Socket, data: string): string {
  return data;
}
```

该 `handleEvent()` 函数有两个参数。第一个是特定于平台的[socket](https://socket.io/docs/server-api/#socket)实例，第二个是从客户端接收的数据。但是不建议使用此方法，因为它需要在每个单元测试中模拟 `socket` 实例。

收到消息后，我们会发送一个确认信息，其中包含某人通过网络发送的相同数据。此外，可以使用特定于库的方法发出消息，例如，通过使用 `client.emit()` 方法。 为了访问连接的 `socket` 实例，请使用 `@ConnectedSocket()` 装饰器。

> events.gateway.ts

```typescript
@SubscribeMessage('events')
handleEvent(
  @MessageBody() data: string,
  @ConnectedSocket() client: Socket,
): string {
  return data;
}
```
?> `@ConnectedSocket()` 装饰器是从 `@nestjs/websockets` 包中导入的。

但是，在这种情况下，您将无法利用拦截器。如果你不想响应用户，你可以简单地跳过 `return` 语句(或者显式地返回 'falsy' 值，例如 'undefined' )。

现在，当客户端发出的消息如下:

```typescript
socket.emit('events', { name: 'Nest' });
```

将执行 `handleEvent()` `法。此外，为了侦听从上述处理程序中发出的消息，客户端必须附加相应的侦听器：

```typescript
socket.emit('events', { name: 'Nest' }, data => console.log(data));
```

### 多个响应

确认仅发送一次。而且，原生 `WebSockets` 不支持它。要解决这个限制，可以返回一个包含两个属性的对象。发射事件的名称 `event` 和将要转发给客户端的 `data` 。

> events.gateway.ts

```typescript
@SubscribeMessage('events')
handleEvent(@MessageBody() data: unknown): WsResponse<unknown> {
  const event = 'events';
  return { event, data };
}
```
?> `WsResponse` 接口是从 `@nestjs/websockets` 包中导入的。

为了侦听传入的响应，客户端必须应用另一个事件侦听器。

```typescript
socket.on('events', data => console.log(data));
```
 
### 异步响应

消息处理程序可以同步或异步响应。因此，也支持异步方法。消息处理程序还能够返回一个 `Observable` 对象，在这种情况下，结果值将被出去，直到流完成。

> events.gateway.ts

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
上面的消息处理程序将响应3次（从`响应`数组中的每个项目按顺序）。

### 生命周期挂钩

有3个有用的生命周期钩子可用。它们都有相应的接口，如下表所示:

|                      |                                  |
| :------------------- | :------------------------------- |
|  `OnGatewayInit`    | 强制执行`afterInit()`方法。将特定于库的服务器实例作为参数|
| `OnGatewayConnection`| 强制执行`handleConnection()`方法。将特定于库的客户端 `socket` 实例作为参数。     |
| `OnGatewayDisconnect`|强制执行`handleDisconnect()`方法。将特定于库的客户端 `socket` 实例作为参数。|

?> 提示每个生命周期接口都来自 `@nestjs/websockets` 包。

### 服务器

有时，您可能希望直接访问原生的、特定于平台的服务器实例。这个对象的引用作为参数传递给 `afterInit()` 方法( `OnGatewayInit` 接口)。另一个选项是使用 `@WebSocketServer()` 装饰器。

偶尔，您可能希望直接访问原生`特定库`的服务器实例。此对象的引用作为参数传递给`afterInit()`方法（`OnGatewayInit`接口）。另一个选项是使用 `@WebSocketServer()` 装饰器。

```typescript
@WebSocketServer()
server: Server;
```

?> `@WebSocketServer()` 装饰器是从 `@nestjs/websockets` 包中导入的。

当它准备好使用时，`Nest` 会自动将服务器实例分配给该属性。

[这里](https://github.com/nestjs/nest/tree/master/sample/02-gateways)有一个可用的例子

## 异常过滤器

`websockets` 的**异常过滤器**工作原理与[HTTP异常过滤器](https://docs.nestjs.com/exception-filters)完全相同。唯一的区别是不要抛出`HttpException`，你应该抛出`WsException`。

```typescript
throw new WsException('Invalid credentials.');
```

?> 注意 `WsException` 类是从`@nestjs/websockets`包中导入的。

在上述示例中，`Nest` 会处理这个抛出的异常并使用下列结构发出`exception`消息：

```json
{
  status: 'error',
  message: 'Invalid credentials.'
}
```

### 过滤器

**Web sockets**异常过滤器行为和HTTP异常处理器也是非常类似的。下面是一个使用手动实例化的方法范围过滤器的示例。和基于HTTP应用一样，你也可以使用一个网关范围的过滤器（例如，使用`@UseFilters()`装饰器作为网关类的前缀）。


```typescript
@UseFilters(new WsExceptionFilter())
@SubscribeMessage('events')
onEvent(client, data: any): WsResponse<any> {
  const event = 'events';
  return { event, data };
}
```
### 继承

通常，您将创建完全自定义的异常过滤器，以满足您的应用程序要求。但仍然存在一些情况，你可能需要通过简单的扩展`核心异常过滤器`并基于一些特定要素覆盖其行为。

为了将异常处理委托给基本过滤器，您需要扩展 `BaseWsExceptionFilter` 并调用继承的 `catch()` 方法。

```typescript
import { Catch, ArgumentsHost } from '@nestjs/common';
import { BaseWsExceptionFilter } from '@nestjs/websockets';

@Catch()
export class AllExceptionsFilter extends BaseWsExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    super.catch(exception, host);
  }
}
```
上述应用只是用于概括性说明该方法如何使用。在您的应用中扩展的异常过滤器应该包含您的业务逻辑(例如，添加各种条件)。

## 管道

`websockets` 管道和[普通管道](https://docs.nestjs.com/pipes)没有区别。唯一应该注意的是，不要抛出 `HttpException`，而应该使用 `WsException`。此外，所有管道将仅应用于data参数（因为验证或者转换`client`实例没有用）。

?> 提示`WsException` 类在 `@socketjs/websockets`包中可用。

### 绑定管道

下面是一个使用手动实例化的方法范围管道的示例，和基于HTTP的应用一样，你可以使用网关范围管道（例如，通过在网关类前加上`@UsePipes()`装饰器）：

```typescript
@UsePipes(new ValidationPipe())
@SubscribeMessage('events')
handleEvent(client: Client, data: unknown): WsResponse<unknown> {
  const event = 'events';
  return { event, data };
}
```

## 守卫

`websockets` 和[常规守卫](https://docs.nestjs.com/guards)守卫之间没有区别，但它会抛出`WsException`（而不是`HttpException`）。

?>  `WsException` 类在 `@socketjs/websockets` 包中可用。

### 绑定守卫

下面是一个使用方法范围守卫的示例,和基于HTTP的应用一样，你可以使用网关范围的守卫（例如，通过在网关类前加上`@UseGuards()`装饰器）：

```typescript
@UseGuards(AuthGuard)
@SubscribeMessage('events')
handleEvent(client: Client, data: unknown): WsResponse<unknown> {
  const event = 'events';
  return { event, data };
}
```

## 拦截器

常规[拦截器](https://docs.nestjs.com/interceptors)和 `web sockets` **拦截器**之间没有区别。 下面是一个使用手动实例化的方法范围拦截器的示例，和基于HTTP的应用一样，你可以使用网关范围拦截器（例如，通过在网关类前加上`@UseInterceptors()`装饰器）：

```typescript
@UseInterceptors(new TransformInterceptor())
@SubscribeMessage('events')
handleEvent(client: Client, data: unknown): WsResponse<unknown> {
  const event = 'events';
  return { event, data };
}
```

## 适配器

`WebSockets` 模块与平台无关，因此，您可以通过使用 `WebSocketAdapter` 接口来创建自己的库（甚至是原生实现）。此接口强制使用下表中描述的几种方法：

|                      |                                  |
| :------------------- | :------------------------------- |
|  `create`    |将套接字实例连接到指定的端口 |
| `bindClientConnect`| 绑定客户端连接事件    |
| `bindClientDisconnect`	| 绑定客户端断开连接事件（可选）|
| `bindMessageHandlers`|将传入的消息绑定到适当的消息处理程序|
| `close` |	终止服务器实例 |

### 拓展 socket.io

[socket.io](https://github.com/socketio/socket.io) 包封装在一个 `IoAdapter` 类中。如果您想增强适配器的基本功能，该怎么办？例如，您的技术要求需要能够跨 `Web` 服务的多个负载平衡实例广播事件。为此，您可以扩展 `IoAdapter` 和覆盖单个方法，该方法的任务是实例化新的 `socket.io` 服务器。但首先，让我们安装所需的包。

```bash
$ npm i --save socket.io-redis
```

安装包后，我们可以创建一个 `RedisIoAdapter` 类。

```typescript
import { IoAdapter } from '@nestjs/platform-socket.io';
import * as redisIoAdapter from 'socket.io-redis';

const redisAdapter = redisIoAdapter({ host: 'localhost', port: 6379 });

export class RedisIoAdapter extends IoAdapter {
  createIOServer(port: number, options?: any): any {
    const server = super.createIOServer(port, options);
    server.adapter(redisAdapter);
    return server;
  }
}
```

然后，只需切换到新创建的 `Redis` 适配器。

```typescript
const app = await NestFactory.create(ApplicationModule);
app.useWebSocketAdapter(new RedisIoAdapter(app));
```

### ws 库

另一个可用的适配器 `WsAdapter` 反过来充当框架之间的代理，并集成了快速且经过全面测试的 `ws` 库。此适配器与原生浏览器 `WebSockets` 完全兼容，并且比 `socket.io` 包快得多。不幸的是，它具有明显更少的开箱即用功能。在某些情况下，您可能不一定需要它们。

为了使用 `ws`，我们首先必须安装所需的包：

```bash
$ npm i --save @nestjs/platform-ws
```

安装包后，我们可以切换适配器：

```typescript
const app = await NestFactory.create(ApplicationModule);
app.useWebSocketAdapter(new WsAdapter(app));
```

?> `WsAdapter` 是从 `@nestjs/platform-ws` 导入的。

### 高级（自定义适配器）

出于演示目的，我们将手动集成 `ws` 库。如前所述，这个库的适配器已经创建，并从 `@nestjs/platform-ws` 包中作为 `WsAdapter` 类公开。下面是简化后的实现可能的样子:

>ws-adapter.ts

```typescript
import * as WebSocket from 'ws';
import { WebSocketAdapter, INestApplicationContext } from '@nestjs/common';
import { MessageMappingProperties } from '@nestjs/websockets';
import { Observable, fromEvent, EMPTY } from 'rxjs';
import { mergeMap, filter } from 'rxjs/operators';

export class WsAdapter implements WebSocketAdapter {
  constructor(private readonly app: INestApplicationContext) {}

  create(port: number, options: any = {}): any {
    return new ws.Server({ port, ...options });
  }

  bindClientConnect(server, callback: Function) {
    server.on('connection', callback);
  }

  bindMessageHandlers(
    client: WebSocket,
    handlers: MessageMappingProperties[],
    process: (data: any) => Observable<any>,
  ) {
    fromEvent(client, 'message')
      .pipe(
        mergeMap(data => this.bindMessageHandler(data, handlers, process)),
        filter(result => result),
      )
      .subscribe(response => client.send(JSON.stringify(response)));
  }

  bindMessageHandler(
    buffer,
    handlers: MessageMappingProperties[],
    process: (data: any) => Observable<any>,
  ): Observable<any> {
    const message = JSON.parse(buffer.data);
    const messageHandler = handlers.find(
      handler => handler.message === message.event,
    );
    if (!messageHandler) {
      return EMPTY;
    }
    return process(messageHandler.callback(message.data));
  }

  close(server) {
    server.close();
  }
}
```

?> 如果要利用 `ws` 库，请使用内置` WsAdapter` 而不是创建自己的。

然后，我们可以使用 `useWebSocketAdapter()` 方法设置适配器：

>main.ts

```typescript
const app = await NestFactory.create(ApplicationModule);
app.useWebSocketAdapter(new WsAdapter(app));
```

### 示例

[这里](https://github.com/nestjs/nest/tree/master/sample/16-gateways-ws)提供了一个使用  `WsAdapter` 的工作示例。


 ### 译者署名

| 用户名 | 头像 | 职能 | 签名 |
|---|---|---|---|
| [@zuohuadong](https://www.zhihu.com/people/dongcang)  | <img class="avatar-66 rm-style" src="https://pic.downk.cc/item/5f4cafe7160a154a67c4047b.jpg">  |  翻译  | 专注于 caddy 和 nest，[@zuohuadong](https://github.com/zuohuadong/) at Github  |
[@Armor](https://github.com/Armor-cn)  | <img class="avatar-66 rm-style" height="70" src="https://avatars3.githubusercontent.com/u/31821714?s=460&v=4">  |  翻译  | 专注于 Java 和 Nest，[@Armor](https://armor.ac.cn/) |
| [@Drixn](https://drixn.com/)  | <img class="avatar-66 rm-style" src="https://cdn.drixn.com/img/src/avatar1.png">  |  翻译  | 专注于 nginx 和 C++，[@Drixn](https://drixn.com/) |
| [@weizy0219](https://github.com/weizy0219)  | <img class="avatar-66 rm-style" height="70" src="https://avatars3.githubusercontent.com/u/19883738?s=60&v=4">  |  翻译  | 专注于TypeScript全栈、物联网和Python数据科学，[@weizhiyong](https://www.weizhiyong.com) | 
