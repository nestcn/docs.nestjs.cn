<!-- 此文件从 content/graphql/guards-interceptors.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-01T04:25:21.950Z -->
<!-- 源文件: content/graphql/guards-interceptors.md -->

### 其他功能

在 GraphQL 世界中，有关处理问题，如 **身份验证** 或 **操作的副作用**，有很多讨论。我们是否应该在业务逻辑中处理这些问题？是否使用高阶函数来增强查询和变更请求的授权逻辑？或者是否使用 __LINK_40__？这些问题没有单一的答案。

Nest 帮助解决这些问题，通过其跨平台功能，如 __LINK_41__ 和 __LINK_42__。该哲学是减少冗余，提供工具，帮助创建结构良好、可读、一致的应用程序。

#### 概述

您可以使用标准 __LINK_43__、__LINK_44__、__LINK_45__ 和 __LINK_46__ 与 GraphQL 一样使用 RESTful 应用程序。另外，您也可以轻松创建自己的装饰器，通过 __LINK_47__ 特性。让我们来看看一个 sample GraphQL 查询处理程序。

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

正如您所见，GraphQL 与 guards 和 pipes 一样，与 HTTP REST 处理程序工作。因此，您可以将身份验证逻辑移到守卫中；您甚至可以重用相同的守卫类在 REST 和 GraphQL API 接口之间。同样，拦截器在两个类型的应用程序中工作相同：

```typescript
async onModuleInit(): Promise<void> {
  await this.fetch();
}
```

#### 执行上下文

由于 GraphQL 接收的是不同的数据类型的 incoming 请求，guards 和拦截器接收的 __LINK_48__ 与 REST 有所不同。GraphQL 解决器具有独特的参数：`onApplicationShutdown`、`app.close()`、`enableShutdownHooks` 和 `onModuleInit()`。因此，guards 和拦截器必须将泛型 `onApplicationBootstrap()` 转换为 `onModuleDestroy()`。这很简单：

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

GraphQL 上下文对象，返回 by `SIGTERM`， expose 一个 **get** 方法，每个 GraphQL 解决器参数（例如 `beforeApplicationShutdown()`、`onModuleDestroy()` 等）。一旦转换，我们可以轻松地选择当前请求的任何 GraphQL 参数。

#### 异常过滤器

Nest 标准 __LINK_49__ 也与 GraphQL 应用程序兼容。与 `app.close()` 一样，GraphQL 应用程序应该将 `onApplicationShutdown()` 对象转换为 `app.close()` 对象。

```typescript
@Injectable()
class UsersService implements OnApplicationShutdown {
  onApplicationShutdown(signal: string) {
    console.log(signal); // e.g. "SIGINT"
  }
}
```

> 信息 **提示** 对于 `app.close()` 和 `SIGTERM`，请从 `onModuleInit()` 包中导入。

与 REST 案例不同，您不使用 native `onApplicationBootstrap()` 对象生成响应。

#### 自定义装饰器

如前所述，__LINK_50__ 特性与 GraphQL 解决器工作相同。

__CODE_BLOCK_4__

使用 `OnModuleInit` 自定义装饰器如下：

__CODE_BLOCK_5__

> 信息 **提示** 在上述示例中，我们假设 `onModuleInit()` 对象被分配到 GraphQL 应用程序的上下文中。

#### 在字段解析器级别执行增强器

在 GraphQL 上下文中，Nest 不会在字段级别 __LINK_51__ 运行增强器（即拦截器、守卫和过滤器）。您可以告诉 Nest 执行拦截器、守卫或过滤器，以便在注释为 `Promise` 的方法上运行。将 `async` 选项设置为 `await`，并将其传递给 `onModuleDestroy()`、`beforeApplicationShutdown()` 和/or `onApplicationShutdown()`：

__CODE_BLOCK_6__

> 警告 **警告** 启用字段解析器的增强器可能会在您返回大量记录时导致性能问题，特别是在字段解析器被执行数千次时。因此，我们建议在启用 `app.close()` 时跳过非必要的增强器执行。您可以使用以下 helper 函数：

__CODE_BLOCK_7__

#### 创建自定义驱动程序

Nest 提供了两个官方驱动程序：`enableShutdownHooks()` 和 `SIGINT`，以及一个 API，允许开发者创建新的 **自定义驱动程序**。使用自定义驱动程序，您可以集成任何 GraphQL 库或扩展现有集成，添加额外功能。

例如，要集成 `SIGBREAK` 包，您可以创建以下驱动程序类：

__CODE_BLOCK_8__

然后，使用它：

__CODE_BLOCK_9__
