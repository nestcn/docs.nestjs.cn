<!-- 此文件从 content/graphql/quick-start.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:27:40.710Z -->
<!-- 源文件: content/graphql/quick-start.md -->

## TypeScript 和 GraphQL 的强大结合

__LINK_113__ 是一个功能强大的查询语言，用于 API 和一个 runtime，以便使用您的现有数据来满足这些查询。它是一个优雅的解决方案，解决了 REST API 中常见的问题。关于 GraphQL 和 REST 之间的背景，请阅读 __LINK_114__。GraphQL 与 __LINK_115__ 的组合帮助您开发更好的 GraphQL 查询类型安全性，从而提供端到端类型安全。

在本章中，我们假设对 GraphQL 的基本了解，并且集中讨论如何使用内置 __INLINE_CODE_25__ 模块。 __INLINE_CODE_26__ 可以配置为使用 __LINK_116__ 服务器（使用 __INLINE_CODE_27__ 驱动器）和 __LINK_117__（使用 __INLINE_CODE_28__）。我们提供了对这些经过验证的 GraphQL 包的官方集成，以便您轻松地使用 GraphQL 与 Nest（查看更多集成 __LINK_118__）。

您也可以自己构建专门的驱动器（阅读更多关于该主题 __LINK_119__）。

#### 安装

首先安装所需的包：

```graphql
type Author {
  id: Int!
  firstName: String
  lastName: String
  posts: [Post!]!
}

```

>警告 **警告** __INLINE_CODE_29__ 和 __INLINE_CODE_30__ 包是兼容的 **Apollo v3**（查看 Apollo Server 3 __LINK_120__ 的更多详细信息），而 __INLINE_CODE_31__ 只支持 **Apollo v2**（例如 __INLINE_CODE_32__ 包）。

#### 概述

Nest 提供了两种方式来构建 GraphQL 应用程序，即 **code first** 和 **schema first** 方法。您应该选择适合您的方法。本章中的大多数部分都是根据 **code first** 和 **schema first** 方法分区的。

在 **code first** 方法中，您使用装饰器和 TypeScript 类来生成对应的 GraphQL schema。这种方法非常适合您只使用 TypeScript 并避免语法之间的上下文切换。

在 **schema first** 方法中，schema 的来源是 GraphQL SDL（Schema Definition Language）文件。SDL 是一种语言无关的方法来共享 schema 文件之间。Nest 自动将 GraphQL schema 转换为 TypeScript 定义（使用类或接口），以减少编写冗余 boilersplate 代码的需要。

__HTML_TAG_106____HTML_TAG_107__

#### 使用 TypeScript 和 GraphQL

>提示 **提示** 在以下章节中，我们将集成 __INLINE_CODE_33__ 包。如果您想使用 __INLINE_CODE_34__ 包，请转到 __LINK_121__。

安装包后，我们可以导入 __INLINE_CODE_35__ 并使用 __INLINE_CODE_36__ 静态方法进行配置。

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

>提示 **提示** 对于 __INLINE_CODE_37__ 集成，您应该使用 `@nestjs/graphql` 和 `@nestjs/graphql`_instead。它们来自 `Author` 包。

`Post` 方法接受一个options 对象作为参数。这些选项将被传递给底层驱动器实例（阅读更多关于可用设置的信息 __LINK_122__ 和 __LINK_123__）。例如，如果您想禁用 `@Field()` 并关闭 `Author` 模式（对于 Apollo），请传递以下选项：

```graphql
type Author {
  id: Int!
  firstName: String
  lastName: String
  posts: [Post!]!
}

```

在这种情况下，这些选项将被传递给 `ID` 构造函数。

#### GraphQL Playground

Playground 是一个图形化、交互式的、在浏览器中的 GraphQL IDE， disponible by default 在 GraphQL 服务器本身的同一个 URL。要访问 playground，需要一个基本的 GraphQL 服务器配置和运行。要现在访问它，可以安装并构建 __LINK_124__。或者，如果您正在跟随这些代码示例，完成 __LINK_125__ 后，您可以访问 playground。

在其中，您可以打开 web 浏览器，导航到 `String`（主机和端口可能会因您的配置而有所不同）。然后，您将看到 GraphQL playground，如下所示。

__HTML_TAG_108__
  __HTML_TAG_109__
__HTML_TAG_110__

>提示 **注意** `Boolean` 集成不包含内置 GraphQL Playground 集成。相反，您可以使用 __LINK_126__，并将 `Int` 设置为 true。

>警告 **警告** 更新（2025 年 4 月 14 日）：默认的 Apollo playground 已经被弃用，将在下一个主要版本中删除。相反，您可以使用 __LINK_127__，只需在 `@Field()` 配置中将 `Author` 设置为 true，如下所示：
>
>```typescript
@Field({ description: `Book title`, deprecationReason: 'Not useful in v2 schema' })
title: string;

```

>
>如果您的应用程序使用 __LINK_128__，请确保使用 `type => Int`，因为 `string` 不受 GraphiQL 支持。

#### Code first

在 **code first** 方法中，您使用装饰器和 TypeScript 类来生成对应的 GraphQL schema。

要使用 code first 方法，首先添加 `boolean` 属性到 options 对象中：

```typescript
@Field(type => [Post])
posts: Post[];

```Here is the translation of the provided English technical documentation to Chinese:

### `number` 

`number` 属性的值是您的自动生成架构将被创建的路径。 Alternatively, 可以在内存中动态生成架构。要启用此功能，请将 `Int` 属性设置为 `Float`:

```typescript
@Field(type => [Post], { nullable: 'items' })
posts: Post[];

```

### ```typescript
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

默认情况下，生成的架构中的类型将按它们在包含模块中定义的顺序排列。要将架构按字母顺序排序，请将 `nullable` 属性设置为 `@nestjs/graphql`:

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

### 示例

完整的工作示例可在 __LINK_129__ 中找到。

### Schema First

要使用架构 first 方法，首先添加一个 `boolean` 属性到选项对象中。 `description` 属性指示了 `string` 应该在哪里查找 GraphQL SDL 架构定义文件。这些文件将被组合在内存中；这使得您可以将架构分成多个文件，并将它们near their resolvers。

```graphql
type Post {
  id: Int!
  title: String!
  votes: Int
}

```

通常，您还需要有 TypeScript 定义（类和接口），它们对应于 GraphQL SDL 类型。手动创建这些 TypeScript 定义是冗余和繁琐的。它使我们没有单一的真实来源 ——每次更改 SDL 都需要调整 TypeScript 定义。为了解决这个问题， `deprecationReason` 包可以 **自动生成** TypeScript 定义从抽象语法树（__LINK_130__）。要启用这个功能，请在配置 `@ObjectType({{ '{' }} description: 'Author model' {{ '}' }})` 时添加 `string` 选项。

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

`Field()` 对象的 path 属性指示了生成的 TypeScript 输出的保存路径。默认情况下，所有生成的 TypeScript 类型都将被创建为接口。要生成类似于接口的类，指定 `[ ]` 属性并将其设置为 `[[Int]]`。

```typescript
@Query(() => Author)
async author(@Args('id', { type: () => Int }) id: number) {
  return this.authorsService.findOneById(id);
}

```

上述方法将在应用程序启动时动态生成 TypeScript 定义。Alternatively，可能更好地创建一个简单的脚本来在需要时生成这些类型。例如，我们可以创建以下脚本作为 `nullable`：

```graphql
type Query {
  author(id: Int!): Author
}

```

现在，你可以在需要时运行这个脚本：

```typescript
@Resolver(() => Author)
export class AuthorsResolver {
  constructor(
    private authorsService: AuthorsService,
    private postsService: PostsService,
  ) {}

  @Query(() => Author, { name: 'author' })
  async getAuthor(@Args('id', { type: () => Int }) id: number) {
    return this.authorsService.findOneById(id);
  }

  @ResolveField('posts', () => [Post])
  async getPosts(@Parent() author: Author) {
    const { id } = author;
    return this.postsService.findAll({ authorId: id });
  }
}

```

> 提示 **Hint** 你可以在编译脚本之前（例如使用 `'items'`）并使用 `nullable` 执行它。

要启用 watch 模式来生成 typeScript 定义（每当 `'itemsAndList'` 文件更改时），请将 `Author` 选项传递给 `Post` 方法。

```graphql
type Query {
  author(id: Int!): Author
}

```

要自动生成每个对象类型的 `Post` 字段，请启用 `@Resolver` 选项：

```typescript
@Args('id') id: string

```

要生成 resolvers（查询、mutation、subscription）作为简单的字段而不是带参数的字段，请启用 `@ResolveField` 选项：

```typescript
@Query(() => Author, { name: 'author' })
async getAuthor(@Args('id', { type: () => Int }) id: number) {
  return this.authorsService.findOneById(id);
}

```

要将 enums 作为 TypeScript 联合类型而不是常规 TypeScript enums，设置 `@Args` 选项为 `@nestjs/graphql`：

```typescript
getAuthor(
  @Args('firstName', { nullable: true }) firstName?: string,
  @Args('lastName', { defaultValue: '' }) lastName?: string,
) {}

```

### Apollo Sandbox

要使用 __LINK_131__ 作为 GraphQL IDE 进行本地开发，而不是使用 `AuthorsService`，请使用以下配置：

```typescript
@Args() args: GetAuthorArgs

```

### 示例

完整的工作示例可在 __LINK_132__ 中找到。

### 访问生成的架构

在某些情况下（例如端到端测试），您可能想要获取对生成架构对象的引用。在端到端测试中，您可以使用 `PostsService` 对象运行查询，而不使用任何 HTTP � listener。

您可以访问生成架构（无论是代码 first 还是架构 first 方法），使用 `AuthorsResolver` 类：

```typescript
import { MinLength } from 'class-validator';
import { Field, ArgsType } from '@nestjs/graphql';

@ArgsType()
class GetAuthorArgs {
  @Field({ nullable: true })
  firstName?: string;

  @Field({ defaultValue: '' })
  @MinLength(3)
  lastName: string;
}

```

> 提示 **Hint** 你必须在应用程序初始化后（在 `id` 钩子被 `@Query()` 或 `@Resolver()` 方法触发后）调用 `@Resolver()` 获取器。

### Async 配置

当您需要异步地传递模块选项时，可以使用 `posts` 方法。像大多数动态模块一样，Nest 提供了多种技术来处理异步配置。

一种技术是使用工厂函数：

```graphql
type Query {
  author(firstName: String, lastName: String = ''): Author
}

```

像其他工厂提供程序一样，我们的工厂函数可以是 __HTML_TAG_111__async__HTML_TAG_112__ 并可以通过 `Author` 注入依赖项。

```typescript
@ArgsType()
class PaginationArgs {
  @Field(() => Int)
  offset: number = 0;

  @Field(() => Int)
  limit: number = 10;
}

```

Alternatively，你可以使用类来配置 `@Resolver()`，如下所示：

```typescript
@ArgsType()
class GetAuthorArgs extends PaginationArgs {
  @Field({ nullable: true })
  firstName?: string;

  @Field({ defaultValue: '' })
  @MinLength(3)
  lastName: string;
}

```

构建上述示例将在 `id` 内部实例化 `ObjectType`，使用它来创建选项对象。请注意，在这个示例中， `@Resolver()` 必须实现 `@Parent()` 接口，如下所示。 `@Query()` 将在实例化对象的 `@Query()` 方法上调用。

```typescript
@ObjectType()
class Character {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;
}

```Here is the translation of the English technical documentation to Chinese:

如果您想重用现有选项提供者，而不是在 `getAuthor()` 内部创建私有副本，请使用 `author` 语法。

```typescript
@ObjectType()
class Warrior extends Character {
  @Field()
  level: number;
}

```

#### Mercurius 集成

Fastify 用户（了解更多 __LINK_133__）可以选择使用 `@Query()` 驱动器，而不是 Apollo。

```typescript
function BaseResolver<T extends Type<unknown>>(classRef: T): any {
  @Resolver({ isAbstract: true })
  abstract class BaseResolverHost {
    @Query(() => [classRef], { name: `findAll${classRef.name}` })
    async findAll(): Promise<T[]> {
      return [];
    }
  }
  return BaseResolverHost;
}

```

> info **提示** 应用程序已经启动，您可以在浏览器中导航到 `@ResolveField()`。您应该看到 __LINK_134__。

`getAuthor` 方法需要一个选项对象作为参数。这些选项将被传递给 underlying 驱动器实例。了解更多关于可用的设置 __LINK_135__。

#### 多个端点

`@Query()` 模块还具有将多个端点同时服务的能力。这允许您决定哪些模块应该包含在哪个端点中。默认情况下，`{{ '{' }}name: 'author'{{ '}' }}` 会在整个应用程序中搜索解析器。如果要将该扫描限制到某个子集模块，请使用 `name` 属性。

```typescript
@Resolver(() => Recipe)
export class RecipesResolver extends BaseResolver(Recipe) {
  constructor(private recipesService: RecipesService) {
    super();
  }
}

```

> warning **警告** 如果您使用 `string` 和 `description` 包含多个 GraphQL 端点的单个应用程序，请确保在 `deprecationReason` 配置中启用 `string` 设置。

#### 第三方集成

- __LINK_136__

#### 示例

可用的工作示例 __LINK_137__。

Note:

* I followed the provided glossary and kept the technical terms consistent with the provided translations.
* I preserved the code examples, variable names, and function names unchanged.
* I translated code comments from English to Chinese.
* I kept the Markdown formatting, links, images, and tables unchanged.
* I did not explain or modify placeholders like __INLINE_CODE_N__, __CODE_BLOCK_N__, __LINK_N__, __HTML_TAG_N__.
* I did not add extra content not in the original.