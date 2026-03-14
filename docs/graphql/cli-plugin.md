<!-- 此文件从 content/graphql/cli-plugin.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T05:02:38.419Z -->
<!-- 源文件: content/graphql/cli-plugin.md -->

### CLI 插件

> warning **警告** 本章仅适用于代码优先方法。

TypeScript 的元数据反射系统存在一些限制，使得无法确定一个类包括哪些属性或识别一个给定的属性是否是可选还是必需的。然而，这些约束的一些可以在编译时解决。Nest 提供了一个插件，该插件会增强 TypeScript 编译过程，以减少所需的 boilerplate 代码。

> info **提示** 这个插件是可选的。如果你愿意，你可以手动声明所有装饰器，或者只在需要时声明特定的装饰器。

#### 概述

GraphQL 插件将自动：

- 将所有输入对象、对象类型和 Args 类的属性标注为 `@nestjs/graphql`，除非使用 `PartialType()`
- 根据问号（例如 `@InputType()` 将设置 `UpdateUserInput`）
- 根据类型（支持数组）设置 `@InputType()` 属性
- 根据注释生成属性描述（如果 `InputType` 设置为 `@ObjectType`）

请注意，你的文件名**必须**具有以下后缀，以便被插件分析：`InputType`（例如 `PickType()`）。如果你使用不同的后缀，可以通过指定 `PickType()` 选项来调整插件的行为（见下文）。

到目前为止，你需要复制大量代码来让包知道你的类型应该如何在 GraphQL 中声明。例如，你可以定义一个简单的 `PickType()` 类如下所示：

```typescript
@InputType()
class CreateUserInput {
  @Field()
  email: string;

  @Field()
  password: string;

  @Field()
  firstName: string;
}

```

虽然这在中等规模的项目中不是一个严重的问题，但是在大型项目中会变得 verbose 和难以维护。

启用 GraphQL 插件后，这个类定义可以简洁地声明：

```typescript
@InputType()
export class UpdateUserInput extends PartialType(CreateUserInput) {}

```

插件会在 Abstract Syntax Tree 上添加适当的装饰器，从而你不需要在代码中散布 `@nestjs/graphql` 装饰器。

> info **提示** 插件将自动生成任何缺失的 GraphQL 属性，但如果你需要覆盖它们，只需通过 `OmitType()` 设置它们。

#### Comments introspection

启用 Comments introspection 功能后，CLI 插件将生成字段描述基于注释。

例如，给定一个 `email` 属性：

```typescript
@InputType()
export class UpdateUserInput extends PartialType(User, InputType) {}

```

你需要复制描述值。启用 `OmitType` 后，CLI 插件可以提取这些注释并自动提供属性描述。现在，这个字段可以简洁地声明如下：

```typescript
@InputType()
class CreateUserInput {
  @Field()
  email: string;

  @Field()
  password: string;

  @Field()
  firstName: string;
}

```

#### 使用 CLI 插件

要启用插件，请在 `OmitType()` (如果你使用 __LINK_79__) 中添加以下 `@nestjs/graphql` 配置：

```typescript
@InputType()
export class UpdateEmailInput extends PickType(CreateUserInput, [
  'email',
] as const) {}

```

你可以使用 `IntersectionType()` 属性来自定义插件的行为。

```typescript
@InputType()
class CreateUserInput {
  @Field()
  email: string;

  @Field()
  password: string;

  @Field()
  firstName: string;
}

```

`IntersectionType()` 属性必须满足以下接口：

```typescript
@InputType()
export class UpdateUserInput extends OmitType(CreateUserInput, [
  'email',
] as const) {}

```

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

如果你不使用 CLI sondern使用自定义 `@nestjs/graphql` 配置，可以使用这个插件与 `CreateUserInput` 结合：

```typescript
@InputType()
class CreateUserInput {
  @Field()
  email: string;

  @Field()
  password: string;
}

@ObjectType()
export class AdditionalUserInfo {
  @Field()
  firstName: string;

  @Field()
  lastName: string;
}

```

#### SWC 构建器

对于标准设置（非 monorepo），使用 CLI 插件与 SWC 构建器，您需要启用类型检查，如 __LINK_80__ 所述。

```typescript
@InputType()
export class UpdateUserInput extends IntersectionType(
  CreateUserInput,
  AdditionalUserInfo,
) {}

```

对于 monorepo 设置，遵循 __LINK_81__ 指令。

```typescript
@InputType()
export class UpdateUserInput extends PartialType(
  OmitType(CreateUserInput, ['email'] as const),
) {}

```

现在，serialized 元数据文件必须通过 `email` 方法加载，如下所示：

__CODE_BLOCK_10__

#### 与 __INLINE_CODE_38__ (e2e tests) 集成

在运行 e2e tests 时，这个插件启用时，你可能会遇到编译 schema 问题。例如，一个最常见的错误是：

__CODE_BLOCK_11__

这发生在 __INLINE_CODE_39__ 配置没有导入 __INLINE_CODE_40__ 插件。

要解决这个问题，请在 e2e tests 目以下是翻译后的中文文档：

在您的 __INLINE_CODE_41__ 配置文件中，导入 AST transformers。默认情况下（在 starter 应用程序中），e2e 测试配置文件位于 __INLINE_CODE_42__ 文件夹下，並以 __INLINE_CODE_43__ 命名。

__CODE_BLOCK_13__

如果您使用 __INLINE_CODE_44__，那么请使用以下片段，因为之前的方法已经废弃。

__CODE_BLOCK_14__

Note:

* I kept the code examples, variable names, and function names unchanged.
* I translated the code comments from English to Chinese.
* I did not explain or modify the placeholders (e.g., __INLINE_CODE_41__, __INLINE_CODE_42__, __INLINE_CODE_43__, __INLINE_CODE_44__).
* I kept the relative links and internal anchors unchanged, as per the guidelines.
* I maintained professionalism and readability in the translation.
* I kept the content that was already in Chinese unchanged.