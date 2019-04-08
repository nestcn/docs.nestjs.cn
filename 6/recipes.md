# 秘籍

## SQL (TypeORM)

**本章仅适用于TypeScript**

!> 在本文中，您将学习如何使用自定义提供者机制从零开始创建基于 **TypeORM** 包的 `DatabaseModule` 。由于该解决方案包含许多开销，因此您可以使用开箱即用的 `@nestjs/typeorm` 软件包。要了解更多信息，请参阅 [此处](/6/techniques.md?id=数据库（TypeORM）)。


[TypeORM](https://github.com/typeorm/typeorm) 无疑是 node.js 世界中最成熟的对象关系映射器（ORM）。由于它是用 TypeScript 编写的，所以它在 Nest 框架下运行得非常好。

### 入门

在开始使用这个库前，我们必须安装所有必需的依赖关系

```
$ npm install --save typeorm mysql
```

我们需要做的第一步是使用从 `typeorm` 包导入的 `createConnection()` 函数建立与数据库的连接。`createConnection()` 函数返回一个 `Promise`，因此我们必须创建一个[异步提供者](/6/fundamentals.md?id=异步提供者 (Asynchronous providers))。

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

现在我们可以使用 `@Inject()` 装饰器注入 `Connection` 对象。依赖于 `Connection` 异步提供者的每个类都将等待 `Promise` 被解析。

### 存储库模式

[TypeORM](https://github.com/typeorm/typeorm) 支持存储库设计模式，因此每个实体都有自己的存储库。这些存储库可以从数据库连接中获取。

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

现在我们可以使用 `@Inject()` 装饰器将 `Repository<Photo>` 注入到 `PhotoService` 中：

> photo.service.ts

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Photo } from './photo.entity';

@Injectable()
export class PhotoService {
  constructor(
    @Inject('PHOTO_REPOSITORY')
    private readonly photoRepository: Repository<Photo>,
  ) {}

  async findAll(): Promise<Photo[]> {
    return await this.photoRepository.find();
  }
}
```

数据库连接是 **异步的**，但 Nest 使最终用户完全看不到这个过程。`PhotoRepository` 正在等待数据库连接时，并且`PhotoService` 会被延迟，直到存储库可以使用。整个应用程序可以在每个类实例化时启动。

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

?> 不要忘记将 `PhotoModule` 导入到根 `ApplicationModule` 中。

## MongoDB (Mongoose)

!> 在本文中，您将学习如何使用自定义提供者机制从零开始创建基于 **Mongoose** 包的 `DatabaseModule`。由于该解决方案包含许多开销，因此您可以使用开箱即用的 `@nestjs/mongoose` 软件包。要了解更多信息，请参阅 [此处](https://docs.nestjs.com/techniques/mongodb)。

Mongoose是最受欢迎的MongoDB对象建模工具。

### 入门

在开始使用这个库前，我们必须安装所有必需的依赖关系

```
$ npm install --save mongoose
$ npm install --save-dev @types/mongoose
```

我们需要做的第一步是使用 `connect()` 函数建立与数据库的连接。`connect()` 函数返回一个 `Promise`，因此我们必须创建一个[异步提供者](/6/fundamentals.md?id=异步提供者 (Asynchronous providers))。

> database.providers.ts

```typescript
import * as mongoose from 'mongoose';

export const databaseProviders = [
  {
    provide: 'DATABASE_CONNECTION',
    useFactory: (): Promise<typeof mongoose> =>
      mongoose.connect('mongodb://localhost/nest'),
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

现在我们可以使用 `@Inject()` 装饰器注入 `Connection` 对象。依赖于 `Connection` 异步提供者的每个类都将等待 `Promise` 被解析。

### 模型注入

使用Mongoose，一切都来自[Schema](https://mongoosejs.com/docs/guide.html)。 让我们定义 `CatSchema` ：

> schemas/cats.schema.ts

```typescript
import * as mongoose from 'mongoose';

export const CatSchema = new mongoose.Schema({
  name: String,
  age: Number,
  breed: String,
});
```

`CatsSchema` 属于 `cats` 目录。此目录代表 `CatsModule` 。

现在，让我们创建一个 **模型** 提供者:

> cats.providers.ts

```typescript
import { Connection } from 'mongoose';
import { CatSchema } from './schemas/cat.schema';

export const catsProviders = [
  {
    provide: 'CAT_MODEL',
    useFactory: (connection: Connection) => connection.model('Cat', CatSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];
```

!> 请注意，在实际应用程序中，您应该避免使用魔术字符串。`CAT_MODEL` 和 `DATABASE_CONNECTION` 都应保存在分离的 `constants.ts` 文件中。

现在我们可以使用 `@Inject()` 装饰器将 `CAT_MODEL` 注入到 `CatsService` 中：

> cats.service.ts

```typescript
import { Model } from 'mongoose';
import { Injectable, Inject } from '@nestjs/common';
import { Cat } from './interfaces/cat.interface';
import { CreateCatDto } from './dto/create-cat.dto';

@Injectable()
export class CatsService {
  constructor(
    @Inject('CAT_MODEL')
    private readonly catModel: Model<Cat>,
  ) {}

  async create(createCatDto: CreateCatDto): Promise<Cat> {
    const createdCat = new this.catModel(createCatDto);
    return await createdCat.save();
  }

  async findAll(): Promise<Cat[]> {
    return await this.catModel.find().exec();
  }
}
```

在上面的例子中，我们使用了 `Cat` 接口。 此接口扩展了来自mongoose包的 `Document` ：

```typescript
import { Document } from 'mongoose';

export interface Cat extends Document {
  readonly name: string;
  readonly age: number;
  readonly breed: string;
}
```

数据库连接是 **异步的**，但 Nest 使最终用户完全看不到这个过程。`CatModel` 正在等待数据库连接时，并且`CatsService` 会被延迟，直到存储库可以使用。整个应用程序可以在每个类实例化时启动。

这是一个最终的 `CatsModule` ：

> cats.module.ts

```typescript
import { Module } from '@nestjs/common';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';
import { catsProviders } from './cats.providers';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [CatsController],
  providers: [
    CatsService,
    ...catsProviders,
  ],
})
export class CatsModule {}
```

?> 不要忘记将 `CatsModule` 导入到根 `ApplicationModule` 中。

## CQRS

最简单的 **[CRUD](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete)** 应用程序的流程可以使用以下步骤来描述:

1. 控制器层处理**HTTP请求**并将任务委派给服务。
2. 服务层是执行大部分业务逻辑的地方。
3. **Services**使用存储库或 DAOs 来更改/保留实体。
4. 实体充当值的容器，具有setter和getter。

在大多数情况下，没有理由使中小型应用程序更加复杂。 但是，有时它还不够，当我们的需求变得更加复杂时，我们希望拥有可扩展的系统，并且数据流量非常简单。

这就是为什么 Nest 提供了一个轻量级的 CQRS 模块，其元素如下所述。

### Commands

为了使应用程序更易于理解，每个更改都必须以 **Command** 开头。当任何命令被分派时，应用程序必须对其作出反应。命令可以从服务中分派(或直接来自控制器/网关)并在相应的 **Command 处理程序** 中使用。

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

这是一个示例服务, 它调度 `KillDragonCommand` 。让我们来看看这个命令:

> kill-dragon.command.ts

```typescript
export class KillDragonCommand implements ICommand {
  constructor(
    public readonly heroId: string,
    public readonly dragonId: string,
  ) {}
}
```

这个 `CommandBus` 是一个命令 **流** 。它将命令委托给等效的处理程序。每个命令必须有相应的命令处理程序：

> kill-dragon.handler.ts

```typescript
@CommandHandler(KillDragonCommand)
export class KillDragonHandler implements ICommandHandler<KillDragonCommand> {
  constructor(private readonly repository: HeroRepository) {}

  async execute(command: KillDragonCommand) {
    const { heroId, dragonId } = command;
    const hero = this.repository.findOneById(+heroId);

    hero.killEnemy(dragonId);
    await this.repository.persist(hero);
  }
}
```

现在，每个应用程序状态更改都是 **Command** 发生的结果。逻辑被封装在处理程序中。我们可以简单地在这里添加日志，甚至我们可以在数据库中保留我们的命令 (例如，用于诊断目的)。

### 事件（Events）

由于我们在处理程序中封装了命令，所以我们阻止了它们之间的交互-应用程序结构仍然不灵活，不具有**响应性**。解决方案是使用**事件**。

> hero-killed-dragon.event.ts

```typescript
export class HeroKilledDragonEvent {
  constructor(
    public readonly heroId: string,
    public readonly dragonId: string,
  ) {}
}
```

事件是异步的。它们可以通过**模型**或直接使用 `EventBus` 发送。为了发送事件，模型必须扩展 `AggregateRoot` 类。。

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

`apply()` 方法尚未发送事件，因为模型和 `EventPublisher` 类之间没有关系。如何关联模型和发布者？ 我们需要在我们的命令处理程序中使用一个发布者 `mergeObjectContext()` 方法。

> kill-dragon.handler.ts

```typescript
@CommandHandler(KillDragonCommand)
export class KillDragonHandler implements ICommandHandler<KillDragonCommand> {
  constructor(
    private readonly repository: HeroRepository,
    private readonly publisher: EventPublisher,
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
```

现在，一切都按我们预期的方式工作。注意，我们需要 commit() 事件，因为他们不会立即被发布。显然，对象不必预先存在。我们也可以轻松地合并类型上下文:

```typescript
const HeroModel = this.publisher.mergeContext(Hero);
new HeroModel('id');
```

就是这样。模型现在能够发布事件。我们得处理他们。此外，我们可以使用EventBus手动发出事件。

```typescript
this.eventBus.publish(new HeroKilledDragonEvent());
```

?> `EventBus` 是一个可注入的类。

每个事件都可以有许多事件处理程序。

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

这种类型的 **事件驱动架构** 可以提高应用程序的 **反应性** 和 **可伸缩性** 。现在, 当我们有了事件, 我们可以简单地以各种方式对他们作出反应。**Sagas**是建筑学观点的最后一个组成部分。

sagas 是一个非常强大的功能。单saga可以监听 1..* 事件。它可以组合，合并，过滤事件流。[RxJS](https://github.com/ReactiveX/rxjs) 库是魔术的来源地。简单地说, 每个 sagas 都必须返回一个包含命令的Observable。此命令是 **异步** 调用的。

> heroes-game.saga.ts

```typescript
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
```

?> `ofType` 运算符从 `@nestjs/cqrs` 包导出。

我们宣布一个规则 - 当任何英雄杀死龙时，古代物品就会掉落。 之后，DropAncientItemCommand将由适当的处理程序调度和处理。

### Queries

`CqrsModule` 对于查询处理可能也很方便。 `QueryBus` 与 `CommandsBus` 的工作方式相同。 此外，查询处理程序应实现 `IQueryHandler` 接口并使用 `@QueryHandler()` 装饰器进行标记。

### 建立（Setup）

我们要处理的最后一件事是建立整个机制。。

> heroes-game.module.ts

```typescript
export const CommandHandlers = [KillDragonHandler, DropAncientItemHandler];
export const EventHandlers =  [HeroKilledDragonHandler, HeroFoundItemHandler];

@Module({
  imports: [CqrsModule],
  controllers: [HeroesGameController],
  providers: [
    HeroesGameService,
    HeroesGameSagas,
    ...CommandHandlers,
    ...EventHandlers,
    HeroRepository,
  ]
})
export class HeroesGameModule {}
```

### 概要

`CommandBus` ，`QueryBus` 和 `EventBus` 都是**Observables**。这意味着您可以轻松地订阅整个流, 并通过  **Event Sourcing** 丰富您的应用程序。

完整的源代码在[这里](https://github.com/kamilmysliwiec/nest-cqrs-example) 。

## OpenAPI (Swagger)

【待翻译】

## Prisma

Prisma 将您的数据库转换为 GraphQL API，并允许将 GraphQL 用作所有数据库的通用查询语言(译者注：替代 orm )。您可以直接使用 GraphQL 查询数据库，而不是编写 SQL 或使用 NoSQL API。在本章中，我们不会详细介绍 Prisma，因此请访问他们的网站，了解可用的[功能](https://www.prisma.io/features/)。

!> 注意： 在本文中，您将学习如何集成 Prisma 到 Nest 框架中。我们假设您已经熟悉 GraphQL 概念和 @nestjs/graphql 模块。

### 依赖

首先，我们需要安装所需的包：

```bash
npm install --save prisma-binding
```

### 设置 Prisma

在使用 Prisma 时，您可以使用自己的实例或使用 [Prisma Cloud](https://www.prisma.io/cloud/) 。在本简介中，我们将使用 Prisma 提供的演示服务器。

1. 安装 Prisma CLI `npm install -g prisma`
2. 创建新服务 `prisma init` , 选择演示服务器并按照说明操作。
3. 部署您的服务 `prisma deploy` 

如果您发现自己遇到麻烦，请跳转到[「快速入门」](https://www.prisma.io/docs/quickstart/) 部分以获取更多详细信息。最终，您应该在项目目录中看到两个新文件。

> prisma.yaml

```yaml
endpoint: https://us1.prisma.sh/nest-f6ec12/prisma/dev
datamodel: datamodel.graphql
```
并自动创建数据模型。

> datamodel.graphql

```yaml
type User {
  id: ID! @unique
  name: String!
}
```

!> 注意： 在实际应用程序中，您将创建更复杂的数据模型。有关Prisma中数据建模的更多信息，请单击[此处](https://www.prisma.io/features/data-modeling/)。

输入： `prisma playground` 您可以打开 Prisma GraphQL API 控制台。随意发送查询。

### 创建客户端

有几种方法可以集成 GraphQL API。这里我们将使用 [GraphQL CLI](https://www.npmjs.com/package/graphql-cli)，这是一个用于常见 GraphQL 开发工作流的命令行工具。要安装 GraphQL CLI，请使用以下命令：

```bash
npm install -g graphql-cli
```

接下来，在 Nest 应用程序的根目录中创建 `.graphqlconfig` ：

```bash
touch .graphqlconfig.yml
```
将以下内容放入其中：

```yaml
projects:
  database:
    schemaPath: src/prisma/prisma-types.graphql
    extensions:
      endpoints:
        default: https://us1.prisma.sh/nest-f6ec12/prisma/dev
      codegen:
        - generator: prisma-binding
          language: typescript
          output:
            binding: src/prisma/prisma.binding.ts
 ```
 
 要下载 Prisma GraphQL 文件 `src/prisma/prisma-types.graphql` 并在其下创建 Prisma 客户端 `src/prisma/prisma.binding.graphql` ，请在终端中运行以下命令：
 
 ```bash
graphql get-schema --project database
graphql codegen --project database
```

### 积分

快要完成了。现在，让我们为 Prisma 创建一个模块。

> prisma.service

```typescript
import { Injectable } from '@nestjs/common';
import { Prisma } from './prisma.binding';

@Injectable()
export class PrismaService extends Prisma {
  constructor() {
    super({
      endpoint: 'https://us1.prisma.sh/nest-f6ec12/prisma/dev',
      debug: false,
    });
  }
}
```

一旦 `PrismaService` 准备就绪，我们需要创建一个对应模块。

> prisma.module

```typescript
import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

?> 提示： 要立即创建新模块和服务，我们可以使用 [Nest CLI](5.0/cli)。创建 `PrismaModule` 类型 `nest g module prisma` 和服务 `nest g service prisma/prisma`

### 用法

若要使用新的服务，我们要 import `PrismaModule`，并注入 `PrismaService` 到 `UsersResolver`。

> src/users/users.module

```typescript
import { Module } from '@nestjs/common';
import { UsersResolver } from './users.resolver';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [UsersResolver],
})
export class UsersModule {}
```

import `PrismaModule` 使 export `PrismaService` 在 `UsersModule` 上下文中可用。

> src/users/users.resolver

```typescript
import { Query, Resolver, Args, Info } from '@nestjs/graphql';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '../graphql.schema';

@Resolver()
export class UsersResolver {
  constructor(private readonly prisma: PrismaService) {}

  @Query('users')
  async getUsers(@Args() args, @Info() info): Promise<User[]> {
    return await this.prisma.query.users(args, info);
  }
}
```

### 例子


官方示例请看[这里](https://github.com/nestjs/nest/tree/master/sample/22-graphql-prisma)



 ### 译者署名

| 用户名 | 头像 | 职能 | 签名 |
|---|---|---|---|
| [@zuohuadong](https://github.com/zuohuadong)  | <img class="avatar-66 rm-style" src="https://wx3.sinaimg.cn/large/006fVPCvly1fmpnlt8sefj302d02s742.jpg">  |  翻译  | 专注于 caddy 和 nest，[@zuohuadong](https://github.com/zuohuadong/) at Github  |
| [@Drixn](https://drixn.com/)  | <img class="avatar-66 rm-style" src="https://cdn.drixn.com/img/src/avatar1.png">  |  翻译  | 专注于 nginx 和 C++，[@Drixn](https://drixn.com/) |
