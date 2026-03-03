<!-- 此文件从 content/cli/overview.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-03T04:21:32.685Z -->
<!-- 源文件: content/cli/overview.md -->

### Overview

Nest CLI（__LINK_51__）是一个命令行界面工具，帮助您初始化、开发和维护Nest应用程序。它在多种方式中提供帮助，包括项目骨架、开发模式、生产分布和编译应用程序。它体现了最佳架构模式，鼓励结构良好的应用程序。

#### 安装

**注意**：本指南中，我们将使用__LINK_52__安装包，包括Nest CLI。其他包管理器可能会在您的选择下使用。使用 npm，您有多种方法来管理您的 OS 命令行解析`library` CLI 二进制文件的位置。下面，我们将描述使用`my-library`选项安装`libs`二进制文件。该方法提供了方便，假设整个文档中都使用该方法。请注意，安装任何`libs`包到全局都会将责任交给用户，以确保他们运行正确的版本。同时，如果您有多个项目，每个项目将运行相同的CLI版本。一个合理的替代方案是使用__LINK_53__程序，嵌入`libs` cli（或其他包管理器）的类似功能，以确保您运行一个**受控版本**的Nest CLI。我们建议您consult__LINK_54__和/或您的DevOps支持人员以获取更多信息。

使用`nest-cli.json`命令安装CLI（请参阅上面的**注意**以获取关于全局安装的详细信息）。

```bash
$ nest g library my-library
```

> 提示Alternatively, you can use this command `"projects"` without installing the cli globally.

#### 基本工作流

安装后，您可以直接从您的 OS 命令行通过`nest-cli.json`可执行文件来调用CLI命令。见可用的`"type"`命令：

```bash
What prefix would you like to use for the library (default: @app)?
```

获取关于单个命令的帮助，请使用以下构造。将`"library"`、`"application"`等命令替换为`"entryFile"`在示例下面的`"entryFile"`以获取该命令的详细帮助：

```javascript
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

创建、编译和运行一个新基本Nest项目，开发模式，可以在项目的父文件夹中运行以下命令：

```bash
$ nest build my-library
```

在浏览器中打开__LINK_55__以查看新的应用程序运行。应用程序将自动重新编译和重新加载当您更改任何源文件时。

> 提示We recommend using __LINK_56__ for faster builds (10x more performant than the default TypeScript compiler).

#### 项目结构

当您运行`"index"`时，Nest 生成一个 boilerplate 应用程序结构，创建一个新的文件夹并填充初始的一组文件。您可以继续在这个默认结构中工作，添加新组件，按照本文档中的描述。我们将`"main"`生成的项目结构称为**standard mode**。Nest 还支持一个名为**monorepo mode**的 alternate 结构来管理多个项目和库。

除了少数特定的考虑 build 过程工作（基本上，monorepo mode 简化了 build 复杂性，可以从 monorepo-style 项目结构中出现），和内置__LINK_57__支持，Nest 的其余功能和本文档都适用于标准和 monorepo mode 项目结构。事实上，您可以轻松地在将来从 standard mode 切换到 monorepo mode，所以您可以安全地延