### MQTT

[MQTT](https://mqtt.org/)（消息队列遥测传输）是一种开源轻量级消息协议，专为低延迟场景优化。该协议通过**发布/订阅**模式，为设备互联提供了可扩展且经济高效的解决方案。基于 MQTT 的通信系统由发布服务器、代理服务器及一个或多个客户端组成，特别适用于资源受限设备及低带宽、高延迟或不稳定网络环境。

#### 安装

要开始构建基于 MQTT 的微服务，首先需安装所需软件包：

```bash
$ npm i --save mqtt

```

#### 概述

使用 MQTT 传输器时，请将以下配置对象传入 `createMicroservice()` 方法：

 ```typescript title="main.ts"
const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
  transport: Transport.MQTT,
  options: {
    url: 'mqtt://localhost:1883',
  },
});

```

:::info 注意
`Transport` 枚举是从 `@nestjs/microservices` 包中导入的。
:::

#### 选项

`options` 对象特定于所选的传输器。**MQTT** 传输器公开的属性描述见[此处](https://github.com/mqttjs/MQTT.js/#mqttclientstreambuilder-options) 。

#### 客户端

与其他微服务传输器类似，创建 MQTT `ClientProxy` 实例有[多种方式](../microservices/basics#客户端) 。

一种创建实例的方法是使用 `ClientsModule`。要通过 `ClientsModule` 创建客户端实例，需导入该模块并使用 `register()` 方法传递选项对象，该对象包含与上述 `createMicroservice()` 方法相同的属性，以及一个用作注入令牌的 `name` 属性。更多关于 `ClientsModule` 的信息请参阅[此处](../microservices/basics#客户端) 。

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

其他创建客户端的方式（使用 `ClientProxyFactory` 或 `@Client()`）也同样适用。您可以[在此](../microservices/basics#客户端)了解更多相关信息。

#### 上下文

在更复杂的场景中，您可能需要访问有关传入请求的额外信息。当使用 MQTT 传输器时，您可以访问 `MqttContext` 对象。

```typescript
@MessagePattern('notifications')
getNotifications(@Payload() data: number[], @Ctx() context: MqttContext) {
  console.log(`Topic: ${context.getTopic()}`);
}

```

:::info 提示
`@Payload()`、`@Ctx()` 和 `MqttContext` 均从 `@nestjs/microservices` 包导入。
:::

要访问原始的 MQTT [数据包](https://github.com/mqttjs/mqtt-packet) ，请使用 `MqttContext` 对象的 `getPacket()` 方法，如下所示：

```typescript
@MessagePattern('notifications')
getNotifications(@Payload() data: number[], @Ctx() context: MqttContext) {
  console.log(context.getPacket());
}

```

#### 通配符

订阅可以是针对明确主题的，也可以包含通配符。有两种通配符可用：`+` 和 `#`。`+` 是单级通配符，而 `#` 是多级通配符，可覆盖多个主题层级。

```typescript
@MessagePattern('sensors/+/temperature/+')
getTemperature(@Ctx() context: MqttContext) {
  console.log(`Topic: ${context.getTopic()}`);
}

```

#### 服务质量(QoS)

使用 `@MessagePattern` 或 `@EventPattern` 装饰器创建的任何订阅都将以 QoS 0 级别进行订阅。如需更高 QoS 级别，可在建立连接时通过 `subscribeOptions` 块全局设置，如下所示：

 ```typescript title="main.ts"
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

如需针对特定主题设置 QoS，可考虑创建[自定义传输器](../microservices/custom-transport) 。

#### 记录构建器

要配置消息选项（调整 QoS 级别、设置 Retain 或 DUP 标志，或向有效负载添加额外属性），可使用 `MqttRecordBuilder` 类。例如，要将 `QoS` 设置为 `2`，可使用 `setQoS` 方法，如下所示：

```typescript
const userProperties = { 'x-version': '1.0.0' };
const record = new MqttRecordBuilder(':cat:')
  .setProperties({ userProperties })
  .setQoS(1)
  .build();
client.send('replace-emoji', record).subscribe(...);

```

:::info 提示
`MqttRecordBuilder` 类是从 `@nestjs/microservices` 包导出的。
:::

您也可以通过访问 `MqttContext` 在服务端读取这些选项。

```typescript
@MessagePattern('replace-emoji')
replaceEmoji(@Payload() data: string, @Ctx() context: MqttContext): string {
  const { properties: { userProperties } } = context.getPacket();
  return userProperties['x-version'] === '1.0.0' ? '🐱' : '🐈';
}

```

在某些情况下，您可能想为多个请求配置用户属性，可以将这些选项传递给 `ClientProxyFactory`。

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

#### 实例状态更新

要获取连接状态及底层驱动实例的实时更新，您可以订阅 `status` 数据流。该数据流会提供所选驱动的特定状态更新。对于 MQTT 驱动，`status` 数据流会发出 `connected`（已连接）、`disconnected`（已断开）、`reconnecting`（重连中）和 `closed`（已关闭）事件。

```typescript
this.client.status.subscribe((status: MqttStatus) => {
  console.log(status);
});

```

:::info 提示
`MqttStatus` 类型是从 `@nestjs/microservices` 包导入的。
:::

同样地，您可以订阅服务器的 `status` 流来接收有关服务器状态的通知。

```typescript
const server = app.connectMicroservice<MicroserviceOptions>(...);
server.status.subscribe((status: MqttStatus) => {
  console.log(status);
});

```

#### 监听 MQTT 事件

在某些情况下，您可能需要监听微服务发出的内部事件。例如，您可以监听 `error` 事件，以便在发生错误时触发其他操作。为此，请使用如下所示的 `on()` 方法：

```typescript
this.client.on('error', (err) => {
  console.error(err);
});

```

同样地，您可以监听服务器的内部事件：

```typescript
server.on<MqttEvents>('error', (err) => {
  console.error(err);
});

```

:::info 提示
`MqttEvents` 类型是从 `@nestjs/microservices` 包导入的。
:::

#### 底层驱动访问

对于更高级的用例，您可能需要访问底层驱动实例。这在手动关闭连接或使用驱动特定方法等场景中非常有用。但请注意，在大多数情况下，您**不需要**直接访问驱动。

为此，您可以使用 `unwrap()` 方法，该方法会返回底层驱动实例。泛型类型参数应指定您预期的驱动实例类型。

```typescript
const mqttClient = this.client.unwrap<import('mqtt').MqttClient>();

```

同样地，您可以访问服务器的底层驱动实例：

```typescript
const mqttClient = server.unwrap<import('mqtt').MqttClient>();

```
