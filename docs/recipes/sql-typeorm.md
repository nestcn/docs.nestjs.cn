### SQL (TypeORM)

##### 本章仅适用于 TypeScript

:::warning 警告
在本文中，您将学习如何基于 **TypeORM** 包，使用自定义提供者机制从零开始创建 `DatabaseModule`。因此，该解决方案包含许多额外工作，您可以直接使用现成的专用 `@nestjs/typeorm` 包来避免这些工作。了解更多信息，请参阅[此处](/techniques/sql) 。
:::



[TypeORM](https://github.com/typeorm/typeorm) 无疑是 Node.js 领域最成熟的对象关系映射器(ORM)。由于它是用 TypeScript 编写的，因此与 Nest 框架配合得非常好。

#### 快速开始

要开始使用这个库的探索之旅，我们首先需要安装所有必需的依赖项：

```bash
$ npm install --save typeorm mysql2
```

第一步需要使用从 `typeorm` 包导入的 `new DataSource().initialize()` 类建立与数据库的连接。`initialize()` 函数返回一个 `Promise`，因此我们需要创建一个[异步提供者](/fundamentals/async-components) 。

 ```typescript title="database.providers.ts"
import { DataSource } from 'typeorm';

export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    useFactory: async () => {
      const dataSource = new DataSource({
        type: 'mysql',
        host: 'localhost',
        port: 3306,
        username: 'root',
        password: 'root',
        database: 'test',
        entities: [
            __dirname + '/../**/*.entity{.ts,.js}',
        ],
        synchronize: true,
      });

      return dataSource.initialize();
    },
  },
];
```

:::warning 注意
生产环境中不应使用 `synchronize: true` 设置——否则可能导致生产数据丢失。
:::

:::info 建议
遵循最佳实践，我们在单独的文件中声明了自定义提供者，该文件具有 `*.providers.ts` 后缀。
:::

接着，我们需要导出这些提供者，使它们对应用程序的**其他部分可访问** 。

 ```typescript title="database.module.ts"
import { Module } from '@nestjs/common';
import { databaseProviders } from './database.providers';

@Module({
  providers: [...databaseProviders],
  exports: [...databaseProviders],
})
export class DatabaseModule {}
```

现在我们可以使用 `@Inject()` 装饰器注入 `DATA_SOURCE` 对象。任何依赖 `DATA_SOURCE` 异步提供者的类都将等待 `Promise` 解析完成。

#### 仓储模式

[TypeORM](https://github.com/typeorm/typeorm) 支持仓储设计模式，因此每个实体都有自己的 Repository。这些仓储可以从数据库连接中获取。

但首先，我们需要至少一个实体。我们将复用官方文档中的 `Photo` 实体。

 ```typescript title="photo.entity.ts"
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Photo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 500 })
  name: string;

  @Column('text')
  description: string;

  @Column()
  filename: string;

  @Column('int')
  views: number;

  @Column()
  isPublished: boolean;
}
```

`Photo` 实体属于 `photo` 目录，该目录代表 `PhotoModule`。现在让我们创建一个 **Repository** 提供者：

 ```typescript title="photo.providers.ts"
import { DataSource } from 'typeorm';
import { Photo } from './photo.entity';

export const photoProviders = [
  {
    provide: 'PHOTO_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Photo),
    inject: ['DATA_SOURCE'],
  },
];
```

:::warning 注意
 在实际应用中应避免使用**魔术字符串** 。`PHOTO_REPOSITORY` 和 `DATA_SOURCE` 都应保存在单独的 `constants.ts` 文件中。
:::

现在我们可以使用 `@Inject()` 装饰器将 `Repository<Photo>` 注入到 `PhotoService` 中：

 ```typescript title="photo.service.ts"
import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Photo } from './photo.entity';

@Injectable()
export class PhotoService {
  constructor(
    @Inject('PHOTO_REPOSITORY')
    private photoRepository: Repository<Photo>,
  ) {}

  async findAll(): Promise<Photo[]> {
    return this.photoRepository.find();
  }
}
```

数据库连接是**异步**的，但 Nest 使得这个过程对终端用户完全透明。`PhotoRepository` 会等待数据库连接就绪，而 `PhotoService` 则会延迟到存储库可用时才初始化。整个应用将在每个类实例化完成后启动。

以下是最终的 `PhotoModule`：

 ```typescript title="photo.module.ts"
import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { photoProviders } from './photo.providers';
import { PhotoService } from './photo.service';

@Module({
  imports: [DatabaseModule],
  providers: [
    ...photoProviders,
    PhotoService,
  ],
})
export class PhotoModule {}
```

:::info 提示
别忘了将 `PhotoModule` 导入根模块 `AppModule` 中。
:::


