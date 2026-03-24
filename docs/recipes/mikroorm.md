### MikroORM

本教程旨在帮助用户在 Nest 中开始使用 MikroORM。MikroORM 是基于数据映射器、工作单元和身份映射模式的 Node.js TypeScript ORM。它是 TypeORM 的绝佳替代品，从 TypeORM 迁移应该相当容易。MikroORM 的完整文档可以在[这里](https://mikro-orm.io/docs)找到。

:::info 信息
`@mikro-orm/nestjs` 是第三方包，不由 NestJS 核心团队管理。请在[相应的仓库](https://github.com/mikro-orm/nestjs)中报告发现的任何问题。
:::

#### 安装

将 MikroORM 集成到 Nest 的最简单方法是通过 [`@mikro-orm/nestjs` 模块](https://github.com/mikro-orm/nestjs)。
只需在 Nest、MikroORM 和底层驱动程序旁边安装它：

```bash
$ npm i @mikro-orm/core @mikro-orm/nestjs @mikro-orm/sqlite

```

MikroORM 还支持 `postgres`、`sqlite` 和 `mongo`。请参阅[官方文档](https://mikro-orm.io/docs/usage-with-sql/)了解所有驱动程序。

安装过程完成后，我们可以将 `MikroOrmModule` 导入到根 `AppModule` 中。

```typescript
import { SqliteDriver } from '@mikro-orm/sqlite';

@Module({
  imports: [
    MikroOrmModule.forRoot({
      entities: ['./dist/entities'],
      entitiesTs: ['./src/entities'],
      dbName: 'my-db-name.sqlite3',
      driver: SqliteDriver,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

```

`forRoot()` 方法接受与 MikroORM 包中的 `init()` 相同的配置对象。查看[此页面](https://mikro-orm.io/docs/configuration)获取完整的配置文档。

或者，我们可以通过创建配置文件 `mikro-orm.config.ts` 来[配置 CLI](https://mikro-orm.io/docs/installation#setting-up-the-commandline-tool)，然后不带任何参数调用 `forRoot()`。

```typescript
@Module({
  imports: [
    MikroOrmModule.forRoot(),
  ],
  ...
})
export class AppModule {}

```

但这在使用使用 tree shaking 的构建工具时不起作用，最好显式提供配置：

```typescript
import config from './mikro-orm.config'; // 你的 ORM 配置

@Module({
  imports: [
    MikroOrmModule.forRoot(config),
  ],
  ...
})
export class AppModule {}

```

之后，`EntityManager` 将可以在整个项目中注入（无需在其他地方导入任何模块）。

```ts
// 从驱动程序包或 `@mikro-orm/knex` 导入所有内容
import { EntityManager, MikroORM } from '@mikro-orm/sqlite';

@Injectable()
export class MyService {
  constructor(
    private readonly orm: MikroORM,
    private readonly em: EntityManager,
  ) {}
}

```

:::info 信息
请注意，`EntityManager` 是从 `@mikro-orm/driver` 包导入的，其中 driver 是 `mysql`、`sqlite`、`postgres` 或您正在使用的驱动程序。如果您安装了 `@mikro-orm/knex` 作为依赖项，您也可以从那里导入 `EntityManager`。
:::

#### 存储库

MikroORM 支持存储库设计模式。对于每个实体，我们可以创建一个存储库。在[这里](https://mikro-orm.io/docs/repositories)阅读关于存储库的完整文档。要定义应在当前作用域中注册哪些存储库，可以使用 `forFeature()` 方法。例如：

:::info 信息
您**不应该**通过 `forFeature()` 注册基础实体，因为它们没有存储库。另一方面，基础实体需要成为 `forRoot()` 中列表的一部分（或一般的 ORM 配置中）。
:::

```typescript
// photo.module.ts
@Module({
  imports: [MikroOrmModule.forFeature([Photo])],
  providers: [PhotoService],
  controllers: [PhotoController],
})
export class PhotoModule {}

```

并将其导入到根 `AppModule` 中：

```typescript
// app.module.ts
@Module({
  imports: [MikroOrmModule.forRoot(...), PhotoModule],
})
export class AppModule {}

```

这样我们就可以使用 `@InjectRepository()` 装饰器将 `PhotoRepository` 注入到 `PhotoService` 中：

```typescript
@Injectable()
export class PhotoService {
  constructor(
    @InjectRepository(Photo)
    private readonly photoRepository: EntityRepository<Photo>,
  ) {}
}

```

#### 使用自定义存储库

使用自定义存储库时，我们不再需要 `@InjectRepository()` 装饰器，因为 Nest DI 基于类引用进行解析。

```ts
// `**./author.entity.ts**`
@Entity({ repository: () => AuthorRepository })
export class Author {
  // 允许在 `em.getRepository()` 中推断
  [EntityRepositoryType]?: AuthorRepository;
}

// `**./author.repository.ts**`
export class AuthorRepository extends EntityRepository<Author> {
  // 你的自定义方法...
}

```

由于自定义存储库名称与 `getRepositoryToken()` 返回的名称相同，我们不再需要 `@InjectRepository()` 装饰器：

```ts
@Injectable()
export class MyService {
  constructor(private readonly repo: AuthorRepository) {}
}

```

#### 自动加载实体

手动将实体添加到连接选项的实体数组可能很繁琐。此外，从根模块引用实体会破坏应用程序域边界，并导致实现细节泄漏到应用程序的其他部分。为了解决这个问题，可以使用静态 glob 路径。

但请注意，webpack 不支持 glob 路径，因此如果您在 monorepo 中构建应用程序，您将无法使用它们。为了解决这个问题，提供了另一种解决方案。要自动加载实体，请将配置对象（传递给 `forRoot()` 方法）的 `autoLoadEntities` 属性设置为 `true`，如下所示：

```ts
@Module({
  imports: [
    MikroOrmModule.forRoot({
      ...
      autoLoadEntities: true,
    }),
  ],
})
export class AppModule {}

```

指定该选项后，通过 `forFeature()` 方法注册的每个实体都将自动添加到配置对象的实体数组中。

:::info 信息
请注意，未通过 `forFeature()` 方法注册但仅从实体引用（通过关系）的实体不会通过 `autoLoadEntities` 设置包含在内。
:::

:::info 信息
使用 `autoLoadEntities` 对 MikroORM CLI 也没有影响 - 为此我们仍然需要具有完整实体列表的 CLI 配置。另一方面，我们可以在那里使用 glob，因为 CLI 不会通过 webpack。
:::

#### 序列化

:::warning 注意
MikroORM 将每个实体关系包装在 `Reference<T>` 或 `Collection<T>` 对象中，以提供更好的类型安全性。这将使 [Nest 的内置序列化器](/techniques/serialization)无法看到任何包装的关系。换句话说，如果您从 HTTP 或 WebSocket 处理程序返回 MikroORM 实体，它们的所有关系都不会被序列化。
:::

幸运的是，MikroORM 提供了[序列化 API](https://mikro-orm.io/docs/serializing)，可以用来代替 `ClassSerializerInterceptor`。

```typescript
@Entity()
export class Book {
  @Property({ hidden: true }) // 相当于 class-transformer 的 `@Exclude`
  hiddenField = Date.now();

  @Property({ persist: false }) // 类似于 class-transformer 的 `@Expose()`。仅存在于内存中，并将被序列化。
  count?: number;

  @ManyToOne({
    serializer: (value) => value.name,
    serializedName: 'authorName',
  }) // 相当于 class-transformer 的 `@Transform()`
  author: Author;
}

```

#### 队列中的请求作用域处理程序

如[文档](https://mikro-orm.io/docs/identity-map)所述，我们需要为每个请求提供干净的状态。这通过中间件注册的 `RequestContext` 助手自动处理。

但中间件仅针对常规 HTTP 请求处理程序执行，如果我们需要在此之外的请求作用域方法怎么办？一个例子是队列处理程序或计划任务。

我们可以使用 `@CreateRequestContext()` 装饰器。它要求您首先将 `MikroORM` 实例注入到当前上下文中，然后它将为您创建上下文。在底层，装饰器将为您的方法注册新的请求上下文并在上下文中执行它。

```ts
@Injectable()
export class MyService {
  constructor(private readonly orm: MikroORM) {}

  @CreateRequestContext()
  async doSomething() {
    // 这将在单独的上下文中执行
  }
}

```

:::warning 注意
顾名思义，此装饰器总是创建新上下文，与其替代方案 `@EnsureRequestContext` 不同，后者仅在尚未处于另一个上下文中时才创建。
:::

#### 测试

`@mikro-orm/nestjs` 包暴露了 `getRepositoryToken()` 函数，该函数返回基于给定实体准备的令牌，以允许模拟存储库。

```typescript
@Module({
  providers: [
    PhotoService,
    {
      // 或者当您有自定义存储库时：`provide: PhotoRepository`
      provide: getRepositoryToken(Photo),
      useValue: mockedRepository,
    },
  ],
})
export class PhotoModule {}

```

#### 示例

可以在[这里](https://github.com/mikro-orm/nestjs-realworld-example-app)找到 NestJS 与 MikroORM 的真实示例
