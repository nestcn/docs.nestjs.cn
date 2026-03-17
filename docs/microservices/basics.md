<!-- 此文件从 content/microservices/basics.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:48:22.550Z -->
<!-- 源文件: content/microservices/basics.md -->

### Overview

除了传统的（有时称为 monolithic）应用程序架构外，Nest 本质上支持微服务架构风格的开发。这个文档中讨论的许多概念，如依赖注入、装饰器、异常过滤器、管道、守卫和拦截器，对微服务也同样适用。哪里可能，Nest 抽象实现细节，使得相同的组件可以在 HTTP 基于平台、WebSockets 和微服务中运行。这部分涵盖了 Nest 对微服务的特定方面。

在 Nest 中，微服务本质上是一个使用不同的 **传输层** 而不是 HTTP 的应用程序。

__HTML_TAG_140____HTML_TAG_141____HTML_TAG_142__

Nest 支持多个内置的传输层实现，称为 **传输器**，它们负责在不同的微服务实例之间传输消息。大多数传输器本质上支持 beide 请求-响应 和 事件 基的消息风格。Nest 抽象每个传输器的实现细节，提供了对请求-响应 和 事件 基的 messaging 的标准接口。这使得您可以轻松地切换到另一个传输层 - 例如，以利用某个传输层的特定可靠性或性能特性 - 而不影响应用程序代码。

#### 安装

要开始构建微服务，首先安装所需的包：

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    snapshot: true,
  });
  await app.listen(process.env.PORT ?? 3000);
}

```

#### 开始使用

要实例化一个微服务，使用 `false` 方法的 `graph.json` 类：

```bash
$ npm i @nestjs/devtools-integration

```

> info **提示** 微服务默认使用 **TCP** 传输层。

`TasksModule` 方法的第二个参数是一个 `DiagnosticsService` 对象。这对象可能包含两个成员：

__HTML_TAG_143__
  __HTML_TAG_144__
    __HTML_TAG_145____HTML_TAG_146__transport__HTML_TAG_147____HTML_TAG_148__
    __HTML_TAG_149__指定传输器（例如 __HTML_TAG_150__Transport.NATS__HTML_TAG_151__)__HTML_TAG_152__
  __HTML_TAG_153__
  __HTML_TAG_154__
    __HTML_TAG_155____HTML_TAG_156__options__HTML_TAG_157____HTML_TAG_158__
    __HTML_TAG_159__传输器特定的选项对象，确定传输器行为__HTML_TAG_160__
  __HTML_TAG_161__
__HTML_TAG_162__
__HTML_TAG_163__
  __HTML_TAG_164__options__HTML_TAG_165__ 对象是特定于选择的传输器的。__HTML_TAG_166__TCP__HTML_TAG_167__ 传输器暴露以下属性。对于其他传输器（例如 Redis、MQTT 等），请查看相关章节，以了解可用的选项。
__HTML_TAG_168__
__HTML_TAG_169__
  __HTML_TAG_170__
    __HTML_TAG_171____HTML_TAG_172__host__HTML_TAG_173____HTML_TAG_174__
    __HTML_TAG_175__连接主机名__HTML_TAG_176__
  __HTML_TAG_177__
  __HTML_TAG_178__
    __HTML_TAG_179____HTML_TAG_180__port__HTML_TAG_181____HTML_TAG_182__
    __HTML_TAG_183__连接端口__HTML_TAG_184__
  __HTML_TAG_185__
  __HTML_TAG_186__
    __HTML_TAG_187____HTML_TAG_188__retryAttempts__HTML_TAG_189____HTML_TAG_190__
    __HTML_TAG_191__消息重试次数（默认：__HTML_TAG_192__0__HTML_TAG_193__)__HTML_TAG_194__
  __HTML_TAG_195__
  __HTML_TAG_196__
    __HTML_TAG_197____HTML_TAG_198__retryDelay__HTML_TAG_199____HTML_TAG_200__
    __HTML_TAG_201__消息重试尝试之间的延迟（ms）（默认：__HTML_TAG_202__0__HTML_TAG_203__)__HTML_TAG_204__
  __HTML_TAG_205__
  __HTML_TAG_206__
    __HTML_TAG_207____HTML_TAG_208__serializer__HTML_TAG_209____HTML_TAG_210__
    __HTML_TAG_211__自定义 __HTML_TAG_212__序列化器__HTML_TAG_213__用于 outgoing 消息__HTML_TAG_214__
  __HTML_TAG_215__
  __HTML_TAG_216__
    __HTML_TAG_217____HTML_TAG_218__deserializer__HTML_TAG_219____HTML_TAG_220__
    __HTML_TAG_221__自定义 __HTML_TAG_222__反序列化器__HTML_TAG_223__用于 incoming 消息__HTML_TAG_224__
  __HTML_TAG_225__
  __HTML_TAG_226__
    __HTML_TAG_227____HTML_TAG_228__socketClass__HTML#### 请求响应

请求响应消息风格非常适合在多个外部服务之间交换消息。这种风格确保了服务实际收到了消息，而无需手动实现确认协议。然而，请求响应方法并不总是最好的选择。例如，流式传输器，如 __LINK_251__ 或 __LINK_252__，它们使用日志持久化，旨在解决与事件消息风格相对应的挑战（请参阅 __LINK_253__ 了解更多信息）。

要启用请求响应消息类型，Nest 创建了两个逻辑通道：一个用于传输数据，另一个用于等待 incoming 响应。对于某些基础传输，如 __LINK_254__，Nest 提供了内置支持。对其他传输，Nest 会手动创建分离的通道。虽然这有效，但它可能会 introduces some  overhead。因此，如果您不需要请求响应消息风格，您可能想考虑使用事件驱动方法。

要创建基于请求响应风格的消息处理程序，使用来自 `TasksModule` 包的 `TasksService` 装饰器。该装饰器只能在 __LINK_255__ 类中使用，因为它们是应用程序的入口点。将其在提供者中使用将无效，因为 Nest 运行时将忽略它们。

```typescript
@Module({
  imports: [
    DevtoolsModule.register({
      http: process.env.NODE_ENV !== 'production',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

```

在上面的代码中， `DiagnosticsModule` **消息处理程序** 监听匹配 `TasksModule` 消息模式的消息。消息处理程序将单个参数，来自客户端的 `console.table()`。在这种情况下，数据是一个数字数组，需要累积。

#### 异步响应

消息处理程序可以同步或 **异步** 响应，即支持 `table()` 方法。

```typescript
bootstrap().catch((err) => {
  fs.writeFileSync('graph.json', PartialGraphHost.toString() ?? '');
  process.exit(1);
});

```

消息处理程序也可以返回 `SerializedGraph`，在这种情况下，结果值将直到流完成被 emit。

```typescript
const app = await NestFactory.create(AppModule, {
  snapshot: true,
  abortOnError: false, // <--- THIS
});

```

在上面的示例中，消息处理程序将响应 **三次**，一次对每个数组项。

#### 事件驱动

虽然请求响应方法非常适合在服务之间交换消息，但是在事件驱动 messaging 中，它不太合适。在这种情况下，保持两个通道的请求响应是多余的。

例如，如果您想通知另一个服务在这个系统的一部分中出现了特定条件，那么事件驱动消息风格是理想的。

要创建事件处理程序，可以使用来自 __INLINE_CODE_39__ 包的 `@nestjs/core` 装饰器。

```typescript
await app.listen(process.env.PORT ?? 3000); // OR await app.init()
fs.writeFileSync('./graph.json', app.get(SerializedGraph).toString());

```

>  info **提示** 您可以注册多个事件处理程序来处理单个事件模式，并且所有它们都将自动并行触发。

__INLINE_CODE_40__ **事件处理程序** 监听 __INLINE_CODE_41__ 事件。事件处理程序将单个参数，来自客户端的 __INLINE_CODE_42__（在这种情况下，是网络上发送的事件负载）。

__HTML_TAG_247____HTML_TAG_248__

#### 附加请求详细信息

在更复杂的情况下，您可能需要访问 incoming 请求的附加详细信息。例如，在使用 NATS 进行 wilcard 订阅时，您可能想检索原始主体，该主体是生产者发送消息的。同样，在 Kafka 中，您可能需要访问消息头。要实现这点，可以使用以下装饰器：

__CODE_BLOCK_6__

>  info **提示** __INLINE_CODE_43__、__INLINE_CODE_44__ 和 __INLINE_CODE_45__ 是来自 __INLINE_CODE_46__ 的。

>  info **提示** 您也可以将属性键传递给 __INLINE_CODE_47__ 装饰器，以从 incoming  payload 对象中提取特定属性，例如 __INLINE_CODE_48__。

#### 客户端（生产者类）

客户端 Nest 应用程序可以使用 __INLINE_CODE_49__ 类与 Nest 微服务交换消息或发布事件。这个类提供了多个方法，如 __INLINE_CODE_50__（用于请求响应 messaging）和 __INLINE_CODE_51__（用于事件驱动 messaging），从而启用与远程微服务的通信。您可以使用以下方法获取这个类的实例：

一种方法是导入 __INLINE_CODE_52__，该类 expose 了静态 __INLINE_CODE_53__ 方法。这个方法接受一个数组，表示微服务传输器。每个对象必须包含 __INLINE_CODE_54__ 属性， optionally  __INLINE_CODE_55__ 属性（默认为 __INLINE_CODE_56__），以及可选 __INLINE_CODE_57__ 属性。Here is the translated document:

__INLINE_CODE_58__ 属性作为一个 **注入令牌**，您可以在需要时注入一个 __INLINE_CODE_59__ 实例的实例。这个 __INLINE_CODE_60__ 属性的值可以是任何字符串或 JavaScript 符号，正如 __LINK_256__ 中所描述的。

__INLINE_CODE_61__ 属性是一个对象，其中包括了我们在 __INLINE_CODE_62__ 方法中看到的相同属性。

__CODE_BLOCK_7__

或者，您可以使用 __INLINE_CODE_63__ 方法，如果需要在设置时提供配置或执行其他异步操作。

__CODE_BLOCK_8__

一旦模块被导入，您可以使用 __INLINE_CODE_66__ 装饰器将 __INLINE_CODE_64__ 配置为指定选项的 __INLINE_CODE_65__ 传输器实例。

__CODE_BLOCK_9__

> info **注意** __INLINE_CODE_67__ 和 __INLINE_CODE_68__ 类来自 __INLINE_CODE_69__ 包。

有时，您可能需要从另一个服务（例如 __INLINE_CODE_70__）中获取传输器配置，而不是将其硬编码在客户端应用程序中。为了实现这个，您可以使用 __INLINE_CODE_71__ 类注册一个 __LINK_257__。这个类提供了一个静态 __INLINE_CODE_72__ 方法，接受传输器选项对象并返回一个自定义 __INLINE_CODE_73__ 实例。

__CODE_BLOCK_10__

> info **注意** __INLINE_CODE_74__ 是来自 __INLINE_CODE_75__ 包的。

另一个选项是使用 __INLINE_CODE_76__ 属性装饰器。

__CODE_BLOCK_11__

> info **注意** __INLINE_CODE_77__ 装饰器来自 __INLINE_CODE_78__ 包。

使用 __INLINE_CODE_79__ 装饰器不是首选，因为它更难测试，更难共享客户端实例。

__INLINE_CODE_80__ 是 **lazy** 的。它不会立即建立连接。相反，它将在首次微服务调用时建立连接，然后在每个后续调用中重用。然而，如果您想要在应用程序启动时延迟连接建立，您可以在 __INLINE_CODE_83__ 生命周期钩子中手动建立连接使用 __INLINE_CODE_82__ 方法。

__CODE_BLOCK_12__

如果无法创建连接，__INLINE_CODE_84__ 方法将 reject 使用相应的错误对象。

#### 发送消息

__INLINE_CODE_85__ expose 一个 __INLINE_CODE_86__ 方法。这方法用于调用微服务并返回一个 __INLINE_CODE_87__ 对象，其中包含响应。因此，我们可以轻松地订阅 emitted 值。

__CODE_BLOCK_13__

__INLINE_CODE_88__ 方法接受两个参数，__INLINE_CODE_89__ 和 __INLINE_CODE_90__。__INLINE_CODE_91__ 应该匹配 __INLINE_CODE_92__ 装饰器中定义的之一。__INLINE_CODE_93__ 是我们想传输到远程微服务的消息。这方法返回一个 **cold __INLINE_CODE_94__**，这意味着您需要明确地订阅它才能发送消息。

#### 发布事件

要发送事件，请使用 __INLINE_CODE_95__ 对象的 __INLINE_CODE_96__ 方法。这方法将事件发布到消息代理。

__CODE_BLOCK_14__

__INLINE_CODE_97__ 方法接受两个参数：__INLINE_CODE_98__ 和 __INLINE_CODE_99__。__INLINE_CODE_100__ 应该匹配 __INLINE_CODE_101__ 装饰器中定义的之一，而 __INLINE_CODE_102__ 表示您想传输到远程微服务的事件数据。这方法返回一个 **hot __INLINE_CODE_103__**（与 __INLINE_CODE_104__ 返回的 cold __INLINE_CODE_105__ 相反），这意味着无论您是否明确地订阅 observable，代理都会立即尝试传递事件。

__HTML_TAG_249____HTML_TAG_250__

#### 请求范围

对于来自不同编程语言背景的人来说，它可能会感到惊訝，在 Nest 中，大多数事情都是跨越 incoming 请求共享的。这包括连接池到数据库、单例服务具有全局状态等。请注意，Node.js 不遵循请求/响应多线程无状态模型，每个请求都是由单独线程处理的。因此，使用单例实例是 **安全** 的。

然而，有些 edge 情况下，请求基于的 lifetime 处理可能是有用的。这可能包括情况，如 GraphQL 应用程序的 per-request 缓存、请求跟踪或多租户。您可以了解如何控制范围 __LINK_258__。

请求范围的处理器和提供商可以使用 __INLINE_CODE_107__ 装饰器在结合 __INLINE_CODE_108__ 令牌中注入 __INLINE_CODE_106__：

__CODE_BLOCK_15__

这提供了对 __INLINE_CODE_109__ 对象的访问，该对象具有两个属性：

__CODE_BLOCK_16__Here is the translation of the English technical documentation to Chinese:

#### 实例状态更新

要实时获取连接和底层驱动实例的状态更新，可以订阅 __INLINE_CODE_112__ 流。这个流提供了与选定的驱动相关的状态更新。例如，如果您使用的是 TCP 传输器（默认情况下），__INLINE_CODE_113__ 流将 emit __INLINE_CODE_114__ 和 __INLINE_CODE_115__ 事件。

__CODE_BLOCK_17__

> info **提示** __INLINE_CODE_116__ 类型来自 __INLINE_CODE_117__ 包。

类似地，您也可以订阅服务器的 __INLINE_CODE_118__ 流以接收服务器状态通知。

__CODE_BLOCK_18__

#### 监听内部事件

在某些情况下，您可能需要监听微服务内部事件。例如，您可以监听 __INLINE_CODE_119__ 事件来触发在错误发生时的额外操作。要做到这一点，请使用 __INLINE_CODE_120__ 方法，如下所示：

__CODE_BLOCK_19__

类似地，您也可以监听服务器内部事件：

__CODE_BLOCK_20__

> info **提示** __INLINE_CODE_121__ 类型来自 __INLINE_CODE_122__ 包。

#### 底层驱动访问

对于更高级的使用场景，您可能需要访问底层驱动实例。这可以在手动关闭连接或使用驱动特定的方法时有用。然而，除非必要，否则应该避免访问驱动实例。

要做到这一点，可以使用 __INLINE_CODE_123__ 方法，它将返回底层驱动实例。泛型类型参数应该指定期望的驱动实例类型。

__CODE_BLOCK_21__

此处 __INLINE_CODE_124__ 是来自 __INLINE_CODE_125__ 模块的类型。

类似地，您也可以访问服务器的底层驱动实例：

__CODE_BLOCK_22__

#### 处理超时

在分布式系统中，微服务可能会暂时下线或不可用。为了防止长时间等待，您可以使用超时。超时是一种非常有用的模式，当与其他服务通信时使用。要将超时应用于微服务调用，请使用 __LINK_259__ __INLINE_CODE_126__ 操作符。如果微服务在指定时间内没有响应，会抛出异常，您可以捕获并处理该异常。

要实现这一点，您需要使用 __LINK_260__ 包。简单地在管道中使用 __INLINE_CODE_128__ 操作符：

__CODE_BLOCK_23__

> info **提示** __INLINE_CODE_129__ 操作符来自 __INLINE_CODE_130__ 包。

如果微服务在 5 秒内没有响应，将抛出错误。

#### TLS 支持

在外部网络通信时，需要加密流量以确保安全。在 NestJS 中，可以使用 Node 的内置 __LINK_261__ 模块实现 TLS over TCP。Nest 提供了对 TCP 传输的内置 TLS 支持，从而允许在微服务或客户端之间加密通信。

要为 TCP 服务器启用 TLS，可以添加私钥和证书到服务器选项中，并指定 key 和 cert 文件，如下所示：

__CODE_BLOCK_24__

为客户端通信 securely over TLS，可以定义 __INLINE_CODE_132__ 对象，但这次使用 CA 证书。这是签名服务器证书的权威机构的证书。这确保客户端信任服务器证书并可以建立安全连接。

__CODE_BLOCK_25__

您也可以将 CA 列表传递给客户端，以在您的设置中涉及多个可信任的权威机构。

一旦 everything 设置好了，可以使用 __INLINE_CODE_133__ 作为 usual 使用 __INLINE_CODE_134__ 装饰器来使用客户端在服务中。这样可以确保在 NestJS 微服务之间加密通信，Node 的 __INLINE_CODE_135__ 模块处理加密细节。

对于更多信息，请参阅 Node 的 __LINK_262__。

#### 动态配置

当微服务需要使用 __INLINE_CODE_136__ (来自 __INLINE_CODE_137__ 包)进行配置，但注入上下文只有在微服务实例创建后可用时，__INLINE_CODE_138__ 提供了解决方案。这项方法允许动态配置，从而确保与 __INLINE_CODE_139__ 的顺滑集成。

__CODE_BLOCK_26__