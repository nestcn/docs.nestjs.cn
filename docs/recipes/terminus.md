---
title: terminus
---
<!-- 此文件从 content/recipes/terminus.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-12T13:42:20.325Z -->
<!-- 源文件: content/recipes/terminus.md -->

<!-- 此文件从 content/recipes/terminus.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-12T12:02:41.505Z -->
<!-- 源文件: content/recipes/terminus.md -->

<!-- 此文件从 content/recipes/terminus.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-12T12:02:29.224Z -->
<!-- 源文件: content/recipes/terminus.md -->

|------|------|
| `status` | 如果任何健康指示器失败，状态将为 `'error'`。如果 NestJS 应用程序正在关闭但仍接受 HTTP 请求，健康检查将具有 `'shutting_down'` 状态。 | `'error' \| 'ok' \| 'shutting_down'` |
| `info` | 包含每个状态为 `'up'`（即“健康”）的健康指示器的信息的对象。 | `object` |
| `error` | 包含每个状态为 `'down'`（即“不健康”）的健康指示器的信息的对象。 | `object` |
| `details` | 包含每个健康指示器的所有信息的对象 | `object` |

##### 检查特定的 HTTP 响应代码

在某些情况下，您可能需要检查特定条件并验证响应。例如，假设 `https://my-external-service.com` 返回响应代码 `204`。使用 `HttpHealthIndicator.responseCheck`，您可以专门检查该响应代码，并将所有其他代码确定为不健康。

如果返回除 `204` 以外的任何响应代码，以下示例将不健康。第三个参数要求您提供一个函数（同步或异步），该函数返回响应是否被视为健康 (`true`) 或不健康 (`false`)。

```typescript
// 在 `HealthController` 类中

@Get()
@HealthCheck()
check() {
  return this.health.check([
    () =>
      this.http.responseCheck(
        'my-external-service',
        'https://my-external-service.com',
        (res) => res.status === 204,
      ),
  ]);
}

```

#### TypeOrm 健康指示器

Terminus 提供了向健康检查添加数据库检查的功能。为了开始使用此健康指示器，您应该查看 [数据库章节](/techniques/sql)，并确保您的应用程序内的数据库连接已建立。

> 提示 **提示** 在后台，`TypeOrmHealthIndicator` 简单地执行 `SELECT 1`-SQL 命令，这通常用于验证数据库是否仍然存活。如果您使用的是 Oracle 数据库，它会使用 `SELECT 1 FROM DUAL`。

```typescript
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck('database'),
    ]);
  }
}

```

如果您的数据库可访问，当您使用 `GET` 请求请求 `http://localhost:3000/health` 时，您现在应该看到以下 JSON 结果：

```json
{
  "status": "ok",
  "info": {
    "database": {
      "status": "up"
    }
  },
  "error": {},
  "details": {
    "database": {
      "status": "up"
    }
  }
}

```

如果您的应用使用 [多个数据库](/techniques/sql#多个数据库)，您需要将每个连接注入到 `HealthController` 中。然后，您可以简单地将连接引用传递给 `TypeOrmHealthIndicator`。

```typescript
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    @InjectConnection('albumsConnection')
    private albumsConnection: Connection,
    @InjectConnection()
    private defaultConnection: Connection,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck('albums-database', { connection: this.albumsConnection }),
      () => this.db.pingCheck('database', { connection: this.defaultConnection }),
    ]);
  }
}

```

#### 磁盘健康指示器

使用 `DiskHealthIndicator`，我们可以检查使用了多少存储空间。要开始使用，请确保将 `DiskHealthIndicator` 注入到您的 `HealthController` 中。以下示例检查路径 `/`（或在 Windows 上使用 `C:\`）的存储使用情况。如果超过总存储空间的 50%，它将响应不健康的健康检查。

```typescript
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly disk: DiskHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.disk.checkStorage('storage', { path: '/', thresholdPercent: 0.5 }),
    ]);
  }
}

```

使用 `DiskHealthIndicator.checkStorage` 函数，您还可以检查固定数量的空间。以下示例在路径 `/my-app/` 超过 250GB 时将不健康。

```typescript
// 在 `HealthController` 类中

@Get()
@HealthCheck()
check() {
  return this.health.check([
    () => this.disk.checkStorage('storage', {  path: '/', threshold: 250 * 1024 * 1024 * 1024, })
  ]);
}

```

#### 内存健康指示器

为确保您的进程不超过特定的内存限制，可以使用 `MemoryHealthIndicator`。以下示例可用于检查进程的堆内存。

> 提示 **提示** 堆是动态分配内存所在的内存部分（即通过 malloc 分配的内存）。从堆分配的内存将保持分配状态，直到发生以下情况之一：
> - 内存被 _释放_
> - 程序终止

```typescript
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private memory: MemoryHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
    ]);
  }
}

```

您还可以使用 `MemoryHealthIndicator.checkRSS` 验证进程的内存 RSS。如果您的进程分配了超过 150MB，此示例将返回不健康的响应代码。

> 提示 **提示** RSS 是常驻集大小，用于显示分配给该进程并在 RAM 中的内存量。
> 它不包括被交换出去的内存。它包括来自共享库的内存，只要这些库的页面实际在内存中。它包括所有堆栈和堆内存。

```typescript
// 在 `HealthController` 类中

@Get()
@HealthCheck()
check() {
  return this.health.check([
    () => this.memory.checkRSS('memory_rss', 150 * 1024 * 1024),
  ]);
}

```

#### 自定义健康指示器

在某些情况下，`@nestjs/terminus` 提供的预定义健康指示器不能满足您的所有健康检查要求。在这种情况下，您可以根据需要设置自定义健康指示器。

让我们通过创建一个代表我们自定义指示器的服务来开始。为了基本了解指示器的结构，我们将创建一个示例 `DogHealthIndicator`。如果每个 `Dog` 对象都有类型 `'goodboy'`，此服务的状态应为 `'up'`。如果不满足该条件，则应抛出错误。

```typescript
import { Injectable } from '@nestjs/common';
import { HealthIndicatorService } from '@nestjs/terminus';

export interface Dog {
  name: string;
  type: string;
}

@Injectable()
export class DogHealthIndicator {
  constructor(
    private readonly healthIndicatorService: HealthIndicatorService
  ) {}

  private dogs: Dog[] = [
    { name: 'Fido', type: 'goodboy' },
    { name: 'Rex', type: 'badboy' },
  ];

  async isHealthy(key: string){
    const indicator = this.healthIndicatorService.check(key);
    const badboys = this.dogs.filter(dog => dog.type === 'badboy');
    const isHealthy = badboys.length === 0;

    if (!isHealthy) {
      return indicator.down({ badboys: badboys.length });
    }

    return indicator.up();
  }
}

```

我们需要做的下一件事是将健康指示器注册为提供者。

```typescript
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { DogHealthIndicator } from './dog.health';

@Module({
  controllers: [HealthController],
  imports: [TerminusModule],
  providers: [DogHealthIndicator]
})
export class HealthModule { }

```

> 提示 **提示** 在实际应用中，`DogHealthIndicator` 应该在单独的模块（例如 `DogModule`）中提供，然后由 `HealthModule` 导入。

最后一个必要步骤是在所需的健康检查端点中添加现在可用的健康指示器。为此，我们回到 `HealthController` 并将其添加到 `check` 函数中。

```typescript
import { HealthCheckService, HealthCheck } from '@nestjs/terminus';
import { Controller, Get } from '@nestjs/common';
import { DogHealthIndicator } from './dog.health';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private dogHealthIndicator: DogHealthIndicator
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.dogHealthIndicator.isHealthy('dog'),
    ]);
  }
}

```

#### 日志记录

Terminus 仅记录错误消息，例如当健康检查失败时。使用 `TerminusModule.forRoot()` 方法，您可以更好地控制错误的记录方式，以及完全接管日志记录本身。

在本节中，我们将向您展示如何创建自定义日志器 `TerminusLogger`。此日志器扩展了内置日志器。因此，您可以选择要覆盖的日志器部分

> 信息 **信息** 如果您想了解更多关于 NestJS 中的自定义日志器，请 [点击这里](/techniques/logger#注入自定义日志记录器)。

```typescript
import { Injectable, Scope, ConsoleLogger } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class TerminusLogger extends ConsoleLogger {
  error(message: any, stack?: string, context?: string): void;
  error(message: any, ...optionalParams: any[]): void;
  error(
    message: unknown,
    stack?: unknown,
    context?: unknown,
    ...rest: unknown[]
  ): void {
    // 在这里覆盖错误消息的记录方式
  }
}

```

创建自定义日志器后，您需要做的就是将其传递到 `TerminusModule.forRoot()` 中，如下所示。

```typescript
@Module({
imports: [
  TerminusModule.forRoot({
    logger: TerminusLogger,
  }),
],
})
export class HealthModule {}

```

要完全抑制来自 Terminus 的任何日志消息，包括错误消息，请按如下方式配置 Terminus。

```typescript
@Module({
imports: [
  TerminusModule.forRoot({
    logger: false,
  }),
],
})
export class HealthModule {}

```

Terminus 允许您配置健康检查错误应如何显示在日志中。

| 错误日志样式 | 描述 | 示例 |
|:------------|:------|:------|
| `json` （默认） | 在错误情况下以 JSON 对象形式打印健康检查结果的摘要 | <figure><img src="/assets/Terminus_Error_Log_Json.png" /></figure> |
| `pretty` | 在错误情况下在格式化框内打印健康检查结果的摘要，并突出显示成功/错误结果 | <figure><img src="/assets/Terminus_Error_Log_Pretty.png" /></figure> |

您可以使用 `errorLogStyle` 配置选项更改日志样式，如以下代码片段所示。

```typescript
@Module({
  imports: [
    TerminusModule.forRoot({
      errorLogStyle: 'pretty',
    }),
  ]
})
export class HealthModule {}

```

#### 优雅关闭超时

如果您的应用程序需要推迟其关闭过程，Terminus 可以为您处理。

当使用 Kubernetes 等编排器时，此设置可能特别有益。通过设置比就绪检查间隔稍长的延迟，您可以在关闭容器时实现零停机时间。

```typescript
@Module({
  imports: [
    TerminusModule.forRoot({
      gracefulShutdownTimeoutMs: 1000,
    }),
  ]
})
export class HealthModule {}

```

#### 更多示例

更多工作示例可在 [此处](https://github.com/nestjs/terminus/tree/master/sample) 找到。