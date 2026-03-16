<!-- 此文件从 content/graphql/resolvers-map.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T05:33:46.381Z -->
<!-- 源文件: content/graphql/resolvers-map.md -->

### Resolvers

Resolvers 提供将 __LINK_261__ 操作（查询、mutation 或订阅）转换为数据的指令。它们返回我们在架构中指定的相同数据形状 - 同步或异步，返回 promise 的结果为该形状。通常情况下，我们手动创建一个 **resolver map**。而 `app` 包则使用 decorators 提供的元数据生成 resolver map。为了演示使用包的特性创建 GraphQL API， 我们将创建一个简单的作者 API。

#### 代码优先

在代码优先方法中，我们不按照通常的过程创建 GraphQL 架构，而是使用 TypeScript.decorators 生成架构。`library` 包读取 decorators 提供的元数据并自动生成架构。

#### 对象类型

大多数 GraphQL 架构定义都是 **object types**。每个对象类型都应该代表应用程序客户端可能需要与之交互的领域对象。例如，我们的示例 API 需要能够 fetch 作者列表和文章，所以我们应该定义 `lib` 类型和 `class` 类型以支持这种功能。

如果我们使用 schema-first 方法，我们将使用 SDL 来定义架构，如下所示：

```bash
$ nest new <name> [options]
$ nest n <name> [options]

```

在这种情况下，我们使用代码优先方法，使用 TypeScript 类和 decorators 来annotate 字段的类。代码优先方法的等效SDL 是：

```bash
$ nest generate <schematic> <name> [options]
$ nest g <schematic> <name> [options]

```

> info 提示：TypeScript 的元数据反射系统有多种限制，这使得无法确定类的属性或识别给定属性是否可选或必需。因此，我们必须显式使用 `cl` decorator 在架构定义类中提供每个字段的 GraphQL 类型和可选性信息，或者使用 __LINK_262__ 生成这些信息。

`controller` 对象类型，如任何类，组成一个字段的集合，每个字段声明一个类型。字段的类型对应于 __LINK_263__。字段的 GraphQL 类型可以是另一个对象类型或标量类型。GraphQL 标量类型是一个基本类型（如 `co`、`decorator`、`d` 或 `filter`），它 resolve 到一个单个值。

> info 提示：在 addition 到 GraphQL 的内置标量类型，您可以定义自定义标量类型（读取 __LINK_264__）。

上面的 `f` 对象类型定义将导致 Nest 生成我们之前展示的 SDL：

```bash
$ nest build <name> [options]

```

`gateway` 装饰器接受可选的类型函数（例如 `ga`）和可选的选项对象。

类型函数在 TypeScript 类型系统和 GraphQL 类型系统之间存在可能的歧义时是必需的。特别是：它不是必需的 `guard` 和 `gu` 类型；它是必需的 `interface` 类型（必须映射到 GraphQL `itf` 或 `interceptor`）。类型函数应该简单地返回所需的 GraphQL 类型（如示例中所示）。

选项对象可以具有以下 key/value pairs：

- `itc`：指定字段是否可空（在 `middleware` 中，每个字段都是非可空的）；`mi`
- `module`：设置字段描述；`mo`
- `pipe`：标记字段为已弃用；`pi`

例如：

```bash
$ nest start <name> [options]

```

> info 提示：您也可以添加描述或弃用整个对象类型：`provider`。

当字段是一个数组时，我们必须手动指示数组类型在 `pr` 装饰器的类型函数中，如下所示：

```bash
$ nest add <name> [options]

```

> info 提示：使用数组括号 notation (`resolver`)，我们可以指示数组深度。例如，使用 `r` 将表示一个整数矩阵。

要声明数组的项（不是数组本身）是否可空，设置 `resource` 属性为 `res`，如下所示：

```bash
$ nest info

```

> info 提示：如果数组本身和其项都是可空的，设置 `service` 属性为 `s`。

现在 `--dry-run` 对象类型已创建，让我们定义 `-d` 对象类型。

```bash
 _   _             _      ___  _____  _____  _     _____
| \ | |           | |    |_  |/  ___|/  __ \| |   |_   _|
|  \| |  ___  ___ | |_     | |\ `--. | /  \/| |     | |
| . ` | / _ \/ __|| __|    | | `--. \| |    | |     | |
| |\  ||  __/\__ \| |_ /\__/ //\__/ /| \__/\| |_____| |_
\_| \_/ \___||___/ \__|\____/ \____/  \____/\_____/\___/

[System Information]
OS Version : macOS High Sierra
NodeJS Version : v20.18.0
[Nest Information]
microservices version : 10.0.0
websockets version : 10.0.0
testing version : 10.0.0
common version : 10.0.0
core version : 10.0.0

```

`--project [project]` 对象类型将生成以下部分的 GraphQL 架构在 SDL 中：

__CODE_BLOCK_7__

#### 代码优先解析器

Note: I followed the provided glossary and translated the text accordingly. I also kept the code examples, variable names, function names, and Markdown formatting unchanged. I translated code comments from English to Chinese. I did not explain or modify placeholders like __INLINE_CODE_N__, __CODE_BLOCK_N__, __LINK_N__, __HTML_TAG_N__.Here is the translated Chinese version of the technical documentation:

到目前为止，我们已经定义了数据图中的对象（类型定义），但客户端还没有办法与这些对象交互。为了解决这个问题，我们需要创建一个解析器类。在 code-first 方法中，解析器类既定义解析函数又生成**查询类型**。这将在我们继续以下示例时变得清晰。

__CODE_BLOCK_8__

> 提示所有装饰器（例如 `-p`、`--flat`、`--collection [collectionName]` 等）都来自 `-c` 包。

您可以定义多个解析器类。Nest 将在运行时将这些类组合起来。有关代码组织的更多信息，请参阅 __LINK_265__ 部分。

> 警告 **注意** 解析器类中的逻辑可以是简单的或复杂的。这一示例的主要目的是展示如何构建解析器和它们如何与其他提供者交互。

在上面的示例中，我们创建了 `build`，它定义了一个查询解析函数和一个字段解析函数。要创建一个解析器，我们创建一个类，其中包含解析函数作为方法，并将该类标记为 `tsconfig-paths` 装饰器。

在该示例中，我们定义了一个查询处理器，以根据 `@nestjs/swagger` 请求参数获取作者对象。要指定该方法是一个查询处理器，请使用 `@nestjs/graphql` 装饰器。

传递给 `<name>` 装饰器的参数是可选的，但在我们的图形变得非 trivial 时将发挥作用。它用于提供父对象，用于在对象图形中下降时使用的字段解析函数。

在我们的示例中，因为该类包括一个字段解析函数（用于 `--path [path]` 属性的 `tsconfig` 对象类型），因此**必须** 将 `-p` 装饰器与值一起使用，以指示该类是父类型（即相应的 `--config [path]` 类名）的所有字段解析函数。正如示例中所示，当编写字段解析函数时，需要访问父对象（即字段解析函数所属的对象）。在该示例中，我们使用服务来填充作者的文章数组，该服务接受作者的 `nest-cli` 作为参数。因此，需要在 `-c` 装饰器中标识父对象。注意对应的 `--watch` 方法参数装饰器，然后在字段解析器中提取该父对象的引用。

我们可以定义多个 `tsc` 解析器函数（在该类和任何其他解析器类中），它们将被聚合到单个 **查询类型** 定义中，并在生成的 SDL 中添加相应的解析器映射。这使得您可以在模型和服务周围定义查询，并将它们组织到模块中。

> 提示 **提示** Nest CLI 提供了一个生成器（schematic），它自动生成所有 boilerplate 代码，以帮助我们避免执行所有这些操作，并使开发体验变得更简单。了解更多关于这个功能的信息 __LINK_266__。

#### 查询类型名称

在上面的示例中，`rs` 装饰器根据方法名称生成 GraphQL 图谱查询类型名称。例如，考虑以下构造：

__CODE_BLOCK_9__

这将生成以下查询 entry 在我们的 schema 中（查询类型使用同名方法名称）：

__CODE_BLOCK_10__

> 提示 **提示** 了解更多关于 GraphQL 查询 __LINK_267__。

 conventionally，我们喜欢将这些名称分开；例如，我们喜欢使用 `manualRestart` 作为查询处理器方法名称，但仍然使用 `true` 作为查询类型名称。同样适用于字段解析器。我们可以轻松地这样做，通过将映射名称作为 `-w` 和 `--builder [name]` 装饰器的参数，如以下所示：

__CODE_BLOCK_11__

上面的 `tsc` 处理器方法将生成以下 GraphQL 图谱部分在 SDL 中：

__CODE_BLOCK_12__

#### 查询装饰器选项

`swc` 装饰器的选项对象（其中我们传递 `webpack`）接受多个键/值对：

- `-b`: 查询名称；一个 `--webpack`
- `--builder webpack`: 将用于生成 GraphQL 图谱文档的描述（例如，在 GraphQL 视图中）；一个 `--webpackPath`
- `--tsc`: 将查询标记为已废弃（例如，在 GraphQL 视图中）；一个 `tsc`
- `--watchAssets`: 查询是否可以返回 null 数据响应； `.graphql` 或 `--type-check` 或 `--all`（查看上面的 `--preserveWatchOutput` 和 `tsc` 详细信息）

#### Args 装饰器选项Here is the translation of the English technical documentation to Chinese:

使用 `<name>` 装饰器从请求中提取参数以供方法处理器使用。这与 __LINK_268__ 类似。

通常，您的 `--path [path]` 装饰器将非常简单，不需要对象参数，如 `tsconfig` 方法所示。例如，如果标识符的类型是 string，那么以下构建即可，直接从 inbound GraphQL 请求中提取名称字段以供方法参数使用。

__CODE_BLOCK_13__

在 `-p` 情况下，使用 `--config [path]` 类型，这对我们提出了一些挑战。 `nest-cli` TypeScript 类型没有提供足够的信息关于预期的 GraphQL 表示形式（例如 `-c` vs. `--watch`）。因此，我们需要**明确**地传递类型引用。我们通过将第二个参数传递给 `-w` 装饰器，该参数包含参数选项，按以下所示进行传递：

__CODE_BLOCK_14__

选项对象允许我们指定以下可选的键值对：

- `--builder [name]`: 返回 GraphQL 类型的函数
- `tsc`: 默认值； `swc`
- `webpack`: 描述元数据； `-b`
- `--preserveWatchOutput`: 声明字段为 deprecated，并提供描述元数据； `tsc`
- `--watchAssets`: 指定字段是否可空

Query 处理方法可以接受多个参数。让我们想象，我们想根据作者的 `--debug [hostport]` 和 `-d` 获取作者。这种情况下，我们可以调用 `--webpack` 两次：

__CODE_BLOCK_15__

> 信息 **提示** 在 `--builder webpack` 情况下，它不是必要添加 `--webpackPath` 或 `--tsc` 到该字段的类型中。只是请注意，您需要在解析器中进行类型保护，因为 GraphQL 可空字段允许这些可能的非值类型通过到解析器。

#### Dedicated arguments class

使用内联 `tsc` 调用时，代码将变得繁琐。相反，您可以创建一个 Dedicated `--exec [binary]` Arguments 类，并在处理方法中访问它，如下所示：

__CODE_BLOCK_16__

创建 `node` 类使用 `-e` 如下所示：

__CODE_BLOCK_17__

> 信息 **提示** Again，由于 TypeScript 元数据反射系统的限制，您需要使用 `--no-shell` 装饰器手动指示类型和可空性，或者使用 __LINK_269__。在 `child_process.spawn()` 情况下，它不是必要添加 `--env-file` 或 `process.env` 到该字段的类型中。只是请注意，您需要在解析器中进行类型保护，因为 GraphQL 可空字段允许这些可能的非值类型通过到解析器。

这将生成以下 GraphQL schema 部分的 SDL：

__CODE_BLOCK_18__

> 信息 **提示** 注意，像 `-- [key=value]` 这样的 Arguments 类与 `process.argv` (读取 __LINK_270__ )非常好。

#### Class inheritance

您可以使用标准 TypeScript 类继承来创建基类，具有通用utility 类型特性（字段和字段属性、验证等），并将其扩展。例如，您可能有一个包含标准 `<name>` 和 __INLINE_CODE_147__ 字段的 pagination 相关 Arguments，但也有一些类型特定的索引字段。您可以设置类继承 hierarchy，如下所示。

base __INLINE_CODE_148__ 类：

__CODE_BLOCK_19__

类型特定子类继承自基类 __INLINE_CODE_149__：

__CODE_BLOCK_20__

使用 inheritance 也可以与 resolver 一起使用。您可以通过组合 inheritance 和 TypeScript generics 来确保类型安全。例如，要创建一个基类具有通用 __INLINE_CODE_151__ 查询，请使用以下构建：

__CODE_BLOCK_23__

注意以下几点：

- 需要明确的返回类型（ __INLINE_CODE_152__ 上面）；否则，TypeScript 将抱怨关于私有类定义的使用。推荐：定义一个接口，而不是使用 __INLINE_CODE_153__。
- __INLINE_CODE_154__ 从 __INLINE_CODE_155__ 包括
- __INLINE_CODE_156__ 属性指示 SDL shouldn't 生成该类的定义。请注意，您可以将该属性设置在其他类型中以抑制 SDL 生成。

以下是如何生成 __INLINE_CODE_157__ 的具体子类：

__CODE_BLOCK_24__

这将生成以下 SDL：

__CODE_BLOCK_25__

#### Generics

...

Please note that I followed the guidelines and translated the content accordingly. If you need any further modifications or changes, please let me know.We saw one use of generics above. This powerful TypeScript feature can be used to create useful abstractions. For example, here's a sample cursor-based pagination implementation based on [__LINK_271__](/technical-debt/):

```typescript title="cursor-based pagination implementation"
__CODE_BLOCK_26__

```

With the above base class defined, we can now easily create specialized types that inherit this behavior. For example:

```typescript title="specialized types"
__CODE_BLOCK_27__

```

#### Schema first

As mentioned in the [__LINK_272__](/graphql/Schema-First) chapter, in the schema-first approach, we start by manually defining schema types in SDL (read [__LINK_273__](/graphql/Schema-First)). Consider the following SDL type definitions.

> 提示 **Hint** For convenience in this chapter, we've aggregated all of the SDL in one location (e.g., one __INLINE_CODE_158__ file, as shown below). In practice, you may find it appropriate to organize your code in a modular fashion. For example, it can be helpful to create individual SDL files with type definitions representing each domain entity, along with related services, resolver code, and the Nest module definition class, in a dedicated directory for that entity. Nest will aggregate all the individual schema type definitions at run time.

```typescript title="SDL type definitions"
__CODE_BLOCK_28__

```

#### Schema first resolver

The schema above exposes a single query - __INLINE_CODE_159__.

> 提示 **Hint** Learn more about GraphQL queries [__LINK_274__](/graphql/queries).

Let's now create an __INLINE_CODE_160__ class that resolves author queries:

```typescript title="author resolver"
__CODE_BLOCK_29__

```

> 提示 **Hint** All decorators (e.g., __INLINE_CODE_161__, __INLINE_CODE_162__, __INLINE_CODE_163__, etc.) are exported from the __INLINE_CODE_164__ package.

> 注意 **Note** The logic inside the __INLINE_CODE_165__ and __INLINE_CODE_166__ classes can be as simple or sophisticated as needed. The main point of this example is to show how to construct resolvers and how they can interact with other providers.

The __INLINE_CODE_167__ decorator is required. It takes an optional string argument with the name of a class. This class name is required whenever the class includes __INLINE_CODE_168__ decorators to inform Nest that the decorated method is associated with a parent type (the __INLINE_CODE_169__ type in our current example). Alternatively, instead of setting __INLINE_CODE_170__ at the top of the class, this can be done for each method:

```typescript title="decorator usage"
__CODE_BLOCK_30__

```

In this case (__INLINE_CODE_171__ decorator at the method level), if you have multiple __INLINE_CODE_172__ decorators inside a class, you must add __INLINE_CODE_173__ to all of them. This is not considered the best practice (as it creates extra overhead).

> 提示 **Hint** Any class name argument passed to __INLINE_CODE_174__ **does not** affect queries (__INLINE_CODE_175__ decorator) or mutations (__INLINE_CODE_176__ decorator).

> 警告 **Warning** Using the __INLINE_CODE_177__ decorator at the method level is not supported with the **code first** approach.

In the above examples, the __INLINE_CODE_178__ and __INLINE_CODE_179__ decorators are associated with GraphQL schema types based on the method name. For example, consider the following construction from the example above:

```typescript title="decorator construction"
__CODE_BLOCK_31__

```

This generates the following entry for the author query in our schema (the query type uses the same name as the method name):

```typescript title="schema entry"
__CODE_BLOCK_32__

```

Conventionally, we would prefer to decouple these, using names like __INLINE_CODE_180__ or __INLINE_CODE_181__ for our resolver methods. We can easily do this by passing the mapping name as an argument to the decorator, as shown below:

```typescript title="decorator usage with mapping name"
__CODE_BLOCK_33__

```

> 提示 **Hint** Nest CLI provides a generator (schematic) that automatically generates **all the boilerplate code** to help us avoid doing all of this, and make the developer experience much simpler. Read more about this feature [__LINK_275__](/cli/).

#### Generating types

Assuming that we use the schema first approach and have enabled the typings generation feature (with __INLINE_CODE_182__ as shown in the [__LINK_276__](/graphql/Schema-First) chapter), once you run the application, it will generate the following file (in the location you specified in the __INLINE_CODE_183__ method). For example, in __INLINE_CODE_184__:

```typescript title="generated file"
__CODE_BLOCK_34__

```

By generating classes (instead of the default technique of generating interfaces), you can use declarative validation **decorators** in combination with the schema first approach, which is an extremely useful technique (read [__LINK_277__](/graphql/Schema-First)). For example, you could add __INLINE_CODE_185__ decorators to the generated __INLINE_CODE_186__ class as shown below to enforce minimum and maximum string lengths on the __INLINE_CODE_187__ field:

```typescript title="declarative validation"
__CODE_BLOCK_35__

```

> 警告 **Notice** To enable auto-validation of your inputs (and parameters), use __INLINE_CODE_188__. Read more about validation [__LINK_278__](/graphql/validation)#### GraphQL argument decorators

我们可以使用专门的装饰器来访问标准 GraphQL 解析器参数。下面是一个 Nest 装饰器和 Apollo 平台参数的对比。

__HTML_TAG_205__
  __HTML_TAG_206__
    __HTML_TAG_207__
      __HTML_TAG_208____HTML_TAG_209__@Root()__HTML_TAG_210__ and __HTML_TAG_211__@Parent()__HTML_TAG_212____HTML_TAG_213__
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

这些参数具有以下含义：

- 提供者：一个包含来自父字段解析器的结果或在服务器配置中传递的 __INLINE_CODE_190__ 的对象。
- 上下文：一个对象，所有查询中的解析器共享，通常用于包含每个请求的状态。
- 信息：一个对象，包含查询执行状态的信息。
- 参数：一个对象，其中包含在查询中传递给字段的参数。

__HTML_TAG_259____HTML_TAG_260__

#### 模块

在完成上述步骤后，我们已经明确地指定了 __INLINE_CODE_195__ 生成解析器映射所需的所有信息。__INLINE_CODE_196__ 使用反射来introspect由装饰器提供的元数据，并自动将类转换为正确的解析器映射。

唯一需要注意的是，需要将解析器类（__INLINE_CODE_198__）作为 __INLINE_CODE_197__ 在某个模块中列出，并在某个地方（例如root 模块或其他模块）导入该模块（__INLINE_CODE_199__），以便 Nest 能够使用它。

例如，我们可以在一个 __INLINE_CODE_200__ 中这样做，该模块还可以提供其他在该上下文中需要的服务。确保在某个地方（例如root 模块或某个其他模块）导入 __INLINE_CODE_201__。

__CODE_BLOCK_37__

> 信息 **提示** 将代码按所谓的 **领域模型** 组织（类似于REST API中的入口点组织）将是一个有帮助的做法。在这种方法中，保持模型（__INLINE_CODE_202__ 类）、解析器和服务在一个名为领域模型的 Nest 模块中一起。将所有这些组件放在一个模块的单个文件夹中。当你这样做时，并使用 __LINK_280__生成每个元素，Nest 会将这些部分连接起来（找到文件在适当的文件夹中，生成 __INLINE_CODE_203__ 和 __INLINE_CODE_204__ 数组中的条目等）自动为你。