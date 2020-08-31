# 拦截器

拦截器是使用 `@Injectable()` 装饰器注解的类。拦截器应该实现 `NestInterceptor` 接口。

![](https://docs.nestjs.com/assets/Interceptors_1.png)

拦截器具有一系列有用的功能，这些功能受面向切面编程（AOP）技术的启发。它们可以：

- 在函数执行之前/之后绑定**额外的逻辑**
- 转换从函数返回的结果
- **转换**从函数抛出的异常
- 扩展基本函数行为
- 根据所选条件完全重写函数 (例如, 缓存目的)

## 基础

每个拦截器都有 `intercept()` 方法，它接收2个参数。 第一个是 `ExecutionContext` 实例（与守卫完全相同的对象）。 `ExecutionContext` 继承自 `ArgumentsHost` 。  `ArgumentsHost` 是传递给原始处理程序的参数的一个包装 ，它根据应用程序的类型包含不同的参数数组。你可以在[这里](/6/exceptionfilters.md?id=arguments-host)读更多关于它的内容（在异常过滤器章节中）。

## 执行上下文

`ExecutionContext` 提供了更多功能，它扩展了 `ArgumentsHost`，但是也提供了有关当前执行过程的更多详细信息。

```typescript
export interface ExecutionContext extends ArgumentsHost {
  getClass<T = any>(): Type<T>;
  getHandler(): Function;
}
```

`getHandler()` 方法返回对当前处理的处理程序的引用,而 `getClass()` 返回此特定处理程序所属的 `Controller` 类的类型。用另外的话来说,如果用户指向在 `CatsController` 中定义和注册的 `create()` 方法, `getHandler()` 将返回对 `create()` 方法的引用，在这种情况下, `getClass()` 将只返回一个 `CatsController` 的类型（不是实例）。

## 调用处理程序

第二个参数是 `CallHandler`。如果不手动调用 `handle()` 方法，则主处理程序根本不会进行求值。这是什么意思？基本上，`CallHandler`是一个包装执行流的对象，因此推迟了最终的处理程序执行。

比方说，有人提出了 POST `/cats` 请求。此请求指向在 `CatsController` 中定义的 `create()` 处理程序。如果在此过程中未调用拦截器的 `handle()` 方法，则 `create()` 方法不会被计算。只有 `handle()` 被调用（并且已返回值），最终方法才会被触发。为什么？因为Nest订阅了返回的流，并使用此流生成的值来为最终用户创建单个响应或多个响应。而且，`handle()` 返回一个 `Observable`，这意味着它为我们提供了一组非常强大的运算符，可以帮助我们进行例如响应操作。

## 截取切面

第一个用例是使用拦截器在函数执行之前或之后添加额外的逻辑。当我们要记录与应用程序的交互时，它很有用，例如 存储用户调用，异步调度事件或计算时间戳。作为一个例子，我们来创建一个简单的例子 `LoggingInterceptor`。

> logging.interceptor.ts

```typescript
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

!> `NestInterceptor<T，R>` 是一个通用接口，其中 `T` 表示已处理的 `Observable<T>` 的类型（在流后面），而 `R` 表示包含在返回的 `Observable<R>` 中的值的返回类型。

?> 拦截器的作用与控制器，提供程序，守卫等相同，这意味着它们可以通过构造函数注入依赖项。

由于 `handle()` 返回一个RxJS `Observable`，我们有很多种操作符可以用来操作流。在上面的例子中，我们使用了 `tap()` 运算符，该运算符在可观察序列的正常或异常终止时调用函数。

## 绑定拦截器

为了设置拦截器, 我们使用从 `@nestjs/common` 包导入的 `@UseInterceptors()` 装饰器。与守卫一样, 拦截器可以是控制器范围内的, 方法范围内的或者全局范围内的。

> cats.controller.ts

```typescript
@UseInterceptors(LoggingInterceptor)
export class CatsController {}
```

?> `@UseInterceptors()` 装饰器从 `@nestjs/common` 导入。

由此，`CatsController` 中定义的每个路由处理程序都将使用 `LoggingInterceptor`。当有人调用 GET `/cats` 端点时，您将在控制台窗口中看到以下输出：

```typescript
Before...
After... 1ms
```
请注意，我们传递的是 `LoggingInterceptor` 类型而不是实例，让框架承担实例化责任并启用依赖注入。另一种可用的方法是传递立即创建的实例：

> cats.controller.ts

```typescript
@UseInterceptors(new LoggingInterceptor())
export class CatsController {}
```
如上所述, 上面的构造将拦截器附加到此控制器声明的每个处理程序。如果我们决定只限制其中一个, 我们只需在**方法级别**设置拦截器。为了绑定全局拦截器, 我们使用 Nest 应用程序实例的 `useGlobalInterceptors()` 方法:

```typescript
const app = await NestFactory.create(ApplicationModule);
app.useGlobalInterceptors(new LoggingInterceptor());
```

全局拦截器用于整个应用程序、每个控制器和每个路由处理程序。在依赖注入方面, 从任何模块外部注册的全局拦截器 (如上面的示例中所示) 无法插入依赖项, 因为它们不属于任何模块。为了解决此问题, 您可以使用以下构造**直接从任何模块**设置一个拦截器:

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

!> 另一种选择是使用[执行上下文](/6/executioncontext.md)功能。另外，useClass 并不是处理自定义提供商注册的唯一方法。在[这里](/6/fundamentals.md)了解更多。

## 响应映射


我们已经知道, `handle()` 返回一个 `Observable`。此流包含从路由处理程序返回的值, 因此我们可以使用 `map()` 运算符轻松地对其进行改变。

?> 响应映射功能不适用于特定于库的响应策略（禁止直接使用 `@Res()` 对象）。

让我们创建一个 TransformInterceptor, 它将打包响应并将其分配给 data 属性。

> transform.interceptor.ts

```typescript
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

!> `Nest` 拦截器就像使用异步 `intercept()` 方法的魅力一样, 意思是, 如果需要，您可以毫不费力地将方法切换为异步。

之后，当有人调用GET `/cats`端点时，请求将如下所示（我们假设路由处理程序返回一个空 arry `[]`）：

```
{
    "data": []
}
```

拦截器在创建用于整个应用程序的可重用解决方案时具有巨大的潜力。例如，我们假设我们需要将每个发生的 `null` 值转换为空字符串 `''`。我们可以使用一行代码并将拦截器绑定为全局代码。由于这一点，它会被每个注册的处理程序自动重用。

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


## 异常映射

另一个有趣的用例是利用 `catchError()` 操作符来覆盖抛出的异常：

> exception.interceptor.ts

```typescript
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
        catchError(err => throwError(new BadGatewayException())),
      );
  }
}
```

## Stream 重写

有时我们可能希望完全阻止调用处理程序并返回不同的值 (例如, 由于性能问题而从缓存中获取), 这是有多种原因的。一个很好的例子是**缓存拦截器**，它将使用一些TTL存储缓存的响应。不幸的是, 这个功能需要更多的代码并且由于简化, 我们将仅提供简要解释主要概念的基本示例。

> cache.interceptor.ts

```typescript
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

这是一个 `CacheInterceptor`，带有硬编码的 `isCached` 变量和硬编码的响应 `[]` 。我们在这里通过 `of` 运算符创建并返回了一个新的流, 因此路由处理程序**根本不会被调用**。当有人调用使用 `CacheInterceptor` 的端点时, 响应 (一个硬编码的空数组) 将立即返回。为了创建一个通用解决方案, 您可以利用 `Reflector` 并创建自定义修饰符。反射器 `Reflector` 在守卫章节描述的很好。

## 更多操作者

返回流的可能性为我们提供了许多可能性。让我们考虑另一个常见的用例。假设您想处理 **timeout** 。当端点在一段时间后没有返回任何内容时, 我们希望得到错误响应。

> timeout.interceptor.ts

```typescript
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(timeout(5000))
  }
}
```

5秒后，请求处理将被取消。

 ### 译者署名

| 用户名 | 头像 | 职能 | 签名 |
|---|---|---|---|
| [@zuohuadong](https://www.zhihu.com/people/dongcang)  | <img class="avatar-66 rm-style" src="https://pic.downk.cc/item/5f4cafe7160a154a67c4047b.jpg">  |  翻译  | 专注于 caddy 和 nest，[@zuohuadong](https://github.com/zuohuadong/) at Github  |
[@Armor](https://github.com/Armor-cn)  | <img class="avatar-66 rm-style" height="70" src="https://avatars3.githubusercontent.com/u/31821714?s=460&v=4">  |  翻译  | 专注于 Java 和 Nest，[@Armor](https://armor.ac.cn/) 
| [@Drixn](https://drixn.com/)  | <img class="avatar-66 rm-style" src="https://cdn.drixn.com/img/src/avatar1.png">  |  翻译  | 专注于 nginx 和 C++，[@Drixn](https://drixn.com/) |
| [@havef](https://havef.github.io)  | <img class="avatar-66 rm-style" height="70" src="https://avatars1.githubusercontent.com/u/54462?s=460&v=4">  |  校正  | 数据分析、机器学习、TS/JS技术栈 [@havef](https://havef.github.io) |
| [@franken133](https://github.com/franken133)  | <img class="avatar rounded-2" src="https://avatars0.githubusercontent.com/u/17498284?s=400&amp;u=aa9742236b57cbf62add804dc3315caeede888e1&amp;v=4" height="70">  |  翻译  | 专注于 java 和 nest，[@franken133](https://github.com/franken133)|
