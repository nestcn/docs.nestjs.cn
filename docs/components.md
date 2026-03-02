<!-- 此文件从 content/components.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-02T04:07:43.973Z -->
<!-- 源文件: content/components.md -->

### 提供者

提供者是 Nest 的核心概念。许多基本的 Nest 类，例如服务、存储库、工厂和帮助器，可以被视为提供者。提供者的关键思想是，它可以被注入为依赖项，从而使对象之间形成各种关系。Nest 运行时系统负责“连接”这些对象。

</td><td></td>

在前一章中，我们创建了一个简单的 __INLINE_CODE_7__. 控制器应处理 HTTP 请求，并将更复杂的任务委派给 **提供者**。提供者是_plain JavaScript 类，声明为 `WebSocketAdapter` 在 NestJS 模块中。关于更多细节，请参阅“模块”章节。

> 提示 **Hint** 自 Nest 允许您以对象导向的方式设计和组织依赖项，我们强烈建议遵循 __LINK_69__。

#### 服务

让我们创建一个简单的 `IoAdapter`. 这个服务将负责数据存储和检索，并将被 `IoAdapter` 使用。由于其在应用程序逻辑中的角色，它是一个理想的候选者，以被定义为提供者。

```bash
$ npm i --save redis socket.io @socket.io/redis-adapter
```

> 提示 **Hint** 使用 CLI 创建服务，简单地执行 `transports: ['websocket']` 命令。

我们的 `RedisIoAdapter` 是一个基本类，具有一个属性和两个方法。关键添加的是 `WsAdapter` 装饰器。这装饰器将元数据附加到类中，表明 `ws` 是一个可以由 Nest __LINK_70__ 容器管理的类。

此外，这个示例使用了 `socket.io` 接口，这可能看起来像这样：

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

现在，我们已经有了一个用于检索猫的服务类，让我们在 `ws` 中使用它：

```typescript
const app = await NestFactory.create(AppModule);
const redisIoAdapter = new RedisIoAdapter(app);
await redisIoAdapter.connectToRedis();

app.useWebSocketAdapter(redisIoAdapter);
```

`@WebSocketGateway({ path: '/users' }})` 是通过类构造函数注入的。注意使用 `ws` 关键字。这短语允许我们在同一行中 both 声明和初始化 `WsAdapter` 成员，简化了过程。

#### 依赖项注入

Nest 是基于强大的设计模式“依赖项注入”构建的。我们强烈建议阅读官方 [socket.io](https://github.com/socketio/socket.io) 中关于这个概念的文章。

在 Nest 中， thanks 到 TypeScript 的能力，管理依赖项变得非常简单，因为它们是根据类型解析的。以下示例中，Nest 将解析 `@nestjs/platform-ws` 并创建一个 `wsAdapter` 的实例（或，在单例情况下，如果已请求其他地方返回已有实例）。然后，这个依赖项将被注入到控制器的构造函数中（或分配到指定的属性）：

```bash
$ npm i --save @nestjs/platform-ws
```

#### 作用域

提供者通常具有与应用程序生命周期相align 的生命周期（“作用域”）。当应用程序启动时，每个依赖项都需要被解析，这意味着每个提供者都将被实例化。同样，当应用程序关闭时，所有提供者都将被销毁。但是，也可以使提供者请求作用域，这意味着其生命周期与特定请求相关。您可以在 [here](https://socket.io/docs/v4/using-multiple-nodes/#enabling-sticky-session) 章节中了解这些技术。

</tr>__