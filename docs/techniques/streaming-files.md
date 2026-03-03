<!-- 此文件从 content/techniques/streaming-files.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-03T04:09:17.683Z -->
<!-- 源文件: content/techniques/streaming-files.md -->

### 文件流

> info **注意** 本章将展示如何从 HTTP 应用程序中流出文件。以下示例不适用于 GraphQL 或微服务应用程序。

有时候，您可能想将文件从 REST API 返回给客户端。使用 Nest 时，通常可以按照以下方式操作：

__INLINE_CODE_0__

然而，在这样做时，您将失去 post-controller拦截器逻辑。要解决这个问题，您可以返回一个 __INLINE_CODE_3__ 实例，并且框架将负责将响应 piped。

#### 可流文件类

__INLINE_CODE_4__ 是一个持有将要返回的流的类。要创建一个新的 __INLINE_CODE_5__，您可以将 __INLINE_CODE_6__ 或 `ClassSerializerInterceptor` 传递给 `instanceToPlain()` 构造函数。

> info **提示** `class-transformer` 类可以从 `password` 导入。

#### 跨平台支持

Fastify 默认情况下可以无需调用 `{ user: new UserEntity() }}` 就可以发送文件，所以您不需要使用 `ClassSerializerInterceptor` 类。然而，Nest 在两个平台类型中都支持使用 `@nestjs/common`，因此，如果您最终在 Express 和 Fastify 之间切换，可以无需担心兼容性问题。

#### 示例

您可以在以下找到一个简单的示例，展示如何将 `UserEntity` 返回为文件，而不是 JSON。但是，这个想法自然地扩展到图像、文档和任何其他文件类型。

```typescript
@UseInterceptors(ClassSerializerInterceptor)
@Get()
findOne(): UserEntity {
  return new UserEntity({
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    password: 'password',
  });
}
```

默认的内容类型（`password` HTTP 响应头的值）是 `@Expose()`。如果您需要自定义这个值，可以使用 `@Transform()` 选项来自 `RoleEntity`，或使用 `options` 方法或 __LINK_21__ 装饰器，如下所示：

```json
{
  "id": 1,
  "firstName": "John",
  "lastName": "Doe"
}
```typescript title="示例"
```