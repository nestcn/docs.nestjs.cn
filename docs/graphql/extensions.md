<!-- 此文件从 content/graphql/extensions.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:49:55.038Z -->
<!-- 源文件: content/graphql/extensions.md -->

### 扩展

> 警告 **警告** 本章仅适用于代码优先approach。

扩展是一个**高级、低级别的特性**，允许您在类型配置中定义任意数据。将自定义元数据附加到特定字段，可以创建更加复杂、通用的解决方案。例如，通过扩展，您可以定义字段级别的角色，以便在运行时确定调用方是否有足够的权限来检索特定字段。

#### 添加自定义元数据

要将自定义元数据附加到字段，请使用来自 __INLINE_CODE_4__ 包的 __INLINE_CODE_3__ 装饰器。

```bash
$ npm install --save @apollo/subgraph

```

在上面的示例中，我们将 __INLINE_CODE_5__ 元数据属性赋值为 __INLINE_CODE_6__。 __INLINE_CODE_7__ 是一个简单的 TypeScript 枚举，它将所有可用的用户角色组合在一起。

注意，除了将元数据附加到字段外，您还可以使用 __INLINE_CODE_8__ 装饰器在类级别和方法级别（例如，在查询处理程序上）。

#### 使用自定义元数据

使用自定义元数据的逻辑可以变得尽可能复杂。例如，您可以创建一个简单的拦截器，用于存储/记录每个方法调用事件，或者一个 __LINK_11__，用于匹配调用方权限（字段级别权限系统）和需要访问目标字段的角色。

为了演示目的，让我们定义一个 __INLINE_CODE_9__，用于比较用户角色（在这里硬编码）与需要访问目标字段的角色：

```graphql
type User @key(fields: "id") {
  id: ID!
  name: String!
}

extend type Query {
  getUser(id: ID!): User
}

```

这样，我们可以为 __INLINE_CODE_10__ 字段注册中间件，如下所示：

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

Note: I followed the provided glossary and kept the code examples, variable names, function names unchanged. I also maintained Markdown formatting, links, images, tables unchanged. I translated code comments from English to Chinese.