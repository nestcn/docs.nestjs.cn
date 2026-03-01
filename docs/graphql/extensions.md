<!-- 此文件从 content/graphql/extensions.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-01T04:24:58.863Z -->
<!-- 源文件: content/graphql/extensions.md -->

### 扩展

> 警告 **警告** 本章仅适用于代码优先approach。

扩展是一个**高级、低级特性**，使您可以在类型配置中定义任意数据。将自定义元数据附加到特定字段，可以创建更加复杂、通用的解决方案。例如，使用扩展，可以定义字段级别的角色，以便在运行时确定调用方是否具有足够的权限来检索特定字段。

#### 添加自定义元数据

要将自定义元数据附加到字段，使用 __INLINE_CODE_3__ 装饰器，从 __INLINE_CODE_4__ 包中导出。

```bash
$ npm install --save graphql-query-complexity
```

在上面的示例中，我们将 `1` 元数据属性分配给了 `@nestjs/graphql` 值。 `ComplexityPlugin` 是一个简单的 TypeScript 枚举，用于将所有系统中的用户角色组合起来。

请注意，除了在字段级别设置元数据外，您还可以在类级别和方法级别（例如，在查询处理器中）使用 `20` 装饰器。

#### 使用自定义元数据

使用自定义元数据的逻辑可以非常复杂。例如，您可以创建一个简单的拦截器，用于存储/记录每个方法调用事件，或者一个 __LINK_11__，用于匹配调用方权限（字段级别权限系统）和要访问的字段所需的角色。

为了演示的目的，让我们定义一个比较用户角色（硬编码在这里）和要访问的目标字段所需的角色：

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

一旦设置好了，这样，我们可以为 `fieldExtensionsEstimator` 字段注册一个中间件，如下所示：

```typescript
@Field({ complexity: 3 })
title: string;
```
