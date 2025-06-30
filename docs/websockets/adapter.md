### 适配器

WebSockets 模块是平台无关的，因此你可以通过使用 `WebSocketAdapter` 接口来引入自己的库（甚至是原生实现）。该接口强制要求实现下表中描述的少数几个方法：

| 方法                    | 描述                                     |
| ----------------------- | ---------------------------------------- |
| `create`                | 根据传入的参数创建套接字实例              |
| `bindClientConnect`     | 绑定客户端连接事件                       |
| `bindClientDisconnect`  | 绑定客户端断开连接事件（可选*）           |
| `bindMessageHandlers`   | 将传入消息绑定到对应的消息处理器          |
| `close`                 | 终止服务器实例                           |

#### 扩展 socket.io

[socket.io](https://github.com/socketio/socket.io) 包被封装在 `IoAdapter` 类中。如果您想增强适配器的基础功能该怎么办？例如，您的技术要求需要具备跨多个负载均衡的 Web 服务实例广播事件的能力。为此，您可以扩展 `IoAdapter` 并重写一个负责实例化新 socket.io 服务器的方法。但首先，我们需要安装所需的包。

> warning **警告** 要在多个负载均衡实例中使用 socket.io，您要么必须在客户端 socket.io 配置中通过设置 `transports: ['websocket']` 来禁用轮询，要么必须在负载均衡器中启用基于 cookie 的路由。仅 Redis 是不够的。更多信息请参阅[此处](https://socket.io/docs/v4/using-multiple-nodes/#enabling-sticky-session) 。

```bash
$ npm i --save redis socket.io @socket.io/redis-adapter
```

安装完该包后，我们就可以创建 `RedisIoAdapter` 类了。

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

之后，只需切换到新创建的 Redis 适配器即可。

```typescript
const app = await NestFactory.create(AppModule);
const redisIoAdapter = new RedisIoAdapter(app);
await redisIoAdapter.connectToRedis();

app.useWebSocketAdapter(redisIoAdapter);
```

#### Ws 库

另一个可用的适配器是 `WsAdapter`，它充当框架与集成的极速且经过全面测试的 [ws](https://github.com/websockets/ws) 库之间的代理。该适配器完全兼容原生浏览器 WebSocket，且比 socket.io 包快得多。遗憾的是，它开箱即用的功能要少得多。不过在有些情况下，您可能并不需要这些功能。

> info： **注意** `ws` 库不支持命名空间（由 `socket.io` 推广的通信通道）。但为了模拟这一特性，您可以在不同路径上挂载多个 `ws` 服务器（示例： `@WebSocketGateway({ path: '/users' })` ）。

要使用 `ws`，我们首先需要安装这个必需的包：

```bash
$ npm i --save @nestjs/platform-ws
```

安装该包后，我们可以切换适配器：

```typescript
const app = await NestFactory.create(AppModule);
app.useWebSocketAdapter(new WsAdapter(app));
```

> **提示** `WsAdapter` 是从 `@nestjs/platform-ws` 导入的。

`wsAdapter` 设计用于处理 `{ event: string, data: any }` 格式的消息。如果需要接收和处理其他格式的消息，需配置消息解析器将其转换为所需格式。

```typescript
const wsAdapter = new WsAdapter(app, {
  // 处理 [event, data] 格式的消息
  messageParser: (data) => {
    const [event, payload] = JSON.parse(data.toString());
    return { event, data: payload };
  },
});
```

或者，您也可以在创建适配器后通过 `setMessageParser` 方法配置消息解析器：

```typescript
const wsAdapter = new WsAdapter(app);
wsAdapter.setMessageParser((data) => {
  const parsed = JSON.parse(data.toString());
  return { event: parsed.type, data: parsed.payload };
});
app.useWebSocketAdapter(wsAdapter);
```

#### ws 库的优势

使用 `ws` 库相比 `socket.io` 有以下优势：

- **性能更高**：`ws` 是原生 WebSocket 实现，性能更佳
- **更轻量**：包体积更小，依赖更少
- **浏览器兼容**：与浏览器原生 WebSocket API 完全兼容
- **更低延迟**：减少了额外的协议开销

但也有一些限制：

- **功能较少**：缺少自动重连、房间等高级功能
- **无命名空间**：不支持 `socket.io` 的命名空间特性（可通过不同路径挂载多个服务器来模拟）

```typescript
// 在不同路径挂载多个 WebSocket 服务器来模拟命名空间
@WebSocketGateway({ path: '/chat' })
export class ChatGateway {}

@WebSocketGateway({ path: '/notifications' })
export class NotificationsGateway {}
```

#### 高级选项（自定义适配器）

出于演示目的，我们将手动集成 [ws](https://github.com/websockets/ws) 库。如前所述，该库的适配器已经创建并通过 `@nestjs/platform-ws` 包的 `WsAdapter` 类公开。以下是简化后的实现可能呈现的样子：

```typescript title="ws-adapter"
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

> info **注意** 当你需要使用 [ws](https://github.com/websockets/ws) 库时，请使用内置的 `WsAdapter` 而不是自己创建。

接着，我们可以通过 `useWebSocketAdapter()` 方法设置自定义适配器：

```typescript title="main"
const app = await NestFactory.create(AppModule);
app.useWebSocketAdapter(new WsAdapter(app));
```

#### 示例

一个使用 `WsAdapter` 的工作示例可[在此处](https://github.com/nestjs/nest/tree/master/sample/16-gateways-ws)查看。
