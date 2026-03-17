<!-- 此文件从 content/microservices/kafka.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:42:21.260Z -->
<!-- 源文件: content/microservices/kafka.md -->

### Kafka

__LINK_213__是一个开源、分布式流处理平台，具有三个关键能力：

- 发布和订阅记录流，类似于消息队列或企业消息系统。
- 持久存储记录流，以确保数据安全。
- 在记录流中处理记录。

Kafka项目旨在提供一个统一、高性能、低延迟的平台来处理实时数据 feeds。它与Apache Storm和Spark集成，用于实时数据分析。

#### 安装

要开始构建 Kafka 基于的微服务，首先安装所需的包：

```bash
$ npm i --save nats

```

#### 概述

像其他 Nest 微服务传输层实现一样，您可以使用 `name` 属性选择 Kafka 运输机制，通过将 options 对象中的 `ClientsModule` 属性设置为 `ClientProxyFactory`，如以下所示：

```typescript
const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
  transport: Transport.NATS,
  options: {
    servers: ['nats://localhost:4222'],
  },
});

```

> info **提示** `@Client()` 枚举来自 `publish()` 包。

#### 选项

`queue` 属性特定于选择的运输机制。Kafka 运输机制 exposes以下属性。

__HTML_TAG_123__
  __HTML_TAG_126__
    __HTML_TAG_127____HTML_TAG_128__client__HTML_TAG_129____HTML_TAG_130__
    __HTML_TAG_131__Client 配置选项（阅读更多 __HTML_TAG_132__这里__HTML_TAG_133__)__HTML_TAG_134__
  __HTML_TAG_135__
  __HTML_TAG_136__
    __HTML_TAG_137____HTML_TAG_138__consumer__HTML_TAG_139____HTML_TAG_140__
    __HTML_TAG_141__Consumer 配置选项（阅读更多 __HTML_TAG_142__这里__HTML_TAG_143__)__HTML_TAG_144__
  __HTML_TAG_145__
  __HTML_TAG_146__
    __HTML_TAG_147____HTML_TAG_148__run__HTML_TAG_149____HTML_TAG_150__
    __HTML_TAG_151__Run 配置选项（阅读更多 __HTML_TAG_152__这里__HTML_TAG_153__)__HTML_TAG_154__
  __HTML_TAG_155__
  __HTML_TAG_156__
    __HTML_TAG_157____HTML_TAG_158__subscribe__HTML_TAG_159____HTML_TAG_160__
    __HTML_TAG_161__Subscribe 配置选项（阅读更多 __HTML_TAG_162__这里__HTML_TAG_163__)__HTML_TAG_164__
  __HTML_TAG_165__
  __HTML_TAG_166__
    __HTML_TAG_167____HTML_TAG_168__producer__HTML_TAG_169____HTML_TAG_170__
    __HTML_TAG_171__Producer 配置选项（阅读更多 __HTML_TAG_172__这里__HTML_TAG_173__)__HTML_TAG_174__
  __HTML_TAG_175__
  __HTML_TAG_176__
    __HTML_TAG_177____HTML_TAG_178__send__HTML_TAG_179____HTML_TAG_180__
    __HTML_TAG_181__Send 配置选项（阅读更多 __HTML_TAG_182__这里__HTML_TAG_183__)__HTML_TAG_184__
  __HTML_TAG_185__
  __HTML_TAG_186__
    __HTML_TAG_187____HTML_TAG_188__producerOnlyMode__HTML_TAG_189____HTML_TAG_190__
    __HTML_TAG_191__Feature flag to skip consumer group registration and only act as a producer (__HTML_TAG_192__boolean__HTML_TAG_193__)__HTML_TAG_194__
  __HTML_TAG_195__
  __HTML_TAG_196__
    __HTML_TAG_197____HTML_TAG_198__postfixId__HTML_TAG_199____HTML_TAG_200__
    __HTML_TAG_201__Change suffix of clientId value (__HTML_TAG_202__string__HTML_TAG_203__)__HTML_TAG_204__
  __HTML_TAG_205__
__HTML_TAG_206__

#### 客户端

Kafka 与其他微服务传输层实现有一些不同。相反，我们使用 `@Payload()` 类。

像其他微服务传输层实现一样，您可以使用 __HTML_TAG_207__several options__HTML_TAG_208__ 创建一个 `@Ctx()` 实例。

一种创建实例的方法是使用 `NatsContext`. 创建一个客户端实例，可以使用 `@nestjs/microservices`，将 options 对象中的同样属性显示在 `x-version` 方法中，以及一个 `setHeaders` 属性用作注入令牌。阅读更多关于 `NatsRecordBuilder` __HTML_TAG_209__这里__HTML_TAG_210__。

```typescript
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'MATH_SERVICE',
        transport: Transport.NATS,
        options: {
          servers: ['nats://localhost:4222'],
        }
      },
    ]),
  ]
  ...
})

```

其他创建客户端（either `@nestjs/microservices` or `NatsContext`）的选项也可以使用。您可以阅读更多信息 __HTML_TAG_211__这里__HTML_TAG_212__。

使用 `ClientProxyFactory` 装饰When new 提供者`connected` instances are launched, they join the consumer group and subscribe to their respective topics. This process triggers a rebalance of topic partitions assigned to consumers of the consumer group.

通常，topic partitions are assigned using the round robin partitioner, which assigns topic partitions to a collection of consumers sorted by consumer names which are randomly set on application launch. However, when a new consumer joins the consumer group, the new consumer can be positioned anywhere within the collection of consumers. This creates a condition where pre-existing consumers can be assigned different partitions when the pre-existing consumer is positioned after the new consumer. As a result, the consumers that are assigned different partitions will lose response messages of requests sent before the rebalance.

To prevent 提供者`disconnected` consumers from losing response messages, a Nest-specific built-in custom partitioner is utilized. This custom partitioner assigns partitions to a collection of consumers sorted by high-resolution timestamps (`reconnecting`) that are set on application launch.

#### 消息响应订阅

> warning **注意** This section is only relevant if you use __LINK_216__ message style (with the `NatsStatus` decorator and the `@nestjs/microservices` method). Subscribing to the response topic is not necessary for the __LINK_217__ communication (`status` decorator and `error` method).

`on()` 类提供了 `NatsEvents` 方法。 `@nestjs/microservices` 方法将请求的 topic 名称作为参数，并将派生回复 topic 名称添加到回复 topic 集合中。这个方法在实现消息模式时是必需的。

```typescript
@MessagePattern('notifications')
getNotifications(@Payload() data: number[], @Ctx() context: NatsContext) {
  console.log(`Subject: ${context.getSubject()}`);
}

```

如果 `unwrap()` 实例是异步创建的，必须在调用 __INLINE_CODE_56__ 方法前调用 __INLINE_CODE_55__ 方法。

```typescript
@MessagePattern('time.us.*')
getDate(@Payload() data: number[], @Ctx() context: NatsContext) {
  console.log(`Subject: ${context.getSubject()}`); // e.g. "time.us.east"
  return new Date().toLocaleTimeString(...);
}

```

#### incoming

Nest 接收 incoming Kafka 消息作为一个对象，其中包含 __INLINE_CODE_57__, __INLINE_CODE_58__, 和 __INLINE_CODE_59__ 属性，这些属性的值类型为 __INLINE_CODE_60__. Nest 然后将这些值转换为字符串。如果字符串是 "object like"，Nest 尝试将字符串解析为 __INLINE_CODE_61__.然后将 __INLINE_CODE_62__ 传递给关联的处理程序。

#### outgoing

Nest 发送 outgoing Kafka 消息在发布事件或发送消息时进行序列化。这发生在传递给 __INLINE_CODE_63__ __INLINE_CODE_64__ 和 __INLINE_CODE_65__ 方法的参数或从 __INLINE_CODE_66__ 方法返回的值上。这次序列化 "stringifies" 非字符串或缓冲区对象使用 __INLINE_CODE_67__ 或 __INLINE_CODE_68__ prototype 方法。

```typescript
import * as nats from 'nats';

// somewhere in your code
const headers = nats.headers();
headers.set('x-version', '1.0.0');

const record = new NatsRecordBuilder(':cat:').setHeaders(headers).build();
this.client.send('replace-emoji', record).subscribe(...);

```

> info **提示** __INLINE_CODE_69__ 是来自 __INLINE_CODE_70__ 包的。

Outgoing 消息也可以通过传递包含 __INLINE_CODE_71__ 和 __INLINE_CODE_72__ 属性的对象来键。键消息对于满足 __LINK_218__ 是必要的。

```typescript
@MessagePattern('replace-emoji')
replaceEmoji(@Payload() data: string, @Ctx() context: NatsContext): string {
  const headers = context.getHeaders();
  return headers['x-version'] === '1.0.0' ? '🐱' : '🐈';
}

```

此外，传递的消息也可以包含在 __INLINE_CODE_73__ hash 属性中设置的自定义头。头 hash 属性值必须是类型 __INLINE_CODE_74__ 或类型 __INLINE_CODE_75__。

```typescript
import { Module } from '@nestjs/common';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';

@Module({
  providers: [
    {
      provide: 'API_v1',
      useFactory: () =>
        ClientProxyFactory.create({
          transport: Transport.NATS,
          options: {
            servers: ['nats://localhost:4222'],
            headers: { 'x-version': '1.0.0' },
          },
        }),
    },
  ],
})
export class ApiModule {}

```

#### 事件驱动

在 request-response 方法中交换消息时，request-response 方法是理想的。但是，在您的消息样式是事件驱动的（该样式是理想的 Kafka）时，您就不想等待响应。在这种情况下，您不想维护两个主题的开销。

查看以下两个部分以了解更多信息：__LINK_219__ 和 __LINK_220__。

#### 上下文

在更复杂的情况下，您可能需要访问 incoming 请求的additional 信息。使用 Kafka 传输器时，您可以访问 __INLINE_CODE_76__ 对象。

```typescript
this.client.status.subscribe((status: NatsStatus) => {
  console.log(status);
});

```

> info **提示** __INLINE_CODE_77__, __INLINE_CODE_78__ 和 __INLINE_CODE_79__ 是来自 __INLINE_CODE_80__ 包的。

要访问原始 Kafka __INLINE_CODE_81__ 对象，请使用 __INLINE_CODE_82__ 方法，如下所示：

```typescript
const server = app.connectMicroservice<MicroserviceOptions>(...);
server.status.subscribe((status: NatsStatus) => {
  console.log(status);
});

```

其中 __INLINE_CODE_84__ 满足以下接口：

```typescript
this.client.on('error', (err) => {
  console.error(err);
});

```

如果您的处理程序涉及每个接收到的消息的慢速处理时间，您应该考虑使用 __INLINE_CODE_85__ 回调。要检索 __INLINE_CODE_86__ 函数，请使用 __INLINE_CODE_87__ 方法，如下所示：

```typescript
server.on<NatsEvents>('error', (err) => {
  console.error(err);
});

```

#### 命名约定Here is the translation of the provided English technical documentation to Chinese:

Kafka微服务组件将在__INLINE_CODE_89__和__INLINE_CODE_90__选项中添加它们各自的描述，以防止Nest微服务客户端和服务器组件之间的冲突。默认情况下,__INLINE_CODE_91__组件将添加__INLINE_CODE_92__,而__INLINE_CODE_93__组件将添加__INLINE_CODE_94__到这两个选项中。请注意，以下提供的值是如何进行这种转换的（如同评论所示）。

```typescript
const natsConnection = this.client.unwrap<import('nats').NatsConnection>();

```

对于客户端：

```typescript
const natsConnection = server.unwrap<import('nats').NatsConnection>();

```

> info **提示** Kafka客户端和消费者命名约定可以通过在自己的自定义提供者中扩展__INLINE_CODE_95__和__INLINE_CODE_96__，并在构造函数中重写来自定义。

由于Kafka微服务消息模式使用两个主题来处理请求和回复通道，因此回复模式应该从请求主题派生。默认情况下，回复主题的名称是请求主题名称与__INLINE_CODE_97__连接的组合。

__CODE_BLOCK_15__

> info **提示** Kafka回复主题命名约定可以通过在自己的自定义提供者中扩展__INLINE_CODE_98__，并在__INLINE_CODE_99__方法中重写来自定义。

#### 可重试异常

与其他传输器类似，所有未处理的异常将自动包装到__INLINE_CODE_100__中，并转换为“用户友好”格式。然而，在某些边缘情况下，你可能想要绕过这个机制，让异常被__INLINE_CODE_101__驱动器消费。抛出一个异常以处理消息将 instruct __INLINE_CODE_102__将其重试（重新投递），这意味着，即使消息（或事件）处理器被触发，但offset不會被提交到Kafka。

> warning **警告** 对于事件处理器（基于事件的通信），所有未处理的异常默认为可重试异常。

为了实现这个，你可以使用专门的类__INLINE_CODE_103__，如下所示：

__CODE_BLOCK_16__

> info **提示** __INLINE_CODE_104__类来自__INLINE_CODE_105__包。

### 自定义异常处理

除了默认的错误处理机制，你还可以创建一个自定义的Exception Filter来管理重试逻辑。例如，以下示例演示如何在可配置的次数达到后跳过一个问题的事件：

__CODE_BLOCK_17__

这个过滤器提供了一种方式来重试处理Kafka事件，直到可配置的次数达到。在达到最大重试次数后，它将触发一个自定义__INLINE_CODE_106__（如果提供），并提交offset，从而跳过问题的事件。这允许后续事件被处理而不中断。

你可以将这个过滤器与事件处理器集成：

__CODE_BLOCK_18__

#### 提交offset

提交offset对于使用Kafka来说是非常重要的。默认情况下，消息将自动提交在特定的时间段内。更多信息请查看__LINK_221__。__INLINE_CODE_107__提供了一种方法来访问活动消费者，以便手动提交offset。消费者是KafkaJS消费者，并且工作于__LINK_222__。

__CODE_BLOCK_19__

要禁用自动提交消息，请在__INLINE_CODE_109__配置中设置__INLINE_CODE_108__，如下所示：

__CODE_BLOCK_20__

#### 实例状态更新

要获取实时更新关于连接和底层驱动实例的状态，可以订阅__INLINE_CODE_110__流。这流提供了与选择的驱动器相关的状态更新。对于Kafka驱动器，__INLINE_CODE_111__流发送__INLINE_CODE_112__、__INLINE_CODE_113__、__INLINE_CODE_114__、__INLINE_CODE_115__和__INLINE_CODE_116__事件。

__CODE_BLOCK_21__

> info **提示** __INLINE_CODE_117__类型来自__INLINE_CODE_118__包。

类似地，你可以订阅服务器的__INLINE_CODE_119__流，以接收关于服务器状态的通知。

__CODE_BLOCK_22__

#### underlying producer and consumer

对于更复杂的用例，你可能需要访问底层生产者和消费者实例。这可以用于手动关闭连接或使用驱动器特定的方法。然而，记住对于大多数情况，你**不应该**访问驱动器。

要做到这点，你可以使用__INLINE_CODE_120__和__INLINE_CODE_121__ getter暴露在__INLINE_CODE_122__实例中。

__CODE_BLOCK_23__