<!-- 此文件从 content/microservices/basics.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T05:28:20.021Z -->
<!-- 源文件: content/microservices/basics.md -->

### Overview

除了传统（有时称为单体）应用架构外，Nest 自然支持微服务架构开发风格。该文档中讨论的许多概念，例如依赖注入、装饰器、异常过滤器、管道、守卫和拦截器，对微服务也同样适用。Nest 抽象了实现细节，以便同一个组件在 HTTP 基础平台、WebSockets 和微服务之间运行。该部分涵盖了 Nest 特定的微服务内容。

在 Nest 中，微服务是使用不同的 **传输** 层来实现的，而不是 HTTP。

__HTML_TAG_140____HTML_TAG_141____HTML_TAG_142__

Nest 支持多种内置传输层实现，称为 **传输器**，它们负责在不同微服务实例之间传输消息。多数传输器本质上支持请求-响应和事件驱动的消息样式。Nest 将每个传输器的实现细节抽象为 request-response 和 event-based 消息的 canonical 接口，这使得可以轻松地切换到另一个传输层，而无需影响应用程序代码。

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

#### 入门

要实例化微服务，使用 __INLINE_CODE_27__ 方法：

```typescript
@ObjectType()
export class Recipe {
  @Field({ middleware: [loggerMiddleware] })
  title: string;
}

```

> info **提示** 微服务默认使用 **TCP** 传输层。

__INLINE_CODE_28__ 方法的第二个参数是一个 __INLINE_CODE_30__ 对象。这对象可能包含两个成员：

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
  __HTML_TAG_164__options__HTML_TAG_165__ 对象是特定于选择的传输器的。TCP 传输器公开了以下属性。对于其他传输器（例如 Redis、MQTT 等），请参阅相关章节了解可用选项。
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
    __HTML_TAG_191__重试消息次数（默认：__HTML_TAG_192__0__HTML_TAG_193__）__HTML_TAG_194__
  __HTML_TAG_195__
  __HTML_TAG_196__
    __HTML_TAG_197____HTML_TAG_198__retryDelay__HTML_TAG_199____HTML_TAG_200__
    __HTML_TAG_201__消息重试尝试之间的延迟（ms）（默认：__HTML_TAG_202__0__HTML_TAG_203__）__HTML_TAG_204__
  __HTML_TAG_205__
  __HTML_TAG_206__
    __HTML_TAG_207____HTML_TAG_208__serializer__HTML_TAG_209____HTML_TAG_210__
    __HTML_TAG_211__自定义 __HTML_TAG_212__序列化器__HTML_TAG_213__ 用于出站消息__HTML_TAG_214__
  __HTML_TAG_215__
  __HTML_TAG_216__
    __HTML_TAG_217____HTML_TAG_218__deserializer__HTML_TAG_219____HTML_TAG_220__
    __HTML_TAG_221__自定义 __HTML_TAG_222__反序列化器__HTML_TAG_223__ 用于入站消息__HTML_TAG_224__
  __HTML_TAG_225__
  __HTML_TAG_226__
    __HTML_TAG_227____HTML_TAG_228__socketClass__HTML_TAG_229____HTML_TAG_230__
    __HTML_TAG_231__自定义 Socket，继承自 __HTML_TAG_232__TcpSocket__HTML_TAG_233__（默认：__HTML_TAG_234__JsonSocket__HTML_TAG_235__）__#### 请求-响应

请求-响应消息样式非常适合在多个外部服务之间交换消息。这种模式确保了服务实际收到了消息（无需手动实现确认协议）。然而，请求-响应方法并不总是最好的选择。例如，流式传输器，如 __LINK_251__ 或 __LINK_252__，使用基于日志的持久化，旨在解决与事件消息样式更相符的问题（请查看 __LINK_253__ 了解更多信息）。

要启用请求-响应消息类型，Nest 创建了两个逻辑通道：一个用于传输数据，另一个用于等待 incoming 响应。对于一些底层传输器，如 __LINK_254__，Nest 提供了双通道支持。对于其他传输器，Nest 需要手动创建通道。虽然这有效，但可能会 introduces some overhead。因此，如果您不需要请求-响应消息样式，您可能想考虑使用事件消息样式。

要创建基于请求-响应范式的消息处理程序，请使用 __INLINE_CODE_31__ 装饰器，该装饰器来自 __INLINE_CODE_32__ 包。该装饰器仅在 __LINK_255__ 类中使用，因为它们是应用程序的入口点。使用它在提供者中将无效，因为它们将被 Nest 运行时忽略。

```typescript
const value = await next();
return value?.toUpperCase();

```

在上面的代码中，__INLINE_CODE_33__ **消息处理程序** 监听与 __INLINE_CODE_34__ 消息模式匹配的消息。消息处理程序接受单个参数，即来自客户端的 __INLINE_CODE_35__。在这种情况下，数据是一个数组的数字，需要累积。

#### 异步响应

消息处理程序可以同步或异步响应，即 __INLINE_CODE_36__ 方法支持。

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

在上面的示例中，消息处理程序将响应 **三次**，每个数组项一次。

#### 事件消息

虽然请求-响应方法非常适合在服务之间交换消息，但对于事件消息样式（当您想要发布事件而不等待响应时）则不太适合。在这种情况下，请求-响应方法的重复通道维护是多余的。

例如，如果您想通知另一个服务在系统中的某个特定条件发生，该事件消息样式非常适合。

要创建事件处理程序，请使用 __INLINE_CODE_38__ 装饰器，该装饰器来自 __INLINE_CODE_39__ 包。

__CODE_BLOCK_5__

> info **提示** 您可以注册多个事件处理程序来处理同一个事件模式，并且所有它们将自动并行触发。

__INLINE_CODE_40__ **事件处理程序** 监听 __INLINE_CODE_41__ 事件。事件处理程序接受单个参数，即来自客户端的 __INLINE_CODE_42__（在这种情况下，是发送到网络的事件 payload）。

__HTML_TAG_247____HTML_TAG_248__

#### 附加请求信息

在更高级的场景中，您可能需要访问 incoming 请求的额外信息。例如，在使用 NATS 进行 wildcard 订阅时，您可能想检索原始主题，该生产者发送消息时使用的主题。同样，在 Kafka 中，您可能需要访问消息头。要实现这一点，可以使用以下示例：

__CODE_BLOCK_6__

> info **提示** __INLINE_CODE_43__、__INLINE_CODE_44__ 和 __INLINE_CODE_45__ 来自 __INLINE_CODE_46__。

> info **提示** 您也可以将 property 键传递给 __INLINE_CODE_47__ 装饰器以从 incoming  payload 对象中提取特定属性，例如 __INLINE_CODE_48__。

#### 客户端（生产者类）

客户端 Nest 应用程序可以使用 __INLINE_CODE_49__ 类与 Nest 微服务之间交换消息或发布事件。该类提供了多种方法，如 __INLINE_CODE_50__（用于请求-响应消息）和 __INLINE_CODE_51__（用于事件驱动消息），以便与远程微服务通信。您可以通过以下方式获得该类的实例：

一种方法是导入 __INLINE_CODE_52__，该类公开了静态 __INLINE_CODE_53__ 方法。该方法接受一个数组对象，该对象表示微服务传输器。每个对象必须包括 __INLINE_CODE_54__ 属性，且可选地包括 __INLINE_CODE_55__ 属性（默认为 __INLINE_CODE_56__），以及可选地 __INLINE_CODE_57__ 属性。Here is the translation of the provided English technical documentation to Chinese:

`__INLINE_CODE_58__` 属性是 **注入令牌**，可以在需要时注入一个 `__INLINE_CODE_59__` 的实例。该 `__INLINE_CODE_60__` 属性的值可以是任意的字符串或 JavaScript 符号，如 __LINK_256__ 所述。

`__INLINE_CODE_61__` 属性是一个对象，包括了我们在 `__INLINE_CODE_62__` 方法中所见的相同属性。

`__CODE_BLOCK_7__`

 alternatively, you can use the `__INLINE_CODE_63__` 方法，如果您需要在设置中提供配置或执行其他异步操作。

`__CODE_BLOCK_8__`

一旦模块被导入，您可以使用 `__INLINE_CODE_66__` 装饰器将 `__INLINE_CODE_64__` 实例注入到指定的选项中，以便使用 `__INLINE_CODE_65__` 传输器。

`__CODE_BLOCK_9__`

> info **提示** `__INLINE_CODE_67__` 和 `__INLINE_CODE_68__` 类是从 `__INLINE_CODE_69__` 包中导入的。

有时，您可能需要从另一个服务（如 `__INLINE_CODE_70__`）中 fetch 传输器配置，而不是在客户端应用程序中硬编码。要实现这个，您可以使用 `__INLINE_CODE_71__` 类注册一个链接。这个类提供了一个静态 `__INLINE_CODE_72__` 方法，该方法接受传输器选项对象并返回一个自定义的 `__INLINE_CODE_73__` 实例。

`__CODE_BLOCK_10__`

> info **提示** `__INLINE_CODE_74__` 是从 `__INLINE_CODE_75__` 包中导入的。

另一个选择是使用 `__INLINE_CODE_76__` 属性装饰器。

`__CODE_BLOCK_11__`

> info **提示** `__INLINE_CODE_77__` 装饰器是从 `__INLINE_CODE_78__` 包中导入的。

使用 `__INLINE_CODE_79__` 装饰器不是首选，因为它更难测试和共享客户端实例。

`__INLINE_CODE_80__` 是 **懒惰** 的。它不会立即建立连接。相反，它将在第一次微服务调用时建立连接，然后在每个后续调用中重用该连接。然而，如果您想延迟应用程序启动过程，直到连接建立，可以在 `__INLINE_CODE_83__` 生命周期钩子中手动建立连接。

`__CODE_BLOCK_12__`

如果连接不能创建，`__INLINE_CODE_84__` 方法将以相应的错误对象 reject。

#### 发送消息

`__INLINE_CODE_85__` expose a `__INLINE_CODE_86__` 方法。该方法旨在调用微服务，并返回一个 `__INLINE_CODE_87__` 对象，其中包含了响应。因此，我们可以轻松地订阅这些值。

`__CODE_BLOCK_13__`

`__INLINE_CODE_88__` 方法接受两个参数：`__INLINE_CODE_89__` 和 `__INLINE_CODE_90__`。`__INLINE_CODE_91__` 应该与在 `__INLINE_CODE_92__` 装饰器中定义的匹配，`__INLINE_CODE_93__` 是要传输到远程微服务的消息。这方法返回一个 **cold __INLINE_CODE_94__**，这意味着您需要明确地订阅它，以便发送消息。

#### 发布事件

要发送事件，请使用 `__INLINE_CODE_95__` 对象的 `__INLINE_CODE_96__` 方法。该方法发布一个事件到消息代理。

`__CODE_BLOCK_14__`

`__INLINE_CODE_97__` 方法接受两个参数：`__INLINE_CODE_98__` 和 `__INLINE_CODE_99__`。`__INLINE_CODE_100__` 应该与在 `__INLINE_CODE_101__` 装饰器中定义的匹配，`__INLINE_CODE_102__` 表示要传输到远程微服务的事件数据。这方法返回一个 **hot __INLINE_CODE_103__**（与 `__INLINE_CODE_104__` 返回的 cold 对象不同），这意味着，不管您是否明确地订阅 observable，代理将立即尝试传递事件。

`__HTML_TAG_249____HTML_TAG_250__`

#### 请求作用域

对于来自不同编程语言背景的人来说，它可能会感到惊讶的是，在 Nest 中，大多数事情都是跨越 incoming 请求共享的。这包括数据库连接池、单例服务的全局状态和更多。请注意，Node.js 不遵循请求/响应多线程无状态模型，即每个请求都是由单独线程处理的。因此，使用单例实例是 **安全** 的。

然而，有些场景中，请求生命周期 handler 可能是有用的。这可能包括 GraphQL 应用程序中的 per-request 缓存、请求跟踪或多租户 scenarios。您可以了解如何控制作用域 __LINK_258__。

请求作用域的处理器和提供者可以使用 `__INLINE_CODE_107__` 装饰器在combination with `__INLINE_CODE_108__` 令牌注入 `__INLINE_CODE_106__`：

`__CODE_BLOCK_15__`

这提供了对 `__INLINE_CODE_109__` 对象的访问，该对象具有两个属性：

`__CODE_BLOCK_16__`Here is the translation of the provided English technical documentation to Chinese, following the translation requirements:

#### 实例状态更新

要实时获取连接和底层驱动器实例的状态，可以订阅 __INLINE_CODE_112__ 流。该流提供了特定于选择的驱动器的状态更新。例如，如果您使用的是 TCP 传输器（默认），__INLINE_CODE_113__ 流将 emit __INLINE_CODE_114__ 和 __INLINE_CODE_115__ 事件。

__CODE_BLOCK_17__

> 信息 **提示** __INLINE_CODE_116__ 类型来自 __INLINE_CODE_117__ 包。

同样，您也可以订阅服务器的 __INLINE_CODE_118__ 流，以接收服务器状态的通知。

__CODE_BLOCK_18__

#### 监听内部事件

在某些情况下，您可能想监听微服务内部 emit 的事件。例如，您可以监听 __INLINE_CODE_119__ 事件，以在错误发生时触发额外操作。要做到这一点，可以使用 __INLINE_CODE_120__ 方法，以下是示例：

__CODE_BLOCK_19__

同样，您也可以监听服务器的内部事件：

__CODE_BLOCK_20__

> 信息 **提示** __INLINE_CODE_121__ 类型来自 __INLINE_CODE_122__ 包。

####底层驱动器访问

在某些高级使用场景下，您可能需要访问底层驱动器实例。这可以在手动关闭连接或使用驱动器特定的方法时有用。但是，通常情况下，您 **不需要** 直接访问驱动器。

要做到这一点，可以使用 __INLINE_CODE_123__ 方法，该方法返回底层驱动器实例。泛型类型参数应该指定您期望的驱动器实例类型。

__CODE_BLOCK_21__

在这里，__INLINE_CODE_124__ 是来自 __INLINE_CODE_125__ 模块的类型。

同样，您也可以访问服务器的底层驱动器实例：

__CODE_BLOCK_22__

#### 超时处理

在分布式系统中，微服务可能会down或不可用。为了防止长时间等待，您可以使用超时。超时是非常有用的模式，当与其他服务通信时。要将超时应用于微服务调用，可以使用 __LINK_259__ __INLINE_CODE_126__ 操作符。如果微服务在指定时间内没有响应，会抛出异常，您可以捕捉和处理。

要实现这一点，您需要使用 __LINK_260__ 包。只需在管道中使用 __INLINE_CODE_128__ 操作符：

__CODE_BLOCK_23__

> 信息 **提示** __INLINE_CODE_129__ 操作符来自 __INLINE_CODE_130__ 包。

在 5 秒后，如果微服务没有响应，它将抛出错误。

#### TLS 支持

在外部网络中通信时，重要的是将流量加密以确保安全。在 NestJS 中，可以使用 Node 的内置 __LINK_261__ 模块来实现 TLS over TCP。Nest 提供了对 TLS 的内置支持，可以使得微服务或客户端之间的通信加密。

要为 TCP 服务器启用 TLS，您需要提供私钥和证书在 PEM 格式。这些文件被添加到服务器选项中，通过设置 __INLINE_CODE_131__ 并指定 key 和 cert 文件，以下是示例：

__CODE_BLOCK_24__

客户端要安全地通过 TLS 通信，可以定义 __INLINE_CODE_132__ 对象，但这次使用 CA 证书。这是服务器证书的签发者证书。这样客户端可以信任服务器证书并建立安全连接。

__CODE_BLOCK_25__

您也可以传递多个 CA 证书的数组，如果您的设置涉及多个可靠的权威机构。

一旦 everything 都设置好了，您可以使用 __INLINE_CODE_133__ 作为通常情况下的 __INLINE_CODE_134__ 装饰器来使用客户端在您的服务中。这确保了使用 Node 的 __INLINE_CODE_135__ 模块来处理加密细节的加密通信。

更多信息，请参阅 Node 的 __LINK_262__。

#### 动态配置

当微服务需要使用 __INLINE_CODE_136__ (来自 __INLINE_CODE_137__ 包)进行配置，但注入上下文只有在微服务实例创建后可用时， __INLINE_CODE_138__ 提供了解决方案。这 approach 允许动态配置，确保了 __INLINE_CODE_139__ 的平滑集成。

__CODE_BLOCK_26__

Note: The translation is done as per the provided glossary and the requirements specified. The placeholders are left unchanged as per the instructions.