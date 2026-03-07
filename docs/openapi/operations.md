### 操作

在 OpenAPI 规范中，路径是 API 暴露的端点（资源），例如 `/users` 或 `/products`，操作是用来操作这些路径的 HTTP 方法，例如 `GET`、`POST` 或 `PUT`。

#### 标签

要将控制器附加到特定标签上，使用 `@ApiTags()` 装饰器。

```typescript
@ApiTags('users')
@Controller('users')
export class UsersController {
  // 控制器方法
}

```

#### 头

要定义自定义的请求头，使用 `@ApiHeader()` 装饰器。

```typescript
@ApiHeader({
  name: 'X-API-Key',
  description: 'API key for authentication',
  required: true,
})
@Get()
getUsers() {
  // 方法逻辑
}

```

#### 响应

要定义自定义的 HTTP 响应，使用 `@ApiResponse()` 装饰器。

```typescript
@ApiResponse({
  status: 200,
  description: '成功获取用户列表',
  type: [User],
})
@Get()
getUsers() {
  // 方法逻辑
}

```

Nest 提供了一组简洁的 **API 响应** 装饰器，它们继承自 `@ApiResponse` 装饰器：

- `@ApiOkResponse()` - 200 响应
- `@ApiCreatedResponse()` - 201 响应
- `@ApiAcceptedResponse()` - 202 响应
- `@ApiNoContentResponse()` - 204 响应
- `@ApiPartialContentResponse()` - 206 响应
- `@ApiBadRequestResponse()` - 400 响应
- `@ApiUnauthorizedResponse()` - 401 响应
- `@ApiForbiddenResponse()` - 403 响应
- `@ApiNotFoundResponse()` - 404 响应
- `@ApiMethodNotAllowedResponse()` - 405 响应
- `@ApiConflictResponse()` - 409 响应
- `@ApiPayloadTooLargeResponse()` - 413 响应
- `@ApiUnsupportedMediaTypeResponse()` - 415 响应
- `@ApiUnprocessableEntityResponse()` - 422 响应
- `@ApiInternalServerErrorResponse()` - 500 响应

```typescript
@ApiOkResponse({
  description: '成功获取用户列表',
  type: [User],
})
@ApiNotFoundResponse({
  description: '用户不存在',
})
@Get(':id')
getUser(@Param('id') id: string) {
  // 方法逻辑
}

```

要指定请求的返回模型，我们必须创建一个类并将所有属性注释为 `@ApiProperty()` 装饰器。

```typescript
class User {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;
}

```

然后，`User` 模型可以与 `type` 属性组合使用，以便在响应装饰器中使用。

```typescript
@ApiOkResponse({
  description: '成功获取用户',
  type: User,
})
@Get(':id')
getUser(@Param('id') id: string) {
  // 方法逻辑
}

```

现在，让我们在浏览器中验证生成的 `User` 模型：

![](/assets/swagger-model.png)

相反，我们可以为所有端点或控制器定义一个全局响应，使用 `@ApiResponse` 类。这种方法很有用，因为我们可以为应用程序中的所有端点定义一个全局响应（例如，用于错误如 400 或 500）。

```typescript
@ApiResponse({
  status: 500,
  description: '内部服务器错误',
})
@Controller('users')
export class UsersController {
  // 控制器方法
}

```

#### 文件上传

可以使用 `@ApiConsumes()` 装饰器与 `@ApiBody()` 一起启用文件上传。以下是一个使用 `multer` 技术的完整示例：

```typescript
@ApiConsumes('multipart/form-data')
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      file: {
        type: 'string',
        format: 'binary',
      },
    },
  },
})
@Post('upload')
uploadFile(@UploadedFile() file: Express.Multer.File) {
  // 处理上传的文件
}

```

其中 `Express.Multer.File` 定义如下：

```typescript
interface File {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
}

```

要处理多个文件上传，可以定义 `files` 字段：

```typescript
@ApiConsumes('multipart/form-data')
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      files: {
        type: 'array',
        items: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  },
})
@Post('upload-multiple')
uploadMultipleFiles(@UploadedFiles() files: Array<Express.Multer.File>) {
  // 处理上传的多个文件
}

```

#### 扩展

要添加扩展到请求中，使用 `@ApiExtension()` 装饰器。扩展名必须以 `x-` 开头。

```typescript
@ApiExtension('x-custom-extension', {
  value: 'custom-value',
  description: '自定义扩展描述',
})
@Get()
getUsers() {
  // 方法逻辑
}

```

#### 高级：泛型 `ApiResponse`

使用 `ApiResponse`，我们可以为 Swagger UI 定义泛型 schema。假设我们有以下 DTO：

```typescript
class Pagination {
  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  total: number;
}

```

我们跳过装饰 `Pagination`，因为我们将为其提供 raw 定义。现在，让我们定义另一个 DTO，并将其命名为 `PaginatedResponse`，如下所示：

```typescript
class PaginatedResponse<T> {
  @ApiProperty()
  data: T;

  @ApiProperty()
  pagination: Pagination;
}

```

现在，我们可以定义 `ApiResponse` 响应，如下所示：

```typescript
@ApiOkResponse({
  description: '成功获取分页用户列表',
  schema: {
    allOf: [
      {
        $ref: getSchemaPath(PaginatedResponse),
      },
      {
        properties: {
          data: {
            type: 'array',
            items: {
              $ref: getSchemaPath(User),
            },
          },
        },
      },
    ],
  },
})
@Get()
getUsers(@Query('page') page: number, @Query('limit') limit: number) {
  // 方法逻辑
}

```

在这个示例中，我们指定响应将有 allOf `PaginatedResponse`，并且 `data` 属性将是类型 `User` 数组。

- `getSchemaPath()` 函数返回 OpenAPI Schema 路径从 OpenAPI Spec 文件中获取的模型。
- 这种方法允许我们创建灵活的泛型响应结构，适用于各种数据类型。