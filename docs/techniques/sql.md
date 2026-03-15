<!-- 此文件从 content/techniques/sql.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T05:19:19.687Z -->
<!-- 源文件: content/techniques/sql.md -->

### 数据库

Nest 是数据库中立的，允许您轻松地将任何 SQL 或 NoSQL 数据库集成到您的应用程序中。您有多种选择，取决于您的喜好。从最一般的角度讲，连接 Nest 到数据库仅仅是一种加载适当的 Node.js 驱动程序的过程，就像您使用 __LINK_396__ 或 Fastify 一样。

您也可以直接使用任何通用的 Node.js 数据库集成 **library** 或 ORM，例如 __LINK_397__（见 __LINK_398__），__LINK_399__（见 __LINK_400__），__LINK_401__（见 __LINK_402__），__LINK_403__，和 __LINK_404__（见 __LINK_405__），以便在更高的抽象层上操作。

为了方便起见，Nest 提供了与 TypeORM 和 Sequelize 的紧密集成，以便使用 __INLINE_CODE_53__ 和 __INLINE_CODE_54__ 包含的相关功能，我们将在当前章节中涵盖 Mongoose 的集成，以便使用 __INLINE_CODE_55__，其涵盖在 __LINK_406__ 中。这些集成提供了 NestJS-专有的功能，如模型/存储库注入、可测试性和异步配置，以便更方便地访问您选择的数据库。

### TypeORM 集成

为了与 SQL 和 NoSQL 数据库集成，Nest 提供了 __INLINE_CODE_56__ 包含的 TypeORM 集成。__LINK_407__ 是 TypeScript 中写的最成熟的对象关系映射器（ORM）。由于它是使用 TypeScript 编写的，因此与 Nest 框架集成非常好。

要开始使用它，我们首先需要安装所需的依赖项。在本章中，我们将演示使用流行的 __LINK_408__ 关系数据库管理系统，但是 TypeORM 支持许多关系数据库，如 PostgreSQL、Oracle、Microsoft SQL Server、SQLite 和甚至 NoSQL 数据库如 MongoDB。我们将在本章中演示的过程将适用于 TypeORM 支持的任何数据库。您只需要安装与所选数据库相关的客户端 API 库。

```shell
$ npm i cookie-parser
$ npm i -D @types/cookie-parser

```

安装过程完成后，我们可以在 root __INLINE_CODE_58__ 中导入 __INLINE_CODE_57__。

```typescript
import * as cookieParser from 'cookie-parser';
// somewhere in your initialization file
app.use(cookieParser());

```

> warning **注意** 设置 __INLINE_CODE_59__ 不应该在生产环境中使用 - 否则您可能会失去生产数据。

__INLINE_CODE_60__ 方法支持 __INLINE_CODE_61__ 构造函数中的所有配置属性，除此之外，还有几个额外的配置属性，见下文。

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

> info **提示** 了解更多关于数据源选项 __LINK_410__。

一旦完成，这个 TypeORM 的 __INLINE_CODE_62__ 和 __INLINE_CODE_63__ 对象将可被注入到整个项目中（无需-import 任何模块），例如：

```typescript
@Get()
findAll(@Req() request: Request) {
  console.log(request.cookies); // or "request.cookies['cookieKey']"
  // or console.log(request.signedCookies);
}

```

#### 仓储模式

__LINK_411__ 支持 **仓储设计模式**，因此每个实体都有自己的仓储。这些仓储可以从数据库数据源中获取。

要继续示例，我们需要至少一个实体。让我们定义 __INLINE_CODE_64__ 实体。

```typescript
@Get()
findAll(@Res({ passthrough: true }) response: Response) {
  response.cookie('key', 'value')
}

```

> info **提示** 了解更多关于实体在 __LINK_412__。

__INLINE_CODE_65__ 实体文件位于 __INLINE_CODE_66__ 目录中。这目录中包含与 __INLINE_CODE_67__ 相关的所有文件。您可以决定将模型文件放在哪里，但是我们建议将它们放置在与 **域** 相关的模块目录中。

要开始使用 __INLINE_CODE_68__ 实体，我们需要让 TypeORM знает它，即将其插入 __INLINE_CODE_69__ 数组中，除非您使用静态 glob 路径：

```shell
$ npm i @fastify/cookie

```

接下来，让我们来看看 __INLINE_CODE_71__：

```typescript
import fastifyCookie from '@fastify/cookie';

// somewhere in your initialization file
const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
await app.register(fastifyCookie, {
  secret: 'my-secret', // for cookies signature
});

```

这个模块使用 __INLINE_CODE_72__ 方法来定义当前作用域中注册的仓储。现在，我们可以将 __INLINE_CODE_73__ 注入到 __Here is the translation of the provided English technical documentation to Chinese:

如果您想在不导入__INLINE_CODE_78__的模块中使用该 repository,那么您需要将其生成的提供者重新导出。

您可以通过导出整个模块来实现这一点，如下所示:

```typescript
@Get()
findAll(@Res({ passthrough: true }) response: FastifyReply) {
  response.setCookie('key', 'value')
}

```

现在如果我们在__INLINE_CODE_80__中导入__INLINE_CODE_79__,那么我们可以在__INLINE_CODE_81__中的提供者中使用__INLINE_CODE_81__。

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Cookies = createParamDecorator((data: string, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return data ? request.cookies?.[data] : request.cookies;
});

```

#### 关系

关系是两或多个表之间的关联。关系基于每个表中的共同字段，通常涉及到主键和外键。

有三种类型的关系：

__HTML_TAG_272__
  __HTML_TAG_273__
    __HTML_TAG_274____HTML_TAG_275__一对一__HTML_TAG_276____HTML_TAG_277__
    __HTML_TAG_278__每个主表中的行都只有一个关联行在外表中。使用 __HTML_TAG_279__@OneToOne()__HTML_TAG_280__ 装饰器来定义这种关系。
  __HTML_TAG_282__
  __HTML_TAG_283__
    __HTML_TAG_284____HTML_TAG_285__一对多/多对一__HTML_TAG_286____HTML_TAG_287__
    __HTML_TAG_288__每个主表中的行都有一个或多个关联行在外表中。使用 __HTML_TAG_289__@OneToMany()__HTML_TAG_290__ 和 __HTML_TAG_291__@ManyToOne()__HTML_TAG_292__ 装饰器来定义这种关系。
  __HTML_TAG_294__
  __HTML_TAG_295__
    __HTML_TAG_296____HTML_TAG_297__多对多__HTML_TAG_298____HTML_TAG_299__
    __HTML_TAG_300__每个主表中的行都有多个关联行在外表中，每个外表中的行都有多个关联行在主表中。使用 __HTML_TAG_301__@ManyToMany()__HTML_TAG_302__ 装饰器来定义这种关系。
  __HTML_TAG_304__
__HTML_TAG_305__

要在实体中定义关系，使用相应的**装饰器**。例如，要定义每个__INLINE_CODE_82__可以有多个照片，使用__INLINE_CODE_83__装饰器。

```typescript
@Get()
findAll(@Cookies('name') name: string) {}

```

> info **提示**要了解 TypeORM 关系，请访问 __LINK_413__。

#### 自动加载实体

手动将实体添加到数据源选项的 __INLINE_CODE_84__ 数组中可能很麻烦。此外，引用实体从根模块中可能会破坏应用程序的域边界，并且将实现细节泄露到应用程序的其他部分。为了解决这个问题，提供了一个alternative解决方案。要自动加载实体，请将配置对象的 __INLINE_CODE_85__ 属性设置为 __INLINE_CODE_87__，如下所示：

__CODE_BLOCK_10__

使用该选项指定后，每个通过 __INLINE_CODE_88__ 方法注册的实体都将被自动添加到配置对象的 __INLINE_CODE_89__ 数组中。

> warning **警告**注意，那些仅仅通过实体引用（而不是通过 __INLINE_CODE_90__ 方法）注册的实体，不会通过 __INLINE_CODE_91__ 设置被包含。

#### 分离实体定义

您可以在模型中定义实体和列，但有些人prefer 在单独的文件中使用 __LINK_414__ 定义实体和列。

__CODE_BLOCK_11__

> warning error **警告**如果您提供了 __INLINE_CODE_92__ 选项，__INLINE_CODE_93__ 选项值必须与目标类的名称相同。
> 如果您没有提供 __INLINE_CODE_94__，您可以使用任何名称。

Nest 允许您在 __INLINE_CODE_96__ 期望的地方使用 __INLINE_CODE_95__ 实例，例如：

__CODE_BLOCK_12__

#### TypeORM 事务

数据库事务 symbolizes 一组在数据库管理系统中执行的操作，并且可以独立于其他事务来处理。事务通常表示对数据库的任何更改 (__LINK_415__。

有许多不同的策略来处理 __LINK_416__. 我们建议使用 __INLINE_CODE_97__ 类，因为它提供了对事务的完全控制。

首先，我们需要将 __INLINE_CODE_98__ 对象注入到类中：

__CODE_BLOCK_13__

> info **提示** __INLINE_CODE_99__ 类来自 __INLINE_CODE_100__ 包。

现在，我们可以使用这个对象来创建事务。

__CODE_BLOCK_14__

> info **提示**注意，__INLINE_CODE_101__ 只用于创建 __INLINE_CODE_102__。然而，要测试这个类，需要模拟整个 __INLINE_CODE_103__ 对象（它暴露了多个方法）。因此，我们建议使用一个 helper 工厂类（例如 __INLINE_CODE_104__）并定义一个接口，其中包含维护事务所需的方法。这使得模拟这些方法变得非常简单。

__HTML_TAG_306____HTML_TAG_307__

 Alternatively, you can use the callback-style approach with the#### 订阅者

使用 TypeORM __LINK_418__,您可以监听特定实体事件。

__CODE_BLOCK_16__

> 警告 **Warning** 事件订阅者不能__LINK_419__。

现在，添加 __INLINE_CODE_107__ 类到 __INLINE_CODE_108__ 数组中：

__CODE_BLOCK_17__

#### 数据迁移

__LINK_420__ 提供了一种将数据库架构升级到应用程序数据模型的方法，以保持数据库架构与应用程序数据模型同步，同时保留现有数据。要生成、运行和还原迁移，TypeORM 提供了专门的 __LINK_421__。

迁移类独立于 Nest 应用程序源代码。它们的生命周期由 TypeORM CLI维护。因此，您不能使用依赖注入和其他 Nest 特定的功能来迁移。要了解更多关于迁移的信息，请遵循 __LINK_422__ 指南。

#### 多个数据库

一些项目需要多个数据库连接。这也可以使用该模块实现。要使用多个连接，首先创建连接。在这种情况下，数据源命名变得**强制**。

假设您有一个 __INLINE_CODE_109__ 实体，存储在其自己的数据库中。

__CODE_BLOCK_18__

> 警告 **Notice** 如果您没有为数据源设置 __INLINE_CODE_110__，那么它的名称将被设置为 __INLINE_CODE_111__。请注意，您 shouldn't 有多个连接没有名称或同名，否则它们将被覆盖。

> 警告 **Notice** 如果您使用 __INLINE_CODE_112__，那么您需要**同时**设置数据源名称外部 __INLINE_CODE_113__。例如：
>
> __CODE_BLOCK_19__
>
> 请查看 __LINK_423__ 获取更多信息。

在这个点上，您已经 __INLINE_CODE_114__ 和 __INLINE_CODE_115__ 实体注册到它们自己的数据源中。使用这个设置，您需要告诉 __INLINE_CODE_116__ 方法和 __INLINE_CODE_117__ 装饰器使用哪个数据源。如果您不传递任何数据源名称，则 __INLINE_CODE_118__ 数据源将被使用。

__CODE_BLOCK_20__

您也可以注入 __INLINE_CODE_119__ 或 __INLINE_CODE_120__ 到特定的数据源中：

__CODE_BLOCK_21__

此外，您还可以注入任何 __INLINE_CODE_121__ 到提供商中：

__CODE_BLOCK_22__

#### 测试

当它来到单元测试一个应用程序时，我们通常想避免建立数据库连接，以保持测试套件独立且执行速度快。但是，我们的类可能依赖于存储库，这些存储库从数据源（连接）实例中获取。那么，我们如何处理这个问题？解决方案是创建 mock 存储库。在 order to achieve this, we set up __LINK_424__。每个注册的存储库都将自动由一个 __INLINE_CODE_122__ 令牌表示，其中 __INLINE_CODE_123__ 是您的实体类名称。

__INLINE_CODE_125__ 包含 __INLINE_CODE_126__ 函数，该函数返回根据给定实体准备的令牌。

__CODE_BLOCK_23__

现在，一个 substitute __INLINE_CODE_126__ 将被用于 __INLINE_CODE_127__。每当任何类请求 __INLINE_CODE_128__ 使用 __INLINE_CODE_129__ 装饰器时，Nest 将使用注册的 __INLINE_CODE_130__ 对象。

#### 异步配置

您可能想异步地将存储库模块选项传递给 Nest。这种情况下，可以使用 __INLINE_CODE_131__ 方法，该方法提供了多种方式来处理异步配置。

一种方法是使用工厂函数：

__CODE_BLOCK_24__

我们的工厂行为像任何其他 __LINK_425__（例如，它可以__INLINE_CODE_132__和它可以注入依赖项通过 __INLINE_CODE_133__）。

__CODE_BLOCK_25__

或者，您可以使用 __INLINE_CODE_134__ 语法：

__CODE_BLOCK_26__

构建上述将在 __INLINE_CODE_136__ 中实例化 __INLINE_CODE_135__，并使用它来提供选项对象，通过调用 __INLINE_CODE_137__。请注意，这意味着 __INLINE_CODE_138__ 必须实现 __INLINE_CODE_139__ 接口，如下所示：

__CODE_BLOCK_27__

为了防止在 __INLINE_CODE_141__ 中创建 __INLINE_CODE_140__ 并使用来自不同模块的提供商，您可以使用 __INLINE_CODE_142__ 语法。

__CODE_BLOCK_28__

该构建与 __INLINE_CODE_143__ 相同，但有一个关键的区别—— __INLINE_CODE_144__ 将在已导入模块中查找 __INLINE_CODE_145__ 而不是实例化新一个。

> 提示 **Hint** 请确保 __INLINE_CODE_146__ 属性在 __INLINE_CODE_147__、__INLINE_CODE_148__ 或 __INLINE_CODE_149__ 属性同级别上定义。这将允许 Nest正确地将数据源注册到适当的注入令牌中。

#### 自定义数据源工厂Here is the translated text:

使用 __INLINE_CODE_150__, __INLINE_CODE_151__ 或 __INLINE_CODE_152__ 配置异步时，可以选择性地指定 __INLINE_CODE_153__ 函数，以便提供自己的 TypeORM 数据源，而不是让 __INLINE_CODE_154__ 创建数据源。

__INLINE_CODE_155__ 接收 TypeORM __INLINE_CODE_156__，使用 __INLINE_CODE_157__, __INLINE_CODE_158__ 或 __INLINE_CODE_159__ 配置在异步配置中，并返回一个 __INLINE_CODE_160__，该对象解析 TypeORM __INLINE_CODE_161__。

__CODE_BLOCK_29__

> 信息 **提示** __INLINE_CODE_162__ 类来自 __INLINE_CODE_163__ 包。

#### 示例

一个工作示例可在 __LINK_426__ 中找到。

__HTML_TAG_308____HTML_TAG_309__

### Sequelize 集成

使用 TypeORM 的alternative 是使用 __LINK_427__ ORM，结合 __INLINE_CODE_164__ 包。在本章中，我们将演示使用流行的 __LINK_429__ 关系数据库管理系统，但是 Sequelize 支持许多关系数据库，如 PostgreSQL、MySQL、Microsoft SQL Server、SQLite 和 MariaDB。我们在本章中将走过的步骤将适用于 Sequelize 支持的任何数据库。您只需安装关联客户端 API 库以便使用您的选择数据库。

__CODE_BLOCK_30__

安装完成后，我们可以将 __INLINE_CODE_165__ 导入到根 __INLINE_CODE_166__ 中。

__CODE_BLOCK_31__

__INLINE_CODE_167__ 方法支持 Sequelize 构造函数的所有配置属性 (__LINK_430__)，并且有多个额外的配置属性，如以下所示。

__HTML_TAG_310__
  __HTML_TAG_311__
    __HTML_TAG_312____HTML_TAG_313__retryAttempts__HTML_TAG_314____HTML_TAG_315__
    __HTML_TAG_316__连接到数据库的尝试次数（默认：__HTML_TAG_317__10__HTML_TAG_318__)__HTML_TAG_319__
  __HTML_TAG_320__
  __HTML_TAG_321__
    __HTML_TAG_322____HTML_TAG_323__retryDelay__HTML_TAG_324____HTML_TAG_325__
    __HTML_TAG_326__连接重试之间的延迟（ms）（默认：__HTML_TAG_327__3000__HTML_TAG_328__)__HTML_TAG_329__
  __HTML_TAG_330__
  __HTML_TAG_331__
    __HTML_TAG_332____HTML_TAG_333__autoLoadModels__HTML_TAG_334____HTML_TAG_335__
    __HTML_TAG_336__如果 __HTML_TAG_337__true__HTML_TAG_338__, 模型将被自动加载（默认：__HTML_TAG_339__false__HTML_TAG_340__)__HTML_TAG_341__
  __HTML_TAG_342__
  __HTML_TAG_343__
    __HTML_TAG_344____HTML_TAG_345__keepConnectionAlive__HTML_TAG_346____HTML_TAG_347__
    __HTML_TAG_348__如果 __HTML_TAG_349__true__HTML_TAG_350__, 连接将不会在应用程序关闭时关闭（默认：__HTML_TAG_351__false__HTML_TAG_352__)__HTML_TAG_353__
  __HTML_TAG_354__
  __HTML_TAG_355__
    __HTML_TAG_356____HTML_TAG_357__synchronize__HTML_TAG_358____HTML_TAG_359__
    __HTML_TAG_360__如果 __HTML_TAG_361__true__HTML_TAG_362__, 自动加载的模型将被同步（默认：__HTML_TAG_363__true__HTML_TAG_364__)__HTML_TAG_365__
  __HTML_TAG_366__
__HTML_TAG_367__

完成此操作后，__INLINE_CODE_168__ 对象将可在整个项目中注入（无需导入任何模块），例如：

__CODE_BLOCK_32__

#### 模型

Sequelize 实现了 Active Record 模式。使用该模式，您可以使用模型类直接与数据库交互。为了继续示例，我们需要至少一个模型。让我们定义 __INLINE_CODE_169__ 模型。

__CODE_BLOCK_33__

> 信息 **提示** 了解更多关于可用的装饰器 __LINK_431__。

__INLINE_CODE_170__ 模型文件位于 __INLINE_CODE_171__ 目录中。这目录中包含所有与 __INLINE_CODE_172__ 相关的文件。您可以决定将模型文件放在哪里，但是我们建议将它们放在与 **domain** 相关的模块目录中。

要使用 __INLINE_CODE_173__ 模型，我们需要让 Sequelize 知道它的存在，方法是将其插入 __INLINE_CODE_174__ 数组中，位于模块 __INLINE_CODE_175__ 方法选项中：

__CODE_BLOCK_34__

接下来，让我们来看看 __INLINE_CODE_176__：

__CODE_BLOCK_35__

这个模块使用 __INLINE_CODE_177__ 方法来定义当前作用域中的模型。这样，我们可以将 __INLINE_CODEHere is the translation of the English technical documentation to Chinese:

现在，如果我们将 __INLINE_CODE_184__ 导入到 __INLINE_CODE_185__ 中，我们可以在后者模块的提供者中使用 __INLINE_CODE_186__。

__CODE_BLOCK_38__

#### 关系

关系是建立在两个或多个表之间的关联。关系基于每个表的公共字段，通常涉及主键和外键。

有三个类型的关系：

__HTML_TAG_368__
  __HTML_TAG_369__
    __HTML_TAG_370____HTML_TAG_371__一对一__HTML_TAG_372____HTML_TAG_373__
    __HTML_TAG_374__每个主表的行都有且仅有一个关联的行在外键表中__HTML_TAG_375__
  __HTML_TAG_376__
  __HTML_TAG_377__
    __HTML_TAG_378____HTML_TAG_379__一对多 / 多对一__HTML_TAG_380____HTML_TAG_381__
    __HTML_TAG_382__每个主表的行都有一个或多个关联的行在外键表中__HTML_TAG_383__
  __HTML_TAG_384__
  __HTML_TAG_385__
    __HTML_TAG_386____HTML_TAG_387__多对多__HTML_TAG_388____HTML_TAG_389__
    __HTML_TAG_390__每个主表的行都有多个关联的行在外键表中，每个记录在外键表中都有多个关联的行在主表中__HTML_TAG_391__
  __HTML_TAG_392__
__HTML_TAG_393__

要在模型中定义关系，使用相应的**装饰器**。例如，要定义每个 __INLINE_CODE_187__ 可以有多张照片，使用 __INLINE_CODE_188__ 装饰器。

__CODE_BLOCK_39__

> info **提示** 为了了解更多关于 Sequelize 的关联，请阅读 __LINK_432__ 章节。

#### 自动加载模型

手动将模型添加到 __INLINE_CODE_189__ 数组中的连接选项中可以很麻烦。此外，引用模型从根模块中会破坏应用程序的域边界，并将实现细节泄露到应用程序的其他部分。为了解决这个问题，自动加载模型，可以将 __INLINE_CODE_190__ 和 __INLINE_CODE_191__ 属性设置为 __INLINE_CODE_193__，如下所示：

__CODE_BLOCK_40__

这样，通过 __INLINE_CODE_194__ 方法注册的每个模型都将被自动添加到 __INLINE_CODE_195__ 数组中的配置对象中。

> warning **警告** 请注意，不是通过 __INLINE_CODE_196__ 方法注册的模型，但是通过模型的关联引用到的模型不会被包含。

#### Sequelize 事务

数据库事务是指在数据库管理系统中执行的一组工作单元，它将在数据库中被处理成一个一致和可靠的单元。事务通常表示对数据库的任何更改（__LINK_433__）。

有许多不同的策略来处理 __LINK_434__。下面是一个 sample 实现的自动回调事务。

首先，我们需要将 __INLINE_CODE_197__ 对象注入到类中：

__CODE_BLOCK_41__

> info **提示** __INLINE_CODE_198__ 类来自 __INLINE_CODE_199__ 包。

现在，我们可以使用这个对象来创建事务。

__CODE_BLOCK_42__

> info **提示** 请注意，__INLINE_CODE_200__ 实例只用于启动事务。然而，要测试这个类将需要模拟整个 __INLINE_CODE_201__ 对象（它 expose 了多个方法）。因此，我们建议使用一个帮助工厂类（例如 __INLINE_CODE_202__）并定义一个接口具有保持事务所需的有限方法。这使得模拟这些方法变得非常简单。

#### 迁移

__LINK_435__ 提供了一种方法来incrementally 更新数据库架构，以保持数据库架构与应用程序数据模型同步，同时保留现有数据在数据库中的。要生成、运行和回退迁移，Sequelize 提供了一个 dedicated __LINK_436__。

迁移类与 Nest 应用程序源代码分开。它们的生命周期由 Sequelize CLI 维护。因此，你不能使用依赖注入和其他 Nest 特有的功能。要了解更多关于迁移，请阅读 __LINK_437__。

__HTML_TAG_394____HTML_TAG_395__

#### 多个数据库

一些项目需要多个数据库连接。这可以通过该模块实现。要工作于多个连接中，首先创建连接。在这种情况下，连接名称变得**强制要求**。

假设您有一个 __INLINE_CODE_203__ 实体存储在其自己的数据库中。

__CODE_BLOCK_43__

> warning **注意** 如果您没有设置 __INLINE_CODE_204__，连接的名称将设置为 __INLINE_CODE_205__。请注意，不应该有多个连接没有名称或同名的连接，否则它们将被 override。

I hope this translation meets your requirements. Please review it carefully to ensure it meets the technical documentation translation requirements.Here is the translation of the technical documentation to Chinese:

当你已经注册了__INLINE_CODE_206__和__INLINE_CODE_207__模型，并且它们都有自己的连接。在这种情况下，你需要告诉__INLINE_CODE_208__方法和__INLINE_CODE_209__装饰器应该使用哪个连接。如果你不传入连接名称，那么__INLINE_CODE_210__连接将被使用。

__CODE_BLOCK_44__

你也可以将__INLINE_CODE_211__实例注入到给定的连接中：

__CODE_BLOCK_45__

此外，你还可以将任何__INLINE_CODE_212__实例注入到提供者中：

__CODE_BLOCK_46__

#### 测试

当我们要测试一个应用程序时，我们通常想要避免建立数据库连接，以保持测试套件的独立性和执行速度。然而，我们的类可能依赖于从连接实例中获取的模型。那么，我们如何处理这种情况？解决方案是创建模拟模型。在 order to achieve this, we set up __LINK_438__.每个注册的模型都将被自动表示为一个__INLINE_CODE_213__令牌，其中__INLINE_CODE_214__是你的模型类名。

__LINK_438__包 exposes the __INLINE_CODE_216__ function which returns a prepared token based on a given model.

__CODE_BLOCK_47__

现在，将使用__INLINE_CODE_217__作为__INLINE_CODE_218__。当任何类使用__INLINE_CODE_219__装饰器来请求__INLINE_CODE_220__时，Nest 将使用注册的__INLINE_CODE_221__对象。

#### 异步配置

你可能想异步地传递你的__INLINE_CODE_222__选项，而不是静态地传递。在这种情况下，可以使用__INLINE_CODE_223__方法，该方法提供了多种方式来处理异步配置。

一种方法是使用工厂函数：

__CODE_BLOCK_48__

我们的工厂函数像任何其他__LINK_439__一样（例如，它可以__INLINE_CODE_224__并且可以通过__INLINE_CODE_225__注入依赖项）。

__CODE_BLOCK_49__

或者，你可以使用__INLINE_CODE_226__语法：

__CODE_BLOCK_50__

构造上述将在__INLINE_CODE_227__内实例化__INLINE_CODE_228__并使用它来提供选项对象，通过调用__INLINE_CODE_229__。请注意，这意味着__INLINE_CODE_230__必须实现__INLINE_CODE_231__接口，如下所示：

__CODE_BLOCK_51__

为了防止在__INLINE_CODE_232__中创建__INLINE_CODE_233__和使用来自不同模块的提供者，你可以使用__INLINE_CODE_234__语法。

__CODE_BLOCK_52__

这个构造与__INLINE_CODE_235__相同，唯一的区别是__INLINE_CODE_236__将查找导入的模块以重用现有的__INLINE_CODE_237__而不是实例化一个新的一个。

#### 示例

一个工作示例可以在__LINK_440__中找到。