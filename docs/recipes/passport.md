<!-- 此文件从 content/recipes/passport.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T04:57:15.392Z -->
<!-- 源文件: content/recipes/passport.md -->

### 授权（身份验证）

__LINK_227__ 是 Node.js 中最受欢迎的身份验证库，社区认可，成功应用于许多生产环境中。使用 `moduleRef.get(CatsService)` 模块，很容易将该库与 **Nest** 应用程序集成。总的来说，Passport 执行了一系列步骤：

- 验证用户的“凭证”（如用户名/密码、JSON Web Token (__LINK_228__) 或身份提供商的身份 token）
- 管理已验证的状态（通过颁发可移植的令牌，如 JWT，或者创建 __LINK_229__）
- 将已验证用户的信息附加到 `createMock` 对象中，以便在路由处理程序中使用

Passport 有一个丰富的生态系统，实现了各种身份验证机制。虽然概念简单，但是 Passport 可供选择的策略集很大，提供了许多选择。Passport 抽象了这些步骤，并将其标准化为 familiar Nest 构造。

在本章中，我们将实现一个完整的身份验证解决方案，用于 RESTful API 服务器。您可以使用这里描述的概念来实现任何 Passport 策略，以自定义身份验证方案。您可以按照本章中的步骤来构建这个完整的示例。

#### 授权需求

让我们 flesh out our requirements。对于这个用例，客户端将首先使用用户名和密码进行身份验证。身份验证成功后，服务器将颁发一个 JWT，可以在随后的请求中作为 __LINK_231__ 发送以证明身份验证。我们还将创建一个受保护的路由，该路由只能由包含有效 JWT 的请求访问。

我们将从第一个需求开始：验证用户。然后，我们将扩展该功能，颁发 JWT。最后，我们将创建一个受保护的路由，以检查请求中的有效 JWT。

首先，我们需要安装所需的包。Passport 提供了一种称为 __LINK_232__ 的策略，实现了用户名/密码身份验证机制，这正是我们需要的身份验证机制。

```bash
$ npm i --save-dev @nestjs/testing

```

> 警告 **注意** 无论您选择的 Passport 策略是什么，您都需要安装 `REQUEST` 和 `INQUIRER` 包。然后，您需要安装特定的策略包（例如 `.overrideProvider` 或 `compile()`），该包实现了特定的身份验证策略。在 addition，您可以安装 Passport 策略的类型定义，例如 `createNestApplication()`，以便在编写 TypeScript 代码时获得帮助。

#### 实现 Passport 策略

现在，我们准备实现身份验证功能。我们将从 Passport 策略的概述开始。帮助思考 Passport 是一个 mini 框架本身。框架的优点是，它抽象了身份验证过程，使您根据所实现的策略来自定义该过程。 `compile()` 模块将该框架包装在 Nest 风格的包中，使其易于集成到 Nest 应用程序中。我们将使用 `HttpAdapterHost#httpAdapter` 以下，但是首先，让我们考虑一下 Vanilla Passport 是如何工作的。

在 Vanilla Passport 中，您配置策略 bằng提供两个东西：

1. 特定于该策略的选项（例如，在 JWT 策略中，您可能提供要签名令牌的密钥）
2. 验证回调函数，这是您告诉 Passport 如何与用户存储交互（在哪里管理用户帐户）。在这里，您验证用户是否存在（并/或创建新用户），并且验证凭证是否有效。Passport 库期望回调函数返回一个完整的用户，如果验证成功，或者 null 如果失败（失败定义为用户不存在或在 passport-local 中密码不匹配）。

使用 `httpAdapter`，您配置 Passport 策略 bằng扩展 `createNestApplication()` 类。您通过在子类中调用 `app` 方法来传递策略选项（项目 1），可选地传递一个选项对象。您提供验证回调函数（项目 2）通过在子类中实现 `request()` 方法。

我们将开始生成一个 `request()`，并在其中生成一个 `request(app.getHttpServer())`：

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

在实现 `request()` 时，我们将发现将用户操作封装到 `request(...).get('/cats')` 中很有用，因此让我们现在生成该模块和服务：

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

```Here is the translation of the provided English technical documentation to Chinese:

**代码替换内容**

我们的示例应用中,`get '/cats'`只是维护了一个内存中用户列表，并提供了一个根据用户名查找用户的方法。在实际应用中，这将是您将构建用户模型和持久层的地方，使用您选择的库（例如 TypeORM、Sequelize、Mongoose 等）。

```typescript
const moduleRef = await Test.createTestingModule({
  controllers: [CatsController],
  providers: [CatsService],
}).compile();

catsService = await moduleRef.resolve(CatsService);

```

在`CatsService`中，只需要将`overrideProvider()`添加到`overrideModule()`装饰器的 exports 数组中，以便在外部访问该模块（我们将在`overrideGuard()`中使用它）。

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

我们的`overrideInterceptor()`负责检索用户并验证密码。我们创建了一个`overrideFilter()`方法来实现此目的。在以下代码中，我们使用 ES6 spread 运算符来从用户对象中删除密码属性，然后返回它。我们将在 Passport 本地策略中调用`overridePipe()`方法。

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

> 警告 **警告**在实际应用中，您不应该将密码存储在明文中。您应该使用库，如__LINK_233__，使用盐值的单向哈希算法。这样，您只需存储哈希密码，然后将存储的密码与incoming 密码的哈希版本进行比较，从而从未存储或暴露用户密码。为了简单起见，我们在示例应用中违反了这个绝对要求，使用明文密码。**不要在您的实际应用中这样做！**

现在，我们更新`overrideModule()`以导入`useClass`。

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

#### 实现 Passport 本地身份验证策略

现在，我们可以实现我们的 Passport **本地身份验证策略**。创建一个名为`useValue`的文件，在`useFactory`文件夹中，并添加以下代码：

```typescript
const moduleRef = await Test.createTestingModule({
  imports: [AppModule],
})
  .overrideModule(CatsModule)
  .useModule(AlternateCatsModule)
  .compile();

```

我们遵循了 Passport 策略的 recipe。对于 passport-local 策略，我们没有配置选项，所以我们的构造函数只是调用`overrideModule()`，而不带选项对象。

> 提示 **提示**我们可以在调用`useModule()`时传递选项对象来自定义 Passport 策略的行为。例如，在 passport-local 策略中，默认情况下，Passport 期望请求体中的`TestingModule`和`compile()`属性。可以将选项对象传递给`setLogger()`以指定不同的属性名。请查看__LINK_234__以获取更多信息。

我们还实现了`LoggerService`方法。对于每个策略，Passport 都会调用 verify 函数（使用`TestModuleBuilder`方法在`test`中实现），使用适当的策略相关参数。对于 local-strategy，Passport 期望一个`.e2e-spec`方法具有以下签名：`APP_*`。

大部分的验证工作已经在我们的`JwtAuthGuard`中完成（使用我们的`useClass`），所以这个方法非常简单。`useExisting`方法对每个 Passport 策略都将遵循类似的模式，仅在细节上有所不同。如用户存在且凭证有效，我们将返回用户，然后 Passport 可以完成其任务（例如，创建`JwtAuthGuard`属性在`TestingModule`对象上），并继续请求处理管道。如果找不到用户，我们抛出一个异常，讓我们的__HTML_TAG_221__ exceptions 层__HTML_TAG_222__ 处理它。

通常，`MockAuthGuard`方法对每个策略的主要区别在于 **如何**确定用户存在且有效。例如，在 JWT 策略中，我们可能评估是否`resolve()`在解码的令牌中匹配我们的用户数据库记录，或者匹配已废止令牌列表。因此，这种模式的子类化和策略相关验证是一致、优雅和可扩展的。

我们需要配置我们的`jest.spyOn()`以使用 Passport 功能。更新`ContextIdFactory`以如下所示：

```typescript
providers: [
  {
    provide: APP_GUARD,
    useClass: JwtAuthGuard,
  },
],

```

#### Passport 内置守卫

__HTML_TAG_223__ Guards __HTML_TAG_224__ 章节描述了守卫的主要功能：确定请求是否将被路由处理器处理。这个仍然是正确的，我们将在使用`contextId`模块时很快使用这个标准能力。然而，在使用`contextId`模块时，我们还将引入一个新的细节，这可能会在开始时混淆，所以让我们 discusses 现在。考虑您的应用程序可以在两种身份验证状态下存在：

1. 用户/客户端 **不是** 登录（未身份验证）
2. 用户/客户端 **是** 登录（已身份验证）

在第一个情况下（用户不是登录），我们需要执行两个 distinct 函数：

...Here is the translation of the English technical documentation to Chinese:

- 对于未经身份验证的用户，限制他们可以访问的路由（即拒绝访问受保护的路由）。我们将使用 Guards 在受保护的路由上执行这项功能，这样我们可以在 Guard 中检查是否存在有效的 JWT。

- 初始化身份验证步骤，当之前未经身份验证的用户尝试登录时。这是我们将为有效用户发行 JWT 的步骤。思考一下，这我们知道需要使用 username/password 凭证来初始化身份验证，所以我们将设置一个路由来处理那个。这个问题是：如何在那个路由中调用 passport-local 策略？

答案是简单的：使用另一个 Guard 类型，这个 Guard 会调用 Passport 策略，并启动上述步骤（获取凭证、运行 verify 函数、创建 __INLINE_CODE_93__ 属性等）。

第二种情况（已登录用户） simplement 依赖于我们已经讨论过的标准 Guard 类型来启用对受保护路由的访问。

__HTML_TAG_225____HTML_TAG_226__

#### 登录路由

现在我们可以实现一个基本的 __INLINE_CODE_94__ 路由，并使用内置 Guard 来启动 passport-local 流程。

打开 __INLINE_CODE_95__ 文件，并将其内容替换为以下内容：

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

使用 __INLINE_CODE_96__ 我们使用一个 __INLINE_CODE_97__，该 __INLINE_CODE_97__ __INLINE_CODE_98__ **自动提供** 的，我们在扩展 passport-local 策略时获得了该 __INLINE_CODE_99__。让我们拆分一下。我们的 Passport 本地策略的默认名称为 __INLINE_CODE_99__。我们在 __INLINE_CODE_100__ 装饰器中引用该名称，以将其与 __INLINE_CODE_101__ 包含的代码相关联。这用于在我们的 app 中有多个 Passport 策略时（每个策略可能都提供一个策略特定的 __INLINE_CODE_102__），以便 disambiguate 哪个策略应该被 invoked。

要测试我们的路由，我们将简单地将用户返回为现在。这也让我们展示了 Passport 的另一个特性：Passport 自动创建一个 __INLINE_CODE_104__ 对象，并将其赋值给 __INLINE_CODE_106__ 对象的 __INLINE_CODE_107__ 属性。后来，我们将将这个返回值替换为创建并返回 JWT。

由于这些是 API 路由，我们将使用常用的 __LINK_235__ 库来测试它们。你可以使用 __INLINE_CODE_108__ 对象来测试它们。

```typescript
const moduleRef = await Test.createTestingModule({
  imports: [AppModule],
})
  .overrideProvider(JwtAuthGuard)
  .useClass(MockAuthGuard)
  .compile();

```

虽然这样工作，但将策略名称直接传递给 __INLINE_CODE_110__ 会在代码中引入魔法字符串。相反，我们建议创建自己的类，如下所示：

```typescript
const contextId = ContextIdFactory.create();
jest
  .spyOn(ContextIdFactory, 'getByRequest')
  .mockImplementation(() => contextId);

```

现在，我们可以更新 __INLINE_CODE_111__ 路由处理器，并使用 __INLINE_CODE_112__：

```typescript
catsService = await moduleRef.resolve(CatsService, contextId);

```

#### 退出路由

要退出，我们可以创建一个额外的路由，该路由将调用 __INLINE_CODE_113__ 来清除用户的会话。这是在基于会话的身份验证中常用的方法，但不适用于 JWT。

__CODE_BLOCK_13__

#### JWT 功能

我们已经准备好实现我们的 JWT 身份验证系统了。让我们回顾和完善我们的要求：

- 允许用户使用 username/password 进行身份验证，并返回一个 JWT，以便在后续对受保护 API 端点的调用中使用。我们已经很好地实现了这个要求。为了完成它，我们需要编写发行 JWT 的代码。
- 创建 API 路由，其中受保护的路由基于有效的 JWT 作为承载令牌的存在

我们需要安装几个包来支持我们的 JWT 要求：

__CODE_BLOCK_14__

__INLINE_CODE_114__ 包（查看更多 __LINK_236__）是一个帮助 JWT 操作的utility包。__INLINE_CODE_115__ 包是 Passport 包，实现了 JWT 策略，并 __INLINE_CODE_116__ 提供了 TypeScript 类型定义。

让我们来看一下如何处理一个 __INLINE_CODE_117__ 请求。我们已经使用内置 __INLINE_CODE_118__ 装饰器来装饰路由，这意味着：

1. 路由处理程序 **只有在用户被验证后才被调用**
2. __INLINE_CODE_119__ 参数将包含一个 __INLINE_CODE_120__ 属性（由 Passport 在 passport-local 身份验证流程中 populated）Here is the translation of the provided English technical documentation to Chinese:

生成真正的 JWT 并将其返回到这个路由中，以保持我们的服务模块化。我们将在 __INLINE_CODE_121__ 中生成 JWT。打开 __INLINE_CODE_122__ 文件，在 __INLINE_CODE_123__ 文件夹中添加 __INLINE_CODE_124__ 方法，并像这样导入 __INLINE_CODE_125__。

__CODE_BLOCK_15__

我们使用 __INLINE_CODE_126__ 库，该库提供了 __INLINE_CODE_127__ 函数来生成我们的 JWT，从 __INLINE_CODE_128__ 对象的子集属性生成，然后将其返回为简单对象，具有单个 __INLINE_CODE_129__ 属性。注意，我们选择 __INLINE_CODE_130__ 属性名来存储 __INLINE_CODE_131__ 值，以保持与 JWT 标准的一致性。不要忘记将 JwtService 提供者注入到 __INLINE_CODE_132__ 中。

现在，我们需要更新 __INLINE_CODE_133__，以导入新依赖项并配置 __INLINE_CODE_134__。

首先，在 __INLINE_CODE_136__ 文件夹中创建 __INLINE_CODE_135__，并添加以下代码：

__CODE_BLOCK_16__

我们将使用这个来共享我们的密钥，以便在 JWT 签名和验证步骤之间共享。

> 警告 **不要公开这个密钥**。在这里，我们公开了密钥，以便清楚地表明代码的作用，但在生产环境中 **您必须保护这个密钥**，使用适当的措施，如秘密存储库、环境变量或配置服务。

现在，打开 __INLINE_CODE_138__ 文件夹中的 __INLINE_CODE_137__，并更新它以如下所示：

__CODE_BLOCK_17__

我们使用 __INLINE_CODE_140__ 配置 __INLINE_CODE_139__，并将其传递给配置对象。查看 __LINK_237__以了解 Nest __INLINE_CODE_141__ 和 __LINK_238__以了解可用的配置选项。

现在，我们可以更新 __INLINE_CODE_142__ 路由，以返回 JWT。

__CODE_BLOCK_18__

让我们使用 cURL Again 测试我们的路由。您可以使用 __INLINE_CODE_144__ 中硬编码的 __INLINE_CODE_143__ 对象测试。

__CODE_BLOCK_19__

#### 实现 Passport JWT

现在，我们可以解决最后一个要求：保护端点，要求请求中存在有效的 JWT。Passport 可以帮助我们这里。它提供了 __LINK_239__ 策略，以保护 RESTful 端点使用 JSON Web Tokens。开始创建 __INLINE_CODE_145__ 文件，在 __INLINE_CODE_146__ 文件夹中，并添加以下代码：

__CODE_BLOCK_20__

我们的 __INLINE_CODE_147__ 已经遵循了早些时候描述的所有 Passport 策略。这策略需要一些初始化，因此我们使用 __INLINE_CODE_148__ 调用将 options 对象传递给 __INLINE_CODE_149__。您可以阅读更多关于可用的选项 __LINK_240__。在我们的情况下，这些选项是：

- __INLINE_CODE_149__: 提供将 JWT 提取到 __INLINE_CODE_150__ 的方法。我们将使用标准方法，即将我们的 API 请求的 Authorization 头中提供 JWT。其他选项请参阅 __LINK_241__。
- __INLINE_CODE_151__: 为了明确，我们选择了默认 __INLINE_CODE_152__ 设置，这意味着 Passport 模块将负责确保 JWT 未过期。如果我们的路由中提供了过期的 JWT，请求将被拒绝，并发送 __INLINE_CODE_153__ 响应。Passport Conveniently 处理了这个自动化步骤。
- __INLINE_CODE_154__: 我们使用了 expedient 选项，即使用对称密钥签名 token。其他选项，例如 PEM 编码的公共密钥，可能更适合生产环境（查看 __LINK_242__以了解更多信息）。无论如何，**请不要公开这个密钥**。

__INLINE_CODE_155__ 方法值得讨论。对于 jwt-策略，Passport 首先验证 JWT 的签名和解码 JSON，然后调用我们的 __INLINE_CODE_156__ 方法，并将解码 JSON 作为单个参数传递。由于 JWT 签名的工作方式，我们可以确保收到一个有效的 token，该 token 我们之前签名并分配给有效的用户。

因此，我们对 __INLINE_CODE_157__ 回调的响应是简单的：我们只是返回一个包含 __INLINE_CODE_158__ 和 __INLINE_CODE_159__ 属性的对象。回忆一下，Passport 将根据我们的 __INLINE_CODE_161__ 方法的返回值构建一个 __INLINE_CODE_160__ 对象，并将其作为 __INLINE_CODE_162__ 对象的属性。

此外，您可以返回一个数组，其中第一个值用于创建 __INLINE_CODE_163__ 对象，第二个值用于创建 __INLINE_CODE_164__ 对象。以下是翻译后的中文文档：

#### 实现保护路由和 JWT 策略守卫

现在我们可以实现保护路由和其关联的守卫。

打开 `__INLINE_CODE_175__` 文件，并将其更新如下所示：

__CODE_BLOCK_23__

再次应用 `__INLINE_CODE_176__`，该守卫是 `__INLINE_CODE_177__` 模块自动为我们配置的 passport-jwt 模块。该守卫以其默认名称 `__INLINE_CODE_178__` 引用。每当我们的 `__INLINE_CODE_179__` 路由被访问时，守卫将自动调用我们的 passport-jwt 自定义配置策略，验证 JWT，并将 `__INLINE_CODE_180__` 属性分配给 `__INLINE_CODE_181__` 对象。

确保应用程序正在运行，并使用 `__INLINE_CODE_182__` 测试路由。

__CODE_BLOCK_24__

请注意，在 `__INLINE_CODE_183__` 中，我们配置了 JWT 的过期时间为 `__INLINE_CODE_184__`。这可能是一个过短的过期时间，处理 token 过期和刷新的细节超出了本文的范围。然而，我们选择了该方式以展示 JWT 和 passport-jwt 策略的重要特性。等待 60 秒后尝试请求 `__INLINE_CODE_185__`，您将收到 `__INLINE_CODE_186__` 响应。这是因为 Passport 自动检查 JWT 的过期时间，省去了您在应用程序中做出这种检查的努力。

我们现在已经完成了 JWT 认证实现。JavaScript 客户端（如 Angular/React/Vue），和其他 JavaScript 应用程序现在可以安全地与我们的 API 服务器进行身份验证和通信。

#### 扩展守卫

在大多数情况下，使用提供的 `__INLINE_CODE_187__` 类是足够的。然而，有些情况下，您可能想简单地扩展默认错误处理或身份验证逻辑。为此，您可以扩展默认类并在子类中重写方法。

__CODE_BLOCK_25__

此外，我们可以允许身份验证通过一系列策略。第一个策略成功、重定向或错误将停止链。身份验证失败将按照顺序通过每个策略， ultimate 失败如果所有策略都失败。

__CODE_BLOCK_26__

#### 启用身份验证全局

如果您的大多数端点应该默认被保护，可以将身份验证守卫注册为 `__LINK_243__`，而不是在每个控制器上使用 `__INLINE_CODE_188__` 装饰器。相反，您可以简单地标记哪些路由应该是公共的。

首先，使用以下构造在任何模块中注册 `__INLINE_CODE_189__` 作为全局守卫：

__CODE_BLOCK_27__

在这种情况下，Nest 将自动将 `__INLINE_CODE_190__` 绑定到所有端点。

现在，我们必须提供一个机制来声明路由为公共的。为此，我们可以创建一个自定义装饰器使用 `__INLINE_CODE_191__` 装饰器工厂函数。

__CODE_BLOCK_28__

在上面的文件中，我们导出了两个常量。一个是我们的元数据键名 `__INLINE_CODE_192__`，另一个是我们的新装饰器本身，我们将其称为 `__INLINE_CODE_193__`（您也可以将其命名为 `__INLINE_CODE_194__` 或 `__INLINE_CODE_195__`， Whatever fits your project）。

现在，我们已经有了自定义 `__INLINE_CODE_196__` 装饰器，我们可以使用它来装饰任何方法，例如：

__CODE_BLOCK_29__

最后，我们需要 `__INLINE_CODE_197__` 返回 `__INLINE_CODE_198__` 当 `__INLINE_CODE_199__` 元数据被找到。为此，我们将使用 `__INLINE_CODE_200__` 类（读取更多关于 `__LINK_244__`）。

__CODE_BLOCK_30__

#### 请求作用域策略Here is the translation of the English technical documentation to Chinese:

Passport API 基于注册策略到库的全局实例。因此，策略不设计为 request-dependent 选项或动态实例化 per 请求（了解更多关于__LINK_245__提供者的信息）。当您配置策略为请求作用域时，Nest 将不会实例化它，因为它与特定路由无关。没有物理方式来确定哪些“请求作用域”策略应该在每个请求中执行。

然而，我们可以使用__LINK_246__功能来动态解决请求作用域提供者。

首先，打开__INLINE_CODE_201__文件，并将__INLINE_CODE_202__ injected 到正常的方式中：

__CODE_BLOCK_31__

> info **提示** __INLINE_CODE_203__类来自__INLINE_CODE_204__包。

确保将__INLINE_CODE_205__配置属性设置为__INLINE_CODE_206__，如下所示。

在下一步中，将使用请求实例来获取当前上下文标识符，而不是生成一个新的（了解更多关于请求上下文__LINK_247__）。

现在，在__INLINE_CODE_207__方法中__INLINE_CODE_208__类中，使用__INLINE_CODE_209__方法__INLINE_CODE_210__类来根据请求对象创建上下文标识符，并将其传递给__INLINE_CODE_211__调用：

__CODE_BLOCK_32__

在上面的示例中，__INLINE_CODE_212__方法将异步返回__INLINE_CODE_213__提供者的请求作用域实例（假设__INLINE_CODE_214__已标记为请求作用域提供者）。

#### 自定义 Passport

可以使用任何标准 Passport 自定义选项，以相同的方式使用__INLINE_CODE_215__方法。可用的选项取决于实现的策略。例如：

__CODE_BLOCK_33__

您也可以在策略构造函数中传递选项对象以配置它们。
对于本地策略，您可以传递例如：

__CODE_BLOCK_34__

查看官方__LINK_248__以获取属性名称。

#### 命名策略

在实现策略时，可以为其提供名称通过将第二个参数传递给__INLINE_CODE_216__函数。如果不这样做，每个策略都会有一个默认名称（例如，'jwt' for jwt-strategy）：

__CODE_BLOCK_35__

然后，您可以通过__INLINE_CODE_217__装饰器引用该名称。

#### GraphQL

为了使用 AuthGuard with __LINK_249__，扩展内置__INLINE_CODE_218__类并重写__INLINE_CODE_219__方法。

__CODE_BLOCK_36__

要在您的 GraphQL 解析器中获取当前已authenticated 用户，可以定义__INLINE_CODE_220__装饰器：

__CODE_BLOCK_37__

要在您的解析器中使用上述装饰器，请确保将其作为查询或 mutation 的参数：

__CODE_BLOCK_38__

对于 passport-local 策略，您还需要将 GraphQL 上下文的参数添加到请求体中，以便 Passport 可以访问它们进行验证。否则，您将收到 Unauthorized 错误。

__CODE_BLOCK_39__

Note: I kept the placeholders exactly as they are in the source text, as per the guidelines.