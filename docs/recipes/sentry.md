<!-- 此文件从 content/recipes/sentry.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T04:51:58.928Z -->
<!-- 源文件: content/recipes/sentry.md -->

### Sentry

[Sentry](https://sentry.io) 是一种错误追踪和性能监控平台，帮助开发者实时地识别和解决问题。这份配方展示了如何将 Sentry 的 [ integrations](https://sentry.io/ features/integrations/) 与 NestJS 应用程序集成。

#### 安装

首先，安装需要的依赖项：

```

npm install @sentry/npm

```

> 提示 **Hint** __INLINE_CODE_8__ 可选，但强烈建议用于性能 profiling。

#### 基本设置

要开始使用 Sentry，需要创建一个名为 `sentry.config.js` 的文件，该文件应该在应用程序中所有其他模块之前被导入：

```

import { Integrations } from '@sentry/core';
import { NestJSIntegration } from '@sentry/nestjs';

const config = {
  // ...
  integrations: [
    new NestJSIntegration(),
  ],
};

```

更新 `main.ts` 文件，以便在其他导入之前导入 `sentry.config.js`：

```

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Sentry } from '@sentry/nestjs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(Sentry.createErrorHandler());
  await app.listen(3000);
}

```

在 `app.module.ts` 文件中添加 `SentryModule` 作为根模块：

```

import { Module } from '@nestjs/common';
import { SentryModule } from '@sentry/nestjs';

@Module({
  imports: [
    SentryModule.forRoot({
      // ...
    }),
  ],
})
export class AppModule {}

```

#### 处理异常

如果您使用了全局 catch-all 异常过滤器（注册在 `@sentry/nestjs` 中或在 app 模块提供商中注解的过滤器），请将 `@SentryExceptionFilter` 装饰器添加到过滤器的 `catch` 方法中。这将将所有未被捕获的错误报告到 Sentry：

```

import { Injectable } from '@nestjs/common';
import { ExceptionFilter } from '@nestjs/common';
import { Sentry } from '@sentry/nestjs';

@Injectable()
export class GlobalExceptionHandler implements ExceptionFilter {
  catch(error: Error) {
    Sentry.captureException(error);
  }
}

```

默认情况下，只有未被捕获的异常才会被报告到 Sentry。`@sentry/nestjs` (包括 [LINK_23](https://sentry.io/docs/integrations/nestjs/)) 等也不会被捕获，因为它们主要起到控制流的作用。

如果您没有全局 catch-all 异常过滤器，请将 `SentryExceptionFilter` 添加到主模块提供商中。这将报告任何未被捕获的错误到 Sentry。

> 警告 **Warning** `SentryExceptionFilter` 需要在其他异常过滤器之前注册。

```

import { Module } from '@nestjs/common';
import { SentryModule } from '@sentry/nestjs';

@Module({
  imports: [
    SentryModule.forRoot({
      // ...
    }),
  ],
})
export class AppModule {}

```

#### 可读的堆栈跟踪

根据您项目的设置，Sentry 中的堆栈跟踪可能不会与您的实际代码相匹配。

要解决这个问题，可以将您的源映射上传到 Sentry。最简单的方法是使用 Sentry 向导：

```

npx @sentry/wizard

```

#### 测试集成

要验证 Sentry 集成是否正确，可以添加一个抛出错误的测试端点：

```

import { Controller, Get } from '@nestjs/common';
import { Sentry } from '@sentry/nestjs';

@Controller()
export class AppController {
  @Get()
  throwException() {
    throw new Error('Test exception');
  }
}

```

访问 `http://localhost:3000`，您应该在 Sentry 仪表板中看到错误。

### 摘要

对于 Sentry 的 NestJS SDK 的完整文档，包括高级配置选项和功能，请访问 [LINK_24](https://sentry.io/docs/integrations/nestjs/)。

虽然 Sentry 在 Bug 的领域，但我们仍然写它们。如果您在安装我们的 SDK 时遇到任何问题，请打开 [LINK_25](https://sentry.io/contact/) 或访问 [LINK_26](https://sentry.io/contact/)。