### 异常过滤器

HTTP [异常过滤器](/exception-filters)层与对应微服务层的唯一区别在于，不应抛出 `HttpException`，而应使用 `RpcException`。

```typescript
throw new RpcException('Invalid credentials.');
```

> **提示** `RpcException` 类是从 `@nestjs/microservices` 包导入的。

使用上述示例时，Nest 将处理抛出的异常并返回具有以下结构的 `error` 对象：

```json
{
  "status": "error",
  "message": "Invalid credentials."
}
```

#### 过滤器

微服务异常过滤器的行为与 HTTP 异常过滤器类似，只有一个小区别。`catch()` 方法必须返回一个 `Observable`。

```typescript
@@filename(rpc-exception.filter)
import { Catch, RpcExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { RpcException } from '@nestjs/microservices';

@Catch(RpcException)
export class ExceptionFilter implements RpcExceptionFilter<RpcException> {
  catch(exception: RpcException, host: ArgumentsHost): Observable<any> {
    return throwError(() => exception.getError());
  }
}
@@switch
import { Catch } from '@nestjs/common';
import { throwError } from 'rxjs';

@Catch(RpcException)
export class ExceptionFilter {
  catch(exception, host) {
    return throwError(() => exception.getError());
  }
}
```

> warning **警告** 使用[混合应用](/faq/hybrid-application)时，全局微服务异常过滤器默认未启用。

以下示例使用了手动实例化的方法作用域过滤器。与基于 HTTP 的应用类似，您也可以使用控制器作用域过滤器（即在控制器类前添加 `@UseFilters()` 装饰器）。

```typescript
@@filename()
@UseFilters(new ExceptionFilter())
@MessagePattern({ cmd: 'sum' })
accumulate(data: number[]): number {
  return (data || []).reduce((a, b) => a + b);
}
@@switch
@UseFilters(new ExceptionFilter())
@MessagePattern({ cmd: 'sum' })
accumulate(data) {
  return (data || []).reduce((a, b) => a + b);
}
```

#### 继承

通常，您会创建完全自定义的异常过滤器来满足应用程序需求。但在某些情况下，您可能希望直接扩展**核心异常过滤器** ，并根据特定因素覆盖其行为。

要将异常处理委托给基础过滤器，需要扩展 `BaseExceptionFilter` 并调用继承的 `catch()` 方法。

```typescript
@@filename()
import { Catch, ArgumentsHost } from '@nestjs/common';
import { BaseRpcExceptionFilter } from '@nestjs/microservices';

@Catch()
export class AllExceptionsFilter extends BaseRpcExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    return super.catch(exception, host);
  }
}
@@switch
import { Catch } from '@nestjs/common';
import { BaseRpcExceptionFilter } from '@nestjs/microservices';

@Catch()
export class AllExceptionsFilter extends BaseRpcExceptionFilter {
  catch(exception, host) {
    return super.catch(exception, host);
  }
}
```

上述实现仅是一个展示方法的框架。您对扩展异常过滤器的实现将包含您定制的**业务逻辑** （例如处理各种条件）。
