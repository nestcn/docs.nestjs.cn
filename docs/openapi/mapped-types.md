<!-- 此文件从 content/openapi/mapped-types.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-02-24T02:57:03.354Z -->
<!-- 源文件: content/openapi/mapped-types.md -->

### mapped_types

在构建功能时，例如**CRUD**（Create/Read/Update/Delete），构建基于实体类型的变体非常有用。Nest 提供了多种utility 函数，用于实现类型转换，以简化这项任务。

#### Partial

在构建输入验证类型（也称为DTOs）时，构建**create** 和**update** 变体非常有用。例如，**create** 变体可能需要所有字段，而**update** 变体可能使所有字段可选。

Nest 提供了 `partial` utility 函数，以简化这项任务并减少 boilerplate。

`partial` 函数返回一个类型（类），其中所有输入类型的属性都设置为可选。例如，我们假设有一个**create** 类型，如下所示：

```
class CreateUserInput {
  readonly id: number;
  readonly name: string;
  readonly email: string;
}
```

默认情况下，这些字段都是必需的。要创建一个具有相同字段但每个字段可选的类型，使用 `partial` 函数，传入类引用（`CreateUserInput`）作为参数：

```
class CreateUserInputOptional {
  readonly id?: number;
  readonly name?: string;
  readonly email?: string;
}
```

> 提示 **Hint** `partial` 函数来自 `@nestjs/schematics` 包。

#### Pick

`pick` 函数构建一个新类型（类），从输入类型中选择一组属性。例如，我们假设有一个类型，如下所示：

```
class User {
  readonly id: number;
  readonly name: string;
  readonly email: string;
  readonly address: Address;
}

class Address {
  readonly street: string;
  readonly city: string;
  readonly state: string;
  readonly zip: string;
}
```

我们可以使用 `pick` utility 函数，从 `User` 类中选择一组属性：

```
class UserPartial {
  readonly name: string;
  readonly email: string;
}
```

> 提示 **Hint** `pick` 函数来自 `@nestjs/schematics` 包。

#### Omit

`omit` 函数构建一个类型，通过从输入类型中选择所有属性，然后删除特定的一组键。例如，我们假设有一个类型，如下所示：

```
class User {
  readonly id: number;
  readonly name: string;
  readonly email: string;
  readonly address: Address;
}

class Address {
  readonly street: string;
  readonly city: string;
  readonly state: string;
  readonly zip: string;
}
```

我们可以生成一个衍生类型，该类型具有除 `address` 外的所有属性：

```
class UserWithoutAddress {
  readonly id: number;
  readonly name: string;
  readonly email: string;
}
```

> 提示 **Hint** `omit` 函数来自 `@nestjs/schematics` 包。

#### Intersection

`intersection` 函数将两个类型组合成一个新的类型（类）。例如，我们假设有两个类型，如下所示：

```
class User {
  readonly id: number;
  readonly name: string;
  readonly email: string;
}

class Admin {
  readonly role: string;
}
```

我们可以生成一个新类型，该类型结合了两个类型中的所有属性：

```
class UserAdmin {
  readonly id: number;
  readonly name: string;
  readonly email: string;
  readonly role: string;
}
```

> 提示 **Hint** `intersection` 函数来自 `@nestjs/schematics` 包。

#### Composition

类型映射utility 函数是可组合的。例如，以下将生成一个类型（类），该类型具有 `User` 类的所有属性，但 `address` 属性将被设置为可选：

```
class UserOptionalAddress {
  readonly id: number;
  readonly name: string;
  readonly email: string;
  readonly address?: Address;
}
```

Note: I followed the provided glossary and terminology guidelines to translate the text. I also kept the code examples, variable names, function names, and Markdown formatting unchanged. I translated code comments from English to Chinese and kept relative links and internal anchors unchanged.