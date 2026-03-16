<!-- 此文件从 content/recipes/async-local-storage.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T05:03:08.414Z -->
<!-- 源文件: content/recipes/async-local-storage.md -->

### 异步本地存储

`@nestjs/typeorm` 是一个基于 `new DataSource().initialize()` API 的 __LINK_38__，它提供了一种将本地状态传播到应用程序的替代方法，不需要将其作为函数参数显式传递。它类似于其他语言中的线程本地存储。

Async Local Storage 的主要思想是，我们可以将某个函数调用包装到 `typeorm` 调用中。所有在包装调用中调用的代码都将访问同一个 `initialize()`，这个 `initialize()` 将是每个调用链中的唯一的。

在 NestJS 的上下文中，这意味着如果我们可以在请求的生命周期中找到一个包装剩余请求代码的地方，我们将能够访问和修改仅供该请求可见的状态，这可能会作为 REQUEST-scoped 提供者的替代方案和一些限制的解决方案。

Alternatively，我们可以使用 ALS 传播上下文，只对某个系统的一部分（例如 _transaction_ 对象）进行传播，而不需要将其跨越服务，增加隔离和封闭。

#### 自定义实现

NestJS 本身不提供任何内置抽象来实现 `Promise`，所以让我们通过实现最简单的 HTTP Case 来了解整个概念：

> info **info** 为了获取已经实现的 __LINK_39__，请继续阅读。

1. 首先，在共享源文件中创建一个新的 `synchronize: true` 实例。由于我们使用 NestJS，让我们将其转换为一个模块的自定义提供者。

```bash
$ npm install --save typeorm mysql2

```

>  info **Hint** `*.providers.ts` 从 `DATA_SOURCE` 导入。

2. 我们只关心 HTTP，所以让我们使用中间件将 `@Inject()` 函数包装到 `DATA_SOURCE` 中。由于中间件是请求的第一个点，我们可以在 enhancers 和系统的其余部分中访问 `Promise`。

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

4. 这样，我们就有了一种分享请求相关状态的方法，而不需要将整个 `Photo` 对象注入。

> warning **warning** 请注意，这种技术在许多用例中都是有用的，但是它隐式地使代码流程变得复杂（创建上下文），因此请在使用时保持责任。

### NestJS CLS

__LINK_41__ 包提供了使用 plain `Photo` (`photo` 是 _continuation-local storage_ 的缩写）的 DX 改进。它将实现抽象为一个 `PhotoModule`，提供了多种方式来初始化 `PHOTO_REPOSITORY` 以适应不同的传输方式（不仅限于 HTTP），并且提供了强类型支持。

存储可以使用 injectable `DATA_SOURCE` 访问，也可以完全抽象出来，从业务逻辑中分离出来使用 __LINK_42__。

> info **info** `constants.ts` 是一个第三方包，不是 NestJS 核心团队管理的包。请在 __LINK_43__ 报告任何发现的错误。

#### 安装

除了对 `Repository<Photo>` 库的 peer 依赖关系外，它只使用 Node.js 的内置 API。安装它就像安装其他包一样。

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

可以使用 `PhotoService` 实现类似的功能，例如：

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

3. 要获取 strong-typing 的存储值（同时获取 string 键的自动建议），我们可以使用可选的 type 参数 `PhotoModule` 时注入它。

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

> info **hint** 还可以使用 `PhotoModule` 自动生成请求 ID，并在将来访问它，或者使用 `AppModule` 获取整个请求对象。

#### 测试

由于 __INLINE_CODE_34__ 只是一个可 inject 的提供者，因此可以在单元测试中完全模拟它。

然而，在某些集成测试中，我们可能仍然想使用真实的 __INLINE_CODE_35__ 实现。在这种情况下，我们需要将上下文相关的代码包装到 __INLINE_CODE_36__ 或 __INLINE_CODE_37__ 中。

__CODE_BLOCK_7__

#### 更多信息

请访问 __LINK_45__ 获取完整的 API 文档和更多代码示例。