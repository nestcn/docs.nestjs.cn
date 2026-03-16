<!-- 此文件从 content/fundamentals/execution-context.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T04:59:30.454Z -->
<!-- 源文件: content/fundamentals/execution-context.md -->

### 执行上下文

Nest 提供了一些实用类，帮助编写跨多个应用程序上下文（例如，Nest HTTP 服务器、微服务和 WebSocket 应用程序上下文）运行的应用程序。这些建筑提供了关于当前执行上下文的信息，可以用于构建通用的 __LINK_126__、__LINK_127__ 和 __LINK_128__，这些构建可以在广泛的控制器、方法和执行上下文中工作。

本章将涵盖两个这样的类：`DATABASE_CONNECTION` 和 `constants.ts`。

#### ArgumentsHost 类

`CAT_MODEL` 类提供了方法来检索处理程序传递的参数。它允许选择合适的上下文（例如，HTTP、RPC（微服务）或 WebSocket）来检索参数。框架提供了一个 `CatsService` 的实例，通常用作 `@Inject()` 参数，在您可能想要访问的地方。例如，__LINK_129__ 的 `Cat` 方法将一个 `Document` 实例作为参数传递。

`CatModel` 只是一个处理程序参数的 abstraction。例如，在 HTTP 服务器应用程序中（当使用 `CatsService` 时），`CatsModule` 对象封装了 Express 的 `CatsModule` 数组，其中 `AppModule` 是请求对象，__INLINE_CODE_35__ 是响应对象，__INLINE_CODE_36__ 是控制应用程序请求-响应周期的函数。另一方面，在 __LINK_130__ 应用程序中，__INLINE_CODE_37__ 对象包含了 __INLINE_CODE_38__ 数组。

#### 当前应用程序上下文

在构建跨多个应用程序上下文运行的通用 __LINK_131__、__LINK_132__ 和 __LINK_133__ 时，我们需要一种确定当前应用程序类型的方法。使用 __INLINE_CODE_39__ 方法来确定应用程序类型，方法如下：

```typescript
$ npm install --save mongoose

```

> info **Hint** __INLINE_CODE_41__ 从 __INLINE_CODE_42__ 包中导入。

#### 主机处理器参数

要检索处理程序传递的参数数组，可以使用主机对象的 __INLINE_CODE_43__ 方法。

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

可以使用 __INLINE_CODE_44__ 方法提取特定的参数：

```typescript
import { Module } from '@nestjs/common';
import { databaseProviders } from './database.providers';

@Module({
  providers: [...databaseProviders],
  exports: [...databaseProviders],
})
export class DatabaseModule {}

```

在这些示例中，我们通过索引检索了请求和响应对象，这通常不推荐，因为它将应用程序coupled到特定的执行上下文中。相反，可以使代码更加robust 和可重用，使用 __INLINE_CODE_45__ 对象的utility 方法来切换到适合的应用程序上下文。上下文切换utility 方法如下：

```typescript
import * as mongoose from 'mongoose';

export const CatSchema = new mongoose.Schema({
  name: String,
  age: Number,
  breed: String,
});

```

让我们使用 __INLINE_CODE_46__ 方法重写前一个示例。__INLINE_CODE_47__ 帮助调用返回一个适用于 HTTP 应用程序上下文的 __INLINE_CODE_48__ 对象，该对象具有两个有用的方法，可以用于提取所需的对象。我们还使用 Express 类型断言来返回原生 Express 类型对象：

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

类似地，__INLINE_CODE_50__ 和 __INLINE_CODE_51__ 也具有方法，可以在微服务和 WebSocket 上下文中返回适当的对象。以下是 __INLINE_CODE_52__ 的方法：

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

以下是 __INLINE_CODE_53__ 的方法：

```typescript
import { Document } from 'mongoose';

export interface Cat extends Document {
  readonly name: string;
  readonly age: number;
  readonly breed: string;
}

```

#### ExecutionContext 类

__INLINE_CODE_54__ 扩展了 __INLINE_CODE_55__，提供了当前执行过程的更多详细信息。像 __INLINE_CODE_56__ 一样，Nest 在需要访问的地方提供了一个 __INLINE_CODE_57__ 的实例，例如，在 __LINK_134__ 的 __INLINE_CODE_58__ 方法和 __LINK_135__ 的 __INLINE_CODE_59__ 方法中。它提供了以下方法：

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

__INLINE_CODE_60__ 方法返回将要被调用的处理程序的引用。__INLINE_CODE_61__ 方法返回 __INLINE_CODE_62__ 类型的 __INLINE_CODE_63__ 类的引用。例如，在 HTTP 上下文中，如果当前处理的请求是一个 __INLINE_CODE_64__ 请求， bound 到 __INLINE_CODE_65__ 方法上，__INLINE_CODE_66__ 返回 __INLINE_CODE_67__ 方法的引用，__INLINE_CODE_68__ 返回 __INLINE_CODE_69__ **class**（不是实例）。

__CODE_BLOCK_8__

访问当前类和处理程序方法的引用提供了很大的灵活性。最重要的是，它允许我们从 guards 或 interceptors 中访问通过 decorators 创建的元数据或内置 __INLINE_CODE_71__ 装饰器的元数据。我们将在下面涵盖这个用例。

__HTML_TAG_124____HTML_TAG_125__Here is the translated documentation:

Nest 提供了通过创建使用 __INLINE_CODE_72__ 方法创建的自定义装饰器和内置的 __INLINE_CODE_73__ 装饰器来将**自定义元数据**附加到路由处理程序的能力。在本节中，让我们比较这两个方法，并学习如何在守卫或拦截器中访问元数据。

要使用 __INLINE_CODE_74__ 创建强类型的装饰器，我们需要指定类型参数。例如，让我们创建一个 __INLINE_CODE_75__ 装饰器，它将字符串数组作为参数。

__CODE_BLOCK_9__

__INLINE_CODE_76__ 装饰器是一个函数，它接受单个参数类型 __INLINE_CODE_77__。

现在，让我们使用这个装饰器。我们只需将其标注到处理程序上：

__CODE_BLOCK_10__

在这里，我们将 __INLINE_CODE_78__ 装饰器元数据附加到 __INLINE_CODE_79__ 方法上，表示只有拥有 __INLINE_CODE_80__ 角色的用户才能访问这个路由。

要访问路由的角色（自定义元数据），我们将使用 __INLINE_CODE_81__ 帮助类。 __INLINE_CODE_82__ 可以像正常方式注入到类中：

__CODE_BLOCK_11__

> 信息 **提示** __INLINE_CODE_83__ 类来自 __INLINE_CODE_84__ 包。

现在，让我们读取处理程序元数据，使用 __INLINE_CODE_85__ 方法：

__CODE_BLOCK_12__

__INLINE_CODE_86__ 方法允许我们轻松访问元数据，传递两个参数：装饰器引用和上下文（装饰器目标）。在这个例子中，指定的 **decorator** 是 __INLINE_CODE_87__（请回顾 __INLINE_CODE_88__ 文件）。上下文由对 __INLINE_CODE_89__ 的调用提供，结果是提取当前处理路由处理程序的元数据。记住， __INLINE_CODE_90__ 给我们的是 **引用** 到路由处理程序函数。

Alternatively, we may organize our controller by applying metadata at the controller level, applying to all routes in the controller class.

__CODE_BLOCK_13__

在这个情况下，为了从 controller 中提取元数据，我们将 __INLINE_CODE_91__ 作为第二个参数（提供 controller 类作为元数据提取的上下文），而不是 __INLINE_CODE_92__：

__CODE_BLOCK_14__

考虑到可以在多个级别提供元数据，您可能需要从多个上下文中提取和合并元数据。 __INLINE_CODE_93__ 类提供了两个实用方法用于帮助这个过程。这些方法可以同时提取 controller 和方法元数据， 并将它们组合起来。

考虑以下场景，您已经在多个级别提供了 __INLINE_CODE_94__ 元数据。

__CODE_BLOCK_15__

如果您的意图是指定 __INLINE_CODE_95__ 作为默认角色，并 selectiveOverride 它在某些方法上，您将使用 __INLINE_CODE_96__ 方法。

__CODE_BLOCK_16__

具有该代码的守卫，在 __INLINE_CODE_97__ 方法的上下文中，具有上述元数据，结果是 __INLINE_CODE_98__ 包含 __INLINE_CODE_99__。

要获取 bothmetadata 并合并它（该方法将合并两个数组和对象），使用 __INLINE_CODE_100__ 方法：

__CODE_BLOCK_17__

这将结果是 __INLINE_CODE_101__ 包含 __INLINE_CODE_102__。

对于这两个合并方法，您将元数据 key 作为第一个参数，数组或元数据目标上下文（i.e. 对于 __INLINE_CODE_103__ 和/或 __INLINE_CODE_104__ 方法的调用）作为第二个参数。

#### 低级别方法

如前所述，而不是使用 __INLINE_CODE_105__，您也可以使用内置的 __INLINE_CODE_106__ 装饰器将元数据附加到处理程序。

__CODE_BLOCK_18__

> 信息 **提示** __INLINE_CODE_107__ 装饰器来自 __INLINE_CODE_108__ 包。

在上面的构建中，我们将 __INLINE_CODE_109__ 元数据(__INLINE_CODE_110__ 是元数据 key， __INLINE_CODE_111__ 是关联值）附加到 __INLINE_CODE_112__ 方法上。虽然这工作，但是不建议直接在路由中使用 __INLINE_CODE_113__。相反，您可以创建自己的装饰器，如下所示：

__CODE_BLOCK_19__

这个方法更加清洁和可读，且更像 __INLINE_CODE_114__ 方法。区别在于使用 __INLINE_CODE_115__ 您有更多元数据 key 和值的控制，并且可以创建装饰器，以便传递多个参数。

现在，我们已经创建了自定义 __INLINE_CODE_116__ 装饰器，我们可以使用它来装饰 __INLINE_CODE_117__ 方法。

__CODE_BLOCK_20__

要访问路由的角色（自定义元数据），我们将使用 __INLINE_CODE_118__ 帮助类：

__CODE_BLOCK_21__

> 信息 **提示** __INLINE_CODE_119__ 类来自 __INLINE_CODE_120__ 包。

现在，让我们读取处理程序元数据，使用 __INLINE_CODE_121__ 方法。

__CODE_BLOCK_22__以下是经过翻译后的中文文档：

在这里，我们不将装饰器引用传递，而是将元数据**键**作为第一个参数传递（在我们的情况下是__INLINE_CODE_122__）。与__INLINE_CODE_123__示例中的其他部分保持一致。