<!-- 此文件从 content/graphql/unions-and-enums.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T05:06:40.154Z -->
<!-- 源文件: content/graphql/unions-and-enums.md -->

### 联合类型

联合类型与接口类似，但是它们不能指定公共字段之间的关系（阅读更多 __LINK_50__）。联合类型非常有用，用于从单个字段返回不同的数据类型。

#### 代码优先

要定义 GraphQL 联合类型，我们需要定义该联合类型将包含的类。根据 Apollo 文档中的 __LINK_51__，我们将创建两个类。首先是 `@Field`：

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

现在，我们可以使用来自 `PostsService` 包的 `votes` 函数注册 `PostsService` 联合类型：

```typescript
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class UpvotePostInput {
  @Field()
  postId: number;
}

```

> 警告 **警告** `upvotePost(postId: Int!): Post` 属性返回的数组需要 const 确认。如果没有给出 const 确认，编译时将生成错误的声明文件，使用时将发生错误。

现在，我们可以在查询中引用 __INLINE_CODE_27__：

```typescript
@Mutation(() => Post)
async upvotePost(
  @Args('upvotePostData') upvotePostData: UpvotePostInput,
) {}

```

这将生成以下部分的 GraphQL schema 在 SDL 中：

```typescript
@Mutation()
async upvotePost(@Args('postId') postId: number) {
  return this.postsService.upvoteById({ id: postId });
}

```

默认情况下，库将生成的 __INLINE_CODE_28__ 函数将根据 resolver 方法返回的值来提取类型。这意味着返回类实例，而不是使用 JavaScript 对象。

为了提供自定义的 __INLINE_CODE_29__ 函数，请将 __INLINE_CODE_30__ 属性传递到 __INLINE_CODE_31__ 函数的选项对象中，如下所示：

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

要在 schema 优先级中定义联合类型，简单地创建 GraphQL 联合类型。

__CODE_BLOCK_6__

然后，您可以使用 typings 生成特性（如 __LINK_52__ 章节中所示）来生成相应的 TypeScript 定义：

__CODE_BLOCK_7__

联合类型需要在 resolver 映射中添加额外的 __INLINE_CODE_32__ 字段，以确定该联合类型应该解析为哪个类型。此外，注意 __INLINE_CODE_33__ 类需要在任何模块中注册为提供者。让我们创建一个 __INLINE_CODE_34__ 类并定义 __INLINE_CODE_35__ 方法。

__CODE_BLOCK_8__

> 提示 **提示** 所有装饰器都来自 __INLINE_CODE_36__ 包。

### 枚举类型

枚举类型是一种特殊的标量类型，它被限制在特定的允许值中（阅读更多 __LINK_53__）。这允许您：

- 验证该类型的任何参数是否为允许的值
- 通過类型系统表明该字段将始终是有限集中的值

#### 代码优先

使用代码优先方法时，您定义 GraphQL 枚举类型 simply 创建 TypeScript 枚举。

__CODE_BLOCK_9__

现在，我们可以注册 __INLINE_CODE_37__ 枚举使用来自 __INLINE_CODE_39__ 包的 __INLINE_CODE_38__ 函数：

__CODE_BLOCK_10__

现在，我们可以在类型中引用 __INLINE_CODE_40__：

__CODE_BLOCK_11__

这将生成以下部分的 GraphQL schema 在 SDL 中：

__CODE_BLOCK_12__

为了提供枚举的描述，请将 __INLINE_CODE_41__ 属性传递到 __INLINE_CODE_42__ 函数中。

__CODE_BLOCK_13__

为了提供枚举值的描述，或者将值标记为弃用，请将 __INLINE_CODE_43__ 属性传递到 __INLINE_CODE_44__ 函数中，如下所示：

__CODE_BLOCK_14__

这将生成以下 GraphQL schema 在 SDL 中：

__CODE_BLOCK_15__

#### Schema 优先

要在 schema 优先级中定义枚举类型，简单地创建 GraphQL 枚举。

__CODE_BLOCK_16__

然后，您可以使用 typings 生成特性（如 __LINK_54__ 章节中所示）来生成相应的 TypeScript 定义：

__CODE_BLOCK_17__

有时，后端强制将枚举值内部强制为与公共 API 中的值不同的值。在这个示例中，API 中包含 __INLINE_CODE_44__，但是在解析器中我们可能使用 __INLINE_CODE_45__ 而不是（阅读更多 __LINK_55__）。为了实现这个目标，声明枚举 __INLINE_CODE_46__ 的解析器对象：

__CODE_BLOCK_18__

> 提示 **提示** 所有装饰器都来自 __INLINE_CODE_47__ 包。

然后，使用这个解析器对象和 __INLINE_CODE_48__ 属性的 __INLINE_CODE_49__ 方法，如下所示：

__CODE_BLOCK_19__

### End