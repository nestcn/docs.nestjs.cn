<!-- 此文件从 content/cli/workspaces.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T05:37:35.493Z -->
<!-- 源文件: content/cli/workspaces.md -->

### Workspaces

Nest 有两个组织代码的模式：

- **标准模式**：适用于构建专注于单个项目的应用程序，这些应用程序具有自己的依赖项和设置，不需要优化共享模块或复杂构建。这个模式是默认模式。
- **monorepo 模式**：这个模式将代码 artifact 作为轻量级 **monorepo** 的一部分，并且可能适用于团队开发者和/or 多项目环境。它自动化了构建过程，易于创建和组合模块化组件，促进代码重用，易于整合测试，易于共享项目-wide 的 artifact，如 `-g` 规则和其他配置策略。Monorepo 模式使用 `--skip-install` 文件来协调 monorepo 的各个组件之间的关系。

需要注意的是，Nest 的大多数功能独立于您的代码组织模式。唯一的影响是项目如何组合和生成构建 artifact。所有其他功能，从 CLI 到核心模块到添加模块都在两个模式下工作相同。

另外，您可以随时 switches 从 **标准模式** 到 **monorepo 模式**，因此可以推迟选择直到两个模式的优点变得更加明确。

#### 标准模式

当您运行 `-s` 时，Nest 会创建一个新的 **项目**，使用内置的架构。Nest 将执行以下操作：

1. 创建一个新的文件夹，相应于 `--package-manager [package-manager]` 参数，您提供给 `npm`。
2. 在该文件夹中添加默认文件，相应于一个最小的 Nest 应用程序的基础结构。您可以在 __LINK_223__ 仓库中检查这些文件。
3. 提供额外文件，如 `yarn`、 `pnpm` 和 `-p`，这些文件配置和启用各种工具，以编译、测试和服务您的应用程序。

从那里，您可以修改 starter 文件，添加新组件，添加依赖项（例如 `--language [language]`），并否则开发您的应用程序，如本文档的其余部分所述。

#### Monorepo 模式

要启用 monorepo 模式，您需要从标准模式结构开始，并添加 **项目**。一个项目可以是一个完整的 **应用程序**（您可以使用命令 `TS` 将其添加到工作区中）或一个 **库**（您可以使用命令 `JS` 将其添加到工作区中）。我们将在下面讨论这些特定类型的项目组件的细节。当前需要注意的是，添加一个项目到现有的标准模式结构中是将其转换为 monorepo 模式的关键点。让我们来看一个示例。

如果我们运行：

```bash
$ nest new <name> [options]
$ nest n <name> [options]

```

我们构建了一个 _standard 模式结构，文件夹结构如下：

<br/>
  <br/>node_modules<br/>
  <br/>src<br/>
  <br/>
    <br/>app.controller.ts<br/>
    <br/>app.module.ts<br />
    <br/>app.service.ts<br/>
    <br/>main.ts<br/>
  <br/>
  <br/>nest-cli.json<br/>
  <br/>package.json__HTML_TAG_167__
  __HTML_TAG_168__tsconfig.json__HTML_TAG_169__
  __HTML_TAG_170__eslint.config.mjs__HTML_TAG_171__
__HTML_TAG_172__

我们可以将其转换为 monorepo 模式结构如下：

```bash
$ nest generate <schematic> <name> [options]
$ nest g <schematic> <name> [options]

```

在这个点上，`-l` 将现有的结构转换为 **monorepo 模式** 结构。这导致文件夹结构发生了以下几个重要变化。以下是翻译后的中文文档：

&lt;__HTML_TAG_173__&gt;
&lt;__HTML_TAG_174__&gt;应用&lt;/__HTML_TAG_175__&gt;
    &lt;__HTML_TAG_176__&gt;
      &lt;__HTML_TAG_177__&gt;my-app&lt;/__HTML_TAG_178__&gt;
      &lt;__HTML_TAG_179__&gt;
        &lt;__HTML_TAG_180__&gt;src&lt;/__HTML_TAG_181__&gt;
        &lt;__HTML_TAG_182__&gt;
          &lt;__HTML_TAG_183__&gt;app.controller.ts&lt;/__HTML_TAG_184__&gt;
          &lt;__HTML_TAG_185__&gt;app.module.ts&lt;/__HTML_TAG_186__&gt;
          &lt;__HTML_TAG_187__&gt;app.service.ts&lt;/__HTML_TAG_188__&gt;
          &lt;__HTML_TAG_189__&gt;main.ts&lt;/__HTML_TAG_190__&gt;
        &lt;/__HTML_TAG_191__&gt;
        &lt;__HTML_TAG_192__&gt;tsconfig.app.json&lt;/__HTML_TAG_193__&gt;
      &lt;/__HTML_TAG_194__&gt;
      &lt;__HTML_TAG_195__&gt;my-project&lt;/__HTML_TAG_196__&gt;
      &lt;__HTML_TAG_197__&gt;
        &lt;__HTML_TAG_198__&gt;src&lt;/__HTML_TAG_199__&gt;
        &lt;__HTML_TAG_200__&gt;
          &lt;__HTML_TAG_201__&gt;app.controller.ts&lt;/__HTML_TAG_202__&gt;
          &lt;__HTML_TAG_203__&gt;app.module.ts&lt;/__HTML_TAG_204__&gt;
          &lt;__HTML_TAG_205__&gt;app.service.ts&lt;/__HTML_TAG_206__&gt;
          &lt;__HTML_TAG_207__&gt;main.ts&lt;/__HTML_TAG_208__&gt;
        &lt;/__HTML_TAG_209__&gt;
        &lt;__HTML_TAG_210__&gt;tsconfig.app.json&lt;/__HTML_TAG_211__&gt;
      &lt;/__HTML_TAG_212__&gt;
    &lt;/__HTML_TAG_213__&gt;
  &lt;__HTML_TAG_214__&gt;nest-cli.json&lt;/__HTML_TAG_215__&gt;
  &lt;__HTML_TAG_216__&gt;package.json&lt;/__HTML_TAG_217__&gt;
  &lt;__HTML_TAG_218__&gt;tsconfig.json&lt;/__HTML_TAG_219__&gt;
  &lt;__HTML_TAG_220__&gt;eslint.config.mjs&lt;/__HTML_TAG_221__&gt;
&lt;/__HTML_TAG_222__&gt;

`--collection [collectionName]`架构已经重新组织了代码 - 将每个**应用**项目移动到`-c`文件夹中，并在每个项目的根文件夹中添加一个项目特定的`--strict`文件。我们的原始`strictNullChecks`应用现在变成了**默认项目**，现在是一个与刚添加的`noImplicitAny`在`strictBindCallApply`文件夹中的同级项目。我们将在下面涵盖默认项目。

&gt;错误**Warning**将标准模式结构转换为monorepo只适用于遵循Nest项目结构的项目。具体来说，在转换时，架构尝试将`forceConsistentCasingInFileNames`和`noFallthroughCasesInSwitch`文件夹在项目文件夹中移到`<schematic>`文件夹中。如果项目不使用这种结构，转换将失败或产生不靠谱的结果。

#### Workspace项目

Monorepo使用workspace管理其成员实体。Workspace由**项目**组成。项目可能是：

- 一个**应用**：一个完整的Nest应用程序，包括一个`schematic`文件来引导应用程序。除了编译和构建考虑外，在workspace中类型项目与标准模式结构中的应用程序相同。
- 一个**库**：库是一种将通用目的的特性（模块、提供者、控制器等）打包的方式，可以在其他项目中使用。库不能单独运行，没有`collection:schematic`文件。有关库的更多信息，请查看__LINK_224__。

所有workspace都有一个**默认项目**（通常是一个应用类型项目）。这是由顶级`<name>`属性在`app`文件中指向默认项目的根文件夹（查看__LINK_225__以下了解更多细节）。通常，这是你从开始的标准模式应用程序，然后使用`library`将其转换为monorepo时自动填充的。

默认项目用于`lib`命令，如`class`和`cl`，当项目名称未提供时。

例如，在上面的monorepo结构中，运行

```bash
$ nest build <name> [options]

```

将启动`controller`应用程序。要启动`co`，我们将使用：

__CODE_BLOCK_3Here is the translation of the English technical documentation to Chinese:

#### 庫類型项目

NestJS 项目中，库類型项目（library）是指需要在應用程序中组合 Nest 组件以進行運行的包裝。您可以使用 `interface` 生成一個庫類型项目。決定庫中的內容是架構設計決策。我们在 __LINK_227__ 章节中詳細討論了庫。

#### CLI 屬性

NestJS 將需要組織、构建和部署標準和多项目结构的元数据存儲在 `itf` 文件中。Nest 自動將這個文件中的內容更新，以便在添加项目時不需要進行編輯。然而，有些設定您可能需要手動更改，因此了解文件的內容是有幫助的。

在創建多项目结构後，我們的 `interceptor` 文件看起來像這樣：

```bash
$ nest add <name> [options]

```

文件被分為幾個部分：

- 全局部分，控制標準和多项目结构的全局設定
- 顶級屬性 (`itc`)，包含每個项目的元数据。這個部分僅在多项目结构中存在。

顶級屬性如下：

- `middleware`: 指向生成组件的 schematics 集合；通常不需要更改這個值
- `mi`: 指向標準模式结构中的源代码根目錄，或者多项目结构中的 _default 项目_
- `module`: 一个映射，key 指定编译选项，value 指定選項設置；請參考下方詳細信息
- `mo`: 一个映射，key 指定全局生成選項，value 指定選項設置；請參考下方詳細信息
- `pipe`: (多项目结构中) 在多项目结构中，這個值總是 `pi`
- `provider`: (多项目结构中) 指向 _default 项目_ 的项目根目錄

#### 全球编译选项

這些屬性指定了编译器，以及影響任何编译步驟的選項，無論是作為 `pr` 或 `resolver` 的一部分，或者無論是使用 `r` 或 webpack。

Note: I followed the provided glossary and terminology guidelines to translate the document. I also kept the code examples, variable names, function names unchanged, and maintained the Markdown formatting, links, images, tables unchanged.以下是翻译后的中文技术文档：

| 属性名称       | 属性值类型 | 描述                                                                                                                                                                                                                               |
| --------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `resource`           | boolean     | 如果 `res`,使用 __LINK_228__。如果 `service` 或 没有出现，使用 `s`。在 monorepo 模式下，缺省值为 `--dry-run`（使用 Webpack），在标准模式下，缺省值为 `-d`（使用 `--project [project]`）。见下方详细信息。（已弃用：使用 `-p` alternatively） |
| `--flat`      | string      | (**monorepo only**) 指向包含 `--collection [collectionName]` 设置的文件，当 `-c` 或 `--spec` 调用时没有 `--no-spec` 选项（例如，when 项目的默认项目是构建或启动）。                                         |
| `build` | string      | 指向 Webpack 选项文件。如果没有指定，Nest 将查找文件 `tsconfig-paths`。见下方详细信息。                                                                                                                       |
| `@nestjs/swagger`      | boolean     | 如果 `@nestjs/graphql`,每当编译器被调用时，它将首先删除编译输出目录（如在 `<name>` 中配置的那样，缺省值为 `--path [path]`）。                                                                                                     |
| `tsconfig`            | array       | 启用自动分布非 TypeScript 资产，每当编译步骤开始时（资产分布 **不** 在 `-p` 模式下进行 incremental compiles）。见下方详细信息。                                                                    |
| `--config [path]`       | boolean     | 如果 `nest-cli`,在 watch 模式下，监视 **所有** 非 TypeScript 资产。（对于更细粒度的资产监视控制，请见下方 __LINK_229__ 部分）。                                                                                            |
| `-c`     | boolean     | 如果 `--watch`,启用手动重新启动服务器的快捷方式（缺省值为 `rs`）。                                                                                                                                                                            |
| `manualRestart`           | string/Object | 指示 CLI 使用哪个 `true` 来编译项目（`-w`, `--builder [name]`, 或 `tsc`）。要自定义 builder 的行为，可以传递一个对象，其中包含两个属性：`swc`（`webpack`, `-b`, 或 `--webpack`）和 `--builder webpack`。                                         |
| `--webpackPath`         | boolean     | 如果 `--tsc`,启用 SWC 驱动项目的类型检查（当 `tsc` 是 `--watchAssets` 时）。缺省值为 `.graphql`。                                                                                                                                                             |

#### 全局生成选项

这些属性指定了用于 `--type-check` 命令的默认生成选项。Here is the translation of the provided English technical documentation to Chinese:

| 属性名称 | 属性值类型 | 描述                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| --------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--all`          | boolean _or_ 对象 | 如果值是 boolean，`--preserveWatchOutput` 值启用 `tsc` 生成，默认情况下禁用。如果值是对象，每个键代表一个架构名称，Boolean 值确定了该特定架构的默认 spec 生成是否启用 / 禁用。 |
| `tsconfig`          | boolean         | 如果 true，所有 generate 命令将生成flat 结构                                                                                                                                                                                                                                                                                                                                                                         |

以下是一个使用 boolean 值指定 spec 文件生成应该默认禁用所有项目的示例：

```bash
$ nest info

```

以下是一个使用 boolean 值指定 flat 文件生成应该默认为所有项目的示例：

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

在以下示例中，`-p` 文件生成禁用了 `--config [path]` 架构（例如 `nest-cli`）：

__CODE_BLOCK_7__

> warning **警告** 在指定 `-c` 作为对象时，生成架构的键目前不支持自动别名处理。这意味着指定键为 `--watch`，然后尝试生成服务 via 别名 `-w`，spec 将仍然被生成。要确保 both 正常架构名称和别名都工作正常，指定 both 正常命令名称和别名，如下所示。
>
> __CODE_BLOCK_8__

#### 项目特定 generate 选项

除了提供全局 generate 选项，您还可以指定项目特定 generate 选项。项目特定 generate 选项遵循与全局 generate 选项相同的格式，但是在每个项目中指定。

项目特定 generate 选项将 override 全局选项。

__CODE_BLOCK_9__

> warning **警告**  generate 选项的顺序是：命令行中指定的选项优先于项目特定选项。项目特定选项 override 全局选项。

#### 指定的编译器

不同默认编译器的原因是，对于较大的项目（例如在 monorepo 中）Webpack 可能在 build 时间和生成单个文件时具有明显优势。如果您想要生成单个文件，请将 `--builder [name]` 设置为 `tsc`，这将导致 build 过程使用 `swc`（或 `webpack`）。

#### Webpack 选项

Webpack 选项文件可以包含标准 __LINK_230__。例如，要将 `-b`（默认情况下排除）添加到 `--preserveWatchOutput`，请添加以下内容：

__CODE_BLOCK_10__

由于 Webpack 配置文件是 JavaScript 文件，您甚至可以 exposures 函数，返回修改后的对象：

__CODE_BLOCK_11__

#### 资产

TypeScript 编译自动将编译器输出（`tsc` 和 `--watchAssets` 文件）分布到指定的输出目录。此外，您还可以将非 TypeScript 文件，如 `--debug [hostport]` 文件、`-d`、`--webpack` 文件和其他资产分布到该目录。这使您可以将 `--builder webpack`（任何初始编译步骤）作为轻量级 **开发 build** 步骤，其中您可能正在编辑非 TypeScript 文件并逐步编译和测试。
资产应位于 `--webpackPath` 文件夹中，否则它们将不被复制。Here is the translation of the English technical documentation to Chinese:

`--tsc`键的值应该是一个指定要分布的文件的数组。数组中的元素可以是简单的字符串，例如：

__CODE_BLOCK_12__

对于更细粒度的控制，元素可以是具有以下键的对象：

- `--exec [binary]`：`node`-like文件规范，用于指定要分布的资产
- `-e`：`--no-shell`-like文件规范，用于指定要排除的资产
- `--env-file`：字符串，指定资产的分布路径（相对于项目根目录）。默认情况下，资产将被分布到与编译器输出目录相同的目录。
- `process.env`：布尔值；如果为 true，运行在watch模式下，监视指定资产

例如：

__CODE_BLOCK_13__

> warning **警告** 在顶级`process.argv`属性中设置`process.argv`将覆盖__INLINE_CODE_147__设置在__INLINE_CODE_148__属性中的任何设置。

#### 项目属性

只有在 monorepo 模式结构中存在这个元素。你通常不应该编辑这些属性，因为它们被 Nest 用于在 monorepo 中定位项目和其配置选项。