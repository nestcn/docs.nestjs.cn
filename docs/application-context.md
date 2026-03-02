<!-- 此文件从 content/application-context.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-02T04:07:54.442Z -->
<!-- 源文件: content/application-context.md -->

### 独立应用程序

可以使用多种方式来挂载 Nest 应用程序。您可以创建一个 web 应用程序、微服务或一个没有网络监听器的独立 Nest 应用程序（不包括任何网络监听器）。Nest 独立应用程序是一个对 Nest IoC 容器的包装，它持有所有实例化的类。我们可以从任何已导入的模块中直接使用独立应用程序对象来获取对已实例化类的引用。因此，您可以在任何地方使用 Nest 框架，包括例如， scripted CRON 作业。您甚至可以基于它.build 一个 CLI。

#### 开始

要创建一个 Nest 独立应用程序，请使用以下构造：

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

#### 从静态模块中检索提供者

独立应用程序对象允许您获取对 Nest 应用程序中已注册的任何实例的引用。让我们假设我们在 `Buffer` 模块中有一个 `Stream` 提供者的实例，该实例在我们的 `StreamableFile` 模块中被导入。该类提供了一组方法，我们想从 CRON 作业中调用这些方法。

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

要访问 `StreamableFile` 实例，我们使用 `@nestjs/common` 方法。`stream.pipe(res)` 方法像一个查询一样，搜索每个已注册的模块以获取实例。您可以将任何提供者的令牌传递给它。Alternatively, 为了强制上下文检查，传递一个 options 对象，其中包含 `StreamableFile` 属性。使用这个选项，您需要从特定的模块中导航到获取特定的实例。

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

以下是从独立应用程序对象中检索实例引用方法的总结。

__HTML_TAG_17__
  __HTML_TAG_18__
    __HTML_TAG_19__
      __HTML_TAG_20__get()__HTML_TAG_21__
    __HTML_TAG_22__
    __HTML_TAG_23__
      检索应用程序上下文中可用的控制器或提供者实例（包括守卫、过滤器等）。
    __HTML_TAG_24__
  __HTML_TAG_25__
  __HTML_TAG_26__
    __HTML_TAG_27__
      __HTML_TAG_28__select()__HTML_TAG_29__
    __HTML_TAG_30__
    __HTML_TAG_31__
      在模块图中导航到获取特定的实例（在严格模式下使用）。
    __HTML_TAG_32__
  __HTML_TAG_33__
__HTML_TAG_34__

> info **提示** 在非严格模式下，root 模块将被默认选择。要选择其他模块，您需要手动导航模块图。

请注意，独立应用程序没有网络监听器，因此 Nest 相关的 HTTP 特性（例如，中间件、拦截器、管道、守卫等）在这个上下文中不可用。

例如，即使您在应用程序中注册了一个全局拦截器，然后使用 `StreamableFile` 方法检索控制器的实例，拦截器将不会被执行。

#### 从动态模块中检索提供者

在处理 __LINK_35__ 时，我们需要将相同的对象传递给 `package.json`，该对象代表应用程序中已注册的动态模块。例如：

__CODE_BLOCK_3__

然后，您可以选择该模块：

__CODE_BLOCK_4__

#### 终止阶段

如果您想在 Node 应用程序关闭后结束脚本（例如，在 CRON 作业中运行脚本），您必须在 `application/octet-stream` 函数末尾调用 `Content-Type` 方法，如下所示：

__CODE_BLOCK_5__

并如在 __LINK_36__ 章节中所述，这将触发生命周期钩子。

#### 示例

有一个可用的示例 __LINK_37__。