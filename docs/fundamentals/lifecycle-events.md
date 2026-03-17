<!-- 此文件从 content/fundamentals/lifecycle-events.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T04:38:03.103Z -->
<!-- 源文件: content/fundamentals/lifecycle-events.md -->

### 生命周期事件

Nest 应用程序，以及每个应用程序元素，都是由 Nest 管理的生命周期。Nest 提供了 **生命周期钩子**，以便在关键生命周期事件中获取可见性，并在事件发生时执行注册的代码（在模块、提供者或控制器中）。

#### 生命周期顺序

以下图表展示了应用程序生命周期的关键事件顺序，从应用程序启动到 Node 进程退出。我们可以将生命周期分为三个阶段：**初始化**、**运行**和**终止**。使用这个生命周期，您可以计划适当地初始化模块和服务，管理活动连接，并在接收到终止信号时优雅地关闭应用程序。

__HTML_TAG_52____HTML_TAG_53____HTML_TAG_54__

#### 生命周期事件

生命周期事件在应用程序启动和关闭期间发生。Nest 在每个生命周期事件上对模块、提供者和控制器调用注册的生命周期钩子方法（需要在 shutdown 钩子上启用，详见 __LINK_56__）。如上图所示，Nest 也会调用适当的底层方法以开始监听连接，并停止监听连接。

在以下表格中，`cats/cats.controller` 和 `cats` 只有在您显式调用 `cats/cats.service` 或 `forwardRef()` 时才会被触发。

在以下表格中，`CatsService`、`CommonService` 和 `@Inject()` 只有在您显式调用 `forwardRef()` 或 Node 进程接收特殊系统信号（例如 SIGTERM）时才会被触发。

| 生命周期钩子方法           | 生命周期事件触发钩子方法调用的事件                                                                                                                                                                   |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@nestjs/common`                | 在宿主模块的依赖项已经被解决后调用。                                                                                                                                                    |
| `CommonService`      | 在所有模块都被初始化后，但还没有开始监听连接前调用。                                                                                                                              |
| `Scope.REQUEST`\*           | 在接收到终止信号（例如 `forwardRef()`）后调用。                                                                                                                                            |
| `ModuleRef`\* | 在所有 `ModuleRef` 处理完成（Promise 解决或 rejection）后调用（Promises 解决或 rejection）；在完成（Promises 解决或 rejection）后，所有现有连接将被关闭（`forwardRef()` 调用）。 |
| `CatsModule`\*     | 在连接关闭（__INLINE_CODE_21__ 解决）后调用。                                                                                                                                                          |

\* 对于这些事件，如果您不显式调用 __INLINE_CODE_22__，则必须 opt-in以使它们与系统信号（例如 __INLINE_CODE_23__）一起工作。详见 __LINK_57__。

> warning **注意** 上述生命周期钩子方法不适用于 **请求作用域** 类。请求作用域类与应用程序生命周期无关， lifespan 是不可预测的。它们专门用于每个请求创建，并在响应发送后自动垃圾回收。

> info **提示** __INLINE_CODE_24__ 和 __INLINE_CODE_25__ 的执行顺序直接依赖于模块导入的顺序，等待上一个钩子方法。

#### 使用

每个生命周期钩子都由一个接口表示。接口技术上是可选的，因为它们在 TypeScript 编译后不存在。然而，使用它们是良好的实践，以便从强类型和编辑器工具中受益。要注册生命周期钩子，实现适当的接口。例如，要注册在特定类（例如控制器、提供者或模块）上调用方法以在模块初始化时执行，实现 __INLINE_CODE_26__ 接口并提供 __INLINE_CODE_27__ 方法，如下所示：

```typescript
@Injectable()
export class CatsService {
  constructor(
    @Inject(forwardRef(() => CommonService))
    private commonService: CommonService,
  ) {}
}

```

#### 异步初始化

Please note that I have followed the provided glossary and terminology, and kept the code examples, variable names, function names, and Markdown formatting unchanged. I have also translated code comments from English to Chinese.Both the __INLINE_CODE_28__ and __INLINE_CODE_29__ hooks allow you to defer the application initialization process (return a __INLINE_CODE_30__ or mark the method as __INLINE_CODE_31__ and __INLINE_CODE_32__ an asynchronous method completion in the method body).

**代码块 1**

#### 应用程序关闭

__INLINE_CODE_33__, __INLINE_CODE_34__ 和 __INLINE_CODE_35__ hooks 在终止阶段被调用（在explicitly calling __INLINE_CODE_36__ 或在接收系统信号，如 SIGTERM，如果启用了）。这项功能常用于 __LINK_58__ 中管理容器的生命周期，通过 __LINK_59__ 对 dynos 或类似服务进行管理。

关闭 hook 监听器消耗系统资源，因此默认情况下被禁用。要使用关闭 hooks，**必须启用监听器**，通过调用 __INLINE_CODE_37__：

**代码块 2**

> 警告 **警告** 由于平台限制，NestJS 对应用程序关闭 hooks 在 Windows 平台上的支持有限。可以期望 __INLINE_CODE_38__ 工作，如 __INLINE_CODE_39__ 和 __INLINE_CODE_40__ 到一定程度 - __LINK_60__。然而 __INLINE_CODE_41__ 在 Windows 上将永远无法工作，因为在任务管理器中杀死进程是无条件的，即无法检测或预防。有关 __INLINE_CODE_42__, __INLINE_CODE_43__ 和其他在 Windows 上的处理方式，请查看 libuv 的 __LINK_61__。同时，查看 Node.js 文档中的 __LINK_62__。

> 信息 **信息** __INLINE_CODE_44__ 通过启动监听器消耗内存。在使用多个 Nest 应用程序在单个 Node 进程中运行的情况（例如，在使用 Jest 运行并发测试时），Node 可能会抱怨过多监听器进程。因此，__INLINE_CODE_45__ 默认情况下不启用。在运行多个实例在单个 Node 进程中的情况中，请注意这个条件。

当应用程序接收到终止信号时，它将调用已注册的 __INLINE_CODE_46__, __INLINE_CODE_47__,然后 __INLINE_CODE_48__ 方法（按照上述顺序），并将相应的信号作为第一个参数传递。如果已注册的函数异步调用（返回 promise），Nest 将不会在序列中继续，直到 promise 被解决或rejected。

**代码块 3**

> 信息 **信息** 调用 __INLINE_CODE_49__ 不会终止 Node 进程，但只触发 __INLINE_CODE_50__ 和 __INLINE_CODE_51__ hooks，所以如果有一些时间间隔、长时间的后台任务等，进程将不会自动终止。