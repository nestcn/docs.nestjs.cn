<!-- 此文件从 content/graphql/field-middleware.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T05:10:08.178Z -->
<!-- 源文件: content/graphql/field-middleware.md -->

### Field middleware

> warning **警告** 本章仅适用于代码优先方法。

Field Middleware 让您可以在字段被解析前或后执行任意代码。Field Middleware 可以用来转换字段的结果、验证字段的参数或检查字段级别的角色（例如，required 来访问目标字段，用于执行中间件函数）。

您可以将多个中间件函数连接到一个字段。在这种情况下，他们将按照链的顺序被调用，其中前一个中间件决定是否调用下一个中间件。中间件函数在 __INLINE_CODE_5__ 数组中的顺序很重要。第一个解析器是最外层的层次，因此它将首先执行并最后执行（类似于 __INLINE_CODE_6__ 包）。第二个解析器是第二外层的层次，因此它将第二次执行并第二次到最后执行。

#### 获取开始

让我们从创建一个简单的中间件开始，该中间件将在将字段值发送回客户端前记录该字段值：

```typescript
resolve: { // see: https://webpack.js.org/configuration/resolve/
  alias: {
      "@nestjs/graphql": path.resolve(__dirname, "../node_modules/@nestjs/graphql/dist/extra/graphql-model-shim")
  }
}

```

> info **提示** __INLINE_CODE_7__ 是一个对象，它包含了正常情况下 GraphQL 解析器函数 __INLINE_CODE_8__ 接收的同样参数，而 __INLINE_CODE_9__ 是一个函数，允许您在栈中执行下一个中间件或实际字段解析器。

> warning **警告** Field middleware 函数不可以注入依赖项，也不能访问 Nest 的 DI 容器，因为它们是设计为非常轻量级的 shouldn't 执行任何可能时间消耗的操作（例如，从数据库中检索数据）。如果您需要调用外部服务/从数据源中查询数据，您应该在 Guard/Interceptor 中将其绑定到根查询/ mutation 处理器，并将其分配给 __INLINE_CODE_10__ 对象，您可以在字段中间件中访问该对象（特别是从 __INLINE_CODE_11__ 对象）。

请注意，field middleware 必须匹配 __INLINE_CODE_12__ 接口。在上面的示例中，我们首先执行 __INLINE_CODE_13__ 函数（实际执行字段解析器并返回字段值），然后，我们将该值记录到我们的终端。也就是说，我们不想执行任何更改，因此我们简单地返回原始值。

现在，我们可以在 __INLINE_CODE_14__ 装饰器中注册我们的中间件，例如：

__CODE_BLOCK_1__

现在，每当我们请求 __INLINE_CODE_15__ 字段的 __INLINE_CODE_16__ 对象类型时，原始字段值将被记录到控制台中。

> info **提示** 了解如何使用 __LINK_19__ 功能实现字段级别的权限系统，请查看这个 __LINK_20__。

> warning **警告** Field middleware 可以应用于 __INLINE_CODE_17__ 类。更多信息，请查看这个 __LINK_21__。

此外，如前所述，我们可以在中间件函数中控制字段的值。为了演示目的，让我们将食谱的标题大写（如果存在）：

__CODE_BLOCK_2__

在这种情况下，每个标题都将自动大写，当请求时。

类似地，您可以将中间件绑定到自定义字段解析器（一个带有 __INLINE_CODE_18__ 装饰器的方法），例如：

__CODE_BLOCK_3__

> warning **警告** 在启用 enhancers 时，如果 enhancers 是在字段解析器级别启用的 (__LINK_22__), field middleware 函数将在任何绑定到方法的拦截器、守卫等之前执行，但是在根级别注册的 enhancers 之后执行。

#### 全局字段中间件

除了将中间件直接绑定到特定的字段之外，您还可以注册一个或多个中间件函数_globally_.在这种情况下，它们将自动连接到您的对象类型中的所有字段。

__CODE_BLOCK_4__

> info **提示** Globally 注册的 field middleware 函数将在本地注册的中间件（那些直接绑定到特定的字段）之前执行。