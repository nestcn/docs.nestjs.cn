# 看守器

看守器是一个使用 `@Guard()` 装饰器的类。 看守器应该使用 `CanActivate` 接口。

![](https://docs.nestjs.com/assets/Guards_1.png)

看守器有一个单独的责任。它们确定请求是否应该由路由处理程序处理。到目前为止, 访问限制逻辑大多在中间件内。这样很好, 因为诸如 token 验证或将req对象附加属性与特定路由没有强关联。

但中间件是非常笨的。它不知道调用 next() 函数后应该执行哪个处理程序。另一方面, 看守器可以访问 ExecutionContext 对象, 所以我们确切知道将要评估什么。

?> 守卫是在每个中间件之后执行的, 但在管道之前。

## 角色看守器

最好的用例之一就是基于角色的认证，因为只有当调用者具有足够的权限（例如管理员角色）时才能使用特定的路由。

这就是为什么我们要创建一个 `RolesGuard` ，这个看守器只允许具有特定角色的用户访问。

> roles.guard.ts

```typescript
import { Guard, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs/Observable';

@Guard()
export class RolesGuard implements CanActivate {
  canActivate(dataOrRequest, context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    return true;
  }
}
```

每个看守器提供一个 `canActivate()` 函数。看守器可能通过 `(Promise or Observable)` 同步或异步地返回它的布尔答案。返回值控制巢的行为：

* 如果它返回true，请求将由路由处理程序处理。
* 如果它返回false，Nest将返回一个 `Forbidden` 响应和一个403状态码。

`canActivate()` 函数有两个参数。第一个是 `dataOrRequest`。这个值取决于你实际使用守卫的位置。当它是一个HTTP请求时，这个变量是一个本地 `expressjs` 请求对象，否则，它是传递给微服务/或者套接字的数据。第二个参数是一个上下文。该对象满足 `ExecutionContext` 接口，并包含2个成员 `parent和handler`。父级保存处理程序所属的 `Controller` 类的类型。处理程序是对路由处理函数的引用。

!> 由于 `canActivate()` 方法可以返回一个 `Promise` ，它可以被标记为 `async` 。

## 用法

看守器可以是控制器范围的，方法范围的和全局范围的。为了建立卫兵，我们使用 `@UseGuards()` 装饰器。这个装饰器可以带来无数的参数。

> cats.controller.ts

```typescript
@Controller('cats')
@UseGuards(RolesGuard)
export class CatsController {}
```

!> `@UseGuards()` 修饰器是从 `@nestjs/common` 包中导入的。

上面的例子给每个由这个控制器声明的处理程序附加看守器。 如果我们决定只限制其中的一个，我们只需要在方法级别设置看守器。 要绑定全局看守器，我们使用 `Nest` 应用程序实例的 `useGlobalGuards()` 方法：

```typescript
const app = await NestFactory.create(ApplicationModule);
app.useGlobalGuards(new RolesGuard());
```

## 反射器

看守器在正常工作，但我们仍然没有利用最重要的看守器的特征，即执行上下文。

现在，`RolesGuard` 是不可重用的。 我们如何知道处理程序需要处理哪些角色？ `CatsController` 可以有很多。 有些可能只适用于管理员，一些适用于所有人。

这就是为什么与看守器一起，`Nest` 提供了通过 `@ReflectMetadata()` 装饰器附加自定义元数据的能力。

> cats.controller.ts

```typescript
@Post()
@ReflectMetadata('roles', ['admin'])
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}
```

!> `@ReflectMetadata()` 装饰器是从 `@nestjs/common` 包中导入的。

通过上面的构建，我们将角色元数据附加到 `create()` 方法。 直接使用 `@ReflectMetadata()` 并不是一个好习惯。 相反，你应该总是创建你自己的装饰器。

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

我们再来关注一下 `RolesGuard` 。 现在，它立即返回 `true` ，允许请求继续。 为了反映元数据，我们将使用在 `@nestjs/core` 中提供的反射器辅助类。

> roles.guard.ts

```typescript
import { Guard, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs/Observable';
import { Reflector } from '@nestjs/core';

@Guard()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(req, context: ExecutionContext): boolean {
    const { parent, handler } = context;
    const roles = this.reflector.get<string[]>('roles', handler);
    if (!roles) {
      return true;
    }

    const user = req.user;
    const hasRole = () => !!user.roles.find((role) => !!roles.find((item) => item === role));
    return user && user.roles && hasRole();
  }
}
```

!> 通知看守器的作用与控制器，组件，拦截器和中间件相同，它们可以通过构造函数注入依赖关系。

!> 在 `node.js` 世界中，将授权用户附加到 `req` 对象是一种常见的做法。 这就是为什么我们假定 `req.user` 包含用户对象。

反射器允许我们通过指定的键很容易地反映元数据。 在上面的例子中，我们反映了处理程序，因为它是对路由处理函数的引用。 如果我们也添加控制器反射部分，我们可以使这个警卫更通用。 为了提取控制器元数据，我们只是使用父代替处理函数。

```typescript
const roles = this.reflector.get<string[]>('roles', parent);
```

现在，当用户尝试调用没有足够权限的 `/cat` `POST` 端点时，`Nest` 会自动返回以下响应：

```typescript
{
  "statusCode": 403,
  "message": "Forbidden resource"
}
```

实际上，返回 `false` 的守护器强制 `Nest` 抛出一个 `HttpException` 异常。这个异常可以被异常过滤器捕获。

## 自定义错误响应

要更改默认访问拒绝响应，只需引发 `HttpException` 而不是返回 `false` 值。

## 全局守护器

全局守护器不属于任何范围。他们生活在模块之外，因此，他们不能注入依赖。我们需要立即创建一个实例。但是通常情况下，全球卫士依赖其他对象，例如，我们希望使用 `AuthService` 来验证请求，但是这个服务是`AuthModule` 的一部分。我们如何解决这个问题？

解决方案非常简单。实际上，每个 `Nest` 应用程序实例都是一个创建的 `Nest` 上下文。 `Nest` 上下文是 `Nest` 容器的一个包装，它包含所有实例化的类。我们可以直接使用应用程序对象从任何导入的模块中获取任何现有的实例。

假设我们有一个在 `AuthModule` 中注册的 `AuthGuard` 。这个 `AuthModule` 被导入到根模块中。我们可以使用以下语法选择 `AuthGuard` 实例：

```typescript
const app = await NestFactory.create(ApplicationModule);
const authGuard = app
  .select(AuthModule)
  .get(AuthGuard);

app.useGlobalGuards(authGuard);
```

要获取 `AuthGuard` 实例，我们必须使用2个方法，在下表中有详细描述：

|参数|描述|
|-----|-----|
|`get()` |使得可以检索已处理模块中可用的组件或控制器的实例。|
|`select()` |允许您浏览模块树，例如，从所选模块中提取特定实例。|

提示默认情况下选择根模块。 要选择任何其他模块，您需要遍历整个模块堆栈（逐步）。