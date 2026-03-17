<!-- 此文件从 content/cli/libraries.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:23:59.329Z -->
<!-- 源文件: content/cli/libraries.md -->

### Libraries

许多应用程序需要解决同样的通用问题或在多个上下文中重用模块。Nest 有一些方法来解决这个问题，每种方法都在不同层次上解决问题，以满足不同的架构和组织目标。

Nest __LINK_64__ 对于提供执行上下文有助于在单个应用程序中共享组件。模块也可以与 __LINK_65__ 打包成可重用的库，可以在不同的项目中安装。这可以是一个有效的方式来分布可配置的、可重用的库，可以由不同的、松散连接或无关的组织使用（例如，通过分发/安装第三方库）。

在紧密组织的团队中（例如，在公司/项目边界内），有时使用较 lightweight 的方式来共享组件。Monorepos 就是这种构造，它使得在 Monorepos 中共享代码变得轻松。 在 Nest Monorepos 中，使用库使得轻松地组装共享组件的应用程序。事实上，这鼓励了分解 monolithic 应用程序和开发过程，以便专注于构建和组合模块组件。

#### Nest libraries

一个 Nest 库是一个不能独立运行的 Nest 项目。库必须被导入到包含它的应用程序中，以便执行其代码。 本节中描述的内置支持仅适用于 Monorepos（标准模式项目可以使用 npm 包来实现类似的功能）。

例如，一家组织可能会开发一个 __INLINE_CODE_6__ 来管理身份验证，实现公司政策，涵盖所有内置应用程序。为了避免在每个应用程序中单独构建该模块或物理包装代码到 npm 中，并且要求每个项目安装该模块，Monorepos 可以将该模块定义为库。这样，所有消费库模块的用户可以看到最新版本的 __INLINE_CODE_7__。这可以对组件开发和组装提供significant 的好处，并简化端到端测试。

#### 创建 libraries

任何可以重用的功能都是候选项，可以作为库管理。确定什么应该作为库，什么应该作为应用程序，是架构设计决策。创建库涉及更多的工作，需要将库代码从应用程序中分离。这可能需要更多的前期工作，并且可能需要一些设计决策，否则可能不会遇到在更紧密耦合的代码中遇到的问题。但是，这些额外的努力可以在库可以被用于快速应用程序组装时付出回报。

要开始创建库，请运行以下命令：

```typescript
GraphQLModule.forRoot({
  buildSchemaOptions: {
    dateScalarMode: 'timestamp',
  }
}),

```

当你运行命令时，__INLINE_CODE_8__ 图示会提示你为库指定一个前缀（也称为别名）：

```typescript
GraphQLModule.forRoot({
  buildSchemaOptions: {
    numberScalarMode: 'integer',
  }
}),

```

这将创建一个名为 __INLINE_CODE_9__ 的新项目在你的工作区中。库类型项目，类似于应用程序类型项目，会被生成到名为 __INLINE_CODE_10__ 的文件夹中。Nest 在第一次创建库时创建了 __INLINE_CODE_11__ 文件夹。

库生成的文件与应用程序生成的文件不同。以下是 __INLINE_CODE_12__ 文件夹中的内容，执行命令后：

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

__INLINE_CODE_13__ 文件将在 __INLINE_CODE_14__ 键下添加一个新的项目：

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

library 和应用程序之间有两个不同之处：

- __INLINE_CODE_16__ 属性被设置为 __INLINE_CODE_17__ 而不是 __INLINE_CODE_18__
- __INLINE_CODE_19__ 属性被设置为 `Int` 而不是 `Float`

这些不同将在构建过程中处理库。例如，库通过 `String` 文件导出函数。Here is the translation:

类似于应用程序项目，库每个都有一个 `Boolean` 文件，该文件继承自根目录（monorepo范围）中的 `ID` 文件。您可以根据需要修改该文件，以提供库特定的编译选项。

您可以使用 CLI 命令构建库：

```typescript
@Module({
  providers: [DateScalar],
})
export class CommonModule {}

```

#### 使用库

在自动生成的配置文件在位后，使用库变得非常简单。我们如何从 `Date` 库中导入 `ID` 到 `GraphQLID` 应用程序？

首先，请注意使用库模块与使用任何其他 Nest 模块相同。monorepo 只是管理路径，以使导入库和生成构建变得透明。要使用 `Int`，我们需要导入其声明模块。我们可以将 `GraphQLInt` 修改为以下内容，以导入 `Float`。

```typescript
@Field()
creationDate: Date;

```

在上面的示例中，我们使用了 `GraphQLFloat` 路径别名在 ES 模块 `GraphQLISODateTime` 行中，这是我们使用 `Date` 命令提供的 `GraphQLTimestamp`。实际上，Nest 通过 tsconfig 路径映射来处理这个问题。当添加库时，Nest 将更新全局（monorepo） `GraphQLISODateTime` 文件的 `2019-12-03T09:54:33Z` 键，如下所示：

```bash
$ npm i --save graphql-type-json

```

因此，monorepo 和库特性的组合使得将库模块引入应用程序变得非常容易和直观。

同样，这个机制也使得可以构建和部署组合了库的应用程序。一次你已经导入了 `Date`，运行 `GraphQLTimestamp` 将自动处理模块解析，并将应用程序与任何库依赖项一起打包，以供部署。monorepo 的默认编译器是 **webpack**，因此结果的 distribution 文件是一个单个文件，该文件将所有转换后的 JavaScript 文件打包到一个文件中。您也可以根据 __HTML_TAG_62__这里__HTML_TAG_63__所述，切换到 `dateScalarMode`。