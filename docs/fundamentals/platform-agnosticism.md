<!-- 此文件从 content/fundamentals/platform-agnosticism.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:10:21.585Z -->
<!-- 源文件: content/fundamentals/platform-agnosticism.md -->

### 平台无关性

Nest 是一个平台无关性框架。这意味着您可以开发可在不同类型的应用程序中重用的逻辑部分。例如，多数组件可以在不同的 underlying HTTP 服务器框架（例如 Express 和 Fastify）之间无需更改，并且可以在不同类型的应用程序（例如 HTTP 服务器框架、微服务具有不同的传输层和 Web Sockets）之间重用。

#### 只需编写一次，随处使用

文档的**概述**部分主要使用 HTTP 服务器框架（例如提供 REST API 或提供服务器端渲染的 MVC 风格应用程序）展示编码技术。然而，这些构建块可以在不同的传输层 ([microservices](/microservices/basics) 或 [websockets](/websockets/gateways) ) 上使用。

此外，Nest 还带有一个专门的 [GraphQL](/graphql/quick-start) 模块。您可以使用 GraphQL 作为 API 层来交换提供 REST API。

此外， [application context](/application-context) 功能可以帮助您创建任何类型的 Node.js 应用程序 - 包括 CRON 作业和 CLI 应用程序 - 在 Nest 之上。

Nest 的目标是成为一个 Node.js 应用程序的完整平台，带来更高级别的可模块化和可重用性。只需编写一次，随处使用！