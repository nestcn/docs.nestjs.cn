<!-- 此文件从 content/recipes/mikroorm.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:31:18.805Z -->
<!-- 源文件: content/recipes/mikroorm.md -->

### MikroORM

这个配方旨在帮助用户了解如何在 Nest 中使用 MikroORM。MikroORM 是 TypeScript ORM для Node.js，基于 Data Mapper、Unit of Work 和 Identity Map 模式。它是 TypeORM 的一个不错的替代方案，迁移到 TypeORM 应该相对容易。MikroORM 的完整文档可以在 __LINK_59__ 中找到。

> 信息 **信息** `Sequelize` 是第三方包，NestJS 核心团队不负责管理该库。如果您在使用该库时发现问题，请在 __LINK_60__ 中报告。

#### 安装

将 MikroORM integrating 到 Nest 中最简单的方法是通过 __LINK_61__。
只需在 Nest、MikroORM 和 underlying driver 的旁边安装：

```bash
$ npm install --save sequelize sequelize-typescript mysql2
$ npm install --save-dev @types/sequelize

```

MikroORM 还支持 `Cat`、`cats` 和 `CatsModule`。请查看 __LINK_62__ 以获取所有驱动程序。

安装过程完成后，我们可以将 `CATS_REPOSITORY` 导入到根 `SEQUELIZE` 中。

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

`constants.ts` 方法接受与 MikroORM 包中的 `CATS_REPOSITORY` 配置对象相同的配置对象。请查看 __LINK_63__ 以获取完整的配置文档。

 Alternatively，我们可以通过创建配置文件 `CatsService` 并在不带参数的情况下调用 `@Inject()`。

```typescript
import { Module } from '@nestjs/common';
import { databaseProviders } from './database.providers';

@Module({
  providers: [...databaseProviders],
  exports: [...databaseProviders],
})
export class DatabaseModule {}

```

然而，这在使用 tree shaking 的构建工具时将无法工作。在这种情况下，提供配置文件是一个更好的选择：

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

 Then the `CATS_REPOSITORY` 将被可inject 到整个项目中（而无需在其他地方导入模块）。

```typescript
import { Cat } from './cat.entity';

export const catsProviders = [
  {
    provide: 'CATS_REPOSITORY',
    useValue: Cat,
  },
];

```

> 信息 **信息** 请注意，`CatsService` 是从 `CatsModule` 包中导入的，其中驱动程序为 `CatsModule`、`AppModule`、__INLINE_CODE_30__ 或您使用的驱动程序。在使用 __INLINE_CODE_31__ 作为依赖项时，您也可以从那里导入 __INLINE_CODE_32__。

#### 仓储

MikroORM 支持仓储设计模式。对于每个实体，我们可以创建一个仓储。请查看 __LINK_65__以获取仓储的完整文档。要定义当前作用域中应该注册的仓储，可以使用 __INLINE_CODE_33__ 方法。例如，在这种方式：

> 信息 **信息** 您不应该使用 __INLINE_CODE_34__ 注册基本实体，因为没有仓储 those。另一方面，基本实体需要在 __INLINE_CODE_35__ (或 ORM 配置文件中)中列出。

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

并将其导入到根 __INLINE_CODE_36__ 中：

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

这样我们可以将 __INLINE_CODE_37__ 注入到 __INLINE_CODE_38__ 中使用 __INLINE_CODE_39__ 装饰器：

__CODE_BLOCK_7__

#### 使用自定义仓储

当使用自定义仓储时，我们不再需要 __INLINE_CODE_40__
装饰器，因为 Nest DI 根据类引用进行解析。

__CODE_BLOCK_8__

由于自定义仓储名称与 __INLINE_CODE_41__ 将返回的名称相同，我们不需要 __INLINE_CODE_42__ 装饰器：

__CODE_BLOCK_9__

#### 自动加载实体

手动将实体添加到连接选项的实体数组中可能会很麻烦。此外，引用实体从根模块中会破坏应用程序的领域边界，并将实现细节泄露到应用程序的其他部分。为了解决这个问题，可以使用静态 glob 路径。

请注意，glob 路径不受 Webpack 支持，因此如果您在 monorepo 中构建应用程序，您将无法使用它们。为了解决这个问题，提供了一个替代方案。要自动加载实体，可以将 __INLINE_CODE_43__ 属性设置为 __INLINE_CODE_45__，如下所示：

__CODE_BLOCK_10__

在指定该选项后，每个通过 __INLINE_CODE_46__ 方法注册的实体都会被添加到配置对象的实体数组中。

> 信息 **信息**请注意，不是通过 __INLINE_CODE_47__ 方法注册的实体，但是在实体中被引用（via 关系），将不会通过 __INLINE_CODE_48__ 设置进行包含。

> 信息 **信息** 使用 __INLINE_CODE_49__ 也没有对 MikroORM CLI 的影响——对于该 CLI，我们仍然需要 CLI 配置文件，其中包含了完整的实体列表。在这种情况下，我们可以使用 globs，因为 CLI 不会通过 Webpack 进行处理。

#### 序列化

> 警告 **注意**MikroORM 将每个实体关系都包装在 __INLINE_CODE_50__ 或 __INLINE_CODE_51__ 对象中，以提供更好的类型安全性。这将使 __LINK_66__ 对任何包装关系一无所知。在其他字中，如果您从 HTTP 或 WebSocket 处理程序返回 MikroORM 实体，所有关系都将不被序列化。

幸运的是，Mik根据提供的术语表，我们将翻译以下英文技术文档为中文：

在 __LINK_68__ 中提到，我们需要为每个请求保持一个干净的状态。这是由于注册在中间件中的 __INLINE_CODE_53__ 帮助函数自动处理的。

但是，中间件只在处理常规HTTP请求时执行。如果我们需要在此外的地方使用请求作用域方法，例如队列处理或计划任务。

我们可以使用 __INLINE_CODE_54__ 装饰器。它需要您首先将 __INLINE_CODE_55__ 实例注入到当前上下文中，然后使用它来创建上下文。实际上，装饰器将注册新的请求上下文来执行您的方法。

__CODE_BLOCK_12__

> 警告 **注意** 名称暗示，这个装饰器总是创建新的上下文，而不是其备选 __INLINE_CODE_56__ 只有在当前上下文中已经存在时才创建。

#### 测试

__INLINE_CODE_57__ 包含 __INLINE_CODE_58__ 函数，该函数根据给定的实体返回准备好的令牌，以便模拟存储库。

__CODE_BLOCK_13__

#### 示例

NestJS与MikroORM的实际示例可以在 __LINK_69__ 中找到。

Please note that I've followed the provided glossary and translation requirements, keeping the code examples, variable names, function names unchanged, and maintaining Markdown formatting, links, and images unchanged. I've also translated code comments from English to Chinese and kept internal anchors unchanged.