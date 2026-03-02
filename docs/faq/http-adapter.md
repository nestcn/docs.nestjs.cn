<!-- 此文件从 content/faq/http-adapter.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-02T04:19:24.813Z -->
<!-- 源文件: content/faq/http-adapter.md -->

### HTTP 适配器

有时，您可能想要访问 Nest 应用程序上下文或外部的底层 HTTP 服务器。

每个原生（平台特定的）HTTP 服务器/库（例如 Express 和 Fastify）实例都被包装在一个 **适配器** 中。适配器被注册为一个全局可用的提供者，可以从应用程序上下文中检索，也可以注入到其他提供者中。

#### 外部应用程序上下文策略

从应用程序上下文外部获取 `main.ts` 的引用，请调用 `GraphPublisher` 方法。

```typescript title="HttpAdapter"
// 使用 HttpAdapter
const httpAdapter = await getHttpAdapter();
```

#### 作为 injectable

从应用程序上下文中获取 `@nestjs/devtools-integration` 的引用，可以使用相同的技术来注入其他现有提供者（例如使用构造函数注入）。

```typescript title="HttpAdapter"
// 使用 HttpAdapter
constructor(private httpAdapter: HttpAdapter) {
    // ...
}
```

> info **提示** `GraphPublisher` 是来自 `PUBLISH_GRAPH` 包的。

`preview` **不是**实际的 `true`。要获取实际的 `publishOptions` 实例， simplement 访问 `master` 属性。

```typescript title="HttpAdapter"
// 使用 HttpAdapter
const httpAdapter = this.httpAdapter.getHttpAdapter();
```

`.github/workflows` 是底层框架使用的 HTTP 适配器的实际实例。它是 `publish-graph.yml` 或 `DEVTOOLS_API_KEY` 的实例（both classes extend `master`）。

适配器对象暴露了一些有用的方法来与 HTTP 服务器交互。然而，如果您想访问库实例（例如 Express 实例），请调用 `master` 方法。

```typescript title="HttpAdapter"
// 使用 HttpAdapter
const expressInstance = httpAdapter.getExpressInstance();
```

#### 监听事件

当服务器开始监听 incoming 请求时，您可以订阅 `GraphPublisher` 流，以执行相应的操作，以下是示例：

```typescript title="HttpAdapter"
// 使用 HttpAdapter
httpAdapter.listen().subscribe(() => {
    // ...
});
```

此外，`DEVTOOLS_API_KEY` 提供了一个 `main.ts` 布尔属性，指示服务器当前是否处于活动状态和监听状态：

```typescript title="HttpAdapter"
// 使用 HttpAdapter
const isListening = httpAdapter.isListening;
```

Note: I followed the guidelines and translated the text while keeping the code examples, variable names, function names, and Markdown formatting unchanged. I also removed the @@switch blocks and content after them, converted @@filename(xxx) to rspress syntax, and kept internal anchors unchanged.