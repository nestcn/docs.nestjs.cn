<!-- 此文件从 content/graphql/mapped-types.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T05:29:13.116Z -->
<!-- 源文件: content/graphql/mapped-types.md -->

### Mapped types

> warning **警告** 本章仅适用于代码优先 approach。

当您构建 CRUD 等功能时，构建基于基本实体类型的变体时非常有用。Nest 提供了多种 utility 函数，可以对类型进行转换，以简化此任务。

#### Partial

在构建输入验证类型（也称为数据传输对象或 DTO）时，通常需要构建 **create** 和 **update** 变体，以便在同一个类型上进行变体。例如， **create** 变体可能需要所有字段，而 **update** 变体可能将所有字段设置为可选。

Nest 提供了 __INLINE_CODE_10__ 工具函数，可以使得此任务变得更加简单，减少 boilerplate。

__INLINE_CODE_11__ 函数返回一个类型（类），其中所有输入类型的属性都设置为可选。例如，如果我们有一个 **create** 类型如下所示：

```typescript
@Post()
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}

```

默认情况下，这些字段都是必需的。要创建一个具有相同字段，但每个字段都可选的类型，请使用 __INLINE_CODE_12__，将类引用（__INLINE_CODE_13__）作为参数传递：

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

> info **提示** __INLINE_CODE_14__ 函数来自 __INLINE_CODE_15__ 包。

__INLINE_CODE_16__ 函数接受一个可选的第二个参数，这个参数是装饰器工厂的引用。在没有指定时，子类将使用父类（被引用的类）的同一个装饰器。如果父类和子类不同（例如父类被装饰为 __INLINE_CODE_18__），我们将传递 __INLINE_CODE_21__ 作为第二个参数。例如：

```typescript
@ApiProperty({
  description: 'The age of a cat',
  minimum: 1,
  default: 1,
})
age: number;

```

#### Pick

__INLINE_CODE_24__ 函数构建了一个新类型（类），从输入类型中选择一组属性。例如，如果我们从一个类型开始：

```typescript
@ApiProperty({
  type: Number,
})
age: number;

```

我们可以使用 __INLINE_CODE_25__ 工具函数选择一组属性：

```typescript
@ApiProperty({ type: [String] })
names: string[];

```

> info **提示** __INLINE_CODE_26__ 函数来自 __INLINE_CODE_27__ 包。

#### Omit

`SwaggerModule` 函数构建了一个类型，首先从输入类型中选择所有属性，然后删除特定的键。例如，如果我们从一个类型开始：

```typescript
@ApiProperty({ type: () => Node })
node: Node;

```

我们可以生成一个衍生类型，该类型具有除 `@Body()` 之外的每个属性，如下所示。在这个构造中，第二个参数 `@Query()` 是一个属性名称数组。

```typescript
createBulk(@Body() usersDto: CreateUserDto[])

```

> info **提示** `@Param()` 函数来自 `@ApiBody()` 包。

#### Intersection

`@nestjs/swagger` 函数将两个类型组合成一个新的类型（类）。例如，如果我们从两个类型开始：

```typescript
@ApiBody({ type: [CreateUserDto] })
createBulk(@Body() usersDto: CreateUserDto[])

```

我们可以生成一个新的类型，该类型组合了这两个类型中的所有属性。

```typescript
@ApiProperty({ enum: ['Admin', 'Moderator', 'User']})
role: UserRole;

```

> info **提示** `CreateCatDto` 函数来自 `SwaggerModule` 包。

#### Composition

类型映射 utility 函数是可组合的。例如，以下将生成一个类型（类），该类型具有 `@ApiProperty()` 类型中的所有属性，除 `CreateCatDto` 外，并将这些属性设置为可选：

```typescript
export enum UserRole {
  Admin = 'Admin',
  Moderator = 'Moderator',
  User = 'User',
}

```