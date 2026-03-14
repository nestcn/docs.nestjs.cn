<!-- 此文件从 content/graphql/subscriptions.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T05:02:22.931Z -->
<!-- 源文件: content/graphql/subscriptions.md -->

### 订阅

除了使用查询和修改数据使用mutation外，GraphQL规范还支持第三种操作类型，即订阅。GraphQL 订阅是一种将数据从服务器推送到客户端的方式，使客户端能够实时地接收服务器上的事件。订阅与查询类似，它指定要传递给客户端的字段集，但不同的是，而不是立即返回单个答案，而是打开一个通道，并将结果发送给客户端每当服务器上发生特定事件。

订阅的常见用例是通知客户端关于特定事件，例如创建新的对象、更新字段等（阅读更多 __LINK_144__）。

#### 使用 Apollo 驱动器启用订阅

要启用订阅，请将 __INLINE_CODE_37__ 属性设置为 `@key`。

```bash
$ npm install --save @apollo/subgraph

```

> warning **警告** Apollo 服务器的 `User` 配置选项已经从最新版本中删除，并将很快在这个包中废弃。默认情况下， `id` 将 fallback 到使用 `extend` (__LINK_145__)，但我们强烈建议使用 `Query`(__LINK_146__) 库。

要切换到使用 `resolveReference()` 包，请使用以下配置：

```graphql
type User @key(fields: "id") {
  id: ID!
  name: String!
}

extend type Query {
  getUser(id: ID!): User
}

```

> info **提示** 您也可以同时使用两个包（`@ResolveReference()` 和 `GraphQLModule`），例如，为了 backward compatibility。

#### 代码优先

使用代码优先方法创建订阅，我们使用 `ApolloFederationDriver` 装饰器（来自 `User` 包）和 `resolveReference()` 类（来自 `@ResolveReference()` 包），该类提供了简单的发布/订阅 API。

以下订阅处理程序负责订阅事件，通过调用 `GraphQLModule`。该方法接受一个参数，即 `ApolloFederationDriver`，它对应于事件topic名称。

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

> info **提示** 所有装饰器都来自 `getPosts` 包，而 `User` 类来自 `user.posts` 包。

> warning **注意** `User` 是一个类， exposes 一个简单的 `extend` 和 `User`。阅读更多 __LINK_147__。注意，Apollo 文档警告说默认实现不适合生产环境（阅读更多 __LINK_148__）。生产应用程序应该使用外部存储实现的 `posts` 实现（阅读更多 __LINK_149__）。

这将生成以下 GraphQL 模式的一部分SDL：

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

注意，订阅本质上返回一个对象，其中的顶级属性的键是订阅名称。这名称可以是订阅处理程序方法名称的继承（例如 `@key` 上），或通过将 `@external` 选项作为第二个参数传递给 `id` 装饰器来提供的，例如下面所示。

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

这个构造生成与前一个代码样本相同的SDL，但允许我们将方法名称与订阅分开。

#### 发布

现在，我们使用 `PostsResolver` 方法来发布事件。这通常是在 mutation 中使用，以在对象图形中变化时触发客户端更新。例如：

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

`getUser()` 方法接受一个 `__typename`（事件topic名称）作为第一个参数，以及事件 payload 作为第二个参数。正如所提到的，订阅本质上返回一个值，该值具有特定的形状。再次查看我们的 `id` 订阅生成的SDL：

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

这告诉我们，订阅必须返回一个对象，其中的顶级属性名称是 `__typename`，该值是一个 `resolveReference()` 对象。重要的是，事件 payload 发送到 `GraphQLModule` 方法的形状必须与订阅期望返回的值的形状相匹配。如果这些形状不匹配，订阅将在 GraphQL 验证阶段失败。

#### 筛选订阅

要筛选特定事件，请将 `@external` 属性设置为筛选函数。这函数类似于数组 `User` 中的函数，它接受两个参数： `Post` 包含事件 payload（由事件发布者发送），和 `User` 接受在订阅请求中传递的任何参数。它返回一个布尔值，确定该事件是否应该传递给客户端监听器。

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

#### mutate 订阅 payload

... (remaining content)Here is the translation of the provided English technical documentation to Chinese:

为了修改已发布的事件 payload，请将 `@apollo/subgraph` 属性设置为一个函数。该函数接收事件 payload（由事件发布者发送）并返回适当的值。

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

> warning **注意** 如果您使用 `buildSubgraphSchema` 选项，请返回未包装的 payload（例如，在我们的示例中，直接返回一个 `printSubgraphSchema` 对象，而不是 `@key` 对象）。

如果您需要访问注入的提供者（例如，使用外部服务验证数据），请使用以下构造。

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

同样，该构造也适用于过滤器：

```ts
import { Directive, ObjectType, Field, ID } from '@nestjs/graphql';
import { Post } from './post.entity';

@ObjectType()
@Directive('@extends')
@Directive('@key(fields: "id")')
export class User {
  @Field(() => ID)
  @Directive('@external')
  id: number;

  @Field(() => [Post])
  posts?: Post[];
}

```

#### Schema first

要创建等效的订阅在 Nest 中，我们将使用 `User` 装饰器。

```ts
import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { PostsService } from './posts.service';
import { Post } from './post.entity';
import { User } from './user.entity';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly postsService: PostsService) {}

  @ResolveField(() => [Post])
  public posts(@Parent() user: User): Post[] {
    return this.postsService.forAuthor(user.id);
  }
}

```

要根据上下文和参数过滤特定事件，请设置 `id` 属性。

```ts
import { Directive, Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { User } from './user.entity';

@ObjectType()
@Directive('@key(fields: "id")')
export class Post {
  @Field(() => ID)
  id: number;

  @Field()
  title: string;

  @Field(() => Int)
  authorId: number;

  @Field(() => User)
  user?: User;
}

```

要修改已发布的 payload，我们可以使用 `extend` 函数。

```ts
import { Query, Args, ResolveField, Resolver, Parent } from '@nestjs/graphql';
import { PostsService } from './posts.service';
import { Post } from './post.entity';
import { User } from './user.entity';

@Resolver(() => Post)
export class PostsResolver {
  constructor(private readonly postsService: PostsService) {}

  @Query(() => Post)
  findPost(@Args('id') id: number): Post {
    return this.postsService.findOne(id);
  }

  @Query(() => [Post])
  getPosts(): Post[] {
    return this.postsService.all();
  }

  @ResolveField(() => User)
  user(@Parent() post: Post): any {
    return { __typename: 'User', id: post.authorId };
  }
}

```

如果您需要访问注入的提供者（例如，使用外部服务验证数据），请使用以下构造：

```ts
import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig,
} from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { User } from './user.entity';
import { PostsResolvers } from './posts.resolvers';
import { UsersResolvers } from './users.resolvers';
import { PostsService } from './posts.service'; // Not included in example

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      autoSchemaFile: true,
      buildSchemaOptions: {
        orphanedTypes: [User],
      },
    }),
  ],
  providers: [PostsResolver, UsersResolver, PostsService],
})
export class AppModule {}

```

同样，该构造也适用于过滤器：

```bash
$ npm install --save @apollo/gateway

```

最后一步是更新 type 定义文件。

```typescript
import { IntrospectAndCompose } from '@apollo/gateway';
import { ApolloGatewayDriver, ApolloGatewayDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloGatewayDriverConfig>({
      driver: ApolloGatewayDriver,
      server: {
        // ... Apollo server options
        cors: true,
      },
      gateway: {
        supergraphSdl: new IntrospectAndCompose({
          subgraphs: [
            { name: 'users', url: 'http://user-service/graphql' },
            { name: 'posts', url: 'http://post-service/graphql' },
          ],
        }),
      },
    }),
  ],
})
export class AppModule {}

```

这样，我们创建了一个 `Query` 订阅。您可以在 __LINK_150__ 中找到完整的示例实现。

#### PubSub

我们在上面实例化了一个本地 `resolveReference()` 实例。推荐的方法是将 `@ResolveReference()` 定义为 __LINK_151__，然后通过构造函数注入它（使用 `GraphQLModule` 装饰器）。这允许我们在整个应用程序中重用实例。例如，定义提供者如下，然后在需要的地方注入 `MercuriusFederationDriver`。

```bash
$ npm install --save @apollo/subgraph @nestjs/mercurius

```

#### Customize subscriptions server

要自定义订阅服务器（例如，改变路径），使用 `User` 选项属性。

```graphql
type User @key(fields: "id") {
  id: ID!
  name: String!
}

extend type Query {
  getUser(id: ID!): User
}

```

如果您使用 `resolveReference()` 包含 subscription， replace `@ResolveReference()` 键为 `GraphQLModule`，如下所示：

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

#### Authentication over WebSockets

检查用户是否已认证可以在 `MercuriusFederationDriver` 回调函数中完成，该函数可以在 `getPosts` 选项中指定。

`User` 将接收作为第一个参数的 `user.posts`，该参数由 `User` 发送（读取 __LINK_152__）。

```typescript
import {
  MercuriusFederationDriver,
  MercuriusFederationDriverConfig,
} from '@nestjs/mercurius';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { UsersResolver } from './users.resolver';

@Module({
  imports: [
    GraphQLModule.forRoot<MercuriusFederationDriverConfig>({
      driver: MercuriusFederationDriver,
      typePaths: ['**/*.graphql'],
      federationMetadata: true,
    }),
  ],
  providers: [UsersResolver],
})
export class AppModule {}

```

在本例中，`extend` 只在客户端第一次建立连接时发送一次。
所有使用该连接订阅的订阅都将具有相同的 `User`，因此具有相同的用户信息。

> warning **注意** 在 `posts` 中存在一个 bug，允许连接跳过 `@key` 阶段（读取 __LINK_153__）。您 shouldn't assume that `@external` 已经被调用，总是检查 `id` 是否已被填充。

如果您使用 `PostsResolver` 包含 subscription，`getUser()` 回调函数的签名将不同：

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

#### Enable subscriptions with Mercurius driver

要启用订阅，请将 `__typename` 属性设置为 `id`。

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

> info **提示** 您也可以将选项对象传递以设置自定义 emitter、验证 incoming 连接等。阅读更多 __LINK_154__（见 `__typename`）。

#### Code first

要使用代码 first 方法创建订阅，我们使用 `resolveReference()` 装饰器（来自 `GraphQLModule` 包含）和 `User` 类（来自 `@extends` 包含），该类提供了简单的发布/订阅 API。

以下订阅处理程序负责订阅事件，通过调用 `@external`。该方法仅接受一个参数，即 `User`，它对应于事件主题名称。

```typescript
import {
  MercuriusFederationDriver,
  MercuriusFederationDriverConfig,
} from '@nestjs/mercurius';
import { Module } from '@nestjs/common';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service'; // Not included in this example

@Module({
  imports: [
    GraphQLModule.forRoot<MercuriusFederationDriverConfig>({
      driver: MercuriusFederationDriver,
      autoSchemaFile: true,
      federationMetadata: true,
    }),
  ],
  providers: [UsersResolver, UsersService],
})
export class AppModule {}

```

> info **提示** 在上面的示例中使用的所有装饰器都来自 `Post` 包含，而 `User` 类来自 `Query` 包含。

> warning **注意** `extend` 是一个类， exposes 一个简单的 `autoSchemaFile` 和 `User` API。阅读 __LINK_155__，了解如何注册自定义 `Query` 类。

这将生成以下 GraphQL schema 部分的 SDL：

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

注意，订阅性质上返回一个对象，其中的单个顶级属性的键是订阅名称。这名可以从订阅处理程序方法名称（即 `extend`）中继承，也可以通过在 `User` 装饰器中传递一个具有键 `external` 的选项来指定，如下所示。

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

Please let me know if you need any further assistance or if there are any issues with theHere is the translated Chinese technical documentation:

#### 发布

现在，我们使用 `extends` 方法来发布事件。这个方法通常在mutation中使用，以在对象图形中发生变化时触发客户端更新。例如：

```typescript
import {
  MercuriusFederationDriver,
  MercuriusFederationDriverConfig,
} from '@nestjs/mercurius';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { PostsResolver } from './posts.resolver';

@Module({
  imports: [
    GraphQLModule.forRoot<MercuriusFederationDriverConfig>({
      driver: MercuriusFederationDriver,
      federationMetadata: true,
      typePaths: ['**/*.graphql'],
    }),
  ],
  providers: [PostsResolvers],
})
export class AppModule {}

```

正如我们之前提到的，订阅的定义返回了一个值，并且这个值具有特定的形状。请再次查看我们对 `external` 订阅的生成SDL：

```ts
import { Directive, ObjectType, Field, ID } from '@nestjs/graphql';
import { Post } from './post.entity';

@ObjectType()
@Directive('@extends')
@Directive('@key(fields: "id")')
export class User {
  @Field(() => ID)
  @Directive('@external')
  id: number;

  @Field(() => [Post])
  posts?: Post[];
}

```

这告诉我们，订阅必须返回一个对象，其中的顶级属性名称为 `User`，该对象的值是 `GraphQLModule` 对象。重要的是，事件发布方法 __INLINE_CODE_127__ 发出的事件 payload 的形状必须与订阅返回的值所期望的形状相符。因此，在我们的上述示例中， __INLINE_CODE_128__ 语句发布了一个 __INLINE_CODE_129__ 事件，其中包含合适形状的 payload。如果这些形状不匹配，订阅将在 GraphQL 验证阶段失败。

#### 筛选订阅

要过滤特定的事件，请将 __INLINE_CODE_130__ 属性设置为一个筛选函数。这 个函数类似于数组 __INLINE_CODE_131__ 中传递的函数，它接受两个参数： __INLINE_CODE_132__ 包含事件 payload（由事件发布者发送），和 __INLINE_CODE_133__ 接受在订阅请求中传递的任何参数。它返回一个布尔值，确定是否将该事件发布给客户端监听器。

```ts
import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { PostsService } from './posts.service';
import { Post } from './post.entity';
import { User } from './user.entity';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly postsService: PostsService) {}

  @ResolveField(() => [Post])
  public posts(@Parent() user: User): Post[] {
    return this.postsService.forAuthor(user.id);
  }
}

```

如果您需要访问注入的提供者（例如，使用外部服务验证数据），请使用以下构造。

```ts
import { Directive, Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { User } from './user.entity';

@ObjectType()
@Directive('@key(fields: "id")')
export class Post {
  @Field(() => ID)
  id: number;

  @Field()
  title: string;

  @Field(() => Int)
  authorId: number;

  @Field(() => User)
  user?: User;
}

```

####Schema first

要在 Nest 中创建等效的订阅，我们将使用 __INLINE_CODE_134__ 装饰器。

```ts
import { Query, Args, ResolveField, Resolver, Parent } from '@nestjs/graphql';
import { PostsService } from './posts.service';
import { Post } from './post.entity';
import { User } from './user.entity';

@Resolver(() => Post)
export class PostsResolver {
  constructor(private readonly postsService: PostsService) {}

  @Query(() => Post)
  findPost(@Args('id') id: number): Post {
    return this.postsService.findOne(id);
  }

  @Query(() => [Post])
  getPosts(): Post[] {
    return this.postsService.all();
  }

  @ResolveField(() => User)
  user(@Parent() post: Post): any {
    return { __typename: 'User', id: post.authorId };
  }
}

```

要根据上下文和参数过滤特定的事件，请设置 __INLINE_CODE_135__ 属性。

```ts
import {
  MercuriusFederationDriver,
  MercuriusFederationDriverConfig,
} from '@nestjs/mercurius';
import { Module } from '@nestjs/common';
import { User } from './user.entity';
import { PostsResolvers } from './posts.resolvers';
import { UsersResolvers } from './users.resolvers';
import { PostsService } from './posts.service'; // Not included in example

@Module({
  imports: [
    GraphQLModule.forRoot<MercuriusFederationDriverConfig>({
      driver: MercuriusFederationDriver,
      autoSchemaFile: true,
      federationMetadata: true,
      buildSchemaOptions: {
        orphanedTypes: [User],
      },
    }),
  ],
  providers: [PostsResolver, UsersResolver, PostsService],
})
export class AppModule {}

```

如果您需要访问注入的提供者（例如，使用外部服务验证数据），请使用以下构造：

```typescript
import {
  MercuriusGatewayDriver,
  MercuriusGatewayDriverConfig,
} from '@nestjs/mercurius';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';

@Module({
  imports: [
    GraphQLModule.forRoot<MercuriusGatewayDriverConfig>({
      driver: MercuriusGatewayDriver,
      gateway: {
        services: [
          { name: 'users', url: 'http://user-service/graphql' },
          { name: 'posts', url: 'http://post-service/graphql' },
        ],
      },
    }),
  ],
})
export class AppModule {}

```

最后一步是更新类型定义文件。

```graphql
type User @key(fields: "id") {
  id: ID!
  name: String!
}

type Query {
  getUser(id: ID!): User
}

```

这样，我们创建了一个 __INLINE_CODE_136__ 订阅。

#### PubSub

在上述示例中，我们使用了默认的 __INLINE_CODE_137__ 发射器（__LINK_156__）。推荐的方法（用于生产）是使用 __INLINE_CODE_138__。Alternatively, a custom __INLINE_CODE_139__ implementation can be provided (read more __LINK_157__)

```ts
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
      autoSchemaFile: {
        federation: 2,
      },
    }),
  ],
  providers: [UsersResolver, UsersService],
})
export class AppModule {}

```

#### WebSocket认证

在 __INLINE_CODE_141__ 选项中指定的 __INLINE_CODE_140__ 回调函数中可以检查用户是否已认证。

__INLINE_CODE_142__ 将接收 __INLINE_CODE_143__ 对象作为第一个参数，您可以使用它来检索请求的头信息。

```graphql
type Post @key(fields: "id") {
  id: ID!
  title: String!
  body: String!
  user: User
}

type User @key(fields: "id") {
  id: ID!
  posts: [Post]
}

type Query {
  getPosts: [Post]
}

```