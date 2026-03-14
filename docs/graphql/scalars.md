<!-- 此文件从 content/graphql/scalars.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T04:58:59.058Z -->
<!-- 源文件: content/graphql/scalars.md -->

### Scalars

GraphQL 对象类型拥有一个名称和字段，但是有一些时候这些字段需要 resolve 到一些具体的数据。这就是 scalar 类型的作用：它们表示查询的叶子结点（read more __LINK_80__）。GraphQL 包括以下默认类型：__INLINE_CODE_20__、__INLINE_CODE_21__、__INLINE_CODE_22__、__INLINE_CODE_23__ 和 __INLINE_CODE_24__。此外，您可能需要支持自定义的原子数据类型（例如 `@nestjs/graphql`）。

#### 代码优先

代码优先方法提供了五个 scalar，在其中三个是对现有 GraphQL 类型的简单别名。

- `GraphQLModule`（别名为 `@nestjs/apollo`） - 表示唯一标识符，通常用于重新获取对象或作为缓存的键
- `@nestjs/mercurius`（别名为 `@nestjs/graphql@>=9`） - signed 32‐bit integer
- `@nestjs/apollo^10`（别名为 `@nestjs/graphql@^8`） - signed double-precision floating-point value
- `apollo-server-express@2.x.x` - UTC 日期时间字符串（用于默认表示 `@nestjs/apollo` 类型）
- `mercurius` - signed integer，表示 UNIX epoch 的开始时间以来的毫秒数

`GraphQLModule`（例如 `forRoot()`）默认用于表示 `mercurius` 类型。要使用 `MercuriusDriver`，请将 `@nestjs/mercurius` 对象的 `MercuriusDriverConfig` 设置为 `forRoot()`，如下所示：

```bash
# For Express and Apollo (default)
$ npm i @nestjs/graphql @nestjs/apollo @apollo/server @as-integrations/express5 graphql

# For Fastify and Apollo
# npm i @nestjs/graphql @nestjs/apollo @apollo/server @as-integrations/fastify graphql

# For Fastify and Mercurius
# npm i @nestjs/graphql @nestjs/mercurius graphql mercurius

```

类似地，`playground`默认用于表示 `debug` 类型。要使用 `ApolloServer`，请将 `@nestjs/mercurius` 对象的 `http://localhost:3000/graphql` 设置为 `graphiql: true`，如下所示：

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

此外，您还可以创建自定义的 scalar。

#### 重写默认 scalar

为了创建自定义的 `graphiql: true` scalar，简单地创建一个新的类。

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

现在，我们可以在我们的类中使用 `graphql-ws` 类型。

```typescript
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
}),

```

#### 导入自定义 scalar

要使用自定义 scalar，导入并注册它作为解析器。我们将使用 `subscriptions-transport-ws` 包作为示例。这个 npm 包定义了 `autoSchemaFile` GraphQL scalar 类型。

首先，安装包：

```typescript
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  autoSchemaFile: true,
}),

```

安装包后，我们将自定义解析器传递给 `autoSchemaFile` 方法：

```typescript
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
  sortSchema: true,
}),

```

现在，我们可以在我们的类中使用 `autoSchemaFile` 类型。

```typescript
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  typePaths: ['./**/*.graphql'],
}),

```

对于有用的 scalar 集合，请查看 __LINK_81__ 包。

#### 创建自定义 scalar

为了定义自定义 scalar，创建一个新的 `true` 实例。我们将创建一个自定义 `sortSchema` scalar。

```typescript
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  typePaths: ['./**/*.graphql'],
  definitions: {
    path: join(process.cwd(), 'src/graphql.ts'),
  },
}),

```

然后，我们将自定义解析器传递给 `true` 方法：

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

现在，我们可以在我们的类中使用 `typePaths` 类型。

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

#### 模式优先

为了定义自定义 scalar（read more about scalars __LINK_82__），创建一个类型定义和一个专门的解析器。在这里，我们将使用 `typePaths` 包作为示例。这个 npm 包定义了 `GraphQLModule` GraphQL scalar 类型。

首先，安装包：

```bash
$ ts-node generate-typings

```

安装包后，我们将自定义解析器传递给 `@nestjs/graphql` 方法：

```typescript
definitionsFactory.generate({
  typePaths: ['./src/**/*.graphql'],
  path: join(process.cwd(), 'src/graphql.ts'),
  outputAs: 'class',
  watch: true,
});

```

现在，我们可以在我们的类型定义中使用 `definitions` scalar。

```typescript
definitionsFactory.generate({
  // ...
  emitTypenameField: true,
});

```

另一种定义 scalar 类型的方法是创建一个简单的类。假设我们想增强我们的模式以包含 `GraphQLModule` 类型。

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

现在，我们可以在我们的类型定义中使用 `outputAs` scalar。

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

默认情况下，Nest 生成的 TypeScript 定义将所有 scalar 的类型定义为 `'class'`，这不是特别类型安全。但是，您可以配置 Nest 如何生成 typings 对自定义 scalar 的类型。

```typescript
const { schema } = app.get(GraphQLSchemaHost);

```

> info **Hint** alternatively，您也可以使用类型引用，例如：`generate-typings.ts`。在这种情况下，`tsc` 将从指定类型（`node`）的名称属性中提取名称来生成 TS 定义。注意：对于非 built-in 类型（自定义类型），需要添加 import 语句。

现在，给定以下 GraphQL 自定义 scalar 类型：

```typescript
 GraphQLModule.forRootAsync<ApolloDriverConfig>({
  driver: ApolloDriver,
  useFactory: () => ({
    typePaths: ['./**/*.graphql'],
  }),
}),

```

我们现在将看到以下生成的 TypeScript 定义在 `.graphql` 中：

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

Please note that the translation is based on the provided glossary and follows the guidelines.Here is the translation of the English technical documentation to Chinese:

我们使用了 ``watch`` 属性来提供我们想要声明的自定义标量类型的映射。我们还提供了 ``generate()`` 属性，以便添加这些类型定义所需的任何导入。最后，我们添加了 ``__typename`` 的 ``emitTypenameField``，因此未在 ``skipResolverArgs`` 中指定的自定义标量将被别名为 ``enumsAsTypes`` 而不是 ``true``（自 3.0 起，由于 __LINK_83__ 添加了类型安全）。

> info **提示** 请注意，我们从 ``graphql`` 导入了 ``graphql-playground``；这是在避免 __LINK_84__。

Note: I followed the provided guidelines and kept the placeholders (e.g. `watch`, __LINK_83__) unchanged as required.