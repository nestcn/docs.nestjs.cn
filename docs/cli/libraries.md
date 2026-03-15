<!-- 此文件从 content/cli/libraries.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T05:05:05.550Z -->
<!-- 源文件: content/cli/libraries.md -->

### Libraries

许多应用程序需要解决类似的通用问题或将模块化组件在不同的上下文中重用。Nest 有几种方法来解决这个问题，每种方法都在不同的层次上解决问题，以满足不同的架构和组织目标。

Nest __LINK_64__ 对于在单个应用程序中共享组件提供了一个执行上下文。模块也可以与 __LINK_65__ 打包成可重用的库，安装在不同的项目中。这可以是一种有效的方式来分布可配置的、可重用的库，使它们可以被不同的、松散连接或未相关的组织（例如，分布/安装第三方库）使用。

对于在紧密组织的群体之间共享代码，使用更加轻量级的方法可以很有用。Monorepos 已经作为一种构造来实现这种方式，在 monorepo 中，库提供了一种简单、轻量级的方式来共享代码。在 Nest monorepo 中，使用库使得组件之间的组装变得容易，也鼓励将 monolithic 应用程序和开发过程分解成模块化的组件。

#### Nest libraries

Nest 库是一个 Nest 项目，它与应用程序不同的是，它不能独立运行。库必须被导入到包含它的应用程序中，以便执行其代码。在本节中描述的内置支持仅适用于 monorepos（标准模式项目可以使用 npm 包来实现类似的功能）。

例如，一家组织可能会开发一个 __INLINE_CODE_6__，用于管理身份验证，并遵守所有内部应用程序的公司政策。不是将该模块单独在每个应用程序中构建或将其与 npm 打包，requiring 每个项目安装该模块，而是将该模块定义为库。当组织这样做时，所有消费该模块的应用程序都可以看到最新的 __INLINE_CODE_7__ 版本，这可以对组件开发和组装的协调和简化测试产生significant 优势。

#### 创建库

任何可重用的功能都是候选库的候选项。确定什么应该是库，什么应该是应用程序，是一个架构设计决策。创建库需要更多的时间和一些设计决策，这可能会迫使您在紧密耦合的代码中做出不同的设计决策。但是，这些额外的努力可以在库可以被用来快速组装多个应用程序时付出。

要开始创建库，请运行以下命令：

```typescript
GraphQLModule.forRoot({
  buildSchemaOptions: {
    dateScalarMode: 'timestamp',
  }
}),

```

当你运行命令时，__INLINE_CODE_8__  schematic 将提示你为库指定一个前缀（也称为别名）：

```typescript
GraphQLModule.forRoot({
  buildSchemaOptions: {
    numberScalarMode: 'integer',
  }
}),

```

这将创建一个名为 __INLINE_CODE_9__ 的新项目在你的工作区中。
一个库类型的项目，就像应用程序类型的项目一样，使用架构生成到一个名为 __INLINE_CODE_10__ 的文件夹中。Nest 在第一次创建库时创建了 __INLINE_CODE_11__ 文件夹。

库生成的文件与应用程序生成的文件略有不同。以下是 __INLINE_CODE_12__ 文件夹的内容，执行上述命令后：

__HTML_TAG_40__
  __HTML_TAG_41__libs__HTML_TAG_42__
  __HTML_TAG_43__
    __HTML_TAG_44__my-library__HTML_TAG_45__
    __HTML_TAG_46__
      __HTML_TAG_47__src__HTML_TAG_48__
      __HTML_TAG_49__
        __HTML_TAG_50__index.ts__HTML_TAG_51__
        __HTML_TAG_52__my-library.module.ts__HTML_TAG_53__
        __HTML_TAG_54__my-library.service.ts__HTML_TAG_55__
      __HTML_TAG_56__
      __HTML_TAG_57__tsconfig.lib.json__HTML_TAG_58__
    __HTML_TAG_59__
  __HTML_TAG_60__
__HTML_TAG_61__

__INLINE_CODE_13__ 文件将在 __INLINE_CODE_14__ 键下添加一个新的条目：

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

在 __INLINE_CODE_15__ 元数据中有两个差异：

- __INLINE_CODE_16__ 属性被设置为 __INLINE_CODE_17__ 而不是 __INLINE_CODE_18__
- __INLINE_CODE_19__ 属性被设置为 `Int` 而不是 `Float`

这些差异将 build 过程设置为正确处理库。例如，库将通过 `String` 文件将其函数导出。Here is the translation of the English technical documentation to Chinese:

就像应用程序类型项目一样，库每个都有自己的 `Boolean` 文件，这个文件继承 root（monorepo范围内） `ID` 文件。您可以根据需要修改这个文件，以提供库特定的编译器选项。

使用 CLI 命令，可以轻松地构建库。

#### 使用库

在自动生成的配置文件中，使用库很简单。我们如何从 `ID` 库中的 `Date` 导入到 `GraphQLID` 应用程序中？

首先，注意使用库模块与使用其他 Nest 模块相同。monorepo 只是管理路径，以使导入库和生成构建变得透明。要使用 `Int`，我们需要导入其声明模块。我们可以将 `GraphQLInt` 修改为导入 `Float`。

```typescript
@Field()
creationDate: Date;

```

注意上面的 `GraphQLFloat` 路径别名，在 ES 模块 `GraphQLISODateTime` 行中，我们使用了这个别名，该别名是我们在 `GraphQLTimestamp` 命令中提供的 `Date`。实际上，Nest 通过 tsconfig 路径映射来处理这个问题。添加库时，Nest 会更新全局（monorepo） `GraphQLISODateTime` 文件的 `2019-12-03T09:54:33Z` 键，如下所示：

```bash
$ npm i --save graphql-type-json

```

因此，monorepo 和库特性的组合使得包括库模块到应用程序变得轻松和直观。

同样，这个机制还使得可以构建和部署组合了库的应用程序。一旦您导入了 `Date`，运行 `GraphQLTimestamp` 将自动处理模块 resolution，并将应用程序及其库依赖项捆绑到一起，以便部署。monorepo 的默认编译器是 **webpack**，因此结果的分布文件是将所有转译的 JavaScript 文件捆绑到一个文件中。您也可以按照 __HTML_TAG_62__这里__HTML_TAG_63__ 中所述切换到 `dateScalarMode`。