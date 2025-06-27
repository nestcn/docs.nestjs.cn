# 介绍

> **关于本文档**：这是 NestJS 官方文档的中文翻译版本。文档源码托管在 [GitHub](https://github.com/nestcn/docs.nestjs.cn)，欢迎 Star、Fork 和贡献翻译！如发现翻译问题或需要改进，请提交 Issue 或 Pull Request。
> 
> **旧版文档**：如需访问旧版文档，请点击 [这里](https://25650abe.nestjs.pages.dev/)。

Nest（NestJS）是一个用于构建高效、可扩展的 [Node.js](https://nodejs.org/) 服务端应用的框架。它采用渐进式 JavaScript，使用 [TypeScript](http://www.typescriptlang.org/) 构建并全面支持 TypeScript（同时仍允许开发者使用纯 JavaScript 编码），融合了 OOP（面向对象编程）、FP（函数式编程）和 FRP（函数响应式编程）的元素。

在底层，Nest 使用了强大的 HTTP 服务器框架如 [Express](https://expressjs.com/)（默认），也可以配置使用 [Fastify](https://github.com/fastify/fastify)！

Nest 在这些常见的 Node.js 框架（Express/Fastify）之上提供了一层抽象，同时也将其 API 直接暴露给开发者。这使得开发者能够自由使用底层平台提供的众多第三方模块。

## 设计哲学

近年来，得益于 Node.js，JavaScript 已成为前后端应用的"通用语言"。这催生了诸如 [Angular](https://angular.dev/)、[React](https://github.com/facebook/react) 和 [Vue](https://github.com/vuejs/vue) 等优秀项目，它们提升了开发效率，使创建快速、可测试且可扩展的前端应用成为可能。然而，尽管 Node（及服务端 JavaScript）有大量优秀的库、工具和辅助程序，但无一能有效解决**架构**这一核心问题。

Nest 提供了一套开箱即用的应用架构，使开发者和团队能够创建高度可测试、可扩展、松耦合且易于维护的应用程序。该架构深受 Angular 启发。

## 安装

### 环境准备

在开始之前，请确保您的开发环境满足以下要求：

- **Node.js**：版本 ≥20（推荐使用最新 LTS 版本）
- **包管理器**：npm（Node.js 自带）、yarn 或 pnpm

:::tip 提示
推荐使用 [nvm](https://github.com/nvm-sh/nvm)（Linux/macOS）或 [nvm-windows](https://github.com/coreybutler/nvm-windows)（Windows）来管理 Node.js 版本，这样可以方便地在不同项目间切换 Node.js 版本。
:::

### 创建项目

要开始使用，您可以使用 [Nest CLI](/cli/overview) 创建项目脚手架，或者[克隆一个初始项目](#alternatives) （两种方式会产生相同的结果）。

要使用 Nest CLI 创建项目脚手架，请运行以下命令。这将创建一个新的项目目录，并用初始的核心 Nest 文件和支持模块填充该目录，为您的项目构建一个常规的基础结构。对于首次使用的用户，建议使用 **Nest CLI** 创建新项目。我们将在[第一步](/overview/first-steps)中继续采用这种方法。

```bash
$ npm i -g @nestjs/cli
$ nest new project-name
```

:::info 提示
要创建一个具有更严格功能集的 TypeScript 项目，请将 `--strict` 标志传递给 `nest new` 命令。
:::

## 替代方案

或者，使用 **Git** 安装 TypeScript 初始项目：

```bash
$ git clone https://github.com/nestjs/typescript-starter.git project
$ cd project
$ npm install
$ npm run start
```

:::info 提示
如果你想克隆没有 git 历史记录的仓库，可以使用 [degit](https://github.com/Rich-Harris/degit)。
:::

打开浏览器并访问 [`http://localhost:3000/`](http://localhost:3000/)。

要安装 JavaScript 版本的入门项目，在上述命令序列中使用 `javascript-starter.git`。

你也可以通过安装核心和支持包从零开始新项目。请注意需要自行设置项目样板文件。至少需要以下依赖项：`@nestjs/core`、`@nestjs/common`、`rxjs` 和 `reflect-metadata`。查看这篇短文了解如何创建完整项目：[5 步从零创建最简 NestJS 应用！](https://dev.to/micalevisk/5-steps-to-create-a-bare-minimum-nestjs-app-from-scratch-5c3b)。

---

## 关于本文档

本中文文档由社区贡献者共同维护。感谢所有[贡献者](/contributors)的努力，让更多中文开发者能够学习和使用 NestJS！

如果你发现文档中的错误或希望改进内容，欢迎：
- 在 [GitHub](https://github.com/nestcn/docs.nestjs.cn) 上提交 Issue
- 直接提交 Pull Request 进行改进
- 加入我们的贡献者行列
