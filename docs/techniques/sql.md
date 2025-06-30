### 数据库

Nest 与数据库无关，可轻松集成任何 SQL 或 NoSQL 数据库。根据您的偏好，有多种选择可用。在最基本的层面上，将 Nest 连接到数据库只需加载适用于该数据库的 Node.js 驱动程序，就像使用 [Express](https://expressjs.com/en/guide/database-integration.html) 或 Fastify 一样简单。

您还可以直接使用任何通用的 Node.js 数据库集成 **库** 或 ORM，例如 [MikroORM](https://mikro-orm.io/)（参见 [MikroORM 指南](/recipes/mikroorm) ）、[Sequelize](https://sequelize.org/)（参见 [Sequelize 集成](/techniques/database#sequelize-integration) ）、[Knex.js](https://knexjs.org/)（参见 [Knex.js 教程](https://dev.to/nestjs/build-a-nestjs-module-for-knex-js-or-other-resource-based-libraries-in-5-minutes-12an) ）、[TypeORM](https://github.com/typeorm/typeorm) 和 [Prisma](https://www.github.com/prisma/prisma)（参见 [Prisma 指南](/recipes/prisma) ），在更高抽象层次上进行操作。

为方便使用，Nest 原生提供了与 TypeORM 和 Sequelize 的深度集成，分别通过 `@nestjs/typeorm` 和 `@nestjs/sequelize` 包实现（本章将介绍这些内容），以及与 Mongoose 的集成通过 `@nestjs/mongoose` 包（详见[本章](/techniques/mongodb) ）。这些集成提供了额外的 NestJS 专属特性，如模型/仓库注入、可测试性和异步配置，使访问所选数据库更加便捷。

### TypeORM 集成

为与 SQL 和 NoSQL 数据库集成，Nest 提供了 `@nestjs/typeorm` 包。[TypeORM](https://github.com/typeorm/typeorm) 是 TypeScript 中最成熟的对象关系映射器（ORM）。由于它采用 TypeScript 编写，因此能与 Nest 框架完美集成。

要开始使用它，我们首先需要安装所需的依赖项。本章将以流行的 [MySQL](https://www.mysql.com/) 关系型数据库管理系统为例进行演示，但 TypeORM 支持多种关系数据库，如 PostgreSQL、Oracle、Microsoft SQL Server、SQLite，甚至包括 MongoDB 等 NoSQL 数据库。本章介绍的流程适用于 TypeORM 支持的所有数据库，您只需为所选数据库安装相应的客户端 API 库即可。

```bash
$ npm install --save @nestjs/typeorm typeorm mysql2
```

安装完成后，我们可以将 `TypeOrmModule` 导入到根模块 `AppModule` 中。

```typescript title="app.module"
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'test',
      entities: [],
      synchronize: true,
    }),
  ],
})
export class AppModule {}
```

> warning **注意** 切勿在生产环境中使用 `synchronize: true` 设置，否则可能导致生产数据丢失。

`forRoot()` 方法支持 [TypeORM](https://typeorm.io/data-source-options#common-data-source-options) 包中 `DataSource` 构造函数公开的所有配置属性。此外，还支持以下描述的若干额外配置属性。

<table>
  <tbody>
    <tr>
      <td><code>retryAttempts</code></td>
      <td>数据库连接尝试次数（默认：10）</td>
    </tr>
    <tr>
      <td><code>retryDelay</code></td>
      <td>连接重试间隔时间（毫秒）（默认：3000）</td>
    </tr>
    <tr>
      <td><code>autoLoadEntities</code></td>
      <td>若为 true，实体将自动加载（默认：false）</td>
    </tr>
  </tbody>
</table>

> info **提示** 了解更多数据源选项请点击[此处](https://typeorm.io/data-source-options) 。

完成后，TypeORM `DataSource` 和 `EntityManager` 对象将可在整个项目中注入使用（无需导入任何模块），例如：

```typescript title="app.module"
import { DataSource } from 'typeorm';

@Module({
  imports: [TypeOrmModule.forRoot(), UsersModule],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
```

#### 仓储模式

[TypeORM](https://github.com/typeorm/typeorm) 支持**仓储设计模式** ，因此每个实体都有其对应的仓储库。这些仓储库可以从数据库数据源中获取。

继续这个示例，我们至少需要一个实体。让我们定义 `User` 实体。

```typescript title="user.entity"
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ default: true })
  isActive: boolean;
}
```

> info **提示** 了解更多关于实体的信息，请参阅 [TypeORM 文档](https://typeorm.io/#/entities) 。

`User` 实体文件位于 `users` 目录中。该目录包含与 `UsersModule` 相关的所有文件。您可以自行决定模型文件的存放位置，但我们建议将其创建在对应的**领域**附近，即相应的模块目录中。

要开始使用 `User` 实体，我们需要通过将其插入模块 `forRoot()` 方法选项中的 `entities` 数组来让 TypeORM 识别它（除非您使用静态 glob 路径）：

```typescript title="app.module"
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'test',
      entities: [User],
      synchronize: true,
    }),
  ],
})
export class AppModule {}
```

接下来，我们来看 `UsersModule`：

```typescript title="users.module"
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
```

该模块使用 `forFeature()` 方法来定义当前作用域中注册的存储库。完成此操作后，我们就可以使用 `@InjectRepository()` 装饰器将 `UsersRepository` 注入到 `UsersService` 中：

```typescript title="users.service"
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findOne(id: number): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
```

> warning **注意** 不要忘记将 `UsersModule` 导入到根 `AppModule` 中。

如果你想在导入 `TypeOrmModule.forFeature` 的模块之外使用该存储库，需要重新导出由其生成的提供者。可以通过导出整个模块来实现，如下所示：

```typescript title="users.module"
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  exports: [TypeOrmModule]
})
export class UsersModule {}
```

现在如果我们在 `UserHttpModule` 中导入 `UsersModule`，就可以在后者的提供者中使用 `@InjectRepository(User)`。

```typescript title="users-http.module"
import { Module } from '@nestjs/common';
import { UsersModule } from './users.module';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  imports: [UsersModule],
  providers: [UsersService],
  controllers: [UsersController]
})
export class UserHttpModule {}
```

#### 关系

关系是指两个或多个表之间建立的关联。这种关联基于各表中的公共字段，通常涉及主键和外键。

关系分为三种类型：

<table>
  <tbody>
    <tr>
      <td><strong>One-to-one</strong></td>
      <td>主表中的每一行在外表中有且仅有一行关联数据。使用 <code>@OneToOne()</code> 装饰器定义此类关系。</td>
    </tr>
    <tr>
      <td><strong>One-to-many / Many-to-one</strong></td>
      <td>主表中的每一行在外表中有一行或多行关联数据。使用 <code>@OneToMany()</code> 和 <code>@ManyToOne()</code> 装饰器定义此类关系。</td>
    </tr>
    <tr>
      <td><strong>Many-to-many</strong></td>
      <td>主表中的每一行在外键表中有多条相关记录，而外键表中的每条记录在主表中也有多条相关记录。使用 <code>@ManyToMany()</code> 装饰器来定义这种关系类型。</td>
    </tr>
  </tbody>
</table>

要在实体中定义关系，请使用相应的**装饰器** 。例如，要定义每个 `User` 可以拥有多张照片，请使用 `@OneToMany()` 装饰器。

```typescript title="user.entity"
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Photo } from '../photos/photo.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(type => Photo, photo => photo.user)
  photos: Photo[];
}
```

> info **提示** 要了解更多关于 TypeORM 中的关系，请访问 [TypeORM 文档](https://typeorm.io/#/relations) 。

#### 自动加载实体

手动将实体添加到数据源选项的 `entities` 数组中可能非常繁琐。此外，从根模块引用实体破坏了应用程序领域边界，并导致实现细节泄漏到应用程序的其他部分。为解决这个问题，我们提供了替代方案。要自动加载实体，请将配置对象（传入 `forRoot()` 方法）的 `autoLoadEntities` 属性设置为 `true`，如下所示：

```typescript title="app.module"
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...
      autoLoadEntities: true,
    }),
  ],
})
export class AppModule {}
```

指定该选项后，通过 `forFeature()` 方法注册的每个实体都将自动添加到配置对象的 `entities` 数组中。

> **警告** 请注意，未通过 `forFeature()` 方法注册，而仅通过关系从实体引用的实体，不会因 `autoLoadEntities` 设置而被包含。

#### 分离实体定义

您可以直接在模型中使用装饰器来定义实体及其列。但有些人更喜欢在单独的文件中使用 ["实体模式"](https://typeorm.io/#/separating-entity-definition) 来定义实体及其列。

```typescript
import { EntitySchema } from 'typeorm';
import { User } from './user.entity';

export const UserSchema = new EntitySchema<User>({
  name: 'User',
  target: User,
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: true,
    },
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  relations: {
    photos: {
      type: 'one-to-many',
      target: 'Photo', // the name of the PhotoSchema
    },
  },
});
```

> warning 错误 **警告** 如果提供了 `target` 选项，则 `name` 选项值必须与目标类的名称相同。如果不提供 `target`，则可以使用任意名称。

Nest 允许您在需要 `Entity` 的任何地方使用 `EntitySchema` 实例，例如：

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserSchema } from './user.schema';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserSchema])],
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
```

#### TypeORM 事务

数据库事务代表在数据库管理系统中对数据库执行的一个工作单元，它以独立于其他事务的连贯可靠方式进行处理。事务通常表示数据库中的任何变更（ [了解更多](https://en.wikipedia.org/wiki/Database_transaction) ）。

处理 [TypeORM 事务](https://typeorm.io/#/transactions)有多种不同策略。我们推荐使用 `QueryRunner` 类，因为它能提供对事务的完全控制。

首先，我们需要以常规方式将 `DataSource` 对象注入到类中：

```typescript
@Injectable()
export class UsersService {
  constructor(private dataSource: DataSource) {}
}
```

> **提示** `DataSource` 类是从 `typeorm` 包中导入的。

现在，我们可以使用这个对象来创建事务。

```typescript
async createMany(users: User[]) {
  const queryRunner = this.dataSource.createQueryRunner();

  await queryRunner.connect();
  await queryRunner.startTransaction();
  try {
    await queryRunner.manager.save(users[0]);
    await queryRunner.manager.save(users[1]);

    await queryRunner.commitTransaction();
  } catch (err) {
    // since we have errors lets rollback the changes we made
    await queryRunner.rollbackTransaction();
  } finally {
    // you need to release a queryRunner which was manually instantiated
    await queryRunner.release();
  }
}
```

> info **注意** 请注意 `dataSource` 仅用于创建 `QueryRunner`。但要测试这个类需要模拟整个 `DataSource` 对象（它暴露了多个方法）。因此，我们建议使用辅助工厂类（例如 `QueryRunnerFactory`）并定义一个接口，其中只包含维护事务所需的有限方法集。这种技术使得模拟这些方法变得相当简单。

或者，你也可以使用回调风格的方法，通过 `DataSource` 对象的 `transaction` 方法来实现（ [了解更多](https://typeorm.io/#/transactions/creating-and-using-transactions) ）。

```typescript
async createMany(users: User[]) {
  await this.dataSource.transaction(async manager => {
    await manager.save(users[0]);
    await manager.save(users[1]);
  });
}
```

#### 订阅者

使用 TypeORM [订阅器](https://typeorm.io/#/listeners-and-subscribers/what-is-a-subscriber) ，您可以监听特定实体事件。

```typescript
import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm';
import { User } from './user.entity';

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<User> {
  constructor(dataSource: DataSource) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return User;
  }

  beforeInsert(event: InsertEvent<User>) {
    console.log(`BEFORE USER INSERTED: `, event.entity);
  }
}
```

> error **警告** 事件订阅器不能是[请求作用域](/fundamentals/injection-scopes)的。

现在，将 `UserSubscriber` 类添加到 `providers` 数组中：

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserSubscriber } from './user.subscriber';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService, UserSubscriber],
  controllers: [UsersController],
})
export class UsersModule {}
```

> info **提示** 了解更多关于实体订阅器的内容[请点击这里](https://typeorm.io/#/listeners-and-subscribers/what-is-a-subscriber) 。

#### 迁移

[迁移](https://typeorm.io/#/migrations)提供了一种逐步更新数据库模式的方法，使其与应用程序的数据模型保持同步，同时保留数据库中的现有数据。为了生成、运行和回滚迁移，TypeORM 提供了专门的 [CLI](https://typeorm.io/#/migrations/creating-a-new-migration) 工具。

迁移类与 Nest 应用程序源代码是分离的。它们的生命周期由 TypeORM CLI 维护。因此，您无法在迁移中利用依赖注入和其他 Nest 特有的功能。要了解更多关于迁移的信息，请参阅 [TypeORM 文档](https://typeorm.io/#/migrations/creating-a-new-migration)中的指南。

#### 多数据库

某些项目需要多个数据库连接。这也可以通过本模块实现。要使用多个连接，首先需要创建这些连接。在这种情况下，数据源命名变得**强制**要求。

假设您有一个存储在独立数据库中的 `Album` 实体。

```typescript
const defaultOptions = {
  type: 'postgres',
  port: 5432,
  username: 'user',
  password: 'password',
  database: 'db',
  synchronize: true,
};

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...defaultOptions,
      host: 'user_db_host',
      entities: [User],
    }),
    TypeOrmModule.forRoot({
      ...defaultOptions,
      name: 'albumsConnection',
      host: 'album_db_host',
      entities: [Album],
    }),
  ],
})
export class AppModule {}
```

> warning **注意** 如果您没有为数据源设置 `name`，其名称将被设为 `default`。请注意，不应存在多个未命名或同名的连接，否则它们会被覆盖。

> warning **注意** 如果您使用 `TypeOrmModule.forRootAsync`，则必须**同时**在 `useFactory` 之外设置数据源名称。例如：
>
> ```typescript
> TypeOrmModule.forRootAsync({
>   name: 'albumsConnection',
>   useFactory: ...,
>   inject: ...,
> }),
> ```
>
> 更多详情请参阅[此问题](https://github.com/nestjs/typeorm/issues/86) 。
```

此时，您已注册了带有各自数据源的 `User` 和 `Album` 实体。在此配置下，您需要告知 `TypeOrmModule.forFeature()` 方法和 `@InjectRepository()` 装饰器应使用哪个数据源。若未传递任何数据源名称，则将使用 `default` 默认数据源。

```typescript
@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([Album], 'albumsConnection'),
  ],
})
export class AppModule {}
```

您也可以为指定数据源注入 `DataSource` 或 `EntityManager`：

```typescript
@Injectable()
export class AlbumsService {
  constructor(
    @InjectDataSource('albumsConnection')
    private dataSource: DataSource,
    @InjectEntityManager('albumsConnection')
    private entityManager: EntityManager
  ) {}
}
```

同样可以将任意 `DataSource` 注入到提供者中：

```typescript
@Module({
  providers: [
    {
      provide: AlbumsService,
      useFactory: (albumsConnection: DataSource) => {
        return new AlbumsService(albumsConnection);
      },
      inject: [getDataSourceToken('albumsConnection')],
    },
  ],
})
export class AlbumsModule {}
```

#### 测试

在进行应用程序单元测试时，我们通常希望避免建立数据库连接，以保持测试套件的独立性并尽可能加快执行速度。但我们的类可能依赖于从数据源（连接）实例获取的存储库。如何处理这种情况？解决方案是创建模拟存储库。为此，我们需要设置[自定义提供者](/fundamentals/custom-providers) 。每个已注册的存储库都会自动以 `<EntityName>Repository` 令牌表示，其中 `EntityName` 是您的实体类名称。

`@nestjs/typeorm` 包提供了 `getRepositoryToken()` 函数，该函数会根据给定实体返回一个预生成的令牌。

```typescript
@Module({
  providers: [
    UsersService,
    {
      provide: getRepositoryToken(User),
      useValue: mockRepository,
    },
  ],
})
export class UsersModule {}
```

现在将使用一个替代的 `mockRepository` 作为 `UsersRepository`。当任何类使用 `@InjectRepository()` 装饰器请求 `UsersRepository` 时，Nest 将使用已注册的 `mockRepository` 对象。

#### 异步配置

您可能希望异步传递存储库模块选项而非静态传递。这种情况下，可以使用 `forRootAsync()` 方法，它提供了多种处理异步配置的方式。

其中一种方法是使用工厂函数：

```typescript
TypeOrmModule.forRootAsync({
  useFactory: () => ({
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: 'root',
    database: 'test',
    entities: [],
    synchronize: true,
  }),
});
```

我们的工厂行为与任何其他[异步提供者](https://docs.nestjs.com/fundamentals/async-providers)一样（例如，它可以被声明为 `async`，并且能够通过 `inject` 注入依赖项）。

```typescript
TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => ({
    type: 'mysql',
    host: configService.get('HOST'),
    port: +configService.get('PORT'),
    username: configService.get('USERNAME'),
    password: configService.get('PASSWORD'),
    database: configService.get('DATABASE'),
    entities: [],
    synchronize: true,
  }),
  inject: [ConfigService],
});
```

或者，您也可以使用 `useClass` 语法：

```typescript
TypeOrmModule.forRootAsync({
  useClass: TypeOrmConfigService,
});
```

上述构造将在 `TypeOrmModule` 内部实例化 `TypeOrmConfigService`，并通过调用 `createTypeOrmOptions()` 来提供配置对象。请注意，这意味着 `TypeOrmConfigService` 必须实现如下所示的 `TypeOrmOptionsFactory` 接口：

```typescript
@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'test',
      entities: [],
      synchronize: true,
    };
  }
}
```

为了避免在 `TypeOrmModule` 内部创建 `TypeOrmConfigService`，而改用从其他模块导入的提供者，您可以使用 `useExisting` 语法。

```typescript
TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  useExisting: ConfigService,
});
```

这种构造方式与 `useClass` 的工作原理相同，但有一个关键区别——`TypeOrmModule` 会查找已导入的模块来重用现有的 `ConfigService`，而不是实例化一个新的。

> **提示** 请确保 `name` 属性定义在与 `useFactory`、`useClass` 或 `useValue` 属性相同的层级上。这样 Nest 才能正确地将数据源注册到相应的注入令牌下。

#### 自定义数据源工厂

结合使用 `useFactory`、`useClass` 或 `useExisting` 进行异步配置时，您可以选择性地指定一个 `dataSourceFactory` 函数，该函数允许您提供自己的 TypeORM 数据源，而不是让 `TypeOrmModule` 创建数据源。

`dataSourceFactory` 接收通过 `useFactory`、`useClass` 或 `useExisting` 异步配置的 TypeORM `DataSourceOptions`，并返回一个解析为 TypeORM `DataSource` 的 `Promise`。

```typescript
TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  // Use useFactory, useClass, or useExisting
  // to configure the DataSourceOptions.
  useFactory: (configService: ConfigService) => ({
    type: 'mysql',
    host: configService.get('HOST'),
    port: +configService.get('PORT'),
    username: configService.get('USERNAME'),
    password: configService.get('PASSWORD'),
    database: configService.get('DATABASE'),
    entities: [],
    synchronize: true,
  }),
  // dataSource receives the configured DataSourceOptions
  // and returns a Promise<DataSource>.
  dataSourceFactory: async (options) => {
    const dataSource = await new DataSource(options).initialize();
    return dataSource;
  },
});
```

> **提示** `DataSource` 类是从 `typeorm` 包导入的。

#### 示例

一个可用的示例[在此处](https://github.com/nestjs/nest/tree/master/sample/05-sql-typeorm)查看。

### Sequelize 集成

作为 TypeORM 的替代方案，可以使用 [Sequelize](https://sequelize.org/) ORM 配合 `@nestjs/sequelize` 包。此外，我们还利用了 [sequelize-typescript](https://github.com/RobinBuschmann/sequelize-typescript) 包，它提供了一组额外的装饰器来声明式定义实体。

要开始使用它，我们首先需要安装所需的依赖项。本章将以流行的 [MySQL](https://www.mysql.com/) 关系型数据库管理系统为例进行演示，但 Sequelize 支持多种关系数据库，包括 PostgreSQL、MySQL、Microsoft SQL Server、SQLite 和 MariaDB。本章介绍的步骤适用于 Sequelize 支持的所有数据库，您只需为所选数据库安装相应的客户端 API 库即可。

```bash
$ npm install --save @nestjs/sequelize sequelize sequelize-typescript mysql2
$ npm install --save-dev @types/sequelize
```

安装过程完成后，我们可以将 `SequelizeModule` 导入根模块 `AppModule` 中。

```typescript title="app.module"
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'test',
      models: [],
    }),
  ],
})
export class AppModule {}
```

`forRoot()` 方法支持 Sequelize 构造函数公开的所有配置属性（ [了解更多](https://sequelize.org/docs/v6/getting-started/#connecting-to-a-database) ）。此外，还有以下几个额外的配置属性将在下文说明。

<table>
  <tbody>
    <tr>
      <td><code>retryAttempts</code></td>
      <td>连接数据库的尝试次数（默认值：10）</td>
    </tr>
    <tr>
      <td><code>retryDelay</code></td>
      <td>连接重试尝试之间的延迟（毫秒）（默认：3000）</td>
    </tr>
    <tr>
      <td><code>autoLoadModels</code></td>
      <td>如果为 true，模型将自动加载（默认：false）</td>
    </tr>
    <tr>
      <td><code>keepConnectionAlive</code></td>
      <td>如果为 true，应用程序关闭时不会断开连接（默认：false）</td>
    </tr>
    <tr>
      <td><code>synchronize</code></td>
      <td>如果为 true，自动加载的模型将保持同步（默认：true）</td>
    </tr>
  </tbody>
</table>

完成后，`Sequelize` 对象将可被注入到整个项目中（无需导入任何模块），例如：

```typescript title="app.service"
import { Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class AppService {
  constructor(private sequelize: Sequelize) {}
}
```

#### 模型

Sequelize 实现了 Active Record 模式。通过该模式，您可以直接使用模型类与数据库交互。要继续这个示例，我们至少需要一个模型。让我们定义 `User` 模型。

```typescript title="user.model"
import { Column, Model, Table } from 'sequelize-typescript';

@Table
export class User extends Model {
  @Column
  firstName: string;

  @Column
  lastName: string;

  @Column({ defaultValue: true })
  isActive: boolean;
}
```

> info **提示** 了解更多可用的装饰器请[点击此处](https://github.com/RobinBuschmann/sequelize-typescript#column) 。

`User` 模型文件位于 `users` 目录中。该目录包含与 `UsersModule` 相关的所有文件。您可以自行决定模型文件的存放位置，但我们建议将其创建在对应的**领域**附近，即相应的模块目录中。

要开始使用 `User` 模型，我们需要通过将其插入模块 `forRoot()` 方法选项中的 `models` 数组来让 Sequelize 识别它：

```typescript title="app.module"
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './users/user.model';

@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'test',
      models: [User],
    }),
  ],
})
export class AppModule {}
```

接下来，我们来看 `UsersModule`：

```typescript title="users.module"
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './user.model';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [SequelizeModule.forFeature([User])],
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
```

该模块使用 `forFeature()` 方法来定义当前作用域中注册的模型。完成此操作后，我们就可以使用 `@InjectModel()` 装饰器将 `UserModel` 注入到 `UsersService` 中：

```typescript title="users.service"
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './user.model';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userModel.findAll();
  }

  findOne(id: string): Promise<User> {
    return this.userModel.findOne({
      where: {
        id,
      },
    });
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await user.destroy();
  }
}
```

> warning **注意** 不要忘记将 `UsersModule` 导入根模块 `AppModule` 中。

如果你想在导入 `SequelizeModule.forFeature` 的模块之外使用该模型，需要重新导出由其生成的 providers。可以通过导出整个模块来实现，如下所示：

```typescript title="users.module"
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './user.entity';

@Module({
  imports: [SequelizeModule.forFeature([User])],
  exports: [SequelizeModule]
})
export class UsersModule {}
```

现在如果我们在 `UserHttpModule` 中导入 `UsersModule`，就可以在后者的 providers 中使用 `@InjectModel(User)` 了。

```typescript title="users-http.module"
import { Module } from '@nestjs/common';
import { UsersModule } from './users.module';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  imports: [UsersModule],
  providers: [UsersService],
  controllers: [UsersController]
})
export class UserHttpModule {}
```

#### 关联关系

关系是指在两个或多个表之间建立的关联。关系基于每个表中的公共字段，通常涉及主键和外键。

关系有三种类型：

<table>
  <tbody>
    <tr>
      <td><strong>One-to-one</strong></td>
      <td>主表中的每一行在外表中都有且仅有一个关联行</td>
    </tr>
    <tr>
      <td><strong>One-to-many / Many-to-one</strong></td>
      <td>主表中的每一行在外表中都有一个或多个相关行</td>
    </tr>
    <tr>
      <td><strong>Many-to-many</strong></td>
      <td>主表中的每一行在外表中都有多条相关记录，而外表中的每条记录在主表中也有多条相关行</td>
    </tr>
  </tbody>
</table>

要在模型中定义关系，请使用相应的**装饰器** 。例如，要定义每个 `User` 可以拥有多张照片，可使用 `@HasMany()` 装饰器。

```typescript title="user.model"
import { Column, Model, Table, HasMany } from 'sequelize-typescript';
import { Photo } from '../photos/photo.model';

@Table
export class User extends Model {
  @Column
  firstName: string;

  @Column
  lastName: string;

  @Column({ defaultValue: true })
  isActive: boolean;

  @HasMany(() => Photo)
  photos: Photo[];
}
```

> info **提示** 要了解更多关于 Sequelize 中的关联关系，请阅读[本章](https://github.com/RobinBuschmann/sequelize-typescript#model-association)内容。

#### 自动加载模型

手动将模型添加到连接选项的 `models` 数组中可能很繁琐。此外，从根模块引用模型会破坏应用程序领域边界，导致实现细节泄漏到应用程序的其他部分。为解决此问题，可通过将配置对象（传入 `forRoot()` 方法）的 `autoLoadModels` 和 `synchronize` 属性都设为 `true` 来自动加载模型，如下所示：

```typescript title="app.module"
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [
    SequelizeModule.forRoot({
      ...
      autoLoadModels: true,
      synchronize: true,
    }),
  ],
})
export class AppModule {}
```

指定该选项后，通过 `forFeature()` 方法注册的每个模型都将自动添加到配置对象的 `models` 数组中。

> warning **警告** 请注意，未通过 `forFeature()` 方法注册、仅通过关联从模型引用的模型将不会被包含。

#### Sequelize 事务

数据库事务代表在数据库管理系统中对数据库执行的一个工作单元，它以独立于其他事务的连贯可靠方式进行处理。事务通常表示数据库中的任何变更（ [了解更多](https://en.wikipedia.org/wiki/Database_transaction) ）。

处理 [Sequelize 事务](https://sequelize.org/docs/v6/other-topics/transactions/)有多种不同策略。下面是一个托管事务（自动回调）的示例实现。

首先，我们需要以常规方式将 `Sequelize` 对象注入到类中：

```typescript
@Injectable()
export class UsersService {
  constructor(private sequelize: Sequelize) {}
}
```

> **提示** `Sequelize` 类是从 `sequelize-typescript` 包中导入的。

现在，我们可以使用这个对象来创建事务。

```typescript
async createMany() {
  try {
    await this.sequelize.transaction(async t => {
      const transactionHost = { transaction: t };

      await this.userModel.create(
          { firstName: 'Abraham', lastName: 'Lincoln' },
          transactionHost,
      );
      await this.userModel.create(
          { firstName: 'John', lastName: 'Boothe' },
          transactionHost,
      );
    });
  } catch (err) {
    // Transaction has been rolled back
    // err is whatever rejected the promise chain returned to the transaction callback
  }
}
```

> info **注意** `Sequelize` 实例仅用于启动事务。但要测试该类需要模拟整个 `Sequelize` 对象（它暴露了多个方法）。因此，我们建议使用辅助工厂类（例如 `TransactionRunner`）并定义一个接口，该接口仅包含维护事务所需的有限方法集。这种技术使得模拟这些方法变得相当简单。

#### 迁移

[迁移](https://sequelize.org/docs/v6/other-topics/migrations/) 提供了一种逐步更新数据库模式的方法，使其与应用程序的数据模型保持同步，同时保留数据库中的现有数据。为了生成、运行和回滚迁移，Sequelize 提供了一个专用的 [CLI](https://sequelize.org/docs/v6/other-topics/migrations/#installing-the-cli)。

迁移类与 Nest 应用程序源代码是分离的。它们的生命周期由 Sequelize CLI 管理。因此，在迁移中您无法利用依赖注入和其他 Nest 特有的功能。要了解更多关于迁移的信息，请参阅 [Sequelize 文档](https://sequelize.org/docs/v6/other-topics/migrations/#installing-the-cli)中的指南。

#### 多数据库

某些项目需要多个数据库连接。本模块也能实现这一需求。要使用多个连接，首先需要创建这些连接。在这种情况下，连接命名就变得**强制要求**了。

假设您有一个 `Album` 实体存储在其专属数据库中。

```typescript
const defaultOptions = {
  dialect: 'postgres',
  port: 5432,
  username: 'user',
  password: 'password',
  database: 'db',
  synchronize: true,
};

@Module({
  imports: [
    SequelizeModule.forRoot({
      ...defaultOptions,
      host: 'user_db_host',
      models: [User],
    }),
    SequelizeModule.forRoot({
      ...defaultOptions,
      name: 'albumsConnection',
      host: 'album_db_host',
      models: [Album],
    }),
  ],
})
export class AppModule {}
```

> warning **注意** 如果您没有为连接设置 `name`，其名称将被设为 `default`。请注意不应存在多个未命名或同名的连接，否则它们会被覆盖。

此时，您已注册了带有各自连接的 `User` 和 `Album` 模型。在此设置下，需要告知 `SequelizeModule.forFeature()` 方法和 `@InjectModel()` 装饰器应使用哪个连接。若未传递任何连接名称，则默认使用 `default` 连接。

```typescript
@Module({
  imports: [
    SequelizeModule.forFeature([User]),
    SequelizeModule.forFeature([Album], 'albumsConnection'),
  ],
})
export class AppModule {}
```

您还可以注入指定连接的 `Sequelize` 实例：

```typescript
@Injectable()
export class AlbumsService {
  constructor(
    @InjectConnection('albumsConnection')
    private sequelize: Sequelize
  ) {}
}
```

同样可以将任意 `Sequelize` 实例注入到提供者中：

```typescript
@Module({
  providers: [
    {
      provide: AlbumsService,
      useFactory: (albumsSequelize: Sequelize) => {
        return new AlbumsService(albumsSequelize);
      },
      inject: [getDataSourceToken('albumsConnection')],
    },
  ],
})
export class AlbumsModule {}
```

#### 测试

在进行应用程序单元测试时，我们通常希望避免建立数据库连接，以保持测试套件的独立性并尽可能加快执行速度。但我们的类可能依赖于从连接实例获取的模型。如何处理这种情况？解决方案是创建模拟模型。为此，我们需要设置[自定义提供者](/fundamentals/custom-providers) 。每个注册的模型都会自动对应一个 `<ModelName>Model` 令牌，其中 `ModelName` 是模型类的名称。

`@nestjs/sequelize` 包公开了 `getModelToken()` 函数，该函数会根据给定模型返回一个预处理的令牌。

```typescript
@Module({
  providers: [
    UsersService,
    {
      provide: getModelToken(User),
      useValue: mockModel,
    },
  ],
})
export class UsersModule {}
```

现在将使用替代的 `mockModel` 作为 `UserModel`。当任何类使用 `@InjectModel()` 装饰器请求 `UserModel` 时，Nest 将使用已注册的 `mockModel` 对象。

#### 异步配置

您可能希望异步传递 `SequelizeModule` 选项而非静态传递。在这种情况下，可以使用 `forRootAsync()` 方法，它提供了多种处理异步配置的方式。

一种方法是使用工厂函数：

```typescript
SequelizeModule.forRootAsync({
  useFactory: () => ({
    dialect: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: 'root',
    database: 'test',
    models: [],
  }),
});
```

我们的工厂与任何其他[异步提供者](https://docs.nestjs.com/fundamentals/async-providers)行为一致（例如，它可以被声明为 `async`，并且能够通过 `inject` 注入依赖项）。

```typescript
SequelizeModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => ({
    dialect: 'mysql',
    host: configService.get('HOST'),
    port: +configService.get('PORT'),
    username: configService.get('USERNAME'),
    password: configService.get('PASSWORD'),
    database: configService.get('DATABASE'),
    models: [],
  }),
  inject: [ConfigService],
});
```

或者，您也可以使用 `useClass` 语法：

```typescript
SequelizeModule.forRootAsync({
  useClass: SequelizeConfigService,
});
```

上述构造方式将在 `SequelizeModule` 内部实例化 `SequelizeConfigService`，并通过调用 `createSequelizeOptions()` 来提供配置对象。请注意这意味着 `SequelizeConfigService` 必须实现 `SequelizeOptionsFactory` 接口，如下所示：

```typescript
@Injectable()
class SequelizeConfigService implements SequelizeOptionsFactory {
  createSequelizeOptions(): SequelizeModuleOptions {
    return {
      dialect: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'test',
      models: [],
    };
  }
}
```

为了避免在 `SequelizeModule` 内部创建 `SequelizeConfigService`，转而使用从其他模块导入的提供者，您可以使用 `useExisting` 语法。

```typescript
SequelizeModule.forRootAsync({
  imports: [ConfigModule],
  useExisting: ConfigService,
});
```

这种构造方式与 `useClass` 的工作原理相同，但有一个关键区别——`SequelizeModule` 会查找已导入的模块来重用现有的 `ConfigService`，而不是实例化一个新的。

#### 示例

一个可用的示例[在此处](https://github.com/nestjs/nest/tree/master/sample/07-sequelize)查看。
