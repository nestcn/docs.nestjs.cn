### 任务调度

任务调度允许您安排任意代码（方法/函数）在固定日期/时间、按重复间隔或在指定间隔后执行一次。在 Linux 领域，这通常由操作系统层面的 [cron](https://en.wikipedia.org/wiki/Cron) 等包处理。对于 Node.js 应用，有多个包可模拟类似 cron 的功能。Nest 提供了 `@nestjs/schedule` 包，它与流行的 Node.js[cron](https://github.com/kelektiv/node-cron) 包集成。我们将在本章介绍这个包。

#### 安装

要开始使用它，我们首先需要安装所需的依赖项。

```bash
$ npm install --save @nestjs/schedule
```

要激活任务调度功能，请将 `ScheduleModule` 导入根模块 `AppModule`，并运行如下所示的 `forRoot()` 静态方法：

```typescript
@@filename(app.module)
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot()
  ],
})
export class AppModule {}
```

`.forRoot()` 调用会初始化调度器并注册应用中所有声明式的 [cron 任务](techniques/task-scheduling#declarative-cron-jobs) 、 [超时任务](techniques/task-scheduling#declarative-timeouts) 和 [间隔任务](techniques/task-scheduling#declarative-intervals) 。注册过程发生在 `onApplicationBootstrap` 生命周期钩子触发时，确保所有模块都已加载并声明了计划任务。

#### 声明式 cron 任务

cron 任务会调度任意函数（方法调用）自动执行。cron 任务可以：

- 在指定日期/时间运行一次。
- 定期执行；周期性任务可以在指定的时间间隔内运行（例如每小时一次、每周一次、每 5 分钟一次）

使用 `@Cron()` 装饰器在包含待执行代码的方法定义前声明定时任务，如下所示：

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

在此示例中，每当当前秒数为 `45` 时，`handleCron()` 方法就会被调用。换句话说，该方法将在每分钟的第 45 秒运行一次。

`@Cron()` 装饰器支持以下标准 [cron 表达式](http://crontab.org/) ：

- 星号（例如 `*`）
- 范围（例如 `1-3,5`）
- 步长（例如 `*/2`）

在上面的示例中，我们向装饰器传递了 `45 * * * * *`。下表展示了 cron 模式字符串中每个位置的解析方式：

```javascript

* * * * * *
| | | | | |
| | | | | day of week
| | | | months
| | | day of month
| | hours
| minutes
seconds (optional)
```

一些示例的 cron 模式包括：

<table data-immersive-translate-walked="a5580e6d-0330-44d3-ad6a-c19183cbebc3"><tbody data-immersive-translate-walked="a5580e6d-0330-44d3-ad6a-c19183cbebc3"><tr data-immersive-translate-walked="a5580e6d-0330-44d3-ad6a-c19183cbebc3"><td data-immersive-translate-walked="a5580e6d-0330-44d3-ad6a-c19183cbebc3">* * * * * *</td><td data-immersive-translate-walked="a5580e6d-0330-44d3-ad6a-c19183cbebc3" data-immersive-translate-paragraph="1">每秒</td></tr><tr data-immersive-translate-walked="a5580e6d-0330-44d3-ad6a-c19183cbebc3"><td data-immersive-translate-walked="a5580e6d-0330-44d3-ad6a-c19183cbebc3">45 * * * * *</td><td data-immersive-translate-walked="a5580e6d-0330-44d3-ad6a-c19183cbebc3" data-immersive-translate-paragraph="1">每分钟，在第45秒</td></tr><tr data-immersive-translate-walked="a5580e6d-0330-44d3-ad6a-c19183cbebc3"><td data-immersive-translate-walked="a5580e6d-0330-44d3-ad6a-c19183cbebc3">0 10 * * * *</td><td data-immersive-translate-walked="a5580e6d-0330-44d3-ad6a-c19183cbebc3" data-immersive-translate-paragraph="1">每小时，在第10分钟开始时</td></tr><tr data-immersive-translate-walked="a5580e6d-0330-44d3-ad6a-c19183cbebc3"><td data-immersive-translate-walked="a5580e6d-0330-44d3-ad6a-c19183cbebc3">0 */30 9-17 * * *</td><td data-immersive-translate-walked="a5580e6d-0330-44d3-ad6a-c19183cbebc3" data-immersive-translate-paragraph="1">上午9点至下午5点之间每30分钟一次</td></tr><tr data-immersive-translate-walked="a5580e6d-0330-44d3-ad6a-c19183cbebc3"><td data-immersive-translate-walked="a5580e6d-0330-44d3-ad6a-c19183cbebc3">0 30 11 * * 1-5</td><td data-immersive-translate-walked="a5580e6d-0330-44d3-ad6a-c19183cbebc3" data-immersive-translate-paragraph="1">周一至周五上午11:30</td></tr></tbody></table>

`@nestjs/schedule` 包提供了一个包含常用 cron 模式的便捷枚举。您可以按如下方式使用此枚举：

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

在此示例中，`handleCron()` 方法将每 `30` 秒调用一次。如果发生异常，它将被记录到控制台，因为每个用 `@Cron()` 注解的方法都会自动包装在 `try-catch` 代码块中。

或者，你也可以向 `@Cron()` 装饰器传入一个 JavaScript 的 `Date` 对象。这样做会使任务在指定日期精确执行一次。

> **提示** 使用 JavaScript 日期运算来安排相对于当前日期的任务。例如， `@Cron(new Date(Date.now() + 10 * 1000))` 可以让任务在应用启动 10 秒后运行。

此外，你还可以将额外选项作为第二个参数传给 `@Cron()` 装饰器。

<table data-immersive-translate-walked="a5580e6d-0330-44d3-ad6a-c19183cbebc3"><tbody data-immersive-translate-walked="a5580e6d-0330-44d3-ad6a-c19183cbebc3"><tr data-immersive-translate-walked="a5580e6d-0330-44d3-ad6a-c19183cbebc3"><td data-immersive-translate-walked="a5580e6d-0330-44d3-ad6a-c19183cbebc3">name</td><td data-immersive-translate-walked="a5580e6d-0330-44d3-ad6a-c19183cbebc3" data-immersive-translate-paragraph="1">这在声明后访问和控制 cron 任务时非常有用。</td></tr><tr data-immersive-translate-walked="a5580e6d-0330-44d3-ad6a-c19183cbebc3"><td data-immersive-translate-walked="a5580e6d-0330-44d3-ad6a-c19183cbebc3">timeZone</td><td data-immersive-translate-walked="a5580e6d-0330-44d3-ad6a-c19183cbebc3" data-immersive-translate-paragraph="1">指定执行时区。这将根据您的时区调整实际时间。若时区无效，将抛出错误。您可在 Moment Timezone 网站查看所有可用时区。</td></tr><tr data-immersive-translate-walked="a5580e6d-0330-44d3-ad6a-c19183cbebc3"><td data-immersive-translate-walked="a5580e6d-0330-44d3-ad6a-c19183cbebc3">utcOffset</td><td data-immersive-translate-walked="a5580e6d-0330-44d3-ad6a-c19183cbebc3" data-immersive-translate-paragraph="1">此选项允许您直接指定时区偏移量，而无需使用 timeZone 参数。</td></tr><tr data-immersive-translate-walked="a5580e6d-0330-44d3-ad6a-c19183cbebc3"><td data-immersive-translate-walked="a5580e6d-0330-44d3-ad6a-c19183cbebc3">waitForCompletion</td><td data-immersive-translate-walked="a5580e6d-0330-44d3-ad6a-c19183cbebc3" data-immersive-translate-paragraph="1">若设为 true，当前 onTick 回调完成前将不会运行该定时任务的其他实例。当前任务执行期间所有新触发的计划执行都将被跳过。</td></tr><tr data-immersive-translate-walked="a5580e6d-0330-44d3-ad6a-c19183cbebc3"><td data-immersive-translate-walked="a5580e6d-0330-44d3-ad6a-c19183cbebc3">disabled</td><td data-immersive-translate-walked="a5580e6d-0330-44d3-ad6a-c19183cbebc3" data-immersive-translate-paragraph="1">此参数表示该任务是否会被执行。</td></tr></tbody></table>

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

您可以在声明后访问和控制 cron 任务，或者通过[动态 API](/techniques/task-scheduling#dynamic-schedule-module-api) 动态创建 cron 任务（其 cron 模式在运行时定义）。要通过 API 访问声明式 cron 任务，您必须通过装饰器的第二个可选参数对象中的 `name` 属性为任务关联名称。

#### 声明式间隔任务

要声明某个方法应以（重复的）指定间隔运行，请在方法定义前添加 `@Interval()` 装饰器。如下所示，将间隔值（以毫秒为单位的数字）传递给装饰器：

```typescript
@Interval(10000)
handleInterval() {
  this.logger.debug('Called every 10 seconds');
}
```

> **提示** 此机制底层使用 JavaScript 的 `setInterval()` 函数。您也可以使用 cron 任务来安排重复作业。

若要通过[动态 API](/techniques/task-scheduling#dynamic-schedule-module-api) 在声明类外部控制声明式间隔，请使用以下构造将间隔与名称关联：

```typescript
@Interval('notifications', 2500)
handleInterval() {}
```

如果发生异常，它将被记录到控制台，因为每个用 `@Interval()` 注解的方法都会自动包裹在 `try-catch` 代码块中。

[动态 API](techniques/task-scheduling#dynamic-intervals) 还支持**创建**动态间隔（其属性在运行时定义），以及**列出和删除**这些间隔。

#### 声明式超时

要在指定超时时间运行（一次）方法，请在方法定义前添加 `@Timeout()` 装饰器。如下所示，将相对于应用启动的时间偏移量（以毫秒为单位）传递给装饰器：

```typescript
@Timeout(5000)
handleTimeout() {
  this.logger.debug('Called once after 5 seconds');
}
```

> **提示** 该机制底层使用了 JavaScript 的 `setTimeout()` 函数。

如果发生异常，它将被记录到控制台，因为每个用 `@Timeout()` 注解的方法都会自动被包裹在 `try-catch` 代码块中。

若要通过[动态 API](/techniques/task-scheduling#dynamic-schedule-module-api) 在声明类外部控制声明式超时，请使用以下构造将超时与名称关联：

```typescript
@Timeout('notifications', 2500)
handleTimeout() {}
```

[动态 API](techniques/task-scheduling#dynamic-timeouts) 还支持**创建**动态超时，其属性在运行时定义，并能**列出和删除**这些超时。

#### 动态调度模块 API

`@nestjs/schedule` 模块提供的动态 API 可管理声明式[定时任务](techniques/task-scheduling#declarative-cron-jobs) 、 [超时](techniques/task-scheduling#declarative-timeouts)和[间隔](techniques/task-scheduling#declarative-intervals) 。该 API 还支持创建和管理**动态**定时任务、超时及间隔，这些元素的属性均在运行时定义。

#### 动态定时任务

通过 `SchedulerRegistry` API，你可以在代码的任何位置根据名称获取 `CronJob` 实例的引用。首先，使用标准的构造函数注入方式注入 `SchedulerRegistry`：

```typescript
constructor(private schedulerRegistry: SchedulerRegistry) {}
```

> **提示** 从 `@nestjs/schedule` 包中导入 `SchedulerRegistry`。

然后在类中按如下方式使用。假设已通过以下声明创建了一个 cron job：

```typescript
@Cron('* * 8 * * *', {
  name: 'notifications',
})
triggerNotifications() {}
```

通过以下方式访问该 job：

```typescript
const job = this.schedulerRegistry.getCronJob('notifications');

job.stop();
console.log(job.lastDate());
```

`getCronJob()` 方法返回指定名称的定时任务。返回的 `CronJob` 对象包含以下方法：

- `stop()` - 停止已计划运行的任务。
- `start()` - 重新启动已停止的任务。
- `setTime(time: CronTime)` - 停止任务，为其设置新的时间，然后重新启动
- `lastDate()` - 返回作业最后一次执行日期的 `DateTime` 表示形式。
- `nextDate()` - 返回作业下一次计划执行日期的 `DateTime` 表示形式。
- `nextDates(count: number)` - 提供一组（大小为 `count`）`DateTime` 表示形式，包含接下来会触发作业执行的日期集合。`count` 默认为 0，此时返回空数组。

> info **提示** 在 `DateTime` 对象上使用 `toJSDate()` 可将其渲染为与此 DateTime 等效的 JavaScript Date 对象。

**创建**一个新的定时任务，可通过动态调用 `SchedulerRegistry#addCronJob` 方法实现，如下所示：

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

在这段代码中，我们使用 `CronJob` 对象（来自 `cron` 包）来创建定时任务。`CronJob` 构造函数接收两个参数：第一个是 cron 表达式（与 `@Cron()` [装饰器](techniques/task-scheduling#declarative-cron-jobs)的格式相同），第二个是定时触发器触发时执行的回调函数。`SchedulerRegistry#addCronJob` 方法同样接收两个参数：定时任务的名称和 `CronJob` 对象本身。

> **警告** 请记得在使用前先注入 `SchedulerRegistry`。同时需要从 `cron` 包中导入 `CronJob`。

**删除**指定名称的定时任务可通过 `SchedulerRegistry#deleteCronJob` 方法实现，如下所示：

```typescript
deleteCron(name: string) {
  this.schedulerRegistry.deleteCronJob(name);
  this.logger.warn(`job ${name} deleted!`);
}
```

**列出**所有使用 `SchedulerRegistry#getCronJobs` 方法的定时任务：

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

`getCronJobs()` 方法返回一个 `map`。在这段代码中，我们遍历该映射并尝试访问每个 `CronJob` 的 `nextDate()` 方法。在 `CronJob` API 中，如果任务已触发且没有未来的触发日期，则会抛出异常。

#### 动态间隔

通过 `SchedulerRegistry#getInterval` 方法获取间隔引用。如上所述，使用标准构造函数注入 `SchedulerRegistry`：

```typescript
constructor(private schedulerRegistry: SchedulerRegistry) {}
```

使用方法如下：

```typescript
const interval = this.schedulerRegistry.getInterval('notifications');
clearInterval(interval);
```

使用 `SchedulerRegistry#addInterval` 方法**动态创建**新定时器，如下所示：

```typescript
addInterval(name: string, milliseconds: number) {
  const callback = () => {
    this.logger.warn(`Interval ${name} executing at time (${milliseconds})!`);
  };

  const interval = setInterval(callback, milliseconds);
  this.schedulerRegistry.addInterval(name, interval);
}
```

在这段代码中，我们创建了一个标准的 JavaScript 定时器，然后将其传递给 `SchedulerRegistry#addInterval` 方法。该方法接收两个参数：定时器名称和定时器实例本身。

使用 `SchedulerRegistry#deleteInterval` 方法**删除**已命名的定时器，如下所示：

```typescript
deleteInterval(name: string) {
  this.schedulerRegistry.deleteInterval(name);
  this.logger.warn(`Interval ${name} deleted!`);
}
```

**列出**所有使用 `SchedulerRegistry#getIntervals` 方法的间隔如下：

```typescript
getIntervals() {
  const intervals = this.schedulerRegistry.getIntervals();
  intervals.forEach(key => this.logger.log(`Interval: ${key}`));
}
```

#### 动态超时

通过 `SchedulerRegistry#getTimeout` 方法获取超时引用。如上所述，使用标准构造函数注入 `SchedulerRegistry`：

```typescript
constructor(private readonly schedulerRegistry: SchedulerRegistry) {}
```

并按如下方式使用：

```typescript
const timeout = this.schedulerRegistry.getTimeout('notifications');
clearTimeout(timeout);
```

**创建**一个新的动态超时，使用 `SchedulerRegistry#addTimeout` 方法，如下所示：

```typescript
addTimeout(name: string, milliseconds: number) {
  const callback = () => {
    this.logger.warn(`Timeout ${name} executing after (${milliseconds})!`);
  };

  const timeout = setTimeout(callback, milliseconds);
  this.schedulerRegistry.addTimeout(name, timeout);
}
```

在这段代码中，我们创建了一个标准的 JavaScript 超时，然后将其传递给 `SchedulerRegistry#addTimeout` 方法。该方法接收两个参数：超时名称和超时实例本身。

**删除**一个命名超时，使用 `SchedulerRegistry#deleteTimeout` 方法，如下所示：

```typescript
deleteTimeout(name: string) {
  this.schedulerRegistry.deleteTimeout(name);
  this.logger.warn(`Timeout ${name} deleted!`);
}
```

**列出**所有超时，使用 `SchedulerRegistry#getTimeouts` 方法，如下所示：

```typescript
getTimeouts() {
  const timeouts = this.schedulerRegistry.getTimeouts();
  timeouts.forEach(key => this.logger.log(`Timeout: ${key}`));
}
```

#### 示例

一个可用的示例[在此处](https://github.com/nestjs/nest/tree/master/sample/27-scheduling)查看。
