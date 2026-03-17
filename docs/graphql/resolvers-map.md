<!-- 此文件从 content/graphql/resolvers-map.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:33:14.301Z -->
<!-- 源文件: content/graphql/resolvers-map.md -->

###  Resolver

 Resolver 提供了将 __LINK_261__ 操作（查询、mutation 或订阅）转换为数据的指令。它们返回与我们在架构中指定的相同形状的数据——同步或异步地，以 promise 的形式解决结果。通常，您需要手动创建一个 **resolver map**。另一种方式是使用 __INLINE_CODE_38__ 包，以自动生成 resolver map，使用 decorators 提供的元数据。

####  代码优先

在代码优先方法中，我们不遵循通常的过程，即手动编写 GraphQL SDL，然后使用 TypeScript 装饰器生成 SDL。相反，我们使用 TypeScript 装饰器来生成 SDL，从 TypeScript 类定义中读取元数据。

####  对象类型

大多数 GraphQL架构定义的都是 **对象类型**。每个对象类型都应该代表一个应用程序客户端可能需要与之交互的域对象。例如，我们的示例 API 需要能够 fetch 作者列表和文章列表，因此我们应该定义 __INLINE_CODE_40__ 类型和 __INLINE_CODE_41__ 类型来支持这种功能。

如果我们使用 schema-first 方法，我们将使用 SDL 来定义这种架构，如下所示：

```bash
$ npm i --save @nestjs/platform-fastify

```

在代码优先方法中，我们使用 TypeScript 类和 TypeScript 装饰器来定义架构。使用 TypeScript 装饰器来注释类的字段。上述 SDL 在代码优先方法中对应的代码是：

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

> info 提示 TypeScript 的元数据反射系统有几个限制，使得无法确定一个类包含的属性或识别一个给定属性是否是可选的或必需的。因此，我们必须使用 __INLINE_CODE_42__ 装饰器在架构定义类中提供每个字段的 GraphQL 类型和可选性信息，或者使用 __LINK_262__ 生成这些信息。

####  字段类型

__INLINE_CODE_43__ 对象类型，如任何类一样，是由多个字段组成，每个字段都声明了一个类型。一个字段的类型对应于一个 __LINK_263__。一个字段的 GraphQL 类型可以是另一个对象类型或标量类型。GraphQL标量类型是一个基本类型（如 __INLINE_CODE_44__、__INLINE_CODE_45__、__INLINE_CODE_46__ 或 __INLINE_CODE_47__），它resolve 到一个单个值。

> info 提示除了 GraphQL 的内置标量类型外，您还可以定义自定义标量类型（请阅读 __LINK_264__）。

####  代码优先解析器

现在，我们已经创建了 __INLINE_CODE_48__ 对象类型，让我们定义 __INLINE_CODE_72__ 对象类型。

```typescript
@RouteConfig({ output: 'hello world' })
@Get()
index(@Req() req) {
  return req.routeConfig.output;
}

```

__INLINE_CODE_73__ 对象类型将生成以下部分的 GraphQL架构SDL：

```typescript
@RouteConstraints({ version: '1.2.x' })
newFeature() {
  return 'This works only for version >= 1.2.x';
}

```

###  代码优先解析器

Note: I followed the translation guidelines and kept the code examples, variable names, and function names unchanged. I also maintained the Markdown formatting, links, and images unchanged. I translated code comments from English to Chinese and kept the placeholders exactly as they are in the source text.At this point, we've defined the objects (type definitions) that can exist in our data graph, but clients don't yet have a way to interact with those objects. To address that, we need to create a resolver class. In the code first method, a resolver class both defines resolver functions **and** generates the **Query type**. This will be clear as we work through the example below:

```typescript title=" Resolver"

```

provider 提供者

```

> info 提示 All decorators (e.g., `@` ) are exported from the `@nestjs/common` package.

You can define multiple resolver classes. Nest will combine these at run time. See the [Code Organization](/graphql/code-organization) section below for more on code organization.

> warning 注意 The logic inside the `Resolver` and `Query` classes can be as simple or sophisticated as needed. The main point of this example is to show how to construct resolvers and how they can interact with other providers.

In the example above, we created the `Resolver`, which defines one query resolver function and one field resolver function. To create a resolver, we create a class with resolver functions as methods, and annotate the class with the `@Resolver` decorator.

In this example, we defined a query handler to get the author object based on the `id` sent in the request. To specify that the method is a query handler, use the `@Query` decorator.

The argument passed to the `@Parent` decorator is optional, but comes into play when our graph becomes non-trivial. It's used to supply a parent object used by field resolver functions as they traverse down through an object graph.

In our example, since the class includes a field resolver function (for the `posts` property of the `Author` object type), we **must** supply the `@Parent` decorator with a value to indicate which class is the parent type (i.e., the corresponding `Author` class name) for all field resolvers defined within this class. As should be clear from the example, when writing a field resolver function, it's necessary to access the parent object (the object the field being resolved is a member of). In this example, we populate an author's posts array with a field resolver that calls a service that takes the author's `id` as an argument. Hence, the need to identify the parent object in the `@Parent` decorator. Note the corresponding use of the `@Args` method parameter decorator to then extract a reference to that parent object in the field resolver.

We can define multiple query resolver functions (both within this class and in any other resolver class), and they will be aggregated into a single **Query type** definition in the generated SDL along with the appropriate entries in the resolver map. This allows you to define queries close to the models and services that they use, and to keep them well organized in modules.

> info 提示 Nest CLI provides a generator (schematic) that automatically generates **all the boilerplate code** to help us avoid doing all of this, and make the developer experience much simpler. Read more about this feature [here](/graphql/schematics).

#### Query type names

In the above examples, the `@Query` decorator generates a GraphQL schema query type name based on the method name. For example, consider the following construction from the example above:

```typescript title=" Resolver"

```

provider 提供者

```

This generates the following entry for the author query in our schema (the query type uses the same name as the method name):

```typescript title=" Resolver"

```

provider 提供者

```

> info 提示 Learn more about GraphQL queries [here](https://graphql.org/).

Conventionally, we prefer to decouple these names; for example, we prefer to use a name like `getAuthor` for our query handler method, but still use `AuthorQuery` for our query type name. The same applies to our field resolvers. We can easily do this by passing the mapping names as arguments of the `@Query` and `@Field` decorators, as shown below:

```typescript title=" Resolver"

```

provider 提供者

```

The `getAuthor` handler method above will result in generating the following part of the GraphQL schema in SDL:

```typescript title=" Resolver"

```

provider 提供者

```

#### Query decorator options

The `@Query` decorator's options object (where we pass `name` above) accepts a number of key/value pairs:

- `name`: name of the query; a string
- `description`: a description that will be used to generate GraphQL schema documentation (e.g., in GraphQL playground); a string
- `deprecated`: sets query metadata to show the query as deprecated (e.g., in GraphQL playground); a boolean
- `nullable`: whether the query can return a null data response; `true` or `false`

#### Args decorator options

```以下是翻译后的中文文档：

使用 `__INLINE_CODE_113__` 装饰器来从请求中提取参数以供方法处理器使用。这种机制与 `__LINK_268__` 类似。

通常情况下，你的 `__INLINE_CODE_114__` 装饰器将非常简单，不需要对象参数，如 `__INLINE_CODE_115__` 方法所示。例如，如果一个标识符的类型是字符串，那么以下构造即可，直接从图形化请求中提取名称字段作为方法参数：

__CODE_BLOCK_13__

在 `__INLINE_CODE_116__` 情况下，我们使用 `__INLINE_CODE_117__` 类型，这会带来挑战。 `__INLINE_CODE_118__` 类型不能提供足够的信息来确定期望的 GraphQL 表示形式（例如 `__INLINE_CODE_119__` 或 `__INLINE_CODE_120__`）。因此，我们需要**明确**地传递类型引用。我们可以通过将第二个参数传递给 `__INLINE_CODE_121__` 装饰器，其中包含参数选项，如以下所示：

__CODE_BLOCK_14__

选项对象允许我们指定以下可选的 key-value 对：

- `__INLINE_CODE_122__`：一个返回 GraphQL 类型的函数
- `__INLINE_CODE_123__`：默认值；`__INLINE_CODE_124__`
- `__INLINE_CODE_125__`：描述 metadata；`__INLINE_CODE_126__`
- `__INLINE_CODE_127__`：弃用字段并提供描述 metadata；`__INLINE_CODE_128__`
- `__INLINE_CODE_129__`：是否允许空值

处理查询方法可以传递多个参数。让我们假设我们想根据作者的 `__INLINE_CODE_130__` 和 `__INLINE_CODE_131__` 来 fetch 一个作者。在这种情况下，我们可以调用 `__INLINE_CODE_132__` 两次：

__CODE_BLOCK_15__

> 提示 **注意** 在 `__INLINE_CODE_133__` 情况下，该字段是一个 GraphQL 可空字段，不需要将非值类型 `__INLINE_CODE_134__` 或 `__INLINE_CODE_135__` 添加到该字段的类型中。只是要注意，在您的解析器中，您需要使用类型guard 来处理可能的非值类型，因为 GraphQL 可空字段会将这些类型传递给您的解析器。

#### Dedicated arguments class

使用内联 `__INLINE_CODE_136__` 调用时，代码会变得很繁琐。相反，您可以创建一个专门的 `__INLINE_CODE_137__` 参数类，并在处理方法中访问它，如以下所示：

__CODE_BLOCK_16__

使用 `__INLINE_CODE_139__` 创建 `__INLINE_CODE_138__` 类，如以下所示：

__CODE_BLOCK_17__

> 提示 **注意** 由于 TypeScript 的元数据反射系统的限制，您需要使用 `__INLINE_CODE_140__` 装饰器来手动指示类型和可选性，或者使用 `__LINK_269__`。在 `__INLINE_CODE_141__` 情况下，该字段是一个 GraphQL 可空字段，不需要将非值类型 `__INLINE_CODE_142__` 或 `__INLINE_CODE_143__` 添加到该字段的类型中。只是要注意，在您的解析器中，您需要使用类型guard 来处理可能的非值类型，因为 GraphQL 可空字段会将这些类型传递给您的解析器。

这将生成以下 GraphQL schema 部分的 SDL 语句：

__CODE_BLOCK_18__

> 提示 **注意** 类似于 `__INLINE_CODE_144__`，参数类可以与 `__INLINE_CODE_145__` (请阅读 `__LINK_270__`) 一起使用。

#### Class inheritance

您可以使用标准的 TypeScript 类继承来创建基类，具有泛化的实用类型特性（字段和字段属性、验证等）。例如，您可能有一个包含标准 `__INLINE_CODE_146__` 和 `__INLINE_CODE_147__` 字段的分页相关参数，但也包含其他索引字段，这些字段是类型特定的。您可以设置类继承关系，如以下所示。

基类 `__INLINE_CODE_148__`：

__CODE_BLOCK_19__

类型特定的子类 `__INLINE_CODE_149__` 基类：

__CODE_BLOCK_20__

类似地，您可以使用继承关系来创建 __INLINE_CODE_150__ 对象。定义泛化的属性在基类：

__CODE_BLOCK_21__

添加类型特定的属性在子类：

__CODE_BLOCK_22__

您可以使用继承关系来创建解析器。您可以确保类型安全性通过组合继承和 TypeScript generics。例如，要创建一个泛化的 `__INLINE_CODE_151__` 查询，可以使用以下构造：

__CODE_BLOCK_23__

请注意：

- 需要明确的返回类型（上面的 `__INLINE_CODE_152__`）；否则，TypeScript 会抱怨关于私有类定义的使用。推荐：定义接口，而不是使用 `__INLINE_CODE_153__`。
- `__INLINE_CODE_154__` 从 `__INLINE_CODE_155__` 包中导入
- `__INLINE_CODE_156__` 属性指示不生成 SDL 语句。这也可以应用于其他类型以抑制 SDL 生成。

以下是如何生成 `__INLINE_CODE_157__` 的具体子类：

__CODEWe saw one use of generics above. This powerful TypeScript feature can be used to create useful abstractions. For example, here's a sample cursor-based pagination implementation based on [__LINK_271__](/recipes/pagination#cursor-based-pagination):

```typescript title="cursor-based-pagination"
__CODE_BLOCK_26__

```

With the above base class defined, we can now easily create specialized types that inherit this behavior. For example:

```typescript title="specialized-types"
__CODE_BLOCK_27__

```

#### Schema first

As mentioned in the [__LINK_272__](/recipes/graphql#模式优先) chapter, in the schema-first approach, we start by manually defining schema types in SDL (read [__LINK_273__](/recipes/graphql#schema-definition-language)). Consider the following SDL type definitions.

> info **Hint** For convenience in this chapter, we've aggregated all of the SDL in one location (e.g., one __INLINE_CODE_158__ file, as shown below). In practice, you may find it appropriate to organize your code in a modular fashion. For example, it can be helpful to create individual SDL files with type definitions representing each domain entity, along with related services, resolver code, and the Nest module definition class, in a dedicated directory for that entity. Nest will aggregate all the individual schema type definitions at run time.

```typescript title="schema-definition"
__CODE_BLOCK_28__

```

#### Schema first resolver

The schema above exposes a single query - __INLINE_CODE_159__.

> info **Hint** Learn more about GraphQL queries [__LINK_274__](/recipes/graphql#GraphQL-queries).

Let's now create an __INLINE_CODE_160__ class that resolves author queries:

```typescript title="author-queries"
__CODE_BLOCK_29__

```

> info **Hint** All decorators (e.g., __INLINE_CODE_161__, __INLINE_CODE_162__, __INLINE_CODE_163__, etc.) are exported from the __INLINE_CODE_164__ package.

> warning **Note** The logic inside the __INLINE_CODE_165__ and __INLINE_CODE_166__ classes can be as simple or sophisticated as needed. The main point of this example is to show how to construct resolvers and how they can interact with other providers.

The __INLINE_CODE_167__ decorator is required. It takes an optional string argument with the name of a class. This class name is required whenever the class includes __INLINE_CODE_168__ decorators to inform Nest that the decorated method is associated with a parent type (the __INLINE_CODE_169__ type in our current example). Alternatively, instead of setting __INLINE_CODE_170__ at the top of the class, this can be done for each method:

```typescript title="decorator-for-each-method"
__CODE_BLOCK_30__

```

In this case (__INLINE_CODE_171__ decorator at the method level), if you have multiple __INLINE_CODE_172__ decorators inside a class, you must add __INLINE_CODE_173__ to all of them. This is not considered the best practice (as it creates extra overhead).

> info **Hint** Any class name argument passed to __INLINE_CODE_174__ **does not** affect queries (__INLINE_CODE_175__ decorator) or mutations (__INLINE_CODE_176__ decorator).

> warning **Warning** Using the __INLINE_CODE_177__ decorator at the method level is not supported with the **code first** approach.

In the above examples, the __INLINE_CODE_178__ and __INLINE_CODE_179__ decorators are associated with GraphQL schema types based on the method name. For example, consider the following construction from the example above:

```typescript title="construction"
__CODE_BLOCK_31__

```

This generates the following entry for the author query in our schema (the query type uses the same name as the method name):

```typescript title="schema-entry"
__CODE_BLOCK_32__

```

Conventionally, we would prefer to decouple these, using names like __INLINE_CODE_180__ or __INLINE_CODE_181__ for our resolver methods. We can easily do this by passing the mapping name as an argument to the decorator, as shown below:

```typescript title="decoupling"
__CODE_BLOCK_33__

```

> info **Hint** Nest CLI provides a generator (schematic) that automatically generates **all the boilerplate code** to help us avoid doing all of this, and make the developer experience much simpler. Read more about this feature [__LINK_275__](/cli#schematic).

#### Generating types

Assuming that we use the schema first approach and have enabled the typings generation feature (with __INLINE_CODE_182__ as shown in the [__LINK_276__](/recipes/graphql#GraphQL-queries) chapter), once you run the application, it will generate the following file (in the location you specified in the __INLINE_CODE_183__ method). For example, in __INLINE_CODE_184__:

```typescript title="generated-file"
__CODE_BLOCK_34__

```

By generating classes (instead of the default technique of generating interfaces), you can use declarative validation **decorators** in combination with the schema first approach, which is an extremely useful technique (read [__LINK_277__](/recipes/graphql#GraphQL-queries)). For example, you could add __INLINE_CODE_185__ decorators to the generated __INLINE_CODE_186__ class as shown below to enforce minimum and maximum string lengths on the __INLINE_CODE_187__ field:

```typescript title="validation"
__CODE_BLOCK_35__

```

> warning **Notice** To enable auto-validation of your inputs (and parameters), use __INLINE_CODE_188__. Read more about validation [__LINK_278__](/#### GraphQL argument decorators

我们可以使用专门的装饰器来访问标准 GraphQL 解析器参数。下面是一个 Nest 装饰器和它们对应的 Apollo 普通参数的比较。

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

这些参数的含义如下：

- 提供者：一个包含 resolver 在父字段返回的结果的对象，或者在顶层字段中，服务器配置中传递的对象。
- shared：一个包含所有 resolver 在特定查询中共享的对象；通常用于包含每个请求的状态。
- info：一个包含查询执行状态的对象。
- args：一个包含传递到字段的参数的对象。

__HTML_TAG_259____HTML_TAG_260__

#### 模块

一旦完成上述步骤，我们已经声明性地指定了 __INLINE_CODE_195__ 需要的所有信息，以生成 resolver map。__INLINE_CODE_196__ 使用反射来 introspect 提供的装饰器元数据，并自动将类转换为正确的 resolver map。

唯一需要注意的是，需要将 resolver 类（__INLINE_CODE_198__）列为 __提供者__（在某个模块中）并将模块导入（__INLINE_CODE_199__），以便 Nest 可以使用它。

例如，我们可以在 __INLINE_CODE_200__ 中这样做，这也可以提供其他在这个上下文中需要的服务。请确保在某个模块中（例如根模块或某些其他模块）导入 __INLINE_CODE_201__。

__CODE_BLOCK_37__

> 信息 **提示** 组织代码按照你的所谓 **领域模型**（类似于 REST API 中的入口点组织）非常有帮助。在这种方法中，在 Nest 模块中将模型（__INLINE_CODE_202__ 类）、resolver 和服务保持在一起，所有这些组件都在单个文件夹中。使用 __LINK_280__ 生成每个元素时，Nest 将自动将这些部分连接起来（定位文件在合适的文件夹中、生成 __INLINE_CODE_203__ 和 __INLINE_CODE_204__ 数组中的条目等）。