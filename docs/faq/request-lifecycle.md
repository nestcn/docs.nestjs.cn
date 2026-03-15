<!-- 此文件从 content/faq/request-lifecycle.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T04:48:01.361Z -->
<!-- 源文件: content/faq/request-lifecycle.md -->

### 请求生命周期

Nest 应用程序处理请求并生成响应，称为 **请求生命周期**。通过中间件、管道、守卫和拦截器，可以追踪特定代码在请求生命周期中的执行位置，特别是在全局、控制器级别和路由级别组件中。总的来说，请求流经中间件到守卫，然后到拦截器，最后返回路径（生成响应时）到拦截器。

#### 中间件

中间件按特定顺序执行。首先，Nest 运行全局绑定的中间件（如 __INLINE_CODE_2__），然后运行 __LINK_15__，这些中间件根据路径确定。中间件按顺序执行，类似于 Express 中的中间件。对于绑定在不同模块中的中间件，根模块绑定的中间件将首先执行，然后是根据 imports 数组顺序执行的中间件。

#### 守卫

守卫的执行从全局守卫开始，然后是控制器守卫，最后是路由守卫。与中间件一样，守卫按顺序执行。例如：

```bash
$ npm install @nestjs/common @nestjs/core reflect-metadata

```

__INLINE_CODE_3__ 将在 __INLINE_CODE_4__ 之前执行， __INLINE_CODE_5__ 将在 __INLINE_CODE_3__ 和 __INLINE_CODE_4__ 之前执行。

> info **提示**  When speaking about globally bound vs controller or locally bound, the difference is where the guard (or other component is bound). If you are using __INLINE_CODE_6__ or providing the component via a module, it is globally bound. Otherwise, it is bound to a controller if the decorator precedes a controller class, or to a route if the decorator precedes a route declaration.

#### 拦截器

拦截器基本上遵循守卫的模式，但是有一个例外：在拦截器返回 __LINK_16__ 时，观察符将在 first in last out 模式下解决。因此，入站请求将通过标准的全局、控制器、路由级别解决，但是响应侧的请求（即返回从控制器方法处理程序）将在路由到控制器到全局顺序下解决。同时，任何由管道、控制器或服务抛出的错误可以在拦截器的 __INLINE_CODE_7__ 操作符中读取。

#### 管道

管道遵循标准的全局到控制器到路由绑定顺序，但是在路由参数级别，如果有多个管道运行，它们将按顺序执行，从最后一个参数到第一个参数。例如，如果我们有以下控制器：

```bash
$ npm install --save-dev @suites/unit @suites/di.nestjs @suites/doubles.jest

```

那么 __INLINE_CODE_9__ 将在 __INLINE_CODE_10__ 之前执行， __INLINE_CODE_11__ 将在 __INLINE_CODE_9__ 和 __INLINE_CODE_10__ 之前执行，然后是 __INLINE_CODE_12__ 对象，最后是 __INLINE_CODE_13__ 对象。如果有参数特定的管道，它们将在控制器和路由级别管道执行后执行。

#### 筛选器

筛选器是唯一不按照全局顺序执行的组件。相反，筛选器从最低级别开始执行，这意味着执行从路由绑定的筛选器开始，然后是控制器级别和最后是全局筛选器。请注意，异常不能从筛选器到筛选器传递；如果路由级别筛选器捕捉异常，控制器或全局级别筛选器不能捕捉同一个异常。要实现类似的效果，可以使用筛选器继承。

> info **提示** 筛选器只有在请求处理过程中遇到未捕获异常时才会执行。捕捉的异常，例如使用 `Test.createTestingModule()`，将不会触发 Exception Filters。一旦遇到未捕获的异常，请求将直接跳到筛选器。

#### 总结

总的来说，请求生命周期如下所示：

1. incoming request
2. 中间件
   - 2.1. 全局绑定的中间件
   - 2.2. 模块绑定的中间件
3. 守卫
   - 3.1. 全局守卫
   - 3.2. 控制器守卫
   - 3.3. 路由守卫
4. 拦截器 (pre-controller)
   - 4.1. 全局拦截器
   - 4.2. 控制器拦截器
   - 4.3. 路由拦截器
5. 管道
   - 5.1. 全局管道
   - 5.2. 控制器管道
   - 5.3. 路由管道
   - 5.4. 路由参数管道
6. 控制器 (method handler)
7. 服务 (如果存在)
8. 拦截器 (post-request)
   - 8.1. 路由拦截器
   - 8.2. 控制器拦截器
   - 8.3. 全局拦截器
9. 异常筛选器
   - 9.1. 路由
   - 9.2. 控制器
   - 9.3. 全局
10. 服务器响应