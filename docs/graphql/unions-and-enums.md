<!-- 此文件从 content/graphql/unions-and-enums.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T04:52:37.884Z -->
<!-- 源文件: content/graphql/unions-and-enums.md -->

### 联合类型

联合类型非常类似于接口，但是它们不能指定公共字段之间的关系（更多信息__LINK_50__）。联合类型非常有用，用于返回单个字段中的 disjoint 数据类型。

#### 代码优先

要定义 GraphQL 联合类型，我们必须定义该联合类型将由哪些类组成。遵循 __LINK_51__ 从 Apollo 文档中，我们将创建两个类。首先是 `@Field`：

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

在这之后，我们使用 `PostsService` 包中的 `votes` 函数来注册 `PostsService` 联合类型：

```typescript
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class UpvotePostInput {
  @Field()
  postId: number;
}

```

> 警告 **警告** `upvotePost(postId: Int!): Post` 属性返回的数组在编译时需要 const 断言。如果没有给出 const 断言，编译时将生成错误的申明文件，并且在使用它时将出现错误。

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

默认情况下，库生成的 __INLINE_CODE_28__ 函数将根据返回值从解析器方法中提取类型。这意味着返回实例类别而不是 JavaScript 对象是必需的。

要提供自定义 __INLINE_CODE_29__ 函数，请将 __INLINE_CODE_30__ 属性传递给 __INLINE_CODE_31__ 函数的选项对象，例如：

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

#### schema 优先

要在 schema 优先级中定义联合类型，简单地创建一个 GraphQL 联合类型。

__CODE_BLOCK_6__

然后，您可以使用类型生成特性（如 __LINK_52__ 章节中所示）来生成相应的 TypeScript 定义：

__CODE_BLOCK_7__

联合类型需要在解析器映射中添加额外的 __INLINE_CODE_32__ 字段来确定该联合类型应该解析到哪个类型。此外，记住 __INLINE_CODE_33__ 类需要在任何模块中注册为提供者。让我们创建一个 __INLINE_CODE_34__ 类并定义 __INLINE_CODE_35__ 方法。

__CODE_BLOCK_8__

> 提示 **提示** 所有装饰器都来自 __INLINE_CODE_36__ 包。

### 枚举

枚举类型是一种特殊的标量，它限定了允许的值集（更多信息__LINK_53__）。这允许您：

- 验证任何该类型的参数是否在允许的值集中
- 通过类型系统传递信息，表明一个字段将始终是有限集的值之一

#### 代码优先

使用代码优先方法时，您可以通过简单地创建 TypeScript 枚举来定义 GraphQL 枚举类型。

__CODE_BLOCK_9__

在这之后，我们使用 __INLINE_CODE_39__ 包中的 __INLINE_CODE_38__ 函数来注册 __INLINE_CODE_37__ 枚举类型：

__CODE_BLOCK_10__

现在，我们可以在我们的类型中引用 __INLINE_CODE_40__：

__CODE_BLOCK_11__

这将生成以下 GraphQL schema 部分：

__CODE_BLOCK_12__

要提供枚举的描述，请将 __INLINE_CODE_41__ 属性传递给 __INLINE_CODE_42__ 函数。

__CODE_BLOCK_13__

要提供枚举值的描述或将值标记为已弃用，请将 __INLINE_CODE_43__ 属性传递给 __INLINE_CODE_42__ 函数，例如：

__CODE_BLOCK_14__

这将生成以下 GraphQL schema 部分：

__CODE_BLOCK_15__

#### schema 优先

要在 schema 优先级中定义枚举类型，简单地创建一个 GraphQL 枚举。

__CODE_BLOCK_16__

然后，您可以使用类型生成特性（如 __LINK_54__ 章节中所示）来生成相应的 TypeScript 定义：

__CODE_BLOCK_17__

有时服务器强制在公共 API 中使用枚举的不同值，而在解析器中使用不同的值（更多信息__LINK_55__）。要实现这点，声明一个解析器对象来处理 __INLINE_CODE_46__ 枚举：

__CODE_BLOCK_18__

> 提示 **提示** 所有装饰器都来自 __INLINE_CODE_47__ 包。

然后，使用这个解析器对象和 __INLINE_CODE_48__ 属性来处理 __INLINE_CODE_49__ 方法，例如：

__CODE_BLOCK_19__