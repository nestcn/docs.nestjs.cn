<!-- 此文件从 content/security/csrf.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-21T16:22:05.261Z -->
<!-- 源文件: content/security/csrf.md -->

### CSRF 保护

跨站请求伪造（CSRF 或 XSRF）是一种攻击，其中来自可靠用户的未经授权的命令将被发送到 Web 应用程序。为了帮助防止这种攻击，您可以使用 [csrf-csrf](https://github.com/Psifi-Solutions/csrf-csrf) 包。

#### 使用 Express（默认）

首先，安装所需的包：

```bash
$ npm i csrf-csrf

```

> 警告 **警告**，如 [csrf-csrf documentation](https://github.com/Psifi-Solutions/csrf-csrf?tab=readme-ov-file#入门) 中所提到的，这个中间件需要会话中间件或 `cookie-parser` 之前初始化。请参阅文档以获取更多信息。

安装完成后，注册 `csrf-csrf` 中间件作为全局中间件。

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

#### 使用 Fastify

首先，安装所需的包：

```bash
$ npm i --save @fastify/csrf-protection

```

安装完成后，注册 `@fastify/csrf-protection` 插件，以下是注册方式：

```typescript
import fastifyCsrf from '@fastify/csrf-protection';
// ...
// somewhere in your initialization file after registering some storage plugin
await app.register(fastifyCsrf);

```

> 警告 **警告**，如 `@fastify/csrf-protection` 文档 [here](https://github.com/fastify/csrf-protection#用法) 中所解释的，这个插件需要在初始化存储插件之前。请参阅文档以获取更多信息。