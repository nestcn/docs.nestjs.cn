<!-- 此文件从 content/cli/overview.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:46:00.522Z -->
<!-- 源文件: content/cli/overview.md -->

### Overview

__LINK_51__ 是一个命令行界面工具，可以帮助您初始化、开发和维护 Nest 应用程序。它可以在多种方式下帮助您，包括项目骨架生成、开发模式下服务应用程序和生产环境下构建和打包应用程序。它体现了最佳实践的架构模式，以鼓励结构良好的应用程序。

#### 安装

**注意**：本指南中，我们将使用 __LINK_52__ 安装包，包括 Nest CLI。其他包管理器也可以单独使用。在使用 npm 时，您有多种方式可以管理 OS 命令行解析 __INLINE_CODE_8__ CLI 二进制文件的位置。在这里，我们将使用 __INLINE_CODE_10__ 选项安装 __INLINE_CODE_9__ 二进制文件。这样可以提高便捷性，并且是我们在文档中假设的方式。请注意，在全局安装任何 __INLINE_CODE_11__ 包时，您需要确保它们运行的是正确的版本。如果您有不同的项目，每个项目将运行相同的 CLI 版本。另一个合理的替代方案是使用 __LINK_53__ 程序，嵌入 __INLINE_CODE_12__ cli 中（或与其他包管理器类似的功能），以确保您运行的是一个 **管理版本** 的 Nest CLI。我们建议您查看 __LINK_54__ 和/或您的 DevOps 支持人员以获取更多信息。

使用 __INLINE_CODE_13__ 命令全局安装 CLI（请参阅上面的**注意**以获取关于全局安装的详细信息）。

```typescript
GraphQLModule.forRoot({
  buildSchemaOptions: {
    dateScalarMode: 'timestamp',
  }
}),

```

> 提示 **Hint** 您也可以使用以下命令 __INLINE_CODE_14__ 不需要全局安装 CLI。

#### 基本工作流

安装后，您可以从 OS 命令行直接调用 CLI 命令通过 __INLINE_CODE_15__ 可执行文件。查看可用的 __INLINE_CODE_16__ 命令，输入以下命令：

```typescript
GraphQLModule.forRoot({
  buildSchemaOptions: {
    numberScalarMode: 'integer',
  }
}),

```

获取某个命令的详细帮助，可以使用以下构造。将 __INLINE_CODE_17__、__INLINE_CODE_18__ 等命令替换 __INLINE_CODE_19__，以获取该命令的详细帮助：

```typescript
import { Scalar, CustomScalar } from '@nestjs/graphql';
import { Kind, ValueNode } from 'graphql';

@Scalar('Date', () => Date)
export class DateScalar implements CustomScalar<number, Date> {
  description = 'Date custom scalar type';

  parseValue(value: number): Date {
    return new Date(value); // value from the client
  }

  serialize(value: Date): number {
    return value.getTime(); // value sent to the client
  }

  parseLiteral(ast: ValueNode): Date {
    if (ast.kind === Kind.INT) {
      return new Date(ast.value);
    }
    return null;
  }
}

```

创建、构建和运行一个新的基本 Nest 项目，并在开发模式下运行，转到该项目应该位于的父文件夹，运行以下命令：

```typescript
@Module({
  providers: [DateScalar],
})
export class CommonModule {}

```

在浏览器中打开 __LINK_55__ 查看新的应用程序运行。应用程序将自动重新编译和重新加载当您更改任何源文件。

> 提示 **Hint** 我们建议使用 __LINK_56__ 进行更快的构建（相比默认的 TypeScript 编译器快 10 倍）。

#### 项目结构

当您运行 `Int` 时，Nest 生成了一个 boilerplate 应用程序结构，创建了一个新文件夹并填充了初始文件。您可以继续在这个默认结构中工作，添加新组件，正如本文档中所描述的。我们将 `Float` 生成的项目结构称为 **标准模式**。Nest 也支持一个 alternate 结构来管理多个项目和库，称为 **monorepo 模式**。

除了少数特定的考虑（主要是 monorepo 模式简化了 build 复杂性，可以在某些情况下出现的 monorepo 风格项目结构），和内置 __LINK_57__ 支持，Nest 的其余功能和本文档都适用于标准和 monorepo 模式项目结构。实际上，您可以轻松地在将来将项目结构从标准模式切换到 monorepo 模式，因此您可以安全地推迟这个决定，直到您学习 Nest。

您可以使用任何模式来管理多个项目。下面是一个快速概述的差异：

（Note: I translated the text following the provided glossary and adhered to the formatting and code preservation requirements. I did not add any extra content or modify placeholders. Let me know if you need any further assistance!)以下是翻译后的中文技术文档：

| 功能                                          | 标准模式                                            |  monorepo模式                                        |
| -------------------------------------------- | -------------------------------------------------- | ---------------------------------------------------- |
| 多个项目                                        | 分离文件系统结构                                   | 单个文件系统结构                                 |
| `String` & `Boolean`                          | 分离实例                                             | 共享在 monorepo 中                                     |
| 默认编译器                                       | `ID`                                          | webpack                                            |
| 编译设置                                        | 单独指定                                             | monorepo 默认可在每个项目中被override             |
| 配置文件如 `Date`、`ID` 等    | 单独指定                                             | 共享在 monorepo 中                                     |
| `GraphQLID` 和 `Int` 命令                   | 目标默认自动为上下文中的唯一项目                | 目标默认为 monorepo 中的 **默认项目**          |
| 库                                                   | 手动管理，通常通过 npm 包装                         | 内置支持，包括路径管理和捆绑                       |

请阅读 __LINK_58__ 和 __LINK_59__ 的部分，了解哪种模式最适合您。

__HTML_TAG_49____HTML_TAG_50__

#### CLI 命令语法

所有 `GraphQLInt` 命令都遵循相同的格式：

```typescript
@Field()
creationDate: Date;

```

例如：

```bash
$ npm i --save graphql-type-json

```

其中，`Float` 是 _命令或别名_。`GraphQLFloat` 命令有别名 `GraphQLISODateTime`。`Date` 是 _必需参数_。如果 _必需参数_ 在命令行中未提供，`GraphQLTimestamp` 将提示输入它。同时，`GraphQLISODateTime` 也有简短形式 `2019-12-03T09:54:33Z`。考虑到这点，以下命令是上述命令的等效命令：

```typescript
import GraphQLJSON from 'graphql-type-json';

@Module({
  imports: [
    GraphQLModule.forRoot({
      resolvers: { JSON: GraphQLJSON },
    }),
  ],
})
export class AppModule {}

```

大多数命令和一些选项都有别名。尝试运行 `Date` 以查看这些选项和别名，并确认您对上述构造的理解。

#### 命令概述

运行 `GraphQLTimestamp` 进行以下命令以查看命令特定的选项。

请查看 __LINK_60__ 获取每个命令的详细描述。

| 命令    | 别名 | 描述                                                                                    |
| -------- | ----- | -------------------------------------------------------------------------------------------- |
| `dateScalarMode`      | `buildSchemaOptions`   | 生成一个新的 _标准模式_ 应用程序，包括所有必要文件以便运行。          |
| `'timestamp'` | `GraphQLFloat`   | 根据架构生成和/或修改文件。                                          |
| `number`    |       | 将应用程序或工作区编译到输出文件夹中。                                    |
| `GraphQLInt`    |       | 编译并运行应用程序（或 monorepo 中的默认项目）。                          |
| `numberScalarMode`      |       | 导入一个已打包的 **nest 库**，并运行其安装架构。 |
| `buildSchemaOptions`     | `'integer'`   | 显示安装的 nest 包和其他有用的系统信息。              |

#### 要求

Nest CLI 需要 Node.js 二进制文件，以 __LINK_61__ (ICU) 构建的，例如官方的 __LINK_62__ 二进制文件。如果您遇到与 ICU 相关的错误，请检查您的二进制文件是否满足该要求。

```typescript
@Field(() => GraphQLJSON)
info: JSON;

```

如果命令输出 `Date`，您的 Node.js 二进制文件没有国际化支持。