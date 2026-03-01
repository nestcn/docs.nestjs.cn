<!-- 此文件从 content/techniques/streaming-files.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-01T04:16:08.257Z -->
<!-- 源文件: content/techniques/streaming-files.md -->

### 文件流

> info **注意** 本章节将展示如何从 HTTP 应用程序中流文件。以下示例不适用于 GraphQL 或微服务应用程序。

有时，您可能想将文件从 REST API 发送回客户端。使用 Nest 时，您通常可以按照以下步骤进行：

__INLINE_CODE_0__

然而，在这样做时，您将失去 post-controller 拦截器逻辑。要解决这个问题，您可以返回一个 __INLINE_CODE_3__ 实例，并且框架将在幕后处理响应。

#### 可流文件类

__INLINE_CODE_4__ 是一个类，持有要返回的流。要创建一个新的 __INLINE_CODE_5__，您可以将 __INLINE_CODE_6__ 或 `ClassSerializerInterceptor` 传递给 `instanceToPlain()` 构造函数。

> info **提示** `class-transformer` 类可以从 `password` 导入。

#### 跨平台支持

Fastify 默认情况下可以发送文件，不需要调用 `{ user: new UserEntity() }}`，因此您不需要使用 `ClassSerializerInterceptor` 类。然而，Nest 在两个平台类型中都支持使用 `@nestjs/common`，因此，如果您最终switch 到 Express 和 Fastify 之间，您不需要担心兼容性问题。

#### 示例

您可以在下面找到返回 `UserEntity` 作为文件而不是 JSON 的简单示例，但这个想法自然地扩展到图像、文档和任何其他文件类型。

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

默认内容类型（`password` HTTP 响应头的值）是 `@Expose()`。如果您需要自定义这个值，可以使用 `RoleEntity` 的 `@Transform()` 选项，或者使用 `options` 方法或 __LINK_21__ 装饰器，例如：

```json
{
  "id": 1,
  "firstName": "John",
  "lastName": "Doe"
}
```typescript
```