### 服务器发送事件

服务器发送事件（SSE）是一种服务器推送技术，允许客户端通过 HTTP 连接自动接收来自服务器的更新。每条通知都以由一对换行符终止的文本块形式发送（了解更多[此处](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events) ）。

#### 使用方法

要在路由上启用服务器发送事件（路由注册在**控制器类**中），请使用 `@Sse()` 装饰器标注方法处理器。

```typescript
@Sse('sse')
sse(): Observable<MessageEvent> {
  return interval(1000).pipe(map((_) => ({ data: { hello: 'world' } })));
}
```

:::info 注意
`@Sse()` 装饰器和 `MessageEvent` 接口从 `@nestjs/common` 导入，而 `Observable`、`interval` 和 `map` 则从 `rxjs` 包导入。
:::


:::warning 警告
Server-Sent Events 路由必须返回一个 `Observable` 流。
:::

在上面的示例中，我们定义了一个名为 `sse` 的路由，它将允许我们传播实时更新。这些事件可以使用 [EventSource API](https://developer.mozilla.org/en-US/docs/Web/API/EventSource) 进行监听。

`sse` 方法返回一个会发出多个 `MessageEvent` 的 `Observable`（在本示例中，它每秒发出一个新的 `MessageEvent`）。`MessageEvent` 对象应遵循以下接口以符合规范：

```typescript
export interface MessageEvent {
  data: string | object;
  id?: string;
  type?: string;
  retry?: number;
}
```

有了这个设置，我们现在可以在客户端应用程序中创建 `EventSource` 类的实例，将 `/sse` 路由（与我们传入上面 `@Sse()` 装饰器的端点匹配）作为构造函数参数传递。

`EventSource` 实例会与 HTTP 服务器建立持久连接，服务器以 `text/event-stream` 格式发送事件。该连接将保持打开状态，直到调用 `EventSource.close()` 方法关闭为止。

连接建立后，来自服务器的传入消息会以事件形式传递到你的代码中。如果传入消息包含事件字段，则触发的事件与该字段值相同。若未包含事件字段，则会触发通用的 `message` 事件（ [来源](https://developer.mozilla.org/en-US/docs/Web/API/EventSource) ）。

```javascript
const eventSource = new EventSource('/sse');
eventSource.onmessage = ({ data }) => {
  console.log('New message', JSON.parse(data));
};
```

#### 示例

一个可用的示例[在此处](https://github.com/nestjs/nest/tree/master/sample/28-sse)查看。
