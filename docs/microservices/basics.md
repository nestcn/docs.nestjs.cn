<!-- 此文件从 content/microservices/basics.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T05:02:29.677Z -->
<!-- 源文件: content/microservices/basics.md -->

### Overview

除了传统的单体应用架构外，Nest 也天然支持微服务架构开发风格。许多与之相关的概念，如依赖注入、装饰器、异常过滤器、管道、守卫和拦截器，对微服务也同样适用。Nest尽量将实现细节抽象出来，使得同样的组件可以在HTTP、WebSocket和微服务平台上运行。这部分讨论Nest对微服务的特点。

在Nest中，微服务基本上是一个使用不同传输层的应用程序。

__HTML_TAG_140____HTML_TAG_141____HTML_TAG_142__

Nest支持多种内置传输层实现，称为传输器，它们负责在不同微服务实例之间传输消息。多种传输器都支持请求-响应和事件形式的消息 Nest将每种传输器的实现细节隐藏在对请求响应和事件 messaging 的标准接口后，使得可以轻松切换到不同的传输层，例如以利用特定的传输层的可靠性或性能特性，而不影响应用程序代码。

#### 安装

要开始构建微服务，首先安装所需的包：

```typescript
import { FieldMiddleware, MiddlewareContext, NextFn } from '@nestjs/graphql';

const loggerMiddleware: FieldMiddleware = async (
  ctx: MiddlewareContext,
  next: NextFn,
) => {
  const value = await next();
  console.log(value);
  return value;
};

```

#### Getting started

要实例化一个微服务，使用 __INLINE_CODE_27__ 方法：

```typescript
@ObjectType()
export class Recipe {
  @Field({ middleware: [loggerMiddleware] })
  title: string;
}

```

> 信息 微服务默认使用 TCP 传输层。

第二个参数是 __INLINE_CODE_30__ 对象，该对象可能包含两个成员：

__HTML_TAG_143__
  __HTML_TAG_144__
    __HTML_TAG_145____HTML_TAG_146__transport__HTML_TAG_147____HTML_TAG_148__
    __HTML_TAG_149__指定传输器（例如 __HTML_TAG_150__Transport.NATS__HTML_TAG_151__）__HTML_TAG_152__
  __HTML_TAG_153__
  __HTML_TAG_154__
    __HTML_TAG_155____HTML_TAG_156__options__HTML_TAG_157____HTML_TAG_158__
    __HTML_TAG_159__传输器特定的选项对象，确定传输器行为__HTML_TAG_160__
  __HTML_TAG_161__
__HTML_TAG_162__
__HTML_TAG_163__
  __HTML_TAG_164__options__HTML_TAG_165__ 对象是根据选择的传输器确定的。TCP 传输器暴露以下属性。对于其他传输器（例如 Redis、MQTT 等），请查看相关章节了解可用选项。
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
    __HTML_TAG_191__重试消息次数（默认： __HTML_TAG_192__0__HTML_TAG_193__）__HTML_TAG_194__
  __HTML_TAG_195__
  __HTML_TAG_196__
    __HTML_TAG_197____HTML_TAG_198__retryDelay__HTML_TAG_199____HTML_TAG_200__
    __HTML_TAG_201__重试消息延迟（毫秒）（默认： __HTML_TAG_202__0__HTML_TAG_203__）__HTML_TAG_204__
  __HTML_TAG_205__
  __HTML_TAG_206__
    __HTML_TAG_207____HTML_TAG_208__serializer__HTML_TAG_209____HTML_TAG_210__
    __HTML_TAG_211__自定义 __HTML_TAG_212__ serializer__HTML_TAG_213__用于出站消息__HTML_TAG_214__
  __HTML_TAG_215__
  __HTML_TAG_216__
    __HTML_TAG_217____HTML_TAG_218__deserializer__HTML_TAG_219____HTML_TAG_220__
    __HTML_TAG_221__自定义 __HTML_TAG_222__ deserializer__HTML_TAG_223__用于入站消息__HTML_TAG_224__
  __HTML_TAG_225__
  __HTML_TAG_226__
    __HTML_TAG_227____HTML_TAG_228__socketClass__HTML_TAG_229____HTML_TAG_230__
    __HTML_TAG_231__自定义 Socket，扩展 __HTML_TAG_232__ TcpSocket__HTML_TAG_233__（默认： __HTML_TAG_234__JsonSocket__HTML_TAG_235__）__HTML_TAG_236__
  __HTML_TAG_237__
  __HTML_TAG_238__
    __HTML_TAG_239____HTML_TAG_240__tlsOptions__HTML_TAG_#### 请求-响应

请求-响应消息风格非常适合在多个外部服务之间交换消息。这种风格确保了服务实际收到了消息（不需要手动实现确认协议）。然而，请求-响应方法并不是总是最好的选择。例如，流式传输器，如 __LINK_251__ 或 __LINK_252__，它们使用日志 persistence，优化了事件消息风格（请查看 __LINK_253__ 获取更多信息）。

要启用请求-响应消息风格，Nest 创建了两个逻辑通道：一个用于传输数据，另一个用于等待incoming响应。对于一些底层传输器，如 __LINK_254__，Nest 提供了内置支持。对于其他传输器，Nest 会手动创建通道。虽然这很有效，但它也可能引入一些开销。因此，如果您不需要请求-响应消息风格，您可能想考虑使用事件消息风格。

要创建基于请求-响应风格的消息处理程序，请使用 __INLINE_CODE_31__ 装饰器，该装饰器来自 __INLINE_CODE_32__ 包。这个装饰器只能在 __LINK_255__ 类中使用，因为它们是应用程序的入口点。使用它在提供者中将无效，因为它们将被 Nest 运行时忽略。

```typescript
const value = await next();
return value?.toUpperCase();

```

在上面的代码中，__INLINE_CODE_33__ **消息处理程序** 监听匹配 __INLINE_CODE_34__ 消息模式的消息。消息处理程序接受一个单个参数，即来自客户端的 __INLINE_CODE_35__。在这个例子中，数据是一个数组，需要累积。

#### 异步响应

消息处理程序可以同步或异步响应，意味着 __INLINE_CODE_36__ 方法是支持的。

```typescript
@ResolveField(() => String, { middleware: [loggerMiddleware] })
title() {
  return 'Placeholder';
}

```

消息处理程序也可以返回 __INLINE_CODE_37__，在这种情况下，结果值将直到流完成时被发射。

```typescript
GraphQLModule.forRoot({
  autoSchemaFile: 'schema.gql',
  buildSchemaOptions: {
    fieldMiddleware: [loggerMiddleware],
  },
}),

```

在上面的示例中，消息处理程序将响应 **三次**，一次对每个数组项。

#### 事件消息

虽然请求-响应方法非常适合服务之间的消息交换，但它不太适合事件消息风格—当您想要发布 **事件** 而不等待响应时。在这种情况下，请求-响应的开销是多余的。

例如，如果您想通知其他服务在该系统某个部分发生特定情况时，您可以使用事件消息风格。

要创建事件处理程序，可以使用 __INLINE_CODE_38__ 装饰器，该装饰器来自 __INLINE_CODE_39__ 包。

__CODE_BLOCK_5__

> info **提示** 您可以为单个事件模式注册多个事件处理程序，并且所有它们将自动并行触发。

__INLINE_CODE_40__ **事件处理程序** 监听 __INLINE_CODE_41__ 事件。事件处理程序接受一个单个参数，即来自客户端的 __INLINE_CODE_42__（在这个例子中是事件负载，该负载已经通过网络发送）。

__HTML_TAG_247____HTML_TAG_248__

#### 额外的请求信息

在更复杂的场景中，您可能需要访问 incoming 请求的额外信息。例如，在使用 NATS 时，您可能想获取原始主题，该主题是生产者发送消息的主题。同样，在 Kafka 中，您可能需要访问消息头。要实现这个，您可以使用内置的装饰器，如下所示：

__CODE_BLOCK_6__

> info **提示** __INLINE_CODE_43__、__INLINE_CODE_44__ 和 __INLINE_CODE_45__ 来自 __INLINE_CODE_46__。

> info **提示** 您也可以将属性键传递给 __INLINE_CODE_47__ 装饰器以从 incoming payload 对象中提取特定属性，例如 __INLINE_CODE_48__。

#### 客户端（生产者类）

客户端 Nest 应用程序可以使用 __INLINE_CODE_49__ 类与 Nest 微服务进行消息交换或发布事件。这个类提供了多个方法，如 __INLINE_CODE_50__（用于请求-响应消息）和 __INLINE_CODE_51__（用于事件驱动消息），以便与远程微服务进行通信。您可以在以下方式获得这个类的实例：

一种方法是导入 __INLINE_CODE_52__，该类暴露了静态 __INLINE_CODE_53__ 方法。这个方法接受一个数组，表示微服务传输器。每个对象都必须包含 __INLINE_CODE_54__ 属性，以及可选的 __INLINE_CODE_55__ 属性（默认为 __INLINE_CODE_56__），以及可选的 __INLINE_CODE_57__ 属性。Here is the translation of the provided documentation to Chinese:

`__INLINE_CODE_58__` 属性作为一个**注入令牌**，可以在需要时注入一个 `__INLINE_CODE_59__` 的实例。这个 `__INLINE_CODE_60__` 属性的值可以是任何字符串或 JavaScript 符号，正如 __LINK_256__ 描述的。

`__INLINE_CODE_61__` 属性是一个对象，它包含了我们在 `__INLINE_CODE_62__` 方法中看到的相同的属性。

`__CODE_BLOCK_7__`

或者，您可以使用 `__INLINE_CODE_63__` 方法，如果您需要在设置过程中提供配置或执行其他异步操作。

`__CODE_BLOCK_8__`

一旦模块被导入，您可以使用 `__INLINE_CODE_64__` 装饰器将 `__INLINE_CODE_65__`  transport器实例配置为指定的选项。

`__CODE_BLOCK_9__`

> 提示 **提示** `__INLINE_CODE_67__` 和 `__INLINE_CODE_68__` 类来自 `__INLINE_CODE_69__` 包。

有时，您可能需要从另一个服务（如 `__INLINE_CODE_70__`）中获取 transporter 配置，而不是在客户端应用程序中硬编码它。为了实现这一点，您可以使用 `__LINK_257__` 注册一个 `__INLINE_CODE_71__` 类。这个类提供了一个静态 `__INLINE_CODE_72__` 方法，它接受 transporter 选项对象并返回一个自定义的 `__INLINE_CODE_73__` 实例。

`__CODE_BLOCK_10__`

> 提示 **提示** `__INLINE_CODE_74__` 来自 `__INLINE_CODE_75__` 包。

另一个选项是使用 `__INLINE_CODE_76__` 属性装饰器。

`__CODE_BLOCK_11__`

> 提示 **提示** `__INLINE_CODE_77__` 装饰器来自 `__INLINE_CODE_78__` 包。

使用 `__INLINE_CODE_79__` 装饰器不是推荐的技术，因为它更难测试和分享客户端实例。

`__INLINE_CODE_80__` 是**懒惰**的。它不会立即建立连接。相反，它将在第一次微服务调用时建立连接，然后在每个后续调用中重用。然而，如果您想延迟应用程序启动过程直到连接建立，您可以在 `__INLINE_CODE_83__` 生命周期钩子中手动建立连接使用 `__INLINE_CODE_81__` 对象的 `__INLINE_CODE_82__` 方法。

`__CODE_BLOCK_12__`

如果连接不能创建，`__INLINE_CODE_84__` 方法将以相应的错误对象 reject。

#### 发送消息

`__INLINE_CODE_85__` expose a `__INLINE_CODE_86__` 方法。这方法旨在调用微服务并返回一个 `__INLINE_CODE_87__` 对象，其中包含响应。因此，我们可以轻松订阅这些值。

`__CODE_BLOCK_13__`

`__INLINE_CODE_88__` 方法接受两个参数：`__INLINE_CODE_89__` 和 `__INLINE_CODE_90__`。`__INLINE_CODE_91__` 应该与在 `__INLINE_CODE_92__` 装饰器中定义的相符。`__INLINE_CODE_93__` 是我们想传输到远程微服务的消息。这方法返回一个**冷 `__INLINE_CODE_94__`**，这意味着您必须明确订阅它才能发送消息。

#### 发布事件

要发送事件，使用 `__INLINE_CODE_95__` 对象的 `__INLINE_CODE_96__` 方法。这方法将事件发布到消息代理。

`__CODE_BLOCK_14__`

`__INLINE_CODE_97__` 方法接受两个参数：`__INLINE_CODE_98__` 和 `__INLINE_CODE_99__`。`__INLINE_CODE_100__` 应该与在 `__INLINE_CODE_101__` 装饰器中定义的相符，而 `__INLINE_CODE_102__` 表示要传输到远程微服务的事件数据。这方法返回一个**热 `__INLINE_CODE_103__`**（与 `__INLINE_CODE_104__` 返回的冷 `__INLINE_CODE_105__` 相反），这意味着不管您是否明确订阅 observable，代理将立即尝试交付事件。

`__HTML_TAG_249__`____`__HTML_TAG_250__`

#### 请求范围

对于来自不同编程语言背景的人来说，可能会感到奇怪的是，在 Nest 中，大多数事情都是跨 incoming 请求共享的。这包括对数据库的连接池、全局状态的单例服务和更多。请注意，Node.js 不遵循请求/响应多线程无状态模型，其中每个请求都由单独线程处理。因此，使用单例实例是**安全**的。

然而，有些边缘情况可能需要在处理器中使用请求范围。例如，GraphQL 应用程序中的 per-request 缓存、请求跟踪或多租户。您可以了解如何控制作用域 __LINK_258__。

request-scoped 处理器和提供者可以使用 `__INLINE_CODE_107__` 装饰器在组合 `__INLINE_CODE_108__`令牌中注入 `__INLINE_CODE_106__`：

`__CODE_BLOCK_15__`

这提供了对 `__INLINE_CODE_109__` 对象的访问，该对象具有两个属性：

`__CODE_BLOCK_16__`

Please note that I have kept theHere is the translated text:

#### 实例状态更新

要获取实时更新连接和底层驱动实例的状态，可以订阅 __INLINE_CODE_112__ 流。这个流提供了特定于选择驱动的状态更新。例如，如果您使用的是 TCP 传输器（默认），那么 __INLINE_CODE_113__ 流将 emit __INLINE_CODE_114__ 和 __INLINE_CODE_115__ 事件。

__CODE_BLOCK_17__

> info **提示** __INLINE_CODE_116__ 类型来自 __INLINE_CODE_117__ 包。

同样，您也可以订阅服务器的 __INLINE_CODE_118__ 流以接收服务器状态的通知。

__CODE_BLOCK_18__

#### 监听内部事件

在某些情况下，您可能想监听微服务内部事件。例如，您可以监听 __INLINE_CODE_119__ 事件以在错误发生时触发额外操作。要做到这一点，请使用 __INLINE_CODE_120__ 方法，如下所示：

__CODE_BLOCK_19__

同样，您也可以监听服务器内部事件：

__CODE_BLOCK_20__

> info **提示** __INLINE_CODE_121__ 类型来自 __INLINE_CODE_122__ 包。

#### underlying driver 访问

对于更高级的用例，您可能需要访问底层驱动实例。这可以用于手动关闭连接或使用驱动程序专门的方法。然而，请注意，除非您需要访问驱动程序实例以实现某些特殊的操作，否则通常不需要访问驱动程序实例。

要做到这一点，可以使用 __INLINE_CODE_123__ 方法，它返回底层驱动实例。泛型类型参数应该指定期望的驱动实例类型。

__CODE_BLOCK_21__

这里 __INLINE_CODE_124__ 是来自 __INLINE_CODE_125__ 模块的类型。

同样，您也可以访问服务器的底层驱动实例：

__CODE_BLOCK_22__

#### 处理超时

在分布式系统中，微服务可能会Down或不可用。为了防止长时间等待，您可以使用超时。超时是非常有用的模式，当与其他服务通信时。要将超时应用于微服务调用，可以使用 __LINK_259__ __INLINE_CODE_126__ 操作符。如果微服务在指定时间内没有响应，会抛出异常，您可以捕捉和处理。

要实现这一点，您需要使用 __LINK_260__ 包。简单地在管道中使用 __INLINE_CODE_128__ 操作符：

__CODE_BLOCK_23__

> info **提示** __INLINE_CODE_129__ 操作符来自 __INLINE_CODE_130__ 包。

在 5 秒后，如果微服务没有响应，会抛出错误。

#### TLS 支持

在通信外部私有网络时，确保traffic 加密非常重要。在 NestJS 中，这可以使用 Node 的 built-in __LINK_261__ 模块实现 TLS over TCP。Nest 提供了对 TLS 的内置支持，以便在 TCP 传输中加密微服务或客户端之间的通信。

要为 TCP 服务器启用 TLS，您需要提供私钥和证书在 PEM 格式。这些文件添加到服务器选项中，设置 __INLINE_CODE_131__ 和指定密钥和证书文件，如下所示：

__CODE_BLOCK_24__

为了在客户端与服务器之间建立安全连接，您也定义了 __INLINE_CODE_132__ 对象，但这次使用 CA 证书。这是签名服务器证书的证书机构证书。这样确保客户端信任服务器证书，可以建立安全连接。

__CODE_BLOCK_25__

您也可以将 CA 列表传递给客户端，以便在您的设置中涉及多个可靠的权威机构。

一旦 everything 都设置好了，您可以使用 __INLINE_CODE_133__ 作为通常使用 __INLINE_CODE_134__ 装饰器来使用客户端在您的服务中。这确保了 NestJS 微服务之间的加密通信，Node 的 __INLINE_CODE_135__ 模块处理加密细节。

对于更多信息，请参阅 Node 的 __LINK_262__。

#### 动态配置

当微服务需要使用 __INLINE_CODE_136__（来自 __INLINE_CODE_137__ 包）进行配置，但注入上下文仅在微服务实例创建后可用时，__INLINE_CODE_138__ 提供了一种解决方案。这种方法允许动态配置，确保了与 __INLINE_CODE_139__ 的顺滑集成。

__CODE_BLOCK_26__