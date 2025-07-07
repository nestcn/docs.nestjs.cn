### 认证

认证是大多数应用程序的**重要**组成部分。有许多不同的方法和策略来处理认证。任何项目采用的方法都取决于其特定的应用程序要求。本章介绍了几种可以适应各种不同要求的认证方法。

让我们明确一下需求。对于这个用例，客户端将首先使用用户名和密码进行认证。一旦认证成功，服务器将发出一个 JWT，该 JWT 可以在后续请求中作为[承载令牌](https://tools.ietf.org/html/rfc6750)在授权头中发送，以证明认证。我们还将创建一个受保护的路由，该路由只能被包含有效 JWT 的请求访问。

我们将从第一个要求开始：认证用户。然后我们将通过发出 JWT 来扩展它。最后，我们将创建一个受保护的路由，检查请求中的有效 JWT。

#### 创建认证模块

我们将首先生成一个 `AuthModule`，并在其中生成 `AuthService` 和 `AuthController`。我们将使用 `AuthService` 来实现认证逻辑，使用 `AuthController` 来暴露认证端点。

```bash
$ nest g module auth
$ nest g controller auth
$ nest g service auth
```

在实现 `AuthService` 时，我们会发现将用户操作封装在 `UsersService` 中很有用，所以现在让我们生成该模块和服务：

```bash
$ nest g module users
$ nest g service users
```

将这些生成文件的默认内容替换为如下所示。对于我们的示例应用程序，`UsersService` 只是维护一个硬编码的内存中用户列表，以及一个根据用户名检索用户的 find 方法。在真实的应用程序中，这是您构建用户模型和持久化层的地方，使用您选择的库（例如 TypeORM、Sequelize、Mongoose 等）。

```typescript title="users/users.service"
import { Injectable } from '@nestjs/common';

// 这应该是一个表示用户实体的真实类/接口
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

现在，更新 `UsersModule` 以导出 `UsersService`，以便在模块外部可用（我们很快就会在 `AuthService` 中使用它）：

```typescript title="users/users.module"
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';

@Module({
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

我们的 `AuthService` 的工作是检索用户并验证密码。我们为此创建一个 `signIn()` 方法。在下面的代码中，我们使用方便的 ES6 展开运算符从 user 对象中剥离密码属性，然后返回它。这是一种常见做法，当从用户对象返回时，您希望避免包含敏感字段，如密码。

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
    // TODO: 在这里生成 JWT 并返回它
    //       而不是用户对象
    return result;
  }
}
```

> **警告** 当然，在真实的应用程序中，您不会以明文形式存储密码。您会使用加了盐的单向哈希算法，如 bcrypt。通过这种方法，您只会存储哈希密码，然后将存储的哈希与传入密码的哈希版本进行比较，因此您永远不会以明文形式存储或暴露用户密码。为了保持我们的示例应用程序的简单性，我们违反了这个绝对要求并使用明文。**不要在真实应用程序中这样做！**

现在，我们需要更新 `AuthModule` 以导入 `UsersModule`：

```typescript title="auth/auth.module"
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  providers: [AuthService],
})
export class AuthModule {}
```

#### JWT 令牌

我们准备转向我们认证系统的 JWT 部分。让我们回顾并完善我们的要求：

- 用户使用用户名/密码进行认证，并返回 JWT 以便在后续调用受保护 API 端点时使用
- 创建基于有效 JWT 存在的 API 路由保护

我们需要安装额外的包来支持我们的 JWT 要求：

```bash
$ npm install --save @nestjs/jwt
```

> **提示** `@nestjs/jwt` 包（见[这里](https://github.com/nestjs/jwt)）是一个实用程序包，有助于 JWT 操作。

为了保持我们的服务清洁和模块化，我们将在 `authService` 中处理 JWT 生成。打开 `auth/auth.service.ts` 文件，注入 `JwtService`，并更新 `signIn` 方法以生成 JWT 令牌，如下所示：

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

  async signIn(username: string, pass: string): Promise<any> {
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

我们使用 `@nestjs/jwt` 库，它提供了一个 `signAsync()` 函数来从用户对象属性的子集生成我们的 JWT，然后将其作为具有单个 `access_token` 属性的简单对象返回。注意：我们选择 `sub` 的属性名来保持我们的 `userId` 值与 JWT 标准一致。不要忘记将 `JwtService` 提供者注入到 `AuthService` 中。

我们现在需要更新 `AuthModule` 以导入新的依赖项并配置 `JwtModule`。

首先，在 `auth` 文件夹中创建 `constants.ts`，并添加以下代码：

```typescript title="auth/constants"
export const jwtConstants = {
  secret: 'DO NOT USE THIS VALUE. INSTEAD, CREATE A COMPLEX SECRET AND KEEP IT SAFE OUTSIDE OF THE SOURCE CODE.',
};
```

我们将使用它在 JWT 签名和验证步骤之间共享我们的密钥。

> **警告** **不要在生产代码中公开暴露此密钥**。我们在这里这样做是为了清楚地说明代码在做什么，但在生产系统中，您必须使用适当的措施来保护此密钥，如机密库、环境变量或配置服务。

现在，打开 `auth` 文件夹中的 `auth.module.ts` 并更新它，如下所示：

```typescript title="auth/auth.module"
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
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
  exports: [AuthService],
})
export class AuthModule {}
```

> **提示** 我们使用 `global: true` 注册 `JwtModule` 以便简化。这意味着我们不需要在任何其他地方导入 `JwtModule`。

我们使用 `register()` 配置 `JwtModule`，传入一个配置对象。查看[这里](https://github.com/nestjs/jwt/blob/master/README.md)了解更多关于 Nest `JwtModule` 的信息，[这里](https://github.com/auth0/node-jsonwebtoken#usage)了解更多关于可用配置选项的信息。

#### 实现认证端点

现在我们可以实现一个简单的 `/auth/login` 路由，该路由会 POST 用户的凭据以获取 JWT。打开 `auth/auth.controller.ts` 文件并添加以下代码：

```typescript title="auth/auth.controller"
import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
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

> **提示** 理想情况下，不要使用 `Record<string, any>` 类型。相反，应该创建一个 DTO 类来定义 body 的形状。查看[验证](../techniques/validation)章节了解更多信息。

不要忘记将 `AuthController` 添加到 `AuthModule`：

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

让我们使用 cURL 测试我们的路由。使用 `nest start` 启动应用程序，然后测试路由。

```bash
$ # POST to /auth/login
$ curl -X POST http://localhost:3000/auth/login -d '{"username": "john", "password": "changeme"}' -H "Content-Type: application/json"
$ # result -> {"access_token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}
$ # Note: above JWT truncated
```

#### 实现认证守卫

我们现在可以处理最后的要求：通过要求请求中存在有效的 JWT 来保护端点。我们将通过创建一个 `AuthGuard` 来实现，该守卫可用于保护我们的路由。

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
      // 💡 我们在这里将 payload 分配给 request 对象
      // 以便我们可以在路由处理程序中访问它
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

我们现在可以实现一个受保护的路由和一个用于测试我们守卫的注册装饰器。打开 `auth/auth.controller.ts` 文件并更新它，如下所示：

```typescript title="auth/auth.controller"
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

将 `AuthGuard` 应用到 `/auth/profile` GET 路由，以便它受到保护。

确保应用程序正在运行，并使用 cURL 测试路由。

```bash
$ # GET /auth/profile
$ curl http://localhost:3000/auth/profile
$ # result -> {"statusCode":401,"message":"Unauthorized"}

$ # POST /auth/login
$ curl -X POST http://localhost:3000/auth/login -d '{"username": "john", "password": "changeme"}' -H "Content-Type: application/json"
$ # result -> {"access_token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInVzZXJuYW1lIjoiam9obiIsImlhdCI6MTY0MzcyNTUxMywiZXhwIjoxNjQzNzI1NTczfQ.cLLIDjvl_l8OaIsTlqOUVbekX0jZdNEMoDi4tWlisME"}

$ # GET /auth/profile using access_token returned from previous step as bearer code
$ curl http://localhost:3000/auth/profile -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInVzZXJuYW1lIjoiam9obiIsImlhdCI6MTY0MzcyNTUxMywiZXhwIjoxNjQzNzI1NTczfQ.cLLIDjvl_l8OaIsTlqOUVbekX0jZdNEMoDi4tWlisME"
$ # result -> {"sub":1,"username":"john","iat":1643725513,"exp":1643725573}
```

请注意，在 `AuthModule` 中，我们将 JWT 配置为 60 秒的过期时间。这太短了，处理令牌过期和刷新的细节超出了本文的范围。但是，我们选择它来展示 JWT 的一个重要品质和 `@nestjs/jwt` 包的行为。如果您在认证后等待 60 秒然后尝试 GET `/auth/profile` 请求，您将收到 `401 Unauthorized` 响应。这是因为 `@nestjs/jwt` 自动检查 JWT 的过期时间，为您省去在应用程序中这样做的麻烦。

我们现在已经完成了我们的 JWT 认证实现。JavaScript 客户端（如 Angular/React/Vue）和其他 JavaScript 应用程序现在可以与我们的 API 服务器进行认证和安全通信。您可以在[这里](https://github.com/nestjs/nest/tree/master/sample/19-auth-jwt)找到本章完整代码。

#### 启用全局认证

如果绝大多数端点都应该受到保护，您可以将认证守卫注册为[全局守卫](../guards#binding-guards)，而不是在每个控制器顶部使用 `@UseGuards()` 装饰器，您可以简单地标记哪些路由应该是公共的。

首先，使用以下结构在任何模块中注册 `AuthGuard` 为全局守卫（例如，在 `AuthModule` 中）：

```typescript
providers: [
  {
    provide: APP_GUARD,
    useClass: AuthGuard,
  },
],
```

有了这个，Nest 将自动将 `AuthGuard` 绑定到所有端点。

现在我们必须提供一种机制来声明路由为公共的。为此，我们可以使用 `SetMetadata` 装饰器工厂函数创建自定义装饰器。

```typescript title="auth/decorators/public.decorator"
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

在上面的文件中，我们导出了两个常量。第一个是我们的元数据键，名为 `IS_PUBLIC_KEY`，第二个是我们的新装饰器本身，我们将称之为 `Public`（您也可以将其命名为 `SkipAuth` 或 `AllowAnon`，任何适合您项目的名称）。

现在我们有了自定义的 `@Public()` 装饰器，我们可以使用它来装饰任何方法，如下所示：

```typescript
@Public()
@Get()
findAll() {
  return [];
}
```

最后，我们需要修改 `AuthGuard` 以在找到 `"isPublic"` 元数据时返回 `true`。为此，我们将使用 `Reflector` 类（在[这里](../fundamentals/execution-context#reflection-and-metadata)阅读更多）。

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
      // 💡 查看此条件
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
      // 💡 我们在这里将 payload 分配给 request 对象
      // 以便我们可以在路由处理程序中访问它
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

[Passport](https://github.com/jaredhanson/passport) 是最流行的 node.js 认证库，被社区广泛了解并成功用于许多生产应用程序。使用 `@nestjs/passport` 模块将此库与 **Nest** 应用程序集成很简单。

要了解如何将 Passport 与 NestJS 集成，请查看[这里](../recipes/passport)。

#### 示例

您可以在[这里](https://github.com/nestjs/nest/tree/master/sample/19-auth-jwt)找到本章的完整示例。
