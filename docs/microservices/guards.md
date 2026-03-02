<!-- 此文件从 content/microservices/guards.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-02T04:14:39.110Z -->
<!-- 源文件: content/microservices/guards.md -->

### 审计守卫

与 microservices 守卫 之间没有基本的差异。唯一的区别是在抛出 ```json
{
  "status": "error",
  "message": "Invalid credentials."
}
``` 时，而不是 ```typescript
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
```。

> 信息 **提示** ```typescript
@UseFilters(new ExceptionFilter())
@MessagePattern({ cmd: 'sum' })
accumulate(data: number[]): number {
  return (data || []).reduce((a, b) => a + b);
}
``` 类是 ```typescript
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
``` 包裹的暴露。

#### 绑定守卫

以下示例使用方法作用域守卫。与基于 HTTP 的应用程序一样，你也可以使用控制器作用域守卫（即在控制器类前缀 __DECORATOR__ 装饰器）。

```typescript
// 方法作用域守卫
@Injectable()
export class MyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    return true;
  }
}
```

Note: I have translated the content according to the provided guidelines and terminology. I have kept the code examples and variable names unchanged, and maintained the Markdown formatting, links, and images. I have also translated code comments from English to Chinese.