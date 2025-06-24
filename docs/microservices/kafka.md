### Kafka

[Kafka](https://kafka.apache.org/) 是一个开源的分布式流处理平台，具有三大核心能力：

- 发布和订阅记录流，类似于消息队列或企业消息系统。
- 以容错且持久的方式存储记录流。
- 在记录流产生时实时处理它们。

Kafka 项目旨在提供一个统一、高吞吐、低延迟的平台来处理实时数据流。它能与 Apache Storm 和 Spark 完美集成，实现实时流数据分析。

#### 安装

要开始构建基于 Kafka 的微服务，首先需要安装所需软件包：

```bash
$ npm i --save kafkajs
```

#### 概述

与其他 Nest 微服务传输层实现类似，您可以通过传递给 `createMicroservice()` 方法的选项对象中的 `transport` 属性来选择 Kafka 传输机制，同时还可使用可选的 `options` 属性，如下所示：

```typescript
@@filename(main)
const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
  transport: Transport.KAFKA,
  options: {
    client: {
      brokers: ['localhost:9092'],
    }
  }
});
@@switch
const app = await NestFactory.createMicroservice(AppModule, {
  transport: Transport.KAFKA,
  options: {
    client: {
      brokers: ['localhost:9092'],
    }
  }
});
```

> **提示** `Transport` 枚举是从 `@nestjs/microservices` 包中导入的。

#### 选项

`options` 属性是特定于所选传输器的。**Kafka** 传输器暴露的属性如下所述。

<table data-immersive-translate-walked="408c388a-541d-4840-b71c-684ec06e32c1"><tbody data-immersive-translate-walked="408c388a-541d-4840-b71c-684ec06e32c1"><tr data-immersive-translate-walked="408c388a-541d-4840-b71c-684ec06e32c1"><td data-immersive-translate-walked="408c388a-541d-4840-b71c-684ec06e32c1">client</td><td data-immersive-translate-walked="408c388a-541d-4840-b71c-684ec06e32c1" data-immersive-translate-paragraph="1">客户端配置选项（了解更多 此处 ）</td></tr><tr data-immersive-translate-walked="408c388a-541d-4840-b71c-684ec06e32c1"><td data-immersive-translate-walked="408c388a-541d-4840-b71c-684ec06e32c1">consumer</td><td data-immersive-translate-walked="408c388a-541d-4840-b71c-684ec06e32c1" data-immersive-translate-paragraph="1">消费者配置选项（了解更多 此处 )</td></tr><tr data-immersive-translate-walked="408c388a-541d-4840-b71c-684ec06e32c1"><td data-immersive-translate-walked="408c388a-541d-4840-b71c-684ec06e32c1">run</td><td data-immersive-translate-walked="408c388a-541d-4840-b71c-684ec06e32c1" data-immersive-translate-paragraph="1">运行配置选项（了解更多 此处 )</td></tr><tr data-immersive-translate-walked="408c388a-541d-4840-b71c-684ec06e32c1"><td data-immersive-translate-walked="408c388a-541d-4840-b71c-684ec06e32c1">subscribe</td><td data-immersive-translate-walked="408c388a-541d-4840-b71c-684ec06e32c1" data-immersive-translate-paragraph="1">订阅配置选项（了解更多 此处 ）</td></tr><tr data-immersive-translate-walked="408c388a-541d-4840-b71c-684ec06e32c1"><td data-immersive-translate-walked="408c388a-541d-4840-b71c-684ec06e32c1">producer</td><td data-immersive-translate-walked="408c388a-541d-4840-b71c-684ec06e32c1" data-immersive-translate-paragraph="1">生产者配置选项（了解更多 此处 ）</td></tr><tr data-immersive-translate-walked="408c388a-541d-4840-b71c-684ec06e32c1"><td data-immersive-translate-walked="408c388a-541d-4840-b71c-684ec06e32c1">send</td><td data-immersive-translate-walked="408c388a-541d-4840-b71c-684ec06e32c1" data-immersive-translate-paragraph="1">发送配置选项（了解更多 此处 )</td></tr><tr data-immersive-translate-walked="408c388a-541d-4840-b71c-684ec06e32c1"><td data-immersive-translate-walked="408c388a-541d-4840-b71c-684ec06e32c1">producerOnlyMode</td><td data-immersive-translate-walked="408c388a-541d-4840-b71c-684ec06e32c1" data-immersive-translate-paragraph="1">跳过消费者组注册并仅作为生产者运行的功能标志（boolean）</td></tr><tr data-immersive-translate-walked="408c388a-541d-4840-b71c-684ec06e32c1"><td data-immersive-translate-walked="408c388a-541d-4840-b71c-684ec06e32c1">postfixId</td><td data-immersive-translate-walked="408c388a-541d-4840-b71c-684ec06e32c1" data-immersive-translate-paragraph="1">修改 clientId 值的后缀（string）</td></tr></tbody></table>

#### 客户端

Kafka 与其他微服务传输器有个小区别。我们不使用 `ClientProxy` 类，而是使用 `ClientKafkaProxy` 类。

与其他微服务传输器类似，创建 `ClientKafkaProxy` 实例有[多种方式](https://docs.nestjs.com/microservices/basics#client) 。

一种创建实例的方法是使用 `ClientsModule`。要通过 `ClientsModule` 创建客户端实例，需先导入该模块，然后使用 `register()` 方法传入一个选项对象（包含与上文 `createMicroservice()` 方法相同的属性），以及用作注入令牌的 `name` 属性。更多关于 `ClientsModule` 的信息请参阅[此处](https://docs.nestjs.com/microservices/basics#client) 。

```typescript
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'HERO_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'hero',
            brokers: ['localhost:9092'],
          },
          consumer: {
            groupId: 'hero-consumer'
          }
        }
      },
    ]),
  ]
  ...
})
```

也可以使用其他方式创建客户端（`ClientProxyFactory` 或 `@Client()`）。相关说明请查看[此文档](https://docs.nestjs.com/microservices/basics#client) 。

按如下方式使用 `@Client()` 装饰器：

```typescript
@Client({
  transport: Transport.KAFKA,
  options: {
    client: {
      clientId: 'hero',
      brokers: ['localhost:9092'],
    },
    consumer: {
      groupId: 'hero-consumer'
    }
  }
})
client: ClientKafkaProxy;
```

#### 消息模式

Kafka 微服务消息模式利用两个主题分别处理请求和回复通道。`ClientKafkaProxy#send()` 方法通过将[返回地址](https://www.enterpriseintegrationpatterns.com/patterns/messaging/ReturnAddress.html) 、 [关联 ID](https://www.enterpriseintegrationpatterns.com/patterns/messaging/CorrelationIdentifier.html)、回复主题和回复分区与请求消息关联来发送消息。这要求 `ClientKafkaProxy` 实例在发送消息前必须已订阅回复主题并分配到至少一个分区。

因此，您需要为每个运行的 Nest 应用程序至少配置一个回复主题分区。例如，如果运行 4 个 Nest 应用程序但回复主题只有 3 个分区，那么其中 1 个 Nest 应用程序在尝试发送消息时会报错。

当新的 `ClientKafkaProxy` 实例启动时，它们会加入消费者组并订阅各自的主题。此过程会触发对消费者组中各消费者分配的主题分区进行重新平衡。

通常情况下，主题分区会采用轮询分区器进行分配，该分区器将主题分区分配给一组按消费者名称排序的消费者，这些名称在应用启动时随机设置。然而，当新消费者加入消费者组时，新消费者可能被放置在该消费者集合中的任意位置。这会导致当原有消费者被定位在新消费者之后时，可能被分配到不同的分区。因此，那些被重新分配分区的消费者将会丢失在重新平衡前发送的请求响应消息。

为防止 `ClientKafkaProxy` 消费者丢失响应消息，系统采用了 Nest 专属的内置自定义分区器。该分区器会根据应用启动时设置的高精度时间戳(`process.hrtime()`)对消费者集合进行排序来分配分区。

#### 消息响应订阅

> warning **注意** 本节仅适用于使用[请求-响应](/microservices/basics#request-response)消息模式的情况（配合 `@MessagePattern` 装饰器和 `ClientKafkaProxy#send` 方法）。对于[基于事件](/microservices/basics#event-based)的通信方式（使用 `@EventPattern` 装饰器和 `ClientKafkaProxy#emit` 方法），则无需订阅响应主题。

`ClientKafkaProxy` 类提供了 `subscribeToResponseOf()` 方法。该方法以请求主题名称作为参数，并将派生的回复主题名称添加到回复主题集合中。在实现消息模式时必须调用此方法。

```typescript
@@filename(heroes.controller)
onModuleInit() {
  this.client.subscribeToResponseOf('hero.kill.dragon');
}
```

如果 `ClientKafkaProxy` 实例是异步创建的，则必须在调用 `connect()` 方法之前调用 `subscribeToResponseOf()` 方法。

```typescript
@@filename(heroes.controller)
async onModuleInit() {
  this.client.subscribeToResponseOf('hero.kill.dragon');
  await this.client.connect();
}
```

#### 传入

Nest 接收传入的 Kafka 消息时，会将其作为一个包含 `key`、`value` 和 `headers` 属性的对象，这些属性的值类型为 `Buffer`。随后 Nest 会将这些缓冲值转换为字符串进行解析。如果字符串呈现"类对象"形式，Nest 会尝试将其作为 `JSON` 进行解析。最终 `value` 会被传递至其关联的处理器。

#### 传出

Nest 在发布事件或发送消息时，会通过序列化过程发送传出的 Kafka 消息。该过程会对传入 `ClientKafkaProxy` 的 `emit()` 和 `send()` 方法的参数，或从 `@MessagePattern` 方法返回的值进行序列化。此序列化过程会通过 `JSON.stringify()` 或原型方法 `toString()` 将非字符串或缓冲区的对象"字符串化"。

```typescript
@@filename(heroes.controller)
@Controller()
export class HeroesController {
  @MessagePattern('hero.kill.dragon')
  killDragon(@Payload() message: KillDragonMessage): any {
    const dragonId = message.dragonId;
    const items = [
      { id: 1, name: 'Mythical Sword' },
      { id: 2, name: 'Key to Dungeon' },
    ];
    return items;
  }
}
```

> info **注意** `@Payload()` 需从 `@nestjs/microservices` 包中导入。

传出消息也可以通过传递包含 `key` 和 `value` 属性的对象进行键控。消息键控对于满足[共同分区要求](https://docs.confluent.io/current/ksql/docs/developer-guide/partition-data.html#co-partitioning-requirements)非常重要。

```typescript
@@filename(heroes.controller)
@Controller()
export class HeroesController {
  @MessagePattern('hero.kill.dragon')
  killDragon(@Payload() message: KillDragonMessage): any {
    const realm = 'Nest';
    const heroId = message.heroId;
    const dragonId = message.dragonId;

    const items = [
      { id: 1, name: 'Mythical Sword' },
      { id: 2, name: 'Key to Dungeon' },
    ];

    return {
      headers: {
        realm
      },
      key: heroId,
      value: items
    }
  }
}
```

此外，以此格式传递的消息还可以包含设置在 `headers` 哈希属性中的自定义标头。标头哈希属性值必须是 `string` 类型或 `Buffer` 类型。

```typescript
@@filename(heroes.controller)
@Controller()
export class HeroesController {
  @MessagePattern('hero.kill.dragon')
  killDragon(@Payload() message: KillDragonMessage): any {
    const realm = 'Nest';
    const heroId = message.heroId;
    const dragonId = message.dragonId;

    const items = [
      { id: 1, name: 'Mythical Sword' },
      { id: 2, name: 'Key to Dungeon' },
    ];

    return {
      headers: {
        kafka_nestRealm: realm
      },
      key: heroId,
      value: items
    }
  }
}
```

#### 基于事件

虽然请求-响应方法非常适合服务间交换消息，但当您的消息风格是基于事件的（这反过来又非常适合 Kafka）时就不太适用——当您只想发布事件**而不等待响应**时。在这种情况下，您不希望请求-响应为维护两个主题带来的开销。

查看以下两个部分以了解更多信息： [概述：基于事件](/microservices/basics#event-based)和[概述：发布事件](/microservices/basics#publishing-events) 。

#### 上下文

在更复杂的场景中，您可能需要访问有关传入请求的额外信息。使用 Kafka 传输器时，可以访问 `KafkaContext` 对象。

```typescript
@@filename()
@MessagePattern('hero.kill.dragon')
killDragon(@Payload() message: KillDragonMessage, @Ctx() context: KafkaContext) {
  console.log(`Topic: ${context.getTopic()}`);
}
@@switch
@Bind(Payload(), Ctx())
@MessagePattern('hero.kill.dragon')
killDragon(message, context) {
  console.log(`Topic: ${context.getTopic()}`);
}
```

> info **提示**`@Payload()`、`@Ctx()` 和 `KafkaContext` 都是从 `@nestjs/microservices` 包导入的。

要访问原始的 Kafka `IncomingMessage` 对象，请使用 `KafkaContext` 对象的 `getMessage()` 方法，如下所示：

```typescript
@@filename()
@MessagePattern('hero.kill.dragon')
killDragon(@Payload() message: KillDragonMessage, @Ctx() context: KafkaContext) {
  const originalMessage = context.getMessage();
  const partition = context.getPartition();
  const { headers, timestamp } = originalMessage;
}
@@switch
@Bind(Payload(), Ctx())
@MessagePattern('hero.kill.dragon')
killDragon(message, context) {
  const originalMessage = context.getMessage();
  const partition = context.getPartition();
  const { headers, timestamp } = originalMessage;
}
```

当 `IncomingMessage` 满足以下接口时：

```typescript
interface IncomingMessage {
  topic: string;
  partition: number;
  timestamp: string;
  size: number;
  attributes: number;
  offset: string;
  key: any;
  value: any;
  headers: Record<string, any>;
}
```

如果处理程序对每条接收到的消息处理时间较长，应考虑使用 `heartbeat` 回调。要获取 `heartbeat` 函数，请使用 `KafkaContext` 的 `getHeartbeat()` 方法，如下所示：

```typescript
@@filename()
@MessagePattern('hero.kill.dragon')
async killDragon(@Payload() message: KillDragonMessage, @Ctx() context: KafkaContext) {
  const heartbeat = context.getHeartbeat();

  // Do some slow processing
  await doWorkPart1();

  // Send heartbeat to not exceed the sessionTimeout
  await heartbeat();

  // Do some slow processing again
  await doWorkPart2();
}
```

#### 命名规范

Kafka 微服务组件会在 `client.clientId` 和 `consumer.groupId` 选项后附加各自角色描述，以防止 Nest 微服务客户端与服务器组件之间发生冲突。默认情况下，`ClientKafkaProxy` 组件会附加 `-client`，而 `ServerKafka` 组件会附加 `-server` 到这两个选项中。请注意下方提供的值是如何按此方式转换的（如注释所示）。

```typescript
@@filename(main)
const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
  transport: Transport.KAFKA,
  options: {
    client: {
      clientId: 'hero', // hero-server
      brokers: ['localhost:9092'],
    },
    consumer: {
      groupId: 'hero-consumer' // hero-consumer-server
    },
  }
});
```

对于客户端：

```typescript
@@filename(heroes.controller)
@Client({
  transport: Transport.KAFKA,
  options: {
    client: {
      clientId: 'hero', // hero-client
      brokers: ['localhost:9092'],
    },
    consumer: {
      groupId: 'hero-consumer' // hero-consumer-client
    }
  }
})
client: ClientKafkaProxy;
```

> info **提示** Kafka 客户端和消费者的命名规则可以通过在自定义提供程序中扩展 `ClientKafkaProxy` 和 `KafkaServer` 并重写构造函数来自定义。

由于 Kafka 微服务消息模式使用两个主题分别处理请求和回复通道，回复模式应从请求主题派生。默认情况下，回复主题的名称由请求主题名称与附加的 `.reply` 组合而成。

```typescript
@@filename(heroes.controller)
onModuleInit() {
  this.client.subscribeToResponseOf('hero.get'); // hero.get.reply
}
```

> info **提示** Kafka 回复主题的命名规则可以通过在自定义提供程序中扩展 `ClientKafkaProxy` 并重写 `getResponsePatternName` 方法来自定义。

#### 可重试异常

与其他传输器类似，所有未处理的异常都会被自动包装成 `RpcException` 并转换为"用户友好"格式。但在某些边缘情况下，您可能希望绕过此机制，让异常由 `kafkajs` 驱动程序直接处理。在处理消息时抛出异常会指示 `kafkajs` **重试**该消息（重新投递），这意味着即使消息（或事件）处理程序已被触发，偏移量也不会提交到 Kafka。

> warning **注意** 对于事件处理程序（基于事件的通信），默认情况下所有未处理异常都被视为**可重试异常** 。

为此，您可以使用名为 `KafkaRetriableException` 的专用类，如下所示：

```typescript
throw new KafkaRetriableException('...');
```

> info：**KafkaRetriableException** 类是从 `@nestjs/microservices` 包中导出的。

### 自定义异常处理

除了默认的错误处理机制外，您还可以为 Kafka 事件创建自定义的异常过滤器来管理重试逻辑。例如，以下示例展示了如何在可配置的重试次数后跳过问题事件：

```typescript
import { Catch, ArgumentsHost, Logger } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { KafkaContext } from '../ctx-host';

@Catch()
export class KafkaMaxRetryExceptionFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(KafkaMaxRetryExceptionFilter.name);

  constructor(
    private readonly maxRetries: number,
    // Optional custom function executed when max retries are exceeded
    private readonly skipHandler?: (message: any) => Promise<void>
  ) {
    super();
  }

  async catch(exception: unknown, host: ArgumentsHost) {
    const kafkaContext = host.switchToRpc().getContext<KafkaContext>();
    const message = kafkaContext.getMessage();
    const currentRetryCount = this.getRetryCountFromContext(kafkaContext);

    if (currentRetryCount >= this.maxRetries) {
      this.logger.warn(
        `Max retries (${
          this.maxRetries
        }) exceeded for message: ${JSON.stringify(message)}`
      );

      if (this.skipHandler) {
        try {
          await this.skipHandler(message);
        } catch (err) {
          this.logger.error('Error in skipHandler:', err);
        }
      }

      try {
        await this.commitOffset(kafkaContext);
      } catch (commitError) {
        this.logger.error('Failed to commit offset:', commitError);
      }
      return; // Stop propagating the exception
    }

    // If retry count is below the maximum, proceed with the default Exception Filter logic
    super.catch(exception, host);
  }

  private getRetryCountFromContext(context: KafkaContext): number {
    const headers = context.getMessage().headers || {};
    const retryHeader = headers['retryCount'] || headers['retry-count'];
    return retryHeader ? Number(retryHeader) : 0;
  }

  private async commitOffset(context: KafkaContext): Promise<void> {
    const consumer = context.getConsumer && context.getConsumer();
    if (!consumer) {
      throw new Error('Consumer instance is not available from KafkaContext.');
    }

    const topic = context.getTopic && context.getTopic();
    const partition = context.getPartition && context.getPartition();
    const message = context.getMessage();
    const offset = message.offset;

    if (!topic || partition === undefined || offset === undefined) {
      throw new Error(
        'Incomplete Kafka message context for committing offset.'
      );
    }

    await consumer.commitOffsets([
      {
        topic,
        partition,
        // When committing an offset, commit the next number (i.e., current offset + 1)
        offset: (Number(offset) + 1).toString(),
      },
    ]);
  }
}
```

该过滤器提供了将 Kafka 事件重试处理至可配置次数的功能。当达到最大重试次数时，会触发自定义的 `skipHandler`（如果提供）并提交偏移量，从而跳过问题事件。这使得后续事件能够不受干扰地继续处理。

您可以通过将此过滤器添加到事件处理器中进行集成：

```typescript
@UseFilters(new KafkaMaxRetryExceptionFilter(5))
export class MyEventHandler {
  @EventPattern('your-topic')
  async handleEvent(@Payload() data: any, @Ctx() context: KafkaContext) {
    // Your event processing logic...
  }
}
```

#### 提交偏移量

在使用 Kafka 时，提交偏移量至关重要。默认情况下，消息会在特定时间后自动提交。更多信息请参阅 [KafkaJS 文档](https://kafka.js.org/docs/consuming#autocommit) 。`KafkaContext` 提供了一种访问活跃消费者以手动提交偏移量的方式。该消费者即为 KafkaJS 消费者，其工作方式与[原生 KafkaJS 实现](https://kafka.js.org/docs/consuming#manual-committing)一致。

```typescript
@@filename()
@EventPattern('user.created')
async handleUserCreated(@Payload() data: IncomingMessage, @Ctx() context: KafkaContext) {
  // business logic

  const { offset } = context.getMessage();
  const partition = context.getPartition();
  const topic = context.getTopic();
  const consumer = context.getConsumer();
  await consumer.commitOffsets([{ topic, partition, offset }])
}
@@switch
@Bind(Payload(), Ctx())
@EventPattern('user.created')
async handleUserCreated(data, context) {
  // business logic

  const { offset } = context.getMessage();
  const partition = context.getPartition();
  const topic = context.getTopic();
  const consumer = context.getConsumer();
  await consumer.commitOffsets([{ topic, partition, offset }])
}
```

要禁用消息自动提交，请在 `run` 配置中设置 `autoCommit: false`，如下所示：

```typescript
@@filename(main)
const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
  transport: Transport.KAFKA,
  options: {
    client: {
      brokers: ['localhost:9092'],
    },
    run: {
      autoCommit: false
    }
  }
});
@@switch
const app = await NestFactory.createMicroservice(AppModule, {
  transport: Transport.KAFKA,
  options: {
    client: {
      brokers: ['localhost:9092'],
    },
    run: {
      autoCommit: false
    }
  }
});
```

#### 实例状态更新

要获取连接及底层驱动实例状态的实时更新，您可以订阅 `status` 流。该流提供所选驱动特有的状态更新。对于 Kafka 驱动，`status` 流会发出 `connected`（已连接）、`disconnected`（已断开）、`rebalancing`（再平衡）、`crashed`（崩溃）和 `stopped`（停止）事件。

```typescript
this.client.status.subscribe((status: KafkaStatus) => {
  console.log(status);
});
```

> **提示** `KafkaStatus` 类型是从 `@nestjs/microservices` 包导入的。

同样地，您可以订阅服务器的 `status` 流来接收有关服务器状态的通知。

```typescript
const server = app.connectMicroservice<MicroserviceOptions>(...);
server.status.subscribe((status: KafkaStatus) => {
  console.log(status);
});
```

#### 底层生产者与消费者

对于更高级的用例，您可能需要访问底层生产者和消费者实例。这在手动关闭连接或使用驱动程序特定方法等场景中会很有用。但请注意，在大多数情况下，您**无需**直接访问驱动程序。

为此，您可以使用 `ClientKafkaProxy` 实例公开的 `producer` 和 `consumer` 获取方法。

```typescript
const producer = this.client.producer;
const consumer = this.client.consumer;
```
