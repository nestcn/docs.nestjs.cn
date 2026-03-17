<!-- 此文件从 content/microservices/nats.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:43:27.571Z -->
<!-- 源文件: content/microservices/nats.md -->

### NATS

__LINK_95__ 是一个简单、安全、高性能的开源消息系统，用于云原生应用、IoT 消息和微服务架构。NATS 服务器使用 Go 语言编写，但客户端库可与服务器交互，支持多种主要编程语言。NATS 支持 both **At Most Once** 和 **At Least Once** 发送。它可以在大型服务器和云实例、边缘网关和 Internet of Things 设备上运行。

#### 安装

要开始构建基于 NATS 的微服务，首先安装所需的包：

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

> info **提示** __INLINE_CODE_16__ 枚举来自 `createMicroservice()` 包。

#### 选项

`Transport` 对象特定于选择的传输器。NATS__HTML_TAG_55__ 传输器公开以下属性：

__HTML_TAG_57__
  __HTML_TAG_58__
    __HTML_TAG_59____HTML_TAG_60__queue__HTML_TAG_61____HTML_TAG_62__
    __HTML_TAG_63__队列，您的服务器应该订阅该队列（留空 __HTML_TAG_64__ undefined__HTML_TAG_65__ 忽略该设置）。了解更多关于 NATS 队列组 __HTML_TAG_66__ 以下__HTML_TAG_67__。
    __HTML_TAG_68__ 
  __HTML_TAG_69__
  __HTML_TAG_70__
    <strong></strong>gracefulShutdown<a href="/microservices/basics#客户端"></a>
    <a href="/microservices/basics#客户端">启用优雅关闭。启用后，服务器首先从所有通道中退订，然后关闭连接。默认是 </a> false<a href="/microservices/basics#客户端">。
  </a>
  __HTML_TAG_79__
    __HTML_TAG_80____HTML_TAG_81__gracePeriod__HTML_TAG_82____HTML_TAG_83__
    __HTML_TAG_84__等待服务器关闭的时间（毫秒）。默认是 __HTML_TAG_85__10000__HTML_TAG_86__ 毫秒。
  __HTML_TAG_87__
__HTML_TAG_88__

#### 客户端

像其他微服务传输器一样，您有 __HTML_TAG_89__ 多种选项__HTML_TAG_90__ 创建 NATS `@nestjs/microservices` 实例。

使用 `options` 方法创建客户端实例，可以使用 `ClientProxy` 传递选项对象，以便在上面显示的 `ClientsModule` 方法中使用相同的属性，以及 `register()` 属性作为注入令牌。了解更多关于 `createMicroservice()` __HTML_TAG_91__ 以下__HTML_TAG_92__。

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

其他创建客户端的选项（ either `name` 或 `ClientsModule`）也可以使用。了解更多关于它们 __HTML_TAG_93__ 以下__HTML_TAG_94__。

#### 请求-响应

对于 **请求-响应** 消息样式 (__LINK_97__), NATS 传输器不使用 NATS 内置 __LINK_98__ 机制。相反，使用 `ClientProxyFactory` 方法在给定的主题上发布请求，然后响应者监听该主题发送响应。回复主题将动态地将回复发送到请求方，无论请求方或响应方的位置。

#### 事件驱动

对于 **事件驱动** 消息样式 (__LINK_99__), NATS 传输器使用 NATS 内置 __LINK_100__ 机制。发布者发送消息到主题，然后任何活动订阅者监听该主题都将收到消息。订阅者也可以注册对通配符主题的兴趣，这些主题类似于正则表达式。这一种到多种模式有时称为 fan-out。

#### 队列组

NATS 提供了内置的负载均衡功能称为 __LINK_101__.要创建队列订阅，使用 `@Client()` 属性如下：

```typescript
@MessagePattern('notifications')
getNotifications(@Payload() data: number[], @Ctx() context: MqttContext) {
  console.log(`Topic: ${context.getTopic()}`);
}

```

#### 上下文

在更复杂的场景中，您可能需要访问 incoming 请求的更多信息。在使用 NATS 传输器时，您可以访问 `MqttContext` 对象。

```typescript
@MessagePattern('notifications')
getNotifications(@Payload() data: number[], @Ctx() context: MqttContext) {
  console.log(context.getPacket());
}

```

> info **提示** `@Payload()`, `@Ctx()` 和 `MqttContext` 是来自 `@nestjs/microservices` 包的。

#### 通配符

订阅可能是对明确的主题或包括通配符的。

```typescript
@MessagePattern('sensors/+/temperature/+')
getTemperature(@Ctx() context: MqttContext) {
  console.log(`Topic: ${context.getTopic()}`);
}

```

#### 记录构建器

要配置消息选项，您可以使用 `getPacket()` 类（注意：这适用于事件驱动流程）。例如，要添加 `MqttContext` 头，使用 `+` 方法为了实时获取连接和 underlying driver 实例的状态，您可以订阅 `@EventPattern` 流。这个流提供了与选择的驱动程序相关的状态更新。对于 NATS 驱动程序，`subscribeOptions` 流会发射 `qos`、`extras` 和 `subscribeOptions.qos` 事件。

```typescript
@MessagePattern('replace-emoji')
replaceEmoji(@Payload() data: string, @Ctx() context: MqttContext): string {
  const { properties: { userProperties } } = context.getPacket();
  return userProperties['x-version'] === '1.0.0' ? '🐱' : '🐈';
}

```

> info **提示** `extras.qos` 类型来自 `subscribeOptions.qos` 包。

类似地，您可以订阅服务器的 `MqttRecordBuilder` 流以接收服务器状态的通知。

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

在某些情况下，您可能想监听微服务内部发出的事件。例如，您可以监听 `QoS` 事件以在错误发生时触发额外的操作。为了实现这点，请使用 `2` 方法，如下所示：

```typescript
this.client.status.subscribe((status: MqttStatus) => {
  console.log(status);
});

```

类似地，您也可以监听服务器的内部事件：

```typescript
const server = app.connectMicroservice<MicroserviceOptions>(...);
server.status.subscribe((status: MqttStatus) => {
  console.log(status);
});

```

> info **提示** `setQoS` 类型来自 `MqttRecordBuilder` 包。

#### underlying driver 访问

对于更复杂的用例，您可能需要访问 underlying driver 实例。这个可以用于手动关闭连接或使用驱动程序特定方法。然而，除非必要，否则您 **不应该** 直接访问驱动程序。

为了实现这点，请使用 `@nestjs/microservices` 方法，它将返回 underlying driver 实例。泛型类型参数应该指定期望的驱动程序实例类型。

```typescript
this.client.on('error', (err) => {
  console.error(err);
});

```

类似地，您也可以访问服务器的 underlying driver 实例：

```typescript
server.on<MqttEvents>('error', (err) => {
  console.error(err);
});

```