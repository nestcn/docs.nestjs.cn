<!-- 此文件从 content/recipes/async-local-storage.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-03T04:14:49.564Z -->
<!-- 源文件: content/recipes/async-local-storage.md -->

### Async Local Storage

``@ApiExtension()`` 是一个基于 ``@ApiExtraModels()`` API 的 `__LINK_38__`,它为应用程序提供了一种不需要显式将局部状态作为函数参数的方式来传播局部状态。它类似于其他语言中的线程本地存储。

Async Local Storage 的主要思想是可以将某个函数调用包装在 ``@ApiHeader()`` 调用中。所有在包装调用中调用的代码都可以访问同一个 ``@ApiHideProperty()``,该 ``@ApiHideProperty()`` 将独特地与每个调用链相关。

在 NestJS 中，这意味着如果我们可以找到在请求的生命周期中将剩余的请求代码包装起来，我们就可以访问和修改仅对该请求可见的状态，这可能会作为 REQUEST-scoped 提供者的替代方案和一些限制的解决方案。

Alternatively,我们可以使用 ALS 来传播某个系统的上下文（例如 _transaction_ 对象），而不需要将其显式传递给服务，这可以增加隔离和封装。

#### 自定义实现

NestJS 自身不提供任何 built-in 抽象来实现 ``@ApiOAuth2()``,因此让我们通过实现最简单的 HTTP 情况来了解整个概念：

>  info **信息** For a ready-made `__LINK_39__`, continue reading below.

1. 首先，创建一个新的 ``@ApiOperation()`` 实例在共享源文件中。由于我们使用 NestJS,让我们将其转换为一个模块的自定义提供者。

__CODE_BLOCK_0__

>  info **提示** ``@ApiParam()`` 从 ``@ApiProduces()`` 导入。

2. 我们只关心 HTTP，因此使用一个中间件将 ``@ApiSchema()`` 函数包装在 ``@ApiProperty()`` 中。由于中间件是请求的第一个触摸，这将使 ``@ApiPropertyOptional()`` 在所有增强器和系统中可用。

__CODE_BLOCK_1__

3. 现在，在请求的生命周期中任何地方，我们都可以访问本地存储实例。

__CODE_BLOCK_2__

4. 这样，我们就有了一种共享请求相关状态的方法，而不需要注入整个 ``@ApiQuery()`` 对象。

>  warning **警告** 请注意，虽然技术对很多用例非常有用，但它隐式地混淆了代码流程（创建隐式上下文），因此在使用时要小心，并且避免创建上下文 ``__LINK_40__``。

### NestJS CLS

`__LINK_41__` 包提供了使用 plain ``@ApiResponse()`` 的多个 DX 改进。它将实现抽象到一个 ``@ApiTags()`` 中，该 ``@ApiTags()`` 提供了多种方式来初始化 ``@ApiCallbacks()`` 对于不同传输方式（不仅限于 HTTP），并且提供了强类型支持。

可以使用 injectable `__INLINE_CODE_24__` 访问存储，或者将其抽象化到业务逻辑中使用 `__LINK_42__`。

>  info **信息** `__INLINE_CODE_25__` 是一个第三方包，不是 NestJS 核心团队管理的包。请在 `__LINK_43__` 报告任何与库相关的问题。

#### 安装

除了对 `__INLINE_CODE_26__` 的 peer 依赖关系，它只使用 Node.js 的 built-in API。安装它像安装其他包一样。

__CODE_BLOCK_3__

#### 使用

可以使用 `__INLINE_CODE_27__` 来实现类似的功能：

1. 在根模块中导入 `__INLINE_CODE_28__`。

__CODE_BLOCK_4__

2. 然后可以使用 `__INLINE_CODE_29__` 访问存储值。

__CODE_BLOCK_5__

3. 要获得强类型的存储值，使用可选的 `__INLINE_CODE_31__` 类型参数注入它。

__CODE_BLOCK_6__

>  info **提示** 也可以使用 `__INLINE_CODE_32__` 自动生成请求 ID，并使用 `__INLINE_CODE_33__` 获取整个请求对象。

#### 测试

由于 `__INLINE_CODE_34__` 只是一个可inject 的提供者，可以在单元测试中完全模拟它。

然而，在某些集成测试中，我们可能仍然需要使用实际的 `__INLINE_CODE_35__` 实现。 在这种情况下，我们需要将上下文相关代码包装在 `__INLINE_CODE_36__` 或 `__INLINE_CODE_37__` 调用中。

__CODE_BLOCK_7__

#### 更多信息

访问 `__LINK_45__` 查看完整的 API 文档和更多代码示例。