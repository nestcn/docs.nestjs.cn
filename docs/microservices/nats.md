<!-- 此文件从 content/microservices/nats.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-03T04:16:02.801Z -->
<!-- 源文件: content/microservices/nats.md -->

### NATS

__LINK_95__是一个简单、安全、高性能的开源消息系统，用于云原生应用、IoT 消息和微服务架构。NATS 服务器是使用 Go 语言编写的，但是客户端库可用于多种主要编程语言。NATS 支持 both **At Most Once** 和 **At Least Once** 发送。它可以在大型服务器、云实例、边缘网关和 Internet of Things 设备等任何地方运行。

#### 安装

要开始构建基于 NATS 的微服务，首先安装所需的包：

```typescript
resolve: { // see: https://webpack.js.org/configuration/resolve/
  alias: {
      "@nestjs/graphql": path.resolve(__dirname, "../node_modules/@nestjs/graphql/dist/extra/graphql-model-shim")
  }
}
```

#### 概述

要使用 NATS 传输器，传递以下选项对象到 __INLINE_CODE_15__ 方法：

__CODE_BLOCK_1__

> info **提示** __INLINE_CODE_16__ 枚举来自 __INLINE_CODE_17__ 包。

#### 选项

__INLINE_CODE_18__ 对象特定于选定的传输器。NATS 传输器 exposes 以下属性：

__HTML_TAG_55__NATS__HTML_TAG_56__
  __HTML_TAG_57__
  __HTML_TAG_58__
    __HTML_TAG_59____HTML_TAG_60__queue__HTML_TAG_61____HTML_TAG_62__
  __HTML_TAG_63__ 
  __HTML_TAG_64__
  __HTML_TAG_65__
    __HTML_TAG_66____HTML_TAG_67__gracefulShutdown__HTML_TAG_68____HTML_TAG_69__
  __HTML_TAG_70__
  __HTML_TAG_71__
    __HTML_TAG_72____HTML_TAG_73__gracePeriod__HTML_TAG_74____HTML_TAG_75__
  __HTML_TAG_76__
__HTML_TAG_77__

#### 客户端

像其他微服务传输器一样，你有 __HTML_TAG_89__several options__HTML_TAG_90__ 创建 NATS __INLINE_CODE_19__ 实例。

一种创建实例的方法是使用 __INLINE_CODE_20__. 创建客户端实例并使用 __INLINE_CODE_21__ 方法传递与上述 __INLINE_CODE_23__ 方法相同的选项对象，以及 __INLINE_CODE_24__ 属性作为注入令牌。阅读更多关于 __INLINE_CODE_25__ __HTML_TAG_91__here__HTML_TAG_92__。

__CODE_BLOCK_2__

其他创建客户端的选项（__INLINE_CODE_26__ 或 __INLINE_CODE_27__）也可以使用。阅读更多关于它们 __HTML_TAG_93__here__HTML_TAG_94__。

#### 请求-响应

对于 **请求-响应** 消息样式 (__LINK_97__), NATS 传输器不使用 NATS 内置 __LINK_98__ 机制。相反，使用 __INLINE_CODE_28__ 方法发布给定主题的请求，并将回复主题名称发送到回复主题。回复主题会动态地将回复发送回请求数據。

#### 事件驱动

对于 **事件驱动** 消息样式 (__LINK_99__), NATS 传输器使用 NATS 内置 __LINK_100__ 机制。发布者发送消息到主题，并任何活动订阅者监听该主题将接收消息。订阅者也可以注册对 wildcard 主题的兴趣，这些主题有点像正则表达式。这一种到多种模式有