<!-- 此文件从 content/fundamentals/lifecycle-events.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-03T04:19:23.596Z -->
<!-- 源文件: content/fundamentals/lifecycle-events.md -->

### 生命周期事件

Nest 应用程序，及其每个应用程序元素，都由 Nest 管理生命周期。Nest 提供了 **生命周期 hooks**，使您可以在关键生命周期事件中获得可见性，并在这些事件中运行已注册的代码（在模块、提供者或控制器中）。

#### 生命周期顺序

以下图表显示了应用程序生命周期的顺序，从应用程序被 bootstrap 到 Node 进程退出。我们可以将生命周期分为三个阶段：**初始化**、**运行**和**终止**。使用生命周期，您可以计划合适地初始化模块和服务，管理活动连接，并在应用程序接收终止信号时优雅地关闭应用程序。

__HTML_TAG_52____HTML_TAG_53____HTML_TAG_54__

#### 生命周期事件

生命周期事件发生在应用程序启动和关闭期间。Nest 在每个生命周期事件中调用已注册的生命周期 hook 方法，包括 **shutdown hooks**（需要先启用，见 __LINK_56__）。正如图表上所示，Nest 也将调用适当的底层方法以开始监听连接，并停止监听连接。

在以下表格中，`Guard2` 和 `Guard3` 只有在您显式调用 `app.useGlobalGuard()` 或 `catchError` 时触发。

在以下表格中，`@UsePipes()`、`GeneralValidationPipe` 和 `query` 只有在您显式调用 `params` 或如果进程接收特殊系统信号（如 SIGTERM）并正确地在应用程序启动时调用 `body` 时触发。

| 生命周期 hook 方法           | 生命周期事件触发 hook 方法调用                                                                                                                                                                   |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `RouteSpecificPipe`                | 在宿主模块的依赖项被解决后调用                                                                                                                                                    |
| `try/catch`      | 在所有模块都被初始化后，但belum监听连接前调用                                                                                                                              |
| __INLINE_CODE_15__\*           | 在收到终止信号（例如 __INLINE_CODE_16__）后调用                                                                                                                                            |
| __INLINE_CODE_17__\* | 在所有 __INLINE_CODE_18__ 处理程序完成（Promise 已 resolution 或 rejection）后调用；__HTML_TAG_55__在完成（Promise 已 resolution 或 rejection）后，所有现有连接将被关闭（__INLINE_CODE_19__ 调用） |
| __INLINE_CODE_20__\*     | 在连接关闭（__INLINE_CODE_21__ resolution）后调用                                                                                                                                                          |

\* 对于这些事件，如果您不调用 __INLINE_CODE_22__，则必须选择使它们与系统信号（例如 __INLINE_CODE_23__）工作。见 __LINK_57__。

> warning **警告** 上述生命周期 hooks 不会在 **request-scoped** 类中触发。request-scoped 类与应用程序生命周期无关，其生命周期不可预测。它们专门用于每个请求创建和自动垃圾回收后响应发送。

> info **提示** __INLINE_CODE_24__ 和 __INLINE_CODE_25__ 的执行顺序直接依赖于模块导入的顺序，等待上一个 hook。

#### 使用

每个生命周期 hook 都由一个接口表示。接口技术上是可选的，因为它们在 TypeScript 编译后不再存在。然而，使用它们是一种良好的实践，可以从强类型和编辑器工具中受益。要注册生命周期 hook，实现相应的接口。例如，在某个类（例如 Controller、Provider 或 Module）中注册一个方法，以便在模块初始化时被调用，实现 __INLINE_CODE_26__ 接口，提供 __INLINE_CODE_27__ 方法， 如下所示：

```typescript
@UseGuards(Guard1, Guard2)
@Controller('cats')
export class CatsController {
  constructor(private catsService: CatsService) {}

  @UseGuards(Guard3)
  @Get()
  getCats(): Cats[] {
    return this.catsService.getCats();
  }
}
```

#### 异步初始化

__INLINE_CODE_28__ 和 __INLINE_CODE_29__ 生命周期 hook 允许您延迟应用程序初始化过程（返回 __INLINE_CODE_30__ 或将方法标记为 __INLINE_CODE_31__ 和 __INLINE_CODE_32__异步方法完成在方法体中）。

```typescript
@UsePipes(GeneralValidationPipe)
@Controller('cats')
export class CatsController {
  constructor(private catsService: CatsService) {}

  @UsePipes(RouteSpecificPipe)
  @Patch(':id')
  updateCat(
    @Body() body: UpdateCatDTO,
    @Param() params: UpdateCatParams,
    @Query() query: UpdateCatQuery,
  ) {
    return this.catsService.updateCat(body, params, query);
  }
}
```

#### 应用程序关闭

__INLINE_CODE_33__、__INLINE_CODE_34__ 和 __INLINE_CODE_35