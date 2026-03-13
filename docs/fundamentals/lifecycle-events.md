<!-- 此文件从 content/fundamentals/lifecycle-events.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:34:36.316Z -->
<!-- 源文件: content/fundamentals/lifecycle-events.md -->

### 生命周期事件

Nest 应用程序，包括每个应用程序元素，都被 Nest 管理的生命周期。Nest 提供了 **生命周期钩子**，让您可以在关键生命周期事件中获取可见性（在模块、提供者或控制器中注册代码）并执行该代码。

#### 生命周期序列

以下图表显示了应用程序生命周期的关键事件序列，从应用程序启动到 Node 进程退出。我们可以将整个生命周期分为三个阶段：**初始化**、**运行**和**终止**。使用这个生命周期，您可以计划在模块和服务中初始化适当的内容、管理活动连接和在应用程序接收终止信号时优雅地关闭应用程序。

__HTML_TAG_52____HTML_TAG_53____HTML_TAG_54__

#### 生命周期事件

生命周期事件发生在应用程序启动和关闭期间。Nest 在每个生命周期事件上调用注册的生命周期钩子方法，包括模块、提供者和控制器。在上图中，Nest 也会调用相应的底层方法，以便开始监听连接和停止监听连接。

在以下表格中，`cats/cats.controller` 和 `cats` 只有在您明确调用 `cats/cats.service` 或 `forwardRef()` 时才被触发。

在以下表格中，`CatsService`、`CommonService` 和 `@Inject()` 只有在您明确调用 `forwardRef()` 或在进程接收特殊系统信号（例如 SIGTERM）时被触发，并且您正确地在应用程序启动时调用 `forwardRef()`（请参阅下面**应用程序关闭**部分）。

| 生命周期钩子方法           | 生命周期事件触发钩子方法调用                                                                                                                                                                   |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@nestjs/common`                | 在宿主模块的依赖项被解决后被调用。                                                                                                                                                    |
| `CommonService`      | 在所有模块被初始化后，但在监听连接前被调用。                                                                                                                              |
| `Scope.REQUEST`\*           | 在接收终止信号（例如 `forwardRef()`）后被调用。                                                                                                                                            |
| `ModuleRef`\* | 在所有 `ModuleRef`  handler 完成（Promise 解决或拒绝）后被调用（Promise 解决或拒绝），所有现有连接将被关闭（`forwardRef()` 调用）；__HTML_TAG_55__once complete (Promise resolved or rejected) |
| `CatsModule`\*     | 在连接关闭（__INLINE_CODE_21__ 解决）后被调用。                                                                                                                                                          |

\* 对于这些事件，如果您不调用 __INLINE_CODE_22__，您必须选择使它们与系统信号（例如 __INLINE_CODE_23__）一起工作。请参阅 __LINK_57__。

> 警告 **Warning** 上述生命周期钩子列表中没有被触发的 **request-scoped** 类。request-scoped 类与应用程序生命周期无关，它们的生命周期不可预测。它们仅在每个请求创建时被创建，并在响应发送后自动被垃圾回收。

> 提示 **Hint** __INLINE_CODE_24__ 和 __INLINE_CODE_25__ 的执行顺序取决于模块导入顺序，等待上一个钩子。

#### 使用

每个生命周期钩子都由一个接口表示。接口技术上是可选的，因为它们在 TypeScript 编译后不再存在。然而，使用它们可以Benefit from strong typing and editor tooling。要注册生命周期钩子，请实现相应的接口。例如，要注册在特定类（例如控制器、提供者或模块）上初始化方法的方法实现 __INLINE_CODE_26__ 接口并提供 __INLINE_CODE_27__ 方法，如下所示：

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

__INLINE_CODE_33__, __INLINE_CODE_34__ 和 __INLINE_CODE_35__ 钩子在终止阶段被调用（在显式调用 __INLINE_CODE_36__ 或接收系统信号，如 SIGTERM 时，如果启用）。这个特性经常与 __LINK_58__ 一起使用，以管理容器的生命周期，或者使用 __LINK_59__ 对 dynos 或类似的服务进行管理。

关闭钩子监听器会消耗系统资源，因此默认情况下被禁用。要使用关闭钩子，您**必须启用监听器**，调用 __INLINE_CODE_37__：

**代码块 2**

> 警告 **警告**由于平台限制，NestJS 对应用程序关闭钩子在 Windows 平台上的支持有限。您可以预期 __INLINE_CODE_38__ 将工作，而 __INLINE_CODE_39__ 和 __INLINE_CODE_40__ 到一定程度也将工作—— __LINK_60__。然而 __INLINE_CODE_41__ 在 Windows 上将永远无法工作，因为任务管理器中的进程杀死是无条件的，即没有办法让应用程序检测或预防它。有关 __INLINE_CODE_42__, __INLINE_CODE_43__ 和其他在 Windows 上的处理方式，可以查看 libuv 的一些 __LINK_61__。另外，也可以查看 Node.js 的 __LINK_62__ 文档。

> 信息 **信息** __INLINE_CODE_44__ 通过启动监听器消耗内存。在某些情况下，您可能会在单个 Node 进程中运行多个 Nest 应用程序（例如，在使用 Jest 运行并行测试时），Node 可能会抱怨过多的监听器进程。因此 __INLINE_CODE_45__ 默认情况下不被启用。在运行多个实例在单个 Node 进程时，请注意这个情况。

当应用程序接收到终止信号时，它将调用任何注册的 __INLINE_CODE_46__, __INLINE_CODE_47__,然后 __INLINE_CODE_48__ 方法（按照上述顺序），并将相应的信号作为第一个参数。如果注册的函数异步 awaiting (返回 Promise)，Nest 将不会继续执行顺序，直到 Promise resolved 或 rejected。

**代码块 3**

> 信息 **信息**调用 __INLINE_CODE_49__ 不会终止 Node 进程，但只会触发 __INLINE_CODE_50__ 和 __INLINE_CODE_51__ 钩子，因此如果有某些时间间隔、长时间的背景任务等，进程将不会自动终止。