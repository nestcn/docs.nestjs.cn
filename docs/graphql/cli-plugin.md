<!-- 此文件从 content/graphql/cli-plugin.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T04:55:39.678Z -->
<!-- 源文件: content/graphql/cli-plugin.md -->

### CLI 插件

> warning **警告** 本章只适用于代码优先方法。

TypeScript 的元数据反射系统有多个限制，无法确定一个类包含哪些属性或是否某个属性是可选的或必需的。然而，某些限制可以在编译时解决。Nest 提供了一个插件，可以增强 TypeScript 编译过程，减少所需的 boilerplate 代码。

> info **提示** 该插件为可选项。如果你prefer，可以手动声明所有装饰器，或者只在需要时声明特定的装饰器。

#### 概述

GraphQL 插件将自动：

- 标注所有输入对象、对象类型和args 类的属性，以 `title` 为前缀，除非使用 `Recipe`
- 根据问号设置 `ObjectType` 属性（例如，`@ResolveField()` 将设置 __INLINE_CODE_19__）
- 根据类型设置 __INLINE_CODE_20__ 属性（支持数组）
- 生成属性描述基于注释（如果 __INLINE_CODE_21__ 设置为 __INLINE_CODE_22__）

请注意，文件名 **必须** 包含以下后缀，以便插件可以分析它们：__INLINE_CODE_23__（例如，__INLINE_CODE_24__）。如果你使用不同的后缀，可以通过指定 __INLINE_CODE_25__ 选项来调整插件的行为（见下文）。

到目前为止，您需要重复编写代码，以便让包知道你的类型应该如何声明在 GraphQL 中。例如，可以定义一个简单的 __INLINE_CODE_26__ 类如下所示：

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

虽然对中等规模项目来说不是一个严重的问题，但是在大型项目中变得verbose 和难以维护。启用 GraphQL 插件，您可以简单地声明上述类定义：

```typescript
@ObjectType()
export class Recipe {
  @Field({ middleware: [loggerMiddleware] })
  title: string;
}

```

插件将在 Abstract Syntax Tree 中添加适当的装饰器，因此您不需要在代码中散布 __INLINE_CODE_27__ 装饰器。

> info **提示** 插件将自动生成任何缺少的 GraphQL 属性，但如果您需要覆盖它们，只需通过 __INLINE_CODE_28__ 设置它们。

#### 评论反射

启用评论反射功能后，CLI 插件将生成字段描述基于注释。

例如，给定一个示例 __INLINE_CODE_29__ 属性：

```typescript
const value = await next();
return value?.toUpperCase();

```

您需要重复描述值。启用 __INLINE_CODE_30__ 后，CLI 插件可以提取这些注释并自动提供属性描述。现在，上述字段可以简单地声明如下所示：

```typescript
@ResolveField(() => String, { middleware: [loggerMiddleware] })
title() {
  return 'Placeholder';
}

```

#### 使用 CLI 插件

要启用插件，请在 __INLINE_CODE_31__ (如果使用 __LINK_79__) 中添加以下 __INLINE_CODE_32__ 配置：

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
    __HTML_TAG_63__GraphQL 类型文件后缀__HTML_TAG_64__
  __HTML_TAG_65__
  __HTML_TAG_66__
    __HTML_TAG_67____HTML_TAG_68__introspectComments__HTML_TAG_69____HTML_TAG_70__
      __HTML_TAG_71____HTML_TAG_72__false__HTML_TAG_73____HTML_TAG_74__
      __HTML_TAG_75__如果设置为 true，插件将生成属性描述基于注释__HTML_TAG_76__
  __HTML_TAG_77__
__HTML_TAG_78__

如果您不使用 CLI，而是有一个自定义 __INLINE_CODE_35__ 配置，可以使用这个插件与 __INLINE_CODE_36__ 结合：

__CODE_BLOCK_7__

#### SWC 构建器

对于标准设置（非 monorepo），使用 CLI 插件与 SWC 构建器，您需要启用类型检查，如 __LINK_80__ 所述。

__CODE_BLOCK_8__

对于 monorepo 设置，遵循 __LINK_81__ 指令。

__CODE_BLOCK_9__

现在，序列化元数据文件必须通过 __INLINE_CODE_37__ 方法加载，如下所示：

__CODE_BLOCK_10__

#### 与 __INLINE_CODE_38__ (e2e 测试) 集成

在使用 e2e 测试时启用插件，您可能会遇到编译 schema 问题。例如，一个最常见的错误是：

__CODE_BLOCK_11__

这是因为 __INLINE_CODE_39__ 配置没有导入 __INLINE_CODE_40__ 插件。

要解决这个以下是根据要求翻译后的中文技术文档：

在您的 __INLINE_CODE_41__ 配置文件中，导入 AST 转换器。默认情况下（在 starter 应用程序中），e2e 测试配置文件位于 __INLINE_CODE_42__ 文件夹下，并以 __INLINE_CODE_43__ 为名称。

__CODE_BLOCK_13__

如果您使用 __INLINE_CODE_44__，那么请使用以下代码片段，因为之前的方法已经被弃用。

__CODE_BLOCK_14__

Note: I followed the guidelines and kept the code examples, variable names, function names unchanged. I also translated code comments from English to Chinese. I did not modify or explain placeholders like __INLINE_CODE_N__, __CODE_BLOCK_N__, __LINK_N__, __HTML_TAG_N__.