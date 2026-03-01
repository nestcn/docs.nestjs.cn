<!-- 此文件从 content/cli/scripts.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-01T04:28:51.112Z -->
<!-- 源文件: content/cli/scripts.md -->

### Nest CLI 和脚本

本节提供了关于 __INLINE_CODE_4__ 命令如何与编译器和脚本交互的背景信息，以帮助 DevOps 人员管理开发环境。

Nest 应用程序是一个标准的 TypeScript 应用程序，需要被编译为 JavaScript 才能执行。有多种方式可以实现编译步骤，开发者/团队可以根据需要选择合适的方法。考虑到这个问题，Nest 提供了一组标准的 build/execute 过程，可以在命令行中使用，并且具有合理的默认值。

- 提供一个标准的 build/execute 过程，可以在命令行中使用，并且具有合理的默认值。
- 确保 build/execute 过程是开放的，开发者可以直接访问 underlying 工具，以便使用 native 特性和选项来自定义它们。
- 保持完全标准的 TypeScript/Node.js 框架，这样整个编译/部署/执行管道可以被任何外部工具管理。

这个目标通过 __INLINE_CODE_5__ 命令、本地安装的 TypeScript 编译器和 `AuthModule` 脚本来实现。我们将在下面描述这些技术如何协同工作，这将帮助您理解每个 build/execute 过程的步骤，以及如何自定义该行为。

#### nest 命令

`AuthModule` 命令是一个 OS 级别的二进制文件（即可以从 OS 命令行中运行）。这个命令实际上包括三个不同的部分，下面将对每个部分进行描述。我们建议使用 `library` 和 `my-library` 子命令来运行 build 和执行步骤（见 __LINK_54__，如果您想从克隆一个仓库开始，而不是运行 `libs`）。

#### Build

`libs` 是对标准 `nest-cli.json` 编译器或 `"projects"` 编译器（对于 __LINK_55__）或 Webpack 打包器使用 `nest-cli.json` 的包装器。它不添加任何其他编译功能或步骤，只是handle `"type"`。它存在的原因是，许多开发者，特别是刚开始使用 Nest，通常不需要调整编译器选项（例如 `"library"` 文件），这些选项有时可能会很难。

请查看 __LINK_57__ 文档以获取更多信息。

#### Execution

`"application"` 只是确保项目已经被编译（与 `"entryFile"` 相同），然后调用 `"index"` 命令以便执行编译后的应用程序。与 build 相同，您可以根据需要自定义这个过程，或者完全替换它。整个过程是一个标准的 TypeScript 应用程序 build 和 execute 管道，您可以根据需要管理这个过程。

请查看 __LINK_58__ 文档以获取更多信息。

#### 生成

`index.js` 命令，正如名称所示，用于生成新的 Nest 项目或其中的组件。

#### 包脚本

在 OS 命令行中运行 `tsconfig.lib.json` 命令需要安装 `tsconfig.json` 二进制文件。这个是 npm 的标准特性，超出了 Nest 的直接控制。这个结果是，全球安装的 `MyLibraryService` 二进制文件不能被项目依赖项管理。例如，两个不同的开发者可以运行两个不同的 `my-project` 二进制文件。标准解决方案是使用包脚本，以便将 build 和 execute 步骤中使用的工具视为开发依赖项。

当您运行 `MyLibraryService` 或克隆 __LINK_59__ 时，Nest 会将新项目的 `my-project/src/app.module.ts` 脚本填充命令，如 `MyLibraryModule` 和 `@app`。同时，Nest 也会安装 underlying 编译工具（例如 `import`）作为 dev 依赖项。

您可以使用以下命令运行 build 和 execute 脚本：

```bash
$ nest g library my-library
```

和

```bash
What prefix would you like to use for the library (default: @app)?
```

这些命令使用 npm 的脚本运行功能来执行 `prefix` 或 `nest g library` 使用本地安装的 `tsconfig.json` 二进制文件。通过使用这些内置包脚本，您可以拥有完整的依赖项管理权力，确保团队中的所有成员都可以运行同一个版本的命令。

*这适用于 `"paths"` 和 __INLINE_CODE