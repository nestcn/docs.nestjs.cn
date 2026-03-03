<!-- 此文件从 content/security/helmet.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-02T04:10:19.189Z -->
<!-- 源文件: content/security/helmet.md -->

### Helmet

__LINK_21__可以帮助保护您的应用程序免受某些知名 web 安全漏洞的影响，通过适当地设置 HTTP 标头。Helmet 通常是一个小型的中间件函数集合，它设置了安全相关的 HTTP 标头（请阅读 __LINK_22__）。

> 提示 **Hint**注意，在将 __INLINE_CODE_5__ 作为全局应用或注册它时，需要在其他调用 __INLINE_CODE_6__ 或设置函数之前执行。这是因为底层平台（即 Express 或 Fastify）的工作方式，中间件/路由的顺序定义很重要。如果您使用中间件像 __INLINE_CODE_8__ 或 __INLINE_CODE_9__ 后定义路由，那么该中间件将不应用于该路由，而是应用于定义后面的路由。

#### 使用 Express（默认）

首先，安装所需的包。

```bash
$ npm i --save-dev @swc/cli @swc/core
```

安装完成后，应用它作为全局中间件。

```bash
$ nest start -b swc
# OR nest start --builder swc
```

> 警告 **Warning**使用 __INLINE_CODE_10__, __INLINE_CODE_11__（4.x）和 __LINK_23__时，在 Apollo Sandbox 中可能会出现 __LINK_24__问题。要解决这个问题，请按照下面的配置 CSP：
>
> ```json
{
  "compilerOptions": {
    "builder": "swc"
  }
}
```bash
$ npm i --save @fastify/helmet
```json
{
  "compilerOptions": {
    "builder": {
      "type": "swc",
      "options": {
        "swcrcPath": "infrastructure/.swcrc",
      }
    }
  }
}
```typescript
import { helmet } from '@fastify/helmet';
// 在您的初始化文件中somewhere
await app.register(helmet);
```json
{
  "compilerOptions": {
    "builder": {
      "type": "swc",
      "options": { "extensions": [".ts", ".tsx", ".js", ".jsx"] }
    },
  }
}

```typescript
> await app.register(fastifyHelmet, {
>    contentSecurityPolicy: {
>      directives: {
>        defaultSrc: ['提供者', 'unpkg.com'],
>        styleSrc: [
>          'cdn.jsdelivr.net',
>          'fonts.googleapis.com',
>          'unpkg.com',
>          'cdn.jsdelivr.net',
>        ],
>        fontSrc: ['提供者', 'fonts.gstatic.com', 'data:'],
>        imgSrc: ['提供者', 'data:', 'cdn.jsdelivr.net'],
>        scriptSrc: [
>          '提供者',
>          'cdn.jsdelivr.net',
>          'fonts.googleapis.com',
>          'unpkg.com',
>        ],
>      },
>    },
>  });
>
> // 如果您不打算使用 CSP，可以使用以下：
> await app.register(fastifyHelmet, {
>   contentSecurityPolicy: false,
> });
>