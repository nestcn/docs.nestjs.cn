### 流式文件

> **注意** 本章展示如何从你的 **HTTP 应用**中流式传输文件。以下示例不适用于 GraphQL 或微服务应用。

有时你可能需要从 REST API 向客户端返回文件。在 Nest 中通常你会这样做：

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

但这样做会导致你失去对控制器后拦截器逻辑的访问。要处理这种情况，你可以返回一个 `StreamableFile` 实例，框架会在底层自动处理响应流的管道传输。

#### 可流式传输的文件类

`StreamableFile` 是一个封装待返回流的类。要创建新的 `StreamableFile`，可以向 `StreamableFile` 构造函数传入 `Buffer` 或 `Stream`。

> info **提示** `StreamableFile` 类可从 `@nestjs/common` 导入。

#### 跨平台支持

Fastify 默认支持直接发送文件而无需调用 `stream.pipe(res)`，因此您完全不需要使用 `StreamableFile` 类。不过 Nest 在两种平台类型中都支持使用 `StreamableFile`，所以如果您需要在 Express 和 Fastify 之间切换，也无需担心两个引擎的兼容性问题。

#### 示例

您可以在下方找到一个简单示例，该示例将 `package.json` 作为文件而非 JSON 返回，这个思路自然可以延伸到图片、文档及其他任何文件类型。

```ts
import { Controller, Get, StreamableFile } from '@nestjs/common';
import { createReadStream } from 'fs';
import { join } from 'path';

@Controller('file')
export class FileController {
  @Get()
  getFile(): StreamableFile {
    const file = createReadStream(join(process.cwd(), 'package.json'));
    return new StreamableFile(file);
  }
}
```

默认的内容类型（即 HTTP 响应头 `Content-Type` 的值）是 `application/octet-stream`。如需自定义该值，您可以使用 `StreamableFile` 的 `type` 选项，或使用 `res.set` 方法以及 [`@Header()`](/controllers#response-headers) 装饰器，如下所示：

```ts
import { Controller, Get, StreamableFile, Res } from '@nestjs/common';
import { createReadStream } from 'fs';
import { join } from 'path';
import type { Response } from 'express'; // Assuming that we are using the ExpressJS HTTP Adapter
```

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
  getFileChangingResponseObjDirectly(
    @Res({ passthrough: true }) res: Response
  ): StreamableFile {
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
