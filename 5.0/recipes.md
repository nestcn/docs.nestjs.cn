# 秘籍

## SQL (TypeORM)

!> 在本文中，您将学习如何使用自定义提供者机制从零开始创建基于 **TypeORM** 包的 `DatabaseModule` 。由于该解决方案包含许多开销，因此您可以使用开箱即用的 `@nestjs/typeorm` 软件包。要了解更多信息，请参阅 [此处](5.0/techniques?id=数据库)。


[TypeORM](https://github.com/typeorm/typeorm) 无疑是 node.js 世界中最成熟的对象关系映射器（ORM）。由于它是用 TypeScript 编写的，所以它在 Nest 框架下运行得非常好。在开始使用这个库前，我们必须安装所有必需的依赖关系：

```
$ npm install --save typeorm mysql
```

我们需要做的第一步是使用从 `typeorm` 包导入的 `createConnection()` 函数建立与数据库的连接。`createConnection()` 函数返回一个 `Promise`，因此我们必须创建一个异步提供者。

> database.providers.ts

```typescript
import { createConnection } from 'typeorm';

export const databaseProviders = [
  {
    provide: 'DbConnectionToken',
    useFactory: async () => await createConnection({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'test',
      entities: [
          __dirname + '/../**/*.entity{.ts,.js}',
      ],
      synchronize: true,
    }),
  },
];
```

?> 按照最佳实践，我们在分离的文件中声明了自定义提供者，该文件带有 `*.providers.ts` 后缀。

然后，我们需要导出这些提供者，以便应用程序的其余部分可以 **访问** 它们。

> database.module.ts

```typescript
import { Module } from '@nestjs/common';
import { databaseProviders } from './database.providers';

@Module({
  providers: [...databaseProviders],
  exports: [...databaseProviders],
})
export class DatabaseModule {}
```

现在我们可以使用 `@Inject()` 装饰器注入 `Connection` 对象。依赖于 `Connection` 异步提供者的每个类都将等待解析 `Promise` 。

### 存储库模式

[TypeORM](https://github.com/typeorm/typeorm) 支持存储库设计模式，因此每个实体都有自己的存储库。这些资料库可以从数据库连接中获取。

但首先，我们至少需要一个实体。我们将重用官方文档中的 `Photo` 实体。

> photo/photo.entity.ts

```typescript
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Photo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 500 })
  name: string;

  @Column('text')
  description: string;

  @Column()
  filename: string;

  @Column('int')
  views: number;

  @Column()
  isPublished: boolean;
}
```

`Photo` 实体属于 `photo` 目录。此目录代表 `PhotoModule` 。现在，让我们创建一个 **存储库** 提供者:

> photo.providers.ts

```typescript
import { Connection, Repository } from 'typeorm';
import { Photo } from './photo.entity';

export const photoProviders = [
  {
    provide: 'PhotoRepositoryToken',
    useFactory: (connection: Connection) => connection.getRepository(Photo),
    inject: ['DbConnectionToken'],
  },
];
```

!> 请注意，在实际应用程序中，您应该避免使用魔术字符串。`PhotoRepositoryToken` 和 `DbConnectionToken` 都应保存在分离的 `constants.ts` 文件中。

现在我们可以使用 `@Inject()` 装饰器将 `PhotoRepository` 注入到 `PhotoService` 中：

> photo.service.ts

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Photo } from './photo.entity';

@Injectable()
export class PhotoService {
  constructor(
    @Inject('PhotoRepositoryToken')
    private readonly photoRepository: Repository<Photo>,
  ) {}

  async findAll(): Promise<Photo[]> {
    return await this.photoRepository.find();
  }
}
```

数据库连接是 **异步** 的，但 Nest 使最终用户完全看不到这个过程。`PhotoRepository` 正在等待数据库连接时，`PhotoService` 被延迟，直到存储库准备好使用。整个应用程序可以在每个类实例化时启动。

这是一个最终的 `PhotoModule` ：

> photo.module.ts

```typescript
import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { photoProviders } from './photo.providers';
import { PhotoService } from './photo.service';

@Module({
  imports: [DatabaseModule],
  providers: [
    ...photoProviders,
    PhotoService,
  ],
})
export class PhotoModule {}
```

!> 不要忘记将 `PhotoModule` 导入到根 `ApplicationModule` 中。

## CQRS

最简单的 **CRUD** 应用程序的流程可以使用以下步骤来描述:

1. 控制器层处理HTTP请求并将任务委派给服务。
2. 服务层是正在执行大部分业务逻辑的地方。
3. 服务使用存储库或 DAOs 来更改/保留实体。
4. 实体是我们的模型 - 只有容器的值，setters 和 getters 。

这就是为什么 Nest 提供了一个轻量级的 CQRS 模块，这些模块的组件在下面有详细描述。

### Commands

为了使应用程序更易于理解，每个更改都必须以 **Command** 开头。当任何命令被分派时，应用程序必须对其作出反应。命令可以从服务中分派并在相应的 **Command 处理程序** 中使用。

> heroes-game.service.ts

```typescript
@Injectable()
export class HeroesGameService {
  constructor(private readonly commandBus: CommandBus) {}

  async killDragon(heroId: string, killDragonDto: KillDragonDto) {
    return await this.commandBus.execute(
      new KillDragonCommand(heroId, killDragonDto.dragonId)
    );
  }
}
```

这里有一个示例服务, 它调度 `KillDragonCommand` 。让我们来看看这个命令:

> kill-dragon.command.ts

```typescript
export class KillDragonCommand implements ICommand {
  constructor(
    public readonly heroId: string,
    public readonly dragonId: string,
  ) {}
}
```

这个 `CommandBus` 是一个命令 **「流」** 。它将命令委托给等效的处理程序。每个命令必须有相应的命令处理程序：

> kill-dragon.handler.ts

```typescript
@CommandHandler(KillDragonCommand)
export class KillDragonHandler implements ICommandHandler<KillDragonCommand> {
  constructor(private readonly repository: HeroRepository) {}

  async execute(command: KillDragonCommand, resolve: (value?) => void) {
    const { heroId, dragonId } = command;
    const hero = this.repository.findOneById(+heroId);

    hero.killEnemy(dragonId);
    await this.repository.persist(hero);
    resolve();
  }
}
```

现在，每个应用程序状态更改都是 **Command** 发生的结果。逻辑被封装在处理程序中。我们可以简单地在这里添加日志，甚至我们可以在数据库中保留我们的命令 (例如，用于诊断目的)。

为什么我们需要 `resolve()` 函数？有时，我们可能希望从处理程序返回消息到服务。此外，我们可以在 `execute()` 方法的开头调用此函数，因此应用程序首先返回到服务中，然后将响应反馈给客户端，然后 **异步** 返回到这里处理发送的命令。

### 事件（Events）

由于我们在处理程序中封装了命令，所以我们阻止了它们之间的交互-应用程序结构仍然不灵活，不具有响应性。解决方案是使用事件。

> hero-killed-dragon.event.ts

```typescript
export class HeroKilledDragonEvent implements IEvent {
  constructor(
    public readonly heroId: string,
    public readonly dragonId: string) {}
}
```

事件是异步的。他们由模型调用。模型必须扩展这个 `AggregateRoot` 类。

> hero.model.ts

```typescript
export class Hero extends AggregateRoot {
  constructor(private readonly id: string) {
    super();
  }

  killEnemy(enemyId: string) {
    // logic
    this.apply(new HeroKilledDragonEvent(this.id, enemyId));
  }
}
```

`apply()` 方法尚未发送事件，因为模型和 `EventPublisher` 类之间没有关系。如何辨别 `publisher` 的模型？ 我们需要在我们的命令处理程序中使用一个 publisher `mergeObjectContext()` 方法。

> kill-dragon.handler.ts

```typescript
@CommandHandler(KillDragonCommand)
export class KillDragonHandler implements ICommandHandler<KillDragonCommand> {
  constructor(
    private readonly repository: HeroRepository,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(command: KillDragonCommand, resolve: (value?) => void) {
    const { heroId, dragonId } = command;
    const hero = this.publisher.mergeObjectContext(
      await this.repository.findOneById(+heroId),
    );
    hero.killEnemy(dragonId);
    hero.commit();
    resolve();
  }
}
```

现在，一切都按我们预期的方式工作。注意，我们需要 commit() 事件，因为他们没有立即调用。当然，一个对象不一定已经存在。我们也可以轻松地合并类型上下文:

```typescript
const HeroModel = this.publisher.mergeContext(Hero);
new HeroModel('id');
```

就是这样。模型现在能够发布事件。我们得处理他们。

每个事件都可以有许多事件处理程序。他们不必知道对方。

> hero-killed-dragon.handler.ts

```typescript
@EventsHandler(HeroKilledDragonEvent)
export class HeroKilledDragonHandler implements IEventHandler<HeroKilledDragonEvent> {
  constructor(private readonly repository: HeroRepository) {}

  handle(event: HeroKilledDragonEvent) {
    // logic
  }
}
```

现在，我们可以将写入逻辑移动到事件处理程序中。

### Sagas

这种类型的 **事件驱动架构** 可以提高应用程序的 **反应性** 和 **可伸缩性** 。现在, 当我们有了事件, 我们可以简单地以各种方式对他们作出反应。**sagas** 是从建筑学的观点来看的最后积木。

sagas 是一个非常强大的功能。单身传奇可以监听听 1..* 事件。它可以组合，合并，过滤事件流。[RxJS](https://github.com/ReactiveX/rxjs) 库是魔术的来源地。简单地说, 每个 sagas 都必须返回一个包含命令的Observable。此命令是 **异步** 调用的。

> heroes-game.saga.ts

```typescript
@Component()
export class HeroesGameSagas {
  dragonKilled = (events$: EventObservable<any>): Observable<ICommand> => {
    return events$.ofType(HeroKilledDragonEvent)
      .map((event) => new DropAncientItemCommand(event.heroId, fakeItemID));
  }
}
```

我们宣布一个规则，当任何英雄杀死龙-它应该得到古老的项目。然后，`DropAncientItemCommand` 将被适当的处理程序调度和处理。

### 建立（Setup）

最后一件事, 我们要处理的是建立整个机制。

> heroes-game.module.ts

```typescript
export const CommandHandlers = [KillDragonHandler, DropAncientItemHandler];
export const EventHandlers =  [HeroKilledDragonHandler, HeroFoundItemHandler];

@Module({
  imports: [CQRSModule],
  controllers: [HeroesGameController],
  providers: [
    HeroesGameService,
    HeroesGameSagas,
    ...CommandHandlers,
    ...EventHandlers,
    HeroRepository,
  ]
})
export class HeroesGameModule implements OnModuleInit {
  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly command$: CommandBus,
    private readonly event$: EventBus,
    private readonly heroesGameSagas: HeroesGameSagas,
  ) {}

  onModuleInit() {
    this.command$.setModuleRef(this.moduleRef);
    this.event$.setModuleRef(this.moduleRef);

    this.event$.register(EventHandlers);
    this.command$.register(CommandHandlers);
    this.event$.combineSagas([
      this.heroesGameSagas.dragonKilled,
    ]);
  }
}
```

### 概要

`CommandBus` 和 `EventBus` 都是 **Observables** 。这意味着您可以轻松地订阅整个「流」, 并通过  **Event Sourcing** 丰富您的应用程序。

完整的源代码在 [这里](https://github.com/kamilmysliwiec/nest-cqrs-example) 可用。