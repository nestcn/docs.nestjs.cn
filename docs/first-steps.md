<!-- 此文件从 content/first-steps.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-03T04:08:10.629Z -->
<!-- 源文件: content/first-steps.md -->

### 第一个步骤

在这组文章中，您将学习 Nest 的 **核心基础知识**。为了amiliarize with Nest 应用程序的基本构建块，我们将构建一个基本的 CRUD 应用程序，该应用程序涵盖了 introduction level 的许多特性。

#### 语言

我们对 __LINK_59__深深地热爱，但是最重要的是 - 我们对 __LINK_60__最爱。因此，Nest 兼容 TypeScript 和纯 JavaScript。Nest 使充分利用了最新的语言特性，因此在使用 vanilla JavaScript 时需要一个 __LINK_61__ 编译器。

我们将主要使用 TypeScript 在示例中，但是您总是可以 **切换代码片段** 到 vanilla JavaScript 语法（简单地点击上方右上角的语言按钮）。

#### 前提条件

请确保你的操作系统中安装了 __LINK_62__（版本 >= 20）。

#### 设置

设置新项目非常简单，使用 __LINK_63__。如果你已经安装了 __LINK_64__，你可以使用以下命令在 OS 终端中创建一个新的 Nest 项目：

```typescript
@UseInterceptors(new TransformInterceptor())
@SubscribeMessage('events')
handleEvent(client: Client, data: unknown): WsResponse<unknown> {
  const event = 'events';
  return { event, data };
}
```

> 提示 **提示** 使用 TypeScript 的 __LINK_65__ 特性集创建一个新项目，传递 __INLINE_CODE_6__标志到 __INLINE_CODE_7__ 命令。

将创建 __INLINE_CODE_8__ 目录，安装 node 模块和其他 boilerplate 文件，同时创建一个 __INLINE_CODE_9__ 目录，并将其填充了几个核心文件。

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
| __INLINE_CODE_12__          | 应用程序的根模块。                                                                                 |
| __INLINE_CODE_13__         | 一个基本的服务具有单个方法。                                                                               |
| __INLINE_CODE_14__                | 应用程序的入口文件，该文件使用核心函数 __INLINE_CODE_15__ 创建一个 Nest 应用程序实例。 |

__INLINE_CODE_16__ 包含一个异步函数，该函数将 **引导** 我们的应用程序：

__CODE_BLOCK_1__

创建 Nest 应用程序实例，我们使用核心 __INLINE_CODE_17__ 类。__INLINE_CODE_18__ 暴露了一些静态方法，允许创建应用程序实例。__INLINE_CODE_19__ 方法返回一个应用程序对象，该对象实现了 __INLINE_CODE_20__ 接口。该对象提供了一些方法，这些方法将在后续章节中描述。在 __INLINE_CODE_21__ 示例中，我们简单地启动了 HTTP 监听器，以便应用程序等待 inbound HTTP 请求。

注意，使用 Nest CLI 生成的项目结构会鼓励开发者遵循将每个模块放在自己的专门目录中的约定。

> 提示 **提示** 默认情况下，如果在创建应用程序时发生任何错误，应用程序将以 __INLINE_CODE_22__ 代码退出。如果您想要使应用程序抛出错误，而不是退出， disable __INLINE_CODE_23__ 选项（例如 __