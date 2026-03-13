### 自定义路由装饰器

Nest 是围绕一种称为**装饰器**的语言特性构建的。装饰器在许多常用的编程语言中是一个众所周知的概念，但在 JavaScript 世界中，它们仍然相对较新。为了更好地理解装饰器如何工作，我们建议阅读 [这篇文章](https://medium.com/google-developers/exploring-es7-decorators-76ecb65fb841)。以下是一个简单的定义：

<blockquote class="external">
  ES2016 装饰器是一个返回函数的表达式，可以将目标、名称和属性描述符作为参数。
  你通过在装饰器前加上 <code>@</code> 字符并将其放在你要装饰的内容的最顶部来应用它。装饰器可以为类、方法或属性定义。
</blockquote>

#### 参数装饰器

Nest 提供了一组有用的**参数装饰器**，你可以将它们与 HTTP 路由处理程序一起使用。以下是提供的装饰器列表及其代表的普通 Express（或 Fastify）对象

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

在 node.js 世界中，将属性附加到**请求**对象是常见的做法。然后你在每个路由处理程序中手动提取它们，使用如下代码：

```typescript
const user = req.user;

```

为了使你的代码更可读和透明，你可以创建一个 `@User()` 装饰器并在所有控制器中重用它。

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

```

然后，你可以在任何适合你要求的地方使用它。

```typescript
@Get()
async findOne(@User() user: UserEntity) {
  console.log(user);
}

```

#### 传递数据

当你的装饰器的行为取决于某些条件时，你可以使用 `data` 参数将参数传递给装饰器的工厂函数。这种情况的一个用例是通过键从请求对象中提取属性的自定义装饰器。例如，假设我们的 <a href="techniques/authentication#implementing-passport-strategies">认证层</a> 验证请求并将用户实体附加到请求对象。已认证请求的用户实体可能如下所示：

```json
{
  "id": 101,
  "firstName": "Alan",
  "lastName": "Turing",
  "email": "alan@email.com",
  "roles": ["admin"]
}

```

让我们定义一个装饰器，它接受属性名称作为键，并返回关联的值（如果存在）（或者如果不存在，或者 `user` 对象尚未创建，则返回 undefined）。

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);

export const User = createParamDecorator((data, ctx) => {
  const request = ctx.switchToHttp().getRequest();
  const user = request.user;

  return data ? user && user[data] : user;
});

```

以下是你如何通过控制器中的 `@User()` 装饰器访问特定属性：

```typescript
@Get()
async findOne(@User('firstName') firstName: string) {
  console.log(`Hello ${firstName}`);
}

```

你可以使用不同的键使用同一个装饰器来访问不同的属性。如果 `user` 对象很深或很复杂，这可以使请求处理程序实现更容易和更可读。

> info **提示** 对于 TypeScript 用户，请注意 `createParamDecorator<T>()` 是一个泛型。这意味着你可以显式强制类型安全，例如 `createParamDecorator<string>((data, ctx) => ...)`。或者，在工厂函数中指定参数类型，例如 `createParamDecorator((data: string, ctx) => ...)`。如果你同时省略两者，`data` 的类型将是 `any`。

#### 与管道一起使用

Nest 以与内置装饰器（`@Body()`、`@Param()` 和 `@Query()`）相同的方式处理自定义参数装饰器。这意味着管道也会为自定义注释的参数（在我们的示例中是 `user` 参数）执行。此外，你可以直接将管道应用于自定义装饰器：

```typescript
@Get()
async findOne(
  @User(new ValidationPipe({ validateCustomDecorators: true }))
  user: UserEntity,
) {
  console.log(user);
}

```

> info **提示** 请注意，`validateCustomDecorators` 选项必须设置为 true。`ValidationPipe` 默认不会验证使用自定义装饰器注释的参数。

#### 装饰器组合

Nest 提供了一个辅助方法来组合多个装饰器。例如，假设你想将所有与认证相关的装饰器组合成一个装饰器。这可以通过以下结构完成：

```typescript
import { applyDecorators } from '@nestjs/common';

export function Auth(...roles: Role[]) {
  return applyDecorators(
    SetMetadata('roles', roles),
    UseGuards(AuthGuard, RolesGuard),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );
}

export function Auth(...roles) {
  return applyDecorators(
    SetMetadata('roles', roles),
    UseGuards(AuthGuard, RolesGuard),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );
}

```

然后你可以如下使用这个自定义 `@Auth()` 装饰器：

```typescript
@Get('users')
@Auth('admin')
findAllUsers() {}

```

这具有通过单个声明应用所有四个装饰器的效果。

> warning **警告** 来自 `@nestjs/swagger` 包的 `@ApiHideProperty()` 装饰器不可组合，并且与 `applyDecorators` 函数一起使用时不能正常工作。
