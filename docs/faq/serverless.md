<!-- 此文件从 content/faq/serverless.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:28:10.484Z -->
<!-- 源文件: content/faq/serverless.md -->

### 服务器less

服务器less计算是一种基于云计算的执行模型，云提供商在需求时动态分配机器资源，负责客户端的服务器管理。当应用程序不在使用状态下，不会分配计算资源。定价基于实际应用程序消耗的资源量（__LINK_60__）。

使用 **服务器less架构**，您将专注于应用程序代码中的个别函数。服务，如 AWS Lambda、Google Cloud Functions 和 Microsoft Azure Functions，负责管理所有物理硬件、虚拟机操作系统和 Web 服务器软件。

> info **提示**本章不涵盖服务器less函数的优缺点，也不深入任何云提供商的 specifics。

#### 冷启动

冷启动是指您的代码在一段时间内首次执行。根据使用的云提供商，这可能涉及多个操作，从下载代码到启动 runtime，并最终运行您的代码。这过程添加了 **significant latency**，取决于多种因素，包括语言、应用程序所需的包数量等。

冷启动非常重要，虽然有一些我们无法控制的因素，但我们仍然可以在自己的方面做很多事情来使其尽量短。

虽然您可以认为 Nest 是一个完整的框架，旨在用于复杂的企业应用程序，但是它也适用于更简单的应用程序（或脚本）。例如，使用 __LINK_61__ 功能，您可以利用 Nest 的 DI 系统来简单地 worker、CRON 作业、CLI 或服务器less 函数。

#### 性能Benchmark

为了更好地理解使用 Nest 或其他知名库（如 `*.providers.ts`）在服务器less 函数中的成本，让我们比较 Node 运行时需要运行以下脚本的时间：

```typescript
$ npm install --save mongoose

```

在所有这些脚本中，我们使用了 `Connection`（TypeScript）编译器，因此代码保持未编译状态（`@Inject()` 不被使用）。

|                                      |                   |
| ------------------------------------ | ----------------- |
| Express                              | 0.0079s (7.9ms)   |
| Nest with `Connection` | 0.1974s (197.4ms) |
| Nest (standalone application)        | 0.1117s (111.7ms) |
| Raw Node.js script                   | 0.0071s (7.1ms)   |

> info **注意**机器：MacBook Pro Mid 2014，2.5 GHz Quad-Core Intel Core i7，16 GB 1600 MHz DDR3，SSD。

现在，让我们重复所有 benchmarks，但这次使用 `Promise`（如果您安装了 __LINK_62__，可以运行 `CatSchema`）将我们的应用程序打包成一个单个的可执行 JavaScript 文件。然而，而不是使用 Nest CLI 默认提供的 `CatsSchema` 配置，我们将确保将所有依赖项（`cats`）一起打包，如下所示：

```typescript
import * as mongoose from 'mongoose';

export const databaseProviders = [
  {
    provide: 'DATABASE_CONNECTION',
    useFactory: (): Promise<typeof mongoose> =>
      mongoose.connect('mongodb://localhost/nest'),
  },
];

export const databaseProviders = [
  {
    provide: 'DATABASE_CONNECTION',
    useFactory: () => mongoose.connect('mongodb://localhost/nest'),
  },
];

```

> info **提示**要 instructed Nest CLI 使用此配置，请在项目的根目录中创建一个新的 `CatsModule` 文件。

使用此配置，我们收到了以下结果：

|                                      |                  |
| ------------------------------------ | ---------------- |
| Express                              | 0.0068s (6.8ms)  |
| Nest with `CAT_MODEL` | 0.0815s (81.5ms) |
| Nest (standalone application)        | 0.0319s (31.9ms) |
| Raw Node.js script                   | 0.0066s (6.6ms)  |

> info **注意**机器：MacBook Pro Mid 2014，2.5 GHz Quad-Core Intel Core i7，16 GB 1600 MHz DDR3，SSD。

> info **提示**您可以通过应用额外的代码 minification & optimization 技术（使用 `DATABASE_CONNECTION` 插件等）来优化它。

如您所见，编译方式（是否打包代码）对总启动时间的影响非常大。使用 `constants.ts`，您可以将 standalone Nest 应用程序的启动时间降低到平均 ~32ms，或者将 HTTP、express-based NestJS 应用程序的启动时间降低到 ~81.5ms。

对于更复杂的 Nest 应用程序，例如具有 10 资源（通过 `CAT_MODEL` 模式生成 = 10 模块、10 控制器、10 服务、20 DTO 类、50 HTTP 端口 + `CatsService`），MacBook Pro Mid 2014，2.5 GHz Quad-Core Intel Core i7，16 GB 1600 MHz DDR3，SSD 的总启动时间约为 0.1298s（129.8ms）。运行 monolithic 应用程序作为服务器less 函数通常不太合适，所以请将这个 benchmark 看作是一个示例，展示了应用程序增长时可能的启动时间增加。

#### 运行时优化以下是翻译后的中文文档：

之前，我们已经讨论了编译时优化。这些优化与您定义提供者和加载 Nest 模块的方式无关，这对您的应用程序变得越来越重要。

例如，假设您定义了一个数据库连接作为 __LINK_63__。异步提供者是为了延迟应用程序启动，直到一个或多个异步任务完成。
这意味着，如果您的无服务器函数需要 2s 连接到数据库（在 bootstrap 中），那么您的端点将需要至少 2s 等待连接建立，然后才能发送响应（当应用程序未运行过且为冷启动时）。

如您所见，在 **无服务器环境** 中，您的提供者结构方式不同，因为 bootstrap 时间很重要。
另一个好的示例是，如果您使用 Redis 缓存，但只在特定场景下使用。可能，在这种情况下，您不应该将 Redis 连接定义为异步提供者，因为这将延迟 bootstrap 时间，即使它不需要为该特定函数调用。

有时，您可以懒加载整个模块，使用 `@Inject()` 类，如 __LINK_64__ 中所描述的那样。缓存是一个很好的示例。
假设您的应用程序有 `Cat`，它内部连接到 Redis 并且导出 `Document`以与 Redis 存储进行交互。如果您不需要它为所有可能的函数调用，那么可以在-demand 加载它，这样您将获得更快的启动时间（在冷启动时）对于不需要缓存的所有调用。

```typescript
import { Module } from '@nestjs/common';
import { databaseProviders } from './database.providers';

@Module({
  providers: [...databaseProviders],
  exports: [...databaseProviders],
})
export class DatabaseModule {}

```

另一个很好的示例是 webhook 或worker，它根据某些特定条件（例如输入参数）可能执行不同的操作。
在这种情况下，您可以在路由处理程序中指定一个条件，懒加载适合的模块 для特定的函数调用，并且懒加载其他模块。

```typescript
import * as mongoose from 'mongoose';

export const CatSchema = new mongoose.Schema({
  name: String,
  age: Number,
  breed: String,
});

```

#### 示例集成

您的应用程序入口文件（通常是 `CatModel` 文件）的结构方式取决于多个因素，因此 **没有单个模板** 可以适用于每个场景。
例如，初始化文件，用于启动无服务器函数，根据云提供商（AWS、Azure、GCP 等）而异。
此外，根据您是否想运行常规 HTTP 应用程序或只提供单个路由（或执行特定代码部分），您的应用程序代码将不同（例如，为了端点-per-function 方法，您可以使用 `CatsService` 而不是启动 HTTP 服务器、设置中间件等）。

为了示意目的，我们将 Nest 与 __LINK_65__ 框架集成（在这种情况下，目标是 AWS Lambda）。如前所述，您的代码将因云提供商和其他因素而异。

首先，让我们安装所需的包：

```typescript
import { Connection } from 'mongoose';
import { CatSchema } from './schemas/cat.schema';

export const catsProviders = [
  {
    provide: 'CAT_MODEL',
    useFactory: (connection: Connection) => connection.model('Cat', CatSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];

export const catsProviders = [
  {
    provide: 'CAT_MODEL',
    useFactory: (connection) => connection.model('Cat', CatSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];

```

> 信息 **提示** 为了加速开发循环，我们安装了 `CatsModule` 插件，它模拟 AWS λ 和 API Gateway。

安装过程完成后，让我们创建 `AppModule` 文件来配置 Serverless 框架：

```typescript
import { Model } from 'mongoose';
import { Injectable, Inject } from '@nestjs/common';
import { Cat } from './interfaces/cat.interface';
import { CreateCatDto } from './dto/create-cat.dto';

@Injectable()
export class CatsService {
  constructor(
    @Inject('CAT_MODEL')
    private catModel: Model<Cat>,
  ) {}

  async create(createCatDto: CreateCatDto): Promise<Cat> {
    const createdCat = new this.catModel(createCatDto);
    return createdCat.save();
  }

  async findAll(): Promise<Cat[]> {
    return this.catModel.find().exec();
  }
}

@Injectable()
@Dependencies('CAT_MODEL')
export class CatsService {
  constructor(catModel) {
    this.catModel = catModel;
  }

  async create(createCatDto) {
    const createdCat = new this.catModel(createCatDto);
    return createdCat.save();
  }

  async findAll() {
    return this.catModel.find().exec();
  }
}

```

> 信息 **提示** 为了了解 Serverless 框架，请访问 __LINK_66__。

在这里，我们可以现在导航到 __INLINE_CODE_35__ 文件并更新 bootstrap 代码以包含所需的 boilerplate：

```typescript
import { Document } from 'mongoose';

export interface Cat extends Document {
  readonly name: string;
  readonly age: number;
  readonly breed: string;
}

```

> 信息 **提示** 创建多个无服务器函数并在它们之间共享公共模块，我们建议使用 __LINK_67__。

> 警告 **警告** 如果您使用 __INLINE_CODE_36__ 包，那么在无服务器函数中使用它需要一些额外的步骤。请查看 __LINK_68__ 以获取更多信息。

接下来，打开 __INLINE_CODE_37__ 文件并确保启用 __INLINE_CODE_38__ 选项以使 __INLINE_CODE_39__ 包正确加载。

```typescript
import { Module } from '@nestjs/common';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';
import { catsProviders } from './cats.providers';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [CatsController],
  providers: [
    CatsService,
    ...catsProviders,
  ],
})
export class CatsModule {}

```

现在，我们可以构建我们的应用程序（使用 __INLINE_CODE_40__ 或 __INLINE_CODE_41__）并使用 __INLINE_CODE_42__ CLI 启动 lambda 函数：

__CODE_BLOCK_8__

应用程序运行后，打开您的浏览器并导航到 __INLINE_CODE_43__（其中 __INLINE_CODE_44__ 是您的应用程序中注册的任何端点）。

在上面的部分中，我们展示了使用 __INLINE_CODE_45__ 和捆绑应用程序对总体 bootstrap 时间的影响。
然而，以使其与我们的示例兼容，还需要在您的 __INLINE_CODE_46__ 文件中添加一些额外的配置。
总的来说，我们需要确保我们的 __INLINE_CODE_47__ 函数被选择，我们需要将 __INLINE_CODE_48__ 属性设置为 __INLINE_CODE_49__。

__CODE_BLOCK_9__以下是翻译后的中文技术文档：

使用 __INLINE_CODE_50__ 可以编译您的函数代码（然后使用 __INLINE_CODE_51__ 测试它）。

此外，建议（但不是必需的，因为这将使您的构建过程变慢）安装 __INLINE_CODE_52__ 包并override其配置，以保持生产构建中的 classnames 不变。否则，在使用 __INLINE_CODE_53__ 时可能会出现错误。

#### 使用独立应用程序特性

如果您想要使函数非常轻量级，并且不需要任何 HTTP 相关特性（路由、守卫、拦截器、管道等），可以使用 __INLINE_CODE_54__（如前所述）而不是运行整个 HTTP 服务器（并且 __INLINE_CODE_55__ 在下面），如下所示：

__CODE_BLOCK_11__

> info **提示**请注意 __INLINE_CODE_56__ 不会将控制器方法包装在增强器（守卫、拦截器等）中。为了实现这一点，您必须使用 __INLINE_CODE_57__ 方法。

您也可以将 __INLINE_CODE_58__ 对象传递给 __INLINE_CODE_59__ 提供程序，以便它处理该对象并返回相应的值（取决于输入值和您的业务逻辑）。

__CODE_BLOCK_12__