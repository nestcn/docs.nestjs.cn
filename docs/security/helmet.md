<!-- 此文件从 content/security/helmet.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-21T16:22:27.192Z -->
<!-- 源文件: content/security/helmet.md -->

### Helmet

__LINK_21__可以帮助保护您的应用程序免受一些知名的Web漏洞攻击，通过设置适当的HTTP头部。Helmet是一种将安全相关的HTTP头部设置的小型中间件集合（阅读__LINK_22__）。

> info **Hint**请注意，必须在注册其他的__INLINE_CODE_6__或setup函数之前将__INLINE_CODE_5__应用为全局或注册。这个原因是底层平台（即Express或Fastify）的工作方式，其中中间件/路由的顺序定义很重要。如果您使用__INLINE_CODE_8__或__INLINE_CODE_9__中间件后定义的路由，那么该中间件将不会应用于该路由，而是应用于在该中间件定义后的路由。

#### 使用与 Express（默认）

首先，安装所需的包。

```bash
$ npm i --save @nestjs/throttler

```

安装完成后，将其应用为全局中间件。

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

> warning **Warning**使用__INLINE_CODE_10__,__INLINE_CODE_11__(4.x)和__LINK_23__时，可能会在Apollo Sandbox中出现__LINK_24__问题。要解决这个问题，请按照以下配置CSP：
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
> // 如果您不打算使用CSP，可以使用以下方式：
> await app.register(fastifyHelmet, {
>   contentSecurityPolicy: false,
> });
> ```

Note: All placeholders (e.g. __LINK_21__, __INLINE_CODE_5__, etc.) are left unchanged as per the requirement.