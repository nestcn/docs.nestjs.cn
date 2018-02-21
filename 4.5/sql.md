## SQL

为了减少开始与数据库进行连接所需的样板, Nest 提供了随时可用的 @nestjs/typeorm 软件包。我们选择了 TypeORM, 因为它绝对是 Node.js 中可用的最成熟的对象关系映射器 (ORM)。由于它是用TypeScript编写的，所以它在Nest框架下运行得非常好。

首先，我们需要安装所有必需的依赖关系：

```bash
$ npm install --save @nestjs/typeorm typeorm mysql
```

?> 在本章中，我们将使用MySQL数据库，但TypeORM提供了许多不同的支持，如PostgreSQL，SQLite甚至MongoDB（NoSQL）。

一旦安装完成，我们可以将其 TypeOrmModule 导入到根目录中 ApplicationModule 。

> app.module.ts

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'test',
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
  ],
})
export class ApplicationModule {}
```

forRoot() 方法接受与 TypeORM 包中的 createConnection() 相同的配置对象。此外, 我们可以在项目根目录中创建一个 ormconfig.json 文件, 而不是将任何内容传递给它。

> ormconfig.json

```javascript
{
  "type": "mysql",
  "host": "localhost",
  "port": 3306,
  "username": "root",
  "password": "root",
  "database": "test",
  "entities": ["src/**/**.entity{.ts,.js}"],
  "synchronize": true
}
```

现在我们可以简单地将圆括号留空：

> app.module.ts

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forRoot()],
})
export class ApplicationModule {}
```

之后，Connection 和 EntityManager 将可用于注入整个项目（无需导入任何其他模块），例如以这种方式：

> app.module.ts

```typescript
import { Connection } from 'typeorm';

@Module({
  imports: [TypeOrmModule.forRoot(), PhotoModule],
})
export class ApplicationModule {
  constructor(private readonly connection: Connection) {}
}
```

## 存储库模式

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

让我们看看 PhotoModule:

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PhotoService } from './photo.service';
import { PhotoController } from './photo.controller';
import { Photo } from './photo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Photo])],
  components: [PhotoService],
  controllers: [PhotoController],
})
export class PhotoModule {}
```


此模块使用 forFeature() 方法定义应在当前范围内注册的存储库。

现在, 我们可以使用 @InjectRepository() 修饰器向 PhotoService 注入 PhotoRepository:

> photo/photo.service.ts

```typescript
import { Component, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Photo } from './photo.entity';

@Component()
export class PhotoService {
  constructor(
    @InjectRepository(Photo)
    private readonly photoRepository: Repository<Photo>,
  ) {}

  async findAll(): Promise<Photo[]> {
    return await this.photoRepository.find();
  }
}
```

就这样。完整的源代码在[这里](https://github.com/nestjs/nest/tree/master/examples/05-sql-typeorm)可用。

?> 不要忘记将 PhotoModule 导入根 ApplicationModule。
