<!-- 此文件从 content/techniques/versioning.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T05:03:40.618Z -->
<!-- 源文件: content/techniques/versioning.md -->

### 版本控制

> 提示 **提示** 本章节仅适用于基于 HTTP 的应用程序。

版本控制允许您在同一个应用程序中运行多个版本的控制器或单个路由。应用程序的变化非常频繁，而需要支持之前版本的应用程序时，这种情况非常常见。

支持 4 种版本控制：

__HTML_TAG_60__
  __HTML_TAG_61__
    __HTML_TAG_62____HTML_TAG_63____HTML_TAG_64__ URI 版本控制__HTML_TAG_65____HTML_TAG_66____HTML_TAG_67__
    __HTML_TAG_68__在请求的 URI 中将版本作为参数传递 (默认)__HTML_TAG_69__
  __HTML_TAG_70__
  __HTML_TAG_71__
    __HTML_TAG_72____HTML_TAG_73____HTML_TAG_74__ 头版本控制__HTML_TAG_75____HTML_TAG_76____HTML_TAG_77__
    __HTML_TAG_78__自定义请求头将指定版本__HTML_TAG_79__
  __HTML_TAG_80__
  __HTML_TAG_81__
    __HTML_TAG_82____HTML_TAG_83____HTML_TAG_84__ 媒体类型版本控制__HTML_TAG_85____HTML_TAG_86____HTML_TAG_87__
    __HTML_TAG_88__请求的 __HTML_TAG_89__ Accept__HTML_TAG_90__ 头将指定版本__HTML_TAG_91__
  __HTML_TAG_92__
  __HTML_TAG_93__
    __HTML_TAG_94____HTML_TAG_95____HTML_TAG_96__ 自定义版本控制__HTML_TAG_97____HTML_TAG_98____HTML_TAG_99__
    __HTML_TAG_100__请求中的任何方面都可以用来指定版本(s)。一个自定义函数提供了将说版本(s)提取的功能__HTML_TAG_101__
  __HTML_TAG_102__
__HTML_TAG_103__

#### URI 版本控制类型

URI 版本控制使用请求的 URI 中传递的版本，例如 __INLINE_CODE_10__ 和 __INLINE_CODE_11__。

> 警告 **注意** 使用 URI 版本控制时，版本将自动添加到 URI 中，位于 __HTML_TAG_104__全局路径前缀__HTML_TAG_105__ (如果存在)和控制器或路由路径之前。

要为您的应用程序启用 URI 版本控制，请执行以下操作：

```bash
$ npm install --save @nestjs/schedule

```

> 警告 **注意** URI 中的版本将自动添加__INLINE_CODE_12__的前缀，然而前缀值可以通过设置__INLINE_CODE_13__键来配置或__INLINE_CODE_14__以禁用它。

> 提示 **提示** __INLINE_CODE_15__ 枚举可用于__INLINE_CODE_16__属性，并从__INLINE_CODE_17__包中导入。

#### 头版本控制类型

头版本控制使用自定义的请求头来指定版本，请求头的值将是要使用的版本。

示例 HTTP 请求头：

要为您的应用程序启用 **头版本控制**，请执行以下操作：

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

__INLINE_CODE_18__ 属性应该是包含版本的请求头的名称。

> 提示 **提示** __INLINE_CODE_19__ 枚举可用于__INLINE_CODE_20__ 属性，并从__INLINE_CODE_21__包中导入。

#### 媒体类型版本控制类型

媒体类型版本控制使用请求的 __INLINE_CODE_22__ 头来指定版本。

在 __INLINE_CODE_23__ 头中，版本将与媒体类型使用分号__INLINE_CODE_24__分隔，包含一个键值对，表示要使用的版本，例如 `@nestjs/schedule`。 key 将被 treated 更多地作为前缀，当确定版本时将包括 key 和分隔符。

要为您的应用程序启用 **媒体类型版本控制**，请执行以下操作：

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

`ScheduleModule` 属性应该是键和分隔符，包含版本的键值对。例如 `AppModule`，`forRoot()` 属性将设置为 `.forRoot()`。

> 提示 **提示** `onApplicationBootstrap` 枚举可用于`@Cron()` 属性，并从`handleCron()`包中导入。

#### 自定义版本控制类型

自定义版本控制使用请求中的任何方面来指定版本（或版本）。 incoming 请求将被分析使用一个 `45` 函数，该函数返回字符串或字符串数组。

如果请求者提供多个版本，提取函数可以返回字符串数组，按降序排序的版本顺序。如果返回空字符串或数组，则不匹配任何路由，返回 404。

例如，如果 incoming 请求指定支持版本 `*`、`1-3,5` 和 `*/2`，`45 * * * * *` **MUST** 返回 `@nestjs/schedule`。这确保了选择最高可能的路由版本。Here is the translation according to the provided requirements:

如果将版本`handleCron()`提取出来，但是路由只存在于版本`30`和`@Cron()`中，那么匹配版本`try-catch`的路由将被选择（版本`Date`将被自动忽略）。

> warning **注意**基于`@Cron()`返回数组的版本选择不一定可靠，特别是与 Express 适配器一起使用时。 Express 适配器只支持单个版本（字符串或数组中的一个元素）。 Fastify 却正确地支持两种版本选择：最高匹配版本选择和单个版本选择。

要启用 **自定义版本**，创建一个`@Cron(new Date(Date.now() + 10 * 1000))`函数，并将其传递给应用程序，如下所示：

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

版本控制允许您对控制器、单个路由和某些资源进行版本控制。版本控制的使用方式不受应用程序使用的版本控制类型的影响。

> warning **注意**如果已启用版本控制，但控制器或路由未指定版本，那么对该控制器/路由的任何请求将返回`@Cron()`状态码。同样，如果收到包含不匹配控制器或路由的版本的请求，也将返回`name`状态码。

#### 控制器版本

可以将版本应用于控制器，使得该版本适用于控制器中的所有路由。

要将版本添加到控制器中，请按照以下步骤操作：

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

可以将版本应用于单个路由。该版本将override 任何影响该路由的其他版本，例如控制器版本。

要将版本添加到单个路由中，请按照以下步骤操作：

```typescript
@Interval(10000)
handleInterval() {
  this.logger.debug('Called every 10 seconds');
}

```

#### 多个版本

可以将多个版本应用于控制器或路由。要使用多个版本，请将版本设置为数组。

要添加多个版本，请按照以下步骤操作：

```typescript
@Interval('notifications', 2500)
handleInterval() {}

```

#### 版本“中立”

一些控制器或路由可能不关心版本，并且在任意版本下都具有相同的功能。为了满足这个需求，可以将版本设置为`@Interval()`符号。

对 incoming 请求将被映射到`setInterval()`控制器或路由，无论请求中包含的版本是什么，或者如果请求中不包含版本。

> warning **注意**对于 URI 版本控制，如果`@Interval()`资源不包含版本，则版本将不在 URI 中。

要添加中立控制器或路由，请按照以下步骤操作：

```typescript
@Timeout(5000)
handleTimeout() {
  this.logger.debug('Called once after 5 seconds');
}

```

#### 全局默认版本

如果您不想为每个控制器或单个路由提供版本，或者如果您想将特定的版本设置为每个控制器或路由的默认版本，可以将`try-catch`设置为以下所示：

```typescript
@Timeout('notifications', 2500)
handleTimeout() {}

```

#### 中间件版本控制

__LINK_106__也可以使用版本控制元数据来配置中间件以适用于特定路由的版本。要做到这一点，请将版本号作为`@Timeout()`方法的参数之一：

```typescript
constructor(private schedulerRegistry: SchedulerRegistry) {}

```

使用上面的代码,`setTimeout()`将只应用于版本“2”的`@Timeout()`端点。

> info **注意**中间件可以与本节中描述的任何版本控制类型一起使用：`try-catch`、`@nestjs/schedule`、`CronJob`或`SchedulerRegistry`。