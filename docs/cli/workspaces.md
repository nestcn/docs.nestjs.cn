<!-- 此文件从 content/cli\workspaces.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-03T07:09:52.881Z -->
<!-- 源文件: content/cli\workspaces.md -->

### 工作区

Nest 有两种组织代码的模式：

- **标准模式**：适用于构建以项目为中心的独立应用程序，这些应用程序有自己的依赖项和设置，不需要优化共享模块或复杂构建。这是默认模式。
- **单体仓库模式**：此模式将代码工件视为轻量级 **单体仓库** 的一部分，可能更适合开发团队和/或多项目环境。它自动化构建过程的部分内容，使创建和组合模块化组件变得容易，促进代码重用，使集成测试更容易，使共享项目范围的工件（如 `eslint` 规则和其他配置策略）变得容易，并且比 Git 子模块等替代方案更易于使用。单体仓库模式采用 **工作区** 的概念，在 `nest-cli.json` 文件中表示，以协调单体仓库组件之间的关系。

重要的是要注意，Nest 的几乎所有功能都与您的代码组织模式无关。这种选择的 **唯一** 影响是您的项目如何组合以及构建工件如何生成。从 CLI 到核心模块再到附加模块的所有其他功能在任一模式下都相同。

此外，您可以随时轻松地从 **标准模式** 切换到 **单体仓库模式**，因此您可以延迟此决定，直到其中一种方法的好处变得更加明确。

#### 标准模式

当您运行 `nest new` 时，会使用内置的 schematic 为您创建一个新的 **项目**。Nest 执行以下操作：

1. 创建一个新文件夹，对应于您提供给 `nest new` 的 `name` 参数
2. 用对应于最小基础 Nest 应用程序的默认文件填充该文件夹。您可以在 [typescript-starter](https://github.com/nestjs/typescript-starter) 存储库中检查这些文件。
3. 提供其他文件，如 `nest-cli.json`、`package.json` 和 `tsconfig.json`，这些文件配置和启用各种工具，用于编译、测试和提供您的应用程序。

从那里，您可以修改启动文件，添加新组件，添加依赖项（例如，`npm install`），并以本文档其余部分所述的方式开发您的应用程序。

#### 单体仓库模式

要启用单体仓库模式，您从 _标准模式_ 结构开始，并添加 **项目**。项目可以是完整的 **应用程序**（使用命令 `nest generate app` 添加到工作区）或 **库**（使用命令 `nest generate library` 添加到工作区）。我们将在下面讨论这些特定类型的项目组件的详细信息。现在需要注意的关键点是，向现有标准模式结构 **添加项目** 的 **行为** 会将其 **转换** 为单体仓库模式。让我们看一个例子。

如果我们运行：

```bash
$ nest new my-project
```

我们已经构建了一个 _标准模式_ 结构，其文件夹结构如下所示：

<div class="file-tree">
  <div class="item">node_modules</div>
  <div class="item">src</div>
  <div class="children">
    <div class="item">app.controller.ts</div>
    <div class="item">app.module.ts</div>
    <div class="item">app.service.ts</div>
    <div class="item">main.ts</div>
  </div>
  <div class="item">nest-cli.json</div>
  <div class="item">package.json</div>
  <div class="item">tsconfig.json</div>
  <div class="item">eslint.config.mjs</div>
</div>

我们可以按如下方式将其转换为单体仓库模式结构：

```bash
$ cd my-project
$ nest generate app my-app
```

此时，`nest` 将现有结构转换为 **单体仓库模式** 结构。这导致了一些重要的变化。文件夹结构现在如下所示：

<div class="file-tree">
  <div class="item">apps</div>
    <div class="children">
      <div class="item">my-app</div>
      <div class="children">
        <div class="item">src</div>
        <div class="children">
          <div class="item">app.controller.ts</div>
          <div class="item">app.module.ts</div>
          <div class="item">app.service.ts</div>
          <div class="item">main.ts</div>
        </div>
        <div class="item">tsconfig.app.json</div>
      </div>
      <div class="item">my-project</div>
      <div class="children">
        <div class="item">src</div>
        <div class="children">
          <div class="item">app.controller.ts</div>
          <div class="item">app.module.ts</div>
          <div class="item">app.service.ts</div>
          <div class="item">main.ts</div>
        </div>
        <div class="item">tsconfig.app.json</div>
      </div>
    </div>
  <div class="item">nest-cli.json</div>
  <div class="item">package.json</div>
  <div class="item">tsconfig.json</div>
  <div class="item">eslint.config.mjs</div>
</div>

`generate app` schematic 已经重新组织了代码 - 将每个 **应用程序** 项目移动到 `apps` 文件夹下，并在每个项目的根文件夹中添加了特定于项目的 `tsconfig.app.json` 文件。我们原始的 `my-project` 应用程序已成为单体仓库的 **默认项目**，现在与刚添加的 `my-app` 同级，位于 `apps` 文件夹下。我们将在下面介绍默认项目。

> error **警告** 标准模式结构到单体仓库的转换仅适用于遵循规范 Nest 项目结构的项目。具体来说，在转换过程中，schematic 尝试将项目文件夹中的 `src` 和 `test` 文件夹重新定位到根目录的 `apps` 文件夹下。如果项目不使用此结构，转换将失败或产生不可靠的结果。

#### 工作区项目

单体仓库使用工作区的概念来管理其成员实体。工作区由 **项目** 组成。项目可以是：

- **应用程序**：完整的 Nest 应用程序，包括用于引导应用程序的 `main.ts` 文件。除了编译和构建考虑之外，工作区内的应用程序类型项目在功能上与 _标准模式_ 结构内的应用程序相同。
- **库**：库是一种打包通用功能集（模块、提供者、控制器等）的方式，这些功能可以在其他项目中使用。库不能独立运行，也没有 `main.ts` 文件。有关库的更多信息，请阅读 [这里](/cli/libraries)。

所有工作区都有一个 **默认项目**（应该是应用程序类型的项目）。这由 `nest-cli.json` 文件中的顶级 `"root"` 属性定义，该属性指向默认项目的根目录（有关更多详细信息，请参见下面的 [CLI 属性](/cli/workspaces#cli-properties)）。通常，这是您开始使用的 **标准模式** 应用程序，后来使用 `nest generate app` 转换为单体仓库。当您按照这些步骤操作时，此属性会自动填充。

当未提供项目名称时，`nest` 命令（如 `nest build` 和 `nest start`）会使用默认项目。

例如，在上面的单体仓库结构中，运行

```bash
$ nest start
```

将启动 `my-project` 应用程序。要启动 `my-app`，我们将使用：

```bash
$ nest start my-app
```

#### 应用程序

应用程序类型项目，或者我们可能非正式地称为 "应用程序"，是完整的 Nest 应用程序，您可以运行和部署。您使用 `nest generate app` 生成应用程序类型项目。

此命令会自动生成项目骨架，包括来自 [typescript starter](https://github.com/nestjs/typescript-starter) 的标准 `src` 和 `test` 文件夹。与标准模式不同，单体仓库中的应用程序项目没有任何包依赖项（`package.json`）或其他项目配置工件，如 `.prettierrc` 和 `eslint.config.mjs`。相反，使用单体仓库范围的依赖项和配置文件。

然而，schematic 确实在项目的根文件夹中生成特定于项目的 `tsconfig.app.json` 文件。此配置文件自动设置适当的构建选项，包括正确设置编译输出文件夹。该文件扩展了顶级（单体仓库）`tsconfig.json` 文件，因此您可以在单体仓库范围内管理全局设置，但如果需要，可以在项目级别覆盖它们。

#### 库

如前所述，库类型项目，或简单地称为 "库"，是需要组合到应用程序中才能运行的 Nest 组件包。您使用 `nest generate library` 生成库类型项目。决定库中包含什么是一个架构设计决策。我们在 [库](/cli/libraries) 章节中深入讨论库。

#### CLI 属性

Nest 将组织、构建和部署标准和单体仓库结构项目所需的元数据保存在 `nest-cli.json` 文件中。当您添加项目时，Nest 会自动添加并更新此文件，因此您通常不必考虑它或编辑其内容。但是，有一些设置您可能想要手动更改，因此了解文件的概览很有帮助。

运行上述步骤创建单体仓库后，我们的 `nest-cli.json` 文件如下所示：

```javascript
{
  "collection": "@nestjs/schematics",
  "sourceRoot": "apps/my-project/src",
  "monorepo": true,
  "root": "apps/my-project",
  "compilerOptions": {
    "webpack": true,
    "tsConfigPath": "apps/my-project/tsconfig.app.json"
  },
  "projects": {
    "my-project": {
      "type": "application",
      "root": "apps/my-project",
      "entryFile": "main",
      "sourceRoot": "apps/my-project/src",
      "compilerOptions": {
        "tsConfigPath": "apps/my-project/tsconfig.app.json"
      }
    },
    "my-app": {
      "type": "application",
      "root": "apps/my-app",
      "entryFile": "main",
      "sourceRoot": "apps/my-app/src",
      "compilerOptions": {
        "tsConfigPath": "apps/my-app/tsconfig.app.json"
      }
    }
  }
}
```

该文件分为几个部分：

- 全局部分，包含控制标准和单体仓库范围设置的顶级属性
- 顶级属性 (`"projects"`)，包含每个项目的元数据。此部分仅存在于单体仓库模式结构中。

顶级属性如下：

- `"collection"`：指向用于生成组件的 schematic 集合；您通常不应更改此值
- `"sourceRoot"`：指向标准模式结构中单个项目的源代码根目录，或单体仓库模式结构中 _默认项目_ 的源代码根目录
- `"compilerOptions"`：一个映射，其中键指定编译器选项，值指定选项设置；详见下文
- `"generateOptions"`：一个映射，其中键指定全局生成选项，值指定选项设置；详见下文
- `"monorepo"`：（仅单体仓库）对于单体仓库模式结构，此值始终为 `true`
- `"root"`：（仅单体仓库）指向 _默认项目_ 的项目根目录

#### 全局编译器选项

这些属性指定要使用的编译器以及影响 **任何** 编译步骤的各种选项，无论是作为 `nest build` 还是 `nest start` 的一部分，无论编译器是 `tsc` 还是 webpack。

| 属性名称       | 属性值类型 | 描述                                                                                                                                                                                                                                                               |
| ------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `webpack`           | boolean             | 如果为 `true`，使用 [webpack 编译器](https://webpack.js.org/)。如果为 `false` 或不存在，使用 `tsc`。在单体仓库模式中，默认值为 `true`（使用 webpack），在标准模式中，默认值为 `false`（使用 `tsc`）。详见下文。（已弃用：改用 `builder`） |
| `tsConfigPath`      | string              | （**仅单体仓库**）指向包含 `tsconfig.json` 设置的文件，当调用 `nest build` 或 `nest start` 时不使用 `project` 选项时（例如，当构建或启动默认项目时）将使用这些设置。                                             |
| `webpackConfigPath` | string              | 指向 webpack 选项文件。如果未指定，Nest 会查找文件 `webpack.config.js`。详见下文。                                                                                                                                              |
| `deleteOutDir`      | boolean             | 如果为 `true`，每当调用编译器时，它将首先删除编译输出目录（如 `tsconfig.json` 中配置的那样，默认为 `./dist`）。                                                                                                     |
| `assets`            | array               | 启用在编译步骤开始时自动分发非 TypeScript 资产（资产分发在 `--watch` 模式下的增量编译中 **不会** 发生）。详见下文。                                                                    |
| `watchAssets`       | boolean             | 如果为 `true`，在监视模式下运行，监视 **所有** 非 TypeScript 资产。（有关要监视的资产的更精细控制，请参见下面的 [资产](/cli/workspaces#资源) 部分）。                                                                                            |
| `manualRestart`     | boolean             | 如果为 `true`，启用快捷键 `rs` 手动重启服务器。默认值为 `false`。                                                                                                                                                                            |
| `builder`           | string/object       | 指示 CLI 使用什么 `builder` 来编译项目（`tsc`、`swc` 或 `webpack`）。要自定义 builder 的行为，您可以传递一个包含两个属性的对象：`type`（`tsc`、`swc` 或 `webpack`）和 `options`。                                         |
| `typeCheck`         | boolean             | 如果为 `true`，为 SWC 驱动的项目启用类型检查（当 `builder` 为 `swc` 时）。默认值为 `false`。                                                                                                                                                             |

#### 全局生成选项

这些属性指定 `nest generate` 命令要使用的默认生成选项。

| 属性名称 | 属性值类型 | 描述                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ------------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `spec`        | boolean _or_ object | 如果值为布尔值，`true` 表示默认启用 `spec` 生成，`false` 表示禁用。在 CLI 命令行上传递的标志会覆盖此设置，项目特定的 `generateOptions` 设置也会覆盖此设置（详见下文）。如果值为对象，每个键表示 schematic 名称，布尔值确定是否为该特定 schematic 启用/禁用默认 spec 生成。 |
| `flat`        | boolean             | 如果为 true，所有生成命令将生成扁平结构                                                                                                                                                                                                                                                                                                                                                                                 |

以下示例使用布尔值指定默认情况下应为所有项目禁用 spec 文件生成：

```javascript
{
  "generateOptions": {
    "spec": false
  },
  ...
}
```

以下示例使用布尔值指定扁平文件生成应为所有项目的默认值：

```javascript
{
  "generateOptions": {
    "flat": true
  },
  ...
}
```

在以下示例中，`spec` 文件生成仅对 `service` schematic 禁用（例如，`nest generate service...`）：

```javascript
{
  "generateOptions": {
    "spec": {
      "service": false
    }
  },
  ...
}
```

> warning **警告** 当将 `spec` 指定为对象时，生成 schematic 的键当前不支持自动别名处理。这意味着指定键如 `service: false` 并尝试通过别名 `s` 生成服务，spec 仍会生成。为确保正常的 schematic 名称和别名都按预期工作，请同时指定正常的命令名称和别名，如下所示。
>
> ```javascript
> {
>   "generateOptions": {
>     "spec": {
>       "service": false,
>       "s": false
>     }
>   },
>   ...
> }
> ```

#### 项目特定的生成选项

除了提供全局生成选项外，您还可以指定项目特定的生成选项。项目特定的生成选项遵循与全局生成选项完全相同的格式，但直接在每个项目上指定。

项目特定的生成选项覆盖全局生成选项。

```javascript
{
  "projects": {
    "cats-project": {
      "generateOptions": {
        "spec": {
          "service": false
        }
      },
      ...
    }
  },
  ...
}
```

> warning **警告** 生成选项的优先级顺序如下。在 CLI 命令行上指定的选项优先于项目特定的选项。项目特定的选项覆盖全局选项。

#### 指定的编译器

不同默认编译器的原因是，对于较大的项目（例如，在单体仓库中更典型），webpack 在构建时间和生成打包所有项目组件的单个文件方面具有显著优势。如果您希望生成单个文件，请将 `"webpack"` 设置为 `false`，这将导致构建过程使用 `tsc`（或 `swc`）。

#### Webpack 选项

webpack 选项文件可以包含标准的 [webpack 配置选项](https://webpack.js.org/configuration/)。例如，要告诉 webpack 打包 `node_modules`（默认情况下排除），请将以下内容添加到 `webpack.config.js`：

```javascript
module.exports = {
  externals: [],
};
```

由于 webpack 配置文件是 JavaScript 文件，您甚至可以公开一个函数，该函数接受默认选项并返回修改后的对象：

```javascript
module.exports = function (options) {
  return {
    ...options,
    externals: [],
  };
};
```

#### 资产

TypeScript 编译会自动将编译器输出（`.js` 和 `.d.ts` 文件）分发到指定的输出目录。分发非 TypeScript 文件（如 `.graphql` 文件、`images`、`.html` 文件和其他资产）也很方便。这允许您将 `nest build`（以及任何初始编译步骤）视为轻量级 **开发构建** 步骤，您可能正在编辑非 TypeScript 文件并迭代编译和测试。
资产应位于 `src` 文件夹中，否则它们不会被复制。

`assets` 键的值应该是一个元素数组，指定要分发的文件。元素可以是带有 `glob` 样式文件规范的简单字符串，例如：

```typescript
"assets": ["**/*.graphql"],
"watchAssets": true,
```

对于更精细的控制，元素可以是具有以下键的对象：

- `"include"`：要分发的资产的 `glob` 样式文件规范
- `"exclude"`：要从 `include` 列表中 **排除** 的资产的 `glob` 样式文件规范
- `"outDir"`：指定资产应分发到的路径（相对于根文件夹）的字符串。默认为为编译器输出配置的相同输出目录。
- `"watchAssets"`：布尔值；如果为 `true`，则在监视模式下运行，监视指定的资产

例如：

```typescript
"assets": [
  { "include": "**/*.graphql", "exclude": "**/omitted.graphql", "watchAssets": true },
]
```

> warning **警告** 在顶级 `compilerOptions` 属性中设置 `watchAssets` 会覆盖 `assets` 属性中的任何 `watchAssets` 设置。

#### 项目属性

此元素仅存在于单体仓库模式结构中。您通常不应编辑这些属性，因为它们被 Nest 用于在单体仓库中定位项目及其配置选项。
