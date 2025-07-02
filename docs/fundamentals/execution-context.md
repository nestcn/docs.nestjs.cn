### 执行上下文

Nest 提供了多个实用工具类，帮助开发者轻松编写能在多种应用上下文（如基于 Nest HTTP 服务器的应用、微服务及 WebSockets 应用上下文）中运行的应用程序。这些工具类提供了当前执行上下文的信息，可用于构建通用的[守卫](/guards) 、 [过滤器](/exception-filters)和[拦截器](/interceptors) ，使其能够跨多种控制器、方法和执行上下文工作。

本章我们将介绍两个这样的类：`ArgumentsHost` 和 `ExecutionContext`。

#### ArgumentsHost 类

`ArgumentsHost` 类提供了检索传递给处理程序参数的方法。它允许选择合适的上下文（如 HTTP、RPC（微服务）或 WebSockets）来获取参数。框架会在需要访问参数的地方提供 `ArgumentsHost` 的实例，通常以 `host` 参数的形式引用。例如， [异常过滤器](../overview/exception-filters#arguments-host)的 `catch()` 方法在被调用时会传入一个 `ArgumentsHost` 实例。

`ArgumentsHost` 本质上是对处理器参数的一层抽象封装。例如，在 HTTP 服务器应用中（使用 `@nestjs/platform-express` 时），`host` 对象封装了 Express 的 `[request, response, next]` 数组，其中 `request` 是请求对象，`response` 是响应对象，`next` 是控制应用请求-响应周期的函数。而对于 [GraphQL](/graphql/quick-start) 应用，`host` 对象则包含 `[root, args, context, info]` 数组。

#### 当前应用上下文

当构建需要在多个应用上下文中运行的通用[守卫](/guards) 、 [过滤器](/exception-filters)和[拦截器](/interceptors)时，我们需要确定当前方法运行所在的应用类型。可通过 `ArgumentsHost` 的 `getType()` 方法实现：

```typescript
if (host.getType() === 'http') {
  // do something that is only important in the context of regular HTTP requests (REST)
} else if (host.getType() === 'rpc') {
  // do something that is only important in the context of Microservice requests
} else if (host.getType<GqlContextType>() === 'graphql') {
  // do something that is only important in the context of GraphQL requests
}
```

> **提示** `GqlContextType` 需从 `@nestjs/graphql` 包导入。

有了应用类型后，我们可以编写更通用的组件，如下所示。

#### 主机处理程序参数

要获取传递给处理程序的参数数组，一种方法是使用主机对象的 `getArgs()` 方法。

```typescript
const [req, res, next] = host.getArgs();
```

可以通过索引使用 `getArgByIndex()` 方法提取特定参数：

```typescript
const request = host.getArgByIndex(0);
const response = host.getArgByIndex(1);
```

在这些示例中，我们通过索引获取请求和响应对象，这种方式通常不推荐使用，因为它将应用程序与特定的执行上下文耦合在一起。相反，您可以通过使用 `host` 对象的实用方法之一来切换到适合您应用程序的上下文，从而使代码更加健壮和可重用。上下文切换的实用方法如下所示：

```typescript
/**
 * Switch context to RPC.
 */
switchToRpc(): RpcArgumentsHost;
/**
 * Switch context to HTTP.
 */
switchToHttp(): HttpArgumentsHost;
/**
 * Switch context to WebSockets.
 */
switchToWs(): WsArgumentsHost;
```

让我们使用 `switchToHttp()` 方法重写前面的示例。`host.switchToHttp()` 辅助调用会返回一个适用于 HTTP 应用程序上下文的 `HttpArgumentsHost` 对象。该对象有两个实用方法可用于提取所需对象。在此示例中，我们还使用了 Express 类型断言来返回原生 Express 类型的对象：

```typescript
const ctx = host.switchToHttp();
const request = ctx.getRequest<Request>();
const response = ctx.getResponse<Response>();
```

类似地，`WsArgumentsHost` 和 `RpcArgumentsHost` 也提供了在微服务和 WebSocket 上下文中返回相应对象的方法。以下是 `WsArgumentsHost` 的方法：

```typescript
export interface WsArgumentsHost {
  /**
   * Returns the data object.
   */
  getData<T>(): T;
  /**
   * Returns the client object.
   */
  getClient<T>(): T;
}
```

以下是 `RpcArgumentsHost` 的方法：

```typescript
export interface RpcArgumentsHost {
  /**
   * Returns the data object.
   */
  getData<T>(): T;

  /**
   * Returns the context object.
   */
  getContext<T>(): T;
}
```

#### ExecutionContext 类

`ExecutionContext` 继承自 `ArgumentsHost`，提供了关于当前执行过程的额外细节。与 `ArgumentsHost` 类似，Nest 会在你可能需要的地方提供 `ExecutionContext` 实例，例如在 [守卫](../overview/guards#execution-context) 的 `canActivate()` 方法和 [拦截器](../overview/interceptors#execution-context) 的 `intercept()` 方法中。它提供了以下方法：

```typescript
export interface ExecutionContext extends ArgumentsHost {
  /**
   * Returns the type of the controller class which the current handler belongs to.
   */
  getClass<T>(): Type<T>;
  /**
   * Returns a reference to the handler (method) that will be invoked next in the
   * request pipeline.
   */
  getHandler(): Function;
}
```

`getHandler()` 方法返回即将被调用的处理函数的引用。`getClass()` 方法返回该特定处理函数所属的 `Controller` 类类型。例如，在 HTTP 上下文中，如果当前处理的请求是绑定到 `CatsController` 上 `create()` 方法的 `POST` 请求，`getHandler()` 将返回 `create()` 方法的引用，而 `getClass()` 将返回 `CatsController` **类** （而非实例）。

```typescript
const methodKey = ctx.getHandler().name; // "create"
const className = ctx.getClass().name; // "CatsController"
```

能够访问当前类和处理器方法的引用提供了极大的灵活性。最重要的是，它使我们有机会在守卫或拦截器内部访问通过 `Reflector#createDecorator` 创建的装饰器或内置 `@SetMetadata()` 装饰器设置的元数据。我们将在下文介绍这个用例。

<app-banner-enterprise></app-banner-enterprise>

#### 反射与元数据

Nest 提供了通过 `Reflector#createDecorator` 方法创建的装饰器以及内置 `@SetMetadata()` 装饰器将**自定义元数据**附加到路由处理程序的能力。在本节中，我们将比较这两种方法，并了解如何从守卫或拦截器内部访问元数据。

要使用 `Reflector#createDecorator` 创建强类型装饰器，我们需要指定类型参数。例如，让我们创建一个接受字符串数组作为参数的 `Roles` 装饰器。

```ts title="roles.decorator"
import { Reflector } from '@nestjs/core';

export const Roles = Reflector.createDecorator<string[]>();
```

这里的 `Roles` 装饰器是一个接收 `string[]` 类型单一参数的函数。

现在要使用这个装饰器，我们只需用它来注解处理器：

```typescript title="cats.controller"
@Post()
@Roles(['admin'])
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}
```

这里我们将 `Roles` 装饰器元数据附加到 `create()` 方法上，表明只有具有 `admin` 角色的用户才被允许访问此路由。

为了访问路由的角色（自定义元数据），我们将再次使用 `Reflector` 辅助类。`Reflector` 可以通过常规方式注入到类中：

```typescript title="roles.guard"
@Injectable()
export class RolesGuard {
  constructor(private reflector: Reflector) {}
}
```

> info **提示** `Reflector` 类是从 `@nestjs/core` 包导入的。

现在，要读取处理程序的元数据，请使用 `get()` 方法：

```typescript
const roles = this.reflector.get(Roles, context.getHandler());
```

`Reflector#get` 方法允许我们通过传入两个参数轻松访问元数据：一个装饰器引用和一个用于检索元数据的**上下文** （装饰器目标）。在本例中，指定的**装饰器**是 `Roles`（请参考上面的 `roles.decorator.ts` 文件）。上下文由 `context.getHandler()` 调用提供，这会提取当前处理的路由处理程序的元数据。记住，`getHandler()` 会给我们一个路由处理函数的**引用** 。

或者，我们也可以通过将元数据应用到控制器级别来组织控制器，这将应用于控制器类中的所有路由。

```typescript title="cats.controller"
@Roles(['admin'])
@Controller('cats')
export class CatsController {}
```

在这种情况下，为了提取控制器元数据，我们传递 `context.getClass()` 作为第二个参数（以提供控制器类作为元数据提取的上下文），而不是 `context.getHandler()`：

```typescript title="roles.guard"
const roles = this.reflector.get(Roles, context.getClass());
```

考虑到可以在多个级别提供元数据，您可能需要从多个上下文中提取并合并元数据。`Reflector` 类提供了两个实用方法来帮助实现这一点。这些方法**同时**提取控制器和方法元数据，并以不同方式组合它们。

考虑以下场景，您在这两个级别都提供了 `Roles` 元数据。

```typescript title="cats.controller"
@Roles(['user'])
@Controller('cats')
export class CatsController {
  @Post()
  @Roles(['admin'])
  async create(@Body() createCatDto: CreateCatDto) {
    this.catsService.create(createCatDto);
  }
}
```

如果你的意图是将 `'user'` 设为默认角色，并针对特定方法选择性覆盖，你可能会使用 `getAllAndOverride()` 方法。

```typescript
const roles = this.reflector.getAllAndOverride(Roles, [
  context.getHandler(),
  context.getClass(),
]);
```

带有这段代码的守卫在 `create()` 方法上下文中运行，结合上述元数据，将导致 `roles` 包含 `['admin']`。

要获取两者的元数据并进行合并（此方法会合并数组和对象），请使用 `getAllAndMerge()` 方法：

```typescript
const roles = this.reflector.getAllAndMerge(Roles, [
  context.getHandler(),
  context.getClass(),
]);
```

这将导致 `roles` 包含 `['user', 'admin']`。

对于这两种合并方法，您需要将元数据键作为第一个参数传入，并将元数据目标上下文数组（即调用 `getHandler()` 和/或 `getClass()` 方法）作为第二个参数传入。

#### 底层实现方案

如前所述，除了使用 `Reflector#createDecorator` 外，您也可以使用内置的 `@SetMetadata()` 装饰器来为处理器附加元数据。

```typescript title="cats.controller"
@Post()
@SetMetadata('roles', ['admin'])
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}
```

> info **注意** `@SetMetadata()` 装饰器是从 `@nestjs/common` 包中导入的。

通过上述构建，我们将 `roles` 元数据（`roles` 是元数据键，`['admin']` 是关联值）附加到了 `create()` 方法上。虽然这种方式有效，但直接在路由中使用 `@SetMetadata()` 并不是最佳实践。相反，您可以创建自己的装饰器，如下所示：

```typescript title="roles.decorator"
import { SetMetadata } from '@nestjs/common';

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
```

这种方法更加简洁易读，某种程度上类似于 `Reflector#createDecorator` 的实现方式。不同之处在于，使用 `@SetMetadata` 您可以更好地控制元数据的键和值，并且可以创建接受多个参数的装饰器。

现在我们有了自定义的 `@Roles()` 装饰器，就可以用它来装饰 `create()` 方法了。

```typescript title="cats.controller"
@Post()
@Roles('admin')
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}
```

为了访问路由的角色信息（自定义元数据），我们将再次使用 `Reflector` 辅助类：

```typescript title="roles.guard"
@Injectable()
export class RolesGuard {
  constructor(private reflector: Reflector) {}
}
```

> info **提示** `Reflector` 类是从 `@nestjs/core` 包中导入的。

现在，要读取处理程序的元数据，请使用 `get()` 方法。

```typescript
const roles = this.reflector.get<string[]>('roles', context.getHandler());
```

这里我们不再传递装饰器引用，而是将元数据 **键** 作为第一个参数传递（在我们的例子中是 `'roles'`）。其他所有内容都与 `Reflector#createDecorator` 示例中的保持一致。
