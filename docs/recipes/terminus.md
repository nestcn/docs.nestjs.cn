<!-- 此文件从 content/recipes/terminus.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-12T13:42:20.323Z -->
<!-- 源文件: content/recipes/terminus.md -->

### 健康检查 (Terminus)

Terminus 集成为你提供**就绪/存活**健康检查。在复杂的后端设置中，健康检查至关重要。简而言之，Web 开发领域的健康检查通常由一个特殊地址组成，例如 `https://my-website.com/health/readiness`。你的基础设施的服务或组件（例如 [Kubernetes](https://kubernetes.io/)）会持续检查此地址。根据从此地址的 `GET` 请求返回的 HTTP 状态代码，当服务收到"不健康"响应时，将采取行动。由于"健康"或"不健康"的定义因你提供的服务类型而异，**Terminus** 集成为你提供了一组**健康指标**。

例如，如果你的 Web 服务器使用 MongoDB 存储其数据，那么 MongoDB 是否仍在运行将是至关重要的信息。在这种情况下，你可以使用 `MongooseHealthIndicator`。如果配置正确（稍后会详细介绍），你的健康检查地址将返回健康或不健康的 HTTP 状态代码，具体取决于 MongoDB 是否正在运行。

#### 入门

要开始使用 `@nestjs/terminus`，我们需要安装所需的依赖项。

```bash
$ npm install --save @nestjs/terminus

```

#### 设置健康检查

健康检查表示**健康指标**的摘要。健康指标执行服务检查，无论它处于健康还是不健康状态。如果所有分配的健康指标都已启动并运行，则健康检查为阳性。由于许多应用程序需要类似的健康指标，[`@nestjs/terminus`](https://github.com/nestjs/terminus) 提供了一组预定义的指标，例如：

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

要开始我们的第一个健康检查，让我们创建 `HealthModule` 并在其导入数组中导入 `TerminusModule`。

> info **提示** 要使用 [Nest CLI](/cli/overview) 创建模块，只需执行 `$ nest g module health` 命令。

```typescript
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

@Module({
  imports: [TerminusModule]
})
export class HealthModule {}

```

我们的健康检查可以使用[控制器](/controllers)执行，可以使用 [Nest CLI](/cli/overview) 轻松设置。

```bash
$ nest g controller health

```

> info **信息** 强烈建议在你的应用程序中启用关闭钩子。如果启用，Terminus 集成会利用此生命周期事件。在[这里](/fundamentals/lifecycle-events#application-shutdown)阅读有关关闭钩子的更多信息。

#### HTTP 健康检查

一旦我们安装了 `@nestjs/terminus`，导入了 `TerminusModule` 并创建了一个新控制器，我们就可以创建健康检查了。

`HTTPHealthIndicator` 需要 `@nestjs/axios` 包，因此请确保已安装它：

```bash
$ npm i --save @nestjs/axios axios

```

现在我们可以设置我们的 `HealthController`：

```typescript
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
      () => this.http.pingCheck('nestjs-docs', 'https://docs.nestjs.com'),
    ]);
  }
}

```

```typescript
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

我们的健康检查现在将向 `https://docs.nestjs.com` 地址发送 _GET_ 请求。如果我们从该地址收到健康响应，我们在 `http://localhost:3000/health` 的路由将返回以下对象，状态代码为 200。

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

可以使用 `HealthCheckResult` 接口从 `@nestjs/terminus` 包访问此响应对象的接口。

|           |                                                                                                                                                                                             |                                      |
|-----------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------|
| `status`  | 如果任何健康指标失败，状态将为 `'error'`。如果 NestJS 应用程序正在关闭但仍接受 HTTP 请求，健康检查将具有 `'shutting_down'` 状态。 | `'error' \| 'ok' \| 'shutting_down'` |
| `info`    | 包含每个状态为 `'up'` 的健康指标信息的对象，换句话说就是"健康"。                                                                              | `object`                             |
| `error`   | 包含每个状态为 `'down'` 的健康指标信息的对象，换句话说就是"不健康"。                                                                          | `object`                             |
| `details` | 包含每个健康指标的所有信息的对象                                                                                                                                  | `object`                             |

##### 检查特定的 HTTP 响应代码

在某些情况下，你可能想要检查特定条件并验证响应。例如，假设 `https://my-external-service.com` 返回响应代码 `204`。使用 `HttpHealthIndicator.responseCheck`，你可以专门检查该响应代码，并将所有其他代码确定为不健康。

如果返回除 `204` 之外的任何其他响应代码，以下示例将不健康。第三个参数要求你提供一个函数（同步或异步），该函数返回一个布尔值，指示响应是否被认为是健康的（`true`）或不健康的（`false`）。

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

#### TypeOrm 健康指标

Terminus 提供了向你的健康检查添加数据库检查的功能。要开始使用此健康指标，你应该查看[数据库章节](/techniques/sql)，并确保你的应用程序中的数据库连接已建立。

> info **提示** 在幕后，`TypeOrmHealthIndicator` 只是执行一个 `SELECT 1` SQL 命令，该命令通常用于验证数据库是否仍然存活。如果你使用的是 Oracle 数据库，它使用 `SELECT 1 FROM DUAL`。

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

如果你的数据库可访问，你现在应该在使用 `GET` 请求请求 `http://localhost:3000/health` 时看到以下 JSON 结果：

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

如果你的应用程序使用[多个数据库](/techniques/database#multiple-databases)，你需要将每个连接注入到你的 `HealthController` 中。然后，你可以简单地将连接引用传递给 `TypeOrmHealthIndicator`。

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

#### 磁盘健康指标

使用 `DiskHealthIndicator`，我们可以检查使用了多少存储空间。要开始，请确保将 `DiskHealthIndicator` 注入到你的 `HealthController` 中。以下示例检查路径 `/`（或在 Windows 上你可以使用 `C:\\`）的已用存储空间。如果超过总存储空间的 50%，它将响应不健康的健康检查。

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

使用 `DiskHealthIndicator.checkStorage` 函数，你还可以检查固定数量的空间。如果路径 `/my-app/` 超过 250GB，以下示例将不健康。

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

#### 内存健康指标

为了确保你的进程不超过特定的内存限制，可以使用 `MemoryHealthIndicator`。以下示例可用于检查进程的堆。

> info **提示** 堆是动态分配内存所在的内存部分（即通过 malloc 分配的内存）。从堆分配的内存将保持分配状态，直到发生以下情况之一：
> - 内存被 _free_'d
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

还可以使用 `MemoryHealthIndicator.checkRSS` 验证进程的内存 RSS。如果你的进程确实分配了超过 150MB，此示例将返回不健康的响应代码。

> info **提示** RSS 是驻留集大小，用于显示该进程分配了多少内存，并且在 RAM 中。它不包括换出的内存。它包括共享库的内存，只要这些库的页面实际上在内存中。它包括所有堆栈和堆内存。

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

#### 自定义健康指标

在某些情况下，`@nestjs/terminus` 提供的预定义健康指标不能涵盖你所有的健康检查要求。在这种情况下，你可以根据需要设置自定义健康指标。

让我们从创建一个将代表我们自定义指标的服务开始。为了对指标的结构有一个基本的了解，我们将创建一个示例 `DogHealthIndicator`。如果每个 `Dog` 对象的类型都是 `'goodboy'`，则此服务应具有状态 `'up'`。如果不满足该条件，则应抛出错误。

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

接下来我们需要做的是将健康指标注册为提供者。

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

> info **提示** 在实际应用程序中，`DogHealthIndicator` 应该在单独的模块中提供，例如 `DogModule`，然后由 `HealthModule` 导入。

最后需要的步骤是在所需的健康检查端点中添加现在可用的健康指标。为此，我们回到 `HealthController` 并将其添加到我们的 `check` 函数中。

```typescript
import { HealthCheckService, HealthCheck } from '@nestjs/terminus';
import { Injectable, Get } from '@nestjs/common';
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

Terminus 只记录错误消息，例如当健康检查失败时。使用 `TerminusModule.forRoot()` 方法，你可以更多地控制错误的记录方式，以及完全接管日志记录本身。

在本节中，我们将引导你创建自定义日志记录器 `TerminusLogger`。此日志记录器扩展了内置日志记录器。因此，你可以选择要覆盖日志记录器的哪个部分。

> info **信息** 如果你想了解更多关于 NestJS 中自定义日志记录器的信息，[请在此处阅读更多信息](/techniques/logger#injecting-a-custom-logger)。

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
    // 在这里覆盖错误消息应如何记录
  }
}

```

创建自定义日志记录器后，你需要做的就是将其传递给 `TerminusModule.forRoot()`。

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

要完全禁止来自 Terminus 的任何日志消息，包括错误消息，请按如下方式配置 Terminus。

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

Terminus 允许你配置健康检查错误应如何在日志中显示。

| 错误日志样式          | 描述                                                                                                                        | 示例                                                              |
|:------------------|:-----------------------------------------------------------------------------------------------------------------------------------|:---------------------------------------------------------------------|
| `json`  (默认) | 在出错时打印健康检查结果的摘要作为 JSON 对象                                                     | <figure><img src="/assets/Terminus_Error_Log_Json.png" /></figure>   |
| `pretty`          | 在出错时在格式化框内打印健康检查结果的摘要，并突出显示成功/错误结果 | <figure><img src="/assets/Terminus_Error_Log_Pretty.png" /></figure> |

你可以使用 `errorLogStyle` 配置选项更改日志样式，如下面的代码片段所示。

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

如果你的应用程序需要推迟其关闭过程，Terminus 可以为你处理。此设置在与 Kubernetes 等编排器一起使用时特别有用。通过设置略长于就绪检查间隔的延迟，你可以在关闭容器时实现零停机。

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

更多可工作的示例可在[这里](https://github.com/nestjs/terminus/tree/master/sample)找到。
