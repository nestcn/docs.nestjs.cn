# 异常过滤器

内置的 异常层负责处理整个应用程序中的所有抛出的异常。当捕获到未处理的异常时，最终用户将收到适当的用户友好响应。


![](https://docs.nestjs.com/assets/Filter_1.png)

每个异常都由全局异常筛选器处理, 当无法识别时 (既不是 `HttpException` 也不是继承的类 `HttpException` ) , 用户将收到以下 JSON 响应:

```
{
    "statusCode": 500,
    "message": "Internal server error"
}
```

## HttpException

包`@nestjs/common` 内 有一个内置的类 `HttpException`。核心异常处理程序与此类会很好地工作。当你抛出 `HttpException` 对象时，它将被处理程序捕获并转换为相关的 JSON 响应。

在 `CatsController`，我们有一个 `create()` 方法（`POST` 路由）。让我们假设这个路由处理器由于某种原因会抛出一个异常。我们要强制编译它：

> cats.controller.ts

```typescript
@Post()
async create(@Body() createCatDto: CreateCatDto) {
  throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
}
```

!> 我在这里用了 `HttpStatus` 。这是从 `@nestjs/common` 包中导入的助手枚举。

现在当客户端调用这个端点时，响应如下所示：

```
{
    "statusCode": 403,
    "message": "Forbidden"
}
```

`HttpException` 构造函数采用 `string | object` 作为第一个参数。如果您要传递「对象」而不是「字符串」, 则将完全覆盖响应体。

> cats.controller.ts

```typescript
@Post()
async create(@Body() createCatDto: CreateCatDto) {
  throw new HttpException({
    status: HttpStatus.FORBIDDEN,
    error: 'This is a custom message',
  }, 403);
}
```

这就是响应的样子：

```
{
    "status": 403,
    "error": "This is a custom message"
}
```

## 异常层次（Exceptions Hierarchy）

好的做法是创建自己的异常层次结构。这意味着每个 HTTP 异常都应从基 `HttpException` 类继承。因此, Nest 将识别您的所有异常, 并将充分注意错误响应。

> forbidden.exception.ts

```typescript
export class ForbiddenException extends HttpException {
  constructor() {
    super('Forbidden', HttpStatus.FORBIDDEN);
  }
}
```

既然 `ForbiddenException` 扩展了基础 `HttpException`，它将和核心异常处理程序一起工作，所以我们可以在这个 `create()` 方法中使用这个类。

> cats.controller.ts

```typescript
@Post()
async create(@Body() createCatDto: CreateCatDto) {
  throw new ForbiddenException();
}
```

## HTTP exceptions

为了减少样板代码，Nest 提供了一系列扩展核心的可用异常 `HttpException` 。所有这些都可以在 `@nestjs/common`包中找到：

- BadRequestException
- UnauthorizedException
- NotFoundException
- ForbiddenException
- NotAcceptableException
- RequestTimeoutException
- ConflictException
- GoneException
- PayloadTooLargeException
- UnsupportedMediaTypeException
- UnprocessableException
- InternalServerErrorException
- NotImplementedException
- BadGatewayException
- ServiceUnavailableException当
- GatewayTimeoutException

## 异常过滤器（Exception Filters）

基本异常处理程序很好，但有时您可能想要完全控制异常层，例如添加一些日志记录或使用不同的 JSON 模式。我们喜欢通用的解决方案，使您的生活更轻松，这就是为什么称为异常过滤器的功能被创建 的原因

我们要创建过滤器，它的职责是捕获 `HttpException` 类实例异常，并为它们设置自定义响应逻辑。

> http-exception.filter.ts

```typescript
import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { HttpException } from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    response
      .status(status)
      .json({
        statusCode: exception.getStatus(),
        timestamp: new Date().toISOString(),
        path: request.url,
      });
  }
}
```

?> 每个异常过滤器都应该实现这个 `ExceptionFilter` 接口。它强制你提供具有正确特征的 `catch()`的方法。

所述 `@Catch()` 装饰结合所需的元数据到异常过滤器。它告诉 Nest，这个过滤器正在寻找 `HttpException`。 `@Catch()` 的参数是无限个数的，所以你可以为多个类型的异常设置该过滤器，只需要用逗号将它们分开。

该 `exception` 属性是一个当前处理的异常，同时  `host` 也是一个  `ArgumentsHost` 对象。ArgumentsHost 是传递给原始处理程序的参数的一个包装 ，它根据应用程序的类型在底层包含不同的参数数组。

```typescript
export interface ArgumentsHost {
  getArgs<T extends Array<any> = any[]>(): T;
  getArgByIndex<T = any>(index: number): T;
  switchToRpc(): RpcArgumentsHost;
  switchToHttp(): HttpArgumentsHost;
  switchToWs(): WsArgumentsHost;
}
```
在  `ArgumentsHost` 有一组有用的方法，有助于从底层数组挑选正确的参数为我们提供。换句话说，  ArgumentsHost 除了一系列参数之外别无他法 。例如，当过滤器在 HTTP 应用程序上下文中使用时， ArgumentsHost 将包含  [request, response] 数组。但是，当前上下文是一个 Web 套接字应用程序时，该数组将等于  [client, data]。此设计决策使您能够访问任何将最终传递给相应处理程序的参数。

让我们配合  HttpExceptionFilter 使用 `create()` 方法。

> cats.controller.ts

```typescript
@Post()
@UseFilters(new HttpExceptionFilter())
async create(@Body() createCatDto: CreateCatDto) {
  throw new ForbiddenException();
}
```

?> `@UseFilters()` 装饰器从 `@nestjs/common` 包导入。

我们在 `@UseFilters()` 这里使用了装饰器。与 `@Catch()` 相同，它需要无限的参数。

这个实例  `HttpExceptionFilter` 已经被直接创建了。另一种可用的方式是传递类（不是实例），让框架实例化责任并启用依赖注入。

> cats.controller.ts
```typescript
@Post()
@UseFilters(HttpExceptionFilter)
async create(@Body() createCatDto: CreateCatDto) {
  throw new ForbiddenException();
}
```

?> 提示如果可能，最好使用类而不是实例。它可以减少内存使用量，因为 Nest 可以轻松地在整个应用程序中重复使用同一类的实例。

在上面的例子中，`HttpExceptionFilter` 仅适用于单个 `create()` 路由处理程序，但它不是唯一的方法。实际上，异常过滤器可以是方法范围的，控制器范围的，也可以是全局范围的。

> cats.controller.ts

```typescript
@UseFilters(new HttpExceptionFilter())
export class CatsController {}
```

此结构为 `CatsController` 中的每个路由处理程序设置 `HttpExceptionFilter`。它是控制器范围的异常过滤器的示例。最后一个可用范围是全局范围的异常过滤器。

> main.ts

```typescript
async function bootstrap() {
  const app = await NestFactory.create(ApplicationModule);
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(3000);
}
bootstrap();
```

!> 该 `useGlobalFilters()` 方法不会为网关和微服务设置过滤器。


全局过滤器用于整个应用程序，每个控制器，每个路由处理程序。就依赖注入而言，从任何模块外部注册的全局过滤器（如上面的示例中那样）不能注入依赖关系，因为它们不属于任何模块。为了解决这个问题，您可以使用以下构造直接从任何模块设置过滤器 ：

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
export class ApplicationModule {}
```

?> 提示另一种选择是使用[执行上下文](5.0/executioncontext)功能。另外，useClass 并不是处理自定义提供商注册的唯一方法。在[这里](5.0/fundamentals?id=custom-providers)了解更多。

## 抓住一切

为了处理每个发生的异常（无论异常类型如何），可以将括号留空（`@Catch()`）：

> any-exception.filter.ts
```typescript
import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';

@Catch()
export class AnyExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    response
      .status(status)
      .json({
        statusCode: exception.getStatus(),
        timestamp: new Date().toISOString(),
        path: request.url,
      });
  }
}
```
在上面的例子中，过滤器会捕获已经抛出的每个异常，而不会将自身限制为一组特定的类。

