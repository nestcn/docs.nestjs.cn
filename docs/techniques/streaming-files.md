<!-- 此文件从 content/techniques/streaming-files.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T05:14:31.349Z -->
<!-- 源文件: content/techniques/streaming-files.md -->

### 文件流

> info **注意** 本章节展示了如何从 HTTP 应用程序中流式传输文件。以下示例不适用于 GraphQL 或微服务应用程序。

有时，您可能想要将文件从 REST API 发送回客户端。使用 Nest 的情况下，您通常会这样做：

```ts
@Controller('file')
export class FileController {
  @Get()
  getFile(@Res() res: Response) {
    const file = createReadStream(join(process.cwd(), 'package.json'));
    file.pipe(res);
  }
}

```

这样做，您将失去 post-controller 拦截器逻辑的访问权限。为了解决这个问题，您可以返回一个 `StreamableFile` 实例，下面框架将负责将响应 piped。

#### 可流式文件类

`StreamableFile` 是一个持有要返回的流的类。要创建一个新的 `StreamableFile`，您可以将 `Buffer` 或 `Stream` 传递给 `StreamableFile` 构造函数。

> info **提示** `StreamableFile` 类可以从 `@nestjs/common` 导入。

#### 跨平台支持

Fastify 默认情况下，可以无需调用 `stream.pipe(res)` 发送文件，因此您不需要使用 `StreamableFile` 类。然而，Nest 在两个平台类型中都支持使用 `StreamableFile`，因此如果您最终_switched_Express 和 Fastify 之间，您不需要担心两种引擎之间的兼容性。

#### 示例

您可以找到返回 `package.json` 作为文件，而不是 JSON 的简单示例，然而，这个想法自然地扩展到图像、文档和其他文件类型。

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

默认的内容类型（`Content-Type` HTTP 响应头的值）是 `application/octet-stream`。如果您需要自定义这个值，可以使用 `type` 选项来自 `StreamableFile`，或使用 `res.set` 方法或 [__INLINE_CODE_20__](/controllers#response-headers) 装饰器，如下所示：

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