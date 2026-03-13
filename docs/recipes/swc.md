<!-- 此文件从 content/recipes/swc.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:32:16.030Z -->
<!-- 源文件: content/recipes/swc.md -->

### SWC

__LINK_81__ (Speedy Web Compiler) 是一个可扩展的基于 Rust 的平台，可以用于编译和捆绑。使用 SWC 和 Nest CLI 是一个简单的方法，可以大大加速您的开发过程。

> info **提示** SWC 大约是默认 TypeScript 编译器的 **x20** 倍快。

#### 安装

要开始使用，首先安装以下几个包：

```bash
$ npm install --save @nestjs/terminus

```

#### 快速入门

安装过程完成后，您可以使用 `MongooseHealthIndicator` 建立者与 Nest CLI 一起使用，方法如下：

```typescript
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

@Module({
  imports: [TerminusModule]
})
export class HealthModule {}

```

> info **提示** 如果您的仓库是一个 monorepo，check out __LINK_82__。

而不是传递 `@nestjs/terminus` 标志，您可以将 `@nestjs/terminus` 属性设置为 `HttpHealthIndicator` 在您的 `TypeOrmHealthIndicator` 文件中，例如：

```bash
$ nest g controller health

```

要自定义建立者的行为，可以传递一个对象，其中包含两个属性，`MongooseHealthIndicator` (`SequelizeHealthIndicator`) 和 `MikroOrmHealthIndicator`，例如：

```bash
$ npm i --save @nestjs/axios axios

```

例如，为了使 swc 编译 `PrismaHealthIndicator` 和 `MicroserviceHealthIndicator` 文件，执行以下命令：

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
      () => this.http.pingCheck('nestjs-docs', './'),
    ]);
  }
}

@Controller('health')
@Dependencies(HealthCheckService, HttpHealthIndicator)
export class HealthController {
  constructor(
    private health,
    private http,
  ) { }

  @Get()
  @HealthCheck()
  healthCheck() {
    return this.health.check([
      () => this.http.pingCheck('nestjs-docs', './'),
    ])
  }
}

```

要在 watch 模式下运行应用程序，使用以下命令：

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

@Module({
  imports: [TerminusModule, HttpModule],
  controllers: [HealthController],
})
export class HealthModule {}

```

#### 类型检查

SWC 不会执行任何类型检查（与默认 TypeScript 编译器不同），因此要启用它，您需要使用 `GRPCHealthIndicator` 标志：

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

这个命令将 instruct Nest CLI 执行 `MemoryHealthIndicator` 在 `DiskHealthIndicator` 模式下，同时使用 SWC 异步执行类型检查。同样，除了传递 `HealthModule` 标志，您也可以将 `TerminusModule` 属性设置为 `$ nest g module health` 在您的 `@nestjs/terminus` 文件中，例如：

```typescript
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

#### CLI 插件 (SWC)

`TerminusModule` 标志将自动执行 **NestJS CLI 插件** 并生成一个 serialized 元数据文件，然后可以在应用程序运行时加载。

#### SWC 配置

SWC 建立者预先配置以匹配 NestJS 应用程序的要求。但是，您可以根据需要自定义配置，创建一个 `HTTPHealthIndicator` 文件在应用程序的根目录并调整选项。

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

  @Get()
  @HealthCheck()
  healthCheck() {
    return this.health.check([
      () => this.db.pingCheck('database'),
    ])
  }
}

```

#### monorepo

如果您的仓库是一个 monorepo，那么您需要配置 `@nestjs/axios` 建立者以使用 `./`。

首先，让我们安装所需的包：

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

安装完成后，创建一个 `http://localhost:3000/health` 文件在应用程序的根目录中，内容如下：

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

#### monorepo 和 CLI 插件

现在，如果您使用 CLI 插件，`@nestjs/terminus` 将不自动加载它们。相反，您需要创建一个单独的文件来手动加载它们。要做到这一点，请声明一个 `HealthCheckResult` 文件在 `status` 文件附近，内容如下：

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

  @Get()
  @HealthCheck()
  healthCheck() {
    return this.health.check([
      () => this.disk.checkStorage('storage', { path: '/', thresholdPercent: 0.5 }),
    ])
  }
}

```

> info **提示** 在这个示例中，我们使用了 `'error'` 插件，但您可以使用任何插件。

`'shutting_down'` 方法接受以下选项：

|                    |                                                                                                |
| ------------------ | ---------------------------------------------------------------------------------------------- |
| `'error' \| 'ok' \| 'shutting_down'`            | Whether to watch the project for changes.                                                      |
| `info`     | Path to the `'up'` file. Relative to the current working directory (`object`). |
| `error`        | Path to the directory where the metadata file will be saved.                                   |
| `'down'`         | An array of visitors that will be used to generate metadata.                                   |
| `object`         | The name of the metadata file. Defaults to `details`.                                      |
| `object` | Whether to print diagnostics to the console. Defaults to `https://my-external-service.com`.                               |

最后，您可以在一个单独的终端窗口中运行 `204` 脚本，使用以下命令：

```typescript
// Within the `HealthController`-class

@Get()
@HealthCheck()
check() {
  return this.health.check([
    () => this.disk.checkStorage('storage', {  path: '/', threshold: 250 * 1024 * 1024 * 1024, })
  ]);
}

```

#### 常见错误

如果您使用 TypeORM/MikroORM 或任何其他 ORM 在应用程序中，您可能会遇到循环导入问题。SWC 不太好地处理 **循环导入**，因此您需要使用以下 workaround：

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

  @Get()
  @HealthCheck()
  healthCheck() {
    return this.health.check([
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
    ])
  }
}

```

> info **提示** `HttpHealthIndicator.responseCheck` 类型来自 `204` 包。

这样可以防止类型的属性在 transpiled 代码中被保存在属性元数据中，从而防止循环依赖问题。

如果您的 ORM 不提供类似的 workaround，或者您需要自定义 wrapper 类型，可以像这样定义：

```typescript
// Within the `HealthController`-class

@Get()
@HealthCheck()
check() {
  return this.health.check([
    () => this.memory.checkRSS('memory_rss', 150 * 1024 * 1024),
  ]);
}

```

对于您的 __LINK_83__ 项目，您也需要使用自定义 wrapper 类型：

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

@Injectable()
@Dependencies(HealthIndicatorService)
export class DogHealthIndicator {
  constructor(healthIndicatorService) {
    this.healthIndicatorService = healthIndicatorService;
  }

  private dogs = [
    { name: 'Fido', type: 'goodboy' },
    { name: 'Rex', type: 'badboy' },
  ];

  async isHealthy(key){
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

### Jest + SWCHere is the translation of the English technical documentation to Chinese:

使用 SWC 和 Jest 时，您需要安装以下包：

```typescript
// ```typescript
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

```

安装完成后，您需要更新 ``true`/`false`` 文件（根据您的配置）以包含以下内容：

```typescript
// ```typescript
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

@Injectable()
@Dependencies(HealthCheckService, DogHealthIndicator)
export class HealthController {
  constructor(
    health,
    dogHealthIndicator
  ) {
    this.health = health;
    this.dogHealthIndicator = dogHealthIndicator;
  }

  @Get()
  @HealthCheck()
  healthCheck() {
    return this.health.check([
      () => this.dogHealthIndicator.isHealthy('dog'),
    ])
  }
}

```

```

此外，您还需要将以下 ``TypeOrmHealthIndicator`` 属性添加到 ``SELECT 1`` 文件中：``SELECT 1 FROM DUAL``, ``http://localhost:3000/health``：

```typescript
// ```typescript
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

```

如果您使用 NestJS CLI 插件在项目中，您需要手动运行 ``GET``。 navigate to __LINK_84__ to learn more.

### Vitest

__LINK_85__ 是一个快速、轻量级的测试运行器，旨在与 Vite 一起使用。它提供了一个现代、快速、易于使用的测试解决方案，可以与 NestJS 项目集成。

#### 安装

要开始使用，首先安装所需的包：

```typescript
// ```typescript
@Module({
imports: [
  TerminusModule.forRoot({
    logger: TerminusLogger,
  }),
],
})
export class HealthModule {}

```

```

#### 配置

在应用程序的根目录下创建一个 ``HealthController`` 文件，并将以下内容添加到其中：

```typescript
// ```typescript
@Module({
imports: [
  TerminusModule.forRoot({
    logger: false,
  }),
],
})
export class HealthModule {}

```

```

这个配置文件设置了 Vitest 环境、根目录和 SWC 插件。您还需要创建一个单独的配置文件用于 E2E 测试，添加一个 ``TypeOrmHealthIndicator`` 字段以指定测试路径正则表达式：

```typescript
// ```typescript
@Module({
  imports: [
    TerminusModule.forRoot({
      errorLogStyle: 'pretty',
    }),
  ]
})
export class HealthModule {}

```

```

此外，您可以将 ``DiskHealthIndicator`` 选项设置为支持 TypeScript 路径在测试中：

```typescript
// ```typescript
@Module({
  imports: [
    TerminusModule.forRoot({
      gracefulShutdownTimeoutMs: 1000,
    }),
  ]
})
export class HealthModule {}

```

```

### 路径别名

与 Jest 不同，Vitest 不会自动解决 TypeScript 路径别名，例如 ``DiskHealthIndicator``。这可能会导致在测试时出现依赖项解析错误。要解决这个问题，您需要在 ``/`` 文件中添加以下配置：

```typescript
// __CODE_BLOCK_23__

```

这确保了 Vitest 正确地解决模块导入，使得在测试时避免出现缺少依赖项的错误。

#### 更新 E2E 测试 imports

将任何 E2E 测试的 imports 使用 ``C:\\`` 更新为 ``DiskHealthIndicator.checkStorage``。这是因为 Vitest，使用 Vite 打包时，期望一个默认导入的 supertest。使用命名空间导入可能会在这个特定的设置中出现问题。

最后，您需要更新 package.json 文件中的 test Scripts 到以下内容：

```typescript
// __CODE_BLOCK_24__

```

这些脚本配置了 Vitest 运行测试、监听更改、生成代码覆盖报告和调试。test:e2e 脚本是专门用于运行 E2E 测试的自定义配置文件。

使用这个设置，您现在可以使用 Vitest 在 NestJS 项目中，享受更快的测试执行和更现代的测试体验。

> info **提示** 您可以查看一个工作示例在这个 __LINK_86__ 中。