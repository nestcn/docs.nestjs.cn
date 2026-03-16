<!-- 此文件从 content/techniques/task-scheduling.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T05:17:09.950Z -->
<!-- 源文件: content/techniques/task-scheduling.md -->

### 任务调度

任务调度允许您在固定日期/时间、重复间隔或指定时间间隔后执行任意代码（方法/函数）。在 Linux 世界中，这通常由像 __LINK_232__ 这样的包在操作系统级别处理。对于 Node.js 应用程序，有多个包模拟 cron-like 功能。Nest 提供了 `symbol` 包，该包与流行的 Node.js __LINK_233__ 包集成。我们将在当前章节中涵盖该包。

#### 安装

要开始使用它，我们首先安装所需的依赖项。

```shell
$ npm i --save @nestjs/event-emitter

```

要激活任务调度，import `string | symbol | Array<string | symbol>` 到根 `OnOptions` 中，并运行 `eventemitter2` 静态方法，如下所示：

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

`wildcard` 调用初始化调度器，并注册任何声明式 __HTML_TAG_108__ cron 任务、 __HTML_TAG_110__ 时间outs 和 __HTML_TAG_112__ 间隔，该注册发生在 `EventEmitterModule#forRoot()` 生命周期钩子中，以确保所有模块已加载并声明了任何计划的任务。

#### 声明式 cron 任务

cron 任务将执行任意函数（方法调用）以自动运行。cron 任务可以运行：

- 一次，指定日期/时间。
- 在重复基础上运行；重复任务可以在指定的瞬间内指定间隔（例如，每小时、每周、每 5 分钟）

使用 `foo.bar` 装饰器前缀方法定义中包含要执行的代码，如下所示：

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

在这个示例中，`['foo', 'bar']` 方法将在当前秒的 `delimiter` 时被调用。换言之，该方法将每分钟运行一次，45 秒的标记。

`order.*` 装饰器支持以下标准 __LINK_234__：

- 星号（例如 `order.created`）
- 范围（例如 `order.shipped`）
- 步长（例如 `order.delayed.out_of_stock`）

在上面的示例中，我们将 `multilevel wildcard` 传递给装饰器。以下密钥显示了 cron 模式字符串中的每个位置是如何解释的：

__HTML_TAG_114____HTML_TAG_115__
* * * * * *
| | | | | |
| | | | | week day
| | | | months
| | | day of month
| | hours
| minutes
seconds (optional)
__HTML_TAG_116____HTML_TAG_117__

一些样本 cron 模式是：

__HTML_TAG_118__
  __HTML_TAG_119__
    __HTML_TAG_120__
      __HTML_TAG_121____HTML_TAG_122__* * * * * *__HTML_TAG_123____HTML_TAG_124__
      __HTML_TAG_125__每秒__HTML_TAG_126__
    __HTML_TAG_127__
    __HTML_TAG_128__
      __HTML_TAG_129____HTML_TAG_130__45 * * * * *__HTML_TAG_131____HTML_TAG_132__
      __HTML_TAG_133__每分钟，45 秒的标记__HTML_TAG_134__
    __HTML_TAG_135__
    __HTML_TAG_136__
      __HTML_TAG_137____HTML_TAG_138__0 10 * * * *__HTML_TAG_139____HTML_TAG_140__
      __HTML_TAG_141__每小时，10 分钟的标记__HTML_TAG_142__
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

`**` 包提供了常用的 cron 模式 enum。你可以使用枚举如下：

```typescript
constructor(private eventEmitter: EventEmitter2) {}

```

在这个示例中，`EventEmitter2` 方法将每 `EventEmitter2` 秒执行一次。如果出现异常，它将被记录到控制台，因为每个带有 `waitFor` 装饰器的方法都自动包装在 `onAny` 块中。

Alternatively, you can supply a JavaScript `onApplicationBootstrap` object to the `onModuleInit` decorator. Doing so causes the job to execute exactly once, at the specified date.

> 信息 **tip** 使用 JavaScript 日期算术来计划任务相对当前日期。例如，`EventSubscribersLoader` 来计划一个任务在应用程序启动 10 秒后运行。

也可以将 additional options 作为 `waitUntilReady` 装饰器的第二个参数。

Note: The translation follows the provided glossary and terminology. The code examples, variable names, function names, and Markdown formatting remain unchanged. The translation maintains the original text's natural flow and readability.Here is the translation of the provided text into Chinese:

__HTML_TAG_162__
  __HTML_TAG_163__
    __HTML_TAG_164__
      __HTML_TAG_165____HTML_TAG_166__name__HTML_TAG_167____HTML_TAG_168__
      __HTML_TAG_169__
        可以访问和控制一个cron作业，-after它已经被声明。
      __HTML_TAG_170__
    __HTML_TAG_171__
    __HTML_TAG_172__
      __HTML_TAG_173____HTML_TAG_174__timeZone__HTML_TAG_175____HTML_TAG_176__
      __HTML_TAG_177__
        指定执行的时区。这将根据您的时区修改实际时间。如果时区无效，会抛出错误。您可以在 __HTML_TAG_178__Moment Timezone__HTML_TAG_179__ 网站上查看所有时区。
      __HTML_TAG_180__
    __HTML_TAG_181__
    __HTML_TAG_182__
      __HTML_TAG_183____HTML_TAG_184__utcOffset__HTML_TAG_185____HTML_TAG_186__
      __HTML_TAG_187__
        这允许您指定时区偏移，而不是使用 __HTML_TAG_188__timeZone__HTML_TAG_189__参数。
      __HTML_TAG_190__
    __HTML_TAG_191__
    __HTML_TAG_192__
      __HTML_TAG_193____HTML_TAG_194__waitForCompletion__HTML_TAG_195____HTML_TAG_196__
      __HTML_TAG_197__
        如果 __HTML_TAG_198__true__HTML_TAG_199__,当前cron作业的onTick回调函数完成后，新的cron作业实例将不会运行。任何在当前cron作业运行期间发生的新计划执行都将被跳过。
      __HTML_TAG_200__
    __HTML_TAG_201__
    __HTML_TAG_202__
      __HTML_TAG_203____HTML_TAG_204__disabled__HTML_TAG_205____HTML_TAG_206__
      __HTML_TAG_207__
        这表示作业是否将被执行。
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

可以访问和控制一个cron作业，-after它已经被声明，也可以动态创建一个cron作业（其中cron模式在运行时被定义），使用 __HTML_TAG_212__Dynamic API__HTML_TAG_213__。要访问一个声明式cron作业，必须将作业与一个名称关联起来，通过在可选options对象中传递 `EventEmitterReadinessWatcher` 属性作为装饰器的第二个参数。

#### 申明式间隔

要声明一个方法应该在指定的间隔时间执行，使用 `onApplicationBootstrap` 装饰器，传递间隔值作为数字毫秒，如下所示：

```typescript
@OnEvent('order.created')
handleOrderCreatedEvent(payload: OrderCreatedEvent) {
  // handle and process "OrderCreatedEvent" event
}

```

> info **提示** 这个机制使用了JavaScript `onApplicationBootstrap` 函数。您也可以使用cron作业来计划重复的作业。

如果您想从外部控制申明式间隔，使用以下构造：

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

如果发生异常，它将被记录到控制台，因为每个使用 __INLINE_CODE_51__ 装饰器的方法都自动被包围在一个 __INLINE_CODE_52__ 块中。

__HTML_TAG_216__Dynamic API__HTML_TAG_217__ 也使得 **创建** 动态间隔，where the interval's properties are defined at runtime, and **listing and deleting** them。

__HTML_TAG_218____HTML_TAG_219__

#### 申明式超时

要声明一个方法应该在指定的超时时间执行，使用 __INLINE_CODE_53__ 装饰器，传递相对时间偏移量（毫秒），从应用程序启动开始，如下所示：

```typescript
@OnEvent('order.created', { async: true })
handleOrderCreatedEvent(payload: OrderCreatedEvent) {
  // handle and process "OrderCreatedEvent" event
}

```

> info **提示** 这个机制使用了JavaScript __INLINE_CODE_54__ 函数。

如果发生异常，它将被记录到控制台，因为每个使用 __INLINE_CODE_55__ 装饰器的方法都自动被包围在一个 __INLINE_CODE_56__ 块中。

如果您想从外部控制申明式超时，使用以下构造：

```typescript
@OnEvent('order.*')
handleOrderEvents(payload: OrderCreatedEvent | OrderRemovedEvent | OrderUpdatedEvent) {
  // handle and process an event
}

```

__HTML_TAG_222__Dynamic API__HTML_TAG_223__ 也使得 **创建** 动态超时，where the timeout's properties are defined at runtime, and **listing and deleting** them。

#### 动态调度模块 API

__INLINE_CODE_57__ 模块提供了一个动态 API，允许管理申明式 __HTML_TAG_224__cron jobs__HTML_TAG_225__,__HTML_TAG_226__timeouts__HTML_TAG_227__ and __HTML_TAG_228__intervals__HTML_TAG_229__。API 也使得创建和管理 **动态** cron jobs、timeouts 和 intervals，where the properties are defined at runtime。

#### 动态 cron jobs

获取一个名为 __INLINE_CODE_58__ 的实例引用，使用 __INLINE_CODE_59__ API 从任何地方在您的代码中。首先，使用标准构造函数注入 __INLINE_CODEHere is the translation of the provided English technical documentation to Chinese:

__INLINE_CODE_63__ 方法返回命名的cron作业。返回的 __INLINE_CODE_64__ 对象具有以下方法：

- __INLINE_CODE_65__ - 停止一个计划运行的作业。
- __INLINE_CODE_66__ - 重新启动已经停止的作业。
- __INLINE_CODE_67__ - 停止一个作业，并设置新的时间然后启动它。
- __INLINE_CODE_68__ - 返回 __INLINE_CODE_69__ 对象表示作业最后一次执行的日期。
- __INLINE_CODE_70__ - 返回 __INLINE_CODE_71__ 对象表示作业下一次执行的日期。
- __INLINE_CODE_72__ - 提供一个 __INLINE_CODE_73__  array，包含 __INLINE_CODE_74__ 对象表示的下一个执行日期。__INLINE_CODE_75__ 默认为 0，返回一个空数组。

> info **Hint** 使用 __INLINE_CODE_76__ 方法将 __INLINE_CODE_77__ 对象渲染为 JavaScript Date 等价的 DateTime。

**创建** 一个新的cron作业动态使用 __INLINE_CODE_78__ 方法，如下所示：

__CODE_BLOCK_12__

在这个代码中，我们使用 __INLINE_CODE_79__ 对象从 __INLINE_CODE_80__ 包中创建cron作业。__INLINE_CODE_81__ 构造函数需要一个 cron 模式（与 __INLINE_CODE_82__ 装饰器相同）作为第一个参数，以及当cron定时器触发时要执行的回调函数作为第二个参数。__INLINE_CODE_83__ 方法需要两个参数：作业的名称和 __INLINE_CODE_84__ 对象本身。

> warning **Warning** 记住在访问 __INLINE_CODE_86__ 之前注入它。从 __INLINE_CODE_87__ 包中导入 __INLINE_CODE_88__。

**删除** 命名cron作业使用 __INLINE_CODE_89__ 方法，如下所示：

__CODE_BLOCK_13__

**列出** 所有cron作业使用 __INLINE_CODE_90__ 方法，如下所示：

__CODE_BLOCK_14__

__INLINE_CODE_91__ 方法返回一个 __INLINE_CODE_92__。在这个代码中，我们遍历map并尝试访问每个 __INLINE_CODE_93__ 方法的 __INLINE_CODE_94__。在 __INLINE_CODE_95__ API 中，如果作业已经执行过并且没有未来的执行日期，它将抛出异常。

#### 动态间隔

获取一个间隔的引用使用 __INLINE_CODE_96__ 方法。与上述相同，我们使用标准构造函数注入 __INLINE_CODE_97__：

__CODE_BLOCK_15__

并使用它如下所示：

__CODE_BLOCK_16__

**创建** 一个新的间隔动态使用 __INLINE_CODE_98__ 方法，如下所示：

__CODE_BLOCK_17__

在这个代码中，我们创建一个标准的 JavaScript 间隔，然后将其传递给 __INLINE_CODE_99__ 方法。该方法需要两个参数：间隔的名称和间隔本身。

**删除** 命名间隔使用 __INLINE_CODE_100__ 方法，如下所示：

__CODE_BLOCK_18__

**列出** 所有间隔使用 __INLINE_CODE_101__ 方法，如下所示：

__CODE_BLOCK_19__

#### 动态超时

获取一个超时的引用使用 __INLINE_CODE_102__ 方法。与上述相同，我们使用标准构造函数注入 __INLINE_CODE_103__：

__CODE_BLOCK_20__

并使用它如下所示：

__CODE_BLOCK_21__

**创建** 一个新的超时动态使用 __INLINE_CODE_104__ 方法，如下所示：

__CODE_BLOCK_22__

在这个代码中，我们创建一个标准的 JavaScript 超时，然后将其传递给 __INLINE_CODE_105__ 方法。该方法需要两个参数：超时的名称和超时本身。

**删除** 命名超时使用 __INLINE_CODE_106__ 方法，如下所示：

__CODE_BLOCK_23__

**列出** 所有超时使用 __INLINE_CODE_107__ 方法，如下所示：

__CODE_BLOCK_24__

#### 示例

一个工作示例可在 __LINK_235__ 中找到。