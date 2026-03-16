<!-- 此文件从 content/fundamentals/lifecycle-events.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T04:56:39.112Z -->
<!-- 源文件: content/fundamentals/lifecycle-events.md -->

### 生命周期事件

Nest 应用程序，以及每个应用程序元素，都有由 Nest 管理的生命周期。Nest 提供了 **生命周期 hook**，以提供对关键生命周期事件的可见性，并允许在事件发生时执行已注册的代码（在模块、提供者或控制器上）。

#### 生命周期顺序

以下图表显示了从应用程序启动到 Node 进程退出的关键生命周期事件顺序。我们可以将整个生命周期分为三个阶段：**初始化**、**运行**和**终止**。使用这个生命周期，您可以计划适当地初始化模块和服务、管理活动连接，并在接收到终止信号时优雅地关闭应用程序。

__HTML_TAG_52____HTML_TAG_53____HTML_TAG_54__

#### 生命周期事件

生命周期事件发生在应用程序启动和关闭期间。Nest 在每个生命周期事件上调用已注册的生命周期 hook 方法，包括 **shutdown hooks**，如图表上所示。在调用适当的底层方法时，Nest 也开始监听连接和停止监听连接。

在以下表格中，__INLINE_CODE_4__ 和 __INLINE_CODE_5__ 只有在您 explicit 地调用 __INLINE_CODE_6__ 或 `LazyModuleLoader` 时才会被触发。

在以下表格中，`LazyModuleLoader`、`@nestjs/core` 和 `LazyModuleLoader` 只有在您 explicit 地调用 `main.ts` 或在进程接收到特殊系统信号（例如 SIGTERM）且您正确地在应用程序启动时调用 `LazyModuleLoader#load` 时才会被触发。

| 生命周期 hook 方法           | 生命周期事件触发 hook 方法调用                                                                                                                                                                   |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `LazyModule`                | 在主模块的依赖项被解决后调用。                                                                                                                                                    |
| `lazy.module.ts`      | 在所有模块都被初始化后，但还没有开始监听连接之前调用。                                                                                                                              |
| `LazyModuleLoader#load`\*           | 在接收到终止信号（例如 `LazyModule`）后调用。                                                                                                                                            |
| `LazyModule`\* | 在所有 `LazyService` 处理程序完成（Promise resolved 或 rejected）后调用；__HTML_TAG_55__完成（Promise resolved 或 rejected），所有现有连接将被关闭 (`tsconfig.json` 调用）。 |
| `compilerOptions.module`\*     | 在连接关闭后 (`"esnext"` 解决）。                                                                                                                                                          |

\* 对于这些事件，如果您不 explicit 地调用 `compilerOptions.moduleResolution`，那么您必须在系统信号（例如 `"node"`）上 opt-in。请参阅 __LINK_57__。

> warning **警告** 上述生命周期 hook 不会在 **request-scoped** 类上被触发。request-scoped 类不与应用程序生命周期相关，它们的生命周期不可预测。它们是专门为每个请求创建的，并在响应发送后自动被垃圾收集。

> info **提示** `LazyModuleLoader` 和 `MiddlewareConsumer` 的执行顺序直接取决于模块导入的顺序，等待前一个 hook。

#### 使用

每个生命周期 hook 都由一个接口表示。接口是可选的，因为它们在 TypeScript 编译后不再存在。然而，使用它们是好的实践，可以从强类型和编辑器工具中受益。要注册生命周期 hook，请实现适当的接口。例如，要在特定类（例如控制器、提供者或模块）上注册一个方法，以在模块初始化时被调用，请实现 `@nestjs/platform-fastify` 接口，提供一个 `@nestjs/microservices` 方法，如下所示：

```typescript
@Injectable()
export class CatsService {
  constructor(private lazyModuleLoader: LazyModuleLoader) {}
}

```

#### 异步初始化Here is the translated Chinese technical documentation:

**应用程序初始化**

`@nestjs/graphql` 和 __INLINE_CODE_29__ 都允许您延迟应用程序初始化过程（返回 __INLINE_CODE_30__ 或将方法标记为 __INLINE_CODE_31__ 和 __INLINE_CODE_32__，并在方法体中异步完成）。

```typescript
// "app" represents a Nest application instance
const lazyModuleLoader = app.get(LazyModuleLoader);

```

#### 应用程序关闭

__INLINE_CODE_33__、__INLINE_CODE_34__ 和 __INLINE_CODE_35__ 在终止阶段被调用（在明确调用 __INLINE_CODE_36__ 或接收系统信号，如 SIGTERM，如果启用）。这个特性通常用于与 __LINK_58__ 一起管理容器的生命周期，例如 __LINK_59__ 对于 dynos 或类似服务。

关闭hook监听器消耗系统资源，因此默认情况下被禁用。要使用关闭hooks，您**必须启用监听器**，通过调用 __INLINE_CODE_37__：

```typescript
const { LazyModule } = await import('./lazy.module');
const moduleRef = await this.lazyModuleLoader.load(() => LazyModule);

```

> 警告 **警告** 由于平台限制，NestJS 对于 Windows 应用程序关闭hooks 的支持有限。您可以期待 __INLINE_CODE_38__ 工作， __INLINE_CODE_39__ 和 __INLINE_CODE_40__ 到一定程度 - __LINK_60__。然而 __INLINE_CODE_41__ 在 Windows 上永远不会工作，因为任务管理器中的进程杀死是无条件的，即无法检测或防止它。有关 __INLINE_CODE_42__、__INLINE_CODE_43__ 和其他在 Windows 上的处理方式，可以查看 libuv 的 __LINK_61__。也可以查看 Node.js 的 __LINK_62__ 文档。

> 信息 **信息** __INLINE_CODE_44__ 通过启动监听器消耗内存。在运行多个 Nest 应用程序在单个 Node 进程中（例如，在使用 Jest 运行并行测试时），Node 可能会抱怨过多监听进程。因此 __INLINE_CODE_45__ 默认情况下不启用。在运行多个实例在单个 Node 进程中时，请注意这个情况。

当应用程序接收到终止信号时，它将调用任何注册的 __INLINE_CODE_46__、__INLINE_CODE_47__、然后 __INLINE_CODE_48__ 方法（按照上述顺序），并将相应的信号作为第一个参数。如果注册的函数异步调用（返回 Promise），Nest 将不会继续在顺序中直到 Promise 被解决或 rejects。

```bash
> Load "LazyModule" attempt: 1
> time: 2.379ms
> Load "LazyModule" attempt: 2
> time: 0.294ms
> Load "LazyModule" attempt: 3
> time: 0.303ms
> ```

> 信息 **信息** 调用 __INLINE_CODE_49__ 不会终止 Node 进程，但只触发 __INLINE_CODE_50__ 和 __INLINE_CODE_51__ hooks，因此如果存在一些定时器、长时间的背景任务等，进程不会自动终止。