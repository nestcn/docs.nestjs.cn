# 异常过滤器（）

在 Nest 中，有一个异常层，其责任是捕获未处理的异常，并将适当的响应返回给最终用户。


每个异常都是由全局异常过滤器处理的，当它无法识别时（不是HttpException继承的类HttpException），用户会收到下面的JSON响应：

```
{
    "statusCode": 500,
    "message": "Internal server error"
}
```

## HttpException

包HttpException内 有一个内置的类@nestjs/common。核心异常处理程序非常适合这个类。当你抛出HttpException对象时，它将被处理程序捕获并转换为相关的JSON响应。

在CatsController，我们有一个create()方法（POST路线）。让我们假设这个路由处理器由于某种原因会抛出一个异常。我们要硬编码它：

`cats.controller.ts`

```typescript
@Post()
async create(@Body() createCatDto: CreateCatDto) {
  throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
}
```

?> 警告：我已经在HttpStatus这里使用了。这是从@nestjs/common包中导入的帮助枚举。

现在当客户端调用这个端点时，响应如下所示：

```
{
    "statusCode": 403,
    "message": "Forbidden"
}
```

该HttpException构造函数将string | object作为第一个参数。如果你通过object而不是一个string，你会完全覆盖响应主体。

`cats.controller.ts`

```typescript
@Post()
async create(@Body() createCatDto: CreateCatDto) {
  throw new HttpException({
    status: HttpStatus.FORBIDDEN,
    error: 'This is a custom message',
  });
}
```

这就是回应的样子：

```
{
    "status": 403,
    "error": "This is a custom message"
}
```

## 异常层次（Exceptions Hierarchy）

好的做法是创建您自己的异常层次结构。这意味着每个HTTP异常都应该从基HttpException类继承。因此，Nest会识别您的所有异常，并会全面关注错误响应。

`forbidden.exception.ts`

```typescript
export class ForbiddenException extends HttpException {
  constructor() {
    super('Forbidden', HttpStatus.FORBIDDEN);
  }
}
```

既然ForbiddenException扩展了这个基础HttpException，它将和核心异常处理程序一起工作，所以我们可以在这个create()方法中使用这个类。

`cats.controller.ts`

```typescript
@Post()
async create(@Body() createCatDto: CreateCatDto) {
  throw new ForbiddenException();
}
```

## HTTP exceptions

为了减少样板代码，Nest提供了一系列扩展核心的可用异常HttpException。所有这些都可以在@nestjs/common包中找到：

+ BadRequestException
+ UnauthorizedException
+ NotFoundException
+ ForbiddenException
+ NotAcceptableException
+ RequestTimeoutException
+ ConflictException
+ GoneException
+ PayloadTooLargeException
+ UnsupportedMediaTypeException
+ UnprocessableException
+ InternalServerErrorException
+ NotImplementedException
+ BadGatewayException
+ ServiceUnavailableException当
+ GatewayTimeoutException

## 异常过滤器（Exception Filters）
基本异常处理程序很好，但有时您可能想要完全控制异常层，例如添加一些日志记录或使用不同的JSON模式。我们喜欢通用的解决方案，使您的生活更轻松，这就是为什么称为异常过滤器的功能被创建 的原因

我们要创建过滤器，其责任是抓住HttpException并重写message属性。

`http-exception.filter.ts`

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

这response是一个本地快递响应对象。这exception是一个当前处理的异常。

?> 提示：每个异常过滤器都应该实现这个ExceptionFilter接口。它强制提供catch()具有适当签名的方法。

所述@Catch()装饰结合所需的元数据到异常过滤器。它告诉Nest，这个过滤器正在寻找HttpException。在@Catch()需要的参数无限算的，所以你可以设置该过滤器的几个类型的异常，只是用逗号将它们分开。

最后一步是通知Nest HttpExceptionFilter应该在create()方法内使用。

`cats.controller.ts`

```typescript
@Post()
@UseFilters(new HttpExceptionFilter())
async create(@Body() createCatDto: CreateCatDto) {
  throw new ForbiddenException();
}
```

?> 警告：的@UseFilters()装饰从进口@nestjs/common包。

我们在@UseFilters()这里使用了装饰器。同样@Catch()，它需要无限的参数。

在上面的例子中，HttpExceptionFilter仅适用于单个create()路由处理程序，但它不是唯一的方法。实际上，异常过滤器可以是方法范围的，控制器范围的，也可以是全局范围的。

`cats.controller.ts`

```typescript
@UseFilters(new HttpExceptionFilter())
export class CatsController {}
```

这个结构HttpExceptionFilter为每个路由处理器内部设置CatsController。这是控制器范围的异常过滤器的例子。最后一个可用范围是全局范围的异常过滤器。

`server.ts`

```typescript
async function bootstrap() {
  const app = await NestFactory.create(ApplicationModule);
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(3000);
}
bootstrap();
```

全局过滤器用于整个应用程序，每个控制器，每个路由处理程序。

?> 注意：该useGlobalFilters()方法不会为网关和微服务设置筛选器。
