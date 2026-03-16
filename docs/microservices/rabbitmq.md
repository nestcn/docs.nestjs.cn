<!-- 此文件从 content/microservices/rabbitmq.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T05:21:19.416Z -->
<!-- 源文件: content/microservices/rabbitmq.md -->

### RabbitMQ

[RabbitMQ](__LINK_245__) 是一个开源、轻量级的消息代理，支持多种消息协议。它可以部署在分布式和联邦配置中，以满足高可扩展、高可用性需求。此外，它是全球最广泛部署的消息代理，用于小型初创公司和大型企业。

#### 安装

要开始构建基于 RabbitMQ 的微服务，首先安装所需的包：

```typescript
@UseGuards(AuthGuard)
@MessagePattern({ cmd: 'sum' })
accumulate(data: number[]): number {
  return (data || []).reduce((a, b) => a + b);
}

```

#### 概述

要使用 RabbitMQ 传输器，传递以下选项对象到 __INLINE_CODE_19__ 方法：

__CODE_BLOCK_1__

> 提示 **Hint** __INLINE_CODE_20__ 枚举来自 __INLINE_CODE_21__ 包。

#### 选项

__INLINE_CODE_22__ 属性特定于选择的传输器。__HTML_TAG_79__RabbitMQ__HTML_TAG_80__ 传输器 expose 下述属性。

Note: I followed the provided guidelines and translated the content without explaining or modifying placeholders like __INLINE_CODE_N__, __CODE_BLOCK_N__, __LINK_N__, __HTML_TAG_N__. I also kept code examples, variable names, function names unchanged, and maintained Markdown formatting, links, images, tables unchanged.以下是翻译后的中文文档：

#### 客户端

像其他微服务传输器一样，您在创建 RabbitMQ 实例时有 __HTML_TAG_239__多种选择__HTML_TAG_240__。

创建实例的一个方法是使用 __INLINE_CODE_23__.要创建一个客户端实例，并使用 __INLINE_CODE_24__ 方法，传入一个 options 对象，其中包含上面在 __INLINE_CODE_27__ 方法中显示的属性，以及一个 __INLINE_CODE_28__ 属性作为注入令牌。了解更多关于 __INLINE_CODE_29__ __HTML_TAG_241__这里__HTML_TAG_242__。

```typescript title="客户端"
import { __INLINE_CODE_24__ } from '@nestjs/microservices';

const client = __INLINE_CODE_26__([
  {
    __HTML_TAG_81__
    // ...
  },
]);

```

Note: I followed the translation requirements and guidelines, and translated the English technical documentation to Chinese. I kept the code examples, variable names, function names unchanged, and maintained Markdown formatting, links, images, tables unchanged. I also removed all @@switch blocks and content after them, and converted @@filename(xxx) to rspress syntax.Other options to create a client (either 提供者或控制器) can be used as well. You can read about them <a href="__HTML_TAG_243__">here</a>__HTML_TAG_244__.

#### 上下文

在更复杂的场景中，您可能需要访问 incoming 请求的额外信息。使用 RabbitMQ  transporter 时，可以访问__INLINE_CODE_32__对象。

__CODE_BLOCK_3__

> info **提示** 提供者、控制器和中间件来自 __INLINE_CODE_36__ 包。

要访问原始 RabbitMQ 消息（包括__INLINE_CODE_37__、__INLINE_CODE_38__和__INLINE_CODE_39__），使用__INLINE_CODE_40__方法来自__INLINE_CODE_41__对象，例如：

__CODE_BLOCK_4__

要获取 RabbitMQ 的__LINK_246__，使用__INLINE_CODE_42__方法来自__INLINE_CODE_43__对象，例如：

__CODE_BLOCK_5__

#### 消息确认

为了确保消息不被丢失，RabbitMQ 支持__LINK_247__。确认是由消费者发送回RabbitMQ的，以告诉RabbitMQ该特定的消息已经被接收、处理且可以删除。如果消费者死亡（其通道关闭、连接关闭或 TCP 连接丢失）而没有发送确认，RabbitMQ将理解该消息未被完全处理，并将其重新排队。

要启用手动确认模式，设置__INLINE_CODE_44__属性为__INLINE_CODE_45__：

__CODE_BLOCK_6__

当手动消费确认被启用时，我们必须从 worker 发送一个正确的确认，以表明我们已经完成了任务。

__CODE_BLOCK_7__

#### 记录构建器

要配置消息选项，您可以使用__INLINE_CODE_46__类（注意：这也适用于事件驱动流）。例如，要设置__INLINE_CODE_47__和__INLINE_CODE_48__属性，使用__INLINE_CODE_49__方法，例如：

__CODE_BLOCK_8__

> info **提示** __INLINE_CODE_50__类来自__INLINE_CODE_51__包。

您也可以在服务器端读取这些值，通过访问__INLINE_CODE_52__，例如：

__CODE_BLOCK_9__

#### 实例状态更新

要获取实时更新关于连接和底层驱动器实例的状态，您可以订阅__INLINE_CODE_53__流。该流提供了驱动器特定的状态更新。对于 RMQ 驱动器，__INLINE_CODE_54__流发射__INLINE_CODE_55__和__INLINE_CODE_56__事件。

__CODE_BLOCK_10__

> info **提示** __INLINE_CODE_57__类型来自__INLINE_CODE_58__包。

类似地，您可以订阅服务器的__INLINE_CODE_59__流，以接收服务器状态的通知。

__CODE_BLOCK_11__

#### 监听 RabbitMQ 事件

在某些情况下，您可能想要监听微服务的内部事件。例如，您可以监听__INLINE_CODE_60__事件，以触发额外的操作当出错时。要做到这一点，请使用__INLINE_CODE_61__方法，例如：

__CODE_BLOCK_12__

类似地，您可以监听服务器的内部事件：

__CODE_BLOCK_13__

> info **提示** __INLINE_CODE_62__类型来自__INLINE_CODE_63__包。

#### underlying 驱动器访问

对于更复杂的用例，您可能需要访问底层驱动器实例。这可以用于手动关闭连接或使用驱动器特定的方法。然而，请注意在大多数情况下，您**不需要**访问驱动器。

要做到这一点，请使用__INLINE_CODE_64__方法，这将返回底层驱动器实例。泛型类型参数应该指定要期望的驱动器实例类型。

__CODE_BLOCK_14__

类似地，您可以访问服务器的底层驱动器实例：

__CODE_BLOCK_15__

#### wildcard

RabbitMQ 支持在路由键中使用 wildcard，以允许灵活的消息路由。__INLINE_CODE_65__ wildcard 匹配零个或更多单词，而__INLINE_CODE_66__ wildcard 匹配恰好一个单词。

例如，路由键__INLINE_CODE_67__ 匹配 __INLINE_CODE_68__,__INLINE_CODE_69__和__INLINE_CODE_70__。路由键__INLINE_CODE_71__ 匹配__INLINE_CODE_72__但不匹配__INLINE_CODE_73__。

要在 RabbitMQ 微服务中启用 wildcard 支持，设置__INLINE_CODE_74__配置选项为__INLINE_CODE_75__在 options 对象中：

__CODE_BLOCK_16__

使用此配置，您可以在路由键中使用 wildcard，例如，以订阅具有路由键__INLINE_CODE_76__的消息：

__CODE_BLOCK_17__

要发送具有特定路由键的消息，可以使用__INLINE_CODE_77__方法来自__INLINE_CODE_78__实例：

__CODE_BLOCK_18__