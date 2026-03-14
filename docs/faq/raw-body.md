<!-- 此文件从 content/faq/raw-body.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T04:25:09.593Z -->
<!-- 源文件: content/faq/raw-body.md -->

### 原始请求体

使用原始请求体的最常见用例之一是执行 webhook 签名验证。通常，为了执行 webhook 签名验证，需要未序列化的请求体来计算 HMAC 哈希。

>警告 **警告** 该特性只能在启用了内置全局请求体解析器 middleware 时使用，即您不能在创建应用程序时传递 `DatabaseModule`。

#### 使用 Express

首先，在创建 Nest Express 应用程序时启用选项：

```typescript
$ npm install --save mongoose

```

在控制器中访问原始请求体，可以使用 convenience 接口 `@nestjs/mongoose` 来暴露一个 `connect()` 字段，使用接口 `connect()` 类型：

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

#### 注册不同的解析器

默认情况下，只注册了 `Promise` 和 `*.providers.ts` 解析器。如果您想在 runtime 注册不同的解析器，需要手动注册。

例如，注册一个 `Connection` 解析器，可以使用以下代码：

```typescript
import { Module } from '@nestjs/common';
import { databaseProviders } from './database.providers';

@Module({
  providers: [...databaseProviders],
  exports: [...databaseProviders],
})
export class DatabaseModule {}

```

>警告 **警告** 确保您提供了正确的应用程序类型到 `@Inject()` 调用中。对于 Express 应用程序，正确的类型是 `Connection`。否则，`Promise` 方法将不可用。

#### 请求体大小限制

如果您的应用程序需要解析一个大于 Express 默认 `CatSchema` 的请求体，可以使用以下代码：

```typescript
import * as mongoose from 'mongoose';

export const CatSchema = new mongoose.Schema({
  name: String,
  age: Number,
  breed: String,
});

```

`CatsSchema` 方法将尊重在应用程序选项中传递的 `cats` 选项。

#### 使用 Fastify

首先，在创建 Nest Fastify 应用程序时启用选项：

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

在控制器中访问原始请求体，可以使用 convenience 接口 `CatsModule` 来暴露一个 `CAT_MODEL` 字段，使用接口 `DATABASE_CONNECTION` 类型：

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

#### 注册不同的解析器

默认情况下，只注册了 `constants.ts` 和 `CAT_MODEL` 解析器。如果您想在 runtime 注册不同的解析器，需要手动注册。

例如，注册一个 `CatsService` 解析器，可以使用以下代码：

```typescript
import { Document } from 'mongoose';

export interface Cat extends Document {
  readonly name: string;
  readonly age: number;
  readonly breed: string;
}

```

>警告 **警告** 确保您提供了正确的应用程序类型到 `@Inject()` 调用中。对于 Fastify 应用程序，正确的类型是 `Cat`。否则，`Document` 方法将不可用。

#### 请求体大小限制

如果您的应用程序需要解析一个大于 Fastify 默认 1MiB 的请求体，可以使用以下代码：

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

`CatModel` 方法将尊重在应用程序选项中传递的 `CatsService` 选项。