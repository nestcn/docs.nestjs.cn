<!-- 此文件从 content/graphql/quick-start.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T05:26:56.289Z -->
<!-- 源文件: content/graphql/quick-start.md -->

## TypeScript 和 GraphQL 的强大结合

__LINK_113__ 是一个强大的查询语言，用于 API 和运行时满足这些查询的数据。它是一个优雅的解决方案，解决了 REST API 中常见的问题。关于 GraphQL 和 REST 之间的背景，请阅读 __LINK_114__。

GraphQL 结合 __LINK_115__ 可帮助您更好地使用 GraphQL 查询，提供端到端类型安全。

在本章中，我们假设对 GraphQL 的基本了解，并专注于使用内置的 `typeFileNameSuffix` 模块。`Author` 可以配置使用 __LINK_116__ 服务器（与 `@Field` 驱动器）和 __LINK_117__（与 `@Field()` 驱动器）。我们提供了官方集成，这些集成可以提供使用 GraphQL 和 Nest 的简单方法（查看更多集成 __LINK_118__）。

您还可以建立自己的专门驱动器（阅读更多关于该主题 __LINK_119__）。

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

> warning `roles` 和 `introspectComments` 包括 Apollo v3（查看 Apollo  Server 3 __LINK_120__ 了解更多信息），而 `nest-cli.json` 只支持 Apollo v2（例如 `plugins` 包）。

#### 概述

Nest 提供了两种方式来构建 GraphQL 应用程序：代码优先和架构优先方法。您应该选择最适合您的一种方法。本章中的大多数部分将被分为两部分：如果您采用代码优先方法，需要遵循的部分；如果您采用架构优先方法，需要遵循的部分。

在代码优先方法中，您使用装饰器和 TypeScript 类来生成相应的 GraphQL_SCHEMA。这种方法对于您喜欢使用 TypeScript 并避免语言语法之间的上下文切换非常有用。

在架构优先方法中，GraphQL SDL（Schema Definition Language）文件是源真实的。Nest 自动根据 GraphQL 架构生成 TypeScript 定义（使用类或接口），以减少编写冗余 boilerplate 代码的需求。

__HTML_TAG_106____HTML_TAG_107__

#### 使用 TypeScript 和 GraphQL

> info __Hint__ 在下面的章节中，我们将集成 `options` 包。如果您想使用 `options` 包，可以转到 __LINK_121__。

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

> info __Hint__ 对于 `GraphQLModule` 集成，您应该使用 `ts-jest` 和 `jest` 代替。两个都是来自 `@nestjs/graphql/plugin` 包的导出。

`jest` 方法接受一个 options 对象作为参数。这些选项将被传递到 underlying driver 实例（阅读更多关于可用的设置 __LINK_122__ 和 __LINK_123__）。例如，如果您想禁用 `test` 并关闭 `jest-e2e.json` 模式（对于 Apollo），传递以下选项：

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

playground 是一个图形化的、交互式的、在浏览器中运行的 GraphQL IDE，可以在 GraphQL 服务器的同一个 URL 中访问。要访问 playground，需要基本的 GraphQL 服务器配置和运行。要立即访问，可以安装和构建 __LINK_124__。或者，如果您正在跟随这些代码示例，完成 __LINK_125__ 步骤后，您可以访问 playground。

在这个地方，并且在您的应用程序运行背景下，您可以然后在 web 浏览器中打开并导航到 __INLINE_CODE_45__（主机和端口可能会根据您的配置而变化）。您将看到 GraphQL playground，如下所示。

__HTML_TAG_108__
  __HTML_TAG_109__
__HTML_TAG_110__

> info __Note__ __INLINE_CODE_46__ 集成不包含内置的 GraphQL Playground 集成。相反，您可以使用 __LINK_126__（设置 __INLINE_CODE_47__）。

> warning __Warning__ 更新（2025-04-14）：默认的 Apollo playground 已经被弃用，并将在下一个主要版本中被删除。相反，您可以使用 __LINK_127__，只需在 __INLINE_CODE_49__ 配置中设置 __INLINE_CODE_48__，如下所示：
>
> ```typescript
/**
 * A list of user's roles
 */
roles: string[];

```

>
> 如果您的应用程序使用 __LINK_128__，请确保使用 __INLINE_CODE_50__，因为 __INLINE_CODE_51__ 不支持 GraphiQL。

#### 代码优先

在代码优先方法中，您使用装饰器和 TypeScript 类来生成相应的 GraphQL_SCHEMA。

要使用代码优先方法，请首先添加 __INLINE_CODE_52__ 属性到 options 对象：

```javascript
{
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "plugins": ["@nestjs/graphql"]
  }
}

```Here is the translated Chinese technical documentation:

__INLINE_CODE_53__ 属性的值是自动生成架构的路径。Alternatively, 可以在内存中实时生成架构。要启用此功能，请将 __INLINE_CODE_54__ 属性设置为 __INLINE_CODE_55__ :

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

默认情况下，生成架构中的类型将按其在包含模块中的定义顺序排列。要将架构按字母顺序排序，可以将 __INLINE_CODE_56__ 属性设置为 __INLINE_CODE_57__ :

```typescript
export interface PluginOptions {
  typeFileNameSuffix?: string[];
  introspectComments?: boolean;
}

```

#### 示例

一个完整的工作代码示例可在 __LINK_129__ 中找到。

#### 架构优先

要使用架构优先approach，首先添加一个 __INLINE_CODE_58__ 属性到选项对象中。 __INLINE_CODE_59__ 属性指示__INLINE_CODE_60__ 应该在哪里查找 GraphQL SDL 架构定义文件。这些文件将在内存中组合，这使您可以将架构分割成多个文件，并将它们放置在相应的解析器附近。

```javascript
getCustomTransformers: (program: any) => ({
  before: [require('@nestjs/graphql/plugin').before({}, program)]
}),

```

通常，您还需要有 TypeScript 定义（类和接口），它们对应于 GraphQL SDL 类型。手动创建 TypeScript 定义是冗余的和 tedius。它使我们没有单个真实来源 -- 每个更改都需要调整 TypeScript 定义。为了解决这个问题，__INLINE_CODE_61__ 包可以 **自动生成** TypeScript 定义从抽象语法树（__LINK_130__）。要启用此功能，请在配置 __INLINE_CODE_63__ 时添加 __INLINE_CODE_62__ 选项。

```bash
$ nest start -b swc --type-check

```

__INLINE_CODE_64__ 对象的 `path` 属性指示生成 TypeScript 输出的位置。默认情况下，所有生成的 TypeScript 类型都是接口。要生成类别，指定 __INLINE_CODE_65__ 属性并将其设置为 __INLINE_CODE_66__。

```bash
$ npx ts-node src/generate-metadata.ts
# OR npx ts-node apps/{YOUR_APP}/src/generate-metadata.ts

```

上述方法将在应用程序启动时动态生成 TypeScript 定义。Alternatively，可以创建一个简单的脚本来生成这些定義。例如，假设我们创建了以下脚本作为 __INLINE_CODE_67__ :

```typescript
import metadata from './metadata'; // <-- file auto-generated by the "PluginMetadataGenerator"

GraphQLModule.forRoot<...>({
  ..., // other options
  metadata,
}),

```

现在，您可以在需求时运行这个脚本：

```json
Object type <name> must define one or more fields.

```

> 信息 **提示** 您可以事先编译脚本（例如，以 __INLINE_CODE_68__ 为例）并使用 __INLINE_CODE_69__ 执行它。

要启用脚本的 watch 模式（自动生成定義 whenever任何 __INLINE_CODE_70__ 文件更改），将 __INLINE_CODE_71__ 选项传递给 __INLINE_CODE_72__ 方法。

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

要自动生成每个对象类型的 __INLINE_CODE_73__ 字段，可以启用 __INLINE_CODE_74__ 选项：

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

要生成 resolvers（查询、mutation、subscription）作为简单的字段而不是带参数的字段，可以启用 __INLINE_CODE_75__ 选项：

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

要将枚举类型生成为 TypeScript 联合类型，而不是常规 TypeScript 枚举，可以将 __INLINE_CODE_76__ 选项设置为 __INLINE_CODE_77__ :

__CODE_BLOCK_15__

#### Apollo Sandbox

要使用 __LINK_131__ 替代 __INLINE_CODE_78__ 作为 GraphQL IDE 进行本地开发，可以使用以下配置：

__CODE_BLOCK_16__

#### 示例

一个完整的工作架构优先示例可在 __LINK_132__ 中找到。

#### 访问生成架构

在某些情况下（例如端到端测试），您可能想获取生成架构对象的引用。端到端测试中，您可以使用 __INLINE_CODE_79__ 对象运行查询，而不需要使用任何 HTTP 监听器。

您可以访问生成架构（无论是代码优先还是架构优先approach），使用 __INLINE_CODE_80__ 类：

__CODE_BLOCK_17__

> 信息 **提示** 您必须在应用程序已初始化（在 __INLINE_CODE_82__ 钩子被 __INLINE_CODE_83__ 或 __INLINE_CODE_84__ 方法触发后）时调用 __INLINE_CODE_81__ 获取器。

#### 异步配置

当您需要异步地传递模块选项时，可以使用 __INLINE_CODE_85__ 方法。像大多数动态模块一样，Nest 提供多种技术来处理异步配置。

一种技术是使用工厂函数：

__CODE_BLOCK_18__

我们的工厂函数可以 __HTML_TAG_111__async__HTML_TAG_112__ 并可以通过 __INLINE_CODE_86__ 注入依赖项。

__CODE_BLOCK_19__

Alternatively，可以使用类来配置 __INLINE_CODE_87__，如下所示：

__CODE_BLOCK_20__

构造上述示例将在 __INLINE_CODE_89__ 内部实例化 __INLINE_CODE_88__，使用它创建选项对象。请注意，在这个示例中，__INLINE_CODE_90__ 必须实现 __INLINE_CODE_91__ 接口，如下所示。__INLINE_CODE_92__ 将在实例化对象的 __INLINE_CODE_93__ 方法上调用。

__CODE_BLOCK_21__Here is the translated technical documentation from English to Chinese:

如果您想重用现有的选项提供者，而不是在 __INLINE_CODE_95__ 中创建私有副本，可以使用 __INLINE_CODE_95__ 语法。

__CODE_BLOCK_22__

#### Mercurius 集成

Fastify 用户（了解更多 __LINK_133__）可以使用 __INLINE_CODE_96__ 驱动程序作为替代方案。

__CODE_BLOCK_23__

> 提示 **Hint** 应用程序运行后，打开浏览器，导航到 __INLINE_CODE_97__。您应该看到 __LINK_134__。

__INLINE_CODE_98__ 方法接受一个选项对象作为参数。这些选项将传递给 underlying 驱动程序实例。了解更多关于可用的设置 __LINK_135__。

#### 多个端点

__INLINE_CODE_99__ 模块的另一个有用的特性是可以同时服务多个端点。这让您决定哪些模块应该包含在哪个端点中。默认情况下，__INLINE_CODE_100__ 将在整个应用程序中搜索解析器。要将扫描限制到仅subset 模块，请使用 __INLINE_CODE_101__ 属性。

__CODE_BLOCK_24__

> 警告 **Warning** 如果您使用 __INLINE_CODE_102__ 和 __INLINE_CODE_103__ 包含多个 GraphQL 端点在单个应用程序中，请确保在 __INLINE_CODE_105__ 配置中启用 __INLINE_CODE_104__ 设置。

#### 第三方集成

- __LINK_136__

#### 示例

有一个可运行的示例 __LINK_137__。