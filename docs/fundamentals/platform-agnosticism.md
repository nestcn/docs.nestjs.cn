<!-- 此文件从 content/fundamentals/platform-agnosticism.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T04:37:40.706Z -->
<!-- 源文件: content/fundamentals/platform-agnosticism.md -->

### 平台无关性

Nest是一个平台无关的框架。这意味着您可以开发可在不同类型的应用程序中重用的逻辑部分。例如，多数组件可以在不同底层 HTTP 服务器框架（例如 Express 和 Fastify）之间重用，不同类型的应用程序（例如 HTTP 服务器框架、微服务具有不同的传输层和 Web Sockets）之间也可以重用。

#### 一次构建，随处使用

本文档的**概述**部分主要展示使用 HTTP 服务器框架（例如提供 REST API 或提供服务器端呈现 MVC 风格的应用程序）的编码技术。然而，这些构建块可以在不同的传输层（[microservices](/microservices/basics)或[websockets](/websockets/gateways)）上使用。

此外，Nest还内置了专门的[GraphQL](/graphql/quick-start)模块。您可以使用 GraphQL 作为 API 层来替换提供 REST API。

此外，[application context](/application-context)特性可以帮助您创建任何 Node.js 应用程序 - 包括 CRON 作业和 CLI 应用程序 - 在 Nest 上。

Nest旨在成为 Node.js 应用程序的完整平台，提高应用程序的模块化和重用性。一次构建，随处使用！