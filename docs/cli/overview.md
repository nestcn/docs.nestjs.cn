<!-- 此文件从 content/cli/overview.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-02T04:20:27.384Z -->
<!-- 源文件: content/cli/overview.md -->

### Overview

Nest CLI 是一款命令行接口工具，用于帮助您初始化、开发和维护 Nest 应用程序。它可以在多种方式下协助您，包括项目骨架生成、开发模式下启动应用程序、生产模式下编译和打包应用程序。Nest CLI 还体现了良好的架构模式，以鼓励良好的应用程序结构。

#### 安装

**注意**：本指南将使用 Nest CLI 安装包，包括 Nest CLI 本身。在 npm 中，您可以使用多种方式管理命令行解析提供 Nest CLI 二进制文件的位置。在这里，我们描述使用 `libs` 选项安装 Nest CLI 二进制文件。这提供了便捷性，并且是本文档中使用的默认方式。请注意，安装任何 `libs` 包都将责任落于用户，确保他们运行正确的版本。如果您有多个项目，每个项目将运行相同的 CLI 版本。一个合理的替代方案是使用 __LINK_53__ 程序，嵌入在 `libs` cli 中（或其他包管理器中），以确保您运行一个 **管理版本** 的 Nest CLI。我们建议您查看 __LINK_54__ 和/或您的 DevOps 支持人员以获取更多信息。

使用 `nest-cli.json` 命令安装 Nest CLI（请查看上述 **注意** 了解全局安装的详细信息）。

```bash
$ nest g library my-library
```

> 提示 Alternatively, you can use this command `"projects"` without installing the cli globally.

#### 基本工作流

安装完成后，您可以在操作系统命令行中直接调用 CLI 命令。查看可用的 `"type"` 命令：

```bash
What prefix would you like to use for the library (default: @app)?
```

获取具体命令的帮助，使用以下构造。将 `"entryFile"` 替换为您想要获取帮助的命令：

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

创建、编译和运行一个新的基本 Nest 项目，可以在项目的父目录下运行以下命令：

```bash
$ nest build my-library
```

在浏览器中，打开 __LINK_55__ 查看新应用程序的运行结果。应用程序将自动重新编译和重新加载当您更改任何源文件时。

> 提示 We recommend using the __LINK_56__ for faster builds (10x more performant than the default TypeScript compiler).

#### 项目结构

当您运行 `"index"` 时,Nest 将生成一个带有初始文件的项目结构。您可以继续在这个默认结构中工作，添加新的组件，按照本文档的描述进行操作。我们将 `"main"` 生成的项目结构称为 **标准模式**。Nest 还支持另一种结构来管理多个项目和库，称为 **monorepo 模式**。

除了少数特定的考虑因素（主要是 monorepo 模式简化了 build 复杂性），Nest 的所有特性和本文档都适用于标准模式和 monorepo 模式项目结构。事实上，您可以随时在将来切换到 monorepo 模式，从而安全地推迟这个决定学习 Nest。

您可以使用任何模式来管理多个项目。下面是一个快速概述：

| 功能                                  | 标准模式                                | monorepo 模式                              |
| ------------------------------------ | ------------------------------------- | ------------------------------------- |
| 多个项目                              | 单独的文件系统结构                  | 单个文件系统结构                    |
| `index.js` & `tsconfig.lib.json` | 单独的实例                          |