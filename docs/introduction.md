<!-- 此文件从 content/introduction.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-02T04:06:52.281Z -->
<!-- 源文件: content/introduction.md -->

### 简介

Nest (NestJS) 是一个用于构建高效、可扩展的服务器端应用程序的框架。它使用渐进式 JavaScript，并且在 Node.js 的基础上，完全支持 TypeScript（虽然仍然允许开发者使用纯 JavaScript），并且结合了 OOP、FP 和 FRP 的特性。

在 Nest 的内部，使用了强大的 HTTP 服务器框架，如 __LINK_12__（默认）和可选地可以配置使用 __LINK_13__。

Nest 提供了在常见的 Node.js 框架（Express/Fastify）之上的抽象层，同时也 expose 了它们的 API 给开发者。这给了开发者使用第三方模块的自由，可以在基础平台上使用众多的第三方模块。

#### философия

在最近几年，因为 Node.js，JavaScript 已经变成了网络的“语言”，用于前端和后端应用程序。这引发了 awesome 项目，如 __LINK_14__、__LINK_15__ 和 __LINK_16__，这些项目提高了开发者的生产力，并使得创建快速、可测试、可扩展的前端应用程序成为可能。然而，虽然 Node.js 上有很多优秀的库、帮助器和工具，但它们都不能解决架构问题。

Nest 提供了一个 out-of-the-box 的应用程序架构，允许开发者和团队创建高度可测试、可扩展、松耦合和易于维护的应用程序。这架构受到 Angular的 heavy inspiration。

#### 安装

要开始使用，可以使用 __LINK_17__ 或 __LINK_18__（这两个命令将产生相同的结果）。

使用 Nest CLI scaffold 项目，运行以下命令。这将创建一个新的项目目录，并将初始核心 Nest 文件和支持模块填充到目录中，创建一个传统的项目结构。使用 **Nest CLI** 创建新项目是为初学者推荐的。我们将在 __LINK_19__ 继续使用这个方法。

```typescript
const user = req.user;
```

> 提示 **Hint** 使用 __INLINE_CODE_2__ 标志创建一个新的 TypeScript 项目，具有更严格的特性集。

####_alternatives_

或者，可以使用 Git 安装 TypeScript starter 项目：

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
```

> 提示 **Hint** 如果您想要克隆存储库，而不包括 Git 历史记录，可以使用 __LINK_20__。

打开浏览器， navigate 到 __LINK_21__。

要安装 JavaScript 版本的 starter 项目，使用 __INLINE_CODE_5__ 命令。

您也可以从头开始创建一个新项目，安装核心和支持包。请注意，您需要自己设置项目 boilerplate 文件。至少，您需要这四个依赖项：__INLINE_CODE_6__、__INLINE_CODE_7__、__INLINE_CODE_8__ 和 `@User()`。查看以下文章，了解如何创建一个完整的项目：__LINK_22__。