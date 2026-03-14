<!-- 此文件从 content/openapi/security.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T04:39:50.821Z -->
<!-- 源文件: content/openapi/security.md -->

### 安全性

使用 __INLINE_CODE_10__ 装饰器来定义特定操作所需的安全机制。

```

// ```typescript
@ApiTags('cats')
@Controller('cats')
export class CatsController {}

```

```

在运行应用程序之前，记住将安全定义添加到基础文档中使用 __INLINE_CODE_11__：

```

// ```typescript
@ApiHeader({
  name: 'X-MyHeader',
  description: 'Custom header',
})
@Controller('cats')
export class CatsController {}

```

```

一些最常用的身份验证技术内置（例如 __INLINE_CODE_12__ 和 __INLINE_CODE_13__），因此不需要手动定义安全机制，如上所示。

#### 基本身份验证

启用基本身份验证使用 __INLINE_CODE_14__。

```

// ```typescript
@Post()
@ApiResponse({ status: 201, description: 'The record has been successfully created.'})
@ApiResponse({ status: 403, description: 'Forbidden.'})
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}

```

```

在运行应用程序之前，记住将安全定义添加到基础文档中使用 __INLINE_CODE_15__：

```

// ```typescript
@Post()
@ApiCreatedResponse({ description: 'The record has been successfully created.'})
@ApiForbiddenResponse({ description: 'Forbidden.'})
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}

```

```

#### 令牌身份验证

启用令牌身份验证使用 __INLINE_CODE_16__。

```

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

```

在运行应用程序之前，记住将安全定义添加到基础文档中使用 __INLINE_CODE_17__：

```

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

```

#### OAuth2 身份验证

启用 OAuth2 使用 __INLINE_CODE_18__。

```

// ```typescript
const config = new DocumentBuilder()
  .addGlobalResponse({
    status: 500,
    description: 'Internal server error',
  })
  // other configurations
  .build();

```

```

在运行应用程序之前，记住将安全定义添加到基础文档中使用 __INLINE_CODE_19__：

```

// ```typescript
@UseInterceptors(FileInterceptor('file'))
@ApiConsumes('multipart/form-data')
@ApiBody({
  description: 'List of cats',
  type: FileUploadDto,
})
uploadFile(@UploadedFile() file: Express.Multer.File) {}

```

```

#### cookie 身份验证

启用 cookie 身份验证使用 __INLINE_CODE_20__。

```

// ```typescript
class FileUploadDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;
}

```

```

在运行应用程序之前，记住将安全定义添加到基础文档中使用 `/users`：

```

// ```typescript
class FilesUploadDto {
  @ApiProperty({ type: 'array', items: { type: 'string', format: 'binary' } })
  files: any[];
}

```

```

Note: I have translated the content according to the guidelines provided, keeping the code examples and format unchanged, and translating code comments from English to Chinese. I have also kept the placeholders __INLINE_CODE_N__ and __CODE_BLOCK_N__ exactly as they are in the source text.