### Nest CLI 与脚本

本节提供关于 `nest` 命令如何与编译器和脚本交互的额外背景知识，以帮助 DevOps 人员管理开发环境。

Nest 应用是一个**标准**的 TypeScript 应用，需要先编译为 JavaScript 才能执行。完成编译步骤有多种方式，开发者/团队可以自由选择最适合他们的方式。考虑到这一点，Nest 提供了一套开箱即用的工具，旨在实现以下目标：

*   提供一个标准的构建/执行流程，通过命令行即可使用，并以合理的默认配置"开箱即用"。
*   确保构建/执行过程是**开放的** ，开发者可以直接访问底层工具，使用原生功能和选项进行自定义。
*   保持完全标准的 TypeScript/Node.js 框架特性，使得整个编译/部署/执行流程能够由开发团队选择的任何外部工具来管理。

这一目标通过结合 `nest` 命令、本地安装的 TypeScript 编译器以及 `package.json` 脚本实现。下文将描述这些技术如何协同工作，帮助您理解构建/执行过程中每个步骤的运行机制，以及在必要时如何自定义这些行为。

#### nest 二进制文件

`nest` 命令是一个操作系统级别的二进制文件（即可从操作系统命令行运行）。该命令实际上包含三个独立功能区域，如下所述。我们建议您通过项目脚手架自动提供的 `package.json` 脚本来运行构建（`nest build`）和执行（`nest start`）子命令（若希望通过克隆代码仓库而非运行 `nest new` 来开始，请参阅 [TypeScript 入门项目](https://github.com/nestjs/typescript-starter) ）。

#### 构建

`nest build` 是对标准 `tsc` 编译器或 `swc` 编译器（用于[标准项目](https://docs.nestjs.com/cli/overview#project-structure) ）的封装，对于 [monorepo 项目](https://docs.nestjs.com/cli/overview#project-structure)则使用 `ts-loader` 的 webpack 打包器。除了开箱即用地处理 `tsconfig-paths` 外，它不会添加任何其他编译特性或步骤。其存在的原因是大多数开发者（尤其是刚接触 Nest 时）不需要调整编译器选项（如 `tsconfig.json` 文件），这些配置有时可能较为复杂。

更多详情请参阅 [nest build](https://docs.nestjs.com/cli/usages#nest-build) 文档。

#### 执行

`nest start` 命令主要确保项目已完成构建（等同于 `nest build`），随后以便携、简易的方式调用 `node` 命令来运行编译后的应用。与构建过程类似，您可以根据需求自由定制此流程，既可以通过 `nest start` 命令及其选项实现，也可以完全替换该流程。整个过程属于标准的 TypeScript 应用程序构建与执行流水线，您可以自主管理这一流程。

更多详情请参阅 [nest start](https://docs.nestjs.com/cli/usages#nest-start) 文档。

#### 生成

`nest generate` 命令，顾名思义，用于生成新的 Nest 项目或其中的组件。

#### 包脚本

在操作系统命令行层级运行 `nest` 命令需要全局安装 `nest` 二进制文件。这是 npm 的标准特性，不受 Nest 直接控制。这导致的一个结果是，全局安装的 `nest` 二进制文件**不会**作为项目依赖项在 `package.json` 中管理。例如，两位开发者可能运行着不同版本的 `nest` 二进制文件。标准解决方案是使用包脚本，这样就能将构建和执行步骤中使用的工具视为开发依赖项。

当运行 `nest new` 或克隆 [typescript starter](https://github.com/nestjs/typescript-starter) 时，Nest 会在新项目的 `package.json` 脚本中填充诸如 `build` 和 `start` 等命令。同时会将底层编译工具（如 `typescript`）作为**开发依赖项**进行安装。

您可以通过如下命令运行构建和执行脚本：

```bash
$ npm run build
```

以及

```bash
$ npm run start
```

这些命令利用 npm 的脚本运行功能，通过**本地安装的** `nest` 二进制文件来执行 `nest build` 或 `nest start`。使用这些内置的包脚本，您可以完全掌控 Nest CLI 命令的依赖管理\*。这意味着，遵循这种**推荐**用法，可以确保组织内的所有成员都运行相同版本的命令。

\*这适用于 `build` 和 `start` 命令。`nest new` 和 `nest generate` 命令不属于构建/执行流程，因此它们在不同的上下文中运行，且不附带内置的 `package.json` 脚本。

对于大多数开发者/团队，建议使用包脚本来构建和运行他们的 Nest 项目。您可以通过脚本选项（`--path`、`--webpack`、`--webpackPath`）完全自定义这些脚本的行为，和/或根据需要自定义 `tsc` 或 webpack 编译器选项文件（例如 `tsconfig.json`）。您也可以自由运行完全自定义的构建流程来编译 TypeScript（甚至直接使用 `ts-node` 执行 TypeScript）。

#### 向后兼容性

由于 Nest 应用是纯 TypeScript 应用，旧版本的 Nest 构建/执行脚本将继续有效。您无需升级它们。您可以选择在准备好时利用新的 `nest build` 和 `nest start` 命令，或继续运行旧版或自定义脚本。

#### 迁移

虽然您无需进行任何更改，但可以考虑迁移使用新的 CLI 命令来替代诸如 `tsc-watch` 或 `ts-node` 等工具。这种情况下，只需全局和本地都安装最新版本的 `@nestjs/cli`：

```bash
$ npm install -g @nestjs/cli
$ cd  /some/project/root/folder
$ npm install -D @nestjs/cli
```

随后您可以将 `package.json` 中定义的 `scripts` 替换为以下内容：

```typescript
"build": "nest build",
"start": "nest start",
"start:dev": "nest start --watch",
"start:debug": "nest start --debug --watch",
```