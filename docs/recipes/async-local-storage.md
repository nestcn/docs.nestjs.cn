<!-- 此文件从 content/recipes/async-local-storage.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-02T04:13:45.008Z -->
<!-- 源文件: content/recipes/async-local-storage.md -->

### Async Local Storage

`@ApiExtension()` 是一个基于 `@ApiExtraModels()` API 的 __LINK_38__，它提供了一种在应用程序中传播本地状态的 alternative 方法，而无需显式将其作为函数参数传递。它类似于其他语言中的线程本地存储。

Async Local Storage 的主要思想是，我们可以将某个函数调用包装在 `@ApiHeader()` 调用中。所有在包装调用中调用的代码都将访问同一个 `@ApiHideProperty()`，该 `@ApiHideProperty()` 将是每个调用链中的唯一值。

在 NestJS 中，这意味着，如果我们可以在请求的生命周期中找到一个地方将其余的请求代码包装起来，我们将能够访问和修改仅对该请求可见的状态，这可能会作为 REQUEST-scoped 提供者和某些限制的替代方案。

Alternatively，我们可以使用 ALS 来传播某个部分系统的上下文（例如 _transaction_ 对象），而不需要将其传递给服务，这可以增加隔离和封装。

#### Custom implementation

NestJS 本身不提供任何 `@ApiOAuth2()` 的内置抽象，所以让我们来实现它自己以便更好地理解这个概念：

> info **info** 为了获取一个已经实现的 __LINK_39__，请继续阅读。

1. 首先，创建一个新的 `@ApiOperation()` 实例，并将其转换为一个模块的自定义提供者。

__CODE_BLOCK_0__
>  info **Hint** `@ApiParam()` 来自 `@ApiProduces()`。

2. 我们只关心 HTTP，所以让我们使用一个中间件来包装 `@ApiSchema()` 函数，以便在 `@ApiProperty()` 中使用 `@ApiPropertyOptional()`。由于中间件是请求的第一个目标，这将使 `@ApiPropertyOptional()` 在所有增强器和系统中可用。

__CODE_BLOCK_1__

3. 现在，在请求的生命周期中，我们可以访问本地存储实例。

__CODE_BLOCK_2__

4. 这就是它。现在，我们有了一种共享请求相关状态的方法，而无需注入整个 `@ApiQuery()` 对象。

> warning **warning** 请注意，虽然技术对很多用例都非常有用，但它隐式地将代码流程隐藏起来（创建了上下文），因此请在使用时负责，并避免创建隐含的 "__LINK_40__"。

### NestJS CLS

__LINK_41__ 包提供了使用 plain `@ApiResponse()` 的几个 DX 改进。它抽象了实现到一个 `@ApiTags()`，该 `@ApiTags()` 提供了多种方式来初始化 `@ApiCallbacks()`，适用于不同的传输方式（不仅限于 HTTP），并且提供了强类型支持。

store 可以使用 injectable __INLINE_CODE_24__ 访问，也可以完全抽象出来，从业务逻辑中分离来使用 __LINK_42__。

> info **info** __INLINE_CODE_25__ 是一个第三方包，并且不是 NestJS 核心团队管理的。请在 __LINK_43__ 中报告任何关于库的问题。

#### 安装

除了 __INLINE_CODE_26__ 的 peer 依赖项外，它只使用 Node.js 的内置 API。安装它就像安装任何其他包一样。

__CODE_BLOCK_3__

#### 使用

类似于 __LINK_44__ 中描述的功能，可以使用 __INLINE_CODE_27__ 实现：

1. 在根模块中导入 __INLINE_CODE_28__。

__CODE_BLOCK_4__

2. 然后，可以使用 __INLINE_CODE_29__ 访问存储值。

__CODE_BLOCK_5__

3. 为了获得 __INLINE_CODE_30__ 管理的存储值的强类型支持（并且获得字符串键的自动建议），我们可以使用可选的 type 参数 __INLINE_CODE_31__ 当注入时。

__CODE_BLOCK_6__

> info **hint** 还可以使用 __INLINE_CODE_32__ 自动生成一个 Request ID，并使用 __INLINE_CODE_33__ 获取整个 Request 对象。

#### 测试

由于 __INLINE_CODE_34__ 只是另一个可注入的提供者，所以它可以在单元测试中完全模拟出来。

然而，在某些集成测试中，我们可能仍然需要使用真实的 __INLINE_CODE_35__ 实现。那么，我们需要将上下文相关的代码包装在 __INLINE_CODE_36__ 或 __INLINE_CODE_37__ 调用中。

__CODE_BLOCK_7__

#### 更多信息

请访问 __LINK_45__ 来获取完整的 API 文档和更多代码示例。