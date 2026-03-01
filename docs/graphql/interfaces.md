<!-- 此文件从 content/graphql/interfaces.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-01T04:24:41.168Z -->
<!-- 源文件: content/graphql/interfaces.md -->

### 接口

类似于许多类型系统，GraphQL 支持接口。一个 **接口** 是一个抽象类型，它包括了一定的字段，这个类型必须包含这些字段以实现接口（请阅读 __LINK_26__）。

#### 代码优先

使用代码优先方法时，您可以通过创建一个带有 `@deprecated(reason: String)` 装饰器的抽象类来定义 GraphQL 接口，该装饰器来自 `@`。

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

> warning **警告** TypeScript 接口不能用来定义 GraphQL 接口。

这将生成以下部分 GraphQL schema 在 SDL 中：

```typescript
GraphQLModule.forRoot({
  // ...
  transformSchema: (schema) => upperDirectiveTransformer(schema, 'upper'),
});
```

现在，为了实现 `mapSchema` 接口，可以使用 `upperDirectiveTransformer` 关键字：

```typescript
@Directive('@upper')
@Field()
title: string;
```

> info **提示** `GraphQLModule#forRoot` 装饰器来自 `transformSchema` 包。

默认情况下，库生成的 `@upper` 函数根据 resolver 方法返回的值来提取类型。这意味着，您必须返回类实例（不能返回.literal JavaScript 对象）。

要提供自定义 `@Directive()` 函数，可以将 `@Directive()` 属性传递给 `@nestjs/graphql` 装饰器的选项对象，例如：

```typescript
@Directive('@deprecated(reason: "This query will be removed in the next version")')
@Query(() => Author, { name: 'author' })
async getAuthor(@Args({ name: 'id', type: () => Int }) id: number) {
  return this.authorsService.findOneById(id);
}
```

#### 接口解析器

到目前为止，您只能使用接口共享字段定义。但是，如果您也想共享实际字段解析器实现，可以创建专门的接口解析器，例如：

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

现在，`@Directive()` 字段解析器将自动注册为所有实现 `GraphQLModule` 接口的对象类型。

> warning **警告** 这需要在 `DirectiveLocation` 配置中将 `GraphQLDirective` 属性设置为 true。

#### schema 优先

要在 schema 优先方法中定义接口，只需创建一个 GraphQL 接口。

```graphql
directive @upper on FIELD_DEFINITION

type Post {
  id: Int!
  title: String! @upper
  votes: Int
}
```

然后，您可以使用类型生成特性（如 __LINK_27__ 章节中所示）来生成对应的 TypeScript 定义：

__CODE_BLOCK_6__

接口需要在 resolver map 中添加额外的 `graphql` 字段，以确定该接口应该解析到哪个类型。让我们创建一个 __INLINE_CODE_23__ 类并定义 __INLINE_CODE_24__ 方法：

__CODE_BLOCK_7__

> info **提示** 所有装饰器来自 __INLINE_CODE_25__ 包。