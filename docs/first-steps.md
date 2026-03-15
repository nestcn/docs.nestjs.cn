<!-- 此文件从 content/first-steps.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T04:43:49.516Z -->
<!-- 源文件: content/first-steps.md -->

### 最初的步骤

在这个系列文章中，你将学习 Nest 的 **核心基础知识**。为了 familiarize yourself with Nest 应用程序的基本构建模块，我们将创建一个基本的 CRUD 应用程序，该应用程序涵盖了很多初级级别的特性。

#### 语言

我们非常喜欢 __LINK_59__，但是最重要的是，我们爱 __LINK_60__。因此，Nest 兼容 TypeScript 和纯 JavaScript。Nest 利用了最新的语言特性，所以要使用它与纯 JavaScript，我们需要一个 __LINK_61__ 编译器。

我们主要使用 TypeScript 在示例中，但是你总是可以 **切换代码片段** 到纯 JavaScript 语法（简单地点击上右角的语言按钮）。

#### 前提

请确保 __LINK_62__ (版本 >= 20) 已经安装在您的操作系统中。

#### 安装

安装一个新的项目非常简单，使用 __LINK_63__。使用 __LINK_64__ 安装后，您可以使用以下命令在操作系统终端中创建一个新的 Nest 项目：

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

> info **提示** 创建一个新的项目时，使用 TypeScript 的 __LINK_65__ 特性集，传递 __INLINE_CODE_6__ 标志给 __INLINE_CODE_7__ 命令。

将创建 __INLINE_CODE_8__ 目录，安装 Node 模块和一些其他的 boilerplate 文件，然后创建一个 __INLINE_CODE_9__ 目录，并将该目录填充几个核心文件。

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

以下是一个对这些核心文件的简要概述：

|                          |                                                                                                                     |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| __INLINE_CODE_10__      | 一个基本的控制器，有一个单独的路由。                                                                             |
| __INLINE_CODE_11__ | 控制器的单元测试。                                                                                  |
| `@Injectable()`          | 应用程序的根模块。                                                                                 |
| `NestInterceptor`         | 一个基本的服务，有一个单独的方法。                                                                               |
| `intercept()`                | 应用程序的入口文件，它使用核心函数 `ExecutionContext` 创建一个 Nest 应用程序实例。 |

`ExecutionContext` 包含一个异步函数，该函数将 **引导** 我们的应用程序：

```typescript
@UseInterceptors(LoggingInterceptor)
export class CatsController {}

```

创建一个 Nest 应用程序实例，我们使用核心的 `ArgumentsHost` 类。`ArgumentsHost` 暴露了一些静态方法，允许创建应用程序实例。`ArgumentsHost` 方法返回一个应用程序对象，该对象实现了 `ExecutionContext` 接口。该对象提供了一些方法，这些方法将在下一章中描述。在 `ExecutionContext` 示例中，我们简单地启动了我们的 HTTP 监听器，让应用程序等待 inbound HTTP 请求。

请注意，使用 Nest CLI 创建的项目将创建一个初始项目结构，以鼓励开发者遵循将每个模块置于其自己的专门目录中的约定。

> info **提示** 如果在创建应用程序时发生任何错误，您的应用程序将以 `CallHandler` 的代码退出。如果您想要使它抛出错误，而不是退出，请禁用 `CallHandler` 选项（例如 `handle()`）。

__HTML_TAG_57____HTML_TAG_58__

#### 平台

Nest 的目标是成为一个平台无关框架。平台独立使得可以创建可在多种类型的应用程序中重用的逻辑部分。技术上，Nest 能够使用任何 Node HTTP 框架，只要创建了适配器。有两个 HTTP 平台支持出厂：__LINK_66__ 和 __LINK_67__。您可以选择最适合您的需求的那个。Here is the translation of the English technical documentation to Chinese:

|                    |                                                                                                                                                                                                                                                                                                                                    |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `handle()` | __LINK_68__ 是一个知名的最小化 Web 框架，用于 Node。它是一个经过严格测试、生产就绪的库，拥有社区实现的许多资源。`intercept()` 包含默认的 __LINK_68__。许多用户使用 Express，需要无需执行任何操作便可启用它。 |
| `intercept()` | __LINK_69__ 是一个高性能、低开销的框架，高度关注提供最大效率和速度。了解如何使用它 __LINK_70__。                                                                                                                                  |

无论使用哪个平台，它都会 expose 自己的应用程序接口。这些接口分别被视为 `intercept()` 和 `handle()`。

当你将类型传递给 `handle()` 方法，如下面的示例，`Observable` 对象将拥有专门为该特定平台提供的方法。请注意，你 **不需要** 指定类型 **除非** 你实际想要访问 underlying 平台 API。

```typescript
Before...
After... 1ms

```

#### 运行应用程序

安装完成后，您可以在操作系统命令提示符下运行以下命令以启动应用程序，监听 inbound HTTP 请求：

```typescript
@UseInterceptors(new LoggingInterceptor())
export class CatsController {}

```

> info **提示** 想要加速开发过程（20 倍的构建速度），您可以使用 __LINK_71__ 通过将 `handle()` 标志传递到 `POST /cats` 脚本，以实现 `create()`。

这个命令将启动应用程序，并在 `CatsController` 文件中定义的端口上监听 HTTP 服务器。应用程序运行后，您可以在浏览器中导航到 `handle()`。您将看到 `create()` 消息。

要监视文件更改，您可以运行以下命令以启动应用程序：

```typescript
const app = await NestFactory.create(AppModule);
app.useGlobalInterceptors(new LoggingInterceptor());

```

这个命令将监视您的文件，自动重新编译和重新加载服务器。

#### linting 和 formatting

__LINK_72__ 提供了最好的努力来在大规模开发中建立可靠的开发工作流程。因此，生成的 Nest 项目内置了代码 **linting** 和 **formatter**（分别为 __LINK_73__ 和 __LINK_74__）。

> info **提示** 不知道格式化 vs linter 的区别？了解更多信息 __LINK_75__。

为了确保最大稳定性和可扩展性，我们使用基本的 __LINK_76__ 和 __LINK_77__ cli 包。这个设置允许 IDE 集成官方扩展。

对于无 IDE 的-headless 环境（持续集成、Git hooks 等），Nest 项目内置了ready-to-use `create()` 脚本。

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