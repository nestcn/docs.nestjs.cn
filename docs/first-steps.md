<!-- 此文件从 content/first-steps.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-02T04:07:26.718Z -->
<!-- 源文件: content/first-steps.md -->

### 第一个步骤

在这组文章中，您将学习 **Nest 的核心基础知识**。为了 Familiarize with Nest 应用程序的基本构建块，我们将创建一个基本的 CRUD 应用程序，涵盖了很多初学者需要了解的内容。

#### 语言

我们对 __LINK_59__ 深深爱恋，但最重要的是，我们对 __LINK_60__ 也深深爱恋。因此，Nest 兼容 TypeScript 和纯 JavaScript。Nest 使充分利用了最新的语言特性，因此要使用它与纯 JavaScript，我们需要一个 __LINK_61__ 编译器。

我们主要使用 TypeScript 在示例中，但您总是可以 **切换代码片段** 到纯 JavaScript 语法（点击上右角的语言按钮）。 

#### 前提

请确保您的操作系统中安装了 __LINK_62__ (版本 >= 20)。

#### 设置

设置一个新的项目非常简单，使用 __LINK_63__。使用 __LINK_64__ 安装后，您可以使用以下命令在操作系统终端中创建一个新的 Nest 项目：

```typescript
@UseGuards(AuthGuard)
@SubscribeMessage('events')
handleEvent(client: Client, data: unknown): WsResponse<unknown> {
  const event = 'events';
  return { event, data };
}
```

> 提示 **Hint** 创建一个新的项目时，可以使用 __INLINE_CODE_6__ 标志来启用 TypeScript 的 __LINK_65__ 功能集。

__INLINE_CODE_8__ 目录将被创建，node 模块和一些其他 boilerplate 文件将被安装，并创建一个 __INLINE_CODE_9__ 目录， populated with several core files。

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

以下是一个这些核心文件的简要概述：

|                          |                                                                                                                     |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| __INLINE_CODE_10__      | 一个基本的控制器，具有单个路由。                                                                             |
| __INLINE_CODE_11__ | 控制器的单元测试。                                                                                  |
| __INLINE_CODE_12__          | 应用程序的根模块。                                                                                 |
| __INLINE_CODE_13__         | 一个基本的服务，具有单个方法。                                                                               |
| __INLINE_CODE_14__                | 应用程序的入口文件，它使用核心函数 __INLINE_CODE_15__ 创建一个 Nest 应用程序实例。 |

__INLINE_CODE_16__ 包含一个异步函数，用于 **引导** 我们的应用程序：

__CODE_BLOCK_1__

创建一个 Nest 应用程序实例，我们使用核心 __INLINE_CODE_17__ 类。 __INLINE_CODE_18__ expose 了一些静态方法，允许创建应用程序实例。 __INLINE_CODE_19__ 方法返回一个应用程序对象，该对象实现了 __INLINE_CODE_20__ 接口。此对象提供了一些方法，后续章节将对其进行描述。在 __INLINE_CODE_21__ 示例中，我们只是启动了我们的 HTTP 监听程序，让应用程序等待 inbound HTTP 请求。

请注意，使用 Nest CLI 生成项目时，创建了一个初始项目结构，鼓励开发者遵循将每个模块置于其自己的专门目录中的约定。

> 提示 **Hint** 如果创建应用程序时出现任何错误，应用程序将以 __INLINE_CODE_22__ 代码退出。如果您想要使应用程序抛出错误而不是退出，请禁用 __INLINE_CODE_23__ 选项（例如 __INLINE_CODE_24__