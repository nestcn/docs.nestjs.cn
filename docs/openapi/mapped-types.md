<!-- 此文件从 content/openapi/mapped-types.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-02T04:14:09.646Z -->
<!-- 源文件: content/openapi/mapped-types.md -->

### mapped 类型

在构建特性时，如**CRUD**（Create/Read/Update/Delete），构造基于基本实体类型的变体非常有用。Nest 提供了多种实用函数，可以对类型进行转换以使这个任务更方便。

#### Partial

在构建输入验证类型（也称为 DTOs）时，构建**create**和**update**变体在同一个类型上非常有用。例如，**create**变体可能需要所有字段，而**update**变体可能使所有字段可选。

Nest 提供了 `partial<T>()` 实用函数，以便简化这个任务并减少 boilerplate。

`partial<T>()` 函数返回一个类型（class），其中所有输入类型的属性都设置为可选。例如，假设我们有一个**create**类型如下所示：

```typescript title="Create"
export class CreateUserDto {
  @IsString()
  @IsOptional()
  name: string;
  @IsString()
  @IsOptional()
  email: string;
}
```

默认情况下，这些字段都是必需的。要创建一个具有相同字段但每个字段都是可选的类型，请使用 `partial<T>()` 函数，传入类引用（`CreateUserDto`）作为参数：

```typescript title="Update"
export class UpdateUserDto extends partial<CreateUserDto> {
  // ...
}
```

> 信息 **Hint** `partial<T>()` 函数来自 `@nestjs/common` 包。

#### Pick

`pick<T, K>()` 函数构建一个新的类型（class），根据输入类型选择一个属性集。例如，我们可以从以下类型中选择一个属性集：

```typescript title="User"
export class User {
  id: number;
  name: string;
  email: string;
}
```

使用 `pick<T, K>()` 实用函数，可以选择一个属性集：

```typescript title="UserSummary"
export class UserSummary extends pick<User, 'name' | 'email'> {
  // ...
}
```

> 信息 **Hint** `pick<T, K>()` 函数来自 `@nestjs/common` 包。

#### Omit

`omit<T, K>()` 函数构建一个类型，根据输入类型选择所有属性，然后将特定的键集删除。例如，我们可以从以下类型中生成一个 Derived 类型，该类型具有除 `id` 外的所有属性：

```typescript title="User"
export class User {
  id: number;
  name: string;
  email: string;
}
```

使用 `omit<T, K>()` 实用函数，可以生成一个 Derived 类型：

```typescript title="UserSummary"
export class UserSummary extends omit<User, 'id'> {
  // ...
}
```

> 信息 **Hint** `omit<T, K>()` 函数来自 `@nestjs/common` 包。

#### Intersection

`intersection<T, U>()` 函数将两个类型组合成一个新的类型（class）。例如，我们可以从以下两个类型中生成一个新的类型：

```typescript title="User"
export class User {
  id: number;
  name: string;
}

```typescript title="Admin"
export class Admin {
  id: number;
  role: string;
}
```

使用 `intersection<T, U>()` 实用函数，可以生成一个新的类型：

```typescript title="AdminUser"
export class AdminUser extends intersection<User, Admin> {
  // ...
}
```

> 信息 **Hint** `intersection<T, U>()` 函数来自 `@nestjs/common` 包。

#### Composition

类型映射实用函数是可组合的。例如，以下将生成一个类型（class），该类型具有 `User` 类型的所有属性，除 `id` 外，且这些属性将设置为可选：

```typescript title="UserSummary"
export class UserSummary extends partial<omit<User, 'id'>> {
  // ...
}
```

> 信息 **Hint** 请注意，这个示例中使用了 `partial` 和 `omit` 函数的组合。