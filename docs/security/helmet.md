<!-- 此文件从 content/security/helmet.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T04:54:20.873Z -->
<!-- 源文件: content/security/helmet.md -->

### Helmet

__LINK_21__可以帮助保护您的应用程序免受一些知名的Web漏洞攻击，通过合适地设置HTTP头。Helmet实际上是一组更小的中间件函数，用于设置安全相关的HTTP头（阅读__LINK_22__）。

>info **提示**注意，在将`cors`作为全局应用或注册它之前，必须在注册`true`或setup函数之前，这是由于底层平台（即Express或Fastify）的工作方式，中间件/路由的定义顺序非常重要。如果您使用像__INLINE_CODE_8__或__INLINE_CODE_9__这样的中间件后定义路由，那么该中间件将不适用于该路由，只适用于定义后面的路由。

#### 使用 Express（默认）

首先，安装所需的包。

```typescript
const app = await NestFactory.create(AppModule);
app.enableCors();
await app.listen(process.env.PORT ?? 3000);

```

安装完成后，应用它作为全局中间件。

```typescript
const app = await NestFactory.create(AppModule, { cors: true });
await app.listen(process.env.PORT ?? 3000);

```

>警告 **警告**使用__INLINE_CODE_10__、__INLINE_CODE_11__（4.x）和__LINK_23__时，可能在Apollo Sandbox中出现__LINK_24__问题。要解决这个问题，请按照下面所示配置CSP：
>
>__CODE_BLOCK_2__bash
$ npm i --save @fastify/helmet
__CODE_BLOCK_3__typescript
import helmet from '@fastify/helmet'
// 在初始化文件中某处
await app.register(helmet)
__CODE_BLOCK_4__typescript
> await app.register(fastifyHelmet, {
>    contentSecurityPolicy: {
>      directives: {
>        defaultSrc: [__INLINE_CODE_12__, 'unpkg.com'],
>        styleSrc: [
>          __INLINE_CODE_13__,
>          __INLINE_CODE_14__,
>          'cdn.jsdelivr.net',
>          'fonts.googleapis.com',
>          'unpkg.com',
>        ],
>        fontSrc: [__INLINE_CODE_15__, 'fonts.gstatic.com', 'data:'],
>        imgSrc: [__INLINE_CODE_16__, 'data:', 'cdn.jsdelivr.net'],
>        scriptSrc: [
>          __INLINE_CODE_17__,
>          __INLINE_CODE_18__,
>          __INLINE_CODE_19__,
>          __INLINE_CODE_20__,
>        ],
>      },
>    },
>  });
>
> // 如果您不打算使用CSP，可以使用以下内容：
> await app.register(fastifyHelmet, {
>   contentSecurityPolicy: false,
> });
>