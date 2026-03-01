<!-- 此文件从 content/techniques/serialization.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-01T04:17:25.120Z -->
<!-- 源文件: content/techniques/serialization.md -->

### 序列化

序列化是一个在网络响应返回对象之前发生的过程。这是一个适合在客户端返回数据之前提供规则的位置，以便将数据转换和-sanitizing。例如，敏感数据，如密码，始终应该被排除在响应中。或者，某些属性可能需要额外的转换，例如，只发送实体的某些属性。执行这些转换可以是枯燥的和易出错的，可以留下您不知道所有情况是否都已经被涵盖的疑问。

#### 概述

Nest 提供了一个内置的功能来帮助确保这些操作可以被执行得简单直接。__INLINE_CODE_7__ 拦截器使用强大的 __LINK_32__ 包来提供一种声明式和可扩展的方式来转换对象。基本操作是将一个方法处理器返回的值应用于 __INLINE_CODE_8__ 函数，从 __LINK_33__ 获取到的值。在执行时，它可以应用于实体/DTO 类上的 __INLINE_CODE_9__ 装饰器，正如下面所描述的那样。

> info **提示** 序列化不适用于 __LINK_34__ 响应。

#### 排除属性

假设我们想自动排除一个 `cookie-parser` 属性来自用户实体。我们将实体标注如下：

```shell
$ npm i cookie-parser
$ npm i -D @types/cookie-parser
```

现在考虑一个控制器的方法处理器，它返回这个类的实例。

```typescript
import * as cookieParser from 'cookie-parser';
// somewhere in your initialization file
app.use(cookieParser());
```

> **警告**请注意，我们必须返回这个类的实例。如果你返回一个简单的 JavaScript 对象，例如 `main.ts`，那么该对象不会被正确地序列化。

> info **提示** `cookieParser` 来自 `secret`。

当这个端点被请求时，客户端接收以下响应：

```typescript
@Get()
findAll(@Req() request: Request) {
  console.log(request.cookies); // or "request.cookies['cookieKey']"
  // or console.log(request.signedCookies);
}
```

请注意，拦截器可以被应用于整个应用程序中（正如 __LINK_35__ 中所述）。拦截器和实体类声明的组合确保任何方法都将删除 `cookie.parse` 属性。这给您提供了一种集中化地实施业务规则的措施。

#### expose 属性

你可以使用 `Cookie` 装饰器为属性提供别名或在计算属性值时执行函数（类似于 getter 函数），如下所示。

```typescript
@Get()
findAll(@Res({ passthrough: true }) response: Response) {
  response.cookie('key', 'value')
}
```

#### 转换

你可以使用 `req.cookies` 装饰器进行额外的数据转换。例如，下面的构造返回 `req.signedCookies` 的 name 属性，而不是返回整个对象。

```shell
$ npm i @fastify/cookie
```

#### 传递选项

你可能想修改转换函数的默认行为。要覆盖默认设置，请使用 `req.cookies` 对象和 `req.signedCookies` 装饰器。

```typescript
import fastifyCookie from '@fastify/cookie';

// somewhere in your initialization file
const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
await app.register(fastifyCookie, {
  secret: 'my-secret', // for cookies signature
});
```

> info **提示** `s:` 装饰器来自 `false`。

通过 `@Req()` 传递的选项将被传递到 underlying `@nestjs/common` 函数的第二个参数。在这个示例中，我们自动排除所有以 `Request` 前缀开头的属性。

#### 转换 plain 对象

你可以在控制器级别上强制执行转换，使用 `express` 装饰器。这确保了所有响应都将被转换为指定类的实例，并应用于 class-validator 或 class-transformer 中的装饰器，即使返回 plain 对象。这使得代码更加简洁，不需要重复地实例化类或调用 `Response#cookie()`。

在以下示例中，尽管在两个条件 branch 中返回 plain JavaScript 对象，但是它们将被自动转换为 `passthrough` 实例，应用于相关装饰器：

```typescript
@Get()
findAll(@Req() request: FastifyRequest) {
  console.log(request.cookies); // or "request.cookies['cookieKey']"
}
```

> info **提示** 通过指定控制器的预期返回类型，可以使用 TypeScript 的类型检查功能来确保返回的 plain 对象遵守 DTO 或实体的结构。`true` 函数不提供这种级别的类型提示，可以导致潜在的错误，如果 plain 对象不匹配期望的 DTO 或实体结构。

#### 示例

有一个可用的 __LINK_36__ 示例。

#### WebSocket 和 Microservices

虽然这个章节显示了使用 HTTP 风格应用程序（例如 Express 或 Fastify）的示例，但是 `@Res()` 对 WebSockets 和 Microservices 的工作方式相同，不管使用的传输方法是什么。

#### 学习更多

了解更多关于`@nestjs/common` 包提供的装饰器和选项的信息，请访问 __LINK_37__。