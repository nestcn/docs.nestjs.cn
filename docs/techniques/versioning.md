<!-- 此文件从 content/techniques/versioning.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:58:51.540Z -->
<!-- 源文件: content/techniques/versioning.md -->

### 版本控制

> 提示 **Hint** 这一章节仅适用于基于 HTTP 的应用程序。

版本控制允许您在同一个应用程序中运行不同的控制器或单个路由版本。应用程序变化非常频繁，Breaking changes 是常见的，您需要支持以前版本的应用程序。

支持 4 种版本控制：

__HTML_TAG_60__
  __HTML_TAG_61__
    __HTML_TAG_62____HTML_TAG_63____HTML_TAG_64__URI 版本控制__HTML_TAG_65____HTML_TAG_66____HTML_TAG_67__
    __HTML_TAG_68__版本将在请求的 URI 中传递（默认）__HTML_TAG_69__
  __HTML_TAG_70__
  __HTML_TAG_71__
    __HTML_TAG_72____HTML_TAG_73____HTML_TAG_74__头部 版本控制__HTML_TAG_75____HTML_TAG_76____HTML_TAG_77__
    __HTML_TAG_78__自定义请求头将指定版本__HTML_TAG_79__
  __HTML_TAG_80__
  __HTML_TAG_81__
    __HTML_TAG_82____HTML_TAG_83____HTML_TAG_84__媒体类型 版本控制__HTML_TAG_85____HTML_TAG_86____HTML_TAG_87__
    __HTML_TAG_88__请求的 __HTML_TAG_89__Accept__HTML_TAG_90__ 头将指定版本__HTML_TAG_91__
  __HTML_TAG_92__
  __HTML_TAG_93__
    __HTML_TAG_94____HTML_TAG_95____HTML_TAG_96__自定义 版本控制__HTML_TAG_97____HTML_TAG_98____HTML_TAG_99__
    __HTML_TAG_100__请求中的任何方面都可以用于指定版本(s)。一个自定义函数提供了将 said 版本(s) 提取到的能力__HTML_TAG_101__
  __HTML_TAG_102__
__HTML_TAG_103__

#### URI 版本控制类型

URI 版本控制使用请求的 URI 中传递的版本，例如 __INLINE_CODE_10__ 和 __INLINE_CODE_11__。

> 警告 **Notice** 使用 URI 版本控制时，版本将自动添加到 URI 中，位于 __HTML_TAG_104__ 全局路径前缀__HTML_TAG_105__ (如果存在)和路由路径之前。

要为您的应用程序启用 URI 版本控制，请执行以下操作：

```bash
$ npm install --save @nestjs/schedule

```

> 警告 **Notice** URI 中的版本将自动以 __INLINE_CODE_12__ 为前缀（默认），但是前缀值可以通过将 __INLINE_CODE_13__ 键设置为所需的前缀或 __INLINE_CODE_14__ 以禁用它。

> 提示 **Hint** __INLINE_CODE_15__ 枚举可以用于 __INLINE_CODE_16__ 属性，并且来自 __INLINE_CODE_17__ 包。

#### 头部 版本控制类型

头部 版本控制使用自定义的请求头指定版本，头部的值将是请求的版本。

示例 HTTP 请求头部：

要为您的应用程序启用 **头部 版本控制，请执行以下操作：

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

__INLINE_CODE_18__ 属性应该是包含请求版本的头部名称。

> 提示 **Hint** __INLINE_CODE_19__ 枚举可以用于 __INLINE_CODE_20__ 属性，并且来自 __INLINE_CODE_21__ 包。

#### 媒体类型 版本控制类型

媒体类型 版本控制使用请求的 __INLINE_CODE_22__ 头指定版本。

在 __INLINE_CODE_23__ 头中，版本将与媒体类型分隔，使用 __INLINE_CODE_24__。它应该包含一个 key-value 对象，该对象表示请求的版本，例如 `@nestjs/schedule`。键被视为前缀，当确定版本时将包括键和分隔符。

要为您的应用程序启用 **媒体类型 版本控制，请执行以下操作：

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

`ScheduleModule` 属性应该是包含版本的 key-value 对象键和分隔符。例如，如果使用 `AppModule`，那么 `forRoot()` 属性将设置为 `.forRoot()`。

> 提示 **Hint** `onApplicationBootstrap` 枚举可以用于 `@Cron()` 属性，并且来自 `handleCron()` 包。

#### 自定义 版本控制类型

自定义 版本控制使用请求中的任何方面指定版本（或版本）。 incoming 请求将使用一个 `45` 函数，该函数返回字符串或字符串数组。

如果请求者提供多个版本，extractor 函数可以返回字符串数组，按顺序从高版本到低版本排序。版本将与路由排序从高版本到低版本。

如果从 `@Cron()` 返回空字符串或数组，路由将不匹配，并返回 404。

例如，如果 incoming 请求指定支持版本 `*`、`1-3,5` 和 `*/2`，那么 `45 * * * * *` **MUST** 返回 `@nestjs/schedule`。这确保了选择最高可能的路由版本。If versions `handleCron()` are extracted, but routes only exist for version `30` and `@Cron()`, the route that matches version `try-catch` is selected (version `Date` is automatically ignored).

> 提示 **注意** 选择最高匹配版本基于 `@Cron()` 返回的数组不靠谱地工作在 Express 适配器中由于设计限制。单个版本（字符串或数组的1个元素）在 Express 中工作正常。Fastify 正确支持最高匹配版本选择和单个版本选择。

要启用 **自定义版本** 对你的应用程序，创建一个 `@Cron(new Date(Date.now() + 10 * 1000))` 函数，并将其传递给应用程序，如下所示：

```typescript

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

```

#### 使用

版本允许您版本化控制器、单个路由，还提供了一种方式使某些资源排除版本化。版本的使用方式无论你的应用程序使用的版本类型为何都是一样的。

> 提示 **注意** 如果应用程序启用版本化，但控制器或路由未指定版本，那么对该控制器/路由的任何请求将返回 `@Cron()` 响应状态。类似地，如果收到包含不对应控制器或路由的版本的请求，也将返回 `name` 响应状态。

#### 控制器版本

可以将版本应用于控制器，使控制器中的所有路由继承该版本。

要将版本添加到控制器，请执行以下操作：

```typescript

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

```

#### 路由版本

可以将版本应用于单个路由。该版本将Override任何其他版本对该路由的影响，例如控制器版本。

要将版本添加到单个路由，请执行以下操作：

```typescript

```typescript
@Interval(10000)
handleInterval() {
  this.logger.debug('Called every 10 seconds');
}

```

```

#### 多个版本

可以将多个版本应用于控制器或路由。要使用多个版本，您将设置版本为数组。

要添加多个版本，请执行以下操作：

```typescript

```typescript
@Interval('notifications', 2500)
handleInterval() {}

```

```

#### 版本“中立”

有些控制器或路由不关心版本，并且在任何版本下都具有相同的功能。为了满足这种情况，可以将版本设置为 `@Interval()` 符号。

incoming 请求将被映射到 `setInterval()` 控制器或路由，无论请求中包含的版本是什么，或者如果请求中不包含版本。

> 提示 **注意** 对于 URI 版本化，如果 `@Interval()` 资源不包含版本在 URI 中。

要添加中立控制器或路由，请执行以下操作：

```typescript

```typescript
@Timeout(5000)
handleTimeout() {
  this.logger.debug('Called once after 5 seconds');
}

```

```

#### 全局默认版本

如果您不想为每个控制器或单个路由提供版本，或者想将特定版本设置为每个控制器/路由都没有版本指定的默认版本，可以将 `try-catch` 设置为以下所示：

```typescript

```typescript
@Timeout('notifications', 2500)
handleTimeout() {}

```

```

#### 中间件版本化

__LINK_106__ 也可以使用版本化元数据来配置中间件为特定路由的版本。要做到这一点，请将版本号作为 `@Timeout()` 方法的参数之一：

```typescript

```typescript
constructor(private schedulerRegistry: SchedulerRegistry) {}

```

```

使用上面的代码，`setTimeout()`仅将应用于版本”2”的 `@Timeout()`终点。

> 信息 **注意** 中间件与本节中描述的任何版本类型（`try-catch`、`@nestjs/schedule`、`CronJob` 或 `SchedulerRegistry`）都兼容。