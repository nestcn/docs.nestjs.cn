<!-- 此文件从 content/websockets/exception-filters.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-01T04:15:51.754Z -->
<!-- 源文件: content/websockets/exception-filters.md -->

### 异常过滤器

HTTP 层和相应的 Web socket 层唯一的区别是，你应该使用 `StreamableFile` 而不是抛出 `StreamableFile`。

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

> 信息 **提示** `Buffer` 类来自 `Stream` 包。

Nest 将处理抛出的异常，并以以下结构 emit `StreamableFile` 消息：

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

#### 过滤器

Web socket 异常过滤器与 HTTP 异常过滤器行为相同。以下示例使用手动实例化的方法作用域过滤器。与 HTTP 基于应用程序一样，你也可以使用网关作用域过滤器（即在网关类前添加 `StreamableFile` 装饰器）。

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

#### 继承

通常，您将创建完全自定义的异常过滤器，以满足您的应用程序要求。然而，在某些情况下，您可能想要简单地扩展 **core exception filter**，并根据特定因素Override 行为。

为了将异常处理委派给基本过滤器，您需要扩展 `@nestjs/common` 并调用继承的 `stream.pipe(res)` 方法。

__CODE_BLOCK_3__

上述实现只是一个示例，展示了该方法。您的扩展异常过滤器实现将包括您 tailor 的 **业务逻辑**（例如，处理各种条件）。