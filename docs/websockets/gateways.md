<!-- 此文件从 content/websockets/gateways.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-21T16:25:06.217Z -->
<!-- 源文件: content/websockets/gateways.md -->

### WebSocket 网关

大多数 Nest 文档中讨论的概念，如依赖注入、装饰器、异常过滤器、管道、守卫和拦截器，也适用于 WebSocket 网关。Nest 将尽量抽象实现细节，以便在 HTTP 平台、WebSocket 和 Microservices 等平台上运行相同的组件。下面这部分将专门讨论 Nest 中特定于 WebSocket 的方面。

在 Nest 中，WebSocket 网关是一个简单的类，它被 `@ApiBearerAuth()` 装饰器所注解。技术上讲，这些网关是平台无关的，因此它们可以与任何 WebSocket 库一起使用，只要创建了适配器。Nest 目前支持两种 WS 平台：__LINK_95__ 和 __LINK_96__。您可以选择合适的平台，也可以自己创建适配器，按照 __LINK_97__ 的指引进行。

__HTML_TAG_58____HTML_TAG_59____HTML_TAG_60__

> info **提示** 网关可以被视为 __LINK_98__，这意味着它们可以通过类构造函数注入依赖项。另外，网关也可以被其他类（提供者和控制器）注入。

#### 安装

要开始构建 WebSocket 应用程序，首先安装所需的包：

```typescript
@ApiSecurity('basic')
@Controller('cats')
export class CatsController {}

```

#### 概述

通常，每个网关都监听与 **HTTP 服务器**相同的端口，除非您的应用程序不是 Web 应用程序，或者您手动更改了端口。可以通过将 `DocumentBuilder` 装饰器的第二个参数设置为 `@ApiOAuth2()`，来修改这个默认行为。

您也可以使用以下构造来设置网关使用的 __LINK_99__：

```typescript
const options = new DocumentBuilder().addSecurity('basic', {
  type: 'http',
  scheme: 'basic',
});

```

> warning **警告** 网关直到它们在现有模块的提供者数组中被引用时才被实例化。

可以将任何支持的 __LINK_100__ 传递给 socket 构造函数，使用 `DocumentBuilder` 装饰器的第二个参数，如下所示：

```typescript
@ApiBasicAuth()
@Controller('cats')
export class CatsController {}

```

网关现在正在监听，但我们还没有订阅任何 incoming 消息。让我们创建一个处理程序，来订阅 `@ApiCookieAuth()` 消息并将 exact same 数据回送给用户。

```typescript
const options = new DocumentBuilder().addBasicAuth();

```

> info **提示** `DocumentBuilder` 和 __INLINE_CODE_22__ 装饰器来自 __INLINE_CODE_23__ 包。

一旦网关创建好了，我们可以在模块中注册它。

```typescript
@ApiBearerAuth()
@Controller('cats')
export class CatsController {}

```

也可以将属性键传递给装饰器，以从 incoming 消息体中提取它：

```typescript
const options = new DocumentBuilder().addBearerAuth();

```

如果您不想使用装饰器，以下代码是功能等价的：

```typescript
@ApiOAuth2(['pets:write'])
@Controller('cats')
export class CatsController {}

```

在上面的示例中，__INLINE_CODE_24__ 函数接受两个参数。第一个参数是平台特定的 __LINK_101__，而第二个参数是从客户端接收的数据。这种方法不推荐，因为它需要在每个单元测试中模拟 __INLINE_CODE_25__ 实例。

一旦收到 __INLINE_CODE_26__ 消息，处理程序将发送相同的数据作为应答。在 addition，它还可以使用库特定的方法来发送消息，例如使用 __INLINE_CODE_27__ 方法。在访问连接 socket 实例时，请使用 __INLINE_CODE_28__ 装饰器。

```typescript
const options = new DocumentBuilder().addOAuth2();

```

> info **提示** __INLINE_CODE_29__ 装饰器来自 __INLINE_CODE_30__ 包。

但是在这种情况下，您不能使用拦截器。 如果您不想回送用户，请简单地跳过 __INLINE_CODE_31__ 语句（或明确地返回一个“假值”，例如 __INLINE_CODE_32__）。

现在，当客户端发出以下消息时：

```typescript
@ApiCookieAuth()
@Controller('cats')
export class CatsController {}

```

__INLINE_CODE_33__ 方法将被执行。在 order to listen for messages emitted from within the above handler，客户端需要将相应的回应监听器附加：

```typescript
const options = new DocumentBuilder().addCookieAuth('optional-session-id');

```

在返回值从消息处理器中隐式地发送确认时，高级场景通常需要直接控制确认回调。

__INLINE_CODE_34__ 参数装饰器允许将 __INLINE_CODE_35__ 回调函数直接注入到消息处理器中。
没有使用装饰器，这个回调函数将作为方法的第三个参数传递。

__CODE_BLOCK_10__

#### 多个响应

确认只被 dispatch 一次。此外，这个确认不受 Native WebSocket 实现的支持。为了解决这个限制，您可以返回一个对象，该对象包含两个属性。__INLINE_CODE_36__ 是要发射的事件的名称，__INLINE_CODE_37__ 是要将其转发到客户端的数据。

__CODE_BLOCK_11__

> info **提示** __INLINE_CODE_38__ 接口来自 __INLINE_CODE_39__ 包。

> warning **警告** 您应该返回实现 __INLINE_CODE_40__ 的类实例，如果您的 __INLINE_CODE_41__ 字段依赖于 __INLINE_CODE_42__，因为它忽略了纯 JavaScript 对象响应。Here is the translation of the English technical documentation to Chinese:

为了监听incoming response(s)，客户端需要添加另一个事件监听器。

__CODE_BLOCK_12__

#### 异步响应

消息处理程序可以同步或异步地响应。因此，__INLINE_CODE_43__方法是支持的。消息处理程序也可以返回一个__INLINE_CODE_44__，在这种情况下，结果值将直到流完成时被emit。

__CODE_BLOCK_13__

在上面的示例中，消息处理程序将响应**3次**（对每个数组项）。

#### 生命周期钩子

有三个有用的生命周期钩子可用。它们都有相应的接口，以下是它们的描述：

__HTML_TAG_61__
  __HTML_TAG_62__
    __HTML_TAG_63__
      __HTML_TAG_64__OnGatewayInit__HTML_TAG_65__
    __HTML_TAG_66__
    __HTML_TAG_67__
      强制实现__HTML_TAG_68__afterInit()__HTML_TAG_69__方法。它接受库特定的服务器实例作为参数（如果需要，spread其他内容）。
    __HTML_TAG_70__
  __HTML_TAG_71__
  __HTML_TAG_72__
    __HTML_TAG_73__
      __HTML_TAG_74__OnGatewayConnection__HTML_TAG_75__
    __HTML_TAG_76__
    __HTML_TAG_77__
      强制实现__HTML_TAG_78__handleConnection()__HTML_TAG_79__方法。它接受库特定的客户端套接字实例作为参数。
    __HTML_TAG_80__
  __HTML_TAG_81__
  __HTML_TAG_82__
    __HTML_TAG_83__
      __HTML_TAG_84__OnGatewayDisconnect__HTML_TAG_85__
    __HTML_TAG_86__
    __HTML_TAG_87__
      强制实现__HTML_TAG_88__handleDisconnect()__HTML_TAG_89__方法。它接受库特定的客户端套接字实例作为参数。
    __HTML_TAG_90__
  __HTML_TAG_91__
__HTML_TAG_92__

> info **提示**每个生命周期接口都来自__INLINE_CODE_45__包。

#### 服务器和命名空间

有时候，您可能想要获取对 native、平台特定的服务器实例的直接访问。服务器实例的引用作为__INLINE_CODE_46__方法的参数传递给（__INLINE_CODE_47__接口）。另一个选项是使用__INLINE_CODE_48__装饰器。

__CODE_BLOCK_14__

此外，您可以使用__INLINE_CODE_49__属性来检索相应的命名空间，例如：

__CODE_BLOCK_15__

__INLINE_CODE_50__装饰器通过引用__INLINE_CODE_51__装饰器存储的元数据来注入服务器实例。如果您将命名空间选项传递给__INLINE_CODE_52__装饰器，__INLINE_CODE_53__装饰器将返回一个__INLINE_CODE_54__实例，而不是__INLINE_CODE_55__实例。

> warning **注意**__INLINE_CODE_56__装饰器来自__INLINE_CODE_57__包。

Nest将自动将服务器实例分配给这个属性，以便在它准备使用时使用。

__HTML_TAG_93____HTML_TAG_94__

#### 示例

有一个可用的示例__LINK_102__。