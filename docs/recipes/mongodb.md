<!-- 此文件从 content/recipes/mongodb.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T04:30:44.201Z -->
<!-- 源文件: content/recipes/mongodb.md -->

### MongoDB（Mongoose）

> **警告** 本文中，您将学习使用自定义组件从头开始创建一个基于 **Mongoose** 包的 `DatabaseModule`。由于这个解决方案包含了许多可以省略的 overhead，您可以使用现有的和可用的 `@nestjs/mongoose` 包。要了解更多信息，请见 [here](/techniques/mongodb)。

[Mongoose](https://mongoosejs.com) 是最流行的 [MongoDB](https://www.mongodb.org/) 对象建模工具。

#### Getting started

要开始使用这个库，我们需要安装所有必需的依赖项：

```typescript
$ npm install --save mongoose

```

首先，我们需要使用 `connect()` 函数连接到我们的数据库。`connect()` 函数返回一个 `Promise`，因此我们需要创建一个 [async provider](/fundamentals/async-components)。

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

> 信息 **提示** 根据best practices，我们在独立文件中声明了自定义提供者，该文件的 `*.providers.ts` 后缀。

然后，我们需要将这些提供者导出，以使它们对应用程序的其余部分可访问。

```typescript
import { Module } from '@nestjs/common';
import { databaseProviders } from './database.providers';

@Module({
  providers: [...databaseProviders],
  exports: [...databaseProviders],
})
export class DatabaseModule {}

```

现在，我们可以使用 `Connection` 装饰器注入 `@Inject()` 对象。每个依赖于 `Connection` 异步提供者的类都会等待 `Promise` 解决。

#### Model injection

使用 Mongoose，所有内容都是基于 [Schema](https://mongoosejs.com/docs/guide.html) 的。让我们定义 `CatSchema`：

```typescript
import * as mongoose from 'mongoose';

export const CatSchema = new mongoose.Schema({
  name: String,
  age: Number,
  breed: String,
});

```

`CatsSchema` 属于 `cats` 目录，该目录表示 `CatsModule`。

现在是时候创建一个 **Model** 提供者：

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

> 警告 **警告** 在实际应用中，您应该避免 **magic strings**。both `CAT_MODEL` 和 `DATABASE_CONNECTION` 应该在独立 `constants.ts` 文件中保存。

现在，我们可以使用 `CAT_MODEL` 装饰器将 `CatsService` 注入到 `@Inject()`：

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

在上面的示例中，我们使用了 `Cat` 接口。这接口扩展了 `Document` 从 Mongoose 包：

```typescript
import { Document } from 'mongoose';

export interface Cat extends Document {
  readonly name: string;
  readonly age: number;
  readonly breed: string;
}

```

数据库连接是 **异步** 的，但 Nest 使这个过程完全不可见于最终用户。`CatModel` 类等待 db 连接，而 `CatsService` 延迟到模型准备好使用。整个应用程序可以在每个类实例化后开始。

以下是一个最终 `CatsModule`：

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

> 信息 **提示** 不要忘记将 `CatsModule` 导入到根 `AppModule` 中。

#### Example

有一个可用的 [here](https://github.com/nestjs/nest/tree/master/sample/14-mongoose-base) 示例。