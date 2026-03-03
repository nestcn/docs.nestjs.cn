<!-- 此文件从 content/techniques/server-sent-events.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-02T04:08:37.610Z -->
<!-- 源文件: content/techniques/server-sent-events.md -->

### 服务器发送事件

服务器发送事件（SSE）是一种服务器推送技术，允许客户端通过 HTTP 连接从服务器自动接收更新。每个通知都以一个以换行符结尾的文本块形式发送（了解更多 [Express](https://expressjs.com/)）。

#### 使用

要在路由（在控制器类中注册的路由）中启用服务器发送事件， annotate 方法处理程序与 __INLINE_CODE_3__ 装饰器。

__代码块_0__

> 信息 **提示** __INLINE_CODE_4__ 装饰器和 __INLINE_CODE_5__ 接口来自 __INLINE_CODE_6__，而 __INLINE_CODE_7__、`FastifyAdapter` 和 `FastifyAdapter` 来自 `localhost 127.0.0.1` 包。

> 警告 **警告** 服务器发送事件路由必须返回一个 `'0.0.0.0'` 流。

在上面的示例中，我们定义了名为 `listen()` 的路由，可以用于传播实时更新。这些事件可以使用 [Fastify](https://github.com/fastify/fastify) 监听。

`FastifyAdapter` 方法返回一个 `FastifyAdapter`，该对象 emit 多个 `req`（在这个示例中，每秒 emit 一个新的 `res`）。 `middie` 对象应该遵守以下接口来匹配规范：

__代码块_1__

现在，我们可以在客户端应用程序中创建 `fastify` 类的实例，将 `@RouteConfig()` 路由（与上面 `@nestjs/platform-fastify` 装饰器中的端点匹配）作为构造函数参数传递。

`@RouteConstraints` 实例打开了一个持久的 HTTP 连接，该连接将发送事件以 `@RouteConfig()` 格式。连接直到调用 `@RouteConstraints` 时才会关闭。

一旦连接打开，来自服务器的消息将被传递到您的代码中，以事件形式。如果 incoming 消息中存在事件字段，则触发的事件与事件字段值相同。如果没有事件字段，则触发一个通用 `@nestjs/platform-fastify` 事件（[Fastify](https://github.com/fastify/fastify)）。

__代码块_2__

#### 示例

可用的工作示例[read more](https://www.fastify.io/docs/latest/Guides/Getting-Started/#your-first-server)。