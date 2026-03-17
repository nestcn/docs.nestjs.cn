<!-- 此文件从 content/recipes/cqrs.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:08:26.846Z -->
<!-- 源文件: content/recipes/cqrs.md -->

### CQRS

简单的 __LINK_155__ (Create, Read, Update and Delete) 应用程序的流程可以用以下方式描述：

1. 控制器层处理 HTTP 请求，并将任务委托给服务层。
2. 服务层是业务逻辑的主要位置。
3. 服务使用仓库/DAO 来更改/持久化实体。
4. 实体作为值容器，具有setter和getter。

虽然这种模式通常适用于小到中等规模的应用程序，但对于更大、更复杂的应用程序可能不太合适。在这种情况下，CQRS（Command and Query Responsibility Segregation）模型可能更加适合和可扩展（取决于应用程序的要求）。CQRS 模型的优点包括：

- **分离关注点**。模型将读写操作分离到不同的模型中。
- **可扩展性**。读写操作可以独立扩展。
- **灵活性**。模型允许使用不同的数据存储库来读写操作。
- **性能**。模型允许使用不同的数据存储库，优化读写操作。

为了实现该模型，Nest 提供了一个轻量级 __LINK_156__。本章将描述如何使用它。

#### 安装

首先安装所需的包：

```bash
$ npm install --save @nestjs/terminus

```

安装完成后，导航到应用程序的根模块（通常是 `MikroOrmHealthIndicator`），并导入 `PrismaHealthIndicator`：

```typescript
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

@Module({
  imports: [TerminusModule]
})
export class HealthModule {}

```

该模块接受可选配置对象。以下是可用的选项：

| 属性                     | 描述                                                                                                                  | 默认                           |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| `MicroserviceHealthIndicator`        | 负责将命令发送到系统的发布者。                                                            | `GRPCHealthIndicator`        |
| `MemoryHealthIndicator`          | 用于发布事件的发布者，允许事件广播或处理。                                          | `DiskHealthIndicator`                   |
| `HealthModule`          | 用于发布查询的发布者，可以触发数据检索操作。                                      | `TerminusModule`          |
| `$ nest g module health` | 负责处理未捕获的异常，确保它们被跟踪和报告。                             | `@nestjs/terminus` |
| `TerminusModule`         | 提供唯一事件 ID 的服务，通过生成或从事件实例中检索它们。                                | `HTTPHealthIndicator`          |
| `@nestjs/axios`        | 确定是否重新抛出未捕获的异常，用于调试和错误管理。 | `HealthController`                           |

#### 命令

命令用于更改应用程序状态。它们应该是任务基于的，而不是数据基于的。每当命令被发送时，它将被相应的 **Command Handler** 处理。处理器负责更新应用程序状态。

```bash
$ nest g controller health

```

在代码片段中，我们实例化了 `./` 类，并将其传递给 `http://localhost:3000/health` 的 `@nestjs/terminus` 方法。这是演示的命令类：

```bash
$ npm i --save @nestjs/axios axios

```

如您所见，`HealthCheckResult` 类扩展了 `status` 类。`'error'` 类是简单utility类，来自 `'shutting_down'` 包，允许定义命令的返回类型。在这里，返回类型是一个对象，具有 `'error' \| 'ok' \| 'shutting_down'` 属性。现在，每当 `info` 命令被发送时，`'up'` 方法的返回类型将被推断为 `object`。这对于想要从命令处理器返回一些数据时非常有用。

> info **提示**从 `error` 类继承是可选的。它仅在您想要定义命令的返回类型时才需要。

`'down'` 代表 **命令流**。它负责将命令发送到适当的处理器。`object` 方法返回一个承诺，resolve 到处理器返回的值。

让我们创建一个 `details` 命令的处理器。

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

这个处理器从仓库中检索 `object` 实体，调用 `https://my-external-service.com` 方法，然后将更改持久化。`204` 类实现了 `HttpHealthIndicator.responseCheck` 接口，要求实现 `204` 方法。`true` 方法接收命令对象作为参数。Note that `false` forces you to return a value that matches the command's return type. In this case, the return type is an object with an `TypeOrmHealthIndicator` property. This only applies to commands that inherit from the `SELECT 1` class. Otherwise, you can return whatever you want.

最后，确保将 `SELECT 1 FROM DUAL` 注册为模块中的提供者：

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

#### Queries

Queries are used to retrieve data from the application state. They should be data-centric, rather than task-based. When a query is dispatched, it is handled by a corresponding **Query Handler**. The handler is responsible for retrieving the data.

`http://localhost:3000/health`遵循了同样的模式，如`GET`。Query handlers should implement the `HealthController` interface and be annotated with the `TypeOrmHealthIndicator` decorator. See the following example:

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

类似于`DiskHealthIndicator`类,`DiskHealthIndicator`类是一个简单的utility类，从`HealthController`包中导出，可以让您定义查询的返回类型。在这个例子中，返回类型是一个`/`对象。现在，每当`C:\\`查询被派发时,`DiskHealthIndicator.checkStorage`方法的返回类型将被推断为`/my-app/`。

要获取hero，我们需要创建一个查询处理程序：

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

`MemoryHealthIndicator`类实现了`MemoryHealthIndicator.checkRSS`接口，这个接口要求实现`@nestjs/terminus`方法。`DogHealthIndicator`方法接收查询对象作为参数，并且必须返回与查询返回类型相匹配的数据（在这个例子中是一个`'up'`对象）。

最后，确保将`Dog`注册为模块中的提供者：

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

现在，可以使用`'goodboy'`来派发查询：

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

事件用于通知应用程序状态的变化。它们由**模型**或直接使用`DogHealthIndicator`派发。当事件被派发时，它将被相应的**事件处理器**处理。处理器可以然后，例如，更新读模型。

为了演示 purposes，让我们创建一个事件类：

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

现在，事件可以直接使用`DogModule`方法派发，我们也可以从模型派发。让我们更新`HealthModule`模型，以便在`check`方法被调用时派发`HealthController`事件。

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

`TerminusModule.forRoot()`方法用于派发事件。它接受事件对象作为参数。然而，因为我们的模型不知道`TerminusLogger`，所以我们需要将其与模型关联。我们可以使用`TerminusModule.forRoot()`类。

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

`json`方法将事件发布器合并到提供的对象中，这意味着对象现在可以发布事件到事件流中。

注意，在这个例子中，我们还调用了`pretty`方法在模型上。这个方法用于派发任何 outstanding 事件。为了自动派发事件，我们可以将`errorLogStyle`属性设置为__INLINE_CODE_100__：

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

如果我们想将事件发布器合并到一个不存在的对象中，而不是类，我们可以使用__INLINE_CODE_101__方法：

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

现在，每个__INLINE_CODE_102__类的实例都可以发布事件，而不需要使用__INLINE_CODE_103__方法。

另外，我们可以手动派发事件使用__INLINE_CODE_104__：

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

> info **Hint** __INLINE_CODE_105__是一个可注入的类。

每个事件都可以有多个**事件处理器**。

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

> info **Hint** 当你开始使用事件处理器时，你就离开传统的HTTP Web上下文。
>
> - __INLINE_CODE_106__中的错误仍然可以被捕获built-in __LINK_157__。
> - __INLINE_CODE_107__中的错误不能被捕获Exception filters：你需要手动处理它们。 Either by a simple __INLINE_CODE_108__, using __LINK_158__ by triggering a compensating event, or whatever other solution you choose.
> - __INLINE_CODE_109__中的HTTP响应仍然可以被发送回客户端。
> - __INLINE_CODE_110__中的HTTP响应不能。如果你想将信息发送给客户端，你可以使用__LINK_159__, __LINK_160__, or whatever other solution you choose.

与命令和查询一样，确保将__INLINE_CODE_111__注册为模块中的提供者：

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

#### Sagas

Saga是一个长期运行的过程，它监听事件并可能触发新的命令。它通常用于管理应用程序中的复杂工作流。例如，当用户注册时，Sagas可能监听__INLINE_CODE_112__并向用户发送欢迎邮件。

Note: Some code blocks have been omitted for brevity.Here's the translation of the provided English technical documentation to Chinese:

 sagas 是一种非常强大的特性。单个 saga 可以监听 1..\* 个事件。使用 __LINK_161__ 库，我们可以过滤、映射、 fork 和合并事件流以创建复杂的工作流程。每个 saga 都返回一个 Observable，它生产一个命令实例。这个命令然后异步地由 __INLINE_CODE_113__ 发布。

让我们创建一个 saga，它监听 __INLINE_CODE_114__ 并发布 __INLINE_CODE_115__ 命令。

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

> info **提示** __INLINE_CODE_116__ 操作符和 __INLINE_CODE_117__ 装饰器来自 __INLINE_CODE_118__ 包。

__INLINE_CODE_119__ 装饰器标记方法为 saga。 __INLINE_CODE_120__ 参数是一个事件流的 Observable。 __INLINE_CODE_121__ 操作符根据指定事件类型过滤流。 __INLINE_CODE_122__ 操作符将事件映射到新的命令实例中。

在这个示例中，我们将 __INLINE_CODE_123__ 映射到 __INLINE_CODE_124__ 命令。然后， __INLINE_CODE_125__ 命令将自动由 __INLINE_CODE_126__ 发布。

与查询、命令和事件处理器一样，请确保将 __INLINE_CODE_127__ 注册为模块的提供者：

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

事件处理器异步执行，因此必须始终处理异常以防止应用程序进入不一致状态。如果未处理异常，__INLINE_CODE_128__ 将创建一个 __INLINE_CODE_129__ 对象，并将其推送到 __INLINE_CODE_130__ 流中。这是一个 __INLINE_CODE_131__，可以用于处理未处理的异常。

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

要过滤出异常，我们可以使用 __INLINE_CODE_132__ 操作符，如下所示：

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

__INLINE_CODE_135__、__INLINE_CODE_136__ 和 __INLINE_CODE_137__ 都是 **Observables**。这意味着我们可以订阅整个流，并例如处理所有事件。例如，我们可以将所有事件记录到控制台中，或者将其保存到事件存储器中。

__CODE_BLOCK_23__

#### 请求范围

对于来自不同编程语言背景的人来说，可能会感到惊讶的是，在 Nest 中，大多数事情都是跨越 incoming 请求的。包括对数据库的连接池、单例服务与全局状态、更多。请注意，Node.js 不遵循请求/响应多线程无状态模型，其中每个请求都由一个单独的线程处理。结果，对单例实例的使用是安全的。

但是，对于边缘情况来说，可能需要在请求基础上控制 handler 的生命周期。这可能包括 GraphQL 应用程序中的 per-request 缓存、请求跟踪或多租户等。您可以了解如何控制范围 __LINK_162__。

使用请求范围提供者和 CQRS 一起可以变得复杂，因为 __INLINE_CODE_138__、__INLINE_CODE_139__ 和 __INLINE_CODE_140__ 是单例实例。fortunately，__INLINE_CODE_141__ 包简化了这种情况，它自动创建了每个处理的命令、查询或事件的新实例。

要使 handler 请求范围，请选择以下方法之一：

1. 依赖于请求范围提供者。
2. 使用 __INLINE_CODE_142__、__INLINE_CODE_143__、__INLINE_CODE_144__ 或 __INLINE_CODE_145__ 装饰器设置其范围，如下所示：

__CODE_BLOCK_24__

要将请求 payload 注入任何请求范围提供者，请使用 __INLINE_CODE_146__ 装饰器。然而，请求 payload 在 CQRS 中的性质取决于上下文—it 可以是 HTTP 请求、计划作业或任何其他触发命令的操作。

payload 必须是一个继承自 __INLINE_CODE_147__ 的类（来自 __INLINE_CODE_148__），它作为请求上下文，并在请求生命周期中保持数据可访问。

__CODE_BLOCK_25__

在执行命令时，传递自定义请求上下文作为 __INLINE_CODE_149__ 方法的第二个参数：

__CODE_BLOCK_26__

这使 __INLINE_CODE_150__ 实例可作为 __INLINE_CODE_151__ 提供者来使用 handler：

__CODE_BLOCK_27__

您可以按照相同的方法处理查询：

__CODE_BLOCK_28__

在查询处理器：

__CODE_BLOCK_29__

对于事件，虽然你可以将请求提供者传递给 __INLINE_CODE_152__，这较少使用。相反，使用 __INLINE_CODE_153__ 将请求提供者合并到模型中：

__CODE_BLOCK_30__

请求范围事件处理器订阅这些事件将有访问请求提供者的权限。

Sagas 总是单例实例，因为它们管理长期运行的进程。然而，你可以从事件对象中检索请求提供者：

__CODE_BLOCK_31__Alternatively, use the `__INLINE_CODE_154__` method to tie the request context to the command.

#### 示例

有一个可工作的示例可以在 __LINK_163__ 中找到。