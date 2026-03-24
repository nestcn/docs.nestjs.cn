### 任务调度

任务调度允许您安排任意代码（方法/函数）在固定的日期/时间、重复的间隔或指定的间隔后执行一次。在 Linux 世界中，这通常由操作系统级别的 [cron](https://en.wikipedia.org/wiki/Cron) 等包处理。对于 Node.js 应用程序，有几个包可以模拟类似 cron 的功能。Nest 提供了 `@nestjs/schedule` 包，它与流行的 Node.js [cron](https://github.com/kelektiv/node-cron) 包集成。我们将在本章中介绍这个包。

#### 安装

要开始使用它，我们首先安装所需的依赖项。

```bash
$ npm install --save @nestjs/schedule

```

要激活作业调度，将 `ScheduleModule` 导入到根 `AppModule` 中并运行 `forRoot()` 静态方法，如下所示：

```typescript
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot()
  ],
})
export class AppModule {}

```

`.forRoot()` 调用初始化调度程序并注册应用程序中存在的任何声明性 <a href="techniques/task-scheduling#声明式-cron-任务">cron 作业</a>、<a href="techniques/task-scheduling#声明式超时">超时</a> 和 <a href="techniques/task-scheduling#声明式间隔任务">间隔</a>。注册发生在 `onApplicationBootstrap` 生命周期钩子发生时，确保所有模块都已加载并声明了任何计划的作业。

#### 声明式 cron 任务

cron 作业安排任意函数（方法调用）自动运行。Cron 作业可以运行：

- 一次，在指定的日期/时间。
- 定期；定期作业可以在指定的时间间隔内的指定时刻运行（例如，每小时一次、每周一次、每 5 分钟一次）

通过在包含要执行的代码的方法定义之前使用 `@Cron()` 装饰器来声明 cron 作业，如下所示：

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  @Cron('45 * * * * *')
handleCron() {
    this.logger.debug('Called when the current second is 45');
  }
}

```

在这个例子中，`handleCron()` 方法将在当前秒为 `45` 时被调用。换句话说，该方法将每分钟运行一次，在 45 秒标记处。

`@Cron()` 装饰器支持以下标准 [cron 模式](http://crontab.org/)：

- 星号（例如 `*`）
- 范围（例如 `1-3,5`）
- 步骤（例如 `*/2`）

在上面的例子中，我们向装饰器传递了 `45 * * * * *`。以下键显示了 cron 模式字符串中每个位置的解释：

<pre class="language-javascript"><code class="language-javascript">
* * * * * *
| | | | | |
| | | | | day of week
| | | | months
| | | day of month
| | hours
| minutes
seconds (optional)
</code></pre>

一些示例 cron 模式：

<table>
  <tbody>
    <tr>
      <td><code>* * * * * *</code></td>
      <td>每秒</td>
    </tr>
    <tr>
      <td><code>45 * * * * *</code></td>
      <td>每分钟，在第 45 秒</td>
    </tr>
    <tr>
      <td><code>0 10 * * * *</code></td>
      <td>每小时，在第 10 分钟开始时</td>
    </tr>
    <tr>
      <td><code>0 */30 9-17 * * *</code></td>
      <td>上午 9 点到下午 5 点之间每 30 分钟</td>
    </tr>
   <tr>
      <td><code>0 30 11 * * 1-5</code></td>
      <td>周一至周五上午 11:30</td>
    </tr>
  </tbody>
</table>

`@nestjs/schedule` 包提供了一个方便的枚举，包含常用的 cron 模式。您可以如下使用此枚举：

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  @Cron(CronExpression.EVERY_30_SECONDS)
handleCron() {
    this.logger.debug('Called every 30 seconds');
  }
}

```

在这个例子中，`handleCron()` 方法将每 `30` 秒被调用一次。如果发生异常，它将被记录到控制台，因为每个用 `@Cron()` 注释的方法都会自动包装在 `try-catch` 块中。

或者，您可以向 `@Cron()` 装饰器提供一个 JavaScript `Date` 对象。这样做会导致作业在指定的日期恰好执行一次。

:::info 提示
使用 JavaScript 日期算术来安排相对于当前日期的作业。例如，`@Cron(new Date(Date.now() + 10 * 1000))` 安排作业在应用程序启动后 10 秒运行。
:::

此外，您可以提供其他选项作为 `@Cron()` 装饰器的第二个参数。

<table>
  <tbody>
    <tr>
      <td><code>name</code></td>
      <td>
        用于在声明后访问和控制 cron 作业。
      </td>
    </tr>
    <tr>
      <td><code>timeZone</code></td>
      <td>
        指定执行的时区。这将相对于您的时区修改实际时间。如果时区无效，将抛出错误。您可以在 <a href="http://momentjs.com/timezone/">Moment Timezone</a> 网站上检查所有可用的时区。
      </td>
    </tr>
    <tr>
      <td><code>utcOffset</code></td>
      <td>
        这允许您指定时区的偏移量，而不是使用 <code>timeZone</code> 参数。
      </td>
    </tr>
    <tr>
      <td><code>waitForCompletion</code></td>
      <td>
        如果为 <code>true</code>，则在当前 onTick 回调完成之前，不会运行 cron 作业的其他实例。在当前 cron 作业运行时发生的任何新的计划执行将被完全跳过。
      </td>
    </tr>
    <tr>
      <td><code>disabled</code></td>
      <td>
       这表示作业是否会被执行。
      </td>
    </tr>
  </tbody>
</table>

```typescript
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class NotificationService {
  @Cron('* * 0 * * *', {
    name: 'notifications',
    timeZone: 'Europe/Paris',
  })
  triggerNotifications() {}
}

```

您可以在声明后访问和控制 cron 作业，或使用 <a href="/techniques/task-scheduling#动态调度模块-api">动态 API</a> 动态创建 cron 作业（其 cron 模式在运行时定义）。要通过 API 访问声明式 cron 作业，您必须通过在装饰器的第二个参数的可选选项对象中传递 `name` 属性来将作业与名称相关联。

#### 声明式间隔任务

要声明一个方法应该在（重复的）指定间隔运行，请在方法定义前加上 `@Interval()` 装饰器。将间隔值（以毫秒为单位的数字）传递给装饰器，如下所示：

```typescript
@Interval(10000)
handleInterval() {
  this.logger.debug('Called every 10 seconds');
}

```

:::info 提示
此机制在底层使用 JavaScript `setInterval()` 函数。您也可以利用 cron 作业来安排定期作业。
:::

如果您想通过 <a href="/techniques/task-scheduling#动态调度模块-api">动态 API</a> 从声明类外部控制声明式间隔，请使用以下构造将间隔与名称相关联：

```typescript
@Interval('notifications', 2500)
handleInterval() {}

```

如果发生异常，它将被记录到控制台，因为每个用 `@Interval()` 注释的方法都会自动包装在 `try-catch` 块中。

<a href="techniques/task-scheduling#动态间隔">动态 API</a> 还支持**创建**动态间隔，其中间隔的属性在运行时定义，以及**列出和删除**它们。

<app-banner-enterprise></app-banner-enterprise>

#### 声明式超时

要声明一个方法应该在指定的超时后（一次）运行，请在方法定义前加上 `@Timeout()` 装饰器。将相对时间偏移（以毫秒为单位）从应用程序启动传递给装饰器，如下所示：

```typescript
@Timeout(5000)
handleTimeout() {
  this.logger.debug('Called once after 5 seconds');
}

```

:::info 提示
此机制在底层使用 JavaScript `setTimeout()` 函数。
:::

如果发生异常，它将被记录到控制台，因为每个用 `@Timeout()` 注释的方法都会自动包装在 `try-catch` 块中。

如果您想通过 <a href="/techniques/task-scheduling#动态调度模块-api">动态 API</a> 从声明类外部控制声明式超时，请使用以下构造将超时与名称相关联：

```typescript
@Timeout('notifications', 2500)
handleTimeout() {}

```

<a href="techniques/task-scheduling#动态超时">动态 API</a> 还支持**创建**动态超时，其中超时的属性在运行时定义，以及**列出和删除**它们。

#### 动态调度模块 API

`@nestjs/schedule` 模块提供了一个动态 API，用于管理声明式 <a href="techniques/task-scheduling#声明式-cron-任务">cron 作业</a>、<a href="techniques/task-scheduling#声明式超时">超时</a> 和 <a href="techniques/task-scheduling#声明式间隔任务">间隔</a>。API 还支持创建和管理**动态** cron 作业、超时和间隔，其中属性在运行时定义。

#### 动态 cron 作业

使用 `SchedulerRegistry` API 从代码中的任何位置按名称获取对 `CronJob` 实例的引用。首先，使用标准构造函数注入来注入 `SchedulerRegistry`：

```typescript
constructor(private schedulerRegistry: SchedulerRegistry) {}

```

:::info 提示
从 `@nestjs/schedule` 包中导入 `SchedulerRegistry`。
:::

然后在类中如下使用它。假设使用以下声明创建了一个 cron 作业：

```typescript
@Cron('* * 8 * * *', {
  name: 'notifications',
})
triggerNotifications() {}

```

使用以下方法访问此作业：

```typescript
const job = this.schedulerRegistry.getCronJob('notifications');

job.stop();
console.log(job.lastDate());

```

`getCronJob()` 方法返回命名的 cron 作业。返回的 `CronJob` 对象具有以下方法：

- `stop()` - 停止计划运行的作业。
- `start()` - 重新启动已停止的作业。
- `setTime(time: CronTime)` - 停止作业，为其设置新时间，然后启动它
- `lastDate()` - 返回作业上次执行的日期的 `DateTime` 表示。
- `nextDate()` - 返回作业下次执行计划的日期的 `DateTime` 表示。
- `nextDates(count: number)` - 提供 `DateTime` 表示的数组（大小为 `count`），用于将触发作业执行的下一组日期。`count` 默认为 0，返回空数组。

:::info 提示
在 `DateTime` 对象上使用 `toJSDate()` 将它们呈现为与此 DateTime 等效的 JavaScript Date。
:::

使用 `SchedulerRegistry#addCronJob` 方法动态**创建**新的 cron 作业，如下所示：

```typescript
addCronJob(name: string, seconds: string) {
  const job = new CronJob(`${seconds} * * * * *`, () => {
    this.logger.warn(`time (${seconds}) for job ${name} to run!`);
  });

  this.schedulerRegistry.addCronJob(name, job);
  job.start();

  this.logger.warn(
    `job ${name} added for each minute at ${seconds} seconds!`,
  );
}

```

在这段代码中，我们使用 `cron` 包中的 `CronJob` 对象来创建 cron 作业。`CronJob` 构造函数的第一个参数是 cron 模式（就像 `@Cron()` <a href="techniques/task-scheduling#声明式-cron-任务">装饰器</a>），第二个参数是当 cron 计时器触发时要执行的回调。`SchedulerRegistry#addCronJob` 方法接受两个参数：`CronJob` 的名称和 `CronJob` 对象本身。

:::warning 警告
记住在访问 `SchedulerRegistry` 之前注入它。从 `cron` 包导入 `CronJob`。
:::

使用 `SchedulerRegistry#deleteCronJob` 方法**删除**命名的 cron 作业，如下所示：

```typescript
deleteCron(name: string) {
  this.schedulerRegistry.deleteCronJob(name);
  this.logger.warn(`job ${name} deleted!`);
}

```

使用 `SchedulerRegistry#getCronJobs` 方法**列出**所有 cron 作业，如下所示：

```typescript
getCrons() {
  const jobs = this.schedulerRegistry.getCronJobs();
  jobs.forEach((value, key, map) => {
    let next;
    try {
      next = value.nextDate().toJSDate();
    } catch (e) {
      next = 'error: next fire date is in the past!';
    }
    this.logger.log(`job: ${key} -> next: ${next}`);
  });
}

```

`getCronJobs()` 方法返回一个 `map`。在这段代码中，我们遍历 map 并尝试访问每个 `CronJob` 的 `nextDate()` 方法。在 `CronJob` API 中，如果作业已经触发并且没有未来的触发日期，它会抛出异常。

#### 动态间隔

使用 `SchedulerRegistry#getInterval` 方法获取对间隔的引用。如上所述，使用标准构造函数注入来注入 `SchedulerRegistry`：

```typescript
constructor(private schedulerRegistry: SchedulerRegistry) {}

```

并如下使用它：

```typescript
const interval = this.schedulerRegistry.getInterval('notifications');
clearInterval(interval);

```

使用 `SchedulerRegistry#addInterval` 方法动态**创建**新的间隔，如下所示：

```typescript
addInterval(name: string, milliseconds: number) {
  const callback = () => {
    this.logger.warn(`Interval ${name} executing at time (${milliseconds})!`);
  };

  const interval = setInterval(callback, milliseconds);
  this.schedulerRegistry.addInterval(name, interval);
}

```

在这段代码中，我们创建一个标准的 JavaScript 间隔，然后将其传递给 `SchedulerRegistry#addInterval` 方法。
该方法接受两个参数：间隔的名称和间隔本身。

使用 `SchedulerRegistry#deleteInterval` 方法**删除**命名的间隔，如下所示：

```typescript
deleteInterval(name: string) {
  this.schedulerRegistry.deleteInterval(name);
  this.logger.warn(`Interval ${name} deleted!`);
}

```

使用 `SchedulerRegistry#getIntervals` 方法**列出**所有间隔，如下所示：

```typescript
getIntervals() {
  const intervals = this.schedulerRegistry.getIntervals();
  intervals.forEach(key => this.logger.log(`Interval: ${key}`));
}

```

#### 动态超时

使用 `SchedulerRegistry#getTimeout` 方法获取对超时的引用。如上所述，使用标准构造函数注入来注入 `SchedulerRegistry`：

```typescript
constructor(private readonly schedulerRegistry: SchedulerRegistry) {}

```

并如下使用它：

```typescript
const timeout = this.schedulerRegistry.getTimeout('notifications');
clearTimeout(timeout);

```

使用 `SchedulerRegistry#addTimeout` 方法动态**创建**新的超时，如下所示：

```typescript
addTimeout(name: string, milliseconds: number) {
  const callback = () => {
    this.logger.warn(`Timeout ${name} executing after (${milliseconds})!`);
  };

  const timeout = setTimeout(callback, milliseconds);
  this.schedulerRegistry.addTimeout(name, timeout);
}

```

在这段代码中，我们创建一个标准的 JavaScript 超时，然后将其传递给 `SchedulerRegistry#addTimeout` 方法。
该方法接受两个参数：超时的名称和超时本身。

使用 `SchedulerRegistry#deleteTimeout` 方法**删除**命名的超时，如下所示：

```typescript
deleteTimeout(name: string) {
  this.schedulerRegistry.deleteTimeout(name);
  this.logger.warn(`Timeout ${name} deleted!`);
}

```

使用 `SchedulerRegistry#getTimeouts` 方法**列出**所有超时，如下所示：

```typescript
getTimeouts() {
  const timeouts = this.schedulerRegistry.getTimeouts();
  timeouts.forEach(key => this.logger.log(`Timeout: ${key}`));
}

```

#### 示例

一个工作示例可在 [这里](https://github.com/nestjs/nest/tree/master/sample/27-scheduling) 找到。