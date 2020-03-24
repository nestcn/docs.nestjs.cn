# 网关

网关是用`@WebSocketGateway（)`装饰器注解的类。默认情况下，网关使用 [socket.io](https://github.com/socketio/socket.io)包，但也提供了与广泛的其他库的兼容性，包括本地web套接字实现（[阅读更多](https://docs.nestjs.com/v5/websockets/adapter)）。

![](https://docs.nestjs.com/v5//assets/Gateways_1.png)

?> `提示`网关的行为与简单的`提供者`相同，因此它可以毫不费力地通过构造函数注入依赖关系。另外，网关也可以由其他类（提供者和控制器）注入。

### 安装

首先，我们需要安装所需的软件包：

```
$ npm i --save @nestjs/websockets
```

### 基本

一般来说，除非你的应用程序不是Web应用程序，或者您已手动更改端口，否则每个网关都会在**HTTP服务器**运行时监听相同的端口。我们可以通过将参数传递给`@WebSocketGateway（81）`装饰器来改变这种行为，其中`81`是一个选定的端口号。另外，您可以使用以下构造来设置此网关使用的[命名空间](https://socket.io/docs/rooms-and-namespaces/)：

```
@WebSocketGateway(81, { namespace: 'events' })
```

!> 警告只有将网关放入`提供`程序数组中，网关才会启动。

`命名空间`不是唯一可用的选项。您可以传递[此处](https://socket.io/docs/server-api/)提及的任何其他财产。这些属性将在实例化过程中传递给套接字构造函数。好的，网关现在正在监听，但我们目前尚未订阅收到的消息。让我们创建一个处理程序，它将订阅`事件`消息并使用完全相同的数据响应用户。

>events.gateway.ts

```typescript
@SubscribeMessage('events')
onEvent(client, data: any): WsResponse<any> {
  const event = 'events';
  return { event, data };
}
```

?> 提示`WsResponse`接口和`@SubscribeMessage（）`装饰器都从`@ nestjs / common`包中导入。

`onEvent（）`函数有2个参数。第一个是库特定的[套接字实例](https://socket.io/docs/server-api/#socket)，第二个是从客户端接收的数据。从函数返回的对象必须有2个属性。`事件`是发出事件的名称以及必须转发给客户端的`数据`。此外，可以使用特定于库的方法发送消息，例如，通过使用`client.emit（）`方法。但是，在这种情况下，您无法使用拦截器。如果你不想回应用户，只是不要返回任何东西（或明确返回“falsy”值，例如，`未定义`）。

现在，当客户端以下列方式发出消息时：

```
socket.emit('events', { name: 'Nest' });
```

`onEvent（）`方法将被执行。此外，为了侦听从上述处理程序中发出的消息，客户端必须附加相应的侦听器：

```
socket.on('events', (data) => console.log(data));
```

### 异步响应

每个消息处理程序可以是同步的或异步的（`异步`），因此您可以返回`Promise`。此外，你可以返回[RxJS](https://github.com/reactivex/rxjs) `Observable`，这意味着你可以返回多个值（它们将被发射，直到流完成）。

>events.gateway.ts

```typescript
@SubscribeMessage('events')
onEvent(client, data: any: Observable<WsResponse<number>> {
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

?>提示每个生命周期接口都来自`@ nestjs / websockets`包。

### 特定库的服务器实例

偶尔，您可能希望直接访问本地`特定库`的服务器实例。此对象的引用作为参数传递给`afterInit（）`方法（`OnGatewayInit`接口）。第二种方法是使用`@WebSocketServer（）`装饰器。

```
@WebSocketServer() server;
```

?>注意`@WebSocketServer（）`装饰器是从`@ nestjs / websockets`包中导入的。

当它准备好使用时，Nest会自动将服务器实例分配给该属性。


[这里](https://github.com/nestjs/nest/tree/master/sample/02-gateways)有一个可用的例子

## 异常过滤器

websockets的**异常处理层**工作原理与[prime](https://docs.nestjs.com/exception-filters)层完全相同。唯一的区别是不要抛出`HttpException`，你应该抛出`WsException`。

```
throw new WsException('Invalid credentials.');
```

!>注意`WsException`类是从`@ nestjs / websockets`包中导入的。


Nest会处理这个异常并用下列数据发出异常消息：

```
{
  status: 'error',
  message: 'Invalid credentials.'
}
```

### 异常过滤器

**异常过滤器**也是非常类似的，并且工作方式与主过滤器完全相同。

>ws-exception.filter.ts

```typescript
import { Catch, WsExceptionFilter } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

@Catch(WsException)
export class ExceptionFilter implements WsExceptionFilter {
  catch(exception: WsException, client) {
    client.emit('exception', {
      status: 'error',
      message: `It's a message from the exception filter`,
    });
  }
}
```

!>注意全局设置websockets异常过滤器是不可能的。

## 管道

websockets**管道**和[普通管道](https://docs.nestjs.com/pipes)没有区别。唯一应该注意的是，不要抛出`HttpException`，而应该使用`WsException`。

!>提示`WsException`类在`@socketjs / websockets`包中可用。

## 看守器

[常规看守器](https://docs.nestjs.com/guards)和websockets**看守器**之间有一个区别。websockets guard将从客户端传递的`数据`而不是expressjs请求对象作为`canActivate（）`函数的参数。此外，当警卫返回`false`时，它会抛出`WsException`（而不是`HttpException`）。

!>提示`WsException`类在`@socketjs / websockets`包中可用。

## 拦截器

[常规拦截器](https://docs.nestjs.com/interceptors)和websockets**拦截器**之间有一个区别。 Websockets拦截器将从客户端传递的`数据`而不是expressjs请求对象作为`intercept（）`函数的参数。

## 适配器

Nest websockets模块基于[socket.io](https://github.com/socketio/socket.io)，但您可以使用`WebSocketAdapter`接口来引入自己的库。该界面强制实施下表中描述的几种方法：

|                      |                                  |
| :------------------- | :------------------------------- |
|  `create`    |将套接字实例连接到指定的端口 |
| `bindClientConnect`| 绑定客户端连接    |
| `bindMessageHandlers`|将传入的消息绑定到适当的消息处理程序|

另外，还有两种可选的方法：

|                      |                                  |
| :------------------- | :------------------------------- |
| `createWithNamespace`|将套接字实例附加到指定的端口和名称空间（如果您的库支持空间） |
| `bindClientDisconnect`| 绑定客户端断开连接事件     |


出于演示目的，我们将把[ws](https://github.com/websockets/ws)库与Nest应用程序集成在一起。

>ws-adapter.ts

```typescript
import * as WebSocket from 'ws';
import { WebSocketAdapter } from '@nestjs/common';
import { MessageMappingProperties } from '@nestjs/websockets';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/empty';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/filter';

export class WsAdapter implements WebSocketAdapter {
  create(port: number) {
    return new WebSocket.Server({ port });
  }

  bindClientConnect(server, callback: (...args: any[]) => void) {
    server.on('connection', callback);
  }

  bindMessageHandlers(client: WebSocket, handlers: MessageMappingProperties[], process: (data) => Observable<any>) {
    Observable.fromEvent(client, 'message')
      .switchMap((buffer) => this.bindMessageHandler(buffer, handlers, process))
      .filter((result) => !!result)
      .subscribe((response) => client.send(JSON.stringify(response)));
  }

  bindMessageHandler(buffer, handlers: MessageMappingProperties[], process: (data) => Observable<any>): Observable<any> {
    const data = JSON.parse(buffer.data);
    const messageHandler = handlers.find((handler) => handler.message === data.type);
    if (!messageHandler) {
      return Observable.empty();
    }
    const { callback } = messageHandler;
    return process(callback(data));
  }
}
```


由于`WsAdapter`类可以使用，我们可以使用`useWebSocketAdapter（）`方法设置适配器：

>main.ts

```typescript
const app = await NestFactory.create(ApplicationModule);
app.useWebSocketAdapter(new WsAdapter());
```


现在Nest会使用我们的`WsAdapter`而不是默认的WsAdapter。

 ### 译者署名

| 用户名 | 头像 | 职能 | 签名 |
|---|---|---|---|
| [@zuohuadong](https://github.com/zuohuadong)  | <img class="avatar-66 rm-style" src="https://i.loli.net/2020/03/24/ed8yXDRGni4paQf.jpg">  |  翻译  | 专注于 caddy 和 nest，[@zuohuadong](https://github.com/zuohuadong/) at Github  |
| [@Drixn](https://drixn.com/)  | <img class="avatar-66 rm-style" src="https://cdn.drixn.com/img/src/avatar1.png">  |  翻译  | 专注于 nginx 和 C++，[@Drixn](https://drixn.com/) |
