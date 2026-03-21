<!-- 此文件从 content/recipes/async-local-storage.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-21T16:13:30.034Z -->
<!-- 源文件: content/recipes/async-local-storage.md -->

### Async Local Storage

`@nestjs/typeorm` 是一个基于`new DataSource().initialize()` API 的__LINK_38__，它提供了一个在应用程序中传播局部状态的替代方法，不需要显式将其作为函数参数传递。它类似于其他语言中的线程本地存储。

Async Local Storage 的主要思想是将某个函数调用包装在 `typeorm` 调用中。所有在包装调用中调用的代码都可以访问同一个 `initialize()`，这个 `initialize()` 将是每个调用链的唯一值。

在 NestJS 中，这意味着如果我们可以在请求的生命周期中找到一个地方来包装请求的剩余代码，我们就可以访问和修改只能在该请求中可见的状态，这可能作为 REQUEST-scoped 提供者的替代方案和一些限制的解决方案。

Alternatively, 我们也可以使用 ALS 传播某个系统的上下文（例如 _transaction_ 对象），而不需要将其传递给服务，这可以增加隔离和封装。

#### 自定义实现

NestJS 自身不提供任何内置抽象来实现 `Promise`，所以让我们来实现一个简单的 HTTP 实现，以获取更好的理解：

> info **info** For a ready-made __LINK_39__, continue reading below.

1. 首先，在共享源文件中创建一个新的 `synchronize: true` 实例。由于我们使用 NestJS，let's 也将其转换为一个模块，具有自定义提供者。

```bash
$ npm install --save typeorm mysql2

```

>  info **Hint** `*.providers.ts` 来自 `DATA_SOURCE`。

2. 我们只关心 HTTP，所以使用 middleware 将 `@Inject()` 函数包装在 `DATA_SOURCE` 中。由于 middleware 是请求的第一个 hit，这将使 `Promise` 在所有增强器和系统中可用。

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

4.That's it。现在我们有了一种分享请求相关状态的方法，而不需要注入整个 `Photo` 对象。

> warning **warning** 请注意，这种技术对于许多用例非常有用，但隐式创建上下文，创建隐式的“__LINK_40__”，因此请使用它谨慎。

### NestJS CLS

__LINK_41__ 包提供了使用 plain `Photo` (`photo` 是 _continuation-local storage_ 的缩写）的多个改进。它将实现抽象为一个 `PhotoModule`，该对象提供了多种初始化方式和强类型支持。

存储可以使用 injectable `DATA_SOURCE` 访问，也可以完全抽象到业务逻辑中，使用 __LINK_42__。

> info **info** `constants.ts` 是一个第三方包，且不是 NestJS 核心团队管理的。请在 __LINK_43__ 上报告任何问题。

#### 安装

除了对 `Repository<Photo>`  libs 的 peer 依赖外，它只使用 Node.js 的内置 API。安装它就像安装其他包一样。

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

使用 `PhotoService` 可以实现类似 __LINK_44__ 的功能：

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

2. 然后可以使用 `PhotoRepository` 访问存储值。

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

3. 为了获取强类型的存储值，使用 `PhotoService` 时可以添加可选的类型参数 `PhotoModule`。

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

> info **hint** 可以使用 `PhotoModule` 自动生成请求 ID，并在将来使用它，也可以使用 `AppModule` 获取整个请求对象。

#### 测试

由于 __INLINE_CODE_34__ 只是一个可 inject 的提供者，可以完全模拟它在单元测试中。

然而，在某些集成测试中，我们可能仍然想要使用真实的 __INLINE_CODE_35__ 实现。在这种情况下，我们需要将上下文相关的代码包装在 __INLINE_CODE_36__ 或 __INLINE_CODE_37__ 调用中。

__CODE_BLOCK_7__

#### 更多信息

请访问 __LINK_45__ 获取完整的 API 文档和更多代码示例。