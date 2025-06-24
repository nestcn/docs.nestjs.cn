### MongoDB (Mongoose)

> **警告** 在本文中，您将学习如何基于 **Mongoose** 包从头开始使用自定义组件创建 `DatabaseModule`。因此，该解决方案包含许多额外工作，您可以直接使用现成的专用 `@nestjs/mongoose` 包来避免这些操作。了解更多信息，请参阅[此处](/techniques/mongodb) 。

[Mongoose](https://mongoosejs.com) 是最受欢迎的 [MongoDB](https://www.mongodb.org/) 对象建模工具。

#### 快速开始

要开始使用这个库，我们需要先安装所有必需的依赖项：

```typescript
$ npm install --save mongoose
```

我们首先需要使用 `connect()` 函数建立与数据库的连接。`connect()` 函数返回一个 `Promise`，因此我们必须创建一个[异步提供者](/fundamentals/async-components) 。

```typescript
@@filename(database.providers)
import * as mongoose from 'mongoose';

export const databaseProviders = [
  {
    provide: 'DATABASE_CONNECTION',
    useFactory: (): Promise<typeof mongoose> =>
      mongoose.connect('mongodb://localhost/nest'),
  },
];
```

> **提示** 遵循最佳实践，我们在单独的文件中声明了自定义提供者，该文件具有 `*.providers.ts` 后缀。

接下来，我们需要导出这些提供者，使它们对应用程序的其余部分**可访问** 。

```typescript
@@filename(database.module)
import { Module } from '@nestjs/common';
import { databaseProviders } from './database.providers';

@Module({
  providers: [...databaseProviders],
  exports: [...databaseProviders],
})
export class DatabaseModule {}
```

现在我们可以使用 `@Inject()` 装饰器注入 `Connection` 对象。每个依赖于 `Connection` 异步提供者的类都将等待 `Promise` 解析完成。

#### 模型注入

在 Mongoose 中，所有内容都源自 [Schema](https://mongoosejs.com/docs/guide.html)。让我们定义 `CatSchema`：

```typescript
@@filename(schemas/cat.schema)
import * as mongoose from 'mongoose';

export const CatSchema = new mongoose.Schema({
  name: String,
  age: Number,
  breed: String,
});
```

`CatsSchema` 属于 `cats` 目录。该目录代表 `CatsModule`。

现在是时候创建一个 **Model** 提供者了：

```typescript
@@filename(cats.providers)
import { Connection } from 'mongoose';
import { CatSchema } from './schemas/cat.schema';

export const catsProviders = [
  {
    provide: 'CAT_MODEL',
    useFactory: (connection: Connection) => connection.model('Cat', CatSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];
```

> warning **警告** 在实际应用中应避免使用**魔法字符串** 。`CAT_MODEL` 和 `DATABASE_CONNECTION` 都应保存在独立的 `constants.ts` 文件中。

现在我们可以通过 `@Inject()` 装饰器将 `CAT_MODEL` 注入到 `CatsService` 中：

```typescript
@@filename(cats.service)
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
```

在上例中我们使用了 `Cat` 接口。该接口扩展了 mongoose 包中的 `Document`：

```typescript
import { Document } from 'mongoose';

export interface Cat extends Document {
  readonly name: string;
  readonly age: number;
  readonly breed: string;
}
```

数据库连接是**异步的** ，但 Nest 使这个过程对终端用户完全透明。`CatModel` 类会等待数据库连接，而 `CatsService` 会延迟到模型准备就绪。整个应用会在所有类实例化完成后启动。

以下是最终的 `CatsModule`：

```typescript
@@filename(cats.module)
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

> **提示** 不要忘记将 `CatsModule` 导入根模块 `AppModule`。

#### 示例

一个可用的示例[在此处](https://github.com/nestjs/nest/tree/master/sample/14-mongoose-base)查看。
