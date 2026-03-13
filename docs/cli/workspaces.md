<!-- 此文件从 content/cli/workspaces.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-12T13:42:20.318Z -->
<!-- 源文件: content/cli/workspaces.md -->

### 工作区

Nest 有两种组织代码的模式：

- **标准模式**：适用于构建具有自己的依赖项和设置的单个项目应用程序，不需要优化共享模块或优化复杂构建。这是默认模式。
- **Monorepo 模式**：此模式将代码工件视为轻量级 **monorepo** 的一部分，可能更适合开发团队和/或多项目环境。它自动化部分构建过程，使创建和组合模块化组件变得容易，促进代码重用，使集成测试更容易，使共享项目范围的工件（如 `eslint` 规则和其他配置策略）变得容易，并且比 Git 子模块等替代方案更易于使用。Monorepo 模式采用**工作区**的概念，在 `nest-cli.json` 文件中表示，以协调 monorepo 组件之间的关系。

需要注意的是，几乎所有 Nest 的功能都独立于你的代码组织模式。此选择的**唯一**影响是你的项目如何组合以及如何生成构建工件。所有其他功能，从 CLI 到核心模块到附加模块，在任一模式下都相同工作。

此外，你可以随时轻松地从**标准模式**切换到 **monorepo 模式**，因此你可以推迟此决定，直到其中一种方法的好处变得更加明显。

#### 标准模式

当你运行 `nest new` 时，会使用内置原理为你创建一个新的**项目**。Nest 执行以下操作：

1. 创建一个新文件夹，对应于你提供给 `nest new` 的 `name` 参数
2. 用对应于最小基础级 Nest 应用程序的默认文件填充该文件夹。你可以在 [typescript-starter](https://github.com/nestjs/typescript-starter) 仓库中检查这些文件。
3. 提供额外的文件，如 `nest-cli.json`、`package.json` 和 `tsconfig.json`，用于配置和启用各种工具来编译、测试和提供你的应用程序。

从那里，你可以修改启动文件，添加新组件，添加依赖项（例如，`npm install`），并按照本文档其余部分的说明开发你的应用程序。

#### Monorepo 模式

要启用 monorepo 模式，你从_标准模式_结构开始，并添加**项目**。项目可以是完整的**应用程序**（你使用命令 `nest generate app` 添加到工作区）或**库**（你使用命令 `nest generate library` 添加到工作区）。我们将在下面讨论这些特定类型的项目组件的详细信息。现在要注意的关键点是，**添加项目**的行为将现有标准模式结构**转换**为 monorepo 模式。让我们看一个例子。

如果我们运行：

```bash
$ nest new my-project

```

我们构建了一个_标准模式_结构，文件夹结构如下所示：

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

我们可以按如下方式将其转换为 monorepo 模式结构：

```bash
$ cd my-project
$ nest generate app my-app

```

此时，`nest` 将现有结构转换为 **monorepo 模式**结构。这导致了一些重要的更改。文件夹结构现在如下所示：

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

`generate app` 原理重新组织了代码 - 将每个**应用程序**项目移动到 `apps` 文件夹下，并在每个项目的根文件夹中添加项目特定的 `tsconfig.app.json` 文件。我们原来的 `my-project` 应用程序已成为 monorepo 的**默认项目**，现在与刚刚添加的 `my-app` 是同级，位于 `apps` 文件夹下。我们将在下面介绍默认项目。

> error **警告** 将标准模式结构转换为 monorepo 仅适用于遵循规范 Nest 项目结构的项目。具体来说，在转换期间，原理尝试将 `src` 和 `test` 文件夹重新定位到根目录下 `apps` 文件夹中的项目文件夹中。如果项目不使用此结构，转换将失败或产生不可靠的结果。

#### 工作区项目

Monorepo 使用工作区的概念来管理其成员实体。工作区由**项目**组成。项目可以是：

- **应用程序**：完整的 Nest 应用程序，包括用于引导应用程序的 `main.ts` 文件。除了编译和构建考虑事项外，工作区内的应用程序类型项目在功能上与_标准模式_结构中的应用程序相同。
- **库**：库是一种打包通用功能集（模块、提供者、控制器等）的方式，可以在其他项目中使用。库不能独立运行，没有 `main.ts` 文件。在[这里](/cli/libraries)阅读更多关于库的信息。

所有工作区都有一个**默认项目**（应该是应用程序类型项目）。这由 `nest-cli.json` 文件中的顶级 `"root"` 属性定义，该属性指向默认项目的根（有关更多详细信息，请参阅下面的 [CLI 属性](#cli-属性)）。通常，这是你开始使用的**标准模式**应用程序，后来使用 `nest generate app` 转换为 monorepo。当你按照这些步骤操作时，此属性会自动填充。

当未提供项目名称时，`nest` 命令（如 `nest build` 和 `nest start`）使用默认项目。

例如，在上面的 monorepo 结构中，运行

```bash
$ nest start

```

将启动 `my-project` 应用程序。要启动 `my-app`，我们将使用：

```bash
$ nest start my-app

```

#### 应用程序

应用程序类型项目，或我们可能非正式地称为"应用程序"，是可以运行和部署的完整 Nest 应用程序。你使用 `nest generate app` 生成应用程序类型项目。

此命令自动生成项目骨架，包括 [typescript starter](https://github.com/nestjs/typescript-starter) 的标准 `src` 和 `test` 文件夹。与标准模式不同，monorepo 中的应用程序项目没有任何包依赖项（`package.json`）或其他项目配置工件，如 `.prettierrc` 和 `eslint.config.mjs`。相反，使用 monorepo 范围的依赖项和配置文件。

但是，原理确实在项目的根文件夹中生成项目特定的 `tsconfig.app.json` 文件。此配置文件自动设置适当的构建选项，包括正确设置编译输出文件夹。该文件扩展顶级（monorepo）`tsconfig.json` 文件，因此你可以在 monorepo 范围内管理全局设置，但在需要时在项目级别覆盖它们。

#### 库

如前所述，库类型项目或简称"库"是需要组合到应用程序中才能运行的 Nest 组件包。你使用 `nest generate library` 生成库类型项目。决定什么属于库是一个架构设计决策。我们在[库](/cli/libraries)章节中深入讨论库。

#### CLI 属性

Nest 将组织和构建标准及 monorepo 结构项目所需的元数据保存在 `nest-cli.json` 文件中。当你添加项目时，Nest 会自动添加和更新此文件，因此你通常不必考虑它或编辑其内容。但是，有一些设置你可能需要手动更改，因此对文件有一个概述性的了解是有帮助的。

在运行上述步骤创建 monorepo 后，我们的 `nest-cli.json` 文件如下所示：

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

- 具有顶级属性的全局部分，控制标准和 monorepo 范围的设置
- 具有每个项目元数据的顶级属性（`"projects"`）。此部分仅存在于 monorepo 模式结构。

顶级属性如下：

- `"collection"`：指向用于生成组件的原理集合；通常不应更改此值
- `"sourceRoot"`：指向标准模式结构中单个项目的源代码根，或 monorepo 模式结构中的_默认项目_
- `"compilerOptions"`：一个映射，键指定编译器选项，值指定选项设置；详见下文
- `"generateOptions"`：一个映射，键指定全局生成选项，值指定选项设置；详见下文
- `"monorepo"`：（仅限 monorepo）对于 monorepo 模式结构，此值始终为 `true`
- `"root"`：（仅限 monorepo）指向_默认项目_的项目根

#### 全局编译器选项

这些属性指定要使用的编译器以及影响**任何**编译步骤的各种选项，无论是作为 `nest build` 还是 `nest start` 的一部分，无论编译器是 `tsc` 还是 webpack。

| 属性名称 | 属性值类型 | 描述 |
| --- | --- | --- |
| `webpack` | boolean | 如果为 `true`，使用 [webpack 编译器](https://webpack.js.org/)。如果为 `false` 或不存在，使用 `tsc`。在 monorepo 模式下，默认为 `true`（使用 webpack），在标准模式下，默认为 `false`（使用 `tsc`）。详见下文。（已弃用：改用 `builder`） |
| `tsConfigPath` | string | **（仅限 monorepo）** 指向包含 `tsconfig.json` 设置的文件，当在没有 `project` 选项的情况下调用 `nest build` 或 `nest start` 时使用（例如，当构建或启动默认项目时）。 |
| `webpackConfigPath` | string | 指向 webpack 选项文件。如果未指定，Nest 会查找文件 `webpack.config.js`。详见下文。 |
| `deleteOutDir` | boolean | 如果为 `true`，每当调用编译器时，它将首先删除编译输出目录（在 `tsconfig.json` 中配置，默认为 `./dist`）。 |
| `assets` | array | 在编译步骤开始时自动分发非 TypeScript 资产（资产分发在 `--watch` 模式下的增量编译中**不**发生）。详见下文。 |
| `watchAssets` | boolean | 如果为 `true`，在监视模式下运行，监视**所有**非 TypeScript 资产。（有关要监视的资产的更精细控制，请参阅下面的[资产](#资产)部分）。 |
| `manualRestart` | boolean | 如果为 `true`，启用快捷键 `rs` 手动重启服务器。默认值为 `false`。 |
| `builder` | string/object | 指示 CLI 使用什么 `builder` 来编译项目（`tsc`、`swc` 或 `webpack`）。要自定义构建器的行为，你可以传递一个包含两个属性的对象：`type`（`tsc`、`swc` 或 `webpack`）和 `options`。 |
| `typeCheck` | boolean | 如果为 `true`，为 SWC 驱动的项目启用类型检查（当 `builder` 为 `swc` 时）。默认值为 `false`。 |

#### 全局生成选项

这些属性指定 `nest generate` 命令使用的默认生成选项。

| 属性名称 | 属性值类型 | 描述 |
| --- | --- | --- |
| `spec` | boolean _或_ object | 如果值为布尔值，值为 `true` 默认启用 `spec` 生成，值为 `false` 禁用它。在 CLI 命令行上传递的标志会覆盖此设置，项目特定的 `generateOptions` 设置也是如此（详见下文）。如果值为对象，每个键代表一个原理名称，布尔值确定是否为该特定原理启用/禁用默认 spec 生成。 |
| `flat` | boolean | 如果为 true，所有生成命令将生成扁平结构 |

以下示例使用布尔值指定应为所有项目默认禁用 spec 文件生成：

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

在以下示例中，仅为 `service` 原理禁用 `spec` 文件生成（例如，`nest generate service...`）：

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

> warning **警告** 当将 `spec` 指定为对象时，生成原理的键目前不支持自动别名处理。这意味着指定一个键例如 `service: false` 并尝试通过别名 `s` 生成服务，spec 仍然会生成。为确保正常命令名称和别名都按预期工作，请指定正常命令名称和别名，如下所示。
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

除了提供全局生成选项外，你还可以指定项目特定的生成选项。项目特定的生成选项遵循与全局生成选项完全相同的格式，但直接在每个项目上指定。

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

不同默认编译器的原因是，对于较大的项目（例如，在 monorepo 中更典型），webpack 在构建时间和生成将所有项目组件打包在一起的单个文件方面具有显著优势。如果你想生成单独的文件，将 `"webpack"` 设置为 `false`，这将导致构建过程使用 `tsc`（或 `swc`）。

#### Webpack 选项

Webpack 选项文件可以包含标准的 [webpack 配置选项](https://webpack.js.org/configuration/)。例如，要告诉 webpack 打包 `node_modules`（默认排除），请将以下内容添加到 `webpack.config.js`：

```javascript
module.exports = {
  externals: [],
};

```

由于 webpack 配置文件是 JavaScript 文件，你甚至可以公开一个函数，该函数接受默认选项并返回修改后的对象：

```javascript
module.exports = function (options) {
  return {
    ...options,
    externals: [],
  };
};

```

#### 资产

TypeScript 编译自动将编译器输出（`.js` 和 `.d.ts` 文件）分发到指定的输出目录。分发非 TypeScript 文件也可能很方便，例如 `.graphql` 文件、图像、`.html` 文件和其他资产。这允许你将 `nest build`（以及任何初始编译步骤）视为轻量级**开发构建**步骤，你可以在其中编辑非 TypeScript 文件并迭代编译和测试。
资产应位于 `src` 文件夹中，否则它们将不会被复制。

`assets` 键的值应该是一个元素数组，指定要分发的文件。元素可以是带有 `glob` 类似文件规范的简单字符串，例如：

```typescript
"assets": ["**/*.graphql"],
"watchAssets": true,

```

为了更精细的控制，元素可以是具有以下键的对象：

- `"include"`：要分发的资产的 `glob` 类似文件规范
- `"exclude"`：要从 `include` 列表中**排除**的资产的 `glob` 类似文件规范
- `"outDir"`：一个字符串，指定资产应该分发到的路径（相对于根文件夹）。默认为为编译器输出配置的相同输出目录。
- `"watchAssets"`：boolean；如果为 `true`，在监视模式下运行，监视指定的资产

例如：

```typescript
"assets": [
  { "include": "**/*.graphql", "exclude": "**/omitted.graphql", "watchAssets": true },
]

```

> warning **警告** 在顶级 `compilerOptions` 属性中设置 `watchAssets` 会覆盖 `assets` 属性中的任何 `watchAssets` 设置。

#### 项目属性

此元素仅存在于 monorepo 模式结构。你通常不应编辑这些属性，因为 Nest 使用它们在 monorepo 中定位项目及其配置选项。
