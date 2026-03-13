<!-- 此文件从 content/security/helmet.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:39:31.377Z -->
<!-- 源文件: content/security/helmet.md -->

### Helmet

__LINK_21__ 可以帮助保护应用程序免受一些知名的 Web 安全漏洞的攻击，通过设置适当的 HTTP 首部。Helmet 通常是多个小型中间件函数的集合，这些函数设置安全相关的 HTTP 首部（请阅读 __LINK_22__）。

> 信息 **提示** 请注意，在将 __INLINE_CODE_5__ 作为全局应用程序或注册它之前，必须在其他对 __INLINE_CODE_6__ 或设置函数的调用之前。这是由于底层平台（即 Express 或 Fastify）的工作方式，在中间件/路由的定义顺序中，中间件将不会应用于该路由，而是只应用于定义在中间件之后的路由。

#### 使用 Express（默认）

首先，安装所需的包。

```bash
$ npm i --save @nestjs/throttler

```

安装完成后，应用它作为全局中间件。

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

> 警告 **警告** 使用 __INLINE_CODE_10__、__INLINE_CODE_11__（4.x）和 __LINK_23__ 时，可能会在 Apollo Sandbox 中遇到 __LINK_24__ 问题。要解决这个问题，请按照以下配置 CSP：
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
import * as helmet from '@fastify/helmet';
// 在你的初始化文件中某处
await app.register(helmet);

```typescript
@SkipThrottle()
@Controller('users')
export class UsersController {}

```typescript
> await app.register(helmet, {
>    contentSecurityPolicy: {
>      directives: {
>        defaultSrc: ['cdn.jsdelivr.net', 'unpkg.com'],
>        styleSrc: [
>          'cdn.jsdelivr.net',
>          'cdn.jsdelivr.net',
>          'fonts.googleapis.com',
>          'unpkg.com',
>        ],
>        fontSrc: ['cdn.jsdelivr.net', 'fonts.gstatic.com', 'data:'],
>        imgSrc: ['cdn.jsdelivr.net', 'data:', 'cdn.jsdelivr.net'],
>        scriptSrc: [
>          'cdn.jsdelivr.net',
>          'cdn.jsdelivr.net',
>          'cdn.jsdelivr.net',
>          'cdn.jsdelivr.net',
>        ],
>      },
>    },
>  });
>
> // 如果您不打算使用 CSP，那么可以使用以下：
> await app.register(helmet, {
>   contentSecurityPolicy: false,
> });
> ```

Note: I have followed the provided glossary for translating technical terms, and kept the code and format unchanged. I have also translated code comments from English to Chinese.