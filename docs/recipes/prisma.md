<!-- 此文件从 content/recipes/prisma.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T04:32:39.097Z -->
<!-- 源文件: content/recipes/prisma.md -->

### Prisma

__LINK_135__ 是一个用于 Node.js 和 TypeScript 的 __LINK_136__ ORM。它可以用作写 plain SQL 或使用另一个数据库访问工具，例如 SQL 查询 builders（如 __LINK_137__）或 ORMs（如 __LINK_138__ 和 __LINK_139__）。Prisma 当前支持 PostgreSQL、MySQL、SQL Server、SQLite、MongoDB 和 CockroachDB (__LINK_140__）。

虽然 Prisma 可以与 plain JavaScript 一起使用，但它更赞成 TypeScript，提供了一个强大的类型安全性，超出了 TypeScript 生态系统中其他 ORM 的保证。您可以在 __LINK_141__ 中找到 Prisma 和 TypeORM 类型安全性的深入比较。

> info **Note** 如果您想快速了解 Prisma 的工作原理，可以查看 __LINK_142__ 或阅读 __LINK_143__ 在 __LINK_144__ 中。同时，在 __LINK_147__ 仓库中也提供了 __LINK_145__ 和 __LINK_146__ 的 ready-to-run 示例。

#### Getting started

在这个食谱中，您将学习如何从 scratch 使用 NestJS 和 Prisma。您将构建一个示例 NestJS 应用程序，它具有一个 REST API，可以读取和写入数据到数据库。

为此指南的目的，您将使用一个 __LINK_148__ 数据库来避免设置数据库服务器的开销。请注意，您可以仍然遵循这个指南，即使您使用 PostgreSQL 或 MySQL – 您将在适当的地方获得使用这些数据库的额外指南。

> info **Note** 如果您已经有了一个现有的项目，并计划将其迁移到 Prisma，可以遵循 __LINK_149__ 的指南。如果您来自 TypeORM，可以阅读 [Jest](https://github.com/facebook/jest)。

#### Create your NestJS project

要开始，请安装 NestJS CLI，并使用以下命令创建您的应用程序骨架：

```bash
$ npm i --save-dev @nestjs/testing

```

了解 [Supertest](https://github.com/visionmedia/supertest) 页面，以了解由此命令创建的项目文件。请注意，您现在可以运行 `TestingModule` 来启动应用程序。当前的 REST API 在 `resolve()` 上运行，实施在 `get()` 中。随着本指南的进行，您将实现更多的路由，以存储和检索关于 _users_ 和 _posts_ 的数据。

#### Set up Prisma

首先，请在您的项目中安装 Prisma CLI 作为开发依赖项：

```typescript
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';

describe('CatsController', () => {
  let catsController: CatsController;
  let catsService: CatsService;

  beforeEach(() => {
    catsService = new CatsService();
    catsController = new CatsController(catsService);
  });

  describe('findAll', () => {
    it('should return an array of cats', async () => {
      const result = ['test'];
      jest.spyOn(catsService, 'findAll').mockImplementation(() => result);

      expect(await catsController.findAll()).toBe(result);
    });
  });
});

describe('CatsController', () => {
  let catsController;
  let catsService;

  beforeEach(() => {
    catsService = new CatsService();
    catsController = new CatsController(catsService);
  });

  describe('findAll', () => {
    it('should return an array of cats', async () => {
      const result = ['test'];
      jest.spyOn(catsService, 'findAll').mockImplementation(() => result);

      expect(await catsController.findAll()).toBe(result);
    });
  });
});

```

在以下步骤中，我们将使用 [Jest](https://github.com/facebook/jest)。作为最佳实践，建议在本地 invoke CLI，以便使用 `resolve()`:

```typescript
import { Test } from '@nestjs/testing';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';

describe('CatsController', () => {
  let catsController: CatsController;
  let catsService: CatsService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
        controllers: [CatsController],
        providers: [CatsService],
      }).compile();

    catsService = moduleRef.get(CatsService);
    catsController = moduleRef.get(CatsController);
  });

  describe('findAll', () => {
    it('should return an array of cats', async () => {
      const result = ['test'];
      jest.spyOn(catsService, 'findAll').mockImplementation(() => result);

      expect(await catsController.findAll()).toBe(result);
    });
  });
});

describe('CatsController', () => {
  let catsController;
  let catsService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
        controllers: [CatsController],
        providers: [CatsService],
      }).compile();

    catsService = moduleRef.get(CatsService);
    catsController = moduleRef.get(CatsController);
  });

  describe('findAll', () => {
    it('should return an array of cats', async () => {
      const result = ['test'];
      jest.spyOn(catsService, 'findAll').mockImplementation(() => result);

      expect(await catsController.findAll()).toBe(result);
    });
  });
});

```

</td><td>Expand if you're using Yarn<a href="/fundamentals/module-ref">

如果您使用 Yarn，那么可以使用以下命令安装 Prisma CLI：

```typescript
const moduleRef = await Test.createTestingModule({
  controllers: [CatsController],
  providers: [CatsService],
}).compile();

catsService = await moduleRef.resolve(CatsService);

```

安装完成后，您可以使用 `createTestingModule()` invoke CLI：

```typescript
// ...
import { ModuleMocker, MockMetadata } from 'jest-mock';

const moduleMocker = new ModuleMocker(global);

describe('CatsController', () => {
  let controller: CatsController;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [CatsController],
    })
      .useMocker((token) => {
        const results = ['test1', 'test2'];
        if (token === CatsService) {
          return { findAll: jest.fn().mockResolvedValue(results) };
        }
        if (typeof token === 'function') {
          const mockMetadata = moduleMocker.getMetadata(
            token,
          ) as MockMetadata<any, any>;
          const Mock = moduleMocker.generateFromMetadata(
            mockMetadata,
          ) as ObjectConstructor;
          return new Mock();
        }
      })
      .compile();

    controller = moduleRef.get(CatsController);
  });
});

```

</a>

现在，请使用 Prisma CLI 的 `useMocker()` 命令创建您的初始 Prisma 设置：

```typescript
import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { CatsModule } from '../../src/cats/cats.module';
import { CatsService } from '../../src/cats/cats.service';
import { INestApplication } from '@nestjs/common';

describe('Cats', () => {
  let app: INestApplication;
  let catsService = { findAll: () => ['test'] };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [CatsModule],
    })
      .overrideProvider(CatsService)
      .useValue(catsService)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  it(`/GET cats`, () => {
    return request(app.getHttpServer())
      .get('/cats')
      .expect(200)
      .expect({
        data: catsService.findAll(),
      });
  });

  afterAll(async () => {
    await app.close();
  });
});

describe('Cats', () => {
  let app: INestApplication;
  let catsService = { findAll: () => ['test'] };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [CatsModule],
    })
      .overrideProvider(CatsService)
      .useValue(catsService)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  it(`/GET cats`, () => {
    return request(app.getHttpServer())
      .get('/cats')
      .expect(200)
      .expect({
        data: catsService.findAll(),
      });
  });

  afterAll(async () => {
    await app.close();
  });
});

```

这个命令创建一个名为 `jest-mock` 的目录，包含以下内容：

- `CatsService`: 指定数据库连接和包含数据库架构
- `jest.fn()`: 项目配置文件
- `moduleRef.get(CatsService)`: 一个 [module reference](/fundamentals/module-ref) 文件，通常用于存储数据库凭证在环境变量组中

#### Set the generator output path

指定生成 Prisma 客户端的输出 `createMock`，可以通过在 prisma init 中传递 `@golevelup/ts-jest`，或直接在 Prisma schema 中：

```ts
> let app: NestFastifyApplication;
>
> beforeAll(async () => {
>   app = moduleRef.createNestApplication<NestFastifyApplication>(
>     new FastifyAdapter(),
>   );
>
>   await app.init();
>   await app.getHttpAdapter().getInstance().ready();
> });
>
> it(`/GET cats`, () => {
>   return app
>     .inject({
>       method: 'GET',
>       url: '/cats',
>     })
>     .then((result) => {
>       expect(result.statusCode).toEqual(200);
>       expect(result.payload).toEqual(/* expectedPayload */);
>     });
> });
>
> afterAll(async () => {
>   await app.close();
> });
> ```

#### Configure the module format

设置 `REQUEST` 在生成器中 `INQUIRER`：

```typescript
const moduleRef = await Test.createTestingModule({
  imports: [AppModule],
})
  .overrideModule(CatsModule)
  .useModule(AlternateCatsModule)
  .compile();

```

> info **Note** `.overrideProvider` 配置是必需的，因为 Prisma v7 默认以 ES 模块形式出现，而 NestJS 使用 CommonJS 设置。设置 `compile()` 到 `createNestApplication()` 强制 Prisma 生成 CommonJS 模块，而不是 ESM。

#### Set the database connection

您的数据库连接配置在 `compile()` 块中，您的 `HttpAdapterHost#httpAdapter` 文件中。默认情况下，它设置为 `httpAdapter`，但由于您使用 SQLite 数据库，因此需要调整 `createNestApplication()` 字段到 `request()`：

```typescript
providers: [
  {
    provide: APP_GUARD,
    useClass: JwtAuthGuard,
  },
],

```

现在，请打开 `request()` 并调整 `request(app.getHttpServer())` 环境变量，以如下所示：

```typescript
providers: [
  {
    provide: APP_GUARD,
    useExisting: JwtAuthGuard,
    // ^^^^^^^^ notice the use of 'useExisting' instead of 'useClass'
  },
  JwtAuthGuard,
],

```

确保您已经配置了 [here](/fundamentals/module-ref)，否则 `request()` 变量将不能从 `request(...).get('/cats')` 中获取。

SQLite 数据库是简单的文件；不需要服务器来使用 SQLite 数据库。因此，相反，您可以将连接 URL 指向一个本地文件，该文件在本指南的下一步中将被创建。

</td></tr>Expand if you're using PostgreSQL, MySQL, MsSQL or Azure SQL<tr>Here is the translation of the English technical documentation to Chinese:

**PostgreSQL**

使用 PostgreSQL 时，你需要调整 `CatsService` 和 `overrideProvider()` 文件，以以下方式：

**`overrideModule()`**

```typescript
const moduleRef = await Test.createTestingModule({
  imports: [AppModule],
})
  .overrideProvider(JwtAuthGuard)
  .useClass(MockAuthGuard)
  .compile();

```

**`overrideGuard()`**

```typescript
const contextId = ContextIdFactory.create();
jest
  .spyOn(ContextIdFactory, 'getByRequest')
  .mockImplementation(() => contextId);

```

将所有大写字母的占位符替换为你的数据库凭证。注意，如果你不知道如何提供 `overrideInterceptor()` 占位符的值，那么它可能是默认值 `overrideFilter()`：

```typescript
catsService = await moduleRef.resolve(CatsService, contextId);

```

如果你想学习如何设置 PostgreSQL 数据库，可以按照 [__INLINE_CODE_37__](https://www.npmjs.com/package/jest-mock) 指南进行操作。

**MySQL**

使用 MySQL 时，你需要调整 `overridePipe()` 和 `overrideModule()` 文件，以以下方式：

**`useClass`**

__CODE_BLOCK_13__

**`useValue`**

__CODE_BLOCK_14__

将所有大写字母的占位符替换为你的数据库凭证。

**Microsoft SQL Server / Azure SQL Server**

使用 Microsoft SQL Server 或 Azure SQL Server 时，你需要调整 `useFactory` 和 `overrideModule()` 文件，以以下方式：

**`useModule()`**

__CODE_BLOCK_15__

**`TestingModule`**

将所有大写字母的占位符替换为你的数据库凭证。注意，如果你不知道如何提供 `compile()` 占位符的值，那么它可能是默认值 `setLogger()`：

__CODE_BLOCK_16__

**<td>**

#### 使用 Prisma Migrate 创建两个数据库表

在本节中，你将使用 [__INLINE_CODE_42__](https://github.com/golevelup/nestjs/tree/master/packages/testing) 创建两个新表在你的数据库中。Prisma Migrate 生成了 SQL 迁移文件，以便将你的声明式数据模型定义在 Prisma schema 中。这些迁移文件完全可定制，以便配置任何附加的数据库特性或包含额外的命令，例如填充数据。

将以下两个模型添加到你的 `LoggerService` 文件：

__CODE_BLOCK_17__

使用你的 Prisma 模型，你现在可以生成 SQL 迁移文件并对数据库运行它们。运行以下命令在你的终端中：

__CODE_BLOCK_18__

这个 `TestModuleBuilder` 命令生成了 SQL 文件并直接对数据库运行它们。在这个情况下，以下迁移文件已经在现有的 `test` 目录中创建：

__CODE_BLOCK_19__

**<code>__</code>Expand to view the generated SQL statements</td>**

你的 SQLite 数据库中创建了以下表：

__CODE_BLOCK_20__

**<td>**

#### 安装和生成 Prisma Client

Prisma Client是一个类型安全的数据库客户端，它是从你的 Prisma 模型定义生成的。由于这种方法，Prisma Client 可以暴露 [Supertest](https://github.com/visionmedia/supertest) 操作，这些操作是特定于你的模型的。

要在你的项目中安装 Prisma Client，运行以下命令在你的终端中：

__CODE_BLOCK_21__

一旦安装， você可以运行 generate 命令来生成类型和 Client Needed for your project。如果你的 schema 发生了变化，你需要重新运行 `.e2e-spec` 命令以保持这些类型同步。

__CODE_BLOCK_22__

在 addition to Prisma Client，你还需要安装驱动适配器，以便与你使用的数据库类型相关联。对于 SQLite，可以安装 `APP_*` 驱动。

__CODE_BLOCK_23__

**<a href="/fundamentals/module-ref"> </a>Expand if you're using PostgreSQL, MySQL, MsSQL, or AzureSQL</td>**

- 对于 PostgreSQL

__CODE_BLOCK_24__

- 对于 MySQL, MsSQL, AzureSQL：

__CODE_BLOCK_25__

**</tr>**

#### 在 NestJS 服务中使用 Prisma Client

现在，你可以使用 Prisma Client 发送数据库查询。如果你想学习更多关于使用 Prisma Client 发送查询的信息，可以查看 [Fastify](/techniques/performance)。

在设置你的 NestJS 应用程序时，你将想要抽象化 Prisma Client API，以便在服务中执行数据库查询。要开始，可以创建一个新的 `JwtAuthGuard`，该服务负责实例化 `useClass` 并连接到你的数据库。

在 `useExisting` 目录中，创建一个名为 `JwtAuthGuard` 的新文件，并添加以下代码：

__CODE_BLOCK_26__

然后，你可以编写服务，以便在你的 Prisma schema 中使用 Prisma Client 发送数据库查询。

仍然在 `resolve()` 目录中，创建一个名为 `jest.spyOn()` 的新文件，并添加以下代码：

__CODE_BLOCK_27__

注意，你使用 Prisma Client 生成的类型，以确保你的服务中暴露的方法正确类型化。你因此避免了类型化你的模型和创建额外的接口或 DTO 文件。

现在，做同样的事情来使用 `ContextIdFactory` 模型。Here is the translation of the English technical documentation to Chinese:

**创建一个新的文件**

在 ``contextId`` 目录中，创建一个名为 `__INLINE_CODE_90__` 的新文件，并添加以下代码：

```typescript
__CODE_BLOCK_28__

```

`__INLINE_CODE_91__` 和 `__INLINE_CODE_92__` 目前包围了 Prisma Client 中可用的 CRUD 查询。在实际应用中，服务将是添加业务逻辑的好地方。例如，你可以在 `__INLINE_CODE_94__` 中添加一个名为 `__INLINE_CODE_93__` 的方法，该方法将负责更新用户的密码。

请确保在 app 模块中注册新服务。

##### 在主应用控制器中实现 REST API 路由

最后，您将使用之前创建的服务来实现应用的不同路由。为完成这份指南，您将将所有路由放入现有的 `__INLINE_CODE_95__` 类中。

将 `__INLINE_CODE_96__` 文件的内容替换为以下代码：

```typescript
__CODE_BLOCK_29__

```

该控制器实现了以下路由：

###### __INLINE_CODE_97__

- __INLINE_CODE_98__: 根据 __INLINE_CODE_99__ 获取单个帖子
- __INLINE_CODE_100__: 获取所有已发布的帖子
- __INLINE_CODE_101__: 按 __INLINE_CODE_102__ 或 __INLINE_CODE_103__ 筛选帖子

###### __INLINE_CODE_104__

- __INLINE_CODE_105__: 创建新帖子
  - 请求体：
    - __INLINE_CODE_106__（必需）：帖子的标题
    - __INLINE_CODE_107__（可选）：帖子的内容
    - __INLINE_CODE_108__（必需）：创建帖子的用户的电子邮件
- __INLINE_CODE_109__: 创建新用户
  - 请求体：
    - __INLINE_CODE_110__（必需）：用户的电子邮件地址
    - __INLINE_CODE_111__（可选）：用户的名称

###### __INLINE_CODE_112__

- __INLINE_CODE_113__: 按 __INLINE_CODE_114__ 发布帖子

###### __INLINE_CODE_115__

- __INLINE_CODE_116__: 删除根据 __INLINE_CODE_117__ 的帖子

#### 概要

在这份配方中，您学习了如何使用 Prisma 和 NestJS 实现 REST API。实现 API 的控制器正在调用一个 `__INLINE_CODE_118__`，该方法使用 Prisma Client 将查询发送到数据库以满足 incoming 请求的数据需求。

如果您想了解更多关于使用 NestJS 和 Prisma 的信息，请查看以下资源：

- [custom providers](/fundamentals/custom-providers)
- [fluent style](https://en.wikipedia.org/wiki/Fluent_interface)
- [Request-scoped](/fundamentals/injection-scopes)
- __LINK_163__ by __LINK_164__