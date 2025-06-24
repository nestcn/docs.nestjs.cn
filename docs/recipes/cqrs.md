### CQRS

简单的 [CRUD](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete)（创建、读取、更新和删除）应用程序流程可描述如下：

1.  控制器层处理 HTTP 请求并将任务委托给服务层。
2.  服务层是大部分业务逻辑所在之处。
3.  服务通过仓库/DAO 来修改/持久化实体。
4.  实体作为值的容器，包含 setter 和 getter 方法。

虽然这种模式通常足以应对中小型应用程序，但对于更大型、更复杂的应用可能并非最佳选择。这种情况下，**CQRS**(命令查询职责分离)模型可能更合适且更具扩展性(取决于应用需求)。该模型的优势包括：

- **关注点分离** 。该模型将读写操作分离到不同的模型中。
- **可扩展性** 。读写操作可以独立扩展。
- **灵活性** 。该模型允许为读写操作使用不同的数据存储。
- **性能** 。该模型允许使用针对读写操作优化的不同数据存储。

为支持该模型，Nest 提供了一个轻量级的 [CQRS 模块](https://github.com/nestjs/cqrs) 。本章将介绍如何使用它。

#### 安装

首先安装所需的包：

```bash
$ npm install --save @nestjs/cqrs
```

安装完成后，导航至应用程序的根模块（通常是 `AppModule`），并导入 `CqrsModule.forRoot()`：

```typescript
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

@Module({
  imports: [CqrsModule.forRoot()],
})
export class AppModule {}
```

该模块接受一个可选的配置对象。以下是可用的选项：

| 属性                        | 描述                                                                   | 默认                            |
| --------------------------- | ---------------------------------------------------------------------- | ------------------------------- |
| commandPublisher            | 负责向系统发送命令的发布者。                                           | DefaultCommandPubSub            |
| eventPublisher              | 用于发布事件的发布者，允许事件被广播或处理。                           | DefaultPubSub                   |
| queryPublisher              | 用于发布查询的发布者，可触发数据检索操作。                             | DefaultQueryPubSub              |
| unhandledExceptionPublisher | 负责处理未捕获异常的发布者，确保异常被追踪和报告。                     | DefaultUnhandledExceptionPubSub |
| eventIdProvider             | 通过生成或从事件实例中检索来提供唯一事件 ID 的服务。                   | DefaultEventIdProvider          |
| rethrowUnhandled            | 确定未处理的异常在被处理后是否应重新抛出，这对调试和错误管理非常有用。 | false                           |

#### 命令

命令用于改变应用程序状态。它们应基于任务而非以数据为中心。当命令被分派时，将由对应的**命令处理器**进行处理。该处理器负责更新应用程序状态。

```typescript
@@filename(heroes-game.service)
@Injectable()
export class HeroesGameService {
  constructor(private commandBus: CommandBus) {}

  async killDragon(heroId: string, killDragonDto: KillDragonDto) {
    return this.commandBus.execute(
      new KillDragonCommand(heroId, killDragonDto.dragonId)
    );
  }
}
@@switch
@Injectable()
@Dependencies(CommandBus)
export class HeroesGameService {
  constructor(commandBus) {
    this.commandBus = commandBus;
  }

  async killDragon(heroId, killDragonDto) {
    return this.commandBus.execute(
      new KillDragonCommand(heroId, killDragonDto.dragonId)
    );
  }
}
```

在上述代码片段中，我们实例化了 `KillDragonCommand` 类并将其传递给 `CommandBus` 的 `execute()` 方法。以下是演示的命令类：

```typescript
@@filename(kill-dragon.command)
export class KillDragonCommand extends Command<{
  actionId: string // This type represents the command execution result
}> {
  constructor(
    public readonly heroId: string,
    public readonly dragonId: string,
  ) {}
}
@@switch
export class KillDragonCommand extends Command {
  constructor(heroId, dragonId) {
    this.heroId = heroId;
    this.dragonId = dragonId;
  }
}
```

如你所见，`KillDragonCommand` 类继承自 `Command` 类。`Command` 是从 `@nestjs/cqrs` 包导出的简单工具类，可用于定义命令的返回类型。本例中返回类型是一个包含 `actionId` 属性的对象。现在每当 `KillDragonCommand` 命令被派发时，`CommandBus#execute()` 方法的返回类型将被推断为 `Promise<{{ '{' }} actionId: string {{ '}' }}>` 。这在需要从命令处理器返回数据时非常有用。

> info **提示** 继承 `Command` 类是可选的，仅当需要定义命令返回类型时才必须使用。

`CommandBus` 表示一个命令**流** ，负责将命令分派给相应的处理程序。`execute()` 方法返回一个 Promise，该 Promise 会解析为处理程序返回的值。

让我们为 `KillDragonCommand` 命令创建一个处理程序。

```typescript
@@filename(kill-dragon.handler)
@CommandHandler(KillDragonCommand)
export class KillDragonHandler implements ICommandHandler<KillDragonCommand> {
  constructor(private repository: HeroesRepository) {}

  async execute(command: KillDragonCommand) {
    const { heroId, dragonId } = command;
    const hero = this.repository.findOneById(+heroId);

    hero.killEnemy(dragonId);
    await this.repository.persist(hero);

    // "ICommandHandler<KillDragonCommand>" forces you to return a value that matches the command's return type
    return {
      actionId: crypto.randomUUID(), // This value will be returned to the caller
    }
  }
}
@@switch
@CommandHandler(KillDragonCommand)
@Dependencies(HeroesRepository)
export class KillDragonHandler {
  constructor(repository) {
    this.repository = repository;
  }

  async execute(command) {
    const { heroId, dragonId } = command;
    const hero = this.repository.findOneById(+heroId);

    hero.killEnemy(dragonId);
    await this.repository.persist(hero);

    // "ICommandHandler<KillDragonCommand>" forces you to return a value that matches the command's return type
    return {
      actionId: crypto.randomUUID(), // This value will be returned to the caller
    }
  }
}
```

该处理程序从存储库中获取 `Hero` 实体，调用 `killEnemy()` 方法，然后持久化更改。`KillDragonHandler` 类实现了 `ICommandHandler` 接口，该接口要求实现 `execute()` 方法。`execute()` 方法接收命令对象作为参数。

请注意 `ICommandHandler<KillDragonCommand>` 强制要求返回与命令返回类型匹配的值。在本例中，返回类型是一个包含 `actionId` 属性的对象。这仅适用于继承自 `Command` 类的命令。否则，您可以返回任意内容。

最后，请确保将 `KillDragonHandler` 作为提供者注册到模块中：

```typescript
providers: [KillDragonHandler];
```

#### 查询

查询用于从应用状态中检索数据。它们应以数据为中心，而非基于任务。当查询被派发时，会由对应的**查询处理器**进行处理。处理器负责检索数据。

`QueryBus` 遵循与 `CommandBus` 相同的模式。查询处理器应实现 `IQueryHandler` 接口，并使用 `@QueryHandler()` 装饰器进行标注。参见以下示例：

```typescript
export class GetHeroQuery extends Query<Hero> {
  constructor(public readonly heroId: string) {}
}
```

与 `Command` 类类似，`Query` 类是从 `@nestjs/cqrs` 包导出的一个简单工具类，用于定义查询的返回类型。在本例中，返回类型为 `Hero` 对象。现在，每当 `GetHeroQuery` 查询被派发时，`QueryBus#execute()` 方法的返回类型将被推断为 `Promise<Hero>`。

要获取英雄数据，我们需要创建一个查询处理器：

```typescript
@@filename(get-hero.handler)
@QueryHandler(GetHeroQuery)
export class GetHeroHandler implements IQueryHandler<GetHeroQuery> {
  constructor(private repository: HeroesRepository) {}

  async execute(query: GetHeroQuery) {
    return this.repository.findOneById(query.hero);
  }
}
@@switch
@QueryHandler(GetHeroQuery)
@Dependencies(HeroesRepository)
export class GetHeroHandler {
  constructor(repository) {
    this.repository = repository;
  }

  async execute(query) {
    return this.repository.findOneById(query.hero);
  }
}
```

`GetHeroHandler` 类实现了 `IQueryHandler` 接口，该接口要求实现 `execute()` 方法。`execute()` 方法接收查询对象作为参数，并必须返回与查询返回类型匹配的数据（在本例中为 `Hero` 对象）。

最后，请确保将 `GetHeroHandler` 注册为模块的提供者：

```typescript
providers: [GetHeroHandler];
```

现在，要发送查询，请使用 `QueryBus`：

```typescript
const hero = await this.queryBus.execute(new GetHeroQuery(heroId)); // "hero" will be auto-inferred as "Hero" type
```

#### 事件

事件用于通知应用程序的其他部分有关应用程序状态的变更。它们由**模型**或直接通过 `EventBus` 发送。当事件被发送时，相应的**事件处理器**会进行处理。处理器随后可以执行诸如更新读取模型等操作。

出于演示目的，让我们创建一个事件类：

```typescript
@@filename(hero-killed-dragon.event)
export class HeroKilledDragonEvent {
  constructor(
    public readonly heroId: string,
    public readonly dragonId: string,
  ) {}
}
@@switch
export class HeroKilledDragonEvent {
  constructor(heroId, dragonId) {
    this.heroId = heroId;
    this.dragonId = dragonId;
  }
}
```

虽然可以直接使用 `EventBus.publish()` 方法派发事件，但我们也可以从模型中进行派发。让我们更新 `Hero` 模型，使其在调用 `killEnemy()` 方法时派发 `HeroKilledDragonEvent` 事件。

```typescript
@@filename(hero.model)
export class Hero extends AggregateRoot {
  constructor(private id: string) {
    super();
  }

  killEnemy(enemyId: string) {
    // Business logic
    this.apply(new HeroKilledDragonEvent(this.id, enemyId));
  }
}
@@switch
export class Hero extends AggregateRoot {
  constructor(id) {
    super();
    this.id = id;
  }

  killEnemy(enemyId) {
    // Business logic
    this.apply(new HeroKilledDragonEvent(this.id, enemyId));
  }
}
```

`apply()` 方法用于派发事件，它接受一个事件对象作为参数。但由于我们的模型并不知道 `EventBus` 的存在，我们需要将其与模型关联。这可以通过使用 `EventPublisher` 类来实现。

```typescript
@@filename(kill-dragon.handler)
@CommandHandler(KillDragonCommand)
export class KillDragonHandler implements ICommandHandler<KillDragonCommand> {
  constructor(
    private repository: HeroesRepository,
    private publisher: EventPublisher,
  ) {}

  async execute(command: KillDragonCommand) {
    const { heroId, dragonId } = command;
    const hero = this.publisher.mergeObjectContext(
      await this.repository.findOneById(+heroId),
    );
    hero.killEnemy(dragonId);
    hero.commit();
  }
}
@@switch
@CommandHandler(KillDragonCommand)
@Dependencies(HeroesRepository, EventPublisher)
export class KillDragonHandler {
  constructor(repository, publisher) {
    this.repository = repository;
    this.publisher = publisher;
  }

  async execute(command) {
    const { heroId, dragonId } = command;
    const hero = this.publisher.mergeObjectContext(
      await this.repository.findOneById(+heroId),
    );
    hero.killEnemy(dragonId);
    hero.commit();
  }
}
```

`EventPublisher#mergeObjectContext` 方法将事件发布器合并到目标对象中，这意味着该对象现在能够向事件流发布事件。

注意在这个例子中我们还调用了模型上的 `commit()` 方法。这个方法用于派发所有待处理的事件。要实现自动派发事件，我们可以将 `autoCommit` 属性设为 `true`：

```typescript
export class Hero extends AggregateRoot {
  constructor(private id: string) {
    super();
    this.autoCommit = true;
  }
}
```

若要将事件发布器合并到一个不存在的对象中，而是合并到一个类里，我们可以使用 `EventPublisher#mergeClassContext` 方法：

```typescript
const HeroModel = this.publisher.mergeClassContext(Hero);
const hero = new HeroModel('id'); // <-- HeroModel is a class
```

现在每个 `HeroModel` 类的实例都能在不使用 `mergeObjectContext()` 方法的情况下发布事件。

此外，我们还可以手动通过 `EventBus` 触发事件：

```typescript
this.eventBus.publish(new HeroKilledDragonEvent());
```

> info **提示** `EventBus` 是一个可注入的类。

每个事件可以包含多个**事件处理器** 。

```typescript
@@filename(hero-killed-dragon.handler)
@EventsHandler(HeroKilledDragonEvent)
export class HeroKilledDragonHandler implements IEventHandler<HeroKilledDragonEvent> {
  constructor(private repository: HeroesRepository) {}

  handle(event: HeroKilledDragonEvent) {
    // Business logic
  }
}
```

> **提示** 请注意，当你开始使用事件处理器时，你将脱离传统的 HTTP 网络上下文。
>
> - `命令处理器`中的错误仍可被内置的[异常过滤器](/exception-filters)捕获。
> - `事件处理器`中的错误无法被异常过滤器捕获：你必须手动处理它们。可以通过简单的 `try/catch`，使用 [Sagas](/recipes/cqrs#sagas) 触发补偿事件，或选择其他任何解决方案。
> - 在 `CommandHandlers` 中的 HTTP 响应仍可返回给客户端。
> - 而在 `EventHandlers` 中则无法返回 HTTP 响应。如需向客户端发送信息，可采用 [WebSocket](/websockets/gateways)、[SSE](/techniques/server-sent-events) 或其他自选方案。

与命令和查询处理类似，请确保将 `HeroKilledDragonHandler` 作为提供者在模块中注册：

```typescript
providers: [HeroKilledDragonHandler];
```

#### Sagas

Saga 是一个长期运行的进程，它监听事件并可能触发新的命令。通常用于管理应用程序中的复杂工作流。例如，当用户注册时，一个 saga 可能会监听 `UserRegisteredEvent` 并向用户发送欢迎邮件。

Saga 是一个极其强大的功能。单个 saga 可以监听 1..\* 个事件。使用 [RxJS](https://github.com/ReactiveX/rxjs) 库，我们可以对事件流进行过滤、映射、分支和合并，以创建复杂的工作流。每个 saga 返回一个 Observable，该 Observable 会产生一个命令实例。然后这个命令会被 `CommandBus` **异步**分发。

让我们创建一个 saga，它监听 `HeroKilledDragonEvent` 并分发 `DropAncientItemCommand` 命令。

```typescript
@@filename(heroes-game.saga)
@Injectable()
export class HeroesGameSagas {
  @Saga()
  dragonKilled = (events$: Observable<any>): Observable<ICommand> => {
    return events$.pipe(
      ofType(HeroKilledDragonEvent),
      map((event) => new DropAncientItemCommand(event.heroId, fakeItemID)),
    );
  }
}
@@switch
@Injectable()
export class HeroesGameSagas {
  @Saga()
  dragonKilled = (events$) => {
    return events$.pipe(
      ofType(HeroKilledDragonEvent),
      map((event) => new DropAncientItemCommand(event.heroId, fakeItemID)),
    );
  }
}
```

> info **提示** `ofType` 操作符和 `@Saga()` 装饰器是从 `@nestjs/cqrs` 包中导出的。

`@Saga()` 装饰器将方法标记为一个 saga。`events$` 参数是一个包含所有事件的 Observable 流。`ofType` 操作符通过指定的事件类型过滤该流。`map` 操作符将事件映射为一个新的命令实例。

在这个示例中，我们将 `HeroKilledDragonEvent` 映射为 `DropAncientItemCommand` 命令。随后 `DropAncientItemCommand` 命令会被 `CommandBus` 自动派发。

与查询、命令和事件处理器一样，请确保将 `HeroesGameSagas` 注册为模块中的提供者：

```typescript
providers: [HeroesGameSagas];
```

#### 未处理的异常

事件处理程序是异步执行的，因此必须始终正确处理异常，以防止应用程序进入不一致状态。如果未处理异常，`EventBus` 会创建一个 `UnhandledExceptionInfo` 对象并将其推送到 `UnhandledExceptionBus` 流中。该流是一个可用于处理未捕获异常的 `Observable`。

```typescript
private destroy$ = new Subject<void>();

constructor(private unhandledExceptionsBus: UnhandledExceptionBus) {
  this.unhandledExceptionsBus
    .pipe(takeUntil(this.destroy$))
    .subscribe((exceptionInfo) => {
      // Handle exception here
      // e.g. send it to external service, terminate process, or publish a new event
    });
}

onModuleDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}
```

要过滤特定异常，我们可以使用 `ofType` 操作符，如下所示：

```typescript
this.unhandledExceptionsBus
  .pipe(
    takeUntil(this.destroy$),
    UnhandledExceptionBus.ofType(TransactionNotAllowedException)
  )
  .subscribe((exceptionInfo) => {
    // Handle exception here
  });
```

其中 `TransactionNotAllowedException` 表示我们要过滤的异常类型。

`UnhandledExceptionInfo` 对象包含以下属性：

```typescript
export interface UnhandledExceptionInfo<
  Cause = IEvent | ICommand,
  Exception = any
> {
  /**
   * The exception that was thrown.
   */
  exception: Exception;
  /**
   * The cause of the exception (event or command reference).
   */
  cause: Cause;
}
```

#### 订阅所有事件

`CommandBus`、`QueryBus` 和 `EventBus` 都是**可观察对象(Observables)**。这意味着我们可以订阅整个事件流，例如处理所有事件。我们可以将所有事件记录到控制台，或将它们保存到事件存储中。

```typescript
private destroy$ = new Subject<void>();

constructor(private eventBus: EventBus) {
  this.eventBus
    .pipe(takeUntil(this.destroy$))
    .subscribe((event) => {
      // Save events to database
    });
}

onModuleDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}
```

#### 请求作用域

对于来自不同编程语言背景的开发者来说，可能会惊讶地发现：在 Nest 中，大多数内容都是在传入请求间共享的。这包括数据库连接池、具有全局状态的单例服务等。需要注意的是，Node.js 并不遵循请求/响应多线程无状态模型（即每个请求由独立线程处理）。因此，在我们的应用中使用单例实例是**安全**的。

然而，在某些边缘情况下，可能需要基于请求的生命周期来管理处理器。这包括诸如 GraphQL 应用中的按请求缓存、请求追踪或多租户等场景。您可[在此](/fundamentals/injection-scopes)了解更多关于控制作用域的方法。

将请求作用域的提供者与 CQRS 一起使用可能会很复杂，因为 `CommandBus`、`QueryBus` 和 `EventBus` 都是单例。幸运的是，`@nestjs/cqrs` 包通过为每个处理的命令、查询或事件自动创建请求作用域处理程序的新实例，简化了这一过程。

要使处理程序成为请求作用域的，你可以选择以下方式之一：

1.  依赖于一个请求作用域的提供者。
2.  使用 `@CommandHandler`、`@QueryHandler` 或 `@EventsHandler` 装饰器，将其作用域显式设置为 `REQUEST`，如下所示：

```typescript
@CommandHandler(KillDragonCommand, {
  scope: Scope.REQUEST,
})
export class KillDragonHandler {
  // Implementation here
}
```

要将请求负载注入到任何请求作用域的提供者中，可以使用 `@Inject(REQUEST)` 装饰器。然而，在 CQRS 中请求负载的性质取决于上下文——它可能是一个 HTTP 请求、一个定时任务或任何触发命令的操作。

有效载荷必须是继承自 `AsyncContext`（由 `@nestjs/cqrs` 提供）的类实例，该上下文作为请求上下文并持有可在整个请求生命周期中访问的数据。

```typescript
import { AsyncContext } from '@nestjs/cqrs';

export class MyRequest extends AsyncContext {
  constructor(public readonly user: User) {
    super();
  }
}
```

执行命令时，将自定义请求上下文作为第二个参数传递给 `CommandBus#execute` 方法：

```typescript
const myRequest = new MyRequest(user);
await this.commandBus.execute(
  new KillDragonCommand(heroId, killDragonDto.dragonId),
  myRequest
);
```

这使得 `MyRequest` 实例可作为 `REQUEST` 提供者供对应的处理器使用：

```typescript
@CommandHandler(KillDragonCommand, {
  scope: Scope.REQUEST,
})
export class KillDragonHandler {
  constructor(
    @Inject(REQUEST) private request: MyRequest // Inject the request context
  ) {}

  // Handler implementation here
}
```

对于查询也可以采用相同的方法：

```typescript
const myRequest = new MyRequest(user);
const hero = await this.queryBus.execute(new GetHeroQuery(heroId), myRequest);
```

在查询处理器中：

```typescript
@QueryHandler(GetHeroQuery, {
  scope: Scope.REQUEST,
})
export class GetHeroHandler {
  constructor(
    @Inject(REQUEST) private request: MyRequest // Inject the request context
  ) {}

  // Handler implementation here
}
```

对于事件，虽然可以将请求提供者传递给 `EventBus#publish`，但这种情况较为少见。通常的做法是使用 `EventPublisher` 将请求提供者合并到模型中：

```typescript
const hero = this.publisher.mergeObjectContext(
  await this.repository.findOneById(+heroId),
  this.request // Inject the request context here
);
```

订阅这些事件的请求作用域事件处理器将能够访问该请求提供者。

Saga 总是单例实例，因为它们管理的是长期运行流程。不过，您可以从事件对象中获取请求提供者：

```typescript
@Saga()
dragonKilled = (events$: Observable<any>): Observable<ICommand> => {
  return events$.pipe(
    ofType(HeroKilledDragonEvent),
    map((event) => {
      const request = AsyncContext.of(event); // Retrieve the request context
      const command = new DropAncientItemCommand(event.heroId, fakeItemID);

      AsyncContext.merge(request, command); // Merge the request context into the command
      return command;
    }),
  );
}
```

或者，使用 `request.attachTo(command)` 方法将请求上下文绑定到命令上。

#### 示例

一个可用的示例[在此处](https://github.com/kamilmysliwiec/nest-cqrs-example)查看。
