<!-- 此文件从 content/introduction.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-03T04:07:42.915Z -->
<!-- 源文件: content/introduction.md -->

### 序言

Nest（NestJS）是一款用于构建高效、可扩展的 Server-side 应用程序的框架。它使用渐进式 JavaScript，基于 TypeScript 构建，并且完全支持 TypeScript（同时仍然允许开发者编写纯 JavaScript 代码），并结合 OOP（面向对象编程）、FP（函数式编程）和 FRP（函数式响应式编程）的元素。

在底层，Nest 使用强大的 HTTP 服务器框架，如 __LINK_12__（默认）和可选地可以配置使用 __LINK_13__。

Nest 提供了一种在常见 Node.js 框架（Express/Fastify）之上的抽象层，但同时也暴露了它们的 API，给开发者提供了自由使用第三方模块的能力，这些模块可用于底层平台。

#### философия

在最近几年，Node.js 使 JavaScript 成为 Web 的“语言”，适用于前端和后端应用程序。这导致了许多awesome 项目，如 __LINK_14__、__LINK_15__ 和 __LINK_16__，它们提高了开发者的生产力，并使得创建快速、可测试、可扩展的前端应用程序成为可能。然而，虽然 Node.js 和服务器端 JavaScript 有许多优秀的库、工具和帮助程序，但是没有一种有效地解决架构问题的解决方案。

Nest 提供了一种出-of-the-box 的应用程序架构，可以让开发者和团队创建高度可测试、可扩展、松耦合和易于维护的应用程序。该架构受到 Angular 的 heavy inspiration。

#### 安装

要开始使用，可以使用 __LINK_17__ 或 __LINK_18__（两者将产生相同的结果）。

使用 Nest CLI 创建项目，运行以下命令。这将创建一个新的项目目录，并将初始的 Nest 文件和支持模块填充到目录中，创建一个传统的项目结构。使用 **Nest CLI** 创建新的项目是首选的选项。我们将在 __LINK_19__ 中继续使用这个选项。

```typescript
const user = req.user;
```

> info **提示** 要创建一个使用更严格特性集的 TypeScript 项目，请将 __INLINE_CODE_2__ 标志传递给 __INLINE_CODE_3__ 命令。

#### 替代方案

或者，可以使用 Git 安装 TypeScript 启动项目：

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
```

> info **提示** 如果你想克隆存储库而不包括 Git 历史记录，可以使用 __LINK_20__。

使用浏览器打开 __LINK_21__。

要安装 JavaScript 版本的启动项目，请在命令序列中使用 __INLINE_CODE_5__。

你也可以从头开始创建一个新的项目，只需安装核心和支持包。请注意，你需要自己设置项目 boilerplate 文件。至少，你需要这些依赖项：__INLINE_CODE_6__、__INLINE_CODE_7__、__INLINE_CODE_8__ 和 `@User()`。可以查看这篇文章，了解如何创建完整的项目：__LINK_22__。