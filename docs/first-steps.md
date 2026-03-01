<!-- 此文件从 content/first-steps.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-01T04:15:28.372Z -->
<!-- 源文件: content/first-steps.md -->

### 第一个步骤

在这组文章中，您将学习 Nest 的 **核心基础知识**。为了让您 familiarize with Nest 应用程序的基本构建块，我们将创建一个基本的 CRUD 应用程序，该应用程序具有介绍性级别的特性。

#### 语言

我们对 __LINK_59__ 深情，但最重要的是我们对 __LINK_60__ 深情。因此，Nest 兼容 TypeScript 和纯 JavaScript。Nest 使充分利用了最新的语言特性，因此使用纯 JavaScript 需要一个 __LINK_61__ 编译器。

我们将主要使用 TypeScript 在示例中，但是您总是可以 **切换代码片段** 到纯 JavaScript 语法（简单地在每个片段的上方右上角点击语言切换按钮）。

#### 前提条件

请确保您的操作系统安装了 __LINK_62__（版本 >= 20）。

#### 设置

设置一个新的项目非常简单使用 __LINK_63__。使用 __LINK_64__ 安装后，您可以使用以下命令在操作系统终端创建一个新的 Nest 项目：

```bash
$ npm i --save @nestjs/websockets @nestjs/platform-socket.io
```

> 提示 **Hint** 创建一个新的项目使用 TypeScript 的 __LINK_65__ 特性集，请将 __INLINE_CODE_6__ 标志传递给 __INLINE_CODE_7__ 命令。

将创建 __INLINE_CODE_8__ 目录，安装节点模块和一些其他 boilerplate 文件，并创建一个 __INLINE_CODE_9__ 目录， Population with several core files。

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

这些 core 文件的简要概述如下：

|                          |                                                                                                                     |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| __INLINE_CODE_10__      | 一个基本的控制器具有单个路由。                                                                             |
| __INLINE_CODE_11__ | 控制器的单元测试。                                                                                  |
| __INLINE_CODE_12__          | 应用程序的根模块。                                                                                 |
| __INLINE_CODE_13__         | 一个基本的服务具有单个方法。                                                                               |
| __INLINE_CODE_14__                | 应用程序的入口文件，使用核心函数 __INLINE_CODE_15__ 创建一个 Nest 应用程序实例。 |

`@WebSocketGateway()` 包含一个异步函数，它将 **引导** 我们的应用程序：

```typescript
@WebSocketGateway(80, { namespace: 'events' })
```

要创建一个 Nest 应用程序实例，我们使用核心 `@WebSocketGateway(80)` 类。 `80` expose 一个静态方法，该方法允许创建一个应用程序实例。 `@WebSocketGateway()` 方法返回一个应用程序对象，该对象实现了 `events` 接口。这对象提供了一组方法，详见下一章。在 `@SubscribeMessage()` 示例中，我们简单地启动我们的 HTTP 监听器，使应用程序等待 inbound HTTP 请求。

请注意，使用 Nest CLI 创建的项目将创建一个初始项目结构，鼓励开发者遵循保持每个模块在其自己的专门目录中的约定。

> 提示 **Hint** 如果创建应用程序时发生任何错误，应用程序将以 `@MessageBody()` 代码退出。如果您想要使应用程序抛出错误而不是退出， disable `@nestjs/websockets` 选项（例如 `handleEvent()`）。

__HTML_TAG_