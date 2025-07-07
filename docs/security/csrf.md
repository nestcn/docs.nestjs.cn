### CSRF 防护

跨站请求伪造（CSRF 或 XSRF）是一种攻击类型，其中**未经授权的**命令从受信任的用户发送到 Web 应用程序。为了帮助防止这种情况，您可以使用 [csrf-csrf](https://github.com/Psifi-Solutions/csrf-csrf) 包。

#### 与 Express 一起使用（默认）

首先安装所需的包：

```bash
$ npm i csrf-csrf
```

> **警告** 如 [csrf-csrf 文档](https://github.com/Psifi-Solutions/csrf-csrf?tab=readme-ov-file#getting-started)中所述，此中间件需要预先初始化会话中间件或 `cookie-parser`。请参阅文档以获取更多详细信息。

安装完成后，将 `csrf-csrf` 中间件注册为全局中间件。

```typescript
import { doubleCsrf } from 'csrf-csrf';
// ...
// 在您的初始化文件中的某处
const {
  invalidCsrfTokenError, // 如果您计划创建自己的中间件，这纯粹是为了方便而提供的。
  generateToken, // 在您的路由中使用它来生成和提供 CSRF 哈希，以及令牌 cookie 和令牌。
  validateRequest, // 如果您计划制作自己的中间件，这也是一个便利功能。
  doubleCsrfProtection, // 这是默认的 CSRF 保护中间件。
} = doubleCsrf(doubleCsrfOptions);
app.use(doubleCsrfProtection);
```

#### 与 Fastify 一起使用

首先安装所需的包：

```bash
$ npm i --save @fastify/csrf-protection
```

安装完成后，注册 `@fastify/csrf-protection` 插件，如下所示：

```typescript
import fastifyCsrf from '@fastify/csrf-protection';
// ...
// 在注册某些存储插件后，在您的初始化文件中的某处
await app.register(fastifyCsrf);
```

> **警告** 如 `@fastify/csrf-protection` 文档[这里](https://github.com/fastify/csrf-protection#usage)所解释的，此插件需要首先初始化存储插件。请参阅该文档以获取进一步的说明。
