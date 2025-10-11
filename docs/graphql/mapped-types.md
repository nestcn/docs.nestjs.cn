### 映射类型

:::warning 警告
本章仅适用于代码优先方法。
:::

在构建 CRUD（创建/读取/更新/删除）等功能时，基于基础实体类型构造变体通常很有用。Nest 提供了几个实用函数来执行类型转换，使这一任务更加便捷。

#### Partial（部分类型）

构建输入验证类型（也称为数据传输对象 DTO）时，通常需要在同一类型上创建 **create** 和 **update** 变体。例如，**create** 变体可能要求所有字段必填，而 **update** 变体则可能将所有字段设为可选。

Nest 提供了 `PartialType()` 实用函数来简化这一任务并减少样板代码。

`PartialType()` 函数返回一个类型（类），其中输入类型的所有属性都被设置为可选。例如，假设我们有一个如下所示的 **create** 类型：

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

默认情况下，所有这些字段都是必填的。要创建一个具有相同字段但每个字段都可选的类型，可以使用 `PartialType()` 并传入类引用（`CreateUserInput`）作为参数：

```typescript
@InputType()
export class UpdateUserInput extends PartialType(CreateUserInput) {}
```

:::info 提示
`PartialType()` 函数是从 `@nestjs/graphql` 包中导入的。
:::

`PartialType()` 函数接受一个可选的第二个参数，该参数是对装饰器工厂的引用。此参数可用于更改应用于结果（子）类的装饰器函数。如果未指定，子类实际上会使用与**父**类（第一个参数引用的类）相同的装饰器。在上面的示例中，我们正在扩展用 `@InputType()` 装饰器注解的 `CreateUserInput`。由于我们希望 `UpdateUserInput` 也被视为使用 `@InputType()` 装饰，因此无需将 `InputType` 作为第二个参数传递。如果父类型和子类型不同（例如父类用 `@ObjectType` 装饰），我们会将 `InputType` 作为第二个参数传递。例如：

```typescript
@InputType()
export class UpdateUserInput extends PartialType(User, InputType) {}
```

#### 选取

`PickType()` 函数通过从输入类型中选择一组属性来构造新类型（类）。例如，假设我们从以下类型开始：

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

我们可以使用 `PickType()` 实用函数从该类中选择一组属性：

```typescript
@InputType()
export class UpdateEmailInput extends PickType(CreateUserInput, [
  'email',
] as const) {}
```

:::info 提示
`PickType()` 函数是从 `@nestjs/graphql` 包中导入的。
:::

#### 省略

`OmitType()` 函数通过从输入类型中选取所有属性，然后移除特定键集合来构造一个类型。例如，假设我们从以下类型开始：

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

我们可以生成一个派生类型，该类型包含除 **除了** `email` 之外的所有属性，如下所示。在这个构造中，`OmitType` 的第二个参数是一个属性名称数组。

```typescript
@InputType()
export class UpdateUserInput extends OmitType(CreateUserInput, [
  'email',
] as const) {}
```

:::info 提示
`OmitType()` 函数是从 `@nestjs/graphql` 包中导入的。
:::

#### 交叉类型

`IntersectionType()` 函数将两种类型合并为一个新类型（类）。例如，假设我们有以下两种类型：

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

我们可以生成一个包含两种类型所有属性的新类型。

```typescript
@InputType()
export class UpdateUserInput extends IntersectionType(
  CreateUserInput,
  AdditionalUserInfo
) {}
```

:::info 提示
`IntersectionType()` 函数是从 `@nestjs/graphql` 包中导入的。
:::

#### 组合

类型映射工具函数是可组合的。例如，以下代码将生成一个类型（类），该类型包含 `CreateUserInput` 类型的所有属性（除 `email` 外），且这些属性将被设置为可选：

```typescript
@InputType()
export class UpdateUserInput extends PartialType(
  OmitType(CreateUserInput, ['email'] as const)
) {}
```
