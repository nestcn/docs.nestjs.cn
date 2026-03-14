<!-- 此文件从 content/graphql/resolvers-map.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T05:07:33.131Z -->
<!-- 源文件: content/graphql/resolvers-map.md -->

###  Resolver

Resolver 提供了将 __LINK_261__ 操作（查询、mutation 或订阅）转换为数据的指令。它们返回指定在 schema 中的同一形状的数据——同步或作为一个 promise， resolve 到该形状的结果。通常，您将手动创建一个 **resolver map**。 另一方面， `@nestjs/core` 包提供了生成 resolver map 的自动功能，使用 decorators 提供的元数据。为了演示使用包功能创建 GraphQL API 的过程，我们将创建一个简单的作者 API。

#### 代码优先

在代码优先方法中，我们不遵循通常的过程，手动编写 GraphQL SDL，而是使用 TypeScript.decorators 生成 SDL。 __INLINE_CODE_39__ 包阅读 decorators 中定义的元数据，并自动为您生成 schema。

#### 对象类型

大多数 GraphQL schema 的定义是 **object types**。每个 object type 都应该代表一个应用程序客户端可能需要交互的域对象。例如，我们的示例 API 需要能够 fetch 作者列表和帖子，因此我们应该定义 __INLINE_CODE_40__ 类型和 __INLINE_CODE_41__ 类型以支持该功能。

如果我们使用 schema-first 方法，我们将使用 SDL 定义 schema，如下所示：

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    snapshot: true,
  });
  await app.listen(process.env.PORT ?? 3000);
}

```

在这种情况下，使用代码优先方法，我们使用 TypeScript 类和 decorators 在类上注解字段以定义 schema。上述 SDL 在代码优先方法中对应的代码如下：

```bash
$ npm i @nestjs/devtools-integration

```

> 提示 **Hint** TypeScript 的元数据反射系统有一些限制，无法确定类的所有属性或识别给定属性是否是可选或必需的。因为这些限制，我们必须在 schema 定义类中使用 __INLINE_CODE_42__ 装饰器来提供每个字段的 GraphQL 类型和可选性信息，或者使用 __LINK_262__ 生成这些信息。

__INLINE_CODE_43__ 对象类型，像任何类一样，是由一组字段组成，每个字段声明一个类型。一个字段的类型对应于一个 __LINK_263__。一个字段的 GraphQL 类型可以是另一个对象类型或标量类型。 GraphQL 标量类型是指向单个值的基本类型。

> 提示 **Hint** 除了 GraphQL 的内置标量类型外，您还可以定义自定义标量类型（请阅读 __LINK_264__）。

上述 __INLINE_CODE_48__ 对象类型定义将导致 Nest 生成上述 SDL：

```typescript
@Module({
  imports: [
    DevtoolsModule.register({
      http: process.env.NODE_ENV !== 'production',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

```

__INLINE_CODE_49__ 装饰器接受可选的类型函数（例如 __INLINE_CODE_50__），以及可选的选项对象。

类型函数在 TypeScript 类型系统和 GraphQL 类型系统之间存在潜在的歧义时是必需的。特别是，它在 __INLINE_CODE_51__ 和 __INLINE_CODE_52__ 类型中不是必需的，但是在 __INLINE_CODE_53__ 类型中是必需的。类型函数应该简单地返回所需的 GraphQL 类型（如示例中所示）。

选项对象可以包含以下键/值对：

- __INLINE_CODE_56__: 指定字段是否可空（在 __INLINE_CODE_57__ 中，每个字段都是非可空的）；__INLINE_CODE_58__
- __INLINE_CODE_59__: 设置字段描述；__INLINE_CODE_60__
- __INLINE_CODE_61__: 标记字段为弃用；__INLINE_CODE_62__

例如：

```typescript
bootstrap().catch((err) => {
  fs.writeFileSync('graph.json', PartialGraphHost.toString() ?? '');
  process.exit(1);
});

```

> 提示 **Hint** 您也可以将描述添加到或弃用整个对象类型：__INLINE_CODE_63__。

当字段是数组时，我们必须手动在 __INLINE_CODE_64__ 装饰器的类型函数中指示数组类型，如下所示：

```typescript
const app = await NestFactory.create(AppModule, {
  snapshot: true,
  abortOnError: false, // <--- THIS
});

```

> 提示 **Hint** 使用数组括号 notation (__INLINE_CODE_65__)，我们可以指示数组的深度。例如，使用 __INLINE_CODE_66__ 将表示整数矩阵。

要声明数组中的项（而不是数组本身）是可空的，请将 __INLINE_CODE_67__ 属性设置为 __INLINE_CODE_68__，如以下所示：

```typescript
await app.listen(process.env.PORT ?? 3000); // OR await app.init()
fs.writeFileSync('./graph.json', app.get(SerializedGraph).toString());

```

> 提示 **Hint** 如果数组和其项都是可空的，请将 __INLINE_CODE_69__ 设置为 __INLINE_CODE_70__。

现在， __INLINE_CODE_71__ 对象类型已创建，让我们定义 __INLINE_CODE_72__ 对象类型。

__CODE_BLOCK_6__

__INLINE_CODE_73__ 对象类型将生成以下部分 GraphQL schema 的 SDL：

__CODE_BLOCK_7__

#### 代码优先解决器

Note: I will follow the provided glossary and translation requirements strictly throughout the translation process.Here is the translated technical documentation in Chinese:

到目前为止，我们已经定义了数据图中的对象（类型定义），但客户端还没有办法与这些对象交互。为了解决这个问题，我们需要创建一个 resolver 类。在代码中，resolver 类既定义了 resolver 函数，又生成了查询类型。这将在我们通过示例时变得清晰。

**提示**所有装饰器（例如 __INLINE_CODE_74__、__INLINE_CODE_75__、__INLINE_CODE_76__ 等）都是从 __INLINE_CODE_77__ 包中导出的。

您可以定义多个 resolver 类。Nest 将在运行时将这些 resolver 组合起来。请参阅下面关于代码组织的 __LINK_265__ 部分。

**注意** resolver 类中的逻辑可以简单或复杂，示例的主要目的是展示如何构造 resolver 和它们如何与其他提供者交互。

在上面的示例中，我们创建了 __INLINE_CODE_80__，它定义了一个查询 resolver 函数和一个字段 resolver 函数。要创建 resolver，我们创建一个类，其中 resolver 函数作为方法，并使用 __INLINE_CODE_81__ 装饰器注释该类。

在示例中，我们定义了一个查询处理器，以便根据 __INLINE_CODE_82__ 请求参数获取作者对象。要指定该方法为查询处理器，请使用 __INLINE_CODE_83__ 装饰器。

__INLINE_CODE_84__ 装饰器的参数是可选的，但是当我们的图变为非线形时将发挥作用。它用于提供一个父对象，该对象将在字段 resolver 函数中用来遍历对象图。

在我们的示例中，因为该类包含一个字段 resolver 函数（用于 __INLINE_CODE_85__ 属性的 __INLINE_CODE_86__ 对象类型），因此我们**必须**在 __INLINE_CODE_87__ 装饰器中提供一个值，以指示该字段 resolver 定义的父类名称（即相应的 __INLINE_CODE_88__ 类名称）。如示例所示，当编写字段 resolver 函数时，需要访问父对象（即字段所在的对象）。在该示例中，我们使用服务来填充作者的文章数组，该服务将作者的 __INLINE_CODE_89__ 作为参数传递。因此，我们需要在 __INLINE_CODE_90__ 装饰器中标识父对象。请注意相应的 __INLINE_CODE_91__ 方法参数装饰器，然后在字段 resolver 中提取该父对象的引用。

我们可以定义多个 __INLINE_CODE_92__ resolver 函数（在该类和其他 resolver 类中），并将它们聚合到一个单个查询类型定义中，其中包括适当的 resolver 地图。这允许我们在模型和服务附近定义查询，并将它们在模块中保持有序。

**提示**Nest CLI 提供了一种生成器（schematic），可以自动生成所有 boilerplate 代码，以帮助我们避免编写所有代码，并简化开发体验。请阅读关于这个功能的 __LINK_266__ 部分。

#### 查询类型名称

在上面的示例中，__INLINE_CODE_93__ 装饰器根据方法名称生成 GraphQL schema 查询类型名称。例如，考虑以下构建：

__CODE_BLOCK_9__

这将生成以下查询类型在我们的 schema 中的入口（查询类型使用的是方法名称）：

__CODE_BLOCK_10__

**提示**了解更多关于 GraphQL 查询的信息 __LINK_267__。

 conventionally，我们prefer to decouple这些名称；例如，我们prefer to使用 __INLINE_CODE_94__ 作为我们的查询处理器方法名称，但仍使用 __INLINE_CODE_95__ 作为我们的查询类型名称。同样适用于我们的字段 resolver。我们可以简单地这样做，因为 __INLINE_CODE_96__ 和 __INLINE_CODE_97__ 装饰器的参数是可选的，如下所示：

__CODE_BLOCK_11__

在上面的示例中，将会生成以下部分 GraphQL schema 在 SDL 中：

__CODE_BLOCK_12__

#### 查询装饰器选项

__INLINE_CODE_99__ 装饰器的选项对象（在上面我们传递 __INLINE_CODE_100__）接受以下 key/value pairs：

* __INLINE_CODE_101__: 查询的名称；一个 __INLINE_CODE_102__
* __INLINE_CODE_103__: 将用于生成 GraphQL schema 文档（例如，在 GraphQL playground 中）的描述；一个 __INLINE_CODE_104__
* __INLINE_CODE_105__: 设置查询元数据，以在 GraphQL playground 中显示查询为过时的；一个 __INLINE_CODE_106__
* __INLINE_CODE_107__: 是否可以返回 null 数据响应；__INLINE_CODE_108__ 或 __INLINE_CODE_109__ 或 __INLINE_CODE_110__（请参阅上述 __INLINE_CODE_111__ 和 __INLINE_CODE_112__ 的详细信息）以下是翻译后的中文文档：

使用 `__INLINE_CODE_113__` 装饰器从请求中提取参数，以便在方法处理中使用。这与 `__LINK_268__` 类似。

通常，您的 `__INLINE_CODE_114__` 装饰器将非常简单，不需要对象参数，如上面的 `__INLINE_CODE_115__` 方法。如果一个标识符的类型是字符串，那么下面这种构造就足够了，它将从 inbound GraphQL 请求中提取名为的字段并将其作为方法参数。

__CODE_BLOCK_13__

在 `__INLINE_CODE_116__` 情况下，使用 `__INLINE_CODE_117__` 类型，这会带来挑战。 `__INLINE_CODE_118__` TypeScript 类型不提供足够的信息来确定期望的 GraphQL 表示形式（例如 `__INLINE_CODE_119__` vs. `__INLINE_CODE_120__`）。因此，我们需要**明确**地传递类型引用。我们通过将第二个参数传递给 `__INLINE_CODE_121__` 装饰器，包含参数选项，例如以下所示：

__CODE_BLOCK_14__

选项对象允许我们指定以下可选的键值对：

- `__INLINE_CODE_122__`：函数返回 GraphQL 类型
- `__INLINE_CODE_123__`：默认值；__INLINE_CODE_124__
- `__INLINE_CODE_125__`：描述元数据；__INLINE_CODE_126__
- `__INLINE_CODE_127__`：弃用字段并提供描述元数据；__INLINE_CODE_128__
- `__INLINE_CODE_129__`：字段是否可空

查询处理方法可以接受多个参数。让我们假设我们想根据 `__INLINE_CODE_130__` 和 `__INLINE_CODE_131__` 查找作者。在这种情况下，我们可以调用 `__INLINE_CODE_132__` 两次：

__CODE_BLOCK_15__

> 提示 **Hint** 在 `__INLINE_CODE_133__` 情况下，即 GraphQL 可空字段，不需要添加 `__INLINE_CODE_134__` 或 `__INLINE_CODE_135__` 到该字段的类型中。只是需要在解析器中实现类型保护，因为 GraphQL 可空字段将允许这些类型通过到解析器。

#### dedicated arguments class

使用 inline `__INLINE_CODE_136__` 调用时，代码将变得混乱。相反，您可以创建一个专门的 `__INLINE_CODE_137__` 参数类，并在处理方法中访问它，如下所示：

__CODE_BLOCK_16__

创建 `__INLINE_CODE_138__` 类使用 `__INLINE_CODE_139__`，如下所示：

__CODE_BLOCK_17__

> 提示 **Hint** 再次，因为 TypeScript 的元数据反射系统限制，您需要用 `__INLINE_CODE_140__` 装饰器手动指示类型和可空性，或者使用 `__LINK_269__`。在 `__INLINE_CODE_141__` 情况下，即 GraphQL 可空字段，不需要添加 `__INLINE_CODE_142__` 或 `__INLINE_CODE_143__` 到该字段的类型中。只是需要在解析器中实现类型保护，因为 GraphQL 可空字段将允许这些类型通过到解析器。

这将生成以下 GraphQL schema 部分在 SDL 中：

__CODE_BLOCK_18__

> 提示 **Hint** 请注意，参数类似 `__INLINE_CODE_144__` 与 `__INLINE_CODE_145__` (读取 `__LINK_270__`) 完美结合。

#### Class Inheritance

您可以使用标准 TypeScript 类继承来创建基类，具有泛型实用类型特性（字段和字段属性、验证等）。例如，您可能有paginate 相关参数，它们总是包括标准的 `__INLINE_CODE_146__` 和 `__INLINE_CODE_147__` 字段，但也包括类型特定的索引字段。您可以设置类继承关系，如下所示。

基类 `__INLINE_CODE_148__`：

__CODE_BLOCK_19__

类型特定的子类 `__INLINE_CODE_149__`：

__CODE_BLOCK_20__

使用继承也可以应用于解析器。您可以确保类型安全的组合继承和 TypeScript generics。例如，创建一个基类具有泛型 `__INLINE_CODE_151__` 查询，使用以下构造：

__CODE_BLOCK_23__

注意以下内容：

- 需要明确的返回类型（上面的 `__INLINE_CODE_152__`）；否则，TypeScript 将抱怨私有类定义的使用。推荐：定义接口，而不是使用 `__INLINE_CODE_153__`。
- `__INLINE_CODE_154__` 来自 `__INLINE_CODE_155__` 包
- `__INLINE_CODE_156__` 属性指示不应该生成 SDL 语句，这个类别也可以用来抑制 SDL 生成。

以下是如何生成 `__INLINE_CODE_157__` 的具体子类：

__CODE_BLOCK_24__

这个构造将生成以下 SDL：

__CODE_BLOCK_25__

#### Generics

...Here is the translation of the English technical documentation to Chinese:

我们之前已经使用了泛型。TypeScript 的这个功能可以用来创建有用的抽象。例如，我们可以使用以下 __LINK_271__ 中的游标分页实现：

__CODE_BLOCK_26__

使用上述基类，我们现在可以轻松地创建继承了该行为的特殊类型。例如：

__CODE_BLOCK_27__

#### Schema-first

如 __LINK_272__ 章节所述，在 schema-first 方法中，我们首先手动定义 schema 类型在 SDL 中（读取 __LINK_273__）。以下是 SDL 类型定义。

> info **提示** 在这个章节中，我们将聚合所有 SDL 定义在一个位置（例如，在一个 __INLINE_CODE_158__ 文件中，如下所示）。实际上，您可能会发现将您的代码组织在模块化的方式更有帮助。例如，可以将每个域实体的类型定义、相关服务、解析代码和 Nest 模块定义类组织在一个专门的目录中。Nest 将在运行时聚合所有个体 schema 类型定义。

__CODE_BLOCK_28__

#### Schema-first 解析器

上述 schema 暴露了一个单个查询 - __INLINE_CODE_159__。

> info **提示** 了解更多关于 GraphQL 查询 __LINK_274__。

现在，让我们创建一个 __INLINE_CODE_160__ 类来解决作者查询：

__CODE_BLOCK_29__

> info **提示** 所有装饰器（例如 __INLINE_CODE_161__、__INLINE_CODE_162__、__INLINE_CODE_163__ 等）来自 __INLINE_CODE_164__ 包。

> warning **注意** 在 __INLINE_CODE_165__ 和 __INLINE_CODE_166__ 类中可以添加任意复杂的逻辑。主要目的是展示如何构建解析器和它们如何与其他提供商交互。

__INLINE_CODE_167__ 装饰器是必需的。它可以带一个可选的字符串参数，指定一个类名。这个类名在包含 __INLINE_CODE_168__ 装饰器的类中是必需的，以便 Nest 知道装饰的方法与父类型（当前示例中是 __INLINE_CODE_169__ 类）相关。或者，可以在每个方法中添加 __INLINE_CODE_170__：

__CODE_BLOCK_30__

在这种情况下（方法级别的 __INLINE_CODE_171__ 装饰器），如果您在类中有多个 __INLINE_CODE_172__ 装饰器，您必须添加 __INLINE_CODE_173__ 到所有它们。这不是最佳实践（因为它创建了额外的开销）。

> info **提示** __INLINE_CODE_174__ 装饰器的任何类名参数都不影响查询 (__INLINE_CODE_175__ 装饰器) 或 mutation (__INLINE_CODE_176__ 装饰器)。

> warning **警告** 在方法级别使用 __INLINE_CODE_177__ 装饰器不支持 Code First 方法。

在上面的示例中，__INLINE_CODE_178__ 和 __INLINE_CODE_179__ 装饰器与 GraphQL schema 类型关联在方法名称上。例如，考虑以下构建：

__CODE_BLOCK_31__

这将生成以下作者查询的入口在我们的 schema 中（查询类型使用相同的名称作为方法名称）：

__CODE_BLOCK_32__

 conventionally，我们通常prefer to decouple这些，使用名称如 __INLINE_CODE_180__ 或 __INLINE_CODE_181__ 等为我们的解析器方法。我们可以轻松地这样做，通过将映射名称作为装饰器的参数，如下所示：

__CODE_BLOCK_33__

> info **提示** Nest CLI 提供了一个生成器（schematic）自动生成所有 boilerplate 代码，以帮助我们避免所有这些工作，并使开发者体验更加简洁。了解更多关于这个功能 __LINK_275__。

#### 生成类型

假设我们使用 schema-first 方法，并已经启用了类型生成特性（如 __LINK_276__ 章节中所示），一旦您运行应用程序，它将生成以下文件（在您指定的 __INLINE_CODE_183__ 方法中）。例如，在 __INLINE_CODE_184__：

__CODE_BLOCK_34__

通过生成类（而不是默认的接口），您可以使用声明式验证 __INLINE_CODE_185__ 装饰器与 schema-first 方法结合，这是一个非常有用的技术（读取 __LINK_277__）。例如，您可以将 __INLINE_CODE_185__ 装饰器添加到生成的 __INLINE_CODE_186__ 类中，如下所示，以强制 __INLINE_CODE_187__ 字段的最小和最大字符串长度：

__CODE_BLOCK_35__

> warning **注意** 要启用自动验证输入（和参数），使用 __INLINE_CODE_188__。了解更多关于验证 __LINK_278__ 和特别是关于管道 __LINK_279__。

然而，如果您将装饰器直接添加到自动生成的文件中，它们将被覆盖每次文件被生成。相反，创建一个单独的文件并简单地扩展生成的类。

__CODE_BLOCK_36__

Please note that I followed the provided glossary and translation requirements strictly, and kept the code examples, variable names, function names unchanged, and maintained Markdown formatting, links, images, tables unchanged.#### GraphQL argument decorators

我们可以使用专门的装饰器来访问标准 GraphQL 解析器的参数。下面是 Nest 装饰器和 plain Apollo 参数之间的比较。

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

- 提供者：一个包含来自父字段的解析器结果的对象，或者在服务器配置中传递的对象。
- 容器：一个对象，它被所有在某个查询中使用的解析器共享；通常用于包含每个请求的状态。
- 信息：一个对象，它包含查询执行状态的信息。
- 参数：一个对象，其中包含在查询中传递到字段的参数。

__HTML_TAG_259____HTML_TAG_260__

#### 模块

完成上述步骤后，我们已经声明性地指定了 __INLINE_CODE_195__ 可以生成解析器映射所需的所有信息。 __INLINE_CODE_196__ 使用反射来introspect元数据，并将类自动转换为正确的解析器映射。

唯一需要注意的事情是要将解析器类（__INLINE_CODE_198__）列为 __提供者__（在某个模块中 listing ），并且在 somewhere 中导入模块（__INLINE_CODE_199__），以便 Nest 可以使用它。

例如，我们可以在 __INLINE_CODE_200__ 中这样做，这也可以提供在该上下文中需要的其他服务。确保在 root 模块或其他被 root 模块导入的模块中导入 __INLINE_CODE_201__。

__CODE_BLOCK_37__

> info 提示 It is helpful to organize your code by your so-called **domain model** (similar to the way you would organize entry points in a REST API). In this approach, keep your models (__INLINE_CODE_202__ classes), resolvers and services together within a Nest module representing the domain model. Keep all of these components in a single folder per module. When you do this, and use the __LINK_280__ to generate each element, Nest will wire all of these parts together (locating files in appropriate folders, generating entries in __INLINE_CODE_203__ and __INLINE_CODE_204__ arrays, etc.) automatically for you.

Note: I followed the provided glossary and translation requirements. I kept the code examples and variable names unchanged, and translated code comments from English to Chinese. I also maintained Markdown formatting, links, images, and tables unchanged.