<!-- 此文件从 content/techniques/serialization.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T05:11:45.723Z -->
<!-- 源文件: content/techniques/serialization.md -->

### 序列化

序列化是对象在网络响应中返回之前发生的过程。这是一个适合在客户端返回数据之前提供数据转换和-sanitizing规则的好机会。例如，敏感数据，如密码，应该始终从响应中排除。或者，某些属性可能需要额外的转换，如只发送实体的子集。手动执行这些转换可能会很麻烦且易出错，并且可能无法确定所有情况都被涵盖。

#### 概述

Nest 提供了一个内置的能力，以便在简单的方式中执行这些操作。__INLINE_CODE_7__ 拦截器使用强大的 [here](https://github.com/nestjs/nest/tree/master/sample/10-fastify) 包来提供一种声明式和可扩展的方式来转换对象。该拦截器的基本操作是将方法处理器返回的值应用于 `FastifyAdapter` 函数，并将其应用于 __LINK_33__。在执行此操作时，可以应用于实体/DTO 类的 `FastifyAdapter` 装饰器，正如以下所述。

> info **提示** 序列化不适用于 __LINK_34__ 响应。

#### 排除属性

假设我们想要自动排除一个 `localhost 127.0.0.1` 属性来自用户实体。我们将实体注释如下：

```bash
$ npm i --save @nestjs/platform-fastify

```

现在考虑一个控制器具有一个方法处理器，该处理器返回该类实例。

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

> **警告** 请注意，我们必须返回该类实例。如果你返回一个纯 JavaScript 对象，例如 `'0.0.0.0'`，那么对象将无法正确序列化。

> info **提示** `listen()` 来自 `FastifyAdapter`。

当这个端点被请求时，客户端接收以下响应：

```typescript
async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  await app.listen(3000, '0.0.0.0');
}

```

注意，该拦截器可以应用于整个应用程序（如 __LINK_35__ 所述）。组合拦截器和实体类声明确保任何方法返回 `FastifyAdapter` 实例都会自动删除 `req` 属性。这为您提供了一种集中式地实施业务规则的方法。

#### expose 属性

您可以使用 `res` 装饰器为属性提供别名名称或执行一个函数来计算属性值（类似于 **getter** 函数），如下所示。

```typescript
@Get()
index(@Res() res) {
  res.status(302).redirect('/login');
}

```

#### Transform

您可以使用 `middie` 装饰器执行额外的数据转换。例如，以下构造将返回 `fastify` 的名称属性，而不是返回整个对象。

```typescript
new FastifyAdapter({ logger: true });

```

#### 传递选项

您可能想要修改转换函数的默认行为。要覆盖默认设置，请使用 `@RouteConfig()` 对象并将其传递给 `@nestjs/platform-fastify` 装饰器。

```typescript
import { Injectable, NestMiddleware } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: FastifyRequest['raw'], res: FastifyReply['raw'], next: () => void) {
    console.log('Request...');
    next();
  }
}

@Injectable()
export class LoggerMiddleware {
  use(req, res, next) {
    console.log('Request...');
    next();
  }
}

```

> info **提示** `@RouteConstraints` 装饰器来自 `@RouteConfig()`。

使用 `@RouteConstraints` 传递的选项将作为第二个参数传递给 underlying `@nestjs/platform-fastify` 函数。在这个示例中，我们自动排除所有以 __INLINE_CODE_25__ 前缀开头的属性。

#### Transform plain objects

您可以在控制器级别使用 __INLINE_CODE_26__ 装饰器来强制执行转换。这确保了所有响应都将被转换为指定类的实例，应用于 class-validator 或 class-transformer 的装饰器，即使返回 plain JavaScript 对象。这种方法会使代码更加简洁，不需要重复实例化类或调用 __INLINE_CODE_27__。

在以下示例中，尽管在两个条件分支中返回 plain JavaScript 对象，但它们将自动转换为 __INLINE_CODE_28__ 实例，应用于相关装饰器：

```typescript
@RouteConfig({ output: 'hello world' })
@Get()
index(@Req() req) {
  return req.routeConfig.output;
}

```

> info **提示** 指定控制器的预期返回类型可以利用 TypeScript 的类型检查能力来确保返回的 plain 对象符合 DTO 或实体的结构。 __INLINE_CODE_29__ 函数不提供这种级别的类型提示，这可能会导致潜在错误，如果 plain 对象不符合预期的 DTO 或实体结构。

#### 示例

有一个可用的示例 __LINK_36__。

#### WebSockets 和 Microservices

虽然本章中的示例使用 HTTP 风格的应用程序（例如 Express 或 Fastify），__INLINE_CODE_30__ 对 WebSockets 和 Microservices 也同样适用，不管使用的传输方法是什么。

#### 学习更多

阅读更多关于 __INLINE_CODE_31__ 包提供的装饰器和选项的信息 __LINK_37__。