### Federation

Federation 提供了一种将您的单体 GraphQL 服务器拆分成独立微服务的方法。它由两个组件组成：一个网关和一个或多个联邦微服务。每个微服务持有部分 schema，而网关将这些 schema 组合成一个可以被客户端消费的单个 schema。

根据 [Apollo 文档](https://blog.apollographql.com/apollo-federation-f260cf525d21)，Federation 的设计原则是：

- 构建图形应该是 **声明式** 的。通过 Federation，您可以从 schema 中声明构建图形，而不是编写命令式的 schema Stitching 代码。
- 代码应该根据 **关注点** 分离，而不是根据类型。通常，单个团队不控制重要类型的每个方面，因此这些类型的定义应该分布在多个团队和代码库中，而不是集中在一个地方。
- 图形应该是简单的，可以供客户端消费。联邦服务可以形成一个完整的、产品-关注的图形，该图形准确反映了客户端的消费方式。
- 这只是一种 **GraphQL**，使用了语言规范的特性。任何语言，不只是 JavaScript，可以实现 Federation。

> warning **警告** Federation 目前不支持订阅。

在以下部分，我们将设置一个演示应用程序，包含一个网关和两个联邦端点：Users 服务和 Posts 服务。

#### 使用 Apollo 实现 Federation

首先，安装所需的依赖项：

```bash
$ npm install --save @apollo/subgraph

```

#### Schema First 模式

"Users 服务" 提供了一个简单的 schema。注意 `@key` 指令：它告诉 Apollo 查询计划器，如果指定了 `id`，可以获取特定的 `User` 实例。此外，我们 `extend` 了 `Query` 类型。

```graphql
type User @key(fields: "id") {
  id: ID!
  name: String!
}

extend type Query {
  getUser(id: ID!): User
}

```

Resolver 提供了一个额外的方法名为 `resolveReference()`。这个方法在 Apollo 网关执行时被触发，我们将在 Posts 服务中看到这个示例。请注意，这个方法必须被 `@ResolveReference()` 装饰器标注。

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

最后，我们将所有组件连接起来，通过在配置对象中注册 `GraphQLModule`，并将 `ApolloFederationDriver` 驱动器作为参数传递：

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

#### Code First 模式

首先，让我们为 `User` 实体添加一些额外的装饰器。

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

Resolver 提供了一个额外的方法名为 `resolveReference()`。这个方法在 Apollo 网关执行时被触发，我们将在 Posts 服务中看到这个示例。请注意，这个方法必须被 `@ResolveReference()` 装饰器标注。

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

最后，我们将所有组件连接起来，通过在配置对象中注册 `GraphQLModule`，并将 `ApolloFederationDriver` 驱动器作为参数传递：

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

工作示例可在 [这里](https://github.com/nestjs/nest/tree/master/sample/31-graphql-federation-code-first/users-application) 找到（Code First 模式），或在 [这里](https://github.com/nestjs/nest/tree/master/sample/32-graphql-federation-schema-first/users-application) 找到（Schema First 模式）。

#### 联邦示例：Posts 服务

Posts 服务应该通过 `getPosts` 查询提供聚合的 posts，同时扩展我们的 `User` 类型，以添加 `user.posts` 字段。

#### Schema First 模式

"Posts 服务" 在其 schema 中引用了 `User` 类型，使用 `extend` 关键字标记。此外，它还声明了 `User` 类型的一个额外属性（`posts`）。注意 `@key` 指令用于匹配 User 实例，和 `@external` 指令指示 `id` 字段在其他地方管理。

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

在以下示例中，`PostsResolver` 提供了 `getUser()` 方法，该方法返回包含 `__typename` 和一些应用程序可能需要来解析引用的额外属性，在这里是 `id`。`__typename` 由 GraphQL 网关使用，以确定负责 User 类型的微服务，并在执行 `resolveReference()` 方法时请求对应的实例。 "Users 服务" 在上一部分中描述。

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

最后，我们必须注册 `GraphQLModule`，与在 "Users 服务" 部分中一样。

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

#### Code First 模式

首先，我们将声明一个表示 `User` 实体的类。虽然实体本身生活在另一个服务中，但我们将在这里使用它（扩展其定义）。注意 `@extends` 和 `@external` 指令。

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

现在，让我们为 `User` 实体的扩展创建相应的 resolver：

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

我们还需要定义 `Post` 实体类：

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

及其 resolver：

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

最后，让我们将所有组件连接起来，在模块中。请注意架构构建选项，我们指定了 `User` 是一个孤立的（外部）类型。

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

可用的工作示例在 [这里](https://github.com/nestjs/nest/tree/master/sample/31-graphql-federation-code-first/posts-application) 和 [这里](https://github.com/nestjs/nest/tree/master/sample/32-graphql-federation-schema-first/posts-application) 中。

#### 联邦示例：Gateway

首先安装所需的依赖项：

```bash
$ npm install --save @apollo/gateway

```

Gateway 需要指定的端点列表，并且将自动发现相应的架构。因此，Gateway 服务的实现将保持 code 和 schema 两种模式相同。

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

可用的工作示例在 [这里](https://github.com/nestjs/nest/tree/master/sample/31-graphql-federation-code-first/gateway) 和 [这里](https://github.com/nestjs/nest/tree/master/sample/32-graphql-federation-schema-first/gateway) 中。

#### 使用 Mercurius 实现 Federation

首先安装所需的依赖项：

```bash
$ npm install --save @apollo/subgraph @nestjs/mercurius

```

> info **注意** 需要 `@apollo/subgraph` 包来构建子图架构 (`buildSubgraphSchema`、`printSubgraphSchema` 函数)。

#### Schema First 模式

"用户服务" 提供了一个简单的架构。注意 `@key` 指令：它告诉 Mercurius 查询计划器，如果您指定了 `id`，可以获取 `User` 的实例。另外，我们 `extend` 了 `Query` 类型。

```graphql
type User @key(fields: "id") {
  id: ID!
  name: String!
}

extend type Query {
  getUser(id: ID!): User
}

```

Resolver 提供了一个额外的方法名为 `resolveReference()`。这个方法在 Mercurius Gateway 执行时被触发，我们将在 Posts 服务中看到这个例子。请注意，这个方法必须被 `@ResolveReference()` 装饰器标注。

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

最后，我们将所有内容连接起来，通过在配置对象中注册 `GraphQLModule`，并将 `MercuriusFederationDriver` 驱动器传递给它：

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

#### Code First 模式

首先，让我们为 `User` 实体添加一些额外的装饰器。

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

Resolver 提供了一个额外的方法名为 `resolveReference()`。这个方法在 Mercurius Gateway 执行时被触发，我们将在 Posts 服务中看到这个例子。请注意，这个方法必须被 `@ResolveReference()` 装饰器标注。

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

最后，我们将所有内容连接起来，通过在配置对象中注册 `GraphQLModule`，并将 `MercuriusFederationDriver` 驱动器传递给它：

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

#### 联邦示例：Posts 服务

Posts 服务应该通过 `getPosts` 查询提供聚合的 posts，同时扩展我们的 `User` 类型，以添加 `user.posts` 字段。

#### Schema First 模式

"Posts 服务" 在其 schema 中引用了 `User` 类型，使用 `extend` 关键字标记。此外，它还声明了 `User` 类型的一个额外属性（`posts`）。注意 `@key` 指令用于匹配 User 实例，和 `@external` 指令指示 `id` 字段在其他地方管理。

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

在以下示例中，`PostsResolver` 提供了 `getUser()` 方法，该方法返回包含 `__typename` 和一些应用程序可能需要来解析引用的额外属性，在这里是 `id`。`__typename` 由 GraphQL 网关使用，以确定负责 User 类型的微服务，并在执行 `resolveReference()` 方法时请求对应的实例。 "Users 服务" 在上一部分中描述。

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

最后，我们必须注册 `GraphQLModule`，与在 "Users 服务" 部分中一样。

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

#### Code First 模式

首先，我们将声明一个表示 `User` 实体的类。虽然实体本身生活在另一个服务中，但我们将在这里使用它（扩展其定义）。注意 `@extends` 和 `@external` 指令。

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

现在，让我们为 `User` 实体的扩展创建相应的 resolver：

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

我们还需要定义 `Post` 实体类：

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

及其 resolver：

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

最后，让我们将所有组件连接起来，在模块中。请注意架构构建选项，我们指定了 `User` 是一个孤立的（外部）类型。

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

#### 联邦示例：Gateway

Gateway 需要指定的端点列表，并且将自动发现相应的架构。因此，Gateway 服务的实现将保持 code 和 schema 两种模式相同。

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

### Federation 2

根据 [Apollo 文档](https://www.apollographql.com/docs/federation/federation-2/new-in-federation-2)，Federation 2 改进了原始 Apollo Federation（本文档中称为 Federation 1）的开发体验，它与大多数原始 supergraph 向后兼容。

> warning **警告** Mercurius 不完全支持 Federation 2。您可以在 [这里](https://www.apollographql.com/docs/federation/supported-subgraphs#javascript--typescript) 查看支持 Federation 2 的库列表。

在以下部分中，我们将升级之前的示例到 Federation 2。

#### 联邦示例：Users 服务

Federation 2 中的一个变化是，实体没有原始子图，因此我们不再需要扩展 `Query`。更多详细信息请参考 [Apollo Federation 2 文档](https://www.apollographql.com/docs/federation/federation-2/new-in-federation-2#entities) 中的实体主题。

#### Schema First 模式

我们可以简单地从 schema 中删除 `extend` 关键字。

```graphql
type User @key(fields: "id") {
  id: ID!
  name: String!
}

type Query {
  getUser(id: ID!): User
}

```

#### Code First 模式

要使用 Federation 2，我们需要在 `autoSchemaFile` 选项中指定联邦版本。

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

#### 联邦示例：Posts 服务

与上面的原因相同，我们不再需要扩展 `User` 和 `Query`。

#### Schema First 模式

我们可以简单地从 schema 中删除 `extend` 和 `external` 指令。

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

#### Code First 模式

因为我们不再扩展 `User` 实体，我们可以简单地从 `User` 中删除 `extends` 和 `external` 指令。

```ts
import { Directive, ObjectType, Field, ID } from '@nestjs/graphql';
import { Post } from './post.entity';

@ObjectType()
@Directive('@key(fields: "id")')
export class User {
  @Field(() => ID)
  id: number;

  @Field(() => [Post])
  posts?: Post[];
}

```

此外，与 User 服务相同，我们需要在 `GraphQLModule` 中指定使用 Federation 2。

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
      autoSchemaFile: {
        federation: 2,
      },
      buildSchemaOptions: {
        orphanedTypes: [User],
      },
    }),
  ],
  providers: [PostsResolver, UsersResolver, PostsService],
})
export class AppModule {}

```