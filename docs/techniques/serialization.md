<!-- 此文件从 content/techniques/serialization.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-03T04:10:17.095Z -->
<!-- 源文件: content/techniques/serialization.md -->

### 序列化

序列化是发生在对象返回到客户端网络响应之前的过程。这是一个适合在数据返回到客户端之前应用于转换和-sanitize数据的好地方。例如，敏感数据，如密码，应该始终从响应中排除。或者，某些属性可能需要额外的转换，例如，发送实体的子集属性。手动执行这些转换可能会感到疲劳和容易出错，可能会使您感到所有情况都被涵盖。

#### 概述

Nest 提供了内置的能力来确保这些操作可以以直观的方式执行。__INLINE_CODE_7__ 拦截器使用强大的 __LINK_32__ 包来提供一种声明性和可扩展的方式来转换对象。基本操作是将方法处理程序返回的值应用于 __INLINE_CODE_8__ 函数，从 __LINK_33__ 中获取。这样，它可以应用于实体/DTO 类上述 __INLINE_CODE_9__ 装饰器的规则，如下所述。

> info **提示** 序列化不适用于 __LINK_34__ 响应。

#### 排除属性

假设我们想要自动排除一个 `cookie-parser` 属性从一个用户实体。我们可以使用以下注释：

```shell
$ npm i cookie-parser
$ npm i -D @types/cookie-parser
```

现在考虑一个控制器，具有一个方法处理程序，返回该类的实例。

```typescript
import * as cookieParser from 'cookie-parser';
// somewhere in your initialization file
app.use(cookieParser());
```

> **警告** 注意，我们必须返回该类的实例。如果您返回一个简单的 JavaScript 对象，例如 `main.ts`，那么该对象将不会被正确地序列化。

> info **提示** `cookieParser` 是来自 `secret` 的。

当这个端点被请求时，客户端将收到以下响应：

```typescript
@Get()
findAll(@Req() request: Request) {
  console.log(request.cookies); // or "request.cookies['cookieKey']"
  // or console.log(request.signedCookies);
}
```

注意，拦截器可以应用于整个应用程序（如 __LINK_35__ 中所述）。组合拦截器和实体类声明确保任何方法都将删除 `cookie.parse` 属性。这为您提供了一种集中化地强制实施这个业务规则的措施。

#### 暴露属性

您可以使用 `Cookie` 装饰器为属性提供别名或执行一个函数来计算属性值（类似于 **getter** 函数），如下所示。

```typescript
@Get()
findAll(@Res({ passthrough: true }) response: Response) {
  response.cookie('key', 'value')
}
```

#### 转换

您可以使用 `req.cookies` 装饰器执行额外的数据转换。例如，以下构造返回了 `req.signedCookies` 的名称属性，而不是返回整个对象。

```shell
$ npm i @fastify/cookie
```

#### 传递选项

您可能想要修改转换函数的默认行为。要覆盖默认设置，请使用 `req.cookies` 对象和 `req.signedCookies` 装饰器。

```typescript
import fastifyCookie from '@fastify/cookie';

// somewhere in your initialization file
const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
await app.register(fastifyCookie, {
  secret: 'my-secret', // for cookies signature
});
```

> info **提示** `s:` 装饰器来自 `false`。

通过 `@Req()` 传递的选项将作为第二个参数传递给 underlying `@nestjs/common` 函数。在这个示例中，我们自动排除了所有以 `Request` 前缀开头的属性。

#### 转换平对象

您可以在控制器级别使用 `express` 装饰器来强制执行转换。这确保了所有响应都将被转换为指定类的实例，应用于 class-validator 或 class-transformer 的装饰器，即使返回简单的 JavaScript 对象。这种方法将使代码变得更加简洁，不需要重复地实例化类或调用 `Response#cookie()`。

在以下示例中，尽管两个条件分支都返回了简单的 JavaScript 对象，但是它们将自动转换为 `passthrough` 实例，应用于相关装饰器：

```typescript
@Get()
findAll(@Req() request: FastifyRequest) {
  console.log(request.cookies); // or "request.cookies['cookieKey']"
}
```

> info **提示** 指定控制器的期望返回类型可以利用 TypeScript 的类型检查功能来确保返回的平对象遵循 DTO 或实体的形状。 `true` 函数 không 提供这种级别的类型提示，这可能会导致潜在错误，如果平对象不符合期望的 DTO 或实体结构。

#### 示例

有一个可用的工作示例 __LINK_36__。

#### WebSocket 和微服务

虽然本章中的示例使用了 HTTP 样式应用程序（例如 Express 或 Fastify），但 `@Res()` 对 WebSocket 和微服务也具有相同的行为，无论使用哪种传输方法。

#### 学习更多

阅读更多关于 `@nestjs/common` 包提供的可用装饰器和选项的信息 __LINK_37__。