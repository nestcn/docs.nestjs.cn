<!-- 此文件从 content/graphql/unions-and-enums.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:47:39.011Z -->
<!-- 源文件: content/graphql/unions-and-enums.md -->

### 联合类型

联合类型与接口非常相似，但是它们不能指定公共字段之间的关系（更多信息 __LINK_50__）。联合类型非常有用，用于从单个字段返回多种数据类型。

#### 代码优先

要定义 GraphQL 联合类型，我们需要定义该联合类型将被组合的类。按照 Apollo 文档中的 __LINK_51__，我们将创建两个类。首先是 `GraphQLDirective`：

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

然后是 `DirectiveLocation`：

```typescript
GraphQLModule.forRoot({
  // ...
  transformSchema: (schema) => upperDirectiveTransformer(schema, 'upper'),
});

```

在这两类定义完成后，我们可以使用 __INLINE_CODE_24__ 包中的 __INLINE_CODE_23__ 函数来注册 `graphql` 联合类型：

```typescript
@Directive('@upper')
@Field()
title: string;

```

> warning **警告** __INLINE_CODE_25__ 属性返回的数组应被赋予 const 宣言。如果没有给定 const 宣言，在编译时将生成错误的声明文件，并且在其他项目中使用时将发生错误。

现在，我们可以在查询中引用 __INLINE_CODE_27__：

```typescript
@Directive('@deprecated(reason: "This query will be removed in the next version")')
@Query(() => Author, { name: 'author' })
async getAuthor(@Args({ name: 'id', type: () => Int }) id: number) {
  return this.authorsService.findOneById(id);
}

```

这将生成以下部分 GraphQL schema：

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

默认情况下，库将生成的 __INLINE_CODE_28__ 函数将根据 resolver 方法返回的值来确定类型。这意味着不能返回 JavaScript 对象字面量，而必须返回类实例。

要提供自定义的 __INLINE_CODE_29__ 函数，使用 __INLINE_CODE_31__ 函数的 options 对象中的 __INLINE_CODE_30__ 属性，例如：

```graphql
directive @upper on FIELD_DEFINITION

type Post {
  id: Int!
  title: String! @upper
  votes: Int
}

```

#### schema 优先

要使用 schema 优先方法定义联合类型，简单地创建一个 GraphQL 联合类型。

__CODE_BLOCK_6__

然后，您可以使用 typings 生成特性（如 __LINK_52__ 章节中所示）来生成相应的 TypeScript 定义：

__CODE_BLOCK_7__

联合类型需要在 resolver map 中添加额外的 __INLINE_CODE_32__ 字段，以确定该联合类型应该解析到哪个类型。同时，注意 __INLINE_CODE_33__ 类需要在任何模块中注册为提供者。让我们创建一个 __INLINE_CODE_34__ 类，并定义 __INLINE_CODE_35__ 方法。

__CODE_BLOCK_8__

> info **提示** 所有装饰器都来自 __INLINE_CODE_36__ 包。

### 枚举

枚举类型是一种特殊的标量，它被限制到特定的允许值集（更多信息 __LINK_53__）。这允许：

- 验证任何使用该类型的参数是否是允许的值之一
- 通过类型系统传播字段将总是具有有限集合值的信息

#### 代码优先

使用代码优先方法时，您可以简单地创建一个 TypeScript 枚举。

__CODE_BLOCK_9__

在这之后，我们可以使用 __INLINE_CODE_39__ 包中的 __INLINE_CODE_38__ 函数来注册 __INLINE_CODE_37__ 枚举：

__CODE_BLOCK_10__

现在，我们可以在类型中引用 __INLINE_CODE_40__：

__CODE_BLOCK_11__

这将生成以下部分 GraphQL schema：

__CODE_BLOCK_12__

要提供枚举的描述，使用 __INLINE_CODE_42__ 函数中的 __INLINE_CODE_41__ 属性，例如：

__CODE_BLOCK_13__

要提供枚举值的描述或将值标记为已弃用，使用 __INLINE_CODE_43__ 属性，例如：

__CODE_BLOCK_14__

这将生成以下 GraphQL schema：

__CODE_BLOCK_15__

#### schema 优先

使用 schema 优先方法定义枚举，简单地创建一个 GraphQL 枚举。

__CODE_BLOCK_16__

然后，您可以使用 typings 生成特性（如 __LINK_54__ 章节中所示）来生成相应的 TypeScript 定义：

__CODE_BLOCK_17__

有时候，后端强制在公共 API 中使用不同枚举值，而在解析器中使用不同的值（更多信息 __LINK_55__）。要实现这个，我们可以声明一个 resolver 对象来枚举 __INLINE_CODE_46__：

__CODE_BLOCK_18__

> info **提示** 所有装饰器都来自 __INLINE_CODE_47__ 包。

然后，我们可以使用这个 resolver 对象 together with __INLINE_CODE_49__ 属性的 __INLINE_CODE_48__ 属性，例如：

__CODE_BLOCK_19__