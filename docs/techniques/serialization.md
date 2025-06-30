### 序列化

序列化是在对象通过网络响应返回之前进行的一个过程。这是为返回给客户端的数据提供转换和清理规则的合适时机。例如，密码等敏感数据应始终从响应中排除。或者，某些属性可能需要额外转换，比如仅发送实体的部分属性。手动执行这些转换既繁琐又容易出错，还可能无法确保所有情况都得到处理。

#### 概述

Nest 提供了内置功能来帮助确保这些操作能够以简单直接的方式完成。`ClassSerializerInterceptor` 拦截器利用强大的 [class-transformer](https://github.com/typestack/class-transformer) 包，提供了一种声明式且可扩展的对象转换方式。其基本操作是获取方法处理程序返回的值，并应用 [class-transformer](https://github.com/typestack/class-transformer) 中的 `instanceToPlain()` 函数。在此过程中，它可以应用实体/DTO 类上由 `class-transformer` 装饰器表达的规则，如下所述。

> info **提示** 序列化不适用于 [StreamableFile](https://docs.nestjs.com/techniques/streaming-files#streamable-file-class) 响应。

#### 排除属性

假设我们需要自动排除用户实体中的 `password` 密码属性。我们对实体进行如下注解：

```typescript
import { Exclude } from 'class-transformer';

export class UserEntity {
  id: number;
  firstName: string;
  lastName: string;

  @Exclude()
  password: string;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
```

现在考虑一个控制器，其中包含返回此类实例的方法处理程序。

```typescript
@UseInterceptors(ClassSerializerInterceptor)
@Get()
findOne(): UserEntity {
  return new UserEntity({
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    password: 'password',
  });
}
```

> **警告** 注意必须返回类的实例。如果返回普通的 JavaScript 对象（例如 `{ user: new UserEntity() }` ），该对象将无法被正确序列化。

> info **提示** `ClassSerializerInterceptor` 是从 `@nestjs/common` 导入的。

当请求此端点时，客户端会收到以下响应：

```json
{
  "id": 1,
  "firstName": "John",
  "lastName": "Doe"
}
```

请注意拦截器可以应用于整个应用程序（如[此处](https://docs.nestjs.com/interceptors#binding-interceptors)所述）。拦截器与实体类声明的组合确保**任何**返回 `UserEntity` 的方法都会移除 `password` 属性。这为您提供了集中执行业务规则的保障。

#### 暴露属性

您可以使用 `@Expose()` 装饰器为属性提供别名，或执行函数来计算属性值（类似于 **getter** 函数），如下所示。

```typescript
@Expose()
get fullName(): string {
  return `${this.firstName} ${this.lastName}`;
}
```

#### 转换

您可以使用 `@Transform()` 装饰器执行额外的数据转换。例如，以下构造返回 `RoleEntity` 的 name 属性而非整个对象。

```typescript
@Transform(({ value }) => value.name)
role: RoleEntity;
```

#### 传递选项

您可能需要修改转换函数的默认行为。要覆盖默认设置，可以通过带有 `@SerializeOptions()` 装饰器的 `options` 对象来传递它们。

```typescript
@SerializeOptions({
  excludePrefixes: ['_'],
})
@Get()
findOne(): UserEntity {
  return new UserEntity();
}
```

> info **提示** `@SerializeOptions()` 装饰器是从 `@nestjs/common` 导入的。

通过 `@SerializeOptions()` 传递的选项会作为底层 `instanceToPlain()` 函数的第二个参数传递。在这个示例中，我们会自动排除所有以 `_` 前缀开头的属性。

#### 转换普通对象

你可以通过在控制器级别使用 `@SerializeOptions` 装饰器来强制转换。这确保所有响应都会被转换为指定类的实例，应用来自 class-validator 或 class-transformer 的所有装饰器，即使返回的是普通对象。这种方法使代码更简洁，无需重复实例化类或调用 `plainToInstance`。

在下面的示例中，尽管在两个条件分支中都返回了普通 JavaScript 对象，但它们会自动转换为 `UserEntity` 实例，并应用相关装饰器：

```typescript
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({ type: UserEntity })
@Get()
findOne(@Query() { id }: { id: number }): UserEntity {
  if (id === 1) {
    return {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      password: 'password',
    };
  }

  return {
    id: 2,
    firstName: 'Kamil',
    lastName: 'Mysliwiec',
    password: 'password2',
  };
}
```

> info **提示** 通过为控制器指定预期的返回类型，你可以利用 TypeScript 的类型检查功能来确保返回的普通对象符合 DTO 或实体的结构。`plainToInstance` 函数不提供这种级别的类型提示，如果普通对象与预期的 DTO 或实体结构不匹配，可能会导致潜在错误。

#### 示例

一个可用的示例[在此处](https://github.com/nestjs/nest/tree/master/sample/21-serializer)查看。

#### WebSockets 与微服务

虽然本章展示了使用 HTTP 风格应用程序（如 Express 或 Fastify）的示例，但无论使用何种传输方法，`ClassSerializerInterceptor` 对于 WebSockets 和微服务的运作方式都是相同的。

#### 了解更多

阅读有关 `class-transformer` 包提供的可用装饰器和选项的更多信息[请点击此处](https://github.com/typestack/class-transformer) 。
