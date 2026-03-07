---

| ---






-------------------------------------------------       |
| ---------------------------------------------------------- |
| ---------------------------------------------------------- |
| 独立的文件系统结构                                         |
| 独立实例                                                   |
| 单独指定                                                   |
| `eslint.config.mjs`、`.prettierrc` 等                      |
| `nest build` 和 `nest start` 命令                          |
| 目标默认为 monorepo 中的**默认项目**                       |
| 内置支持，包括路径管理和打包                               |

阅读 [Workspaces](/cli/workspaces) 和 [Libraries](/cli/libraries)
部分以获取更详细的信息，帮助您决定哪种模式最适合您。

<app-banner-courses></app-banner-courses>

#### CLI 命令语法

所有 `nest` 命令遵循相同的格式：

```bash
nest commandOrAlias requiredArg [optionalArg] [options]
```

例如：

```bash
$ nest new my-nest-project --dry-run
```

在这里，`new` 是 _commandOrAlias_。`new` 命令有一个别名 `n`。`my-nest-project`
是 _requiredArg_。如果命令行中未提供 _requiredArg_，`nest`
将提示输入。此外，`--dry-run` 有一个等效的简写形式
`-d`。考虑到这一点，以下命令与上面的等效：

```bash
$ nest n my-nest-project -d
```

大多数命令和一些选项都有别名。尝试运行 `nest new --help`
查看这些选项和别名，并确认您对上述构造的理解。

#### 命令概述

运行 `nest <command> --help` 查看以下任何命令的特定选项。

有关每个命令的详细描述，请参阅 [Usage](/cli/usages)。

| 命令       | 别名 | 描述                                                         |
| ---------- | ---- | ------------------------------------------------------------ |
| `new`      | `n`  | 搭建一个新的_标准模式_应用程序，包含运行所需的所有样板文件。 |
| `generate` | `g`  | 基于 schematic 生成和/或修改文件。                           |
| `build`    |      | 将应用程序或工作区编译到输出文件夹。                         |
| `start`    |      | 编译并运行应用程序（或工作区中的默认项目）。                 |
| `add`      |      | 导入已打包为 **nest library** 的库，运行其安装 schematic。   |
| `info`     | `i`  | 显示有关已安装的 nest 包和其他有用的系统信息。               |

#### 要求

Nest CLI 需要一个使用[国际化支持](https://nodejs.org/api/intl.html) (ICU) 构建的
Node.js 二进制文件，例如 [Node.js 项目页面](https://nodejs.org/en/download)
上的官方二进制文件。如果您遇到与 ICU
相关的错误，请检查您的二进制文件是否满足此要求。

```bash
node -p process.versions.icu
```

如果命令打印 `undefined`，则您的 Node.js 二进制文件没有国际化支持。
