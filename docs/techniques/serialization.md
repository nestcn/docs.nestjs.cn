<!-- 此文件从 content/techniques/serialization.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:32:43.418Z -->
<!-- 源文件: content/techniques/serialization.md -->

### 序列化

序列化是对象在网络响应中返回之前发生的过程。这是一个适合在客户端返回数据时提供转换和-sanitizing-规则的好地方。例如，敏感数据如密码应该总是从响应中排除。或者，某些属性可能需要额外的转换，如发送实体的特定子集。手动执行这些转换可能会很麻烦和不确定是否涵盖了所有情况。

#### 概述

Nest 提供了一个内置的能力来帮助确保这些操作可以以一种直截了当的方式进行。`ClassSerializerInterceptor` 拦截器使用了强大的 [class-transformer](https://github.com/typestack/class-transformer) 包来提供一种声明式和可扩展的方式来转换对象。基本的操作是将方法处理器返回的值应用于 `instanceToPlain()` 函数，从 [class-transformer](https://github.com/typestack/class-transformer) 中获取该函数。这样可以应用于实体/DTO 类的 `class-transformer` 装饰器，正如下面所述。

> info **提示** 序列化不适用于 [StreamableFile](/techniques/streaming-files#streamable-file-类) 响应。

#### 排除属性

假设我们想自动排除一个 `password` 属性从用户实体中。我们将实体标注如下：

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

现在考虑一个控制器，它具有一个返回实体类实例的方法处理器。

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

> **警告** 请注意，我们必须返回实体类的实例。如果您返回一个简单的 JavaScript 对象，例如 `{{ '{' }} user: new UserEntity() {{ '}' }}`，那么对象将不会被正确序列化。

> info **提示** `ClassSerializerInterceptor` 来自 `@nestjs/common`。

当这个端点被请求时，客户端收到以下响应：

```json
{
  "id": 1,
  "firstName": "John",
  "lastName": "Doe"
}

```

注意拦截器可以在应用程序范围内应用（如 [here](/interceptors#绑定拦截器) 中所述）。实体类声明和拦截器的组合确保了任何返回实体类实例的方法都将删除 `password` 属性。这给了你一个中央约束的业务规则。

#### expose 属性

您可以使用 `@Expose()` 装饰器为属性提供别名或执行函数来计算属性值（类似于 **getter** 函数），如以下所示。

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

您可能想修改默认行为的转换函数。要覆盖默认设置，请在 `options` 对象中传递它们，使用 `@SerializeOptions()` 装饰器。

```typescript
@SerializeOptions({
  excludePrefixes: ['_'],
})
@Get()
findOne(): UserEntity {
  return new UserEntity();
}

```

> info **提示** `@SerializeOptions()` 装饰器来自 `@nestjs/common`。

传递的 `@SerializeOptions()` 选项将作为 `instanceToPlain()` 函数的第二个参数。例如，我们自动排除了所有以 `_` 前缀开头的属性。

#### 转换 plain 对象

您可以在控制器级别强制执行转换，使用 `@SerializeOptions` 装饰器。这确保了所有响应都将被转换为指定类的实例，应用于 class-validator 或 class-transformer 的装饰器，即使返回 plain 对象也是如此。这approach leads to cleaner code without the need to repeatedly instantiate the class or call `plainToInstance`.

在以下示例中，尽管在两个条件分支中都返回 plain JavaScript 对象，但是它们将被自动转换为 `UserEntity` 实例，应用于相关装饰器：

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

> info **提示** 通过指定控制器的预期返回类型，您可以利用 TypeScript 的类型检查能力来确保返回的 plain 对象符合 DTO 或实体的shape。`plainToInstance` 函数不提供这种级别的类型提示，这可能会导致潜在的bug，如果 plain 对象不匹配预期的 DTO 或实体结构。

#### 示例

一个工作示例可在 [here](https://github.com/nestjs/nest/tree/master/sample/21-serializer) 中找到。

#### WebSockets 和微服务

虽然这个章节展示了使用 HTTP 风格应用程序（例如 Express 或 Fastify）的示例，但 `ClassSerializerInterceptor` 对 WebSockets 和微服务也同样有效，不管使用哪种传输方法。

#### 了解更多

了解更多关于 `class-transformer` 包的可用装饰器和选项，请访问 [here](https://github.com/typestack/class-transformer)。