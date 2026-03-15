<!-- 此文件从 content/websockets/gateways.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T05:01:30.908Z -->
<!-- 源文件: content/websockets/gateways.md -->

### 网关

大多数讨论在本文档中的概念，如依赖注入、装饰器、异常过滤器、管道、守卫和拦截器，在网关中都适用。尽量将实现细节抽象化，以便在 HTTP 基于平台、WebSockets 和微服务中运行相同的组件。这部分涵盖了 Nest 在 WebSockets 中特定的方面。

在 Nest 中，网关是简单地使用 `@ApiBearerAuth()` 装饰器注释的类。技术上，网关是平台无关的，这使它们与任何 WebSockets 库兼容，只要创建了适配器。Nest 支持两个 WS 平台：__LINK_95__ 和 __LINK_96__。您可以选择合适的平台。还可以创建自己的适配器，按照这个 __LINK_97__。

__HTML_TAG_58____HTML_TAG_59____HTML_TAG_60__

> 提示 **Hint** 网关可以被视为 __LINK_98__；这意味着它们可以通过类构造函数注入依赖项。同时，网关也可以被其他类（提供者和控制器）注入。

#### 安装

要开始构建基于 WebSockets 的应用程序，首先安装所需的包：

```typescript
@ApiSecurity('basic')
@Controller('cats')
export class CatsController {}

```

#### 概述

通常，每个网关都监听与 **HTTP 服务器**相同的端口，除非您的应用程序不是 Web 应用程序，或者您手动更改了端口。这个默认行为可以通过将 `DocumentBuilder` 装饰器的参数设置为 `@ApiOAuth2()` 选择的端口号来修改。您还可以使用以下构造来设置网关使用的 __LINK_99__：

```typescript
const options = new DocumentBuilder().addSecurity('basic', {
  type: 'http',
  scheme: 'basic',
});

```

> 警告 **Warning** 网关直到在现有模块的提供者数组中被引用时才被实例化。

您可以将支持的 __LINK_100__ 传递给 socket 构造函数，以便使用第二个参数来装饰 `DocumentBuilder`。如下所示：

```typescript
@ApiBasicAuth()
@Controller('cats')
export class CatsController {}

```

网关现在正在监听，但是我们还没有订阅任何 incoming 消息。让我们创建一个处理程序，以便订阅 `@ApiCookieAuth()` 消息并将相同的数据回送给用户。

```typescript
const options = new DocumentBuilder().addBasicAuth();

```

> 提示 **Hint** `DocumentBuilder` 和 __INLINE_CODE_22__ 装饰器来自 __INLINE_CODE_23__ 包。

创建网关后，我们可以在模块中注册它。

```typescript
@ApiBearerAuth()
@Controller('cats')
export class CatsController {}

```

您还可以将属性 key 传递给装饰器，以便从 incoming 消息体中提取：

```typescript
const options = new DocumentBuilder().addBearerAuth();

```

如果您不想使用装饰器，以下代码是等效的：

```typescript
@ApiOAuth2(['pets:write'])
@Controller('cats')
export class CatsController {}

```

在上面的示例中，__INLINE_CODE_24__ 函数接受两个参数。第一个是平台特定的 __LINK_101__，而第二个是从客户端接收的数据。这个方法不是推荐的，因为它需要在每个单元测试中模拟 __INLINE_CODE_25__ 实例。

当 __INLINE_CODE_26__ 消息被接收时，处理程序发送包含相同数据的确认信息。此外，还可以使用库特定的方法来发送消息，例如 __INLINE_CODE_27__ 方法。在访问连接 socket 实例时，使用 __INLINE_CODE_28__ 装饰器。

```typescript
const options = new DocumentBuilder().addOAuth2();

```

> 提示 **Hint** __INLINE_CODE_29__ 装饰器来自 __INLINE_CODE_30__ 包。

然而，在这种情况下，您将无法使用拦截器。如果您不想回送给用户，可以简单地跳过 __INLINE_CODE_31__ 语句（或明确地返回一个“假”值，例如 __INLINE_CODE_32__）。

现在，当客户端以以下方式发送消息时：

```typescript
@ApiCookieAuth()
@Controller('cats')
export class CatsController {}

```

__INLINE_CODE_33__ 方法将被执行。在要监听来自上述处理程序的消息时，客户端需要附加相应的确认监听器：

```typescript
const options = new DocumentBuilder().addCookieAuth('optional-session-id');

```

返回值从消息处理器中隐式地发送确认信息，但是高级场景通常需要直接控制确认回调。

__INLINE_CODE_34__ 参数装饰器允许将 __INLINE_CODE_35__ 回调函数直接注入到消息处理器中。
没有使用装饰器，这个回调函数将作为方法的第三个参数传递。

__CODE_BLOCK_10__

#### 多个响应

确认信息只会被发送一次。此外，native WebSockets 实现不支持确认信息。为了解决这个限制，您可以返回一个包含两个属性的对象。__INLINE_CODE_36__ 是事件名称，__INLINE_CODE_37__ 是要向客户端转发的数据。

__CODE_BLOCK_11__

> 提示 **Hint** __INLINE_CODE_38__ 接口来自 __INLINE_CODE_39__ 包。

> 警告 **Warning** 如果您的 __INLINE_CODE_41__ 字段依赖于 __INLINE_CODE_42__，那么您应该返回实现 __INLINE_CODE_40__ 的类实例。Here is the translation of the English technical documentation to Chinese:

为了监听 incoming 响应，客户端需要应用另一个事件监听器。

__CODE_BLOCK_12__

####异步响应

消息处理程序可以同步或**异步**响应。因此，__INLINE_CODE_43__ 方法是支持的。消息处理程序也可以返回一个 __INLINE_CODE_44__，在这种情况下，结果值将被 emit 直到流完成。

__CODE_BLOCK_13__

在上面的示例中，消息处理程序将响应**3次**（每个数组项）。

####生命周期钩子

有三个有用的生命周期钩子可用。所有它们都有相应的接口，并在以下表格中描述：

__HTML_TAG_61__
  __HTML_TAG_62__
    __HTML_TAG_63__
      __HTML_TAG_64__OnGatewayInit__HTML_TAG_65__
    __HTML_TAG_66__
    __HTML_TAG_67__
      强制实现 __HTML_TAG_68__afterInit()__HTML_TAG_69__ 方法。该方法接受库特定的服务器实例作为参数（如果需要）。
    __HTML_TAG_70__
  __HTML_TAG_71__
  __HTML_TAG_72__
    __HTML_TAG_73__
      __HTML_TAG_74__OnGatewayConnection__HTML_TAG_75__
    __HTML_TAG_76__
    __HTML_TAG_77__
      强制实现 __HTML_TAG_78__handleConnection()__HTML_TAG_79__ 方法。该方法接受库特定的客户端 Socket 实例作为参数。
    __HTML_TAG_80__
  __HTML_TAG_81__
  __HTML_TAG_82__
    __HTML_TAG_83__
      __HTML_TAG_84__OnGatewayDisconnect__HTML_TAG_85__
    __HTML_TAG_86__
    __HTML_TAG_87__
      强制实现 __HTML_TAG_88__handleDisconnect()__HTML_TAG_89__ 方法。该方法接受库特定的客户端 Socket 实例作为参数。
    __HTML_TAG_90__
  __HTML_TAG_91__
__HTML_TAG_92__

> 提示 **提示**每个生命周期接口都来自 __INLINE_CODE_45__ 包。

####服务器和命名空间

有时，您可能想直接访问平台特定的服务器实例。该对象的引用将作为参数传递给 __INLINE_CODE_46__ 方法（__INLINE_CODE_47__ 接口）。另一个选项是使用 __INLINE_CODE_48__ 装饰器。

__CODE_BLOCK_14__

此外，您可以使用 __INLINE_CODE_49__ 属性来检索对应的命名空间，如下所示：

__CODE_BLOCK_15__

__INLINE_CODE_50__ 装饰器将注入服务器实例，通过引用 __INLINE_CODE_51__ 装饰器存储的元数据。如果您将命名空间选项传递给 __INLINE_CODE_52__ 装饰器，__INLINE_CODE_53__ 装饰器将返回 __INLINE_CODE_54__ 实例，而不是 __INLINE_CODE_55__ 实例。

> 警告 **注意** __INLINE_CODE_56__ 装饰器来自 __INLINE_CODE_57__ 包。

Nest 将自动将服务器实例分配到该属性，直到它准备使用。

__HTML_TAG_93____HTML_TAG_94__

####示例

可用的工作示例 __LINK_102__。