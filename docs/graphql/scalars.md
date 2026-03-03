<!-- 此文件从 content/graphql/scalars.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-03T04:17:30.120Z -->
<!-- 源文件: content/graphql/scalars.md -->

### scalars

GraphQL 对象类型有名称和字段，但是某些时候这些字段需要将其 resolve 到某些具体数据。这就是 where scalars come in：它们表示查询的叶子节点（了解更多 __LINK_80__）。GraphQL 包括以下默认类型：`GraphQLDirective`, `DirectiveLocation`, `graphql`, __INLINE_CODE_23__ 和 __INLINE_CODE_24__。此外，您可能需要支持自定义原子数据类型（例如 __INLINE_CODE_25__）。

#### Code first

code-first 方法配备五个 scalar，其中三个是对现有 GraphQL 类型的简单别名。

- __INLINE_CODE_26__（别名为 __INLINE_CODE_27__）- 表示唯一标识符，通常用来重新获取对象或作为缓存的键
- __INLINE_CODE_28__（别名为 __INLINE_CODE_29__）-signed 32-bit integer
- __INLINE_CODE_30__（别名为 __INLINE_CODE_31__）- signed double-precision floating-point value
- __INLINE_CODE_32__ - UTC 日期时间字符串（默认用于表示 __INLINE_CODE_33__ 类型）
- __INLINE_CODE_34__ - signed integer，表示 UNIX epoch 的毫秒数

__INLINE_CODE_35__（例如 __INLINE_CODE_36__）用于默认表示 __INLINE_CODE_37__ 类型。要使用 __INLINE_CODE_38__ 而不是 __INLINE_CODE_35__，请将 __INLINE_CODE_39__ 设置为 __INLINE_CODE_41__，如下所示：

```typescript
import { getDirective, MapperKind, mapSchema } from '@graphql-tools/utils';
import { defaultFieldResolver, GraphQLSchema } from 'graphql';

export function upperDirectiveTransformer(
  schema: GraphQLSchema,
  directiveName: string,
) {
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
      const upperDirective = getDirective(
        schema,
        fieldConfig,
        directiveName,
      )?.[0];

      if (upperDirective) {
        const { resolve = defaultFieldResolver } = fieldConfig;

        // Replace the original resolver with a function that *first* calls
        // the original resolver, then converts its result to upper case
        fieldConfig.resolve = async function (source, args, context, info) {
          const result = await resolve(source, args, context, info);
          if (typeof result === 'string') {
            return result.toUpperCase();
          }
          return result;
        };
        return fieldConfig;
      }
    },
  });
}
```

类似地，__INLINE_CODE_42__用于默认表示 __INLINE_CODE_43__ 类型。要使用 __INLINE_CODE_44__ 而不是 __INLINE_CODE_42__，请将 __INLINE_CODE_45__ 设置为 __INLINE_CODE_47__，如下所示：

```typescript
GraphQLModule.forRoot({
  // ...
  transformSchema: (schema) => upperDirectiveTransformer(schema, 'upper'),
});
```

此外，您可以创建自定义 scalar。

#### Override a default scalar

要创建自定义 __INLINE_CODE_48__ scalar，简单地创建一个新的类。

```typescript
@Directive('@upper')
@Field()
title: string;
```

然后，注册 __INLINE_CODE_49__ 作为提供者。

```typescript
@Directive('@deprecated(reason: "This query will be removed in the next version")')
@Query(() => Author, { name: 'author' })
async getAuthor(@Args({ name: 'id', type: () => Int }) id: number) {
  return this.authorsService.findOneById(id);
}
```

现在，我们可以在类中使用 __INLINE_CODE_50__ 类型。

```typescript
GraphQLModule.forRoot({
  // ...,
  transformSchema: schema => upperDirectiveTransformer(schema, 'upper'),
  buildSchemaOptions: {
    directives: [
      new GraphQLDirective({
        name: 'upper',
        locations: [DirectiveLocation.FIELD_DEFINITION],
      }),
    ],
  },
}),
```

#### Import a custom scalar

要使用自定义 scalar，请导入并注册它作为解析器。我们将使用 __INLINE_CODE_51__ 包以演示目的。这 npm 包定义了 __INLINE_CODE_52__ GraphQL scalar 类型。

首先，安装包：

```graphql
directive @upper on FIELD_DEFINITION

type Post {
  id: Int!
  title: String! @upper
  votes: Int
}
```

安装包后，我们将自定义解析器传递给 __INLINE_CODE_53__ 方法：

__CODE_BLOCK_6__

现在，我们可以在类中使用 __INLINE_CODE_54__ 类型。

__CODE_BLOCK_7__

对于有用的 scalar，请查看 __LINK_81__ 包。

#### Create a custom scalar

要定义自定义 scalar，创建一个新的 __INLINE_CODE_55__ 实例。我们将创建一个自定义 __INLINE_CODE_56__ scalar。

__CODE_BLOCK_8__

然后，我们将自定义解析器传递给 __INLINE_CODE_57__ 方法：

__CODE_BLOCK_9__

现在，我们可以在类中使用 __INLINE_CODE_58__ 类型。

__CODE_BLOCK_10__

#### Schema first

要定义自定义 scalar（了解更多关于 scalars __LINK_82__），创建一个类型定义和一个专门的解析器。在这里（正如官方文档），我们将使用 __INLINE_CODE_59__ 包以演示目的。这 npm 包定义了 __INLINE_CODE_60__ GraphQL scalar 类型。

首先，安装包：

__CODE_BLOCK_11__

安装包后，我们将自定义解析器传递给 __INLINE_CODE_61__ 方法：

__CODE_BLOCK_12__

现在，我们可以在类型定义中使用 __INLINE_CODE_62__ scalar。

__CODE_BLOCK_13__

另一种方法是创建一个简单的类。假设我们想将 __INLINE_CODE_63__ 类型添加到我们的 schema 中。

__CODE_BLOCK_14__

然后，注册 __INLINE_CODE_64__ 作为提供者。

__CODE_BLOCK_15__

现在，我们可以在类型定义中使用 __INLINE_CODE_65__ scalar。

__CODE_BLOCK_16__

默认情况下，Nest 生成的 TypeScript 定义将所有 scalar 定义为 __INLINE_CODE_66__，这不是非常安全。
但是，您可以配置 Nest 生成 typings 的方式来生成自定义 scalar 的类型：

__CODE_BLOCK_17__

> info **Hint** Alternatively, you can use a type reference instead, for example: __INLINE_CODE_67__. In this case, __INLINE_CODE_68__ will extract the name property of the specified type (__INLINE_CODE_69__) to generate TS definitions. Note: adding an import statement for non-built-in types (custom types) is required