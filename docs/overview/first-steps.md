# 入门指南

在本系列文章中，您将学习 Nest 的**核心基础**知识。为了熟悉 Nest 应用程序的基本构建模块，我们将构建一个基础的 CRUD 应用，其功能涵盖了许多入门级知识点。

## 语言特性

我们热爱 [TypeScript](https://www.typescriptlang.org/)，但最重要的是——我们热爱 [Node.js](https://nodejs.org/en/)。因此 Nest 同时兼容 TypeScript 和纯 JavaScript。Nest 利用了最新的语言特性，所以要在原生 JavaScript 中使用它，我们需要一个 [Babel](https://babeljs.io/) 编译器。

我们提供的示例将主要使用 TypeScript，但您可以随时**切换代码片段**至原生 JavaScript 语法（只需点击每个代码片段右上角的语言切换按钮即可）。

## 先决条件

请确保您的操作系统已安装 [Node.js](https://nodejs.org)（版本 ≥20）。

## 安装

使用 [Nest CLI](/cli/overview) 创建新项目非常简单。安装 [npm](https://www.npmjs.com/) 后，您可以在操作系统终端中运行以下命令来创建新的 Nest 项目：

```bash
$ npm i -g @nestjs/cli
$ nest new project-name
```

> info **注意** 要使用 TypeScript 更严格的特性集创建新项目，请向 `nest new` 命令传递 `--strict` 标志。

将创建 `project-name` 目录，安装 node 模块和一些其他样板文件，并创建 `src/` 目录，其中会生成若干核心文件。

src

app.controller.spec.ts

app.controller.ts

app.module.ts

app.service.ts

main.ts

以下是这些核心文件的简要概述：

|                        |                                                                   |
| ---------------------- | ----------------------------------------------------------------- |
| app.controller.ts      | 一个包含单一路由的基础控制器。                                    |
| app.controller.spec.ts | 该控制器的单元测试。                                              |
| app.module.ts          | 应用程序的根模块。                                                |
| app.service.ts         | 一个具有单一方法的基础服务。                                      |
| main.ts                | 应用程序的入口文件，使用核心函数 NestFactory 创建 Nest 应用实例。 |

`main.ts` 包含一个异步函数，该函数将**引导启动**我们的应用程序：

```typescript
@@filename(main)

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
@@switch
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

要创建 Nest 应用实例，我们使用核心类 `NestFactory`。`NestFactory` 公开了一些静态方法用于创建应用实例。`create()` 方法返回一个符合 `INestApplication` 接口的应用对象。该对象提供了一系列方法，我们将在后续章节中详细介绍。在上面 `main.ts` 的例子中，我们只是启动了 HTTP 监听器，让应用程序等待传入的 HTTP 请求。

需要注意的是，使用 Nest CLI 搭建的项目会创建一个初始项目结构，该结构鼓励开发者遵守将每个模块保存在其专属目录中的约定。

> info **提示** 默认情况下，如果在创建应用程序时发生任何错误，你的应用将以代码 `1` 退出。若希望改为抛出错误，请禁用 `abortOnError` 选项（例如， `NestFactory.create(AppModule, {{ '{' }} abortOnError: false {{ '}' }})` ）。

#### 平台

Nest 旨在成为一个与平台无关的框架。这种平台独立性使得创建可重用的逻辑部件成为可能，开发者可以在多种不同类型的应用中充分利用这些部件。从技术上讲，一旦创建了适配器，Nest 就能与任何 Node HTTP 框架协同工作。目前内置支持两种 HTTP 平台：[express](https://expressjs.com/) 和 [fastify](https://www.fastify.io)，你可以根据需求选择合适的平台。

|                  |                                                                                                                                                                                                                             |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| platform-express | Express 是一个著名的 Node.js 极简主义 Web 框架。这是一个经过实战检验、可用于生产环境的库，社区已为其实现了大量资源。默认情况下使用的是 @nestjs/platform-express 包。许多用户使用 Express 就能获得良好服务，无需额外启用它。 |
| platform-fastify | Fastify 是一个高性能、低开销的框架，高度专注于提供最高效率和速度。了解如何使用它请点击此处 。                                                                                                                               |

无论使用哪个平台，都会暴露其自身的应用接口。它们分别体现为 `NestExpressApplication` 和 `NestFastifyApplication`。

当您像下面示例中那样向 `NestFactory.create()` 方法传递类型时，`app` 对象将拥有该特定平台专属的方法可用。但请注意，除非您确实需要访问底层平台 API，否则**不需要**指定类型 **。**

```typescript
const app = await NestFactory.create<NestExpressApplication>(AppModule);
```

#### 运行应用程序

安装过程完成后，您可以在操作系统命令提示符下运行以下命令，启动应用程序监听入站 HTTP 请求：

```bash
$ npm run start
```

> info **注意** 为了加速开发流程（构建速度提升 20 倍），您可以使用 [SWC 构建器](/recipes/swc) ，方法是在 `start` 脚本后添加 `-b swc` 参数，如下所示：`npm run start -- -b swc`。

该命令会启动应用程序，HTTP 服务器将监听 `src/main.ts` 文件中定义的端口。应用运行后，打开浏览器访问 `http://localhost:3000/`，您应该能看到 `Hello World!` 消息。

要监听文件的变化，您可以运行以下命令启动应用程序：

```bash
$ npm run start:dev
```

该命令将监视您的文件，自动重新编译并重新加载服务器。

#### 代码检查与格式化

[CLI](/cli/overview) 致力于为大规模开发提供可靠的工作流脚手架。因此，生成的 Nest 项目已预装了代码 **检查工具** 和 **格式化工具** （分别是 [eslint](https://eslint.org/) 和 [prettier](https://prettier.io/)）。

> info **提示** Not sure about the role of formatters vs linters? Learn the difference [here](https://prettier.io/docs/en/comparison.html). [重试    错误原因](<javascript:void(0)>)

To ensure maximum stability and extensibility, we use the base [`eslint`](https://www.npmjs.com/package/eslint) and [`prettier`](https://www.npmjs.com/package/prettier) cli packages. This setup allows neat IDE integration with official extensions by design. [重试    错误原因](<javascript:void(0)>)

For headless environments where an IDE is not relevant (Continuous Integration, Git hooks, etc.) a Nest project comes with ready-to-use `npm` scripts. [重试    错误原因](<javascript:void(0)>)

```bash
# Lint and autofix with eslint
$ npm run lint

# Format with prettier
$ npm run format
```
