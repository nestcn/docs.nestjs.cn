<!-- 此文件从 content/websockets/adapter.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:42:47.039Z -->
<!-- 源文件: content/websockets/adapter.md -->

### WebSocket 适配器

WebSocket 模块是平台无关的，因此，您可以使用 __INLINE_CODE_8__ 接口来使用自己的库（或 native 实现）。这个接口强制实现以下方法：

__HTML_TAG_29__  
  __HTML_TAG_30__  
    __HTML_TAG_31____HTML_TAG_32__create__HTML_TAG_33____HTML_TAG_34__
    __HTML_TAG_35__创建基于传递参数的 socket 实例__HTML_TAG_36__
  __HTML_TAG_37__  
  __HTML_TAG_38__  
    __HTML_TAG_39____HTML_TAG_40__bindClientConnect__HTML_TAG_41____HTML_TAG_42__
    __HTML_TAG_43__绑定客户端连接事件__HTML_TAG_44__
  __HTML_TAG_45__  
  __HTML_TAG_46__  
    __HTML_TAG_47____HTML_TAG_48__bindClientDisconnect__HTML_TAG_49____HTML_TAG_50__
    __HTML_TAG_51__绑定客户端断开事件（可选）__HTML_TAG_52__
  __HTML_TAG_53__  
  __HTML_TAG_54__  
    __HTML_TAG_55____HTML_TAG_56__bindMessageHandlers__HTML_TAG_57____HTML_TAG_58__
    __HTML_TAG_59__将 incoming 消息绑定到相应的消息处理程序__HTML_TAG_60__
  __HTML_TAG_61__  
  __HTML_TAG_62__  
    __HTML_TAG_63____HTML_TAG_64__close__HTML_TAG_65____HTML_TAG_66__
    __HTML_TAG_67__终止服务器实例__HTML_TAG_68__
  __HTML_TAG_69__

#### 扩展 socket.io

__LINK_71__ 包含在 __INLINE_CODE_9__ 类中。假设您想增强基本功能的适配器？例如，您的技术要求需要在多个负载均衡实例中广播事件。为此，您可以扩展 __INLINE_CODE_10__ 并覆盖一个方法，该方法负责实例化新 socket.io 服务器。但是，首先，需要安装所需的包。

> warning **警告** 使用 socket.io 在多个负载均衡实例中，您需要禁用轮询或启用 cookie 路由在负载均衡器中。Redis 单独不够。请参阅 __LINK_72__ 获取更多信息。

```typescript
@ApiTags('cats')
@Controller('cats')
export class CatsController {}

```

安装包后，我们可以创建 __INLINE_CODE_12__ 类。

```typescript
@ApiHeader({
  name: 'X-MyHeader',
  description: 'Custom header',
})
@Controller('cats')
export class CatsController {}

```

然后，简单地切换到新的 Redis 适配器。

```typescript
@Post()
@ApiResponse({ status: 201, description: 'The record has been successfully created.'})
@ApiResponse({ status: 403, description: 'Forbidden.'})
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}

```

#### Ws 库

另一个可用的适配器是 __INLINE_CODE_13__，它将像代理一样在框架和 __LINK_73__ 库之间。这个适配器是与 native 浏览器 WebSocket 完全兼容的，并且速度更快。遗憾的是，它有较少的可用功能。然而，在某些情况下，这些功能可能并不是必需的。

> info **提示** __INLINE_CODE_14__ 库不支持命名空间（通讯通道）。然而，您可以在不同的路径上挂载多个 __INLINE_CODE_16__ 服务器，以模拟这种功能（例如 __INLINE_CODE_17__）。

要使用 __INLINE_CODE_18__，需要首先安装所需的包：

```typescript
@Post()
@ApiCreatedResponse({ description: 'The record has been successfully created.'})
@ApiForbiddenResponse({ description: 'Forbidden.'})
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}

```

安装包后，我们可以切换适配器。

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

> info **提示** __INLINE_CODE_19__ 是来自 __INLINE_CODE_20__ 的。

`/users` 是为了处理 `/reports/summary` 格式的消息。如果您需要接收和处理不同格式的消息，需要配置消息解析器将它们转换为所需的格式。

```typescript
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

alternatively，您可以在适配器创建后使用 `GET` 方法来配置消息解析器。

#### 高级（自定义适配器）

为了演示目的，我们将手动集成 __LINK_74__ 库。正如所述，这个适配器已经被创建，并且从 `POST` 包中 exposes 作为 `DELETE` 类。下面是一个简化的实现可能看起来的样子：

```typescript
const config = new DocumentBuilder()
  .addGlobalResponse({
    status: 500,
    description: 'Internal server error',
  })
  // other configurations
  .build();

```

> info **提示** 如果想使用 __LINK_75__ 库，可以使用内置的 `@ApiTags(...tags)`。

然后，我们可以使用 `@ApiHeader()` 方法来设置自定义适配器。

```typescript
@UseInterceptors(FileInterceptor('file'))
@ApiConsumes('multipart/form-data')
@ApiBody({
  description: 'List of cats',
  type: FileUploadDto,
})
uploadFile(@UploadedFile() file: Express.Multer.File) {}

```

#### 示例

使用 `@ApiResponse()` 的工作示例可以在 __LINK_76__ 找到。