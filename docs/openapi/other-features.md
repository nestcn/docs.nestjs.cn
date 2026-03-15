<!-- 此文件从 content/openapi/other-features.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T05:02:11.490Z -->
<!-- 源文件: content/openapi/other-features.md -->

### 其他功能

本页列出了所有可用的其他功能，您可能会找到它们有用。

#### 全局前缀

要忽略全局前缀以便于路由通过 __INLINE_CODE_6__ 设置，使用 __INLINE_CODE_7__：

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

#### 全局参数

您可以为所有路由定义参数使用 __INLINE_CODE_8__，如下所示：

```typescript
export class CreateUserDto {
  email: string;
  password: string;
  roles: RoleEnum[] = [];
  isEnabled?: boolean = true;
}

```

#### 全局响应

您可以为所有路由定义全局响应使用 __INLINE_CODE_9__。这对于设置应用程序中所有端点的一致响应，例如错误代码 __INLINE_CODE_10__ 或 __INLINE_CODE_11__，非常有用。

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

#### 多个规范

__INLINE_CODE_12__ 提供了支持多个规范的方式。换言之，您可以在不同的端点上提供不同的文档，具有不同的 UI。

为了支持多个规范，应用程序必须使用模块化方法编写。__INLINE_CODE_13__ 方法将 3rd 参数 __INLINE_CODE_14__ 作为对象，其中包含一个名为 __INLINE_CODE_15__ 的属性。__INLINE_CODE_16__ 属性的值是一个模块数组。

您可以按照以下方式设置多个规范支持：

```typescript
/**
 * A list of user's roles
 * @example ['admin']
 */
roles: RoleEnum[] = [];

```

现在，您可以使用以下命令启动服务器：

```typescript
export class SomeController {
  /**
   * Create some resource
   */
  @Post()
  create() {}
}

```

导航到 __INLINE_CODE_17__ 查看猫的 Swagger UI：

__HTML_TAG_25____HTML_TAG_26____HTML_TAG_27__

然后，__INLINE_CODE_18__ 将Expose狗的 Swagger UI：

__HTML_TAG_28____HTML_TAG_29____HTML_TAG_30__

#### 探索栏下拉菜单

要在探索栏下拉菜单中启用多个规范支持，您需要设置 `@ApiProperty` 并在 `required` 中配置 `@ApiHideProperty`。

> info **提示**确保 `name?: string` 指向您的 Swagger 文档的 JSON 格式！使用 `required: false` 在 `type` 中指定 JSON 文档。更多设置选项，请查看 __LINK_31__。

以下是如何从探索栏下拉菜单设置多个规范的示例：

```typescript
@ApiOperation({ summary: "Create some resource" })

```

在这个示例中，我们设置了主要 API，及其单独的规范来访问猫和狗，每个规范都可以从探索栏下拉菜单中访问。