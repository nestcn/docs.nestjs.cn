<!-- 此文件从 content/fundamentals/lifecycle-events.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:10:44.919Z -->
<!-- 源文件: content/fundamentals/lifecycle-events.md -->

### 生命周期事件

Nest 应用程序，以及每个应用程序元素，都是由 Nest 管理的生命周期。Nest 提供了 **生命周期钩子**，可以让您了解关键生命周期事件，并在事件发生时执行已注册的代码。

#### 生命周期顺序

以下图表展示了应用程序生命周期的顺序，从应用程序启动到 Node 进程退出。我们可以将生命周期分为三个阶段：**初始化**、**运行**和**终止**。使用这个生命周期，您可以计划适当地初始化模块和服务，管理活动连接，并在接收到终止信号时优雅地关闭应用程序。

__HTML_TAG_52____HTML_TAG_53____HTML_TAG_54__

#### 生命周期事件

生命周期事件在应用程序启动和关闭期间发生。Nest 在每个生命周期事件上调用已注册的生命周期钩子方法，例如 **shutdown hooks**（需要先启用，详见 __LINK_56__）。如上图所示，Nest 还会在开始监听连接和停止监听连接时调用相应的底层方法。

以下表格中，`cats/cats.controller` 和 `cats` 只有在您明确地调用 `cats/cats.service` 或 `forwardRef()` 时才会被触发。

以下表格中，`CatsService`, `CommonService` 和 `@Inject()` 只有在您明确地调用 `forwardRef()` 或在进程接收到特殊系统信号（例如 SIGTERM）并且您正确地在应用程序启动时调用 `forwardRef()` 时才会被触发。

| 生命周期钩子方法            | 生命周期事件触发钩子方法调用                                                                                                                                                                   |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@nestjs/common`             | 在主模块的依赖项被解决后被调用                                                                                                                                                    |
| `CommonService`       | 在所有模块都初始化完成，但还未开始监听连接时被调用                                                                                                                              |
| `Scope.REQUEST`\*          | 在接收到终止信号（例如 `forwardRef()`）后被调用                                                                                                                                            |
| `ModuleRef`\* | 在所有 `ModuleRef` 处理程序完成（Promise 已 resolve 或 rejected）后被调用；__HTML_TAG_55__在所有现有连接关闭（`forwardRef()` 调用）后被调用 |
| `CatsModule`\*         | 在连接关闭后（__INLINE_CODE_21__ resolve）被调用                                                                                                                                                    |

\* 对于这三个事件，如果您没有明确地调用 __INLINE_CODE_22__，那么您需要启用它们以便使用系统信号，如 __INLINE_CODE_23__。请查看 __LINK_57__ 详细信息。

> warning **警告** 上述生命周期钩子列表中没有触发 **请求作用域** 类的钩子。请求作用域类与应用程序生命周期无关，他们的生命周期不可预测。它们专门用于每个请求创建和自动在响应发送后被垃圾回收。

> info **提示** __INLINE_CODE_24__ 和 __INLINE_CODE_25__ 的执行顺序由模块导入的顺序确定，等待之前的钩子。

#### 使用

每个生命周期钩子都由一个接口表示。接口技术上是可选的，因为它们在 TypeScript 编译后不存在。然而，使用它们可以获得强类型和编辑器工具的好处。要注册生命周期钩子，请实现相应的接口。例如，要注册在特定类（例如控制器、提供者或模块）上调用的方法，以便在模块初始化时被调用，实现 __INLINE_CODE_26__ 接口并提供 __INLINE_CODE_27__ 方法，如下所示：

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

**代码块1**

#### 应用程序关闭

__INLINE_CODE_33__,__INLINE_CODE_34__和__INLINE_CODE_35__ hooks 在终止阶段被调用（在显式调用__INLINE_CODE_36__或接收系统信号，如SIGTERM，如果启用）。这项功能通常与__LINK_58__一起用于管理容器的生命周期，通过__LINK_59__管理dynos或相似服务。

关闭hook监听器占用系统资源，因此默认情况下被禁用。要使用关闭hooks，您**必须启用监听器**，通过调用__INLINE_CODE_37__：

**代码块2**

> 警告 **警告**由于平台限制，NestJS对应用程序关闭hooks在Windows上的支持有限。你可以期望__INLINE_CODE_38__工作，如__INLINE_CODE_39__和__INLINE_CODE_40__到一定程度，但是__INLINE_CODE_41__在Windows上永远无法工作，因为在任务管理器中杀死一个进程是无条件的，即没有办法检测或防止它。有关__INLINE_CODE_42__,__INLINE_CODE_43__和其他在Windows上的处理方式，可以查看libuv的__LINK_61__。也可以查看Node.js的__LINK_62__文档。

> 信息 **信息** __INLINE_CODE_44__通过开始监听器占用内存。在某些情况下，您可能会在单个Node进程中运行多个Nest应用程序（例如，在使用Jest并行测试时），Node可能会抱怨过多的监听器进程。因此,__INLINE_CODE_45__默认情况下不被启用。在您在单个Node进程中运行多个实例时，请注意这个情况。

当应用程序接收到终止信号时，它将调用任何注册的__INLINE_CODE_46__,__INLINE_CODE_47__,__INLINE_CODE_48__方法（按照上述顺序）并将相应的信号作为第一个参数。如果注册的函数异步调用（返回 promise），Nest不会继续在顺序中执行直到 promise被解决或拒绝。

**代码块3**

> 信息 **信息**调用__INLINE_CODE_49__不终止Node进程，但只触发__INLINE_CODE_50__和__INLINE_CODE_51__ hooks，因此如果存在一些间隔、长时间的后台任务等，进程不会自动终止。