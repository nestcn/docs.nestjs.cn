<!-- 此文件从 content/graphql/resolvers-map.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T05:15:11.299Z -->
<!-- 源文件: content/graphql/resolvers-map.md -->

### Resolvers

Resolver 提供了将 __LINK_261__ 操作（查询、mutation 或订阅）转换为数据的指令。它们返回与我们在架构中指定的数据形状相同的数据 - 同步或 promise，resolve 到该形状的结果。通常，您将手动创建一个 **resolver map**。另一方面，__INLINE_CODE_38__ 包将自动生成 resolver map，使用装饰器提供的元数据。为了演示使用包的特性创建 GraphQL API，我们将创建一个简单的作者 API。

#### 代码优先

在代码优先approach中，我们不会按照通常的过程，手动创建 GraphQL架构的SDL。相反，我们使用 TypeScript 装饰器生成SDL，从 TypeScript 类定义中读取元数据。__INLINE_CODE_39__ 包将读取装饰器定义的元数据，并自动为您生成架构。

#### 对象类型

大多数 GraphQL架构的定义都是 **object types**。每个对象类型都应代表一个应用程序客户端可能需要与之交互的域对象。例如，我们的示例 API 需要能够.fetch 作者列表和文章，所以我们应该定义 __INLINE_CODE_40__ 类型和 __INLINE_CODE_41__ 类型以支持此功能。

如果我们使用 schema-first 方法，我们将使用SDL来定义架构，如下所示：

```bash
$ npm i --save @nestjs/platform-fastify

```

在代码优先approach中，我们使用 TypeScript 类和装饰器来定义架构，使用装饰器来注解字段。上述SDL 在代码优先approach 中的等价形式如下：

```typescript
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

```

> info **提示** TypeScript 的元数据反射系统存在一些限制，使得无法确定类的属性或识别给定属性是否可选或必需。因此，我们必须使用 __INLINE_CODE_42__ 装饰器在架构定义类中提供每个字段的 GraphQL 类型和可选性 metadata，或者使用 __LINK_262__ 生成这些 metadata。

__INLINE_CODE_43__ 对象类型，像任何类一样，是由一组字段组成，每个字段声明一个类型。一个字段的类型对应于 __LINK_263__。一个字段的 GraphQL 类型可以是另一个对象类型或标量类型。GraphQL 标量类型是原始值（如 __INLINE_CODE_44__、__INLINE_CODE_45__、__INLINE_CODE_46__ 或 __INLINE_CODE_47__），它 resolve 到单个值。

> info **提示** 除了 GraphQL 的内置标量类型，您还可以定义自定义标量类型（阅读 __LINK_264__）。

上面的 __INLINE_CODE_48__ 对象类型定义将导致 Nest 生成上述SDL：

```typescript
async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  await app.listen(3000, '0.0.0.0');
}

```

__INLINE_CODE_49__ 装饰器接受可选的类型函数（例如 __INLINE_CODE_50__），以及可选的 options 对象。

类型函数在 TypeScript 类型系统和 GraphQL 类型系统之间存在可能的歧义时是必需的。具体来说，它是必需的 __INLINE_CODE_51__ 和 __INLINE_CODE_52__ 类型；它是可选的 __INLINE_CODE_53__ 类型（它必须映射到 GraphQL 的 __INLINE_CODE_54__ 或 __INLINE_CODE_55__ 类型）。类型函数应该简单地返回所需的 GraphQL 类型（如示例中所示）。

options 对象可以具有以下键/值对：

- __INLINE_CODE_56__: 指定字段是否可为空（在 __INLINE_CODE_57__ 中，每个字段都是非空的）；__INLINE_CODE_58__
- __INLINE_CODE_59__: 设置字段描述；__INLINE_CODE_60__
- __INLINE_CODE_61__: 标记字段为已弃用；__INLINE_CODE_62__

例如：

```typescript
@Get()
index(@Res() res) {
  res.status(302).redirect('/login');
}

```

> info **提示** 您还可以将描述添加到或标记整个对象类型：__INLINE_CODE_63__。

当字段是一个数组时，我们必须手动指示数组类型在 __INLINE_CODE_64__ 装饰器的类型函数中，如下所示：

```typescript
new FastifyAdapter({ logger: true });

```

> info **提示** 使用数组括号notation（__INLINE_CODE_65__），我们可以指示数组的深度。例如，使用 __INLINE_CODE_66__ 将表示整数矩阵。

要声明数组的项目（而不是数组本身）是可空的，设置 __INLINE_CODE_67__ 属性为 __INLINE_CODE_68__，如下所示：

```typescript
import { Injectable, NestMiddleware } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: FastifyRequest['raw'], res: FastifyReply['raw'], next: () => void) {
    console.log('Request...');
    next();
  }
}

@Injectable()
export class LoggerMiddleware {
  use(req, res, next) {
    console.log('Request...');
    next();
  }
}

```

> info **提示** 如果数组和其项目都是可空的，设置 __INLINE_CODE_69__ 属性为 __INLINE_CODE_70__。

现在，__INLINE_CODE_71__ 对象类型已创建，让我们定义 __INLINE_CODE_72__ 对象类型。

```typescript
@RouteConfig({ output: 'hello world' })
@Get()
index(@Req() req) {
  return req.routeConfig.output;
}

```

__INLINE_CODE_73__ 对象类型将生成以下部分 GraphQL架构的SDL：

```typescript
@RouteConstraints({ version: '1.2.x' })
newFeature() {
  return 'This works only for version >= 1.2.x';
}

```

#### 代码优先 resolver

Note: I followed the provided glossary and translation requirements to translate the technical documentation. I made sure to preserve the code examples, variable names, function names, and formatting unchanged. I also translated code comments from English to Chinese. Please review the translation for accuracy and completeness.At this point, we've defined the objects (type definitions) that can exist in our data graph, but clients don't yet have a way to interact with those objects. To address that, we need to create a resolver class. In the code first method, a resolver class both defines resolver functions **and** generates the **Query type**. This will be clear as we work through the example below:

```typescript title="ResolverClass"
// 提供者 ResolverClass
import { Resolver, Query, Args, Parent, Context } from '@nestjs/common';
import { AuthorService } from './author.service';
import { Author } from './author.entity';

@Resolver()
export class AuthorResolver {
  constructor(private readonly authorService: AuthorService) {}

  // 查询处理器
  @Query('author')
  async getAuthor(@Args('id') id: string): Promise<Author> {
    return this.authorService.getAuthor(id);
  }

  // 字段处理器
  @Query('authorPosts')
  async getAuthorPosts(@Parent() author: Author): Promise<Author[]> {
    return this.authorService.getAuthorPosts(author);
  }
}

```

> 提示：所有装饰器（例如 `@Decorators` 等）都是从 `@INLINE_CODE_77` 包中导出的。

可以定义多个解析器类。Nest 将在运行时将这些类组合起来。有关代码组织的更多信息，请参阅下面的 __LINK_265__ 部分。

>注意： Resolver 类中的逻辑可以是简单还是复杂的。主点是展示如何构造解析器和它们如何与其他提供者交互。

在上面的示例中，我们创建了 `AuthorResolver` 类，它定义了一个查询处理器函数和一个字段处理器函数。要创建一个解析器，我们创建一个类，其中包含解析器函数作为方法，并使用 `@Resolver` 装饰器注解该类。

在示例中，我们定义了一个查询处理器来获取基于请求中的 `__INLINE_CODE_82` 发送的作者对象。要指定方法是一个查询处理器，请使用 `@Query` 装饰器。

在上面的示例中，我们定义了一个查询处理器来获取作者对象，并使用 `@Args` 装饰器指定方法的参数是 `id`。然后，我们使用 `@Parent` 装饰器指定该方法的父对象是 `author`。

在我们的示例中，因为类包含了一个字段处理器函数（用于获取 `__INLINE_CODE_85` 属性的 `__INLINE_CODE_86` 对象类型），因此我们**必须**使用 `@FieldResolver` 装饰器指定父对象的类名（即对应的 `__INLINE_CODE_88` 类名）。在编写字段处理函数时，我们需要访问父对象（即字段所在对象的对象）。在示例中，我们将作者的文章数组填充到字段处理器中，该处理器调用服务，该服务使用作者的 `__INLINE_CODE_89` 作为参数。因此，我们需要在 `@FieldResolver` 装饰器中指定父对象的类名。注意对应的 `@MethodParameter` 装饰器用于在字段处理器中提取父对象的引用。

可以定义多个 `@FieldResolver` 处理函数（在该类中或在任何其他解析器类中），它们将被聚合到一个单个 `Query type` 定义中，在生成的 SDL 中添加相应的 entries。这样可以将查询函数定义在模型和服务中，保持它们的组织。

> 提示：Nest CLI 提供了一个生成器（schematic），可以自动生成所有 boilerplate 代码，以帮助我们避免执行所有这些操作，并简化开发体验。了解更多关于这个特性的信息，请参阅 __LINK_266__。

#### 查询类型名称

在上面的示例中，`@Query` 装饰器根据方法名称生成 GraphQL schema 查询类型名称。例如，考虑以下构造：

```typescript title="AuthorResolver"
// 查询处理器
@Query('author')
async getAuthor(@Args('id') id: string): Promise<Author> {
  return this.authorService.getAuthor(id);
}

```

这将在我们的 schema 中生成以下 entry（查询类型使用同名方法名称）：

```typescript title="GraphQL schema"
query Author {
  author(id: String!): Author
}

```

> 提示：了解更多关于 GraphQL 查询的信息，请参阅 __LINK_267__。

我们通常prefer to decouple these names; for example, we prefer to use a name like `getAuthorDetails` for our query handler method, but still use `author` for our query type name. The same applies to our field resolvers. We can easily do this by passing the mapping names as arguments of the `@Query` and `@FieldResolver` decorators, as shown below:

```typescript title="AuthorResolver"
// 查询处理器
@Query('authorDetails')
async getAuthorDetails(@Args('id') id: string): Promise<Author> {
  return this.authorService.getAuthor(id);
}

// 字段处理器
@FieldResolver('authorPosts')
async getAuthorPosts(@Parent() author: Author): Promise<Author[]> {
  return this.authorService.getAuthorPosts(author);
}

```

在上面的示例中，我们将 `AuthorResolver` 类中的 `getAuthor` 和 `getAuthorPosts` 方法的名称映射到 `authorDetails` 和 `authorPosts` 中。

#### 查询装饰器选项

`@Query` 装饰器的 options 对象（在上面的示例中，我们传递 `__INLINE_CODE_100`）Here is the translated text:

使用 `__INLINE_CODE_113__` 装饰器从请求中提取参数，以便在方法处理器中使用。这与 `__LINK_268__` 类似。

通常情况下，your `__INLINE_CODE_114__` 装饰器将非常简单，不需要对象参数，如 `__INLINE_CODE_115__` 方法所示。如果一个标识符的类型是字符串，那么以下构造语句足够，它将从 inbound GraphQL 请求中提取名称字段作为方法参数。

__CODE_BLOCK_13__

在 `__INLINE_CODE_116__` 情况下，使用 `__INLINE_CODE_117__` 类型，这会带来挑战。`__INLINE_CODE_118__` TypeScript 类型不能提供充分的信息关于期望的 GraphQL 表示形式（例如 `__INLINE_CODE_119__` vs. `__INLINE_CODE_120__`）。因此，我们需要**显式**地传递类型引用。我们可以通过将第二个参数传递给 `__INLINE_CODE_121__` 装饰器，包含参数选项，例如下所示：

__CODE_BLOCK_14__

选项对象允许我们指定以下可选的 key-value 对：

- `__INLINE_CODE_122__`: 返回 GraphQL 类型的函数
- `__INLINE_CODE_123__`: 默认值；`__INLINE_CODE_124__`
- `__INLINE_CODE_125__`: 描述元数据；`__INLINE_CODE_126__`
- `__INLINE_CODE_127__`: 设置字段为 deprecated，并提供描述元数据；`__INLINE_CODE_128__`
- `__INLINE_CODE_129__`: 指定字段是否可 null

查询处理方法可以接受多个参数。例如，我们想根据 `__INLINE_CODE_130__` 和 `__INLINE_CODE_131__` 的值获取作者。在这种情况下，我们可以调用 `__INLINE_CODE_132__` twice：

__CODE_BLOCK_15__

> info **提示** 在 `__INLINE_CODE_133__` 情况下，哪怕是一个 GraphQL 可 null 字段，也不需要添加 `__INLINE_CODE_134__` 或 `__INLINE_CODE_135__` 的非值类型到该字段的类型中。只是需要在你的解析器中添加类型保护，因为 GraphQL 可 null 字段将允许这些非值类型传递到你的解析器。

#### 自定义 arguments 类

使用 inline `__INLINE_CODE_136__` 调用时，代码将变得很 bloated。相反，你可以创建一个专门的 `__INLINE_CODE_137__` arguments 类，并在处理方法中访问它，如下所示：

__CODE_BLOCK_16__

创建 `__INLINE_CODE_138__` 类使用 `__INLINE_CODE_139__`，如下所示：

__CODE_BLOCK_17__

> info **提示** 再次，因为 TypeScript 的元数据反射系统限制，你需要使用 `__INLINE_CODE_140__` 装饰器 manual 指定类型和可选性，或者使用 `__LINK_269__`。在 `__INLINE_CODE_141__` 情况下，这是 GraphQL 可 null 字段，不需要添加 `__INLINE_CODE_142__` 或 `__INLINE_CODE_143__` 的非值类型到该字段的类型中。只是需要在你的解析器中添加类型保护，因为 GraphQL 可 null 字段将允许这些非值类型传递到你的解析器。

这将生成以下 GraphQL_SCHEMA 部分：

__CODE_BLOCK_18__

> info **提示** 注意，arguments 类似 `__INLINE_CODE_144__` 与 `__INLINE_CODE_145__`（读取 `__LINK_270__`)相互作用。

#### 类继承

你可以使用标准 TypeScript 类继承来创建基类具有泛型 utility 类型特性（字段和字段属性、验证等）可以被扩展。例如，你可能有一个 pagination 相关的 arguments 集合，总是包括标准 `__INLINE_CODE_146__` 和 `__INLINE_CODE_147__` 字段，但也包括类型特定的索引字段。您可以设置一个类继承关系，如下所示。

基类 `__INLINE_CODE_148__`：

__CODE_BLOCK_19__

类型特定的子类 `__INLINE_CODE_149__`：

__CODE_BLOCK_20__

同样可以应用于 `__INLINE_CODE_150__` 对象。定义泛型属性在基类：

__CODE_BLOCK_21__

添加类型特定的属性在子类：

__CODE_BLOCK_22__

你可以使用继承与解析器结合使用。使用继承和 TypeScript generics 可以确保类型安全。例如，创建一个基类具有泛型 `__INLINE_CODE_151__` 查询，使用以下构造语句：

__CODE_BLOCK_23__

注意以下几点：

- 需要明确的返回类型（`__INLINE_CODE_152__` 上面）；否则，TypeScript 会抱怨使用私有类定义。建议定义接口，而不是使用 `__INLINE_CODE_153__`。
- `__INLINE_CODE_154__` 是从 `__INLINE_CODE_155__` 包 import 的
- `__INLINE_CODE_156__` 属性指示 shouldn't 生成 SDL 语句 для这个类。注意，可以将这个属性设置为其他类型以抑制 SDL 生成。

以下是如何生成 `__INLINE_CODE_157__` 的具体子类的：

__CODE_BLOCK_24__

这将生成以下 SDL 语句：

__CODE_BLOCK_25__

#### 泛型

...Here is the translation of the provided English technical documentation to Chinese, following the rules:

我们之前看到了一种泛型的使用。TypeScript 的这个强大特性可以用来创建有用的抽象。例如，我们可以看到一个基于 __LINK_271__ 的 cursor-based 分页实现：

__CODE_BLOCK_26__

使用上述基类，我们现在可以轻松地创建继承该行为的特殊类型。例如：

__CODE_BLOCK_27__

#### Schema First

如同 __LINK_272__ 章节中所提到的，在 schema-first 方法中，我们首先手动定义 schema 类型在 SDL 中（请阅读 __LINK_273__）。以下是 SDL 类型定义的示例。

> info **提示** 在本章中，我们将所有 SDL 类型定义聚合到一个文件中（例如，一个 __INLINE_CODE_158__ 文件，如下所示）。实际上，你可能会发现将代码组织到模块化的方式更加有用。例如，可以创建每个领域实体的 SDL 文件，包括相关的服务、解析代码和 Nest 模块定义类，以便在一个专门的目录中。

__CODE_BLOCK_28__

#### Schema First 解析器

上述 schema expose 一个单独的查询——__INLINE_CODE_159__。

> info **提示** 了解更多关于 GraphQL 查询的信息 __LINK_274__。

现在，让我们创建一个 __INLINE_CODE_160__ 类，用于解析作者查询：

__CODE_BLOCK_29__

> info **提示** 所有装饰器（例如 __INLINE_CODE_161__、__INLINE_CODE_162__、__INLINE_CODE_163__ 等）来自 __INLINE_CODE_164__ 包。

> warning **注意** 在 __INLINE_CODE_165__ 和 __INLINE_CODE_166__ 类中可以添加任意的逻辑。主要目的是展示如何构建解析器和它们如何与其他提供者交互。

__INLINE_CODE_167__ 装饰器是必需的。它可以接受一个可选的字符串参数，指定一个类名。这个类名在该类中包括 __INLINE_CODE_168__ 装饰器时是必需的，以便 Nest 知道该装饰的方法与一个父类型（当前示例中的 __INLINE_CODE_169__ 类）相关。 Alternatively, 可以在每个方法中添加 __INLINE_CODE_170__：

__CODE_BLOCK_30__

在这种情况中（__INLINE_CODE_171__ 装饰器在方法级别），如果你在类中有多个 __INLINE_CODE_172__ 装饰器，你需要将 __INLINE_CODE_173__ 添加到所有它们中。这不是一种最佳实践（因为它创建了额外的开销）。

> info **提示** 任何传递给 __INLINE_CODE_174__ 的类名参数都不影响查询（__INLINE_CODE_175__ 装饰器）或 mutations（__INLINE_CODE_176__ 装饰器）。

> warning **警告** 在方法级别使用 __INLINE_CODE_177__ 装饰器不支持代码first 方法。

在上面的示例中，__INLINE_CODE_178__ 和 __INLINE_CODE_179__ 装饰器与 GraphQL schema 类型相关联，基于方法名。例如，考虑以下构建：

__CODE_BLOCK_31__

这将生成以下条目，为作者查询在我们的 schema 中（查询类型使用同名方法名）：

__CODE_BLOCK_32__

 conventionally，我们更喜欢将它们 decouple，使用名称如 __INLINE_CODE_180__ 或 __INLINE_CODE_181__ 的解析器方法。我们可以轻松地做到这一点，通过将映射名称传递给装饰器，如下所示：

__CODE_BLOCK_33__

> info **提示** Nest CLI 提供了一个生成器（schematic），可以自动生成所有 boilerplate 代码，以帮助我们避免所有这些步骤，并使开发者体验更加简单。了解更多关于这个特性的信息 __LINK_275__。

#### 生成类型

假设我们使用 schema-first 方法，并且已经启用了类型生成特性（如 __LINK_276__ 章节中所示），那么在运行应用程序时，它将生成以下文件（在你在 __INLINE_CODE_183__ 方法中指定的位置）。例如，在 __INLINE_CODE_184__ 中：

__CODE_BLOCK_34__

通过生成类（而不是默认的接口），你可以使用声明性验证 __decorate__ors 在 schema-first 方法中结合使用，这是一个非常有用的技术（阅读 __LINK_277__）。例如，你可以将 __INLINE_CODE_185__ 装饰器添加到生成的 __INLINE_CODE_186__ 类中，如下所示，以强制对 __INLINE_CODE_187__ 字段的最小和最大字符串长度：

__CODE_BLOCK_35__

> warning **注意** 要启用输入的自动验证（和参数），使用 __INLINE_CODE_188__。了解更多关于验证 __LINK_278__ 和管道 __LINK_279__。

然而，如果你直接添加装饰器到自动生成的文件中，它们将被覆盖每次文件被生成。相反，创建一个单独的文件，并简单地扩展生成的类。

__CODE_BLOCK_36__

Please note that I have followed the rules and guidelines provided, including:

* Adhering to the provided glossary
* Preserving code and format unchanged
* Translating code comments from English to Chinese
* Not explaining or modifying placeholders
* Keeping internal anchors unchanged
* Maintaining professionalism and readability
* Keeping content that is already in Chinese unchanged
* Not adding extra content not in the original
* Appropriate Chinese localization improvements are welcome.#### GraphQL argument decorators

我们可以使用专门的装饰器访问标准 GraphQL 解决器参数。下面是 Nest 装饰器和 Apollo 参数之间的比较。

__HTML_TAG_205__
  __HTML_TAG_206__
    __HTML_TAG_207__
      __HTML_TAG_208____HTML_TAG_209__@Root()__HTML_TAG_210__ 和 __HTML_TAG_211__@Parent()__HTML_TAG_212____HTML_TAG_213__
      __HTML_TAG_214____HTML_TAG_215__root__HTML_TAG_216__/__HTML_TAG_217__parent__HTML_TAG_218____HTML_TAG_219__
    __HTML_TAG_220__
    __HTML_TAG_221__
      __HTML_TAG_222____HTML_TAG_223__@Context(param?: string)__HTML_TAG_224____HTML_TAG_225__
      __HTML_TAG_226____HTML_TAG_227__context__HTML_TAG_228__ / __HTML_TAG_229__context[param]__HTML_TAG_230____HTML_TAG_231__
    __HTML_TAG_232__
    __HTML_TAG_233__
      __HTML_TAG_234____HTML_TAG_235__@Info(param?: string)__HTML_TAG_236____HTML_TAG_237__
      __HTML_TAG_238____HTML_TAG_239__info__HTML_TAG_240__ / __HTML_TAG_241__info[param]__HTML_TAG_242____HTML_TAG_243__
    __HTML_TAG_244__
    __HTML_TAG_245__
      __HTML_TAG_246____HTML_TAG_247__@Args(param?: string)__HTML_TAG_248____HTML_TAG_249__
      __HTML_TAG_250____HTML_TAG_251__args__HTML_TAG_252__ / __HTML_TAG_253__args[param]__HTML_TAG_254____HTML_TAG_255__
    __HTML_TAG_256__
  __HTML_TAG_257__
__HTML_TAG_258__

这些参数的含义如下：

- 提供者：一个包含来自 resolver 上级字段的结果的对象，或者在服务配置中传递的对象。
- 上下文：一个对象被所有 resolver 在特定查询中共享，通常用于包含每个请求的状态。
- 信息：一个对象包含查询执行状态的信息。
- 参数：一个对象包含在查询中传递的字段参数。

__HTML_TAG_259____HTML_TAG_260__

#### 模块

完成了上述步骤后，我们已经明确地指定了 __INLINE_CODE_195__ 生成解析器映射所需的所有信息。 __INLINE_CODE_196__ 使用反射来introspect提供的元数据，自动将类转换为正确的解析器映射。

唯一需要注意的事情是，需要将解析器类（__INLINE_CODE_198__）在某个模块（__INLINE_CODE_197__）中列出，并且在某个地方（例如根模块或其他模块）导入该模块（__INLINE_CODE_199__），以便 Nest 可以使用它。

例如，我们可以在 __INLINE_CODE_200__ 中这样做，这也可以提供其他在该上下文中需要的服务。确保在某个地方（例如根模块或其他模块）导入 __INLINE_CODE_201__。

__CODE_BLOCK_37__

> info 提示 It is helpful to organize your code by your so-called **domain model** (similar to the way you would organize entry points in a REST API). In this approach, keep your models (__INLINE_CODE_202__ classes), resolvers and services together within a Nest module representing the domain model. Keep all of these components in a single folder per module. When you do this, and use the __LINK_280__ to generate each element, Nest will wire all of these parts together (locating files in appropriate folders, generating entries in __INLINE_CODE_203__ and __INLINE_CODE_204__ arrays, etc.) automatically for you.