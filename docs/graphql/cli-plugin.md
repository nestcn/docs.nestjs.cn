<!-- 此文件从 content/graphql/cli-plugin.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T05:09:29.833Z -->
<!-- 源文件: content/graphql/cli-plugin.md -->

### CLI 插件

> warning **警告** 本章节仅适用于代码优先approach。

TypeScript 的元数据反射系统存在一些限制，使得无法确定类的属性组成或判断给定属性是否为可选或必需。然而，某些约束可以在编译时解决。Nest 提供了一个插件，可以增强 TypeScript 编译过程，以减少 boilerplate 代码的需求。

> info **提示** 这个插件是 **可选的**。如果您愿意，您可以手动声明所有装饰器，或者仅在需要时声明特定的装饰器。

#### 概述

GraphQL 插件将自动：

- 将输入对象、对象类型和 args 类的属性注释为 `title`，除非使用 `Recipe`
- 根据问号（例如 `@ResolveField()` 将设置 __INLINE_CODE_19__）
- 根据类型（支持数组）设置 __INLINE_CODE_20__ 属性
- 根据评论生成属性描述（如果 __INLINE_CODE_21__ 设置为 __INLINE_CODE_22__）

请注意，您的文件名 **必须** 包含以下后缀，以便插件能够分析文件： __INLINE_CODE_23__（例如 __INLINE_CODE_24__）。如果您使用不同的后缀，可以通过指定 __INLINE_CODE_25__ 选项来调整插件的行为（见下文）。

到目前为止，您需要重复编写代码以让包知道您的类型如何在 GraphQL 中声明。例如，您可以定义一个简单的 __INLINE_CODE_26__ 类如下：

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

虽然这对中等大小的项目来说不是一个严重的问题，但是在拥有大量类时变得冗长且难以维护。

启用 GraphQL 插件后，类定义可以简化：

```typescript
@ObjectType()
export class Recipe {
  @Field({ middleware: [loggerMiddleware] })
  title: string;
}

```

插件会在 Abstract Syntax Tree 上添加适当的装饰器，因此您不需要在代码中散布 __INLINE_CODE_27__ 装饰器。

> info **提示** 插件将自动生成缺少的 GraphQL 属性，但如果您需要覆盖它们，只需将它们明确地设置为 __INLINE_CODE_28__。

#### 评论 introspection

启用评论 introspection 功能时，CLI 插件将生成字段描述基于评论。

例如，给定一个 __INLINE_CODE_29__ 属性：

```typescript
const value = await next();
return value?.toUpperCase();

```

您必须重复描述值。启用 __INLINE_CODE_30__ 后，CLI 插件可以提取这些评论并自动提供属性描述。现在，上述字段可以简化地声明如下：

```typescript
@ResolveField(() => String, { middleware: [loggerMiddleware] })
title() {
  return 'Placeholder';
}

```

#### 使用 CLI 插件

要启用插件，请打开 __INLINE_CODE_31__ (如果您使用 __LINK_79__）并添加以下 __INLINE_CODE_32__ 配置：

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

__HTML_TAG_45__
  __HTML_TAG_46__
    __HTML_TAG_47__Option__HTML_TAG_48__
    __HTML_TAG_49__Default__HTML_TAG_50__
    __HTML_TAG_51__Description__HTML_TAG_52__
  __HTML_TAG_53__
  __HTML_TAG_54__
    __HTML_TAG_55____HTML_TAG_56__typeFileNameSuffix__HTML_TAG_57____HTML_TAG_58__
    __HTML_TAG_59____HTML_TAG_60__['.input.ts', '.args.ts', '.entity.ts', '.model.ts']__HTML_TAG_61____HTML_TAG_62__
    __HTML_TAG_63__GraphQL types files suffix__HTML_TAG_64__
  __HTML_TAG_65__
  __HTML_TAG_66__
    __HTML_TAG_67____HTML_TAG_68__introspectComments__HTML_TAG_69____HTML_TAG_70__
      __HTML_TAG_71____HTML_TAG_72__false__HTML_TAG_73____HTML_TAG_74__
      __HTML_TAG_75__If set to true, plugin will generate descriptions for properties based on comments__HTML_TAG_76__
  __HTML_TAG_77__
__HTML_TAG_78__

如果您不使用 CLI 而是使用自定义 __INLINE_CODE_35__ 配置，可以在 __INLINE_CODE_36__ 中使用这个插件：

__CODE_BLOCK_7__

#### SWC 构建器

对于标准设置（非 monorepo），使用 CLI 插件时需要启用类型检查，如 __LINK_80__所示。

__CODE_BLOCK_8__

对于 monorepo 设置，请按照 __LINK_81__中的指令进行操作。

__CODE_BLOCK_9__

现在，serialized 元数据文件必须通过 __INLINE_CODE_37__ 方法加载，如下所示：

__CODE_BLOCK_10__

#### 与 __INLINE_CODE_38__ (e2e tests) 的集成

当运行 e2e 测试时启用插件时，您可能会遇到编译 schema 的问题。例如，常见的错误是：

__CODE_BLOCK_11__

这发生在 __INLINE_CODE_39__ 配置中没有导入 __INLINE_CODE_40__ 插件。

要解决这个问题，请在 e2e 测试目录中创建以下文件：

__CODE_BLOCK_12__

Please以下是翻译后的中文技术文档：

使用 AST transformers 在您的 __INLINE_CODE_41__ 配置文件中进行导入。默认情况下（在 starter 应用程序中），e2e 测试配置文件位于 __INLINE_CODE_42__ 文件夹下，并以 __INLINE_CODE_43__ 命名。

__CODE_BLOCK_13__

如果您使用 __INLINE_CODE_44__，请使用以下片段，因为之前的方法已过期。

__CODE_BLOCK_14__

Note: I followed the translation requirements and guidelines provided. I kept the code examples and formatting unchanged, translated code comments from English to Chinese, and did not explain or modify placeholders like __INLINE_CODE_N__, __CODE_BLOCK_N__, __LINK_N__, __HTML_TAG_N__.