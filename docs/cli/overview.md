### 概述

[Nest CLI](https://github.com/nestjs/nest-cli) 是一个命令行界面工具，可帮助您初始化、开发和维护 Nest 应用程序。它以多种方式提供支持，包括项目脚手架搭建、开发模式下的服务运行，以及为生产环境构建和打包应用程序。该工具体现了最佳实践的架构模式，以鼓励构建结构良好的应用。

#### 安装

**注意** ：本指南中我们将使用 [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) 安装包（包括 Nest CLI）。您也可以根据需要选择其他包管理器。使用 npm 时，有几种方式可以管理操作系统命令行如何解析 `nest` CLI 二进制文件的位置。这里我们介绍使用 `-g` 选项全局安装 `nest` 二进制文件的方法。这种方式提供了便利性，也是文档中默认采用的方式。请注意，全局安装**任何** `npm` 包都需要用户自行确保运行的是正确版本。这也意味着如果您有多个项目，每个项目都将运行**相同**版本的 CLI。一个合理的替代方案是使用内置于 `npm` cli 的 [npx](https://github.com/npm/cli/blob/latest/docs/lib/content/commands/npx.md) 程序（或其他包管理器的类似功能）来确保运行的是 Nest CLI 的**受控版本** 。建议您查阅 [npx 文档](https://github.com/npm/cli/blob/latest/docs/lib/content/commands/npx.md)或咨询 DevOps 支持人员获取更多信息。

使用 `npm install -g` 命令全局安装 CLI（有关全局安装的详细信息，请参阅上面的**注意事项** ）。

```bash
$ npm install -g @nestjs/cli
```

> **提示** 你也可以在不全局安装 CLI 的情况下使用此命令 `npx @nestjs/cli@latest`。

#### 基本工作流程

安装完成后，你可以通过 `nest` 可执行文件直接从操作系统命令行调用 CLI 命令。输入以下内容查看可用的 `nest` 命令：

```bash
$ nest --help
```

通过以下结构获取单个命令的帮助。将示例中的 `generate` 替换为任意命令（如 `new`、`add` 等），即可查看该命令的详细帮助信息：

```bash
$ nest generate --help
```

要创建、构建并运行一个全新的基础 Nest 项目（开发模式），请进入新项目的父目录，并执行以下命令：

```bash
$ nest new my-nest-project
$ cd my-nest-project
$ npm run start:dev
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000) 即可查看运行中的新应用。当您修改任何源文件时，应用程序会自动重新编译并加载。

> info **提示** 我们推荐使用 [SWC 构建器](/recipes/swc)以获得更快的构建速度（性能比默认 TypeScript 编译器快 10 倍）。

#### 项目结构

当你运行 `nest new` 命令时，Nest 会通过创建一个新文件夹并生成初始文件集来构建一个样板应用结构。你可以按照本文档的说明，继续在这个默认结构中工作并添加新组件。我们将 `nest new` 生成的项目结构称为**标准模式** 。Nest 还支持另一种用于管理多个项目和库的结构，称为 **monorepo 模式** 。

除了关于**构建**过程如何运作的一些特殊考虑（本质上，monorepo 模式简化了有时会因 monorepo 风格项目结构而产生的构建复杂性），以及内置的[库](/cli/libraries)支持外，Nest 的其他功能及本文档内容均同等适用于标准模式和 monorepo 模式的项目结构。事实上，你可以在未来任何时候轻松地从标准模式切换到 monorepo 模式，因此在学习 Nest 的过程中可以放心地推迟这个决定。

你可以使用任意一种模式来管理多个项目。以下是它们之间差异的简要总结：

| 功能                                         | 标准模式                               | Monorepo 模式                    |
| -------------------------------------------- | -------------------------------------- | -------------------------------- |
| 多项目                                       | 独立文件系统结构                       | 单一文件系统结构                 |
| node_modules 和 package.json                 | 独立实例                               | 跨 monorepo 共享                 |
| 默认编译器                                   | tsc                                    | webpack                          |
| 编译器设置                                   | 单独指定                               | 可按项目覆盖的 Monorepo 默认配置 |
| 配置文件如 eslint.config.mjs、.prettierrc 等 | 单独指定                               | 跨 monorepo 共享                 |
| nest build 和 nest start 命令                | 目标默认自动指向上下文中的（唯一）项目 | 目标默认为 monorepo 中的默认项目 |
| 库                                           | 手动管理，通常通过 npm 包管理          | 内置支持，包括路径管理和打包功能 |

阅读[工作区](/cli/monorepo)和[库](/cli/libraries)相关章节获取更详细信息，以帮助您决定哪种模式最适合您的需求。

#### 命令行界面(CLI)命令语法

所有 `nest` 命令都遵循相同格式：

```bash
nest commandOrAlias requiredArg [optionalArg] [options]
```

例如：

```bash
$ nest new my-nest-project --dry-run
```

这里，`new` 是 _commandOrAlias_。`new` 命令有一个别名 `n`。`my-nest-project` 是 _requiredArg_。如果命令行未提供 _requiredArg_，`nest` 会提示输入。此外，`--dry-run` 有一个等效的简写形式 `-d`。考虑到这一点，以下命令与上述命令等效：

```bash
$ nest n my-nest-project -d
```

大多数命令及部分选项都有别名。尝试运行 `nest new --help` 来查看这些选项和别名，并确认你对上述结构的理解。

#### 命令概览

对以下任意命令运行 `nest <command> --help` 可查看特定于该命令的选项。

查看[用法说明](/cli/usages)获取每个命令的详细描述。

| 命令     | 别名 | 描述                                                 |
| -------- | ---- | ---------------------------------------------------- |
| new      | n    | 搭建一个包含所有运行所需样板文件的标准模式应用程序。 |
| generate | g    | 根据原理图生成和/或修改文件。                        |
| build    |      | 将应用程序或工作区编译到输出文件夹中。               |
| start    |      | 编译并运行应用程序（或工作区中的默认项目）。         |
| add      |      | 导入已打包为 nest 库的库，并运行其安装原理图。       |
| info     | i    | 显示已安装的 Nest 包信息及其他有用的系统信息。       |

#### 要求

Nest CLI 需要 Node.js 二进制文件具备[国际化支持](https://nodejs.org/api/intl.html) （ICU），例如来自 [Node.js 项目页面](https://nodejs.org/en/download)的官方二进制文件。若遇到与 ICU 相关的错误，请检查您的二进制文件是否满足此要求。

```bash
node -p process.versions.icu
```

如果命令输出 `undefined`，则表示您的 Node.js 二进制文件不支持国际化。
