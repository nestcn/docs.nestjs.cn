<!-- 此文件从 content/first-steps.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:24:59.501Z -->
<!-- 源文件: content/first-steps.md -->

### 首步

在这篇文章组中，你将了解 Nest 的 **核心基础知识**。为了了解 Nest 应用程序的基本 building blocks，我们将创建一个基本的 CRUD 应用程序，涵盖了大量的入门级内容。

#### 语言

我们对 __LINK_59__深爱，但以上一切 - 我们最爱 __LINK_60__。因此，Nest 是兼容 TypeScript 和纯 JavaScript 的。Nest 利用了最新的语言特性，所以使用 vanilla JavaScript，我们需要一个 __LINK_61__ 编译器。

我们主要使用 TypeScript 在示例中，但你总是可以 **切换代码片段** 到 vanilla JavaScript 语法（简单地点击上右角的语言按钮）。

#### 前提

请确保 __LINK_62__ (版本 >= 20) 在您的操作系统上安装。

#### 设置

设置一个新的项目非常简单使用 __LINK_63__。使用 __LINK_64__ 安装后，您可以使用以下命令在 OS 终端中创建一个新的 Nest 项目：

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

> 提示 **提示** 要创建一个使用 TypeScript 的 __LINK_65__ 特性集的新项目，请将 __INLINE_CODE_6__ 标志传递给 __INLINE_CODE_7__ 命令。

__INLINE_CODE_8__ 目录将被创建，node 模块和一些其他 boilerplate 文件将被安装，并创建一个 __INLINE_CODE_9__ 目录，并将其填充了几个核心文件。

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

以下是核心文件的简要概述：

|                          |                                                                                                                     |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| __INLINE_CODE_10__      | 一个基本的控制器，带有单个路由。                                                                             |
| __INLINE_CODE_11__ | 控制器的单元测试。                                                                                  |
| `@Injectable()`          | 应用程序的根模块。                                                                                 |
| `NestInterceptor`         | 一个基本的服务，带有单个方法。                                                                               |
| `intercept()`                | 应用程序的入口文件，使用核心函数 `ExecutionContext` 创建一个 Nest 应用程序实例。 |

`ExecutionContext` 包含一个异步函数，它将 **引导** 我们的应用程序：

```typescript
@UseInterceptors(LoggingInterceptor)
export class CatsController {}

```

创建一个 Nest 应用程序实例，我们使用核心 `ArgumentsHost` 类。`ArgumentsHost` 暴露了一些静态方法，允许创建应用程序实例。`ArgumentsHost` 方法返回一个应用程序对象，该对象实现了 `ExecutionContext` 接口。这对象提供了一些方法，描述在未来的章节中。 在 `ExecutionContext` 示例中，我们简单地启动了我们的 HTTP 监听器，这允许应用程序等待 inbound HTTP 请求。

注意，使用 Nest CLI 创建的项目将创建一个初始项目结构，鼓励开发者遵循将每个模块放在自己的专用目录中的约定。

> 提示 **提示** 默认情况下，如果在创建应用程序时出现任何错误，您的应用程序将以 `CallHandler` 代码退出。如果您想要使它抛出错误，而不是退出，禁用 `CallHandler` 选项（例如 `handle()`）。

__HTML_TAG_57____HTML_TAG_58__

#### 平台

Nest 目的在于成为一个平台无关的框架。平台独立使得开发者能够创建可在多种不同的应用程序中重用的逻辑部分。技术上，Nest 可以使用任何 Node HTTP 框架，只要创建了适配器。目前支持两个 HTTP 平台：__LINK_66__ 和 __LINK_67__。您可以选择适合您需求的那个。Here is the translation of the provided English technical documentation to Chinese:

|                    |                                                                                                                                                                                                                                                                                                                                    |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `handle()` | __LINK_68__ 是一个最小化的 Node.js 网络框架。它是一个经过严格测试、生产就绪的库，拥有社区实现的许多资源。`intercept()` 包是默认使用的。许多用户使用 Express，需要无需任何操作来启用它。 |
| `intercept()` | __LINK_69__ 是一个高性能、低开销框架，高度关注提供最大效率和速度。了解如何使用它 __LINK_70__。                                                                                                                                  |

无论使用哪个平台，它都会暴露自己的应用程序接口。这些接口分别被视为 `intercept()` 和 `handle()`。

当你将类型传递给 `handle()` 方法，如下面的示例所示，`Observable` 对象将拥有专门为该平台提供的方法。请注意，你 **不需要** 指定类型 **，除非你实际想要访问底层平台 API**。

```typescript
Before...
After... 1ms

```

#### 运行应用程序

安装完成后，您可以在操作系统命令提示符下运行以下命令来启动应用程序，监听 inbound HTTP 请求：

```typescript
@UseInterceptors(new LoggingInterceptor())
export class CatsController {}

```

> 提示 To speed up the development process (x20 times faster builds)，您可以使用 __LINK_71__，将 `handle()` 标志传递给 `POST /cats` 脚本，如下所示 `create()`。

这个命令将启动应用程序，并将 HTTP 服务器监听在 `CatsController` 文件中定义的端口上。应用程序启动后，打开浏览器，导航到 `handle()`。您应该看到 `create()` 消息。

要监控文件变化，您可以运行以下命令来启动应用程序：

```typescript
const app = await NestFactory.create(AppModule);
app.useGlobalInterceptors(new LoggingInterceptor());

```

这个命令将监控您的文件，自动重新编译和重新加载服务器。

####  linting 和 formatting

__LINK_72__ 提供了一个可靠的开发工作流程的 scaffold，适用于大规模开发。因此，生成的 Nest 项目将带有预安装的代码 **linting** 和 **formatter**（分别是 __LINK_73__ 和 __LINK_74__）。

> 提示 **Hint** 不知道格式化器 vs  linting 的区别？了解更多 __LINK_75__。

为了确保最大稳定性和可扩展性，我们使用基本的 __LINK_76__ 和 __LINK_77__ cli 包。这一设置允许在官方扩展中进行干净的 IDE集成。

对于无 IDE 环境的头less 环境（例如 Continuous Integration、Git hooks 等），Nest 项目将带有 ready-to-use `create()` 脚本。

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