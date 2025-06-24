### 原始请求体

访问原始请求体最常见的用途之一是执行 Webhook 签名验证。通常，为了进行 Webhook 签名验证，需要未序列化的请求体来计算 HMAC 哈希值。

> warning **注意** 该功能仅在启用了内置全局 body 解析器中间件时可用，即在创建应用时不能传递 `bodyParser: false` 参数。

#### 与 Express 配合使用

首先在创建 Nest Express 应用时启用该选项：

```typescript
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

// in the "bootstrap" function
const app = await NestFactory.create<NestExpressApplication>(AppModule, {
  rawBody: true,
});
await app.listen(process.env.PORT ?? 3000);
```

要在控制器中访问原始请求体，框架提供了便捷接口 `RawBodyRequest`，通过该接口可以在请求对象上暴露 `rawBody` 字段：使用 `RawBodyRequest` 接口类型：

```typescript
import { Controller, Post, RawBodyRequest, Req } from '@nestjs/common';
import { Request } from 'express';

@Controller('cats')
class CatsController {
  @Post()
  create(@Req() req: RawBodyRequest<Request>) {
    const raw = req.rawBody; // returns a `Buffer`.
  }
}
```

#### 注册不同的解析器

默认情况下仅注册了 `json` 和 `urlencoded` 解析器。如需动态注册其他解析器，需要显式进行配置。

例如，要注册一个 `text` 解析器，可以使用以下代码：

```typescript
app.useBodyParser('text');
```

> warning **警告** 请确保向 `NestFactory.create` 调用提供了正确的应用程序类型。对于 Express 应用，正确的类型是 `NestExpressApplication`，否则将找不到 `.useBodyParser` 方法。

#### 请求体解析器大小限制

如果您的应用需要解析超过 Express 默认 `100kb` 大小的请求体，请使用以下方法：

```typescript
app.useBodyParser('json', { limit: '10mb' });
```

`.useBodyParser` 方法将会遵循应用选项中传入的 `rawBody` 配置。

#### 搭配 Fastify 使用

首先在创建 Nest Fastify 应用时启用该选项：

```typescript
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';

// in the "bootstrap" function
const app = await NestFactory.create<NestFastifyApplication>(
  AppModule,
  new FastifyAdapter(),
  {
    rawBody: true,
  }
);
await app.listen(process.env.PORT ?? 3000);
```

要在控制器中访问原始请求体，框架提供了便捷的 `RawBodyRequest` 接口，通过该接口可在请求对象上暴露 `rawBody` 字段：使用 `RawBodyRequest` 接口类型即可实现。

```typescript
import { Controller, Post, RawBodyRequest, Req } from '@nestjs/common';
import { FastifyRequest } from 'fastify';

@Controller('cats')
class CatsController {
  @Post()
  create(@Req() req: RawBodyRequest<FastifyRequest>) {
    const raw = req.rawBody; // returns a `Buffer`.
  }
}
```

#### 注册不同的解析器

默认情况下，仅注册了 `application/json` 和 `application/x-www-form-urlencoded` 解析器。如需动态注册其他解析器，需要显式地进行操作。

例如，要注册 `text/plain` 解析器，可以使用以下代码：

```typescript
app.useBodyParser('text/plain');
```

warning **注意** 请确保向 `NestFactory.create` 调用提供了正确的应用类型。对于 Fastify 应用，正确的类型是 `NestFastifyApplication`，否则将找不到 `.useBodyParser` 方法。

#### 请求体解析器大小限制

若您的应用需要解析超出 Fastify 默认 1MiB 限制的请求体，请采用以下方式:

```typescript
const bodyLimit = 10_485_760; // 10MiB
app.useBodyParser('application/json', { bodyLimit });
```

`.useBodyParser` 方法会遵循应用配置中传递的 `rawBody` 选项。
