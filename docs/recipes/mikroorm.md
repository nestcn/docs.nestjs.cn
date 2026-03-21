<!-- 此文件从 content/recipes/mikroorm.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-21T16:13:54.109Z -->
<!-- 源文件: content/recipes/mikroorm.md -->

### MikroORM

这篇食谱旨在帮助用户快速开始使用 MikroORM 在 Nest 中。MikroORM 是 TypeScript ORM 的 Node.js 版本，基于 Data Mapper、Unit of Work 和 Identity Map 模式。它是一个 TypeORM 的不错替代品，迁移到 TypeORM 应该相对容易。关于 MikroORM 的完整文档可以在 __LINK_59__ 中找到。

> 信息 **info** `Sequelize` 是第三方包，且不是 NestJS 核心团队管理的。请在 __LINK_60__ 中报告任何与该库相关的问题。

#### 安装

将 MikroORM 和 Nest 集成的最简单方法是通过 __LINK_61__。

```bash
$ npm install --save sequelize sequelize-typescript mysql2
$ npm install --save-dev @types/sequelize

```

MikroORM 还支持 `Cat`、`cats` 和 `CatsModule`。有关所有驱动程序的文档可以在 __LINK_62__ 中找到。

安装完成后，我们可以将 `CATS_REPOSITORY` 导入到根 `SEQUELIZE` 中。

```typescript
import { Sequelize } from 'sequelize-typescript';
import { Cat } from '../cats/cat.entity';

export const databaseProviders = [
  {
    provide: 'SEQUELIZE',
    useFactory: async () => {
      const sequelize = new Sequelize({
        dialect: 'mysql',
        host: 'localhost',
        port: 3306,
        username: 'root',
        password: 'password',
        database: 'nest',
      });
      sequelize.addModels([Cat]);
      await sequelize.sync();
      return sequelize;
    },
  },
];

```

`constants.ts` 方法接受与 MikroORM 包中的 `CATS_REPOSITORY` 配置对象相同的配置对象。有关完整配置文档，可以在 __LINK_63__ 中找到。

或者，我们可以 __LINK_64__ 通过创建一个配置文件 `CatsService`，然后在没有参数的情况下调用 `@Inject()`。

```typescript
import { Module } from '@nestjs/common';
import { databaseProviders } from './database.providers';

@Module({
  providers: [...databaseProviders],
  exports: [...databaseProviders],
})
export class DatabaseModule {}

```

然而，在使用树摇工具时，这不会起作用。在这种情况下，提供 config 显式地：

```typescript
import { Table, Column, Model } from 'sequelize-typescript';

@Table
export class Cat extends Model {
  @Column
  name: string;

  @Column
  age: number;

  @Column
  breed: string;
}

```

然后，`CATS_REPOSITORY` 将可供整个项目中注入（不需要在其他模块中导入）。

```typescript
import { Cat } from './cat.entity';

export const catsProviders = [
  {
    provide: 'CATS_REPOSITORY',
    useValue: Cat,
  },
];

```

> 信息 **info** 注意 `CatsService` 是从 `CatsModule` 包中导入的，其中驱动程序是 `CatsModule`、`AppModule`、__INLINE_CODE_30__ 或您使用的驱动程序。如果您已经安装了 __INLINE_CODE_31__ 作为依赖项，可以从那里导入 __INLINE_CODE_32__。

#### 仓库

MikroORM 支持仓库设计模式。对于每个实体，我们可以创建一个仓库。有关仓库的完整文档，可以在 __LINK_65__ 中找到。要定义当前作用域中应该注册哪些仓库，可以使用 __INLINE_CODE_33__ 方法。例如：

> 信息 **info** 您 shouldn't 通过 __INLINE_CODE_34__ 注册基本实体，因为没有这些实体的仓库。然而，基本实体需要在 __INLINE_CODE_35__ (或 ORM 配置中)中列出。

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { CreateCatDto } from './dto/create-cat.dto';
import { Cat } from './cat.entity';

@Injectable()
export class CatsService {
  constructor(
    @Inject('CATS_REPOSITORY')
    private catsRepository: typeof Cat
  ) {}

  async findAll(): Promise<Cat[]> {
    return this.catsRepository.findAll<Cat>();
  }
}

```

然后，将其导入到根 __INLINE_CODE_36__ 中：

```typescript
import { Module } from '@nestjs/common';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';
import { catsProviders } from './cats.providers';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [CatsController],
  providers: [
    CatsService,
    ...catsProviders,
  ],
})
export class CatsModule {}

```

这样，我们可以使用 __INLINE_CODE_39__ 装饰器将 __INLINE_CODE_37__ 注入到 __INLINE_CODE_38__ 中：

__CODE_BLOCK_7__

#### 使用自定义仓库

当使用自定义仓库时，我们不再需要 __INLINE_CODE_40__ 装饰器，因为 Nest DI 基于类引用解析。

__CODE_BLOCK_8__

由于自定义仓库的名称与 __INLINE_CODE_41__ 将返回的名称相同，我们不需要 __INLINE_CODE_42__ 装饰器：

__CODE_BLOCK_9__

#### 自动加载实体

手动将实体添加到连接选项的实体数组中可能很麻烦。此外，引用实体从根模块中会破坏应用程序域边界，并将实现细节泄露到应用程序的其他部分。为了解决这个问题，可以使用静态 glob 路径。

请注意，glob 路径不受 webpack 支持，因此如果您在 monorepo 中构建应用程序，那么无法使用它们。为了解决这个问题，提供了一种alternative 解决方案。要自动加载实体，可以将 __INLINE_CODE_43__ 属性设置为 __INLINE_CODE_45__，如下所示：

__CODE_BLOCK_10__

在这种情况下，每个通过 __INLINE_CODE_46__ 方法注册的实体都会自动添加到配置对象的实体数组中。

> 信息 **info** 注意，这些实体不会通过 __INLINE_CODE_47__ 方法注册，但是在实体中被引用（通过关系），这些实体将不会被 __INLINE_CODE_48__ 设置包括在内。

> 信息 **info** 使用 __INLINE_CODE_49__ 也不会对 MikroORM CLI 产生影响——对于 CLI，我们仍然需要完整的实体列表。在另一方面，我们可以在 CLI 中使用 globs，因为 CLI 不会经过 webpack。

#### 序列化

> 警告 **Note** MikroORM 将每个实体关系都包装在一个 __INLINE_CODE_50__ 或 __INLINE_CODE_51__ 对象中，以提供更好的类型安全性。这将使 __LINK_66__ 对于任何包装关系视为盲目。换言之，如果您返回 MikroORM 实体从 HTTP 或 WebSocket 处理程序中，那么所有关系将不会被序列化。

幸运的是，MikroORM 提供了一个 __LINK_67__，可以用作 __INLINE_CODE_52__。

__CODE_BLOCK根据 NestJS 相关技术文档的翻译要求，我们将以下英文技术文档翻译成中文。

NestJS 中，我们需要为每个请求保持一个干净的状态。这是由 __INLINE_CODE_53__ 帮助函数自动处理的，这个帮助函数通过中间件注册。

然而，中间件只在处理常规 HTTP 请求时执行。如果我们需要在非常规 HTTP 请求处理外使用请求作用域方法，例如队列处理或计划任务？

我们可以使用 __INLINE_CODE_54__ 装饰器。这个装饰器需要您首先将 __INLINE_CODE_55__ 实例注入当前上下文，然后它将用于创建上下文。 decorate  underlyingly 会将新的请求上下文注册到您的方法中，并在上下文中执行方法。

__CODE_BLOCK_12__

> 警告 **注意** 名称暗示，这个装饰器总是创建新的上下文，而不是像其备选 __INLINE_CODE_56__ 一样，只有在已经在另一个上下文中时才创建。

#### 测试

__INLINE_CODE_57__ 包含 __INLINE_CODE_58__ 函数，该函数根据给定的实体返回准备好的令牌，以便模拟存储库。

__CODE_BLOCK_13__

#### 示例

NestJS 与 MikroORM 的实际示例可以在 __LINK_69__ 找到。