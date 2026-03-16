<!-- 此文件从 content/introduction.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T04:50:17.458Z -->
<!-- 源文件: content/introduction.md -->

### 介绍

Nest（NestJS）是一个构建高效、可扩展的服务器端应用程序的框架。它使用渐进式 JavaScript，基于 TypeScript（支持纯 JavaScript），并结合 OOP（面向对象编程）、FP（函数式编程）和 FRP（函数式-reactive编程）的元素。

Nest 在内部使用强大的 HTTP 服务器框架，如 __LINK_12__（默认）和可选地可以配置使用 __LINK_13__。

Nest 提供了一级抽象于常见的 Node.js 框架（Express/Fastify）之上，但同时也暴露了它们的 API，以便开发者可以使用这些框架提供的多种第三方模块。

####Philosophy

最近几年，因为 Node.js，JavaScript 已经成为网络的“语言大法”（前端和后端应用程序），这使得项目像 __LINK_14__、__LINK_15__ 和 __LINK_16__ 等可以提高开发者的生产力，并使得创建快速、可测试和可扩展的前端应用程序变得可能。然而，尽管 Node.js 和服务器端 JavaScript 都有很多优秀的库、帮助工具和工具，但是它们却不能解决主要的问题，即 **架构**。

Nest 提供了出厂应用程序架构，允许开发者和团队创建高度可测试、可扩展、松耦合和易于维护的应用程序。架构受到 Angular 的 heavy inspiration。

#### 安装

要开始使用，可以使用 __LINK_17__ 或 __LINK_18__（两个结果相同）。

使用 Nest CLI 创建项目，运行以下命令。这将创建一个新的项目目录，并将初始核心 Nest 文件和支持模块填充到目录中，创建一个 conventional 基础结构用于您的项目。使用 **Nest CLI** 创建新项目是推荐的首选 对象。我们将在 __LINK_19__ 继续使用这个方法。

```typescript
import { Controller, Get } from '@nestjs/common';

@Controller('cats')
export class CatsController {
  @Get()
  findAll(): string {
    return 'This action returns all cats';
  }
}

@Controller('cats')
export class CatsController {
  @Get()
  findAll() {
    return 'This action returns all cats';
  }
}

```

> info **提示** 使用 __INLINE_CODE_2__ 标志在创建新的 TypeScript 项目时，可以使用更严格的特性集。

#### Alternative

Alternatively, 使用 **Git** 安装 TypeScript starter 项目：

```typescript
import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';

@Controller('cats')
export class CatsController {
  @Get()
  findAll(@Req() request: Request): string {
    return 'This action returns all cats';
  }
}

@Controller('cats')
export class CatsController {
  @Get()
  @Bind(Req())
  findAll(request) {
    return 'This action returns all cats';
  }
}

```

> info **提示** 如果您想克隆仓库而不包含 Git 历史记录，可以使用 __LINK_20__。

打开您的浏览器并导航到 __LINK_21__。

要安装 JavaScript 版本的 starter 项目，请在命令序列中使用 __INLINE_CODE_5__。

您也可以从头开始创建一个新项目，安装核心和支持包。请注意，您需要自己设置项目 boilerplate 文件。至少，您需要这些依赖项：__INLINE_CODE_6__、__INLINE_CODE_7__、__INLINE_CODE_8__ 和 __INLINE_CODE_9__。查看这个短篇文章来了解如何创建一个完整的项目：__LINK_22__。