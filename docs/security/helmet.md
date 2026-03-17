<!-- 此文件从 content/security/helmet.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:17:59.477Z -->
<!-- 源文件: content/security/helmet.md -->

### Helmet

__LINK_21__可以帮助保护您的应用程序免受一些常见的Web漏洞攻击，通过设置适当的HTTP头。 Helmet只是一个集合小型的中间件函数，它们设置安全相关的HTTP头（请阅读 __LINK_22__）。

> 信息 **提示**请注意，在将 __INLINE_CODE_5__ 作为全局应用或注册它之前，必须在其他调用 __INLINE_CODE_6__ 或 setup函数之前执行。这是因为底层平台（即Express或Fastify）的工作方式，中间件/路由的顺序定义很重要。如果您使用中间件像 __INLINE_CODE_8__ 或 __INLINE_CODE_9__，然后定义一个路由，那么该中间件将不应用于该路由，而是应用于定义后面的路由。

#### 使用与 Express（默认）

首先，安装所需的包。

```bash
$ npm i --save @nestjs/throttler

```

安装完成后，将其作为全局中间件应用。

```typescript
@Module({
  imports: [
     ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 10,
        },
      ],
    }),
  ],
})
export class AppModule {}

```

> 警告 **警告**使用 __INLINE_CODE_10__、 __INLINE_CODE_11__（4.x）和 __LINK_23__时，可能会在 Apollo Sandbox 中出现 __LINK_24__问题。要解决这个问题，请按照下面配置 CSP：
>
> ```typescript
{
  provide: APP_GUARD,
  useClass: ThrottlerGuard
}

```bash
$ npm i --save @fastify/helmet

```typescript
@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 3,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 20
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100
      }
    ]),
  ],
})
export class AppModule {}

```typescript
import helmet from '@fastify/helmet'
// 在您的初始化文件中某个地方
await app.register(helmet)

```typescript
@SkipThrottle()
@Controller('users')
export class UsersController {}

```typescript
> await app.register(fastifyHelmet, {
>    contentSecurityPolicy: {
>      directives: {
>        defaultSrc: [__INLINE_CODE_12__, 'unpkg.com'],
>        styleSrc: [
>          `@nestjs/throttler`,
>          `ThrottlerModule`,
>          'cdn.jsdelivr.net',
>          'fonts.googleapis.com',
>          'unpkg.com',
>        ],
>        fontSrc: [`forRoot`, 'fonts.gstatic.com', 'data:'],
>        imgSrc: [`forRootAsync`, 'data:', 'cdn.jsdelivr.net'],
>        scriptSrc: [
>          `ttl`,
>          `limit`,
>          `ThrottlerGuard`,
>          `@SkipThrottle()`,
>        ],
>      },
>    },
>  });
>
> // 如果您不打算使用 CSP，那么可以使用以下：
> await app.register(fastifyHelmet, {
>   contentSecurityPolicy: false,
> });
> ```

Note: I followed the translation requirements and guidelines provided. I translated the content, kept the code examples and variable names unchanged, and maintained the Markdown formatting, links, and images. I also translated the code comments from English to Chinese.