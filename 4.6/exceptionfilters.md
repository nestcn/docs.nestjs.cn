# 异常过滤器

在 Nest 中，有一个异常层，它负责捕获未处理的异常，并将适当的响应返回给最终用户。

![](https://docs.nestjs.com/assets/Filter_1.png)

每个异常都由全局异常筛选器处理, 当无法识别 (不是 `HttpException` 继承的类 `HttpException` ) 时, 用户将收到以下 JSON 响应:

```
{
    "statusCode": 500,
    "message": "Internal server error"
}
```

## HttpException

包 `HttpException` 内 有一个内置的类 `@nestjs/common`。核心异常处理程序与此类会很好地工作。当你抛出 `HttpException` 对象时，它将被处理程序捕获并转换为相关的 JSON 响应。

在 `CatsController`，我们有一个 `create()` 方法（`POST` 路由）。让我们假设这个路由处理器由于某种原因会抛出一个异常。我们要强制编译它：

> cats.controller.ts

```typescript
@Post()
async create(@Body() createCatDto: CreateCatDto) {
  throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
}
```

!> 我在这里用了 `HttpStatus` 。这是从 `@nestjs/common` 包中导入的帮助枚举。

现在当客户端调用这个端点时，响应如下所示：

```
{
    "statusCode": 403,
    "message": "Forbidden"
}
```

`HttpException` 构造函数采用 `string | object` 作为第一个参数。如果您要传递「对象」而不是「字符串」, 则将完全覆盖响应正文。

> cats.controller.ts

```typescript
@Post()
async create(@Body() createCatDto: CreateCatDto) {
  throw new HttpException({
    status: HttpStatus.FORBIDDEN,
    error: 'This is a custom message',
  });
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

既然 `ForbiddenException` 扩展了这个基础 `HttpException`，它将和核心异常处理程序一起工作，所以我们可以在这个 `create()` 方法中使用这个类。

`cats.controller.ts`

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

我们要创建过滤器，它的职责是抓住 `HttpException` 并重写 `message` 属性。

> http-exception.filter.ts

```typescript
import { ExceptionFilter, Catch } from '@nestjs/common';
import { HttpException } from '@nestjs/core';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, response) {
    const status = exception.getStatus();

    response.status(status).json({
      statusCode: status,
      message: `It's a message from the exception filter`,
    });
  }
}
```

这个 `response` 是一个原生的 [express 对象](http://www.expressjs.com.cn/4x/api.html#res)。`exception` 是当前被处理的异常。

?> 每个异常过滤器都应该实现这个 `ExceptionFilter` 接口。它强制你提供具有正确特征的 `catch()`的方法。

所述 `@Catch()` 装饰结合所需的元数据到异常过滤器。它告诉 Nest，这个过滤器正在寻找 `HttpException`。 `@Catch()` 的参数是无限个数的，所以你可以为多个类型的异常设置该过滤器，只需要用逗号将它们分开。

最后一步是通知 Nest `HttpExceptionFilter` 应该在 `create()` 方法内使用。

> cats.controller.ts

```typescript
@Post()
@UseFilters(new HttpExceptionFilter())
async create(@Body() createCatDto: CreateCatDto) {
  throw new ForbiddenException();
}
```

!> `@UseFilters()` 装饰器从 `@nestjs/common` 包导入。

我们在 `@UseFilters()` 这里使用了装饰器。与 `@Catch()` 相同，它需要无限的参数。

在上面的例子中，`HttpExceptionFilter` 仅适用于单个 `create()` 路由处理程序，但它不是唯一的方法。实际上，异常过滤器可以是方法范围的，控制器范围的，也可以是全局范围的。

> cats.controller.ts

```typescript
@UseFilters(new HttpExceptionFilter())
export class CatsController {}
```

此结构为 `CatsController` 中的每个路由处理程序设置 `HttpExceptionFilter`。它是控制器范围的异常过滤器的示例。最后一个可用范围是全局范围的异常过滤器。

> server.ts

```typescript
async function bootstrap() {
  const app = await NestFactory.create(ApplicationModule);
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(3000);
}
bootstrap();
```

全局过滤器用于整个应用程序，每个控制器，每个路由处理程序。


!> 该 `useGlobalFilters()` 方法不会为网关和微服务设置过滤器。
