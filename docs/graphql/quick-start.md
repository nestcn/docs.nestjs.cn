<!-- 此文件从 content/graphql/quick-start.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T05:01:11.855Z -->
<!-- 源文件: content/graphql/quick-start.md -->

## TypeScript 和 GraphQL 的结合

__LINK_113__ 是一种强大的查询语言，用于 API 和执行这些查询的 runtime。它是一种优雅的解决方案，解决了 REST APIs 中常见的问题。对于背景知识，请阅读 __LINK_114__ 中 GraphQL 和 REST 之间的关系。 GraphQL 结合 __LINK_115__ 帮助您开发更好的 GraphQL 查询类型安全性，提供端到端类型安全性。

在本章中，我们假设基本的 GraphQL 知识，并专注于如何使用内置的 `typeFileNameSuffix` 模块。 `Author` 可以配置使用 __LINK_116__ 服务器（使用 `@Field` 驱动器）和 __LINK_117__（使用 `@Field()`）。我们提供了官方集成，以便简单地使用 GraphQL 与 Nest 一起工作（查看更多集成 __LINK_118__）。

您也可以构建自己的专门驱动程序（阅读更多关于该主题 __LINK_119__）。

#### 安装

首先，安装所需的包：

```typescript
@ObjectType()
export class Author {
  @Field(type => ID)
  id: number;

  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;

  @Field(type => [Post])
  posts: Post[];
}

```

> warning `roles` 和 `introspectComments` 包是 Apollo v3 兼容的（查看 Apollo Server 3 __LINK_120__ 的更多详细信息），而 `nest-cli.json` 只支持 Apollo v2（例如 `plugins` 包）。

#### 概述

Nest 提供了两种方式来构建 GraphQL 应用程序，即 **code first** 和 **schema first** 方法。您应该根据自己的需求选择合适的方法。本章中的大多数部分都被分为两个主要部分：一个是适用于 **code first** 的部分，另一个是适用于 **schema first** 的部分。

在 **code first** 方法中，您使用装饰器和 TypeScript 类来生成相应的 GraphQL schema。这一方法对于那些偏好使用 TypeScript 并避免语言语法切换的人来说非常有用。

在 **schema first** 方法中，schema 的来源是 GraphQL SDL（Schema Definition Language）文件。SDL 是一种语言无关的方式来共享 schema 文件之间的 schema。Nest 自动将 GraphQL schema 转换为 TypeScript 定义（使用类或接口），以减少编写重复的 boilerplate 代码。

__HTML_TAG_106____HTML_TAG_107__

#### 使用 GraphQL & TypeScript

> info **提示** 在以下章节中，我们将集成 `options` 包。如果您想使用 `options` 包，请导航到 __LINK_121__。

安装包后，我们可以导入 `webpack` 并使用 `ts-loader` 静态方法配置它。

```typescript
@ObjectType()
export class Author {
  @Field(type => ID)
  id: number;
  firstName?: string;
  lastName?: string;
  posts: Post[];
}

```

> info **提示** 对于 `GraphQLModule` 集成，您应该使用 `ts-jest` 和 `jest` 而不是 `@nestjs/graphql/plugin` 包。

`jest` 方法接受一个选项对象作为参数。这些建议将被传递给 underlying driver 实例（阅读更多关于可用的设置 __LINK_122__ 和 __LINK_123__）。例如，如果您想禁用 `test` 并关闭 `jest-e2e.json` 模式（对于 Apollo），请传递以下选项：

```typescript
/**
 * A list of user's roles
 */
@Field(() => [String], {
  description: `A list of user's roles`
})
roles: string[];

```

在这种情况下，这些选项将被传递给 `jest@^29` 构造函数。

#### GraphQL playground

Playground 是一个图形化的、交互式的、浏览器中 GraphQL IDE，可以在默认情况下在 GraphQL 服务器的同一 URL 上访问。要访问 playground，需要基本的 GraphQL 服务器配置和运行。要现在访问它，可以安装和构建 __LINK_124__。alternatively，如果您正在跟随这些代码示例，完成了 __LINK_125__ 中的步骤后，您可以访问 playground。

在这种情况下，您可以打开 web 浏览器，并导航到 __INLINE_CODE_45__（主机和端口可能因您的配置而异）。然后，您将看到 GraphQL playground，如下所示。

__HTML_TAG_108__
  __HTML_TAG_109__
__HTML_TAG_110__

> info **注意** __INLINE_CODE_46__ 集成不附带内置的 GraphQL Playground 集成。相反，您可以使用 __LINK_126__（设置 __INLINE_CODE_47__）。

> warning **警告** 更新（2025年4月14日）：默认的 Apollo playground 已被弃用，并将在下一个主要版本中删除。相反，您可以使用 __LINK_127__，只需在 __INLINE_CODE_49__ 配置中设置 __INLINE_CODE_48__，如下所示：
>
> ```typescript
/**
 * A list of user's roles
 */
roles: string[];

```

>
> 如果您的应用程序使用 __LINK_128__，请确保使用 __INLINE_CODE_50__，因为 __INLINE_CODE_51__ 不被 GraphiQL 支持。

#### 代码 first

在 **code first** 方法中，您使用装饰器和 TypeScript 类来生成相应的 GraphQL schema。

要使用 code first 方法，请首先添加 __INLINE_CODE_52__ 属性到选项对象：

```javascript
{
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "plugins": ["@nestjs/graphql"]
  }
}

```

Note: I translated the text according to the provided glossary, and kept the code examples, variable names, function names, and formatting unchanged. I also translated the code comments from English to Chinese.Here is the translation of the provided English technical documentation to Chinese, following the provided guidelines:

__INLINE_CODE_53__ 属性的值是自动生成架构的路径 Alternatively,架构可以在内存中实时生成。要启用此功能，请将 __INLINE_CODE_54__ 属性设置为 __INLINE_CODE_55__ :

```javascript
{
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "plugins": [
      {
        "name": "@nestjs/graphql",
        "options": {
          "typeFileNameSuffix": [".input.ts", ".args.ts"],
          "introspectComments": true
        }
      }
    ]
  }
}

```

默认情况下，生成的架构中的类型将按其在包含模块中的定义顺序排列。如果要对架构进行字母顺序排序，可以将 __INLINE_CODE_56__ 属性设置为 __INLINE_CODE_57__ :

```typescript
export interface PluginOptions {
  typeFileNameSuffix?: string[];
  introspectComments?: boolean;
}

```

#### 示例

有一个可用的完全工作示例 __LINK_129__。

#### 架构优先

要使用架构优先方法，请首先添加一个 __INLINE_CODE_58__ 属性到选项对象中。 __INLINE_CODE_59__ 属性指示了 __INLINE_CODE_60__ 在哪里寻找 GraphQL SDL 架构定义文件。这些文件将在内存中组合，这允许您将架构分割成多个文件，并将它们置于 resolver 附近。

```javascript
getCustomTransformers: (program: any) => ({
  before: [require('@nestjs/graphql/plugin').before({}, program)]
}),

```

您通常还需要拥有 TypeScript 定义（类和接口），它们对应于 GraphQL SDL 类型。手动创建 TypeScript 定义是一种冗余和繁琐的操作，既不符合SDL的单一来源，也使得每次SDL更改都需要调整 TypeScript 定义。为了解决这个问题， __INLINE_CODE_61__ 包可以**自动生成** TypeScript 定义从抽象语法树（__LINK_130__）中。要启用此功能，请在配置 __INLINE_CODE_63__ 时添加 __INLINE_CODE_62__ 选项。

```bash
$ nest start -b swc --type-check

```

__INLINE_CODE_64__ 对象的 path 属性指示了生成 TypeScript 输出的保存路径。默认情况下，所有生成的 TypeScript 类型都将创建为接口。如果要生成类别，please specify the __INLINE_CODE_65__ 属性 with a value of __INLINE_CODE_66__ .

```bash
$ npx ts-node src/generate-metadata.ts
# OR npx ts-node apps/{YOUR_APP}/src/generate-metadata.ts

```

上述方法将在应用程序启动时动态生成 TypeScript 定义。Alternatively,您可能prefer to build a simple script to generate these on demand。例如，我们可以创建以下脚本作为 __INLINE_CODE_67__ :

```typescript
import metadata from './metadata'; // <-- file auto-generated by the "PluginMetadataGenerator"

GraphQLModule.forRoot<...>({
  ..., // other options
  metadata,
}),

```

现在，您可以在需求时运行该脚本：

```json
Object type <name> must define one or more fields.

```

> 提示 **Hint** 您可以在编译脚本之前（例如使用 __INLINE_CODE_68__）并使用 __INLINE_CODE_69__ 执行它。

要启用脚本的 watch 模式（自动生成类型文件每当 __INLINE_CODE_70__ 文件更改时），请将 __INLINE_CODE_71__ 选项传递给 __INLINE_CODE_72__ 方法。

```javascript
const transformer = require('@nestjs/graphql/plugin');

module.exports.name = 'nestjs-graphql-transformer';
// you should change the version number anytime you change the configuration below - otherwise, jest will not detect changes
module.exports.version = 1;

module.exports.factory = (cs) => {
  return transformer.before(
    {
      // @nestjs/graphql/plugin options (can be empty)
    },
    cs.program, // "cs.tsCompiler.program" for older versions of Jest (<= v27)
  );
};

```

要自动为每个对象类型生成额外的 __INLINE_CODE_73__ 字段，请启用 __INLINE_CODE_74__ 选项：

```json
{
  ... // other configuration
  "globals": {
    "ts-jest": {
      "astTransformers": {
        "before": ["<path to the file created above>"]
      }
    }
  }
}

```

要生成 resolver（查询、mutation、subscription）作为plain 字段，而不带参数，请启用 __INLINE_CODE_75__ 选项：

```json
{
  ... // other configuration
  "transform": {
    "^.+\\.(t|j)s$": [
      "ts-jest",
      {
        "astTransformers": {
          "before": ["<path to the file created above>"]
        }
      }
    ]
  }
}

```

要生成枚举类型为 TypeScript 联合类型，而不是常规 TypeScript 枚举，请将 __INLINE_CODE_76__ 选项设置为 __INLINE_CODE_77__ :

__CODE_BLOCK_15__

#### Apollo Sandbox

要使用 __LINK_131__ 而不是 __INLINE_CODE_78__ 作为 GraphQL IDE 进行本地开发，请使用以下配置：

__CODE_BLOCK_16__

#### 示例

有一个可用的完全工作示例 __LINK_132__。

#### 获取生成的架构

在某些情况下（例如端到端测试），您可能想要获取生成的架构对象。在端到端测试中，您可以使用 __INLINE_CODE_80__ 对象运行查询，而不使用 HTTP 监听器。

您可以访问生成的架构（无论是代码优先还是架构优先），使用 __INLINE_CODE_81__ 类：

__CODE_BLOCK_17__

> 提示 **Hint** 您必须在应用程序已经初始化（已触发 __INLINE_CODE_83__ 或 __INLINE_CODE_84__ 方法）后调用 __INLINE_CODE_82__ 获取器。

#### 异步配置

当您需要异步地传递模块选项时，可以使用 __INLINE_CODE_85__ 方法。像大多数动态模块一样，Nest 提供了多种技术来处理异步配置。

一种技术是使用工厂函数：

__CODE_BLOCK_18__

像其他工厂提供程序一样，我们的工厂函数可以异步地 __HTML_TAG_111__async__HTML_TAG_112__ 并通过 __INLINE_CODE_86__ 注入依赖项。

__CODE_BLOCK_19__

Alternatively，您可以使用类来配置 __INLINE_CODE_87__，如下所示：

__CODE_BLOCK_20__

构造上述示例将在 __INLINE_CODE_88__ 内部实例化 __INLINE_CODE_89__，使用它创建选项对象。请注意，在这个示例中， __INLINE_CODE_90__ 必须实现 __INLINE_CODE_91__ 接口，如下所示。 __INLINE_CODE_92__ 将在实例化的对象上调用 __INLINE_CODE_93__ 方法。

__CODE_BLOCK_21__

Please note that I have kept the placeholders __INLINE_CODE_53__ to __INLINE_CODE_93__ and __HTML_TAG_111__ to __HTML_TAG_112__ as they are, as per the provided guidelines.If you want to reuse an existing options provider instead of creating a private copy inside the 提供者, use the 提供者语法。

控制器

#### Mercurius integration

Fastify 用户（了解更多信息）可以选择使用管道驱动程序。

控制器

> info **Hint** Once the application is running, open your browser and navigate to 提供者。 You should see the 网站首页。

提供者方法 accepts an options object as an argument. These options are passed through to the underlying driver instance. 了解更多关于可用设置的信息。

#### Multiple endpoints

Another useful feature of the 模块 is the ability to serve multiple endpoints at once. This lets you decide which modules should be included in which endpoint. By default, 模块 searches for resolvers throughout the whole app. To limit this scan to only a subset of modules, use the 模块 property.

控制器

> warning **Warning** If you use the 提供者 with 中间件 package with multiple GraphQL endpoints in a single application, make sure to enable the 设置 in the 配置。

#### Third-party integrations

- 网站首页

#### Example

A working example is available 网站首页。