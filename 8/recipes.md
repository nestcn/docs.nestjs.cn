# 秘籍

## CRUD生成器

在一个项目的生命周期中，当我们新增特性的时候，我们通常需要在应用中添加新的资源。这些资源通常需要我们在每次新增资源的时候进行一些重复操作。

### 介绍

想象一下真实世界中的场景，我们需要通过两个CRUD的终端暴露`User`和`Product`两个实体。参考最佳时间，我们为每个实体进行以下操作。

- 生成一个模块 (nest g mo) 来组织代码，使其保持清晰的界限（将相关模块分组）
- 生成一个控制器 (nest g co) 来定义CRUD路径（或者GraphQL应用的查询和变更）
- 生成一个服务 (nest g s) 来表示/隔离业务逻辑
- 生成一个实体类/接口来代表资源数据类型
- 生成数据转换对象（或者`GraphQL`应用输入）来决定数据如何通过网络传输

很多步骤！

为了加速执行重复步骤，`Nest CLI`提供了一个生成器（`schematic(原理)`）可以自动生成所有的模板文件以减少上述步骤，同时让开发者感觉更易用。

> 该`schematic`支持生成`HTTP`控制器，`微服务`控制器，`GraphQL`处理器（代码优先或者原理优先），以及`WebSocket`网关等。

### 生成新资源

在项目根目录下执行以下代码来生成资源。

```bash
$ nest g resource
```

`nest g resource`命令不仅仅生成所有Nestjs构件模块(模块，服务，控制器类)也生成实体类，`DTO`类和测试(.spec)文件。

如下是一个生成的控制器 (`REST API`):

```TypeScript
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
```

它也自动生成了所有CRUD终端占位符（REST API路径，GraphQL查询和编译，微服务和WebSocket网关的消息订阅器）--一键所有内容。

!> 生成的资源类未与任何特定ORM（或者数据源）绑定，以在任何项目下通用。默认地，所有方法都包含了占位符，允许你用特定项目的数据源填充。类似地，如果你需要生成GraphQL应用的处理器，只要在传输层选择GraphQL（代码优先）或者GraphQL(原理优先)即可。

这里生成一个处理器类而不是一个REST API控制器：

```bash
$ nest g resource users

> ? What transport layer do you use? GraphQL (code first)
> ? Would you like to generate CRUD entry points? Yes
> CREATE src/users/users.module.ts (224 bytes)
> CREATE src/users/users.resolver.spec.ts (525 bytes)
> CREATE src/users/users.resolver.ts (1109 bytes)
> CREATE src/users/users.service.spec.ts (453 bytes)
> CREATE src/users/users.service.ts (625 bytes)
> CREATE src/users/dto/create-user.input.ts (195 bytes)
> CREATE src/users/dto/update-user.input.ts (281 bytes)
> CREATE src/users/entities/user.entity.ts (187 bytes)
> UPDATE src/app.module.ts (312 bytes)
```

?> 像这样传递`--no-spec`参数`nest g resource users --no-spec`来避免生成测试文件。

在下面我们可以看到，不仅生成了所有变更和查询的样板文件，也把他们绑定到了一起，我们可以使用`UsersService`, `User Entity`, 和`DTO`。

```TypeScript
import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Mutation(() => User)
  createUser(@Args('createUserInput') createUserInput: CreateUserInput) {
    return this.usersService.create(createUserInput);
  }

  @Query(() => [User], { name: 'users' })
  findAll() {
    return this.usersService.findAll();
  }

  @Query(() => User, { name: 'user' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.usersService.findOne(id);
  }

  @Mutation(() => User)
  updateUser(@Args('updateUserInput') updateUserInput: UpdateUserInput) {
    return this.usersService.update(updateUserInput.id, updateUserInput);
  }

  @Mutation(() => User)
  removeUser(@Args('id', { type: () => Int }) id: number) {
    return this.usersService.remove(id);
  }
}
```

## 热重载

对应用程序的引导过程影响最大的是 `TypeScript` 编译。但问题是，每次发生变化时，我们是否必须重新编译整个项目？一点也不。这就是为什么 [webpack](https://github.com/webpack/webpack) `HMR`（Hot-Module Replacement）大大减少了实例化您的应用程序所需的时间。


?> 请注意，`webpack`这不会自动将（例如 `graphql` 文件）复制到 `dist` 文件夹中。类似地，`webpack` 与全局静态路径（例如中的 `entities` 属性 `TypeOrmModule` ）不兼容。

### CLI

如果使用的是 `Nest CLI`，则配置过程非常简单。`CLI` 包装 `webpack`，允许使用 `HotModuleReplacementPlugin`。

### 安装

首先，我们安装所需的软件包：

```bash
$ npm i --save-dev webpack-node-externals start-server-webpack-plugin
```

### 配置（Configuration）

然后，我们需要创建一个` webpack.config.js`，它是webpack的一个配置文件，并将其放入根目录。

```typescript
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const StartServerPlugin = require('start-server-webpack-plugin');

module.exports = function(options) {
  return {
    ...options,
    entry: ['webpack/hot/poll?100', options.entry],
    watch: true,
    externals: [
      nodeExternals({
        whitelist: ['webpack/hot/poll?100'],
      }),
    ],
    plugins: [
      ...options.plugins,
      new webpack.HotModuleReplacementPlugin(),
      new webpack.WatchIgnorePlugin([/\.js$/, /\.d\.ts$/]),
      new StartServerPlugin({ name: options.output.filename }),
    ],
  };
};
```

此函数获取包含默认 `webpack` 配置的原始对象，并返回一个已修改的对象和一个已应用的 `HotModuleReplacementPlugin` 插件。

### 热模块更换

为了启用 `HMR`，请打开应用程序入口文件（ `main.ts` ）并添加一些与 `Webpack`相关的说明，如下所示：

```typescript
declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
```

就这样。为了简化执行过程，请将这两行添加到 `package.json` 文件的脚本中。

```json
"start:dev": "nest build --webpack --webpackPath webpack-hmr.config.js"
```

现在只需打开你的命令行并运行下面的命令：

```bash
$ npm run start:dev
```

### 没有使用 CLI

如果您没有使用 `Nest CLI` ，配置将稍微复杂一些(需要更多的手动步骤)。

### 安装

首先安装所需的软件包：

```bash
$ npm i --save-dev webpack webpack-cli webpack-node-externals ts-loader start-server-webpack-plugin
```

### 配置

然后，我们需要创建一个` webpack.config.js`，它是 `webpack` 的一个配置文件，并将其放入根目录。

```typescript
const webpack = require('webpack');
const path = require('path');
const nodeExternals = require('webpack-node-externals');
const StartServerPlugin = require('start-server-webpack-plugin');

module.exports = {
  entry: ['webpack/hot/poll?100', './src/main.ts'],
  watch: true,
  target: 'node',
  externals: [
    nodeExternals({
      whitelist: ['webpack/hot/poll?100'],
    }),
  ],
  module: {
    rules: [
      {
        test: /.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  mode: 'development',
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new StartServerPlugin({ name: 'server.js' }),
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'server.js',
  },
};
```

这个配置告诉 `webpack` 关于我们的应用程序的一些基本信息。入口文件位于何处，应使用哪个目录保存已编译的文件，以及我们要使用哪种装载程序来编译源文件。基本上，您不必担心太多，根本不需要了解该文件的内容。

### 热模块更换

为了启用 `HMR` ，我们必须打开应用程序入口文件（ `main.ts` ），并添加一些与 `Webpack` 相关的说明。

```typescript
declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
```

为了简化执行过程，请将两个脚本添加到 `package.json` 文件中。

```bash
"start:dev": "webpack --config webpack.config.js"
```

现在，只需打开命令行并运行以下命令：

```bash
$ npm run start:dev
```

[这里](https://github.com/nestjs/nest/tree/master/sample/08-webpack)有一个可用的例子


## TypeORM

**本章仅适用于TypeScript**

!> 在本文中，您将学习如何使用自定义提供者机制从零开始创建基于 **TypeORM** 包的 `DatabaseModule` 。由于该解决方案包含许多开销，因此您可以使用开箱即用的 `@nestjs/typeorm` 软件包。要了解更多信息，请参阅 [此处](/8/techniques.md?id=数据库)。


[TypeORM](https://github.com/typeorm/typeorm) 无疑是 `node.js` 世界中最成熟的对象关系映射器（`ORM` ）。由于它是用 `TypeScript` 编写的，所以它在 `Nest` 框架下运行得非常好。

### 入门

在开始使用这个库前，我们必须安装所有必需的依赖关系

```bash
$ npm install --save typeorm mysql
```

我们需要做的第一步是使用从 `typeorm` 包导入的 `createConnection()` 函数建立与数据库的连接。`createConnection()` 函数返回一个 `Promise`，因此我们必须创建一个[异步提供者](/8/fundamentals.md?id=异步提供者 ( `Asynchronous providers` ))。

> database.providers.ts

```typescript
import { createConnection } from 'typeorm';

export const databaseProviders = [
  {
    provide: 'DATABASE_CONNECTION',
    useFactory: async () => await createConnection({
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
    }),
  },
];
```

?> 按照最佳实践，我们在分离的文件中声明了自定义提供者，该文件带有 `*.providers.ts` 后缀。

然后，我们需要导出这些提供者，以便应用程序的其余部分可以 **访问** 它们。

> database.module.ts

```typescript
import { Module } from '@nestjs/common';
import { databaseProviders } from './database.providers';

@Module({
  providers: [...databaseProviders],
  exports: [...databaseProviders],
})
export class DatabaseModule {}
```

现在我们可以使用 `@Inject()` 装饰器注入 `Connection` 对象。依赖于 `Connection` 异步提供者的每个类都将等待 `Promise` 被解析。

### 存储库模式

[TypeORM](https://github.com/typeorm/typeorm) 支持存储库设计模式，因此每个实体都有自己的存储库。这些存储库可以从数据库连接中获取。

但首先，我们至少需要一个实体。我们将重用官方文档中的 `Photo` 实体。

> photo.entity.ts

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

`Photo` 实体属于 `photo` 目录。此目录代表 `PhotoModule` 。现在，让我们创建一个 **存储库** 提供者:

> photo.providers.ts

```typescript
import { Connection, Repository } from 'typeorm';
import { Photo } from './photo.entity';

export const photoProviders = [
  {
    provide: 'PHOTO_REPOSITORY',
    useFactory: (connection: Connection) => connection.getRepository(Photo),
    inject: ['DATABASE_CONNECTION'],
  },
];
```

!> 请注意，在实际应用程序中，您应该避免使用魔术字符串。`PhotoRepositoryToken` 和 `DbConnectionToken` 都应保存在分离的 `constants.ts` 文件中。

在实际应用程序中，应该避免使用魔法字符串。`PHOTO_REPOSITORY` 和 `DATABASE_CONNECTION` 应该保持在单独的 `constants.ts` 文件中。

现在我们可以使用 `@Inject()` 装饰器将 `Repository<Photo>` 注入到 `PhotoService` 中：

> photo.service.ts

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Photo } from './photo.entity';

@Injectable()
export class PhotoService {
  constructor(
    @Inject('PHOTO_REPOSITORY')
    private readonly photoRepository: Repository<Photo>,
  ) {}

  async findAll(): Promise<Photo[]> {
    return this.photoRepository.find();
  }
}
```

数据库连接是 **异步的**，但 `Nest` 使最终用户完全看不到这个过程。`PhotoRepository` 正在等待数据库连接时，并且`PhotoService` 会被延迟，直到存储库可以使用。整个应用程序可以在每个类实例化时启动。

这是一个最终的 `PhotoModule` ：

> photo.module.ts

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

?> 不要忘记将 `PhotoModule` 导入到根 `ApplicationModule` 中。

## Mongoose

!> 在本文中，您将学习如何使用自定义提供者机制从零开始创建基于 **Mongoose** 包的 `DatabaseModule`。由于该解决方案包含许多开销，因此您可以使用开箱即用的 `@nestjs/mongoose` 软件包。要了解更多信息，请参阅 [此处](https://docs.nestjs.com/techniques/mongodb)。

[Mongoose](http://mongoosejs.com/) 是最受欢迎的[MongoDB](https://www.mongodb.org/) 对象建模工具。

### 入门

在开始使用这个库前，我们必须安装所有必需的依赖关系

```bash
$ npm install --save mongoose
$ npm install --save-dev @types/mongoose
```

我们需要做的第一步是使用 `connect()` 函数建立与数据库的连接。`connect()` 函数返回一个 `Promise`，因此我们必须创建一个 [异步提供者](/8/fundamentals.md?id=异步提供者 (Asynchronous providers))。

> database.providers.ts

```typescript
import * as mongoose from 'mongoose';

export const databaseProviders = [
  {
    provide: 'DATABASE_CONNECTION',
    useFactory: (): Promise<typeof mongoose> =>
      mongoose.connect('mongodb://localhost/nest'),
  },
];
```

?> 按照最佳实践，我们在分离的文件中声明了自定义提供者，该文件带有 `*.providers.ts` 后缀。

然后，我们需要导出这些提供者，以便应用程序的其余部分可以 **访问** 它们。

> database.module.ts

```typescript
import { Module } from '@nestjs/common';
import { databaseProviders } from './database.providers';

@Module({
  providers: [...databaseProviders],
  exports: [...databaseProviders],
})
export class DatabaseModule {}
```

现在我们可以使用 `@Inject()` 装饰器注入 `Connection` 对象。依赖于 `Connection` 异步提供者的每个类都将等待 `Promise` 被解析。

### 模型注入

使用Mongoose，一切都来自[Schema](https://mongoosejs.com/docs/guide.html)。 让我们定义 `CatSchema` ：

> schemas/cats.schema.ts

```typescript
import * as mongoose from 'mongoose';

export const CatSchema = new mongoose.Schema({
  name: String,
  age: Number,
  breed: String,
});
```

`CatsSchema` 属于 `cats` 目录。此目录代表 `CatsModule` 。

现在，让我们创建一个 **模型** 提供者:

> cats.providers.ts

```typescript
import { Connection } from 'mongoose';
import { CatSchema } from './schemas/cat.schema';

export const catsProviders = [
  {
    provide: 'CAT_MODEL',
    useFactory: (connection: Connection) => connection.model('Cat', CatSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];
```

!> 请注意，在实际应用程序中，您应该避免使用魔术字符串。`CAT_MODEL` 和 `DATABASE_CONNECTION` 都应保存在分离的 `constants.ts` 文件中。

现在我们可以使用 `@Inject()` 装饰器将 `CAT_MODEL` 注入到 `CatsService` 中：

> cats.service.ts

```typescript
import { Model } from 'mongoose';
import { Injectable, Inject } from '@nestjs/common';
import { Cat } from './interfaces/cat.interface';
import { CreateCatDto } from './dto/create-cat.dto';

@Injectable()
export class CatsService {
  constructor(
    @Inject('CAT_MODEL')
    private catModel: Model<Cat>,
  ) {}

  async create(createCatDto: CreateCatDto): Promise<Cat> {
    const createdCat = new this.catModel(createCatDto);
    return createdCat.save();
  }

  async findAll(): Promise<Cat[]> {
    return this.catModel.find().exec();
  }
}
```

在上面的例子中，我们使用了 `Cat` 接口。 此接口扩展了来自 `mongoose` 包的 `Document` ：

```typescript
import { Document } from 'mongoose';

export interface Cat extends Document {
  readonly name: string;
  readonly age: number;
  readonly breed: string;
}
```

数据库连接是 **异步的**，但 `Nest` 使最终用户完全看不到这个过程。`CatModel` 正在等待数据库连接时，并且`CatsService` 会被延迟，直到存储库可以使用。整个应用程序可以在每个类实例化时启动。

这是一个最终的 `CatsModule` ：

> cats.module.ts

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

?> 不要忘记将 `CatsModule` 导入到根 `ApplicationModule` 中。


## Sequelize

### SQL (Sequelize)

本章仅适用于 `TypeScript`

!> 在本文中，您将学习如何使用自定义提供者机制从零开始创建基于 **Sequelize** 包的 `DatabaseModule`。由于该解决方案包含许多开销，因此您可以使用开箱即用的 `@nestjs/sequelize` 软件包。要了解更多信息，请参阅 [此处](https://docs.nestjs.com/techniques/database#sequelize-integration)。

`Sequelize` 是一个用普通 `JavaScript` 编写的流行对象关系映射器( `ORM` )，但是有一个 `Sequelize-TypeScript` 包装器，它为基本 `Sequelize` 提供了一组装饰器和其他附加功能。

### 入门

要开始使用这个库，我们必须安装以下附件:

```bash
$ npm install --save sequelize sequelize-typescript mysql2
$ npm install --save-dev @types/sequelize
```

我们需要做的第一步是创建一个 `Sequelize` 实例，并将一个 `options` 对象传递给构造函数。另外，我们需要添加所有模型（替代方法是使用 `modelPaths` 属性）并同步数据库表。

> database.providers.ts

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
!> 按照最佳实践，我们在分隔的文件中声明了带有 `*.providers.ts` 后缀的自定义提供程序。

然后，我们需要导出这些提供程序，使它们可用于应用程序的其他部分。

```typescript
import { Module } from '@nestjs/common';
import { databaseProviders } from './database.providers';

@Module({
  providers: [...databaseProviders],
  exports: [...databaseProviders],
})
export class DatabaseModule {}
```

现在我们可以使用 `@Inject()` 装饰器注入 `Sequelize` 对象。 每个将依赖于 `Sequelize` 异步提供程序的类将等待 `Promise` 被解析。

### 模型注入

在 `Sequelize` 中，模型在数据库中定义了一个表。该类的实例表示数据库行。首先，我们至少需要一个实体:

> cat.entity.ts

```typescript
import { Table, Column, Model } from 'sequelize-typescript';

@Table
export class Cat extends Model<Cat> {
  @Column
  name: string;

  @Column
  age: number;

  @Column
  breed: string;
}
```

`Cat` 实体属于 `cats` 目录。 此目录代表 `CatsModule` 。 现在是时候创建一个存储库提供程序了：

> cats.providers.ts

```typescript

import { Cat } from './cat.entity';

export const catsProviders = [
  {
    provide: 'CATS_REPOSITORY',
    useValue: Cat,
  },
];
```

?> 在实际应用中，应避免使用魔术字符串。 `CATS_REPOSITORY` 和 `SEQUELIZE` 都应保存在单独的 `constants.ts` 文件中。

在 `Sequelize` 中，我们使用静态方法来操作数据，因此我们在这里创建了一个别名。

现在我们可以使用 `@Inject()` 装饰器将 `CATS_REPOSITORY` 注入到 `CatsService` 中:

> cats.service.ts

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { CreateCatDto } from './dto/create-cat.dto';
import { Cat } from './cat.entity';

@Injectable()
export class CatsService {
  constructor(
    @Inject('CATS_REPOSITORY') private readonly CATS_REPOSITORY: typeof Cat) {}

  async findAll(): Promise<Cat[]> {
    return this.catsRepository.findAll<Cat>();
  }
}
```

数据库连接是异步的，但是 `Nest` 使此过程对于最终用户完全不可见。 `CATS_REPOSITORY` 提供程序正在等待数据库连接，并且 `CatsService` 将延迟，直到准备好使用存储库为止。 实例化每个类时，启动整个应用程序。

这是最终的 `CatsModule`：

> cats.module.ts

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

?> 不要忘记将 `CatsModule` 导入到根 `ApplicationModule` 中。



## 路由模块

【待翻译】

## Swagger

[OpenAPI](https://swagger.io/specification/)(Swagger)规范是一种用于描述 `RESTful API` 的强大定义格式。 `Nest` 提供了一个专用[模块](https://github.com/nestjs/swagger)来使用它。

### 安装

首先，您必须安装所需的包：

```bash
$ npm install --save @nestjs/swagger swagger-ui-express
```

如果你正在使用 `fastify` ，你必须安装 `fastify-swagger` 而不是 `swagger-ui-express` ：

```bash
$ npm install --save @nestjs/swagger fastify-swagger
```

### 引导（Bootstrap）

安装过程完成后，打开引导文件（主要是 `main.ts` ）并使用 `SwaggerModule` 类初始化 Swagger：

```typescript
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ApplicationModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(ApplicationModule);

  const options = new DocumentBuilder()
    .setTitle('Cats example')
    .setDescription('The cats API description')
    .setVersion('1.0')
    .addTag('cats')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
```

`DocumentBuilder` 有助于构建符合 OpenAPI 规范的基础文档。它提供了几种允许设置诸如标题，描述，版本等属性的方法。为了创建一个完整的文档（使用已定义的 HTTP 路由），我们使用 `SwaggerModule` 类的 `createDocument()` 方法。 此方法接收两个参数，即应用程序实例和 Swagger 选项对象。

一旦创建完文档，我们就可以调用 `setup()` 方法。 它接收：

1. Swagger UI 的挂载路径
2. 应用程序实例
3. 上面已经实例化的文档对象

现在，您可以运行以下命令来启动 `HTTP` 服务器：

```bash
$ npm run start
```

应用程序运行时，打开浏览器并导航到 `http://localhost:3000/api` 。 你应该可以看到 Swagger UI

![img](https://docs.nestjs.com/assets/swagger1.png)

`SwaggerModule` 自动反映所有端点。同时，为了展现 Swagger UI，`@nestjs/swagger`依据平台使用 `swagger-ui-express` 或 `fastify-swagger`。

?> 生成并下载 Swagger JSON 文件，只需在浏览器中导航到 `http://localhost:3000/api-json` （如果您的 Swagger 文档是在 `http://localhost:3000/api` 下）。

### 路由参数

`SwaggerModule` 在路由处理程序中查找所有使用的 `@Body()` ， `@Query()` 和 `@Param()` 装饰器来生成 API 文档。该模块利用反射创建相应的模型定义。 看看下面的代码：

```typescript
@Post()
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}
```

!> 要显式地设置主体定义，可以使用 `@ApiBody()` 装饰器（ `@nestjs/swagger` 包）。

基于 `CreateCatDto` ，将创建模块定义：

![img](https://docs.nestjs.com/assets/swagger-dto.png)

如您所见，虽然该类具有一些声明的属性，但定义为空。 为了使类属性对 `SwaggerModule` 可见，我们必须用 `@ApiProperty()` 装饰器对其进行注释或者使用 CLI 插件自动完成（更多请阅读**插件**小节）：

```typescript
import { ApiProperty } from '@nestjs/swagger';

export class CreateCatDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  age: number;

  @ApiProperty()
  breed: string;
}
```

?> 考虑使用 Swagger 插件（请阅读**插件**小节），它会自动帮你完成。

让我们打开浏览器并验证生成的 `CreateCatDto` 模型：

![img](https://docs.nestjs.com/assets/swagger-dto2.png)

另外，`@ApiProperty()` 装饰器允许设计不同[模式对象](https://swagger.io/specification/#schemaObject) 属性:

```typescript
@ApiProperty({
  description: 'The age of a cat',
  min: 1,
  default: 1,
})
age: number;
```

?> 避免显式地输入 `{{"@ApiProperty({ required: false })"}}`，你可以使用 `@ApiPropertyOptional()` 短手装饰器。

为了显式地设置属性的类型，使用`type`键

```typescript
@ApiProperty({
  type: Number,
})
age: number;
```

### 数组

当属性实际上是一个数组时，我们必须手动指定一个类型：

```typescript
@ApiProperty({ type: [String] })
names: string[];
```
?> 考虑使用 Swagger 插件（请阅读**插件**小节），它会自动发现数组。

只需将您的类型作为数组的第一个元素（如上所示）或将 `isArray` 属性设置为 `true` 。

### 循环依赖

当类之间具有循环依赖关系时，请使用惰性函数为 `SwaggerModule` 提供类型信息：

```typescript
@ApiProperty({ type: () => Node })
node: Node;
```
?> 考虑使用 Swagger 插件（请阅读**插件**小节），它会自动发现循环依赖。

### 泛型和接口

由于 TypeScript 不会存储有关泛型或接口的元数据，因此当您在 DTO 中使用它们时，`SwaggerModule` 可能无法在运行时正确生成模型定义。例如，以下代码将不会被 Swagger 模块正确检查：

```typescript
createBulk(@Body() usersDto: CreateUserDto[])
```

为了克服此限制，可以显式设置类型：

```typescript
@ApiBody({ type: [CreateUserDto] })
createBulk(@Body() usersDto: CreateUserDto[])
```
### 类型映射

在你建立例如CRUD（创建/读取/更新/删除）的功能时，基于一个基础的实体类型通常会比较有用。Nest提供了几个有用的函数以实现类型转换，让这个任务更方便一些。

当建立一个输入验证类型（也叫DTO）时，通常会采用同一个类型来建立**crete**和**update**。例如，**create**变量可能需要所有的字段，而**update**则可能需要让所有字段都是可选的。

Nest提供了`PartialType()`函数来保证简化任务并最小化模版。

`PartialType()`函数返回一个类型（类），并将所有输入类型设置为可选的。例如，我们由如下类型开始：

```typescript
import { ApiProperty } from '@nestjs/swagger';

export class CreateCatDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  age: number;

  @ApiProperty()
  breed: string;
}
```
默认地，所有字段都需要。要使用同一字段创建类型，但每个都是可选的，使用`PartialType()`，并传递类型引用（`CreateCatDto`）作为其参数：
```typescript
export class UpdateCatDto extends PartialType(CreateCatDto) {}
```
?> `PartialType()`从`@nestjs/swagger`中导入。

`PickTYpe()`功能从一个输入类型中选择一部分属性来创建一个新类型（类）。例如，我们由如下类型开始：

```typescript
import { ApiProperty } from '@nestjs/swagger';

export class CreateCatDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  age: number;

  @ApiProperty()
  breed: string;
}
```

我们可以使用PickTYpe()函数从这个类中选取一部分属性：
```typescript
export class UpdateCatAgeDto extends PickType(CreateCatDto, ['age'] as const) {}
```
?> `PartialType()`从`@nestjs/swagger`中导入。

`OmitType()`函数从一个输入类型中取出所有属性然后移除一些键。例如，我们由如下类型开始：

```typescript
import { ApiProperty } from '@nestjs/swagger';

export class CreateCatDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  age: number;

  @ApiProperty()
  breed: string;
}
```
我们可以生成并获取一个如下所示的`name`属性，在这个结构中，`OmitType`的第二个参数是属性名称的数组：

```typescript
export class UpdateCatDto extends OmitType(CreateCatDto, ['name'] as const) {}
```

?> `OmitType()`从`@nestjs/swagger`中导入。

`IntersectionType()`函数将两种类型组合成一个新类型（类）。例如，我们由如下类型开始：

```typescript
import { ApiProperty } from '@nestjs/swagger';

export class CreateCatDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  breed: string;
}

export class AdditionalCatInfo {
  @ApiProperty()
  color: string;
}
```
我们可以生成一个新类型，将两个类型中所有属性组合在一起。
```typescript
export class UpdateCatDto extends IntersectionType(CreateCatDto, AdditionalCatInfo) {}
```
?> `IntersectionType()`从`@nestjs/swagger`中导入。

类型映射函数是可以组合的。例如，下列示例将产生一个类（类型），其拥有`name`需要的`CreateCatDto`类型的所有属性，这些属性都被设置为可选的：
```typescript
export class UpdateCatDto extends PartialType(
  OmitType(CreateCatDto, ['name'] as const),
) {}
```

### 枚举

为了定义一个 `enum`，我们必须手动在 `@ApiProperty` 上设置 `enum` 属性为数值数组。

```typescript
@ApiProperty({ enum: ['Admin', 'Moderator', 'User']})
role: UserRole;
```

或者，如下定义实际的 TypeScript 枚举：

```typescript
export enum UserRole {
  Admin = 'Admin',
  Moderator = 'Moderator',
  User = 'User'
}
```

你可以直接将枚举在 `@Query()` 参数装饰器里使用，并结合 `@ApiQuery()` 装饰器。

```typescript
@ApiQuery({ name: 'role', enum: UserRole })
async filterByRole(@Query('role') role: UserRole = UserRole.User) {}
```

![img](https://docs.nestjs.com/assets/enum_query.gif)

将 `isArray` 设置为 **true** ，`enum` 可以**多选**：

![img](https://docs.nestjs.com/assets/enum_query_array.gif)

### 枚举 schema

默认地，`enum`属性将在参数中添加一个`[Enum](https://swagger.io/docs/specification/data-models/enums/)`的原生定义。

```typescript
- breed:
    type: 'string'
    enum:
      - Persian
      - Tabby
      - Siamese
```
上述情况在大部分情况下都能正常工作。然而，如果你使用工具将该定义作为输入来生成客户端代码，你可能在生成代码时会遇到包含两层枚举的问题。考虑如下代码：

```typescript
// generated client-side code
export class CatDetail {
  breed: CatDetailEnum;
}

export class CatInformation {
  breed: CatInformationEnum;
}

export enum CatDetailEnum {
  Persian = 'Persian',
  Tabby = 'Tabby',
  Siamese = 'Siamese',
}

export enum CatInformationEnum {
  Persian = 'Persian',
  Tabby = 'Tabby',
  Siamese = 'Siamese',
}
```
?> 上述代码使用一个叫做[NSwag](https://github.com/RicoSuter/NSwag)的工具生成。

你可以看到你现在有两个同样的枚举。要强调这个问题，你可以在你的装饰器中`enum`属性旁传递一个`enumName`。
```typescript
export class CatDetail {
  @ApiProperty({ enum: CatBreed, enumName: 'CatBreed' })
  breed: CatBreed;
}
```
`enumName`属性使能`@nestjs/swagger`来将`CatBreed`转换成它自身的`schema`从而使`CatBreed`枚举可重用，如下：

```typescript
CatDetail:
  type: 'object'
  properties:
    ...
    - breed:
        schema:
          $ref: '#/components/schemas/CatBreed'
CatBreed:
  type: string
  enum:
    - Persian
    - Tabby
    - Siamese
```
?> 任何使用`enum`作为属性的装饰器也会使用`enumName`。

### 原生定义

在某些特定情况下（例如，深度嵌套的数组，矩阵），您可能需要手动描述类型。

```typescript
@ApiProperty({
  type: 'array',
  items: {
    type: 'array',
    items: {
      type: 'number',
    },
  },
})
coords: number[][];
```

同样，为了在控制器类中手动定义输入/输出内容，请使用 `schema` 属性：

```typescript
@ApiBody({
  schema: {
    type: 'array',
    items: {
      type: 'array',
      items: {
        type: 'number',
      },
    },
  },
})
async create(@Body() coords: number[][]) {}
```

### 额外模型

为了定义其他应由 Swagger 模块检查的模型，请使用 `@ApiExtraModels()` 装饰器：

```typescript
@ApiExtraModels(ExtraModel)
export class CreateCatDto {}
```

然后，您可以使用 `getSchemaPath(ExtraModel)` 获取对模型的引用(`$ref`)：

```typescript
'application/vnd.api+json': {
   schema: { $ref: getSchemaPath(ExtraModel) },
},
```

#### oneOf, anyOf, allOf

为了合并模式（schemas），您可以使用 `oneOf`，`anyOf` 或 `allOf` 关键字 ([阅读更多](https://swagger.io/docs/specification/data-models/oneof-anyof-allof-not/)).

```typescript
@ApiProperty({
  oneOf: [
    { $ref: getSchemaPath(Cat) },
    { $ref: getSchemaPath(Dog) },
  ],
})
pet: Cat | Dog;
```
如果你想定义一个多态数组（例如，数组成员包含多个schema），你可以使用原生定义（如上）来手动定义你的类型。

```typescript
type Pet = Cat | Dog;

@ApiProperty({
  type: 'array',
  items: {
    oneOf: [
      { $ref: getSchemaPath(Cat) },
      { $ref: getSchemaPath(Dog) },
    ],
  },
})
pets: Pet[];
```

?> `getSchemaPath()` 函数是从 `@nestjs/swagger`进行导入的

必须使用 `@ApiExtraModels()` 装饰器（在类级别）将 `Cat` 和 `Dog` 都定义为额外模型。

### 多种规格

`SwaggerModuler`还提供了一种支持多种规格的方法。 换句话说，您可以在不同的端点上使用不同的 UI 提供不同的文档。

为了支持多规格，您的应用程序必须使用模块化方法编写。 `createDocument()` 方法接受的第三个参数：`extraOptions` ，它是一个包含 `include` 属性的对象。`include` 属性的值是一个模块数组。

您可以设置多个规格支持，如下所示：

```typescript
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ApplicationModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(ApplicationModule);

  /**
   * createDocument(application, configurationOptions, extraOptions);
   *
   * createDocument method takes in an optional 3rd argument "extraOptions"
   * which is an object with "include" property where you can pass an Array
   * of Modules that you want to include in that Swagger Specification
   * E.g: CatsModule and DogsModule will have two separate Swagger Specifications which
   * will be exposed on two different SwaggerUI with two different endpoints.
   */

  const options = new DocumentBuilder()
    .setTitle('Cats example')
    .setDescription('The cats API description')
    .setVersion('1.0')
    .addTag('cats')
    .build();

  const catDocument = SwaggerModule.createDocument(app, options, {
    include: [CatsModule]
  });
  SwaggerModule.setup('api/cats', app, catDocument);

  const secondOptions = new DocumentBuilder()
    .setTitle('Dogs example')
    .setDescription('The dogs API description')
    .setVersion('1.0')
    .addTag('dogs')
    .build();

  const dogDocument = SwaggerModule.createDocument(app, secondOptions, {
    include: [DogsModule]
  });
  SwaggerModule.setup('api/dogs', app, dogDocument);

  await app.listen(3000);
}
bootstrap();
```

现在，您可以使用以下命令启动服务器：

```bash
$ npm run start
```

导航到 `http://localhost:3000/api/cats` 查看 Swagger UI 里的 cats：

![img](https://docs.nestjs.com/assets/swagger-cats.png)

`http://localhost:3000/api/dogs` 查看 Swagger UI 里的 dogs：

![img](https://docs.nestjs.com/assets/swagger-dogs.png)

### 标签（Tags）

要将控制器附加到特定标签，请使用 `@ApiTags(...tags)` 装饰器。

```typescript
@ApiUseTags('cats')
@Controller('cats')
export class CatsController {}
```

### HTTP 头字段

要定义自定义 HTTP 标头作为请求一部分，请使用 `@ApiHeader()` 。

```typescript
@ApiHeader({
  name: 'Authorization',
  description: 'Auth token'
})
@Controller('cats')
export class CatsController {}
```

### 响应

要定义自定义 `HTTP` 响应，我们使用 `@ApiResponse()` 装饰器。

```typescript
@Post()
@ApiResponse({ status: 201, description: 'The record has been successfully created.'})
@ApiResponse({ status: 403, description: 'Forbidden.'})
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}
```

与异常过滤器部分中定义的常见 `HTTP` 异常相同，Nest 还提供了一组可重用的 **API 响应** ，这些响应继承自核心 `@ApiResponse` 装饰器：

- `@ApiOkResponse()`
- `@ApiCreatedResponse()`
- `@ApiBadRequestResponse()`
- `@ApiUnauthorizedResponse()`
- `@ApiNotFoundResponse()`
- `@ApiForbiddenResponse()`
- `@ApiMethodNotAllowedResponse()`
- `@ApiNotAcceptableResponse()`
- `@ApiRequestTimeoutResponse()`
- `@ApiConflictResponse()`
- `@ApiGoneResponse()`
- `@ApiPayloadTooLargeResponse()`
- `@ApiUnsupportedMediaTypeResponse()`
- `@ApiUnprocessableEntityResponse()`
- `@ApiInternalServerErrorResponse()`
- `@ApiNotImplementedResponse()`
- `@ApiBadGatewayResponse()`
- `@ApiServiceUnavailableResponse()`
- `@ApiGatewayTimeoutResponse()`
- `@ApiDefaultResponse()`

```typescript
@Post()
@ApiCreatedResponse({ description: 'The record has been successfully created.'})
@ApiForbiddenResponse({ description: 'Forbidden.'})
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}
```

要为请求指定返回模型，必须创建一个类并使用 `@ApiProperty()` 装饰器注释所有属性。

```typescript
export class Cat {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  age: number;

  @ApiProperty()
  breed: string;
}
```

之后，必须将 `Cat` 模型与响应装饰器的 `type` 属性结合使用。

```typescript
@ApiTags('cats')
@Controller('cats')
export class CatsController {
  @Post()
  @ApiCreatedResponse({
    description: 'The record has been successfully created.',
    type: Cat
  })
  async create(@Body() createCatDto: CreateCatDto): Promise<Cat> {
    return this.catsService.create(createCatDto);
  }
}
```

打开浏览器，验证生成的 `Cat` 模型:

![img](https://docs.nestjs.com/assets/swagger-response-type.png)

### 全局前缀

要忽略通过 `setGlobalPrefix()` 设置的路由的全局前缀，请使用 `ignoreGlobalPrefix`:

```typescript
const document = SwaggerModule.createDocument(app, options, {
  ignoreGlobalPrefix: true
});
```

### 安全

要定义针对特定操作应使用的安全性机制，请使用 `@ApiSecurity()` 装饰器。

```typescript
@ApiSecurity('basic')
@Controller('cats')
export class CatsController {}
```

在运行应用程序之前，请记住使用 `DocumentBuilder` 将安全性定义添加到您的基本文档中：

```typescript
const options = new DocumentBuilder().addSecurity('basic', {
  type: 'http',
  scheme: 'basic'
});
```

一些最流行的身份验证技术是预定义的（例如 `basic` 和 `bearer`），因此，您不必如上所述手动定义安全性机制。

### 基础认证

为了使用基础认证，使用 `@ApiBasicAuth()`。

```typescript
@ApiBasicAuth()
@Controller('cats')
export class CatsController {}
```

在运行应用程序之前，请记住使用 `DocumentBuilder` 将安全性定义添加到基本文档中：

```typescript
const options = new DocumentBuilder().addBasicAuth();
```

### Bearer 认证

为了使用 bearer 认证， 使用 `@ApiBearerAuth()`。

```typescript
@ApiBearerAuth()
@Controller('cats')
export class CatsController {}
```

在运行应用程序之前，请记住使用 `DocumentBuilder` 将安全性定义添加到基本文档中：

```typescript
const options = new DocumentBuilder().addBearerAuth();
```

### OAuth2 认证

为了使用 OAuth2 认证，使用 `@ApiOAuth2()`。

```typescript
@ApiOAuth2(['pets:write'])
@Controller('cats')
export class CatsController {}
```

在运行应用程序之前，请记住使用 `DocumentBuilder` 将安全性定义添加到基本文档中：

```typescript
const options = new DocumentBuilder().addOAuth2();
```
### Cookie 认证

使用`@ApiCookieAuth()`来使能cookie认证。
```typescript
@ApiCookieAuth()
@Controller('cats')
export class CatsController {}
```
在你运行应用前，记得使用`DocumentBuilder`来向你的基础文档添加安全定义。

```typescript
const options = new DocumentBuilder().addCookieAuth('optional-session-id');
```

### 文件上传

您可以使用 `@ApiBody` 装饰器和 `@ApiConsumes()` 为特定方法启用文件上载。 这里是使用[文件上传](https://docs.nestjs.com/techniques/file-upload)技术的完整示例：

```typescript
@UseInterceptors(FileInterceptor('file'))
@ApiConsumes('multipart/form-data')
@ApiBody({
  description: 'List of cats',
  type: FileUploadDto,
})
uploadFile(@UploadedFile() file) {}
```

`FileUploadDto` 如下所定义：

```typescript
class FileUploadDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;
}
```

### 扩展

要使用`@ApiExtension()`装饰器添加一个扩展，扩展名称必须以`x-`作为前缀。
```typescript
@ApiExtension('x-foo', { hello: 'world' })
```

### 装饰器

所有可用的 OpenAPI 装饰器都有一个 `Api` 前缀，可以清楚地区分核心装饰器。 以下是导出的装饰器的完整列表，以及可以应用装饰器的级别的名称。

|                          |                     |
| :----------------------: | :-----------------: |
|    `@ApiOperation()`     |       Method        |
|     `@ApiResponse()`     | Method / Controller |
|     `@ApiProduces()`     | Method / Controller |
|     `@ApiConsumes()`     | Method / Controller |
|    `@ApiBearerAuth()`    | Method / Controller |
|      `@ApiOAuth2()`      | Method / Controller |
|    `@ApiBasicAuth()`     | Method / Controller |
|     `@ApiSecurity()`     | Method / Controller |
|   `@ApiExtraModels()`    | Method / Controller |
|       `@ApiBody()`       |       Method        |
|      `@ApiParam()`       |       Method        |
|      `@ApiQuery()`       |       Method        |
|      `@ApiHeader()`      | Method / Controller |
| `@ApiExcludeEndpoint()`  |       Method        |
|       `@ApiTags()`       | Method / Controller |
|     `@ApiProperty()`     |        Model        |
| `@ApiPropertyOptional()` |        Model        |
|   `@ApiHideProperty()`   |        Model        |
|   `@ApiExtension()`      |        Model        |

### 插件

TypeScript 的元数据反射系统具有几个限制，这些限制使得例如无法确定类包含哪些属性或无法识别给定属性是可选属性还是必需属性。但是，其中一些限制可以在编译时解决。 Nest 提供了一个插件，可以增强 TypeScript 编译过程，以减少所需的样板代码量。

?> 该插件是**选择性**的。可以手动声明所有装饰器，也可以只声明需要的特定装饰器。

Swagger 插件会自动：

- 除非使用 `@ApiHideProperty`，否则用 `@ApiProperty` 注释所有 DTO 属性
- 根据问号标记设置 `required` 属性（例如，`name?: string` 将设置 `required: false`）
- 根据类型设置 `type` 或 `enum` 属性（也支持数组）
- 根据分配的默认值设置 `default` 属性
- 根据 `class-validator` 装饰器设置多个验证规则（如果 `classValidatorShim` 设置为 `true`）
- 向具有正确状态和 `type`（响应模型）的每个端点添加响应装饰器

请注意，你的文件名必须包含如下前缀之一：['.dto.ts', '.entity.ts'] (例如, create-user.dto.ts) 从而能让插件对其进行分析。

以前，如果您想通过 Swagger UI 提供交互式体验，您必须重复很多代码，以使程序包知道应如何在规范中声明您的模型/组件。例如，您可以定义一个简单的 `CreateUserDto` 类，如下所示：

```typescript
export class CreateUserDto {
  @ApiProperty()
  email: string;

  @ApiProperty()
  password: string;

  @ApiProperty({ enum: RoleEnum, default: [], isArray: true })
  roles: RoleEnum[] = [];

  @ApiProperty({ required: false, default: true })
  isEnabled?: boolean = true;
}
```

尽管对于中型项目而言这并不是什么大问题，但是一旦您拥有大量的类，它就会变得冗长而笨拙。

现在，在启用 Swagger 插件的情况下，可以简单地声明上述类定义：

```typescript
export class CreateUserDto {
  email: string;
  password: string;
  roles: RoleEnum[] = [];
  isEnabled?: boolean = true;
}
```

该插件会基于**抽象语法树**动态添加适当的装饰器。因此，您不必再为分散在整个项目中的 `@ApiProperty` 装饰器而苦恼。

?> 该插件将自动生成所有缺少的 swagger 属性，但是如果您需要覆盖它们，则只需通过 `@ApiProperty()` 显式设置它们即可。

为了启用该插件，只需打开 `nest-cli.json`（如果使用[Nest CLI](/cli/overview)) 并添加以下`plugins`配置：

```javascript
{
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "plugins": ["@nestjs/swagger/plugin"]
  }
}
```

您可以使用 `options` 属性来自定义插件的行为。

```javascript
"plugins": [
  {
    "name": "@nestjs/swagger/plugin",
    "options": {
      "classValidatorShim": false
    }
  }
]
```

`options` 属性必须满足以下接口：

```typescript
export interface PluginOptions {
  dtoFileNameSuffix?: string[];
  controllerFileNameSuffix?: string[];
  classValidatorShim?: boolean;
}
```

<table>
  <tr>
    <th>选项(Option)</th>
    <th>默认(Default)</th>
    <th>描述(Description)</th>
  </tr>
  <tr>
    <td><code>dtoFileNameSuffix</code></td>
    <td><code>['.dto.ts', '.entity.ts']</code></td>
    <td>DTO（数据传输对象）文件后缀</td>
  </tr>
  <tr>
    <td><code>controllerFileNameSuffix</code></td>
    <td><code>.controller.ts</code></td>
    <td>控制器文件后缀</td>
  </tr>
  <tr>
    <td><code>classValidatorShim</code></td>
    <td><code>true</code></td>
    <td>如果设置为true，则模块将重用 <code>class-validator</code> 验证装饰器 (例如 <code>@Max(10)</code> 会将 <code>max: 10</code> 添加到 schema 定义中) </td>
  </tr>
</table>

如果您不使用 CLI，而是使用自定义的 `webpack` 配置，则可以将此插件与 `ts-loader` 结合使用：

```javascript
getCustomTransformers: (program: any) => ({
  before: [require('@nestjs/swagger/plugin').before({}, program)]
}),
```

### 移植到 4.0

如果你现在正在使用 `@nestjs/swagger@3.*`，请注意版本 4.0 中的以下重大更改/ API 更改。

以下装饰器已经被更改/重命名：

- `@ApiModelProperty` 现在是 `@ApiProperty`
- `@ApiModelPropertyOptional` 现在是 `@ApiPropertyOptional`
- `@ApiResponseModelProperty` 现在是 `@ApiResponseProperty`
- `@ApiImplicitQuery` 现在是 `@ApiQuery`
- `@ApiImplicitParam` 现在是 `@ApiParam`
- `@ApiImplicitBody` 现在是 `@ApiBody`
- `@ApiImplicitHeader` 现在是 `@ApiHeader`
- `@ApiOperation({{ '{' }} title: 'test' {{ '}' }})` 现在是 `@ApiOperation({{ '{' }} summary: 'test' {{ '}' }})`
- `@ApiUseTags` 现在是 `@ApiTags`

`DocumentBuilder` 重大更改（更新的方法签名）:

- `addTag`
- `addBearerAuth`
- `addOAuth2`
- `setContactEmail` 现在是 `setContact`
- `setHost` 已经被移除
- `setSchemes` 已经被移除

如下方法被添加：

- `addServer`
- `addApiKey`
- `addBasicAuth`
- `addSecurity`
- `addSecurityRequirements`

### 示例

请参考这里的[示例](https://github.com/nestjs/nest/tree/master/sample/11-swagger)。

## 健康检查(Terminus)

Nestjs Terminus集成提供了可读的/实时的健康检查。在复杂的后台设置中健康检查是非常重要的。简而言之，在web开发领域所说的健康检查通常由一系列特定地址组成，例如，https://my-website.com/health/readiness  通过一个服务，或者一个你的基础设施的一个部件（例如Kubernetes）来持续检查这个地址。依赖于向这一地址发出的`GET`请求返回的HTTP状态码，该服务会在收到“不健康”响应时采取行动。由于你的服务中对“健康”和“不健康”的定义可能有所不同，Nestjs Teminus支持一系列健康指示。

作为示例，如果你的服务器使用 MongoDB来存储数据，MongoDB是否正常运行就成了一个至关重要的信息。在这种情况下，你可以使用`MongooseHealthIndicator`。如果配置正常--按后续内容配置--你的健康检查地址将根据MongoDB是否运行来返回健康或者不健康HTTP状态码。

### 入门

要开始使用 `@nestjs/terminus` ，我们需要安装所需的依赖项。

```bash
$ npm install --save @nestjs/terminus
```

### 建立一个健康检查

健康检查表示健康指标的摘要。健康指示器执行服务检查，无论是否处于健康状态。 如果所有分配的健康指示符都已启动并正在运行，则运行状况检查为正。由于许多应用程序需要类似的健康指标，因此 `@nestjs/terminus` 提供了一组预定义的健康指标，例如：

- `DNSHealthIndicator`
- `TypeOrmHealthIndicator`
- `MongooseHealthIndicator`
- `MicroserviceHealthIndicator`
- `GRPCHealthIndicator`
- `MemoryHealthIndicator`
- `DiskHealthIndicator`

要开始我们第一个健康检查，我们需要在`AppModule`引入`TerminusModule`。

> app.module.ts

```typescript
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

@Module({
  imports: [TerminusModule]
})
export class AppModule { }
```

我们的健康检查可以使用控制器来执行，使用`Nestjs CLI`可以快速配置：

```typescript
$ nest generate controller health
```

?> 强烈建议在你的应用程序中使用关机钩子。如果启用，Terminus将使用其生命周期事件。在[这里](https://docs.nestjs.com/fundamentals/lifecycle-events#application-shutdown)阅读更多关于关机钩子的内容。

### DNS 健康检查

我们安装了`@nestjs/terminus`后，导入`TerminusModule`并创建一个新的控制器，我们就准备好创建一个新的健康检查了。

> health.controller.ts

```typescript
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private dns: DNSHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.dns.pingCheck('nestjs-docs', 'https://docs.nestjs.com'),
    ]);
  }
}
```
我们的健康检查现在将发送一个Get请求到`https://docs.nestjs.com`地址，如果我们从该地址得到一个健康响应，我们的路径`http://localhost:3000/health`将在返回200状态码同时返回一个如下对象。

```json
{
  "status": "ok",
  "info": {
    "nestjs-docs": {
      "status": "up"
    }
  },
  "error": {},
  "details": {
    "nestjs-docs": {
      "status": "up"
    }
  }
}
```
该返回对象可以接口可以通过`@nestjs/terminus`包的`HealthCheckResult`接口来访问。

名称|内容|类型
--|--|--
status|如果任何健康检查失败了，状态将是'error'。如果NestJS应用即将关闭，但仍然能接受HTTP请求，状态检查将会返回'shutting_down'状态|'error'\|'ok'\|'shutting_down'
info|对象包括每个状态是`up`（或者说健康）的健康指示器的信息|`object`
error|对象包括每个状态是`down`（或者说不健康）的健康指示器的信息|`object`
details|对象包括每个健康指示器的所有信息|`object`


### 自定义健康指标

在某些情况下，`@nestjs/terminus` 提供的预定义健康指标不会涵盖您的所有健康检查要求。 在这种情况下，您可以根据需要设置自定义运行状况指示器。

让我们开始创建一个代表我们自定义健康指标的服务。为了基本了解健康指标的结构，我们将创建一个示例 `DogHealthIndicator` 。如果每个 `Dog` 对象都具有 `goodboy` 类型，则此健康指示器应具有 `'up'` 状态，否则将抛出错误，然后健康指示器将被视为 `'down'` 。

> dog.health.ts

```typescript
import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';

export interface Dog {
  name: string;
  type: string;
}

@Injectable()
export class DogHealthIndicator extends HealthIndicator {
  private dogs: Dog[] = [
    { name: 'Fido', type: 'goodboy' },
    { name: 'Rex', type: 'badboy' },
  ];

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const badboys = this.dogs.filter(dog => dog.type === 'badboy');
    const isHealthy = badboys.length === 0;
    const result = this.getStatus(key, isHealthy, { badboys: badboys.length });

    if (isHealthy) {
      return result;
    }
    throw new HealthCheckError('Dogcheck failed', result);
  }
}
```

我们需要做的下一件事是将健康指标注册为提供者。

> app.module.ts

```typescript
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { DogHealthIndicator } from './dog.health';

@Module({
  controllers: [HealthController],
  imports: [TerminusModule],
  providers: [DogHealthIndicator]
})
export class AppModule { }
```

?> 在应用程序中，`DogHealthIndicator` 应该在一个单独的模块中提供，例如 `DogModule` ，然后由 `AppModule` 导入。

最后需要做的是在所需的运行状况检查端点中添加现在可用的运行状况指示器。 为此，我们返回到 `HealthController` 并将其实现到 `check` 函数中。

> health.controller.ts

```typescript
import { HealthCheckService } from '@nestjs/terminus';
import { Injectable } from '@nestjs/common';
import { DogHealthIndicator } from './dog.health';

@Injectable()
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private dogHealthIndicator: DogHealthIndicator
  ) {}

  @Get()
  @HealthCheck()
  healthCheck() {
    return this.health.check([
      async () => this.dogHealthIndicator.isHealthy('dog'),
    ])
  }
}
```


## CQRS

可以用下列步骤来描述一个简单的 **[CRUD](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete)** 应用程序流程:

1. **控制器层**处理 HTTP 请求并将任务委派给服务层。
2. **服务层**是处理大部分业务逻辑。
3. 服务使用**存储库或 DAOs** 来更改/保存实体。
4. 实体充当值的容器，具有 `setter` 和 `getter` 。

在大部分情况下，这种模式对中小型应用来说是足够的。然而，当我们的需求变得更加复杂时，**CQRS** 模型可能更合适并且易于扩展。

为了简化这个模型，`Nest` 提供了一个轻量级的 [CQRS](https://github.com/nestjs/cqrs) 模块，本章描述如何使用它。

### 安装

首先安装需要的包

```bash
$ npm install --save @nestjs/cqrs
```

### 指令

在本模块中，每个行为都被称为一个 **Command** 。当任何命令被分派时，应用程序必须对其作出反应。命令可以从服务中分派(或直接来自控制器/网关)并在相应的 **Command 处理程序** 中使用。


> heroes-game.service.ts

```typescript
@Injectable()
export class HeroesGameService {
  constructor(private commandBus: CommandBus) {}

  async killDragon(heroId: string, killDragonDto: KillDragonDto) {
    return this.commandBus.execute(
      new KillDragonCommand(heroId, killDragonDto.dragonId)
    );
  }
}
```

这是一个示例服务, 它调度 `KillDragonCommand` 。让我们来看看这个命令:

> kill-dragon.command.ts

```typescript
export class KillDragonCommand {
  constructor(
    public readonly heroId: string,
    public readonly dragonId: string,
  ) {}
}
```

这个 `CommandBus` 是一个命令 **流** 。它将命令委托给等效的处理程序。每个命令必须有相应的命令处理程序：

> kill-dragon.handler.ts

```typescript
@CommandHandler(KillDragonCommand)
export class KillDragonHandler implements ICommandHandler<KillDragonCommand> {
  constructor(private repository: HeroRepository) {}

  async execute(command: KillDragonCommand) {
    const { heroId, dragonId } = command;
    const hero = this.repository.findOneById(+heroId);

    hero.killEnemy(dragonId);
    await this.repository.persist(hero);
  }
}
```

现在，每个应用程序状态更改都是**Command**发生的结果。 逻辑封装在处理程序中。 如果需要，我们可以简单地在此处添加日志，甚至更多，我们可以将命令保留在数据库中（例如用于诊断目的）。

### 事件（Events）

由于我们在处理程序中封装了命令，所以我们阻止了它们之间的交互-应用程序结构仍然不灵活，不具有**响应性**。解决方案是使用**事件**。

> hero-killed-dragon.event.ts

```typescript
export class HeroKilledDragonEvent {
  constructor(
    public readonly heroId: string,
    public readonly dragonId: string,
  ) {}
}
```

事件是异步的。它们可以通过**模型**或直接使用 `EventBus` 发送。为了发送事件，模型必须扩展 `AggregateRoot` 类。。

> hero.model.ts

```typescript
export class Hero extends AggregateRoot {
  constructor(private readonly id: string) {
    super();
  }

  killEnemy(enemyId: string) {
    // logic
    this.apply(new HeroKilledDragonEvent(this.id, enemyId));
  }
}
```

`apply()` 方法尚未发送事件，因为模型和 `EventPublisher` 类之间没有关系。如何关联模型和发布者？ 我们需要在我们的命令处理程序中使用一个发布者 `mergeObjectContext()` 方法。

> kill-dragon.handler.ts

```typescript
@CommandHandler(KillDragonCommand)
export class KillDragonHandler implements ICommandHandler<KillDragonCommand> {
  constructor(
    private repository: HeroRepository,
    private publisher: EventPublisher,
  ) {}

  async execute(command: KillDragonCommand) {
    const { heroId, dragonId } = command;
    const hero = this.publisher.mergeObjectContext(
      await this.repository.findOneById(+heroId),
    );
    hero.killEnemy(dragonId);
    hero.commit();
  }
}
```

现在，一切都按我们预期的方式工作。注意，我们需要 `commit()` 事件，因为他们不会立即被发布。显然，对象不必预先存在。我们也可以轻松地合并类型上下文:

```typescript
const HeroModel = this.publisher.mergeContext(Hero);
new HeroModel('id');
```

就是这样。模型现在能够发布事件。我们得处理他们。此外，我们可以使用 `EventBus` 手动发出事件。

```typescript
this.eventBus.publish(new HeroKilledDragonEvent());
```

?> `EventBus` 是一个可注入的类。

每个事件都可以有许多事件处理程序。

> hero-killed-dragon.handler.ts

```typescript
@EventsHandler(HeroKilledDragonEvent)
export class HeroKilledDragonHandler implements IEventHandler<HeroKilledDragonEvent> {
  constructor(private readonly repository: HeroRepository) {}

  handle(event: HeroKilledDragonEvent) {
    // logic
  }
}
```

现在，我们可以将写入逻辑移动到事件处理程序中。

### Sagas

这种类型的 **事件驱动架构** 可以提高应用程序的 **反应性** 和 **可伸缩性** 。现在, 当我们有了事件, 我们可以简单地以各种方式对他们作出反应。**Sagas**是建筑学观点的最后一个组成部分。

`sagas` 是一个非常强大的功能。单 `saga` 可以监听 1..* 事件。它可以组合，合并，过滤事件流。[RxJS](https://github.com/ReactiveX/rxjs) 库是`sagas`的来源地。简单地说, 每个 `sagas` 都必须返回一个包含命令的Observable。此命令是 **异步** 调用的。

> heroes-game.saga.ts

```typescript
@Injectable()
export class HeroesGameSagas {
  @Saga()
  dragonKilled = (events$: Observable<any>): Observable<ICommand> => {
    return events$.pipe(
      ofType(HeroKilledDragonEvent),
      map((event) => new DropAncientItemCommand(event.heroId, fakeItemID)),
    );
  }
}
```

?> `ofType` 运算符从 `@nestjs/cqrs` 包导出。

我们宣布一个规则 - 当任何英雄杀死龙时，古代物品就会掉落。 之后，`DropAncientItemCommand` 将由适当的处理程序调度和处理。

### 查询

`CqrsModule` 对于查询处理可能也很方便。 `QueryBus` 与 `CommandsBus` 的工作方式相同。 此外，查询处理程序应实现 `IQueryHandler` 接口并使用 `@QueryHandler()` 装饰器进行标记。


### 建立

我们要处理的最后一件事是建立整个机制。

> heroes-game.module.ts

```typescript
export const CommandHandlers = [KillDragonHandler, DropAncientItemHandler];
export const EventHandlers =  [HeroKilledDragonHandler, HeroFoundItemHandler];

@Module({
  imports: [CqrsModule],
  controllers: [HeroesGameController],
  providers: [
    HeroesGameService,
    HeroesGameSagas,
    ...CommandHandlers,
    ...EventHandlers,
    HeroRepository,
  ]
})
export class HeroesGameModule {}
```

### 概要

`CommandBus` ，`QueryBus` 和 `EventBus` 都是**Observables**。这意味着您可以轻松地订阅整个流, 并通过  **Event Sourcing** 丰富您的应用程序。

完整的源代码在[这里](https://github.com/kamilmysliwiec/nest-cqrs-example) 。



## 文档

**Compodoc**是 `Angular` 应用程序的文档工具。 `Nest` 和 `Angular` 看起来非常相似，因此，**Compodoc**也支持 `Nest` 应用程序。

### 建立

在现有的 `Nest` 项目中设置 `Compodoc` 非常简单。 安装[npm](https://www.npmjs.com/)后，只需在 `OS` 终端中使用以下命令添加 `dev-dependency` ：

```bash
$ npm i -D @compodoc/compodoc
```

### 生成
在[官方文档](https://compodoc.app/guides/usage.html)之后，您可以使用以下命令( `npx`需要`npm 6` )生成文档:

```bash
$ npx compodoc -p tsconfig.json -s
```

打开浏览器并导航到 `http://localhost:8080` 。 您应该看到一个初始的 `Nest CLI` 项目：

![img](https://docs.nestjs.com/assets/documentation-compodoc-1.jpg)

![img](https://docs.nestjs.com/assets/documentation-compodoc-2.jpg)

### 贡献

您可以[在此](https://github.com/compodoc/compodoc)参与 `Compodoc` 项目并为其做出贡献。

## Prisma

`Prisma` 将您的数据库转换为 `GraphQL API`，并允许将 `GraphQL` 用作所有数据库的通用查询语言(译者注：替代 orm )。您可以直接使用 `GraphQL` 查询数据库，而不是编写 `SQL` 或使用 `NoSQL API`。在本章中，我们不会详细介绍 `Prisma`，因此请访问他们的网站，了解可用的[功能](https://www.prisma.io/features/)。

!> 注意： 在本文中，您将学习如何集成 `Prisma` 到 `Nest` 框架中。我们假设您已经熟悉  `GraphQL` 概念和 `@nestjs/graphql` 模块。

### 依赖

首先，我们需要安装所需的包：

```bash
$ npm install --save prisma-binding
```

### 设置 Prisma

在使用 `Prisma` 时，您可以使用自己的实例或使用 [Prisma Cloud](https://www.prisma.io/cloud/) 。在本简介中，我们将使用 `Prisma` 提供的演示服务器。

1. 安装 Prisma CLI `npm install -g prisma`
2. 创建新服务 `prisma init` , 选择演示服务器并按照说明操作。
3. 部署您的服务 `prisma deploy`

如果您发现自己遇到麻烦，请跳转到[「快速入门」](https://www.prisma.io/docs/quickstart/) 部分以获取更多详细信息。最终，您应该在项目目录中看到两个新文件， `prisma.yaml` 配置文件：

```yaml
endpoint: https://us1.prisma.sh/nest-f6ec12/prisma/dev
datamodel: datamodel.graphql
```
并自动创建数据模型， `datamodel.graphql` 。

```graphql
type User {
  id: ID! @unique
  name: String!
}
```

!> 注意： 在实际应用程序中，您将创建更复杂的数据模型。有关Prisma中数据建模的更多信息，请单击[此处](https://www.prisma.io/features/data-modeling/)。

输入： `prisma playground` 您可以打开 `Prisma GraphQL API` 控制台。

### 创建客户端

有几种方法可以集成 `GraphQL API`。这里我们将使用 [GraphQL CLI](https://www.npmjs.com/package/graphql-cli)，这是一个用于常见 `GraphQL` 开发工作流的命令行工具。要安装 `GraphQL CLI`，请使用以下命令：

```bash
$ npm install -g graphql-cli
```

接下来，在 `Nest` 应用程序的根目录中创建 `.graphqlconfig` ：

```bash
touch .graphqlconfig.yml
```

将以下内容放入其中：

```yaml
projects:
  database:
    schemaPath: src/prisma/prisma-types.graphql
    extensions:
      endpoints:
        default: https://us1.prisma.sh/nest-f6ec12/prisma/dev
      codegen:
        - generator: prisma-binding
          language: typescript
          output:
            binding: src/prisma/prisma.binding.ts
 ```

 要将 `Prisma GraphQL` 架构下载到 `prisma/prisma-types.graphql` 并在 `prisma/prisma.binding.graphql` 下创建 `Prisma` 客户端，请在终端中运行以下命令：

 ```bash
$ graphql get-schema --project database
$ graphql codegen --project database
```

### 集成

现在，让我们为 `Prisma` 集成创建一个模块。

> prisma.service.ts

```typescript
import { Injectable } from '@nestjs/common';
import { Prisma } from './prisma.binding';

@Injectable()
export class PrismaService extends Prisma {
  constructor() {
    super({
      endpoint: 'https://us1.prisma.sh/nest-f6ec12/prisma/dev',
      debug: false,
    });
  }
}
```

一旦 `PrismaService` 准备就绪，我们需要创建一个对应模块。

> prisma.module

```typescript
import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

?> 提示： 要立即创建新模块和服务，我们可以使用 [Nest CLI](/8/cli.md)。创建 `PrismaModule` 类型 `nest g module prisma` 和服务 `nest g service prisma/prisma`

### 用法

若要使用新的服务，我们要 import `PrismaModule`，并注入 `PrismaService` 到 `UsersResolver`。

> users.module.ts

```typescript
import { Module } from '@nestjs/common';
import { UsersResolver } from './users.resolver';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [UsersResolver],
})
export class UsersModule {}
```

导入 `PrismaModule` 可以在 `UsersModule` 上下文中使用导出的 `PrismaService` 。

> users.resolver.ts

```typescript
import { Query, Resolver, Args, Info } from '@nestjs/graphql';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '../graphql.schema';

@Resolver()
export class UsersResolver {
  constructor(private readonly prisma: PrismaService) {}

  @Query('users')
  async getUsers(@Args() args, @Info() info): Promise<User[]> {
    return await this.prisma.query.users(args, info);
  }
}
```

### 例子

[这里](https://github.com/nestjs/nest/tree/master/sample/22-graphql-prisma)有一个稍微修改过的示例。





## 静态服务

为了像单页应用程序（ `SPA` ）一样提供静态内容，我们可以使用 `@nestjs/serve-static` 包中的`ServeStaticModule`。

### 安装

首先我们需要安装所需的软件包:

```bash
$ npm install --save @nestjs/serve-static
```

### bootstrap

安装过程完成后，我们可以将 `ServeStaticModule` 导入根 `AppModule`，并通过将配置对象传递给 `forRoot()` 方法来配置它。

```typescript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client'),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

有了这些之后，构建静态网站并将其内容放置在 `rootPath` 属性指定的位置。

### 总结

这里有一个工作[示例](https://github.com/nestjs/nest/tree/master/sample/24-serve-static)。


 ### 译者署名

| 用户名 | 头像 | 职能 | 签名 |
|---|---|---|---|
