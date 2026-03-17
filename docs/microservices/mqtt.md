<!-- 此文件从 content/microservices/mqtt.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:44:55.590Z -->
<!-- 源文件: content/microservices/mqtt.md -->

### MQTT

__链接79__ (Message Queuing Telemetry Transport) 是一个开源、轻量级的消息传输协议，旨在实现低延迟。该协议提供了一个可扩展且成本效益的方式来连接设备，使用 publish/subscribe 模型。基于 MQTT 的通信系统由发布服务器、代理服务器和一个或多个客户端组成。它是为受限设备和低带宽、高延迟或不可靠网络设计的。

#### 安装

要开始构建基于 MQTT 的微服务，首先安装所需的包：

__代码块0__

#### 概述

要使用 MQTT 传输器，请将以下选项对象传递给 `InternalCoreModule` 方法：

__代码块1__

> 提示 **Hint** `InternalCoreModule` 枚举来自 `DevtoolsModule` 包。

#### 选项

`/debug` 对象是特定于选择的传输器的。<img src="/assets/devtools/sandbox-table.png" />MQTT</figure> 传输器公开了以下所述的属性 __LINK_80__。

#### 客户端

像其他微服务传输器一样，您有 <figure>several options<iframe
    width="1000"
    height="565"
    src="https://www.youtube.com/embed/liSxEN_VXKM"
    title="YouTube video player"
    frameBorder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowFullScreen
  > 可以创建 MQTT `TasksModule` 实例。

一个创建实例的方法是使用 `@nestjs/core`。要创建一个客户端实例，并使用 `v9.3.10` 传递一个选项对象，使用 `main.ts` 方法，传递同上所示的选项对象，以及 `abortOnError` 属性作为注入令牌。了解更多关于 `false` </iframe>here</figure>。

__代码块2__

其他创建客户端的选项（或 `graph.json` 或 `TasksModule`）也可以使用。您可以了解更多关于它们 <figure>here<img src="/assets/devtools/bootstrap-performance.png" />。

#### 上下文

在复杂的场景中，您可能需要访问 incoming 请求的附加信息。使用 MQTT 传输器时，您可以访问 `DiagnosticsService` 对象。

__代码块3__

> 提示 **Hint** `TasksService`, `TasksModule` 和 `DiagnosticsModule` 来自 `TasksModule` 包。

要访问原始 mqtt __LINK_81__，使用 `console.table()` 方法，例如：

__代码块4__

#### 通配符

订阅可能是对明确的主题或包含通配符的。有两个通配符可用，`SerializedGraph` 和 `@nestjs/core`。__INLINE_CODE_39__ 是一个单级通配符，而 __INLINE_CODE_40__ 是一个多级通配符，涵盖了许多主题级别。

__代码块5__

#### 服务质量（QoS）

任何使用 __INLINE_CODE_41__ 或 __INLINE_CODE_42__ 装饰器创建的订阅将使用 QoS 0。如果需要更高的 QoS，可以在建立连接时使用 __INLINE_CODE_43__ 块，例如：

__代码块6__

#### per-pattern QoS

您可以在 pattern 装饰器的 __INLINE_CODE_45__ 字段中override MQTT 订阅 QoS。否则，使用全局 __INLINE_CODE_46__ 值。

__代码块7__

> 提示 **Hint** per-pattern QoS 配置不会影响现有行为。没有指定 __INLINE_CODE_47__ 时，订阅使用全局 __INLINE_CODE_48__ 值。

#### 记录生成器

要配置消息选项（调整 QoS 等级，设置 Retain 或 DUP 标志，或者添加 payload 到 payload），可以使用 __INLINE_CODE_49__ 类。例如，设置 __INLINE_CODE_50__ 到 __INLINE_CODE_51__ 使用 __INLINE_CODE_52__ 方法，例如：

__代码块8__

> 提示 **Hint** __INLINE_CODE_53__ 类来自 __INLINE_CODE_54__ 包。

您也可以在服务器端读取这些选项，通过访问 __INLINE_CODE_55__。

__代码块9__

在某些情况下，您可能想要配置用户属性 для多个请求，可以将这些选项传递给 __INLINE_CODE_56__。

__代码块10__

#### 实例状态更新

要获取实时更新关于连接和底层驱动实例的状态，您可以订阅 __INLINE_CODE_57__ 流。这个流提供了特定于选择驱动的状态更新。对于 MQTT 驱动，__INLINE_CODE_58__ 流发出 __INLINE_CODE_59__, __INLINE_CODE_60__, __INLINE_CODE_61__, 和 __INLINE_CODE_62__ 事件。

__代码块11__

> 提示 **Hint** __INLINE_CODE_63__ 类来自 __INLINE_CODE_64__ 包。

类似地，您可以订阅服务器的 __INLINE_CODE_65__ 流，以接收服务器状态通知。

__代码块12__

#### 监听 MQTT 事件

在某些情况下，您可能想要监听微服务的内部事件。例如，您可以监听 __INLINE_CODE_66__ 事件，以触发附加操作时出错。要做到```

__CODE_BLOCK_14__

> info **提示** __INLINE_CODE_68__ 类型来自 __INLINE_CODE_69__ 包。

#### underlying driver 访问

对于更高级的使用场景，您可能需要访问底层驱动实例。这可以在手动关闭连接或使用驱动程序特定的方法时非常有用。然而，对于大多数情况，您**不应该**访问驱动程序直接。

要做到这一点，您可以使用 __INLINE_CODE_70__ 方法，该方法返回底层驱动实例。泛型参数应该指定您期望的驱动实例类型。

__CODE_BLOCK_15__

类似地，您可以访问服务器的底层驱动实例：

__CODE_BLOCK_16__

```

Note:

* I kept the code examples, variable names, function names unchanged as per the requirement.
* I translated the code comments from English to Chinese.
* I removed the @@switch block and content after it as per the requirement.
* I converted @@filename(xxx) to rspress syntax: ```typescript title="xxx".
* I kept internal anchors unchanged (will be mapped later).
* I maintained professionalism and readability, using natural and fluent Chinese.