<!-- 此文件从 content/graphql/scalars.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-02T04:16:19.035Z -->
<!-- 源文件: content/graphql/scalars.md -->

### Scalars

GraphQL 对象类型具有名称和字段，但是有一些点，这些字段需要转换为具体数据。这种情况下，scalar 类型就发挥了作用：它们代表查询的叶子节点。GraphQL 包括以下默认类型：__INLINE_CODE_20__, __INLINE_CODE_21__, __INLINE_CODE_22__, __INLINE_CODE_23__ 和 __INLINE_CODE_24__。此外，您可能需要支持自定义原子数据类型（例如 __INLINE_CODE_25__）。

#### Code first

代码优先方法带来五个 scalar，在其中三个是对现有 GraphQL 类型的简单别名。

- __INLINE_CODE_26__（别名为 __INLINE_CODE_27__）- 表示唯一标识符，通常用于重新获取对象或作为缓存的键
- __INLINE_CODE_28__（别名为 __INLINE_CODE_29__）- 签名 32 位整数
- __INLINE_CODE_30__（别名为 __INLINE_CODE_31__）- 签名双精度浮点值
- __INLINE_CODE_32__ - UTC 日期时间字符串（默认用于表示 __INLINE_CODE_33__ 类型）
- __INLINE_CODE_34__ - 签名整数，表示 UNIX epoch 的开始时间以毫秒为单位

__INLINE_CODE_35__（例如 __INLINE_CODE_36__）用于默认表示 __INLINE_CODE_37__ 类型。要使用 __INLINE_CODE_38__ 而不是 __INLINE_CODE_35__，请将 __INLINE_CODE_39__ 设置为 __INLINE_CODE_41__，如下所示：

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

同样，__INLINE_CODE_42__用于默认表示 __INLINE_CODE_43__ 类型。要使用 __INLINE_CODE_44__ 而不是 __INLINE_CODE_42__，请将 __INLINE_CODE_45__ 设置为 __INLINE_CODE_47__，如下所示：

```typescript
@ObjectType()
export class Recipe {
  @Field({ middleware: [loggerMiddleware] })
  title: string;
}
```

此外，您可以创建自定义 scalar。

#### Override a default scalar

要创建 __INLINE_CODE_48__ scalar 的自定义实现，只需创建一个新类。

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

现在，我们可以在类中使用 __INLINE_CODE_50__ 类型。

```typescript
GraphQLModule.forRoot({
  autoSchemaFile: 'schema.gql',
  buildSchemaOptions: {
    fieldMiddleware: [loggerMiddleware],
  },
}),
```

#### Import a custom scalar

要使用自定义 scalar，首先需要安装包。

__CODE_BLOCK_5__

安装包后，我们将自定义 resolver 传递给 __INLINE_CODE_53__ 方法。

__CODE_BLOCK_6__

现在，我们可以在类中使用 __INLINE_CODE_54__ 类型。

__CODE_BLOCK_7__

#### Create a custom scalar

要定义自定义 scalar，创建一个新 __INLINE_CODE_55__ 实例。我们将创建一个自定义 __INLINE_CODE_56__ scalar。

__CODE_BLOCK_8__

然后，我们将自定义 resolver 传递给 __INLINE_CODE_57__ 方法。

__CODE_BLOCK_9__

现在，我们可以在类中使用 __INLINE_CODE_58__ 类型。

__CODE_BLOCK_10__

#### Schema first

要定义自定义 scalar（了解更多关于 scalars 的信息 __LINK_82__），创建一个类型定义和一个专门的 resolver。在这里，使用 __INLINE_CODE_59__ 包作为示例。这个 npm 包定义了一个 __INLINE_CODE_60__ GraphQL_scalar 类型。

首先，安装包。

__CODE_BLOCK_11__

安装包后，我们将自定义 resolver 传递给 __INLINE_CODE_61__ 方法。

__CODE_BLOCK_12__

现在，我们可以在类型定义中使用 __INLINE_CODE_62__ scalar。

__CODE_BLOCK_13__

另外，还可以使用简单类来定义 scalar 类型。假设我们想向 schema 中添加 __INLINE_CODE_63__ 类型。

__CODE_BLOCK_14__

然后，注册 __INLINE_CODE_64__ 作为提供者。

__CODE_BLOCK_15__

现在，我们可以在类型定义中使用 __INLINE_CODE_65__ scalar。

__CODE_BLOCK_16__

默认情况下，Nest 生成的 TypeScript 定义对于所有 scalar 都是 __INLINE_CODE_66__，这不是特别安全。但是，您可以配置 Nest 生成 typings 的方式。

__CODE_BLOCK_17__

> info **Hint** 或者，您可以使用 type reference alternatively，例如：__INLINE_CODE_67__。在这种情况下，__INLINE_CODE_68__ 将从指定类型的 __INLINE_CODE_69__ 属性中提取名称，以生成 TS 定义。注意：对于非内置类型（自定义类型），需要添加导入语句。

现在，我们将看到以下生成的 TypeScript 定义在 __INLINE_CODE_70__ 中：

__CODE_BLOCK_19__