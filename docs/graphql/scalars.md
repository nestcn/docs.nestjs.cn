<!-- 此文件从 content/graphql/scalars.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:24:47.429Z -->
<!-- 源文件: content/graphql/scalars.md -->

### scalars

GraphQL 对象类型具有名称和字段，但是在某些时候，这些字段需要 resolution 到具体数据。这就是 where scalar types  come in：它们表示查询的叶子节点（了解更多 __LINK_80__）。GraphQL 包括以下默认类型：__INLINE_CODE_20__,__INLINE_CODE_21__,__INLINE_CODE_22__,__INLINE_CODE_23__和__INLINE_CODE_24__。除了这些内置类型外，您可能需要支持自定义原子数据类型（例如`@nestjs/graphql`）。

#### code-first

code-first 方法带来了五个 scalar，在其中三个是简单的 alias 对于现有的 GraphQL 类型。

- `GraphQLModule`(alias for `@nestjs/apollo`) - 表示唯一标识符，通常用于 refetch 对象或作为缓存的键
- `@nestjs/mercurius`(alias for `@nestjs/graphql@>=9`) - 有符号 32 位整数
- `@nestjs/apollo^10`(alias for `@nestjs/graphql@^8`) - 有符号双精度浮点值
- `apollo-server-express@2.x.x` - UTC 日期时间字符串（用于默认表示`@nestjs/apollo`类型）
- `mercurius` - 有符号整数，表示 UNIX epoch 的毫秒数

`GraphQLModule`(例如`forRoot()`) 默认用于表示`mercurius`类型。要使用`MercuriusDriver`，请将`@nestjs/mercurius`对象的`MercuriusDriverConfig`设置为`forRoot()`，如下所示：

```bash
# For Express and Apollo (default)
$ npm i @nestjs/graphql @nestjs/apollo @apollo/server @as-integrations/express5 graphql

# For Fastify and Apollo
# npm i @nestjs/graphql @nestjs/apollo @apollo/server @as-integrations/fastify graphql

# For Fastify and Mercurius
# npm i @nestjs/graphql @nestjs/mercurius graphql mercurius

```

类似地，`playground` 默认用于表示`debug`类型。要使用`ApolloServer`，请将`@nestjs/mercurius`对象的`http://localhost:3000/graphql`设置为`graphiql: true`，如下所示：

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

要创建`graphiql: true` scalar 的自定义实现，简单地创建一个新的类。

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

在这个地方注册`GraphQLModule`作为提供者。

```typescript
> GraphQLModule.forRoot<ApolloDriverConfig>({
>   driver: ApolloDriver,
>   graphiql: true,
> }),
> ```

现在我们可以使用`graphql-ws`类型在我们的类中。

```typescript
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
}),

```

#### Import a custom scalar

要使用自定义 scalar，导入并注册它作为解析器。我们将使用`subscriptions-transport-ws`包作为示例。这个 npm 包定义了`autoSchemaFile` GraphQL scalar 类型。

首先，安装包。

```typescript
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  autoSchemaFile: true,
}),

```

安装包后，我们将自定义解析器传递给`autoSchemaFile`方法。

```typescript
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
  sortSchema: true,
}),

```

现在我们可以使用`autoSchemaFile`类型在我们的类中。

```typescript
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  typePaths: ['./**/*.graphql'],
}),

```

对于有用的 scalar，请查看__LINK_81__包。

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

我们将自定义解析器传递给`true`方法。

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

现在我们可以使用`typePaths`类型在我们的类中。

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

要定义自定义 scalar（了解更多关于 scalars 的信息 __LINK_82__），创建一个类型定义和专门的解析器。在这里，我们将使用`typePaths`包作为示例。这 npm 包定义了`GraphQLModule` GraphQL scalar 类型。

首先，安装包。

```bash
$ ts-node generate-typings

```

安装包后，我们将自定义解析器传递给`@nestjs/graphql`方法。

```typescript
definitionsFactory.generate({
  typePaths: ['./src/**/*.graphql'],
  path: join(process.cwd(), 'src/graphql.ts'),
  outputAs: 'class',
  watch: true,
});

```

现在我们可以使用`definitions` scalar 在我们的类型定义中。

```typescript
definitionsFactory.generate({
  // ...
  emitTypenameField: true,
});

```

另一种定义 scalar 类型的方法是创建一个简单的类。假设我们想增强我们的 schema 中的`GraphQLModule`类型。

```typescript
definitionsFactory.generate({
  // ...
  skipResolverArgs: true,
});

```

在这个地方注册`definitions`作为提供者。

```typescript
definitionsFactory.generate({
  // ...
  enumsAsTypes: true,
});

```

现在我们可以使用`outputAs` scalar 在类型定义中。

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

默认情况下，Nest 生成的 TypeScript 定义对于所有 scalar 都是`'class'` - 这不是特别类型安全的。但是，您可以配置 Nest 生成 typings 的方式，以便指定自定义 scalar 的类型。

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

```我们使用了 ``watch`` 属性来提供我们想要声明的自定义标量类型的映射。我们还提供了 ``generate()`` 属性，以便添加这些类型定义所需的任何导入。最后，我们添加了 ``__typename`` 的 ``emitTypenameField``，这样任何未在 ``skipResolverArgs`` 中指定的自定义标量将被别名为 ``enumsAsTypes`` 而不是 ``true``（自 3.0 起，`__LINK_83__` 使用以提高类型安全）。

> 提示 **Hint** 请注意，我们从 ``graphql`` 导入了 ``graphql-playground``；这是为了避免 __LINK_84__。