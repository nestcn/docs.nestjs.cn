<!-- 此文件从 content/techniques/sql.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T05:15:58.354Z -->
<!-- 源文件: content/techniques/sql.md -->

### 数据库

Nest 是数据库不可知的，可以轻松地与任何 SQL 或 NoSQL 数据库集成。你有多种选择，取决于你的喜好。在最基本的层面上，连接 Nest 到数据库只是加载适当的 Node.js 驱动程序，就像你将 __LINK_396__ 或 Fastify 一样。

你也可以直接使用任何通用 Node.js 数据库集成 **library** 或 ORM，例如 __LINK_397__（查看 __LINK_398__）、__LINK_399__（查看 __LINK_400__）、__LINK_401__（查看 __LINK_402__）、__LINK_403__和 __LINK_404__（查看 __LINK_405__），以操作更高级的抽象层。

为方便起见，Nest 提供了紧密集成 TypeORM 和 Sequelize，分别通过 __INLINE_CODE_53__ 和 __INLINE_CODE_54__ 包含的 packages，涵盖了当前章节，我们将在下面章节中详细介绍 Mongoose 和 __INLINE_CODE_55__，涵盖了 __LINK_406__。这些集成提供了 NestJS-专门的功能，例如模型/存储库注入、可测试性和异步配置，使得访问你的选择数据库变得更容易。

### TypeORM 集成

为了与 SQL 和 NoSQL 数据库集成，Nest 提供了 __INLINE_CODE_56__ 包含。 __LINK_407__ 是 TypeScript 中的 Object Relational Mapper（ORM），它与 Nest框架集成非常好。

要开始使用它，我们首先安装必要的依赖项。在本章中，我们将演示使用流行的 __LINK_408__ 关系数据库管理系统，但是 TypeORM 支持许多关系数据库，例如 PostgreSQL、Oracle、Microsoft SQL Server、SQLite 和甚至 NoSQL 数据库，如 MongoDB。我们在本章中将走过的过程将是对 TypeORM 支持的所有数据库的相同过程。你只需要安装关联客户端 API 库以选择的数据库。

```shell
$ npm i cookie-parser
$ npm i -D @types/cookie-parser

```

安装完成后，我们可以将 __INLINE_CODE_57__ 引入到根 __INLINE_CODE_58__ 中。

```typescript
import * as cookieParser from 'cookie-parser';
// somewhere in your initialization file
app.use(cookieParser());

```

> warning 提示：设置 __INLINE_CODE_59__ shouldn't 在生产环境中使用 - 否则你可能会失去生产数据。

__INLINE_CODE_60__ 方法支持 __INLINE_CODE_61__ 构造函数中的所有配置属性，除此之外，还有以下额外配置属性。

__HTML_TAG_238__
  __HTML_TAG_239__
    __HTML_TAG_240____HTML_TAG_241__retryAttempts__HTML_TAG_242____HTML_TAG_243__
    __HTML_TAG_244__连接到数据库的尝试次数（默认：__HTML_TAG_245__10__HTML_TAG_246__)__HTML_TAG_247__
  __HTML_TAG_248__
  __HTML_TAG_249__
    __HTML_TAG_250____HTML_TAG_251__retryDelay__HTML_TAG_252____HTML_TAG_253__
    __HTML_TAG_254__连接尝试之间的延迟（ms）（默认：__HTML_TAG_255__3000__HTML_TAG_256__)__HTML_TAG_257__
  __HTML_TAG_258__
  __HTML_TAG_259__
    __HTML_TAG_260____HTML_TAG_261__autoLoadEntities__HTML_TAG_262____HTML_TAG_263__
    __HTML_TAG_264__如果 __HTML_TAG_265__true__HTML_TAG_266__，实体将被自动加载（默认：__HTML_TAG_267__false__HTML_TAG_268__)__HTML_TAG_269__
  __HTML_TAG_270__
__HTML_TAG_271__

> info 提示：了解数据源选项 __LINK_410__。

完成后，TypeORM __INLINE_CODE_62__ 和 __INLINE_CODE_63__ 对象将可供注入整个项目中（无需导入任何模块），例如：

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

> info 提示：了解实体在 __LINK_412__ 中。

__INLINE_CODE_65__ 实体文件位于 __INLINE_CODE_66__ 目录中。这目录包含所有与 __INLINE_CODE_67__ 相关的文件。你可以决定将模型文件放在哪里，但是我们建议将它们放在对应的模块目录中。

要开始使用 __INLINE_CODE_68__ 实体，我们需要让 TypeORM 知道它的存在，通过在模块 __INLINE_CODE_70__ 方法选项中将它插入 __INLINE_CODE_69__ 数组中（除非你使用静态 glob 路径）。

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

这个模块使用 __INLINE_CODE_72__ 方法来定义当前作用域中注册的仓储。现在，我们可以将 __INLINE_CODE_73__ 注入到 __INLINE_CODE_74__ 使用 __INLINE_CODE_75__ 装饰器：

```typescript
@Get()
findAll(@Req() request: FastifyRequest) {
  console.log(request.cookies); // or "request.cookies['cookieKey']"
}

```

> warning 提示：不要忘记在根 __INLINE_CODE_77__ 中Here is the translation of the English technical documentation to Chinese:

如果您想在没有导入__INLINE_CODE_78__的仓库外使用该仓库，您需要重新导出由它生成的提供者。

可以通过导出整个模块来实现，如下所示：

```typescript
@Get()
findAll(@Res({ passthrough: true }) response: FastifyReply) {
  response.setCookie('key', 'value')
}

```

现在，如果我们在__INLINE_CODE_80__中导入__INLINE_CODE_79__,那么可以在__INLINE_CODE_79__的提供者中使用__INLINE_CODE_81__。

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Cookies = createParamDecorator((data: string, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return data ? request.cookies?.[data] : request.cookies;
});

```

### 关系

关系是建立在两个或多个表之间的关联关系。关系基于每个表中的公共字段，通常涉及到主键和外键。

有三种类型的关系：

__HTML_TAG_272__
  __HTML_TAG_273__
    __HTML_TAG_274____HTML_TAG_275__一对一__HTML_TAG_276____HTML_TAG_277__
    __HTML_TAG_278__每个主表中的每一行都与一个外表中的唯一行相关。使用@OneToOne()装饰器来定义这种关系__HTML_TAG_281__
  __HTML_TAG_282__
  __HTML_TAG_283__
    __HTML_TAG_284____HTML_TAG_285__一对多/多对一__HTML_TAG_286____HTML_TAG_287__
    __HTML_TAG_288__每个主表中的每一行都与外表中的多行相关。使用@OneToMany()和@ManyToOne()装饰器来定义这种关系__HTML_TAG_293__
  __HTML_TAG_294__
  __HTML_TAG_295__
    __HTML_TAG_296____HTML_TAG_297__多对多__HTML_TAG_298____HTML_TAG_299__
    __HTML_TAG_300__每个主表中的每一行都与外表中的多行相关，每个外表中的每一行都与主表中的多行相关。使用@ManyToMany()装饰器来定义这种关系__HTML_TAG_303__
  __HTML_TAG_304__
__HTML_TAG_305__

要在实体中定义关系，使用相应的装饰器。例如，要定义每个__INLINE_CODE_82__都可以有多个照片，使用@OneToMany()装饰器。

```typescript
@Get()
findAll(@Cookies('name') name: string) {}

```

> 提示 **Hint** 欲了解更多关于TypeORM关系的信息，请访问__LINK_413__。

### 自动加载实体

手动将实体添加到数据源选项的__INLINE_CODE_84__数组中可能很繁琐。此外，引用实体从根模块中也会导致应用程序领域边界的泄露和实现细节的泄露。为了解决这个问题，提供了一种alternative解决方案。要自动加载实体，请将配置对象的__INLINE_CODE_85__属性设置为__INLINE_CODE_87__，如下所示：

__CODE_BLOCK_10__

使用该选项指定了每个通过__INLINE_CODE_88__方法注册的实体都会被自动添加到配置对象的__INLINE_CODE_89__数组中。

> 警告 **Warning** 请注意，未通过__INLINE_CODE_90__方法注册的实体，但是在实体中被引用（通过关系）的实体不会被__INLINE_CODE_91__设置所包含。

### 分离实体定义

可以在模型中使用装饰器来定义实体和列。但是，一些人prefer将实体和列定义在单独的文件中，使用__LINK_414__。

__CODE_BLOCK_11__

> 警告错误 **Warning** 如果您提供__INLINE_CODE_92__选项，__INLINE_CODE_93__选项值必须与目标类名相同。
> 如果您不提供__INLINE_CODE_94__，您可以使用任意名称。

Nest允许您在__INLINE_CODE_96__中使用__INLINE_CODE_95__实例，例如：

__CODE_BLOCK_12__

### TypeORM事务

数据库事务象征的是在数据库管理系统中执行的单个工作单元，并且可以独立地处理其他事务。事务通常代表对数据库的任何更改（__LINK_415__）。

有许多不同的策略来处理__LINK_416__。我们建议使用__INLINE_CODE_97__类，因为它给了你完全控制事务。

首先，我们需要将__INLINE_CODE_98__对象注入到类中：

__CODE_BLOCK_13__

> 提示 **Hint** __INLINE_CODE_99__类来自__INLINE_CODE_100__包。

现在，我们可以使用这个对象来创建事务。

__CODE_BLOCK_14__

> 提示 **Hint** 请注意__INLINE_CODE_101__只用于创建__INLINE_CODE_102__。然而，为了测试这个类，需要模拟整个__INLINE_CODE_103__对象（它 expose了多个方法）。因此，我们建议使用帮助工厂类（例如__INLINE_CODE_104__）并定义一个接口具有限定方法，以便维护事务。这使得模拟这些方法变得非常简单。

__HTML_TAG_306____HTML_TAG_307__

Alternatively, you can use the callback-style approach with the __INLINE_CODE_105__ method of the __INLINE_CODE_106__ object (__LINK_417__).

__CODE_BLOCK_15__

I followed the translation requirements, keeping the code examples, variable names, function#### 订阅者

使用 TypeORM 的 __LINK_418__，可以监听特定实体事件。

__CODE_BLOCK_16__

> warning **警告** 事件订阅者不能 __LINK_419__。

现在，添加 __INLINE_CODE_107__ 类到 __INLINE_CODE_108__ 数组中：

__CODE_BLOCK_17__

#### 数据库迁移

__LINK_420__ 提供了一个增量更新数据库架构的方式，以保持架构与应用程序数据模型同步，同时保留现有数据。要生成、运行和撤消迁移，TypeORM 提供了一个专门的 __LINK_421__。

迁移类与 Nest 应用程序源代码分开。它们的生命周期由 TypeORM CLI 维护。因此，你不能使用依赖注入和其他 Nest 特定的功能来迁移。要了解更多关于迁移的信息，请遵循 __LINK_422__ 指南。

#### 多个数据库

一些项目需要多个数据库连接。这也可以使用该模块实现。要使用多个连接，首先创建连接。在这种情况下，数据源命名变得 **必要**。

假设你有一个 __INLINE_CODE_109__ 实体存储在自己的数据库中。

__CODE_BLOCK_18__

> warning **注意** 如果你没有为数据源设置 __INLINE_CODE_110__，那么它的名称将设置为 __INLINE_CODE_111__。请注意，你 shouldn't 有多个连接没有名称或同名，因为它们将被覆盖。

> warning **注意** 如果你使用 __INLINE_CODE_112__，你需要 **同时** 设置数据源名称在 __INLINE_CODE_113__ 外。例如：
>
> __CODE_BLOCK_19__
>
> 请查看 __LINK_423__ 获取更多信息。

到目前为止，你已经注册了 __INLINE_CODE_114__ 和 __INLINE_CODE_115__ 实体，使用它们自己的数据源。使用这种设置，你需要告诉 __INLINE_CODE_116__ 方法和 __INLINE_CODE_117__ 装饰器使用哪个数据源。如果你不传递数据源名称，__INLINE_CODE_118__ 数据源将被使用。

__CODE_BLOCK_20__

你也可以注入 __INLINE_CODE_119__ 或 __INLINE_CODE_120__ 到特定的数据源：

__CODE_BLOCK_21__

也可以注入任何 __INLINE_CODE_121__ 到提供商：

__CODE_BLOCK_22__

#### 测试

当我们来测试应用程序时，我们通常想要避免数据库连接，以保持测试套件独立并且执行过程尽快。然而，我们的类可能依赖于仓库，该仓库来自数据源（连接）实例。如何处理这个问题？解决方案是创建模拟仓库。在 order to achieve this, we set up __LINK_424__.每个注册的仓库都将自动表示为一个 __INLINE_CODE_122__ 令牌，其中 __INLINE_CODE_123__ 是你的实体类名称。

__INLINE_CODE_124__ 包含 __INLINE_CODE_125__ 函数，该函数返回一个基于给定实体的准备好的令牌。

__CODE_BLOCK_23__

现在将使用一个 substitute __INLINE_CODE_126__ 作为 __INLINE_CODE_127__。每当类 ask for __INLINE_CODE_128__ 使用 __INLINE_CODE_129__ 装饰器，Nest 将使用注册的 __INLINE_CODE_130__ 对象。

#### 异步配置

你可能想异步地传递你的仓库模块选项。这种情况下，可以使用 __INLINE_CODE_131__ 方法，该方法提供了多种方法来处理异步配置。

一种方法是使用工厂函数：

__CODE_BLOCK_24__

我们的工厂行为像任何其他 __LINK_425__ 一样（例如，它可以 __INLINE_CODE_132__ 并且可以注入依赖项）。

__CODE_BLOCK_25__

Alternatively, you can use the __INLINE_CODE_134__ syntax:

__CODE_BLOCK_26__

构造上述将在 __INLINE_CODE_136__ 中实例化 __INLINE_CODE_135__，并使用它来提供一个选项对象，通过调用 __INLINE_CODE_137__。请注意，这意味着 __INLINE_CODE_138__ 必须实现 __INLINE_CODE_139__ 接口，如下所示：

__CODE_BLOCK_27__

为了防止在 __INLINE_CODE_141__ 中创建 __INLINE_CODE_140__ 并使用来自不同模块的提供商，你可以使用 __INLINE_CODE_142__ 语法。

__CODE_BLOCK_28__

构造上述与 __INLINE_CODE_143__ 相同，但有一点区别 - __INLINE_CODE_144__ 将查找已导入模块以重用已存在的 __INLINE_CODE_145__ 而不是实例化新的一个。

> info **提示** 确保 __INLINE_CODE_146__ 属性在 __INLINE_CODE_147__、__INLINE_CODE_148__ 或 __INLINE_CODE_149__ 属性同级别上定义。这将允许 Nestorrectly 注册数据源在适当的注入令牌下。

#### 自定义数据源工厂Here is the translation of the English technical documentation to Chinese:

**async 配置**

使用 __INLINE_CODE_150__, __INLINE_CODE_151__ 或 __INLINE_CODE_152__ 可以选择性地指定一个 __INLINE_CODE_153__ 函数，以便提供自己的 TypeORM 数据源，而不是让 __INLINE_CODE_154__ 创建数据源。

__INLINE_CODE_155__ 接收 TypeORM __INLINE_CODE_156__ 在 async 配置中使用 __INLINE_CODE_157__, __INLINE_CODE_158__ 或 __INLINE_CODE_159__ 配置的结果，并返回一个 __INLINE_CODE_160__，从而解决 TypeORM __INLINE_CODE_161__。

__CODE_BLOCK_29__

> 提示 **Hint** __INLINE_CODE_162__ 类来自 __INLINE_CODE_163__ 包。

#### 示例

可用的工作示例在 __LINK_426__ 中。

__HTML_TAG_308____HTML_TAG_309__

### Sequelize �егра

使用 TypeORM 的_alternative_ 是使用 __LINK_427__ ORM 和 __INLINE_CODE_164__ 包。此外，我们还使用 __LINK_428__ 包，该包提供了一组额外的装饰器，以便声明式地定义实体。

开始使用它，我们首先安装所需的依赖项。在本章中，我们将演示使用流行的 __LINK_429__ 关系数据库管理系统，但 Sequelize  supports 多种关系数据库，例如 PostgreSQL、MySQL、Microsoft SQL Server、SQLite 和 MariaDB。我们在本章中将演示的步骤将适用于 Sequelize 支持的任何数据库。您只需要安装相关的客户端 API 库。

__CODE_BLOCK_30__

安装完成后，我们可以在根目录中导入 __INLINE_CODE_165__。

__CODE_BLOCK_31__

__INLINE_CODE_167__ 方法支持 Sequelize 构造函数暴露的所有配置属性 (__LINK_430__)。此外，还有多个额外的配置属性，以下是其中的一些。

__HTML_TAG_310__
  __HTML_TAG_311__
    __HTML_TAG_312____HTML_TAG_313__retryAttempts__HTML_TAG_314____HTML_TAG_315__
    __HTML_TAG_316__尝试连接数据库的次数（默认：__HTML_TAG_317__10__HTML_TAG_318__)__HTML_TAG_319__
  __HTML_TAG_320__
  __HTML_TAG_321__
    __HTML_TAG_322____HTML_TAG_323__retryDelay__HTML_TAG_324____HTML_TAG_325__
    __HTML_TAG_326__连接重试之间的延迟（ms）（默认：__HTML_TAG_327__3000__HTML_TAG_328__)__HTML_TAG_329__
  __HTML_TAG_330__
  __HTML_TAG_331__
    __HTML_TAG_332____HTML_TAG_333__autoLoadModels__HTML_TAG_334____HTML_TAG_335__
    __HTML_TAG_336__如果 __HTML_TAG_337__true__HTML_TAG_338__，模型将自动加载（默认：__HTML_TAG_339__false__HTML_TAG_340__)__HTML_TAG_341__
  __HTML_TAG_342__
  __HTML_TAG_343__
    __HTML_TAG_344____HTML_TAG_345__keepConnectionAlive__HTML_TAG_346____HTML_TAG_347__
    __HTML_TAG_348__如果 __HTML_TAG_349__true__HTML_TAG_350__，连接将不会在应用程序关闭时关闭（默认：__HTML_TAG_351__false__HTML_TAG_352__)__HTML_TAG_353__
  __HTML_TAG_354__
  __HTML_TAG_355__
    __HTML_TAG_356____HTML_TAG_357__synchronize__HTML_TAG_358____HTML_TAG_359__
    __HTML_TAG_360__如果 __HTML_TAG_361__true__HTML_TAG_362__，自动加载的模型将同步（默认：__HTML_TAG_363__true__HTML_TAG_364__)__HTML_TAG_365__
  __HTML_TAG_366__
__HTML_TAG_367__

完成这些步骤后，__INLINE_CODE_168__ 对象将可供整个项目中注入（不需要导入任何模块），例如：

__CODE_BLOCK_32__

#### 模型

Sequelize 实现了活动记录模式。使用该模式，您可以使用模型类直接与数据库交互。为了继续示例，我们至少需要一个模型。让我们定义 __INLINE_CODE_169__ 模型。

__CODE_BLOCK_33__

> 提示 **Hint** 了解可用的装饰器 __LINK_431__。

__INLINE_CODE_170__ 模型文件位于 __INLINE_CODE_171__ 目录中。该目录包含所有与 __INLINE_CODE_172__ 相关的文件。您可以决定将模型文件保存在哪里，但是我们建议将它们保存在它们的 **domain** 中，或者在对应的模块目录中。

开始使用 __INLINE_CODE_173__ 模型，我们需要让 Sequelize 知道它的存在，通过将其插入 __INLINE_CODE_174__ 数组中，在模块 __INLINE_CODE_175__ 方法选项中：

__CODE_BLOCK_34__

Here is the translation of the English technical documentation to Chinese:

现在如果我们在 __INLINE_CODE_184__ 中导入 __INLINE_CODE_185__,那么我们可以在 __INLINE_CODE_186__ 中使用该模块的 providers。

__CODE_BLOCK_38__

#### 关系

关系是两个或多个表之间的关联。关系是基于每个表的公共字段的，通常涉及到主键和外键。

有三种关系类型：

__HTML_TAG_368__
  __HTML_TAG_369__
    __HTML_TAG_370____HTML_TAG_371__One-to-one__HTML_TAG_372____HTML_TAG_373__
    __HTML_TAG_374__每个主表的行都有且只能有一个关联的行在外表中__HTML_TAG_375__
  __HTML_TAG_376__
  __HTML_TAG_377__
    __HTML_TAG_378____HTML_TAG_379__One-to-many / Many-to-one__HTML_TAG_380____HTML_TAG_381__
    __HTML_TAG_382__每个主表的行都有一个或多个关联的行在外表中__HTML_TAG_383__
  __HTML_TAG_384__
  __HTML_TAG_385__
    __HTML_TAG_386____HTML_TAG_387__Many-to-many__HTML_TAG_388____HTML_TAG_389__
    __HTML_TAG_390__每个主表的行都有多个关联的行在外表中，而每个记录在外表中都有多个关联的行在主表中__HTML_TAG_391__
  __HTML_TAG_392__
__HTML_TAG_393__

要在模型中定义关系，使用相应的**装饰器**。例如，要定义每个 __INLINE_CODE_187__ 可以有多个照片，使用 __INLINE_CODE_188__ 装饰器。

__CODE_BLOCK_39__

> 提示 **Hint** 为了了解 Sequelize 中的关联更多，阅读 __LINK_432__ 章节。

#### 自动加载模型

手动将模型添加到 __INLINE_CODE_189__ 数组中的连接选项中可能很麻烦。此外，引用模型从根模块中会破坏应用程序域边界，并且会将实现细节泄露到应用程序的其他部分。为了解决这个问题，可以自动加载模型，通过将 __INLINE_CODE_190__ 和 __INLINE_CODE_191__ 属性设置为 __INLINE_CODE_193__，如以下所示：

__CODE_BLOCK_40__

在设置该选项后，每个通过 __INLINE_CODE_194__ 方法注册的模型将被自动添加到 __INLINE_CODE_195__ 数组中的配置对象中。

> 警告 **Warning** 请注意，通过 __INLINE_CODE_196__ 方法未注册的模型，但是在模型中被引用（通过关联），将不会被包含。

#### Sequelize 事务

数据库事务是一个数据库管理系统中的一种工作单元，对数据库进行不可靠的更改。事务通常代表对数据库的任何更改（__LINK_433__）。

有很多不同的策略来处理 __LINK_434__。以下是一个 sample 实现的 managed 事务（auto-callback）。

首先，我们需要将 __INLINE_CODE_197__ 对象注入到一个类中：

__CODE_BLOCK_41__

> 提示 **Hint** __INLINE_CODE_198__ 类来自 __INLINE_CODE_199__ 包。

现在，我们可以使用这个对象来创建事务。

__CODE_BLOCK_42__

> 提示 **Hint** 请注意，__INLINE_CODE_200__ 实例只用于启动事务。但是，以便测试这个类，需要模拟整个 __INLINE_CODE_201__ 对象（它 expose 多个方法）。因此，我们建议使用一个 helper 工厂类（例如 __INLINE_CODE_202__），并定义一个限于事务维护的接口。这个技术使得 mock 这些方法变得非常简单。

#### 迁移

__LINK_435__ 提供了一种方法，以便incrementally 更新数据库 schema，以保持它与应用程序的数据模型同步，同时保留现有数据在数据库中。要生成、运行和撤销迁移，Sequelize 提供了一个专门的 __LINK_436__。

迁移类别是独立于 Nest 应用程序源代码的。它们的生命周期由 Sequelize CLI 维护。因此，你不能使用依赖注入和其他 Nest 特定的特性来迁移。要了解更多关于迁移的信息，请阅读 __LINK_437__。

__HTML_TAG_394____HTML_TAG_395__

#### 多个数据库

一些项目需要多个数据库连接。这也可以使用该模块实现。要使用多个连接，首先创建连接。在这种情况下，连接命名变得**强制**。

假设你有一个 __INLINE_CODE_203__ 实体存储在自己的数据库中。

__CODE_BLOCK_43__

> 警告 **注意** 如果你没有设置 __INLINE_CODE_204__ 对象的名称，它将被设置为 __INLINE_CODE_205__。请注意，你 shouldn't 有多个连接没有名称，或者同名，否则它们将被覆盖。以下是翻译后的中文文档：

在__INLINE_CODE_206__和__INLINE_CODE_207__模型之间注册了自己的连接。这样，你需要告知__INLINE_CODE_208__方法和__INLINE_CODE_209__装饰器使用哪个连接。如果您没有传递连接名称，__INLINE_CODE_210__连接将被使用。

__CODE_BLOCK_44__

您也可以注入给定连接的__INLINE_CODE_211__实例：

__CODE_BLOCK_45__

此外，也可以将任何__INLINE_CODE_212__实例注入到提供商中：

__CODE_BLOCK_46__

#### 测试

在单元测试一个应用程序时，我们通常想要避免建立数据库连接，以保持测试套件的独立性和执行速度。然而，我们的类可能依赖于从连接实例中拉取的模型。那么，我们该如何处理？解决方案是创建模拟模型。在这个过程中，我们设置了__LINK_438__。每个注册的模型都将自动由__INLINE_CODE_213__ token所代表，其中__INLINE_CODE_214__是您的模型类名称。

__INLINE_CODE_215__包提供了__INLINE_CODE_216__函数，该函数返回一个基于给定模型的准备好的 token。

__CODE_BLOCK_47__

现在，一个 substitute __INLINE_CODE_217__ 将被用作 __INLINE_CODE_218__。每当类使用 __INLINE_CODE_219__ 装饰器请求模型时，Nest 将使用注册的 __INLINE_CODE_221__ 对象。

#### 异步配置

您可能想异步传递 __INLINE_CODE_222__ 选项，而不是静态地传递。在这种情况下，可以使用 __INLINE_CODE_223__ 方法，该方法提供了多种方式来处理异步配置。

一种方法是使用工厂函数：

__CODE_BLOCK_48__

我们的工厂行为与任何 __LINK_439__ 一样（例如，它可以被 __INLINE_CODE_224__ 并且可以注入依赖项通过 __INLINE_CODE_225__）。

__CODE_BLOCK_49__

另外，也可以使用 __INLINE_CODE_226__ 语法：

__CODE_BLOCK_50__

构造上述将在 __INLINE_CODE_227__ 内部实例化 __INLINE_CODE_228__ 并使用它提供一个选项对象，通过调用 __INLINE_CODE_229__。请注意，这意味着 __INLINE_CODE_230__ 需要实现 __INLINE_CODE_231__ 接口，如下所示：

__CODE_BLOCK_51__

为了防止在 __INLINE_CODE_232__ 内部创建 __INLINE_CODE_233__ 并使用来自不同模块的提供商，可以使用 __INLINE_CODE_234__ 语法。

__CODE_BLOCK_52__

这个构造与 __INLINE_CODE_235__ 类似，但有一点关键的不同 - __INLINE_CODE_236__ 将 lookup 导入的模块以重用现有的 __INLINE_CODE_237__ 而不是实例化一个新的。

#### 例子

可用的工作示例在__LINK_440__中。