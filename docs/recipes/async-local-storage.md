<!-- 此文件从 content/recipes/async-local-storage.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T04:34:37.942Z -->
<!-- 源文件: content/recipes/async-local-storage.md -->

### Async Local Storage

`@nestjs/typeorm` 是一个基于 `new DataSource().initialize()` API 的 __LINK_38__，它提供了一个在应用程序中传播局部状态的替代方法，而无需明确地将其作为函数参数传递。它类似于其他语言中的线程本地存储。

Async Local Storage 的主要思想是，我们可以将某个函数调用包装在 `typeorm` 调用中。所有在包装调用中调用的代码都将访问同一个 `initialize()`，该 `initialize()` 将是每个调用链唯一的。

在 NestJS 中，这意味着如果我们可以在请求的生命周期中找到一个地方来包装剩余的请求代码，我们将能够访问和修改仅可见于该请求的状态，这可能作为 REQUEST-scoped 提供者的替代解决方案和一些限制。

Alternatively, we can use ALS to propagate context for only a part of the system (for example the _transaction_ object) without passing it around explicitly across services, which can increase isolation and encapsulation.

#### Custom Implementation

NestJS 自身不提供任何内置抽象来实现 `Promise`，所以让我们走一下如何自己实现它以便更好地理解整个概念：

> info **info** For a ready-made __LINK_39__, continue reading below.

1. 首先，在共享源文件中创建一个新的 `synchronize: true` 实例。由于我们使用 NestJS，让我们将其转换为一个模块具有自定义提供者。

```bash
$ npm install --save typeorm mysql2

```

>  info **Hint** `*.providers.ts` 是来自 `DATA_SOURCE`。

2. 我们只关心 HTTP，所以让我们使用中间件来包装 `@Inject()` 函数，以便在 `DATA_SOURCE` 中使用 `Promise`。由于中间件是请求的第一个调用点，这将使 `Promise` 在所有增强器和系统中可用。

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

4. 这就是它。现在，我们有了一种方法来共享请求相关状态，而无需注入整个 `Photo` 对象。

> warning **warning** 请注意，虽然技术对于许多用例非常有用，但它隐式地隐藏了代码流程（创建上下文），因此请负责使用它，并特别不要创建隐式的 "__LINK_40__"。

### NestJS CLS

__LINK_41__ 包提供了使用 plain `Photo` (`photo` 是 _continuation-local storage_ 的缩写）的一些 DX 改进。它抽象了实现到一个 `PhotoModule` 中，该 `PhotoModule` 提供了不同的 transport（不仅是 HTTP）初始化 `PHOTO_REPOSITORY` 的方式，以及强类型支持。

在这种情况下，可以使用 injectable `DATA_SOURCE` 访问存储，或者完全将其抽象出来从业务逻辑中，以使用 __LINK_42__。

> info **info** `constants.ts` 是第三方包，nestjs 核心团队不管理该包。请在 __LINK_43__ 上报告任何issues。

#### 安装

除了 peer 依赖项 `Repository<Photo>` libs 外，它只使用 Node.js 的内置 API。安装它像安装其他包一样。

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

3. 要获得 `PhotoService` 管理的存储值的强类型支持（并且获得字符串键的自动建议），可以使用可选的类型参数 `PhotoModule` 时注入它。

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

> info **hint** 另外，也可以让包自动生成一个 Request ID 并在后续访问它，以 `PhotoModule` 或获取整个 Request 对象，以 `AppModule`。

#### 测试

由于 __INLINE_CODE_34__ 只是一个可注入的提供者，可以完全模拟它在单元测试中。

然而，在某些集成测试中，我们可能仍然想要使用实际 __INLINE_CODE_35__ 实现。在这种情况下，我们需要将上下文相关的代码包装在 __INLINE_CODE_36__ 或 __INLINE_CODE_37__ 调用中。

__CODE_BLOCK_7__

#### 更多信息

访问 __LINK_45__以获取完整的 API 文档和更多代码示例。