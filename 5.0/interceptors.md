# 拦截器

拦截器是`@Injectable()` 装饰器注解的类。拦截器应该实现 `NestInterceptor` 接口。

![](https://docs.nestjs.com/assets/Interceptors_1.png)

拦截器具有一系列有用的功能，这些功能受面向切面编程（AOP）技术的启发。它们可以：

- 在函数执行之前/之后绑定额外的逻辑
- 转换从函数返回的结果
- 转换从函数抛出的异常
- 根据所选条件完全重写函数 (例如, 缓存目的)

## 基础

每个拦截器都有 `intercept()` 方法，它许2个参数的方法。 第一个是 `ExecutionContext` 实例（与看守器完全相同的对象）。 在 ExecutionContext 从继承 ArgumentsHost（第一次提到[在这里](/5.0/exceptionfilters)）。  ArgumentsHost 是传递给原始处理程序的参数的一个包装 ，它根据应用程序的类型在引擎下包含不同的参数数组。

```typescript
export interface ArgumentsHost {
  getArgs<T extends Array<any> = any[]>(): T;
  getArgByIndex<T = any>(index: number): T;
  switchToRpc(): RpcArgumentsHost;
  switchToHttp(): HttpArgumentsHost;
  switchToWs(): WsArgumentsHost;
}
```
ArgumentsHost 为我们提供了一套有用的方法, 帮助从基础数组中选取正确的参数。换言之, ArgumentsHost 只是一个参数数组而已。例如, 当在 HTTP 应用程序上下文中使用该保护程序时, ArgumentsHost 将在内部包含 [request, response] 数组。但是, 当当前上下文是 web 套接字应用程序时, 此数组将等于 [client, data]。通过此设计决策, 您可以访问最终传递给相应处理程序的任何参数。

ExecutionContext 提供多一点点。它扩展了 ArgumentsHost, 而且还提供了有关当前执行过程的更多细节。

```typescript
export interface ExecutionContext extends ArgumentsHost {
  getClass<T = any>(): Type<T>;
  getHandler(): Function;
}
```
所述 getHandler() 返回一个参考当前处理的处理程序，而 getClass() 返回的类型的 Controller 此特定处理程序属于类别。使用换句话说，如果用户指向 create() 方法被定义和内注册 CatsController时，getHandler() 将返回一个 create() 参考方法和 getClass()，在这种情况下，将简单地返回一个 CatsController 类型（未实例）。

第二个参数是一个 `call$` ，一个 Observable 流。如果你不返回这个流，主处理程序将不会被评估。这是什么意思？基本上，这 `call$` 是一个推迟最终处理程序执行的流。比方说，有人提出了 POST `/cats` 请求。这个请求指向在 create() 里面定义的处理程序 CatsController 。如果 `call$` 一直拦截不会返回流，create() 则不会计算该方法。只有当 `call$` 流返回时，最终的方法才会被触发。为什么？因为 Nest 订阅到返回的流，并使用此流生成的值为最终用户创建单个响应或多个响应。此外，正如前面提到的，`call$` 是一个 Observable，也就是说，它为我们提供了一组非常强大的操作符，可以帮助处理例如响应操作。

## 截取之前/之后

第一个用例是使用拦截器在函数执行之前或之后添加额外的逻辑。当我们记录与应用程序的交互时，例如存储用户调用，异步调度事件或计算时间戳，这很有用。作为一个例子，我们来创建一个简单的例子LoggingInterceptor。

> logging.interceptor.ts

```typescript
import { Injectable, NestInterceptor, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    call$: Observable<any>,
  ): Observable<any> {
    console.log('Before...');
  
    const now = Date.now();
    return call$.pipe(
      tap(() => console.log(`After... ${Date.now() - now}ms`)),
    );
  }
}
```

?> 拦截器的作用与控制器、组件、看守器和中间件相同, 它们可以通过构造函数来插入依赖项。

由于 `stream$` 是一个 `RxJS`  Observable,我们可以使用很多不同的操作符来操纵 stream 流。以上例子，使用了`tap()` 运算符，它可以调用该函数观察序列的正常执行或异常终止。
要设置拦截器, 我们使用从 `@nestjs/common` 包导入的 `@UseInterceptors()` 装饰器。与看守器一样, 拦截器可以是控制器范围内的, 方法范围内的或者全局范围内的。

> cats.controller.ts

```typescript
@UseInterceptors(LoggingInterceptor)
export class CatsController {}
```

?> @UseInterceptors() 装饰器需要import @nestjs/common。

由此，每个定义的路由处理器 CatsController 都会使用 LoggingInterceptor。当有人调用 GET `/cats` 端点时，您将在控制台窗口中看到以下输出：

```typescript
Before...
After... 1ms
```
请注意，我们通过 LoggingInterceptor 类型而不是实例，使框架实例化责任并启用依赖注入。另一种可用的方法是通过立即创建的实例：

> cats.controller.ts

```typescript
@UseInterceptors(new LoggingInterceptor())
export class CatsController {}
```
如上所述, 上面的构造将拦截器附加到此控制器声明的每个处理程序。如果我们决定只限制其中一个, 我们只需在方法级别设置拦截器。为了绑定全局拦截器, 我们使用 Nest 应用程序实例的 useGlobalInterceptors() 方法:

```typescript
const app = await NestFactory.create(ApplicationModule);
app.useGlobalInterceptors(new LoggingInterceptor());
```

全局拦截器用于整个应用程序、每个控制器和每个路由处理程序。在依赖注入方面, 从任何模块外部注册的全局拦截器 (如上面的示例中所示) 无法插入依赖项, 因为它们不属于任何模块。为了解决此问题, 您可以使用以下构造直接从任何模块设置一个看守器:

> app.module.ts

```typescript
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
export class ApplicationModule {}
```

?> 另一种选择是使用[执行上下文](/5.0/executioncontext)功能。另外，useClass 并不是处理自定义提供商注册的唯一方法。在[这里](/5.0/fundamentals?id=dependency-injection)了解更多。




## 响应映射


我们已经知道, call$ 是一个 Observable。此对象包含从路由处理程序返回的值, 因此我们可以使用 `map()` 运算符轻松地对其进行改变。



?> 响应映射不适用于快速响应策略 (无法直接使用 `@Res()` 对象)。


让我们创建一个 TransformInterceptor, 它将打包响应并将其分配给 data 属性。

> transform.interceptor.ts

```typescript
import { Injectable, NestInterceptor, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  data: T;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>> {
  intercept(
    context: ExecutionContext,
    call$: Observable<T>,
  ): Observable<Response<T>> {
    return call$.pipe(map(data => ({ data })));
  }
}
```
？> 嵌套拦截器的工作就像一个具有异步 intercept() 函数的魅力, 意思是, 你可以毫不费力地切换你的函数, 如果必须异步。

之后，当有人调用GET `/cats`端点时，请求将如下所示（我们假设路由处理程序返回一个空 arry[]）：

```
{
    "data": []
}
```

拦截器在创建用于整个应用程序的可重用解决方案时具有巨大的潜力。例如，我们假设我们需要将每个发生的null值转换为空字符串''。我们可以使用一行代码并将拦截器绑定为全局代码。由于这一点，它会被每个注册处理程序自动重用。

```typescript
import { Injectable, NestInterceptor, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ExcludeNullInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    call$: Observable<any>,
  ): Observable<any> {
    return call$.pipe(map(value => value === null ? '' : value ));
  }
}
```


## 异常映射

另一个有趣的用例是利用 catchError() 操作符来覆盖抛出的异常：

> exception.interceptor.ts

```typescript
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  HttpStatus,
} from '@nestjs/common';
import { HttpException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { _throw } from 'rxjs/observable/throw';

@Injectable()
export class ErrorsInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    call$: Observable<any>,
  ): Observable<any> {
    return call$.pipe(
      catchError(err =>
        _throw(new HttpException('Message', HttpStatus.BAD_GATEWAY)),
      ),
    );
  }
}
```

## stream 重写

有时我们可能希望完全防止调用处理程序并返回不同的值 (例如, 由于性能问题而导致缓存), 这是有多种原因的。一个很好的例子是缓存拦截器, 它将缓存的响应存储在一些 TTL 中。不幸的是, 这个功能需要更多的代码和由于简化, 我们将提供一个基本的例子, 应该简要解释的主要概念。

> cache.interceptor.ts

```typescript
import { Injectable, NestInterceptor, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { of } from 'rxjs/observable/of';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    call$: Observable<any>,
  ): Observable<any> {
    const isCached = true;
    if (isCached) {
      return of([]);
    }
    return call$;
  }
}
```


这里有一个 CacheInterceptor 与硬编码的 isCached 变量和硬编码的 `response[]` 。我们在这里通过运算符创建返回了一个新的流, 因此路由处理程序根本不会被调用。当有人调用使用 CacheInterceptor 的端点时, 响应 (硬编码的空数组) 将返回 immedietely。为了创建通用解决方案, 您可以利用反射器并创建自定义修饰符。该反射器是很好地描述在看守器章。

返回流给了我们许多可能性。让我们考虑另一个常见的用例。假设您想处理 timeout 。当端点在一段时间后没有返回任何内容时, 我们希望得到错误响应。

> timeout.interceptor.ts

```typescript
import { Injectable, NestInterceptor, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    call$: Observable<any>,
  ): Observable<any> {
    return call$.pipe(timeout(5000))
  }
}
```

5秒后，请求处理将被取消。

