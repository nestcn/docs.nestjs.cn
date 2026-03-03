<!-- 此文件从 content/security/csrf.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-03T04:11:17.690Z -->
<!-- 源文件: content/security/csrf.md -->

### 防止 CSRF 攻击

跨站请求伪造（CSRF 或 XSRF）是一种攻击，攻击者将未经授权的命令从信任的用户发送到 Web 应用程序。为了帮助防止这种攻击，您可以使用 __LINK_8__ 包。

#### 使用 Express（默认）

首先，安装所需的包：

```bash
$ nest g module auth
$ nest g controller auth
$ nest g service auth
```

> 警告 **注意**，如 __LINK_9__ 中所述，这个中间件需要会话中间件或 __INLINE_CODE_4__ 初始化之前。请查看文档以获取更多详细信息。

安装完成后，请将 __INLINE_CODE_5__ 中间件注册为全局中间件。

```bash
$ nest g module users
$ nest g service users
```

#### 使用 Fastify

首先，安装所需的包：

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

安装完成后，请将 __INLINE_CODE_6__ 插件注册如下：

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

> 警告 **注意**，如 __INLINE_CODE_7__ 文档 __LINK_10__ 中所述，这个插件需要在初始化存储插件之前。请查看文档以获取更多详细信息。

Note:

* __LINK_8__ should be replaced with the actual link to the CSRF protection package.
* __INLINE_CODE_4__, __INLINE_CODE_5__, __INLINE_CODE_6__, and __INLINE_CODE_7__ should be replaced with the actual code snippets.
* ```bash
$ nest g module auth
$ nest g controller auth
$ nest g service auth
```, ```bash
$ nest g module users
$ nest g service users
```, ```typescript
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
```, and ```typescript
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
``` should be replaced with the actual code blocks.
* __LINK_9__ and __LINK_10__ should be replaced with the actual links to the documentation.
* The warnings and notes should be translated to Chinese accordingly.