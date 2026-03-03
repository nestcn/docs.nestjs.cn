<!-- 此文件从 content/interceptors.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-02T04:06:23.494Z -->
<!-- 源文件: content/interceptors.md -->

### 拦截器

拦截器是使用`@Injectable()`装饰器注解的类，实现`NestInterceptor`接口。

<figure><img class="illustrative-image" src="/assets/Interceptors_1.png" /></figure>

拦截器具有许多有用的功能，受到[Aspect Oriented Programming](https://en.wikipedia.org/wiki/Aspect-oriented_programming)（AOP）技术的灵感。它们使得我们能够：

- 在方法执行前/后绑定额外的逻辑
- 将函数的结果进行转换
- 将函数抛出的异常进行转换
- 扩展基本函数行为
- 根据特定条件完全override函数（例如，用于缓存目的）

#### 基本概念

每个拦截器都实现了`intercept()`方法，该方法接受两个参数。第一个参数是__