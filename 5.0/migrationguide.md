## 迁移指南


本文提供了一套从v4迁移到最新v5版本的**指导原则**。在开发过程中，我们花了很多时间试图避免任何重大改变。尽管如此，为了简化它的使用，API必须在一堆地方进行更改。此外，以前的版本由于已经做出的决定而受到限制。

### 模板
为了减少Nest和Angular之间的差异数量，根据`@Module()`装饰器进行了很少的更改。

* `modules`属性现在已被弃用,改用`imports`
* `components`属性现在已被弃用,改为使用`providers`

### 装饰器

`@Component()`，`@Middleware()`，`@Interceptor()`，`@Pipe()`和`@Guard()`现在已弃用。使用`@Injectable()`来代替。

###  中间件

我们不再完全支持传统的快递中间件模型，也就是说，无论请求方式如何，每个中间件现在都只限于一条**路径**。而且，不会有更多的错误中间件。这一变化有助于我们在可移植性和兼容性之间找到中间立场。

```typescript
// Before
consumer.apply(LoggerMiddleware).forRoutes(
  { path: '/cats', method: RequestMethod.GET },
  { path: '/cats', method: RequestMethod.POST },
);

// After
consumer.apply(LoggerMiddleware).forRoutes('cats');
```
但是，如果您仍然需要将中间件绑定到特定的请求方法，则可以**直接**使用快速实例。
```typescript
const app = await NestFactory.create(ApplicationModule);
app.get('cats', logger);
```

但**推荐**的方法是使用管道，警卫或拦截器。

### 消费者

`MiddlewaresConsumer`类已更改为`MiddlewareConsumer`。

### 过滤器


异常过滤器不再作为单一范式被锁定。以前，异常过滤器可以访问`响应`对象。与传入的发行版一起，`catch()`方法取而代之使用`ArgumentsHost`实例。
```typescript
// Before
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, response) {}
}

// After
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();
    // ...
  }
}
```
### 看守器
与过滤器一样，看守器现在更加**灵活**。访问增强的`ExecutionContext`让守卫更加超级强大，并且所有这些都是在简化的API基础上构建的。
```typescript
// Before
@Guard()
export class RolesGuard implements CanActivate {
  canActivate(
    dataOrRequest,
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return true;
  }
}

// After
@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // const request = context.switchToHttp().getRequest();
    return true;
  }
}
```
### 拦截器


拦截器API的演变方式与等效的看守器API**完全相同**。
```typescript
// Before
@Interceptor()
export class TransformInterceptor implements NestInterceptor {
  intercept(
    dataOrRequest,
    context: ExecutionContext,
    stream$: Observable<any>,
  ): Observable<any> {
    return stream$.map((data) => ({ data }));
  }
}

// After
@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    call$: Observable<T>,
  ): Observable<Response<T>> {
    // const request = context.switchToHttp().getRequest();
    return call$.pipe(map(data => ({ data })));
  }
}
```
### 自定义装饰器

`createRouteParamDecorator()`函数现在已被弃用。现在使用`createParamDecorator()`。

 ### 译者署名

| 用户名 | 头像 | 职能 | 签名 |
|---|---|---|---|
| [@zuohuadong](https://www.zhihu.com/people/dongcang)  | <img class="avatar-66 rm-style" src="https://pic.downk.cc/item/5f4cafe7160a154a67c4047b.jpg">  |  翻译  | 专注于 caddy 和 nest，[@zuohuadong](https://github.com/zuohuadong/) at Github  |
| [@Drixn](https://drixn.com/)  | <img class="avatar-66 rm-style" src="https://cdn.drixn.com/img/src/avatar1.png">  |  翻译  | 专注于 nginx 和 C++，[@Drixn](https://drixn.com/) |