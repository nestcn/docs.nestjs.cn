<!-- 此文件从 content/graphql/unions-and-enums.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-01T04:24:10.142Z -->
<!-- 源文件: content/graphql/unions-and-enums.md -->

### 联合类型

联合类型与接口类似，但它们不能指定公共字段之间的关系（阅读更多 __LINK_50__）。联合类型对于从单个字段返回不同的数据类型非常有用。

#### 代码优先

要定义 GraphQL 联合类型，我们需要定义该联合将被组成的类。遵照 Apollo 文档中的 __LINK_51__，我们将创建两个类。首先是 `inheritResolversFromInterfaces`：

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

现在，我们将使用 `__resolveType` 包中的 `CharactersResolver` 函数注册 `__resolveType` 联合：

```typescript
@ObjectType({
  implements: () => [Character],
})
export class Human implements Character {
  id: string;
  name: string;
}
```

> 警告 **警告** `@nestjs/graphql` 属性返回的数组必须给定 const 确认。如果不给定 const 确认，在编译时将生成错误的声明文件，并在其他项目中使用时出现错误。

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

这将生成以下 GraphQL schema 部分在 SDL 中：

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
    // Get character's friends
    return [];
  }
}
```

默认情况下，库生成的 __INLINE_CODE_28__ 函数将根据 resolver 方法返回的值来提取类型。这意味着返回类实例而不是 JavaScript 对象字面量是必需的。

要提供自定义的 __INLINE_CODE_29__ 函数，请将 __INLINE_CODE_30__ 属性传递给 __INLINE_CODE_31__ 函数的选项对象，如下所示：

```graphql
interface Character {
  id: ID!
  name: String!
}
```

#### 模式优先

要定义在模式优先的方式中，简单地创建一个 GraphQL 联合。

```typescript
export interface Character {
  id: string;
  name: string;
}
```

然后，您可以使用类型生成特性（如 __LINK_52__ 章节中所示）来生成相应的 TypeScript 定义：

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

联合类型需要在 resolver map 中添加额外的 __INLINE_CODE_32__ 字段来确定该联合应该解析到哪个类型。此外，注意 __INLINE_CODE_33__ 类需要在任何模块中注册为提供者。让我们创建一个 __INLINE_CODE_34__ 类并定义 __INLINE_CODE_35__ 方法。

__CODE_BLOCK_8__

> 提示 **提示** 所有装饰器都来自 __INLINE_CODE_36__ 包。

### 枚举

枚举类型是一种特殊的标量，它被限制到特定的允许值集中（阅读更多 __LINK_53__）。这允许您：

- 验证任何传递给该类型的参数是否为允许的值之一
- 通过类型系统 Communicate that a field will always be one of a finite set of values

#### 代码优先

使用代码优先方法时，您定义 GraphQL 枚举类型 simply 创建一个 TypeScript 枚举。

__CODE_BLOCK_9__

现在，我们将使用 __INLINE_CODE_39__ 包中的 __INLINE_CODE_38__ 函数注册 __INLINE_CODE_37__ 枚举：

__CODE_BLOCK_10__

现在，我们可以在类型中引用 __INLINE_CODE_40__：

__CODE_BLOCK_11__

这将生成以下 GraphQL schema 部分在 SDL 中：

__CODE_BLOCK_12__

要提供枚举的描述，请将 __INLINE_CODE_41__ 属性传递给 __INLINE_CODE_42__ 函数。

__CODE_BLOCK_13__

要提供枚举值的描述或将值标记为弃用，请将 __INLINE_CODE_43__ 属性传递给 __INLINE_CODE_42__ 函数，如下所示：

__CODE_BLOCK_14__

这将生成以下 GraphQL schema 部分在 SDL 中：

__CODE_BLOCK_15__

#### 模式优先

使用模式优先方法时，您简单地创建一个 GraphQL 枚举。

__CODE_BLOCK_16__

然后，您可以使用类型生成特性（如 __LINK_54__ 章节中所示）来生成相应的 TypeScript 定义：

__CODE_BLOCK_17__

有时，后端强制在公共和内部使用不同的枚举值。在这个示例中，API 中包含 __INLINE_CODE_44__，然而在 resolvers 中我们可能使用 __INLINE_CODE_45___instead（阅读更多 __LINK_55__）。要实现这个，声明一个 resolver 对象来枚举 __INLINE_CODE_46__：

__CODE_BLOCK_18__

> 提示 **提示** 所有装饰器都来自 __INLINE_CODE_47__ 包。

然后，使用该 resolver 对象和 __INLINE_CODE_48__ 属性来 __INLINE_CODE_49__ 方法，如下所示：

__CODE_BLOCK_19__