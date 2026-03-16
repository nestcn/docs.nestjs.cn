<!-- 此文件从 content/microservices/kafka.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T05:21:43.386Z -->
<!-- 源文件: content/microservices/kafka.md -->

### Kafka

__LINK_213__是一个开源、分布式流式处理平台，具有三个关键能力：

- 发布和订阅记录流，类似于消息队列或企业消息系统。
- 持久存储记录流，以确保故障恢复。
- 处理记录流实时。

Kafka 项目旨在提供一个统一、高吞吐量、低延迟的平台来处理实时数据 feeds。它与 Apache Storm 和 Spark 等框架集成，用于实时流式数据分析。

#### 安装

要开始构建 Kafka-基于的微服务，首先安装所需的包：

```bash
$ npm i --save nats

```

#### 概述

像其他 Nest 微服务传输层实现一样，您可以使用 `name` 选项对象中的 `ClientsModule` 属性来选择 Kafka 传输机制，另外还有一个可选的 `ClientProxyFactory` 属性，如下所示：

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

`queue` 属性是根据选择的传输机制指定的。Kafka 传输机制暴露以下属性。

__HTML_TAG_123__
  __HTML_TAG_126__
    __HTML_TAG_127____HTML_TAG_128__client__HTML_TAG_129____HTML_TAG_130__
    __HTML_TAG_131__客户端配置选项（了解更多__HTML_TAG_132__here__HTML_TAG_133__)__HTML_TAG_134__
  __HTML_TAG_135__
  __HTML_TAG_136__
    __HTML_TAG_137____HTML_TAG_138__consumer__HTML_TAG_139____HTML_TAG_140__
    __HTML_TAG_141__消费者配置选项（了解更多__HTML_TAG_142__here__HTML_TAG_143__)__HTML_TAG_144__
  __HTML_TAG_145__
  __HTML_TAG_146__
    __HTML_TAG_147____HTML_TAG_148__run__HTML_TAG_149____HTML_TAG_150__
    __HTML_TAG_151__运行配置选项（了解更多__HTML_TAG_152__here__HTML_TAG_153__)__HTML_TAG_154__
  __HTML_TAG_155__
  __HTML_TAG_156__
    __HTML_TAG_157____HTML_TAG_158__subscribe__HTML_TAG_159____HTML_TAG_160__
    __HTML_TAG_161__订阅配置选项（了解更多__HTML_TAG_162__here__HTML_TAG_163__)__HTML_TAG_164__
  __HTML_TAG_165__
  __HTML_TAG_166__
    __HTML_TAG_167____HTML_TAG_168__producer__HTML_TAG_169____HTML_TAG_170__
    __HTML_TAG_171__生产者配置选项（了解更多__HTML_TAG_172__here__HTML_TAG_173__)__HTML_TAG_174__
  __HTML_TAG_175__
  __HTML_TAG_176__
    __HTML_TAG_177____HTML_TAG_178__send__HTML_TAG_179____HTML_TAG_180__
    __HTML_TAG_181__发送配置选项（了解更多__HTML_TAG_182__here__HTML_TAG_183__)__HTML_TAG_184__
  __HTML_TAG_185__
  __HTML_TAG_186__
    __HTML_TAG_187____HTML_TAG_188__producerOnlyMode__HTML_TAG_189____HTML_TAG_190__
    __HTML_TAG_191__将忽略消费者组注册，只作为生产者工作（__HTML_TAG_192__布尔类型__HTML_TAG_193__)__HTML_TAG_194__
  __HTML_TAG_195__
  __HTML_TAG_196__
    __HTML_TAG_197____HTML_TAG_198__postfixId__HTML_TAG_199____HTML_TAG_200__
    __HTML_TAG_201__更改 clientId 值后缀（__HTML_TAG_202__字符串__HTML_TAG_203__)__HTML_TAG_204__
  __HTML_TAG_205__
__HTML_TAG_206__

#### 客户端

与其他微服务传输层实现不同的是，Kafka 使用 `@Payload()` 类，而不是 `NatsContext` 类。

像其他微服务传输层实现一样，您可以使用 __HTML_TAG_207__多种方法__HTML_TAG_208__来创建一个 `@Ctx()` 实例。

一个方法是使用 `NatsContext`。创建一个客户端实例，使用 `@nestjs/microservices` 方法，传入一个 options 对象，同上述 `x-version` 方法中的同样属性，以及一个 `setHeaders` 属性作为注入令牌。了解更多关于 `NatsRecordBuilder` __HTML_TAG_209__here__HTML_TAG_210__。

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

其他创建客户端实例的方法（`@nestjs/microservices` 或 `NatsContext`）也可以使用。了解Here is the translation of the English technical documentation to Chinese:

当新的 `connected` 实例启动时，它们将加入消费者组并订阅相应的主题。这过程将触发主题分区重新分配给消费者组中的消费者。

一般情况下，主题分区是使用圆 robin 分区器分配的，这个分区器将主题分区分配给一系列消费者，按照消费者名称排序，名称是随机设置在应用程序启动时的。然而，当新的消费者加入消费者组时，新的消费者可以在消费者列表中的任意位置。如果新的消费者在原来的消费者列表中的位置后面，那么原来的消费者将分配不同的分区。因此，分配不同的分区的消费者将丢失在 rebalance 之前发送的请求响应消息。

为了防止 `disconnected` 消费者丢失响应消息，Nest 使用了一个自定义的分区器。这个自定义分区器将分区分配给一系列消费者，按照高分辨率时间戳排序，这些时间戳是在应用程序启动时设置的。

#### 消息响应订阅

>警告 **注意** 仅当使用 __LINK_216__ 消息样式（带有 `NatsStatus` 装饰器和 `@nestjs/microservices` 方法）时，这部分内容才有效。对于 __LINK_217__ 通信（带有 `status` 装饰器和 `error` 方法），不需要订阅响应主题。

`on()` 类提供了 `NatsEvents` 方法。`@nestjs/microservices` 方法将请求主题名称作为参数，并将派生的回复主题名称添加到回复主题列表中。这个方法在实现消息模式时是必需的。

```typescript
@MessagePattern('notifications')
getNotifications(@Payload() data: number[], @Ctx() context: NatsContext) {
  console.log(`Subject: ${context.getSubject()}`);
}

```

如果 `unwrap()` 实例是异步创建的，那么必须在调用 __INLINE_CODE_56__ 方法之前调用 __INLINE_CODE_55__ 方法。

```typescript
@MessagePattern('time.us.*')
getDate(@Payload() data: number[], @Ctx() context: NatsContext) {
  console.log(`Subject: ${context.getSubject()}`); // e.g. "time.us.east"
  return new Date().toLocaleTimeString(...);
}

```

#### 到来

Nest 将 Kafka 消息作为一个对象接收，该对象具有 __INLINE_CODE_57__、__INLINE_CODE_58__ 和 __INLINE_CODE_59__ 属性，并且这些属性的值为 __INLINE_CODE_60__ 类型。Nest 然后将这些值解析为字符串。如果字符串是“object like”，Nest 尝试将字符串解析为 __INLINE_CODE_61__。然后，将 __INLINE_CODE_62__ 传递给相应的处理程序。

#### 出going

Nest 在发布事件或发送消息时将 outgoing Kafka 消息序列化。这发生在 __INLINE_CODE_63__ __INLINE_CODE_64__ 和 __INLINE_CODE_65__ 方法的参数中，或者在 __INLINE_CODE_66__ 方法返回的值中。这次序列化将将非字符串或缓冲区对象转换为字符串，使用 __INLINE_CODE_67__ 或 __INLINE_CODE_68__ 原型方法。

```typescript
import * as nats from 'nats';

// somewhere in your code
const headers = nats.headers();
headers.set('x-version', '1.0.0');

const record = new NatsRecordBuilder(':cat:').setHeaders(headers).build();
this.client.send('replace-emoji', record).subscribe(...);

```

>信息 **提示** __INLINE_CODE_69__ 来自 __INLINE_CODE_70__ 包。

outgoing 消息也可以通过将对象传递给 __INLINE_CODE_71__ 和 __INLINE_CODE_72__ 属性来键入。键入消息很重要，以满足 __LINK_218__。

```typescript
@MessagePattern('replace-emoji')
replaceEmoji(@Payload() data: string, @Ctx() context: NatsContext): string {
  const headers = context.getHeaders();
  return headers['x-version'] === '1.0.0' ? '🐱' : '🐈';
}

```

此外，这些消息也可以包含自定义头，设置在 __INLINE_CODE_73__ 哈希属性中。哈希属性值必须是 __INLINE_CODE_74__ 或 __INLINE_CODE_75__ 类型。

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

虽然请求-响应方法在交换服务之间的消息交换中非常理想，但是当您的消息样式是事件驱动的（适用于 Kafka）时，这方法不太适用。在这种情况下，您不需要请求-响应方法维护两个主题的开销。

查看以下两个部分以了解更多信息：__LINK_219__ 和 __LINK_220__。

#### 上下文

在更复杂的场景中，您可能需要访问 incoming 请求的 additional 信息。在使用 Kafka 传输器时，您可以访问 __INLINE_CODE_76__ 对象。

```typescript
this.client.status.subscribe((status: NatsStatus) => {
  console.log(status);
});

```

>信息 **提示** __INLINE_CODE_77__、__INLINE_CODE_78__ 和 __INLINE_CODE_79__ 来自 __INLINE_CODE_80__ 包。

要访问原始 Kafka 消息对象，请使用 __INLINE_CODE_83__ 对象的 __INLINE_CODE_82__ 方法，例如：

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

如果您的处理程序涉及到每个接收到的消息的慢速处理时间，那么您应该考虑使用 __INLINE_CODE_85__ 回调。要获取 __INLINE_CODE_86__ 函数，请使用 __INLINE_CODE_88__ 对象的 __INLINE_CODE_87__ 方法，例如：

```typescript
server.on<NatsEvents>('error', (err) => {
  console.error(err);
});

```

#### 命名约定Here is the translation of the English technical documentation to Chinese:

Kafka 微服务组件将其相应角色描述附加到 __INLINE_CODE_89__ 和 __INLINE_CODE_90__ 选项上，以防止 Nest 微服务客户端和服务器组件之间的冲突。默认情况下,__INLINE_CODE_91__ 组件将 __INLINE_CODE_92__ 附加到这两个选项上，而 __INLINE_CODE_93__ 组件将 __INLINE_CODE_94__ 附加到这两个选项上。请注意，以下提供的值是按照这种方式转换的（如注释所示）。

```typescript
const natsConnection = this.client.unwrap<import('nats').NatsConnection>();

```

而对于客户端：

```typescript
const natsConnection = server.unwrap<import('nats').NatsConnection>();

```

>info **提示** Kafka 客户端和消费者命名约定可以通过扩展 __INLINE_CODE_95__ 和 __INLINE_CODE_96__ 在自己的自定义提供者中，并重写构造函数来自定义。

由于 Kafka 微服务消息模式使用两个主题来实现请求和回复通道，因此回复模式应该从请求主题中派生。默认情况下，回复主题的名称是将请求主题名称与 __INLINE_CODE_97__ 附加的组合。

__CODE_BLOCK_15__

>info **提示** Kafka 回复主题命名约定可以通过扩展 __INLINE_CODE_98__ 在自己的自定义提供者中，并重写 __INLINE_CODE_99__ 方法来自定义。

#### 可重试异常

类似于其他传输器，所有未处理的异常将被自动包装到 __INLINE_CODE_100__ 中，并转换为“用户友好”格式。然而，在某些边缘情况下，您可能想绕过这个机制，让异常被 __INLINE_CODE_101__ 驱动程序消费。处理消息时抛出异常将 instruct __INLINE_CODE_102__ 重试该消息（重新发送），这意味着即使消息（或事件）处理器被触发，offset 也不会被提交到 Kafka 中。

>警告 **警告** 对于事件处理器（基于事件的通信），所有未处理的异常默认为可重试异常。

为了实现这一点，您可以使用专门的类 __INLINE_CODE_103__，如下所示：

__CODE_BLOCK_16__

>info **提示** __INLINE_CODE_104__ 类来自 __INLINE_CODE_105__ 包。

### 自定义异常处理

除了默认的错误处理机制外，您可以创建一个自定义的 Exception Filter 来管理重试逻辑。例如，以下示例演示了如何在可配置的次数后跳过一个问题事件：

__CODE_BLOCK_17__

这个过滤器提供了一种重试处理 Kafka 事件的方式，直到达到可配置的次数。达到最大重试次数后，它将触发一个自定义 __INLINE_CODE_106__（如果提供），并提交 offset，以跳过问题事件。这允许后续事件继续处理无中断。

您可以将这个过滤器集成到事件处理器中：

__CODE_BLOCK_18__

#### 提交 offset

提交 offset 是在工作中使用 Kafka 时非常重要的。默认情况下，消息将自动提交 после 一定的时间。有关更多信息，请访问 __LINK_221__。 __INLINE_CODE_107__ 提供了一种访问活动消费者的方式，以便手动提交 offset。消费者是 KafkaJS 消费者，并且工作于 __LINK_222__。

__CODE_BLOCK_19__

要禁用消息的自动提交，请在 __INLINE_CODE_109__ 配置中设置 __INLINE_CODE_108__，如下所示：

__CODE_BLOCK_20__

#### 实例状态更新

要获取实时更新关于连接和driver 实例的状态，可以订阅 __INLINE_CODE_110__ 流。这个流提供了与驱动程序相关的状态更新。对于 Kafka 驱动程序， __INLINE_CODE_111__ 流发出 __INLINE_CODE_112__、__INLINE_CODE_113__、__INLINE_CODE_114__、__INLINE_CODE_115__ 和 __INLINE_CODE_116__ 事件。

__CODE_BLOCK_21__

>info **提示** __INLINE_CODE_117__ 类来自 __INLINE_CODE_118__ 包。

同样，您可以订阅服务器的 __INLINE_CODE_119__ 流，以接收服务器状态通知。

__CODE_BLOCK_22__

#### underlying producer 和 consumer

在某些高级用途情况下，您可能需要访问 underlying producer 和 consumer 实例。这样可以在手动关闭连接或使用驱动程序特定的方法时非常有用。然而，请注意，在大多数情况下，您 **不需要** 直接访问驱动程序。

要访问 producer 和 consumer 实例，可以使用 __INLINE_CODE_120__ 和 __INLINE_CODE_121__ getter， exposes by __INLINE_CODE_122__ 实例。

__CODE_BLOCK_23__