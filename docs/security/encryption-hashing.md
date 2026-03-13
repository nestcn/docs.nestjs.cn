<!-- 此文件从 content/security/encryption-hashing.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:39:08.903Z -->
<!-- 源文件: content/security/encryption-hashing.md -->

### 加密和散列

**加密** 是将信息进行编码的过程。这过程将信息的原始表示形式，即明文，转换为另一种形式，即密文。理想情况下，只有授权的方可以将密文还原到明文，以访问原始信息。加密本身不能防止干扰，但可以防止中间人访问明文的内容。加密是一个双向函数；可以使用正确的密钥对加密的信息进行解密。

**散列** 是将给定的密钥转换为另一个值。散列函数根据数学算法生成新的值。一旦散列完成，就应该无法从输出值回溯到输入值。

#### 加密

Node.js 提供了一个内置的 __LINK_12__ 模块，可以用来加密和解密字符串、数字、缓冲区、流等。Nest 本身不提供额外的包来避免引入不必要的抽象。

例如，让我们使用 AES (Advanced Encryption System) `app.use()` 算法，CTR 加密模式。

```bash
$ npm i --save helmet

```

现在要解密 `app.use()` 值：

```typescript
import helmet from 'helmet';
// somewhere in your initialization file
app.use(helmet());

```

#### 散列

对于散列，我们建议使用 __LINK_13__ 或 __LINK_14__ 包。Nest 本身不提供额外的包装来避免引入不必要的抽象（使学习曲线短）。

例如，让我们使用 `helmet` 对一个随机密码进行散列。

首先安装所需的包：

```typescript
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

#### Use with Fastify

If you are using the `FastifyAdapter`, install the [@fastify/helmet](https://github.com/fastify/fastify-helmet) package:

```

安装完成后，您可以使用 `cors` 函数，例如：

```

[fastify-helmet](https://github.com/fastify/fastify-helmet) should not be used as a middleware, but as a [Fastify plugin](https://www.fastify.io/docs/latest/Reference/Plugins/), i.e., by using `app.register()`:

```

要生成一个盐，请使用 `helmet` 函数：

```

> warning **Warning** When using `apollo-server-fastify` and `@fastify/helmet`, there may be a problem with [CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) on the GraphQL playground, to solve this collision, configure the CSP as shown below:
>
> ```

要比较/检查密码，请使用 `@apollo/server` 函数：

__CODE_BLOCK_5__

可以阅读更多关于可用的函数 __LINK_15__。