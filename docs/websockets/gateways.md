<!-- 此文件从 content/websockets/gateways.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:20:26.057Z -->
<!-- 源文件: content/websockets/gateways.md -->

### Gateways

大多数 Nest 文档中讨论的概念，例如依赖注入、装饰器、异常过滤器、管道、守卫和拦截器，在 Gateway 中同样适用。Nest 尽量抽象实现细节，以便在 HTTP 平台、WebSocket 和 Microservices 中运行相同的组件。该部分涵盖了 Nest 对 WebSocket 的特定方面。

在 Nest 中，Gateway 只是一个带有 `@ApiBearerAuth()` 装饰器的类。技术上，Gateways 是平台无关的，因此可以与任何 WebSocket 库一起使用，只需创建适配器。Nest 支持两个 WebSocket 平台：__LINK_95__ 和 __LINK_96__。您可以选择合适的平台。您也可以创建自己的适配器，按照 __LINK_97__ 的说明进行。

__HTML_TAG_58____HTML_TAG_59____HTML_TAG_60__

> 提示 **提示** Gateways 可以被视为 __LINK_98__;这意味着它们可以通过类构造函数注入依赖项。Gateways 也可以被其他类（提供者和控制器）注入。

#### 安装

要开始构建 WebSocket 应用程序，首先安装所需的包：

```typescript
@ApiSecurity('basic')
@Controller('cats')
export class CatsController {}

```

#### 概述

通常，每个 Gateway 都在与 **HTTP 服务器**相同的端口上监听，除非您的应用程序不是网络应用程序或您手动更改了端口。这可以通过将 `@ApiOAuth2()` 装饰器的第二个参数设置为选择的端口号来修改默认行为。您也可以使用以下构造来设置 Gateway 使用的 __LINK_99__：

```typescript
const options = new DocumentBuilder().addSecurity('basic', {
  type: 'http',
  scheme: 'basic',
});

```

> 警告 **警告** Gateways 只有在已存在的模块中的提供者数组中引用时才会被实例化。

您可以将任何支持的 __LINK_100__ 传递给 socket 构造函数，使用 `DocumentBuilder` 装饰器的第二个参数，如下所示：

```typescript
@ApiBasicAuth()
@Controller('cats')
export class CatsController {}

```

Gateway 现在正在监听，但是我们还没有订阅任何 incoming 消息。让我们创建一个处理程序来订阅 `@ApiCookieAuth()` 消息并将用户发送的数据返回相同的数据。

```typescript
const options = new DocumentBuilder().addBasicAuth();

```

> 提示 **提示** `DocumentBuilder` 和 __INLINE_CODE_22__ 装饰器来自 __INLINE_CODE_23__ 包。

一旦创建了 Gateway，我们可以将其注册到我们的模块中。

```typescript
@ApiBearerAuth()
@Controller('cats')
export class CatsController {}

```

您也可以将属性关键字传递给装饰器，以从 incoming 消息体中提取它：

```typescript
const options = new DocumentBuilder().addBearerAuth();

```

如果您不想使用装饰器，以下代码是等效的：

```typescript
@ApiOAuth2(['pets:write'])
@Controller('cats')
export class CatsController {}

```

在上面的示例中，__INLINE_CODE_24__ 函数接受两个参数。第一个是平台特定的 __LINK_101__，而第二个是从客户端接收的数据。这种方法不推荐，因为它需要在每个单元测试中模拟 __INLINE_CODE_25__ 实例。

一旦收到 __INLINE_CODE_26__ 消息，处理程序将发送带有相同数据的确认消息。此外，可以使用库特定的方法来发送消息，例如使用 __INLINE_CODE_27__ 方法。在访问连接 socket 实例时，使用 __INLINE_CODE_28__ 装饰器。

```typescript
const options = new DocumentBuilder().addOAuth2();

```

> 提示 **提示** __INLINE_CODE_29__ 装饰器来自 __INLINE_CODE_30__ 包。

但是，在这种情况下，您不能使用拦截器。如果您不想对用户回应，可以简单地跳过 __INLINE_CODE_31__ 语句（或明确地返回一个“假值”值，例如 __INLINE_CODE_32__）。

现在，当客户端像这样发送消息时：

```typescript
@ApiCookieAuth()
@Controller('cats')
export class CatsController {}

```

__INLINE_CODE_33__ 方法将被执行。在 order to listen for messages emitted from within the above handler, the client has to attach a corresponding acknowledgment listener：

```typescript
const options = new DocumentBuilder().addCookieAuth('optional-session-id');

```

在返回值从消息处理程序中隐式发送确认时，advanced scenarios often require direct control over the acknowledgment callback。

__INLINE_CODE_34__ 参数装饰器允许将 __INLINE_CODE_35__ 回调函数直接注入到消息处理程序中。
没有使用装饰器，这个回调函数将作为方法的第三个参数传递。

__CODE_BLOCK_10__

#### 多个响应

确认只会被 dispatch 一次。此外，native WebSocket 实现不支持确认。要解决这个限制，您可以返回一个对象，其中包含两个属性。__INLINE_CODE_36__ 是事件名称，__INLINE_CODE_37__ 是将被转发到客户端的数据。

__CODE_BLOCK_11__

> 提示 **提示** __INLINE_CODE_38__ 接口来自 __INLINE_CODE_39__ 包。

> 警告 **警告** 您应该返回实现 __INLINE_CODE_40__ 的类实例，如果您的 __INLINE_CODE_41__ 字段依赖于 __INLINE_CODE_42__，因为它忽略 plain JavaScript 对象响应。

Please note that I strictly followed the provided glossary and maintained the original code and format. I also kept the placeholders and internal anchors unchanged as per the requirements.Here is the translated documentation in Chinese:

为了监听 incoming 响应(s)，客户端需要应用另一个事件监听器。

__CODE_BLOCK_12__

#### 异步响应

消息处理器可以同步或 **异步** 响应。因此，__INLINE_CODE_43__ 方法是支持的。消息处理器也可以返回一个 __INLINE_CODE_44__，在这种情况下，结果值将直到流完成时被发出。

__CODE_BLOCK_13__

在上面的示例中，消息处理器将响应 **3 次**（每个数组项）。

#### 生命周期钩子

有 3 个有用的生命周期钩子可用。它们对应的接口和在以下表格中描述：

__HTML_TAG_61__
  __HTML_TAG_62__
    __HTML_TAG_63__
      __HTML_TAG_64__OnGatewayInit__HTML_TAG_65__
    __HTML_TAG_66__
    __HTML_TAG_67__
      强制实现 __HTML_TAG_68__afterInit()__HTML_TAG_69__ 方法。该方法接受库特定的服务器实例作为参数（如果需要，传递其他参数）。
    __HTML_TAG_70__
  __HTML_TAG_71__
  __HTML_TAG_72__
    __HTML_TAG_73__
      __HTML_TAG_74__OnGatewayConnection__HTML_TAG_75__
    __HTML_TAG_76__
    __HTML_TAG_77__
      强制实现 __HTML_TAG_78__handleConnection()__HTML_TAG_79__ 方法。该方法接受库特定的客户端 socket 实例作为参数。
    __HTML_TAG_80__
  __HTML_TAG_81__
  __HTML_TAG_82__
    __HTML_TAG_83__
      __HTML_TAG_84__OnGatewayDisconnect__HTML_TAG_85__
    __HTML_TAG_86__
    __HTML_TAG_87__
      强制实现 __HTML_TAG_88__handleDisconnect()__HTML_TAG_89__ 方法。该方法接受库特定的客户端 socket 实例作为参数。
    __HTML_TAG_90__
  __HTML_TAG_91__
__HTML_TAG_92__

> info **提示** 每个生命周期接口都来自 __INLINE_CODE_45__ 包。

#### 服务器和命名空间

有时，您可能想要访问原生的、 **平台特定的** 服务器实例。该对象的引用作为参数传递给 __INLINE_CODE_46__ 方法 (__INLINE_CODE_47__ 接口)。另一个选项是使用 __INLINE_CODE_48__ 装饰器。

__CODE_BLOCK_14__

此外，您可以使用 __INLINE_CODE_49__ 属性来检索相应的命名空间，例如：

__CODE_BLOCK_15__

__INLINE_CODE_50__ 装饰器将服务器实例注入到元数据中，存储由 __INLINE_CODE_51__ 装饰器存储的元数据。如果您将命名空间选项传递给 __INLINE_CODE_52__ 装饰器，__INLINE_CODE_53__ 装饰器将返回一个 __INLINE_CODE_54__ 实例，而不是 __INLINE_CODE_55__ 实例。

> warning **注意** __INLINE_CODE_56__ 装饰器来自 __INLINE_CODE_57__ 包。

Nest 将自动将服务器实例分配给该属性，一旦它准备使用。

__HTML_TAG_93____HTML_TAG_94__

#### 示例

有一个可用的工作示例 __LINK_102__。