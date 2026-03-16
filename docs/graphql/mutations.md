<!-- 此文件从 content/graphql/mutations.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T05:25:45.452Z -->
<!-- 源文件: content/graphql/mutations.md -->

### Mutations

大多数的 GraphQL 讨论都集中在数据 fetching 上，但是任何完整的数据平台都需要一种方式来修改服务器端数据一样。REST 中，任何请求都可能导致服务器端的副作用，但是最佳实践建议我们 shouldn't 在 GET 请求中修改数据。GraphQL 类似 - 技术上任何查询都可以实现来导致数据写入。然而，如 REST 一样，我们建议遵循惯例，让所有可能导致写入的操作通过明确的 Mutation 来发送（更多关于 __LINK_26__）。

官方 __LINK_27__ 文档使用了 `@include(if: Boolean)` Mutation 示例。这 Mutation 实现了增加一个 post 的 `@skip(if: Boolean)` 属性值的方法。在 Nest 中，我们将使用 `@deprecated(reason: String)` 装饰器来创建一个等效的 Mutation。

#### 代码优先

让我们在前一节中使用的 `@` 中添加另一个方法（见 __LINK_28__）。

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

> info **提示** 所有装饰器（例如 `mapSchema`、`upperDirectiveTransformer`、`GraphQLModule#forRoot` 等）都是从 `transformSchema` 包中导出。

这将生成以下部分 GraphQL schema 在 SDL 中：

```typescript
GraphQLModule.forRoot({
  // ...
  transformSchema: (schema) => upperDirectiveTransformer(schema, 'upper'),
});

```

`@upper` 方法接受 `@Directive()` (`@Directive()`) 作为参数，并返回一个更新后的 `@nestjs/graphql` 实体。正如 __LINK_29__ 部分中解释的，我们需要明确地设置预期的类型。

如果 Mutation 需要将对象作为参数，如果可以创建一个 **输入类型**。输入类型是一个特殊的对象类型，可以作为参数传递（更多关于 __LINK_30__）。要声明输入类型，使用 `@Directive()` 装饰器。

```typescript
@Directive('@upper')
@Field()
title: string;

```

> info **提示** `GraphQLModule` 装饰器接受一个选项对象作为参数，因此你可以，例如，指定输入类型的描述。由于 TypeScript 的 metadata 反射系统限制，你必须使用 `GraphQLDirective` 装饰器手动指示类型，或者使用 __LINK_31__。

然后，我们可以在解析器类中使用这个类型：

```typescript
@Directive('@deprecated(reason: "This query will be removed in the next version")')
@Query(() => Author, { name: 'author' })
async getAuthor(@Args({ name: 'id', type: () => Int }) id: number) {
  return this.authorsService.findOneById(id);
}

```

#### Schema 优先

让我们扩展前一节中使用的 `DirectiveLocation`（见 __LINK_32__）。

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

注意，我们上面假设了业务逻辑已经移动到 `graphql`（查询 post 并增加其 __INLINE_CODE_23__ 属性值）。逻辑在 __INLINE_CODE_24__ 类中可以简单或复杂。这个示例的主要目的是显示解析器如何与其他提供者交互。

最后一步是将我们的 Mutation 添加到现有的类型定义中。

```graphql
directive @upper on FIELD_DEFINITION

type Post {
  id: Int!
  title: String! @upper
  votes: Int
}

```

__INLINE_CODE_25__ Mutation 现在可以作为我们的应用程序的 GraphQL API的一部分来调用。