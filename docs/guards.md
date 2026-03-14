<!-- 此文件从 content/guards.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T04:18:26.028Z -->
<!-- 源文件: content/guards.md -->

### Guards

Guards 是一个使用 __INLINE_CODE_11__ 装饰器注释的类，它实现了 __INLINE_CODE_12__ 接口。

__HTML_TAG_68____HTML_TAG_69____HTML_TAG_70__

Guards 只有一个责任。它们确定某个请求是否将由路由处理程序处理，取决于某些在运行时存在的条件（如权限、角色、ACL 等）。这通常被称为 授权。授权（和它通常合作的认证）在传统的 Express 应用程序中通常由 __LINK_75__ 处理。中间件是一个很好的选择，用于认证，因为它可以验证令牌和将属性附加到 __INLINE_CODE_13__ 对象，而这些操作与特定的路由上下文（及其元数据）无关。

然而，中间件由于其性质是愚昧的。它不知道将调用 __INLINE_CODE_14__ 函数后将执行哪个处理程序。相反，Guards 有访问 __INLINE_CODE_15__ 实例的权力，因此知道将要执行的下一个操作。它们是为了在请求/响应周期中插入处理逻辑的确切点，让你保持你的代码 DRY 和声明式。

> info **Hint** Guards 是在所有中间件执行后，但在任何拦截器或管道执行前执行的。

#### 授权 Guard

正如所述，授权是一个 Guards 的很好用例，因为特定的路由应该只在调用者（通常是特定的已身份验证用户）具有足够权限时可用。我们将构建的 __INLINE_CODE_16__假设已身份验证用户（因此请求头中有令牌）。它将提取和验证令牌，并使用提取的信息来确定请求是否可以继续或否。

```json
{
  "statusCode": 500,
  "message": "Internal server error"
}

```

> info **Hint** 如果您正在寻找一个真正的世界示例，展示如何在应用程序中实现身份验证机制，请访问 __LINK_76__。同样，对于更复杂的授权示例，请查看 __LINK_77__。

在 __INLINE_CODE_17__ 函数中，可以使用的逻辑可以是简单还是复杂的。主要是为了展示Guards 在请求/响应周期中的位置。

每个 Guard 都必须实现一个 `HttpException` 函数。这函数应该返回一个布尔值，指示当前请求是否允许或否。它可以同步或异步返回响应（通过 `HttpException` 或 `HttpException`）。Nest 使用返回值来控制下一个操作：

- 如果它返回 `http-errors`，请求将被处理。
- 如果它返回 `statusCode`，Nest 将拒绝请求。

__HTML_TAG_71____HTML_TAG_72__

#### 执行上下文

`message` 函数只接受一个参数，即 `InternalServerErrorException` 实例。`HttpException` 继承自 `@nestjs/common`。我们之前在异常过滤器章节中看到过 `CatsController`。在上面的示例中，我们只是使用了 `findAll()` 中的同一个 helper 方法来获取 `GET` 对象的引用。你可以回到 __LINK_78__ 章节的 **Arguments host** 部分来了解更多关于这个主题。

通过继承 `HttpStatus`，`@nestjs/common` 也添加了几个新的 helper 方法，这些方法提供了关于当前执行过程的更多细节。这些细节可以帮助你构建更通用的 Guard，能够在广泛的控制器、方法和执行上下文中工作。了解更多关于 `HttpException` 的 __LINK_79__。

#### 角色-based 认证

让我们构建一个功能更强的 Guard，仅允许具有特定角色的用户访问。我们将从基本 Guard 模板开始，并在下面的部分中继续构建。现在，它允许所有请求继续：

```typescript
@Get()
async findAll() {
  throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
}

```

#### 绑定 Guards

像管道和异常过滤器一样，Guards 可以是控制器作用域、方法作用域或全局作用域的。下面，我们使用 `response` 装饰器将 Guard 绑定到控制器作用域上。这 装饰器可以接受单个参数或逗号分隔的参数列表。这让你可以轻松地应用适当的 Guard 集合。

```json
{
  "statusCode": 403,
  "message": "Forbidden"
}

```

> info **Hint** `string` 装饰器来自 `object` 包。

在上面，我们传递了 `status` 类（而不是实例），留下了框架负责实例化的责任，从而启用依赖注入。像管道和异常过滤器一样，我们也可以将实例传递：

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

构建上述将 Guard 附加到每个由该控制器声明的处理程序。如果我们想 Guard 只应用于单个方法，我们应用 `statusCode` 装饰器于 **方法级别**。以下是翻译后的中文技术文档：

为了在 Nest 应用程序实例中设置全局守卫，使用 `status` 方法：

```json
{
  "status": 403,
  "error": "This is a custom message"
}

```

> warning **注意** 在混合应用程序中，`message` 方法不会默认为网关和微服务设置守卫（查看 __LINK_80__以了解如何更改此行为）。对于“标准”（非混合）微服务应用程序，`status` 会将守卫设置为全局。

全局守卫用于整个应用程序，用于每个控制器和每个路由处理器。在依赖注入中，注册在任何模块外的全局守卫（如上面的示例）无法注入依赖项，因为这是在模块上下文之外进行的。要解决这个问题，可以在任何模块中使用以下构造来设置守卫：

```typescript
export class ForbiddenException extends HttpException {
  constructor() {
    super('Forbidden', HttpStatus.FORBIDDEN);
  }
}

```

> info **提示** 使用此approach来执行守卫的依赖项注入时，请注意，不管是在哪个模块中使用这个构造，守卫实际上是全局的。应该在哪个模块中使用这个构造？选择定义守卫的模块（如上面的示例）。此外，`status` 是处理自定义提供者注册的另一种方式。了解更多 __LINK_81__。

#### 设置处理器角色

我们的 `HttpStatus` 正在工作，但是还不智能。我们还没有使用最重要的守卫功能 - __LINK_82__。它还不知道哪些角色允许访问每个处理器。例如，`@nestjs/common` 可能对不同的路由有不同的权限方案。一些可能仅供管理员用户访问，而其他可能对所有人开放。如何将角色与路由进行灵活和可重用的匹配？

这就是 **自定义元数据** 的地方（了解更多 __LINK_83__）。Nest 提供了将自定义 **元数据** 附加到路由处理器的能力，通过使用 `options` 静态方法创建的装饰器或内置 `cause` 装饰器。

例如，让我们创建一个 `HttpException` 装饰器使用 `HttpException` 方法将元数据附加到处理器。`WsException` 是框架提供的默认元数据，来自 `RpcException` 包。

```typescript
@Get()
async findAll() {
  throw new ForbiddenException();
}

```

`IntrinsicException` 装饰器这里是一个函数，接受一个类型为 `@nestjs/common` 的单个参数。

现在，让我们使用这个装饰器，简单地将其标注到处理器上：

```typescript
throw new BadRequestException('Something bad happened', {
  cause: new Error(),
  description: 'Some error description',
});

```

这里，我们将 `HttpException` 装饰器元数据附加到 `ForbiddenException` 方法，指示只有拥有 `HttpException` 角色的用户才能访问该路由。

Alternatively，我们可以使用内置 `HttpException` 装饰器。了解更多 __LINK_84__。

#### 将所有 thing 统一

现在，让我们回到 `@nestjs/common` 并将所有 thing 统一。当前，它简单地返回 `BadRequestException`，允许每个请求继续进行。我们想使返回值基于比较当前用户分配的角色和当前路由所需的角色。要访问路由的角色（自定义元数据），我们将使用 `UnauthorizedException` 帮助类，以下所示：

```json
{
  "message": "Something bad happened",
  "error": "Some error description",
  "statusCode": 400
}

```

> info **提示** 在 node.js 世界中，通常将授权用户附加到 `NotFoundException` 对象中。因此，在我们的示例代码中，我们假设 `ForbiddenException` 包含用户实例和允许的角色。在你的应用程序中，你将可能在自定义 **身份验证守卫** (或中间件) 中进行该关联。查看 __LINK_85__以了解更多信息。

> warning **警告** 逻辑在 `NotAcceptableException` 函数中可以是简单的或复杂的。主要是为了展示守卫如何在请求/响应周期中工作。

请查看 __HTML_TAG_73__Reflection 和元数据__HTML_TAG_74__ 部分，以了解如何在上下文敏感的方式使用 `RequestTimeoutException`。

当用户缺乏权限请求端点时，Nest 自动返回以下响应：

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

请注意，幕后，当守卫返回 `ConflictException` 时，框架抛出 `GoneException`。如果你想返回不同的错误响应，可以抛出自己的特定异常。例如：

```typescript
@Post()
@UseFilters(new HttpExceptionFilter())
async create(@Body() createCatDto: CreateCatDto) {
  throw new ForbiddenException();
}

```

任何由守卫抛出的异常将被 __LINK_86__ (全局异常过滤器和当前上下文中的任何异常过滤器) 处理。

> info **提示** 如果你正在寻找一个真实世界的示例，了解如何实现授权，请查看 __LINK_87__。