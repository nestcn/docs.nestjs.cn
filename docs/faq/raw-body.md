<!-- 此文件从 content/faq/raw-body.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-12T13:42:20.332Z -->
<!-- 源文件: content/faq/raw-body.md -->

### 原始请求体

访问原始请求体的最常见用例之一是执行 webhook 签名验证。通常，执行 webhook 签名验证需要未序列化的请求体来计算 HMAC 哈希值。

:::warning 警告
此功能仅在内置全局 body parser 中间件启用时可用，即在创建应用时不能传递 `bodyParser: false`。
:::

#### 在 Express 中使用

首先在创建 Nest Express 应用时启用该选项：

```typescript
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

// 在 "bootstrap" 函数中
const app = await NestFactory.create<NestExpressApplication>(AppModule, {
  rawBody: true,
});
await app.listen(process.env.PORT ?? 3000);

```

要在控制器中访问原始请求体，提供了便捷接口 `RawBodyRequest` 来在请求上暴露 `rawBody` 字段：使用 `RawBodyRequest` 类型接口：

```typescript
import { Controller, Post, RawBodyRequest, Req } from '@nestjs/common';
import { Request } from 'express';

@Controller('cats')
class CatsController {
  @Post()
  create(@Req() req: RawBodyRequest<Request>) {
    const raw = req.rawBody; // 返回一个 `Buffer`。
  }
}

```

#### 注册不同的解析器

默认情况下，只注册了 `json` 和 `urlencoded` 解析器。如果你想动态注册不同的解析器，需要显式地进行。

例如，要注册一个 `text` 解析器，可以使用以下代码：

```typescript
app.useBodyParser('text');

```

:::warning 警告
确保为 `NestFactory.create` 调用提供正确的应用类型。对于 Express 应用，正确的类型是 `NestExpressApplication`。否则将找不到 `.useBodyParser` 方法。
:::

#### Body parser 大小限制

如果你的应用需要解析大于 Express 默认 `100kb` 的请求体，请使用以下配置：

```typescript
app.useBodyParser('json', { limit: '10mb' });

```

`.useBodyParser` 方法将遵循传递给应用选项的 `rawBody` 选项。

#### 在 Fastify 中使用

首先在创建 Nest Fastify 应用时启用该选项：

```typescript
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';

// 在 "bootstrap" 函数中
const app = await NestFactory.create<NestFastifyApplication>(
  AppModule,
  new FastifyAdapter(),
  {
    rawBody: true,
  },
);
await app.listen(process.env.PORT ?? 3000);

```

要在控制器中访问原始请求体，提供了便捷接口 `RawBodyRequest` 来在请求上暴露 `rawBody` 字段：使用 `RawBodyRequest` 类型接口：

```typescript
import { Controller, Post, RawBodyRequest, Req } from '@nestjs/common';
import { FastifyRequest } from 'fastify';

@Controller('cats')
class CatsController {
  @Post()
  create(@Req() req: RawBodyRequest<FastifyRequest>) {
    const raw = req.rawBody; // 返回一个 `Buffer`。
  }
}

```

#### 注册不同的解析器

默认情况下，只注册了 `application/json` 和 `application/x-www-form-urlencoded` 解析器。如果你想动态注册不同的解析器，需要显式地进行。

例如，要注册一个 `text/plain` 解析器，可以使用以下代码：

```typescript
app.useBodyParser('text/plain');

```

:::warning 警告
确保为 `NestFactory.create` 调用提供正确的应用类型。对于 Fastify 应用，正确的类型是 `NestFastifyApplication`。否则将找不到 `.useBodyParser` 方法。
:::

#### Body parser 大小限制

如果你的应用需要解析大于 Fastify 默认 1MiB 的请求体，请使用以下配置：

```typescript
const bodyLimit = 10_485_760; // 10MiB
app.useBodyParser('application/json', { bodyLimit });

```

`.useBodyParser` 方法将遵循传递给应用选项的 `rawBody` 选项。
