<!-- 此文件从 content/microservices/kafka.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T05:25:04.890Z -->
<!-- 源文件: content/microservices/kafka.md -->

### Kafka

__LINK_213__ 是一个开源的分布式流处理平台，具有三个关键能力：

- 发布和订阅记录流，类似于消息队列或企业消息系统。
- 持久存储记录流，以确保 fault-tolerant。
- 处理记录流实时。

Kafka 项目旨在提供一个统一、高吞吐量、低延迟平台来处理实时数据 feeds。它与 Apache Storm 和 Spark 等实时数据分析平台集成很好。

#### 安装

要开始构建 Kafka-基于的微服务，首先安装所需的包：

```bash
$ npm i --save nats

```

#### 概述

像其他 Nest 微服务传输层实现一样，您可以使用 `name` 选项对象中的 `ClientsModule` 方法来选择 Kafka 传输机制，另外还可以使用可选的 `ClientProxyFactory` 属性，如下所示：

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

`queue` 属性特定于所选传输机制。__HTML_TAG_123__Kafka__HTML_TAG_124__ 传输机制 expose 以下属性。

__HTML_TAG_125__
  __HTML_TAG_126__
    __HTML_TAG_127____HTML_TAG_128__Client__HTML_TAG_129____HTML_TAG_130__
    __HTML_TAG_131__Client 配置选项（阅读更多 __HTML_TAG_132__这里__HTML_TAG_133__）__HTML_TAG_134__
  __HTML_TAG_135__
  __HTML_TAG_136__
    __HTML_TAG_137____HTML_TAG_138__Consumer__HTML_TAG_139____HTML_TAG_140__
    __HTML_TAG_141__Consumer 配置选项（阅读更多 __HTML_TAG_142__这里__HTML_TAG_143__）__HTML_TAG_144__
  __HTML_TAG_145__
  __HTML_TAG_146__
    __HTML_TAG_147____HTML_TAG_148__Run__HTML_TAG_149____HTML_TAG_150__
    __HTML_TAG_151__Run 配置选项（阅读更多 __HTML_TAG_152__这里__HTML_TAG_153__）__HTML_TAG_154__
  __HTML_TAG_155__
  __HTML_TAG_156__
    __HTML_TAG_157____HTML_TAG_158__Subscribe__HTML_TAG_159____HTML_TAG_160__
    __HTML_TAG_161__Subscribe 配置选项（阅读更多 __HTML_TAG_162__这里__HTML_TAG_163__）__HTML_TAG_164__
  __HTML_TAG_165__
  __HTML_TAG_166__
    __HTML_TAG_167____HTML_TAG_168__Producer__HTML_TAG_169____HTML_TAG_170__
    __HTML_TAG_171__Producer 配置选项（阅读更多 __HTML_TAG_172__这里__HTML_TAG_173__）__HTML_TAG_174__
  __HTML_TAG_175__
  __HTML_TAG_176__
    __HTML_TAG_177____HTML_TAG_178__Send__HTML_TAG_179____HTML_TAG_180__
    __HTML_TAG_181__Send 配置选项（阅读更多 __HTML_TAG_182__这里__HTML_TAG_183__）__HTML_TAG_184__
  __HTML_TAG_185__
  __HTML_TAG_186__
    __HTML_TAG_187____HTML_TAG_188__ProducerOnlyMode__HTML_TAG_189____HTML_TAG_190__
    __HTML_TAG_191__Feature flag to skip consumer group registration and only act as a producer (__HTML_TAG_192__boolean__HTML_TAG_193__)__HTML_TAG_194__
  __HTML_TAG_195__
  __HTML_TAG_196__
    __HTML_TAG_197____HTML_TAG_198__PostfixId__HTML_TAG_199____HTML_TAG_200__
    __HTML_TAG_201__Change suffix of clientId value (__HTML_TAG_202__string__HTML_TAG_203__)__HTML_TAG_204__
  __HTML_TAG_205__
__HTML_TAG_206__

#### 客户端

与其他微服务传输机制不同的是，Kafka 使用 `@Payload()` 类，而不是 `NatsContext` 类。

像其他微服务传输机制一样，您可以使用 __HTML_TAG_207__several options__HTML_TAG_208__ 创建一个 `@Ctx()` 实例。

一个创建实例的方法是使用 `NatsContext`. 创建一个客户端实例，可以使用 `@nestjs/microservices` 选项对象中的 `ClientsModule` 方法，或者使用 `NatsRecordBuilder` 方法来传递选项对象，并使用 `setHeaders` 属性作为 injection token。阅读更多关于 `NatsRecordBuilder` __HTML_TAG_209__这里__HTML_TAG_210__。

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

其他创建客户端实例的选项（__INLINE_CODE_Here is the translation of the provided English technical documentation to Chinese:

当新的 `connected` 实例启动时，它们将加入消费组并订阅相应的主题。这将触发主题分区对消费组中的消费者的重新分配。

通常，主题分区使用圆 robin 分配器分配给一个消费者集合，该集合按消费者名称随机排序。但是，当新消费者加入消费组时，新消费者可以在消费者集合中的任意位置。这创建了一个条件，即预先存在的消费者可能在重新分配时分配不同的分区。因此，分配不同的分区的消费者将失去之前发送的请求响应消息。

为了防止 `disconnected` 消费者失去响应消息，Nest 使用了自定义的分配器。该自定义分配器将分区分配给一个消费者集合，该集合按高分辨率时间戳排序，这些时间戳在应用程序启动时设置。

#### 消息响应订阅

> 警告 **注意** 本节仅适用于使用 __LINK_216__ 消息样式（带有 `NatsStatus` 装饰器和 `@nestjs/microservices` 方法）的开发者。在使用 __LINK_217__ 通信（带有 `status` 装饰器和 `error` 方法）时，不需要订阅响应主题。

`on()` 类提供了 `NatsEvents` 方法。 `@nestjs/microservices` 方法将请求主题名称作为参数，并将派生的回应主题名称添加到回应主题集合中。这是实现消息模式所需的方法。

```typescript
@MessagePattern('notifications')
getNotifications(@Payload() data: number[], @Ctx() context: NatsContext) {
  console.log(`Subject: ${context.getSubject()}`);
}

```

如果 `unwrap()` 实例异步创建，必须在调用 __INLINE_CODE_56__ 方法前调用 __INLINE_CODE_55__ 方法。

```typescript
@MessagePattern('time.us.*')
getDate(@Payload() data: number[], @Ctx() context: NatsContext) {
  console.log(`Subject: ${context.getSubject()}`); // e.g. "time.us.east"
  return new Date().toLocaleTimeString(...);
}

```

#### incoming

Nest 接收 Kafka 消息作为一个对象，其中包含 __INLINE_CODE_57__、__INLINE_CODE_58__ 和 __INLINE_CODE_59__ 属性，这些属性的值为 __INLINE_CODE_60__ 类型。Nest 然后将这些值转换为字符串。如果字符串为“对象-like”，Nest 尝试将字符串解析为 __INLINE_CODE_61__。然后将 __INLINE_CODE_62__ 传递给相应的处理程序。

#### outgoing

Nest 发送 outgoing Kafka 消息在发布事件或发送消息时发生。这发生在 __INLINE_CODE_63__、__INLINE_CODE_64__ 和 __INLINE_CODE_65__ 方法中传递的参数或从 __INLINE_CODE_66__ 方法返回的值。 serialization 将对象转换为字符串，这些对象不是字符串或缓冲区时使用 __INLINE_CODE_67__ 或 __INLINE_CODE_68__ 原型方法。

```typescript
import * as nats from 'nats';

// somewhere in your code
const headers = nats.headers();
headers.set('x-version', '1.0.0');

const record = new NatsRecordBuilder(':cat:').setHeaders(headers).build();
this.client.send('replace-emoji', record).subscribe(...);

```

> 提示 **提示** __INLINE_CODE_69__ 从 __INLINE_CODE_70__ 包含。

outgoing 消息也可以使用传递对象的 __INLINE_CODE_71__ 和 __INLINE_CODE_72__ 属性来键。键消息对于满足 __LINK_218__ 是必要的。

```typescript
@MessagePattern('replace-emoji')
replaceEmoji(@Payload() data: string, @Ctx() context: NatsContext): string {
  const headers = context.getHeaders();
  return headers['x-version'] === '1.0.0' ? '🐱' : '🐈';
}

```

此外，传递的消息也可以包含自定义头部，设置在 __INLINE_CODE_73__ 哈希属性中。哈希属性值必须是 __INLINE_CODE_74__ 或 __INLINE_CODE_75__ 类型。

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

在请求-响应方法中交换消息时是适合的，但是对于 Kafka 消息时不太适合 - 在您只想发布事件而不等待响应时。在这种情况下，您不想维护两个主题的开销。

查看以下两节以了解更多信息：__LINK_219__ 和 __LINK_220__。

#### 上下文

在更复杂的场景中，您可能需要访问 incoming 请求的 additional 信息。使用 Kafka  transporter 时，可以访问 __INLINE_CODE_76__ 对象。

```typescript
this.client.status.subscribe((status: NatsStatus) => {
  console.log(status);
});

```

> 提示 **提示** __INLINE_CODE_77__、__INLINE_CODE_78__ 和 __INLINE_CODE_79__ 从 __INLINE_CODE_80__ 包含。

要访问原始 Kafka __INLINE_CODE_81__ 对象，使用 __INLINE_CODE_82__ 方法，例如：

```typescript
const server = app.connectMicroservice<MicroserviceOptions>(...);
server.status.subscribe((status: NatsStatus) => {
  console.log(status);
});

```

其中 __INLINE_CODE_84__ 实现了以下接口：

```typescript
this.client.on('error', (err) => {
  console.error(err);
});

```

如果您的处理程序涉及到每个接收到的消息的慢速处理时间，您应该考虑使用 __INLINE_CODE_85__ 回调。要获取 __INLINE_CODE_86__ 函数，使用 __INLINE_CODE_87__ 方法，例如：

```typescript
server.on<NatsEvents>('error', (err) => {
  console.error(err);
});

```

#### 命名约定Here is the translation of the provided English technical documentation to Chinese, following the rules and guidelines:

### Kafka微服务组件

Kafka微服务组件将在__INLINE_CODE_89__和__INLINE_CODE_90__选项中添加自己的描述，以防止Nest微服务客户端和服务器组件之间的冲突。默认情况下,__INLINE_CODE_91__组件将添加__INLINE_CODE_92__,而__INLINE_CODE_93__组件将添加__INLINE_CODE_94__到这两个选项中。请注意，以下提供的值是以这种方式转换的（如评论所示）。

```typescript
const natsConnection = this.client.unwrap<import('nats').NatsConnection>();

```

和客户端：

```typescript
const natsConnection = server.unwrap<import('nats').NatsConnection>();

```

>info**提示**Kafka客户端和消费者命名约定可以通过扩展__INLINE_CODE_95__和__INLINE_CODE_96__来自定义， Override构造函数。

由于Kafka微服务消息模式使用两个主题来请求和回复通道，因此应从请求主题派生回复模式。默认情况下，回复主题名称是请求主题名称的组合，添加__INLINE_CODE_97__。

__CODE_BLOCK_15__

>info**提示**Kafka回复主题命名约定可以通过扩展__INLINE_CODE_98__来自定义， Override __INLINE_CODE_99__方法。

#### 可重试异常

类似于其他传输器，所有未处理的异常将自动被包装成__INLINE_CODE_100__，并转换为“用户友好的”格式。然而，在某些边界情况下，您可能想要绕过这个机制，让异常被__INLINE_CODE_101__驱动程序消费。处理消息时抛出异常将 instruct __INLINE_CODE_102__重试该消息（重新发送）这意味着，即使消息（或事件）处理器被触发，offset也不会被提交到Kafka。

>警告**警告**对于事件处理器（事件式通信），所有未处理的异常默认都是可重试的异常。

为此，您可以使用专门的类__INLINE_CODE_103__，如下所示：

__CODE_BLOCK_16__

>info**提示**__INLINE_CODE_104__类来自__INLINE_CODE_105__包。

### 自定义错误处理

除了默认的错误处理机制，您可以为Kafka事件创建自定义的Exception Filter来管理重试逻辑。例如，以下示例演示了如何跳过问题事件：

__CODE_BLOCK_17__

该过滤器提供了一个方式，可以在可配置的次数内重试处理Kafka事件。一旦达到最大重试次数，它将触发自定义__INLINE_CODE_106__（如果提供）并提交offset， effective skip该问题事件。这允许后续事件被处理而不中断。

您可以将该过滤器集成到事件处理器中：

__CODE_BLOCK_18__

#### offset提交

提交offset是工作于Kafka中的必需步骤。默认情况下，消息将自动提交在特定的时间后。更多信息，请访问__LINK_221__。__INLINE_CODE_107__提供了访问活动消费者的方式，以手动提交offset。消费者是KafkaJS消费者，工作于__LINK_222__。

__CODE_BLOCK_19__

要禁用消息的自动提交，请在__INLINE_CODE_109__配置中设置__INLINE_CODE_108__，如下所示：

__CODE_BLOCK_20__

#### 实例状态更新

要获取实时更新关于连接和底层驱动程序实例的状态，您可以订阅__INLINE_CODE_110__流。该流提供了与驱动程序特定的状态更新。对于Kafka驱动程序，__INLINE_CODE_111__流 emit__INLINE_CODE_112__、__INLINE_CODE_113__、__INLINE_CODE_114__、__INLINE_CODE_115__和__INLINE_CODE_116__事件。

__CODE_BLOCK_21__

>info**提示**__INLINE_CODE_117__类型来自__INLINE_CODE_118__包。

类似地，您可以订阅服务器的__INLINE_CODE_119__流以接收服务器状态通知。

__CODE_BLOCK_22__

#### underlying producer and consumer

对于更高级的用例，您可能需要访问底层producer和consumer实例。这可以在手动关闭连接或使用驱动程序特定的方法时非常有用。然而，请注意，在大多数情况下，您**不需要**直接访问驱动程序。

要访问此类实例，您可以使用__INLINE_CODE_120__和__INLINE_CODE_121__getters暴露在__INLINE_CODE_122__实例中。

__CODE_BLOCK_23__