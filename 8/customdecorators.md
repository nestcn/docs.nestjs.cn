# 自定义路由参数装饰器

`Nest` 是基于**装饰器**这种语言特性而创建的。它是许多常用编程语言中众所周知的概念，但在 `JavaScript` 世界中，这个概念仍然相对较新。所以为了更好地理解装饰器是如何工作的，你应该看看 [这篇](https://medium.com/google-developers/exploring-es7-decorators-76ecb65fb841) 文章。下面给出一个简单的定义：

`ES2016` 的装饰器是一个可以将目标对象，名称和属性描述符作为参数的返回函数的表达式。你可以通过装饰器前缀 `@` 来使用它，并将其放置在您想要装饰的最顶端。装饰器可以被定义为一个类或是属性。

## 参数装饰器

`Nest` 提供了一组有用的参数装饰器，可以和 `HTTP` 路由处理器（`route handlers`）一起使用。下面是一组装饰器和普通表达式对象的对照。

|                                           |                                              |
| ----------------------------------------- | -------------------------------------------- |
| `@Request()`                                | `req`                                          |
| `@Response()`                               | `res`                                          |
| `@Next()`                                   | `next`                                         |
| `@Session()`                                | `req.session`                                 |
| `@Param(param?: string)`                     | `req.params / req.params[param]`               |
| `@Body(param?: string)`                     | `req.body / req.body[param]`                   |
| `@Query(param?: string)`                   | `req.query / req.query[param]`                 |
| `@Headers(param?: string)`　　　　　　　   　　| `req.headers / req.headers[param]`　　　　　　　 |
| `@Ip()`| `req.ip` | 

另外，你还可以创建**自定义装饰器**。为什么它很有用呢？

在 `Node.js` 的世界中，把属性值附加到 **request** 对象中是一种很常见的做法。然后你可以在任何时候在路由处理程器（`route handlers`）中手动取到它们，例如，使用下面这个构造：

```typescript
const user = req.user;
```

为了使其更具可读性和透明性，我们可以创建 `@User()` 装饰器并且在所有控制器中重复利用它。

> user.decorator.ts

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
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

让我们定义一个将属性名作为键的装饰器，如果存在则返回关联的值（如果不存在或者尚未创建 `user` 对象，则返回undefined）。

> user.decorator.ts

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return data ? user && user[data] : user;
  },
);
```

然后，您可以通过控制器中的 `@User()` 装饰器访问以下特定属性：

```typescript
@Get()
async findOne(@User('firstName') firstName: string) {
  console.log(`Hello ${firstName}`);
}
```

您可以使用具有不同键的相同装饰器来访问不同的属性。如果用户对象复杂，这可以使请求处理程序实现更容易、更可读。

?> 对于 `TypeScript` 用户，请注意这 `createParamDecorator<T>()` 是通用的。这意味着您可以显式实施类型安全性，例如 `createParamDecorator<string>((data, ctx) => ...)`或者，在工厂功能中指定参数类型，例如`createParamDecorator((data: string, ctx) => ...)` 。如果省略这两个，该类型 `data` 会 `any`。

## 使用管道

`Nest` 对待自定义的路由参数装饰器和这些内置的装饰器（`@Body()`，`@Param()` 和 `@Query()`）一样。这意味着管道也会因为自定义注释参数（在本例中为 `user` 参数）而被执行。此外，你还可以直接将管道应用到自定义装饰器上： 

```typescript
@Get()
async findOne(@User(new ValidationPipe()) user: UserEntity) {
  console.log(user);
}
```

`Nest` 提供了一种辅助方法来组成多个装饰器。例如，假设您要将与身份验证相关的所有装饰器组合到一个装饰器中。这可以通过以下构造完成：

```typescript
import { applyDecorators } from '@nestjs/common';

export function Auth(...roles: Role[]) {
  return applyDecorators(
    SetMetadata('roles', roles),
    UseGuards(AuthGuard, RolesGuard),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'Unauthorized"' }),
  );
}
```

然后，您可以 `@Auth()` 按以下方式使用此自定义装饰器：

```typescript
@Get('users')
@Auth('admin')
findAllUsers() {}
```

这具有通过一个声明应用所有四个装饰器的效果。

包装中的 `@ApiHideProperty()` 装饰器 `@nestjs/swagger` 无法组合，因此无法正常使用该 `applyDecorators` 功能。


 ### 译者署名

| 用户名 | 头像 | 职能 | 签名 |
|---|---|---|---|
| [@zuohuadong](https://www.zhihu.com/people/dongcang)  | <img class="avatar-66 rm-style" src="https://pic.downk.cc/item/5f4cafe7160a154a67c4047b.jpg">  |  翻译  | 专注于 caddy 和 nest，[@zuohuadong](https://github.com/zuohuadong/) at Github  |
| [@Drixn](https://drixn.com/)  | <img class="avatar-66 rm-style" src="https://cdn.drixn.com/img/src/avatar1.png">  |  翻译  | 专注于 nginx 和 C++，[@Drixn](https://drixn.com/) |
| [@Armor](https://github.com/Armor-cn)  | <img class="avatar-66 rm-style" height="70" src="https://avatars3.githubusercontent.com/u/31821714?s=460&v=4">  |  翻译  | 专注于 Java 和 Nest，[@Armor](https://armor.ac.cn/) | 
| [@franken133](https://github.com/franken133)  | <img class="avatar rounded-2" src="https://avatars0.githubusercontent.com/u/17498284?s=400&amp;u=aa9742236b57cbf62add804dc3315caeede888e1&amp;v=4" height="70">  |  翻译  | 专注于 java 和 nest，[@franken133](https://github.com/franken133)|
