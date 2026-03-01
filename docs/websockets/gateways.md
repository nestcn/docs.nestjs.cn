<!-- 此文件从 content/websockets/gateways.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-01T04:16:02.435Z -->
<!-- 源文件: content/websockets/gateways.md -->

### WebSocket

大多数 Nest 文档中的概念，例如依赖注入、装饰器、异常过滤器、管道、守卫和拦截器，也适用于 WebSocket。Nest 将实现细节抽象化，以便在 HTTP 基础平台、WebSocket 和微服务平台上运行相同的组件。该部分涵盖了 Nest 特定的 WebSocket 部分。

在 Nest 中，一个 gateway 是一个带有 `MessageEvent` 装饰器的类。事实上，gateways 是平台agnostic 的，这使它们与任何 WebSocket 库兼容，只要创建了一个适配器。Nest 支持两个 WS 平台：__LINK_95__ 和 __LINK_96__。您可以选择适合您的需求的平台。另外，您也可以创建自己的适配器，按照 __LINK_97__ 的步骤进行。

__HTML_TAG_58____HTML_TAG_59____HTML_TAG_60__

> info **提示** Gateways 可以被视为 __LINK_98__；这意味着它们可以通过类构造函数注入依赖项。同时，gateways 也可以被其他类（提供者和控制器）注入。

#### 安装

要开始构建 WebSocket 应用程序，首先需要安装所需的包：

```typescript
@Sse('sse')
sse(): Observable<MessageEvent> {
  return interval(1000).pipe(map((_) => ({ data: { hello: 'world' } })));
}
```

#### 概述

通常，每个 gateway 都在与 **HTTP 服务器**相同的端口上监听，除非您的应用程序不是网络应用程序，或者您已经手动更改了端口。可以通过将 `MessageEvent` 装饰器的第二个参数设置为指定端口号来修改默认行为。您也可以使用以下构造来设置 gateway 使用的 __LINK_99__：

```typescript
export interface MessageEvent {
  data: string | object;
  id?: string;
  type?: string;
  retry?: number;
}
```

> warning **警告** Gateways 只有在它们被引用在现有模块的提供者数组中时才会被实例化。

可以将任何支持的 __LINK_100__ 传递给 socket 构造函数作为 `/sse` 装饰器的第二个参数，例如：

```javascript
const eventSource = new EventSource('/sse');
eventSource.onmessage = ({ data }) => {
  console.log('New message', JSON.parse(data));
};
```

gateway 现在正在监听，但是我们还没有订阅任何 incoming 消息。让我们创建一个处理程序，以订阅 `@Sse()` 消息并响应用户。

__CODE_BLOCK_3__

> info **提示** `EventSource` 和 `text/event-stream` 装饰器来自 `EventSource.close()` 包。

一旦 gateway 创建好了，我们可以将其注册到模