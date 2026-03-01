<!-- 此文件从 content/techniques/performance.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-01T04:16:57.428Z -->
<!-- 源文件: content/techniques/performance.md -->

### 性能（Fastify）

默认情况下，Nest 使用 __LINK_25__ 框架。正如前面提到的，Nest 还提供了与其他库的兼容性，例如 __LINK_26__。Nest 实现了框架适配器的主要功能是将中间件和处理程序代理到适合库特定的实现中。

> 信息 **提示** 在实现框架适配器时，目标库需要提供与 Express 类似的请求/响应管道处理。

__LINK_27__ 是一个好的 Nest 框架选择，因为它解决了与 Express 类似的设计问题。然而，Fastify 快得多，性能测试结果几乎是 Express 的两倍。一个公平的问题是，Nest 为什么使用 Express 作为默认的 HTTP 提供者？原因是 Express 广泛使用，知名度高，具有大量兼容的中间件，可以在 Nest 用户中无需额外安装。

然而，因为 Nest 提供了框架独立性，您可以轻松地在它们之间迁移。Fastify 可以在您对性能非常看重时是一个更好的选择。要使用 Fastify，简单地选择本章中的内置 __INLINE_CODE_8__。

#### 安装

首先，我们需要安装所需的包：

```shell
$ npm i -D @types/multer
```

#### 适配器

安装 Fastify 平台后，我们可以使用 __INLINE_CODE_9__。

```typescript
@Post('upload')
@UseInterceptors(FileInterceptor('file'))
uploadFile(@UploadedFile() file: Express.Multer.File) {
  console.log(file);
}
```

默认情况下，Fastify 只监听 __INLINE_CODE_10__ 接口（__LINK_28__）。如果您想接受其他主机的连接，您应该在 __INLINE_CODE_12__ 调用中指定 __INLINE_CODE_11__：

```typescript
import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class FileSizeValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    // "value" is an object containing the file's attributes and metadata
    const oneKb = 1000;
    return value.size < oneKb;
  }
}
```

#### 平台特定包

使用 __INLINE_CODE_13__ 时，Nest 使用 Fastify 作为 **HTTP 提供者**。这意味着每个依赖于 Express 的配方可能不再工作。相反，您应该使用 Fastify 等价包。

#### 重定向响应

Fastify 处理重定向响应方式与 Express 不同。要正确地执行重定向，请返回 both 状态代码和 URL，例如：

```typescript
@Post('file')
@UseInterceptors(FileInterceptor('file'))
uploadFileAndValidate(@UploadedFile(
  new FileSizeValidationPipe(),
  // other pipes can be added here
) file: Express.Multer.File, ) {
  return file;
}
```

#### Fastify 选项

您可以将选项传递给 Fastify 构造函数通过 __INLINE_CODE_14__ 构造函数。例如：

```typescript
@Post('file')
uploadFileAndPassValidation(
  @Body() body: SampleDto,
  @UploadedFile(
    new ParseFilePipe({
      validators: [
        // ... Set of file validator instances here
      ]
    })
  )
  file: Express.Multer.File,
) {
  return {
    body,
    file: file.buffer.toString(),
  };
}
```

#### 中间件

中间件函数检索原始 __INLINE_CODE_15__ 和 __INLINE_CODE_16__ 对象，而不是 Fastify 的包装对象。这是 __INLINE_CODE_17__ 包（在底层使用）和 __INLINE_CODE_18__ 的工作方式 - 查看这个 __LINK_29__ 了解更多信息。

```typescript
export abstract class FileValidator<TValidationOptions = Record<string, any>> {
  constructor(protected readonly validationOptions: TValidationOptions) {}

  /**
   * Indicates if this file should be considered valid, according to the options passed in the constructor.
   * @param file the file from the request object
   */
  abstract isValid(file?: any): boolean | Promise<boolean>;

  /**
   * Builds an error message in case the validation fails.
   * @param file the file from the request object
   */
  abstract buildErrorMessage(file: any): string;
}
```

#### 路由配置

您可以使用 __LINK_30__ 的 Fastify 功能与 `multipart/form-data` 装饰器。

```typescript
@UploadedFile(
  new ParseFilePipe({
    validators: [
      new MaxFileSizeValidator({ maxSize: 1000 }),
      new FileTypeValidator({ fileType: 'image/jpeg' }),
    ],
  }),
)
file: Express.Multer.File,
```

#### 路由约束

自 v10.3.0 起，`POST` 支持 __LINK_31__ 的 Fastify 功能与 `multipart/form-data` 装饰器。

```typescript
@UploadedFile(
  new ParseFilePipeBuilder()
    .addFileTypeValidator({
      fileType: 'jpeg',
    })
    .addMaxSizeValidator({
      maxSize: 1000
    })
    .build({
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
    }),
)
file: Express.Multer.File,
```

> 信息 **提示** `FastifyAdapter` 和 `Express.Multer.File` 是从 `import { Express }} from 'express'` 进口的。

#### 示例

有一个可用的工作示例 __LINK_32__。