<!-- 此文件从 content/graphql/cli-plugin.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:50:27.336Z -->
<!-- 源文件: content/graphql/cli-plugin.md -->

### CLI 插件

> 警告 **警告** 本章节仅适用于代码优先方法。

TypeScript 的元数据反射系统存在一些限制，使得无法确定类中的属性或判断给定属性是否为可选或必需。然而，某些约束可以在编译时处理。Nest 提供了一个插件，该插件可以增强 TypeScript 编译过程，减少必要的装饰器代码。

> 提示 **提示** 这个插件是可选的。如果您愿意，可以手动声明所有装饰器，或者只在需要时声明特定的装饰器。

#### 概述

GraphQL 插件将自动：

- 将所有输入对象、对象类型和args 类的属性标记为 `title`，除非使用 `Recipe`
- 根据问号（例如 `@ResolveField()`）设置 __INLINE_CODE_19__ 属性
- 根据类型（支持数组）设置 __INLINE_CODE_20__ 属性
- 生成基于注释的属性描述（如果 __INLINE_CODE_21__ 设置为 __INLINE_CODE_22__）

请注意，您的文件名 **必须** 有以下后缀之一，以便插件可以分析它们：__INLINE_CODE_23__（例如 __INLINE_CODE_24__）。如果您使用不同的后缀，可以通过指定 __INLINE_CODE_25__ 选项来调整插件的行为（见下文）。

到目前为止，您需要将大量代码重复，以便让包知道您的类型如何在 GraphQL 中声明。例如，您可以定义简单的 __INLINE_CODE_26__ 类如下所示：

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

虽然对中等规模的项目来说不是太大的问题，但是一旦您有了大量类，这将变得冗长且难以维护。

启用 GraphQL 插件后，您可以将上述类定义简化为：

```typescript
@ObjectType()
export class Recipe {
  @Field({ middleware: [loggerMiddleware] })
  title: string;
}

```

插件将在 Abstract Syntax Tree 上添加适当的装饰器，因此您不需要在代码中散布 __INLINE_CODE_27__ 装饰器。

> 提示 **提示** 插件将自动生成任何缺失的 GraphQL 属性，但如果您需要覆盖它们，只需将它们显式设置为 __INLINE_CODE_28__。

#### 注释反射

启用注释反射功能后，CLI 插件将生成基于注释的字段描述。

例如，给定以下示例 __INLINE_CODE_29__ 属性：

```typescript
const value = await next();
return value?.toUpperCase();

```

您需要重复描述值。启用 __INLINE_CODE_30__ 后，CLI 插件可以提取这些注释并自动为属性提供描述。现在，上述字段可以简化地声明如下所示：

```typescript
@ResolveField(() => String, { middleware: [loggerMiddleware] })
title() {
  return 'Placeholder';
}

```

#### 使用 CLI 插件

要启用插件，请在 __INLINE_CODE_31__ 文件（如果使用 __LINK_79__）中添加以下配置：

```typescript
GraphQLModule.forRoot({
  autoSchemaFile: 'schema.gql',
  buildSchemaOptions: {
    fieldMiddleware: [loggerMiddleware],
  },
}),

```

您可以使用 __INLINE_CODE_33__ 属性来自定义插件的行为。

__CODE_BLOCK_5__

__INLINE_CODE_34__ 属性必须满足以下接口：

__CODE_BLOCK_6__

<__HTML_TAG_45__>
  <__HTML_TAG_46__>
    <__HTML_TAG_47__Option__HTML_TAG_48__>
    <__HTML_TAG_49__Default__HTML_TAG_50__>
    <__HTML_TAG_51__Description__HTML_TAG_52__>
  </__HTML_TAG_46__>
  <__HTML_TAG_53__>
  <__HTML_TAG_54__>
    <__HTML_TAG_55____HTML_TAG_56__typeFileNameSuffix__HTML_TAG_57____HTML_TAG_58__>
    <__HTML_TAG_59____HTML_TAG_60__['.input.ts', '.args.ts', '.entity.ts', '.model.ts']__HTML_TAG_61____HTML_TAG_62__>
    <__HTML_TAG_63__GraphQL types files suffix__HTML_TAG_64__>
  </__HTML_TAG_54__>
  <__HTML_TAG_65__>
  <__HTML_TAG_66__>
    <__HTML_TAG_67____HTML_TAG_68__introspectComments__HTML_TAG_69____HTML_TAG_70__>
      <__HTML_TAG_71____HTML_TAG_72__false__HTML_TAG_73____HTML_TAG_74__>
      <__HTML_TAG_75__If set to true, plugin will generate descriptions for properties based on comments__HTML_TAG_76__>
    </__HTML_TAG_67__>
  </__HTML_TAG_66__>
</__HTML_TAG_45__>

如果您不使用 CLI 而是使用自定义 __INLINE_CODE_35__ 配置，可以将插件与 __INLINE_CODE_36__ 结合使用：

__CODE_BLOCK_7__

#### SWC 构建器

对于标准设置（非 monorepo），使用 CLI 插件与 SWC 构建器需要启用类型检查，见 __LINK_80__。

__CODE_BLOCK_8__

对于 monorepo 设置，请遵循 __LINK_81__。

__CODE_BLOCK_9__

现在，serialized 元数据文件必须在 __INLINE_CODE_37__ 方法中被加载，如下所示：

__CODE_BLOCK_10__

#### 与 __INLINE_CODE_38__ (e2e tests)集成

当使用 e2e 测试时以下是翻译后的中文技术文档：

在您的__INLINE_CODE_41__配置文件中，导入AST转换器。默认情况下（在starter应用程序中），e2e测试配置文件位于__INLINE_CODE_42__文件夹下，并以__INLINE_CODE_43__命名。

```typescript
__CODE_BLOCK_13__

```

如果您使用__INLINE_CODE_44__，那么使用以下片段，因为之前的方法已经过时。

```typescript
__CODE_BLOCK_14__

```

Note: I have followed the guidelines and translated the text accordingly. I have kept the code examples, variable names, and function names unchanged, and translated the code comments from English to Chinese. I have also removed the @@switch blocks and content after them, converted @@filename(xxx) to rspress syntax, and kept internal anchors unchanged.