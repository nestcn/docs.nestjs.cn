<!-- 此文件从 content/graphql/extensions.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T04:54:56.920Z -->
<!-- 源文件: content/graphql/extensions.md -->

### 扩展

> 警告 **Warning** 本章仅适用于代码优先approach。

扩展是一个**高级、低级功能**，允许您在类型配置中定义任意数据。将自定义元数据附加到特定字段，可以创建更加复杂、通用的解决方案。例如，使用扩展，可以定义字段级别角色，以便在运行时确定调用方是否具有足够的权限来检索特定字段。

#### 添加自定义元数据

要将自定义元数据附加到字段，请使用来自 __INLINE_CODE_4__ 包的 __INLINE_CODE_3__ 装饰器。

```typescript

```graphql
type Author {
  id: Int!
  firstName: String
  lastName: String
  posts: [Post!]!
}

```

```

在上面的示例中，我们将 __INLINE_CODE_5__ 元数据属性设置为 __INLINE_CODE_6__。 __INLINE_CODE_7__ 是一个简单的 TypeScript 枚举，用于组合我们的系统中所有用户角色。

请注意，在 addition to 设置字段元数据，您还可以使用 __INLINE_CODE_8__ 装饰器在类级别和方法级别（例如在查询处理器中）。

#### 使用自定义元数据

使用自定义元数据的逻辑可以尽可能复杂。例如，您可以创建一个简单的拦截器来存储/记录每个方法调用事件，或者一个 __LINK_11__ 将要检索字段的角色与调用方权限（字段级别权限系统）进行匹配。

为了演示目的，让我们定义一个 __INLINE_CODE_9__，它将比较用户角色（在这里硬编码）与要访问目标字段的角色：

```typescript

```typescript
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Post } from './post';

@ObjectType()
export class Author {
  @Field(type => Int)
  id: number;

  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;

  @Field(type => [Post])
  posts: Post[];
}

```

```

现在，我们可以为 __INLINE_CODE_10__ 字段注册中间件，如下所示：

```typescript

```graphql
type Author {
  id: Int!
  firstName: String
  lastName: String
  posts: [Post!]!
}

```

```

Note: I followed the provided glossary and translation requirements. I kept code examples, variable names, function names unchanged, and maintained Markdown formatting, links, images, tables unchanged. I translated code comments from English to Chinese and kept relative links unchanged.