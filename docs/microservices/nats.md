<!-- 此文件从 content/microservices/nats.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-02T04:14:58.754Z -->
<!-- 源文件: content/microservices/nats.md -->

### NATS

__LINK_95__ 是一个简单、安全和高性能的开源消息系统，用于云原生应用程序、物联网消息传输和微服务架构。NATS 服务器是使用 Go 语言编写的，但可以使用多种主要编程语言的客户端库与服务器交互。NATS 支持 both __LINK_102__ 和 __LINK_103__ 发送。它可以在大型服务器、云实例、边缘网关和物联网设备上运行。

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

要使用 NATS 传输器，通过将以下选项对象传递给 __INLINE_CODE_15__ 方法：

__CODE_BLOCK_1__

> 信息 **提示** __INLINE_CODE_16__ 枚举来自 __INLINE_CODE_17__ 包。

#### 选项

__INLINE_CODE_18__ 对象特定于选择的传输器。__HTML_TAG_55__NATS__HTML_TAG_56__ 传输器暴露了 __LINK_96__ 中描述的属性，以及以下属性：

__HTML_TAG_57__
  __HTML_TAG_58__
    __HTML_TAG_59____HTML_TAG_60__queue__HTML_TAG_61____HTML_TAG_62__
    __HTML_TAG_63__Queue that your server should subscribe to (leave __HTML_TAG_64__undefined__HTML_TAG_65__ to ignore this setting). Read more about NATS queue groups __HTML_TAG_66__below__HTML_TAG_67__.
    __HTML_TAG_68__ 
  __HTML_TAG_69__
  __HTML_TAG_70__
    __HTML_TAG_71____HTML_TAG_72__gracefulShutdown__HTML_TAG_73____HTML_TAG_74__
    __HTML_TAG_75__Enables graceful shutdown. When enabled, the server first unsubscribes from all channels before closing the connection. Default is __HTML_TAG_76__false__HTML_TAG_77__.
  __HTML_TAG_78__
  __HTML_TAG_79__
    __HTML_TAG_80____HTML_TAG_81__gracePeriod__HTML_TAG_82____HTML_TAG_83__
    __HTML_TAG_84__Time in milliseconds to wait for the server after unsubscribing from all channels. Default is __HTML_TAG_85__10000__HTML_TAG_86__ ms.
  __HTML_TAG_87__
__HTML_TAG_88__

#### 客户端

像其他微服务传输器一样，你有 __HTML_TAG_89__several options__HTML_TAG_90__ for creating a NATS __INLINE_CODE_19__ instance.

One method for creating an instance is to use the __INLINE_CODE_20__. To create a client instance with the __INLINE_CODE_21__, import it and use the __INLINE_CODE_22__ method to pass an options object with the same properties shown above in the __INLINE_CODE_23__ method, as well as a __INLINE_CODE_24__ property to be used as the injection token. Read more about __INLINE_CODE_25__ __HTML_TAG_91__here__HTML_TAG_92__.

__CODE_BLOCK_2__

Other options to create a client (either __INLINE_CODE_26__ or __INLINE_CODE_27__) can be used as well. You can read about them __HTML_TAG_93__here__HTML_TAG_94__.

#### 请求