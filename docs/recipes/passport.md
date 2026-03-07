### Passport（认证）

[Passport](https://github.com/jaredhanson/passport) 是最流行的 Node.js 认证库，为社区所熟知，并在许多生产应用中成功使用。使用 `@nestjs/passport` 模块，可以轻松地将此库集成到 **Nest** 应用程序中。从高层次上讲，Passport 执行一系列步骤来：

- 通过验证用户的“凭据”（例如用户名/密码、JSON Web Token ([JWT](https://jwt.io/)) 或来自身份提供商的身份令牌）来认证用户
- 管理认证状态（通过颁发便携式令牌，如 JWT，或创建 [Express 会话](https://github.com/expressjs/session)）
- 将有关已认证用户的信息附加到 `Request` 对象上，以便在路由处理程序中进一步使用

Passport 拥有丰富的 [策略](http://www.passportjs.org/) 生态系统，实现了各种认证机制。虽然概念简单，但可供选择的 Passport 策略数量众多，呈现出很大的多样性。Passport 将这些不同的步骤抽象为标准模式，而 `@nestjs/passport` 模块将此模式包装并标准化为熟悉的 Nest 构造。

在本章中，我们将使用这些强大而灵活的模块为 RESTful API 服务器实现完整的端到端认证解决方案。您可以使用此处描述的概念来实现任何 Passport 策略，以自定义您的认证方案。您可以按照本章中的步骤构建这个完整的示例。

#### 认证要求

让我们详细说明我们的要求。对于此用例，客户端将首先使用用户名和密码进行认证。认证后，服务器将颁发一个 JWT，该 JWT 可以作为 [授权标头中的承载令牌](https://tools.ietf.org/html/rfc6750) 在后续请求中发送，以证明认证状态。我们还将创建一个受保护的路由，只有包含有效 JWT 的请求才能访问。

我们将从第一个要求开始：认证用户。然后，我们将通过颁发 JWT 来扩展它。最后，我们将创建一个受保护的路由，检查请求中是否存在有效的 JWT。

首先，我们需要安装所需的包。Passport 提供了一种称为 [passport-local](https://github.com/jaredhanson/passport-local) 的策略，该策略实现了用户名/密码认证机制，适合我们用例的这一部分。

```bash
$ npm install --save @nestjs/passport passport passport-local
$ npm install --save-dev @types/passport-local

```

> warning **注意** 对于您选择的 **任何** Passport 策略，您始终需要 `@nestjs/passport` 和 `passport` 包。然后，您需要安装实现您正在构建的特定认证策略的策略特定包（例如，`passport-jwt` 或 `passport-local`）。此外，您还可以安装任何 Passport 策略的类型定义，如上所示的 `@types/passport-local`，这在编写 TypeScript 代码时提供帮助。

#### 实现 Passport 策略

现在我们准备实现认证功能。我们将从任何 Passport 策略使用的过程概述开始。将 Passport 视为一个迷你框架本身是有帮助的。该框架的优雅之处在于它将认证过程抽象为几个基本步骤，您可以根据所实现的策略进行自定义。它就像一个框架，因为您通过提供自定义参数（作为普通 JSON 对象）和回调函数形式的自定义代码来配置它，Passport 在适当的时候调用这些回调函数。`@nestjs/passport` 模块将此框架包装在 Nest 风格的包中，使其易于集成到 Nest 应用程序中。我们将在下面使用 `@nestjs/passport`，但首先让我们考虑 **原始 Passport** 如何工作。

在原始 Passport 中，您通过提供两件事来配置策略：

1. 特定于该策略的一组选项。例如，在 JWT 策略中，您可能提供一个用于签名令牌的密钥。
2. 一个“验证回调”，您在其中告诉 Passport 如何与您的用户存储（您管理用户账户的地方）交互。在这里，您验证用户是否存在（和/或创建新用户），以及他们的凭据是否有效。Passport 库期望此回调在验证成功时返回完整用户，或在失败时返回 null（失败定义为用户未找到，或在 passport-local 的情况下，密码不匹配）。

使用 `@nestjs/passport`，您通过扩展 `PassportStrategy` 类来配置 Passport 策略。您通过在子类中调用 `super()` 方法（可选地传递一个选项对象）来传递策略选项（上面的项目 1）。您通过在子类中实现 `validate()` 方法来提供验证回调（上面的项目 2）。

我们将首先生成一个 `AuthModule` 并在其中生成一个 `AuthService`：

```bash
$ nest g module auth
$ nest g service auth

```

在实现 `AuthService` 时，我们会发现将用户操作封装在 `UsersService` 中很有用，所以现在让我们生成该模块和服务：

```bash
$ nest g module users
$ nest g service users

```

将这些生成文件的默认内容替换为如下所示。对于我们的示例应用程序，`UsersService` 只是维护一个硬编码的内存用户列表，以及一个通过用户名检索用户的 find 方法。在实际应用中，您将在这里构建用户模型和持久层，使用您选择的库（例如，TypeORM、Sequelize、Mongoose 等）。

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

```

在 `UsersModule` 中，唯一需要的更改是将 `UsersService` 添加到 `@Module` 装饰器的 exports 数组中，使其在此模块外部可见（我们很快就会在 `AuthService` 中使用它）。

```typescript
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';

@Module({
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

```

我们的 `AuthService` 负责检索用户并验证密码。我们为此目的创建一个 `validateUser()` 方法。在下面的代码中，我们使用方便的 ES6 扩展运算符在返回用户对象之前从用户对象中删除密码属性。我们很快就会从 Passport 本地策略中调用 `validateUser()` 方法。

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

```

> Warning **警告** 当然，在实际应用中，您不会以明文形式存储密码。相反，您会使用像 [bcrypt](https://github.com/kelektiv/node.bcrypt.js#readme) 这样的库，使用加盐的单向哈希算法。使用这种方法，您只会存储哈希密码，然后将存储的密码与 **传入** 密码的哈希版本进行比较，从而从不以明文形式存储或公开用户密码。为了保持我们的示例应用程序简单，我们违反了这一绝对要求并使用明文。**不要在您的实际应用程序中这样做！**

现在，我们更新 `AuthModule` 以导入 `UsersModule`。

```typescript
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  providers: [AuthService],
})
export class AuthModule {}

```

#### 实现 Passport 本地策略

现在我们可以实现我们的 Passport **本地认证策略**。在 `auth` 文件夹中创建一个名为 `local.strategy.ts` 的文件，并添加以下代码：

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

```

我们已经遵循了前面为所有 Passport 策略描述的方案。在我们的 passport-local 用例中，没有配置选项，因此我们的构造函数只是调用 `super()`，没有选项对象。

> info **提示** 我们可以在调用 `super()` 时传递一个选项对象来自定义 passport 策略的行为。在这个例子中，passport-local 策略默认期望请求体中有名为 `username` 和 `password` 的属性。传递一个选项对象来指定不同的属性名，例如：`super({ usernameField: 'email' })`。有关更多信息，请参阅 [Passport 文档](http://www.passportjs.org/docs/configure/)。

我们还实现了 `validate()` 方法。对于每种策略，Passport 将使用适当的策略特定参数集调用验证函数（在 `@nestjs/passport` 中通过 `validate()` 方法实现）。对于 local-strategy，Passport 期望一个具有以下签名的 `validate()` 方法：`validate(username: string, password:string): any`。

大部分验证工作在我们的 `AuthService` 中完成（在 `UsersService` 的帮助下），因此这个方法非常简单。**任何** Passport 策略的 `validate()` 方法都将遵循类似的模式，只是凭证表示的细节不同。如果找到用户且凭证有效，则返回用户，以便 Passport 完成其任务（例如，在 `Request` 对象上创建 `user` 属性），并且请求处理管道可以继续。如果未找到，则我们抛出异常，让我们的 <a href="exception-filters">异常层</a> 处理它。

通常，每种策略的 `validate()` 方法的唯一显著区别是 **如何** 确定用户是否存在且有效。例如，在 JWT 策略中，根据要求，我们可能会评估解码令牌中携带的 `userId` 是否与用户数据库中的记录匹配，或是否与已撤销令牌的列表匹配。因此，这种子类化和实现策略特定验证的模式是一致、优雅且可扩展的。

我们需要配置 `AuthModule` 以使用我们刚刚定义的 Passport 功能。更新 `auth.module.ts` 如下所示：

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

```

#### 内置 Passport 守卫

<a href="guards">守卫</a> 章节描述了守卫的主要功能：确定请求是否由路由处理程序处理。这仍然是正确的，我们很快就会使用这种标准能力。然而，在使用 `@nestjs/passport` 模块的上下文中，我们还将引入一个可能最初令人困惑的轻微新变化，所以让我们现在讨论一下。考虑从认证角度来看，您的应用程序可以存在两种状态：

1. 用户/客户端 **未** 登录（未认证）
2. 用户/客户端 **已** 登录（已认证）

在第一种情况（用户未登录）中，我们需要执行两个不同的功能：

- 限制未认证用户可以访问的路由（即拒绝访问受限路由）。我们将使用守卫以其熟悉的能力来处理此功能，方法是在受保护的路由上放置守卫。正如您可能预期的那样，我们将在这个守卫中检查有效 JWT 的存在，所以一旦我们成功颁发 JWT，我们就会处理这个守卫。

- 当先前未认证的用户尝试登录时，启动 **认证步骤** 本身。这是我们将 **向** 有效用户 **颁发** JWT 的步骤。考虑到这一点，我们知道我们需要 `POST` 用户名/密码凭证来启动认证，所以我们将设置一个 `POST /auth/login` 路由来处理这一点。这提出了一个问题：我们如何在该路由中调用 passport-local 策略？

答案很简单：通过使用另一种稍微不同类型的守卫。`@nestjs/passport` 模块为我们提供了一个内置的守卫来做这件事。这个守卫调用 Passport 策略并启动上述步骤（检索凭证，运行验证函数，创建 `user` 属性等）。

上面列举的第二种情况（登录用户）简单地依赖于我们已经讨论过的标准类型的守卫，以允许登录用户访问受保护的路由。

<app-banner-courses-auth></app-banner-courses-auth>

#### 登录路由

有了策略，我们现在可以实现一个简单的 `/auth/login` 路由，并应用内置的守卫来启动 passport-local 流程。

打开 `app.controller.ts` 文件并将其内容替换为以下内容：

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

```

通过 `@UseGuards(AuthGuard('local'))`，我们使用了 `@nestjs/passport` **自动为我们提供** 的 `AuthGuard`，当我们扩展 passport-local 策略时。让我们分解一下。我们的 Passport 本地策略的默认名称是 `'local'`。我们在 `@UseGuards()` 装饰器中引用该名称，以将其与 `passport-local` 包提供的代码相关联。这用于在我们的应用程序中有多个 Passport 策略（每个策略可能提供特定于策略的 `AuthGuard`）的情况下消除歧义。虽然到目前为止我们只有一个这样的策略，但我们很快会添加第二个，所以这是为了消除歧义所必需的。

为了测试我们的路由，我们现在让 `/auth/login` 路由简单地返回用户。这也让我们展示另一个 Passport 特性：Passport 会根据我们从 `validate()` 方法返回的值自动创建一个 `user` 对象，并将其作为 `req.user` 分配给 `Request` 对象。稍后，我们将用创建和返回 JWT 的代码替换它。

由于这些是 API 路由，我们将使用常用的 [cURL](https://curl.haxx.se/) 库来测试它们。您可以使用 `UsersService` 中硬编码的任何 `user` 对象进行测试。

```bash
$ # POST to /auth/login
$ curl -X POST http://localhost:3000/auth/login -d '{"username": "john", "password": "changeme"}' -H "Content-Type: application/json"
$ # result -> {"userId":1,"username":"john"}

```

虽然这有效，但直接将策略名称传递给 `AuthGuard()` 会在代码库中引入魔法字符串。相反，我们建议创建自己的类，如下所示：

```typescript
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}

```

现在，我们可以更新 `/auth/login` 路由处理程序并使用 `LocalAuthGuard` 代替：

```typescript
@UseGuards(LocalAuthGuard)
@Post('auth/login')
async login(@Request() req) {
  return req.user;
}

```

#### 登出路由

要登出，我们可以创建一个额外的路由，调用 `req.logout()` 来清除用户的会话。这是会话-based 认证中使用的典型方法，但它不适用于 JWT。

```typescript
@UseGuards(LocalAuthGuard)
@Post('auth/logout')
async logout(@Request() req) {
  return req.logout();
}

```

#### JWT 功能

我们准备继续进行我们的 auth 系统的 JWT 部分。让我们回顾并完善我们的要求：

- 允许用户使用用户名/密码进行认证，返回一个 JWT 用于在后续对受保护 API 端点的调用中使用。我们在满足此要求的道路上已经走了很远。要完成它，我们需要编写颁发 JWT 的代码。
- 创建基于作为承载令牌的有效 JWT 的存在而受到保护的 API 路由

我们需要安装几个更多的包来支持我们的 JWT 要求：

```bash
$ npm install --save @nestjs/jwt passport-jwt
$ npm install --save-dev @types/passport-jwt

```

`@nestjs/jwt` 包（更多信息见 [这里](https://github.com/nestjs/jwt)）是一个实用包，帮助处理 JWT 操作。`passport-jwt` 包是实现 JWT 策略的 Passport 包，`@types/passport-jwt` 提供 TypeScript 类型定义。

让我们更仔细地看看 `POST /auth/login` 请求是如何处理的。我们使用了 passport-local 策略提供的内置 `AuthGuard` 来装饰路由。这意味着：

1. 路由处理程序 **只有在用户已被验证后才会被调用**
2. `req` 参数将包含一个 `user` 属性（由 Passport 在 passport-local 认证流程期间填充）

考虑到这一点，我们现在可以最终生成一个真正的 JWT，并在此路由中返回它。为了保持我们的服务干净地模块化，我们将在 `authService` 中处理生成 JWT。打开 `auth` 文件夹中的 `auth.service.ts` 文件，添加 `login()` 方法，并导入 `JwtService`，如下所示：

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

```

我们使用 `@nestjs/jwt` 库，该库提供了一个 `sign()` 函数，从 `user` 对象属性的子集生成我们的 JWT，然后我们将其作为带有单个 `access_token` 属性的简单对象返回。注意：我们选择属性名 `sub` 来保存我们的 `userId` 值，以与 JWT 标准保持一致。不要忘记将 JwtService 提供者注入到 `AuthService` 中。

现在我们需要更新 `AuthModule` 以导入新的依赖项并配置 `JwtModule`。

首先，在 `auth` 文件夹中创建 `constants.ts`，并添加以下代码：

```typescript
export const jwtConstants = {
  secret: 'DO NOT USE THIS VALUE. INSTEAD, CREATE A COMPLEX SECRET AND KEEP IT SAFE OUTSIDE OF THE SOURCE CODE.',
};

```

我们将使用它在 JWT 签名和验证步骤之间共享我们的密钥。

> Warning **警告** **不要公开此密钥**。我们在这里这样做是为了清楚地说明代码在做什么，但在生产系统中，**您必须使用适当的措施保护此密钥**，例如密钥库、环境变量或配置服务。

现在，打开 `auth` 文件夹中的 `auth.module.ts` 并更新它如下所示：

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

```

我们使用 `register()` 配置 `JwtModule`，传入一个配置对象。有关 Nest `JwtModule` 的更多信息，请参见 [这里](https://github.com/nestjs/jwt/blob/master/README.md)，有关可用配置选项的更多详细信息，请参见 [这里](https://github.com/auth0/node-jsonwebtoken#用法)。

现在我们可以更新 `/auth/login` 路由以返回 JWT。

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

```

让我们继续使用 cURL 测试我们的路由。您可以使用 `UsersService` 中硬编码的任何 `user` 对象进行测试。

```bash
$ # POST to /auth/login
$ curl -X POST http://localhost:3000/auth/login -d '{"username": "john", "password": "changeme"}' -H "Content-Type: application/json"
$ # result -> {"access_token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}
$ # Note: above JWT truncated

```

#### 实现 Passport JWT

现在我们可以满足我们的最终要求：通过要求请求中存在有效的 JWT 来保护端点。Passport 也可以在这里帮助我们。它提供了 [passport-jwt](https://github.com/mikenicholson/passport-jwt) 策略，用于使用 JSON Web Tokens 保护 RESTful 端点。首先在 `auth` 文件夹中创建一个名为 `jwt.strategy.ts` 的文件，并添加以下代码：

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

```

使用我们的 `JwtStrategy`，我们遵循了前面为所有 Passport 策略描述的相同方案。此策略需要一些初始化，所以我们通过在 `super()` 调用中传递一个选项对象来做到这一点。您可以在 [这里](https://github.com/mikenicholson/passport-jwt#configure-strategy) 阅读有关可用选项的更多信息。在我们的例子中，这些选项是：

- `jwtFromRequest`：提供从 `Request` 中提取 JWT 的方法。我们将使用在 API 请求的 Authorization 标头中提供承载令牌的标准方法。其他选项在 [这里](https://github.com/mikenicholson/passport-jwt#extracting-the-jwt-from-the-request) 描述。
- `ignoreExpiration`：为了明确起见，我们选择默认的 `false` 设置，这将验证 JWT 未过期的责任委托给 Passport 模块。这意味着如果我们的路由提供了过期的 JWT，请求将被拒绝，并发送 `401 Unauthorized` 响应。Passport 方便地为我们自动处理这个问题。
- `secretOrKey`：我们使用提供对称密钥来签名令牌的权宜之计。其他选项，如 PEM 编码的公钥，可能更适合生产应用（有关更多信息，请参见 [这里](https://github.com/mikenicholson/passport-jwt#configure-strategy)）。无论如何，正如前面所警告的，**不要公开此密钥**。

`validate()` 方法值得讨论。对于 jwt-strategy，Passport 首先验证 JWT 的签名并解码 JSON。然后它调用我们的 `validate()` 方法，将解码的 JSON 作为其单个参数传递。基于 JWT 签名的工作方式，**我们保证我们收到的是我们之前签名并颁发给有效用户的有效令牌**。

由于所有这些，我们对 `validate()` 回调的响应很简单：我们只是返回一个包含 `userId` 和 `username` 属性的对象。再次回忆一下，Passport 将基于我们的 `validate()` 方法的返回值构建一个 `user` 对象，并将其作为属性附加到 `Request` 对象上。

此外，您可以返回一个数组，其中第一个值用于创建 `user` 对象，第二个值用于创建 `authInfo` 对象。

还值得指出的是，这种方法为我们提供了在流程中注入其他业务逻辑的空间（可以说是“钩子”）。例如，我们可以在 `validate()` 方法中进行数据库查找，以提取有关用户的更多信息，从而在我们的 Request 中提供更丰富的 `user` 对象。这也是我们可能决定进行进一步令牌验证的地方，例如在已撤销令牌的列表中查找 `userId`，使我们能够执行令牌撤销。我们在示例代码中实现的模型是一个快速的“无状态 JWT”模型，其中每个 API 调用都基于有效 JWT 的存在立即授权，并且有关请求者的少量信息（其 `userId` 和 `username`）在我们的 Request 管道中可用。

将新的 `JwtStrategy` 添加为 `AuthModule` 中的提供者：

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

```

通过导入我们在签名 JWT 时使用的相同密钥，我们确保 Passport 执行的 **验证** 阶段和我们的 AuthService 中执行的 **签名** 阶段使用共同的密钥。

最后，我们定义 `JwtAuthGuard` 类，它扩展了内置的 `AuthGuard`：

```typescript
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

```

#### 实现受保护的路由和 JWT 策略守卫

现在我们可以实现我们的受保护路由及其关联的守卫。

打开 `app.controller.ts` 文件并按如下所示更新它：

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

```

我们再次应用 `@nestjs/passport` 模块在我们配置 passport-jwt 模块时自动为我们提供的 `AuthGuard`。这个守卫通过其默认名称 `jwt` 被引用。当我们的 `GET /profile` 路由被命中时，守卫将自动调用我们的 passport-jwt 自定义配置策略，验证 JWT，并将 `user` 属性分配给 `Request` 对象。

确保应用程序正在运行，并使用 `cURL` 测试路由。

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

请注意，在 `AuthModule` 中，我们将 JWT 配置为具有 `60 秒` 的过期时间。这可能太短了，处理令牌过期和刷新的细节超出了本文的范围。然而，我们选择这样做是为了展示 JWT 和 passport-jwt 策略的一个重要特性。如果在认证后等待 60 秒再尝试 `GET /profile` 请求，您将收到 `401 Unauthorized` 响应。这是因为 Passport 自动检查 JWT 的过期时间，为您节省了在应用程序中这样做的麻烦。

我们现在已经完成了 JWT 认证实现。JavaScript 客户端（如 Angular/React/Vue）和其他 JavaScript 应用程序现在可以认证并与我们的 API 服务器安全通信。

#### 扩展守卫

在大多数情况下，使用提供的 `AuthGuard` 类就足够了。然而，可能存在您希望简单扩展默认错误处理或认证逻辑的用例。为此，您可以扩展内置类并在子类中重写方法。

```typescript
import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    // Add your custom authentication logic here
    // for example, call super.logIn(request) to establish a session.
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    // You can throw an exception based on either "info" or "err" arguments
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}

```

除了扩展默认错误处理和认证逻辑外，我们还可以允许认证通过一系列策略。第一个成功、重定向或错误的策略将停止链。认证失败将按顺序通过每个策略，最终在所有策略失败时失败。

```typescript
export class JwtAuthGuard extends AuthGuard(['strategy_jwt_1', 'strategy_jwt_2', '...']) { ... }

```

#### 全局启用认证

如果您的绝大多数端点默认应该受到保护，您可以将认证守卫注册为 [全局守卫](/guards#绑定守卫)，而不是在每个控制器上使用 `@UseGuards()` 装饰器，您可以简单地标记哪些路由应该是公共的。

首先，使用以下构造（在任何模块中）将 `JwtAuthGuard` 注册为全局守卫：

```typescript
providers: [
  {
    provide: APP_GUARD,
    useClass: JwtAuthGuard,
  },
],

```

有了这个，Nest 将自动将 `JwtAuthGuard` 绑定到所有端点。

现在我们必须提供一种将路由声明为公共的机制。为此，我们可以使用 `SetMetadata` 装饰器工厂函数创建一个自定义装饰器。

```typescript
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

```

在上面的文件中，我们导出了两个常量。一个是我们的元数据键，名为 `IS_PUBLIC_KEY`，另一个是我们的新装饰器本身，我们将其称为 `Public`（您也可以将其命名为 `SkipAuth` 或 `AllowAnon`，无论什么适合您的项目）。

现在我们有了自定义的 `@Public()` 装饰器，我们可以使用它来装饰任何方法，如下所示：

```typescript
@Public()
@Get()
findAll() {
  return [];
}

```

最后，我们需要 `JwtAuthGuard` 在找到 `"isPublic"` 元数据时返回 `true`。为此，我们将使用 `Reflector` 类（更多信息见 [这里](/guards#putting-it-all-together)）。

```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    return super.canActivate(context);
  }
}

```

#### 请求范围的策略

passport API 基于向库的全局实例注册策略。因此，策略不是为了具有请求依赖的选项或为每个请求动态实例化而设计的（有关 [请求范围](/fundamentals/provider-scopes) 提供者的更多信息）。当您将策略配置为请求范围时，Nest 永远不会实例化它，因为它不绑定到任何特定的路由。没有物理方法来确定每个请求应该执行哪些“请求范围”策略。

然而，有方法可以在策略中动态解析请求范围的提供者。为此，我们利用 [模块引用](/fundamentals/module-reference) 功能。

首先，打开 `local.strategy.ts` 文件并以正常方式注入 `ModuleRef`：

```typescript
constructor(private moduleRef: ModuleRef) {
  super({
    passReqToCallback: true,
  });
}

```

> info **提示** `ModuleRef` 类从 `@nestjs/core` 包中导入。

确保将 `passReqToCallback` 配置属性设置为 `true`，如上所示。

在下一步中，请求实例将用于获取当前上下文标识符，而不是生成一个新的（有关请求上下文的更多信息，请参见 [这里](/fundamentals/module-reference#获取当前子树)）。

现在，在 `LocalStrategy` 类的 `validate()` 方法内部，使用 `ContextIdFactory` 类的 `getByRequest()` 方法基于请求对象创建上下文 ID，并将其传递给 `resolve()` 调用：

```typescript
async validate(
  request: Request,
  username: string,
  password: string,
) {
  const contextId = ContextIdFactory.getByRequest(request);
  // "AuthService" is a request-scoped provider
  const authService = await this.moduleRef.resolve(AuthService, contextId);
  ...
}

```

在上面的示例中，`resolve()` 方法将异步返回 `AuthService` 提供者的请求范围实例（我们假设 `AuthService` 被标记为请求范围的提供者）。

#### 自定义 Passport

任何标准的 Passport 自定义选项都可以通过 `register()` 方法以相同的方式传递。可用的选项取决于正在实现的策略。例如：

```typescript
PassportModule.register({ session: true });

```

您还可以在策略的构造函数中传递选项对象来配置它们。
对于本地策略，您可以传递例如：

```typescript
constructor(private authService: AuthService) {
  super({
    usernameField: 'email',
    passwordField: 'password',
  });
}

```

查看官方 [Passport 网站](http://www.passportjs.org/docs/oauth/) 了解属性名称。

#### 命名策略

在实现策略时，您可以通过向 `PassportStrategy` 函数传递第二个参数来为其提供名称。如果不这样做，每个策略将有一个默认名称（例如，jwt-strategy 的 'jwt'）：

```typescript
export class JwtStrategy extends PassportStrategy(Strategy, 'myjwt')

```

然后，您可以通过像 `@UseGuards(AuthGuard('myjwt'))` 这样的装饰器来引用它。

#### GraphQL

为了在 [GraphQL](/graphql/quick-start) 中使用 AuthGuard，扩展内置的 `AuthGuard` 类并覆盖 `getRequest()` 方法。

```typescript
@Injectable()
export class GqlAuthGuard extends AuthGuard('jwt') {
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }
}

```

要在 GraphQL 解析器中获取当前认证用户，您可以定义一个 `@CurrentUser()` 装饰器：

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req.user;
  },
);

```

要在解析器中使用上述装饰器，请确保将其作为查询或变更的参数包括在内：

```typescript
@Query(() => User)
@UseGuards(GqlAuthGuard)
whoAmI(@CurrentUser() user: User) {
  return this.usersService.findById(user.id);
}

```

对于 passport-local 策略，您还需要将 GraphQL 上下文的参数添加到请求体中，以便 Passport 可以访问它们进行验证。否则，您将收到未授权错误。

```typescript
@Injectable()
export class GqlLocalAuthGuard extends AuthGuard('local') {
  getRequest(context: ExecutionContext) {
    const gqlExecutionContext = GqlExecutionContext.create(context);
    const gqlContext = gqlExecutionContext.getContext();
    const gqlArgs = gqlExecutionContext.getArgs();

    gqlContext.req.body = { ...gqlContext.req.body, ...gqlArgs };
    return gqlContext.req;
  }
}

```