# 拦截器

拦截器是`@Interceptor()` 装饰器的类。拦截器应该实现 `NestInterceptor` 接口。

![](https://docs.nestjs.com/assets/Interceptors_1.png)

拦截器具有一系列有用的功能，这些功能受面向切面编程（AOP）技术的启发。它们可以：

- 在方法执行之前/之后绑定额外的逻辑
- 转换从函数返回的结果
- 转换从函数抛出的异常
- 根据所选条件完全重写函数 (例如, 缓存目的)

## 基础

每个拦截器都有 `intercept()` 方法。这个函数需要3个参数。第一个是 `dataOrRequest` 。这个值取决于你实际使用拦截器的地方。当它是一个HTTP请求时，这个变量是一个本地 expressjs 请求对象，否则，它是传递给微服务或web套接字的数据。第二个参数是 `context` ，这与看守器中的完全相同。该对象满足 ExecutionContext 接口并包含2个成员 - parent 和handler。parent 保存该处理程序所属的控制器类的类型，handler 是对路由处理程序函数的引用。最后一个`stream$` 是 Observable。如果您不返回此 stream ，则不会计算该函数。

## 进阶

第一个用例是使用拦截器在执行函数之前或之后提供额外的逻辑。当我们要记录与应用程序的交互时, 例如存储用户调用或计算时间戳, 这会很有用。

让我们创建一个简单的 LoggingInterceptor。


> logging.interceptor.ts

```typescript
import { Interceptor, NestInterceptor, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';

@Interceptor()
export class LoggingInterceptor implements NestInterceptor {
  intercept(dataOrRequest, context: ExecutionContext, stream$: Observable<any>): Observable<any> {
    console.log('Before...');
    const now = Date.now();

    return stream$.do(
      () => console.log(`After... ${Date.now() - now}ms`),
    );
  }
}
```

?> 拦截器的作用与控制器、组件、看守器和中间件相同, 它们可以通过构造函数来插入依赖项。

由于 `stream$` 是一个 `RxJS`  Observable,我们可以使用很多不同的操作符来操纵 stream 流。以上例子，使用了`do()` 运算符，它可以调用该函数观察序列的正常执行或异常终止。
要设置拦截器, 我们使用从 `@nestjs/common` 包导入的 `@UseInterceptors()` 装饰器。与看守器一样, 拦截器可以是控制器范围内的, 方法范围内的或者全局范围内的。

> cats.controller.ts

```typescript
@UseInterceptors(LoggingInterceptor)
export class CatsController {}
```

现在, CatsController 中的每个路由处理程序都使用 LoggingInterceptor。当有人通过GET调用 `/cats` 路由时, 您将在控制台窗口中看到类似的输出:

```bash
Before...
After... 1ms
```

要绑定全局拦截器, 我们使用的是 Nest 应用程序实例的 useGlobalInterceptors() 方法:

```typescript
const app = await NestFactory.create(ApplicationModule);
app.useGlobalInterceptors(new LoggingInterceptor());
```

## 响应映射

这 `stream$` 是一个 Observable。该对象包含路由处理程序的返回值，因此我们可以使用 `map()` 运算符轻松对它进行变异。

?> 响应映射不适用于快速响应策略 (无法直接使用 `@Res()` 对象)。


让我们创建一个 TransformInterceptor, 它将打包响应并将其分配给 data 属性。

> transform.interceptor.ts

```typescript
import { Interceptor, NestInterceptor, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

@Interceptor()
export class TransformInterceptor implements NestInterceptor {
  intercept(dataOrRequest, context: ExecutionContext, stream$: Observable<any>): Observable<any> {
    return stream$.map((data) => ({ data }));
  }
}
```
!> intercept() 方法可以是 `async`。

现在，GET /cats请求的响应如下所示：

```json
{
    "data": []
}
```

## 异常映射

既然 `stream$` 是一个 Observable, 因此我们可以使用 catch() 运算符用新的 stream 重写引发的异常:

> exception.interceptor.ts

```typescript
import { Interceptor, NestInterceptor, ExecutionContext, HttpStatus } from '@nestjs/common';
import { HttpException } from '@nestjs/common';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';

@Interceptor()
export class ExceptionInterceptor implements NestInterceptor {
  intercept(dataOrRequest, context: ExecutionContext, stream$: Observable<any>): Observable<any> {
    return stream$.catch((err) => Observable.throw(
      new HttpException('Exception interceptor message', HttpStatus.BAD_GATEWAY),
    ));
  }
}
```

## stream 重写

有时, 我们可能希望完全防止调用处理程序并返回其他值。一个很好的例子是缓存拦截器, 它将缓存的响应存储一段时间。

> cache.interceptor.ts

```typescript
import { Interceptor, NestInterceptor, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

@Interceptor()
export class CacheInterceptor implements NestInterceptor {
  intercept(dataOrRequest, context: ExecutionContext, stream$: Observable<any>): Observable<any> {
    const isCached = true;
    if (isCached) {
      return Observable.of([]);
    }
    return stream$;
  } 
}
```

下面是一个带有硬编码 `isCached` 变量和缓存响应 `[]` 的 `CacheInterceptor`。由于我们正在返回通过 of 运算符创建的新流, 因此不会调用路由处理程序。若要创建通用解决方案, 可以使用 Reflector 并创建自定义修饰器。在[看守器](4.6/guards)的文章里有很好的描述。这就是一切。


!> 在拦截器中引发的异常可以被异常筛选([exception filters](4.6/exceptionfilters))捕获。

## 全局拦截器

全局拦截器不属于任何范围。它们运行在模块之外, 因此它们无法注入依赖关系。我们需要立即创建一个实例。但通常情况下, 全局拦截器依赖于其他对象, 例如, 我们希望使用 EventsService 在每个请求上发送异步事件, 但此服务是 EventsModule 的一部分。我们如何解决这个问题？

解决方案很简单。每个 Nest 应用程序实例实际上是一个创建的 Nest context。Nest 的 context 是围绕 Nest 容器的包装, 它包含所有实例化的类。我们可以直接使用应用程序对象从任何导入的模块中抓取任何现有实例。

假设我们在 EventsModule 注册了一个 EventsInterceptor。此 EventsModule 导入到根模块中。我们可以使用以下语法选择 EventsInterceptor 实例:

```typescript
const app = await NestFactory.create(ApplicationModule);
const eventsInterceptor = app
  .select(EventsModule)
  .get(EventsInterceptor);

app.useGlobalInterceptors(eventsInterceptor);
```

要抓取 EventsInterceptor 实例, 我们使用了两种方法, 详细描述如下：

|||
|--|--|
|get()|使您可以检索已处理模块内可用的组件或控制器的实例。|
|select()|允许您在模块树中导航, 例如, 从所选模块中拉出特定实例。|

?> 默认情况下选择了根模块。要选择任何其他模块, 您需要遍历整个模块堆栈 (逐步)。
