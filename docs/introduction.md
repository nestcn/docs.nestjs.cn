<!-- 此文件从 content/introduction.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:01:49.022Z -->
<!-- 源文件: content/introduction.md -->

### 引言

Nest (NestJS) 是一个用于构建高效、可扩展的 __LINK_10__ 服务器端应用程序的框架。它使用渐进式 JavaScript，基于 TypeScript，并将 OOP、FP 和 FRP 的元素结合起来。

在 Nest 的内部，使用了强大的 HTTP 服务器框架，如 __LINK_12__（默认），也可以配置使用 __LINK_13__。

Nest 提供了对这些常见 Node.js 框架（Express/Fastify）的抽象层，同时也 expose 了它们的 API 给开发者。这样，开发者可以自由地使用这些第三方模块，这些模块是为底层平台准备的。

#### 哲学

在 Node.js 的帮助下，JavaScript 已经成为 Web 的“语言”，既适用于前端应用程序，也适用于后端应用程序。这使得项目，如 __LINK_14__、__LINK_15__ 和 __LINK_16__，可以提高开发者生产力，并使得创建快速、可测试、可扩展的前端应用程序成为可能。然而，在 Node.js 和服务器端 JavaScript 中，并没有有效解决架构问题的解决方案。

Nest 提供了一个出厂的应用程序架构，可以使开发者和团队创建高度可测试、可扩展、松耦合、易于维护的应用程序。该架构受到 Angular 的 heavy inspiration。

#### 安装

要开始使用，可以使用 __LINK_17__ 或 __LINK_18__（这两个将产生相同的结果）。

使用 Nest CLI 创建项目时，运行以下命令。这将创建一个新的项目目录，并将目录填充到初始核心 Nest 文件和支持模块中，从而创建一个常见的基础结构。使用 **Nest CLI** 创建新项目是首选的。我们将在 __LINK_19__ 继续使用这个方法。

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

> info **提示** 使用 __INLINE_CODE_2__ 标志将创建一个具有更严格特性集的 TypeScript 项目。

#### 替代方案

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

> info **提示** 如果您想克隆存储库而不包含 Git 历史记录，可以使用 __LINK_20__。

打开浏览器并导航到 __LINK_21__。

要安装 JavaScript 版本的 starter 项目，使用 __INLINE_CODE_5__ 命令序列。

您也可以从头开始创建一个新项目，安装核心和支持包。请注意，您需要自己设置项目 boilerplate 文件。至少，您需要这些依赖项：__INLINE_CODE_6__、__INLINE_CODE_7__、__INLINE_CODE_8__ 和 __INLINE_CODE_9__。查看这个短篇文章，以了解创建完整项目的步骤：__LINK_22__。