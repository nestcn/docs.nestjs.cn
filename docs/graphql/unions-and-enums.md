<!-- 此文件从 content/graphql/unions-and-enums.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-03T04:16:47.829Z -->
<!-- 源文件: content/graphql/unions-and-enums.md -->

### 联合类型

联合类型与接口类似，但它们不能指定类型之间的公共字段（请阅读 __LINK_50__）。联合类型对返回多种数据类型的单个字段非常有用。

#### 代码优先

要定义 GraphQL 联合类型，我们需要定义该联合类型将由组成的类。遵循 __LINK_51__ 的 Apollo 文档，我们将创建两个类。首先是 `inheritResolversFromInterfaces`：

```typescript
import { Field, ID, InterfaceType } from '@nestjs/graphql';

@InterfaceType()
export abstract class Character {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;
}
```

然后是 `GraphQLModule`：

```graphql
interface Character {
  id: ID!
  name: String!
}
```

现在，我们可以使用 `__resolveType` 包中的 `CharactersResolver` 函数注册 `__resolveType` 联合类型：

```typescript
@ObjectType({
  implements: () => [Character],
})
export class Human implements Character {
  id: string;
  name: string;
}
```

> 警告 **警告** `@nestjs/graphql` 属性返回的数组必须添加 const 断言。如果给定 const 断言，编译时将生成错误的申明文件，并在其他项目中使用时将发生错误。

现在，我们可以在查询中引用 __INLINE_CODE_27__：

```typescript
@InterfaceType({
  resolveType(book) {
    if (book.colors) {
      return ColoringBook;
    }
    return TextBook;
  },
})
export abstract class Book {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;
}
```

这将生成以下 GraphQL schema 部分的 SDL：

```typescript
import { Resolver, ResolveField, Parent, Info } from '@nestjs/graphql';

@Resolver((type) => Character) // Reminder: Character is an interface
export class CharacterInterfaceResolver {
  @ResolveField(() => [Character])
  friends(
    @Parent() character, // Resolved object that implements Character
    @Info() { parentType }, // Type of the object that implements Character
    @Args('search', { type: () => String }) searchTerm: string,
  ) {
    // 获取 character's friends
    return [];
  }
}
```

默认情况下，library 生成的 __INLINE_CODE_28__ 函数将根据 resolver 方法返回的值来确定类型。这意味着返回类实例而不是 JavaScript 对象字面量是必需的。

要提供自定义 __INLINE_CODE_29__ 函数，可以将 __INLINE_CODE_30__ 属性传递给 __INLINE_CODE_31__ 函数的选项对象：

```graphql
interface Character {
  id: ID!
  name: String!
}
```

#### 架构优先

要使用架构优先方法定义联合类型，只需创建 GraphQL 联合类型的 SDL。

```typescript
export interface Character {
  id: string;
  name: string;
}
```

然后，可以使用类型生成特性（如 __LINK_52__ 章节所示）生成相应的 TypeScript 定义：

```typescript
@Resolver('Character')
export class CharactersResolver {
  @ResolveField()
  __resolveType(value) {
    if ('age' in value) {
      return Person;
    }
    return null;
  }
}
```

联合类型需要在 resolver map 中添加额外的 __INLINE_CODE_32__ 字段，以确定联合类型应该解析到哪个类型。此外，注意 __INLINE_CODE_33__ 类必须注册为模块中的提供者。让我们创建 __INLINE_CODE_34__ 类并定义 __INLINE_CODE_35__ 方法。

__CODE_BLOCK_8__

> 提示 **提示** 所有装饰器都是从 __INLINE_CODE_36__ 包中导出的。

### 枚举

枚举类型是一种特殊的标量，它们受到特定的允许值的限制（请阅读 __LINK_53__）。这允许你：

- 验证任何带有该类型的参数是否是允许的值之一
- 通过类型系统传递信息，表明该字段将始终是有限的一组值中的一个

#### 代码优先

使用代码优先方法时，您定义 GraphQL 枚举类型 simplement 创建 TypeScript 枚举。

__CODE_BLOCK_9__

现在，我们可以使用 `__resolveType` 包中的 __INLINE_CODE_38__ 函数注册 __INLINE_CODE_37__ 枚举：

__CODE_BLOCK_10__

现在，我们可以在类型中引用 __INLINE_CODE_40__：

__CODE_BLOCK_11__

这将生成以下 GraphQL schema 部分的 SDL：

__CODE_BLOCK_12__

要为枚举提供描述，可以将 __INLINE_CODE_41__ 属性传递给 __INLINE_CODE_42__ 函数。

__CODE_BLOCK_13__

要为枚举值提供描述，或者标记值为弃用，可以将 __INLINE_CODE_43__ 属性传递给 __INLINE_CODE_42__ 函数，例如：

__CODE_BLOCK_14__

这将生成以下 GraphQL schema 部分的 SDL：

__CODE_BLOCK_15__

#### 架构优先

使用架构优先方法定义枚举，只需创建 GraphQL 枚举的 SDL。

__CODE_BLOCK_16__

然后，可以使用类型生成特性（如 __LINK_54__ 章节所示）生成相应的 TypeScript 定义：

__CODE_BLOCK_17__

在某些情况下，后端强制将枚举值强制转换为不同值。例如，API 中包含 __INLINE_CODE_44__，但是在 resolvers 中我们可能使用 __INLINE_CODE_45__ 而不是（请阅读 __LINK_55__）。要实现此操作，可以声明一个 resolver 对象以处理 __INLINE_CODE_46__ 枚举：

__CODE_BLOCK_18__

> 提示 **提示** 所有装饰器都是从 __INLINE_CODE_47__ 包中导出的。

然后，我们可以使用这个 resolver 对象和 __INLINE_CODE_48__ 属性的 __INLINE_CODE_49__ 方法，例如：

__CODE_BLOCK_19__