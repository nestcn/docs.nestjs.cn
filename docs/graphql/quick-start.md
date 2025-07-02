## 充分发挥 TypeScript 与 GraphQL 的强大能力

[GraphQL](https://graphql.org/) 是一种强大的 API 查询语言，也是一个运行时环境，用于使用现有数据满足这些查询需求。它采用优雅的方式解决了 REST API 常见的诸多问题。作为背景知识，我们建议阅读这篇关于 GraphQL 与 REST 的[对比分析](https://www.apollographql.com/blog/graphql-vs-rest) 。将 GraphQL 与 [TypeScript](https://www.typescriptlang.org/) 结合使用，可为您的 GraphQL 查询提供更好的类型安全，实现端到端的类型检查。

本章假设您已掌握 GraphQL 基础知识，重点介绍如何使用内置的 `@nestjs/graphql` 模块。`GraphQLModule` 可配置为使用 [Apollo](https://www.apollographql.com/) 服务器（通过 `@nestjs/apollo` 驱动）或 [Mercurius](https://github.com/mercurius-js/mercurius)（通过 `@nestjs/mercurius` 驱动）。我们为这些成熟的 GraphQL 包提供官方集成方案，使在 Nest 中使用 GraphQL 更加简便（更多集成方案请见[此处](../graphql/quick-start#第三方集成) ）。

您也可以构建自己的专用驱动（ [此处](/graphql/other-features#创建自定义驱动程序)了解更多详情）。

#### 安装

首先安装所需的包：

```bash
# For Express and Apollo (default)
$ npm i @nestjs/graphql @nestjs/apollo @apollo/server graphql
```

# For Fastify and Apollo
# npm i @nestjs/graphql @nestjs/apollo @apollo/server @as-integrations/fastify graphql

# For Fastify and Mercurius
# npm i @nestjs/graphql @nestjs/mercurius graphql mercurius
```

> warning： **注意** ，`@nestjs/graphql@>=9` 和 `@nestjs/apollo^10` 包仅兼容 **Apollo v3**（详情请参阅 Apollo Server 3 的[迁移指南](https://www.apollographql.com/docs/apollo-server/migration/) ），而 `@nestjs/graphql@^8` 仅支持 **Apollo v2**（例如 `apollo-server-express@2.x.x` 包）。

#### 概述

Nest 提供了两种构建 GraphQL 应用的方式： **代码优先**和**架构优先**方法。您应选择最适合自己的方式。本 GraphQL 章节的大部分内容分为两个主要部分：如果您采用**代码优先** ，则遵循第一部分；如果采用**架构优先** ，则遵循第二部分。

在**代码优先**方法中，您可以使用装饰器和 TypeScript 类来生成相应的 GraphQL 架构。如果您希望仅使用 TypeScript 工作，避免在不同语言语法之间切换，这种方法非常有用。

在**模式优先**方法中，唯一可信源是 GraphQL SDL（模式定义语言）文件。SDL 是一种与平台无关的语言，用于在不同平台间共享模式文件。Nest 会根据 GraphQL 模式自动生成 TypeScript 定义（使用类或接口），从而减少编写冗余样板代码的需求。

#### GraphQL 与 TypeScript 入门指南

> **提示** 在接下来的章节中，我们将集成 `@nestjs/apollo` 包。如需改用 `mercurius` 包，请跳转至[此章节](/graphql/quick-start#mercurius-集成) 。

安装完相关包后，我们可以导入 `GraphQLModule` 并通过 `forRoot()` 静态方法进行配置。

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

> info：对于 `mercurius` 集成，您应当使用 `MercuriusDriver` 和 `MercuriusDriverConfig`，两者均从 `@nestjs/mercurius` 包导出。

`forRoot()` 方法接收一个配置对象作为参数。这些配置会被传递到底层驱动实例（更多可用设置请参阅：[Apollo](https://www.apollographql.com/docs/apollo-server/api/apollo-server) 和 [Mercurius](https://github.com/mercurius-js/mercurius/blob/master/docs/api/options.md#plugin-options)）。例如，若要禁用 `playground` 并关闭 `debug` 模式（针对 Apollo），可传递如下配置：

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

在此情况下，这些配置将被转发至 `ApolloServer` 构造函数。

#### GraphQL 交互式开发环境

Playground 是一个图形化、交互式的浏览器内 GraphQL IDE，默认情况下可通过与 GraphQL 服务器相同的 URL 访问。要使用 Playground，您需要配置并运行一个基础的 GraphQL 服务器。现在您可以通过安装并构建[这里的示例项目](https://github.com/nestjs/nest/tree/master/sample/23-graphql-code-first)来查看它。或者，如果您正在跟随这些代码示例操作，完成[解析器章节](/graphql/resolvers-map)的步骤后即可访问 Playground。

完成上述配置并在后台运行应用程序后，您可以在浏览器中访问 `http://localhost:3000/graphql`（主机和端口可能因配置而异）。随后您将看到如下所示的 GraphQL Playground 界面。

![](/assets/playground.png)

> info **注意** ：`@nestjs/mercurius` 集成不包含内置的 GraphQL Playground 功能。作为替代，您可以使用 [GraphiQL](https://github.com/graphql/graphiql)（设置 `graphiql: true` 参数）。

> warning **警告** 更新（2025 年 4 月 14 日）：默认的 Apollo playground 已被弃用，并将在下一个主要版本中移除。作为替代，您可以使用 [GraphiQL](https://github.com/graphql/graphiql)，只需在 `GraphQLModule` 配置中设置 `graphiql: true`，如下所示：
>
> ```typescript
> GraphQLModule.forRoot<ApolloDriverConfig>({
>   driver: ApolloDriver,
>   graphiql: true,
> }),
> ```
>
> 如果您的应用程序使用[订阅](/graphql/subscriptions)功能，请务必使用 `graphql-ws`，因为 GraphiQL 不支持 `subscriptions-transport-ws`。
```

#### 代码优先

在**代码优先**方法中，您可以使用装饰器和 TypeScript 类来生成相应的 GraphQL 模式。

要使用代码优先方法，首先在配置对象中添加 `autoSchemaFile` 属性：

```typescript
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
}),
```

`autoSchemaFile` 属性值指定自动生成模式的存储路径。若需在内存中动态生成模式，可将该属性设为 `true`：

```typescript
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  autoSchemaFile: true,
}),
```

默认情况下，生成模式中的类型顺序与包含模块中的定义顺序一致。如需按字母顺序排序，请将 `sortSchema` 属性设为 `true`：

```typescript
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
  sortSchema: true,
}),
```

#### 示例

完整可用的代码优先示例参见[此处](https://github.com/nestjs/nest/tree/master/sample/23-graphql-code-first) 。

#### 模式优先

要使用模式优先方法，首先在配置对象中添加一个 `typePaths` 属性。`typePaths` 属性指定 `GraphQLModule` 应查找您将编写的 GraphQL SDL 模式定义文件的位置。这些文件将在内存中合并，使您能够将模式拆分为多个文件并放置在对应的解析器附近。

```typescript
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  typePaths: ['./**/*.graphql'],
}),
```

通常您还需要拥有与 GraphQL SDL 类型对应的 TypeScript 定义（类和接口）。手动创建对应的 TypeScript 定义既冗余又繁琐，这会导致我们失去单一数据源——SDL 中的每个变更都迫使我们同时调整 TypeScript 定义。为解决这个问题，`@nestjs/graphql` 包可以从抽象语法树([AST](https://en.wikipedia.org/wiki/Abstract_syntax_tree)) **自动生成** TypeScript 定义。要启用此功能，在配置 `GraphQLModule` 时添加 `definitions` 选项属性。

```typescript
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  typePaths: ['./**/*.graphql'],
  definitions: {
    path: join(process.cwd(), 'src/graphql.ts'),
  },
}),
```

`definitions` 对象的 path 属性指定生成 TypeScript 输出的保存位置。默认情况下，所有生成的 TypeScript 类型都会创建为接口。若要改为生成类，需将 `outputAs` 属性值指定为 `'class'`。

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

上述方法会在每次应用启动时动态生成 TypeScript 定义。另一种方案是构建一个按需生成定义的简单脚本。例如，假设我们创建以下脚本 `generate-typings.ts`：

```typescript
import { GraphQLDefinitionsFactory } from '@nestjs/graphql';
import { join } from 'path';

const definitionsFactory = new GraphQLDefinitionsFactory();
definitionsFactory.generate({
  typePaths: ['./src/**/*.graphql'],
  path: join(process.cwd(), 'src/graphql.ts'),
  outputAs: 'class',
});
```

现在你可以按需运行该脚本：

```bash
$ ts-node generate-typings
```

> **提示** 你可以预先编译该脚本（例如使用 `tsc`），然后通过 `node` 来执行它。

要为脚本启用监视模式（在任意 `.graphql` 文件变更时自动生成类型定义），请向 `generate()` 方法传入 `watch` 选项。

```typescript
definitionsFactory.generate({
  typePaths: ['./src/**/*.graphql'],
  path: join(process.cwd(), 'src/graphql.ts'),
  outputAs: 'class',
  watch: true,
});
```

若要为每个对象类型自动生成额外的 `__typename` 字段，请启用 `emitTypenameField` 选项：

```typescript
definitionsFactory.generate({
  // ...
  emitTypenameField: true,
});
```

若要将解析器（查询、变更、订阅）生成为不带参数的普通字段，请启用 `skipResolverArgs` 选项：

```typescript
definitionsFactory.generate({
  // ...
  skipResolverArgs: true,
});
```

要将枚举生成 TypeScript 联合类型而非常规 TypeScript 枚举，请将 `enumsAsTypes` 选项设为 `true`：

```typescript
definitionsFactory.generate({
  // ...
  enumsAsTypes: true,
});
```

#### Apollo Sandbox

要使用 [Apollo Sandbox](https://www.apollographql.com/blog/announcement/platform/apollo-sandbox-an-open-graphql-ide-for-local-development/) 替代 `graphql-playground` 作为本地开发的 GraphQL IDE，请使用以下配置：

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

这里提供了一个完整可用的 schema first 示例 [here](https://github.com/nestjs/nest/tree/master/sample/12-graphql-schema-first)。

#### 访问生成的架构

在某些情况下（例如端到端测试），您可能需要获取对生成的架构对象的引用。在端到端测试中，您可以直接使用 `graphql` 对象运行查询，而无需使用任何 HTTP 监听器。

您可以通过 `GraphQLSchemaHost` 类访问生成的架构（无论是代码优先还是架构优先方法）：

```typescript
const { schema } = app.get(GraphQLSchemaHost);
```

> **提示** 您必须在应用程序初始化完成后（即在 `app.listen()` 或 `app.init()` 方法触发 `onModuleInit` 钩子之后）调用 `GraphQLSchemaHost#schema` 的 getter 方法。

#### 异步配置

当需要异步传递模块选项而非静态传递时，请使用 `forRootAsync()` 方法。与大多数动态模块一样，Nest 提供了多种处理异步配置的技术。

其中一种技术是使用工厂函数：

```typescript
 GraphQLModule.forRootAsync<ApolloDriverConfig>({
  driver: ApolloDriver,
  useFactory: () => ({
    typePaths: ['./**/*.graphql'],
  }),
}),
```

与其他工厂提供程序类似，我们的工厂函数可以是[异步的](../fundamentals/dependency-injection#工厂提供者-usefactory) ，并且可以通过 `inject` 注入依赖项。

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

或者，您也可以使用类而非工厂函数来配置 `GraphQLModule`，如下所示：

```typescript
GraphQLModule.forRootAsync<ApolloDriverConfig>({
  driver: ApolloDriver,
  useClass: GqlConfigService,
}),
```

上述结构会在 `GraphQLModule` 内部实例化 `GqlConfigService`，并用其创建配置对象。请注意，此示例中的 `GqlConfigService` 必须实现 `GqlOptionsFactory` 接口（如下所示）。`GraphQLModule` 会在提供的类实例上调用 `createGqlOptions()` 方法。

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

若需复用现有配置提供者而非在 `GraphQLModule` 内创建私有副本，请使用 `useExisting` 语法。

```typescript
GraphQLModule.forRootAsync<ApolloDriverConfig>({
  imports: [ConfigModule],
  useExisting: ConfigService,
}),
```

#### Mercurius 集成

Fastify 用户（了解更多[此处](/techniques/performance) ）可以替代 Apollo 使用 `@nestjs/mercurius` 驱动。

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

> info **提示** 应用运行后，在浏览器中访问 `http://localhost:3000/graphiql` ，您将看到 [GraphQL 集成开发环境](https://github.com/graphql/graphiql) 。

`forRoot()` 方法接收一个配置对象作为参数，这些配置会被传递给底层驱动实例。更多可用设置请参阅[此处](https://github.com/mercurius-js/mercurius/blob/master/docs/api/options.md#plugin-options) 。

#### 多端点

`@nestjs/graphql` 模块的另一实用功能是能够同时服务多个端点。这让你可以决定哪些模块应包含在哪个端点中。默认情况下，`GraphQL` 会在整个应用中搜索解析器。要将扫描范围限制在特定模块子集，请使用 `include` 属性。

```typescript
GraphQLModule.forRoot({
  include: [CatsModule],
}),
```

> **警告** 如果在单个应用中使用 `@apollo/server` 和 `@as-integrations/fastify` 包配置多个 GraphQL 端点，请确保在 `GraphQLModule` 配置中启用 `disableHealthCheck` 设置。

#### 第三方集成

- [GraphQL Yoga](https://github.com/dotansimha/graphql-yoga)

#### 示例

一个可用的示例[在此处](https://github.com/nestjs/nest/tree/master/sample/33-graphql-mercurius)查看。
