### 工作区

Nest 有两种代码组织模式：

- **标准模式** ：适用于构建专注于单个项目的应用程序，这些应用程序拥有自己的依赖项和设置，不需要优化模块共享或复杂构建。这是默认模式。
- **monorepo 模式** ：该模式将代码产物视为轻量级 **monorepo** 的一部分，可能更适合开发团队和/或多项目环境。它自动化了部分构建过程，便于创建和组合模块化组件，促进代码重用，简化集成测试，便于共享项目范围内的产物（如 `eslint` 规则和其他配置策略），且比 Git 子模块等替代方案更易使用。Monorepo 模式采用**工作区**的概念（在 `nest-cli.json` 文件中表示）来协调 monorepo 各组件间的关系。

需要注意的是，Nest 的几乎所有功能都与代码组织模式无关。这种选择**唯一**的影响在于项目的构成方式及构建产物的生成方式。从 CLI 到核心模块再到附加模块，所有其他功能在两种模式下工作方式完全相同。

此外，您可以随时轻松地从**标准模式**切换到 **monorepo 模式** ，因此可以暂缓做出决定，直到其中一种方法的优势更加明显。

#### 标准模式

当运行 `nest new` 命令时，系统会使用内置原理图创建一个新的**项目** 。Nest 会执行以下操作：

1.  创建一个新文件夹，对应你提供给 `nest new` 命令的 `name` 参数
2.  用默认文件填充该文件夹，这些文件对应一个最小化的基础级 Nest 应用。你可以在 [typescript-starter](https://github.com/nestjs/typescript-starter) 代码库中查看这些文件。
3.  提供额外的配置文件如 `nest-cli.json`、`package.json` 和 `tsconfig.json`，用于配置和启用编译、测试及运行应用的各种工具。

之后，你可以修改这些初始文件，添加新组件，安装依赖（例如 `npm install`），并按照本文档其余部分的说明进行应用开发。

#### Monorepo 模式

要启用 monorepo 模式，您需要从一个*标准模式*结构开始，然后添加**项目** 。项目可以是一个完整的**应用程序** (通过命令 `nest generate app` 添加到工作区)或一个**库** (通过命令 `nest generate library` 添加到工作区)。我们将在下文详细讨论这些特定类型的项目组件。现在需要注意的关键点是， **将项目添加**到现有的标准模式结构中这一**操作会将其转换**为 monorepo 模式。让我们看一个例子。

如果我们运行：

```bash
$ nest new my-project
```

我们已经构建了一个*标准模式*结构，其文件夹结构如下所示：

node_modules

src

app.controller.ts

app.module.ts

app.service.ts

main.ts

nest-cli.json

package.json

tsconfig.json

eslint.config.mjs

我们可以将其转换为如下所示的 monorepo 模式结构：

```bash
$ cd my-project
$ nest generate app my-app
```

此时，`nest` 将现有结构转换为 **monorepo 模式**结构。这会导致几项重要变化。现在的文件夹结构如下所示：

apps

my-app

src

app.controller.ts

app.module.ts

app.service.ts

main.ts

tsconfig.app.json

my-project

src

app.controller.ts

app.module.ts

app.service.ts

main.ts

tsconfig.app.json

nest-cli.json

package.json

tsconfig.json

eslint.config.mjs

`generate app` 原理图已重新组织代码 - 将每个**应用**项目移至 `apps` 文件夹下，并在每个项目的根目录中添加项目特定的 `tsconfig.app.json` 文件。我们原来的 `my-project` 应用已成为该 monorepo 的**默认项目** ，现在与刚添加的 `my-app` 并列位于 `apps` 文件夹下。我们将在下文讨论默认项目。

> error **警告** 将标准模式结构转换为 monorepo 仅适用于遵循标准 Nest 项目结构的项目。具体来说，在转换过程中，原理图会尝试将 `src` 和 `test` 文件夹重新定位到根目录下 `apps` 文件夹内的项目文件夹中。如果项目未使用此结构，转换将失败或产生不可靠的结果。

#### 工作区项目

单仓库使用工作区的概念来管理其成员实体。工作区由**项目**组成，项目可以是以下两种类型之一：

- **应用程序** ：一个完整的 Nest 应用，包含用于引导应用的 `main.ts` 文件。除了编译和构建方面的考虑外，工作区中的应用程序类型项目在功能上与*标准模式*结构中的应用完全相同。
- **库** ：库是一种打包通用功能集（模块、提供者、控制器等）的方式，可在其他项目中使用。库无法独立运行，且没有 `main.ts` 文件。了解更多关于库的信息，请[点击此处](/cli/libraries) 。

所有工作区都有一个**默认项目** （应为应用类型的项目）。这由 `nest-cli.json` 文件中的顶级 `"root"` 属性定义，该属性指向默认项目的根目录（详见下方的 [CLI 属性](/cli/monorepo#cli-properties) ）。通常这是您最初创建的**标准模式**应用，之后通过 `nest generate app` 转换为 monorepo 结构。按照这些步骤操作时，该属性会自动填充。

当未提供项目名称时，`nest build` 和 `nest start` 等 `nest` 命令会使用默认项目。

例如在上述 monorepo 结构中，运行

```bash
$ nest start
```

将启动 `my-project` 应用。若要启动 `my-app`，我们需要使用：

```bash
$ nest start my-app
```

#### 应用

应用型项目，或我们非正式地称之为"应用"，是完整的 Nest 应用程序，可以运行和部署。您可以通过 `nest generate app` 命令生成应用型项目。

该命令会自动生成项目骨架，包括来自 [typescript starter](https://github.com/nestjs/typescript-starter) 的标准 `src` 和 `test` 文件夹。与标准模式不同，monorepo 中的应用项目不包含任何包依赖(`package.json`)或其他项目配置构件，如 `.prettierrc` 和 `eslint.config.mjs`。相反，使用的是 monorepo 范围内的依赖项和配置文件。

不过，该原理图确实会在项目根目录下生成一个项目特定的 `tsconfig.app.json` 文件。此配置文件会自动设置适当的构建选项，包括正确设置编译输出文件夹。该文件继承顶层(monorepo)的 `tsconfig.json` 文件，因此您可以在 monorepo 范围内管理全局设置，但可根据需要在项目级别覆盖它们。

#### 库

如前所述，库类型项目（简称"库"）是由需要组合到应用程序中才能运行的 Nest 组件包。您可以使用 `nest generate library` 命令生成库类型项目。决定哪些内容属于库是一个架构设计决策。我们将在[库](/cli/libraries)章节深入讨论相关内容。

#### CLI 属性

Nest 将组织和构建标准项目及 monorepo 结构项目所需的元数据保存在 `nest-cli.json` 文件中。当您添加项目时，Nest 会自动添加和更新此文件，因此通常无需考虑或编辑其内容。不过，有些设置可能需要手动更改，因此了解该文件的概览很有帮助。

完成上述创建 monorepo 的步骤后，我们的 `nest-cli.json` 文件内容如下：

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

该文件分为以下几个部分：

- 一个全局部分，包含控制标准和整个 monorepo 范围设置的顶级属性
- 一个顶级属性（`"projects"`），包含每个项目的元数据。此部分仅存在于 monorepo 模式结构中。

顶级属性如下：

- `"collection"`：指向用于生成组件的原理图集合；通常不应更改此值
- `"sourceRoot"`：在标准模式结构中指向单个项目的源代码根目录，或在 monorepo 模式结构中指向*默认项目*
- `"compilerOptions"`：一个映射表，其键指定编译器选项，值指定选项设置；详见下文
- `"generateOptions"`：一个映射表，其键指定全局生成选项，值指定选项设置；详见下文
- `"monorepo"`：（仅限 monorepo）对于 monorepo 模式结构，该值始终为 `true`
- `"root"`：（仅限 monorepo）指向*默认项目*的项目根目录

#### 全局编译器选项

这些属性指定了要使用的编译器以及影响**所有**编译步骤的各种选项，无论是作为 `nest build` 或 `nest start` 的一部分，也不论使用的是 `tsc` 还是 webpack 编译器。

| 属性名称          | 属性值类型  | 描述                                                                                                                                                                                      |
| ----------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| webpack           | 布尔值      | 若为 true，则使用 webpack 编译器 ；若为 false 或未设置，则使用 tsc。在 monorepo 模式下默认为 true（使用 webpack），标准模式下默认为 false（使用 tsc）。详见下文。（已弃用：改用 builder） |
| tsConfigPath      | 字符串      | （ 仅限 monorepo）指向包含 tsconfig.json 设置的文件，当调用 nest build 或 nest start 时未指定 project 选项（例如构建或启动默认项目时）将使用该配置。                                      |
| webpackConfigPath | 字符串      | 指向 webpack 选项文件。若未指定，Nest 将查找 webpack.config.js 文件。详见下文。                                                                                                           |
| deleteOutDir      | 布尔值      | 若 true，每当调用编译器时，将首先删除编译输出目录（该目录在 tsconfig.json 中配置，默认为 ./dist）。                                                                                       |
| assets            | 数组        | 启用后在每次编译开始时自动分发非 TypeScript 资源（在 --watch 模式的增量编译中不会进行资源分发）。详见下文说明。                                                                           |
| watchAssets       | 布尔值      | 若为 true，则以监视模式运行，监控所有非 TypeScript 资源。（如需更精细控制监视的资源，请参阅下方资源章节）                                                                                 |
| manualRestart     | 布尔值      | 若为 true，则启用快捷键 rs 手动重启服务器。默认值为 false。                                                                                                                               |
| builder           | 字符串/对象 | 指示 CLI 使用哪个 builder 来编译项目（tsc、swc 或 webpack）。要自定义构建器的行为，可以传递一个包含两个属性的对象：type（tsc、swc 或 webpack）和 options。                                |
| typeCheck         | 布尔值      | 如果设为 true，将为 SWC 驱动的项目启用类型检查（当 builder 为 swc 时）。默认值为 false。                                                                                                  |

#### 全局生成选项

这些属性指定了 `nest generate` 命令使用的默认生成选项。

| 属性名称 | 属性值类型                      | 描述                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| -------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| spec     | boolean or object 重试 错误原因 | If the value is boolean, a value of true enables spec generation by default and a value of false disables it. A flag passed on the CLI command line overrides this setting, as does a project-specific generateOptions setting (more below). If the value is an object, each key represents a schematic name, and the boolean value determines whether the default spec generation is enabled / disabled for that specific schematic. 重试 错误原因 |
| flat     | boolean 重试 错误原因           | If true, all generate commands will generate a flat structure 重试 错误原因                                                                                                                                                                                                                                                                                                                                                                         |

以下示例使用布尔值指定默认情况下应为所有项目禁用规范文件生成：

```javascript
{
  "generateOptions": {
    "spec": false
  },
  ...
}
```

以下示例使用布尔值指定平面文件生成应作为所有项目的默认设置：

```javascript
{
  "generateOptions": {
    "flat": true
  },
  ...
}
```

在以下示例中，`spec` 文件生成仅对 `service` 原理图禁用（例如 `nest generate service...`）：

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

> warning **警告** 当将 `spec` 指定为对象时，生成原理图的键目前不支持自动别名处理。这意味着如果将键指定为例如 `service: false` 并尝试通过别名 `s` 生成服务，规范文件仍会被生成。为确保正常原理图名称和别名都能按预期工作，请同时指定常规命令名称和别名，如下所示。
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
```

#### 项目专属生成选项

除了提供全局生成选项外，您还可以指定项目专属生成选项。项目专属生成选项的格式与全局生成选项完全相同，但直接在每个项目上指定。

项目专属生成选项会覆盖全局生成选项。

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

> warning **注意** 生成选项的优先级顺序如下：命令行界面(CLI)指定的选项优先于项目专属选项，项目专属选项会覆盖全局选项。

#### 指定编译器

不同默认编译器的存在是因为对于大型项目（例如在 monorepo 中更常见的情况），webpack 在构建时间和生成包含所有项目组件的单一文件包方面具有显著优势。若希望生成独立文件，请将 `"webpack"` 设为 `false`，这将使构建过程改用 `tsc`（或 `swc`）。

#### Webpack 选项

webpack 选项文件可包含标准的 [webpack 配置选项](https://webpack.js.org/configuration/) 。例如，若要 webpack 打包默认排除的 `node_modules`，需在 `webpack.config.js` 中添加以下配置：

```javascript
module.exports = {
  externals: [],
};
```

由于 webpack 配置文件是一个 JavaScript 文件，你甚至可以导出一个接收默认选项并返回修改后对象的函数：

```javascript
module.exports = function (options) {
  return {
    ...options,
    externals: [],
  };
};
```

#### 资源文件

TypeScript 编译会自动将编译器输出（`.js` 和 `.d.ts` 文件）分发到指定输出目录。同时分发非 TypeScript 文件也很方便，例如 `.graphql` 文件、 `图片` 、`.html` 文件和其他资源。这使你可以将 `nest build`（以及任何初始编译步骤）视为轻量级的**开发构建**步骤，在此过程中你可以编辑非 TypeScript 文件并迭代编译和测试。这些资源文件应位于 `src` 文件夹中，否则它们将不会被复制。

`assets` 键的值应为一个数组，其中元素指定了要分发的文件。这些元素可以是带有 `glob` 式文件规范的简单字符串，例如：

```typescript
"assets": ["**/*.graphql"],
"watchAssets": true,
```

如需更精细的控制，可将元素设置为包含以下键的对象：

- `"include"`：用于指定待分发资源的类 `glob` 文件匹配模式
- `"exclude"`：用于指定从 `include` 列表中**排除**资源的类 `glob` 文件匹配模式
- `"outDir"`：指定资源分发路径（相对于根文件夹）的字符串。默认为编译器输出配置的相同输出目录。
- `"watchAssets"`: 布尔值；若为 `true`，则以监视模式运行并监听指定资源文件

例如：

```typescript
"assets": [
  { "include": "**/*.graphql", "exclude": "**/omitted.graphql", "watchAssets": true },
]
```

> **警告** 在顶层 `compilerOptions` 属性中设置 `watchAssets` 将覆盖 `assets` 属性内的所有 `watchAssets` 配置

#### 项目属性

此元素仅存在于 monorepo 模式结构中。通常不应编辑这些属性，因为它们被 Nest 用于在 monorepo 中定位项目及其配置选项。
