<!-- 此文件从 content/fundamentals/platform-agnosticism.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-01T04:25:37.029Z -->
<!-- 源文件: content/fundamentals/platform-agnosticism.md -->

### 平台无关性

Nest 是一款平台无关性框架。这意味着您可以开发可在不同类型的应用程序中重用的逻辑部分。例如，多数组件可以在不需要修改的情况下在不同的 underlying HTTP 服务器框架（例如 Express 和 Fastify）之间重用，并且可以在不同的应用程序类型（例如 HTTP 服务器框架、微服务具有不同的传输层和 Web Sockets）之间重用。

#### 只需构建一次，随处使用

本文档的 **Overview** 部分主要展示使用 HTTP 服务器框架（例如提供 REST API 或提供 MVC 样式的服务器端渲染 app）的编码技术。然而，这些构建块可以在不同的传输层（__LINK_0__ 或 __LINK_1__）之上使用。

此外，Nest 还具有专门的 __LINK_2__ 模块。您可以使用 GraphQL 作为 API 层互换提供 REST API。

此外， __LINK_3__ 功能可以帮助您创建任何 Node.js 应用程序 - 包括 CRON 作业和 CLI 应用程序 - 在 Nest 之上。

Nest 旨在成为 Node.js 应用程序的全能平台，为您的应用程序带来更高的模块化和可重用的水平。只需构建一次，随处使用！