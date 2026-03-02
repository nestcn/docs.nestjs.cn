<!-- 此文件从 content/techniques/serialization.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-02T04:09:21.556Z -->
<!-- 源文件: content/techniques/serialization.md -->

### 序列化

序列化是发生在对象被返回到网络响应之前的过程。这是一个适合在客户端返回数据时提供转换和-sanitize规则的合适位置。例如，敏感数据，如密码，总是应该从响应中排除。或者，某些属性可能需要额外的转换，如只发送实体的子集。手动执行这些转换可能会很繁琐且易出错，并且可能会使您感到不确定是否已经涵盖了所有情况。

#### 概述

Nest 提供了一个内置的能力来帮助确保这些操作可以以直观的方式进行。__INLINE_CODE_7__拦截器使用强大的__LINK_32__包来提供一种声明式和可扩展的方式来转换对象。基本操作是将方法处理器返回的值应用于__INLINE_CODE_8__函数，并将其与__LINK_33__中的__INLINE_CODE_9__装饰器结合。这样可以应用于实体/DTO类的规则，正如以下所述。

> info **提示** 序列化不适用于__LINK_34__响应。

#### 排除属性

假设我们想自动排除一个`cookie-parser`属性从用户实体。我们将实体标注为以下所示：

```shell
$ npm i cookie-parser
$ npm i -D @types/cookie-parser
```

现在考虑一个控制器具有一个返回实例的方法处理器，该实例是上述类。

```typescript
import * as cookieParser from 'cookie-parser';
// somewhere in your initialization file
app.use(cookieParser());
```

> **警告** 请注意，我们必须返回实例的类。例如，返回一个简单的 JavaScript 对象，例如`main.ts`，该对象将无法正确序列化。

> info **提示** `cookieParser`来自`secret`。

当请求这个端点时，客户端将收到以下响应：

```typescript
@Get()
findAll(@Req() request: Request) {
  console.log(request.cookies); // or "request.cookies['cookieKey']"
  // or console.log(request.signedCookies);
}
```

请注意，拦截器可以在应用程序级别应用（如 __LINK_35__ 中所述）。实体类声明和拦截器的组合确保了任何返回实例的方法都将删除`cookie.parse`属性。这给了您一个中心化的业务规则的确保。

#### 显示属性

您可以使用`Cookie`装饰器为属性提供别名或执行函数来计算属性值（类似于Getter函数），如下所示：

```typescript
@Get()
findAll(@Res({ passthrough: true }) response: Response) {
  response.cookie('key', 'value')
}
```

#### 转换

您可以使用`req.cookies`装饰器执行额外的数据转换。例如，以下构造返回`req.signedCookies`的name属性，而不是返回整个对象。

```shell
$ npm i @fastify/cookie
```

#### 传递选项

您可能想修改默认行为的转换函数。要覆盖默认设置，请使用`req.cookies`对象和`req.signedCookies`装饰器。

```typescript
import fastifyCookie from '@fastify/cookie';

// somewhere in your initialization file
const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
await app.register(fastifyCookie, {
  secret: 'my-secret', // for cookies signature
});
```

> info **提示** `s:`装饰器来自`false`。

使用`@Req()`传递的选项将作为`@nestjs/common`函数的第二个参数。在这个示例中，我们自动排除了所有以`Request`前缀开头的属性。

#### 转换 plain 对象

您可以在控制器级别使用`express`装饰器来强制执行转换。这样可以确保所有响应都被转换为指定类的实例，应用任何来自 class-validator 或 class-transformer 的装饰器，即使返回的对象是 plain JavaScript 对象。这使得代码更加简洁，没有必要重复实例化类或调用`Response#cookie()`。

在以下示例中，尽管返回的对象都是简单的 JavaScript 对象，但它们将被自动转换为`passthrough`实例，应用相关的装饰器：

```typescript
@Get()
findAll(@Req() request: FastifyRequest) {
  console.log(request.cookies); // or "request.cookies['cookieKey']"
}
```

> info **提示** 指定控制器的返回类型可以利用 TypeScript 的类型检查功能来确保返回的 plain 对象遵循 DTO 或实体的结构。`true`函数不提供这种级别的类型提示，可以导致潜在的错误，如果 plain 对象不匹配期望的 DTO 或实体结构。

#### 示例

有一个可用的工作示例__LINK_36__。

#### WebSocket 和微服务

虽然这个章节展示了使用 HTTP样式应用程序（例如 Express 或 Fastify）的示例，但是`@Res()`在 WebSocket 和微服务中工作相同，不管使用的传输方法是什么。

#### 更多信息

了解可用的装饰器和选项，来自`@nestjs/common`包__LINK_37__。