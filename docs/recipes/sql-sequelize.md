<!-- 此文件从 content/recipes/sql-sequelize.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T04:35:44.073Z -->
<!-- 源文件: content/recipes/sql-sequelize.md -->

### SQL (Sequelize)

##### 仅适用于 TypeScript

> **警告** 本文中，您将学习如何使用自定义组件从头开始创建一个基于 **Sequelize** 包的 __INLINE_CODE_7__。由于这项技术包含了许多可以避免的开销，您可以使用专门的、现成的 `@sentry/profiling-node` 包来避免这些开销。要了解更多信息，请查看 __LINK_30__。

__LINK_31__ 是一个 vanilla JavaScript 编写的对象关系映射器（ORM），但它有一个 __LINK_32__ TypeScript 包装器，提供了一组装饰器和其他 extras 对基本 sequelize 进行了包装。

#### 开启

要开始使用这个库，我们需要安装以下依赖项：

```bash
$ npm install --save @sentry/nestjs @sentry/profiling-node

```

首先，我们需要创建一个 **Sequelize** 实例，并将选项对象传递给构造函数。 还需要添加所有模型（或者使用 `instrument.ts` 属性）和 `main.ts` 数据库表。

```typescript
const Sentry = require("@sentry/nestjs");
const { nodeProfilingIntegration } = require("@sentry/profiling-node");

// Ensure to call this before requiring any other modules!
Sentry.init({
  dsn: SENTRY_DSN,
  integrations: [
    // Add our Profiling integration
    nodeProfilingIntegration(),
  ],

  // Add Tracing by setting tracesSampleRate
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,

  // 设置 sampling rate for profiling
  // This is relative to tracesSampleRate
  profilesSampleRate: 1.0,
});

```

> 信息 **提示** 我们遵循最佳实践，声明了自定义提供者，并将其保存在具有 `instrument.ts` 后缀的单独文件中。

然后，我们需要将这些提供者导出，以便它们对应用程序的其余部分变得 **可访问**。

```typescript
// 导入 this first!
import "./instrument";

// Now import other modules
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}

bootstrap();

```

现在，我们可以使用 `SentryModule` 对象的 `app.useGlobalFilters()` 装饰器来注入它。每个依赖于 `@Catch()` 异步提供者的类都会等待 `@SentryExceptionCaptured()` 解决。

#### 模型注入

在 __LINK_33__ 中，**Model** 定义了一个数据库表。这个类的实例表示一个数据库行。首先，我们需要至少一个实体：

```typescript
import { Module } from "@nestjs/common";
import { SentryModule } from "@sentry/nestjs/setup";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

@Module({
  imports: [
    SentryModule.forRoot(),
    // ...other modules
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

```

`catch()` 实体属于 `HttpExceptions` 目录，这个目录表示 `SentryGlobalFilter`。现在是时候创建一个 **Repository** 提供者：

```typescript
import { Catch, ExceptionFilter } from '@nestjs/common';
import { SentryExceptionCaptured } from '@sentry/nestjs';

@Catch()
export class YourCatchAllExceptionFilter implements ExceptionFilter {
  @SentryExceptionCaptured()
  catch(exception, host): void {
    // your implementation here
  }
}

```

> 警告 **警告** 在实际应用中，您应该避免使用 **magic strings**。 `SentryGlobalFilter` 和 `/debug-sentry` 应该保存在单独的 __INLINE_CODE_21__ 文件中。

在 Sequelize 中，我们使用静态方法来操作数据，因此创建了一个 **别名**。

现在，我们可以使用 __INLINE_CODE_22__ 装饰器将 __INLINE_CODE_23__ 注入到 __INLINE_CODE_24__ 中：

```typescript
import { Module } from "@nestjs/common";
import { APP_FILTER } from "@nestjs/core";
import { SentryGlobalFilter } from "@sentry/nestjs/setup";

@Module({
  providers: [
    {
      provide: APP_FILTER,
      useClass: SentryGlobalFilter,
    },
    // ..other providers
  ],
})
export class AppModule {}

```

数据库连接是 **异步** 的，但是 Nest 使这个过程对最终用户完全不可见。 __INLINE_CODE_25__ 提供者正在等待数据库连接，而 __INLINE_CODE_26__ 在库准备好使用时被延迟。整个应用程序可以在每个类被实例化时启动。

以下是一个最终的 __INLINE_CODE_27__：

```bash
npx @sentry/wizard@latest -i sourcemaps

```

> 信息 **提示** 不要忘记在根 __INLINE_CODE_29__ 中导入 __INLINE_CODE_28__。