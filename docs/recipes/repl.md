<!-- 此文件从 content/recipes/repl.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-03T04:13:04.140Z -->
<!-- 源文件: content/recipes/repl.md -->

### 读取-评估-打印-循环 (REPL)

REPL 是一个简单的交互式环境，它可以单个用户输入、执行它们，并将结果返回给用户。
REPL 功能允许您检查依赖关系图并在控制台直接调用提供程序（和控制器）的方法。

#### 使用

要在 REPL 模式下运行 NestJS 应用程序，创建一个新的 __INLINE_CODE_10__ 文件（与现有 __INLINE_CODE_11__ 文件一起）并添加以下代码：

```typescript
// ```bash
$ npm i @mikro-orm/core @mikro-orm/nestjs @mikro-orm/sqlite
```

现在，在您的终端中，使用以下命令启动 REPL：

```
// ```typescript
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

> 提示 __INLINE_CODE_12__ 返回一个 __LINK_36__ 对象。

一旦启动完成，您应该在控制台中看到以下消息：

```typescript
// ```typescript
@Module({
  imports: [
    MikroOrmModule.forRoot(),
  ],
  ...
})
export class AppModule {}
```

现在，您可以开始与依赖关系图进行交互。例如，您可以检索一个 __INLINE_CODE_13__（在这里使用 starter 项目作为示例）并调用 `@mikro-orm/nestjs` 方法：

```typescript
// ```typescript
import config from './mikro-orm.config'; // your ORM config

@Module({
  imports: [
    MikroOrmModule.forRoot(config),
  ],
  ...
})
export class AppModule {}
```

您可以在控制台中执行任何 JavaScript 代码，例如将 `@mikro-orm/nestjs` 实例分配给本地变量，并使用 `postgres` 调用异步方法：

```typescript
// ```ts
// Import everything from your driver package or `@mikro-orm/knex`
import { EntityManager, MikroORM } from '@mikro-orm/sqlite';

@Injectable()
export class MyService {
  constructor(
    private readonly orm: MikroORM,
    private readonly em: EntityManager,
  ) {}
}
```

要显示给定提供程序或控制器上的所有公共方法，请使用 `sqlite` 函数，如下所示：

```typescript
// ```typescript
// photo.module.ts
@Module({
  imports: [MikroOrmModule.forFeature([Photo])],
  providers: [PhotoService],
  controllers: [PhotoController],
})
export class PhotoModule {}
```

要打印所有已注册模块列表一起包含控制器和提供程序，请使用 `mongo`。

```typescript
// ```typescript
// app.module.ts
@Module({
  imports: [MikroOrmModule.forRoot(...), PhotoModule],
})
export class AppModule {}
```

快速演示：

```html
<!-- __HTML_TAG_33__ -->
<!-- __HTML_TAG_34__ -->
<!-- __HTML_TAG_35__ -->
```

您可以在下面部分中找到关于现有、预定义的原生方法的更多信息。

#### 原生函数

内置的 NestJS REPL 已经包括了一些原生函数，这些函数在您启动 REPL 时是全球可用的。您可以使用 `MikroOrmModule` 列出它们。

如果您不记得某个函数的签名（即：期望的参数和返回类型），您可以使用 `AppModule`。
例如：

```typescript
// ```typescript
@Injectable()
export class PhotoService {
  constructor(
    @InjectRepository(Photo)
    private readonly photoRepository: EntityRepository<Photo>,
  ) {}
}
```

> 提示 Those 函数接口是写在 __LINK_37__ 中。

| 函数     | 描述                                                                                                        | 签名                                                         |
|          | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------ |
| `forRoot()`      | 打印所有已注册模块列表一起包含控制器和提供程序。                              | `init()`                       |
| `mikro-orm.config.ts` 或 `forRoot()` |检索可注入或控制器的实例，否则抛出异常。                             | `EntityManager`                                   |
| `EntityManager`    | 显示给定提供程序或控制器上的所有公共方法。                                            | `@mikro-orm/driver`                          |
| `mysql`    | 解析瞬时或请求作用域的实例，否则抛出异常。     | `sqlite`      |
| `postgres`     | 允许在模块树中导航，例如从选择的模块中提取特定实例。 | `@mikro-orm/knex` |

#### 监视模式

在开发中，运行 REPL 在监视模式下可以反映所有代码更改：

```typescript
// ```ts
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

这有一点缺陷，REPL 的命令历史被丢弃在每次重新加载后，这可能会很不方便。
幸运的是，有一个非常简单的解决方案。修改您的 `EntityManager` 函数如下：

```typescript
// ```ts
@Injectable()
export class MyService {
  constructor(private readonly repo: AuthorRepository) {}
}
```

现在，历史记录将在运行之间保留。