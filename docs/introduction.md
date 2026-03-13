<!-- 此文件从 content/introduction.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:23:59.442Z -->
<!-- 源文件: content/introduction.md -->

### Introduction

Nest (NestJS) 是一个用于构建高效、可扩展的服务器端应用程序的框架。它使用渐进式 JavaScript，基于 TypeScript，具有对象关联编程、函数式编程和函数式-reactive编程的特点。

在底层，Nest 使用强大的 HTTP 服务器框架，如 Express（默认）和 Fastify（可选）。

Nest 提供了一种在这些常见 Node.js 框架（Express/Fastify）之上的一种抽象层，同时也暴露了它们的 API，给开发者提供了自由使用第三方模块的能力。

#### Philosophy

在 Node.js 的影响下，JavaScript 已经成为 Web 的“语言”在前端和后端应用程序中。这个趋势给 rise 了许多有趣的项目，如 __LINK_14__、__LINK_15__ 和 __LINK_16__，这些项目提高了开发者的生产力，并使得创建快速、可测试、可扩展的前端应用程序变得可能。但是，而这些 superb 库、帮助工具和工具 none of them 解决了架构的主要问题。

Nest 提供了一个出-of-the-box 的应用程序架构，让开发者和团队可以创建高度可测试、可扩展、松耦合和易于维护的应用程序。架构受到 Angular 的 heavy inspiration。

#### Installation

要开始使用，可以使用 __LINK_17__ 或 __LINK_18__（这两个命令将产生同样的结果）。

使用 Nest CLI 创建项目，可以运行以下命令。这将创建一个新的项目目录，并将初始核心 Nest 文件和支持模块人口到目录中，创建一个 conventional 基础结构。使用 **Nest CLI** 创建新项目对于首次用户来说是推荐的。我们将在 __LINK_19__ 继续使用这个方法。

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

> info **提示** 使用 __INLINE_CODE_2__ flag 将创建一个新的 TypeScript 项目。

#### Alternatives

Alternatively，可以使用 **Git** 安装 TypeScript starter 项目：

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

> info **提示** 如果你想 clone 仓库而不包括 Git 历史，你可以使用 __LINK_20__。

使用以下命令打开浏览器并导航到 __LINK_21__。

要安装 JavaScript 版本的 starter 项目，可以在命令序列中使用 __INLINE_CODE_5__。

你也可以从头开始创建一个新的项目，安装核心和支持包。请注意，你需要自己设置项目 boilerplate 文件。在最小情况下，你需要这些依赖项：__INLINE_CODE_6__、__INLINE_CODE_7__、__INLINE_CODE_8__ 和 __INLINE_CODE_9__。查看这个短篇文章，了解如何创建一个完整的项目：__LINK_22__。