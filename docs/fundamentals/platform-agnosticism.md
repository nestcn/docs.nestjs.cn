<!-- 此文件从 content/fundamentals/platform-agnosticism.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T04:56:07.039Z -->
<!-- 源文件: content/fundamentals/platform-agnosticism.md -->

### 平台无关性

Nest 是一个平台无关性的框架。这意味着您可以开发可在不同类型的应用程序中重用的逻辑部分。例如，大多数组件可以在不需要更改的情况下在不同 underlying HTTP 服务器框架（例如 Express 和 Fastify）之间重用，并且可以在不同类型的应用程序之间重用（例如 HTTP 服务器框架、微服务与不同的传输层、Web Socket）。

#### 一次构建，随处使用

文档的 **Overview** 部分主要使用 HTTP 服务器框架（例如提供 REST API 或提供 MVC-style 服务器端渲染应用程序）显示编码技术。然而，这些 building blocks 可以在不同的传输层上使用（例如 __LINK_0__ 或 __LINK_1__）。

此外，Nest 附带了一个专门的 __LINK_2__ 模块。您可以使用 GraphQL 作为 API 层，并与提供 REST API 相互换用。

此外， __LINK_3__ 功能可以帮助您创建任何 Node.js 应用程序，包括 Cron 作业和 CLI 应用程序，基于 Nest。

Nest 的目标是成为 Node.js 应用程序的完整平台，为您的应用程序带来更高的模块化和重用性。一次构建，随处使用！