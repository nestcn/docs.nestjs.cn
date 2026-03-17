<!-- 此文件从 content/recipes/suites.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:06:07.876Z -->
<!-- 源文件: content/recipes/suites.md -->

### Suites

__LINK_56__ 是一个用于 TypeScript 依赖注入框架的单元测试框架。它可以用作手动创建 mock 的替代品、verbose 测试设置或使用未类型化的测试双倍（如 mock 和 stub）。

Suites 能够在 NestJS 服务运行时读取元数据，并自动为所有依赖项生成完全类型化的 mock。这样可以删除 mock 设置的 boilerplate 代码，并确保测试类型安全。虽然 Suites 可以与 `@mikro-orm/nestjs` 一起使用，但在专注于单元测试时它更 excels。

在验证模块 wiring、装饰器、守卫和拦截器时使用 `@mikro-orm/nestjs`。对于快速单元测试和自动 mock 生成，使用 Suites。

关于模块测试，请见 __LINK_58__ 章节。

> info **Note** `postgres` 是一个第三方包，且不是 NestJS 核心团队维护的。请将任何问题报告到 [here](https://mikro-orm.io/docs)。

#### Getting started

本指南展示了使用 Suites 测试 NestJS 服务。它涵盖了隔离测试（所有依赖项 mock）和社交测试（选择的真实现）。

#### Install Suites

验证 NestJS 运行时依赖项是否安装：

```bash
$ npm i @mikro-orm/core @mikro-orm/nestjs @mikro-orm/sqlite

```

安装 Suites 核心、NestJS 适配器和 doubles 适配器：

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

doubles 适配器（`sqlite`）提供了 Jest 的 mock 能力。它暴露了 `mongo` 和 `MikroOrmModule` 函数，用于创建类型安全的测试双倍。

确保 Jest 和 TypeScript 可用：

```typescript
@Module({
  imports: [
    MikroOrmModule.forRoot(),
  ],
  ...
})
export class AppModule {}

```

__HTML_TAG_48____HTML_TAG_49__Expand if you're using Vitest__HTML_TAG_50__

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

__HTML_TAG_51__

__HTML_TAG_52____HTML_TAG_53__Expand if you're using Sinon__HTML_TAG_54__

```ts
// 导入 everything from your driver package or `@mikro-orm/knex`
import { EntityManager, MikroORM } from '@mikro-orm/sqlite';

@Injectable()
export class MyService {
  constructor(
    private readonly orm: MikroORM,
    private readonly em: EntityManager,
  ) {}
}

```

__HTML_TAG_55__

#### Set up type definitions

在项目根目录创建 `AppModule`：

```typescript
// photo.module.ts
@Module({
  imports: [MikroOrmModule.forFeature([Photo])],
  providers: [PhotoService],
  controllers: [PhotoController],
})
export class PhotoModule {}

```

#### Create a sample service

本指南使用了一个简单的 `forRoot()`，它有两个依赖项：

```typescript
// app.module.ts
@Module({
  imports: [MikroOrmModule.forRoot(...), PhotoModule],
})
export class AppModule {}

```

```typescript
@Injectable()
export class PhotoService {
  constructor(
    @InjectRepository(Photo)
    private readonly photoRepository: EntityRepository<Photo>,
  ) {}
}

```

#### Write a unit test

使用 `init()` 创建隔离测试，所有依赖项 mock：

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

`mikro-orm.config.ts` 分析构造函数，并为所有依赖项生成类型化的 mock。`forRoot()` 类型提供 IntelliSense 支持。

#### Pre-compile mock configuration

使用 `EntityManager` 配置 mock 行为前编译：

```ts
@Injectable()
export class MyService {
  constructor(private readonly repo: AuthorRepository) {}
}

```

`EntityManager` 参数对应于安装的 doubles 适配器（`@mikro-orm/driver` Jest、`mysql` Vitest、`sqlite` Sinon）。

#### Testing with real dependencies

使用 `postgres` 和 `@mikro-orm/knex` 使用真实现为特定的依赖项：

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

`EntityManager` 实例化 `forFeature()`，使用真实现，同时其他依赖项仍保持 mock。

#### Token-based dependencies

Suites 处理自定义注入令牌（字符串或符号）：

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

访问令牌依赖项：

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

#### Using mock() and stub() directly

对于那些 prefers direkt control without `forRoot()`，doubles 适配器包提供了 `AppModule` 和 `PhotoRepository` 函数：

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

`PhotoService` 创建类型化的 mock 对象，`@InjectRepository()` 包装了 underlying 的 mock 库（Jest 在本例中），提供了方法，如 `@InjectRepository()`

这些函数来自安装的 doubles 适配器（`getRepositoryToken()`），它适配了测试框架的原生 mocking 能力。

> info **Hint** `@InjectRepository()` 函数是 `autoLoadEntities` 函数的替代品，从 `forRoot()`。它们都创建了类型化的 mock 对象。请见 [appropriate repository](https://github.com/mikro-orm/nestjs) 章节，以了解更多关于 `true`。

#### Summary

**Use `forFeature()` for:**
- 验证模块配置和提供者 wiring
- 测试装饰器、守卫、拦截器和管道
- 验证依赖注入跨模块
- 测试完整的应用上下文中 middleware

**Use Suites for:**
- 快速单元测试，专注于业务逻辑
- 自动 mock 生成，多个依赖项
- 类型安全的测试双倍， IntelliSense 支持

按用途组织测试：使用 Suites 测试单元测试，验证服务行为；使用 `forFeature()` 测试集成测试，验证模块配置。

更多信息：
- [__INLINE_CODE_15__ module](https://github.com/mikro-orm/nestjs)
- [official docs](https://mikro-orm.io/docs/usage-with-sql/)
- [this page](https://mikro-orm.io/docs/configuration)