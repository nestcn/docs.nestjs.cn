<!-- 此文件从 content/recipes/passport.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:38:40.101Z -->
<!-- 源文件: content/recipes/passport.md -->

### Passport (认证)

__LINK_227__ 是 Node.js 最流行的身份验证库，社区广泛认可，成功应用于许多生产环境中。使用 `auth.service.ts` 模块可以轻松将该库集成到 **Nest** 应用程序中。总体来说，Passport 执行一系列步骤来：

- 验证用户的 "凭证"（如用户名/密码、JSON Web Token (__LINK_228__) 或身份提供商的身份 token）
- 管理已验证的状态（通过发布可移植的令牌，例如 JWT，或者创建 __LINK_229__）
- 将已验证用户的信息附加到 `auth` 对象中，以便在路由处理器中进行进一步使用

Passport 具有一个丰富的生态系统，实现了各种身份验证机制。虽然概念简单，但 Passport 中的策略集非常多样化。Passport 将这些步骤抽象成一个标准模式， `JwtService` 模块将这个模式标准化为熟悉的 Nest 构造。

在本章中，我们将实现一个完整的端到端身份验证解决方案，以便在 RESTful API 服务器上使用这些强大且灵活的模块。你可以使用这里描述的概念来实现任何 Passport 策略，以便自定义身份验证方案。你可以按照本章中的步骤来构建这个完整的示例。

#### 认证要求

让我们 flesh out 我们的要求。对于这个用例，客户端将首先使用用户名和密码进行身份验证。一旦身份验证成功，服务器将发布一个 JWT，可以在随后的请求中发送作为 __LINK_231__，以证明身份验证。我们还将创建一个保护路由，只允许包含有效 JWT 的请求访问。

我们将从第一个要求开始：身份验证用户。然后，我们将扩展该过程，发布 JWT。最后，我们将创建一个保护路由，检查请求中是否包含有效 JWT。

首先，我们需要安装 required 包。Passport 提供了一个叫做 __LINK_232__ 的策略，它实现了用户名/密码身份验证机制，适合我们的需求。

```bash
$ nest g module auth
$ nest g controller auth
$ nest g service auth

```

> warning **注意** 对于 **任何** Passport 策略，你总是需要安装 `signIn` 和 `@nestjs/jwt` 包。然后，你需要安装策略特定的包（例如 `signAsync()` 或 `user`），该包实现特定的身份验证策略。你还可以安装 Passport 策略的类型定义，例如 `access_token`，它可以帮助你编写 TypeScript 代码。

#### 实现 Passport 策略

我们现在准备实现身份验证特性。我们将从 Passport 的工作流程开始，了解如何 **任何** Passport 策略工作。Passport 可以被看作是一个 mini 框架。Passport 的优点在于，它将身份验证过程抽象成几个基本步骤，你可以根据策略来定制这些步骤。 `sub` 模块将这个框架封装在一个 Nest 风格的包中，使其易于集成到 Nest 应用程序中。我们将使用 `userId` 以下，但是首先，让我们考虑一下 vanilla Passport 是如何工作的。

在 vanilla Passport 中，你可以通过提供两个东西来配置策略：

1. 与该策略相关的选项。例如，在 JWT 策略中，你可能需要提供一个秘密来签名令牌。
2. 验证回调函数，这是你告诉 Passport 如何与用户存储交互（用户账户管理）。在这里，你验证用户是否存在（或创建新用户），并且验证凭证是否有效。Passport 库期望这个回调函数返回一个完整的用户，如果验证成功，或者 null 如果失败（失败定义为用户未找到或在 passport-local 中密码不匹配）。

使用 `AuthModule`，你可以配置 Passport 策略 โดย继承 `JwtModule` 类。您可以通过在子类中调用 `constants.ts` 方法，传递策略选项（项目 1），或者在子类中实现 `auth` 方法，传递验证回调函数。

我们将从生成一个 `auth.module.ts` 开始，在其中，我们将生成一个 `auth`：

```bash
$ nest g module users
$ nest g service users

```

当我们实现 `JwtModule` 时，我们将发现将用户操作封装在一个 `JwtModule` 中非常有用，因此让我们现在生成该模块和服务：

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

Note: Please keep the code examples, variable names, function names unchanged. Translate code comments from English to Chinese.Here is the translation:

我们的示例应用程序中,`JwtModule`仅维护了一个内存中的用户列表，并提供了一个根据用户名查找用户的方法。在实际应用中，这将是您将构建用户模型和持久层的地方，使用您的选择库（例如TypeORM、Sequelize、Mongoose等）。

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

在`register()`中，我们唯一需要做的修改是将`JwtModule`添加到`user`装饰器的exports数组中，以便在外部模块中可见（我们将很快在我们的`UsersService`中使用它）。

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

我们的`AuthGuard`负责检索用户并验证密码。我们创建了一个`AuthGuard`方法来实现此目的。在下面的代码中，我们使用ES6 spread操作符来将密码属性从用户对象中删除，然后返回该对象。我们将很快从Passport local策略中调用该方法。

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

>警告**警告**当然，在实际应用中，您不应该将密码存储在明文中。相反，您应该使用库，如__LINK_233__，使用盐哈希算法。这样，您只需存储哈希密码，然后将存储密码与 incoming密码的哈希版本进行比较，从而从不存储或暴露用户密码。在我们的示例应用程序中，我们违反了绝对命令，使用明文密码。**不要这样做！**

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

#### 实现Passport本地身份验证策略

现在，我们可以实现我们的Passport **本地身份验证策略**。创建一个名为`cURL`的文件，并将以下代码添加到`AuthModule`文件夹中：

```bash
$ npm install --save @nestjs/jwt

```

我们遵循了之前描述的Passport策略配方。在我们的Passport本地身份验证策略中，没有配置选项，所以我们的构造函数简单地调用`60 seconds`，不需要options对象。

>信息**提示**我们可以将options对象传递到`GET /auth/profile`的调用中，以自定义Passport策略的行为。例如，在Passport本地身份验证策略中，默认情况下，Passport期望request body中包含`401 Unauthorized`和`@nestjs/jwt`属性。将options对象传递以指定不同的属性名，例如：`@UseGuards()`。请参阅__LINK_234__以获取更多信息。

我们还实现了`AuthGuard`方法。对于每个策略，Passport都会调用verify函数（使用`AuthModule`方法在`AuthGuard`中实现），使用适当的策略特定的参数。对于本地策略，Passport期望一个`SetMetadata`方法具有以下签名：`IS_PUBLIC_KEY`。

大部分的验证工作都在我们的`Public`中（使用`SkipAuth`帮助），因此该方法非常简单。如果用户存在且凭证有效，我们将返回用户，以便Passport完成其任务（例如，创建`@Public()`属性在`AuthGuard`对象上），然后继续请求处理流程。如果找不到用户，我们抛出异常，让我们的__HTML_TAG_221__异常层__HTML_TAG_222__处理它。

通常，`true`方法对于每个策略的主要区别是 **如何**确定用户存在且有效。例如，在JWT策略中，我们可能根据要求评估是否`"isPublic"`在解码令牌中匹配我们的用户数据库记录，或者匹配已废止令牌列表。因此，这种模式的继承和实现策略特定的验证是consistent、优雅且可扩展的。

我们需要配置`Reflector`以使用Passport我们刚刚定义的功能。更新`@nestjs/passport`以如下所示：

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

#### Passports内置守卫

__HTML_TAG_223__守卫__HTML_TAG_224__章节描述了守卫的主要功能：确定请求是否将被路由处理程序处理。这仍然是真的，我们将很快使用标准的能力。然而，在使用__INLINE_CODE_89__模块的context中，我们还将引入一个新的细节，使其在开始时可能变得混淆，所以让我们讨论一下。考虑您的应用程序可以在两种身份验证状态下存在：

1. 用户/客户端未登录（未身份验证）
2. 用户/客户端已登录（已身份验证）

在第一个情况下（用户未登录），我们需要执行两个distinct函数：

...Here is the translation of the English technical documentation to Chinese:

- 对于未经身份验证的用户，限制他们可以访问的路由（即拒绝访问受保护的路由）。我们将使用Guard来处理这个功能，将Guard置于受保护的路由上。在这个Guard中，我们将检查是否存在有效的JWT，因此我们将在后续工作中开发这个Guard。

- 初始化身份验证步骤，当前未经身份验证的用户尝试登录时。这是我们将为有效用户颁发JWT的地方。思考这个问题，知道我们需要使用用户名/密码凭证来初始化身份验证，因此我们将设置一个路由来处理这件事。这使我们面临的问题是：如何在那个路由中调用passport-local策略？

答案是简单的：使用另一个类型的Guard。__INLINE_CODE_92__ 模块提供了一个内置的Guard，可以将passport策略调用起来，这个Guard将启动上述步骤（获取凭证、运行verify函数、创建__INLINE_CODE_93__ 属性等）。

第二种情况（已登录用户） simplement 依靠我们已经讨论过的标准类型的Guard来启用对受保护路由的访问。

__HTML_TAG_225____HTML_TAG_226__

#### 登录路由

现在我们可以实现一个基本的__INLINE_CODE_94__路由，并将内置的Guard应用于passport-local流程中。

打开__INLINE_CODE_95__文件，并将其内容替换为以下内容：

```typescript
export const jwtConstants = {
  secret: 'DO NOT USE THIS VALUE. INSTEAD, CREATE A COMPLEX SECRET AND KEEP IT SAFE OUTSIDE OF THE SOURCE CODE.',
};

```

使用__INLINE_CODE_96__，我们可以使用一个__INLINE_CODE_97__，该__INLINE_CODE_97__自动为我们提供了在扩展passport-local策略时自动配置的。

让我们分解一下。我们的Passport本地策略具有默认名称__INLINE_CODE_99__。我们在__INLINE_CODE_100__装饰器中引用该名称，以将其与__INLINE_CODE_101__包提供的代码相关联。这用于消除在我们的应用程序中可能出现的多个Passport策略（每个策略都可能提供一个策略特定的__INLINE_CODE_102__）时的歧义。

为了测试我们的路由，我们将我们的__INLINE_CODE_103__路由简单地返回用户。这个也让我们展示了 Passport 的另一个特性：Passport 将自动创建一个__INLINE_CODE_104__对象，基于我们从__INLINE_CODE_105__方法返回的值，并将其分配给__INLINE_CODE_106__对象的__INLINE_CODE_107__ 属性。后来，我们将将这段代码替换为创建和返回 JWT 的代码。

由于这些是 API 路由，我们将使用常见的__LINK_235__库来测试它们。你可以使用__INLINE_CODE_108__对象来测试，它们在__INLINE_CODE_109__中硬编码。

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

虽然这工作正常，但将策略名称直接传递给__INLINE_CODE_110__引入了魔术字符串。在代替，我们建议创建自己的类，如下所示：

```bash
$ # POST to /auth/login
$ curl -X POST http://localhost:3000/auth/login -d '{"username": "john", "password": "changeme"}' -H "Content-Type: application/json"
{"access_token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}
$ # Note: above JWT truncated

```

现在，我们可以更新__INLINE_CODE_111__路由处理程序，并使用__INLINE_CODE_112__：

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

#### 登出路由

要退出，请创建一个额外的路由，该路由将调用__INLINE_CODE_113__以清除用户的会话。这是 session-based身份验证中常用的方法，但不适用于 JWT。

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

我们已经准备好实现 JWT 部分的身份验证系统。让我们回顾和完善我们的要求：

- 允许用户使用用户名/密码进行身份验证，并返回一个 JWT，以便在后续的 API 请求中使用该 JWT。我们已经实现了这部分。为了完成它，我们需要编写颁发 JWT 的代码。
- 创建 API 路由，这些路由受保护基于有效的 JWT 作为承载令牌

我们需要安装一些包来支持我们的 JWT 要求：

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

__INLINE_CODE_114__ 包（见更多__LINK_236__）是一个帮助 JWT 操作的实用包。__INLINE_CODE_115__ 包是 Passport 包，实现了 JWT 策略，__INLINE_CODE_116__ 提供了 TypeScript 类型定义。

让我们更详细地了解如何处理__INLINE_CODE_117__请求。我们已经使用内置的__INLINE_CODE_118__装饰器装饰了路由，该装饰器是 Passport 本地策略提供的。这意味着：

1. 路由处理程序仅在用户已被验证时被invoked
2. __INLINE_CODE_119__ 参数将包含__INLINE_CODE_120__ 属性（在 Passport 本地身份验证流程中被 Passport 填充）Here is the translation of the provided English technical documentation to Chinese:

生成真正的 JWT，并将其在这个路由中返回。为了保持我们的服务模块化，我们将在 __INLINE_CODE_121__ 中生成 JWT。打开 __INLINE_CODE_122__ 文件在 __INLINE_CODE_123__ 文件夹中，并添加 __INLINE_CODE_124__ 方法，并按照以下所示导入 __INLINE_CODE_125__：

```typescript
providers: [
  {
    provide: APP_GUARD,
    useClass: AuthGuard,
  },
],

```

我们使用 __INLINE_CODE_126__ 库，该库提供 __INLINE_CODE_127__ 函数生成我们的 JWT，从 __INLINE_CODE_128__ 对象的子集属性中，然后将其返回为一个简单的对象，其中包含一个 __INLINE_CODE_129__ 属性。注意，我们选择了 __INLINE_CODE_130__ 属性来持久化 __INLINE_CODE_131__ 值，以保持与 JWT 标准一致。忘记将 JwtService 提供者注入 __INLINE_CODE_132__。

现在，我们需要更新 __INLINE_CODE_133__，以便导入新依赖项并配置 __INLINE_CODE_134__。

首先，在 __INLINE_CODE_136__ 文件夹中创建 __INLINE_CODE_135__，并添加以下代码：

```typescript
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

```

我们将使用该密钥来共享签名和验证步骤之间的密钥。

> 警告 **警告** **不要公开此密钥**。我们在这里公开了密钥，以便清楚地表明代码的作用，但是在生产环境中 **您必须保护此密钥**，使用适当的措施，如秘密库、环境变量或配置服务。

现在，打开 __INLINE_CODE_138__ 文件夹中的 __INLINE_CODE_137__，并更新它以如下所示：

```typescript
@Public()
@Get()
findAll() {
  return [];
}

```

我们使用 __INLINE_CODE_139__ 来配置 __INLINE_CODE_140__，并传入配置对象。详见 __LINK_237__ 以了解 Nest __INLINE_CODE_141__ 的更多信息，详见 __LINK_238__ 以了解可用配置选项的更多信息。

现在，我们可以更新 __INLINE_CODE_142__ 路由，以便返回 JWT。

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

让我们使用 cURL 测试我们的路由。您可以使用 __INLINE_CODE_144__ 中硬编码的任何 __INLINE_CODE_143__ 对象。

__CODE_BLOCK_19__

#### 使用 Passport JWT

现在，我们可以解决我们的最后一个需求：保护端点，以便在请求中需要有效的 JWT。Passport 可以帮助我们。它提供了 __LINK_239__ 策略，以保护 RESTful 端点使用 JSON Web Tokens。首先，在 __INLINE_CODE_146__ 文件夹中创建 __INLINE_CODE_145__ 文件，并添加以下代码：

__CODE_BLOCK_20__

我们的 __INLINE_CODE_147__ 已经遵循了 Passport 策略的同一个 recipe。这个策略需要一些初始化，因此我们在 __INLINE_CODE_148__ 调用中传入选项对象。您可以阅读关于可用选项的更多信息 __LINK_240__。在我们的情况下，这些选项是：

- __INLINE_CODE_149__: 提供了将 JWT 提取到 __INLINE_CODE_150__ 的方法。我们将使用标准的方法，即在 API 请求的 Authorization 头中提供 bearer 令牌。其他选项详见 __LINK_241__。
- __INLINE_CODE_151__: 只是为了明确，我们选择了默认的 __INLINE_CODE_152__ 设置，这意味着 Passport 模块将负责确保 JWT 未过期。如果我们的路由接收到过期的 JWT，则将 deny 请求并发送 __INLINE_CODE_153__ 响应。Passport 可以自动处理这个步骤。
- __INLINE_CODE_154__: 我们使用了 expedient 选项，即使用对称秘密来签名令牌。其他选项，例如 PEM 编码的公共密钥，可能更适合生产应用程序（详见 __LINK_242__ 了解更多信息）。无论如何， **不要公开此秘密**。

__INLINE_CODE_155__ 方法值得一提。对于 jwt-策略，Passport 首先验证 JWT 的签名和解码 JSON，然后调用我们的 __INLINE_CODE_156__ 方法，传入解码的 JSON 作为单个参数。基于 JWT 签名的工作方式，我们 **可以确保我们正在接收一个有效的令牌**，我们之前签名和发行给有效用户的令牌。

因此，我们对 __INLINE_CODE_157__ 回调的响应是简单的：我们只是返回一个包含 __INLINE_CODE_158__ 和 __INLINE_CODE_159__ 属性的对象。再次回忆，Passport 将根据我们的 __INLINE_CODE_161__ 方法的返回值构建 __INLINE_CODE_160__ 对象，并将其作为 __INLINE_CODE_162__ 对象的属性。

此外，您也可以返回一个数组，其中第一个值将用于创建 __INLINE_CODE_163__ 对象，第二个值将用于创建 __INLINE_CODE_164__ 对象。以下是翻译后的中文文档：

在这个方法中，我们留出了我们可以在这里 inject 其他业务逻辑的位置。例如，我们可以在 __INLINE_CODE_165__ 方法中执行数据库查询，以提取更多关于用户的信息，从而使得我们在 __INLINE_CODE_166__ 对象中拥有更多信息。这个地方也可能是我们决定做进一步的 token 验证，例如查找 __INLINE_CODE_168__ 在撤销令列表中，以便执行令牌撤销。我们这里实现的模型是一个快速的“无状态 JWT”模型，每个 API 调用都立即根据有效的 JWT 进行授权，并且在请求管道中提供一些关于请求者的信息（其 __INLINE_CODE_169__ 和 __INLINE_CODE_170__ 信息）。

将新的 __INLINE_CODE_171__ 添加到 __INLINE_CODE_172__ 提供者中：

__CODE_BLOCK_21__

通过导入与我们签名 JWT 时使用的同一个 secret，我们确保 Passport 在 verify 阶段和我们的 AuthService 在 sign 阶段使用共同的 secret。

最后，我们定义了 __INLINE_CODE_173__ 类，它继承自内置的 __INLINE_CODE_174__：

__CODE_BLOCK_22__

#### 实现保护路由和 JWT 策略守卫

现在，我们可以实现我们的保护路由和关联的守卫。

打开 __INLINE_CODE_175__ 文件，并将其更新如下：

__CODE_BLOCK_23__

再次应用 __INLINE_CODE_176__，该 __INLINE_CODE_177__ 模块自动为我们配置的 passport-jwt 模块提供的。这个守卫由其默认名称 __INLINE_CODE_178__ 引用，当我们的 __INLINE_CODE_179__ 路由被访问时，守卫将自动调用我们的 passport-jwt 自定义配置的策略，验证 JWT，并将 __INLINE_CODE_180__ 属性分配给 __INLINE_CODE_181__ 对象。

确保应用程序正在运行，然后使用 __INLINE_CODE_182__ 测试路由。

__CODE_BLOCK_24__

注意，在 __INLINE_CODE_183__ 中，我们将 JWT 设置为 __INLINE_CODE_184__ 的过期时间。这可能太短了过期时间，我们选择这个来演示 JWT 和 passport-jwt 策略的重要特性。如果您在身份验证后等待 60 秒，然后尝试 __INLINE_CODE_185__ 请求，您将收到 __INLINE_CODE_186__ 响应。这是因为 Passport 自动检查 JWT 的过期时间，免去了您在应用程序中进行检查的麻烦。

我们现在已经完成了 JWT 认证实现。 JavaScript 客户端（如 Angular/React/Vue），和其他 JavaScript 应用程序，可以现在安全地与我们的 API 服务器通信。

#### 扩展守卫

在大多数情况下，使用提供的 __INLINE_CODE_187__ 类是足够的。但是，在某些情况下，您可能想简单地扩展默认的错误处理或身份验证逻辑。为此，您可以扩展内置类并重写其中的方法在子类中。

__CODE_BLOCK_25__

此外，我们可以允许身份验证通过策略链。第一个策略成功、重定向或错误将停止链。身份验证失败将顺序地通过每个策略，直到所有策略都失败。

__CODE_BLOCK_26__

#### 全局启用身份验证

如果您的大多数端点都应该默认保护，可以注册身份验证守卫为 __LINK_243__，而不是在每个控制器上使用 __INLINE_CODE_188__ 装饰器。相反，您可以简单地标记哪些路由应该是公共的。

首先，注册 __INLINE_CODE_189__ 作为全局守卫，使用以下构造（在任何模块中）：

__CODE_BLOCK_27__

现在，我们必须提供一个机制来声明路由为公共的。为此，我们可以创建一个自定义装饰器使用 __INLINE_CODE_191__ 装饰器工厂函数。

__CODE_BLOCK_28__

在上面的文件中，我们导出了两个常量。一个是我们的元数据键 __INLINE_CODE_192__，另一个是我们的新装饰器 __INLINE_CODE_193__（您可以将其命名为 __INLINE_CODE_194__ 或 __INLINE_CODE_195__，以适合您的项目）。

现在，我们已经有了自定义 __INLINE_CODE_196__ 装饰器，可以将其用于装饰任何方法。

__CODE_BLOCK_29__

最后，我们需要 __INLINE_CODE_197__ 返回 __INLINE_CODE_198__，当 __INLINE_CODE_199__ 元数据被找到时。为此，我们将使用 __INLINE_CODE_200__ 类（请阅读更多 __LINK_244__）。

__CODE_BLOCK_30__

#### 请求作用域策略

Note: The translation follows the provided glossary and terminology. The translation is accurate and preserves the original content, including code examples, variable names, function names, and Markdown formatting. The translation also maintains the original formatting, links, and images.Here is the translation of the English technical documentation to Chinese:

passport API 是基于在库的全局实例中注册策略的。因此，策略不设计为具有请求依赖项或动态实例化 per 请求（了解更多关于__LINK_245__提供者的信息）。当您将策略配置为请求作用域时，Nest将不会实例化它，因为它不与任何特定路由相关。没有实际方法来确定哪些“请求作用域”策略应该在每个请求中执行。

然而，我们可以通过 __LINK_246__ 功能来动态解决请求作用域提供者。在这个步骤中，我们将打开 __INLINE_CODE_201__ 文件，并在正常方式中注入 __INLINE_CODE_202__：

__CODE_BLOCK_31__

> info **提示** __INLINE_CODE_203__ 类来自 __INLINE_CODE_204__ 包。

确保将 __INLINE_CODE_205__ 配置属性设置为 __INLINE_CODE_206__，如下所示。

在下一步骤中，我们将使用请求实例来获取当前上下文标识符，而不是生成新的一个（了解更多关于请求上下文__LINK_247__）。

现在，在 __INLINE_CODE_207__ 方法中使用 __INLINE_CODE_209__ 方法来创建一个上下文标识符，基于请求对象，并将其传递给 __INLINE_CODE_211__ 调用：

__CODE_BLOCK_32__

在上面的示例中， __INLINE_CODE_212__ 方法将异步返回请求作用域的 __INLINE_CODE_213__ 提供者的实例（假设 __INLINE_CODE_214__ 被标记为请求作用域提供者）。

#### Customize Passport

可以使用标准 Passport 自定义选项，使用 __INLINE_CODE_215__ 方法。可用的选项取决于正在实现的策略。例如：

__CODE_BLOCK_33__

您也可以将策略的 options 对象传递给其构造函数以进行配置。
对于本地策略，您可以传递以下内容：

__CODE_BLOCK_34__

查看官方 __LINK_248__以了解属性名称。

#### 命名策略

在实现策略时，您可以为其提供一个名称，通过将第二个参数传递给 __INLINE_CODE_216__ 函数。如果您不这样做，每个策略将具有默认名称（例如，'jwt' for jwt-strategy）：

__CODE_BLOCK_35__

然后，您可以通过 __INLINE_CODE_217__ 装饰器来引用这个名称。

#### GraphQL

为了使用 AuthGuard 与 __LINK_249__，请扩展内置的 __INLINE_CODE_218__ 类，并重写 __INLINE_CODE_219__ 方法。

__CODE_BLOCK_36__

要在您的 GraphQL 解析器中获取当前已验证用户，您可以定义一个 __INLINE_CODE_220__ 装饰器：

__CODE_BLOCK_37__

要使用上述装饰器在您的解析器中，您需要将其作为参数添加到您的查询或 mutation 中：

__CODE_BLOCK_38__

对于 passport-local 策略，您还需要将 GraphQL 上下文的参数添加到请求体中，以便 Passport 可以访问它们进行验证。否则，您将收到未授权错误。

__CODE_BLOCK_39__