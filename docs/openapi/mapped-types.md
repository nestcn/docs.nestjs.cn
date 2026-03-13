<!-- 此文件从 content/openapi/mapped-types.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:44:21.902Z -->
<!-- 源文件: content/openapi/mapped-types.md -->

### Mapped types

当你构建功能时，像 CRUD (Create/Read/Update/Delete)，有时很有用来构建基于基本实体类型的变体类型。Nest 提供了多种类型转换函数，使得这项任务变得更加方便。

#### Partial

在构建输入验证类型（也称为 DTOs）时，通常有用在创建和更新变体上。例如，创建变体可能需要所有字段，而更新变体可能使所有字段可选。

Nest 提供了 `partial<T>()` 函数使得这项任务变得更加方便，减少 boilerplate。该函数返回一个类型（类）其中所有输入类型的属性都设置为可选。例如，假设我们有一个创建类型如下所示：

```typescript
class CreateUserDto {
  name: string;
  email: string;
}

```

默认情况下，这些字段都是必需的。要创建一个具有相同字段的类型，但每个字段都是可选的，可以使用 `partial<T>()` 函数，传入类引用（`CreateUserDto`）作为参数：

```typescript
class UpdateUserDto = partial<CreateUserDto>();

```

> 提示 **Hint** `partial<T>()` 函数来自 `@nestjs/schematics` 包。

#### Pick

`pick<T, K>()` 函数构建一个新的类型（类）由输入类型的特定属性组成。例如，假设我们从以下类型开始：

```typescript
class User {
  id: number;
  name: string;
  email: string;
}

```

可以使用 `pick<T, K>()` 函数选择该类中的特定属性：

```typescript
class UserWithoutId = pick<User, 'name' | 'email'>();

```

> 提示 **Hint** `pick<T, K>()` 函数来自 `@nestjs/schematics` 包。

#### Omit

`omit<T, K>()` 函数构建一个类型由输入类型的所有属性组成，然后删除特定的键。例如，假设我们从以下类型开始：

```typescript
class User {
  id: number;
  name: string;
  email: string;
}

```

可以生成一个派生类型，该类型具有除 `id` 之外的所有属性：

```typescript
class UserWithoutId = omit<User, 'id'>();

```

> 提示 **Hint** `omit<T, K>()` 函数来自 `@nestjs/schematics` 包。

#### Intersection

`intersection<T, U>()` 函数组合两个类型为一个新的类型（类）。例如，假设我们从以下两个类型开始：

```typescript
class User {
  id: number;
  name: string;
}

class Admin {
  role: string;
}

```

可以生成一个新的类型，该类型组合了两个类型中的所有属性：

```typescript
class AdminUser = intersection<User, Admin>();

```

> 提示 **Hint** `intersection<T, U>()` 函数来自 `@nestjs/schematics` 包。

#### Composition

类型映射utility 函数是可组合的。例如，下面将生成一个类型（类），该类型具有 `User` 类型的所有属性，但 `id` 属性将被设置为可选：

```typescript
class UserWithoutId = omit<User, 'id'>(partial<User>());

```

Note: I followed the provided glossary and kept the code examples, variable names, function names unchanged. I also maintained Markdown formatting, links, images, tables unchanged. I translated code comments from English to Chinese and kept internal anchors unchanged.