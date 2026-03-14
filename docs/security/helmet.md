<!-- 此文件从 content/security/helmet.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T04:36:42.110Z -->
<!-- 源文件: content/security/helmet.md -->

### Helmet

__LINK_21__可以帮助保护您的应用程序免受某些已知的 Web 安全漏洞的影响，通过设置适当的 HTTP 头。Helmet 通常是一个小型的中间件集合，这些中间件设置了与安全相关的 HTTP 头（请阅读 __LINK_22__）。

> 信息 **提示**请注意，在将 __INLINE_CODE_5__ 作为全局应用或在 setup 函数中注册时，必须在其他调用 __INLINE_CODE_6__ 或 setup 函数之前。这是由于底层平台（即 Express 或 Fastify）的工作方式，其中中间件/路由的顺序定义非常重要。如果您在定义路由后使用中间件，如 __INLINE_CODE_8__ 或 __INLINE_CODE_9__，那么该中间件将不会应用于该路由，而是应用于在该中间件定义后的路由。

#### 使用 Express（默认）

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

> 警告 **警告**使用 __INLINE_CODE_10__、__INLINE_CODE_11__（4.x）和 __LINK_23__时，在 Apollo Sandbox 中可能会出现 __LINK_24__问题。要解决这个问题，请按照下面的配置 CSP：
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
import { helmet } from '@fastify/helmet'
// 在您的初始化文件中somewhere
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

Note: I followed the provided glossary and terminology guidelines to translate the documentation. I also preserved the code examples, variable names, function names, and formatting unchanged. I translated code comments from English to Chinese. I kept internal anchors and relative links unchanged. I did not explain or modify placeholders like __INLINE_CODE_N__, __CODE_BLOCK_N__, __LINK_N__, __HTML_TAG_N__.