<!-- 此文件从 content/fundamentals/lifecycle-events.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-01T04:26:31.074Z -->
<!-- 源文件: content/fundamentals/lifecycle-events.md -->

### 生命周期事件

Nest 应用程序和每个应用程序元素都有一个由 Nest 管理的生命周期。Nest 提供了 **生命周期钩子**，以便在关键生命周期事件发生时获取可见性，并在它们发生时执行注册的代码。

#### 生命周期顺序

以下图表显示了应用程序生命周期的顺序，从应用程序启动到 Node 进程退出。我们可以将整个生命周期分为三个阶段：**初始化**、**运行**和**终止**。使用这个生命周期，您可以计划适当地初始化模块和服务、管理活动连接，并在应用程序接收终止信号时优雅地关闭应用程序。

__HTML_TAG_52____HTML_TAG_53____HTML_TAG_54__

#### 生命周期事件

生命周期事件在应用程序启动和关闭期间发生。Nest 在每个生命周期事件上调用已注册的生命周期钩子方法，包括 **shutdown hooks**（需要启用，见 __LINK_56__）。如上图所示，Nest 也会调用相应的底层方法，以便开始监听连接和停止监听连接。

以下表格中，`await` 和 `@Inject('ASYNC_CONNECTION')` 只有在您显式调用 __INLINE_CODE_6__ 或 __INLINE_CODE_7__ 时才会被触发。

以下表格中，__INLINE_CODE_8__、__INLINE_CODE_9__ 和 __INLINE_CODE_10__ 只有在您显式调用 __INLINE_CODE_11__ 或 Node 进程接收特殊系统信号（例如 SIGTERM）并正确地在应用程序启动时调用 __INLINE_CODE_12__ 时才会被触发。

| 生命周期钩子方法           | 生命周期事件触发钩子方法调用                                                                                                                                                                   |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| __INLINE_CODE_13__                | 在宿主模块的依赖项已被解决时被调用。                                                                                                                                                    |
| __INLINE_CODE_14__      | 在所有模块都已初始化，但还没有开始监听连接时被调用。                                                                                                                              |
| __INLINE_CODE_15__\*           | 在接收到终止信号（例如 __INLINE_CODE_16__）后被调用。                                                                                                                                            |
| __INLINE_CODE_17__\* | 在所有 __INLINE_CODE_18__ 处理程序完成（Promises 解决或拒绝）后被调用（Promises 解决或拒绝），所有现有连接将被关闭（__INLINE_CODE_19__ 被调用）。 |
| __INLINE_CODE_20__\*     | 在连接关闭（__INLINE_CODE_21__ 解决）后被调用。                                                                                                                                                          |

\* 对于这些事件，如果您不调用 __INLINE_CODE_22__ 显式，您必须opt-in以使它们与系统信号（例如 __INLINE_CODE_23__）工作。见 __LINK_57__。

> 警告 **警告** 上述生命周期钩子方法不触发 **request-scoped** 类。request-scoped 类与应用程序生命周期无关， lifespan 是不可预测的。它们专门用于每个请求创建和自动垃圾回收响应发送后。

> 提示 **提示** __INLINE_CODE_24__ 和 __INLINE_CODE_25__ 的执行顺序取决于模块导入的顺序，等待前一个钩子方法。

#### 使用

每个生命周期钩子都由一个接口表示。 Interface 是可选的，因为它们在 TypeScript 编译后不再存在。然而，使用它们可以 benefited from strong typing and editor tooling。要注册生命周期钩子，实现合适的接口。例如，要在特定类（例如控制器、提供者或模块）上注册方法以在模块初始化时被调用，实现 __INLINE_CODE_26__ 接口并提供 __INLINE_CODE_27__ 方法，如下所示：

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

__INLINE_CODE_28__ 和 __INLINE_CODE_29__ 钩子允许您延迟应用程序初始化过程（返回 __INLINE_CODE_30__ 或将方法标记为异步方法完成在方法体中）。

__CODE_BLOCK_1__

#### 应用程序关闭

__INLINE_CODE_33__、__INLINE_CODE_34__ 和 __INLINE_CODE_35__