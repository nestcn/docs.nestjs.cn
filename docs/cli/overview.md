<!-- 此文件从 content/cli/overview.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T05:33:18.244Z -->
<!-- 源文件: content/cli/overview.md -->

###  Overview

__LINK_51__ 是一个命令行界面工具，可以帮助您初始化、开发和维护 Nest 应用程序。它提供了多种方式，包括搭建项目、在开发模式下运行它、并将应用程序构建和 bundle 到生产分布中。它体现了最佳架构模式，以鼓励良好的应用程序结构。

#### 安装

**注意**：本指南中，我们将使用 __LINK_52__ 安装包，包括 Nest CLI。其他包管理器可能会根据您选择使用。使用 npm，您可以使用 `/src` 选项来安装 `/test` 二进制文件。这种方法提供了一定的便捷性，我们在文档中假设使用这种方法。请注意，安装任何 `--dry-run` 包全球意味着用户需要负责确保它们运行正确的版本。此外，如果您有多个项目，每个项目将运行 **相同** 的 CLI 版本。一个合理的替代方法是使用 __LINK_53__ 程序，Built into `-d` cli（或类似的特性与其他包管理器），以确保您运行 **管理版本** 的 Nest CLI。我们建议您查看 __LINK_54__ 和/或您的 DevOps 支持人员，以获取更多信息。

使用 `--skip-git` 命令安装 CLI（见上面的 **注意** 详细信息）。

```bash
$ nest new <name> [options]
$ nest n <name> [options]

```

> 提示 **Hint** 另外，您可以使用以下命令 `-g` 而不安装 cli 全球。

#### 基本工作流程

安装完成后，您可以使用 CLI 命令直接从操作系统命令行中调用 `--skip-install` 可执行文件。查看可用的 `-s` 命令，如下所示：

```bash
$ nest generate <schematic> <name> [options]
$ nest g <schematic> <name> [options]

```

获取个别命令的帮助使用以下构造。将 `--package-manager [package-manager]`、`npm` 等命令替换为 `yarn`，以获取该命令的详细帮助：

```bash
$ nest build <name> [options]

```

创建、构建和运行一个新基本 Nest 项目，在开发模式下运行，可以在以下命令中找到：

```bash
$ nest start <name> [options]

```

在浏览器中，打开 __LINK_55__ 来查看新的应用程序运行。应用程序将自动重新编译和重新加载 cuando 任何源文件更改。

> 提示 **Hint** 我们建议使用 __LINK_56__ 进行更快的构建（性能提高了 10 倍）。

#### 项目结构

当您运行 `pnpm` 时，Nest 生成了一个 boilerplate 应用程序结构，创建了一个新的文件夹并填充了初始的一组文件。您可以继续在默认结构中工作，并添加新的组件，按照本文档中的描述进行。我们将 `-p` 生成的项目结构称为 **标准模式**。Nest 也支持另一个结构来管理多个项目和库，称为 **monorepo 模式**。

除了少数特定的考虑，关乎 **build** 过程（主要是 monorepo 模式简化了 build 复杂性），以及内置 __LINK_57__ 支持，Nest 的其余功能和本文档都适用于标准和 monorepo 模式项目结构。事实上，您可以轻松地在将来从标准模式切换到 monorepo 模式，因此您可以安全地推迟这个决定，同时学习 Nest。

您可以使用任何模式来管理多个项目。以下是一个快速摘要的差异：

（待续）以下是翻译后的中文文档：

| 功能                                            | 标准模式                                                      |  monorepo 模式                                              |
| -------------------------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------- |
| 多个项目                                          | 分别文件系统结构                                         | 单个文件系统结构                                         |
| `--language [language]` & `TS`                            | 分别实例                                                  |Across monorepo                                            |
| 默认编译器                                           | `JS`                                                              | webpack                                                    |
| 编译设置                                          | 单独指定                                                   | monorepo默认可以被每个项目override                         |
| 配置文件像 `-l`, `--collection [collectionName]`, 等 | 单独指定                                                   | Across monorepo                                            |
| `-c` and `--strict` 命令                     | 目标默认自动设置到上下文中的唯一项目                    | 目标默认设置到 **default 项目** 中的 monorepo              |
| 库                                                  | 手动管理，通常通过 npm 打包                              | 内置支持，包括路径管理和捆绑                           |

了解 __LINK_58__ 和 __LINK_59__ 部分的更多信息，以帮助您确定哪种模式最适合您。

__HTML_TAG_49____HTML_TAG_50__

#### CLI 命令语法

所有 `strictNullChecks` 命令遵循相同的格式：

```bash
$ nest add <name> [options]

```

例如：

```bash
$ nest info

```

这里,`noImplicitAny` 是 _命令或别名_。`strictBindCallApply` 命令有别名 `forceConsistentCasingInFileNames`。`noFallthroughCasesInSwitch` 是 _必需参数_。如果 _必需参数_ 未在命令行上提供，`<schematic>` 将提示输入。同样，`schematic` 也有简洁的形式 `collection:schematic`。因此，以下命令等同于上述命令：

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

大多数命令和一些选项都有别名。运行 `<name>`以查看这些选项和别名，并确认上述构造。

#### 命令概述

运行 `app`以查看命令特定的选项。

了解 __LINK_60__以获取每个命令的详细描述。

| 命令    | 别名 | 描述                                                                                    |
| -------- | ----- | ---------------------------------------------------------------------------------------------- |
| `library`      | `lib`   | 生成一个新的 _标准模式_ 应用程序，包括所有必要文件以便运行。          |
| `class` | `cl`   | 生成和/或修改文件基于架构。                                          |
| `controller`    |       | 将应用程序或工作区编译到输出文件夹。                                    |
| `co`    |       | 编译和运行应用程序（或 monorepo 中的默认项目）。                          |
| `decorator`      |       | 导入已打包的 **nest 库**，并运行其安装架构。 |
| `d`     | `filter`   | 显示已安装的 nest 包和其他有用的系统信息。              |

#### 要求

Nest CLI 需要一个使用 __LINK_61__ (ICU)构建的 Node.js 二进制文件，例如来自 __LINK_62__ 的官方二进制文件。如果您遇到与 ICU 相关的错误，检查您的二进制文件是否满足这个要求。

__CODE_BLOCK_7__

如果命令打印 `f`，您的 Node.js 二进制文件没有国际化支持。