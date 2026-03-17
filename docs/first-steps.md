<!-- 此文件从 content/first-steps.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:02:52.426Z -->
<!-- 源文件: content/first-steps.md -->

### 首步

在这系列文章中，您将学习 Nest 的 **核心基础**。为了了解 Nest 应用程序的基本构建块，我们将构建一个基本的 CRUD 应用程序，涵盖了大量的入门级内容。

#### 语言

我们对 __LINK_59__ 深深地迷恋，但更重要的是，我们对 __LINK_60__ 深深地迷恋。因此，Nest 兼容 TypeScript 和纯 JavaScript。Nest 利用了最新的语言特性，因此使用 vanilla JavaScript 需要一个 __LINK_61__ 编译器。

我们主要使用 TypeScript 在示例中，但您总是可以 **切换代码片段** 到 vanilla JavaScript 语法（简单地单击上右上角的语言按钮）。

#### 前提

请确保 __LINK_62__ (版本 >= 20) 已安装在您的操作系统上。

#### 设置

设置一个新的项目非常简单使用 __LINK_63__。使用 __LINK_64__ 安装后，您可以使用以下命令在您的 OS 终端中创建一个新的 Nest 项目：

```typescript
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    console.log('Before...');

    const now = Date.now();
    return next
      .handle()
      .pipe(
        tap(() => console.log(`After... ${Date.now() - now}ms`)),
      );
  }
}

@Injectable()
export class LoggingInterceptor {
  intercept(context, next) {
    console.log('Before...');

    const now = Date.now();
    return next
      .handle()
      .pipe(
        tap(() => console.log(`After... ${Date.now() - now}ms`)),
      );
  }
}

```

> 提示 **Hint** 创建一个新的项目使用 TypeScript 的 __LINK_65__ 功能集，传递 __INLINE_CODE_6__ 标志到 __INLINE_CODE_7__ 命令。

将创建 __INLINE_CODE_8__ 目录，安装 Node 模块和一些其他 boilerplate 文件，并创建一个 __INLINE_CODE_9__ 目录，populate with several core files。

__HTML_TAG_41__
  __HTML_TAG_42__src__HTML_TAG_43__
  __HTML_TAG_44__
    __HTML_TAG_45__app.controller.spec.ts__HTML_TAG_46__
    __HTML_TAG_47__app.controller.ts__HTML_TAG_48__
    __HTML_TAG_49__app.module.ts__HTML_TAG_50__
    __HTML_TAG_51__app.service.ts__HTML_TAG_52__
    __HTML_TAG_53__main.ts__HTML_TAG_54__
  __HTML_TAG_55__
__HTML_TAG_56__

以下是这些 core 文件的简要概述：

|                          |                                                                                                                     |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| __INLINE_CODE_10__      | 一个基本的控制器，具有单个路由。                                                                             |
| __INLINE_CODE_11__ | 控制器的单元测试。                                                                                  |
| `@Injectable()`          | 应用程序的根模块。                                                                                 |
| `NestInterceptor`         | 一个基本的服务，具有单个方法。                                                                               |
| `intercept()`                | 应用程序的入口文件，该文件使用 core 函数 `ExecutionContext` 创建一个 Nest 应用程序实例。 |

`ExecutionContext` 包含一个异步函数，该函数将 **引导** 我们的应用程序：

```typescript
@UseInterceptors(LoggingInterceptor)
export class CatsController {}

```

要创建一个 Nest 应用程序实例，我们使用 core `ArgumentsHost` 类。`ArgumentsHost` exposing several static methods that allow creating an application instance。`ArgumentsHost` 方法返回一个应用程序对象，该对象实现了 `ExecutionContext` 接口。该对象提供了一些方法，这些方法在下一章中将被描述。在 `ExecutionContext` 示例中，我们简单地启动了我们的 HTTP 监听器，让应用程序等待 inbound HTTP 请求。

请注意，使用 Nest CLI 创建的项目将创建一个初始项目结构，鼓励开发者遵循将每个模块都放在其自己的专门目录中的约定。

> 提示 **Hint** 默认情况下，如果创建应用程序时发生任何错误，您的应用程序将退出并返回代码 `CallHandler`。如果您想使其抛出错误而不是退出，禁用 `CallHandler` 选项（例如 `handle()`）。

__HTML_TAG_57____HTML_TAG_58__

#### 平台

Nest 目的就是创建一个平台无关的框架。平台无关性使得开发者可以创建可重用的逻辑部分，并在多个不同类型的应用程序中使用。技术上，Nest 可以与任何 Node HTTP 框架一起工作，只要创建了适配器。目前支持两个 HTTP 平台：__LINK_66__ 和 __LINK_67__。您可以选择最适合您需求的那个。Here is the translation of the provided English technical documentation to Chinese:

|                    |                                                                                                                                                                                                                                                                                                                                    |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `handle()` | __LINK_68__ 是一个知名的最小化 Web 框架，用于 Node。它是一个经过战斗测试、生产就绪的库，具有社区实现的许多资源。`intercept()` 包含在默认情况下。许多用户已经使用 Express，需要无需任何操作来启用它。 |
| `intercept()` | __LINK_69__ 是一个高性能和低开销的框架，高度关注提供最大效率和速度。了解如何使用它 __LINK_70__。                                                                                                                                  |

无论使用哪个平台，都是公开自己的应用程序接口。这些分别被看作 `intercept()` 和 `handle()`。

当你将类型传递给 `handle()` 方法，例如以下所示，`Observable` 对象将拥有专门为该特定平台提供的方法。请注意，你不需要指定类型 **除非** 你实际想要访问 underlying platform API。

```typescript
Before...
After... 1ms

```

#### 运行应用程序

安装过程完成后，您可以在操作系统命令行中输入以下命令来启动应用程序，监听 inbound HTTP 请求：

```typescript
@UseInterceptors(new LoggingInterceptor())
export class CatsController {}

```

> 提示 为了加速开发过程（20倍的构建速度），您可以使用 __LINK_71__ 通过将 `handle()` flag 传递给 `POST /cats` 脚本，例如 `create()`。

这个命令启动 app，并在 `CatsController` 文件中定义的端口上监听 HTTP 服务器。应用程序运行后，请打开浏览器并导航到 `handle()`。您应该看到 `create()` 消息。

要监视文件变化，您可以运行以下命令来启动应用程序：

```typescript
const app = await NestFactory.create(AppModule);
app.useGlobalInterceptors(new LoggingInterceptor());

```

这个命令将监视您的文件，自动重新编译和重新加载服务器。

#### linting 和 formatting

__LINK_72__ 提供了尽力创建可靠的开发工作流程的功能。因此，生成的 Nest 项目将带有 both 代码 **lint** 和 **formatter** 预安装（分别是 __LINK_73__ 和 __LINK_74__）。

> 提示 不知道 linter 和 formatter 的区别？了解差异 __LINK_75__。

为了确保最大程度的稳定性和可扩展性，我们使用基本的 __LINK_76__ 和 __LINK_77__ cli 包。这个设置允许 IDE 集成的官方扩展。

对于没有 IDE 的 headless 环境（持续集成、Git hooks 等），Nest 项目将带有 ready-to-use `create()` 脚本。

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