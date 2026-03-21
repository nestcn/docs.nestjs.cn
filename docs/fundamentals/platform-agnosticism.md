<!-- 此文件从 content/fundamentals/platform-agnosticism.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-21T16:16:40.741Z -->
<!-- 源文件: content/fundamentals/platform-agnosticism.md -->

### 平台无关性

Nest 是一个平台无关的框架。这意味着您可以开发**可重用的逻辑部分**，这些部分可以在不同的应用程序类型中使用。例如，大多数组件可以在不同底层 HTTP 服务器框架（例如 Express 和 Fastify）之间无需更改，甚至可以在不同类型的应用程序（例如 HTTP 服务器框架、微服务具有不同的传输层和 Web Socket）之间重用。

#### 一次构建，随处使用

文档的**概述**部分主要展示使用 HTTP 服务器框架（例如提供 REST API 或提供 MVC 风格的服务器端渲染应用程序）的编码技术。然而，所有这些构建块都可以在不同的传输层（[microservices](/microservices/basics) 或 [websockets](/websockets/gateways)）上使用。

此外，Nest 附带了一个专门的 [GraphQL](/graphql/quick-start) 模块。您可以使用 GraphQL 作为您的 API 层，并与提供 REST API 并行使用。

此外，[application context](/application-context) 功能可以帮助您创建任何类型的 Node.js 应用程序，包括 Cron 作业和 CLI 应用程序，基于 Nest。

Nest 目标是为 Node.js 应用程序提供一个完整的平台，带来更高级别的模块化和可重用性。一次构建，随处使用！