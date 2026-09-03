<!-- 此文件从 content/techniques/serialization.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-09-03T12:02:06.103Z -->
<!-- 源文件: content/techniques/serialization.md -->

### 序列化

序列化是在对象返回网络响应之前发生的过程。这是为返回给客户端的数据提供转换和净化规则的合适位置。例如，密码等敏感数据应始终从响应中排除。或者，某些属性可能需要额外的转换，例如仅发送实体的属性子集。手动执行这些转换可能既繁琐又容易出错，并且可能让您不确定是否已覆盖所有情况。

#### 概述

Nest 提供了一种内置能力，以确保这些操作可以以直接的方式执行。`ClassSerializerInterceptor` 拦截器利用强大的 [class-transformer](https://github.com/typestack/class-transformer) 包，提供了一种声明式且可扩展的对象转换方式。它执行的基本操作是获取方法处理器返回的值，并应用来自 [class-transformer](https://github.com/typestack/class-transformer) 的 `instanceToPlain()` 函数。在此过程中，它可以应用由实体/数据传输对象类上的 `class-transformer` 装饰器表达的规则，如下所述。

Nest 还内置了用于 schema-first 响应塑造的 `StandardSchemaSerializerInterceptor`。当您希望出站响应由 [Standard Schema](https://standardschema.dev/) 兼容的模式（而非 `class-transformer` 装饰器）进行验证或转换时，请使用它。

> info **提示** 序列化不适用于 [StreamableFile](/techniques/streaming-files#streamable-file-类) 响应。

#### 排除属性

假设我们想要自动从用户实体中排除 `password` 属性。我们按如下方式注解实体：

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

现在考虑一个控制器，其方法处理器返回此类的实例。

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

> warning **警告** 请注意，我们必须返回类的实例。如果您返回普通 JavaScript 对象，例如 `{ user: new UserEntity() }`，则该对象将无法被正确序列化。

> info **提示** `ClassSerializerInterceptor` 从 `@nestjs/common` 导入。

当请求此端点时，客户端会收到以下响应：

```json
{
  "id": 1,
  "firstName": "John",
  "lastName": "Doe"
}

```

请注意，拦截器可以应用在应用全局（如 [here](/overview/interceptors#绑定拦截器) 所述）。拦截器与实体类声明的组合确保**任何**返回 `UserEntity` 的方法都将确保移除 `password` 属性。这为您提供了对此业务规则的集中执行措施。

#### 暴露属性

您可以使用 `@Expose()` 装饰器为属性提供别名，或执行函数来计算属性值（类似于 **getter** 函数），如下所示。

```typescript
@Expose()
get fullName(): string {
  return `${this.firstName} ${this.lastName}`;
}

```

#### 转换

您可以使用 `@Transform()` 装饰器执行额外的数据转换。例如，以下构造返回 `RoleEntity` 的 name 属性，而不是返回整个对象。

```typescript
@Transform(({ value }) => value.name)
role: RoleEntity;

```

#### 传递选项

您可能希望修改转换函数的默认行为。要覆盖默认设置，请使用 `@SerializeOptions()` 装饰器将它们传入 `options` 对象中。

```typescript
@SerializeOptions({
  excludePrefixes: ['_'],
})
@Get()
findOne(): UserEntity {
  return new UserEntity();
}

```

> info **提示** `@SerializeOptions()` 装饰器从 `@nestjs/common` 导入。

通过 `@SerializeOptions()` 传递的选项将作为底层 `instanceToPlain()` 函数的第二个参数传递。在此示例中，我们自动排除所有以 `_` 前缀开头的属性。

`@SerializeOptions()` 也可以与 `StandardSchemaSerializerInterceptor` 一起使用：

```typescript
@UseInterceptors(StandardSchemaSerializerInterceptor)
@SerializeOptions({ schema: userResponseSchema })
@Get(':id')
findOne(@Param('id') id: string) {
  return this.usersService.findOne(id);
}

```

如果您的模式库通过 Standard Schema 接口支持额外的验证选项，您还可以传递 `validateOptions`。

#### 转换普通对象

您可以通过使用 `@SerializeOptions` 装饰器在控制器级别强制执行转换。这确保了所有响应都被转换为指定类的实例，应用来自 class-validator 或 class-transformer 的任何装饰器，即使返回的是普通对象也是如此。这种方法使代码更简洁，无需重复实例化类或调用 `plainToInstance`。

在下面的示例中，尽管在两个条件分支中都返回了普通 JavaScript 对象，它们将被自动转换为 `UserEntity` 实例，并应用相关的装饰器：

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

> info **提示** 通过为控制器指定预期的返回类型，您可以利用 TypeScript 的类型检查能力来确保返回的普通对象符合数据传输对象或实体的形状。`plainToInstance` 函数不提供这种级别的类型提示，如果普通对象与预期的数据传输对象或实体结构不匹配，可能会导致潜在的错误。

#### 示例

一个可用的示例可在 [here](https://github.com/nestjs/nest/tree/master/sample/21-serializer) 获取。

#### WebSockets 和微服务

虽然本章展示的是使用 HTTP 风格应用（例如 Express 或 Fastify）的示例，但 `ClassSerializerInterceptor` 对于 WebSockets 和微服务同样适用，无论使用何种传输方法。

#### 了解更多

阅读更多关于 `class-transformer` 包提供的可用装饰器和选项，请参阅 [here](https://github.com/typestack/class-transformer)。

如果您更喜欢 schema 驱动的序列化，请将 `StandardSchemaSerializerInterceptor` 与 `@SerializeOptions()` 及其 `schema` 选项一起使用。