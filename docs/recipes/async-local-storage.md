<!-- 此文件从 content/recipes/async-local-storage.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T04:27:56.990Z -->
<!-- 源文件: content/recipes/async-local-storage.md -->

### Async Local Storage

`@nestjs/typeorm` 是基于 `new DataSource().initialize()` API 的 __LINK_38__，提供了一种将局部状态传播到应用程序中的另一种方式，不需要在函数参数中显式传递。它类似于其他语言中的线程本地存储。

Async Local Storage 的主要思想是可以将某个函数调用包装在 `typeorm` 调用中。所有在包装调用中调用的代码都可以访问同一个 `initialize()`，该 `initialize()` 将是每个调用链唯一的。

在 NestJS 中，这意味着如果我们可以在请求的生命周期中找到一个地方来包装剩余的请求代码，我们将可以访问和修改该请求只能访问的状态，这可能会作为 REQUEST-scoped 提供者的替代方案和一些限制的解决方案。

Alternatively, we can use ALS to propagate context for only a part of the system (for example the _transaction_ object) without passing it around explicitly across services, which can increase isolation and encapsulation.

#### Custom Implementation

NestJS 本身不提供任何内置抽象来处理 `Promise`，因此让我们通过简单的 HTTP_case 来实现它，以更好地理解整个概念：

> info **info** For a ready-made __LINK_39__, continue reading below.

1. 首先，在共享源文件中创建一个新的 `synchronize: true` 实例。由于我们使用 NestJS，let's also turn it into a module with a custom provider.

```bash
$ npm install --save typeorm mysql2

```

>  info **Hint** `*.providers.ts` is imported from `DATA_SOURCE`.

2. 我们只关心 HTTP，所以让我们使用中间件来包装 `@Inject()` 函数，以 `DATA_SOURCE`。由于中间件是请求的第一个点，我们将使 `Promise` 可以在所有增强器和系统中访问。

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

4. 这样我们就有了一种分享请求相关状态的方法，而不需要注入整个 `Photo` 对象。

> warning **warning** 请注意，在使用技术时需要负责，避免创建隐式上下文。

### NestJS CLS

__LINK_41__ 包提供了使用 plain `Photo` (`photo` 是继续.local.storage 的简称）的 DX 改进。它将实现抽象为 `PhotoModule`，提供了不同的初始化方式和强类型支持。

存储可以被 injectable `DATA_SOURCE` 访问，也可以完全抽象出业务逻辑，使用 __LINK_42__。

> info **info** `constants.ts` 是第三方包，NestJS 核心团队不管理该库。请在 __LINK_43__ 报告任何问题。

#### 安装

除了 `Repository<Photo>` 库的 peer 依赖项，它只使用 Node.js API。安装它就像安装其他包一样。

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

类似于 __LINK_44__ 中描述的功能可以使用 `PhotoService` 实现：

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

3. 使用可选的 type 参数 `PhotoModule` 注入 `PhotoService` 可以获取强类型的存储值。

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

> info **hint** 还可以使用 `PhotoModule` 自动生成请求 ID，并在后续使用它，也可以使用 `AppModule` 获取整个请求对象。

#### 测试

由于 __INLINE_CODE_34__ 只是一种可 injectable 提供者，可以完全在单元测试中模拟。

然而，在某些集成测试中，我们可能仍然需要使用真实的 __INLINE_CODE_35__ 实现。在这种情况下，我们需要将上下文相关的代码包装在 __INLINE_CODE_36__ 或 __INLINE_CODE_37__ 调用中。

__CODE_BLOCK_7__

#### 更多信息

请访问 __LINK_45__ 获取完整的 API 文档和更多代码示例。