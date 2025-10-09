### Helmet

[Helmet](https://github.com/helmetjs/helmet) 可以通过适当设置 HTTP 头部来帮助保护您的应用程序免受一些已知的 Web 漏洞的攻击。一般来说，Helmet 只是一个较小中间件函数的集合，这些函数设置与安全相关的 HTTP 头部（阅读[更多](https://github.com/helmetjs/helmet#how-it-works)）。

:::info 提示
请注意，将 `helmet` 应用为全局中间件或注册它必须在其他调用 `app.use()` 或可能调用 `app.use()` 的设置函数之前进行。这是由于底层平台（即 Express 或 Fastify）的工作方式，其中定义中间件/路由的顺序很重要。如果您在定义路由后使用像 `helmet` 或 `cors` 这样的中间件，那么该中间件将不会应用于该路由，它只会应用于在中间件之后定义的路由。
:::



#### 与 Express 一起使用（默认）

首先安装所需的包。

```bash
$ npm i --save helmet
```

安装完成后，将其作为全局中间件应用。

```typescript
import helmet from 'helmet';
// 在您的初始化文件中的某处
app.use(helmet());
```

:::warning 警告
当使用 `helmet`、`@apollo/server`（4.x）和 [Apollo Sandbox](../graphql/quick-start#apollo-sandbox) 时，Apollo Sandbox 上可能会出现 [CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) 问题。要解决此问题，请按如下所示配置 CSP：
:::


>
> ```typescript
> app.use(helmet({
>   crossOriginEmbedderPolicy: false,
>   contentSecurityPolicy: {
>     directives: {
>       imgSrc: [`'self'`, 'data:', 'apollo-server-landing-page.cdn.apollographql.com'],
>       scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
>       manifestSrc: [`'self'`, 'apollo-server-landing-page.cdn.apollographql.com'],
>       frameSrc: [`'self'`, 'sandbox.embed.apollographql.com'],
>     },
>   },
> }));
> ```

#### 与 Fastify 一起使用

如果您使用 `FastifyAdapter`，请安装 [@fastify/helmet](https://github.com/fastify/fastify-helmet) 包：

```bash
$ npm i --save @fastify/helmet
```

[fastify-helmet](https://github.com/fastify/fastify-helmet) 不应用作中间件，而应作为 [Fastify 插件](https://www.fastify.io/docs/latest/Reference/Plugins/)，即通过使用 `app.register()`：

```typescript
import helmet from '@fastify/helmet'
// 在您的初始化文件中的某处
await app.register(helmet)
```

:::warning 警告
当使用 `apollo-server-fastify` 和 `@fastify/helmet` 时，GraphQL playground 上可能会出现 [CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) 问题，要解决此冲突，请按如下所示配置 CSP：
:::


>
> ```typescript
> await app.register(fastifyHelmet, {
>    contentSecurityPolicy: {
>      directives: {
>        defaultSrc: [`'self'`, 'unpkg.com'],
>        styleSrc: [
>          `'self'`,
>          `'unsafe-inline'`,
>          'cdn.jsdelivr.net',
>          'fonts.googleapis.com',
>          'unpkg.com',
>        ],
>        fontSrc: [`'self'`, 'fonts.gstatic.com', 'data:'],
>        imgSrc: [`'self'`, 'data:', 'cdn.jsdelivr.net'],
>        scriptSrc: [
>          `'self'`,
>          `https: 'unsafe-inline'`,
>          `cdn.jsdelivr.net`,
>          `'unsafe-eval'`,
>        ],
>      },
>    },
>  });
>
> // 如果您根本不打算使用 CSP，可以使用此方法：
> await app.register(fastifyHelmet, {
>   contentSecurityPolicy: false,
> });
> ```
