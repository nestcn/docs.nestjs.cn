# 第一步

在这一组文章中, 您将学习到 Nest 的**核心基本原理**。为了了解基本的 Nest 应用程序构建模块，我们将构建一个基本的涵盖了大量基础功能的 CRUD 应用程序。

## 语言

我们爱上了 [TypeScript](https://www.tslang.cn)，但最重要的是，我们喜欢 [Node.js](http://nodejs.cn/)。 这就是为什么 Nest 兼容 TypeScript 和**纯 JavaScript**。 Nest 默认基于最新的语言特性，要在 Nest 中使用原生的 JavaScript 框架，我们需要一个 [Babel](https://babeljs.cn) 编译器。

在文档示例中，我们主要使用 TypeScript ，但您始终可以将代码片段**切换**为普通 JavaScript 语法 (只需单击每个片段右上角的 language 按钮即可切换)。

【译者注：中文文档暂不支持 language 切换】

## 先决条件

请确保您的操作系统上安装了 [Node.js](http://nodejs.cn/download/)**（版本 >= 16）**。

**一分钟安装 node.js**
（支持 X86 ARM MIPS 等架构，需要版本管理或者系统为 Raspbian 请直接看 NVM）

 <!-- tabs:start -->

#### ** windows **

1. [点击下载 Node.js](https://npmmirror.com/mirrors/node/v20.15.0/node-v20.15.0-x64.msi)



2. 安装 Node.js

Powershell/CMD 可以打印出这个说明安装成功。（部分系统需要重启后环境变量才生效，如果不会配置环境变量请直接默认安装）

```
$node -v
v20.15.0
$ npm -v
8.x.x
```

#### ** linux **

（NVM 支持 所有 Linux 及 Raspbian ，支持多版本管理，[windows 点击进入](https://github.com/coreybutler/nvm-windows/releases)）    
注：该版本为国内加速版。

```
bash -c "$(curl -fsSL https://gitee.com/RubyKids/nvm-cn/raw/main/install.sh)"

```

如果没 curl ，可以使用 wget 安装

```
bash -c "$(wget -qO- https://gitee.com/RubyKids/nvm-cn/raw/main/install.sh)"

```


使用 NVM 安装 nodejs ：

```
nvm install --lts
```

终端可以打出以下信息说明安装成功：

```
$node -v
v20.x.x
$ npm -v
8.x.x
```

#### ** MacOS **

1. [点击下载 Node.js](https://npmmirror.com/mirrors/node/v16.18.1/node-v16.18.1.pkg)

2. 安装 Node.js

打印出这个说明安装成功。（部分系统需要重启后环境变量才生效）

```
$node -v
v20.x.x
$ npm -v
8.x.x
```


#### ** Snap **


```
sudo snap install node --classic --channel=16
```

（如果提示 snap 不存在，请先安装 snapd）
终端可以打出以下信息说明安装成功：

```
$node -v
v20.x.x
$ npm -v
8.x.x
```

<!-- tabs:end -->

## 起步

使用 [Nest CLI](/8/cli?id=overview) 建立新项目非常简单。 在安装好 npm 后，您可以使用下面命令在您的 OS 终端中创建 Nest 项目：

<!-- tabs:start -->

```
$ npm i -g @nestjs/cli
$ nest new project-name
```

<!-- tabs:end -->

?> 要创建启用 TypeScript `strict`模式的新项目，请将 `--strict` 标志传递给 `nest new` 命令

将会创建 `project-name` 目录， 安装 node_modules 和一些其他样板文件，并将创建一个 `src` 目录，目录中包含几个核心文件。

```
src
 ├── app.controller.spec.ts
 ├── app.controller.ts
 ├── app.module.ts
 ├── app.service.ts
 └── main.ts
```

以下是这些核心文件的简要概述：

|                        |                                                                 |
| ---------------------- | :-------------------------------------------------------------: |
| app.controller.ts      |                 带有单个路由的基本控制器示例。                  |
| app.controller.spec.ts |                  对于基本控制器的单元测试样例                   |
| app.module.ts          |                       应用程序的根模块。                        |
| app.service.ts         |                     带有单个方法的基本服务                      |
| main.ts                | 应用程序入口文件。它使用 `NestFactory` 用来创建 Nest 应用实例。 |

`main.ts` 包含一个异步函数，它负责**引导**我们的应用程序：

> main.ts

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
```

要创建一个 Nest 应用实例，我们使用了 `NestFactory` 核心类。`NestFactory` 暴露了一些静态方法用于创建应用实例。 `create()` 方法返回一个实现 `INestApplication` 接口的对象。该对象提供了一组可用的方法，我们会在后面的章节中对这些方法进行详细描述。 在上面的 `main.ts` 示例中，我们只是启动 HTTP 服务，让应用程序等待 HTTP 请求。

请注意，使用 Nest CLI 搭建的项目会创建一个初始项目结构，我们鼓励开发人员将每个模块保存在自己的专用目录中。

?> 默认情况下，如果在创建应用程序时发生了任何错误，你的应用程序会退出并返回错误代码 `1`。如果你想让它抛出错误，请禁用 `abortOnError` 选项(例如，`NestFactory.create(AppModule, { abortOnError: false })`)。

## 平台

Nest 旨在成为一个与平台无关的框架。 由于平台无关性，我们以创建可重用的逻辑组件，开发人员可以跨越多种不同类型的应用程序来使用这些组件。 从技术上讲，创建了适配器以后，Nest 可以与任何 node.js 的 HTTP 框架一起工作。有两个支持开箱即用的 HTTP 平台：[express](https://expressjs.com/) 和 [fastify](https://www.fastify.io/)。您可以选择最适合您需求的产品。

|                  |                                                                                                                                                                                                                        |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| platform-express | [Express](https://expressjs.com/) 是一个众所周知的 node.js 简约 Web 框架。 这是一个经过实战考验，适用于生产的库，拥有大量社区资源。 默认情况下使用 `@nestjs/platform-express` 包。 许多用户都可以使用 Express ，并且无需采取任何操作即可启用它。 |
| platform-fastify | [Fastify](https://www.fastify.io/) 是一个高性能，低开销的框架，专注于提供最高的效率和速度。 在[这里](8/techniques?id=性能（fastify）)阅读如何使用它。                                                                                             |

无论使用哪种平台，它都会暴露自己的 API。 它们分别是 `NestExpressApplication` 和 `NestFastifyApplication`。

将类型传递给 NestFactory.create() 函数时，如下例所示，app 对象将具有专用于该特定平台的函数。 但是，请注意，除非您确实要访问底层平台 API，否则无需指定类型。

```typescript
const app = await NestFactory.create<NestExpressApplication>(AppModule);
```

## 运行应用程序

安装过程完成后，您可以在系统命令行工具中运行以下命令，以启动应用程序：

```
$ npm run start
```

?> 为了加快开发过程（构建速度快x20倍），您可以使用 [SWC builder](/recipes/swc) 请将 `-b swc` 标志传递给 `start` 脚本, 比如这样 `npm run start -- -b swc`.

此命令启动 HTTP 服务监听定义在 `src/main.ts` 文件中定义的端口号。在应用程序运行后, 打开浏览器并访问 `http://localhost:3000/`。 你应该看到 `Hello world!` 信息。

要监听文件中的更改，您可以运行以下命令来启动应用程序：
```
$ npm run start:dev
```

此命令将监听您的文件，自动重新编译并重新加载服务器。


#### 检查工具和格式化工具

[CLI](/cli/overview) 提供一个可靠的大规模开发工作流框架。因此生成的 Nest 项目默认集成了代码检查工具和格式化工具（分别是 [eslint](https://eslint.org/) 和 [prettier](https://prettier.io/)）。

?>  如果您不确定格式化工具和检查工具的作用区别。Not sure about the role of formatters vs linters? 点击 [这里](https://prettier.io/docs/en/comparison.html) 了解区别。

为了确保最大的稳定性和可扩展性，我们使用了 [`eslint`](https://www.npmjs.com/package/eslint) 和 [`prettier`](https://www.npmjs.com/package/prettier) 的基础工具包。这种预设从设计上允许与官方（指Eslint，Prettier）的扩展进行整洁的IDE集成。

对于不需要IDE的无头环境（如持续集成、Git钩子等），Nest项目自带了开箱即用的 `npm` 脚本。

**[学习资料](https://docs.nestjs.cn/10/awesome?id=%e7%9b%b8%e5%85%b3%e8%b5%84%e6%ba%90)**

### 支持我们

[CloudFlare](https://www.cloudflare.com)      

[vultr](https://www.vultr.com/?ref=7786172-4F)

[Onevps-不限流量](https://www.onevps.com/portal/aff.php?aff=12238)

[BBXY 工具-最低只需5元/月](https://bbxy.cloud/auth/register?code=GPTR)

[JMS 工具](https://justmysocks3.net/members/aff.php?aff=6423)

[【捐赠】](https://gitee.com/notadd/docs.nestjs.cn?donate=true)

### 译者署名

| 用户名 | 头像 | 职能 | 签名 |
|---------|--------------|-------------|---------------|
| [@qianfeiqianlan](https://www.zhihu.com/people/li-yang-yang-94-14) | <img class="avatar-66 rm-style" width='100' src="https://avatars.githubusercontent.com/u/12892568?v=4">                  | 校正 | 全栈开发工程师，专注于效能提升、DevOps、架构设计等领域[@qianfeiqianlan](https://github.com/qianfeiqianlan) at Github |
| [@IOLOII](https://github.com/IOLOII) | <img class="avatar-66 rm-style" width='100' src="https://avatars.githubusercontent.com/u/34856171?v=4">                  | 校正 | 如果编程无法改变未来, 那为什么要成为程序员? [@IOLOII](https://github.com/IOLOII) at Github |

