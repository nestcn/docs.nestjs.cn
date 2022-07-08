# CLI

## 概述

[Nest CLI](https://github.com/nestjs/nest-cli)是一个命令行界面工具，以帮助您初始化、开发和维护 `Nest` 应用程序。它以多种方式提供帮助，包括搭建项目、以开发模式为其提供服务，以及为生产分发构建和打包应用程序。它体现了最佳实践的架构模式，以构建良好的应用程序。

### 安装

注意:在本指南中，我们描述了如何使用 [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) 来安装包，包括 `Nest CLI`。您可以自行决定是否使用其他包管理器。使用 `npm`，您可以使用几个选项来管理操作系统命令行如何解析 `nest CLI` 二进制文件的位置。在这里，我们描述了使用 `-g` 选项全局安装 `nest` 二进制文件。这提供了一种方便方法，也是我们在整个文档中所采用的方法。请注意，全局安装任何`npm` 包将确保运行正确版本的责任留给了用户。这还意味着，如果您有不同的项目，每个项目将运行相同版本的 `CLI` 。一个合理的替代方法是使用 [npx](https://github.com/npm/npx) 程序(或与其他包管理器类似的特性)来确保运行托管版本的 `Nest CLI` 。我们建议您参考 `npx` 文档或您的 `DevOps` 支持人员以获得更多信息。

使用 `npm Install -g` 命令全局安装 `CLI` (有关全局安装的详细信息，请参阅上面的说明)。

使用 **NPM** 安装 CLI：

```bash
$ npm install -g @nestjs/cli
```

### 基本工作流程

安装过程完成后，您应该能够通过 `nest` 可执行文件直接从命令行调用 `CLI` 命令。

```bash
$ nest --help
```

使用以下结构获取有关单个命令的帮助。 替换任何命令，例如 `new` ，`add` 等，在下面的示例中看到的 `generate` 可以获取有关该命令的详细帮助：

```bash
$ nest generate --help
```

要在开发模式下创建、构建和运行新的基本 `Nest` 项目，请转到父项目的文件夹下，并运行以下命令:

```bash
$ nest new my-nest-project
$ cd my-nest-project
$ npm run start:dev
```

在浏览器中，打开 `http://localhost:3000` 查看新应用程序的运行情况。当您更改任何源文件时，应用程序将自动重新编译和重新加载。

### 项目结构

当您运行 `nest new` 时，`nest` 通过创建一个新文件夹并填充一组初始文件来生成一个样板应用程序结构。您可以继续在这个默认结构中工作，添加新的组件，如本文档所述。我们将 `nest new` 生成的项目结构称为标准模式。`Nest` 还支持一种名为 `monorepo` 模式的替代结构，用于管理多个项目和库。

除了一些特定的因素在构建过程是如何工作的(实际上, `monorepo` 模式简化了构建复杂性,有时来自 `monorepo-style` 项目结构),和内置库支持,其余的巢特性,这个文档,同样适用于标准和 `monorepo` 模式项目结构。事实上，您可以在将来的任何时候轻松地从标准模式切换到 `monorepo` 模式，因此您可以在学习 `Nest` 时使用。

您可以使用任何一种模式来管理多个项目。这里是一个快速的差异总结:


| 功能 | 标准模式 | `Monorepo` 模式|
|---|---|---|
|多个项目| 独立文件系统结构 | 单文件系统结构 |
| `node_modules` 和 `package.json` | 单独的实例 | 跨 `monorepo`共享 |
| 默认的编译器 | `tsc` | `webpack` |
| 编译器设置 | 分别指定 | `Monorepo` 默认值，每个项目都可以覆盖它 | 
| `tslint.json`，`.prettierrc` 等配置文件| 分别指定 | 跨 `monorepo` 共享 |
| `nest build` 和 `nest start` 命令| 目标自动默认为上下文中的（仅）项目 | 目标默认为 `monorepo` 中的默认项目|
| 库 | 手动管理，通常通过 `npm` 打包 | 内置支持，包括路径管理和绑定 | 

阅读有关 `Workspaces` 和 `Libraries` 的部分，以获取更多详细信息，以帮助您确定最适合您的模式。

### CLI 命令语法

所有的 `nest` 命令都遵循相同的格式:

```bash
nest commandOrAlias requiredArg [optionalArg] [options]
```

例如:

```bash
$ nest new my-nest-project --dry-run
```

在这里，`new` 是命令或别名。 新命令的别名为n.  `my-nest-project` 是必需的参数。 如果命令行上未提供所需的参数，则 `nest` 将提示您输入。 同样，`--dry-run` 也有一个类似的简写形式 `-d` 。 考虑到这一点，以下命令与上面的命令等效：

```bash
$ nest n my-nest-project -d
```

大多数命令和一些选项都有别名。尝试运行 `nest new --help` 查看这些选项和别名，并确认您对上述构造的理解。

### 命令概述

运行`nest <command> --help` 查看帮助，查看特定于命令的选项。

有关每个命令的详细描述，请参见用法。

|命令 | 别名 | 描述|
|---|---|---|
| `new` | `n` | 搭建一个新的标准模式应用程序，包含所有需要运行的样板文件。|
| `generate` | `g` | 根据原理图生成或修改文件。 |
| `build` || 将应用程序或 `workspace` 编译到输出文件夹中。|
| `start` || 编译并运行应用程序（或 `workspace` 中的默认项目）。 |
| `add` || 导入已打包为`nest`的库，运行其安装示意图。|
| `update`|`u`| 更新包中的 `@nestjs` `package.json `  `dependencies` 列表的 `@latest` 版本。|
| `info` |`i`| 现实已安装的`nest`包和其他有用的系统信息。|

## 工作空间

`Nest` 有两种组织代码的模式:

- **标准模式**: 用于构建具有自己的依赖项和设置、不需要优化共享模块或优化复杂，构建以项目为中心的应用程序。这是默认模式。

- **`monorepo`模式**: 该模式将代码工件作为轻量级 `monorepo` 的一部分，可能更适合开发团队或多项目环境。它自动化了构建过程的各个部分，使创建和组合模块化组件变得容易，促进了代码重用，使集成测试变得更容易，使共享项目范围内的工件(如 `tslint` 规则和其他配置策略)变得容易，并且比 `github` 子模块之类的替代方法更容易使用。`Monorepo` 模式采用了在 `nest-cli.json` 中表示工作区的概念，以协调 `monorepo` 组件之间的关系。

需要注意的是，实际上 `Nest` 的所有特性都与您的代码组织模式无关。此选择的惟一影响是如何组合项目以及如何生成构建构件。所有其他功能，从 `CLI` 到核心模块再到附加模块，在任何一种模式下都是相同的。

此外，您可以在任何时候轻松地从标准模式切换到 `monorepo` 模式，因此您可以延迟此决策，直到其中一种方法的好处变得更加明显。

### 标准模式

当您运行 `nest new` 时，将使用一个内置的示意图为您创建一个新项目。`Nest` 的做法如下:

1. 创建一个新文件夹，使用你提供给 `nest new` 的`name`相同的参数。

2. 用与最小的基础级 `Nest`应用程序对应的默认文件填充该文件夹。您可以在 [typescript-starter](https://github.com/nestjs/typescript-starter) 存储库中检查这些文件。

3. 提供其他文件，如 `nest-cli.json` 、 `package.json` 和 `tsconfig.json`。启用用于编译、测试和服务应用程序的各种工具。

从这里开始，你可以修改其他起始文件，添加新部件，添加依赖（例如`npm install`)，或者依据本文指导进行开发。

### Monorepo模式

要启用 `monorepo` 模式，您可以从一个标准模式结构开始，然后添加 `project` 。 `project` 可以是一个完整的应用程序(使用 `nest generate app` 将一个应用程序添加到 `workspace` 中)，也可以是一个库(使用 `nest generate lib` 将一个库添加到 `workspace` 中)。我们将在下面详细讨论这些特定类型的项目组件。现在要注意的关键点是将项目添加到现有的标准模式结构中，然后将其转换为 `monorepo` 模式。让我们看一个例子。

如果我们运行:

```bash
nest new my-project
```

我们已经构建了一个标准模式结构，其文件夹结构如下:

```bash
src
|_ app.controller.ts
|_ app.service.ts
|_ app.module.ts
|_ main.ts
node_modules
nest-cli.json
package.json
tsconfig.json
tslint.json
```

我们可以将其转换为一个 `monorepo` 模式结构如下:

```bash
cd my-project
nest generate app my-app
```

此时，`nest` 将现有结构转换为 `monorepo` 模式结构。 这导致一些重要的变化。 现在，文件夹结构如下所示：

```bash 
apps
├──my-app
│  │──src
│  │  │── app.controller.ts
│  │  │── app.service.ts
│  │  │── app.module.ts
│  │  └── main.ts
│  └──  tsconfig.app.json
└──my-project
   │──src
   │  │── app.controller.ts
   │  │── app.service.ts
   │  │── app.module.ts
   │  └── main.ts
   └──tsconfig.app.json
nest-cli.json
package.json
tsconfig.json
tslint.json
```

生成`generate app `重新组织了代码——将每个应用程序项目移到 `apps` 文件夹下，并添加一个特定于项目的 `tsconfig.app.json`文件。我们最初的 `my-project` 应用程序已经成为 `monorepo` 的默认项目，现在是刚刚添加的 `my-app` 的同级应用程序，位于 `apps` 文件夹下。我们将在下面讨论默认项目。

?> 将标准模式结构转换为 `monorepo` 只适用于遵循标准 `Nest` 项目结构的项目。具体来说，在转换期间，`schematic` 尝试重新定位 `src` 和`test` 文件夹，它们位于根目录下的 `apps` 文件夹下的一个项目文件夹中。如果项目不使用这种结构，转换将失败或产生不可靠的结果。

###  工作区项目

`monorepo`使用工作区的概念来管理其成员实体。 工作区由项目组成。 一个项目可能是：

- 一个应用程序：一个完整的 `Nest` 应用程序，包括一个 `main.ts` 文件来引导应用程序。除了编译和构建之外，工作空间中的应用程序类型项目在功能上与标准模式结构中的应用程序相同。

- 库：库是一种打包一组通用功能(模块、提供程序、控制器等)的方法，这些功能可以在其他项目中使用。库不能独立运行，也没有 `main.ts` 文件。在这里阅读更多关于图书馆的信息。

所有工作空间都有一个默认项目(应该是应用程序类型的项目)。这是由 `nest-cli.json` 中的顶级“根”属性文件，它指向默认项目的根(有关详细信息，请参阅下面的 `CLI` 属性)。通常，这是您开始使用的标准模式应用程序，然后使用 `nest generate` 应用程序将其转换为 `monorepo`。

当没有提供项目名称时，`nest build` 和 `nest start` 等 `nest` 命令使用默认项目。

例如，在上面的 `monorepo` 结构中，运行

```bash
$ nest start
```

将启动 `my-project app` 。要启动 `my-app` ，我们将使用:

```bash
$ nest start my-app
```

### 应用

应用程序类型的项目，或者我们通常所说的”应用程序”，是可以运行和部署的完整的 `Nest` 应用程序。使用 `nest generate` 应用程序生成应用程序类型的项目。

该命令自动生成一个项目框架，包括来自 `typescript starter` 的标准 `src` 和测试文件夹。与标准模式不同，`monorepo` 中的应用程序项目不具有任何包依赖项( `package.json` )或其他项目配置构件，如 `.prettierrc` 和 `tslint.json` 。相反，使用单处理器范围的依赖项和配置文件。

然而，该示意图确实生成了特定于项目的 `tsconfig.app.json`。此配置文件自动设置适当的生成选项，包括正确设置编译输出文件夹。该文件扩展了顶级(monorepo) `tsconfig.json` 文件，因此您可以管理单点范围内的全局设置，但是如果需要，可以在项目级别覆盖它们。

### 库

如前所述，库类型的项目，或者简称“库”，是一些打包的Nest组件，可以集成在应用中来运行。可以使用`nest generate library`来生成库类型项目。决定哪些内容在一个库中是架构级别的决策。我们将在“库”一章深入讨论。

### CLI 属性

Nest在`nest-cli.json`文件中保留了组织、创建和部署标准项目和monorepo结构项目的元数据。Nest在你添加项目的项目时会自动添加和更新这些文件，因此一般来说你不需要考虑或者编辑它的内容。当然，有些设置我们可能需要手动修改，因此了解这个文件可能会有所帮助。

在运行上述指令来创建一个monorepo后，`nest-cli.json`文件看上去是这样：

```typescript
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

该文件被分为以下部分：

- 一个全局部分，包含用于控制标准和monorepo范围设置的顶层属性。
- 一个顶层属性(`projects`)包含每个项目的元数据。这部分仅仅在monorepo结构中包括。

顶层属性包括：

- "`collection`":用于配置生成部件的schematics组合的点；你一般不需要改变这个值。
- "`sourceRoot`":标准模式中单项目源代码根入口，或者monorepo模式结构中的默认项目。
- "`compilerOptions`":一个键值映射用于指定编译选项和选项的设置；详见后文。
- "`generateOptions`":一个键值映射用于指定全局生成的选项和选项的设置；详见后文。
- "`monorepo`":(仅用于monorepo)在monorepo结构中，该设置始终为`true`。
- "`root`":(仅用于monorepo)默认项目的项目根目录要点。

### 全局编译器选项

|属性名称 | 属性值类型 | 描述|
|---|---|---|
| `webpack` | `boolean` | 如果为`true`，使用`webpack compiler`。如果`false`或者不存在，使用`tsc`。在monorepo模式中，默认为`true`(使用webpack)，在标准模式下，默认为`false`(使用`tsc`)，详见如下|
| `tsConfigPath` | `string` | (仅用于monorepo)包含`tsconfig.json`文件设置的点，在使用`nest build`或者`nest start`而未指定`project`选项时将使用该设置（例如，默认项目在构建或启动时） |
| `webpackConfigPath` |`string`| webpack选项文件，如果不指定，Nest会查找`webpack.config.js`。详见后文。|
| `deleteOutDir` |`boolean`| 如果为`true`，无论编译器是否激活， 首先会移除汇编输出目录（在`tsconfig.json`中配置，默认`./dist`)。|
| `assets` |`array`| 当编译步骤开始时，使能非Typescript资源文件的自动部署（在--watch模式下，资源文件在增量编译时不会部署）。详见后文|
| `watchAssets`|`boolean`| 如果为`true`，在watch模式运行时，监视所有非Typescript资源文件（如果要更精确控制要监控的资源文件，见后续**资源文件**章节）。|

### 全局生成器选项

这些属性指定`nest generate`指令的默认生成选项：

|属性名称 | 属性值类型 | 描述|
|---|---|---|
| `spec` | `boolean`或`object` |如果该值是`boolean`，设置为`true`默认使能`spec`生成，设置为`false`禁用它。在`CLI`命令行传递一个`flag`来覆盖这一设置，和项目中`generateOptions`设置一样（见下）。如果该值是`object`，每个键代表一个`schematic`名称，而布尔值则代表是/否为特定`schematic`使能`spec`生成|

下列示例使用一个布尔值并指定默认在所有项目中禁用`spec`文件生成。
```typescript
{
  "generateOptions": {
    "spec": false
  },
  ...
}
```
在下列示例中，`spec`文件生成仅仅在`service`的schematics被禁用（也就是`nest generate service...`):
```typescript
{
  "generateOptions": {
    "spec": {
      "service": false
    }
  },
  ...
}
```

!> 当指定`spec`作为对象时，生成schematic的键目前还不支持自动生成别名，这意味着例如要将一个键`service:false`通过别名`s`生成服务，`spec`仍然会被生成。要保证通常的schematic名称和别名都可以按意图工作，需要按如下来分别指定通常的名称和别名：
```typescript
{
  "generateOptions": {
    "spec": {
      "service": false,
      "s": false
    }
  },
  ...
}
```

### 项目生成选项

在全局生成器选项之外，你可能希望指定针对项目的生成器选项。项目级别的生成选项和全局生成选项格式完全一样，但是针对每个项目单独设置。

项目范围的生成选项会覆盖全局生成选项：

```typescript
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

!> 生成选项的顺序如下。在CLI命令行中指定的选项优于项目级别选项。项目级别选项覆盖全局选项。

### 特定编译器

使用不同的默认编译器原因在于针对大型项目时（例如一个典型的monorepo项目），`webpack`在构建时间和生成一个将所有项目部件打包的单一文件时具有明显的优势。如果你希望生成独立的文件。设置`webpack`为`false`，这将使用`tsc`来实现编译过程。

### Webpack选项

webpack选项文件可以包含标准的[webpack配置选项](https://webpack.js.org/configuration/)。例如，要告诉webpack来打包`node_modules`(默认排除在外)，添加下列内容到`webpack.config.js`：

```typescript
module.exports = {
  externals: [],
};
```

因为`webpack`配置文件是一个JavaScript文件，你可以暴露出一个包含默认选项的函数，其返回一个编辑后的对象：
```typescript
module.exports = function(options) {
  return {
    ...options,
    externals: [],
  };
};
```

### 资源文件

TypeScript编译器自动编译输出（`.js`和`.d.ts`文件）到指定的输出文件夹。对非TypeScript文件例如`.graphql`文件、`images`，`html`文件和其他资源文件也同样很方便。这允许你将`nest build`（以及其他编译初始化步骤）作为一个轻型的**开发构建**步骤，你可以编辑非TypeScript文件并进行迭代编译和测试。

`assets`关键字值是一个包含要处理的文件的数组，其元素可以是简单的字符串或者类似`glob`的文件说明，例如：

```typescript
"assets": ["**/*.graphql"],
"watchAssets": true,
```
为更好的控制，元素可以是包含如下键的对象：
- "include":指定的要处理的类似`glob`文件。
- "exclude":从`include`中排除的类似`glob`文件。
- "outDir":一个指定路径的字符串（相对根目录），用于放置资源文件。默认和编译器配置的输出路径一致。
- "watchAssets":布尔量，如果为`true`，将运行与watch模式来监控指定资源文件。

例如：
```typescript
"assets": [
  { "include": "**/*.graphql", "exclude": "**/omitted.graphql", "watchAssets": true },
]
```

!> 在顶级的`compilerOptions`中设置`watchAssets`，覆盖`assets`中的`watchAssets`。 

### 项目属性

该元素仅存在于monorepo模式结构中。你通常不需要编辑这些属性，因为它们是Nest用来在monorepo中定位项目和它们的配置选项的。

## 库

很多应用需要处理类似的问题，或者说是在不同上下文中重用模块化组件。Nest提供了一系列方法来实现这个，每个方法在不同层面上面向不同的架构或组织目标来解决问题。

`Nest` 模块对于提供执行上下文非常有用，它支持在单个应用程序中共享组件。模块还可以与 `npm` 打包，可以在不同项目中创建可重用库。这是一种分发可配置、可重用的库的有效方法，这些库可以由不同的、松散连接的或不可靠的组织使用(例如，通过分发/安装第三方库)。

对于在组织严密的组内共享代码(例如，在公司/项目边界内)，使用更轻量级的方法来共享组件是很有用的。`Monorepo` 的出现是为了实现这一点，在 `Monorepo` 中，库以一种简单、轻量级的方式提供了一种共享代码的方式。在 `Nest monorepo` 中，使用库可以方便地组装共享组件的应用程序。事实上，这鼓励了对独立应用程序和开发过程的分解，将重点放在构建和组合模块化组件上。


### Nest库

`Nest` 库是一个与应用程序不同的 `Nest` 项目，因为它不能独立运行。必须将库导入到包含它的应用程序中才能执行它的代码。本节中描述的对库的内置支持仅适用于 `monorepos` (标准模式项目可以使用 `npm` 包实现类似的功能)。


例如，组织可以开发一个 `AuthModule`，通过实现控制所有内部应用程序的公司策略来管理身份验证。 `monorepo` 可以将这个模块定义为一个库，而不是为每个应用程序单独构建那个模块，或者使用 `npm` 物理地打包代码并要求每个项目安装它。当以这种方式组织时，库模块的所有使用者在提交 `AuthModule` 时都可以看到它的最新版本。这对于协调组件开发和组装，以及简化端到端测试有很大的好处。

### 创建库

任何适合重用的功能都可以作为库来管理。决定什么应该是库，什么应该是应用程序的一部分，是一个架构设计决策。创建库不仅仅是将代码从现有应用程序复制到新库。当打包为库时，库代码必须与应用程序解耦。这可能需要更多的预先准备时间，并迫使您做出一些设计决策，而这些决策可能不需要更紧密耦合的代码。但是，当库可以用于跨多个应用程序实现更快速的应用程序组装时，这种额外的努力就会得到回报。

要开始创建一个库，运行以下命令:

```typescript
nest g library my-library
```

当您运行该命令时，库示意图会提示您输入库的前缀(即别名):

```bash
What prefix would you like to use for the library (default: @app)?
```

这将在工作区中创建一个名为 `my-library` 的新项目。与应用程序类型项目一样，库类型项目使用示意图生成到指定文件夹中。库是在 `monorepo` 根目录的 `libs` 文件夹下管理的。`Nest` 在第一次创建库时创建 `libs` 文件夹。

为库生成的文件与为应用程序生成的文件略有不同。执行以上命令后，`libs` 文件夹的内容如下:

```bash
libs
 └──my-library
      │──src
      │   │── my-library.service.ts
      │   │── my-library.module.ts
      │   └── index.ts
      └── tsconfig.lib.json

```

`nest-cli.json` 文件将在“项目”键下为库添加一个新条目:

```bash
...
{
    "my-library": {
      "type": "library",
      "root": "libs/my-library",
      "entryFile": "index",
      "sourceRoot": "libs/my-library/src",
      "compilerOptions": {
        "tsConfigPath": "libs/my-library/tsconfig.lib.json"
      }
}
...
```

库和应用程序之间的 `nest-cli.json` 元数据有两个区别：

- `“type”` 属性被设置为 `“library”` 而不是 `“application”`

- `“entryFile”` 属性被设置为 `“index”` 而不是 `“main”`


这些差异是构建过程适当处理库的关键。例如，一个库通过 `index.js` 文件导出它的函数。

与应用程序类型的项目一样，每个库都有其自己的 `tsconfig.lib.json` 文件，该文件扩展了根 `tsconfig.json` 文件。 您可以根据需要修改此文件，以提供特定于库的编译器选项。

您可以使用 `CLI` 命令构建库：

```bash
nest build my-library
```

### 使用库

有了自动生成的配置文件，使用库就很简单了。我们如何将 `MyLibraryService` 从 `my-library` 库导入 `my-project` 应用程序?

首先，注意使用库模块与使用其他 `Nest` 模块是一样的。`monorepo` 所做的就是以一种导入库和生成构建现在是透明的方式来管理路径。要使用 `MyLibraryService` ，我们需要导入它的声明模块。我们可以修改 `my-project/src/app.module` 。按照以下步骤导入`MyLibraryModule`。

```typescript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MyLibraryModule } from '@app/my-library';

@Module({
  imports: [MyLibraryModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

请注意，上面我们在模块导入行中使用了 `@app` 的路径别名，这是我们在上面的 `nest g library` 命令中提供的前缀。`Nest` 通过 `tsconfig` 路径映射处理此问题。 添加库时，`Nest` 会更新全局（`monorepo`）`tsconfig.json`文件的 `“paths”` 键，如下所示：

```json
"paths": {
    "@app/my-library": [
        "libs/my-library/src"
    ],
    "@app/my-library/*": [
        "libs/my-library/src/*"
    ]
}
```

因此，简单地说，`monorepo` 和库特性的组合使将库模块包含到应用程序中变得简单和直观。

这种机制也支持构建和部署组成库的应用程序。导入 `MyLibraryModule` 之后，运行 `nest build` 将自动处理所有的模块解析，并将应用程序与任何库依赖项捆绑在一起进行部署。`monorepo` 的默认编译器是 `webpack`，因此生成的分发文件是一个文件，它将所有转换后的 `JavaScript` 文件打包成一个文件。

##  用法

### CLI命令参考

### nest new

创建一个新的(标准模式)Nest项目。

```bash
$ nest new <name> [options]
$ nest n <name> [options]
```

描述

创建并初始化一个新的 `Nest` 项目。提示使用包管理器。

- 创建具有给定的文件夹

- 用配置文件填充文件夹

- 为源代码( `/src` )和端到端测试( `/test` )创建子文件夹

- 用应用程序组件和测试的默认文件填充子文件夹

参数

|参数 | 描述 | 
|---|---|
| `<name>` |新项目的名称|

选项

|选项|描述|
|---|---|
| `--dry-run` |报告将要进行的更改，但不更改文件系统。 别名:- d|
|`--skip-git`|跳过 `git` 存储库初始化。别名:- g|
|`--skip-install`|跳过软件包安装。 别名：-s|
|`--package-manager [package-manager]`| 指定包管理器。使用 `npm` 或 `yarn`。必须全局安装包管理器。别名: -p|
|`--language [language]` |指定编程语言(`TS` 或 `JS`)。别名:- l|
|`--collection [collectionName]`| 指定逻辑示意图集合。 使用已安装的包含原理的 `npm` 软件包的软件包名称。别名：-c|


### nest generate

根据原理图生成或修改文件

```bash
$ nest generate <schematic> <name> [options]
$ nest g <schematic> <name> [options]
```

参数

|参数 | 描述 | 
|---|---|
|`<schematic>`| 原理图或集合:生成原理图。可用的示意图见下表。|
| `<name>` |生成的组件的名称。|

Schematics

|名称|别名|描述|
|---|---|---|
|`app`||在 `monorepo` 中生成一个新应用程序(如果它是一个标准结构，则转换为 `monorepo`)。|
|`library`|`lib`|在 `monorepo` 中生成一个新库(如果是标准结构，则转换为 `monorepo` )。|
|`class`|	`cl`|生成一个新类。|
|`controller`|`co`|生成控制器声明|
|`decorator` |`d`| 生成自定义装饰器。| 
|`filter`|`f`|生成过滤器声明。|
|`gateway`|	`ga`|生成网关声明。|
|`guard`|`gu`|生成守卫声明。|
|`interface`||生成一个接口。|
|`interceptor`|`in`|生成一个拦截器声明。|
|`middleware`|`mi`|生成中间件声明。|
|`module`|`mo`|生成模块声明。|
|`pipe`|`pi`|生成管道声明。|
|`provider`|`pr`|生成提供者声明。|
|`resolver`|`r`|生成解析器声明。|
|`service`|`s`|生成服务声明。|

选项：

|选项|描述|
|---|--|
|`--dry-run`| 报告将要进行的更改，但不更改文件系统。别名:- d|
|`--project [project]`|应该将该元素添加到项目中。别名:-p|
|`--flat`|不要为元素生成文件夹。|
|`--collection [collectionName]`|指定逻辑示意图集合。 使用已安装的包含原理图的npm软件包的软包名称。别名：-c|
|`--spec`|强制spec文件生成（默认）|
|`--no-spec`|禁用spec文件生成|

### nest build

将应用程序或工作区编译到输出文件夹中。

```bash
$ nest build <name> [options]
```

参数

|参数 | 描述 | 
|---|---|
|`<name>`|要构建的项目的名称。|


选项：

|选项|描述|
|---|--|
|`--path [path]`| `tsconfig`文件的路径。别名: `-p`|
|`--watch`| 在监视模式下运行（实时重载）别名-w|
|`--webpack`|使用 `webpack` 进行编译。|
|`--webpackPath`|配置 `webpack` 的路径。|
|`--tsc`|强制使用 `tsc` 编译。|

### nest start

编译并运行应用程序(或工作空间中的默认项目)。

```bash
$ nest start <name> [options]
```

参数

|参数 | 描述 | 
|---|---|
|`<name>`|要运行的项目的名称。|


选项：

|选项|描述|
|---|--|
|`--path [path]`| `tsconfig`文件的路径。别名: `-p`|
|`--config [path]`| `nest-cli`配置文件的路径。别名: `-c`|
|`--watch`| 在监视模式下运行（实时重载）别名-w|
|`--preserveWatchOutput`| 在watch模式下，保存命令行输出内容而不是清空屏幕（仅在`tsc watch`模式下)|
|`--watchAssets`| 运行在watch模式下（热重载），监控非TS文件（资源文件），见**资源文件**了解更多细节|
|`--debug [hostport]`| 在debug模式运行（使用--inspect标识），别名-d|
|`--webpack`|使用 `webpack` 进行编译。|
|`--webpackPath`|webpack配置路径。|
|`--tsc`|强制使用 `tsc` 编译。|
|`--exec [binary]`|要运行的二进制文件（默认：`node`）。别名: `-e`|

### nest add

导入一个已打包为 `nest库`的库，运行其安装示意图;导入一个已打包为 `nest` 库的库，运行其安装示意图

```bash
$ nest add <name> [options]
```

选项：

|选项|描述|
|---|--|
|`<name>`|要导入的库的名称。|


### nest update

将 `package.json` “依赖项”列表中的 `@nestjs` 依赖项更新为其 `@latest` 版本。

选项：

|选项|描述|
|---|--|
|`--force`|做升级而不是更新别名: -f|
|`--tag`|更新为标记版本（使用 `@latest`，`@<tag>`等）别名-wt|


### nest info

显示nest安装的包和其他有用的系统信息，例如：

```bash
 _   _             _      ___  _____  _____  _     _____
| \ | |           | |    |_  |/  ___|/  __ \| |   |_   _|
|  \| |  ___  ___ | |_     | |\ `--. | /  \/| |     | |
| . ` | / _ \/ __|| __|    | | `--. \| |    | |     | |
| |\  ||  __/\__ \| |_ /\__/ //\__/ /| \__/\| |_____| |_
\_| \_/ \___||___/ \__|\____/ \____/  \____/\_____/\___/

[System Information]
OS Version : macOS High Sierra
NodeJS Version : v8.9.0
YARN Version : 1.5.1
[Nest Information]
microservices version : 6.0.0
websockets version : 6.0.0
testing version : 6.0.0
common version : 6.0.0
core version : 6.0.0
```

## 脚本

### Nest CLI和 scripts

本节提供有关 `nest`命令如何与编译器和脚本交互以帮助 `DevOps` 人员管理开发环境的其他背景。

Nest应用程序是标准的 `TypeScript` 应用程序，需要先将其编译为 `JavaScript` 才能执行。有多种方法可以完成编译步骤，并且开发人员/团队可以自由选择最适合他们的方法。考虑到这一点，`Nest` 提供了一系列开箱即用的工具，它们旨在执行以下操作：

- 提供在命令行上可用的标准构建/执行过程，该过程“合理”且具有合理的默认值。
- 确保构建/执行过程是开放的，以便开发人员可以直接访问基础工具以使用本机功能和选项对其进行自定义。
- 保留一个完全标准的 `TypeScript` / `Node.js` 框架，以便可以由开发团队选择使用的任何外部工具来管理整个编译/部署/执行。

通过结合使用 `nest` 命令，本地安装的 `TypeScript` 编译器和 `package.json` 脚本来实现此目标。我们在下面描述这些技术如何协同工作。这应该有助于您了解在构建/执行过程的每个步骤中发生了什么，以及在必要时如何自定义该行为。

### Nest 二进制

`nest` 命令是操作系统级别的二进制文件（即从OS命令行运行）。 该命令实际上包含3个不同的区域，如下所述。 我们建议您通过包运行构建( `nest build` )和执行( `nest start` )子命令。当一个项目被搭建时，会自动提供 `json` 脚本如果您希望通过克隆仓库而不是运行仓库来启动，请参见 [typescript starter](https://github.com/nestjs/typescript-starter))。

### Build

`nest build` 是标准 `tsc` 编译器(用于标准项目)或 `webpack` 编译器(用于 `monorepos` )之上的包装器。它不添加任何其他编译特性或步骤。它存在的原因是，大多数开发人员，特别是在开始使用 `Nest` 时，不需要调整编译器选项(（例如 `tsconfig.json` 文件）。


有关更多细节，请参见 `nest build`文档。

### Execution

`nest start` 只是确保已构建项目（与 `nest build` 相同），然后以可移植，简单的方式调用 `node` 命令以执行已编译的应用程序。 与构建一样，您可以根据需要自由定制此过程，可以使用 `nest start` 命令及其选项，也可以完全替换它。 整个过程是标准的 `TypeScript` 应用程序构建和执行管道，您可以自由地管理过程。

有关更多详细信息，请参见 `nest start` 文档。

### Generation

`nest` 生成命令，顾名思义，生成新的 `nest` 项目或其中的组件。

### Package scripts

在 `OS` 命令级别运行 `nest` 命令需要全局安装 `nest` 二进制文件。这是 `npm` 的标准特性，不受 `Nest` 的直接控制。这样做的一个后果是，全局安装的 `nest` 二进制文件在 `package.json` 中没有作为项目依赖项进行管理。例如，两个不同的开发人员可以运行两个不同版本的 `nest` 二进制代码。对此的标准解决方案是使用 `Package` 脚本，以便您可以将构建中使用的工具和执行步骤视为开发依赖项。

运行 `nest new` 或克隆 `typescript starter` 时，`nest` 将填充新项目的包。`Nest` 使用诸如 `build` 和 `start` 之类的命令填充新项目的 `package.json` 脚本。 它还将基础编译器工具（例如 `Typescript` ）安装为 `dev` 依赖项。

你运行构建和执行脚本的命令如下:

```bash
$ npm run build
```
和
```bash
$ npm run start
```

这些命令使用 `npm` 的脚本运行功能来执行 `nest` 构建，或者使用本地安装的 `nest` 二进制文件启动 `nest`。通过使用这些内置的包脚本，您可以对 `Nest CLI` 命令*进行完全的依赖管理。这意味着，通过遵循建议的用法，可以确保组织的所有成员都可以运行相同版本的命令。

这适用于构建和启动命令。`nest new` 和 `nest generate` 命令不属于 `build/execute` 管道的一部分，因此它们在不同的上下文中操作，并且不附带内置 `package.json` 脚本。

对于大多数开发人员/团队，建议使用包脚本来构建和执行他们的 `Nest` 项目。您可以通过这些脚本的选项(`—path`、`—webpack`、`—webpackPath`)或根据需要定制 `tsc` 或 `webpack` 编译器选项文件(例如，`tsconfig.json` )来完全定制这些脚本的行为。您还可以自由地运行一个完全定制的构建过程来编译 `TypeScript` (甚至可以直接使用 `ts-node` 执行 `TypeScript` )。

### 向后兼容性

因为 `Nest` 应用程序是纯 `TypeScript` 应用程序，所以以前版本的 `Nest` 构建/执行脚本将继续运行。您不需要升级它们。您可以选择在准备好时利用新的 `nest build` 和 `nest start` 命令，或者继续运行以前的或定制的脚本。

### 迁移

虽然不需要进行任何更改，但您可能希望使用新的 `CLI` 命令进行迁移，而不是使用诸如 `tsc-watch` 或 `ts-node` 之类的工具。在这种情况下，只需在全局和本地安装最新版本的 `@nestjs/cli`:

```bash
$ npm install -g @nestjs/cli
$ cd  /some/project/root/folder
$ npm install -D @nestjs/cli
```

然后，您可以用以下脚本替换 `package.json` 中定义的脚本：

```bash
"build": "nest build",
"start": "nest start",
"start:dev": "nest start --watch",
"start:debug": "nest start --debug --watch",
```

 ### 译者署名

| 用户名 | 头像 | 职能 | 签名 |
|---|---|---|---|
