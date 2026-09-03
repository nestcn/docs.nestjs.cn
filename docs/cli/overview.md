<!-- 此文件从 content/cli/overview.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-09-03T10:50:06.170Z -->
<!-- 源文件: content/cli/overview.md -->

### 概述

[Nest CLI](https://github.com/nestjs/nest-cli) 是一个命令行界面工具，可帮助您初始化、开发和维护 Nest 应用程序。它以多种方式提供帮助，包括搭建项目、在开发模式下提供服务，以及构建和打包应用程序以进行生产分发。它体现了最佳实践架构模式，以鼓励构建结构良好的应用程序。

#### 安装

**注意**：在本指南中，我们描述使用 [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) 来安装包，包括 Nest CLI。您也可以自行决定使用其他包管理器。使用 npm 时，您有多个选项可用于管理操作系统命令行如何解析 `nest` CLI 二进制文件的位置。在这里，我们描述使用 `-g` 选项全局安装 `nest` 二进制文件。这提供了一定程度的便利，也是我们在整个文档中假设的方法。请注意，全局安装**任何** `npm` 包都会将确保它们运行正确版本的责任留给用户。这也意味着，如果您有多个不同的项目，每个项目都将运行**相同**版本的 CLI。一个合理的替代方案是使用内置在 `npm` CLI 中的 [npx](https://github.com/npm/cli/blob/latest/docs/lib/content/commands/npx.md) 程序（或其他包管理器中的类似功能），以确保您运行的是**受管版本**的 Nest CLI。我们建议您查阅 [npx documentation](https://github.com/npm/cli/blob/latest/docs/lib/content/commands/npx.md) 和/或咨询您的 DevOps 支持人员以获取更多信息。

使用 `npm install -g` 命令全局安装 CLI（有关全局安装的详细信息，请参阅上面的**注意**）。

```bash
$ npm install -g @nestjs/cli

```

> info **提示** 或者，您可以使用此命令 `npx @nestjs/cli@latest` 而无需全局安装 CLI。

#### 基本工作流

安装后，您可以通过 `nest` 可执行文件直接从操作系统命令行调用 CLI 命令。输入以下内容查看可用的 `nest` 命令：

```bash
$ nest --help

```

使用以下结构获取单个命令的帮助。在下面的示例中，将您看到的 `generate` 替换为任何命令，如 `new`、`add` 等，以获取该命令的详细帮助：

```bash
$ nest generate --help

```

要创建、构建并以开发模式运行一个新的基本 Nest 项目，请转到应作为新项目父级的文件夹，然后运行以下命令：

```bash
$ nest new my-nest-project
$ cd my-nest-project
$ npm run start:dev

```

`new` 命令会提示您选择模块格式。默认情况下，ESM 项目会使用 Vitest 和 oxlint 生成。

在浏览器中打开 [http://localhost:3000](http://localhost:3000) 以查看正在运行的新应用程序。当您更改任何源文件时，应用程序将自动重新编译并重新加载。

> info **提示** 我们建议使用 [SWC builder](/recipes/swc) 以获得更快的构建（性能比默认的 TypeScript 编译器高 10 倍）。

#### 项目结构

当您运行 `nest new` 时，Nest 会通过创建新文件夹并填充一组初始文件来生成样板应用程序结构。您可以继续在此默认结构中工作，添加新组件，如本文档所述。我们将 `nest new` 生成的项目结构称为**标准模式**。Nest 还支持另一种用于管理多个项目和库的结构，称为 **monorepo 模式**。

除了关于**构建**过程如何工作的一些具体考虑（本质上，monorepo 模式简化了有时可能因 monorepo 风格项目结构而产生的构建复杂性），以及内置的 [library](/cli/libraries) 支持之外，Nest 的其余功能以及本文档同样适用于标准模式和 monorepo 模式的项目结构。事实上，您可以在将来随时轻松地从标准模式切换到 monorepo 模式，因此在您仍在学习 Nest 时，可以安全地推迟此决定。

您可以使用任一模式来管理多个项目。以下是差异的快速总结：

| 功能 | 标准模式 | Monorepo 模式 |
| --- | --- | --- |
| 多个项目 | 独立的文件系统结构 | 单一文件系统结构 |
| `node_modules` 和 `package.json` | 独立实例 | 在 monorepo 中共享 |
| 默认编译器 | `tsc` | rspack |
| 编译器设置 | 单独指定 | monorepo 默认值，可按项目覆盖 |
| Lint 和格式化配置文件 | 单独指定 | 在 monorepo 中共享 |
| `nest build` 和 `nest start` 命令 | 目标自动默认为上下文中的（唯一）项目 | 目标默认为 monorepo 中的**默认项目** |
| 库 | 手动管理，通常通过 npm 打包 | 内置支持，包括路径管理和打包 |

阅读关于 [Workspaces](/cli/workspaces) 和 [Libraries](/cli/libraries) 的部分，以获取更详细的信息，帮助您决定哪种模式最适合您。

<app-banner-courses></app-banner-courses>

#### CLI 命令语法

所有 `nest` 命令都遵循相同的格式：

```bash
nest commandOrAlias requiredArg [optionalArg] [options]

```

例如：

```bash
$ nest new my-nest-project --dry-run

```

其中，`new` 是 _commandOrAlias_（命令或别名）。`new` 命令有一个别名 `n`。`my-nest-project` 是 _requiredArg_（必需参数）。如果在命令行中未提供 _requiredArg_，`nest` 将提示您输入。此外，`--dry-run` 有一个等效的简写形式 `-d`。考虑到这一点，以下命令与上述命令等效：

```bash
$ nest n my-nest-project -d

```

大多数命令和某些选项都有别名。尝试运行 `nest new --help` 来查看这些选项和别名，并确认您对上述结构的理解。

#### 命令概览

对以下任何命令运行 `nest <command> --help` 以查看特定于命令的选项。

查看 [usage](/cli/usages) 以获取每个命令的详细描述。

| 命令    | 别名 | 描述                                                                                    |
| ---------- | ----- | ---------------------------------------------------------------------------------------------- |
| `new`      | `n`   | 创建一个新的 _标准模式_ 应用程序，包含运行所需的所有样板文件。          |
| `generate` | `g`   | 根据原理图生成和/或修改文件。                                          |
| `build`    |       | 将应用程序或工作空间编译到输出文件夹中。                                    |
| `start`    |       | 编译并运行应用程序（或工作空间中的默认项目）。                          |
| `add`      |       | 导入已打包为 **nest library** 的库，并运行其安装原理图。 |
| `upgrade`  | `update` | 将现有项目升级到最新的 NestJS 主版本。                               |
| `deploy`   |       | 将您的应用程序部署到云端，由 [Mau](https://mau.nestjs.com/) 提供支持。              |
| `info`     | `i`   | 显示已安装的 nest 包和其他有用的系统信息。              |

#### 环境要求

CLI 二进制文件本身运行在 **Node.js v20.11 或更高版本** 上，但 `nest new`、`nest generate` 和 `nest upgrade`（`@nestjs/schematics`）背后的原理图需要 **Node.js v22.22.3+、v24.15+ 或 v26+**。运行 Nest 应用程序所需的版本较低 - 请参阅 [migration guide](/migration-guide#nodejs-requirements) 了解完整说明 - 因此，如果您在开发的同一台机器上生成代码，请使用最新的活跃 LTS 版本。

Nest CLI 还要求 Node.js 二进制文件使用 [internationalization support](https://nodejs.org/api/intl.html)（ICU）构建，例如来自 [Node.js project page](https://nodejs.org/en/download) 的官方二进制文件。如果您遇到与 ICU 相关的错误，请检查您的二进制文件是否满足此要求。

```bash
node -p process.versions.icu

```

如果命令输出 `undefined`，则您的 Node.js 二进制文件不支持国际化。