# 秘籍

## SQL（TypeORM）

!> 在本文中，您将学习如何使用自定义组件从头开始 基于TypeORM 包创建的 DatabaseModule。因此，此解决方案包含许多额外开销，您可以使用开箱即用的  @nestjs/typeorm 。要了解更多信息，请参阅[此处](4.6/techniques?id=sql)。

TypeORM 无疑是 node.js 界中最成熟的对象关系映射器（ORM）。由于它是用 TypeScript 编写的，所以它在 Nest 框架下运行得非常好。要开始使用这个库，我们必须安装所有必需的依赖关系：

```bash
$ npm install --save typeorm mysql
```

我们需要做的第一步是使用 从 typeorm 包中的 createConnection() 函数建立与我们数据库的连接。该createConnection() 函数返回 Promise，所以有必要创建一个异步组件。

> database.providers.ts

```typescript
import { createConnection } from 'typeorm';

export const databaseProviders = [
  {
    provide: 'DbConnectionToken',
    useFactory: async () => await createConnection({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'test',
      entities: [
          __dirname + '/../**/*.entity{.ts,.js}',
      ],
      autoSchemaSync: true,
    }),
  },
];
```

?> 遵循最佳做法，我们已在具有*.providers.ts后缀的分隔文件中声明了自定义组件。

然后，我们需要导出这些提供程序，以使其可以在应用程序的其它部分访问它们。

> database.module.ts

```typescript
import { Module } from '@nestjs/common';
import { databaseProviders } from './database.providers';

@Module({
  components: [...databaseProviders],
  exports: [...databaseProviders],
})
export class DatabaseModule {}
```

这就是所有。现在我们可以通过 Connection 使用 @Inject() 装饰器注入对象。每个依赖于 Connection 异步组件的组件都将等待，直到 Promise 解决。

### 存储库模式

该TypeORM支持库的设计模式，使每个实体都有自己的仓库。这些存储库可以从数据库连接中获取。

首先，我们至少需要一个实体。我们将重用 Photo 官方文档中的实体。

> photo/photo.entity.ts

```typescript
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

该 Photo 实体属于该 photo 目录。这个目录代表了 PhotoModule。这是你决定在哪里保留你的模型文件。从我的观点来看，最好的方法是将它们放在他们的域中, 放在相应的模块目录中。

我们来创建一个 Repository 组件：

> photo.providers.ts

```typescript
import { Connection, Repository } from 'typeorm';
import { Photo } from './photo.entity';

export const photoProviders = [
  {
    provide: 'PhotoRepositoryToken',
    useFactory: (connection: Connection) => connection.getRepository(Photo),
    inject: ['DbConnectionToken'],
  },
];
```

!> 在真实使用中，你应该避免使用魔术字符串。双方 PhotoRepositoryToken 和 DbConnectionToken 应保持在不同的constants.ts 文件。

现在我们可以注入 PhotoRepository 到 PhotoService 使用 @Inject() 装饰器。

> photo.service.ts

```typescript
import { Component, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Photo } from './photo.entity';

@Component()
export class PhotoService {
  constructor(
    @Inject('PhotoRepositoryToken') private readonly photoRepository: Repository<Photo>) {}

  async findAll(): Promise<Photo[]> {
    return await this.photoRepository.find();
  }
}
```

数据库连接是异步的，但 Nest 使最终用户对此进程完全不可见。该 PhotoRepository 组件正在等待数据库连接，并且PhotoService 被推迟直到存储库准备好使用。整个应用程序可以在每个组件实例化时启动。

这是一个 最终 PhotoModule：

> photo.module.ts

```typescript
import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { photoProviders } from './photo.providers';
import { PhotoService } from './photo.service';

@Module({
  imports: [DatabaseModule],
  components: [
    ...photoProviders,
    PhotoService,
  ],
})
export class PhotoModule {}
```

?> 不要忘记将 PhotoModule 导入根 ApplicationModule。

## MongoDB (Mongoose)

（待翻译，不推荐使用）

## SQL（Sequelize）

（待翻译）

## 身份验证（Passport）

（待翻译）

## CORS

（待翻译）

## OpenAPI (Swagger)

（待翻译）

## MongoDB E2E Testing

（待翻译，不推荐使用）