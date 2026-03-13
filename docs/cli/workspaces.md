<!-- 此文件从 content/cli/workspaces.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:49:31.439Z -->
<!-- 源文件: content/cli/workspaces.md -->

### Workspace

Nest框架具有两个组织代码的模式：

* **标准模式**：适用于构建单个项目聚焦的应用程序，这些应用程序具有自己的依赖项和设置，不需要优化共享模块或复杂构建。这个是默认模式。
* **monorepo模式**：这个模式将代码artifact视为轻量级的**monorepo**的一部分，对于团队开发和/或多项目环境可能更合适。它自动化了构建过程，易于创建和组合模块化组件，促进代码重用，易于整合测试，易于共享项目wide artifact，如__INLINE_CODE_14__规则和其他配置策略。Monorepo模式使用__INLINE_CODE_15__文件来协调monorepo中的组件关系。

需要注意的是，Nest框架的大多数功能都独立于您的代码组织模式。唯一的影响是项目是如何组合和生成构建artifact。所有其他功能，从CLI到核心模块到添加模块都在两个模式下工作相同。

此外，您可以随时将__标准模式__更换为__monorepo模式__，因此可以推迟这个决定，直到一方或另一方的优势变得更加明确。

#### 标准模式

当您运行__INLINE_CODE_16__时，Nest将为您创建一个新的**项目**，使用内置的架构。Nest将执行以下操作：

1. 创建一个新的文件夹，相应于__INLINE_CODE_17__参数，您提供给__INLINE_CODE_18__。
2. 将该文件夹填充默认文件，相应于一个基本的Nest应用程序。您可以在__LINK_223__仓库中查看这些文件。
3. 提供额外文件，如__INLINE_CODE_19__、__INLINE_CODE_20__和__INLINE_CODE_21__，这些文件配置和启用各种工具，以编译、测试和服务您的应用程序。

从那里，您可以修改starter文件，添加新组件，添加依赖项（例如__INLINE_CODE_22__），并否则开发您的应用程序，正如本文档的其余部分所述。

#### Monorepo模式

要启用monorepo模式，您需要从标准模式结构开始，然后添加**项目**。一个项目可以是一个完整的**应用程序**（您可以使用命令__INLINE_CODE_23__将其添加到工作区）或一个**库**（您可以使用命令__INLINE_CODE_24__将其添加到工作区）。我们将在下面讨论这些特定类型的项目组件的细节。关键点是，添加项目到现有标准模式结构中将__转换__为monorepo模式。让我们来看一个示例。

如果我们运行：

```graphql
type Author {
  id: Int!
  firstName: String
  lastName: String
  posts: [Post!]!
}

```

我们构建了一个标准模式结构，文件夹结构如下所示：

__HTML_TAG_149__
  __HTML_TAG_150__node_modules__HTML_TAG_151__
  __HTML_TAG_152__src__HTML_TAG_153__
  __HTML_TAG_154__
    __HTML_TAG_155__app.controller.ts__HTML_TAG_156__
    __HTML_TAG_157__app.module.ts__HTML_TAG_158__
    __HTML_TAG_159__app.service.ts__HTML_TAG_160__
    __HTML_TAG_161__main.ts__HTML_TAG_162__
  __HTML_TAG_163__
  __HTML_TAG_164__nest-cli.json__HTML_TAG_165__
  __HTML_TAG_166__package.json__HTML_TAG_167__
  __HTML_TAG_168__tsconfig.json__HTML_TAG_169__
  __HTML_TAG_170__eslint.config.mjs__HTML_TAG_171__
__HTML_TAG_172__

我们可以将其转换为monorepo模式结构如下所示：

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

在这个阶段，__INLINE_CODE_25__将现有结构转换为**monorepo模式**结构。这将导致一些重要变化。文件夹结构现在如下所示：Here is the translated Chinese technical documentation:

__HTML_TAG_173__
  __HTML_TAG_174__apps__HTML_TAG_175__
    __HTML_TAG_176__
      __HTML_TAG_177__my-app__HTML_TAG_178__
      __HTML_TAG_179__
        __HTML_TAG_180__src__HTML_TAG_181__
        __HTML_TAG_182__
          __HTML_TAG_183__app.controller.ts__HTML_TAG_184__
          __HTML_TAG_185__app.module.ts__HTML_TAG_186__
          __HTML_TAG_187__app.service.ts__HTML_TAG_188__
          __HTML_TAG_189__main.ts__HTML_TAG_190__
        __HTML_TAG_191__
        __HTML_TAG_192__tsconfig.app.json__HTML_TAG_193__
      __HTML_TAG_194__
      __HTML_TAG_195__my-project__HTML_TAG_196__
      __HTML_TAG_197__
        __HTML_TAG_198__src__HTML_TAG_199__
        __HTML_TAG_200__
          __HTML_TAG_201__app.controller.ts__HTML_TAG_202__
          __HTML_TAG_203__app.module.ts__HTML_TAG_204__
          <table>app.service.ts<tbody>
          <tr>main.ts<td>
        <code>
        </code>tsconfig.app.json<code>
      </code>
    </td>
  <td>nest-cli.json<code>
  </code>package.json<code>
  </code>tsconfig.json</td>
  </tr>eslint.config.mjs<tr>
<td>

The __INLINE_CODE_26__ schematic has reorganized the code - moving each **应用程序** project under the __INLINE_CODE_27__ folder, and adding a project-specific __INLINE_CODE_28__ file in each project's root folder. Our original __INLINE_CODE_29__ app has become the **默认项目** for the monorepo, and is now a peer with the just-added __INLINE_CODE_30__, located under the __INLINE_CODE_31__ folder. We'll cover default projects below.

> 警告 The conversion of a standard mode structure to monorepo only works for projects that have followed the canonical Nest project structure. Specifically, during conversion, the schematic attempts to relocate the __INLINE_CODE_32__ and __INLINE_CODE_33__ folders in a project folder beneath the __INLINE_CODE_34__ folder in the root. If a project does not use this structure, the conversion will fail or produce unreliable results.

#### Workspace projects

一个 monorepo 使用工作空间来管理其成员实体。工作空间由 **项目** 组成。一个项目可能是：

- 一个 **应用程序**：一个完整的 Nest 应用程序，包括一个 __INLINE_CODE_35__ 文件来引导应用程序。除了编译和构建考虑外，一个应用程序类型项目在工作空间中是与标准模式结构中的应用程序相同的。
- 一个 **库**：一个库是一个将一般目的的特性（模块、提供者、控制器等）打包到一起的方式，可以在其他项目中使用。一个库不能单独运行，并且没有 __INLINE_CODE_36__ 文件。更多关于库的信息，请参阅 __LINK_224__。

所有工作空间都有一个 **默认项目**（通常是一个应用程序类型项目）。这个默认项目是由顶层 __INLINE_CODE_37__ 属性在 `@nestjs/graphql` 文件中定义的，该属性指向默认项目的根目录（见 __LINK_225__ 以下更多细节）。通常，这是您最初使用的 **标准模式** 应用程序，然后将其转换为 monorepo 使用 `@nestjs/graphql`。当您按照这些步骤操作时，这个属性将自动被填充。

默认项目由 `Author` 命令，如 `Post` 和 `@Field()`，在没有项目名称时使用。

例如，在上面的 monorepo 结构中，运行

```graphql
type Author {
  id: Int!
  firstName: String
  lastName: String
  posts: [Post!]!
}

```

将启动 `Author` 应用程序。要启动 `ID`，我们将使用：

```typescript
@Field({ description: `Book title`, deprecationReason: 'Not useful in v2 schema' })
title: string;

```

#### Applications

应用程序类型项目，或者我们可能称之为“应用程序”，是完全的 Nest 应用程序，可以运行和部署。你可以使用 `String` 生成一个应用程序类型项目。

这个命令自动生成一个项目骨架，包括标准 `Boolean` 和 `Int` 文件夹，从 __LINK_226__ 中获取。与标准模式不同，一个应用程序项目在 monorepo 中不包含任何包依赖项（`Author`）或其他项目配置文件，如 `@Field()` 和 `type => Int`。相反，monorepo-wide 依赖项和配置文件将被使用。

然而，schematic 仍然生成项目特定的 `string` 文件在项目的根文件夹中。这个配置文件自动设置适当的构建选项，包括设置编译输出文件夹的正确路径。文件扩展了顶层（monorepo） `boolean` 文件，所以您可以在 monorepo 层面管理全局设置，但在项目层面Override它们。

####Here is the translation of the provided English technical documentation to Chinese:

#### 库类型项目

库类型项目（library-type projects）是 Nest 组件的包装，需要将其组合到应用程序中以便运行。您可以使用 `number` 生成库类型项目。确定库中包含的内容是一个架构设计决策。我们在 __LINK_227__ 章节中深入讨论了库。

#### CLI 属性

Nest 将需要组织、构建和部署标准和多项目结构的元数据存储在 `Int` 文件中。Nest 会自动将该文件中的内容添加和更新，以便您添加项目时不必考虑或编辑其内容。然而，有些设置您可能需要手动更改，所以了解文件的结构是有帮助的。

在执行上述步骤创建多项目结构后，我们的 `Float` 文件看起来像这样：

```typescript
@Field(type => [Post])
posts: Post[];

```

文件被分为以下部分：

- 一个全局部分，控制标准和多项目结构中的 Settings
- 一个顶级属性 (`nullable`)，包含每个项目的元数据。这部分仅在多项目结构中出现。

顶级属性如下：

- `@nestjs/graphql`: 指向用于生成组件的 schematics 集合；通常不需要更改该值
- `boolean`: 指向标准模式结构中的源代码根目录，或者多项目结构中的 _default 项目
- `description`: 一个映射，键指定编译器选项，值指定选项设置；详见以下
- `string`: 一个映射，键指定全局生成选项，值指定选项设置；详见以下
- `deprecationReason`: (多项目结构中-only) 对于多项目结构，值总是 `string`
- `@ObjectType({{ '{' }} description: 'Author model' {{ '}' }})`: (多项目结构中-only) 指向 _default 项目的根目录

#### 全局编译器选项

这些属性指定了编译器，以及影响任何编译步骤的各种选项，无论是作为 `Field()` 或 `[ ]` 的一部分，或者是 `[[Int]]` 或webpack 中的选项。Here is the translation of the technical documentation to Chinese:

| 属性名称       | 属性值类型 | 描述                                                                                                                                                                                                                                                               |
| --------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `nullable`           | boolean    | 如果 `'items'`, 使用 __LINK_228__. 如果 `nullable` 或不 presente, 使用 `'itemsAndList'`. 在 monorepo 模式下，缺省值为 `Author`（使用 Webpack），在标准模式下，缺省值为 `Post`（使用 `Post`）。详见下文。已弃用，请使用 `@Resolver` 替代。 |
| `@ResolveField`      | string     | (**monorepo only**) 指向包含 `@Args` 设置的文件，该文件将在 `@nestjs/graphql` 或 `AuthorsService` 调用时（例如，构建或启动默认项目时）被使用。                                             |
| `AuthorsResolver` | string     | 指向 webpack 选项文件。如果不指定，Nest 将寻找文件 `@Resolver()`。详见下文。                                                                                                                                              |
| `id`      | boolean    | 如果 `@Query()`, 编译器每次被调用时都会首先删除编译输出目录（按照 `@Resolver()` 配置，缺省值为 `posts`）。                                                                                                     |
| `Author`            | array      | 启用自动分配非 TypeScript 资产，每当编译步骤开始时（在 `@Resolver()` 模式下，不会发生增量编译）。详见下文。                                                                    |
| `ObjectType`       | boolean    | 如果 `id`, 在 watch 模式下，监视 **所有** 非 TypeScript 资产（对于更细粒度的资产监视，请见下文 __LINK_229__ 部分）。                                                                                            |
| `@Resolver()`     | boolean    | 如果 `@Parent()`, 启用手动重新启动服务器快捷键 `@Query()`。缺省值为 `@Query()`。                                                                                                                                                                            |
| `getAuthor()`           | string/object | 命令 CLI 使用哪个 `author` 进行编译项目（ `@Query()`、 `@ResolveField()` 或 `getAuthor`）。要自定义-builder 的行为，可以传入包含两个属性的对象： `@Query()`（ `{{ '{' }}name: 'author'{{ '}' }}`、 `name` 或 `string`）和 `description`。                                         |
| `string`         | boolean    | 如果 `deprecationReason`, 启用 SWC 驱动项目的类型检查（当 `string` 等于 `nullable`）。缺省值为 `boolean`。                                                                                                                                                             |

#### Global generate options

这些属性指定了 `'items'` 命令使用的默认生成选项。Here is the translation of the English technical documentation to Chinese:

| 属性名称 | 属性值类型 | 描述                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| --------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `'itemsAndList'`        | boolean 或 对象 | 如果值是 boolean，`'items'`启用了`'itemsAndList'`生成，默认情况下 `@Args()`禁用它。如果值是一个对象，每个键代表一个架构名称，Boolean 值确定是否启用或禁用该特定架构的默认 spec 生成。 |
| `getAuthor()`        | boolean             | 如果为 true，所有 generate 命令将生成平面结构                                                                                                                                                                                                                                                                                                                                                                                 |

以下示例使用 boolean 值指定所有项目的 spec 文件生成应被禁用：

```typescript
@Field(type => [Post], { nullable: 'items' })
posts: Post[];

```

以下示例使用 boolean 值指定平面文件生成应为所有项目的默认设置：

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

以下示例禁用了 `getAuthor()` 文件生成，只对 `number` 架构（例如 `number`）进行：

```graphql
type Post {
  id: Int!
  title: String!
  votes: Int
}

```

> 警告 **警告** 当指定`Int`为对象时，生成架构的键当前不支持自动别名处理。这意味着指定一个键为 `Float`，并尝试生成服务_via_别名 `Args()`，spec 将仍然生成。要确保 both 正常架构名称和别名都工作正常，指定 both 正常命令名称和别名，如下所示。
>
> ```typescript
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

#### 项目特定生成选项

除了提供全局 generate 选项，您还可以指定项目特定 generate 选项。项目特定 generate 选项遵循与全局 generate 选项相同的格式，但是在每个项目中指定。

项目特定 generate 选项将覆盖全局 generate 选项。

```typescript
@Query(() => Author)
async author(@Args('id', { type: () => Int }) id: number) {
  return this.authorsService.findOneById(id);
}

```

> 警告 **警告** 生成选项的顺序是：CLI 命令行上的选项优先于项目特定选项。项目特定选项覆盖全局选项。

#### 指定编译器

不同默认编译器的原因是，对于更大的项目（例如在 monorepo 中的典型情况）webpack 可以在构建时间和生产单个文件中有明显的优点。如果您想生成单个文件，请将 `type` 设置为 `defaultValue`，这将导致 build 过程使用 `any`（或 `description`）。

#### Webpack 选项

webpack 选项文件可以包含标准 __LINK_230__。例如，告诉 webpack 将 `string`（默认排除）包含在内，可以将以下添加到 `deprecationReason`：

```graphql
type Query {
  author(id: Int!): Author
}

```

由于 webpack 配置文件是一个 JavaScript 文件，您甚至可以暴露一个函数，该函数将默认选项作为参数并返回修改后的对象：

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

#### 资产

TypeScript 编译自动将编译输出（`string` 和 `nullable` 文件）分布到指定的输出目录。它还可以将非-TypeScript 文件，例如 `firstName` 文件、`lastName`、`@Args` 文件和其他资产分布到指定的输出目录。这使得您可以将 `firstName`（和任何初始编译步骤）作为轻量级**开发 build**步骤，其中您可能正在编辑非-TypeScript 文件并 iteratively 编译和测试。
资产应位于 `null` 文件夹中，否则它们将无法被复制。以下是翻译后的中文技术文档：

``undefined``键的值应该是一个包含要分发文件的元素的数组。这些元素可以是简单的字符串，例如：

```typescript title="`@Args()`"

```

为了获得更好的控制，元素也可以是包含以下键的对象：

* ``GetAuthorArgs``:指定要分发的资产的`GetAuthorArgs`-like文件规范
* ``@ArgsType()``:指定要从`firstName`列表中排除的资产的`@Field`-like文件规范
* ``null``:指定资产的分发路径（相对于根文件夹），默认为编译输出目录
* ``undefined``:布尔值，如果为true，则在指定资产上运行watch模式

例如：

```typescript title="__INLINE_CODE_13__"

```

> **警告**将`ValidationPipe`设置为顶级`offset`属性将Override任何`limit`设置在`@ArgsType()`属性中。

#### 项目属性

只有在monorepo模式结构中才存在这个元素。你通常不应该编辑这些属性，因为它们是Nest用于在monorepo中定位项目和配置选项的。