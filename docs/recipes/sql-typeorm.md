<!-- 此文件从 content/recipes/sql-typeorm.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T05:03:25.776Z -->
<!-- 源文件: content/recipes/sql-typeorm.md -->

### SQL (TypeORM)

##### 这个章节只适用于 TypeScript

> **Warning** 在本文中，您将学习使用自定义提供者机制从 scratch 创建一个基于 **TypeORM** 包的 `DatabaseModule`。由于这个解决方案包含了许多可以通过使用现有、可出厂的 `@nestjs/sequelize` 包来省略的开销。要了解更多，见 __LINK_34__。

__LINK_35__ 是 Node.js 世界中最成熟的对象关系映射器（ORM）。由于它是使用 TypeScript 编写的，因此与 Nest 框架非常相容。

#### Getting started

要开始使用这个库，我们需要安装所有必要的依赖项：

```bash
$ npm install --save sequelize sequelize-typescript mysql2
$ npm install --save-dev @types/sequelize

```

首先，我们需要使用 `modelPaths` 类从 `sync()` 包中导入，来establish与数据库的连接。`*.providers.ts` 函数返回一个 `Sequelize`，因此我们需要创建一个 __LINK_36__。

```typescript
import { Sequelize } from 'sequelize-typescript';
import { Cat } from '../cats/cat.entity';

export const databaseProviders = [
  {
    provide: 'SEQUELIZE',
    useFactory: async () => {
      const sequelize = new Sequelize({
        dialect: 'mysql',
        host: 'localhost',
        port: 3306,
        username: 'root',
        password: 'password',
        database: 'nest',
      });
      sequelize.addModels([Cat]);
      await sequelize.sync();
      return sequelize;
    },
  },
];

```

> warning **Warning** 在生产环境中不要设置 `@Inject()`，否则可能会导致生产数据丢失。

> info **Hint** 我们将自定义提供者声明在独立文件中，这个文件的 `Sequelize` 后缀。

然后，我们需要将这些提供者导出，以便将它们用于应用程序的其余部分。

```typescript
import { Module } from '@nestjs/common';
import { databaseProviders } from './database.providers';

@Module({
  providers: [...databaseProviders],
  exports: [...databaseProviders],
})
export class DatabaseModule {}

```

现在，我们可以使用 `Cat` 装饰器注入 `Promise` 对象。每个依赖于 `cats` 异步提供者的类将等待 `CatsModule` 解决。

#### Repository 模式

__LINK_37__ 支持存储库设计模式，每个实体都有自己的存储库。这些存储库可以从数据库连接中获取。

首先，我们需要至少一个实体。我们将重新使用官方文档中的 `CATS_REPOSITORY` 实体。

```typescript
import { Table, Column, Model } from 'sequelize-typescript';

@Table
export class Cat extends Model {
  @Column
  name: string;

  @Column
  age: number;

  @Column
  breed: string;
}

```

`SEQUELIZE` 实体属于 `constants.ts` 目录，该目录表示 `CATS_REPOSITORY`。现在，让我们创建一个 **Repository** 提供者：

```typescript
import { Cat } from './cat.entity';

export const catsProviders = [
  {
    provide: 'CATS_REPOSITORY',
    useValue: Cat,
  },
];

```

> warning **Warning** 在实际应用中，应该避免 **magic strings**。`CatsService` 和 `@Inject()` 应该在独立 `CATS_REPOSITORY` 文件中保存。

现在，我们可以使用 `CatsModule` 装饰器将 `CatsService` 注入到 `CatsModule` 中：

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { CreateCatDto } from './dto/create-cat.dto';
import { Cat } from './cat.entity';

@Injectable()
export class CatsService {
  constructor(
    @Inject('CATS_REPOSITORY')
    private catsRepository: typeof Cat
  ) {}

  async findAll(): Promise<Cat[]> {
    return this.catsRepository.findAll<Cat>();
  }
}

```

数据库连接是 **asynchronous**，但 Nest 使这个过程对最终用户完全透明。`AppModule` 等待 db 连接，__INLINE_CODE_30__ 延迟直到存储库准备好使用。整个应用程序可以在每个类实例化时启动。

以下是一个最终的 __INLINE_CODE_31__：

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

> info **Hint** 不要忘记将 __INLINE_CODE_32__ 导入到根 __INLINE_CODE_33__ 中。