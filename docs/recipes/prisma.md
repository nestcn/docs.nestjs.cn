<!-- 此文件从 content/recipes/prisma.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T04:38:54.515Z -->
<!-- 源文件: content/recipes/prisma.md -->

### Prisma

__LINK_135__ 是一个 __LINK_136__ 的 Node.js 和 TypeScript ORM。它可以用作写 SQL 语句的替代品，也可以用作 SQL 查询生成器（如 __LINK_137__）或 ORM（如 __LINK_138__ 和 __LINK_139__）的替代品。当前，Prisma 支持 PostgreSQL、MySQL、SQL Server、SQLite、MongoDB 和 CockroachDB (__LINK_140__).

虽然 Prisma 可以与纯 JavaScript 一起使用，但它更喜欢 TypeScript，并提供了一个类型安全性水平，超出了 TypeScript 生态系统中的其他 ORM。您可以在 __LINK_141__ 中找到 Prisma 和 TypeORM 的类型安全性比较。

> info **注意** 如果您想快速了解 Prisma 的工作原理，可以查看 __LINK_142__ 或阅读 __LINK_143__ 在 __LINK_144__ 中。同时，在 __LINK_147__ 仓库中也有准备好的示例代码。

#### Getting started

在本教程中，您将学习如何使用 NestJS 和 Prisma 从头开始构建一个示例应用程序。您将创建一个 REST API，可以读取和写入数据库中的数据。

为了这个指南，您将使用 __LINK_148__ 数据库来保存设置数据库服务器的开销。请注意，您仍然可以按照这个指南，使用 PostgreSQL 或 MySQL - 您将在适当的位置获得这些数据库的额外指南。

> info **注意** 如果您已经有一个现有的项目，想迁移到 Prisma，可以遵循 __LINK_149__ 的指南。如果您从 TypeORM 迁移到 Prisma，可以阅读 [Jest](https://github.com/facebook/jest)。

#### 创建 NestJS 项目

要开始，您需要安装 NestJS CLI，并使用以下命令创建应用程序骨架：

```bash
$ npm i --save-dev @nestjs/testing

```

请查看 [Supertest](https://github.com/visionmedia/supertest) 页面以了解这个命令创建的项目文件。请注意，您现在可以使用 `TestingModule` 来启动应用程序。当前的 REST API 在 `resolve()` 上运行，实现了一个单独的路由，该路由在 `get()` 中实现。随着这个指南的进行，您将实现更多的路由，以存储和检索关于 _users_ 和 _posts_ 的数据。

#### 设置 Prisma

首先，安装 Prisma CLI 作为项目的开发依赖项：

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

在以下步骤中，我们将使用 [Jest](https://github.com/facebook/jest)。作为最佳实践，建议在本地 invoke CLI，通过在前缀 `resolve()`:

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

如果您使用 Yarn，可以安装 Prisma CLI 的方式：

```typescript
const moduleRef = await Test.createTestingModule({
  controllers: [CatsController],
  providers: [CatsService],
}).compile();

catsService = await moduleRef.resolve(CatsService);

```

安装完成后，您可以使用 `createTestingModule()` 来 invoke CLI：

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

现在，使用 Prisma CLI 的 `useMocker()` 命令来创建初始 Prisma 设置：

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

- `CatsService`: 指定数据库连接和包含数据库 schema 的文件
- `jest.fn()`: 一个配置文件，用于项目
- `moduleRef.get(CatsService)`: 一个 [module reference](/fundamentals/module-ref) 文件，通常用于存储数据库凭证在环境变量组中

#### 设置生成器输出路径

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

> info **注意** `.overrideProvider` 配置是必要的，因为 Prisma v7 默认作为 ES 模块，这不适用于 NestJS 的 CommonJS 设置。将 `compile()` 设置为 `createNestApplication()` 强制 Prisma 生成一个 CommonJS 模块，而不是 ESM。

#### 设置数据库连接

您的数据库连接在 `compile()` 块中，您的 `HttpAdapterHost#httpAdapter` 文件中。默认情况下，它设置为 `httpAdapter`，但由于您在这个指南中使用 SQLite 数据库，所以需要将 `createNestApplication()` 字段设置为 `request()`：

```typescript
providers: [
  {
    provide: APP_GUARD,
    useClass: JwtAuthGuard,
  },
],

```

现在，打开 `request()` 并将 `request(app.getHttpServer())` 环境变量设置为以下内容：

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

确保您已经配置了 [here](/fundamentals/module-ref)，否则 `request()` 变量将不会从 `request(...).get('/cats')` 中获取。

SQLite 数据库是简单的文件；不需要服务器来使用 SQLite 数据库。因此，可以将连接 URL 指向一个本地文件，该文件在这个步骤中将被创建。该文件将被称为 `get '/cats'`。Here is the translation of the English technical documentation to Chinese:

**PostgreSQL**

如果您使用 PostgreSQL，需要调整 `CatsService` 和 `overrideProvider()` 文件，以以下方式：

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

将所有大写字母的占位符替换为您的数据库凭证。请注意，如果您不知道如何提供 `overrideInterceptor()` 占位符的值，它可能是默认值 `overrideFilter()`：

```typescript
catsService = await moduleRef.resolve(CatsService, contextId);

```

如果您想了解如何设置 PostgreSQL 数据库，可以查看 [__INLINE_CODE_37__](https://www.npmjs.com/package/jest-mock) 指南。

**MySQL**

如果您使用 MySQL，需要调整 `overridePipe()` 和 `overrideModule()` 文件，以以下方式：

**`useClass`**

__CODE_BLOCK_13__

**`useValue`**

__CODE_BLOCK_14__

将所有大写字母的占位符替换为您的数据库凭证。

**Microsoft SQL Server / Azure SQL Server**

如果您使用 Microsoft SQL Server 或 Azure SQL Server，需要调整 `useFactory` 和 `overrideModule()` 文件，以以下方式：

**`useModule()`**

__CODE_BLOCK_15__

**`TestingModule`**

将所有大写字母的占位符替换为您的数据库凭证。请注意，如果您不知道如何提供 `compile()` 占位符的值，它可能是默认值 `setLogger()`：

__CODE_BLOCK_16__

<td>

#### 使用 Prisma Migrate 创建两个数据库表

在本部分中，您将使用 [__INLINE_CODE_42__](https://github.com/golevelup/nestjs/tree/master/packages/testing) 创建两个新表，以便使用 Prisma Migrate 生成 SQL 迁移文件。Prisma Migrate 生成的 SQL 迁移文件是完全可定制的，可以配置任何额外的数据库功能或包含额外的命令，例如 For seeding。

将以下两个模型添加到您的 `LoggerService` 文件：

__CODE_BLOCK_17__

现在，您可以使用 Prisma 模型生成 SQL 迁移文件并将其运行到数据库中。使用以下命令在终端中运行：

__CODE_BLOCK_18__

这将生成 SQL 文件并直接将其运行到数据库中。在本例中，以下迁移文件已在现有的 `test` 目录中创建：

__CODE_BLOCK_19__

<code></code>Expand to view the generated SQL statements</td>

以下两个表在 SQLite 数据库中创建：

__CODE_BLOCK_20__

<td>

#### 安装和生成 Prisma Client

Prisma Client 是一个类型安全的数据库客户端，它是根据您的 Prisma 模型定义生成的。由于这种方法，Prisma Client 可以 expose [Supertest](https://github.com/visionmedia/supertest) 操作，这些操作是根据您的模型进行 tailoring 的。

要在您的项目中安装 Prisma Client，使用以下命令在终端中运行：

__CODE_BLOCK_21__

一旦安装了 Prisma Client，您可以运行 generate 命令生成类型和 Client，用于您的项目。如果您的 schema 发生了变化，您需要重新运行 `.e2e-spec` 命令，以保持这些类型同步。

__CODE_BLOCK_22__

在 addition 到 Prisma Client，您还需要安装数据库驱动适配器。对于 SQLite，可以安装 `APP_*` 驱动程序。

__CODE_BLOCK_23__

<a href="/fundamentals/module-ref"> </a>Expand if you're using PostgreSQL, MySQL, MsSQL, or AzureSQL</td>

- 对于 PostgreSQL

__CODE_BLOCK_24__

- 对于 MySQL, MsSQL, AzureSQL：

__CODE_BLOCK_25__

</tr>

#### 在 NestJS 服务中使用 Prisma Client

现在，您可以使用 Prisma Client 发送数据库查询。如果您想了解更多关于使用 Prisma Client 构建查询的信息，可以查看 [Fastify](/techniques/performance)。

在设置 NestJS 应用程序时，您将想要将 Prisma Client API abstract away 到数据库查询中一个服务中。要开始，可以创建一个新的 `JwtAuthGuard`，该服务负责实例化 `useClass` 并连接到数据库。

在 `useExisting` 目录中，创建一个名为 `JwtAuthGuard` 的文件，然后添加以下代码：

__CODE_BLOCK_26__

然后，您可以编写服务，以便使用 Prisma Client 发送数据库查询，以便访问 `TestingModule` 和 `MockAuthGuard` 模型。

在 `resolve()` 目录中，创建一个名为 `jest.spyOn()` 的文件，然后添加以下代码：

__CODE_BLOCK_27__

注意，您正在使用 Prisma Client 生成的类型，以确保您的服务 expose 的方法是正确类型化的。因此，您可以避免编写模型和创建额外的接口或 DTO 文件。

现在，可以对 `ContextIdFactory` 模型进行同样的操作。Here is the translation of the provided English technical documentation to Chinese:

**创建新的文件**

在 `contextId` 目录中，创建一个名为 __INLINE_CODE_90__ 的新文件，并添加以下代码：

__CODE_BLOCK_28__

你的 __INLINE_CODE_91__ 和 __INLINE_CODE_92__ 目前包围了 Prisma Client 中可用的 CRUD 查询。在实际应用中，服务将是添加业务逻辑的正确位置。例如，你可以在 __INLINE_CODE_94__ 中添加一个名为 __INLINE_CODE_93__ 的方法，该方法将负责更新用户密码。

请在应用模块中注册新的服务。

##### 在主应用控制器中实现 REST API 路由

最后，你将使用之前创建的服务来实现应用的不同路由。为了完成这篇指南，你将将所有路由都添加到现有的 __INLINE_CODE_95__ 类中。

将 __INLINE_CODE_96__ 文件的内容更换为以下代码：

__CODE_BLOCK_29__

这个控制器实现了以下路由：

###### __INLINE_CODE_97__

- __INLINE_CODE_98__: 根据 __INLINE_CODE_99__ 获取单个帖子
- __INLINE_CODE_100__: 获取所有已发表的帖子
- __INLINE_CODE_101__: 根据 __INLINE_CODE_102__ 或 __INLINE_CODE_103__ 筛选帖子

###### __INLINE_CODE_104__

- __INLINE_CODE_105__: 创建新帖子
  - 请求体：
    - __INLINE_CODE_106__ (required)：帖子的标题
    - __INLINE_CODE_107__ (optional)：帖子的内容
    - __INLINE_CODE_108__ (required)：创建帖子的用户的电子邮件
- __INLINE_CODE_109__: 创建新用户
  - 请求体：
    - __INLINE_CODE_110__ (required)：用户的电子邮件地址
    - __INLINE_CODE_111__ (optional)：用户的名称

###### __INLINE_CODE_112__

- __INLINE_CODE_113__: 根据 __INLINE_CODE_114__ 发布帖子

###### __INLINE_CODE_115__

- __INLINE_CODE_116__: 删除根据 __INLINE_CODE_117__ 的帖子

#### 概要

在这篇 recipe 中，你学习了如何使用 Prisma 和 NestJS 来实现 REST API。实现 API 路由的控制器正在调用一个 __INLINE_CODE_118__，该实例使用 Prisma Client 将查询发送到数据库以满足 incoming 请求的数据需求。

如果你想了解更多关于使用 NestJS 和 Prisma 的信息，确保查看以下资源：

- [custom providers](/fundamentals/custom-providers)
- [fluent style](https://en.wikipedia.org/wiki/Fluent_interface)
- [Request-scoped](/fundamentals/injection-scopes)
- __LINK_163__ by __LINK_164__