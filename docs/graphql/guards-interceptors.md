<!-- 此文件从 content/graphql/guards-interceptors.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T04:55:19.273Z -->
<!-- 源文件: content/graphql/guards-interceptors.md -->

### 其他功能

在 GraphQL 世界中，有很多关于处理问题，如 **身份验证** 或 **操作的副作用** 的讨论。我们是否应该在业务逻辑中处理这些问题？是否应该使用高阶函数来增强查询和mutations的逻辑？或者是否应该使用 __LINK_40__？这些问题并没有一个统一的答案。

Nest 帮助解决这些问题，它具有跨平台的功能，如 __LINK_41__ 和 __LINK_42__。哲学是减少冗余，并提供工具来创建结构良好、可读、一致的应用程序。

#### 概述

您可以使用标准的 __LINK_43__、 __LINK_44__、 __LINK_45__ 和 __LINK_46__ 一样使用 GraphQL 一样使用 RESTful 应用程序。另外，您也可以轻松创建自己的装饰器，利用 __LINK_47__ 功能。让我们来看看一个示例 GraphQL 查询处理器。

```bash
$ npm install --save @apollo/subgraph

```

正如您所看到的，GraphQL 与 Guard 和 Pipe 一样使用 HTTP REST 处理程序一样。因此，您可以将身份验证逻辑移动到 Guard 中；您甚至可以重用同一个 Guard 类在 REST 和 GraphQL API 接口之间。类似地，拦截器在两个应用程序中工作方式相同：

```graphql
type User @key(fields: "id") {
  id: ID!
  name: String!
}

extend type Query {
  getUser(id: ID!): User
}

```

#### 执行上下文

由于 GraphQL 接收的 incoming 请求不同，__LINK_48__ 收到的 Guard 和拦截器的不同于 REST。GraphQL 解析器具有不同的参数：__INLINE_CODE_10__、__INLINE_CODE_11__、__INLINE_CODE_12__ 和 __INLINE_CODE_13__。因此，Guard 和拦截器必须将通用的 __INLINE_CODE_14__ 转换为 __INLINE_CODE_15__。这很简单：

```typescript
import { Args, Query, Resolver, ResolveReference } from '@nestjs/graphql';
import { UsersService } from './users.service';

@Resolver('User')
export class UsersResolver {
  constructor(private usersService: UsersService) {}

  @Query()
  getUser(@Args('id') id: string) {
    return this.usersService.findById(id);
  }

  @ResolveReference()
  resolveReference(reference: { __typename: string; id: string }) {
    return this.usersService.findById(reference.id);
  }
}

```

GraphQL 上下文对象由 __INLINE_CODE_16__ expose 的 **get** 方法返回每个 GraphQL 解析器参数（例如 __INLINE_CODE_17__ 和 __INLINE_CODE_18__ 等）。一旦转换，我们可以轻松地选择当前请求的任何 GraphQL 参数。

#### 异常过滤器

Nest 的标准 __LINK_49__ 也兼容 GraphQL 应用程序。与 __INLINE_CODE_19__ 一样，GraphQL 应用程序应该将 __INLINE_CODE_20__ 对象转换为 __INLINE_CODE_21__ 对象。

```typescript
import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig,
} from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { UsersResolver } from './users.resolver';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      typePaths: ['**/*.graphql'],
    }),
  ],
  providers: [UsersResolver],
})
export class AppModule {}

```

> 信息 **提示**Both __INLINE_CODE_22__ 和 __INLINE_CODE_23__ 来自 __INLINE_CODE_24__ 包。

注意，相比 REST，GraphQL 不使用native __INLINE_CODE_25__ 对象生成响应。

#### 自定义装饰器

如前所述，__LINK_50__ 功能与 GraphQL 解析器工作相同。

```ts
import { Directive, Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Directive('@key(fields: "id")')
export class User {
  @Field(() => ID)
  id: number;

  @Field()
  name: string;
}

```

使用 __INLINE_CODE_26__ 自定义装饰器，如下所示：

```ts
import { Args, Query, Resolver, ResolveReference } from '@nestjs/graphql';
import { User } from './user.entity';
import { UsersService } from './users.service';

@Resolver(() => User)
export class UsersResolver {
  constructor(private usersService: UsersService) {}

  @Query(() => User)
  getUser(@Args('id') id: number): User {
    return this.usersService.findById(id);
  }

  @ResolveReference()
  resolveReference(reference: { __typename: string; id: number }): User {
    return this.usersService.findById(reference.id);
  }
}

```

> 信息 **提示** 在上面的示例中，我们假设 __INLINE_CODE_27__ 对象被分配到 GraphQL 应用程序的上下文中。

#### 在字段解析器级别执行增强器

在 GraphQL 上下文中，Nest 不在字段级别 __LINK_51__ 执行增强器（通用的拦截器、Guard 和过滤器）。您可以告诉 Nest 执行拦截器、Guard 或过滤器的方法，以 __INLINE_CODE_30__ 注解的方法。将 __INLINE_CODE_31__ 选项在 __INLINE_CODE_32__ 中设置，传递一个 __INLINE_CODE_33__、__INLINE_CODE_34__ 和/or __INLINE_CODE_35__ 列表：

```typescript
import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig,
} from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service'; // Not included in this example

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      autoSchemaFile: true,
    }),
  ],
  providers: [UsersResolver, UsersService],
})
export class AppModule {}

```

> 警告 使用增强器执行字段解析器可能会在您返回大量记录时导致性能问题。因此，在启用 __INLINE_CODE_36__ 时，我们建议您跳过执行增强器，除非它们对字段解析器是必要的。您可以使用以下帮助函数：

```graphql
type Post @key(fields: "id") {
  id: ID!
  title: String!
  body: String!
  user: User
}

extend type User @key(fields: "id") {
  id: ID! @external
  posts: [Post]
}

extend type Query {
  getPosts: [Post]
}

```

#### 创建自定义驱动

Nest 提供了两个官方驱动：__INLINE_CODE_37__ 和 `@key`，以及一个 API，允许开发者创建新的自定义驱动。使用自定义驱动，您可以集成任何 GraphQL 库或扩展现有的集成，添加额外功能。

例如，要集成 `User` 包，您可以创建以下驱动类：

```typescript
import { Query, Resolver, Parent, ResolveField } from '@nestjs/graphql';
import { PostsService } from './posts.service';
import { Post } from './posts.interfaces';

@Resolver('Post')
export class PostsResolver {
  constructor(private postsService: PostsService) {}

  @Query('getPosts')
  getPosts() {
    return this.postsService.findAll();
  }

  @ResolveField('user')
  getUser(@Parent() post: Post) {
    return { __typename: 'User', id: post.userId };
  }
}

```

然后使用它：

```typescript
import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig,
} from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { PostsResolver } from './posts.resolver';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      typePaths: ['**/*.graphql'],
    }),
  ],
  providers: [PostsResolvers],
})
export class AppModule {}

```