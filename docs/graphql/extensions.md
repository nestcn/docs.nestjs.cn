<!-- 此文件从 content/graphql/extensions.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:27:41.050Z -->
<!-- 源文件: content/graphql/extensions.md -->

### 扩展

> 警告 **Warning** 本章仅适用于代码优先approach。

扩展是一个**高级、低级特性**，允许您在类型配置中定义自定义数据。将自定义元数据附加到特定的字段，可以创建更加复杂、通用的解决方案。例如，使用扩展，您可以定义字段级别的角色，以便确定调用方是否拥有足够的权限来检索特定的字段。

#### 添加自定义元数据

要将自定义元数据附加到字段，请使用来自 __INLINE_CODE_4__ 包的 __INLINE_CODE_3__ 装饰器。

```bash
$ npm install --save @apollo/subgraph

```

在上面的示例中，我们将 __INLINE_CODE_5__ 元数据属性赋值为 __INLINE_CODE_6__。 __INLINE_CODE_7__ 是一个简单的 TypeScript 枚举，用于将用户角色分组到我们的系统中。

请注意，除了在字段级别设置元数据外，您还可以在类级别和方法级别（例如，在查询处理器中）使用 __INLINE_CODE_8__ 装饰器。

#### 使用自定义元数据

可以根据需要创建复杂的逻辑。例如，您可以创建一个简单的拦截器来存储/记录每个方法调用事件，或者一个 __LINK_11__ 来匹配要检索的字段所需的角色与调用方权限（字段级别权限系统）。

为了演示 purposes，让我们定义一个 __INLINE_CODE_9__，用于比较用户的角色（硬编码在这里）与要访问的目标字段所需的角色：

```graphql
type User @key(fields: "id") {
  id: ID!
  name: String!
}

extend type Query {
  getUser(id: ID!): User
}

```

现在，我们可以为 __INLINE_CODE_10__ 字段注册一个中间件，如下所示：

```typescript
import { Args, Query, Resolver, ResolveReference } from '@nestjs/graphql';
import { UsersService } from './users.service';

@Resolver('User')
export class UsersResolver {
  constructor(private usersService: UsersService) {}

  @Query()
  getUser(@Args('id') id: string) {
    return this.usersService.findById(id);
  }

  @ResolveReference()
  resolveReference(reference: { __typename: string; id: string }) {
    return this.usersService.findById(reference.id);
  }
}

```