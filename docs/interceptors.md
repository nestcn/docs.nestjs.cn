### 拦截器

拦截器是一类使用 `@Injectable()` 装饰器注解的类，它实现了 `NestInterceptor` 接口。

<figure><img class="illustrative-image" src="/assets/Interceptors_1.png" /></figure>

拦截器具有许多有用的功能，受到了 [Aspect Oriented Programming](https://en.wikipedia.org/wiki/Aspect-oriented_programming) (面向切面编程)技术的启发。它们使我们能够：

* 在方法执行前/后绑定额外的逻辑
* 将函数返回值转换
* 将函数抛出的异常转换
* 扩展基本函数行为
* 根据特定条件完全override函数

#### 基础

每个拦截器都实现了 `intercept()` 方法，该方法接受两个参数。第一个参数是 __INLINE_CODE_