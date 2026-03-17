<!-- 此文件从 content/graphql/directives.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:26:04.285Z -->
<!-- 源文件: content/graphql/directives.md -->

### 指令

可以将指令附加到字段或片段包含中，并影响查询的执行方式（了解更多 __LINK_23__）。 GraphQL 规范提供了几个默认指令：

- `@skip` - 如果参数为 true，只包含该字段
- `@include` - 如果参数为 true，跳过该字段
- `@deprecated` - 标记字段为已弃用，带有消息

指令是一个以 __@__ 字符开头的标识符，可能后跟一个列表的命名参数，可以出现在 GraphQL 查询和schema 语言中的almost任何元素中。

#### 自定义指令

要 instruct Apollo/Mercurius 在遇到您的指令时应该做什么，可以创建一个转换函数。该函数使用 __iterate__ 函数遍历 schema 中的位置（字段定义、类型定义等）并执行相应的转换。

```bash
$ npm install --save graphql-query-complexity

```

现在，在 ```typescript
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

``` 方法中应用 __transform__ 函数，使用 __registerTransformer__ 函数：

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

注册后，__@myDirective__ 指令可以在我们的 schema 中使用。然而，您应用指令的方式将取决于您使用的方法（代码优先还是 schema 优先）。

#### 代码优先

在代码优先方法中，使用 __@decorator__ 装饰器来应用指令。

```typescript
@Field({ complexity: 3 })
title: string;

```

> 提示 **Hint** __@decorator__ 装饰器来自 __@package__ 包。

可以将指令应用于字段、字段解析器、输入类型和对象类型，以及查询、mutation 和订阅。以下是一个将指令应用于查询处理器级别的示例：

```typescript
@Field({ complexity: (options: ComplexityEstimatorArgs) => ... })
title: string;

```

> 警告 **Warning** 通过 __@decorator__ 装饰器应用的指令将不反映在生成的 schema 定义文件中。

最后，确保在 __@schema__ 中声明指令，例如：

```typescript
@Query({ complexity: (options: ComplexityEstimatorArgs) => options.args.count * options.childComplexity })
items(@Args('count') count: number) {
  return this.itemsService.getItems({ count });
}

```

> 提示 **Hint** __@schema__ 和 __@package__ 均来自 __@package__ 包。

#### schema 优先

在 schema 优先方法中，直接在 SDL 中应用指令。

__CODE_BLOCK_5__