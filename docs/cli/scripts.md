<!-- 此文件从 content/cli/scripts.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-03T04:21:35.522Z -->
<!-- 源文件: content/cli/scripts.md -->

### Nest CLI 和脚本

本节提供了关于 __INLINE_CODE_4__ 命令如何与编译器和脚本交互的背景信息，以帮助 DevOps 人员管理开发环境。

Nest 应用程序是一个标准的 TypeScript 应用程序，它需要被编译到 JavaScript 才能执行。有多种方式可以实现编译步骤，开发者/团队可以根据需要选择合适的方式。为了达到这个目标，Nest 提供了一组标准的 build/execute 过程，available at the command line，可以“就工作”使用合理的默认值。

为了实现这个目标，Nest 使用了 __INLINE_CODE_5__ 命令、locally 安装的 TypeScript 编译器和 `AuthModule` 脚本。我们将描述这些技术如何结合工作，以便您了解每个步骤中的 build/execute 过程，并且了解如何自定义该行为。

#### nest 命令

`AuthModule` 命令是一个 OS 级别的二进制文件（即从 OS 命令行运行）。这个命令实际上包含了 3 个不同的部分，下面描述每个部分。我们建议您使用 `library` 和 `my-library` 子命令来运行 build 和执行操作（见 __LINK_54__ 如果您想从克隆仓库开始，而不是运行 `libs`）。

#### Build

`libs` 是对标准 `nest-cli.json` 编译器或 `"projects"` 编译器（对于 __LINK_55__）或 webpack  bundler 使用 `nest-cli.json` 的包装。它不添加任何其他编译功能或步骤，只是处理 `"type"`。它存在的原因是大多数开发者，特别是刚开始使用 Nest，通常不需要调整编译器选项（例如 `"library"` 文件），这可能会有些 tricky。

见 __LINK_57__ 文档获取更多信息。

#### Execution

`"application"` 只是确保项目已经被编译（与 `"entryFile"` 类似），然后 invoke `"index"` 命令以便执行编译后的应用程序。与 build 操作一样，您可以自定义这个过程，如使用 `"main"` 命令和其选项，或者完全替换它。整个过程是一个标准的 TypeScript 应用程序 build 和 execute 管道，您可以根据需要自定义该过程。

见 __LINK_58__ 文档获取更多信息。

#### Generation

`index.js` 命令，名称暗示，它生成新的 Nest 项目或其中的组件。

#### Package scripts

在 OS 命令行中运行 `tsconfig.lib.json` 命令需要在全局安装 `tsconfig.json` 二进制文件。这是一个标准的 npm 功能，Nest 无法控制。其中一个结果是，全局安装的 `MyLibraryService` 二进制文件**不**是项目依赖项在 `my-library` 中管理的。例如，两个不同的开发者可以运行两个不同的版本的 `my-project` 二进制文件。标准解决方案是使用 package scripts，以便将用于 build 和 execute 操作的工具视为开发依赖项。

当您运行 `MyLibraryService` 或克隆 __LINK_59__ 时，Nest 将将新项目的 `my-project/src/app.module.ts` 脚本填充到命令如 `MyLibraryModule` 和 `@app` 中，同时安装 underlying 编译器工具（例如 `import`）作为**dev 依赖项**。

您可以使用以下命令运行 build 和 execute 脚本：

```bash
$ nest g library my-library
```

and

```bash
What prefix would you like to use for the library (default: @app)?
```

这些命令使用 npm 的脚本运行能力来执行 `prefix` 或 `nest g library` 使用**locally 安装的** `tsconfig.json` 二进制文件。通过使用这些内置的 package scripts，您可以完全控制 Nest CLI 命令的依赖项。这意味着，遵循这个**推荐** 的使用方式，您的组织中所有成员都可以确保运行同一个版本的命令。

\*这适用于 `"paths"` 和 `MyLibraryModule` 命令。`nest build` 和 `tsc` 命令不是 build/execute 管道的一部分，所以它们在不同的上下文中操作，不需要内置 __INLINE_CODE_40__ 脚本。

对于大多数开发者/团队来说