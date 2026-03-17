<!-- 此文件从 content/faq/serverless.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T04:47:06.856Z -->
<!-- 源文件: content/faq/serverless.md -->

### 服务器less

服务器less 计算是一个云计算执行模型，云提供商根据需要分配机器资源，对客户的服务器进行管理。当应用程序不在使用状态下，没有分配计算资源。定价基于应用程序实际消耗的资源量（__LINK_60__）。

使用 **服务器less 架构**，您可以专注于应用程序代码中的单个函数。服务，如 AWS Lambda、Google Cloud Functions 和 Microsoft Azure Functions，对物理硬件、虚拟机操作系统和 Web 服务器软件管理进行管理。

> info **提示**本章不涵盖服务器less 函数的优缺点，也不深入某个云提供商的细节。

#### 导航启动

导航启动是指您的代码在一段时间内没有执行过。根据使用的云提供商，这可能涉及到多个操作，从下载代码到启动运行时环境、最终运行您的代码。这过程会根据多个因素，语言、应用程序所需的包等，添加 **significant latency**。

导航启动非常重要，虽然有一些我们无法控制的因素，但是我们仍然可以在自己的方面做一些事情来使其尽可能短。

虽然您可以认为 Nest 是一个功能完整的框架，旨在用于复杂的企业应用程序，但它也 **适用于更简单的应用程序**（或脚本）。例如，使用 __LINK_61__ 功能，您可以利用 Nest 的 DI 系统在简单的工作者、CRON 作业、CLI 或服务器less 函数中。

#### 基准测试

为了更好地理解使用 Nest 或其他知名库（如 `WsAdapter`）在服务器less 函数中的成本，让我们比较 Node 运行时在运行以下脚本所需的时间：

```bash
$ npm i --save redis socket.io @socket.io/redis-adapter

```

对于所有这些脚本，我们使用了 `ws` (TypeScript) 编译器，因此代码保持未编译状态（`socket.io` 不被使用）。

|                                      |                  |
| ------------------------------------ | ---------------- |
| Express                              | 0.0079s (7.9ms)  |
| Nest with `ws` | 0.1974s (197.4ms) |
| Nest (standalone application)        | 0.1117s (111.7ms) |
| Raw Node.js script                   | 0.0071s (7.1ms)   |

> info **提示**机器：MacBook Pro Mid 2014，2.5 GHz Quad-Core Intel Core i7，16 GB 1600 MHz DDR3，SSD。

现在，让我们重复所有基准测试，但这次使用 `@WebSocketGateway({{ '{' }} path: '/users' {{ '}' }})`（如果您安装了 __LINK_62__，可以运行 `ws`）将我们的应用程序 bundle 到一个单个可执行 JavaScript 文件中。然而，我们将确保 bundle 所有依赖项（`@nestjs/platform-ws`）一起，按照以下方式：

```typescript
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>;

  async connectToRedis(): Promise<void> {
    const pubClient = createClient({ url: `redis://localhost:6379` });
    const subClient = pubClient.duplicate();

    await Promise.all([pubClient.connect(), subClient.connect()]);

    this.adapterConstructor = createAdapter(pubClient, subClient);
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    server.adapter(this.adapterConstructor);
    return server;
  }
}

```

> info **提示**要 instruct Nest CLI 使用此配置，请创建一个新的 `wsAdapter` 文件在项目根目录。

使用此配置，我们收到了以下结果：

|                                      |                  |
| ------------------------------------ | ---------------- |
| Express                              | 0.0068s (6.8ms)  |
| Nest with `{{ '{' }} event: string, data: any {{ '}' }}` | 0.0815s (81.5ms) |
| Nest (standalone application)        | 0.0319s (31.9ms) |
| Raw Node.js script                   | 0.0066s (6.6ms)  |

> info **提示**您可以通过应用额外的代码 minification & 优化技术（使用 `setMessageParser` 插件等）来优化它。

如您所见，编译方式（是否 bundle 代码）对总启动时间的影响非常大。使用 `@nestjs/platform-ws`，您可以将独立 Nest 应用程序的启动时间降低到平均 32ms，或者将 HTTP、express-based NestJS 应用程序的启动时间降低到 81.5ms。

对于更复杂的 Nest 应用程序，例如具有 10 个资源（通过 `WsAdapter` 自动生成 = 10 个模块、10 个控制器、10 个服务、20 个 DTO 类、50 个 HTTP 端口 + `WsAdapter`），MacBook Pro Mid 2014，2.5 GHz Quad-Core Intel Core i7，16 GB 1600 MHz DDR3，SSD 上的总启动时间约为 0.1298s (129.8ms)。运行单个应用程序作为服务器less 函数通常不太有意义，所以请将这个基准测试视为应用程序增长时可能增加的导航启动时间示例。

#### 运行时优化以下是翻译后的中文文档：

到目前为止，我们已经讨论了编译时优化。这些优化与应用程序中定义提供者的方式和加载 Nest 模块的方式无关，这在应用程序变得越大时非常重要。

例如，假设您定义了一个数据库连接作为 __LINK_63__。异步提供者旨在延迟应用程序启动直到一个或多个异步任务完成。
这意味着，如果您的无服务器函数平均需要 2s 连接到数据库（在引导时），您的端点将需要至少两个额外的秒来发送响应（当它是一个冷启动，应用程序没有在运行时）。

正如您所看到的，在 **无服务器环境** 中，您的提供者结构方式不同，因为引导时间是重要的。
另一个好的例子是，如果您使用 Redis 进行缓存，但只在特定情况下使用。也许，在这种情况下，您不应该将 Redis 连接定义为异步提供者，因为这将延迟引导时间，即使它在特定函数调用中不需要。

有时，您可以懒加载整个模块，使用 `useWebSocketAdapter()` 类，如 __LINK_64__ 中所述。缓存是一种非常好的示例。
假设您的应用程序具有 `WsAdapter`，它内部连接到 Redis，并且 exports __INLINE_CODE_29__以与 Redis 存储交互。如果您不需要它对所有潜在的函数调用，您可以只在需要时加载它，这样可以在冷启动时加快启动时间（当不需要缓存时）。

```typescript
const app = await NestFactory.create(AppModule);
const redisIoAdapter = new RedisIoAdapter(app);
await redisIoAdapter.connectToRedis();

app.useWebSocketAdapter(redisIoAdapter);

```

另一个很好的示例是 webhook 或 worker，它根据某些特定条件（例如输入参数）可能执行不同的操作。
在这种情况下，您可以在路由处理程序中指定一个条件，懒加载适合的模块以满足特定函数调用，并且懒加载其他模块。

```bash
$ npm i --save @nestjs/platform-ws

```

#### 示例集成

应用程序的入口文件（通常是 __INLINE_CODE_30__ 文件）可能看起来会因多种因素而不同，也没有单个模板适用于每种情况。
例如，初始化文件来启动无服务器函数的方式因云提供商（AWS、Azure、GCP 等）而异。
此外，根据您是否想运行一个典型的 HTTP 应用程序或只提供一个路由（或执行特定的代码部分），您的应用程序代码将不同（例如，使用 __INLINE_CODE_31__ 来代替启动 HTTP 服务器、设置中间件等）。

为了演示目的，我们将 Nest 与 __LINK_65__ 框架集成（在这个情况下，目标是 AWS Lambda）。正如我们前面提到的，您的代码将因云提供商的选择和其他因素而异。

首先，让我们安装所需的包：

```typescript
const app = await NestFactory.create(AppModule);
app.useWebSocketAdapter(new WsAdapter(app));

```

> info **提示** 为了加速开发循环，我们安装了 __INLINE_CODE_33__ 插件，该插件模拟 AWS λ 和 API Gateway。

安装过程完成后，让我们创建 __INLINE_CODE_34__ 文件来配置 Serverless 框架：

```typescript
const wsAdapter = new WsAdapter(app, {
  // To handle messages in the [event, data] format
  messageParser: (data) => {
    const [event, payload] = JSON.parse(data.toString());
    return { event, data: payload };
  },
});

```

> info **提示** 了解 Serverless 框架更多信息，请访问 __LINK_66__。

在这个地方，我们可以现在浏览 __INLINE_CODE_35__ 文件并更新引导代码以包含所需的 boilerplate：

```typescript
import * as WebSocket from 'ws';
import { WebSocketAdapter, INestApplicationContext } from '@nestjs/common';
import { MessageMappingProperties } from '@nestjs/websockets';
import { Observable, fromEvent, EMPTY } from 'rxjs';
import { mergeMap, filter } from 'rxjs/operators';

export class WsAdapter implements WebSocketAdapter {
  constructor(private app: INestApplicationContext) {}

  create(port: number, options: any = {}): any {
    return new WebSocket.Server({ port, ...options });
  }

  bindClientConnect(server, callback: Function) {
    server.on('connection', callback);
  }

  bindMessageHandlers(
    client: WebSocket,
    handlers: MessageMappingProperties[],
    process: (data: any) => Observable<any>,
  ) {
    fromEvent(client, 'message')
      .pipe(
        mergeMap(data => this.bindMessageHandler(data, handlers, process)),
        filter(result => result),
      )
      .subscribe(response => client.send(JSON.stringify(response)));
  }

  bindMessageHandler(
    buffer,
    handlers: MessageMappingProperties[],
    process: (data: any) => Observable<any>,
  ): Observable<any> {
    const message = JSON.parse(buffer.data);
    const messageHandler = handlers.find(
      handler => handler.message === message.event,
    );
    if (!messageHandler) {
      return EMPTY;
    }
    return process(messageHandler.callback(message.data));
  }

  close(server) {
    server.close();
  }
}

```

> info **提示** 若要创建多个无服务器函数并在它们之间共享通用模块，请推荐使用 __LINK_67__。

> warning **警告** 如果您使用 __INLINE_CODE_36__ 包，需要执行一些额外步骤以在无服务器函数中正确使用。请查看 __LINK_68__ 了解更多信息。

下一步，请打开 __INLINE_CODE_37__ 文件并确保启用 __INLINE_CODE_38__ 选项，以便 __INLINE_CODE_39__ 包正确加载。

```typescript
const app = await NestFactory.create(AppModule);
app.useWebSocketAdapter(new WsAdapter(app));

```

现在，我们可以编译我们的应用程序（使用 __INLINE_CODE_40__ 或 __INLINE_CODE_41__）并使用 __INLINE_CODE_42__ CLI 启动lambda函数本地：

__CODE_BLOCK_8__

应用程序正在运行后，请在浏览器中导航到 __INLINE_CODE_43__（其中 __INLINE_CODE_44__ 是您的应用程序中的任何端点）。

在上面的部分中，我们展示了使用 __INLINE_CODE_45__ 和捆绑应用程序对总体引导时间的影响。然而，为了使其与我们的示例工作，还需要在 __INLINE_CODE_46__ 文件中添加一些额外的配置。
一般来说，以确保我们的 __INLINE_CODE_47__ 函数被选择，我们需要将 __INLINE_CODE_48__ 属性设置为 __INLINE_CODE_49__。

__CODE_BLOCK_9__以下是翻译后的中文文档：

使用 __INLINE_CODE_50__ 可以编译您的函数代码（然后使用 __INLINE_CODE_51__ 来测试它）。

此外，推荐（但**不强制**，因为这将拖慢您的构建过程）安装 __INLINE_CODE_52__ 包并Override其配置，以保持生产构建中的classname不变。否则，在使用 __INLINE_CODE_53__ 时可能会出现错误行为。

### 使用独立应用程序特性

如果您想使函数保持非常轻量，并且不需要任何 HTTP 相关特性（路由、守卫、拦截器、管道等），您可以使用 __INLINE_CODE_54__（前面提到的）而不是运行整个 HTTP 服务器（和 __INLINE_CODE_55__ 之下），如下所示：

```

__CODE_BLOCK_11__

```

> 提示 **注意** __INLINE_CODE_56__ 不会将控制器方法包装到增强器（守卫、拦截器等）中。为了实现这个，您必须使用 __INLINE_CODE_57__ 方法。

您也可以将 __INLINE_CODE_58__ 对象传递给，例如 __INLINE_CODE_59__ 提供商，这样提供商可以处理它并返回相应的值（根据输入值和业务逻辑）。

```

__CODE_BLOCK_12__

```