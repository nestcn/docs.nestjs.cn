<!-- 此文件从 content/security/csrf.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-12T13:42:20.376Z -->
<!-- 源文件: content/security/csrf.md -->

### CSRF 保护

跨站请求伪造（CSRF 或 XSRF）是一种攻击类型，其中**未经授权**的命令从受信任的用户发送到 Web 应用程序。为了帮助防止这种情况，你可以使用 [csrf-csrf](https://github.com/Psifi-Solutions/csrf-csrf) 包。

#### 在 Express 中使用（默认）

首先安装所需的包：

```bash
$ npm i csrf-csrf
```

> warning **警告** 如 [csrf-csrf 文档](https://github.com/Psifi-Solutions/csrf-csrf?tab=readme-ov-file#getting-started)中所述，此中间件需要事先初始化会话中间件或 `cookie-parser`。请参阅文档了解更多详细信息。

安装完成后，将 `csrf-csrf` 中间件注册为全局中间件。

```typescript
import { doubleCsrf } from 'csrf-csrf';
// ...
// 在你的初始化文件中
const {
  invalidCsrfTokenError, // 如果你计划创建自己的中间件，这纯粹是为了方便而提供的。
  generateToken, // 在你的路由中使用它来生成和提供 CSRF 哈希，以及令牌 cookie 和令牌。
  validateRequest, // 如果你计划制作自己的中间件，这也是一个便利工具。
  doubleCsrfProtection, // 这是默认的 CSRF 保护中间件。
} = doubleCsrf(doubleCsrfOptions);
app.use(doubleCsrfProtection);
```

#### 在 Fastify 中使用

首先安装所需的包：

```bash
$ npm i --save @fastify/csrf-protection
```

安装完成后，按如下方式注册 `@fastify/csrf-protection` 插件：

```typescript
import fastifyCsrf from '@fastify/csrf-protection';
// ...
// 在注册某些存储插件后的初始化文件中
await app.register(fastifyCsrf);
```

> warning **警告** 如 `@fastify/csrf-protection` 文档[这里](https://github.com/fastify/csrf-protection#usage)所述，此插件需要先初始化存储插件。请参阅该文档以获取更多说明。
