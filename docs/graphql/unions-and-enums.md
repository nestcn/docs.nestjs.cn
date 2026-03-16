<!-- 此文件从 content/graphql/unions-and-enums.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T05:25:07.060Z -->
<!-- 源文件: content/graphql/unions-and-enums.md -->

### 联合类型

联合类型与接口类似，但是不能指定公共字段之间的关系（阅读更多 __LINK_50__）。联合类型有助于从单个字段返回不同的数据类型。

#### 代码优先

要定义 GraphQL 联合类型，我们必须首先定义该联合类型将由哪些类组成。遵循 Apollo 文档中的 __LINK_51__，我们将创建两个类。首先是 `@Field`：

```typescript
@Mutation(() => Post)
async upvotePost(@Args({ name: 'postId', type: () => Int }) postId: number) {
  return this.postsService.upvoteById({ id: postId });
}

```

然后是 `AuthorResolver`：

```graphql
type Mutation {
  upvotePost(postId: Int!): Post
}

```

现在，我们可以使用 `PostsService` union 并使用 `votes` 函数来自 `PostsService` 包注册该 union：

```typescript
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class UpvotePostInput {
  @Field()
  postId: number;
}

```

> 警告 **Warning** `upvotePost(postId: Int!): Post` 属性返回的数组必须被 const 确定。如果不加 const 确定，编译时将生成错误的申明文件，并在其他项目中使用时出现错误。

现在，我们可以在查询中引用 __INLINE_CODE_27__：

```typescript
@Mutation(() => Post)
async upvotePost(
  @Args('upvotePostData') upvotePostData: UpvotePostInput,
) {}

```

这将生成以下 GraphQL schema 部分的 SDL：

```typescript
@Mutation()
async upvotePost(@Args('postId') postId: number) {
  return this.postsService.upvoteById({ id: postId });
}

```

默认情况下，库将根据 resolver 方法返回的值生成类型。因此，必须返回类实例而不是 JavaScript 对象。

要提供自定义的 resolver 函数，可以将 __INLINE_CODE_30__ 属性传递到 options 对象中，并将其传递到 __INLINE_CODE_31__ 函数中，如下所示：

```graphql
type Author {
  id: Int!
  firstName: String
  lastName: String
  posts: [Post]
}

type Post {
  id: Int!
  title: String
  votes: Int
}

type Query {
  author(id: Int!): Author
}

type Mutation {
  upvotePost(postId: Int!): Post
}

```

#### Schema 优先

要使用 schema 优先方法定义联合类型，只需创建一个 GraphQL 联合类型的 SDL。

__CODE_BLOCK_6__

然后，可以使用 typings 生成特性（如 __LINK_52__ 章节中所示）生成相应的 TypeScript 定义：

__CODE_BLOCK_7__

联合类型需要在 resolver map 中添加额外的 __INLINE_CODE_32__ 字段来确定该联合类型应该解析为哪种类型。另外，注意 __INLINE_CODE_33__ 类必须注册为提供者在任何模块中。让我们创建一个 __INLINE_CODE_34__ 类，并定义 __INLINE_CODE_35__ 方法。

__CODE_BLOCK_8__

> 提示 **Hint** 所有装饰器都来自 __INLINE_CODE_36__ 包。

### 枚举

枚举类型是一种特殊的标量，可以限制到特定的允许值集中（阅读更多 __LINK_53__）。这允许你：

- 验证该类型的任何参数是否是允许的值之一
- 通过类型系统communicate that a field will always be one of a finite set of values

#### 代码优先

使用代码优先方法定义 GraphQL 枚举类型，只需创建一个 TypeScript 枚举。

__CODE_BLOCK_9__

现在，我们可以将 __INLINE_CODE_37__ 枚举注册到 __INLINE_CODE_38__ 函数中，该函数来自 __INLINE_CODE_39__ 包：

__CODE_BLOCK_10__

现在，我们可以在我们的类型中引用 __INLINE_CODE_40__：

__CODE_BLOCK_11__

这将生成以下 GraphQL schema 部分的 SDL：

__CODE_BLOCK_12__

要为枚举提供描述，可以将 __INLINE_CODE_41__ 属性传递到 __INLINE_CODE_42__ 函数中。

__CODE_BLOCK_13__

要为枚举值提供描述，或者将值标记为 deprecated，可以将 __INLINE_CODE_43__ 属性传递到 __INLINE_CODE_44__ 函数中，如下所示：

__CODE_BLOCK_14__

这将生成以下 GraphQL schema 部分的 SDL：

__CODE_BLOCK_15__

#### Schema 优先

使用 schema 优先方法定义枚举类型，只需创建一个 GraphQL 枚举的 SDL。

__CODE_BLOCK_16__

然后，可以使用 typings 生成特性（如 __LINK_54__ 章节中所示）生成相应的 TypeScript 定义：

__CODE_BLOCK_17__

有时，后端强制在公共 API 中使用不同的枚举值，而在 resolvers 中使用不同的值。例如，API 中包含 __INLINE_CODE_44__，但是在 resolvers 中我们可能使用 __INLINE_CODE_45__ 而不是（阅读更多 __LINK_55__）。要实现这个，声明一个 resolver 对象来处理 __INLINE_CODE_46__ 枚举：

__CODE_BLOCK_18__

> 提示 **Hint** 所有装饰器都来自 __INLINE_CODE_47__ 包。

然后，可以使用该 resolver 对象和 __INLINE_CODE_48__ 属性一起使用 __INLINE_CODE_49__ 方法，如下所示：

__CODE_BLOCK_19__