<!-- 此文件从 content/graphql/scalars.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-01T04:24:31.179Z -->
<!-- 源文件: content/graphql/scalars.md -->

### Scalars

GraphQL 对象类型有一个名称和字段，但是有一些时候那些字段必须_resolve_到某些具体数据。Scalar 类型就是这些数据的代表：它们是查询的叶子节点（详见 __LINK_80__）。 GraphQL 包括以下默认类型：__INLINE_CODE_20__、__INLINE_CODE_21__、__INLINE_CODE_22__、__INLINE_CODE_23__ 和 __INLINE_CODE_24__。除了这些内置类型外，您可能需要支持自定义原子数据类型（例如、__INLINE_CODE_25__）。

#### Code first

代码优先方法提供了五个 scalar，其中三者是对现有 GraphQL 类型的简单别名。

- __INLINE_CODE_26__（别名为 __INLINE_CODE_27__）- 代表一个唯一标识符，通常用于重新获取对象或作为缓存的键
- __INLINE_CODE_28__（别名为 __INLINE_CODE_29__）- 一个有符号的 32 位整数
- __INLINE_CODE_30__（别名为 __INLINE_CODE_31__）- 一个有符号的双精度浮点值
- __INLINE_CODE_32__ - 一个 UTC 日期时间字符串（用于默认表示 __INLINE_CODE_33__ 类型）
- __INLINE_CODE_34__ - 一个有符号的整数，表示 UNIX epoch 的毫秒数

__INLINE_CODE_35__（例如、__INLINE_CODE_36__）用于默认表示 __INLINE_CODE_37__ 类型。要使用 __INLINE_CODE_38__ 而不是 __INLINE_CODE_39__，请将 __INLINE_CODE_40__ 对象的 __INLINE_CODE_41__ 设置为 __INLINE_CODE_42__，如下所示：

```typescript
import { FieldMiddleware, MiddlewareContext, NextFn } from '@nestjs/graphql';

const loggerMiddleware: FieldMiddleware = async (
  ctx: MiddlewareContext,
  next: NextFn,
) => {
  const value = await next();
  console.log(value);
  return value;
};
```

类似地，__INLINE_CODE_42__用于默认表示 __INLINE_CODE_43__ 类型。要使用 __INLINE_CODE_44__ 而不是 __INLINE_CODE_45__，请将 __INLINE_CODE_46__ 对象的 __INLINE_CODE_47__ 设置为 __INLINE_CODE_48__，如下所示：

```typescript
@ObjectType()
export class Recipe {
  @Field({ middleware: [loggerMiddleware] })
  title: string;
}
```

此外，您还可以创建自定义 scalar。

#### Override a default scalar

要创建一个自定义的 __INLINE_CODE_48__ scalar，简单地创建一个新类。

```typescript
const value = await next();
return value?.toUpperCase();
```

然后，注册 __INLINE_CODE_49__ 作为提供者。

```typescript
@ResolveField(() => String, { middleware: [loggerMiddleware] })
title() {
  return 'Placeholder';
}
```

现在，我们可以在我们的类中使用 __INLINE_CODE_50__ 类型。

```typescript
GraphQLModule.forRoot({
  autoSchemaFile: 'schema.gql',
  buildSchemaOptions: {
    fieldMiddleware: [loggerMiddleware],
  },
}),
```

#### Import a custom scalar

要使用自定义 scalar，导入并注册它作为解析器。我们将使用 __INLINE_CODE_51__ 包作为示例。这个 npm 包定义了一个 __INLINE_CODE_52__ GraphQL scalar 类型。

首先，安装包：

__CODE_BLOCK_5__

安装完成后，我们将自定义解析器传递给 __INLINE_CODE_53__ 方法：

__CODE_BLOCK_6__

现在，我们可以在我们的类中使用 __INLINE_CODE_54__ 类型。

__CODE_BLOCK_7__

#### Create a custom scalar

要定义一个自定义 scalar，创建一个新 __INLINE_CODE_55__ 实例。我们将创建一个自定义 __INLINE_CODE_56__ scalar。

__CODE_BLOCK_8__

然后，我们将自定义解析器传递给 __INLINE_CODE_57__ 方法：

__CODE_BLOCK_9__

现在，我们可以在我们的类中使用 __INLINE_CODE_58__ 类型。

__CODE_BLOCK_10__

#### Schema first

要定义一个自定义 scalar（详见关于 scalars 的更多信息 __LINK_82__），创建一个类型定义和一个专门的解析器。这里，我们将使用 __INLINE_CODE_59__ 包作为示例。这个 npm 包定义了一个 __INLINE_CODE_60__ GraphQL scalar 类型。

首先，安装包：

__CODE_BLOCK_11__

安装完成后，我们将自定义解析器传递给 __INLINE_CODE_61__ 方法：

__CODE_BLOCK_12__

现在，我们可以在我们的类型定义中使用 __INLINE_CODE_62__ scalar。

__CODE_BLOCK_13__

另一种方法是创建一个简单的类。假设我们想以 __INLINE_CODE_63__ 类型增强我们的 schema。

__CODE_BLOCK_14__

然后，注册 __INLINE_CODE_64__ 作为提供者。

__CODE_BLOCK_15__

现在，我们可以在我们的类型定义中使用 __INLINE_CODE_65__ scalar。

__CODE_BLOCK_16__

默认情况下，Nest 生成的 TypeScript 定义将所有 scalar 定义为 __INLINE_CODE_66__ - 这不是特别类型安全的。但是，您可以配置 Nest 如何生成类型定义的自定义 scalar：

__CODE_BLOCK_17__

> info **Hint** 另外，您可以使用 type reference 来代替，例如：__INLINE_CODE_67__。在这种情况