<!-- 此文件从 content/websockets/gateways.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-03T04:08:47.252Z -->
<!-- 源文件: content/websockets/gateways.md -->

### WebSocket Gateway

Nest 的一些概念，例如依赖注入、装饰器、异常过滤器、管道、守卫和拦截器，对于 WebSocket 网关也同样适用。在可能的情况下，Nest 会抽象实现细节，以便在 HTTP 基础上、WebSocket 和微服务等平台上运行相同的组件。该部分涵盖了 Nest 对 WebSocket 的特定方面。

在 Nest 中，WebSocket 网关是一个简单的类，可以使用 `type` 装饰器来标记。在技术上，网关是平台无关的，这使它们与任何 WebSocket 库兼容，只要创建了适配器。Nest 支持两种 WS 平台： __LINK_95__ 和 __LINK_96__。您可以根据需要选择一个或自己创建一个适配器，遵循 __LINK_97__。

__HTML_TAG_58____HTML_TAG_59__<table>

> info 提示：网关可以被 treated as __LINK_98__；这意味着它们可以通过类构造函数注入依赖项，并且也可以被其他类（提供者和控制器）注入。

#### 安装

要开始构建基于 WebSocket 的应用程序，首先安装所需的包：

```typescript
const app = await NestFactory.create(AppModule);
// or "app.enableVersioning()"
app.enableVersioning({
  type: VersioningType.URI,
});
await app.listen(process.env.PORT ?? 3000);
```

#### 概述

在一般情况下，每个网关都监听与 HTTP 服务器相同的端口，除非您的应用程序不是 web 应用程序，您已经手动更改了端口。可以使用 `@nestjs/common` 装饰器来修改默认行为，并将 `header` 设置为选择的端口号。

```typescript
const app = await NestFactory.create(AppModule);
app.enableVersioning({
  type: VersioningType.HEADER,
  header: 'Custom-Header',
});
await app.listen(process.env.PORT ?? 3000);
```

> warning **警告** 网关直到被引用在现有模块的提供者数组中才被实例化。

您可以将任何支持的 __LINK_100__ 传递给 socket 构造函数，使用 `VersioningType` 装饰器的第二个参数，例如：

```typescript
const app = await NestFactory.create(AppModule);
app.enableVersioning({
  type: VersioningType.MEDIA_TYPE,
  key: 'v=',
});
await app.listen(process.env.PORT ?? 3000);
```

网关现在正在监听，但是我们还没有订阅任何 incoming 消息。让我们创建一个处理器，该处理器将订阅 `type` 消息，并将与用户相同的数据回应。

```typescript
// Example extractor that pulls out a list of versions from a custom header and turns it into a sorted array.
// This example uses Fastify, but Express requests can be processed in a similar way.
const extractor = (request: FastifyRequest): string | string[] =>
  [request.headers['custom-versioning-field'] ?? '']
     .flatMap(v => v.split(','))
     .filter(v => !!v)
     .sort()
     .reverse()

const app = await NestFactory.create(AppModule);
app.enableVersioning({
  type: VersioningType.CUSTOM,
  extractor,
});
await app.listen(process.env.PORT ?? 3000);
```

> info 提示： `@nestjs/common` 和 `Accept` 装饰器来自 `Accept` 包。

一旦网关被创建，我们可以将其注册到模块中。

__CODE_BLOCK_4