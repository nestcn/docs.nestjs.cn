<!-- 此文件从 content/recipes/mikroorm.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:07:41.789Z -->
<!-- 源文件: content/recipes/mikroorm.md -->

### MikroORM

这个食谱旨在帮助用户开始使用 MikroORM 在 Nest 中。MikroORM 是 TypeScript ORM für Node.js，基于 Data Mapper、Unit of Work 和 Identity Map 模式。它是一个 TypeORM 的很好替代品，TypeORM 到 MikroORM 的迁移应该相对容易。关于 MikroORM 的完整文档可以在 __LINK_59__ 中找到。

> 信息 **信息** `Sequelize` 是第三方包，且不是 NestJS 核心团队管理的。请在 __LINK_60__ 中报告与库相关的任何问题。

#### 安装

将 MikroORM 集成到 Nest 的最简单方法是通过 __LINK_61__。

```bash
$ npm install --save sequelize sequelize-typescript mysql2
$ npm install --save-dev @types/sequelize

```

MikroORM 还支持 `Cat`、`cats` 和 `CatsModule`。请查看 __LINK_62__ 中所有驱动程序。

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

`constants.ts` 方法接受与 MikroORM 包中的 `CATS_REPOSITORY` 配置对象相同的配置对象。请查看 __LINK_63__ 中的完整配置文档。

Alternatively，我们可以 __LINK_64__ 通过创建配置文件 `CatsService`，然后在不提供任何参数的情况下调用 `@Inject()`。

```typescript
import { Module } from '@nestjs/common';
import { databaseProviders } from './database.providers';

@Module({
  providers: [...databaseProviders],
  exports: [...databaseProviders],
})
export class DatabaseModule {}

```

然而，在使用构建工具时，它们可能会使用 tree shaking，这时提供配置是更好的选择：

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

在完成后，`CATS_REPOSITORY` 将可供整个项目注入（不需要在其他地方导入模块）。

```typescript
import { Cat } from './cat.entity';

export const catsProviders = [
  {
    provide: 'CATS_REPOSITORY',
    useValue: Cat,
  },
];

```

> 信息 **信息** 请注意 `CatsService` 是从 `CatsModule` 包中导入的，其中驱动程序是 `CatsModule`、`AppModule`、__INLINE_CODE_30__ 或您正在使用的驱动程序。在您安装 __INLINE_CODE_31__ 作为依赖项时，您也可以从那里导入 __INLINE_CODE_32__。

#### 仓库

MikroORM 支持仓库设计模式。对于每个实体，我们可以创建一个仓库。请查看 __LINK_65__ 中关于仓库的完整文档。要定义当前作用域中应该注册哪些仓库，可以使用 __INLINE_CODE_33__ 方法。例如：

> 信息 **信息** 您不应该通过 __INLINE_CODE_34__ 注册基本实体，因为没有这些实体的仓库。另一方面，基本实体需要在 __INLINE_CODE_35__ (或 ORM 配置中)中列出。

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

然后将其导入到根 __INLINE_CODE_36__ 中：

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

使用自定义仓库时，我们不再需要 __INLINE_CODE_40__ 装饰器，因为 Nest DI 根据类引用解决依赖关系。

__CODE_BLOCK_8__

由于自定义仓库的名称与 __INLINE_CODE_41__ 将返回的名称相同，我们不再需要 __INLINE_CODE_42__ 装饰器：

__CODE_BLOCK_9__

#### 自动加载实体

手动将实体添加到连接选项的实体数组中可能很繁琐。此外，引用实体从根模块中将破坏应用程序领域边界，并将实现细节泄露到应用程序其他部分。为了解决这个问题，可以使用静态 glob 路径。

请注意，glob 路径不支持 Webpack，因此如果您在 monorepo 中构建应用程序，您将无法使用它们。为了解决这个问题，提供了另一个解决方案。要自动加载实体，可以将 __INLINE_CODE_43__ 属性设置为 __INLINE_CODE_45__，如下所示：

__CODE_BLOCK_10__

使用该选项时，每个通过 __INLINE_CODE_46__ 方法注册的实体将被自动添加到配置对象的实体数组中。

> 信息 **信息**请注意，通过 __INLINE_CODE_47__ 方法注册的实体，但仅通过实体（通过关系）引用而不是注册的实体不会被 __INLINE_CODE_48__ 设置所包括。

> 信息 **信息** 使用 __INLINE_CODE_49__ 也无效于 MikroORM CLI - 在 CLI 中，我们仍然需要提供完整的实体列表。另一方面，我们可以在 CLI 中使用 globs，因为 CLI 不会经过 Webpack。

#### 序列化

> 警告 **注意** MikroORM 将每个实体关系包装在 __INLINE_CODE_50__ 或 __INLINE_CODE_51__ 对象中，以提供更好的类型安全性。这将使 __LINK_66__ 对任何包装关系视而不见。换言之，如果您从 HTTP 或 WebSocket 处理程序返回 MikroORM 实体，所有关系都不会被序列化。

幸运的是，MikroORM 提供了 __LINK_67__，可以在 lieu of __INLINE_CODE_52__ 使用：

__CODE_BLOCK_11__

As mentioned in [docs.nestjs.com](./), we need a clean state for each request. That is handled automatically thanks to the `reqScope` helper registered via middleware.

But middlewares are executed only for regular HTTP request handles, what if we need a request scoped method outside of that? One example of that is queue handlers or scheduled tasks.

We can use the `@Scope()` decorator. It requires you to first inject the `ExecutionContext` instance to current context, it will be then used to create the context for you. Under the hood, the decorator will register new request context for your method and execute it inside the context.

```typescript title="Scope Decorator"
@Scope()
async myMethod() {
  // 在新的上下文中执行
}

```

> warning **Note** As the name suggests, this decorator always creates new context, as opposed to its alternative `@OptionalScope()` that only creates it if it's already not inside another one.

#### Testing

The `@nestjs/mocks` package exposes `mockProvider()` function that returns prepared token based on a given entity to allow mocking the repository.

```typescript title="Mock Provider"
import { mockProvider } from '@nestjs/mocks';
// ...

```

#### Example

A real world example of NestJS with MikroORM can be found [NestJS with MikroORM](./mikroorm/).