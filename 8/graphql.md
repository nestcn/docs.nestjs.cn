# GraphQL

## 驾驭 TypeScript 和 GraphQL 的强大功能

[<span style="color:red">GraphQL</span>](https://graphql.org/) 是一种用于 API 的强大查询语言，是使用现有数据来完成这些查询的运行时。这是一种优雅的方法，可以解决我们在典型REST APIs 中遇到的许多问题 。为了解背景，我们建议你阅读一下 GraphQL 和 REST 之间的[<span style="color:red">比较</span>](https://dev-blog.apollodata.com/graphql-vs-rest-5d425123e34b) 。GraphQL 与 [<span style="color:red">TypeScript</span>](https://www.typescriptlang.org/) 相结合，能帮你在 GraphQL 查询中开发出更好的类型安全性，从而为你提供端到端的输入。

在本章中, 我们假设你对 GraphQL 已经有了基本的了解，我们将不解释什么是 GraphQL, 而是重点介绍如何使用内置的 `@nestjs/graphql` 模块。`GraphQLModule` 仅仅是 [<span style="color:red">Apollo</span>](https://www.apollographql.com) Server 的包装器。我们没有造轮子, 而是提供一个现成的模块, 这让 GraphQL 和 Nest 有了比较简洁的融合方式。


### 安装

首先，我们需要安装以下依赖包：

```bash
$ npm i --save @nestjs/graphql graphql-tools graphql apollo-server-express@2.x.x
```

?> 如果你使用 Fastify，则安装 `apollo-server-fastify`，替代安装 `apollo-server-express`。

### 概述

Nest 提供了两种构建 GraphQL 应用程序的方式，**模式优先**和**代码优先**。你可以选择一个适合自己的最佳方案。在 GraphQL 一章中的大部分章节将被分为两个主要部分：一部分采用**代码优先**，另一部分采用**模式优先**。

在**代码优先**的方式中，你将仅使用装饰器和 TypeScript 类来生成相应的 GraphQL schema。如果您更喜欢使用 TypeScript 来工作并想要避免语言语法之间的上下文切换，那这种方式会更有效。

**模式优先**的方式，本质是 GraphQL SDL（模式定义语言）。它以一种与语言无关的方式，基本允许您在不同平台之间共享模式文件。此外，Nest 将根据GraphQL 模式（通过类或接口）自动生成 TypeScript 定义，以减少冗余。


### 入门

依赖包安装完成后，我们就可以加载 `GraphQLModule` 并通过 `forRoot()` 静态方法来配置它。

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


### GraphQL playground

Playground 是一个图形化的，交互式的浏览器内 GraphQL IDE，默认情况下可与 GraphQL 服务器本身 URL 相同。为了进入 playground，你需要进行基础的 GraphQL 服务配置并且运行它。现在看，你可以用这里的[示例代码](https://github.com/nestjs/nest/tree/master/sample/23-graphql-code-first)进行安装和构建。或者，如果你遵循这些代码示例，一旦你完成了[解析器章节]()中的步骤，你就可以进入 playground 了。

当您的应用程序在后台运行时，打开 Web 浏览器并访问： http://localhost:3000/graphql （主机和端口可能因您的配置而异）。你将看到 GraphQL playground，如下所示。

![](https://docs.nestjs.com/assets/playground.png)

### 多个端点

该模块的另一个有用功能是能够同时为多个端点提供服务。多亏了这一点，您可以决定哪个模块应该包含在哪个端点中。默认情况下，`GraphQL` 在整个应用程序中搜索解析器。要仅限制模块的子集，可以使用该 `include` 属性。

```typescript
GraphQLModule.forRoot({
  include: [CatsModule],
}),
```

!> 如果你在单个应用中使用具有多个 GraphQL 端点的 `apollo-server-fastify` 包，请确保在 GraphQLModule 配置中启用 `disableHealthcheck` 设置。

 <!-- tabs:start -->

#### ** 模式优先 **

使用模式优先的方式，首先要在配置对象中添加 `typePaths`属性。该 `typePaths` 属性指示 `GraphQLModule` 应该查找 GraphQL SDL schema 文件的位置。所有这些文件最终将合并到内存中，这意味着您可以将模式拆分为多个文件并将它们放在靠近解析器的位置。

```typescript
GraphQLModule.forRoot({
  typePaths: ['./**/*.graphql'],
}),
```

你通常也需要有对应于 GraphQL SDL 类型的 TypeScripts 定义（类和接口）。手动创建相应的 TypeScript 定义是多余且乏味的。它让我们没有单一的事实来源-- SDL 中所做的每一次更改都迫使它们也调整 TypeScript 定义。为解决这个问题，该 `@nestjs/graphql` 包可以使用抽象语法树（[AST](https://en.wikipedia.org/wiki/Abstract_syntax_tree)）**自动生成** TypeScript 定义。要启用这个功能，只需在配置 `GraphQLModule`时 添加 `definitions` 属性即可。

```typescript
GraphQLModule.forRoot({
  typePaths: ['./**/*.graphql'],
  definitions: {
    path: join(process.cwd(), 'src/graphql.ts'),
  },
}),
```

`defintions` 对象中的 path 属性，指示在哪里保存生成的 TypeScript 输出文件。默认情况下，所有生成的 TypeScript 被转换为接口类型。若要转换为类，则要将 `outputAs` 属性指定为 `class`。

```typescript
GraphQLModule.forRoot({
  typePaths: ['./**/*.graphql'],
  definitions: {
    path: join(process.cwd(), 'src/graphql.ts'),
    outputAs: 'class',
  },
}),
```

每次应用程序启动时，上述方式都会自动生成 TypeScript 定义。或者，构建一个简单的脚本来按需生成这些定义会更好。举例来说，假设我们创建如下的脚本 `generate-typings.ts`: 

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

现在你可以按需运行此脚本：

```bash
$ ts-node generate-typings
```

?> 您也可以预先编译脚本（例如，使用 `tsc`）并使用 `node` 去执行它。

当需要切换到文件监听模式（当任何 `.graphql` 文件更改时自动生成类型定义），将 `watch` 选项传递给 `generate()` 方法。

```typescript
definitionsFactory.generate({
  typePaths: ['./src/**/*.graphql'],
  path: join(process.cwd(), 'src/graphql.ts'),
  outputAs: 'class',
  watch: true,
});
```

要为每个对象类型自动生成额外的 `__typename` 字段，需开启 `emitTypenameField` 选项。

```typescript
definitionsFactory.generate({
  // ...,
  emitTypenameField: true,
});
```

要将解析器（查询、变更、订阅）生成不带参数的普通字段，需开启 `skipResolverArgs` 选项。

```typescript
definitionsFactory.generate({
  // ...,
  skipResolverArgs: true,
});
```


[这里](https://github.com/nestjs/nest/tree/master/sample/12-graphql-apollo) 提供完整的例子。

#### ** 代码优先 **

在代码优先方式中，您将只使用装饰器和 TypeScript 类来生成相应的 GraphQL schema。

使用代码优先方式，首先要在配置对象里添加 `authSchemaFile` 这个属性：

```typescript
GraphQLModule.forRoot({
  autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
}),
```

这里 `autoSchemaFile` 属性值是您自动生成的 schema 文件将被创建的路径。或者，schema 也可以被实时创建在内存里。要开启它，需要设置 `authSchemaFile` 属性为 `true`:

```typescript
GraphQLModule.forRoot({
  autoSchemaFile: true,
}),
```

默认情况下，生成的 schema 中的类型将按照它们在包含的模块中定义的顺序。要按照字典顺序对 schema 进行排序，需设置 `sortSchema` 属性为 `true`。

```typescript
GraphQLModule.forRoot({
  autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
  sortSchema: true,
}),
```

[这里](https://github.com/nestjs/nest/tree/master/sample/23-graphql-code-first)提供代码优先的完整例子。


<!-- tabs:end -->

### 访问生成的 schema

在某些情况下（例如端到端的测试），你可能希望引用生成的 schema 对象。在端到端的测试中，你可以使用 `graphql` 对象运行查询，而无需使用任何 HTTP 监听器。

你可以使用 `GraphQLSchemaHost` 类，访问生成的 schema（无论是代码优先还是模式优先方式）。

```typescript
const { schema } = app.get(GraphQLSchemaHost);
```

?> 你必须在应用初始化之后（在 `onModuleInit` 钩子被 `app.listen()` 或 `app.init()` 方法触发之后）才能调用 `GraphQLSchemaHost` 的 getter 方法。


### Async 配置


当你需要异步而不是静态地传递模块选项时，请使用 `forRootAsync()` 方法。与大多数动态模块一样，Nest 提供了多种技术来处理异步配置。

第一种技术是使用工厂函数:

```typescript
GraphQLModule.forRootAsync({
  useFactory: () => ({
    typePaths: ['./**/*.graphql'],
  }),
}),
```
像其他工厂提供者一样，我们的工厂函数可以是[异步](https://docs.nestjs.com/fundamentals/custom-providers#factory-providers-usefactory)的, 并且能够通过 `inject` 注入依赖关系。

```typescript
GraphQLModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => ({
    typePaths: configService.getString('GRAPHQL_TYPE_PATHS'),
  }),
  inject: [ConfigService],
}),
```

另外，你也可以在配置 `GraphQLModule` 时用类替代工厂，如下所示：

```typescript
GraphQLModule.forRootAsync({
  useClass: GqlConfigService,
}),
```

上面的构造将在 `GraphQLModule` 内部实例化 `GqlConfigService` , 并将利用它来创建选项对象。注意在这个例子中，`GqlConfigService` 必须实现 `GqlOptionsFactory` 接口，如下所示。该 `GraphQLModule` 模块将在提供的类实例化对象上调用 `createGqlOptions()` 方法。

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

如果你想重用现有的选项提供者而不是在 `GraphQLModule` 内创建私有副本，请使用 `useExisting` 语法。


```typescript
GraphQLModule.forRootAsync({
  imports: [ConfigModule],
  useExisting: ConfigService,
}),
```


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

在代码优先方式中，我们不必手动编写SDL。相反，我们只需使用装饰器。

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

一个指令可以被附加在一个字段或对象片段上，并能按照服务器所希望的任何方式影响查询语句的执行(参见[此处](https://graphql.org/learn/queries/#directives))。GraphQL 规范中提供了几个默认的指令：

  - `@include(if: Boolean)` - 仅在参数为真时，才在结果中包含此字段
  - `@skip(if: Boolean)` - 参数为真时，跳过此字段
  - `@deprecated(reason: String)` - 标记此字段为已弃用，并附上原因

指令其实就是一个带有 `@` 符号前缀的标识符，可选项为后面紧跟着的命名参数列表，它可以出现在 GraphQL 查询和模式语言中的几乎任何元素之后。


### 自定义指令

创建自定义模式指令，要先声明一个继承 `SchemaDirectiveVisitor` 的类，这个类是从 `apollo-server` 包中导出。

```typescript
import { SchemaDirectiveVisitor } from 'apollo-server';
import { defaultFieldResolver, GraphQLField } from 'graphql';

export class UpperCaseDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field: GraphQLField<any, any>) {
    const { resolve = defaultFieldResolver } = field;
    field.resolve = async function(...args) {
      const result = await resolve.apply(this, args);
      if (typeof result === 'string') {
        return result.toUpperCase();
      }
      return result;
    };
  }
}
```

?> 注意指令不能被 `@Injectable()` 装饰器装饰。因此，它们不能被依赖注入。

现在，我们在 `GraphQLModule.forRoot() ` 方法中注册 `UpperCaseDirective` ：

```typescript
GraphQLModule.forRoot({
  // ...
  schemaDirectives: {
    upper: UpperCaseDirective,
  },
});
```

一旦被注册，我们就可以在 schema 中使用这个 `@upper` 指令。但是，应用指令的方式会有所不同，这取决于你的使用方法（代码优先或模式优先）。

### 代码优先

在代码优先方式中，使用 `@Directive()` 装饰器来应用指令。

```typescript
@Directive('@upper')
@Field()
title: string;
```

?> `@Directive()` 装饰器是从 `@nestjs/graphql` 包里导出的。

指令可以被应用在字段、字段解析器、输入和对象类型上，同样也可以应用在查询、变更和订阅上。这里有一个将指令应用于查询处理层的例子：

```typescript
@Directive('@deprecated(reason: "This query will be removed in the next version")')
@Query(returns => Author, { name: 'author' })
async getAuthor(@Args({ name: 'id', type: () => Int }) id: number) {
  return this.authorsService.findOneById(id);
}
```

通过 `@Directive()` 装饰器所应用的指令，将不会被映射在生成的模式定义文件中。

### 模式优先

在模式优先方式中，直接在 SDL 中应用指令。

```graphql
directive @upper on FIELD_DEFINITION

type Post {
  id: Int!
  title: String! @upper
  votes: Int
}
```

## 插件

插件能让你通过响应某些特定事件时执行自定义操作，来扩展 Apollo Server 的核心功能。现在，这些事件对应 GraphQL 请求生命周期的各个阶段，以及 Apollo Server 本身的启动阶段（参见[这里](https://www.apollographql.com/docs/apollo-server/integrations/plugins/)）。比如，一个基本的日志插件可能会记录每一个发送给 Apollo Server 请求的相关 GraphQL 查询字符串。


### 自定义插件

创建插件，首先要声明一个用 `@Plugin` 装饰器注释的类，这个装饰器是从 `@nestjs/graphql` 包里导出的。还有，为了更好的使用代码自动补全功能，我们要从 `Apollo-server-plugin-base` 包中实现 `ApolloServerPlugin` 这个接口。

```typescript
import { Plugin } from '@nestjs/graphql';
import {
  ApolloServerPlugin,
  GraphQLRequestListener,
} from 'apollo-server-plugin-base';

@Plugin()
export class LoggingPlugin implements ApolloServerPlugin {
  requestDidStart(): GraphQLRequestListener {
    console.log('Request started');
    return {
      willSendResponse() {
        console.log('Will send response');
      },
    };
  }
}
```

有了下面这段代码，我们就可以将 `LoggingPlugin` 注册为一个提供者。

```typescript
@Module({
  providers: [LoggingPlugin],
})
export class CommonModule {}
```

Nest 会自动实例化一个插件并将其应用于 Apollo 服务。

### 使用外部插件

有几个开箱即用的插件。使用一个现成的插件，只需将它导入并加入到 `plugins` 数组即可：

```typescript
GraphQLModule.forRoot({
  // ...
  plugins: [ApolloServerOperationRegistry({ /* options */})]
}),
```

?> `ApolloServerOperationRegistry` 插件是从 `apollo-server-plugin-operation-registry` 包里导出的。


## 接口

像许多类型系统一样，GraphQL 支持接口。接口是一种抽象类型，它包含一组特定的字段，类型必须包含这些字段才能实现接口。

### 代码优先

当使用代码优先方式时，你可以通过创建一个带有 `@InterfaceType()` 装饰器注释的抽象类，来定义一个 GraphQL 接口，这个装饰器是从 `@nestjs/graphql` 包里导出。  

```typescript
import { Field, ID, InterfaceType } from '@nestjs/graphql';

@InterfaceType()
export abstract class Character {
  @Field(type => ID)
  id: string;

  @Field()
  name: string;
}
```

!> TypeScript 接口不能用来定义 GraphQL 接口。

最终的结果是在 SDL 中生成以下部分的 GraphQL schema：

```graphql
interface Character {
  id: ID!
  name: String!
}
```

现在，使用 `implements` 关键字来实现 `Character` 这个接口： 

```typescript
@ObjectType({
  implements: () => [Character],
})
export class Human implements Character {
  id: string;
  name: string;
}
```

?> `@ObjectType()` 装饰器是从 `@nestjs/graphql` 包里导出。

默认的 `resolveType()` 函数是通过库根据解析器方法返回值提取的类型来生成的。这意味着你必须返回类的实例（你不能返回 JavaScript 对象字面量）。

提供自定义的 `resolveType()` 函数，将 `resolveType` 属性传递给 `@InterfaceType()` 装饰器里的选项对象，如下所示：

```typescript
@InterfaceType({
  resolveType(book) {
    if (book.colors) {
      return ColoringBook;
    }
    return TextBook;
  },
})
export abstract class Book {
  @Field(type => ID)
  id: string;

  @Field()
  title: string;
}
```

### 模式优先

在模式优先方式中定义接口，只需使用 SDL 创建一个 GraphQL 接口。

```graphql
interface Character {
  id: ID!
  name: String!
}
```

然后，你可以使用类型生成功能（如[快速开始](/8/graphql?id=快速开始)章节所示）生成相应的 TypeScript 定义。

```typescript
export interface Character {
  id: string;
  name: string;
}
```

在解析器映射图中，接口需要一个额外的 `__resolveType` 字段，来确定接口应该解析为哪个类型。让我们创建一个 `CharactersResolver` 类并定义 `__resolveType` 方法：

```typescript
@Resolver('Character')
export class CharactersResolver {
  @ResolveField()
  __resolveType(value) {
    if ('age' in value) {
      return Person;
    }
    return null;
  }
}
```

?> 所有装饰器都是从 `@nestjs/graphql` 包里导出。


## 联合类型

联合类型与接口非常相似，但是它们没有指定类型之间的任何公共字段（详情请参阅[这里](https://graphql.org/learn/schema/#union-types)）。联合类型对于单个字段返回不相交的数据类型很有用。

### 代码优先

要定义 GraphQL 联合类型，我们必须先定义组成这个联合类型的各个类。遵循 Apollo 文档中的[示例](https://www.apollographql.com/docs/apollo-server/schema/unions-interfaces/#union-type)，我们将创建两个类。首先，`Book`：

```typescript
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Book {
  @Field()
  title: string;
}
```

然后是 `Author`：

```typescript
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Author {
  @Field()
  name: string;
}
```

在这里，我们使用从 `@nestjs/graphql` 包里导出的 `createUnionType` 函数来注册 `ResultUnion` 这个联合类型。

```typescript
export const ResultUnion = createUnionType({
  name: 'ResultUnion',
  types: () => [Author, Book],
});
```

现在，我们就可以在查询中引用 `ResultUnion` 这个联合类型来。

```typescript
@Query(returns => [ResultUnion])
search(): Array<typeof ResultUnion> {
  return [new Author(), new Book()];
}
```

最终的结果是在 SDL 中生成以下部分的 GraphQL schema：

```graphql
type Author {
  name: String!
}

type Book {
  title: String!
}

union ResultUnion = Author | Book

type Query {
  search: [ResultUnion!]!
}
```

默认的 `resolveType()` 函数是通过库根据解析器方法返回值提取的类型来生成的。这意味着你必须返回类的实例（你不能返回 JavaScript 对象字面量）。

提供自定义的 `resolveType()` 函数，将 `resolveType` 属性传递给 `@InterfaceType()` 装饰器里的选项对象，如下所示：

```typescript
export const ResultUnion = createUnionType({
  name: 'ResultUnion',
  types: () => [Author, Book],
  resolveType(value) {
    if (value.name) {
      return Author;
    }
    if (value.title) {
      return Book;
    }
    return null;
  },
});
```

### 模式优先

在模式优先方式中定义联合类型，只需使用 SDL 创建一个 GraphQL 联合类型。

```graphql
type Author {
  name: String!
}

type Book {
  title: String!
}

union ResultUnion = Author | Book
```

然后，你可以使用类型生成功能（如[快速开始](/8/graphql?id=快速开始)章节所示）生成相应的 TypeScript 定义。

```typescript
export class Author {
  name: string;
}

export class Book {
  title: string;
}

export type ResultUnion = Author | Book;
```

在解析器映射图中，联合类型需要一个额外的 `__resolveType` 字段，来确定联合类型应该解析为哪个类型。另外，请注意， `ResultUnionResolver` 这个类在任何模块中都必须被注册为提供者。让我们创建一个 `ResultUnionResolver` 类并定义 `__resolveType` 方法：

```typescript
@Resolver('ResultUnion')
export class ResultUnionResolver {
  @ResolveField()
  __resolveType(value) {
    if (value.name) {
      return 'Author';
    }
    if (value.title) {
      return 'Book';
    }
    return null;
  }
}
```

?> 所有装饰器都是从 `@nestjs/graphql` 包里导出。

## 字段中间件

!> 这一章节仅适用于代码优先方式。

字段中间件允许你在解析字段之前或之后运行任意代码。一个字段中间件可被用来转换字段的返回结果，验证字段的参数，甚至验证字段级别的角色（比如，某个执行了中间件函数的目标字段需要验证角色才能访问）。

你可以在一个字段上连接多个中间件函数。在这种情况下，它们将沿着链式顺序调用，即在上一个中间件中决定下一个中间件的调用。中间件函数在 `middleware` 数组中的顺序很重要。第一个解析器是“最外”层，所以它会第一个或最后一个被执行（类似 `graphql-middleware` 包）。第二个解析器是“次外”层，所以它会第二个或倒数第二个被执行。

### 快速开始

让我们开始创建一个简单的中间件，它会在一个字段被返回给客户端之前记录这个字段的值：

```typescript
import { FieldMiddleware, MiddlewareContext, NextFn } from '@nestjs/graphql';

const loggerMiddleware: FieldMiddleware = async (
  ctx: MiddlewareContext,
  next: NextFn,
) => {
  const value = await next();
  console.log(value);
  return value;
};
```

?> `MiddlewareContext` 是一个对象，它是由 GraphQL 解析器函数通常所接收的参数组成（`{ source, args, context, info }`），而 `NextFn` 是一个函数，它可以让你执行堆栈中的下一个中间件（绑定到此字段）或实体字段解析器。

!> 字段中间件函数不能注入依赖项，也不能访问 Nest 的 DI 容器，因为它们被设计为非常轻量级而且不应该执行任何可能耗时的操作（比如从数据库中检索数据）。如果你需要从数据源调用外部服务或查询数据，你应该在一个绑定到根查询或变更处理程序的守卫/拦截器中执行此操作，并将其分配给字段中间件中你可以访问的上下文对象（具体来说，就是来自 `MiddlewareContext` 的对象）。

注意字段中间件必须和 `FieldMiddleware` 接口匹配。在上面的例子中，我们首先运行 `next()` 函数（它执行实际的字段解析器并返回一个字段值），紧接着，我们把这个值记录到我们的终端。另外，这个从中间件函数返回的值完全覆盖了之前的值，并且由于我们不想执行任何更改，因此我们只需返回原始值。

在这里，我们可以直接在 `@Field()` 装饰器里注册中间件。

```typescript
@ObjectType()
export class Recipe {
  @Field({ middleware: [loggerMiddleware] })
  title: string;
}
```

现在每当我们请求 `Recipe` 对象类型中的 `title` 字段时，原始的字段值将会被记录到控制台。

?> 要了解如何使用扩展功能实现字段级权限系统，请查阅此[章节](/8/graphql?id=扩展)。

另外，如上文所说，我们可以通过中间件函数来控制字段的值。出于演示目的，让我们将 recipe 的标题（如果存在）变成大写。

```typescript
const value = await next();
return value?.toUpperCase();
```

在这种情况下，当被请求时，所有的标题会被自动转换为大写。

同样，你可以在一个自定义字段解析器（一个被 `@ResolveField()` 装饰器注释的方法）上绑定字段中间件，如下所示：

```typescript
@ResolveField(() => String, { middleware: [loggerMiddleware] })
title() {
  return 'Placeholder';
}
```

!> 如果在字段解析器级别启用了增强器（[了解更多](https://docs.nestjs.com/graphql/other-features#execute-enhancers-at-the-field-resolver-level)），字段中间件函数将会在所有拦截器、守卫等之前运行，绑定到方法（但在为查询或变更处理程序注册的根级增强器之后）。

### 全局字段中间件

除了将中间件直接绑定到一个特定的字段上，你还可以在全局注册一个或多个中间件函数。在这种情况下，它们将会自动连接到你的对象类型的所有字段上。

```typescript
GraphQLModule.forRoot({
  autoSchemaFile: 'schema.gql',
  buildSchemaOptions: {
    fieldMiddleware: [loggerMiddleware],
  },
}),
```

?> 全局注册的字段中间件函数将在本地注册的中间件（那些直接绑定到特定字段上的）之前被执行。


## 枚举

枚举类型是一种特殊的标量，它的值仅限于一组特定的允许值（详情请参阅[这里](https://graphql.org/learn/schema/#enumeration-types)）。这允许你：

- 验证此类型的任何参数都是允许值之一
- 通过类型系统传递一个字段，这个字段始终是一组有限的值之一

### 代码优先

当使用代码优先方式时，你只需通过创建一个 TypeScript 枚举变量来定义一个 GraphQL 枚举类型。

```typescript
export enum AllowedColor {
  RED,
  GREEN,
  BLUE,
}
```

在这里，我们使用 `@nestjs/graphql` 包里的 `registerEnumType` 函数来注册 `AllowedColor` 枚举。

```typescript
registerEnumType(AllowedColor, {
  name: 'AllowedColor',
});
```

现在你可以在我们的类型中引用 `AllowedColor`：

```typescript
@Field(type => AllowedColor)
favoriteColor: AllowedColor;
```

最终的结果是在 SDL 中生成以下部分的 GraphQL schema：

```graphql
enum AllowedColor {
  RED
  GREEN
  BLUE
}
```

要为枚举提供描述，可以将`description` 属性传递给 `registerEnumType()` 函数。

```typescript
registerEnumType(AllowedColor, {
  name: 'AllowedColor',
  description: 'The supported colors.',
});
```

要为枚举值提供描述，或将值标记为已弃用，可以传递 `valuesMap` 属性，如下所示：

```typescript
registerEnumType(AllowedColor, {
  name: 'AllowedColor',
  description: 'The supported colors.',
  valuesMap: {
    RED: {
      description: 'The default color.',
    },
    BLUE: {
      deprecationReason: 'Too blue.',
    },
  },
});
```

最终在 SDL 中生成的 GraphQL schema 如下所示：

```graphql
"""
The supported colors.
"""
enum AllowedColor {
  """
  The default color.
  """
  RED
  GREEN
  BLUE @deprecated(reason: "Too blue.")
}

```

### 模式优先

在模式优先方式中定义一个枚举器，只需在 SDL 中创建一个 GraphQL 枚举类型。

```graphql
enum AllowedColor {
  RED
  GREEN
  BLUE
}
```

然后，你可以使用类型生成功能（如[快速开始](/8/graphql?id=快速开始)章节所示）生成相应的 TypeScript 定义。

```typescript
export enum AllowedColor {
  RED
  GREEN
  BLUE
}
```

有时，后端会在内部强制使用与公共 API 不同的枚举值。在这个例子中，API 包含 `RED`，然而在解析器中我们可能会使用 `#f00` 来替代（详情请参阅[此处](https://www.apollographql.com/docs/apollo-server/schema/custom-scalars/#internal-values)）。为此，需要给 `AllowedColor` 枚举声明一个解析器对象：

```typescript
export const allowedColorResolver: Record<keyof typeof AllowedColor, any> = {
  RED: '#f00',
};
```

?> 所有装饰器都是从 `@nestjs/graphql` 包里导出。

然后，将此解析器对象与 `GraphQLModule#forRoot()` 方法的 `resolvers` 属性一起使用，如下所示：

```typescript
GraphQLModule.forRoot({
  resolvers: {
    AllowedColor: allowedColorResolver,
  },
});
```

## 映射类型

!> 该章节仅适用于代码优先模式。

当你构建像 CRUD（创建/查询/更新/删除）这些功能时，在基础实体类型上构造变体通常会很有用。Nest 提供了几个执行类型转换的基础函数，让这项任务变得更加方便。

### Partial 局部

当创建输入验证类型（也被叫做 DTOs）时，同时构建**创建**或**更新**变体通常会很有用。例如，**创建**变体可能会需要全部字段，而**更新**变体则可能全部是可选字段。

Nest 提供了 `PartialType()` 这个基础函数来简化此任务并最大限度的减少模版文件。

`PartialType()` 函数返回了一个类型（类），其中输入类型的所有属性都设置为可选。例如，假设我们有一个如下的**创建**类型：

```typescript
@InputType()
class CreateUserInput {
  @Field()
  email: string;

  @Field()
  password: string;

  @Field()
  firstName: string;
}
```

默认情况下，所有这些字段都是必需的。为创建具有相同字段的类型，但每个字段又都是可选的，可以使用 `PartialType()` 传递类引用（`CreateUserInput`）作为参数：

```typescript
@InputType()
export class UpdateUserInput extends PartialType(CreateUserInput) {}
```

?> `PartialType()` 函数是从 `@nestjs/graphql` 包里导出的。

`PartialType()` 函数接受一个可选的第二参数，它是对装饰器工厂的引用。此参数可用于更改应用于结果（子）类的装饰器函数。如果未指定，子类有效地使用与**父**类相同的装饰器（第一个参数中引用的类）。在上面的例子中，我们正在继承用 `@InputType()` 装饰器注释的 `CreateUserInput` 类。即使我们希望 `UpdateUserInput` 也被视为用 `@InputType()` 装饰过，我们不必传递 `InputType` 作为第二个参数。如果父类和子类不同，（例如，父类被 `@ObjectType` 装饰），我们才需要传递 `InputType` 作为第二个参数。例如：

```typescript
@InputType()
export class UpdateUserInput extends PartialType(User, InputType) {}
```

### Pick 选取

`PickType()` 函数可从一个输入类型中选取一组属性并构造一个新的类型（类）。例如，假设我们从这样一个类型开始：

```typescript
@InputType()
class CreateUserInput {
  @Field()
  email: string;

  @Field()
  password: string;

  @Field()
  firstName: string;
}
```

我们用 `PickType()` 这个基础函数从此类中挑选出一组属性：

```typescript
@InputType()
export class UpdateEmailInput extends PickType(CreateUserInput, ['email'] as const) {}
```

?> `PickType()` 函数是从 `@nestjs/graphql` 包里导出的。

### Omit 忽略

`OmitType()` 函数通过从输入类型中选取所有属性然后删除一组特定的键来构造一个类型。例如，假设我们从这样一个类开始：

```typescript
@InputType()
class CreateUserInput {
  @Field()
  email: string;

  @Field()
  password: string;

  @Field()
  firstName: string;
}
```

我们可以生成一个派生类型，它具有除了 `email` 之外的所有属性，如下所示。在这个构造中，`OmitType` 的第二个参数是一个属性名数组。

?> `OmitType()` 函数是从 `@nestjs/graphql` 包里导出的。

### Intersection 交集

`IntersectionType()` 函数是合并两个类型到一个新的类型（类）。例如，假设我们从这样一个类开始：

```typescript
@InputType()
class CreateUserInput {
  @Field()
  email: string;

  @Field()
  password: string;
}

@ObjectType()
export class AdditionalUserInfo {
  @Field()
  firstName: string;
  
  @Field()
  lastName: string;
}
```

我们可以把两个类型中的所有属性都合并起来生成一个新的类型。

```typescript
@InputType()
export class UpdateUserInput extends IntersectionType(CreateUserInput, AdditionalUserInfo) {}
```

?> `IntersectionType()` 函数是从 `@nestjs/graphql` 包里导出的。

### Composition 组合

这些类型映射基础函数是可组合的。例如，以下代码会创建一个类型（类），它拥有 `CreateUserInput` 类型的除了 `email` 的所有属性，而且这些属性将被设置为可选：

```typescript
@InputType()
export class UpdateUserInput extends PartialType(
  OmitType(CreateUserInput, ['email'] as const),
) {}
```


## 复杂性

!> 此章节仅适应于代码优先模式。

查询复杂性允许你定义某些字段的复杂程度，并限制**最大复杂性**的查询。其原理是通过使用一个简单的数字来定义每个字段的复杂度。通常每个字段的复杂度默认为1。另外，GraphQL 查询的复杂性计算可以使用所谓的复杂度估算器进行定制。复杂度估算器是一个计算字段复杂度的简单函数。你可以将任意数量的复杂度估算器添加到规则中，然后一个接一个地执行。第一个返回数字复杂度值的估算器确定该字段的复杂度。

`@nestjs/graphql` 包与 <span style="color:red">graphql-query-complexity</span> 等工具能很好地集成，他们提供了一种基于成本分析的解决方案。有了这个库，你可以拒绝在你的 GraphQL 服务中执行成本过高的查询。

### 安装

要开始使用它，我们首先要安装它所需要的依赖包。

```bash
$npm install --save graphql-query-complexity
```

### 快速开始

一旦安装完，我们就可以定义 `ComplexityPlugin` 这个类：

```typescript
import { GraphQLSchemaHost, Plugin } from '@nestjs/graphql';
import {
  ApolloServerPlugin,
  GraphQLRequestListener,
} from 'apollo-server-plugin-base';
import { GraphQLError } from 'graphql';
import {
  fieldExtensionsEstimator,
  getComplexity,
  simpleEstimator,
} from 'graphql-query-complexity';

@Plugin()
export class ComplexityPlugin implements ApolloServerPlugin {
  constructor(private gqlSchemaHost: GraphQLSchemaHost) {}

  requestDidStart(): GraphQLRequestListener {
    const { schema } = this.gqlSchemaHost;

    return {
      didResolveOperation({ request, document }) {
        const complexity = getComplexity({
          schema,
          operationName: request.operationName,
          query: document,
          variables: request.variables,
          estimators: [
            fieldExtensionsEstimator(),
            simpleEstimator({ defaultComplexity: 1 }),
          ],
        });
        if (complexity >= 20) {
          throw new GraphQLError(
            `Query is too complex: ${complexity}. Maximum allowed complexity: 20`,
          );
        }
        console.log('Query Complexity:', complexity);
      },
    };
  }
}
```

为了演示，我们将允许的最大复杂度指定为 20。在上面的示例中，我们使用了 2 个估算器，`simpleEstimator` 和 `fieldExtensionsEstimator`。

- `simpleEstimator`：该简单估算器为每个字段返回一个固定复杂度
- `fieldExtensionsEstimator`：字段扩展估算器提取 schema 中每个字段的复杂度值

?> 别忘了将此类添加到任意模块的提供者数组中。

### 字段级复杂性

有了这个插件，我们可以为任意字段定义复杂度了，做法就是在传递给 `@Field()` 装饰器的选项对象中，指定 `complexity` 属性的值，如下所示：

```typescript
@Field({ complexity: 3 })
title: string;
```

或者，你也可以定义估算器函数：

```typescript
@Field({ complexity: (options: ComplexityEstimatorArgs) => ... })
title: string;
```

### 查询/变更级复杂性

此外，`@Query` 和 `@Mutation()` 装饰器也具有复杂性属性，可以被这样指定：

```typescript
@Query({ complexity: (options: ComplexityEstimatorArgs) => options.args.count * options.childComplexity })
items(@Args('count') count: number) {
  return this.itemsService.getItems({ count });
}
```

## 扩展

!> 此章节仅适应于代码优先模式。

扩展是一种**高阶的**，**低级**功能，可让你在类型配置中定义任何数据。附加自定义元数据到某些字段，能让你创建更复杂的通用解决方案。例如，使用扩展，你可以定义一些只能访问部分字段的字段级角色。这些角色可以在运行时被映射出来，进而来确定调用者是否具有足够的权限来检索特定字段。

### 添加自定义元数据

为字段添加自定义元数据，可以使用从 `@nestjs/graphql` 包中导出的 `@Extensions()` 装饰器。

```typescript
@Field()
@Extensions({ role: Role.ADMIN })
password: string;
```

在上面的例子中，我们给 `role` 元数据属性分配了 `Role.Admin` 的值。`Role` 是一个简单的 TypeScript 枚举变量，它将我们系统中可用的所有用户角色进行分组。

请注意，除了在字段上设置元数据，你也可以在类层级和方法层级（例如，在查询处理程序）上使用 `@Extensions()` 装饰器。

### 使用自定义元数据

利用自定义元数据的逻辑可以根据需求变得复杂。例如，你可以创建一个简单的拦截器，来存储/记录每个方法被调用的事件，或创建一个<span style="color:red">字段中间件</span>，来匹配检索具有调用者权限（字段级权限系统）限制的字段所需的角色。

出于说明目的，让我们定义一个 `checkRoleMiddleware`，将用户的角色（此处硬编码）与访问目标字段所需的角色进行比较：

```typescript
export const checkRoleMiddleware: FieldMiddleware = async (
  ctx: MiddlewareContext,
  next: NextFn,
) => {
  const { info } = ctx;
  const { extensions } = info.parentType.getFields()[info.fieldName];

  /**
   * In a real-world application, the "userRole" variable
   * should represent the caller's (user) role (for example, "ctx.user.role").
   */
  const userRole = Role.USER;
  if (userRole === extensions.role) {
    // or just "return null" to ignore
    throw new ForbiddenException(
      `User does not have sufficient permissions to access "${info.fieldName}" field.`,
    );
  }
  return next();
};
```

在这里，我们可以为 `password` 字段注册一个中间件，如下所示：

```typescript
@Field({ middleware: [checkRoleMiddleware] })
@Extensions({ role: Role.ADMIN })
password: string;
```


## CLI 插件

!> 此章节仅适用于代码优先模式。

TypeScript 的元数据反射系统有几个限制，例如，确定一个类包含哪些属性或识别给定的属性是可选还是必须的。但是，其中一些约束可以在编译时解决。Nest 提供了一个插件，它可以增强 TypeScript 的编译进程，以减少依赖的模板代码量。

?> 这个插件是<span style="color:blue">可配置的</span>。如果你愿意，你可以手动声明所有的装饰器，或者只在需要的地方声明特定的装饰器。

### 概览

GraphQL 插件会自动地：

- 除非使用 `@HideField`，否则使用 `@Field` 注释所有输入对象、对象类型和参数类属性
- 根据问号设置 `nullable` 属性（例如，`name?: string` 将会设置 `nullable: true`）
- 根据类型设置 `type` 属性（支持数组）
- 根据注释生成属性描述（如果 `introspectComments` 设为 `true`）

请注意，为了能被插件分析，你的文件名**必须包含**以下后缀之一：`['.input.ts', '.args.ts', '.entity.ts', '.model.ts']`（例如，`author.entity.ts`）。如果你用了其他的后缀，你可以通过指定 `typeFileNameSuffix` 配置来调整插件的行为（看下文）。

根据我们到目前为止所学的知识，你必须复制大量代码才能让包知道你的类型在 GraphQL 中应该如何被声明。例如，你可以定义一个简单的 `Author` 类，如下所示：

```typescript
authors/models/author.model.ts

@ObjectType()
export class Author {
  @Field(type => ID)
  id: number;

  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;

  @Field(type => [Post])
  posts: Post[];
}
```

虽然对于中型项目来说这不是一个重大问题，但一旦你有大量的类，它就会变得冗长且难以维护。

通过启用 GraphQL 插件，以上的类声明将会变得简单：

```typescript
authors/models/author.model.ts

@ObjectType()
export class Author {
  @Field(type => ID)
  id: number;
  firstName?: string;
  lastName?: string;
  posts: Post[];
}
```

该插件基于**抽象语法树**即时添加适当的装饰器。因此，你不必为散布在整个代码中的 `@Field` 装饰器而烦恼。

?> 该插件将自动生成任何缺失的 GraphQL 属性，但如果你需要覆盖他们，只需通过 `@Feild` 显示地设置它们。

### 注释内省

启用注释内省功能，CLI 插件会根据注释为字段生成描述。

例如，给出一个 `roles` 属性示例：

```typescript
/**
 * A list of user's roles
 */
@Field(() => [String], {
  description: `A list of user's roles`
})
roles: string[];
```

你必须复制描述值。当 `introspectComments` 启用时，CLI 插件可以提取这些注释并自动为属性提供属性。现在，上面的字段可以被简单地声明如下：

```typescript
/**
 * A list of user's roles
 */
roles: string[];
```

### CLI 插件的使用

要开启插件，请打开 `nest-cli.json`（如果你使用 <span style="color:red">Nest CLI</span>）并添加以下的 `plugins` 配置：

```typescript
{
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "plugins": ["@nestjs/graphql"]
  }
}
```

你可以用 `options` 属性来自定义插件的行为。

```typescript
"plugins": [
  {
    "name": "@nestjs/graphql",
    "options": {
      "typeFileNameSuffix": [".input.ts", ".args.ts"],
      "introspectComments": true
    }
  }
]
```

`options` 属性必须满足以下接口：

```typescript
export interface PluginOptions {
  typeFileNameSuffix?: string[];
  introspectComments?: boolean;
}
```

| 选项 | 默认值 | 描述 |
|:---:|---|---|
| `typeFileNameSuffix` | ```['.input.ts', '.args.ts', '.entity.ts', '.model.ts']``` | GraphQL 类型文件后缀 |
| `introspectComments` | `false` | 如果为真，插件将会根据注释为属性生成描述 |

如果你不使用 CLI 而是用自定义的 `webpack` 配置，则可以将此插件与 `ts-loader` 结合使用：

```typescript
getCustomTransformers: (program: any) => ({
  before: [require('@nestjs/graphql/plugin').before({}, program)]
}),
```

### `ts-jest` 集成（e2e 测试）

在启用此插件的情况下运行 e2e 测试时，你可能会遇到编译 schema 的问题。例如，其中一个最常见的错误是：

```typescript
Object type <name> must define one or more fields.
```

发生这种情况是原因是 `jest` 配置没有在任何地方导入 `@nestjs/graphql/plugin` 插件。

为解决此问题，我们需要在 e2e 测试目录中创建如下文件：

```typescript
const transformer = require('@nestjs/graphql/plugin');

module.exports.name = 'nestjs-graphql-transformer';
// you should change the version number anytime you change the configuration below - otherwise, jest will not detect changes
module.exports.version = 1;

module.exports.factory = (cs) => {
  return transformer.before(
    {
      // @nestjs/graphql/plugin options (can be empty)
    },
    cs.program, // "cs.tsCompiler.program" for older versions of Jest (<= v27)
  );
};
```

在这里，将 AST 转换器导入到你的 `jest` 配置中。默认情况下（在启动应用中），e2e 测试配置文件在 `test` 文件夹下并且名字是 `jest-e2e.json`。

```json
{
  ... // other configuration
  "globals": {
    "ts-jest": {
      "astTransformers": {
        "before": ["<path to the file created above>"],
      }
    }
  }
}
```


## 生成 SDL

!> 此章节仅适用于代码优先模式。

要手动生成一个 GraphQL SDL schema（例如，没有运行应用，连接数据库，挂接解析器等等），可以使用 `GraphQLSchemaBuilderModule`。

```typescript
async function generateSchema() {
  const app = await NestFactory.create(GraphQLSchemaBuilderModule);
  await app.init();

  const gqlSchemaFactory = app.get(GraphQLSchemaFactory);
  const schema = await gqlSchemaFactory.create([RecipesResolver]);
  console.log(printSchema(schema));
}
```

?> `GraphQLSchemaBuilderModule` 和 `GraphQLSchemaFactory` 是从 `@nestjs/graphql` 包里导出的。`printSchema` 函数是从 `graphql` 包里导出的。

### 用法

`gqlSchemaFactory.create()` 方法接受一个解析器类引用的数组。例如：

```typescript
const schema = await gqlSchemaFactory.create([
  RecipesResolver,
  AuthorsResolver,
  PostsResolvers,
]);
```

它也接受第二个可选的参数，参数是一个标量类的数组：

```typescript
const schema = await gqlSchemaFactory.create(
  [RecipesResolver, AuthorsResolver, PostsResolvers],
  [DurationScalar, DateScalar],
);
```

最后，你还可以传递一个配置项对象：

```typescript
const schema = await gqlSchemaFactory.create([RecipesResolver], {
  skipCheck: true,
  orphanedTypes: [],
});
```

- `skipCheck`：忽略模式验证；布尔类型，默认值是 `false`
- `orphanedTypes`：需要生成的非显示引用（不是对象图的一部分）的类列表。正常情况下，如果声明了一个类但没有在图中以其他方式引用，则将其忽略。其属性值是一个类引用数组。


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

[<span style="color:red">Apollo 联合服务</span>](https://www.apollographql.com/docs/federation/)提供了一种将单体式 GraphQL 服务器拆分为独立微服务的手段。它有两个组成部分：一个网关和一或多个联合微服务。每个微服务都持有部分 schema，网关将这些 schema 合并为一个可以被客户端使用的 schema。

引用[<span style="color:red">Apollo 文档</span>](https://www.apollographql.com/blog/announcement/apollo-federation-f260cf525d21/)，联合服务的设计遵循以下核心原则：

- 构建图表应该是**声明式**的。使用联合服务，你可以在 schema 内部声明式地组合图表，而不是编写命令式 schema 拼接代码。
- 代码应该按**关注点**分割，而不是按类型。通常没有一个团队能控制像 User 或 Product 这种重要类型的各个方面，因此这些类型的定义应该分布在团队和代码库中，而不是写在一起。
- 图表应尽可能简单，以让客户端使用。同时，联合服务可以形成一个完整的、以产品为中心的图表，准确地反映它在客户端的使用情况。
- 它只是 GraphQL，仅使用符合规范的语言特性。任何语言，不仅仅是 JavaScript，都可以实现联合服务。

!> Apollo 联合服务到目前为止还不支持订阅。

在接下来的例子中，我们将设置一个带有网关和两个联合端点的演示程序：一个 Users 服务和一个 Posts 服务，

### 联合示例：Users

首先，安装联合服务的依赖包：

```bash
$ npm install --save @apollo/federation
```

### 模式优先

Users 服务有一个简单的 schema。注意 `@key` 这个指令：它告诉 Apollo 查询规划器，如果你有它的 `id`，则可以获取特定的 User 实例。另外，请注意我们也要继承这个 `Query` 类型。

```graphql
type User @key(fields: "id") {
  id: ID!
  name: String!
}

extend type Query {
  getUser(id: ID!): User
}
```

我们的解析器有一个额外的方法：`resolveReference()`。每当相关资源需要 User 实例时，它就会被 Apollo 网关调用。我们在后面的 Posts 服务中也会看到这个例子。请注意 `@ResolveReference()` 这个装饰器。

```typescript
import { Args, Query, Resolver, ResolveReference } from '@nestjs/graphql';
import { UsersService } from './users.service';

@Resolver('User')
export class UsersResolvers {
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

最后，我们在模块中使用 `GraphQLFederationModule` 将所有东西连接起来。此模块接收与常规的 `GraphQLModule` 相同的配置。

```typescript
import { Module } from '@nestjs/common';
import { GraphQLFederationModule } from '@nestjs/graphql';
import { UsersResolvers } from './users.resolvers';

@Module({
  imports: [
    GraphQLFederationModule.forRoot({
      typePaths: ['**/*.graphql'],
    }),
  ],
  providers: [UsersResolvers],
})
export class AppModule {}
```

### 代码优先

代码优先联合服务与常规的代码优先 GraphQL 很像。我们只需添加一些额外的装饰器到 `User` 实体即可。

```typescript
import { Directive, Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Directive('@key(fields: "id")')
export class User {
  @Field((type) => ID)
  id: number;

  @Field()
  name: string;
}
```

我们的解析器有一个额外的方法：`resolveReference()`。每当相关资源需要 User 实例时，它就会被 Apollo 网关调用。我们在后面的 Posts 服务中也会看到这个例子。请注意 `@ResolveReference()` 这个装饰器。

```typescript
import { Args, Query, Resolver, ResolveReference } from '@nestjs/graphql';
import { User } from './user.entity';
import { UsersService } from './users.service';

@Resolver((of) => User)
export class UsersResolvers {
  constructor(private usersService: UsersService) {}

  @Query((returns) => User)
  getUser(@Args('id') id: number): User {
    return this.usersService.findById(id);
  }

  @ResolveReference()
  resolveReference(reference: { __typename: string; id: number }): User {
    return this.usersService.findById(reference.id);
  }
}
```

最后，我们在模块中使用 `GraphQLFederationModule` 将所有东西连接起来。此模块接收与常规的 `GraphQLModule` 相同的配置。

```typescript
import { Module } from '@nestjs/common';
import { GraphQLFederationModule } from '@nestjs/graphql';
import { UsersResolvers } from './users.resolvers';
import { UsersService } from './users.service'; // Not included in this example

@Module({
  imports: [
    GraphQLFederationModule.forRoot({
      autoSchemaFile: true,
    }),
  ],
  providers: [UsersResolvers, UsersService],
})
export class AppModule {}
```

### 联合示例：Posts

我们的 Post 服务通过 `getPosts` 查询提供文章聚合，同时也使用 `user.posts` 来扩展我们的 `User` 类型。

### 模式优先

Posts 服务在它的 schema 中通过用 `extend` 关键字标记来引用 User 类型。它还向 User 类型添加了一个属性。请注意用于匹配 User 实例的 `@key` 指令，以及指示 `id` 字段在别处管理的 `@external` 指令。

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

在我们的解析器这里有一个有趣的方法：`getUser()`。它返回一个引用，其中包含 `__typename` 和应用程序解析引用所需的任何其他属性，在这个例子中仅是一个属性 `id`。`__typename`被 GraphQL 网关用来精确定位负责 User 类型和请求实例的微服务。上面讨论的 Users 服务将在 `resolveReference()` 方法上被调用。

```typescript
import { Query, Resolver, Parent, ResolveField } from '@nestjs/graphql';
import { PostsService } from './posts.service';
import { Post } from './posts.interfaces';

@Resolver('Post')
export class PostsResolvers {
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

Posts 服务几乎具有和 Users 相同的模块，但为了完整起见，我们在下面将它包含进来：

```typescript
import { Module } from '@nestjs/common';
import { GraphQLFederationModule } from '@nestjs/graphql';
import { PostsResolvers } from './posts.resolvers';

@Module({
  imports: [
    GraphQLFederationModule.forRoot({
      typePaths: ['**/*.graphql'],
    }),
  ],
  providers: [PostsResolvers],
})
export class AppModule {}
```

### 代码优先

我们需要创建一个代表我们的 User 实体的类。即使它存在于其他服务中，我们也将使用和继承它。注意 `@extends` 和 `@external` 指令。

```typescript
import { Directive, ObjectType, Field, ID } from '@nestjs/graphql';
import { Post } from './post.entity';

@ObjectType()
@Directive('@extends')
@Directive('@key(fields: "id")')
export class User {
  @Field((type) => ID)
  @Directive('@external')
  id: number;

  @Field((type) => [Post])
  posts?: Post[];
}
```

我们在 `User` 实体上为我们的扩展创建解析器，如下所示：

```typescript
import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { PostsService } from './posts.service';
import { Post } from './post.entity';
import { User } from './user.entity';

@Resolver((of) => User)
export class UsersResolvers {
  constructor(private readonly postsService: PostsService) {}

  @ResolveField((of) => [Post])
  public posts(@Parent() user: User): Post[] {
    return this.postsService.forAuthor(user.id);
  }
}
```

我们还需要创建我们的 `Post` 实体：

```typescript
import { Directive, Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { User } from './user.entity';

@ObjectType()
@Directive('@key(fields: "id")')
export class Post {
  @Field((type) => ID)
  id: number;

  @Field()
  title: string;

  @Field((type) => Int)
  authorId: number;

  @Field((type) => User)
  user?: User;
}
```

还有它的解析器：

```typescript
import { Query, Args, ResolveField, Resolver, Parent } from '@nestjs/graphql';
import { PostsService } from './posts.service';
import { Post } from './post.entity';
import { User } from './user.entity';

@Resolver((of) => Post)
export class PostsResolvers {
  constructor(private readonly postsService: PostsService) {}

  @Query((returns) => Post)
  findPost(@Args('id') id: number): Post {
    return this.postsService.findOne(id);
  }

  @Query((returns) => [Post])
  getPosts(): Post[] {
    return this.postsService.all();
  }

  @ResolveField((of) => User)
  user(@Parent() post: Post): any {
    return { __typename: 'User', id: post.authorId };
  }
}
```

最后，在模块中把它们串联起来。注意 schema 构建配置，在这里我们指定 `User` 为外部类型。

```typescript
import { Module } from '@nestjs/common';
import { GraphQLFederationModule } from '@nestjs/graphql';
import { User } from './user.entity';
import { PostsResolvers } from './posts.resolvers';
import { UsersResolvers } from './users.resolvers';
import { PostsService } from './posts.service'; // Not included in example

@Module({
  imports: [
    GraphQLFederationModule.forRoot({
      autoSchemaFile: true,
      buildSchemaOptions: {
        orphanedTypes: [User],
      },
    }),
  ],
  providers: [PostsResolvers, UsersResolvers, PostsService],
})
export class AppModule {}
```

### 联合示例：网关

首先，安装网关的依赖包：

```bash
$ npm install --save @apollo/gateway
```

我们的网关只需要一个端点列表，它会从那里自动发现所有的 schemas。因为代码和模式优先是一样的，所以网关的代码很短：

```typescript
import { Module } from '@nestjs/common';
import { GraphQLGatewayModule } from '@nestjs/graphql';

@Module({
  imports: [
    GraphQLGatewayModule.forRoot({
      server: {
        // ... Apollo server options
        cors: true,
      },
      gateway: {
        serviceList: [
          { name: 'users', url: 'http://user-service/graphql' },
          { name: 'posts', url: 'http://post-service/graphql' },
        ],
      },
    }),
  ],
})
export class AppModule {}
```

?> Apollo 建议你不要依赖生产环境中的服务发现，而是使用它们的[图表管理器](https://www.apollographql.com/docs/federation/managed-federation/overview/)

### 共享上下文

你可以通过一个构建服务来自定义网关和联合服务之间的请求。这让你能够共享有关请求的上下文。你能轻松继承默认的 `RemoteGraphQLDataSource` 并实现其中一个钩子。有关可能性的更多信息，请参阅 [Apollo 文档](https://www.apollographql.com/docs/federation/api/apollo-gateway/#class-remotegraphqldatasource)中的 `RemoteGraphQLDataSource` 章节.

```typescript
import { Module } from '@nestjs/common';
import { GATEWAY_BUILD_SERVICE, GraphQLGatewayModule } from '@nestjs/graphql';
import { RemoteGraphQLDataSource } from '@apollo/gateway';
import { decode } from 'jsonwebtoken';

class AuthenticatedDataSource extends RemoteGraphQLDataSource {
  async willSendRequest({ request, context }) {
    const { userId } = await decode(context.jwt);
    request.http.headers.set('x-user-id', userId);
  }
}

@Module({
  providers: [
    {
      provide: AuthenticatedDataSource,
      useValue: AuthenticatedDataSource,
    },
    {
      provide: GATEWAY_BUILD_SERVICE,
      useFactory: (AuthenticatedDataSource) => {
        return ({ name, url }) => new AuthenticatedDataSource({ url });
      },
      inject: [AuthenticatedDataSource],
    },
  ],
  exports: [GATEWAY_BUILD_SERVICE],
})
class BuildServiceModule {}

@Module({
  imports: [
    GraphQLGatewayModule.forRootAsync({
      useFactory: async () => ({
        gateway: {
          serviceList: [
            /* services */
          ],
        },
        server: {
          context: ({ req }) => ({
            jwt: req.headers.authorization,
          }),
        },
      }),
      imports: [BuildServiceModule],
      inject: [GATEWAY_BUILD_SERVICE],
    }),
  ],
})
export class AppModule {}
```

### 异步配置

联合服务和网关模块都支持使用同样的 `forRootAsync` 异步初始化，相关文档详见[快速开始](/8/graphql?id=async-配置)。

 ### 译者署名
 
| 用户名 | 头像 | 职能 | 签名 |
|---------|--------------|-------------|---------------|
| [@飞柳](https://www.zhihu.com/people/elonglau) | <img class="avatar-66 rm-style" width='100' src="https://pic3.zhimg.com/8fe4a63dfe641f5fec1cff5d75737281_xl.jpg">                  | 翻译、校正 | 全栈开发工程师，专注 DesignOps、Nest、GraphQL 等领域[@飞柳](https://github.com/elonglau) at Github |
