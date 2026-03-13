<!-- 此文件从 content/techniques/sql.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:59:47.850Z -->
<!-- 源文件: content/techniques/sql.md -->

### 数据库

Nest 是数据库无关的，允许您轻松地与任何 SQL 或 NoSQL 数据库集成。根据您的喜好，您有多种选择。从最基本的层面来看，连接 Nest 到数据库 simply 是加载适当的 Node.js 驱动程序，就像您将 __LINK_396__ 或 Fastify 一样。

您也可以直接使用任何通用的 Node.js 数据库集成库或 ORM，例如 __LINK_397__（请参阅 __LINK_398__）， __LINK_399__（请参阅 __LINK_400__）， __LINK_401__（请参阅 __LINK_402__）， __LINK_403__，和 __LINK_404__（请参阅 __LINK_405__），以在更高的抽象层次上操作。

出于方便起见，Nest 提供了与 TypeORM 和 Sequelize 的紧密集成，通过 __INLINE_CODE_53__ 和 __INLINE_CODE_54__ 包分别提供，这些集成在当前章节中将被涵盖，Mongoose 通过 __INLINE_CODE_55__，将在 __LINK_406__ 中涵盖。这些集成提供了 NestJS 特定的功能，如模型/存储库注入、可测试性和异步配置，以使访问您选择的数据库变得更容易。

### TypeORM 集成

要与 SQL 和 NoSQL 数据库集成，Nest 提供了 __INLINE_CODE_56__ 包。 __LINK_407__ 是 TypeScript 中最成熟的对象关系映射器（ORM）。由于它是使用 TypeScript 编写的，因此与 Nest 框架集成非常好。

要开始使用它，我们首先安装所需的依赖项。在本章中，我们将演示使用受欢迎的 __LINK_408__ 关系数据库管理系统，但是 TypeORM 支持许多关系数据库，如 PostgreSQL、Oracle、Microsoft SQL Server、SQLite 和甚至 NoSQL 数据库如 MongoDB。我们在本章中将走过的步骤将适用于 TypeORM 支持的任何数据库。您只需要安装关联客户端 API 库。

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

> 警告 **Warning** 设置 __INLINE_CODE_59__ 不应该在生产环境中使用 - 否则您可能会丢失生产数据。

__INLINE_CODE_60__ 方法支持由 __LINK_409__ 包中的 __INLINE_CODE_61__ 构造函数暴露的所有配置属性。此外，还有一些额外的配置属性描述在下面。

__HTML_TAG_238__
  __HTML_TAG_239__
    __HTML_TAG_240____HTML_TAG_241__retryAttempts__HTML_TAG_242____HTML_TAG_243__
    __HTML_TAG_244__连接数据库的尝试次数（默认：__HTML_TAG_245__10__HTML_TAG_246__）__HTML_TAG_247__
  __HTML_TAG_248__
  __HTML_TAG_249__
    __HTML_TAG_250____HTML_TAG_251__retryDelay__HTML_TAG_252____HTML_TAG_253__
    __HTML_TAG_254__连接重试尝试之间的延迟（毫秒）（默认：__HTML_TAG_255__3000__HTML_TAG_256__）__HTML_TAG_257__
  __HTML_TAG_258__
  __HTML_TAG_259__
    __HTML_TAG_260____HTML_TAG_261__autoLoadEntities__HTML_TAG_262____HTML_TAG_263__
    __HTML_TAG_264__如果 __HTML_TAG_265__true__HTML_TAG_266__，实体将被自动加载（默认：__HTML_TAG_267__false__HTML_TAG_268__）__HTML_TAG_269__
  __HTML_TAG_270__
__HTML_TAG_271__

> 提示 **Hint** 了解更多关于数据源选项的信息 __LINK_410__。

一旦完成，这将使 TypeORM 的 __INLINE_CODE_62__ 和 __INLINE_CODE_63__ 对象可供整体项目中的注入（无需导入任何模块），例如：

```typescript
@Get()
findAll(@Req() request: Request) {
  console.log(request.cookies); // or "request.cookies['cookieKey']"
  // or console.log(request.signedCookies);
}

```

#### 仓储模式

__LINK_411__ 支持 **仓储设计模式**，因此每个实体都有自己的仓储。这些仓储来自数据库数据源。

要继续示例，我们需要至少一个实体。让我们定义 __INLINE_CODE_64__ 实体。

```typescript
@Get()
findAll(@Res({ passthrough: true }) response: Response) {
  response.cookie('key', 'value')
}

```

> 提示 **Hint** 了解更多关于实体的信息 __LINK_412__。

__INLINE_CODE_65__ 实体文件位于 __INLINE_CODE_66__ 目录中。这目录包含所有与 __INLINE_CODE_67__ 相关的文件。您可以决定将模型文件保存在哪里，但是我们建议将它们保存在相应的模块目录中。

要开始使用 __INLINE_CODE_68__ 实体，我们需要让 TypeORM 知道它的存在，通过将其插入到模块 __INLINE_CODE_70__ 方法选项的 __INLINE_CODE_69__ 数组中（除非您使用静态 Glob 路径）：

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

这个模块使用 __INLINE_CODE_72__ 方法来定义当前作用域中注册Here is the translation of the provided English technical documentation to Chinese:

如果您想在未导入__INLINE_CODE_78__的模块中使用该仓库，您需要重新导出由该模块生成的提供者。

您可以通过导出整个模块来实现，如下所示：

```typescript
@Get()
findAll(@Res({ passthrough: true }) response: FastifyReply) {
  response.setCookie('key', 'value')
}

```

现在，如果我们在__INLINE_CODE_80__中导入__INLINE_CODE_79__,那么我们可以在__INLINE_CODE_81__中的提供者中使用__INLINE_CODE_81__。

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Cookies = createParamDecorator((data: string, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return data ? request.cookies?.[data] : request.cookies;
});

```

#### 关系

关系是两个或多个表之间的关联关系。关系基于每个表的共同字段，通常涉及到主键和外键。

有三个类型的关系：

__HTML_TAG_272__
  __HTML_TAG_273__
    __HTML_TAG_274____HTML_TAG_275__一对一__HTML_TAG_276____HTML_TAG_277__
    __HTML_TAG_278__每个主表中的行都与一个和只有一个关联的外表中的行相关。使用@OneToOne()装饰器来定义这种关系__HTML_TAG_281__
  __HTML_TAG_282__
  __HTML_TAG_283__
    __HTML_TAG_284____HTML_TAG_285__一对多/多对一__HTML_TAG_286____HTML_TAG_287__
    __HTML_TAG_288__每个主表中的行都与一个或多个关联的外表中的行相关。使用@OneToMany()和@ManyToOne()装饰器来定义这种关系__HTML_TAG_293__
  __HTML_TAG_294__
  __HTML_TAG_295__
    __HTML_TAG_296____HTML_TAG_297__多对多__HTML_TAG_298____HTML_TAG_299__
    __HTML_TAG_300__每个主表中的行都与多个关联的外表中的行相关，每个外表中的行也都与多个关联的主表中的行相关。使用@ManyToMany()装饰器来定义这种关系__HTML_TAG_303__
  __HTML_TAG_304__
__HTML_TAG_305__

要在实体中定义关系，使用相应的装饰器。例如，要定义每个__INLINE_CODE_82__可以有多张照片，用@OneToMany()装饰器。

```typescript
@Get()
findAll(@Cookies('name') name: string) {}

```

> 信息 **提示** 了解TypeORM关系的更多信息，请访问__LINK_413__。

#### 自动加载实体

手动将实体添加到数据源选项的__INLINE_CODE_84__数组中可能会很麻烦。此外，引用实体从根模块中会破坏应用程序域边界，导致在应用程序其他部分中泄露实现细节。为了解决这个问题，提供了一个 Alternative 解决方案。要自动加载实体，请将配置对象的__INLINE_CODE_85__属性设置为__INLINE_CODE_87__，如下所示：

__CODE_BLOCK_10__

使用该选项指定后，每个通过__INLINE_CODE_88__方法注册的实体都将被自动添加到配置对象的__INLINE_CODE_89__数组中。

> 警告 **警告** 请注意，不通过__INLINE_CODE_90__方法注册的实体，但是在实体中引用了的实体不会被__INLINE_CODE_91__设置包含。

#### 分离实体定义

您可以在模型中使用装饰器定义实体和列。但是，有些人更喜欢在单独的文件中定义实体和列使用__LINK_414__。

__CODE_BLOCK_11__

> 警告错误 **警告** 如果您提供了__INLINE_CODE_92__选项，__INLINE_CODE_93__选项值必须与目标类的名称相同。
> 如果您不提供__INLINE_CODE_94__，可以使用任意名称。

Nest允许您在__INLINE_CODE_96__中使用__INLINE_CODE_95__实例，例如：

__CODE_BLOCK_12__

#### TypeORM事务

数据库事务是指在数据库管理系统中对数据库进行的一组工作，并且对这些工作进行一致和可靠的处理。事务通常表示对数据库中的任何更改（__LINK_415__）。

有许多不同的策略来处理__LINK_416__。我们建议使用__INLINE_CODE_97__类，因为它提供了对事务的完全控制。

首先，我们需要将__INLINE_CODE_98__对象注入到类中：

__CODE_BLOCK_13__

> 信息 **提示** __INLINE_CODE_99__类来自__INLINE_CODE_100__包。

现在，我们可以使用这个对象创建事务。

__CODE_BLOCK_14__

> 信息 **提示** 请注意,__INLINE_CODE_101__只用于创建__INLINE_CODE_102__。然而，在测试这个类时，我们需要模拟整个__INLINE_CODE_103__对象（该对象 expose 多个方法）。因此，我们建议使用一个 helper 工厂类（例如__INLINE_CODE_104__）并定义一个带有限方法的接口，以便于模拟这些方法。这使得模拟这些方法变得非常简单。

__HTML_TAG_306____HTML_TAG_307__

或者，您可以使用__INLINE_CODE_105__方法的回调风格approach__INLINE_CODE_106__对象__LINK_417__。

__CODE_BLOCK_15__

#### 订阅者

使用 TypeORM __LINK_418__,您可以监听特定实体事件。

__CODE_BLOCK_16__

> 警告 **Warning** 事件订阅者不能被 __LINK_419__。

现在，添加 __INLINE_CODE_107__ 类到 __INLINE_CODE_108__ 数组中：

__CODE_BLOCK_17__

#### 数据库迁移

__LINK_420__ 提供了一种方式来 incremental 更新数据库schema，以保持数据库 schema 与应用程序数据模型同步，同时保留现有数据库数据。要生成、运行和撤销迁移，TypeORM 提供了专门的 __LINK_421__。

迁移类独立于 Nest 应用程序源代码。它们的生命周期由 TypeORM CLI 维护。因此，您不能使用依赖注入和其他 Nest 特定特性来迁移。要了解更多关于迁移的信息，请遵循 __LINK_422__。

#### 多个数据库

一些项目需要多个数据库连接。这也可以使用该模块实现。要工作于多个连接中，首先创建连接。在这种情况下，数据源名称变得 **必要**。

假设您有一个 __INLINE_CODE_109__ 实体，存储在自己的数据库中。

__CODE_BLOCK_18__

> 警告 **注意** 如果您没有为数据源设置 __INLINE_CODE_110__，那么它的名称将被设置为 __INLINE_CODE_111__。请注意，您 shouldn't 有多个连接没有名称或同名，否则它们将被 overridden。

> 警告 **注意** 如果您正在使用 __INLINE_CODE_112__，则您需要 **同时** 设置数据源名称外 __INLINE_CODE_113__。例如：
>
> __CODE_BLOCK_19__
>
> 请见 __LINK_423__ 以获取更多详细信息。

现在，您已经注册了 __INLINE_CODE_114__ 和 __INLINE_CODE_115__ 实体，以便使用自己的数据源。使用这种设置，您需要告诉 __INLINE_CODE_116__ 方法和 __INLINE_CODE_117__ 装饰器使用哪个数据源。如果您不传递数据源名称， __INLINE_CODE_118__ 数据源将被使用。

__CODE_BLOCK_20__

您也可以 inject __INLINE_CODE_119__ 或 __INLINE_CODE_120__ 到特定数据源中：

__CODE_BLOCK_21__

还可以 inject 任意 __INLINE_CODE_121__ 到提供者中：

__CODE_BLOCK_22__

#### 测试

当我们想对应用程序进行单元测试时，我们通常想避免建立数据库连接，使测试套件独立，并尽快地执行测试过程。但是，我们的类可能依赖于仓库，该仓库是从数据源（连接）实例中获取的。那么，我们如何处理这个问题？解决方案是创建模拟仓库。在 order to achieve this，我们设置 __LINK_424__。每个注册的仓库都将自动表示为一个 __INLINE_CODE_122__ 令牌，其中 __INLINE_CODE_123__ 是您的实体类名称。

__INLINE_CODE_124__ 包含 __INLINE_CODE_125__ 函数，该函数返回一个基于给定实体的准备好的令牌。

__CODE_BLOCK_23__

现在，我们将使用 __INLINE_CODE_126__ 作为 __INLINE_CODE_127__。每当类请求 __INLINE_CODE_128__ 使用 __INLINE_CODE_129__ 装饰器时，Nest 将使用注册的 __INLINE_CODE_130__ 对象。

#### 异步配置

您可能想将您的仓库模块选项异步传递，而不是静态传递。在这种情况下，使用 __INLINE_CODE_131__ 方法，该方法提供了多种方式来处理异步配置。

一种方法是使用工厂函数：

__CODE_BLOCK_24__

我们的工厂 behaves_like任何其他 __LINK_425__（例如，它可以 __INLINE_CODE_132__ 并通过 __INLINE_CODE_133__ 注入依赖项）。

__CODE_BLOCK_25__

或者，您可以使用 __INLINE_CODE_134__ 语法：

__CODE_BLOCK_26__

构造上述将在 __INLINE_CODE_135__ 中实例化 __INLINE_CODE_136__ 并使用它来提供选项对象，通过调用 __INLINE_CODE_137__。请注意，这意味着 __INLINE_CODE_138__ 必须实现 __INLINE_CODE_139__ 接口，如下所示：

__CODE_BLOCK_27__

为了防止在 __INLINE_CODE_140__ 中实例化 __INLINE_CODE_141__ 并使用来自不同模块的提供者，您可以使用 __INLINE_CODE_142__ 语法。

__CODE_BLOCK_28__

构造上述与 __INLINE_CODE_143__相同，但有一点区别 - __INLINE_CODE_144__ 将 lookup 已经导入的模块以重用一个 __INLINE_CODE_145__ 而不是实例化一个新的。

> 提示 **Hint** 确保 __INLINE_CODE_146__ 属性定义在 __INLINE_CODE_147__、__INLINE_CODE_148__ 或 __INLINE_CODE_149__ 属性同一级别上。这将使 Nest 能够正确地注册数据源到合适的注入令牌下。

#### 自定义 DataSource 工厂Here is the translation of the provided English technical documentation to Chinese, following the specified guidelines:

在使用 __INLINE_CODE_150__, __INLINE_CODE_151__ 或 __INLINE_CODE_152__ 配置异步时，您可以选择性地指定一个 __INLINE_CODE_153__ 函数，以便提供自己的 TypeORM 数据源，而不是让 __INLINE_CODE_154__ 创建数据源。

__INLINE_CODE_155__ 接收 TypeORM __INLINE_CODE_156__ 在异步配置中使用 __INLINE_CODE_157__, __INLINE_CODE_158__ 或 __INLINE_CODE_159__ 配置的信息，并返回一个 __INLINE_CODE_160__，该对象解决 TypeORM __INLINE_CODE_161__。

__CODE_BLOCK_29__

> info **提示** __INLINE_CODE_162__ 类来自 __INLINE_CODE_163__ 包。

#### 示例

可用的示例 __LINK_426__。

__HTML_TAG_308____HTML_TAG_309__

### Sequelize 集成

使用 TypeORM 的alternative 是使用 __LINK_427__ ORM 与 __INLINE_CODE_164__ 包。另外，我们还使用了 __LINK_428__ 包，该包提供了一组额外的装饰器来声明性地定义实体。

开始使用它，我们首先安装所需的依赖项。在本章中，我们将演示使用流行的 __LINK_429__ 关系数据库管理系统，但 Sequelize 支持多种关系数据库，如 PostgreSQL、MySQL、Microsoft SQL Server、SQLite 和 MariaDB。我们在本章中走过的过程将是对任何支持 Sequelize 的数据库的相同过程。您需要安装关联客户端 API 库以供您的选择数据库。

__CODE_BLOCK_30__

安装过程完成后，我们可以将 __INLINE_CODE_165__ 导入到根 __INLINE_CODE_166__。

__CODE_BLOCK_31__

__INLINE_CODE_167__ 方法支持 Sequelize 构造函数的所有配置属性（__LINK_430__），此外，还有一些额外的配置属性描述于下面。

__HTML_TAG_310__
  __HTML_TAG_311__
    __HTML_TAG_312____HTML_TAG_313__retryAttempts__HTML_TAG_314____HTML_TAG_315__
    __HTML_TAG_316__连接数据库的尝试次数（默认：__HTML_TAG_317__10__HTML_TAG_318__)__HTML_TAG_319__
  __HTML_TAG_320__
  __HTML_TAG_321__
    __HTML_TAG_322____HTML_TAG_323__retryDelay__HTML_TAG_324____HTML_TAG_325__
    __HTML_TAG_326__连接重试尝试之间的延迟（毫秒）（默认：__HTML_TAG_327__3000__HTML_TAG_328__)__HTML_TAG_329__
  __HTML_TAG_330__
  __HTML_TAG_331__
    __HTML_TAG_332____HTML_TAG_333__autoLoadModels__HTML_TAG_334____HTML_TAG_335__
    __HTML_TAG_336__如果 __HTML_TAG_337__ true__HTML_TAG_338__, 模型将被自动加载（默认：__HTML_TAG_339__false__HTML_TAG_340__)__HTML_TAG_341__
  __HTML_TAG_342__
  __HTML_TAG_343__
    __HTML_TAG_344____HTML_TAG_345__keepConnectionAlive__HTML_TAG_346____HTML_TAG_347__
    __HTML_TAG_348__如果 __HTML_TAG_349__ true__HTML_TAG_350__, 连接将不会在应用程序关闭时关闭（默认：__HTML_TAG_351__false__HTML_TAG_352__)__HTML_TAG_353__
  __HTML_TAG_354__
  __HTML_TAG_355__
    __HTML_TAG_356____HTML_TAG_357__synchronize__HTML_TAG_358____HTML_TAG_359__
    __HTML_TAG_360__如果 __HTML_TAG_361__ true__HTML_TAG_362__, 自动加载的模型将被同步（默认：__HTML_TAG_363__true__HTML_TAG_364__)__HTML_TAG_365__
  __HTML_TAG_366__
__HTML_TAG_367__

这样做后，__INLINE_CODE_168__ 对象将可供整个项目中注入（不需要导入任何模块），例如：

__CODE_BLOCK_32__

#### 模型

Sequelize 实现了活动记录模式。在这个模式中，您使用模型类直接与数据库交互。为了继续示例，我们需要至少一个模型。让我们定义 __INLINE_CODE_169__ 模型。

__CODE_BLOCK_33__

> info **提示** 了解更多关于可用的装饰器 __LINK_431__。

__INLINE_CODE_170__ 模型文件位于 __INLINE_CODE_171__ 目录中。这目录包含所有与 __INLINE_CODE_172__ 相关的文件。您可以决定将模型文件存储在哪里，但是我们建议将它们存储在它们的 **域** 中，或者在相应的模块目录中。

要开始使用 __INLINE_CODE_173__ 模型，我们需要让 Sequelize knew about 它们，通过将它们插入 __INLINE_CODE_174__ 数组中，模块 __INLINE_CODE_Here is the translation of the English technical documentation to Chinese:

现在如果我们在 __INLINE_CODE_184__ 中导入 __INLINE_CODE_185__,那么我们可以在 __INLINE_CODE_186__ 中使用该模块的提供者。

__CODE_BLOCK_38__

#### 关系

关系是指两个或多个表之间的关联。关系基于每个表中的共同字段，通常涉及到主键和外键。

有三种类型的关系：

__HTML_TAG_368__
  __HTML_TAG_369__
    __HTML_TAG_370____HTML_TAG_371__一对一__HTML_TAG_372____HTML_TAG_373__
    __HTML_TAG_374__每个主表中的行都只有一个关联的行在外键表中__HTML_TAG_375__
  __HTML_TAG_376__
  __HTML_TAG_377__
    __HTML_TAG_378____HTML_TAG_379__一对多 / 多对一__HTML_TAG_380____HTML_TAG_381__
    __HTML_TAG_382__每个主表中的行都有一个或多个相关行在外键表中__HTML_TAG_383__
  __HTML_TAG_384__
  __HTML_TAG_385__
    __HTML_TAG_386____HTML_TAG_387__多对多__HTML_TAG_388____HTML_TAG_389__
    __HTML_TAG_390__每个主表中的行都有多个相关行在外键表中，每个记录在外键表中都有多个相关行在主表中__HTML_TAG_391__
  __HTML_TAG_392__
__HTML_TAG_393__

要在模型中定义关系，使用相应的**装饰器**。例如，要定义每个 __INLINE_CODE_187__ 可以有多个照片，使用 __INLINE_CODE_188__ 装饰器。

__CODE_BLOCK_39__

>提示 **提示** 了解 Sequelize 中的关联，可以阅读 __LINK_432__ 章节。

#### 自动加载模型

手动将模型添加到 __INLINE_CODE_189__ 数组中的连接选项中可能很麻烦。此外，引用模型从根模块中破坏了应用程序的域边界，导致实现细节泄露到应用程序的其他部分。为了解决这个问题，可以自动加载模型，设置 __INLINE_CODE_190__ 和 __INLINE_CODE_191__ 属性为 __INLINE_CODE_193__，如下所示：

__CODE_BLOCK_40__

有了这个选项指定，每个通过 __INLINE_CODE_194__ 方法注册的模型都将自动添加到 __INLINE_CODE_195__ 数组中。

>警告 **警告** 请注意，不是通过 __INLINE_CODE_196__ 方法注册的模型，但是在模型中被引用（通过关联）的模型将不被包含。

#### Sequelize 事务

事务是指在数据库管理系统中对数据库的单个操作，并将其独立地处理，以确保事务的可靠性。事务通常表示数据库中的一些变化（__LINK_433__）。

有许多不同的策略来处理 __LINK_434__。以下是一个自动回调事务的示例实现。

首先，我们需要将 __INLINE_CODE_197__ 对象注入到类中，以便在正常情况下使用：

__CODE_BLOCK_41__

>提示 **提示** __INLINE_CODE_198__ 类来自 __INLINE_CODE_199__ 包。

现在，我们可以使用这个对象来创建事务。

__CODE_BLOCK_42__

>提示 **提示** 请注意，__INLINE_CODE_200__ 实例只用于启动事务。然而，为了测试这个类，我们需要模拟整个 __INLINE_CODE_201__ 对象（它公开了多个方法）。因此，我建议使用帮助工厂类（例如 __INLINE_CODE_202__）并定义一个接口，仅包含保持事务的必要方法。这使得模拟这些方法变得简单。

#### 迁移

__LINK_435__ 提供了将数据库架构更新到与应用程序数据模型同步的方法，同时保留现有数据在数据库中的。要生成、运行和 revert 迁移，Sequelize 提供了专门的 __LINK_436__。

迁移类别与 Nest 应用程序的源代码分开。它们的生命周期由 Sequelize CLI 维护。因此，你不能使用依赖注入和其他 Nest 特有的功能来管理迁移。要了解更多关于迁移，可以阅读 __LINK_437__ 指南。

__HTML_TAG_394____HTML_TAG_395__

#### 多个数据库

一些项目需要多个数据库连接。这也可以使用该模块实现。要工作于多个连接中，首先创建连接。在这种情况下，连接名称变得**必要**。

假设你有一个 __INLINE_CODE_203__ 实体存储在自己的数据库中。

__CODE_BLOCK_43__

>注意 **注意** 如果你没有设置 __INLINE_CODE_204__，连接的名称将设置为 __INLINE_CODE_205__。请注意，不应该有多个没有名称的连接，或者同名的连接，否则它们将被覆盖。以下是根据提供的技术文档翻译后的中文版本：

在这个点，我已经注册了 __INLINE_CODE_206__ 和 __INLINE_CODE_207__ 模型，并且它们都有自己的连接。为了告诉 __INLINE_CODE_208__ 方法和 __INLINE_CODE_209__ 装饰器使用哪个连接，可以传入连接的名称。如果不传入连接名称，__INLINE_CODE_210__ 连接将被使用。

__CODE_BLOCK_44__

你也可以注入给定的连接的 __INLINE_CODE_211__ 实例：

__CODE_BLOCK_45__

此外，还可以将任何 __INLINE_CODE_212__ 实例注入到提供者中：

__CODE_BLOCK_46__

#### 测试

当我们来到单元测试一个应用程序时，我们通常想避免连接数据库，保持我们的测试套件独立，并尽量减少执行过程的时间。然而，我们的类可能依赖于模型，它们来自连接实例。那么，我们如何处理这个问题？解决方案是创建 mock 模型。在实现这个目标，我们可以设置 __LINK_438__。每个注册的模型都自动由一个 __INLINE_CODE_213__ 令牌表示，其中 __INLINE_CODE_214__ 是你的模型类的名称。

__INLINE_CODE_215__ 包含 __INLINE_CODE_216__ 函数，该函数返回一个基于给定模型的准备好的令牌。

__CODE_BLOCK_47__

现在，一个替代 __INLINE_CODE_217__ 将被用作 __INLINE_CODE_218__。当任何类使用 __INLINE_CODE_219__ 装饰器请求 __INLINE_CODE_220__ 时，Nest 将使用注册的 __INLINE_CODE_221__ 对象。

#### 异步配置

你可能想异步传递 __INLINE_CODE_222__ 选项，而不是静态地传递。在这种情况下，可以使用 __INLINE_CODE_223__ 方法，该方法提供了多种方式来处理异步配置。

一种方式是使用工厂函数：

__CODE_BLOCK_48__

我们的工厂行为像任何其他 __LINK_439__一样（例如，它可以 __INLINE_CODE_224__，并且可以通过 __INLINE_CODE_225__ 注入依赖项）。

__CODE_BLOCK_49__

Alternatively, you can use the __INLINE_CODE_226__ syntax:

__CODE_BLOCK_50__

上述构造将在 __INLINE_CODE_227__ 中实例化 __INLINE_CODE_228__，并使用它来提供选项对象，通过调用 __INLINE_CODE_229__。请注意，这意味着 __INLINE_CODE_230__ 必须实现 __INLINE_CODE_231__ 接口，如下所示：

__CODE_BLOCK_51__

为了防止在 __INLINE_CODE_232__ 中创建 __INLINE_CODE_233__ 并使用来自不同模块的提供者，你可以使用 __INLINE_CODE_234__ 语法。

__CODE_BLOCK_52__

这个构造与 __INLINE_CODE_235__ 类似，唯一的区别在于 __INLINE_CODE_236__ 将在导入模块中查找重用 __INLINE_CODE_237__ 而不是实例化新的一个。

#### 示例

有一个工作示例可在 __LINK_440__ 中查看。