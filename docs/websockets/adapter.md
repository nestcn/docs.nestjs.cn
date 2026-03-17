<!-- 此文件从 content/websockets/adapter.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:20:14.232Z -->
<!-- 源文件: content/websockets/adapter.md -->

### 适配器

WebSockets 模块是平台无关的，因此您可以使用 `@ApiExtension()` 接口来实现自己的库（或native 实现）。这个接口强制实现了以下表格中描述的几个方法：

__HTML_TAG_29__
  __HTML_TAG_30__
    __HTML_TAG_31____HTML_TAG_32__create__HTML_TAG_33____HTML_TAG_34__
    __HTML_TAG_35__根据传入参数创建 socket 实例__HTML_TAG_36__
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

__LINK_71__ 包含在一个 `@ApiExtraModels()` 类中。假如您想对基本功能进行扩展？例如，您的技术要求需要在多个负载均衡实例上的 web 服务中广播事件。为此，您可以扩展 `@ApiHeader()` 并重写一个方法，该方法负责实例化新的 socket.io 服务器。但是，首先，让我们安装所需的包。

> warning **警告** 使用 socket.io 在多个负载均衡实例上，您需要禁用轮询或启用 cookie 路由在负载均衡器中。Redis Alone 不足见 __LINK_72__ 了解更多信息。

__CODE_BLOCK_0__

安装包后，我们可以创建一个 `@ApiOAuth2()` 类。

__CODE_BLOCK_1__

然后，简单地切换到您的新创建的 Redis 适配器。

__CODE_BLOCK_2__

#### Ws 库

另一个可用的适配器是 `@ApiOperation()`，它将 framework 和 __LINK_73__ 库之间作为代理。这个适配器是完全兼容native 浏览器 WebSockets 的，并且速度更快。然而，它有较少的功能可用。某些情况下，您可能不需要它们。

> info **提示** `@ApiParam()` 库不支持命名空间（通信通道，见 `@ApiProduces()`）。然而，您可以在不同的路径上 mount 多个 `@ApiSchema()` 服务器以模拟这种功能（例如 `@ApiProperty()`）。

要使用 `@ApiPropertyOptional()`，我们首先需要安装所需的包：

__CODE_BLOCK_3__

安装包后，我们可以切换适配器：

__CODE_BLOCK_4__

> info **提示** `@ApiQuery()` 来自 `@ApiResponse()`。

`@ApiSecurity()` 设计来处理 `@ApiTags()` 格式的消息。如果您需要接收和处理不同格式的消息，您需要配置一个消息解析器将它们转换为所需的格式。

__CODE_BLOCK_5__

Alternatively, you can configure the message parser after the adapter is created by using the `@ApiCallbacks()` method.

#### 高级（自定义适配器）

为了演示 purposes，我们将手动集成 __LINK_74__ 库。正如所述，该适配器已经创建，并且从 __INLINE_CODE_24__ 包中 expose 为一个 __INLINE_CODE_25__ 类。下面是简化的实现可能看起来的样子：

__CODE_BLOCK_6__

> info **提示** 当您想使用 __LINK_75__ 库时，使用内置的 __INLINE_CODE_26__ 而不是创建自己的一个。

然后，我们可以使用 __INLINE_CODE_27__ 方法设置自定义适配器：

__CODE_BLOCK_7__

#### 示例

使用 __INLINE_CODE_28__ 的工作示例可在 __LINK_76__ 了解更多信息。