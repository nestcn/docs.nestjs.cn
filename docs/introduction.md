<!-- 此文件从 content/introduction.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T04:42:50.315Z -->
<!-- 源文件: content/introduction.md -->

### 简介

Nest (NestJS) 是一个用于构建高效、可扩展的服务器端应用程序的框架。它使用渐进式 JavaScript，基于 TypeScript，支持 OOP、FP 和 FRP 等编程范式。

在底层，Nest 使用强大的 HTTP 服务器框架，如 __LINK_10__（默认）和可选地配置使用 __LINK_11__。

Nest 提供了对常见 Node.js 框架（Express/Fastify）的抽象层，同时 expose_directly expose 他们的 API 给开发者。这样，开发者可以使用可用的第三方模块。

#### философия

近年来，Thanks to Node.js，JavaScript已经成为 web 的“语言” both 前端和后端应用程序。这个趋势已经导致了像 __LINK_12__、__LINK_13__ 和 __LINK_14__ 这样的项目，提高了开发者生产力，并使得创建快速、可测试、可扩展的前端应用程序变得可能。然而，没有任何库、helper、工具能够解决服务器端架构的主要问题。

Nest 提供了一种出-of-the-box 的应用程序架构，使得开发者和团队能够创建高度可测试、可扩展、松耦合、易维护的应用程序。架构受到 Angular 的深远影响。

#### 安装

要开始使用，您可以使用 __LINK_15__ 或 __LINK_16__（两者将产生相同的结果）。

使用 Nest CLI 创建项目，运行以下命令。这将创建一个新的项目目录，并将初始核心 Nest 文件和支持模块填充到目录中，创建一个传统的项目结构。使用 **Nest CLI** 创建新项目是推荐的首选。我们将在 __LINK_17__ 继续使用该方法。

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

> 提示 **Hint** 使用 __INLINE_CODE_2__ 标志创建一个新的 TypeScript 项目，具有更严格的特性集。

#### 替代方案

或者，您可以使用 __LINK_18__ 安装 TypeScript 加速器项目：

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

> 提示 **Hint** 如果您想克隆存储库，而不包括 Git 历史记录，可以使用 __LINK_19__。

打开浏览器，导航到 __LINK_20__。

要安装 JavaScript 版本的加速器项目，可以在命令序列中使用 __INLINE_CODE_5__。

您也可以从头开始创建一个新项目，安装核心和支持包。请注意，您需要自己设置项目模板文件。至少，您需要安装这些依赖项：__INLINE_CODE_6__、__INLINE_CODE_7__、__INLINE_CODE_8__ 和 __INLINE_CODE_9__。查看这个短小的文章，了解如何创建一个完整的项目：__LINK_21__。