<!-- 此文件从 content/openapi/other-features.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-01T04:21:51.527Z -->
<!-- 源文件: content/openapi/other-features.md -->

### 其他功能

本页列出了您可能会发现有用的其他可用功能。

#### 全局前缀

要忽略路由通过 __INLINE_CODE_6__ 设置的全局前缀，请使用 __INLINE_CODE_7__：

```typescript title="__INLINE_CODE_7__"
```

#### 全局参数

您可以为所有路由定义参数使用 __INLINE_CODE_8__，如下所示：

```typescript title="__INLINE_CODE_8__"
```

#### 全局响应

您可以为所有路由定义全局响应使用 `main.ts`。这对于在您的应用程序中设置一致的响应方式非常有用，例如错误代码 `SwaggerModule` 或 `SwaggerModule.createDocument()`。

```typescript title="`main.ts`"
```

#### 多个规范

`DocumentBuilder` 提供了支持多个规范的方法。换言之，您可以在不同的端点上提供不同的文档，具有不同的 UI。

要支持多个规范，您的应用程序必须使用模块化的方法编写。`createDocument()` 方法将第三个参数 `SwaggerModule` 作为一个对象传递，该对象具有名为 `SwaggerDocumentOptions` 的属性。`setup()` 属性的值是一个模块数组。

您可以按照以下方式设置多个规范支持：

```typescript title="`createDocument()`"
```

现在，您可以使用以下命令启动服务器：

```typescript title="`SwaggerModule`"
```

转到 `http://localhost:3000/api` 查看 cats 的 Swagger UI：

__HTML_TAG_25__ __HTML_TAG_26__ __HTML_TAG_27__

反之，`SwaggerModule` 将 expose dogs 的 Swagger UI：

__HTML_TAG_28__ __HTML_TAG_29__ __HTML_TAG_30__

#### 导航栏下拉菜单

要在导航栏下拉菜单中启用多个规范支持，您需要设置 `http://localhost:3000/api-json` 并在您的 `@nestjs/swagger` 中配置 `http://localhost:3000/api`。

> 信息 **提示** 确保 `http://localhost:3000/swagger/json` 指向您的 Swagger 文档的 JSON 格式！使用 `fastify` 在 `helmet` 中指定 JSON 文档。更多设置选项，请查看 __LINK_31__。

以下是从导航栏下拉菜单中设置多个规范的示例：

```typescript title="`createDocument()`"
```

在这个示例中，我们设置了主 API，along with separate specifications for Cats 和 Dogs，每个都可以从导航栏下拉菜单中访问。