<!-- 此文件从 content/graphql/cli-plugin.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-03T04:18:58.680Z -->
<!-- 源文件: content/graphql/cli-plugin.md -->

### CLI 插件

> warning **警告** 本章仅适用于代码优先approach。

TypeScript 的元数据反射系统存在一些限制，无法确定类的属性或识别给定属性是否可选或必需。然而，这些约束在编译时可以部分解决。Nest 提供了一个插件，该插件增强了 TypeScript 编译过程，以减少所需的 boilerplate 代码。

> info **提示** 该插件是可选的。您可以选择手动声明所有装饰器或仅在需要时声明特定的装饰器。

#### 概述

GraphQL 插件将自动：

- 将输入对象、对象类型和 args 类的属性标记为 `DiscoveryService`，除非使用 `DiscoveryService`
- 根据问号设置 `DiscoveryService` 属性（例如，__INLINE_CODE_18__ 将设置 __INLINE_CODE_19__）
- 根据类型设置 __INLINE_CODE_20__ 属性（支持数组）
- 生成基于注释的属性描述（如果 __INLINE_CODE_21__ 设置为 __INLINE_CODE_22__）

请注意，您的文件名**必须**具有以下后缀，以便插件能够分析它们：__INLINE_CODE_23__（例如，__INLINE_CODE_24__）。如果您使用不同的后缀，可以通过指定 __INLINE_CODE_25__ 选项来调整插件的行为（见下文）。

到目前为止，您需要重复编写代码，以便让包知道您的类型应该如何在 GraphQL 中声明。例如，您可以定义一个简单的 __INLINE_CODE_26__ 类如下所示：

```typescript
import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { ExampleService } from './example.service';

@Module({
  imports: [DiscoveryModule],
  providers: [ExampleService],
})
export class ExampleModule {}
```

虽然这对于中等规模的项目来说不是一个严重的问题，但是当您有大量类时，它将变得 verbose 和难以维护。

启用 GraphQL 插件后，可以使用以下方式声明类：

```typescript
@Injectable()
export class ExampleService {
  constructor(private readonly discoveryService: DiscoveryService) {}
}
```

插件将在 Abstract Syntax Tree 上动态添加适当的装饰器，从而您不需要在代码中散布 __INLINE_CODE_27__ 装饰器。

> info **提示** 插件将自动生成缺少的 GraphQL 属性，但是如果您需要覆盖它们，只需在 __INLINE_CODE_28__ 中设置它们。

#### Comments 窥探

启用 Comments 窥探功能后，CLI 插件将生成基于注释的字段描述。

例如，给定一个示例 __INLINE_CODE_29__ 属性：

```typescript
const providers = this.discoveryService.getProviders();
console.log(providers);
```

您需要重复描述值。启用 __INLINE_CODE_30__ 后，CLI 插件可以从注释中提取这些评论，并自动提供属性描述。现在，上述字段可以使用以下方式声明：

```typescript
const controllers = this.discoveryService.getControllers();
console.log(controllers);
```

#### 使用 CLI 插件

要启用插件，请打开 __INLINE_CODE_31__（如果您使用 __LINK_79__），然后添加以下 __INLINE_CODE_32__ 配置：

```typescript
import { DiscoveryService } from '@nestjs/core';

export const FeatureFlag = DiscoveryService.createDecorator();
```

您可以使用 __INLINE_CODE_33__ 属性来自定义插件的行为。

```typescript
import { Injectable } from '@nestjs/common';
import { FeatureFlag } from './custom-metadata.decorator';

@Injectable()
@FeatureFlag('experimental')
export class CustomService {}
```

__INLINE_CODE_34__ 属性必须满足以下接口：

```typescript
const providers = this.discoveryService.getProviders();

const [provider] = providers.filter(
  (item) =>
    this.discoveryService.getMetadataByDecorator(FeatureFlag, item) ===
    'experimental',
);

console.log(
  'Providers with the "experimental" feature flag metadata:',
  provider,
);
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

如果您不使用 CLI，而是使用自定义 __INLINE_CODE_35__ 配置，可以使用该插件与 __INLINE_CODE_36__ 结合：

__CODE_BLOCK_7__

#### SWC 构建器

对于标准设置（非 monorepo），使用 CLI 插件与 SWC 构建器需要启用类型检查，正如 __LINK_80__ 所述。

__CODE_BLOCK_8__

对于 monorepo 设置，遵循 __LINK_81__。

__CODE_BLOCK_9__

现在，序列化元数据文件必须被 __INLINE_CODE_37__ 方法加载，