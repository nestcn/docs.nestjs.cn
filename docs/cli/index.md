# CLI

[Nest CLI](https://github.com/nestjs/nest-cli) 是一个命令行界面工具，可帮助您初始化、开发和维护 NestJS 应用程序。它通过多种方式提供帮助，包括搭建项目、在开发模式下运行项目，以及构建和打包应用程序用于生产分发。它体现了最佳实践架构模式，鼓励结构良好的应用程序。

## 主要功能

- **项目脚手架** - 快速创建新的 NestJS 项目
- **代码生成** - 自动生成模块、控制器、服务等
- **开发服务器** - 提供热重载的开发环境
- **构建工具** - 打包和编译应用程序
- **工作区管理** - 支持 monorepo 模式
- **库支持** - 内置库创建和管理
- **脚本管理** - 项目脚本的便捷管理

## 安装

使用 `npm install -g` 命令全局安装 CLI：

```bash
$ npm install -g @nestjs/cli
```

> **提示** 或者，您可以使用 `npx @nestjs/cli@latest` 命令而无需全局安装 CLI。

## 基本工作流程

安装后，您可以通过 `nest` 可执行文件直接从操作系统命令行调用 CLI 命令。通过输入以下内容查看可用的 `nest` 命令：

```bash
$ nest --help
```

使用以下结构获取单个命令的帮助。在下面的示例中，将 `generate` 替换为任何命令（如 `new`、`add` 等）以获得该命令的详细帮助：

```bash
$ nest generate --help
```

要在开发模式下创建、构建和运行新的基本 Nest 项目，请转到应该成为新项目父目录的文件夹，并运行以下命令：

```bash
$ nest new my-nest-project
$ cd my-nest-project
$ npm run start:dev
```

在浏览器中，打开 [http://localhost:3000](http://localhost:3000) 以查看正在运行的新应用程序。当您更改任何源文件时，应用程序将自动重新编译和重新加载。

> **提示** 我们推荐使用 [SWC 构建器](../recipes/swc.md)来获得更快的构建速度（比默认的 TypeScript 编译器快 10 倍）。

## 项目结构

当您运行 `nest new` 时，Nest 通过创建新文件夹并填充初始文件集来生成样板应用程序结构。您可以继续在这个默认结构中工作，添加新组件，如本文档中所述。我们将 `nest new` 生成的项目结构称为**标准模式**。Nest 还支持管理多个项目和库的替代结构，称为 **monorepo 模式**。

除了围绕构建过程如何工作的一些具体考虑（本质上，monorepo 模式简化了有时从 monorepo 风格的项目结构中产生的构建复杂性）和内置[库](./libraries.md)支持外，其余的 Nest 功能和本文档同样适用于标准和 monorepo 模式项目结构。事实上，您可以随时轻松地从标准模式切换到 monorepo 模式，因此在您仍在学习 Nest 时，可以安全地推迟此决定。

您可以使用任一模式来管理多个项目。以下是差异的快速摘要：

| 功能 | 标准模式 | Monorepo 模式 |
|------|----------|---------------|
| 多个项目 | 独立的文件系统结构 | 单一文件系统结构 |
| node_modules 和 package.json | 独立实例 | 在 monorepo 间共享 |
| 默认编译器 | tsc | webpack |
| 编译器设置 | 单独指定 | Monorepo 默认值，可针对每个项目覆盖 |
| 配置文件（如 eslint.config.mjs、.prettierrc 等） | 单独指定 | 在 monorepo 间共享 |
| nest build 和 nest start 命令 | 目标自动默认为上下文中的（唯一）项目 | 目标默认为 monorepo 中的默认项目 |
| 库 | 手动管理，通常通过 npm 打包 | 内置支持，包括路径管理和打包 |

阅读[工作区](./workspaces.md)和[库](./libraries.md)部分以获取更详细的信息，帮助您决定哪种模式最适合您。

## CLI 命令语法

所有 `nest` 命令都遵循相同的格式：

```bash
nest commandOrAlias requiredArg [optionalArg] [options]
```

例如：

```bash
$ nest new my-nest-project --dry-run
```

这里，`new` 是 commandOrAlias。`new` 命令有一个别名 `n`。`my-nest-project` 是 requiredArg。如果在命令行中没有提供 requiredArg，`nest` 将提示您输入。另外，`--dry-run` 有一个等效的简写形式 `-d`。考虑到这一点，以下命令与上面的命令等效：

```bash
$ nest n my-nest-project -d
```

大多数命令和一些选项都有别名。尝试运行 `nest new --help` 来查看这些选项和别名，并确认您对上述结构的理解。

## 命令概览

对以下任何命令运行 `nest <command> --help` 以查看特定于命令的选项。

查看[用法](./usages.md)以获取每个命令的详细描述。

| 命令 | 别名 | 描述 |
|------|------|------|
| new | n | 搭建新的标准模式应用程序，包含运行所需的所有样板文件 |
| generate | g | 基于原理图生成和/或修改文件 |
| build |   | 将应用程序或工作区编译到输出文件夹 |
| start |   | 编译并运行应用程序（或工作区中的默认项目） |
| add |   | 导入已打包为 nest 库的库，运行其安装原理图 |
| info | i | 显示有关已安装 nest 包和其他有用系统信息的信息 |

## 系统要求

Nest CLI 需要构建时支持[国际化](https://nodejs.org/api/intl.html) (ICU) 的 Node.js 二进制文件，例如来自 [Node.js 项目页面](https://nodejs.org/en/download)的官方二进制文件。如果您遇到与 ICU 相关的错误，请检查您的二进制文件是否满足此要求。

```bash
node -p process.versions.icu
```

如果命令打印 `undefined`，则您的 Node.js 二进制文件没有国际化支持。

## 学习资源

### 官方课程

NestJS 提供全面的 CLI 和开发工具课程：

- 80+ 章节内容
- 5+ 小时视频教程
- 官方认证
- 深度学习会话

[探索官方课程](https://courses.nestjs.com/)

## 相关章节

- [概览](./overview.md) - CLI 详细介绍
- [工作区](./workspaces.md) - Monorepo 模式管理
- [库](./libraries.md) - 创建和管理库
- [用法](./usages.md) - 命令详细用法
- [脚本](./scripts.md) - 项目脚本管理
