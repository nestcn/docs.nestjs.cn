<!-- 此文件从 content/websockets/adapter.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-03T04:17:57.612Z -->
<!-- 源文件: content/websockets/adapter.md -->

### 适配器

WebSockets 模块是平台无关的，因此，您可以通过利用 `WebSocketAdapter` 接口引入自己的库（甚至原生实现）。此接口强制实现下表中描述的几种方法：

<table>
  <tr>
    <td><code>create</code></td>
    <td>根据传递的参数创建一个 socket 实例</td>
  </tr>
  <tr>
    <td><code>bindClientConnect</code></td>
    <td>绑定客户端连接事件</td>
  </tr>
  <tr>
    <td><code>bindClientDisconnect</code></td>
    <td>绑定客户端断开连接事件（可选*）</td>
  </tr>
  <tr>
    <td><code>bindMessageHandlers</code></td>
    <td>将传入消息绑定到相应的消息处理器</td>
  </tr>
  <tr>
    <td><code>close</code></td>
    <td>关闭服务器实例</td>
  </tr>
</table>

#### 扩展 socket.io

[socket.io](https://github.com/socketio/socket.io) 包被包装在 `IoAdapter` 类中。如果您想增强适配器的基本功能该怎么办？例如，您的技术要求需要在 Web 服务的多个负载均衡实例之间广播事件。为此，您可以扩展 `IoAdapter` 并重写一个负责实例化新 socket.io 服务器的方法。但首先，让我们安装所需的包。

> warning **警告** 要在多个负载均衡实例中使用 socket.io，您要么必须在客户端 socket.io 配置中设置 `transports: ['websocket']` 来禁用轮询，要么必须在负载均衡器中启用基于 cookie 的路由。仅靠 Redis 是不够的。有关更多信息，请参阅[此处](https://socket.io/docs/v4/using-multiple-nodes/#enabling-sticky-session)。

```bash
$ npm i --save redis socket.io @socket.io/redis-adapter
```

安装包后，我们可以创建一个 `RedisIoAdapter` 类。

```typescript
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>;

  async connectToRedis(): Promise<void> {
    const pubClient = createClient({ url: `redis://localhost:6379` });
    const subClient = pubClient.duplicate();

    await Promise.all([pubClient.connect(), subClient.connect()]);

    this.adapterConstructor = createAdapter(pubClient, subClient);
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    server.adapter(this.adapterConstructor);
    return server;
  }
}
```

之后，只需切换到您新创建的 Redis 适配器即可。

```typescript
const app = await NestFactory.create(AppModule);
const redisIoAdapter = new RedisIoAdapter(app);
await redisIoAdapter.connectToRedis();

app.useWebSocketAdapter(redisIoAdapter);
```

#### Ws 库

另一个可用的适配器是 `WsAdapter`，它反过来充当框架和集成极速且经过彻底测试的 [ws](https://github.com/websockets/ws) 库之间的代理。此适配器与原生浏览器 WebSockets 完全兼容，并且比 socket.io 包快得多。不幸的是，它在开箱即用方面的功能明显较少。但在某些情况下，您并不一定需要它们。

> info **提示** `ws` 库不支持命名空间（由于 `socket.io` 而流行的通信通道）。但是，为了以某种方式模拟此功能，您可以在不同路径上安装多个 `ws` 服务器（例如：`@WebSocketGateway({ path: '/users' })`）。

为了使用 `ws`，我们首先必须安装所需的包：

```bash
$ npm i --save @nestjs/platform-ws
```

安装包后，我们可以切换适配器：

```typescript
const app = await NestFactory.create(AppModule);
app.useWebSocketAdapter(new WsAdapter(app));
```

> info **提示** `WsAdapter` 是从 `@nestjs/platform-ws` 导入的。

`wsAdapter` 旨在处理 `{ event: string, data: any }` 格式的消息。如果您需要以不同格式接收和处理消息，则需要配置消息解析器以将其转换为此所需格式。

```typescript
const wsAdapter = new WsAdapter(app, {
  // 处理 [event, data] 格式的消息
  messageParser: (data) => {
    const [event, payload] = JSON.parse(data.toString());
    return { event, data: payload };
  },
});
```

或者，您可以在创建适配器后使用 `setMessageParser` 方法配置消息解析器。

#### 高级（自定义适配器）

为了演示目的，我们将手动集成 [ws](https://github.com/websockets/ws) 库。如前所述，此库的适配器已经创建，并作为 `WsAdapter` 类从 `@nestjs/platform-ws` 包中公开。以下是简化实现可能的样式：

```typescript
@@filename(ws-adapter)
import * as WebSocket from 'ws';
import { WebSocketAdapter, INestApplicationContext } from '@nestjs/common';
import { MessageMappingProperties } from '@nestjs/websockets';
import { Observable, fromEvent, EMPTY } from 'rxjs';
import { mergeMap, filter } from 'rxjs/operators';

export class WsAdapter implements WebSocketAdapter {
  constructor(private app: INestApplicationContext) {}

  create(port: number, options: any = {}): any {
    return new WebSocket.Server({ port, ...options });
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

> info **提示** 当您想利用 [ws](https://github.com/websockets/ws) 库时，请使用内置的 `WsAdapter` 而不是创建自己的。

然后，我们可以使用 `useWebSocketAdapter()` 方法设置自定义适配器：

```typescript
@@filename(main)
const app = await NestFactory.create(AppModule);
app.useWebSocketAdapter(new WsAdapter(app));
```

#### 示例

一个使用 `WsAdapter` 的工作示例可以在[这里](https://github.com/nestjs/nest/tree/master/sample/16-gateways-ws)查看。