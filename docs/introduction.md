<!-- 此文件从 content/introduction.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-01T04:14:53.699Z -->
<!-- 源文件: content/introduction.md -->

###Introduction

Nest（NestJS）是一个用于构建高效、可扩展的服务器端应用程序的框架。它使用渐进式JavaScript，基于TypeScript，支持对象关联编程（OOP）、函数式编程（FP）和函数式响应式编程（FRP）。

在背后，Nest使用了强大的HTTP Server框架，如__LINK_12__（默认）和可选地可以配置使用__LINK_13__。

Nest提供了一种对常见的Node.js框架（Express/Fastify）的抽象层，但同时也 expose 了它们的API，允许开发者使用第三方模块。

####Philosophy

在Node.js出现后，JavaScript已经成为web的“语言基础”，适用于前端和后端应用程序。这引发了很多神奇的项目，如__LINK_14__、__LINK_15__和__LINK_16__，这些项目提高了开发者的生产力，并使得创建快速、可测试、可扩展的前端应用程序变得可能。然而，在Node（和服务器端JavaScript）中，没有一种有效的解决方案来解决**架构**问题。

Nest提供了一个可以出厂的应用程序架构，可以让开发者和团队创建高可测试、高可扩展、松耦合、易于维护的应用程序。该架构受到Angular的 heavy inspiration。

####Installation

要开始使用，可以使用__LINK_17__或__LINK_18__（这两个操作将产生相同的结果）。

使用Nest CLI创建项目，运行以下命令。这将创建一个新的项目目录，并将初始核心Nest文件和支持模块填充到该目录中，创建一个传统的基础结构用于您的项目。使用**Nest CLI**创建新项目是推荐的首选。我们将在__LINK_19__中继续使用这个方法。

```typescript
import { Injectable } from '@nestjs/common';
import { Cat } from './interfaces/cat.interface';

@Injectable()
export class CatsService {
  private readonly cats: Cat[] = [];

  create(cat: Cat) {
    this.cats.push(cat);
  }

  findAll(): Cat[] {
    return this.cats;
  }
}

@Injectable()
export class CatsService {
  constructor() {
    this.cats = [];
  }

  create(cat) {
    this.cats.push(cat);
  }

  findAll() {
    return this.cats;
  }
}
```

> info **提示**要创建一个具有更严格特性集的TypeScript项目，请将__INLINE_CODE_2__标志传递给__INLINE_CODE_3__命令。

####Alternatives

或者，可以使用Git安装TypeScript starter项目：

```typescript
export interface Cat {
  name: string;
  age: number;
  breed: string;
}
```

> info **提示**如果您想克隆仓库而不包括Git历史记录，可以使用__LINK_20__。

打开浏览器，导航到__LINK_21__。

要安装JavaScript starter项目的版本，请在命令序列中使用__INLINE_CODE_5__。

您也可以从头开始创建一个项目，安装核心和支持包。请注意，您需要自己设置项目基本文件。至少，您需要以下依赖项：__INLINE_CODE_6__、`CatsController`、`providers`和`CatsService`。查看这个关于创建完整项目的短文：__LINK_22__。