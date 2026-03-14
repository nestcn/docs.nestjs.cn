<!-- 此文件从 content/fundamentals/platform-agnosticism.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T04:31:02.083Z -->
<!-- 源文件: content/fundamentals/platform-agnosticism.md -->

### 平台无关性

Nest 是一个平台无关性框架。这意味着您可以开发可在不同类型的应用程序中重用的逻辑部分。例如，大多数组件可以在不同基础 HTTP 服务器框架（例如 Express 和 Fastify）之间无需更改重用，并且可以在不同类型的应用程序（例如 HTTP 服务器框架、微服务具有不同传输层和 WebSocket）之间重用。

#### 一次构建，随处使用

文档的 **概述** 部分主要展示使用 HTTP 服务器框架（例如提供 REST API 或提供服务器端渲染的 MVC-style 应用程序）的编码技术。然而，这些构建块可以在不同的传输层（[microservices](/microservices/basics) 或 [websockets](/websockets/gateways)）之上使用。

此外，NestStill 有一个专门的 [GraphQL](/graphql/quick-start) 模块。您可以使用 GraphQL 作为 API 层相互替换提供 REST API。

此外， [application context](/application-context) 功能帮助您创建任何 Node.js 应用程序 - 包括 CRON 作业和 CLI 应用程序 - 在 Nest 之上。

Nestaspiree 是一个完整的 Node.js 应用程序平台，旨在将应用程序的可重用性和模块化到更高的水平。一次构建，随处使用！