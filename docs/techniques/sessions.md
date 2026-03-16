<!-- 此文件从 content/techniques/sessions.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T05:08:26.288Z -->
<!-- 源文件: content/techniques/sessions.md -->

### 会话

**HTTP 会话** 提供了一个将用户信息存储在多个请求之间的方式，这对 __LINK_34__ 应用程序非常有用。

#### 使用 Express（默认）

首先安装 __LINK_35__（TypeScript 用户还需要安装其类型）：

```shell
$ npm i -D @types/multer

```

安装完成后，请将 __INLINE_CODE_8__ 中间件作为全局中间件应用于你的 __INLINE_CODE_9__ 文件中。

```typescript
@Post('upload')
@UseInterceptors(FileInterceptor('file'))
uploadFile(@UploadedFile() file: Express.Multer.File) {
  console.log(file);
}

```

> warning **注意** 默认的服务器端会话存储器旨在用于调试和开发，不能用于生产环境。它会泄露内存，在多个进程中不支持，并且将在将来更改。了解更多信息，请阅读 __LINK_36__。

__INLINE_CODE_10__ 用于签名会话 ID cookie。这可以是一个字符串（单个秘密）或一个秘密数组。如果提供了秘密数组，则将使用数组中的第一个元素签名会话 ID cookie，而在请求验证签名时将考虑所有元素。秘密本身应该难以被人类解析，最佳情况是使用一个随机字符集。

启用 __INLINE_CODE_11__ 选项强制会话被保存回会话存储器，即使会话在请求中未被修改。默认值为 __INLINE_CODE_12__，但是使用默认值已被弃用，因为默认值将在将来更改。

类似地，启用 __INLINE_CODE_13__ 选项强制将“未初始化”会话保存到存储器中。会话是未初始化的，如果它是新的但没有被修改。选择 __INLINE_CODE_14__ 对于实现登录会话、减少服务器存储使用或遵守法律要求设置cookie非常有用。选择 __INLINE_CODE_15__ 也将帮助解决并发请求中的竞争条件（__LINK_37__）。

你可以将多个选项传递给 __INLINE_CODE_16__ 中间件，了解更多信息，请阅读 __LINK_38__。

> info **提示** 请注意 __INLINE_CODE_17__ 是一种推荐选项。然而，它需要 HTTPS 加密网站，即 HTTPS 是设置安全cookie的必要条件。如果 secure 设置为 true，并且你访问你的网站使用 HTTP，则cookie将不会被设置。如果你在 Node.js 后面使用代理，并且使用 __INLINE_CODE_18__，你需要在 Express 中设置 `multipart/form-data`。

现在，你可以在路由处理程序中设置和读取会话值，例如：

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

Alternatively，您可以使用 `import {{ '{' }} Express {{ '}' }} from 'express'` 装饰器从请求中提取会话对象，例如：

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

> info **提示** 你也可以预生成一个键 (__LINK_39__) 或使用 __LINK_40__。

了解更多关于可用的选项的信息，请阅读 __LINK_41__。

现在，你可以在路由处理程序中设置和读取会话值，例如：

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

Alternatively，您可以使用 `@UploadedFile()` 装饰器从请求中提取会话对象，例如：

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