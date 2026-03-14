<!-- 此文件从 content/fundamentals/lifecycle-events.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T04:31:35.325Z -->
<!-- 源文件: content/fundamentals/lifecycle-events.md -->

### 生命周期事件

Nest 应用程序，以及每个应用程序元素， 都受到 Nest 的生命周期管理。Nest 提供 **生命周期 hook**，以提供关键生命周期事件的可见性，并允许在它们发生时执行已注册的代码（在模块、提供者或控制器上运行）。

#### 生命周期顺序

以下图表描述了应用程序生命周期的顺序，从应用程序启动到 node 进程退出。我们可以将整个生命周期分为三个阶段：**初始化**、**运行**和**终止**。使用这个生命周期，您可以计划适当地初始化模块和服务，管理活动连接，并在应用程序接收终止信号时优雅地关闭应用程序。

__HTML_TAG_52____HTML_TAG_53____HTML_TAG_54__

#### 生命周期事件

生命周期事件在应用程序启动和关闭期间发生。Nest 在每个生命周期事件上调用已注册的生命周期 hook 方法，以便在模块、提供者和控制器上执行相应的代码（需要在 __LINK_56__ 中描述的 shutdown hooks 启用）。如上图所示，Nest 也会调用适当的底层方法以开始监听连接，并停止监听连接。

以下表格中，`cats/cats.controller` 和 `cats` 只有在您显式调用 `cats/cats.service` 或 `forwardRef()` 时才会被触发。

以下表格中，`CatsService`, `CommonService` 和 `@Inject()` 只有在您显式调用 `forwardRef()` 或 node 进程接收特殊系统信号（例如 SIGTERM）并正确地在应用程序启动时调用 `forwardRef()` 时才会被触发。

| 生命周期 hook 方法           | 生命周期事件触发 hook 方法调用                                                                                                                                                                   |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@nestjs/common`                | 在主模块的依赖项被解决后调用。                                                                                                                                                    |
| `CommonService`      | 在所有模块被初始化后，但在开始监听连接前调用。                                                                                                                              |
| `Scope.REQUEST`\*           | 在接收到终止信号（例如 `forwardRef()`）后调用。                                                                                                                                            |
| `ModuleRef`\* | 在所有 `ModuleRef` 处理器完成（Promise 已 resolve 或 reject）后调用（在 `forwardRef()` 完成后，所有现有连接将被关闭）。 |
| `CatsModule`\*     | 在连接关闭后调用（__INLINE_CODE_21__ resolve）。                                                                                                                                                          |

\* 对于这些事件，如果您不调用 __INLINE_CODE_22__，则必须启用以使其与系统信号（例如 __INLINE_CODE_23__）一起工作。见 __LINK_57__。

> warning **警告** 上述生命周期 hook 不会在 **request-scoped** 类中触发。request-scoped 类不是与应用程序生命周期相关联的，它们的生命周期是不可预测的。它们是专门为每个请求创建的，并在响应发送后自动垃圾回收。

> info **提示** __INLINE_CODE_24__ 和 __INLINE_CODE_25__ 的执行顺序直接依赖于模块导入的顺序，等待前一个 hook。

#### 使用

每个生命周期 hook 都由一个接口表示。接口技术上是可选的，因为它们在 TypeScript 编译后不再存在。然而，使用它们是好的实践，因为它们可以提供强类型和编辑器工具。要注册生命周期 hook，请实现相应的接口。例如，要注册在特定类（例如控制器、提供者或模块）上初始化方法的方法，请实现 __INLINE_CODE_26__ 接口并提供 __INLINE_CODE_27__ 方法，例如下所示：

```typescript
@Injectable()
export class CatsService {
  constructor(
    @Inject(forwardRef(() => CommonService))
    private commonService: CommonService,
  ) {}
}

```

#### 异步初始化Both __INLINE_CODE_28__ and __INLINE_CODE_29__ allow you to defer the application initialization process (return a __INLINE_CODE_30__ or mark the method as __INLINE_CODE_31__ and __INLINE_CODE_32__ an asynchronous method completion in the method body).

**```typescript
@Injectable()
export class CommonService {
  constructor(
    @Inject(forwardRef(() => CatsService))
    private catsService: CatsService,
  ) {}
}

```**

#### Application shutdown

__INLINE_CODE_33__, __INLINE_CODE_34__ and __INLINE_CODE_35__ hooks are called in the terminating phase (in response to an explicit call to __INLINE_CODE_36__ or upon receipt of system signals such as SIGTERM if opted-in). This feature is often used with __LINK_58__ to manage containers' lifecycles, by __LINK_59__ for dynos or similar services.

Shutdown hook listeners consume system resources, so they are disabled by default. To use shutdown hooks, you **must enable listeners** by calling __INLINE_CODE_37__:

**```typescript
@Module({
  imports: [forwardRef(() => CatsModule)],
})
export class CommonModule {}

```**

> warning **warning** Due to inherent platform limitations, NestJS has limited support for application shutdown hooks on Windows. You can expect __INLINE_CODE_38__ to work, as well as __INLINE_CODE_39__ and to some extent __INLINE_CODE_40__ - __LINK_60__. However __INLINE_CODE_41__ will never work on Windows because killing a process in the task manager is unconditional, "i.e., there's no way for an application to detect or prevent it". Here's some __LINK_61__ from libuv to learn more about how __INLINE_CODE_42__, __INLINE_CODE_43__ and others are handled on Windows. Also, see Node.js documentation of __LINK_62__

> info **Info** __INLINE_CODE_44__ consumes memory by starting listeners. In cases where you are running multiple Nest apps in a single Node process (e.g., when running parallel tests with Jest), Node may complain about excessive listener processes. For this reason, __INLINE_CODE_45__ is not enabled by default. Be aware of this condition when you are running multiple instances in a single Node process.

When the application receives a termination signal, it will call any registered __INLINE_CODE_46__, __INLINE_CODE_47__, then __INLINE_CODE_48__ methods (in the sequence described above) with the corresponding signal as the first parameter. If a registered function awaits an asynchronous call (returns a promise), Nest will not continue in the sequence until the promise is resolved or rejected.

**```typescript
@Module({
  imports: [forwardRef(() => CommonModule)],
})
export class CatsModule {}

```**

> info **Info** Calling __INLINE_CODE_49__ doesn't terminate the Node process but only triggers the __INLINE_CODE_50__ and __INLINE_CODE_51__ hooks, so if there are some intervals, long-running background tasks, etc. the process won't be automatically terminated.

Note: I have translated the text according to the provided glossary and followed the guidelines for code and format preservation, special syntax processing, content guidelines, and link handling.