<!-- 此文件从 content/openapi/types-and-parameters.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-01T04:21:41.317Z -->
<!-- 源文件: content/openapi/types-and-parameters.md -->

### Types and parameters

`name` searches for all __INLINE_CODE_29__, __INLINE_CODE_30__, and __INLINE_CODE_31__ decorators in route handlers to generate the API document. It also creates corresponding model definitions by taking advantage of reflection. Consider the following code:

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

> info **Hint** To explicitly set the body definition use the __INLINE_CODE_32__ decorator (imported from the __INLINE_CODE_33__ package).

Based on __INLINE_CODE_34__, the following model definition Swagger UI will be created:

```html
<!-- __HTML_TAG_88__ --> <!-- __HTML_TAG_89__ --> <!-- __HTML_TAG_90__ -->
```

As you can see, the definition is empty although the class has a few declared properties. In order to make the class properties visible to the __INLINE_CODE_35__, we have to either annotate them with the __INLINE_CODE_36__ decorator or use the CLI plugin (read more in the **Plugin** section) which will do it automatically:

```typescript
// ```typescript
export class UpdateCatDto extends PartialType(CreateCatDto) {}
```

> info **Hint** Instead of manually annotating each property, consider using the Swagger plugin (see __LINK_102__ section) which will automatically provide this for you.

Let's open the browser and verify the generated __INLINE_CODE_37__ model:

```html
<!-- __HTML_TAG_91__ --> <!-- __HTML_TAG_92__ --> <!-- __HTML_TAG_93__ -->
```

In addition, the __INLINE_CODE_38__ decorator allows setting various __LINK_103__ properties:

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

> info **Hint** Instead of explicitly typing the __INLINE_CODE_39__ you can use the __INLINE_CODE_40__ short-hand decorator.

In order to explicitly set the type of the property, use the __INLINE_CODE_41__ key:

```typescript
// ```typescript
export class UpdateCatAgeDto extends PickType(CreateCatDto, ['age'] as const) {}
```

#### Arrays

When the property is an array, we must manually indicate the array type as shown below:

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

> info **Hint** Consider using the Swagger plugin (see __LINK_104__ section) which will automatically detect arrays.

Either include the type as the first element of an array (as shown above) or set the __INLINE_CODE_42__ property to __INLINE_CODE_43__.

```html
<!-- __HTML_TAG_94__ --> <!-- __HTML_TAG_95__ -->
```

#### Circular dependencies

When you have circular dependencies between classes, use a lazy function to provide the __INLINE_CODE_44__ with type information:

```typescript
// ```typescript
export class UpdateCatDto extends OmitType(CreateCatDto, ['name'] as const) {}
```

> info **Hint** Consider using the Swagger plugin (see __LINK_105__ section) which will automatically detect circular dependencies.

#### Generics and interfaces

Since TypeScript does not store metadata about generics or interfaces, when you use them in your DTOs, __INLINE_CODE_45__ may not be able to properly generate model definitions at runtime. For instance, the following code won't be correctly inspected by the Swagger module:

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

In order to overcome this limitation, you can set the type explicitly:

```typescript
// ```typescript
export class UpdateCatDto extends IntersectionType(
  CreateCatDto,
  AdditionalCatInfo,
) {}
```

#### Enums

To identify an __INLINE_CODE_46__, we must manually set