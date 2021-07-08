# GraphQL

## 快速开始

GraphQL 是一种用于 API 的查询语言，是使用现有数据来完成这些查询的运行时。这是一种优雅的方法，可以解决我们在典型REST apis 中遇到的许多问题 。这里是 GraphQL 和 REST 之间一个很好的[比较](https://dev-blog.apollodata.com/graphql-vs-rest-5d425123e34b) 。在这组文章中, 我们将不解释什么是 GraphQL, 而是演示如何使用 `@nestjs/graphql` 模块。本章假定你已经熟练GraphQL。

GraphQLModule 仅仅是 [Apollo](https://www.apollographql.com) Server 的包装器。我们没有造轮子, 而是提供一个现成的模块, 这让 GraphQL 和 Nest 有了比较简洁的融合方式。


### 安装

首先，我们需要安装以下依赖包：

```bash
$ npm i --save @nestjs/graphql graphql-tools graphql apollo-server-express
```

### 概述

Nest 提供了两种构建 GraphQL 应用程序的方式，模式优先和代码优先。

**模式优先**的方式，本质是 GraphQL SDL（模式定义语言）。它以一种与语言无关的方式，基本允许您在不同平台之间共享模式文件。此外，Nest 将根据GraphQL 模式（通过类或接口）自动生成 TypeScript 定义，以减少冗余。

另一方面，在**代码优先**的方法中，您将仅使用装饰器和 TypeScript 类来生成相应的 GraphQL 架构。如果您更喜欢使用 TypeScript 来工作并避免语言语法之间的上下文切换，那么它变得非常方便。



### 入门

依赖包安装完成后，我们就可以注册 `GraphQLModule`。

> app.module.ts

```typescript
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';

@Module({
  imports: [
    GraphQLModule.forRoot({}),
  ],
})
export class ApplicationModule {}
```


该  `.forRoot()` 函数将选项对象作为参数。这些选项将传递给底层的 Apollo 实例（请在[此处](https://www.apollographql.com/docs/apollo-server/v2/api/apollo-server.html#constructor-options-lt-ApolloServer-gt)阅读有关可用设置的更多信息）。例如，如果要禁用`playground`并关闭`debug`模式，只需传递以下选项：

```typescript
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';

@Module({
  imports: [
    GraphQLModule.forRoot({
      debug: false,
      playground: false,
    }),
  ],
})
export class ApplicationModule {}
```

如上所述，所有这些设置都将传递给`ApolloServer`构造函数。


### Playground

Playground 是一个图形化的，交互式的浏览器内 GraphQL IDE，默认情况下可与 GraphQL 服务器本身 URL 相同。当您的应用程序在后台运行时，打开 Web 浏览器并访问： http://localhost:3000/graphql （主机和端口可能因您的配置而异）。

![](https://docs.nestjs.com/assets/playground.png)

### 多个端点

该模块的另一个有用功能是能够同时为多个端点提供服务。多亏了这一点，您可以决定哪个模块应该包含在哪个端点中。默认情况下，`GraphQL` 在整个应用程序中搜索解析器。要仅限制模块的子集，可以使用该 `include` 属性。

```typescript
GraphQLModule.forRoot({
  include: [CatsModule],
}),
```
 <!-- tabs:start -->

#### ** 模式优先 **

当使用模式优先的方式，最简单的方法是为 typePaths 数组中添加对象即可。

```typescript
GraphQLModule.forRoot({
  typePaths: ['./**/*.graphql'],
}),
```
该 typePaths 属性指示 GraphQLModule 应该查找 GraphQL 文件的位置。所有这些文件最终将合并到内存中，这意味着您可以将模式拆分为多个文件并将它们放在靠近解析器的位置。

同时创建 GraphQL 类型和相应的 TypeScript 定义会产生不必要的冗余。导致我们没有单一的实体来源，SDL 内部的每个变化都促使我们调整接口。因此，该`@nestjs/graphql` 包提供了另一个有趣的功能，使用抽象语法树（AST）自动生成TS定义。要启用它，只需添加 definitions 属性即可。

```typescript
GraphQLModule.forRoot({
  typePaths: ['./**/*.graphql'],
  definitions: {
    path: join(process.cwd(), 'src/graphql.ts'),
  },
}),
```

`src/graphql.ts` 为TypeScript输出文件。默认情况下，所有类型都转换为接口。您也可以通过将 outputAs 属性改为切换到 `class`。

```typescript
GraphQLModule.forRoot({
  typePaths: ['./**/*.graphql'],
  definitions: {
    path: join(process.cwd(), 'src/graphql.ts'),
    outputAs: 'class',
  },
}),
```

事实上，每个应用程序启动时都生成类型定义并不是必须的。我们可能更喜欢完全控制，只在执行专用命令时才生成类型定义文件。在这种情况下，我们可以通过创建自己的脚本来实现，比如说 generate-typings.ts: 

```typescript
import { GraphQLDefinitionsFactory } from '@nestjs/graphql';
import { join } from 'path';

const definitionsFactory = new GraphQLDefinitionsFactory();
definitionsFactory.generate({
  typePaths: ['./src/**/*.graphql'],
  path: join(process.cwd(), 'src/graphql.ts'),
  outputAs: 'class',
});
```

然后，只需运行：

```bash
ts-node generate-typings
```

?> 您也可以预先编译脚本并使用 node 可执行文件。

当需要切换到文件监听模式（在任何 .graphql 文件更改时自动生成 Typescript），请将 watch 选项传递给 generate() 函数。

```typescript
definitionsFactory.generate({
  typePaths: ['./src/**/*.graphql'],
  path: join(process.cwd(), 'src/graphql.ts'),
  outputAs: 'class',
  watch: true,
});
```

[这里](https://github.com/nestjs/nest/tree/master/sample/12-graphql-apollo) 提供完整的例子。

#### ** 代码优先 **

在代码优先方法中，您将只使用装饰器和 TypeScript 类来生成相应的 GraphQL 架构。

Nest 通过使用一个惊艳的type-graphql 库，来提供此功能。为此，在我们继续之前，您必须安装此软件包。

```typescript
$ npm i type-graphql
```

安装过程完成后，我们可以使用 autoSchemaFile 向 options 对象添加属性。

```typescript
GraphQLModule.forRoot({
  typePaths: ['./**/*.graphql'],
  autoSchemaFile: 'schema.gql',
}),
```

这里 autoSchemaFile 是您自动生成的gql文件将被创建的路径。您一样可以传递 buildSchemaOptions 属性 - 用于传递给 buildSchema() 函数的选项（从type-graphql包中）。

[这里](https://github.com/nestjs/nest/tree/master/sample/23-type-graphql) 提供完整的例子。


<!-- tabs:end -->

### Async 配置


大多数情况下, 您可能希望异步传递模块选项, 而不是预先传递它们。在这种情况下, 请使用 `forRootAsync()` 函数, 它提供了处理异步数据的几种不同方法。

第一种方法是使用工厂功能:

```typescript
GraphQLModule.forRootAsync({
  useFactory: () => ({
    typePaths: ['./**/*.graphql'],
  }),
}),
```
我们的 factory 的行为和其他人一样 (可能是异步的, 并且能够通过 `inject` 注入依赖关系)。

```typescript
GraphQLModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => ({
    typePaths: configService.getString('GRAPHQL_TYPE_PATHS'),
  }),
  inject: [ConfigService],
}),
```

当然除了factory， 您也可以使用类。

```typescript
GraphQLModule.forRootAsync({
  useClass: GqlConfigService,
}),
```
上面的构造将实例化 `GqlConfigService` 内部 `GraphQLModule`, 并将利用它来创建选项对象。`GqlConfigService` 必须实现 `GqlOptionsFactory` 接口。

```typescript
@Injectable()
class GqlConfigService implements GqlOptionsFactory {
  createGqlOptions(): GqlModuleOptions {
    return {
      typePaths: ['./**/*.graphql'],
    };
  }
}
```

为了防止 `GqlConfigService`内部创建 `GraphQLModule` 并使用从不同模块导入的提供程序，您可以使用 `useExisting` 语法。


```typescript
GraphQLModule.forRootAsync({
  imports: [ConfigModule],
  useExisting: ConfigService,
}),
```

它的工作原理与 `useClass` 有一个关键的区别—— `GraphQLModule` 将查找导入的模块可重用的已经创建的 `ConfigService`, 而不是单独实例化它。

### 例子

[这里](https://github.com/nestjs/nest/tree/master/sample/12-graphql-apollo) 提供完整的案例。

## 解析图


通常，您必须手动创建解析图。 `@nestjs/graphql` 包也产生解析器映射，可以自动使用由装饰器提供的元数据。
为了学习库基础知识，我们将创建一个简单的用户 API。


 <!-- tabs:start -->

#### ** 模式优先 **

正如提到[以前的章节](/8/graphql?id=快速开始)，让我们在 SDL 中定义我们的类型（阅读[更多](http://graphql.cn/learn/schema/#type-language)）：


```graphql
type Author {
  id: Int!
  firstName: String
  lastName: String
  posts: [Post]
}

type Post {
  id: Int!
  title: String!
  votes: Int
}

type Query {
  author(id: Int!): Author
}
```

我们的 GraphQL 架构包含公开的单个查询 `author(id: Int!): Author` 。现在，让我们创建一个 `AuthorResolver` 。

```graphql
@Resolver('Author')
export class AuthorResolver {
  constructor(
    private readonly authorsService: AuthorsService,
    private readonly postsService: PostsService,
  ) {}

  @Query()
  async author(@Args('id') id: number) {
    return await this.authorsService.findOneById(id);
  }

  @ResolveProperty()
  async posts(@Parent() author) {
    const { id } = author;
    return await this.postsService.findAll({ authorId: id });
  }
}
```

?> 提示：使用 `@Resolver()` 装饰器则不必将类标记为 `@Injectable()` ，否则必须这么做。

`@Resolver()` 装饰器不影响查询和对象变动 (`@Query()` 和 `@Mutation()` 装饰器)。这只会通知 Nest, 每个 `@ResolveProperty()` 有一个父节点, `Author` 在这种情况下是父节点， Author在这种情况下是一个类型（Author.posts 关系）。基本上，不是为类设置 @Resolver() ，而是为函数：

```typescript
@Resolver('Author')
@ResolveProperty()
async posts(@Parent() author) {
  const { id } = author;
  return await this.postsService.findAll({ authorId: id });
}
```

但当 @ResolveProperty() 在一个类中有多个，则必须为所有的都添加 @Resolver()，这不是一个好习惯（额外的开销）。

通常, 我们会使用像 `getAuthor()` 或 `getPosts()` 之类的函数来命名。通过将真实名称放在装饰器里很容易地做到这一点。

```typescript
@Resolver('Author')
export class AuthorResolver {
  constructor(
    private readonly authorsService: AuthorsService,
    private readonly postsService: PostsService,
  ) {}

  @Query('author')
  async getAuthor(@Args('id') id: number) {
    return await this.authorsService.findOneById(id);
  }

  @ResolveProperty('posts')
  async getPosts(@Parent() author) {
    const { id } = author;
    return await this.postsService.findAll({ authorId: id });
  }
}
```

?> 这个 `@Resolver()` 装饰器可以在函数级别被使用。

### Typings

假设我们已经启用了分型生成功能（带outputAs: 'class'）在[前面的](/8/graphql?id=快速开始)章节，一旦你运行应用程序，应该生成以下文件：

```typescript
export class Author {
  id: number;
  firstName?: string;
  lastName?: string;
  posts?: Post[];
}

export class Post {
  id: number;
  title: string;
  votes?: number;
}

export abstract class IQuery {
  abstract author(id: number): Author | Promise<Author>;
}
```

类允许您使用装饰器，这使得它们在验证方面非常有用（[阅读更多](/8/techniques?id=验证)）。例如：

```typescript
import { MinLength, MaxLength } from 'class-validator';

export class CreatePostInput {
  @MinLength(3)
  @MaxLength(50)
  title: string;
}
```

?> 要启用输入（和参数）的自动验证，必须使用 ValidationPipe 。了解更多有关[验证](/8/techniques?id=验证)或者[更具体](/8/pipes)。

尽管如此，如果将装饰器直接添加到自动生成的文件中，它们将在每次连续更改时被丢弃。因此，您应该创建一个单独的文件，并简单地扩展生成的类。

```typescript
import { MinLength, MaxLength } from 'class-validator';
import { Post } from '../../graphql.ts';

export class CreatePostInput extends Post {
  @MinLength(3)
  @MaxLength(50)
  title: string;
}
```
### ** 代码优先 **

在代码优先方法中，我们不必手动编写SDL。相反，我们只需使用装饰器。

```typescript
import { Field, Int, ObjectType } from 'type-graphql';
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
Author 模型已创建。现在，让我们创建缺少的 Post 类。

```typescript
import { Field, Int, ObjectType } from 'type-graphql';

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

由于我们的模型准备就绪，我们可以转到解析器类。

```typescript
@Resolver(of => Author)
export class AuthorResolver {
  constructor(
    private readonly authorsService: AuthorsService,
    private readonly postsService: PostsService,
  ) {}

  @Query(returns => Author)
  async author(@Args({ name: 'id', type: () => Int }) id: number) {
    return await this.authorsService.findOneById(id);
  }

  @ResolveProperty()
  async posts(@Parent() author) {
    const { id } = author;
    return await this.postsService.findAll({ authorId: id });
  }
}
```

通常，我们会使用类似 getAuthor() 或 getPosts() 函数名称。我们可以通过将真实名称移动到装饰器里来轻松完成此操作。

```typescript
@Resolver(of => Author)
export class AuthorResolver {
  constructor(
    private readonly authorsService: AuthorsService,
    private readonly postsService: PostsService,
  ) {}

  @Query(returns => Author, { name: 'author' })
  async getAuthor(@Args({ name: 'id', type: () => Int }) id: number) {
    return await this.authorsService.findOneById(id);
  }

  @ResolveProperty('posts')
  async getPosts(@Parent() author) {
    const { id } = author;
    return await this.postsService.findAll({ authorId: id });
  }
}
```

通常，您不必将此类对象传递给 @Args() 装饰器。例如，如果您的标识符的类型是字符串，则以下结构就足够了：

```typescript
@Args('id') id: string
```

但是，该 `number`.  类型没有提供 type-graphql 有关预期的 GraphQL 表示（ `Int ` vs `Float` ）的足够信息，因此，我们必须显式传递类型引用。

而且，您可以创建一个专用 AuthorArgs 类：

```typescript
@Args() id: AuthorArgs
```

用以下结构：

```typescript

@ArgsType()
class AuthorArgs {
  @Field(type => Int)
  @Min(1)
  id: number;
}
```

?>  `@Field()` 和 `@ArgsType()` 装饰器都是从 `type-graphql` 包中导入的，而 `@Min()` 来自 `class-validator`。

您可能还会注意到这些类与 `ValidationPipe` 相关（[更多内容](/8/techniques?id=验证)）。

<!-- tabs:end -->


### 装饰

在上面的示例中，您可能会注意到我们使用专用装饰器来引用以下参数。下面是提供的装饰器和它们代表的普通 Apollo 参数的比较。

|||
|---|---|
| `@Root()` 和 `@Parent()` |	`root`/`parent` |
| `@Context(param?:string)`	| `context`/`context[param]` |
| `@Info(param?:string)`	| `info`/`info[param]` |
| `@Args(param?:string)`	| `args`/`args[param]` |

### Module

一旦我们在这里完成，我们必须将 `AuthorResolver` 注册，例如在新创建的 `AuthorsModule` 内部注册。

```typescript
@Module({
  imports: [PostsModule],
  providers: [AuthorsService, AuthorResolver],
})
export class AuthorsModule {}
```
该 `GraphQLModule` 会考虑反映了元数据和转化类到正确的解析器的自动映射。您应该注意的是您需要在某处 import 此模块，Nest 才会知道 `AuthorsModule` 确实存在。

?> 提示：在[此处](http://graphql.cn/learn/queries/)了解有关 GraphQL 查询的更多信息。


## 变更（Mutations）


在 GraphQL 中，为了变更服务器端数据，我们使用了变更（[在这里阅读更多](http://graphql.cn/learn/queries/#mutations)） 。官方 Apollo 文档共享一个 upvotePost() 变更示例。该变更允许增加 votes 属性值。为了在 Nest 中创建等效变更，我们将使用 @Mutation() 装饰器。

 <!-- tabs:start -->

#### ** 模式优先 **

让我们扩展我们在上一节中AuthorResolver的用法（见[解析图](/8/graphql?id=解析图)）。

```typescript
@Resolver('Author')
export class AuthorResolver {
  constructor(
    private readonly authorsService: AuthorsService,
    private readonly postsService: PostsService,
  ) {}

  @Query('author')
  async getAuthor(@Args('id') id: number) {
    return await this.authorsService.findOneById(id);
  }

  @Mutation()
  async upvotePost(@Args('postId') postId: number) {
    return await this.postsService.upvoteById({ id: postId });
  }

  @ResolveProperty('posts')
  async getPosts(@Parent() { id }) {
    return await this.postsService.findAll({ authorId: id });
  }
}
```

请注意，我们假设业务逻辑已移至 `PostsService`（分别查询 `post` 和 incrementing `votes` 属性）。

### 类型定义

最后一步是将我们的变更添加到现有的类型定义中。


```typescript
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

该 `upvotePost(postId: Int!): Post` 变更现在可用！



#### ** 代码优先 **

让我们使用 在上一节中AuthorResolver另一种方法（参见[解析图](/8/graphql?id=解析图)）。

```typescript
@Resolver(of => Author)
export class AuthorResolver {
  constructor(
    private readonly authorsService: AuthorsService,
    private readonly postsService: PostsService,
  ) {}

  @Query(returns => Author, { name: 'author' })
  async getAuthor(@Args({ name: 'id', type: () => Int }) id: number) {
    return await this.authorsService.findOneById(id);
  }

  @Mutation(returns => Post)
  async upvotePost(@Args({ name: 'postId', type: () => Int }) postId: number) {
    return await this.postsService.upvoteById({ id: postId });
  }

  @ResolveProperty('posts')
  async getPosts(@Parent() author) {
    const { id } = author;
    return await this.postsService.findAll({ authorId: id });
  }
}
```

`upvotePost()` 取 `postId`（`Int`）作为输入参数，并返回更新的 `Post` 实体。出于与解析器部分相同的原因，我们必须明确设置预期类型。

如果变异必须将对象作为参数，我们可以创建一个输入类型。

```typescript
@InputType()
export class UpvotePostInput {
  @Field() postId: number;
}
```
?>  `@InputType()` 和 `@Field()` 需要 import `type-graphql` 包。

然后在解析图类中使用它：

```typescript
@Mutation(returns => Post)
async upvotePost(
  @Args('upvotePostData') upvotePostData: UpvotePostInput,
) {}
```


<!-- tabs:end -->


## 订阅（Subscriptions）

订阅只是查询和变更的另一种 GraphQL 操作类型。它允许通过双向传输层创建实时订阅，主要通过 websockets 实现。在[这里](https://www.apollographql.com/docs/graphql-subscriptions/)阅读更多关于订阅的内容。

以下是 `commentAdded` 订阅示例，可直接从官方 [Apollo](https://www.apollographql.com/docs/graphql-subscriptions/subscriptions-to-schema.html) 文档复制和粘贴：

```typescript
Subscription: {
  commentAdded: {
    subscribe: () => pubSub.asyncIterator('commentAdded');
  }
}
```

?> `pubsub` 是一个 `PubSub` 类的实例。在[这里](https://www.apollographql.com/docs/graphql-subscriptions/setup.html)阅读更多。


<!-- tabs:start -->

#### ** 模式优先 **

为了以 Nest 方式创建等效订阅，我们将使用 `@Subscription()` 装饰器。

```typescript
const pubSub = new PubSub();

@Resolver('Author')
export class AuthorResolver {
  constructor(
    private readonly authorsService: AuthorsService,
    private readonly postsService: PostsService,
  ) {}

  @Query('author')
  async getAuthor(@Args('id') id: number) {
    return await this.authorsService.findOneById(id);
  }

  @ResolveProperty('posts')
  async getPosts(@Parent() author) {
    const { id } = author;
    return await this.postsService.findAll({ authorId: id });
  }

  @Subscription()
  commentAdded() {
    return pubSub.asyncIterator('commentAdded');
  }
}
```

为了根据上下文和参数过滤掉特定事件，我们可以设置一个 filter 属性。

```typescript
@Subscription('commentAdded', {
  filter: (payload, variables) =>
    payload.commentAdded.repositoryName === variables.repoFullName,
})
commentAdded() {
  return pubSub.asyncIterator('commentAdded');
}
```

为了改变已发布的有效负载，我们可以使用 resolve 函数。

```typescript
@Subscription('commentAdded', {
  resolve: value => value,
})
commentAdded() {
  return pubSub.asyncIterator('commentAdded');
}
```

### 类型定义

最后一步是更新类型定义文件。

```typescript
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

type Comment {
  id: String
  content: String
}

type Subscription {
  commentAdded(repoFullName: String!): Comment
}
```
做得好。我们创建了一个 commentAdded(repoFullName: String!): Comment 订阅。您可以在[此处](https://github.com/nestjs/nest/blob/master/sample/12-graphql-apollo)找到完整的示例实现。


#### ** 使用 Typescript **

要使用 class-first 方法创建订阅，我们将使用 @Subscription() 装饰器。

```typescript
const pubSub = new PubSub();

@Resolver('Author')
export class AuthorResolver {
  constructor(
    private readonly authorsService: AuthorsService,
    private readonly postsService: PostsService,
  ) {}

  @Query(returns => Author, { name: 'author' })
  async getAuthor(@Args({ name: 'id', type: () => Int }) id: number) {
    return await this.authorsService.findOneById(id);
  }

  @ResolveProperty('posts')
  async getPosts(@Parent() author) {
    const { id } = author;
    return await this.postsService.findAll({ authorId: id });
  }

  @Subscription(returns => Comment)
  commentAdded() {
    return pubSub.asyncIterator('commentAdded');
  }
}
```

为了根据上下文和参数过滤掉特定事件，我们可以设置 filter 属性。

```typescript
@Subscription(returns => Comment, {
  filter: (payload, variables) =>
    payload.commentAdded.repositoryName === variables.repoFullName,
})
commentAdded() {
  return pubSub.asyncIterator('commentAdded');
}
```

为了改变已发布的有效负载，我们可以使用 resolve 函数。

```typescript

@Subscription(returns => Comment, {
  resolve: value => value,
})
commentAdded() {
  return pubSub.asyncIterator('commentAdded');
}

```


<!-- tabs:end -->

### Pubsub

我们在这里使用了一个本地 `PubSub` 实例。相反, 我们应该将 `PubSub` 定义为一个组件, 通过构造函数 (使用 `@Inject ()` 装饰器) 注入它, 并在整个应用程序中重用它。[您可以在此了解有关嵌套自定义组件的更多信息](/8/fundamentals?id=自定义providercustomer-provider)。

```typescript
{
  provide: 'PUB_SUB',
  useValue: new PubSub(),
}

```

### Module

为了启用订阅，我们必须将 `installSubscriptionHandlers` 属性设置为 `true` 。

```typescript
GraphQLModule.forRoot({
  typePaths: ['./**/*.graphql'],
  installSubscriptionHandlers: true,
}),
```

要自定义订阅服务器（例如，更改端口），您可以使用 `subscriptions` 属性（阅读[更多](https://www.apollographql.com/docs/apollo-server/v2/api/apollo-server.html#constructor-options-lt-ApolloServer-gt)）。

## 标量


该GraphQL包括以下默认类型：`Int`，`Float`，`String`，`Boolean` 和 `ID`。但是，有时您可能需要支持自定义原子数据类型（例如 `Date` ）。

<!-- tabs:start -->

#### ** 模式优先 **


为了定义一个自定义标量（在[这里](http://graphql.cn/learn/schema/#scalar-types)阅读更多关于标量的信息），我们必须创建一个类型定义和一个专用的解析器。在这里（如在官方文档中），我们将采取 `graphql-type-json` 包用于演示目的。这个npm包定义了一个`JSON`GraphQL标量类型。首先，让我们安装包：

```bash
$ npm i --save graphql-type-json
```

然后，我们必须将自定义解析器传递给 `forRoot()` 函数：

```typescript
import * as GraphQLJSON from 'graphql-type-json';

@Module({
  imports: [
    GraphQLModule.forRoot({
      typePaths: ['./**/*.graphql'],
      resolvers: { JSON: GraphQLJSON },
    }),
  ],
})
export class ApplicationModule {}
```
现在, 我们可以在类型定义中使用 `JSON` 标量:

```typescript
scalar JSON

type Foo {
  field: JSON
}
```

定义标量类型的另一种形式是创建一个简单的类。假设我们想用 `Date` 类型增强我们的模式。

```typescript
import { Scalar, CustomScalar } from '@nestjs/graphql';
import { Kind, ValueNode } from 'graphql';

@Scalar('Date')
export class DateScalar implements CustomScalar<number, Date> {
  description = 'Date custom scalar type';

  parseValue(value: number): Date {
    return new Date(value); // value from the client
  }

  serialize(value: Date): number {
    return value.getTime(); // value sent to the client
  }

  parseLiteral(ast: ValueNode): Date {
    if (ast.kind === Kind.INT) {
      return new Date(ast.value);
    }
    return null;
  }
}
```
之后，我们需要注册 `DateScalar` 为提供者。

```
@Module({
  providers: [DateScalar],
})
export class CommonModule {}
```
现在我们可以在 `Date` 类型定义中使用标量。

```typescript
scalar Date

```

#### ** 使用 Typescript **

要创建 Date 标量，只需创建一个新类。

```typescript
import { Scalar, CustomScalar } from '@nestjs/graphql';
import { Kind, ValueNode } from 'graphql';

@Scalar('Date', type => Date)
export class DateScalar implements CustomScalar<number, Date> {
  description = 'Date custom scalar type';

  parseValue(value: number): Date {
    return new Date(value); // value from the client
  }

  serialize(value: Date): number {
    return value.getTime(); // value sent to the client
  }

  parseLiteral(ast: ValueNode): Date {
    if (ast.kind === Kind.INT) {
      return new Date(ast.value);
    }
    return null;
  }
}
```

准备好后，注册 `DateScalar` 为provider。

```typescript
@Module({
  providers: [DateScalar],
})
export class CommonModule {}
```

现在可以在类中使用  Date 类型。

```typescript
@Field()
creationDate: Date;
```

## 指令

【待翻译】

## 插件

【待翻译】

## 接口

【待翻译】

## 联合类型

【待翻译】

## 字段中间件

【待翻译】

## 枚举

【待翻译】

## 复杂性

【待翻译】

## 扩展

【待翻译】

## CLI 插件

【待翻译】

## 生成 SDL

【待翻译】

## 其他功能

在GraphQL世界中，很多文章抱怨如何处理诸如身份验证或操作的副作用之类的东西。我们应该把它放在业务逻辑中吗？我们是否应该使用更高阶的函数来增强查询和变更，例如，使用授权逻辑？或者也许使用[模式指令](https://www.apollographql.com/docs/apollo-server/v2/features/directives.html)。无论如何，没有一个答案。

Nest生态系统正试图利用[守卫](/8/guards)和[拦截器](/8/interceptors)等现有功能帮助解决这个问题。它们背后的想法是减少冗余，并为您提供有助于创建结构良好，可读且一致的应用程序的工具。

### 概述

您可以以与简单的 REST 应用程序相同的方式使用[守卫](/8/guards)、[拦截器](/8/interceptors)、[过滤器](/8/exceptionfilters)或[管道](/8/pipes)。此外，您还可以通过利用[自定义装饰器](/8/customdecorators) 特性轻松地创建自己的 decorator。他们都一样。让我们看看下面的代码:

```typescript
@Query('author')
@UseGuards(AuthGuard)
async getAuthor(@Args('id', ParseIntPipe) id: number) {
  return await this.authorsService.findOneById(id);
}
```

正如您所看到的，GraphQL在看守器和管道方面都能很好地工作。因此，您可以将身份验证逻辑移至守卫，甚至可以复用与 REST 应用程序相同的守卫。拦截器的工作方式完全相同：

```typescript
@Mutation()
@UseInterceptors(EventsInterceptor)
async upvotePost(@Args('postId') postId: number) {
  return await this.postsService.upvoteById({ id: postId });
}
```
### 执行上下文

但是，ExecutionContext 看守器和拦截器所接收的情况有所不同。GraphQL 解析器有一个单独的参数集，分别为 root，args，context，和 info。因此，我们需要将 ExecutionContext 转换为 GqlExecutionContext，这非常简单。

```typescript
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const ctx = GqlExecutionContext.create(context);
    return true;
  }
}
```

GqlExecutionContext 为每个参数公开相应的函数，比如 getArgs()，getContext()等等。现在，我们可以毫不费力地获取特定于当前处理的请求的每个参数。


### 异常过滤器

该[异常过滤器](/8/exceptionfilters)与 GraphQL 应用程序兼容。

```typescript
@Catch(HttpException)
export class HttpExceptionFilter implements GqlExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const gqlHost = GqlArgumentsHost.create(host);
    return exception;
  }
}
```

?> GqlExceptionFilter 和 GqlArgumentsHost 需要import @nestjs/graphql 包。

但是，`response` 在这种情况下，您无法访问本机对象（如在HTTP应用程序中）。


### 自定义装饰器

如前所述，[自定义装饰器](/8/customdecorators)功能也可以像 GraphQL 解析器一样工作。但是，Factory 函数采用一组参数而不是 `request` 对象。

```
export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) =>
    GqlExecutionContext.create(ctx).getContext().user,
);
```

然后：

```typescript
@Mutation()
async upvotePost(
  @User() user: UserEntity,
  @Args('postId') postId: number,
) {}
```

?> 在上面的示例中，我们假设您的user对象已分配给GraphQL应用程序的上下文。

## 联合服务

【待翻译】

 ### 译者署名
 
| 用户名 | 头像 | 职能 | 签名 |
|---|---|---|---|
