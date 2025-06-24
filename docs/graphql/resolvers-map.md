### 解析器

解析器提供将 [GraphQL](https://graphql.org/) 操作（查询、变更或订阅）转换为数据的指令。它们返回与我们在模式中指定的相同数据结构——既可以是同步返回，也可以是通过 Promise 解析返回该结构的结果。通常，您需要手动创建**解析器映射** 。而 `@nestjs/graphql` 包则利用装饰器提供的元数据自动生成解析器映射。为了演示如何使用该包功能创建 GraphQL API，我们将创建一个简单的作者 API。

#### 代码优先

在代码优先方法中，我们不会通过手动编写 GraphQL SDL 来创建 GraphQL 模式，而是使用 TypeScript 装饰器从 TypeScript 类定义生成 SDL。`@nestjs/graphql` 包会读取通过装饰器定义的元数据，并自动为您生成模式。

#### 对象类型

GraphQL 模式中的大多数定义都是**对象类型** 。您定义的每个对象类型都应代表应用程序客户端可能需要交互的领域对象。例如，我们的示例 API 需要能够获取作者及其帖子的列表，因此我们应该定义 `Author` 类型和 `Post` 类型来支持此功能。

如果采用模式优先（schema first）方法，我们会用 SDL 这样定义模式：

```graphql
type Author {
  id: Int!
  firstName: String
  lastName: String
  posts: [Post!]!
}
```

而在代码优先（code first）方法中，我们使用 TypeScript 类和装饰器来定义模式并标注类的字段。上述 SDL 在代码优先中等效于：

```typescript
@@filename(authors/models/author.model)
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

> info **提示** TypeScript 的元数据反射系统存在若干限制，例如无法确定类由哪些属性组成，或识别某个属性是可选的还是必需的。由于这些限制，我们必须在模式定义类中显式使用 `@Field()` 装饰器来提供每个字段的 GraphQL 类型和可选性元数据，或者使用 [CLI 插件](/graphql/cli-plugin)来为我们生成这些元数据。

与任何类一样，`Author` 对象类型由一组字段组成，每个字段都声明了一个类型。字段类型对应 [GraphQL 类型](https://graphql.org/learn/schema/) 。字段的 GraphQL 类型可以是另一个对象类型，也可以是标量类型。GraphQL 标量类型是解析为单个值的原始类型（如 `ID`、`String`、`Boolean` 或 `Int`）。

> info **提示** 除了 GraphQL 内置的标量类型外，您还可以定义自定义标量类型（阅读[更多](/graphql/scalars) ）。

上述 `Author` 对象类型定义将导致 Nest **生成**我们之前展示的 SDL：

```graphql
type Author {
  id: Int!
  firstName: String
  lastName: String
  posts: [Post!]!
}
```

`@Field()` 装饰器接受一个可选的类型函数（例如 `type => Int`），以及一个可选的配置对象。

当 TypeScript 类型系统与 GraphQL 类型系统可能存在歧义时，类型函数是必需的。具体而言：对于 `string` 和 `boolean` 类型**不需要** ；而对于 `number` 类型则**需要** （必须映射为 GraphQL 的 `Int` 或 `Float`）。类型函数只需返回所需的 GraphQL 类型（如本章节各示例所示）。

配置对象可包含以下任意键值对：

- `nullable`：用于指定字段是否可为空（在 `@nestjs/graphql` 中，默认每个字段都是非空的）；`boolean`
- `description`：用于设置字段描述；`string`
- `deprecationReason`：用于将字段标记为已弃用；`string`

例如：

```typescript
@Field({ description: `Book title`, deprecationReason: 'Not useful in v2 schema' })
title: string;
```

info **提示** 你也可以为整个对象类型添加描述或标记为已弃用： `@ObjectType({{ '{' }} description: 'Author model' {{ '}' }})` 。

当字段为数组类型时，必须在 `Field()` 装饰器的类型函数中手动声明数组类型，如下所示：

```typescript
@Field(type => [Post])
posts: Post[];
```

> **提示** 使用方括号标记(`[ ]`)可以表示数组的维度。例如，使用 `[[Int]]` 表示一个整数矩阵。

若要声明数组元素（而非数组本身）可为空，需将 `nullable` 属性设置为 `'items'`，如下所示：

```typescript
@Field(type => [Post], { nullable: 'items' })
posts: Post[];
```

> **提示** 若数组及其元素均可为空，则应将 `nullable` 设置为 `'itemsAndList'`。

既然已创建 `Author` 对象类型，现在我们来定义 `Post` 对象类型。

```typescript
@@filename(posts/models/post.model)
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

`Post` 对象类型将生成以下 SDL 格式的 GraphQL 模式片段：

```graphql
type Post {
  id: Int!
  title: String!
  votes: Int
}
```

#### 代码优先解析器

至此，我们已定义了数据图中可存在的对象（类型定义），但客户端尚无法与这些对象交互。为此，我们需要创建一个解析器类。在代码优先方法中，解析器类既定义解析函数**又**生成 **Query 类型** 。通过下面的示例，这一点将变得清晰：

```typescript
@@filename(authors/authors.resolver)
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

> info **提示** 所有装饰器（例如 `@Resolver`、`@ResolveField`、`@Args` 等）均从 `@nestjs/graphql` 包中导出。

您可以定义多个解析器类。Nest 将在运行时将它们组合起来。有关代码组织的更多信息，请参阅下面的[模块](/graphql/resolvers#module)部分。

> warning **注意** `AuthorsService` 和 `PostsService` 类中的逻辑可以根据需要简单或复杂。本示例的主要目的是展示如何构建解析器以及它们如何与其他提供者交互。

在上面的示例中，我们创建了 `AuthorsResolver`，它定义了一个查询解析器函数和一个字段解析器函数。要创建解析器，我们需要创建一个以解析器函数作为方法的类，并用 `@Resolver()` 装饰器来注解该类。

在此示例中，我们定义了一个查询处理器，用于根据请求中发送的 `id` 获取作者对象。要指定该方法为查询处理器，请使用 `@Query()` 装饰器。

传递给 `@Resolver()` 装饰器的参数是可选的，但当我们的图结构变得复杂时就会发挥作用。它用于提供一个父对象，供字段解析器函数在遍历对象图时使用。

在本例中，由于类包含一个**字段解析器**函数（用于 `Author` 对象类型的 `posts` 属性），我们**必须**为 `@Resolver()` 装饰器提供一个值，以指明哪个类是当前类中定义的所有字段解析器的父类型（即对应的 `ObjectType` 类名）。如示例所示，在编写字段解析器函数时，需要访问父对象（即被解析字段所属的对象）。本例中，我们通过调用以作者 `id` 为参数的服务，用字段解析器填充了作者的 posts 数组。因此需要在 `@Resolver()` 装饰器中标识父对象。注意后续使用 `@Parent()` 方法参数装饰器来提取该父对象的引用。

我们可以定义多个 `@Query()` 解析器函数（既可以在这个类中，也可以在其他任何解析器类中），它们将被聚合到生成的 SDL 中的单个 **Query 类型**定义里，并包含解析器映射中的相应条目。这允许您将查询定义在靠近它们所使用的模型和服务的地方，并保持它们在模块中的良好组织。

> info **提示** Nest CLI 提供了一个生成器（原理图），能自动生成**所有样板代码** ，帮助我们避免手动完成这些工作，使开发者体验更加简单。了解更多关于此功能的信息[请点击这里](/recipes/crud-generator) 。

#### 查询类型名称

在上述示例中，`@Query()` 装饰器会根据方法名生成 GraphQL 模式查询类型名称。例如，考虑上面示例中的以下构造：

```typescript
@Query(() => Author)
async author(@Args('id', { type: () => Int }) id: number) {
  return this.authorsService.findOneById(id);
}
```

这会在我们的模式中为作者查询生成以下条目（查询类型使用与方法名相同的名称）：

```graphql
type Query {
  author(id: Int!): Author
}
```

> **提示** 了解更多关于 GraphQL 查询的信息[请点击此处](https://graphql.org/learn/queries/) 。

按照惯例，我们更倾向于解耦这些名称；例如，我们倾向于使用类似 `getAuthor()` 的名称作为查询处理方法，但仍使用 `author` 作为查询类型名称。同样适用于我们的字段解析器。我们可以通过将映射名称作为 `@Query()` 和 `@ResolveField()` 装饰器的参数传递来实现这一点，如下所示：

```typescript
@@filename(authors/authors.resolver)
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

上述 `getAuthor` 处理方法将生成以下 SDL 格式的 GraphQL 模式片段：

```graphql
type Query {
  author(id: Int!): Author
}
```

#### 查询装饰器选项

`@Query()` 装饰器的选项对象（我们在上面传递 `{{ '{' }}name: 'author'{{ '}' }}` 的地方）接受多个键/值对：

- `name`: 查询名称；一个 `string` 类型
- `description`: 用于生成 GraphQL 模式文档的描述（例如在 GraphQL playground 中）；一个 `string` 类型
- `deprecationReason`：设置查询元数据以将查询标记为已弃用（例如在 GraphQL playground 中）；值为 `string` 类型
- `nullable`：查询是否可以返回空数据响应；值为 `boolean` 类型或 `'items'` 或 `'itemsAndList'`（有关 `'items'` 和 `'itemsAndList'` 的详细信息请参见上文）

#### Args 装饰器选项

使用 `@Args()` 装饰器从请求中提取参数以供方法处理器使用，其工作方式与 [REST 路由参数提取](/controllers#route-parameters)非常相似。

通常情况下，您的 `@Args()` 装饰器会很简单，不需要像上面 `getAuthor()` 方法那样使用对象参数。例如，如果标识符的类型是字符串，以下结构就足够了，它只是从传入的 GraphQL 请求中提取命名字段作为方法参数使用。

```typescript
@Args('id') id: string
```

在 `getAuthor()` 这个例子中，使用了 `number` 类型，这带来了一个挑战。`number` 这个 TypeScript 类型没有提供足够的信息来说明预期的 GraphQL 表示形式（例如 `Int` 与 `Float` 的区别）。因此我们必须**显式地**传递类型引用。我们通过向 `Args()` 装饰器传递第二个参数（包含参数选项）来实现，如下所示：

```typescript
@Query(() => Author, { name: 'author' })
async getAuthor(@Args('id', { type: () => Int }) id: number) {
  return this.authorsService.findOneById(id);
}
```

这个选项对象允许我们指定以下可选的键值对：

- `type`: 一个返回 GraphQL 类型的函数
- `defaultValue`：默认值；`any`
- `description`：描述元数据；`string`
- `deprecationReason`：弃用字段并提供描述原因的元数据；`string`
- `nullable`：字段是否可为空

查询处理方法可以接受多个参数。假设我们需要根据作者的 `firstName` 和 `lastName` 来获取作者信息，此时可以调用两次 `@Args`：

```typescript
getAuthor(
  @Args('firstName', { nullable: true }) firstName?: string,
  @Args('lastName', { defaultValue: '' }) lastName?: string,
) {}
```

> **提示** 对于 GraphQL 可为空字段 `firstName`，不需要在字段类型中添加非值类型 `null` 或 `undefined`。但请注意，你需要在解析器中为这些可能的非值类型添加类型保护，因为 GraphQL 可为空字段会允许这些类型传递到解析器。

#### 专用参数类

使用内联 `@Args()` 调用时，类似上述示例的代码会变得臃肿。你可以创建一个专用的 `GetAuthorArgs` 参数类，然后在处理方法中按如下方式访问：

```typescript
@Args() args: GetAuthorArgs
```

使用 `@ArgsType()` 创建 `GetAuthorArgs` 类，如下所示：

```typescript
@@filename(authors/dto/get-author.args)
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

> info **提示** 再次强调，由于 TypeScript 元数据反射系统的限制，必须使用 `@Field` 装饰器手动指定类型和可选性，或者使用 [CLI 插件](/graphql/cli-plugin) 。另外，对于 GraphQL 可为空字段 `firstName`，不需要在字段类型中添加 `null` 或 `undefined` 等非值类型。只需注意，你需要在解析器中为这些可能的非值类型添加类型保护，因为 GraphQL 可为空字段会允许这些类型传递到解析器。

这将生成以下 GraphQL 模式定义语言(SDL)部分：

```graphql
type Query {
  author(firstName: String, lastName: String = ''): Author
}
```

> info **提示** 请注意，像 `GetAuthorArgs` 这样的参数类与 `ValidationPipe` 配合得很好（阅读[更多](/techniques/validation) ）。

#### 类继承

你可以使用标准的 TypeScript 类继承来创建具有通用工具类型特性（字段和字段属性、验证等）的基础类，这些类可以被扩展。例如，你可能有一组分页相关的参数，它们总是包含标准的 `offset` 和 `limit` 字段，但也包含特定于类型的其他索引字段。你可以按照如下所示设置类层次结构。

基础 `@ArgsType()` 类：

```typescript
@ArgsType()
class PaginationArgs {
  @Field(() => Int)
  offset: number = 0;

  @Field(() => Int)
  limit: number = 10;
}
```

基础 `@ArgsType()` 类的特定类型子类：

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

同样的方法也适用于 `@ObjectType()` 对象。在基类上定义通用属性：

```typescript
@ObjectType()
class Character {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;
}
```

在子类上添加特定类型的属性：

```typescript
@ObjectType()
class Warrior extends Character {
  @Field()
  level: number;
}
```

你也可以将继承与解析器结合使用。通过结合继承和 TypeScript 泛型，可以确保类型安全。例如，要创建一个带有通用 `findAll` 查询的基类，可以使用如下结构：

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

请注意以下几点：

- 需要显式声明返回类型（上例中的 `any`）：否则 TypeScript 会因使用私有类定义而报错。建议：定义接口而非使用 `any`。
- `Type` 是从 `@nestjs/common` 包中导入的
- `isAbstract: true` 属性表示不应为此类生成 SDL（模式定义语言语句）。注意，您也可以为其他类型设置此属性以禁止 SDL 生成。

以下是生成 `BaseResolver` 具体子类的方法：

```typescript
@Resolver(() => Recipe)
export class RecipesResolver extends BaseResolver(Recipe) {
  constructor(private recipesService: RecipesService) {
    super();
  }
}
```

此构造将生成以下 SDL：

```graphql
type Query {
  findAllRecipe: [Recipe!]!
}
```

#### 泛型

我们在上面看到了泛型的一种用法。这个强大的 TypeScript 特性可用于创建实用的抽象。例如，这里有一个基于[此文档](https://graphql.org/learn/pagination/#pagination-and-edges)的基于游标的分页实现示例：

```typescript
import { Field, ObjectType, Int } from '@nestjs/graphql';
import { Type } from '@nestjs/common';

interface IEdgeType<T> {
  cursor: string;
  node: T;
}

export interface IPaginatedType<T> {
  edges: IEdgeType<T>[];
  nodes: T[];
  totalCount: number;
  hasNextPage: boolean;
}

export function Paginated<T>(classRef: Type<T>): Type<IPaginatedType<T>> {
  @ObjectType(`${classRef.name}Edge`)
  abstract class EdgeType {
    @Field(() => String)
    cursor: string;

    @Field(() => classRef)
    node: T;
  }

  @ObjectType({ isAbstract: true })
  abstract class PaginatedType implements IPaginatedType<T> {
    @Field(() => [EdgeType], { nullable: true })
    edges: EdgeType[];

    @Field(() => [classRef], { nullable: true })
    nodes: T[];

    @Field(() => Int)
    totalCount: number;

    @Field()
    hasNextPage: boolean;
  }
  return PaginatedType as Type<IPaginatedType<T>>;
}
```

定义了上述基类后，我们现在可以轻松创建继承此行为的专用类型。例如：

```typescript
@ObjectType()
class PaginatedAuthor extends Paginated(Author) {}
```

#### 模式优先

如[前一章](/graphql/quick-start)所述，在模式优先方法中，我们首先手动在 SDL 中定义模式类型（阅读[更多](https://graphql.org/learn/schema/#type-language) ）。考虑以下 SDL 类型定义。

> info **注意** 为方便起见，本章节将所有 SDL 集中在一处（如下所示的单个 `.graphql` 文件）。实际开发中，您可能会发现以模块化方式组织代码更为合适。例如，可以为每个领域实体创建单独的 SDL 文件，包含类型定义、相关服务、解析器代码以及该实体的 Nest 模块定义类，并统一存放在该实体的专属目录中。Nest 会在运行时自动聚合所有独立的模式类型定义。

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

#### Schema First 解析器

上述模式公开了一个查询方法 - `author(id: Int!): Author`。

> info **注意** 了解更多关于 GraphQL 查询的信息，请[点击此处](https://graphql.org/learn/queries/) 。

现在我们来创建一个解析作者查询的 `AuthorsResolver` 类：

```typescript
@@filename(authors/authors.resolver)
@Resolver('Author')
export class AuthorsResolver {
  constructor(
    private authorsService: AuthorsService,
    private postsService: PostsService,
  ) {}

  @Query()
  async author(@Args('id') id: number) {
    return this.authorsService.findOneById(id);
  }

  @ResolveField()
  async posts(@Parent() author) {
    const { id } = author;
    return this.postsService.findAll({ authorId: id });
  }
}
```

> info **提示** 所有装饰器（如 `@Resolver`、`@ResolveField`、`@Args` 等）都是从 `@nestjs/graphql` 包中导出的。

> warning **注意** `AuthorsService` 和 `PostsService` 类中的逻辑可以根据需要简单或复杂。本示例的主要目的是展示如何构建解析器以及它们如何与其他提供者交互。

`@Resolver()` 装饰器是必需的。它接受一个可选的字符串参数，用于指定类名。当类包含 `@ResolveField()` 装饰器时，这个类名是必需的，用于告知 Nest 被装饰的方法与父类型相关联（在我们当前的例子中是 `Author` 类型）。或者，也可以不在类顶部设置 `@Resolver()`，而是为每个方法单独设置：

```typescript
@Resolver('Author')
@ResolveField()
async posts(@Parent() author) {
  const { id } = author;
  return this.postsService.findAll({ authorId: id });
}
```

在此情况下（方法层级的 `@Resolver()` 装饰器），若类中包含多个 `@ResolveField()` 装饰器，则必须为所有方法添加 `@Resolver()`。这种做法不被视为最佳实践（因其会产生额外开销）。

> **提示** 传递给 `@Resolver()` 的任何类名参数**不会**影响查询（`@Query()` 装饰器）或变更（`@Mutation()` 装饰器）。

> **警告** 在**代码优先**方法中不支持在方法层级使用 `@Resolver` 装饰器。

上述示例中，`@Query()` 和 `@ResolveField()` 装饰器会根据方法名关联到 GraphQL 模式类型。例如，考虑前文示例中的以下结构：

```typescript
@Query()
async author(@Args('id') id: number) {
  return this.authorsService.findOneById(id);
}
```

这将在我们的模式中为作者查询生成以下条目（查询类型与方法名称相同）：

```graphql
type Query {
  author(id: Int!): Author
}
```

按照惯例，我们更倾向于解耦这些内容，使用诸如 `getAuthor()` 或 `getPosts()` 这样的名称作为解析器方法。我们可以通过将映射名称作为装饰器的参数来实现这一点，如下所示：

```typescript
@@filename(authors/authors.resolver)
@Resolver('Author')
export class AuthorsResolver {
  constructor(
    private authorsService: AuthorsService,
    private postsService: PostsService,
  ) {}

  @Query('author')
  async getAuthor(@Args('id') id: number) {
    return this.authorsService.findOneById(id);
  }

  @ResolveField('posts')
  async getPosts(@Parent() author) {
    const { id } = author;
    return this.postsService.findAll({ authorId: id });
  }
}
```

> **提示** Nest CLI 提供了一个生成器（schematic），能自动生成**所有样板代码** ，帮助我们避免手动完成这些工作，使开发体验更加简单。点击[此处](/recipes/crud-generator)了解更多关于此功能的信息。

#### 生成类型

假设我们采用模式优先（schema first）方法并启用了类型生成功能（如[前一章](/graphql/quick-start)所示，设置 `outputAs: 'class'`），运行应用后将在 `GraphQLModule.forRoot()` 方法指定的位置生成如下文件（例如 `src/graphql.ts`）：

```typescript
@@filename(graphql)
export (class Author {
  id: number;
  firstName?: string;
  lastName?: string;
  posts?: Post[];
})
export class Post {
  id: number;
  title: string;
  votes?: number;
}

export abstract class IQuery {
  abstract author(id: number): Author | Promise<Author>;
}
```

通过生成类（而非默认的接口生成方式），您可以将声明式验证**装饰器**与模式优先方法结合使用，这是极其有用的技术（ [了解更多](/techniques/validation) ）。例如，您可以像下面这样为生成的 `CreatePostInput` 类添加 `class-validator` 装饰器，从而对 `title` 字段实施最小和最大字符串长度限制：

```typescript
import { MinLength, MaxLength } from 'class-validator';

export class CreatePostInput {
  @MinLength(3)
  @MaxLength(50)
  title: string;
}
```

> **注意** 要实现输入（及参数）的自动验证，请使用 `ValidationPipe`。有关验证的更多信息请[参阅此处](/techniques/validation) ，关于管道的具体说明请[查看这里](/pipes) 。

然而，若直接将装饰器添加到自动生成的文件中，每次文件重新生成时这些装饰器都会被**覆盖** 。正确的做法是创建一个单独的文件来扩展生成的类。

```typescript
import { MinLength, MaxLength } from 'class-validator';
import { Post } from '../../graphql.ts';

export class CreatePostInput extends Post {
  @MinLength(3)
  @MaxLength(50)
  title: string;
}
```

#### GraphQL 参数装饰器

我们可以通过专用装饰器访问标准 GraphQL 解析器参数。下表对比了 Nest 装饰器与其对应的原生 Apollo 参数：

<table data-immersive-translate-walked="9f001e6e-8302-4a13-83e5-8ff468676706"><tbody data-immersive-translate-walked="9f001e6e-8302-4a13-83e5-8ff468676706"><tr data-immersive-translate-walked="9f001e6e-8302-4a13-83e5-8ff468676706"><td data-immersive-translate-walked="9f001e6e-8302-4a13-83e5-8ff468676706" data-immersive-translate-paragraph="1">@Root() 和 @Parent()</td><td data-immersive-translate-walked="9f001e6e-8302-4a13-83e5-8ff468676706" data-immersive-translate-paragraph="1">根 / 父级</td></tr><tr data-immersive-translate-walked="9f001e6e-8302-4a13-83e5-8ff468676706"><td data-immersive-translate-walked="9f001e6e-8302-4a13-83e5-8ff468676706">@Context(param?: string)</td><td data-immersive-translate-walked="9f001e6e-8302-4a13-83e5-8ff468676706" data-immersive-translate-paragraph="1">上下文 / 上下文[参数]</td></tr><tr data-immersive-translate-walked="9f001e6e-8302-4a13-83e5-8ff468676706"><td data-immersive-translate-walked="9f001e6e-8302-4a13-83e5-8ff468676706">@Info(param?: string)</td><td data-immersive-translate-walked="9f001e6e-8302-4a13-83e5-8ff468676706" data-immersive-translate-paragraph="1">信息 / 信息[参数]</td></tr><tr data-immersive-translate-walked="9f001e6e-8302-4a13-83e5-8ff468676706"><td data-immersive-translate-walked="9f001e6e-8302-4a13-83e5-8ff468676706">@Args(param?: string)</td><td data-immersive-translate-walked="9f001e6e-8302-4a13-83e5-8ff468676706" data-immersive-translate-paragraph="1">参数 / 参数[参数]</td></tr></tbody></table>

这些参数具有以下含义：

- `root`：一个包含从父字段解析器返回结果的对象，或者在顶级 `Query` 字段情况下，包含从服务器配置传递的 `rootValue`。
- `context`：一个由特定查询中所有解析器共享的对象；通常用于包含每个请求的状态。
- `info`：一个包含查询执行状态信息的对象。
- `args`：一个包含查询中传入字段参数的对象。

#### 模块

完成上述步骤后，我们就已声明式地指定了 `GraphQLModule` 生成解析器映射所需的全部信息。`GraphQLModule` 利用反射机制来检查通过装饰器提供的元数据，并自动将类转换为正确的解析器映射。

您唯一需要做的就是在某个模块中将解析器类（如 `AuthorsResolver`） **提供** （即列为 `provider`），并导入该模块（`AuthorsModule`），这样 Nest 就能使用它了。

例如，我们可以在 `AuthorsModule` 中实现这一功能，该模块还能提供此场景下所需的其他服务。请确保在某个位置（如根模块或被根模块导入的其他模块中）导入 `AuthorsModule`。

```typescript
@@filename(authors/authors.module)
@Module({
  imports: [PostsModule],
  providers: [AuthorsService, AuthorsResolver],
})
export class AuthorsModule {}
```

> **提示** 按照所谓的**领域模型** （类似于在 REST API 中组织入口点的方式）来组织代码会很有帮助。采用这种方法时，请将模型（`ObjectType` 类）、解析器和服务都集中放在代表领域模型的 Nest 模块中。每个模块的所有组件都应存放在单一文件夹内。当您这样做并使用 [Nest CLI](/cli/overview) 生成每个元素时，Nest 会自动为您将这些部分连接起来（将文件定位到适当文件夹、在 `provider` 和 `imports` 数组中生成条目等）。
