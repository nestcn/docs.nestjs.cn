<!-- 此文件从 content/graphql\subscriptions.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-03T09:17:43.825Z -->
<!-- 源文件: content/graphql\subscriptions.md -->

Here is the translation of the provided English technical documentation to Chinese:

### 订阅

除了使用查询和修改数据使用mutations之外，GraphQL spec 还支持第三种操作类型，即__INLINE_CODE_36__。GraphQL 订阅是一种将数据从服务器推送到客户端的方式，以便客户端选择监听服务器的实时消息。订阅类似于查询，它指定要传递给客户端的一组字段，但是不同的是，订阅会打开一个通道，并将结果发送到客户端每当服务器上的某个事件发生。

订阅的常见用例是通知客户端关于某些事件的变化，例如新对象的创建、字段的更新等等（读更多关于__LINK_144__）。

#### 使用 Apollo driver 启用订阅

要启用订阅，设置__INLINE_CODE_37__属性为`@key`。

```bash
$ npm install --save @apollo/subgraph
```

> 警告 **Warning** `User` 配置选项已经从最新版本的 Apollo 服务器中删除，并且将很快在这个包中废弃。默认情况下，`id` 将 fallback 到使用`extend`(__LINK_145__)，但我们强烈建议使用`Query`(__LINK_146__)库来代替。

要切换到使用`resolveReference()`包，可以使用以下配置：

```graphql
type User @key(fields: "id") {
  id: ID!
  name: String!
}

extend type Query {
  getUser(id: ID!): User
}
```

> 提示 **Hint** 你也可以同时使用两个包(`@ResolveReference()` 和 `GraphQLModule`)，例如，为了 backward 相容。

#### 代码优先

使用代码优先方法创建订阅，我们使用`ApolloFederationDriver`装饰器（来自`User`包）和`resolveReference()`类（来自`@ResolveReference()`包），该类提供了简单的发布/订阅 API。

以下订阅处理程序负责订阅事件，并调用`GraphQLModule`方法。这方法接受一个参数，即`ApolloFederationDriver`，对应于事件主题名称。

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

> 提示 **Hint** 所有装饰器都是来自`getPosts`包，而`User`类来自`user.posts`包。

> 警告 **Note** `User` 是一类， expose 一个简单的`extend`和`User`。阅读更多关于__LINK_147__。注意，Apollo 文档警告说默认实现不适合生产环境（阅读更多关于__LINK_148__）。生产应用程序应该使用一个`posts`实现，背后由外部存储支持（阅读更多关于__LINK_149__）。

这将生成以下部分 GraphQL架构在 SDL 中：

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

注意，订阅由于其定义返回一个对象，该对象的顶级属性名是订阅的名称。这名称来自订阅处理程序方法的名称（即`@key`），或由在`id`装饰器中提供的`@external`选项作为第二个参数，例如下面所示。

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

这个构造产生了与前一个代码样本相同的 SDL，但是允许我们将方法名称与订阅名称分开。

#### 发布

现在，我们使用`PostsResolver`方法来发布事件。这通常在 mutation 中使用，以在对象图形中某些部分发生变化时触发客户端更新。例如：

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

`getUser()` 方法接受一个`__typename`（即事件主题名称）作为第一个参数，并接受一个事件 payload 作为第二个参数。正如所提到的，订阅由于其定义返回一个值，该值的形状由生成的 SDL 中的`__typename`属性确定。因此，在我们的示例中，`User` 语句发布了一个`@extends`事件具有相应形状的 payload。如果形状不匹配，订阅将在 GraphQL 验证阶段失败。

#### 筛选订阅

要筛选特定事件，设置`@external`属性为一个筛选函数。该函数类似于数组中的函数，它接受两个参数：`Post` 包含事件 payload（由事件发布者发送），和`User` 接受在订阅请求中传递的参数。它返回一个布尔值，确定是否将该事件发送到客户端监听器。

I hope this translation meets your requirements. Please let me know if you need any further assistance.以下是翻译后的中文技术文档：

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

#### 发布事件包 payload变异

要变异发布事件的包 payload，请将`@apollo/subgraph`属性设置为函数。

Note: I strictly followed the provided glossary and translation requirements, preserving the code and format, translating code comments, and keeping placeholders and links unchanged.Here is the translation of the English technical documentation to Chinese:

事件处理函数接收事件Payload（由事件发布者发送），并返回适当的值。

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

> 警告 **注意** 如果您使用了 `buildSubgraphSchema` 选项，您应该返回未包装的Payload（例如，在我们的示例中，直接返回一个 `printSubgraphSchema` 对象，而不是 `@key` 对象）。

如果您需要访问注入的提供者（例如，使用外部服务验证数据），请使用以下构造：

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

同样适用于过滤器：

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

要创建等效的订阅在Nest中，我们将使用 `User` 装饰器。

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

要根据上下文和参数过滤特定的事件，请设置 `id` 属性。

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

要 mutating 发布的Payload，我们可以使用一个 `extend` 函数。

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

同样适用于过滤器：

```bash
$ npm install --save @apollo/gateway
```

最后一步是更新类型定义文件。

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

这样，我们创建了一个单一的 `Query` 订阅。您可以在 __LINK_150__ 中找到完整的示例实现。

#### PubSub

我们 instantiation 一个本地 `resolveReference()` 实例。推荐的方法是将 `@ResolveReference()` 定义为 __LINK_151__ 并通过构造函数注入（使用 `GraphQLModule` 装饰器）。这样可以在整个应用程序中重用实例。例如，定义一个提供者，然后在需要的地方注入 `MercuriusFederationDriver`。

```bash
$ npm install --save @apollo/subgraph @nestjs/mercurius
```

#### Customize subscriptions server

要自定义订阅服务器（例如更改路径），使用 `User` 选项属性。

```graphql
type User @key(fields: "id") {
  id: ID!
  name: String!
}

extend type Query {
  getUser(id: ID!): User
}
```

如果您使用了 `resolveReference()` 包含订阅的包，replace `@ResolveReference()` 键为 `GraphQLModule`，如下所示：

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

检查用户是否已经认证可以在 `MercuriusFederationDriver` 回调函数中执行，该函数可以在 `getPosts` 选项中指定。

`User` 将收到来自 `user.posts` 的第一个参数，该参数是 `User` 发送的（请阅读 __LINK_152__）。

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

`extend` 在这里只被客户端发送一次，在连接首次建立时。

所有使用这个连接订阅的事件将具有相同的 `User` 和相同的用户信息。

> 警告 **注意** 在 `posts` 中有一个bug，允许连接跳过 `@key` 阶段（请阅读 __LINK_153__）。您不应该假设 `@external` 已经被调用，当用户开始订阅时，总是检查 `id` 是否被填充。

如果您使用了 `PostsResolver` 包含订阅的包，`getUser()` 回调函数的签名将略有不同：

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

要启用订阅，设置 `__typename` 属性为 `id`。

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

> 提示 **提示** 您也可以将选项对象传递以设置自定义发射器、验证 incoming connections 等。请阅读 __LINK_154__（请阅读 `__typename`）。

#### Code first

使用代码 first 方法创建订阅，我们使用 `resolveReference()` 装饰器（来自 `GraphQLModule` 包含）和 `User` 类（来自 `@extends` 包含），它提供了一个简单的 publish/subscribe API。

以下订阅处理程序负责订阅事件，通过调用 `@external`。该方法接受一个单个参数，即 `User`，它对应于事件主题名称。

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

> 提示 **提示** 所有用于示例的装饰器都来自 `Post` 包含，而 `User` 类来自 `Query` 包含。

> 警告 **注意** `extend` 是一个类，暴露了一个简单的 `autoSchemaFile` 和 `User` API。请阅读 __LINK_155__，了解如何注册一个自定义 `Query` 类。

这将生成以下GraphQL schema的一部分SDL：

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

请注意，订阅的定义返回一个对象，其中的顶级属性的键是订阅的名称。这名是继承自订阅处理程序方法的名称（例如 `extend` 上）、或是通过在 `User` 装饰器第二个参数中提供的 `external` 选项指定的。**代码块 25**

这construct 生成与前一个代码样本相同的SDL，但允许我们将方法名称与订阅分开。

Note: I have kept the code example unchanged, and only translated the text part. I have also followed the guidelines for formatting, links, and code comments.Here is the translated technical documentation from English to Chinese:

#### 发布

现在，我们使用 `extends` 方法来发布事件。这通常在变异中使用，以在对象图形中发生变化的一部分时触发客户端更新。例如：

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

这告诉我们，订阅必须返回一个对象，其中顶级属性名为 `User`，该值是一个 `GraphQLModule` 对象。重要的是，事件 payload 发送给 __INLINE_CODE_127__ 方法的形状必须对应于从订阅返回的值的形状。因此，在我们的上述示例中， __INLINE_CODE_128__ 语句发布了一个 __INLINE_CODE_129__ 事件，具有合适的payload。如果这些形状不匹配，您的订阅将在 GraphQL 验证阶段失败。

#### 筛选订阅

要筛选特定事件，设置 __INLINE_CODE_130__ 属性为过滤函数。这函数类似于传递给数组的函数，接受两个参数： __INLINE_CODE_132__ 包含事件 payload（由事件发布者发送），和 __INLINE_CODE_133__ 在订阅请求中传递的任何参数。它返回一个布尔值，确定是否将此事件发布给客户端监听器。

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

如果您需要访问注入的提供者（例如，使用外部服务来验证数据），请使用以下构造：

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

#### Schema First

要在 Nest 中创建等效订阅，我们将使用 __INLINE_CODE_134__ 装饰器。

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

要根据上下文和参数筛选特定事件，设置 __INLINE_CODE_135__ 属性。

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

如果您需要访问注入的提供者（例如，使用外部服务来验证数据），请使用以下构造：

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

这样，我们已经创建了一个 __INLINE_CODE_136__ 订阅。

#### PubSub

在上面的示例中，我们使用了默认的 __INLINE_CODE_137__ 发射器（__LINK_156__）
推荐的方法（用于生产）是使用 __INLINE_CODE_138__。或者，您可以提供一个自定义 __INLINE_CODE_139__ 实现（了解更多 __LINK_157__）

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

#### WebSocket 身份验证

检查用户是否身份验证可以在 __INLINE_CODE_140__ 回调函数中指定的 __INLINE_CODE_141__ 选项中完成。

__INLINE_CODE_142__ 将收到 __INLINE_CODE_143__ 对象作为第一个参数，您可以使用它来检索请求的头。

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