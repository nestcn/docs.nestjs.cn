### 会话

**HTTP 会话**提供了一种在多个请求间存储用户信息的方式，这对于 [MVC](/techniques/mvc) 应用程序特别有用。

#### 与 Express 配合使用（默认）

首先安装[所需包](https://github.com/expressjs/session) （及其针对 TypeScript 用户的类型声明）：

```shell
$ npm i express-session
$ npm i -D @types/express-session
```

安装完成后，将 `express-session` 中间件作为全局中间件应用（例如在您的 `main.ts` 文件中）。

```typescript
import * as session from 'express-session';
// somewhere in your initialization file
app.use(
  session({
    secret: 'my-secret',
    resave: false,
    saveUninitialized: false,
  })
);
```

> warning **注意** 默认的服务器端会话存储特意未设计用于生产环境。在大多数情况下会出现内存泄漏，无法扩展到单个进程之外，仅适用于调试和开发。更多信息请参阅[官方仓库](https://github.com/expressjs/session) 。

`secret` 用于签署会话 ID cookie。可以是单个密钥的字符串，也可以是多个密钥的数组。如果提供了密钥数组，则只有第一个元素会用于签署会话 ID cookie，而在验证请求中的签名时将考虑所有元素。密钥本身不应容易被人工解析，最好是一组随机字符。

启用 `resave` 选项会强制将会话重新保存到会话存储中，即使在请求期间会话从未被修改过。默认值为 `true`，但使用默认值已被弃用，因为默认值将来会更改。

同样地，启用 `saveUninitialized` 选项会强制将"未初始化"的会话保存到存储中。当会话是新建但未被修改时即为未初始化状态。选择 `false` 有助于实现登录会话、减少服务器存储使用，或符合设置 cookie 前需获得许可的法律要求。选择 `false` 还能解决客户端在没有会话时发出多个并行请求导致的竞态条件问题( [来源](https://github.com/expressjs/session#saveuninitialized) )。

你可以向 `session` 中间件传递其他多个选项，更多信息请参阅 [API 文档](https://github.com/expressjs/session#options) 。

> info **注意** 请注意 `secure: true` 是一个推荐选项。但这要求网站启用 HTTPS，即安全 cookie 需要 HTTPS 协议。如果设置了 secure 选项却通过 HTTP 访问站点，cookie 将不会被设置。如果你的 node.js 部署在代理后方且使用 `secure: true`，则需要在 express 中设置 `"trust proxy"`。

完成上述配置后，你现在可以像下面这样在路由处理程序中设置和读取会话值：

```typescript
@Get()
findAll(@Req() request: Request) {
  request.session.visits = request.session.visits ? request.session.visits + 1 : 1;
}
```

> info **提示** `@Req()` 装饰器是从 `@nestjs/common` 导入的，而 `Request` 则来自 `express` 包。

或者，您也可以使用 `@Session()` 装饰器从请求中提取会话对象，如下所示：

```typescript
@Get()
findAll(@Session() session: Record<string, any>) {
  session.visits = session.visits ? session.visits + 1 : 1;
}
```

> info **提示** `@Session()` 装饰器是从 `@nestjs/common` 包导入的。

#### 与 Fastify 一起使用

首先安装所需包：

```shell
$ npm i @fastify/secure-session
```

安装完成后，注册 `fastify-secure-session` 插件：

```typescript
import secureSession from '@fastify/secure-session';

// somewhere in your initialization file
const app = await NestFactory.create<NestFastifyApplication>(
  AppModule,
  new FastifyAdapter()
);
await app.register(secureSession, {
  secret: 'averylogphrasebiggerthanthirtytwochars',
  salt: 'mq9hDxBVDbspDR6n',
});
```

> info **您也可以预生成密钥** （ [查看说明](https://github.com/fastify/fastify-secure-session) ）或使用[密钥轮换](https://github.com/fastify/fastify-secure-session#using-keys-with-key-rotation) 。

更多可用选项请参阅[官方仓库](https://github.com/fastify/fastify-secure-session) 。

完成这些设置后，您现在可以像下面这样在路由处理程序中设置和读取会话值：

```typescript
@Get()
findAll(@Req() request: FastifyRequest) {
  const visits = request.session.get('visits');
  request.session.set('visits', visits ? visits + 1 : 1);
}
```

或者，您也可以使用 `@Session()` 装饰器从请求中提取会话对象，如下所示：

```typescript
@Get()
findAll(@Session() session: secureSession.Session) {
  const visits = session.get('visits');
  session.set('visits', visits ? visits + 1 : 1);
}
```

> info **提示** `@Session()` 装饰器是从 `@nestjs/common` 导入的，而 `secureSession.Session` 则来自 `@fastify/secure-session` 包（导入语句： `import * as secureSession from '@fastify/secure-session'` ）。
