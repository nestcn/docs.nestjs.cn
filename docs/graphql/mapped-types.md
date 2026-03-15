<!-- 此文件从 content/graphql/mapped-types.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T05:10:24.649Z -->
<!-- 源文件: content/graphql/mapped-types.md -->

### mapped 类型

> warning **警告** 本章只适用于代码优先approach。

当您构建CRUD（Create/Read/Update/Delete）功能时，构建base 实体类型的变体非常有用。Nest 提供了一些utility 函数，用于对类型进行转换，以便更方便地实现此任务。

#### Partial

在构建输入验证类型（也称为数据传输对象或DTO）时，通常有用的是构建**create** 和**update** 类型的变体。例如，**create** 类型可能需要所有字段，而**update** 类型可能使所有字段成为可选字段。

Nest 提供了 `pickPartial` 函数，使得此任务变得更容易，减少 boilerplate。

`pickPartial` 函数返回一个类型（class），其中所有输入类型的属性都被设置为可选。例如，如果我们有一个**create** 类型如下所示：

```typescript title="原始类型"
class CreateUser {
  readonly id: number;
  readonly name: string;
  readonly email: string;
}

```

默认情况下，这些字段都是必需的。要创建一个类型，其中每个字段都是可选的，可以使用 `pickPartial` 函数，传入类引用（`CreateUser`）作为参数：

```typescript title="可选类型"
class CreateUserOptional extends pickPartial(CreateUser) {
  // 类型保持不变
}

```

> info **提示** `pickPartial` 函数来自 `@nestjs/common` 包。

#### Pick

`pick` 函数构建一个新类型（class），其中选择了输入类型的一组属性。例如，如果我们从以下类型开始：

```typescript title="原始类型"
class User {
  readonly id: number;
  readonly name: string;
  readonly email: string;
  readonly phone: string;
}

```

我们可以使用 `pick` 函数选择一组属性：

```typescript title="选择类型"
class UserWithIdAndName extends pick(User, ['id', 'name']) {
  // 类型保持不变
}

```

> info **提示** `pick` 函数来自 `@nestjs/common` 包。

#### Omit

`omit` 函数构建一个类型，通过从输入类型中选择所有属性，然后移除特定的键。例如，如果我们从以下类型开始：

```typescript title="原始类型"
class User {
  readonly id: number;
  readonly name: string;
  readonly email: string;
  readonly phone: string;
}

```

我们可以生成一个派生类型，该类型除了 __phone__ 属性外具有每个属性：

```typescript title="排除类型"
class UserWithoutPhone extends omit(User, ['phone']) {
  // 类型保持不变
}

```

> info **提示** `omit` 函数来自 `@nestjs/common` 包。

#### Intersection

`intersection` 函数将两个类型组合成一个新类型（class）。例如，如果我们从以下两个类型开始：

```typescript title="原始类型 1"
class User {
  readonly id: number;
  readonly name: string;
}

class Admin {
  readonly role: string;
}

```

我们可以生成一个新类型，该类型将两个类型的所有属性合并：

```typescript title="交叉类型"
class UserAndAdmin extends intersection(User, Admin) {
  // 类型保持不变
}

```

> info **提示** `intersection` 函数来自 `@nestjs/common` 包。

#### Composition

类型映射utility 函数是可组合的。例如，以下将生成一个类型（class），其中除了 __phone__ 属性外具有每个属性，并且这些属性将被设置为可选：

```typescript title="组合类型"
class UserWithoutPhoneOptional extends omit(pick(User, ['id', 'name']), ['phone']) {
  // 类型保持不变
}

```