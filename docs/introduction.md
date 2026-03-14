<!-- 此文件从 content/introduction.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T04:21:11.981Z -->
<!-- 源文件: content/introduction.md -->

### Introduction

Nest（NestJS）是一个用于构建高效、可扩展的服务器端应用程序的框架。它使用渐进式JavaScript，基于TypeScript（ yet still enables developers to code in pure JavaScript）并结合面向对象编程（OOP）、函数式编程（FP）和函数式响应式编程（FRP）的元素。

下面是Nest的技术栈，它使用了robust的HTTP Server框架，如（默认）和 optionally 可以配置使用。

Nest提供了一个在Node.js常见框架（Express/Fastify）之上的抽象层，但是也 expose their APIs直给开发者。这样就给了开发者使用第三方模块的自由，以便使用潜在的平台模块。

#### Philosophy

在Node.js的帮助下，JavaScript已经成为web的“语言 franca” Both前端和后端应用程序。这导致了awesome项目诞生，如、和， 这些项目提高了开发者的生产力并允许创建快速、可测试、可扩展的前端应用程序。然而，即使存在许多优秀的库、帮助程序和工具，但none of them有效地解决了**架构**问题。

Nest提供了一个出-of-the-box的应用程序架构，使开发者和团队能够创建高度可测试、可扩展、松耦合、易于维护的应用程序。架构受到Angular的高度 inspirations。

#### 安装

要开始使用，可以使用 __LINK_17__ 或 __LINK_18__（两者将产生相同的结果）。

使用Nest CLI创建项目，运行以下命令。这将创建一个新的项目目录，并将目录填充初始核心Nest文件和支持模块，创建一个传统的项目结构。使用Nest CLI创建新的项目对第一次用户来说是推荐的。我们将在 __LINK_19__ 中继续使用这个方法。

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

> info **hint** 如果要创建一个新的TypeScript项目具有更严格的功能集，请将 __INLINE_CODE_2__ 标志传递给 __INLINE_CODE_3__ 命令。

#### Alternatives

Alternatively，可以使用 __LINK_20__ 克隆 Git 仓库，而不是使用 __LINK_17__。

打开浏览器并导航到 __LINK_21__。

要安装 JavaScript 版本的 starter 项目，使用 __INLINE_CODE_5__ 在命令序列中。

您也可以从头开始创建新的项目，安装核心和支持包。请注意，您将需要自己设置项目模板文件。至少，您需要这些依赖项： __INLINE_CODE_6__， __INLINE_CODE_7__， __INLINE_CODE_8__，和 __INLINE_CODE_9__。查看这个短文了解如何创建完整的项目：__LINK_22__.

Note: The translation is based on the provided glossary and follows the translation requirements. The code blocks and links are kept unchanged, and the placeholders are left as they are in the source text.