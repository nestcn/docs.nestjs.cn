<!-- 此文件从 content/recipes/sql-sequelize.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:32:00.544Z -->
<!-- 源文件: content/recipes/sql-sequelize.md -->

### SQL (Sequelize)

##### 本章只适用于 TypeScript

> **警告** 在本文中，您将学习如何使用自定义组件从 scratch 创建一个基于 **Sequelize** 包的 __INLINE_CODE_7__。由于该技术包含了许多可避免的 overhead，您可以使用专门的 __INLINE_CODE_8__ 包来避免这些 overhead。要了解更多，请查看 __LINK_30__。

__LINK_31__ 是一个流行的对象关系映射器（ORM），用 vanilla JavaScript 编写，但有一个 __LINK_32__ TypeScript 包装器，提供了一组装饰器和其他 extras 对基础 sequelize。

#### 获取开始

要开始使用这个库，我们需要安装以下依赖项：

```bash
$ npm install --save @nestjs/passport passport passport-local
$ npm install --save-dev @types/passport-local

```

首先，我们需要创建一个 **Sequelize** 实例，带有选项对象作为构造函数的参数。此外，我们需要添加所有模型（或者使用 __INLINE_CODE_9__ 属性）和 __INLINE_CODE_10__ 数据库表。

```bash
$ nest g module auth
$ nest g service auth

```

> 提示 **Hint** 我们遵循最佳实践，声明了自定义提供者在单独的文件中，该文件有 __INLINE_CODE_11__ 后缀。

然后，我们需要将这些提供者导出，以便将它们 __INLINE_CODE_12__ 应用程序的其余部分。

```bash
$ nest g module users
$ nest g service users

```

现在，我们可以使用 __INLINE_CODE_13__ 装饰器注入 __INLINE_CODE_12__ 对象。每个依赖于 __INLINE_CODE_14__ 异步提供者的类都会等待 __INLINE_CODE_15__ 解析完成。

#### 模型注入

在 __LINK_33__ 中，**Model** 定义了数据库中的一个表。该类的实例表示数据库行。首先，我们需要至少一个实体：

```typescript
import { Injectable } from '@nestjs/common';

// This should be a real class/interface representing a user entity
export type User = any;

@Injectable()
export class UsersService {
  private readonly users = [
    {
      userId: 1,
      username: 'john',
      password: 'changeme',
    },
    {
      userId: 2,
      username: 'maria',
      password: 'guess',
    },
  ];

  async findOne(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username);
  }
}

@Injectable()
export class UsersService {
  constructor() {
    this.users = [
      {
        userId: 1,
        username: 'john',
        password: 'changeme',
      },
      {
        userId: 2,
        username: 'maria',
        password: 'guess',
      },
    ];
  }

  async findOne(username) {
    return this.users.find(user => user.username === username);
  }
}

```

__INLINE_CODE_16__ 实体属于 __INLINE_CODE_17__ 目录，该目录表示 __INLINE_CODE_18__。现在是创建 **Repository** 提供者的时间：

```typescript
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';

@Module({
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

@Module({
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

```

> 警告 **Warning** 在实际应用中，您应该避免 **magic strings**。同时， __INLINE_CODE_19__ 和 __INLINE_CODE_20__ 应该在单独的 __INLINE_CODE_21__ 文件中。

在 Sequelize 中，我们使用静态方法来操作数据，因此创建了一个 **alias**。

现在，我们可以使用 __INLINE_CODE_24__ 装饰器将 __INLINE_CODE_22__ 注入到 __INLINE_CODE_23__ 中：

```typescript
import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    if (user && user.password === pass) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }
}

@Injectable()
@Dependencies(UsersService)
export class AuthService {
  constructor(usersService) {
    this.usersService = usersService;
  }

  async validateUser(username, pass) {
    const user = await this.usersService.findOne(username);
    if (user && user.password === pass) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }
}

```

数据库连接是 **异步** 的，但 Nest 使得这个过程对终端用户完全不可见。__INLINE_CODE_25__ 提供者等待数据库连接，__INLINE_CODE_26__ 延迟到存储库准备就绪时。整个应用程序可以在每个类实例化时启动。

以下是最后一个 __INLINE_CODE_27__：

```typescript
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  providers: [AuthService],
})
export class AuthModule {}

@Module({
  imports: [UsersModule],
  providers: [AuthService],
})
export class AuthModule {}

```

> 提示 **Hint** 不要忘记将 __INLINE_CODE_28__ 导入到根 __INLINE_CODE_29__ 中。