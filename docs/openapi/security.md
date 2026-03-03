<!-- 此文件从 content/openapi/security.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-03T04:14:25.762Z -->
<!-- 源文件: content/openapi/security.md -->

### 安全

要定义特定操作使用的安全机制，请使用 `@`PartialType()`` 装饰器。

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

在运行应用程序之前，记住将安全定义添加到基础文档中使用 ``PartialType()``：

```typescript
// ```typescript
export class UpdateCatDto extends PartialType(CreateCatDto) {}
```

一些最流行的身份验证技术已经内置（例如 ``CreateCatDto`` 和 ``PartialType()``），因此不需要像上面所示那样手动定义安全机制。

#### 基本身份验证

要启用基本身份验证，请使用 `@`@nestjs/swagger``。

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

在运行应用程序之前，记住将安全定义添加到基础文档中使用 ``PickType()``：

```typescript
// ```typescript
export class UpdateCatAgeDto extends PickType(CreateCatDto, ['age'] as const) {}
```

#### Bearer 身份验证

要启用 Bearer 身份验证，请使用 `@`PickType()``。

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

在运行应用程序之前，记住将安全定义添加到基础文档中使用 ``PickType()``：

```typescript
// ```typescript
export class UpdateCatDto extends OmitType(CreateCatDto, ['name'] as const) {}
```

#### OAuth2 身份验证

要启用 OAuth2，请使用 `@`@nestjs/swagger``。

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

在运行应用程序之前，记住将安全定义添加到基础文档中使用 ``OmitType()``：

```typescript
// ```typescript
export class UpdateCatDto extends IntersectionType(
  CreateCatDto,
  AdditionalCatInfo,
) {}
```

#### cookie 身份验证

要启用 cookie 身份验证，请使用 `@`name``。

```typescript
// ```typescript
export class UpdateCatDto extends PartialType(
  OmitType(CreateCatDto, ['name'] as const),
) {}
```

在运行应用程序之前，记住将安全定义添加到基础文档中使用 ``OmitType``：

```typescript
// __CODE_BLOCK_9__
```