<!-- 此文件从 content/websockets/exception-filters.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T04:52:51.122Z -->
<!-- 源文件: content/websockets/exception-filters.md -->

### 异常过滤器

HTTP 层和相应的 WebSocket 层之间唯一的区别是，在抛出 __INLINE_CODE_4__ 时，不要抛出，而是使用 __INLINE_CODE_5__。

```bash
$ npm i --save redis socket.io @socket.io/redis-adapter

```

> 信息 **提示** __INLINE_CODE_6__ 类来自 __INLINE_CODE_7__ 包。

Nest 将处理抛出的异常，并以以下结构 emit `WebSocketAdapter` 消息：

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

#### 过滤器

WebSocket 异常过滤器与 HTTP 异常过滤器行为相同。以下示例使用手动实例化的方法作用域过滤器。与 HTTP 基于应用程序相同，您也可以使用网关作用域过滤器（即在网关类前添加 `IoAdapter` 装饰器）。

```typescript
const app = await NestFactory.create(AppModule);
const redisIoAdapter = new RedisIoAdapter(app);
await redisIoAdapter.connectToRedis();

app.useWebSocketAdapter(redisIoAdapter);

```

#### 继承

通常，您将创建完全自定义的异常过滤器，以满足应用程序需求。然而，有些情况下，您可能想简单地继承 **core 异常过滤器**，并根据某些因素override 行为。

要将异常处理委派给基本过滤器，您需要扩展 `IoAdapter` 并调用继承的 `transports: ['websocket']` 方法。

```bash
$ npm i --save @nestjs/platform-ws

```

上述实现只是展示了该方法。您的扩展异常过滤器实现将包括您定制的 **业务逻辑**（例如，处理各种条件）。