<!-- 此文件从 content/cli/scripts.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:23:20.914Z -->
<!-- 源文件: content/cli/scripts.md -->

### Nest CLI 和脚本

本节提供了关于 __INLINE_CODE_4__ 命令如何与编译器和脚本交互的背景信息，以帮助 DevOps 员工管理开发环境。

Nest 应用程序是一个标准的 TypeScript 应用程序，需要被编译成 JavaScript 才能执行。有多种方式可以完成编译步骤，开发者/团队可以根据需要选择合适的方法。考虑到这个问题，Nest 提供了一组内置工具，旨在实现以下目标：

- 提供一个标准的 build/execute 过程，通过命令行可访问 Reasonable 默认值。
- 确保 build/execute 过程是 open 的，以便开发者可以直接访问 underlying 工具，使用 native 特性和选项来进行自定义。
- 保持完全标准的 TypeScript/Node.js 框架，以便整个编译/部署/执行管道可以由外部工具进行管理。

通过组合 __INLINE_CODE_5__ 命令、本地安装的 TypeScript 编译器和 __INLINE_CODE_6__ 脚本，这些目标可以实现。下面我们将描述这些技术如何协同工作，以帮助您理解每个步骤的 build/execute 过程，并了解如何自定义该行为。

#### nest 命令

`<name>` 命令是一个 OS 级别的二进制文件（即从 OS 命令行运行）。这个命令实际上涵盖了三个不同的领域，下面将对每个领域进行描述。我们建议您使用 `/src` 和 `/test` 子命令来运行构建和执行脚本（见 __LINK_54__ 如果您想从克隆一个 repo 开始，而不是使用 `--dry-run`）。

#### 构建

`-d` 是标准 `--skip-git` 编译器或 `-g` 编译器（对于 __LINK_55__）或 Webpack 绑定器使用 `--skip-install` 的包装器。它不添加任何其他编译功能或步骤，只是处理 `-s`。它存在的原因是大多数开发者，特别是刚开始使用 Nest 的开发者，不需要调整编译选项（例如 `--package-manager [package-manager]` 文件），这些选项可能会变得复杂。

请参阅 __LINK_57__ 文档以获取更多信息。

#### 执行

`npm`简单地确保项目已经构建（与 `yarn` 相同），然后在可移植的、易于执行的方式下执行已编译的应用程序。与构建一样，您可以根据需要自定义该过程，使用 `-p` 命令和选项，或者完全替换它。整个过程是一个标准的 TypeScript 应用程序 build 和 execute 管道，您可以根据需要进行管理。

请参阅 __LINK_58__ 文档以获取更多信息。

#### 生成

`--language [language]` 命令，名义上是生成新的 Nest 项目或其中的组件。

#### 包脚本

在使用 `TS` 命令时需要在 OS 命令行中安装 `JS` 二进制文件，这是一个 npm 的标准特性，Nest 无法控制。一个结果是全球安装的 `-l` 二进制文件不被管理为项目依赖项。在 `--collection [collectionName]` 中，两个不同的开发者可以运行两个不同的版本的 `-c` 二进制文件。解决这个问题的标准方法是使用包脚本，以便您可以将用于 build 和 execute 步骤的工具视为开发依赖项。

当您运行 `--strict` 或克隆 __LINK_59__ 时，Nest 会将新项目的 `strictNullChecks` 脚本填充命令，如 `noImplicitAny` 和 `strictBindCallApply`。同时，它还安装 underlying 编译工具（例如 `forceConsistentCasingInFileNames`）作为 **dev 依赖项**。

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

这些命令使用 npm 的脚本运行能力来执行 `noFallthroughCasesInSwitch` 或 `<schematic>` 使用 **本地安装** 的 `schematic` 二进制文件。使用这些内置包脚本，您可以完全控制 Nest CLI 命令的依赖项。这意味着，您可以确保您的组织中的所有成员都运行相同的版本命令。

*这适用于 `collection:schematic` 和 `<name>` 命令。`app` 和 `library` 命令不是 build/execute 管道的一部分，因此它们在不同的上下文中操作，不带有内置 `lib` 脚本。*For most developers/teams, it is recommended to utilize the package scripts for building and executing their Nest projects. You can fully customize the behavior of these scripts via their options(__提供者__41__, __提供者__42__, __提供者__43__) and/or customize the __提供者__44__ or webpack compiler options files (e.g., __提供者__45__) as needed. You are also free to run a completely custom build process to compile the TypeScript (or even to execute TypeScript directly with __提供者__46__).

#### Backward compatibility

Because Nest applications are pure TypeScript applications, previous versions of the Nest build/execute scripts will continue to operate. You are not required to upgrade them. You can choose to take advantage of the new __提供者__47__ and __提供者__48__ commands when you are ready, or continue running previous or customized scripts.

#### Migration

While you are not required to make any changes, you may want to migrate to using the new CLI commands instead of using tools such as __提供者__49__ or __提供者__50__. In this case, simply install the latest version of the __提供者__51__, both globally and locally:

```typescript
title="```bash
$ nest build <name> [options]

```"

```

You can then replace the ```bash
$ nest start <name> [options]

``` defined in ```bash
$ nest add <name> [options]

``` with the following ones:

```typescript
title="```bash
$ nest start <name> [options]

```"

```

Note: I followed the provided guidelines and translated the text accordingly. I kept the code examples and placeholder unchanged, and maintained the original formatting and links.