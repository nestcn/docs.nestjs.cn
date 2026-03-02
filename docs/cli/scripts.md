<!-- 此文件从 content/cli/scripts.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-02T04:20:32.007Z -->
<!-- 源文件: content/cli/scripts.md -->

### Nest CLI 和脚本

本节提供了关于 __INLINE_CODE_4__ 命令如何与编译器和脚本交互的背景信息，以帮助 DevOps 人员管理开发环境。

Nest 应用程序是一个标准的 TypeScript 应用程序，它需要被编译到 JavaScript 才能执行。有多种方式可以实现编译步骤，开发者/团队可以根据需要选择合适的方式。鉴于此，Nest 提供了一组标准的 build/execute 过程，available at the command line，可以“just work”	with reasonable defaults。

#### Nest 二进制文件

__INLINE_CODE_5__ 命令是一个 OS 级别的二进制文件（即从 OS 命令行运行）。这个命令实际上包含了三个不同的部分，以下描述。我们建议您使用 `AuthModule` 脚本来运行 build 和 execution 子命令（见 __LINK_54__ 如果您想从克隆一个repo开始）。

#### 编译

`AuthModule` 是一个 wrapper 在标准的 `library` 编译器或 `my-library` 编译器（对于 __LINK_55__）或使用 `libs` (对于 __LINK_56__）的 webpack 嵌套编译器上。它不添加任何其他编译功能或步骤except for 处理 `libs` out of the box。原因是大多数开发人员，特别是刚开始使用 Nest 的开发人员，不需要调整编译选项（例如 `libs` 文件），这些选项有时可以麻烦。

查看 __LINK_57__ 文档了解更多信息。

#### 执行

`nest-cli.json` 只是确保项目已经编译（与 `"projects"`相同），然后 invoke `nest-cli.json` 命令以便执行编译后的应用程序。与编译一样，您可以根据需要自定义这个过程，或者完全替换它。整个过程是一个标准的 TypeScript 应用程序编译和执行管道，您可以自由地管理这个过程。

查看 __LINK_58__ 文档了解更多信息。

#### 生成

`"type"` 命令，正如名称所暗示的，生成新的 Nest 项目或其中的组件。

#### package 脚本

在 OS 命令级别运行 `"library"` 命令需要安装 `"application"` 二进制文件到全局。这个是 npm 的标准特性，Nest 没有直接控制。一个结果是，全球安装的 `"entryFile"` 二进制文件**不是**作为项目依赖项管理在 `"index"` 中。例如，两个不同的开发人员可以运行两个不同的版本的 `"main"` 二进制文件。解决这个问题的标准方法是使用 package scripts，以便您可以将用于 build 和 execute 步骤的工具视为开发依赖项。

当您运行 `index.js` 或克隆 __LINK_59__ 时，Nest 会将新项目的 `tsconfig.lib.json` 脚本填充命令，如 `tsconfig.json` 和 `MyLibraryService`。同时，安装 underlying 编译工具（例如 `my-library`）作为 **dev dependencies**。

您可以使用以下命令运行 build 和 execute 脚本：

```bash
$ nest g library my-library
```

和

```bash
What prefix would you like to use for the library (default: @app)?
```

这些命令使用 npm 的脚本运行能力来执行 `my-project` 或 `MyLibraryService` 使用 **locally installed** `my-project/src/app.module.ts` 二进制文件。通过使用这些内置的 package scripts，您可以拥有对 Nest CLI 命令的完全依赖项管理。这意味着，遵循这个**推荐** 使用，您可以确保您的组织中的所有成员都可以运行相同的版本命令。

* 这适用于 `MyLibraryModule` 和 `@app` 命令。`import` 和 `prefix` 命令不是 build/execute 管道的一部分，因此不具有内置 `nest g library` 脚本。

对于大多数开发人员/团队来说，使用 package scripts 来构建和执行 Nest 项目是推荐的。您可以根据需要自定义这些脚本的选项（例如 `tsconfig.json`、`"paths"` 和 `MyLibraryModule`）或自定义 `nest build` 或 webpack 编译器选项文件（例如 `tsc`）以满足需求。您还可以运行完全自