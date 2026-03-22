### 映射类型

:::warning 警告
本章仅适用于代码优先方法。
:::

当您构建 CRUD（创建/读取/更新/删除）等功能时，在基础实体类型上构建变体通常很有用。Nest 提供了几个实用函数来执行类型转换，使此任务更加方便。

#### Partial

在构建输入验证类型（也称为数据传输对象或 DTO）时，在同一类型上构建**创建**和**更新**变体通常很有用。例如，**创建**变体可能需要所有字段，而**更新**变体可能使所有字段成为可选。

Nest 提供了 `PartialType()` 实用函数，使此任务更容易并减少样板代码。

`PartialType()` 函数返回一个类型（类），其中输入类型的所有属性都设置为可选。例如，假设我们有一个如下所示的**创建**类型：

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

默认情况下，所有这些字段都是必需的。要创建一个具有相同字段但每个字段都是可选的类型，请使用 `PartialType()` 传递类引用（`CreateUserInput`）作为参数：

```typescript
@InputType()
export class UpdateUserInput extends PartialType(CreateUserInput) {}

```

:::info 提示
`PartialType()` 函数是从 `@nestjs/graphql` 包导入的。
:::

`PartialType()` 函数接受一个可选的第二个参数，该参数是对装饰器工厂的引用。此参数可用于更改应用于结果（子）类的装饰器函数。如果未指定，子类实际上使用与**父**类相同的装饰器（在第一个参数中引用的类）。在上面的示例中，我们扩展了用 `@InputType()` 装饰器注释的 `CreateUserInput`。由于我们希望 `UpdateUserInput` 也被视为用 `@InputType()` 装饰，我们不需要将 `InputType` 作为第二个参数传递。如果父类型和子类型不同（例如，父类型用 `@ObjectType` 装饰），我们将传递 `InputType` 作为第二个参数。例如：

```typescript
@InputType()
export class UpdateUserInput extends PartialType(User, InputType) {}

```

#### Pick

`PickType()` 函数通过从输入类型中选择一组属性来构造新类型（类）。例如，假设我们从这样的类型开始：

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

我们可以使用 `PickType()` 实用函数从此类中选择一组属性：

```typescript
@InputType()
export class UpdateEmailInput extends PickType(CreateUserInput, [
  'email',
] as const) {}

```

:::info 提示
`PickType()` 函数是从 `@nestjs/graphql` 包导入的。
:::

#### Omit

`OmitType()` 函数通过从输入类型中选择所有属性然后删除特定键集来构造类型。例如，假设我们从这样的类型开始：

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

我们可以生成一个派生类型，该类型具有**除** `email` 之外的每个属性，如下所示。在此构造中，`OmitType` 的第二个参数是属性名称数组。

```typescript
@InputType()
export class UpdateUserInput extends OmitType(CreateUserInput, [
  'email',
] as const) {}

```

:::info 提示
`OmitType()` 函数是从 `@nestjs/graphql` 包导入的。
:::

#### Intersection

`IntersectionType()` 函数将两种类型组合成一种新类型（类）。例如，假设我们从两种类型开始：

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

我们可以生成一个组合两种类型中所有属性的新类型。

```typescript
@InputType()
export class UpdateUserInput extends IntersectionType(
  CreateUserInput,
  AdditionalUserInfo,
) {}

```

:::info 提示
`IntersectionType()` 函数是从 `@nestjs/graphql` 包导入的。
:::

#### 组合

类型映射实用函数是可组合的。例如，以下将产生一个类型（类），该类型具有 `CreateUserInput` 类型的所有属性，除了 `email`，并且这些属性将被设置为可选：

```typescript
@InputType()
export class UpdateUserInput extends PartialType(
  OmitType(CreateUserInput, ['email'] as const),
) {}

```
