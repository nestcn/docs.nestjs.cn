# 认证

认证是大多数应用中**不可或缺**的部分。处理认证有许多不同的方法和策略。项目采用的具体方法取决于其特定的应用需求。本章将介绍几种可适应各种不同需求的认证方法。

让我们详细说明需求。在这个用例中，客户端将首先通过用户名和密码进行认证。一旦认证通过，服务器将颁发一个 JWT，该令牌可作为后续请求中授权标头里的[持有者令牌](https://tools.ietf.org/html/rfc6750)来证明身份。我们还将创建一个仅对包含有效 JWT 的请求开放的保护路由。

我们将从第一个需求开始：用户认证。然后通过颁发 JWT 来扩展该功能。最后，我们将创建一个检查请求中是否包含有效 JWT 的保护路由。

#### 创建认证模块

我们将首先生成一个 `AuthModule`，并在其中创建 `AuthService` 和 `AuthController`。我们将使用 `AuthService` 来实现认证逻辑，并通过 `AuthController` 暴露认证端点。

```bash
$ nest g module auth
$ nest g controller auth
$ nest g service auth
```

在实现 `AuthService` 时，我们会发现将用户操作封装到 `UsersService` 中很有帮助，所以现在让我们生成该模块和服务：

```bash
$ nest g module users
$ nest g service users
```

替换这些生成文件的默认内容如下所示。对于我们的示例应用，`UsersService` 仅维护一个硬编码的内存用户列表，以及一个通过用户名检索用户的方法。在实际应用中，这里将构建用户模型和持久层，使用您选择的库（如 TypeORM、Sequelize、Mongoose 等）。

```typescript title="users/users.service"
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
```

在 `UsersModule` 中，唯一需要做的改动是将 `UsersService` 添加到 `@Module` 装饰器的 exports 数组中，以便该服务在此模块外可见（稍后我们将把它用于 `AuthService` 中）。

```typescript title="users/users.module"
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';

@Module({
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

#### 实现"登录"端点

我们的 `AuthService` 负责检索用户并验证密码。为此我们创建了一个 `signIn()` 方法。在下面的代码中，我们使用了便捷的 ES6 扩展运算符，在返回用户对象前移除了 password 属性。这是返回用户对象时的常见做法，因为你不希望暴露密码或其他安全密钥等敏感字段。

```typescript title="auth/auth.service"
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
```

> warning **警告** 在实际应用中，当然不应以明文存储密码。正确的做法是使用类似 [bcrypt](https://github.com/kelektiv/node.bcrypt.js#readme) 的库，配合加盐的单向哈希算法。采用这种方式时，你只需存储哈希后的密码，然后将存储的密码与**用户输入**密码的哈希值进行比对，从而避免以明文形式存储或暴露用户密码。为了让示例应用保持简单，我们违反了这个绝对原则而使用了明文存储。 **切勿在实际应用中这样做！**

现在，我们更新 `AuthModule` 以导入 `UsersModule`。

```typescript title="auth/auth.module"
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
```

完成这些设置后，让我们打开 `AuthController` 并添加一个 `signIn()` 方法。客户端将通过调用此方法来验证用户身份。该方法会接收请求体中的用户名和密码，并在用户验证通过时返回一个 JWT 令牌。

```typescript title="auth/auth.controller"
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

> info **理想情况下** ，我们不应使用 `Record<string, any>` 类型，而应使用 DTO 类来定义请求体的结构。更多信息请参阅[验证](/techniques/validation)章节。

#### JWT 令牌

我们即将进入认证系统的 JWT 部分。让我们回顾并完善需求：

- 允许用户通过用户名/密码进行认证，并返回 JWT 用于后续受保护 API 端点的调用。我们已经基本满足这一需求。要完成它，我们需要编写签发 JWT 的代码。
- 创建基于有效 JWT bearer 令牌保护的 API 路由

我们需要安装一个额外的包来支持 JWT 需求：

```bash
$ npm install --save @nestjs/jwt
```

> info **提示** `@nestjs/jwt` 包（详见[此处](https://github.com/nestjs/jwt) ）是一个用于处理 JWT 操作的实用工具包，包括生成和验证 JWT 令牌。

为了保持服务的模块化整洁，我们将在 `authService` 中处理 JWT 生成。打开 `auth` 文件夹中的 `auth.service.ts` 文件，注入 `JwtService`，并更新 `signIn` 方法以生成 JWT 令牌，如下所示：

```typescript title="auth/auth.service"
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
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
```

我们使用 `@nestjs/jwt` 库，它提供了 `signAsync()` 函数来从 `user` 对象属性的子集生成 JWT，然后我们将其作为带有单个 `access_token` 属性的简单对象返回。注意：我们选择 `sub` 属性名来存储 `userId` 值以符合 JWT 标准。

现在我们需要更新 `AuthModule` 以导入新的依赖项并配置 `JwtModule`。

首先，在 `auth` 文件夹中创建 `constants.ts`，并添加以下代码：

```typescript title="auth/constants"
export const jwtConstants = {
  secret: 'DO NOT USE THIS VALUE. INSTEAD, CREATE A COMPLEX SECRET AND KEEP IT SAFE OUTSIDE OF THE SOURCE CODE.',
};
```

我们将使用它在 JWT 签名和验证步骤之间共享密钥。

> warning **警告\*\***切勿公开此密钥** 。我们在此展示仅为了说明代码功能，但在生产环境中**必须通过适当措施保护此密钥\*\* ，例如使用密钥保险库、环境变量或配置服务。

现在，打开 `auth` 文件夹中的 `auth.module.ts` 文件，并按如下内容更新：

```typescript title="auth/auth.module"
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
```

> info **提示** 我们将 `JwtModule` 注册为全局模块以简化操作。这意味着我们无需在应用程序的其他位置导入 `JwtModule`。

我们使用 `register()` 方法配置 `JwtModule`，并传入配置对象。有关 Nest 框架 `JwtModule` 的更多信息请参阅[此处](https://github.com/nestjs/jwt/blob/master/README.md) ，可用配置选项的详细信息请参见[此处](https://github.com/auth0/node-jsonwebtoken#用法) 。

我们继续使用 cURL 来测试路由。你可以用 `UsersService` 中硬编码的任意 `user` 对象进行测试。

```bash
$ # POST to /auth/login
$ curl -X POST http://localhost:3000/auth/login -d '{"username": "john", "password": "changeme"}' -H "Content-Type: application/json"
{"access_token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}
$ # Note: above JWT truncated
```

#### 实现认证守卫

现在我们可以解决最后一个需求：通过要求请求中包含有效的 JWT 来保护端点。我们将通过创建一个 `AuthGuard` 来实现，用它来保护我们的路由。

```typescript title="auth/auth.guard"
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.jwtService.verifyAsync(
        token,
        {
          secret: jwtConstants.secret
        }
      );
      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
```

现在我们可以实现受保护的路由并注册 `AuthGuard` 来保护它。

打开 `auth.controller.ts` 文件并按如下所示进行更新：

```typescript title="auth.controller"
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards
} from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() signInDto: Record<string, any>) {
    return this.authService.signIn(signInDto.username, signInDto.password);
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
```

我们将刚刚创建的 `AuthGuard` 应用到 `GET /profile` 路由上，使其受到保护。

确保应用正在运行，并使用 `cURL` 测试路由。

```bash
$ # GET /profile
$ curl http://localhost:3000/auth/profile
{"statusCode":401,"message":"Unauthorized"}

$ # POST /auth/login
$ curl -X POST http://localhost:3000/auth/login -d '{"username": "john", "password": "changeme"}' -H "Content-Type: application/json"
{"access_token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2Vybm..."}

$ # GET /profile using access_token returned from previous step as bearer code
$ curl http://localhost:3000/auth/profile -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2Vybm..."
{"sub":1,"username":"john","iat":...,"exp":...}
```

请注意，在 `AuthModule` 中，我们将 JWT 的过期时间配置为 `60 秒` 。这个过期时间太短，而处理令牌过期和刷新的细节超出了本文的范围。但我们选择这样做是为了展示 JWT 的一个重要特性。如果在认证后等待 60 秒再尝试 `GET /auth/profile` 请求，您将收到 `401 Unauthorized` 响应。这是因为 `@nestjs/jwt` 会自动检查 JWT 的过期时间，省去了您在应用中手动检查的麻烦。

我们现已完成 JWT 认证的实现。JavaScript 客户端（如 Angular/React/Vue）及其他 JavaScript 应用现在可以通过认证与我们的 API 服务器进行安全通信。

#### 全局启用认证

若您希望默认保护绝大多数端点，可将认证守卫注册为[全局守卫](/overview/guards#绑定守卫) ，这样就不必在每个控制器顶部使用 `@UseGuards()` 装饰器，只需标记哪些路由应公开即可。

首先，使用以下结构（在任何模块中，例如 `AuthModule`）将 `AuthGuard` 注册为全局守卫：

```typescript
providers: [
  {
    provide: APP_GUARD,
    useClass: AuthGuard,
  },
],
```

配置完成后，Nest 将自动为所有端点绑定 `AuthGuard`。

现在我们需要提供一种机制来声明公开路由。为此，我们可以使用 `SetMetadata` 装饰器工厂函数创建一个自定义装饰器。

```typescript
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

在上述文件中，我们导出了两个常量：一个是名为 `IS_PUBLIC_KEY` 的元数据键，另一个是我们即将使用的新装饰器 `Public`（你也可以将其命名为 `SkipAuth` 或 `AllowAnon`，根据项目需求选择）。

现在我们有了自定义的 `@Public()` 装饰器，可以按如下方式装饰任何方法：

```typescript
@Public()
@Get()
findAll() {
  return [];
}
```

最后，我们需要当找到 `AuthGuard` 的 `"isPublic"` 元数据时让它返回 `true`。为此，我们将使用 `Reflector` 类（更多信息请参阅[此处](/overview/guards#把所有内容放在一起) ）。

```typescript
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService, private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      // 💡 See this condition
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.secret,
      });
      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
```

#### Passport 集成

[Passport](https://github.com/jaredhanson/passport) 是最受欢迎的 node.js 身份验证库，被社区广泛认可并成功应用于许多生产环境。使用 `@nestjs/passport` 模块可以轻松将该库与 **Nest** 应用程序集成。

要了解如何将 Passport 与 NestJS 集成，请查看本[章节](/recipes/passport) 。

#### 示例

你可以在本章[此处](https://github.com/nestjs/nest/tree/master/sample/19-auth-jwt)找到完整的代码版本。
