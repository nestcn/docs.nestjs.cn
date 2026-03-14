<!-- 此文件从 content/websockets/adapter.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T04:39:44.289Z -->
<!-- 源文件: content/websockets/adapter.md -->

### WebSocket  adaptors

WebSocket 模块是平台无关的，因此你可以使用 __INLINE_CODE_8__ 接口来将自己的库（或 native 实现）集成到其中。这 interface 强制实现以下表格中描述的几个方法：

__HTML_TAG_29__
  __HTML_TAG_30__
    __HTML_TAG_31____HTML_TAG_32__create__HTML_TAG_33____HTML_TAG_34__
    __HTML_TAG_35__创建 socket 实例基于传递的参数__HTML_TAG_36__
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
    __HTML_TAG_59__将 incoming 消息绑定到相应的消息处理器__HTML_TAG_60__
  __HTML_TAG_61__
  __HTML_TAG_62__
    __HTML_TAG_63____HTML_TAG_64__close__HTML_TAG_65____HTML_TAG_66__
    __HTML_TAG_67__终止服务器实例__HTML_TAG_68__
  __HTML_TAG_69__
__HTML_TAG_70__

#### 扩展 socket.io

__LINK_71__ 包被封装在 __INLINE_CODE_9__ 类中。如果你想增强基本功能，可以继承 __INLINE_CODE_10__ 并重写单个方法，该方法负责实例化新的 socket.io 服务器。但是首先，让我们安装所需的包。

> 警告 **Warning** 使用 socket.io 在多个负载均衡实例中需要禁用轮询或启用 cookie 基于路由在负载均衡器中。Redis alone 不足见 __LINK_72__ 了解更多信息。

```typescript
@Post()
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}

```

安装包后，我们可以创建 __INLINE_CODE_12__ 类。

```typescript
import { ApiProperty } from '@nestjs/swagger';

export class CreateCatDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  age: number;

  @ApiProperty()
  breed: string;
}

```

然后， simplement 切换到你的新创建的 Redis 适配器。

```typescript
@ApiProperty({
  description: 'The age of a cat',
  minimum: 1,
  default: 1,
})
age: number;

```

#### Ws 库

另一个可用的适配器是 __INLINE_CODE_13__，它充当框架和 __LINK_73__ 库之间的代理。这个适配器完全兼容 native 浏览器 WebSocket，并且速度更快于 socket.io 包。然而，它具有较少的功能。某些情况下，你可能不需要它们。

> 提示 **Hint** __INLINE_CODE_14__ 库不支持命名空间（通讯通道），但是你可以在不同的路径上 mount 多个 __INLINE_CODE_16__ 服务器以模拟这个功能（例如 __INLINE_CODE_17__）。

要使用 __INLINE_CODE_18__，首先需要安装所需的包：

```typescript
@ApiProperty({
  type: Number,
})
age: number;

```

安装包后，我们可以切换适配器：

```typescript
@ApiProperty({ type: [String] })
names: string[];

```

> 提示 **Hint** __INLINE_CODE_19__ 是从 __INLINE_CODE_20__ 导入的。

__INLINE_CODE_21__ 设计来处理 __INLINE_CODE_22__ 格式的消息。如果你需要接收和处理不同格式的消息，需要配置消息解析器将它们转换为 required 格式。

```typescript
@ApiProperty({ type: () => Node })
node: Node;

```

或者，你可以在适配器创建后使用 __INLINE_CODE_23__ 方法来配置消息解析器。

#### 高级（自定义适配器）

为了演示目的，我们将手动集成 __LINK_74__ 库。正如所提到的，适配器已经创建了，并且从 __INLINE_CODE_24__ 包中公开为 __INLINE_CODE_25__ 类。下面是一个简化的实现可能看起来的样子：

```typescript
createBulk(@Body() usersDto: CreateUserDto[])

```

> 提示 **Hint** 如果你想使用 __LINK_75__ 库，使用内置的 __INLINE_CODE_26__ 而不是创建自己的一个。

然后，我们可以使用 __INLINE_CODE_27__ 方法设置自定义适配器：

```typescript
@ApiBody({ type: [CreateUserDto] })
createBulk(@Body() usersDto: CreateUserDto[])

```

#### 示例

使用 `SwaggerModule` 的工作示例可在 __LINK_76__ 中找到。