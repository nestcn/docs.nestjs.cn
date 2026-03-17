<!-- 此文件从 content/middlewares.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:03:45.546Z -->
<!-- 源文件: content/middlewares.md -->

### 中间件

中间件是一种函数，它在路由处理程序之前被调用。中间件函数可以访问 __LINK_93__ 和 __LINK_94__ 对象，以及应用程序的请求-响应周期中的 `connect()` 中间件函数。常见的中间件函数的变量名是 `Promise`。

__HTML_TAG_72____HTML_TAG_73____HTML_TAG_74__

Nest 中间件默认情况下是等同于 express 中间件的。以下是官方 express 文档中中间件的描述：

__HTML_TAG_75__
  中间件函数可以执行以下任务：
  __HTML_TAG_76__
    __HTML_TAG_77__执行任意代码。
    __HTML_TAG_78__修改请求和响应对象。
    __HTML_TAG_79__结束请求响应循环。
    __HTML_TAG_80__调用下一个中间件函数。
    __HTML_TAG_81__如果当前中间件函数不结束请求响应循环，它必须调用 __HTML_TAG_86__ next()__HTML_TAG_87__以
      将控制权传递给下一个中间件函数。否则，请求将被留下。
    __HTML_TAG_88__
  __HTML_TAG_89__
__HTML_TAG_90__

您可以使用函数或带有 `*.providers.ts` 装饰器的类来实现自定义 Nest 中间件。类应实现 `Connection` 接口，而函数没有特殊要求。让我们从实现一个简单的中间件开始。

> warning **Warning** `@Inject()` 和 `Connection` 处理中间件不同，并提供不同的方法签名，了解更多 __LINK_96__。

```typescript
$ npm install --save mongoose

```

#### 依赖注入

Nest 中间件完全支持依赖注入。正如对提供者和控制器一样，它们可以注入同一个模块中可用的依赖项。正如常规一样，这是通过 `Promise` 实现的。

#### 应用中间件

中间件不在 `CatSchema` 装饰器中，而是在模块类的 `CatsSchema` 方法中设置的。包含中间件的模块必须实现 `cats` 接口。让我们在 `CAT_MODEL` 层级上设置 `CatsModule`。

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

在上面的示例中，我们已经为 `constants.ts` 路由处理程序设置了 `DATABASE_CONNECTION`。我们也可以进一步限制中间件到特定的请求方法中，通过在配置中间件时传入包含路由 `CatsService` 和请求 `@Inject()` 的对象。在下面的示例中，我们可以看到我们正在导入 `Document` 枚举，以引用所需的请求方法类型。

```typescript
import { Module } from '@nestjs/common';
import { databaseProviders } from './database.providers';

@Module({
  providers: [...databaseProviders],
  exports: [...databaseProviders],
})
export class DatabaseModule {}

```

> info **Hint** `CatModel` 方法可以使用 `CatsService` 进行异步处理（例如，在 `CatsModule` 方法体中执行异步操作）。

> warning **Warning** 使用 `AppModule` 适配器时，NestJS 应用程序将默认注册 __INLINE_CODE_35__ 和 __INLINE_CODE_36__ 从包 __INLINE_CODE_37__。这意味着，如果您想自定义该中间件，需要在创建应用程序时将 __INLINE_CODE_39__ 标志设置为 __INLINE_CODE_40__。

#### 路由通配符

基于模式的路由也支持在 NestJS 中间件中。例如，可以使用名为 __INLINE_CODE_42__ 的通配符来匹配任何路由组件。在以下示例中，中间件将执行任何以 __INLINE_CODE_43__ 开头的路由，无论后续字符的数量。

```typescript
import * as mongoose from 'mongoose';

export const CatSchema = new mongoose.Schema({
  name: String,
  age: Number,
  breed: String,
});

```

> info **Hint** __INLINE_CODE_44__ 是通配符参数的名称，并没有特别的含义。您可以将其命名为您所喜欢的名称，例如 __INLINE_CODE_45__。

__INLINE_CODE_46__ 路由将匹配 __INLINE_CODE_47__、__INLINE_CODE_48__、__INLINE_CODE_49__ 等等。连字符(__INLINE_CODE_50__) 和点(__INLINE_CODE_51__) 将被字符串路径中的字面值解释。然而,__INLINE_CODE_52__ 不会匹配路由。为此，您需要将通配符包围在花括号中以使其可选：

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

#### 中间件消费者

__INLINE_CODE_53__ 是一个帮助类。它提供了几个内置方法来管理中间件。所有这些方法都可以被简单地在 __LINK_97__ 中链式调用。__INLINE_CODE_54__ 方法可以接受单个字符串、多个字符串、__INLINE_CODE_55__ 对象、控制器类或多个控制器类。在大多数情况下，您可能只需传递控制器列表，使用逗号分隔。以下是一个单个控制器的示例：

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

```Here is the translation of the provided English technical documentation to Chinese:

> 提示 **Hint** __INLINE_CODE_56__ 方法可能接受单个中间件，或者多个参数来指定 __HTML_TAG_91__ 多个中间件 __HTML_TAG_92__。

#### 排除路由

有时，我们可能想**排除**某些路由从中间件应用中。可以使用 __INLINE_CODE_57__ 方法轻松实现。这 __INLINE_CODE_58__ 方法接受单个字符串、多个字符串或 __INLINE_CODE_59__ 对象来识别要排除的路由。

以下是使用它的示例：

```typescript
import { Document } from 'mongoose';

export interface Cat extends Document {
  readonly name: string;
  readonly age: number;
  readonly breed: string;
}

```

> 提示 **Hint** __INLINE_CODE_60__ 方法支持使用 __LINK_98__ 包裹的通配符参数。

使用上面的示例，__INLINE_CODE_61__ 将被绑定到 __INLINE_CODE_62__ 内部定义的所有路由中，**except** 三个被传递给 __INLINE_CODE_63__ 方法的路由。

这种方法提供了在特定路由或路由模式上应用或排除中间件的灵活性。

#### 功能中间件

我们使用的 __INLINE_CODE_64__ 类非常简单。它没有成员、没有额外方法、没有依赖关系。为什么不能使用简单的函数来定义中间件，而不是类？实际上，我们可以。这种中间件称为**功能中间件**。让我们将日志中间件从类中间件转换为功能中间件，以illustrate the difference：

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

然后，在 __INLINE_CODE_65__ 中使用它：

__CODE_BLOCK_8__

> 提示 **Hint** 在中间件不需要依赖关系时，考虑使用更简单的**功能中间件**备选方案。

#### 多个中间件

如前所述，我们可以通过在 __INLINE_CODE_66__ 方法中提供逗号分隔的列表来绑定多个中间件，使它们按顺序执行：

__CODE_BLOCK_9__

#### 全局中间件

如果我们想将中间件绑定到每个注册的路由上， podemos 使用 __INLINE_CODE_67__ 方法，该方法由 __INLINE_CODE_68__ 实例提供：

__CODE_BLOCK_10__

> 提示 **Hint** 在全局中间件中访问 DI 容器是不可能的。你可以使用 __LINK_99__ 而不是 __INLINE_CODE_69__。或者，你可以使用类中间件，并在 __INLINE_CODE_70__ 中消费它（或任何其他模块）。