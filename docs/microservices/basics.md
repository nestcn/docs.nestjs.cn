<!-- 此文件从 content/microservices/basics.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T05:15:37.237Z -->
<!-- 源文件: content/microservices/basics.md -->

### Overview

Nestрім支持傳統（有時稱為 monolithic）的應用架構外，還原生支持微服務架構的開發風格。許多討論在文檔中的概念，例如依賴注入、裝飾器、異常過濾器、管道、守衛和拦截器，在微服務中同樣適用。Nest抽象了實現細節，以便相同的組件可以在 HTTP 基礎平台、WebSocket 和微服務中運行。這一部分涵蓋 Nest 對微服務的特定方面。

在 Nest 中，微服務基本上是一個使用不同的傳輸層別於 HTTP 的應用。

__HTML_TAG_140____HTML_TAG_141____HTML_TAG_142__

Nest 支持多種內置傳輸層實現，稱為傳輸器，負責在不同微服務實例之間傳輸訊息。多數傳輸器本質上支持both請求-回應和事件-基于的訊息風格。Nest 對每個傳輸器的實現細節進行抽象，將請求-回應和事件-基于的訊息風格的接口 cannedailize。這使得可以輕鬆地切換到不同的傳輸層別，例如利用特定的傳輸層別的可靠性或性能特徵，而不影響應用代碼。

#### 安裝

要開始構建微服務，首先安裝所需的套件：

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    snapshot: true,
  });
  await app.listen(process.env.PORT ?? 3000);
}

```

#### 開始

要啟動微服務，使用 `false` 方法：

```bash
$ npm i @nestjs/devtools-integration

```

> info **Hint** 微服務使用 TCP 傳輸層别預設。

第二個參數是 `DiagnosticsService` 物件。這個物件可能包含兩個成員：

__HTML_TAG_143__
  __HTML_TAG_144__
    __HTML_TAG_145____HTML_TAG_146__transport__HTML_TAG_147____HTML_TAG_148__
    __HTML_TAG_149__指定傳輸器（例如 __HTML_TAG_150__Transport.NATS__HTML_TAG_151__）__HTML_TAG_152__
  __HTML_TAG_153__
  __HTML_TAG_154__
    __HTML_TAG_155____HTML_TAG_156__options__HTML_TAG_157____HTML_TAG_158__
    __HTML_TAG_159__傳輸器特定的選項對象，決定傳輸器行為__HTML_TAG_160__
  __HTML_TAG_161__
__HTML_TAG_162__
__HTML_TAG_163__
  __HTML_TAG_164__options__HTML_TAG_165__ 物件是選擇的傳輸器特定的。TCP傳輸器 expose
  下述屬性。其他傳輸器（例如 Redis、MQTT 等），請參考相關章節以了解可用的選項。
__HTML_TAG_168__
__HTML_TAG_169__
  __HTML_TAG_170__
    __HTML_TAG_171____HTML_TAG_172__host__HTML_TAG_173____HTML_TAG_174__
    __HTML_TAG_175__連接主機名__HTML_TAG_176__
  __HTML_TAG_177__
  __HTML_TAG_178__
    __HTML_TAG_179____HTML_TAG_180__port__HTML_TAG_181____HTML_TAG_182__
    __HTML_TAG_183__連接端口__HTML_TAG_184__
  __HTML_TAG_185__
  __HTML_TAG_186__
    __HTML_TAG_187____HTML_TAG_188__retryAttempts__HTML_TAG_189____HTML_TAG_190__
    __HTML_TAG_191__重試訊息的次數（默認： __HTML_TAG_192__0__HTML_TAG_193__）__HTML_TAG_194__
  __HTML_TAG_195__
  __HTML_TAG_196__
    __HTML_TAG_197____HTML_TAG_198__retryDelay__HTML_TAG_199____HTML_TAG_200__
    __HTML_TAG_201__訊息重試次數之間的延遲（ms）（默認： __HTML_TAG_202__0__HTML_TAG_203__）__HTML_TAG_204__
  __HTML_TAG_205__
  __HTML_TAG_206__
    __HTML_TAG_207____HTML_TAG_208__serializer__HTML_TAG_209____HTML_TAG_210__
    __HTML_TAG_211__自定義 __HTML_TAG_212__序列化器__HTML_TAG_213__ для出站訊息__HTML_TAG_214__
  __HTML_TAG_215__
  __HTML_TAG_216__
    __HTML_TAG_217____HTML_TAG_218__deserializer__HTML_TAG_219____HTML_TAG_220__
    __HTML_TAG_221__自定義 __HTML_TAG_222__反序列化器__HTML_TAG_223__ для入站訊息__HTML_TAG_224__
  __HTML_TAG_225__
  __HTML_TAG_226__
    __HTML_TAG_227____HTML_TAG_#### 请求-响应

请求-响应消息风格非常适合在多个外部服务之间交换消息。这种风格确保了服务已经收到消息（无需手动实现确认协议）。然而，请求-响应方法并不总是最好的选择。例如，流式传输器，如 __LINK_251__ 或 __LINK_252__，使用日志 Persistence，旨在解决不同的挑战，更加接近事件消息风格（请查看 __LINK_253__ 了解更多信息）。

要启用请求-响应消息类型，Nest 创建两个逻辑通道：一个用于传输数据，另一个用于等待 incoming 响应。对于一些基础传输，例如 __LINK_254__，Nest 提供了内置支持。对于其他传输，Nest 会手动创建 separate 通道。虽然这有效，但可能会引入一些开销。因此，如果您不需要请求-响应消息风格，您可能想考虑使用事件驱动方法。

要创建基于请求-响应风格的消息处理器，使用 `TasksService` 装饰器，该装饰器来自 `TasksModule` 包。该装饰器只能在 __LINK_255__ 类中使用，因为它们是应用程序的入口点。使用它在提供者中将无效，因为它们将被 Nest 运行时忽略。

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

在上面的代码中，`DiagnosticsModule` 消息处理器监听匹配 `TasksModule` 消息模式的消息。消息处理器接受单个参数，即来自客户端的 `console.table()`。在这个例子中，数据是一个数组，需要累积。

#### 异步响应

消息处理器可以同步或异步响应，支持 `table()` 方法。

```typescript
bootstrap().catch((err) => {
  fs.writeFileSync('graph.json', PartialGraphHost.toString() ?? '');
  process.exit(1);
});

```

消息处理器也可以返回 `SerializedGraph`，那么结果值将直到流完成时被 emit。

```typescript
const app = await NestFactory.create(AppModule, {
  snapshot: true,
  abortOnError: false, // <--- THIS
});

```

在上面的示例中，消息处理器将响应 __three__ 次，每个数组项一次。

#### 事件驱动

虽然请求-响应方法非常适合交换消息，但是对于事件驱动消息来说，保持两个通道是多余的。

例如，如果您想通知另一个服务在这个部分系统中发生了特定事件，那么事件驱动消息风格是理想的。

要创建事件处理器，您可以使用 `@nestjs/core` 装饰器，该装饰器来自 __INLINE_CODE_39__ 包。

```typescript
await app.listen(process.env.PORT ?? 3000); // OR await app.init()
fs.writeFileSync('./graph.json', app.get(SerializedGraph).toString());

```

> info **提示** 您可以注册多个事件处理器来处理单个事件模式，并且所有它们将自动并行触发。

__INLINE_CODE_40__ 事件处理器监听 __INLINE_CODE_41__ 事件。事件处理器接受单个参数，即来自客户端的 __INLINE_CODE_42__（在这个例子中是一个事件负载，已经通过网络发送）。

__HTML_TAG_247____HTML_TAG_248__

#### 额外请求详细信息

在更复杂的情况下，您可能需要访问 incoming 请求的额外详细信息。例如，在使用 NATS 时，您可能想获取原始主题，producer 发送消息时使用的主题。类似地，在 Kafka 中，您可能需要访问消息头。要实现这点，可以使用以下装饰器：

__CODE_BLOCK_6__

> info **提示** __INLINE_CODE_43__、__INLINE_CODE_44__ 和 __INLINE_CODE_45__ 来自 __INLINE_CODE_46__。

> info **提示** 您也可以将 property 键传递给 __INLINE_CODE_47__ 装饰器，以从 incoming  payload 对象中提取特定属性，例如 __INLINE_CODE_48__。

#### 客户端（生产者类）

客户端 Nest 应用程序可以使用 __INLINE_CODE_49__ 类与 Nest 微服务交换消息或发布事件。这个类提供了多个方法，如 __INLINE_CODE_50__（用于请求-响应 messaging）和 __INLINE_CODE_51__（用于事件驱动 messaging），以便与远程微服务通信。您可以通过以下方式获取该类的实例：

一种方法是导入 __INLINE_CODE_52__，该对象暴露了静态 __INLINE_CODE_53__ 方法。这个方法接受一个数组，数组中包含代表微服务传输器的对象。每个对象必须包含 __INLINE_CODE_54__ 属性， optionally __INLINE_CODE_55__ 属性（默认为 __INLINE_CODE_56__），以及可选 __INLINE_CODE_57__ 属性。Here is the translated documentation:

__INLINE_CODE_58__ 属性作为一个 **注入令牌**，可以在需要时注入一个 __INLINE_CODE_59__ 实例的实例。这个 __INLINE_CODE_60__ 属性的值可以是任意的字符串或 JavaScript 符号，详见 __LINK_256__。

__INLINE_CODE_61__ 属性是一个对象，包含了我们在 __INLINE_CODE_62__ 方法中看到的同样的 属性。

__CODE_BLOCK_7__

或者，您可以使用 __INLINE_CODE_63__ 方法，如果需要在设置时提供配置或执行其他异步操作。

__CODE_BLOCK_8__

一旦模块已经被导入，您可以使用 __INLINE_CODE_66__ 装饰器注入一个 __INLINE_CODE_64__ 实例，配置了指定的选项用于 __INLINE_CODE_65__ 传输器。

__CODE_BLOCK_9__

> info **提示** __INLINE_CODE_67__ 和 __INLINE_CODE_68__ 类来自 __INLINE_CODE_69__ 包。

有时，您可能需要从另一个服务（例如 __INLINE_CODE_70__）获取传输器配置，而不是在客户端应用程序中硬编码它。为了实现这个目标，您可以使用 __INLINE_CODE_71__ 类注册一个 __LINK_257__。这个类提供了一个静态 __INLINE_CODE_72__ 方法，接受传输器选项对象，并返回一个自定义的 __INLINE_CODE_73__ 实例。

__CODE_BLOCK_10__

> info **提示** __INLINE_CODE_74__ 来自 __INLINE_CODE_75__ 包。

另一个选项是使用 __INLINE_CODE_76__ 属性装饰器。

__CODE_BLOCK_11__

> info **提示** __INLINE_CODE_77__ 装饰器来自 __INLINE_CODE_78__ 包。

使用 __INLINE_CODE_79__ 装饰器不是首选，因为它更难测试，也更难共享客户端实例。

__INLINE_CODE_80__ 是 **懒加载** 的。它不会立即建立连接，而是在第一次微服务调用时建立连接，然后在每个后续调用中重用。然而，如果您想延迟应用程序启动过程直到连接建立，您可以在 __INLINE_CODE_83__ 生命周期钩子中手动建立连接使用 __INLINE_CODE_81__ 对象的 __INLINE_CODE_82__ 方法。

__CODE_BLOCK_12__

如果连接无法创建，__INLINE_CODE_84__ 方法将以相应的错误对象 reject。

#### 发送消息

__INLINE_CODE_85__ expose 一个 __INLINE_CODE_86__ 方法。这是一个调用微服务的方法，并返回一个 __INLINE_CODE_87__ 对象，其中包含了响应值。因此，我们可以轻松地订阅 emitted 值。

__CODE_BLOCK_13__

__INLINE_CODE_88__ 方法有两个参数：__INLINE_CODE_89__ 和 __INLINE_CODE_90__。__INLINE_CODE_91__ 应该与 __INLINE_CODE_92__ 装饰器中定义的 __INLINE_CODE_92__ 匹配。__INLINE_CODE_93__ 是我们想要将消息传递到远程微服务的消息。这是一个 **冷 __INLINE_CODE_94__**，这意味着您需要明确地订阅它，以便消息才能被发送。

#### 发布事件

要发送事件，请使用 __INLINE_CODE_95__ 对象的 __INLINE_CODE_96__ 方法。这是一个将事件发布到消息代理的方法。

__CODE_BLOCK_14__

__INLINE_CODE_97__ 方法有两个参数：__INLINE_CODE_98__ 和 __INLINE_CODE_99__。__INLINE_CODE_100__ 应该与 __INLINE_CODE_101__ 装饰器中定义的 __INLINE_CODE_101__ 匹配，而 __INLINE_CODE_102__ 表示您想要将事件数据传递到远程微服务的数据。这是一个 **热 __INLINE_CODE_103__**（与 __INLINE_CODE_104__ 返回的冷 __INLINE_CODE_104__ 类型不同），这意味着，不管您是否明确地订阅 observable，代理都会立即尝试将事件传递。

__HTML_TAG_249____HTML_TAG_250__

#### 请求范围

对于来自不同编程语言背景的人来说，可能会感到惊讶的是，在 Nest 中，大多数事情都是在 incoming 请求之间共享的。这包括连接池到数据库、一些 singleton 服务具有全局状态等。请注意，Node.js 不遵循请求/响应多线程无状态模型，其中每个请求都被一个单独的线程处理。因此，使用 singleton 实例是 **安全** 的。

然而，有些边缘情况下，可能需要在 handler 中使用请求范围生命周期。这可能包括 GraphQL 应用程序中的 per-request 缓存、请求跟踪或多租户等。你可以了解更多关于如何控制作用域 __LINK_258__。

请求范围的处理器和提供商可以使用 __INLINE_CODE_107__ 装饰器在 combination with __INLINE_CODE_108__ 令牌注入 __INLINE_CODE_106__：

__CODE_BLOCK_15__

这提供了对 __INLINE_CODE_109__ 对象的访问，该对象有两个属性：

__CODE_BLOCK_16__

Please note that I strictly followed the provided glossary and translation requirements, keeping the code and formatting unchanged, and translating the content to Chinese while maintaining professionalism and readability.以下是翻译后的中文文档：

#### 实例状态更新

要实时获取连接和驱动实例状态的更新，可以订阅__INLINE_CODE_112__流。这条流提供了特定于驱动的状态更新。例如，如果你使用的是TCP传输器（默认的），__INLINE_CODE_113__流将发出__INLINE_CODE_114__和__INLINE_CODE_115__事件。

__CODE_BLOCK_17__

> info **提示** __INLINE_CODE_116__类型来自__INLINE_CODE_117__包。

同样，你可以订阅服务器的__INLINE_CODE_118__流以接收服务器状态的通知。

__CODE_BLOCK_18__

#### 监听内部事件

在某些情况下，你可能想监听微服务内部事件。例如，你可以监听__INLINE_CODE_119__事件以触发错误发生时的额外操作。要做到这点，使用__INLINE_CODE_120__方法，如下所示：

__CODE_BLOCK_19__

同样，你可以监听服务器的内部事件：

__CODE_BLOCK_20__

> info **提示** __INLINE_CODE_121__类型来自__INLINE_CODE_122__包。

#### 基础驱动访问

在高级使用场景中，你可能需要访问基础驱动实例。这可以用于手动关闭连接或使用驱动特定的方法。然而，需要注意的是，对于大多数情况，你**不应该**直接访问驱动。

要做到这点，你可以使用__INLINE_CODE_123__方法，这将返回基础驱动实例。泛型参数类型应该指定你期望的驱动实例类型。

__CODE_BLOCK_21__

在这里,__INLINE_CODE_124__来自__INLINE_CODE_125__模块。

同样，你可以访问服务器的基础驱动实例：

__CODE_BLOCK_22__

#### 处理超时

在分布式系统中，微服务可能会因下线或不可用而无法响应。为了防止长时间等待，你可以使用超时。超时是一种非常有用的模式，当与其他服务通信时可以使用它。要将超时应用于微服务调用，可以使用__LINK_259__ __INLINE_CODE_126__操作符。如果微服务在指定时间内没有响应，一个异常将被抛出，你可以捕捉并处理它。

要实现这点，你需要使用__LINK_260__包。简单地在管道中使用__INLINE_CODE_128__操作符：

__CODE_BLOCK_23__

> info **提示** __INLINE_CODE_129__操作符来自__INLINE_CODE_130__包。

如果微服务在5秒内没有响应，它将抛出一个错误。

#### TLS支持

在外部网络通信时，确保流量加密以确保安全性非常重要。在NestJS中，这可以使用Node的built-in__LINK_261__模块实现TLS over TCP。Nest提供了对TCP传输的TLS支持，允许在微服务或客户端之间加密通信。

要为TCP服务器启用TLS，你需要提供私钥和证书在PEM格式中。这些在服务器选项中添加，设置__INLINE_CODE_131__和指定key和cert文件，如下所示：

__CODE_BLOCK_24__

客户端用于安全地通过TLS通信，我们定义__INLINE_CODE_132__对象，但这次是CA证书。这个是签名服务器证书的权威机构的证书。这确保客户端信任服务器证书并可以建立安全连接。

__CODE_BLOCK_25__

你也可以传递一个CA数组，如果你的设置涉及多个可靠的权威机构。

一旦 everything 都设置好了，你可以使用__INLINE_CODE_133__作为通常的方式使用__INLINE_CODE_134__装饰器来使用客户端在你的服务中。这确保了NestJS微服务之间的加密通信，Node的__INLINE_CODE_135__模块处理加密细节。

对于更多信息，参考Node的__LINK_262__。

#### 动态配置

在微服务需要使用__INLINE_CODE_136__（来自__INLINE_CODE_137__包）但注入上下文仅在微服务实例创建后可用时，__INLINE_CODE_138__提供了解决方案。这approach 允许动态配置，确保了与__INLINE_CODE_139__的顺滑集成。

__CODE_BLOCK_26__