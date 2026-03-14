<!-- 此文件从 content/graphql/directives.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T05:00:20.174Z -->
<!-- 源文件: content/graphql/directives.md -->

### 指令

可以将指令附加到字段或片段包含中，并影响查询的执行方式（阅读更多 [here](https://graphql.org/learn/queries/#指令)）。GraphQL 规范提供了几个默认指令：

- `@include(if: Boolean)` - 只有当参数为 true 时才包括该字段在结果中
- `@skip(if: Boolean)` - 如果参数为 true 则跳过该字段
- `@deprecated(reason: String)` - 将字段标记为弃用，并显示消息

指令是一个由 `@` 字符开头的标识符， optionally followed by a list of named arguments，可以出现在 GraphQL 查询和 schema 语言中的 almost any element。

#### 自定义指令

要 instruct Apollo/Mercurius 何时遇到您的指令时应该发生什么，可以创建一个转换函数。这函数使用 `mapSchema` 函数遍历 schema 中的位置（字段定义、类型定义等）并执行相应的转换。

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

现在，在 `GraphQLModule#forRoot` 方法中使用 `transformSchema` 函数应用 `upperDirectiveTransformer` 转换函数：

```typescript
GraphQLModule.forRoot({
  // ...
  transformSchema: (schema) => upperDirectiveTransformer(schema, 'upper'),
});

```

注册后，`@upper` 指令可以在我们的 schema 中使用。然而，您应用指令的方式将取决于您的方法（代码优先或 schema 优先）。

#### 代码优先

在代码优先方法中，使用 `@Directive()` 装饰器将指令应用于字段。

```typescript
@Directive('@upper')
@Field()
title: string;

```

> info **提示** `@Directive()` 装饰器来自 `@nestjs/graphql` 包。

指令可以应用于字段、字段解析器、输入类型和对象类型， 以及查询、Mutation 和订阅。下面是一个指令应用于查询处理器级别的示例：

```typescript
@Directive('@deprecated(reason: "This query will be removed in the next version")')
@Query(() => Author, { name: 'author' })
async getAuthor(@Args({ name: 'id', type: () => Int }) id: number) {
  return this.authorsService.findOneById(id);
}

```

> warn **警告** 通过 `@Directive()` 装饰器应用的指令将不反映在生成的 schema 定义文件中。

最后，确保在 `GraphQLModule` 中声明指令，例如：

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

> info **提示** `GraphQLDirective` 和 `DirectiveLocation` 都来自 `graphql` 包。

#### schema 优先

在 schema 优先方法中，直接在 SDL 中应用指令。

```graphql
directive @upper on FIELD_DEFINITION

type Post {
  id: Int!
  title: String! @upper
  votes: Int
}

```