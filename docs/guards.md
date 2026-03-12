### 守卫

守卫是使用 `@Injectable()` 装饰器装饰并实现 `CanActivate` 接口的类。

<figure><img class="illustrative-image" src="/assets/Guards_1.png" /></figure>

守卫有**单一职责**。它们根据运行时存在的某些条件（如权限、角色、ACL 等）确定给定请求是否将由路由处理程序处理。这通常被称为**授权**。授权（及其近亲**认证**，通常与之协作）在传统 Express 应用程序中通常由[中间件](/middleware)处理。中间件是认证的好选择，因为令牌验证和将属性附加到 `request` 对象等事情与特定路由上下文（及其元数据）没有紧密联系。

但中间件本质上是"愚蠢"的。它不知道调用 `next()` 函数后将执行哪个处理程序。另一方面，**守卫**可以访问 `ExecutionContext` 实例，因此确切知道接下来要执行什么。它们的设计与异常过滤器、管道和拦截器类似，让你可以在请求/响应周期的正确位置插入处理逻辑，并以声明式的方式进行。这有助于保持代码 DRY 和声明式。

> info **提示** 守卫在所有中间件**之后**执行，但在任何拦截器或管道**之前**执行。

#### 授权守卫

如前所述，**授权**是守卫的一个很好的用例，因为特定路由应该仅在调用者（通常是特定已认证用户）具有足够权限时才可用。我们现在要构建的 `AuthGuard` 假设用户已认证（因此令牌附加到请求头）。它将提取并验证令牌，并使用提取的信息确定请求是否可以继续。

```typescript
@@filename(auth.guard)
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    return validateRequest(request);
  }
}
@@switch
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthGuard {
  async canActivate(context) {
    const request = context.switchToHttp().getRequest();
    return validateRequest(request);
  }
}
```

> info **提示** 如果你正在寻找如何在应用程序中实现认证机制的实际示例，请访问[此章节](/security/authentication)。同样，对于更复杂的授权示例，请查看[此页面](/security/authorization)。

`validateRequest()` 函数内部的逻辑可以根据需要简单或复杂。此示例的要点是展示守卫如何融入请求/响应周期。

每个守卫都必须实现 `canActivate()` 函数。此函数应返回一个布尔值，指示当前请求是否被允许。它可以同步或异步返回响应（通过 `Promise` 或 `Observable`）。Nest 使用返回值控制下一个操作：

- 如果返回 `true`，请求将被处理。
- 如果返回 `false`，Nest 将拒绝请求。

<app-banner-enterprise></app-banner-enterprise>

#### 执行上下文

`canActivate()` 函数接受一个参数，即 `ExecutionContext` 实例。`ExecutionContext` 继承自 `ArgumentsHost`。我们之前在异常过滤器章节中见过 `ArgumentsHost`。在上面的示例中，我们只是使用之前在 `ArgumentsHost` 上定义的相同辅助方法来获取 `Request` 对象的引用。你可以回顾[异常过滤器](https://docs.nestjs.com/exception-filters#arguments-host)章节的 **Arguments host** 部分以了解更多关于此主题的信息。

通过扩展 `ArgumentsHost`，`ExecutionContext` 还添加了几个新的辅助方法，提供有关当前执行过程的更多详细信息。这些详细信息有助于构建更通用的守卫，可以在广泛的控制器、方法和执行上下文中工作。在[此处](/fundamentals/execution-context)了解更多关于 `ExecutionContext` 的信息。

#### 基于角色的认证

让我们构建一个更有功能的守卫，只允许具有特定角色的用户访问。我们将从一个基本的守卫模板开始，并在接下来的部分中构建它。目前，它允许所有请求继续：

```typescript
@@filename(roles.guard)
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return true;
  }
}
@@switch
import { Injectable } from '@nestjs/common';

@Injectable()
export class RolesGuard {
  canActivate(context) {
    return true;
  }
}
```

#### 绑定守卫

与管道和异常过滤器一样，守卫可以是**控制器范围**、方法范围或全局范围。下面，我们使用 `@UseGuards()` 装饰器设置控制器范围的守卫。此装饰器可以接受单个参数或逗号分隔的参数列表。这让你可以轻松地通过一个声明应用适当的守卫集。

```typescript
@@filename()
@Controller('cats')
@UseGuards(RolesGuard)
export class CatsController {}
```

> info **提示** `@UseGuards()` 装饰器从 `@nestjs/common` 包导入。

上面，我们传递了 `RolesGuard` 类（而不是实例），将实例化责任留给框架并启用依赖注入。与管道和异常过滤器一样，我们也可以传递一个就地实例：

```typescript
@@filename()
@Controller('cats')
@UseGuards(new RolesGuard())
export class CatsController {}
```

上面的构造将守卫附加到此控制器声明的每个处理程序。如果我们希望守卫仅应用于单个方法，我们在**方法级别**应用 `@UseGuards()` 装饰器。

为了设置全局守卫，使用 Nest 应用实例的 `useGlobalGuards()` 方法：

```typescript
@@filename()
const app = await NestFactory.create(AppModule);
app.useGlobalGuards(new RolesGuard());
```

> warning **注意** 对于混合应用程序，`useGlobalGuards()` 方法默认不会为网关和微服务设置守卫（有关如何更改此行为的信息，请参阅[混合应用程序](/faq/hybrid-application)）。对于"标准"（非混合）微服务应用，`useGlobalGuards()` 确实会全局挂载守卫。

全局守卫用于整个应用程序，用于每个控制器和每个路由处理程序。在依赖注入方面，从任何模块外部注册的全局守卫（使用 `useGlobalGuards()`，如上面的示例）无法注入依赖项，因为这是在任何模块上下文之外完成的。为了解决这个问题，你可以使用以下构造直接从任何模块设置守卫：

```typescript
@@filename(app.module)
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
```

> info **提示** 当使用此方法为守卫执行依赖注入时，请注意无论使用此构造的模块是什么，守卫实际上是全局的。这应该在哪里做？选择定义守卫的模块（上面示例中的 `RolesGuard`）。此外，`useClass` 不是处理自定义提供者注册的唯一方式。在[此处](/fundamentals/custom-providers)了解更多。

#### 为每个处理程序设置角色

我们的 `RolesGuard` 正在工作，但还不够智能。我们还没有利用最重要的守卫功能 - [执行上下文](/fundamentals/execution-context)。它还不知道角色，或者每个处理程序允许哪些角色。例如，`CatsController` 可能为不同的路由有不同的权限方案。有些可能仅对管理员用户可用，其他可能对所有人开放。我们如何以灵活和可重用的方式将角色与路由匹配？

这就是**自定义元数据**发挥作用的地方（在[此处](https://docs.nestjs.com/fundamentals/execution-context#reflection-and-metadata)了解更多）。Nest 提供了通过 `Reflector.createDecorator` 静态方法创建的装饰器或内置 `@SetMetadata()` 装饰器将自定义**元数据**附加到路由处理程序的能力。

例如，让我们使用 `Reflector.createDecorator` 方法创建一个 `@Roles()` 装饰器，它将元数据附加到处理程序。`Reflector` 由框架开箱即用地提供，并从 `@nestjs/core` 包导出。

```ts
@@filename(roles.decorator)
import { Reflector } from '@nestjs/core';

export const Roles = Reflector.createDecorator<string[]>();
```

这里的 `Roles` 装饰器是一个接受 `string[]` 类型单个参数的函数。

现在，要使用此装饰器，我们只需用它注释处理程序：

```typescript
@@filename(cats.controller)
@Post()
@Roles(['admin'])
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}
@@switch
@Post()
@Roles(['admin'])
@Bind(Body())
async create(createCatDto) {
  this.catsService.create(createCatDto);
}
```

这里我们将 `Roles` 装饰器元数据附加到 `create()` 方法，指示只有具有 `admin` 角色的用户才能访问此路由。

或者，我们可以使用内置的 `@SetMetadata()` 装饰器，而不是使用 `Reflector.createDecorator` 方法。在[此处](/fundamentals/execution-context#low-level-approach)了解更多。

#### 整合

现在让我们回到并将此与我们的 `RolesGuard` 结合起来。目前，它在所有情况下都简单地返回 `true`，允许每个请求继续。我们想根据比较**分配给当前用户的角色**与当前正在处理的路由实际需要的角色来使返回值有条件。为了访问路由的角色（自定义元数据），我们将再次使用 `Reflector` 辅助类，如下所示：

```typescript
@@filename(roles.guard)
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get(Roles, context.getHandler());
    if (!roles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    return matchRoles(roles, user.roles);
  }
}
@@switch
import { Injectable, Dependencies } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from './roles.decorator';

@Injectable()
@Dependencies(Reflector)
export class RolesGuard {
  constructor(reflector) {
    this.reflector = reflector;
  }

  canActivate(context) {
    const roles = this.reflector.get(Roles, context.getHandler());
    if (!roles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    return matchRoles(roles, user.roles);
  }
}
```

> info **提示** 在 node.js 世界中，将授权用户附加到 `request` 对象是常见做法。因此，在上面的示例代码中，我们假设 `request.user` 包含用户实例和允许的角色。在你的应用中，你可能会在自定义**认证守卫**（或中间件）中建立该关联。查看[此章节](/security/authentication)以获取有关此主题的更多信息。

> warning **警告** `matchRoles()` 函数内部的逻辑可以根据需要简单或复杂。此示例的要点是展示守卫如何融入请求/响应周期。

有关如何以上下文敏感的方式使用 `Reflector` 的更多详细信息，请参阅**执行上下文**章节的 <a href="https://docs.nestjs.com/fundamentals/execution-context#reflection-and-metadata">反射和元数据</a> 部分。

当权限不足的用户请求端点时，Nest 自动返回以下响应：

```typescript
{
  "statusCode": 403,
  "message": "Forbidden resource",
  "error": "Forbidden"
}
```

请注意，在幕后，当守卫返回 `false` 时，框架会抛出 `ForbiddenException`。如果你想返回不同的错误响应，你应该抛出自己的特定异常。例如：

```typescript
throw new UnauthorizedException();
```

守卫抛出的任何异常都将由[异常层](/exception-filters)处理（全局异常过滤器和应用于当前上下文的任何异常过滤器）。

> info **提示** 如果你正在寻找如何实现授权的实际示例，请查看[此章节](/security/authorization)。
