### Sentry

[Sentry](https://sentry.io) 是一个错误追踪和性能监控平台，可帮助开发者实时识别并修复问题。本指南展示如何将 Sentry 的 [NestJS SDK](https://docs.sentry.io/platforms/javascript/guides/nestjs/) 集成到您的 NestJS 应用中。

#### 安装

首先，安装所需依赖：

```bash
$ npm install --save @sentry/nestjs @sentry/profiling-node
```

:::info 注意
`@sentry/profiling-node` 是可选项，但建议用于性能分析。
:::


#### 基础设置

要开始使用 Sentry，您需要创建一个名为 `instrument.ts` 的文件，该文件应在应用程序中其他模块之前导入：

 ```typescript title="instrument.ts"
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

  // Set sampling rate for profiling
  // This is relative to tracesSampleRate
  profilesSampleRate: 1.0,
});
```

更新您的 `main.ts` 文件，确保在其他导入之前引入 `instrument.ts`：

 ```typescript title="main.ts"
// Import this first!
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

随后，将 `SentryModule` 作为根模块添加到您的主模块中：

 ```typescript title="app.module.ts"
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

#### 异常处理

如果您正在使用全局捕获所有异常的过滤器（即通过 `app.useGlobalFilters()` 注册的过滤器，或在应用模块 providers 中注册的带有无参数 `@Catch()` 装饰器的过滤器），请在该过滤器的 `catch()` 方法上添加 `@SentryExceptionCaptured()` 装饰器。此装饰器会将全局错误过滤器接收到的所有意外错误报告给 Sentry：

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

默认情况下，只有未被错误过滤器捕获的未处理异常才会报告给 Sentry。`HttpExceptions`（包括[派生类](../overview/exception-filters#内置-http-异常) ）默认也不会被捕获，因为它们主要用作控制流载体。

如果您没有全局捕获所有异常的过滤器，请将 `SentryGlobalFilter` 添加到主模块的 providers 中。该过滤器会将其他错误过滤器未捕获的任何未处理错误报告给 Sentry。

:::warning 警告
需要在注册其他异常过滤器之前注册 `SentryGlobalFilter`。
:::

 ```typescript title="app.module.ts"
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

#### 可读的堆栈跟踪

根据项目配置方式，Sentry 错误中的堆栈跟踪可能不会显示实际代码。

要解决此问题，请将源映射上传至 Sentry。最简单的方法是使用 Sentry 向导：

```bash
npx @sentry/wizard@latest -i sourcemaps
```

#### 测试集成功能

要验证您的 Sentry 集成是否正常工作，可以添加一个会抛出错误的测试端点：

```typescript
@Get("debug-sentry")
getError() {
  throw new Error("My first Sentry error!");
}
```

访问应用程序中的 `/debug-sentry`，您应该能在 Sentry 仪表板中看到该错误。

### 摘要

有关 Sentry 的 NestJS SDK 完整文档（包括高级配置选项和功能），请访问 [Sentry 官方文档](https://docs.sentry.io/platforms/javascript/guides/nestjs/) 。

虽然 Sentry 专长是处理软件错误，但我们自己也会写出 bug。如果您在安装我们的 SDK 时遇到任何问题，请提交 [GitHub Issue](https://github.com/getsentry/sentry-javascript/issues) 或在 [Discord](https://discord.com/invite/sentry) 上联系我们。
