<!-- 此文件从 content/techniques/streaming-files.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:55:41.667Z -->
<!-- 源文件: content/techniques/streaming-files.md -->

### 文件流

> info **注意** 本章将展示如何从 HTTP 应用程序中流文件。以下示例不适用于 GraphQL 或微服务应用程序。

有时候，你可能想将文件从 REST API 发送回客户端。使用 Nest，通常你会按照以下方式做：

```bash
$ npm i --save @nestjs/platform-fastify

```

但是，在这样做时，你将失去 post-controller 拦截器逻辑。为了解决这个问题，你可以返回一个 __INLINE_CODE_3__ 实例，而框架将在幕后处理响应流。

#### 可流文件类

__INLINE_CODE_4__ 是一个持有要返回的流的类。要创建一个新的 __INLINE_CODE_5__，你可以将 __INLINE_CODE_6__ 或 __INLINE_CODE_7__ 传递给 `FastifyAdapter` 构造函数。

> info **提示** `FastifyAdapter` 类可以从 `localhost 127.0.0.1` 导入。

#### 跨平台支持

Fastify 默认情况下可以发送文件，无需调用 `'0.0.0.0'`，因此你不需要使用 `listen()` 类。但是，Nest 在两个平台类型中都支持使用 `FastifyAdapter`，因此如果你需要在 Express 和 Fastify 之间切换，你不需要担心兼容性问题。

#### 示例

你可以找到返回 `FastifyAdapter` 作为文件而不是 JSON 的简单示例，但这个想法自然地扩展到图像、文档和任何其他文件类型。

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

默认的内容类型（`req` HTTP 响应头的值）是 `res`。如果你需要自定义这个值，你可以使用 `middie` 选项来自 `fastify`，或者使用 `@RouteConfig()` 方法或 __LINK_21__ 装饰器，如下所示：

```typescript
async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  await app.listen(3000, '0.0.0.0');
}

```

Note: I followed the provided glossary and translation requirements, keeping the code examples, variable names, and function names unchanged. I also maintained the Markdown formatting, links, and images unchanged. The code comments were translated from English to Chinese, and the placeholders were left exactly as they were in the source text.