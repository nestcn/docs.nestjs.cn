<!-- 此文件从 content/websockets/adapter.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-21T16:25:15.077Z -->
<!-- 源文件: content/websockets/adapter.md -->

### WebSocket

WebSocket 模块是平台无关的，因此你可以使用自定义的库（或本地实现）来实现 __INLINE_CODE_8__ 接口。这个接口强制实现以下方法：

__HTML_TAG_29__
  __HTML_TAG_30__
    __HTML_TAG_31____HTML_TAG_32__create__HTML_TAG_33____HTML_TAG_34__
    __HTML_TAG_35__创建一个 socket 实例基于传递的参数__HTML_TAG_36__
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
__HTML_TAG_70__

#### Extend socket.io

__LINK_71__ 包含在 __INLINE_CODE_9__ 类中。假设你想增强基本适配器的功能，例如，你的技术需求需要在多个负载平衡实例中广播事件。为此，你可以扩展 __INLINE_CODE_10__ 并覆盖单个方法，该方法负责实例化新的 socket.io 服务器。但是，首先需要安装所需的包。

> 警告 **Warning** 使用 socket.io 在多个负载平衡实例中，您需要禁用轮询设置 __INLINE_CODE_11__ 在客户端 socket.io 配置中或在负载均衡器中启用 cookie 路由。Redis alone 不足。请查看 __LINK_72__ 获取更多信息。

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

然后，只需切换到您创建的 Redis 适配器。

```typescript
@Post()
@ApiResponse({ status: 201, description: 'The record has been successfully created.'})
@ApiResponse({ status: 403, description: 'Forbidden.'})
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}

```

#### Ws 库

另一个可用的适配器是 __INLINE_CODE_13__，它作为框架和 __LINK_73__ 库之间的代理。这个适配器完全兼容 native 浏览器 WebSocket，並且速度更快。但是，它具有较少的功能可用性。在某些情况下，你可能不需要它们。

> 提示 **Hint** __INLINE_CODE_14__ 库不支持命名空间（通信通道，受 __INLINE_CODE_15__ 支持）。但是，以某种方式模拟这种功能，你可以在不同的路径上mount多个 __INLINE_CODE_16__ 服务器（例如 __INLINE_CODE_17__）。

要使用 __INLINE_CODE_18__，我们首先需要安装所需的包：

```typescript
@Post()
@ApiCreatedResponse({ description: 'The record has been successfully created.'})
@ApiForbiddenResponse({ description: 'Forbidden.'})
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}

```

安装包后，我们可以切换适配器：

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

> 提示 **Hint** __INLINE_CODE_19__ 来自 __INLINE_CODE_20__。

`/users` 设计来处理 `/reports/summary` 格式的消息。如果你需要接收和处理不同格式的消息，你需要配置消息解析器将它们转换为所需的格式。

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

或者，你可以在适配器创建后使用 `GET` 方法配置消息解析器。

#### Advanced (custom adapter)

为了演示目的，我们将手动集成 __LINK_74__ 库。正如所提到的，该适配器已经创建，并且从 `POST` 包中暴露为 `DELETE` 类。以下是简化实现的可能看法：

```typescript
const config = new DocumentBuilder()
  .addGlobalResponse({
    status: 500,
    description: 'Internal server error',
  })
  // other configurations
  .build();

```

> 提示 **Hint** 如果你想使用 __LINK_75__ 库，请使用内置的 `@ApiTags(...tags)` 而不是创建自己的一个。

然后，我们可以使用 `@ApiHeader()` 方法设置自定义适配器：

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

使用 `@ApiResponse()` 的工作示例可在 __LINK_76__ 中找到。