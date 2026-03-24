### 异常过滤器

Nest 带有一个内置的 **异常层**，负责处理应用程序中所有未处理的异常。当应用程序代码未处理异常时，它会被此层捕获，然后自动发送适当的用户友好响应。

<figure>
  <img class="illustrative-image" src="/assets/Filter_1.png" />
</figure>

开箱即用，此操作由内置的 **全局异常过滤器** 执行，该过滤器处理 `HttpException` 类型（及其子类）的异常。当异常 **未被识别**（既不是 `HttpException` 也不是继承自 `HttpException` 的类）时，内置异常过滤器会生成以下默认 JSON 响应：

```json
{
  "statusCode": 500,
  "message": "Internal server error"
}

```

::: info 提示
全局异常过滤器部分支持 `http-errors` 库。基本上，任何包含 `statusCode` 和 `message` 属性的抛出异常都会被正确填充并作为响应发送回来（而不是对未识别异常使用默认的 `InternalServerErrorException`）。
:::

#### 抛出标准异常

Nest 提供了一个内置的 `HttpException` 类，从 `@nestjs/common` 包中导出。对于典型的基于 HTTP REST/GraphQL API 的应用程序，当某些错误条件发生时，发送标准 HTTP 响应对象是最佳实践。

例如，在 `CatsController` 中，我们有一个 `findAll()` 方法（一个 `GET` 路由处理程序）。假设这个路由处理程序由于某种原因抛出异常。为了演示这一点，我们将其硬编码如下：

```typescript
@Get()
async findAll() {
  throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
}

```

::: info 提示
我们在这里使用了 `HttpStatus`。这是一个从 `@nestjs/common` 包导入的辅助枚举。
:::

当客户端调用此端点时，响应如下所示：

```json
{
  "statusCode": 403,
  "message": "Forbidden"
}

```

`HttpException` 构造函数接受两个必需参数，这些参数决定了响应：

- `response` 参数定义 JSON 响应主体。它可以是 `string` 或如下所述的 `object`。
- `status` 参数定义 [HTTP 状态码](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)。

默认情况下，JSON 响应主体包含两个属性：

- `statusCode`：默认为 `status` 参数中提供的 HTTP 状态码
- `message`：基于 `status` 的 HTTP 错误的简短描述

要仅覆盖 JSON 响应主体的消息部分，请在 `response` 参数中提供一个字符串。要覆盖整个 JSON 响应主体，请在 `response` 参数中传递一个对象。Nest 将序列化该对象并将其作为 JSON 响应主体返回。

第二个构造函数参数 - `status` - 应该是有效的 HTTP 状态码。最佳实践是使用从 `@nestjs/common` 导入的 `HttpStatus` 枚举。

还有一个 **第三个** 构造函数参数（可选）- `options` - 可用于提供错误 [原因](https://nodejs.org/en/blog/release/v16.9.0/#error-cause)。此 `cause` 对象不会被序列化为响应对象，但它对于日志记录目的很有用，提供有关导致 `HttpException` 被抛出的内部错误的宝贵信息。

以下是覆盖整个响应主体并提供错误原因的示例：

```typescript
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

使用上述代码，响应将如下所示：

```json
{
  "status": 403,
  "error": "This is a custom message"
}

```

#### 异常日志记录

默认情况下，异常过滤器不会记录内置异常，如 `HttpException`（以及任何继承自它的异常）。当这些异常被抛出时，它们不会出现在控制台中，因为它们被视为正常应用程序流程的一部分。同样的行为适用于其他内置异常，如 `WsException` 和 `RpcException`。

这些异常都继承自基础 `IntrinsicException` 类，该类从 `@nestjs/common` 包中导出。此类有助于区分哪些异常是正常应用程序操作的一部分，哪些不是。

如果您想记录这些异常，可以创建自定义异常过滤器。我们将在下一节中解释如何做到这一点。

#### 自定义异常

在许多情况下，您不需要编写自定义异常，可以使用内置的 Nest HTTP 异常，如下一节所述。如果您确实需要创建自定义异常，最佳实践是创建自己的 **异常层次结构**，其中您的自定义异常继承自基础 `HttpException` 类。通过这种方法，Nest 将识别您的异常，并自动处理错误响应。让我们实现这样的自定义异常：

```typescript
export class ForbiddenException extends HttpException {
  constructor() {
    super('Forbidden', HttpStatus.FORBIDDEN);
  }
}

```

由于 `ForbiddenException` 扩展了基础 `HttpException`，它将与内置异常处理程序无缝协作，因此我们可以在 `findAll()` 方法中使用它。

```typescript
@Get()
async findAll() {
  throw new ForbiddenException();
}

```

#### 内置 HTTP 异常

Nest 提供了一组标准异常，它们继承自基础 `HttpException`。这些异常从 `@nestjs/common` 包中导出，代表许多最常见的 HTTP 异常：

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

所有内置异常还可以使用 `options` 参数提供错误 `cause` 和错误描述：

```typescript
throw new BadRequestException('Something bad happened', {
  cause: new Error(),
  description: 'Some error description',
});

```

使用上述代码，响应将如下所示：

```json
{
  "message": "Something bad happened",
  "error": "Some error description",
  "statusCode": 400
}

```

#### 异常过滤器

虽然基础（内置）异常过滤器可以自动处理许多情况，但您可能希望对异常层进行 **完全控制**。例如，您可能希望添加日志记录或基于某些动态因素使用不同的 JSON 模式。**异常过滤器** 正是为此目的而设计的。它们允许您控制确切的控制流和发送回客户端的响应内容。

让我们创建一个异常过滤器，负责捕获属于 `HttpException` 类实例的异常，并为它们实现自定义响应逻辑。为此，我们需要访问底层平台的 `Request` 和 `Response` 对象。我们将访问 `Request` 对象，以便提取原始 `url` 并将其包含在日志信息中。我们将使用 `Response` 对象来直接控制发送的响应，使用 `response.json()` 方法。

```typescript
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

@Catch(HttpException)
export class HttpExceptionFilter {
  catch(exception, host) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
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

::: info 提示
所有异常过滤器都应该实现泛型 `ExceptionFilter<T>` 接口。这要求您提供 `catch(exception: T, host: ArgumentsHost)` 方法及其指定的签名。`T` 表示异常的类型。
:::

::: warning 警告
如果您使用 `@nestjs/platform-fastify`，您可以使用 `response.send()` 而不是 `response.json()`。不要忘记从 `fastify` 导入正确的类型。
:::

`@Catch(HttpException)` 装饰器将所需的元数据绑定到异常过滤器，告诉 Nest 这个特定过滤器正在寻找 `HttpException` 类型的异常，而不是其他异常。`@Catch()` 装饰器可以接受单个参数或逗号分隔的列表。这允许您为多种类型的异常设置过滤器。

#### 参数主机

让我们看一下 `catch()` 方法的参数。`exception` 参数是当前正在处理的异常对象。`host` 参数是一个 `ArgumentsHost` 对象。`ArgumentsHost` 是一个强大的实用程序对象，我们将在 [执行上下文章节](/fundamentals/execution-context)\* 中进一步研究。在此代码示例中，我们使用它来获取传递给原始请求处理程序（在异常起源的控制器中）的 `Request` 和 `Response` 对象的引用。在此代码示例中，我们使用了 `ArgumentsHost` 上的一些辅助方法来获取所需的 `Request` 和 `Response` 对象。了解更多关于 `ArgumentsHost` 的信息 [这里](/fundamentals/execution-context)。

\*这种抽象级别的原因是 `ArgumentsHost` 在所有上下文中都起作用（例如，我们现在正在使用的 HTTP 服务器上下文，以及微服务和 WebSockets）。在执行上下文章节中，我们将看到如何使用 `ArgumentsHost` 及其辅助函数的强大功能访问 **任何** 执行上下文的适当 <a href="/fundamentals/execution-context#host-methods">底层参数</a>。这将允许我们编写在所有上下文中运行的通用异常过滤器。

<app-banner-courses></app-banner-courses>

#### 绑定过滤器

让我们将我们的新 `HttpExceptionFilter` 绑定到 `CatsController` 的 `create()` 方法。

```typescript
@Post()
@UseFilters(new HttpExceptionFilter())
async create(@Body() createCatDto: CreateCatDto) {
  throw new ForbiddenException();
}

```

::: info 提示
`@UseFilters()` 装饰器从 `@nestjs/common` 包中导入。
:::

我们在这里使用了 `@UseFilters()` 装饰器。与 `@Catch()` 装饰器类似，它可以接受单个过滤器实例或逗号分隔的过滤器实例列表。在这里，我们就地创建了 `HttpExceptionFilter` 的实例。或者，您可以传递类（而不是实例），将实例化的责任留给框架，并启用 **依赖注入**。

```typescript
@Post()
@UseFilters(HttpExceptionFilter)
async create(@Body() createCatDto: CreateCatDto) {
  throw new ForbiddenException();
}

```

::: info 提示
尽可能通过使用类而不是实例来应用过滤器。这会减少 **内存使用**，因为 Nest 可以轻松地在整个模块中重用同一类的实例。
:::

在上面的示例中，`HttpExceptionFilter` 仅应用于单个 `create()` 路由处理程序，使其成为方法范围的。异常过滤器可以在不同级别范围内使用：控制器/解析器/网关的方法范围、控制器范围或全局范围。
例如，要将过滤器设置为控制器范围，您可以执行以下操作：

```typescript
@Controller()
@UseFilters(new HttpExceptionFilter())
export class CatsController {}

```

此构造为 `CatsController` 内定义的每个路由处理程序设置了 `HttpExceptionFilter`。

要创建全局范围的过滤器，您可以执行以下操作：

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

```

:::warning 警告
`useGlobalFilters()` 方法不为网关或混合应用程序设置过滤器。
:::

全局范围的过滤器用于整个应用程序，适用于每个控制器和每个路由处理程序。在依赖注入方面，从任何模块外部注册的全局过滤器（如上面示例中的 `useGlobalFilters()`）不能注入依赖项，因为这是在任何模块的上下文之外完成的。为了解决这个问题，您可以使用以下构造 **直接从任何模块** 注册全局范围的过滤器：

```typescript
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

::: info 提示
当使用这种方法为过滤器执行依赖注入时，请注意，无论在此构造中使用哪个模块，过滤器实际上都是全局的。应该在哪里做？选择定义过滤器（上面示例中的 `HttpExceptionFilter`）的模块。此外，`useClass` 不是处理自定义提供程序注册的唯一方法。了解更多 [这里](/fundamentals/dependency-injection)。
:::

您可以根据需要使用此技术添加任意数量的过滤器；只需将每个过滤器添加到 providers 数组中即可。

#### 捕获所有异常

为了捕获 **所有** 未处理的异常（无论异常类型如何），请将 `@Catch()` 装饰器的参数列表留空，例如 `@Catch()`。

在下面的示例中，我们有一个与平台无关的代码，因为它使用 [HTTP 适配器](./faq/http-adapter) 来传递响应，并且不直接使用任何平台特定的对象（`Request` 和 `Response`）：

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

:::warning 警告
当将捕获所有异常的异常过滤器与绑定到特定类型的过滤器结合使用时，应首先声明 "捕获所有" 过滤器，以允许特定过滤器正确处理绑定类型。
:::

#### 继承

通常，您会创建完全自定义的异常过滤器，以满足您的应用程序需求。然而，可能存在一些用例，您希望简单地扩展内置的默认 **全局异常过滤器**，并基于某些因素覆盖行为。

为了将异常处理委托给基础过滤器，您需要扩展 `BaseExceptionFilter` 并调用继承的 `catch()` 方法。

```typescript
import { Catch, ArgumentsHost } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    super.catch(exception, host);
  }
}

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  catch(exception, host) {
    super.catch(exception, host);
  }
}

```

:::warning 警告
扩展 `BaseExceptionFilter` 的方法范围和控制器范围的过滤器不应使用 `new` 实例化。相反，让框架自动实例化它们。
:::

全局过滤器 **可以** 扩展基础过滤器。这可以通过两种方式之一完成。

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

第二种方法是使用 `APP_FILTER` 令牌 <a href="exception-filters#绑定过滤器">如这里所示</a>。
