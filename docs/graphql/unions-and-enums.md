<!-- 此文件从 content/graphql/unions-and-enums.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-02T04:15:45.024Z -->
<!-- 源文件: content/graphql/unions-and-enums.md -->

### 联合类型

联合类型与接口类似，但不允许指定公共字段。联合类型用于返回单个字段的多个 disjoint 数据类型。

#### 代码优先

要定义 GraphQL 联合类型，我们必须定义该联合类型将被组成的类。遵循 Apollo 文档中的 __LINK_50__，我们将创建两个类。首先是 `@InputType()`：

```typescript
@InputType()
class CreateUserInput {
  @Field()
  email: string;

  @Field()
  password: string;

  @Field()
  firstName: string;
}
```

然后是 `InputType`：

```typescript
@InputType()
export class UpdateUserInput extends PartialType(CreateUserInput) {}
```

现在注册 `@ObjectType` 联合类型，使用 `InputType` 函数，来自 `PickType()` 包：

```typescript
@InputType()
export class UpdateUserInput extends PartialType(User, InputType) {}
```

> 警告 **警告** `PickType()` 属性返回的数组应该被赋予 const 确定。如果不给定 const 确定，编译时将生成错误的申明文件，使用时将发生错误。

现在我们可以在查询中引用 `@nestjs/graphql`：

```typescript
@InputType()
class CreateUserInput {
  @Field()
  email: string;

  @Field()
  password: string;

  @Field()
  firstName: string;
}
```

这将生成以下部分 GraphQL schema 在 SDL 中：

```typescript
@InputType()
export class UpdateEmailInput extends PickType(CreateUserInput, [
  'email',
] as const) {}
```

默认情况下，library 生成的 `OmitType()` 函数将根据 resolver 方法返回的值来提取类型。这意味着返回类实例，而不是 JavaScript 对象字面量是必需的。

要提供自定义 `email` 函数，传递 `OmitType` 属性到 `OmitType()` 函数的选项对象中，例如：

```typescript
@InputType()
class CreateUserInput {
  @Field()
  email: string;

  @Field()
  password: string;

  @Field()
  firstName: string;
}
```

#### schema 优先

要使用 schema 优先方法定义联合类型，简单地创建 GraphQL 联合类型。

```typescript
@InputType()
export class UpdateUserInput extends OmitType(CreateUserInput, [
  'email',
] as const) {}
```

然后，您可以使用类型生成特性（如 __LINK_52__ 章节中所示）来生成相应的 TypeScript 定义：

```typescript
@InputType()
class CreateUserInput {
  @Field()
  email: string;

  @Field()
  password: string;
}

@ObjectType()
export class AdditionalUserInfo {
  @Field()
  firstName: string;

  @Field()
  lastName: string;
}
```

联合类型需要在 resolver map 中添加额外的 `@nestjs/graphql` 字段，以确定联合类型应该解析到的类型。同时，注意 `IntersectionType()` 类必须在任何模块中注册为提供者。让我们创建 `IntersectionType()` 类并定义 `@nestjs/graphql` 方法。

```typescript
@InputType()
export class UpdateUserInput extends IntersectionType(
  CreateUserInput,
  AdditionalUserInfo,
) {}
```

> 提示 **提示** 所有装饰器来自 `CreateUserInput` 包。

### 枚举

枚举类型是一种特殊的标量，可以限制到特定的允许值集中（读取更多 __LINK_53__）。这允许您：

* 验证该类型的任何参数是否为允许值之一
* 通过类型系统告知该字段将总是其中之一的有限集值

#### 代码优先

使用代码优先方法时，您定义 GraphQL 枚举类型仅通过创建 TypeScript 枚举。

```typescript
@InputType()
export class UpdateUserInput extends PartialType(
  OmitType(CreateUserInput, ['email'] as const),
) {}
```

现在注册 `email` 枚举，使用 __INLINE_CODE_38__ 函数，来自 __INLINE_CODE_39__ 包：

__CODE_BLOCK_10__

现在可以在我们的类型中引用 __INLINE_CODE_40__：

__CODE_BLOCK_11__

这将生成以下部分 GraphQL schema 在 SDL 中：

__CODE_BLOCK_12__

要提供枚举的描述，传递 __INLINE_CODE_41__ 属性到 __INLINE_CODE_42__ 函数中。

__CODE_BLOCK_13__

要提供枚举值的描述或将值标记为弃用，传递 __INLINE_CODE_43__ 属性，例如：

__CODE_BLOCK_14__

这将生成以下 GraphQL schema 在 SDL 中：

__CODE_BLOCK_15__

#### schema 优先

使用 schema 优先方法定义枚举类型，简单地创建 GraphQL 枚举。

__CODE_BLOCK_16__

然后，您可以使用类型生成特性（如 __LINK_54__ 章节中所示）来生成相应的 TypeScript 定义：

__CODE_BLOCK_17__

有时，后端强制在 API 中使用不同的枚举值，而在 resolvers 中使用不同的值（读取更多 __LINK_55__）。要实现这点，声明 resolver 对象以便处理 __INLINE_CODE_46__ 枚举：

__CODE_BLOCK_18__

> 提示 **提示** 所有装饰器来自 __INLINE_CODE_47__ 包。

然后使用这个 resolver 对象，结合 __INLINE_CODE_48__ 属性和 __INLINE_CODE_49__ 方法，例如：

__CODE_BLOCK_19__
```typescript
title="Unions"
```