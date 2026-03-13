<!-- 此文件从 content/techniques/serialization.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:55:08.746Z -->
<!-- 源文件: content/techniques/serialization.md -->

### 序列化

序列化是发生在网络响应返回对象之前的过程。这是将数据传递给客户端的适当位置。例如，敏感数据，如密码，应该始终从响应中排除。或，某些属性可能需要额外的转换，例如，只发送实体的子集属性。手动执行这些转换可能会很繁琐和容易出错，且可能留下无法覆盖所有情况的疑问。

#### 概述

Nest 提供了一个内置的能力来帮助确保这些操作可以以直观的方式进行。`ClassSerializerInterceptor` 拦截器使用强大的 [class-transformer](https://github.com/typestack/class-transformer) 包来提供一个声明式且可扩展的方式来转换对象。它的基本操作是将方法处理程序返回的值应用于 `instanceToPlain()` 函数，从 [class-transformer](https://github.com/typestack/class-transformer) 中获取。这样，它可以应用于实体/DTO 类的规则，正如下面所述。

> 信息 **提示** 序列化不适用于 [StreamableFile](/techniques/streaming-files#streamable-file-类) 响应。

#### 排除属性

假设我们想要自动排除一个 `password` 属性来自用户实体。我们将实体注解如下：

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

现在考虑一个控制器方法处理程序，它返回这个类的实例。

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

> 警告 **提示** 我们必须返回这个类的实例。如果你返回一个plain JavaScript 对象，例如 `{{ '{' }} user: new UserEntity() {{ '}' }}`，那么对象将不会被正确序列化。

> 信息 **提示** `ClassSerializerInterceptor` 从 `@nestjs/common` 中导入。

当这个端点被请求时，客户端将收到以下响应：

```json
{
  "id": 1,
  "firstName": "John",
  "lastName": "Doe"
}

```

请注意，拦截器可以应用于整个应用程序（如 [here](/interceptors#绑定拦截器) 中所述）。实体类声明和拦截器的组合确保了任何方法返回 `UserEntity` 将确保删除 `password` 属性。这为您提供了集中化的业务规则执行。

#### 暴露属性

您可以使用 `@Expose()` 装饰器为属性提供别名或执行函数来计算属性值（类似于 **getter** 函数），如下所示。

```typescript
@Expose()
get fullName(): string {
  return `${this.firstName} ${this.lastName}`;
}

```

#### 转换

您可以使用 `@Transform()` 装饰器执行附加数据转换。例如，以下构造返回 `RoleEntity` 的名称属性，而不是返回整个对象。

```typescript
@Transform(({ value }) => value.name)
role: RoleEntity;

```

#### 传递选项

您可能想要修改转换函数的默认行为。要覆盖默认设置，请使用 `options` 对象与 `@SerializeOptions()` 装饰器。

```typescript
@SerializeOptions({
  excludePrefixes: ['_'],
})
@Get()
findOne(): UserEntity {
  return new UserEntity();
}

```

> 信息 **提示** `@SerializeOptions()` 装饰器来自 `@nestjs/common`。

通过 `@SerializeOptions()` 传递的选项将作为 `instanceToPlain()` 函数的第二个参数。在这个示例中，我们自动排除了所有以 `_` 前缀开头的属性。

#### 转换plain 对象

您可以在控制器级别使用 `@SerializeOptions` 装饰器来强制执行转换。这样，即使返回 plain 对象，它们也将被自动转换为指定类的实例，应用于 class-validator 或 class-transformer 的装饰器。这种方法使代码更加简洁，不需要重复地实例化类或调用 `plainToInstance`。

在以下示例中，尽管在两个条件分支中返回 plain JavaScript 对象，但是它们将被自动转换为 `UserEntity` 实例，应用于相关装饰器：

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

> 信息 **提示** 指定控制器的预期返回类型可以使用 TypeScript 的类型检查能力来确保返回的 plain 对象满足 DTO 或实体的形状。`plainToInstance` 函数不提供这个级别的类型提示，这可能会导致潜在的错误如果 plain 对象不符合期望的 DTO 或实体结构。

#### 示例

一个工作示例可以在 [here](https://github.com/nestjs/nest/tree/master/sample/21-serializer) 中找到。

#### WebSocket 和微服务

虽然本章中的示例使用了 HTTP 风格的应用程序（例如 Express 或 Fastify），但是 `ClassSerializerInterceptor` 与 WebSockets 和微服务相同，不管使用哪种传输方法。

#### 学习更多

阅读更多关于 `class-transformer` 包提供的装饰器和选项的信息 [here](https://github.com/typestack/class-transformer)。