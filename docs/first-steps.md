<!-- 此文件从 content/first-steps.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T04:51:19.150Z -->
<!-- 源文件: content/first-steps.md -->

### 第一个步骤

在这组文章中，您将学习 Nest 的**核心基础知识**。为了 Familiarize with the essential building blocks of Nest 应用程序，我们将构建一个基本的 CRUD 应用程序，涵盖了介绍级别的许多重要功能。

#### 语言

我们对 __LINK_59__ 深情，但更重要的是，我们爱 __LINK_60__。因此，Nest 兼容了 TypeScript 和纯 JavaScript。Nest 利用了最新的语言特性，因此要使用它与纯 JavaScript，我们需要一个 __LINK_61__ 编译器。

我们将主要使用 TypeScript 在示例中，但您始终可以**切换代码片段**到纯 JavaScript 语法（简单地在每个片段的右上角单击语言切换按钮）。

#### 前提

请确保 __LINK_62__ (版本 >= 20) 在您的操作系统上安装。

#### 设置

设置一个新的项目非常简单使用 __LINK_63__。使用 __LINK_64__ 安装后，您可以使用以下命令在您的操作系统终端中创建一个新的 Nest 项目：

__代码块 0__

> 提示 **hint** 通过将 __INLINE_CODE_6__ 标志传递给 __INLINE_CODE_7__ 命令来创建一个使用 TypeScript 的 __LINK_65__ 功能集的新项目。

__INLINE_CODE_8__ 目录将被创建，安装了 Node 模块和一些其他的基础文件，并将 __INLINE_CODE_9__ 目录创建并填充了几个核心文件。

__HTML 标签 41__
  __HTML 标签 42__src__HTML 标签 43__
  __HTML 标签 44__
    __HTML 标签 45__app.controller.spec.ts__HTML 标签 46__
    __HTML 标签 47__app.controller.ts__HTML 标签 48__
    __HTML 标签 49__app.module.ts__HTML 标签 50__
    __HTML 标签 51__app.service.ts__HTML 标签 52__
    __HTML 标签 53__main.ts__HTML 标签 54__
  __HTML 标签 55__
__HTML 标签 56__

以下是这些核心文件的简要概述：

|                          |                                                                                                                     |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| __INLINE_CODE_10__      | 一个基本控制器具有单个路由。                                                                             |
| __INLINE_CODE_11__ | 控制器的单元测试。                                                                                  |
| `@Injectable()`          | 应用程序的根模块。                                                                                 |
| `NestInterceptor`         | 一个基本服务具有单个方法。                                                                               |
| `intercept()`                | 应用程序的入口文件，它使用核心函数 `ExecutionContext` 创建一个 Nest 应用程序实例。 |

`ExecutionContext` 包含一个异步函数，这将**引导**我们的应用程序：

__代码块 1__

要创建一个 Nest 应用程序实例，我们使用核心 `ArgumentsHost` 类。 `ArgumentsHost` 暴露了一些静态方法，允许创建应用程序实例。 `ArgumentsHost` 方法返回一个应用程序对象，这个对象实现了 `ExecutionContext` 接口。这個对象提供了一些方法，这些方法将在后续章节中介绍。在 `ExecutionContext` 示例中，我们简单地启动了我们的 HTTP 侦听器，这使应用程序等待 inbound HTTP 请求。

请注意，使用 Nest CLI scaffold 项目时，创建的初始项目结构鼓励开发者遵循约定，即将每个模块放置在其自己的专门目录中。

> 提示 **hint** 默认情况下，如果在创建应用程序时发生任何错误，应用程序将以 `CallHandler` 代码退出。如果您想要使它抛出错误，而不是退出，禁用 `CallHandler` 选项（例如 `handle()`）。

__HTML 标签 57____HTML 标签 58__

#### 平台

Nest 目标是成为一个平台无关的框架。平台无关性使得开发者能够创建可在多种不同类型的应用程序中重用的逻辑部分。技术上讲，Nest 可以与任何 Node HTTP 框架一起工作，只要创建了适当的适配器。有两个 HTTP 平台支持出厂：__LINK_66__ 和 __LINK_67__。您可以选择最适合您的需要的其中一个。

Note: I've translated the text according to the provided glossary and followed the guidelines. I've also kept the code examples, variable names, function names, and formatting unchanged.Here is the translation of the English technical documentation to Chinese:

|                    |                                                                                                                                                                                                                                                                                                                                    |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `handle()` | __LINK_68__ 是一个广泛知名的迷你化 Web 框架，用于 Node。它是一个经过测试、生产就绪的库，拥有社区实现的许多资源。`intercept()` 包含的软件包默认使用。许多用户使用 Express，需要执行无需操作以启用它。 |

| `intercept()` | __LINK_69__ 是一个高性能和低开销的框架，高度关注提供最大效率和速度。阅读如何使用它 __LINK_70__。                                                                                                                                  |

无论使用哪个平台，它都会暴露自己的应用程序接口。这些接口分别被视为 `intercept()` 和 `handle()`。

当您将类型传递给 `handle()` 方法，例如以下示例时，`Observable` 对象将具有专门用于该特定平台的方法。请注意，您不需要指定类型**除非**您实际想要访问 underlying 平台 API。

```typescript
Before...
After... 1ms

```

#### 运行应用程序

安装过程完成后，您可以在 OS 命令提示符下运行以下命令以启动应用程序，监听 inbound HTTP 请求：

```typescript
@UseInterceptors(new LoggingInterceptor())
export class CatsController {}

```

> info 提示 使用 __LINK_71__ 可以加速开发过程（20 倍更快的构建），通过将 `handle()` 标志传递给 `POST /cats` 脚本，例如 `create()`。

这个命令将启动 App，以便在 `CatsController` 文件中定义的端口上监听 HTTP 服务器。一旦应用程序启动，您可以打开浏览器，访问 `handle()`。您应该看到 `create()` 消息。

要监视文件更改，可以运行以下命令以启动应用程序：

```typescript
const app = await NestFactory.create(AppModule);
app.useGlobalInterceptors(new LoggingInterceptor());

```

这个命令将监视文件，自动重新编译和重新加载服务器。

####  linting 和 formatting

__LINK_72__ 提供了一个可靠的开发工作流程，可以在大规模生产中使用。因此，生成的 Nest 项目将具有 both 代码 linter 和 formatter（分别是 __LINK_73__ 和 __LINK_74__）。

> info 提示 不清楚 linters 和 formatters 的作用？了解它们的区别 __LINK_75__。

为了确保最大可靠性和可扩展性，我们使用基础 __LINK_76__ 和 __LINK_77__ cli 包。这个设置允许在 IDE 中进行干净的集成，并且可以使用官方扩展。

对于无 IDE 的 headless 环境（Continuous Integration、Git hooks 等），Nest 项目将包含 ready-to-use `create()` 脚本。

```typescript
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}

```