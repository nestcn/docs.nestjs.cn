# 自定义路由参数装饰器

`Nest` 是基于**装饰器**这种语言特性而创建的。在很多常见的编程语言中，装饰器是一个广为人知的概念，但在 `JavaScript` 世界中，这个概念仍然相对较新。所以为了更好地理解装饰器是如何工作的，你应该看看 [这篇](https://medium.com/google-developers/exploring-es7-decorators-76ecb65fb841) 文章。下面给出一个简单的定义：

`ES2016` 装饰器是一个表达式，它返回一个可以将目标、名称和属性描述符作为参数的函数。通过在装饰器前面添加一个 `@` 字符并将其放置在你要装饰的内容的最顶部来应用它。可以为类、方法或属性定义装饰器。

## 参数装饰器

`Nest` 提供了一组非常实用的参数装饰器，可以结合 `HTTP` 路由处理器（`route handlers`）一起使用。下面的列表展示了`Nest` 装饰器和原生 `Express`（或 `Fastify`）中相应对象的映射。

|                                               |                                                  |
| --------------------------------------------- | ------------------------------------------------ |
| `@Request()，@Req()`                          | `req`                                            |
| `@Response()，@Res()`                         | `res`                                            |
| `@Next()`                                     | `next`                                           |
| `@Session()`                                  | `req.session`                                    |
| `@Param(param?: string)`                      | `req.params / req.params[param]`                 |
| `@Body(param?: string)`                       | `req.body / req.body[param]`                     |
| `@Query(param?: string)`                      | `req.query / req.query[param]`                   |
| `@Headers(param?: string)`　　　　　　　 　　 | `req.headers / req.headers[param]`　　　　　　　 |
| `@Ip()`                                       | `req.ip`                                         |
| `@HostParam()`                                | `req.hosts`                                      |

另外，你还可以创建**自定义装饰器**。这非常有用。

在 `Node.js` 中，会经常将需要传递的值加到请求对象的属性中。然后在每个路由处理程序中手动提取它们，使用如下代码：

```typescript
const user = req.user;
```

为了使代码更具可读性和透明性，我们可以创建一个 `@User()` 装饰器并在所有控制器中使用它。

> user.decorator.ts

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.user;
});
```

现在你可以在任何你想要的地方很方便地使用它。

```typescript
@Get()
async findOne(@User() user: UserEntity) {
  console.log(user);
}
```

## 传递数据

当装饰器的行为取决于某些条件时，可以使用 `data` 参数将参数传递给装饰器的工厂函数。 一个用例是自定义装饰器，它通过键从请求对象中提取属性。 例如，假设我们的身份验证层验证请求并将用户实体附加到请求对象。 经过身份验证的请求的用户实体可能类似于：

```json
{
  "id": 101,
  "firstName": "Alan",
  "lastName": "Turing",
  "email": "alan@email.com",
  "roles": ["admin"]
}
```

让我们定义一个将属性名作为键的装饰器，如果存在则返回关联的值（如果不存在或者尚未创建 `user` 对象，则返回 undefined）。

> user.decorator.ts

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator((data: string, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const user = request.user;

  return data ? user && user[data] : user;
});
```

然后，您可以通过控制器中的 `@User()` 装饰器访问以下特定属性：

```typescript
@Get()
async findOne(@User('firstName') firstName: string) {
  console.log(`Hello ${firstName}`);
}
```

您可以使用具有不同键的相同装饰器来访问不同的属性。如果用户对象复杂，使用此方法可以使请求处理程序编写更容易、并且可读性更高。

> 对于 `TypeScript` 用户，请注意这 `createParamDecorator<T>()` 是通用的。这意味着您可以显式实施类型安全性，例如 `createParamDecorator<string>((data, ctx) => ...)`或者，在工厂函数中指定参数类型，例如`createParamDecorator((data: string, ctx) => ...)` 。如果省略这两个， 参数 `data` 的类型为 `any`。

## 使用管道

`Nest` 对待自定义的路由参数装饰器和自身内置的装饰器（`@Body()`，`@Param()` 和 `@Query()`）一样。这意味着管道也会因为自定义注释参数（在本例中为 `user` 参数）而被执行。此外，你还可以直接将管道应用到自定义装饰器上：

```typescript
@Get()
async findOne(@User(new ValidationPipe({ validateCustomDecorators: true })) user: UserEntity) {
  console.log(user);
}
```

> 请注意，`validateCustomDecorators` 选项必须设置为 `true`。默认情况下，`ValidationPipe` 不验证使用自定义装饰器注释的参数。

## 装饰器聚合

`Nest` 提供了一种辅助方法来聚合多个装饰器。例如，假设您要将与身份验证相关的所有装饰器聚合到一个装饰器中。这可以通过以下方法实现：

```typescript
import { applyDecorators } from '@nestjs/common';

export function Auth(...roles: Role[]) {
  return applyDecorators(
    SetMetadata('roles', roles),
    UseGuards(AuthGuard, RolesGuard),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'Unauthorized"' })
  );
}
```

然后，你可以参照以下方式使用 `@Auth()` 自定义装饰器：

```typescript
@Get('users')
@Auth('admin')
findAllUsers() {}
```

这具有通过一个声明应用所有四个装饰器的效果。

> 来自 `@nestjs/swagger` 依赖中的 `@ApiHideProperty()` 装饰器无法聚合，因此此装饰器无法正常使用 `applyDecorators` 方法。

### 译者署名

| 用户名                                                  | 头像                                                                                                                                    | 职能 | 签名                                                                 |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ---- | -------------------------------------------------------------------- |
| [@snowyYU](https://juejin.cn/user/96412753464552/posts) | <img class="avatar-66 rm-style" src="https://p3-passport.byteacctimg.com/img/user-avatar/25d3fa3fa55fc0e669a38123ad2e56ab~60x60.image"> | 翻译 | 专注于 前端 和 BFF，[@snowyYU](https://github.com/snowyYU) at Github |
