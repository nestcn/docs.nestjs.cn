# 秘籍

## SQL（TypeORM）

!> 在本文中，您将学习如何使用自定义组件从头开始 基于TypeORM 包创建的 DatabaseModule。因此，此解决方案包含许多额外开销，您可以使用开箱即用的  @nestjs/typeorm 。要了解更多信息，请参阅[此处](4.6/techniques?id=sql)。

TypeORM 无疑是 node.js 界中最成熟的对象关系映射器（ORM）。由于它是用 TypeScript 编写的，所以它在 Nest 框架下运行得非常好。要开始使用这个库，我们必须安装所有必需的依赖关系：

```bash
$ npm install --save typeorm mysql
```

我们需要做的第一步是使用 从 typeorm 包中的 createConnection() 函数建立与我们数据库的连接。该createConnection() 函数返回 Promise，所以有必要创建一个异步组件。

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
      autoSchemaSync: true,
    }),
  },
];
```

?> 遵循最佳做法，我们已在具有*.providers.ts后缀的分隔文件中声明了自定义组件。

然后，我们需要导出这些提供程序，以使其可以在应用程序的其它部分访问它们。

> database.module.ts

```typescript
import { Module } from '@nestjs/common';
import { databaseProviders } from './database.providers';

@Module({
  components: [...databaseProviders],
  exports: [...databaseProviders],
})
export class DatabaseModule {}
```

这就是所有。现在我们可以通过 Connection 使用 @Inject() 装饰器注入对象。每个依赖于 Connection 异步组件的组件都将等待，直到 Promise 解决。

### 存储库模式

该TypeORM支持库的设计模式，使每个实体都有自己的仓库。这些存储库可以从数据库连接中获取。

首先，我们至少需要一个实体。我们将重用 Photo 官方文档中的实体。

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

该 Photo 实体属于该 photo 目录。这个目录代表了 PhotoModule。这是你决定在哪里保留你的模型文件。从我的观点来看，最好的方法是将它们放在他们的域中, 放在相应的模块目录中。

我们来创建一个 Repository 组件：

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

!> 在真实使用中，你应该避免使用魔术字符串。双方 PhotoRepositoryToken 和 DbConnectionToken 应保持在不同的constants.ts 文件。

现在我们可以注入 PhotoRepository 到 PhotoService 使用 @Inject() 装饰器。

> photo.service.ts

```typescript
import { Component, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Photo } from './photo.entity';

@Component()
export class PhotoService {
  constructor(
    @Inject('PhotoRepositoryToken') private readonly photoRepository: Repository<Photo>) {}

  async findAll(): Promise<Photo[]> {
    return await this.photoRepository.find();
  }
}
```

数据库连接是异步的，但 Nest 使最终用户对此进程完全不可见。该 PhotoRepository 组件正在等待数据库连接，并且PhotoService 被推迟直到存储库准备好使用。整个应用程序可以在每个组件实例化时启动。

这是一个 最终 PhotoModule：

> photo.module.ts

```typescript
import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { photoProviders } from './photo.providers';
import { PhotoService } from './photo.service';

@Module({
  imports: [DatabaseModule],
  components: [
    ...photoProviders,
    PhotoService,
  ],
})
export class PhotoModule {}
```

?> 不要忘记将 PhotoModule 导入根 ApplicationModule。

## MongoDB (Mongoose)

（待翻译，不推荐使用）

## SQL（Sequelize）

（待翻译）

## 身份验证（Passport）

[与这里相同](4.6/techniques?id=身份验证（passport）)

## CORS

最简单的CRUD应用程序的流程可以使用以下步骤来描述：

1. 控制器层处理HTTP请求并将任务委派给服务。
2. 服务层是正在执行大部分业务逻辑的地方。
3. 服务使用 存储库或DAOs 来更改/保留实体。
4. 实体是我们的模型 - 只有容器的值，setters 和 getters 。

这是一个好办法吗？是的。在大多数情况下, 我们不应该使中小型应用程序更复杂。但有时候这样是不够的, 当我们的需求变得更加复杂的时候, 我们希望有可伸缩的系统与简单的数据流。

这就是为什么 Nest 提供了一个轻量级CQRS模块的原因，下面详细描述了这些组件。

### Commands

为了使应用程序更易于理解，每个更改都必须以 Command 开头。当发送任何命令时 - 应用程序必须对其作出反应。命令可能会从服务中分派并在适当的 Command 处理程序中使用。

> heroes-game.service.ts

```typescript
@Component()
export class HeroesGameService {
  constructor(private readonly commandBus: CommandBus) {}

  async killDragon(heroId: string, killDragonDto: KillDragonDto) {
    return await this.commandBus.execute(
      new KillDragonCommand(heroId, killDragonDto.dragonId)
    );
  }
}
```
这里有一个示例服务, 它调度 KillDragonCommand。让我们来看看这个命令:

> kill-dragon.command.ts

```typescript
export class KillDragonCommand implements ICommand {
  constructor(
    public readonly heroId: string,
    public readonly dragonId: string) {}
}
```
这个 CommandBus 是一个命令「流」。它将命令委托给等效的处理程序。每个命令必须有相应的命令处理程序：

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
现在, 每个应用程序状态更改都是 Command 发生的结果。逻辑被封装在处理程序中。我们可以简单地在这里添加日志, 甚至我们可以在数据库中保留我们的命令 (例如, 用于诊断目的)。

为什么我们需要 resolve() 函数？有时, 我们可能希望从处理程序返回消息到服务。此外, 我们可以在 execute() 方法的开头调用此函数, 因此应用程序首先返回到服务中, 然后将响应反馈给客户端, 然后异步返回到这里处理发送的命令。

### 事件（Events）

由于我们在处理程序中封装了命令, 所以我们阻止了它们之间的交互-应用程序结构仍然不灵活, 不具有响应性。解决方案是使用事件。

> hero-killed-dragon.event.ts

```typescript
export class HeroKilledDragonEvent implements IEvent {
  constructor(
    public readonly heroId: string,
    public readonly dragonId: string) {}
}
```

事件是异步的。他们由模型调用。模型必须扩展这个 AggregateRoot 类。

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
apply() 方法尚未发送事件, 因为模型和 EventPublisher 类之间没有关系。如何辨别 publisher 的模型？我们需要在我们的命令处理程序中使用一个 publisher mergeObjectContext() 方法。

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
现在, 一切都按我们预期的方式工作。注意, 我们需要 commit() 事件, 因为他们没有立即调用。当然, 一个对象不一定已经存在。我们也可以轻松地合并类型上下文:

```typescript
const HeroModel = this.publisher.mergeContext(Hero);
new HeroModel('id');
```

就是这样。模型现在能够发布事件。我们得处理他们

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
现在, 我们可以将写入逻辑移动到事件处理程序中。

### Sagas

这种类型的事件驱动架构可以提高应用程序的反应性和可伸缩性。现在, 当我们有了事件, 我们可以简单地以各种方式对他们作出反应。sagas 是从建筑学的观点来看的最后积木。

sagas 是一个非常强大的功能。单身传奇可以监听听 1..* 事件。它可以组合，合并，过滤事件流。[RxJS](https://github.com/ReactiveX/rxjs) 库是魔术的来源地。简单地说, 每个 sagas 都必须返回一个包含命令的Observable。此命令是异步调用的。

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
我们宣布一个规则, 当任何英雄杀死龙-它应该得到古老的项目。然后, DropAncientItemCommand 将被适当的处理程序调度和处理。

### 建立

最后一件事, 我们要处理的是建立整个机制。

> heroes-game.module.ts

```typescript
export const CommandHandlers = [KillDragonHandler, DropAncientItemHandler];
export const EventHandlers =  [HeroKilledDragonHandler, HeroFoundItemHandler];

@Module({
  imports: [CQRSModule],
  controllers: [HeroesGameController],
  components: [
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
    private readonly heroesGameSagas: HeroesGameSagas) {}

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

CommandBus 和 EventBus 都是 Observables。这意味着您可以轻松地订阅整个「流」, 并通过  Event Sourcing 丰富您的应用程序。

完整的源代码[在这里](https://github.com/kamilmysliwiec/nest-cqrs-example)可用。


## OpenAPI (Swagger)

（遗弃，建议使用 GraphQL）

## MongoDB E2E Testing

（待翻译，不推荐使用）