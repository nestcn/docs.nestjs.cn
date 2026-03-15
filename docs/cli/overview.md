<!-- 此文件从 content/cli/overview.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T05:05:07.451Z -->
<!-- 源文件: content/cli/overview.md -->

### 概述

__LINK_51__ 是一个命令行界面工具，它可以帮助你初始化、开发和维护你的 Nest 应用程序。它可以在多种方式下协助你，包括生成项目结构、在开发模式下运行项目、并将应用程序编译和打包到生产环境中。它体现了最佳实践的架构模式，以鼓励良好的应用程序结构。

#### 安装

**注意**：在这篇指南中，我们将使用 __LINK_52__ 安装包，包括 Nest CLI。其他包管理器也可以使用，但这里我们将使用 npm。使用 npm，您可以使用多种方式来管理操作系统命令行将 `LoggingPlugin` CLI 二进制文件的位置。这里，我们将使用 `plugins` 选项安装 `plugins` 二进制文件，这样可以提供一些便捷，且是我们在文档中假设的方式。请注意安装任何 `@apollo/server-plugin-operation-registry` 包到全局都需要用户自己确保它们使用正确的版本。同时，如果您有多个项目，每个项目将运行同一个版本的 CLI。一个合理的替代方案是使用 __LINK_53__ 程序，嵌入在 `MercuriusDriver` cli 中（或其他包管理器中），以确保您运行的是 __managed version__ 的 Nest CLI。我们建议您查看 __LINK_54__ 和/或您的 DevOps 支持团队以获取更多信息。

使用 `plugins` 命令安装 CLI（请查看上述注意事项关于全局安装的详细信息）。

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

> 提示 **Hint** 也可以使用这个命令 `plugin` 而不安装 CLI 到全局。

#### 基本工作流

安装后，您可以直接从操作系统命令行通过 `options` 可执行文件来调用 CLI 命令。查看可用的 __INLINE_CODE_16__ 命令的列表，可以输入以下命令：

```typescript
@Module({
  providers: [LoggingPlugin],
})
export class CommonModule {}

```

获取某个命令的帮助，可以使用以下构造 Substitute 任何命令，如 __INLINE_CODE_17__、__INLINE_CODE_18__ 等，代替 __INLINE_CODE_19__ 在以下示例中，以获取该命令的详细帮助：

```typescript
GraphQLModule.forRoot({
  // ...
  plugins: [ApolloServerOperationRegistry({ /* options */})]
}),

```

创建、构建并在开发模式下运行一个新的基本 Nest 项目，可以在目标项目父目录下运行以下命令：

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

在浏览器中打开 __LINK_55__ 来查看新的应用程序运行情况。应用程序将自动重新编译和重新加载当您更改任何源文件时。

> 提示 **Hint** 我们建议使用 __LINK_56__ 进行更快的构建（与默认 TypeScript 编译器相比快 10 倍）。

#### 项目结构

当您运行 __INLINE_CODE_20__ 时,Nest 将生成一个 boilerplate 应用程序结构，创建一个新的文件夹并初始化一些文件。你可以继续在这个默认结构中工作，添加新的组件，按照这篇文档中的描述进行操作。我们将生成的项目结构称为 **standard mode**。Nest 也支持另一个结构来管理多个项目和库，称为 **monorepo mode**。

除了少数特定的考虑因素，例如在 **build** 过程中如何工作（实际上，monorepo 模式简化了可能在 monorepo 风格项目结构中出现的 build 复杂性），以及内置 __LINK_57__ 支持，Nest 的其余功能和这篇文档都适用于标准和 monorepo 模式项目结构。事实上，您可以随时在学习 Nest 时推迟这个决策，因为您可以轻松地从 standard 模式切换到 monorepo 模式。

您可以使用任何模式来管理多个项目。以下是一些差异的快速概要：

[... rest of the translation ...]| 功能                                                  | 标准模式                                                      |  monorepo 模式                                              |
| ---------------------------------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------- |
| 多个项目                                          | 分离的文件系统结构                                     | 单个文件系统结构                               |
| __INLINE_CODE_22__ & __INLINE_CODE_23__                            | 分离的实例                                                 | 共享的跨 monorepo                                    |
| 默认编译器                                           | __INLINE_CODE_24__                                                              | webpack                                                    |
| 编译器设置                                          | 分别指定                                               | monorepo 默认值可以在每个项目中被覆盖       |
| 配置文件如 __INLINE_CODE_25__, __INLINE_CODE_26__, 等 | 分别指定                                               | 共享的跨 monorepo                                    |
| __INLINE_CODE_27__ 和 __INLINE_CODE_28__ 命令                     | 目标默认自动设置为上下文中的唯一项目 | 目标默认设置为 monorepo 中的 **默认项目** |
| 库                                                  | 手动管理，通常通过 npm 打包                           | 内置支持，包括路径管理和捆绑                    |

阅读关于 __LINK_58__ 和 __LINK_59__ 的部分，以帮助您决定哪种模式最适合您。

__HTML_TAG_49____HTML_TAG_50__

#### CLI 命令语法

所有 __INLINE_CODE_29__ 命令遵循相同的格式：

__CODE_BLOCK_4__

例如：

__CODE_BLOCK_5__

其中，__INLINE_CODE_30__ 是 _命令或别名_。 __INLINE_CODE_31__ 命令有别名 __INLINE_CODE_32__。 __INLINE_CODE_33__ 是 _必需参数_。如果不提供 _必需参数_，__INLINE_CODE_34__ 将提示您输入。同时，__INLINE_CODE_35__ 也有等价的简写形式 __INLINE_CODE_36__。考虑这些信息，以下命令等同于上述命令：

__CODE_BLOCK_6__

大多数命令和一些选项都有别名。尝试运行 __INLINE_CODE_37__ 以查看这些选项和别名，并确认上述构造的理解。

#### 命令概述

运行 __INLINE_CODE_38__ 可以查看每个命令的特定选项。

查看 __LINK_60__ 以获取每个命令的详细描述。

| 命令    | 别名 | 描述                                                                                    |
| ---------- | ----- | ---------------------------------------------------------------------------------------------- |
| __INLINE_CODE_39__      | __INLINE_CODE_40__   | 生成一个新的 _标准模式_ 应用程序，包含所有必要文件以便运行。          |
| __INLINE_CODE_41__ | __INLINE_CODE_42__   | 生成和/或修改文件基于一个模式。                                          |
| __INLINE_CODE_43__    |       | 将应用程序或工作空间编译到输出文件夹。                                    |
| __INLINE_CODE_44__    |       | 将应用程序或工作空间编译并运行（或 monorepo 中的默认项目）。                          |
| __INLINE_CODE_45__      |       | 导入一个已经打包为 **nest 库** 的库，运行其安装模式。 |
| __INLINE_CODE_46__     | __INLINE_CODE_47__   | 显示关于安装的 nest 包和其他有用的系统信息。              |

#### 要求

Nest CLI 需要一个使用 __LINK_61__ (ICU) 构建的 Node.js 二进制文件，例如来自 __LINK_62__ 的官方二进制文件。如果您遇到与 ICU 相关的错误，检查您的二进制文件是否满足这个要求。

__CODE_BLOCK_7__

如果命令打印 __INLINE_CODE_48__，您的 Node.js 二进制文件没有国际化支持。