### 复杂度

> warning **警告** 本章仅适用于代码优先方法。

查询复杂度功能允许您定义特定字段的复杂程度，并通过设置**最大复杂度**来限制查询。其核心思想是使用简单数字来定义每个字段的复杂度，通常默认给每个字段分配 `1` 的复杂度值。此外，GraphQL 查询的复杂度计算可以通过所谓的复杂度估算器进行自定义。复杂度估算器是一个计算字段复杂度的简单函数，您可以在规则中添加任意数量的估算器，它们会按顺序依次执行。第一个返回数值型复杂度结果的估算器将决定该字段的最终复杂度。

`@nestjs/graphql` 包与 [graphql-query-complexity](https://github.com/slicknode/graphql-query-complexity) 等工具深度集成，后者提供了基于成本分析的解决方案。通过该库，您可以拒绝执行那些被认为代价过高的 GraphQL 服务器查询。

#### 安装

要开始使用它，我们首先需要安装所需的依赖项。

```bash
$ npm install --save graphql-query-complexity
```

#### 快速开始

安装过程完成后，我们就可以定义 `ComplexityPlugin` 类：

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
            `Query is too complex: ${complexity}. Maximum allowed complexity: ${maxComplexity}`
          );
        }
        console.log('Query Complexity:', complexity);
      },
    };
  }
}
```

出于演示目的，我们将允许的最大复杂度指定为 `20`。在上面的示例中，我们使用了 2 个估算器：`simpleEstimator` 和 `fieldExtensionsEstimator`。

- `simpleEstimator`：简单估算器为每个字段返回一个固定的复杂度值
- `fieldExtensionsEstimator`：字段扩展估算器用于提取模式中每个字段的复杂度值

> **提示** 请记得将此类添加到任意模块的 providers 数组中

#### 字段级复杂度

启用此插件后，我们现在可以通过在传入 `@Field()` 装饰器的选项对象中指定 `complexity` 属性来定义任意字段的复杂度，如下所示：

```typescript
@Field({ complexity: 3 })
title: string;
```

或者，你也可以定义估算函数：

```typescript
@Field({ complexity: (options: ComplexityEstimatorArgs) => ... })
title: string;
```

#### 查询/变更级别的复杂度

此外，`@Query()` 和 `@Mutation()` 装饰器可以像这样指定一个 `complexity` 属性：

```typescript
@Query({ complexity: (options: ComplexityEstimatorArgs) => options.args.count * options.childComplexity })
items(@Args('count') count: number) {
  return this.itemsService.getItems({ count });
}
```
