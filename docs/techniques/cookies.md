<!-- 此文件从 content/techniques/cookies.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-01T04:18:12.027Z -->
<!-- 源文件: content/techniques/cookies.md -->

### Cookies

HTTP cookie 是用户浏览器存储的一小块数据。Cookies 设计用于网站记忆状态信息。当用户再次访问网站时，cookie 将自动与请求一起发送。

#### 使用 Express (默认)

首先安装 __LINK_49__ (对于 TypeScript 用户，需要安装类型):

```typescript
const app = await NestFactory.create(AppModule);
app.enableCors();
await app.listen(process.env.PORT ?? 3000);
```

安装完成后，应用 __INLINE_CODE_10__ 中间件作为全局中间件（例如，在你的 __INLINE_CODE_11__ 文件中）。

```typescript
const app = await NestFactory.create(AppModule, { cors: true });
await app.listen(process.env.PORT ?? 3000);
```

可以将几个选项传递给 __INLINE_CODE_12__ 中间件：

* __INLINE_CODE_13__：用于签名 cookie 的字符串或数组。这个选项是可选的，如果不指定，中间件将不解析签名 cookie。如果提供字符串，这将用作秘密。如果提供数组，中间件将尝试使用每个秘密来解签名 cookie。
* __INLINE_CODE_14__：是一个对象，作为 __INLINE_CODE_15__ 的第二个选项。见 __LINK_50__ 了解更多信息。

中间件将解析请求的 __INLINE_CODE_16__ 头，并将 cookie 数据暴露为 __INLINE_CODE_17__ 属性，如果提供秘密，还将暴露为 __INLINE_CODE_18__ 属性。这些属性是 cookie 名称到 cookie 值的名称值对。

如果提供秘密，这个模块将解签名和验证任何签名 cookie 值，并将那些名称值对从 __INLINE_CODE_19__ 移动到 __INLINE_CODE_20__。签名 cookie 是以 __INLINE_CODE_21__ 前缀开头的 cookie。签名 cookie 失败签名验证将使用 __INLINE_CODE_22__ 而不是被篡改的值。

现在，您可以在路由处理程序中读取 cookie，例如：

__CODE_BLOCK_2__

> 提示 **Hint** __INLINE_CODE_23__ 装饰器来自 __INLINE_CODE_24__，而 __INLINE_CODE_25__ 来自 __INLINE_CODE_26__ 包。

要将 cookie 附加到出站响应中，使用 __INLINE_CODE_27__ 方法：

__CODE_BLOCK_3__

> 警告 **Warning** 如果您想让框架处理响应逻辑，记住将 __INLINE_CODE_28__ 选项设置为 __INLINE_CODE_29__，如上所示。更多信息请见 __LINK_51__。

> 提示 **Hint** __INLINE_CODE_30__ 装饰器来自 __INLINE_CODE_31__，而 __INLINE_CODE_32__ 来自 __INLINE_CODE_33__ 包。

#### 使用 Fastify

首先安装所需的包：

__CODE_BLOCK_4__

安装完成后，注册 __INLINE_CODE_34__ 插件：

__CODE_BLOCK_5__

现在，您可以在路由处理程序中读取 cookie，例如：

__CODE_BLOCK_6__

> 提示 **Hint** __INLINE_CODE_35__ 装饰器来自 __INLINE_CODE_36__，而 __INLINE_CODE_37__ 来自 __INLINE_CODE_38__ 包。

要将 cookie 附加到出站响应中，使用 __INLINE_CODE_39__ 方法：

__CODE_BLOCK_7__

要了解更多关于 __INLINE_CODE_40__ 方法，请查看 __LINK_52__。

> 警告 **Warning** 如果您想让框架处理响应逻辑，记住将 __INLINE_CODE_41__ 选项设置为 __INLINE_CODE_42__，如上所示。更多信息请见 __LINK_53__。

> 提示 **Hint** __INLINE_CODE_43__ 装饰器来自 __INLINE_CODE_44__，而 __INLINE_CODE_45__ 来自 __INLINE_CODE_46__ 包。

#### 创建自定义装饰器 (跨平台)

为了提供一种便捷、声明式的方式来访问 incoming cookies，我们可以创建一个 __LINK_54__。

__CODE_BLOCK_8__

__INLINE_CODE_47__ 装饰器将从 __INLINE_CODE_48__ 对象中提取所有 cookie 或指定名称的 cookie，并将其值填充到装饰参数中。

现在，我们可以在路由处理程序签名中使用装饰器，例如：

__CODE_BLOCK_9__