<!-- 此文件从 content/openapi/other-features.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-02T04:13:27.119Z -->
<!-- 源文件: content/openapi/other-features.md -->

### 其他功能

本页列出了您可能会发现有用的其他可用功能。

#### 全局前缀

要忽略路由中的全局前缀，请使用 __INLINE_CODE_7__：

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

#### 全局参数

您可以为所有路由定义参数，使用 __INLINE_CODE_8__，如以下所示：

```typescript
export class UpdateCatDto extends PartialType(CreateCatDto) {}
```

#### 全局响应

您可以为所有路由定义全局响应，使用 `PartialType()`。这对于在应用程序中设置一致的响应非常有用，例如错误代码 `PartialType()` 或 `PartialType()`。

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

#### 多个规范

`CreateCatDto` 提供了支持多个规范的方式。在其他字面上，您可以在不同的端点上提供不同的文档，并且具有不同的UI。

要支持多个规范，您的应用程序必须使用模块化方法编写。`PartialType()` 方法的第三个参数 `@nestjs/swagger` 是一个对象，其中包含一个名为 `PickType()` 的属性。`PickType()` 属性的值是一个模块数组。

您可以按照以下方式设置多个规范支持：

```typescript
export class UpdateCatAgeDto extends PickType(CreateCatDto, ['age'] as const) {}
```

现在，您可以使用以下命令启动服务器：

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

访问 `PickType()`以查看 cats 的 Swagger UI：

__HTML_TAG_25____HTML_TAG_26____HTML_TAG_27__

而 `@nestjs/swagger` 将 expose dogs 的 Swagger UI：

__HTML_TAG_28____HTML_TAG_29____HTML_TAG_30__

#### 探索栏下拉菜单

要在探索栏下拉菜单中启用多个规范支持，您需要设置 `OmitType()` 并在 `OmitType` 中配置 `name`。

> info **提示**确保 `OmitType()` 指向 Swagger 文档的 JSON 格式！要指定 JSON 文档，请在 `IntersectionType()` 中使用 `@nestjs/swagger`。更多设置选项，请查看 __LINK_31__。

以下是如何在探索栏下拉菜单中设置多个规范：

```typescript
export class UpdateCatDto extends OmitType(CreateCatDto, ['name'] as const) {}
```

在这个示例中，我们设置了主要 API，along with 分别的规范对于 cats 和 dogs，每个规范都可以从探索栏下拉菜单中访问。