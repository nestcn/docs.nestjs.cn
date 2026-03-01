<!-- 此文件从 content/graphql/field-middleware.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-01T04:25:17.405Z -->
<!-- 源文件: content/graphql/field-middleware.md -->

### Field middleware

> warning **警告** 本章仅适用于代码优先 approach。

Field Middleware 允许您在字段被解析前或后执行任意代码。 Field middleware 可以用于将字段结果转换、验证字段参数或检查字段级别的角色（例如，required 为了访问目标字段）。

您可以将多个 middleware 函数连接到字段。在这种情况下，他们将按顺序在链中执行，其中前一个 middleware 决定是否调用下一个 middleware。 middleware 函数的顺序在 __INLINE_CODE_5__ 数组中非常重要。第一个解析器是“最外层”层，因此它将首先被执行，并且最后执行（类似于 __INLINE_CODE_6__ 包）。第二个解析器是“第二外层”层，因此它将第二次执行，第二次到最后执行。

#### 开启

让我们从创建一个简单的 middleware 开始，该 middleware 将在字段值被发送到客户端前记录字段值：

__CODE_BLOCK_0__

> info **提示** __INLINE_CODE_7__ 是一个对象，包含了 GraphQL 解析器函数（__INLINE_CODE_8__）通常接收的相同参数，而 __INLINE_CODE_9__ 是一个函数，允许您在链中执行下一个 middleware 或实际字段解析器。

> warning **警告** Field middleware 函数不能注入依赖项，也不能访问 Nest 的 DI 容器，因为它们旨在非常轻便，不应该执行任何潜在时间消耗的操作（例如，从数据库检索数据）。如果您需要调用外部服务/查询数据源，您应该在守卫/拦截器中执行它们，并将它们分配给 __INLINE_CODE_10__ 对象，这样您可以在字段 middleware 中访问它们（特别是通过 __INLINE_CODE_11__ 对象）。

请注意，field middleware 必须符合 __INLINE_CODE_12__ 接口。在上面的示例中，我们首先执行 __INLINE_CODE_13__ 函数（实际执行字段解析器并返回字段值），然后，我们将该值记录到我们的终端。由于我们不想执行任何更改，我们简单地返回原始值。

现在，我们可以将 middleware 直接注册到 __INLINE_CODE_14__ 装饰器中，例如：

__CODE_BLOCK_1__

现在，每当我们请求 __INLINE_CODE_15__ 字段的 __INLINE_CODE_16__ 对象类型时，原始字段值将被记录到控制台。

> info **提示** 了解如何使用 __LINK_19__ 功能实现字段级别的权限系统，查看 __LINK_20__。

> warning **警告** Field middleware 只能应用于 __INLINE_CODE_17__ 类。更多信息，请查看 __LINK_21__。

此外，如前所述，我们可以在 middleware 函数中控制字段值。为了演示目的，让我们将食谱标题大写（如果存在）：

__CODE_BLOCK_2__

在这种情况下，每个标题将自动大写，请求时。

类似地，您可以将字段 middleware 绑定到自定义字段解析器（一个带有 __INLINE_CODE_18__ 装饰器的方法），例如：

__CODE_BLOCK_3__

> warning **警告** 如果在字段解析器级别启用了增强器（__LINK_22__），field middleware 函数将在任何拦截器、守卫等向该方法束缚之前执行（但在 root-level增强器注册的查询或mutation 处理程序之前执行）。

#### 全局字段 middleware

除了将 middleware 直接绑定到特定字段外，您还可以注册一个或多个 middleware 函数_globally_。在这种情况下，它们将自动连接到您的对象类型的所有字段。

__CODE_BLOCK_4__

> info **提示** Globally 注册的 field middleware 函数将在本地注册的那些（直接绑定到特定字段）之前执行。