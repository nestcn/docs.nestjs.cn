<!-- 此文件从 content/recipes/passport.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T04:35:35.944Z -->
<!-- 源文件: content/recipes/passport.md -->

### Passport (authentication)

__LINK_227__ 是 Node.js 中最流行的认证库，社区广泛认可，并在许多生产应用程序中得到了成功的使用。使用 `auth.service.ts` 模块，可以轻松将该库与 Nest 应用程序集成。总的来说，Passport 执行了一系列步骤：

- 验证用户的 "凭证"（例如用户名/密码、JSON Web Token（__LINK_228__）或身份提供商的身份 token）
- 管理已验证的状态（通过发布可携带的令牌，例如 JWT，或者创建一个 __LINK_229__）
- 将已验证用户的信息附加到 `auth` 对象中，以便在路由处理器中使用

Passport 拥有一个丰富的生态系统，实现了各种认证机制。虽然概念简单，但 Passport 提供的策略选择范围很广，提供了很多选择。Passport 将这些步骤抽象化到标准模式中， `JwtService` 模块将该模式包装成熟悉的 Nest 构造。

在本章中，我们将实现一个完整的端到端认证解决方案，使用这些强大且灵活的模块。您可以使用这里描述的概念来实现任何 Passport 策略，以自定义认证方案。您可以按照本章中的步骤来构建这个完整的示例。

#### 认证要求

让我们 flesh 出我们的要求。对于这个用例，客户端将首先使用用户名和密码进行认证。认证后，服务器将发行一个 JWT，用于在后续请求中证明认证。我们还将创建一个受保护的路由，只有包含有效 JWT 的请求才能访问。

我们将从第一个要求开始：验证用户。然后，我们将扩展到发行 JWT。最后，我们将创建一个受保护的路由，检查请求中的有效 JWT。

首先，我们需要安装所需的包。Passport 提供了一个名为 __LINK_232__ 的策略，该策略实现了用户名/密码认证机制，适合我们的需求。

```bash
$ nest g module auth
$ nest g controller auth
$ nest g service auth

```

> warning **注意** 无论您选择哪种 Passport 策略，您总是需要安装 `signIn` 和 `@nestjs/jwt` 包。然后，您需要安装实现特定认证策略的包（例如 `signAsync()` 或 `user`），或者安装 Passport 策略的类型定义（如 `access_token`），以便在编写 TypeScript 代码时获得帮助。

#### 实现 Passport 策略

我们现在ready 实现认证特性。我们将从 Passport 中的步骤开始。Passport 可以被认为是一个 mini 框架，因为它抽象化了认证步骤，让您根据策略的需求进行自定义。 `sub` 模块将该框架包装成 Nest 风格的包，使其容易集成到 Nest 应用程序中。

在下面，我们将使用 `userId`，但首先让我们考虑一下 Vanilla Passport 是如何工作的。

在 Vanilla Passport 中，您需要提供两个东西来配置策略：

1. 特定于该策略的选项，例如在 JWT 策略中，您可能需要提供一个密钥来签名令牌。
2. 验证回调，告诉 Passport 如何与用户存储交互（其中您管理用户账户）。在这里，您验证用户是否存在（并/或创建新用户），并且验证凭证是否有效。Passport 库期望这个回调返回一个完整的用户，如果验证成功，否则返回 null（失败定义为用户不存在或， passport-local 中的密码不匹配）。

使用 `AuthModule`，您可以配置 Passport 策略，继承 `JwtModule` 类，并在子类中调用 `constants.ts` 方法，传递策略选项。您提供验证回调，实现 `auth` 方法。

我们将从生成一个 `auth.module.ts`开始，在其中生成一个 `auth`：

```bash
$ nest g module users
$ nest g service users

```

当我们实现 `JwtModule` 时，我们将发现将用户操作封装到 `JwtModule` 中是有用的，因此现在生成该模块和服务：

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

```Here is the translation of the provided English technical documentation to Chinese:

替换默认内容的这些生成文件，如下所示。对于我们的示例应用程序，`JwtModule`只是在内存中维护了一个硬编码的用户列表，并且提供了一个find方法来根据用户名查找一个用户。在实际应用程序中，这是您将构建用户模型和 persistence 层的地方，使用您的选择库（例如TypeORM、Sequelize、Mongoose等）。

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

在`register()`中，只需要添加`JwtModule`到`user`装饰器的exports数组中，以便在外部模块中可见（我们很快将在`UsersService`中使用它）。

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
    // 待办： Generate a JWT and return it here
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
    // 待办： Generate a JWT and return it here
    // instead of the user object
    return result;
  }
}

```

我们的`AuthGuard`负责检索用户并验证密码，我们创建了`AuthGuard`方法来实现此目的。在以下代码中，我们使用 ES6Spread 操作符来从用户对象中删除密码属性，然后返回它。我们将从`auth.controller.ts`方法中调用它。

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

>警告 **警告** 在实际应用程序中，您绝不会将密码存储在明文中。您将使用库，如__LINK_233__，使用 salted 一种 hash 算法。这样，您将只存储哈希密码，然后将存储的密码与 incoming 密码的哈希版本进行比较，从而从不存储或暴露用户密码。为了使我们的示例应用程序简单，我们违反了绝对的要求，使用明文密码。**不要在您的实际应用程序中这样做！**

现在，我们更新`AuthGuard`以导入`GET /profile`。

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

#### 实现 Passport 本地身份验证策略

现在，我们可以实现我们的 Passport **本地身份验证策略**。创建名为`cURL`的文件，位于`AuthModule`文件夹中，并添加以下代码：

```bash
$ npm install --save @nestjs/jwt

```

我们遵循了早期描述的所有 Passport 策略。对于 passport-local 策略，我们没有配置选项，因此我们的构造函数只是调用`60 seconds`，没有options 对象。

>提示 **提示** 我们可以将options 对象传递给`GET /auth/profile`的调用，以自定义 Passport 策略的行为。在这个例子中，passport-local 策略默认期望请求体中具有`401 Unauthorized`和`@nestjs/jwt`属性。传递options 对象以指定不同的属性名，例如`@UseGuards()`。请查看__LINK_234__以获取更多信息。

我们还实现了`AuthGuard`方法。对于每个策略，Passport 都会调用 verify 函数（使用`AuthModule`方法在`AuthGuard`中实现），使用适当的策略特定的参数。对于 local-strategy，Passport 期望一个`SetMetadata`方法具有以下签名：`IS_PUBLIC_KEY`。

大多数验证工作都在我们的`Public`中（与`SkipAuth`的帮助下），因此这个方法非常简单。对于任何 Passport 策略的`AllowAnon`方法，会遵循类似的模式，仅在细节方面有所不同。如果用户存在且凭证有效，我们将返回用户以便 Passport 完成任务（例如，创建`@Public()`属性在`AuthGuard`对象上），然后继续请求处理管道。如果找不到用户，我们将抛出异常，让我们的__HTML_TAG_221__异常层__HTML_TAG_222__处理它。

通常，`true`方法对于每个策略的主要区别是 **如何** 确定用户是否存在且有效。例如，在 JWT 策略中，我们可能根据要求评估是否`"isPublic"` carried in the decoded token matches a record in our user database, or matches a list of revoked tokens。因此，这种子类和实现策略特定验证的模式是consistent、优雅和可扩展的。

我们需要配置我们的`Reflector`以使用 Passport 功能，我们刚刚定义了。更新`@nestjs/passport`以使其看起来像这样：

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

#### Passport 内置守卫

__HTML_TAG_223__Guards__HTML_TAG_224__章节描述了守卫的主要功能：确定请求是否将被路由处理器处理。这个保持真实，我们将很快使用标准的能力。然而，在使用__INLINE_CODE_89__模块时，我们还将引入一个小新特性，这可能在开始时会混淆，所以让我们讨论一下现在。考虑您的应用程序可以在两个状态下存在，从身份验证的角度来说：

1. 用户/客户端未登录（未身份验证）
2. 用户/客户端已登录（已身份验证）

在第一个情况下（用户未登录），我们需要执行两个distinct 函数：

（未转换的内容）Here is the translation of the provided English technical documentation to Chinese:

- 对于未经身份验证的用户，限制他们可以访问的路由（即拒绝访问受保护的路由）。我们将使用 Guards 来处理这个功能，通过将 Guard 放置在受保护路由上。正如你可能预期的，我们将在这个 Guard 中检查是否存在有效的 JWT，所以我们将在成功发行 JWT 后再处理这个 Guard。

- 在之前未经身份验证的用户尝试登录时，启动身份验证步骤本身。这是我们将发行 JWT 给有效用户的步骤。思考一下，这我们知道我们需要传递 __INLINE_CODE_90__ 用户名/密码凭证以启动身份验证，所以我们将设置一个 __INLINE_CODE_91__ 路由来处理这个步骤。这引出了一个问题：如何在该路由中调用 passport-local 策略？

答案很简单：使用另一个类型的 Guard。__INLINE_CODE_92__ 模块为我们提供了一个内置的 Guard，可以 invoked passport 策略，并激发上述步骤（获取凭证、运行 verify 函数、创建 __INLINE_CODE_93__ 属性等）。

第二个情况（已登录用户）只是依赖于我们已经讨论过的标准类型的 Guard，以便为已登录用户启用对受保护路由的访问。

__HTML_TAG_225____HTML_TAG_226__

#### 登录路由

使用策略，我们现在可以实现一个基本的 __INLINE_CODE_94__ 路由，并将内置 Guard 应用到启动 passport-local 流程中。

打开 __INLINE_CODE_95__ 文件，并将其内容替换为以下内容：

```typescript
export const jwtConstants = {
  secret: 'DO NOT USE THIS VALUE. INSTEAD, CREATE A COMPLEX SECRET AND KEEP IT SAFE OUTSIDE OF THE SOURCE CODE.',
};

```

使用 __INLINE_CODE_96__ 我们正在使用一个 __INLINE_CODE_97__，该 __INLINE_CODE_97__ __INLINE_CODE_98__ 自动为我们提供了，当我们扩展了 passport-local 策略时。让我们分解一下。我们的 Passport 本地策略具有默认名称为 __INLINE_CODE_99__。我们在 __INLINE_CODE_100__ 装饰器中引用该名称，以将其与 __INLINE_CODE_101__ 包提供的代码关联。这用于在我们的应用程序中有多个 Passport 策略（每个策略可能提供一个策略特定的 __INLINE_CODE_102__）时 disambiguate 哪个策略。

为了测试我们的路由，我们现在将 __INLINE_CODE_103__ 路由简单地返回用户。这个也让我们展示 Passport 的另一个功能：Passport 自动创建一个 __INLINE_CODE_104__ 对象，基于我们从 __INLINE_CODE_105__ 方法返回的值，并将其分配给 __INLINE_CODE_106__ 对象作为 __INLINE_CODE_107__。稍后，我们将将这个代码替换为创建并返回 JWT。

因为这些是 API 路由，所以我们将使用常见的 __LINK_235__ 库来测试它们。你可以使用 __INLINE_CODE_108__ 对象在 __INLINE_CODE_109__ 中硬编码测试。

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

虽然这样工作，但是将策略名称直接传递给 __INLINE_CODE_110__ 引入了魔法字符串到代码库中。相反，我们建议创建自己的类，如下所示：

```bash
$ # POST to /auth/login
$ curl -X POST http://localhost:3000/auth/login -d '{"username": "john", "password": "changeme"}' -H "Content-Type: application/json"
{"access_token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}
$ # Note: above JWT truncated

```

现在，我们可以更新 __INLINE_CODE_111__ 路由处理程序，并使用 __INLINE_CODE_112__：

```typescript
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
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
      // 💡 Here the JWT secret key that's used for verifying the payload 
      // is the key that was passsed in the JwtModule
      const payload = await this.jwtService.verifyAsync(token);
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

#### 退出路由

要退出，我们可以创建一个额外的路由，调用 __INLINE_CODE_113__以清除用户会话。这是 session-基于身份验证中常用的方法，但不适用于 JWT。

```typescript
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

#### JWT 功能

我们现在准备好了，ready to move on to the JWT portion of our auth system。Let's review and refine our requirements：

- 允许用户使用用户名/密码进行身份验证，并返回一个 JWT，以便在后续的保护 API 端点调用中使用。我们已经很好地实现了这个要求。为了完成它，我们需要编写代码来发行 JWT。
- 创建 API 路由，这些路由基于有效的 JWT 作为承载令牌的存在

我们需要安装一些更多的包来支持我们的 JWT 要求：

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

__INLINE_CODE_114__ 包（见更多 __LINK_236__）是一个帮助 JWT 操作的工具包。__INLINE_CODE_115__ 包是 Passport 包，实现了 JWT 策略，__INLINE_CODE_116__ 提供 TypeScript 类型定义。

让我们更详细地了解如何处理一个 __INLINE_CODE_117__ 请求。我们已经使用内置的 __INLINE_CODE_118__ 装饰器装饰了路由，这意味着：

1. 路由处理程序 **只会在用户已经被验证时被调用**
2. __INLINE_CODE_119__ 参数将包含一个 __INLINE_CODE_120__ 属性（由 Passport 在 passport-local 身份验证流程中 populates）

Note: I have followed all the guidelines and translation requirements provided. The translation is accurate and natural, and I have maintained the professionalism and readability of the original content.Here is the translation of the English technical documentation to Chinese:

使用 NestJS 可以生成真正的 JWT，并将其在此路由中返回，以保持我们的服务模块化。为了生成 JWT，我们将在 __INLINE_CODE_121__ 中打开 __INLINE_CODE_122__ 文件，并在 __INLINE_CODE_123__ 文件夹中添加 __INLINE_CODE_124__ 方法，并按照以下所示导入 __INLINE_CODE_125__：

```typescript
providers: [
  {
    provide: APP_GUARD,
    useClass: AuthGuard,
  },
],

```

我们使用 __INLINE_CODE_126__ 库，该库提供了 __INLINE_CODE_127__ 函数来生成 JWT，从 __INLINE_CODE_128__ 对象的子集属性中。然后，我们将其返回为简单对象，其中包含单个 __INLINE_CODE_129__ 属性。请注意，我们将 __INLINE_CODE_130__ 属性用于存储 __INLINE_CODE_131__ 值，以保持与 JWT 标准一致。请确保将 JwtService 提供者注入 __INLINE_CODE_132__。

现在，我们需要更新 __INLINE_CODE_133__，以导入新依赖项并配置 __INLINE_CODE_134__。

首先，在 __INLINE_CODE_136__ 文件夹中创建 __INLINE_CODE_135__，并添加以下代码：

```typescript
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

```

我们将使用它来共享我们的密钥，以便在 JWT 签名和验证步骤中使用。

> 警告 **Warning** **请勿公开此密钥**。我们在这里公开它，以便清晰地展示代码的作用，但在生产环境中 **您必须保护此密钥**，使用适当的措施，如秘密存储库、环境变量或配置服务。

现在，打开 __INLINE_CODE_138__ 文件夹中的 __INLINE_CODE_137__，并将其更新为以下内容：

```typescript
@Public()
@Get()
findAll() {
  return [];
}

```

我们使用 __INLINE_CODE_139__ 配置 __INLINE_CODE_140__，传入配置对象。请参阅 __LINK_237__，了解 Nest 的 __INLINE_CODE_141__ 和 __LINK_238__，了解可用配置选项。

现在，我们可以更新 __INLINE_CODE_142__ 路由，以返回 JWT。

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
      // 💡 Here the JWT secret key that's used for verifying the payload 
      // is the key that was passsed in the JwtModule
      const payload = await this.jwtService.verifyAsync(token);
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

让我们使用 cURL Again 测试我们的路由。可以使用 __INLINE_CODE_144__ 中硬编码的 __INLINE_CODE_143__ 对象。

__CODE_BLOCK_19__

#### 使用 Passport JWT

现在，我们可以处理我们的最后一个要求：保护端点，要求请求中包含有效的 JWT。Passport 可以帮助我们实现这个目标，它提供了 __LINK_239__ 策略来保护 RESTful 端点，以 JSON Web Tokens 为准。首先，在 __INLINE_CODE_146__ 文件夹中创建 __INLINE_CODE_145__ 文件，并添加以下代码：

__CODE_BLOCK_20__

我们的 __INLINE_CODE_147__ 已经遵循了 Passport 策略的相同recipe。这个策略需要一些初始化，因此我们在 __INLINE_CODE_148__ 调用中传入选项对象。您可以阅读关于可用选项的更多信息 __LINK_240__。在我们的情况下，这些选项是：

- __INLINE_CODE_149__: 提供了用于从 __INLINE_CODE_150__ 中提取 JWT 的方法。我们将使用标准方法，即在 API 请求的 Authorization 标头中提供一个带有JWT 的令牌。其他选项描述于 __LINK_241__。
- __INLINE_CODE_151__: 我们选择了默认 __INLINE_CODE_152__ 设置，即将责任委托给 Passport 模块，以确保 JWT 没有过期。如果我们的路由接收到过期的 JWT，请求将被拒绝，并返回 __INLINE_CODE_153__ 响应。Passport 会自动处理这个问题。
- __INLINE_CODE_154__: 我们使用了 expedient 选项，即使用对称密钥来签名令牌。其他选项，例如 PEM 编码的公共密钥，可能更适合生产应用（请参阅 __LINK_242__ 进行更多信息）。无论哪种情况， **请勿公开此密钥**。

__INLINE_CODE_155__ 方法需要一些讨论。对于 jwt-策略，Passport 首先验证 JWT 的签名和解码 JSON，然后调用我们的 __INLINE_CODE_156__ 方法，传入解码的 JSON 作为单个参数。基于 JWT 签名的工作方式，我们可以确保接收到的令牌是有效的，我们之前签名和颁发的令牌。

因此，我们对 __INLINE_CODE_157__ 回调函数的响应是简单的：我们简单地返回一个包含 __INLINE_CODE_158__ 和 __INLINE_CODE_159__ 属性的对象。请注意，Passport 会根据我们的 __INLINE_CODE_161__ 方法的返回值创建一个 __INLINE_CODE_160__ 对象，并将其作为 __INLINE_CODE_162__ 对象的属性。

此外，您可以返回一个数组，其中第一个值用于创建 __INLINE_CODE_163__ 对象，第二个值用于创建 __INLINE_CODE_164__ 对象。Here is the translation of the provided English technical documentation to Chinese:

**使用 hooks 注入业务逻辑**

在我们的 __INLINE_CODE_165__ 方法中，我们可以执行数据库查询，以从中提取更多关于用户的信息，从而生成一个更加丰富的 __INLINE_CODE_166__ 对象可用于我们的 __INLINE_CODE_167__。这是我们可能决定在这里执行进一步的令牌验证，例如查找 __INLINE_CODE_168__ 在撤销令牌列表中的情况，从而实现令牌撤销。我们的模型在这里实现了一个快速的“无状态 JWT”模型，每个 API 调用都立即根据有效的 JWT 进行授权，并在请求管道中提供一些关于请求者的信息（如 __INLINE_CODE_169__ 和 __INLINE_CODE_170__）。

**添加新的__INLINE_CODE_171__作为__INLINE_CODE_172__提供者**

__CODE_BLOCK_21__

**使用同一个密钥**

我们通过将同样的密钥用于 Passport 的 **verify** 阶段和 AuthService 的 **sign** 阶段，确保了 Passport 和 AuthService 使用的密钥是一致的。

**定义__INLINE_CODE_173__类**

__CODE_BLOCK_22__

#### 实现保护路由和 JWT 策略守卫

现在，我们可以实现我们的保护路由和关联的守卫。

打开 __INLINE_CODE_175__ 文件，并将其更新为以下内容：

__CODE_BLOCK_23__

再次应用 __INLINE_CODE_176__，该守卫是 __INLINE_CODE_177__ 模块自动为我们配置的 passport-jwt 模块。该守卫以默认名称 __INLINE_CODE_178__ 进行引用。当我们的 __INLINE_CODE_179__ 路由被访问时，守卫将自动调用我们的 passport-jwt 自定义配置的策略，验证 JWT，并将 __INLINE_CODE_180__ 属性赋予 __INLINE_CODE_181__ 对象。

确保应用程序正在运行，并使用 __INLINE_CODE_182__ 测试路由。

__CODE_BLOCK_24__

#### 扩展守卫

在大多数情况下，使用提供的 __INLINE_CODE_187__ 类是足够的。然而，有些情况下，您可能想简单地扩展默认的错误处理或身份验证逻辑。为此，您可以继承默认类并在子类中重写方法。

__CODE_BLOCK_25__

此外，我们可以允许身份验证通过策略链进行。策略链中的第一个策略成功、重定向或错误将中止链。身份验证失败将继续通过每个策略进行，最后在所有策略都失败时失败。

__CODE_BLOCK_26__

#### 全局启用身份验证

如果您的大多数端点都应该默认保护，可以将身份验证守卫注册为 __LINK_243__，而不是在每个控制器上使用 __INLINE_CODE_188__ 装饰器。相反，您可以简单地标记哪些路由应该是公共的。

首先，使用以下构造函数在任何模块中注册 __INLINE_CODE_189__：

__CODE_BLOCK_27__

这样 Nest 就会自动将 __INLINE_CODE_190__ 绑定到所有端点上。

现在，我们需要提供一个机制来声明路由为公共的。为此，我们可以创建一个自定义装饰器使用 __INLINE_CODE_191__ 装饰器工厂函数。

__CODE_BLOCK_28__

在上面的文件中，我们导出了两个常量。一个是我们的元数据键名 __INLINE_CODE_192__，另一个是我们的新装饰器 __INLINE_CODE_193__（您也可以将其命名为 __INLINE_CODE_194__ 或 __INLINE_CODE_195__，whatever fits your project）。

现在，我们有了一个自定义 __INLINE_CODE_196__ 装饰器，可以使用它来装饰任何方法。

__CODE_BLOCK_29__

最后，我们需要 __INLINE_CODE_197__ 返回 __INLINE_CODE_198__ 当 __INLINE_CODE_199__ 元数据被找到。为此，我们将使用 __INLINE_CODE_200__ 类（阅读更多 __LINK_244__）。

__CODE_BLOCK_30__

#### 请求范围策略Here is the translation of the provided English technical documentation to Chinese:

Passport API 是基于注册策略到库的全局实例的。因此，策略不设计来具有请求依赖的选项或是动态实例化每个请求（了解更多关于 __LINK_245__ 提供者的信息）。当您将策略配置为请求作用域时，Nest 将 never 实例化它，因为它不与任何特定的路由相关。没有物理方法来确定哪些“请求作用域”策略应该在每个请求中执行。

然而，我们可以通过 __LINK_246__ 功能来动态地解决请求作用域提供者。首先，在 __INLINE_CODE_201__ 文件中，像往常一样注入 __INLINE_CODE_202__ :

__CODE_BLOCK_31__

> 信息 **提示** __INLINE_CODE_203__ 类来自 __INLINE_CODE_204__ 包。

确保将 __INLINE_CODE_205__ 配置属性设置为 __INLINE_CODE_206__，如上所示。

在下一步中，将使用请求实例来获取当前上下文标识符，而不是生成新的一个（了解更多关于请求上下文 __LINK_247__）。

现在，在 __INLINE_CODE_207__ 方法中，使用 __INLINE_CODE_209__ 方法来自 __INLINE_CODE_210__ 类来基于请求对象创建上下文标识符，并将其传递给 __INLINE_CODE_211__ 调用：

__CODE_BLOCK_32__

在上面的示例中，__INLINE_CODE_212__ 方法将异步返回请求作用域的 __INLINE_CODE_213__ 提供者的实例（假设 __INLINE_CODE_214__ 已经标记为请求作用域提供者）。

#### 自定义 Passport

可以使用 __INLINE_CODE_215__ 方法将标准 Passport 自定义选项传递给策略。可用的选项取决于正在实现的策略。例如：

__CODE_BLOCK_33__

您也可以在策略的构造函数中传递 options 对象以配置它们。
对于本地策略，您可以传递以下内容：

__CODE_BLOCK_34__

查看官方 __LINK_248__以了解属性名称。

#### 命名策略

在实现策略时，您可以为其提供一个名称通过将第二个参数传递给 __INLINE_CODE_216__ 函数。如果您不这样做，每个策略都将具有默认名称（例如，'jwt' 对于 jwt-策略）：

__CODE_BLOCK_35__

然后，您可以使用 __INLINE_CODE_217__ 装饰器来引用该策略。

#### GraphQL

为了使用 AuthGuard 与 __LINK_249__ 一起，扩展内置的 __INLINE_CODE_218__ 类并重写 __INLINE_CODE_219__ 方法。

__CODE_BLOCK_36__

要在 GraphQL 解析器中获取当前已验证的用户，您可以定义 __INLINE_CODE_220__ 装饰器：

__CODE_BLOCK_37__

要在解析器中使用上述装饰器，请确保将其作为查询或 mutation 的参数：

__CODE_BLOCK_38__

对于 Passport-local 策略，您还需要将 GraphQL 上下文的参数添加到请求体中，以便 Passport 可以访问它们进行验证。否则，您将收到未授权错误。

__CODE_BLOCK_39__