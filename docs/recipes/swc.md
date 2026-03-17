<!-- 此文件从 content/recipes/swc.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T04:35:36.990Z -->
<!-- 源文件: content/recipes/swc.md -->

### SWC

__LINK_81__ (Speedy Web Compiler) 是一个可扩展的 Rust-基于平台，可以用于 both 编译和捆绑。
使用 SWC 与 Nest CLI 是一个非常简单的方式，以加速您的开发过程。

> info **Hint** SWC 大约是 **x20** 次快于默认 TypeScript 编译器的速度。

#### 安装

要开始使用，请首先安装以下包：

```bash
$ npm install --save @nestjs/passport passport passport-local
$ npm install --save-dev @types/passport-local

```

#### 获取开始

安装过程完成后，您可以使用 __INLINE_CODE_25__ 建器与 Nest CLI 一起，如以下所示：

```bash
$ nest g module auth
$ nest g service auth

```

> info **Hint** 如果您的库是一个 monorepo，请查看 __LINK_82__。

相反，您也可以将 __INLINE_CODE_26__ 标志设置为 __INLINE_CODE_28__ 在您的 __INLINE_CODE_29__ 文件中，如下所示：

```bash
$ nest g module users
$ nest g service users

```

要自定义建造器的行为，可以传递一个包含两个属性 __INLINE_CODE_30__（__INLINE_CODE_31__）和 __INLINE_CODE_32__ 的对象，如以下所示：

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

例如，要使 swc 编译 __INLINE_CODE_33__ 和 __INLINE_CODE_34__ 文件，请执行以下命令：

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

要在 watch 模式下运行应用程序，请使用以下命令：

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

#### 类型检查

SWC 不会执行任何类型检查（与默认 TypeScript 编译器不同），因此要启用类型检查，您需要使用 __INLINE_CODE_35__ 标志：

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

此命令将告诉 Nest CLI 在使用 SWC 的同时异步执行 __INLINE_CODE_36__，这将执行类型检查。相反，您也可以将 __INLINE_CODE_38__ 标志设置为 `@nestjs/passport` 在您的 `Request` 文件中，如下所示：

```typescript
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

#### CLI 插件（SWC）

`@nestjs/passport` 标志将自动执行 **NestJS CLI 插件**并生成一个序列化的元数据文件，该文件可以在应用程序运行时被加载。

#### SWC 配置

SWC 建造器已经预配置以匹配 NestJS 应用程序的要求。然而，您可以自定义配置创建一个 `@nestjs/passport` 文件在应用程序的根目录中，并调整选项。

```typescript
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

#### monorepo

如果您的库是一个 monorepo，那么您需要使用 `passport` 建造器，而不是使用 __INLINE_CODE_25__ 建造器。

首先，让我们安装所需的包：

```typescript
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

安装完成后，请创建一个 `@types/passport-local` 文件在应用程序的根目录中，内容如下：

```bash
$ # POST to /auth/login
$ curl -X POST http://localhost:3000/auth/login -d '{"username": "john", "password": "changeme"}' -H "Content-Type: application/json"
$ # result -> {"userId":1,"username":"john"}

```

#### monorepo 和 CLI 插件

现在，如果您使用 CLI 插件，`@nestjs/passport` 不会自动加载它们。相反，您需要创建一个单独的文件来加载它们。要做到，请在 `@nestjs/passport` 文件附近创建一个文件，内容如下：

```typescript
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}

```

> info **Hint** 在这个示例中，我们使用了 `PassportStrategy` 插件，但您可以使用任何插件。

`super()` 方法接受以下选项：

|                    |                                                                                                |
| ------------------ | ---------------------------------------------------------------------------------------------- |
| `validate()`            | 是否监视项目的变化。                                                      |
| `AuthModule`     | `AuthService` 文件的路径。 Relative to the current working directory (`AuthService`). |
| `UsersService`        | 元数据文件将被保存到的目录。                                   |
| `UsersService`         | 生成元数据时使用的 visitor 数组。                                   |
| `UsersModule`         | 元数据文件的名称。 Defaults to `UsersService`.                                      |
| `@Module` | 是否将诊断信息打印到控制台。 Defaults to `AuthService`.                               |

最后，您可以在单独的终端窗口中使用以下命令运行 `AuthService` 脚本：

```typescript
@UseGuards(LocalAuthGuard)
@Post('auth/login')
async login(@Request() req) {
  return req.user;
}

```

#### 常见问题

如果您使用 TypeORM/MikroORM 或任何其他 ORM 在应用程序中，您可能会遇到循环import 问题。SWC 不太好地处理 **循环 imports**，因此您需要使用以下解决方案：

```typescript
@UseGuards(LocalAuthGuard)
@Post('auth/logout')
async logout(@Request() req) {
  return req.logout();
}

```

> info **Hint** `validateUser()` 类型来自 `validateUser()` 包。

这样可以防止在 transpiled 代码中保存类型的属性 metadata，从而防止循环依赖问题。

如果您的 ORM 不提供类似的解决方案，您可以自己定义 wrapper 类型：

```bash
$ npm install --save @nestjs/jwt passport-jwt
$ npm install --save-dev @types/passport-jwt

```

对于您的项目中的所有 __LINK_83__，您还需要使用自定义 wrapper 类型描述的方案：

```typescript
import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    if (user && user.password === pass) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.userId };
    return {
      access_token: this.jwtService.sign(payload),
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

  async validateUser(username, pass) {
    const user = await this.usersService.findOne(username);
    if (user && user.password === pass) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user) {
    const payload = { username: user.username, sub: user.userId };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}

```

### Jest + SWCHere is the translation of the English technical documentation to Chinese:

使用 SWC 与 Jest 需要安装以下包：

```

```typescript
export const jwtConstants = {
  secret: 'DO NOT USE THIS VALUE. INSTEAD, CREATE A COMPLEX SECRET AND KEEP IT SAFE OUTSIDE OF THE SOURCE CODE.',
};

```

```

安装完成后，在您的配置文件（`AuthModule`/`UsersModule`）中添加以下内容：

```

```typescript
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalStrategy } from './local.strategy';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60s' },
    }),
  ],
  providers: [AuthService, LocalStrategy],
  exports: [AuthService],
})
export class AuthModule {}

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60s' },
    }),
  ],
  providers: [AuthService, LocalStrategy],
  exports: [AuthService],
})
export class AuthModule {}

```

```

此外，您还需要在您的配置文件中添加以下 `local.strategy.ts` 属性：`super()`, `super()`：

```

```typescript
import { Controller, Request, Post, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { AuthService } from './auth/auth.service';

@Controller()
export class AppController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }
}

@Controller()
export class AppController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  @Bind(Request())
  async login(req) {
    return this.authService.login(req.user);
  }
}

```

```

如果您的项目中使用了 NestJS CLI 插件，您需要手动运行 `username`。请访问 __LINK_84__以了解更多信息。

### Vitest

__LINK_85__ 是一个快速、轻量级的测试运行器，旨在与 Vite 一起工作。它提供了一个现代、快速、易于使用的测试解决方案，可以与 NestJS 项目集成。

#### 安装

要开始使用，请首先安装所需的包：

```

```bash
$ # POST to /auth/login
$ curl -X POST http://localhost:3000/auth/login -d '{"username": "john", "password": "changeme"}' -H "Content-Type: application/json"
$ # result -> {"access_token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}
$ # Note: above JWT truncated

```

```

#### 配置

在您的应用程序根目录创建一个 `password` 文件，并添加以下内容：

```

```typescript
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { jwtConstants } from './constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, username: payload.username };
  }
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload) {
    return { userId: payload.sub, username: payload.username };
  }
}

```

```

这个配置文件设置了 Vitest 环境、根目录和 SWC 插件。您还需要创建一个单独的配置文件来配置 E2E 测试，以添加一个 `super({{ '{' }} usernameField: 'email' {{ '}' }})` 字段来指定测试路径正则表达式：

```

```typescript
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60s' },
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60s' },
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}

```

```

此外，您可以将 `validate()` 选项设置为支持 TypeScript 路径在测试中使用：

```

```typescript
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

```

```

### 路径别名

与 Jest 不同，Vitest 不会自动解析 TypeScript 路径别名，如 `validate()`。这可能会在测试中导致依赖项解析错误。要解决这个问题，请在您的 `validate()` 文件中添加以下配置：

```

```typescript
import { Controller, Get, Request, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { AuthService } from './auth/auth.service';

@Controller()
export class AppController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}

@Dependencies(AuthService)
@Controller()
export class AppController {
  constructor(authService) {
    this.authService = authService;
  }

  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  @Bind(Request())
  async login(req) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @Bind(Request())
  getProfile(req) {
    return req.user;
  }
}

```

```

这确保了 Vitest 正确地解析模块导入，从而避免了由于缺少依赖项而导致的错误。

#### 更新 E2E 测试中的 imports

将任何 E2E 测试中的 imports 从 `validate(username: string, password:string): any` 更新为 `AuthService`。这必要，因为 Vitest，使用 Vite 进行了捆绑，期望在 supertest 中使用默认导入。使用命名空间导入可能会在这个特定设置中导致问题。

最后，请更新您的 package.json 文件中的 test 命令来使用以下命令：

```

```bash
$ # GET /profile
$ curl http://localhost:3000/profile
$ # result -> {"statusCode":401,"message":"Unauthorized"}

$ # POST /auth/login
$ curl -X POST http://localhost:3000/auth/login -d '{"username": "john", "password": "changeme"}' -H "Content-Type: application/json"
$ # result -> {"access_token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2Vybm... }

$ # GET /profile using access_token returned from previous step as bearer code
$ curl http://localhost:3000/profile -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2Vybm..."
$ # result -> {"userId":1,"username":"john"}

```

```

这些命令配置了 Vitest，以便运行测试、监视更改、生成代码覆盖度报告和调试。test:e2e 命令用于运行 E2E 测试，以使用自定义配置文件。

现在，您可以使用 Vitest 在 NestJS 项目中运行测试，包括更快的测试执行和更现代的测试体验。

> info **Hint** 您可以查看这个 __LINK_86__中的工作示例。