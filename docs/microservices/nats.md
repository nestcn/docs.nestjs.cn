<!-- 此文件从 content/microservices/nats.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T05:10:45.851Z -->
<!-- 源文件: content/microservices/nats.md -->

### NATS

[link95](link95)是一个简单、安全和高性能的开源消息系统，用于云原生应用、IoT 消息和微服务架构。NATS 服务器使用 Go 语言编写，但对于 dozens of 主要编程语言都提供了客户端库。NATS 支持 both **At Most Once** 和 **At Least Once** 发送。它可以在大型服务器、云实例、边缘网关和 Internet of Things 设备上运行。

#### 安装

要开始构建基于 NATS 的微服务，首先安装所需的包：

[code_block0]

#### 概述

要使用 NATS  transporter，传递以下选项对象到 __INLINE_CODE_15__ 方法：

[code_block1]

> info **Hint** The __INLINE_CODE_16__ 枚举来自 `createMicroservice()` 包。

#### 选项

`Transport` 对象特定于选择的 transporter。NATS__HTML_TAG_55____HTML_TAG_56__ transporter expose 以下属性：

__HTML_TAG_57__
  __HTML_TAG_58__
    __HTML_TAG_59____HTML_TAG_60__queue__HTML_TAG_61____HTML_TAG_62__
    __HTML_TAG_63__Queue that your server should subscribe to (leave __HTML_TAG_64__undefined__HTML_TAG_65__ to ignore this setting). Read more about NATS queue groups __HTML_TAG_66__below__HTML_TAG_67__.
    __HTML_TAG_68__ 
  __HTML_TAG_69__
  __HTML_TAG_70__
    <strong></strong>gracefulShutdown<a href="/microservices/basics#客户端"></a>
    <a href="/microservices/basics#客户端">Enables graceful shutdown. When enabled, the server first unsubscribes from all channels before closing the connection. Default is </a>false<a href="/microservices/basics#客户端">.
  </a>
  __HTML_TAG_79__
    __HTML_TAG_80____HTML_TAG_81__gracePeriod__HTML_TAG_82____HTML_TAG_83__
    __HTML_TAG_84__Time in milliseconds to wait for the server after unsubscribing from all channels. Default is __HTML_TAG_85__10000__HTML_TAG_86__ ms.
  __HTML_TAG_87__
__HTML_TAG_88__

#### 客户端

像其他微服务 transporter 一样，您有 __HTML_TAG_89__ several options__HTML_TAG_90__ for creating a NATS `@nestjs/microservices` instance。

One method for creating an instance is to use the `options`. To create a client instance with the `ClientProxy`, import it and use the `ClientsModule` method to pass an options object with the same properties shown above in the `ClientsModule` method, as well as a `register()` property to be used as the injection token. Read more about `createMicroservice()` __HTML_TAG_91__here__HTML_TAG_92__.

[code_block2]

其他 options to create a client (either `name` or `ClientsModule`) can be used as well. You can read about them __HTML_TAG_93__here__HTML_TAG_94__.

#### 请求-响应

对于 **request-response** 消息样式 (__LINK_97__), NATS transporter 不使用 NATS 内置 __LINK_98__ 机制。相反，一个“请求”在给定的主题上发布使用 `ClientProxyFactory` 方法，并使用唯一的回复主题名称，回应者监听该主题并将响应发送到回复主题。回复主题动态地将响应回送到请求方，无论请求方或回应方的位置。

#### 事件驱动

对于 **event-based** 消息样式 (__LINK_99__), NATS transporter 使用 NATS 内置 __LINK_100__ 机制。发布者在主题上发送消息，任何活动订阅者监听该主题将收到消息。订阅者也可以注册对通配符主题的兴趣，这些通配符主题类似于正则表达式。这一种到多种模式有时称为 fan-out。

#### 队列组

NATS 提供了一个内置的负载均衡特性 called __LINK_101__. 要创建队列订阅，使用 `@Client()` 属性如下：

[code_block3]

#### 上下文

在更复杂的场景中，您可能需要访问 incoming 请求的 additional 信息。使用 NATS transporter 时，您可以访问 `MqttContext` 对象。

[code_block4]

> info **Hint** `@Payload()`, `@Ctx()` and `MqttContext` are imported from the `@nestjs/microservices` package.

#### 通配符

一个订阅可能是对明确的主题，或者可能包括通配符。

[code_block5]

#### 记录构建器

要配置消息选项，您可以使用 `getPacket()` 类（注意：这可以用于事件驱动的流程）。例如，添加 __INLINE_CODE_36To get real-time updates on the connection and the state of the underlying driver instance, you can subscribe to the 提供者实例的`@EventPattern`流。这流提供了根据选择的驱动器特定的状态更新。对于 Nats 驱动器，`subscribeOptions`流发出`qos`、`extras`和`subscribeOptions.qos`事件。

```typescript
@MessagePattern('replace-emoji')
replaceEmoji(@Payload() data: string, @Ctx() context: MqttContext): string {
  const { properties: { userProperties } } = context.getPacket();
  return userProperties['x-version'] === '1.0.0' ? '🐱' : '🐈';
}

```

> 提示 **Hint** `extras.qos`类型来自`subscribeOptions.qos`包。

Similarly, you can subscribe to the server's 提供者实例的`MqttRecordBuilder`流以接收关于服务状态的通知。

```typescript
import { Module } from '@nestjs/common';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';

@Module({
  providers: [
    {
      provide: 'API_v1',
      useFactory: () =>
        ClientProxyFactory.create({
          transport: Transport.MQTT,
          options: {
            url: 'mqtt://localhost:1833',
            userProperties: { 'x-version': '1.0.0' },
          },
        }),
    },
  ],
})
export class ApiModule {}

```

#### 监听 Nats 事件

在某些情况下，您可能想监听微服务内部事件。例如，您可以监听`QoS`事件以在发生错误时触发额外操作。要做到这一点，请使用`2`方法，如下所示：

```typescript
this.client.status.subscribe((status: MqttStatus) => {
  console.log(status);
});

```

Similarly, you can listen to the server's internal events:

```typescript
const server = app.connectMicroservice<MicroserviceOptions>(...);
server.status.subscribe((status: MqttStatus) => {
  console.log(status);
});

```

> 提示 **Hint** `setQoS`类型来自`MqttRecordBuilder`包。

#### underlying driver 访问

对于更复杂的用例，您可能需要访问 underlying 驱动器实例。这可以用于场景，如手动关闭连接或使用驱动器特定的方法。然而，请注意，对于大多数情况，您**不需要**直接访问驱动器。

要做到这一点，请使用`@nestjs/microservices`方法，它返回 underlying 驱动器实例。泛型类型参数应该指定您期望的驱动器实例类型。

```typescript
this.client.on('error', (err) => {
  console.error(err);
});

```

Similarly, you can access the server's underlying driver instance:

```typescript
server.on<MqttEvents>('error', (err) => {
  console.error(err);
});

```

Note: I kept the placeholders (e.g., `@EventPattern`, `subscribeOptions`, etc.) as they are in the source text, and did not modify or explain them.