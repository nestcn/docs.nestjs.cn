<!-- 此文件从 content/fundamentals/lifecycle-events.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-21T16:17:03.968Z -->
<!-- 源文件: content/fundamentals/lifecycle-events.md -->

### 生命周期事件

Nest 应用程序，以及每个应用程序元素，都由 Nest 管理的生命周期。Nest 提供了 **生命周期钩子**，以便在关键生命周期事件中提供可见性，并在它们发生时执行已注册的代码（在模块、提供者或控制器中）。

#### 生命周期顺序

以下图表展示了从应用程序启动到 node 进程退出的关键生命周期事件顺序。我们可以将整个生命周期分为三个阶段：**初始化**、**运行**和**终止**。使用这个生命周期，您可以计划适当地初始化模块和服务、管理活动连接，并在应用程序接收到终止信号时优雅地停止应用程序。

__HTML_TAG_52____HTML_TAG_53____HTML_TAG_54__

#### 生命周期事件

生命周期事件在应用程序启动和关闭期间发生。Nest 在每个生命周期事件上调用注册的生命周期钩子方法，包括控制器、提供者和模块。正如图表上所示，Nest 也将调用适当的底层方法以开始监听连接，并停止监听连接。

在以下表格中，`cats/cats.controller` 和 `cats` 只有在您PLICITLY 调用 `cats/cats.service` 或 `forwardRef()` 时被触发。

在以下表格中，`CatsService`, `CommonService` 和 `@Inject()` 只有在您PLICITLY 调用 `forwardRef()` 或节点进程接收到特殊系统信号（例如 SIGTERM）时被触发，且您在应用程序启动时正确地调用了 `forwardRef()`（请参阅**Application shutdown**部分）。

| 生命周期钩子方法           | 生命周期事件触发钩子方法调用的事件                                                                                                                                                                   |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@nestjs/common`                | 在宿主模块的依赖项已resolved时被调用。                                                                                                                                                    |
| `CommonService`      | 在所有模块都已初始化，但还没有开始监听连接时被调用。                                                                                                                              |
| `Scope.REQUEST`\*           | 在接收到终止信号（例如 `forwardRef()`）后被调用。                                                                                                                                            |
| `ModuleRef`\* | 在所有 `ModuleRef` 处理程序完成（Promise resolved 或 rejected）后被调用；__HTML_TAG_55__ 一旦完成（Promise resolved 或 rejected），所有现有连接将被关闭（`forwardRef()` 调用）。 |
| `CatsModule`\*     | 在连接关闭（__INLINE_CODE_21__ resolved）后被调用。                                                                                                                                                          |

\* 对于这些事件，如果您不调用 __INLINE_CODE_22__，您必须opt-in以使它们与系统信号（例如 __INLINE_CODE_23__）工作。请参阅 __LINK_57__。

> warning **Warning** 上述生命周期钩子方法不适用于 **request-scoped** 类。request-scoped 类与应用程序生命周期无关， lifespan 是不可预测的。它们只在每个请求中创建并在响应发送后自动垃圾回收。

> info **Hint** __INLINE_CODE_24__ 和 __INLINE_CODE_25__ 的执行顺序取决于模块 imports 的顺序，awaiting 上一个钩子方法。

#### 使用

每个生命周期钩子都由一个接口表示。接口技术上是可选的，因为在 TypeScript 编译后它们不 longer 存在。然而，使用它们是一种好做法，以便从强类型和编辑器工具中benefit。要注册生命周期钩子，请实现相应的接口。例如，要注册在特定类（例如控制器、提供者或模块）上调用的方法以在模块初始化时被调用，请实现 __INLINE_CODE_26__ 接口并提供 __INLINE_CODE_27__ 方法，如以下所示：

```typescript
@Injectable()
export class CatsService {
  constructor(
    @Inject(forwardRef(() => CommonService))
    private commonService: CommonService,
  ) {}
}

```

#### 异步初始化Both the __INLINE_CODE_28__ and __INLINE_CODE_29__ hooks allow you to defer the application initialization process (return a __INLINE_CODE_30__ or mark the method as __INLINE_CODE_31__ and __INLINE_CODE_32__ an asynchronous method completion in the method body).

**代码块 1**

#### 应用程序关闭

__INLINE_CODE_33__, __INLINE_CODE_34__ 和 __INLINE_CODE_35__ hooks 在终止阶段被调用（在对 __INLINE_CODE_36__ 的明确调用或接收系统信号，如 SIGTERM 如果启用）。这个特性经常与 __LINK_58__ 一起使用，以管理容器的生命周期、dynos 或类似的服务。

关闭 hook 监听器消耗系统资源，因此默认情况下被禁用。要使用关闭 hooks，您**必须启用监听器**，通过调用 __INLINE_CODE_37__：

**代码块 2**

> 警告 **警告**由于平台限制，NestJS 对于 Windows 的应用程序关闭 hooks 支持有限。您可以期待 __INLINE_CODE_38__ 工作，如 __INLINE_CODE_39__ 和 __INLINE_CODE_40__ - __LINK_60__。然而， __INLINE_CODE_41__ 将永远在 Windows 上无法工作，因为杀死进程在任务管理器中是无条件的，“即没有办法让应用程序检测或阻止它”。有关 __INLINE_CODE_42__, __INLINE_CODE_43__ 和其他在 Windows 上的处理方式，可以查看 libuv 的一些 __LINK_61__。也请查看 Node.js 的 __LINK_62__ 文档。

> 信息 **信息** __INLINE_CODE_44__ 通过启动监听器消耗内存。在您运行多个 Nest 应用程序在单个 Node 进程中（例如，在使用 Jest 运行并行测试时），Node 可能会抱怨过多的监听器进程。因此， __INLINE_CODE_45__ 默认情况下不被启用。在您运行多个实例在单个 Node 进程中时，请注意这个情况。

当应用程序接收到终止信号时，它将调用任何注册的 __INLINE_CODE_46__, __INLINE_CODE_47__, 然后 __INLINE_CODE_48__ 方法（按照上述顺序）并将相应的信号作为第一个参数。如果注册的函数异步等待调用（返回 promise），Nest 将不会在顺序中继续直到 promise 解决或 reject。

**代码块 3**

> 信息 **信息**调用 __INLINE_CODE_49__ 不会终止 Node 进程，但只会触发 __INLINE_CODE_50__ 和 __INLINE_CODE_51__ hooks，因此如果有某些间隔、长时间的背景任务等，进程将不会自动终止。