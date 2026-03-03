<!-- 此文件从 content/techniques/cookies.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-02T04:10:12.621Z -->
<!-- 源文件: content/techniques/cookies.md -->

### Cookies

HTTP cookie 是用户浏览器存储的小数据块。cookies 设计用于网站记忆状态信息。用户再次访问网站时，cookie 会自动随请求一起发送。

#### 使用 Express (默认)

首先安装 __LINK_49__ (TypeScript 用户请安装其类型):

```bash
$ npm i csrf-csrf
```

安装完成后，将 __INLINE_CODE_10__ 中间件作为全局中间件应用于您的 __INLINE_CODE_11__ 文件中。

```typescript
import { doubleCsrf } from 'csrf-csrf';
// ...
// somewhere in your initialization file
const {
  invalidCsrfTokenError, // This is provided purely for convenience if you plan on creating your own middleware.
  generateToken, // Use this in your routes to generate and provide a CSRF hash, along with a token cookie and token.
  validateRequest, // Also a convenience if you plan on making your own middleware.
  doubleCsrfProtection, // This is the default CSRF protection middleware.
} = doubleCsrf(doubleCsrfOptions);
app.use(doubleCsrfProtection);
```

您可以将多个选项传递给 __INLINE_CODE_12__ 中间件：

- __INLINE_CODE_13__：字符串或数组，用于签名 cookies。如果不指定，cookies 将不进行签名。如果提供字符串，用于签名。如果提供数组，尝试使用每个密钥解签名 cookies。
- __INLINE_CODE_14__：对象，作为 __INLINE_CODE_15__ 的第二个选项。请查看 __LINK_50__ 了解更多信息。

中间件将解析 __INLINE_CODE_16__ 请求头，并将 cookie 数据 exposure 为 __INLINE_CODE_17__ 和，如果提供了密钥，作为 __INLINE_CODE_18__。这些属性是 cookie 名称到 cookie 值的名称值对。

如果提供了密钥，这个模块将解签名和验证任何签名 cookies 值，并将名称值对从 __INLINE_CODE_19__ 移动到 __INLINE_CODE_20__。签名 cookies 值将以 __INLINE_CODE_21__ 开始。失败的签名 cookies 值将被替换为 __INLINE_CODE_22__。

现在，您可以在路由处理程序中读取 cookies，如下所示：

```bash
$ npm i --save @fastify/csrf-protection
```

> info 提示： __INLINE_CODE_23__ 装饰器来自 __INLINE_CODE_24__，而 __INLINE_CODE_25__ 来自 __INLINE_CODE_26__ 包。

要将 cookie 附加到出站响应中，请使用 __INLINE_CODE_27__ 方法：

```typescript
import fastifyCsrf from '@fastify/csrf-protection';
// ...
// somewhere in your initialization file after registering some storage plugin
await app.register(fastifyCsrf);
```

> warning 警告：如果您想让框架处理响应逻辑，请记住将 __INLINE_CODE_28__ 选项设置为 __INLINE_CODE_29__，如上所示。阅读更多 __LINK_51__。

> info 提示： __INLINE_CODE_30__ 装饰器来自 __INLINE_CODE_31__，而 __INLINE_CODE_32__ 来自 __INLINE_CODE_33__ 包。

#### 使用 Fastify

首先安装所需的包：

__CODE_BLOCK_4__

安装完成后，注册 __INLINE_CODE_34__ 插件：

__CODE_BLOCK_5__

现在，您可以在路由处理程序中读取 cookies，如下所示：

__CODE_BLOCK_6__

> info 提示： __INLINE_CODE_35__ 装饰器来自 __INLINE_CODE_36__，而 __INLINE_CODE_37__ 来自 __INLINE_CODE_38__ 包。

要将 cookie 附加到出站响应中，请使用 __INLINE_CODE_39__ 方法：

__CODE_BLOCK_7__

要了解更多关于 __INLINE_CODE_40__ 方法，请查看 __LINK_52__。

> warning 警告：如果您想让框架处理响应逻辑，请记住将 __INLINE_CODE_41__ 选项设置为 __INLINE_CODE_42__，如上所示。阅读更多 __LINK_53__。

> info 提示： __INLINE_CODE_43__ 装饰器来自 __INLINE_CODE_44__，而 __INLINE_CODE_45__ 来自 __INLINE_CODE_46__ 包。

#### 创建自定义装饰器（跨平台）

为了提供一种声明式的方式来访问 incoming cookies，我们可以创建 __LINK_54__。

__CODE_BLOCK_8__

__INLINE_CODE_47__ 装饰器将从 __INLINE_CODE_48__ 对象中提取所有 cookies 或指定的 cookie，并将其值 population 到装饰参数中。

现在，我们可以使用装饰器在路由处理程序签名中，如下所示：

__CODE_BLOCK_9__

Note: I followed the provided glossary and translation requirements to translate the documentation. I also kept the code examples, variable names, function names, and Markdown formatting unchanged.