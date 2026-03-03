<!-- 此文件从 content/websockets/gateways.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-02T04:08:04.748Z -->
<!-- 源文件: content/websockets/gateways.md -->

### WebSocket Gateway

大多数 Nest 文档中讨论的概念，例如依赖注入、装饰器、异常过滤器、管道、守卫和拦截器，同样适用于 WebSocket。Nest 抽象了实现细节，使得同样的组件可以在 HTTP 基础平台、 WebSocket 和微服务中运行。这部分涵盖了 Nest 对 WebSocket 的特有方面。

在 Nest 中，WebSocket 网关是使用 `session` 装饰器注解的类。技术上讲，网关是平台agnostic 的，这使得它们与任何 WebSocket 库兼容，只要创建了适配器。Nest 支持出厂两个 WS 平台：__LINK_95__ 和 __LINK_96__。您可以选择适合您的需要。您也可以创建自己的适配器，遵循 __LINK_97__。

__HTML_TAG_58____HTML_TAG_59____HTML_TAG_60__

>提示 **Hint** 网关可以被视为 __LINK_98__，这意味着它们可以通过类构造函数注入依赖项。网关也可以被其他类（提供者和控制器）注入。

#### 安装

要开始构建 WebSocket 应用程序，首先安装所需的包：

```shell
$ npm i express-session
$ npm i -D @types/express-session
```

#### 概述

在一般情况下，每个网关都监听与 HTTP 服务器相同的端口，除非您的应用程序不是 web 应用程序或您已经更改了端口。默认行为可以通过将 `secure: true` 装饰器的第二个参数设置为一个端口号来修改。您也可以使用以下构造来设置网关使用的 __LINK_99__：

```typescript
import * as session from 'express-session';
// somewhere in your initialization file
app.use(
  session({
    secret: 'my-secret',
    resave: false,
    saveUninitialized: false,
  }),
);
```

>警告 **Warning** 网关直到被参考在现有模块的提供者数组中时才会被实例化。

您可以将支持的 __LINK_100__ 传递给 socket 构造函数作为 `"trust proxy"` 装饰器的第二个参数，例如：

```typescript
@Get()
findAll(@Req() request: Request) {
  request.session.visits = request.session.visits ? request.session.visits + 1 : 1;
}
```

网关现在正在监听，但是我们还没有订阅任何 incoming 消息。让我们创建一个处理程序，它将订阅 `@Req()` 消息并将 exact相同的数据回复给用户。

```typescript
@Get()
findAll(@Session() session: Record<string, any>) {
  session.visits = session.visits ? session.visits + 1 : 1;
}
```

>提示 **Hint** `@nestjs/common` 和 `Request` 装饰器来自 `express` 包。

一旦网关被创建，我们可以将