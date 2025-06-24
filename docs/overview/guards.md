### 守卫

守卫是一个用 `@Injectable()` 装饰器注解的类，它实现了 `CanActivate` 接口。

![](/assets/Guards_1.png)

守卫具有**单一职责** 。它们根据运行时存在的某些条件（如权限、角色、访问控制列表等）来决定是否由路由处理程序处理给定请求。这通常被称为**授权** 。授权（及其通常与之协作的**认证** ）在传统的 Express 应用中通常由[中间件](/middleware)处理。中间件非常适合处理认证，因为像令牌验证和向 `request` 对象附加属性这类操作与特定路由上下文（及其元数据）没有强关联。

但中间件本质上是"哑"的，它不知道调用 `next()` 函数后会执行哪个处理程序。而**守卫**则能访问 `ExecutionContext` 实例，因此确切知道接下来要执行什么。与异常过滤器、管道和拦截器类似，守卫的设计让你能在请求/响应周期的精确时点介入处理逻辑，并以声明式方式实现。这有助于保持代码的 DRY 原则和声明式风格。

> info **守卫**在所有中间件**之后**执行，但在任何拦截器或管道**之前**执行。

#### 授权守卫

如前所述， **授权**是守卫的绝佳应用场景，因为特定路由应当仅在调用者（通常是已认证的特定用户）拥有足够权限时才可用。我们将要构建的 `AuthGuard` 假设用户已通过认证（因此请求头中附带了令牌）。它将提取并验证令牌，利用提取的信息来判断是否允许该请求继续执行。

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
```

> info **提示** 若需查看如何在应用中实现认证机制的实际案例，请访问[本章节](/security/authentication) 。同样地，如需更复杂的授权示例，请参阅[此页面](/security/authorization) 。

`validateRequest()` 函数内部的逻辑可根据需求简单或复杂处理。本示例的核心在于展示守卫如何融入请求/响应周期。

每个守卫都必须实现一个 `canActivate()` 函数。该函数应返回一个布尔值，指示当前请求是否被允许。它可以同步返回响应，也可以异步返回（通过 `Promise` 或 `Observable`）。Nest 根据返回值来控制下一步操作：

- 如果返回 `true`，请求将被处理。
- 如果返回 `false`，Nest 将拒绝该请求。

#### 执行上下文

`canActivate()` 函数接收一个参数，即 `ExecutionContext` 实例。`ExecutionContext` 继承自 `ArgumentsHost`。我们之前在异常过滤器章节中已经见过 `ArgumentsHost`。在上面的示例中，我们只是使用了之前定义在 `ArgumentsHost` 上的相同辅助方法，来获取对 `Request` 对象的引用。您可以回顾[异常过滤器](https://docs.nestjs.com/exception-filters#arguments-host)章节中的 **Arguments host** 部分以获取更多相关信息。

通过扩展 `ArgumentsHost`，`ExecutionContext` 还添加了几个新的辅助方法，这些方法提供了有关当前执行过程的额外详细信息。这些细节有助于构建更通用的守卫，使其能够跨多种控制器、方法和执行上下文工作。了解更多关于 `ExecutionContext` 的信息[请点击此处](/fundamentals/execution-context) 。

#### 基于角色的身份验证

我们来构建一个功能更完善的守卫，只允许特定角色的用户访问。我们将从一个基本的守卫模板开始，并在接下来的章节中逐步完善它。现在，它允许所有请求通过：

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
```

#### 绑定守卫

与管道和异常过滤器类似，守卫可以具有**控制器范围** 、方法范围或全局范围。下面，我们使用 `@UseGuards()` 装饰器设置了一个控制器范围的守卫。该装饰器可以接收单个参数或以逗号分隔的参数列表，这使您能够通过一次声明轻松应用适当的守卫集。

```typescript
@@filename()
@Controller('cats')
@UseGuards(RolesGuard)
export class CatsController {}
```

> info **注意** `@UseGuards()` 装饰器是从 `@nestjs/common` 包导入的。

上面，我们传递了 `RolesGuard` 类（而非实例），将实例化的责任交给框架处理，并启用了依赖注入。与管道和异常过滤器类似，我们也可以直接传递一个即时实例：

```typescript
@@filename()
@Controller('cats')
@UseGuards(new RolesGuard())
export class CatsController {}
```

上述构造将该守卫附加到该控制器声明的每个处理程序上。如果我们希望守卫仅应用于单个方法，则应在**方法级别**使用 `@UseGuards()` 装饰器。

要设置全局守卫，请使用 Nest 应用实例的 `useGlobalGuards()` 方法：

```typescript
@@filename()
const app = await NestFactory.create(AppModule);
app.useGlobalGuards(new RolesGuard());
```

> warning **注意** 对于混合应用，`useGlobalGuards()` 方法默认不会为网关和微服务设置守卫（有关如何更改此行为的信息，请参阅[混合应用](/faq/hybrid-application) ）。对于"标准"（非混合）微服务应用，`useGlobalGuards()` 会全局挂载守卫。

全局守卫用于整个应用程序，作用于每个控制器和每个路由处理器。在依赖注入方面，从任何模块外部注册的全局守卫（如上例中使用 `useGlobalGuards()`）无法注入依赖项，因为这发生在任何模块的上下文之外。为解决此问题，您可以直接从任何模块使用以下结构设置守卫：

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

> info **注意** 当使用此方法为守卫执行依赖注入时，请注意无论该结构应用于哪个模块，该守卫实际上是全局的。应在何处进行此操作？选择定义守卫的模块（如上例中的 `RolesGuard`）。此外，`useClass` 并非处理自定义提供程序注册的唯一方式。了解更多[此处](/fundamentals/custom-providers) 。

#### 为每个处理器设置角色

我们的 `RolesGuard` 已经可以工作，但还不够智能。我们尚未利用最重要的守卫特性—— [执行上下文](/fundamentals/execution-context) 。它目前还不了解角色信息，也不知道每个处理器允许哪些角色。例如，`CatsController` 可以为不同路由设置不同的权限方案。某些路由可能仅对管理员用户开放，而其他路由则可能允许所有人访问。我们如何才能以灵活且可重用的方式将角色与路由匹配起来？

这正是**自定义元数据**发挥作用的地方（了解更多[此处](https://docs.nestjs.com/fundamentals/execution-context#reflection-and-metadata) ）。Nest 提供了通过两种方式为路由处理器附加自定义**元数据**的能力：一种是使用 `Reflector.createDecorator` 静态方法创建的装饰器，另一种是内置的 `@SetMetadata()` 装饰器。

例如，让我们使用 `Reflector.createDecorator` 方法创建一个 `@Roles()` 装饰器，该装饰器会将元数据附加到处理器上。`Reflector` 由框架开箱即用提供，并从 `@nestjs/core` 包中导出。

```ts
@@filename(roles.decorator)
import { Reflector } from '@nestjs/core';

export const Roles = Reflector.createDecorator<string[]>();
```

这里的 `Roles` 装饰器是一个接收 `string[]` 类型单一参数的函数。

现在要使用这个装饰器，我们只需用它来注解处理器：

```typescript
@@filename(cats.controller)
@Post()
@Roles(['admin'])
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}
```

这里我们将 `Roles` 装饰器元数据附加到 `create()` 方法上，表明只有具有 `admin` 角色的用户才被允许访问此路由。

或者，不使用 `Reflector.createDecorator` 方法，我们可以使用内置的 `@SetMetadata()` 装饰器。了解更多请点击[此处](/fundamentals/execution-context#low-level-approach) 。

#### 整合所有内容

现在让我们回到 `RolesGuard` 并将其整合起来。目前它只是简单地返回 `true`，允许所有请求通过。我们希望根据**当前用户分配的角色**与当前处理路由所需实际角色的比较结果来条件化返回值。为了访问路由的角色（自定义元数据），我们将再次使用 `Reflector` 辅助类，如下所示：

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
```

> info **提示** 在 Node.js 环境中，通常会将授权用户附加到 `request` 对象上。因此，在上述示例代码中，我们假设 `request.user` 包含用户实例及其允许的角色。在您的应用中，您可能会在自定义的**认证守卫** （或中间件）中建立这种关联。有关此主题的更多信息，请参阅[本章节](/security/authentication) 。

> warning **警告** `matchRoles()` 函数内部的逻辑可以根据需要简单或复杂。本示例的主要目的是展示守卫如何融入请求/响应周期。

有关在上下文敏感方式中使用 `Reflector` 的更多细节，请参阅 **执行上下文** 章节中的 [反射与元数据](https://docs.nestjs.com/fundamentals/execution-context#reflection-and-metadata) 部分。

当权限不足的用户请求端点时，Nest 会自动返回以下响应：

```typescript
{
  "statusCode": 403,
  "message": "Forbidden resource",
  "error": "Forbidden"
}
```

请注意，在底层实现中，当守卫返回 `false` 时，框架会抛出 `ForbiddenException`。如果您想返回不同的错误响应，应该抛出特定的自定义异常。例如：

```typescript
throw new UnauthorizedException();
```

守卫抛出的任何异常都将由[异常处理层](/exception-filters) （全局异常过滤器及应用于当前上下文的任何异常过滤器）处理。

> **提示** 如果您正在寻找如何实现授权的实际示例，请查看[本章节](/security/authorization) 。
