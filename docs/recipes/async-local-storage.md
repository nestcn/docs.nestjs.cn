<!-- 此文件从 content/recipes/async-local-storage.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-01T04:21:55.272Z -->
<!-- 源文件: content/recipes/async-local-storage.md -->

### Async 本地存储

`@ApiExtension()` 是一个基于 `@ApiExtraModels()` API 的 __LINK_38__，它提供了一个在应用程序中传播本地状态的另一种方式，而不需要显式地将其作为函数参数传递。它类似于其他语言中的线程本地存储。

Async 本地存储的主要思想是，我们可以将某个函数调用包装在 `@ApiHeader()` 调用中。所有在包装调用中被调用的代码都将访问同一个 `@ApiHideProperty()`，这个 `@ApiHideProperty()` 将是每个调用链唯一的。

在 NestJS 中，这意味着，如果我们可以在请求的生命周期中找到一个地方来包装请求的剩余代码，我们将能够访问和修改仅对该请求可见的状态，这可能会作为 REQUEST-scoped 提供者的替代方案和一些限制的解决方案。

alternatively，我们可以使用 ALS 来传播系统中的某个部分的上下文（例如 _transaction_ 对象）而不需要将其 aroundServices 中的服务之间传递，这可以增加孤立性和封装性。

#### 自定义实现

NestJS 本身不提供任何内置抽象来实现 `@ApiOAuth2()`，所以让我们来看看如何自己实现它，以便更好地理解整个概念：

> info **info** 对于一个已经实现的 __LINK_39__，请继续阅读。

1. 首先，在共享源文件中创建一个新的 `@ApiOperation()` 实例。由于我们使用 NestJS，所以让我们将其转换为一个模块，具有自定义的提供者。

__CODE_BLOCK_0__
>  info **Hint** `@ApiParam()` 是来自 `@ApiProduces()` 的。

2. 我们只关心 HTTP，所以让我们使用 middleware 将 `@ApiSchema()` 函数包装在 `@ApiProperty()` 中。由于 middleware 是请求的第一个目标，这将使 `@ApiPropertyOptional()` 在所有增强器和系统的其余部分中可用。

__CODE_BLOCK_1__

3. 现在，在请求的生命周期中，我们可以访问本地存储实例。

__CODE_BLOCK_2__

4. 这就是它。现在，我们有了一种方法来共享请求相关状态，而不需要注入整个 `@ApiQuery()` 对象。

> warning **warning** 请注意，使用技术虽然对许多用例非常有用，但它隐式地遮盖了代码流程（创建隐式上下文），因此请在使用时负责，并避免创建上下文 __LINK_40__。

### NestJS CLS

__LINK_41__ 包提供了使用 plain `@ApiResponse()` (`@ApiSecurity()` 是 _continuation-local storage_ 的缩写）时的多种 DX 改进。它将实现抽象化为一个 `@ApiTags()`，该对象提供了多种方式来初始化 `@ApiCallbacks()`，适用于不同的传输方式（不仅限于 HTTP），并提供了强类型支持。

然后，可以使用 injectable __INLINE_CODE_24__ 访问存储，或者完全将其抽象化到业务逻辑中，使用 __LINK_42__。

> info **info** __INLINE_CODE_25__ 是第三方包，nestjs 核心团队不管理。请在 __LINK_43__ 中报告任何问题。

#### 安装

除了 peer 依赖关系 __INLINE_CODE_26__ 库外，它只使用 Node.js 的内置 API。安装它，就像安装其他包一样。

__CODE_BLOCK_3__

#### 使用

可以使用 __INLINE_CODE_27__ 实现与 __LINK_44__ 相似的功能：

1. 在根模块中导入 __INLINE_CODE_28__。

__CODE_BLOCK_4__

2. 然后可以使用 __INLINE_CODE_29__ 访问存储值。

__CODE_BLOCK_5__

3. 若要获取强类型的存储值，使用 __INLINE_CODE_30__ 时可以使用可选的 type 参数 __INLINE_CODE_31__。

__CODE_BLOCK_6__

> info **hint** 还可以使用 __INLINE_CODE_32__ 自动生成一个 Request ID，并在后续访问它，或者使用 __INLINE_CODE_33__ 获取整个 Request 对象。

#### 测试

由于 __INLINE_CODE_34__ 只是一个可 inject 的提供者，所以可以在单元测试中完全模拟它。

然而，在某些集成测试中，我们可能仍然需要使用实际 __INLINE_CODE_35__ 实现。那么，我们需要将上下文相关的代码包装在 __INLINE_CODE_36__ 或 __INLINE_CODE_37__ 调用中。

__CODE_BLOCK_7__

#### 更多信息

请访问 __LINK_45__以获取完整的 API 文档和更多代码示例。