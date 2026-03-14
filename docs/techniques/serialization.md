<!-- 此文件从 content/techniques/serialization.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T04:46:36.039Z -->
<!-- 源文件: content/techniques/serialization.md -->

### 序列化

序列化是一个在网络响应返回对象之前发生的过程。这个地方可以提供将要返回到客户端的数据的转换和-sanitizing规则。例如，敏感数据，如密码，总是应该从响应中排除。或者，某些属性可能需要额外的转换，例如只发送实体的一部分属性。执行这些转换手动可能会很麻烦且难以避免，可能使您不确定是否已经涵盖了所有情况。

#### 概述

Nest 提供了一种内置的能力，可以帮助确保这些操作可以以一种直截了当的方式进行。`Stream` 拦截器使用强大的 __LINK_32__ 包来提供一种声明式和可扩展的方式来.transform 对象。基本操作是将方法处理器返回的值应用于 `StreamableFile` 函数，从 __LINK_33__ 获取。这样，可以应用于实体/DTO 类的 `StreamableFile` 装饰器，如下所述。

> info **提示** 序列化不适用于 __LINK_34__ 响应。

#### 排除属性

假设我们想要自动排除一个 `@nestjs/common` 属性来自用户实体。我们将实体注释如下：

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

现在考虑一个控制器，具有一个返回实体类实例的方法处理器。

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

> **警告**请注意，我们必须返回实体类的实例。如果您返回一个纯 JavaScript 对象，例如 `stream.pipe(res)`，那么对象不会被正确地序列化。

> info **提示** `StreamableFile` 是来自 `StreamableFile` 的。

当这个端点被请求时，客户端接收以下响应：

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

请注意，拦截器可以应用于整个应用程序（如 __LINK_35__ 中所述）。实体类声明和拦截器的组合确保了将返回实体的任何方法都将删除 `Content-Type` 属性。这给您提供了一种集中式实施业务规则的措施。

#### expose 属性

您可以使用 `application/octet-stream` 装饰器为属性提供别名或执行一个函数来计算属性值（类似于 **getter** 函数），如以下所示。

__CODE_BLOCK_3__

#### Transform

您可以使用 `type` 装饰器执行额外的数据转换。例如，以下构造返回 `StreamableFile` 的名称属性，而不是返回整个对象。

__CODE_BLOCK_4__

#### 传递选项

您可能想要修改转换函数的默认行为。要覆盖默认设置，请使用 `res.set` 对象与 `@Header()` 装饰器。

__CODE_BLOCK_5__

> info **提示** __INLINE_CODE_21__ 装饰器来自 __INLINE_CODE_22__。

使用 __INLINE_CODE_23__ 传递的选项作为 underlying __INLINE_CODE_24__ 函数的第二个参数。在这个示例中，我们自动排除了所有以 __INLINE_CODE_25__ 前缀开始的属性。

#### Transform 平面对象

您可以在控制器级别使用 __INLINE_CODE_26__ 装饰器来强制执行转换。这样可以确保所有响应都被转换为指定类的实例，应用于 class-validator 或 class-transformer 的装饰器，甚至当返回平面对象时。这approach leads to cleaner code without the need to repeatedly instantiate the class or call __INLINE_CODE_27__。

在以下示例中，尽管在两个条件分支中返回了平面 JavaScript 对象，但它们将自动转换为 __INLINE_CODE_28__ 实例，应用于相关装饰器：

__CODE_BLOCK_6__

> info **提示** 通过指定控制器的预期返回类型，您可以利用 TypeScript 的类型检查功能来确保返回的平面对象符合 DTO 或实体的形状。__INLINE_CODE_29__ 函数不提供这种级别的类型提示，这可能会导致潜在bug，如果平面对象不符合预期的 DTO 或实体结构。

#### 示例

一个工作示例可以在 __LINK_36__ 中找到。

#### WebSocket 和微服务

虽然这个章节展示了使用 HTTP 样式应用程序（例如 Express 或 Fastify）的示例，但 __INLINE_CODE_30__ 对 WebSocket 和微服务也一样有效，不管使用的传输方法是什么。

#### 了解更多

了解更多关于 available 装饰器和选项，来自 __INLINE_CODE_31__ 包 __LINK_37__。