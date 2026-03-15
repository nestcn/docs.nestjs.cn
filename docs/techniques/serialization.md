<!-- 此文件从 content/techniques/serialization.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T05:14:02.508Z -->
<!-- 源文件: content/techniques/serialization.md -->

### 序列化

序列化是一个在网络响应返回对象之前发生的过程。这是一个适合在客户端返回数据之前提供转换和-sanitize规则的好地方。例如，敏感数据，如密码，应该总是从响应中排除。或者，某些属性可能需要额外的转换，例如，发送实体的子集属性。手动执行这些转换可能会繁琐且易出错，且可能会留下未考虑到的情况。

#### 概述

Nest 提供了一个内置的机制来帮助确保这些操作可以以直截的方式执行。`ClassSerializerInterceptor` 拦截器使用强大的 [class-transformer](https://github.com/typestack/class-transformer) 包来提供一个声明式和可扩展的方式来转换对象。该拦截器的基本操作是将方法处理器返回的值应用于 `instanceToPlain()` 函数，然后应用于实体/DTO 类的 `class-transformer` 装饰器，正如以下所述。

> 信息 **提示** 序列化不适用于 [StreamableFile](/techniques/streaming-files#streamable-file-类) 响应。

#### 排除属性

假设我们想自动排除一个 `password` 属性来自用户实体。我们将实体注释如下：

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

现在考虑一个控制器中的方法处理器，它返回实体类的实例。

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

> 警告 **提示** 我们必须返回实体类的实例。如果你返回一个纯 JavaScript 对象，例如 `{{ '{' }} user: new UserEntity() {{ '}' }}`，该对象将不会被正确地序列化。

> 信息 **提示** `ClassSerializerInterceptor` 来自 `@nestjs/common`。

当这个端点被请求时，客户端接收到的响应如下：

```json
{
  "id": 1,
  "firstName": "John",
  "lastName": "Doe"
}

```

注意拦截器可以在整个应用程序中应用（如 [here](/interceptors#绑定拦截器) 中所述）。结合拦截器和实体类声明 ensures that **任何** 方法返回实体类都会自动移除 `password` 属性。这给了你一个 centralized 循证的业务规则。

#### 显示属性

你可以使用 `@Expose()` 装饰器为属性提供别名或执行函数来计算属性值（类似于 **getter** 函数），如下所示。

```typescript
@Expose()
get fullName(): string {
  return `${this.firstName} ${this.lastName}`;
}

```

#### 转换

你可以使用 `@Transform()` 装饰器执行额外的数据转换。例如，以下 construct 返回 `RoleEntity` 的名称属性，而不是返回整个对象。

```typescript
@Transform(({ value }) => value.name)
role: RoleEntity;

```

#### 传递选项

你可能想修改转换函数的默认行为。要覆盖默认设置，使用 `options` 对象和 `@SerializeOptions()` 装饰器。

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

使用 `@SerializeOptions()` 传递的选项将作为下一个 `instanceToPlain()` 函数的第二个参数。在这个示例中，我们自动排除了所有开始于 `_` 前缀的属性。

#### 转换纯对象

你可以在控制器级别使用 `@SerializeOptions` 装饰器来强制执行转换。这样确保所有响应都将被转换为指定类的实例，应用于 class-validator 或 class-transformer 的装饰器，即使返回纯 JavaScript 对象。这使得代码更加简洁，不需要重复实例化类或调用 `plainToInstance`。

在以下示例中，尽管在条件分支中返回纯 JavaScript 对象，但是它们将自动被转换为 `UserEntity` 实例，应用于相应的装饰器：

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

> 信息 **提示** 指定控制器的预期返回类型，可以使用 TypeScript 的类型检查来确保返回的纯对象符合 DTO 或实体的形状。 `plainToInstance` 函数不提供这个级别的类型 hinting，这可能会导致潜在的错误如果纯对象不匹配预期的 DTO 或实体结构。

#### 示例

一个工作示例可在 [here](https://github.com/nestjs/nest/tree/master/sample/21-serializer) 中找到。

#### WebSocket 和微服务

虽然这个章节使用 HTTP 风格应用程序（例如 Express 或 Fastify）的示例，但是 `ClassSerializerInterceptor` 在 WebSockets 和微服务中同样有效，无论使用哪种传输方法。

#### 学习更多

阅读更多关于 `class-transformer` 包提供的装饰器和选项的信息 [here](https://github.com/typestack/class-transformer)。