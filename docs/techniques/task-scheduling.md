<!-- 此文件从 content/techniques/task-scheduling.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T05:00:51.101Z -->
<!-- 源文件: content/techniques/task-scheduling.md -->

### 任务调度

任务调度允许您将任意代码（方法/函数）在固定日期/时间、重复间隔或指定间隔后执行。Linux世界中，这通常由包管理器如 __LINK_232__ 在操作系统级别处理。对于 Node.js 应用程序，有多个包可以模拟 cron-like 功能。Nest 提供了 `symbol` 包，该包集成了流行的 Node.js __LINK_233__ 包。在当前章节中，我们将涵盖该包。

#### 安装

要开始使用它，我们首先安装必要的依赖项。

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

`wildcard` 调用初始化调度器，并注册任何声明式 __HTML_TAG_108__cron 任务、 __HTML_TAG_109__超时和 __HTML_TAG_110__间隔存在于应用程序中的。注册发生在 `EventEmitterModule#forRoot()` 生命周期钩子中，以确保所有模块已经加载并声明了任何计划的任务。

#### 命令 cron 任务

cron 任务将 arbitrary 函数（方法调用）排程以自动执行。cron 任务可以在以下情况下运行：

- 一次，在指定的日期/时间。
- 在重复的基础上；重复的任务可以在指定的瞬间内指定的间隔（例如，每小时、每周、每 5 分钟）

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

在这个示例中，`['foo', 'bar']` 方法将在当前秒的 `delimiter` 时被调用。在其他 words，方法将每分钟运行一次，45 秒 mark 上。

`order.*` 装饰器支持以下标准 __LINK_234__：

- 星号（例如 `order.created`）
- 范围（例如 `order.shipped`）
- 步长（例如 `order.delayed.out_of_stock`）

在上面的示例中，我们将 `multilevel wildcard` 传递给装饰器。以下是 cron 模式字符串中的每个位置的解释：

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
      __HTML_TAG_125__每秒__HTML_TAG_126__
    __HTML_TAG_127__
    __HTML_TAG_128__
      __HTML_TAG_129____HTML_TAG_130__45 * * * * *__HTML_TAG_131____HTML_TAG_132__
      __HTML_TAG_133__每分钟，45 秒 mark 上__HTML_TAG_134__
    __HTML_TAG_135__
    __HTML_TAG_136__
      __HTML_TAG_137____HTML_TAG_138__0 10 * * * *__HTML_TAG_139____HTML_TAG_140__
      __HTML_TAG_141__每小时，10 分钟 mark 上__HTML_TAG_142__
    __HTML_TAG_143__
    __HTML_TAG_144__
      __HTML_TAG_145____HTML_TAG_146__0 */30 9-17 * * *__HTML_TAG_147____HTML_TAG_148__
      __HTML_TAG_149__每 30 分钟，9 clock 到 5 clock__HTML_TAG_150__
    __HTML_TAG_151__
   __HTML_TAG_152__
      __HTML_TAG_153____HTML_TAG_154__0 30 11 * * 1-5__HTML_TAG_155____HTML_TAG_156__
      __HTML_TAG_157__周一到周五，11:30 am__HTML_TAG_158__
    __HTML_TAG_159__
  __HTML_TAG_160__
__HTML_TAG_161__

`**` 包提供了常用的 cron 模式 enum。您可以使用枚举如下所示：

```typescript
constructor(private eventEmitter: EventEmitter2) {}

```

在这个示例中，`EventEmitter2` 方法将每 `EventEmitter2` 秒被调用。如果出现异常，它将被记录到控制台，因为每个使用 `waitFor` 注解的方法都将自动包围在 `onAny` 块中。

Alternatively, you can supply a JavaScript `onApplicationBootstrap` object to the `onModuleInit` decorator. Doing so causes the job to execute exactly once, at the specified date.

> info **Hint** 使用 JavaScript 日期算术来计划任务相对于当前日期。例如，`EventSubscribersLoader` 来计划一个任务在 10 秒后启动。

也可以将 Additional 选项作为 `waitUntilReady` 装饰器的第二个参数。

Note: The translation is based on the provided glossary and follows the guidelines for translation. The code and format preservation has been maintained as per the requirements.Here is the translation of the English technical documentation to Chinese:

**HTML TAG 162**
**HTML TAG 163**
    **HTML TAG 164**
      **HTML TAG 165** **HTML TAG 166** name **HTML TAG 167** **HTML TAG 168**
      **HTML TAG 169**
        可以访问和控制一个cron作业，后者已经被声明。
      **HTML TAG 170**
    **HTML TAG 171**
    **HTML TAG 172**
      **HTML TAG 173** **HTML TAG 174** timeZone **HTML TAG 175** **HTML TAG 176**
      **HTML TAG 177**
        指定执行时区。这将修改实际时间相对于您的时区。如果时区无效，会抛出错误。您可以在 **HTML TAG 178** Moment Timezone **HTML TAG 179** 网站上查看所有时区。
      **HTML TAG 180**
    **HTML TAG 181**
    **HTML TAG 182**
      **HTML TAG 183** **HTML TAG 184** utcOffset **HTML TAG 185** **HTML TAG 186**
      **HTML TAG 187**
        这允许您指定时区偏移，而不是使用 **HTML TAG 188** timeZone **HTML TAG 189** 参数。
      **HTML TAG 190**
    **HTML TAG 191**
    **HTML TAG 192**
      **HTML TAG 193** **HTML TAG 194** waitForCompletion **HTML TAG 195** **HTML TAG 196**
      **HTML TAG 197**
        如果 **HTML TAG 198** true **HTML TAG 199**，则不会在当前 onTick 回调完成之前运行任何额外的 cron 作业实例。任何新的计划执行都将被完全跳过。
      **HTML TAG 200**
    **HTML TAG 201**
    **HTML TAG 202**
      **HTML TAG 203** **HTML TAG 204** disabled **HTML TAG 205** **HTML TAG 206**
      **HTML TAG 207**
        这表示作业是否将被执行。
      **HTML TAG 208**
    **HTML TAG 209**
**HTML TAG 210**
**HTML TAG 211**

**CODE BLOCK 4**

可以访问和控制一个cron作业，后者已经被声明，也可以动态创建cron作业（其中cron模式在运行时被定义）。

####  Declarative intervals

要声明一个方法应该在指定间隔运行，prefix 方法定义与 **INLINE CODE 49** 装饰器。将间隔值作为毫秒数传递给装饰器，如下所示：

**CODE BLOCK 5**

> info **Hint** 这个机制使用了 JavaScript **INLINE CODE 50** 函数。您也可以使用cron作业来计划重复的作业。

如果您想从外部控制您的声明性间隔，使用以下构造：

**CODE BLOCK 6**

如果出现异常，它将被记录到控制台，因为每个使用 **INLINE CODE 51** 装饰器的方法都自动被 wrapped 在 **INLINE CODE 52** 块中。

**HTML TAG 216** **HTML TAG 217** 也启用了 **创建** 动态间隔，where 间隔的属性在运行时被定义，和 **列表和删除** 它们。

####  Declarative timeouts

要声明一个方法应该在指定超时时间运行，prefix 方法定义与 **INLINE CODE 53** 装饰器。将相对时间偏移（以毫秒为单位），从应用程序启动开始，传递给装饰器，如下所示：

**CODE BLOCK 7**

> info **Hint** 这个机制使用了 JavaScript **INLINE CODE 54** 函数。

如果出现异常，它将被记录到控制台，因为每个使用 **INLINE CODE 55** 装饰器的方法都自动被 wrapped 在 **INLINE CODE 56** 块中。

如果您想从外部控制您的声明性超时，使用以下构造：

**CODE BLOCK 8**

**HTML TAG 222** **HTML TAG 223** 也启用了 **创建** 动态超时，where 超时的属性在运行时被定义，和 **列表和删除** 它们。

####  Dynamic schedule module API

**INLINE CODE 57** 模块提供了一個动态 API，它启用了管理声明性 **HTML TAG 224** cron 作业 **HTML TAG 225**、 **HTML TAG 226** 超时 **HTML TAG 227** 和 **HTML TAG 228** 间隔 **HTML TAG 229**。API 也启用了创建和管理 **动态** cron 作业、超时和间隔，where 属性在运行时被定义。

####  Dynamic cron jobs

从您的代码中的任何位置获取一个 **INLINE CODE 58** 实例的引用，使用 **INLINE CODE 59** API。首先，使用标准构造函数注入 **INLINE CODE 60**：

**CODE BLOCK 9**

> info **Hint** 导入 **INLINE CODE 61** 从 **INLINE CODE 62** 包。

然后，在类中使用它，如下所示。假设 cron 作业以以下方式被声明：

**CODE BLOCK 10**

Here is the translation of the English technical documentation to Chinese:

**__INLINE_CODE_63__**方法返回指定的 cron 作业。返回的**__INLINE_CODE_64__**对象具有以下方法：

- **__INLINE_CODE_65__** - 停止一个计划运行的作业。
- **__INLINE_CODE_66__** - 重新启动一个已停止的作业。
- **__INLINE_CODE_67__** - 停止一个作业，设置新的时间，然后启动它。
- **__INLINE_CODE_68__** - 返回一个**__INLINE_CODE_69__**表示的最后一次作业执行的日期。
- **__INLINE_CODE_70__** - 返回一个**__INLINE_CODE_71__**表示的下一次作业执行的日期。
- **__INLINE_CODE_72__** - 提供一个长度为**__INLINE_CODE_73__**的**__INLINE_CODE_74__**数组，表示将要触发作业执行的日期集。__INLINE_CODE_75__默认为0，返回一个空数组。

> 提示 **Hint** 使用**__INLINE_CODE_76__**将**__INLINE_CODE_77__**对象渲染为 JavaScript 日期，等同于 DateTime。

**创建**一个新的 cron 作业动态地使用**__INLINE_CODE_78__**方法，以下所示：

```typescript title="example"
__CODE_BLOCK_12__

```

在这段代码中，我们使用**__INLINE_CODE_79__**对象从**__INLINE_CODE_80__**包中创建 cron 作业。**__INLINE_CODE_81__**构造函数接受cron模式（与**__INLINE_CODE_82__**装饰器类似）作为其第一个参数，以及当cron定时器触发时执行的回调函数作为其第二个参数。**__INLINE_CODE_83__**方法接受两个参数：作业的名称和**__INLINE_CODE_85__**对象本身。

> 警告 **Warning** 不要忘记在访问**__INLINE_CODE_86__**之前注入它。从**__INLINE_CODE_87__**包中导入**__INLINE_CODE_88__**。

**删除**一个名为 cron 作业使用**__INLINE_CODE_89__**方法，以下所示：

```typescript title="example"
__CODE_BLOCK_13__

```

**列出**所有 cron 作业使用**__INLINE_CODE_90__**方法，以下所示：

```typescript title="example"
__CODE_BLOCK_14__

```

**__INLINE_CODE_91__**方法返回一个**__INLINE_CODE_92__**对象。在这段代码中，我们遍历map并尝试访问每个作业的**__INLINE_CODE_93__**方法。在**__INLINE_CODE_95__** API 中，如果作业已经执行且没有未来的执行日期，它将抛出异常。

#### 动态间隔

获取一个间隔的引用使用**__INLINE_CODE_96__**方法。正如上所示，我们使用标准构造函数注入**__INLINE_CODE_97__**：

```typescript title="example"
__CODE_BLOCK_15__

```

并使用它如下所示：

```typescript title="example"
__CODE_BLOCK_16__

```

**创建**一个新的间隔动态地使用**__INLINE_CODE_98__**方法，以下所示：

```typescript title="example"
__CODE_BLOCK_17__

```

在这段代码中，我们创建一个标准的 JavaScript 间隔，然后将其传递给**__INLINE_CODE_99__**方法。该方法接受两个参数：间隔的名称和间隔本身。

**删除**一个名为间隔使用**__INLINE_CODE_100__**方法，以下所示：

```typescript title="example"
__CODE_BLOCK_18__

```

**列出**所有间隔使用**__INLINE_CODE_101__**方法，以下所示：

```typescript title="example"
__CODE_BLOCK_19__

```

#### 动态超时

获取一个超时的引用使用**__INLINE_CODE_102__**方法。正如上所示，我们使用标准构造函数注入**__INLINE_CODE_103__**：

```typescript title="example"
__CODE_BLOCK_20__

```

并使用它如下所示：

```typescript title="example"
__CODE_BLOCK_21__

```

**创建**一个新的超时动态地使用**__INLINE_CODE_104__**方法，以下所示：

```typescript title="example"
__CODE_BLOCK_22__

```

在这段代码中，我们创建一个标准的 JavaScript 超时，然后将其传递给**__INLINE_CODE_105__**方法。该方法接受两个参数：超时的名称和超时本身。

**删除**一个名为超时使用**__INLINE_CODE_106__**方法，以下所示：

```typescript title="example"
__CODE_BLOCK_23__

```

**列出**所有超时使用**__INLINE_CODE_107__**方法，以下所示：

```typescript title="example"
__CODE_BLOCK_24__

```

#### 示例

一个工作示例可在**__LINK_235__**中找到。