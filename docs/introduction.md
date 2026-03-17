<!-- 此文件从 content/introduction.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T04:29:24.431Z -->
<!-- 源文件: content/introduction.md -->

### 介绍

Nest（NestJS）是构建高效、可扩展的服务器端应用程序的框架。它使用渐进式 JavaScript，基于 TypeScript（ yet still enables developers to code in pure JavaScript），并结合面向对象编程（OOP）、函数式编程（FP）和函数式响应式编程（FRP）的元素。

在背后，Nest 使用强大且稳定的HTTP 服务器框架，如 __LINK_12__（默认）和可选地可以配置使用 __LINK_13__。

Nest 提供了对常见 Node.js 框架（Express/Fastify）的 abstraction，同時也暴露了它们的 API 给开发者。这使得开发者可以使用第三方模块，这些模块适用于 underlying 平台。

####philosophy

在 Node.js 的帮助下，JavaScript 已经成为 web 的“语言”（lingua franca）both 前端和后端应用程序。这导致了 awesome 项目，如 __LINK_14__、__LINK_15__ 和 __LINK_16__，它们提高了开发者生产力，并使得创建快速、可测试、可扩展的前端应用程序成为可能。然而，在 Node.js（和服务器端 JavaScript）中，有很多优秀的库、帮助程序和工具，但没有一个有效地解决**架构**问题。

Nest 提供了一个 out-of-the-box 应用程序架构，使得开发者和团队能够创建高度可测试、可扩展、松耦合和易于维护的应用程序。该架构受到 Angular 的 heavyinspiration。

#### 安装

要开始使用，可以使用 __LINK_17__ 或 __LINK_18__（两者都会产生相同的结果）。

使用 Nest CLI 创建项目，运行以下命令。这将创建一个新项目目录，并将初始核心 Nest 文件和支持模块填充到该目录中，创建了一个常规的基础结构用于您的项目。使用 **Nest CLI** 创建新项目推荐给第一次用户。我们将在 __LINK_19__ 继续使用这个方法。

```typescript
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
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

> 提示 **Hint** 使用 __INLINE_CODE_2__ flag 在 __INLINE_CODE_3__ 命令中创建一个新 TypeScript 项目。

#### Alternative

或者，您可以使用 Git 安装 TypeScript starter 项目：

```typescript
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { CatsModule } from './cats/cats.module';

@Module({
  imports: [CatsModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('cats');
  }
}

@Module({
  imports: [CatsModule],
})
export class AppModule {
  configure(consumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('cats');
  }
}

```

> 提示 **Hint** 如果您想克隆 Git 历史记录，而不是克隆完整的 Git 历史记录，可以使用 __LINK_20__。

使用您的浏览器访问 __LINK_21__。

要安装 JavaScript 版本的 starter 项目，请在命令序列中使用 __INLINE_CODE_5__。

您也可以从头开始创建一个新项目，安装核心和支持包。请注意，您需要自己设置项目 boilerplate 文件。至少，您需要这些依赖项：__INLINE_CODE_6__、__INLINE_CODE_7__、__INLINE_CODE_8__ 和 __INLINE_CODE_9__。了解创建完整项目的简短文章：__LINK_22__。

Note: The translation follows the provided glossary and maintains the original code and format as much as possible.