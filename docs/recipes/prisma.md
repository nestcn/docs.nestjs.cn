<!-- 此文件从 content/recipes/prisma.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T05:07:20.856Z -->
<!-- 源文件: content/recipes/prisma.md -->

### Prisma

__LINK_135__ 是一个 __LINK_136__ ORM для Node.js 和 TypeScript。它被用作 **替代** 写平 SQL 或使用另一个数据库访问工具，例如 SQL 查询 builders（如 __LINK_137__）或 ORM（如 __LINK_138__ 和 __LINK_139__）。Prisma 目前支持 PostgreSQL、MySQL、SQL Server、SQLite、MongoDB 和 CockroachDB (__LINK_140__。

虽然 Prisma 可以与 plain JavaScript 一起使用，但它更是 TypeScript 的拥抱者，提供了一个超越 TypeScript 生态系统其他 ORM 的类型安全性。您可以在 __LINK_141__ 中找到 Prisma 和 TypeORM 的类型安全性比较。

>注意 如果您想快速了解 Prisma 的工作原理，可以遵循 __LINK_142__ 或阅读 __LINK_143__ 在 __LINK_144__ 中。同时，在 __LINK_147__ 仓库中也有准备好的示例代码 для __LINK_145__ 和 __LINK_146__。

#### Getting started

在这个食谱中，您将学习如何从 scratch 使用 NestJS 和 Prisma。您将创建一个示例 NestJS 应用程序，它拥有一个 REST API，可以读取和写入数据库中的数据。

为了这个指南，您将使用一个 __LINK_148__ 数据库，以免设置数据库服务器的开销。请注意，您仍然可以遵循这个指南，即使您使用 PostgreSQL 或 MySQL—even if—you'll get extra instructions for using these databases at the right places。

>注意 如果您已经有了一个现有的项目并且想迁移到 Prisma，可以遵循 __LINK_149__ 指南。如果您正在迁移到 TypeORM，可以阅读 __LINK_150__ 指南。

#### Create your NestJS project

要开始，请安装 NestJS CLI，并使用以下命令创建您的应用程序骨架：

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    forceCloseConnections: true,
  });
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();

```

了解更多关于项目文件的信息，请访问 __LINK_151__。请注意，您现在可以使用 __INLINE_CODE_31__ 来启动您的应用程序。当前的 REST API 在 __INLINE_CODE_32__ 上运行，实现了一个单个路由，该路由在 __INLINE_CODE_33__ 中实现。随着这个指南的进行，您将实现更多的路由，以存储和检索关于 _users_ 和 _posts_ 的数据。

#### Set up Prisma

首先，请安装 Prisma CLI 作为您的项目的开发依赖项：

__CODE_BLOCK_1__

在下一步中，我们将使用 __LINK_152__。作为最佳实践，建议在本地invoke CLI，通过 prefixing 它以 __INLINE_CODE_34__：

__CODE_BLOCK_2__

__HTML_TAG_119____HTML_TAG_120__Expand if you're using Yarn__HTML_TAG_121__

如果您使用 Yarn，那么可以使用以下命令安装 Prisma CLI：

__CODE_BLOCK_3__

安装完成后，可以使用 prefixing 它以 __INLINE_CODE_35__ 来invoke 它：

__CODE_BLOCK_4__

__HTML_TAG_122__

现在，使用 Prisma CLI 的 __INLINE_CODE_36__ 命令创建您的初始 Prisma 设置：

__CODE_BLOCK_5__

这个命令创建了一个新的 __INLINE_CODE_37__ 目录，包含以下内容：

- __INLINE_CODE_38__: 指定您的数据库连接和包含数据库 schema 的文件
- __INLINE_CODE_39__: 一个配置文件，用于您的项目
- __INLINE_CODE_40__: 一个 __LINK_153__ 文件，通常用于存储数据库凭证在一组环境变量中

#### Set the generator output path

指定您的生成 Prisma 客户端的输出 __INLINE_CODE_41__，可以通过在 prisma init 中传递 __INLINE_CODE_42__，或直接在 Prisma schema 中：

__CODE_BLOCK_6__

#### Configure the module format

将 __INLINE_CODE_43__ 在生成器中设置为 __INLINE_CODE_44__：

__CODE_BLOCK_7__

>注意 __INLINE_CODE_45__ 配置是必需的，因为 Prisma v7 ships 作为 ES 模块，默认情况下不支持 NestJS 的 CommonJS 设置。将 __INLINE_CODE_46__ 设置为 __INLINE_CODE_47__ 强制 Prisma 生成一个 CommonJS 模块，而不是 ESM。

#### Set the database connection

您的数据库连接在您的 __INLINE_CODE_48__ 文件中的 __INLINE_CODE_49__ 块中配置。默认情况下，它设置为 __INLINE_CODE_50__，但由于您在这个指南中使用 SQLite 数据库，因此需要将 __INLINE_CODE_51__ 字段的 __INLINE_CODE_52__ 块设置为 __INLINE_CODE_53__：

__CODE_BLOCK_8__

现在，打开 __INLINE_CODE_54__，并调整 __INLINE_CODE_55__ 环境变量，以使其如下所示：

__CODE_BLOCK_9__

确保您已经配置了 __LINK_154__，否则 __INLINE_CODE_56__ 变量将不会从 __INLINE_CODE_57__ 中获取。

SQLite 数据库是简单的文件；不需要服务器来使用 SQLite 数据库。因此，而不是配置一个连接 URL，其中包括 _host_ 和 _port_，您可以简单地将其指向一个本地文件，这个文件在这个指南中称为 __INLINE_CODE_58__。这个文件将在Here is the translation of the provided English technical documentation to Chinese:

**PostgreSQL**

如果您使用 PostgreSQL，需要调整 __INLINE_CODE_59__ 和 __INLINE_CODE_60__ 文件，以以下方式：

**__INLINE_CODE_61__**

__CODE_BLOCK_10__

**__INLINE_CODE_62__**

__CODE_BLOCK_11__

将所有大写字母的占位符替换为您的数据库凭证。注意，如果您不知道如何提供 __INLINE_CODE_63__ 占位符的值，它可能是默认值 __INLINE_CODE_64__：

__CODE_BLOCK_12__

如果您想了解如何设置 PostgreSQL 数据库，可以遵循 __LINK_156__ 指南。

**MySQL**

如果您使用 MySQL，需要调整 __INLINE_CODE_65__ 和 __INLINE_CODE_66__ 文件，以以下方式：

**__INLINE_CODE_67__**

__CODE_BLOCK_13__

**__INLINE_CODE_68__**

__CODE_BLOCK_14__

将所有大写字母的占位符替换为您的数据库凭证。

**Microsoft SQL Server / Azure SQL Server**

如果您使用 Microsoft SQL Server 或 Azure SQL Server，需要调整 __INLINE_CODE_69__ 和 __INLINE_CODE_70__ 文件，以以下方式：

**__INLINE_CODE_71__**

__CODE_BLOCK_15__

**__INLINE_CODE_72__**

将所有大写字母的占位符替换为您的数据库凭证。注意，如果您不知道如何提供 __INLINE_CODE_73__ 占位符的值，它可能是默认值 __INLINE_CODE_74__：

__CODE_BLOCK_16__

__HTML_TAG_126__

#### 使用 Prisma Migrate 创建两个数据库表

在本节中，您将使用 __LINK_157__ 创建两个新的表格。Prisma Migrate 生成 Prisma 模式定义的 SQL 迁移文件，这些文件完全可定制，以便在下游数据库中配置任何额外的功能或包含附加命令，例如 seeding。

在您的 __INLINE_CODE_75__ 文件中添加以下两个模型：

__CODE_BLOCK_17__

现在，您可以生成 SQL 迁移文件并将其运行在数据库中。运行以下命令：

__CODE_BLOCK_18__

这 __INLINE_CODE_76__ 命令生成 SQL 文件并直接将其运行在数据库中。结果，在现有的 __INLINE_CODE_77__ 目录中创建了以下迁移文件：

__CODE_BLOCK_19__

__HTML_TAG_127____HTML_TAG_128__Expand to view the generated SQL statements__HTML_TAG_129__

在 SQLite 数据库中创建了以下表格：

__CODE_BLOCK_20__

__HTML_TAG_130__

#### 安装和生成 Prisma Client

Prisma Client 是一个类型安全的数据库客户端，它是从 Prisma 模式定义生成的。由于这种方法，Prisma Client 可以 expose __LINK_158__ 操作，这些操作是特定于您的模型的。

要在项目中安装 Prisma Client，运行以下命令：

__CODE_BLOCK_21__

安装后，您可以运行 generate 命令来生成所需的类型和客户端。如果您的模式发生变化，您需要重新运行 __INLINE_CODE_78__ 命令以保持这些类型的同步。

__CODE_BLOCK_22__

此外，您还需要安装数据库类型的驱动器适配器。对于 SQLite，可以安装 __INLINE_CODE_79__ 驱动器。

__CODE_BLOCK_23__

__HTML_TAG_131__ __HTML_TAG_132__Expand if you're using PostgreSQL, MySQL, MsSQL, or AzureSQL__HTML_TAG_133__

- 对于 PostgreSQL

__CODE_BLOCK_24__

- 对于 MySQL, MsSQL, AzureSQL：

__CODE_BLOCK_25__

__HTML_TAG_134__

#### 在 NestJS 服务中使用 Prisma Client

现在，您可以使用 Prisma Client 发送数据库查询。如果您想了解更多关于使用 Prisma Client 构建查询的信息，请查看 __LINK_159__。

在设置 NestJS 应用程序时，您将想抽象化 Prisma Client API，以便在服务中进行数据库查询。要开始，创建一个新的 __INLINE_CODE_80__，该服务将负责实例化 __INLINE_CODE_81__ 并连接到数据库。

在 __INLINE_CODE_82__ 目录中，创建一个名为 __INLINE_CODE_83__ 的新文件，并添加以下代码：

__CODE_BLOCK_26__

然后，您可以编写服务，以便在 __INLINE_CODE_84__ 和 __INLINE_CODE_85__ 模型上进行数据库调用。

在 __INLINE_CODE_86__ 目录中，创建一个名为 __INLINE_CODE_87__ 的新文件，并添加以下代码：

__CODE_BLOCK_27__

注意，您使用 Prisma Client 生成的类型，以确保您的服务 expose 的方法是正确类型化的。这使您避免了类型模型和创建额外接口或 DTO 文件的 Boilerplate。Here is the translated Chinese technical documentation:

**创建新的文件**

在 `__INLINE_CODE_89__` 目录内，创建一个名为 `__INLINE_CODE_90__` 的新文件，并将以下代码添加到其中：

```

__CODE_BLOCK_28__

```

您的 `__INLINE_CODE_91__` 和 `__INLINE_CODE_92__` 目前包围了 Prisma Client 中的 CRUD 查询。在实际应用程序中，服务将是添加业务逻辑的地方。例如，您可以在 `__INLINE_CODE_94__` 中添加一个名为 `__INLINE_CODE_93__` 的方法，负责更新用户密码。

请在应用程序模块中注册新的服务。

##### 在主应用控制器中实现 REST API 路由

最后，您将使用之前创建的服务来实现应用程序的不同路由。在本指南的目的下，您将将所有路由都添加到已经存在的 `__INLINE_CODE_95__` 类中。

将 `__INLINE_CODE_96__` 文件的内容替换为以下代码：

```

__CODE_BLOCK_29__

```

这个控制器实现了以下路由：

###### __INLINE_CODE_97__

- __INLINE_CODE_98__: 根据 __INLINE_CODE_99__ 获取单个帖子
- __INLINE_CODE_100__: 获取所有已发布的帖子
- __INLINE_CODE_101__: 根据 __INLINE_CODE_102__ 或 __INLINE_CODE_103__ 来过滤帖子

###### __INLINE_CODE_104__

- __INLINE_CODE_105__: 创建新帖子
  - 请求体：
    - __INLINE_CODE_106__ (required)：帖子的标题
    - __INLINE_CODE_107__ (optional)：帖子的内容
    - __INLINE_CODE_108__ (required)：创建帖子的用户的电子邮件
- __INLINE_CODE_109__: 创建新用户
  - 请求体：
    - __INLINE_CODE_110__ (required)：用户的电子邮件地址
    - __INLINE_CODE_111__ (optional)：用户的名称

###### __INLINE_CODE_112__

- __INLINE_CODE_113__: 根据 __INLINE_CODE_114__ 发布帖子

###### __INLINE_CODE_115__

- __INLINE_CODE_116__: 删除根据 __INLINE_CODE_117__ 的帖子

#### 概要

在本食谱中，您学习了如何使用 Prisma 和 NestJS 实现 REST API。实现 API 路由的控制器正在调用一个 `__INLINE_CODE_118__`，该对象使用 Prisma Client 将查询发送到数据库，以满足 incoming 请求的数据需求。

如果您想了解更多关于使用 NestJS 和 Prisma 的信息，请查看以下资源：

- __LINK_160__
- __LINK_161__
- __LINK_162__
- __LINK_163__ by __LINK_164__