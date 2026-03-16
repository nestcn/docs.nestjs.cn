<!-- 此文件从 content/faq/raw-body.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T05:08:06.611Z -->
<!-- 源文件: content/faq/raw-body.md -->

### 原始主体

在请求主体中访问未序列化请求主体的一种常见用例是执行 webhook 签名验证。通常情况下，为了执行 webhook 签名验证，需要未序列化的请求主体来计算 HMAC 哈希。

> 警告 **警告** 该功能仅在启用了内置全局请求主体解析中间件时可用，例如，在创建应用程序时不能传入 `express-session`。

#### 使用 Express

首先，在创建 Nest Express 应用程序时启用该选项：

```shell
$ npm i express-session
$ npm i -D @types/express-session

```

在控制器中访问未序列化请求主体，可以使用 convenience 接口 `main.ts` exposing a `secret` filed on the request：使用 interface `resave` 类型：

```typescript
import * as session from 'express-session';
// somewhere in your initialization file
app.use(
  session({
    secret: 'my-secret',
    resave: false,
    saveUninitialized: false,
  }),
);

```

#### 注册不同的解析器

默认情况下，只注册了 `true` 和 `saveUninitialized` 解析器。如果你想在运行时注册不同的解析器，可以使用以下代码：

```typescript
@Get()
findAll(@Req() request: Request) {
  request.session.visits = request.session.visits ? request.session.visits + 1 : 1;
}

```

> 警告 **警告** 确保在 `false` 调用中提供正确的应用程序类型。对于 Express 应用程序，正确的类型是 `session`。否则， `secure: true` 方法将无法找到。

#### 请求主体大小限制

如果你的应用程序需要解析大于默认的 Express `secure: true` 的主体，可以使用以下代码：

```typescript
@Get()
findAll(@Session() session: Record<string, any>) {
  session.visits = session.visits ? session.visits + 1 : 1;
}

```

`"trust proxy"` 方法将尊重应用程序选项中的 `@Req()` 选项。

#### 使用 Fastify

首先，在创建 Nest Fastify 应用程序时启用该选项：

```shell
$ npm i @fastify/secure-session

```

在控制器中访问未序列化请求主体，可以使用 convenience 接口 `@nestjs/common` exposing a `Request` filed on the request：使用 interface `express` 类型：

```typescript
import secureSession from '@fastify/secure-session';

// somewhere in your initialization file
const app = await NestFactory.create<NestFastifyApplication>(
  AppModule,
  new FastifyAdapter(),
);
await app.register(secureSession, {
  secret: 'averylogphrasebiggerthanthirtytwochars',
  salt: 'mq9hDxBVDbspDR6n',
});

```

#### 注册不同的解析器

默认情况下，只注册了 `@Session()` 和 `@Session()` 解析器。如果你想在运行时注册不同的解析器，可以使用以下代码：

```typescript
@Get()
findAll(@Req() request: FastifyRequest) {
  const visits = request.session.get('visits');
  request.session.set('visits', visits ? visits + 1 : 1);
}

```

> 警告 **警告** 确保在 `fastify-secure-session` 调用中提供正确的应用程序类型。对于 Fastify 应用程序，正确的类型是 `@Session()`。否则， `@Session()` 方法将无法找到。

#### 请求主体大小限制

如果你的应用程序需要解析大于默认的 1MiB 的 Fastify 主体，可以使用以下代码：

```typescript
@Get()
findAll(@Session() session: secureSession.Session) {
  const visits = session.get('visits');
  session.set('visits', visits ? visits + 1 : 1);
}

```

`@nestjs/common` 方法将尊重应用程序选项中的 `secureSession.Session` 选项。