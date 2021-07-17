## 第一步

在这一组文章中, 您将学习到 Nest 的**核心基本原理**。为了了解基本的 Nest 应用程序构建模块，我们将构建一个基本的涵盖了大量基础功能的 CRUD 应用程序。

## 语言

我们爱上了 [TypeScript](https://www.tslang.cn)，但最重要的是，我们喜欢 [Node.js](http://nodejs.cn/)。 这就是为什么 Nest 兼容 TypeScript 和**纯 JavaScript**。 Nest 默认基于最新的语言特性，要在 Nest 中使用原生的 JavaScript 框架，我们需要一个 [Babel](https://babeljs.cn) 编译器。

在文档示例中，我们主要使用 TypeScript ，但您始终可以将代码片段**切换**为普通 JavaScript 语法 (只需单击每个片段右上角的 language 按钮即可切换)。

【译者注：中文文档暂不支持 language 切换】

## 先决条件

请确保您的操作系统上安装了 [Node.js](http://nodejs.cn/download/)**（>= 10.13.0, v13 版本除外）**。

## 起步

使用 [Nest CLI](/8/cli?id=overview) 建立新项目非常简单。 在安装好 npm 后，您可以使用下面命令在您的 OS 终端中创建 Nest 项目：

<!-- tabs:start -->

```
$ npm i -g @nestjs/cli
$ nest new project-name
```

<!-- tabs:end -->

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

```typescript
/* main.ts */
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

## 平台

Nest 旨在成为一个与平台无关的框架。 由于平台无关性，我们以创建可重用的逻辑组件，开发人员可以跨越多种不同类型的应用程序来使用这些组件。 从技术上讲，创建了适配器以后，Nest 可以与任何 node.js 的 HTTP 框架一起工作。有两个支持开箱即用的 HTTP 平台：[express](https://expressjs.com/) 和 [fastfy](https://www.fastify.io/)。您可以选择最适合您需求的产品。

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

此命令启动 HTTP 服务监听定义在 `src/main.ts` 文件中定义的端口号。在应用程序运行后, 打开浏览器并访问 `http://localhost:3000/`。 你应该看到 `Hello world!` 信息。

**[学习资料](https://docs.nestjs.cn/8/awesome?id=%e7%9b%b8%e5%85%b3%e8%b5%84%e6%ba%90)**

### 支持我们

[当前网站托管在：vultr](https://www.vultr.com/?ref=7786172-4F)

[Onevps-不限流量](https://www.onevps.com/portal/aff.php?aff=12238)

[JMS](https://justmysocks3.net/members/aff.php?aff=6423)

[【捐赠】](https://gitee.com/notadd/docs.nestjs.cn?donate=true)

### 译者署名

| 用户名 | 头像 | 职能 | 签名 |
|---------|--------------|-------------|---------------|
| [@qianfeiqianlan](https://www.zhihu.com/people/li-yang-yang-94-14) | <img class="avatar-66 rm-style" width='100' src="https://avatars.githubusercontent.com/u/12892568?v=4">                  | 校正 | 全栈开发工程师，专注于效能提升、DevOps、架构设计等领域[@qianfeiqianlan](https://github.com/qianfeiqianlan) at Github |

