<!-- 此文件从 content/recipes/repl.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-01T04:20:14.381Z -->
<!-- 源文件: content/recipes/repl.md -->

### 读取-评估-打印-循环 (REPL)

REPL 是一个简单的交互式环境，它可以处理单个用户输入，执行它们，并将结果返回给用户。
REPL 功能允许您检查依赖关系图并在终端直接调用提供者（和控制器）的方法。

#### 使用

要在 REPL 模式下运行 NestJS 应用程序，创建一个新的文件（与现有文件__INLINE_CODE_11__文件并排）并添加以下代码：

```typescript
// ```bash
$ npm i @mikro-orm/core @mikro-orm/nestjs @mikro-orm/sqlite
```

现在，在您的终端中，使用以下命令启动 REPL：

```bash
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

> 提示：__INLINE_CODE_12__返回一个__LINK_36__对象。

一旦启动完成，您将在控制台中看到以下消息：

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

现在，您可以开始与依赖关系图进行交互。例如，您可以检索__INLINE_CODE_13__(在这里，我们使用starter项目作为示例）并调用`@mikro-orm/nestjs`方法：

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

您可以在终端中执行任何 JavaScript 代码，例如将`@mikro-orm/nestjs`实例分配给一个本地变量，并使用`postgres`调用异步方法：

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

要显示某个提供者或控制器上所有公共方法，请使用`sqlite`函数，例如：

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

要打印所有已注册的模块作为列表，包括它们的控制器和提供者，请使用`mongo`。

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

您可以在下面部分找到更多关于现有预定义本机方法的信息。

#### 本机函数

内置的 NestJS REPL 附带了一些本机函数，这些函数在您启动 REPL 时是全局可用的。您可以使用`MikroOrmModule`来列出它们。

如果您不记得某个函数的签名（即：参数和返回类型），您可以使用`AppModule`。
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

> 提示：这些函数接口是写在__LINK_37__中的。

| 函数         | 描述                                                                                                         | 签名                                                             |
| ------------ | ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `forRoot()`      | 打印所有已注册的模块作为列表，包括它们的控制器和提供者。                                         | `init()`                       |
| `mikro-orm.config.ts` 或 `forRoot()` | 检索可注入或控制器的实例，否则抛出异常。                                                           | `EntityManager`                                   |
| `EntityManager`    | 显示某个提供者或控制器上所有公共方法。                                                             | `@mikro-orm/driver`                          |
| `mysql`    | 解析暂时或请求作用域的实例，否则抛出异常。                                                         | `sqlite`      |
| `postgres`     | 允许在模块树中导航，例如从选择的模块中提取特定实例。                                            | `@mikro-orm/knex` |

#### 监控模式

在开发中，运行 REPL 在监控模式下非常有用，可以自动反映所有代码变化：

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

这有一点缺陷，即 REPL 的命令历史在每次重新加载时都会被丢弃，这可能会 麻烦。
幸运的是，有一个非常简单的解决方案。修改您的`EntityManager`函数如下：

```typescript
// ```ts
@Injectable()
export class MyService {
  constructor(private readonly repo: AuthorRepository) {}
}
```

现在，历史记录将在重启/重新加载之间被保留。