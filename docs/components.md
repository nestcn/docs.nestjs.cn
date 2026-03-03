<!-- 此文件从 content/components.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-03T04:08:36.582Z -->
<!-- 源文件: content/components.md -->

### 提供者

提供者是 Nest 的核心概念。许多基本的 Nest 类，例如服务、存储库、工厂和帮助器，可以被视为提供者。提供者的主要思想是，它可以被注入作为依赖项，允许对象之间形成各种关系。Nest 运行时系统主要负责将这些对象连接起来。

</td><td></td>

在前一章中，我们创建了简单的 __INLINE_CODE_7__. 控制器应该处理 HTTP 请求，并将复杂任务委派给 **提供者**。提供者是plain JavaScript 类，声明为 `WebSocketAdapter` 在 NestJS 模块中。关于更多信息，请参见“模块”章节。

> 提示 **Hint** 由于 Nest 允许您根据对象进行设计和组织依赖项，因此我们强烈建议遵循 __LINK_69__。

#### 服务

让我们创建一个简单的 `IoAdapter`. 这个服务将负责数据存储和检索，并将用于 `IoAdapter`. 由于其在应用程序逻辑中的管理角色，因此它是一个理想的候选提供者。

```bash
$ npm i --save redis socket.io @socket.io/redis-adapter
```

> 提示 **Hint** 使用 CLI 创建服务，只需执行 `transports: ['websocket']` 命令。

我们的 `RedisIoAdapter` 是一个基本类，具有一个属性和两个方法。关键的添加是 `WsAdapter` 装饰器。这装饰器将元数据附加到类上，表明 `ws` 是可以由 Nest __LINK_70__ 容器管理的类。

此外，这个示例还使用了 `socket.io` 接口，这可能如下所示：

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

现在，我们已经有了一个用于获取猫的服务，让我们将其用于 `ws`：

```typescript
const app = await NestFactory.create(AppModule);
const redisIoAdapter = new RedisIoAdapter(app);
await redisIoAdapter.connectToRedis();

app.useWebSocketAdapter(redisIoAdapter);
```

`@WebSocketGateway({ path: '/users' }})` 是通过类构造函数注入的。注意使用 `ws` 关键字。这短语允许我们同时声明和初始化 `WsAdapter` 成员，简化了过程。

#### 依赖项注入

Nest 是基于强大设计模式—依赖项注入的。我们强烈建议阅读官方 [socket.io](https://github.com/socketio/socket.io) 的一篇关于这个概念的文章。

在 Nest 中， thanks to TypeScript 的能力，管理依赖项变得简单，因为它们是根据类型解决的。在以下示例中，Nest 将解决 `@nestjs/platform-ws`，创建并返回 `wsAdapter` 的实例（或，在单例情况下，返回已经请求过的实例）。然后，这个依赖项将被注入到控制器的构造函数中（或分配到指定的属性）：

```bash
$ npm i --save @nestjs/platform-ws
```

#### 作用域

提供者通常具有与应用程序生命周期相对应的生命周期（“作用域”）。当应用程序启动时，每个依赖项都需要被解决，这意味着每个提供者都将被实例化。类似地，当应用程序关闭时，每个提供者都将被销毁。然而，也可以使提供者请求作用域，这意味着其生命周期与特定请求相关。您可以在 [here](https://socket.io/docs/v4/using-multiple-nodes/#enabling-sticky-session) 章节中了解更多关于这些技术。

</tr><tr>

#### 自定义提供者

Nest 带有一个内置的