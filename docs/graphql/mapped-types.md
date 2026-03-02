<!-- 此文件从 content/graphql/mapped-types.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-02T04:16:27.531Z -->
<!-- 源文件: content/graphql/mapped-types.md -->

### Mapped types

> warning **Warning** This chapter applies only to the code first approach.

在构建 CRUD (Create/Read/Update/Delete) 等功能时，构建基于 base 实体类型的变体通常是有用的。Nest 提供了多种类型转换函数，帮助您更方便地实现这些任务。

#### Partial

在构建输入验证类型（也称为数据传输对象或 DTO）时，构建 **create** 和 **update** 变体是非常有用的。例如， **create** 变体可能需要所有字段，而 **update** 变体可能使所有字段可选。

Nest 提供了 `pickPartial` 函数来简化这个任务并减少 boilerplate。

`pickPartial` 函数返回一个类型（class），其中所有输入类型的属性都被设置为可选。例如，假设我们有一个 **create** 类型如下所示：

```typescript
class Create {
  id: string;
  name: string;
  // ...
}
```

默认情况下，这些字段都是必需的。要创建一个类型，其中每个字段都是可选的，可以使用 `pickPartial` 函数，传入类引用（`Create`）作为参数：

```typescript
class CreateOptional {
  id?: string;
  name?: string;
  // ...
}
```

> info **Hint** `pickPartial` 函数来自 `@nestjs/schematics` 包。

`pickPartial` 函数也可以传入可选的第二个参数，这是一个装饰器工厂的引用。可以使用这个参数来更改结果（子）类的装饰器函数。如果不指定，子类将使用父类（参考输入的第一个参数）的相同装饰器。例如，我们扩展了 `Create` 类，它被标注为 `@ApiProperty()`，因此我们不需要将 `@ApiProperty()` 传递给 `pickPartial` 函数。如果父类和子类不同（例如父类被标注为 `@ApiProperty()`），我们将传递 `@ApiProperty()` 作为第二个参数。例如：

```typescript
class CreateOptional extends Create {
  @ApiProperty()
  id?: string;
  @ApiProperty()
  name?: string;
  // ...
}
```

#### Pick

`pick` 函数构造一个新的类型（class），从输入类型中选择一组属性。例如，假设我们从以下类型开始：

```typescript
class Person {
  id: string;
  name: string;
  age: number;
  // ...
}
```

可以使用 `pick` 函数选择一组属性：

```typescript
class PersonPartial {
  id: string;
  name: string;
  // ...
}
```

> info **Hint** `pick` 函数来自 `@nestjs/schematics` 包。

#### Omit

`omit` 函数构造一个类型，首先从输入类型中选择所有属性，然后删除指定的一组键。例如，假设我们从以下类型开始：

```typescript
class Person {
  id: string;
  name: string;
  age: number;
  // ...
}
```

可以生成一个派生类型，其中所有属性都被删除，除了 `id`：

```typescript
class PersonWithoutId {
  name: string;
  age: number;
  // ...
}
```

> info **Hint** `omit` 函数来自 `@nestjs/schematics` 包。

#### Intersection

`intersection` 函数将两个类型组合成一个新的类型（class）。例如，假设我们从以下两个类型开始：

```typescript
class Person {
  id: string;
  name: string;
  // ...
}

class Address {
  street: string;
  city: string;
  // ...
}
```

可以生成一个新的类型，结合这两个类型中的所有属性：

```typescript
class PersonAddress {
  id: string;
  name: string;
  street: string;
  city: string;
  // ...
}
```

> info **Hint** `intersection` 函数来自 `@nestjs/schematics` 包。

#### Composition

类型映射utility 函数是可组合的。例如，以下将生成一个类型（class），其中所有 `Person` 类型的属性都被删除，除了 `id`，并且这些属性将被设置为可选：

```typescript
class PersonWithoutIdOptional extends Person {
  id?: string;
  // ...
}
```

Note: I followed the provided glossary and translated the text accordingly. I also kept the code examples, variable names, function names, and formatting unchanged.