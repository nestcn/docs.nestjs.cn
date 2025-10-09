### 联合类型

联合类型与接口非常相似，但它们不能指定类型之间的任何公共字段（了解更多[此处](https://graphql.org/learn/schema/#union-types) ）。联合类型适用于从单个字段返回不相交的数据类型。

#### 代码优先

要定义 GraphQL 联合类型，我们必须定义组成该联合的类。根据 Apollo 文档中的[示例](https://www.apollographql.com/docs/apollo-server/schema/unions-interfaces/#联合类型) ，我们将创建两个类。首先是 `Book`：

```typescript
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Book {
  @Field()
  title: string;
}
```

然后是 `Author`：

```typescript
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Author {
  @Field()
  name: string;
}
```

完成这些设置后，使用从 `@nestjs/graphql` 包导出的 `createUnionType` 函数注册 `ResultUnion` 联合类型：

```typescript
export const ResultUnion = createUnionType({
  name: 'ResultUnion',
  types: () => [Author, Book] as const,
});
```

:::warning 警告
必须为 `createUnionType` 函数的 `types` 属性返回的数组添加 const 断言。如果未添加 const 断言，编译时将生成错误的声明文件，在其他项目中使用时会导致错误。
:::



现在，我们可以在查询中引用 `ResultUnion`：

```typescript
@Query(() => [ResultUnion])
search(): Array<typeof ResultUnion> {
  return [new Author(), new Book()];
}
```

这将生成以下 GraphQL 模式定义语言(SDL)部分：

```graphql
type Author {
  name: String!
}

type Book {
  title: String!
}

union ResultUnion = Author | Book

type Query {
  search: [ResultUnion!]!
}
```

该库生成的默认 `resolveType()` 函数会根据解析器方法返回的值提取类型。这意味着必须返回类实例而非字面量 JavaScript 对象。

要提供自定义的 `resolveType()` 函数，请将 `resolveType` 属性传递给传入 `createUnionType()` 函数的 options 对象，如下所示：

```typescript
export const ResultUnion = createUnionType({
  name: 'ResultUnion',
  types: () => [Author, Book] as const,
  resolveType(value) {
    if (value.name) {
      return Author;
    }
    if (value.title) {
      return Book;
    }
    return null;
  },
});
```

#### 模式优先

在模式优先方法中定义联合类型，只需使用 SDL 创建一个 GraphQL 联合类型。

```graphql
type Author {
  name: String!
}

type Book {
  title: String!
}

union ResultUnion = Author | Book
```

然后，你可以使用类型生成功能（如[快速开始](/graphql/quick-start)章节所示）来生成对应的 TypeScript 定义：

```typescript
export class Author {
  name: string;
}

export class Book {
  title: string;
}

export type ResultUnion = Author | Book;
```

联合类型需要在解析器映射中添加额外的 `__resolveType` 字段来确定应解析为哪种类型。另外请注意，`ResultUnionResolver` 类必须注册为任何模块的提供者。让我们创建一个 `ResultUnionResolver` 类并定义 `__resolveType` 方法。

```typescript
@Resolver('ResultUnion')
export class ResultUnionResolver {
  @ResolveField()
  __resolveType(value) {
    if (value.name) {
      return 'Author';
    }
    if (value.title) {
      return 'Book';
    }
    return null;
  }
}
```

:::info 提示
所有装饰器均从 `@nestjs/graphql` 包中导出。
:::

### 枚举

枚举类型是一种特殊的标量类型，其值被限制在特定的允许值集合内（了解更多[此处](https://graphql.org/learn/schema/#enumeration-types) ）。这使您可以：

- 验证该类型的任何参数是否为允许值之一
- 通过类型系统表明某个字段永远是一组有限值中的一个

#### 代码优先

当使用代码优先方法时，您只需创建一个 TypeScript 枚举即可定义 GraphQL 枚举类型。

```typescript
export enum AllowedColor {
  RED,
  GREEN,
  BLUE,
}
```

完成这些设置后，使用从 `@nestjs/graphql` 包导出的 `registerEnumType` 函数注册 `AllowedColor` 枚举：

```typescript
registerEnumType(AllowedColor, {
  name: 'AllowedColor',
});
```

现在你可以在我们的类型中引用 `AllowedColor` 枚举：

```typescript
@Field(type => AllowedColor)
favoriteColor: AllowedColor;
```

这将生成以下 GraphQL 模式定义语言(SDL)部分：

```graphql
enum AllowedColor {
  RED
  GREEN
  BLUE
}
```

要为枚举提供描述，请将 `description` 属性传入 `registerEnumType()` 函数。

```typescript
registerEnumType(AllowedColor, {
  name: 'AllowedColor',
  description: 'The supported colors.',
});
```

要为枚举值提供描述，或将某个值标记为弃用，请传入 `valuesMap` 属性，如下所示：

```typescript
registerEnumType(AllowedColor, {
  name: 'AllowedColor',
  description: 'The supported colors.',
  valuesMap: {
    RED: {
      description: 'The default color.',
    },
    BLUE: {
      deprecationReason: 'Too blue.',
    },
  },
});
```

这将生成以下 SDL 格式的 GraphQL 模式：

```graphql
"""
The supported colors.
"""
enum AllowedColor {
  """
  The default color.
  """
  RED
  GREEN
  BLUE @deprecated(reason: "Too blue.")
}
```

#### 模式优先

在模式优先的方法中定义枚举器，只需用 SDL 创建一个 GraphQL 枚举即可。

```graphql
enum AllowedColor {
  RED
  GREEN
  BLUE
}
```

然后您可以使用类型生成功能（如[快速入门](/graphql/quick-start)章节所示）来生成对应的 TypeScript 定义：

```typescript
export enum AllowedColor {
  RED
  GREEN
  BLUE
}
```

有时后端会强制要求枚举在内部使用与公开 API 不同的值。在这个例子中，API 包含 `RED`，但在解析器中我们可能使用 `#f00` 代替（了解更多[此处](https://www.apollographql.com/docs/apollo-server/schema/scalars-enums/#internal-values) ）。要实现这一点，需要为 `AllowedColor` 枚举声明一个解析器对象：

```typescript
export const allowedColorResolver: Record<keyof typeof AllowedColor, any> = {
  RED: '#f00',
};
```

:::info 提示
所有装饰器均从 `@nestjs/graphql` 包中导出。
:::

然后将此解析器对象与 `GraphQLModule#forRoot()` 方法的 `resolvers` 属性一起使用，如下所示：

```typescript
GraphQLModule.forRoot({
  resolvers: {
    AllowedColor: allowedColorResolver,
  },
});
```
