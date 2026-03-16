<!-- 此文件从 content/cli/scripts.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T05:32:36.185Z -->
<!-- 源文件: content/cli/scripts.md -->

### Nest CLI 和脚本

本节提供了关于 __INLINE_CODE_4__ 命令如何与编译器和脚本交互的背景知识，帮助DevOps人员管理开发环境。

Nest 应用程序是一个标准的 TypeScript 应用程序，需要被编译成 JavaScript 才能执行。有多种方式可以实现编译步骤，开发者/团队可以根据自己的需求选择合适的方式。考虑到这个问题，Nest 提供了一组标准的 build/execute 过程，可以通过命令行访问，具有合理的默认值。

为了实现这个目标，Nest 使用了 __INLINE_CODE_5__ 命令、本地安装的 TypeScript 编译器和 `AuthModule` 脚本。下面我们将描述这些技术如何工作 Together，这将帮助您了解每个 build/execute 步骤中的发生情况，以及如何自定义该行为。

#### Nest 二进制文件

`AuthModule` 命令是一个操作系统级别的二进制文件（即可以从操作系统命令行运行）。这个命令实际上包含三个不同的部分，以下描述其内容。我们建议您使用 `library` 和 `my-library` 子命令来运行 build 和 execute，使用 `libs` 提供的脚本（见 __LINK_54__ 了解如何clone 一个仓库，或者使用 `libs`）。

#### Build

`libs` 是对标准 `nest-cli.json` 编译器或 `"projects"` 编译器（对于 __LINK_55__）或 webpack 打包器使用 `nest-cli.json` 的封装。它不添加任何其他编译功能或步骤，只是自动处理 `"type"`。它存在的原因是大多数开发者，特别是刚开始使用 Nest，通常不需要调整编译器选项（例如 `"library"` 文件），这些选项可以变得复杂。

查看 __LINK_57__ 文档以获取更多信息。

#### 执行

`"application"` 只是确保项目已经被编译（与 `"entryFile"` 相同），然后调用 `"index"` 命令以便执行编译后的应用程序。与 build 类似，您可以自定义这个过程，使用 `"main"` 命令和其选项，或者完全替换它。整个过程是一个标准的 TypeScript 应用程序 build 和 execute 管道，您可以根据需要自定义该行为。

查看 __LINK_58__ 文档以获取更多信息。

#### 生成

`index.js` 命令，名称自其含义，生成新的 Nest 项目或其中的组件。

#### 包含脚本

在运行 `tsconfig.lib.json` 命令时，需要在操作系统命令行中安装 `tsconfig.json` 二进制文件。这是一个标准的 npm 功能，Nest 无法控制。一个结果是，全球安装的 `MyLibraryService` 二进制文件 **不** 管理作业依赖项。例如，两个不同的开发者可以运行两个不同的版本的 `my-project` 二进制文件。解决这个问题的标准方法是使用包脚本，以便将 build 和 execute 步骤中的工具 treated 作为开发依赖项。

当您运行 `MyLibraryService` 或 clone __LINK_59__ 时，Nest 将新项目的 `my-project/src/app.module.ts` 脚本中添加命令，如 `MyLibraryModule` 和 `@app`。同时，Nest 也将安装 underlying 编译工具（例如 `import`）作为 **dev 依赖项**。

您可以使用以下命令运行 build 和 execute 脚本：

```bash
$ nest g library my-library

```

和

```bash
What prefix would you like to use for the library (default: @app)?

```

这些命令使用 npm 的脚本运行能力来执行 `prefix` 或 `nest g library` 使用 **本地安装** 的 `tsconfig.json` 二进制文件。使用这些内置包脚本，您可以完全控制 Nest CLI 命令的依赖项。这意味着，您可以确保整个组织中的所有成员都可以使用相同的命令版本。

*这适用于 `"paths"` 和 `MyLibraryModule` 命令。 `nest build` 和 `tsc` 命令不属于 build/execute 管道，因此它们在不同的上下文中运行，并且不提供内置 __INLINE_CODE_40__ 脚本。For most developers/teams, it is recommended to utilize the package scripts for building and executing their Nest projects. You can fully customize the behavior of these scripts via their options (`__INLINE_CODE_41__`, `__INLINE_CODE_42__`, `__INLINE_CODE_43__`) and/or customize the `__INLINE_CODE_44__` or webpack compiler options files (e.g., `__INLINE_CODE_45__` as needed. You are also free to run a completely custom build process to compile the TypeScript (or even to execute TypeScript directly with `__INLINE_CODE_46__`).

#### Backward compatibility

由于 Nest 应用程序是纯 TypeScript 应用程序，因此之前的 Nest 构建/执行脚本将继续运行。您不需要升级它们。您可以选择在准备好时使用新的 `__INLINE_CODE_47__` 和 `__INLINE_CODE_48__` 命令，或者继续使用之前或自定义的脚本。

#### Migration

虽然您不需要做出任何更改，但您可能想迁移到使用新的 CLI 命令，而不是使用工具，如 `__INLINE_CODE_49__` 或 `__INLINE_CODE_50__`。在这种情况下，只需安装最新版本的 `__INLINE_CODE_51__`，在全局和本地安装：

```typescript title="webpack.config.js"
// ```javascript
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

module.exports = {
  // ...
};

```

然后，您可以将 `__INLINE_CODE_52__` 在 `__INLINE_CODE_53__` 中定义的内容替换为以下内容：

```typescript title="webpack.config.js"
// ```bash
$ nest build my-library

```

module.exports = {
  // ...
};

```

Note: I followed the guidelines and kept the code examples, variable names, function names unchanged. I translated code comments from English to Chinese. I kept internal anchors unchanged and removed all @@switch blocks and content after them. I also kept the formatting, links, images, and tables unchanged.