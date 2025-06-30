### 性能（Fastify）

默认情况下，Nest 使用 [Express](https://expressjs.com/) 框架。如前所述，Nest 也兼容其他库，例如 [Fastify](https://github.com/fastify/fastify)。Nest 通过实现框架适配器来达成这种框架无关性，该适配器的主要功能是将中间件和处理器代理到相应库的特定实现。

> info **注意** 要实现框架适配器，目标库必须提供与 Express 类似的请求/响应管道处理机制。

[Fastify](https://github.com/fastify/fastify) 是 Nest 的绝佳替代框架，因为它以类似 Express 的方式解决设计问题。但 fastify 比 Express **快得多** ，基准测试结果几乎快两倍。一个合理的问题是：为什么 Nest 默认使用 Express 作为 HTTP 提供者？原因是 Express 使用广泛、知名度高，并拥有大量兼容中间件，这些都可以被 Nest 用户直接使用。

但由于 Nest 提供了框架无关性，您可以轻松在不同框架间迁移。当您非常注重极高性能时，Fastify 可能是更好的选择。要使用 Fastify，只需如本章所示选择内置的 `FastifyAdapter` 即可。

#### 安装

首先，我们需要安装所需的包：

```bash
$ npm i --save @nestjs/platform-fastify
```

#### 适配器

安装 Fastify 平台后，我们就可以使用 `FastifyAdapter` 了。

```typescript title="main"
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

默认情况下，Fastify 仅监听 `localhost 127.0.0.1` 接口（ [了解更多](https://www.fastify.io/docs/latest/Guides/Getting-Started/#your-first-server) ）。若需接受其他主机的连接，应在 `listen()` 调用中指定 `'0.0.0.0'`：

```typescript
async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  );
  await app.listen(3000, '0.0.0.0');
}
```

#### 平台特定包

请注意，当使用 `FastifyAdapter` 时，Nest 会将 Fastify 作为 **HTTP 提供程序** 。这意味着所有依赖 Express 的方案可能不再适用，而应改用 Fastify 的等效包。

#### 重定向响应

Fastify 处理重定向响应的方式与 Express 略有不同。要进行正确的重定向，需同时返回状态码和 URL，如下所示：

```typescript
@Get()
index(@Res() res) {
  res.status(302).redirect('/login');
}
```

#### Fastify 配置选项

您可以通过 `FastifyAdapter` 构造函数将选项传入 Fastify。例如：

```typescript
new FastifyAdapter({ logger: true });
```

#### 中间件

中间件函数获取的是原始的 `req` 和 `res` 对象，而非 Fastify 的封装对象。这是底层使用的 `middie` 包以及 `fastify` 的工作机制 - 更多信息请参阅此[页面](https://www.fastify.io/docs/latest/Reference/Middleware/)

```typescript title="logger.middleware"
import { Injectable, NestMiddleware } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: FastifyRequest['raw'], res: FastifyReply['raw'], next: () => void) {
    console.log('Request...');
    next();
  }
}
```

#### 路由配置

你可以使用 Fastify 的[路由配置](https://fastify.dev/docs/latest/Reference/Routes/#config)功能，配合 `@RouteConfig()` 装饰器。

```typescript
@RouteConfig({ output: 'hello world' })
@Get()
index(@Req() req) {
  return req.routeConfig.output;
}
```

#### 路由约束

自 v10.3.0 版本起，`@nestjs/platform-fastify` 支持 Fastify 的[路由约束](https://fastify.dev/docs/latest/Reference/Routes/#constraints)功能，通过 `@RouteConstraints` 装饰器实现。

```typescript
@RouteConstraints({ version: '1.2.x' })
newFeature() {
  return 'This works only for version >= 1.2.x';
}
```

> info **提示**`@RouteConfig()` 和 `@RouteConstraints` 是从 `@nestjs/platform-fastify` 导入的。

#### 示例

一个可用的示例[在此处](https://github.com/nestjs/nest/tree/master/sample/10-fastify)查看。
