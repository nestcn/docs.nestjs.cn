<!-- 此文件从 content/cli/overview.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:24:09.892Z -->
<!-- 源文件: content/cli/overview.md -->

### Overview

__LINK_51__是一个命令行界面工具，可以帮助您初始化、开发和维护Nest应用程序。它在多种方式上提供帮助，包括生成项目结构、在开发模式下运行、在生产模式下构建和打包应用程序。它遵循最佳实践架构模式，以鼓励良好的应用程序结构。

#### 安装

**注意**：在本指南中，我们将使用__LINK_52__安装包，包括Nest CLI。其他包管理器也可以根据您的选择使用。使用 npm，您可以使用多种方式来管理您的操作系统命令行中 `LoggingPlugin` CLI 二进制文件的位置。在这里，我们将描述使用 `ApolloServerOperationRegistry` 选项安装 `plugins` 二进制文件。这个方法提供了方便性，我们在文档中假设了这个方法。请注意，如果您将 **任何** `@apollo/server-plugin-operation-registry` 包安装到全局上，则需要用户自己确保它们运行正确的版本。同时，如果您有多个项目，每个项目将运行 **相同** 的CLI版本。一个合理的替代方案是使用 __LINK_53__ 程序，内置于 `MercuriusDriver` cli 中（或其他包管理器中的类似功能），以确保您运行的Nest CLI版本被管理。我们建议您查看 __LINK_54__ 和/或您的 DevOps 助手以获取更多信息。

使用 `plugins` 命令全局安装CLI（请参阅上面的注意事项以获取更多关于全局安装的信息）。

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

> 提示 **Hint**Alternatively, you can use this command `plugin` without installing the cli globally.

#### 基本工作流

安装完成后，您可以直接从操作系统命令行中调用CLI命令，使用 `options` 可执行文件。查看可用的 __INLINE_CODE_16__ 命令，请输入以下命令：

```typescript
@Module({
  providers: [LoggingPlugin],
})
export class CommonModule {}

```

 获取一个命令的详细帮助，请使用以下构造。将 __INLINE_CODE_17__、__INLINE_CODE_18__ 等命令替换 __INLINE_CODE_19__ 在示例中，以获取该命令的详细帮助：

```typescript
GraphQLModule.forRoot({
  // ...
  plugins: [ApolloServerOperationRegistry({ /* options */})]
}),

```

创建、构建和运行一个新的基本Nest项目，在开发模式下，请转到应该是您的新项目的父文件夹，然后运行以下命令：

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

在浏览器中，打开 __LINK_55__ 查看新的应用程序运行。应用程序将自动重新编译和重新加载，当您更改任何源文件时。

> 提示 **Hint**我们建议使用 __LINK_56__ 进行更快的构建（与默认的TypeScript编译器相比，性能提高了10倍）。

#### 项目结构

当您运行 __INLINE_CODE_20__ 时，Nest 生成一个基本的应用程序结构，创建一个新的文件夹并填充初始的文件集。您可以继续在这个默认结构中工作，添加新的组件，按本文档中的描述进行说明。我们将 __INLINE_CODE_21__ 生成的项目结构称为 **standard mode**。Nest 也支持另一个结构用于管理多个项目和库，称为 **monorepo mode**。

除了少数特定的考虑事项（主要是 monorepo 模式简化了 build 复杂性，可以避免 monorepo 风格项目结构中可能出现的复杂性），Nest 的其余功能和本文档中的内容都适用于标准和 monorepo 模式项目结构。事实上，您可以在任何时候轻松地从 standard 模式切换到 monorepo 模式，因此您可以安全地推迟这个决定，直到您了解 Nest。

您可以使用任何模式来管理多个项目。下面是一个快速概要：

（待续）| 功能                                       | 标准模式                                                      |  monorepo 模式                                              |
| ----------------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------- |
| 多个项目                                    | 单独的文件系统结构                                         | 单个文件系统结构                               |
| __INLINE_CODE_22__ & __INLINE_CODE_23__     | 单独的实例                                                 | 在 monorepo 中共享                                     |
| 默认编译器                                 | __INLINE_CODE_24__                                                              | webpack                                                    |
| 编译设置                                   | 分别指定                                               | monorepo 中的默认设置可以被每个项目override       |
| 配置文件 like __INLINE_CODE_25__, __INLINE_CODE_26__, etc. | 分别指定                                               | 在 monorepo 中共享                                     |
| __INLINE_CODE_27__ 和 __INLINE_CODE_28__ 命令                  | 目标默认自动设置为上下文中的唯一项目                 | 目标默认设置为 monorepo 中的 **默认项目** |
| 库                                       | 手动管理，通常通过 npm 打包                              | 内置支持，包括路径管理和捆绑                       |

请阅读 __LINK_58__ 和 __LINK_59__ 部分，以获取更多详细信息，以帮助您决定哪种模式最适合您。

__HTML_TAG_49____HTML_TAG_50__

#### CLI 命令语法

所有 __INLINE_CODE_29__ 命令都遵循相同的格式：

__CODE_BLOCK_4__

例如：

__CODE_BLOCK_5__

其中，__INLINE_CODE_30__ 是 _命令或别名_。__INLINE_CODE_31__ 命令具有别名 __INLINE_CODE_32__。__INLINE_CODE_33__ 是 _必需参数_。如果 _必需参数_ 未在命令行上提供，__INLINE_CODE_34__ 将提示输入。也具有等价的简写形式 __INLINE_CODE_36__。因此，上面的命令等效于以下命令：

__CODE_BLOCK_6__

大多数命令和一些选项都具有别名。尝试运行 __INLINE_CODE_37__ 以查看这些选项和别名，并确认上述构造的理解。

#### 命令概述

运行 __INLINE_CODE_38__ 可以查看每个命令的特定选项。

请查看 __LINK_60__以获取每个命令的详细描述。

| 命令    | 别名 | 描述                                                                                         |
| -------- | ----- | ------------------------------------------------------------------------------------------------ |
| __INLINE_CODE_39__      | __INLINE_CODE_40__   | 生成一个新的 _标准模式_ 应用程序，以便在无需运行时拥有所有必要文件。          |
| __INLINE_CODE_41__ | __INLINE_CODE_42__   | 生成和/或修改文件基于架构。                                                           |
| __INLINE_CODE_43__    |       | 将应用程序或工作区编译到输出文件夹。                                               |
| __INLINE_CODE_44__    |       | 编译并运行应用程序（或在工作区中的默认项目）。                           |
| __INLINE_CODE_45__      |       | 导入已经打包为 **nest 库** 的library，运行其安装架构。 |
| __INLINE_CODE_46__     | __INLINE_CODE_47__   | 显示关于安装的 nest 包和其他有用的系统信息。                           |

#### 需求

Nest CLI 需要 Node.js 二进制文件，使用 __LINK_61__ (ICU) 构建的，例如官方从 __LINK_62__ 发布的二进制文件。如果您遇到与 ICU 相关的错误，请检查您的二进制文件是否满足此要求。

__CODE_BLOCK_7__

如果命令打印 __INLINE_CODE_48__，您的 Node.js 二进制文件没有国际化支持。