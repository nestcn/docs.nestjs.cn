<!-- 此文件从 content/techniques/versioning.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T04:50:01.874Z -->
<!-- 源文件: content/techniques/versioning.md -->

### 版本控制

> info **提示** 这一章节仅适用于基于 HTTP 的应用程序。

版本控制允许您在同一个应用程序中运行多个版本的控制器或单个路由。应用程序变化非常频繁，需要支持之前的应用程序版本，而同时也需要对应用程序进行更新。

支持四种版本控制类型：

__HTML_TAG_60__
  __HTML_TAG_61__
    __HTML_TAG_62____HTML_TAG_63____HTML_TAG_64__URI 版本控制__HTML_TAG_65____HTML_TAG_66____HTML_TAG_67__
    __HTML_TAG_68__版本将在请求 URI 中传递（默认）__HTML_TAG_69__
  __HTML_TAG_70__
  __HTML_TAG_71__
    __HTML_TAG_72____HTML_TAG_73____HTML_TAG_74__Header 版本控制__HTML_TAG_75____HTML_TAG_76____HTML_TAG_77__
    __HTML_TAG_78__自定义请求头将指定版本__HTML_TAG_79__
  __HTML_TAG_80__
  __HTML_TAG_81__
    __HTML_TAG_82____HTML_TAG_83____HTML_TAG_84__Media Type 版本控制__HTML_TAG_85____HTML_TAG_86____HTML_TAG_87__
    __HTML_TAG_88__请求的 Accept 头将指定版本__HTML_TAG_91__
  __HTML_TAG_92__
  __HTML_TAG_93__
    __HTML_TAG_94____HTML_TAG_95____HTML_TAG_96__自定义版本控制__HTML_TAG_97____HTML_TAG_98____HTML_TAG_99__
    __HTML_TAG_100__请求中的任何方面都可以用于指定版本(s)。提供了一个自定义函数来提取这些版本(s)__HTML_TAG_101__
  __HTML_TAG_102__
__HTML_TAG_103__

#### URI 版本控制类型

URI 版本控制使用请求 URI 中传递的版本，例如__INLINE_CODE_10__和__INLINE_CODE_11__。

> warning **注意** 使用 URI 版本控制时，版本将自动添加到 URI 中，位于全局路径前缀__HTML_TAG_104__ (如果存在)和控制器或路由路径之前。

要为您的应用程序启用 URI 版本控制，请执行以下步骤：

```bash
$ npm install --save @nestjs/schedule

```

> warning **注意** URI 中的版本将自动添加__INLINE_CODE_12__前缀，然而前缀值可以通过设置__INLINE_CODE_13__键来配置或__INLINE_CODE_14__以禁用它。

> info **提示** __INLINE_CODE_15__枚举可用于__INLINE_CODE_16__属性，并从__INLINE_CODE_17__包中导入。

#### Header 版本控制类型

Header 版本控制使用自定义的请求头来指定版本，其中头的值将用于指定版本。

示例 HTTP 请求：

要为您的应用程序启用**Header 版本控制**，请执行以下步骤：

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

__INLINE_CODE_18__属性应该是包含版本的请求头名称。

> info **提示** __INLINE_CODE_19__枚举可用于__INLINE_CODE_20__属性，并从__INLINE_CODE_21__包中导入。

#### Media Type 版本控制类型

Media Type 版本控制使用请求的__INLINE_CODE_22__头来指定版本。

在__INLINE_CODE_23__头中，版本将与媒体类型使用分号__INLINE_CODE_24__分隔，例如`@nestjs/schedule`。键被视为前缀，用于确定版本。

要为您的应用程序启用**Media Type 版本控制**，请执行以下步骤：

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

`ScheduleModule`属性应该是包含版本的键-值对的键和分隔符。例如`AppModule`，`forRoot()`属性将设置为`.forRoot()`。

> info **提示** `onApplicationBootstrap`枚举可用于`@Cron()`属性，并从`handleCron()`包中导入。

#### 自定义版本控制类型

自定义版本控制使用请求中的任何方面来指定版本（或版本）。incoming 请求将被分析使用`45`函数，该函数返回字符串或字符串数组。

如果请求中指定了多个版本，`45`函数可以返回字符串数组，按降序排序（最高版本到最低版本）。版本将与路由匹配，从最高到最低。

如果从`@Cron()`函数返回空字符串或数组，路由将不匹配，并返回 404。

例如，如果 incoming 请求指定支持版本`*`、`1-3,5`和`*/2`，`45 * * * * *` **MUST** 返回`@nestjs/schedule`。这确保了选择最高可能的路由版本。If versions `handleCron()` are extracted, but routes only exist for version `30` and `@Cron()`, the route that matches version `try-catch` is selected (version `Date` is automatically ignored).

> 警告 **注意** 根据 `@Cron()` 返回的数组选择最高匹配版本可能不靠谱地工作在 Express 适配器中，因为设计限制。单个版本（字符串或长度为 1 的数组）在 Express 中工作正常。Fastify 正确支持最高匹配版本选择和单个版本选择。

要为应用程序启用 **自定义版本**，创建一个 `@Cron(new Date(Date.now() + 10 * 1000))` 函数并将其传递给应用程序，例如：

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

#### 使用

版本控制允许您版本控制器、单个路由和某些资源 opt-out 版本控制。无论应用程序使用哪种版本类型，您的版本使用方式都相同。

> 警告 **注意** 如果应用程序启用了版本控制，但控制器或路由没有指定版本，那么对该控制器/路由的任何请求将返回 `@Cron()` 响应状态。同样，如果接收到包含不具有对应控制器或路由的版本的请求，也将返回 `name` 响应状态。

#### 控制器版本

可以将版本应用于控制器，使得该控制器中的所有路由继承该版本。

要将版本添加到控制器中，请执行以下操作：

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

#### 路由版本

可以将版本应用于单个路由。这将覆盖任何影响该路由的其他版本，例如控制器版本。

要将版本添加到单个路由中，请执行以下操作：

```typescript
@Interval(10000)
handleInterval() {
  this.logger.debug('Called every 10 seconds');
}

```

#### 多个版本

可以将多个版本应用于控制器或路由。要使用多个版本，需要将版本设置为数组。

要添加多个版本，请执行以下操作：

```typescript
@Interval('notifications', 2500)
handleInterval() {}

```

#### 中立版本

某些控制器或路由可能不在乎版本，并且它们在不考虑版本时具有相同的功能。为了满足这个需求，可以将版本设置为 `@Interval()` 符号。

incoming 请求将被映射到 `setInterval()` 控制器或路由，无论请求中包含的版本是什么，或者请求中不包含版本。

> 警告 **注意** 对于 URI 版本控制，一些资源将没有版本出现在 URI 中。

要添加中立控制器或路由，请执行以下操作：

```typescript
@Timeout(5000)
handleTimeout() {
  this.logger.debug('Called once after 5 seconds');
}

```

#### 全局默认版本

如果您不想为每个控制器或单个路由提供版本，或者您想为不包含版本的控制器或路由设置特定的版本，可以将 `try-catch` 设置为以下内容：

```typescript
@Timeout('notifications', 2500)
handleTimeout() {}

```

#### 中间件版本控制

__LINK_106__ 也可以使用版本控制元数据来配置中间件以适应特定路由的版本。要做到这一点，请将版本号作为 `@Timeout()` 方法的参数之一提供：

```typescript
constructor(private schedulerRegistry: SchedulerRegistry) {}

```

在上述代码中，`setTimeout()` 将只适用于 `@Timeout()` 端点的版本 '2'。

> 信息 **注意** 中间件与本节中描述的任何版本类型（`try-catch`、`@nestjs/schedule`、`CronJob` 或 `SchedulerRegistry`）都可以工作。