<!-- 此文件从 content/microservices/grpc.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T05:26:42.532Z -->
<!-- 源文件: content/microservices/grpc.md -->

### gRPC

__[265](/techblog/grpc)__ is a modern, open source, high-performance RPC framework that can run in any environment. It can efficiently connect services in and across data centers with pluggable support for load balancing, tracing, health checking and authentication.

Like many RPC systems, gRPC is based on the concept of defining a service in terms of functions (methods) that can be called remotely. For each method, you define the parameters and return types. Services, parameters, and return types are defined in __INLINE_CODE_25__ files using Google's open source language-neutral __HTML_TAG_173__protocol buffers__HTML_TAG_174__ mechanism.

With the gRPC transporter, Nest uses __INLINE_CODE_26__ files to dynamically bind clients and servers to make it easy to implement remote procedure calls, automatically serializing and deserializing structured data.

#### 安装

要开始构建 gRPC-基于的微服务，首先安装所需的包：

```typescript
@UseInterceptors(new TransformInterceptor())
@MessagePattern({ cmd: 'sum' })
accumulate(data: number[]): number {
  return (data || []).reduce((a, b) => a + b);
}

```

#### 概述

像其他 Nest 微服务传输层实现一样，您使用 __INLINE_CODE_27__ 属性选择 gRPC 传输层机制。在以下示例中，我们将设置一个hero 服务。__INLINE_CODE_29__ 属性提供了该服务的元数据；其属性如 __HTML_TAG_175__以下__HTML_TAG_176__所述。

__CODE_BLOCK_1__

> 信息 **提示** __INLINE_CODE_30__ 函数来自 __INLINE_CODE_31__ 包；__INLINE_CODE_32__ 枚举来自 __INLINE_CODE_33__ 包。

在 __INLINE_CODE_34__ 文件中，我们添加 __INLINE_CODE_35__ 属性，以便分布非 TypeScript 文件，并 __INLINE_CODE_36__ - 以启用对所有非 TypeScript 资产的监视。在我们的案例中，我们想 __INLINE_CODE_37__ 文件自动复制到 __INLINE_CODE_38__ 文件夹。

__CODE_BLOCK_2__

#### 选项

gRPC 传输层选项对象公开以下属性。

__HTML_TAG_179__
  __HTML_TAG_180__
    __HTML_TAG_181____HTML_TAG_182__package__HTML_TAG_183____HTML_TAG_184__
    __HTML_TAG_185__Protobuf 包名（与 __HTML_TAG_186__package__HTML_TAG_187__ 设置在 __HTML_TAG_188__.proto__HTML_TAG_189__ 文件中）。必填__HTML_TAG_190__
  __HTML_TAG_191__
  __HTML_TAG_192__
    __HTML_TAG_193____HTML_TAG_194__protoPath__HTML_TAG_195____HTML_TAG_196__
    __HTML_TAG_197__
      绝对路径（或相对根目录）到 __HTML_TAG_198__.proto__HTML_TAG_199__ 文件。必填
    __HTML_TAG_200__
  __HTML_TAG_201__
  __HTML_TAG_202__
    __HTML_TAG_203____HTML_TAG_204__url__HTML_TAG_205____HTML_TAG_206__
    __HTML_TAG_207__连接 URL。字符串格式 __HTML_TAG_208__ip 地址/域名:端口__HTML_TAG_209__（例如 __HTML_TAG_210__'0.0.0.0:50051'__HTML_TAG_211__ 对于 Docker 服务器），定义了连接 URL 的地址/端口。可选。默认为 __HTML_TAG_212__'localhost:5000'__HTML_TAG_213____HTML_TAG_214__
  __HTML_TAG_215__
  __HTML_TAG_216__
    __HTML_TAG_217____HTML_TAG_218__protoLoader__HTML_TAG_219____HTML_TAG_220__
    __HTML_TAG_221__NPM 包名为 __HTML_TAG_222__.proto__HTML_TAG_223__ 文件加载器。可选。默认为 __HTML_TAG_224__'@grpc/proto-loader'__HTML_TAG_225____HTML_TAG_226__
  __HTML_TAG_227__
  __HTML_TAG_228__
    __HTML_TAG_229____HTML_TAG_230__loader__HTML_TAG_231____HTML_TAG_232__
    __HTML_TAG_233__
      __HTML_TAG_234__@grpc/proto-loader__HTML_TAG_235__ 选项。这些提供了对 __HTML_TAG_236__.proto__HTML_TAG_237__ 文件行为的详细控制。可选。请查看 __HTML_TAG_238__这里__HTML_TAG_239__ 获取更多信息
    __HTML_TAG_240__
  __HTML_TAG_241__
  __HTML_TAG_242__
    __HTML_TAG_243____HTML_TAG_244__credentials__HTML_TAG_245____HTML_TAG_246__
    __HTML_TAG_247__
      服务器凭证。可选。__HTML_TAG_248__请查看Here is the translated documentation in Chinese:

> info **提示** __INLINE_CODE_51__ 装饰器（阅读更多__HTML_TAG_256__）在之前的微服务章节中引入，但是在 gRPC 基于的微服务中没有使用。 __INLINE_CODE_52__ 装饰器对其进行了替代，以便于 gRPC 基于的微服务。

__CODE_BLOCK_4__

> info **提示** __INLINE_CODE_53__ 装饰器来自 __INLINE_CODE_54__ 包，而 __INLINE_CODE_55__ 和 __INLINE_CODE_56__ 来自 __INLINE_CODE_57__ 包。

上述装饰器需要两个参数。第一个是服务名称（例如 __INLINE_CODE_58__），对应于 __INLINE_CODE_59__ 服务定义在 __INLINE_CODE_60__ 中。第二个（字符串 __INLINE_CODE_61__）对应于 __INLINE_CODE_62__ rpc 方法在 __INLINE_CODE_63__ 文件中的定义。

__INLINE_CODE_65__ 处理方法需要三个参数：__INLINE_CODE_66__ 从调用的参数、__INLINE_CODE_67__ 存储 gRPC 请求元数据和 __INLINE_CODE_68__ 获取 __INLINE_CODE_69__ 对象的属性，如 __INLINE_CODE_70__ 发送元数据到客户端。

__INLINE_CODE_71__ 装饰器的两个参数都是可选的。如果没有提供第二个参数（例如 __INLINE_CODE_72__），Nest 将自动将 __INLINE_CODE_73__ 文件的 rpc 方法与处理程序相关联，基于将处理程序名称转换为大驼峰式（例如 __INLINE_CODE_74__ 处理程序与 __INLINE_CODE_75__ rpc 调用定义相关联）。如以下所示。

__CODE_BLOCK_5__

您也可以省略第一个 __INLINE_CODE_76__ 参数。在这种情况下，Nest 将自动将处理程序与 proto 定义文件中的服务定义相关联，基于处理程序定义的类名。例如，在以下代码中，类 __INLINE_CODE_77__ 将其处理方法与 __INLINE_CODE_78__ 服务定义在 __INLINE_CODE_79__ 文件中相关联，基于名称 __INLINE_CODE_80__ 匹配。

__CODE_BLOCK_6__

#### 客户端

Nest 应用程序可以作为 gRPC 客户端，消费在 __INLINE_CODE_81__ 文件中定义的服务。您可以通过 __INLINE_CODE_82__ 对象访问远程服务。您可以通过多种方式获得 __INLINE_CODE_83__ 对象。

推荐的技术是导入 __INLINE_CODE_84__。使用 __INLINE_CODE_85__ 方法将 __INLINE_CODE_86__ 文件中的服务定义绑定到注射令牌，并配置服务。__INLINE_CODE_87__ 属性是注射令牌。对于 gRPC 服务，使用 __INLINE_CODE_88__。__INLINE_CODE_89__ 属性是一个对象，其中包含了前面所述的同一属性。

__CODE_BLOCK_7__

> info **提示** __INLINE_CODE_90__ 方法接受对象数组。注册多个包通过提供逗号分隔的注册对象列表。

注册后，我们可以使用 __INLINE_CODE_92__ 注射 __INLINE_CODE_91__ 对象，然后使用 __INLINE_CODE_93__ 对象的 __INLINE_CODE_94__ 方法获取服务实例，如以下所示。

__CODE_BLOCK_8__

> error **警告** gRPC 客户端不会发送包含下划线 __INLINE_CODE_95__ 在名称中的字段，除非设置 __INLINE_CODE_96__ 选项为 __INLINE_CODE_97__ 在 proto 加载器配置中（或在微服务传输器配置中）。

注意，在其他微服务传输方法中使用的技术与这里有一些小差异。我们使用 __INLINE_CODE_100__ 类，而不是 __INLINE_CODE_99__ 类，该类提供 __INLINE_CODE_101__ 方法。__INLINE_CODE_102__ generic 方法需要服务名称作为参数，并返回服务实例（如果可用）。

或者，您可以使用 __INLINE_CODE_103__ 装饰器来实例化 __INLINE_CODE_104__ 对象，如以下所示：

__CODE_BLOCK_9__

最后，在复杂的场景中，我们可以注射动态配置的客户端，使用 __INLINE_CODE_105__ 类，如前所述。

在任何情况下，我们都将获得 __INLINE_CODE_106__ 代理对象的引用，该对象 expose 了 __INLINE_CODE_107__ 文件中的同样方法集。现在，当我们访问这个代理对象（即 __INLINE_CODE_108__）时，gRPC 系统自动序列化请求，向远程系统 forwarding 请求，返回响应，并反序列化响应。因为 gRPC 将我们从这些网络通信细节中隔离，__INLINE_CODE_109__ 看起来和行为像本地提供者。

请注意，所有服务方法都是小驼峰式（遵循语言的自然惯例）。因此，例如，在我们的 __INLINE_CODE_110__ 文件 __INLINE_CODE_111__ 定义中包含 __INLINE_CODE_112__ 函数，而 __INLINE_CODE_113__ 实例将提供 __INLINE_CODE_114__ 方法。

__CODE_BLOCK_10__

Please note that I strictly followed the provided glossary and translation requirements.Here is the translation of the English technical documentation to Chinese:

**信息处理器**

信息处理器还可以返回一个 __INLINE_CODE_115__, 在这种情况下，结果值将直到流完成时被发送。

__CODE_BLOCK_11__

要发送 gRPC 元数据（包括请求），您可以传递第二个参数，以下所示：

__CODE_BLOCK_12__

> 提示 **Hint** __INLINE_CODE_116__ 类是从 __INLINE_CODE_117__ 包中导入的。

请注意，这需要更新我们之前定义的 __INLINE_CODE_118__ 接口。

#### 示例

可用的工作示例 __LINK_266__。

#### gRPC 反射

__LINK_267__ 是一种标准，它允许 gRPC 客户端请求服务器 expose 的 API 详情，类似于 expose 一个 REST API 的 OpenAPI 文档。这可以使开发者使用调试工具，如 grpc-ui 或 postman easier。

要将 gRPC 反射支持添加到您的服务器中，首先安装所需的实现包：

__CODE_BLOCK_13__

然后，您可以使用 __INLINE_CODE_119__ 钩子在 gRPC 服务器选项中hook it，以下所示：

__CODE_BLOCK_14__

现在，您的服务器将响应请求 API 详情使用反射规范。

#### gRPC 流

gRPC 本身支持长期的实时连接， conventionally known as __INLINE_CODE_120__. 流是有用的情况，如聊天、观察或分 chunk 数据传输。更多细节可以在官方文档 __LINK_268__ 中找到。

Nest 支持 GRPC 流处理器两种可能方式：

- RxJS __INLINE_CODE_121__ + __INLINE_CODE_122__ 处理器：可以在控制器方法中写入响应或将其传递给 __INLINE_CODE_123__/__INLINE_CODE_124__ 消费者
-纯 GRPC 调用流处理器：可以将其传递给某个执行器，它将处理 Node 标准 __INLINE_CODE_125__ 流处理器。

__HTML_TAG_261____HTML_TAG_262__

#### 流处理示例

让我们定义一个新的示例 gRPC 服务称为 __INLINE_CODE_126__。 __INLINE_CODE_127__ 文件使用 __HTML_TAG_263__ 协议缓冲区 __HTML_TAG_264__ 构建。以下是它的外观：

__CODE_BLOCK_15__

> 提示 **Hint** __INLINE_CODE_128__ 方法可以使用 __INLINE_CODE_129__ 装饰器简单地实现，因为返回的流可以 emit 多个值。

根据 __INLINE_CODE_130__ 文件，我们可以定义 __INLINE_CODE_131__ 接口：

__CODE_BLOCK_16__

> 提示 **Hint** proto 接口可以自动由 __LINK_269__ 包生成，了解更多 __LINK_270__。

#### 主题策略

__INLINE_CODE_132__ 装饰器提供 RxJS __INLINE_CODE_133__ 作为函数参数，因此我们可以接收和处理多个消息。

__CODE_BLOCK_17__

> 警告 **Warning** 要支持 __INLINE_CODE_134__ 装饰器的全双工交互，控制器方法必须返回 RxJS __INLINE_CODE_135__。

> 提示 **Hint** __INLINE_CODE_136__ 和 __INLINE_CODE_137__ 类/接口是从 __INLINE_CODE_138__ 包中导入的。

根据服务定义（在 __INLINE_CODE_139__ 文件中），__INLINE_CODE_140__ 方法应该将请求发送到服务。要从客户端发送多个异步消息到流，我们使用 RxJS __INLINE_CODE_141__ 类。

__CODE_BLOCK_18__

在上面的示例中，我们写入了两个消息到流（__INLINE_CODE_142__ 调用）并通知服务已经完成发送数据（__INLINE_CODE_143__ 调用）。

#### 调用流处理器

当方法返回值定义为 __INLINE_CODE_144__，__INLINE_CODE_145__ 装饰器提供函数参数作为 __INLINE_CODE_146__，支持标准方法，如 __INLINE_CODE_147__、__INLINE_CODE_148__ 或 __INLINE_CODE_149__。可用的方法文档可以在 __LINK_271__ 中找到。

或者，当方法返回值不是 __INLINE_CODE_150__，__INLINE_CODE_151__ 装饰器提供两个函数参数，分别是 __INLINE_CODE_152__（了解更多 __LINK_272__）和 __INLINE_CODE_153__。

让我们开始实现 __INLINE_CODE_154__，它应该支持全双工交互。

__CODE_BLOCK_19__

> 提示 **Hint** 这个装饰器不需要提供任何特定返回参数。期望流将被处理类似于任何其他标准流类型。

在上面的示例中，我们使用 __INLINE_CODE_155__ 方法将对象写入响应流。回调函数传递给 __INLINE_CODE_156__ 方法的第二个参数将在我们的服务接收到新数据时被调用。

让我们实现 __INLINE_CODE_157__ 方法。

__CODE_BLOCK_20__

这里我们使用 __INLINE_CODE_158__ 函数将响应发送到处理完成 __INLINE_CODE_159__ 后。

#### 健康检查Here is the translation of the provided English technical documentation to Chinese:

在将 gRPC 应用程序部署到容器 orchestrator，如 Kubernetes 时，您可能需要了解其是否正在运行并处于健康状态。__LINK_273__ 是一种标准，允许 gRPC 客户端公开其健康状态，以便 orchestrator 根据相应地行动。

要添加 gRPC 健康检查支持，首先安装 __LINK_274__ 包：

__CODE_BLOCK_21__

然后，可以将其hook到 gRPC 服务中，使用 gRPC 服务器选项中的 __INLINE_CODE_160__钩子，例如。请注意，__INLINE_CODE_161__ 需要同时具有健康检查和 hero 包。

__CODE_BLOCK_22__

> info **提示** __LINK_275__ 是一个有用的 CLI，用于在容器化环境中测试 gRPC 健康检查。

#### gRPC Metadata

Metadata 是关于特定 RPC 调用的信息，形式为键值对列表，其中键是字符串，值通常是字符串，但可以是二进制数据。Metadata 对 gRPC 来说是透明的—it 允许客户端将信息与调用关联，并将其传递给服务器。Metadata 可能包括身份验证令牌、请求标识符和监控用标签，以及数据信息，如数据集中的记录数量。

要在 __INLINE_CODE_162__ 处理程序中读取 metadata，使用第二个参数（metadata），该参数类型为 __INLINE_CODE_163__（来自 __INLINE_CODE_164__ 包）。

要从处理程序中发送 metadata，使用 __INLINE_CODE_165__ 方法（第三个处理程序参数）。

__CODE_BLOCK_23__

同样，在使用 __INLINE_CODE_166__ 处理程序（__LINK_276__）时，使用第二个参数（metadata），该参数类型为 __INLINE_CODE_167__（来自 __INLINE_CODE_168__ 包）。

要从处理程序中发送 metadata，使用 __INLINE_CODE_169__ 方法（第三个处理程序参数）。

要从 __LINK_277__ 中读取 metadata（使用 __INLINE_CODE_170__ 装饰器注解的处理程序），请监听 __INLINE_CODE_171__ 事件在 __INLINE_CODE_172__ 参考中，例如：

__CODE_BLOCK_24__