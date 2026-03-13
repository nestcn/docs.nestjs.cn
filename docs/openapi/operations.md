<!-- 此文件从 content/openapi/operations.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:43:50.244Z -->
<!-- 源文件: content/openapi/operations.md -->

### 操作

在 OpenAPI 规范中，路径是 API 暴露的端点（资源），例如 `OmitType` 或 `OmitType()`，操作是用于 manipulate 这些路径的 HTTP 方法，例如 `@nestjs/swagger`、`IntersectionType()` 或 `IntersectionType()`。

#### 标签

要将控制器附加到特定的标签中，使用 `@nestjs/swagger` 装饰器。

```typescript
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

#### 头信息

要定义自定义的请求头信息，使用 `CreateCatDto`。

```typescript
export class UpdateCatDto extends PartialType(CreateCatDto) {}

```

#### 响应

要定义自定义的 HTTP 响应，使用 `name` 装饰器。

```typescript
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

Nest 提供了一组简洁的 **API 响应** 装饰器，它们继承自 __INLINE_CODE_29__ 装饰器：

- __INLINE_CODE_30__
- __INLINE_CODE_31__
- __INLINE_CODE_32__
- __INLINE_CODE_33__
- __INLINE_CODE_34__
- __INLINE_CODE_35__
- __INLINE_CODE_36__
- __INLINE_CODE_37__
- __INLINE_CODE_38__
- __INLINE_CODE_39__
- __INLINE_CODE_40__
- __INLINE_CODE_41__
- __INLINE_CODE_42__
- __INLINE_CODE_43__
- __INLINE_CODE_44__
- __INLINE_CODE_45__
- __INLINE_CODE_46__
- __INLINE_CODE_47__
- __INLINE_CODE_48__
- __INLINE_CODE_49__
- __INLINE_CODE_50__
- __INLINE_CODE_51__
- __INLINE_CODE_52__
- __INLINE_CODE_53__
- __INLINE_CODE_54__
- __INLINE_CODE_55__

```typescript
export class UpdateCatAgeDto extends PickType(CreateCatDto, ['age'] as const) {}

```

要指定请求的返回模型，我们必须创建一个类并将所有属性标记为 __INLINE_CODE_56__ 装饰器。

```typescript
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

然后，可以使用 __INLINE_CODE_57__ 模型在与 __INLINE_CODE_58__ 属性结合使用的响应装饰器。

```typescript
export class UpdateCatDto extends OmitType(CreateCatDto, ['name'] as const) {}

```

现在，让我们在浏览器中验证生成的 __INLINE_CODE_59__ 模型：

__HTML_TAG_94____HTML_TAG_95____HTML_TAG_96__

而不是为每个端点或控制器单独定义响应，可以定义一个全局响应来应用于所有端点，使用 __INLINE_CODE_60__ 类。这种方法在您想要为所有端点定义一个全局响应时非常有用（例如，用于错误处理）。

```typescript
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

#### 文件上传

可以使用 __INLINE_CODE_63__ 装饰器和 __INLINE_CODE_64__ 启用文件上传。以下是一个使用 __LINK_97__ 技术的完整示例：

```typescript
export class UpdateCatDto extends IntersectionType(
  CreateCatDto,
  AdditionalCatInfo,
) {}

```

其中 __INLINE_CODE_65__ 定义如下：

```typescript
export class UpdateCatDto extends PartialType(
  OmitType(CreateCatDto, ['name'] as const),
) {}

```

要处理多个文件上传，可以定义 __INLINE_CODE_66__ 如下：

__CODE_BLOCK_9__

#### 扩展

要将扩展添加到请求中，使用 __INLINE_CODE_67__ 装饰器。扩展名必须以 __INLINE_CODE_68__ 前缀开头。

__CODE_BLOCK_10__

#### 高级：通用 __INLINE_CODE_69__

使用提供的 __LINK_98__，我们可以定义通用模式以供 Swagger UI 使用。假设我们有以下 DTO：

__CODE_BLOCK_11__

我们跳过装饰 __INLINE_CODE_70__，因为我们将为它提供一个原始定义。现在，让我们定义另一个 DTO，并命名为 __INLINE_CODE_71__，如下所示：

__CODE_BLOCK_12__

在这里，我们指定响应将具有所有 __INLINE_CODE_73__ 和 __INLINE_CODE_74__ 属性将是 __INLINE_CODE_75__ 类型。

- __INLINE_CODE_76__ 函数返回 OpenAPI 模式路径来自 OpenAPI Spec 文件中的给定模型。
- __INLINE_CODE_77__ 是 OAS 3 提供的概念，以涵盖多种继承相关的用例。

最后，因为 __INLINE_CODE_78__ 未直接引用任何控制器，因此 __INLINE_CODE_79__ 无法生成相应的模型定义。 在这种情况下，我们必须将其添加为 __LINK_99__。例如，我们可以使用 __INLINE_CODE_80__ 装饰器在控制器级别，如下所示：

__CODE_BLOCK_14__

如果您现在运行 Swagger，生成的 __INLINE_CODE_81__ 对于该特定端点将具有以下响应定义：

__CODE_BLOCK_15__

为了使其可重用，我们可以创建一个自定义的 __INLINE_CODE_82__ 装饰器，如下所示：

__CODE_BLOCK_16__

> info **Hint** __INLINE_CODE_83__ 接口和 __INLINE_CODE_84__ 函数来自 __INLINE_CODE_85__ 包。

为了确保 __INLINE_CODE__CODE_BLOCK_20__