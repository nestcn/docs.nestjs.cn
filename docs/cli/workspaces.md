<!-- 此文件从 content/cli/workspaces.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:27:14.700Z -->
<!-- 源文件: content/cli/workspaces.md -->

### Workspaces

Nest 有两个代码组织模式：

- **标准模式**：用于构建单个项目集中应用程序，这些应用程序具有自己的依赖项和设置，不需要优化共享模块或复杂构建。这个模式是默认的。
- **monorepo 模式**：这个模式将代码artifact视为轻量级 **monorepo** 的一部分，并且可能更适合团队开发人员和/或多项目环境。它自动化了构建过程，使得创建和组合模块变得容易，促进代码重用，使集成测试变得容易，使得项目wideartifact，如 __INLINE_CODE_14__ 规则和其他配置策略变得容易共享。monorepo 模式使用 `@Field` 文件来协调monorepo 组件之间的关系。

需要注意的是，Nest 大多数功能都是独立于代码组织模式的。这个选择的唯一影响是项目如何组合和生成构建artifact。所有其他功能，从 CLI 到核心模块到插件模块都在两个模式下工作相同。

此外，您可以轻松地在 **标准模式** 和 **monorepo 模式** 之间切换，以便推迟这个决策直到两个模式的优势变得更加明确。

#### 标准模式

当您运行 `@HideField` 时，Nest 将为您创建一个新的 **project**，使用内置的架构。Nest 将执行以下操作：

1. 创建一个新的文件夹，相应于您提供给 `name?: string` 的 `nullable` 参数。
2. 将该文件夹填充默认文件，相应于最小的 Nest 应用程序基础。您可以在 __LINK_223__ 仓库中查看这些文件。
3. 提供额外文件，如 `nullable: true`、`type` 和 `introspectComments`，这些文件配置和启用编译、测试和服务应用程序的工具。

从那里，您可以修改starter 文件，添加新组件，添加依赖项（例如 `true`），并按照 rest 文档中的其他部分进行应用程序开发。

#### Monorepo 模式

要启用 monorepo 模式，您需要从 **标准模式** 结构开始，并添加 **projects**。一个项目可以是完整的 **应用程序**（您可以使用命令 `['.input.ts', '.args.ts', '.entity.ts', '.model.ts']` 将其添加到工作区）或 **库**（您可以使用命令 `author.entity.ts` 将其添加到工作区）。我们将在下面讨论这些特定类型的项目组件的细节。当前需要注意的是，添加项目到现有 **标准模式** 结构中将 **将其转换为** monorepo 模式。让我们来看一个示例。

如果我们运行：

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

我们构建了一个 **标准模式** 结构，文件夹结构如下所示：

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

我们可以将其转换为 monorepo 模式结构如下所示：

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

在这个点上，`typeFileNameSuffix` 将现有结构转换为 **monorepo 模式** 结构。这将导致一些重要的变化。文件夹结构现在如下所示：<__HTML_TAG_173__>
  <__HTML_TAG_174__>应用程序__HTML_TAG_175__>
    <__HTML_TAG_176__>
      <__HTML_TAG_177__my-app__HTML_TAG_178__>
      <__HTML_TAG_179__>
        <__HTML_TAG_180__src__HTML_TAG_181__>
          <__HTML_TAG_182__>
            <__HTML_TAG_183__app.controller.ts__HTML_TAG_184__>
            <__HTML_TAG_185__app.module.ts__HTML_TAG_186__>
            <__HTML_TAG_187__app.service.ts__HTML_TAG_188__>
            <__HTML_TAG_189__main.ts__HTML_TAG_190__>
          </__HTML_TAG_191__>
          <__HTML_TAG_192__tsconfig.app.json__HTML_TAG_193__>
      <__HTML_TAG_194__>
      <__HTML_TAG_195__my-project__HTML_TAG_196__>
      <__HTML_TAG_197__>
        <__HTML_TAG_198__src__HTML_TAG_199__>
          <__HTML_TAG_200__>
            <__HTML_TAG_201__app.controller.ts__HTML_TAG_202__>
            <__HTML_TAG_203__app.module.ts__HTML_TAG_204__>
            <__HTML_TAG_205__app.service.ts__HTML_TAG_206__>
            <__HTML_TAG_207__main.ts__HTML_TAG_208__>
          </__HTML_TAG_209__>
          <__HTML_TAG_210__tsconfig.app.json__HTML_TAG_211__>
      <__HTML_TAG_212__>
    <__HTML_TAG_213__>
  <__HTML_TAG_214__nest-cli.json__HTML_TAG_215__>
  <__HTML_TAG_216__package.json__HTML_TAG_217__>
  <__HTML_TAG_218__tsconfig.json__HTML_TAG_219__>
  <__HTML_TAG_220__eslint.config.mjs__HTML_TAG_221__>
<__HTML_TAG_222__>

NestJS 的 `Author` 架模已经重新组织了代码，将每个 **应用程序** 项目移动到 `@Field` 文件夹下，并在每个项目的根文件夹下添加一个项目特定的 `@Field()` 文件。我们的原始 `roles` 应用程序现在变成了 **默认项目**，并且现在是一个与 `introspectComments` 文件夹下的 `nest-cli.json` 文件夹中的 peer。我们将在以下部分中涵盖默认项目。

> 警告**错误**将标准模式结构转换为 monorepo 只能用于遵循 Nest 项目结构的项目。特别是在转换过程中，架模尝试将 `plugins` 和 `options` 文件夹移到项目文件夹下的 `options` 文件夹中。如果项目不使用这种结构，转换将失败或生成不靠谱的结果。

#### Workspace 项目

monorepo 使用 Workspace 概念来管理其成员实体。Workspace 由 **项目** 组成。项目可以是：

- **应用程序**：一个完整的 Nest 应用程序，包括一个 `webpack` 文件来引导应用程序。除了编译和构建考虑外，应用程序类型项目在 workspace 中是与标准模式结构中的应用程序相同的。
- **库**：库是一个将通用功能（模块、提供者、控制器等）封装在一起的方式，可以在其他项目中使用。库不能单独运行，并且没有 `ts-loader` 文件。了解更多关于库的信息 __LINK_224__。

所有 Workspace 都有一个 **默认项目**（通常是一个应用程序类型项目）。这个项目是由 top-level `GraphQLModule` 属性在 `ts-jest` 文件中定义的，这个属性指向默认项目的根文件夹（了解更多关于默认项目 __LINK_225__ ）。通常，这是您最初开始的 **标准模式** 应用程序，然后使用 `jest` 将其转换为 monorepo。遵循这些步骤时，这个属性将被自动填充。

默认项目用于 `@nestjs/graphql/plugin` 命令，如 `jest` 和 `test`，当项目名称没有提供时。

例如，在上面的 monorepo 结构中，运行

```typescript
/**
 * A list of user's roles
 */
@Field(() => [String], {
  description: `A list of user's roles`
})
roles: string[];

```

将启动 `jest-e2e.json` 应用程序。要启动 `jest@^29`，我们将使用：

```typescript
/**
 * A list of user's roles
 */
roles: string[];

```

#### 应用程序

应用程序类型项目，即我们可能非正式地称之为“应用程序”，是完全的 Nest 应用程序，可以运行和部署。您可以使用 __INLINE_CODE_45__ 生成应用程序类型项目。

这个命令自动生成项目骨架，包括标准的 __INLINE_CODE_46__ 和 __INLINE_CODE_47__ 文件夹从 __LINK_226__。与标准模式不同，应用程序项目在 monorepo 中不包含任何包依赖关系 (__INLINE_CODE_48__) 或其他项目配置文件，如 __INLINE_CODE_49__ 和 __INLINE_CODE_50__。相反，monorepo-wide 依赖关系和 config 文件被使用。

然而，架模也生成了项目特定的 __INLINE_CODE_51__ 文件在项目的根文件夹下。这 config 文件Here is the translation of the English technical documentation to Chinese:

### 庫類型项目

库类型项目（library-type projects），简称“库”，是 Nest 组件的集合，需要被组合到应用程序中以运行。使用 __INLINE_CODE_53__ 生成库类型项目。决定库中包含什么是一个架构设计决策。我们在 __LINK_227__ 章节中深入讨论了库。

#### CLI 属性

Nest 将在 __INLINE_CODE_54__ 文件中保存需要组织、构建和部署标准和 monorepo 结构项目的元数据。Nest 将自动添加和更新这个文件，以便你添加项目时不需要考虑或编辑其内容。然而，有些设置你可能需要手动更改，所以了解文件的结构是有帮助的。

在运行上述步骤创建 monorepo 之后，我们的 __INLINE_CODE_55__ 文件将如下所示：

```javascript
{
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "plugins": ["@nestjs/graphql"]
  }
}

```

文件被分为以下部分：

- 全局部分：控制标准和 monorepo 广泛设置的顶级属性
- 顶级属性（__INLINE_CODE_56__）：关于每个项目的元数据。这部分仅在 monorepo 模式结构中出现。

顶级属性如下：

- __INLINE_CODE_57__：指向用于生成组件的 schematics 集合；通常不需要更改这个值
- __INLINE_CODE_58__：指向标准模式结构中的单个项目的源代码根目录，或者 monorepo 模式结构中的默认项目的源代码根目录
- __INLINE_CODE_59__：一个映射，key 指定编译器选项，value 指定选项设置；详见下文
- __INLINE_CODE_60__：一个映射，key 指定全局生成选项，value 指定选项设置；详见下文
- __INLINE_CODE_61__：（monorepo only）在 monorepo 模式结构中，这个值总是 __INLINE_CODE_62__
- __INLINE_CODE_63__：（monorepo only）指向默认项目的项目根目录

#### 全局编译器选项

这些属性指定了编译器，以及影响任何编译步骤的各种选项，无论是作为 __INLINE_CODE_64__ 或 __INLINE_CODE_65__ 的一部分，或者不管编译器是否为 __INLINE_CODE_66__ 或 webpack。Here is the translation of the English technical documentation to Chinese:

| 属性名称         | 属性值类型        | 描述                                                                                                                                                                                                                               |
| --------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| __INLINE_CODE_67__           | boolean         | 如果 __INLINE_CODE_68__, 使用 __LINK_228__. 如果 __INLINE_CODE_69__ 或不存在, 使用 __INLINE_CODE_70__. 在 monorepo 模式下, 默认值为 __INLINE_CODE_71__ (使用 Webpack), 在标准模式下, 默认值为 __INLINE_CODE_72__ (使用 __INLINE_CODE_73__)。详见下文。已弃用：使用 __INLINE_CODE_74__ 替代         |
| __INLINE_CODE_75__      | string          | (**monorepo only**) 指向包含 __INLINE_CODE_76__ 设置的文件，该文件将在 __INLINE_CODE_77__ 或 __INLINE_CODE_78__ 调用时使用，例如在默认项目构建或启动时。                                             |
| __INLINE_CODE_80__ | string          | 指向一个 Webpack 选项文件。 如果没有指定，Nest 将查找文件 __INLINE_CODE_81__。详见下文。                                                                                                                                              |
| __INLINE_CODE_82__      | boolean         | 如果 __INLINE_CODE_83__, 在编译器被调用时，将首先删除编译输出目录（根据 __INLINE_CODE_84__ 配置，其中的默认值为 __INLINE_CODE_85__）。                                                                                                     |
| __INLINE_CODE_86__            | array           | 启用自动分布非 TypeScript 资产，每当编译步骤开始时（资产分布在 __INLINE_CODE_87__ 模式下不发生 incremental compiles）。详见下文。                                                                    |
| __INLINE_CODE_88__       | boolean         | 如果 __INLINE_CODE_89__, 在 watch 模式下，监听 **所有** 非 TypeScript 资产。 (对于 fine-grained 控制资产的监听，见下文 __LINK_229__ 部分)                                                                                            |
| __INLINE_CODE_90__     | boolean         | 如果 __INLINE_CODE_91__, 启用快捷键 __INLINE_CODE_92__ 手动重启服务器。默认值为 __INLINE_CODE_93__。                                                                                                                                                                            |
| __INLINE_CODE_94__           | string/object   | 指示 CLI 使用什么 __INLINE_CODE_95__ 编译项目（__INLINE_CODE_96__, __INLINE_CODE_97__, 或 __INLINE_CODE_98__）。要自定义 builder 的行为，可以传入一个对象，其中包含两个属性：__INLINE_CODE_99__ (__INLINE_CODE_100__, __INLINE_CODE_101__, 或 __INLINE_CODE_102__) 和 __INLINE_CODE_103__。                                         |
| __INLINE_CODE_104__         | boolean         | 如果 __INLINE_CODE_105__, 启用 SWC 驱动项目的类型检查（当 __INLINE_CODE_106__ 是 __INLINE_CODE_107__ 时）。默认值为 __INLINE_CODE_108__。                                                                                                                                                             |

#### 全局生成选项

这些属性指定了 __INLINE_CODE_109__ 命令默认使用的生成选项。Here is the translation of the provided English technical documentation to Chinese:

| 属性名称 | 属性值类型 | 描述                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ------------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| __INLINE_CODE_110__        | boolean _or_ object | 如果值为 boolean,__INLINE_CODE_111__启用 __INLINE_CODE_112__生成，默认为禁用。如果值为对象，每个键代表一个架构名称，Boolean值确定该特定架构的默认 spec 生成是否启用/禁用。 |
| __INLINE_CODE_115__        | boolean             | 如果为 true，所有 generate 命令将生成flat 结构                                                                                                                                                                                                                                                                                                                                                                                 |

以下示例使用 boolean 值指定所有项目中 spec 文件生成默认禁用：

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

以下示例使用 boolean 值指定flat 文件生成为所有项目默认：

```typescript
export interface PluginOptions {
  typeFileNameSuffix?: string[];
  introspectComments?: boolean;
}

```

在以下示例中，__INLINE_CODE_116__文件生成仅对 __INLINE_CODE_117__ 架构禁用（例如 __INLINE_CODE_118__）：

```javascript
getCustomTransformers: (program: any) => ({
  before: [require('@nestjs/graphql/plugin').before({}, program)]
}),

```

> 警告 **Warning** 当指定 __INLINE_CODE_119__ 作为对象时，生成架构的键当前不支持自动别名处理。这意味着指定一个键为例如 __INLINE_CODE_120__，并尝试生成一个服务via 别名 __INLINE_CODE_121__，spec 文件仍将被生成。要确保两个架构名称和别名都能正确工作，请同时指定正常命令名称和别名，如下所示。
>
> ```bash
$ nest start -b swc --type-check

```

#### 项目特定的生成选项

除了提供全局生成选项，您还可以指定项目特定的生成选项。项目特定的生成选项遵循与全局生成选项相同的格式，但是在每个项目上指定。

项目特定的生成选项将override全局选项。

```bash
$ npx ts-node src/generate-metadata.ts
# OR npx ts-node apps/{YOUR_APP}/src/generate-metadata.ts

```

> 警告 **Warning** 生成选项的顺序优先级如下。CLI 命令行指定的选项优先于项目特定选项。项目特定选项override全局选项。

#### 指定的编译器

不同默认编译器的原因是，对于更大的项目（例如在 monorepo 中更常见），webpack 可以在 build 时间和生产单个文件中所有项目组件的优点。如果您想生成单个文件，请将 __INLINE_CODE_122__ 设置为 __INLINE_CODE_123__，这将导致 build 过程使用 __INLINE_CODE_124__ (或 __INLINE_CODE_125__）。

#### Webpack 选项

webpack 选项文件可以包含标准 __LINK_230__。例如，要告诉webpack 将 __INLINE_CODE_126__（默认被排除）包含在内，请将以下内容添加到 __INLINE_CODE_127__：

```typescript
import metadata from './metadata'; // <-- file auto-generated by the "PluginMetadataGenerator"

GraphQLModule.forRoot<...>({
  ..., // other options
  metadata,
}),

```

由于webpack 配置文件是一个 JavaScript 文件，您甚至可以公开一个函数，该函数将默认选项作为参数并返回修改后的对象：

```json
Object type <name> must define one or more fields.

```

#### 资产

TypeScript 编译自动将编译器输出（__INLINE_CODE_128__和__INLINE_CODE_129__文件）分布到指定的输出目录。此外，也可以将非 TypeScript 文件，例如 __INLINE_CODE_130__ 文件、__INLINE_CODE_131__、__INLINE_CODE_132__ 文件和其他资产分布到该目录。这允许您将 __INLINE_CODE_133__（和任何初始编译步骤）作为轻量级 **开发 build** 步骤，where you may be editing non-TypeScript files and iteratively compiling and testing。
资产应该位于 __INLINE_CODE_134__ 文件夹中，否则它们将不被复制。以下是翻译后的中文技术文档：

`__INLINE_CODE_135__` 键的值是一个指定要分配文件的数组，数组元素可以是简单的字符串，例如：

```

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

```

为了获得更好的控制，数组元素也可以是对象，具有以下键：

* `__INLINE_CODE_137__`：指定要分配的文件 specs，例如 __INLINE_CODE_138__。
* `__INLINE_CODE_139__`：指定要从 `__INLINE_CODE_141__` 列表中排除的文件 specs，例如 __INLINE_CODE_140__。
* `__INLINE_CODE_142__`：一个字符串，指定要分配文件的路径（相对于根目录），默认情况下是编译输出目录。
* `__INLINE_CODE_143__`：布尔值；如果为 `true`，则在指定资产上运行 watch 模式。

例如：

```

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

```

> 警告 **警告** 在顶级 `__INLINE_CODE_146__` 属性中设置 `__INLINE_CODE_145__` 将覆盖 `__INLINE_CODE_147__` 设置在 `__INLINE_CODE_148__` 属性中。

#### 项目属性

只有在 monorepo 模式结构中存在这个元素。你通常不应该编辑这些属性，因为它们用于 Nest 定位项目和其配置选项在 monorepo 中。