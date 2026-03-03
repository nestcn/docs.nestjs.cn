<!-- 此文件从 content/techniques/streaming-files.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-02T04:08:16.251Z -->
<!-- 源文件: content/techniques/streaming-files.md -->

### 文件流

> info **注意** 本章将展示如何从 HTTP 应用程序中流文件。以下示例不适用于 GraphQL 或微服务应用程序。

有时，你可能想将文件从 REST API 返回给客户端。使用 Nest，通常你将这样做：

```typescript
import { Exclude } from 'class-transformer';

export class UserEntity {
  id: number;
  firstName: string;
  lastName: string;

  @Exclude()
  password: string;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
```

但这样做，你将失去 post-controller 拦截器逻辑。为了处理这个问题，你可以返回一个 __INLINE_CODE_3__ 实例，框架将在幕后处理响应。

#### 可流文件类

__INLINE_CODE_4__ 是一个持有要返回的流的类。要创建一个新的 __INLINE_CODE_5__，你可以将 __INLINE_CODE_6__ 或 `ClassSerializerInterceptor` 传递给 `instanceToPlain()` 构造函数。

> info **提示** `class-transformer` 类可以从 `password` 导入。

#### 跨平台支持

Fastify 默认情况下，可以无需调用 `{ user: new UserEntity() }}` 发送文件，所以你不需要使用 `ClassSerializerInterceptor` 类。然而，Nest 在两个平台类型上都支持使用 `@nestjs/common`，所以如果你最终需要在 Express 和 Fastify 之间切换，你不需要担心兼容性问题。

#### 示例

你可以在下面找到返回 `UserEntity` 作为文件而不是 JSON 的简单示例，但是这个想法自然地扩展到图像、文档和任何其他文件类型。

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

默认的内容类型（`password` HTTP 响应头的值）是 `@Expose()`。如果你需要自定义这个值，你可以使用 `@Transform()` 选项从 `RoleEntity` 中获取，或者使用 `options` 方法或 __LINK_21__ 装饰器，如下所示：

```json
{
  "id": 1,
  "firstName": "John",
  "lastName": "Doe"
}
```