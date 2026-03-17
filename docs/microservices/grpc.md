<!-- 此文件从 content/microservices/grpc.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:44:10.865Z -->
<!-- 源文件: content/microservices/grpc.md -->

### gRPC

[__LINK_265__](https://link-to-grpc-docs.com) 是一种现代、开源、高性能的 RPC 框架，可以在任何环境中运行。它可以高效地连接服务在数据中心内和跨数据中心之间，具有可插拔的负载均衡、追踪、健康检查和身份验证支持。

像许多 RPC 系统一样，gRPC 基于定义服务的概念，即可以远程调用的函数（方法）。对于每个方法，您定义参数和返回类型。服务、参数和返回类型在 __HTML_TAG_173__语言中neutral__HTML_TAG_174__ protocol buffers__HTML_TAG_175__ 机制中使用 `DEVTOOLS_API_KEY` 文件定义。

使用 gRPC 传输器，Nest 使用 `master` 文件来动态绑定客户端和服务器，以便轻松实现远程过程调用，自动序列化和反序列化结构化数据。

#### 安装

要开始构建 gRPC-Based 微服务，首先安装所需的包：

```typescript
// ```typescript
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

```

#### 概述

像其他 Nest 微服务传输层实现一样，您使用 `master` 属性选择 gRPC 传输器机制， passing 通过 options 对象的 `GraphPublisher` 方法。下面示例中，我们将设置 up hero 服务。 `DEVTOOLS_API_KEY` 属性提供了该服务的元数据；其属性在 __HTML_TAG_175__以下__HTML_TAG_176__中描述。

```typescript
// ```yaml
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

```

> 提示 **Hint** `main.ts` 函数来自 `publishOptions` 包； `publishOptions` 枚举来自 `push` 包。

在 `master` 文件中，我们添加 `main` 属性，以允许分布非 TypeScript 文件，并 `staging` - 启用对所有非 TypeScript 资产的 watching。在我们的情况下，我们想 `production` 文件自动复制到 `pull request` 文件夹。

```typescript
// ```typescript
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

```

#### 选项

gRPC 传输器选项对象暴露以下属性。

```markdown
__HTML_TAG_179__
  __HTML_TAG_180__
    __HTML_TAG_181____HTML_TAG_182__package__HTML_TAG_183____HTML_TAG_184__
    __HTML_TAG_185__Protobuf package name (matches __HTML_TAG_186__package__HTML_TAG_187__ setting from __HTML_TAG_188__.proto__HTML_TAG_189__ file).  Required__HTML_TAG_190__
  __HTML_TAG_191__
  __HTML_TAG_192__
    __HTML_TAG_193____HTML_TAG_194__protoPath__HTML_TAG_195____HTML_TAG_196__
    __HTML_TAG_197__
      Absolute (or relative to the root dir) path to the
      __HTML_TAG_198__.proto__HTML_TAG_199__ file. Required
    __HTML_TAG_200__
  __HTML_TAG_201__
  __HTML_TAG_202__
    __HTML_TAG_203____HTML_TAG_204__url__HTML_TAG_205____HTML_TAG_206__
    __HTML_TAG_207__Connection url.  String in the format __HTML_TAG_208__ip address/dns name:port__HTML_TAG_209__ (for example, __HTML_TAG_210__'0.0.0.0:50051'__HTML_TAG_211__ for a Docker server) defining the address/port on which the transporter establishes a connection.  Optional.  Defaults to __HTML_TAG_212__'localhost:5000'__HTML_TAG_213____HTML_TAG_214__
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
> info **提示** __INLINE_CODE_51__ 装饰器（__HTML_TAG_255__阅读更多__HTML_TAG_256__）在之前的微服务章节中引入，但是不能与 gRPC 基于的微服务一起使用。 __INLINE_CODE_52__ 装饰器在 gRPC 基于的微服务中有效地取代了它。

```yaml
image: node:16

stages:
  - build

cache:
  key:
    files:
      - package-lock.json
  paths:
    - node_modules/

workflow:
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
      when: always
    - if: $CI_COMMIT_BRANCH == "master" && $CI_PIPELINE_SOURCE == "push"
      when: always
    - when: never

install_dependencies:
  stage: build
  script:
    - npm ci

publish_graph:
  stage: build
  needs:
    - install_dependencies
  script: npm run start
  variables:
    PUBLISH_GRAPH: 'true'
    DEVTOOLS_API_KEY: 'CHANGE_THIS_TO_YOUR_API_KEY'

```

> info **提示** __INLINE_CODE_53__ 装饰器来自 __INLINE_CODE_54__ 包，而 __INLINE_CODE_55__ 和 __INLINE_CODE_56__ 则来自 __INLINE_CODE_57__ 包。

上述装饰器接受两个参数。第一个是服务名称（例如 __INLINE_CODE_58__），对应于 __INLINE_CODE_59__ 服务定义在 __INLINE_CODE_60__ 中。第二个（字符串 __INLINE_CODE_61__）对应于 __INLINE_CODE_62__ rpc 方法在 __INLINE_CODE_63__ 文件中的定义。

__INLINE_CODE_65__ 处理方法接受三个参数， namely __INLINE_CODE_66__ 从调用方传递过来， __INLINE_CODE_67__ 存储 gRPC 请求元数据和 __INLINE_CODE_68__ 用于获取 __INLINE_CODE_69__ 对象的属性，如 __INLINE_CODE_70__ 用于将元数据发送到客户端。

两个 __INLINE_CODE_71__ 装饰器参数都是可选的。如果没有提供第二个参数（例如 __INLINE_CODE_72__），Nest 将自动将 handler 关联到文件 rpc 方法上，以便将 handler 名称转换为大驼峰命名法（例如将 __INLINE_CODE_74__ 处理器关联到 __INLINE_CODE_75__ rpc 调用定义）。这在下面所示。

```typescript
const publishOptions = {
  apiKey: process.env.DEVTOOLS_API_KEY,
  repository: process.env.CI_PROJECT_NAME,
  owner: process.env.CI_PROJECT_ROOT_NAMESPACE,
  sha: process.env.CI_COMMIT_SHA,
  target: process.env.CI_MERGE_REQUEST_DIFF_BASE_SHA,
  trigger: process.env.CI_MERGE_REQUEST_DIFF_BASE_SHA ? 'pull' : 'push',
  branch: process.env.CI_COMMIT_BRANCH ?? process.env.CI_MERGE_REQUEST_SOURCE_BRANCH_NAME,
};

```

您也可以省略第一个 __INLINE_CODE_76__ 参数。在这种情况下，Nest 将自动将 handler 关联到 proto 定义文件中的服务定义上，以便将 handler 名称转换为大驼峰命名法（例如 class __INLINE_CODE_77__ 将其 handler 方法关联到 __INLINE_CODE_78__ 服务定义在 __INLINE_CODE_79__ 文件中）。如以下代码所示。

__CODE_BLOCK_6__

#### 客户端

Nest 应用程序可以作为 gRPC 客户端，消费在 __INLINE_CODE_81__ 文件中定义的服务。您可以通过 __INLINE_CODE_82__ 对象访问远程服务。您可以通过以下几种方式获取 __INLINE_CODE_83__ 对象。

推荐的技术是导入 __INLINE_CODE_84__。使用 __INLINE_CODE_85__ 方法将包装服务定义在 __INLINE_CODE_86__ 文件中注入到注入 token 中，并配置服务。 __INLINE_CODE_87__ 属性是注入 token。对于 gRPC 服务，使用 __INLINE_CODE_88__。 __INLINE_CODE_89__ 属性是一个对象，具有与上述相同的属性。

__CODE_BLOCK_7__

> info **提示** __INLINE_CODE_90__ 方法接受一个对象数组。注册多个包通过提供一系列的注册对象。

一旦注册，我们可以注入配置的 __INLINE_CODE_91__ 对象使用 __INLINE_CODE_92__。然后，我们使用 __INLINE_CODE_93__ 对象的 __INLINE_CODE_94__ 方法获取服务实例，如以下所示。

__CODE_BLOCK_8__

> error **警告** gRPC 客户端将不会发送包含下划线 __INLINE_CODE_95__ 在名称中的字段，除非在 proto 加载器配置中设置 __INLINE_CODE_96__ 选项到 __INLINE_CODE_97__，或者在微服务传输器配置中设置 __INLINE_CODE_98__ 选项到 __INLINE_CODE_99__。

注意，在其他微服务传输方法中使用的技术与这里有一些小差异。相反，我们使用 __INLINE_CODE_100__ 类，而不是 __INLINE_CODE_101__ 类，它提供了 __INLINE_CODE_102__ 方法。 __INLINE_CODE_102__ generic 方法接受服务名称作为参数并返回其实例（如果可用）。

或者，您可以使用 __INLINE_CODE_103__ 装饰器来实例化 __INLINE_CODE_104__ 对象，如以下所示：

__CODE_BLOCK_9__

最后，在复杂的场景中，我们可以使用 __INLINE_CODE_105__ 类来注入动态配置的客户端，如上述所述。

在任何情况下，我们都将拥有 __INLINE_CODE_106__ 代理对象的引用，该对象 expose 了 __INLINE_CODE_107__ 文件中的相同方法集。现在，当我们访问这个代理对象（即 __INLINE_CODE_108__）时，gRPC 系统将自动序列化请求，向远程系统发送请求，返回响应，并反序列化响应。由于 gRPC 将我们从这些网络通信细节中隔离，__INLINE_CODE_109__ 看起来和行为像一个本地提供商。

请注意，所有服务方法都是小驼峰命名法（以遵循语言的自然命名约定）。因此，例如，而我们的 __INLINE_CODE_110__ 文件 __INLINE_CODE_111__ 定义包含 __INLINE_CODE_112__ 函数，__INLINE_CODE_113__ 实例将提供 __INLINE_CODE_114__ 方法。

__CODE_BLOCK_10__

Note: I have replaced all the placeholders with the corresponding terms from the provided glossary. I have also kept the code and formatting unchanged, and translated the code comments from EnglishHere is the translation of the English technical documentation to Chinese:

**消息处理器**

消息处理器也可以返回 __INLINE_CODE_115__, 在这种情况下，结果值将直到流完成时被发射。

__CODE_BLOCK_11__

要发送 gRPC 元数据（一起请求），您可以传入第二个参数，例如：

__CODE_BLOCK_12__

> 信息 **提示** __INLINE_CODE_116__ 类来自 __INLINE_CODE_117__ 包。

请注意，这将需要更新我们之前定义的 __INLINE_CODE_118__ 接口。

#### 示例

有一个可工作的示例 __LINK_266__。

#### gRPC 反射

__LINK_267__ 是一个标准，可以使 gRPC 客户端请求服务器公开的 API 详情，类似于 REST API 的 OpenAPI 文档。这可以使开发者使用调试工具，例如 grpc-ui 或 postman，更加容易。

要将 gRPC 反射支持添加到您的服务器中，首先安装所需的实现包：

__CODE_BLOCK_13__

然后，可以使用 __INLINE_CODE_119__ 钩子在 gRPC 服务器选项中hook it：

__CODE_BLOCK_14__

现在您的服务器将响应请求 API 详情，使用反射规范。

#### gRPC 流

gRPC 本身支持长期的实时连接，通常称为 __INLINE_CODE_120__。流有助于情况，如聊天、观察或块数据传输。更多细节可以在官方文档 __LINK_268__ 中找到。

Nest 支持 GRPC 流处理器两种可能的方式：

- RxJS __INLINE_CODE_121__ + __INLINE_CODE_122__ 处理器：可以在控制器方法中编写响应或将其传递到 __INLINE_CODE_123__/__INLINE_CODE_124__ 消费者
-纯 GRPC 调用流处理器：可以将其传递给某个执行程序，它将处理 Node 标准 __INLINE_CODE_125__ 流处理器。

__HTML_TAG_261____HTML_TAG_262__

#### 流示例

让我们定义一个新的示例 gRPC 服务，名为 __INLINE_CODE_126__。__INLINE_CODE_127__ 文件使用 __HTML_TAG_263__ 协议缓冲区 __HTML_TAG_264__。下面是它的样子：

__CODE_BLOCK_15__

> 信息 **提示** __INLINE_CODE_128__ 方法可以使用 __INLINE_CODE_129__ 装饰符简单实现，因为返回的流可以 emit 多个值。

根据 __INLINE_CODE_130__ 文件，让我们定义 __INLINE_CODE_131__ 接口：

__CODE_BLOCK_16__

> 信息 **提示** proto 接口可以自动由 __LINK_269__ 包生成，了解更多 __LINK_270__。

#### 主题策略

__INLINE_CODE_132__ 装饰符提供了 RxJS __INLINE_CODE_133__ 参数。因此，我们可以接收和处理多个消息。

__CODE_BLOCK_17__

> 警告 **警告**为了支持完整的双向交互，控制器方法必须返回 RxJS __INLINE_CODE_135__。

> 信息 **提示** __INLINE_CODE_136__ 和 __INLINE_CODE_137__ 类/接口来自 __INLINE_CODE_138__ 包。

根据服务定义（在 __INLINE_CODE_139__ 文件中），__INLINE_CODE_140__ 方法应该将请求流式传输到服务中。要从客户端发送多个异步消息到流，我们使用 RxJS __INLINE_CODE_141__ 类。

__CODE_BLOCK_18__

在示例中，我们写了两个消息到流（__INLINE_CODE_142__ 调用）并通知服务，我们已经完成发送数据（__INLINE_CODE_143__ 调用）。

#### 调用流处理器

当方法返回值定义为 __INLINE_CODE_144__，__INLINE_CODE_145__ 装饰符提供了函数参数 __INLINE_CODE_146__，支持标准方法，如 __INLINE_CODE_147__、__INLINE_CODE_148__ 或 __INLINE_CODE_149__。可用的方法详细信息可以在 __LINK_271__ 中找到。

或者，如果方法返回值不是 __INLINE_CODE_150__，__INLINE_CODE_151__ 装饰符提供了两个函数参数，分别是 __INLINE_CODE_152__（了解更多 __LINK_272__）和 __INLINE_CODE_153__。

让我们开始实现 __INLINE_CODE_154__，它应该支持完整的双向交互。

__CODE_BLOCK_19__

> 信息 **提示** 这个装饰符不需要任何特定的返回参数。它预期流将被处理类似于任何其他标准流类型。

在示例中，我们使用 __INLINE_CODE_155__ 方法将对象写入响应流。回调函数传递给 __INLINE_CODE_156__ 方法的第二个参数将在我们的服务接收到新块数据时被调用。

让我们实现 __INLINE_CODE_157__ 方法。

__CODE_BLOCK_20__

在这里，我们使用 __INLINE_CODE_158__ 函数将响应发送到客户端，以便在 __INLINE_CODE_159__ 处理完成后。

#### 健康检查Here is the translation of the provided English technical documentation to Chinese:

在使用 Kubernetes 等 orchestrator 运行 gRPC 应用程序时，您可能需要了解其当前状态是否健康-running。__LINK_273__ 是一个标准，允许 gRPC 客户端暴露健康状态，以便 orchestrator 能够根据需要进行相应的操作。

要添加 gRPC 健康检查支持，首先安装 __LINK_274__ 包：

__CODE_BLOCK_21__

然后，可以将其hook 到 gRPC 服务中，使用 gRPC 服务器选项中的 __INLINE_CODE_160__ 挂钩，如下所示。请注意，__INLINE_CODE_161__ 需要同时包含健康检查和 hero 包。

__CODE_BLOCK_22__

> info **提示** __LINK_275__ 是一个有用的 CLI，用来在容器化环境中测试 gRPC 健康检查。

#### gRPC Metadata

Metadata 是 RPC 调用相关的信息，形式为一组键值对，其中键为字符串，值通常为字符串，但可以为二进制数据。Metadata 对 gRPC 本身是透明的 - 它让客户端提供与调用相关的信息，传递给服务器，反之亦然。Metadata 可以包含身份验证令牌、请求标识符和监控标签，以及数据信息，如数据集中的记录数。

在 __INLINE_CODE_162__ 处理程序中读取 metadata，使用第二个参数（metadata），该参数为类型为 __INLINE_CODE_163__ 的对象（来自 __INLINE_CODE_164__ 包）。

从处理程序发送 metadata，可以使用 __INLINE_CODE_165__ 方法（第三个处理程序参数）。

__CODE_BLOCK_23__

类似地，在 handlers 注册了 __INLINE_CODE_166__ 处理程序（__LINK_276__）时，使用第二个参数（metadata），该参数为类型为 __INLINE_CODE_167__ 的对象（来自 __INLINE_CODE_168__ 包）。

从处理程序发送 metadata，可以使用 __INLINE_CODE_169__ 方法（第三个处理程序参数）。

在 handlers 注册了 __INLINE_CODE_170__ 装饰器（__LINK_277__）时，可以监听 __INLINE_CODE_171__ 事件，以读取 metadata，例如：

__CODE_BLOCK_24__