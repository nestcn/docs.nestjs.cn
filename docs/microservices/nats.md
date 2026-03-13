<!-- 此文件从 content/microservices/nats.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T05:05:53.674Z -->
<!-- 源文件: content/microservices/nats.md -->

### NATS

__LINK_95__是一个简单、安全、高性能的开源消息系统，用于云原生应用、IoT 消息和微服务架构。NATS 服务器使用 Go 编程语言编写，但是客户端库可以与服务器交互，支持多种主要编程语言。NATS 支持 both **At Most Once** 和 **At Least Once** 发送。它可以在大型服务器和云实例、边缘网关和 IoT 设备等所有地方运行。

#### 安装

要开始构建基于 NATS 的微服务，首先安装所需的包：

```bash
$ npm i --save mqtt

```

#### 概述

要使用 NATS 传输器，传递以下 options 对象到 __INLINE_CODE_15__ 方法：

```typescript
const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
  transport: Transport.MQTT,
  options: {
    url: 'mqtt://localhost:1883',
  },
});

```

> info **提示** __INLINE_CODE_16__ 枚举来自 `createMicroservice()` 包。

#### 选项

`Transport` 对象特定于所选的传输器。NATS 传输器 __HTML_TAG_55__NATS__HTML_TAG_56__ expose 以下属性：

__HTML_TAG_57__
  __HTML_TAG_58__
    __HTML_TAG_59____HTML_TAG_60__queue__HTML_TAG_61____HTML_TAG_62__
    __HTML_TAG_63__Queue your server should subscribe to (leave __HTML_TAG_64__undefined__HTML_TAG_65__ to ignore this setting). Read more about NATS queue groups __HTML_TAG_66__below__HTML_TAG_67__.
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

像其他微服务传输器一样，您有 __HTML_TAG_89__多种选择__HTML_TAG_90__来创建 NATS `@nestjs/microservices` 实例。

一个方法是使用 `options`。要创建一个客户端实例，使用 `ClientProxy`，并将 options 对象传递给 `ClientsModule` 方法，包括上述相同的属性，以及一个 `register()` 属性作为注入令牌。了解更多关于 `createMicroservice()` __HTML_TAG_91__here__HTML_TAG_92__。

```typescript
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'MATH_SERVICE',
        transport: Transport.MQTT,
        options: {
          url: 'mqtt://localhost:1883',
        }
      },
    ]),
  ]
  ...
})

```

其他创建客户端的选项（例如 `name` 或 `ClientsModule`）也可以使用。了解更多关于它们 __HTML_TAG_93__here__HTML_TAG_94__。

#### 请求-响应

对于 **request-response** 消息样式 (__LINK_97__), NATS 传输器不使用 NATS 内置 __LINK_98__ 机制。在发送请求时，使用 `ClientProxyFactory` 方法发布给定主题，并使用唯一的回复主题名称，响应者监听该主题并将回复发送到回复主题。回复主题动态地将回复返回到请求方，无论请求方或响应方的位置。

#### 事件- based

对于 **event-based** 消息样式 (__LINK_99__), NATS 传输器使用 NATS 内置 __LINK_100__ 机制。发布者将消息发送到主题，任何活动订阅者监听该主题将收到该消息。订阅者也可以注册对通配符主题的兴趣，这些主题类似于正则表达式。这一种模式有时称为 fan-out。

#### 队列组

NATS 提供了一个内置负载均衡功能称为 __LINK_101__。创建队列订阅时，使用 `@Client()` 属性如下：

```typescript
@MessagePattern('notifications')
getNotifications(@Payload() data: number[], @Ctx() context: MqttContext) {
  console.log(`Topic: ${context.getTopic()}`);
}

```

#### 上下文

在复杂的情况下，您可能需要访问 incoming 请求的更多信息。当使用 NATS 传输器时，可以访问 `MqttContext` 对象。

```typescript
@MessagePattern('notifications')
getNotifications(@Payload() data: number[], @Ctx() context: MqttContext) {
  console.log(context.getPacket());
}

```

> info **提示** `@Payload()`, `@Ctx()` 和 `MqttContext` 来自 `@nestjs/microservices` 包。

#### 野卡

订阅可能是对明确的主题，或者可能包括通配符。

```typescript
@MessagePattern('sensors/+/temperature/+')
getTemperature(@Ctx() context: MqttContext) {
  console.log(`Topic: ${context.getTopic()}`);
}

```

#### 记录构建器

要配置消息选项，可以使用 `getPacket()` 类（注意：这是可以用于事件- based 消息流的）。例如，要添加 `MqttContext` 头，为了实时获取连接和底层驱动实例的状态，可以订阅 `@EventPattern` 流式传输。这条流式传输提供了与所选驱动器相关的状态更新。对于NATS驱动器，`subscribeOptions` 流式传输 emit `qos`、`extras` 和 `subscribeOptions.qos` 事件。

```typescript
@MessagePattern('replace-emoji')
replaceEmoji(@Payload() data: string, @Ctx() context: MqttContext): string {
  const { properties: { userProperties } } = context.getPacket();
  return userProperties['x-version'] === '1.0.0' ? '🐱' : '🐈';
}

```

> 信息 **提示** `extras.qos` 类型来自 `subscribeOptions.qos` 包。

类似地，您可以订阅服务器的 `MqttRecordBuilder` 流式传输，以接收服务器状态的通知。

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

在某些情况下，您可能想监听微服务内部 emit 的事件。例如，您可以监听 `QoS` 事件，以在错误发生时触发额外操作。要这样做，请使用 `2` 方法，如下所示：

```typescript
this.client.status.subscribe((status: MqttStatus) => {
  console.log(status);
});

```

类似地，您可以监听服务器的内部事件：

```typescript
const server = app.connectMicroservice<MicroserviceOptions>(...);
server.status.subscribe((status: MqttStatus) => {
  console.log(status);
});

```

> 信息 **提示** `setQoS` 类型来自 `MqttRecordBuilder` 包。

#### 底层驱动器访问

对于更复杂的使用场景，您可能需要访问底层驱动器实例。这可以在手动关闭连接或使用驱动器特定方法时非常有用。但请注意，对于大多数情况，您 **不需要** 直接访问驱动器。

要这样做，可以使用 `@nestjs/microservices` 方法，它返回底层驱动器实例。泛型类型参数应该指定您期望的驱动器实例类型。

```typescript
this.client.on('error', (err) => {
  console.error(err);
});

```

类似地，您可以访问服务器的底层驱动器实例：

```typescript
server.on<MqttEvents>('error', (err) => {
  console.error(err);
});

```

Note: I kept the placeholders `@EventPattern`, `subscribeOptions`, `qos`, `extras`, `subscribeOptions.qos`, `extras.qos`, `subscribeOptions.qos`, `MqttRecordBuilder`, `QoS`, `2`, `setQoS`, `MqttRecordBuilder`, and `@nestjs/microservices` unchanged as per the requirements.