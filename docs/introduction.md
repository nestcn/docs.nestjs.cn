<!-- 此文件从 content/introduction.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-21T16:06:29.470Z -->
<!-- 源文件: content/introduction.md -->

### 简介

Nest（NestJS）是一个用于构建高效、可扩展的服务器端应用程序的框架。它使用渐进式JavaScript，基于TypeScript，并结合OOP、FP和FRP的元素。

在幕后，Nest使用强大的HTTP服务器框架，如__LINK_12__（默认）和可选择地配置使用__LINK_13__！

Nest提供了一种抽象层次高于常见的Node.js框架（Express/Fastify），但同时也 expose它们的API直接给开发者。这给开发者提供了使用 underlying 平台的第三方模块的自由。

#### 设计理念

在最近几年，因为Node.js，JavaScript已经成为Web的“语言”both前端和后端应用程序。这导致了像__LINK_14__、__LINK_15__和__LINK_16__等项目的出现，这些项目提高了开发者生产力，并使创建快速、可测试、可扩展的前端应用程序成为可能。然而，而Node (和服务器端JavaScript)中有很多优秀的库、助手和工具，没有任何一个有效地解决了**架构**的问题。

Nest提供了一种出厂的应用程序架构，这允许开发者和团队创建高度可测试、可扩展、松耦合和易于维护的应用程序。架构受到Angular的 heavy inspiration。

#### 安装

要开始使用，可以使用__LINK_17__或__LINK_18__（两个将产生相同的结果）。

使用Nest CLI创建项目，可以运行以下命令。这将创建一个新的项目目录，并将初始核心Nest文件和支持模块填充到目录中，创建一个传统的基础结构来支撑您的项目。使用**Nest CLI**创建新项目推荐给第一次用户。我们将继续使用这个方法在__LINK_19__中。

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

> 提示 **Hint**  To create a new TypeScript project with stricter feature set, pass the __INLINE_CODE_2__ flag to the __INLINE_CODE_3__ command.

####_alternatives_

Alternatively, to install the TypeScript starter project with **Git**:

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

> 提示 **Hint**  If you'd like to clone the repository without the git history, you can use __LINK_20__.

打开您的浏览器，并导航到__LINK_21__。

要安装JavaScript版本的启动项目，可以在命令序列中使用__INLINE_CODE_5__。

您还可以从头开始创建一个新项目，只需安装核心和支持的包。请注意，您将需要自己设置项目 boilerplate 文件。至少，您需要这些依赖项：__INLINE_CODE_6__, __INLINE_CODE_7__, __INLINE_CODE_8__,和__INLINE_CODE_9__。查看这个短文关于如何创建完整的项目：__LINK_22__。