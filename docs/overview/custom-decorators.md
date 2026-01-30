### 自定义路由装饰器

Nest 的核心构建基于一种称为**装饰器**的语言特性。装饰器在许多常用编程语言中是个广为人知的概念，但在 JavaScript 领域仍相对较新。为了更好地理解装饰器的工作原理，我们建议阅读[这篇文章](https://medium.com/google-developers/exploring-es7-decorators-76ecb65fb841) 。这里给出一个简单定义：

:::
ES2016 装饰器是一个返回函数的表达式，可以接收目标对象、名称和属性描述符作为参数。使用时需要在装饰目标上方添加 `@` 字符前缀。装饰器可以定义在类、方法或属性上。
:::

#### 参数装饰器

Nest 提供了一组实用的**参数装饰器** ，可与 HTTP 路由处理程序结合使用。以下是提供的装饰器及其对应的原生 Express（或 Fastify）对象列表：

<table>
  <tbody>
    <tr>
      <td><code>@Request(), @Req()</code></td>
      <td><code>req</code></td>
    </tr>
    <tr>
      <td><code>@Response(), @Res()</code></td>
      <td><code>res</code></td>
    </tr>
    <tr>
      <td><code>@Next()</code></td>
      <td><code>next</code></td>
    </tr>
    <tr>
      <td><code>@Session()</code></td>
      <td><code>req.session</code></td>
    </tr>
    <tr>
      <td><code>@Param(param?: string)</code></td>
      <td><code>req.params</code> / <code>req.params[param]</code></td>
    </tr>
    <tr>
      <td><code>@Body(param?: string)</code></td>
      <td><code>req.body</code> / <code>req.body[param]</code></td>
    </tr>
    <tr>
      <td><code>@Query(param?: string)</code></td>
      <td><code>req.query</code> / <code>req.query[param]</code></td>
    </tr>
    <tr>
      <td><code>@Headers(param?: string)</code></td>
      <td><code>req.headers</code> / <code>req.headers[param]</code></td>
    </tr>
    <tr>
      <td><code>@Ip()</code></td>
      <td><code>req.ip</code></td>
    </tr>
    <tr>
      <td><code>@HostParam()</code></td>
      <td><code>req.hosts</code></td>
    </tr>
  </tbody>
</table>

此外，你可以创建自己的**自定义装饰器**。为什么这很有用？

在 node.js 领域，通常的做法是将属性附加到 **request** 对象上。然后在每个路由处理程序中手动提取它们，使用如下代码

```typescript
const user = req.user;
```

为了让您的代码更具可读性和透明性，您可以创建一个 `@User()` 装饰器，并在所有控制器中重复使用它。

 ```typescript title="user.decorator.ts"
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
```

然后，您可以在任何符合需求的地方直接使用它。

```typescript
@Get()
async findOne(@User() user: UserEntity) {
  console.log(user);
}
```

#### 传递数据

当装饰器的行为取决于某些条件时，您可以使用 `data` 参数向装饰器工厂函数传递参数。一个典型应用场景是通过键名从请求对象中提取属性的自定义装饰器。例如，假设我们的[认证层](/security/authentication)会验证请求并将用户实体附加到请求对象上。经过认证的请求可能包含如下用户实体：

```json
{
  "id": 101,
  "firstName": "Alan",
  "lastName": "Turing",
  "email": "alan@email.com",
  "roles": ["admin"]
}
```

让我们定义一个装饰器，它接收属性名作为键，若存在则返回关联值（若不存在或 `user` 对象尚未创建，则返回 undefined）。

 ```typescript title="user.decorator.ts"
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);
```

以下是您可以通过控制器中的 `@User()` 装饰器访问特定属性的方式：

```typescript
@Get()
async findOne(@User('firstName') firstName: string) {
  console.log(`Hello ${firstName}`);
}
```

您可以使用相同的装饰器搭配不同的键来访问不同的属性。如果 `user` 对象具有深层或复杂的结构，这种方式能使请求处理程序的实现更简单且更具可读性。

:::info 提示
对于 TypeScript 用户，请注意 `createParamDecorator<T>()` 是一个泛型。这意味着您可以显式地强制类型安全，例如 `createParamDecorator<string>((data, ctx) => ...)` 。或者，在工厂函数中指定参数类型，例如 `createParamDecorator((data: string, ctx) => ...)` 。如果两者都省略，则 `data` 的类型将为 `any`。
:::

#### 使用管道

Nest 对待自定义参数装饰器的方式与内置装饰器（`@Body()`、`@Param()` 和 `@Query()`）相同。这意味着管道也会对自定义注解参数执行（在我们的示例中就是 `user` 参数）。此外，您可以直接将管道应用于自定义装饰器：

```typescript
@Get()
async findOne(
  @User(new ValidationPipe({ validateCustomDecorators: true }))
  user: UserEntity,
) {
  console.log(user);
}
```

:::info 注意
需要将 `validateCustomDecorators` 选项设置为 true。默认情况下 `ValidationPipe` 不会验证带有自定义装饰器注解的参数。
:::


#### 装饰器组合

Nest 提供了一个辅助方法来组合多个装饰器。例如，假设您希望将与身份验证相关的所有装饰器合并为一个装饰器。可以通过以下构造实现：

 ```typescript title="auth.decorator.ts"
import { applyDecorators } from '@nestjs/common';

export function Auth(...roles: Role[]) {
  return applyDecorators(
    SetMetadata('roles', roles),
    UseGuards(AuthGuard, RolesGuard),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );
}
```

然后您可以按如下方式使用这个自定义的 `@Auth()` 装饰器:

```typescript
@Get('users')
@Auth('admin')
findAllUsers() {}
```

这样就可以通过声明一个装饰器从而包含四个装饰器的效果。

:::warning 警告
从 `@nestjs/swagger` 包引入的 `@ApiHideProperty()` 装饰器不可组合，并且无法与 `applyDecorators` 函数一起使用。
:::

