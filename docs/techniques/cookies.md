### Cookies

**HTTP cookie** 是存储在用户浏览器中的一小段数据。Cookies 的设计初衷是作为网站记忆状态信息的可靠机制。当用户再次访问网站时，cookie 会自动随请求发送。

#### 与 Express 配合使用（默认）

首先安装[所需包](https://github.com/expressjs/cookie-parser) （TypeScript 用户还需安装其类型声明）：

```shell
$ npm i cookie-parser
$ npm i -D @types/cookie-parser
```

安装完成后，将 `cookie-parser` 中间件作为全局中间件应用（例如在 `main.ts` 文件中）。

```typescript
import * as cookieParser from 'cookie-parser';
// somewhere in your initialization file
app.use(cookieParser());
```

你可以向 `cookieParser` 中间件传递多个选项：

- `secret` 用于签名 cookie 的字符串或数组。这是可选的，如果未指定，则不会解析已签名的 cookie。如果提供字符串，则将其用作密钥。如果提供数组，则会尝试按顺序使用每个密钥来验证 cookie 签名。
- `options` 一个对象，作为第二个参数传递给 `cookie.parse`。更多信息请参阅 [cookie](https://www.npmjs.org/package/cookie)。

该中间件会解析请求中的 `Cookie` 头部，并将 cookie 数据暴露为属性 `req.cookies`；如果提供了密钥，还会暴露为属性 `req.signedCookies`。这些属性是 cookie 名称与 cookie 值的键值对。

当提供密钥时，该模块会对已签名的 cookie 值进行解密验证，并将这些键值对从 `req.cookies` 移动到 `req.signedCookies`。已签名的 cookie 是指值以 `s:` 为前缀的 cookie。签名验证失败的 cookie 值将被置为 `false` 而非被篡改后的值。

完成此设置后，您现在可以在路由处理程序中读取 cookie，如下所示：

```typescript
@Get()
findAll(@Req() request: Request) {
  console.log(request.cookies); // or "request.cookies['cookieKey']"
  // or console.log(request.signedCookies);
}
```

:::info 提示
`@Req()` 装饰器需从 `@nestjs/common` 导入，而 `Request` 需从 `express` 包导入。
:::

要为输出响应附加 cookie，请使用 `Response#cookie()` 方法：

```typescript
@Get()
findAll(@Res({ passthrough: true }) response: Response) {
  response.cookie('key', 'value')
}
```

:::warning 警告
如果希望将响应处理逻辑交由框架处理，请记得将 `passthrough` 选项设为 `true`，如上所示。更多信息请参阅 [此处](/overview/controllers#库特定方法) 。
:::

:::info 提示
`@Res()` 装饰器从 `@nestjs/common` 导入，而 `Response` 则来自 `express` 包。
:::

#### 与 Fastify 一起使用

首先安装所需依赖包：

```shell
$ npm i @fastify/cookie
```

安装完成后，注册 `@fastify/cookie` 插件：

```typescript
import fastifyCookie from '@fastify/cookie';

// somewhere in your initialization file
const app = await NestFactory.create<NestFastifyApplication>(
  AppModule,
  new FastifyAdapter()
);
await app.register(fastifyCookie, {
  secret: 'my-secret', // for cookies signature
});
```

配置完成后，您现在可以在路由处理程序中读取 cookie，如下所示：

```typescript
@Get()
findAll(@Req() request: FastifyRequest) {
  console.log(request.cookies); // or "request.cookies['cookieKey']"
}
```

:::info 注意
`@Req()` 装饰器是从 `@nestjs/common` 导入的，而 `FastifyRequest` 则来自 `fastify` 包。
:::


要为传出响应附加 cookie，请使用 `FastifyReply#setCookie()` 方法：

```typescript
@Get()
findAll(@Res({ passthrough: true }) response: FastifyReply) {
  response.setCookie('key', 'value')
}
```

要了解更多关于 `FastifyReply#setCookie()` 方法的信息，请查看此[页面](https://github.com/fastify/fastify-cookie#sending) 。

:::warning 警告
 如果希望将响应处理逻辑交由框架处理，请记得将 `passthrough` 选项设为 `true`，如上所示。更多信息请参阅 [此处](/overview/controllers#库特定方法) 。
:::

:::info 提示
`@Res()` 装饰器从 `@nestjs/common` 导入，而 `FastifyReply` 则来自 `fastify` 包。
:::

#### 创建自定义装饰器（跨平台）

为提供便捷的声明式方法来访问传入的 cookies，我们可以创建一个[自定义装饰器](/custom-decorators) 。

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Cookies = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return data ? request.cookies?.[data] : request.cookies;
  }
);
```

`@Cookies()` 装饰器将从 `req.cookies` 对象中提取所有 cookie 或指定名称的 cookie，并用该值填充被装饰的参数。

通过这种方式，我们现在可以在路由处理程序签名中使用该装饰器，如下所示：

```typescript
@Get()
findAll(@Cookies('name') name: string) {}
```
