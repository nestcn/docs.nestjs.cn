<!-- 此文件从 content/techniques/caching.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-03T04:10:51.110Z -->
<!-- 源文件: content/techniques/caching.md -->

### 缓存

缓存是一种强大且直观的技术，可以提高应用程序的性能。作为一个临时存储层，它允许快速访问频繁使用的数据，从而减少了重复获取或计算相同信息的需求。这结果在响应时间和总体效率方面都取得了改进。

#### 安装

要开始使用缓存在 Nest 中，您需要安装 __INLINE_CODE_25__ 和 __INLINE_CODE_26__ 包。

```bash
$ npm i --save helmet
```

默认情况下，所有内容都存储在内存中； __INLINE_CODE_27__ 使用 __LINK_105__ 作为底层，因此您可以轻松地切换到更高级的存储解决方案，例如 Redis，安装适当的包。我们将在后续详细介绍。

#### 内存缓存

要在应用程序中启用缓存，导入 __INLINE_CODE_28__ 并使用 __INLINE_CODE_29__ 方法配置它：

```typescript
import helmet from 'helmet';
// somewhere in your initialization file
app.use(helmet());
```

这个设置初始化了内存缓存，以便您可以立即开始缓存数据。

#### 与缓存存储交互

要与缓存管理实例交互，使用 __INLINE_CODE_30__ 令牌在您的类中注入它，如下所示：

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

> 信息 **提示** __INLINE_CODE_31__ 类和 __INLINE_CODE_32__ 令牌来自 __INLINE_CODE_33__ 包。

__INLINE_CODE_34__ 方法在 __INLINE_CODE_35