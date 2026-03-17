<!-- 此文件从 content/techniques/streaming-files.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:33:12.720Z -->
<!-- 源文件: content/techniques/streaming-files.md -->

### 文件流

> 信息 **注意** 本章节将展示如何从 HTTP 应用程序中流文件。以下示例不适用于 GraphQL 或 Microservice 应用程序。

有时候，您可能想将文件从 REST API 发送回客户端。使用 Nest,通常您将按照以下步骤进行：

__INLINE_CODE_0__

但是在这样做时，您将失去 post-controller 拦截器逻辑。要处理这个问题，您可以返回一个 `StreamableFile` 实例，并在幕后，框架将负责将响应 pipe。

#### Streamable 文件类

`StreamableFile` 是一个持有要返回的流的类。要创建一个新的 `StreamableFile`，您可以将 `Buffer` 或 `Stream` 传递给 `StreamableFile` 构造函数。

> 信息 **提示** `StreamableFile` 类可以从 `@nestjs/common` 导入。

#### 跨平台支持

Fastify 默认情况下，可以不需要调用 `stream.pipe(res)` 来发送文件，所以您不需要使用 `StreamableFile` 类。但是，Nest 在两个平台类型中都支持使用 `StreamableFile`，因此，如果您 ultimate-switch ระหว่าง Express 和 Fastify，可以不用担心这两个引擎之间的兼容性。

#### 示例

您可以在以下找到简单示例，用于将 `package.json` 作为文件而不是 JSON 发送，但是这个想法可以自然地扩展到图像、文档和任何其他文件类型。

```ts
import { Controller, Get, StreamableFile } from '@nestjs/common';
import { createReadStream } from 'node:fs';
import { join } from 'node:path';

@Controller('file')
export class FileController {
  @Get()
  getFile(): StreamableFile {
    const file = createReadStream(join(process.cwd(), 'package.json'));
    return new StreamableFile(file);
  }
}

```

默认的内容类型（HTTP 响应头`Content-Type`的值）是 `application/octet-stream`。如果您需要自定义这个值，可以使用 `type` 选项从 `StreamableFile` 中获取，或者使用 `res.set` 方法或 [__INLINE_CODE_20__](/controllers#response-headers) 装饰器，如下所示：

```ts
import { Controller, Get, StreamableFile, Res } from '@nestjs/common';
import { createReadStream } from 'node:fs';
import { join } from 'node:path';
import type { Response } from 'express'; // Assuming that we are using the ExpressJS HTTP Adapter

@Controller('file')
export class FileController {
  @Get()
  getFile(): StreamableFile {
    const file = createReadStream(join(process.cwd(), 'package.json'));
    return new StreamableFile(file, {
      type: 'application/json',
      disposition: 'attachment; filename="package.json"',
      // If you want to define the Content-Length value to another value instead of file's length:
      // length: 123,
    });
  }

  // Or even:
  @Get()
  getFileChangingResponseObjDirectly(@Res({ passthrough: true }) res: Response): StreamableFile {
    const file = createReadStream(join(process.cwd(), 'package.json'));
    res.set({
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="package.json"',
    });
    return new StreamableFile(file);
  }

  // Or even:
  @Get()
  @Header('Content-Type', 'application/json')
  @Header('Content-Disposition', 'attachment; filename="package.json"')
  getFileUsingStaticValues(): StreamableFile {
    const file = createReadStream(join(process.cwd(), 'package.json'));
    return new StreamableFile(file);
  }  
}

```