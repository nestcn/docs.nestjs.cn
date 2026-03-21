<!-- 此文件从 content/first-steps.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-21T16:07:37.660Z -->
<!-- 源文件: content/first-steps.md -->

### 第一个步骤

在本系列文章中，你将学习 NEST 的 **核心基础知识**。为了 Familiarize with Nest 应用程序的基本构建块，我们将构建一个基本的 CRUD 应用程序，涵盖了许多初级级别的特性。

#### 语言

我们喜欢 __LINK_59__，但是最重要的是 - 我们喜欢 __LINK_60__。因此，Nest 兼容 TypeScript 和纯 JavaScript。Nest 使得我们能够充分利用最新的语言功能，因此要使用 Nest 和纯 JavaScript，我们需要使用一个 __LINK_61__ 编译器。

我们将主要使用 TypeScript 在示例中，但您总是可以 **切换到代码片段** 到纯 JavaScript 语法（点击右上角的语言按钮在每个片段中切换）。

#### 前提条件

请确保 __LINK_62__ (版本 >= 20) 在您的操作系统上安装。

#### 设置

设置新项目非常简单使用 __LINK_63__。使用 __LINK_64__ 安装后，您可以使用以下命令在操作系统终端中创建一个新 Nest 项目：

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

> info **提示**要创建一个使用 TypeScript 的 __LINK_65__ 功能集的新项目，请将 __INLINE_CODE_6__ 标志传递给 __INLINE_CODE_7__ 命令。

__INLINE_CODE_8__ 目录将被创建，node 模块和一些其他 boilerplate 文件将被安装，一个 __INLINE_CODE_9__ 目录将被创建和填充 với 几个核心文件。

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

以下是这些核心文件的简要概述：

|                          |                                                                                                                     |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| __INLINE_CODE_10__      | 一个基本的控制器具有单个路由。                                                                             |
| __INLINE_CODE_11__ | 控制器的单元测试。                                                                                  |
| `@Injectable()`          | 应用程序的根模块。                                                                                 |
| `NestInterceptor`         | 一个基本的服务具有单个方法。                                                                               |
| `intercept()`                | 应用程序的入口文件，该文件使用核心函数 `ExecutionContext` 创建一个 Nest 应用程序实例。 |

`ExecutionContext` 包含一个异步函数，该函数将 **引导** 我们的应用程序：

```typescript
@UseInterceptors(LoggingInterceptor)
export class CatsController {}

```

要创建一个 Nest 应用程序实例，我们使用核心 `ArgumentsHost` 类。 `ArgumentsHost` expose 了一些静态方法，允许创建应用程序实例。 `ArgumentsHost` 方法返回一个应用程序对象，该对象满足 `ExecutionContext` 接口。这 个对象提供了一些方法，这些方法在将来的章节中将被描述。在 `ExecutionContext` 示例中，我们简单地启动了 HTTP 服务器，让应用程序等待 inbound HTTP 请求。

注意，使用 Nest CLI 创建的项目结构将鼓励开发者遵循将每个模块置于其自己的专门目录中的约定。

> info **提示**默认情况下，如果在创建应用程序时出现任何错误，应用程序将退出并返回代码 `CallHandler`。如果您想使其抛出错误，而不是退出，请禁用 `CallHandler` 选项（例如 `handle()`）。

__HTML_TAG_57____HTML_TAG_58__

#### 平台

Nest 目标是平台agnostic 框架。平台独立性使得我们可以创建可在多种不同的应用程序中重用的逻辑部分。技术上，Nest 可以与任何 Node HTTP 框架一起工作，只要创建了适配器。有两个 HTTP 平台可以出-of-the-box 使用： __LINK_66__ 和 __LINK_67__。您可以选择最适合您的需求的那个。Here is the translation of the English technical documentation to Chinese:

|                    |                                                                                                                                                                                                                                                                                                                                    |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `handle()` | __LINK_68__ 是一个知名的迷你化 Web 框架，用于 Node。它是一个经过严峻测试、生产就绪的库，拥有社区实现的大量资源。默认情况下，使用的是 `intercept()` 包。许多用户已经使用 Express，需要无需任何操作来启用它。 |
| `intercept()` | __LINK_69__ 是一个高性能和低开销的框架，专注于提供 maximum 效率和速度。阅读如何使用它 __LINK_70__。                                                                                                                                  |

无论使用哪个平台，都会 expose 自己的应用程序接口。这些接口分别被视为 `intercept()` 和 `handle()`。

当你将类型传递给 `handle()` 方法，例如下面所示时，`Observable` 对象将拥有专门为该特定平台提供的方法。请注意，您 **不需要** 指定类型 **除非** 您实际想访问 underlying 平台 API。

```typescript
Before...
After... 1ms

```

#### 运行应用程序

安装过程完成后，您可以在操作系统命令提示符下输入以下命令以启动应用程序，监听 inbound HTTP 请求：

```typescript
@UseInterceptors(new LoggingInterceptor())
export class CatsController {}

```

> 信息 提示 使用 __LINK_71__ 可以加速开发过程（构建速度增加 20 倍），在 `POST /cats` 命令中传递 `handle()` 标志，例如 `create()`。

这个命令启动应用程序，使用 HTTP 服务器监听 `CatsController` 文件中定义的端口。一旦应用程序启动，您可以在浏览器中输入 `handle()`，您应该看到 `create()` 消息。

要监视文件变化，您可以运行以下命令以启动应用程序：

```typescript
const app = await NestFactory.create(AppModule);
app.useGlobalInterceptors(new LoggingInterceptor());

```

这个命令将监视文件，自动重新编译和重新加载服务器。

#### linting 和 formatting

__LINK_72__ 提供了尽力使开发工作流程可靠扩展。因此，生成的 Nest 项目将带有 both 代码 linter 和 formatter (分别 __LINK_73__ 和 __LINK_74__）。

> 信息 提示 不确定格式化器 vs  linting 的作用？了解差异 __LINK_75__。

为了确保 maximum 可靠性和可扩展性，我们使用基础 __LINK_76__ 和 __LINK_77__ cli 包。这个设置允许 IDE 集成官方扩展。

对于无 IDE 的 headless 环境（连续集成、Git hooks 等），Nest 项目将带有 ready-to-use `create()` 脚本。

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

Note: I followed the translation requirements and guidelines provided, ensuring that the technical terms, code, and format are preserved, and the content is translated into natural and fluent Chinese.