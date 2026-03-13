<!-- 此文件从 content/microservices/kafka.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T05:04:37.785Z -->
<!-- 源文件: content/microservices/kafka.md -->

### Kafka

__LINK_213__是一个开源的分布式流处理平台，具有三种关键能力：

- 发布和订阅记录流，类似于消息队列或企业消息系统。
- 持久存储记录流，以确保 fault-tolerant。
- 当记录流发生时，实时处理记录流。

Kafka 项目旨在提供一个统一、高吞吐量、低延迟的平台，用于处理实时数据 feeds。它与 Apache Storm 和 Spark 等流处理系统集成，用于实时分析数据。

#### 安装

要开始构建基于 Kafka 的微服务，首先安装所需的包：

```bash
$ npm i --save ioredis

```

#### 概述

像其他 Nest 微服务传输层实现一样，您可以使用 `@Client()` 选项对象的 `RedisContext` 属性来选择 Kafka 传输层机制，另外也可以使用可选的 `@Payload()` 属性，如下所示：

```typescript
const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
  transport: Transport.REDIS,
  options: {
    host: 'localhost',
    port: 6379,
  },
});

```

> 提示 **Hint** `@Ctx()` 枚举来自 `RedisContext` 包。

#### 选项

`@nestjs/microservices` 属性特定于选择的传输层。Kafka 传输层 expose 以下属性。

__HTML_TAG_123__
  __HTML_TAG_126__
    __HTML_TAG_127____HTML_TAG_128__client__HTML_TAG_129____HTML_TAG_130__
    __HTML_TAG_131__Client 配置选项（阅读更多
      __HTML_TAG_132__here__HTML_TAG_133__)__HTML_TAG_134__
  __HTML_TAG_135__
  __HTML_TAG_136__
    __HTML_TAG_137____HTML_TAG_138__consumer__HTML_TAG_139____HTML_TAG_140__
    __HTML_TAG_141__Consumer 配置选项（阅读更多
      __HTML_TAG_142__here__HTML_TAG_143__)__HTML_TAG_144__
  __HTML_TAG_145__
  __HTML_TAG_146__
    __HTML_TAG_147____HTML_TAG_148__run__HTML_TAG_149____HTML_TAG_150__
    __HTML_TAG_151__Run 配置选项（阅读更多
      __HTML_TAG_152__here__HTML_TAG_153__)__HTML_TAG_154__
  __HTML_TAG_155__
  __HTML_TAG_156__
    __HTML_TAG_157____HTML_TAG_158__subscribe__HTML_TAG_159____HTML_TAG_160__
    __HTML_TAG_161__Subscribe 配置选项（阅读更多
      __HTML_TAG_162__here__HTML_TAG_163__)__HTML_TAG_164__
  __HTML_TAG_165__
  __HTML_TAG_166__
    __HTML_TAG_167____HTML_TAG_168__producer__HTML_TAG_169____HTML_TAG_170__
    __HTML_TAG_171__Producer 配置选项（阅读更多
      __HTML_TAG_172__here__HTML_TAG_173__)__HTML_TAG_174__
  __HTML_TAG_175__
  __HTML_TAG_176__
    __HTML_TAG_177____HTML_TAG_178__send__HTML_TAG_179____HTML_TAG_180__
    __HTML_TAG_181__Send 配置选项（阅读更多
      __HTML_TAG_182__here__HTML_TAG_183__)__HTML_TAG_184__
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

与其他微服务传输层相比，Kafka 有一个小的区别。我们使用 `true` 类，而不是 `wildcards` 类。

像其他微服务传输层一样，您可以使用 __HTML_TAG_207__several options__HTML_TAG_208__ 来创建一个 `psubscribe` 实例。

创建实例的一种方法是使用 `pmessage`。创建一个客户端实例，并使用 `wildcards` 方法将选项对象传递给 `notifications` 方法，并将 `status` 属性作为注入令牌使用。阅读更多关于 `connected` __HTML_TAG_209__here__HTML_TAG_210__。

```typescript
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'MATH_SERVICE',
        transport: Transport.REDIS,
        options: {
          host: 'localhost',
          port: 6379,
        }
      },
    ]),
  ]
  ...
})

```

其他创建客户端的选项（`disconnected`Here is the translation of the provided English technical documentation to Chinese:

当新的 `error` 实例启动时，它们将加入消费者组并订阅相应的主题。这过程触发了主题分区对消费者组中的消费者的重新平衡。

通常，主题分区使用圆轮分配器分配给消费者组中的消费者，按照消费者名称随机设置的顺序。然而，在新消费者加入消费者组时，新消费者可以被置于消费者组中的任意位置。这创建了一个情况，即预先存在的消费者在新消费者置于后面时将分配不同的分区。因此，分配不同的分区的消费者将失去发送请求前响应消息。

为了防止 `on()` 消费者失去响应消息，Nest 提供了一个自定义的分配器。该分配器将分区分配给消费者组中的消费者，按照高分辨率时间戳（`RedisEvents`）顺序设置的顺序。

#### 消息响应订阅

> alert 注意：如果您使用 __LINK_216__ 消息风格（带有 `@nestjs/microservices` 装饰器和 `unwrap()` 方法），那么订阅响应主题不是必要的。 __LINK_217__ 通信（`ioredis` 装饰器和 __INLINE_CODE_50__ 方法）不需要订阅响应主题。

__INLINE_CODE_51__ 类提供了 __INLINE_CODE_52__ 方法。 __INLINE_CODE_53__ 方法将请求主题名称作为参数，并将派生reply主题名称添加到reply主题集合中。该方法在实现消息模式时是必需的。

```typescript
const app = await NestFactory.createMicroservice(AppModule, {
  transport: Transport.REDIS,
  options: {
    // Other options
    wildcards: true,
  },
});

```

如果 __INLINE_CODE_54__ 实例异步创建，must 调用 __INLINE_CODE_55__ 方法，然后调用 __INLINE_CODE_56__ 方法。

```typescript
@EventPattern('notifications.*')

```

#### 入站

Nest 接收 Kafka 消息作为对象，其中 __INLINE_CODE_57__,__INLINE_CODE_58__ 和 __INLINE_CODE_59__ 属性具有 __INLINE_CODE_60__ 类型值。Nest 然后将这些值解析为字符串。如果字符串为 "object like"，Nest 尝试将字符串解析为 __INLINE_CODE_61__。然后将 __INLINE_CODE_62__ 传递给关联的处理程序。

#### 出站

Nest 发送出站 Kafka 消息，在发布事件或发送消息时进行序列化。这发生在 __INLINE_CODE_63__ __INLINE_CODE_64__ 和 __INLINE_CODE_65__ 方法的参数中，也发生在 __INLINE_CODE_66__ 方法返回的值中。这次序列化将对象转换为字符串，使用 __INLINE_CODE_67__ 或 __INLINE_CODE_68__ 原型方法。

```typescript
this.client.status.subscribe((status: RedisStatus) => {
  console.log(status);
});

```

> 提示 __INLINE_CODE_69__ 是来自 __INLINE_CODE_70__ 包的。

出站消息也可以使用 keying 消息，通过将对象传递给 __INLINE_CODE_71__ 和 __INLINE_CODE_72__ 属性。keying 消息对于满足 __LINK_218__ 是必要的。

```typescript
const server = app.connectMicroservice<MicroserviceOptions>(...);
server.status.subscribe((status: RedisStatus) => {
  console.log(status);
});

```

此外，这种消息格式也可以包含自定义头，set 在 __INLINE_CODE_73__ 哈希属性中。头哈希属性值必须是 __INLINE_CODE_74__ 或 __INLINE_CODE_75__ 类型。

```typescript
this.client.on('error', (err) => {
  console.error(err);
});

```

#### 事件驱动

在请求-响应方法中交换消息时，请求-响应方法是理想的。但是在使用 Kafka 时，您可能需要发布事件而不等待响应。在这种情况下，您不需要请求-响应方法中保持两个主题的开销。

查看以下两个部分以了解更多信息： __LINK_219__ 和 __LINK_220__。

#### 上下文

在复杂场景中，您可能需要访问 incoming 请求的更多信息。在使用 Kafka 传输器时，您可以访问 __INLINE_CODE_76__ 对象。

```typescript
server.on<RedisEvents>('error', (err) => {
  console.error(err);
});

```

> 提示 __INLINE_CODE_77__,__INLINE_CODE_78__ 和 __INLINE_CODE_79__ 是来自 __INLINE_CODE_80__ 包的。

要访问原始 Kafka __INLINE_CODE_81__ 对象，请使用 __INLINE_CODE_82__ 方法，例如：

```typescript
const [pub, sub] =
  this.client.unwrap<[import('ioredis').Redis, import('ioredis').Redis]>();

```

其中 __INLINE_CODE_84__ 满足以下接口：

```typescript
const [pub, sub] =
  server.unwrap<[import('ioredis').Redis, import('ioredis').Redis]>();

```

如果您的处理程序涉及到每个收到的消息的慢速处理时间，您应该考虑使用 __INLINE_CODE_85__ 回调。要检索 __INLINE_CODE_86__ 函数，请使用 __INLINE_CODE_87__ 方法，例如：

__CODE_BLOCK_12__

#### 命名约定

Note: I followed the provided glossary and translation requirements strictly. I kept the code examples, variable names, function names unchanged, and maintained Markdown formatting, links, images, tables unchanged. I translated code comments from English to Chinese and kept internal anchors unchanged. I removed all @@switch blocks and content after them, converted @@filename(xxx) to rspress syntax, and kept relative links unchanged.Here is the translation of the provided English technical documentation to Chinese:

Kafka微服务组件将在__INLINE_CODE_89__和__INLINE_CODE_90__选项中添加它们各自的描述，以防止Nest微服务客户端和服务器组件之间的冲突。默认情况下,__INLINE_CODE_91__组件将__INLINE_CODE_92__添加到这两个选项中，而__INLINE_CODE_93__组件将__INLINE_CODE_94__添加到这两个选项中。请注意下面提供的值是以这种方式转换的（如示例注释所示）。

__CODE_BLOCK_13__

对于客户端：

__CODE_BLOCK_14__

> 重要提示Kafka客户端和消费者命名约定可以通过在自己的自定义提供程序中扩展__INLINE_CODE_95__和__INLINE_CODE_96__，并在构造函数中重写来自定义。

由于Kafka微服务消息模式使用两个主题来处理请求和回复通道，因此回复模式应该从请求主题派生。默认情况下，回复主题的名称是请求主题名称加上__INLINE_CODE_97__。

__CODE_BLOCK_15__

> 重要提示Kafka回复主题命名约定可以通过在自己的自定义提供程序中扩展__INLINE_CODE_98__，并在__INLINE_CODE_99__方法中重写来自定义。

#### 可重试异常

类似于其他传输器，所有未处理的异常将自动包装为__INLINE_CODE_100__并转换为“用户友好”格式。然而，在某些边界情况下，您可能想绕过这个机制，让异常被__INLINE_CODE_102__驱动程序消费，而不是自动重试。抛出异常时处理消息将 instruct __INLINE_CODE_102__重试该消息（重新发送它），这意味着，即使消息（或事件）处理器被触发，但offset不会被提交到Kafka中。

> 警告 **警告** 对于事件处理程序（基于事件的通信），所有未处理的异常默认为可重试异常。

为了实现这一点，您可以使用专门的类__INLINE_CODE_103__，如下所示：

__CODE_BLOCK_16__

> 重要提示__INLINE_CODE_104__类来自__INLINE_CODE_105__包。

### 自定义异常处理

除了默认的错误处理机制，您可以创建一个自定义的Exception Filter来管理重试逻辑。例如，以下示例演示了如何在可配置的次数后跳过一个问题事件：

__CODE_BLOCK_17__

这个过滤器提供了一种方式来重试处理Kafka事件，直到可配置的次数达到。达到最大重试次数后，它将触发一个自定义__INLINE_CODE_106__（如果提供），然后提交offset，从而跳过问题事件。这允许后续事件继续处理而无需中断。

您可以将这个过滤器添加到事件处理程序中：

__CODE_BLOCK_18__

#### 提交offset

提交offset是工作于Kafka中的关键操作。默认情况下，消息将自动提交在特定时间过期。更多信息请访问__LINK_221__。__INLINE_CODE_107__提供了一种方式来访问活动consumer，以便手动提交offset。consumer是KafkaJS consumer，并且工作于__LINK_222__。

__CODE_BLOCK_19__

要 disable 自动提交消息，请在__INLINE_CODE_109__配置中设置__INLINE_CODE_108__，如下所示：

__CODE_BLOCK_20__

#### 实例状态更新

要获取实时更新关于连接和底层驱动器实例的状态，您可以订阅__INLINE_CODE_110__流。这条流提供了特定于选择的驱动器的状态更新。对于Kafka驱动器",__INLINE_CODE_111__"流 emit __INLINE_CODE_112__, __INLINE_CODE_113__, __INLINE_CODE_114__, __INLINE_CODE_115__, 和 __INLINE_CODE_116__ 事件。

__CODE_BLOCK_21__

> 重要提示__INLINE_CODE_117__类型来自__INLINE_CODE_118__包。

类似地，您可以订阅服务器的__INLINE_CODE_119__流，以接收服务器状态的通知。

__CODE_BLOCK_22__

#### underlying producer and consumer

对于更复杂的用例，您可能需要访问底层生产者和消费者实例。这可以用于手动关闭连接或使用驱动器专门的方法。然而，请注意，在大多数情况下，您**不需要**访问驱动器。

要做到这一点，您可以使用__INLINE_CODE_120__和__INLINE_CODE_121__ getter exposed by the __INLINE_CODE_122__ instance。

__CODE_BLOCK_23__