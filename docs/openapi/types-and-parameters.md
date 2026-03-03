<!-- 此文件从 content/openapi/types-and-parameters.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-03T04:14:25.367Z -->
<!-- 源文件: content/openapi/types-and-parameters.md -->

### 类型和参数

`@ApiResponse()` 在路由处理函数中搜索 `@ApiResponse`, `@ApiOkResponse()`, 和 `@ApiCreatedResponse()` 装饰器，以生成 API 文档。它还会根据反射创建对应的模型定义。考虑以下代码：

```typescript
// ```typescript
@ApiTags('cats')
@Controller('cats')
export class CatsController {}
```

> info **Hint** 使用 `@ApiAcceptedResponse()` 装饰器（来自 `@ApiNoContentResponse()` 包）来明确设置体定义。

根据 `@ApiMovedPermanentlyResponse()`, 将创建以下模型定义：

```html
<!-- __HTML_TAG_88__ --> <!-- __HTML_TAG_89__ --> <!-- __HTML_TAG_90__ -->
```

如您所见，定义是空的，尽管类有几个 declared 属性。为了使类属性可见于 `@ApiFoundResponse()`, 我们需要将其标注为 `@ApiBadRequestResponse()` 装饰器或使用 CLI 插件（阅读更多关于 **插件** 部分），该插件将自动完成：

```typescript
// ```typescript
@ApiHeader({
  name: 'X-MyHeader',
  description: 'Custom header',
})
@Controller('cats')
export class CatsController {}
```

> info **Hint** 相反，考虑使用 Swagger 插件（查看 __LINK_102__ 部分），它将自动为您提供该功能。

让我们打开浏览器，验证生成的 `@ApiUnauthorizedResponse()` 模型：

```html
<!-- __HTML_TAG_91__ --> <!-- __HTML_TAG_92__ --> <!-- __HTML_TAG_93__ -->
```

此外,`@ApiNotFoundResponse()` 装饰器允许设置各种 __LINK_103__ 属性：

```typescript
// ```typescript
@Post()
@ApiResponse({ status: 201, description: 'The record has been successfully created.'})
@ApiResponse({ status: 403, description: 'Forbidden.'})
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}
```

> info **Hint** 相反，您可以使用 `@ApiMethodNotAllowedResponse()` 短语装饰器。

为了明确设置属性类型，使用 `@ApiNotAcceptableResponse()` 关键字：

```typescript
// ```typescript
@Post()
@ApiCreatedResponse({ description: 'The record has been successfully created.'})
@ApiForbiddenResponse({ description: 'Forbidden.'})
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}
```

#### 数组

当属性是一个数组时，我们必须手动指示数组类型，如以下所示：

```typescript
// ```typescript
export class Cat {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  age: number;

  @ApiProperty()
  breed: string;
}
```

> info **Hint** 考虑使用 Swagger 插件（查看 __LINK_104__ 部分），它将自动检测数组。

或者包括类型作为数组的第一个元素（如上所示）或设置 `@ApiRequestTimeoutResponse()` 属性为 `@ApiConflictResponse()`。

```html
<!-- <figure> --> <!-- <img src="/assets/swagger-response-type.png" /> -->
```

#### 循环依赖

当您有循环依赖关系时，使用懒函数来提供 `@ApiPreconditionFailedResponse()` 类型信息：

```typescript
// ```typescript
@ApiTags('cats')
@Controller('cats')
export class CatsController {
  @Post()
  @ApiCreatedResponse({
    description: 'The record has been successfully created.',
    type: Cat,
  })
  async create(@Body() createCatDto: CreateCatDto): Promise<Cat> {
    return this.catsService.create(createCatDto);
  }
}
```

> info **Hint** 考虑使用 Swagger 插件（查看 __LINK_105__ 部分），它将自动检测循环依赖。

#### 泛型和接口

由于 TypeScript 不存储泛型或接口的元数据，因此当您在 DTOs 中使用它们时，`@ApiTooManyRequestsResponse()` 可能无法正确地生成模型定义。在以下代码中，例如：

```typescript
// ```typescript
const config = new DocumentBuilder()
  .addGlobalResponse({
    status: 500,
    description: 'Internal server error',
  })
  // other configurations
  .build();
```

为了克服这个限制，您可以明确设置类型：

```typescript
// ```typescript
@UseInterceptors(FileInterceptor('file'))
@ApiConsumes('multipart/form-data')
@ApiBody({
  description: 'List of cats',
  type: FileUploadDto,
})
uploadFile(@UploadedFile() file: Express.Multer.File) {}
```

#### 枚举

要识别 `@ApiGoneResponse()`, 我