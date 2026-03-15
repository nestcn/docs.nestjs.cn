<!-- 此文件从 content/techniques/mvc.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T05:12:23.051Z -->
<!-- 源文件: content/techniques/mvc.md -->

### Model-View-Controller

Nest 默认情况下使用了 __LINK_34__ 库，以便每种使用 MVC 模式在 Express 中的技术也适用于 Nest。

首先，让我们使用 __LINK_35__ 工具创建一个简单的 Nest 应用程序：

```bash
$ npm install --save @nestjs/typeorm typeorm mysql2

```

为了创建 MVC 应用程序，我们还需要一个 __LINK_36__ 来渲染我们的 HTML 视图：

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

我们使用了 __INLINE_CODE_10__ (__LINK_37__) 引擎，但你可以使用适合你的要求的任何引擎。安装完成后，我们需要使用以下代码配置 Express 实例：

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

我们告诉 __LINK_38__ 将 __INLINE_CODE_11__ 目录用作静态资产存储,__INLINE_CODE_12__ 目录中包含模板,__INLINE_CODE_13__ 模板引擎将用来渲染 HTML 输出。

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

然后，打开 __INLINE_CODE_17__ 文件，并将 __INLINE_CODE_18__ 方法替换为以下代码：

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

在这个代码中，我们指定了使用的模板在 __INLINE_CODE_19__ 装饰器中，并将路由处理方法的返回值传递给模板进行渲染。注意返回值是一个对象，其中包含 __INLINE_CODE_20__ 属性，匹配模板中的 __INLINE_CODE_21__ 占位符。

应用程序运行时，打开浏览器并导航到 __INLINE_CODE_22__。你应该看到 __INLINE_CODE_23__ 消息。

#### 动态模板渲染

如果应用程序逻辑需要动态决定哪个模板渲染，那么我们应该使用 __INLINE_CODE_24__ 装饰器，并在路由处理方法中提供视图名称，而不是在 __INLINE_CODE_25__ 装饰器中：

> 信息 **提示** 当 Nest 检测 __INLINE_CODE_26__ 装饰器时，它将注入库特定的 __INLINE_CODE_27__ 对象。我们可以使用这个对象来动态渲染模板。了解更多关于 __INLINE_CODE_28__ 对象 API __LINK_39__。

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

有一个可工作的示例 __LINK_40__。

#### Fastify

如 __LINK_41__ 中所述，我们可以使用任何兼容 HTTP 提供者与 Nest 一起。一个这样的库是 __LINK_42__。为了创建一个使用 Fastify 的 MVC 应用程序，我们需要安装以下包：

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

接下来的步骤跟 Express 使用的步骤相似，但有少量特定于平台的差异。安装完成后，打开 __INLINE_CODE_29__ 文件，并更新其内容：

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

Fastify API 有一些差异，但最终结果是一样的。一个值得注意的差异是，在使用 Fastify 时，您必须将模板名称传递到 __INLINE_CODE_30__ 装饰器中，包括文件扩展名。

Here's how you can set it up:

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

应用程序运行时，打开浏览器并导航到 __INLINE_CODE_32__。你应该看到 __INLINE_CODE_33__ 消息。

#### 示例

有一个可工作的示例 __LINK_43__。