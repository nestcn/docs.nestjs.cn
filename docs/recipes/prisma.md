<!-- 此文件从 content/recipes/prisma.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-21T16:18:20.086Z -->
<!-- 源文件: content/recipes/prisma.md -->

### Prisma

__LINK_135__ 是一个 __LINK_136__ ORM для Node.js 和 TypeScript。它被用作写 plain SQL 或使用另一个数据库访问工具（如 __LINK_137__ 或 __LINK_138__ 和 __LINK_139__）的替代方案。Prisma 目前支持 PostgreSQL、MySQL、SQL Server、SQLite、MongoDB 和 CockroachDB（__LINK_140__）。

虽然 Prisma 可以与 plain JavaScript 一起使用，但它更喜欢 TypeScript，提供了类型安全性超过 TypeScript 生态系统中的其他 ORM。您可以在 __LINK_141__ 中找到 Prisma 和 TypeORM 的类型安全性比较。

> info **Note** 如果您想了解 Prisma 的工作原理，可以遵循 __LINK_142__ 或阅读 __LINK_143__ 在 __LINK_144__ 中。同时，在 __LINK_147__ repo 中也提供了对 __LINK_145__ 和 __LINK_146__ 的 ready-to-run示例。

#### Getting started

在这个食谱中，您将学习如何从头开始使用 NestJS 和 Prisma。您将构建一个示例 NestJS 应用程序，具有 REST API，可以读取和写入数据到数据库。

为了这个指南，您将使用一个 __LINK_148__ 数据库，以免设置数据库服务器的开销。请注意，您仍然可以遵循这个指南，即使您使用 PostgreSQL 或 MySQL – 您将在适当的地方获得使用这些数据库的额外指南。

> info **Note** 如果您已经有了一个现有的项目，并考虑迁移到 Prisma，可以遵循 __LINK_149__ 指南。如果您从 TypeORM 迁移到 Prisma，可以阅读 [Jest](https://github.com/facebook/jest) 指南。

#### 创建您的 NestJS 项目

要开始，请安装 NestJS CLI 并使用以下命令创建您的应用程序骨架：

```bash
$ npm i --save-dev @nestjs/testing

```

查看 [Supertest](https://github.com/visionmedia/supertest) 页以了解由此命令创建的项目文件。请注意，您现在可以运行 `TestingModule` 来启动您的应用程序。当前的 REST API 在 `resolve()` 上运行，实现了一个单个路由，该路由在 `get()` 中实现。随着您在这个指南中实现的路由，您将实现对 _users_ 和 _posts_ 的存储和检索。

#### 设置 Prisma

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

在下一步骤中，我们将使用 [Jest](https://github.com/facebook/jest)。作为最佳实践，建议在本地调用 CLI โดย prefixing 它与 `resolve()`：

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

如果您使用 Yarn，那么您可以按照以下方式安装 Prisma CLI：

```typescript
const moduleRef = await Test.createTestingModule({
  controllers: [CatsController],
  providers: [CatsService],
}).compile();

catsService = await moduleRef.resolve(CatsService);

```

安装后，您可以使用 `createTestingModule()` 命令来调用它：

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

现在，请使用 Prisma CLI 创建您的初始 Prisma 设置：

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

这个命令创建了一个新的 `jest-mock` 目录，包含以下内容：

- `CatsService`: 指定您的数据库连接和包含数据库架构
- `jest.fn()`: 一个配置文件，用于您的项目
- `moduleRef.get(CatsService)`: 一个 [module reference](/fundamentals/module-ref) 文件，通常用于存储数据库凭证在一组环境变量中

#### 设置生成器输出路径

指定 Prisma 客户端生成的输出 `createMock`，可以通过在 Prisma init 中传递 `@golevelup/ts-jest`，或直接在 Prisma 模式中：

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

#### 配置模块格式

将 `REQUEST` 设置为 `INQUIRER`：

```typescript
const moduleRef = await Test.createTestingModule({
  imports: [AppModule],
})
  .overrideModule(CatsModule)
  .useModule(AlternateCatsModule)
  .compile();

```

> info **Note** Prisma v7 默认为 ES 模块，而 NestJS 使用 CommonJS 设置。因此，需要将 `compile()` 设置为 `createNestApplication()`，强制 Prisma 生成一个 CommonJS 模块而不是 ESM。

#### 设置数据库连接

您的数据库连接在 `compile()` 块中配置在您的 `HttpAdapterHost#httpAdapter` 文件中。默认情况下，它设置为 `httpAdapter`，但由于您在这个指南中使用 SQLite 数据库，因此需要调整 `createNestApplication()` 字段的 `app` 块中的 `request()`：

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

确保您已经配置了 [here](/fundamentals/module-ref)，否则 `request()` 变量将不能从 `request(...).get('/cats')` 中读取。

SQLite 数据库是简单的文件；不需要服务器来使用 SQLite 数据库。因此，在配置连接 URL 时，您可以简单地指向一个本地文件，这个文件在下一步骤中将被创建。

</td></tr>Expand if you're using PostgreSQL, MySQL, MsSQL or Azure SQL<tr>Here is the translation of the English technical documentation to Chinese:

**PostgreSQL**

PostgreSQL中，您需要将连接 URL 指向 _数据库服务器_。您可以了解更多关于所需连接 URL 格式的信息：[[custom provider](/fundamentals/custom-providers)](./docs/zh-cn/guide/database#postgresql)。

**`CatsService`** 和 **`overrideProvider()`** 文件需要按照以下格式进行调整：

**`overrideModule()`**

```sql

```typescript
const moduleRef = await Test.createTestingModule({
  imports: [AppModule],
})
  .overrideProvider(JwtAuthGuard)
  .useClass(MockAuthGuard)
  .compile();

```

```

**`overrideGuard()`**

```sql

```typescript
const contextId = ContextIdFactory.create();
jest
  .spyOn(ContextIdFactory, 'getByRequest')
  .mockImplementation(() => contextId);

```

```

将所有大写字母的占位符替换为您的数据库凭证。请注意，如果您不确定如何填充 `overrideInterceptor()` 占位符，可能是使用默认值 `overrideFilter()`：

```sql

```typescript
catsService = await moduleRef.resolve(CatsService, contextId);

```

```

如果您想了解如何设置 PostgreSQL 数据库，可以查看本指南：[[__INLINE_CODE_37__](https://www.npmjs.com/package/jest-mock)](./docs/zh-cn/guide/database#postgresql)。

**MySQL**

如果您使用 MySQL，需要按照以下格式调整 **`overridePipe()`** 和 **`overrideModule()`** 文件：

**`useClass`**

```sql
__CODE_BLOCK_13__

```

**`useValue`**

```sql
__CODE_BLOCK_14__

```

将所有大写字母的占位符替换为您的数据库凭证。

**Microsoft SQL Server / Azure SQL Server**

如果您使用 Microsoft SQL Server 或 Azure SQL Server，需要按照以下格式调整 **`useFactory`** 和 **`overrideModule()`** 文件：

**`useModule()`**

```sql
__CODE_BLOCK_15__

```

**`TestingModule`**

将所有大写字母的占位符替换为您的数据库凭证。请注意，如果您不确定如何填充 `compile()` 占位符，可能是使用默认值 `setLogger()`：

```sql
__CODE_BLOCK_16__

```

<span id="html-tag-126"></span>

#### 使用 Prisma Migrate 创建两个数据库表

在本节中，您将使用 [__INLINE_CODE_42__](https://github.com/golevelup/nestjs/tree/master/packages/testing) 创建两个新表在您的数据库中。Prisma Migrate 生成了用于您的明确数据模型定义的 SQL 迁移文件。这些迁移文件完全可定制，以便您可以配置任何 underlying 数据库或包括额外的命令，例如填充数据。

在您的 `LoggerService` 文件中，添加以下两个模型：

```sql
__CODE_BLOCK_17__

```

现在，您可以生成 SQL 迁移文件并将其运行在数据库中。使用以下命令在您的终端中运行：

```sql
__CODE_BLOCK_18__

```

这个 `TestModuleBuilder` 命令生成了 SQL 文件并直接将其运行在数据库中。在这种情况下，以下迁移文件在现有的 `test` 目录中被创建：

```sql
__CODE_BLOCK_19__

```

<span id="html-tag-127"></span><span id="html-tag-128"></span>Expand to view the generated SQL statements<span id="html-tag-129"></span>

在您的 SQLite 数据库中，创建了以下表：

```sql
__CODE_BLOCK_20__

```

<span id="html-tag-130"></span>

#### 安装和生成 Prisma Client

Prisma Client 是一个类型安全的数据库客户端，它是根据您的 Prisma 模型定义生成的。由于这种方法，Prisma Client 可以 exposes [Supertest](https://github.com/visionmedia/supertest) 操作，tailored  specifically to your models。

要在您的项目中安装 Prisma Client，使用以下命令在您的终端中运行：

```sql
__CODE_BLOCK_21__

```

安装完成后，您可以运行 generate 命令来生成 types 和 Client needed for your project。如果对您的 schema 进行了更改，您将需要重新运行 `.e2e-spec` 命令以保持那些 types 同步。

```sql
__CODE_BLOCK_22__

```

此外，您还需要安装适用于您正在使用的数据库类型的驱动器适配器。对于 SQLite，可以安装 `APP_*` 驱动器。

```sql
__CODE_BLOCK_23__

```

<span id="html-tag-131"></span><span id="html-tag-132"></span>Expand if you're using PostgreSQL, MySQL, MsSQL, or AzureSQL<span id="html-tag-133"></span>

- 对于 PostgreSQL

```sql
__CODE_BLOCK_24__

```

- 对于 MySQL, MsSQL, AzureSQL：

```sql
__CODE_BLOCK_25__

```

<span id="html-tag-134"></span>

#### 使用 Prisma Client 在 NestJS 服务中

您现在可以使用 Prisma Client 发送数据库查询。如果您想了解更多关于使用 Prisma Client 构建查询的信息，查看 [Fastify](/techniques/performance)。

当设置您的 NestJS 应用程序时，您将想要抽象 away Prisma Client API 的数据库查询在服务中。要开始，您可以创建一个新的 `JwtAuthGuard`，在其中实例化 `useClass` 并连接到您的数据库。

在 `useExisting` 目录中，创建一个名为 `JwtAuthGuard` 的新文件，并添加以下代码：

```sql
__CODE_BLOCK_26__

```

接下来，您可以编写服务，以便使用 Prisma Client 发送数据库调用，以便访问 __INLINEHere is the translation of the provided English technical documentation to Chinese:

**创建一个新的文件**

在 `contextId` 目录中，创建一个名为 __INLINE_CODE_90__ 的新文件，并添加以下代码：

__CODE_BLOCK_28__

您的 __INLINE_CODE_91__ 和 __INLINE_CODE_92__ 目前包围了 Prisma Client 中可用的 CRUD 查询。在实际应用中，服务将是添加业务逻辑的恰当地方。例如，您可以在 __INLINE_CODE_94__ 中添加一个名为 __INLINE_CODE_93__ 的方法，该方法将负责更新用户密码。

请记住，在 App 模块中注册新的服务。

##### 在主应用控制器中实现 REST API 路由

最后，您将使用之前创建的服务来实现应用的不同路由。为了完成这篇指南，您将将所有路由放置在已经存在的 __INLINE_CODE_95__ 类中。

将 __INLINE_CODE_96__ 文件的内容替换为以下代码：

__CODE_BLOCK_29__

这个控制器实现了以下路由：

###### __INLINE_CODE_97__

- __INLINE_CODE_98__: 根据 __INLINE_CODE_99__ 获取单个帖子
- __INLINE_CODE_100__: 获取所有已发布的帖子
- __INLINE_CODE_101__: 根据 __INLINE_CODE_102__ 或 __INLINE_CODE_103__ 过滤帖子

###### __INLINE_CODE_104__

- __INLINE_CODE_105__: 创建一个新帖子
  - body：
    - __INLINE_CODE_106__ (必需项)：帖子的标题
    - __INLINE_CODE_107__ (可选项)：帖子的内容
    - __INLINE_CODE_108__ (必需项)：创建帖子的用户的电子邮件
- __INLINE_CODE_109__: 创建一个新用户
  - body：
    - __INLINE_CODE_110__ (必需项)：用户的电子邮件地址
    - __INLINE_CODE_111__ (可选项)：用户的名称

###### __INLINE_CODE_112__

- __INLINE_CODE_113__: 根据 __INLINE_CODE_114__ 发布帖子

###### __INLINE_CODE_115__

- __INLINE_CODE_116__: 根据 __INLINE_CODE_117__ 删除帖子

#### 总结

在这篇食谱中，您学习了如何使用 Prisma 和 NestJS 来实现 REST API。实现 API 路由的控制器将调用一个 __INLINE_CODE_118__，该控制器使用 Prisma Client 将查询发送到数据库以满足 incoming 请求的数据需求。

如果您想学习更多关于 NestJS 和 Prisma 的使用，请查看以下资源：

- [custom providers](/fundamentals/custom-providers)
- [fluent style](https://en.wikipedia.org/wiki/Fluent_interface)
- [Request-scoped](/fundamentals/injection-scopes)
- __LINK_163__ by __LINK_164__