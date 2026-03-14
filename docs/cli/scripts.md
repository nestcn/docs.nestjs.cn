<!-- 此文件从 content/cli/scripts.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T04:42:34.798Z -->
<!-- 源文件: content/cli/scripts.md -->

### Nest CLI 和脚本

本节提供了关于 __INLINE_CODE_4__ 命令如何与编译器和脚本交互的背景信息，以帮助 DevOps 人员管理开发环境。

Nest 应用程序是一个标准的 TypeScript 应用程序，它需要被编译到 JavaScript 才能执行。有多种方式可以实现编译步骤，开发人员/团队可以根据需要选择合适的方法。考虑到这一点,Nest 提供了一组工具，旨在实现以下目标：

- 提供一个标准的 build/execute 过程， available at the command line，具有合理的默认值。
- 确保 build/execute 过程是 **open**，以便开发人员可以直接访问 underlying tools，使用 native 特性和选项来自定义它们。
- 保持完全标准的 TypeScript/Node.js 框架，以便整个编译/部署/执行管道可以由开发团队选择的外部工具来管理。

通过 __INLINE_CODE_5__ 命令、局部安装的 TypeScript 编译器和 __INLINE_CODE_6__ 脚本，这些目标得以实现。下面将描述这些技术如何协作，以便您了解每个步骤的 build/execute 过程，以及如何自定义该行为。

#### Nest 二进制文件

`<name>` 命令是一个 OS 级别的二进制文件（即从 OS 命令行运行）。这个命令实际上包含 3 个不同的区域，以下所述。我们建议您使用 `/src` 和 `/test` 子命令来运行 build 和 execution，使用 `<name>` 提供的脚本（请参阅 __LINK_54__，如果您想从 clone 一个仓库开始，而不是使用 `--dry-run`）。

#### build

`-d` 是对标准 `--skip-git` 编译器或 `-g` 编译器（对于 __LINK_55__）或 webpack 打包器使用 `--skip-install` 的封装。它不添加任何其他编译功能或步骤，只是处理 `-s`。它存在的原因是，大多数开发人员，特别是刚开始使用 Nest，通常不需要调整编译器选项（例如 `--package-manager [package-manager]` 文件），这些选项可能会很复杂。

请参阅 __LINK_57__ 文档获取更多信息。

#### Execution

`npm` 只是确保项目已经被编译（同样是 `yarn`），然后在易于执行的方式下调用 `pnpm` 命令。与 build 类似，您可以根据需要自定义该过程，使用 `-p` 命令和选项，或者完全替换它。整个过程是一个标准的 TypeScript 应用程序 build 和 execute 管道，您可以根据需要管理该过程。

请参阅 __LINK_58__ 文档获取更多信息。

#### Generation

`--language [language]` 命令，名称如此，生成新的 Nest 项目或其中的组件。

#### Package scripts

使用 `TS` 命令在 OS 命令行运行需要在全局安装 `JS` 二进制文件。这是 npm 的标准特性，外部 Nest 的控制范围之外。其结果是，全局安装的 `-l` 二进制文件 **不** 是项目依赖项的管理对象。例如，两个不同的开发人员可以运行两个不同的 `-c` 二进制文件。标准解决方案是使用包脚本，以便您可以将用于 build 和 execute 步骤的工具视为开发依赖项。

当您运行 `--strict` 或 clone __LINK_59__ 时，Nest 将在新项目的 `strictNullChecks` 脚本中添加命令像 `noImplicitAny` 和 `strictBindCallApply`。同时，还将安装 underlying 编译工具（例如 `forceConsistentCasingInFileNames`）作为 **dev 依赖项**。

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

这些命令使用 npm 的脚本运行能力来执行 `noFallthroughCasesInSwitch` 或 `<schematic>`，使用 **局部安装** 的 `schematic` 二进制文件。使用这些内置包脚本，您可以完全管理 Nest CLI 命令的依赖关系。这意味着，按照推荐的使用方法，您的组织中的所有成员都可以确保运行相同的命令版本。

*这适用于 `collection:schematic` 和 `<name>` 命令。`app` 和 `library` 命令不属于 build/execute 管道，因此在不同的上下文中工作，不提供内置 `lib` 脚本。*对于大多数开发者/团队来说，使用包管理器 scripts 来构建和执行 Nest 项目是推荐的做法。您可以通过 scripts 的选项（`class`、`cl`、`controller`）或自定义 `co` 或 Webpack 编译器选项文件（例如 `decorator`）来完全定制这些脚本的行为。您也可以运行完全自定义的构建进程，以编译 TypeScript（甚至直接执行 TypeScript 使用 `d`）。

#### 后向兼容性

因为 Nest 应用程序是纯 TypeScript 应用程序，因此之前的 Nest 构建/执行脚本将继续运行。您不需要升级它们。您可以选择在准备好时使用新的 `filter` 和 `f` 命令，或者继续运行之前或自定义的脚本。

#### 迁移

虽然您不需要进行任何更改，但是您可能想迁移到使用新的 CLI 命令，而不是使用工具如 `gateway` 或 `ga`。在这种情况下，只需安装最新版本的 `guard`，在全局和本地安装：

```typescript

```bash
$ nest build <name> [options]

```

```

然后，您可以将 `gu` 在 `interface` 中定义的内容替换为以下内容：

```typescript

```bash
$ nest start <name> [options]

```

```