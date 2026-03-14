<!-- 此文件从 content/first-steps.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T04:21:48.201Z -->
<!-- 源文件: content/first-steps.md -->

### 首步

在这篇文章中，您将学习Nest的 **核心基础知识**。为了让您熟悉Nest应用程序的基本构建块，我们将创建一个基本的CRUD应用程序，涵盖了初级级别的许多功能。

#### 语言

我们喜欢 __LINK_59__，但最重要的是，我们爱 __LINK_60__。因此，Nest与TypeScript和纯JavaScript兼容。Nest利用了最新的语言特性，因此要使用vanilla JavaScript，我们需要 __LINK_61__ 编译器。

我们主要使用TypeScript提供的示例，但是您始终可以 **切换代码块** 到vanilla JavaScript语法（简单地点击上右角的语言按钮以切换语言）。

#### 前提条件

请确保您的操作系统上安装了 __LINK_62__ (版本 >= 20)。

#### 设置

设置新项目非常简单，使用 __LINK_63__。安装了 __LINK_64__ 后，您可以使用以下命令在操作系统终端中创建新Nest项目：

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

>提示 **注意** 要创建带有TypeScript的 __LINK_65__ 特性集的新项目，请将 __INLINE_CODE_6__ 标志传递给 __INLINE_CODE_7__ 命令。

创建了 __INLINE_CODE_8__ 目录，安装了node模块和一些其他样板文件，创建了 __INLINE_CODE_9__ 目录，并将其填充了几个核心文件。

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

这些核心文件的简要概述如下：

|                          |                                                                                                                     |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| __INLINE_CODE_10__      | 一个基本控制器，具有单个路由。                                                                             |
| __INLINE_CODE_11__ | 控制器的单元测试。                                                                                  |
| `@Injectable()`          | 应用程序的根模块。                                                                                 |
| `NestInterceptor`         | 一个基本服务，具有单个方法。                                                                               |
| `intercept()`                | 应用程序的入口文件，它使用核心函数 `ExecutionContext` 创建一个Nest应用程序实例。 |

`ExecutionContext` 包含一个异步函数，该函数将 **引导** 我们的应用程序：

```typescript
@UseInterceptors(LoggingInterceptor)
export class CatsController {}

```

要创建Nest应用程序实例，我们使用核心 `ArgumentsHost` 类。 `ArgumentsHost` 公开了一些静态方法，允许创建应用程序实例。 `ArgumentsHost` 方法返回一个应用程序对象，该对象满足 `ExecutionContext` 接口。这对象提供了一些方法，下一章中将对其进行描述。在上面的 `ExecutionContext` 示例中，我们简单地启动了HTTP监听器，让应用程序等待 inbound HTTP 请求。

请注意，使用Nest CLI scaffold项目时，创建的初始项目结构鼓励开发者遵循将每个模块置于其自己的专门目录中的约定。

>提示 **注意** 默认情况下，如果创建应用程序时发生任何错误，您的应用程序将退出并返回代码 `CallHandler`。如果您想要使它抛出错误，而不是退出， disable `CallHandler` 选项（例如 `handle()`）。

__HTML_TAG_57____HTML_TAG_58__

#### 平台

Nest旨在成为一个平台无关的框架。平台独立使得开发者可以在多种不同的应用程序中重复使用逻辑部分。实际上，Nest可以与任何Node HTTP框架一起工作，只要创建了适配器。目前支持两个HTTP平台：__LINK_66__ 和 __LINK_67__。您可以选择最适合您的需求的平台。Here is the translation of the technical documentation to Chinese:

|                    |                                                                                                                                                                                                                                                                                                                                    |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `handle()` | __LINK_68__ 是一个最小化的 Node 网络框架。它是一个经过严格测试、生产就绪的库，具有大量由社区实现的资源。默认情况下使用 `intercept()` 包。许多用户使用 Express，需要无需采取任何行动来启用它。 |
| `intercept()` | __LINK_69__ 是一个高性能、低开销的框架，高度关注提供最大效率和速度。了解如何使用它 __LINK_70__。                                                                                                                                  |

无论使用哪个平台，都会暴露自己的应用程序接口。这些分别被视为 `intercept()` 和 `handle()`。

当你将类型传递给 `handle()` 方法，如下面的示例所示， `Observable` 对象将具有专门为该特定平台提供的方法。请注意，你不 **需要** 指定类型 **除非** 你实际想要访问底层平台 API。

```typescript
Before...
After... 1ms

```

#### 运行应用程序

安装过程完成后，您可以在操作系统命令提示符下运行以下命令以启动应用程序，监听 inbound HTTP 请求：

```typescript
@UseInterceptors(new LoggingInterceptor())
export class CatsController {}

```

> 信息 提示 为了加速开发过程（20倍的构建速度），您可以使用 __LINK_71__ 通过将 `handle()` 标志传递给 `POST /cats` 脚本，例如 `create()`。

这个命令将启动应用程序，使用 HTTP 服务器监听 `CatsController` 文件中定义的端口。应用程序运行后，请打开浏览器，导航到 `handle()`。您应该看到 `create()` 消息。

要监控文件变化，可以运行以下命令以启动应用程序：

```typescript
const app = await NestFactory.create(AppModule);
app.useGlobalInterceptors(new LoggingInterceptor());

```

这个命令将监控您的文件，自动重新编译和重新加载服务器。

#### 检查和格式化

__LINK_72__ 提供了尽力来在大规模开发中提供可靠的开发工作流。因此，生成的 Nest 项目将带有 both 代码 **linter** 和 **formatter** (分别为 __LINK_73__ 和 __LINK_74__ )。

> 信息 提示 不知道格式化器 vs linter 的区别？了解更多 __LINK_75__。

为了确保最大稳定性和可扩展性，我们使用基本的 __LINK_76__ 和 __LINK_77__ cli 包。这个设置允许在官方扩展中进行IDE集成。

对于无 IDE 的 headless 环境（连续集成、Git hooks 等）Nest 项目将带有 ready-to-use `create()` 脚本。

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