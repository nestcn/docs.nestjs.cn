### 护照（认证）

[Passport](https://github.com/jaredhanson/passport) 是最受欢迎的 node.js 认证库，深受社区认可并成功应用于众多生产环境。通过 `@nestjs/passport` 模块可以轻松将该库集成到 **Nest** 应用中。从高层次来看，Passport 通过以下步骤执行认证：

- 通过验证用户"凭证"（如用户名/密码、JSON Web Token ([JWT](https://jwt.io/)) 或身份提供商提供的身份令牌）来认证用户
- 管理认证状态（通过签发可移植令牌如 JWT，或创建 [Express session](https://github.com/expressjs/session)）
- 将认证用户的信息附加到 `Request` 对象中，以便在路由处理器中进一步使用

Passport 拥有丰富的[策略](http://www.passportjs.org/)生态系统，实现了多种认证机制。虽然概念简单，但可供选择的 Passport 策略种类繁多且变化多样。Passport 将这些不同的步骤抽象为标准模式，而 `@nestjs/passport` 模块将该模式封装并标准化为熟悉的 Nest 结构。

本章中，我们将使用这些强大而灵活的模块为 RESTful API 服务器实现完整的端到端认证解决方案。您可以运用此处描述的概念来实现任何 Passport 策略，从而自定义认证方案。您可以按照本章步骤构建这个完整示例。

#### 认证需求

让我们详细说明需求。在这个用例中，客户端首先需要通过用户名和密码进行身份验证。一旦验证通过，服务器将颁发一个 JWT，该令牌可作为[授权头中的承载令牌](https://tools.ietf.org/html/rfc6750)在后续请求中发送以证明身份。我们还将创建一个受保护路由，仅允许包含有效 JWT 的请求访问。

我们将从第一个需求开始：用户身份验证。然后通过颁发 JWT 来扩展该功能。最后，我们将创建一个受保护路由来检查请求中的有效 JWT。

首先需要安装必要的包。Passport 提供了一个名为 [passport-local](https://github.com/jaredhanson/passport-local) 的策略，它实现了用户名/密码认证机制，正好满足我们这部分用例的需求。

```bash
$ npm install --save @nestjs/passport passport passport-local
$ npm install --save-dev @types/passport-local
```

:::warning 注意
无论选择**哪种** Passport 策略，您始终需要安装 `@nestjs/passport` 和 `passport` 包。此外，还需要安装实现特定认证策略的策略专用包（例如 `passport-jwt` 或 `passport-local`）。您也可以安装 Passport 策略的类型定义，如上文中的 `@types/passport-local`，这将在编写 TypeScript 代码时提供辅助。
:::

#### 实现 Passport 策略

我们现在准备实现认证功能。首先概述适用于**任何** Passport 策略的流程。将 Passport 视为一个迷你框架会很有帮助，其精妙之处在于它将认证过程抽象为几个基本步骤，您可以根据所实现的策略进行定制。它之所以像框架，是因为您通过提供定制参数（作为普通 JSON 对象）和回调函数形式的自定义代码来配置它，Passport 会在适当时机调用这些回调函数。`@nestjs/passport` 模块将这个框架封装成 Nest 风格的包，使其易于集成到 Nest 应用中。下面我们将使用 `@nestjs/passport`，但先来看看**原生 Passport** 的工作原理。

在原生的 Passport 中，您需要通过提供两样东西来配置策略：

1.  一组特定于该策略的选项。例如，在 JWT 策略中，您可能需要提供一个用于签名令牌的密钥。
2.  "验证回调"，即您告诉 Passport 如何与用户存储（管理用户账户的地方）进行交互的地方。在此处，您需要验证用户是否存在（和/或创建新用户）以及其凭证是否有效。Passport 库期望此回调在验证成功时返回完整的用户对象，失败时返回 null（失败定义为用户未找到，或在 passport-local 策略中密码不匹配）。

使用 `@nestjs/passport` 时，您通过扩展 `PassportStrategy` 类来配置 Passport 策略。通过在子类中调用 `super()` 方法传递策略选项（上述第 1 项），可选择传入选项对象。通过子类中实现 `validate()` 方法来提供验证回调（上述第 2 项）。

我们将从生成 `AuthModule` 及其中的 `AuthService` 开始：

```bash
$ nest g module auth
$ nest g service auth
```

在实现 `AuthService` 时，我们发现将用户操作封装到 `UsersService` 中会很有帮助，因此现在就开始生成该模块和服务：

```bash
$ nest g module users
$ nest g service users
```

替换这些生成文件的默认内容，如下所示。在我们的示例应用中，`UsersService` 仅维护一个硬编码的内存用户列表，并通过 find 方法按用户名检索用户。在实际应用中，这里应该使用您选择的库（如 TypeORM、Sequelize、Mongoose 等）构建用户模型和持久层。

 ```typescript title="users/users.service.ts"
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

在 `UsersModule` 中，唯一需要做的改动是将 `UsersService` 添加到 `@Module` 装饰器的 exports 数组中，使其在该模块外部可见（稍后我们将在 `AuthService` 中使用它）。

 ```typescript title="users/users.module.ts"
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';

@Module({
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

我们的 `AuthService` 负责检索用户并验证密码。为此我们创建了一个 `validateUser()` 方法。在下面的代码中，我们使用便捷的 ES6 扩展运算符在返回用户对象前移除 password 属性。稍后我们将从 Passport 本地策略调用这个 `validateUser()` 方法。

 ```typescript title="auth/auth.service.ts"
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

:::warning 警告
 在实际应用中，当然不应以明文存储密码。正确的做法是使用像 [bcrypt](https://github.com/kelektiv/node.bcrypt.js#readme) 这样的库，配合加盐单向哈希算法。采用这种方式时，你只需存储哈希后的密码，然后将存储的密码与**输入**密码的哈希版本进行比对，从而避免以明文形式存储或暴露用户密码。为了让示例应用保持简单，我们违反了这个绝对原则而使用了明文。 **切勿在实际应用中这样做！**
:::

现在，我们更新 `AuthModule` 以导入 `UsersModule`。

 ```typescript title="auth/auth.module.ts"
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

现在我们可以实现 Passport 的**本地认证策略** 。在 `auth` 文件夹中创建名为 `local.strategy.ts` 的文件，并添加以下代码：

 ```typescript title="auth/local.strategy.ts"
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

我们已按照前述方法为所有 Passport 策略实现了配置。在使用 passport-local 的案例中，由于没有配置选项，我们的构造函数仅调用 `super()` 而不传入选项对象。

:::info 提示
我们可以在调用 `super()` 时传入选项对象来自定义 passport 策略的行为。本例中，passport-local 策略默认要求请求体包含名为 `username` 和 `password` 的属性。通过传入选项对象可指定不同的属性名，例如： `super({ usernameField: 'email' })` 。更多信息请参阅 [Passport 文档](http://www.passportjs.org/docs/configure/) 。
:::



我们还实现了 `validate()` 方法。对于每个策略，Passport 会使用特定策略的参数集合来调用验证函数（在 `@nestjs/passport` 中通过 `validate()` 方法实现）。对于 local-strategy，Passport 期望 `validate()` 方法具有以下签名： `validate(username: string, password:string): any` 。

大部分验证工作都在我们的 `AuthService` 中完成（借助 `UsersService` 实现），因此这个方法相当直接。`validate()` 方法对于**任何** Passport 策略都会遵循类似的模式，仅在凭证表示方式的细节上有所不同。如果找到用户且凭证有效，则返回该用户以便 Passport 完成其任务（例如在 `Request` 对象上创建 `user` 属性），请求处理管道可以继续执行。如果未找到用户，我们会抛出异常并由[异常处理层](exception-filters)进行处理。

通常，每种策略的 `validate()` 方法唯一显著区别在于**如何**判断用户存在且有效。例如在 JWT 策略中，根据需求不同，我们可能验证解码令牌中的 `userId` 是否匹配用户数据库记录，或是核对撤销令牌列表。因此，这种通过子类化实现策略特定验证的模式既一致优雅又具备扩展性。

我们需要配置 `AuthModule` 来使用刚定义的 Passport 功能。将 `auth.module.ts` 更新如下：

 ```typescript title="auth/auth.module.ts"
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

[守卫](guards)章节描述了守卫的核心功能：决定请求是否应由路由处理程序处理。这一点仍然成立，我们很快会用到这个标准能力。但在使用 `@nestjs/passport` 模块时，我们会引入一个可能初看令人困惑的新变化，现在就来讨论它。从认证角度看，你的应用可能处于两种状态：

1.  用户/客户端**未**登录（未认证）
2.  用户/客户端**已**登录（已认证）

第一种情况（用户未登录）下，我们需要执行两个不同的功能：

- 限制未认证用户可以访问的路由（即拒绝访问受限路由）。我们将使用守卫（Guards）的常规功能来处理这一需求，通过在受保护路由上设置守卫。正如你可能预见的，我们将在该守卫中检查是否存在有效的 JWT 令牌，因此我们稍后在成功签发 JWT 后再来处理这个守卫。
- 当先前未认证的用户尝试登录时，启动**认证步骤**本身。这是我们将向有效用户**签发** JWT 的环节。稍加思考可知，我们需要通过 `POST` 方式提交用户名/密码凭证来发起认证，因此我们将设置 `POST /auth/login` 路由来处理。这就引出了一个问题：在该路由中我们该如何具体调用 passport-local 策略？

答案很直接：通过使用另一种略有差异的守卫类型。`@nestjs/passport` 模块为我们提供了内置的守卫来实现这一功能。该守卫会调用 Passport 策略并触发上述步骤（获取凭证、运行验证函数、创建 `user` 属性等）。

上述列举的第二种情况（已登录用户）只需依赖我们已讨论过的标准守卫类型，即可为已登录用户启用受保护路由的访问权限。

#### 登录路由

策略确定后，我们现在可以实现一个基础的 `/auth/login` 路由，并应用内置的 Guard 来启动 passport-local 流程。

打开 `app.controller.ts` 文件，将其内容替换为以下代码：

 ```typescript title="app.controller.ts"
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

通过 `@UseGuards(AuthGuard('local'))` ，我们使用了 `AuthGuard`，这个守卫是当我们扩展 passport-local 策略时 `@nestjs/passport` **自动提供**的。让我们详细解析一下：我们的 Passport 本地策略默认名称为 `'local'`。我们在 `@UseGuards()` 装饰器中引用该名称，将其与 `passport-local` 包提供的代码关联起来。这是为了在应用程序中存在多个 Passport 策略时（每个策略都可能提供一个特定于策略的 `AuthGuard`）消除调用哪个策略的歧义。虽然目前我们只有一个这样的策略，但很快就会添加第二个，因此需要这种消除歧义的机制。

为了测试我们的路由，目前将让 `/auth/login` 路由直接返回用户信息。这同时展示了 Passport 的另一个特性：Passport 会根据 `validate()` 方法的返回值自动创建 `user` 对象，并将其赋值给 `Request` 对象的 `req.user` 属性。后续我们会将其替换为生成并返回 JWT 的代码。

由于这些都是 API 路由，我们将使用常见的 [cURL](https://curl.haxx.se/) 库进行测试。您可以使用 `UsersService` 中硬编码的任何 `user` 对象进行测试。

```bash
$ # POST to /auth/login
$ curl -X POST http://localhost:3000/auth/login -d '{"username": "john", "password": "changeme"}' -H "Content-Type: application/json"
$ # result -> {"userId":1,"username":"john"}
```

虽然这种方式可行，但直接将策略名称传入 `AuthGuard()` 会在代码中引入魔术字符串。我们建议改为创建自定义类，如下所示：

 ```typescript title="auth/local-auth.guard.ts"
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
```

现在我们可以更新 `/auth/login` 路由处理器，改用 `LocalAuthGuard`：

```typescript
@UseGuards(LocalAuthGuard)
@Post('auth/login')
async login(@Request() req) {
  return req.user;
}
```

#### 登出路由

要实现登出功能，我们可以创建一个额外的路由来调用 `req.logout()` 以清除用户会话。这是基于会话认证的典型方法，但不适用于 JWT 场景。

```typescript
@UseGuards(LocalAuthGuard)
@Post('auth/logout')
async logout(@Request() req) {
  return req.logout();
}
```

#### JWT 功能

现在我们可以继续开发认证系统中的 JWT 部分。让我们先回顾并完善需求：

- 允许用户通过用户名/密码进行身份验证，返回 JWT 用于后续受保护 API 端点的调用。我们已经基本满足这一需求，接下来需要编写签发 JWT 的代码。
- 创建基于有效 JWT bearer token 进行保护的 API 路由

我们需要安装几个额外的包来支持 JWT 需求：

```bash
$ npm install --save @nestjs/jwt passport-jwt
$ npm install --save-dev @types/passport-jwt
```

`@nestjs/jwt` 包（详见[此处](https://github.com/nestjs/jwt) ）是用于 JWT 操作的实用工具包。`passport-jwt` 是 Passport 实现 JWT 策略的包，而 `@types/passport-jwt` 则提供了 TypeScript 类型定义。

让我们仔细看看如何处理 `POST /auth/login` 请求。我们使用了 passport-local 策略提供的内置 `AuthGuard` 来装饰路由，这意味着：

1.  **只有在用户通过验证后才会调用路由处理程序**
2.  `req` 参数将包含一个 `user` 属性（由 Passport 在 passport-local 认证流程中填充）

考虑到这一点，我们现在可以最终生成一个真实的 JWT，并在此路由中返回它。为了保持服务的模块化整洁，我们将在 `authService` 中处理 JWT 生成。打开 `auth` 文件夹中的 `auth.service.ts` 文件，添加 `login()` 方法，并按所示导入 `JwtService`：

 ```typescript title="auth/auth.service.ts"
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

我们使用 `@nestjs/jwt` 库，它提供了一个 `sign()` 函数，可以从 `user` 对象属性的子集生成 JWT，然后我们将其作为带有单个 `access_token` 属性的简单对象返回。注意：我们选择 `sub` 属性来保存 `userId` 值以符合 JWT 标准。别忘了将 JwtService 提供者注入到 `AuthService` 中。

现在我们需要更新 `AuthModule` 以导入新的依赖项并配置 `JwtModule`。

首先，在 `auth` 文件夹中创建 `constants.ts`，并添加以下代码：

 ```typescript title="auth/constants.ts"
export const jwtConstants = {
  secret: 'DO NOT USE THIS VALUE. INSTEAD, CREATE A COMPLEX SECRET AND KEEP IT SAFE OUTSIDE OF THE SOURCE CODE.',
};
```

我们将使用它在 JWT 签名和验证步骤之间共享密钥。

:::warning 警告\
*\***切勿公开此密钥** 。我们在此展示仅是为了说明代码功能，但在生产环境中**必须通过密钥保险库、环境变量或配置服务等适当措施保护此密钥\*\* 。
:::

现在，打开 `auth` 文件夹中的 `auth.module.ts` 文件，并按如下内容更新：

 ```typescript title="auth/auth.module.ts"
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

我们使用 `register()` 方法配置 `JwtModule`，并传入配置对象。有关 Nest 框架 `JwtModule` 的更多信息请参阅[此处](https://github.com/nestjs/jwt/blob/master/README.md) ，可用配置选项的详细信息请查看[这里](https://github.com/auth0/node-jsonwebtoken#用法) 。

现在我们可以更新 `/auth/login` 路由以返回 JWT 令牌。

 ```typescript title="app.controller.ts"
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

让我们继续使用 cURL 测试路由。你可以使用硬编码在 `UsersService` 中的任意 `user` 对象进行测试。

```bash
$ # POST to /auth/login
$ curl -X POST http://localhost:3000/auth/login -d '{"username": "john", "password": "changeme"}' -H "Content-Type: application/json"
$ # result -> {"access_token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}
$ # Note: above JWT truncated
```

#### 实现 Passport JWT

现在我们可以解决最后的需求：通过要求请求中包含有效的 JWT 来保护端点。Passport 在这方面也能帮助我们。它提供了 [passport-jwt](https://github.com/mikenicholson/passport-jwt) 策略来用 JSON Web Tokens 保护 RESTful 端点。首先在 `auth` 文件夹中创建名为 `jwt.strategy.ts` 的文件，并添加以下代码：

 ```typescript title="auth/jwt.strategy.ts"
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

通过我们的 `JwtStrategy`，我们遵循了之前描述的所有 Passport 策略的相同模式。这个策略需要一些初始化配置，因此我们通过在 `super()` 调用中传入一个选项对象来实现。你可以[在此](https://github.com/mikenicholson/passport-jwt#configure-strategy)阅读更多关于可用选项的信息。在我们的案例中，这些选项包括：

- `jwtFromRequest`：提供从 `Request` 中提取 JWT 的方法。我们将采用标准方式，在 API 请求的 Authorization 头部提供承载令牌。其他选项描述见[此处](https://github.com/mikenicholson/passport-jwt#extracting-the-jwt-from-the-request) 。
- `ignoreExpiration`：为明确起见，我们选择默认的 `false` 设置，这将确保 JWT 未过期的责任委托给 Passport 模块。这意味着如果我们的路由收到过期的 JWT，请求将被拒绝并返回 `401 Unauthorized` 响应。Passport 会自动为我们便捷地处理这一情况。
- `secretOrKey`：我们采用便捷选项，使用对称密钥进行令牌签名。对于生产环境应用，其他选项（如 PEM 编码的公钥）可能更合适（详见[此处](https://github.com/mikenicholson/passport-jwt#configure-strategy) ）。无论如何，如之前所警告的， **切勿公开此密钥** 。

`validate()` 方法值得深入探讨。对于 jwt-strategy，Passport 首先会验证 JWT 签名并解码 JSON 数据，随后调用我们的 `validate()` 方法，将解码后的 JSON 作为唯一参数传入。基于 JWT 签名机制的工作原理， **我们可以确保接收到的是之前已签发且有效的用户令牌** 。

因此，我们对 `validate()` 回调的响应非常简单：只需返回包含 `userId` 和 `username` 属性的对象。需要再次强调的是，Passport 会根据 `validate()` 方法的返回值构建 `user` 对象，并将其附加到 `Request` 对象上。

此外，您也可以返回一个数组，其中第一个值用于创建 `user` 对象，第二个值则用于创建 `authInfo` 对象。

值得一提的是，这种方法为我们预留了空间（可以称之为"钩子"）以便在流程中注入其他业务逻辑。例如，我们可以在 `validate()` 方法中进行数据库查询以获取更多用户信息，从而在 `Request` 中获得更丰富的 `user` 对象。这里也是我们可能决定进行进一步令牌验证的地方，比如在已撤销令牌列表中查找 `userId`，从而实现令牌撤销功能。我们在示例代码中实现的模型是一个快速的"无状态 JWT"模型，其中每个 API 调用都会基于有效 JWT 的存在立即获得授权，并且请求者的少量信息（其 `userId` 和 `username`）可在 Request 管道中使用。

将新的 `JwtStrategy` 作为提供者添加到 `AuthModule` 中：

 ```typescript title="auth/auth.module.ts"
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

通过导入与签署 JWT 时相同的密钥，我们确保 Passport 执行的 **verify** 阶段与 AuthService 中执行的 **sign** 阶段使用相同的密钥。

最后，我们定义继承内置 `AuthGuard` 的 `JwtAuthGuard` 类：

 ```typescript title="auth/jwt-auth.guard.ts"
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

#### 实现受保护路由和 JWT 策略守卫

现在我们可以实现受保护路由及其关联的守卫了。

打开 `app.controller.ts` 文件并按如下所示进行更新：

 ```typescript title="app.controller.ts"
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

我们再次使用了配置 passport-jwt 模块时 `@nestjs/passport` 自动提供的 `AuthGuard`。该守卫通过其默认名称 `jwt` 进行引用。当访问 `GET /profile` 路由时，守卫将自动调用我们自定义配置的 passport-jwt 策略，验证 JWT，并将 `user` 属性赋值给 `Request` 对象。

确保应用正在运行，并使用 `cURL` 测试路由。

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

请注意，在 `AuthModule` 中，我们将 JWT 的过期时间配置为 `60 秒` 。这个过期时间可能太短，而处理令牌过期和刷新的细节超出了本文的范围。但我们选择这个值是为了展示 JWT 和 passport-jwt 策略的一个重要特性：如果在认证后等待 60 秒再尝试 `GET /profile` 请求，您将收到 `401 Unauthorized` 响应。这是因为 Passport 会自动检查 JWT 的过期时间，省去了在应用程序中手动处理的麻烦。

至此我们已经完成了 JWT 认证的实现。JavaScript 客户端（如 Angular/React/Vue）和其他 JavaScript 应用现在可以安全地与我们的 API 服务器进行认证和通信。

#### 扩展守卫

大多数情况下，使用提供的 `AuthGuard` 类就足够了。但有时您可能希望简单地扩展默认的错误处理或认证逻辑。为此，您可以继承内置类并在子类中重写方法。

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

除了扩展默认的错误处理和认证逻辑外，我们还可以让认证通过一系列策略链进行。第一个成功、重定向或报错的策略将终止该链。认证失败会依次通过每个策略，如果所有策略都失败则最终认证失败。

```typescript
export class JwtAuthGuard extends AuthGuard(['strategy_jwt_1', 'strategy_jwt_2', '...']) { ... }
```

#### 全局启用认证

如果默认情况下绝大多数端点都应受到保护，您可以将认证守卫注册为[全局守卫](/overview/guards#绑定守卫) ，而不必在每个控制器顶部使用 `@UseGuards()` 装饰器，只需标记哪些路由应该是公开的即可。

首先，使用以下构造方法（在任何模块中）将 `JwtAuthGuard` 注册为全局守卫：

```typescript
providers: [
  {
    provide: APP_GUARD,
    useClass: JwtAuthGuard,
  },
],
```

配置完成后，Nest 将自动为所有端点绑定 `JwtAuthGuard`。

现在我们需要提供一种机制来声明公共路由。为此，可以使用 `SetMetadata` 装饰器工厂函数创建自定义装饰器。

```typescript
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

在上述文件中，我们导出了两个常量：一个是名为 `IS_PUBLIC_KEY` 的元数据键，另一个是我们即将使用的新装饰器 `Public`（你也可以根据项目需求将其命名为 `SkipAuth` 或 `AllowAnon`）。

现在我们有了自定义的 `@Public()` 装饰器，可以按如下方式装饰任何方法：

```typescript
@Public()
@Get()
findAll() {
  return [];
}
```

最后，我们需要让 `JwtAuthGuard` 在发现 `"isPublic"` 元数据时返回 `true`。为此，我们将使用 `Reflector` 类（更多信息请参阅[此处](/overview/guards#把所有内容放在一起) ）。

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

#### 请求作用域策略

Passport API 基于向库的全局实例注册策略。因此策略并非设计为具有请求相关选项或按请求动态实例化（了解更多关于[请求作用域](/fundamentals/provider-scopes)提供者的信息）。当您将策略配置为请求作用域时，Nest 永远不会实例化它，因为它不与任何特定路由绑定。实际上无法确定每个请求应执行哪些"请求作用域"策略。

不过，存在在策略内动态解析请求作用域提供者的方法。为此，我们利用了[模块引用](/fundamentals/module-ref)功能。

首先，打开 `local.strategy.ts` 文件并以常规方式注入 `ModuleRef`：

```typescript
constructor(private moduleRef: ModuleRef) {
  super({
    passReqToCallback: true,
  });
}
```

:::info 提示
`ModuleRef` 类是从 `@nestjs/core` 包中导入的。
:::

请确保将 `passReqToCallback` 配置属性设置为 `true`，如上所示。

在下一步中，将使用请求实例来获取当前上下文标识符，而不是生成新的标识符（了解更多关于请求上下文的信息请[点击此处](/fundamentals/module-ref#获取当前子树) ）。

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

在上面的示例中，`resolve()` 方法将异步返回请求作用域内的 `AuthService` 提供者实例（我们假设 `AuthService` 被标记为请求作用域的提供者）。

#### 自定义 Passport

任何标准的 Passport 自定义选项都可以通过相同方式使用 `register()` 方法传递。可用选项取决于所实现的策略。例如：

```typescript
PassportModule.register({ session: true });
```

您还可以在策略的构造函数中传递配置选项对象。对于本地策略，您可以传递例如：

```typescript
constructor(private authService: AuthService) {
  super({
    usernameField: 'email',
    passwordField: 'password',
  });
}
```

请查看官方的[护照网站](http://www.passportjs.org/docs/oauth/)了解属性名称。

#### 命名策略

在实现策略时，您可以通过向 `PassportStrategy` 函数传递第二个参数来为其命名。如果不这样做，每个策略将使用默认名称（例如 jwt-strategy 会使用'jwt'）：

```typescript
export class JwtStrategy extends PassportStrategy(Strategy, 'myjwt')
```

然后，您可以通过类似 `@UseGuards(AuthGuard('myjwt'))` 的装饰器来引用它。

#### GraphQL

要在 [GraphQL](../graphql/quick-start) 中使用 AuthGuard，需继承内置的 `AuthGuard` 类并重写 `getRequest()` 方法。

```typescript
@Injectable()
export class GqlAuthGuard extends AuthGuard('jwt') {
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }
}
```

要在 graphql 解析器中获取当前认证用户，可以定义一个 `@CurrentUser()` 装饰器：

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req.user;
  }
);
```

在解析器中使用上述装饰器时，请确保将其作为查询或变更的参数包含：

```typescript
@Query(() => User)
@UseGuards(GqlAuthGuard)
whoAmI(@CurrentUser() user: User) {
  return this.usersService.findById(user.id);
}
```

对于 passport-local 策略，你还需要将 GraphQL 上下文的参数添加到请求体中，以便 Passport 能够访问它们进行验证。否则，你会收到一个 Unauthorized 错误。

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
