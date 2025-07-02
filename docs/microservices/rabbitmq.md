### RabbitMQ

[RabbitMQ](https://www.rabbitmq.com/) 是一款开源轻量级消息代理，支持多种消息协议。它可采用分布式和联合式配置部署，以满足高规模、高可用性需求。此外，它也是全球部署最广泛的消息代理，从小型初创公司到大型企业都在使用。

#### 安装

要开始构建基于 RabbitMQ 的微服务，首先需安装以下必备软件包：

```bash
$ npm i --save amqplib amqp-connection-manager
```

#### 概述

要使用 RabbitMQ 传输器，请将以下配置对象传入 `createMicroservice()` 方法：

```typescript title="main"
const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
  transport: Transport.RMQ,
  options: {
    urls: ['amqp://localhost:5672'],
    queue: 'cats_queue',
    queueOptions: {
      durable: false
    },
  },
});
```

> **提示** `Transport` 枚举是从 `@nestjs/microservices` 包中导入的。

#### 选项

`options` 属性专属于所选传输器。**RabbitMQ** 传输器提供如下所述属性配置项。

| 选项                      | 描述                                                                                                                    |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| `urls`                   | 要尝试的连接 URL 数组（按顺序）                                                                                        |
| `queue`                  | 服务器将监听的队列名称                                                                                                  |
| `prefetchCount`          | 设置通道的预取计数                                                                                                     |
| `isGlobalPrefetchCount`  | 启用每个通道的预取功能                                                                                                  |
| `noAck`                  | 若为 false，则启用手动确认模式                                                                                         |
| `consumerTag`            | 服务器用于区分消费者消息传递的名称；该名称不得已在通道中使用。通常省略此参数更为简便，此时服务器将生成随机名称并在回复中提供。消费者标签标识符（详见此处） |
| `queueOptions`           | 附加队列选项（详见此处）                                                                                               |
| `socketOptions`          | 附加套接字选项（详见此处）                                                                                             |
| `headers`                | 随每条消息一起发送的头部信息                                                                                           |
| `replyQueue`             | 生产者的回复队列。默认为 `amq.rabbitmq.reply-to`                                                                       |
| `persistent`             | 如果为真，消息将在代理重启后保留（前提是所在队列也能在重启后保留）                                                      |
| `noAssert`               | 当设为 false 时，消费前将不会声明队列                                                                                  |
| `wildcards`              | 仅在需要使用主题交换机（Topic Exchange）将消息路由到队列时设为 true。启用此选项后，您可以使用通配符（*、#）作为消息和事件模式 |
| `exchange`               | 交换机名称。当 `wildcards` 设为 true 时默认为队列名称                                                                  |
| `exchangeType`           | 交换机类型。默认为 `topic`。有效值为 `direct`、`fanout`、`topic` 和 `headers`                                          |
| `routingKey`             | 主题交换机的附加路由键                                                                                                 |
| `maxConnectionAttempts`  | 最大连接尝试次数。仅适用于消费者配置。`-1` 表示无限次尝试                                                               |

#### 客户端

与其他微服务传输器类似，创建 RabbitMQ `ClientProxy` 实例时您有[多种选择](../microservices/basics#客户端)

一种创建实例的方法是使用 `ClientsModule`。要通过 `ClientsModule` 创建客户端实例，需先导入该模块，然后使用 `register()` 方法传入一个选项对象（包含与上文 `createMicroservice()` 方法相同的属性），以及用作注入令牌的 `name` 属性。更多关于 `ClientsModule` 的信息请参阅[此处](../microservices/basics#客户端) 。

```typescript
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'MATH_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'cats_queue',
          queueOptions: {
            durable: false
          },
        },
      },
    ]),
  ]
  ...
})
```

也可以使用其他方式创建客户端（`ClientProxyFactory` 或 `@Client()`）。相关说明请查看[此文档](../microservices/basics#客户端) 。

#### 上下文

在更复杂的场景中，您可能需要访问有关传入请求的额外信息。使用 RabbitMQ 传输器时，您可以访问 `RmqContext` 对象

```typescript
@MessagePattern('notifications')
getNotifications(@Payload() data: number[], @Ctx() context: RmqContext) {
  console.log(`Pattern: ${context.getPattern()}`);
}
```

> info **提示**`@Payload()`、`@Ctx()` 和 `RmqContext` 均从 `@nestjs/microservices` 包导入

要访问原始的 RabbitMQ 消息（包含 `properties`、`fields` 和 `content`），请使用 `RmqContext` 对象的 `getMessage()` 方法，如下所示：

```typescript
@MessagePattern('notifications')
getNotifications(@Payload() data: number[], @Ctx() context: RmqContext) {
  console.log(context.getMessage());
}
```

要获取 RabbitMQ [通道](https://www.rabbitmq.com/channels.html)的引用，请使用 `RmqContext` 对象的 `getChannelRef` 方法，如下所示：

```typescript
@MessagePattern('notifications')
getNotifications(@Payload() data: number[], @Ctx() context: RmqContext) {
  console.log(context.getChannelRef());
}
```

#### 消息确认

为确保消息永不丢失，RabbitMQ 支持[消息确认机制](https://www.rabbitmq.com/confirms.html) 。消费者会发送确认回执告知 RabbitMQ 某条消息已被接收、处理完毕，RabbitMQ 可以安全删除该消息。如果消费者在未发送确认的情况下终止（其通道关闭、连接断开或 TCP 连接丢失），RabbitMQ 会认为该消息未被完全处理并将其重新加入队列。

要启用手动确认模式，将 `noAck` 属性设为 `false`：

```typescript
options: {
  urls: ['amqp://localhost:5672'],
  queue: 'cats_queue',
  noAck: false,
  queueOptions: {
    durable: false
  },
},
```

当开启手动消费者确认时，我们必须从工作线程发送正确的确认信号来表示已完成任务处理。

```typescript
@MessagePattern('notifications')
getNotifications(@Payload() data: number[], @Ctx() context: RmqContext) {
  const channel = context.getChannelRef();
  const originalMsg = context.getMessage();

  channel.ack(originalMsg);
}
```

#### 记录构建器

要配置消息选项，可以使用 `RmqRecordBuilder` 类（注意：这也适用于基于事件的流程）。例如，要设置 `headers` 和 `priority` 属性，使用 `setOptions` 方法，如下所示：

```typescript
const message = ':cat:';
const record = new RmqRecordBuilder(message)
  .setOptions({
    headers: {
      ['x-version']: '1.0.0',
    },
    priority: 3,
  })
  .build();

this.client.send('replace-emoji', record).subscribe(...);
```

> info：**提示**`RmqRecordBuilder` 类是从 `@nestjs/microservices` 包中导出的。

你也可以在服务端通过访问 `RmqContext` 来读取这些值，如下所示：

```typescript
@MessagePattern('replace-emoji')
replaceEmoji(@Payload() data: string, @Ctx() context: RmqContext): string {
  const { properties: { headers } } = context.getMessage();
  return headers['x-version'] === '1.0.0' ? '🐱' : '🐈';
}
```

#### 实例状态更新

要获取关于连接和底层驱动实例状态的实时更新，你可以订阅 `status` 流。该流提供特定于所选驱动的状态更新。对于 RMQ 驱动，`status` 流会发出 `connected`（已连接）和 `disconnected`（已断开）事件。

```typescript
this.client.status.subscribe((status: RmqStatus) => {
  console.log(status);
});
```

> info **注意** `RmqStatus` 类型是从 `@nestjs/microservices` 包中导入的。

同样地，您可以订阅服务器的 `status` 流来接收有关服务器状态的通知。

```typescript
const server = app.connectMicroservice<MicroserviceOptions>(...);
server.status.subscribe((status: RmqStatus) => {
  console.log(status);
});
```

#### 监听 RabbitMQ 事件

在某些情况下，您可能需要监听微服务发出的内部事件。例如，您可以监听 `error` 事件，以便在发生错误时触发其他操作。为此，请使用如下所示的 `on()` 方法：

```typescript
this.client.on('error', (err) => {
  console.error(err);
});
```

同样地，您可以监听服务器的内部事件：

```typescript
server.on<RmqEvents>('error', (err) => {
  console.error(err);
});
```

> info **注意** `RmqEvents` 类型是从 `@nestjs/microservices` 包中导入的。

#### 底层驱动访问

对于更高级的用例，您可能需要访问底层驱动实例。这在手动关闭连接或使用驱动特定方法等场景中非常有用。但请注意，在大多数情况下，您**不需要**直接访问驱动。

为此，您可以使用 `unwrap()` 方法，该方法会返回底层驱动实例。泛型类型参数应指定您预期的驱动实例类型。

```typescript
const managerRef =
  this.client.unwrap<import('amqp-connection-manager').AmqpConnectionManager>();
```

同样地，您可以访问服务器的底层驱动实例：

```typescript
const managerRef =
  server.unwrap<import('amqp-connection-manager').AmqpConnectionManager>();
```

#### 通配符

RabbitMQ 支持在路由键中使用通配符来实现灵活的消息路由。`#` 通配符匹配零个或多个单词，而 `*` 通配符则精确匹配一个单词。

例如，路由键 `cats.#` 可以匹配 `cats`、`cats.meow` 和 `cats.meow.purr`。而路由键 `cats.*` 只能匹配 `cats.meow`，无法匹配 `cats.meow.purr`。

要在 RabbitMQ 微服务中启用通配符支持，需在配置对象中将 `wildcards` 选项设为 `true`：

```typescript
const app = await NestFactory.createMicroservice<MicroserviceOptions>(
  AppModule,
  {
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://localhost:5672'],
      queue: 'cats_queue',
      wildcards: true,
    },
  }
);
```

完成此配置后，您便可在订阅事件/消息时使用通配符路由键。例如，要监听路由键为 `cats.#` 的消息，可使用以下代码：

```typescript
@MessagePattern('cats.#')
getCats(@Payload() data: { message: string }, @Ctx() context: RmqContext) {
  console.log(`Received message with routing key: ${context.getPattern()}`);

  return {
    message: 'Hello from the cats service!',
  }
}
```

要发送带有特定路由键的消息，可使用 `ClientProxy` 实例的 `send()` 方法：

```typescript
this.client.send('cats.meow', { message: 'Meow!' }).subscribe((response) => {
  console.log(response);
});
```
