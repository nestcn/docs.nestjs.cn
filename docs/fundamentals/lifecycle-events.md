### 生命周期事件

Nest 应用程序以及其中的每个组件都拥有由 Nest 管理的生命周期。Nest 提供了**生命周期钩子** ，这些钩子能让你观测到关键的生命周期事件，并在事件发生时执行相应操作（即在模块、提供者或控制器上运行注册的代码）。

#### 生命周期时序

下图展示了从应用启动到 Node 进程退出的关键生命周期事件序列。我们可以将整个生命周期划分为三个阶段： **初始化** 、 **运行中**和**终止** 。利用这个生命周期机制，你可以规划模块和服务的适当时机初始化、管理活动连接，并在应用程序收到终止信号时优雅地关闭它。

![](/assets/lifecycle-events.png)

#### 生命周期事件

生命周期事件发生在应用程序启动和关闭过程中。Nest 会在以下每个生命周期事件中调用模块、提供者和控制器上已注册的生命周期钩子方法（需先启用**关闭钩子** ，具体说明见[下文](../fundamentals/lifecycle-events#应用程序关闭) ）。如上图所示，Nest 还会调用适当的底层方法来开始监听连接和停止监听连接。

在下表中，`onModuleInit` 和 `onApplicationBootstrap` 仅在你显式调用 `app.init()` 或 `app.listen()` 时触发。

在下表中，`onModuleDestroy`、`beforeApplicationShutdown` 和 `onApplicationShutdown` 仅在你显式调用 `app.close()`，或进程收到特殊系统信号（如 SIGTERM）且你在应用启动时正确调用了 `enableShutdownHooks` 时触发（参见下文**应用关闭**部分）。

| 生命周期钩子方法              | 触发钩子方法调用的生命周期事件                                                                                                                      |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| onModuleInit()                | 当宿主模块的依赖项已解析完成时调用。                                                                                                                |
| onApplicationBootstrap()      | 在所有模块初始化完成但尚未开始监听连接时调用。                                                                                                      |
| onModuleDestroy()\*           | 在接收到终止信号（例如 SIGTERM）后调用。                                                                                                            |
| beforeApplicationShutdown()\* | 在所有 onModuleDestroy() 处理程序完成（Promise 已解决或拒绝）后调用；一旦完成（Promise 已解决或拒绝），所有现有连接将被关闭（调用了 app.close()）。 |
| onApplicationShutdown()\*     | 在连接关闭后调用（app.close() 解析完成时）。                                                                                                        |

\* 对于这些事件，若未显式调用 `app.close()`，则需手动启用才能使其在系统信号（如 `SIGTERM`）下生效。详见下方[应用关闭](fundamentals/lifecycle-events#应用程序关闭)章节。

> warning **注意** 上述生命周期钩子不会在**请求作用域**类中触发。请求作用域类与应用程序生命周期无关，其生存周期不可预测。它们专为每个请求创建，并在响应发送后自动进行垃圾回收。

> info **说明** `onModuleInit()` 和 `onApplicationBootstrap()` 的执行顺序直接取决于模块导入顺序，会等待前一个钩子完成。

#### 使用说明

每个生命周期钩子都对应一个接口。从技术上讲这些接口是可选的，因为在 TypeScript 编译后它们不会存在。但为了获得强类型和编辑器工具支持，最佳实践仍是使用这些接口。要注册生命周期钩子，只需实现相应接口。例如，若要在特定类（如控制器、提供者或模块）上注册模块初始化时调用的方法，可通过实现 `OnModuleInit` 接口并提供 `onModuleInit()` 方法来完成，如下所示：

```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class UsersService implements OnModuleInit {
  onModuleInit() {
    console.log(`The module has been initialized.`);
  }
}
```

#### 异步初始化

`OnModuleInit` 和 `OnApplicationBootstrap` 钩子都允许您延迟应用初始化过程（返回一个 `Promise` 或将方法标记为 `async` 并在方法体内 `await` 异步方法完成）。

```typescript
async onModuleInit(): Promise<void> {
  await this.fetch();
}
```

#### 应用关闭

`onModuleDestroy()`、`beforeApplicationShutdown()` 和 `onApplicationShutdown()` 钩子会在终止阶段被调用（响应显式的 `app.close()` 调用或在选择接收 SIGTERM 等系统信号时）。该特性常与 [Kubernetes](https://kubernetes.io/) 配合管理容器生命周期，或被 [Heroku](https://www.heroku.com/) 用于 dynos 或类似服务。

关机钩子监听器会消耗系统资源，因此默认处于禁用状态。要使用关机钩子，您**必须启用监听器** ，通过调用 `enableShutdownHooks()` 方法：

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Starts listening for shutdown hooks
  app.enableShutdownHooks();

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

> warning **警告** 由于平台固有局限性，NestJS 在 Windows 系统上对应用关机钩子的支持有限。您可以预期 `SIGINT` 能正常工作，`SIGBREAK` 以及在一定程度上 `SIGHUP` 也能工作 - [了解更多](https://nodejs.org/api/process.html#process_signal_events) 。但 `SIGTERM` 在 Windows 上永远不会生效，因为通过任务管理器终止进程是无条件的，"即应用程序无法检测或阻止此操作"。以下是 libuv 提供的[相关文档](https://docs.libuv.org/en/v1.x/signal.html) ，可了解更多关于 `SIGINT`、`SIGBREAK` 等信号在 Windows 上的处理方式。另请参阅 Node.js 的[进程信号事件](https://nodejs.org/api/process.html#process_signal_events)文档。

> info **提示** `enableShutdownHooks` 会通过启动监听器消耗内存。当您在单个 Node 进程中运行多个 Nest 应用时（例如使用 Jest 运行并行测试），Node 可能会因过多的监听器进程而报错。因此，`enableShutdownHooks` 默认处于禁用状态。在单个 Node 进程中运行多个实例时请注意这一情况。

当应用接收到终止信号时，它将按照上述顺序调用所有已注册的 `onModuleDestroy()`、`beforeApplicationShutdown()` 以及 `onApplicationShutdown()` 方法，并将相应信号作为第一个参数传入。如果注册的函数需要等待异步调用（返回 promise），Nest 将在此 promise 被解析或拒绝前暂停执行后续序列。

```typescript
@Injectable()
class UsersService implements OnApplicationShutdown {
  onApplicationShutdown(signal: string) {
    console.log(signal); // e.g. "SIGINT"
  }
}
```

> info **提示** 调用 `app.close()` 不会终止 Node 进程，只会触发 `onModuleDestroy()` 和 `onApplicationShutdown()` 钩子函数，因此如果存在定时器、长时间运行的后台任务等情况，进程不会自动终止。
