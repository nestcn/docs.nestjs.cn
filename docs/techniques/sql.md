<!-- 此文件从 content/techniques/sql.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T05:05:07.874Z -->
<!-- 源文件: content/techniques/sql.md -->

### 数据库

Nest 是数据库中立的，可以轻松地与任何 SQL 或 NoSQL 数据库集成。你有多种选择，取决于你的喜好。从最基本的层面讲，连接 Nest 到数据库只是需要加载适当的 Node.js 驱动程序，正如你将做到的 __LINK_396__ 或 Fastify 一样。

你也可以直接使用任何通用的 Node.js 数据库集成 **库** 或 ORM，例如 __LINK_397__（见 __LINK_398__）， __LINK_399__（见 __LINK_400__）， __LINK_401__（见 __LINK_402__）， __LINK_403__，和 __LINK_404__（见 __LINK_405__），以操作更高层次的抽象。

为了方便，Nest 提供了紧密集成的 TypeORM 和 Sequelize，分别在 __INLINE_CODE_53__ 和 __INLINE_CODE_54__ 包中，涵盖了当前章节，我们将在下面讨论这些集成，这些集成提供了 NestJS-特定的功能，例如模型/存储库注入、可测试性和异步配置，使得访问你的选择数据库更加容易。

### TypeORM 集成

为了与 SQL 和 NoSQL 数据库集成，Nest 提供了 __INLINE_CODE_56__ 包。 __LINK_407__ 是 TypeScript 中最成熟的对象关系映射器（ORM）。由于它是使用 TypeScript 编写的，因此它与 Nest 框架集成良好。

要开始使用它，我们首先安装所需的依赖项。在本章中，我们将演示使用流行的 __LINK_408__ 关系数据库管理系统，但 TypeORM 支持许多关系数据库，例如 PostgreSQL、Oracle、Microsoft SQL Server、SQLite 和 NoSQL 数据库，如 MongoDB。我们在本章中展示的步骤将适用于 TypeORM 支持的任何数据库。你只需要安装关联的客户端 API 库以便你的选择数据库。

```shell
$ npm i cookie-parser
$ npm i -D @types/cookie-parser

```

安装过程完成后，我们可以在根 __INLINE_CODE_58__ 中导入 __INLINE_CODE_57__。

```typescript
import * as cookieParser from 'cookie-parser';
// somewhere in your initialization file
app.use(cookieParser());

```

> 警告 **Warning** 设置 __INLINE_CODE_59__ 在生产环境中 shouldn't - 否则你可能会丢失生产数据。

__INLINE_CODE_60__ 方法支持 __INLINE_CODE_61__ 构造函数中的所有配置属性，除此之外，还有多个额外的配置属性，如下所示。

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
    __HTML_TAG_264__如果 __HTML_TAG_265__true__HTML_TAG_266__，实体将自动加载（默认：__HTML_TAG_267__false__HTML_TAG_268__）__HTML_TAG_269__
  __HTML_TAG_270__
__HTML_TAG_271__

> 提示 **Hint** 了解更多关于数据源选项的信息 __LINK_410__。

一旦完成，这些 TypeORM __INLINE_CODE_62__ 和 __INLINE_CODE_63__ 对象将可供整个项目中的注入（不需要导入任何模块），例如：

```typescript
@Get()
findAll(@Req() request: Request) {
  console.log(request.cookies); // or "request.cookies['cookieKey']"
  // or console.log(request.signedCookies);
}

```

#### 仓储模式

__LINK_411__ 支持 **仓储设计模式**，因此每个实体都有自己的仓储。这些仓储可以从数据库数据源中获取。

继续示例，我们至少需要一个实体。让我们定义 __INLINE_CODE_64__ 实体。

```typescript
@Get()
findAll(@Res({ passthrough: true }) response: Response) {
  response.cookie('key', 'value')
}

```

> 提示 **Hint** 了解更多关于实体的信息在 __LINK_412__。

__INLINE_CODE_65__ 实体文件位于 __INLINE_CODE_66__ 目录中。这目录中包含所有与 __INLINE_CODE_67__ 相关的文件。你可以决定将模型文件保存在哪里，但是我们建议将它们保存在相应的模块目录中。

要开始使用 __INLINE_CODE_68__ 实体，我们需要让 TypeORM 知道它 existed by inserting it into the __INLINE_CODE_69__ array in the module __INLINE_CODE_70__ method options (unless you use a static glob path):

```shell
$ npm i @fastify/cookie

```

接下来，让我们看看 __INLINE_CODE_71__：

```typescript
import fastifyCookie from '@fastify/cookie';

// somewhere in your initialization file
const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
await app.register(fastifyCookie, {
  secret: 'my-secret', // for cookies signature
});

```

这个模块使用 __INLINE_CODE_72__ 方法来定义当前作用域中注册的仓储。现在，我们可以使用 __INLINE_CODE_73__ 装饰器将 __INLINE_CODE_74__ 注入到 __INLINE_CODE_75__：

```typescript
@Get()
findAll(@Req() request: FastifyRequest) {
  console.log(request.cookies); // or "request.cookies['cookieKey']"
}

```

> 警告 **Here is the translation of the provided English technical documentation to Chinese:

如果您想在非 __INLINE_CODE_78__ 模块中使用该仓库，您将需要重新导出由该模块生成的提供者。您可以通过导出整个模块来实现，如下所示：

```typescript
@Get()
findAll(@Res({ passthrough: true }) response: FastifyReply) {
  response.setCookie('key', 'value')
}

```

现在，如果我们在 __INLINE_CODE_80__ 中导入 __INLINE_CODE_79__,我们可以在 __INLINE_CODE_80__ 的提供者中使用 __INLINE_CODE_81__。

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Cookies = createParamDecorator((data: string, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return data ? request.cookies?.[data] : request.cookies;
});

```

#### 关系

关系是表之间的关联。关系基于每个表的公共字段，通常涉及到主键和外键。

有三种关系类型：

__HTML_TAG_272__
  __HTML_TAG_273__
    __HTML_TAG_274____HTML_TAG_275__一对一__HTML_TAG_276____HTML_TAG_277__
    __HTML_TAG_278__每个主表行都只有一个关联行在外表中。使用 __HTML_TAG_279__@OneToOne()__HTML_TAG_280__ 装饰器来定义这种关系__HTML_TAG_281__
  __HTML_TAG_282__
  __HTML_TAG_283__
    __HTML_TAG_284____HTML_TAG_285__一对多 / 多对一__HTML_TAG_286____HTML_TAG_287__
    __HTML_TAG_288__每个主表行都有多个关联行在外表中。使用 __HTML_TAG_289__@OneToMany()__HTML_TAG_290__ 和 __HTML_TAG_291__@ManyToOne()__HTML_TAG_292__ 装饰器来定义这种关系__HTML_TAG_293__
  __HTML_TAG_294__
  __HTML_TAG_295__
    __HTML_TAG_296____HTML_TAG_297__多对多__HTML_TAG_298____HTML_TAG_299__
    __HTML_TAG_300__每个主表行都有多个关联行在外表中，每个外表行都有多个关联行在主表中。使用 __HTML_TAG_301__@ManyToMany()__HTML_TAG_302__ 装饰器来定义这种关系__HTML_TAG_303__
  __HTML_TAG_304__
__HTML_TAG_305__

要在实体中定义关系，使用相应的 **装饰器**。例如，要定义每个 __INLINE_CODE_82__ 可以有多图像，使用 __INLINE_CODE_83__ 装饰器。

```typescript
@Get()
findAll(@Cookies('name') name: string) {}

```

> info **提示**要了解 TypeORM 关系，请访问 __LINK_413__。

#### 自动加载实体

手动将实体添加到数据源选项的 __INLINE_CODE_84__ 数组中可能很麻烦。此外，引用实体从根模块中会破坏应用程序域边界，并将实现细节泄露到应用程序其他部分。为了解决这个问题，提供了一个alternative解决方案。要自动加载实体，请将配置对象的 __INLINE_CODE_85__ 属性设置为 __INLINE_CODE_87__，如下所示：

__CODE_BLOCK_10__

使用该选项指定后，每个通过 __INLINE_CODE_88__ 方法注册的实体都会自动添加到配置对象的 __INLINE_CODE_89__ 数组中。

> warning **警告**请注意，不是通过 __INLINE_CODE_90__ 方法注册的实体，但是在实体中引用了的实体不会被 __INLINE_CODE_91__ 设置包含。

#### 分离实体定义

您可以在模型中定义实体和列，使用装饰器。但是有些人prefer 将实体和列定义在单独的文件中，使用 __LINK_414__。

__CODE_BLOCK_11__

> warning **警告**如果您提供了 __INLINE_CODE_92__ 选项，__INLINE_CODE_93__ 选项值必须与目标类名相同。如果您没有提供__INLINE_CODE_94__，可以使用任意名称。

Nest 允许您在 __INLINE_CODE_96__ 中使用 __INLINE_CODE_95__ 实例，例如：

__CODE_BLOCK_12__

#### TypeORM 事务

数据库事务是一个数据库管理系统中的一种单元工作，独立地对数据库进行更改。事务通常代表对数据库的任何更改（__LINK_415__）。

有很多不同的策略来处理 __LINK_416__。我们建议使用 __INLINE_CODE_97__ 类，因为它提供了对事务的完全控制。

首先，我们需要将 __INLINE_CODE_98__ 对象注入到类中，使用正常的方式：

__CODE_BLOCK_13__

> info **提示** __INLINE_CODE_99__ 类来自 __INLINE_CODE_100__ 包。

现在，我们可以使用这个对象来创建事务。

__CODE_BLOCK_14__

> info **提示**请注意，__INLINE_CODE_101__ 只用于创建 __INLINE_CODE_102__。然而，以测试该类需要模拟整个 __INLINE_CODE_103__ 对象（它暴露了多个方法）。因此，我们建议使用帮助工厂类（例如 __INLINE_CODE_104__）并定义一个包含少数方法的接口，以便维护事务。这使得模拟这些方法变得简单。

__HTML_TAG_306____HTML_TAG_307__

或者，您可以使用回调风格的方法，使用 __#### 订阅者

使用 TypeORM __LINK_418__, 可以监听特定的实体事件。

__CODE_BLOCK_16__

> 警告 **Warning** 事件订阅者不能被 __LINK_419__。

现在，添加 __INLINE_CODE_107__ 类到 __INLINE_CODE_108__ 数组中：

__CODE_BLOCK_17__

#### 数据库迁移

__LINK_420__ 提供了一种 incremental 更新数据库架构的方式，以保持数据库架构与应用程序数据模型同步，同时保留现有数据库数据。要生成、运行和撤销迁移，TypeORM 提供了专门的 __LINK_421__。

迁移类独立于 Nest 应用程序源代码。它们的生命周期由 TypeORM CLI 维护。因此，你不能使用依赖项注入和其他 Nest 特定的功能来迁移。要了解更多关于迁移的信息，请遵循 __LINK_422__ 指南。

#### 多个数据库

一些项目需要多个数据库连接。这也可以通过该模块实现。要使用多个连接，首先创建连接。在这种情况下，数据源命名变得 **必须**。

假设你有一个 __INLINE_CODE_109__ 实体，存储在其自己的数据库中。

__CODE_BLOCK_18__

> 警告 **Notice** 如果你没有为数据源设置 __INLINE_CODE_110__，那么它的名称将设置为 __INLINE_CODE_111__。请注意，你 shouldn't 有多个连接没有名称或者同名，否则它们将被覆盖。

> 警告 **Notice** 如果你使用 __INLINE_CODE_112__，你需要 **同时** 设置数据源名称外部 __INLINE_CODE_113__。例如：
>
> __CODE_BLOCK_19__
>
> 查看 __LINK_423__ 了解更多详细信息。

到目前为止，你已经注册了 __INLINE_CODE_114__ 和 __INLINE_CODE_115__ 实体，使用它们自己的数据源。使用这种设置，你需要告诉 __INLINE_CODE_116__ 方法和 __INLINE_CODE_117__ 装饰器使用哪个数据源。如果你不传递任何数据源名称，__INLINE_CODE_118__ 数据源将被使用。

__CODE_BLOCK_20__

你也可以注入 __INLINE_CODE_119__ 或 __INLINE_CODE_120__ Give 一个数据源：

__CODE_BLOCK_21__

此外，你还可以注入任何 __INLINE_CODE_121__ 到提供者：

__CODE_BLOCK_22__

#### 测试

当它来到单元测试一个应用程序时，我们通常想要避免建立数据库连接，以保持测试套件独立，并且尽量加快测试执行过程。但是，我们的类可能依赖于存储库，这些存储库从数据源（连接）实例中提取。那么，我们该如何处理？解决方案是创建 mock 存储库。在 order to achieve this，我们 setup __LINK_424__。每个注册的存储库都将自动表示为一个 __INLINE_CODE_122__ 标记，其中 __INLINE_CODE_123__ 是您的实体类名称。

__INLINE_CODE_124__ 包含 __INLINE_CODE_125__ 函数，该函数返回给定实体的预准备标记。

__CODE_BLOCK_23__

现在将使用 substitute __INLINE_CODE_126__ 作为 __INLINE_CODE_127__。在任何类请求 __INLINE_CODE_128__ 使用 __INLINE_CODE_129__ 装饰器时，Nest 将使用注册的 __INLINE_CODE_130__ 对象。

#### 异步配置

你可能想要异步地传递存储库模块选项，而不是静态地传递。使用 __INLINE_CODE_131__ 方法，可以实现异步配置。

一种方法是使用工厂函数：

__CODE_BLOCK_24__

我们的工厂像任何其他 __LINK_425__ 一样（例如，它可以被 __INLINE_CODE_132__ 并且可以注入依赖项通过 __INLINE_CODE_133__）。

__CODE_BLOCK_25__

Alternatively，你可以使用 __INLINE_CODE_134__ 语法：

__CODE_BLOCK_26__

构造上述将在 __INLINE_CODE_135__ 内部实例化 __INLINE_CODE_136__，并使用它来提供选项对象，通过调用 __INLINE_CODE_137__。请注意，__INLINE_CODE_138__ 必须实现 __INLINE_CODE_139__ 接口，如下所示：

__CODE_BLOCK_27__

为了防止在 __INLINE_CODE_141__ 内部创建 __INLINE_CODE_140__，并使用来自不同模块的提供者，你可以使用 __INLINE_CODE_142__ 语法。

__CODE_BLOCK_28__

这个构造方式与 __INLINE_CODE_143__ 一样，但有一点区别 - __INLINE_CODE_144__ 将 lookup 已经导入的模块，以复用已有的 __INLINE_CODE_145__ 而不是实例化一个新的。

> 提示 **Hint** 确保 __INLINE_CODE_146__ 属性在 __INLINE_CODE_147__、__INLINE_CODE_148__ 或 __INLINE_CODE_149__ 属性同级别下定义。这样 Nest 就可以正确地注册数据源到适当的注入 token 下。

#### 自定义 DataSource 工厂Here is the translation of the English technical documentation to Chinese:

在使用异步配置的同时，您可以选择提供一个 __INLINE_CODE_153__ 函数，以便提供自己的 TypeORM 数据源，而不是让 __INLINE_CODE_154__ 创建数据源。

__INLINE_CODE_155__ 接收 TypeORM __INLINE_CODE_156__ 配置在异步配置中使用 __INLINE_CODE_157__, __INLINE_CODE_158__ 或 __INLINE_CODE_159__时，并返回一个 __INLINE_CODE_160__，该对象将 TypeORM __INLINE_CODE_161__ 解析。

__CODE_BLOCK_29__

> 提示 **Hint** __INLINE_CODE_162__ 类来自 __INLINE_CODE_163__ 包。

#### 示例

可用的工作示例在 __LINK_426__。

__HTML_TAG_308____HTML_TAG_309__

### Sequelize集成

使用 TypeORM 的_alternative 是使用 __LINK_427__ ORM 和 __INLINE_CODE_164__ 包。另外，我们还使用了 __LINK_428__ 包，该包提供了一些用来声明实体的装饰器。

要开始使用它，我们首先安装所需的依赖项。在本章中，我们将演示使用流行的 __LINK_429__ 关系数据库管理系统，但是 Sequelize 提供了对许多关系数据库的支持，例如 PostgreSQL、MySQL、Microsoft SQL Server、SQLite 和 MariaDB。我们在本章中所演示的过程将是对任何支持 Sequelize 的数据库的相同过程。您只需要安装与您的选择数据库相关的客户端 API 库。

__CODE_BLOCK_30__

安装过程完成后，我们可以将 __INLINE_CODE_165__ 导入到根 __INLINE_CODE_166__ 中。

__CODE_BLOCK_31__

__INLINE_CODE_167__ 方法支持 Sequelize 构造函数 (__LINK_430__) 中 expose 的所有配置属性。此外，还有以下 extra 配置属性。

__HTML_TAG_310__
  __HTML_TAG_311__
    __HTML_TAG_312____HTML_TAG_313__retryAttempts__HTML_TAG_314____HTML_TAG_315__
    __HTML_TAG_316__连接数据库的尝试次数（默认：__HTML_TAG_317__10__HTML_TAG_318__)__HTML_TAG_319__
  __HTML_TAG_320__
  __HTML_TAG_321__
    __HTML_TAG_322____HTML_TAG_323__retryDelay__HTML_TAG_324____HTML_TAG_325__
    __HTML_TAG_326__连接重试之间的延迟（ms）（默认：__HTML_TAG_327__3000__HTML_TAG_328__)__HTML_TAG_329__
  __HTML_TAG_330__
  __HTML_TAG_331__
    __HTML_TAG_332____HTML_TAG_333__autoLoadModels__HTML_TAG_334____HTML_TAG_335__
    __HTML_TAG_336__如果 __HTML_TAG_337__true__HTML_TAG_338__，则将自动加载模型（默认：__HTML_TAG_339__false__HTML_TAG_340__)__HTML_TAG_341__
  __HTML_TAG_342__
  __HTML_TAG_343__
    __HTML_TAG_344____HTML_TAG_345__keepConnectionAlive__HTML_TAG_346____HTML_TAG_347__
    __HTML_TAG_348__如果 __HTML_TAG_349__true__HTML_TAG_350__，则连接将不会在应用程序关闭时关闭（默认：__HTML_TAG_351__false__HTML_TAG_352__)__HTML_TAG_353__
  __HTML_TAG_354__
  __HTML_TAG_355__
    __HTML_TAG_356____HTML_TAG_357__synchronize__HTML_TAG_358____HTML_TAG_359__
    __HTML_TAG_360__如果 __HTML_TAG_361__true__HTML_TAG_362__，则自动加载模型将被同步（默认：__HTML_TAG_363__true__HTML_TAG_364__)__HTML_TAG_365__
  __HTML_TAG_366__
__HTML_TAG_367__

完成后，__INLINE_CODE_168__ 对象将被 injections 到整个项目中（无需导入任何模块），例如：

__CODE_BLOCK_32__

#### 模型

Sequelize 实现了 Active Record 模式。使用该模式，您可以直接使用模型类来与数据库交互。为了继续示例，我们需要至少一个模型。让我们定义 __INLINE_CODE_169__ 模型。

__CODE_BLOCK_33__

> 提示 **Hint** 了解可用的装饰器 __LINK_431__。

__INLINE_CODE_170__ 模型文件位于 __INLINE_CODE_171__ 目录中。这目录包含所有与 __INLINE_CODE_172__ 相关的文件。您可以决定将模型文件放在哪里，但是我们建议将它们置于对应模块目录中。

要开始使用 __INLINE_CODE_173__ 模型，我们需要让 Sequelize 知道它的存在，方法是将其插入到模块 __INLINE_CODE_174__ 方法选项中的 __INLINE_CODE_175__ 数组中：

__CODE_BLOCK_34__

接下来，让我们查看 __INLINE_CODE_176__：

__CODE_BLOCK_35__

这个模块使用 __INLINE_CODE_177Here is the translation of the provided English technical documentation to Chinese:

如果我们在 __INLINE_CODE_184__ 中导入 __INLINE_CODE_185__,那么在后一个模块的提供者中我们可以使用 __INLINE_CODE_186__。

__CODE_BLOCK_38__

#### 关系

关系是两个或多个表之间的关联。关系是基于每个表的共同字段的，通常涉及到主键和外键。

有三种关系类型：

__HTML_TAG_368__
  __HTML_TAG_369__
    __HTML_TAG_370____HTML_TAG_371__一对一__HTML_TAG_372____HTML_TAG_373__
    __HTML_TAG_374__每个主表中的行都只有一个关联行在外表中__HTML_TAG_375__
  __HTML_TAG_376__
  __HTML_TAG_377__
    __HTML_TAG_378____HTML_TAG_379__一对多 / 多对一__HTML_TAG_380____HTML_TAG_381__
    __HTML_TAG_382__每个主表中的行都有一个或多个相关行在外表中__HTML_TAG_383__
  __HTML_TAG_384__
  __HTML_TAG_385__
    __HTML_TAG_386____HTML_TAG_387__多对多__HTML_TAG_388____HTML_TAG_389__
    __HTML_TAG_390__每个主表中的行都有多个相关行在外表中，而每个记录在外表中都有多个相关行在主表中__HTML_TAG_391__
  __HTML_TAG_392__
__HTML_TAG_393__

要在模型中定义关系，可以使用相应的**装饰器**。例如，要定义每个 __INLINE_CODE_187__ 可以有多个照片，可以使用 __INLINE_CODE_188__ 装饰器。

__CODE_BLOCK_39__

> info **提示** 如果想了解更多关于 Sequelize 关联的信息，请阅读 __LINK_432__ 章节。

#### 自动加载模型

手动将模型添加到连接选项的 __INLINE_CODE_189__ 数组中可能是繁琐的。此外，引用模型从根模块中会打破应用程序域边界，并导致其他应用程序部分泄露实现细节。为了解决这个问题，可以自动加载模型，设置连接配置对象的 __INLINE_CODE_190__ 和 __INLINE_CODE_191__ 属性为 __INLINE_CODE_193__，如以下所示：

__CODE_BLOCK_40__

使用该选项指定后，每个通过 __INLINE_CODE_194__ 方法注册的模型都会被自动添加到连接配置对象的 __INLINE_CODE_195__ 数组中。

> warning **警告** 请注意，通过 __INLINE_CODE_196__ 方法未注册的模型，但是在模型中引用了的，不能被包含。

#### Sequelize 事务

数据库事务象征着一个数据库管理系统中的一组工作单元，对该数据库进行一致和可靠的操作，独立于其他事务。事务通常表示对数据库的任何更改（__LINK_433__）。

有多种策略来处理 __LINK_434__。以下是一个样本实现的managed 事务（auto-callback）。

首先，我们需要将 __INLINE_CODE_197__ 对象注入到类中：

__CODE_BLOCK_41__

> info **提示** __INLINE_CODE_198__ 类来自 __INLINE_CODE_199__ 包。

现在，我们可以使用这个对象来创建事务。

__CODE_BLOCK_42__

> info **提示** 请注意，__INLINE_CODE_200__ 实例只用于启动事务。然而，对于测试这个类，需要模拟整个 __INLINE_CODE_201__ 对象（它 expose 多个方法）。因此，我们建议使用一个帮助工厂类（例如 __INLINE_CODE_202__）并定义一个接口，其中包含维护事务所需的有限方法。这使得模拟这些方法变得简单。

#### 迁移

__LINK_435__ 提供了一种方式来incrementally 更新数据库架构，以便在应用程序数据模型中保持数据库架构的一致性，同时保留数据库中的现有数据。要生成、运行和还原迁移，Sequelize 提供了一个专门的 __LINK_436__。

迁移类别是独立于 Nest 应用程序源代码的。它们的生命周期由 Sequelize CLI 维护。因此，你不能使用依赖注入和其他 Nest 特定功能来处理迁移。要了解更多关于迁移，请阅读 __LINK_437__。

__HTML_TAG_394____HTML_TAG_395__

#### 多个数据库

一些项目需要多个数据库连接。这也可以使用该模块。要使用多个连接，首先创建连接。在这种情况下，连接名称变得**必要**。

假设你有一个 __INLINE_CODE_203__ 实体存储在自己的数据库中。

__CODE_BLOCK_43__

> warning **注意** 如果你没有设置 __INLINE_CODE_204__，连接的名称将设置为 __INLINE_CODE_205__。请注意，你 shouldn't 有多个连接没有名称，或者有相同名称，否则它们将被覆盖。以下是翻译后的中文文档：

当前，您已经注册了 __INLINE_CODE_206__ 和 __INLINE_CODE_207__ 模型，各自具有自己的连接。这样，您需要告诉 __INLINE_CODE_208__ 方法和 __INLINE_CODE_209__ 装饰器使用哪个连接。如果您不传递连接名称， __INLINE_CODE_210__ 连接将被使用。

__CODE_BLOCK_44__

您也可以注入给定的连接中的 __INLINE_CODE_211__ 实例：

__CODE_BLOCK_45__

此外，您还可以将任何 __INLINE_CODE_212__ 实例注入到提供商中：

__CODE_BLOCK_46__

#### 测试

当我们想要单元测试一个应用程序时，我们通常想避免建立数据库连接，以保持我们的单元测试独立且执行速度快。但是，我们的类可能依赖于从连接实例中拉取的模型。那么，我们如何处理这个问题？解决方案是创建模拟模型。在 order to achieve this，我们需要设置 __LINK_438__。每个注册的模型都将自动表示为一个 __INLINE_CODE_213__ 令牌，其中 __INLINE_CODE_214__ 是您的模型类的名称。

__INLINE_CODE_215__ 包含 __INLINE_CODE_216__ 函数，该函数返回一个基于给定模型的预准备令牌。

__CODE_BLOCK_47__

现在，一个 substitute __INLINE_CODE_217__ 将被用作 __INLINE_CODE_218__。每当任何类使用 __INLINE_CODE_219__ 装饰器请求 __INLINE_CODE_220__ 时，Nest 将使用注册的 __INLINE_CODE_221__ 对象。

#### 异步配置

您可能想异步地传递您的 __INLINE_CODE_222__ 选项，而不是静态地传递。在这种情况下，可以使用 __INLINE_CODE_223__ 方法，该方法提供了多种方式来处理异步配置。

一种方法是使用工厂函数：

__CODE_BLOCK_48__

我们的工厂行为类似于任何其他 __LINK_439__（例如，它可以 __INLINE_CODE_224__ 并且可以通过 __INLINE_CODE_225__ 注入依赖项）。

__CODE_BLOCK_49__

或者，您可以使用 __INLINE_CODE_226__ 语法：

__CODE_BLOCK_50__

构建上述将在 __INLINE_CODE_227__ 内部实例化 __INLINE_CODE_228__ 并使用它来提供一个选项对象，然后调用 __INLINE_CODE_229__。请注意，这意味着 __INLINE_CODE_230__ 必须实现 __INLINE_CODE_231__ 接口，如下所示：

__CODE_BLOCK_51__

以防止在 __INLINE_CODE_232__ 内部创建 __INLINE_CODE_233__ 并使用来自不同模块的提供商，您可以使用 __INLINE_CODE_234__ 语法。

__CODE_BLOCK_52__

构建上述与 __INLINE_CODE_235__ 相同，但 __INLINE_CODE_236__ 将 lookup 导入模块以重用现有 __INLINE_CODE_237__ 而不是实例化新的一个。

#### 示例

可用的工作示例位于 __LINK_440__。