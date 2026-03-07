<!-- 此文件从 content/recipes/mikroorm.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-03T04:13:39.278Z -->
<!-- 源文件: content/recipes/mikroorm.md -->

### MikroORM

MikroORM 是一个 TypeScript ORM，基于 Data Mapper、Unit of Work 和 Identity Map 模式。它是 TypeORM 的一个优秀替代品，提供了更简洁的 API 和更好的性能。

> 信息 **信息** MikroORM 是一个第三方包，不受 NestJS 核心团队管理。请在 [MikroORM GitHub 仓库](https://github.com/mikro-orm/mikro-orm) 中报告该库中的任何问题。

#### 安装

首先，安装必要的依赖：

```bash
npm install --save mikro-orm/core mikro-orm/mysql # 或其他数据库驱动
npm install --save-dev mikro-orm/cli

```

#### 集成到 NestJS

与 Nest 集成 MikroORM 的最简单方法是通过 `@mikro-orm/nestjs` 包：

```bash
npm install --save @mikro-orm/nestjs

```

然后，在根模块中配置 MikroORM：

```typescript
import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './user.entity';

@Module({
  imports: [
    MikroOrmModule.forRoot({
      entities: [User],
      dbName: 'nestjs-mikroorm',
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: 'password',
    }),
    MikroOrmModule.forFeature([User]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

```

#### 实体定义

定义一个简单的 User 实体：

```typescript
import { Entity, PrimaryKey, Property } from 'mikro-orm';

@Entity()
export class User {
  @PrimaryKey()
  id: number;

  @Property()
  name: string;

  @Property()
  email: string;

  @Property({ default: () => 'NOW()' })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => 'NOW()' })
  updatedAt: Date = new Date();
}

```

#### 仓库模式

MikroORM 支持仓库设计模式。对于每个实体，我们可以使用自动生成的仓库或创建自定义仓库。

使用自动生成的仓库：

```typescript
import { Injectable } from '@nestjs/common';
import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  async findOne(id: number): Promise<User | null> {
    return this.userRepository.findOne(id);
  }

  async create(user: Partial<User>): Promise<User> {
    const newUser = this.userRepository.create(user);
    await this.userRepository.persistAndFlush(newUser);
    return newUser;
  }

  async update(id: number, user: Partial<User>): Promise<User | null> {
    const existingUser = await this.userRepository.findOne(id);
    if (!existingUser) {
      return null;
    }
    Object.assign(existingUser, user);
    await this.userRepository.persistAndFlush(existingUser);
    return existingUser;
  }

  async delete(id: number): Promise<boolean> {
    const user = await this.userRepository.findOne(id);
    if (!user) {
      return false;
    }
    await this.userRepository.removeAndFlush(user);
    return true;
  }
}

```

#### 自定义仓库

创建自定义仓库：

```typescript
import { EntityRepository } from '@mikro-orm/core';
import { User } from './user.entity';

export class UserRepository extends EntityRepository<User> {
  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ email });
  }

  async findActiveUsers(): Promise<User[]> {
    return this.find({ active: true });
  }
}

```

在模块中注册自定义仓库：

```typescript
import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from './user.entity';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';
import { UserController } from './user.controller';

@Module({
  imports: [
    MikroOrmModule.forFeature({
      entities: [User],
      repositories: [UserRepository],
    }),
  ],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}

```

然后在服务中使用自定义仓库：

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { User } from './user.entity';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: UserRepository,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  async findActiveUsers(): Promise<User[]> {
    return this.userRepository.findActiveUsers();
  }
}

```

#### 自动加载实体

手动将实体添加到连接选项的实体数组中可能很繁琐。你可以使用静态 glob 路径来自动加载实体：

```typescript
MikroOrmModule.forRoot({
  entities: ['./dist/**/*.entity.js'],
  entitiesTs: ['./src/**/*.entity.ts'],
  // 其他配置...
});

```

注意，glob 路径在 webpack 中不受支持，所以如果你在 monorepo 中构建应用程序，你将无法使用它们。

#### 迁移

MikroORM 提供了迁移功能来管理数据库模式的变更。首先，初始化迁移配置：

```bash
npx mikro-orm migration:init

```

然后，生成迁移：

```bash
npx mikro-orm migration:create

```

运行迁移：

```bash
npx mikro-orm migration:up

```

#### 测试

在测试中使用 MikroORM：

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { UserService } from './user.service';
import { User } from './user.entity';

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MikroOrmModule.forRoot({
          entities: [User],
          dbName: ':memory:',
          type: 'sqlite',
          allowGlobalContext: true,
        }),
        MikroOrmModule.forFeature([User]),
      ],
      providers: [UserService],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a user', async () => {
    const user = await service.create({ name: 'John', email: 'john@example.com' });
    expect(user).toBeDefined();
    expect(user.id).toBeDefined();
    expect(user.name).toBe('John');
    expect(user.email).toBe('john@example.com');
  });
});

```

#### 总结

MikroORM 是一个功能强大的 ORM 库，与 NestJS 集成简单直接。它提供了仓库模式、迁移功能和自动实体加载等特性，使数据库操作更加便捷和类型安全。

要了解更多关于 MikroORM 的信息，请查看 [官方文档](https://mikro-orm.io/docs/)。