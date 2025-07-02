### CSRF 防护

跨站请求伪造（CSRF 或 XSRF）是一种攻击方式，攻击者通过**未经授权**的方式以受信任用户的身份向网络应用发送恶意指令。为防止此类攻击，您可以使用 [csrf-csrf](https://github.com/Psifi-Solutions/csrf-csrf) 包。

#### 与 Express 配合使用（默认）

首先安装所需包：

```bash
$ npm i csrf-csrf
```

> warning **注意** 如 [csrf-csrf 文档](https://github.com/Psifi-Solutions/csrf-csrf?tab=readme-ov-file#入门)所述，该中间件需要预先初始化会话中间件或 `cookie-parser`。更多详情请参阅相关文档。

安装完成后，将 `csrf-csrf` 中间件注册为全局中间件。

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

#### 与 Fastify 一起使用

首先安装所需包：

```bash
$ npm i --save @fastify/csrf-protection
```

安装完成后，按如下方式注册 `@fastify/csrf-protection` 插件：

```typescript
import fastifyCsrf from '@fastify/csrf-protection';
// ...
// somewhere in your initialization file after registering some storage plugin
await app.register(fastifyCsrf);
```

> warning **警告** 如 `@fastify/csrf-protection` 文档[此处](https://github.com/fastify/csrf-protection#用法)所述，此插件需要先初始化存储插件。请参阅该文档以获取进一步说明。
