# 拦截器

拦截器是一个用 `@Injectable()` 装饰器注解并实现了 `NestInterceptor` 接口的类。

<figure><img class="illustrative-image" src="/assets/Interceptors_1.png" /></figure>

拦截器拥有一系列受[面向切面编程](https://en.wikipedia.org/wiki/Aspect-oriented_programming) (AOP)技术启发的实用功能，它们能够实现：

- 在方法执行前后绑定额外逻辑
- 转换函数返回的结果
- 转换函数抛出的异常
- 扩展基础函数行为
- 根据特定条件完全重写函数（例如出于缓存目的）

#### 基础概念

每个拦截器都实现了 `intercept()` 方法，该方法接收两个参数。第一个是 `ExecutionContext` 实例（与[守卫](./guards)中的对象完全相同）。`ExecutionContext` 继承自 `ArgumentsHost`。我们在异常过滤器章节中见过 `ArgumentsHost`，它是对原始处理程序参数的包装器，根据应用程序类型包含不同的参数数组。更多内容可以参考[异常过滤器](./exception-filters#参数主机)章节。

#### 执行上下文

通过扩展 `ArgumentsHost`，`ExecutionContext` 还新增了几个辅助方法，这些方法提供了当前执行过程的额外细节。这些细节有助于构建更通用的拦截器，使其能够跨多种控制器、方法和执行上下文工作。了解更多关于 `ExecutionContext` 的信息请[点击这里](/fundamentals/execution-context) 。

#### 调用处理器

第二个参数是 `CallHandler`。`CallHandler` 接口实现了 `handle()` 方法，您可以在拦截器中的某个时刻使用该方法来调用路由处理方法。如果在实现 `intercept()` 方法时没有调用 `handle()` 方法，则根本不会执行路由处理方法。

这种方法意味着 `intercept()` 方法实际上**包装**了请求/响应流。因此，您可以在最终路由处理程序执行**前后**实现自定义逻辑。显然，您可以在调用 `handle()` **之前**在 `intercept()` 方法中编写代码，但如何影响之后的操作呢？由于 `handle()` 方法返回一个 `Observable`，我们可以使用强大的 [RxJS](https://github.com/ReactiveX/rxjs) 操作符来进一步处理响应。用面向切面编程的术语来说，路由处理程序的调用（即调用 `handle()`）被称为[切入点](https://en.wikipedia.org/wiki/Pointcut) ，表示这是我们插入附加逻辑的点。

以传入的 `POST /cats` 请求为例。该请求将路由至 `CatsController` 中定义的 `create()` 处理器。若在调用链中有任何未执行 `handle()` 方法的拦截器，则 `create()` 方法不会被执行。当 `handle()` 被调用（并返回其 `Observable` 对象后），`create()` 处理器将被触发。通过 `Observable` 接收到响应流后，可对流执行额外操作，最终将结果返回给调用方。

#### 切面拦截

我们将探讨的第一个用例是使用拦截器记录用户交互（例如存储用户调用、异步派发事件或计算时间戳）。下面展示一个简单的 `LoggingInterceptor` 实现：

 ```typescript title="logging.interceptor.ts"
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    console.log('Before...');

    const now = Date.now();
    return next
      .handle()
      .pipe(
        tap(() => console.log(`After... ${Date.now() - now}ms`)),
      );
  }
}
```

:::info 提示
`NestInterceptor<T, R>` 是一个泛型接口，其中 `T` 表示 `Observable<T>` 的类型（支持响应流），而 `R` 是 `Observable<R>` 所包装值的类型。
:::

:::warning 注意
拦截器与控制器、提供者、守卫等一样，可以通过它们的 `constructor` 来**注入依赖** 。
:::

由于 `handle()` 返回一个 RxJS `Observable`，我们可以使用多种操作符来操作流。在上面的示例中，我们使用了 `tap()` 操作符，它会在可观察流正常或异常终止时调用我们的匿名日志记录函数，但不会干扰响应周期。

#### 绑定拦截器

要设置拦截器，我们需要使用从 `@nestjs/common` 包导入的 `@UseInterceptors()` 装饰器。与[管道](./pipes)和[守卫](./guards)类似，拦截器可以作用于控制器范围、方法范围或全局范围。

 ```typescript title="cats.controller.ts"
@UseInterceptors(LoggingInterceptor)
export class CatsController {}
```

:::info 提示
`@UseInterceptors()` 装饰器是从 `@nestjs/common` 包导入的。
:::

通过上述设置，`CatsController` 中定义的每个路由处理器都将使用 `LoggingInterceptor`。当有人调用 `GET /cats` 端点时，您将在标准输出中看到以下内容：

```typescript
Before...
After... 1ms
```

请注意，我们传入的是 `LoggingInterceptor` 类（而不是实例），将实例化的责任交给框架并启用依赖注入。与管道、守卫和异常过滤器一样，我们也可以直接传入一个实例：

 ```typescript title="cats.controller.ts"
@UseInterceptors(new LoggingInterceptor())
export class CatsController {}
```

如前所述，上述构建方式将拦截器附加到该控制器声明的每个处理程序上。若要将拦截器的作用域限制在单个方法内，只需在**方法级别**应用装饰器即可。

要设置全局拦截器，我们使用 Nest 应用实例的 `useGlobalInterceptors()` 方法：

```typescript
const app = await NestFactory.create(AppModule);
app.useGlobalInterceptors(new LoggingInterceptor());
```

全局拦截器会作用于整个应用程序中的每个控制器和每个路由处理程序。在依赖注入方面，从任何模块外部注册的全局拦截器（如上述示例中使用 `useGlobalInterceptors()`）无法注入依赖项，因为这是在模块上下文之外完成的。为解决此问题，您可以使用以下构造**直接从任何模块中**设置拦截器：

 ```typescript title="app.module.ts"
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
```

:::info 提示
使用此方法为拦截器执行依赖注入时，请注意无论该构造应用于哪个模块，拦截器实际上是全局的。应在何处进行此操作？选择定义拦截器的模块（如上例中的 `LoggingInterceptor`）。此外，`useClass` 并非处理自定义提供程序注册的唯一方式。了解更多[此处](/fundamentals/dependency-injection) 。
:::

#### 响应映射

我们已经知道 `handle()` 返回一个 `Observable`。该流包含从路由处理程序**返回**的值，因此我们可以轻松使用 RxJS 的 `map()` 操作符来改变它。

:::warning 警告
 响应映射功能不适用于库特定的响应策略（直接使用 `@Res()` 对象是被禁止的）。
:::

我们来创建 `TransformInterceptor`，它将通过简单修改每个响应来演示这个过程。它将使用 RxJS 的 `map()` 操作符，将响应对象赋值给新创建对象的 `data` 属性，然后将新对象返回给客户端。

 ```typescript title="transform.interceptor.ts"
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  data: T;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(map(data => ({ data })));
  }
}
```

:::info 提示
Nest 拦截器同时支持同步和异步的 `intercept()` 方法。如果需要，你可以简单地将方法切换为 `async`。
:::

通过上述实现，当有人调用 `GET /cats` 端点时，响应将如下所示（假设路由处理程序返回一个空数组 `[]`）：

```json
{
  "data": []
}
```

拦截器在创建可重用的解决方案方面具有巨大价值，这些方案可以满足整个应用程序中出现的需求。例如，假设我们需要将每个出现的 `null` 值转换为空字符串 `''`。我们可以用一行代码实现，并将拦截器全局绑定，这样它就会自动被每个已注册的处理程序使用。

```typescript
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ExcludeNullInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next
      .handle()
      .pipe(map(value => value === null ? '' : value ));
  }
}
```

#### 异常映射

另一个有趣的用例是利用 RxJS 的 `catchError()` 操作符来覆盖抛出的异常：

 ```typescript title="errors.interceptor.ts"
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  BadGatewayException,
  CallHandler,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next
      .handle()
      .pipe(
        catchError(err => throwError(() => new BadGatewayException())),
      );
  }
}
```

#### 流覆盖

有时我们可能希望完全阻止调用处理程序并返回不同的值，这有几个原因。一个明显的例子是实现缓存以提高响应时间。让我们看一个简单的**缓存拦截器** ，它从缓存中返回响应。在实际应用中，我们还需要考虑 TTL、缓存失效、缓存大小等其他因素，但这超出了本次讨论的范围。这里我们将提供一个展示核心概念的基础示例。

 ```typescript title="cache.interceptor.ts"
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, of } from 'rxjs';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const isCached = true;
    if (isCached) {
      return of([]);
    }
    return next.handle();
  }
}
```

我们的 `CacheInterceptor` 有一个硬编码的 `isCached` 变量和一个同样硬编码的响应 `[]`。关键要注意的是，我们在这里返回了一个由 RxJS 的 `of()` 操作符创建的新流，因此路由处理程序**根本不会被调用** 。当有人调用使用 `CacheInterceptor` 的端点时，响应（一个硬编码的空数组）会立即返回。为了创建一个通用解决方案，你可以利用 `Reflector` 并创建一个自定义装饰器。`Reflector` 在[守卫](./guards)章节中有详细描述。

#### 更多操作符

使用 RxJS 操作符操作流的能力为我们提供了许多可能性。让我们考虑另一个常见用例。假设你想处理路由请求的**超时**问题。当你的端点在一段时间后没有返回任何内容时，你希望以错误响应终止。以下结构实现了这一功能：

 ```typescript title="timeout.interceptor.ts"
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, RequestTimeoutException } from '@nestjs/common';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      timeout(5000),
      catchError(err => {
        if (err instanceof TimeoutError) {
          return throwError(() => new RequestTimeoutException());
        }
        return throwError(() => err);
      }),
    );
  };
};
```

5 秒后，请求处理将被取消。您也可以在抛出 `RequestTimeoutException` 之前添加自定义逻辑（例如释放资源）。
