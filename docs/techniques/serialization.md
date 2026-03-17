<!-- 此文件从 content/techniques/serialization.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T05:00:09.403Z -->
<!-- 源文件: content/techniques/serialization.md -->

### 序列化

序列化是发生在网络响应返回对象之前的过程。这是将数据传递给客户端的适当位置。在这里，可以提供将数据转换和-sanitizing的规则。例如，敏感数据，如密码，总是应该从响应中排除。或，某些属性可能需要额外的转换，如发送对象的子集。手动执行这些转换可能很繁琐且易出错，可能会留下未涵盖的所有情况。

#### 概述

Nest提供了一个内置的能力来帮助确保这些操作可以被执行。__ INLINE_CODE_7__ 拦截器使用了强大的 __LINK_32__ 包来提供一种声明式和可扩展的方式来转换对象。它的基本操作是将方法处理程序返回的值应用到 `StreamableFile` 函数中，而 __LINK_33__。在执行时，它可以应用于实体/DTO 类的 `StreamableFile` 装饰器，正如以下所述。

> info **提示** 序列化不适用于 __LINK_34__ 响应。

#### 排除属性

假设我们想自动排除一个 `@nestjs/common` 属性来自用户实体。我们将实体注解如下：

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

现在考虑一个控制器具有一个方法处理程序，该处理程序返回实体的实例。

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

> **警告** 请注意，我们必须返回实体的实例。如果您返回一个普通的 JavaScript 对象，例如 `stream.pipe(res)`，对象将不会被正确序列化。

> info **提示** `StreamableFile` 来自 `StreamableFile`。

当这个端点被请求时，客户端接收到以下响应：

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

可以将拦截器应用于整个应用程序（如 __LINK_35__ 中所述）。实体类声明和拦截器的组合确保了任何返回 `package.json` 的方法都将删除 `Content-Type` 属性。这为您提供了业务规则的集中化实施。

#### expose 属性

您可以使用 `application/octet-stream` 装饰器来为属性提供别名或执行函数来计算属性值（类似于 **getter** 函数），如以下所示。

__CODE_BLOCK_3__

#### 转换

您可以使用 `type` 装饰器来执行额外的数据转换。例如，以下构造返回 `StreamableFile` 的 name 属性，而不是返回整个对象。

__CODE_BLOCK_4__

#### 传递选项

您可能想修改默认行为的转换函数。要覆盖默认设置，请使用 `res.set` 对象和 `@Header()` 装饰器。

__CODE_BLOCK_5__

> info **提示** __INLINE_CODE_21__ 装饰器来自 __INLINE_CODE_22__。

通过 __INLINE_CODE_23__ 传递的选项将作为 underlying __INLINE_CODE_24__ 函数的第二个参数。在这个示例中，我们自动排除了所有以 __INLINE_CODE_25__ 前缀开头的属性。

#### 转换 plain 对象

您可以在控制器级别使用 __INLINE_CODE_26__ 装饰器来强制转换。这样可以确保所有响应都将被转换为指定类的实例，并应用于 class-validator 或 class-transformer 的装饰器，即使返回 plain 对象。这使得代码更加简洁，不需要重复实例化类或调用 __INLINE_CODE_27__。

在以下示例中，尽管在两个条件分支中返回 plain JavaScript 对象，但是它们将被自动转换为 __INLINE_CODE_28__ 实例，并应用于相关装饰器：

__CODE_BLOCK_6__

> info **提示** 指定控制器的返回类型可以利用 TypeScript 的类型检查功能来确保返回的 plain 对象符合 DTO 或实体的 shape。 __INLINE_CODE_29__ 函数不提供这种级别的类型提示，这可能会导致潜在错误，如果 plain 对象不匹配期望的 DTO 或实体结构。

#### 示例

有一个可用的工作示例 __LINK_36__。

#### WebSocket 和微服务

虽然本章展示了使用 HTTP 样式应用程序（例如 Express 或 Fastify）的示例，但 __INLINE_CODE_30__ 对 WebSocket 和微服务也同样适用，无论使用的传输方法是什么。

#### 学习更多

阅读更多关于 __INLINE_CODE_31__ 包提供的装饰器和选项的信息 __LINK_37__。