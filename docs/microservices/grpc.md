<!-- 此文件从 content/microservices/grpc.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T05:11:17.031Z -->
<!-- 源文件: content/microservices/grpc.md -->

### gRPC

__LINK_265__是一个现代、开源、高性能的RPC框架，可以在任何环境中运行。它可以高效地将服务连接在一起，并且支持可插拔的负载均衡、追踪、健康检查和身份验证。

像许多RPC系统一样，gRPC基于定义服务以便远程调用函数（方法）的概念。对于每个方法，您定义参数和返回类型。服务、参数和返回类型在使用Google开源语言中立___HTML_TAG_173__protocol buffers__HTML_TAG_174__机制的_`DEVTOOLS_API_KEY`文件中定义。

使用gRPC transporter，Nest使用_`master`文件来动态绑定客户端和服务器，以便轻松实现远程过程调用，并自动序列化和反序列化结构化数据。

#### 安装

要开始构建基于gRPC的微服务，首先安装所需的包：

```typescript
async function bootstrap() {
  const shouldPublishGraph = process.env.PUBLISH_GRAPH === "true";

  const app = await NestFactory.create(AppModule, {
    snapshot: true,
    preview: shouldPublishGraph,
  });

  if (shouldPublishGraph) {
    await app.init();

    const publishOptions = { ... } // NOTE: this options object will vary depending on the CI/CD provider you're using
    const graphPublisher = new GraphPublisher(app);
    await graphPublisher.publish(publishOptions);

    await app.close();
  } else {
    await app.listen(process.env.PORT ?? 3000);
  }
}

```

#### 概述

像其他Nest微服务transporter layer实现一样，您使用_`master`属性来选择gRPC transporter机制。以下示例中，我们将设置hero服务。_`DEVTOOLS_API_KEY`属性提供了该服务的元数据；其属性在___HTML_TAG_175__以下__HTML_TAG_176__中描述。

```yaml
name: Devtools

on:
  push:
    branches:
      - master
  pull_request:
    branches:
      - '*'

jobs:
  publish:
    if: github.actor!= 'dependabot[bot]'
    name: Publish graph
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '16'
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Setup Environment (PR)
        if: {{ '${{' }} github.event_name == 'pull_request' {{ '}}' }}
        shell: bash
        run: |
          echo "COMMIT_SHA={{ '${{' }} github.event.pull_request.head.sha {{ '}}' }}" >>\${GITHUB_ENV}
      - name: Setup Environment (Push)
        if: {{ '${{' }} github.event_name == 'push' {{ '}}' }}
        shell: bash
        run: |
          echo "COMMIT_SHA=\${GITHUB_SHA}" >> \${GITHUB_ENV}
      - name: Publish
        run: PUBLISH_GRAPH=true npm run start
        env:
          DEVTOOLS_API_KEY: CHANGE_THIS_TO_YOUR_API_KEY
          REPOSITORY_NAME: {{ '${{' }} github.event.repository.name {{ '}}' }}
          BRANCH_NAME: {{ '${{' }} github.head_ref || github.ref_name {{ '}}' }}
          TARGET_SHA: {{ '${{' }} github.event.pull_request.base.sha {{ '}}' }}

```

> info **提示**_`main.ts`函数来自_`publishOptions`包；_`publishOptions`枚举来自_`push`包。

在_`master`文件中，我们添加_`main`属性，以允许分布非TypeScript文件，并_`staging` - 来启用所有非TypeScript资产的监视。在我们的案例中，我们想_`production`文件自动复制到_`pull request`文件夹。

```typescript
const publishOptions = {
  apiKey: process.env.DEVTOOLS_API_KEY,
  repository: process.env.REPOSITORY_NAME,
  owner: process.env.GITHUB_REPOSITORY_OWNER,
  sha: process.env.COMMIT_SHA,
  target: process.env.TARGET_SHA,
  trigger: process.env.GITHUB_BASE_REF ? 'pull' : 'push',
  branch: process.env.BRANCH_NAME,
};

```

#### 选项

gRPC transporter选项对象公开了以下属性。

__HTML_TAG_179__
  __HTML_TAG_180__
    __HTML_TAG_181____HTML_TAG_182__package__HTML_TAG_183____HTML_TAG_184__
    __HTML_TAG_185__Protobuf包名（与___HTML_TAG_186__package__HTML_TAG_187__设置从___HTML_TAG_188__.proto__HTML_TAG_189__文件匹配）。必需__HTML_TAG_190__
  __HTML_TAG_191__
  __HTML_TAG_192__
    __HTML_TAG_193____HTML_TAG_194__protoPath__HTML_TAG_195____HTML_TAG_196__
    __HTML_TAG_197__
      绝对路径（或相对根目录）到___HTML_TAG_198__.proto__HTML_TAG_199__文件。必需
    __HTML_TAG_200__
  __HTML_TAG_201__
  __HTML_TAG_202__
    __HTML_TAG_203____HTML_TAG_204__url__HTML_TAG_205____HTML_TAG_206__
    __HTML_TAG_207__连接URL。字符串格式___HTML_TAG_208__IP地址/域名：端口__HTML_TAG_209__（例如___HTML_TAG_210__'0.0.0.0:50051'__HTML_TAG_211__对Docker服务器）定义了连接器建立连接的地址/端口。可选。默认为___HTML_TAG_212__'localhost:5000'__HTML_TAG_213____HTML_TAG_214__
  __HTML_TAG_215__
  __HTML_TAG_216__
    __HTML_TAG_217____HTML_TAG_218__protoLoader__HTML_TAG_219____HTML_TAG_220__
    __HTML_TAG_221__NPM包名为加载___HTML_TAG_222__.proto__HTML_TAG_223__文件的实用工具。可选。默认为___HTML_TAG_224__'@grpc/proto-loader'__HTML_TAG_225____HTML_TAG_226__
  __HTML_TAG_227__
  __HTML_TAG_228__
    __HTML_TAG_229____HTML_TAG_230__loader__HTML_TAG_231____HTML_TAG_232__
    __HTML_TAG_233__
      ___@grpc/proto-loader__HTML_TAG_235__选项。这些提供了对___HTML_TAG_236__.proto__HTML_TAG_237__文件的行为的详细控制。可选。请查看___HTML_TAG_238__这里__HTML_TAG_239__以获取更多详细信息
    __HTML_TAG_240__
  __HTML_TAG_241__
  __HTML_TAG_242__
    __HTML_TAG_243____HTML_TAG_244__credentials__HTML_TAG_245____HTML_TAG_246__
    __HTML_TAG_247__
      服务器凭证。可选。___HTML_TAG_248__请查看这里__HTML_TAG_249__
    __HTML_TAG_250__
 Here is the translation of the provided English technical documentation to Chinese, following the rules and guidelines:

> 信息 **提示** __INLINE_CODE_51__ 装饰器（__HTML_TAG_255__阅读更多__HTML_TAG_256__）在前面的微服务章节中已被引入，但它不适用于基于 gRPC 的微服务。__INLINE_CODE_52__ 装饰器在 gRPC 基础上取代了 __INLINE_CODE_51__ 装饰器。

__代码块 4__

> 信息 **提示** __INLINE_CODE_53__ 装饰器来自 __INLINE_CODE_54__ 包，而 __INLINE_CODE_55__ 和 __INLINE_CODE_56__ 则来自 __INLINE_CODE_57__ 包。

该装饰器接受两个参数。第一个参数是服务名称（例如 __INLINE_CODE_58__），对应于 __INLINE_CODE_59__ 服务定义在 __INLINE_CODE_60__ 中。第二个参数（字符串 __INLINE_CODE_61__）对应于 __INLINE_CODE_62__ rpc 方法在 __INLINE_CODE_63__ 文件中的定义。

__INLINE_CODE_65__ 处理方法接受三个参数：来自调用的 __INLINE_CODE_66__、用于存储 gRPC 请求元数据的 __INLINE_CODE_67__ 和用于获取 __INLINE_CODE_69__ 对象属性的 __INLINE_CODE_68__。

这两个装饰器参数都是可选的。如果没有提供第二个参数（例如 __INLINE_CODE_72__），Nest 将自动将 handler 关联到 rpc 方法中，基于将 handler 名称转换为大驼峰命名（例如 __INLINE_CODE_74__ 处理方法关联到 __INLINE_CODE_75__ rpc 调用定义）。如下所示。

__代码块 5__

也可以省略第一个 __INLINE_CODE_76__ 参数。在这种情况下，Nest 将自动将 handler 关联到 proto 定义文件中的服务定义中，基于 handler 定义的类名和服务定义的文件名的匹配（例如，类 __INLINE_CODE_77__ 将其 handler 方法关联到 __INLINE_CODE_78__ 服务定义在 __INLINE_CODE_79__ 文件中的匹配）。

__代码块 6__

#### 客户端

Nest 应用程序可以作为 gRPC 客户端，消费在 __INLINE_CODE_81__ 文件中定义的服务。你可以通过 __INLINE_CODE_82__ 对象访问远程服务。你可以通过以下方式获取 __INLINE_CODE_83__ 对象。

推荐的技术是导入 __INLINE_CODE_84__。使用 __INLINE_CODE_85__ 方法将包裹服务定义在 __INLINE_CODE_86__ 文件中与注入令牌相关联，并以配置服务。__INLINE_CODE_87__ 属性是注入令牌。对于 gRPC 服务，使用 __INLINE_CODE_88__。__INLINE_CODE_89__ 属性是一个对象，描述了上述相同的属性。

__代码块 7__

> 信息 **提示** __INLINE_CODE_90__ 方法接受数组对象。注册多个包裹提供一个逗号分隔的注册对象列表。

注册后，我们可以使用 __INLINE_CODE_92__ 注入配置的 __INLINE_CODE_91__ 对象，然后使用 __INLINE_CODE_93__ 对象的 __INLINE_CODE_94__ 方法获取服务实例，例如下所示。

__代码块 8__

> 警告 **错误** gRPC 客户端将不会发送包含下划线 __INLINE_CODE_95__ 的字段名称的请求，除非在 proto 加载器配置（__INLINE_CODE_98__ 在微服务传输器配置）中设置 __INLINE_CODE_96__ 选项为 __INLINE_CODE_97__。

请注意，这与其他微服务传输方法中使用的技术有小差异。我们使用 __INLINE_CODE_100__ 类，而不是 __INLINE_CODE_99__ 类，这个类提供了 __INLINE_CODE_101__ 方法。__INLINE_CODE_102__ generic 方法接受服务名称作为参数，并返回其实例（如果可用）。

Alternatively, we can use the __INLINE_CODE_103__ decorator to instantiate a __INLINE_CODE_104__ object, as follows:

__代码块 9__

最后，我们可以使用 __INLINE_CODE_105__ 类来注入动态配置的客户端，例如 __HTML_TAG_259__here__HTML_TAG_260__。

无论哪种情况，我们都将获得 __INLINE_CODE_106__ 代理对象的引用，该对象 expose 了 __INLINE_CODE_107__ 文件中的相同方法。现在，当我们访问这个代理对象（即 __INLINE_CODE_108__）时，gRPC 系统将自动序列化请求，将其转发到远程系统，返回响应，并反序列化响应。因为 gRPC 将我们从这些网络通信细节中保护，我们的 __INLINE_CODE_109__ 看起来和行为像本地提供商。

注意，所有服务方法都是 **小驼峰命名**（以自然语言的命名惯例为准）。例如，而我们的 __INLINE_CODE_110__ 文件 __INLINE_CODE_111__ 定义包含 __INLINE_CODE_112__ 函数，__INLINE_CODE_113__ 实例将提供 __INLINE_CODE_114__ 方法。

__代码块 10__

Please let me know if there's anything else I can assist you with.Here is the translation of the provided English technical documentation to Chinese:

### 消息处理

可以使用 __INLINE_CODE_115__ 返回消息处理器，结果值将直到流完成时被发射。

__CODE_BLOCK_11__

要发送 gRPC 元数据（与请求一起），可以传递第二个参数，以下所示：

__CODE_BLOCK_12__

> info **提示** __INLINE_CODE_116__ 类从 __INLINE_CODE_117__ 包中导入。

请注意，这将需要更新我们之前定义的 __INLINE_CODE_118__ 接口。

#### 示例

可用的工作示例 __LINK_266__。

#### gRPC 反射

__LINK_267__ 是一种标准，允许 gRPC 客户端请求服务器公开的 API 详情，类似于公开 REST API 的 OpenAPI 文档。这可以使使用开发者调试工具，如 grpc-ui 或 postman 的工作变得更加容易。

要将 gRPC 反射支持添加到您的服务器上，首先安装所需的实现包：

__CODE_BLOCK_13__

然后，可以使用 gRPC 服务器选项中的 __INLINE_CODE_119__ 插件将其hook进去：

__CODE_BLOCK_14__

现在，您的服务器将响应请求 API 详情的消息，使用反射规范。

#### gRPC 流

gRPC 本身支持长期的实时连接，通常称为 __INLINE_CODE_120__。流是有用的场景，如聊天、观察或块数据传输。请查看官方文档 __LINK_268__。

Nest 支持 GRPC 流处理器在两个可能的方式：

- RxJS __INLINE_CODE_121__ + __INLINE_CODE_122__ 处理器：可以在控制器方法中写入响应或将其传递给 __INLINE_CODE_123__/__INLINE_CODE_124__ 消费者
- Pure GRPC 调用流处理器：可以传递给某个执行器，它将处理 Node 标准 __INLINE_CODE_125__ 流处理器。

__HTML_TAG_261____HTML_TAG_262__

#### 流处理示例

让我们定义一个新的 gRPC 服务 __INLINE_CODE_126__。 __INLINE_CODE_127__ 文件结构使用 __HTML_TAG_263__ 协议缓冲区 __HTML_TAG_264__。以下是它的样子：

__CODE_BLOCK_15__

> info **提示** __INLINE_CODE_128__ 方法可以使用 __INLINE_CODE_129__ 装饰器实现，因为返回的流可以发射多个值。

根据 __INLINE_CODE_130__ 文件， let's 定义 __INLINE_CODE_131__ 接口：

__CODE_BLOCK_16__

> info **提示** proto 接口可以通过 __LINK_269__ 包自动生成，了解更多 __LINK_270__。

#### 主题策略

__INLINE_CODE_132__ 装饰器提供 RxJS __INLINE_CODE_133__ 作为函数参数。因此，我们可以接收和处理多个消息。

__CODE_BLOCK_17__

> warning **警告** 要支持 __INLINE_CODE_134__ 装饰器的全双工交互，控制器方法必须返回 RxJS __INLINE_CODE_135__。

> info **提示** __INLINE_CODE_136__ 和 __INLINE_CODE_137__ 类/接口来自 __INLINE_CODE_138__ 包。

根据服务定义（在 __INLINE_CODE_139__ 文件中）， __INLINE_CODE_140__ 方法应该将请求流式传输到服务。要从客户端发送多个异步消息到流，我们利用 RxJS __INLINE_CODE_141__ 类。

__CODE_BLOCK_18__

在上面的示例中，我们写了两个消息到流（__INLINE_CODE_142__ 调用）并通知服务我们已经完成发送数据（__INLINE_CODE_143__ 调用）。

#### 调用流处理器

当方法返回值定义为 __INLINE_CODE_144__，__INLINE_CODE_145__ 装饰器提供函数参数作为 __INLINE_CODE_146__，支持标准方法如 __INLINE_CODE_147__、__INLINE_CODE_148__ 或 __INLINE_CODE_149__。请查看完整文档 __LINK_271__。

Alternatively，when the method return value is not a __INLINE_CODE_150__, the __INLINE_CODE_151__ decorator provides two function parameters, respectively __INLINE_CODE_152__ (learn more __LINK_272__) and __INLINE_CODE_153__.

Let's start with implementing the __INLINE_CODE_154__ which should support a full-duplex interaction.

__CODE_BLOCK_19__

> info **提示** 这个装饰器不需要任何特定的返回参数。它期望流将被处理为标准流类型。

在上面的示例中，我们使用 __INLINE_CODE_155__ 方法将对象写入响应流。传递给 __INLINE_CODE_156__ 方法的回调函数将在我们的服务接收到新数据块时被调用。

Let's implement the __INLINE_CODE_157__ method.

__CODE_BLOCK_20__

在这里，我们使用 __INLINE_CODE_158__ 函数将响应发送出去，一旦处理完 __INLINE_CODE_159__。

#### 健康检查When running a gRPC application in an orchestrator such as Kubernetes, you may need to know if it is running and in a healthy state. The [__LINK_273__](https://link/273) is a standard that allows gRPC clients to expose their health status to allow the orchestrator to act accordingly.

To add gRPC health check support, first install the [__LINK_274__](https://link/274) package:

```typescript
__CODE_BLOCK_21__

```

Then it can be hooked into the gRPC service using the `__INLINE_CODE_160__` hook in your gRPC server options, as follows. Note that the `__INLINE_CODE_161__` needs to have both the health check and the hero package.

```typescript
__CODE_BLOCK_22__

```

> info **Hint** The [__LINK_275__](https://link/275) is a useful CLI to test gRPC health checks in a containerized environment.

#### gRPC Metadata

Metadata 是关于特定 RPC 调用的一种信息，形式为键值对列表，其中键是字符串，值通常是字符串，但可以是二进制数据。Metadata 对 gRPC 自身是透明的 - 它让客户端提供与调用相关的信息，并将其传递给服务器，反之亦然。Metadata 可能包括身份验证令牌、请求标识符和监控目的的标签，以及数据信息，如数据集中的记录数。

在 `__INLINE_CODE_162__` 处理程序中读取 Metadata，使用第二个参数（metadata），它是类型 `__INLINE_CODE_163__`（来自 `__INLINE_CODE_164__` 包）的对象。

从处理程序返回 Metadata，使用 `__INLINE_CODE_165__` 方法（第三个处理程序参数）。

```typescript
__CODE_BLOCK_23__

```

类似地，在 handlers 注解了 `__INLINE_CODE_166__` 处理程序（[__LINK_276__](https://link/276)）中读取 Metadata，使用第二个参数（metadata），它是类型 `__INLINE_CODE_167__`（来自 `__INLINE_CODE_168__` 包）的对象。

从处理程序返回 Metadata，使用 `__INLINE_CODE_169__` 方法（第三个处理程序参数）。

在 handlers 注解了 `__INLINE_CODE_170__` 装饰器（[__LINK_277__](https://link/277)）中读取 Metadata，监听 `__INLINE_CODE_171__` 事件在 `__INLINE_CODE_172__` 参考上，例如：

```typescript
__CODE_BLOCK_24__

```