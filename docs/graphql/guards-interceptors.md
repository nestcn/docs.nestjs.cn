<!-- 此文件从 content/graphql/guards-interceptors.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T05:27:32.442Z -->
<!-- 源文件: content/graphql/guards-interceptors.md -->

### 其他功能

在 GraphQL 世界中，有很多关于处理问题，如 **身份验证** 或 **操作的副作用**。我们是否应该在业务逻辑中处理这些问题？是否使用高阶函数来增强查询和 mutation 和 authorization 逻辑？或者是否使用 __LINK_40__？这些问题没有唯一的解决方案。

Nest 帮助解决这些问题，提供了跨平台的功能，如 __LINK_41__ 和 __LINK_42__。Nest 的哲学是减少冗余，提供工具，帮助创建结构良好、可读性良好和一致的应用程序。

#### 概述

您可以使用标准的 __LINK_43__、__LINK_44__、__LINK_45__ 和 __LINK_46__ 在 GraphQL 中使用同样的方式，以便与 RESTful 应用程序一样。同时，您也可以轻松地创建自己的装饰器，通过 __LINK_47__ 功能来做到这一点。让我们来看一个 GraphQL 查询处理器的示例。

```graphql
type Author {
  id: Int!
  firstName: String
  lastName: String
  posts: [Post!]!
}

```

正如您所看到的，GraphQL 与 guards 和 pipes 在同一个方式下工作，正如 HTTP REST 处理器一样。因此，您可以将身份验证逻辑移到 guard 中；您甚至可以在 REST 和 GraphQL API 接口之间重用同一个 guard 类。类似地，拦截器在两个类型的应用程序中工作相同：

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

由于 GraphQL 接收不同的数据类型，guards 和拦截器接收的 __LINK_48__ 与 REST 略有不同。GraphQL 解析器具有独特的参数：__INLINE_CODE_10__、__INLINE_CODE_11__、__INLINE_CODE_12__ 和 __INLINE_CODE_13__。因此，guards 和拦截器必须将泛型 __INLINE_CODE_14__ 转换为 __INLINE_CODE_15__。这非常简单：

```graphql
type Author {
  id: Int!
  firstName: String
  lastName: String
  posts: [Post!]!
}

```

GraphQL 上下文对象返回的 __INLINE_CODE_16__ expose 一个 **get** 方法，每个 GraphQL 解析器参数（例如 __INLINE_CODE_17__、__INLINE_CODE_18__ 等）。将其转换后，我们可以轻松地选择当前请求的任何 GraphQL 参数。

#### 异常过滤器

Nest 的标准 __LINK_49__ 兼容 GraphQL 应用程序。与 __INLINE_CODE_19__ 一样，GraphQL 应用程序应该将 __INLINE_CODE_20__ 对象转换为 __INLINE_CODE_21__ 对象。

```typescript
@Field({ description: `Book title`, deprecationReason: 'Not useful in v2 schema' })
title: string;

```

> info **提示** __INLINE_CODE_22__ 和 __INLINE_CODE_23__ 都来自 __INLINE_CODE_24__ 包。

注意，与 REST 不同，您不需要使用-native __INLINE_CODE_25__ 对象生成响应。

#### 自定义装饰器

如前所述，__LINK_50__ 功能与 GraphQL 解析器工作相同。

```typescript
@Field(type => [Post])
posts: Post[];

```

使用 __INLINE_CODE_26__ 自定义装饰器如下：

```typescript
@Field(type => [Post], { nullable: 'items' })
posts: Post[];

```

> info **提示** 在上面的示例中，我们假设 __INLINE_CODE_27__ 对象被分配给 GraphQL 应用程序的上下文。

#### 在字段解析器级别执行增强

在 GraphQL 上下文中，Nest 不会在字段级别 __LINK_51__: 只有在顶级 __INLINE_CODE_28__/__INLINE_CODE_29__ 方法上运行增强。您可以告诉 Nest 执行拦截器、guards 或过滤器，方法是将 __INLINE_CODE_31__ 选项设置为 __INLINE_CODE_32__。将其设置为 __INLINE_CODE_33__、__INLINE_CODE_34__ 和/or __INLINE_CODE_35__：

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

> **警告** 在启用增强时，可能会导致性能问题，当您返回大量记录时，field 解析器被执行数千次。因此，我们建议在启用增强时跳过非必要的增强，使用以下助手函数：

```graphql
type Post {
  id: Int!
  title: String!
  votes: Int
}

```

#### 创建自定义驱动

Nest 提供了两个官方驱动：__INLINE_CODE_37__ 和 `@nestjs/graphql`，以及 API，允许开发者创建新的 **自定义驱动**。使用自定义驱动，您可以集成任何 GraphQL 库或扩展现有集成，添加额外功能。

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

然后，您可以使用它：

```typescript
@Query(() => Author)
async author(@Args('id', { type: () => Int }) id: number) {
  return this.authorsService.findOneById(id);
}

```