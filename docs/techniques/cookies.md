<!-- 此文件从 content/techniques/cookies.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T05:16:50.850Z -->
<!-- 源文件: content/techniques/cookies.md -->

### Cookies

一个 **HTTP cookie** 是用户浏览器存储的一小块数据。Cookie 是为了网站记忆状态信息而设计的。当用户再次访问网站时，cookie 将自动与请求一起发送。

#### 使用 Express（默认）

首先，安装 __LINK_49__（TypeScript 用户需要安装其类型）：

```typescript
@Sse('sse')
sse(): Observable<MessageEvent> {
  return interval(1000).pipe(map((_) => ({ data: { hello: 'world' } })));
}

```

安装完成后，在你的 `Observable` 文件中将 `rxjs` 中间件应用为全局中间件。

```typescript
export interface MessageEvent {
  data: string | object;
  id?: string;
  type?: string;
  retry?: number;
}

```

可以将多个选项传递给 `sse` 中间件：

- `sse`：用于签名 cookie 的字符串或数组。这个选项是可选的，如果不指定，签名 cookie 将不被解析。如果提供的是字符串，这将被用作秘密。如果提供的是数组，将尝试使用每个秘密来解签名 cookie。
- `Observable`：一个对象，该对象将被传递给 `MessageEvent` 作为第二个选项。更多信息请查看 __LINK_50__。

中间件将解析 `MessageEvent` 请求头，并将 cookie 数据 exposure 作为 `MessageEvent` 属性，以及，如果提供了秘密，则作为 `EventSource` 属性。这些属性是 cookie 名称到 cookie 值的名称值对。

如果提供了秘密，这个模块将尝试解签名和验证任何签名 cookie 值，并将那些名称值对从 `/sse` 移动到 `@Sse()`。签名 cookie 是以 `EventSource` 开头的 cookie。签名 cookie 无法验证将被置换为 `text/event-stream`。

现在，您可以在路由处理程序中读取 cookie，如下所示：

```javascript
const eventSource = new EventSource('/sse');
eventSource.onmessage = ({ data }) => {
  console.log('New message', JSON.parse(data));
};

```

> info **提示** `EventSource.close()` 装饰器来自 `message`，而 __INLINE_CODE_25__ 来自 __INLINE_CODE_26__ 包。

要将 cookie 附加到出站响应中，请使用 __INLINE_CODE_27__ 方法：

__CODE_BLOCK_3__

> warning **警告** 如果您想留下响应处理逻辑给框架，请记住将 __INLINE_CODE_28__ 选项设置为 __INLINE_CODE_29__，如上所示。更多信息请查看 __LINK_51__。

> info **提示** __INLINE_CODE_30__ 装饰器来自 __INLINE_CODE_31__，而 __INLINE_CODE_32__ 来自 __INLINE_CODE_33__ 包。

#### 使用 Fastify

首先，安装所需的包：

__CODE_BLOCK_4__

安装完成后，注册 __INLINE_CODE_34__ 插件：

__CODE_BLOCK_5__

现在，您可以在路由处理程序中读取 cookie，如下所示：

__CODE_BLOCK_6__

> info **提示** __INLINE_CODE_35__ 装饰器来自 __INLINE_CODE_36__，而 __INLINE_CODE_37__ 来自 __INLINE_CODE_38__ 包。

要将 cookie 附加到出站响应中，请使用 __INLINE_CODE_39__ 方法：

__CODE_BLOCK_7__

要了解更多关于 __INLINE_CODE_40__ 方法，请查看 __LINK_52__。

> warning **警告** 如果您想留下响应处理逻辑给框架，请记住将 __INLINE_CODE_41__ 选项设置为 __INLINE_CODE_42__，如上所示。更多信息请查看 __LINK_53__。

> info **提示** __INLINE_CODE_43__ 装饰器来自 __INLINE_CODE_44__，而 __INLINE_CODE_45__ 来自 __INLINE_CODE_46__ 包。

#### 创建一个自定义装饰器（跨平台）

为了提供一个便捷的，声明式方式来访问 incoming cookie，我们可以创建一个 __LINK_54__。

__CODE_BLOCK_8__

__INLINE_CODE_47__ 装饰器将从 __INLINE_CODE_48__ 对象中提取所有 cookie，或者指定 cookie，并将该值 population 到装饰参数中。

现在，我们可以在路由处理程序签名中使用装饰器，如下所示：

__CODE_BLOCK_9__