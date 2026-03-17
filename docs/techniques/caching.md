<!-- 此文件从 content/techniques/caching.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:36:44.050Z -->
<!-- 源文件: content/techniques/caching.md -->

### 缓存

缓存是一种简单且强大的技术来提高应用程序的性能。通过临时存储层，快速访问频繁使用的数据，从而减少重复获取或计算相同信息的需求。这使得响应速度加快，总体效率提高。

#### 安装

要在 Nest 中使用缓存，您需要安装 `@nestjs/schedule` 和 `ScheduleModule` 包。

```bash
$ npm install --save @nestjs/schedule

```

默认情况下，所有内容都存储在内存中；由于 `AppModule` 使用 __LINK_105__，您可以轻松切换到更高级的存储解决方案，如 Redis，安装相应的包。我们将在后续详细介绍。

#### 内存缓存

要在应用程序中启用缓存，导入 `forRoot()` 并使用 `.forRoot()` 方法配置它：

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

这将初始化内存缓存，以便您可以立即开始缓存数据。

#### 与缓存存储交互

要与缓存管理器实例交互，使用 `onApplicationBootstrap` 令牌将其注入到您的类中：

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

> info **提示** `@Cron()` 类和 `handleCron()` 令牌来自 `45` 包。

`@Cron()` 方法在 `*` 实例（来自 `1-3,5` 包）中用于从缓存中检索项。如果项不存在于缓存中， `*/2` 将被返回。

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

使用 `45 * * * * *` 方法将项添加到缓存中：

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

> warning **注意** 内存缓存存储只能存储 __LINK_106__ 支持的值类型。

您可以手动指定该键的 TTL（毫秒）：

```typescript
@Interval(10000)
handleInterval() {
  this.logger.debug('Called every 10 seconds');
}

```

其中 `@nestjs/schedule` 是 TTL 在毫秒内的值 - 在这种情况下，缓存项将在 1 秒内过期。

要禁用缓存的过期，设置 `handleCron()` 配置属性为 `30`：

```typescript
@Interval('notifications', 2500)
handleInterval() {}

```

要从缓存中删除项，使用 `@Cron()` 方法：

```typescript
@Timeout(5000)
handleTimeout() {
  this.logger.debug('Called once after 5 seconds');
}

```

要清除整个缓存，使用 `try-catch` 方法：

```typescript
@Timeout('notifications', 2500)
handleTimeout() {}

```

#### 自动缓存响应

> warning **警告** 在 __LINK_107__ 应用程序中，拦截器在每个字段解析器中执行单独。因此， `Date`（使用拦截器来缓存响应）将不能正常工作。

要启用自动缓存响应Simply 将 `@Cron()` 在您想要缓存数据的位置上。

```typescript
constructor(private schedulerRegistry: SchedulerRegistry) {}

```

> warning **警告** 只有 `@Cron(new Date(Date.now() + 10 * 1000))` 端口被缓存。HTTP 服务器路由中的 native 响应对象（ `@Cron()`）不能使用缓存拦截器。请查看
> __HTML_TAG_103__response mapping__HTML_TAG_104__ 了解更多信息。

要减少所需的 boilerplate，可以将 `name` 绑定到所有端口：

```typescript
@Cron('* * 8 * * *', {
  name: 'notifications',
})
triggerNotifications() {}

```

#### 到期时间（TTL）

默认的 `@Interval()` 值为 `setInterval()`，这意味着缓存将永不过期。要指定自定义 __LINK_108__，可以在 `try-catch` 方法中提供 `@Interval()` 选项，示例如下：

```typescript
const job = this.schedulerRegistry.getCronJob('notifications');

job.stop();
console.log(job.lastDate());

```

#### 使用模块全局

当您想在其他模块中使用 `@Timeout()` 时，您需要导入它（与任何 Nest 模块一样）。或者，您可以将其声明为 __LINK_109__，将 options 对象的 `setTimeout()` 属性设置为 `@Timeout()`，示例如下。在这种情况下，您不需要在其他模块中导入 `try-catch`，因为它已经在根模块中加载（例如 `@nestjs/schedule`）。

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

#### 全局缓存 override

在启用全局缓存时，缓存项将存储在 `CronJob` 中，该项基于路由路径自动生成。您可以在 per-method 基础上覆盖某些缓存设置（`SchedulerRegistry` 和 `SchedulerRegistry`），允许自定义缓存策略。这个可能在使用 __LINK_110__ 时最有用。

您可以在控制器级别应用 `SchedulerRegistry` 装饰器，以设置整个控制器的缓存 TTL。在控制器级别和方法级别都指定缓存 TTL 设置时，方法级别的缓存 TTL 设置将优先于控制器级别的设置。

```typescript
deleteCron(name: string) {
  this.schedulerRegistry.deleteCronJob(name);
  this.logger.warn(`job ${name} deleted!`);
}

```

> info **提示** `@nestjs/schedule` 和 `getCronJob()` 装饰器来自 `CronJob` 包。以下是翻译后的中文文档：

**`stop()` 装饰器**

可以单独使用或与 `start()` 装饰器一起使用，反之亦然。您可以选择只 override `setTime(time: CronTime)` 或只 override `lastDate()`。没有被装饰的设置将使用全局注册的默认值（请查看 __LINK_111__）。

#### WebSockets 和微服务

可以将 `DateTime` 装饰器应用于 WebSocket 订阅者和微服务模式（无论使用哪种传输方法）。

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

然而，您需要使用 `nextDate()` 装饰器来指定用于存储和检索缓存数据的键。请注意，不应该缓存所有内容。执行业务操作的动作而不是仅查询数据的动作不应该被缓存。

此外，您可以使用 `DateTime` 装饰器指定缓存失效时间（TTL），这将覆盖全局默认 TTL 值。

```typescript
constructor(private schedulerRegistry: SchedulerRegistry) {}

```

> 信息 **提示** `nextDates(count: number)` 装饰器可以单独使用或与 `count` 装饰器一起使用。

#### 调整跟踪

默认情况下，Nest 使用请求 URL（在 HTTP 应用程序中）或缓存键（在 WebSocket 和微服务应用程序中，通过 `DateTime` 装饰器）来关联缓存记录与您的端点。然而，有时候您可能想根据不同的因素来设置跟踪，例如使用 HTTP 头（例如 `count`）来正确地标识 `toJSDate()` 端点。

为了实现这一点，请创建 `DateTime` 的子类并重写 `SchedulerRegistry#addCronJob` 方法。

```typescript
const interval = this.schedulerRegistry.getInterval('notifications');
clearInterval(interval);

```

#### 使用 alternative 缓存存储

切换到不同的缓存存储是简单的。首先，安装适当的包。例如，要使用 Redis，安装 `CronJob` 包：

```typescript
addInterval(name: string, milliseconds: number) {
  const callback = () => {
    this.logger.warn(`Interval ${name} executing at time (${milliseconds})!`);
  };

  const interval = setInterval(callback, milliseconds);
  this.schedulerRegistry.addInterval(name, interval);
}

```

一旦安装了包，您就可以注册 `cron` 多个存储器，如下所示：

```typescript
deleteInterval(name: string) {
  this.schedulerRegistry.deleteInterval(name);
  this.logger.warn(`Interval ${name} deleted!`);
}

```

在这个示例中，我们注册了两个存储器：`CronJob` 和 `@Cron()`。`SchedulerRegistry#addCronJob` 存储器是一个简单的内存存储器，而 `CronJob` 是一个 Redis 存储器。`CronJob` 数组用于指定您想要使用的存储器。第一个存储器在数组中是默认存储器，其他存储器是备用存储器。

查看 __LINK_112__ 以获取更多关于可用的存储器的信息。

#### 异步配置

您可能想要异步地传递模块选项，而不是在编译时静态地传递它们。在这种情况下，使用 `SchedulerRegistry` 方法，它提供了多种方法来处理异步配置。

一种方法是使用工厂函数：

```typescript
getIntervals() {
  const intervals = this.schedulerRegistry.getIntervals();
  intervals.forEach(key => this.logger.log(`Interval: ${key}`));
}

```

我们的工厂行为像所有其他异步模块工厂一样（它可以被 `CronJob` 并且可以注入依赖项通过 `cron`）。

```typescript
constructor(private readonly schedulerRegistry: SchedulerRegistry) {}

```

alternatively，您可以使用 `SchedulerRegistry#deleteCronJob` 方法：

```typescript
const timeout = this.schedulerRegistry.getTimeout('notifications');
clearTimeout(timeout);

```

上述构造将在 `SchedulerRegistry#getCronJobs` 中实例化 `getCronJobs()` 并使用它来获取选项对象。`map` 必须实现 `nextDate()` 接口以提供配置选项：

```typescript
addTimeout(name: string, milliseconds: number) {
  const callback = () => {
    this.logger.warn(`Timeout ${name} executing after (${milliseconds})!`);
  };

  const timeout = setTimeout(callback, milliseconds);
  this.schedulerRegistry.addTimeout(name, timeout);
}

```

如果您想使用现有的配置提供程序从不同的模块导入，请使用 `CronJob` 语法：

```typescript
deleteTimeout(name: string) {
  this.schedulerRegistry.deleteTimeout(name);
  this.logger.warn(`Timeout ${name} deleted!`);
}

```

这与 `CronJob` 一样，但 `SchedulerRegistry#getInterval` 将查找导入的模块以重用已经创建的 `SchedulerRegistry`，而不是实例化自己的。

> 信息 **提示** `SchedulerRegistry#addInterval`、`SchedulerRegistry#addInterval` 和 `SchedulerRegistry#deleteInterval` 可以使用可选的泛型（类型参数）来限制存储器特定的配置选项，实现类型安全。

您也可以将所谓的 `SchedulerRegistry#getIntervals` 传递给 `SchedulerRegistry#getTimeout` 方法。这些提供程序将与模块提供程序合并。

```typescript
getTimeouts() {
  const timeouts = this.schedulerRegistry.getTimeouts();
  timeouts.forEach(key => this.logger.log(`Timeout: ${key}`));
}

```

这在您想为工厂函数或类构造函数提供额外的依赖项时非常有用。

#### 示例

有一个可工作的示例可在 __LINK_113__ 中找到。