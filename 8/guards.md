# 守卫

守卫是一个使用 `@Injectable()` 装饰器的类。 守卫应该实现 `CanActivate` 接口。

![](https://docs.nestjs.com/assets/Guards_1.png)

守卫有一个单独的责任。它们根据运行时出现的某些条件（例如权限，角色，访问控制列表等）来确定给定的请求是否由路由处理程序处理。 这通常称为授权。在传统的 `Express` 应用程序中，通常由中间件处理授权。中间件是身份验证的良好选择。到目前为止，访问限制逻辑大多在中间件内。这样很好，因为诸如 `token` 验证或将 `request` 对象附加属性与特定路由没有强关联。

中间件不知道调用 `next()` 函数后会执行哪个处理程序。另一方面，警卫可以访问 `ExecutionContext` 实例，因此确切地知道接下来要执行什么。它们的设计与异常过滤器、管道和拦截器非常相似，目的是让您在请求/响应周期的正确位置插入处理逻辑，并以声明的方式进行插入。这有助于保持代码的简洁和声明性。

?> 守卫在每个中间件之后执行，但在任何拦截器或管道之前执行。

## 授权守卫

正如前面提到的，授权是保护的一个很好的用例，因为只有当调用者(通常是经过身份验证的特定用户)具有足够的权限时，特定的路由才可用。我们现在要构建的 `AuthGuard` 假设用户是经过身份验证的(因此，请求头附加了一个`token`)。它将提取和验证`token`，并使用提取的信息来确定请求是否可以继续。

> auth.guard.ts

```typescript
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
`validateRequest()` 函数中的逻辑可以根据需要变得简单或复杂。本例的主要目的是说明保护如何适应请求/响应周期。

每个守卫必须实现一个canActivate()函数。此函数应该返回一个布尔值，指示是否允许当前请求。它可以同步或异步地返回响应(通过 `Promise` 或 `Observable`)。`Nest`使用返回值来控制下一个行为:

- 如果返回 `true`, 将处理用户调用。
- 如果返回 `false`, 则 `Nest` 将忽略当前处理的请求。

## 执行上下文

`canActivate()` 函数接收单个参数 `ExecutionContext` 实例。`ExecutionContext` 继承自 `ArgumentsHost` 。`ArgumentsHost` 是传递给原始处理程序的参数的包装器，在上面的示例中，我们只是使用了之前在 `ArgumentsHost`上定义的帮助器方法来获得对请求对象的引用。有关此主题的更多信息。你可以在[这里](exceptionfilters.md)了解到更多(在异常过滤器章节)。


`ExecutionContext` 提供了更多功能，它扩展了 `ArgumentsHost`，但是也提供了有关当前执行过程的更多详细信息。

```typescript
export interface ExecutionContext extends ArgumentsHost {
  getClass<T = any>(): Type<T>;
  getHandler(): Function;
}
```

`getHandler()`方法返回对将要调用的处理程序的引用。`getClass()`方法返回这个特定处理程序所属的 `Controller` 类的类型。例如，如果当前处理的请求是 `POST` 请求，目标是 `CatsController`上的 `create()` 方法，那么 `getHandler()` 将返回对 `create()` 方法的引用，而 `getClass()`将返回一个`CatsControllertype`(而不是实例)。


## 基于角色认证

一个更详细的例子是一个 `RolesGuard` 。这个守卫只允许具有特定角色的用户访问。我们将从一个基本模板开始，并在接下来的部分中构建它。目前，它允许所有请求继续:

> roles.guard.ts

```typescript
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

## 绑定守卫

与管道和异常过滤器一样，守卫可以是控制范围的、方法范围的或全局范围的。下面，我们使用 `@UseGuards()`装饰器设置了一个控制范围的守卫。这个装饰器可以使用单个参数，也可以使用逗号分隔的参数列表。也就是说，你可以传递几个守卫并用逗号分隔它们。

```typescript
@Controller('cats')
@UseGuards(RolesGuard)
export class CatsController {}
```

?> `@UseGuards()` 装饰器需要从 `@nestjs/common` 包导入。

上例，我们已经传递了 `RolesGuard` 类型而不是实例, 让框架进行实例化，并启用了依赖项注入。与管道和异常过滤器一样，我们也可以传递一个实例:

```typescript
@Controller('cats')
@UseGuards(new RolesGuard())
export class CatsController {}
```

上面的构造将守卫附加到此控制器声明的每个处理程序。如果我们决定只限制其中一个, 我们只需要在方法级别设置守卫。为了绑定全局守卫, 我们使用 Nest 应用程序实例的 `useGlobalGuards()` 方法:

为了设置一个全局守卫，使用Nest应用程序实例的 `useGlobalGuards()` 方法：

```typescript
const app = await NestFactory.create(AppModule);
app.useGlobalGuards(new RolesGuard());
```

?> 对于混合应用程序，`useGlobalGuards()` 方法不会为网关和微服务设置守卫。对于“标准”(非混合)微服务应用程序，`useGlobalGuards()`在全局安装守卫。

全局守卫用于整个应用程序, 每个控制器和每个路由处理程序。在依赖注入方面, 从任何模块外部注册的全局守卫 (如上面的示例中所示) 不能插入依赖项, 因为它们不属于任何模块。为了解决此问题, 您可以使用以下构造直接从任何模块设置一个守卫:

> app.module.ts

```typescript
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

?> 当使用此方法为守卫程序执行依赖项注入时，请注意，无论使用此构造的模块是什么，守卫程序实际上是全局的。应该在哪里进行?选择定义守卫的模块(上例中的 `RolesGuard`)。此外，`useClass`不是处理自定义 `providers` 注册的唯一方法。在[这里](/8/fundamentals?id=自定义providercustomer-provider)了解更多。

## 反射器

守卫现在在正常工作，但还不是很智能。我们仍然没有利用最重要的守卫的特征，即执行上下文。它还不知道角色，或者每个处理程序允许哪些角色。例如，`CatsController` 可以为不同的路由提供不同的权限方案。其中一些可能只对管理用户可用，而另一些则可以对所有人开放。我们如何以灵活和可重用的方式将角色与路由匹配起来?

这就是自定义元数据发挥作用的地方。`Nest`提供了通过 `@SetMetadata()` 装饰器将定制元数据附加到路由处理程序的能力。这些元数据提供了我们所缺少的角色数据，而守卫需要这些数据来做出决策。让我们看看使用`@SetMetadata()`:

> cats.controller.ts

```typescript
@Post()
@SetMetadata('roles', ['admin'])
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}
```

?> `@SetMetadata()` 装饰器需要从 `@nestjs/common` 包导入。

通过上面的构建，我们将 `roles` 元数据(`roles` 是一个键，而 `['admin']` 是一个特定的值)附加到 `create()` 方法。 直接使用 `@SetMetadata()` 并不是一个好习惯。 相反，你应该创建你自己的装饰器。

> roles.decorator.ts

```typescript
import { SetMetadata } from '@nestjs/common';

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
```

这种方法更简洁、更易读，而且是强类型的。现在我们有了一个自定义的 `@Roles()` 装饰器，我们可以使用它来装饰 `create()`方法。

> cats.controller.ts

```typescript
@Post()
@Roles('admin')
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}
```

让我们再次回到 `RolesGuard` 。 它只是在所有情况下返回 `true`，到目前为止允许请求继续。我们希望根据分配给当前用户的角色与正在处理的当前路由所需的实际角色之间的比较来设置返回值的条件。 为了访问路由的角色(自定义元数据)，我们将使用在 `@nestjs/core` 中提供的 `Reflector` 帮助类。

> roles.guard.ts

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    return matchRoles(roles, user.roles);
  }
}
```

?> 在 `node.js` 世界中，将授权用户附加到 `request` 对象是一种常见的做法。 因此，在上面的示例代码中。我们假设 `request.user` 包含用户实例和允许的角色。 在您的应用中，您可能会在自定义身份验证（或中间件）中建立该关联。

?> `matchRoles()` 函数内部的逻辑可以根据需要简单或复杂。该示例的重点是显示防护如何适应请求/响应周期。

现在，当用户尝试在没有足够权限的情况下调用 `/cats` POST端点时，`Nest` 会自动返回以下响应：

有关以上下文相关方式进行利用的更多详细信息，请参见“ 执行”上下文章节的“ 反射和元数据”部分。

当特权不足的用户请求端点时，Nest自动返回以下响应：
```json
{
  "statusCode": 403,
  "message": "Forbidden resource"
}
```

实际上，返回 `false` 的守卫会抛出一个 `HttpException` 异常。如果您想要向最终用户返回不同的错误响应，你应该抛出一个异常。

```typescript
throw new UnauthorizedException();
```
由守卫引发的任何异常都将由异常层(全局异常过滤器和应用于当前上下文的任何异常过滤器)处理。

 ### 译者署名

| 用户名 | 头像 | 职能 | 签名 |
|---|---|---|---|