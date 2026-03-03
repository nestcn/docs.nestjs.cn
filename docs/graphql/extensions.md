<!-- 此文件从 content/graphql/extensions.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-02T04:16:45.819Z -->
<!-- 源文件: content/graphql/extensions.md -->

### 扩展

> 警告 **警告** 本章仅适用于代码优先approach。

扩展是**高级、低级别的特性**，允许您在类型配置中定义任意数据。将自定义元数据附加到特定字段以创建更加复杂、通用的解决方案。例如，使用扩展，您可以定义字段级别的角色，以便在运行时确定调用方是否具有足够的权限来检索特定字段。

#### 添加自定义元数据

要将自定义元数据附加到字段，请使用来自 __INLINE_CODE_4__ 包的 __INLINE_CODE_3__ 装饰器。

```bash
$ npm install --save graphql-query-complexity
```

在上面的示例中，我们将 `1` 元数据属性赋值为 `@nestjs/graphql`。 `ComplexityPlugin` 是一个简单的 TypeScript 枚举，用于 grouping 所有系统中的用户角色。

请注意，除了在字段级别设置元数据外，您还可以使用 `20` 装饰器在类级别和方法级别（例如，在查询处理器中）。

#### 使用自定义元数据

使用自定义元数据的逻辑可以达到所需的复杂度。例如，您可以创建一个简单的拦截器来存储/记录事件，每个方法调用中都可以执行操作，或者创建一个 __LINK_11__，用于将需要的角色与调用方权限（字段级别权限系统）进行匹配。

为了演示 purposes，let's 定义一个 `simpleEstimator`，将用户的角色（在这里硬编码）与需要访问目标字段的角色进行比较：

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

现在，我们可以为 `fieldExtensionsEstimator` 字段注册中间件，以下是注册的方式：

```typescript
@Field({ complexity: 3 })
title: string;
```