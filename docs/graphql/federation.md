## 联邦

联邦提供了一种将单体式 GraphQL 服务器拆分为独立微服务的方法。它由两个组件组成：网关和一个或多个联邦微服务。每个微服务持有部分模式，网关将这些模式合并为客户端可使用的单一模式。

引用 [Apollo 文档](https://blog.apollographql.com/apollo-federation-f260cf525d21)的说法，联邦设计遵循以下核心原则：

- 构建图形应该是**声明式的**。通过联邦，您可以在模式中以声明方式组合图形，而无需编写命令式的模式拼接代码。
- 代码应按照**关注点**而非类型进行划分。通常没有一个团队能完全控制诸如用户或产品等重要类型的所有方面，因此这些类型的定义应分散在各团队和代码库中，而非集中管理。
- 图形结构应便于客户端使用。通过联合服务，可以构建出完整的产品导向型图形结构，准确反映客户端实际消费方式。
- 这只是使用标准规范的 **GraphQL** 功能。任何编程语言（不仅是 JavaScript）都能实现联邦查询。

> **警告** 联邦当前不支持订阅。

在接下来的章节中，我们将搭建一个包含网关和两个联邦端点的演示应用：用户服务和帖子服务。

#### 与 Apollo 实现联邦

首先安装所需依赖：

```bash
$ npm install --save @apollo/subgraph
```

#### 模式优先

"用户服务"提供了一个简单的模式。注意 `@key` 指令：它告知 Apollo 查询规划器，只要指定 `User` 的 `id` 就可以获取特定实例。同时注意我们 `extend` 了 `Query` 类型。

```graphql
type User @key(fields: "id") {
  id: ID!
  name: String!
}

extend type Query {
  getUser(id: ID!): User
}
```

解析器提供了一个名为 `resolveReference()` 的额外方法。当相关资源需要 User 实例时，Apollo 网关就会触发此方法。我们稍后将在 Posts 服务中看到示例。请注意该方法必须用 `@ResolveReference()` 装饰器进行标注。

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

最后，我们通过注册 `GraphQLModule` 并将 `ApolloFederationDriver` 驱动传入配置对象来完成所有连接：

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

#### 代码优先

首先为 `User` 实体添加一些额外的装饰器。

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

解析器提供了一个名为 `resolveReference()` 的额外方法。当相关资源需要 User 实例时，Apollo 网关会触发此方法。稍后我们将在 Posts 服务中看到示例。请注意，该方法必须使用 `@ResolveReference()` 装饰器进行注解。

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

最后，我们通过注册 `GraphQLModule` 并将 `ApolloFederationDriver` 驱动传入配置对象来完成所有连接：

```typescript
import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig,
} from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service'; // 本示例未包含此内容

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

一个可运行的示例在代码优先模式下可查看[此处](https://github.com/nestjs/nest/tree/master/sample/31-graphql-federation-code-first/users-application) ，在模式优先模式下可查看[此处](https://github.com/nestjs/nest/tree/master/sample/32-graphql-federation-schema-first/users-application) 。

#### 联邦示例：帖子服务

帖子服务应该通过 `getPosts` 查询提供聚合的帖子，同时也要用 `user.posts` 字段扩展我们的 `User` 类型。

#### 模式优先

"帖子服务"在其模式中通过 `extend` 关键字引用 `User` 类型。它还为 `User` 类型声明了一个额外的属性（`posts`）。注意用于匹配 User 实例的 `@key` 指令，以及指示 `id` 字段由其他地方管理的 `@external` 指令。

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

在以下示例中，`PostsResolver` 提供了 `getUser()` 方法，该方法返回一个包含 `__typename` 和一些应用程序可能需要的其他属性的引用，在这种情况下是 `id`。GraphQL 网关使用 `__typename` 来准确定位负责 User 类型的微服务并检索相应的实例。执行 `resolveReference()` 方法时，将请求上面描述的"用户服务"。

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

最后，我们必须注册 `GraphQLModule`，类似于我们在"用户服务"部分所做的。

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
  providers: [PostsResolver],
})
export class AppModule {}
```

#### 代码优先

首先，我们必须声明一个表示 `User` 实体的类。虽然实体本身存在于另一个服务中，但我们将在这里使用它（扩展其定义）。注意 `@extends` 和 `@external` 指令。

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

现在让我们为 `User` 实体的扩展创建相应的解析器，如下所示：

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

我们还必须定义 `Post` 实体类：

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

以及它的解析器：

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

最后，在模块中将它们联系在一起。注意模式构建选项，其中我们指定 `User` 是一个孤立的（外部）类型。

```ts
import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig,
} from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { User } from './user.entity';
import { PostsResolver } from './posts.resolver';
import { UsersResolver } from './users.resolver';
import { PostsService } from './posts.service'; // 本示例未包含此内容

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

一个可运行的示例在代码优先模式下可查看[此处](https://github.com/nestjs/nest/tree/master/sample/31-graphql-federation-code-first/posts-application) ，在模式优先模式下可查看[此处](https://github.com/nestjs/nest/tree/master/sample/32-graphql-federation-schema-first/posts-application) 。

#### 联邦示例：网关

首先安装所需依赖：

```bash
$ npm install --save @apollo/gateway
```

网关需要指定一个端点列表，它将自动发现相应的模式。因此，网关服务的实现对于代码优先和模式优先方法都是相同的。

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
        // ... Apollo 服务器选项
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

一个可运行的示例在代码优先模式下可查看[此处](https://github.com/nestjs/nest/tree/master/sample/31-graphql-federation-code-first/gateway) ，在模式优先模式下可查看[此处](https://github.com/nestjs/nest/tree/master/sample/32-graphql-federation-schema-first/gateway) 。

#### 与 Mercurius 实现联邦

首先安装所需依赖：

```bash
$ npm install --save @apollo/subgraph @nestjs/mercurius
```

> **提示** 需要 `@apollo/subgraph` 包来构建子图模式（`buildSubgraphSchema`、`printSubgraphSchema` 函数）。

#### 模式优先

"用户服务"提供了一个简单的模式。注意 `@key` 指令：它告知 Mercurius 查询规划器，只要指定 `User` 的 `id` 就可以获取特定实例。同时注意我们 `extend` 了 `Query` 类型。

```graphql
type User @key(fields: "id") {
  id: ID!
  name: String!
}

extend type Query {
  getUser(id: ID!): User
}
```

解析器提供了一个名为 `resolveReference()` 的额外方法。当相关资源需要 User 实例时，Mercurius 网关就会触发此方法。我们稍后将在 Posts 服务中看到示例。请注意该方法必须用 `@ResolveReference()` 装饰器进行标注。

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

最后，我们通过注册 `GraphQLModule` 并将 `MercuriusFederationDriver` 驱动传入配置对象来完成所有连接：

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

#### 代码优先

首先为 `User` 实体添加一些额外的装饰器。

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

解析器提供了一个名为 `resolveReference()` 的额外方法。当相关资源需要 User 实例时，Mercurius 网关会触发此方法。稍后我们将在 Posts 服务中看到示例。请注意，该方法必须使用 `@ResolveReference()` 装饰器进行注解。

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

最后，我们通过注册 `GraphQLModule` 并将 `MercuriusFederationDriver` 驱动传入配置对象来完成所有连接：

```typescript
import {
  MercuriusFederationDriver,
  MercuriusFederationDriverConfig,
} from '@nestjs/mercurius';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service'; // 本示例未包含此内容

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

#### 联邦示例：帖子服务

帖子服务应该通过 `getPosts` 查询提供聚合的帖子，同时也要用 `user.posts` 字段扩展我们的 `User` 类型。

#### 模式优先

"帖子服务"在其模式中通过 `extend` 关键字引用 `User` 类型。它还为 `User` 类型声明了一个额外的属性（`posts`）。注意用于匹配 User 实例的 `@key` 指令，以及指示 `id` 字段由其他地方管理的 `@external` 指令。

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

在以下示例中，`PostsResolver` 提供了 `getUser()` 方法，该方法返回一个包含 `__typename` 和一些应用程序可能需要的其他属性的引用，在这种情况下是 `id`。GraphQL 网关使用 `__typename` 来准确定位负责 User 类型的微服务并检索相应的实例。执行 `resolveReference()` 方法时，将请求上面描述的"用户服务"。

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

最后，我们必须注册 `GraphQLModule`，类似于我们在"用户服务"部分所做的。

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
  providers: [PostsResolver],
})
export class AppModule {}
```

#### 代码优先

首先，我们必须声明一个表示 `User` 实体的类。虽然实体本身存在于另一个服务中，但我们将在这里使用它（扩展其定义）。注意 `@extends` 和 `@external` 指令。

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

现在让我们为 `User` 实体的扩展创建相应的解析器，如下所示：

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

我们还必须定义 `Post` 实体类：

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

以及它的解析器：

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

最后，在模块中将它们联系在一起。注意模式构建选项，其中我们指定 `User` 是一个孤立的（外部）类型。

```ts
import {
  MercuriusFederationDriver,
  MercuriusFederationDriverConfig,
} from '@nestjs/mercurius';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { User } from './user.entity';
import { PostsResolver } from './posts.resolver';
import { UsersResolver } from './users.resolver';
import { PostsService } from './posts.service'; // 本示例未包含此内容

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

#### 联邦示例：网关

网关需要指定一个端点列表，它将自动发现相应的模式。因此，网关服务的实现对于代码优先和模式优先方法都是相同的。

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

### 联邦 2

引用 [Apollo 文档](https://www.apollographql.com/docs/federation/federation-2/new-in-federation-2)的说法，联邦 2 改进了原始 Apollo 联邦（在本文档中称为联邦 1）的开发者体验，与大多数原始超级图向后兼容。

> **警告** Mercurius 不完全支持联邦 2。您可以在[此处](https://www.apollographql.com/docs/federation/supported-subgraphs#javascript--typescript)查看支持联邦 2 的库列表。

在接下来的章节中，我们将把之前的示例升级到联邦 2。

#### 联邦示例：用户服务

联邦 2 中的一个变化是实体没有原始子图，所以我们不再需要扩展 `Query`。更多详情请参阅 Apollo 联邦 2 文档中的[实体主题](https://www.apollographql.com/docs/federation/federation-2/new-in-federation-2#entities)。

#### 模式优先

我们可以简单地从模式中删除 `extend` 关键字。

```graphql
type User @key(fields: "id") {
  id: ID!
  name: String!
}

type Query {
  getUser(id: ID!): User
}
```

#### 代码优先

要使用联邦 2，我们需要在 `autoSchemaFile` 选项中指定联邦版本。

```ts
import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig,
} from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service'; // 本示例未包含此内容

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

#### 联邦示例：帖子服务

基于与上述相同的原因，我们不再需要扩展 `User` 和 `Query`。

#### 模式优先

我们可以简单地从模式中删除 `extend` 和 `external` 指令。

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

#### 代码优先

由于我们不再扩展 `User` 实体，我们可以简单地从 `User` 中删除 `extends` 和 `external` 指令。

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

同样，与用户服务类似，我们需要在 `GraphQLModule` 中指定使用联邦 2。

```ts
import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig,
} from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { User } from './user.entity';
import { PostsResolver } from './posts.resolver';
import { UsersResolver } from './users.resolver';
import { PostsService } from './posts.service'; // 本示例未包含此内容

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
