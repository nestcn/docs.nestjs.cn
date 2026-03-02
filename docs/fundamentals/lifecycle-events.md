<!-- 此文件从 content/fundamentals/lifecycle-events.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-02T04:18:05.509Z -->
<!-- 源文件: content/fundamentals/lifecycle-events.md -->

### 生命周期事件

Nest 应用程序，以及每个应用程序元素，都由 Nest 管理的生命周期。Nest 提供了 **生命周期 hook**，使您可以在关键生命周期事件发生时获得可见性，并执行相应的代码（在您的模块、提供者或控制器上注册代码）。

#### 生命周期顺序

以下图表显示了应用程序生命周期的顺序，从应用程序启动到 Node 进程退出。我们可以将生命周期分为三个阶段：**初始化**、**运行**和**终止**。使用这生命周期，您可以计划适当地初始化模块和服务，管理活动连接，和优雅地关闭应用程序，当它接收到终止信号。

__HTML_TAG_52____HTML_TAG_53____HTML_TAG_54__

#### 生命周期事件

生命周期事件发生在应用程序启动和关闭期间。Nest 在每个生命周期事件上调用注册的生命周期 hook 方法，包括 **shutdown hooks**（需要首先启用 shutdown hooks，详见 __LINK_56__）。正如上图所示，Nest 也会调用相应的底层方法，以便开始监听连接，和停止监听连接。

在以下表格中，`await` 和 `@Inject('ASYNC_CONNECTION')`仅在您 explicit 地调用 __INLINE_CODE_6__ 或 __INLINE_CODE_7__ 时触发。

在以下表格中，__INLINE_CODE_8__、__INLINE_CODE_9__ 和 __INLINE_CODE_10__仅在您 explicit 地调用 __INLINE_CODE_11__ 或如果进程接收到特殊系统信号（例如 SIGTERM），并且您正确地在应用程序启动时调用 __INLINE_CODE_12__（详见下文 **Application shutdown** 部分）。

| 生命周期 hook 方法           | 生命周期事件触发 hook 方法调用                                                                                                                                                                   |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| __INLINE_CODE_13__                | 在宿主模块的依赖项被解决后调用。                                                                                                                                                    |
| __INLINE_CODE_14__      | 在所有模块都被初始化后，但在监听连接前调用。                                                                                                                              |
| __INLINE_CODE_15__\*           | 在接收到终止信号（例如 __INLINE_CODE_16__）后调用。                                                                                                                                            |
| __INLINE_CODE_17__\* | 在所有 __INLINE_CODE_18__ 处理程序完成（Promise 解决或拒绝）后调用；__HTML_TAG_55__ Promise 解决或拒绝后，所有现有连接将被关闭（__INLINE_CODE_19__ 调用）。 |
| __INLINE_CODE_20__\*     | 在连接关闭（__INLINE_CODE_21__ 解决）后调用。                                                                                                                                                          |

\* 对于这些事件，如果您没有 explicit 地调用 __INLINE_CODE_22__，则必须 opt-in，以使它们与系统信号（例如 __INLINE_CODE_23__）一起工作。详见 __LINK_57__。

> warning **Warning** 生命周期 hook 列表上所列的事件不触发 **request-scoped** 类。request-scoped 类不是与应用程序生命周期相关的，它们的生命周期不可预测。它们专门用于每个请求创建和自动垃圾回收后。

> info **Hint** __INLINE_CODE_24__ 和 __INLINE_CODE_25__ 的执行顺序直接依赖于模块导入的顺序，等待前一个 hook。

#### 使用

每个 生命周期 hook 都由一个接口表示。接口技术上是可选的，因为它们在 TypeScript 编译后不存在。然而，这样使用它们可以受益于强类型和编辑器工具。

要注册一个生命周期 hook，实现相应的接口。例如，要注册一个方法，以便在模块初始化时在特定类上（例如控制器、提供者或模块）调用该方法，实现 __INLINE_CODE_26__ 接口，supplying an __INLINE_CODE_27__ 方法，如下所示：

```typescript
{
  provide: 'ASYNC_CONNECTION',
  useFactory: async () => {
    const connection = await createConnection(options);
    return connection;
  },
}
```

#### 异步初始化

__INLINE_CODE_28__ 和 __INLINE_CODE_29__ 生命周期 hook 允许您延迟应用程序初始化过程（返回一个 __INLINE_CODE_30__ 或标记方法为 __INLINE_CODE_31__ 和 __INLINE_CODE_32__ 异步方法完成）。

__CODE_BLOCK_1__

#### 应用程序关闭

