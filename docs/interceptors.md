<!-- 此文件从 content/interceptors.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-01T04:14:27.055Z -->
<!-- 源文件: content/interceptors.md -->

### 拦截器

拦截器是一个带有 `@Injectable()` 装饰器的类，实现了 `NestInterceptor` 接口。

<figure><img class="illustrative-image" src="/assets/Interceptors_1.png" /></figure>

拦截器拥有许多有用的能力，这些能力受到 [Aspect Oriented Programming](https://en.wikipedia.org/wiki/Aspect-oriented_programming) (AOP) 技术的启发。它们使我们能够：

- 在方法执行前/后绑定额外的逻辑
- 转换函数返回的结果
- 转换函数抛出的异常
- 扩展基本函数行为
- 根据特定条件完全override一个函数（例如，用于缓存目的）

#### 基本概念

每个拦截器都实现了 `intercept()` 方法，这个方法接受两个参数。第