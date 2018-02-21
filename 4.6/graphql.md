# GraphQL

## 快速开始

GraphQL 是一种 api 新思想的方法。这是 GraphQL 和 REST 之间一个很好的[比较](https://dev-blog.apollodata.com/graphql-vs-rest-5d425123e34b) (译者注： GraphQL 替代 REST 是必然趋势)。在这组文章中, 我不打算解释 GraphQL 是什么, 而是演示如何使用专用的 @nestjs/GraphQL 模块。

GraphQLModule 只不过是 [Apollo](https://www.apollographql.com) 服务器周围的一个包装。我们不重新发明车轮, 但提供一个准备模块代替, 这带来了一个干净的方式让与 GraphQL 和 Nest 在一起。


### 安装

首先，我们需要安装所需的软件包：

```bash
$ npm i --save @nestjs/graphql apollo-server-express graphql-tools graphql
```

### Apollo 中间件

安装软件包后，我们可以应用 apollo-server-express 软件包提供的 GraphQL 中间件 ：

> app.module.ts

```typescript
import {
  Module,
  MiddlewaresConsumer,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { graphqlExpress } from 'apollo-server-express';
import { GraphQLModule } from '@nestjs/graphql';

@Module({
  imports: [GraphQLModule],
})
export class ApplicationModule implements NestModule {
  configure(consumer: MiddlewaresConsumer) {
    consumer
      .apply(graphqlExpress(req => ({ schema: {}, rootValue: req })))
      .forRoutes({ path: '/graphql', method: RequestMethod.ALL });
  }
}
```

就这样。我们传递一个空对象作为 GraphQL schema 和 req（请求对象）rootValue。此外，还有其他一些可用的graphqlExpress 选项，你可以在[这里](https://www.apollographql.com/docs/apollo-server/setup.html#graphqlOptions)阅读它们。


### Schema

要创建 schema, 我们使用的是 @nestjs/graphql 包的一部分的 GraphQLFactory。这个组件提供了一个 createSchema() 接受同一个对象作为一个 makeExecutableSchema() 函数的方法，这里详细描述。

schema 选项对象至少需要resolvers和typeDefs属性。您可以手动传递类型定义, 或者使用 GraphQLFactory 的实用程序 mergeTypesByPaths() 方法。让我们看一下下面的示例:

> app.module.ts

```typescript
import {
  Module,
  MiddlewaresConsumer,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { graphqlExpress } from 'apollo-server-express';
import { GraphQLModule, GraphQLFactory } from '@nestjs/graphql';

@Module({
  imports: [GraphQLModule],
})
export class ApplicationModule implements NestModule {
  constructor(private readonly graphQLFactory: GraphQLFactory) {}

  configure(consumer: MiddlewaresConsumer) {
    const typeDefs = this.graphQLFactory.mergeTypesByPaths('./**/*.graphql');
    const schema = this.graphQLFactory.createSchema({ typeDefs });

    consumer
      .apply(graphqlExpress(req => ({ schema, rootValue: req })))
      .forRoutes({ path: '/graphql', method: RequestMethod.ALL });
  }
}
```

?> 在[此处](http://graphql.cn/learn/schema/)了解关于GraphQL Schema 的更多信息。


在这种情况下，GraphQLFactory 将遍历每个目录，并合并具有 .graphql 扩展名的文件。之后，我们可以使用这些特定的类型定义来创建一个 schema 。resolvers 将自动反映出来。


在[这里](https://www.apollographql.com/docs/graphql-tools/resolvers.html), 您可以更多地了解解析程序映射的实际内容。

## 解析器映射

使用时 graphql-tools，您必须手动创建解析器映射。以下示例是从 Apollo 文档复制并粘贴的，您可以在其中阅读更多内容：

```typescript
import { find, filter } from 'lodash';

// example data
const authors = [
  { id: 1, firstName: 'Tom', lastName: 'Coleman' },
  { id: 2, firstName: 'Sashko', lastName: 'Stubailo' },
  { id: 3, firstName: 'Mikhail', lastName: 'Novikov' },
];
const posts = [
  { id: 1, authorId: 1, title: 'Introduction to GraphQL', votes: 2 },
  { id: 2, authorId: 2, title: 'Welcome to Meteor', votes: 3 },
  { id: 3, authorId: 2, title: 'Advanced GraphQL', votes: 1 },
  { id: 4, authorId: 3, title: 'Launchpad is Cool', votes: 7 },
];

const resolverMap = {
  Query: {
    author(obj, args, context, info) {
      return find(authors, { id: args.id });
    },
  },
  Author: {
    posts(author) {
      return filter(posts, { authorId: author.id });
    },
  },
};
```

使用该@nestjs/graphql包，解析器映射是使用元数据自动生成的。我们用等效的 Nest-Way 代码重写上面的例子。

```typescript
import { Query, Resolver, ResolveProperty } from '@nestjs/graphql';
import { find, filter } from 'lodash';

// example data
const authors = [
  { id: 1, firstName: 'Tom', lastName: 'Coleman' },
  { id: 2, firstName: 'Sashko', lastName: 'Stubailo' },
  { id: 3, firstName: 'Mikhail', lastName: 'Novikov' },
];
const posts = [
  { id: 1, authorId: 1, title: 'Introduction to GraphQL', votes: 2 },
  { id: 2, authorId: 2, title: 'Welcome to Meteor', votes: 3 },
  { id: 3, authorId: 2, title: 'Advanced GraphQL', votes: 1 },
  { id: 4, authorId: 3, title: 'Launchpad is Cool', votes: 7 },
];

@Resolver('Author')
export class AuthorResolver {
  @Query()
  author(obj, args, context, info) {
    return find(authors, { id: args.id });
  }

  @ResolveProperty()
  posts(author) {
    return filter(posts, { authorId: author.id });
  }
}
```

该 @Resolver() 装饰并不影响查询和变更。它只告诉 Nest 每个 @ResolveProperty() 都有一个父 Author。

?> 如果我们使用的是 @Resolver() 修饰器, 我们不必将类标记为 @Component(), 否则, 它将是必需的。


通常, 我们会使用类似 getAuthor() 或 getPosts() 作为方法名。我们也可以轻松地做到这一点:

```typescript
import { Query, Resolver, ResolveProperty } from '@nestjs/graphql';
import { find, filter } from 'lodash';

// example data
const authors = [
  { id: 1, firstName: 'Tom', lastName: 'Coleman' },
  { id: 2, firstName: 'Sashko', lastName: 'Stubailo' },
  { id: 3, firstName: 'Mikhail', lastName: 'Novikov' },
];
const posts = [
  { id: 1, authorId: 1, title: 'Introduction to GraphQL', votes: 2 },
  { id: 2, authorId: 2, title: 'Welcome to Meteor', votes: 3 },
  { id: 3, authorId: 2, title: 'Advanced GraphQL', votes: 1 },
  { id: 4, authorId: 3, title: 'Launchpad is Cool', votes: 7 },
];

@Resolver('Author')
export class AuthorResolver {
  @Query('author')
  getAuthor(obj, args, context, info) {
    return find(authors, { id: args.id });
  }

  @ResolveProperty('posts')
  getPosts(author) {
    return filter(posts, { authorId: author.id });
  }
}
```

?> @Resolver() 装饰可以在方法级别被使用。

### 重构

上述代码背后的想法是为了展示 Apollo和 Nest-way 之间的区别，以便简单地转换代码。现在，我们要做一个小的重构来利用 Nest 架构的优势，使其成为一个真实的例子。

```typescript
@Resolver('Author')
export class AuthorResolver {
  constructor(
    private readonly authorsService: AuthorsService,
    private readonly postsService: PostsService,
  ) {}

  @Query('author')
  async getAuthor(obj, args, context, info) {
    const { id } = args;
    return await this.authorsService.findOneById(id);
  }

  @ResolveProperty('posts')
  async getPosts(author) {
    const { id } = author;
    return await this.postsService.findAll({ authorId: id });
  }
}
```

现在我们必须在某个地方注册 AuthorResolver, 例如在新创建的 AuthorsModule 中。

```typescript
@Module({
  imports: [PostsModule],
  components: [AuthorsService, AuthorResolver],
})
export class AuthorsModule {}
```

GraphQLModule 将负责反映「元数据」, 并自动将类转换为正确的解析程序映射。您必须做的唯一一件事是导入这个模块在某个地方, 因此 Nest 将知道 AuthorsModule 存在。

### 类型定义

最后一个缺失的部分是类型定义（[阅读更多](http://graphql.cn/learn/schema/#type-language)）文件。让我们在解析器类附近创建它。

> author-types.graphql

```javascript
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
```

就这样。我们创建了一个 author(id: Int!) 查询。

?> [此处](http://graphql.cn/learn/queries/)了解有关 GraphQL 查询的更多信息。

##  变更（Mutations）

在 GraphQL 中，为了修改服务器端数据，我们使用了变更（Mutations）。[了解更多](http://graphql.cn/learn/queries/#mutations)


[Apollo](https://www.apollographql.com/docs/graphql-tools/generate-schema.html) 官方文献中有一个 upvotePost () 变更的例子。这种变更允许增加后 votes 属性值。

```typescript
Mutation: {
  upvotePost: (_, { postId }) => {
    const post = find(posts, { id: postId });
    if (!post) {
      throw new Error(`Couldn't find post with id ${postId}`);
    }
    post.votes += 1;
    return post;
  },
}
```

为了在 Nest-way 中创建等价的变更，我们将使用  @Mutation() 装饰器。让我们扩展在上一节 (解析器映射) 中使用的 AuthorResolver。

```typescript
import { Query, Mutation, Resolver, ResolveProperty } from '@nestjs/graphql';
import { find, filter } from 'lodash';

// example data
const authors = [
  { id: 1, firstName: 'Tom', lastName: 'Coleman' },
  { id: 2, firstName: 'Sashko', lastName: 'Stubailo' },
  { id: 3, firstName: 'Mikhail', lastName: 'Novikov' },
];
const posts = [
  { id: 1, authorId: 1, title: 'Introduction to GraphQL', votes: 2 },
  { id: 2, authorId: 2, title: 'Welcome to Meteor', votes: 3 },
  { id: 3, authorId: 2, title: 'Advanced GraphQL', votes: 1 },
  { id: 4, authorId: 3, title: 'Launchpad is Cool', votes: 7 },
];

@Resolver('Author')
export class AuthorResolver {
  @Query('author')
  getAuthor(obj, args, context, info) {
    return find(authors, { id: args.id });
  }

  @Mutation()
  upvotePost(_, { postId }) {
    const post = find(posts, { id: postId });
    if (!post) {
      throw new Error(`Couldn't find post with id ${postId}`);
    }
    post.votes += 1;
    return post;
  }

  @ResolveProperty('posts')
  getPosts(author) {
    return filter(posts, { authorId: author.id });
  }
}
```

### 重构

我们要做一个小的重构来利用Nest架构的优势，将其变为一个 真实的例子.

```typescript
@Resolver('Author')
export class AuthorResolver {
  constructor(
    private readonly authorsService: AuthorsService,
    private readonly postsService: PostsService,
  ) {}

  @Query('author')
  async getAuthor(obj, args, context, info) {
    const { id } = args;
    return await this.authorsService.findOneById(id);
  }

  @Mutation()
  async upvotePost(_, { postId }) {
    return await this.postsService.upvoteById({ id: postId });
  }

  @ResolveProperty('posts')
  async getPosts(author) {
    const { id } = author;
    return await this.postsService.findAll({ authorId: id });
  }
}
```

就这样。业务逻辑被转移到了 PostsService 。

### 类型定义

最后一步是将我们的变更添加到现有的类型定义中。


> author-types.graphql

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

该 upvotePost(postId: Int!): Post 变更是在这里吧！


## 订阅（Subscriptions）

订阅只是查询和变更等另一种 GraphQL 操作类型。它允许通过双向传输层创建实时订阅，主要通过 websockets 实现。[阅读更多](https://www.apollographql.com/docs/graphql-subscriptions/)的订阅。

以下是 commentAdded 订阅示例，可直接从官方 Apollo 文档复制和粘贴：

```typescript
Subscription: {
  commentAdded: {
    subscribe: () => pubsub.asyncIterator('commentAdded')
  }
}
```

?> pubsub 是一个 PubSub 类的实例。在[这里](https://www.apollographql.com/docs/graphql-subscriptions/setup.html)阅读更多

为了以Nest方式创建等效订阅，我们将使用  @Subscription() 装饰器。让我们扩展 AuthorResolver 在解析器映射部分中的使用。

```typescript
import { Query, Resolver, Subscription, ResolveProperty } from '@nestjs/graphql';
import { find, filter } from 'lodash';
import { PubSub } from 'graphql-subscriptions';

// example data
const authors = [
  { id: 1, firstName: 'Tom', lastName: 'Coleman' },
  { id: 2, firstName: 'Sashko', lastName: 'Stubailo' },
  { id: 3, firstName: 'Mikhail', lastName: 'Novikov' },
];
const posts = [
  { id: 1, authorId: 1, title: 'Introduction to GraphQL', votes: 2 },
  { id: 2, authorId: 2, title: 'Welcome to Meteor', votes: 3 },
  { id: 3, authorId: 2, title: 'Advanced GraphQL', votes: 1 },
  { id: 4, authorId: 3, title: 'Launchpad is Cool', votes: 7 },
];

// example pubsub
const pubsub = new PubSub();

@Resolver('Author')
export class AuthorResolver {
  @Query('author')
  getAuthor(obj, args, context, info) {
    return find(authors, { id: args.id });
  }

  @Subscription()
  commentAdded() {
    return {
      subscribe: () => pubsub.asyncIterator('commentAdded'),
    };
  }

  @ResolveProperty('posts')
  getPosts(author) {
    return filter(posts, { authorId: author.id });
  }
}
```

### 重构

我们在这里使用了一个本地 PubSub 实例。相反, 我们应该将 PubSub 定义为一个组件, 通过构造函数 (使用 @Inject () 装饰器) 注入它, 并在整个应用程序中重用它。[您可以在此了解有关嵌套自定义组件的更多信息](4.6/dependencyinjection)。

### 类型定义

最后一步是更新类型定义（[阅读更多](http://graphql.cn/learn/schema/#type-language)）文件。

> author-types.graphql

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

就这样。我们创建了一个 commentAdded(repoFullName: String!): Comment 订阅。

## 看守器和拦截器

在 GraphQL 中, 许多文章抱怨如何处理诸如身份验证或操作的副作用之类的问题。我们应该把它放在业务逻辑里面吗？我们是否应该使用高阶函数来增强查询和变更, 例如使用授权逻辑？没有单一的答案。

Nest 生态系统正试图利用现有的功能, 如看守器和拦截器来帮助解决这个问题。其背后的想法是减少冗余, 并且创建一个结构良好的应用程序。

### 使用

您可以像在简单的 REST 应用程序中一样使用看守器和拦截器。它们的行为等同于在 graphqlExpress 中间件中作为 rootValue 传递请求。让我们看一下下面的代码:

```typescript
@Query('author')
@UseGuards(AuthGuard)
async getAuthor(obj, args, context, info) {
  const { id } = args;
  return await this.authorsService.findOneById(id);
}
```

由于这一点，您可以将您的身份验证逻辑移至看守器，甚至可以复用与 REST 应用程序中相同的防护类。拦截器的工作方式完全相同：

```typescript
@Mutation()
@UseInterceptors(EventsInterceptor)
async upvotePost(_, { postId }) {
  return await this.postsService.upvoteById({ id: postId });
}
```

写一次，随处使用:)

## Schema 拼接

Schema 拼接功能允许从多个底层GraphQL API创建单个GraphQL模式。你可以在[这里](https://www.apollographql.com/docs/graphql-tools/schema-stitching.html)阅读更多。

### 代理（Proxying）

要在模式之间添加代理字段的功能，您需要在它们之间创建额外的解析器。我们来看看 [Apollo](https://www.apollographql.com/docs/graphql-tools/schema-stitching.html#adding-resolvers) 文档中的例子：

```typescript
mergeInfo => ({
  User: {
    chirps: {
      fragment: `fragment UserFragment on User { id }`,
      resolve(parent, args, context, info) {
        const authorId = parent.id;
        return mergeInfo.delegate(
          'query',
          'chirpsByAuthorId',
          {
            authorId,
          },
          context,
          info,
        );
      },
    },
  }
})
```

在这里，我们将 chirps 属性委托 User 给另一个 GraphQL API。为了在 Nest-way 中实现相同的结果，我们使用 @DelegateProperty() 装饰器。

```typescript

@Resolver('User')
@DelegateProperty('chirps')
findChirpsByUserId() {
  return (mergeInfo: MergeInfo) => ({
    fragment: `fragment UserFragment on User { id }`,
    resolve(parent, args, context, info) {
      const authorId = parent.id;
      return mergeInfo.delegate(
        'query',
        'chirpsByAuthorId',
        {
          authorId,
        },
        context,
        info,
      );
    },
  });
}
```

?> @Resolver() 装饰器在这里用于方法级, 但也可以在顶级 (类) 级别使用它。

现在让我们回到 graphqlExpress 中间件。我们需要合并我们的 Schema 并在它们之间添加代表。为了创建委托，我们使用类的 createDelegates() 方法GraphQLFactory。

> app.module.ts

```typescript
configure(consumer) {
  const typeDefs = this.graphQLFactory.mergeTypesByPaths('./**/*.graphql');
  const localSchema = this.graphQLFactory.createSchema({ typeDefs });
  const delegates = this.graphQLFactory.createDelegates();
  const schema = mergeSchemas({
    schemas: [localSchema, chirpSchema, linkTypeDefs],
    resolvers: delegates,
  });

  consumer
    .apply(graphqlExpress(req => ({ schema, rootValue: req })))
    .forRoutes({ path: '/graphql', method: RequestMethod.ALL });
}
```

为了合并 schema ，我们使用了 mergeSchemas() 函数（[阅读更多](https://www.apollographql.com/docs/graphql-tools/schema-stitching.html#mergeSchemas)）。此外，还有就是 chirpsSchema 和 linkTypeDefs 变量。他们是直接从 Apollo 文档复制和粘贴的。

```typescript
import { makeExecutableSchema } from 'graphql-tools';
    
const chirpSchema = makeExecutableSchema({
  typeDefs: `
    type Chirp {
      id: ID!
      text: String
      authorId: ID!
    }

    type Query {
      chirpById(id: ID!): Chirp
      chirpsByAuthorId(authorId: ID!): [Chirp]
    }
  `
});
const linkTypeDefs = `
  extend type User {
    chirps: [Chirp]
  }

  extend type Chirp {
    author: User
  }
`;
```

## IDE 

最受欢迎的 GraphQL 浏览器 IDE 称为 GraphiQL。要在您的应用程序中使用 GraphiQL，您需要设置一个中间件。这个特殊的中间件附带了apollo-server-express ，我们必须安装。它的名字是 graphiqlExpress()。

为了建立一个中间件，我们需要 app.module.ts 再次打开一个文件：

> app.module.ts

```typescript
import {
  Module,
  MiddlewaresConsumer,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import { GraphQLModule, GraphQLFactory } from '@nestjs/graphql';

@Module({
  imports: [GraphQLModule],
})
export class ApplicationModule implements NestModule {
  constructor(private readonly graphQLFactory: GraphQLFactory) {}

  configure(consumer: MiddlewaresConsumer) {
    const typeDefs = this.graphQLFactory.mergeTypesByPaths('./**/*.graphql');
    const schema = this.graphQLFactory.createSchema({ typeDefs });

    consumer
      .apply(graphiqlExpress({ endpointURL: '/graphql' }))
      .forRoutes({ path: '/graphiql', method: RequestMethod.GET })
      .apply(graphqlExpress(req => ({ schema, rootValue: req })))
      .forRoutes({ path: '/graphql', method: RequestMethod.ALL });
  }
}
```

?> graphiqlExpress() 提供了一些其他选项, 请在[此处](https://www.apollographql.com/docs/apollo-server/graphiql.html)阅读更多信息。


现在，当你打开 http://localhost:PORT/graphiql 你应该看到一个图形交互式 GraphiQL IDE。

