## 利用 TypeScript & GraphQL 的强大功能

[GraphQL](https://graphql.org/) 是一种强大的 API 查询语言和用于使用现有数据实现这些查询的运行时。这是一种优雅的方法，可以解决 REST API 中常见的许多问题。对于背景知识，我们建议阅读这篇 [GraphQL 与 REST 的比较](https://www.apollographql.com/blog/graphql-vs-rest)。GraphQL 与 [TypeScript](https://www.typescriptlang.org/) 结合使用有助于您使用 GraphQL 查询开发更好的类型安全性，为您提供端到端的类型。

在本章中，我们假设您对 GraphQL 有基本的了解，并专注于如何使用内置的 `@nestjs/graphql` 模块。`GraphQLModule` 可以配置为使用 [Apollo](https://www.apollographql.com/) 服务器（使用 `@nestjs/apollo` 驱动程序）和 [Mercurius](https://github.com/mercurius-js/mercurius)（使用 `@nestjs/mercurius`）。我们为这些成熟的 GraphQL 包提供官方集成，以提供一种简单的方式在 Nest 中使用 GraphQL（在此处查看更多集成 [/graphql/quick-start#third-party-integrations]）。

您也可以构建自己的专用驱动程序（在此处阅读更多 [/graphql/other-features#creating-a-custom-driver]）。

#### 安装

首先安装所需的包：

```bash
# 对于 Express 和 Apollo（默认）
$ npm i @nestjs/graphql @nestjs/apollo @apollo/server @as-integrations/express5 graphql

# 对于 Fastify 和 Apollo
# npm i @nestjs/graphql @nestjs/apollo @apollo/server @as-integrations/fastify graphql

# 对于 Fastify 和 Mercurius
# npm i @nestjs/graphql @nestjs/mercurius graphql mercurius

```

:::warning 警告
`@nestjs/graphql@>=9` 和 `@nestjs/apollo^10` 包与 **Apollo v3** 兼容（查看 Apollo Server 3 [迁移指南](https://www.apollographql.com/docs/apollo-server/migration/) 了解更多详情），而 `@nestjs/graphql@^8` 仅支持 **Apollo v2**（例如，`apollo-server-express@2.x.x` 包）。
:::

#### 概述

Nest 提供了两种构建 GraphQL 应用程序的方法：**代码优先**和**模式优先**方法。您应该选择最适合您的方法。本 GraphQL 部分的大多数章节分为两个主要部分：一个是如果您采用**代码优先**方法应该遵循的部分，另一个是如果您采用**模式优先**方法应该使用的部分。

在**代码优先**方法中，您使用装饰器和 TypeScript 类来生成相应的 GraphQL 模式。如果您更喜欢专门使用 TypeScript 并避免在语言语法之间切换上下文，这种方法很有用。

在**模式优先**方法中，数据源是 GraphQL SDL（模式定义语言）文件。SDL 是一种语言无关的方式，可以在不同平台之间共享模式文件。Nest 根据 GraphQL 模式自动生成 TypeScript 定义（使用类或接口），以减少编写冗余样板代码的需要。

<app-banner-courses-graphql-cf></app-banner-courses-graphql-cf>

#### 开始使用 GraphQL & TypeScript

:::info 提示
在以下章节中，我们将集成 `@nestjs/apollo` 包。如果您想使用 `mercurius` 包，请导航到 [本节](/graphql/quick-start#mercurius-集成)。
:::

安装包后，我们可以导入 `GraphQLModule` 并使用 `forRoot()` 静态方法配置它。

```typescript
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
    }),
  ],
})
export class AppModule {}

```

:::info 提示
对于 `mercurius` 集成，您应该使用 `MercuriusDriver` 和 `MercuriusDriverConfig` 代替。两者都从 `@nestjs/mercurius` 包中导出。
:::

`forRoot()` 方法接受一个选项对象作为参数。这些选项被传递给底层驱动程序实例（阅读更多关于可用设置：[Apollo](https://www.apollographql.com/docs/apollo-server/api/apollo-server) 和 [Mercurius](https://github.com/mercurius-js/mercurius/blob/master/docs/api/options.md#plugin-options)）。例如，如果您想禁用 `playground` 并关闭 `debug` 模式（对于 Apollo），传递以下选项：

```typescript
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      playground: false,
    }),
  ],
})
export class AppModule {}

```

在这种情况下，这些选项将被转发到 `ApolloServer` 构造函数。

#### GraphQL  playground

playground 是一个图形化、交互式、浏览器内的 GraphQL IDE，默认情况下在与 GraphQL 服务器本身相同的 URL 上可用。要访问 playground，您需要配置并运行基本的 GraphQL 服务器。要现在查看它，您可以安装并构建 [此处的工作示例](https://github.com/nestjs/nest/tree/master/sample/23-graphql-code-first)。或者，如果您按照这些代码示例进行操作，一旦完成 [解析器章节](/graphql/resolvers-map) 中的步骤，您就可以访问 playground。

有了这个，并且您的应用程序在后台运行，您可以打开 Web 浏览器并导航到 `http://localhost:3000/graphql`（主机和端口可能因您的配置而异）。然后您将看到 GraphQL playground，如下所示。

<figure>
  <img src="/assets/playground.png" alt="" />
</figure>

:::info 注意
`@nestjs/mercurius` 集成没有内置的 GraphQL Playground 集成。相反，您可以使用 [GraphiQL](https://github.com/graphql/graphiql)（设置 `graphiql: true`）。
:::

:::warning 警告
更新（2025 年 4 月 14 日）：默认的 Apollo playground 已被弃用，并将在下次主要版本中移除。相反，您可以使用 [GraphiQL](https://github.com/graphql/graphiql)，只需在 `GraphQLModule` 配置中设置 `graphiql: true`，如下所示：

```typescript
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  graphiql: true,
}),

```

如果您的应用程序使用 [订阅](/graphql/subscriptions)，请确保使用 `graphql-ws`，因为 GraphiQL 不支持 `subscriptions-transport-ws`。
:::

#### 代码优先

在**代码优先**方法中，您使用装饰器和 TypeScript 类来生成相应的 GraphQL 模式。

要使用代码优先方法，首先在选项对象中添加 `autoSchemaFile` 属性：

```typescript
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
}),

```

`autoSchemaFile` 属性值是将创建自动生成的模式的路径。或者，模式可以在内存中动态生成。要启用此功能，将 `autoSchemaFile` 属性设置为 `true`：

```typescript
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  autoSchemaFile: true,
}),

```

默认情况下，生成的模式中的类型将按照它们在包含的模块中定义的顺序排列。要按字典顺序排序模式，将 `sortSchema` 属性设置为 `true`：

```typescript
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
  sortSchema: true,
}),

```

#### 示例

完整的代码优先示例可在此处找到 [这里](https://github.com/nestjs/nest/tree/master/sample/23-graphql-code-first)。

#### 模式优先

要使用模式优先方法，首先在选项对象中添加 `typePaths` 属性。`typePaths` 属性指示 `GraphQLModule` 应该在哪里查找您将编写的 GraphQL SDL 模式定义文件。这些文件将在内存中组合；这允许您将模式拆分为多个文件并将它们定位在其解析器附近。

```typescript
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  typePaths: ['./**/*.graphql'],
}),

```

您通常还需要具有与 GraphQL SDL 类型相对应的 TypeScript 定义（类和接口）。手动创建相应的 TypeScript 定义是多余且繁琐的。这使我们没有单一的事实来源 - 在 SDL 中进行的每个更改都迫使我们也调整 TypeScript 定义。为了解决这个问题，`@nestjs/graphql` 包可以**自动生成**来自抽象语法树（[AST](https://en.wikipedia.org/wiki/Abstract_syntax_tree)）的 TypeScript 定义。要启用此功能，在配置 `GraphQLModule` 时添加 `definitions` 选项属性。

```typescript
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  typePaths: ['./**/*.graphql'],
  definitions: {
    path: join(process.cwd(), 'src/graphql.ts'),
  },
}),

```

`definitions` 对象的 path 属性指示在哪里保存生成的 TypeScript 输出。默认情况下，所有生成的 TypeScript 类型都创建为接口。要生成类，请指定 `outputAs` 属性，值为 `'class'`。

```typescript
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  typePaths: ['./**/*.graphql'],
  definitions: {
    path: join(process.cwd(), 'src/graphql.ts'),
    outputAs: 'class',
  },
}),

```

上述方法在应用程序每次启动时动态生成 TypeScript 定义。或者，构建一个简单的脚本来按需生成这些定义可能更可取。例如，假设我们创建以下脚本作为 `generate-typings.ts`：

```typescript
import { GraphQLDefinitionsFactory } from '@nestjs/graphql';
import { join } from 'node:path';

const definitionsFactory = new GraphQLDefinitionsFactory();
definitionsFactory.generate({
  typePaths: ['./src/**/*.graphql'],
  path: join(process.cwd(), 'src/graphql.ts'),
  outputAs: 'class',
});

```

现在您可以按需运行此脚本：

```bash
$ ts-node generate-typings

```

:::info 提示
您可以预先编译脚本（例如，使用 `tsc`）并使用 `node` 执行它。
:::

要为脚本启用监视模式（以便在任何 `.graphql` 文件更改时自动生成类型），将 `watch` 选项传递给 `generate()` 方法。

```typescript
definitionsFactory.generate({
  typePaths: ['./src/**/*.graphql'],
  path: join(process.cwd(), 'src/graphql.ts'),
  outputAs: 'class',
  watch: true,
});

```

要为每个对象类型自动生成额外的 `__typename` 字段，启用 `emitTypenameField` 选项：

```typescript
definitionsFactory.generate({
  // ...
  emitTypenameField: true,
});

```

要将解析器（查询、变更、订阅）生成为没有参数的普通字段，启用 `skipResolverArgs` 选项：

```typescript
definitionsFactory.generate({
  // ...
  skipResolverArgs: true,
});

```

要将枚举生成为 TypeScript 联合类型而不是常规 TypeScript 枚举，将 `enumsAsTypes` 选项设置为 `true`：

```typescript
definitionsFactory.generate({
  // ...
  enumsAsTypes: true,
});

```

#### Apollo Sandbox

要使用 [Apollo Sandbox](https://www.apollographql.com/blog/announcement/platform/apollo-sandbox-an-open-graphql-ide-for-local-development/) 而不是 `graphql-playground` 作为本地开发的 GraphQL IDE，请使用以下配置：

```typescript
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      playground: false,
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
    }),
  ],
})
export class AppModule {}

```

#### 示例

完整的模式优先示例可在此处找到 [这里](https://github.com/nestjs/nest/tree/master/sample/12-graphql-schema-first)。

#### 访问生成的模式

在某些情况下（例如端到端测试），您可能希望获取对生成的模式对象的引用。在端到端测试中，您可以使用 `graphql` 对象运行查询，而不使用任何 HTTP 监听器。

您可以使用 `GraphQLSchemaHost` 类访问生成的模式（在代码优先或模式优先方法中）：

```typescript
const { schema } = app.get(GraphQLSchemaHost);

```

:::info 提示
您必须在应用程序初始化后（在通过 `app.listen()` 或 `app.init()` 方法触发 `onModuleInit` 钩子之后）调用 `GraphQLSchemaHost#schema` getter。
:::

#### 异步配置

当您需要异步传递模块选项而不是静态传递时，请使用 `forRootAsync()` 方法。与大多数动态模块一样，Nest 提供了几种处理异步配置的技术。

一种技术是使用工厂函数：

```typescript
 GraphQLModule.forRootAsync<ApolloDriverConfig>({
  driver: ApolloDriver,
  useFactory: () => ({
    typePaths: ['./**/*.graphql'],
  }),
}),

```

与其他工厂提供者一样，我们的工厂函数可以是 <a href="/fundamentals/dependency-injection#factory-providers-usefactory">异步的</a>，并且可以通过 `inject` 注入依赖项。

```typescript
GraphQLModule.forRootAsync<ApolloDriverConfig>({
  driver: ApolloDriver,
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => ({
    typePaths: configService.get<string>('GRAPHQL_TYPE_PATHS'),
  }),
  inject: [ConfigService],
}),

```

或者，您可以使用类而不是工厂来配置 `GraphQLModule`，如下所示：

```typescript
GraphQLModule.forRootAsync<ApolloDriverConfig>({
  driver: ApolloDriver,
  useClass: GqlConfigService,
}),

```

上面的构造在 `GraphQLModule` 内部实例化 `GqlConfigService`，使用它来创建选项对象。请注意，在此示例中，`GqlConfigService` 必须实现 `GqlOptionsFactory` 接口，如下所示。`GraphQLModule` 将调用所提供类的实例化对象上的 `createGqlOptions()` 方法。

```typescript
@Injectable()
class GqlConfigService implements GqlOptionsFactory {
  createGqlOptions(): ApolloDriverConfig {
    return {
      typePaths: ['./**/*.graphql'],
    };
  }
}

```

如果您想重用现有的选项提供者而不是在 `GraphQLModule` 内部创建私有副本，请使用 `useExisting` 语法。

```typescript
GraphQLModule.forRootAsync<ApolloDriverConfig>({
  imports: [ConfigModule],
  useExisting: ConfigService,
}),

```

#### Mercurius 集成

Fastify 用户（在此处阅读更多 [/techniques/performance]）可以替代使用 `@nestjs/mercurius` 驱动程序，而不是使用 Apollo。

```typescript
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { MercuriusDriver, MercuriusDriverConfig } from '@nestjs/mercurius';

@Module({
  imports: [
    GraphQLModule.forRoot<MercuriusDriverConfig>({
      driver: MercuriusDriver,
      graphiql: true,
    }),
  ],
})
export class AppModule {}

```

:::info 提示
应用程序运行后，打开浏览器并导航到 `http://localhost:3000/graphiql`。您应该看到 [GraphQL IDE](https://github.com/graphql/graphiql)。
:::

`forRoot()` 方法接受一个选项对象作为参数。这些选项被传递给底层驱动程序实例。在此处阅读更多关于可用设置 [这里](https://github.com/mercurius-js/mercurius/blob/master/docs/api/options.md#plugin-options)。

#### 多个端点

`@nestjs/graphql` 模块的另一个有用功能是能够同时提供多个端点。这让您可以决定哪些模块应该包含在哪个端点中。默认情况下，`GraphQL` 在整个应用程序中搜索解析器。要将此扫描限制为仅模块的子集，请使用 `include` 属性。

```typescript
GraphQLModule.forRoot({
  include: [CatsModule],
}),

```

:::warning 警告
如果您在单个应用程序中使用 `@apollo/server` 和 `@as-integrations/fastify` 包以及多个 GraphQL 端点，请确保在 `GraphQLModule` 配置中启用 `disableHealthCheck` 设置。
:::

#### 第三方集成

- [GraphQL Yoga](https://github.com/dotansimha/graphql-yoga)

#### 示例

工作示例可在此处找到 [这里](https://github.com/nestjs/nest/tree/master/sample/33-graphql-mercurius)。
