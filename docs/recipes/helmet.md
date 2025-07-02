### 头盔

[Helmet](https://github.com/helmetjs/helmet) 通过适当设置 HTTP 头部，可帮助保护您的应用免受一些众所周知的网络漏洞攻击。通常来说，Helmet 只是一组设置安全相关 HTTP 头部的小型中间件函数集合（ [了解更多](https://github.com/helmetjs/helmet#how-it-works) ）。

> **提示** 请注意，将 `helmet` 作为全局应用或注册时，必须放在其他调用 `app.use()` 或可能调用 `app.use()` 的设置函数之前。这是由于底层平台（如 Express 或 Fastify）的工作机制决定的，中间件/路由的定义顺序至关重要。如果您在定义路由后才使用像 `helmet` 或 `cors` 这样的中间件，则该中间件将不会应用于该路由，而只会应用于中间件之后定义的路由。

#### 与 Express 配合使用（默认）

首先安装所需的软件包。

```bash
$ npm i --save helmet
```

安装完成后，将其作为全局中间件应用。

```typescript
import helmet from 'helmet';
// somewhere in your initialization file
app.use(helmet());
```

> warning **警告** 当同时使用 `helmet`、`@apollo/server` (4.x) 和 [Apollo Sandbox](../graphql/quick-start#apollo-sandbox) 时，Apollo Sandbox 的 [CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) 可能会出现问题。要解决此问题，请按如下方式配置 CSP：
>
> ```typescript
> app.use(
>   helmet({
>     crossOriginEmbedderPolicy: false,
>     contentSecurityPolicy: {
>       directives: {
>         imgSrc: [
>           `'self'`,
>           'data:',
>           'apollo-server-landing-page.cdn.apollographql.com',
>         ],
>         scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
>         manifestSrc: [
>           `'self'`,
>           'apollo-server-landing-page.cdn.apollographql.com',
>         ],
>         frameSrc: [`'self'`, 'sandbox.embed.apollographql.com'],
>       },
>     },
>   })
> );
> ```
```

#### 与 Fastify 一起使用

如果使用 `FastifyAdapter`，请安装 [@fastify/helmet](https://github.com/fastify/fastify-helmet) 包：

```bash
$ npm i --save @fastify/helmet
```

[fastify-helmet](https://github.com/fastify/fastify-helmet) 不应作为中间件使用，而应作为 [Fastify 插件](https://www.fastify.io/docs/latest/Reference/Plugins/) ，即通过 `app.register()` 方法注册：

```typescript
import helmet from '@fastify/helmet';
// somewhere in your initialization file
await app.register(helmet);
```

> **警告** 当同时使用 `apollo-server-fastify` 和 `@fastify/helmet` 时，GraphQL playground 的 [CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) 可能会出现问题，要解决此冲突，请按如下方式配置 CSP：
>
> ```typescript
> await app.register(fastifyHelmet, {
>   contentSecurityPolicy: {
>     directives: {
>       defaultSrc: [`'self'`, 'unpkg.com'],
>       styleSrc: [
>         `'self'`,
>         `'unsafe-inline'`,
>         'cdn.jsdelivr.net',
>         'fonts.googleapis.com',
>         'unpkg.com',
>       ],
>       fontSrc: [`'self'`, 'fonts.gstatic.com', 'data:'],
>       imgSrc: [`'self'`, 'data:', 'cdn.jsdelivr.net'],
>       scriptSrc: [
>         `'self'`,
>         `https: 'unsafe-inline'`,
>         `cdn.jsdelivr.net`,
>         `'unsafe-eval'`,
>       ],
>     },
>   },
> });
>
> // If you are not going to use CSP at all, you can use this:
> await app.register(fastifyHelmet, {
>   contentSecurityPolicy: false,
> });
> ```
```
