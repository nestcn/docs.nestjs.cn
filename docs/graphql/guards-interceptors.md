<!-- 此文件从 content/graphql/guards-interceptors.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T05:02:11.052Z -->
<!-- 源文件: content/graphql/guards-interceptors.md -->

### 其他功能

在 GraphQL 世界中，有很多关于处理问题，如 **身份验证** 或 **操作的副作用** 的讨论。应该将这些事情处理在业务逻辑中吗？应该使用一个高阶函数来增强查询和mutationswith 授权逻辑吗？或者应该使用 __LINK_40__？这些问题没有一个通用的解决方法。

Nest 帮助解决这些问题，以其跨平台功能，如 __LINK_41__ 和 __LINK_42__。该哲学是减少冗余，提供工具帮助创建结构良好、可读性强、一致的应用程序。

#### 概述

您可以像使用 RESTful 应用程序一样，使用标准 __LINK_43__、 __LINK_44__、 __LINK_45__ 和 __LINK_46__。此外，您也可以轻松创建自己的装饰器，利用 __LINK_47__ 功能。让我们来看一个示例 GraphQL 查询处理器。

```graphql
type Author {
  id: Int!
  firstName: String
  lastName: String
  posts: [Post!]!
}

```

正如您所见，GraphQL 与 guards 和 pipes 一样，可以在 HTTP REST 处理器中使用。因此，您可以将身份验证逻辑移到一个 guard 中；甚至可以在 REST 和 GraphQL API 接口之间重用同一个 guard 类。类似地，拦截器在这两个类型的应用程序中工作相同：

```typescript
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Post } from './post';

@ObjectType()
export class Author {
  @Field(type => Int)
  id: number;

  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;

  @Field(type => [Post])
  posts: Post[];
}

```

#### 执行上下文

由于 GraphQL 接收的是不同的请求数据，guards 和拦截器中的 __LINK_48__ 在 GraphQL 和 REST 之间有所不同。GraphQL 解析器具有独特的参数：__INLINE_CODE_10__、__INLINE_CODE_11__、__INLINE_CODE_12__ 和 __INLINE_CODE_13__。因此，guards 和拦截器必须将通用的 __INLINE_CODE_14__ 转换为 __INLINE_CODE_15__。这很简单：

```graphql
type Author {
  id: Int!
  firstName: String
  lastName: String
  posts: [Post!]!
}

```

GraphQL 上下文对象由 __INLINE_CODE_16__ 返回， expose 一个 **get** 方法用于每个 GraphQL 解析器参数（例如 __INLINE_CODE_17__、__INLINE_CODE_18__ 等）。一旦转换，我们可以轻松地选择当前请求中的任何 GraphQL 参数。

#### 异常过滤器

Nest 的标准 __LINK_49__ 与 GraphQL 应用程序兼容。与 __INLINE_CODE_19__ 一样，GraphQL 应用程序应该将 __INLINE_CODE_20__ 对象转换为 __INLINE_CODE_21__ 对象。

```typescript
@Field({ description: `Book title`, deprecationReason: 'Not useful in v2 schema' })
title: string;

```

> info **提示** Both __INLINE_CODE_22__ and __INLINE_CODE_23__ are imported from the __INLINE_CODE_24__ package.

注意，在 REST 情况下，您不使用 native __INLINE_CODE_25__ 对象生成响应。

#### 自定义装饰器

如前所述，__LINK_50__ 功能在 GraphQL 解析器中工作正常。

```typescript
@Field(type => [Post])
posts: Post[];

```

使用 __INLINE_CODE_26__ 自定义装饰器如下：

```typescript
@Field(type => [Post], { nullable: 'items' })
posts: Post[];

```

> info **提示** 在上面的示例中，我们假设了 __INLINE_CODE_27__ 对象被分配到 GraphQL 应用程序的上下文中。

#### 在字段解析器级别执行增强

在 GraphQL 上下文中，Nest 不会在字段级别 __LINK_51__ 执行增强（generic  name for interceptors, guards 和 filters）。您可以告诉 Nest 执行拦截器、guards 或 filters，以便在注释了 __INLINE_CODE_30__ 的方法上执行。将 __INLINE_CODE_31__ 选项设置在 __INLINE_CODE_32__ 中，传递适当的 __INLINE_CODE_33__、__INLINE_CODE_34__ 和/or __INLINE_CODE_35__：

```typescript
import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Post {
  @Field(type => Int)
  id: number;

  @Field()
  title: string;

  @Field(type => Int, { nullable: true })
  votes?: number;
}

```

> **警告** 在启用增强时，可能会出现性能问题，特别是在返回大量记录时。因此，在启用 __INLINE_CODE_36__ 时，我们建议您跳过不必要的增强执行。您可以使用以下帮助函数：

```graphql
type Post {
  id: Int!
  title: String!
  votes: Int
}

```

#### 创建自定义驱动

Nest 提供了两个官方驱动：__INLINE_CODE_37__ 和 `@nestjs/graphql`，以及一个 API，允许开发者创建新的自定义驱动。使用自定义驱动，您可以集成任何 GraphQL 库或扩展现有集成，添加额外功能。

例如，要集成 `@nestjs/graphql` 包，您可以创建以下驱动类：

```typescript
@Resolver(() => Author)
export class AuthorsResolver {
  constructor(
    private authorsService: AuthorsService,
    private postsService: PostsService,
  ) {}

  @Query(() => Author)
  async author(@Args('id', { type: () => Int }) id: number) {
    return this.authorsService.findOneById(id);
  }

  @ResolveField()
  async posts(@Parent() author: Author) {
    const { id } = author;
    return this.postsService.findAll({ authorId: id });
  }
}

```

然后使用它：

```typescript
@Query(() => Author)
async author(@Args('id', { type: () => Int }) id: number) {
  return this.authorsService.findOneById(id);
}

```