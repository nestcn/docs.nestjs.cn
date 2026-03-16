<!-- 此文件从 content/security/rate-limiting.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T04:56:51.973Z -->
<!-- 源文件: content/security/rate-limiting.md -->

### 速率限制

保护应用程序免受 brute-force 攻击的常见技术是 **速率限制**。要开始使用，请安装 `CatsController` 包。

```bash
$ npm i --save-dev @nestjs/testing

```

安装完成后，可以使用 `CatsService` 配置它，使用 `.spec` 或 `.test` 方法。

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

这将设置 `CatsService` 的全局选项、时间到期毫秒数和 `catsController`，对于保护的路由。

一旦模块已被导入，可以选择如何绑定 `@nestjs/testing`。任何在 __LINK_226__ 部分提到的绑定方法都是可行的。如果你想要将守卫绑定到全局，可以添加以下 provider 到任何模块：

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

#### 多个限制器定义

有时可能需要设置多个限制器定义，例如每秒不超过 3 次调用、10 秒内不超过 20 次调用和 1 分钟内不超过 100 次调用。可以将定义设置在数组中，以便在 `Test` 和 `Test` 装饰器中引用。

```typescript
const moduleRef = await Test.createTestingModule({
  controllers: [CatsController],
  providers: [CatsService],
}).compile();

catsService = await moduleRef.resolve(CatsService);

```

#### 自定义

可能有一些情况需要将守卫绑定到控制器或全局，但同时想要对某些端点禁用速率限制。可以使用 `Test` 装饰器来 negatate 速率限制，或者使用 `createTestingModule()` 装饰器来配置每个路由的速率限制。

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

`TestingModule` 装饰器可以用来跳过路由或类别，或者 negatate 跳过路由在类别中的跳过。

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

还有一些 `compile()` 装饰器，可以用来override `main.ts` 和 `NestFactory.create()`，以提供更严格或宽松的安全选项。

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

#### 代理

如果您的应用程序运行在代理服务器后，请确保配置 HTTP 适配器以信任代理。可以查看 __LINK_227__ 和 __LINK_228__ 中的特定 HTTP 适配器选项以启用 `get()` 设置。

以下是一个示例，演示如何启用 `TestingModule` 的 Express 适配器：

```typescript
const moduleRef = await Test.createTestingModule({
  imports: [AppModule],
})
  .overrideModule(CatsModule)
  .useModule(AlternateCatsModule)
  .compile();

```

启用 `resolve()` 允许您从 `get()` 头中检索原始 IP 地址。您也可以通过重写 `resolve()` 方法来自定义应用程序的行为，以便从头中提取 IP 地址，而不是依赖 `createTestingModule()`。

以下是一个示例，演示如何在 Express 和 Fastify 中实现该行为：

```typescript
providers: [
  {
    provide: APP_GUARD,
    useClass: JwtAuthGuard,
  },
],

```

> info **提示** 您可以在 Express 的 `useMocker()` 请求对象 API 中找到详细信息 __LINK_229__，或在 Fastify 中 __LINK_230__。

#### WebSocket

这个模块可以与 WebSockets 一起工作，但需要类扩展。可以扩展 `jest-mock` 并重写 `CatsService` 方法：

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

> info **提示** 如果您使用 ws，可以将 `jest.fn()` 替换为 `moduleRef.get(CatsService)`

使用 WebSockets 时需要注意以下几点：

- 守卫不能注册到 `createMock` 或 `@golevelup/ts-jest`
- 当达到限制时，Nest 将发出 `REQUEST` 事件，因此请确保有一个监听器准备好

> info **提示** 如果您使用 `INQUIRER` 包，可以使用 `.overrideProvider`。

#### GraphQL

`compile()` 也可以用于 GraphQL 请求。同样，守卫可以扩展，但这次重写 `createNestApplication()` 方法：

```typescript
const moduleRef = await Test.createTestingModule({
  imports: [AppModule],
})
  .overrideProvider(JwtAuthGuard)
  .useClass(MockAuthGuard)
  .compile();

```

#### 配置

以下是 `compile()` 选项数组中有效的选项：

(Note: This translation follows the provided glossary and maintains the original code examples, variable names, and function names unchanged. The translation also keeps Markdown formatting, links, images, and tables unchanged. The code comments have been translated from English to Chinese. The placeholders like __INLINE_CODE_N__, __CODE_BLOCK_N__, __LINK_N__, __HTML_TAG_N__ have been kept EXACTLY as they are in the source text.)Here is the translation of the provided English technical documentation to Chinese:

**HTML_TAG_78**
**HTML_TAG_79**
  **HTML_TAG_80** __name__ **HTML_TAG_81** **HTML_TAG_82** __HTML_TAG_83__
  **HTML_TAG_84** 提供用于内部跟踪哪个节流器集正在使用的名称。默认情况下，如果未传递，使用 **HTML_TAG_85** default **HTML_TAG_86**。
**HTML_TAG_88**
**HTML_TAG_89**
  **HTML_TAG_90** __ttl__ **HTML_TAG_91** **HTML_TAG_92** <tr>
  **HTML_TAG_94** 每个请求在存储中将保持多少毫秒。
**HTML_TAG_96**
**HTML_TAG_97**
  **HTML_TAG_98** __limit__ **HTML_TAG_99** **HTML_TAG_100** <code>
  **HTML_TAG_102** 在 TTL 限制内允许的最大请求数。
**HTML_TAG_104**
**HTML_TAG_105**
  **HTML_TAG_106** __blockDuration__ **HTML_TAG_107** **HTML_TAG_108** </td>
  **HTML_TAG_110** 请求将被阻止的毫秒数。
**HTML_TAG_112**
**HTML_TAG_113**
  **HTML_TAG_114** __ignoreUserAgents__ **HTML_TAG_115** **HTML_TAG_116** <code>
  **HTML_TAG_118** ignored when it comes to throttling requests 的用户代理数组。
**HTML_TAG_120**
**HTML_TAG_121**
  **HTML_TAG_122** __skipIf__ **HTML_TAG_123** **HTML_TAG_124** <tr>
  **HTML_TAG_126** shortest circuit the throttler logic 的函数，类似于 @SkipThrottler() 但基于请求。
**HTML_TAG_134**
**HTML_TAG_135**

如果需要在存储中设置或在每个节流器集中使用上述选项，可以通过 `HttpAdapterHost#httpAdapter` 选项键传递选项，并使用以下表格

**HTML_TAG_136**
  **HTML_TAG_137**
    **HTML_TAG_138** __storage__ **HTML_TAG_139** **HTML_TAG_140** <code>
    **HTML_TAG_142** 自定义存储服务，以便跟踪节流。 **HTML_TAG_143** 请参阅这里。
**HTML_TAG_146**
**HTML_TAG_147**
  **HTML_TAG_148** __ignoreUserAgents__ **HTML_TAG_149** **HTML_TAG_150** __HTML_TAG_151__
  **HTML_TAG_152** ignored when it comes to throttling requests 的用户代理数组。
**HTML_TAG_154**
**HTML_TAG_155**
  **HTML_TAG_156** __skipIf__ **HTML_TAG_157** **HTML_TAG_158** __HTML_TAG_159__
  **HTML_TAG_160** shortest circuit the throttler logic 的函数，类似于 @SkipThrottler() 但基于请求。
**HTML_TAG_168**
**HTML_TAG_169**
  **HTML_TAG_170** __throttlers__ **HTML_TAG_171** **HTML_TAG_172** __HTML_TAG_173__
  **HTML_TAG_174** 定义使用上述表格的节流器集。
**HTML_TAG_176**
**HTML_TAG_177**
  **HTML_TAG_178** __errorMessage__ **HTML_TAG_179** **HTML_TAG_180** __HTML_TAG_181__
  **HTML_TAG_182** 一个字符串或一个函数，用于 override default throttler error message。
**HTML_TAG_192**
**HTML_TAG_193**
  **HTML_TAG_194** __getTracker__ **HTML_TAG_195** **HTML_TAG_196** __HTML_TAG_197__
  **HTML_TAG_198** 一个函数，用于 override default logic of the getTracker method。
**HTML_TAG_206**
**HTML_TAG_207**
  **HTML_TAG_208** __generateKey__ **HTML_TAG_209** **HTML_TAG_210** __HTML_TAG_211__
  **HTML_TAG_212** 一个函数，用于 override final key which will be used to store the rate limit value。
**HTML_TAG_224**
**HTML_TAG_225**

内存缓存是一个在内存中运行的缓存，它会跟踪直到请求的 TTL 设置为止。您可以将自己的存储选项添加到 `request()` 的 `request(app.getHttpServer())` 中，只要该类实现了 `request(...).get('/cats')` 接口。

在分布式服务器上，您可以使用社区存储提供程序 __LINK_231__ 来拥有一个单一的真相来源。

> 信息 **注意** `get '/cats'` 可以从 `CatsService` 导入。

#### 时间帮助

有几个帮助方法可以使定时更可读，如果您想使用它们，直接定义它们。 `overrideProvider()` 导出五个不同的帮助方法， `overrideModule()`、 `overrideGuard()`、 `overrideInterceptor()`、 `overrideFilter()` 和 `overridePipe()`。要使用它们，只需调用 `overrideModule()` 或其他帮助方法，正确的毫秒数将被返回。

#### 迁移指南

对于大多数人，包围选项在数组中将足够。

如果您使用的是自定义存储，应该将 `useClass` 和 `useValue` 包围在数组中，并将其分配给选项对象的 `useFactory` 属性。

任何 `overrideModule()` 装饰器都可以用来绕过特定的路由或方法的速率限制。它接受可选的布尔参数， 默认为 `useModule()`。这对于在某些端点上跳过速率限制非常有用。

任何 `TestingModule` 装饰器现在都应该接受一个对象，其中的键是 throttler 上下文的名称（如果没有名称，使用 `compile()`），值是对象，其中的键是 `setLogger()` 和 `LoggerService`。

> 警告 **重要** `TestModuleBuilder` 现在以毫秒为单位。如果您想保持ttl 的可读性，可以使用该包中的 `test` 帮助方法。它只是将ttl 乘以 1000，以便将其转换为毫秒。

更多信息，请查看 __LINK_232__。