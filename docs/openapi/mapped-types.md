<!-- 此文件从 content/openapi/mapped-types.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T04:49:26.517Z -->
<!-- 源文件: content/openapi/mapped-types.md -->

### mapped 类型

当你构建功能像 **CRUD** (Create/Read/Update/Delete)时，构建基元类型的变体非常有用。Nest 提供了多种实用函数，用于类型转换，简化这个任务。

#### Partial

在构建输入验证类型（也称为 DTOs）时，通常需要构建 **create** 和 **update** 变体类型。例如， **create** 变体可能需要所有字段，而 **update** 变体可能使所有字段可选。

Nest 提供了 `partial<T>()` 实用函数，使得这个任务变得更加简洁，减少 boilerplate。

`partial<T>()` 函数返回一个类型（class），其中所有输入类型的属性都被设置为可选。例如，如果我们有一个 **create** 类型如下所示：

```typescript
class CreateDTO {
  id: number;
  name: string;
  email: string;
}

```

默认情况下，这些字段都是必需的。要创建一个具有相同字段，但每个字段都是可选的类型，可以使用 `partial<T>()` 函数，传入类引用（`CreateDTO`）作为参数：

```typescript
class UpdateDTO = partial<CreateDTO>();

```

> info **提示** `partial<T>()` 函数来自 `@nestjs/schematics` 包。

#### Pick

`pick<T, K>()` 函数构建一个新类型（class），从输入类型中选择一组属性。例如，如果我们从开始一个类型：

```typescript
class User {
  id: number;
  name: string;
  email: string;
  password: string;
}

```

可以使用 `pick<T, K>()` 实用函数选择一组属性：

```typescript
class UserView = pick<User, 'name' | 'email'>();

```

> info **提示** `pick<T, K>()` 函数来自 `@nestjs/schematics` 包。

#### Omit

`omit<T, K>()` 函数构建一个类型，首先从输入类型中选择所有属性，然后删除特定的键。例如，如果我们从开始一个类型：

```typescript
class User {
  id: number;
  name: string;
  email: string;
  password: string;
}

```

可以生成一个衍生类型，该类型具有除 `password` 外的所有属性：

```typescript
class UserView = omit<User, 'password'>();

```

> info **提示** `omit<T, K>()` 函数来自 `@nestjs/schematics` 包。

#### Intersection

`intersection<T, U>()` 函数将两个类型组合成一个新的类型（class）。例如，如果我们从开始两个类型：

```typescript
class User {
  id: number;
  name: string;
}
class Admin extends User {
  role: string;
}

```

可以生成一个新类型，该类型组合了两个类型中的所有属性：

```typescript
class AdminUser = intersection<User, Admin>();

```

> info **提示** `intersection<T, U>()` 函数来自 `@nestjs/schematics` 包。

#### Composition

类型映射实用函数是可组合的。例如，以下将生成一个类型（class），该类型具有 `User` 类型的所有属性，除了 `password`，并且这些属性将被设置为可选：

```typescript
class AdminUser = partial<omit<User, 'password'>>();

```

> info **提示** 上述示例的实现方式可能会因实际情况而异。