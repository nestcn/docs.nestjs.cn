### 映射类型

在构建 **CRUD**（创建/读取/更新/删除）等功能时，基于基础实体类型创建变体通常很有用。Nest 提供了几个实用函数来执行类型转换，使这项任务更加便捷。

#### Partial（部分类型）

构建输入验证类型（也称为 DTO）时，通常需要在同一类型上创建 **create**（创建）和 **update**（更新）变体。例如，**create** 变体可能需要所有字段，而 **update** 变体则可能将所有字段设为可选。

Nest 提供了 `PartialType()` 实用函数来简化这一任务并减少样板代码。

`PartialType()` 函数返回一个类型（类），其中输入类型的所有属性都被设置为可选。例如，假设我们有一个如下所示的 **create** 类型：

```typescript
import { ApiProperty } from '@nestjs/swagger';

export class CreateCatDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  age: number;

  @ApiProperty()
  breed: string;
}
```

默认情况下，所有这些字段都是必填的。要创建一个具有相同字段但每个字段都可选的类型，可使用 `PartialType()` 并传入类引用（`CreateCatDto`）作为参数：

```typescript
export class UpdateCatDto extends PartialType(CreateCatDto) {}
```

:::info 提示
`PartialType()` 函数是从 `@nestjs/swagger` 包中导入的。
:::

#### Pick

`PickType()` 函数通过从输入类型中选择一组属性来构造新类型（类）。例如，假设我们从以下类型开始：

```typescript
import { ApiProperty } from '@nestjs/swagger';

export class CreateCatDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  age: number;

  @ApiProperty()
  breed: string;
}
```

我们可以使用 `PickType()` 实用函数从该类中选择一组属性：

```typescript
export class UpdateCatAgeDto extends PickType(CreateCatDto, ['age'] as const) {}
```

:::info 提示
`PickType()` 函数是从 `@nestjs/swagger` 包中导入的。
:::

#### Omit

`OmitType()` 函数通过从输入类型中选取所有属性，然后移除特定键集合来构造一个类型。例如，假设我们从以下类型开始：

```typescript
import { ApiProperty } from '@nestjs/swagger';

export class CreateCatDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  age: number;

  @ApiProperty()
  breed: string;
}
```

我们可以生成一个派生类型，该类型包含除**除** `name` 之外的所有属性，如下所示。在这个结构中，`OmitType` 的第二个参数是一个属性名称数组。

```typescript
export class UpdateCatDto extends OmitType(CreateCatDto, ['name'] as const) {}
```

:::info 提示
`OmitType()` 函数是从 `@nestjs/swagger` 包中导入的。
:::

#### 交叉类型

`IntersectionType()` 函数将两种类型合并为一个新类型（类）。例如，假设我们有以下两种类型：

```typescript
import { ApiProperty } from '@nestjs/swagger';

export class CreateCatDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  breed: string;
}

export class AdditionalCatInfo {
  @ApiProperty()
  color: string;
}
```

我们可以生成一个包含两种类型所有属性的新类型。

```typescript
export class UpdateCatDto extends IntersectionType(
  CreateCatDto,
  AdditionalCatInfo
) {}
```

:::info 提示
`IntersectionType()` 函数是从 `@nestjs/swagger` 包中导入的。
:::

#### 组合

类型映射工具函数是可组合的。例如，以下代码将生成一个类型（类），该类型包含除 `name` 之外 `CreateCatDto` 类型的所有属性，并且这些属性将被设置为可选：

```typescript
export class UpdateCatDto extends PartialType(
  OmitType(CreateCatDto, ['name'] as const)
) {}
```
