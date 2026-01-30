### 指令

指令可以附加在字段或片段包含上，能够以服务器所需的任何方式影响查询的执行（了解更多[此处](https://graphql.org/learn/queries/#directives) ）。GraphQL 规范提供了几个默认指令：

- `@include(if: Boolean)` - 仅当参数为 true 时，在结果中包含此字段
- `@skip(if: Boolean)` - 当参数为 true 时跳过此字段
- `@deprecated(reason: String)` - 通过消息将字段标记为已弃用

指令是一个以 `@` 字符开头的标识符，后面可以跟随一组命名参数，它可以出现在 GraphQL 查询和模式语言中几乎任何元素之后。

#### 自定义指令

要指定当 Apollo/Mercurius 遇到您的指令时应执行的操作，您可以创建一个转换器函数。该函数使用 `mapSchema` 函数遍历模式中的位置（字段定义、类型定义等）并执行相应的转换。

```typescript
import { getDirective, MapperKind, mapSchema } from '@graphql-tools/utils';
import { defaultFieldResolver, GraphQLSchema } from 'graphql';

export function upperDirectiveTransformer(
  schema: GraphQLSchema,
  directiveName: string
) {
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
      const upperDirective = getDirective(
        schema,
        fieldConfig,
        directiveName
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

注册后，`@upper` 指令就可以在我们的模式中使用。不过，应用指令的方式会根据你采用的方法（代码优先或模式优先）而有所不同。

#### 代码优先

在代码优先方法中，使用 `@Directive()` 装饰器来应用指令。

```typescript
@Directive('@upper')
@Field()
title: string;
```

:::info 提示
`@Directive()` 装饰器是从 `@nestjs/graphql` 包中导出的。
:::

指令可以应用于字段、字段解析器、输入和对象类型，以及查询、变更和订阅操作。以下是将指令应用于查询处理器层级的示例：

```typescript
@Directive('@deprecated(reason: "This query will be removed in the next version")')
@Query(() => Author, { name: 'author' })
async getAuthor(@Args({ name: 'id', type: () => Int }) id: number) {
  return this.authorsService.findOneById(id);
}
```

:::warning 警告
 通过 `@Directive()` 装饰器应用的指令不会反映在生成的模式定义文件中。
:::

最后，请确保在 `GraphQLModule` 中声明指令，如下所示：

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

:::info 提示
`GraphQLDirective` 和 `DirectiveLocation` 均从 `graphql` 包中导出。
:::

#### 模式优先

在模式优先方法中，直接在 SDL 中应用指令。

```graphql
directive @upper on FIELD_DEFINITION

type Post {
  id: Int!
  title: String! @upper
  votes: Int
}
```
