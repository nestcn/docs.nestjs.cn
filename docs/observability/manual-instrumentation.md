<!-- 此文件从 content/observability/manual-instrumentation.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-09-03T13:54:22.000Z -->
<!-- 源文件: content/observability/manual-instrumentation.md -->
<!-- 源哈希: 03805a3ee41f254c50a00338a0c526cf -->

### 手动插桩

SDK 的大部分是自动插桩——您配置一次，由它决定记录什么。`TracerService` 是手动的那一半：把它注入到应用程序的任何位置，即可在已被追踪的请求内部添加跨度、为该请求附加上下文、捕获您自行处理的错误，以及上报您自己的指标。

```typescript title="cats.service.ts"
import { Injectable } from '@nestjs/common';
import { TracerService } from '@nestjs/observe';

@Injectable()
export class CatsService {
  constructor(private readonly tracerService: TracerService) {}
}

```

`TracerService` 由 `ObserveModule` 导出，因此在导入该模块的任何模块中都可以注入。每个方法都会从环境异步上下文中读取追踪信息，这意味着在请求、任务或其他被插桩操作之外调用它们会抛出异常——因为没有可附加的追踪。这是有意为之：静默丢弃一个跨度比抛出错误更难察觉。（例外是[自定义指标](#自定义指标)，它们不与追踪绑定。）

#### 创建跨度

`createSpan(name, callback)` 会在一个新跨度内运行回调，该跨度嵌套在当前活动的跨度之下，并返回回调的返回值。跨度的持续时间就是回调的持续时间，因此任何您想测量的东西都要 `await`：

```typescript title="cats.service.ts"
async findOne(id: string, activeUser: ActiveUserData) {
  return this.tracerService.createSpan('cats.findOne', async (span) => {
    span.addTags({ userId: activeUser.sub, catId: id });
    return this.catsRepository.findOne(id);
  });
}

```

跨度按调用栈嵌套——一个 `createSpan()` 出现在另一个 `createSpan()` 的回调中，就成为后者的子跨度，这正是追踪详情页上瀑布图的成因。回调可以是同步的，也可以是异步的。自动插桩的跨度（控制器方法、提供者、数据库调用）与您的自定义跨度会归入同一棵树，因此手工命名的跨度会准确地出现在它实际运行的位置，与其他一切相对。

`span` 参数是一个 `TraceSpanDelegate`，其 `addTags(tags)`（或针对单个键值对的 `setTag(key, value)`）仅把键值对附加到该跨度上。它们可以被搜索，并在追踪视图中显示在该跨度上，与 [SDK → 标签和自定义属性](/observability/sdk#标签和自定义属性)中描述的 `tags`/`setAttributes` 选项相同——区别在于作用域：那些覆盖每个请求，而这个只覆盖单个跨度。

`activeSpan()` 返回当前活动跨度的 `TraceSpanDelegate` 而不创建新跨度，适用于您想从一段并非创建该跨度的代码中给外层跨度打标签的场景：

```typescript
const span = await this.tracerService.activeSpan();
span.addTags({ cacheHit: 'false' });

```

如果当前追踪没有活动跨度，它会抛出异常。

<figure><img src="https://www.observe.nestjs.com/docs/sdk/spans.webp" alt="Spans" /></figure>

> info **提示** 跨度名称是**跨度**分析视图聚合的依据，横跨调用它们的所有路由。请选择描述工作内容的名称（`orders.recalculate`、`cache.lookup`），而不是描述调用者，这样"它在所有地方都慢，还是只在这个端点慢？"就成为仪表盘能够回答的问题。

#### 捕获已处理的错误

从控制器、任务或跨度中向外传播的错误会被自动记录。`captureError()` 用于那些不会传播的错误——任何您已捕获并处理、但仍希望它在仪表盘中可见的错误：

```typescript
try {
  await this.billing.sync(accountId);
} catch (error) {
  await this.tracerService.captureError(error, {
    accountId,
    retryable: 'true',
  });
}

```

该错误会附加到当前追踪上，可选的标签也随之记录；如果启用了 [`sourceContext`](/observability/sdk#错误源代码上下文)，它还会获得与其他被捕获错误相同的源代码上下文处理。

#### 请求作用域属性

`setAttribute(key, value)` 和 `getAttribute(key)` 读写追踪自身的上下文存储——这些值在请求存续期间一直存在，可从下游任何位置读取，而不必把它们层层穿透每个函数签名：

```typescript
this.tracerService.setAttribute('tenantId', tenant.id);
// ...稍后，在同一请求的另一个服务中
const tenantId = this.tracerService.getAttribute('tenantId');

```

`getAttribute()` 对从未设置过的键返回 `undefined`。两者在被追踪上下文之外调用时都会抛出异常。

这个存储与追踪 ID 所在的是同一个，因此 `getAttribute(traceIdKey)` 可以取回当前的追踪 ID——用于与外部系统关联，或[把它传播到另一个服务](/observability/distributed-tracing)。`currentTraceId()` 是这一查询的简写形式，但有一个刻意的变化：在被追踪上下文之外它返回 `null` 而不是抛出异常，因为读取追踪 ID 以便向下游转发，恰恰是那种在还没有追踪时也完全可能合理发生的调用。如果在您的代码中这种情况可能出现，请在设置请求头之前先对 `null` 做判断。

要为这个存储添加类型，请把它的形状作为 `TracerService` 的第一个类型参数传入；之后键和值都会依据它进行校验，包括嵌套路径：

```typescript
interface RequestStore {
  tenantId: string;
  flags: { betaCheckout: boolean };
}

@Injectable()
export class CheckoutService {
  constructor(private readonly tracerService: TracerService<RequestStore>) {}

  enableBeta() {
    this.tracerService.setAttribute('flags.betaCheckout', true);
  }
}

```

> info **提示** `ObserveModule` 同样导出了追踪上下文所在的 `AsyncLocalStorage` 实例。`setAttribute()`/`getAttribute()` 是访问它的受支持方式；只有当您需要它们未暴露的能力时，才直接注入该存储。如果您已经在使用 [异步本地存储](/recipes/async-local-storage) 配方中描述的模式，这个存储可以取代您手工实现的那一个。

#### 自定义指标

有三种指标类型可用，每种都按名称创建（如果名称已存在则取回）。它们上报到仪表盘的**自定义**部分，并且可以像任何内置指标一样对其设置告警。

与上述方法不同，指标不与追踪绑定，因此可以从任何地方上报——包括启动和关闭代码、`onModuleInit()` 钩子以及定时任务。

| 方法      | 用途                                                                     | 上报方式        |
| --------- | ------------------------------------------------------------------------ | --------------- |
| `counter` | 只增不减的值——服务的请求数、下单数、重试次数                              | `increment()`   |
| `gauge`   | 可增可减的值——队列深度、活动连接数、缓存命中率                            | `increment()`   |
| `summary` | 需要分位数的分布——延迟、负载大小                                          | `observe(value)` |

```typescript title="cats.service.ts"
this.tracerService
  .counter('cats.lookups', { description: 'Number of cat lookups' })
  .increment();

this.tracerService
  .gauge('cats.active.sessions', {
    kind: 'ratio',
    initialValue: 0,
    description: 'Number of active sessions',
  })
  .increment();

const latency = this.tracerService.summary('cats.lookup.duration', {
  description: 'Duration of cat lookups in milliseconds',
});
const startedAt = performance.now();
try {
  return await this.catsRepository.findOne(id);
} finally {
  // 在 finally 中观测，这样失败的查找也会进入分布——
  // 丢掉缓慢的失败样本，正是延迟摘要"自我美化"的原因。
  latency.observe(performance.now() - startedAt);
}

```

调用 `counter('orders.placed')` 两次会返回同一个实例，因此无需在字段中保存引用——不过在热路径上保存引用开销更低。在后续调用中传入属性会就地更新现有指标的描述和标签。

| 属性           | 适用于                  | 描述                                                                                                |
| -------------- | ----------------------- | ---------------------------------------------------------------------------------------------------- |
| `description`  | counter, gauge, summary | 在仪表盘中与指标一同显示。值得设置——光秃秃的指标名很难让未来的读者明白它的含义。                      |
| `labels`       | counter, gauge, summary | 指标按其细分的维度，使图表可以拆分显示，而不是只呈现一条聚合线。                                      |
| `initialValue` | counter, gauge          | 起始值。仅在指标仍为 `0` 时生效，因此重启时的声明不会覆盖已经统计到的值。                             |
| `kind`         | gauge                   | `'ratio'`（默认）用于每次上报独立成立的值，`'additive'` 用于跨上报实例求和的值。                      |
| `sampleSize`   | summary                 | 每个标签保留多少条观测值用于计算分位数，这在高负载下约束了摘要的内存占用。                            |

<figure><img src="https://www.observe.nestjs.com/docs/sdk/custom-metrics.webp" alt="Custom metrics" /></figure>

一个已声明但从未上报的指标在仪表盘中显示为"未知"而不是 `0`。这是一种真实状态，而不是数据缺失："我们从未收到过这个指标的数据"和"这个指标当前为零"是两个不同的事实，把后者当成前者展示会掩盖一次失败的部署。

#### API 摘要

| 方法                              | 需要追踪 | 描述                                                       |
| --------------------------------- | :------: | ---------------------------------------------------------- |
| `createSpan(name, callback)`      |    ✓     | 在新的子跨度内运行 `callback`；返回其结果                   |
| `activeSpan()`                    |    ✓     | 当前正在进行的跨度的 `TraceSpanDelegate`                    |
| `captureError(error, tags?)`      |    ✓     | 在当前追踪上记录一个已处理的错误                            |
| `setAttribute(key, value)`        |    ✓     | 写入请求作用域的上下文存储                                  |
| `getAttribute(key)`               |    ✓     | 读取请求作用域的上下文存储                                  |
| `currentTraceId()`                |    ✗     | 当前活动的追踪 ID，在追踪之外返回 `null`                    |
| `counter(name, attributes?)`      |    ✗     | 获取或创建一个单调递增的指标                                |
| `gauge(name, attributes?)`        |    ✗     | 获取或创建一个可增可减的指标                                |
| `summary(name, attributes?)`      |    ✗     | 获取或创建一个带分位数的分布指标                            |

#### 后续内容

- [分布式追踪](/observability/distributed-tracing)——使用 `currentTraceId()` 让一个追踪跨越服务边界。
- [仪表盘](/observability/dashboard)——跨度、捕获的错误和自定义指标呈现在哪里。
