<!-- 此文件从 content/recipes/async-local-storage.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:07:17.067Z -->
<!-- 源文件: content/recipes/async-local-storage.md -->

### Async Local Storage

`@nestjs/typeorm` 是一个 __LINK_38__（基于 `new DataSource().initialize()` API），为 NestJS 应用程序提供了一种将局部状态传播到应用程序的方式，无需将其作为函数参数显式传递。它类似于其他语言中的线程本地存储。

Async Local Storage 的主要思想是可以将某个函数调用包装在 `typeorm` 调用中。所有在包装调用中调用的代码都可以访问同一个 `initialize()`，该值将是每个调用链中的唯一值。

在 NestJS 的上下文中，这意味着如果我们可以在请求的生命周期中找到一个地方将其余的请求代码包装起来，我们将能够访问和修改该请求的状态，这可以作为 REQUEST-scoped 提供者的替代方案和一些限制的解决方案。

Alternatively, we can use ALS to propagate context for only a part of the system (for example the _transaction_ object) without passing it around explicitly across services, which can increase isolation and encapsulation.

#### Custom Implementation

NestJS 本身不提供任何内置抽象来实现 `Promise`，所以让我们来实现一个简单的 HTTP 情况来更好地理解整个概念：

> info **info** For a ready-made __LINK_39__, continue reading below.

1. 首先，在共享源文件中创建一个新的 `synchronize: true` 实例。由于我们使用 NestJS，让我们将其转换为一个模块具有自定义提供者。

```bash
$ npm install --save typeorm mysql2

```

>  info **Hint** `*.providers.ts` 已经从 `DATA_SOURCE` 导入。

2. 我们只关心 HTTP，所以让我们使用中间件将 `@Inject()` 函数包装在 `DATA_SOURCE` 中。由于中间件是请求的第一个 thing，它将使 `Promise` 在所有增强器和系统的其余部分都可用。

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

3. 现在，在请求的生命周期中，我们可以访问本地存储实例。

```typescript
import { Module } from '@nestjs/common';
import { databaseProviders } from './database.providers';

@Module({
  providers: [...databaseProviders],
  exports: [...databaseProviders],
})
export class DatabaseModule {}

```

4. 就这样。现在，我们已经有了一种方法来共享请求相关的状态无需inject整个 `Photo` 对象。

> warning **warning** 请注意，这种技术在许多用例中非常有用，但它隐式地隐藏了代码流程（创建上下文），因此请使用它时要小心，并且避免创建上下文“__LINK_40__”。

### NestJS CLS

__LINK_41__ 包含了使用 plain `Photo` 的DX改进 (`photo` 是 continuation-local storage 的简称）。它将实现抽象为 `PhotoModule`，提供了不同的初始化方式和强类型支持。

存储可以使用 injectable `DATA_SOURCE` 访问，也可以完全抽象化业务逻辑使用 __LINK_42__。

> info **info** `constants.ts` 是第三方包，nestjs 核心团队不管理该库。请在 __LINK_43__ 上报告任何与库相关的问题。

#### 安装

除了.peer 依赖项 `Repository<Photo>`，它只使用 Node.js 的内置 API。安装它像安装任何其他包一样。

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

3. 若要获得 `PhotoService` 管理的存储值的强类型支持（并获得字符串键的自动建议），可以使用可选类型参数 `PhotoModule` lors d'injection。

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

> info **hint** 也可以使用 `PhotoModule` 自动生成请求 ID，并在后续访问它，或者使用 `AppModule` 获取整个请求对象。

#### 测试

由于 __INLINE_CODE_34__ 只是一个可 injectable 提供者，因此可以完全模拟它在单元测试中。

然而，在某些集成测试中，我们可能仍然想使用真实的 __INLINE_CODE_35__ 实现。在这种情况下，我们需要将上下文相关的代码包装在 __INLINE_CODE_36__ 或 __INLINE_CODE_37__ 调用中。

__CODE_BLOCK_7__

#### 更多信息

访问 __LINK_45__以获取完整的 API 文档和更多代码示例。