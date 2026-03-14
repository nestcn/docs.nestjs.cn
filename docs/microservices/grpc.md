<!-- 此文件从 content/microservices/grpc.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T04:57:21.908Z -->
<!-- 源文件: content/microservices/grpc.md -->

### gRPC

__LINK_265__ 是一个 modern, open source, 高性能 RPC Framework，可以在任何环境中运行。它可以高效地将服务连接到数据中心的不同部分，支持可插拔的负载均衡、追踪、健康检查和身份验证。

像许多 RPC 系统一样，gRPC 是基于定义一个服务的概念，即可以远程调用的函数（方法）。对于每个方法，您定义参数和返回类型。服务、参数和返回类型在 __INLINE_CODE_25__ 文件中使用 Google 的开源语言中立 __HTML_TAG_173__ 协议缓冲区 __HTML_TAG_174__ 机制定义。

使用 gRPC  transporter，Nest 使用 __INLINE_CODE_26__ 文件动态将客户端和服务器绑定，以实现远程过程调用，自动将结构化数据序列化和反序列化。

#### 安装

要开始构建 gRPC 基于的微服务，首先安装所需的包：

```typescript
@UseInterceptors(new TransformInterceptor())
@MessagePattern({ cmd: 'sum' })
accumulate(data: number[]): number {
  return (data || []).reduce((a, b) => a + b);
}

```

#### 概述

像其他 Nest 微服务传输层实现一样，您使用 __INLINE_CODE_27__ 属性选择 gRPC  transporter 机制，通过 options 对象中的 __INLINE_CODE_28__ 方法。下面示例中，我们将设置 hero 服务。 __INLINE_CODE_29__ 属性提供了该服务的元数据；其属性在 __HTML_TAG_175__ 下描述。

__CODE_BLOCK_1__

> info **提示** __INLINE_CODE_30__ 函数来自 __INLINE_CODE_31__ 包； __INLINE_CODE_32__ 枚举来自 __INLINE_CODE_33__ 包。

在 __INLINE_CODE_34__ 文件中，我们添加 __INLINE_CODE_35__ 属性，允许分布非 TypeScript 文件，并 __INLINE_CODE_36__ - 打开所有非 TypeScript 资产的监视。在我们的情况下，我们想 __INLINE_CODE_37__ 文件自动复制到 __INLINE_CODE_38__ 文件夹。

__CODE_BLOCK_2__

#### 选项

gRPC  transporter 选项对象公开以下属性。

__HTML_TAG_179__
  __HTML_TAG_180__
    __HTML_TAG_181____HTML_TAG_182__package__HTML_TAG_183____HTML_TAG_184__
    __HTML_TAG_185__ Protobuf 包名（与 __HTML_TAG_186__package__HTML_TAG_187__ 设置从 __HTML_TAG_188__.proto__HTML_TAG_189__ 文件匹配）。必需__HTML_TAG_190__
  __HTML_TAG_191__
  __HTML_TAG_192__
    __HTML_TAG_193____HTML_TAG_194__protoPath__HTML_TAG_195____HTML_TAG_196__
    __HTML_TAG_197__
      绝对（或相对于根目录）的 __HTML_TAG_198__.proto__HTML_TAG_199__ 文件路径。必需
    __HTML_TAG_200__
  __HTML_TAG_201__
  __HTML_TAG_202__
    __HTML_TAG_203____HTML_TAG_204__url__HTML_TAG_205____HTML_TAG_206__
    __HTML_TAG_207__ 连接 URL。字符串格式为 __HTML_TAG_208__IP 地址/域名：端口__HTML_TAG_209__（例如 __HTML_TAG_210__'0.0.0.0:50051'__HTML_TAG_211__ 对于 Docker 服务器）定义连接 URL。可选。默认为 __HTML_TAG_212__'localhost:5000'__HTML_TAG_213____HTML_TAG_214__
  __HTML_TAG_215__
  __HTML_TAG_216__
    __HTML_TAG_217____HTML_TAG_218__protoLoader__HTML_TAG_219____HTML_TAG_220__
    __HTML_TAG_221__ NPM 包名为加载 __HTML_TAG_222__.proto__HTML_TAG_223__ 文件的实用工具。可选。默认为 __HTML_TAG_224__'@grpc/proto-loader'__HTML_TAG_225____HTML_TAG_226__
  __HTML_TAG_227__
  __HTML_TAG_228__
    __HTML_TAG_229____HTML_TAG_230__loader__HTML_TAG_231____HTML_TAG_232__
    __HTML_TAG_233__
      __HTML_TAG_234__@grpc/proto-loader__HTML_TAG_235__ 选项。这些提供了 __HTML_TAG_236__.proto__HTML_TAG_237__ 文件行为的详细控制。可选。请参阅 __HTML_TAG_238__  here__HTML_TAG_239__ 获取更多信息
    __HTML_TAG_240__
  __HTML_TAG_241__
  __HTML_TAG_242__
    __HTML_TAG_243____HTML_TAG_244__credentials__HTML_TAG_245____HTML_TAG_246__
    __HTML_TAG_247__
      服务器凭证。可选。 __HTMLHere is the translated text in Chinese:

> info **提示** __INLINE_CODE_51__ 装饰器（阅读更多__HTML_TAG_256__）在之前的微服务章节中引入，但不适用于基于 gRPC 的微服务。 __INLINE_CODE_52__ 装饰器在 gRPC 基于微服务中有效地取代了它。

__CODE_BLOCK_4__

> info **提示** __INLINE_CODE_53__ 装饰器来自 __INLINE_CODE_54__ 包， __INLINE_CODE_55__ 和 __INLINE_CODE_56__ 来自 __INLINE_CODE_57__ 包。

上面展示的装饰器接受两个参数。第一个是服务名称（例如 __INLINE_CODE_58__），对应于 __INLINE_CODE_59__ 服务定义在 __INLINE_CODE_60__ 中。第二个参数（字符串 __INLINE_CODE_61__）对应于 __INLINE_CODE_62__ rpc 方法在 __INLINE_CODE_63__ 文件中的定义。

__INLINE_CODE_65__ 处理方法接受三个参数：来自调用的 __INLINE_CODE_66__、存储 gRPC 请求元数据的 __INLINE_CODE_67__ 和获取 __INLINE_CODE_69__ 对象属性，如 __INLINE_CODE_70__，用于将元数据发送到客户端。

这两个装饰器参数都是可选的。如果不提供第二个参数（例如 __INLINE_CODE_72__），Nest 将自动将处理程序与文件 rpc 方法关联，根据将处理程序名称转换为大驼峰命名（例如 __INLINE_CODE_74__ 处理程序与 __INLINE_CODE_75__ rpc 调用定义关联）。如以下所示。

__CODE_BLOCK_5__

您也可以省略第一个 __INLINE_CODE_76__ 参数。在这种情况下，Nest 将自动将处理程序与 proto 定义文件中的服务定义关联，根据处理程序定义的类名来匹配。例如，在以下代码中，类 __INLINE_CODE_77__ 将其处理方法与 __INLINE_CODE_78__ 服务定义在 __INLINE_CODE_79__ 文件中关联，根据名称匹配 __INLINE_CODE_80__。

__CODE_BLOCK_6__

#### 客户端

Nest 应用程序可以作为 gRPC 客户端，消费定义在 __INLINE_CODE_81__ 文件中的服务。您可以通过 __INLINE_CODE_82__ 对象访问远程服务。您可以通过多种方式获得 __INLINE_CODE_83__ 对象。

推荐的技术是导入 __INLINE_CODE_84__。使用 __INLINE_CODE_85__ 方法将包中的服务定义在 __INLINE_CODE_86__ 文件中绑定到注入令牌，并配置服务。 __INLINE_CODE_87__ 属性是注入令牌。在 gRPC 服务中，使用 __INLINE_CODE_88__。 __INLINE_CODE_89__ 属性是一个对象，具有与上述相同的属性。

__CODE_BLOCK_7__

> info **提示** __INLINE_CODE_90__ 方法接受对象数组。注册多个包通过提供逗号分隔的注册对象列表。

注册后，我们可以使用 __INLINE_CODE_92__ 注入配置的 __INLINE_CODE_91__ 对象，然后使用 __INLINE_CODE_93__ 对象的 __INLINE_CODE_94__ 方法获取服务实例，例如以下所示。

__CODE_BLOCK_8__

> error **警告** gRPC 客户端不会将包含下划线 __INLINE_CODE_95__ 名称的字段发送到客户端，除非在 proto 加载器配置中设置 __INLINE_CODE_96__ 选项为 __INLINE_CODE_97__，或在微服务传输器配置中设置 __INLINE_CODE_98__。

注意，与其他微服务传输方法不同的是，我们使用 __INLINE_CODE_100__ 类，而不是 __INLINE_CODE_99__ 类，提供 __INLINE_CODE_101__ 方法。 __INLINE_CODE_102__ generic 方法接受服务名称作为参数，并返回其实例（如果可用）。

Alternately，您可以使用 __INLINE_CODE_103__ 装饰器实例化 __INLINE_CODE_104__ 对象，例如以下所示。

__CODE_BLOCK_9__

最后，在复杂场景中，我们可以使用 __INLINE_CODE_105__ 类来动态配置客户端，如以下所示。

无论哪种情况，我们都将拥有对 __INLINE_CODE_106__ 代理对象的引用，该对象 expose 与 __INLINE_CODE_107__ 文件中定义的同样一组方法。现在，当我们访问这个代理对象（即 __INLINE_CODE_108__）时，gRPC 系统将自动序列化请求，转发到远程系统，返回响应，并反序列化响应。由于 gRPC 将我们shield 自这些网络通信细节， __INLINE_CODE_109__ 看起来和行为像本地提供者。

请注意，所有服务方法都是小驼峰命名（以遵循语言的自然命名惯例）。因此，例如，在我们的 __INLINE_CODE_110__ 文件 __INLINE_CODE_111__ 定义中包含 __INLINE_CODE_112__ 函数，而 __INLINE_CODE_113__ 实例将提供 __INLINE_CODE_114__ 方法。

__CODE_BLOCK_10__

I hope this translation meets your requirements.Here is the translated Chinese technical documentation:

消息处理器还可以返回__INLINE_CODE_115__,在这种情况下，结果值将直到流完成被发送。

__CODE_BLOCK_11__

要发送gRPC元数据（一起发送请求），您可以传递第二个参数，例如：

__CODE_BLOCK_12__

>info 提示__INLINE_CODE_116__类来自__INLINE_CODE_117__包。

请注意，这需要更新我们在前几个步骤中定义的__INLINE_CODE_118__接口。

#### 示例

可用的工作示例__LINK_266__。

#### gRPC反射

__LINK_267__是标准，它允许gRPC客户端请求服务器公开的API详细信息，就像公开REST API的OpenAPI文档一样。这可以使使用开发调试工具，如grpc-ui或postman更加容易。

要将gRPC反射支持添加到您的服务器中，首先安装所需的实现包：

__CODE_BLOCK_13__

然后，可以使用__INLINE_CODE_119__ hook在gRPC服务器选项中hook它，例如：

__CODE_BLOCK_14__

现在您的服务器将响应请求API详细信息使用反射规范。

#### gRPC流

gRPC本身支持长时间的实时连接，通常称为__INLINE_CODE_120__。流很有用，例如聊天、观察或块数据传输。更多信息请参阅官方文档__LINK_268__。

Nest支持gRPC流处理器有两种可能的方式：

- RxJS __INLINE_CODE_121__ + __INLINE_CODE_122__处理器：可以在控制器方法中写入响应或将其传递给__INLINE_CODE_123__/__INLINE_CODE_124__消费者
-纯gRPC调用流处理器：可以将其传递给某个执行器，该执行器将处理Node标准__INLINE_CODE_125__流处理器。

__HTML_TAG_261____HTML_TAG_262__

#### 流处理示例

让我们定义一个新的示例gRPC服务__INLINE_CODE_126__。__INLINE_CODE_127__文件结构使用__HTML_TAG_263__protocol buffers__HTML_TAG_264__。以下是它的样子：

__CODE_BLOCK_15__

>info 提示__INLINE_CODE_128__方法可以使用__INLINE_CODE_129__装饰器简单实现，因为返回的流可以发送多个值。

根据__INLINE_CODE_130__文件，让我们定义__INLINE_CODE_131__接口：

__CODE_BLOCK_16__

>info 提示proto接口可以通过__LINK_269__包自动生成，了解更多__LINK_270__。

#### 主题策略

__INLINE_CODE_132__装饰器提供RxJS __INLINE_CODE_133__函数参数，因此我们可以接收和处理多个消息。

__CODE_BLOCK_17__

>警告 **警告** 为了支持__INLINE_CODE_134__装饰器的全双工交互，控制器方法必须返回RxJS __INLINE_CODE_135__。

>info 提示__INLINE_CODE_136__和__INLINE_CODE_137__类/接口来自__INLINE_CODE_138__包。

根据服务定义（在__INLINE_CODE_139__文件中），__INLINE_CODE_140__方法应该将请求发送到服务。要从客户端将多个异步消息发送到流，我们使用RxJS __INLINE_CODE_141__类。

__CODE_BLOCK_18__

在上面的示例中，我们写了两个消息到流（__INLINE_CODE_142__ calls）并通知服务已发送数据完成（__INLINE_CODE_143__ call）。

#### 调用流处理器

当方法返回值定义为__INLINE_CODE_144__，__INLINE_CODE_145__装饰器提供函数参数__INLINE_CODE_146__，支持标准方法，如__INLINE_CODE_147__、__INLINE_CODE_148__或__INLINE_CODE_149__。完整的文档可在__LINK_271__找到。

alternatively，当方法返回值不是__INLINE_CODE_150__，__INLINE_CODE_151__装饰器提供两个函数参数，分别是__INLINE_CODE_152__（了解更多__LINK_272__）和__INLINE_CODE_153__。

让我们开始实现__INLINE_CODE_154__，它应该支持全双工交互。

__CODE_BLOCK_19__

>info 提示这个装饰器不需要任何特定的返回参数。它预期流将被处理类似于标准流类型。

在上面的示例中，我们使用__INLINE_CODE_155__方法将对象写入响应流。回调方法将在我们的服务接收到新数据块时被调用。

让我们实现__INLINE_CODE_157__方法。

__CODE_BLOCK_20__

在这里，我们使用__INLINE_CODE_158__函数将响应发送到客户端，以便在__INLINE_CODE_159__处理完成时发送。

#### 健康检查Here is the translated Chinese technical documentation:

在使用 Kubernetes 等编排器运行 gRPC 应用程序时，您可能需要了解其是否正在运行并处于健康状态。 __LINK_273__ 是一种标准，允许 gRPC 客户端将健康状态暴露给编排器，以便编排器采取相应的措施。

要添加 gRPC 健康检查支持，首先安装 __LINK_274__ 包：

__CODE_BLOCK_21__

然后，可以将其hook到 gRPC 服务中使用 gRPC 服务器选项中的 __INLINE_CODE_160__ 钩子，如下所示。请注意，__INLINE_CODE_161__ 需要同时具有健康检查和 hero 包。

__CODE_BLOCK_22__

> info **提示** __LINK_275__ 是一个有用的 CLI，用于在容器化环境中测试 gRPC 健康检查。

#### gRPC 元数据

元数据是关于特定 RPC 调用的信息，形式为键值对列表，键是字符串，值通常是字符串，但可以是二进制数据。元数据是 gRPC 本身对其透明的 - 它允许客户端为调用提供信息，并将其传递给服务器，反之亦然。元数据可能包括身份验证令牌、请求标识符和监控标签，以及数据信息，如数据集中的记录数。

在 __INLINE_CODE_162__ 处理程序中读取元数据，使用第二个参数（metadata），它是 __INLINE_CODE_163__ 类型（来自 __INLINE_CODE_164__ 包）。

要将元数据从处理程序返回，使用 __INLINE_CODE_165__ 方法（第三个处理程序参数）。

__CODE_BLOCK_23__

类似地，在使用 __INLINE_CODE_166__ 处理程序（__LINK_276__）读取元数据，使用第二个参数（metadata），它是 __INLINE_CODE_167__ 类型（来自 __INLINE_CODE_168__ 包）。

要将元数据从处理程序返回，使用 __INLINE_CODE_169__ 方法（第三个处理程序参数）。

在 __LINK_277__ 中读取元数据（使用 __INLINE_CODE_170__ 装饰器标注的处理程序），监听 __INLINE_CODE_171__ 事件在 __INLINE_CODE_172__ 参考上，如下所示：

__CODE_BLOCK_24__