<!-- 此文件从 content/fundamentals/platform-agnosticism.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-03T04:18:16.367Z -->
<!-- 源文件: content/fundamentals/platform-agnosticism.md -->

### 平台无关性

Nest 是一个平台无关性框架。这意味着你可以开发可在不同类型的应用程序中重用的逻辑部分。例如，大多数组件可以在不需要改变的情况下跨越不同的底层 HTTP 服务器框架（例如 Express 和 Fastify），甚至跨越不同的应用程序类型（例如 HTTP 服务器框架、微服务具有不同的传输层和 WebSocket）。

#### 一次构建，随处使用

本文档的 **Overview** 部分主要展示使用 HTTP 服务器框架（例如提供 REST API 或提供服务器端渲染的 MVC 风格应用程序）的编码技术。然而，这些构建块可以在不同的传输层（__LINK_0__ 或 __LINK_1__）之上使用。

此外，Nest 来自带有一个专门的 __LINK_2__ 模块。你可以使用 GraphQL 作为 API 层，或者提供 REST API。

此外， __LINK_3__ 功能帮助你创建任何类型的 Node.js 应用程序，包括 Cron 作业和 CLI 应用程序，基于 Nest。

Nest 承诺成为 Node.js 应用程序的完整平台，带来更高的可模块化和可重用的应用程序。一次构建，随处使用！