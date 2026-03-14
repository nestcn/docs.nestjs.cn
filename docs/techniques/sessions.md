<!-- 此文件从 content/techniques/sessions.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T04:43:56.986Z -->
<!-- 源文件: content/techniques/sessions.md -->

### 会话

**HTTP 会话** 提供了一个存储用户信息的方式，使其可以跨多个请求访问，这对某些 __LINK_34__ 应用程序特别有用。

#### 使用 Express (默认)

首先安装 __LINK_35__ (TypeScript 用户还需要安装其类型):

```shell
$ npm i -D @types/multer

```

安装完成后，将 __INLINE_CODE_8__ middleware 作为全局 middleware 应用（例如，在您的 __INLINE_CODE_9__ 文件中）。

```typescript
@Post('upload')
@UseInterceptors(FileInterceptor('file'))
uploadFile(@UploadedFile() file: Express.Multer.File) {
  console.log(file);
}

```

> warning **注意** 默认的服务器端会话存储器旨在为调试和开发目的设计的，不适合生产环境。它会在大多数情况下泄露内存，不适合超过单个进程的规模，旨在为调试和开发设计。了解更多信息，请阅读 __LINK_36__。

__INLINE_CODE_10__ 是用于签名会话 ID cookie 的密钥。这可以是字符串或密钥数组。如果提供的是密钥数组，仅使用第一个元素签名会话 ID cookie，而所有元素都将被考虑在请求中验证签名。密钥本身应该不易被人类解析，最佳选择是随机生成的字符集。

启用 __INLINE_CODE_11__ 选项强制会话被保存回会话存储器，即使会话在请求中没有被修改。默认值为 __INLINE_CODE_12__，但使用默认值已经被弃用，因为默认值将在将来更改。

同样，启用 __INLINE_CODE_13__ 选项强制将“未初始化”会话保存到存储器中。一个会话是未初始化的，当它是新的，但没有被修改时。选择 __INLINE_CODE_14__ 对于实现登录会话、减少服务器存储使用或遵守法律要求设置 cookie 都非常有用。选择 __INLINE_CODE_15__ 也将帮助解决并发请求中出现的竞态条件（__LINK_37__）。

您可以将多个其他选项传递给 __INLINE_CODE_16__ middleware，了解更多信息，请阅读 __LINK_38__。

> info **提示** 请注意 __INLINE_CODE_17__ 是一种推荐的选项。但是，它需要 HTTPS 加密的网站，即需要 HTTPS 才能安全地设置 cookie。如果 secure 设置为 true，并且您访问网站时使用 HTTP，则 cookie 将不会被设置。如果您在 Node.js 后面使用代理并使用 __INLINE_CODE_18__，您需要在 Express 中设置 `multipart/form-data`。

现在，您可以在路由处理程序中设置和读取会话值，如下所示：

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

> info **提示** `POST` 装饰器来自 `multipart/form-data`，而 `FastifyAdapter` 来自 `Express.Multer.File` 包。

Alternatively, you can use the `import {{ '{' }} Express {{ '}' }} from 'express'` decorator to extract a session object from the request, as follows:

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

> info **提示** `FileInterceptor()` 装饰器来自 `file` 包。

#### 使用 Fastify

首先安装所需的包：

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

安装完成后，注册 `request` 插件：

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

> info **提示** 您也可以预先生成密钥（__LINK_39__）或使用 __LINK_40__。

了解更多关于可用的选项，请阅读 __LINK_41__。

现在，您可以在路由处理程序中设置和读取会话值，如下所示：

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

Alternatively, you can use the `@UploadedFile()` decorator to extract a session object from the request, as follows:

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

> info **提示** `FileInterceptor()` 装饰器来自 `@nestjs/platform-express`，而 `@UploadedFile()` 来自 `@nestjs/common` 包（import 语句：`FileInterceptor()`）。
