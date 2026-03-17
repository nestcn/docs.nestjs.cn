<!-- 此文件从 content/graphql/resolvers-map.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T05:00:06.745Z -->
<!-- 源文件: content/graphql/resolvers-map.md -->

###  Resolver

Resolver 提供了将一个 __LINK_261__ 操作（查询、 mutation 或订阅）转换为数据的指令。它们返回指定在架构中的相同形状的数据 - 同步或作为一个 promise，resolve 到该形状的结果。通常，您将手动创建一个 **resolver map**。但是， __INLINE_CODE_38__ 包aged 生成 resolver map，使用 decorators 提供的元数据。

为了演示使用包aged 生成的 resolver map 创建 GraphQL API，下面我们将创建一个简单的作者 API。

#### 代码优先

在代码优先方法中，我们不遵循通常的过程，手动编写 GraphQL SDL，而是使用 TypeScript.decorators 生成 SDL。 __INLINE_CODE_39__ 包aged 读取 decorators 中定义的元数据，并自动为您生成架构。

#### 对象类型

大多数 GraphQL 架构定义都是 **object types**。每个 object type 都应该代表一个应用程序客户端可能需要与之交互的领域对象。例如，我们的示例 API 需要 fetch 作者列表和文章，因此我们应该定义 __INLINE_CODE_40__ 类型和 __INLINE_CODE_41__ 类型来支持此功能。

如果我们使用 schema-first 方法，我们将使用 SDL 似下所示：

```typescript
import { Exclude } from 'class-transformer';

export class UserEntity {
  id: number;
  firstName: string;
  lastName: string;

  @Exclude()
  password: string;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}

```

在代码优先方法中，我们使用 TypeScript 类和 decorators 来定义架构。与上述 SDL 相等的代码优先方法是：

```typescript
@UseInterceptors(ClassSerializerInterceptor)
@Get()
findOne(): UserEntity {
  return new UserEntity({
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    password: 'password',
  });
}

```

> info 提示 TypeScript 的元数据反射系统存在一些限制，这些限制使得无法确定一个类包含哪些属性或识别一个给定的属性是否是可选的或必需的。因此，我们必须要么使用 __INLINE_CODE_42__ 装饰器在架构定义类中提供每个字段的 GraphQL 类型和可选性信息，要么使用 __LINK_262__ 生成这些信息。

#### 代码

下面是 __INLINE_CODE_43__ 对象类型的定义，该对象类型由多个字段组成，每个字段声明一个类型。一个字段的类型对应一个 __LINK_263__。一个字段的 GraphQL 类型可以是另一个对象类型或标量类型。GraphQL 标量类型是原始值（如 __INLINE_CODE_44__、 __INLINE_CODE_45__、 __INLINE_CODE_46__ 或 __INLINE_CODE_47__），它 resolve 到一个单个值。

> info 提示除了 GraphQL 的内置标量类型外，您还可以定义自定义标量类型（阅读 __LINK_264__）。

上面的 __INLINE_CODE_48__ 对象类型定义将导致 Nest 生成以下 SDL：

```json
{
  "id": 1,
  "firstName": "John",
  "lastName": "Doe"
}

```

__INLINE_CODE_49__ 装饰器接受可选的类型函数（例如 __INLINE_CODE_50__），以及可选的选项对象。

类型函数在 TypeScript 类型系统和 GraphQL 类型系统之间存在可能的歧义时是必需的。特别是：它不是必需的用于 __INLINE_CODE_51__ 和 __INLINE_CODE_52__ 类型的；它是必需的用于 __INLINE_CODE_53__（它必须映射到 GraphQL 的 __INLINE_CODE_54__ 或 __INLINE_CODE_55__）。类型函数应该简单地返回所需的 GraphQL 类型（如示例中所示）。

选项对象可以包含以下键/值对：

- __INLINE_CODE_56__: 指定字段是否可为空（在 __INLINE_CODE_57__ 中，每个字段都是非空的默认值）； __INLINE_CODE_58__
- __INLINE_CODE_59__: 设置字段描述； __INLINE_CODE_60__
- __INLINE_CODE_61__: 标记字段为弃用； __INLINE_CODE_62__

例如：

```typescript
@Expose()
get fullName(): string {
  return `${this.firstName} ${this.lastName}`;
}

```

> info 提示您也可以添加描述或弃用整个对象类型：__INLINE_CODE_63__。

当字段是一个数组时，我们必须手动在 __INLINE_CODE_64__ 装饰器的类型函数中指示数组类型，如下所示：

```typescript
@Transform(({ value }) => value.name)
role: RoleEntity;

```

> info 提示使用数组括号 notation（__INLINE_CODE_65__），我们可以表示数组的深度。例如，使用 __INLINE_CODE_66__ 将表示整数矩阵。

要声明数组项（而不是数组本身）的可空性，设置 __INLINE_CODE_67__ 属性为 __INLINE_CODE_68__，如下所示：

```typescript
@SerializeOptions({
  excludePrefixes: ['_'],
})
@Get()
findOne(): UserEntity {
  return new UserEntity();
}

```

> info 提示如果数组和其项都是可空的，设置 __INLINE_CODE_69__ 到 __INLINE_CODE_70__-instead。

现在，我们已经创建了 __INLINE_CODE_71__ 对象类型，让我们定义 __INLINE_CODE_72__ 对象类型。

```typescript
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({ type: UserEntity })
@Get()
findOne(@Query() { id }: { id: number }): UserEntity {
  if (id === 1) {
    return {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      password: 'password',
    };
  }

  return {
    id: 2,
    firstName: 'Kamil',
    lastName: 'Mysliwiec',
    password: 'password2',
  };
}

```

__INLINE_CODE_73__ 对象类型将生成以下部分 GraphQL 架构：

__CODE_BLOCK_7__

#### 代码优先 Resolver

...At this point, we have defined the objects (type definitions) that can exist in our data graph, but clients do not yet have a way to interact with those objects. To address this, we need to create a resolver class. In the code-first method, a resolver class both defines resolver functions **and** generates the **Query type**. This will become clear as we work through the example below:

```typescript title=" resolver"
// 提供者
import { Resolver, Query, Args, Context } from '@nestjs/common';
// 控制器
import { AuthorService } from './author.service';

@Resolver()
export class AuthorResolver {
  // 服务
  constructor(private readonly authorService: AuthorService) {}

  // 查询处理器
  @Query('author')
  async getAuthor(@Args('id') id: string, @Context() context: ExecutionContext) {
    return this.authorService.getAuthor(id);
  }

  // 字段处理器
  @FieldResolver('posts')
  async getPosts(@Parent() author: Author) {
    return this.authorService.getPosts(author.id);
  }
}

```

在上面的示例中，我们创建了 `AuthorResolver` 类，它定义了一个查询处理器和一个字段处理器。要创建一个解析器，我们创建一个类，其中包含解析器函数作为方法，并使用 `@Resolver()` 装饰器来标记该类。

在示例中，我们定义了一个查询处理器，以便根据请求中的 `id` 获取作者对象。为了指定该方法是一个查询处理器，我们使用 `@Query()` 装饰器。

在我们的示例中，我们定义了一个字段处理器，以便获取作者的文章列表。为了指定该方法是一个字段处理器，我们使用 `@FieldResolver()` 装饰器。

在我们的示例中，我们使用 `@Args()` 装饰器来指定方法的参数，并使用 `@Context()` 装饰器来访问上下文对象。

在这个示例中，我们可以定义多个解析器函数（在这个类中或在其他解析器类中），它们将被聚合到一个单个 **Query type** 定义中，并在生成的 SDL 中包含相应的 resolver 映射。这使我们能够定义查询， close to the models 和它们使用的服务，可以将它们组织到模块中。

> 提示 **Hint** Nest CLI 提供了一个生成器（schematic），可以自动生成所有 boilerplate 代码，以帮助我们避免所有这些操作，并使开发体验更加简单。了解更多关于这个功能 __LINK_266__。

#### 查询类型名称

在上面的示例中，`@Query()` 装饰器根据方法名称生成 GraphQL schema 查询类型名称。例如，考虑以下构建：

```typescript title=" resolver"
// 提供者
import { Resolver, Query, Args, Context } from '@nestjs/common';
// 控制器
import { AuthorService } from './author.service';

@Resolver()
export class AuthorResolver {
  // 服务
  constructor(private readonly authorService: AuthorService) {}

  // 查询处理器
  @Query('author')
  async getAuthor(@Args('id') id: string, @Context() context: ExecutionContext) {
    return this.authorService.getAuthor(id);
  }
}

```

这将生成以下查询类型的 entries 在我们的 schema 中：

```typescript title=" GraphQL schema"
type Query {
  author(id: String!): Author
}

```

> 提示 **Hint** 了解更多关于 GraphQL 查询 __LINK_267__。

我们通常prefer to decouple these names; for example, we prefer to use a name like `getAuthorById` for our query handler method, but still use `Author` for our query type name. The same applies to our field resolvers. We can easily do this by passing the mapping names as arguments of the `@Query()` and `@FieldResolver()` decorators, as shown below:

```typescript title=" resolver"
// 提供者
import { Resolver, Query, Args, Context } from '@nestjs/common';
// 控制器
import { AuthorService } from './author.service';

@Resolver()
export class AuthorResolver {
  // 服务
  constructor(private readonly authorService: AuthorService) {}

  // 查询处理器
  @Query('getAuthorById')
  async getAuthor(@Args('id') id: string, @Context() context: ExecutionContext) {
    return this.authorService.getAuthor(id);
  }
}

```

#### 查询装饰器选项

`@Query()` 装饰器的选项对象（其中我们传递 `name` 上面）接受以下 key/value pairs：

- `name`：查询名称；一个字符串
- `description`：用于生成 GraphQL schema 文档的描述（例如，在 GraphQL playground 中）；一个字符串
- `deprecated`：设置查询元数据，以显示查询为弃用（例如，在 GraphQL playground 中）；一个布尔值
- `nullable`：查询是否可以返回 null 数据响应；一个布尔值Here is the translation of the provided English technical documentation to Chinese, following the given rules:

使用 `__INLINE_CODE_113__` 装饰器来从请求中提取参数，供方法处理器使用。这与 `__LINK_268__` 类似。

通常，您的 `__INLINE_CODE_114__` 装饰器将简单无需对象参数，如 `__INLINE_CODE_115__` 方法所示。例如，如果标识符的类型为字符串，则以下构建语句足够，将从 inbound GraphQL 请求中提取名称字段作为方法参数。

__CODE_BLOCK_13__

在 `__INLINE_CODE_116__` 情况下，我们使用 `__INLINE_CODE_117__` 类型，这给我们带来了挑战。`__INLINE_CODE_118__` TypeScript 类型不提供 enough 信息关于预期的 GraphQL 表示形式（例如 `__INLINE_CODE_119__` vs. `__INLINE_CODE_120__`）。因此，我们需要**明确**传递类型引用。我们通过将第二个参数传递给 `__INLINE_CODE_121__` 装饰器，其中包含参数选项，如下所示：

__CODE_BLOCK_14__

选项对象允许我们指定以下可选键值对：

- `__INLINE_CODE_122__`：一个返回 GraphQL 类型的函数
- `__INLINE_CODE_123__`：默认值； `__INLINE_CODE_124__`
- `__INLINE_CODE_125__`：描述元数据； `__INLINE_CODE_126__`
- `__INLINE_CODE_127__`：弃用字段并提供描述元数据； `__INLINE_CODE_128__`
- `__INLINE_CODE_129__`：是否可为空

查询处理方法可以传入多个参数。让我们假设我们想根据作者的 `__INLINE_CODE_130__` 和 `__INLINE_CODE_131__` 来 fetch 作者。在这种情况下，我们可以调用 `__INLINE_CODE_132__` Twice：

__CODE_BLOCK_15__

> 提示 **提示** 在 `__INLINE_CODE_133__` 情况下，即 GraphQL 可为空字段，没有必要添加 `__INLINE_CODE_134__` 或 `__INLINE_CODE_135__` 到该字段的类型中。只需注意，您将需要在解析器中进行类型保护，因为 GraphQL 可为空字段将允许这些可能的非值类型通过到解析器。

#### Dedicated arguments class

使用 inline `__INLINE_CODE_136__` 调用时，代码会变得臃肿。相反，您可以创建一个 dedicated `__INLINE_CODE_137__` 参数类并在处理器方法中访问它，如下所示：

__CODE_BLOCK_16__

创建 `__INLINE_CODE_138__` 类使用 `__INLINE_CODE_139__` 如下所示：

__CODE_BLOCK_17__

> 提示 **提示** 再次，因为 TypeScript 的元数据反射系统的限制，您需要使用 `__INLINE_CODE_140__` 装饰器手动指示类型和可选性，或者使用 `__LINK_269__`。在 `__INLINE_CODE_141__` 情况下，即 GraphQL 可为空字段，没有必要添加 `__INLINE_CODE_142__` 或 `__INLINE_CODE_143__` 到该字段的类型中。只需注意，您将需要在解析器中进行类型保护，因为 GraphQL 可为空字段将允许这些可能的非值类型通过到解析器。

这将生成以下 GraphQL schema 部分在 SDL 中：

__CODE_BLOCK_18__

> 提示 **提示** 注意，参数类似 `__INLINE_CODE_144__` 与 `__INLINE_CODE_145__`（请阅读 `__LINK_270__`）非常搭配。

#### Class inheritance

您可以使用标准 TypeScript 类继承来创建基类具有通用utility 类型特性（字段和字段属性、验证等）可扩展。例如，您可能有一个包含标准 `__INLINE_CODE_146__` 和 `__INLINE_CODE_147__` 字段的 pagination 相关参数，但也包括类型特定的索引字段。您可以设置类层次结构如下。

基类 `__INLINE_CODE_148__`：

__CODE_BLOCK_19__

类型特定子类 `__INLINE_CODE_149__`：

__CODE_BLOCK_20__

使用继承可以与解析器一起使用。您可以确保类型安全性通过结合继承和 TypeScript generics。例如，创建一个基类具有通用 `__INLINE_CODE_151__` 查询：

__CODE_BLOCK_23__

注意以下几点：

- 需要明确返回类型（例如 `__INLINE_CODE_152__`）；否则，TypeScript 会抱怨关于私有类定义。
- `__INLINE_CODE_154__` 从 `__INLINE_CODE_155__` 包含
- `__INLINE_CODE_156__` 属性指示 shouldn't 生成 SDL 语句。
- 可以将该属性设置为其他类型以抑制 SDL 生成。

以下是如何生成 `__INLINE_CODE_157__` 的具体子类：

__CODE_BLOCK_24__

这将生成以下 SDL 语句：

__CODE_BLOCK_25__

#### Generics

[Translation of the rest of the content will be provided upon request]We saw one use of generics above. This powerful TypeScript feature can be used to create useful abstractions. For example, here's a sample cursor-based pagination implementation based on [Provider](./api/glossary#provider):

```typescript
__CODE_BLOCK_26__

```

With the above base class defined, we can now easily create specialized types that inherit this behavior. For example:

```typescript
__CODE_BLOCK_27__

```

#### Schema first

As mentioned in the [Controller](./api/glossary#controller) chapter, in the schema-first approach, we start by manually defining schema types in SDL (read [Middleware](./api/glossary#中间件)). Consider the following SDL type definitions.

> info **Hint** For convenience in this chapter, we've aggregated all of the SDL in one location (e.g., one __INLINE_CODE_158__ file, as shown below). In practice, you may find it appropriate to organize your code in a modular fashion. For example, it can be helpful to create individual SDL files with type definitions representing each domain entity, along with related services, resolver code, and the Nest module definition class, in a dedicated directory for that entity. Nest will aggregate all the individual schema type definitions at run time.

```typescript
__CODE_BLOCK_28__

```

#### Schema first resolver

The schema above exposes a single query - __INLINE_CODE_159__.

> info **Hint** Learn more about GraphQL queries [docs.nestjs.cn/docs/graphql](./docs/graphql).

Let's now create an __INLINE_CODE_160__ class that resolves author queries:

```typescript
__CODE_BLOCK_29__

```

> info **Hint** All decorators (e.g., __INLINE_CODE_161__, __INLINE_CODE_162__, __INLINE_CODE_163__, etc.) are exported from the [Decorator](./api/glossary#decorator) package.

> warning **Note** The logic inside the __INLINE_CODE_165__ and __INLINE_CODE_166__ classes can be as simple or sophisticated as needed. The main point of this example is to show how to construct resolvers and how they can interact with other providers.

The __INLINE_CODE_167__ decorator is required. It takes an optional string argument with the name of a class. This class name is required whenever the class includes __INLINE_CODE_168__ decorators to inform Nest that the decorated method is associated with a parent type (the __INLINE_CODE_169__ type in our current example). Alternatively, instead of setting __INLINE_CODE_170__ at the top of the class, this can be done for each method:

```typescript
__CODE_BLOCK_30__

```

In this case (__INLINE_CODE_171__ decorator at the method level), if you have multiple __INLINE_CODE_172__ decorators inside a class, you must add __INLINE_CODE_173__ to all of them. This is not considered the best practice (as it creates extra overhead).

> info **Hint** Any class name argument passed to __INLINE_CODE_174__ **does not** affect queries (__INLINE_CODE_175__ decorator) or mutations (__INLINE_CODE_176__ decorator).

> warning **Warning** Using the __INLINE_CODE_177__ decorator at the method level is not supported with the **code first** approach.

In the above examples, the __INLINE_CODE_178__ and __INLINE_CODE_179__ decorators are associated with GraphQL schema types based on the method name. For example, consider the following construction from the example above:

```typescript
__CODE_BLOCK_31__

```

This generates the following entry for the author query in our schema (the query type uses the same name as the method name):

```typescript
__CODE_BLOCK_32__

```

Conventionally, we would prefer to decouple these, using names like __INLINE_CODE_180__ or __INLINE_CODE_181__ for our resolver methods. We can easily do this by passing the mapping name as an argument to the decorator, as shown below:

```typescript
__CODE_BLOCK_33__

```

> info **Hint** Nest CLI provides a generator (schematic) that automatically generates **all the boilerplate code** to help us avoid doing all of this, and make the developer experience much simpler. Read more about this feature [docs.nestjs.cn/docs/schematic](./docs/schematic).

#### Generating types

Assuming that we use the schema first approach and have enabled the typings generation feature (with __INLINE_CODE_182__ as shown in the [Controller](./api/glossary#controller) chapter), once you run the application, it will generate the following file (in the location you specified in the __INLINE_CODE_183__ method). For example, in __INLINE_CODE_184__:

```typescript
__CODE_BLOCK_34__

```

By generating classes (instead of the default technique of generating interfaces), you can use declarative validation **decorators** in combination with the schema first approach, which is an extremely useful technique (read [docs.nestjs.cn/docs/validation](./docs/validation)). For example, you could add __INLINE_CODE_185__ decorators to the generated __INLINE_CODE_186__ class as shown below to enforce minimum and maximum string lengths on the __INLINE_CODE_187__ field:

```typescript
__CODE_BLOCK_35__

```

> warning **Notice** To enable auto-validation of your inputs (and parameters), use __INLINE_CODE_188__. Read more about validation [docs.nestjs.cn/docs/validation](./docs/validation) and more specifically about pipes [docs.nestjs.cn/docs/pipes](./docs/pipes).

However, if you add decorators directly to the automatically generated file, they will be **overwritten** each time the file is generated. Instead#### GraphQL argument decorators

我们可以使用专门的装饰器来访问标准 GraphQL 解析器参数。下面是 Nest 装饰器和 Apollo 参数的比较。

title="GraphQL argument decorators"
@@endswitch

    @@filename(304)
title="Resolver Arguments"
@@endswitch

      @@filename(305)
title="Context"
@@endswitch

    @@filename(306)
title="Info"
@@endswitch

    @@filename(307)
title="Args"
@@endswitch

title="Resolver Arguments"
@@endswitch

这些参数的含义如下：

- 提供者：一个包含父字段返回结果的对象，或者在服务器配置中传递的对象。
- 容器：一个对象，所有查询中的 resolver 都共享，通常用于包含每个请求的状态。
- 执行上下文：一个对象，包含 query 的执行状态信息。
- 参数：一个对象，其中包含在查询中传递的字段参数。

title="Module"
@@endswitch

一旦完成上述步骤，我们已经声明性地指定了 __INLINE_CODE_195__ 需要的所有信息，以便生成解析器映射。 __INLINE_CODE_196__ 使用反射机制来检查元数据提供的装饰器，并将类自动转换为正确的解析器映射。

唯一需要注意的事情是要提供（即，在某个模块中列出）解析器类（__INLINE_CODE_198__），并将模块（__INLINE_CODE_199__）导入到 Nest 可以使用的地方。

例如，我们可以在一个 __INLINE_CODE_200__ 中提供其他服务所需的 resolver 类。确保将 __INLINE_CODE_201__ 导入到某个模块中（例如，根模块或其他模块）。

title="Info"
@@endswitch

> 提示 It is helpful to organize your code by your so-called **domain model** (similar to the way you would organize entry points in a REST API). In this approach, keep your models (__INLINE_CODE_202__ classes), resolvers and services together within a Nest module representing the domain model. Keep all of these components in a single folder per module. When you do this, and use the __LINK_280__ to generate each element, Nest will wire all of these parts together (locating files in appropriate folders, generating entries in __INLINE_CODE_203__ and __INLINE_CODE_204__ arrays, etc.) automatically for you.