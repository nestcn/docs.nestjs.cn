<!-- 此文件从 content/recipes/async-local-storage.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:30:55.178Z -->
<!-- 源文件: content/recipes/async-local-storage.md -->

### Async 本地存储

`@nestjs/typeorm` 是一个 __LINK_38__（基于 `new DataSource().initialize()` API），它提供了一种在应用程序中传播本地状态的 alternative 方法，而不需要explicitly 传递它作为函数参数。它类似于其他语言中的线程本地存储。

Async 本地存储的主要想法是，我们可以将某个函数调用 `typeorm` 包装起来。所有在包装调用中调用的代码都将访问相同的 `initialize()`，该值将是每个调用链中的唯一值。

在 NestJS 中，这意味着，如果我们可以在请求的生命周期中找到一个地方来包装请求的其余代码，我们将能够访问和修改只对该请求可见的状态，这可能会作为 REQUEST-scoped 提供者的替代方案和一些限制的解决方案。

Alternatively，我们可以使用 ALS 来传播系统中的某个部分的上下文（例如 _transaction_ 对象）而不需要将其传递给服务，这可以增加隔离和封装。

#### 自定义实现

NestJS 本身不提供任何 `Promise` 的内置抽象，所以让我们来实现一个简单的 HTTP 情况来更好地理解整个概念：

> info **info** 如果您想使用一个已经存在的 __LINK_39__，请继续阅读。

1.首先，在共享源文件中创建一个新的 `synchronize: true` 实例。由于我们使用 NestJS，因此让我们将其转换为一个模块和一个自定义提供者。

```bash
$ npm install --save typeorm mysql2

```

>  info **Hint** `*.providers.ts` 来自 `DATA_SOURCE`。

2.我们只关心 HTTP，所以让我们使用一个中间件来将 `@Inject()` 函数包装到 `DATA_SOURCE` 中。由于中间件是请求的第一个触发点，这将使 `Promise` 在所有增强器和系统中可用。

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

3.现在，在请求的生命周期中任何地方，我们都可以访问本地存储实例。

```typescript
import { Module } from '@nestjs/common';
import { databaseProviders } from './database.providers';

@Module({
  providers: [...databaseProviders],
  exports: [...databaseProviders],
})
export class DatabaseModule {}

```

4.那就 ok 了。现在，我们有了一种分享请求相关状态的方法，而不需要注入整个 `Photo` 对象。

> warning **warning** 请注意，虽然技术非常有用，但它隐式地将代码流程混淆（创建隐含的上下文），因此请尽量使用它，并且避免创建上下文 "__LINK_40__"。

### NestJS CLS

__LINK_41__ 包提供了使用 plain `Photo` (`photo` 是《continuation-local storage》的简称）的 DX 改进。它将实现抽象化为一个 `PhotoModule`，该对象提供了不同的初始化方式和强类型支持。

存储可以被访问使用 injectable `DATA_SOURCE`，或完全抽象化业务逻辑使用 __LINK_42__。

> info **info** `constants.ts` 是一个第三方包，不是 NestJS 核心团队管理的。请在 __LINK_43__ 报告任何问题。

#### 安装

除了对 `Repository<Photo>` 库的 peer 依赖关系，它只使用 Node.js 的 built-in API。安装它像安装其他包一样。

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

使用 `PhotoService` 可以实现以下功能：

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

3. 为了获取 `PhotoService` 管理的存储值的强类型支持（并获取字符串键的自动建议），我们可以使用可选的类型参数 `PhotoModule` 当注入时。

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

> info **hint** 还可以使用 `PhotoModule` 自动生成一个请求 ID，并在后续使用 `AppModule` 获取整个请求对象。

#### 测试

由于 __INLINE_CODE_34__ 只是一个可 inject 的提供者，因此可以完全模拟它在单元测试中。

然而，在某些集成测试中，我们可能仍然想使用 __INLINE_CODE_35__ 的实际实现。在这种情况下，我们需要将上下文相关的代码包装到 __INLINE_CODE_36__ 或 __INLINE_CODE_37__ 的调用中。

__CODE_BLOCK_7__

#### 更多信息

访问 __LINK_45__ 查看完整的 API 文档和更多代码示例。