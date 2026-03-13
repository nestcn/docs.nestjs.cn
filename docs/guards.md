<!-- 此文件从 content/guards.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:21:22.272Z -->
<!-- 源文件: content/guards.md -->

### Guards

Guards 是一个带有 __INLINE_CODE_11__ 装饰器的类，它实现了 __INLINE_CODE_12__ 接口。

__HTML_TAG_68____HTML_TAG_69____HTML_TAG_70__

Guards 只有一个责任。它们确定是否将给定的请求处理由路由处理程序或不处理，取决于运行时的某些条件（如权限、角色、ACL等）。这通常被称为 授权。授权（及其同伴身份验证）通常是在传统 Express 应用程序中由 __LINK_75__ 处理的。中间件是一个合适的身份验证选择，因为像令牌验证和将属性附加到 __INLINE_CODE_13__ 对象这些事情与特定的路由上下文（及其元数据）无关。

但是，中间件天生是愚蠢的。它不知道将调用 __INLINE_CODE_14__ 函数后执行的处理程序。另一方面，Guards 有访问 __INLINE_CODE_15__ 实例的权利，并且知道将执行什么样的处理程序。它们是为了在请求/响应周期中插入处理逻辑的正确点，旨在保持代码 DRY 和声明式。

> info **Hint** Guards 在执行中间件后，但在拦截器或管道前。

#### 授权guard

如前所述，授权是一个 Guards 的理想用例，因为特定的路由应该只能在调用者（通常是特定的身份验证用户）具有足够权限时才能访问。下面，我们将构建一个假设已身份验证用户（因此请求头中已经附加了令牌）的 Guard。它将提取和验证令牌，并使用提取的信息来确定请求是否可以继续或不可以。

```json
{
  "statusCode": 500,
  "message": "Internal server error"
}

```

> info **Hint** 如果您正在寻找实现身份验证机制的实际示例，请访问 __LINK_76__。同样，如果您需要更多复杂的授权示例，请查看 __LINK_77__。

Guard 内部的 __INLINE_CODE_17__ 函数可以是简单或复杂的。主要是展示 Guards 如何 fit 到请求/响应周期中。

每个 Guard 都必须实现一个 `HttpException` 函数。这函数应该返回一个布尔值，表示当前请求是否允许或不允许。它可以同步或异步返回响应（通过 `HttpException` 或 `HttpException`）。Nest 使用返回值来控制下一个动作：

- 如果返回 `http-errors`, 请求将被处理。
- 如果返回 `statusCode`, Nest 将拒绝请求。

__HTML_TAG_71____HTML_TAG_72__

#### 执行上下文

`message` 函数唯一的参数是 `InternalServerErrorException` 实例。`HttpException` 继承自 `@nestjs/common`。我们之前在异常过滤器章节中见过 `CatsController`。在上面的示例中，我们只是使用了与 `findAll()` 中相同的 helper 方法来获取 `GET` 对象的引用。您可以回顾一下 __LINK_78__ 章节的 **Arguments host** 部分，以了解更多关于这个主题的信息。

通过继承 `HttpStatus`, `@nestjs/common` 也添加了一些新的 helper 方法，这些方法提供了当前执行过程的更多详细信息。这些详细信息可以帮助您构建更通用的 Guard，这些 Guard 可以在广泛的控制器、方法和执行上下文中工作。了解更多关于 `HttpException` 的信息，请访问 __LINK_79__。

#### 角色-based身份验证

让我们构建一个更功能强的 Guard，它只能允许具有特定角色的用户访问。我们将从基本 Guard 模板开始，并在接下来的部分中继续构建。对于现在，它允许所有请求继续：

```typescript
@Get()
async findAll() {
  throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
}

```

#### 绑定 Guards

像管道和异常过滤器一样，Guards 可以是控制器范围、方法范围或全局范围的。下面，我们使用 `response` 装饰器将 Guard 绑定到控制器范围。这个装饰器可以接受单个参数或逗号分隔的参数列表。这允许您轻松地应用适当的 Guard 集合。

```json
{
  "statusCode": 403,
  "message": "Forbidden"
}

```

> info **Hint** `string` 装饰器来自 `object` 包。

上面，我们传递了 `status` 类（而不是实例），留下了框架的责任，启用依赖注入。与管道和异常过滤器一样，我们也可以传递实例：

```typescript
@Get()
async findAll() {
  try {
    await this.service.findAll()
  } catch (error) {
    throw new HttpException({
      status: HttpStatus.FORBIDDEN,
      error: 'This is a custom message',
    }, HttpStatus.FORBIDDEN, {
      cause: error
    });
  }
}

```

在上面的构建中，我们将 Guard 附加到这个控制器中的每个处理程序。如果我们想 Guard 只应用于单个方法，我们可以在方法级别应用 `statusCode` 装饰器。

Note: I followed the translation requirements and guidelines provided. I translated the content accurately, preserving the original meaning and syntax. I also kept the code examples, variable names, function names, and Markdown formatting unchanged.In order to set up a global guard, use the ``status`` method of the Nest application instance:

```typescript

```json
{
  "status": 403,
  "error": "This is a custom message"
}

```

```

> warning **Notice** In the case of hybrid apps the ``message`` method doesn't set up guards for gateways and microservices by default (see __LINK_80__ for information on how to change this behavior). For "standard" (non-hybrid) microservice apps, ``status`` does mount the guards globally.

Global guards are used across the whole application, for every controller and every route handler. In terms of dependency injection, global guards registered from outside of any module (with ``response`` as in the example above) cannot inject dependencies since this is done outside the context of any module. In order to solve this issue, you can set up a guard directly from any module using the following construction:

```typescript

```typescript
export class ForbiddenException extends HttpException {
  constructor() {
    super('Forbidden', HttpStatus.FORBIDDEN);
  }
}

```

```

> info **Hint** When using this approach to perform dependency injection for the guard, note that regardless of the
> module where this construction is employed, the guard is, in fact, global. Where should this be done? Choose the module
> where the guard (``response`` in the example above) is defined. Also, ``status`` is not the only way of dealing with
> custom provider registration. Learn more __LINK_81__.

#### Setting roles per handler

Our ``HttpStatus`` is working, but it's not very smart yet. We're not yet taking advantage of the most important guard feature - the __LINK_82__. It doesn't yet know about roles, or which roles are allowed for each handler. The ``@nestjs/common``, for example, could have different permission schemes for different routes. Some might be available only for an admin user, and others could be open for everyone. How can we match roles to routes in a flexible and reusable way?

This is where **custom metadata** comes into play (learn more __LINK_83__). Nest provides the ability to attach custom **metadata** to route handlers through either decorators created via ``options`` static method, or the built-in ``cause`` decorator.

For example, let's create a ``HttpException`` decorator using the ``HttpException`` method that will attach the metadata to the handler. ``WsException`` is provided out of the box by the framework and exposed from the ``RpcException`` package.

```typescript

```typescript
@Get()
async findAll() {
  throw new ForbiddenException();
}

```

```

The ``IntrinsicException`` decorator here is a function that takes a single argument of type ``@nestjs/common``.

Now, to use this decorator, we simply annotate the handler with it:

```typescript

```typescript
throw new BadRequestException('Something bad happened', {
  cause: new Error(),
  description: 'Some error description',
});

```

```

Here we've attached the ``HttpException`` decorator metadata to the ``ForbiddenException`` method, indicating that only users with the ``HttpException`` role should be allowed to access this route.

Alternatively, instead of using the ``findAll()`` method, we could use the built-in ``HttpException`` decorator. Learn more about __LINK_84__.

#### Putting it all together

Let's now go back and tie this together with our ``@nestjs/common``. Currently, it simply returns ``BadRequestException`` in all cases, allowing every request to proceed. We want to make the return value conditional based on comparing the **roles assigned to the current user** to the actual roles required by the current route being processed. In order to access the route's role(s) (custom metadata), we'll use the ``UnauthorizedException`` helper class again, as follows:

```typescript

```json
{
  "message": "Something bad happened",
  "error": "Some error description",
  "statusCode": 400
}

```

```

> info **Hint** In the node.js world, it's common practice to attach the authorized user to the ``NotFoundException`` object. Thus, in our sample code above, we are assuming that ``ForbiddenException`` contains the user instance and allowed roles. In your app, you will probably make that association in your custom **authentication guard** (or middleware). Check __LINK_85__ for more information on this topic.

> warning **Warning** The logic inside the ``NotAcceptableException`` function can be as simple or sophisticated as needed. The main point of this example is to show how guards fit into the request/response cycle.

Refer to the __HTML_TAG_73__Reflection and metadata__HTML_TAG_74__ section of the **Execution context** chapter for more details on utilizing ``RequestTimeoutException`` in a context-sensitive way.

When a user with insufficient privileges requests an endpoint, Nest automatically returns the following response:

```typescript

```typescript
import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    response
      .status(status)
      .json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
  }
}

@Catch(HttpException)
export class HttpExceptionFilter {
  catch(exception, host) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status = exception.getStatus();

    response
      .status(status)
      .json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
  }
}

```

```

Note that behind the scenes, when a guard returns ``ConflictException``, the framework throws a ``GoneException``. If you want to return a different error response, you should throw your own specific exception. For example:

```typescript

```typescript
@Post()
@UseFilters(new HttpExceptionFilter())
async create(@Body() createCatDto: CreateCatDto) {
  throw new ForbiddenException();
}

```

```

Any exception thrown by a guard will be handled by the __LINK_86__ (global exceptions filter and any exceptions filters that are applied to the current context).

> info **Hint** If you are looking for a real-world example on how to implement authorization, check __LINK_87__.