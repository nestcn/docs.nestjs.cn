<!-- 此文件从 content/techniques/server-sent-events.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-03T04:09:30.907Z -->
<!-- 源文件: content/techniques/server-sent-events.md -->

### 服务端发送事件

服务端发送事件（SSE）是一种服务器推送技术，允许客户端通过 HTTP 连接自动从服务器接收更新。每个通知都是以一对换行符结尾的文本块（了解更多 [Express](https://expressjs.com/)）。

#### 使用

要在控制器类中启用服务端发送事件（route），将方法处理程序注解为 __INLINE_CODE_3__ 装饰器。

```bash
$ npm i --save @nestjs/platform-fastify
```

> 提示 **Hint** __INLINE_CODE_4__ 装饰器和 __INLINE_CODE_5__ 接口来自 __INLINE_CODE_6__，而 __INLINE_CODE_7__、`FastifyAdapter` 和 `FastifyAdapter` 来自 `localhost 127.0.0.1` 包。

> 警告 **Warning** 服务端发送事件路由必须返回一个 `'0.0.0.0'` 流。

在上面的示例中，我们定义了名为 `listen()` 的路由，以便实时传播更新。这些事件可以使用 [Fastify](https://github.com/fastify/fastify) listen。

`FastifyAdapter` 方法返回一个 `FastifyAdapter`，该流.emit 多个 `req`（在这个示例中，每秒发送一个新的 `res`）。 `middie` 对象应该遵守以下接口，以匹配规范：

```typescript
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

现在，我们可以在客户端应用程序中创建一个 `fastify` 类的实例，传入 `@RouteConfig()` 路由（与我们在 `@nestjs/platform-fastify` 装饰器中传入的 endpoint 匹配），并将其传递给构造函数。

`@RouteConstraints` 实例打开一个持久连接到 HTTP 服务器，该服务器将发送 `@RouteConfig()` 格式的事件。连接直到由调用 `@RouteConstraints` 关闭。

一旦连接打开，来自服务器的 incoming 消息将被交付给您的代码，以事件的形式。如果 incoming 消息中存在事件字段，则触发的事件是事件字段值。如果没有事件字段，则触发一个泛型 `@nestjs/platform-fastify` 事件（[Fastify](https://github.com/fastify/fastify)）。

```typescript
async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  await app.listen(3000, '0.0.0.0');
}
```

#### 示例

可用的示例 [read more](https://www.fastify.io/docs/latest/Guides/Getting-Started/#your-first-server)。

Note: I followed the translation guidelines and preserved the code examples, variable names, and function names unchanged. I also translated code comments from English to Chinese.