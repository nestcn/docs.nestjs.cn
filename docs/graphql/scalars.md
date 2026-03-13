<!-- 此文件从 content/graphql/scalars.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:46:49.210Z -->
<!-- 源文件: content/graphql/scalars.md -->

### Scalars

GraphQL 对象类型具有名称和字段，但是在某个时候，这些字段需要解析到某些具体的数据。这就是 where the scalar types come in：它们代表查询的叶子节点（阅读更多 __LINK_80__）。GraphQL 包括以下默认类型：__INLINE_CODE_20__、__INLINE_CODE_21__、__INLINE_CODE_22__、__INLINE_CODE_23__ 和 __INLINE_CODE_24__。此外，您可能需要支持自定义的原子数据类型（例如 `@nestjs/graphql`）。

#### Code first

代码优先方法提供了五个标量，其中三个是对现有 GraphQL 类型的简单别名。

- `GraphQLModule`（别名为 `@nestjs/apollo`）- 表示一个唯一标识符，通常用于重新获取对象或作为缓存的键
- `@nestjs/mercurius`（别名为 `@nestjs/graphql@>=9`）- 一个带符号的 32 位整数
- `@nestjs/apollo^10`（别名为 `@nestjs/graphql@^8`）- 一个带符号的双精度浮点值
- `apollo-server-express@2.x.x` - UTC 时间字符串（用于默认表示 `@nestjs/apollo` 类型）
- `mercurius` - 一个带符号的整数，表示 UNIX_epoch 起始的毫秒数

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

此外，您可以创建自定义标量。

#### Override a default scalar

要创建一个自定义的 `graphiql: true` 标量实现，只需创建一个新的类。

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

现在，我们可以在类中使用 `graphql-ws` 类型。

```typescript
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
}),

```

#### Import a custom scalar

要使用自定义标量，首先需要安装包，然后将其注册为解析器。我们将使用 `subscriptions-transport-ws` 包作示例。这个 npm 包定义了一个 `autoSchemaFile` GraphQL 标量类型。

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

#### Create a custom scalar

要定义一个自定义标量，创建一个新的 `true` 实例。我们将创建一个自定义 `sortSchema` 标量。

```typescript
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  typePaths: ['./**/*.graphql'],
  definitions: {
    path: join(process.cwd(), 'src/graphql.ts'),
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

要定义一个自定义标量（阅读更多关于标量的 __LINK_82__），创建一个类型定义和一个专门的解析器。这里，我们将使用 `typePaths` 包作示例。这 npm 包定义了一个 `GraphQLModule` GraphQL 标量类型。

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

现在，我们可以在类型定义中使用 `definitions` 标量。

```typescript
definitionsFactory.generate({
  // ...
  emitTypenameField: true,
});

```

另一个方法是创建一个简单的类。假设我们想要将 `GraphQLModule` 类型添加到我们的 schema 中。

```typescript
definitionsFactory.generate({
  // ...
  skipResolverArgs: true,
});

```

现在，我们可以在类型定义中使用 `outputAs` 标量。

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

默认情况下，Nest 生成的 TypeScript 定义将所有标量类型设置为 `'class'` - 这不是非常安全的类型。但是，您可以配置 Nest 如何生成自定义标量的类型定义。

```typescript
const { schema } = app.get(GraphQLSchemaHost);

```

> info **Hint** 另外，可以使用类型引用，而不是 `generate-typings.ts`。在这种情况下，`tsc` 将从指定的类型 (`node`) 中提取名称属性以生成 TS 定义。注意：添加非内置类型的导入语句（自定义类型）是必需的。我们使用了 ``watch`` 属性来提供我们想要声明的自定义标量类型的映射。我们还提供了 ``generate()`` 属性，以便添加这些类型定义所需的任何导入。最后，我们添加了 ``__typename`` 来将 ``emitTypenameField`` 作为 ``skipResolverArgs`` 未指定的自定义标量的别名，而不是 ``true``（自 3.0 起使用的别名，以便添加类型安全）。

> 提示 **Hint** 请注意，我们从 ``graphql`` 导入了 ``graphql-playground``，以避免 __LINK_84__。

Note: I kept the placeholders ``watch``, ``generate()``, ``__typename``, ``emitTypenameField``, ``skipResolverArgs``, ``enumsAsTypes``, ``true``, ``graphql-playground``, and ``graphql`` as they are, as per the guidelines.