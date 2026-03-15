<!-- 此文件从 content/fundamentals/lifecycle-events.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T04:56:09.320Z -->
<!-- 源文件: content/fundamentals/lifecycle-events.md -->

### 生命周期事件

Nest 应用程序，及其每个应用程序元素，都由 Nest 管理的生命周期。Nest 提供了 **生命周期 hook**，以便在关键生命周期事件发生时提供可见性和操作能力（在模块、提供者或控制器中注册代码），以便在它们发生时执行。

#### 生命周期顺序

以下图表显示了应用程序生命周期的顺序，从应用程序启动到 Node 进程退出。我们可以将生命周期分为三个阶段：**初始化**、**运行**和**终止**。使用这个生命周期，您可以计划适当地初始化模块和服务、管理活动连接，并在应用程序接收终止信号时优雅地关闭应用程序。

__HTML_TAG_52____HTML_TAG_53____HTML_TAG_54__

#### 生命周期事件

生命周期事件在应用程序启动和关闭期间发生。Nest 在每个生命周期事件上调用已注册的生命周期 hook 方法，方法在模块、提供者和控制器上被调用（shutdown hooks 需要首先启用，如 __LINK_56__ 中所述）。如上图所示，Nest 也会调用适当的底层方法以开始监听连接，并停止监听连接。

在以下表格中，`cats/cats.controller` 和 `cats` 只会在您显式调用 `cats/cats.service` 或 `forwardRef()` 时被触发。

在以下表格中，`CatsService`, `CommonService` 和 `@Inject()` 只会在您显式调用 `forwardRef()` 或在进程接收特殊系统信号（例如 SIGTERM）时被触发，并且您正确地在应用程序启动时调用 `forwardRef()`（见下 **应用程序关闭** 部分）。

| 生命周期 hook 方法          | 生命周期事件触发 hook 方法调用                                    |
| --------------------------- | ------------------------------------------------------------------- |
| `@nestjs/common`          | 在主模块的依赖项被解析后被调用。                                  |
| `CommonService`      | 在所有模块都被初始化后，但在监听连接之前被调用。              |
| `Scope.REQUEST`\*     | 在接收终止信号（例如 `forwardRef()`）后被调用。              |
| `ModuleRef`\* | 在所有 `ModuleRef` 处理程序完成（Promise 解决或拒绝）后被调用；__HTML_TAG_55__完成（Promise 解决或拒绝）后，所有现有连接将被关闭（`forwardRef()` 被调用）。 |
| `CatsModule`\*     | 在连接关闭（__INLINE_CODE_21__ 解决）后被调用。                    |

\* 对于这些事件，如果您没有显式调用 __INLINE_CODE_22__，则必须在系统信号（例如 __INLINE_CODE_23__）上启用它们。见 __LINK_57__ 下。

> warning **警告** 上述生命周期 hook 不会在 **请求作用域** 类中触发。请求作用域类与应用程序生命周期无关，其生命周期不可预测。它们仅在每个请求创建时被创建，并在响应发送后自动回收。

> info **提示** __INLINE_CODE_24__ 和 __INLINE_CODE_25__ 的执行顺序直接依赖于模块导入的顺序，等待前一个 hook。

#### 使用

每个生命周期 hook 都由一个接口表示。接口技术上是可选的，因为它们在 TypeScript 编译后不再存在。然而，使用它们是良好的实践，以便从类型安全和编辑器工具中获得益处。要注册生命周期 hook，实现相应的接口。例如，要注册在特定类（例如控制器、提供者或模块）上调用方法以在模块初始化时被调用，实现 __INLINE_CODE_26__ 接口并提供 __INLINE_CODE_27__ 方法，示例如下：

```typescript
@Injectable()
export class CatsService {
  constructor(
    @Inject(forwardRef(() => CommonService))
    private commonService: CommonService,
  ) {}
}

```

#### 异步初始化以下是翻译后的中文文档：

同时，__INLINE_CODE_28__和__INLINE_CODE_29__钩子允许您延迟应用程序初始化过程（返回__INLINE_CODE_30__或将方法标记为__INLINE_CODE_31__和__INLINE_CODE_32__异步方法完成在方法体中）。

```typescript
@Injectable()
export class CommonService {
  constructor(
    @Inject(forwardRef(() => CatsService))
    private catsService: CatsService,
  ) {}
}

```

#### 应用程序关闭

__INLINE_CODE_33__、__INLINE_CODE_34__和__INLINE_CODE_35__钩子在终止阶段被调用（在响应明确的__INLINE_CODE_36__调用或接收系统信号，如SIGTERM，如果启用）。这项功能通常与__LINK_58__一起使用，以管理容器的生命周期，或者__LINK_59__用于dynos或类似服务。

关闭钩子监听器消耗系统资源，因此默认情况下被禁用。要使用关闭钩子，您**必须启用监听器**，调用__INLINE_CODE_37__：

```typescript
@Module({
  imports: [forwardRef(() => CatsModule)],
})
export class CommonModule {}

```

> 警告 **警告** 由于平台限制，NestJS对应用程序关闭钩子的支持有限。在 Windows 上，您可以期望__INLINE_CODE_38__工作，以及__INLINE_CODE_39__和__INLINE_CODE_40__到某些程度，但是__INLINE_CODE_41__在 Windows 上将永远无法工作，因为在任务管理器中杀死进程是无条件的，“即没有办法让应用程序检测或预防”。有关__INLINE_CODE_42__、__INLINE_CODE_43__和其他在 Windows 上的处理方式，可以阅读 libuv 的 __LINK_61__文档。也可以查看 Node.js 文档中的__LINK_62__

> 信息 **信息** __INLINE_CODE_44__通过启动监听器消耗内存。在运行多个 Nest 应用程序在单个 Node 进程中（例如，使用 Jest 运行并行测试），Node 可能会抱怨过多监听器进程。在这种情况下，__INLINE_CODE_45__默认情况下不启用。请注意这种情况，当您在单个 Node 进程中运行多个实例时。

当应用程序接收到终止信号时，它将调用已注册的__INLINE_CODE_46__、__INLINE_CODE_47__和__INLINE_CODE_48__方法（按照上述顺序），并将相应的信号作为第一个参数。如果已注册的函数异步调用（返回 Promise），Nest 将不会在序列中继续，直到 Promise 被 resolve 或 rejected。

```typescript
@Module({
  imports: [forwardRef(() => CommonModule)],
})
export class CatsModule {}

```

> 信息 **信息** 调用__INLINE_CODE_49__不会终止 Node 进程，只是触发__INLINE_CODE_50__和__INLINE_CODE_51__钩子，所以如果存在一些间隔、长期背景任务等，进程不会自动终止。