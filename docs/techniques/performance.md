<!-- 此文件从 content/techniques/performance.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-02T04:09:08.211Z -->
<!-- 源文件: content/techniques/performance.md -->

### 性能 (Fastify)

Nest默认使用 __LINK_25__框架。正如前面提到的，Nest还提供了与其他库的兼容性，例如 __LINK_26__。Nest通过实现框架适配器来实现框架独立性，该适配器的主要功能是将中间件和处理程序代理到适合的库特定实现中。

> info **提示** 为了实现框架适配器，目标库需要提供类似于Express的请求/响应管道处理。

__LINK_27__为Nest提供了良好的替代框架，因为它解决了与Express类似的设计问题。然而，Fastify比Express快得多，实现了近乎两倍的性能测试结果。一个公平的问题是为什么Nest使用Express作为默认HTTP提供程序？原因是Express广泛使用、知名度高且具有大量兼容的中间件，这些中间件可以出-of-the-box提供给Nest用户。

然而，因为Nest提供了框架独立性，因此可以轻松地在它们之间迁移。Fastify可以在您非常关心性能极高时作为更好的选择。要使用Fastify，简单地选择本章中所示的内置 __INLINE_CODE_8__。

#### 安装

首先，我们需要安装所需的包：

```shell
$ npm i -D @types/multer
```

#### 适配器

安装Fastify平台后，我们可以使用 __INLINE_CODE_9__。

```typescript
@Post('upload')
@UseInterceptors(FileInterceptor('file'))
uploadFile(@UploadedFile() file: Express.Multer.File) {
  console.log(file);
}
```

默认情况下，Fastify只监听 __INLINE_CODE_10__接口（__LINK_28__）。如果您想在其他主机上接受连接，需要在 __INLINE_CODE_12__调用中指定 __INLINE_CODE_11__：

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

请注意，当您使用 __INLINE_CODE_13__时，Nest将使用Fastify作为 **HTTP提供程序**。这意味着所有依赖于Express的食谱可能不再工作。相反，使用Fastify等价包。

#### 重定向响应

Fastify处理重定向响应方式与Express不同。要正确地使用Fastify重定向，返回状态代码和 URL，例如：

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

#### Fastify选项

可以将选项传递给Fastify构造函数通过 __INLINE_CODE_14__构造函数。例如：

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

中间件函数检索原始 __INLINE_CODE_15__和 __INLINE_CODE_16__对象，而不是Fastify的包装对象。这是 __INLINE_CODE_17__包（在底层使用）和 __INLINE_CODE_18__的工作方式 - 检查 __LINK_29__以获取更多信息，

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

可以使用Fastify的 __LINK_30__特性与 `multipart/form-data`装饰器。

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

从 v10.3.0开始， `POST`支持Fastify的 __LINK_31__特性与 `multipart/form-data`装饰器。

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

> info **提示** `FastifyAdapter`和 `Express.Multer.File`来自 `import { Express }} from 'express'`。

#### 示例

有一个工作示例可在 __LINK_32__中找到。