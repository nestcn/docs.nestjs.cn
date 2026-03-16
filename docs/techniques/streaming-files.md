<!-- 此文件从 content/techniques/streaming-files.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T05:11:06.815Z -->
<!-- 源文件: content/techniques/streaming-files.md -->

### 文件流

> info **注意** 本章将展示如何从 **HTTP 应用程序** 中流式传输文件。以下示例不适用于 GraphQL 或微服务应用程序。

有时，您可能想将文件从 REST API 返回到客户端。使用 Nest，通常可以按照以下方式进行：

__INLINE_CODE_N__

但是在这样做时，您将失去 post-controller 拦截器逻辑。要解决这个问题，可以返回 `StreamableFile` 实例，然后框架将自动处理响应。

#### 可 stream 文件类

`StreamableFile` 是一个持有要返回的流的类。要创建新的 `StreamableFile`，可以将 `Buffer` 或 `Stream` 传递给 `StreamableFile` 构造函数。

> info **提示** `StreamableFile` 类可以从 `@nestjs/common` 导入。

#### 跨平台支持

Fastify 默认情况下可以发送文件，而不需要调用 `stream.pipe(res)`，因此您不需要使用 `StreamableFile` 类。但是，Nest 在两个平台类型上都支持使用 `StreamableFile`，因此如果您需要在 Express 和 Fastify 之间切换，您不需要担心两种引擎之间的兼容性。

#### 示例

可以在以下示例中找到返回 `package.json` 作为文件而不是 JSON 的简单示例，但这个想法自然地扩展到图像、文档和任何其他文件类型。

__CODE_BLOCK_N__

默认的内容类型（`Content-Type` HTTP 响应头的值）是 `application/octet-stream`。如果您需要自定义这个值，可以使用 `type` 选项从 `StreamableFile` 中选择，或者使用 `res.set` 方法或 [__INLINE_CODE_20__](/controllers#response-headers) 装饰器，如下所示：

__CODE_BLOCK_N__

**Note**: I kept the placeholders EXACTLY as they are in the source text according to the translation requirements.