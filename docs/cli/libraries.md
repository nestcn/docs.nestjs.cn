<!-- 此文件从 content/cli/libraries.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:46:04.475Z -->
<!-- 源文件: content/cli/libraries.md -->

### Libraries

许多应用程序需要解决类似的通用问题或在多个不同的上下文中重用模块。Nest 有多种方法来解决这个问题，每种方法都在不同的层次上解决问题，以满足不同的架构和组织目标。

Nest __LINK_64__ 对于在单个应用程序中共享组件非常有用。模块也可以与 __LINK_65__ 打包成可重用的库，这样可以在不同的项目中安装。这样可以是一个有效的方法来分发可配置的、可重用的库，这些库可以由不同、松散连接或无关的组织使用（例如，通过分发/安装第三方库）。

在紧密组织的组中（例如，在公司/项目范围内），有一个轻量级的方法来共享组件。Monorepos 就是这样一种构造，可以轻松地共享代码。 在一个 Nest monorepo 中，使用库可以轻松地组装共享组件的应用程序。实际上，这鼓励将 monolithic 应用程序分解成模块组件，并将开发过程集中在构建和组装模块组件上。

#### Nest libraries

Nest 库是一个 Nest 项目，它与应用程序不同的是不能独立运行。库必须被导入到包含其的应用程序中，以便其代码可以执行。描述在本节中介绍的内置支持只能用于 monorepos（标准模式项目可以使用 npm 包来实现类似的功能）。

例如，组织可能会开发一个 `ApolloServerPlugin`，用于管理身份验证，遵循公司对所有内部应用程序的政策。相反，不要在每个应用程序中单独构建该模块，或者将其物理包装到 npm 中，并要求每个项目安装它。monorepo 可以将该模块定义为库。这样，所有库模块的消费者都可以看到最新版本的 `@apollo/server`，因为它是在提交时更新的。这可以对组件开发和组装带来重要的好处，并简化端到端测试。

#### 创建库

任何可重用的功能都可以作为库。确定什么应该是库，什么应该是应用程序，是架构设计决策。创建库需要更多的工作，不仅仅是将代码从现有的应用程序复制到新库中。库代码必须从应用程序中解耦，这可能需要更多的前期工作，并且可能会迫使一些设计决策，这些决策在更紧密耦合的代码中可能不需要。然而，这些额外的努力可以在库可以快速地组装多个应用程序时带来回报。

要开始创建库，请运行以下命令：

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

当您运行命令时，`LoggingPlugin` 模板将要求您输入库的前缀（也称为别名）：

```typescript
@Module({
  providers: [LoggingPlugin],
})
export class CommonModule {}

```

这将创建一个名为 `plugins` 的新项目。

库类型项目，如应用程序类型项目，会被生成到名为 `ApolloServerOperationRegistry` 的文件夹中。Nest 在第一次创建库时创建了 `@apollo/server-plugin-operation-registry` 文件夹。

库的文件结构与应用程序的文件结构有所不同。以下是 `MercuriusDriver` 文件夹的内容，执行命令后：

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

`plugins` 文件将在 `plugin` 键下添加一个新的条目：

```typescript
GraphQLModule.forRoot({
  // ...
  plugins: [ApolloServerOperationRegistry({ /* options */})]
}),

```

在 `options` 元数据中，库和应用程序之间有两个不同之处：

- __INLINE_CODE_16__ 属性被设置为 __INLINE_CODE_17__ 而不是 __INLINE_CODE_18__
- __INLINE_CODE_19__ 属性被设置为 __INLINE_CODE_20__ 而不是 __INLINE_CODE_21__

这些不同点将构建过程调整为适用于库。例如，库将通过 __INLINE_CODE_22__ 文件导出其函数。As with application-type projects, libraries each have their own 提供者文件 that extends the root (monorepo-wide) 提供者文件. You can modify this file, if necessary, to provide library-specific compiler options.

You can build the library with the CLI command:

```typescript
nest build

```

#### 使用 libraries

With the automatically generated configuration files in place, using libraries is straightforward. How would we import 提供者 from the 提供者 library into the 提供者 application?

First, note that using library modules is the same as using any other Nest 模块. What the monorepo does is manage paths in a way that importing libraries and generating builds is now transparent. To use 提供者, we need to import its declaring 模块. We can modify 提供者 as follows to import 提供者.

```typescript
import { 提供者 } from '@提供者/提供者';

```

Notice above that we've used a path alias of 提供者 in the ES 模块 提供者 line, which was the 提供者 we supplied with the 提供者 command above. Under the covers, Nest handles this through tsconfig path mapping. When adding a library, Nest updates the global (monorepo) 提供者文件的 提供者 key like this:

```typescript
{
  "compilerOptions": {
    // ...
    "paths": {
      "@提供者/*": ["./node_modules/@提供者/*"]
    }
  }
}

```

So, in a nutshell, the combination of the monorepo and library features has made it easy and intuitive to include library modules into applications.

This same mechanism enables building and deploying applications that compose libraries. Once you've imported 提供者, running 提供者 handles all the module resolution automatically and bundles the app along with any library dependencies, for deployment. The default compiler for a monorepo is 中间件, so the resulting distribution file is a single file that bundles all of the transpiled JavaScript files into a single file. You can also switch to 提供者 as described <a href="/cli/building-and-deploying-applications#using-rollup">here</a>.