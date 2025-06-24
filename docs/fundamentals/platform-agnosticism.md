### 平台无关性

Nest 是一个平台无关的框架。这意味着您可以开发**可复用的逻辑部件** ，这些部件可以跨不同类型的应用程序使用。例如，大多数组件可以在不同的底层 HTTP 服务器框架（如 Express 和 Fastify）之间无需修改直接复用，甚至能跨不同*类型*的应用程序（如 HTTP 服务器框架、采用不同传输层的微服务以及 Web Sockets）使用。

#### 一次构建，随处使用

文档的**概述**部分主要展示了使用 HTTP 服务器框架的编码技术（例如提供 REST API 的应用程序或提供 MVC 风格服务器端渲染的应用）。但所有这些构建模块都可以在不同的传输层（ [微服务](/microservices/basics)或 [websockets](/websockets/gateways)）之上使用。

此外，Nest 还配备了专用的 [GraphQL](/graphql/quick-start) 模块。您可以将 GraphQL 作为 API 层与 REST API 互换使用。

此外， [应用上下文](/application-context)功能有助于在 Nest 之上创建任何类型的 Node.js 应用——包括 CRON 作业和 CLI 应用等。

Nest 致力于成为 Node.js 应用的成熟平台，为您的应用程序带来更高层次的模块化和可重用性。一次构建，随处使用！