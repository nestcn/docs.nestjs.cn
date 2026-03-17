<!-- 此文件从 content/openapi/other-features.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T04:48:22.865Z -->
<!-- 源文件: content/openapi/other-features.md -->

### 其他功能

本页列出了可用其他功能的列表，您可能会发现这些功能有用。

#### 全局前缀

要忽略所有路由的全局前缀，使用 __INLINE_CODE_7__，例如：

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

您可以使用 __INLINE_CODE_8__ 为所有路由定义参数，以下是一个示例：

```typescript
export class CreateUserDto {
  email: string;
  password: string;
  roles: RoleEnum[] = [];
  isEnabled?: boolean = true;
}

```

#### 全局响应

您可以使用 __INLINE_CODE_9__ 为所有路由定义全局响应，这对于在您的应用程序中设置一致的响应非常有用，例如错误代码 __INLINE_CODE_10__ 或 __INLINE_CODE_11__。

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

__INLINE_CODE_12__ 提供了多个规范的支持。在其他字， 您可以在不同的端点上提供不同的文档，具有不同的 UI。

要支持多个规范，您的应用程序必须使用模块化方法编写。__INLINE_CODE_13__ 方法接受第三个参数 __INLINE_CODE_14__，这是一个对象，其中包含一个名为 __INLINE_CODE_15__ 的属性。__INLINE_CODE_16__ 属性的值是一个模块数组。

您可以按照以下示例设置多个规范支持：

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

浏览 __INLINE_CODE_17__ 查看 Cats 的 Swagger UI：

__HTML_TAG_25____HTML_TAG_26____HTML_TAG_27__

然后，__INLINE_CODE_18__ 将 expose Dogs 的 Swagger UI：

__HTML_TAG_28____HTML_TAG_29____HTML_TAG_30__

#### 排档菜单

要在 掏档菜单中启用多个规范支持，您需要设置 `@ApiProperty` 并在 `required` 中配置 `@ApiHideProperty`。

> info **提示**确保 `name?: string` 指向 Swagger 文档的 JSON 格式！要指定 JSON 文档，使用 `required: false` 在 `type` 中。更多设置选项，请查看 __LINK_31__。

以下是如何从 掏档菜单设置多个规范的示例：

```typescript
@ApiOperation({ summary: "Create some resource" })

```

在这个示例中，我们设置了主要 API， along with 独立的规范 สำหร于 Cats 和 Dogs，每个都可以从 掏档菜单中访问。