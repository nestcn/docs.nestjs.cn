### 健康检查（Terminus）

Terminus 集成提供了**就绪性/存活状态**健康检查功能。在复杂的后端架构中，健康检查至关重要。简而言之，在 Web 开发领域，健康检查通常由一个特殊地址组成，例如 `https://my-website.com/health/readiness` 。您的服务或基础设施组件（如 [Kubernetes](https://kubernetes.io/)）会持续检查该地址。根据对该地址 `GET` 请求返回的 HTTP 状态码，当收到"不健康"响应时，服务将采取相应措施。由于"健康"或"不健康"的定义因服务类型而异，**Terminus** 集成通过一组**健康指标**为您提供支持。

例如，如果您的 Web 服务器使用 MongoDB 存储数据，了解 MongoDB 是否仍在运行将是关键信息。在这种情况下，您可以使用 `MongooseHealthIndicator`。如果配置正确（稍后会详细介绍），您的健康检查地址将根据 MongoDB 是否运行返回健康或不健康的 HTTP 状态码。

#### 快速开始

要开始使用 `@nestjs/terminus`，我们需要先安装所需的依赖项。

```bash
$ npm install --save @nestjs/terminus
```

#### 设置健康检查

健康检查是对**健康指标**的汇总。健康指标会执行对服务的检查，判断其处于健康或不健康状态。当所有分配的健康指标都正常运行时，健康检查结果为通过。由于许多应用程序需要类似的健康指标，[`@nestjs/terminus`](https://github.com/nestjs/terminus) 提供了一组预定义的指标，例如：

- `HttpHealthIndicator`
- `TypeOrmHealthIndicator`
- `MongooseHealthIndicator`
- `SequelizeHealthIndicator`
- `MikroOrmHealthIndicator`
- `PrismaHealthIndicator`
- `MicroserviceHealthIndicator`
- `GRPCHealthIndicator`
- `MemoryHealthIndicator`
- `DiskHealthIndicator`

要开始我们的第一个健康检查，让我们创建 `HealthModule` 模块，并在其 imports 数组中导入 `TerminusModule`。

> info **提示** 要使用 [Nest CLI](cli/overview) 创建该模块，只需执行 `$ nest g module health` 命令。

```typescript title="health.module"
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

@Module({
  imports: [TerminusModule]
})
export class HealthModule {}
```

我们的健康检查可以通过 [控制器](/controllers) 来执行，使用 [Nest CLI](cli/overview) 可以轻松设置。

```bash
$ nest g controller health
```

> info **信息** 强烈建议在应用程序中启用关闭钩子。如果启用，Terminus 集成会利用此生命周期事件。了解更多关于关闭钩子的信息 [请点击这里](fundamentals/lifecycle-events#应用程序关闭) 。

#### HTTP 健康检查

安装完 `@nestjs/terminus`、导入 `TerminusModule` 并创建新控制器后，我们就可以开始创建健康检查了。

`HTTPHealthIndicator` 需要 `@nestjs/axios` 包，请确保已安装：

```bash
$ npm i --save @nestjs/axios axios
```

现在我们可以设置 `HealthController` 了：

```typescript title="health.controller"
import { Controller, Get } from '@nestjs/common';
import { HealthCheckService, HttpHealthIndicator, HealthCheck } from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.http.pingCheck('nestjs-docs', './'),
    ]);
  }
}
```

```typescript title="health.module"
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { HealthController } from './health.controller';

@Module({
  imports: [TerminusModule, HttpModule],
  controllers: [HealthController],
})
export class HealthModule {}
```

我们的健康检查将向 `../ 地址发送一个 _GET_ 请求。如果从该地址获得健康响应，我们在 `http://localhost:3000/health` 的路由将返回以下对象，状态码为 200。

```json
{
  "status": "ok",
  "info": {
    "nestjs-docs": {
      "status": "up"
    }
  },
  "error": {},
  "details": {
    "nestjs-docs": {
      "status": "up"
    }
  }
}
```

该响应对象的接口可通过 `@nestjs/terminus` 包中的 `HealthCheckResult` 接口访问。

|           |                                                                                                                                                                                             |                                      |
|-----------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------|
| status  | 若任何健康指标检查失败，状态将显示为 'error'。当 NestJS 应用正在关闭但仍接受 HTTP 请求时，健康检查状态将为 'shutting_down'。 | `'error' \| 'ok' \| 'shutting_down'` |
| info    | 包含所有状态为 'up'（即"健康"）的健康指标信息的对象。                                                                        | object  |
| error   | 包含所有状态为 'down'（即"不健康"）的健康指标信息的对象。                                                                    | object  |
| details | 包含每个健康指标所有信息的对象                                                                                               | object  |

##### 检查特定的 HTTP 响应代码

在某些情况下，您可能需要检查特定条件并验证响应。例如，假设 `https://my-external-service.com` 返回响应代码 `204`。使用 `HttpHealthIndicator.responseCheck` 可以专门检查该响应代码，并将所有其他代码判定为不健康状态。

若返回的响应代码不是 `204`，则以下示例将被视为不健康。第三个参数要求提供一个（同步或异步）函数，该函数返回布尔值以判断响应是否健康（`true`）或不健康（`false`）。

```typescript title="health.controller"
// Within the `HealthController`-class

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

#### TypeOrm 健康指标

Terminus 提供了将数据库检查添加到健康检查的能力。要开始使用此健康指标，您应查阅[数据库章节](/techniques/sql)并确保应用程序中的数据库连接已建立。

> **提示** 在底层，`TypeOrmHealthIndicator` 仅执行一条常用于验证数据库是否存活的 `SELECT 1` SQL 命令。若使用 Oracle 数据库，则会执行 `SELECT 1 FROM DUAL`。

```typescript title="health.controller"
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

如果您的数据库可访问，现在通过 `GET` 请求访问 `http://localhost:3000/health` 时，应该会看到以下 JSON 结果：

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

如果您的应用使用[多个数据库](techniques/database#多个数据库) ，需要将每个连接注入到 `HealthController` 中。然后就可以直接将连接引用传递给 `TypeOrmHealthIndicator`。

```typescript title="health.controller"
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

#### 磁盘健康指标

通过 `DiskHealthIndicator` 我们可以检查存储空间的使用情况。要开始使用，请确保注入 `DiskHealthIndicator` 将以下代码添加到你的 `HealthController` 中。以下示例检查路径 `/`（在 Windows 上可以使用 `C:\\`）的存储使用情况。如果使用量超过总存储空间的 50%，健康检查将返回不健康状态。

```typescript title="health.controller"
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

通过 `DiskHealthIndicator.checkStorage` 函数，你还可以检查固定大小的存储空间。以下示例中，如果路径 `/my-app/` 超过 250GB，健康状态将变为不健康。

```typescript title="health.controller"
// Within the `HealthController`-class

@Get()
@HealthCheck()
check() {
  return this.health.check([
    () => this.disk.checkStorage('storage', {  path: '/', threshold: 250 * 1024 * 1024 * 1024, })
  ]);
}
```

#### 内存健康指标

为确保你的进程不超过特定内存限制，可以使用 `MemoryHealthIndicator`。以下示例可用于检查进程的堆内存使用情况。

> info **提示** 堆是内存中动态分配内存（即通过 malloc 分配的内存）所在的区域。从堆中分配的内存将保持分配状态，直到发生以下情况之一：
>
> - 内存被*释放*
> - 程序终止

```typescript title="health.controller"
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

您还可以使用 `MemoryHealthIndicator.checkRSS` 来验证进程的内存 RSS。如果您的进程确实分配了超过 150MB 的内存，此示例将返回一个异常响应码。

> info **提示** RSS（常驻内存集）用于显示分配给该进程且驻留在 RAM 中的内存量。它不包括被交换出去的内存，但包含来自共享库的内存（只要这些库的页面实际存在于内存中），同时包含所有栈和堆内存。

```typescript title="health.controller"
// Within the `HealthController`-class

@Get()
@HealthCheck()
check() {
  return this.health.check([
    () => this.memory.checkRSS('memory_rss', 150 * 1024 * 1024),
  ]);
}
```

#### 自定义健康指标

在某些情况下，`@nestjs/terminus` 提供的预定义健康指标无法满足您的所有健康检查需求。此时，您可以根据需要设置自定义健康指标。

让我们从创建一个代表自定义指标的服务开始。为了基本了解指标的结构，我们将创建一个示例 `DogHealthIndicator`。当每个 `Dog` 对象的类型为 `'goodboy'` 时，该服务应处于 `'up'` 状态。如果条件不满足，则应抛出错误。

```typescript title="dog.health"
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

接下来我们需要将健康指标注册为提供者。

```typescript title="health.module"
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

> info **提示** 在实际应用中，`DogHealthIndicator` 应该在一个单独的模块中提供，例如 `DogModule`，然后由 `HealthModule` 导入。

最后一步是将现已可用的健康指标添加到所需的健康检查端点。为此，我们回到 `HealthController` 并将其添加到我们的 `check` 函数中。

```typescript title="health.controller"
import { HealthCheckService, HealthCheck } from '@nestjs/terminus';
import { Injectable, Dependencies, Get } from '@nestjs/common';
import { DogHealthIndicator } from './dog.health';

@Injectable()
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private dogHealthIndicator: DogHealthIndicator
  ) {}

  @Get()
  @HealthCheck()
  healthCheck() {
    return this.health.check([
      () => this.dogHealthIndicator.isHealthy('dog'),
    ])
  }
}
```

#### 日志记录

Terminus 仅记录错误消息，例如当健康检查失败时。通过 `TerminusModule.forRoot()` 方法，您可以更好地控制错误记录方式，甚至完全接管日志记录本身。

在本节中，我们将指导您如何创建自定义日志记录器 `TerminusLogger`。该日志记录器扩展了内置日志功能，因此您可以选择性地覆盖日志记录器的特定部分

> **提示** 如需了解更多关于 NestJS 中自定义日志记录器的信息， [请点击此处阅读更多内容](/techniques/logger#注入自定义日志记录器) 。

```typescript title="terminus-logger.service"
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
    // Overwrite here how error messages should be logged
  }
}
```

创建自定义日志记录器后，您只需将其传入 `TerminusModule.forRoot()` 即可，如下所示。

```typescript title="health.module"
@Module({
imports: [
  TerminusModule.forRoot({
    logger: TerminusLogger,
  }),
],
})
export class HealthModule {}
```

若要完全抑制来自 Terminus 的所有日志消息（包括错误消息），请按如下方式配置 Terminus。

```typescript title="health.module"
@Module({
imports: [
  TerminusModule.forRoot({
    logger: false,
  }),
],
})
export class HealthModule {}
```

Terminus 允许您配置健康检查错误在日志中的显示方式。

| 错误日志样式 | 描述                                                      | 示例 |
| ------------ | --------------------------------------------------------- | ---- |
| json（默认） | 在出现错误时以 JSON 对象形式打印健康检查结果摘要          |      |
| pretty       | 在格式化框内打印健康检查结果摘要，并高亮显示成功/错误结果 |      |

您可以通过如下代码片段所示的 `errorLogStyle` 配置选项来更改日志样式

```typescript title="health.module"
@Module({
  imports: [
    TerminusModule.forRoot({
      errorLogStyle: 'pretty',
    }),
  ]
})
export class HealthModule {}
```

#### 优雅停机超时时间

如果您的应用程序需要延迟关闭过程，Terminus 可以为您处理。这一设置在配合 Kubernetes 等编排器使用时尤为有益。通过将延迟时间设置为略长于就绪检查间隔，您可以在关闭容器时实现零停机。

```typescript title="health.module"
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

更多工作示例可[在此](https://github.com/nestjs/terminus/tree/master/sample)查看。
