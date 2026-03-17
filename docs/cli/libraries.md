<!-- 此文件从 content/cli/libraries.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T04:51:05.988Z -->
<!-- 源文件: content/cli/libraries.md -->

### Libraries

许多应用程序需要解决同样的通用问题，或者在几个不同的上下文中重用模块。Nest 有几种方法来解决这个问题，每种方法都在不同的层次上解决问题，以满足不同的架构和组织目标。

Nest 的 __LINK_64__ 对于在单个应用程序中共享组件提供了执行上下文。模块还可以与 __LINK_65__ 打包在一起，创建可重用的库，这个库可以在不同的项目中安装。这可以是一个有效的方式来分布可配置的、可重用的库，让不同的、松散连接或独立的组织（例如，分发/install 3rd party 库）使用。

在分享代码时，在紧密组织的团队（例如，公司/项目边界）中可以使用更轻量级的方法。Monorepos 已经出现了，以便实现这种方法，而在 monorepo 中，一个 **library** 提供了一种简单、轻量级的方式来共享代码。在 Nest monorepo 中，使用库使得 easy 组装应用程序共享组件的事实鼓励了 monolithic 应用程序的分解和开发过程的重心是建立和组合模块组件。

#### Nest libraries

Nest 库是一个不能单独运行的 Nest 项目。库必须被导入包含它的应用程序，以便执行其代码。描述在本节中描述的内置支持只能在 **monorepos** 中工作（标准模式项目可以使用 npm 包来实现类似的功能）。

例如，一个组织可能会开发一个 __INLINE_CODE_6__，用于管理身份验证，遵循公司政策，以便所有内部应用程序使用。相反，不要在每个应用程序中单独构建该模块，或者将代码与 npm 打包，要求每个项目安装该模块。monorepo 可以将该模块定义为库。这样，所有消费该模块的库都可以看到最新的 __INLINE_CODE_7__ 版本，因为它是提交的。这可以对组件开发和组装提供有意义的优势，并简化端到端测试。

#### 创建 libraries

任何可重用的功能都是library候选项。决定什么应该是library，什么应该是应用程序，是一个架构设计决策。创建库涉及更多的工作，不仅仅是从现有应用程序复制代码。在打包为库时，库代码必须从应用程序中解耦。这可能需要更多的前期工作，并且可能需要一些设计决策，这些决策可能不会遇到与更紧密耦合的代码一样。但是，这些额外的工作可以在库可以用来快速组装多个应用程序时带来回报。

要开始创建库，请运行以下命令：

```typescript
GraphQLModule.forRoot({
  buildSchemaOptions: {
    dateScalarMode: 'timestamp',
  }
}),

```

当你运行命令时，__INLINE_CODE_8__  schematic 将提示你为库指定一个前缀（也就是别名）：

```typescript
GraphQLModule.forRoot({
  buildSchemaOptions: {
    numberScalarMode: 'integer',
  }
}),

```

这创建了一个名为 __INLINE_CODE_9__ 的新项目。
一个library 类型的项目，像应用程序类型的项目一样，会被生成到名为 __INLINE_CODE_10__ 的文件夹下。Nest 在第一次创建库时创建了 __INLINE_CODE_11__ 文件夹。

library 生成的文件与应用程序生成的文件略有不同。下面是在执行命令后 __INLINE_CODE_12__ 文件夹的内容：

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

__INLINE_CODE_13__ 文件将在 __INLINE_CODE_14__ 键下添加一个新的入口：

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

library 和应用程序之间有两个 __INLINE_CODE_15__ 元数据的不同：

- __INLINE_CODE_16__ 属性设置为 __INLINE_CODE_17__ 而不是 __INLINE_CODE_18__
- __INLINE_CODE_19__ 属性设置为 `Int` 而不是 `Float`

这些不同将 build 过程键到库的处理上。例如，库通过 `String` 文件导出函数。Here is the translation:

类似于应用程序类型项目，库每个都有自己的`Boolean`文件，这个文件继承了根目录（monorepo-wide）`ID`文件。您可以根据需要修改这个文件，以提供库特定的编译选项。

可以使用 CLI 命令来构建库：

```typescript
@Module({
  providers: [DateScalar],
})
export class CommonModule {}

```

#### 使用库

使用自动生成的配置文件后，使用库变得简单了。我们如何从`ID`库的`Date`中导入到`GraphQLID`应用程序中？

首先，我们需要注意的是，使用库模块与使用任何其他 Nest 模块相同。monorepo 只是管理路径，以便在导入库时生成构建变得透明。要使用`Int`，我们需要导入其声明模块。我们可以将`GraphQLInt`修改为以下内容，以导入`Float`。

```typescript
@Field()
creationDate: Date;

```

请注意，我们在 ES 模块`GraphQLISODateTime`中使用了`GraphQLFloat`路径别名，这是我们在`GraphQLTimestamp`命令中提供的`Date`。实际上，Nest 使用 tsconfig 路径映射来处理这个问题。当添加库时，Nest 会更新全局（monorepo）`GraphQLISODateTime`文件的`2019-12-03T09:54:33Z`键，如以下所示：

```bash
$ npm i --save graphql-type-json

```

因此，monorepo 和库特性组合使得包含库模块到应用程序变得简单和直观。

这个机制还使得构建和部署可以组合库的应用程序变得简单。一旦您已导入`Date`，运行`GraphQLTimestamp`将自动处理模块解析，并将应用程序及其库依赖项打包到一起，以便部署。默认的编译器为**webpack**，因此生成的分布文件是一个单个文件，包含了所有转换后的 JavaScript 文件。您还可以将其更改为`dateScalarMode`，如所述__HTML_TAG_62__这里__HTML_TAG_63__。