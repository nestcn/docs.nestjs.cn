<!-- 此文件从 content/techniques/task-scheduling.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T05:06:10.075Z -->
<!-- 源文件: content/techniques/task-scheduling.md -->

### 任务调度

任务调度允许您在固定日期/时间、重复间隔或指定间隔后执行任意代码（方法/函数）。在 Linux 世界中，这通常由像 __LINK_232__ 这样的包在操作系统级别处理。对于 Node.js 应用程序，有多个包模拟 cron 类似功能。Nest 提供了 `symbol` 包，它与流行的 Node.js __LINK_233__ 包集成。我们将在当前章节中涵盖这个包。

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

`wildcard` 调用初始化调度器，并注册任何声明式 __HTML_TAG_108__cron 作业、 __HTML_TAG_110__超时和 __HTML_TAG_112__间隔，该注册发生在 `EventEmitterModule#forRoot()` 生命周期钩子中，以确保所有模块已加载并声明了任何 schedules 作业。

#### 声明式 cron 作业

cron 作业将任意函数（方法调用）排程为自动执行。cron 作业可以在以下时间执行：

- 一次，指定日期/时间。
- 在指定的间隔重复执行；重复作业可以在指定的瞬间执行（例如，每小时、每周、每 5 分钟）

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

在这个示例中，`['foo', 'bar']` 方法将在当前秒的 `delimiter` 时执行。在其他字面上，方法将在每分钟的 45 秒时执行。

`order.*` 装饰器支持以下标准 __LINK_234__：

- 星号（例如 `order.created`）
- 范围（例如 `order.shipped`）
- 步长（例如 `order.delayed.out_of_stock`）

在上面的示例中，我们将 `multilevel wildcard` 传递给装饰器。下面是 cron 模式字符串中的每个位置的解释：

__HTML_TAG_114____HTML_TAG_115__
* * * * * *
| | | | | |
| | | | | 周一至周五
| | | | 月份
| | | 日期
| | 小时
| 分钟
秒 (可选)
__HTML_TAG_116____HTML_TAG_117__

以下是一些示例 cron 模式：

__HTML_TAG_118__
  __HTML_TAG_119__
    __HTML_TAG_120__
      __HTML_TAG_121____HTML_TAG_122__* * * * * *__HTML_TAG_123____HTML_TAG_124__
      __HTML_TAG_125__每秒__HTML_TAG_126__
    __HTML_TAG_127__
    __HTML_TAG_128__
      __HTML_TAG_129____HTML_TAG_130__45 * * * * *__HTML_TAG_131____HTML_TAG_132__
      __HTML_TAG_133__每分钟，45 秒时__HTML_TAG_134__
    __HTML_TAG_135__
    __HTML_TAG_136__
      __HTML_TAG_137____HTML_TAG_138__0 10 * * * *__HTML_TAG_139____HTML_TAG_140__
      __HTML_TAG_141__每小时，10 分钟开始__HTML_TAG_142__
    __HTML_TAG_143__
    __HTML_TAG_144__
      __HTML_TAG_145____HTML_TAG_146__0 */30 9-17 * * *__HTML_TAG_147____HTML_TAG_148__
      __HTML_TAG_149__每 30 分钟，9:00 到 17:00__HTML_TAG_150__
    __HTML_TAG_151__
   __HTML_TAG_152__
      __HTML_TAG_153____HTML_TAG_154__0 30 11 * * 1-5__HTML_TAG_155____HTML_TAG_156__
      __HTML_TAG_157__周一至周五，11:30__HTML_TAG_158__
    __HTML_TAG_159__
  __HTML_TAG_160__
__HTML_TAG_161__

`**` 包提供了常用的 cron 模式枚举。您可以使用枚举如下：

```typescript
constructor(private eventEmitter: EventEmitter2) {}

```

在这个示例中，`EventEmitter2` 方法将每 `EventEmitter2` 秒执行。如果出现异常，它将被记录到控制台，因为每个带有 `waitFor` 注解的方法都将被自动包围在 `onAny` 块中。

或者，您可以将 JavaScript `onApplicationBootstrap` 对象传递给 `onModuleInit` 装饰器。这将导致作业在指定日期执行 exactly once。

> 信息 **提示** 使用 JavaScript 日期算术来 scheduling 作业相对于当前日期。例如，`EventSubscribersLoader` 来 schedule 作业在 10 秒后启动。

此外，您还可以将额外选项作为 `waitUntilReady` 装饰器的第二个参数。

Note: The translation follows the provided glossary and guidelines.Here is the translation of the English technical documentation to Chinese:

__HTML_TAG_162__
  __HTML_TAG_163__
    __HTML_TAG_164__
      __HTML_TAG_165____HTML_TAG_166__name__HTML_TAG_167____HTML_TAG_168__
      __HTML_TAG_169__
        可以访问和控制一个 cron 作业后它被声明。
      __HTML_TAG_170__
    __HTML_TAG_171__
    __HTML_TAG_172__
      __HTML_TAG_173____HTML_TAG_174__timeZone__HTML_TAG_175____HTML_TAG_176__
      __HTML_TAG_177__
        指定执行的时区。这将修改实际时间相对于您的时区。如果时区无效，将抛出错误。您可以在 __HTML_TAG_178__Moment Timezone__HTML_TAG_179__ 网站上查看所有可用的时区。
      __HTML_TAG_180__
    __HTML_TAG_181__
    __HTML_TAG_182__
      __HTML_TAG_183____HTML_TAG_184__utcOffset__HTML_TAG_185____HTML_TAG_186__
      __HTML_TAG_187__
        这允许您指定时区的偏移，而不是使用 __HTML_TAG_188__timeZone__HTML_TAG_189__ 参数。
      __HTML_TAG_190__
    __HTML_TAG_191__
    __HTML_TAG_192__
      __HTML_TAG_193____HTML_TAG_194__waitForCompletion__HTML_TAG_195____HTML_TAG_196__
      __HTML_TAG_197__
        如果 __HTML_TAG_198__true__HTML_TAG_199__,当前 cron 作业完成时不会执行任何其他实例。任何在当前 cron 作业运行时排程的新执行将被完全跳过。
      __HTML_TAG_200__
    __HTML_TAG_201__
    __HTML_TAG_202__
      __HTML_TAG_203____HTML_TAG_204__disabled__HTML_TAG_205____HTML_TAG_206__
      __HTML_TAG_207__
       这表示是否会执行作业。
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

可以访问和控制已声明的 cron 作业，或者动态创建 cron 作业（其中 cron 模式在 runtime 定义），使用 __HTML_TAG_212__Dynamic API__HTML_TAG_213__。要访问已声明的 cron 作业，需要将作业与名称关联，通过在可选 options 对象中传递 `EventEmitterReadinessWatcher` 属性作为装饰器的第二个参数。

#### 声明性间隔

要声明一个方法将在指定的间隔运行，prefix 方法定义与 `onApplicationBootstrap` 装饰器。将间隔值作为毫秒数传递给装饰器，如下所示：

```typescript
@OnEvent('order.created')
handleOrderCreatedEvent(payload: OrderCreatedEvent) {
  // handle and process "OrderCreatedEvent" event
}

```

> info **Hint** 这个机制使用了 JavaScript 的 `onApplicationBootstrap` 函数。您也可以使用 cron 作业来计划重复的作业。

如果您想从外部控制声明性间隔，使用以下构造法将间隔与名称关联：

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

如果出现异常，将被记录到控制台，因为每个带有 __INLINE_CODE_51__ 装饰器的方法都自动被包装在 __INLINE_CODE_52__ 块中。

__HTML_TAG_216__Dynamic API__HTML_TAG_217__ 也启用了 **创建** 动态间隔，where the interval 的 properties 在 runtime 定义，以及 **listing 和 deleting** 它们。

__HTML_TAG_218____HTML_TAG_219__

#### 声明性超时

要声明一个方法将在指定的超时后运行，prefix 方法定义与 __INLINE_CODE_53__ 装饰器。将相对时间偏移量（以毫秒为单位）从应用程序启动到装饰器中，如下所示：

```typescript
@OnEvent('order.created', { async: true })
handleOrderCreatedEvent(payload: OrderCreatedEvent) {
  // handle and process "OrderCreatedEvent" event
}

```

> info **Hint** 这个机制使用了 JavaScript 的 __INLINE_CODE_54__ 函数。

如果出现异常，将被记录到控制台，因为每个带有 __INLINE_CODE_55__ 装饰器的方法都自动被包装在 __INLINE_CODE_56__ 块中。

如果您想从外部控制声明性超时，使用以下构造法将超时与名称关联：

```typescript
@OnEvent('order.*')
handleOrderEvents(payload: OrderCreatedEvent | OrderRemovedEvent | OrderUpdatedEvent) {
  // handle and process an event
}

```

__HTML_TAG_222__Dynamic API__HTML_TAG_223__ 也启用了 **创建** 动态超时，where the timeout 的 properties 在 runtime 定义，以及 **listing 和 deleting**它们。

#### 动态调度模块 API

__INLINE_CODE_57__ 模块提供了一个动态 API，enables managing 声明性 __HTML_TAG_224__cron 作业__HTML_TAG_225__, __HTML_TAG_226__timeouts__HTML_TAG_227__ 和 __HTML_TAG_228__intervals__HTML_TAG_229__. API 也启用了创建和管理 **动态** cron 作业、超时和间隔，where the properties 在 runtime 定义。

#### 动态 cron 作业

获取一个 __INLINE_CODE_58__ 实例的引用，使用名称从您的代码任何地方获取，使用 __INLINEHere is the translation of the provided English technical documentation to Chinese:

__INLINE_CODE_63__ 方法返回指定的 cron 作业。返回的 __INLINE_CODE_64__ 对象具有以下方法：

- __INLINE_CODE_65__ - 停止一个定时任务。
- __INLINE_CODE_66__ - 重新启动一个已停止的任务。
- __INLINE_CODE_67__ - 停止一个任务，设置新的时间，然后启动它。
- __INLINE_CODE_68__ - 返回一个 __INLINE_CODE_69__ 对象，表示最后一次任务执行的日期。
- __INLINE_CODE_70__ - 返回一个 __INLINE_CODE_71__ 对象，表示下一次任务执行的日期。
- __INLINE_CODE_72__ - 提供一个 __INLINE_CODE_73__ 大小的 __INLINE_CODE_74__ 数组，表示将要触发任务执行的日期集。 __INLINE_CODE_75__ 默认为 0，返回一个空数组。

> info **Hint** 使用 __INLINE_CODE_76__ 方法将 __INLINE_CODE_77__ 对象转换为 JavaScript 日期的等效对象。

**创建** 一个新的 cron 作业动态地使用 __INLINE_CODE_78__ 方法，以下所示：

__CODE_BLOCK_12__

在这个代码中，我们使用 __INLINE_CODE_79__ 对象从 __INLINE_CODE_80__ 包中创建 cron 作业。 __INLINE_CODE_81__ 构造函数接受一个 cron 模式（与 __INLINE_CODE_82__ 装饰器相同）作为其第一个参数，以及当 cron 定时器触发时要执行的回调函数作为其第二个参数。 __INLINE_CODE_83__ 方法接受两个参数：cron 作业的名称和 __INLINE_CODE_85__ 对象本身。

> warning **Warning** 记住在访问 __INLINE_CODE_86__ 之前需要将其注入。从 __INLINE_CODE_87__ 包中导入 __INLINE_CODE_88__。

**删除** 一个名为 cron 作业使用 __INLINE_CODE_89__ 方法，以下所示：

__CODE_BLOCK_13__

**列出** 所有 cron 作业使用 __INLINE_CODE_90__ 方法，以下所示：

__CODE_BLOCK_14__

__INLINE_CODE_91__ 方法返回一个 __INLINE_CODE_92__ 对象。在这个代码中，我们遍历 map 并尝试访问每个 __INLINE_CODE_94__ 对象的 __INLINE_CODE_95__ 方法。在 __INLINE_CODE_96__ API 中，如果任务已经执行并且没有将来执行日期，它将抛出异常。

#### 动态间隔

获取一个间隔的引用使用 __INLINE_CODE_96__ 方法。像上面一样，使用标准构造函数注入 __INLINE_CODE_97__：

__CODE_BLOCK_15__

并使用它如下所示：

__CODE_BLOCK_16__

**创建** 一个新的间隔动态地使用 __INLINE_CODE_98__ 方法，以下所示：

__CODE_BLOCK_17__

在这个代码中，我们创建了一个标准的 JavaScript 间隔，然后将其传递给 __INLINE_CODE_99__ 方法。该方法接受两个参数：间隔的名称和间隔本身。

**删除** 一个名为间隔使用 __INLINE_CODE_100__ 方法，以下所示：

__CODE_BLOCK_18__

**列出** 所有间隔使用 __INLINE_CODE_101__ 方法，以下所示：

__CODE_BLOCK_19__

#### 动态超时

获取一个超时的引用使用 __INLINE_CODE_102__ 方法。像上面一样，使用标准构造函数注入 __INLINE_CODE_103__：

__CODE_BLOCK_20__

并使用它如下所示：

__CODE_BLOCK_21__

**创建** 一个新的超时动态地使用 __INLINE_CODE_104__ 方法，以下所示：

__CODE_BLOCK_22__

在这个代码中，我们创建了一个标准的 JavaScript 超时，然后将其传递给 __INLINE_CODE_105__ 方法。该方法接受两个参数：超时的名称和超时本身。

**删除** 一个名为超时使用 __INLINE_CODE_106__ 方法，以下所示：

__CODE_BLOCK_23__

**列出** 所有超时使用 __INLINE_CODE_107__ 方法，以下所示：

__CODE_BLOCK_24__

#### 示例

一个工作示例可在 __LINK_235__ 中找到。