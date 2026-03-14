<!-- 此文件从 content/cli/overview.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T04:42:57.559Z -->
<!-- 源文件: content/cli/overview.md -->

### Overview

__LINK_51__ 是一个命令行界面工具，可以帮助您初始化、开发和维护 Nest 应用程序。它在多个方面提供帮助，包括项目骨架生成、开发模式服务和生产分发构建。它实施了最佳实践架构模式，以鼓励良好的应用结构。

#### 安装

**注意**：在本指南中，我们将使用 __LINK_52__ 安装包，包括 Nest CLI。其他包管理器可能会在您的意愿下使用。使用 npm，您可以使用多种方式管理 OS 命令行解析 __INLINE_CODE_8__ CLI 二进制文件的位置。在这里，我们将描述安装 __INLINE_CODE_9__ 二进制文件到全局使用 __INLINE_CODE_10__ 选项。这提供了一些便捷，且是我们在文档中假设的方法。请注意，在安装 **任何** __INLINE_CODE_11__ 包到全局时，您需要确保它们运行正确的版本。如果您有不同的项目，每个项目将运行 **相同** 的 CLI 版本。一个合理的替代方案是使用 __LINK_53__ 程序，嵌入在 __INLINE_CODE_12__ cli 中（或类似功能在其他包管理器中）以确保您运行的是 **受管理** 的 Nest CLI。我们建议您 consult __LINK_54__ 和/或您的 DevOps 支持团队以获取更多信息。

使用 __INLINE_CODE_13__ 命令安装 CLI 到全局（请参阅上面的 **注意** 了解全局安装的详细信息）。

```bash
$ npm i --save @nestjs/config

```

> 提示Alternatively, you can use this command __INLINE_CODE_14__ without installing the cli globally。

#### 基本工作流

安装后，您可以从 OS 命令行直接调用 CLI 命令通过 __INLINE_CODE_15__ 可执行文件。查看可用的 __INLINE_CODE_16__ 命令，请输入以下命令：

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot()],
})
export class AppModule {}

```

获取关于单个命令的帮助使用以下构造。将任何命令，如 __INLINE_CODE_17__、__INLINE_CODE_18__ 等，代替 __INLINE_CODE_19__ 在示例中，以获取该命令的详细帮助：

```json
DATABASE_USER=test
DATABASE_PASSWORD=test

```

要创建、构建和运行一个新的基本 Nest 项目到开发模式，请转到该项目的父文件夹，然后运行以下命令：

```bash
$ nest start --env-file .env

```

在浏览器中，打开 __LINK_55__ 查看新的应用程序运行。应用程序将自动重新编译和重载当您更改任何源文件。

> 提示We recommend using __LINK_56__ for faster builds (10x more performant than the default TypeScript compiler).

#### 项目结构

当您运行 __INLINE_CODE_20__ 时，Nest 生成了一个骨架应用结构，创建了一个新文件夹并填充了初始文件集。您可以继续在默认结构中工作，添加新的组件，如本文档中所述。我们将 __INLINE_CODE_21__ 生成的项目结构称为 **standard mode**。Nest 也支持一个管理多个项目和库的 alternate 结构称为 **monorepo mode**。

除了少数特定的考虑关于 **build** 过程（基本上，monorepo 模式简化了 monorepo 风格项目结构中可能出现的 build 复杂性），和内置 __LINK_57__ 支持，Nest 的其余特性和本文档都适用于两种模式项目结构。实际上，您可以轻松地在将来任何时间从 standard mode 切换到 monorepo mode，所以您可以安全地推迟这个决定，直到您学习了 Nest。

您可以使用两种模式管理多个项目。以下是一些差异的快速概要：

（待续）Here is the translated technical documentation in Chinese:

| 功能                         | 标准模式                                             |  monorepo 模式                                            |
| --------------------------- | -------------------------------------------------- | ---------------------------------------------------------- |
| 多个项目                     | 分离的文件系统结构                                 | 单个文件系统结构                                       |
| __INLINE_CODE_22__ & __INLINE_CODE_23__                       | 分离的实例                                           | 共享在 monorepo 中                                     |
| 默认编译器                   | __INLINE_CODE_24__                                        | webpack                                                    |
| 编译器设置                 | 单独指定                                             | monorepo 中默认的，可以在每个项目中override          |
| 配置文件，如 __INLINE_CODE_25__, __INLINE_CODE_26__, 等 | 单独指定                                             | 在 monorepo 中共享                                     |
| __INLINE_CODE_27__ 和 __INLINE_CODE_28__ 命令                | 目标默认自动设置为上下文中的唯一项目              | 目标默认设置为 monorepo 中的 **默认项目**            |
| 库                         | 手动管理，通常通过 npm 包装                       | 内置支持，包括路径管理和捆绑                       |

请阅读 __LINK_58__ 和 __LINK_59__ 部分，以获取更多详细信息，以帮助您决定哪种模式最适合您。

__HTML_TAG_49____HTML_TAG_50__

#### CLI 命令语法

所有 __INLINE_CODE_29__ 命令都遵循相同的格式：

```typescript
ConfigModule.forRoot({
  envFilePath: '.development.env',
});

```

例如：

```typescript
ConfigModule.forRoot({
  envFilePath: ['.env.development.local', '.env.development'],
});

```

其中，__INLINE_CODE_30__ 是 _命令或别名_。__INLINE_CODE_31__ 命令具有别名 __INLINE_CODE_32__。__INLINE_CODE_33__ 是 _必需参数_。如果在命令行中未提供 _必需参数_，__INLINE_CODE_34__ 将提示输入。同时，__INLINE_CODE_35__ 具有简短形式 __INLINE_CODE_36__。考虑上述构造，以下命令等同于上述命令：

```typescript
ConfigModule.forRoot({
  ignoreEnvFile: true,
});

```

大多数命令和一些选项都具有别名。运行 __INLINE_CODE_37__ 可以查看这些选项和别名，并确认您对上述构造的理解。

#### 命令概述

运行 __INLINE_CODE_38__ 可以查看每个命令的特有选项。

请查看 __LINK_60__ 获取每个命令的详细描述。

| 命令    | 别名 | 描述                                                                                        |
| -------- | ----- | -------------------------------------------------------------------------------------------- |
| __INLINE_CODE_39__      | __INLINE_CODE_40__   | 基于 _标准模式_ 创建一个新的应用程序，包括所有必要的 boilerplate 文件。          |
| __INLINE_CODE_41__ | __INLINE_CODE_42__   | 根据模板生成和/或修改文件。                                                              |
| __INLINE_CODE_43__    |       | 将应用程序或工作区编译到输出文件夹中。                                               |
| `process.env`    |       | 编译并运行应用程序（或 monorepo 中的默认项目）。                                       |
| `.env`      |       | 导入已经打包为 **nest 库** 的库，运行其 install 模板。                            |
| `.env`     | `ConfigModule`   | 显示关于安装的 nest 包和其他有用的系统信息。                                          |

#### 要求

Nest CLI 需要 Node.js 二进制文件，构建于 __LINK_61__ (ICU)，例如来自 __LINK_62__ 的官方二进制文件。 如果您遇到与 ICU 相关的错误，请检查您的二进制文件是否满足该要求。

```typescript
ConfigModule.forRoot({
  isGlobal: true,
});

```

如果命令打印 `ConfigService`，您的 Node.js 二进制文件没有国际化支持。