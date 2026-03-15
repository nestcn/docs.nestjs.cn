<!-- 此文件从 content/recipes/async-local-storage.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T04:49:46.137Z -->
<!-- 源文件: content/recipes/async-local-storage.md -->

### Async Local Storage

`@nestjs/typeorm` 是一个基于 `new DataSource().initialize()` API 的 __LINK_38__,它提供了一个在应用程序中传播局部状态的 alternative 方法，不需要显式地将其作为函数参数传递。它类似于其他语言中的线程本地存储。

Async Local Storage 的主要思想是可以将某个函数调用包装在 `typeorm` 调用中。所有在包装调用中调用的代码都将访问同一个 `initialize()`,该值将是每个调用链的唯一值。

在 NestJS 的情况下，这意味着如果我们可以在请求的生命周期中找到一个包装剩余请求代码的位置，我们就可以访问和修改仅在该请求中可见的状态，这可能作为 REQUEST-scoped 提供者的替代方案。

Alternatively,我们可以使用 ALS 来传播某个系统的上下文（例如 _transaction_ 对象），而不需要将其显式地传递给服务，这可以增加隔离和封装。

#### 自定义实现

NestJS 自身不提供任何内置抽象来实现 `Promise`,所以让我们来实现一个简单的 HTTP 案例，以更好地理解整个概念：

> info **info** 如果您想使用已经存在的 __LINK_39__,请继续阅读。

1. 首先，在共享源文件中创建一个新的 `synchronize: true` 实例。由于我们使用 NestJS，所以让我们将其转换为一个模块的自定义提供者。

```bash
$ npm install --save typeorm mysql2

```

>  info **Hint** `*.providers.ts` 从 `DATA_SOURCE` 导入。

2. 我们只关心 HTTP，所以让我们使用中间件将 `@Inject()` 函数包装在 `DATA_SOURCE` 中。由于中间件是请求的第一个触点，这将使 `Promise` 在所有增强器和系统中可用。

```typescript
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

3. 现在，在请求的生命周期中，我们可以访问局部存储实例。

```typescript
import { Module } from '@nestjs/common';
import { databaseProviders } from './database.providers';

@Module({
  providers: [...databaseProviders],
  exports: [...databaseProviders],
})
export class DatabaseModule {}

```

4. 就这样。现在我们有了一个方法来分享请求相关的状态，而不需要注入整个 `Photo` 对象。

> warning **warning** 请注意，使用技术时需要负责使用它，避免创建隐式上下文的链接 __LINK_40__。

### NestJS CLS

__LINK_41__ 包含了几个 DX 改进，用于使用 plain `Photo`。它将实现抽象化到一个 `PhotoModule` 中，这个 `PhotoModule` 提供了不同的初始化方式和强类型支持。

可以使用 injectable `DATA_SOURCE` 访问存储器，或者完全封装业务逻辑使用 __LINK_42__。

> info **info** `constants.ts` 是第三方包，并不是由 NestJS 核心团队管理的。请在 __LINK_43__ 上报告任何问题。

#### 安装

除了对 `Repository<Photo>` 的 peer 依赖关系外，它只使用 Node.js 的内置 API 安装它。

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

#### 使用

使用 `PhotoService` 可以实现与 __LINK_44__ 相似的功能：

1. 在根模块中导入 `@Inject()`。

```typescript
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

2. 然后可以使用 `PhotoRepository` 访问存储器值。

```typescript
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

3. 为了获取 `PhotoService` 管理的存储器值的强类型支持，可以使用可选的 type 参数 `PhotoModule`。

```typescript
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

> info **hint** 还可以使用 `PhotoModule` 获取自动生成的请求 ID，或者使用 `AppModule` 获取整个请求对象。

#### 测试

由于 __INLINE_CODE_34__ 只是一个 injectable 提供者，可以完全 mock 在单元测试中。

然而，在某些集成测试中，我们可能仍然想使用实际的 __INLINE_CODE_35__ 实现。在这种情况下，我们需要将上下文相关的代码包装在 __INLINE_CODE_36__ 或 __INLINE_CODE_37__ 调用中。

__CODE_BLOCK_7__

#### 更多信息

访问 __LINK_45__ 查看完整的 API 文档和更多代码示例。