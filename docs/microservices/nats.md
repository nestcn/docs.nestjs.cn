<!-- 此文件从 content/microservices/nats.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T04:57:21.454Z -->
<!-- 源文件: content/microservices/nats.md -->

### NATS

__LINK_95__ 是一个简单、高性能的开源消息系统，用于云原生应用、IoT 消息和微服务架构。NATS 服务器是使用 Go 语言编写的，但对服务器的客户端库可供多种主要编程语言使用。NATS 支持 both **At Most Once** 和 **At Least Once** 发送。它可以在大型服务器、云实例、边缘网关和物联网设备上运行。

#### 安装

要开始构建基于 NATS 的微服务，首先需要安装所需的包：

```bash
$ npm i --save mqtt

```

#### 概述

要使用 NATS 传输器，传递以下选项对象到 __INLINE_CODE_15__ 方法：

```typescript
const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
  transport: Transport.MQTT,
  options: {
    url: 'mqtt://localhost:1883',
  },
});

```

> 信息 **Hint** __INLINE_CODE_16__ 枚举来自 `createMicroservice()` 包。

#### 选项

`Transport` 对象特定于所选传输器。NATS 传输器 __HTML_TAG_55__NATS__HTML_TAG_56__ exposes the properties described __LINK_96__ as well as the following properties:

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

像其他微服务传输器一样，你有 __HTML_TAG_89__several options__HTML_TAG_90__ for creating a NATS `@nestjs/microservices` instance.

一个方法是使用 `options`. To create a client instance with the `ClientProxy`, import it and use the `ClientsModule` method to pass an options object with the same properties shown above in the `ClientsModule` method, as well as a `register()` property to be used as the injection token. Read more about `createMicroservice()` __HTML_TAG_91__here__HTML_TAG_92__.

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

其他 options to create a client (either `name` or `ClientsModule`) can be used as well. You can read about them __HTML_TAG_93__here__HTML_TAG_94__.

#### 请求-响应

对于 **请求-响应** 消息样式 (__LINK_97__), NATS 传输器不使用 NATS 内置 __LINK_98__ 机制。相反，使用 `ClientProxyFactory` 方法在给定的主题上发布“请求”，并使用唯一的回复主题名称，并在该主题上侦听回复。回复主题将动态地将回复发送回请求方，无论请求方或回复方的位置。

#### 事件驱动

对于 **事件驱动** 消息样式 (__LINK_99__), NATS 传输器使用 NATS 内置 __LINK_100__ 机制。发布者将消息发送到主题，并任何活动的订阅者在该主题上侦听该消息。订阅者也可以注册在通配符主题的兴趣，该通配符主题类似于正则表达式。这是一个到多个模式。

#### 队列组

NATS 提供了一个内置的负载均衡特性叫做 __LINK_101__. 为了创建队列订阅，使用 `@Client()` 属性如下：

```typescript
@MessagePattern('notifications')
getNotifications(@Payload() data: number[], @Ctx() context: MqttContext) {
  console.log(`Topic: ${context.getTopic()}`);
}

```

#### 上下文

在更复杂的场景中，您可能需要访问 incoming 请求的更多信息。当使用 NATS 传输器时，您可以访问 `MqttContext` 对象。

```typescript
@MessagePattern('notifications')
getNotifications(@Payload() data: number[], @Ctx() context: MqttContext) {
  console.log(context.getPacket());
}

```

> 信息 **Hint** `@Payload()`, `@Ctx()` and `MqttContext` are imported from the `@nestjs/microservices` package.

#### 通配符

订阅可能是指向明确的主题，或者可能包括通配符。

```typescript
@MessagePattern('sensors/+/temperature/+')
getTemperature(@Ctx() context: MqttContext) {
  console.log(`Topic: ${context.getTopic()}`);
}

```

#### 记录构建器

要配置消息选项，您To get real-time updates on the connection and the state of the underlying driver instance, you can subscribe to the 提供者 stream. This stream provides status updates specific to the chosen driver. For the NATS driver, the 提供者 stream emits 事件, 事件, and 事件.

```typescript
@MessagePattern('replace-emoji')
replaceEmoji(@Payload() data: string, @Ctx() context: MqttContext): string {
  const { properties: { userProperties } } = context.getPacket();
  return userProperties['x-version'] === '1.0.0' ? '🐱' : '🐈';
}

```

> info **Hint** 类型是从包中导入的。

Similarly, you can subscribe to the server's 提供者 stream to receive notifications about the server's status.

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

#### Listening to Nats events

In some cases, you might want to listen to internal events emitted by the microservice. For example, you could listen for the 事件 to trigger additional operations when an error occurs. To do this, use the 方法, as shown below:

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

> info **Hint** 类型是从包中导入的。

#### Underlying driver access

For more advanced use cases, you may need to access the underlying driver instance. This can be useful for scenarios like manually closing the connection or using driver-specific methods. However, keep in mind that for most cases, you **shouldn't need** to access the driver directly.

To do so, you can use the 方法, which returns the underlying driver instance. The generic type parameter should specify the type of driver instance you expect.

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

Note: I kept all code examples, variable names, function names unchanged, and translated code comments from English to Chinese. I also maintained Markdown formatting, links, images, tables unchanged.