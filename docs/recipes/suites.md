### 套件（原 Automock）

套件是一个具有明确设计理念且灵活多变的测试元框架，旨在提升后端系统的软件测试体验。通过将多种测试工具整合到统一框架中，套件简化了可靠测试的创建过程，助力开发高质量软件。

> info **注意**`套件`是第三方包，不由 NestJS 核心团队维护。请将库的任何问题反馈至[相应代码库](https://github.com/suites-dev/suites) 。

#### 介绍

控制反转（IoC）是 NestJS 框架的核心原则，它支持模块化、可测试的架构。虽然 NestJS 提供了创建测试模块的内置工具，但 Suites 提供了一种替代方案，专注于测试独立单元或小型单元组。Suites 使用虚拟容器管理依赖项，自动生成模拟对象，无需在 IoC（或 DI）容器中手动替换每个提供者。这种方法可以替代或与 NestJS 的 `Test.createTestingModule` 方法结合使用，根据需求为单元测试提供更大灵活性。

#### 安装

要在 NestJS 中使用 Suites，需安装以下依赖包：

```bash
$ npm i -D @suites/unit @suites/di.nestjs @suites/doubles.jest
```

> info **提示**`Suites` 同时支持 Vitest 和 Sinon 作为测试替身，分别对应 `@suites/doubles.vitest` 和 `@suites/doubles.sinon` 包。

#### 示例及模块配置

考虑一个为 `CatsService` 设置的模块，它包含 `CatsApiService`、`CatsDAL`、`HttpClient` 和 `Logger`。这将作为本示例的基础：

```typescript title="cats.module"
import { HttpModule } from '@nestjs/axios';
import { PrismaModule } from '../prisma.module';

@Module({
  imports: [HttpModule.register({ baseUrl: 'https://api.cats.com/' }), PrismaModule],
  providers: [CatsService, CatsApiService, CatsDAL, Logger],
  exports: [CatsService],
})
export class CatsModule {}
```

`HttpModule` 和 `PrismaModule` 都在向宿主模块导出提供者。

让我们首先单独测试 `CatsHttpService`。该服务负责从 API 获取猫的数据并记录操作。

```typescript title="cats-http.service"
@Injectable()
export class CatsHttpService {
  constructor(private httpClient: HttpClient, private logger: Logger) {}

  async fetchCats(): Promise<Cat[]> {
    this.logger.log('Fetching cats from the API');
    const response = await this.httpClient.get('/cats');
    return response.data;
  }
}
```

我们希望隔离 `CatsHttpService` 并模拟其依赖项 `HttpClient` 和 `Logger`。Suites 允许我们通过使用 `TestBed` 中的 `.solitary()` 方法轻松实现这一点。

```typescript title="cats-http.service.spec"
import { TestBed, Mocked } from '@suites/unit';

describe('Cats Http Service Unit Test', () => {
  let catsHttpService: CatsHttpService;
  let httpClient: Mocked<HttpClient>;
  let logger: Mocked<Logger>;

  beforeAll(async () => {
    // Isolate CatsHttpService and mock HttpClient and Logger
    const { unit, unitRef } = await TestBed.solitary(CatsHttpService).compile();

    catsHttpService = unit;
    httpClient = unitRef.get(HttpClient);
    logger = unitRef.get(Logger);
  });

  it('should fetch cats from the API and log the operation', async () => {
    const catsFixtures: Cat[] = [{ id: 1, name: 'Catty' }, { id: 2, name: 'Mitzy' }];
    httpClient.get.mockResolvedValue({ data: catsFixtures });

    const cats = await catsHttpService.fetchCats();

    expect(logger.log).toHaveBeenCalledWith('Fetching cats from the API');
    expect(httpClient.get).toHaveBeenCalledWith('/cats');
    expect(cats).toEqual<Cat[]>(catsFixtures);
  });
});
```

在上述示例中，Suites 自动使用 `TestBed.solitary()` 为 `CatsHttpService` 的依赖项生成模拟对象。这使得配置更加简便，因为您无需手动模拟每个依赖项。

- 依赖项自动模拟：Suites 会为被测单元的所有依赖项自动生成模拟对象。
- 模拟对象的初始行为：这些模拟对象最初没有任何预定义行为，您需要根据测试需求为其指定具体行为。
- `unit` 和 `unitRef` 属性：
  - `unit` 指代被测试类的实际实例，包含其模拟依赖项。
  - `unitRef` 是一个引用，允许您访问模拟的依赖项。

#### 使用 `TestingModule` 测试 `CatsApiService`

对于 `CatsApiService`，我们需要确保 `HttpModule` 在宿主模块 `CatsModule` 中被正确导入和配置。这包括验证 `Axios` 的基础 URL（及其他配置）是否设置正确。

在此情况下，我们将不使用 Suites，而是使用 Nest 的 `TestingModule` 来测试 `HttpModule` 的实际配置。我们将利用 `nock` 来模拟 HTTP 请求，而无需在此场景中模拟 `HttpClient`。

```typescript title="cats-api.service"
import { HttpClient } from '@nestjs/axios';

@Injectable()
export class CatsApiService {
  constructor(private httpClient: HttpClient) {}

  async getCatById(id: number): Promise<Cat> {
    const response = await this.httpClient.get(`/cats/${id}`);
    return response.data;
  }
}
```

我们需要使用真实的、未经模拟的 `HttpClient` 来测试 `CatsApiService`，以确保 `Axios`（http）的依赖注入和配置正确。这涉及导入 `CatsModule` 并使用 `nock` 进行 HTTP 请求模拟。

```typescript title="cats-api.service.integration.test"
import { Test } from '@nestjs/testing';
import * as nock from 'nock';

describe('Cats Api Service Integration Test', () => {
  let catsApiService: CatsApiService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [CatsModule],
    }).compile();

    catsApiService = moduleRef.get(CatsApiService);
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it('should fetch cat by id using real HttpClient', async () => {
    const catFixture: Cat = { id: 1, name: 'Catty' };

    nock('https://api.cats.com') // Making this URL identical to the one in HttpModule registration
      .get('/cats/1')
      .reply(200, catFixture);

    const cat = await catsApiService.getCatById(1);
    expect(cat).toEqual<Cat>(catFixture);
  });
});
```

#### 社交测试示例

接下来，让我们测试依赖于 `CatsApiService` 和 `CatsDAL` 的 `CatsService`。我们将模拟 `CatsApiService` 并暴露 `CatsDAL`。

```typescript title="cats.dal"
import { PrismaClient } from '@prisma/client';

@Injectable()
export class CatsDAL {
  constructor(private prisma: PrismaClient) {}

  async saveCat(cat: Cat): Promise<Cat> {
    return this.prisma.cat.create({data: cat});
  }
}
```

接下来是 `CatsService`，它依赖于 `CatsApiService` 和 `CatsDAL`：

```typescript title="cats.service"
@Injectable()
export class CatsService {
  constructor(
    private catsApiService: CatsApiService,
    private catsDAL: CatsDAL
  ) {}

  async getAndSaveCat(id: number): Promise<Cat> {
    const cat = await this.catsApiService.getCatById(id);
    return this.catsDAL.saveCat(cat);
  }
}
```

现在，让我们使用 Suites 的可社交测试来测试 `CatsService`：

```typescript title="cats.service.spec"
import { TestBed, Mocked } from '@suites/unit';
import { PrismaClient } from '@prisma/client';

describe('Cats Service Sociable Unit Test', () => {
  let catsService: CatsService;
  let prisma: Mocked<PrismaClient>;
  let catsApiService: Mocked<CatsApiService>;

  beforeAll(async () => {
    // Sociable test setup, exposing CatsDAL and mocking CatsApiService
    const { unit, unitRef } = await TestBed.sociable(CatsService)
      .expose(CatsDAL)
      .mock(CatsApiService)
      .final({ getCatById: async () => ({ id: 1, name: 'Catty' })})
      .compile();

    catsService = unit;
    prisma = unitRef.get(PrismaClient);
  });

  it('should get cat by id and save it', async () => {
    const catFixture: Cat = { id: 1, name: 'Catty' };
    prisma.cat.create.mockResolvedValue(catFixture);

    const savedCat = await catsService.getAndSaveCat(1);

    expect(prisma.cat.create).toHaveBeenCalledWith({ data: catFixture });
    expect(savedCat).toEqual(catFixture);
  });
});
```

在这个例子中，我们使用 `.sociable()` 方法来设置测试环境。通过 `.expose()` 方法允许与 `CatsDAL` 进行真实交互，同时使用 `.mock()` 方法模拟 `CatsApiService`。`.final()` 方法为 `CatsApiService` 建立固定行为，确保测试结果的一致性。

这种方法强调通过 `CatsDAL` 的真实交互来测试 `CatsService`，其中涉及处理 `Prisma`。Suites 将直接使用 `CatsDAL`，仅模拟其依赖项（如本例中的 `Prisma`）。

需要注意的是，这种方法**仅用于验证行为** ，与加载整个测试模块不同。社交测试对于确认单元在隔离其直接依赖项时的行为特别有价值，尤其是当你需要专注于单元的行为和交互时。

#### 集成测试与数据库

对于 `CatsDAL`，可以针对真实数据库（如 SQLite 或 PostgreSQL）进行测试（例如使用 Docker Compose）。但在本例中，我们将模拟 `Prisma` 并专注于社交测试。之所以模拟 `Prisma` 是为了避免 I/O 操作，从而专注于隔离状态下 `CatsService` 的行为。当然，你也可以使用真实的 I/O 操作和活动数据库进行测试。

#### 社交单元测试、集成测试与模拟

- 社交型单元测试：这类测试专注于验证单元间的交互行为，同时模拟其深层依赖项。在本示例中，我们模拟了 `Prisma` 并暴露 `CatsDAL`。
- 集成测试：这类测试涉及真实的 I/O 操作和完整配置的依赖注入(DI)环境。使用 `HttpModule` 和 `nock` 来测试 `CatsApiService` 被视为集成测试，因为它验证了 `HttpClient` 的实际配置和交互。在此场景中，我们将使用 Nest 的 `TestingModule` 来加载真实的模块配置。

**使用模拟对象时需谨慎。** 务必测试 I/O 操作和依赖注入配置（特别是涉及 HTTP 或数据库交互时）。通过集成测试验证这些组件后，您可以放心地使用模拟对象进行社交单元测试，专注于行为和交互验证。社交测试套件旨在隔离直接依赖项的情况下验证单元行为，而集成测试则确保整个系统配置和 I/O 操作正常运行。

#### 测试 IoC 容器注册

验证 DI 容器是否正确配置至关重要，这能避免运行时错误。需要确保所有提供者、服务和模块都正确注册并注入。测试 DI 容器配置有助于及早发现配置错误，防止问题在运行时才暴露。

为确认 IoC 容器配置正确，我们将创建一个集成测试来加载实际模块配置，并验证所有提供者是否已正确注册和注入。

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { CatsModule } from './cats.module';
import { CatsService } from './cats.service';

describe('Cats Module Integration Test', () => {
  let moduleRef: TestingModule;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [CatsModule],
    }).compile();
  });

  it('should resolve exported providers from the ioc container', () => {
    const catsService = moduleRef.get(CatsService);
    expect(catsService).toBeDefined();
  });
});
```

#### 单元测试、社交测试、集成测试与端到端测试对比

#### 独立单元测试

- **关注点** ：完全隔离测试单个单元（类）。
- **使用场景** ：测试 `CatsHttpService`。
- **工具** ：Suites 的 `TestBed.solitary()` 方法。
- **示例** ：模拟 `HttpClient` 并测试 `CatsHttpService`。

#### 社交型单元测试

- **关注点** ：在模拟深层依赖的同时验证单元间的交互。
- **使用场景** ：使用模拟的 `CatsApiService` 测试 `CatsService`，并暴露 `CatsDAL`。
- **工具** ：Suites 的 `TestBed.sociable()` 方法。
- **示例** ：模拟 `Prisma` 并测试 `CatsService`。

#### 集成测试

- **关注点** ：涉及真实的 I/O 操作和完全配置的模块（IoC 容器）。
- **使用场景** ：使用 `HttpModule` 和 `nock` 测试 `CatsApiService`。
- **工具** ：Nest 的 `TestingModule`。
- **示例** ：测试 `HttpClient` 的实际配置和交互。

#### 端到端测试

- **关注点** ：在更聚合的层面上覆盖类和模块的交互。
- **使用场景** ：从终端用户角度测试系统的完整行为。
- **工具** ：Nest 的 `TestingModule`、`supertest`。
- **示例** ：使用 `supertest` 测试 `CatsModule` 来模拟 HTTP 请求。

详情请参阅 [NestJS 官方测试指南](../fundamentals/unit-testing#end-to-end-testing)了解如何设置和运行端到端测试。
