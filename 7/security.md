# 安全

## 认证（Authentication）

身份验证是大多数现有应用程序的重要组成部分。有许多不同的方法、策略和方法来处理用户授权。任何项目采用的方法取决于其特定的应用程序要求。本章介绍了几种可以适应各种不同要求的身份验证方法。

`passport` 是目前最流行的 `node.js` 认证库，为社区所熟知，并相继应用于许多生产应用中。将此工具与 `Nest` 框架集成起来非常简单。为了演示，我们将设置 passport-http-bearer 和 passport-jwt 策略。

`Passport`是最流行的 `node.js` 身份验证库，为社区所熟知，并成功地应用于许多生产应用程序中。将这个库与使用 `@nestjs/passport` 模块的 `Nest` 应用程序集成起来非常简单。在较高级别，`Passport` 执行一系列步骤以：

- 通过验证用户的"证"(例如用户名/密码、`JSON Web`令牌( `JWT` )或身份提供者的身份令牌)来验证用户的身份。

- 管理经过身份验证的状态(通过发出可移植的令牌，例如 `JWT`，或创建一个 `Express` 会话)

- 将有关经过身份验证的用户的信息附加到请求对象，以便在路由处理程序中进一步使用

`Passport`具有丰富的策略生态系统，可实施各种身份验证机制。 尽管概念上很简单，但是您可以选择的 `Passport` 策略集非常多，并且有很多种类。 `Passport` 将这些不同的步骤抽象为标准模式，而 `@nestjs/passport` 模块将该模式包装并标准化为熟悉的Nest构造。

在本章中，我们将使用这些强大而灵活的模块为 `RESTful API`服务器实现完整的端到端身份验证解决方案。您可以使用这里描述的概念来实现 `Passport` 策略，以定制您的身份验证方案。您可以按照本章中的步骤来构建这个完整的示例。您可以在[这里](https://github.com/nestjs/nest/tree/master/sample/19-auth-jwt)找到带有完整示例应用程序的存储库。

### 身份认证

让我们充实一下我们的需求。对于此用例，客户端将首先使用用户名和密码进行身份验证。一旦通过身份验证，服务器将发出 `JWT`，该 `JWT` 可以在后续请求的授权头中作为 `token`发送，以验证身份验证。我们还将创建一个受保护的路由，该路由仅对包含有效 `JWT` 的请求可访问。

我们将从第一个需求开始:验证用户。然后我们将通过发行 `JWT` 来扩展它。最后，我们将创建一个受保护的路由，用于检查请求上的有效 `JWT` 。

首先，我们需要安装所需的软件包。`Passport` 提供了一种名为 `Passport-local` 的策略，它实现了一种用户名/密码身份验证机制，这符合我们在这一部分用例中的需求。

```bash
$ npm install --save @nestjs/passport passport passport-local
$ npm install --save-dev @types/passport-local
```

对于您选择的任何 `Passport` 策略，都需要 `@nestjs/Passport` 和 `Passport` 包。然后，需要安装特定策略的包(例如，`passport-jwt` 或 `passport-local`)，它实现您正在构建的特定身份验证策略。此外，您还可以安装任何 `Passport`策略的类型定义，如上面的 `@types/Passport-local` 所示，它在编写 `TypeScript` 代码时提供了帮助。

### Passport 策略

现在可以实现身份认证功能了。我们将首先概述用于任何 `Passport` 策略的流程。将 `Passport` 本身看作一个框架是有帮助的。框架的优雅之处在于，它将身份验证过程抽象为几个基本步骤，您可以根据实现的策略对这些步骤进行自定义。它类似于一个框架，因为您可以通过提供定制参数(作为 `JSON` 对象)和回调函数( `Passport` 在适当的时候调用这些回调函数)的形式来配置它。 `@nestjs/passport` 模块将该框架包装在一个 `Nest` 风格的包中，使其易于集成到 `Nest` 应用程序中。下面我们将使用 `@nestjs/passport` ，但首先让我们考虑一下 `vanilla Passport` 是如何工作的。

在 `vanilla Passport` 中，您可以通过提供以下两项配置策略:

1. 组特定于该策略的选项。例如，在 `JWT` 策略中，您可以提供一个秘令来对令牌进行签名。

2. "验证回调"，在这里您可以告诉 `Passport` 如何与您的用户存储交互(在这里您可以管理用户帐户)。在这里，验证用户是否存在(或创建一个新用户)，以及他们的凭据是否有效。`Passport` 库期望这个回调在验证成功时返回完整的用户消息，在验证失败时返回 `null`(失败定义为用户没有找到，或者在使用 `Passport-local` 的情况下，密码不匹配)。

使用 `@nestjs/passport` ，您可以通过扩展 `PassportStrategy` 类来配置 `passport` 策略。通过调用子类中的 `super()` 方法传递策略选项(上面第1项)，可以选择传递一个 `options` 对象。通过在子类中实现 `validate()` 方法，可以提供`verify` 回调(上面第2项)。

我们将从生成一个 `AuthModule` 开始，其中有一个 `AuthService` :

```bash
$ nest g module auth
$ nest g service auth
```

当我们实现 `AuthService` 时，我们会发现在 `UsersService` 中封装用户操作是很有用的，所以现在让我们生成这个模块和服务:

```bash
$ nest g module users
$ nest g service users
```

替换这些生成文件的默认内容，如下所示。对于我们的示例应用程序，`UsersService` 只是在内存中维护一个硬编码的用户列表，以及一个根据用户名检索用户列表的 `find` 方法。在真正的应用程序中，这是您使用选择的库(例如 `TypeORM`、`Sequelize`、`Mongoose`等)构建用户模型和持久层。

> users/users.service.ts

```typescript
import { Injectable } from '@nestjs/common';

export type User = any;

@Injectable()
export class UsersService {
  private readonly users: User[];

  constructor() {
    this.users = [
      {
        userId: 1,
        username: 'john',
        password: 'changeme',
      },
      {
        userId: 2,
        username: 'chris',
        password: 'secret',
      },
      {
        userId: 3,
        username: 'maria',
        password: 'guess',
      },
    ];
  }

  async findOne(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username);
  }
}
```

在 `UsersModule` 中，惟一需要做的更改是将 `UsersService` 添加到 `@Module` 装饰器的 `exports` 数组中，以便提供给其他模块外部可见(我们很快将在 `AuthService` 中使用它)。

> users/users.module.ts

```typescript
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';

@Module({
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

我们的 `AuthService` 的任务是检索用户并验证密码。为此，我们创建了 `validateUser()` 方法。在下面的代码中，我们使用 `ES6` 扩展操作符从 `user` 对象中提取 `password` 属性，然后再返回它。稍后，我们将从 `Passport` 本地策略中调用 `validateUser()` 方法。

> auth/auth.service.ts

```typescript
import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

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

?> 当然，在实际的应用程序中，您不会以纯文本形式存储密码。 取而代之的是使用带有加密单向哈希算法的 `bcrypt` 之类的库。使用这种方法，您只需存储散列密码，然后将存储的密码与输入密码的散列版本进行比较，这样就不会以纯文本的形式存储或暴露用户密码。为了保持我们的示例应用程序的简单性，我们违反了这个绝对命令并使用纯文本。不要在真正的应用程序中这样做!

现在，我们更新 `AuthModule` 来导入 `UsersModule` 。

> auth/auth.module.ts

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

现在我们可以实现 `Passport` 本地身份验证策略。在auth文件夹中创建一个名为 `local.strategy.ts` 文件，并添加以下代码:

> auth/local.strategy.ts

```typescript
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
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

我们遵循了前面描述的所有护照策略。在我们的 `passport-local` 用例中，没有配置选项，因此我们的构造函数只是调用 `super()` ，没有 `options` 对象。

我们还实现了 `validate()` 方法。对于每个策略，`Passport` 将使用适当的特定于策略的一组参数调用 `verify` 函数(使用 `@nestjs/Passport` 中的 `validate()` 方法实现)。对于本地策略，`Passport` 需要一个具有以下签名的 `validate()` 方法: `validate(username: string, password: string): any`。

大多数验证工作是在我们的 `AuthService` 中完成的(在 `UserService` 的帮助下)，所以这个方法非常简单。任何 `Passport` 策略的 `validate()` 方法都将遵循类似的模式，只是表示凭证的细节方面有所不同。如果找到了用户并且凭据有效，则返回该用户，以便 `Passport` 能够完成其任务(例如，在请求对象上创建`user` 属性)，并且请求处理管道可以继续。如果没有找到，我们抛出一个异常，让异常层处理它。

通常，每种策略的 `validate()` 方法的惟一显著差异是如何确定用户是否存在和是否有效。例如，在 `JWT` 策略中，根据需求，我们可以评估解码令牌中携带的 `userId` 是否与用户数据库中的记录匹配，或者是否与已撤销的令牌列表匹配。因此，这种子类化和实现特定于策略验证的模式是一致的、优雅的和可扩展的。

我们需要配置 `AuthModule` 来使用刚才定义的 `Passport` 特性。更新 `auth.module`。看起来像这样:

> auth/auth.module.ts

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

###  内置 Passport 守卫

守卫章节描述了守卫的主要功能:确定请求是否由路由处理程序。这仍然是正确的，我们将很快使用这个标准功能。但是，在使用 `@nestjs/passport` 模块的情况下，我们还将引入一个新的小问题，这个问题一开始可能会让人感到困惑，现在让我们来讨论一下。从身份验证的角度来看，您的应用程序可以以两种状态存在:

1. 用户/客户端未登录(未通过身份验证)
2. 用户/客户端已登录(已通过身份验证)

在第一种情况下(用户没有登录)，我们需要执行两个不同的功能:

- 限制未经身份验证的用户可以访问的路由（即拒绝访问受限制的路由）。 我们将使用熟悉的警卫来处理这个功能，方法是在受保护的路由上放置一个警卫。我们将在这个守卫中检查是否存在有效的 `JWT` ，所以我们稍后将在成功发出 `JWT` 之后处理这个守卫。

- 当以前未经身份验证的用户尝试登录时，启动身份验证步骤。这时我们向有效用户发出 `JWT` 的步骤。考虑一下这个问题，我们知道需要 `POST` 用户名/密码凭证来启动身份验证，所以我们将设置 `POST` `/auth/login` 路径来处理这个问题。这就提出了一个问题:在这条路由上，我们究竟如何实施“护照-本地”战略?

答案很简单:使用另一种稍微不同类型的守卫。`@nestjs/passport` 模块为我们提供了一个内置的守卫，可以完成这一任务。这个保护调用 `Passport` 策略并启动上面描述的步骤(检索凭证、运行`verify` 函数、创建用户属性等)。

上面列举的第二种情况(登录用户)仅仅依赖于我们已经讨论过的标准类型的守卫，以便为登录用户启用对受保护路由的访问。

### 登录路由

有了这个策略，我们现在就可以实现一个简单的 `/auth/login` 路由，并应用内置的守卫来启动护照本地流。
打开 `app.controller.ts` 文件，并将其内容替换为以下内容:

> app.controller.ts

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

对于 `@UseGuard(AuthGuard('local'))`，我们使用的是一个 `AuthGuard` ，它是在我们扩展护照-本地策略时 `@nestjs/passportautomatic` 为我们准备的。我们来分析一下。我们的 `Passport` 本地策略默认名为`"local"` 。我们在 `@UseGuards()` 装饰器中引用这个名称，以便将它与护照本地包提供的代码关联起来。这用于消除在应用程序中有多个 `Passport` 策略时调用哪个策略的歧义(每个策略可能提供一个特定于策略的 `AuthGuard` )。虽然到目前为止我们只有一个这样的策略，但我们很快就会添加第二个，所以这是消除歧义所需要的。

为了测试我们的路由，我们将 `/auth/login` 路由简单地返回用户。这还允许我们演示另一个 `Passport` 特性: `Passport` 根据从 `validate()` 方法返回的值自动创建一个 `user` 对象，并将其作为 `req.user` 分配给请求对象。稍后，我们将用创建并返回 `JWT` 的代码替换它。

因为这些是 `API` 路由，所以我们将使用常用的`cURL`库来测试它们。您可以使用 `UsersService` 中硬编码的任何用户对象进行测试。

```bash
$ # POST to /auth/login
$ curl -X POST http://localhost:3000/auth/login -d '{"username": "john", "password": "changeme"}' -H "Content-Type: application/json"
$ # result -> {"userId":1,"username":"john"}
```
如果上述内容可以正常工作，可以通过直接将策略名称传递给`AuthGuard()`来引入代码库中的魔术字符串。作为替代，我们推荐创建自己的类，如下所示：

> auth/local-auth.guard.ts

```typescript
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
```

```typescript
@UseGuards(LocalAuthGuard)
@Post('auth/login')
async login(@Request() req) {
  return req.user;
}
```

### JWT 功能

我们已经准备好进入JWT部分的认证系统。让我们回顾并完善我们的需求:

- 允许用户使用用户名/密码进行身份验证，返回 `JWT` 以便在后续调用受保护的 `API` 端点时使用。我们正在努力满足这一要求。为了完成它，我们需要编写发出 `JWT` 的代码。

- 创建基于`token` 的有效`JWT` 的存在而受保护的API路由。

我们需要安装更多的包来支持我们的 `JWT` 需求:

```bash
$ npm install @nestjs/jwt passport-jwt
$ npm install @types/passport-jwt --save-dev
```

`@nest/jwt` 包是一个实用程序包，可以帮助 `jwt` 操作。`passport-jwt` 包是实现 `JWT` 策略的 `Passport`包，`@types/passport-jwt` 提供 `TypeScript` 类型定义。

让我们仔细看看如何处理 `POST`  `/auth/login` 请求。我们使用护照本地策略提供的内置`AuthGuard` 来装饰路由。这意味着:

1. 只有在了用户之后，才会调用路由处理程序

2. req参数将包含一个用户属性(在passport-local 身份验证流期间由 `Passport` 填充)

考虑到这一点，我们现在终于可以生成一个真正的 `JWT` ，并以这种方式返回它。为了使我们的服务保持干净的模块化，我们将在 `authService` 中生成 `JWT` 。在auth文件夹中添加 `auth.service.ts` 文件，并添加 `login()` 方法，导入`JwtService` ，如下图所示:

> auth/auth.service.ts

```typescript
import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
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

我们使用 `@nestjs/jwt` 库，该库提供了一个 `sign()` 函数，用于从用户对象属性的子集生成 `jwt`，然后以简单对象的形式返回一个 `access_token` 属性。注意:我们选择 `sub` 的属性名来保持我们的 `userId` 值与`JWT` 标准一致。不要忘记将 `JwtService` 提供者注入到 `AuthService`中。

现在，我们需要更新 `AuthModule` 来导入新的依赖项并配置 `JwtModule` 。

首先，在auth文件夹下创建 `auth/constants.ts`，并添加以下代码:

> auth/constants.ts

```typescript
export const jwtConstants = {
  secret: 'secretKey',
};
```

我们将使用它在 `JWT` 签名和验证步骤之间共享密钥。

不要公开公开此密钥。我们在这里这样做是为了清楚地说明代码在做什么，但是在生产系统中，您必须使用适当的措施来保护这个密钥，比如机密库、环境变量或配置服务。

现在,在`auth` 文件夹下 `auth.module.ts`，并更新它看起来像这样:

```typescript
auth/auth.module.tsJS

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

我们使用 `register()` 配置 `JwtModule` ，并传入一个配置对象。有关 `Nest JwtModule` 的更多信息请参见[此处](https://github.com/nestjs/jwt/blob/master/README.md)，有关可用配置选项的更多信息请参见[此处](https://github.com/auth0/node-jsonwebtoken#usage)。


现在我们可以更新 `/auth/login` 路径来返回 `JWT` 。

> app.controller.ts

```typescript
import { Controller, Request, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth/auth.service';

@Controller()
export class AppController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @Post('auth/login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }
}
```

让我们继续使用 `cURL` 测试我们的路由。您可以使用 `UsersService` 中硬编码的任何用户对象进行测试。

```bash
$ # POST to /auth/login
$ curl -X POST http://localhost:3000/auth/login -d '{"username": "john", "password": "changeme"}' -H "Content-Type: application/json"
$ # result -> {"access_token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}
$ # Note: above JWT truncated
```

### 实施 Passport JWT

我们现在可以处理我们的最终需求:通过要求在请求时提供有效的 `JWT` 来保护端点。护照对我们也有帮助。它提供了用于用 `JSON Web` 标记保护 `RESTful` 端点的 `passport-jwt` 策略。在 `auth` 文件夹中 `jwt.strategy.ts`，并添加以下代码:

> auth/jwt.strategy.ts 

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

对于我们的 `JwtStrategy` ，我们遵循了前面描述的所有 `Passport` 策略的相同配方。这个策略需要一些初始化，因此我们通过在 `super()` 调用中传递一个 `options` 对象来实现。您可以在[这里](https://github.com/mikenicholson/passport-jwt#configure-strategy)阅读关于可用选项的更多信息。在我们的例子中，这些选项是:

- `jwtFromRequest`:提供从请求中提取 `JWT` 的方法。我们将使用在 `API` 请求的授权头中提供`token`的标准方法。这里描述了其他选项。

`ignoreExpiration`:为了明确起见，我们选择默认的 `false` 设置，它将确保 `JWT` 没有过期的责任委托给 `Passport` 模块。这意味着，如果我们的路由提供了一个过期的 `JWT` ，请求将被拒绝，并发送 `401` 未经授权的响应。护照会自动为我们办理。

`secret orkey`:我们使用权宜的选项来提供对称的秘密来签署令牌。其他选项，如 `pemo` 编码的公钥，可能更适合于生产应用程序(有关更多信息，请参见[此处](https://github.com/mikenicholson/passport-jwt#extracting-the-jwt-from-the-request))。如前所述，无论如何，不要把这个秘密公开。

`validate()` 方法值得讨论一下。对于 `JWT` 策略，`Passport` 首先验证 `JWT` 的签名并解码 `JSON `。然后调用我们的 `validate()` 方法，该方法将解码后的 `JSON` 作为其单个参数传递。根据 `JWT` 签名的工作方式，我们可以保证接收到之前已签名并发给有效用户的有效 `token` 令牌。

因此，我们对 `validate()` 回调的响应很简单:我们只是返回一个包含 `userId` 和 `username` 属性的对象。再次回忆一下，`Passport` 将基于 `validate()` 方法的返回值构建一个`user`  对象，并将其作为属性附加到请求对象上。

同样值得指出的是，这种方法为我们留出了将其他业务逻辑注入流程的空间(就像"挂钩"一样)。例如，我们可以在 `validate()` 方法中执行数据库查询，以提取关于用户的更多信息，从而在请求中提供更丰富的用户对象。这也是我们决定进行进一步令牌验证的地方，例如在已撤销的令牌列表中查找 `userId` ，使我们能够执行令牌撤销。我们在示例代码中实现的模型是一个快速的 `"无状态JWT"` 模型，其中根据有效 `JWT` 的存在立即对每个 `API` 调用进行授权，并在请求管道中提供关于请求者(其 `userid` 和 `username`)的少量信息。

在 `AuthModule` 中添加新的 `JwtStrategy` 作为提供者:

> auth/auth.module.ts

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

通过导入 `JWT` 签名时使用的相同密钥，我们可以确保 `Passport` 执行的验证阶段和 `AuthService` 执行的签名阶段使用公共密钥。


实现受保护的路由和 `JWT` 策略保护，我们现在可以实现受保护的路由及其相关的保护。

打开 `app.controller.ts` 文件，更新如下:

> app.controller.ts

```typescript
import { Controller, Get, Request, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth/auth.service';

@Controller()
export class AppController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @Post('auth/login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
```

同样，我们将应用在配置 `passport-jwt` 模块时 `@nestjs/passport` 模块自动为我们提供的 `AuthGuard` 。这个保护由它的默认名称 `jwt` 引用。当我们请求` GET /profile` 路由时，保护程序将自动调用我们的 `passport-jwt` 自定义配置逻辑，验证 `JWT` ，并将用户属性分配给请求对象。

确保应用程序正在运行，并使用 `cURL` 测试路由。

```bash
$ # GET /profile
$ curl http://localhost:3000/profile
$ # result -> {"statusCode":401,"error":"Unauthorized"}

$ # POST /auth/login
$ curl -X POST http://localhost:3000/auth/login -d '{"username": "john", "password": "changeme"}' -H "Content-Type: application/json"
$ # result -> {"access_token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2Vybm... }

$ # GET /profile using access_token returned from previous step as bearer code
$ curl http://localhost:3000/profile -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2Vybm..."
$ # result -> {"userId":1,"username":"john"}
```

注意，在 `AuthModule` 中，我们将 `JWT` 配置为 `60` 秒过期。这个过期时间可能太短了，而处理令牌过期和刷新的细节超出了本文的范围。然而，我们选择它来展示`JWT` 的一个重要品质和 `jwt` 护照战略。如果您在验证之后等待 `60` 秒再尝试 `GET /profile` 请求，您将收到 `401` 未授权响应。这是因为 `Passport` 会自动检查 `JWT` 的过期时间，从而省去了在应用程序中这样做的麻烦。

我们现在已经完成了 `JWT` 身份验证实现。`JavaScript` 客户端(如 `Angular/React/Vue` )和其他 `JavaScript` 应用程序现在可以安全地与我们的 `API` 服务器进行身份验证和通信。在[这里](https://github.com/nestjs/nest/tree/master/sample/19-auth-jwt)可以看到本节完整的程序代码。

### 默认策略

在我们的 `AppController` 中，我们在 `@AuthGuard()` 装饰器中传递策略的名称。我们需要这样做，因为我们已经介绍了两种 `Passport` 策略(护照本地策略和护照 `jwt` 策略)，这两种策略都提供了各种 `Passport` 组件的实现。传递名称可以消除我们链接到的实现的歧义。当应用程序中包含多个策略时，我们可以声明一个默认策略，这样如果使用该默认策略，我们就不必在 `@AuthGuard` 装饰器中传递名称。下面介绍如何在导入 `PassportModule` 时注册默认策略。这段代码将进入 `AuthModule` :

要确定默认策略行为，您可以注册 `PassportModule` 。

> auth.module.ts

```typescript
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalStrategy } from './local.strategy';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60s' },
    }),
    UsersModule
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```
### 请求范围策略

`passport`API基于将策略注册到库的全局实例。因此策略并没有设计为依赖请求的选项的或者根据每个请求动态生成实例（更多内容见[请求范围提供者](https://docs.nestjs.cn/7/fundamentals?id=%e6%89%80%e6%9c%89%e8%af%b7%e6%b1%82%e6%b3%a8%e5%85%a5)）。当你配置你的策略为请求范围时，`Nest`永远不会将其实例化，因为它并没有和任何特定路径绑定。并没有一个物理方法来决定哪个"请求范围"策略会根据每个请求执行。

然而，在策略中总有办法动态处理请求范围提供者。我们在这里利用[模块参考](https://docs.nestjs.cn/7/fundamentals?id=%e6%a8%a1%e5%9d%97%e5%8f%82%e8%80%83)特性。

首先，打开`local.strategy.ts`文件并且将`ModuleRef`按照正常方法注入其中：

```typescript
constructor(private moduleRef: ModuleRef){
  super({
    passReqToCallback:true;
  })
}
```

!> 注意： `ModuleRef` 类需要从`@nestjs/core`中导入。

要保证`passReqToCallback`属性和上述示例中一样配置为`true`。

在下一步中，请求的实例将被用于获取一个当前上下文标识，而不是生成一个新的（更多关于请求上下文的内容见[这里](https://docs.nestjs.cn/7/fundamentals?id=%e6%a8%a1%e5%9d%97%e5%8f%82%e8%80%83))。

现在，在`LocalStrategy`类的`validate()`方法中，使用`ContextIdFactory`类中的`getByRequest()`方法来创建一个基于请求对向的上下文id，并将其传递给`resolve()`调用：

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

在上述例子中，`resolve()`方法会异步返回`AuthService`提供者的请求范围实例（我们假设`AuthService`被标示为一个请求范围提供者）。

### 扩展守卫

在大多数情况下，使用一个提供的`AuthGuard`类是有用的。然而，在一些用例中你可能只是希望简单地扩展默认的错误处理或者认证逻辑。在这种情况下，你可以通过一个子类来扩展内置的类并且覆盖其方法。

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
    // 在这里添加自定义的认证逻辑
    // 例如调用 super.logIn(request) 来建立一个session
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    // 可以抛出一个基于info或者err参数的异常
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}


```

### 自定义 Passport
 
根据所使用的策略，`Passport`会采用一系列影响库行为的属性。使用  `register()` 方法将选项对象直接传递给`Passport`实例。例如：

```typescript
PassportModule.register({ session: true });
```
您还可以在策略的构造函数中传递一个 `options` 对象来配置它们。至于本地策略，你可以通过例如:

```typescript
constructor(private readonly authService: AuthService) {
  super({
    usernameField: 'email',
    passwordField: 'password',
  });
}
```
看看[Passport Website](http://www.passportjs.org/docs/oauth/)官方文档吧。

### 命名策略

在实现策略时，可以通过向 `PassportStrategy` 函数传递第二个参数来为其提供名称。如果你不这样做，每个策略将有一个默认的名称(例如，"jwt"的 `jwt`策略 ):

```typescript
export class JwtStrategy extends PassportStrategy(Strategy, 'myjwt')
```

然后，通过一个像 `@AuthGuard('myjwt')` 这样的装饰器来引用它。

### GraphQL

为了使用带有 `GraphQL` 的 `AuthGuard` ，扩展内置的 `AuthGuard` 类并覆盖 `getRequest()` 方法。

```typescript
@Injectable()
export class GqlAuthGuard extends AuthGuard('jwt') {
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }
}
```
要使用上述结构，请确保在 `GraphQL` 模块设置中将 `request (req)`对象作为上下文值的一部分传递:

```typescript
GraphQLModule.forRoot({
  context: ({ req }) => ({ req }),
});
```

要在 `graphql` 解析器中获得当前经过身份验证的用户，可以定义一个`@CurrentUser()`装饰器:

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

要在解析器中使用上述装饰器，请确保将其作为查询的参数:

```typescript
@Query(returns => User)
@UseGuards(GqlAuthGuard)
whoAmI(@CurrentUser() user: User) {
  return this.userService.findById(user.id);
}
```

## 授权

授权是指确定一个用户可以做什么的过程。

## 安全

## 加密和散列

### Helmet

通过适当地设置 `HTTP` 头，[Helmet](https://github.com/helmetjs/helmet) 可以帮助保护您的应用免受一些众所周知的 `Web` 漏洞的影响。通常，`Helmet` 只是`14`个较小的中间件函数的集合，它们设置与安全相关的 `HTTP` 头（[阅读更多](https://github.com/helmetjs/helmet#how-it-works)）。首先，安装所需的包：

```bash
$ npm i --save helmet
```

安装完成后，将其应用为全局中间件。

```typescript
import * as helmet from 'helmet';
// somewhere in your initialization file
app.use(helmet());
```

### CORS

跨源资源共享（`CORS`）是一种允许从另一个域请求资源的机制。在底层，`Nest` 使用了 [cors](https://github.com/expressjs/cors) 包，它提供了一系列选项，您可以根据自己的要求进行自定义。为了启用 `CORS`，您必须调用 `enableCors()` 方法。

```typescript
const app = await NestFactory.create(ApplicationModule);
app.enableCors();
await app.listen(3000);
```

`enableCors()`方法使用一个可选的配置对象参数。该对象的可用属性在其官方[CORS](https://github.com/expressjs/cors#configuration-options)文档中有所描述。

可选地，通过`create()`方法的选项对象使能`CORS`，设置`cors`属性为`true`来使能CORS的默认属性。可选地，传递一个[CORS配置对象](https://github.com/expressjs/cors#configuration-options)作为`cors`属性值来自定义其行为：

```typescript
const app = await NestFactory.create(ApplicationModule, { cors: true });
await app.listen(3000);
```

### `CSRF`保护

跨站点请求伪造（称为 `CSRF` 或 `XSRF`）是一种恶意利用网站，其中未经授权的命令从 `Web` 应用程序信任的用户传输。要减轻此类攻击，您可以使用 [csurf](https://github.com/expressjs/csurf) 软件包。首先，安装所需的包：

```bash
$ npm i --save csurf
```

?> 正如 `csurf` 中间件页面所解释的，`csurf` 模块需要首先初始化会话中间件或 `cookie` 解析器。有关进一步说明，请参阅该[文档](https://github.com/expressjs/csurf#csurf)。 

安装完成后，将其应用为全局中间件。

```typescript
import * as csurf from 'csurf';
// somewhere in your initialization file
app.use(csurf());
```

### 限速

为了保护您的应用程序免受暴力攻击，您必须实现某种速率限制。幸运的是，`NPM`上已经有很多各种中间件可用。其中之一是[express-rate-limit](https://github.com/nfriedly/express-rate-limit)。

```bash
$ npm i --save express-rate-limit
```

安装完成后，将其应用为全局中间件。

```typescript
import * as rateLimit from 'express-rate-limit';
// somewhere in your initialization file
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  }),
);
```
如果在服务器和以太网之间存在负载均衡或者反向代理，Express可能需要配置为信任proxy设置的头文件，从而保证最终用户得到正确的IP地址。要如此，首先使用`NestExpressApplication`平台[接口](https://docs.nestjs.com/first-steps#platform)来创建你的`app`实例，然后配置[trust proxy](https://expressjs.com/en/guide/behind-proxies.html)设置。

?> 提示: 如果您在 `FastifyAdapter` 下开发，请考虑使用 [fastify-rate-limit](https://github.com/fastify/fastify-rate-limit)。




### 译者署名

| 用户名 | 头像 | 职能 | 签名 |
|---|---|---|---|
| [@weizy0219](https://github.com/weizy0219)  | <img class="avatar-66 rm-style" height="70" src="https://avatars3.githubusercontent.com/u/19883738?s=60&v=4">  |  翻译  | 专注于TypeScript全栈、物联网和Python数据科学，[@weizhiyong](https://www.weizhiyong.com) |