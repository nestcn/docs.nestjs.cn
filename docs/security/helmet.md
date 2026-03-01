<!-- 此文件从 content/security/helmet.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-01T04:18:19.259Z -->
<!-- 源文件: content/security/helmet.md -->

### Helmet

__LINK_21__ 可以帮助保护您的应用程序免受一些知名的web漏洞攻击，以设置适当的HTTP头。Helmet 通常只是一个小型的中间件函数集合，用于设置安全相关的HTTP头（请阅读 __LINK_22__）。

> info **提示**请注意，在注册 __INLINE_CODE_5__ 作为全局中间件或在 setup 函数中注册它，需要在其他 __INLINE_CODE_6__ 或 setup 函数调用的前面。这是因为所使用的平台（即 Express 或 Fastify）中的中间件顺序对结果产生影响。如果您使用如 __INLINE_CODE_8__ 或 __INLINE_CODE_9__ 之类的中间件在定义路由后，那么这些中间件将只应用于路由，不能应用于定义在中间件后的路由。

#### 使用 Express (默认)

首先，安装所需的包。

```bash
$ nest g module auth
$ nest g controller auth
$ nest g service auth
```

安装完成后，应用它作为全局中间件。

```bash
$ nest g module users
$ nest g service users
```

> warning **警告**在使用 __INLINE_CODE_10__、__INLINE_CODE_11__ (4.x) 和 __LINK_23__ 时，可能会出现在 Apollo Sandbox 上的 __LINK_24__ 问题。要解决这个问题，请按照以下配置 CSP：
>
> ```typescript
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
```bash
$ npm i --save @fastify/helmet
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
```typescript
import helmet from '@fastify/helmet'
// 在初始化文件中某处
await app.register(helmet)
```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async signIn(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    if (user?.password !== pass) {
      throw new UnauthorizedException();
    }
    const { password, ...result } = user;
    // TODO: Generate a JWT and return it here
    // instead of the user object
    return result;
  }
}

@Injectable()
@Dependencies(UsersService)
export class AuthService {
  constructor(usersService) {
    this.usersService = usersService;
  }

  async signIn(username: string, pass: string) {
    const user = await this.usersService.findOne(username);
    if (user?.password !== pass) {
      throw new UnauthorizedException();
    }
    const { password, ...result } = user;
    // TODO: Generate a JWT and return it here
    // instead of the user object
    return result;
  }
}
```typescript
> await app.register(fastifyHelmet, {
>    contentSecurityPolicy: {
>      directives: {
>        defaultSrc: [__INLINE_CODE_12__, 'unpkg.com'],
>        styleSrc: [
>          __INLINE_CODE_13__,
>          __INLINE_CODE_14__,
>          'cdn.jsdelivr.net',
>          'fonts.googleapis.com',
>          'unpkg.com',
>        ],
>        fontSrc: [__INLINE_CODE_15__, 'fonts.gstatic.com', 'data:'],
>        imgSrc: [__INLINE_CODE_16__, 'data:', 'cdn.jsdelivr.net'],
>        scriptSrc: [
>          __INLINE_CODE_17__,
>          __INLINE_CODE_18__,
>          `AuthModule`,
>          `AuthService`,
>        ],
>      },
>    },
>  });
>
> // 如果您不打算使用 CSP，那么可以使用以下代码：
> await app.register(fastifyHelmet, {
>   contentSecurityPolicy: false,
> });
> ```
