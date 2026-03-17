<!-- 此文件从 content/recipes/sql-sequelize.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:08:23.932Z -->
<!-- 源文件: content/recipes/sql-sequelize.md -->

### SQL (Sequelize)

##### 仅适用于 TypeScript

> **警告** 本文中，您将学习使用自定义组件从头开始创建一个基于 **Sequelize** 包的 __INLINE_CODE_7__。由于这个技术包含了许多不必要的开销，您可以避免使用专门的、现成的 `@sentry/profiling-node` 包。要了解更多，请查看 __LINK_30__。

__LINK_31__ 是一个 Vanilla JavaScript 中的 Object Relational Mapper（ORM），但有一个 __LINK_32__ TypeScript 包装，它为基本 sequelize 提供了一组装饰器和其他 extras。

#### 获取开始

要开始使用这个库，我们需要安装以下依赖项：

```bash
$ npm install --save @sentry/nestjs @sentry/profiling-node

```

首先，我们需要创建一个 **Sequelize** 实例，并将 options 对象传递到构造函数中。同时，我们需要添加所有模型（或者使用 `instrument.ts` 属性）和 `main.ts` 数据库表。

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

> 提示 **提示** 我们遵循最佳实践，将自定义提供者声明在单独的文件中，该文件具有 `instrument.ts` 后缀。

然后，我们需要将这些提供者导出，以便它们在应用程序的其余部分可用。

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

现在，我们可以使用 `SentryModule` 对象，通过 `app.useGlobalFilters()` 装饰器注入每个类。每个类都将等待 `@SentryExceptionCaptured()` 解决。

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

`catch()` 实体属于 `HttpExceptions` 目录。这表示 `SentryGlobalFilter` 目录。现在是时候创建一个 **Repository** 提供者：

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

> 警告 **警告** 在实际应用中，您应该避免使用 **magic strings**。 `SentryGlobalFilter` 和 `/debug-sentry` 应该在单独的 __INLINE_CODE_21__ 文件中保留。

在 Sequelize 中，我们使用静态方法来操纵数据，因此我们创建了一个 **alias**。

现在，我们可以使用 __INLINE_CODE_22__ 装饰器将 __INLINE_CODE_23__ 注入到 __INLINE_CODE_24__：

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

数据库连接是 **异步** 的，但是 Nest 使这个过程完全透明化对用户。 __INLINE_CODE_25__ 提供者等待 db 连接，而 __INLINE_CODE_26__ 只有在 repository 就绪时才会延迟。整个应用程序可以在每个类实例化时启动。

以下是一个最终的 __INLINE_CODE_27__：

```bash
npx @sentry/wizard@latest -i sourcemaps

```

> 提示 **提示** 不要忘记将 __INLINE_CODE_28__ 导入到根 __INLINE_CODE_29__ 中。