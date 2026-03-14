<!-- 此文件从 content/graphql/unions-and-enums.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T04:59:07.556Z -->
<!-- 源文件: content/graphql/unions-and-enums.md -->

### 联合

联合类型与接口类似，但它们不能指定共同的字段（请阅读 __LINK_50__）。联合类型有助于从单个字段返回 disjoint 数据类型。

#### 代码优先

要定义 GraphQL 联合类型，我们必须定义这个联合将组成的类。遵循来自 Apollo 文档的 __LINK_51__，我们将创建两个类。首先是 `@Field`：

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

在这项工作完成后，我们使用 `PostsService` 包中的 `votes` 函数注册 `PostsService` 联合：

```typescript
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class UpvotePostInput {
  @Field()
  postId: number;
}

```

> warning **警告** `upvotePost(postId: Int!): Post` 属性返回的数组应该被赋予 const 断言。如果不给予 const 断言，在编译时将生成错误的声明文件，并在使用它时出现错误。

现在，我们可以在查询中引用 __INLINE_CODE_27__：

```typescript
@Mutation(() => Post)
async upvotePost(
  @Args('upvotePostData') upvotePostData: UpvotePostInput,
) {}

```

这将生成以下 GraphQL schema 部分：

```typescript
@Mutation()
async upvotePost(@Args('postId') postId: number) {
  return this.postsService.upvoteById({ id: postId });
}

```

默认情况下，库生成的 __INLINE_CODE_28__ 函数将根据 resolver 方法返回的值来提取类型。因此，返回类实例而不是 JavaScript 对象字面量是强制性的。

要提供自定义的 __INLINE_CODE_29__ 函数，传递 __INLINE_CODE_30__ 属性到 __INLINE_CODE_31__ 函数的选项对象中，例如：

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

####schema 优先

要在 schema 优先级中定义联合，只需创建 GraphQL 联合使用 SDL。

__CODE_BLOCK_6__

然后，您可以使用类型生成特性（如 __LINK_52__ 章节中所示）来生成相应的 TypeScript 定义：

__CODE_BLOCK_7__

联合类型需要在 resolver map 中添加额外的 __INLINE_CODE_32__ 字段以确定联合应该解析到哪个类型。此外，注意 __INLINE_CODE_33__ 类需要在任何模块中注册为提供者。让我们创建 __INLINE_CODE_34__ 类并定义 __INLINE_CODE_35__ 方法。

__CODE_BLOCK_8__

> info **提示** 所有装饰器都来自 __INLINE_CODE_36__ 包。

### 枚举

枚举类型是一种特殊的标量，可以限定到特定的允许值集中（请阅读 __LINK_53__）。这允许您：

- 验证任何使用该类型的参数是否为允许值之一
- 通过类型系统表明该字段将总是属于有限集合的值

#### 代码优先

使用代码优先方法时，您定义 GraphQL 枚举类型只是创建 TypeScript 枚举。

__CODE_BLOCK_9__

在这项工作完成后，我们使用 __INLINE_CODE_39__ 包中的 __INLINE_CODE_38__ 函数注册 __INLINE_CODE_37__ 枚举：

__CODE_BLOCK_10__

现在，您可以在类型中引用 __INLINE_CODE_40__：

__CODE_BLOCK_11__

这将生成以下 GraphQL schema 部分：

__CODE_BLOCK_12__

要提供枚举的描述，传递 __INLINE_CODE_41__ 属性到 __INLINE_CODE_42__ 函数中。

__CODE_BLOCK_13__

要提供枚举值的描述或标记某个值为弃用，传递 __INLINE_CODE_43__ 属性，例如：

__CODE_BLOCK_14__

这将生成以下 GraphQL schema 部分：

__CODE_BLOCK_15__

#### schema 优先

要在 schema 优先级中定义枚举，只需创建 GraphQL 枚举使用 SDL。

__CODE_BLOCK_16__

然后，您可以使用类型生成特性（如 __LINK_54__ 章节中所示）来生成相应的 TypeScript 定义：

__CODE_BLOCK_17__

有时候，后端强制在枚举中使用不同的值，而在公共 API 中使用不同的值。在示例中，API 中包含 __INLINE_CODE_44__，但是在解析器中我们可能使用 __INLINE_CODE_45__ 而不是 __INLINE_CODE_44__ (请阅读 __LINK_55__）。要实现这一点，声明一个用于 __INLINE_CODE_46__ 枚举的解析器对象。

__CODE_BLOCK_18__

> info **提示** 所有装饰器都来自 __INLINE_CODE_47__ 包。

然后，使用这个解析器对象和 __INLINE_CODE_49__ 属性中的 __INLINE_CODE_48__ 属性，例如：

__CODE_BLOCK_19__