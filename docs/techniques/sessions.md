<!-- 此文件从 content/techniques/sessions.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:52:05.641Z -->
<!-- 源文件: content/techniques/sessions.md -->

### Session

**HTTP 会话** 提供了一种方法来存储用户信息，跨越多个请求，这对于 __LINK_34__ 应用程序非常有用。

#### 使用 Express (默认)

首先，安装 __LINK_35__ (TypeScript 用户需要安装类型):

```shell
$ npm i -D @types/multer

```

安装完成后，请将 __INLINE_CODE_8__ 中间件作为全局中间件应用于您的 __INLINE_CODE_9__ 文件中。

```typescript
@Post('upload')
@UseInterceptors(FileInterceptor('file'))
uploadFile(@UploadedFile() file: Express.Multer.File) {
  console.log(file);
}

```

> 警告 **注意** 默认的服务器端会话存储不是为生产环境设计的。它会在大多数情况下泄露内存，不支持多个进程 scales，并且旨在用于调试和开发。请阅读 __LINK_36__ 的更多信息。

__INLINE_CODE_10__ 用于签名会话 ID cookie。这可以是一个字符串，用于单个密钥，或者是一个数组，用于多个密钥。如果提供的密钥数组，仅使用第一个元素签名会话 ID cookie，而在请求验证签名时使用所有元素。密钥本身不应该易于人类解析，最佳情况下是一个随机字符集。

启用 __INLINE_CODE_11__ 选项强制将会话保存回会话存储，即使会话在请求中未被修改。默认值为 __INLINE_CODE_12__，但使用默认值已经弃用，因为默认值将在将来改变。

类似地，启用 __INLINE_CODE_13__ 选项强制将未初始化的会话保存到存储中。会话是未初始化的，如果它是新的但未被修改。选择 __INLINE_CODE_14__ 可以用于实现登录会话、减少服务器存储使用或遵守法律要求之前设置cookie。选择 __INLINE_CODE_15__ 也将帮助解决并发条件，客户端在没有会话的情况下发送多个并行请求 (__LINK_37__)。

您可以将多个其他选项传递给 __INLINE_CODE_16__ 中间件，请阅读 __LINK_38__ 中的更多信息。

> 提示 **提示** 请注意 __INLINE_CODE_17__ 是一种推荐选项。然而，它需要 HTTPS 加密的网站，即 HTTPS 是安全 cookie 的必要条件。如果 secure 设置为 true，并且您访问网站的方式是 HTTP，则 cookie 不会被设置。如果您在 Node.js 后面使用代理，并且使用 __INLINE_CODE_18__，则需要在 Express 中设置 `multipart/form-data`。

在这之后，您可以在路由处理程序中设置和读取会话值，例如：

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

> 提示 **提示** `POST` 装饰器来自 `multipart/form-data`，而 `FastifyAdapter` 从 `Express.Multer.File` 包中导入。

Alternately，您可以使用 `import {{ '{' }} Express {{ '}' }} from 'express'` 装饰器从请求中提取会话对象，例如：

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

> 提示 **提示** `FileInterceptor()` 装饰器来自 `file` 包。

#### 使用 Fastify

首先，安装所需的包：

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

安装完成后，请注册 `request` 插件：

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

> 提示 **提示** 您也可以预生成密钥 (__LINK_39__) 或使用 __LINK_40__。

阅读可用的选项更多信息，请阅读 __LINK_41__。

在这之后，您可以在路由处理程序中设置和读取会话值，例如：

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

Alternately，您可以使用 `@UploadedFile()` 装饰器从请求中提取会话对象，例如：

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

> 提示 **提示** `FileInterceptor()` 装饰器来自 `@nestjs/platform-express`，而 `@UploadedFile()` 从 `@nestjs/common` 包中导入（import 语句：`FileInterceptor()`）。