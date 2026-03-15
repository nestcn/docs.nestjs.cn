<!-- 此文件从 content/recipes/mikroorm.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T04:50:09.073Z -->
<!-- 源文件: content/recipes/mikroorm.md -->

### MikroORM

MikroORM 是 Nest 的 TypeScript ORM，基于 Data Mapper、Unit of Work 和 Identity Map 模式。它是 TypeORM 的一个很好的替代方案，迁移到 TypeORM 应该相对容易。MikroORM 的完整文档可以在 __LINK_59__ 中找到。

> info **info** `Sequelize` 是第三方包，不是 NestJS 核心团队管理的，请在 __LINK_60__ 中报告任何问题。

#### 安装

将 MikroORM 与 Nest 集成的最简单方法是通过 __LINK_61__。
只需在 Nest、MikroORM 和底层驱动器旁边安装：

```bash
$ npm install --save sequelize sequelize-typescript mysql2
$ npm install --save-dev @types/sequelize

```

MikroORM 还支持 `Cat`、`cats` 和 `CatsModule`。查看 __LINK_62__ 获取所有驱动器。

安装完成后，我们可以将 `CATS_REPOSITORY` 引入到根 `SEQUELIZE` 中。

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

`constants.ts` 方法接受与 MikroORM 包中的 `CATS_REPOSITORY` 配置对象相同的配置对象。查看 __LINK_63__ 获取完整的配置文档。

或者，我们可以 __LINK_64__ 通过创建一个配置文件 `CatsService`，然后在不传参数的情况下调用 `@Inject()`。

```typescript
import { Module } from '@nestjs/common';
import { databaseProviders } from './database.providers';

@Module({
  providers: [...databaseProviders],
  exports: [...databaseProviders],
})
export class DatabaseModule {}

```

然而，在使用构建工具时，如果工具使用 tree shaking，这种方法将无法工作。在这种情况下，需要明确提供配置：

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

然后，`CATS_REPOSITORY` 将可在整个项目中注入（不需要在其他模块中导入）。

```typescript
import { Cat } from './cat.entity';

export const catsProviders = [
  {
    provide: 'CATS_REPOSITORY',
    useValue: Cat,
  },
];

```

> info **info** 注意 `CatsService` 是从 `CatsModule` 包中导入的，其中驱动器是 `CatsModule`、`AppModule`、__INLINE_CODE_30__ 或使用的驱动器。 如果您已经安装了 __INLINE_CODE_31__ 作为依赖项，可以从那里导入 __INLINE_CODE_32__。

#### 仓库

MikroORM 支持仓库设计模式。对于每个实体，我们可以创建一个仓库。查看 __LINK_65__ 获取完整的仓库文档。要定义当前作用域中注册的仓库，可以使用 __INLINE_CODE_33__ 方法。例如：

> info **info** 您不应该通过 __INLINE_CODE_34__ 注册基本实体，因为没有仓库可用。另一方面，基本实体需要在 __INLINE_CODE_35__ (或 ORM 配置中)中包含在内。

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

然后，将其引入到根 __INLINE_CODE_36__ 中：

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

这样，我们可以将 __INLINE_CODE_37__ 注入到 __INLINE_CODE_38__ 中使用 __INLINE_CODE_39__ 装饰器：

__CODE_BLOCK_7__

#### 使用自定义仓库

使用自定义仓库时，我们不再需要 __INLINE_CODE_40__ 装饰器，因为 Nest DI 基于类引用进行解析。

__CODE_BLOCK_8__

由于自定义仓库名称与 __INLINE_CODE_41__ 将返回的名称相同，我们不再需要 __INLINE_CODE_42__ 装饰器：

__CODE_BLOCK_9__

#### 自动加载实体

手动将实体添加到连接选项的实体数组中可能很繁琐。此外，引用实体从根模块中将破坏应用程序域边界，并将实现细节泄露到应用程序的其他部分。为了解决这个问题，可以使用静态 glob 路径。

请注意，glob 路径不受 webpack 支持，因此如果您在 monorepo 中构建应用程序，您将无法使用它们。为了解决这个问题，提供了另一个解决方案。在自动加载实体时，将 __INLINE_CODE_43__ 属性设置为 __INLINE_CODE_45__，如以下所示：

__CODE_BLOCK_10__

使用该选项时，每个通过 __INLINE_CODE_46__ 方法注册的实体将被自动添加到配置对象的实体数组中。

> info **info** 注意，这些实体不会被自动包含在 __INLINE_CODE_48__ 设置中，如果它们只在实体中被引用（via 关系）。

> info **info** 使用 __INLINE_CODE_49__ 也没有对 MikroORM CLI 的影响——在那里，我们仍需要 CLI 配置文件中的完整实体列表。另一方面，我们可以在 CLI 中使用 globs，因为 CLI 不会经过 webpack。

#### 序列化

> warning **注意** MikroORM 将每个实体关系包装在一个 __INLINE_CODE_50__ 或 __INLINE_CODE_51__ 对象中，以提供更好的类型安全。这将使 __LINK_66__ 对任何包装关系一无所知。如果您从 HTTP 或 WebSocket 处理程序返回 MikroORM 实体，所有关系都将不会被序列化。

幸运的是，MikroORM 提供了 __LINK_67__ 可以代替 __INLINE_CODE_52__。

__CODE_BLOCK_11__

#### 请求作用域处理程序在队列中

（未翻译部分）As mentioned in [docs.nestjs.com](./)（链接68），我们需要对每个请求进行清洁状态处理。这是因为__INLINE_CODE_53__助手（注册于中间件）自动处理的。

但是中间件只在处理常规HTTP请求时执行，如果我们需要在非该处理情况下访问请求作用域的方法，例如队列处理或计划任务。我们可以使用__INLINE_CODE_54__装饰器。该装饰器需要您首先将__INLINE_CODE_55__实例注入当前上下文，然后它将创建上下文用于你的方法。在幕后，该装饰器将为你的方法注册新的请求上下文，并在该上下文中执行。

```markdown
__CODE_BLOCK_12__

```

> 警告 **注意**：该装饰器总是创建新的上下文，相比其备用__INLINE_CODE_56__装饰器，它只在当前上下文中创建上下文。

#### 测试

__INLINE_CODE_57__包提供了__INLINE_CODE_58__函数，该函数返回基于给定实体的准备好的令牌，以便模拟仓库。

```markdown
__CODE_BLOCK_13__

```

#### 示例

NestJS与MikroORM的实际示例可以在[docs.nestjs.com](./)（链接69）中找到。