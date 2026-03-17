<!-- 此文件从 content/techniques/sessions.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T04:57:13.504Z -->
<!-- 源文件: content/techniques/sessions.md -->

### 会话

**HTTP 会话** 提供了将信息存储在多个请求之间的方法，这对 __LINK_34__ 应用程序特别有用。

#### 使用 Express (默认)

首先安装 __LINK_35__ (TypeScript 用户请安装其类型):

```shell
$ npm i -D @types/multer

```

安装完成后，在您的 __INLINE_CODE_9__ 文件中将 __INLINE_CODE_8__ middleware 作为全局 middleware 应用。

```typescript
@Post('upload')
@UseInterceptors(FileInterceptor('file'))
uploadFile(@UploadedFile() file: Express.Multer.File) {
  console.log(file);
}

```

> 警告 **注意** 默认的服务器端会话存储不是为了生产环境设计的。它会在大多数情况下泄露内存，不支持多进程 Scale 和旨在 debug 和开发中。请阅读 __LINK_36__。

__INLINE_CODE_10__ 用于签名会话 ID cookie。这可以是一个字符串（单个秘密）或一个数组（多个秘密）。如果提供了多个秘密的数组，仅使用第一个元素签名会话 ID cookie，而在请求验证时考虑所有元素。秘密本身应该不易被人类解析，最佳情况下是一个随机字符集。

启用 __INLINE_CODE_11__ 选项强制会话保存回会话存储，即使会话在请求中未被修改。默认值为 __INLINE_CODE_12__，但是使用默认值已经被弃用，因为默认值将在将来改变。

类似地，启用 __INLINE_CODE_13__ 选项强制将未初始化的会话保存到存储中。会话是未初始化的，当它是新的但未被修改时。选择 __INLINE_CODE_14__ 对于实现登录会话、减少服务器存储使用或遵守法律要求设置 cookie 有用。选择 __INLINE_CODE_15__ 也将帮助解决并发请求中客户端没有会话的问题 (__LINK_37__）。

您可以将其他选项传递给 __INLINE_CODE_16__ middleware，阅读更多关于它们的信息在 __LINK_38__。

> 提示 **提示** 请注意 __INLINE_CODE_17__ 是一个推荐的选项。但是，它需要 HTTPS-enabled 网站，即 HTTPS 是必要的 cookie。 如果secure 设置为 true，您访问的网站需要使用 HTTPS。如果您使用 __INLINE_CODE_18__  node.js  behind 代理，您需要将 `multipart/form-data` 设置为 express。

现在，您可以在路由处理程序中设置和读取会话值，以下是示例：

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

> 提示 **提示** `POST` 装饰器来自 `multipart/form-data`，而 `FastifyAdapter` 来自 `Express.Multer.File` 包。

或者，您可以使用 `import {{ '{' }} Express {{ '}' }} from 'express'` 装饰器从请求中提取会话对象，以下是示例：

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

> 提示 **提示** 您也可以预生成密钥 (__LINK_39__) 或使用 __LINK_40__。

阅读更多关于可用的选项在 __LINK_41__。

现在，您可以在路由处理程序中设置和读取会话值，以下是示例：

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

或者，您可以使用 `@UploadedFile()` 装饰器从请求中提取会话对象，以下是示例：

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

> 提示 **提示** `FileInterceptor()` 装饰器来自 `@nestjs/platform-express`，而 `@UploadedFile()` 来自 `@nestjs/common` 包（import 语句：`FileInterceptor()`）。