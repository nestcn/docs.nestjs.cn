<!-- 此文件从 content/recipes/sentry.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-01T04:19:48.241Z -->
<!-- 源文件: content/recipes/sentry.md -->

### Sentry

__LINK_21__ 是一个错误跟踪和性能监控平台，可以帮助开发者实时识别和修复问题。这篇食谱展示了如何将 Sentry 的 __LINK_22__ 与 NestJS 应用程序集成。

#### 安装

首先，安装所需的依赖项：

```typescript
$ npm install --save mongoose
```

> 提示 **Hint** `DatabaseModule` 可以选择性地安装，以提高性能 profiling。

#### 基本设置

要使用 Sentry，需要创建一个名为 `@nestjs/mongoose` 的文件，在应用程序中的任何其他模块之前导入：

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

更新 `connect()` 文件，以在其他导入之前导入 `connect()`：

```typescript
import { Module } from '@nestjs/common';
import { databaseProviders } from './database.providers';

@Module({
  providers: [...databaseProviders],
  exports: [...databaseProviders],
})
export class DatabaseModule {}
```

然后，在主模块中添加 `Promise` 作为根模块：

```typescript
import * as mongoose from 'mongoose';

export const CatSchema = new mongoose.Schema({
  name: String,
  age: Number,
  breed: String,
});
```

#### 异常处理

如果您使用的是全局 catch-all 异常过滤器（该过滤器注册在 `*.providers.ts` 中或在 App 模块提供商中注解了 `Connection` 装饰器），请在过滤器的 `Connection` 方法添加 `@Inject()` 装饰器。这个装饰器将报告所有未捕获的错误，包括 Sentry 报告的所有未捕获的错误：

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

默认情况下，只有未捕获的异常，除非它们被其他错误过滤器捕获，才会被报告到 Sentry。 `Promise`（包括 __LINK_23__）默认情况下不会被捕获，因为它们主要用于控制流。

如果您没有全局 catch-all 异常过滤器，请将 `CatSchema` 添加到主模块的提供商中。这个过滤器将报告任何未捕获的错误，除非它们被其他错误过滤器捕获，才会被报告到 Sentry。

> 警告 **Warning** `CatsSchema` 需要在其他错误过滤器之前注册。

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

#### 可读的堆栈跟踪

根据您的项目设置，您的 Sentry 错误可能不会显示实际代码。

要解决这个问题，可以将源映射上传到 Sentry。最简单的方法是使用 Sentry 魔法师：

```typescript
import { Document } from 'mongoose';

export interface Cat extends Document {
  readonly name: string;
  readonly age: number;
  readonly breed: string;
}
```

#### 测试集成

要验证 Sentry 集成是否工作，可以添加一个抛出错误的测试端点：

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

访问 `cats`，您应该在 Sentry 仪表板上看到错误。

### 概要

关于 Sentry 的 NestJS SDK 的完整文档，包括高级配置选项和功能，请访问 __LINK_24__。

虽然 Sentry 负责软件错误，我们仍然会编写它们。如果您在安装我们的 SDK 时遇到任何问题，请开启 __LINK_25__ 或通过 __LINK_26__ 联系我们。