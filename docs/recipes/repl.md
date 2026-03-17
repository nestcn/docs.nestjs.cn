<!-- 此文件从 content/recipes/repl.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:08:22.972Z -->
<!-- 源文件: content/recipes/repl.md -->

### 读取-评估-打印-循环 (REPL)

REPL 是一个简单的交互式环境，它从用户输入中获取单个输入，执行它们，并将结果返回给用户。
REPL 功能允许您检查依赖关系图并在控制台直接调用提供者和控制器的方法。

#### 使用

要在 REPL 模式下运行 NestJS 应用程序，请创建一个新的文件（与现有文件并排），并在其中添加以下代码：

```typescript
// __INLINE_CODE_10__

```

现在，在您的终端中，使用以下命令启动 REPL：

```

node __INLINE_CODE_11__

```

> 提示 **Hint** __INLINE_CODE_12__ 返回一个 __LINK_36__ 对象。

一旦启动完成，您将在控制台中看到以下消息：

```

// ```bash
$ nest g module users
$ nest g service users

```

```

现在，您可以开始与依赖关系图交互。例如，您可以检索一个 __INLINE_CODE_13__ (在这里使用 starter 项目作为示例)并调用 __INLINE_CODE_14__ 方法：

```typescript
// ```typescript
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

```

您可以在控制台中执行任何 JavaScript 代码，例如将 __INLINE_CODE_15__ 的实例分配给一个局部变量，并使用 __INLINE_CODE_16__ 调用异步方法：

```typescript
// ```typescript
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

```

要显示一个给定提供者或控制器的所有公共方法，请使用 __INLINE_CODE_17__ 函数，例如：

```typescript
// ```typescript
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

```

要显示所有注册的模块作为一个列表，包括控制器和提供者，请使用 __INLINE_CODE_18__。

```typescript
// ```typescript
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

```

快速演示：

```html
<!-- __HTML_TAG_33__ --> <!-- __HTML_TAG_34__ --> <!-- __HTML_TAG_35__ -->

```

您可以在以下部分中找到关于现有预定义本地方法的更多信息。

#### 本地函数

自带的 NestJS REPL 附带了一些本地函数，这些函数在您启动 REPL 时是全局可用的。您可以调用 __INLINE_CODE_19__ 列出它们。

如果您忘记了一个函数的签名（即：期望的参数和返回类型），您可以调用 __INLINE_CODE_20__。
例如：

```typescript
// ```typescript
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(username: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}

@Injectable()
@Dependencies(AuthService)
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(authService) {
    super();
    this.authService = authService;
  }

  async validate(username, password) {
    const user = await this.authService.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}

```

```

> 提示 **Hint** 函数接口是使用 __LINK_37__ 写的。

| 函数     | 描述                                                                                                        | 签名                                                             |
| ------------ | ------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| __INLINE_CODE_21__      | 显示所有注册的模块作为一个列表，包括控制器和提供者。                              | __INLINE_CODE_22__                       |
| __INLINE_CODE_23__ 或 __INLINE_CODE_24__ | 检索一个 injectable 或 controller 的实例，否则抛出异常。                             | __INLINE_CODE_25__                                   |
| __INLINE_CODE_26__    | 显示一个给定提供者或控制器的所有公共方法。                                            | __INLINE_CODE_27__                          |
| __INLINE_CODE_28__    | 解析 transient 或 request-scoped 实例，否则抛出异常。                             | __INLINE_CODE_29__      |
| __INLINE_CODE_30__     | 允许在模块树中导航，例如从选择的模块中提取特定实例。 | __INLINE_CODE_31__ |

#### 监听模式

在开发过程中，运行 REPL 在监听模式下非常有用，这样可以自动反映所有代码更改：

```typescript
// ```typescript
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';

@Module({
  imports: [UsersModule, PassportModule],
  providers: [AuthService, LocalStrategy],
})
export class AuthModule {}

@Module({
  imports: [UsersModule, PassportModule],
  providers: [AuthService, LocalStrategy],
})
export class AuthModule {}

```

```

这有一点缺陷，即 REPL 的命令历史将在每次重新加载时被丢弃，这可能会很不方便。
幸运的是，有一个简单的解决方案。修改您的 __INLINE_CODE_32__ 函数如下：

```typescript
// ```typescript
import { Controller, Request, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller()
export class AppController {
  @UseGuards(AuthGuard('local'))
  @Post('auth/login')
  async login(@Request() req) {
    return req.user;
  }
}

@Controller()
export class AppController {
  @UseGuards(AuthGuard('local'))
  @Post('auth/login')
  @Bind(Request())
  async login(req) {
    return req.user;
  }
}

```

```

现在，历史记录将在运行之间保留。