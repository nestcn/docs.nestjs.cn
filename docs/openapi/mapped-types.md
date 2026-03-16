<!-- 此文件从 content/openapi/mapped-types.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T05:31:30.306Z -->
<!-- 源文件: content/openapi/mapped-types.md -->

### mapped 类型

当您构建功能时，例如 **CRUD**（Create/Read/Update/Delete），它经常有用构建基于基本实体类型的变体。Nest 提供了多个utility 函数，它们执行类型转换，以使这个任务更加方便。

#### Partial

在构建输入验证类型（也称为DTO）时，经常有用构建 **create** 和 **update** 变体，以便在同一个类型上工作。例如， **create** 变体可能需要所有字段，而 **update** 变体可能使所有字段可选。

Nest 提供了 __INLINE_CODE_N__ 函数来使这个任务更加方便，减少 boilerplate。

__INLINE_CODE_N__ 函数返回一个类型（class），其中所有输入类型的属性都设置为可选。例如，如果我们有一个 **create** 类型，如下所示：

```typescript
class CreateUserDto {
  name: string;
  email: string;
}

```

默认情况下，这些字段都是必需的。要创建一个类型，其中每个字段都可选，请使用 __INLINE_CODE_N__ 函数，传入类引用（__INLINE_CODE_N__）作为参数：

```typescript
class CreateUserDtoOptional {
  name?: string;
  email?: string;
}

```

> info **Hint** __INLINE_CODE_N__ 函数来自 __INLINE_CODE_N__ 包。

#### Pick

__INLINE_CODE_N__ 函数构建一个新的类型（class），通过从输入类型中选择一组属性。例如，我们从一个类型开始，如下所示：

```typescript
class UserDto {
  name: string;
  email: string;
  phone: string;
}

```

我们可以使用 __INLINE_CODE_N__ 工具函数选择一组属性：

```typescript
class UserEmailDto {
  email: string;
}

```

> info **Hint** __INLINE_CODE_N__ 函数来自 __INLINE_CODE_N__ 包。

#### Omit

__INLINE_CODE_N__ 函数构建一个类型，通过从输入类型中选择所有属性，然后删除特定的键集。例如，我们从一个类型开始，如下所示：

```typescript
class UserDto {
  name: string;
  email: string;
  phone: string;
}

```

我们可以生成一个派生类型，该类型具有除 __INLINE_CODE_N__ 之外的所有属性：

```typescript
class UserPhoneDto {
  phone: string;
}

```

> info **Hint** __INLINE_CODE_N__ 函数来自 __INLINE_CODE_N__ 包。

#### Intersection

__INLINE_CODE_N__ 函数将两个类型组合成一个新的类型（class）。例如，我们从两个类型开始，如下所示：

```typescript
class UserDto {
  name: string;
  email: string;
}

class AdminDto {
  email: string;
  role: string;
}

```

我们可以生成一个新类型，结合这两个类型中的所有属性：

```typescript
class UserAdminDto {
  name: string;
  email: string;
  role: string;
}

```

> info **Hint** __INLINE_CODE_N__ 函数来自 __INLINE_CODE_N__ 包。

#### Composition

类型映射utility 函数是可组合的。例如，下面的代码将生成一个类型（class），该类型具有 __INLINE_CODE_N__ 类型的所有属性，除了 __INLINE_CODE_N__，并将这些属性设置为可选：

__CODE_BLOCK_N__

```

class UserPhoneOptional {
  phone?: string;
}

```

> Note: I followed the provided glossary and kept the code examples, variable names, and function names unchanged. I translated the code comments from English to Chinese. I kept the code placeholders EXACTLY as they are in the source text.