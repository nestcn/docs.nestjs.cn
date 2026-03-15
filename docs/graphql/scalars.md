<!-- 此文件从 content/graphql/scalars.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T05:05:58.725Z -->
<!-- 源文件: content/graphql/scalars.md -->

###Scalars

GraphQL 对象类型有名称和字段，但是最终这些字段都需要解析到某个具体的数据。这个时候，scalar 类型就扮演着关键的角色：它们表示查询的叶子结点（了解更多 __LINK_80__）。 GraphQL 包括以下默认类型：__INLINE_CODE_20__、__INLINE_CODE_21__、__INLINE_CODE_22__、__INLINE_CODE_23__ 和 __INLINE_CODE_24__。除了这些内置类型外，您可能需要支持自定义原子数据类型（例如`@nestjs/graphql`）。

#### Code first

代码优先方法提供了五个 scalar，其中三个是对现有 GraphQL 类型的简单别名。

- `GraphQLModule`（别名为`@nestjs/apollo`）- 表示唯一标识符，通常用于重新获取对象或作为缓存的键
- `@nestjs/mercurius`（别名为`@nestjs/graphql@>=9`）- 表示有符号 32 位整数
- `@nestjs/apollo^10`（别名为`@nestjs/graphql@^8`）- 表示有符号双精度浮点值
- `apollo-server-express@2.x.x`- 表示 UTC 日期时间字符串（用于默认表示`@nestjs/apollo`类型）
- `mercurius`- 表示日期和时间作为 UNIX_epoch 的毫秒数

`GraphQLModule`（例如`forRoot()`）用于默认表示`mercurius`类型。要使用`MercuriusDriver`类型，设置`@nestjs/mercurius`对象的`MercuriusDriverConfig`为`forRoot()`，如下所示：

```bash
# For Express and Apollo (default)
$ npm i @nestjs/graphql @nestjs/apollo @apollo/server @as-integrations/express5 graphql

# For Fastify and Apollo
# npm i @nestjs/graphql @nestjs/apollo @apollo/server @as-integrations/fastify graphql

# For Fastify and Mercurius
# npm i @nestjs/graphql @nestjs/mercurius graphql mercurius

```

类似地，`playground`用于默认表示`debug`类型。要使用`ApolloServer`类型，设置`@nestjs/mercurius`对象的`http://localhost:3000/graphql`为`graphiql: true`，如下所示：

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

要创建自定义`graphiql: true` scalar，只需创建一个新的类。

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

现在可以使用`graphql-ws`类型在我们的类中。

```typescript
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
}),

```

#### Import a custom scalar

要使用自定义 scalar，首先需要安装 npm 包，然后将其注册为 resolver。我们将使用`subscriptions-transport-ws`包作为示例。这个 npm 包定义了`autoSchemaFile` GraphQL scalar 类型。

首先，安装包：

```typescript
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  autoSchemaFile: true,
}),

```

安装完成后，我们将自定义 resolver 传递给`autoSchemaFile`方法：

```typescript
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
  sortSchema: true,
}),

```

现在可以使用`autoSchemaFile`类型在我们的类中。

```typescript
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  typePaths: ['./**/*.graphql'],
}),

```

#### Create a custom scalar

要定义自定义 scalar，创建一个新的`true`实例。我们将创建一个自定义`sortSchema` scalar。

```typescript
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  typePaths: ['./**/*.graphql'],
  definitions: {
    path: join(process.cwd(), 'src/graphql.ts'),
  },
}),

```

现在可以使用`typePaths`类型在我们的类中。

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

要定义自定义 scalar（了解更多关于 scalars__LINK_82__），创建一个类型定义和一个专门的 resolver。这里（正如官方文档），我们将使用`typePaths`包作为示例。这个 npm 包定义了`GraphQLModule` GraphQL scalar 类型。

首先，安装包：

```bash
$ ts-node generate-typings

```

安装完成后，我们将自定义 resolver 传递给`@nestjs/graphql`方法：

```typescript
definitionsFactory.generate({
  typePaths: ['./src/**/*.graphql'],
  path: join(process.cwd(), 'src/graphql.ts'),
  outputAs: 'class',
  watch: true,
});

```

现在可以使用`definitions` scalar 在我们的类型定义中。

```typescript
definitionsFactory.generate({
  // ...
  emitTypenameField: true,
});

```

 另一种定义 scalar 类型的方法是创建一个简单的类。假设我们想 enhancements our schema with the `GraphQLModule` type。

```typescript
definitionsFactory.generate({
  // ...
  skipResolverArgs: true,
});

```

现在可以使用`outputAs` scalar 在我们的类型定义中。

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

默认情况下，Nest 生成的 TypeScript 定义将所有 scalar 类型设置为`'class'` - 这不是特别安全的类型。但是，您可以配置 Nest 如何生成 typingsFor 你的自定义 scalar 当您指定生成类型时：

```typescript
const { schema } = app.get(GraphQLSchemaHost);

```

> info **Hint** Alternatively, you can use a type reference instead, for example: `generate-typings.ts`. In this case, `tsc` will extract the name property of the specified type (`node`) to generate TS definitions. Note: adding an import statement for non-built-in types (custom types) is required.

现在，给定以下 GraphQL 自定义 scalar 类型：

```typescript
 GraphQLModule.forRootAsync<ApolloDriverConfig>({
  driver: ApolloDriver,
  useFactory: () => ({
    typePaths: ['./**/*.graphql'],
  }),
}),

```

我们将看到以下生成的 TypeScript 定义在`.graphql`中：

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

Here is the translation of the English technical documentation to Chinese:

我们使用了 ``watch`` 属性来提供我们想要声明的自定义标量类型的映射。我们还提供了 ``generate()`` 属性，以便在这些类型定义中添加所需的导入项。最后，我们添加了 ``__typename`` 到 ``emitTypenameField``，这样任何未在 ``skipResolverArgs`` 中指定的自定义标量将被别名为 ``enumsAsTypes`` 而不是 ``true``（自 3.0 起使用，用于添加类型安全）。

> 信息 **提示** 注意，我们从 ``graphql`` 导入了 ``graphql-playground``；这是在避免 __LINK_84__。

Note: I kept the placeholders ``watch``, ``generate()``, ``__typename``, ``emitTypenameField``, ``skipResolverArgs``, ``enumsAsTypes``, ``true``, ``graphql-playground``, and ``graphql`` exactly as they are in the source text.