<!-- 此文件从 content/techniques/task-scheduling.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:38:47.331Z -->
<!-- 源文件: content/techniques/task-scheduling.md -->

### 任务调度

任务调度允许您在固定的日期/时间、重复的间隔或指定的间隔后执行任意的代码（方法/函数）。在 Linux 世界中，这通常由包如 __LINK_232__ 在操作系统级别处理。对于 Node.js 应用程序，有多个包模拟cron-like功能。Nest 提供了 `symbol` 包，它与流行的 Node.js __LINK_233__ 包集成。我们将在当前章节中涵盖这个包。

#### 安装

开始使用它，我们首先安装所需的依赖项。

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

`wildcard` 调用初始化调度器，并注册任何声明式 __HTML_TAG_108__cron jobs__HTML_TAG_109__,__HTML_TAG_110__timeouts__HTML_TAG_111__和 __HTML_TAG_112__intervals__HTML_TAG_113__ 在您的应用程序中。注册发生在 `EventEmitterModule#forRoot()` 生命周期钩子上，确保所有模块已经加载并声明了任何计划的作业。

#### 声明式 cron 作业

cron 作业 scheduler 一个任意函数（方法调用）以自动执行。cron 作业可以在：

- 指定的日期/时间执行一次。
- 在指定的间隔内重复执行（例如，每小时、每周、每 5 分钟）

使用 `foo.bar` 装饰器在方法定义中包含要执行的代码，如下所示：

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

在这个示例中，`['foo', 'bar']` 方法将在当前秒的 `delimiter` 时被调用。在其他字，方法将在每分钟的 45 秒 mark 运行。

`order.*` 装饰器支持以下标准 __LINK_234__：

- 星号（例如， `order.created` ）
- 范围（例如， `order.shipped` ）
- 步长（例如， `order.delayed.out_of_stock` ")

在上面的示例中，我们将 `multilevel wildcard` 传递给装饰器。下面是 cron 模式字符串每个位置的解释：

__HTML_TAG_114____HTML_TAG_115__
* * * * * *
| | | | | |
| | | | | day of week
| | | | months
| | | day of month
| | hours
| minutes
seconds (optional)
__HTML_TAG_116____HTML_TAG_117__

一些示例 cron 模式是：

__HTML_TAG_118__
  __HTML_TAG_119__
    __HTML_TAG_120__
      __HTML_TAG_121____HTML_TAG_122__* * * * * *__HTML_TAG_123____HTML_TAG_124__
      __HTML_TAG_125__every second__HTML_TAG_126__
    __HTML_TAG_127__
    __HTML_TAG_128__
      __HTML_TAG_129____HTML_TAG_130__45 * * * * *__HTML_TAG_131____HTML_TAG_132__
      __HTML_TAG_133__every minute, on the 45th second__HTML_TAG_134__
    __HTML_TAG_135__
    __HTML_TAG_136__
      __HTML_TAG_137____HTML_TAG_138__0 10 * * * *__HTML_TAG_139____HTML_TAG_140__
      __HTML_TAG_141__every hour, at the start of the 10th minute__HTML_TAG_142__
    __HTML_TAG_143__
    __HTML_TAG_144__
      __HTML_TAG_145____HTML_TAG_146__0 */30 9-17 * * *__HTML_TAG_147____HTML_TAG_148__
      __HTML_TAG_149__every 30 minutes between 9am and 5pm__HTML_TAG_150__
    __HTML_TAG_151__
   __HTML_TAG_152__
      __HTML_TAG_153____HTML_TAG_154__0 30 11 * * 1-5__HTML_TAG_155____HTML_TAG_156__
      __HTML_TAG_157__Monday to Friday at 11:30am__HTML_TAG_158__
    __HTML_TAG_159__
  __HTML_TAG_160__
__HTML_TAG_161__

`**` 包提供了一个便捷的枚举，包含常用的 cron 模式。您可以使用枚举如下：

```typescript
constructor(private eventEmitter: EventEmitter2) {}

```

在这个示例中，`EventEmitter2` 方法将在每 `EventEmitter2` 秒被调用。如果出现异常，它将被记录到控制台，因为每个带有 `waitFor` 的方法自动被包围在 `onAny` 块中。

Alternatively, you can supply a JavaScript `onApplicationBootstrap` object to the `onModuleInit` decorator. Doing so causes the job to execute exactly once, at the specified date.

> info **Hint** 使用 JavaScript 日期算术来 scheduling 作业相对于当前日期。例如， `EventSubscribersLoader` 来 scheduling 一个作业在 10 秒后执行。

Also, you can supply additional options as the second parameter to the `waitUntilReady` decorator.Here is the translation of the provided English technical documentation to Chinese, following the provided guidelines:

```

<span style="font-family: Arial, sans-serif;">__HTML_TAG_162__</span>
  <span style="font-family: Arial, sans-serif;">__HTML_TAG_163__</span>
    <span style="font-family: Arial, sans-serif;">__HTML_TAG_164__</span>
      <span style="font-family: Arial, sans-serif;">__HTML_TAG_165____HTML_TAG_166__name__HTML_TAG_167____HTML_TAG_168__</span>
      <span style="font-family: Arial, sans-serif;">__HTML_TAG_169__</span>
        Useful to access and control a cron job after it's been declared.
      <span style="font-family: Arial, sans-serif;">__HTML_TAG_170__</span>
    <span style="font-family: Arial, sans-serif;">__HTML_TAG_171__</span>
    <span style="font-family: Arial, sans-serif;">__HTML_TAG_172__</span>
      <span style="font-family: Arial, sans-serif;">__HTML_TAG_173____HTML_TAG_174__timeZone__HTML_TAG_175____HTML_TAG_176__</span>
      <span style="font-family: Arial, sans-serif;">__HTML_TAG_177__</span>
        Specify the timezone for the execution. This will modify the actual time relative to your timezone. If the timezone is invalid, an error is thrown. You can check all timezones available at <a href="__HTML_TAG_178__Moment Timezone__HTML_TAG_179__">__HTML_TAG_178__Moment Timezone__HTML_TAG_179__</a> website.
      <span style="font-family: Arial, sans-serif;">__HTML_TAG_180__</span>
    <span style="font-family: Arial, sans-serif;">__HTML_TAG_181__</span>
    <span style="font-family: Arial, sans-serif;">__HTML_TAG_182__</span>
      <span style="font-family: Arial, sans-serif;">__HTML_TAG_183____HTML_TAG_184__utcOffset__HTML_TAG_185____HTML_TAG_186__</span>
      <span style="font-family: Arial, sans-serif;">__HTML_TAG_187__</span>
        This allows you to specify the offset of your timezone rather than using the __HTML_TAG_188__timeZone__HTML_TAG_189__ param.
      <span style="font-family: Arial, sans-serif;">__HTML_TAG_190__</span>
    <span style="font-family: Arial, sans-serif;">__HTML_TAG_191__</span>
    <span style="font-family: Arial, sans-serif;">__HTML_TAG_192__</span>
      <span style="font-family: Arial, sans-serif;">__HTML_TAG_193____HTML_TAG_194__waitForCompletion__HTML_TAG_195____HTML_TAG_196__</span>
      <span style="font-family: Arial, sans-serif;">__HTML_TAG_197__</span>
        If __HTML_TAG_198__true__HTML_TAG_199__, no additional instances of the cron job will run until the current onTick callback has been completed. Any new scheduled executions that occur while the current cron job is running will be skipped entirely.
      <span style="font-family: Arial, sans-serif;">__HTML_TAG_200__</span>
    <span style="font-family: Arial, sans-serif;">__HTML_TAG_201__</span>
    <span style="font-family: Arial, sans-serif;">__HTML_TAG_202__</span>
      <span style="font-family: Arial, sans-serif;">__HTML_TAG_203____HTML_TAG_204__disabled__HTML_TAG_205____HTML_TAG_206__</span>
      <span style="font-family: Arial, sans-serif;">__HTML_TAG_207__</span>
       This indicates whether the job will be executed at all.
      <span style="font-family: Arial, sans-serif;">__HTML_TAG_208__</span>
    <span style="font-family: Arial, sans-serif;">__HTML_TAG_209__</span>
  <span style="font-family: Arial, sans-serif;">__HTML_TAG_210__</span>
__HTML_TAG_211__

<span style="font-family: Arial, sans-serif;">```typescript
this.eventEmitter.emit(
  'order.created',
  new OrderCreatedEvent({
    orderId: 1,
    payload: {},
  }),
);

```</span>

<span style="font-family: Arial, sans-serif;">You can access and control a cron job after it's been declared, or dynamically create a cron job (where its cron pattern is defined at runtime) with the __HTML_TAG_212__Dynamic API__HTML_TAG_213__. To access a declarative cron job via the API, you must associate the job with a name by passing the `EventEmitterReadinessWatcher` property in an optional options object as the second argument of the decorator.</span>

#### Declarative intervals

To declare that a method should run at a (recurring) specified interval, prefix the method definition with the `onApplicationBootstrap` decorator. Pass the interval value, as a number in milliseconds, to the decorator as shown below:

<span style="font-family: Arial, sans-serif;">```typescript
@OnEvent('order.created')
handleOrderCreatedEvent(payload: OrderCreatedEvent) {
  // handle and process "OrderCreatedEvent" event
}

```</span>

&gt; info **Hint** This mechanism uses the JavaScript __Here is the translated text:

__INLINE_CODE_63__ 方法返回指定的 cron 作业。返回的 __INLINE_CODE_64__ 对象具有以下方法：

- __INLINE_CODE_65__ - 停止一个计划运行的作业。
- __INLINE_CODE_66__ - 重新启动一个已经停止的作业。
- __INLINE_CODE_67__ - 停止一个作业，然后设置新的时间并启动它。
- __INLINE_CODE_68__ - 返回一个 __INLINE_CODE_69__ 对象，表示作业最后一次执行的日期。
- __INLINE_CODE_70__ - 返回一个 __INLINE_CODE_71__ 对象，表示作业下一次执行的日期。
- __INLINE_CODE_72__ - 返回一个大小为 __INLINE_CODE_73__ 的数组，包含 __INLINE_CODE_74__ 对象，表示将要触发作业执行的日期。 __INLINE_CODE_75__ 默认为 0，返回一个空数组。

> info **Hint** 使用 __INLINE_CODE_76__ 将 __INLINE_CODE_77__ 对象渲染为 JavaScript 日期，等同于 DateTime。

**Create** 一个新的 cron 作业动态地使用 __INLINE_CODE_78__ 方法，例如：

__CODE_BLOCK_12__

在这段代码中，我们使用 __INLINE_CODE_79__ 对象从 __INLINE_CODE_80__ 包中创建了 cron 作业。 __INLINE_CODE_81__ 构造函数的第一个参数是 cron 模式（与 __INLINE_CODE_82__ __HTML_TAG_230__decorator__HTML_TAG_231__相同），第二个参数是当 cron 定时器触发时要执行的回调函数。 __INLINE_CODE_83__ 方法需要两个参数：作业的名称和 __INLINE_CODE_85__ 对象本身。

> warning **Warning** 不要忘记在访问 __INLINE_CODE_86__ 时注入它。从 __INLINE_CODE_87__ 包中导入 __INLINE_CODE_88__。

**Delete** 一个名称的 cron 作业使用 __INLINE_CODE_89__ 方法，例如：

__CODE_BLOCK_13__

**List** 所有 cron 作业使用 __INLINE_CODE_90__ 方法，例如：

__CODE_BLOCK_14__

__INLINE_CODE_91__ 方法返回一个 __INLINE_CODE_92__ 对象。在这段代码中，我们遍历 map 并尝试访问每个 __INLINE_CODE_94__ 对象的 __INLINE_CODE_95__ 方法。在 __INLINE_CODE_96__ API 中，如果作业已经执行并且没有未来执行日期，它将抛出异常。

#### 动态间隔

获取一个间隔的引用使用 __INLINE_CODE_96__ 方法。正如上面所示，使用标准构造函数注入 __INLINE_CODE_97__：

__CODE_BLOCK_15__

并使用它如下：

__CODE_BLOCK_16__

**Create** 一个新的间隔动态地使用 __INLINE_CODE_98__ 方法，例如：

__CODE_BLOCK_17__

在这段代码中，我们创建了一个标准 JavaScript 间隔，然后将其传递给 __INLINE_CODE_99__ 方法。该方法需要两个参数：间隔的名称和间隔本身。

**Delete** 一个名称的间隔使用 __INLINE_CODE_100__ 方法，例如：

__CODE_BLOCK_18__

**List** 所有间隔使用 __INLINE_CODE_101__ 方法，例如：

__CODE_BLOCK_19__

#### 动态超时

获取一个超时的引用使用 __INLINE_CODE_102__ 方法。正如上面所示，使用标准构造函数注入 __INLINE_CODE_103__：

__CODE_BLOCK_20__

并使用它如下：

__CODE_BLOCK_21__

**Create** 一个新的超时动态地使用 __INLINE_CODE_104__ 方法，例如：

__CODE_BLOCK_22__

在这段代码中，我们创建了一个标准 JavaScript 超时，然后将其传递给 __INLINE_CODE_105__ 方法。该方法需要两个参数：超时的名称和超时本身。

**Delete** 一个名称的超时使用 __INLINE_CODE_106__ 方法，例如：

__CODE_BLOCK_23__

**List** 所有超时使用 __INLINE_CODE_107__ 方法，例如：

__CODE_BLOCK_24__

#### 示例

一个工作示例可在 __LINK_235__ 中找到。