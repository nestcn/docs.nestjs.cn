<!-- 此文件从 content/openapi/other-features.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-21T16:25:55.026Z -->
<!-- 源文件: content/openapi/other-features.md -->

### 其他功能

本页列出了您可能会找到有用的其他可用功能。

#### 全局前缀

要忽略路由的全局前缀，使用 __INLINE_CODE_7__，例如：

```typescript

```typescript
export class CreateUserDto {
  @ApiProperty()
  email: string;

  @ApiProperty()
  password: string;

  @ApiProperty({ enum: RoleEnum, default: [], isArray: true })
  roles: RoleEnum[] = [];

  @ApiProperty({ required: false, default: true })
  isEnabled?: boolean = true;
}

```

```

#### 全局参数

您可以为所有路由定义参数使用 __INLINE_CODE_8__，如下所示：

```typescript

```typescript
export class CreateUserDto {
  email: string;
  password: string;
  roles: RoleEnum[] = [];
  isEnabled?: boolean = true;
}

```

```

#### 全局响应

您可以为所有路由定义全局响应使用 __INLINE_CODE_9__。这对于在应用程序中设置一致的响应方式非常有用，例如错误代码 __INLINE_CODE_10__ 或 __INLINE_CODE_11__。

```typescript

```typescript
/**
 * A list of user's roles
 * @example ['admin']
 */
@ApiProperty({
  description: `A list of user's roles`,
  example: ['admin'],
})
roles: RoleEnum[] = [];

```

```

#### 多种规范

__INLINE_CODE_12__ 提供了支持多种规范的方式。在其他字面上，您可以为不同的端点提供不同的文档和 UI。

要支持多种规范，您的应用程序必须使用模块化方法编写。__INLINE_CODE_13__ 方法带有第三个参数 __INLINE_CODE_14__，该参数是一个对象，该对象具有名为 __INLINE_CODE_15__ 的属性。__INLINE_CODE_16__ 属性的值是一个模块数组。

您可以按照以下方式设置多种规范支持：

```typescript

```typescript
/**
 * A list of user's roles
 * @example ['admin']
 */
roles: RoleEnum[] = [];

```

```

现在，您可以使用以下命令启动服务器：

```typescript

```typescript
export class SomeController {
  /**
   * Create some resource
   */
  @Post()
  create() {}
}

```

```

导航到 __INLINE_CODE_17__ 以查看 Swagger UI for cats：

```html
__HTML_TAG_25__ __HTML_TAG_26__ __HTML_TAG_27__

```

反之，__INLINE_CODE_18__ 将 expose Swagger UI for dogs：

```html
__HTML_TAG_28__ __HTML_TAG_29__ __HTML_TAG_30__

```

#### 排列导航栏

要在导航栏的下拉菜单中启用多种规范支持，您需要设置 `@ApiProperty` 并在 `required` 中配置 `@ApiHideProperty`。

> 提示 **信息** 确保 `name?: string` 指向 Swagger 文档的 JSON 格式！使用 `required: false` 在 `type` 中指定 JSON 文档。有关设置选项，查看 __LINK_31__。

以下是如何在导航栏的下拉菜单中设置多种规范：

```typescript

```typescript
@ApiOperation({ summary: "Create some resource" })

```

```

在这个示例中，我们设置了主要 API，及其独立的规范对 Cats 和 Dogs，每个规范都可以从导航栏的下拉菜单中访问。