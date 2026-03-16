<!-- 此文件从 content/microservices/grpc.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T05:23:38.510Z -->
<!-- 源文件: content/microservices/grpc.md -->

### gRPC

[__LINK_265__](https://link.com) 是一个现代、开源、高性能的 RPC 框架，可以在任何环境中运行。它可以高效地连接服务，并且在数据中心之间提供可插拔的负载均衡、追踪、健康检查和身份验证支持。

像许多 RPC 系统一样，gRPC 基于定义服务的概念，即远程调用函数（方法）。对于每个方法，您定义参数和返回类型。服务、参数和返回类型在 __INLINE_CODE_25__ 文件中使用 Google 的开源语言中立 __HTML_TAG_173__ 协议缓冲区 __HTML_TAG_174__ 机制定义。

使用 gRPC 传输器，Nest 使用 __INLINE_CODE_26__ 文件来动态绑定客户端和服务器，以便轻松实现远程过程调用，并自动将结构化数据序列化和反序列化。

#### 安装

要开始构建 gRPC-based 微服务，首先安装所需的包：

```typescript
import { ApolloServerPlugin, GraphQLRequestListener } from '@apollo/server';
import { Plugin } from '@nestjs/apollo';

@Plugin()
export class LoggingPlugin implements ApolloServerPlugin {
  async requestDidStart(): Promise<GraphQLRequestListener<any>> {
    console.log('Request started');
    return {
      async willSendResponse() {
        console.log('Will send response');
      },
    };
  }
}

```

#### 概述

像其他 Nest 微服务传输层实现一样，您使用 __INLINE_CODE_27__ 属性选择 gRPC 传输器机制，以便在 __INLINE_CODE_28__ 方法中传递选项对象。在以下示例中，我们将设置一个 hero 服务。__INLINE_CODE_29__ 属性提供了该服务的元数据；其属性在 __HTML_TAG_175__以下__HTML_TAG_176__ 中描述。

```typescript
@Module({
  providers: [LoggingPlugin],
})
export class CommonModule {}

```

> info **提示** __INLINE_CODE_30__ 函数来自 __INLINE_CODE_31__ 包；__INLINE_CODE_32__ 枚举来自 __INLINE_CODE_33__ 包。

在 __INLINE_CODE_34__ 文件中，我们添加 __INLINE_CODE_35__ 属性，以便分发非 TypeScript 文件，并 __INLINE_CODE_36__ -以便开启所有非 TypeScript 资产的监控。在我们的案例中，我们想要 __INLINE_CODE_37__ 文件自动地被复制到 __INLINE_CODE_38__ 文件夹中。

```typescript
GraphQLModule.forRoot({
  // ...
  plugins: [ApolloServerOperationRegistry({ /* options */})]
}),

```

#### 选项

gRPC 传输器选项对象公开了以下属性。

__HTML_TAG_179__
  __HTML_TAG_180__
    __HTML_TAG_181____HTML_TAG_182__package__HTML_TAG_183____HTML_TAG_184__
    __HTML_TAG_185__Protobuf package name (matches __HTML_TAG_186__package__HTML_TAG_187__ setting from __HTML_TAG_188__.proto__HTML_TAG_189__ file).  Required__HTML_TAG_190__
  __HTML_TAG_191__
  __HTML_TAG_192__
    __HTML_TAG_193____HTML_TAG_194__protoPath__HTML_TAG_195____HTML_TAG_196__
    __HTML_TAG_197__
      绝对路径（或相对于根目录）到 __HTML_TAG_198__.proto__HTML_TAG_199__ 文件。 Required
    __HTML_TAG_200__
  __HTML_TAG_201__
  __HTML_TAG_202__
    __HTML_TAG_203____HTML_TAG_204__url__HTML_TAG_205____HTML_TAG_206__
    __HTML_TAG_207__Connection url.  字符串在 __HTML_TAG_208__ip address/dns name:port__HTML_TAG_209__ 格式（例如 __HTML_TAG_210__'0.0.0.0:50051'__HTML_TAG_211__ 对于 Docker 服务器）定义传输器在连接时使用的地址/端口。 Optional.  Defaults to __HTML_TAG_212__'localhost:5000'__HTML_TAG_213____HTML_TAG_214__
  __HTML_TAG_215__
  __HTML_TAG_216__
    __HTML_TAG_217____HTML_TAG_218__protoLoader__HTML_TAG_219____HTML_TAG_220__
    __HTML_TAG_221__NPM package name for the utility to load __HTML_TAG_222__.proto__HTML_TAG_223__ files.  Optional.  Defaults to __HTML_TAG_224__'@grpc/proto-loader'__HTML_TAG_225____HTML_TAG_226__
  __HTML_TAG_227__
  __HTML_TAG_228__
    __HTML_TAG_229____HTML_TAG_230__loader__HTML_TAG_231____HTML_TAG_232__
    __HTML_TAG_233__
      __HTML_TAG_234__@grpc/proto-loader__HTML_TAG_235__ options. These provide detailed control over the behavior of __HTML_TAG_236__.proto__HTML_TAG_237__ files. Optional. See
      __HTML_TAG_238__here__HTML_TAG_239__ for more details
    __HTML_TAG_240__
  __HTML_TAG_241__
  __HTML_TAG_242__
    __HTML_TAG_243____HTML_TAG_244> info 提示 The __INLINE_CODE_51__ 装饰器 (__HTML_TAG_255__read more__HTML_TAG_256__) introduced in previous microservices chapters is not used with gRPC-based microservices. The __INLINE_CODE_52__ 装饰器 effectively takes its place for gRPC-based microservices.

__CODE_BLOCK_4__

> info 提示 The __INLINE_CODE_53__ 装饰器是从 __INLINE_CODE_54__ 包中导入的，而 __INLINE_CODE_55__ 和 __INLINE_CODE_56__ 则从 __INLINE_CODE_57__ 包中导入。

该装饰器接受两个参数。第一个是服务名称（例如 __INLINE_CODE_58__），对应于 __INLINE_CODE_59__ 服务定义在 __INLINE_CODE_60__ 中。第二个（字符串 __INLINE_CODE_61__）对应于 __INLINE_CODE_62__ rpc 方法在 __INLINE_CODE_63__ 文件中的定义。

该 __INLINE_CODE_65__ 处理方法接受三个参数：来自调用的 __INLINE_CODE_66__、用于存储 gRPC 请求元数据的 __INLINE_CODE_67__ 和用于获取 __INLINE_CODE_69__ 对象属性的 __INLINE_CODE_68__。

两个 __INLINE_CODE_71__ 装饰器参数都是可选的。如果不提供第二个参数（例如 __INLINE_CODE_72__），Nest 将自动将 handler 关联到服务定义中，以便将 handler 名称转换为大驼峰命名法（例如将 __INLINE_CODE_74__ 处理方法关联到 __INLINE_CODE_75__ rpc 调用定义）。如下所示：

__CODE_BLOCK_5__

你也可以省略第一个 __INLINE_CODE_76__ 参数。在这种情况下，Nest 将自动将 handler 关联到服务定义中，以便将 handler 定义的类名与 proto 定义文件中的服务定义匹配。例如，在以下代码中，类 __INLINE_CODE_77__ 将其处理方法关联到 __INLINE_CODE_78__ 服务定义在 __INLINE_CODE_79__ 文件中，以便将名 __INLINE_CODE_80__ 的匹配。

__CODE_BLOCK_6__

#### 客户端

Nest 应用程序可以作为 gRPC 客户端，消费在 __INLINE_CODE_81__ 文件中定义的服务。你可以通过 __INLINE_CODE_82__ 对象访问远程服务。你可以通过以下几种方式获取 __INLINE_CODE_83__ 对象。

推荐的技术是导入 __INLINE_CODE_84__。使用 __INLINE_CODE_85__ 方法将包装服务定义在 __INLINE_CODE_86__ 文件中注入到注入 token 中，并配置服务。__INLINE_CODE_87__ 属性是注入 token。对于 gRPC 服务，使用 __INLINE_CODE_88__。__INLINE_CODE_89__ 属性是一个对象，其中包含了上述所述的同等属性。

__CODE_BLOCK_7__

> info 提示 The __INLINE_CODE_90__ 方法接受数组对象。注册多个包通过提供逗号分隔的注册对象列表。

注册后，我们可以使用 __INLINE_CODE_92__ 注入配置好的 __INLINE_CODE_91__ 对象，然后使用 __INLINE_CODE_93__ 对象的 __INLINE_CODE_94__ 方法来获取服务实例，例如：

__CODE_BLOCK_8__

> error 警告 gRPC 客户端不会发送包含下划线 __INLINE_CODE_95__ 在名称中的字段，除非在 proto 加载器配置（在微服务传输器配置）中将 __INLINE_CODE_96__ 选项设置为 __INLINE_CODE_97__。

注意与其他微服务传输方法技术相比，有一些小差异。相反，我们使用 __INLINE_CODE_100__ 类，该类提供 __INLINE_CODE_101__ 方法。__INLINE_CODE_102__ 通用方法将服务名称作为参数，并返回其实例（如果可用）。

或者，你可以使用 __INLINE_CODE_103__ 装饰器来实例化 __INLINE_CODE_104__ 对象，例如：

__CODE_BLOCK_9__

最后，在复杂情况下，我们可以使用 __INLINE_CODE_105__ 类来注入动态配置的客户端，例如：

__CODE_BLOCK_10__

在任何情况下，我们都将拥有 __INLINE_CODE_106__ 代理对象的引用，该对象 expose 了定义在 __INLINE_CODE_107__ 文件中的同样方法集。现在，当我们访问这个代理对象（即 __INLINE_CODE_108__）时，gRPC 系统将自动序列化请求、将其转发到远程系统、返回响应、并反序列化响应。由于 gRPC 将我们从这些网络通信细节中隔离，__INLINE_CODE_109__ 看起来和行为起来像一个本地提供商。Here is the translation of the provided English technical documentation to Chinese:

**MESSAGE HANDLER**

消息处理器也可以返回 __INLINE_CODE_115__, 在这种情况下，结果值将直到流完成时被发送。

__CODE_BLOCK_11__

为了发送 gRPC 元数据（与请求一起），可以传递第二个参数，以下所示：

__CODE_BLOCK_12__

> info **提示** __INLINE_CODE_116__ 类来自 __INLINE_CODE_117__ 包。

请注意，这将需要更新我们之前定义的一些步骤中的 __INLINE_CODE_118__ 接口。

#### 示例

可用的工作示例，请点击 __LINK_266__。

#### gRPC 反射

__LINK_267__ 是一种标准，允许 gRPC 客户端请求服务器公开的 API 详情，类似于 REST API 的 OpenAPI 文档。这可以使开发人员使用调试工具，如 grpc-ui 或 Postman 等更加容易。

要将 gRPC 反射支持添加到您的服务器中，首先安装所需的实现包：

__CODE_BLOCK_13__

然后，可以使用 __INLINE_CODE_119__ 在 gRPC 服务器选项中 hook 入口，以下所示：

__CODE_BLOCK_14__

现在，您的服务器将响应请求 API 详情使用反射规范。

#### gRPC 流

gRPC 本身支持长期实时连接，通常称为 __INLINE_CODE_120__。流是有用的，在以下情况下，如聊天、观察或分块数据传输。请查看官方文档 __LINK_268__。

Nest 支持 GRPC 流处理器两种可能方式：

- RxJS __INLINE_CODE_121__ + __INLINE_CODE_122__ 处理器：可以在控制器方法中写入响应或将其传递给 __INLINE_CODE_123__/__INLINE_CODE_124__ 消费者
- Pure GRPC 调用流处理器：可以将其传递给某个执行器，该执行器将处理 Node 标准 __INLINE_CODE_125__ 流处理器。

__HTML_TAG_261____HTML_TAG_262__

#### 流处理示例

让我们定义一个新的 gRPC 服务称为 __INLINE_CODE_126__。该 __INLINE_CODE_127__ 文件使用 __HTML_TAG_263__ 协议缓冲区 __HTML_TAG_264__。以下是其结构：

__CODE_BLOCK_15__

> info **提示** __INLINE_CODE_128__ 方法可以使用 __INLINE_CODE_129__ 装饰器实现，因为返回的流可以发送多个值。

根据 __INLINE_CODE_130__ 文件，让我们定义 __INLINE_CODE_131__ 接口：

__CODE_BLOCK_16__

> info **提示** proto 接口可以自动由 __LINK_269__ 包生成，了解更多 __LINK_270__。

#### 主题策略

__INLINE_CODE_132__ 装饰器提供 RxJS __INLINE_CODE_133__ 作为函数参数。因此，我们可以接收和处理多个消息。

__CODE_BLOCK_17__

> warning **警告** 若要支持双向交互，请控制器方法返回 RxJS __INLINE_CODE_135__。

> info **提示** __INLINE_CODE_136__ 和 __INLINE_CODE_137__ 类/接口来自 __INLINE_CODE_138__ 包。

根据服务定义（在 __INLINE_CODE_139__ 文件中），__INLINE_CODE_140__ 方法应该将请求流式传输到服务中。要从客户端发送多个异步消息到流中，我们使用 RxJS __INLINE_CODE_141__ 类。

__CODE_BLOCK_18__

在上面的示例中，我们写入了两个消息到流中（__INLINE_CODE_142__ 调用）并通知服务，我们已经完成发送数据（__INLINE_CODE_143__ 调用）。

#### 调用流处理器

当方法返回值定义为 __INLINE_CODE_144__，__INLINE_CODE_145__ 装饰器提供函数参数作为 __INLINE_CODE_146__，支持标准方法如 __INLINE_CODE_147__、__INLINE_CODE_148__ 或 __INLINE_CODE_149__。完整文档可在 __LINK_271__ 中找到。

alternatively，当方法返回值不是 __INLINE_CODE_150__，__INLINE_CODE_151__ 装饰器提供两个函数参数，分别是 __INLINE_CODE_152__（了解更多 __LINK_272__）和 __INLINE_CODE_153__。

让我们从实现 __INLINE_CODE_154__ 开始，该方法应该支持双向交互。

__CODE_BLOCK_19__

> info **提示** 此装饰器不需要提供任何特定的返回参数。它期望流将被处理类似于任何其他标准流类型。

在上面的示例中，我们使用 __INLINE_CODE_155__ 方法将对象写入响应流中。callback 传递给 __INLINE_CODE_156__ 方法的第二个参数将在我们的服务接收新数据块时被调用。

让我们实现 __INLINE_CODE_157__ 方法。

__CODE_BLOCK_20__

在这里，我们使用 __INLINE_CODE_158__ 函数将响应发送到客户端，一旦 __INLINE_CODE_159__ 处理完成。

#### 健康检查Here is the translation of the English technical documentation to Chinese:

运行 gRPC 应用程序在 orchestrator 中，如 Kubernetes，您可能需要知道它是否正在运行且处于 healthy 状态。 __LINK_273__ 是一种标准，允许 gRPC 客户端 expose 自己的健康状态，以便 orchestrator 可以根据情况进行操作。

要添加 gRPC 健康检查支持，首先安装 __LINK_274__ 包：

__CODE_BLOCK_21__

然后，可以将其hook到 gRPC 服务中，使用 gRPC 服务器选项中的 __INLINE_CODE_160__ hook，例如。请注意， __INLINE_CODE_161__ 需要同时包含健康检查和 hero 包。

__CODE_BLOCK_22__

> info **提示** __LINK_275__ 是一个有用的 CLI，用于在容器化环境中测试 gRPC 健康检查。

#### gRPC 元数据

元数据是关于特定 RPC 调用的一种信息，形式为一系列键值对，其中键是字符串，值通常是字符串，但可以是二进制数据。元数据对 gRPC 本身是透明的—it 让客户端提供与调用相关的信息给服务器，并让服务器提供相应的信息给客户端。元数据可能包括身份验证令牌、请求标识符和监控目的的标签，以及数据信息，如数据集中记录的数量。

在 __INLINE_CODE_162__ 处理器中读取元数据，可以使用第二个参数（metadata），它是类型为 __INLINE_CODE_163__ 的对象（从 __INLINE_CODE_164__ 包中导入）。

从处理器返回元数据，可以使用 __INLINE_CODE_165__ 方法（第三个处理器参数）。

__CODE_BLOCK_23__

类似地，在 handlers annotated with __INLINE_CODE_166__ handler (__LINK_276__) 中读取元数据，可以使用第二个参数（metadata），它是类型为 __INLINE_CODE_167__ 的对象（从 __INLINE_CODE_168__ 包中导入）。

从处理器返回元数据，可以使用 __INLINE_CODE_169__ 方法（第三个处理器参数）。

在 handlers annotated with __INLINE_CODE_170__ decorator (__LINK_277__) 中读取元数据，可以监听 __INLINE_CODE_171__ 事件于 __INLINE_CODE_172__ 参考，例如：

__CODE_BLOCK_24__