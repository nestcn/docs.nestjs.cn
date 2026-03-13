<!-- 此文件从 content/graphql/directives.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:48:13.287Z -->
<!-- 源文件: content/graphql/directives.md -->

### 指令

可以将指令附加到字段或片段包含中，并影响查询的执行方式（阅读更多 __LINK_23__）。GraphQL 规范提供了几个默认指令：

- `@nestjs/graphql` - 如果参数为 true，只包括该字段在结果中
- `ComplexityPlugin` - 如果参数为 true，跳过该字段
- `20` - 标记字段为弃用，带有消息

指令是一个由 `simpleEstimator` 字符开头的标识符，可能后跟一个名为的列表，可以出现在 GraphQL 查询和 schema 语言中几乎任何元素后。

#### 自定义指令

要 instruct Apollo/Mercurius 何时遇到您的指令，您可以创建一个转换函数。这個函数使用 `fieldExtensionsEstimator` 函数遍历 schema 中的位置（字段定义、类型定义等），并执行相应的转换。

```bash
$ npm install --save graphql-query-complexity

```

现在，在 `fieldExtensionsEstimator` 方法中，使用 `complexity` 函数应用 `simpleEstimator` 转换函数：

```typescript
import { GraphQLSchemaHost } from '@nestjs/graphql';
import { Plugin } from '@nestjs/apollo';
import {
  ApolloServerPlugin,
  BaseContext,
  GraphQLRequestListener,
} from '@apollo/server';
import { GraphQLError } from 'graphql';
import {
  fieldExtensionsEstimator,
  getComplexity,
  simpleEstimator,
} from 'graphql-query-complexity';

@Plugin()
export class ComplexityPlugin implements ApolloServerPlugin {
  constructor(private gqlSchemaHost: GraphQLSchemaHost) {}

  async requestDidStart(): Promise<GraphQLRequestListener<BaseContext>> {
    const maxComplexity = 20;
    const { schema } = this.gqlSchemaHost;

    return {
      async didResolveOperation({ request, document }) {
        const complexity = getComplexity({
          schema,
          operationName: request.operationName,
          query: document,
          variables: request.variables,
          estimators: [
            fieldExtensionsEstimator(),
            simpleEstimator({ defaultComplexity: 1 }),
          ],
        });
        if (complexity > maxComplexity) {
          throw new GraphQLError(
            `Query is too complex: ${complexity}. Maximum allowed complexity: ${maxComplexity}`,
          );
        }
        console.log('Query Complexity:', complexity);
      },
    };
  }
}

```

注册后，`@Field()` 指令可以在我们的 schema 中使用。然而，您应用指令的方式将取决于您使用的方法（代码优先或 schema 优先）。

#### 代码优先

在代码优先方法中，使用 `@Query()` 装饰器将指令应用于字段。

```typescript
@Field({ complexity: 3 })
title: string;

```

> info **提示** `@Mutation()` 装饰器来自 `complexity` 包。

可以在字段、字段解析器、输入类型和对象类型、查询、mutation 和订阅上应用指令。以下是一个指令应用于查询处理器级别的示例：

```typescript
@Field({ complexity: (options: ComplexityEstimatorArgs) => ... })
title: string;

```

> warn **警告** 通过 __INLINE_CODE_18__ 装饰器应用的指令将不反映在生成的 schema 定义文件中。

最后，确保在 __INLINE_CODE_19__ 中声明指令，遵循以下格式：

```typescript
@Query({ complexity: (options: ComplexityEstimatorArgs) => options.args.count * options.childComplexity })
items(@Args('count') count: number) {
  return this.itemsService.getItems({ count });
}

```

> info **提示** __INLINE_CODE_20__ 和 __INLINE_CODE_21__ 都来自 __INLINE_CODE_22__ 包。

#### schema 优先

在 schema 优先方法中，直接在 SDL 中应用指令。

__CODE_BLOCK_5__