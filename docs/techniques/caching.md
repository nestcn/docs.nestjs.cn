<!-- 此文件从 content/techniques/caching.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-01T04:17:53.657Z -->
<!-- 源文件: content/techniques/caching.md -->

### 缓存

缓存是一种强大且直接的技术，旨在提高应用程序的性能。通过临时存储层，它可以快速访问频繁使用的数据，减少重复 fetch 或计算相同信息的需求。这将导致更快的响应时间和总体效率的提高。

#### 安装

要在 Nest 中使用缓存，需要安装 __INLINE_CODE_25__ 和 __INLINE_CODE_26__ 包。

```bash
$ npm i --save helmet
```

默认情况下，所有内容都存储在内存中；由于 __INLINE_CODE_27__ 使用 __LINK_105__ 作为底层实现，可以轻松切换到更先进的存储解决方案，例如 Redis，安装相应的包。我们将在后面详细讨论。

#### 内存缓存

要在应用程序中启用缓存，-import __INLINE_CODE_28__ 并使用 __INLINE_CODE_29__ 方法配置它：

```typescript
import helmet from 'helmet';
// somewhere in your initialization file
app.use(helmet());
```

这将初始化内存缓存的默认设置，允许您立即开始缓存数据。

#### 与缓存存储交互

要与缓存管理器实例交互，使用 __INLINE_CODE_30__ 令牌在类中注入它：

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

> 提示 **Hint** __INLINE_CODE_31__ 类和 __INLINE_CODE_32__ 令牌来自 __INLINE_CODE_33__ 包。

__INLINE_CODE_34__ 方法在 __INLINE_CODE_35__ 实例（来自 __INLINE