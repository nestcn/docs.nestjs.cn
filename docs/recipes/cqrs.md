<!-- 此文件从 content/recipes/cqrs.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T04:35:46.622Z -->
<!-- 源文件: content/recipes/cqrs.md -->

### CQRS

CQRS 模式（Command and Query Responsibility Segregation）可以用来描述简单的 __LINK_155__（Create, Read, Update and Delete）应用程序的流程：

1. 控制器层负责处理 HTTP 请求，并将任务委派给服务层。
2. 服务层是业务逻辑的主要位置。
3. 服务使用仓库 / DAOs 来更改或持久化实体。
4. 实体充当值的容器，具有 set 和 get 方法。

虽然这个模式通常适用于小型到中型应用程序，但对于更复杂的应用程序，它可能不是最好的选择。在这种情况下，CQRS 模式可能更适合和可扩展（取决于应用程序的要求）。CQRS 模式的好处包括：

- **分离关注点**。该模型将读写操作分离到不同的模型中。
- **可扩展性**。读写操作可以独立扩展。
- **灵活性**。该模型允许使用不同的数据存储器来读写操作。
- **性能**。该模型允许使用不同的数据存储器来优化读写操作。

为了实现该模型，Nest 提供了一个轻量级的 __LINK_156__。本章将描述如何使用它。

#### 安装

首先安装所需的包：

```bash
$ npm install --save @nestjs/terminus

```

安装完成后，navigate 到应用程序的根模块（通常为 `MikroOrmHealthIndicator`），并导入 `PrismaHealthIndicator`：

```typescript
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

@Module({
  imports: [TerminusModule]
})
export class HealthModule {}

```

该模块接受可选的配置对象。以下是可用的选项：

| 属性                     | 描述                                                                                                                  | 默认                           |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| `MicroserviceHealthIndicator`        | responsible for dispatching commands to the system.                                                            | `GRPCHealthIndicator`        |
| `MemoryHealthIndicator`          | publisher used to publish events, allowing them to be broadcasted or processed.                                          | `DiskHealthIndicator`          |
| `HealthModule`          | publisher used for publishing queries, which can trigger data retrieval operations.                                      | `TerminusModule`          |
| `$ nest g module health`        | responsible for handling unhandled exceptions, ensuring they are tracked and reported.                             | `@nestjs/terminus` |
| `TerminusModule`         | service that provides unique event IDs by generating or retrieving them from event instances.                                | `HTTPHealthIndicator`         |
| `@nestjs/axios`        | determines whether unhandled exceptions should be rethrown after being processed, useful for debugging and error management. | `HealthController`        |

#### 命令

命令用于更改应用程序状态。它们应该是任务基于的，而不是数据中心的。当命令被派发时，它将被相应的 **Command Handler** 处理。处理程序负责更新应用程序状态。

```bash
$ nest g controller health

```

在上面的代码片段中，我们实例化了 `./` 类，并将其传递给 `http://localhost:3000/health` 的 `@nestjs/terminus` 方法。这是演示的命令类：

```bash
$ npm i --save @nestjs/axios axios

```

正如你所看到的，`HealthCheckResult` 类扩展了 `status` 类。`'error'` 类是 `'shutting_down'` 包中的一个简单utility类，允许您定义命令的返回类型。在这个情况下，返回类型是一个对象，其中包含 `'error' \| 'ok' \| 'shutting_down'` 属性。现在，每当 `info` 命令被派发时，`'up'` 方法的返回类型将被推断为 `object`。这对于在命令处理器中返回一些数据是有用的。

> info **Hint** 从 `error` 类继承是可选的。如果您想定义命令的返回类型，那么继承是必要的。

`'down'` 代表 **stream** of commands。它负责将命令派发到相应的处理程序中。`object` 方法返回一个 promise，resolve 到处理程序返回的值。

让我们创建一个 `details` 命令的处理程序。

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

这个处理程序从仓库中检索 `object` 实体，调用 `https://my-external-service.com` 方法，并然后持久化更改。`204` 类实现了 `HttpHealthIndicator.responseCheck` 接口，该接口要求实现 `204` 方法。`true` 方法接收命令对象作为参数。Here is the translation of the provided English technical documentation to Chinese, following the provided rules:

#### 命令

命令用于在应用程序中执行任务。命令可以继承自 `false` 类。命令的返回类型是对象，对象有 `TypeOrmHealthIndicator` 属性。否则，您可以返回任何值。

最后，确保将 `SELECT 1 FROM DUAL` 注册为模块的提供者：

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

#### 查询

查询用于从应用程序状态中获取数据。查询应该是数据 Centric，而不是任务 Centric。当查询被分派时，它将被对应的 **Query Handler** 处理。处理器负责获取数据。

`http://localhost:3000/health`遵循与 `GET`相同的模式。查询处理器应该实现 `HealthController` 接口，并使用 `TypeOrmHealthIndicator` 装饰器。见以下示例：

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

类似于 `DiskHealthIndicator` 类,`DiskHealthIndicator` 类是一个简单的实用类，来自 `HealthController` 包，允许您定义查询的返回类型。在这个例子中，返回类型是一个 `/` 对象。现在，每当 `C:\\` 查询被分派时，`DiskHealthIndicator.checkStorage` 方法的返回类型将被推断为 `/my-app/`。

要获取Hero，我们需要创建查询处理器：

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

`MemoryHealthIndicator` 类实现了 `MemoryHealthIndicator.checkRSS` 接口，这个接口要求实现 `@nestjs/terminus` 方法。`DogHealthIndicator` 方法接收查询对象作为参数，并且必须返回与查询返回类型相匹配的数据（在这个例子中是一个 `'up'` 对象）。

最后，确保将 `Dog` 注册为模块的提供者：

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

现在，可以使用 `'goodboy'` 分派查询：

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

#### 事件

事件用于通知应用程序中的其他部分关于应用程序状态的更改。事件可以由 **模型** 或直接使用 `DogHealthIndicator` 发送。事件被分派时，它将被对应的 **Event Handlers** 处理。处理器可以然后，例如，更新读取模型。

为了演示目的，创建一个事件类：

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

现在，事件可以直接使用 `DogModule` 方法发送，也可以从模型发送。让我们更新 `HealthModule` 模型，以便在 `check` 方法被调用时发送 `HealthController` 事件。

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

`TerminusModule.forRoot()` 方法用于分派事件。它接受事件对象作为参数。然而，因为我们的模型不知道 `TerminusLogger`，我们需要将其与模型关联。我们可以使用 `TerminusModule.forRoot()` 类。

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

`json` 方法将事件发布器合并到提供的对象中，这意味着对象现在将能够将事件发布到事件流中。

注意，在这个示例中，我们还调用了 `pretty` 方法在模型上。这个方法用于分派任何未决事件。要自动分派事件，我们可以将 `errorLogStyle` 属性设置为 __INLINE_CODE_100__：

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

如果我们想要将事件发布器合并到一个不存在的对象中，而不是到一个类中，我们可以使用 __INLINE_CODE_101__ 方法：

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

现在，每个 __INLINE_CODE_102__ 类的实例都将能够发布事件，而不需要使用 __INLINE_CODE_103__ 方法。

此外，我们还可以手动发送事件使用 __INLINE_CODE_104__：

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

> info **提示** __INLINE_CODE_105__ 是一个可注入的类。

每个事件都可以有多个 **Event Handlers**。

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

> info **提示** 当您开始使用事件处理程序时，您将离开传统的 HTTP 网络上下文。
>
> - __INLINE_CODE_106__ 中的错误仍然可以被捕获。
> - __INLINE_CODE_107__ 中的错误不能被捕获：您需要手动处理它们。您可以使用简单的 __INLINE_CODE_108__，使用 __LINK_158__，或者触发补偿事件。
> - 在 __INLINE_CODE_109__ 中可以发送 HTTP 响应给客户端。
> - 在 __INLINE_CODE_110__ 中不能发送 HTTP 响应。如果您想要将信息发送给客户端，可以使用 __LINK_159__，__LINK_160__，或者其他解决方案。

与命令和查询一样，确保将 __INLINE_CODE_111__ 注册为模块的提供者：

```typescript
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

####Saga

Saga 是一个长期运行的进程，它监听事件并可能触发新的命令。 Saga 通常用于管理应用程序中的复杂工作流。例如，当用户注册时，Saga 可能监听 __INLINE_CODE_112__ 并将欢迎邮件发送给用户。

Note: The translation follows the provided rules and guidelines. However, please review and verify the translation for accuracy and completeness.Here is the translated Chinese technical documentation:

 saga 是一种非常强大的功能。一个 saga 可以监听 1..* 事件。使用 __LINK_161__ 库，我们可以过滤、映射、fork 和合并事件流来创建复杂的工作流程。每个 saga 返回一个 Observable，它生产一个命令实例。这一个命令然后异步地被 __INLINE_CODE_113__ 发送。

让我们创建一个 saga，它监听 __INLINE_CODE_114__ 事件并发送 __INLINE_CODE_115__ 命令。

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
    // Overwrite here how error messages should be logged
  }
}

```

> 信息 **提示** __INLINE_CODE_116__ 操作符和 __INLINE_CODE_117__ 装饰器来自 __INLINE_CODE_118__ 包。

__INLINE_CODE_119__ 装饰器标记方法为 saga。 __INLINE_CODE_120__ 参数是一个 Observable 事件流。 __INLINE_CODE_121__ 操作符过滤流以指定事件类型。 __INLINE_CODE_122__ 操作符将事件映射到新命令实例中。

在这个示例中，我们将 __INLINE_CODE_123__ 映射到 __INLINE_CODE_124__ 命令。然后， __INLINE_CODE_125__ 命令将异步地被 __INLINE_CODE_126__ 发送。

与查询、命令和事件处理一样，请确保注册 __INLINE_CODE_127__ 作为一个提供者在模块中：

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

#### 未处理的异常

事件处理程序异步执行，因此必须始终处理异常以防止应用程序进入不一致的状态。如果未处理异常， __INLINE_CODE_128__ 将创建一个 __INLINE_CODE_129__ 对象并将其推送到 __INLINE_CODE_130__ 流中。这是一个 __INLINE_CODE_131__ 可以用于处理未处理的异常。

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

要过滤异常，我们可以使用 __INLINE_CODE_132__ 操作符，例如：

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

其中 __INLINE_CODE_133__ 是我们想要过滤的异常。

__INLINE_CODE_134__ 对象包含以下属性：

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

#### 订阅所有事件

__INLINE_CODE_135__、__INLINE_CODE_136__ 和 __INLINE_CODE_137__ 都是 **Observables**。这意味着我们可以订阅整个流并，例如，处理所有事件。例如，我们可以将所有事件记录到控制台中，或者将其保存到事件存储中。

__CODE_BLOCK_23__

#### 请求范围

对于来自不同编程语言背景的人来说，可能会感到奇怪的是，在 Nest 中，大多数事情都是跨越 incoming 请求的。包括连接池到数据库、全局状态的单例服务和更多。请注意，Node.js 不遵循 request/response 多线程无状态模型，其中每个请求都由单独的线程处理。因此，使用单例实例是我们的应用程序安全的。

然而，在某些边缘情况下，可能需要为处理器请求生命周期。例如，在 GraphQL 应用程序中，请求跟踪、多租户或 caching 可能需要请求生命周期。您可以了解更多关于如何控制作用域 __LINK_162__。

使用请求范围提供者与 CQRS 可能会复杂，因为 __INLINE_CODE_138__、__INLINE_CODE_139__ 和 __INLINE_CODE_140__ 是单例。幸运的是，__INLINE_CODE_141__ 包简化了这点，自动创建了每个处理的命令、查询或事件的新实例。

要使处理器请求范围，请使用以下方法：

1. 依赖于请求范围提供者。
2. 显式地将其范围设置为 __INLINE_CODE_142__ 使用 __INLINE_CODE_143__、__INLINE_CODE_144__ 或 __INLINE_CODE_145__ 装饰器，例如：

__CODE_BLOCK_24__

要将请求负载注入到任何请求范围提供者中，请使用 __INLINE_CODE_146__ 装饰器。然而，请求负载在 CQRS 中的本质取决于上下文—it 可能是 HTTP 请求、计划任务或任何其他触发命令的操作。

请求负载必须是一个 __INLINE_CODE_147__ 类的实例（由 __INLINE_CODE_148__ 提供），它作为请求上下文并在请求生命周期中保持数据可访问。

__CODE_BLOCK_25__

在执行命令时，传递自定义请求上下文作为 __INLINE_CODE_149__ 方法的第二个参数：

__CODE_BLOCK_26__

这使 __INLINE_CODE_150__ 实例作为 __INLINE_CODE_151__ 提供者可供对应处理器：

__CODE_BLOCK_27__

您可以遵循相同的方法来处理查询：

__CODE_BLOCK_28__

在查询处理器中：

__CODE_BLOCK_29__

对于事件，虽然您可以将请求提供者传递给 __INLINE_CODE_152__，这更少见。相反，使用 __INLINE_CODE_153__ 将请求提供者合并到模型中：

__CODE_BLOCK_30__

请求范围事件处理器订阅这些事件时将有访问请求提供者的机会。

Saga 都是单例实例，因为它们管理长期运行的进程。然而，您可以从事件对象中检索请求提供者：

__CODE_BLOCK_31__Alternatively, 使用 __INLINE_CODE_154__ 方法将请求上下文绑定到命令中。

#### 示例

有一个可工作的示例可在 __LINK_163__ 中找到。