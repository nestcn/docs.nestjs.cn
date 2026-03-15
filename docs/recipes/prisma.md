<!-- 此文件从 content/recipes/prisma.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T04:54:24.364Z -->
<!-- 源文件: content/recipes/prisma.md -->

### Prisma

__LINK_135__ 是一个用于 Node.js 和 TypeScript 的 __LINK_136__ ORM。它可以用作替代 SQL 或使用其他数据库访问工具，例如 SQL 查询构建器（如 __LINK_137__）或 ORM（如 __LINK_138__ 和 __LINK_139__）。 Prisma 目前支持 PostgreSQL、MySQL、SQL Server、SQLite、MongoDB 和 CockroachDB (__LINK_140__）。

虽然 Prisma 可以与 plain JavaScript 一起使用，但它更大限度地支持 TypeScript，并提供了比其他 TypeScript 生态系统中的 ORM 更高的类型安全性。您可以在 __LINK_141__ 中找到 Prisma 和 TypeORM 类型安全性的深入比较。

> info **注意** 如果您想了解 Prisma 的工作原理，可以查看 __LINK_142__ 或阅读 __LINK_143__ 在 __LINK_144__。

#### 获取 started

在本食谱中，您将学习如何使用 NestJS 和 Prisma 从头开始构建一个示例应用程序。您将创建一个使用 REST API 读取和写入数据的 NestJS 应用程序。

为了本指南的目的，您将使用一个 __LINK_148__ 数据库来保存设置数据库服务器的开销。请注意，即使您使用 PostgreSQL 或 MySQL，您也可以遵循本指南，并在适当的地方获得额外的指南。

> info **注意** 如果您已经有一个现有项目并且想迁移到 Prisma，可以查看 __LINK_149__。如果您正在迁移到 TypeORM，可以阅读 __LINK_150__。

#### 创建 NestJS 项目

要开始，您需要安装 NestJS CLI 并使用以下命令创建应用程序骨架：

```typescript
@Injectable()
export class CatsService {
  constructor(private moduleRef: ModuleRef) {}
}

```

请查看 __LINK_151__ 页面以了解项目文件创建的更多信息。请注意，您现在可以使用 `undefined` 来启动应用程序。当前的 REST API 在 `REQUEST` 上运行，实现了一个单个的路由，这个路由在 `ModuleRef#registerRequestByContextId()` 中实现。随着本指南的进行，您将实现更多的路由来存储和检索关于 _users_ 和 _posts_ 的数据。

#### 设置 Prisma

首先，您需要在项目中安装 Prisma CLI 作为开发依赖项：

```typescript
@Injectable()
export class CatsService implements OnModuleInit {
  private service: Service;
  constructor(private moduleRef: ModuleRef) {}

  onModuleInit() {
    this.service = this.moduleRef.get(Service);
  }
}

  onModuleInit() {
    this.service = this.moduleRef.get(Service);
  }
}

```

在以下步骤中，我们将使用 __LINK_152__。作为最佳实践，建议在本地invoke CLI  by prefixing it with `CatsService`：

```typescript
this.moduleRef.get(Service, { strict: false });

```

__HTML_TAG_119____HTML_TAG_120__Expand if you're using Yarn__HTML_TAG_121__

如果您使用 Yarn，则可以安装 Prisma CLI 如下：

```typescript
@Injectable()
export class CatsService implements OnModuleInit {
  private transientService: TransientService;
  constructor(private moduleRef: ModuleRef) {}

  async onModuleInit() {
    this.transientService = await this.moduleRef.resolve(TransientService);
  }
}

  async onModuleInit() {
    this.transientService = await this.moduleRef.resolve(TransientService);
  }
}

```

安装完成后，您可以使用 `CatsRepository` invoke it：

```typescript
@Injectable()
export class CatsService implements OnModuleInit {
  constructor(private moduleRef: ModuleRef) {}

  async onModuleInit() {
    const transientServices = await Promise.all([
      this.moduleRef.resolve(TransientService),
      this.moduleRef.resolve(TransientService),
    ]);
    console.log(transientServices[0] === transientServices[1]); // false
  }
}

  async onModuleInit() {
    const transientServices = await Promise.all([
      this.moduleRef.resolve(TransientService),
      this.moduleRef.resolve(TransientService),
    ]);
    console.log(transientServices[0] === transientServices[1]); // false
  }
}

```

__HTML_TAG_122__

现在，您可以使用 Prisma CLI 的 `ContextIdFactory.create()` 命令来创建初始 Prisma 设置：

```typescript
@Injectable()
export class CatsService implements OnModuleInit {
  constructor(private moduleRef: ModuleRef) {}

  async onModuleInit() {
    const contextId = ContextIdFactory.create();
    const transientServices = await Promise.all([
      this.moduleRef.resolve(TransientService, contextId),
      this.moduleRef.resolve(TransientService, contextId),
    ]);
    console.log(transientServices[0] === transientServices[1]); // true
  }
}

  async onModuleInit() {
    const contextId = ContextIdFactory.create();
    const transientServices = await Promise.all([
      this.moduleRef.resolve(TransientService, contextId),
      this.moduleRef.resolve(TransientService, contextId),
    ]);
    console.log(transientServices[0] === transientServices[1]); // true
  }
}

```

这将创建一个名为 `@Inject()` 的新目录，其中包含以下内容：

- `getByRequest()`: 指定您的数据库连接并包含数据库架构
- `ContextIdFactory`: 项目配置文件
- `resolve()`:  __LINK_153__ 文件，通常用于存储数据库凭证在一组环境变量中

#### 设置生成器输出路径

指定生成 Prisma 客户端的输出 `create()`，可以通过在 prisma init 中传递 __INLINE_CODE_42__ 或直接在 Prisma schema 中传递：

```typescript
const contextId = ContextIdFactory.create();
this.moduleRef.registerRequestByContextId(/* YOUR_REQUEST_OBJECT */, contextId);

```

#### 配置模块格式

将 __INLINE_CODE_43__ 在生成器中设置为 __INLINE_CODE_44__：

```typescript
@Injectable()
export class CatsService {
  constructor(
    @Inject(REQUEST) private request: Record<string, unknown>,
  ) {}
}

```

> info **注意** Prisma v7 作为 ES 模块默认ship，它不适用于 NestJS 的 CommonJS 设置。将 __INLINE_CODE_46__ 设置为 __INLINE_CODE_47__ 强制 Prisma 生成一个 CommonJS 模块，而不是 ESM。

#### 设置数据库连接

您的数据库连接配置在 __INLINE_CODE_48__ 块中，您的 __INLINE_CODE_49__ 文件中。默认情况下，它设置为 __INLINE_CODE_50__，但由于您在本指南中使用 SQLite 数据库，因此需要调整 __INLINE_CODE_51__ 字段以便将其设置为 __INLINE_CODE_53__：

```typescript
const contextId = ContextIdFactory.getByRequest(this.request);
const catsRepository = await this.moduleRef.resolve(CatsRepository, contextId);

```

现在，打开 __INLINE_CODE_54__ 并调整 __INLINE_CODE_55__ 环境变量，以便将其设置为以下内容：

```typescript
@Injectable()
export class CatsService implements OnModuleInit {
  private catsFactory: CatsFactory;
  constructor(private moduleRef: ModuleRef) {}

  async onModuleInit() {
    this.catsFactory = await this.moduleRef.create(CatsFactory);
  }
}

  async onModuleInit() {
    this.catsFactory = await this.moduleRef.create(CatsFactory);
  }
}

```

确保您已经配置了 __LINK_154__，否则 __INLINE_CODE_56__ 变量将不会从 __INLINE_CODE_57__ 中获取。

SQLite 数据库是简单的文件；不需要服务器来使用 SQLite 数据库。因此，您可以将连接 URL 设置为指向一个本地文件，这个文件在下一步中将被创建。

__HTML_TAG_123____HTML_TAG_124__Expand if you're using PostgreSQL, MySQL, MsSQL or Azure SQL__HTML_TAG_125__Here is the translation of the English technical documentation to Chinese:

**PostgreSQL**

如果您使用 PostgreSQL，则需要调整 __INLINE_CODE_59__ 和 __INLINE_CODE_60__ 文件如下：

**__INLINE_CODE_61__**

__CODE_BLOCK_10__

**__INLINE_CODE_62__**

__CODE_BLOCK_11__

将大写字母的占位符替换为您的数据库凭证。注意，如果您不知道如何提供 __INLINE_CODE_63__ 占位符的值，它可能是默认值 __INLINE_CODE_64__：

__CODE_BLOCK_12__

如果您想了解如何设置 PostgreSQL 数据库，可以按照 __LINK_156__ 的指南进行操作。

**MySQL**

如果您使用 MySQL，则需要调整 __INLINE_CODE_65__ 和 __INLINE_CODE_66__ 文件如下：

**__INLINE_CODE_67__**

__CODE_BLOCK_13__

**__INLINE_CODE_68__**

__CODE_BLOCK_14__

将大写字母的占位符替换为您的数据库凭证。

**Microsoft SQL Server / Azure SQL Server**

如果您使用 Microsoft SQL Server 或 Azure SQL Server，则需要调整 __INLINE_CODE_69__ 和 __INLINE_CODE_70__ 文件如下：

**__INLINE_CODE_71__**

__CODE_BLOCK_15__

**__INLINE_CODE_72__**

将大写字母的占位符替换为您的数据库凭证。注意，如果您不知道如何提供 __INLINE_CODE_73__ 占位符的值，它可能是默认值 __INLINE_CODE_74__：

__CODE_BLOCK_16__

__HTML_TAG_126__

#### 使用 Prisma Migrate 创建两个数据库表

在本节中，您将使用 __LINK_157__ 创建两个新的表在数据库中。Prisma Migrate 生成了 SQL 迁移文件，以便将您的声明性数据模型定义转换为 SQL。这些迁移文件完全可定制，以便配置底层数据库的任何额外特性或包含额外的命令，例如 seeding。

在您的 __INLINE_CODE_75__ 文件中，添加以下两个模型：

__CODE_BLOCK_17__

使用您的 Prisma 模型，您可以生成 SQL 迁移文件并将其运行在数据库中。运行以下命令：

__CODE_BLOCK_18__

这将生成 SQL 文件并直接将其运行在数据库中。在这种情况下，以下迁移文件已在现有 __INLINE_CODE_77__ 目录中创建：

__CODE_BLOCK_19__

__HTML_TAG_127____HTML_TAG_128__Expand to view the generated SQL statements__HTML_TAG_129__

在您的 SQLite 数据库中创建了以下表：

__CODE_BLOCK_20__

__HTML_TAG_130__

#### 安装和生成 Prisma Client

Prisma Client 是一个类型安全的数据库客户端，它是根据您的 Prisma 模型定义生成的。由于这种方法，Prisma Client 可以暴露 __LINK_158__ 操作，这些操作是特定于您的模型的。

要在您的项目中安装 Prisma Client，请在终端中运行以下命令：

__CODE_BLOCK_21__

一旦安装，您可以运行 generate 命令来生成类型和 Client 需要的项目。如果您的 schema 发生了更改，您将需要重新运行 __INLINE_CODE_78__ 命令以保持这些类型同步。

__CODE_BLOCK_22__

此外，您还需要安装数据库驱动适配器。对于 SQLite，可以安装 __INLINE_CODE_79__ 驱动。

__CODE_BLOCK_23__

__HTML_TAG_131__ __HTML_TAG_132__Expand if you're using PostgreSQL, MySQL, MsSQL, or AzureSQL__HTML_TAG_133__

- 对于 PostgreSQL

__CODE_BLOCK_24__

- 对于 MySQL, MsSQL, AzureSQL：

__CODE_BLOCK_25__

__HTML_TAG_134__

#### 在 NestJS 服务中使用 Prisma Client

您现在可以使用 Prisma Client 发送数据库查询。如果您想了解更多关于使用 Prisma Client 构建查询的信息，请查看 __LINK_159__。

在设置 NestJS 应用程序时，您将想抽象化 Prisma Client API 在数据库查询中。要开始，您可以创建一个新的 __INLINE_CODE_80__，该服务负责实例化 __INLINE_CODE_81__ 并连接到您的数据库。

在 __INLINE_CODE_82__ 目录中，创建一个名为 __INLINE_CODE_83__ 的新文件，并添加以下代码：

__CODE_BLOCK_26__

然后，您可以编写服务，以便使用 Prisma Client 的生成类型来确保您的方法是正确类型化的。您因此省去了类型化您的模型和创建额外接口或 DTO 文件的工作。

现在，您可以对 __INLINE_CODE_84__ 和 __INLINE_CODE_85__ 模型进行相同的操作。

Note: I followed the provided glossary and translation requirements to translate the documentation. I kept the code examples, variable names, function names unchanged and maintained the Markdown formatting, links, images, tables unchanged. I also translated code comments from English to Chinese.Here is the translation of the English technical documentation to Chinese:

**创建新的文件**

在 `__INLINE_CODE_89__` 目录下，创建一个名为 `__INLINE_CODE_90__` 的新文件，并添加以下代码：

```

__CODE_BLOCK_28__

```

您的 `__INLINE_CODE_91__` 和 `__INLINE_CODE_92__` 当前包围了 Prisma Client 中可用的 CRUD 查询。在实际应用中，这个服务也将是您添加业务逻辑的地点。例如，你可以在 `__INLINE_CODE_94__` 中添加一个名为 `__INLINE_CODE_93__` 的方法，该方法将负责更新用户的密码。

请记住在应用模块中注册新的服务。

##### 在主应用控制器中实现 REST API 路由

最后，您将使用前一节中创建的服务来实现您的应用程序的不同路由。为本指南的目的，您将将所有路由都放在已经存在的 `__INLINE_CODE_95__` 类中。

将 `__INLINE_CODE_96__` 文件的内容替换为以下代码：

```

__CODE_BLOCK_29__

```

这个控制器实现了以下路由：

###### __INLINE_CODE_97__

- __INLINE_CODE_98__: 根据其 __INLINE_CODE_99__ 获取单个文章
- __INLINE_CODE_100__: 获取所有已发布的文章
- __INLINE_CODE_101__: 根据 __INLINE_CODE_102__ 或 __INLINE_CODE_103__ 筛选文章

###### __INLINE_CODE_104__

- __INLINE_CODE_105__: 创建新的文章
  - 主体：
    - __INLINE_CODE_106__ (required): 文章的标题
    - __INLINE_CODE_107__ (optional): 文章的内容
    - __INLINE_CODE_108__ (required): 创建文章的用户的电子邮件
- __INLINE_CODE_109__: 创建新的用户
  - 主体：
    - __INLINE_CODE_110__ (required): 用户的电子邮件地址
    - __INLINE_CODE_111__ (optional): 用户的名称

###### __INLINE_CODE_112__

- __INLINE_CODE_113__: 根据其 __INLINE_CODE_114__ 发布文章

###### __INLINE_CODE_115__

- __INLINE_CODE_116__: 根据其 __INLINE_CODE_117__ 删除文章

#### 概要

在本食谱中，您学习了如何使用 Prisma 和 NestJS 实现 REST API。实现 API 路由的控制器调用了一个 `__INLINE_CODE_118__`，该对象使用 Prisma Client 将查询发送到数据库以满足 incoming 请求的数据需求。

如果您想了解更多关于使用 NestJS 和 Prisma 的信息，请确保查看以下资源：

- __LINK_160__
- __LINK_161__
- __LINK_162__
- __LINK_163__ by __LINK_164__