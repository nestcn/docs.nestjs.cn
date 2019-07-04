# 网关

网关是用`@WebSocketGateway（)`装饰器注解的类。默认情况下，网关使用 [socket.io](https://github.com/socketio/socket.io)包，但也提供了与广泛的其他库的兼容性，包括本地web套接字实现（[阅读更多](https://docs.nestjs.com/v5/websockets/adapter)）。

![](https://docs.nestjs.com/assets/Gateways_1.png)

?> `提示`网关的行为与简单的`提供者`相同，因此它可以毫不费力地通过构造函数注入依赖关系。另外，网关也可以由其他类（提供者和控制器）注入。

### 安装

首先，我们需要安装所需的软件包：

```
$ npm i --save @nestjs/websockets @nestjs/platform-socket.io
$ npm i --save-dev @types/socket.io
```

### 基本

一般来说，除非你的应用程序不是 Web 应用程序，或者您已手动更改端口，否则每个网关都会在**HTTP服务器**运行时监听相同的端口。我们可以通过将参数传递给`@WebSocketGateway（81）` 装饰器来改变这种行为，其中 `81` 是一个选定的端口号。另外，您可以使用以下构造来设置此网关使用的[命名空间](https://socket.io/docs/rooms-and-namespaces/)：

```
@WebSocketGateway(80, { namespace: 'events' })
```

!> 警告只有将网关放入`providers`程序数组中，网关才会启动。

`命名空间`不是唯一可用的选项。您可以传递[此处](https://socket.io/docs/server-api/)提及的任何其他东西。在实例化过程中，这些属性将传递给套接字构造函数。

```typescript
@WebSocketGateway(81, { transports: ['websocket'] })
```

好的，网关现在正在监听，但我们目前尚未订阅收到的消息。让我们创建一个处理程序，它将订阅`事件`消息并使用完全相同的数据响应用户。

>events.gateway.ts

```typescript
@SubscribeMessage('events')
handleEvent(client: Client, data: string): string {
  return data;
}
```

?> `@SubscribeMessage（）`装饰器从`@nestjs/websockets`包中导入。

该 handleEvent() 函数有两个参数。第一个是特定于平台的套接字实例，第二个是从客户端接收的数据。收到消息后，我们会发送一个确认信息，其中包含某人通过网络发送的相同数据。此外，可以使用特定于库的方法发出消息，例如，通过使用 client.emit() 方法。但是，在这种情况下，您无法使用拦截器。如果您不想回复用户，则不要返回任何内容（或明确返回“falsy”值，例如 undefined ）。

现在，当客户端以下列方式发出消息时：

```typescript
socket.emit('events', { name: 'Nest' });
```

`onEvent（）`方法将被执行。此外，为了侦听从上述处理程序中发出的消息，客户端必须附加相应的侦听器：

```typescript
socket.emit('events', { name: 'Nest' }, data => console.log(data));
```

### 多个回复

确认仅发送一次。此外，原生 WebSockets 不支持它。要解决此限制，您可以返回包含两个属性的对象。在 event 为所发射的事件的名称 data 具有要被转发到客户端。

> events.gateway.ts

```typescript
@SubscribeMessage('events')
handleEvent(client: Client, data: unknown): WsResponse<unknown> {
  const event = 'events';
  return { event, data };
}
```
?> WsResponse 接口需要 import @nestjs/websockets 包。

为了侦听传入的响应，客户端必须应用另一个事件侦听器。

```typescript
socket.on('events', data => console.log(data));
```
 

### 异步响应

每个消息处理程序可以是同步的或异步的（`异步`），因此您可以返回`Promise`。此外，你可以返回[RxJS](https://github.com/reactivex/rxjs) `Observable`，这意味着你可以返回多个值（它们将被发射，直到流完成）。

>events.gateway.ts

```typescript
@SubscribeMessage('events')
onEvent(client: Client, data: unknown): Observable<WsResponse<number>> {
  const event = 'events';
  const response = [1, 2, 3];

  return from(response).pipe(
    map(data => ({ event, data })),
  );
}
```
上面的消息处理程序将响应3次（从`响应`数组中的每个项目按顺序）。

### 生命周期挂钩

有3个有用的生命周期挂钩。它们都有相应的接口，并在下表中进行描述：

|                      |                                  |
| :------------------- | :------------------------------- |
|  `OnGatewayInit`    | 强制执行`afterInit（）`方法。将特定于库的服务器实例作为参数|
| `OnGatewayConnection`| 强制执行`handleConnection（）`方法。将特定于库的客户端套接字实例作为参数。     |
| `OnGatewayDisconnect`|强制执行`handleDisconnect（）`方法。将特定于库的客户端套接字实例作为参数。|

?> 提示每个生命周期接口都来自`@ nestjs / websockets`包。

### 特定库的服务器实例

偶尔，您可能希望直接访问原生`特定库`的服务器实例。此对象的引用作为参数传递给`afterInit（）`方法（`OnGatewayInit`接口）。第二种方法是使用`@WebSocketServer（）`装饰器。

```typescript
@WebSocketServer()
server: Server;
```

?> 注意`@WebSocketServer（）` 装饰器是从 `@ nestjs / websockets` 包中导入的。

当它准备好使用时，Nest会自动将服务器实例分配给该属性。


[这里](https://github.com/nestjs/nest/tree/master/sample/02-gateways)有一个可用的例子

## 异常过滤器

websockets的**异常过滤器**工作原理与[HTTP异常过滤器](https://docs.nestjs.com/exception-filters)完全相同。唯一的区别是不要抛出`HttpException`，你应该抛出`WsException`。

```typescript
throw new WsException('Invalid credentials.');
```

!> 注意`WsException` 类是从`@ nestjs / websockets`包中导入的。


Nest会处理这个异常并用下列数据发出异常消息：

```json
{
  status: 'error',
  message: 'Invalid credentials.'
}
```

### 过滤器

**自定义过滤器**也是非常类似的，并且工作方式与主过滤器完全相同。下面是一个使用手动实例化的方法范围过滤器的示例（类范围的工作原理）。


```typescript
@UseFilters(new WsExceptionFilter())
@SubscribeMessage('events')
onEvent(client, data: any): WsResponse<any> {
  const event = 'events';
  return { event, data };
}

```
### 继承

通常，您将创建完全自定义的异常过滤器，以满足您的应用程序要求。虽然您希望重用已经实现的核心异常过滤器并根据某些因素覆盖行为，但可能存在用例。

为了将异常处理委托给基本过滤器，您需要扩展 BaseWsExceptionFilter 并调用继承的 catch() 方法。

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

显然，您应该使用自己的业务逻辑增强以上实现（例如添加各种条件）。


## 管道

websockets**管道**和[普通管道](https://docs.nestjs.com/pipes)没有区别。唯一应该注意的是，不要抛出`HttpException`，而应该使用`WsException`。

?> 提示`WsException`类在`@socketjs/websockets`包中可用。

### 绑定管道

下面是一个使用手动实例化的方法范围管道的示例（类范围的工作）：

```typescript
@UsePipes(new ValidationPipe())
@SubscribeMessage('events')
handleEvent(client: Client, data: unknown): WsResponse<unknown> {
  const event = 'events';
  return { event, data };
}
```

## 守卫

[常规守卫](https://docs.nestjs.com/guards)和websockets**看守器**之间没有区别，但它会抛出`WsException`（而不是`HttpException`）。

?> 提示`WsException`类在`@socketjs / websockets`包中可用。

### 绑定守卫

下面是一个使用方法范围保护的示例（类范围的工作）：

```typescript
@UseGuards(AuthGuard)
@SubscribeMessage('events')
handleEvent(client: Client, data: unknown): WsResponse<unknown> {
  const event = 'events';
  return { event, data };
}
```

## 拦截器

[常规拦截器](https://docs.nestjs.com/interceptors)和websockets**拦截器**之间没有区别。 下面是一个使用手动实例化的方法范围拦截器的示例（类范围的工作）。

```typescript
@UseInterceptors(new TransformInterceptor())
@SubscribeMessage('events')
handleEvent(client: Client, data: unknown): WsResponse<unknown> {
  const event = 'events';
  return { event, data };
}
```


## 适配器

WebSockets模块与平台无关，因此，您可以通过使用 WebSocketAdapter 接口来创建自己的库（甚至是原声实现）。此接口强制实施下表中描述的几种方法：

|                      |                                  |
| :------------------- | :------------------------------- |
|  `create`    |将套接字实例连接到指定的端口 |
| `bindClientConnect`| 绑定客户端连接事件    |
| `bindClientDisconnect`	| 绑定客户端断开连接事件（可选）|
| `bindMessageHandlers`|将传入的消息绑定到适当的消息处理程序|
| `close` |	终止服务器实例 |

### 拓展 socket.io


所述 [socket.io](https://github.com/socketio/socket.io) 包被包装在一个 IoAdapter 类中。如果您想增强适配器的基本功能，该怎么办？例如，您的技术要求需要能够跨 Web 服务的多个负载平衡实例广播事件。为此，您可以扩展 IoAdapter 和覆盖单个方法，该方法的任务是实例化新的 socket.io 服务器。但首先，让我们安装所需的包。

```typescript
$ npm i --save socket.io-redis
```

安装包后，我们可以创建一个 `RedisIoAdapter`类。


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

然后，只需切换到新创建的 Redis 适配器。

```typescript
const app = await NestFactory.create(ApplicationModule);
app.useWebSocketAdapter(new RedisIoAdapter(app));
```

### ws 库

另一个可用的适配器 WsAdapter 反过来充当框架之间的代理，并集成了快速且经过全面测试的 ws 库。此适配器与原生浏览器 WebSockets 完全兼容，并且比socket.io 包快得多。不幸的是，它具有明显更少的开箱即用功能。在某些情况下，您可能不一定需要它们。


为了使用 ws，我们首先必须安装所需的包：

```typescript
$ npm i --save @nestjs/platform-ws
```

安装包后，我们可以切换适配器：

```typescript
const app = await NestFactory.create(ApplicationModule);
app.useWebSocketAdapter(new WsAdapter(app));
```

?> WsAdapter 需要 import @nestjs/platform-ws。

### 高级（自定义适配器）


出于演示目的，我们将手动集成 ws 库。如上所述，此库的适配器已创建，并将 @nestjs/platform-ws 作为 WsAdapter 类从包中公开。以下是简化实现的可能方式：



>ws-adapter.ts

```typescript
import * as WebSocket from 'ws';
import { WebSocketAdapter, MessageMappingProperties, INestApplicationContext } from '@nestjs/common';
import { Observable, fromEvent, empty } from 'rxjs';
import { mergeMap, filter, tap } from 'rxjs/operators';

export class WsAdapter implements WebSocketAdapter {
  constructor(private readonly app: INestApplicationContext) {}

  create(port: number, options: any = {}): any {
    return new ws.Server({ port, ...options });
  }

  bindClientConnect(server, callback: Function) {
    server.on('connection', callback);
  }
a
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
      return empty;
    }
    return process(messageHandler.callback(message.data));
  }

  close(server) {
    server.close();
  }
}
```

?> 如果要利用 ws 库，请使用内置 WsAdapter 而不是创建自己的。

然后，我们可以使用`useWebSocketAdapter（）`方法设置适配器：

>main.ts

```typescript
const app = await NestFactory.create(ApplicationModule);
app.useWebSocketAdapter(new WsAdapter(app));
```

### 示例


[这里](https://github.com/nestjs/nest/tree/master/sample/16-gateways-ws)提供了一个使用 WsAdapter 的工作示例。


 ### 译者署名

| 用户名 | 头像 | 职能 | 签名 |
|---|---|---|---|
| [@zuohuadong](https://github.com/zuohuadong)  | <img class="avatar-66 rm-style" src="https://wx3.sinaimg.cn/large/006fVPCvly1fmpnlt8sefj302d02s742.jpg">  |  翻译  | 专注于 caddy 和 nest，[@zuohuadong](https://github.com/zuohuadong/) at Github  |
| [@Drixn](https://drixn.com/)  | <img class="avatar-66 rm-style" src="https://cdn.drixn.com/img/src/avatar1.png">  |  翻译  | 专注于 nginx 和 C++，[@Drixn](https://drixn.com/) |
