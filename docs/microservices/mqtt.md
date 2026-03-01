<!-- 此文件从 content/microservices/mqtt.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-01T04:23:34.331Z -->
<!-- 源文件: content/microservices/mqtt.md -->

### MQTT

__LINK_79__ (Message Queuing Telemetry Transport) 是一种开源、轻量级的消息传输协议，优化了低延迟性能。该协议提供了一种可扩展、低成本的方式来连接设备，使用一种 **发布/订阅** 模型。 MQTT 通信系统由发布服务器、代理服务器和一个或多个客户端组成。它旨在为受限设备和低带宽、高延迟或不可靠网络设计。

#### 安装

要开始构建基于 MQTT 的微服务，首先安装所需的包：

```typescript
import { ApolloServerPlugin, GraphQLRequestListener } from '@apollo/server';
import { Plugin } from '@nestjs/apollo';

@Plugin()
export class LoggingPlugin implements ApolloServerPlugin {
  async requestDidStart(): Promise<GraphQLRequestListener<any>> {
    console.log('Request started');
    return {
      async willSendResponse() {
        console.log('Will send response');
      },
    };
  }
}
```

#### 概述

要使用 MQTT 传输器，传递以下选项对象给 __INLINE_CODE_17__ 方法：

```typescript
@Module({
  providers: [LoggingPlugin],
})
export class CommonModule {}
```

> info **提示** __INLINE_CODE_18__ 枚举来自 __INLINE_CODE_19__ 包。

#### 选项

__INLINE_CODE_20__ 对象特定于选择的传输器。__HTML_TAG_71__MQTT__HTML_TAG_72__ 传输器公开了描述在 __LINK_80__ 中的属性。

#### 客户端

像其他微服务传输器一样，您可以使用 __HTML_TAG_73__several options__HTML_TAG_74__ 创建一个 MQTT __INLINE_CODE_21__ 实例。

一种创建实例的方法是使用 __INLINE_CODE_22__。要创建一个客户端实例，使用 __INLINE_CODE_23__，并使用 __INLINE_CODE_24__ 方法传递同上所示的选项对象，以及一个 __INLINE_CODE_26__ 属性作为注入令牌。了解更多关于 __INLINE_CODE_27__ __HTML_TAG_75__here__HTML_TAG_76__。

```typescript
GraphQLModule.forRoot({
  // ...
  plugins: [ApolloServerOperationRegistry({ /* options */})]
}),
```

其他创建客户端的选项（例如 __INLINE_CODE_28__ 或 __INLINE_CODE_29__）也可以使用。了解更多关于它们 __HTML_TAG_77__here__HTML_TAG_78__。

#### 上下文

在更复杂的场景中，您可能需要访问 incoming 请求的额外信息。当使用 MQTT 传输器时，您可以访问 __INLINE_CODE_30__ 对象。

```typescript
GraphQLModule.forRoot({
  driver: MercuriusDriver,
  // ...
  plugins: [
    {
      plugin: cache,
      options: {
        ttl: 10,
        policy: {
          Query: {
            add: true
          }
        }
      },
    }
  ]
}),
```

> info **提示** __INLINE_CODE_31__, __INLINE_CODE_32__ 和 __INLINE_CODE_33__来自 __INLINE_CODE_34__ 包。

要访问原始 MQTT __LINK_81__，使用 __INLINE_CODE_35__ 方法，如下所示：

__CODE_BLOCK_4__

#### Wildcards

订阅可能是指向明确主题的，或者包括通配符。有两个通配符可用，__INLINE_CODE_37__ 和 __INLINE_CODE_38__。 __INLINE_CODE_39__ 是单级通配符，而 __INLINE_CODE_40__ 是多级通配符，涵盖多个主题级别。

__CODE_BLOCK_5__

#### 服务质量 (QoS)

任何使用 __INLINE_CODE_41__ 或 __INLINE_CODE_42__ 装饰器创建的订阅将使用 QoS 0。如果需要更高的 QoS，可以使用 __INLINE_CODE_43__ 块在建立连接时设置，例如：

__CODE_BLOCK_6__

#### 每个模式 QoS

可以在模式装饰器的 __INLINE_CODE_45__ 字段中override MQTT 订阅 QoS。否则，使用全局 __INLINE_CODE_46__ 值作为默认值。

__CODE_BLOCK_7__

> info **提示** 每个模式 QoS 配置不影响现有行为。当 __INLINE_CODE_47__ 未指定时，订阅使用全局 __INLINE_CODE_48__ 值。

#### 记录 builders

要配置消息选项（调整 QoS 水平，设置 Retain 或 DUP 标志，或者将附加属性添加到 payload 中），可以使用 __INLINE_CODE_49__ 类。例如，要将 __INLINE_CODE_50__ 设置为 __INLINE_CODE_51__，使用 __INLINE_CODE_52__ 方法，例如：

__CODE_BLOCK_8__

> info **提示** __INLINE_CODE_53__ 类来自 __INLINE_CODE_54__ 包。

您也可以在服务器端读取这些选项，通过访问 __INLINE_CODE_55__。

__CODE_BLOCK_9__

在某些情况下，您可能想要为多个请求配置用户属性，可以将这些选项传递给 __INLINE_CODE_56__。

__CODE_BLOCK_10__

#### 实例状态更新

要获取实时更新关于连接和底层驱动实例的状态，可以订阅 __INLINE_CODE_57