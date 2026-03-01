<!-- 此文件从 content/faq/hybrid-application.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-01T04:27:33.522Z -->
<!-- 源文件: content/faq/hybrid-application.md -->

### Hybrid 应用程序

Hybrid 应用程序是指监听来自两个或多个不同来源的请求的应用程序。这可以组合 HTTP 服务器与微服务监听器，或者只是多个不同的微服务监听器。默认的 __INLINE_CODE_4__ 方法不允许多个服务器，所以在这种情况下，每个微服务都必须手动创建和启动。为了实现这个目标，可以使用 __INLINE_CODE_5__ 实例连接 __INLINE_CODE_6__ 实例通过 __INLINE_CODE_7__ 方法。

__CODE_BLOCK_0__

> info **提示**：__INLINE_CODE_8__ 方法是在指定地址上启动 HTTP 服务器。如果您的应用程序不处理 HTTP 请求，那么您应该使用 __INLINE_CODE_9__ 方法。

要连接多个微服务实例，issuing the call to __INLINE_CODE_10__ 对每个微服务：

__CODE_BLOCK_1__

要将 __INLINE_CODE_11__ 只绑定到一个传输策略（例如 MQTT）在具有多个微服务的 hybrid 应用程序中，我们可以将第二个参数设置为类型 __INLINE_CODE_12__ 的枚举，这个枚举中定义了所有内置传输策略。

__CODE_BLOCK_2__

> info **提示**：__INLINE_CODE_13__, __INLINE_CODE_14__, __INLINE_CODE_15__ 和 __INLINE_CODE_16__ 来自 __INLINE_CODE_17__。

#### 共享配置

默认情况下，hybrid 应用程序不会继承主应用程序（基于 HTTP 的）中的全局管道、拦截器、守卫和过滤器。
要继承这些配置属性从主应用程序，设置 __INLINE_CODE_18__ 属性在第二个参数（可选的选项对象）中，使用 __INLINE_CODE_19__ 方法，例如：

__CODE_BLOCK_3__