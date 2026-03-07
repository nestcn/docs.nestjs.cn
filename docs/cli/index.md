------

<!-- 此文件从 content/cli/index.md 自动生成，请勿直接修改此文件 -->

|----------|---------------|
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
