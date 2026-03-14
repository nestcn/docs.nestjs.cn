<!-- 此文件从 content/techniques/sql.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T04:51:12.201Z -->
<!-- 源文件: content/techniques/sql.md -->

### 数据库

Nest 是数据库不可知的，它允许您轻松地与任何 SQL 或 NoSQL 数据库集成。根据您的偏好，您有多种选择。从最基本的角度讲，连接 Nest 到数据库仅仅是一个加载适当的 Node.js 驱动程序的问题，就像您将使用 __LINK_396__ 或 Fastify 一样。

您也可以直接使用任何通用的 Node.js 数据库集成 **library** 或 ORM，例如 __LINK_397__（见 __LINK_398__）， __LINK_399__（见 __LINK_400__）， __LINK_401__（见 __LINK_402__）， __LINK_403__，和 __LINK_404__（见 __LINK_405__），以在更高的抽象层次上操作。

为了方便，Nest 提供了紧密的集成与 TypeORM 和 Sequelize，分别使用 __INLINE_CODE_53__ 和 __INLINE_CODE_54__ 包，Mongoose 使用 __INLINE_CODE_55__，这些集成提供了 NestJS-特定的功能，如模型/仓库注入、可测试性和异步配置，以使访问您的选择数据库变得更加轻松。

### TypeORM 集成

为了与 SQL 和 NoSQL 数据库集成，Nest 提供了 __INLINE_CODE_56__ 包。 __LINK_407__ 是为 TypeScript 编写的对象关系映射器（ORM），因此它与 Nest 框架集成良好。

要开始使用它，我们首先安装所需的依赖项。在本章中，我们将演示使用流行的 __LINK_408__ 关系数据库管理系统，但 TypeORM 提供了对许多关系数据库的支持，例如 PostgreSQL、Oracle、Microsoft SQL Server、SQLite 和 NoSQL 数据库如 MongoDB。我们在本章中将展示的步骤将适用于 TypeORM 支持的任何数据库。您只需要安装与您的选择数据库相关的客户端 API 库。

```shell
$ npm i cookie-parser
$ npm i -D @types/cookie-parser

```

安装过程完成后，我们可以将 __INLINE_CODE_57__ 导入到根 __INLINE_CODE_58__ 中。

```typescript
import * as cookieParser from 'cookie-parser';
// somewhere in your initialization file
app.use(cookieParser());

```

> 警告 **Warning** 设置 __INLINE_CODE_59__ 不应该在生产环境中使用 - 否则您可能会丢失生产数据。

__INLINE_CODE_60__ 方法支持 __INLINE_CODE_61__ 构造函数中的所有配置属性，除此之外，还有以下几个额外的配置属性。

__HTML_TAG_238__
  __HTML_TAG_239__
    __HTML_TAG_240____HTML_TAG_241__retryAttempts__HTML_TAG_242____HTML_TAG_243__
    __HTML_TAG_244__重试连接到数据库的次数（默认：__HTML_TAG_245__10__HTML_TAG_246__）__HTML_TAG_247__
  __HTML_TAG_248__
  __HTML_TAG_249__
    __HTML_TAG_250____HTML_TAG_251__retryDelay__HTML_TAG_252____HTML_TAG_253__
    __HTML_TAG_254__重试连接之间的延迟（ms）（默认：__HTML_TAG_255__3000__HTML_TAG_256__）__HTML_TAG_257__
  __HTML_TAG_258__
  __HTML_TAG_259__
    __HTML_TAG_260____HTML_TAG_261__autoLoadEntities__HTML_TAG_262____HTML_TAG_263__
    __HTML_TAG_264__如果 __HTML_TAG_265__true__HTML_TAG_266__，实体将被自动加载（默认：__HTML_TAG_267__false__HTML_TAG_268__）__HTML_TAG_269__
  __HTML_TAG_270__
__HTML_TAG_271__

> 提示 **Hint** 了解更多关于数据源选项的信息 __LINK_410__。

完成这步骤后，TypeORM 的 __INLINE_CODE_62__ 和 __INLINE_CODE_63__ 对象将可供整个项目中注入（无需导入任何模块），例如：

```typescript
@Get()
findAll(@Req() request: Request) {
  console.log(request.cookies); // or "request.cookies['cookieKey']"
  // or console.log(request.signedCookies);
}

```

#### 仓库模式

__LINK_411__ 支持 **仓库设计模式**，因此每个实体都有自己的仓库。这些仓库可以从数据库数据源中获取。

要继续示例，我们需要至少一个实体。让我们定义 __INLINE_CODE_64__ 实体。

```typescript
@Get()
findAll(@Res({ passthrough: true }) response: Response) {
  response.cookie('key', 'value')
}

```

> 提示 **Hint** 了解更多关于实体的信息 __LINK_412__。

__INLINE_CODE_65__ 实体文件位于 __INLINE_CODE_66__ 目录中。这目录中包含所有与 __INLINE_CODE_67__ 相关的文件。您可以决定将模型文件放在哪里，但是我们建议将它们放在与 **domain** 相关的模块目录中。

要开始使用 __INLINE_CODE_68__ 实体，我们需要让 TypeORM知道它，通过将其插入到 __INLINE_CODE_69__ 数组中在模块 __INLINE_CODE_70__ 方法选项中（除非您使用静态glob路径）。

```shell
$ npm i @fastify/cookie

```

接下来，让我们查看 __INLINE_CODE_71__：

```typescript
import fastifyCookie from '@fastify/cookie';

// somewhere in your initialization file
const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
await app.register(fastifyCookie, {
  secret: 'my-secret', // for cookies signature
});

```

这个模块使用 __INLINE_CODE_72__ 方法来定义当前范围内注册的仓库。现在，我们可以将 __INLINE_CODE_73__ 注入到 __INLINE_CODE_74__ 中使用 __INLINE_CODE_75__ 装饰器：

```typescript
@Get()
findAll(@Req() request: FastifyRequest) {
  console.log(request.cookies); // or "request.cookies['cookieKey']"
}

```

> 警告 **Notice** 不Here is the translation of the English technical documentation to Chinese:

如果您想在导入__INLINE_CODE_78__以外的模块中使用该仓库，您需要重新导出由它生成的提供者。
您可以使用以下方法导出整个模块：

```typescript
@Get()
findAll(@Res({ passthrough: true }) response: FastifyReply) {
  response.setCookie('key', 'value')
}

```

现在，如果我们在__INLINE_CODE_80__中导入__INLINE_CODE_79__,那么我们可以在__INLINE_CODE_79__的提供者中使用__INLINE_CODE_81__。

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Cookies = createParamDecorator((data: string, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return data ? request.cookies?.[data] : request.cookies;
});

```

#### 关联

关联是指两个或多个表之间的关联关系。关联基于每个表的共同字段，通常涉及到主键和外键。

有三种类型的关联：

__HTML_TAG_272__
  __HTML_TAG_273__
    __HTML_TAG_274____HTML_TAG_275__一对一__HTML_TAG_276____HTML_TAG_277__
    __HTML_TAG_278__每个主表的行都只有一个关联的行在外键表中。使用__HTML_TAG_279__@OneToOne()__HTML_TAG_280__装饰器来定义这种关联关系。
  __HTML_TAG_282__
  __HTML_TAG_283__
    __HTML_TAG_284____HTML_TAG_285__一对多/多对一__HTML_TAG_286____HTML_TAG_287__
    __HTML_TAG_288__每个主表的行都有一个或多个关联的行在外键表中。使用__HTML_TAG_289__@OneToMany()__HTML_TAG_290__和__HTML_TAG_291__@ManyToOne()__HTML_TAG_292__装饰器来定义这种关联关系。
  __HTML_TAG_294__
  __HTML_TAG_295__
    __HTML_TAG_296____HTML_TAG_297__多对多__HTML_TAG_298____HTML_TAG_299__
    __HTML_TAG_300__每个主表的行都有多个关联的行在外键表中，而每个记录在外键表中也都有多个关联的行在主表中。使用__HTML_TAG_301__@ManyToMany()__HTML_TAG_302__装饰器来定义这种关联关系。
  __HTML_TAG_304__
__HTML_TAG_305__

要在实体中定义关联，请使用相应的装饰器。例如，要定义每个__INLINE_CODE_82__可以有多个照片，请使用__INLINE_CODE_83__装饰器。

```typescript
@Get()
findAll(@Cookies('name') name: string) {}

```

> 信息 **提示** 欲了解更多关于 TypeORM 关联的信息，请访问__LINK_413__。

#### 自动加载实体

手动将实体添加到数据源选项的__INLINE_CODE_84__数组中可能会很麻烦。此外，引用实体从根模块中会导致应用程序域边界的泄露和实现细节的泄露。为了解决这个问题，提供了一个替代解决方案。在自动加载实体时，设置配置对象的__INLINE_CODE_85__属性为__INLINE_CODE_87__，如下所示：

__CODE_BLOCK_10__

使用该选项时，每个通过__INLINE_CODE_88__方法注册的实体都会自动添加到配置对象的__INLINE_CODE_89__数组中。

> 警告 **警告** 请注意，通过__INLINE_CODE_90__方法未注册的实体，但是在实体中引用了实体（通过关系），将不会通过__INLINE_CODE_91__设置被包含。

#### 分离实体定义

您可以在模型中定义实体和列，用装饰器。但是，一些人 prefers 定义实体和列在单独的文件中使用__LINK_414__。

__CODE_BLOCK_11__

> 警告 **警告** 如果您提供__INLINE_CODE_92__选项，__INLINE_CODE_93__选项值必须与目标类的名称相同。
> 如果您未提供__INLINE_CODE_94__，您可以使用任何名称。

Nest 允许您使用__INLINE_CODE_95__实例取代__INLINE_CODE_96__，例如：

__CODE_BLOCK_12__

#### TypeORM 事务

数据库事务是指在数据库管理系统中对数据库的单个操作，且在其他事务中独立处理。事务通常表示对数据库的任何更改(__LINK_415__）。

有许多不同的策略来处理__LINK_416__。我们建议使用__INLINE_CODE_97__类，因为它提供了对事务的完全控制。

首先，我们需要将__INLINE_CODE_98__对象注入到类中：

__CODE_BLOCK_13__

> 信息 **提示** __INLINE_CODE_99__类来自__INLINE_CODE_100__包。

现在，我们可以使用这个对象创建事务。

__CODE_BLOCK_14__

> 信息 **提示** 请注意,__INLINE_CODE_101__仅用于创建__INLINE_CODE_102__。然而，以测试这个类需要模拟整个__INLINE_CODE_103__对象（其中包含多个方法）。因此，我们建议使用助手工厂类（例如__INLINE_CODE_104__）并定义一个具有有限方法的接口，以便维护事务。这使得模拟这些方法变得简单。

__HTML_TAG_306____HTML_TAG_307__

或者，您#### 订阅者

使用 TypeORM __LINK_418__,可以监听特定实体事件。

__CODE_BLOCK_16__

> 警告 **Warning** 事件订阅者不能被 __LINK_419__。

现在，添加 __INLINE_CODE_107__ 类到 __INLINE_CODE_108__ 数组中：

__CODE_BLOCK_17__

#### 数据迁移

__LINK_420__ 提供了一种 incremental 更新数据库架构的方式，以保持架构与应用程序数据模型同步，同时保留数据库中的现有数据。要生成、运行和还原迁移，TypeORM 提供了专门的 __LINK_421__。

迁移类与 Nest 应用程序源代码分离。它们的生命周期由 TypeORM CLI 维护。因此，您不能使用依赖注入和其他 Nest 特定的功能与迁移。要了解更多关于迁移的信息，请遵循 __LINK_422__ 指南。

#### 多个数据库

一些项目需要多个数据库连接。这也可以使用该模块来实现。要使用多个连接，首先创建连接。在这种情况下，数据源名称变得 **必要**。

假设您有一个 __INLINE_CODE_109__ 实体，存储在其自己的数据库中。

__CODE_BLOCK_18__

> 警告 **Notice** 如果您没有为数据源设置 __INLINE_CODE_110__，那么其名称将被设置为 __INLINE_CODE_111__。请注意，您不能有多个连接没有名称或名称相同，否则它们将被覆盖。

> 警告 **Notice** 如果您使用 __INLINE_CODE_112__，您必须 **同时** 设置数据源名称外部 __INLINE_CODE_113__。例如：
>
> __CODE_BLOCK_19__
>
> 请查看 __LINK_423__ 获取更多详细信息。

在这个阶段，您已经 __INLINE_CODE_114__ 和 __INLINE_CODE_115__ 实体注册到自己的数据源中。使用这个设置，您需要告诉 __INLINE_CODE_116__ 方法和 __INLINE_CODE_117__ 装饰器使用哪个数据源。如果您不传递任何数据源名称，__INLINE_CODE_118__ 数据源将被使用。

__CODE_BLOCK_20__

您还可以注入 __INLINE_CODE_119__ 或 __INLINE_CODE_120__ 到特定数据源：

__CODE_BLOCK_21__

还可以注入 __INLINE_CODE_121__ 到提供者：

__CODE_BLOCK_22__

#### 测试

当测试一个应用程序时，我们通常想要避免建立数据库连接，以保持测试套件独立和执行过程尽快。然而，我们的类可能依赖于仓库，这些仓库来自数据源（连接）实例。如何处理这件事情？解决方案是创建 mock 仓库。在 order to achieve that，我们设置 __LINK_424__。每个注册的仓库都将自动表示为一个 __INLINE_CODE_122__ token，其中 __INLINE_CODE_123__ 是您的实体类名称。

__INLINE_CODE_124__ 包含 __INLINE_CODE_125__ 函数，该函数返回一个基于给定实体的准备好的 token。

__CODE_BLOCK_23__

现在，__INLINE_CODE_126__ 将被用作 __INLINE_CODE_127__。每当类请求 __INLINE_CODE_128__ 使用 __INLINE_CODE_129__ 装饰器时，Nest 将使用注册的 __INLINE_CODE_130__ 对象。

#### 异步配置

您可能想要异步传递您的仓库模块选项，而不是静态地传递。这种情况下，可以使用 __INLINE_CODE_131__ 方法，该方法提供了多种异步配置方式。

一种方法是使用工厂函数：

__CODE_BLOCK_24__

我们的工厂行为像任何其他 __LINK_425__（例如，它可以被 __INLINE_CODE_132__ 并可以注入依赖项通过 __INLINE_CODE_133__）。

__CODE_BLOCK_25__

或者，您可以使用 __INLINE_CODE_134__ 语法：

__CODE_BLOCK_26__

构建上述将在 __INLINE_CODE_136__ 内部实例化 __INLINE_CODE_135__ 并使用它来提供选项对象通过调用 __INLINE_CODE_137__。请注意，这意味着 __INLINE_CODE_138__ 必须实现 __INLINE_CODE_139__ 接口，如下所示：

__CODE_BLOCK_27__

为了防止在 __INLINE_CODE_141__ 内部创建 __INLINE_CODE_140__ 并使用来自不同模块的提供者，您可以使用 __INLINE_CODE_142__ 语法。

__CODE_BLOCK_28__

这个构建与 __INLINE_CODE_143__ 类似，但有一点不同 - __INLINE_CODE_144__ 将 lookup 已经存在的 __INLINE_CODE_145__ 而不是实例化一个新的。

> 提示 **Hint** 确保 __INLINE_CODE_146__ 属性定义在 __INLINE_CODE_147__、__INLINE_CODE_148__ 或 __INLINE_CODE_149__ 属性的同一级别上。这将允许 Nest 正确注册数据源到适当的注入 token。

#### 自定义数据源工厂Here is the translation of the provided documentation to Chinese:

**Sequelize Integration**

在使用 TypeORM 之前，还可以使用 __LINK_427__ ORM，结合 __INLINE_CODE_164__ 包。我们还使用 __LINK_428__ 包，该包提供了一组额外的装饰器，以声明式地定义实体。

要开始使用它，我们首先安装所需的依赖项。在本章中，我们将演示使用流行的 __LINK_429__ 关系数据库管理系统（Relational DBMS），但 Sequelize 支持许多关系数据库，例如 PostgreSQL、MySQL、Microsoft SQL Server、SQLite 和 MariaDB。我们在本章中所讲述的步骤将对任何由 Sequelize 支持的数据库都适用。您只需要安装与您的选择数据库相关的客户端 API 库。

**CODE BLOCK 30**

安装完成后，我们可以将 __INLINE_CODE_165__ 导入到根 __INLINE_CODE_166__ 中。

**CODE BLOCK 31**

__INLINE_CODE_167__ 方法支持 Sequelize 构造函数 (__LINK_430__) 中 expose 的所有配置属性。此外，还有一些额外的配置属性，如以下所示。

**HTML TAG 310**
  **HTML TAG 311**
    **HTML TAG 312** __retryAttempts__ **HTML TAG 314** __HTML_TAG_315__
    **HTML TAG 316** 连接数据库的尝试次数（默认：__HTML_TAG_317__10__HTML_TAG_318__) **HTML TAG 319**
  **HTML TAG 320**
  **HTML TAG 321**
    **HTML TAG 322** __retryDelay__ **HTML TAG 324** __HTML_TAG_325__
    **HTML TAG 326** 连接重试之间的延迟（ms）（默认：__HTML_TAG_327__3000__HTML_TAG_328__) **HTML TAG 329**
  **HTML TAG 330**
  **HTML TAG 331**
    **HTML TAG 332** __autoLoadModels__ **HTML TAG 334** __HTML_TAG_335__
    **HTML TAG 336** 如果 __HTML_TAG_337__ true __HTML_TAG_338__, 模型将自动加载（默认：__HTML_TAG_339__false__HTML_TAG_340__) **HTML TAG 341**
  **HTML TAG 342**
  **HTML TAG 343**
    **HTML TAG 344** __keepConnectionAlive__ **HTML TAG 346** __HTML_TAG_347__
    **HTML TAG 348** 如果 __HTML_TAG_349__ true __HTML_TAG_350__, 连接将不会在应用程序关闭时关闭（默认：__HTML_TAG_351__false__HTML_TAG_352__) **HTML TAG 353**
  **HTML TAG 354**
  **HTML TAG 355**
    **HTML TAG 356** __synchronize__ **HTML TAG 358** __HTML_TAG_359__
    **HTML TAG 360** 如果 __HTML_TAG_361__ true __HTML_TAG_362__, 自动加载的模型将同步（默认：__HTML_TAG_363__true__HTML_TAG_364__) **HTML TAG 365**
  **HTML TAG 366**
**HTML TAG 367**

完成这些步骤后，__INLINE_CODE_168__ 对象将可供在整个项目中注入（无需导入任何模块），例如：

**CODE BLOCK 32**

**Models**

Sequelize 实现了活动记录模式。在这个模式下，您可以使用模型类直接与数据库交互。为了继续示例，我们需要至少一个模型。让我们定义 __INLINE_CODE_169__ 模型。

**CODE BLOCK 33**

> info **Hint** 了解可用的装饰器 __LINK_431__。

__INLINE_CODE_170__ 模型文件位于 __INLINE_CODE_171__ 目录中。这目录包含所有与 __INLINE_CODE_172__ 相关的文件。您可以决定将模型文件保存在哪个目录下，但我们建议将它们保存在对应模块目录中。

要开始使用 __INLINE_CODE_173__ 模型，我们需要让 Sequelize 知道它是存在的，通过将其插入 __INLINE_CODE_174__ 数组中，位于模块 __INLINE_CODE_175__ 方法选项中：

**CODE BLOCK 34**

接下来，让我们查看 __INLINE_CODE_176__：

**CODE BLOCK 35**

这个模块使用 __INLINE_CODE_177__ 方法来定义当前作用域中注册的模型。这样，我们可以将 __INLINE_CODE_178__ 注入到 __INLINE_CODE_179__ 中，使用 __INLINE_CODE_180__ 装饰器：

**CODE BLOCK 36**

> warning **Notice** 不要忘记将 __INLINE_CODE_181__ 导入根 __INLINE_CODE_182__ 中。

如果您想在导入 __INLINE_CODE_183__ 的模块外部使用模型，您需要重新导出由它生成的提供商。
您可以使用以下方式重新导出：

**CODE BLOCK 37**Here is the translation of the English technical documentation to Chinese:

现在如果我们在 __INLINE_CODE_184__ 中导入 __INLINE_CODE_185__,那么我们可以在后者模块的提供者中使用 __INLINE_CODE_186__。

__CODE_BLOCK_38__

#### 关系

关系是两个或多个表之间的关联。关系基于每个表的共同字段，通常涉及到主键和外键。

有三种类型的关系：

__HTML_TAG_368__
  __HTML_TAG_369__
    __HTML_TAG_370____HTML_TAG_371__一对一__HTML_TAG_372____HTML_TAG_373__
    __HTML_TAG_374__每个主表的行都有且仅有一个关联的行在外表中__HTML_TAG_375__
  __HTML_TAG_376__
  __HTML_TAG_377__
    __HTML_TAG_378____HTML_TAG_379__一对多/多对一__HTML_TAG_380____HTML_TAG_381__
    __HTML_TAG_382__每个主表的行都有一个或多个与之相关的行在外表中__HTML_TAG_383__
  __HTML_TAG_384__
  __HTML_TAG_385__
    __HTML_TAG_386____HTML_TAG_387__多对多__HTML_TAG_388____HTML_TAG_389__
    __HTML_TAG_390__每个主表的行都有多个与之相关的行在外表中，每个记录在外表中都有多个与之相关的行在主表中__HTML_TAG_391__
  __HTML_TAG_392__
__HTML_TAG_393__

要在模型中定义关系，使用相应的**装饰器**。例如，要定义每个 __INLINE_CODE_187__ 可以有多个照片，使用 __INLINE_CODE_188__ 装饰器。

__CODE_BLOCK_39__

> 提示 **提示** 了解 Sequelize 关联的更多信息，阅读 __LINK_432__ 章节。

#### 自动加载模型

手动添加模型到连接选项的 __INLINE_CODE_189__ 数组中可能很麻烦。此外，引用模型从根模块中breaking 应用程序域边界并导致其他应用程序部分泄露实现细节。为了解决这个问题，自动加载模型通过将连接配置对象的 __INLINE_CODE_190__ 和 __INLINE_CODE_191__ 属性设置为 __INLINE_CODE_193__，如以下所示：

__CODE_BLOCK_40__

使用该选项时，每个通过 __INLINE_CODE_194__ 方法注册的模型都会自动添加到连接配置对象的 __INLINE_CODE_195__ 数组中。

> 警告 **警告** 请注意，不是通过 __INLINE_CODE_196__ 方法注册的模型，但是在模型中被引用（通过关联）的模型不会被包括。

#### Sequelize 事务

事务是数据库管理系统中一个数据库的工作单元，独立于其他事务处理。在事务中，我们可以将多个数据库操作作为一个工作单元处理。

有多种策略来处理 __LINK_434__。下面是一个示例实现的自动回调事务（managed transaction）。

首先，我们需要将 __INLINE_CODE_197__ 对象注入到一个类中：

__CODE_BLOCK_41__

> 提示 **提示** __INLINE_CODE_198__ 类来自 __INLINE_CODE_199__ 包。

现在，我们可以使用这个对象来创建事务。

__CODE_BLOCK_42__

> 提示 **提示** 请注意，__INLINE_CODE_200__ 实例只用于启动事务。但是，以便测试这个类，我们需要模拟整个 __INLINE_CODE_201__ 对象（它 expose 多个方法）。因此，我们建议使用一个帮助工厂类（例如 __INLINE_CODE_202__）并定义一个接口，其中包含维护事务所需的有限方法。这使得模拟这些方法变得简单。

#### 迁移

__LINK_435__ 提供了一种方式来增量更新数据库架构，以保持数据库架构与应用程序数据模型同步，同时保留数据库中的所有数据。Sequelize 提供了一个专门的 __LINK_436__ 来生成、运行和回退迁移。

迁移类与 Nest 应用程序源代码分开。它们的生命周期由 Sequelize CLI 维护。因此，你不能使用依赖注入和 Nest 特定的特性来迁移。了解迁移的更多信息，请阅读 __LINK_437__。

__HTML_TAG_394____HTML_TAG_395__

#### 多个数据库

一些项目需要多个数据库连接。使用该模块也可以实现这个功能。要使用多个连接，首先创建连接。在这种情况下，连接命名变得**必要**。

例如，你有一个 __INLINE_CODE_203__ 实体存储在其自己的数据库中。

__CODE_BLOCK_43__

> 警告 **注意** 如果你没有设置 __INLINE_CODE_204__，连接的名称将设置为 __INLINE_CODE_205__。请注意，你 shouldn't 有多个连接没有名称或同名，因为它们将被覆盖。以下是翻译后的中文技术文档：

在当前情况下，您已经注册了 __INLINE_CODE_206__ 和 __INLINE_CODE_207__ 模型，并且它们都有自己的连接。为了告知 __INLINE_CODE_208__ 方法和 __INLINE_CODE_209__ 装饰器使用哪个连接，可以传递连接名称。如果没有传递连接名称，则使用 __INLINE_CODE_210__ 连接。

__CODE_BLOCK_44__

您还可以注入给定的连接的 __INLINE_CODE_211__ 实例：

__CODE_BLOCK_45__

此外，也可以将 __INLINE_CODE_212__ 实例注入到提供者中：

__CODE_BLOCK_46__

#### 测试

当我们来到单元测试一个应用程序时，我们通常想避免建立数据库连接，使我们的测试套件独立且执行速度尽可能快。但是，我们的类可能依赖于从连接实例中pull出来的模型。那么，我们如何处理这个问题？解决方案是创建mock 模型。为了实现这个目标，我们可以设置 __LINK_438__。每个注册的模型都将自动由一个 __INLINE_CODE_213__ token表示，其中 __INLINE_CODE_214__ 是您的模型类名称。

__INLINE_CODE_216__ 包含了 __INLINE_CODE_217__ 函数，该函数返回基于给定模型的准备好的token。

__CODE_BLOCK_47__

现在，__INLINE_CODE_218__ 将会被用作 __INLINE_CODE_219__。每当类使用 __INLINE_CODE_220__ 装饰器请求 __INLINE_CODE_221__ 时，Nest 将使用注册的 __INLINE_CODE_221__ 对象。

#### 异步配置

您可能想异步地传递 __INLINE_CODE_222__ 选项，而不是静态地传递。在这种情况下，可以使用 __INLINE_CODE_223__ 方法，该方法提供了多种方式来处理异步配置。

一种方法是使用工厂函数：

__CODE_BLOCK_48__

我们的工厂行为像任何其他 __LINK_439__（例如，它可以被 __INLINE_CODE_224__ 并且可以通过 __INLINE_CODE_225__ 注入依赖项）。

__CODE_BLOCK_49__

Alternatively, you can use the __INLINE_CODE_226__ syntax:

__CODE_BLOCK_50__

上述构建将在 __INLINE_CODE_227__ 内部实例化 __INLINE_CODE_228__ 并使用它来提供选项对象，通过调用 __INLINE_CODE_229__。请注意，这意味着 __INLINE_CODE_230__ 需要实现 __INLINE_CODE_231__ 接口，如下所示：

__CODE_BLOCK_51__

为了防止在 __INLINE_CODE_232__ 中创建 __INLINE_CODE_233__ 和使用来自不同模块的提供者的 __INLINE_CODE_234__ 语法。

__CODE_BLOCK_52__

这两种构建方式都与 __INLINE_CODE_235__ 一样，但有一个关键的区别 - __INLINE_CODE_236__ 将查找导入的模块，以重用现有的 __INLINE_CODE_237__ 而不是实例化新的一个。

#### 示例

可用的工作示例可在 __LINK_440__ 中找到。