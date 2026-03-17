<!-- 此文件从 content/graphql/subscriptions.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:28:45.884Z -->
<!-- 源文件: content/graphql/subscriptions.md -->

### 订阅

除了使用查询和修改数据使用mutation之外，GraphQL spec还支持第三种操作类型，即__INLINE_CODE_36__。GraphQL 订阅是一种将数据从服务器推送到客户端的方式，客户端可以选择监听服务器的实时消息。订阅类似于查询，它指定了要发送到客户端的一组字段，但是相反，它们会在服务器上发生特定事件时打开一个通道，并将结果发送到客户端。

订阅的一个常见用例是通知客户端关于特定事件，例如创建了一个新的对象、更新了字段等（了解更多__LINK_144__）。

#### 使用 Apollo 驱动器启用订阅

要启用订阅，请将__INLINE_CODE_37__属性设置为__INLINE_CODE_38__。

```typescript
resolve: { // see: https://webpack.js.org/configuration/resolve/
  alias: {
      "@nestjs/graphql": path.resolve(__dirname, "../node_modules/@nestjs/graphql/dist/extra/graphql-model-shim")
  }
}

```

> warning **警告** Apollo 服务器的__INLINE_CODE_39__配置选项已经被删除，且将在这个包中很快被废弃。默认情况下,__INLINE_CODE_40__将 fallback 到使用__INLINE_CODE_41__(__LINK_145__)，但是我们强烈建议使用__INLINE_CODE_42__(__LINK_146__)库。

要切换到使用__INLINE_CODE_43__包，请使用以下配置：

__CODE_BLOCK_1__

> info **提示** 您也可以同时使用__INLINE_CODE_44__和__INLINE_CODE_45__包，例如为了backward compatibility。

#### 代码优先

使用代码优先方法创建订阅，我们使用__INLINE_CODE_46__装饰器（来自__INLINE_CODE_47__包）和__INLINE_CODE_48__类（来自__INLINE_CODE_49__包），该类提供了简单的发布/订阅 API。

以下订阅处理程序负责订阅事件，通过调用__INLINE_CODE_50__方法。这个方法唯一的参数是__INLINE_CODE_51__，它对应于事件主题名称。

__CODE_BLOCK_2__

> info **提示** 所有装饰器都来自__INLINE_CODE_52__包，而__INLINE_CODE_53__类来自__INLINE_CODE_54__包。

> warning **注意** __INLINE_CODE_55__是一个公开一个简单的__INLINE_CODE_56__和__INLINE_CODE_57__的类。了解更多__LINK_147__。请注意 Apollo 文档警告说默认实现不适合生产环境（了解更多__LINK_148__）。生产应用程序应该使用一个由外部存储支持的__INLINE_CODE_58__实现（了解更多__LINK_149__）。

这将生成以下部分 GraphQL 架构在 SDL 中：

__CODE_BLOCK_3__

注意，订阅由于其定义，返回一个对象，该对象的顶级属性名是订阅的名称。这个名称可以继承自订阅处理程序的名称（即__INLINE_CODE_59__），或者可以通过将一个名为__INLINE_CODE_60__的选项作为第二个参数传递给__INLINE_CODE_61__装饰器来提供。

__CODE_BLOCK_4__

这个构造产生与前一个代码样本相同的 SDL，但是允许我们将方法名称与订阅分开。

#### 发布

现在，我们使用__INLINE_CODE_62__方法来发布事件。这通常在mutation中用于触发客户端更新，当对象图发生变化时。例如：

__CODE_BLOCK_5__

__INLINE_CODE_63__方法的第一个参数是__INLINE_CODE_64__（即事件主题名称），第二个参数是事件 payload。正如所提到的，订阅由于其定义，返回一个值，该值有一个形状。再次查看我们对__INLINE_CODE_65__订阅的生成 SDL：

__CODE_BLOCK_6__

这告诉我们，订阅必须返回一个对象，该对象的顶级属性名为__INLINE_CODE_66__，该值是一个__INLINE_CODE_67__对象。重要的是，发布的事件 payload 的形状必须对应于订阅返回的值的形状。因此，在我们的示例中，__INLINE_CODE_69__语句发布了一个__INLINE_CODE_70__事件，其中包含合适形状的 payload。如果这些形状不匹配，订阅将在 GraphQL 验证阶段失败。

#### 筛选订阅

要筛选特定事件，请将__INLINE_CODE_71__属性设置为一个筛选函数。这个函数类似于数组中的函数，它们接受两个参数：__INLINE_CODE_73__包含事件 payload（由事件发布者发送），和__INLINE_CODE_74__在订阅请求中传递的任何参数。它返回一个布尔值，确定是否将该事件发布到客户端监听器。

__CODE_BLOCK_7__

#### mutating 订阅payload

[Translation complete]Here is the translation of the provided English technical documentation to Chinese:

为了变更已发布的事件 payload，请将 __INLINE_CODE_75__ 属性设置为一个函数。该函数将接收事件 payload（由事件发布者发送）并返回适当的值。

__CODE_BLOCK_8__

> 警告 **注意** 如果您使用 __INLINE_CODE_76__ 选项，请务必返回未包装的 payload（例如，在我们的示例中，直接返回一个 __INLINE_CODE_77__ 对象，而不是 __INLINE_CODE_78__ 对象）。

如果您需要访问注入的提供者（例如，使用外部服务验证数据），请使用以下构造。

__CODE_BLOCK_9__

同样的构造也适用于过滤器：

__CODE_BLOCK_10__

#### 模式优先

为了在 Nest 中创建等效的订阅，我们将使用 __INLINE_CODE_79__ 装饰器。

__CODE_BLOCK_11__

为了根据上下文和参数过滤特定的事件，请设置 __INLINE_CODE_80__ 属性。

__CODE_BLOCK_12__

为了变更已发布的 payload，我们可以使用 __INLINE_CODE_81__ 函数。

__CODE_BLOCK_13__

如果您需要访问注入的提供者（例如，使用外部服务验证数据），请使用以下构造：

__CODE_BLOCK_14__

同样的构造也适用于过滤器：

__CODE_BLOCK_15__

最后一步是更新类型定义文件。

__CODE_BLOCK_16__

这样，我们已经创建了一个 __INLINE_CODE_82__ 订阅。您可以在 __LINK_150__ 中找到完整的示例实现。

#### PubSub

我们上面已经实例化了一个本地 __INLINE_CODE_83__ 实例。推荐的方法是将 __INLINE_CODE_84__ 定义为 __LINK_151__ 并通过构造函数注入（使用 __INLINE_CODE_85__ 装饰器）。这使得我们可以在整个应用程序中重用实例。例如，定义一个提供者如下，然后在需要的地方注入 __INLINE_CODE_86__。

__CODE_BLOCK_17__

#### Customize 订阅服务器

为了自定义订阅服务器（例如，改变路径），使用 __INLINE_CODE_87__ 选项属性。

__CODE_BLOCK_18__

如果您使用 __INLINE_CODE_88__ 包含订阅，请将 __INLINE_CODE_89__ 键替换为 __INLINE_CODE_90__，如下所示：

__CODE_BLOCK_19__

#### WebSocket 认证

检查用户是否认证可以在 __INLINE_CODE_91__ 回调函数中实现，该函数可以在 __INLINE_CODE_92__ 选项中指定。

__INLINE_CODE_93__ 将收到 __INLINE_CODE_94__ 作为第一个参数，该参数传递给 __INLINE_CODE_95__（读取 __LINK_152__）。

__CODE_BLOCK_20__

在这个示例中，__INLINE_CODE_96__ 只有客户端在第一次建立连接时发送一次。
所有使用这个连接订阅的订阅将具有相同的 __INLINE_CODE_97__，并因此具有相同的用户信息。

> 警告 **注意** 在 __INLINE_CODE_98__ 中有一 bug，允许连接跳过 __INLINE_CODE_99__ 阶段（读取 __LINK_153__）。您不应该假设 __INLINE_CODE_100__ 已经被调用，当用户开始订阅时，您总是应该检查 __INLINE_CODE_101__ 是否已经被填充。

如果您使用 __INLINE_CODE_102__ 包含订阅，请 __INLINE_CODE_103__ 回调函数的签名将不同：

__CODE_BLOCK_21__

#### 启用 订阅

为了启用订阅，请将 __INLINE_CODE_104__ 属性设置为 __INLINE_CODE_105__。

__CODE_BLOCK_22__

> 提示 **提示** 您也可以传递选项对象以设置自定义发射器、验证 incoming 连接等。阅读更多 __LINK_154__（查看 __INLINE_CODE_106__）。

#### 代码优先

为了使用代码优先方法创建订阅，我们使用 __INLINE_CODE_107__ 装饰器（从 __INLINE_CODE_108__ 包含中导出）和 __INLINE_CODE_109__ 类（从 __INLINE_CODE_110__ 包含中导出），该类提供了简单的发布/订阅 API。

以下订阅处理程序负责订阅事件，调用 __INLINE_CODE_111__ 方法，该方法接受单个参数 __INLINE_CODE_112__，对应于事件主题名称。

__CODE_BLOCK_23__

> 提示 **提示** 所有在示例中使用的装饰器都是从 __INLINE_CODE_113__ 包含中导出，而 __INLINE_CODE_114__ 类是从 __INLINE_CODE_115__ 包含中导出。

> 警告 **注意** __INLINE_CODE_116__ 是一个类， exposes 一个简单的 __INLINE_CODE_117__ 和 __INLINE_CODE_118__ API。查看 __LINK_155__，了解如何注册自定义 __INLINE_CODE_119__ 类。

这将生成以下部分 GraphQL schema 在 SDL 中：

__CODE_BLOCK_24__

注意，订阅本质上返回一个包含单个顶级属性的对象，该属性的键是订阅的名称。该名称可以继承自订阅处理程序方法的名称（即 __INLINE_CODE_120__ 上面），或通过将 __INLINE_CODE_121__ 选项作为第二个参数传以下是翻译后的中文技术文档：

#### 发布

现在，我们使用 __INLINE_CODE_123__ 方法来发布事件。这通常在 mutation 中使用，以在对象图形中发生变化时触发客户端更新。例如：

__CODE_BLOCK_26__

正如前所述，订阅由于定义返回值，因此返回值具有形状。再次查看我们对 __INLINE_CODE_124__ 订阅生成的 SDL：

__CODE_BLOCK_27__

这表明订阅必须返回具有 __INLINE_CODE_125__ 属性的对象，该对象的值是一个 __INLINE_CODE_126__ 对象。重要的是，事件payload 发布由 __INLINE_CODE_127__ 方法所需的形状必须与订阅返回的值形状相匹配。因此，在我们的示例中， __INLINE_CODE_128__ 语句发布了一个 __INLINE_CODE_129__ 事件具有适当形状的 payload。如果这些形状不匹配，订阅将在 GraphQL 验证阶段失败。

#### 筛选订阅

要过滤特定事件，设置 __INLINE_CODE_130__ 属性为过滤函数。这函数类似于数组 __INLINE_CODE_131__ 的函数，它接受两个参数： __INLINE_CODE_132__ 包含事件payload（由事件发布者发送），和 __INLINE_CODE_133__ 在订阅请求中传递的参数。它返回一个布尔值，确定是否将该事件发布给客户端监听器。

__CODE_BLOCK_28__

如果需要访问注入的提供者（例如，使用外部服务来验证数据），使用以下构造。

__CODE_BLOCK_29__

#### schema-first

要在 Nest 中创建等效的订阅，我们将使用 __INLINE_CODE_134__ 装饰器。

__CODE_BLOCK_30__

要根据上下文和参数过滤特定事件，设置 __INLINE_CODE_135__ 属性。

__CODE_BLOCK_31__

如果需要访问注入的提供者（例如，使用外部服务来验证数据），使用以下构造：

__CODE_BLOCK_32__

最后一步是更新类型定义文件。

__CODE_BLOCK_33__

这样，我们创建了一个 __INLINE_CODE_136__ 订阅。

#### PubSub

在上面的示例中，我们使用了默认的 __INLINE_CODE_137__  emitter (__LINK_156__)
生产环境中更推荐使用 __INLINE_CODE_138__。Alternatively，可以提供自定义 __INLINE_CODE_139__ 实现（了解更多 __LINK_157__）

__CODE_BLOCK_34__

#### WebSocket 认证

可以在 __INLINE_CODE_140__ 回调函数中检查用户是否认证，可以在 __INLINE_CODE_141__ 选项中指定回调函数。

__INLINE_CODE_142__ 将接收 __INLINE_CODE_143__ 对象作为第一个参数，您可以使用它来检索请求的头。

__CODE_BLOCK_35__