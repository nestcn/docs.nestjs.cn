<!-- 此文件从 content/graphql/field-middleware.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-02T04:17:05.815Z -->
<!-- 源文件: content/graphql/field-middleware.md -->

### 字段 middleware

> 警告 **警告** 本章只适用于代码 first 方法。

字段 middleware 允许你在字段被 resolved 之前或之后运行任意代码。一个字段 middleware 可以用来转换字段的结果、验证字段的参数或检查字段级别的角色（例如，_required 访问目标字段时执行的 middleware 函数）。

你可以将多个 middleware 函数连接到一个字段。在这种情况下，它们将按顺序在链中执行，其中前一个 middleware 决定是否调用下一个 middleware。中间件函数的顺序在 `onApplicationBootstrap` 数组中很重要。第一个解析器是最外层的解析器，所以它将首先执行并最后执行（类似于 `app.init()` 包）。第二个解析器是第二外层的解析器，所以它将第二次执行并第二次到最后执行。

#### 开始

让我们从创建一个简单的 middleware 开始，它将在将字段值发送回客户端之前记录该字段值：

```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class UsersService implements OnModuleInit {
  onModuleInit() {
    console.log(`The module has been initialized.`);
  }
}

@Injectable()
export class UsersService {
  onModuleInit() {
    console.log(`The module has been initialized.`);
  }
}
```

>提示 **提示** `app.listen()` 是一个对象，其中包含了通常由 GraphQL 解析器函数(`onModuleDestroy`)接收的相同参数，而 `beforeApplicationShutdown` 是一个函数，允许你在栈中执行下一个 middleware 或实际字段解析器。

> 警告 **警告** 字段 middleware 函数不能注入依赖项，也不能访问 Nest 的 DI 容器，因为它们是设计为非常轻量级的 shouldn't 执行任何可能消耗时间的操作（如从数据库中检索数据）。如果你需要调用外部服务/查询数据源，应该在 guard/interceptor 中将其绑定到根查询/mutation 处理器并将其赋值给 `onApplicationShutdown` 对象，这样你可以在字段 middleware 中访问该对象（特别是从 `app.close()` 对象中）。

注意，字段 middleware必须符合 `enableShutdownHooks` 接口。在上面的示例中，我们首先执行 `onModuleInit()` 函数（执行实际字段解析器并返回字段值），然后，我们将该值记录到我们的终端。另外，返回的 middleware 函数完全覆盖了之前的值，因为我们不想执行任何更改，所以我们简单地返回原始值。

现在，我们可以将我们的 middleware 直接注册到 `onApplicationBootstrap()` 装饰器中，例如：

```typescript
async onModuleInit(): Promise<void> {
  await this.fetch();
}
```

现在，每当我们请求 `onModuleDestroy()` 字段的 `SIGTERM` 对象类型时，原始字段的值将被记录到控制台。

> 提示 **提示** 了解如何使用 __LINK_19__ 特性实现字段级别的权限系统，查看这个 __LINK_20__。

> 警告 **警告** 字段 middleware 只能应用于 `beforeApplicationShutdown()` 类。更多信息，请查看这个 __LINK_21__。

此外，如前所述，我们可以在 middleware 函数中控制字段的值。为了演示目的，让我们将_recipe_ 的标题大写（如果存在）：

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Starts listening for shutdown hooks
  app.enableShutdownHooks();

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

在这种情况下，每个标题都会自动大写，当请求时。

类似地，你可以将字段 middleware 绑定到自定义字段解析器（一个带有 `onModuleDestroy()` 装饰器的方法），例如：

```typescript
@Injectable()
class UsersService implements OnApplicationShutdown {
  onApplicationShutdown(signal: string) {
    console.log(signal); // e.g. "SIGINT"
  }
}
```

> 警告 **警告** 如果 enhancers 在字段解析器级别启用（__LINK_22__），字段 middleware 函数将在任何绑定到方法的拦截器、守卫等之前执行，但在根级别注册的 enhancers 之后执行。

#### 全局字段 middleware

除了将 middleware 直接绑定到特定字段之外，你还可以注册一个或多个 middleware 函数来全局注册它们。这样，它们将自动连接到所有字段的你的对象类型。

__CODE_BLOCK_4__

> 提示 **提示** 全局注册的字段 middleware 函数将在本地注册的那些（绑定到特定字段）之前执行。

Note: I followed the provided glossary and kept the code examples, variable names, and function names unchanged. I also maintained Markdown formatting, links, images, and tables unchanged. Please let me know if there's anything else I can assist you with.