### 服务器发送事件

服务器发送事件（SSE）是一个服务器推送技术，允许客户端在 HTTP 连接时从服务器接收自动更新。每个更新都作为一个由新行终止的代码块发送（[查看更多](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events)）。

#### 用法

要启用服务器发送事件，提取器必须返回一个 `Observable` 流。

```typescript
@Sse('sse')
sse(): Observable<MessageEvent> {
  return interval(1000).pipe(map((_) => ({ data: { hello: 'world' } })));
}

```

> info **提示** `@Sse()` 装饰器和 `MessageEvent` 接口是从 `@nestjs/common` 导入的，而 `Observable`、`interval` 和 `map` 是从 `rxjs` 包导入的。

> warning **注意** 服务器发送事件必须返回一个 `MessageEvent` 对象。它必须遵循以下接口：
> ```typescript
> interface MessageEvent {
>   data: string | object;
>   id?: string;
>   type?: string;
>   retry?: number;
> }
> ```

通过这样做，我们可以创建一个到 `/sse` 路由的连接，并在不让客户端请求任何新数据的情况下接收更新。

#### 示例

一个工作的例子可以在[这里](https://github.com/nestjs/nest/tree/master/sample/28-sse)查看。