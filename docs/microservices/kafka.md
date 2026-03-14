<!-- 此文件从 content/microservices/kafka.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T04:56:00.914Z -->
<!-- 源文件: content/microservices/kafka.md -->

### Kafka

__LINK_213__ 是一个开源、分布式流处理平台，拥有三个关键功能：

- 发布和订阅记录流，类似于消息队列或企业消息系统。
- 持久存储记录流，以确保 fault-tolerant 和可靠。
- 处理记录流实时。

Kafka 项目旨在提供一个高通量、低延迟的平台来处理实时数据 feeds。它与 Apache Storm 和 Spark 等流处理工具集成。

#### 安装

要开始构建 Kafka-基于的微服务，首先安装所需的包：

```bash
$ npm i --save ioredis

```

#### 概述

与其他 Nest 微服务 transport 层实现一样，您可以使用 `@Client()` 属性来选择 Kafka 运输机制，并将可选 `@Payload()` 属性传递给 `RedisContext` 方法，示例如下：

```typescript
const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
  transport: Transport.REDIS,
  options: {
    host: 'localhost',
    port: 6379,
  },
});

```

> info **提示** `@Ctx()` 枚举来自 `RedisContext` 包。

#### 选项

`@nestjs/microservices` 属性特定于选择的运输机制。__HTML_TAG_123__Kafka__HTML_TAG_124__ 运输机制 exposes 下述属性。

__HTML_TAG_125__
  __HTML_TAG_126__
    __HTML_TAG_127____HTML_TAG_128__client__HTML_TAG_129____HTML_TAG_130__
    __HTML_TAG_131__Client 配置选项（查看更多信息 __HTML_TAG_132__这里__HTML_TAG_133__）__HTML_TAG_134__
  __HTML_TAG_135__
  __HTML_TAG_136__
    __HTML_TAG_137____HTML_TAG_138__consumer__HTML_TAG_139____HTML_TAG_140__
    __HTML_TAG_141__Consumer 配置选项（查看更多信息 __HTML_TAG_142__这里__HTML_TAG_143__）__HTML_TAG_144__
  __HTML_TAG_145__
  __HTML_TAG_146__
    __HTML_TAG_147____HTML_TAG_148__run__HTML_TAG_149____HTML_TAG_150__
    __HTML_TAG_151__Run 配置选项（查看更多信息 __HTML_TAG_152__这里__HTML_TAG_153__）__HTML_TAG_154__
  __HTML_TAG_155__
  __HTML_TAG_156__
    __HTML_TAG_157____HTML_TAG_158__subscribe__HTML_TAG_159____HTML_TAG_160__
    __HTML_TAG_161__Subscribe 配置选项（查看更多信息 __HTML_TAG_162__这里__HTML_TAG_163__）__HTML_TAG_164__
  __HTML_TAG_165__
  __HTML_TAG_166__
    __HTML_TAG_167____HTML_TAG_168__producer__HTML_TAG_169____HTML_TAG_170__
    __HTML_TAG_171__Producer 配置选项（查看更多信息 __HTML_TAG_172__这里__HTML_TAG_173__）__HTML_TAG_174__
  __HTML_TAG_175__
  __HTML_TAG_176__
    __HTML_TAG_177____HTML_TAG_178__send__HTML_TAG_179____HTML_TAG_180__
    __HTML_TAG_181__Send 配置选项（查看更多信息 __HTML_TAG_182__这里__HTML_TAG_183__）__HTML_TAG_184__
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

与其他微服务 transport 层实现不同的是，Kafka 使用 `true` 类，而不是 `wildcards` 类。

与其他微服务 transport 层实现一样，您可以使用 __HTML_TAG_207__多种方式__HTML_TAG_208__ 来创建 `psubscribe` 实例。

创建实例的一种方法是使用 `pmessage`。以创建一个客户端实例，使用 `wildcards` 属性作为注入 token。查看更多信息 `connected` __HTML_TAG_209__这里__HTML_TAG_210__。

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

其他创建客户端实例的方法（例如 `disconnected` 或 `reconnecting`）也可以使用。查看更多信息 __HTML_TAG_211__这里__HTML_TAG_212__。

使用 __INLINE_CODEWhen new ``error`` instances are launched, they join the consumer group and subscribe to their respective topics. This process triggers a rebalance of topic partitions assigned to consumers of the consumer group.

通常，topic 分区是使用圆 robin 分区器分配的，这将 topic 分区分配给一组消费者，排序方式是根据消费者名称，名称随机设置在应用程序启动时。然而，当新的消费者加入消费者组时，新的消费者可以在消费者组中的任意位置。这样，已经存在的消费者可能在重新平衡时被分配不同的分区，从而导致消费者失去请求响应消息。

为了防止 ``on()`` 消费者失去响应消息，Nest 提供了一个自定义分区器，可以将分区分配给一组消费者，排序方式是根据高分辨率时间戳（``RedisEvents``），这些时间戳在应用程序启动时设置。

#### 消息响应订阅

> 警告 **注意** 如果您使用 `__LINK_216__` 消息风格（带有 ``@nestjs/microservices`` 装饰器和 ``unwrap()`` 方法），则不需要订阅响应主题。对于 `__LINK_217__` 通信（``ioredis`` 装饰器和 `__INLINE_CODE_50__` 方法），不需要订阅响应主题。

`__INLINE_CODE_51__` 类提供了 `__INLINE_CODE_52__` 方法。`__INLINE_CODE_53__` 方法将请求的主题名称作为参数，并将派生的回复主题名称添加到回复主题集合中。这个方法在实现消息模式时是必需的。

```typescript
const app = await NestFactory.createMicroservice(AppModule, {
  transport: Transport.REDIS,
  options: {
    // Other options
    wildcards: true,
  },
});

```

如果 `__INLINE_CODE_54__` 实例异步创建，则需要在调用 `__INLINE_CODE_56__` 方法之前调用 `__INLINE_CODE_55__` 方法。

```typescript
@EventPattern('notifications.*')

```

#### 入站

Nest 接收入站 Kafka 消息作为一个对象，具有 `__INLINE_CODE_57__`、`__INLINE_CODE_58__` 和 `__INLINE_CODE_59__` 属性，值类型是 `__INLINE_CODE_60__`。Nest 然后将这些值解析为字符串。如果字符串是 "object like"，Nest 尝试将字符串解析为 `__INLINE_CODE_61__`。然后，`__INLINE_CODE_62__` 将被传递给其关联的处理程序。

#### 出站

Nest 发送出站 Kafka 消息在发布事件或发送消息时发生。这是在 `__INLINE_CODE_63__`、`__INLINE_CODE_64__` 和 `__INLINE_CODE_65__` 方法的参数或从 `__INLINE_CODE_66__` 方法返回值中发生的。这次序列化会将非字符串或缓冲区对象转换为字符串，使用 `__INLINE_CODE_67__` 或 `__INLINE_CODE_68__` 原型方法。

```typescript
this.client.status.subscribe((status: RedisStatus) => {
  console.log(status);
});

```

> 提示 **提示** `__INLINE_CODE_69__` 是从 `__INLINE_CODE_70__` 包中导入的。

出站消息也可以通过传入一个对象，具有 `__INLINE_CODE_71__` 和 `__INLINE_CODE_72__` 属性来键。键消息对于满足 `__LINK_218__` 是非常重要的。

```typescript
const server = app.connectMicroservice<MicroserviceOptions>(...);
server.status.subscribe((status: RedisStatus) => {
  console.log(status);
});

```

此外，这些格式的消息也可以包含自定义头，设置在 `__INLINE_CODE_73__` 哈希属性中。哈希属性值必须是类型 `__INLINE_CODE_74__` 或类型 `__INLINE_CODE_75__`。

```typescript
this.client.on('error', (err) => {
  console.error(err);
});

```

#### 事件驱动

在请求-响应方法中交换消息之间的服务时，事件驱动方法是更合适的 - 在您只想发布事件而不等待响应时。在那种情况下，您不想维护两个主题的开销。

查看以下两个部分以了解更多关于这个主题：`__LINK_219__` 和 `__LINK_220__`。

#### 上下文

在更复杂的场景中，您可能需要访问 incoming 请求的额外信息。当使用 Kafka 传输器时，可以访问 `__INLINE_CODE_76__` 对象。

```typescript
server.on<RedisEvents>('error', (err) => {
  console.error(err);
});

```

> 提示 **提示** `__INLINE_CODE_77__`、`__INLINE_CODE_78__` 和 `__INLINE_CODE_79__` 是从 `__INLINE_CODE_80__` 包中导入的。

要访问原始 Kafka 消息对象，请使用 `__INLINE_CODE_82__` 方法，方法如下：

```typescript
const [pub, sub] =
  this.client.unwrap<[import('ioredis').Redis, import('ioredis').Redis]>();

```

其中 `__INLINE_CODE_84__` 实现了以下接口：

```typescript
const [pub, sub] =
  server.unwrap<[import('ioredis').Redis, import('ioredis').Redis]>();

```

如果您的处理程序涉及到每个接收到的消息的慢处理时间，您应该考虑使用 `__INLINE_CODE_85__` 回调。要获取 `__INLINE_CODE_86__` 函数，请使用 `__INLINE_CODE_87__` 方法，方法如下：

__CODE_BLOCK_12__

#### 命名约定Here is the translation of the provided English technical documentation to Chinese, following the rules and guidelines:

### Kafka微服务组件

Kafka微服务组件将在__INLINE_CODE_89__和__INLINE_CODE_90__选项中添加它们各自的描述，以避免Nest微服务客户端和服务器组件之间的冲突。默认情况下,__INLINE_CODE_91__组件将添加__INLINE_CODE_92__,而__INLINE_CODE_93__组件将添加__INLINE_CODE_94__到这两个选项中。请注意，以下提供的值如何被转换（如同注释中所示）。

__CODE_BLOCK_13__

并且对于客户端：

__CODE_BLOCK_14__

> info **提示** Kafka客户端和消费者命名约定可以通过扩展__INLINE_CODE_95__和__INLINE_CODE_96__在自己的自定义提供者中，并重写构造函数来自定义。

由于Kafka微服务消息模式使用两个主题来实现请求和回复通道，一般来说，回复模式应该从请求topic派生。默认情况下，回复topic的名称是请求topic名称加上__INLINE_CODE_97__。

__CODE_BLOCK_15__

> info **提示** Kafka回复topic命名约定可以通过扩展__INLINE_CODE_98__在自己的自定义提供者中，并重写__INLINE_CODE_99__方法来自定义。

#### 可重试异常

类似于其他传输器，所有未处理的异常将被自动包装到__INLINE_CODE_100__中，并转换为“用户友好”格式。然而，在某些边缘情况下，您可能想绕过这个机制，让异常被__INLINE_CODE_101__驱动程序消费。抛出异常时处理消息将 instruct __INLINE_CODE_102__重试它（重新发送它），这意味着，即使消息处理器已经被触发，但offset不会被提交到Kafka中。

> 警告 **警告** 对于事件处理器（事件通信），所有未处理的异常默认情况下都是可重试异常。

为了实现这个，您可以使用一个名为__INLINE_CODE_103__的专门类，以下是一种示例：

__CODE_BLOCK_16__

> info **提示** __INLINE_CODE_104__类来自__INLINE_CODE_105__包。

### 自定义异常处理

除了默认的错误处理机制，您还可以创建一个自定义的Kafka事件Exception Filter来管理重试逻辑。例如，以下示例演示了如何在可配置的次数后跳过问题事件：

__CODE_BLOCK_17__

这个过滤器提供了一种方式来重试处理Kafka事件，直到可配置的次数达到。达到最大重试次数后，它将触发一个自定义__INLINE_CODE_106__(如果提供)，并提交offset，有效地跳过问题事件。这允许后续事件继续处理不中断。

您可以将该过滤器集成到事件处理器中：

__CODE_BLOCK_18__

#### 提交offset

提交offset对于使用Kafka非常重要。默认情况下，消息将在特定的时间自动提交。更多信息请查看__LINK_221__。__INLINE_CODE_107__提供了一种方式来访问活动消费者，以便手动提交offset。消费者是KafkaJS消费者，并且工作于__LINK_222__。

__CODE_BLOCK_19__

要禁用消息的自动提交，请在__INLINE_CODE_109__配置中设置__INLINE_CODE_108__，如下所示：

__CODE_BLOCK_20__

#### 实例状态更新

要获取实时更新关于连接和driver实例状态，您可以订阅__INLINE_CODE_110__流。这条流提供了driver选择的状态更新。对于Kafka驱动程序，__INLINE_CODE_111__流.emit__INLINE_CODE_112__、__INLINE_CODE_113__、__INLINE_CODE_114__、__INLINE_CODE_115__和__INLINE_CODE_116__事件。

__CODE_BLOCK_21__

> info **提示** __INLINE_CODE_117__类型来自__INLINE_CODE_118__包。

同样，您可以订阅服务器的__INLINE_CODE_119__流以接收服务器状态通知。

__CODE_BLOCK_22__

#### underlying producer and consumer

在某些高级用例中，您可能需要访问underlying producer和consumer实例。这可以在手动关闭连接或使用driver特定方法时很有用。然而，请注意，在大多数情况下，您**不需要**直接访问driver。

要访问这些实例，您可以使用__INLINE_CODE_120__和__INLINE_CODE_121__ getter expose by __INLINE_CODE_122__实例。

__CODE_BLOCK_23__