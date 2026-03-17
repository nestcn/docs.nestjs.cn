<!-- 此文件从 content/security/authentication.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:19:36.975Z -->
<!-- 源文件: content/security/authentication.md -->

### 认证

认证是大多数应用程序中的**必备**部分。存在多种不同的认证策略和方法来处理认证。项目的具体需求将决定采取的认证方法。这章将介绍一些可适用于各种需求的认证方法。

让我们 flesh out 我们的需求。对于这个用例，客户端将首先使用用户名和密码进行认证。一旦认证，服务器将颁发一个 JWT，客户端可以将其作为 __LINK_91__ 在 Authorization 头中发送，以证明认证。此外，我们还将创建一个受保护的路由，只有包含有效 JWT 的请求才能访问。

我们将从第一个需求开始：认证用户。然后，我们将扩展该方法，颁发 JWT。最后，我们将创建一个受保护的路由，检查请求中的有效 JWT。

#### 创建认证模块

我们将从生成一个 `WsAdapter` 中的 `@nestjs/platform-ws` 和 `wsAdapter` 开始。在其中，我们将使用 `{{ '{' }} event: string, data: any {{ '}' }}` 实现认证逻辑，并将 `setMessageParser` 暴露认证端点。

```bash
$ npm i --save redis socket.io @socket.io/redis-adapter

```

在实现 `@nestjs/platform-ws` 时，我们将发现将用户操作封装在 `WsAdapter` 中非常有用，因此让我们现在生成该模块和服务：

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

将 default 内容替换为以下内容。对于我们的示例应用程序， `WsAdapter` 只是维护了一个内存中硬编码的用户列表，并有一个 find 方法以根据用户名检索用户。在实际应用中，这是 where 您将构建用户模型和 persistence 层，使用您的库（例如 TypeORM、Sequelize、Mongoose 等）。

```typescript
const app = await NestFactory.create(AppModule);
const redisIoAdapter = new RedisIoAdapter(app);
await redisIoAdapter.connectToRedis();

app.useWebSocketAdapter(redisIoAdapter);

```

在 `useWebSocketAdapter()` 中，唯一需要的更改是将 `WsAdapter` 添加到 __INLINE_CODE_29__ 装饰器的 exports 数组中，以便在外部模块中可见（我们将很快在 __INLINE_CODE_30__ 中使用它）。

```bash
$ npm i --save @nestjs/platform-ws

```

#### 实现 "Sign in" 端点

我们的 __INLINE_CODE_31__ 负责检索用户并验证密码。我们创建了一个 __INLINE_CODE_32__ 方法来实现该目的。在以下代码中，我们使用 ES6 spread 操作符将用户对象中的密码属性去除，以便返回用户对象。这是在返回用户对象时的一种常见实践，因为您不想Expose敏感字段，如密码或其他安全密钥。

```typescript
const app = await NestFactory.create(AppModule);
app.useWebSocketAdapter(new WsAdapter(app));

```

> 警告 **警告** 在实际应用中，您绝不应该将密码存储在明文中。您应该使用一个库，如 __LINK_92__，使用 salted one-way 哈希算法。这样，您将只存储哈希密码，然后将存储的密码与 incoming 密码的哈希版本进行比较，从而从不存储或公开用户密码。为了简单起见，我们违反了绝对命令并使用明文密码。 **不要在您的实际应用中这样做！**

现在，我们将更新 __INLINE_CODE_33__，以便导入 __INLINE_CODE_34__。

```typescript
const wsAdapter = new WsAdapter(app, {
  // To handle messages in the [event, data] format
  messageParser: (data) => {
    const [event, payload] = JSON.parse(data.toString());
    return { event, data: payload };
  },
});

```

现在，让我们打开 __INLINE_CODE_35__，并添加一个 __INLINE_CODE_36__ 方法到其中。这将是客户端认证用户时调用的方法。它将接收用户名和密码在请求体中，并将返回一个 JWT 令牌，如果用户认证成功。

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

> 提示 **提示** 理想情况下，我们应该使用 DTO 类来定义请求体的形状。见 __LINK_93__ 章节了解更多信息。

__HTML_TAG_89____HTML_TAG_90__

#### JWT 令牌

我们已经准备好了 JWT 部分的认证系统。让我们回顾和完善我们的需求：

- 允许用户使用用户名/密码进行认证，并返回一个 JWT，以在后续的保护 API 端点调用中使用。我们已经很好地满足了这个需求。为了完成它，我们需要编写颁发 JWT 的代码。
- 创建 API 路由，以便根据 JWT 的存在作为承载令牌来保护路由

我们需要安装一个额外的包来支持我们的 JWT 要求：

```typescript
const app = await NestFactory.create(AppModule);
app.useWebSocketAdapter(new WsAdapter(app));

```

> 提示 **提示** __INLINE_CODE_38__ 包（见更多 __LINK_94__）是帮助 JWT 处理的实用包。这包括生成和验证 JWT 令牌。

为了保持我们的服务模块化，我们将在 __INLINE_CODE_39__ 中处理 JWT 生成。打开 __INLINE_CODE_40__ 文件，在 __INLINE_CODE_41__ 文件夹中，注入 __INLINE_CODE_42__，并更新 __INLINE_CODE_43__ 方法以生成一个 JWT 令牌，如下所示：

__CODE_BLOCK_8__Here is the translation of the provided English technical documentation to Chinese:

使用 __INLINE_CODE_44__ 库，我们可以使用 __INLINE_CODE_45__ 函数生成 JWT，从 __INLINE_CODE_46__ 对象的子集属性中获取数据，然后将其作为简单对象返回，具有单个 __INLINE_CODE_47__ 属性。注意，我们选择了 __INLINE_CODE_48__ 属性名来存储 __INLINE_CODE_49__ 值，以保持与 JWT 标准一致。

现在，我们需要更新 __INLINE_CODE_50__，以便导入新依赖项并配置 __INLINE_CODE_51__。

首先，在 __INLINE_CODE_53__ 文件夹中创建 __INLINE_CODE_52__，并添加以下代码：

__CODE_BLOCK_9__

我们将使用这个来共享我们的密钥，以便在 JWT 签名和验证步骤中使用。

> 警告 **Warning** **请勿公开此密钥**。我们在这里公开它，以便清楚地说明代码的作用，但在生产环境中 **你必须保护这个密钥**，使用适当的措施，如秘密存储库、环境变量或配置服务。

现在，打开 __INLINE_CODE_55__ 文件夹中的 __INLINE_CODE_54__，并更新它，以使其看起来像这样：

__CODE_BLOCK_10__

> 提示 **Hint** 我们将注册 __INLINE_CODE_56__ 作为全局对象，以便更方便地使用。这样，我们不需要在应用程序中导入 __INLINE_CODE_57__。

我们使用 __INLINE_CODE_59__ 配置 __INLINE_CODE_58__，并传入配置对象。请查看 __LINK_95__以了解 Nest 中 __INLINE_CODE_60__ 的更多信息，并查看 __LINK_96__以了解可用的配置选项。

现在，让我们使用 cURL Again 测试我们的路由。你可以使用 __INLINE_CODE_62__ 中硬编码的 __INLINE_CODE_61__ 对象来测试。

__CODE_BLOCK_11__

#### 实现身份验证守卫

现在，我们可以解决最后一个要求：保护端点，确保请求中存在有效的 JWT。我们将创建一个 __INLINE_CODE_63__，以便保护我们的路由。

__CODE_BLOCK_12__

现在，我们可以实现我们的受保护路由，并注册 __INLINE_CODE_64__以保护它。

打开 __INLINE_CODE_65__ 文件，并更新它，如下所示：

__CODE_BLOCK_13__

我们正在将 __INLINE_CODE_66__ 应用到 __INLINE_CODE_67__ 路由上，以便保护它。

确保应用程序正在运行，然后使用 __INLINE_CODE_68__ 测试路由。

__CODE_BLOCK_14__

注意，在 __INLINE_CODE_69__ 中，我们配置了 JWT 的过期时间，这太短了过期时间和刷新的细节超出了本文的范围。但是，我们选择了这个，以便展示 JWT 的一个重要特性。如果你在身份验证后 60 秒内尝试发送 __INLINE_CODE_71__ 请求，你将收到 __INLINE_CODE_72__ 响应。这是因为 __INLINE_CODE_73__ 自动检查 JWT 的过期时间，从而省去了在应用程序中进行检查的麻烦。

我们现在已经完成了 JWT 身份验证的实现。使用 JavaScript 客户端（如 Angular/React/Vue），和其他 JavaScript 应用程序，可以安全地与我们的 API 服务器通信。

#### 全局启用身份验证

如果你想将大多数端点默认保护，可以将身份验证守卫注册为 __LINK_97__，而不是在每个控制器上使用 __INLINE_CODE_74__ 装饰器。你可以在 __INLINE_CODE_76__ 中注册身份验证守卫，以便在需要时使用。

首先，注册身份验证守卫，使用以下构造函数（在任何模块中，例如在 __INLINE_CODE_76__ 中）：

__CODE_BLOCK_15__

现在，我们必须提供一个机制来声明路由为公共路由。我们可以使用 __INLINE_CODE_78__ 装饰器工厂函数创建一个自定义装饰器。

__CODE_BLOCK_16__

在上面的文件中，我们导出了两个常量。一个是我们的元数据键 __INLINE_CODE_79__，另一个是我们的新装饰器 __INLINE_CODE_80__（你可以使用 __INLINE_CODE_81__ 或 __INLINE_CODE_82__ 等名称）。

现在，我们已经有了自定义装饰器，可以使用它来装饰任何方法，如下所示：

__CODE_BLOCK_17__

最后，我们需要 __INLINE_CODE_84__ 返回 __INLINE_CODE_85__，当遇到 __INLINE_CODE_86__ 元数据时。为了实现这个，我们将使用 __INLINE_CODE_87__ 类（了解更多信息 __LINK_98__）。

__CODE_BLOCK_18__

#### PassPort 集成

__LINK_99__ 是 Node.js 中最流行的身份验证库，广泛用于生产应用程序。使用 __INLINE_CODE_88__ 模块可以轻松地将 Passport 集成到 Nest 应用程序中。

要了解如何将 Passport 集成到 NestJS 中，请查看 __LINK_100__。

#### 示例

你可以在本章中找到完整的代码 __LINK_101__。