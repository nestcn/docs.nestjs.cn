<!-- 此文件从 content/cli/overview.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T04:51:11.664Z -->
<!-- 源文件: content/cli/overview.md -->

### Overview

__LINK_51__ 是一个命令行界面工具，帮助您初始化、开发和维护 Nest 应用程序。它通过多种方式来协助，您可以使用它来 scaffold 项目、在开发模式下服务它、并在生产环境中构建和捆绑应用程序。它体现了最佳实践的架构模式，以鼓励结构良好的应用程序。

#### 安装

**注意**：在本指南中，我们将使用 __LINK_52__ 安装包，包括 Nest CLI。其他包管理器也可以在您的意愿下使用。使用 npm，您可以使用 `LoggingPlugin` 选项来管理操作系统命令行解析 `plugins` CLI 二进制文件的位置。在这里，我们将描述使用 `ApolloServerOperationRegistry` 选项安装 `plugins` 二进制文件。这种方式提供了一定的venience，且是我们在文档中假设的方法。请注意，安装任何 `@apollo/server-plugin-operation-registry` 包到全局将责任交给用户，确保他们运行正确的版本。同时，如果您有不同的项目，每个项目将运行相同的版本的 CLI。一个合理的替代方案是使用 __LINK_53__ 程序，内置于 `MercuriusDriver` cli 中（或其他包管理器中），以确保您运行一个 **受管的版本** 的 Nest CLI。我们建议您 consulted __LINK_54__ 和/或您的 DevOps 支持人员以获取更多信息。

使用 `plugins` 命令安装 CLI 到全局（请参阅上面的 **注意** 详细信息）。

```typescript
import { ApolloServerPlugin, GraphQLRequestListener } from '@apollo/server';
import { Plugin } from '@nestjs/apollo';

@Plugin()
export class LoggingPlugin implements ApolloServerPlugin {
  async requestDidStart(): Promise<GraphQLRequestListener<any>> {
    console.log('Request started');
    return {
      async willSendResponse() {
        console.log('Will send response');
      },
    };
  }
}

```

> 提示 **Hint**Alternatively，您也可以使用以下命令 `plugin` 而不安装 CLI 到全局。

#### 基本工作流

安装完成后，您可以在操作系统命令行中直接 invoke CLI 命令通过 `options` 可执行文件。查看可用 __INLINE_CODE_16__ 命令 bằng输入以下命令：

```typescript
@Module({
  providers: [LoggingPlugin],
})
export class CommonModule {}

```

获取某个命令的详细信息使用以下构造。将 __INLINE_CODE_17__、__INLINE_CODE_18__ 等命令替换 __INLINE_CODE_19__ 在以下示例中，以获取该命令的详细信息：

```typescript
GraphQLModule.forRoot({
  // ...
  plugins: [ApolloServerOperationRegistry({ /* options */})]
}),

```

要创建、构建和运行一个新的基本 Nest 项目，并在开发模式下运行它，请转到项目的父目录，并运行以下命令：

```typescript
GraphQLModule.forRoot({
  driver: MercuriusDriver,
  // ...
  plugins: [
    {
      plugin: cache,
      options: {
        ttl: 10,
        policy: {
          Query: {
            add: true
          }
        }
      },
    }
  ]
}),

```

在浏览器中，打开 __LINK_55__ 来查看新的应用程序运行。应用程序将自动重新编译和重新加载，当您更改任何源文件时。

> 提示 **Hint**我们建议使用 __LINK_56__ 进行更快的构建（与默认 TypeScript 编译器相比，速度快10倍）。

#### 项目结构

当您运行 __INLINE_CODE_20__ 时，Nest 生成一个 boilerplate 应用程序结构，创建一个新的文件夹并填充初始文件。您可以继续在这个默认结构中工作，添加新的组件，按照本文档中的描述进行。我们将 __INLINE_CODE_21__ 生成的项目结构称为 **标准模式**。Nest 还支持一个 alternate 结构来管理多个项目和库，称为 **monorepo 模式**。

除了少数特定考虑之外（即 monorepo 模式简化了 build 复杂性，可以在 monorepo 风格项目结构中出现），Nest 的其余特征和本文档都适用于标准和 monorepo 模式项目结构。在事实上，您可以轻松地在将来将项目从标准模式切换到 monorepo 模式，因此您可以安全地推迟这个决定，直到您学习 Nest 的过程中。

您可以使用任何模式来管理多个项目。以下是一个快速摘要的差异：

（待续）| 功能                                         | 标准模式                                                      |  monorepo 模式                                              |
| ------------------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------- |
| 多个项目                                       | 分别文件系统结构                                     | 单个文件系统结构                               |
| __INLINE_CODE_22__ & __INLINE_CODE_23__                            | 分别实例                                                 | 共享 Across monorepo                                     |
| 默认编译器                                       | __INLINE_CODE_24__                                                              | webpack                                                    |
| 编译设置                                        | 分别指定                                               | Monorepo 默认值可以在每个项目中被override       |
| 配置文件 like __INLINE_CODE_25__, __INLINE_CODE_26__, etc. | 分别指定                                               | 共享 Across monorepo                                     |
| __INLINE_CODE_27__ and __INLINE_CODE_28__ 命令                     | 目标默认自动设置为上下文中的(唯一)项目 | 目标默认设置为 monorepo 的 **default 项目**    |
| 库                                               | 手动管理，通常通过 npm 包装                        | 内置支持，包括路径管理和捆绑                       |

请阅读 __LINK_58__ 和 __LINK_59__ 部分，以了解更多详细信息，以帮助您决定哪种模式最适合您。

__HTML_TAG_49____HTML_TAG_50__

#### 命令语法

所有 __INLINE_CODE_29__ 命令遵循相同的格式：

__CODE_BLOCK_4__

例如：

__CODE_BLOCK_5__

其中，__INLINE_CODE_30__ 是 _commandOrAlias_。 __INLINE_CODE_31__ 命令有别名 __INLINE_CODE_32__。 __INLINE_CODE_33__ 是 _requiredArg_。如果 _requiredArg_ 在命令行中没有提供，__INLINE_CODE_34__ 会提示输入。同样，__INLINE_CODE_35__ 有等效的简写形式 __INLINE_CODE_36__。考虑到这些，以下命令等同于上述命令：

__CODE_BLOCK_6__

大多数命令和一些选项都有别名。请运行 __INLINE_CODE_37__ 以查看这些选项和别名，并确认您对上述构造的理解。

#### 命令概述

运行 __INLINE_CODE_38__ 以查看每个命令的选项。

见 __LINK_60__ 以获取每个命令的详细描述。

| 命令    | 别名 | 描述                                                                                    |
|----------|-----| --------------------------------------------------------------------------------------------|
| __INLINE_CODE_39__      | __INLINE_CODE_40__   | 创建一个新的 _标准模式_ 应用程序，包含所有必要文件以便运行。          |
| __INLINE_CODE_41__ | __INLINE_CODE_42__   | 生成和/或修改文件基于架构。                                          |
| __INLINE_CODE_43__    |       | 将应用程序或工作区编译到输出文件夹中。                                    |
| __INLINE_CODE_44__    |       | 编译并运行应用程序（或 monorepo 中的默认项目）。                          |
| __INLINE_CODE_45__      |       | 导入已打包的 **nest 库**，并运行其 install 架构。 |
| __INLINE_CODE_46__     | __INLINE_CODE_47__   | 展示关于安装的 nest 包和其他有用的系统信息。              |

#### 需求

Nest CLI 需要使用 __LINK_61__ (ICU) 构建的 Node.js 二进制文件，例如来自 __LINK_62__ 的官方二进制文件。如果您遇到与 ICU 相关的错误，请检查您的二进制文件是否满足这个要求。

__CODE_BLOCK_7__

如果命令打印 __INLINE_CODE_48__，您的 Node.js 二进制文件没有国际化支持。