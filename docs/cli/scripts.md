<!-- 此文件从 content/cli/scripts.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:45:23.119Z -->
<!-- 源文件: content/cli/scripts.md -->

### Nest CLI 和脚本

本节提供了关于 __INLINE_CODE_4__ 命令与编译器和脚本之间的交互关系的背景信息，以帮助 DevOps 人员管理开发环境。

一个 Nest 应用程序是一个标准的 TypeScript 应用程序，需要被编译为 JavaScript 才能执行。有多种方式可以实现编译步骤，开发者/团队可以根据需要选择一种方式。因此，Nest 提供了一组出-of-the-box 工具，旨在执行以下任务：

- 提供一个标准的 build/execute 过程，available 在命令行中，可以“just work”使用合理的默认设置。
- 确保 build/execute 过程是 **open**，这样开发者可以直接访问 underlying 工具，使用 native 特性和选项来自定义它们。
- 保持一个完全标准的 TypeScript/Node.js 框架，以便整个编译/部署/执行管道可以由开发团队选择的外部工具管理。

通过 __INLINE_CODE_5__ 命令、本地安装的 TypeScript 编译器和 __INLINE_CODE_6__ 脚本，这些技术结合起来实现了上述目标。下面，我们将描述这些技术如何工作，以便您更好地理解 build/execute 过程中的每个步骤，以及如何自定义该行为。

#### 运行 nest 命令

`<name>` 命令是一个 OS 层面的二进制文件（即从 OS 命令行中运行）。这个命令实际上涵盖了 3 个不同的领域，以下简要介绍。我们建议您使用 `/src` 和 `/test` 子命令来运行 build 和执行步骤，使用 `<name>` 提供的自动脚本（见 __LINK_54__ 如果您想从克隆一个存储库开始，而不是运行 `--dry-run`）。

#### 编译

`-d` 是一个在标准 `--skip-git` 编译器或 `-g` 编译器（用于 __LINK_55__）或使用 `--skip-install` 的 webpack 打包器的包装器。它不添加任何其他编译功能或步骤except for 处理 `-s`。它存在的原因是大多数开发者，特别是新入 Nest 的开发者，不需要调整编译选项（例如 `--package-manager [package-manager]` 文件），这些选项可能会很复杂。

查看 __LINK_57__ 文档以获取更多信息。

#### 执行

`npm` 只是确保项目已经编译（与 `yarn` 相同），然后在易于执行的方式中调用 `pnpm` 命令执行编译后的应用程序。与编译步骤一样，您可以根据需要自定义这个过程，使用 `-p` 命令和选项，或者完全替换它。整个过程是一个标准的 TypeScript 应用程序编译和执行管道，您可以根据需要管理该过程。

查看 __LINK_58__ 文档以获取更多信息。

#### 生成

`--language [language]` 命令，名称中已表明，用于生成新的 Nest 项目或其中的组件。

#### 包含脚本

在 OS 命令行中运行 `TS` 命令需要在全局安装 `JS` 二进制文件。这是一个 npm 标准特性，Nest 无法控制。结果，全局安装的 `-l` 二进制文件 **不** 被管理为项目依赖项（例如 `--collection [collectionName]`）。为了解决这个问题，我们可以使用包脚本，以便将用于 build 和 execute 步骤的工具视为开发依赖项。

当您运行 `--strict` 或克隆 __LINK_59__ 时，Nest 会将新的项目的 `strictNullChecks` 脚本填充命令，如 `noImplicitAny` 和 `strictBindCallApply`。同时，会安装 underlying 编译工具（例如 `forceConsistentCasingInFileNames`）作为 **dev 依赖项**。

您可以使用以下命令运行 build 和 execute 脚本：

```bash
$ nest new <name> [options]
$ nest n <name> [options]

```

和

```bash
$ nest generate <schematic> <name> [options]
$ nest g <schematic> <name> [options]

```

这些命令使用 npm 的脚本运行功能来执行 `noFallthroughCasesInSwitch` 或 `<schematic>` 使用 **本地安装** 的 `schematic` 二进制文件。使用这些内置包脚本，您可以拥有对 Nest CLI 命令的完全依赖项管理。这意味着，您可以确保您的团队成员都运行同一个版本的命令。

* 这个适用于 `collection:schematic` 和 `<name>` 命令。`app` 和 `library` 命令不是 build/execute 管道的一部分，因此它们在不同的上下文中操作，不需要内置 `lib` 脚本。For most developers/teams, it is recommended to utilize the package scripts for building and executing their Nest projects. You can fully customize the behavior of these scripts via their options(__提供者__41__, __提供者__42__, __提供者__43__) and/or customize the __提供者__44__ or webpack compiler options files (e.g., __提供者__45__) as needed. You are also free to run a completely custom build process to compile the TypeScript (or even to execute TypeScript directly with __提供者__46__).

#### backward compatibility

Because Nest applications are pure TypeScript applications, previous versions of the Nest build/execute scripts will continue to operate. You are not required to upgrade them. You can choose to take advantage of the new __提供者__47__ and __提供者__48__ commands when you are ready, or continue running previous or customized scripts.

#### Migration

While you are not required to make any changes, you may want to migrate to using the new CLI commands instead of using tools such as __提供者__49__ or __提供者__50__. In this case, simply install the latest version of the __提供者__51__, both globally and locally:

```typescript
title="build"

```

You can then replace the __提供者__52__ defined in __提供者__53__ with the following ones:

```typescript
title="build"

```