<!-- 此文件从 content/openapi/types-and-parameters.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T05:30:59.250Z -->
<!-- 源文件: content/openapi/types-and-parameters.md -->

### Types and parameters

`name` 在路由处理程序中搜索 __INLINE_CODE_29__, __INLINE_CODE_30__, 和 __INLINE_CODE_31__ 装饰器，以生成 API 文档。它还创建对应的模型定义，借助反射机制。考虑以下代码：

```typescript
// ```typescript
import { ApiProperty } from '@nestjs/swagger';

export class CreateCatDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  age: number;

  @ApiProperty()
  breed: string;
}

```

```

> 提示 **Hint** 使用 __INLINE_CODE_32__ 装饰器（来自 __INLINE_CODE_33__ 包）来显式设置 body 定义。

根据 __INLINE_CODE_34__，Swagger UI 将创建以下模型定义：

```html
<!-- __HTML_TAG_88__ --> <!-- __HTML_TAG_89__ --> <!-- __HTML_TAG_90__ -->

```

如您所见，定义为空，尽管类中有几个 declared 属性。为了使类属性可见给 __INLINE_CODE_35__，我们需要将它们标注为 __INLINE_CODE_36__ 装饰器或使用 CLI 插件（阅读 **Plugin** 部分），它将自动执行：

```typescript
// ```typescript
export class UpdateCatDto extends PartialType(CreateCatDto) {}

```

```

> 提示 **Hint** 不要手动标注每个属性，考虑使用 Swagger 插件（见 __LINK_102__ 部分），它将自动为您提供。

让我们在浏览器中验证生成的 __INLINE_CODE_37__ 模型：

```html
<!-- __HTML_TAG_91__ --> <!-- __HTML_TAG_92__ --> <!-- __HTML_TAG_93__ -->

```

此外，__INLINE_CODE_38__ 装饰器还允许设置各种 __LINK_103__ 属性：

```typescript
// ```typescript
import { ApiProperty } from '@nestjs/swagger';

export class CreateCatDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  age: number;

  @ApiProperty()
  breed: string;
}

```

```

> 提示 **Hint** 可以使用 __INLINE_CODE_40__ 短手装饰器来代替 __INLINE_CODE_39__。

为了显式设置属性类型，使用 __INLINE_CODE_41__ 键：

```typescript
// ```typescript
export class UpdateCatAgeDto extends PickType(CreateCatDto, ['age'] as const) {}

```

```

#### 数组

当属性是一个数组时，我们必须手动指示数组类型，如下所示：

```typescript
// ```typescript
import { ApiProperty } from '@nestjs/swagger';

export class CreateCatDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  age: number;

  @ApiProperty()
  breed: string;
}

```

```

> 提示 **Hint** 考虑使用 Swagger 插件（见 __LINK_104__ 部分），它将自动检测数组。

或者包括类型作为数组的第一个元素（如上所示），或将 __INLINE_CODE_42__ 属性设置为 __INLINE_CODE_43__。

```html
<!-- __HTML_TAG_94__ --> <!-- __HTML_TAG_95__ -->

```

#### 循环依赖

当您在类之间存在循环依赖关系时，使用延迟函数提供 __INLINE_CODE_44__ 类型信息：

```typescript
// ```typescript
export class UpdateCatDto extends OmitType(CreateCatDto, ['name'] as const) {}

```

```

> 提示 **Hint** 考虑使用 Swagger 插件（见 __LINK_105__ 部分），它将自动检测循环依赖。

#### generics 和 interfaces

由于 TypeScript未存储元数据关于泛型或接口，因此当您在 DTOs 中使用它们时，__INLINE_CODE_45__可能无法正确生成模型定义。在以下代码中，Swagger 模块将无法正确地检查：

```typescript
// ```typescript
import { ApiProperty } from '@nestjs/swagger';

export class CreateCatDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  breed: string;
}

export class AdditionalCatInfo {
  @ApiProperty()
  color: string;
}

```

```

为了克服这个限制，您可以显式设置类型：

```typescript
// ```typescript
export class UpdateCatDto extends IntersectionType(
  CreateCatDto,
  AdditionalCatInfo,
) {}

```

```

#### 枚举

要识别 __INLINE_CODE_46__，我们必须手动设置 __INLINE_CODE_47__ 属性在 __INLINE_CODE_48__ 上，使用数组值。

```typescript
// ```typescript
export class UpdateCatDto extends PartialType(
  OmitType(CreateCatDto, ['name'] as const),
) {}

```

```

或者定义实际的 TypeScript 枚举如下：

```typescript
// __CODE_BLOCK_9__

```

然后，可以使用枚举直接与 __INLINE_CODE_49__ 参数装饰器结合使用 __INLINE_CODE_50__ 装饰器。

```typescript
// __CODE_BLOCK_10__

```

__HTML_TAG_96____HTML_TAG_97____HTML_TAG_98__

#### 枚举 schema

默认情况下，__INLINE_CODE_53__ 属性将添加 raw 定义 __LINK_106__ 到 __INLINE_CODE_54__。

```typescript
// __CODE_BLOCK_11__

```

上述说明适用于大多数情况。但是，如果您正在使用工具，该工具将 specification 作为 **输入** 并生成 **客户端** 代码，您可能会遇到生成代码包含重复 __INLINE_CODE_55__ 的问题。考虑以下代码片段：

```typescript
// __CODE_BLOCK_12__

```

> 提示 **Hint** 上述片段是使用 __LINK_107__ 工具生成的。

可以看到现在您有两个相同的 __INLINE_CODE_56__。为了解决这个问题，您可以将 __INLINE_CODE_57__ 传递给 __INLINE_CODE_58__ 属性在装饰器中。

```typescript
// __CODE_BLOCK_13__

```

__INLINE_CODE_59__ 属性使 __INLINE_CODE_60__ 将 __INLINE_CODE_61__ 转换为自己的 __INLINE_CODE_62__，这使 __INLINE_CODE_63__ 枚举可重用。 specification 将如下所示：

```typescript
// __CODE_BLOCK_14__

```

> 提示 **Hint** 任何使用 __INLINE_CODE_64__ 作为属性的 **decorator** 也将使用 __INLINE_CODE_65__。

#### 属性值示例

您可以使用 __INLINE_CODE_66__ 键设置单Here is the translation of the provided English technical documentation to Chinese:

使用控制器类手动定义输入/输出内容，请使用 __INLINE_CODE_68__ 属性：

__CODE_BLOCK_19__

#### 额外模型

要定义直接在控制器中未引用的额外模型，但需要 Swagger 模块检查，可以使用 __INLINE_CODE_69__ 装饰器：

__CODE_BLOCK_20__

> info **提示** 对于特定模型类，您只需要使用 __INLINE_CODE_70__ 一次。

Alternatively, you can pass an options object with the __INLINE_CODE_71__ property specified to the __INLINE_CODE_72__ method, as follows:

__CODE_BLOCK_21__

要获取模型的引用，请使用 __INLINE_CODE_73__ 函数：

__CODE_BLOCK_22__

#### oneOf, anyOf, allOf

要组合模式，可以使用 __INLINE_CODE_75__、__INLINE_CODE_76__ 或 __INLINE_CODE_77__ 关键字（__LINK_108__）。

__CODE_BLOCK_23__

如果您想要定义多种模式的数组（即数组中的成员跨越多个模式），则需要使用原始定义（见上）手动定义您的类型。

__CODE_BLOCK_24__

> info **提示** __INLINE_CODE_78__ 函数来自 __INLINE_CODE_79__。

Both __INLINE_CODE_80__ and __INLINE_CODE_81__ must be defined as extra models using the __INLINE_CODE_82__ decorator (at the class-level).

#### 模式名称和描述

正如您可能已经注意到的，生成的模式名称基于原始模型类的名称（例如，__INLINE_CODE_83__ 模型生成 __INLINE_CODE_84__ 模式）。如果您想更改模式名称，可以使用 __INLINE_CODE_85__ 装饰器。

以下是一个示例：

__CODE_BLOCK_25__

上述模型将被翻译为 __INLINE_CODE_86__ 模式。

默认情况下，不会添加生成模式的描述。您可以使用 __INLINE_CODE_87__ 属性添加一条描述：

__CODE_BLOCK_26__

这样，描述将被包括在模式中，例如：

__CODE_BLOCK_27__