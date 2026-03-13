<!-- 此文件从 content/microservices/exception-filters.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T05:03:58.935Z -->
<!-- 源文件: content/microservices/exception-filters.md -->

### 异常过滤器

HTTP [exception filter](/exception-filters) 层和相应的微服务层之间唯一的区别是，在抛出 `HttpException` 时，而不是抛出 `RpcException`。

```typescript
throw new RpcException('Invalid credentials.');

```

> info **提示** `RpcException` 类来自 `@nestjs/microservices` 包。

Nest 将处理抛出的异常，并返回 `error` 对象，具有以下结构：

```json
{
  "status": "error",
  "message": "Invalid credentials."
}

```

#### 过滤器

微服务异常过滤器与 HTTP 异常过滤器类似，只是有一点不同。`catch()` 方法必须返回 `Observable`。

```typescript
import { Catch, RpcExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { RpcException } from '@nestjs/microservices';

@Catch(RpcException)
export class ExceptionFilter implements RpcExceptionFilter<RpcException> {
  catch(exception: RpcException, host: ArgumentsHost): Observable<any> {
    return throwError(() => exception.getError());
  }
}

@Catch(RpcException)
export class ExceptionFilter {
  catch(exception, host) {
    return throwError(() => exception.getError());
  }
}

```

> warning **警告** 使用 [hybrid application](/faq/hybrid-application) 时，global 微服务异常过滤器默认不启用。

以下示例使用手动实例化的方法作用域过滤器。与 HTTP 基于应用程序一样，你也可以使用控制器作用域过滤器（即将控制器类前缀为 `@UseFilters()` 装饰器）。

```typescript
@UseFilters(new ExceptionFilter())
@MessagePattern({ cmd: 'sum' })
accumulate(data: number[]): number {
  return (data || []).reduce((a, b) => a + b);
}

```

#### 继承

通常，您将创建完全自定义的异常过滤器，以满足应用程序需求。然而，有些情况下，您可能想简单地继承 **核心异常过滤器**，并根据某些因素Override行为。

要将异常处理委托给基过滤器，您需要继承 `BaseExceptionFilter` 并调用继承的 `catch()` 方法。

```typescript
import { Catch, ArgumentsHost } from '@nestjs/common';
import { BaseRpcExceptionFilter } from '@nestjs/microservices';

@Catch()
export class AllExceptionsFilter extends BaseRpcExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    return super.catch(exception, host);
  }
}

@Catch()
export class AllExceptionsFilter extends BaseRpcExceptionFilter {
  catch(exception, host) {
    return super.catch(exception, host);
  }
}

```

上述实现只是一个 shell，演示了方法。您的扩展异常过滤器实现将包括您自己的 **业务逻辑**（例如，处理各种情况）。