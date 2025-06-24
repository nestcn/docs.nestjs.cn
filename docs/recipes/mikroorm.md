### MikroORM

本指南旨在帮助用户在 Nest 中快速上手 MikroORM。MikroORM 是基于数据映射器、工作单元和身份映射模式的 Node.js TypeScript ORM，是 TypeORM 的优秀替代方案，从 TypeORM 迁移也相当容易。完整文档可查阅[此处](https://mikro-orm.io/docs) 。

> info **注意** `@mikro-orm/nestjs` 是第三方包，不由 NestJS 核心团队维护。发现任何问题请提交至[对应代码库](https://github.com/mikro-orm/nestjs) 。

#### 安装

将 MikroORM 集成到 Nest 的最简单方式是通过 [`@mikro-orm/nestjs` 模块](https://github.com/mikro-orm/nestjs) 。只需将其与 Nest、MikroORM 及底层驱动一起安装：

```bash
$ npm i @mikro-orm/core @mikro-orm/nestjs @mikro-orm/sqlite
```

MikroORM 还支持 `postgres`、`sqlite` 和 `mongo`。所有驱动支持请参阅[官方文档](https://mikro-orm.io/docs/usage-with-sql/) 。

安装完成后，我们可以将 `MikroOrmModule` 导入根模块 `AppModule`。

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

`forRoot()` 方法接收与 MikroORM 包中 `init()` 相同的配置对象。完整配置文档请查看[此页面](https://mikro-orm.io/docs/configuration) 。

或者我们可以通过创建配置文件 `mikro-orm.config.ts` 来[配置 CLI](https://mikro-orm.io/docs/installation#setting-up-the-commandline-tool)，然后无需参数直接调用 `forRoot()`。

```typescript
@Module({
  imports: [
    MikroOrmModule.forRoot(),
  ],
  ...
})
export class AppModule {}
```

但当使用支持 tree shaking 的构建工具时，这种方法会失效，因此最好显式提供配置：

```typescript
import config from './mikro-orm.config'; // your ORM config

@Module({
  imports: [
    MikroOrmModule.forRoot(config),
  ],
  ...
})
export class AppModule {}
```

之后，`EntityManager` 就可以在整个项目中注入使用了（无需在其他地方导入任何模块）。

```ts
// Import everything from your driver package or `@mikro-orm/knex`
import { EntityManager, MikroORM } from '@mikro-orm/sqlite';

@Injectable()
export class MyService {
  constructor(
    private readonly orm: MikroORM,
    private readonly em: EntityManager
  ) {}
}
```

> **注意** ：请注意 `EntityManager` 是从 `@mikro-orm/driver` 包导入的，其中 driver 可以是 `mysql`、`sqlite`、`postgres` 或您正在使用的其他驱动。如果您安装了 `@mikro-orm/knex` 作为依赖项，也可以从那里导入 `EntityManager`。

#### 存储库

MikroORM 支持仓储设计模式。我们可以为每个实体创建仓储库。完整的仓储库文档请参阅[此处](https://mikro-orm.io/docs/repositories) 。要定义当前作用域中应注册哪些仓储库，可以使用 `forFeature()` 方法。例如：

> info **提示** 您**不应**通过 `forFeature()` 注册基础实体，因为这些实体没有对应的仓储库。另一方面，基础实体需要包含在 `forRoot()` 的列表中（或包含在 ORM 配置中）。

```typescript
// photo.module.ts
@Module({
  imports: [MikroOrmModule.forFeature([Photo])],
  providers: [PhotoService],
  controllers: [PhotoController],
})
export class PhotoModule {}
```

并将其导入根模块 `AppModule`：

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
    private readonly photoRepository: EntityRepository<Photo>
  ) {}
}
```

#### 使用自定义存储库

当使用自定义存储库时，我们不再需要 `@InjectRepository()` 装饰器，因为 Nest 的依赖注入是基于类引用解析的。

```ts
// `**./author.entity.ts**`
@Entity({ repository: () => AuthorRepository })
export class Author {
  // to allow inference in `em.getRepository()`
  [EntityRepositoryType]?: AuthorRepository;
}

// `**./author.repository.ts**`
export class AuthorRepository extends EntityRepository<Author> {
  // your custom methods...
}
```

由于自定义存储库名称与 `getRepositoryToken()` 返回的值相同，我们不再需要 `@InjectRepository()` 装饰器：

```ts
@Injectable()
export class MyService {
  constructor(private readonly repo: AuthorRepository) {}
}
```

#### 自动加载实体

手动将实体添加到连接选项的实体数组中可能很繁琐。此外，从根模块引用实体会破坏应用程序的领域边界，并导致实现细节泄漏到应用程序的其他部分。为解决这个问题，可以使用静态全局路径。

但需注意，webpack 不支持全局路径，因此如果您正在构建 一个单体仓库内的应用程序，将无法使用它们。为了解决这个问题 问题，我们提供了替代解决方案。要自动加载实体，请设置 配置对象（传入 `forRoot()` 方法）的 `autoLoadEntities` 属性 方法）设置为 `true`，如下所示：

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

指定该选项后，通过 `forFeature()` 注册的每个实体 该方法将自动添加到配置的实体数组中 对象。

> info **注意** 未通过 `forFeature()` 方法注册，而仅通过关系从实体引用的实体不会通过 `autoLoadEntities` 设置被包含。

> info **注意** 使用 `autoLoadEntities` 对 MikroORM CLI 也没有影响 - 我们仍然需要包含完整实体列表的 CLI 配置。另一方面，我们可以在 CLI 中使用通配符，因为 CLI 不会经过 webpack 处理。

#### 序列化

> warning **注意** MikroORM 将每个实体关系都包装在 `Reference<T>` 或 `Collection<T>` 对象中，以提供更好的类型安全性。这将导致 [Nest 内置的序列化器](/techniques/serialization) 无法识别任何被包装的关系。换句话说，如果你从 HTTP 或 WebSocket 处理器返回 MikroORM 实体，它们的所有关系都将不会被序列化。

幸运的是，MikroORM 提供了一个[序列化 API](https://mikro-orm.io/docs/serializing)，可以用来替代 `ClassSerializerInterceptor`。

```typescript
@Entity()
export class Book {
  @Property({ hidden: true }) // Equivalent of class-transformer's `@Exclude`
  hiddenField = Date.now();

  @Property({ persist: false }) // Similar to class-transformer's `@Expose()`. Will only exist in memory, and will be serialized.
  count?: number;

  @ManyToOne({
    serializer: (value) => value.name,
    serializedName: 'authorName',
  }) // Equivalent of class-transformer's `@Transform()`
  author: Author;
}
```

#### 队列中的请求范围处理器

如[文档](https://mikro-orm.io/docs/identity-map)所述，每个请求都需要一个干净的状态。这通过中间件注册的 `RequestContext` 辅助工具自动处理。

但中间件仅针对常规 HTTP 请求处理器执行，如果我们需要在此范围之外使用请求作用域方法呢？队列处理器或计划任务就是典型例子。

我们可以使用 `@CreateRequestContext()` 装饰器。它要求你首先将 `MikroORM` 实例注入当前上下文，随后该实例将用于为你创建上下文。在底层，装饰器会为你的方法注册新的请求上下文，并在该上下文中执行方法。

```ts
@Injectable()
export class MyService {
  constructor(private readonly orm: MikroORM) {}

  @CreateRequestContext()
  async doSomething() {
    // this will be executed in a separate context
  }
}
```

> warning **注意** 顾名思义，该装饰器总是会创建新的上下文，这与替代方案 `@EnsureRequestContext` 不同——后者仅在尚未处于其他上下文时才会创建。

#### 测试

`@mikro-orm/nestjs` 包提供了 `getRepositoryToken()` 函数，该函数基于给定实体返回预处理的令牌以便模拟存储库。

```typescript
@Module({
  providers: [
    PhotoService,
    {
      // or when you have a custom repository: `provide: PhotoRepository`
      provide: getRepositoryToken(Photo),
      useValue: mockedRepository,
    },
  ],
})
export class PhotoModule {}
```

#### 示例

NestJS 与 MikroORM 的实际应用示例可[在此](https://github.com/mikro-orm/nestjs-realworld-example-app)查看
