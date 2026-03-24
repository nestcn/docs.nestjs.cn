<!-- 此文件从 content/fundamentals/execution-context.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-12T12:02:29.213Z -->
<!-- 源文件: content/fundamentals/execution-context.md -->

### 执行上下文

Nest 提供了多个实用类，帮助您编写跨多个应用程序上下文（例如，Nest HTTP 服务器、微服务和 WebSocket 应用程序上下文）运行的应用程序。这些实用类提供了当前执行上下文的信息，可以用来构建通用的[守卫](/guards)、[过滤器](/exception-filters)和[拦截器](/interceptors)，它们可以在广泛的控制器、方法和执行上下文中工作。

我们在本章中介绍两个这样的类：`ArgumentsHost` 和 `ExecutionContext`。

#### ArgumentsHost 类

`ArgumentsHost` 类提供了检索传递给处理程序的参数的方法。它允许选择适当的上下文（例如，HTTP、RPC（微服务）或 WebSockets）来检索参数。框架提供了 `ArgumentsHost` 的实例，通常作为 `host` 参数引用，在您可能想要访问它的地方。例如，[异常过滤器](https://docs.nestjs.com/exception-filters#arguments-host)的 `catch()` 方法使用 `ArgumentsHost` 实例调用。

`ArgumentsHost` 简单地充当处理程序参数的抽象。例如，对于 HTTP 服务器应用程序（当使用 `@nestjs/platform-express` 时），`host` 对象封装了 Express 的 `[request, response, next]` 数组，其中 `request` 是请求对象，`response` 是响应对象，`next` 是控制应用程序请求-响应周期的函数。另一方面，对于 [GraphQL](/graphql/quick-start) 应用程序，`host` 对象包含 `[root, args, context, info]` 数组。

#### 当前应用程序上下文

在构建旨在跨多个应用程序上下文运行的通用[守卫](/guards)、[过滤器](/exception-filters)和[拦截器](/interceptors)时，我们需要一种方法来确定我们的方法当前正在运行的应用程序类型。使用 `ArgumentsHost` 的 `getType()` 方法：

```typescript
if (host.getType() === 'http') {
  // 执行仅在常规 HTTP 请求（REST）上下文中重要的操作
} else if (host.getType() === 'rpc') {
  // 执行仅在微服务请求上下文中重要的操作
} else if (host.getType<GqlContextType>() === 'graphql') {
  // 执行仅在 GraphQL 请求上下文中重要的操作
}

```

::: info 提示 
 从 `@nestjs/graphql` 包导入。
:::

有了可用的应用程序类型，我们可以编写更通用的组件，如下所示。

#### 主机处理程序参数

要检索传递给处理程序的参数数组，一种方法是使用主机对象的 `getArgs()` 方法。

```typescript
const [req, res, next] = host.getArgs();

```

您可以使用 `getArgByIndex()` 方法按索引提取特定参数：

```typescript
const request = host.getArgByIndex(0);
const response = host.getArgByIndex(1);

```

在这些示例中，我们按索引检索请求和响应对象，这通常不建议，因为它将应用程序耦合到特定的执行上下文。相反，您可以使用 `host` 对象的实用方法之一切换到适合您应用程序的应用程序上下文，从而使代码更健壮和可重用。上下文切换实用方法如下所示。

```typescript
/**
 * 切换到 RPC 上下文。
 */
switchToRpc(): RpcArgumentsHost;
/**
 * 切换到 HTTP 上下文。
 */
switchToHttp(): HttpArgumentsHost;
/**
 * 切换到 WebSockets 上下文。
 */
switchToWs(): WsArgumentsHost;

```

让我们使用 `switchToHttp()` 方法重写前面的示例。`host.switchToHttp()` 辅助调用返回适合 HTTP 应用程序上下文的 `HttpArgumentsHost` 对象。`HttpArgumentsHost` 对象有两个有用的方法，我们可以用来提取所需的对象。在这种情况下，我们还使用 Express 类型断言返回原生 Express 类型对象：

```typescript
const ctx = host.switchToHttp();
const request = ctx.getRequest<Request>();
const response = ctx.getResponse<Response>();

```

同样，`WsArgumentsHost` 和 `RpcArgumentsHost` 有方法在微服务和 WebSockets 上下文中返回适当的对象。以下是 `WsArgumentsHost` 的方法：

```typescript
export interface WsArgumentsHost {
  /**
   * 返回数据对象。
   */
  getData<T>(): T;
  /**
   * 返回客户端对象。
   */
  getClient<T>(): T;
}

```

以下是 `RpcArgumentsHost` 的方法：

```typescript
export interface RpcArgumentsHost {
  /**
   * 返回数据对象。
   */
  getData<T>(): T;

  /**
   * 返回上下文对象。
   */
  getContext<T>(): T;
}

```

#### ExecutionContext 类

`ExecutionContext` 扩展了 `ArgumentsHost`，提供了有关当前执行过程的额外详细信息。与 `ArgumentsHost` 一样，Nest 在您可能需要它的地方提供 `ExecutionContext` 实例，例如在[守卫](https://docs.nestjs.com/guards#execution-context)的 `canActivate()` 方法和[拦截器](https://docs.nestjs.com/interceptors#execution-context)的 `intercept()` 方法中。它提供以下方法：

```typescript
export interface ExecutionContext extends ArgumentsHost {
  /**
   * 返回当前处理程序所属的控制器类类型。
   */
  getClass<T>(): Type<T>;
  /**
   * 返回将在请求管道中调用的下一个处理程序（方法）的引用。
   */
  getHandler(): Function;
}

```

`getHandler()` 方法返回即将调用的处理程序的引用。`getClass()` 方法返回此特定处理程序所属的 `Controller` 类的类型。例如，在 HTTP 上下文中，如果当前处理的请求是绑定到 `CatsController` 上 `create()` 方法的 `POST` 请求，`getHandler()` 返回 `create()` 方法的引用，`getClass()` 返回 `CatsController` **类**（不是实例）。

```typescript
const methodKey = ctx.getHandler().name; // "create"
const className = ctx.getClass().name; // "CatsController"

```

访问当前类和处理程序方法的引用的能力提供了极大的灵活性。最重要的是，它给了我们从守卫或拦截器内部访问通过 `Reflector#createDecorator` 创建的装饰器或内置 `@SetMetadata()` 装饰器设置的元数据的机会。我们在下面介绍这个用例。

<app-banner-enterprise></app-banner-enterprise>

#### 反射和元数据

Nest 提供了通过 `Reflector#createDecorator` 方法创建的装饰器和内置 `@SetMetadata()` 装饰器将**自定义元数据**附加到路由处理程序的能力。在本节中，让我们比较这两种方法，看看如何从守卫或拦截器内部访问元数据。

要使用 `Reflector#createDecorator` 创建强类型装饰器，我们需要指定类型参数。例如，让我们创建一个接受字符串数组作为参数的 `Roles` 装饰器。

```ts
import { Reflector } from '@nestjs/core';

export const Roles = Reflector.createDecorator<string[]>();

```

这里的 `Roles` 装饰器是一个接受 `string[]` 类型单个参数的函数。

现在，要使用这个装饰器，我们只需用它注释处理程序：

```typescript
@Post()
@Roles(['admin'])
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}

```

这里我们将 `Roles` 装饰器元数据附加到 `create()` 方法，指示只有具有 `admin` 角色的用户才能访问此路由。

要访问路由的角色（自定义元数据），我们将再次使用 `Reflector` 辅助类。`Reflector` 可以以正常方式注入到类中：

```typescript
@Injectable()
export class RolesGuard {
  constructor(private reflector: Reflector) {}
}

```

::: info 提示 
从 `@nestjs/core` 包导入。
:::

现在，要读取处理程序元数据，使用 `get()` 方法：

```typescript
const roles = this.reflector.get(Roles, context.getHandler());

```

`Reflector#get` 方法允许我们通过传递两个参数轻松访问元数据：装饰器引用和要从中检索元数据的**上下文**（装饰器目标）。在这个例子中，指定的**装饰器**是 `Roles`（回顾上面的 `roles.decorator.ts` 文件）。上下文由调用 `context.getHandler()` 提供，这导致提取当前处理的路由处理程序的元数据。记住，`getHandler()` 给我们路由处理程序函数的**引用**。

或者，我们可以通过在控制器级别应用元数据来组织控制器，应用于控制器类中的所有路由。

```typescript
@Roles(['admin'])
@Controller('cats')
export class CatsController {}

```

在这种情况下，要提取控制器元数据，我们传递 `context.getClass()` 作为第二个参数（提供控制器类作为元数据提取的上下文），而不是 `context.getHandler()`：

```typescript
const roles = this.reflector.get(Roles, context.getClass());

```

鉴于在多个级别提供元数据的能力，您可能需要从多个上下文中提取和合并元数据。`Reflector` 类提供了两个实用方法来帮助解决这个问题。这些方法一次提取**控制器和方法**元数据，并以不同方式组合它们。

考虑以下场景，您在两个级别都提供了 `Roles` 元数据。

```typescript
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

如果您的意图是指定 `'user'` 作为默认角色，并选择性地为某些方法覆盖它，您可能会使用 `getAllAndOverride()` 方法。

```typescript
const roles = this.reflector.getAllAndOverride(Roles, [context.getHandler(), context.getClass()]);

```

使用此代码的守卫，在 `create()` 方法的上下文中运行，具有上述元数据，将导致 `roles` 包含 `['admin']`。

要获取两者的元数据并合并它（此方法合并数组和对象），使用 `getAllAndMerge()` 方法：

```typescript
const roles = this.reflector.getAllAndMerge(Roles, [context.getHandler(), context.getClass()]);

```

这将导致 `roles` 包含 `['user', 'admin']`。

对于这两个合并方法，您传递元数据键作为第一个参数，传递元数据目标上下文数组（即，对 `getHandler()` 和/或 `getClass()` 方法的调用）作为第二个参数。

#### 低级方法

如前所述，除了使用 `Reflector#createDecorator`，您还可以使用内置 `@SetMetadata()` 装饰器将元数据附加到处理程序。

```typescript
@Post()
@SetMetadata('roles', ['admin'])
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}

```

::: info 提示 
从 `@nestjs/common` 包导入。
:::

通过上面的构造，我们将 `roles` 元数据（`roles` 是元数据键，`['admin']` 是关联的值）附加到 `create()` 方法。虽然这可行，但直接在路由中使用 `@SetMetadata()` 不是好的做法。相反，您可以创建自己的装饰器，如下所示：

```typescript
import { SetMetadata } from '@nestjs/common';

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

export const Roles = (...roles) => SetMetadata('roles', roles);

```

这种方法更清晰、更易读，并且在某种程度上类似于 `Reflector#createDecorator` 方法。区别在于，使用 `@SetMetadata` 您可以更多地控制元数据键和值，还可以创建接受多个参数的装饰器。

现在我们有了自定义 `@Roles()` 装饰器，我们可以用它来装饰 `create()` 方法。

```typescript
@Post()
@Roles('admin')
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}

```

要访问路由的角色（自定义元数据），我们将再次使用 `Reflector` 辅助类：

```typescript
@Injectable()
export class RolesGuard {
  constructor(private reflector: Reflector) {}
}

```

::: info 提示 
从 `@nestjs/core` 包导入。
:::

现在，要读取处理程序元数据，使用 `get()` 方法。

```typescript
const roles = this.reflector.get<string[]>('roles', context.getHandler());

```

这里我们传递元数据**键**作为第一个参数（在我们的例子中是 `'roles'`），而不是传递装饰器引用。其他所有内容与 `Reflector#createDecorator` 示例中的相同。
