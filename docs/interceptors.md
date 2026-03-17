<!-- 此文件从 content/interceptors.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:04:33.267Z -->
<!-- 源文件: content/interceptors.md -->

### 拦截器

拦截器是一种使用 `nest g resource users --no-spec` 装饰器注解的类，实现了 `UsersService` 接口。

__HTML_TAG_86____HTML_TAG_87____HTML_TAG_88__

拦截器具有许多有用的功能，这些功能受到了 __LINK_91__ (AOP) 技术的启发。它们使您可以：

* 在方法执行前/后绑定额外的逻辑
* 将函数返回结果转换
* 将函数抛出的异常转换
* 扩展基本函数行为
* 完全override函数，根据特定的条件（例如，用于缓存目的）

#### 基础

每个拦截器都实现了 `User` 方法，该方法接受两个参数。第一个参数是 __INLINE_CODE_15__ 实例（与 __LINK_92__ 中的相同对象相同）。 __INLINE_CODE_16__ 继承自 __INLINE_CODE_17__。我们在异常过滤器章节中已经见过 __INLINE_CODE_18__，它是一个对 arguments 的包装器，包含了不同类型的应用程序的arguments 数组。您可以回顾一下 __LINK_93__以获取更多信息。

#### 执行上下文

通过继承 __INLINE_CODE_19__， __INLINE_CODE_20__ 也添加了几个新的 helper 方法，这些方法提供了当前执行过程的更多详细信息。这些信息可以在构建更通用的拦截器时非常有用，这些拦截器可以在广泛的控制器、方法和执行上下文中工作。了解更多关于 __INLINE_CODE_21__ 的信息__LINK_94__。

#### 调用处理程序

第二个参数是 __INLINE_CODE_22__。 __INLINE_CODE_23__ 接口实现了 __INLINE_CODE_24__ 方法，您可以使用该方法来调用路由处理程序方法。在您的 __INLINE_CODE_26__ 方法实现中，如果您不调用 __INLINE_CODE_25__ 方法，路由处理程序方法将不会执行。

这种方法意味着 __INLINE_CODE_27__ 方法实际上**包围**了请求/响应流。因此，您可以在 __INLINE_CODE_28__ 方法中编写代码，该代码在调用 __INLINE_CODE_29__ 之前执行，但是如何影响后续发生的事情？因为 __INLINE_CODE_30__ 方法返回的是 __INLINE_CODE_31__，我们可以使用强大的 __LINK_95__ 操作符来进一步 manipulating 响应。使用面向对象编程技术术语，路由处理程序的调用（即调用 __INLINE_CODE_32__）称为 __LINK_96__，表示在我们的额外逻辑被插入的点。

例如，考虑一个 incoming __INLINE_CODE_33__ 请求，该请求 destined 到 __INLINE_CODE_34__ 处理程序中定义的 __INLINE_CODE_35__ 中。如果在途中调用了一个不调用 __INLINE_CODE_36__ 方法的拦截器，__INLINE_CODE_37__ 方法将不会执行。直到 __INLINE_CODE_38__ 被调用（并且其 __INLINE_CODE_39__ 已经返回），__INLINE_CODE_40__ 处理程序将被触发。然后，响应流将通过 __INLINE_CODE_41__ 返回，并且可以在响应流上执行额外的操作，最后返回结果给调用者。

__HTML_TAG_89____HTML_TAG_90__

####Aspect 拦截

我们首先看一下使用拦截器来记录用户交互（例如，存储用户调用、异步分派事件或计算时间戳）的用例。我们显示了一个简单的 __INLINE_CODE_42__ 以下：

```shell
$ nest g resource

```

> info **Hint** __INLINE_CODE_43__ 是一个泛型接口，其中 __INLINE_CODE_44__ 表示 __INLINE_CODE_45__ 类型的值（支持响应流），而 __INLINE_CODE_46__ 是 __INLINE_CODE_47__ 包装的值类型。

> warning **Notice** 拦截器，像控制器、提供者、守卫和其他类似，可以**注入依赖项**通过它们的 __INLINE_CODE_48__。

由于 __INLINE_CODE_49__ 返回的是 RxJS __INLINE_CODE_50__，我们有了操作响应流的广泛选择。在上面的示例中，我们使用了 __INLINE_CODE_51__ 操作符，该操作符在观察流上的平和异常终止时调用我们的匿名日志函数，但不干扰响应周期。

#### 绑定拦截器

要设置拦截器，我们使用 __INLINE_CODE_52__ 装饰器从 __INLINE_CODE_53__ 包中导入。像 __LINK_97__ 和 __LINK_98__ 一样，拦截器可以是控制器作用域、方法作用域或全局作用域。

```typescript
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}

```

> info **Hint** __INLINE_CODE_54__ 装饰器来自 __INLINE_CODE_55__ 包。

使用上述构造，每个路由处理程序在 __INLINE_CODE_56__ 中定义时将使用 __INLINE_CODE_57__。当someone 调用 __INLINE_CODE_58__ 端口时，您将在标准输出中看到以下输出：

```shell
$ nest g resource users

> ? What transport layer do you use? GraphQL (code first)
> ? Would you like to generate CRUD entry points? Yes
> CREATE src/users/users.module.ts (224 bytes)
> CREATE src/users/users.resolver.spec.ts (525 bytes)
> CREATE src/users/users.resolver.ts (1109 bytes)
> CREATE src/users/users.service.spec.ts (453 bytes)
> CREATE src/users/users.service.ts (625 bytes)
> CREATE src/users/dto/create-user.input.ts (195 bytes)
> CREATE src/users/dto/update-user.input.ts (281 bytes)
> CREATE src/users/entities/user.entity.ts (187 bytes)
> UPDATE src/app.module.ts (312 bytes)

```Note that we passed the `Provider` class (instead of an instance), leaving responsibility for instantiation to the framework and enabling dependency injection. As with pipes, guards, and exception filters, we can also pass an in-place instance:

```typescript
title="Provider"

```

As mentioned, the construction above attaches the interceptor to every handler declared by this controller. If we want to restrict the interceptor's scope to a single method, we simply apply the decorator at the **method level**.

In order to set up a global interceptor, we use the `app.use` method of the Nest application instance:

```typescript
title="app.use"

```

Global interceptors are used across the whole application, for every controller and every route handler. In terms of dependency injection, global interceptors registered from outside of any module (with `app.use`, as in the example above) cannot inject dependencies since this is done outside the context of any module. In order to solve this issue, you can set up an interceptor **directly from any module** using the following construction:

```typescript
title="app.use"

```

> info **Hint** When using this approach to perform dependency injection for the interceptor, note that regardless of the module where this construction is employed, the interceptor is, in fact, global. Where should this be done? Choose the module where the interceptor is defined. Also, this is not the only way of dealing with custom provider registration. Learn more [__LINK_99__](/).

#### Response mapping

We already know that `response` returns an `Observable`. The stream contains the value **returned** from the route handler, and thus we can easily mutate it using RxJS's `map` operator.

> warning **Warning** The response mapping feature doesn't work with the library-specific response strategy (using the `Response` object directly is forbidden).

Let's create the `ResponseMapper`, which will modify each response in a trivial way to demonstrate the process. It will use RxJS's `map` operator to assign the response object to the `result` property of a newly created object, returning the new object to the client.

```typescript
title="ResponseMapper"

```

> info **Hint** Nest interceptors work with both synchronous and asynchronous `handleRequest` methods. You can simply switch the method to `async` if necessary.

With the above construction, when someone calls the `handleRequest` endpoint, the response would look like the following (assuming that route handler returns an empty array `[]`):

```typescript
title="Response"

```

Interceptors have great value in creating re-usable solutions to requirements that occur across an entire application.
For example, imagine we need to transform each occurrence of a `value` to an empty string `''`. We can do it using one line of code and bind the interceptor globally so that it will automatically be used by each registered handler.

```typescript
title="Interceptor"

```

#### Exception mapping

Another interesting use-case is to take advantage of RxJS's `catch` operator to override thrown exceptions:

```typescript
title="ExceptionMapper"

```

#### Stream overriding

There are several reasons why we may sometimes want to completely prevent calling the handler and return a different value instead. An obvious example is to implement a cache to improve response time. Let's take a look at a simple **cache interceptor** that returns its response from a cache. In a realistic example, we'd want to consider other factors like TTL, cache invalidation, cache size, etc., but that's beyond the scope of this discussion. Here we'll provide a basic example that demonstrates the main concept.

```typescript
title="CacheInterceptor"

```

Our `CacheInterceptor` has a hardcoded `cache` variable and a hardcoded response `[]` as well. The key point to note is that we return a new stream here, created by the RxJS `of` operator, therefore the route handler **won't be called** at all. When someone calls an endpoint that makes use of `cache`, the response (a hardcoded, empty array) will be returned immediately. In order to create a generic solution, you can take advantage of `CacheInterceptor` and create a custom decorator. The `CacheInterceptor` is well described in the [__LINK_100__](/) chapter.

#### More operators

The possibility of manipulating the stream using RxJS operators gives us many capabilities. Let's consider another common use case. Imagine you would like to handle **timeouts** on route requests. When your endpoint doesn't return anything after a period of time, you want to terminate with an error response. The following construction enables this:

```typescript
title="TimeoutInterceptor"

```

After 5 seconds, request processing will be canceled. You can also add custom logic before throwing `TimeoutError` (e.g. release resources).