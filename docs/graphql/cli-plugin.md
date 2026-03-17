<!-- 此文件从 content/graphql/cli-plugin.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:28:18.606Z -->
<!-- 源文件: content/graphql/cli-plugin.md -->

### CLI 插件

> 警告 **Warning** 本章仅适用于代码优先approach。

TypeScript 的元数据反射系统存在一些限制，使得无法确定一个类包含的属性或判断一个给定的属性是否是可选的或必需的。然而，Nest 提供了一个插件，可以在编译时解决一些限制。该插件可以减少 boilerplate 代码的数量。

> 提示 **Hint** 该插件是可选的。您可以手动声明所有装饰器，或者只声明需要的装饰器。

#### 概述

 GraphQL 插件将自动：

* 将所有输入对象、对象类型和 args 类的属性注释为 `title`，除非使用 `Recipe`
* 设置 `ObjectType` 属性，依据问号 (例如， `@ResolveField()` 将设置 __INLINE_CODE_19__)
* 设置 __INLINE_CODE_20__ 属性，依据类型 (支持数组)
* 生成属性描述基于注释 (如果 __INLINE_CODE_21__ 设置为 __INLINE_CODE_22__)

请注意，您的文件名 **必须** 包含以下之一，以便插件能够分析： __INLINE_CODE_23__ (例如， __INLINE_CODE_24__）。如果您使用不同的后缀，可以通过指定 __INLINE_CODE_25__ 选项来调整插件的行为 (见下文）。

现在，我们已经了解了这些，我们需要重复大量代码，以便让包知道您的类型应该如何在 GraphQL 中声明。例如，您可以定义一个简单的 __INLINE_CODE_26__ 类如下所示：

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

虽然这对中等规模的项目来说不是问题，但是在大型项目中变得verbose & hard to maintain。

启用 GraphQL 插件后，可以将上述类定义简化为：

```typescript
@ObjectType()
export class Recipe {
  @Field({ middleware: [loggerMiddleware] })
  title: string;
}

```

插件将在 Abstract Syntax Tree 上添加适当的装饰器，从而您不需要在代码中散布 __INLINE_CODE_27__ 装饰器。

> 提示 **Hint** 插件将自动生成任何缺失的 GraphQL 属性，但是如果您需要覆盖它们，只需设置它们显式地 via __INLINE_CODE_28__。

#### 评论反射

启用评论反射功能后，CLI 插件将生成字段描述基于注释。

例如，给定一个示例 __INLINE_CODE_29__ 属性：

```typescript
const value = await next();
return value?.toUpperCase();

```

您需要重复描述值。启用 __INLINE_CODE_30__ 后，CLI 插件可以提取这些注释并自动提供属性描述。现在，上述字段可以简化为：

```typescript
@ResolveField(() => String, { middleware: [loggerMiddleware] })
title() {
  return 'Placeholder';
}

```

#### 使用 CLI 插件

要启用插件，请打开 __INLINE_CODE_31__ (如果使用 __LINK_79__)，并添加以下 __INLINE_CODE_32__ 配置：

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

如果您不使用 CLI 而是使用自定义 __INLINE_CODE_35__ 配置，可以将插件与 __INLINE_CODE_36__ 结合使用：

__CODE_BLOCK_7__

#### SWC 构建器

对于标准设置（非 monorepo），使用 CLI 插件与 SWC 构建器，您需要启用类型检查，如描述 __LINK_80__。

__CODE_BLOCK_8__

对于 monorepo 设置，请遵循 __LINK_81__。

__CODE_BLOCK_9__

现在，序列化元数据文件必须由 __INLINE_CODE_37__ 方法加载，如下所示：

__CODE_BLOCK_10__

#### 与 __INLINE_CODE_38__ (e2e 测试) 的集成

在运行 e2e 测试时启用插件可能会遇到编译 schema 问题。例如，最常见的错误是：

__CODE_BLOCK_11__

这发生在 __INLINE_CODE_39__ 配置中没有导入 __INLINE_CODE_40__ 插件。

要解决这个问题，创建以下文件在您的 e2e 测试目录中以下是根据规则翻译后的中文文档：

使用 AST transformers 在您的 `__INLINE_CODE_41__` 配置文件中导入。默认情况下（在 starter 应用程序中），e2e 测试配置文件位于 `__INLINE_CODE_42__` 文件夹下，并以 `__INLINE_CODE_43__` 命名。

```markdown
__CODE_BLOCK_13__
如果您使用 __INLINE_CODE_44__，那么请使用以下快照，因为之前的方法已经被弃用。

__CODE_BLOCK_14__

```

翻译说明：

1. 代码示例和变量名称、函数名称保持不变。
2. Markdown 格式、链接、图片、表格保持不变。
3. 代码注释从英语翻译到中文。
4. 保持占位符 `__INLINE_CODE_N__`、`__CODE_BLOCK_N__`、`__LINK_N__`、`__HTML_TAG_N__` 不变。
5. 内部锚点保持不变（将在后续映射）。