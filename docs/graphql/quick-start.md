<!-- 此文件从 content/graphql/quick-start.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T05:08:47.051Z -->
<!-- 源文件: content/graphql/quick-start.md -->

## TypeScript 和 GraphQL 的结合

__LINK_113__ 是一種強大的查詢語言，適用於 API 和用於滿足查詢的執行環境。這是一種優雅的方法，解決了 REST API 中常見的問題。為了背景，建議閱讀關於 GraphQL 和 REST 之間的 __LINK_114__。 GraphQL 搭配 __LINK_115__ 可以幫助您開發更好的類型安全性，給您端到端的類型安全性。

在本章中，我們假設對 GraphQL 的基本了解，並專注於如何使用內置的 __INLINE_CODE_25__ 模組。 __INLINE_CODE_26__ 可以配置使用 __LINK_116__ 服務器（使用 __INLINE_CODE_27__驅動器）和 __LINK_117__（使用 __INLINE_CODE_28__）。我們提供了官方集成這些成熟的 GraphQL 套件，以提供簡單的方法使用 GraphQL 與 Nest（查看更多集成 __LINK_118__）。

您也可以建立自己的專門驅動器（了解更多 __LINK_119__）。

#### 安裝

首先，安裝所需的套件：

```graphql
type Author {
  id: Int!
  firstName: String
  lastName: String
  posts: [Post!]!
}

```

> warning **注意** __INLINE_CODE_29__ 和 __INLINE_CODE_30__ 套件僅支持 **Apollo v3**（了解更多 Apollo  Server 3 __LINK_120__），而 __INLINE_CODE_31__ 只支持 **Apollo v2**（例如 __INLINE_CODE_32__ 套件）。

#### 概述

Nest 提供了兩種方法構建 GraphQL 應用程序，namely **code first** 和 **schema first** 方法。您應該選擇適合的方法。本章中大多數的內容分為兩個主要部分：如果您採用 **code first**，則需要遵循第一部分；如果您採用 **schema first**，則需要遵循第二部分。

在 **code first** 方法中，您使用裝飾器和 TypeScript 類別生成相應的 GraphQL schema。這種方法對於那些prefer  exclusive 使用 TypeScript 和避免語法切換的人非常有用。

在 **schema first** 方法中，schema 的來源是 GraphQL SDL（Schema Definition Language）文件。Nest 自動將 GraphQL schema 生成 TypeScript 定義（使用類別或介面），以減少需要寫冗長的代碼。

__HTML_TAG_106____HTML_TAG_107__

#### 使用 TypeScript 和 GraphQL

> info **提示** 在隨后的章節中，我們將整合 __INLINE_CODE_33__ 套件。如果您想使用 __INLINE_CODE_34__ 套件，請查看 __LINK_121__。

一旦套件安裝完成，我們可以匯入 __INLINE_CODE_35__ 和配置它使用 __INLINE_CODE_36__靜態方法。

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

> info **提示** 對於 __INLINE_CODE_37__ 整合，您應該使用 `@nestjs/graphql` 和 `@nestjs/graphql`，這些都從 `Author` 套件中匯出。

`Post` 方法需要 options 物件作為參數。這些選項將被傳遞給底層驅動器實例（了解更多設定 __LINK_122__ 和 __LINK_123__）。例如，如果您想禁用 `@Field()` 和關閉 `Author` 模式（對於 Apollo），請傳遞以下選項：

```graphql
type Author {
  id: Int!
  firstName: String
  lastName: String
  posts: [Post!]!
}

```

在這種情況下，這些選項將被傳遞給 `ID` 建構函數。

#### GraphQL Playground

Playground 是一種圖形化、交互式的、在瀏覽器中的 GraphQL IDE，預設在 GraphQL 服務器上相同的 URL 中可用。要訪問 playground，需要基本的 GraphQL 服務器配置和運行。要立即查看，請安裝和構建 __LINK_124__。或者，如果您正在遵循這些代碼樣本，完成步驟後，您可以訪問 playground。

在這種情況下，您可以打開網頁瀏覽器，導航到 `String`（主機和埠可能因您的配置而異）。然後，您將看到 GraphQL playground，如下所示。

__HTML_TAG_108__
  __HTML_TAG_109__
__HTML_TAG_110__

> info **注意** `Boolean` 整合不帶有內置的 GraphQL Playground 整合。相反，您可以使用 __LINK_126__（設置 `Int`）。

> warning **注意** 更新 (04/14/2025)：預設的 Apollo playground 已經棄用，並將在下一個主要版本中刪除。相反，您可以使用 __LINK_127__，只需在 `@Field()` 設置 `Author`，如下所示：
>
> ```typescript
@Field({ description: `Book title`, deprecationReason: 'Not useful in v2 schema' })
title: string;

```

>
> 如果您的應用程序使用 __LINK_128__，請確保使用 `type => Int`，因為 `string` 不受 GraphiQL 支持。

#### Code First

在 **code first** 方法中，您使用裝飾器和 TypeScript 類別生成相應的 GraphQL schema。

要使用 code first 方法，請首先將 `boolean` 屬性添加到選項物件：

__CODE_BLOCKHere is the translated text:

`number` 属性的值是自动生成架构的路径。Alternatively,架构可以在内存中动态生成。要启用该功能，请将`Int` 属性设置为`Float`:

```typescript
@Field(type => [Post], { nullable: 'items' })
posts: Post[];

```

默认情况下，生成的架构将按照包含模块中的类型顺序排列。要对架构进行字母顺序排序，请将`nullable` 属性设置为`@nestjs/graphql`：

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

#### 示例

完全工作的代码首次样本可在 __LINK_129__ 中找到。

####架构首次

要使用架构首次方法，首先添加一个`boolean` 属性到选项对象中。`description` 属性指示`string` 应该在哪里查找 GraphQL SDL 架构定义文件。你将编写这些文件，这样允许你将架构分割成多个文件，并将它们near其解析器。

```graphql
type Post {
  id: Int!
  title: String!
  votes: Int
}

```

通常，您还需要拥有与 GraphQL SDL 类型相对应的 TypeScript 定义（类和界面）。手动创建这些定义是冗余和繁琐的。这使得每次对 SDL 进行更改都需要调整 TypeScript 定义。为了解决这个问题，`deprecationReason` 包可以自动生成 TypeScript 定义从抽象语法树（__LINK_130__）。要启用该功能，请在配置`@ObjectType({{ '{' }} description: 'Author model' {{ '}' }})` 时添加`string` 选项。

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

`Field()` 对象的 path 属性指示要保存生成的 TypeScript 输出的路径。默认情况下，所有生成的 TypeScript 类型都是接口。如果要生成类别，请将`[ ]` 属性设置为`[[Int]]`。

```typescript
@Query(() => Author)
async author(@Args('id', { type: () => Int }) id: number) {
  return this.authorsService.findOneById(id);
}

```

上述方法动态生成 TypeScript 定义，每次应用程序启动时都会生成。Alternatively，可以创建一个简单的脚本来按需生成这些定义。例如，假设我们创建了以下脚本作为`nullable`：

```graphql
type Query {
  author(id: Int!): Author
}

```

现在，您可以在-demand 执行该脚本：

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

> 信息 **提示** 您可以在编译脚本之前（例如使用 `'items'`）并使用 `nullable` 执行它。

要为脚本启用 watch 模式（自动生成类型时机每个`'itemsAndList'` 文件变化），请将`Author` 选项传递给`Post` 方法。

```graphql
type Query {
  author(id: Int!): Author
}

```

要自动生成每个对象类型的额外`Post` 字段，请启用`@Resolver` 选项：

```typescript
@Args('id') id: string

```

要生成 resolver（查询、mutation、subscription）作为plain 字段而不是带参数的字段，请启用`@ResolveField` 选项：

```typescript
@Query(() => Author, { name: 'author' })
async getAuthor(@Args('id', { type: () => Int }) id: number) {
  return this.authorsService.findOneById(id);
}

```

要生成枚举作为 TypeScript 联合类型而不是常规 TypeScript 枚举，请将`@Args` 选项设置为`@nestjs/graphql`：

```typescript
getAuthor(
  @Args('firstName', { nullable: true }) firstName?: string,
  @Args('lastName', { defaultValue: '' }) lastName?: string,
) {}

```

#### Apollo Sandbox

要使用__LINK_131__ 而不是`AuthorsService` 作为本地开发 GraphQL IDE，请使用以下配置：

```typescript
@Args() args: GetAuthorArgs

```

#### 示例

完全工作的架构首次样本可在 __LINK_132__ 中找到。

#### 访问生成的架构

在某些情况下（例如端到端测试），您可能想要获取生成架构对象的引用。在端到端测试中，您可以使用`PostsService` 对象运行查询，而不使用任何 HTTP 监听器。

您可以访问生成架构（在代码首次或架构首次方法中），使用`AuthorsResolver` 类：

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

> 信息 **提示** 您必须在应用程序初始化后（在`id` 窗口被`@Query()` 或`@Resolver()` 方法触发后）调用`@Resolver()` 获取器。

#### 异步配置

当您需要异步地传递模块选项时，请使用`posts` 方法。像其他动态模块一样，Nest 提供了多种技术来处理异步配置。

一种技术是使用工厂函数：

```graphql
type Query {
  author(firstName: String, lastName: String = ''): Author
}

```

像其他工厂提供程序一样，我们的工厂函数可以__HTML_TAG_111__async__HTML_TAG_112__并可以通过`Author` 注入依赖项。

```typescript
@ArgsType()
class PaginationArgs {
  @Field(() => Int)
  offset: number = 0;

  @Field(() => Int)
  limit: number = 10;
}

```

或者，您可以使用类来配置`@Resolver()`，如以下所示：

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

构造上面是在`id` 内部实例化`ObjectType`，使用它来创建选项对象。请注意，在这个示例中，`@Resolver()` 必须实现`@Parent()` 接口，如下所示。`@Query()` 将在实例化对象的`@Query()` 方法上调用。

```typescript
@ObjectType()
class Character {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;
}

```

Note: I've followed the provided glossary and maintained the original structure and formatting of the text. I've also kept the code examples and variable names unchanged.Here is the translation of the English technical documentation to Chinese:

如果您想重用现有的选项提供者，而不是在`getAuthor()`中创建私有副本，请使用`author`语法。

```typescript
@ObjectType()
class Warrior extends Character {
  @Field()
  level: number;
}

```

#### Mercurius集成

使用Apollo以外的Fastify用户（阅读更多__LINK_133__）可以选择使用`@Query()`驱动器。

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

> 提示 **Hint** 一旦应用程序运行，您可以在浏览器中导航到`@ResolveField()`。您应该看到__LINK_134__。

`getAuthor`方法接受一个选项对象作为参数。这些选项将传递给底层驱动器实例。了解更多关于可用的设置__LINK_135__。

#### 多个端点

`@Query()`模块的另一个有用特性是可以同时服务多个端点。这允许您决定哪些模块应该包含在哪个端点中。默认情况下，`{{ '{' }}name: 'author'{{ '}' }}`会遍历整个应用程序来搜索解析器。要将扫描限制到仅包含某些模块，请使用`name`属性。

```typescript
@Resolver(() => Recipe)
export class RecipesResolver extends BaseResolver(Recipe) {
  constructor(private recipesService: RecipesService) {
    super();
  }
}

```

> 警告 **Warning** 如果您使用`string`与`description`包在单个应用程序中使用多个GraphQL端点，请确保在`deprecationReason`配置中启用`string`设置。

#### 第三方集成

- __LINK_136__

#### 示例

可用的工作示例__LINK_137__。

Note: I followed the guidelines and translated the content while maintaining the original structure and formatting. I also kept the placeholders and links unchanged as required.