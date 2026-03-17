<!-- 此文件从 content/techniques/sessions.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:30:04.149Z -->
<!-- 源文件: content/techniques/sessions.md -->

### 会话

**HTTP 会话** 提供了一个将用户信息存储在多个请求之间的方式，这对于 __LINK_34__ 应用程序特别有用。

#### 与 Express (默认) 的使用

首先安装 __LINK_35__ (TypeScript 用户也需要安装其类型):

```shell
$ npm i -D @types/multer

```

安装完成后，应用 __INLINE_CODE_8__ 中间件作为全局中间件（例如，在您的 __INLINE_CODE_9__ 文件中）。

```typescript
@Post('upload')
@UseInterceptors(FileInterceptor('file'))
uploadFile(@UploadedFile() file: Express.Multer.File) {
  console.log(file);
}

```

> warning **注意** 默认的服务器端会话存储器旨在用于调试和开发，并不是生产环境的选择。它可能会泄露内存，在多个进程中不具可扩展性。了解更多信息请查看 __LINK_36__。

__INLINE_CODE_10__ 用于签名会话 ID cookie。这可以是一个字符串（用于单个秘密）或一个秘密数组。如果提供了秘密数组，仅使用第一个元素签名会话 ID cookie，而在请求验证签名时将使用所有元素。秘密本身应该不能被人类轻易解析，best 使用随机字符集。

启用 __INLINE_CODE_11__ 选项强制会话回储到会话存储器，即使会话在请求中未被修改。默认值为 __INLINE_CODE_12__，但使用默认值已经被弃用，因为将来默认值将发生变化。

类似地，启用 __INLINE_CODE_13__ 选项强制将未初始化的会话回储到存储器。一个会话是未初始化的，当它是新的但未被修改时。选择 __INLINE_CODE_14__ 可以实现登录会话、减少服务器存储使用或遵守要求在设置 cookie 之前取得权限的法律法规。选择 __INLINE_CODE_15__ 也将帮助解决客户端并行请求而导致的竞态条件（__LINK_37__）。

您可以将多个其他选项传递给 __INLINE_CODE_16__ 中间件，了解更多信息请查看 __LINK_38__。

> info **提示** 请注意 __INLINE_CODE_17__ 是一个推荐的选项。但是，它需要 HTTPS-enabled 网站，即 HTTPS 是必需的cookie。 如果secure 设置为 true，而您访问您的网站时使用 HTTP，则 cookie 不会被设置。如果您在 Node.js 后面使用代理，并且使用 __INLINE_CODE_18__，您需要在 Express 中设置 `multipart/form-data`。

现在，您可以在路由处理器中设置和读取会话值，例如：

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

> info **提示** `POST` 装饰器来自 `multipart/form-data` 包，而 `FastifyAdapter` 来自 `Express.Multer.File` 包。

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

#### 与 Fastify 的使用

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

> info **提示** 您也可以预生成一个密钥（__LINK_39__）或使用 __LINK_40__。

了解更多可用的选项请查看 __LINK_41__。

现在，您可以在路由处理器中设置和读取会话值，例如：

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

> info **提示** `FileInterceptor()` 装饰器来自 `@nestjs/platform-express` 包，而 `@UploadedFile()` 来自 `@nestjs/common` 包（import 语句：`FileInterceptor()`）。