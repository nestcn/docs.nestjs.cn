<!-- 此文件从 content/recipes/prisma.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:35:29.717Z -->
<!-- 源文件: content/recipes/prisma.md -->

### Prisma

__LINK_135__ 是一个 __LINK_136__ ORM для Node.js 和 TypeScript。它可以用作对 SQL 查询或使用其他数据库访问工具（如 __LINK_137__ 或 __LINK_138__ 等）的一种替代方案。 Prisma 目前支持 PostgreSQL、MySQL、SQL Server、SQLite、MongoDB 和 CockroachDB (__LINK_140__).

虽然 Prisma 可以与 plain JavaScript 一起使用，但它更倾向于 TypeScript，并提供了类型安全性比 TypeScript 生态系统中的其他 ORM 更加强大的保证。您可以在 __LINK_141__ 中找到 Prisma 和 TypeORM 类型安全性对比的详细信息。

> info **Note** 如果您想快速了解 Prisma 的工作原理，可以遵循 __LINK_142__ 或阅读 __LINK_143__ 在 __LINK_144__ 中。对于 __LINK_145__ 和 __LINK_146__ 也有准备好的示例在 __LINK_147__ 仓库中。

#### Getting started

在本食谱中，您将学习如何从零开始使用 NestJS 和 Prisma。您将构建一个示例 NestJS 应用程序，它具有读取和写入数据的 REST API。

为了使本指南更加简洁，您将使用 __LINK_148__ 数据库来保存设置数据库服务器的开销。请注意，您仍然可以遵循本指南，即使您使用 PostgreSQL 或 MySQL – 在适当的地方，您将获得使用这些数据库的额外指南。

> info **Note** 如果您已经有了现有的项目并考虑迁移到 Prisma，可以遵循 __LINK_149__ 指南。如果您正在迁移到 TypeORM，可以阅读 [Jest](https://github.com/facebook/jest) 指南。

#### 创建 NestJS 项目

要开始，请安装 NestJS CLI 并使用以下命令创建您的应用程序骨架：

```bash
$ npm i --save-dev @nestjs/testing

```

有关项目文件的详细信息，请查看 [Supertest](https://github.com/visionmedia/supertest) 页面。请注意，您现在可以运行 `TestingModule` 来启动您的应用程序。当前的 REST API 在 `resolve()` 上运行，实现了一个名为 `get()` 的单个路由。随着本指南的进行，您将实现更多的路由来存储和检索关于 _users_ 和 _posts_ 的数据。

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

在以下步骤中，我们将使用 [Jest](https://github.com/facebook/jest)。作为最佳实践，请在本地 invoke CLI โดย prefixing 它与 `resolve()`：

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

如果您使用 Yarn，可以安装 Prisma CLI 按照以下方式：

```typescript
const moduleRef = await Test.createTestingModule({
  controllers: [CatsController],
  providers: [CatsService],
}).compile();

catsService = await moduleRef.resolve(CatsService);

```

安装完成后，您可以使用 `createTestingModule()` prefixing 它：

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

现在，请使用 Prisma CLI 创建您的初步设置：

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

这个命令创建了一个名为 `jest-mock` 的目录，它包含以下内容：

- `CatsService`: 指定您的数据库连接和包含数据库架构的文件
- `jest.fn()`: 一个配置文件用于您的项目
- `moduleRef.get(CatsService)`: 一个 [module reference](/fundamentals/module-ref) 文件，用于存储数据库凭证在环境变量组中

#### 设置生成器输出路径

指定生成 Prisma 客户端的输出 `createMock`， either by passing `@golevelup/ts-jest` during prisma init，或直接在 Prisma schema 中：

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

> info **Note** `.overrideProvider` 配置是必需的，因为 Prisma v7 默认为 ES 模块，而 NestJS 使用 CommonJS 设置。将 `compile()` 设置为 `createNestApplication()` 强制 Prisma 生成 CommonJS 模块，而不是 ESM。

#### 设置数据库连接

您的数据库连接在 `compile()` 块中，您的 `HttpAdapterHost#httpAdapter` 文件中。默认情况下，它设置为 `httpAdapter`，但由于您使用的是 SQLite 数据库，因此需要调整 `createNestApplication()` 字段的 `app` 块来设置为 `request()`：

```typescript
providers: [
  {
    provide: APP_GUARD,
    useClass: JwtAuthGuard,
  },
],

```

现在，请打开 `request()` 并调整 `request(app.getHttpServer())` 环境变量，以使其如下所示：

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

确保您已配置 [here](/fundamentals/module-ref)，否则 `request()` 变量将无法从 `request(...).get('/cats')` 中获取。

SQLite 数据库是简单的文件；不需要服务器来使用 SQLite 数据库。因此，您可以将连接 URL 设置为 `get '/cats'`，而不是 _host_ 和 _port_。这个文件将在下一步中创建。

</td></tr>Expand if you're using PostgreSQL, MySQL, MsSQL or Azure SQL<tr>Here is the translation of the English technical documentation to Chinese:

**PostgreSQL**

使用 PostgreSQL 时，您需要调整 `CatsService` 和 `overrideProvider()` 文件，以以下方式：

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

将大写字母的占位符替换为您的数据库凭证。请注意，如果您不确定 `overrideInterceptor()` 占位符的值，它可能是默认值 `overrideFilter()`：

```typescript
catsService = await moduleRef.resolve(CatsService, contextId);

```

如果您想了解如何设置 PostgreSQL 数据库，可以遵循 [__INLINE_CODE_37__](https://www.npmjs.com/package/jest-mock)。

**MySQL**

使用 MySQL 时，您需要调整 `overridePipe()` 和 `overrideModule()` 文件，以以下方式：

**`useClass`**

__CODE_BLOCK_13__

**`useValue`**

__CODE_BLOCK_14__

将大写字母的占位符替换为您的数据库凭证。

**Microsoft SQL Server / Azure SQL Server**

使用 Microsoft SQL Server 或 Azure SQL Server 时，您需要调整 `useFactory` 和 `overrideModule()` 文件，以以下方式：

**`useModule()`**

__CODE_BLOCK_15__

**`TestingModule`**

将大写字母的占位符替换为您的数据库凭证。请注意，如果您不确定 `compile()` 占位符的值，它可能是默认值 `setLogger()`：

__CODE_BLOCK_16__

<td>

#### 使用 Prisma Migrate 创建两个数据库表

在本节中，您将使用 [__INLINE_CODE_42__](https://github.com/golevelup/nestjs/tree/master/packages/testing) 创建两个新的表在您的数据库中。Prisma Migrate 生成 SQL 迁移文件，以便您的声明式数据模型定义在 Prisma schema 中。这些迁移文件是完全可自定义的，以便您可以配置任何附加特性或包含额外命令，例如填充数据。

将以下两个模型添加到您的 `LoggerService` 文件：

__CODE_BLOCK_17__

使用您的 Prisma 模型，您可以生成 SQL 迁移文件并对数据库运行它们。使用以下命令在您的终端中运行：

__CODE_BLOCK_18__

该 `TestModuleBuilder` 命令生成 SQL 文件并直接对数据库运行。例如，在本例中，以下迁移文件已在现有的 `test` 目录中创建：

__CODE_BLOCK_19__

<code></code>Expand to view the generated SQL statements</td>

以下表已在您的 SQLite 数据库中创建：

__CODE_BLOCK_20__

<td>

#### 安装和生成 Prisma Client

Prisma Client 是一个类型安全的数据库客户端，它是从您的 Prisma 模型定义生成的。由于这种方法，Prisma Client 可以 exposure [Supertest](https://github.com/visionmedia/supertest) 操作，它们是特定于模型的。

要在您的项目中安装 Prisma Client，使用以下命令在您的终端中运行：

__CODE_BLOCK_21__

安装后，您可以运行 generate 命令来生成类型和客户端所需的所有内容。如果您的 schema 发生更改，您将需要重新运行 `.e2e-spec` 命令以保持这些类型同步。

__CODE_BLOCK_22__

此外，您还需要安装数据库适配器。对于 SQLite，可以安装 `APP_*` 适配器。

__CODE_BLOCK_23__

<a href="/fundamentals/module-ref"> </a>Expand if you're using PostgreSQL, MySQL, MsSQL, or AzureSQL</td>

- 对于 PostgreSQL

__CODE_BLOCK_24__

- 对于 MySQL, MsSQL, AzureSQL：

__CODE_BLOCK_25__

</tr>

#### 在 NestJS 服务中使用 Prisma Client

现在，您可以使用 Prisma Client 发送数据库查询。如果您想了解更多关于使用 Prisma Client 构建查询的信息，可以查看 [Fastify](/techniques/performance)。

在设置 NestJS 应用程序时，您将希望抽象 away Prisma Client API，以便在数据库查询中使用服务。要开始，您可以创建一个新的 `JwtAuthGuard`，该服务负责实例化 `useClass` 并连接到数据库。

在 `useExisting` 目录中，创建一个名为 `JwtAuthGuard` 的新文件，并添加以下代码：

__CODE_BLOCK_26__

然后，您可以编写服务，以便使用 Prisma Client 对 `TestingModule` 和 `MockAuthGuard` 模型中的数据库调用。

仍然在 `resolve()` 目录中，创建一个名为 `jest.spyOn()` 的新文件，并添加以下代码：

__CODE_BLOCK_27__

请注意，您使用 Prisma Client 生成的类型来确保您的服务 exposes 的方法是正确类型的。因此，您省去了类型模型和创建额外接口或 DTO 文件的麻烦。

现在，同样对 `ContextIdFactory` 模型进行操作。Here is the translated text:

在 __INLINE_CODE_90__ 文件夹内部，创建一个名为 __INLINE_CODE_90__ 的新文件，并添加以下代码到其中：

__CODE_BLOCK_28__

您的 __INLINE_CODE_91__ 和 __INLINE_CODE_92__ 当前包围了 Prisma 客户端提供的 CRUD 查询。在实际应用中，服务也将是添加业务逻辑的地方。例如，您可以在 __INLINE_CODE_94__ 内添加一个名为 __INLINE_CODE_93__ 的方法，该方法将负责更新用户密码。

请记住，在应用模块中注册新的服务。

##### 在主应用控制器中实现 REST API 路由

最后，您将使用之前创建的服务来实现应用的不同路由。为了这个指南的目的，您将将所有路由放入已经存在的 __INLINE_CODE_95__ 类中。

将 __INLINE_CODE_96__ 文件的内容替换为以下代码：

__CODE_BLOCK_29__

这个控制器实现了以下路由：

###### __INLINE_CODE_97__

- __INLINE_CODE_98__: 根据 __INLINE_CODE_99__ 的 ID 获取单个帖子
- __INLINE_CODE_100__: 获取所有已发布的帖子
- __INLINE_CODE_101__: 根据 __INLINE_CODE_102__ 或 __INLINE_CODE_103__ 过滤帖子

###### __INLINE_CODE_104__

- __INLINE_CODE_105__: 创建新帖子
  - Body：
    - __INLINE_CODE_106__（必需）：帖子的标题
    - __INLINE_CODE_107__（可选）：帖子的内容
    - __INLINE_CODE_108__（必需）：创建帖子的用户的电子邮件
- __INLINE_CODE_109__: 创建新用户
  - Body：
    - __INLINE_CODE_110__（必需）：用户的电子邮件地址
    - __INLINE_CODE_111__（可选）：用户的名称

###### __INLINE_CODE_112__

- __INLINE_CODE_113__: 根据 __INLINE_CODE_114__ 发布帖子

###### __INLINE_CODE_115__

- __INLINE_CODE_116__: 删除根据 __INLINE_CODE_117__ 的 ID 删除帖子

#### 概要

在这个食谱中，您学习了如何使用 Prisma 和 NestJS 实现 REST API。实现 API 路由的控制器正在调用一个 __INLINE_CODE_118__，该控制器使用 Prisma 客户端将查询发送到数据库以满足 incoming 请求的数据需求。

如果您想了解更多关于使用 NestJS 和 Prisma 的信息，请查看以下资源：

- [custom providers](/fundamentals/custom-providers)
- [fluent style](https://en.wikipedia.org/wiki/Fluent_interface)
- [Request-scoped](/fundamentals/injection-scopes)
- __LINK_163__ by __LINK_164__