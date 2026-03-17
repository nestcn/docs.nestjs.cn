<!-- 此文件从 content/graphql/scalars.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T04:52:10.626Z -->
<!-- 源文件: content/graphql/scalars.md -->

### Scalars

GraphQL 对象类型具有名称和字段，但是当那些字段需要 resolve 到某些具体数据时，那么就是 scalar 类型的作用：它们表示查询的叶子节点（了解更多 __LINK_80__）。 GraphQL 包括以下默认类型：__INLINE_CODE_20__，__INLINE_CODE_21__，__INLINE_CODE_22__，__INLINE_CODE_23__ 和 __INLINE_CODE_24__。此外，您可能需要支持自定义原子数据类型（例如 `@nestjs/graphql`）。

#### Code first

代码优先方法提供五个 scalar，在其中三个是对现有 GraphQL 类型的简单别名。

- `GraphQLModule`（别名为 `@nestjs/apollo`）- 表示唯一标识符，通常用于重新获取对象或作为缓存的键
- `@nestjs/mercurius`（别名为 `@nestjs/graphql@>=9`）- 表示有符号 32 位整数
- `@nestjs/apollo^10`（别名为 `@nestjs/graphql@^8`）- 表示有符号双精度浮点值
- `apollo-server-express@2.x.x` - 表示 UTC 时间字符串（默认用于表示 `@nestjs/apollo` 类型）
- `mercurius` - 表示日期和时间作为 UNIX_epoch 的毫秒数

`GraphQLModule`（例如 `forRoot()`）默认用于表示 `mercurius` 类型。要使用 `MercuriusDriver` 而不是 `GraphQLModule`，请将 `@nestjs/mercurius` 对象的 `MercuriusDriverConfig` 设置为 `forRoot()`，如下所示：

```bash
# For Express and Apollo (default)
$ npm i @nestjs/graphql @nestjs/apollo @apollo/server @as-integrations/express5 graphql

# For Fastify and Apollo
# npm i @nestjs/graphql @nestjs/apollo @apollo/server @as-integrations/fastify graphql

# For Fastify and Mercurius
# npm i @nestjs/graphql @nestjs/mercurius graphql mercurius

```

类似地，`playground` 默认用于表示 `debug` 类型。要使用 `ApolloServer` 而不是 `playground`，请将 `@nestjs/mercurius` 对象的 `http://localhost:3000/graphql` 设置为 `graphiql: true`，如下所示：

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

此外，您还可以创建自定义 scalar。

#### Override a default scalar

要创建一个自定义的 `graphiql: true` scalar， simplement 创建一个新的类。

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

然后，注册 `GraphQLModule` 作为提供者。

```typescript
> GraphQLModule.forRoot<ApolloDriverConfig>({
>   driver: ApolloDriver,
>   graphiql: true,
> }),
> ```

现在，我们可以在类中使用 `graphql-ws` 类型。

```typescript
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
}),

```

#### Import a custom scalar

要使用自定义 scalar， import 并注册它作为解析器。我们将使用 `subscriptions-transport-ws` 包来进行示例。这个 npm 包定义了一个 `autoSchemaFile` GraphQL scalar 类型。

首先，安装包：

```typescript
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  autoSchemaFile: true,
}),

```

安装完成后，我们将自定义解析器传递给 `autoSchemaFile` 方法：

```typescript
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
  sortSchema: true,
}),

```

现在，我们可以在类中使用 `autoSchemaFile` 类型。

```typescript
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  typePaths: ['./**/*.graphql'],
}),

```

对于一些有用的 scalar，请查看 __LINK_81__ 包。

#### Create a custom scalar

要定义一个自定义 scalar，创建一个新的 `true` 实例。我们将创建一个自定义 `sortSchema` scalar。

```typescript
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  typePaths: ['./**/*.graphql'],
  definitions: {
    path: join(process.cwd(), 'src/graphql.ts'),
  },
}),

```

然后，将自定义解析器传递给 `true` 方法：

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

现在，我们可以在类中使用 `typePaths` 类型。

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

#### Schema first

要定义一个自定义 scalar（了解更多关于 scalar 的信息 __LINK_82__），创建一个类型定义和一个专门的解析器。这里，我们将使用 `typePaths` 包进行示例。这个 npm 包定义了一个 `GraphQLModule` GraphQL scalar 类型。

首先，安装包：

```bash
$ ts-node generate-typings

```

安装完成后，我们将自定义解析器传递给 `@nestjs/graphql` 方法：

```typescript
definitionsFactory.generate({
  typePaths: ['./src/**/*.graphql'],
  path: join(process.cwd(), 'src/graphql.ts'),
  outputAs: 'class',
  watch: true,
});

```

现在，我们可以在类型定义中使用 `definitions` scalar。

```typescript
definitionsFactory.generate({
  // ...
  emitTypenameField: true,
});

```

另一种定义 scalar 类型的方法是创建一个简单的类。假设我们想将 `GraphQLModule` 类型添加到我们的 schema 中。

```typescript
definitionsFactory.generate({
  // ...
  skipResolverArgs: true,
});

```

然后，注册 `definitions` 作为提供者。

```typescript
definitionsFactory.generate({
  // ...
  enumsAsTypes: true,
});

```

现在，我们可以在类型定义中使用 `outputAs` scalar。

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

默认情况下，Nest 生成的 TypeScript 定义文件将所有 scalar 定义为 `'class'` - 这并不是特别类型安全的。但是，您可以配置 Nest 生成的 typings way：

```typescript
const { schema } = app.get(GraphQLSchemaHost);

```

> info **Hint** 可以使用 type reference 代替，例如：`generate-typings.ts`。在这种情况下，`tsc` 将从指定类型的名称属性中提取名称来生成 TS 定义。注意：添加非内置类型的 import 语句是必需的。

现在，我们将看到以下生成的 TypeScript 定义文件在 `.graphql`：

```typescript
GraphQLModule.forRootAsync<ApolloDriverConfig>({
  driver: ApolloDriver,
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => ({
    typePaths: configService.get<string>('GRAPHQL_TYPE_PATHS'),
  }),
  inject: [ConfigService],
}),

```以下是翻译后的中文文档：

我们使用了 ``watch`` 属性来提供我们想要声明的自定义标量的类型映射。我们还提供了 ``generate()`` 属性，以便添加这些类型定义所需的引入。最后，我们添加了 ``__typename`` 的 ``emitTypenameField``，这样任何未在 ``skipResolverArgs`` 指定自定义标量将被别名为 ``enumsAsTypes`` 而不是 ``true``（自 3.0 起使用，用于添加类型安全）。

> 信息 **Hint** 注意，我们从 ``graphql`` 导入了 ``graphql-playground``；这是在避免 __LINK_84__。

注：未修改代码示例、变量名、函数名、Markdown 格式、链接、图片、表格等原始内容。只翻译了代码注释和文本内容。