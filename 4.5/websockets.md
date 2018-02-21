## 网关（gateway）

「网关」是一个 @WebSocketGateway() 装饰者的类。事实上，「网关」是一个封装的 socket.io 服务器实例，调整为 Nest 框架体系结构。

![](https://docs.nestjs.com/assets/Gateways_1.png)

?> 「网关」是一个组件，所以它可以通过构造函数注入依赖关系。另外，「网关」可以由另一个组件注入。


默认情况下, 每个「网关」都在侦听 HTTP 服务器正在运行的同一个端口 (除非您的应用程序不是 web 应用程序)。我们可以通过将参数传递给 @WebSocketGateway(81) 装饰器来改变这种行为。另外，你可以用下面的结构强制这个「网关」使用命名空间：:

```typescript
@WebSocketGateway({ port: 81, namespace: 'events' })
```

!> 「网关」将不会启动，直到您将其放入components数组中。


「网关」现在正在监听, 但我们还没有订阅传入消息。让我们创建一个处理程序, 它将订阅  events 消息并用完全相同的数据对用户作出响应。

> events.gateway.ts

```typescript
@SubscribeMessage('events')
onEvent(client, data): WsResponse<any> {
  const event = 'events';
  return { event, data };
}
```

!> WsResponse 接口是从 @nestjs/common 包导入的, 而 @SubscribeMessage() 是 @nestjs/websocket 的装饰器。

该 onEvent() 函数需要2个参数。第一个是[本地 socket 实例](https://socket.io/docs/server-api/#socket)本地套接字实例，第二个 data 是从客户端传递的数据。从函数返回的对象必须有2个成员。event，它是发出的事件的名称和 data。另外，还可以使用标准的 socket.io 方法可以发送消息，可以使用 client.emit() 函数，但这样就不可能使用拦截器了。如果您不想响应用户，请不要回复任何内容。

### 异步响应

每个消息处理程序都可以是异步的, 因此您可以返回 Promise。此外, 您可以返回RxJS Observable , 所有这些值都将被返回，直到「流」完成。

> events.gateway.ts

```typescript
@SubscribeMessage('events')
onEvent(client, data): Observable<WsResponse<number>> {
  const event = 'events';
  const response = [1, 2, 3];

  return Observable.from(response)
    .map((res) => ({ event, data: res }));
}
```

以上消息处理程序将响应3次 (来自 response 数组中的每个项)。

### 生命周期钩子

有3个有用的生命周期钩子。它们都具有相应的接口，并在下表中进行了描述：

|||
|----|----|
|OnGatewayInit|强制执行 afterInit() 方法。将本地 socket.io 服务器实例作为参数。
|OnGatewayConnection|强制执行 handleConnection() 方法。将本地 socket.io 服务器实例作为参数。|
|OnGatewayDisconnect|强制执行 handleDisconnect() 方法。将本地 socket.io 服务器实例作为参数。|

!> 每个生命周期在 @nestjs/websockets 软件包内都可用。

### 本地服务器实例

有时你可能想直接访问本地 socket.io 服务器实例。此对象的引用将作为参数传递给 afterInit() 方法（OnGatewayInit接口）。第二种方法是利用 @WebSocketServer() 装饰器。

```typescript
@WebSocketServer() server;
```

当它准备好使用时，Nest 会自动将服务器实例分配给该属性。

!> 该 @WebSocketServer() 装饰器需要引入 @nestjs/websockets 包。

## 异常过滤器

了解 websocket 之后异常层的工作原理与 prime 层完全相同。唯一的区别是, 不要使用 HttpException, 你应该使用 WsException。

```typescript
throw new WsException('Invalid credentials.');
```

!> 该 WsException 类需要引入 @nestjs/websockets 包。

Nest 会处理这个异常并使用 exception 发出带有以下数据的消息：

```typescript
{
  status: 'error',
  message: 'Invalid credentials.'
}
```

异常过滤器也非常相似, 其工作方式与主程序完全相同。

> WS-exception.filter.ts

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
!> 全局设置 websockets 异常过滤器是不可能的。

## 管道

websockets 管道和普通管道没有区别。你应该知道的唯一一件事情就是，不要使用 HttpException，你应该使用WsException 。

!> 使用 WsException 需要引入 @nestjs/websockets。

## 看守器

常规看守器 和 websockets 看守器 之间有一个区别。websockets dataguard 将从客户端传递而不是将 expressjs 请求对象作为 canActivate() 函数的参数。另外，当看守器返回 false 时，它会抛出 WsException（而不是HttpException）。

!> 使用 WsException 需要引入 @nestjs/websockets。

## 拦截器

常规拦截器和 websockets 拦截器 之间有一个区别。websockets 拦截器 data 将从客户端传递而不是 expressjs 请求对象作为 intercept() 函数的参数。

## 适配器

Nest websockets模块基于 socket.io，但您可以通过使用 WebSocketAdapter 接口使用自己的库。该接口强制实施下表中描述的几种方法：

|||
|----|----|
|create|将 socket 实例连接到指定的端口|
|bindClientConnect | 绑定客户端连接 |
| bindMessageHandlers | 将传入的消息绑定到适当的消息处理程序 |

另外，还有两种可选的方法： 

|||
|----|----|
|createWithNamespace | 将 socket 实例附加到指定的端口和名称空间（如果您的库支持空间） |
| bindClientDisconnect | 绑定客户端断开连接事件 |

出于演示目的，我们将把ws库与Nest应用程序集成在一起。

> WS-adapter.ts

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

由于 WsAdapter 类已准备好，我们可以使用以下 useWebSocketAdapter() 方法设置适配器：

> main.ts

```typesctipt
const app = await NestFactory.create(ApplicationModule);
app.useWebSocketAdapter(new WsAdapter());
```

现在 Nest 会使用我们的 WsAdapter 而不是默认的。
