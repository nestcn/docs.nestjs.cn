<!-- 此文件从 content/microservices/nats.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T05:26:31.486Z -->
<!-- 源文件: content/microservices/nats.md -->

### NATS

__LINK_95__是一个简单、安全和高性能的开源消息系统，用于云原生应用、物联网消息和微服务架构。NATS 服务器是使用 Go  programming语言编写的，但对 Server 的客户端库可用于多种主要编程语言。NATS 支持 both **At Most Once** 和 **At Least Once** 发送。它可以在大型服务器、云实例、边缘网关和 Internet of Things 设备上运行。

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

> info **Hint** __INLINE_CODE_16__ 枚举来自 `createMicroservice()` 包。

#### 选项

`Transport` 对象特定于所选的传输器。NATS__HTML_TAG_55__传输器公开以下属性：

__HTML_TAG_57__
  __HTML_TAG_58__
    __HTML_TAG_59____HTML_TAG_60__queue__HTML_TAG_61____HTML_TAG_62__
    __HTML_TAG_63__队列，您的服务器应该订阅（留空 __HTML_TAG_64__ undefined__HTML_TAG_65__ 忽略此设置）。了解更多关于 NATS 队列组__HTML_TAG_66__的信息。
  __HTML_TAG_69__
  __HTML_TAG_70__
    <strong></strong>gracefulShutdown<a href="/microservices/basics#客户端"></a>
    <a href="/microservices/basics#客户端">启用优雅关闭。当启用时，服务器首先从所有通道中取消订阅，然后关闭连接。默认为 </a>false<a href="/microservices/basics#客户端">。
  </a>
  __HTML_TAG_79__
    __HTML_TAG_80____HTML_TAG_81__gracePeriod__HTML_TAG_82____HTML_TAG_83__
    __HTML_TAG_84__等待服务器的时间（毫秒）。默认为 __HTML_TAG_85__10000__HTML_TAG_86__ ms。
  __HTML_TAG_87__
__HTML_TAG_88__

#### 客户端

像其他微服务传输器一样，您有 __HTML_TAG_89__several options__HTML_TAG_90__ 创建一个 NATS `@nestjs/microservices` 实例。

一个方法是使用 `options`.创建一个客户端实例，可以使用 `ClientProxy` 传递一个选项对象，具有与 `ClientsModule` 方法相同的属性，以及一个 `register()` 属性作为注入令牌。了解更多关于 `createMicroservice()` __HTML_TAG_91__的信息。

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

其他创建客户端（或 `name` 或 `ClientsModule`）的选项也可以使用。您可以了解更多关于它们__HTML_TAG_93__的信息。

#### 请求-响应

对于 **request-response** 消息风格 (__LINK_97__), NATS 传输器不使用 NATS 内置 __LINK_98__ 机制。相反，使用 `ClientProxyFactory` 方法发布一个请求，并将回复主题名称与请求主题名称相匹配，然后响应器监听该主题并将响应发送到回复主题。回复主题将动态地将响应返回到请求方，无论请求方或响应方的位置。

#### 事件-基于

对于 **event-based** 消息风格 (__LINK_99__), NATS 传输器使用 NATS 内置 __LINK_100__ 机制。发布者发送消息到主题，然后任何活动订阅者监听该主题将收到消息。订阅者还可以注册感兴趣的通道主题，这些主题类似于正则表达式。这一种模式有时称为 fan-out。

#### 队列组

NATS 提供了一个内置的负载均衡功能，称为 __LINK_101__.要创建队列订阅，请使用 `@Client()` 属性，如下所示：

```typescript
@MessagePattern('notifications')
getNotifications(@Payload() data: number[], @Ctx() context: MqttContext) {
  console.log(`Topic: ${context.getTopic()}`);
}

```

#### 上下文

在更复杂的场景中，您可能需要访问 incoming 请求的额外信息。使用 NATS 传输器时，您可以访问 `MqttContext` 对象。

```typescript
@MessagePattern('notifications')
getNotifications(@Payload() data: number[], @Ctx() context: MqttContext) {
  console.log(context.getPacket());
}

```

> info **Hint** `@Payload()`, `@Ctx()` 和 `MqttContext` 来自 `@nestjs/microservices` 包。

#### wildcards

订阅可能是指向明确的主题，或者可能包括通配符。

```typescript
@MessagePattern('sensors/+/temperature/+')
getTemperature(@Ctx() context: MqttContext) {
  console.log(`Topic: ${context.getTopic()}`);
}

```

#### 记录构建器

要配置消息选项，可以使用 `getPacket()` 类（注意：这适用于 event-based 流程）。例如，要添加 `MqttContext` 头，使用 `+` 方法，如下所示：

```typescript
const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
  transport: Transport.MQTT,
  options: {
    url: 'mqtt://localhost:1883',
    subscribeOptions: {
      qos: 2
    },
  },
});

```

> info **Hint** __INLINE_CODE_Here is the translation of the English technical documentation to Chinese, following the provided guidelines:

要实时获取连接和底层驱动实例的状态，可以订阅 `@EventPattern` 流。这个流提供了与选择的驱动器相关的状态更新。对于 NATS 驱动器，`subscribeOptions` 流会发射 `qos`、`extras` 和 `subscribeOptions.qos` 事件。

```typescript
@MessagePattern('replace-emoji')
replaceEmoji(@Payload() data: string, @Ctx() context: MqttContext): string {
  const { properties: { userProperties } } = context.getPacket();
  return userProperties['x-version'] === '1.0.0' ? '🐱' : '🐈';
}

```

> 提示 **Hint** `extras.qos` 类型来自 `subscribeOptions.qos` 包。

类似地，您可以订阅服务器的 `MqttRecordBuilder` 流，以接收服务器状态的通知。

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

在某些情况下，您可能想监听微服务内部发出的事件。例如，您可以监听 `QoS` 事件，以在错误发生时触发额外操作。要做到这一点，请使用 `2` 方法，如下所示：

```typescript
this.client.status.subscribe((status: MqttStatus) => {
  console.log(status);
});

```

类似地，您可以监听服务器内部事件：

```typescript
const server = app.connectMicroservice<MicroserviceOptions>(...);
server.status.subscribe((status: MqttStatus) => {
  console.log(status);
});

```

> 提示 **Hint** `setQoS` 类型来自 `MqttRecordBuilder` 包。

#### 底层驱动器访问

对于更高级的用例，您可能需要访问底层驱动器实例。这可以用于手动关闭连接或使用驱动器特定的方法。但是，为了大多数情况，您**不需要**访问驱动器。

要做到这一点，可以使用 `@nestjs/microservices` 方法，该方法返回底层驱动器实例。泛型类型参数应指定期望的驱动器实例类型。

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

Note: I kept the placeholders __INLINE_CODE_N__ exactly as they are in the source text, and did not modify or explain them. I also kept the code examples, variable names, function names, and Markdown formatting unchanged.