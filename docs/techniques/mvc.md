<!-- 此文件从 content/techniques/mvc.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:53:04.563Z -->
<!-- 源文件: content/techniques/mvc.md -->

### Model-View-Controller

Nest，默认情况下，使用了 __LINK_34__ 库。因此，对于使用 Express 的 MVC 模式的所有技术也适用于 Nest。

首先，让我们使用 __LINK_35__ 工具创建一个简单的 Nest 应用程序：

```bash
$ npm install --save @nestjs/typeorm typeorm mysql2

```

为了创建一个 MVC 应用程序，我们还需要一个 __LINK_36__ 来渲染我们的 HTML 视图：

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'test',
      entities: [],
      synchronize: true,
    }),
  ],
})
export class AppModule {}

```

我们使用了 __INLINE_CODE_10__ (__LINK_37__) 引擎，但您可以使用适合您的要求的任何引擎。安装过程完成后，我们需要使用以下代码配置 Express 实例：

```typescript
import { DataSource } from 'typeorm';

@Module({
  imports: [TypeOrmModule.forRoot(), UsersModule],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}

@Dependencies(DataSource)
@Module({
  imports: [TypeOrmModule.forRoot(), UsersModule],
})
export class AppModule {
  constructor(dataSource) {
    this.dataSource = dataSource;
  }
}

```

我们告诉 __LINK_38__，将使用 __INLINE_CODE_11__ 目录存储静态资产，__INLINE_CODE_12__ 目录包含模板，使用 __INLINE_CODE_13__ 模板引擎渲染 HTML 输出。

#### 模板渲染

现在，让我们创建一个 __INLINE_CODE_14__ 目录和 __INLINE_CODE_15__ 模板。在模板中，我们将打印从控制器传递的 __INLINE_CODE_16__：

```typescript
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ default: true })
  isActive: boolean;
}

```

接下来，打开 __INLINE_CODE_17__ 文件，并将 __INLINE_CODE_18__ 方法替换为以下代码：

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'test',
      entities: [User],
      synchronize: true,
    }),
  ],
})
export class AppModule {}

```

在这段代码中，我们指定了使用的模板在 __INLINE_CODE_19__ 装饰器中，并将路由处理方法的返回值传递给模板进行渲染。注意，返回值是一个对象，其中具有 __INLINE_CODE_20__ 属性，匹配模板中的 __INLINE_CODE_21__ placeholder。

在应用程序运行时，打开浏览器，导航到 __INLINE_CODE_22__。您应该看到 __INLINE_CODE_23__ 消息。

#### 动态模板渲染

如果应用程序逻辑必须动态决定哪个模板 Rendering， entonces 我们应该使用 __INLINE_CODE_24__ 装饰器，并在路由处理方法中提供视图名称，而不是在 __INLINE_CODE_25__ 装饰器中：

> info **提示**当 Nest 检测 __INLINE_CODE_26__ 装饰器时，它将注入库特定的 __INLINE_CODE_27__ 对象。我们可以使用这个对象来动态渲染模板。了解更多关于 __INLINE_CODE_28__ 对象 API __LINK_39__。

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}

```

#### 示例

可用的工作示例 __LINK_40__。

#### Fastify

如 __LINK_41__ 中所述，我们可以使用任何兼容的 HTTP 提供者与 Nest 一起。一个这样的库是 __LINK_42__。要创建一个 Fastify MVC 应用程序，我们需要安装以下包：

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findOne(id: number): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }
}

@Injectable()
@Dependencies(getRepositoryToken(User))
export class UsersService {
  constructor(usersRepository) {
    this.usersRepository = usersRepository;
  }

  findAll() {
    return this.usersRepository.find();
  }

  findOne(id) {
    return this.usersRepository.findOneBy({ id });
  }

  async remove(id) {
    await this.usersRepository.delete(id);
  }
}

```

下一步将涵盖与 Express 相似的过程，但有一些特定于平台的差异。安装过程完成后，打开 __INLINE_CODE_29__ 文件，并更新其内容：

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  exports: [TypeOrmModule]
})
export class UsersModule {}

```

Fastify API 有一些差异，但最终结果是相同的。一个值得注意的差异是，在使用 Fastify 时，您必须将模板名称传递给 __INLINE_CODE_30__ 装饰器，其中包括文件扩展名。

以下是如何设置：

```typescript
import { Module } from '@nestjs/common';
import { UsersModule } from './users.module';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  imports: [UsersModule],
  providers: [UsersService],
  controllers: [UsersController]
})
export class UserHttpModule {}

```

或者，您可以使用 __INLINE_CODE_31__ 装饰器直接注入响应，并指定要渲染的视图，如下所示：

```typescript
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Photo } from '../photos/photo.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(type => Photo, photo => photo.user)
  photos: Photo[];
}

```

在应用程序运行时，打开浏览器，导航到 __INLINE_CODE_32__。您应该看到 __INLINE_CODE_33__ 消息。

#### 示例

可用的工作示例 __LINK_43__。