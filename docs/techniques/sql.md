<!-- 此文件从 content/techniques/sql.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:37:52.981Z -->
<!-- 源文件: content/techniques/sql.md -->

### 数据库

Nest 是数据库中立的，它允许您轻松地将任何 SQL 或 NoSQL 数据库集成到应用程序中。根据您的喜好，您有多种选择。最一般的层面，连接 Nest 到数据库只是需要加载适当的 Node.js 驱动程序，就像您将 __LINK_396__ 或 Fastify 一样。

您也可以直接使用任何通用的 Node.js 数据库集成 **library** 或 ORM，例如 __LINK_397__（见 __LINK_398__），__LINK_399__（见 __LINK_400__），__LINK_401__（见 __LINK_402__），__LINK_403__，和 __LINK_404__（见 __LINK_405__），以操作在更高的抽象层。

出于venience，Nest 提供了对 TypeORM 和 Sequelize 的紧密集成，通过 __INLINE_CODE_53__ 和 __INLINE_CODE_54__ 包分别，涵盖在当前章节中，以及 Mongoose 通过 __INLINE_CODE_55__，涵盖在 __LINK_406__ 中。这些建成提供了 NestJS-特定的功能，如模型/存储库注入、可测试性和异步配置，以便更方便地访问您的选择的数据库。

### TypeORM 集成

Nest 提供了 __INLINE_CODE_56__ 包来与 SQL 和 NoSQL 数据库集成。 __LINK_407__ 是 TypeScript 中的最成熟的对象关系映射器（ORM）。由于它是用 TypeScript编写的，所以它与 Nest 框架集成很好。

要开始使用它，我们首先安装所需的依赖项。在本章中，我们将演示使用流行的 __LINK_408__ 关系 DBMS，但 TypeORM 支持许多关系数据库，如 PostgreSQL、Oracle、Microsoft SQL Server、SQLite 和甚至 NoSQL 数据库，如 MongoDB。我们将在本章中走过的过程对于任何支持 TypeORM 的数据库都相同。您只需要安装关联客户端 API 库。

```shell
$ npm i cookie-parser
$ npm i -D @types/cookie-parser

```

安装完成后，我们可以将 __INLINE_CODE_57__ 导入到根 __INLINE_CODE_58__ 中。

```typescript
import * as cookieParser from 'cookie-parser';
// somewhere in your initialization file
app.use(cookieParser());

```

> 警告 **注意** 设置 __INLINE_CODE_59__ shouldn't 在生产中使用 - 否则，您可能会失去生产数据。

__INLINE_CODE_60__ 方法支持 __INLINE_CODE_61__ 构造函数中的所有配置属性，除此之外，还有以下几个额外的配置属性。

__HTML_TAG_238__
  __HTML_TAG_239__
    __HTML_TAG_240____HTML_TAG_241__retryAttempts__HTML_TAG_242____HTML_TAG_243__
    __HTML_TAG_244__Number of attempts to connect to the database (default: __HTML_TAG_245__10__HTML_TAG_246__)__HTML_TAG_247__
  __HTML_TAG_248__
  __HTML_TAG_249__
    __HTML_TAG_250____HTML_TAG_251__retryDelay__HTML_TAG_252____HTML_TAG_253__
    __HTML_TAG_254__Delay between connection retry attempts (ms) (default: __HTML_TAG_255__3000__HTML_TAG_256__)__HTML_TAG_257__
  __HTML_TAG_258__
  __HTML_TAG_259__
    __HTML_TAG_260____HTML_TAG_261__autoLoadEntities__HTML_TAG_262____HTML_TAG_263__
    __HTML_TAG_264__If __HTML_TAG_265__true__HTML_TAG_266__, entities will be loaded automatically (default: __HTML_TAG_267__false__HTML_TAG_268__)__HTML_TAG_269__
  __HTML_TAG_270__
__HTML_TAG_271__

> 提示 **提示** 了解更多关于数据源选项 __LINK_410__。

完成后，TypeORM 的 __INLINE_CODE_62__ 和 __INLINE_CODE_63__ 对象将可供整个项目中注入（无需导入任何模块），例如：

```typescript
@Get()
findAll(@Req() request: Request) {
  console.log(request.cookies); // or "request.cookies['cookieKey']"
  // or console.log(request.signedCookies);
}

```

#### 仓储模式

__LINK_411__ 支持 **仓储设计模式**，因此每个实体都有自己的仓储。这些仓储可以从数据库数据源获得。

要继续示例，我们需要至少一个实体。让我们定义 __INLINE_CODE_64__ 实体。

```typescript
@Get()
findAll(@Res({ passthrough: true }) response: Response) {
  response.cookie('key', 'value')
}

```

> 提示 **提示** 了解更多关于实体在 __LINK_412__ 中。

__INLINE_CODE_65__ 实体文件位于 __INLINE_CODE_66__ 目录中。这目录中包含所有与 __INLINE_CODE_67__ 相关的文件。您可以决定将模型文件保存在哪里，但是我们建议将它们保存在相应的模块目录中。

要开始使用 __INLINE_CODE_68__ 实体，我们需要让 TypeORM 知道它是通过将其插入 __INLINE_CODE_69__ 数组中，在模块 __INLINE_CODE_70__ 方法选项中（除非使用静态_glob_路径）。

```shell
$ npm i @fastify/cookie

```

接下来，让我们来看 __INLINE_CODE_71__：

```typescript
import fastifyCookie from '@fastify/cookie';

// somewhere in your initialization file
const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
await app.register(fastifyCookie, {
  secret: 'my-secret', // for cookies signature
});

```

这个模块使用 __INLINE_CODE_72__ 方法来定义当前范围内注册的仓储。现在，我们可以注入 __INLINE_CODE_73__ 到 __INLINE_CODE_74__ 中，使用 __INLINE_CODE_75__ 装饰器：

```typescript
@Get()
findAll(@Req() request: FastifyRequest) {
  console.log(request.cookies); // or "request.cookies['cookieKey']"
}

```

> 警告 **注意**Here is the translation of the provided English technical documentation to Chinese:

如果您想在不导入 __INLINE_CODE_78__ 的模块中使用仓库，您需要重新导出由它生成的提供者。

可以这样导出整个模块：

```typescript
@Get()
findAll(@Res({ passthrough: true }) response: FastifyReply) {
  response.setCookie('key', 'value')
}

```

现在，如果我们在 __INLINE_CODE_80__ 中导入 __INLINE_CODE_79__,那么我们可以在 __INLINE_CODE_80__ 的提供者中使用 __INLINE_CODE_81__。

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Cookies = createParamDecorator((data: string, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return data ? request.cookies?.[data] : request.cookies;
});

```

#### 关联

关联是两个或多个表之间的关联，基于每个表的公共字段，通常涉及到主键和外键。

有三个类型的关联：

__HTML_TAG_272__
  __HTML_TAG_273__
    __HTML_TAG_274____HTML_TAG_275__一对一__HTML_TAG_276____HTML_TAG_277__
    __HTML_TAG_278__每个主表的行都有且仅有一个关联的行在外键表中。使用 __HTML_TAG_279__@OneToOne()__HTML_TAG_280__ 装饰器来定义这种类型的关联。
  __HTML_TAG_282__
  __HTML_TAG_283__
    __HTML_TAG_284____HTML_TAG_285__一对多 / 多对一__HTML_TAG_286____HTML_TAG_287__
    __HTML_TAG_288__每个主表的行都有一个或多个关联的行在外键表中。使用 __HTML_TAG_289__@OneToMany()__HTML_TAG_290__ 和 __HTML_TAG_291__@ManyToOne()__HTML_TAG_292__ 装饰器来定义这种类型的关联。
  __HTML_TAG_294__
  __HTML_TAG_295__
    __HTML_TAG_296____HTML_TAG_297__多对多__HTML_TAG_298____HTML_TAG_299__
    __HTML_TAG_300__每个主表的行都有多个关联的行在外键表中，每条记录在外键表中都有多个关联的行在主表中。使用 __HTML_TAG_301__@ManyToMany()__HTML_TAG_302__ 装饰器来定义这种类型的关联。
  __HTML_TAG_304__
__HTML_TAG_305__

要在实体中定义关联，请使用相应的装饰器。例如，要定义每个 __INLINE_CODE_82__ 可以有多个照片，请使用 __INLINE_CODE_83__ 装饰器。

```typescript
@Get()
findAll(@Cookies('name') name: string) {}

```

> info **提示** 了解 TypeORM 关联的更多信息，请访问 __LINK_413__。

#### 自动加载实体

手动将实体添加到数据源选项的 __INLINE_CODE_84__ 数组中可能很麻烦。此外，引用实体从根模块中破坏了应用程序的领域边界，并且将实现细节泄露到应用程序的其他部分。为了解决这个问题，提供了一个alternative解决方案。要自动加载实体，请将配置对象的 __INLINE_CODE_85__ 属性设置为 __INLINE_CODE_87__，如下所示：

__CODE_BLOCK_10__

使用这个设置，每个通过 __INLINE_CODE_88__ 方法注册的实体都将自动添加到配置对象的 __INLINE_CODE_89__ 数组中。

> warning **警告** 请注意，不是通过 __INLINE_CODE_90__ 方法注册的实体，但是在实体中引用了实体（通过关系），不会通过 __INLINE_CODE_91__ 设置被包括。

#### 分离实体定义

可以在模型中使用装饰器定义实体和列。但是，有些人更喜欢在单独的文件中定义实体和列使用 __LINK_414__。

__CODE_BLOCK_11__

> warning error **警告** 如果您提供了 __INLINE_CODE_92__ 选项，__INLINE_CODE_93__ 选项值必须与目标类的名称相同。
> 如果您不提供 __INLINE_CODE_94__ 您可以使用任何名称。

Nest 允许您使用 __INLINE_CODE_95__ 实例，而不是 __INLINE_CODE_96__，例如：

__CODE_BLOCK_12__

#### TypeORM 事务

数据库事务是一个数据库管理系统中对数据库的单个工作单元，它被视为独立的、可靠的工作单元。事务通常表示对数据库的任何更改（__LINK_415__）。

有许多不同的策略来处理 __LINK_416__。我们建议使用 __INLINE_CODE_97__ 类，因为它提供了对事务的完全控制。

首先，我们需要将 __INLINE_CODE_98__ 对象注入到类中：

__CODE_BLOCK_13__

> info **提示** __INLINE_CODE_99__ 类来自 __INLINE_CODE_100__ 包。

现在，我们可以使用这个对象来创建事务。

__CODE_BLOCK_14__

> info **提示** 请注意，__INLINE_CODE_101__ 只用于创建 __INLINE_CODE_102__。然而，要测试这个类将需要模拟整个 __INLINE_CODE_103__ 对象（它公开了多个方法）。因此，我们建议使用 helper 工厂类（例如 __INLINE_CODE_104__）并定义一个接口，其中包含维护事务所需的方法。这使得模拟这些方法变得很简单。

__#### 提供者

使用 TypeORM __LINK_418__ 可以监听特定实体事件。

__CODE_BLOCK_16__

> 警告 **Warning** 事件提供者不能被 __LINK_419__。

现在，添加 __INLINE_CODE_107__ 类到 __INLINE_CODE_108__ 数组中：

__CODE_BLOCK_17__

#### 数据库迁移

__LINK_420__ 提供了一种方法，可以.incrementally 更新数据库schema，以保持它与应用程序数据模型同步，同时保留现有数据库数据。要生成、运行和撤回迁移，TypeORM 提供了专门的 __LINK_421__。

迁移类独立于 Nest 应用程序源代码。它们的生命周期由 TypeORM CLI 维护。因此，您不能使用依赖注入和其他 Nest 特定的功能与迁移。要了解更多关于迁移的信息，请遵循 __LINK_422__ 指南。

#### 多个数据库

一些项目需要多个数据库连接。这也可以通过该模块实现。要使用多个连接，首先创建连接。在这种情况下，数据源命名变得 **强制**。

假设您有一个 __INLINE_CODE_109__ 实体，存储在其自己的数据库中。

__CODE_BLOCK_18__

> 警告 **Notice** 如果您不设置 __INLINE_CODE_110__ 的数据源，它的名称将设置为 __INLINE_CODE_111__。请注意，您 shouldn't 有多个连接没有名称或同名否则它们将被覆盖。

> 警告 **Notice** 如果您使用 __INLINE_CODE_112__，您需要 **同时** 设置数据源名称外部 __INLINE_CODE_113__。例如：
>
> __CODE_BLOCK_19__
>
> 了解 __LINK_423__ 更多信息。

到目前为止，您已经注册了 __INLINE_CODE_114__ 和 __INLINE_CODE_115__ 实体，使用它们自己的数据源。使用这种设置，您需要告诉 __INLINE_CODE_116__ 方法和 __INLINE_CODE_117__ 装饰器哪个数据源应该使用。如果您不传递任何数据源名称， __INLINE_CODE_118__ 数据源将被使用。

__CODE_BLOCK_20__

您还可以注入 __INLINE_CODE_119__ 或 __INLINE_CODE_120__ 为给定的数据源：

__CODE_BLOCK_21__

此外，也可以注入任何 __INLINE_CODE_121__ 到提供者：

__CODE_BLOCK_22__

#### 测试

当我们想单元测试应用程序时，我们通常想要避免建立数据库连接，以保持测试套件独立且执行过程尽可能快。但是，我们的类可能依赖于从数据源（连接）实例中pull出的存储库。那么，我们如何处理这个问题？解决方案是创建 mock 存储库。在 order to achieve this, we set up __LINK_424__.每个注册的存储库都自动由一个 __INLINE_CODE_122__  token 表示，其中 __INLINE_CODE_123__ 是您的实体类名称。

__INLINE_CODE_124__ 包含 __INLINE_CODE_125__ 函数，返回一个基于给定实体的 prepared token。

__CODE_BLOCK_23__

现在，一个 substitute __INLINE_CODE_126__ 将被用作 __INLINE_CODE_127__。每当任何类问 __INLINE_CODE_128__ 使用 __INLINE_CODE_129__ 装饰器，Nest 将使用注册的 __INLINE_CODE_130__ 对象。

#### 异步配置

您可能想要异步地传递您的存储库模块选项，而不是静态地。这种情况下，可以使用 __INLINE_CODE_131__ 方法，该方法提供了多种方式来处理异步配置。

一种方法是使用工厂函数：

__CODE_BLOCK_24__

我们的工厂行为像任何 __LINK_425__（例如，它可以被 __INLINE_CODE_132__ 和能够注入依赖项通过 __INLINE_CODE_133__）。

__CODE_BLOCK_25__

或者，可以使用 __INLINE_CODE_134__ 语法：

__CODE_BLOCK_26__

构造上述将在 __INLINE_CODE_136__ 中实例化 __INLINE_CODE_135__ 并使用它来提供选项对象，通过调用 __INLINE_CODE_137__。请注意，这意味着 __INLINE_CODE_138__ 需要实现 __INLINE_CODE_139__ 接口，如下所示：

__CODE_BLOCK_27__

为了防止在 __INLINE_CODE_141__ 中创建 __INLINE_CODE_140__ 并使用来自不同模块的提供者，可以使用 __INLINE_CODE_142__ 语法。

__CODE_BLOCK_28__

构造上述与 __INLINE_CODE_143__ 相同，但有一个关键差异 - __INLINE_CODE_144__ 将 lookup 已经导入的模块，以重用一个已有的 __INLINE_CODE_145__ 而不是实例化一个新的。

> 提示 **Hint** 确保 __INLINE_CODE_146__ 属性在与 __INLINE_CODE_147__、__INLINE_CODE_148__ 或 __INLINE_CODE_149__ 属性同一级别上定义。这将允许 Nestorrectly 注册数据源到适当的注入令牌下。

#### 自定义数据源工厂Here is the translation of the provided English technical documentation to Chinese:

在使用 __INLINE_CODE_150__, __INLINE_CODE_151__, 或 __INLINE_CODE_152__ 配置异步时，您可以选择提供自己的 TypeORM 数据源，而不是让 __INLINE_CODE_154__ 创建数据源。

__INLINE_CODE_155__ 接收 TypeORM __INLINE_CODE_156__，使用 __INLINE_CODE_157__, __INLINE_CODE_158__, 或 __INLINE_CODE_159__ 配置的异步配置，并返回一个 __INLINE_CODE_160__，用于解决 TypeORM __INLINE_CODE_161__。

__CODE_BLOCK_29__

> 信息 **提示** __INLINE_CODE_162__ 类从 __INLINE_CODE_163__ 包中导入。

#### 示例

有一个可工作的示例 __LINK_426__。

__HTML_TAG_308____HTML_TAG_309__

### Sequelize集成

使用 TypeORM 的alternative 是使用 __LINK_427__ ORM，结合 __INLINE_CODE_164__ 包。另外，我们还使用 __LINK_428__ 包，提供了一组用来声明实体的装饰器。

开始使用它，我们首先安装所需的依赖项。在本章中，我们将演示使用流行的 __LINK_429__ 关系数据库管理系统，但是 Sequelize 支持许多关系数据库，如 PostgreSQL、MySQL、Microsoft SQL Server、SQLite 和 MariaDB。我们在本章中所走的步骤对于任何支持 Sequelize 的数据库都相同，您只需要安装关联客户端 API 库。

__CODE_BLOCK_30__

安装过程完成后，我们可以将 __INLINE_CODE_165__ 导入到根 __INLINE_CODE_166__。

__CODE_BLOCK_31__

__INLINE_CODE_167__ 方法支持 Sequelize 构造函数 (__LINK_430__) expose 的所有配置属性，另外，还有以下几个额外的配置属性。

__HTML_TAG_310__
  __HTML_TAG_311__
    __HTML_TAG_312____HTML_TAG_313__retryAttempts__HTML_TAG_314____HTML_TAG_315__
    __HTML_TAG_316__连接数据库的尝试次数（默认：__HTML_TAG_317__10__HTML_TAG_318__)__HTML_TAG_319__
  __HTML_TAG_320__
  __HTML_TAG_321__
    __HTML_TAG_322____HTML_TAG_323__retryDelay__HTML_TAG_324____HTML_TAG_325__
    __HTML_TAG_326__连接重试尝试之间的延迟（ms）（默认：__HTML_TAG_327__3000__HTML_TAG_328__)__HTML_TAG_329__
  __HTML_TAG_330__
  __HTML_TAG_331__
    __HTML_TAG_332____HTML_TAG_333__autoLoadModels__HTML_TAG_334____HTML_TAG_335__
    __HTML_TAG_336__如果 __HTML_TAG_337__true__HTML_TAG_338__，模型将被自动加载（默认：__HTML_TAG_339__false__HTML_TAG_340__)__HTML_TAG_341__
  __HTML_TAG_342__
  __HTML_TAG_343__
    __HTML_TAG_344____HTML_TAG_345__keepConnectionAlive__HTML_TAG_346____HTML_TAG_347__
    __HTML_TAG_348__如果 __HTML_TAG_349__true__HTML_TAG_350__，连接将不会在应用程序关闭时关闭（默认：__HTML_TAG_351__false__HTML_TAG_352__)__HTML_TAG_353__
  __HTML_TAG_354__
  __HTML_TAG_355__
    __HTML_TAG_356____HTML_TAG_357__synchronize__HTML_TAG_358____HTML_TAG_359__
    __HTML_TAG_360__如果 __HTML_TAG_361__true__HTML_TAG_362__，自动加载的模型将被同步（默认：__HTML_TAG_363__true__HTML_TAG_364__)__HTML_TAG_365__
  __HTML_TAG_366__
__HTML_TAG_367__

完成后，__INLINE_CODE_168__ 对象将可供在整个项目中注入（不需要导入任何模块），例如：

__CODE_BLOCK_32__

#### 模型

Sequelize 实现了活动记录模式。使用这个模式，您可以使用模型类直接与数据库交互。继续示例，我们需要至少一个模型。让我们定义 __INLINE_CODE_169__ 模型。

__CODE_BLOCK_33__

> 信息 **提示** 了解更多关于可用的装饰器 __LINK_431__。

__INLINE_CODE_170__ 模型文件位于 __INLINE_CODE_171__ 目录中。这目录包含所有与 __INLINE_CODE_172__ 相关的文件。你可以决定将模型文件放在哪里，但是我们建议将它们放在它们的 **领域** 中，位于相应的模块目录中。

开始使用 __INLINE_CODE_173__ 模型，我们需要让 Sequelize 知道这个模型，通过将其插入 __INLINE_CODE_174__ 数组中，位于模块 __INLINE_CODE_175__ 方法选项：

__CODE_BLOCK_34__

接下来，让我们看看 __INLINE_CODE_176__：

__CODE_BLOCK_35__

这个模块使用 __INLINE_CODE_177__Here is the translation of the given English technical documentation to Chinese, following the provided rules:

现在，如果我们在 __INLINE_CODE_184__ 中引入 __INLINE_CODE_185__，那么我们可以在后者的模块提供商中使用 __INLINE_CODE_186__。

__CODE_BLOCK_38__

#### 关系

关系是两个或多个表之间的关联。关系基于每个表中的共同字段，通常涉及到主键和外键。

有三种类型的关系：

__HTML_TAG_368__
  __HTML_TAG_369__
    __HTML_TAG_370____HTML_TAG_371__一对一__HTML_TAG_372____HTML_TAG_373__
    __HTML_TAG_374__每个表中的每一行都有且仅有一个相应的行在外键表中__HTML_TAG_375__
  __HTML_TAG_376__
  __HTML_TAG_377__
    __HTML_TAG_378____HTML_TAG_379__一对多 / 多对一__HTML_TAG_380____HTML_TAG_381__
    __HTML_TAG_382__每个表中的每一行都有一个或多个相关行在外键表中__HTML_TAG_383__
  __HTML_TAG_384__
  __HTML_TAG_385__
    __HTML_TAG_386____HTML_TAG_387__多对多__HTML_TAG_388____HTML_TAG_389__
    __HTML_TAG_390__每个表中的每一行都有多个相关行在外键表中，而每个记录在外键表中也都有多个相关行在原始表中__HTML_TAG_391__
  __HTML_TAG_392__
__HTML_TAG_393__

为了在模型中定义关系，使用相应的 **装饰器**。例如，要定义每个 __INLINE_CODE_187__ 可以有多个照片，使用 __INLINE_CODE_188__ 装饰器。

__CODE_BLOCK_39__

> 提示 **提示** 为了了解更多关于 Sequelize 的关联，请阅读 __LINK_432__ 章节。

#### 自动加载模型

手动将模型添加到 __INLINE_CODE_189__ 数组中的连接选项中可能很繁琐。此外，引用模型将导致应用程序的域边界被破坏，导致其他应用程序部分泄露实现细节。为了解决这个问题，可以自动加载模型，通过将 __INLINE_CODE_190__ 和 __INLINE_CODE_191__ 属性设置为 __INLINE_CODE_193__，如以下所示：

__CODE_BLOCK_40__

使用该选项指定后，每个通过 __INLINE_CODE_194__ 方法注册的模型将被自动添加到 __INLINE_CODE_195__ 数组中。

> 警告 **警告** 请注意，不是通过 __INLINE_CODE_196__ 方法注册的模型，但是在模型中被引用（通过关联），将不会被包含。

#### Sequelize 事务

数据库事务symbolizes一个数据库管理系统中的一组工作单元，对该数据库进行一致和可靠的处理，独立于其他事务。事务通常表示对数据库（__LINK_433__）的一些变化。

有许多不同的策略来处理 __LINK_434__。下面是一个自动回调事务的示例实现。

首先，我们需要将 __INLINE_CODE_197__ 对象注入到一个类中，以便进行正常的处理：

__CODE_BLOCK_41__

> 提示 **提示** __INLINE_CODE_198__ 类来自 __INLINE_CODE_199__ 包。

现在，我们可以使用这个对象来创建事务。

__CODE_BLOCK_42__

> 提示 **提示** 请注意，__INLINE_CODE_200__ 实例只用于启动事务。然而，测试这个类将需要模拟整个 __INLINE_CODE_201__ 对象（它 expose 多个方法）。因此，我们建议使用一个 helper 工厂类（例如 __INLINE_CODE_202__），并定义一个包含有限方法的接口，以便维护事务。这使得模拟这些方法变得非常简单。

#### 迁移

__LINK_435__ 提供了一种incremental更新数据库模式的方式，以便保持数据库 schema 与应用程序数据模型同步，同时保留现有数据。Sequelize 提供了一个专门的 __LINK_436__ 来生成、运行和回退迁移。

迁移类别独立于 Nest 应用程序源代码。它们的生命周期由 Sequelize CLI 维护。因此，你不能使用依赖注入和其他 Nest 特定的特性来迁移。要了解更多关于迁移，请阅读 __LINK_437__ 指南。

__HTML_TAG_394____HTML_TAG_395__

#### 多个数据库

一些项目需要多个数据库连接。这也可以使用该模块。要使用多个连接，首先创建连接。在这种情况下，连接命名变得 **必要**。

假设你有一个 __INLINE_CODE_203__ 实体，它存储在自己的数据库中。

__CODE_BLOCK_43__

> 注意 **注意** 如果你没有设置 __INLINE_CODE_204__，连接的名称将被设置为 __INLINE_CODE_205__。请注意，你 shouldn't 有多个连接没有名称，或者具有相同名称，否则它们将被覆盖。At this point, you have __INLINE_CODE_206__和__INLINE_CODE_207__ models registered with their own connection. With this setup, you need to tell the __INLINE_CODE_208__ method and the __INLINE_CODE_209__ decorator which connection should be used. If you do not pass any connection name, the __INLINE_CODE_210__ connection is used.

**代码块 44**

You can also inject the __INLINE_CODE_211__ instance for a given connection:

**代码块 45**

It's also possible to inject any __INLINE_CODE_212__ instance to the providers:

**代码块 46**

#### 测试

When it comes to unit testing an application, we usually want to avoid making a database connection, keeping our test suites independent and their execution process as fast as possible. But our classes might depend on models that are pulled from the connection instance. How do we handle that? The solution is to create mock models. In order to achieve that, we set up __LINK_438__. Each registered model is automatically represented by a __INLINE_CODE_213__ token, where __INLINE_CODE_214__ is the name of your model class.

The __INLINE_CODE_215__ package exposes the __INLINE_CODE_216__ function which returns a prepared token based on a given model.

**代码块 47**

Now a substitute __INLINE_CODE_217__ will be used as the __INLINE_CODE_218__. Whenever any class asks for __INLINE_CODE_219__ using an __INLINE_CODE_220__ decorator, Nest will use the registered __INLINE_CODE_221__ object.

#### 异步配置

You may want to pass your __INLINE_CODE_222__ options asynchronously instead of statically. In this case, use the __INLINE_CODE_223__ method, which provides several ways to deal with async configuration.

One approach is to use a factory function:

**代码块 48**

Our factory behaves like any other __LINK_439__ (e.g., it can be __INLINE_CODE_224__ and it's able to inject dependencies through __INLINE_CODE_225__).

**代码块 49**

Alternatively, you can use the __INLINE_CODE_226__ syntax:

**代码块 50**

The construction above will instantiate __INLINE_CODE_227__ inside __INLINE_CODE_228__ and use it to provide an options object by calling __INLINE_CODE_229__. Note that this means that the __INLINE_CODE_230__ has to implement the __INLINE_CODE_231__ interface, as shown below:

**代码块 51**

In order to prevent the creation of __INLINE_CODE_232__ inside __INLINE_CODE_233__ and use a provider imported from a different module, you can use the __INLINE_CODE_234__ syntax.

**代码块 52**

This construction works the same as __INLINE_CODE_235__ with one critical difference - __INLINE_CODE_236__ will lookup imported modules to reuse an existing __INLINE_CODE_237__ instead of instantiating a new one.

#### 示例

A working example is available __LINK_440__.