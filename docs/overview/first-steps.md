### 入门指南

在本系列文章中，您将学习 Nest 的**核心基础**知识。为了熟悉 Nest 应用程序的基本构建模块，我们将构建一个基础的 CRUD 应用，其功能涵盖了许多入门级知识点。

#### 语言

我们热爱 [TypeScript](https://www.typescriptlang.org/)，但最重要的是——我们热爱 [Node.js](https://nodejs.org/en/)。因此 Nest 同时兼容 TypeScript 和纯 JavaScript。Nest 利用了最新的语言特性，所以要在原生 JavaScript 中使用它，我们需要一个 [Babel](https://babeljs.io/) 编译器。

我们提供的示例将主要使用 TypeScript，但您可以随时**切换代码片段**至原生 JavaScript 语法（只需点击每个代码片段右上角的语言切换按钮即可）。

#### 先决条件

请确保您的操作系统已安装 [Node.js](https://nodejs.org)（版本 >= 20）。

#### 设置

使用 [Nest CLI](/cli/overview) 搭建新项目非常简单。安装了 [npm](https://www.npmjs.com/) 后，您可以在操作系统终端中使用以下命令创建新的 Nest 项目：

```bash
$ npm i -g @nestjs/cli
$ nest new project-name
```

> info **提示** 要使用 TypeScript 的[更严格](https://www.typescriptlang.org/tsconfig#strict)功能集创建新项目，请在 `nest new` 命令中传递 `--strict` 标志。

将创建 `project-name` 目录，安装 node modules 和一些其他样板文件，并创建和填充 `src/` 目录，其中包含几个核心文件。

<div class="file-tree">
  <div class="item">src</div>
  <div class="children">
    <div class="item">app.controller.spec.ts</div>
    <div class="item">app.controller.ts</div>
    <div class="item">app.module.ts</div>
    <div class="item">app.service.ts</div>
    <div class="item">main.ts</div>
  </div>
</div>

以下是这些核心文件的简要概述：

|                          |                                                                                                                     |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| `app.controller.ts`      | 具有单个路由的基本控制器。                                                                             |
| `app.controller.spec.ts` | 控制器的单元测试。                                                                                  |
| `app.module.ts`          | 应用程序的根模块。                                                                                 |
| `app.service.ts`         | 具有单个方法的基本服务。                                                                               |
| `main.ts`                | 应用程序的入口文件，它使用核心函数 `NestFactory` 来创建 Nest 应用程序实例。 |

`main.ts` 包含一个异步函数，它将**引导**我们的应用程序：

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

要创建 Nest 应用程序实例，我们使用核心的 `NestFactory` 类。`NestFactory` 暴露了几个静态方法，允许创建应用程序实例。`create()` 方法返回一个应用程序对象，该对象实现了 `INestApplication` 接口。该对象提供了一组方法，这些方法将在后续章节中描述。在上面的 `main.ts` 示例中，我们只是启动了 HTTP 监听器，这让应用程序等待入站 HTTP 请求。

请注意，使用 Nest CLI 搭建的项目会创建一个初始项目结构，鼓励开发者遵循将每个模块保存在其自己的专用目录中的约定。

> info **提示** 默认情况下，如果在创建应用程序时发生任何错误，您的应用程序将以代码 `1` 退出。如果您希望它抛出错误，请禁用 `abortOnError` 选项（例如，`NestFactory.create(AppModule, { abortOnError: false })`）。

#### 平台

Nest 旨在成为一个平台无关的框架。平台独立性使得创建可重用的逻辑部分成为可能，开发者可以在几种不同类型的应用程序中利用这些部分。从技术上讲，一旦创建了适配器，Nest 就能够与任何 Node HTTP 框架一起工作。开箱即用支持两个 HTTP 平台：[express](https://expressjs.com/) 和 [fastify](https://www.fastify.io)。您可以选择最适合您需求的平台。

|                    |                                                                                                                                                                                                                                                                                                                                    |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `platform-express` | [Express](https://expressjs.com/) 是一个著名的 node 极简主义 web 框架。它是一个经过实战测试、可用于生产的库，拥有大量由社区实现的资源。默认使用 `@nestjs/platform-express` 包。许多用户都能很好地使用 Express，无需采取任何行动来启用它。 |
| `platform-fastify` | [Fastify](https://www.fastify.io/) 是一个高性能、低开销的框架，高度专注于提供最大的效率和速度。阅读如何使用它[这里](/techniques/performance)。                                                                                                                                  |

无论使用哪个平台，它都会暴露自己的应用程序接口。这些分别被看作 `NestExpressApplication` 和 `NestFastifyApplication`。

当您将类型传递给 `NestFactory.create()` 方法时，如下面的示例所示，`app` 对象将具有专门用于该特定平台的方法。但是请注意，除非您实际想要访问底层平台 API，否则您不**需要**指定类型。

```typescript
const app = await NestFactory.create<NestExpressApplication>(AppModule);
```

#### 运行应用程序

安装过程完成后，您可以在操作系统命令提示符下运行以下命令来启动监听入站 HTTP 请求的应用程序：

```bash
$ npm run start
```

> info **提示** 为了加快开发过程（构建速度快 20 倍），您可以通过在 `start` 脚本中传递 `-b swc` 标志来使用 [SWC 构建器](/recipes/swc)，如下所示 `npm run start -- -b swc`。

此命令启动应用程序，HTTP 服务器监听 `src/main.ts` 文件中定义的端口。应用程序运行后，打开浏览器并导航到 `http://localhost:3000/`。您应该看到 `Hello World!` 消息。

要监视文件中的更改，您可以运行以下命令来启动应用程序：

```bash
$ npm run start:dev
```

此命令将监视您的文件，自动重新编译并重新加载服务器。

#### 代码检查与格式化

[CLI](/cli/overview) 致力于为大规模开发提供可靠的工作流脚手架。因此，生成的 Nest 项目预装了代码**检查工具**和**格式化工具**（分别是 [eslint](https://eslint.org/) 和 [prettier](https://prettier.io/)）。

> info **提示** 不确定格式化工具与代码检查工具的区别？请查看[此处](https://prettier.io/docs/en/comparison.html)了解。

为了确保最大的稳定性和可扩展性，我们使用基础的 [`eslint`](https://www.npmjs.com/package/eslint) 和 [`prettier`](https://www.npmjs.com/package/prettier) cli 包。这种设置允许与官方扩展进行良好的 IDE 集成。

对于不依赖 IDE 的无头环境（持续集成、Git hooks 等），Nest 项目附带了可立即使用的 `npm` 脚本：

```bash
# 使用 eslint 进行代码检查和自动修复
$ npm run lint
```

# 使用 prettier 进行代码格式化
$ npm run format
```

1. **访问官网下载**：前往 [Node.js 官网](https://nodejs.org/) 下载最新的 LTS（长期支持）版本
2. **使用包管理器**：
   - **Windows**: 使用 [Chocolatey](https://chocolatey.org/) 或 [Scoop](https://scoop.sh/)
   - **macOS**: 使用 [Homebrew](https://brew.sh/) 或 [MacPorts](https://www.macports.org/)
   - **Linux**: 使用系统包管理器（如 `apt`、`yum`、`dnf` 等）
3. **使用版本管理器**：
   - [nvm](https://github.com/nvm-sh/nvm)（Linux/macOS）
   - [nvm-windows](https://github.com/coreybutler/nvm-windows)（Windows）
   - [fnm](https://github.com/Schniz/fnm)（跨平台）

**验证安装：**

安装完成后，可以通过以下命令验证 Node.js 和 npm 是否正确安装：

```bash
$ node --version
$ npm --version
```

确保 Node.js 版本为 20 或更高版本，npm 版本为 9 或更高版本。

## 安装

使用 [Nest CLI](/cli/overview) 创建新项目非常简单。安装 [npm](https://www.npmjs.com/) 后，您可以在操作系统终端中运行以下命令来创建新的 Nest 项目：

```bash
$ npm i -g @nestjs/cli
$ nest new project-name
```

> **注意** 要使用 TypeScript 更严格的特性集创建新项目，请向 `nest new` 命令传递 `--strict` 标志。

### 安装选项

创建新项目时，Nest CLI 会询问您一些配置选项：

1. **包管理器选择**：可以选择 npm、yarn、或 pnpm
2. **项目描述**：为您的项目添加描述
3. **Git 初始化**：是否初始化 Git 仓库

**使用不同包管理器：**

```bash
# 使用 yarn
$ nest new project-name --package-manager yarn
```

# 使用 pnpm
$ nest new project-name --package-manager pnpm

# 跳过包安装（手动安装依赖）
$ nest new project-name --skip-install
```

**其他有用的选项：**

```bash
# 使用严格模式 TypeScript
$ nest new project-name --strict
```

# 指定特定目录
$ nest new project-name --directory my-app

# 跳过 Git 初始化
$ nest new project-name --skip-git
```

### 故障排除

如果遇到安装问题，请尝试以下解决方案：

1. **权限问题（Linux/macOS）**：
   ```bash
   # 使用 sudo（不推荐）
   $ sudo npm i -g @nestjs/cli
   
   # 或者配置 npm 全局目录（推荐）
   $ mkdir ~/.npm-global
   $ npm config set prefix '~/.npm-global'
   $ echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.profile
   $ source ~/.profile
   ```
```

2. **网络问题**：
   ```bash
   # 使用淘宝镜像
   $ npm config set registry https://registry.npmmirror.com
   
   # 或者使用 cnpm
   $ npm install -g cnpm --registry=https://registry.npmmirror.com
   $ cnpm i -g @nestjs/cli
   ```
```

3. **代理设置**：
   ```bash
   $ npm config set proxy http://proxy.company.com:8080
   $ npm config set https-proxy http://proxy.company.com:8080
   ```
```

将创建 `project-name` 目录，安装 node 模块和一些其他样板文件，并创建 `src/` 目录，其中会生成若干核心文件。

```
src/
├── app.controller.spec.ts
├── app.controller.ts
├── app.module.ts
├── app.service.ts
└── main.ts
```


以下是这些核心文件的简要概述：

|                        |                                                                   |
| ---------------------- | ----------------------------------------------------------------- |
| app.controller.ts      | 一个包含单一路由的基础控制器。                                    |
| app.controller.spec.ts | 该控制器的单元测试。                                              |
| app.module.ts          | 应用程序的根模块。                                                |
| app.service.ts         | 一个具有单一方法的基础服务。                                      |
| main.ts                | 应用程序的入口文件，使用核心函数 NestFactory 创建 Nest 应用实例。 |

`main.ts` 包含一个异步函数，该函数将**引导启动**我们的应用程序：

```typescript title="main"
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

> info **提示** 默认情况下，如果在创建应用程序时发生任何错误，你的应用将以代码 `1` 退出。若希望改为抛出错误，请禁用 `abortOnError` 选项（例如， `NestFactory.create(AppModule, { abortOnError: false })` ）。

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
```

# Format with prettier
$ npm run format
```

## 开发技巧

### 1. 使用开发工具

**推荐的 VSCode 扩展：**
- [NestJS Files](https://marketplace.visualstudio.com/items?itemName=AbstractAPI.vscode-nestjs-generator) - 快速生成 NestJS 文件
- [TypeScript Importer](https://marketplace.visualstudio.com/items?itemName=pmneo.tsimporter) - 自动导入 TypeScript 模块
- [Auto Import - ES6, TS, JSX, TSX](https://marketplace.visualstudio.com/items?itemName=steoates.autoimport) - 智能导入
- [Bracket Pair Colorizer](https://marketplace.visualstudio.com/items?itemName=CoenraadS.bracket-pair-colorizer) - 括号配对着色

**配置 debugger：**

在 `.vscode/launch.json` 中添加调试配置：

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Nest Framework",
      "type": "node",
      "request": "launch",
      "args": ["${workspaceFolder}/src/main.ts"],
      "runtimeArgs": ["--nolazy", "-r", "ts-node/register"],
      "sourceMaps": true,
      "cwd": "${workspaceFolder}",
      "protocol": "inspector",
      "env": {
        "NODE_ENV": "development"
      }
    }
  ]
}
```

### 2. 有用的开发命令

```bash
# 生成新模块
$ nest generate module cats
$ nest g mo cats  # 简写
```

# 生成控制器
$ nest generate controller cats
$ nest g co cats

# 生成服务
$ nest generate service cats
$ nest g s cats

# 生成完整的 CRUD 资源
$ nest generate resource cats

# 查看所有可用的生成器
$ nest generate --help
```

### 3. 环境配置

创建 `.env` 文件来管理环境变量：

```bash
# .env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/mydb
JWT_SECRET=your-secret-key
```

在 `main.ts` 中使用环境变量：

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 从环境变量读取端口，默认 3000
  const port = process.env.PORT || 3000;
  
  await app.listen(port);
  console.log(`应用程序运行在 http://localhost:${port}`);
}
bootstrap();
```

## 下一步

现在您已经完成了基本设置，可以开始探索 NestJS 的核心概念：

1. **[控制器 (Controllers)](/overview/controllers)** - 学习如何处理传入请求
2. **[提供者 (Providers)](/overview/providers)** - 了解依赖注入和服务
3. **[模块 (Modules)](/overview/modules)** - 组织应用程序结构
4. **[中间件 (Middleware)](/overview/middleware)** - 请求/响应处理
5. **[异常过滤器 (Exception Filters)](/overview/exception-filters)** - 错误处理
6. **[管道 (Pipes)](/overview/pipes)** - 数据验证和转换
7. **[守卫 (Guards)](/overview/guards)** - 认证和授权
8. **[拦截器 (Interceptors)](/overview/interceptors)** - 请求/响应拦截

### 实用资源

- **[官方示例](https://github.com/nestjs/nest/tree/master/sample)** - 各种功能的示例代码
- **[NestJS 教程](../overview/first-steps)** - 官方教程
- **[社区资源](/awesome)** - 社区贡献的资源和工具
- **[常见问题](/faq)** - 常见问题解答

开始构建令人惊叹的 Node.js 应用程序吧！🚀
