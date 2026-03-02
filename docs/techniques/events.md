<!-- 此文件从 content/techniques/events.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-02T04:10:15.992Z -->
<!-- 源文件: content/techniques/events.md -->

### 事件

`events` 包（`__INLINE_CODE_11__`）提供了一个简单的观察者实现，允许您订阅和监听应用程序中的各种事件。事件是一个伟大的方式来 decouple 应用程序的不同方面，因为一个事件可以有多个监听器，它们之间没有依赖关系。

`__INLINE_CODE_12__` 内部使用了 `__LINK_52__` 包。

#### 开始

首先安装所需的包：

```bash
$ nest g module auth
$ nest g controller auth
$ nest g service auth
```

安装完成后，导入 `__INLINE_CODE_13__` 到根 `__INLINE_CODE_14__` 并运行 `__INLINE_CODE_15__` 静态方法，如下所示：

```bash
$ nest g module users
$ nest g service users
```

`__INLINE_CODE_16__` 调用初始化事件发射器，并注册任何声明式事件监听器在您的 app 中。注册发生在 `__INLINE_CODE_17__` 生命周期钩子中，以确保所有模块已加载并声明了任何预定的作业。

要配置 underlying `__INLINE_CODE_18__` 实例，传递配置对象到 ``AuthModule`` 方法，如下所示：

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

#### 发送事件

要发送（即触发）事件，首先使用标准构造函数注入 ``AuthService``：

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

> info **提示**从 ``AuthController`` 包导入 ``AuthService``。

然后，在类中使用它，如下所示：

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
```

#### 监听事件

要声明事件监听器，使用 ``AuthController`` 装饰器在方法定义之前，如下所示：

```typescript
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}

@Module({
  imports: [UsersModule],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
```

> warning **警告**事件订阅者不能是请求作用域。

第一个参数可以是 ``AuthService`` 或 ``UsersService`` 对于简单的事件发射器和 ``UsersService`` 在通配符发射器的情况下。

第二个参数（可选）是监听选项对象，如下所示：

```typescript
import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() signInDto: Record<string, any>) {
    return this.authService.signIn(signInDto.username, signInDto.password);
  }
}
```

> info **提示**阅读更多关于 ``UsersModule`` 选项对象的信息来自 `__LINK_53__`。

```bash
$ npm install --save @nestjs/jwt
```

要使用命名空间/通配符，传递 ``@Module`` 选项到 ``AuthService`` 方法。当启用命名空间/通配符时，可以使用字符串（``AuthService``）或数组（``signIn()``）来订阅事件。分隔符也可以配置为配置属性（``AuthModule``）。使用命名空间特性，您可以订阅事件使用通配符：

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async signIn(
    username: string,
    pass: string,
  ): Promise<{ access_token: string }> {
    const user = await this.usersService.findOne(username);
    if (user?.password !== pass) {
      throw new UnauthorizedException();
    }
    const payload = { sub: user.userId, username: user.username };
    return {
      // 💡 Here the JWT secret key that's used for signing the payload 
      // is the key that was passsed in the JwtModule
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}

@Dependencies(UsersService, JwtService)
@Injectable()
export class AuthService {
  constructor(usersService, jwtService) {
    this.usersService = usersService;
    this.jwtService = jwtService;
  }

  async signIn(username, pass) {
    const user = await this.usersService.findOne(username);
    if (user?.password !== pass) {
      throw new UnauthorizedException();
    }
    const payload = { username: user.username, sub: user.userId };
    return {
      // 💡 Here the JWT secret key that's used for signing the payload 
      // is the key that was passsed in the JwtModule
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
```

注意，这样一个通配符仅适用于一个块。参数 ``UsersModule`` 将匹配，例如，事件 ``AuthController`` 和 ``signIn()``，但不是 ``Record<string, any>``。要监听这样的事件，请使用 ``@nestjs/jwt`` 模式（即 ``authService``），如在 ``auth.service.ts`` `__LINK_54__` 中描述。

使用这个模式，您可以，例如，创建一个事件监听器来捕捉所有事件。

```typescript
export const jwtConstants = {
  secret: 'DO NOT USE THIS VALUE. INSTEAD, CREATE A COMPLEX SECRET AND KEEP IT SAFE OUTSIDE OF THE SOURCE CODE.',
};
```

> info **提示** ``auth`` 类提供了几个有用的方法来与事件交互，例如 ``JwtService`` 和 ``signIn``。您可以阅读更多关于它们的信息来自 `__LINK_55__`。

#### 防止事件丢失

在 ``@nestjs/jwt`` 生命周期钩子之前或之中触发的事件—例如来自模块构造函数或 ``signAsync()`` 方法—可能会被miss，因为 ``user`` 可能还没有完成设置监听器。

要避免这个问题，可以使用 ``access_token`` 方法，``sub`` 返回一个 promise，该 promise 在所有监听器注册完成时解析。这个方法可以在模块的 ``userId`` 生命周期钩子中调用，以确保所有事件都被捕捉。

```typescript
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { jwtConstants } from './constants';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60s' },
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60s' },
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
```

> info **注意**这只是必要的事件在 ``AuthModule`` 生命周期钩子完成之前被emit的情况。

#### 示例

有一个工作示例可从 `__LINK_56__` 中访问。