# 守卫

守卫是一个使用 `@Injectable()` 装饰器的类。 守卫应该实现 `CanActivate` 接口。

![](https://docs.nestjs.com/assets/Guards_1.png)

守卫有一个单独的责任。它们确定请求是否应该由路由处理程序处理。到目前为止, 访问限制逻辑大多在中间件内。这样很好, 因为诸如 token 验证或将req对象附加属性与特定路由没有强关联。

但中间件是非常笨的。它不知道调用 next() 函数后会执行哪个处理程序。另一方面, 守卫可以访问 ExecutionContext 对象, 所以我们确切知道将要执行什么。

?> 守卫在每个中间件之后执行的, 但在管道之前。

## 授权看守卫

最好的用例之一就是认证逻辑，因为只有当调用者具有足够的权限（例如管理员角色）时才能使用特定的路由。我们有一个计划要创建的 AuthGuard 将依次提取和验证在请求标头中发送的 token。

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
不管 validateRequest() 函数背后的逻辑是什么, 主要的一点是要展示如何简单地利用守卫。每个守卫都提供一个 canActivate() 功能。守卫可能通过 (Promise 或 Observable) 同步地或异步地返回它的布尔答复。返回的值控制 Nest 行为:

- 如果返回 true, 将处理用户调用。
- 如果返回 false, 则 Nest 将忽略当前处理的请求。

canActivate() 函数采用单参数 ExecutionContext 实例。ExecutionContext 从 ArgumentsHost 继承 ([这里](/5.0/exceptionfilters)首先提到)。ArgumentsHost 是围绕已传递给原始处理程序的参数的包装, 它包含基于应用程序类型的引擎下的不同参数数组。

```typescript
export interface ArgumentsHost {
  getArgs<T extends Array<any> = any[]>(): T;
  getArgByIndex<T = any>(index: number): T;
  switchToRpc(): RpcArgumentsHost;
  switchToHttp(): HttpArgumentsHost;
  switchToWs(): WsArgumentsHost;
}
```
ArgumentsHost 为我们提供了一套有用的方法, 帮助从基础数组中选取正确的参数。换言之, ArgumentsHost 只是一个参数数组而已。例如, 当在 HTTP 应用程序上下文中使用该保护程序时, ArgumentsHost 将在内部包含 [request, response] 数组。但是, 当当前上下文是 web 套接字应用程序时, 此数组将等于 [client, data]。通过此设计, 您可以访问最终传递给相应处理程序的任何参数。

ExecutionContext 提供多一点。它扩展了 ArgumentsHost, 而且还提供了有关当前执行过程的更多细节。

```typescript
export interface ExecutionContext extends ArgumentsHost {
  getClass<T = any>(): Type<T>;
  getHandler(): Function;
}
```

getHandler() 返回对当前处理的处理程序的引用, 而 getClass() 返回此特定处理程序所属的控制器类的类型。换句话说, 如果用户指向在 CatsController 中定义和注册的 `create()` 方法, 则 getHandler() 将返回对 `create()` 方法和 `getClass（）`  的引用, 在这种情况下, 将只返回一个 CatsController 类型 (不是实例)。

## 基于角色的认证

一个更详细的例子是一个 RolesGuard 。这个守卫只允许具有特定角色的用户访问。我们要从一个基本的守卫模板开始：

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


守卫可以是控制器范围的，方法范围的和全局范围的。为了建立守卫，我们使用 `@UseGuards()` 装饰器。这个装饰器可以有无数的参数。也就是说，你可以传递几个守卫并用逗号分隔它们。

> cats.controller.ts

```typescript
@Controller('cats')
@UseGuards(RolesGuard)
export class CatsController {}
```

!> `@UseGuards()` 装饰器是从 `@nestjs/common` 包中导入的。

我们已经通过了 RolesGuard 类型而不是实例, 使框架成为实例化责任并启用依赖项注入。另一种可用的方法是传递立即创建的实例:

> cats.controller.ts

```typescript
@Controller('cats')
@UseGuards(new RolesGuard())
export class CatsController {}
```
上面的构造将守卫附加到此控制器声明的每个处理程序。如果我们决定只限制其中一个, 我们只需要设置在方法级别的守卫。为了绑定全局守卫, 我们使用 Nest 应用程序实例的 `useGlobalGuards()` 方法:

```typescript
const app = await NestFactory.create(ApplicationModule);
app.useGlobalGuards(new RolesGuard());
```

!> 该  useGlobalGuards() 方法没有设置网关和微服务的守卫。

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
export class ApplicationModule {}
```
还有, 控制器里的守卫, 在依赖注入方面, 可以类似地看成普通的可注入类来注入。例如:
```typescript
import { Module } from '@nestjs/common';
import { UserService } from '../service';
import { UserGuard } from '../guard';

@Module({
  providers: [
    UserService, UserGuard
  ],
})
export class ServiceModule {}
```

?> 另一种选择是使用执行上下文功能, 虽然它可能会过于臃肿, 且消耗资源。另外，useClass并不是处理自定义提供者注册的唯一方法。在[这里](/5.0/fundamentalsid=dependencyinjection)了解更多




## 反射器

守卫在正常工作，但我们仍然没有利用最重要的守卫的特征，即执行上下文。

现在，`RolesGuard` 是不可重用的。 我们如何知道处理程序需要处理哪些角色？ `CatsController` 可以有很多。 有些可能只适用于管理员，一些适用于所有人。

这就是为什么与守卫一起，`Nest` 提供了通过 `@ReflectMetadata()` 装饰器附加自定义元数据的能力。

> cats.controller.ts

```typescript
@Post()
@ReflectMetadata('roles', ['admin'])
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}
```

!> `@ReflectMetadata()` 装饰器是从 `@nestjs/common` 包中导入的。

通过上面的构建，我们将 roles 元数据(roles 是一个关键，虽然['admin']是一个特定的值)附加到 `create()` 方法。 直接使用 `@ReflectMetadata()` 并不是一个好习惯。 相反，你应该总是创建你自己的装饰器。

> roles.decorator.ts

```typescript
import { ReflectMetadata } from '@nestjs/common';

export const Roles = (...roles: string[]) => ReflectMetadata('roles', roles);
```

这样更简洁。 由于我们现在有一个 `@Roles()` 装饰器，所以我们可以在 `create()` 方法中使用它。

> cats.controller.ts

```typescript
@Post()
@Roles('admin')
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}
```

我们再来关注一下 `RolesGuard` 。 现在，它立即返回 `true` ，允许请求继续。 为了反映元数据，我们将使用在 `@nestjs/core` 中提供的反射器 helper 类。

> roles.guard.ts

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const hasRole = () => user.roles.some((role) => roles.includes(role));
    return user && user.roles && hasRole();
  }
}
```

?> 在 `node.js` 世界中，将授权用户附加到 `request` 对象是一种常见的做法。 这就是为什么我们假定 `request.user` 包含用户对象。

反射器 `Reflector` 允许我们很容易地通过指定的键反射元数据。 在上面的例子中，为了反射元数据, 我们使用 `getHandler()`，因为它是对路由处理函数的引用。 如果我们也添加控制器反射部分，我们可以使这个守卫更通用。 为了提取控制器元数据，我们只是使用 `context.getClass()` 而不是 `getHandler()`函数。

```typescript
const roles = this.reflector.get<string[]>('roles', context.getClass());
```

现在，当用户尝试调用没有足够权限的 `/cat` `POST` 端点时，`Nest` 会自动返回以下响应：

```typescript
{
  "statusCode": 403,
  "message": "Forbidden resource"
}
```

实际上，返回 `false` 的守护器强制 `Nest` 抛出一个 `HttpException` 异常。如果您想要向最终用户返回不同的错误响应，则应该引发异常.这个异常可以被异常过滤器捕获。

 ### 译者署名

| 用户名 | 头像 | 职能 | 签名 |
|---|---|---|---|
| [@zuohuadong](https://github.com/zuohuadong)  | <img class="avatar-66 rm-style" src="https://i.loli.net/2020/03/24/37yC4dntIcTHkLO.jpg">  |  翻译  | 专注于 caddy 和 nest，[@zuohuadong](https://github.com/zuohuadong/) at Github  |
| [@Drixn](https://drixn.com/)  | <img class="avatar-66 rm-style" src="https://cdn.drixn.com/img/src/avatar1.png">  |  翻译  | 专注于 nginx 和 C++，[@Drixn](https://drixn.com/) |
| [@havef](https://havef.github.io)  | <img class="avatar-66 rm-style" height="70" src="https://avatars1.githubusercontent.com/u/54462?s=460&v=4">  |  校正  | 数据分析、机器学习、TS/JS技术栈 [@havef](https://havef.github.io) |
