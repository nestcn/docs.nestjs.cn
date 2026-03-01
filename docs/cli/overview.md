<!-- 此文件从 content/cli/overview.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-01T04:28:48.454Z -->
<!-- 源文件: content/cli/overview.md -->

### Overview

__LINK_51__ 是一个命令行界面工具，它帮助您初始化、开发和维护Nest应用程序。它在多种方式上辅助，包括生成项目架构、在开发模式下运行项目、将应用程序编译和打包到生产环境中。它体现了最佳实践架构模式，以鼓励良好的应用程序结构。

#### 安装

**注意**：在这篇指南中，我们将使用 __LINK_52__ 安装包，以包括Nest CLI。其他包管理器也可以在您的选择下使用。使用 npm，您有多种方式来管理您的 OS 命令行解析 `library` CLI 二进制文件的位置。在这里，我们描述了使用 `libs` 选项安装 `my-library` 二进制文件。这种方法提供了一定的便捷，并且是我们在文档中所假设的方法。请注意，安装 **任何** `libs` 包到全局都将责任交给用户，以确保它们运行正确的版本。此外，如果您有不同的项目，每个项目将运行 **相同** 的版本的 CLI。一个合理的替代方法是使用 __LINK_53__ 程序，嵌入在 `libs` cli 中（或者类似的特性与其他包管理器），以确保您运行 ** Managed 版本** 的Nest CLI。我们建议您 consulted __LINK_54__ 和/或您的 DevOps 支持人员以获取更多信息。

使用 `nest-cli.json` 命令（见上方的 **注意**）安装 CLI。

```bash
$ nest g library my-library
```

> 提示 **Hint** Alternatively, you can use this command `"projects"` without installing the cli globally.

#### 基本工作流

安装后，您可以在您的 OS 命令行中直接调用 CLI 命令。见可用的 `"type"` 命令：

```bash
What prefix would you like to use for the library (default: @app)?
```

获取帮助命令的帮助使用以下构造。将 `"library"`、`"application"` 等命令替换为 `"entryFile"` 在示例中，以获取该命令的详细帮助：

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

要创建、编译和运行一个新的基本 Nest 项目，在开发模式下，转到该项目的父文件夹，然后运行以下命令：

```bash
$ nest build my-library
```

在您的浏览器中，打开 __LINK_55__ 查看新的应用程序运行。应用程序将自动重新编译和重新加载，当您更改任何源文件时。

> 提示 **Hint** 我们建议使用 __LINK_56__ 进行快速构建（10 倍更快的 TypeScript 编译器）。

#### 项目结构

当您运行 `"index"` 时，Nest 生成一个初始结构，创建一个新文件夹并填充初始文件。您可以继续在这个默认结构中工作，添加新的组件，按照整个文档中所述。我们将 `"main"` 生成的项目结构称为 **标准模式**。Nest 还支持一个名为 **monorepo 模式** 的 alternate 结构，用于管理多个项目和库。

在 monorepo 模式中，您可以使用相同的 Nest 功能和文档，事实上，您可以随时将 standard 模式切换到 monorepo 模式。

| 功能                                                         | 标准模式                                         | monorepo 模式                                         |
| ------------------------------------------------------------ | -------------------------------------------------- | ----------------------------------------------------- |
| 多个项目                                                   | 单独的文件系统结构                             | 单个文件系统结构