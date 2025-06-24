### 异常过滤器

Nest 内置了一个**异常处理层** ，负责处理应用程序中所有未捕获的异常。当应用程序代码未处理某个异常时，该层会捕获它并自动返回用户友好的响应。

![](/assets/Filter_1.png)

默认情况下，这个功能由内置的**全局异常过滤器**实现，它能处理 `HttpException` 类型（及其子类）的异常。当遇到**无法识别**的异常（既不是 `HttpException` 也不是其继承类）时，内置异常过滤器会生成以下默认 JSON 响应：

```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

> info **注意** 全局异常过滤器部分支持 `http-errors` 库。基本上，任何包含 `statusCode` 和 `message` 属性的异常都会被正确解析并作为响应返回（而不是对无法识别的异常默认返回 `InternalServerErrorException`）。

#### 抛出标准异常

Nest 提供了一个内置的 `HttpException` 类，该类从 `@nestjs/common` 包中导出。对于基于 HTTP REST/GraphQL API 的典型应用程序，最佳实践是在发生某些错误条件时发送标准的 HTTP 响应对象。

例如，在 `CatsController` 中，我们有一个 `findAll()` 方法（一个 `GET` 路由处理程序）。假设这个路由处理程序由于某种原因抛出了异常。为了演示这一点，我们将其硬编码如下：

```typescript
@@filename(cats.controller)
@Get()
async findAll() {
  throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
}
```

> info **提示** 我们在这里使用了 `HttpStatus`。这是一个从 `@nestjs/common` 包导入的辅助枚举。

当客户端调用此端点时，响应如下所示：

```json
{
  "statusCode": 403,
  "message": "Forbidden"
}
```

`HttpException` 构造函数接收两个必选参数来决定响应内容：

- `response` 参数定义了 JSON 响应体，可以是如下所述的 `string` 或 `object` 类型。
- `status` 参数定义了 [HTTP 状态码](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)

默认情况下，JSON 响应体包含两个属性：

- `statusCode`：默认为 `status` 参数中提供的 HTTP 状态码
- `message`：基于 `status` 的 HTTP 错误简短描述

若要仅覆盖 JSON 响应体中的消息部分，请在 `response` 参数中传入字符串。若要覆盖整个 JSON 响应体，则在 `response` 参数中传入对象。Nest 会将该对象序列化后作为 JSON 响应体返回。

第二个构造参数 `status` 应为有效的 HTTP 状态码。最佳实践是使用从 `@nestjs/common` 导入的 `HttpStatus` 枚举。

还存在**第三个**构造参数（可选）——`options`，可用于提供错误[原因](https://nodejs.org/en/blog/release/v16.9.0/#error-cause) 。该 `cause` 对象不会被序列化到响应对象中，但对日志记录很有帮助，能提供引发 `HttpException` 的内部错误的有价值信息。

以下是覆盖整个响应体并提供错误原因的示例：

```typescript
@@filename(cats.controller)
@Get()
async findAll() {
  try {
    await this.service.findAll()
  } catch (error) {
    throw new HttpException({
      status: HttpStatus.FORBIDDEN,
      error: 'This is a custom message',
    }, HttpStatus.FORBIDDEN, {
      cause: error
    });
  }
}
```

基于上述情况，响应将呈现如下形式：

```json
{
  "status": 403,
  "error": "This is a custom message"
}
```

#### 异常日志记录

默认情况下，异常过滤器不会记录内置异常如 `HttpException`（以及从其继承的任何异常）。当这些异常被抛出时，它们不会出现在控制台中，因为它们被视为正常应用流程的一部分。相同行为也适用于其他内置异常，例如 `WsException` 和 `RpcException`。

这些异常都继承自基础类 `IntrinsicException`，该类从 `@nestjs/common` 包导出。这个类有助于区分属于正常应用操作的异常与不属于该范畴的异常。

若需记录这些异常，可创建自定义异常过滤器。我们将在下一节说明具体实现方法。

#### 自定义异常

多数情况下，您无需编写自定义异常，直接使用内置的 Nest HTTP 异常即可（详见下一节）。如需创建定制化异常，最佳实践是建立**异常层级结构** ，让自定义异常继承基础 `HttpException` 类。通过这种方式，Nest 能识别您的异常并自动处理错误响应。下面我们实现一个自定义异常：

```typescript
@@filename(forbidden.exception)
export class ForbiddenException extends HttpException {
  constructor() {
    super('Forbidden', HttpStatus.FORBIDDEN);
  }
}
```

由于 `ForbiddenException` 继承自基础 `HttpException`，它能与内置异常处理器无缝协作，因此我们可在 `findAll()` 方法中直接使用。

```typescript
@@filename(cats.controller)
@Get()
async findAll() {
  throw new ForbiddenException();
}
```

#### 内置 HTTP 异常

Nest 提供了一组继承自基础 `HttpException` 的标准异常。这些异常来自 `@nestjs/common` 包，代表了许多最常见的 HTTP 异常：

- `BadRequestException`
- `UnauthorizedException`
- `NotFoundException`
- `ForbiddenException`
- `NotAcceptableException`
- `RequestTimeoutException`
- `ConflictException`
- `GoneException`
- `HttpVersionNotSupportedException`
- `PayloadTooLargeException`
- `UnsupportedMediaTypeException`
- `UnprocessableEntityException`
- `InternalServerErrorException`
- `NotImplementedException`
- `ImATeapotException`
- `MethodNotAllowedException`
- `BadGatewayException`
- `ServiceUnavailableException`
- `GatewayTimeoutException`
- `PreconditionFailedException`

所有内置异常还可以通过 `options` 参数提供错误 `cause` 和错误描述：

```typescript
throw new BadRequestException('Something bad happened', {
  cause: new Error(),
  description: 'Some error description',
});
```

使用上述方式时，响应将如下所示：

```json
{
  "message": "Something bad happened",
  "error": "Some error description",
  "statusCode": 400
}
```

#### 异常过滤器

虽然基础的（内置）异常过滤器能自动处理许多情况，但您可能希望对异常层进行**完全控制** 。例如，您可能希望基于某些动态因素添加日志记录或使用不同的 JSON 模式。 **异常过滤器**正是为此目的而设计。它们让您可以精确控制流程以及返回给客户端的响应内容。

让我们创建一个异常过滤器，负责捕获 `HttpException` 类的实例异常，并为它们实现自定义响应逻辑。为此，我们需要访问底层平台的 `Request` 和 `Response` 对象。我们将访问 `Request` 对象以提取原始 `url` 并将其包含在日志信息中。我们将使用 `Response` 对象通过 `response.json()` 方法直接控制发送的响应。

```typescript
@@filename(http-exception.filter)
import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    response
      .status(status)
      .json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
  }
}
```

> info **提示** 所有异常过滤器都应实现泛型接口 `ExceptionFilter<T>`。这要求您提供带有指定签名的 `catch(exception: T, host: ArgumentsHost)` 方法。`T` 表示异常的类型。

> warning **警告** 如果您使用 `@nestjs/platform-fastify`，可以用 `response.send()` 替代 `response.json()`。别忘了从 `fastify` 导入正确的类型。

`@Catch(HttpException)` 装饰器将所需的元数据绑定到异常过滤器，告诉 Nest 这个特定过滤器只查找 `HttpException` 类型的异常。`@Catch()` 装饰器可接受单个参数或以逗号分隔的列表，让您能一次性为多种异常类型设置过滤器。

#### 参数 host

让我们看看 `catch()` 方法的参数。`exception` 参数是当前正在处理的异常对象。`host` 参数是一个 `ArgumentsHost` 对象。`ArgumentsHost` 是一个强大的工具对象，我们将在[执行上下文章节](/fundamentals/execution-context) \*中进一步研究。在此代码示例中，我们使用它来获取对原始请求处理程序（异常发生的控制器）中传递的 `Request` 和 `Response` 对象的引用。本示例中，我们使用了 `ArgumentsHost` 上的一些辅助方法来获取所需的 `Request` 和 `Response` 对象。了解更多关于 `ArgumentsHost` 的信息[请点击这里](/fundamentals/execution-context) 。

采用这种抽象层级的原因是 `ArgumentsHost` 能在所有上下文中运作（例如我们当前使用的 HTTP 服务器上下文，还包括微服务和 WebSockets）。在执行上下文章节中，我们将看到如何利用 `ArgumentsHost` 及其辅助函数的能力，为**任何**执行上下文获取对应的[底层参数](https://docs.nestjs.com/fundamentals/execution-context#host-methods) 。这将使我们能够编写适用于所有上下文的通用异常过滤器。

#### 绑定过滤器

让我们将新的 `HttpExceptionFilter` 绑定到 `CatsController` 的 `create()` 方法上。

```typescript
@@filename(cats.controller)
@Post()
@UseFilters(new HttpExceptionFilter())
async create(@Body() createCatDto: CreateCatDto) {
  throw new ForbiddenException();
}
```

> info **注意** `@UseFilters()` 装饰器是从 `@nestjs/common` 包中导入的。

我们在此使用了 `@UseFilters()` 装饰器。与 `@Catch()` 装饰器类似，它可以接收单个过滤器实例或以逗号分隔的过滤器实例列表。这里我们直接创建了 `HttpExceptionFilter` 的实例。或者，你也可以传入类（而非实例），将实例化的责任交给框架，并启用**依赖注入** 。

```typescript
@@filename(cats.controller)
@Post()
@UseFilters(HttpExceptionFilter)
async create(@Body() createCatDto: CreateCatDto) {
  throw new ForbiddenException();
}
```

> info **提示** 尽可能通过类而非实例来应用过滤器。这会降低**内存消耗** ，因为 Nest 可以在整个模块中轻松复用相同类的实例。

在上面的示例中，`HttpExceptionFilter` 仅应用于单个 `create()` 路由处理器，使其成为方法作用域的。异常过滤器可以具有不同的作用域级别：控制器/解析器/网关的方法作用域、控制器作用域或全局作用域。例如，要将过滤器设置为控制器作用域，可以这样做：

```typescript
@@filename(cats.controller)
@Controller()
@UseFilters(new HttpExceptionFilter())
export class CatsController {}
```

此构造为 `CatsController` 内部定义的每个路由处理器设置了 `HttpExceptionFilter`。

要创建全局作用域的过滤器，需执行以下操作：

```typescript
@@filename(main)
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

> warning **警告** `useGlobalFilters()` 方法不会为网关或混合应用设置过滤器。

全局作用域的过滤器用于整个应用程序，作用于每个控制器和每个路由处理器。在依赖注入方面，从任何模块外部注册的全局过滤器（如上述示例中使用 `useGlobalFilters()`）无法注入依赖项，因为这是在模块上下文之外完成的。为解决此问题，您可以使用以下构造**直接从任何模块**注册全局作用域的过滤器：

```typescript
@@filename(app.module)
import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';

@Module({
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
```

> info **注意** 使用此方法执行过滤器依赖注入时，需注意无论在哪一个模块中使用该构造，过滤器实际上是全局性的。应该在哪里进行操作呢？应选择过滤器（如上例中的 `HttpExceptionFilter`）被定义的模块。同时，`useClass` 并非处理自定义提供者注册的唯一方式。了解更多[请点击此处](/fundamentals/custom-providers) 。

您可以根据需要使用此技术添加任意数量的过滤器，只需将每个过滤器添加到 providers 数组中即可。

#### 捕获所有异常

为了捕获**每一个**未处理的异常（无论异常类型如何），只需让 `@Catch()` 装饰器的参数列表为空即可，例如 `@Catch()`。

在以下示例中，我们有一段与平台无关的代码，因为它使用 [HTTP 适配器](./faq/http-adapter)来传递响应，而没有直接使用任何平台特定对象（`Request` 和 `Response`）：

```typescript
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class CatchEverythingFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
```

> warning **注意** 当将捕获所有异常的过滤器与绑定到特定类型的过滤器结合使用时，应首先声明"捕获所有"过滤器，以便特定过滤器能正确处理绑定类型。

#### 继承

通常情况下，您会创建完全自定义的异常过滤器来满足应用程序需求。但在某些用例中，您可能希望直接扩展内置的**全局异常过滤器** ，并根据特定因素覆盖其行为。

要将异常处理委托给基础过滤器，需要扩展 `BaseExceptionFilter` 并调用继承的 `catch()` 方法。

```typescript
@@filename(all-exceptions.filter)
import { Catch, ArgumentsHost } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    super.catch(exception, host);
  }
}
```

> **警告** 扩展自 `BaseExceptionFilter` 的方法作用域和控制器作用域过滤器不应使用 `new` 实例化，而应由框架自动实例化。

全局过滤器**可以**扩展基础过滤器，可通过以下两种方式之一实现。

第一种方法是在实例化自定义全局过滤器时注入 `HttpAdapter` 引用：

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

第二种方法是使用 `APP_FILTER` 令牌[如图所示](exception-filters#binding-filters) 。
