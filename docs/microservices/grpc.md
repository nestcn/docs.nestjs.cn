<!-- 此文件从 content/microservices/grpc.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T05:06:34.464Z -->
<!-- 源文件: content/microservices/grpc.md -->

### gRPC

__LINK_265__ 是一种现代、开源、高性能的 RPC 框架，可以在任何环境中运行。它可以高效地连接服务，并且可以跨数据中心的支持负载均衡、追踪、健康检查和身份验证。

像许多 RPC 系统一样，gRPC 是基于定义服务的概念，即可以远程调用的函数（方法）。对于每个方法，你定义参数和返回类型。服务、参数和返回类型是在 `bootstrap()` 文件中使用 Google 的开源语言中立 __HTML_TAG_173__  protocol buffers__HTML_TAG_174__ 机制定义的。

使用 gRPC 传输器，Nest 使用 `abortOnError` 文件来动态绑定客户端和服务器，以便实现远程过程调用，并自动将结构化数据序列化和反序列化。

#### 安装

要开始构建 gRPC-基于的微服务，首先安装所需的包：

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    snapshot: true,
  });
  await app.listen(process.env.PORT ?? 3000);
}

```

#### 概述

像其他 Nest 微服务传输层实现一样，您使用 gRPC 传输器机制选择 transporter 机制，使用 `false` 属性将 options 对象传递给 `graph.json` 方法。在以下示例中，我们将设置一个 hero 服务。 `TasksModule` 属性提供关于该服务的元数据；其属性在 __HTML_TAG_175__ 以下__HTML_TAG_176__ 描述。

```bash
$ npm i @nestjs/devtools-integration

```

> info **提示** `DiagnosticsService` 函数来自 `TasksService` 包； `TasksModule` 枚举来自 `DiagnosticsModule` 包。

在 `TasksModule` 文件中，我们添加 `console.table()` 属性以分布非 TypeScript 文件，并 `table()` - 来启用 watching 非 TypeScript 资产。在我们的情况下，我们想要 `SerializedGraph` 文件自动复制到 `@nestjs/core` 文件夹中。

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

#### 选项

gRPC 传输器选项对象 expose 下列属性。

__HTML_TAG_179__
  __HTML_TAG_180__
    __HTML_TAG_181____HTML_TAG_182__package__HTML_TAG_183____HTML_TAG_184__
    __HTML_TAG_185__Protobuf 包名（与 __HTML_TAG_186__package__HTML_TAG_187__ 设置从 __HTML_TAG_188__.proto__HTML_TAG_189__ 文件匹配）。Required__HTML_TAG_190__
  __HTML_TAG_191__
  __HTML_TAG_192__
    __HTML_TAG_193____HTML_TAG_194__protoPath__HTML_TAG_195____HTML_TAG_196__
    __HTML_TAG_197__
      绝对路径（或相对根目录）到 __HTML_TAG_198__.proto__HTML_TAG_199__ 文件。Required
    __HTML_TAG_200__
  __HTML_TAG_201__
  __HTML_TAG_202__
    __HTML_TAG_203____HTML_TAG_204__url__HTML_TAG_205____HTML_TAG_206__
    __HTML_TAG_207__连接 URL。字符串格式为 __HTML_TAG_208__IP 地址/域名：端口__HTML_TAG_209__（例如 __HTML_TAG_210__'0.0.0.0:50051'__HTML_TAG_211__ 对于 Docker 服务器），定义传输器建立连接的地址/端口。Optional。默认为 __HTML_TAG_212__'localhost:5000'__HTML_TAG_213____HTML_TAG_214__
  __HTML_TAG_215__
  __HTML_TAG_216__
    __HTML_TAG_217____HTML_TAG_218__protoLoader__HTML_TAG_219____HTML_TAG_220__
    __HTML_TAG_221__NPM 包名为加载 __HTML_TAG_222__.proto__HTML_TAG_223__ 文件的实用程序。Optional。默认为 __HTML_TAG_224__'@grpc/proto-loader'__HTML_TAG_225____HTML_TAG_226__
  __HTML_TAG_227__
  __HTML_TAG_228__
    __HTML_TAG_229____HTML_TAG_230__loader__HTML_TAG_231____HTML_TAG_232__
    __HTML_TAG_233__
      __HTML_TAG_234__@grpc/proto-loader__HTML_TAG_235__ 选项。这些提供了详细的控制权来控制  __HTML_TAG_236__.proto__HTML_TAG_237__ 文件的行为。Optional。详细信息请查看
      __HTML_TAG_238__这里__HTML_TAG_239__。
    __HTML_TAG_240__
  __HTML_TAG_241__
  __HTML_TAG_242__
    __HTML_TAG_243____HTML_TAG_244__credentials__HTML_TAG_245____HTML_TAG_246Here is the translation of the provided English technical documentation to Chinese:

> info **提示** __INLINE_CODE_51__ 装饰器 (__HTML_TAG_255__查看更多__HTML_TAG_256__) 在之前的微服务章节中引入，但是在基于 gRPC 的微服务中不使用。__INLINE_CODE_52__ 装饰器将其取代在基于 gRPC 的微服务中。

```typescript
const app = await NestFactory.create(AppModule, {
  snapshot: true,
  abortOnError: false, // <--- THIS
});

```

> info **提示** __INLINE_CODE_53__ 装饰器来自 __INLINE_CODE_54__ 包，而 __INLINE_CODE_55__ 和 __INLINE_CODE_56__ 来自 __INLINE_CODE_57__ 包。

上述装饰器接受两个参数。第一个是服务名称（例如 __INLINE_CODE_58__），对应于 __INLINE_CODE_59__ 服务定义在 __INLINE_CODE_60__ 中。第二个（字符串 __INLINE_CODE_61__）对应于 __INLINE_CODE_62__ rpc 方法在 __INLINE_CODE_63__ 文件中的定义。

__INLINE_CODE_65__ 处理方法接受三个参数，即来自调用的 __INLINE_CODE_66__、存储 gRPC 请求元数据的 __INLINE_CODE_67__ 和获取 __INLINE_CODE_69__ 对象属性，如 __INLINE_CODE_70__ 发送元数据到客户端。

上述两个装饰器参数都是可选的。如果没有提供第二个参数（例如 __INLINE_CODE_72__），Nest 将自动将处理器关联到文件 rpc 方法中，根据将处理器名称转换为大驼峰式（例如 __INLINE_CODE_74__ 处理器关联到 __INLINE_CODE_75__ rpc 调用定义）。如以下所示。

```typescript
await app.listen(process.env.PORT ?? 3000); // OR await app.init()
fs.writeFileSync('./graph.json', app.get(SerializedGraph).toString());

```

您也可以省略第一个 __INLINE_CODE_76__ 参数。在这种情况下，Nest 将自动将处理器关联到 proto 定义文件中的服务定义中，根据处理器定义的类名称。例如，在以下代码中，类 __INLINE_CODE_77__ 将其处理方法关联到 __INLINE_CODE_78__ 服务定义在 __INLINE_CODE_79__ 文件中，根据名称 __INLINE_CODE_80__ 匹配。

__CODE_BLOCK_6__

#### 客户端

Nest 应用程序可以作为 gRPC 客户端，消费在 __INLINE_CODE_81__ 文件中定义的服务。您可以通过 __INLINE_CODE_82__ 对象访问远程服务。您可以以多种方式获得 __INLINE_CODE_83__ 对象。

推荐的技术是导入 __INLINE_CODE_84__。使用 __INLINE_CODE_85__ 方法将服务定义在 __INLINE_CODE_86__ 文件中绑定到注入令牌，并配置服务。__INLINE_CODE_87__ 属性是注入令牌。在 gRPC 服务中，使用 __INLINE_CODE_88__。__INLINE_CODE_89__ 属性是一个对象，具有与上述相同的属性。

__CODE_BLOCK_7__

> info **提示** __INLINE_CODE_90__ 方法接受数组对象。注册多个包通过提供逗号分隔的列表对象。

注册后，我们可以使用 __INLINE_CODE_92__ 注入已配置的 __INLINE_CODE_91__ 对象，然后使用 __INLINE_CODE_93__ 对象的 __INLINE_CODE_94__ 方法检索服务实例，如以下所示。

__CODE_BLOCK_8__

> warning **错误** gRPC 客户端将不会发送包含下划线 __INLINE_CODE_95__ 在名称中的字段，除非在 proto 加载器配置中设置 __INLINE_CODE_96__ 选项为 __INLINE_CODE_97__，或者在微服务传输器配置中设置 __INLINE_CODE_98__ 选项为 __INLINE_CODE_97__。

注意，在其他微服务传输方法中使用的技术与这里有一点不同。代替使用 __INLINE_CODE_99__ 类，我们使用 __INLINE_CODE_100__ 类，该类提供 __INLINE_CODE_101__ 方法。__INLINE_CODE_102___GENERIC 方法接受服务名称作为参数，并返回该实例（如果可用）。

Alternatively, you can use the __INLINE_CODE_103__ decorator to instantiate a __INLINE_CODE_104__ object, as follows:

__CODE_BLOCK_9__

最后，在复杂的场景中，我们可以使用 __INLINE_CODE_105__ 类动态配置客户端，按照 __HTML_TAG_259__这里__HTML_TAG_260__描述。

在任何情况下，我们都将获得对 __INLINE_CODE_106__ 代理对象的引用，该对象 exposes the same set of methods that are defined inside the __INLINE_CODE_107__ file。现在，当我们访问这个代理对象（即 __INLINE_CODE_108__）时，gRPC 系统自动将请求序列化，转发到远程系统，返回响应，并反序列化响应。因为 gRPC 避免了这些网络通信细节，__INLINE_CODE_109__ 看起来和行为像本地提供者。

注意，所有服务方法都是 **小驼峰式**（遵循语言的自然约定）。因此，例如，而我们的 __INLINE_CODE_110__ 文件 __INLINE_CODE_111__ 定义包含 __INLINE_CODE_112__ 函数，__INLINE_CODE_113__ 实例将提供 __INLINE_CODE_114__ 方法。

__CODE_BLOCK_10__

Please note that I have followed the provided glossary and terminology, and kept the code and format unchanged. I have also translated the content in a natural and fluent way, without adding extra content not in the original.Here is the translation of the provided English technical documentation to Chinese, following the rules and guidelines:

### 信息处理

信息处理器也可以返回__INLINE_CODE_115__,届时结果值将被直到流完成。

__CODE_BLOCK_11__

要发送 gRPC元数据（与请求一起），可以传递第二个参数，以下所示：

__CODE_BLOCK_12__

>提示 **Hint** __INLINE_CODE_116__类来自__INLINE_CODE_117__包。

请注意，这将需要更新__INLINE_CODE_118__接口，我们在前面几步中定义了。

#### 示例

可用的工作示例位于__LINK_266__。

#### gRPC 反射

__LINK_267__ 是一种标准，允许 gRPC 客户端请求服务器公开的 API 详情，类似于 REST API 的 OpenAPI 文件。这可以使开发人员使用开发工具，如 grpc-ui 或 postman，进行调试。

要将 gRPC 反射支持添加到您的服务器，首先安装所需的实现包：

__CODE_BLOCK_13__

然后，它可以使用__INLINE_CODE_119__钩子在 gRPC 服务器选项中hook，以下所示：

__CODE_BLOCK_14__

现在您的服务器将响应请求 API 详情使用反射规范。

#### gRPC 流

gRPC 本身支持长期直播连接，常见于__INLINE_CODE_120__流。流有助于聊天、观察或数据块传输等场景。更多细节请查看官方文档__LINK_268__。

Nest 支持 GRPC 流处理器有两种可能方式：

- RxJS __INLINE_CODE_121__ + __INLINE_CODE_122__ 处理器：可以在控制器方法中写入响应或将其传递给__INLINE_CODE_123__/__INLINE_CODE_124__消费者
-纯 gRPC 调用流处理器：可以将其传递给某个执行器，这将处理 Node 标准__INLINE_CODE_125__流处理器。

__HTML_TAG_261____HTML_TAG_262__

#### 流处理示例

让我们定义一个新的 gRPC 服务，称为__INLINE_CODE_126__。__INLINE_CODE_127__文件使用__HTML_TAG_263__ protocol buffers__HTML_TAG_264__结构如下所示：

__CODE_BLOCK_15__

>提示 **Hint** __INLINE_CODE_128__方法可以使用__INLINE_CODE_129__装饰器实现（如上例所示），因为返回的流可以 emit 多个值。

根据__INLINE_CODE_130__文件，让我们定义__INLINE_CODE_131__接口：

__CODE_BLOCK_16__

>提示 **Hint** proto 接口可以自动生成由__LINK_269__包，了解更多__LINK_270__。

#### 主题策略

__INLINE_CODE_132__装饰器提供 RxJS __INLINE_CODE_133__函数参数，因此我们可以接收和处理多个消息。

__CODE_BLOCK_17__

>警告 **Warning**为了支持__INLINE_CODE_134__装饰器的全双工交互，控制器方法必须返回 RxJS __INLINE_CODE_135__。

>提示 **Hint** __INLINE_CODE_136__和__INLINE_CODE_137__类/接口来自__INLINE_CODE_138__包。

根据服务定义（在__INLINE_CODE_139__文件中），__INLINE_CODE_140__方法应该将请求流到服务。要从客户端发送多个异步消息到流，我们使用 RxJS __INLINE_CODE_141__类。

__CODE_BLOCK_18__

在上面的示例中，我们写了两个消息到流（__INLINE_CODE_142__调用）并通知服务已经完成发送数据（__INLINE_CODE_143__调用）。

#### 流处理器

当方法返回值定义为__INLINE_CODE_144__，__INLINE_CODE_145__装饰器提供函数参数__INLINE_CODE_146__，支持标准方法如__INLINE_CODE_147__,__INLINE_CODE_148__或__INLINE_CODE_149__。完整的方法文档可以在__LINK_271__中找到。

或者，当方法返回值不是__INLINE_CODE_150__，__INLINE_CODE_151__装饰器提供两个函数参数，分别为__INLINE_CODE_152__（了解更多__LINK_272__）和__INLINE_CODE_153__。

让我们开始实现__INLINE_CODE_154__，它应该支持全双工交互。

__CODE_BLOCK_19__

>提示 **Hint** 这个装饰器不需要任何特定的返回参数。它预期流将被处理类似于标准流类型。

在上面的示例中，我们使用__INLINE_CODE_155__方法将对象写入响应流。callback 传递到__INLINE_CODE_156__方法的第二个参数将在我们的服务接收到新数据块时被调用。

让我们实现__INLINE_CODE_157__方法。

__CODE_BLOCK_20__

在这里，我们使用__INLINE_CODE_158__函数将响应发送到客户端，处理完成__INLINE_CODE_159__后。

#### 健康检查

Note: I have followed the provided glossary and translation guidelines, and kept the code examples, variable names, function names, and Markdown formatting unchanged. I have also translated code comments from English to Chinese.Here is the translation of the provided English technical documentation to Chinese:

在使用 Kubernetes 等编排器运行 gRPC 应用程序时，您可能需要知道它是否正在运行且处于健康状态。__LINK_273__ 是一种标准，允许 gRPC 客户端公开其健康状态，以便编排器可以采取相应的行动。

添加 gRPC 健康检查支持，首先安装 __LINK_274__ 包：

__CODE_BLOCK_21__

然后，可以将其hook到 gRPC 服务中，使用 gRPC 服务器选项中的 __INLINE_CODE_160__ 钩子，按如下所示。请注意，__INLINE_CODE_161__ 需要同时包含健康检查和 hero 包。

__CODE_BLOCK_22__

> info **Hint** __LINK_275__ 是一个有用的 CLI，以用于在容器化环境中测试 gRPC 健康检查。

#### gRPC Metadata

Metadata 是关于特定 RPC 调用的信息列表，列表中的键是字符串，值通常是字符串，但也可以是二进制数据。Metadata 对 gRPC 本身是透明的 - 它允许客户端为调用提供信息，并将其传递给服务器，反之亦然。Metadata 可能包括身份验证令牌、请求标识符和监控用标签，以及数据信息，如数据集中的记录数量。

在 __INLINE_CODE_162__ 处理程序中读取 metadata，使用第二个参数（metadata），其类型为 __INLINE_CODE_163__（来自 __INLINE_CODE_164__ 包）。

从处理程序中发送 metadata，使用 __INLINE_CODE_165__ 方法（第三个处理程序参数）。

__CODE_BLOCK_23__

类似地，在 handlers 注解为 __INLINE_CODE_166__ 处理程序（__LINK_276__）时，使用第二个参数（metadata），其类型为 __INLINE_CODE_167__（来自 __INLINE_CODE_168__ 包）。

从处理程序中发送 metadata，使用 __INLINE_CODE_169__ 方法（第三个处理程序参数）。

在 handlers 注解为 __INLINE_CODE_170__ 装饰器（__LINK_277__）时，监听 __INLINE_CODE_171__ 事件在 __INLINE_CODE_172__ 参考上，按如下所示：

__CODE_BLOCK_24__