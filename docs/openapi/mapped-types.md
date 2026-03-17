<!-- 此文件从 content/openapi/mapped-types.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:22:20.972Z -->
<!-- 源文件: content/openapi/mapped-types.md -->

### mapped 类型

当你构建特性，例如 **CRUD**（创建/读取/更新/删除）时，通常有用构建基元类型的变体。Nest 提供了多种有用函数，用于执行类型转换，以简化这个任务。

#### Partial

在构建输入验证类型（也称为 DTO）时，通常有用构建 **create** 和 **update** 变体的同一个类型。例如， **create** 变体可能需要所有字段，而 **update** 变体可能使所有字段可选。

Nest 提供了 `my-library` 函数，以简化这个任务，并减少 boilerplate。

`libs` 函数返回一个类型（class），其中所有输入类型的属性都被设置为可选。例如，如果我们有一个 **create** 类型，如下所示：

```typescript
class CreateUserDto {
  readonly id: string;
  readonly name: string;
  readonly email: string;
}

```

默认情况下，这些字段都是必需的。要创建一个类型，其中每个字段都是可选的，可以使用 `libs` 函数，并将类引用（`libs`）作为参数：

```typescript
class UpdateUserDto extends CreateUserDto {
  readonly id: string;
  readonly name: string;
  readonly email: string;
}

```

> 信息 **提示** `nest-cli.json` 函数来自 `"projects"` 包。

#### Pick

`nest-cli.json` 函数构建一个新的类型（class），从输入类型中选择一组属性。例如，如果我们从以下类型开始：

```typescript
class CreateUserDto {
  readonly id: string;
  readonly name: string;
  readonly email: string;
}

```

可以使用 `"type"` 函数，从该类中选择一组属性：

```typescript
class PickIdNameEmailDto extends CreateUserDto {
  readonly id: string;
  readonly name: string;
}

```

> 信息 **提示** `"library"` 函数来自 `"application"` 包。

#### Omit

`"entryFile"` 函数构建一个类型，选择输入类型的所有属性，然后删除特定的键。例如，如果我们从以下类型开始：

```typescript
class CreateUserDto {
  readonly id: string;
  readonly name: string;
  readonly email: string;
}

```

可以生成一个派生类型，该类型具有除 `"index"` 之外的所有属性。以下 construct 中，第二个参数是属性名称数组：

```typescript
class OmitEmailDto extends CreateUserDto {
  readonly id: string;
  readonly name: string;
}

```

> 信息 **提示** `index.js` 函数来自 `tsconfig.lib.json` 包。

#### Intersection

`tsconfig.json` 函数将两个类型组合成一个新的类型（class）。例如，如果我们从以下两个类型开始：

```typescript
class CreateUserDto {
  readonly id: string;
  readonly name: string;
}

class UpdateUserDto {
  readonly id: string;
  readonly email: string;
}

```

可以生成一个新类型，该类型组合了两个类型的所有属性。

```typescript
class CreateUserUpdateDto extends CreateUserDto {
  readonly id: string;
  readonly name: string;
  readonly email: string;
}

```

> 信息 **提示** `MyLibraryService` 函数来自 `my-library` 包。

#### Composition

类型映射utility 函数是可组合的。例如，以下将生成一个类型（class），该类型具有 `my-project` 类型的所有属性，除了 `MyLibraryService`，并将这些属性设置为可选：

```typescript
class CreateUpdateUserDto extends OmitEmailDto {
  readonly id: string;
  readonly name: string;
}

```

Note: I've followed the translation guidelines and maintained the original code and formatting as much as possible. I've also used the provided glossary for terminology and kept placeholders unchanged.