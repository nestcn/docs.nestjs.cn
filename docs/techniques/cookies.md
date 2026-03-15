<!-- 此文件从 content/techniques/cookies.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T05:20:09.600Z -->
<!-- 源文件: content/techniques/cookies.md -->

### Cookies

cookie 是用户浏览器存储的一小段数据。Cookies 是为了实现网站记忆状态信息而设计的。用户再次访问网站时，cookie 会自动随请求发送。

#### 使用 Express (默认)

首先安装 __LINK_49__ (TypeScript 用户请安装其类型):

```typescript
@Sse('sse')
sse(): Observable<MessageEvent> {
  return interval(1000).pipe(map((_) => ({ data: { hello: 'world' } })));
}

```

安装完成后，在您的 `Observable` 文件中将 `rxjs` 中间件作为全局中间件应用。

```typescript
export interface MessageEvent {
  data: string | object;
  id?: string;
  type?: string;
  retry?: number;
}

```

可以将多个选项传递给 `sse` 中间件：

- `sse`：用于签名 cookie 的字符串或数组。这个选项是可选的，如果不指定，将不会解析签名 cookie。如果提供的是字符串，则使用该字符串作为密钥。如果提供的是数组，则尝试使用每个密钥来解签名 cookie。
- `Observable`：对象，作为 `MessageEvent` 的第二个选项传递。有关更多信息，请查看 __LINK_50__。

中间件将解析 `MessageEvent` 请求头，并将 cookie 数据作为 `MessageEvent` 属性和（如果提供了密钥）作为 `EventSource` 属性暴露出来。这些属性是 cookie 名称到 cookie 值的键值对。

如果提供了密钥，这个模块将解签名和验证任何签名 cookie 值，并将那些名称值对从 `/sse` 移动到 `@Sse()`。签名 cookie 的值将以 `EventSource` 开头。如果签名 cookie 失败签名验证，将使用 `text/event-stream` 而不是被篡改的值。

现在，您可以在路由处理器中读取 cookie，如下所示：

```javascript
const eventSource = new EventSource('/sse');
eventSource.onmessage = ({ data }) => {
  console.log('New message', JSON.parse(data));
};

```

> info **hint** `EventSource.close()` 装饰器来自 `message`，而 __INLINE_CODE_25__ 来自 __INLINE_CODE_26__ 包。

要将 cookie 附加到出站响应中，请使用 __INLINE_CODE_27__ 方法：

__CODE_BLOCK_3__

> warning **warning** 如果您想让框架处理响应逻辑，请记住将 __INLINE_CODE_28__ 选项设置为 __INLINE_CODE_29__，如上所示。阅读更多 __LINK_51__。

> info **hint** __INLINE_CODE_30__ 装饰器来自 __INLINE_CODE_31__，而 __INLINE_CODE_32__ 来自 __INLINE_CODE_33__ 包。

#### 使用 Fastify

首先安装所需的包：

__CODE_BLOCK_4__

安装完成后，注册 __INLINE_CODE_34__ 插件：

__CODE_BLOCK_5__

现在，您可以在路由处理器中读取 cookie，如下所示：

__CODE_BLOCK_6__

> info **hint** __INLINE_CODE_35__ 装饰器来自 __INLINE_CODE_36__，而 __INLINE_CODE_37__ 来自 __INLINE_CODE_38__ 包。

要将 cookie 附加到出站响应中，请使用 __INLINE_CODE_39__ 方法：

__CODE_BLOCK_7__

要了解更多关于 __INLINE_CODE_40__ 方法，请查看 __LINK_52__。

> warning **warning** 如果您想让框架处理响应逻辑，请记住将 __INLINE_CODE_41__ 选项设置为 __INLINE_CODE_42__，如上所示。阅读更多 __LINK_53__。

> info **hint** __INLINE_CODE_43__ 装饰器来自 __INLINE_CODE_44__，而 __INLINE_CODE_45__ 来自 __INLINE_CODE_46__ 包。

#### 创建自定义装饰器（跨平台）

为了提供一个便捷的、声明式方式来访问 incoming cookies，我们可以创建一个 __LINK_54__。

__CODE_BLOCK_8__

__INLINE_CODE_47__ 装饰器将从 __INLINE_CODE_48__ 对象中提取所有 cookies 或指定的 cookie，並将该值填充到装饰的参数中。

现在，我们可以使用装饰器在路由处理器签名中，如下所示：

__CODE_BLOCK_9__