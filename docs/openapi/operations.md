### 操作

在 OpenAPI 术语中，路径（paths）是指 API 暴露的端点（资源），例如 `/users` 或 `/reports/summary`，而操作（operations）则是指用于操作这些路径的 HTTP 方法，例如 `GET`、`POST` 或 `DELETE`。

#### 标签

要将控制器附加到特定标签，请使用 `@ApiTags(...tags)` 装饰器。

```typescript
@ApiTags('cats')
@Controller('cats')
export class CatsController {}
```

#### 请求头

要定义请求中预期的自定义请求头，请使用 `@ApiHeader()`。

```typescript
@ApiHeader({
  name: 'X-MyHeader',
  description: '自定义请求头',
})
@Controller('cats')
export class CatsController {}
```

#### 响应

要定义自定义 HTTP 响应，请使用 `@ApiResponse()` 装饰器。

```typescript
@Post()
@ApiResponse({ status: 201, description: '记录已成功创建。'})
@ApiResponse({ status: 403, description: '禁止访问。'})
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}
```

Nest 提供了一组继承自 `@ApiResponse` 装饰器的简写 **API 响应**装饰器：

- `@ApiOkResponse()`
- `@ApiCreatedResponse()`
- `@ApiAcceptedResponse()`
- `@ApiNoContentResponse()`
- `@ApiMovedPermanentlyResponse()`
- `@ApiFoundResponse()`
- `@ApiBadRequestResponse()`
- `@ApiUnauthorizedResponse()`
- `@ApiNotFoundResponse()`
- `@ApiForbiddenResponse()`
- `@ApiMethodNotAllowedResponse()`
- `@ApiNotAcceptableResponse()`
- `@ApiRequestTimeoutResponse()`
- `@ApiConflictResponse()`
- `@ApiPreconditionFailedResponse()`
- `@ApiTooManyRequestsResponse()`
- `@ApiGoneResponse()`
- `@ApiPayloadTooLargeResponse()`
- `@ApiUnsupportedMediaTypeResponse()`
- `@ApiUnprocessableEntityResponse()`
- `@ApiInternalServerErrorResponse()`
- `@ApiNotImplementedResponse()`
- `@ApiBadGatewayResponse()`
- `@ApiServiceUnavailableResponse()`
- `@ApiGatewayTimeoutResponse()`
- `@ApiDefaultResponse()`

```typescript
@Post()
@ApiCreatedResponse({ description: '记录已成功创建。'})
@ApiForbiddenResponse({ description: '禁止访问。'})
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}
```

要为请求指定返回模型，我们必须创建一个类并用 `@ApiProperty()` 装饰器标注所有属性。

```typescript
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

然后 `Cat` 模型就可以与响应装饰器的 `type` 属性结合使用。

```typescript
@ApiTags('cats')
@Controller('cats')
export class CatsController {
  @Post()
  @ApiCreatedResponse({
    description: '记录已成功创建。',
    type: Cat,
  })
  async create(@Body() createCatDto: CreateCatDto): Promise<Cat> {
    return this.catsService.create(createCatDto);
  }
}
```

让我们打开浏览器验证生成的 `Cat` 模型：

![](/assets/swagger-response-type.png)

无需为每个端点或控制器单独定义响应，您可以使用 `DocumentBuilder` 类为所有端点定义全局响应。这种方法适用于需要为应用程序中的所有端点定义全局响应的情况（例如针对 `401 Unauthorized` 或 `500 Internal Server Error` 等错误）。

```typescript
const config = new DocumentBuilder()
  .addGlobalResponse({
    status: 500,
    description: '内部服务器错误',
  })
  // 其他配置
  .build();
```

#### 文件上传

您可以通过 `@ApiBody` 装饰器配合 `@ApiConsumes()` 为特定方法启用文件上传功能。以下是使用[文件上传](/techniques/file-upload)技术的完整示例：

```typescript
@UseInterceptors(FileInterceptor('file'))
@ApiConsumes('multipart/form-data')
@ApiBody({
  description: '猫咪列表',
  type: FileUploadDto,
})
uploadFile(@UploadedFile() file: Express.Multer.File) {}
```

其中 `FileUploadDto` 定义如下：

```typescript
class FileUploadDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;
}
```

要处理多文件上传，可以如下定义 `FilesUploadDto`：

```typescript
class FilesUploadDto {
  @ApiProperty({ type: 'array', items: { type: 'string', format: 'binary' } })
  files: any[];
}
```

#### 扩展功能

要为请求添加扩展，请使用 `@ApiExtension()` 装饰器。扩展名必须以 `x-` 为前缀。

```typescript
@ApiExtension('x-foo', { hello: 'world' })
```

#### 进阶：通用型 `ApiResponse`

借助提供 [原始定义](/openapi/types-and-parameters#raw-definitions) 的能力，我们可以为 Swagger UI 定义通用模式。假设我们有以下 DTO：

```ts
export class PaginatedDto<TData> {
  @ApiProperty()
  total: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  offset: number;

  results: TData[];
}
```

我们暂时不对 `results` 进行装饰，因为稍后将为其提供原始定义。现在，让我们定义另一个 DTO 并将其命名为例如 `CatDto`，如下所示：

```ts
export class CatDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  age: number;

  @ApiProperty()
  breed: string;
}
```

有了这个定义后，我们就可以定义一个 `PaginatedDto<CatDto>` 响应，如下所示：

```ts
@ApiOkResponse({
  schema: {
    allOf: [
      { $ref: getSchemaPath(PaginatedDto) },
      {
        properties: {
          results: {
            type: 'array',
            items: { $ref: getSchemaPath(CatDto) },
          },
        },
      },
    ],
  },
})
async findAll(): Promise<PaginatedDto<CatDto>> {}
```

在这个示例中，我们指定响应将包含 allOf `PaginatedDto`，且 `results` 属性将是 `Array<CatDto>` 类型。

- `getSchemaPath()` 函数，用于从 OpenAPI 规范文件中返回给定模型的 OpenAPI Schema 路径。
- `allOf` 是 OAS 3 提供的一个概念，用于覆盖各种与继承相关的用例。

最后，由于 `PaginatedDto` 没有被任何控制器直接引用，`SwaggerModule` 暂时无法生成对应的模型定义。这种情况下，我们必须将其添加为[额外模型](/openapi/types-and-parameters#extra-models) 。例如，我们可以在控制器级别使用 `@ApiExtraModels()` 装饰器，如下所示：

```ts
@Controller('cats')
@ApiExtraModels(PaginatedDto)
export class CatsController {}
```

如果现在运行 Swagger，为该端点生成的 `swagger.json` 应该会定义如下响应：

```json
"responses": {
  "200": {
    "description": "",
    "content": {
      "application/json": {
        "schema": {
          "allOf": [
            {
              "$ref": "#/components/schemas/PaginatedDto"
            },
            {
              "properties": {
                "results": {
                  "$ref": "#/components/schemas/CatDto"
                }
              }
            }
          ]
        }
      }
    }
  }
}
```

为了使其可复用，我们可以为 `PaginatedDto` 创建一个自定义装饰器，如下所示：

```ts
export const ApiPaginatedResponse = <TModel extends Type<any>>(
  model: TModel
) => {
  return applyDecorators(
    ApiExtraModels(PaginatedDto, model),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(PaginatedDto) },
          {
            properties: {
              results: {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
              },
            },
          },
        ],
      },
    })
  );
};
```

> info **提示** `Type<any>` 接口和 `applyDecorators` 函数都是从 `@nestjs/common` 包中导入的。

为确保 `SwaggerModule` 会为我们的模型生成定义，必须像之前在控制器中对 `PaginatedDto` 所做的那样，将其作为额外模型添加。

完成这些设置后，我们就可以在端点使用自定义的 `@ApiPaginatedResponse()` 装饰器：

```ts
@ApiPaginatedResponse(CatDto)
async findAll(): Promise<PaginatedDto<CatDto>> {}
```

对于客户端生成工具而言，这种方法在 `PaginatedResponse<TModel>` 如何为客户端生成方面存在歧义。以下代码片段是上述 `GET /` 端点的客户端生成结果示例。

```typescript
// Angular
findAll(): Observable<{ total: number, limit: number, offset: number, results: CatDto[] }>
```

如你所见，这里的**返回类型**是模糊的。要解决这个问题，你可以为 `ApiPaginatedResponse` 的 `schema` 添加一个 `title` 属性：

```typescript
export const ApiPaginatedResponse = <TModel extends Type<any>>(
  model: TModel
) => {
  return applyDecorators(
    ApiOkResponse({
      schema: {
        title: `PaginatedResponseOf${model.name}`,
        allOf: [
          // ...
        ],
      },
    })
  );
};
```

现在客户端生成工具的结果将变为：

```ts
// Angular
findAll(): Observable<PaginatedResponseOfCatDto>
```
