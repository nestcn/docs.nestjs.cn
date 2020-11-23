# 异常过滤器

内置的**异常层**负责处理整个应用程序中的所有抛出的异常。当捕获到未处理的异常时，最终用户将收到友好的响应。


![](https://docs.nestjs.com/assets/Filter_1.png)

每个发生的异常都由全局异常过滤器处理, 当这个异常**无法被识别**时 (既不是 `HttpException` 也不是继承的类 `HttpException` ) , 用户将收到以下 JSON 响应:

```json
{
    "statusCode": 500,
    "message": "Internal server error"
}
```

## 基础异常类

`Nest`提供了一个内置的 `HttpException` 类，它从 `@nestjs/common` 包中导入。对于典型的基于`HTTP` `REST/GraphQL` `API`的应用程序，最佳实践是在发生某些错误情况时发送标准HTTP响应对象。

在 `CatsController`，我们有一个 `findAll()` 方法（`GET` 路由）。假设此路由处理程序由于某种原因引发异常。 为了说明这一点，我们将对其进行如下硬编码：

> cats.controller.ts

```typescript
@Get()
async findAll() {
  throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
}
```

?> 我们在这里使用了 `HttpStatus` 。它是从 `@nestjs/common` 包导入的辅助枚举器。

现在当客户端调用这个端点时，响应如下所示：

```json
{
    "statusCode": 403,
    "message": "Forbidden"
}
```

`HttpException` 构造函数有两个必要的参数来决定响应:

- `response` 参数定义 `JSON` 响应体。它可以是 `string` 或 `object`，如下所述。

- `status`参数定义`HTTP`状态代码。

默认情况下，`JSON` 响应主体包含两个属性：

- `statusCode`：默认为 `status` 参数中提供的 `HTTP` 状态代码

- `message`:基于状态的 `HTTP` 错误的简短描述

仅覆盖 `JSON` 响应主体的消息部分，请在 `response`参数中提供一个 `string`。

要覆盖整个 `JSON` 响应主体，请在`response` 参数中传递一个`object`。 `Nest`将序列化对象，并将其作为`JSON` 响应返回。

第二个构造函数参数-`status`-是有效的 `HTTP` 状态代码。 最佳实践是使用从`@nestjs/common`导入的 `HttpStatus`枚举。

这是一个覆盖整个响应正文的示例：

> cats.controller.ts

```typescript
@Get()
async findAll() {
  throw new HttpException({
    status: HttpStatus.FORBIDDEN,
    error: 'This is a custom message',
  }, 403);
}
```

使用上面的代码，响应如下所示：

```json
{
  "status": 403,
  "error": "This is a custom message"
}
```

## 自定义异常

在许多情况下，您无需编写自定义异常，而可以使用内置的 `Nest HTTP`异常，如下一节所述。 如果确实需要创建自定义的异常，则最好创建自己的**异常层次结构**，其中自定义异常从基 `HttpException` 类继承。 使用这种方法，`Nest`可以识别您的异常，并自动处理错误响应。 让我们实现这样一个自定义异常：

> forbidden.exception.ts

```typescript
export class ForbiddenException extends HttpException {
  constructor() {
    super('Forbidden', HttpStatus.FORBIDDEN);
  }
}
```

由于 `ForbiddenException` 扩展了基础 `HttpException`，它将和核心异常处理程序一起工作，因此我们可以在 `findAll()`方法中使用它。

> cats.controller.ts

```typescript
@Get()
async findAll() {
  throw new ForbiddenException();
}
```

## 内置HTTP异常

为了减少样板代码，Nest 提供了一系列继承自核心异常 `HttpException` 的可用异常。所有这些都可以在 `@nestjs/common`包中找到：

- `BadRequestException`
- `UnauthorizedException`
- `NotFoundException`
- `ForbiddenException`
- `NotAcceptableException`
- `RequestTimeoutException`
- `ConflictException`
- `GoneException`
- `PayloadTooLargeException`
- `UnsupportedMediaTypeException`
- `UnprocessableException`
- `InternalServerErrorException`
- `NotImplementedException`
- `BadGatewayException`
- `ServiceUnavailableException`
- `GatewayTimeoutException`

## 异常过滤器

虽然基本（内置）异常过滤器可以为您自动处理许多情况，但有时您可能希望对异常层拥有**完全控制权**，例如，您可能要添加日志记录或基于一些动态因素使用其他 `JSON`模式。 **异常过滤器**正是为此目的而设计的。 它们使您可以控制精确的控制流以及将响应的内容发送回客户端。

让我们创建一个异常过滤器，它负责捕获作为`HttpException`类实例的异常，并为它们设置自定义响应逻辑。为此，我们需要访问底层平台 `Request`和 `Response`。我们将访问`Request`对象，以便提取原始 `url`并将其包含在日志信息中。我们将使用 `Response.json()`方法，使用 `Response`对象直接控制发送的响应。

> http-exception.filter.ts

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
```

?> 所有异常过滤器都应该实现通用的 `ExceptionFilter<T>` 接口。它需要你使用有效签名提供 `catch(exception: T, host: ArgumentsHost)`方法。`T` 表示异常的类型。

 `@Catch()` 装饰器绑定所需的元数据到异常过滤器上。它告诉 `Nest`这个特定的过滤器正在寻找 `HttpException` 而不是其他的。在实践中，`@Catch()` 可以传递多个参数，所以你可以通过逗号分隔来为多个类型的异常设置过滤器。

 ## 参数主机

 让我们看看 `catch()`方法的参数。`exception`参数是当前正在处理的异常对象。`host` 参数是一个 `ArgumentsHost` 对象。ArgumentsHost 是传递给原始处理程序的参数的一个包装 ，我们将在其他章节中进一步讨论它。在这个上下文中，它的主要目的是为我们提供一个 `Request` 和 `Response` 对象的引用，这些对象被传递给原始请求处理程序(在产生异常的控制器中)。在本文中，我们使用了 `ArgumentsHost`上的一些帮助方法来获得所需的`Request` 和 `Response` 对象。

 `switchtohttp()` 返回一个 `HttpArgumentsHost` 对象。`HttpArgumentsHost` 对象有两个方法。我们使用这些方法来提取所需的对象，在本例中还使用了 `Express` 类型断言来返回原生的 `Express`类型化对象:

```typescript
const response = ctx.getResponse<Response>();
const request = ctx.getRequest<Request>();
```

这种抽象级别的原因是 `ArgumentsHost` 在所有上下文中都起作用（例如，我们现在正在使用的`HTTP Server `上下文，以及`微服务`和 `Sockets`）。 稍后，我们将看到如何利用`ArgumentsHost`及其辅助函数的功能为任何执行上下文访问适当的基础参数。 这将使我们能够编写可在所有上下文中运行的通用异常过滤器。


## 绑定过滤器

让我们将 `HttpExceptionFilter` 绑定到 `CatsController` 的 `create()` 方法上。

> cats.controller.ts

```typescript
@Post()
@UseFilters(new HttpExceptionFilter())
async create(@Body() createCatDto: CreateCatDto) {
  throw new ForbiddenException();
}
```

?> `@UseFilters()` 装饰器需要从 `@nestjs/common` 包导入。

我们在这里使用了 `@UseFilters()` 装饰器。和 `@Catch()`装饰器类似，它可以使用单个过滤器实例，也可以使用逗号分隔的过滤器实例列表。 我们创建了 `HttpExceptionFilter` 的实例。另一种可用的方式是传递类（不是实例），让框架承担实例化责任并启用依赖注入。

> cats.controller.ts
```typescript
@Post()
@UseFilters(HttpExceptionFilter)
async create(@Body() createCatDto: CreateCatDto) {
  throw new ForbiddenException();
}
```
?> 尽可能使用类而不是实例。由于 `Nest` 可以轻松地在整个模块中重复使用同一类的实例，因此可以减少**内存使用**。

在上面的示例中，`HttpExceptionFilter` 仅应用于单个 `create()` 路由处理程序，使其成为方法范围的。 异常过滤器的作用域可以划分为不同的级别：方法范围，控制器范围或全局范围。 例如，要将过滤器设置为控制器作用域，您可以执行以下操作：

> cats.controller.ts

```typescript
@UseFilters(new HttpExceptionFilter())
export class CatsController {}
```

此结构为 `CatsController` 中的每个路由处理程序设置 `HttpExceptionFilter`。

要创建一个全局范围的过滤器，您需要执行以下操作:

> main.ts

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(3000);
}
bootstrap();
```

!> 该 `useGlobalFilters()` 方法不会为网关和混合应用程序设置过滤器。

全局过滤器用于整个应用程序、每个控制器和每个路由处理程序。就依赖注入而言，从任何模块外部注册的全局过滤器（使用上面示例中的 `useGlobalFilters()`）不能注入依赖，因为它们不属于任何模块。为了解决这个问题，你可以注册一个全局范围的过滤器直接为任何模块设置过滤器：


> app.module.ts

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
?>当使用此方法对过滤器执行依赖注入时，请注意，无论采用哪种结构的模块，过滤器实际上都是全局的。 应该在哪里做？ 选择定义了过滤器（以上示例中为 `HttpExceptionFilter`）的模块。 同样，`useClass`不是处理自定义提供程序注册的唯一方法。 在[这里](/6/fundamentals.md?id=定制提供者)了解更多。

您可以根据需要添加任意数量的过滤器;只需将每个组件添加到 `providers`（提供者）数组。

## 捕获异常

为了捕获每一个未处理的异常(不管异常类型如何)，将 `@Catch()` 装饰器的参数列表设为空，例如 `@Catch()`。

> any-exception.filter.ts

```typescript
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
```

在上面的示例中，过滤器将捕获抛出的每个异常，而不管其类型(类)如何。

## 继承

通常，您将创建完全定制的异常过滤器，以满足您的应用程序需求。如果您希望重用已经实现的核心异常过滤器，并基于某些因素重写行为，请看下面的例子。

为了将异常处理委托给基础过滤器，需要继承 `BaseExceptionFilter` 并调用继承的 `catch()` 方法。

>all-exceptions.filter.ts

```typescript
import { Catch, ArgumentsHost } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    super.catch(exception, host);
  }
}
```

!> 继承自基础类的过滤器必须由框架本身实例化（不要使用 `new` 关键字手动创建实例）

上面的实现只是一个演示。扩展异常过滤器的实现将包括定制的业务逻辑(例如，处理各种情况)。

全局过滤器可以扩展基本过滤器。这可以通过两种方式来实现。

您可以通过注入 `HttpServer` 来使用继承自基础类的全局过滤器。

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));

  await app.listen(3000);
}
bootstrap();
```

第二种方法是使用 `APP_FILTER` `token`，[如下所示](#绑定过滤器)。

 ### 译者署名

| 用户名 | 头像 | 职能 | 签名 |
|---|---|---|---|
| [@zuohuadong](https://www.zhihu.com/people/dongcang)  | <img class="avatar-66 rm-style" src="https://pic.downk.cc/item/5f4cafe7160a154a67c4047b.jpg">  |  翻译  | 专注于 caddy 和 nest，[@zuohuadong](https://github.com/zuohuadong/) at Github  |
| [@Drixn](https://drixn.com/)  | <img class="avatar-66 rm-style" src="https://cdn.drixn.com/img/src/avatar1.png">  |  翻译  | 专注于 nginx 和 C++，[@Drixn](https://drixn.com/) |
| [@Armor](https://github.com/Armor-cn)  | <img class="avatar-66 rm-style" height="70" src="https://avatars3.githubusercontent.com/u/31821714?s=460&v=4">  |  翻译  | 专注于 Java 和 Nest，[@Armor](https://armor.ac.cn/) | 
| [@tangkai](https://github.com/tangkai123456)  | <img class="avatar-66 rm-style" height="70" src="https://avatars1.githubusercontent.com/u/22436910">  |  翻译  | 专注于 React，[@tangkai](https://github.com/tangkai123456) |
| [@havef](https://havef.github.io)  | <img class="avatar-66 rm-style" height="70" src="https://avatars1.githubusercontent.com/u/54462?s=460&v=4">  |  校正  | 数据分析、机器学习、TS/JS技术栈 [@havef](https://havef.github.io) |
| [@franken133](https://github.com/franken133)  | <img class="avatar rounded-2" src="https://avatars0.githubusercontent.com/u/17498284?s=400&amp;u=aa9742236b57cbf62add804dc3315caeede888e1&amp;v=4" height="70">  |  翻译  | 专注于 java 和 nest，[@franken133](https://github.com/franken133)|
