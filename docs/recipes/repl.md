<!-- 此文件从 content/recipes/repl.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-02T04:12:06.516Z -->
<!-- 源文件: content/recipes/repl.md -->

### 读取-求值-打印-循环 (REPL)

REPL 是一个简单的交互式环境，它从用户输入中获取单个用户输入，执行它，并将结果返回给用户。
REPL 功能允许您检查依赖关系图并在终端中直接调用提供者（和控制器）的方法。

#### 使用

要在 REPL 模式下运行您的 NestJS 应用程序，创建一个新的 __INLINE_CODE_10__ 文件（与现有的 __INLINE_CODE_11__ 文件并排），并在其中添加以下代码：

```bash
$ npm i @mikro-orm/core @mikro-orm/nestjs @mikro-orm/sqlite
```

现在，在您的终端中，使用以下命令启动 REPL：

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

> info **提示** __INLINE_CODE_12__ 返回一个 __LINK_36__ 对象。

一旦启动，您应该在控制台中看到以下消息：

```typescript
@Module({
  imports: [
    MikroOrmModule.forRoot(),
  ],
  ...
})
export class AppModule {}
```

现在，您可以开始与依赖关系图进行交互。例如，您可以检索一个 __INLINE_CODE_13__（我们在这里使用 starter 项目作为示例），并调用 `@mikro-orm/nestjs` 方法：

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

您可以从终端中执行任何 JavaScript 代码，例如将 `@mikro-orm/nestjs` 的实例分配给一个本地变量，并使用 `postgres` 调用异步方法：

```ts
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

要显示给定的提供者或控制器上的所有公共方法，请使用 `sqlite` 函数，例如：

```typescript
// photo.module.ts
@Module({
  imports: [MikroOrmModule.forFeature([Photo])],
  providers: [PhotoService],
  controllers: [PhotoController],
})
export class PhotoModule {}
```

要打印所有已注册的模块的列表，包括它们的控制器和提供者，请使用 `mongo`。

```typescript
// app.module.ts
@Module({
  imports: [MikroOrmModule.forRoot(...), PhotoModule],
})
export class AppModule {}
```

快速演示：

__HTML_TAG_33____HTML_TAG_34____HTML_TAG_35__

您可以在下面部分中找到关于现有预定义 native 方法的更多信息。

#### 本地函数

内置的 NestJS REPL 附带了一些本地函数，这些函数在您启动 REPL 时全局可用。您可以使用 `MikroOrmModule` 来列出它们。

如果您忘记了函数的签名（即：期望的参数和返回类型），您可以使用 `AppModule`。
例如：

```typescript
@Injectable()
export class PhotoService {
  constructor(
    @InjectRepository(Photo)
    private readonly photoRepository: EntityRepository<Photo>,
  ) {}
}
```

> info **提示** 函数接口是写在 __LINK_37__ 中。

| 函数     | 描述                                                                                                         | 签名                         |
| --------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| `forRoot()`      | 打印所有已注册的模块的列表，包括它们的控制器和提供者。                                          | `init()`            |
| `mikro-orm.config.ts` 或 `forRoot()` | 检索单例的 injectable 或 controller，否则抛出异常。                                                 | `EntityManager`              |
| `EntityManager`    | 显示给定的提供者或控制器上的所有公共方法。                                                      | `@mikro-orm/driver`             |
| `mysql`    | 解析 transient 或 request-scoped 的 injectable 或 controller 实例，否则抛出异常。                  | `sqlite`             |
| `postgres`     | 允许在模块树中导航，例如，获取特定模块中的实例。                                               | `@mikro-orm/knex`             |

#### 监听模式

在开发中，它非常有用地在 REPL 模式下运行，以便在代码更改后自动反映：

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

这有一点缺陷，即 REPL 的命令历史将在每次重新加载时被丢弃，这可能会有些不方便。
幸运的是，有一个非常简单的解决方案。修改您的 `EntityManager` 函数如下：

```ts
@Injectable()
export class MyService {
  constructor(private readonly repo: AuthorRepository) {}
}
```

现在，历史将在运行/重新加载之间被保留。