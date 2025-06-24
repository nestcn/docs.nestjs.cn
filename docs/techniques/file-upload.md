### 文件上传

为处理文件上传，Nest 提供了一个基于 Express 的 [multer](https://github.com/expressjs/multer) 中间件包的内置模块。Multer 处理以 `multipart/form-data` 格式发布的数据，该格式主要用于通过 HTTP `POST` 请求上传文件。该模块完全可配置，您可以根据应用程序需求调整其行为。

> warning **警告** Multer 无法处理不支持的多部分格式(`multipart/form-data`)数据。另请注意，该包与 `FastifyAdapter` 不兼容。

为了获得更好的类型安全性，让我们安装 Multer 类型定义包：

```shell
$ npm i -D @types/multer
```

安装此包后，我们现在可以使用 `Express.Multer.File` 类型（可通过如下方式导入该类型： `import {{ '{' }} Express {{ '}' }} from 'express'` ）。

#### 基础示例

要上传单个文件，只需将 `FileInterceptor()` 拦截器绑定到路由处理器，并使用 `@UploadedFile()` 装饰器从 `request` 中提取 `file`。

```typescript
@@filename()
@Post('upload')
@UseInterceptors(FileInterceptor('file'))
uploadFile(@UploadedFile() file: Express.Multer.File) {
  console.log(file);
}
@@switch
@Post('upload')
@UseInterceptors(FileInterceptor('file'))
@Bind(UploadedFile())
uploadFile(file) {
  console.log(file);
}
```

> **提示** `FileInterceptor()` 装饰器从 `@nestjs/platform-express` 包导出。`@UploadedFile()` 装饰器从 `@nestjs/common` 导出。

`FileInterceptor()` 装饰器接收两个参数：

- `fieldName`：字符串类型，提供 HTML 表单中包含文件的字段名称
- `options`：可选参数，类型为 `MulterOptions` 的对象。该对象与 multer 构造函数使用的对象相同（更多详情[参见此处](https://github.com/expressjs/multer#multeropts) ）。

> warning **警告**`FileInterceptor()` 可能与 Google Firebase 等第三方云服务提供商不兼容。

#### 文件验证

验证传入的文件元数据（如文件大小或文件 MIME 类型）通常很有用。为此，您可以创建自己的[管道](https://docs.nestjs.com/pipes)并将其绑定到用 `UploadedFile` 装饰器注解的参数上。以下示例演示了如何实现一个基本的文件大小验证器管道：

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

可以如下与 `FileInterceptor` 结合使用：

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

Nest 提供了一个内置管道来处理常见用例，并促进/标准化新管道的添加。该管道名为 `ParseFilePipe`，您可以按如下方式使用它：

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

如你所见，需要指定一个文件验证器数组，这些验证器将由 `ParseFilePipe` 执行。我们将讨论验证器的接口，但值得一提的是这个管道还有两个额外的**可选**选项：

<table data-immersive-translate-walked="d5e56f2b-229d-43d2-b71f-be922dab53fb"><tbody data-immersive-translate-walked="d5e56f2b-229d-43d2-b71f-be922dab53fb"><tr data-immersive-translate-walked="d5e56f2b-229d-43d2-b71f-be922dab53fb"><td data-immersive-translate-walked="d5e56f2b-229d-43d2-b71f-be922dab53fb">errorHttpStatusCode</td><td data-immersive-translate-walked="d5e56f2b-229d-43d2-b71f-be922dab53fb" data-immersive-translate-paragraph="1">当任意验证器失败时抛出的 HTTP 状态码。默认为 400（错误请求）</td></tr><tr data-immersive-translate-walked="d5e56f2b-229d-43d2-b71f-be922dab53fb"><td data-immersive-translate-walked="d5e56f2b-229d-43d2-b71f-be922dab53fb">exceptionFactory</td><td data-immersive-translate-walked="d5e56f2b-229d-43d2-b71f-be922dab53fb" data-immersive-translate-paragraph="1">一个接收错误信息并返回错误的工厂函数。</td></tr></tbody></table>

现在回到 `FileValidator` 接口。要将验证器与此管道集成，你必须使用内置实现或提供自定义的 `FileValidator`。示例如下：

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

> info **提示** `FileValidator` 接口通过其 `isValid` 函数支持异步验证。为了利用类型安全，如果您使用 express（默认）作为驱动，还可以将 `file` 参数类型指定为 `Express.Multer.File`。

`FileValidator` 是一个常规类，可以访问文件对象并根据客户端提供的选项对其进行验证。Nest 提供了两个内置的 `FileValidator` 实现供您在项目中使用：

- `MaxFileSizeValidator` - 检查给定文件的大小是否小于提供的值（以 `bytes` 为单位）
- `FileTypeValidator` - 检查给定文件的 mime-type 是否匹配给定的字符串或正则表达式。默认情况下，使用文件内容的 [魔数](https://www.ibm.com/support/pages/what-magic-number) 来验证 mime-type

要理解这些如何与前面提到的 `FileParsePipe` 结合使用，我们将使用最后一个示例的修改片段：

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

> info **提示** 如果验证器数量大幅增加或其选项使文件变得杂乱，可以将此数组定义在单独的文件中，并作为命名常量（如 `fileValidators`）导入此处。

最后，您可以使用特殊的 `ParseFilePipeBuilder` 类来组合和构建验证器。如下所示使用它，可以避免手动实例化每个验证器，直接传递它们的选项即可：

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

> info **提示** 默认情况下文件是必传的，但您可以通过在 `build` 函数选项中（与 `errorHttpStatusCode` 同级）添加 `fileIsRequired: false` 参数来使其变为可选。

#### 文件数组

要上传一个文件数组（使用单一字段名标识），请使用 `FilesInterceptor()` 装饰器（注意装饰器名称中的复数形式 **Files**）。该装饰器接受三个参数：

- `fieldName`：如上所述
- `maxCount`：可选参数，定义可接受的最大文件数量
- `options`：可选的 `MulterOptions` 对象，如上所述

使用 `FilesInterceptor()` 时，通过 `@UploadedFiles()` 装饰器从 `request` 中提取文件

```typescript
@@filename()
@Post('upload')
@UseInterceptors(FilesInterceptor('files'))
uploadFile(@UploadedFiles() files: Array<Express.Multer.File>) {
  console.log(files);
}
@@switch
@Post('upload')
@UseInterceptors(FilesInterceptor('files'))
@Bind(UploadedFiles())
uploadFile(files) {
  console.log(files);
}
```

> **提示** `FilesInterceptor()` 装饰器从 `@nestjs/platform-express` 包导出。`@UploadedFiles()` 装饰器从 `@nestjs/common` 导出

#### 多个文件

要上传多个文件（每个文件具有不同的字段名键），请使用 `FileFieldsInterceptor()` 装饰器。该装饰器接受两个参数：

- `uploadedFields`：对象数组，其中每个对象需包含一个必需的字符串类型 `name` 属性（用于指定字段名，如上所述）以及一个可选的 `maxCount` 属性（如上所述）
- `options`：可选的 `MulterOptions` 对象，如上所述

使用 `FileFieldsInterceptor()` 时，需通过 `@UploadedFiles()` 装饰器从 `request` 中提取文件

```typescript
@@filename()
@Post('upload')
@UseInterceptors(FileFieldsInterceptor([
  { name: 'avatar', maxCount: 1 },
  { name: 'background', maxCount: 1 },
]))
uploadFile(@UploadedFiles() files: { avatar?: Express.Multer.File[], background?: Express.Multer.File[] }) {
  console.log(files);
}
@@switch
@Post('upload')
@Bind(UploadedFiles())
@UseInterceptors(FileFieldsInterceptor([
  { name: 'avatar', maxCount: 1 },
  { name: 'background', maxCount: 1 },
]))
uploadFile(files) {
  console.log(files);
}
```

#### 任意文件

要上传所有具有任意字段名键的字段，请使用 `AnyFilesInterceptor()` 装饰器。该装饰器可以接受一个可选的 `options` 对象，如上所述。

使用 `AnyFilesInterceptor()` 时，通过 `@UploadedFiles()` 装饰器从 `request` 中提取文件。

```typescript
@@filename()
@Post('upload')
@UseInterceptors(AnyFilesInterceptor())
uploadFile(@UploadedFiles() files: Array<Express.Multer.File>) {
  console.log(files);
}
@@switch
@Post('upload')
@Bind(UploadedFiles())
@UseInterceptors(AnyFilesInterceptor())
uploadFile(files) {
  console.log(files);
}
```

#### 无文件

若要接收 `multipart/form-data` 但不允许上传任何文件，请使用 `NoFilesInterceptor`。这会将 multipart 数据设置为请求体上的属性。任何随请求发送的文件都将抛出 `BadRequestException`。

```typescript
@Post('upload')
@UseInterceptors(NoFilesInterceptor())
handleMultiPartData(@Body() body) {
  console.log(body)
}
```

#### 默认选项

如上述所述，您可以在文件拦截器中指定 multer 选项。要设置默认选项，可以在导入 `MulterModule` 时调用静态方法 `register()`，并传入支持的选项。您可以使用此处列出的所有选项 [here](https://github.com/expressjs/multer#multeropts)。

```typescript
MulterModule.register({
  dest: './upload',
});
```

> info **提示** `MulterModule` 类是从 `@nestjs/platform-express` 包中导出的。

#### 异步配置

当需要异步而非静态地设置 `MulterModule` 选项时，请使用 `registerAsync()` 方法。与大多数动态模块一样，Nest 提供了多种处理异步配置的技术。

其中一种技术是使用工厂函数：

```typescript
MulterModule.registerAsync({
  useFactory: () => ({
    dest: './upload',
  }),
});
```

与其他[工厂提供者](https://docs.nestjs.com/fundamentals/custom-providers#factory-providers-usefactory)类似，我们的工厂函数可以是 `async` 的，并能通过 `inject` 注入依赖项。

```typescript
MulterModule.registerAsync({
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => ({
    dest: configService.get<string>('MULTER_DEST'),
  }),
  inject: [ConfigService],
});
```

或者，您也可以使用类而非工厂来配置 `MulterModule`，如下所示：

```typescript
MulterModule.registerAsync({
  useClass: MulterConfigService,
});
```

上述结构在 `MulterModule` 内部实例化 `MulterConfigService`，用它来创建所需的选项对象。请注意，在此示例中，`MulterConfigService` 必须实现 `MulterOptionsFactory` 接口，如下所示。`MulterModule` 将在提供的类的实例化对象上调用 `createMulterOptions()` 方法。

```typescript
@Injectable()
class MulterConfigService implements MulterOptionsFactory {
  createMulterOptions(): MulterModuleOptions {
    return {
      dest: './upload',
    };
  }
}
```

若想复用现有的选项提供者而非在 `MulterModule` 内创建私有副本，请使用 `useExisting` 语法。

```typescript
MulterModule.registerAsync({
  imports: [ConfigModule],
  useExisting: ConfigService,
});
```

你也可以向 `registerAsync()` 方法传递所谓的 `extraProviders`，这些提供者将与模块提供者合并。

```typescript
MulterModule.registerAsync({
  imports: [ConfigModule],
  useClass: ConfigService,
  extraProviders: [MyAdditionalProvider],
});
```

当需要向工厂函数或类构造函数提供额外依赖项时，这一功能非常实用。

#### 示例

一个可用的示例[在此处](https://github.com/nestjs/nest/tree/master/sample/29-file-upload)查看。
