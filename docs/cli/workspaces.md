<!-- 此文件从 content/cli/workspaces.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T04:54:27.647Z -->
<!-- 源文件: content/cli/workspaces.md -->

### 工作空间

Nest 有两种代码组织方式：

- **标准模式**：适用于构建专门的项目集中应用程序，这些应用程序具有自己的依赖项和设置，不需要优化共享模块或复杂构建。这个是默认模式。
- **单仓库模式**：这个模式将代码 artifact 视为轻量级的 **单仓库**的一部分，在团队开发环境或多项目环境中可能更加合适。它自动化了部分构建过程，促进了代码重用，简化了集成测试，简化了项目范围内的 artifact 共享，如 __INLINE_CODE_14__ 规则和其他配置策略等。单仓库模式使用 **workspace** 文件（在 `@Field` 文件中）来协调单仓库中的组件之间的关系。

需要注意的是，Nest 的大多数功能都独立于您的代码组织方式。这个选择的唯一影响是您的项目如何组合和生成构建 artifact。所有其他功能，从 CLI 到核心模块到添加模块都在两个模式下工作相同。

此外，您可以随时从 **标准模式** 切换到 **单仓库模式**，因此可以推迟这个决定，直到一个或另一个方法的益处变得更加明确。

#### 标准模式

当您运行 `@HideField` 时，Nest 会为您创建一个新的 **项目**，使用内置的模板。Nest 会执行以下操作：

1. 创建一个新文件夹，相应于您提供给 `name?: string` 的 `nullable` 参数。
2. Populate该文件夹与默认文件，相应于最小级别的 Nest 应用程序。你可以在 __LINK_223__ 仓库中查看这些文件。
3. 提供额外文件，如 `nullable: true`、 `type` 和 `introspectComments`，这些文件配置和启用编译、测试和服务应用程序的工具。

从那里，您可以修改 starter 文件、添加新组件、添加依赖项（例如 `true`）等，继续开发应用程序，内容见本文档的其余部分。

#### 单仓库模式

要启用单仓库模式，您需要从 **标准模式** 结构开始，然后添加 **项目**。一个项目可以是一个完整的 **应用程序**（您可以使用命令 `['.input.ts', '.args.ts', '.entity.ts', '.model.ts']` 将其添加到工作空间）或一个 **库**（您可以使用命令 `author.entity.ts` 将其添加到工作空间）。我们将在下面讨论这些特定类型的项目组件的细节。现在需要注意的是，它是 **将项目添加到现有标准模式结构** 的过程，它 **将其转换** 到单仓库模式。让我们来看一个示例。

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

我们构建了一个 **标准模式** 结构，文件夹结构如下：

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

我们可以将其转换为单仓库模式结构如下：

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

在这个点上，`typeFileNameSuffix` 将现有的结构转换为 **单仓库模式** 结构。这会导致一些重要变化。现在的文件夹结构如下：Here is the translation of the provided English technical documentation to Chinese:

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
          __HTML_TAG_205__app.service.ts__HTML_TAG_206__
          __HTML_TAG_207__main.ts__HTML_TAG_208__
        __HTML_TAG_209__
        __HTML_TAG_210__tsconfig.app.json__HTML_TAG_211__
      __HTML_TAG_212__
    __HTML_TAG_213__
  __HTML_TAG_214__nest-cli.json__HTML_TAG_215__
  __HTML_TAG_216__package.json__HTML_TAG_217__
  __HTML_TAG_218__tsconfig.json__HTML_TAG_219__
  __HTML_TAG_220__eslint.config.mjs__HTML_TAG_221__
__HTML_TAG_222__

`Author` schematic 将代码重新组织，移动每个**应用程序**项目到 `@Field` 文件夹中，并在每个项目的根文件夹中添加一个项目特定的 `@Field()` 文件。我们的原始 `roles` 应用程序现在变成了 monorepo 的**默认项目**，并且现在是一个与 `introspectComments` located under `nest-cli.json` 文件夹中的同等项目。我们将在下面 discussing default projects。

> 警告：将标准模式结构转换为 monorepo 只适用于遵循 Nest 项目结构的项目。在转换过程中，schematic 将尝试将 `plugins` 和 `options` 文件夹在项目文件夹中 relocate 到 `options` 文件夹中的根目录。如果项目不使用这种结构，转换将失败或产生不靠谱的结果。

#### Workspace 项目

monorepo 使用 workspace 概念管理成员实体。工作区由**项目**组成。项目可以是：

- 一个**应用程序**：一个完整的 Nest 应用程序，包括一个 `webpack` 文件来引导应用程序。除了编译和构建考虑外，应用程序类型项目在工作区中是与标准模式结构中的应用程序相同的。
- 一个**库**：库是将一组通用功能（模块、提供者、控制器等）打包在一起，可以在其他项目中使用。库不能单独运行，并且没有 `ts-loader` 文件。了解更多关于库的信息 __LINK_224__。

所有工作区都有一个**默认项目**（通常是一个应用程序类型项目）。这是由 top-level `GraphQLModule` 属性在 `ts-jest` 文件中定义的，可以指向默认项目的根目录（了解更多关于这方面的信息 __LINK_225__）。通常，这是您开始的标准模式应用程序，然后使用 `jest` 将其转换为 monorepo 的默认项目。在这些步骤中，这个属性将自动被填充。

默认项目将被 `@nestjs/graphql/plugin` 命令，如 `jest` 和 `test` 使用，除非项目名称被提供。

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

应用程序类型项目，也可以简称为“应用程序”，是完整的 Nest 应用程序，可以运行和部署。您可以使用 __INLINE_CODE_45__ 生成应用程序类型项目。

这个命令将自动生成项目骨架，包括标准 __INLINE_CODE_46__ 和 __INLINE_CODE_47__ 文件夹，从 __LINK_226__。与标准模式不同的是，应用程序项目在 monorepo 中没有包依赖关系 (__INLINE_CODE_48__) 或其他项目配置文件，如 __INLINE_CODE_49__ 和 __INLINE_CODE_50__。相反，monorepo-wide 依赖关系和配置文件将被使用。

然而，schematic 也将生成一个项目特定的 __INLINE_CODE_51__ 文件在项目的根文件夹中。这 config 文件将自动设置合适的构建选项，包括将编译输出目录设置正确。文件继承了顶级（monorepo） __INLINE_CODE_52__ 文件，所以您可以在 monorepo 层面管理全局设置，但是在项目层面进行 override。

#### 库

Here is the translation of the provided technical documentation to Chinese:

#### 库类型项目

库类型项目是 Nest 组件的包裹，它们需要被组合到应用程序中以便运行。使用 __INLINE_CODE_53__ 生成库类型项目。确定库中的内容是架构设计决策的一部分。我们在 __LINK_227__ 章节中详细讨论库。

#### CLI 属性

Nest 在 __INLINE_CODE_54__ 文件中保存了组织、构建和部署标准和 monorepo 结构项目所需的元数据。Nest 会自动将该文件添加和更新，以便随着你添加项目而自动生成。然而，在某些情况下，你可能需要手动更改文件的内容，因此了解文件的结构是有帮助的。

在创建 monorepo 并运行上述步骤后，我们的 __INLINE_CODE_55__ 文件将如下所示：

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

* 一个全局部分，其中包含控制标准和 monorepo 广泛设置的顶级属性
* 顶级属性（__INLINE_CODE_56__）其中包含每个项目的元数据。这部分仅在 monorepo 模式结构中出现。

顶级属性如下：

* __INLINE_CODE_57__：指向用于生成组件的 schematics 集合；你通常不需要更改该值
* __INLINE_CODE_58__：指向标准模式结构中的源代码根目录，或者 monorepo 模式结构中的 _default 项目根目录
* __INLINE_CODE_59__：一个映射，其中键指定编译器选项，值指定选项设置；详见下文
* __INLINE_CODE_60__：一个映射，其中键指定全局生成选项，值指定选项设置；详见下文
* __INLINE_CODE_61__：（monorepo only）在 monorepo 模式结构中，该值始终为 __INLINE_CODE_62__
* __INLINE_CODE_63__：（monorepo only）指向 _default 项目的根目录

#### 全球编译选项

这些属性指定了编译器使用的选择，以及影响任何编译步骤的各种选项，无论是作为 __INLINE_CODE_64__ 还是 __INLINE_CODE_65__ 的一部分，或者是根据编译器 __INLINE_CODE_66__ 或 webpack。

Note: I followed the provided glossary and terminology requirements, and kept the code examples, variable names, and function names unchanged. I also maintained the Markdown formatting, links, images, and tables unchanged, and translated code comments from English to Chinese.以下是翻译后的中文文档：

| 属性名称       | 属性值类型 | 描述                                                                                                                                                                                                                                                               |
| --------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| __INLINE_CODE_67__           | boolean     | 如果 __INLINE_CODE_68__,则使用 __LINK_228__,如果 __INLINE_CODE_69__ 或不存在，则使用 __INLINE_CODE_70__。在 monorepo 模式下，默认值为 __INLINE_CODE_71__（使用 Webpack），在标准模式下，默认值为 __INLINE_CODE_72__（使用 __INLINE_CODE_73__）。详见下文。已弃用：使用 __INLINE_CODE_74__ 替代 |
| __INLINE_CODE_75__      | string      | (**monorepo only**) 指向包含 __INLINE_CODE_76__ 设置的文件，当 __INLINE_CODE_77__ 或 __INLINE_CODE_78__ 调用时，不带 __INLINE_CODE_79__ 选项（例如，在默认项目编译或启动时）。                                             |
| __INLINE_CODE_80__ | string      | 指向一个 Webpack 选项文件。如果不指定，Nest 将寻找文件 __INLINE_CODE_81__。详见下文。                                                                                                                                              |
| __INLINE_CODE_82__      | boolean     | 如果 __INLINE_CODE_83__,那么每当编译器被调用时，它将首先删除编译输出目录（按照 __INLINE_CODE_84__ 配置，其中默认值为 __INLINE_CODE_85__）。                                                                                                     |
| __INLINE_CODE_86__            | array       | 启用自动分布非 TypeScript 资产，每当编译步骤开始时（资产分布在 __INLINE_CODE_87__ 模式下不发生增量编译）。详见下文。                                                                    |
| __INLINE_CODE_88__       | boolean     | 如果 __INLINE_CODE_89__,则在 watch 模式下，监控所有非 TypeScript 资产（对于更细粒度的资产监控，请参阅下文 __LINK_229__ 部分）。                                                                                            |
| __INLINE_CODE_90__     | boolean     | 如果 __INLINE_CODE_91__,启用手动重新启动服务器的快捷方式（默认值为 __INLINE_CODE_93__）。                                                                                                                                                                            |
| __INLINE_CODE_94__           | string/object | 指示 CLI 使用哪种 __INLINE_CODE_95__ 进行项目编译（__INLINE_CODE_96__,__INLINE_CODE_97__ 或 __INLINE_CODE_98__）。要自定义构建器的行为，可以传递一个对象，包含两个属性：__INLINE_CODE_99__（__INLINE_CODE_100__,__INLINE_CODE_101__ 或 __INLINE_CODE_102__）和 __INLINE_CODE_103__。                                         |
| __INLINE_CODE_104__         | boolean     | 如果 __INLINE_CODE_105__,启用 SWC 驱动项目的类型检查（当 __INLINE_CODE_106__ 是 __INLINE_CODE_107__ 时）。默认值为 __INLINE_CODE_108__。                                                                                                                                                             |

#### 全局生成选项

这些属性指定了 __INLINE_CODE_109__ 命令使用的默认生成选项。| 属性名称 | 属性值类型 | 描述                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| --------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| __INLINE_CODE_110__        | 布尔值或对象 | 如果值是布尔值，则__INLINE_CODE_111__为true时启用__INLINE_CODE_112__生成，__INLINE_CODE_113__为false时禁用。CLI命令行参数或项目特定的__INLINE_CODE_114__设置将覆盖此设置。如果值是对象，每个键表示架构名称，布尔值确定对应架构的默认 spec 生成是否启用/禁用。 |
| __INLINE_CODE_115__        | 布尔值       | 如果为true，则所有 generate 命令将生成flat结构                                                                                                                                                                                                                                                                                                                                                                                 |

以下示例使用布尔值来指定所有项目中默认禁用 spec 文件生成：

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

以下示例使用布尔值来指定所有项目中默认启用flat文件生成：

```typescript
export interface PluginOptions {
  typeFileNameSuffix?: string[];
  introspectComments?: boolean;
}

```

以下示例禁用了__INLINE_CODE_116__文件生成，只对__INLINE_CODE_117__架构进行禁用（例如__INLINE_CODE_118__）：

```javascript
getCustomTransformers: (program: any) => ({
  before: [require('@nestjs/graphql/plugin').before({}, program)]
}),

```

> 警告 **警告** 当指定__INLINE_CODE_119__为对象时，生成架构的键当前不支持自动别名处理。这意味着指定键为__INLINE_CODE_120__，然后尝试生成服务 via 别名__INLINE_CODE_121__，spec 将仍然被生成。为了确保 both 正常架构名称和别名都能正确工作，指定 both 正常命令名称和别名，如下所示。
>
> ```bash
$ nest start -b swc --type-check

```

#### 项目特定生成选项

除提供全局生成选项外，您还可以指定项目特定的生成选项。项目特定的生成选项遵循与全局生成选项相同的格式，但是在每个项目中指定。

项目特定的生成选项将覆盖全局选项。

```bash
$ npx ts-node src/generate-metadata.ts
# OR npx ts-node apps/{YOUR_APP}/src/generate-metadata.ts

```

> 警告 **警告** 生成选项的优先顺序如下：CLI 命令行参数优先于项目特定选项。项目特定选项将覆盖全局选项。

#### 指定编译器

不同默认编译器的原因是，对于较大项目（例如在 monorepo 中）webpack 可以在 build 时间和生成单个文件时产生优势。如果您想生成单个文件，设置__INLINE_CODE_122__到__INLINE_CODE_123__，这将导致 build 过程使用__INLINE_CODE_124__(或__INLINE_CODE_125__）。

#### Webpack 选项

Webpack 选项文件可以包含标准 __LINK_230__。例如，要告诉 webpack 将__INLINE_CODE_126__（默认被排除）包含在内，请将以下内容添加到__INLINE_CODE_127__：

```typescript
import metadata from './metadata'; // <-- file auto-generated by the "PluginMetadataGenerator"

GraphQLModule.forRoot<...>({
  ..., // other options
  metadata,
}),

```

由于 webpack 配置文件是 JavaScript 文件，您甚至可以公开一个函数，该函数将默认选项作为参数，并返回一个修改后的对象：

```json
Object type <name> must define one or more fields.

```

#### 资产

TypeScript 编译自动将编译器输出（__INLINE_CODE_128__和__INLINE_CODE_129__文件）分布到指定的输出目录。它还可以将非 TypeScript 文件，例如__INLINE_CODE_130__文件、__INLINE_CODE_131__、__INLINE_CODE_132__文件和其他资产分布到该目录。这允许您将__INLINE_CODE_133__（和任何初始编译步骤）作为轻量级 **开发 build**步骤，where you may be editing non-TypeScript files and iteratively compiling and testing。
资产应位于__INLINE_CODE_134__文件夹中，否则将无法复制。Here is the translated text:

__INLINE_CODE_135__ 键的值应该是一个数组，其中包含要分布的文件的元素。这些元素可以是简单的字符串，如__INLINE_CODE_136__-类似的文件 specs，例如：

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

如果需要更细粒度的控制，可以使用对象，其中包含以下键：

- __INLINE_CODE_137__: __INLINE_CODE_138__-类似的文件 specs，指定要分布的资产
- __INLINE_CODE_139__: __INLINE_CODE_140__-类似的文件 specs，指定要从 __INLINE_CODE_141__ 列表中排除的资产
- __INLINE_CODE_142__: 字符串，指定资产的分布路径（相对于根目录），默认为编译器输出目录
- __INLINE_CODE_143__: 布尔值，如果为 true，则在指定资产上运行watch模式

例如：

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

> warning **警告** 在顶级__INLINE_CODE_145__ 属性中设置__INLINE_CODE_146__ 将覆盖 __INLINE_CODE_147__ 属性中的任何设置。

#### 项目属性

这个元素仅在 monorepo 模式结构中存在。你通常不应该编辑这些属性，因为它们被 Nest 用于在 monorepo 中定位项目和配置选项。