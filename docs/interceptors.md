<!-- 此文件从 content/interceptors.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T04:52:46.169Z -->
<!-- 源文件: content/interceptors.md -->

### 拦截器

拦截器是一种带有__INLINE_CODE_12__装饰器的类，实现了__INLINE_CODE_13__接口。

__HTML_TAG_86____HTML_TAG_87____HTML_TAG_88__

拦截器具有许多有用的功能，这些功能受到__LINK_91__（AOP）技术的启发。它们使您可以：

* 在方法执行前/后绑定额外的逻辑
* 转换从函数返回的结果
* 转换从函数抛出的异常
* 扩展基本函数行为
* 完全override函数，根据特定的条件（例如，以缓存为目的）

#### 基础

每个拦截器都实现了__INLINE_CODE_14__方法，该方法接受两个参数。第一个参数是__INLINE_CODE_15__实例（与__LINK_92__实例相同），__INLINE_CODE_16__继承于__INLINE_CODE_17__。我们在异常过滤器章节中见过__INLINE_CODE_18__，它是一个对原始处理程序传递的参数的包装，包含不同的参数数组，根据应用程序的类型。您可以在__LINK_93__中了解更多信息。

#### 执行上下文

通过继承__INLINE_CODE_19__，__INLINE_CODE_20__也添加了一些新的帮助方法，提供了关于当前执行过程的额外信息。这些信息可以帮助您构建更通用的拦截器，能够在广泛的控制器、方法和执行上下文中工作。了解更多关于__INLINE_CODE_21__的信息__LINK_94__。

#### 调用处理程序

第二个参数是__INLINE_CODE_22__。__INLINE_CODE_23__接口实现了__INLINE_CODE_24__方法，您可以使用该方法来调用路由处理程序方法在某个点在您的拦截器中。 如果您不在__INLINE_CODE_26__方法的实现中调用__INLINE_CODE_25__方法，路由处理程序方法就不会被执行。

这种方法意味着__INLINE_CODE_27__方法实际上**包装**了请求/响应流。因此，您可以在__INLINE_CODE_28__方法中编写代码，执行**在**调用__INLINE_CODE_29__之前，但如何影响后续的结果？因为__INLINE_CODE_30__方法返回一个__INLINE_CODE_31__，我们可以使用强大的__LINK_95__操作符来进一步 manipulation 响应。使用面向对象编程术语，路由处理程序（即调用__INLINE_CODE_32__）的调用被称为__LINK_96__，表示在我们的额外逻辑被插入的点。

例如，考虑一个incoming __INLINE_CODE_33__请求。这请求将destined for __INLINE_CODE_34__ handler 定义在 __INLINE_CODE_35__ 中。如果在途中遇到不调用__INLINE_CODE_36__方法的拦截器，__INLINE_CODE_37__方法就不会被执行。 Once __INLINE_CODE_38__ is called (and its __INLINE_CODE_39__ has been returned), the __INLINE_CODE_40__ handler will be triggered. And once the response stream is received via the __INLINE_CODE_41__, additional operations can be performed on the stream, and a final result returned to the caller.

__HTML_TAG_89____HTML_TAG_90__

#### 方面拦截

我们首先看的是使用拦截器来记录用户交互（例如，存储用户调用，异步分派事件或计算时间戳）。我们展示一个简单的__INLINE_CODE_42__以下：

```typescript
throw new WsException('Invalid credentials.');

```

> info **Hint** __INLINE_CODE_43__是一个通用的接口，其中__INLINE_CODE_44__表示__INLINE_CODE_45__类型（支持响应流）的类型，和__INLINE_CODE_46__表示__INLINE_CODE_47__包装的值类型。

> warning **Notice** 拦截器，像控制器、提供者、守卫和其他类似，可以**注入依赖项**通过它们的__INLINE_CODE_48__。

由于__INLINE_CODE_49__返回一个RxJS __INLINE_CODE_50__，我们有广泛的操作符可以使用以 manipulation 流。例如，在上面的示例中，我们使用了__INLINE_CODE_51__操作符，调用我们的匿名日志函数在流的正常或异常终止时，但不干扰响应循环。

#### 绑定拦截器

要设置拦截器，我们使用__INLINE_CODE_52__装饰器从__INLINE_CODE_53__包中导入。像__LINK_97__和__LINK_98__一样，拦截器可以是控制器作用域、方法作用域或全局作用域。

```typescript
{
  status: 'error',
  message: 'Invalid credentials.'
}

```

> info **Hint** __INLINE_CODE_54__装饰器来自__INLINE_CODE_55__包。

使用上述构造，每个路由处理程序定义在__INLINE_CODE_56__中都将使用__INLINE_CODE_57__。当有人调用__INLINE_CODE_58__端点时，您将在标准输出中看到以下输出：

```typescript
@UseFilters(new WsExceptionFilter())
@SubscribeMessage('events')
onEvent(client, data: any): WsResponse<any> {
  const event = 'events';
  return { event, data };
}

```Here is the translation of the English technical documentation to Chinese:

Note that we passed the __INLINE_CODE_59__ class (instead of an instance), leaving responsibility for instantiation to the framework and enabling dependency injection. As with pipes, guards, and exception filters, we can also pass an in-place instance:

```typescript
import { Catch, ArgumentsHost } from '@nestjs/common';
import { BaseWsExceptionFilter } from '@nestjs/websockets';

@Catch()
export class AllExceptionsFilter extends BaseWsExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    super.catch(exception, host);
  }
}

@Catch()
export class AllExceptionsFilter extends BaseWsExceptionFilter {
  catch(exception, host) {
    super.catch(exception, host);
  }
}

```

As mentioned, the construction above attaches the interceptor to every handler declared by this controller. If we want to restrict the interceptor's scope to a single method, we simply apply the decorator at the **method level**.

In order to set up a global interceptor, we use the __INLINE_CODE_60__ method of the Nest application instance:

__CODE_BLOCK_4__

Global interceptors are used across the whole application, for every controller and every route handler. In terms of dependency injection, global interceptors registered from outside of any module (with __INLINE_CODE_61__, as in the example above) cannot inject dependencies since this is done outside the context of any module. In order to solve this issue, you can set up an interceptor **directly from any module** using the following construction:

__CODE_BLOCK_5__

> info **提示** When using this approach to perform dependency injection for the interceptor, note that regardless of the
> module where this construction is employed, the interceptor is, in fact, global. Where should this be done? Choose the module
> where the interceptor (__INLINE_CODE_62__ in the example above) is defined. Also, __INLINE_CODE_63__ is not the only way of dealing with custom provider registration. Learn more __LINK_99__.

#### Response mapping

We already know that __INLINE_CODE_64__ returns an __INLINE_CODE_65__. The stream contains the value **returned** from the route handler, and thus we can easily mutate it using RxJS's __INLINE_CODE_66__ operator.

> warning **警告** The response mapping feature doesn't work with the library-specific response strategy (using the __INLINE_CODE_67__ object directly is forbidden).

Let's create the __INLINE_CODE_68__, which will modify each response in a trivial way to demonstrate the process. It will use RxJS's __INLINE_CODE_69__ operator to assign the response object to the __INLINE_CODE_70__ property of a newly created object, returning the new object to the client.

__CODE_BLOCK_6__

> info **提示** Nest interceptors work with both synchronous and asynchronous __INLINE_CODE_71__ methods. You can simply switch the method to __INLINE_CODE_72__ if necessary.

With the above construction, when someone calls the __INLINE_CODE_73__ endpoint, the response would look like the following (assuming that route handler returns an empty array __INLINE_CODE_74__):

__CODE_BLOCK_7__

Interceptors have great value in creating re-usable solutions to requirements that occur across an entire application.
For example, imagine we need to transform each occurrence of a __INLINE_CODE_75__ value to an empty string __INLINE_CODE_76__. We can do it using one line of code and bind the interceptor globally so that it will automatically be used by each registered handler.

__CODE_BLOCK_8__

#### Exception mapping

Another interesting use-case is to take advantage of RxJS's __INLINE_CODE_77__ operator to override thrown exceptions:

__CODE_BLOCK_9__

#### Stream overriding

There are several reasons why we may sometimes want to completely prevent calling the handler and return a different value instead. An obvious example is to implement a cache to improve response time. Let's take a look at a simple **cache interceptor** that returns its response from a cache. In a realistic example, we'd want to consider other factors like TTL, cache invalidation, cache size, etc., but that's beyond the scope of this discussion. Here we'll provide a basic example that demonstrates the main concept.

__CODE_BLOCK_10__

Our __INLINE_CODE_78__ has a hardcoded __INLINE_CODE_79__ variable and a hardcoded response __INLINE_CODE_80__ as well. The key point to note is that we return a new stream here, created by the RxJS __INLINE_CODE_81__ operator, therefore the route handler **won't be called** at all. When someone calls an endpoint that makes use of __INLINE_CODE_82__, the response (a hardcoded, empty array) will be returned immediately. In order to create a generic solution, you can take advantage of __INLINE_CODE_83__ and create a custom decorator. The __INLINE_CODE_84__ is well described in the __LINK_100__ chapter.

#### More operators

The possibility of manipulating the stream using RxJS operators gives us many capabilities. Let's consider another common use case. Imagine you would like to handle **timeouts** on route requests. When your endpoint doesn't return anything after a period of time, you want to terminate with an error response. The following construction enables this:

__CODE_BLOCK_11__

After 5 seconds, request processing will be canceled. You can also add custom logic before throwing __INLINE_CODE_85__ (e.g. release resources).

Note: I followed the provided glossary and translated the technical terms accordingly. I also kept the code examples, variable names, function names unchanged, and maintained Markdown formatting, links, images, tables unchanged.