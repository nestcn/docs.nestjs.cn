<!-- 此文件从 content/techniques/task-scheduling.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T05:20:22.539Z -->
<!-- 源文件: content/techniques/task-scheduling.md -->

### 任务调度

任务调度允许您在固定的日期/时间、重复的时间间隔或指定的时间间隔后执行任意代码（方法/函数）。在 Linux 世界中，这通常由包 如 __LINK_232__ 在操作系统级别处理。对于 Node.js 应用程序，有多个包可以模拟 cron-like 功能。Nest 提供了 `symbol` 包，它与流行的 Node.js __LINK_233__ 包集成。我们将在当前章节中涵盖这个包。

#### 安装

要开始使用它，我们首先安装所需的依赖项。

```shell
$ npm i --save @nestjs/event-emitter

```

要激活任务调度，导入 `string | symbol | Array<string | symbol>` 到根 `OnOptions` 并运行 `eventemitter2` 静态方法，如下所示：

```typescript
import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    EventEmitterModule.forRoot()
  ],
})
export class AppModule {}

```

`wildcard` 调用初始化调度器，并注册任何明确的 __HTML_TAG_108__cron 任务、 __HTML_TAG_110__超时和 __HTML_TAG_112__间隔，该存在于应用程序中。注册发生在 `EventEmitterModule#forRoot()` 生命周期钩子中，确保所有模块已加载并声明了任何计划的任务。

#### 明确 cron 任务

cron 任务将任意函数（方法调用）安排在自动执行。cron 任务可以在以下时间执行：

- 一次，在指定的日期/时间。
- 在重复的时间间隔中运行；重复的任务可以在指定的瞬间内运行（例如，每小时、每周、每 5 分钟）

使用 `foo.bar` 装饰器在方法定义中包含要执行的代码，例如：

```typescript
EventEmitterModule.forRoot({
  // set this to `true` to use wildcards
  wildcard: false,
  // the delimiter used to segment namespaces
  delimiter: '.',
  // set this to `true` if you want to emit the newListener event
  newListener: false,
  // set this to `true` if you want to emit the removeListener event
  removeListener: false,
  // the maximum amount of listeners that can be assigned to an event
  maxListeners: 10,
  // show event name in memory leak message when more than maximum amount of listeners is assigned
  verboseMemoryLeak: false,
  // disable throwing uncaughtException if an error event is emitted and it has no listeners
  ignoreErrors: false,
});

```

在这个示例中，`['foo', 'bar']` 方法将每当当前秒是 `delimiter` 时被调用。换言之，方法将每分钟运行一次，45 秒 mark。

`order.*` 装饰器支持以下标准 __LINK_234__：

- 星号（例如 `order.created`）
- 范围（例如 `order.shipped`）
- 步长（例如 `order.delayed.out_of_stock`）

在上面的示例中，我们将 `multilevel wildcard` 传递给装饰器。下面的关键字显示了 cron 模式字符串中的每个位置是如何解释的：

__HTML_TAG_114____HTML_TAG_115__
* * * * * *
| | | | | |
| | | | |  week day
| | | |  month
| |  day of month
|  hour
|  minute
 seconds (optional)
__HTML_TAG_116____HTML_TAG_117__

一些示例 cron 模式是：

__HTML_TAG_118__
  __HTML_TAG_119__
    __HTML_TAG_120__
      __HTML_TAG_121____HTML_TAG_122__* * * * * *__HTML_TAG_123____HTML_TAG_124__
      __HTML_TAG_125__每秒__HTML_TAG_126__
    __HTML_TAG_127__
    __HTML_TAG_128__
      __HTML_TAG_129____HTML_TAG_130__45 * * * * *__HTML_TAG_131____HTML_TAG_132__
      __HTML_TAG_133__每分钟，45 秒 mark__HTML_TAG_134__
    __HTML_TAG_135__
    __HTML_TAG_136__
      __HTML_TAG_137____HTML_TAG_138__0 10 * * * *__HTML_TAG_139____HTML_TAG_140__
      __HTML_TAG_141__每小时，10 分钟 mark__HTML_TAG_142__
    __HTML_TAG_143__
    __HTML_TAG_144__
      __HTML_TAG_145____HTML_TAG_146__0 */30 9-17 * * *__HTML_TAG_147____HTML_TAG_148__
      __HTML_TAG_149__每 30 分钟，9 点到 17 点__HTML_TAG_150__
    __HTML_TAG_151__
   __HTML_TAG_152__
      __HTML_TAG_153____HTML_TAG_154__0 30 11 * * 1-5__HTML_TAG_155____HTML_TAG_156__
      __HTML_TAG_157__周一到周五，11:30__HTML_TAG_158__
    __HTML_TAG_159__
  __HTML_TAG_160__
__HTML_TAG_161__

`**` 包提供了常用的 cron 模式 enum。您可以使用以下方式：

```typescript
constructor(private eventEmitter: EventEmitter2) {}

```

在这个示例中，`EventEmitter2` 方法将每 `EventEmitter2` 秒被调用。如果出现异常，它将被记录到控制台，因为每个使用 `waitFor` 装饰器的方法都将自动包装在 `onAny` 块中。

Alternatively, you can supply a JavaScript `onApplicationBootstrap` object to the `onModuleInit` decorator. Doing so causes the job to execute exactly once, at the specified date.

> info **Hint** 使用 JavaScript 日期算术来计划任务相对于当前日期的执行。例如，`EventSubscribersLoader` 来计划一个任务在 app 启动 10 秒后执行。

Also, you can supply additional options as the second parameter to the `waitUntilReady` decorator.Here is the translation:

```

__HTML_TAG_162__
  __HTML_TAG_163__
    __HTML_TAG_164__
      __HTML_TAG_165____HTML_TAG_166__名称__HTML_TAG_167____HTML_TAG_168__
      __HTML_TAG_169__
        可以访问和控制 cron 作业后它被声明。
      __HTML_TAG_170__
    __HTML_TAG_171__
    __HTML_TAG_172__
      __HTML_TAG_173____HTML_TAG_174__时区__HTML_TAG_175____HTML_TAG_176__
      __HTML_TAG_177__
        指定执行时区的时区。这将修改实际时间相对于您的时区。如果时区无效，会抛出错误。您可以查看 Moment Timezone__HTML_TAG_179__ 网站中的所有时区。
      __HTML_TAG_180__
    __HTML_TAG_181__
    __HTML_TAG_182__
      __HTML_TAG_183____HTML_TAG_184__utcOffset__HTML_TAG_185____HTML_TAG_186__
      __HTML_TAG_187__
        这允许您指定时区的偏移，而不是使用 __HTML_TAG_188__时区__HTML_TAG_189__参数。
      __HTML_TAG_190__
    __HTML_TAG_191__
    __HTML_TAG_192__
      __HTML_TAG_193____HTML_TAG_194__waitForCompletion__HTML_TAG_195____HTML_TAG_196__
      __HTML_TAG_197__
        如果 __HTML_TAG_198__true__HTML_TAG_199__,不会在当前 onTick 回调完成之前运行额外的 cron 作业实例。任何新的计划执行在当前 cron 作业运行时都会被跳过。
      __HTML_TAG_200__
    __HTML_TAG_201__
    __HTML_TAG_202__
      __HTML_TAG_203____HTML_TAG_204__disabled__HTML_TAG_205____HTML_TAG_206__
      __HTML_TAG_207__
       这表示作业是否会被执行。
      __HTML_TAG_208__
    __HTML_TAG_209__
  __HTML_TAG_210__
__HTML_TAG_211__

```typescript
this.eventEmitter.emit(
  'order.created',
  new OrderCreatedEvent({
    orderId: 1,
    payload: {},
  }),
);

```

可以访问和控制 cron 作业后它被声明，也可以动态创建 cron 作业（其中 cron 模式是在运行时定义的）使用 __HTML_TAG_212__Dynamic API__HTML_TAG_213__。要访问声明 cron 作业 via API，您必须将作业与名称关联，通过在可选 options 对象的第二个参数中传递 `EventEmitterReadinessWatcher` 属性。

#### 声明性间隔

要声明一个方法应该在指定的间隔运行，使用 `onApplicationBootstrap` 装饰器 prefixed 方法定义，传递间隔值（以毫秒为单位）如下所示：

```typescript
@OnEvent('order.created')
handleOrderCreatedEvent(payload: OrderCreatedEvent) {
  // handle and process "OrderCreatedEvent" event
}

```

> info **提示** 这种机制使用 JavaScript `onApplicationBootstrap` 函数在后台。您也可以使用 cron 作业来排程重复性作业。

如果您想通过 __HTML_TAG_214__Dynamic API__HTML_TAG_215__从外部控制您的声明性间隔，使用以下构造：

```typescript
export type OnEventOptions = OnOptions & {
  /**
   * If "true", prepends (instead of append) the given listener to the array of listeners.
   *
   * @see https://github.com/EventEmitter2/EventEmitter2#emitterprependlistenerevent-listener-options
   *
   * @default false
   */
  prependListener?: boolean;

  /**
   * If "true", the onEvent callback will not throw an error while handling the event. Otherwise, if "false" it will throw an error.
   *
   * @default true
   */
  suppressErrors?: boolean;
};

```

如果出现异常，它将被记录到控制台，因为每个使用 __INLINE_CODE_51__ 装饰器的方法都自动包围在 __INLINE_CODE_52__ 块中。

__HTML_TAG_216__Dynamic API__HTML_TAG_217__ 还启用 **创建** 动态间隔、 **列出** 和 **删除**它们。

__HTML_TAG_218____HTML_TAG_219__

#### 声明性超时

要声明一个方法应该在指定的超时时间运行，使用 __INLINE_CODE_53__ 装饰器 prefixed 方法定义，传递相对时间偏移量（以毫秒为单位），如下所示：

```typescript
@OnEvent('order.created', { async: true })
handleOrderCreatedEvent(payload: OrderCreatedEvent) {
  // handle and process "OrderCreatedEvent" event
}

```

> info **提示** 这种机制使用 JavaScript __INLINE_CODE_54__ 函数在后台。

如果出现异常，它将被记录到控制台，因为每个使用 __INLINE_CODE_55__ 装饰器的方法都自动包围在 __INLINE_CODE_56__ 块中。

如果您想通过 __HTML_TAG_220__Dynamic API__HTML_TAG_221__从外部控制您的声明性超时，使用以下构造：

```typescript
@OnEvent('order.*')
handleOrderEvents(payload: OrderCreatedEvent | OrderRemovedEvent | OrderUpdatedEvent) {
  // handle and process an event
}

```

__HTML_TAG_222__Dynamic API__HTML_TAG_223__ 还启用 **创建** 动态超时、 **列出** 和 **删除**它们。

#### 动态调度模块 API

__INLINE_CODE_57__ 模块提供了一个动态 API，启用管理声明性 __HTML_TAG_224__ cron 作业__HTML_TAG_225__、 __HTML_TAG_226__超时__HTML_TAG_227__ 和 __HTML_TAG_228__间隔__HTML_TAG_229__。API 还启用创建和管理 **动态** cron 作业、超时和间隔，where properties 是在运行时定义的。

#### 动态 cron 作业

获取对 __INLINE_CODE_58__ 实例的引用，使用名称从您的代码任何地方 injected __INLINE_CODE_60__ 使用标准构造函数注入：

```typescript
@OnEvent('**')
handleEverything(payload: any) {
  // handle and process an event
}

```

> infoHere is the translation of the English technical documentation to Chinese:

**cron 任务**

`__INLINE_CODE_63__` 方法返回命名的 cron 任务。返回的 `__INLINE_CODE_64__` 对象具有以下方法：

- `__INLINE_CODE_65__` - 停止一个计划运行的任务。
- `__INLINE_CODE_66__` - 重新启动一个已经停止的任务。
- `__INLINE_CODE_67__` - 停止一个任务，然后设置新的时间并启动它。
- `__INLINE_CODE_68__` - 返回 `__INLINE_CODE_69__` 对象表示最后一次任务执行的日期。
- `__INLINE_CODE_70__` - 返回 `__INLINE_CODE_71__` 对象表示下一次任务执行的日期。
- `__INLINE_CODE_72__` - 返回一个 `__INLINE_CODE_74__` 数组，表示将要触发任务执行的日期。 `__INLINE_CODE_75__` 默认为 0，返回一个空数组。

> 提示 **Hint** 使用 `__INLINE_CODE_76__` 方法将 `__INLINE_CODE_77__` 对象转换为 JavaScript Date 对象。

**创建** 一个新的 cron 任务动态使用 `__INLINE_CODE_78__` 方法，例如：

```typescript title="创建 cron 任务"
const cron = require('cron');
const job = cron.create('0 0 * * *', () => {
  console.log('任务执行');
});

```

在上面的代码中，我们使用 `cron` 对象从 `cron` 包中创建 cron 任务。`__INLINE_CODE_81__` 构造函数接受 cron 模式（类似于 `__INLINE_CODE_82__` 装饰器）和任务执行回调函数作为参数。`__INLINE_CODE_83__` 方法接受任务名称和 `cron` 对象本身作为参数。

> 警告 **Warning** 不要忘记注入 `__INLINE_CODE_86__` 对象。从 `cron` 包中导入 `__INLINE_CODE_87__` 对象。

**删除** 命名的 cron 任务使用 `__INLINE_CODE_89__` 方法，例如：

```typescript title="删除 cron 任务"
cron.delete('myJob');

```

**列出** 所有 cron 任务使用 `__INLINE_CODE_90__` 方法，例如：

```typescript title="列出 cron 任务"
cron.list().forEach(job => {
  console.log(job.name);
});

```

#### 动态间隔

获取一个间隔的引用使用 `__INLINE_CODE_96__` 方法。像上面一样，使用标准构造函数注入 `__INLINE_CODE_97__` 对象：

```typescript title="获取间隔"
const interval = require('interval');
const intervalRef = interval.create('0 0 * * *', () => {
  console.log('间隔执行');
});

```

并使用它，例如：

```typescript title="使用间隔"
intervalRef.start();

```

**创建** 一个新的间隔动态使用 `__INLINE_CODE_98__` 方法，例如：

```typescript title="创建间隔"
const interval = require('interval');
const intervalRef = interval.create('0 0 * * *', () => {
  console.log('间隔执行');
});

```

在上面的代码中，我们创建一个标准的 JavaScript 间隔，然后将其传递给 `__INLINE_CODE_99__` 方法。该方法接受间隔名称和间隔本身作为参数。

**删除** 命名的间隔使用 `__INLINE_CODE_100__` 方法，例如：

```typescript title="删除间隔"
interval.delete('myInterval');

```

**列出** 所有间隔使用 `__INLINE_CODE_101__` 方法，例如：

```typescript title="列出间隔"
interval.list().forEach(interval => {
  console.log(interval.name);
});

```

#### 动态超时

获取一个超时的引用使用 `__INLINE_CODE_102__` 方法。像上面一样，使用标准构造函数注入 `__INLINE_CODE_103__` 对象：

```typescript title="获取超时"
const timeout = require('timeout');
const timeoutRef = timeout.create('0 0 * * *', () => {
  console.log('超时执行');
});

```

并使用它，例如：

```typescript title="使用超时"
timeoutRef.start();

```

**创建** 一个新的超时动态使用 `__INLINE_CODE_104__` 方法，例如：

```typescript title="创建超时"
const timeout = require('timeout');
const timeoutRef = timeout.create('0 0 * * *', () => {
  console.log('超时执行');
});

```

在上面的代码中，我们创建一个标准的 JavaScript 超时，然后将其传递给 `__INLINE_CODE_105__` 方法。该方法接受超时名称和超时本身作为参数。

**删除** 命名的超时使用 `__INLINE_CODE_106__` 方法，例如：

```typescript title="删除超时"
timeout.delete('myTimeout');

```

**列出** 所有超时使用 `__INLINE_CODE_107__` 方法，例如：

```typescript title="列出超时"
timeout.list().forEach(timeout => {
  console.log(timeout.name);
});

```

#### 示例

一个工作示例可在 __LINK_235__ 中找到。