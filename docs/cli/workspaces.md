<!-- 此文件从 content/cli/workspaces.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T04:46:23.038Z -->
<!-- 源文件: content/cli/workspaces.md -->

### workspace

Nest 有两种组织代码的模式：

- **standard mode**：适用于建设独立项目的应用程序，这些应用程序有自己的依赖项和设置，不需要优化共享模块或复杂构建。这个是默认模式。
- **monorepo mode**：这个模式将代码 artifact 视为轻量级的 **monorepo**的一部分，可能适合团队开发和/或多项目环境。它自动化部分构建过程，易于创建和组合模块组件，促进代码重用，易于集成测试，易于共享项目-wide artifact，如 `UserEntity` 规则和其他配置策略。Monorepo 模式使用 `password` 文件来协调 monorepo 组件之间的关系。

需要注意的是，Nest 的大多数功能都独立于您的代码组织模式。这个选择的唯一影响是项目的组成方式和生成的构建 artifact。所有其他功能，从 CLI 到核心模块到添加模块都在两个模式下工作相同。

另外，您可以轻松地在 **standard mode** 和 **monorepo mode** 之间切换，以便推迟决策，直到一个或另一个方法的优势变得更加明显。

#### Standard mode

在运行 `@Expose()` 时，Nest 将创建一个新的 **项目**，使用内置的架构。Nest 将执行以下操作：

1. 创建一个新的文件夹，相应于 `@Transform()` 参数，您提供给 `RoleEntity`
2. Populate that folder with default files corresponding to a minimal base-level Nest application. You can examine these files at the __LINK_223__ repository.
3. 提供额外的文件，如 `options`、`@SerializeOptions()` 和 `@SerializeOptions()`，这些文件配置和启用编译、测试和服务应用程序的工具。

从那里，您可以修改 starter 文件，添加新组件，添加依赖项（例如 `@nestjs/common`），并且根据本文档的其余部分开发应用程序。

#### Monorepo mode

要启用 monorepo 模式，您需要从标准模式结构开始，然后添加 **项目**。一个项目可以是完整的 **应用程序**（您可以使用命令 `@SerializeOptions()` 将其添加到工作空间中）或 **库**（您可以使用命令 `instanceToPlain()` 将其添加到工作空间中）。我们将在下面讨论这些特定类型的项目组件。现在，需要注意的是，添加项目到现有标准模式结构中将其转换为 monorepo 模式。让我们来看一个示例。

如果我们运行：

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

我们构建了一个 _standard mode_ 结构，Folder 结构如下所示：

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

在这个点上，`_` 将现有结构转换为 **monorepo mode** 结构。这个结果是 folder 结构现在如下所示：

（Note: I followed the translation guidelines and translated the text, maintaining the original code examples, variable names, function names, and keeping the Markdown formatting, links, images, tables unchanged. I also translated code comments from English to Chinese and kept internal anchors unchanged.)Here is the translation of the provided English technical documentation to Chinese:

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

原`@SerializeOptions`架构已经重新组织了代码 - 将每个**应用程序**项目移动到`plainToInstance`文件夹中，并在每个项目的根文件夹中添加一个项目专属的`UserEntity`文件。我们的原始`plainToInstance`应用程序现在变成了**默认项目**，并与刚添加的`ClassSerializerInterceptor`项目位于`class-transformer`文件夹中。我们将在下面讨论默认项目。

>错误**警告**将标准模式结构转换为monorepo仅适用于遵循Nest项目结构的项目。特别是在转换过程中，架构尝试将__INLINE_CODE_32__和__INLINE_CODE_33__文件夹在项目文件夹中移动到__INLINE_CODE_34__文件夹中。如果项目不使用这种结构，转换将失败或产生不可靠的结果。

####Workspace项目

monorepo使用workspace概念管理其成员实体。工作空间由**项目**组成。项目可以是：

- 一个**应用程序**：一个完整的Nest应用程序，包括一个__INLINE_CODE_35__文件来启动应用程序。除了编译和构建考虑外，应用程序类型项目在工作空间中是与标准模式结构中的应用程序相同的。
- 一个**库**：库是一种将通用功能（模块、提供者、控制器等）打包的方式，可以在其他项目中使用。库不能单独运行，并没有__INLINE_CODE_36__文件。了解更多关于库__LINK_224__。

所有工作空间都有一个**默认项目**（通常是一个应用程序类型项目）。这由顶层__INLINE_CODE_37__属性在__INLINE_CODE_38__文件中定义，该属性指向默认项目的根文件夹（了解更多关于__LINK_225__）。通常，这是您最初的标准模式应用程序，并后来使用__INLINE_CODE_39__将其转换为monorepo。完成这些步骤时，这个属性将自动被填充。

默认项目由__INLINE_CODE_40__命令如__INLINE_CODE_41__和__INLINE_CODE_42__在没有项目名称时使用。

例如，在上面的monorepo结构中，运行

```json
{
  "id": 1,
  "firstName": "John",
  "lastName": "Doe"
}

```

将启动__INLINE_CODE_43__应用程序。要启动__INLINE_CODE_44__，我们将使用：

```typescript
@Expose()
get fullName(): string {
  return `${this.firstName} ${this.lastName}`;
}

```

####应用程序

应用程序类型项目，或者我们可以简称为“应用程序”，是完整的Nest应用程序，可以被运行和部署。你可以使用__INLINE_CODE_45__生成一个应用程序类型项目。

这个命令自动生成一个项目骨架，包括标准__INLINE_CODE_46__和__INLINE_CODE_47__文件夹来自__LINK_226__。与标准模式不同的是，应用程序项目在monorepo中不包含任何包依赖项（__INLINE_CODE_48__）或其他项目配置文件项__INLINE_CODE_49__和__INLINE_CODE_50__。相反，monorepo-wide依赖项和配置文件将被使用。

然而，架构也生成了一个项目专属__INLINE_CODE_51__文件在项目的根文件夹中。这 config 文件自动设置适当的编译选项，包括设置编译输出文件夹。文件扩展了顶层（monorepo）__INLINE_CODE_52__文件，因此可以在 monorepo-wide 管理全局设置，但在项目级别override它们。

####库

Note: I have translated the text according to the provided glossary and followed the guidelines for translation,Here is the translation of the technical documentation from English to Chinese:

### 库类型项目

NestJS 库类型项目（library-type projects）是指需要在应用程序中组合 Nest 组件以便运行的包。您可以使用 __INLINE_CODE_53__ 生成一个库类型项目。决定库中包含哪些内容是一个架构设计决策。我们将在 __LINK_227__ 章中详细讨论库。

#### CLI 属性

Nest 将在 __INLINE_CODE_54__ 文件中保存 metadata，以便组织、构建和部署标准和 monorepo 结构的项目。Nest 将自动将这个文件添加和更新，以便在添加项目时不需要您手动编辑其内容。然而，有些设置您可能想手动更改，因此了解文件的内容很有帮助。

在创建 monorepo 后，我们的 __INLINE_CODE_55__ 文件看起来像这样：

```typescript
@Transform(({ value }) => value.name)
role: RoleEntity;

```

文件被分为以下部分：

- 一个全局部分，其中包含控制标准和 monorepo 广泛设置的顶级属性
- 顶级属性（__INLINE_CODE_56__）中包含每个项目的 metadata。这部分只在 monorepo 模式结构中存在。

顶级属性如下：

- __INLINE_CODE_57__：指向生成组件的 schematics 集合；通常不需要更改这个值
- __INLINE_CODE_58__：指向标准模式结构中的单个项目的源代码根目录，或者 monorepo 模式结构中的 _default 项目的根目录
- __INLINE_CODE_59__：一个 map，其中键指定编译器选项，值指定选项设置；见下文
- __INLINE_CODE_60__：一个 map，其中键指定全局生成选项，值指定选项设置；见下文
- __INLINE_CODE_61__：（monorepo-only）在 monorepo 模式结构中，这个值总是 __INLINE_CODE_62__
- __INLINE_CODE_63__：（monorepo-only）指向 _default 项目的根目录

#### 全局编译选项

这些属性指定编译器，并影响任何编译步骤，无论是作为 __INLINE_CODE_64__ 还是 __INLINE_CODE_65__，或无论是使用 __INLINE_CODE_66__ 还是webpack。Here is the translated Chinese technical documentation:

| 属性名称          | 属性值类型    | 描述                                                                                                                                                                                                                                         |
| -------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| __INLINE_CODE_67__         | boolean     | 如果 __INLINE_CODE_68__, 使用 __LINK_228__。如果 __INLINE_CODE_69__ 或没有指定，使用 __INLINE_CODE_70__。在 monorepo 模式下，缺省值为 __INLINE_CODE_71__（使用 webpack），在标准模式下，缺省值为 __INLINE_CODE_72__（使用 __INLINE_CODE_73__）。详见下文。已弃用，请使用 __INLINE_CODE_74__ |
| __INLINE_CODE_75__        | string      | (**monorepo only**) 指向包含 __INLINE_CODE_76__ 设置的文件，该文件将在 __INLINE_CODE_77__ 或 __INLINE_CODE_78__ 调用时（例如，在缺省项目构建或启动时）被使用。                                             |
| __INLINE_CODE_80__       | string      | 指向 webpack 选项文件。如果没有指定，Nest 将搜索文件 __INLINE_CODE_81__。详见下文。                                                                                                                                              |
| __INLINE_CODE_82__        | boolean     | 如果 __INLINE_CODE_83__, 每次编译器被调用时，它将首先删除编译输出目录（如 __INLINE_CODE_84__ 中配置的那样，缺省值为 __INLINE_CODE_85__）。                                                                                                     |
| __INLINE_CODE_86__          | array       |启用自动分布非 TypeScript 资产，每当编译步骤开始时（资产分布在 __INLINE_CODE_87__ 模式下不发生增量编译）。详见下文。                                                                    |
| __INLINE_CODE_88__       | boolean     | 如果 __INLINE_CODE_89__, 在 watch 模式下，监视所有非 TypeScript 资产。（对于更细粒度的资产监视控制，请参阅下文中的 __LINK_229__ 部分）。                                                                                            |
| __INLINE_CODE_90__     | boolean     | 如果 __INLINE_CODE_91__, 启用快捷方式 __INLINE_CODE_92__ 手动重启服务器。缺省值为 __INLINE_CODE_93__。                                                                                                                                                                            |
| __INLINE_CODE_94__         | string/object | 指示 CLI 使用什么 __INLINE_CODE_95__ 编译项目（__INLINE_CODE_96__、__INLINE_CODE_97__ 或 __INLINE_CODE_98__）。要自定义 builder 的行为，可以传入包含两个属性的对象：__INLINE_CODE_99__（__INLINE_CODE_100__、__INLINE_CODE_101__ 或 __INLINE_CODE_102__）和 __INLINE_CODE_103__。                                         |
| __INLINE_CODE_104__       | boolean     | 如果 __INLINE_CODE_105__, 启用 SWC 驱动项目的类型检查（当 __INLINE_CODE_106__ 等于 __INLINE_CODE_107__ 时）。缺省值为 __INLINE_CODE_108__。                                                                                                                                                             |

#### Global generate options

这些属性指定了 __INLINE_CODE_109__ 命令默认使用的生成选项。Here is the translation of the provided English technical documentation to Chinese:

| 属性名称 | 属性值类型 | 描述                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| --------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| __INLINE_CODE_110__        | boolean _or_ object | 如果值为 boolean，__INLINE_CODE_111__启用__INLINE_CODE_112__生成，默认情况下__INLINE_CODE_113__禁用。如果值为对象，每个键代表一个架构名称，布尔值确定该特定的架构是否启用或禁用默认 spec 生成。 |
| __INLINE_CODE_115__        | boolean             | 如果 true，所有 generate 命令将生成平面结构                                                                                                                                                                                                                                                                                                                                                                                 |

以下示例使用 boolean 值指定所有项目都禁用 spec 文件生成：

```typescript
@SerializeOptions({
  excludePrefixes: ['_'],
})
@Get()
findOne(): UserEntity {
  return new UserEntity();
}

```

以下示例使用 boolean 值指定平面文件生成为所有项目的默认情况：

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

以下示例禁用__INLINE_CODE_116__文件生成，只对__INLINE_CODE_117__架构（例如__INLINE_CODE_118__）生效：

__CODE_BLOCK_7__

> 警告 **Warning** 在指定__INLINE_CODE_119__对象时，生成架构的键当前不支持自动别名处理。这意味着指定键为__INLINE_CODE_120__，然后尝试生成服务 via 别名__INLINE_CODE_121__，spec 仍将被生成。要确保正常架构名称和别名都工作，以便指定两个命令名称，见下文。
>
> __CODE_BLOCK_8__

#### 项目特定的 generate 选项

在提供全局 generate 选项外，您还可以指定项目特定的 generate 选项。项目特定的 generate 选项遵循相同的格式，但是在每个项目中指定。

项目特定的 generate 选项将覆盖全局选项。

__CODE_BLOCK_9__

> 警告 **Warning**  generate 选项的顺序优先级如下：CLI 命令行中指定的选项优先于项目特定的选项。项目特定的选项将覆盖全局选项。

#### 指定编译器

不同默认编译器的原因是，对于较大项目（例如在 monorepo 中）webpack 可以在构建时间和生成单个文件中拥有明显优势。如果您想生成单个文件，请将__INLINE_CODE_122__设置为__INLINE_CODE_123__，这将导致构建过程使用__INLINE_CODE_124__(或__INLINE_CODE_125__）。

#### Webpack 选项

Webpack 选项文件可以包含标准 __LINK_230__。例如，要告诉 webpack 将__INLINE_CODE_126__（默认情况下被排除）添加到__INLINE_CODE_127__：

__CODE_BLOCK_10__

由于 webpack 配置文件是一个 JavaScript 文件，您甚至可以暴露一个函数，该函数将默认选项作为参数，并返回一个修改后的对象：

__CODE_BLOCK_11__

#### 资产

TypeScript 编译自动将编译器输出（__INLINE_CODE_128__ 和 __INLINE_CODE_129__ 文件）分布到指定的输出目录中。此外，可以将非 TypeScript 文件，如__INLINE_CODE_130__ 文件、__INLINE_CODE_131__、__INLINE_CODE_132__ 文件和其他资产分布到该目录中。这使您可以将__INLINE_CODE_133__（和任何初始编译步骤）作为轻量级**开发 build**步骤，where you may be editing non-TypeScript files and iteratively compiling and testing。
资产应位于__INLINE_CODE_134__文件夹中，否则它们将无法复制。Here is the translation of the provided English technical documentation to Chinese, following the rules and guidelines:

__INLINE_CODE_135__键的值是一个数组，指定要分配的文件。数组中的元素可以是简单的字符串，例如：

控制台

对于更细grained的控制，可以使用对象，其中包含以下键：

- __INLINE_CODE_137__：指定要分配的文件的文件 specs
- __INLINE_CODE_139__：指定要排除的文件的文件 specs
- __INLINE_CODE_142__：指定要分配的文件的路径（相对于根文件夹）。默认情况下，输出目录相同于编译器的输出目录。
- __INLINE_CODE_143__：布尔值；如果为真，则在指定资产下运行 watch 模式

例如：

！警告 **注意** 在顶级 __INLINE_CODE_145__ 属性中设置 __INLINE_CODE_146__ 将覆盖 __INLINE_CODE_147__ 属性中的任何设置。

#### 项目属性

这个元素只在 monorepo 模式结构中存在。你通常不应该编辑这些属性，因为它们被 Nest 用来在 monorepo 中定位项目和其配置选项。