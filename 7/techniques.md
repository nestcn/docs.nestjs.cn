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

对于 `@useguard(AuthGuard('local'))`，我们使用的是一个 `AuthGuard` ，它是在我们扩展护照-本地策略时 `@nestjs/passportautomatic` 为我们准备的。我们来分析一下。我们的 `Passport` 本地策略默认名为`"local"` 。我们在 `@UseGuards()` 装饰器中引用这个名称，以便将它与护照本地包提供的代码关联起来。这用于消除在应用程序中有多个 `Passport` 策略时调用哪个策略的歧义(每个策略可能提供一个特定于策略的 `AuthGuard` )。虽然到目前为止我们只有一个这样的策略，但我们很快就会添加第二个，所以这是消除歧义所需要的。

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

## 数据库

`Nest` 与数据库无关，允许您轻松地与任何 `SQL` 或 `NoSQL` 数据库集成。根据您的偏好，您有许多可用的选项。一般来说，将 `Nest` 连接到数据库只需为数据库加载一个适当的 `Node.js` 驱动程序，就像使用 [Express](https://expressjs.com/en/guide/database-integration.html) 或 `Fastify` 一样。

您还可以直接使用任何通用的 `Node.js` 数据库集成库或 `ORM` ，例如 [Sequelize (recipe)](https://www.npmjs.com/package/sequelize)、[knexjs](http://knexjs.org/) (tutorial)`和 [TypeORM](https://github.com/typeorm/typeorm) ，以在更高的抽象级别上进行操作。

为了方便起见，`Nest` 还提供了与现成的 `TypeORM` 与 `@nestjs/typeorm` 的紧密集成，我们将在本章中对此进行介绍，而与 `@nestjs/mongoose` 的紧密集成将在[这一章](https://docs.nestjs.cn/7/techniques?id=mongo)中介绍。这些集成提供了附加的特定于 `nestjs` 的特性，比如模型/存储库注入、可测试性和异步配置，从而使访问您选择的数据库更加容易。

### TypeORM 集成

为了与 `SQL`和 `NoSQL` 数据库集成，`Nest` 提供了 `@nestjs/typeorm` 包。`Nest` 使用[TypeORM](https://github.com/typeorm/typeorm)是因为它是 `TypeScript` 中最成熟的对象关系映射器( `ORM` )。因为它是用 `TypeScript` 编写的，所以可以很好地与 `Nest` 框架集成。

为了开始使用它，我们首先安装所需的依赖项。在本章中，我们将演示如何使用流行的 [Mysql](https://www.mysql.com/) ， `TypeORM` 提供了对许多关系数据库的支持，比如 `PostgreSQL` 、`Oracle`、`Microsoft SQL Server`、`SQLite`，甚至像 `MongoDB`这样的 `NoSQL` 数据库。我们在本章中介绍的过程对于 `TypeORM` 支持的任何数据库都是相同的。您只需为所选数据库安装相关的客户端 `API` 库。

```bash 
$ npm install --save @nestjs/typeorm typeorm mysql
```

安装过程完成后，我们可以将 `TypeOrmModule` 导入`AppModule` 。

> app.module.ts

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'test',
      entities: [],
      synchronize: true,
    }),
  ],
})
export class AppModule {}
```

 `forRoot()` 方法支持所有`TypeORM`包中`createConnection()`函数暴露出的配置属性。其他一些额外的配置参数描述如下：
 
 |参数|说明|
 |---|---|
 |retryAttempts|重试连接数据库的次数（默认：10）|
 |retryDelay|两次重试连接的间隔(ms)（默认：3000）|
 |autoLoadEntities|如果为`true`,将自动加载实体(默认：false)|
 |keepConnectionAlive|如果未`true`，在应用程序关闭后连接不会关闭（默认：false)|

?> 更多连接选项见[这里](https://typeorm.io/#/connection-options)

 另外，我们可以创建 `ormconfig.json` ，而不是将配置对象传递给 `forRoot()`。

```bash
{
  "type": "mysql",
  "host": "localhost",
  "port": 3306,
  "username": "root",
  "password": "root",
  "database": "test",
  "entities": ["dist/**/*.entity{.ts,.js}"],
  "synchronize": true
}
```

然后，我们可以不带任何选项地调用 `forRoot()` :

> app.module.ts

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forRoot()],
})
export class AppModule {}
```

?> 静态全局路径(例如 `dist/**/*.entity{ .ts,.js}` )不适用于Webpack热重载。

!> 注意，`ormconfig.json` 文件由`typeorm`库载入，因此，任何上述参数之外的属性都不会被应用（例如由`forRoot()`方法内部支持的属性--例如`autoLoadEntities`和`retryDelay()`)

一旦完成，`TypeORM` 的`Connection`和 `EntityManager` 对象就可以在整个项目中注入(不需要导入任何模块)，例如:

> app.module.ts

```typescript
import { Connection } from 'typeorm';

@Module({
  imports: [TypeOrmModule.forRoot(), PhotoModule],
})
export class AppModule {
  constructor(private readonly connection: Connection) {}
}
```

### 存储库模式

`TypeORM` 支持存储库设计模式，因此每个实体都有自己的存储库。可以从数据库连接获得这些存储库。

为了继续这个示例，我们需要至少一个实体。我们来定义`User` 实体。

> user.entity.ts

```typescript
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ default: true })
  isActive: boolean;
}
```
?> 关于实体的更多内容见[TypeORM 文档](https://typeorm.io/#/entities)。

该 `User` 实体在 `users` 目录下。这个目录包含了和 `UsersModule`模块有关的所有文件。你可以决定在哪里保存模型文件，但我们推荐在他们的**域**中就近创建，即在相应的模块目录中。

要开始使用 `user` 实体，我们需要在模块的`forRoot()`方法的选项中（除非你使用一个静态的全局路径）将它插入`entities`数组中来让 `TypeORM`知道它的存在。

> app.module.ts

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Photo } from './photo/photo.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'test',
      entities: [User],
      synchronize: true,
    }),
  ],
})
export class AppModule {}
```

现在让我们看一下 `UsersModule`：

> user.module.ts

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
```

此模块使用 `forFeature()` 方法定义在当前范围中注册哪些存储库。这样，我们就可以使用 `@InjectRepository()`装饰器将 `UsersRepository` 注入到 `UsersService` 中:

> users.service.ts

```typescript

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findOne(id: string): Promise<User> {
    return this.usersRepository.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
```

?> 不要忘记将 `UsersModule` 导入根 `AppModule`。

如果要在导入`TypeOrmModule.forFeature` 的模块之外使用存储库，则需要重新导出由其生成的提供程序。 您可以通过导出整个模块来做到这一点，如下所示：

> users.module.ts

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  exports: [TypeOrmModule]
})
export class UsersModule {}
```
现在，如果我们在 `UserHttpModule` 中导入 `UsersModule` ，我们可以在后一个模块的提供者中使用 `@InjectRepository(User)`。

> users-http.module.ts

```typescript
import { Module } from '@nestjs/common';
import { UsersModule } from './user.module';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  imports: [UsersModule],
  providers: [UsersService],
  controllers: [UsersController]
})
export class UserHttpModule {}

```
### 关系

关系是指两个或多个表之间的联系。关系基于每个表中的常规字段，通常包含主键和外键。

关系有三种：

|名称|说明|
|---|---|
|一对一|主表中的每一行在外部表中有且仅有一个对应行。使用`@OneToOne()`装饰器来定义这种类型的关系|
|一对多/多对一|主表中的每一行在外部表中有一个或多的对应行。使用`@OneToMany()`和`@ManyToOne()`装饰器来定义这种类型的关系|
|多对多|主表中的每一行在外部表中有多个对应行，外部表中的每个记录在主表中也有多个行。使用`@ManyToMany()`装饰器来定义这种类型的关系|

使用对应的装饰器来定义实体的关系。例如，要定义每个`User`可以有多个`Photo`，可以使用`@OneToMany()`装饰器。

>user.entity.ts

```typescript
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Photo } from '../photos/photo.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(type => Photo, photo => photo.user)
  photos: Photo[];
}

```
?> 要了解TypeORM中关系的内容，可以查看[TypeORM文档](https://typeorm.io/#/relations)。

### 自动载入实体

手动将实体一一添加到连接选项的`entities`数组中的工作会很无聊。此外，在根模块中涉及实体破坏了应用的域边界，并可能将应用的细节泄露给应用的其他部分。针对这一情况，可以使用静态全局路径（例如, dist/**/*.entity{.ts,.js})。

注意，`webpack`不支持全局路径，因此如果你要在单一仓库(Monorepo)中构建应用，可能不能使用全局路径。针对这一问题，有另外一个可选的方案。在配置对象的属性中(传递给`forRoot()`方法的)设置`autoLoadEntities`属性为`true`来自动载入实体，示意如下：

> app.module.ts

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...
      autoLoadEntities: true,
    }),
  ],
})
export class AppModule {}

```
通过配置这一选项，每个通过`forFeature()`注册的实体都会自动添加到配置对象的`entities`数组中。

?> 注意，那些没有通过`forFeature()`方法注册，而仅仅是在实体中被引用（通过关系）的实体不能通过`autoLoadEntities`配置被包含。

### 事务

数据库事务代表在数据库管理系统（DBMS）中针对数据库的一组操作，这组操作是有关的、可靠的并且和其他事务相互独立的。一个事务通常可以代表数据库中的任何变更（[了解更多](https://zh.wikipedia.org/wiki/%E6%95%B0%E6%8D%AE%E5%BA%93%E4%BA%8B%E5%8A%A1))。

在[TypeORM事务](https://typeorm.io/#/transactions)中有很多不同策略来处理事务，我们推荐使用`QueryRunner`类，因为它对事务是完全可控的。

首先，我们需要将`Connection`对象以正常方式注入：

```typescript
@Injectable()
export class UsersService {
  constructor(private connection: Connection) {}
}
```
?> `Connection`类需要从`typeorm`包中导入

现在，我们可以使用这个对象来创建一个事务。

```typescript
async createMany(users: User[]) {
  const queryRunner = this.connection.createQueryRunner();

  await queryRunner.connect();
  await queryRunner.startTransaction();
  try {
    await queryRunner.manager.save(users[0]);
    await queryRunner.manager.save(users[1]);

    await queryRunner.commitTransaction();
  } catch (err) {
    //如果遇到错误，可以回滚事务
    await queryRunner.rollbackTransaction();
  } finally {
    //你需要手动实例化并部署一个queryRunner
    await queryRunner.release();
  }
}
```
?> 注意`connection`仅用于创建`QueryRunner`。然而，要测试这个类，就需要模拟整个`Connection`对象（它暴露出来的几个方法），因此，我们推荐采用一个帮助工厂类（也就是`QueryRunnerFactory`)并且定义一个包含仅限于维持事务需要的方法的接口。这一技术让模拟这些方法变得非常直接。

可选地，你可以使用一个`Connection`对象的回调函数风格的`transaction`方法([阅读更多](https://typeorm.io/#/transactions/creating-and-using-transactions))。

```typescript
async createMany(users: User[]) {
  await this.connection.transaction(async manager => {
    await manager.save(users[0]);
    await manager.save(users[1]);
  });
}
```
不推荐使用装饰器来控制事务(`@Transaction()`和`@TransactionManager()`)。

### 订阅者

使用TypeORM[订阅者](https://typeorm.io/#/listeners-and-subscribers/what-is-a-subscriber)，你可以监听特定的实体事件。

```typescript
import {
  Connection,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm';
import { User } from './user.entity';

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<User> {
  constructor(connection: Connection) {
    connection.subscribers.push(this);
  }

  listenTo() {
    return User;
  }

  beforeInsert(event: InsertEvent<User>) {
    console.log(`BEFORE USER INSERTED: `, event.entity);
  }
}
```
!> 事件订阅者不能是[请求范围](https://docs.nestjs.com/fundamentals/injection-scopes)的。

现在，将`UserSubscriber`类添加到`providers`数组。

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserSubscriber } from './user.subscriber';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService, UserSubscriber],
  controllers: [UsersController],
})
export class UsersModule {}
```

?> 更多实体订阅者内容见[这里](https://typeorm.io/#/listeners-and-subscribers/what-is-a-subscriber)。

### 迁移

[迁移](https://typeorm.io/#/migrations)提供了一个在保存数据库中现有数据的同时增量升级数据库使其与应用中的数据模型保持同步的方法。TypeORM提供了一个专用[CLI命令行工具](https://typeorm.io/#/migrations/creating-a-new-migration)用于生成、运行以及回滚迁移。

迁移类和`Nest`应用源码是分开的。他们的生命周期由`TypeORM CLI`管理，因此，你不能在迁移中使用依赖注入和其他`Nest`专有特性。在[TypeORM文档](https://typeorm.io/#/migrations/creating-a-new-migration) 中查看更多关于迁移的内容。

### 多个数据库

某些项目可能需要多个数据库连接。这也可以通过本模块实现。要使用多个连接，首先要做的是创建这些连接。在这种情况下，连接命名成为必填项。

假设你有一个`Album` 实体存储在他们自己的数据库中。

```typescript
const defaultOptions = {
  type: 'postgres',
  port: 5432,
  username: 'user',
  password: 'password',
  database: 'db',
  synchronize: true,
};

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...defaultOptions,
      host: 'user_db_host',
      entities: [User],
    }),
    TypeOrmModule.forRoot({
      ...defaultOptions,
      name: 'albumsConnection',
      host: 'album_db_host',
      entities: [Album],
    }),
  ],
})
export class AppModule {}
```

?> 如果未为连接设置任何 `name` ，则该连接的名称将设置为 `default`。请注意，不应该有多个没有名称或同名的连接，否则它们会被覆盖。

此时，您的`User` 和 `Album` 实体中的每一个都已在各自的连接中注册。通过此设置，您必须告诉 `TypeOrmModule.forFeature()` 方法和 `@InjectRepository()` 装饰器应该使用哪种连接。如果不传递任何连接名称，则使用 `default` 连接。

```typescript
@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([Album], 'albumsConnection'),
  ],
})
export class AppModule {}
```

您也可以为给定的连接注入 `Connection` 或 `EntityManager`：

```typescript
@Injectable()
export class AlbumsService {
  constructor(
    @InjectConnection('albumsConnection')
    private connection: Connection,
    @InjectEntityManager('albumsConnection')
    private entityManager: EntityManager,
  ) {}
}
```

### 测试

在单元测试我们的应用程序时，我们通常希望避免任何数据库连接，从而使我们的测试适合于独立，并使它们的执行过程尽可能快。但是我们的类可能依赖于从连接实例中提取的存储库。那是什么？解决方案是创建假存储库。为了实现这一点，我们设置了[自定义提供者]。事实上，每个注册的存储库都由 `entitynamereposition` 标记表示，其中 `EntityName` 是实体类的名称。

`@nestjs/typeorm` 包提供了基于给定实体返回准备好 `token` 的 `getRepositoryToken()` 函数。

```typescript
@Module({
  providers: [
    UsersService,
    {
      provide: getRepositoryToken(User),
      useValue: mockRepository,
    },
  ],
})
export class UsersModule {}
```

现在, 将使用`mockRepository` 作为 `UsersRepository`。每当任何提供程序使用 `@InjectRepository()` 装饰器请求 `UsersRepository` 时, `Nest` 会使用注册的 `mockRepository` 对象。

### 定制存储库

`TypeORM` 提供称为自定义存储库的功能。要了解有关它的更多信息，请访问此[页面](https://typeorm.io/#/custom-repository)。基本上，自定义存储库允许您扩展基本存储库类，并使用几种特殊方法对其进行丰富。

要创建自定义存储库，请使用 `@EntityRepository()` 装饰器和扩展 `Repository` 类。

```typescript
@EntityRepository(Author)
export class AuthorRepository extends Repository<Author> {}
```

?>  `@EntityRepository()` 和 `Repository` 来自 `typeorm` 包。

创建类后，下一步是将实例化责任移交给 `Nest`。为此，我们必须将 `AuthorRepository` 类传递给 `TypeOrm.forFeature()` 函数。

```typescript
@Module({
  imports: [TypeOrmModule.forFeature([AuthorRepository])],
  controller: [AuthorController],
  providers: [AuthorService],
})
export class AuthorModule {}
```

之后，只需使用以下构造注入存储库：

```typescript
@Injectable()
export class AuthorService {
  constructor(private readonly authorRepository: AuthorRepository) {}
}
```

### 异步配置

通常，您可能希望异步传递模块选项，而不是事先传递它们。在这种情况下，使用 `forRootAsync()` 函数，提供了几种处理异步数据的方法。

第一种可能的方法是使用工厂函数：

```typescript
TypeOrmModule.forRootAsync({
  useFactory: () => ({
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: 'root',
    database: 'test',
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    synchronize: true,
  }),
});
```

我们的工厂的行为与任何其他异步提供者一样(例如，它可以是异步的，并且它能够通过`inject`注入依赖)。

```typescript
TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => ({
    type: 'mysql',
    host: configService.get<string>('HOST'),
    port: configService.get<string>('PORT'),
    username: configService.get<string>('USERNAME'),
    password: configService.get<string>('PASSWORD'),
    database: configService.get<string>('DATABASE'),
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    synchronize: true,
  }),
  inject: [ConfigService],
});
```

或者，您可以使用`useClass`语法。

```typescript
TypeOrmModule.forRootAsync({
  useClass: TypeOrmConfigService,
});
```

上面的构造将 `TypeOrmConfigService` 在内部进行实例化 `TypeOrmModule`，并将利用它来创建选项对象。在 `TypeOrmConfigService` 必须实现 `TypeOrmOptionsFactory` 的接口。

上面的构造将在`TypeOrmModule`内部实例化`TypeOrmConfigService`，并通过调用`createTypeOrmOptions()`

```typescript
@Injectable()
class TypeOrmConfigService implements TypeOrmOptionsFactory {
  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'test',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    };
  }
}
```

为了防止在 `TypeOrmModule` 中创建 `TypeOrmConfigService` 并使用从不同模块导入的提供程序，可以使用 `useExisting` 语法。

```typescript
TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  useExisting: ConfigService,
});
```
这个构造与 `useClass` 的工作原理相同，但有一个关键的区别 — `TypeOrmModule` 将查找导入的模块来重用现有的 `ConfigService`，而不是实例化一个新的 `ConfigService`。

### 示例

[这儿](https://github.com/nestjs/nest/tree/master/sample/05-sql-typeorm)有一个可用的例子。

### 序列化集成

另一个使用`TypeORM`的选择是使用`@nestjs/sequelize`包中的`Sequelize ROM`。额外地，我们使用`sequelize-typescript`包来提供一系列额外的装饰器以声明实体。

要开始使用它，我们首先安装需要的依赖。在本章中，我们通过流行的`MySQL`关系数据库来进行说明。序列化支持很多种关系数据库，例如`PostgreSQL`,`MySQL`,`Microsoft SQL Server`,`SQLite`以及`MariaDB`。本章中的步骤也适合其他任何序列化支持的数据库。你只要简单地安装所选数据库相应的客户端API库就可以。

```typescript
$ npm install --save @nestjs/sequelize sequelize sequelize-typescript mysql2
$ npm install --save-dev @types/sequelize
```

安装完成后，就可以将`SequelizeModule`导入到根`AppModule`中。

> app.module.ts

```typescript
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'test',
      models: [],
    }),
  ],
})
export class AppModule {}
```

`forRoot()`方法支持所有序列化构造器([了解更多](https://sequelize.org/v5/manual/getting-started.html#setting-up-a-connection))暴露的配置属性。下面是一些额外的配置属性。

|名称|说明|
|---|---|
|retryAttempts|尝试连接数据库的次数（默认：10）|
|retryDelay|两次连接之间间隔时间(ms)(默认：3000)|
|autoLoadModels|如果为`true`，模型将自动载入（默认:false)|
|keepConnectionAlive|如果为`true`，在应用关闭后连接将不会关闭（默认:false)|
|synchronize|如果为`true`，自动载入的模型将同步（默认：false）|

一旦这些完成了，`Sequelize`对象就可以注入到整个项目中（不需要在任何模块中再引入），例如：

> app.service.ts

```typescript
import { Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class AppService {
  constructor(private sequelize: Sequelize) {}
}
```
### 模型

序列化采用`活动记录(Active Record)`模式，在这一模式下，你可以使用模型类直接和数据库交互。要继续该示例，我们至少需要一个模型，让我们定义这个`User`模型：

>user.model.ts

```typescript
import { Column, Model, Table } from 'sequelize-typescript';

@Table
export class User extends Model<User> {
  @Column
  firstName: string;

  @Column
  lastName: string;

  @Column({ defaultValue: true })
  isActive: boolean;
}
```
?> 查看[更多](https://github.com/RobinBuschmann/sequelize-typescript#column)的可用装饰器。

`User`模型文件在`users`目录下。该目录包含了和`UsersModule`有关的所有文件。你可以决定在哪里保存模型文件，但我们推荐在他们的**域**中就近创建，即在相应的模块目录中。

要开始使用`User`模型，我们需要通过将其插入到`forRoot()`方法选项的`models`数组中来让序列化知道它的存在。

> app.module.ts

```typescript
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './users/user.model';

@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'test',
      models: [User],
    }),
  ],
})
export class AppModule {}
```
接下来我们看看`UsersModule`：

>users.module.ts

```typescript
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './user.model';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [SequelizeModule.forFeature([User])],
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
```

这个模块使用`forFeature()`方法来定义哪个模型被注册在当前范围中。我们可以使用`@InjectModel()`装饰器来把`UserModel`注入到`UsersService`中。

> users.service.ts

```typescript

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './user.model';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userModel.findAll();
  }

  findOne(id: string): Promise<User> {
    return this.userModel.findOne({
      where: {
        id,
      },
    });
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await user.destroy();
  }
}

```

?> 不要忘记在根`AppModule`中导入`UsersModule`。

如果你要在导入`SequelizeModule.forFreature`的模块之外使用存储库，你需要重新导出其生成的提供者。你可以像这样将整个模块导出：

> users.module.ts

```typescript
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './user.entity';

@Module({
  imports: [SequelizeModule.forFeature([User])],
  exports: [SequelizeModule]
})
export class UsersModule {}
```
现在如果我们在`UserHttpModule`中引入`UsersModule`，我们可以在后一个模块的提供者中使用`@InjectModel(User)`。

>users-http.module.ts

```typescript
import { Module } from '@nestjs/common';
import { UsersModule } from './user.module';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  imports: [UsersModule],
  providers: [UsersService],
  controllers: [UsersController]
})
export class UserHttpModule {}
```
### 关系

关系是指两个或多个表之间的联系。关系基于每个表中的常规字段，通常包含主键和外键。

关系有三种：

|名称|说明|
|---|---|
|一对一|主表中的每一行在外部表中有且仅有一个对应行。使用`@OneToOne()`装饰器来定义这种类型的关系|
|一对多/多对一|主表中的每一行在外部表中有一个或多的对应行。使用`@OneToMany()`和`@ManyToOne()`装饰器来定义这种类型的关系|
|多对多|主表中的每一行在外部表中有多个对应行，外部表中的每个记录在主表中也有多个行。使用`@ManyToMany()`装饰器来定义这种类型的关系|

使用对应的装饰器来定义实体的关系。例如，要定义每个`User`可以有多个`Photo`，可以使用`@HasMany()`装饰器。

> user.entity.ts

```typescript
import { Column, Model, Table, HasMany } from 'sequelize-typescript';
import { Photo } from '../photos/photo.model';

@Table
export class User extends Model<User> {
  @Column
  firstName: string;

  @Column
  lastName: string;

  @Column({ defaultValue: true })
  isActive: boolean;

  @HasMany(() => Photo)
  photos: Photo[];
}
```
?> 阅读[本章](https://github.com/RobinBuschmann/sequelize-typescript#model-association)了解更多关于序列化的内容。

### 自动载入模型

手动将模型一一添加到连接选项的`models`数组中的工作会很无聊。此外，在根模块中涉及实体破坏了应用的域边界，并可能将应用的细节泄露给应用的其他部分。针对这一情况，在配置对象的属性中(传递给`forRoot()`方法的)设置`autoLoadModels`和`synchronize`属性来自动载入模型，示意如下：

> app.module.ts

```typescript
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [
    SequelizeModule.forRoot({
      ...
      autoLoadModels: true,
      synchronize: true,
    }),
  ],
})
export class AppModule {}
```
通过配置这一选项，每个通过`forFeature()`注册的实体都会自动添加到配置对象的`models`数组中。

?> 注意，这不包含那些没有通过`forFeature()`方法注册，而仅仅是在实体中被引用（通过关系）的模型。

### 事务

数据库事务代表在数据库管理系统（DBMS）中针对数据库的一组操作，这组操作是有关的、可靠的并且和其他事务相互独立的。一个事务通常可以代表数据库中的任何变更（[了解更多](https://zh.wikipedia.org/wiki/%E6%95%B0%E6%8D%AE%E5%BA%93%E4%BA%8B%E5%8A%A1))。

在[序列化事务](https://sequelize.org/v5/manual/transactions.html)中有很多不同策略来处理事务，下面是一个管理事务的示例（自动回调）。

首先，我们需要将`Sequelize`对象以正常方式注入：

```typescript
@Injectable()
export class UsersService {
  constructor(private sequelize: Sequelize) {}
}
```
?> `Sequelize`类需要从`sequelize-typescript`包中导入

现在，我们可以使用这个对象来创建一个事务。

```typescript
async createMany() {
  try {
    await this.sequelize.transaction(async t => {
      const transactionHost = { transaction: t };

      await this.userModel.create(
          { firstName: 'Abraham', lastName: 'Lincoln' },
          transactionHost,
      );
      await this.userModel.create(
          { firstName: 'John', lastName: 'Boothe' },
          transactionHost,
      );
    });
  } catch (err) {
    // 一旦发生错误，事务会回滚
  }
}
```
?> 注意`Sequelize`仅用于开始一个事务。然而，要测试这个类，就需要模拟整个`Sequelize`对象（它暴露出来的几个方法），因此，我们推荐采用一个帮助工厂类（也就是`TransactionRunner`)并且定义一个包含仅限于维持事务需要的方法的接口。这一技术让模拟这些方法变得非常直接。

可选地，你可以使用一个`Connection`对象的回调函数风格的`transaction`方法([阅读更多](https://typeorm.io/#/transactions/creating-and-using-transactions))。

```typescript
async createMany(users: User[]) {
  await this.connection.transaction(async manager => {
    await manager.save(users[0]);
    await manager.save(users[1]);
  });
}
```
不推荐使用装饰器来控制事务(`@Transaction()`和`@TransactionManager()`)。

### 迁移

[迁移](https://typeorm.io/#/migrations)提供了一个在保存数据库中现有数据的同时增量升级数据库使其与应用中的数据模型保持同步的方法。序列化提供了一个专用[CLI命令行工具](https://sequelize.org/v5/manual/migrations.html#the-cli)用于生成、运行以及回滚迁移。

迁移类和`Nest`应用源码是分开的。他们的生命周期由`TypeORM CLI`管理，因此，你不能在迁移中使用依赖注入和其他`Nest`专有特性。在[序列化文档](hhttps://sequelize.org/v5/manual/migrations.html#the-cli) 中查看更多关于迁移的内容。

### 多个数据库

某些项目可能需要多个数据库连接。这也可以通过本模块实现。要使用多个连接，首先要做的是创建这些连接。在这种情况下，连接命名成为必填项。

假设你有一个`Album` 实体存储在他们自己的数据库中。

```typescript
const defaultOptions = {
  dialect: 'postgres',
  port: 5432,
  username: 'user',
  password: 'password',
  database: 'db',
  synchronize: true,
};

@Module({
  imports: [
    SequelizeModule.forRoot({
      ...defaultOptions,
      host: 'user_db_host',
      models: [User],
    }),
    SequelizeModule.forRoot({
      ...defaultOptions,
      name: 'albumsConnection',
      host: 'album_db_host',
      models: [Album],
    }),
  ],
})
export class AppModule {}
```

?> 如果未为连接设置任何 `name` ，则该连接的名称将设置为 `default`。请注意，不应该有多个没有名称或同名的连接，否则它们会被覆盖。

此时，您的`User` 和 `Album` 实体中的每一个都已在各自的连接中注册。通过此设置，您必须告诉 `SequelizeModule.forFeature()` 方法和 `@InjectRepository()` 装饰器应该使用哪种连接。如果不传递任何连接名称，则使用 `default` 连接。

```typescript
@Module({
  imports: [
    SequelizeModule.forFeature([User]),
    SequelizeModule.forFeature([Album], 'albumsConnection'),
  ],
})
export class AppModule {}
```

您也可以为给定的连接注入 `Sequelize`：

```typescript
@Injectable()
export class AlbumsService {
  constructor(
    @InjectConnection('albumsConnection')
    private sequelize: Sequelize,
  ) {}
}

```

### 测试

在单元测试我们的应用程序时，我们通常希望避免任何数据库连接，从而使我们的测试适合于独立，并使它们的执行过程尽可能快。但是我们的类可能依赖于从连接实例中提取的存储库。那是什么？解决方案是创建假模型。为了实现这一点，我们设置了[自定义提供者]。事实上，每个注册的模型都由 `<ModelName>Model` 令牌自动表示，其中 `ModelName` 是模型类的名称。

`@nestjs/sequelize` 包提供了基于给定模型返回准备好 `token` 的 `getModelToken()` 函数。

```typescript
@Module({
  providers: [
    UsersService,
    {
      provide: getModelToken(User),
      useValue: mockModel,
    },
  ],
})
export class UsersModule {}
```

现在, 将使用`mockModel` 作为 `UsersModel`。每当任何提供程序使用 `@InjectModel()` 装饰器请求 `UserModel` 时, `Nest` 会使用注册的 `mockModel` 对象。

### 异步配置

通常，您可能希望异步传递`SequelizeModule`选项，而不是事先静态传递它们。在这种情况下，使用 `forRootAsync()` 函数，提供了几种处理异步数据的方法。

第一种可能的方法是使用工厂函数：

```typescript
SequelizeModule.forRootAsync({
  useFactory: () => ({
    dialect: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: 'root',
    database: 'test',
    models: [],
  }),
});
```

我们的工厂的行为与任何其他[异步提供者](https://docs.nestjs.com/fundamentals/async-providers)一样(例如，它可以是异步的，并且它能够通过`inject`注入依赖)。

```typescript
SequelizeModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => ({
    dialect: 'mysql',
    host: configService.get<string>('HOST'),
    port: configService.get<string>('PORT'),
    username: configService.get<string>('USERNAME'),
    password: configService.get<string>('PASSWORD'),
    database: configService.get<string>('DATABASE'),
    models: [],
  }),
  inject: [ConfigService],
});
```

或者，您可以使用`useClass`语法。

```typescript
SequelizeModule.forRootAsync({
  useClass: SequelizeConfigService,
});
```

上面的构造将 `SequelizeConfigService` 在`SequelizeModule`内部进行实例化 ,并通过调用`createSequelizeOptions()`来创建一个选项对象。注意，这意味着 `SequelizeConfigService` 必须实现 `SequelizeOptionsFactory` 的接口。如下所示：

```typescript
@Injectable()
class SequelizeConfigService implements SequelizeOptionsFactory {
  createSequelizeOptions(): SequelizeModuleOptions {
    return {
      dialect: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'test',
      models: [],
    };
  }
}
```

为了防止在 `SequelizeModule` 中创建 `SequelizeConfigService` 并使用从不同模块导入的提供程序，可以使用 `useExisting` 语法。

```typescript
SequelizeModule.forRootAsync({
  imports: [ConfigModule],
  useExisting: ConfigService,
});
```
这个构造与 `useClass` 的工作原理相同，但有一个关键的区别 — `SequelizeModule` 将查找导入的模块来重用现有的 `ConfigService`，而不是实例化一个新的 `ConfigService`。

### 示例

[这儿](https://github.com/nestjs/nest/tree/master/sample/07-sequelize)有一个可用的例子。

## Mongo

`Nest`支持两种与 [MongoDB](http://www.mongodb.org/) 数据库集成的方式。既使用内置的[TypeORM](https://github.com/typeorm/typeorm) 提供的 MongoDB 连接器，或使用最流行的MongoDB对象建模工具 [Mongoose](http://mongoosejs.com/)。在本章后续描述中我们使用专用的`@nestjs/mongoose`包。

首先，我们需要安装所有必需的依赖项：

```bash
$ npm install --save @nestjs/mongoose mongoose
$ npm install --save-dev @types/mongoose
```

安装过程完成后，我们可以将其 `MongooseModule` 导入到根目录 `AppModule` 中。

> app.module.ts

```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [MongooseModule.forRoot('mongodb://localhost/nest')],
})
export class AppModule {}
```

该 `forRoot()` 和 [mongoose](http://mongoosejs.com/) 包中的 `mongoose.connect()` 一样的参数对象。[参见](https://mongoosejs.com/docs/connections.html)。

### 模型注入

在`Mongoose`中，一切都源于 [Scheme](http://mongoosejs.com/docs/guide.html)，每个 `Schema` 都会映射到 `MongoDB` 的一个集合，并定义集合内文档的结构。`Schema` 被用来定义模型，而模型负责从底层创建和读取 `MongoDB` 的文档。

`Schema` 可以用 `NestJS` 内置的装饰器来创建，或者也可以自己动手使用 `Mongoose`的常规方式。使用装饰器来创建 `Schema` 会极大大减少引用并且提高代码的可读性。

我们先定义`CatSchema`:

> schemas/cat.schema.ts

```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Cat extends Document {
  @Prop()
  name: string;

  @Prop()
  age: number;

  @Prop()
  breed: string;
}

export const CatSchema = SchemaFactory.createForClass(Cat);
```
> 注意你也可以通过使用 `DefinitionsFactory` 类（可以从 `@nestjs/mongoose` 导入）来生成一个原始 `Schema` ，这将允许你根据被提供的元数据手动修改生成的 `Schema` 定义。这对于某些很难用装饰器体现所有的极端例子非常有用。

`@Schema` 装饰器标记一个类作为`Schema` 定义，它将我们的 `Cat` 类映射到 `MongoDB` 同名复数的集合 `Cats`，这个装饰器接受一个可选的 `Schema` 对象。将它想象为那个你通常会传递给 `mongoose.Schema` 类的构造函数的第二个参数(例如, `new mongoose.Schema(_, options))`)。
更多可用的 `Schema` 选项可以 [看这里](https://mongoosejs.com/docs/guide.html#options)。

`@Prop` 装饰器在文档中定义了一个属性。举个例子，在上面的 `Schema` 定义中，我们定义了三个属性，分别是：`name` ，`age` 和 `品种`。得益于 `TypeScript` 的元数据（还有反射），这些属性的 [`Schema类型`](https://mongoosejs.com/docs/schematypes.html)会被自动推断。然而在更复杂的场景下，有些类型例如对象和嵌套数组无法正确推断类型，所以我们要向下面一样显式的指出。

```typescript
@Prop([String])
tags: string[];
```

另外的 `@Prop` 装饰器接受一个可选的参数，通过这个，你可以指示这个属性是否是必须的，是否需要默认值，或者是标记它作为一个常量，下面是例子：

```typescript
@Prop({ required: true })
name: string;
```
最后的，原始 `Schema` 定义也可以被传递给装饰器。这也非常有用，举个例子，一个属性体现为一个嵌套对象而不是一个定义的类。要使用这个，需要从像下面一样从 `@nestjs/mongoose` 包导入 `raw()`。

```typescript
@Prop(raw({
  firstName: { type: String },
  lastName: { type: String }
}))
details: Record<string, any>;
```

或者，如果你不喜欢使用装饰器，你可以使用 `mongoose.Schema` 手动定义一个 `Schema`。下面是例子：

> schemas/cat.schema.ts

```typescript
import * as mongoose from 'mongoose';

export const CatSchema = new mongoose.Schema({
  name: String,
  age: Number,
  breed: String,
});
```

该 `cat.schema` 文件在 `cats` 目录下。这个目录包含了和 `CatsModule`模块有关的所有文件。你可以决定在哪里保存`Schema`文件，但我们推荐在他们的**域**中就近创建，即在相应的模块目录中。

我们来看看`CatsModule`：

> cats.module.ts

```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';
import { CatSchema } from './schemas/cat.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Cat', schema: CatSchema }])],
  controllers: [CatsController],
  providers: [CatsService],
})
export class CatsModule {}
```

`MongooseModule`提供了`forFeature()`方法来配置模块，包括定义哪些模型应该注册在当前范围中。如果你还想在另外的模块中使用这个模型，将`MongooseModule`添加到`CatsModule`的`exports`部分并在其他模块中导入`CatsModule`。

注册`Schema`后，可以使用 `@InjectModel()` 装饰器将 `Cat` 模型注入到 `CatsService` 中:

> cats.service.ts

```typescript
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cat } from './interfaces/cat.interface';
import { CreateCatDto } from './dto/create-cat.dto';

@Injectable()
export class CatsService {
  constructor(@InjectModel('Cat') private catModel: Model<Cat>) {}

  async create(createCatDto: CreateCatDto): Promise<Cat> {
    const createdCat = new this.catModel(createCatDto);
    return createdCat.save();
  }

  async findAll(): Promise<Cat[]> {
    return this.catModel.find().exec();
  }
}

```

### 连接

有时你可能需要连接原生的[Mongoose连接](https://mongoosejs.com/docs/api.html#Connection)对象，你可能在连接对象中想使用某个原生的API。你可以使用如下的`@InjectConnection()`装饰器来注入Mongoose连接。

```typescript
import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class CatsService {
  constructor(@InjectConnection() private connection: Connection) {}
}

```
### 多数据库

有的项目需要多数据库连接，可以在这个模块中实现。要使用多连接，首先要创建连接，在这种情况下，*连接*必须**要有名称。

> app.module.ts

```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/test', {
      connectionName: 'cats',
    }),
    MongooseModule.forRoot('mongodb://localhost/users', {
      connectionName: 'users',
    }),
  ],
})
export class AppModule {}
```
?> 你不能在没有名称的情况下使用多连接，也不能对多连接使用同一个名称，否则会被覆盖掉。

在设置中，要告诉`MongooseModule.forFeature()`方法应该使用哪个连接。

```typescript
@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Cat', schema: CatSchema }], 'cats'),
  ],
})
export class AppModule {}
```

也可以向一个给定的连接中注入`Connection`。

```typescript
import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class CatsService {
  constructor(@InjectConnection('cats') private connection: Connection) {}
}
```
### 钩子（中间件）

中间件（也被称作预处理(pre)和后处理（post）钩子）是在执行异步函数时传递控制的函数。中间件是针对`Schema`层级的，在写插件([源码](https://mongoosejs.com/docs/middleware.html))时非常有用。在Mongoose编译完模型后使用`pre()`或`post()`不会起作用。要在模型注册前注册一个钩子，可以在使用一个工厂提供者（例如 `useFactory`）是使用`MongooseModule`中的`forFeatureAsync()`方法。使用这一技术，你可以访问一个Schema对象，然后使用`pre()`或`post()`方法来在那个schema中注册一个钩子。示例如下：

```typescript
@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: 'Cat',
        useFactory: () => {
          const schema = CatsSchema;
          schema.pre('save', () => console.log('Hello from pre save'));
          return schema;
        },
      },
    ]),
  ],
})
export class AppModule {}
```
和其他[工厂提供者](https://docs.nestjs.com/fundamentals/custom-providers#factory-providers-usefactory)一样，我们的工厂函数是异步的，可以通过`inject`注入依赖。

```typescript
@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: 'Cat',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => {
          const schema = CatsSchema;
          schema.pre('save', () =>
            console.log(
              `${configService.get<string>('APP_NAME')}: Hello from pre save`,
            ),
          );
          return schema;
        },
        inject: [ConfigService],
      },
    ]),
  ],
})
export class AppModule {}

```
### 插件

要向给定的schema中注册[插件](https://mongoosejs.com/docs/plugins.html)，可以使用`forFeatureAsync()`方法。

```typescript
@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: 'Cat',
        useFactory: () => {
          const schema = CatsSchema;
          schema.plugin(require('mongoose-autopopulate'));
          return schema;
        },
      },
    ]),
  ],
})
export class AppModule {}
```
要向所有schema中立即注册一个插件，调用`Connection`对象中的`.plugin()`方法。你可以在所有模型创建前访问连接。使用`connectionFactory`来实现：

> app.module.ts

```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/test', {
      connectionFactory: (connection) => {
        connection.plugin(require('mongoose-autopopulate'));
        return connection;
      }
    }),
  ],
})
export class AppModule {}
```

### 测试

在单元测试我们的应用程序时，我们通常希望避免任何数据库连接，使我们的测试套件独立并尽可能快地执行它们。但是我们的类可能依赖于从连接实例中提取的模型。如何处理这些类呢？解决方案是创建模拟模型。

为了简化这一过程，`@nestjs/mongoose` 包公开了一个 `getModelToken()` 函数，该函数根据一个 `token` 名称返回一个准备好的`[注入token](https://docs.nestjs.com/fundamentals/custom-providers#di-fundamentals)`。使用此 `token`，你可以轻松地使用任何标准[自定义提供者](https://docs.nestjs.com/fundamentals/custom-providers)技术，包括 `useClass`、`useValue` 和 `useFactory`。例如:

```typescript
@@Module({
  providers: [
    CatsService,
    {
      provide: getModelToken('Cat'),
      useValue: catModel,
    },
  ],
})
export class CatsModule {}
```

在本例中，每当任何使用者使用 `@InjectModel()` 装饰器注入模型时，都会提供一个硬编码的 `Model<Cat>` (对象实例)。

### 异步配置

通常，您可能希望异步传递模块选项，而不是事先传递它们。在这种情况下，使用 `forRootAsync()` 方法，`Nest`提供了几种处理异步数据的方法。

第一种可能的方法是使用工厂函数：

```typescript
MongooseModule.forRootAsync({
  useFactory: () => ({
    uri: 'mongodb://localhost/nest',
  }),
});
```

与其他工厂提供程序一样，我们的工厂函数可以是异步的，并且可以通过注入注入依赖。

```typescript
MongooseModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => ({
    uri: configService.getString('MONGODB_URI'),
  }),
  inject: [ConfigService],
});
```

或者，您可以使用类而不是工厂来配置 `MongooseModule`，如下所示:

```typescript
MongooseModule.forRootAsync({
  useClass: MongooseConfigService,
});
```

上面的构造在 `MongooseModule`中实例化了 `MongooseConfigService`，使用它来创建所需的 `options` 对象。注意，在本例中，`MongooseConfigService` 必须实现 `MongooseOptionsFactory` 接口，如下所示。 `MongooseModule` 将在提供的类的实例化对象上调用 `createMongooseOptions()` 方法。

```typescript
@Injectable()
class MongooseConfigService implements MongooseOptionsFactory {
  createMongooseOptions(): MongooseModuleOptions {
    return {
      uri: 'mongodb://localhost/nest',
    };
  }
}
```

为了防止 `MongooseConfigService` 内部创建 `MongooseModule` 并使用从不同模块导入的提供程序，您可以使用 `useExisting` 语法。

```typescript
MongooseModule.forRootAsync({
  imports: [ConfigModule],
  useExisting: ConfigService,
});
```
### 例子

一个可用的示例见[这里](https://github.com/nestjs/nest/tree/master/sample/06-mongoose)。

## 配置

应用程序通常在不同的**环境**中运行。根据环境的不同，应该使用不同的配置设置。例如，通常本地环境依赖于特定的数据库凭据，仅对本地DB实例有效。生产环境将使用一组单独的DB凭据。由于配置变量会更改，所以最佳实践是将[配置变量](https://12factor.net/config)存储在环境中。

外部定义的环境变量通过 `process.env global` 在` Node.js` 内部可见。 我们可以尝试通过在每个环境中分别设置环境变量来解决多个环境的问题。 这会很快变得难以处理，尤其是在需要轻松模拟或更改这些值的开发和测试环境中。

在 `Node.js` 应用程序中，通常使用 `.env` 文件，其中包含键值对，其中每个键代表一个特定的值，以代表每个环境。 在不同的环境中运行应用程序仅是交换正确的`.env` 文件的问题。

在 `Nest` 中使用这种技术的一个好方法是创建一个 `ConfigModule` ，它暴露一个 `ConfigService` ，根据 `$NODE_ENV` 环境变量加载适当的 `.env` 文件。虽然您可以选择自己编写这样的模块，但为方便起见，Nest提供了开箱即用的`@ nestjs/config`软件包。 我们将在本章中介绍该软件包。

### 安装

要开始使用它，我们首先安装所需的依赖项。

```bash
$ npm i --save @nestjs/config
```

?> **注意**  `@nestjs/config` 内部使用 [dotenv](https://github.com/motdotla/dotenv) 实现。

### 开始使用

安装完成之后，我们需要导入`ConfigModule`模块。通常，我们在根模块`AppModule`中导入它，并使用`。forRoot()`静态方法导入它的配置。

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot()],
})
export class AppModule {}
```

上述代码将从默认位置（项目根目录）载入并解析一个`.env`文件，从`.env`文件和`process.env`合并环境变量键值对，并将结果存储到一个可以通过`ConfigService`访问的私有结构。`forRoot()`方法注册了`ConfigService`提供者，后者提供了一个`get()`方法来读取这些解析/合并的配置变量。由于`@nestjs/config`依赖[dotenv](https://github.com/motdotla/dotenv)，它使用该包的规则来处理冲突的环境变量名称。当一个键同时作为环境变量（例如，通过操作系统终端如`export DATABASE_USER=test`导出）存在于运行环境中以及`.env`文件中时，以运行环境变量优先。

一个样例`.env`文件看起来像这样:

```json
DATABASE_USER=test
DATABASE_PASSWORD=test

#### 自定义 env 文件路径

默认情况下，程序在应用程序的根目录中查找`.env`文件。 要为`.env`文件指定另一个路径，请配置`forRoot()`的配置对象envFilePath属性(可选)，如下所示：


```typescript	```typescript
import { Module } from '@nestjs/common';	ConfigModule.forRoot({
import { ConfigService } from './config.service';	  envFilePath: '.development.env',
});
```

您还可以像这样为.env文件指定多个路径：

```typescript
ConfigModule.forRoot({
  envFilePath: ['.env.development.local', '.env.development'],
});
```

如果在多个文件中发现同一个变量，则第一个变量优先。

#### 禁止加载环境变量

如果您不想加载.env文件，而是想简单地从运行时环境访问环境变量（如OS shell导出，例如`export DATABASE_USER = test`），则将`options`对象的`ignoreEnvFile`属性设置为`true`，如下所示 ：

```typescript
ConfigModule.forRoot({
  ignoreEnvFile: true,
});
```

#### 全局使用

当您想在其他模块中使用`ConfigModule`时，需要将其导入（这是任何Nest模块的标准配置）。 或者，通过将`options`对象的`isGlobal`属性设置为`true`，将其声明为[全局模块](https://docs.nestjs.cn/7/modules?id=全局模块)，如下所示。 在这种情况下，将`ConfigModule`加载到根模块（例如`AppModule`）后，您无需在其他模块中导入它。

```typescript
ConfigModule.forRoot({
  isGlobal: true,
});
```

#### 自定义配置文件

对于更复杂的项目，您可以利用自定义配置文件返回嵌套的配置对象。 这使您可以按功能对相关配置设置进行分组（例如，与数据库相关的设置），并将相关设置存储在单个文件中，以帮助独立管理它们

自定义配置文件导出一个工厂函数，该函数返回一个配置对象。配置对象可以是任意嵌套的普通JavaScript对象。`process.env`对象将包含完全解析的环境变量键/值对（具有如上所述的`.env`文件和已解析和合并的外部定义变量）。因为您控制了返回的配置对象，所以您可以添加任何必需的逻辑来将值转换为适当的类型、设置默认值等等。例如:

```typescript
@@filename(config/configuration)
export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432
  }
});
```

我们使用传递给`ConfigModule.forRoot()`方法的options对象的`load`属性来加载这个文件:

```typescript
import configuration from './config/configuration';
@Module({	@Module({
  providers: [	  imports: [
    {	    ConfigModule.forRoot({
      provide: ConfigService,	      load: [configuration],
      useValue: new ConfigService(`${process.env.NODE_ENV || 'development'}.env`),	    }),
    },	
  ],	  ],
  exports: [ConfigService],	
})	})
export class ConfigModule {}	export class AppModule {}
```	```


`ConfigModule` 注册一个 `ConfigService` ，并将其导出为在其他消费模块中可见。此外，我们使用 `useValue` 语法(参见自定义提供程序)来传递到 `.env` 文件的路径。此路径将根据 `NODE_ENV` 环境变量中包含的实际执行环境而不同(例如，'开发'、'生产'等)。	> info **注意** 分配给`load`属性的值是一个数组，允许您加载多个配置文件 (e.g. `load: [databaseConfig, authConfig]`)
### 使用 `ConfigService`


现在您可以简单地在任何地方注入 `ConfigService` ，并根据传递的密钥检索特定的配置值。	要从 `ConfigService` 访问环境变量，我们需要注入它。因此我们首先需要导入该模块。与任何提供程序一样，我们需要将其包含模块`ConfigModule`导入到将使用它的模块中（除非您将传递给`ConfigModule.forRoot()`方法的options对象中的`isGlobal`属性设置为`true`）。 如下所示将其导入功能模块。


> development.env	```typescript
feature.module.ts
@Module({
  imports: [ConfigModule],
  ...
})
```	```
DATABASE_USER = test;	
DATABASE_PASSWORD = test;	然后我们可以使用标准的构造函数注入:

```typescript
constructor(private configService: ConfigService) {}
```	```


### 使用 ConfigService	并在我们的类中使用它:


要从 `ConfigService` 访问环境变量，我们需要注入它。因此我们首先需要导入该模块。	```typescript
// get an environment variable
const dbUser = this.configService.get<string>('DATABASE_USER');
> app.module.ts	// get a custom configuration value
const dbHost = this.configService.get<string>('database.host');
```

如上所示，使用`configService.get()`方法通过传递变量名来获得一个简单的环境变量。您可以通过传递类型来执行TypeScript类型提示，如上所示(例如，`get<string>(…)`)。`get()`方法还可以遍历一个嵌套的自定义配置对象(通过自定义配置文件创建，如上面的第二个示例所示)。`get()`方法还接受一个可选的第二个参数，该参数定义一个默认值，当键不存在时将返回该值，如下所示:

```typescript
// use "localhost" when "database.host" is not defined
const dbHost = this.configService.get<string>('database.host', 'localhost');
```

#### 配置命名空间

`ConfigModule`模块允许您定义和加载多个自定义配置文件，如上面的自定义配置文件所示。您可以使用嵌套的配置对象来管理复杂的配置对象层次结构，如本节所示。或者，您可以使用`registerAs()`函数返回一个“带名称空间”的配置对象，如下所示:


```typescript	```typescript
@@filename(config/database.config)
export default registerAs('database', () => ({
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT || 5432
}));
```

与自定义配置文件一样，在您的`registerAs()`工厂函数内部，`process.env`对象将包含完全解析的环境变量键/值对（带有`.env`文件和已定义并已合并的外部定义变量)

> info **注意** `registerAs` 函数是从 `@nestjs/config` 包导出的。
使用`forRott()`的`load`方法载入命名空间的配置，和载入自定义配置文件方法相同：

```typescript
import databaseConfig from './config/database.config';
@Module({	@Module({
  imports: [ConfigModule],	  imports: [
  ...	    ConfigModule.forRoot({
      load: [databaseConfig],
    }),
  ],
})	})
export class AppModule {}
```	```


然后我们可以使用标准的构造函数注入，并在我们的类中使用它:	现在，要从数据库命名空间获取`host`的值，请使用符号`.`。使用`'database'`作为属性名称的前缀，该属性名称对应于命名空间的名称（作为传递给`registerAs()`函数的第一个参数）


> app.service.ts	
```typescript
const dbHost = this.configService.get<string>('database.host');
```

一个合理的替代方案是直接注入`'database'`的命名空间，我们将从强类型中获益：


```typescript
import { Injectable } from '@nestjs/common';	constructor(
import { ConfigService } from './config/config.service';	  @Inject(databaseConfig.KEY)
  private databaseConfig: ConfigType<typeof databaseConfig>,
) {}
```

?> info **注意** ` ConfigType` 函数是从 `@nestjs/config` 包导出的。

```typescript

@Injectable()
export class AppService {	
  private isAuthEnabled: boolean;	#### 部分注册
  constructor(config: ConfigService) {	
    // Please take note that this check is case sensitive!	到目前为止，我们已经使用`forRoot()`方法在根模块(例如，`AppModule`)中处理了配置文件。也许您有一个更复杂的项目结构，其中特定于功能的配置文件位于多个不同的目录中。与在根模块中加载所有这些文件不同，`@nestjs/config`包提供了一个称为部分注册的功能，它只引用与每个功能模块相关联的配置文件。使用特性模块中的`forFeature()`静态方法来执行部分注册，如下所示:
    this.isAuthEnabled = config.get('IS_AUTH_ENABLED') === 'true';	
  }	```typescript
import databaseConfig from './config/database.config';
@Module({
  imports: [ConfigModule.forFeature(databaseConfig)],
})
export class DatabaseModule {}
```	```


?> 您可以选择将 `ConfigModule` 声明为全局模块，而不是在每个模块中导入 `ConfigModule`。	> info **警告**在某些情况下，您可能需要使用`onModuleInit()`钩子通过部分注册来访问加载的属性，而不是在构造函数中。这是因为` forFeature() `方法是在模块初始化期间运行的，而模块初始化的顺序是不确定的。如果您以这种方式访问由另一个模块在构造函数中加载的值，则配置所依赖的模块可能尚未初始化。`onModuleInit() `方法只在它所依赖的所有模块被初始化之后运行，因此这种技术是安全的

### `Schema`验证

一个标准实践是如果在应用启动过程中未提供需要的环境变量或它们不满足特定的验证规则时抛出异常。`@nestjs/config`包让我们可以使用[Joi npm包](https://github.com/hapijs/joi)来提供这种类型验证。使用Joi,你可以定义一个对象`Schema`对象并验证对应的`JavaScript`对象。

> warning **注意** 最新版本的“@hapi/joi”要求您运行Node v12或更高版本。对于较老版本的node，请安装“v16.1.8”。这主要是在“v17.0.2”发布之后，它会在构建期间导致错误。更多信息请参考[他们的文档](https://hapi.dev/family/joi/?v=17.0.2#install)和[github issue](https://github.com/hapijs/joi/issues/2266#issuecomment-571667769)
> config.service.ts	现在，我们可以定义一个Joi验证模式，并通过`forRoot()`方法的`options`对象的`validationSchema`属性传递它，如下所示


```typescript	```typescript
import * as dotenv from 'dotenv';	app.module.ts
import * as Joi from '@hapi/joi';	import * as Joi from '@hapi/joi';
import * as fs from 'fs';	
export type EnvConfig = Record<string, string>;	@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test', 'provision')
          .default('development'),
        PORT: Joi.number().default(3000),
      }),
    }),
  ],
})
export class AppModule {}
```


export class ConfigService {	由于我们为 `NODE_ENV` 和 `PORT` 设置了默认值，因此如果不在环境文件中提供这些变量，验证将不会失败。然而, 我们需要明确提供 `API_AUTH_ENABLED`。如果我们的 `.env` 文件中的变量不是模式（ `schema` ）的一部分, 则验证也会引发错误。此外，`Joi` 还会尝试将 `env` 字符串转换为正确的类型。
  private readonly envConfig: EnvConfig;	


  constructor(filePath: string) {	默认情况下，允许使用未知的环境变量(其键不在模式中出现的环境变量)，并且不会触发验证异常。默认情况下，将报告所有验证错误。您可以通过通过`forRoot()` options对象的`validationOptions`键传递一个options对象来更改这些行为。此选项对象可以包含由Joi验证选项提供的任何标准验证选项属性。例如，要反转上面的两个设置，像这样传递选项:

> app.module.ts

```typescript
import * as Joi from '@hapi/joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test', 'provision')
          .default('development'),
        PORT: Joi.number().default(3000),
      }),
      validationOptions: {
        allowUnknown: false,
        abortEarly: true,
      },
    }),
  ],
})
export class AppModule {}
```
`@nestjs/config`包使用默认设置：
- `allowUnknown`:控制是否允许环境变量中未知的键。默认为`true`。
- `abortEarly`:如果为`true`，在遇到第一个错误时就停止验证；如果为`false`，返回所有错误。默认为`false`。

注意，一旦您决定传递`validationOptions`对象，您没有显式传递的任何设置都将默认为`Joi`标准默认值(而不是`@nestjs/config`默认值)。例如，如果在自定义`validationOptions`对象中保留`allowUnknowns`未指定，它的`Joi`默认值将为`false`。因此，在自定义对象中指定这两个设置可能是最安全的。

#### 自定义 `getter` 函数

`ConfigService`定义了一个通用的`get()`方法来通过键检索配置值。我们还可以添加`getter`函数来启用更自然的编码风格:


```typescript	```typescript
get isApiAuthEnabled(): boolean {	@Injectable()
  return Boolean(this.envConfig.API_AUTH_ENABLED);	export class ApiConfigService {
  constructor(private configService: ConfigService) {}
  get isAuthEnabled(): boolean {
    return this.configService.get('AUTH_ENABLED') === 'true';
  }
}	}
```	@@switch
@Dependencies(ConfigService)
@Injectable()
export class ApiConfigService {
  constructor(configService) {
    this.configService = configService;
  }
现在我们可以像下面这样使用getter函数:	  get isAuthEnabled() {
    return this.configService.get('AUTH_ENABLED') === 'true';
  }
}
```


> app.service.ts	现在我们可以像下面这样使用`getter`函数:


```typescript
app.service.ts
@Injectable()	@Injectable()
export class AppService {	export class AppService {
  constructor(config: ConfigService) {	  constructor(apiConfigService: ApiConfigService) {
    if (config.isApiAuthEnabled) {	    if (apiConfigService.isAuthEnabled) {
      // Authorization is enabled	      // Authentication is enabled
    }	    }
  }	  }
}	}
```	

#### 扩展变量

`@nestjs/config`包支持环境变量扩展。使用这种技术，您可以创建嵌套的环境变量，其中一个变量在另一个变量的定义中引用。例如:

```json
APP_URL=mywebsite.com
SUPPORT_EMAIL=support@${APP_URL}
```

通过这种构造，变量`SUPPORT_EMAIL`解析为`support@mywebsite.com`。注意${…}语法来触发解析变量`APP_URL`在`SUPPORT_EMAIL`定义中的值。



> info **提示** 对于这个特性，@nestjs/config包内部使用[dotenv-expand](https://github.com/motdotla/dotenv-expand)实现。
使用传递给`ConfigModule`的`forRoot()`方法的options对象中的`expandVariables`属性来启用环境变量展开，如下所示:

```typescript
app.module.ts
@Module({
  imports: [
    ConfigModule.forRoot({
      // ...
      expandVariables: true,
    }),
  ],
})
export class AppModule {}
```



在`main.ts`中使用

虽然我们的配置是存储在服务中的，但它仍然可以在main.ts文件中使用。通过这种方式，您可以使用它来存储诸如应用程序端口或CORS主机之类的变量。

要访问它，您必须使用`app.get()`方法，然后是服务引用：

```typescript
const configService = app.get(ConfigService);
```

然后你可以像往常一样使用它，通过调用带有配置键的get方法：

```typescript
const port = configService.get('PORT');
```

## 验证

验证网络应用中传递的任何数据是一种最佳实践。为了自动验证传入请求，`Nest`提供了几个开箱即用的管道。

- `ValidationPipe`
- `ParseIntPipe`
- `ParseBoolPipe`
- `ParseArrayPipe`
- `ParseUUIDPipe`

验证是任何现有 `Web` 应用程序的基本功能。为了自动验证传入请求，`Nest` 提供了一个内置的 `ValidationPipe` ，它使用了功能强大的[class-validator](https://github.com/typestack/class-validator)包及其声明性验证装饰器。 `ValidationPipe` 提供了一种对所有传入的客户端有效负载强制执行验证规则的便捷方法，其中在每个模块的本地类/ `DTO` 声明中使用简单的注释声明特定的规则。

### 概览

在 [Pipes](/7/pipes.md) 一章中，我们完成了构建简化验证管道的过程。为了更好地了解我们在幕后所做的工作，我们强烈建议您阅读本文。在这里，我们将重点讨论 `ValidationPipe` 的各种实际用例，并使用它的一些高级定制特性。

### 使用内置的`ValidationPipe`

?> `ValidationPipe`从`@nestjs/common`包导入。

由于此管道使用了`class-validator`和`class-transformer`库，因此有许多可用的选项。通过传递给管道的配置对象来进行配置。依照下列内置的选项：

```typescript
export interface ValidationPipeOptions extends ValidatorOptions {
  transform?: boolean;
  disableErrorMessages?: boolean;
  exceptionFactory?: (errors: ValidationError[]) => any;
}
```
所有可用的`class-validator`选项（继承自`ValidatorOptions`接口）：

|选项|类型|描述|
|---|---|---|
|skipMissingProperties|boolean|如果设置为`true`，验证将跳过对所有验证对象中没有的属性的验证|
|whitelist|boolean|如果设置为`true`，验证器将去掉没有使用任何验证装饰器的属性的验证（返回的）对象|
|forbidNonWhitelisted|boolean|如果设置为`true`，验证器不会去掉非白名单的属性，而是会抛出异常|
|forbidUnknownValues|boolean|如果设置为`true`，尝试验证未知对象会立即失败|
|disableErrorMessage|boolean|如果设置为`true`,验证错误不会返回给客户端|
|errorHttpStatusCode|number|这个设置允许你确定在错误时使用哪个异常类型。默认抛出`BadRequestException`|
|exceptionFactory|Function|接受一个验证错误数组并返回一个要抛出的异常对象|
|groups|string[]|验证对象时使用的分组|
|dismissDefaultMessages|boolean|如果设置为`true`，将不会使用默认消息验证，如果不设置，错误消息会始终是`undefined`|
|validationError.target|boolean|确定目标是否要在`ValidationError`中暴露出来|
|validationError.value|boolean|确定验证值是否要在`ValidationError`中暴露出来|

?> 更多关于`class-validator`包的内容见项目[仓库](https://github.com/typestack/class-validator)。

### 自动验证

为了本教程的目的，我们将绑定 `ValidationPipe` 到整个应用程序，因此，将自动保护所有接口免受不正确的数据的影响。

```typescript
async function bootstrap() {
  const app = await NestFactory.create(ApplicationModule);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);
}
bootstrap();
```

要测试我们的管道，让我们创建一个基本接口。

```typescript
@Post()
create(@Body() createUserDto: CreateUserDto) {
  return 'This action adds a new user';
}
```

?> 由于`Typescript`没有保存`泛型或接口`的元数据。当你在你的DTO中使用他们的时候。`ValidationPipe`可能不能正确验证输入数据。出于这种原因，可以考虑在你的DTO中使用具体的类。

现在我们可以在 `CreateUserDto` 中添加一些验证规则。我们使用 `class-validator` 包提供的装饰器来实现这一点，[这里](https://github.com/typestack/class-validator#validation-decorators)有详细的描述。以这种方式，任何使用 `CreateUserDto` 的路由都将自动执行这些验证规则。

```typescript
import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}
```

有了这些规则，当某人使用无效 email 执行对我们的接口的请求时，则应用程序将自动以 `400 Bad Request` 代码以及以下响应正文进行响应：

```bash
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": ["email must be an email"]
}
```

除了验证请求主体之外，`ValidationPipe` 还可以与其他请求对象属性一起使用。假设我们希望接受端点路径中的 `id` 。为了确保此请求参数只接受数字，我们可以使用以下结构:

```typescript
@Get(':id')
findOne(@Param() params: FindOneParams) {
  return 'This action returns a user';
}
```

与 `DTO` 一样，`FindOneParams` 只是一个使用 `class-validator` 定义验证规则的类。它是这样的:

```typescript
import { IsNumberString } from 'class-validator';

export class FindOneParams {
  @IsNumberString()
  id: number;
}
```

### 禁用详细错误

错误消息有助于解释请求中的错误。然而，一些生产环境倾向于禁用详细的错误。通过向 `ValidationPipe` 传递一个 `options` 对象来做到这一点:

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    disableErrorMessages: true,
  })
);
```

现在，不会将错误消息返回给最终用户。

### 剥离属性

我们的 `ValidationPipe` 还可以过滤掉方法处理程序不应该接收的属性。在这种情况下，我们可以对可接受的属性进行白名单，白名单中不包含的任何属性都会自动从结果对象中删除。例如，如果我们的处理程序需要 `email` 和 `password`，但是一个请求还包含一个 `age` 属性，那么这个属性可以从结果 `DTO` 中自动删除。要启用这种行为，请将白名单设置为 `true` 。

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
  })
);
```

当设置为 `true` 时，这将自动删除非白名单属性(在验证类中没有任何修饰符的属性)。

或者，您可以在出现非白名单属性时停止处理请求，并向用户返回错误响应。要启用此选项，请将 `forbidNonWhitelisted` 选项属性设置为 `true` ，并将白名单设置为 `true`。 

### 负载对象转换(Transform)

来自网络的有效负载是普通的 `JavaScript` 对象。`ValidationPipe` 可以根据对象的 `DTO` 类自动将有效负载转换为对象类型。若要启用自动转换，请将`transform`设置为 `true`。这可以在方法级别使用：

> cats.control.ts

```typescript
@Post()
@UsePipes(new ValidationPipe({ transform: true }))
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}
```
要全局使能这一行为，将选项设置到一个全局管道中：

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    transform: true,
  })
);
```
要使能自动转换选项，`ValidationPipe`将执行简单类型转换。在下述示例中，`findOne()`方法调用一个从地址参数中解析出的`id`参数。

```typescript
@Get(':id')
findOne(@Param('id') id: number) {
  console.log(typeof id === 'number'); // true
  return 'This action returns a user';
}

```

默认地，每个地址参数和查询参数在网络传输时都是`string`类型。在上述示例中，我们指定`id`参数为`number`（在方法签名中）。因此，`ValidationPipe`会自动将`string`类型转换为`number`。

### 显式转换

在上述部分，我们演示了`ValidationPipe`如何基于期待类型隐式转换查询和路径参数，然而，这一特性需要开启自动转换功能。

可选地（在不开启自动转换功能的情况下），你可以使用`ParseIntPipe`或者`ParseBoolPipe`显式处理值（注意，没有必要使用`ParseStringPipe`，这是因为如前所述的，网络中传输的路径参数和查询参数默认都是`string`类型）。

```typescript
@Get(':id')
findOne(
  @Param('id', ParseIntPipe) id: number,
  @Query('sort', ParseBoolPipe) sort: boolean,
) {
  console.log(typeof id === 'number'); // true
  console.log(typeof sort === 'boolean'); // true
  return 'This action returns a user';
}

```
?> `ParseIntPipe`和`ParseBoolPipe`从`@nestjs/common`包中导出。

### 转换和验证数组

`TypeScript`不存储泛型或接口的元数据，因此当你在DTO中使用它们的时候，`ValidationPipe`可能不能正确验证输入数据。例如，在下列代码中，`createUserDto`不能正确验证。

```typescript
@Post()
createBulk(@Body() createUserDtos: CreateUserDto[]) {
  return 'This action adds new users';
}
```
要验证数组，创建一个包裹了该数组的专用类，或者使用`ParseArrayPipe`。

```typescript
@Post()
createBulk(
  @Body(new ParseArrayPipe({ items: CreateUserDto }))
  createUserDtos: CreateUserDto[],
) {
  return 'This action adds new users';
}
```

此外，`ParseArrayPipe`可能需要手动解析查询参数。让我们考虑一个返回作为查询参数传递的标识的`users`的`findByIds()`方法：

```typescript
@Get()
findByIds(
  @Query('id', new ParseArrayPipe({ items: Number, separator: ',' }))
  ids: number[],
) {
  return 'This action returns users by ids';
}
```

这个构造用于验证一个来自如下形式带参数的`GET`请求：

```typescript
GET /?ids=1,2,3
```

### Websockets和 微服务

尽管本章展示了使用 `HTTP` 风格的应用程序的例子(例如，`Express`或 `Fastify` )，  `ValidationPipe` 对于 `WebSockets` 和微服务是一样的，不管使用什么传输方法。

### 学到更多

要阅读有关自定义验证器，错误消息和可用装饰器的更多信息，请访问[此页面](https://github.com/typestack/class-validator)。

## 高速缓存（Caching）

缓存是一项伟大而简单的技术，可以帮助提高应用程序的性能。它充当临时数据存储，提供高性能的数据访问。


### 安装

我们首先需要安装所需的包：

```bash
$ npm install --save cache-manager
```

### 内存缓存

 `Nest`为各种缓存存储提供程序提供了统一的 `API`。内置的是内存中的数据存储。但是，您可以轻松地切换到更全面的解决方案，比如 `Redis` 。为了启用缓存，首先导入 `CacheModule` 并调用它的 `register()` 方法。

```typescript
import { CacheModule, Module } from '@nestjs/common';
import { AppController } from './app.controller';

@Module({
  imports: [CacheModule.register()],
  controllers: [AppController],
})
export class ApplicationModule {}
```
!> 在`[GraphQL](https://docs.nestjs.com/graphql/quick-start)`应用中，拦截器针对每个字段处理器分别运行，因此，`CacheModule`(使用)

然后将 `CacheInterceptor` 绑定到需要缓存数据的地方。

```typescript
@Controller()
@UseInterceptors(CacheInterceptor)
export class AppController {
  @Get()
  findAll(): string[] {
    return [];
  }
}
```

!> 警告: 只有使用 `GET` 方式声明的节点会被缓存。此外，注入本机响应对象( `@Res()` )的 `HTTP` 服务器路由不能使用缓存拦截器。有关详细信息，请参见[响应映射](https://docs.nestjs.com/interceptors#response-mapping)。

### 全局缓存

为了减少重复代码量，可以一次绑定 `CacheInterceptor` 到每个现有节点:

```typescript
import { CacheModule, Module, CacheInterceptor } from '@nestjs/common';
import { AppController } from './app.controller';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [CacheModule.register()],
  controllers: [AppController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
})
export class ApplicationModule {}
```
### 定制缓存

所有缓存的数据有其自己的过期时间(TTL)。要个性化不同值，将选项对象传递给`register()`方法。

```typescript
CacheModule.register({
  ttl:5, //秒
  max:10, //缓存中最大和最小数量
});
```

### 全局缓存重载

使能全局缓存后，缓存入口存储在基于路径自动生成的`Cachekey`中。你可能需要基于每个方法重载特定的缓存设置(`@CacheKey()`和`@CacheTTL()`)，允许为独立控制器方法自定义缓存策略。这在使用[不同存储缓存](https://docs.nestjs.com/techniques/caching#different-stores)时是最有意义的。

```typescript
@Controller()
export class AppController {
  @CacheKey('custom_key')
  @CacheTTL(20)
  findAll(): string[] {
    return [];
  }
}
```
?> `@CacheKey()`和`@CacheTTL()`装饰器从`@nestjs/common`包导入。

`@CacheKey()`装饰器可以有或者没有一个对应的`@CacheTTL()`装饰器，反之亦然。你可以选择仅覆盖`@CacheKey()`或`@CacheTTL()`。没有用装饰器覆盖的设置将使用全局注册的默认值（见[自定义缓存](https://docs.nestjs.com/techniques/caching#customize-caching))。

### WebSockets 和 微服务

显然，您可以毫不费力地使用 `CacheInterceptor WebSocket` 订阅者模式以及 `Microservice` 的模式（无论使用何种服务间的传输方法）。

?> 译者注: 微服务架构中服务之间的调用需要依赖某种通讯协议介质，在 `nest` 中不限制你是用消息队列中间件，`RPC/gRPC` 协议或者对外公开 `API` 的 `HTTP` 协议。

```typescript
@CacheKey('events')
@UseInterceptors(CacheInterceptor)
@SubscribeMessage('events')
handleEvent(client: Client, data: string[]): Observable<string[]> {
  return [];
}
```

然而，需要一个附加的`@CacheKey()`装饰器来指定一个用于依次存储并获取缓存数据的键。注意，你不应该缓存所有的内容。永远也不要去缓存那些用于实现业务逻辑也不是简单地查询数据的行为。

此外，你可以使用`@CacheTTL()`装饰器来指定一个缓存过期时间(TTL)，用于覆盖全局默认的TTL值。

```typescript
@CacheTTL(10)
@UseInterceptors(CacheInterceptor)
@SubscribeMessage('events')
handleEvent(client: Client, data: string[]): Observable<string[]> {
  return [];
}
```

?> `@CacheTTL()`装饰器可以`@CacheKey()`装饰器同时或者不同时使用。

### 不同的存储

服务在底层使用[缓存管理器(cache-manager)](https://github.com/BryanDonovan/node-cache-manager)。`cache-manager`包支持一个宽范围的可用存储，例如，[Redis](https://github.com/dabroek/node-cache-manager-redis-store)存储。一个完整的支持存储列表见[这里](https://github.com/BryanDonovan/node-cache-manager#store-engines)。要设置`Redis`存储，简单地将该包和相应的选项传递给`register()`方法。

```typescript
import * as redisStore from 'cache-manager-redis-store';
import { CacheModule, Module } from '@nestjs/common';
import { AppController } from './app.controller';

@Module({
  imports: [
    CacheModule.register({
      store: redisStore,
      host: 'localhost',
      port: 6379,
    }),
  ],
  controllers: [AppController],
})
export class ApplicationModule {}
```

### 调整追踪

默认地，`Nest`使用请求URL(在一个`HTTP`app中)或者缓存键（在`websockets`和`microservices`应用中，通过`@CacheKey()`装饰器设置）来联系缓存记录和路径。然而，有时你可能想要根据不同要素设置追踪，例如`HTTP headers`(比如，确定合适`profile`路径的`Authorization`)。

为了达到这个目的，创建一个`CacheInterceptor`的子类并覆盖`trackBy()`方法。

```typescript
@Injectable()
class HttpCacheInterceptor extends CacheInterceptor {
  trackBy(context: ExecutionContext): string | undefined {
    return 'key';
  }
}
```
### 异步配置

你可能想异步传递模块选项来代替在编译时静态传递。在这种情况下，可以使用`registerAsync()`方法，它提供了不同的处理异步配置的方法。

一个方法是使用工厂函数：

```typescript
CacheModule.registerAsync({
  useFactory: () => ({
    ttl: 5,
  }),
});
```
我们的工厂行为和其他异步模块工厂一样（它可以使用`inject`异步注入依赖）。

```typescript
CacheModule.registerAsync({
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => ({
    ttl: configService.getString('CACHE_TTL'),
  }),
  inject: [ConfigService],
});
```
此外，你也可以使用`useClass`方法：

```typescript
CacheModule.registerAsync({
  useClass: CacheConfigService,
});
```
上述构造器将在`CacheModule`内部实例化`CacheConfigService`并用它来得到选项对象，`CacheConfigService`需要使用`CacheOptionsFactory`接口来提供配置选项：

```typescript
@Injectable()
class CacheConfigService implements CacheOptionsFactory {
  createCacheOptions(): CacheModuleOptions {
    return {
      ttl: 5,
    };
  }
}
```
如果你希望使用在其他不同模块中导入的现有的配置提供者，使用`useExisting`语法：

```typescript
CacheModule.registerAsync({
  imports: [ConfigModule],
  useExisting: ConfigService,
});
```

这和`useClass`工作模式相同，但有一个根本区别——`CacheModule`将查找导入的模块来重用任何已经创建的`ConfigService`，以代替自己创实例化。



?> 提示: `@CacheKey()` 装饰器来源于 `@nestjs/common` 包。

但是， `@CacheKey()` 需要附加装饰器以指定用于随后存储和检索缓存数据的密钥。此外，请注意，开发者不应该缓存所有内容。缓存数据是用来执行某些业务操作，而一些简单数据查询是不应该被缓存的。

### 自定义缓存

所有缓存数据都有自己的到期时间（`TTL`）。要自定义默认值，请将配置选项填写在  `register()`方法中。

```typescript
CacheModule.register({
  ttl: 5, // seconds
  max: 10, // maximum number of items in cache
});
```

### 不同的缓存库

我们充分利用了[缓存管理器](https://github.com/BryanDonovan/node-cache-manager)。该软件包支持各种实用的商店，例如[Redis商店](https://github.com/dabroek/node-cache-manager-redis-store)（此处列出[完整列表](https://github.com/BryanDonovan/node-cache-manager#store-engines)）。要设置 `Redis` 存储，只需将包与 `correspoding` 选项一起传递给 `register()` 方法即可。

?> 译者注: 缓存方案库目前可选的有 `redis, fs, mongodb, memcached` 等。 

```typescript
import * as redisStore from 'cache-manager-redis-store';
import { CacheModule, Module } from '@nestjs/common';
import { AppController } from './app.controller';

@Module({
  imports: [
    CacheModule.register({
      store: redisStore,
      host: 'localhost',
      port: 6379,
    }),
  ],
  controllers: [AppController],
})
export class ApplicationModule {}
```

### 调整跟踪

默认情况下， `Nest` 通过 `@CacheKey()` 装饰器设置的请求路径（在 `HTTP` 应用程序中）或缓存中的 `key`（在 `websockets` 和微服务中）来缓存记录与您的节点数据相关联。然而有时您可能希望根据不同因素设置跟踪，例如，使用 `HTTP` 头部字段（例如 `Authorization` 字段关联身份鉴别节点服务）。

为此，创建 `CacheInterceptor` 的子类并覆盖 `trackBy()` 方法。

```typescript
@Injectable()
class HttpCacheInterceptor extends CacheInterceptor {
  trackBy(context: ExecutionContext): string | undefined {
    return 'key';
  }
}
```
### 异步配置

通常，您可能希望异步传递模块选项，而不是事先传递它们。在这种情况下，使用  `registerAsync()` 方法，提供了几种处理异步数据的方法。

第一种可能的方法是使用工厂函数：

```typescript
CacheModule.registerAsync({
  useFactory: () => ({
    ttl: 5,
  }),
});
```
显然，我们的工厂要看起来能让每一个调用用使用。（可以变成顺序执行的同步代码，并且能够通过注入依赖使用）。

```typescript
CacheModule.registerAsync({
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => ({
    ttl: configService.getString('CACHE_TTL'),
  }),
  inject: [ConfigService],
});
```

或者，您可以使用类而不是工厂:

```typescript
CacheModule.registerAsync({
  useClass: CacheConfigService,
});
```

上面的构造将 `CacheConfigService` 在内部实例化为 `CacheModule` ，并将利用它来创建选项对象。在 `CacheConfigService` 中必须实现 `CacheOptionsFactory` 的接口。

```typescript
@Injectable()
class CacheConfigService implements CacheOptionsFactory {
  createCacheOptions(): CacheModuleOptions {
    return {
      ttl: 5,
    };
  }
}
```

为了防止 `CacheConfigService` 内部创建 `CacheModule` 并使用从不同模块导入的提供程序，您可以使用 `useExisting` 语法。

```typescript
CacheModule.registerAsync({
  imports: [ConfigModule],
  useExisting: ConfigService,
});
```
它和 `useClass` 的用法有一个关键的相同点: `CacheModule` 将查找导入的模块以重新使用已创建的 `ConfigService` 实例，而不是重复实例化。


## 序列化（Serialization）

序列化(`Serialization`)是一个在网络响应中返回对象前的过程。 这是一个适合转换和净化要返回给客户的数据的地方。例如，应始终从最终响应中排除敏感数据（如用户密码）。此外，某些属性可能需要额外的转换，比方说，我们只想发送一个实体的子集。手动完成这些转换既枯燥又容易出错，并且不能确定是否覆盖了所有的情况。

?> 译者注: `Serialization` 实现可类比 `composer` 库中 `fractal` ，响应给用户的数据不仅仅要剔除设计安全的属性，还需要剔除一些无用字段如 `create_time`,  `delete_time`,` update_time` 和其他属性。在 `JAVA` 的实体类中定义 `N` 个属性的话就会返回 `N` 个字段，解决方法可以使用范型编程，否则操作实体类回影响数据库映射字段。

### 概要

为了提供一种直接的方式来执行这些操作， `Nest` 附带了这个  `ClassSerializerInterceptor` 类。它使用[类转换器](https://github.com/typestack/class-transformer)来提供转换对象的声明性和可扩展方式。基于此类基础下，可以从类转换器中获取方法和调用  `classToPlain()` 函数返回的值。要这样做，可以将由`class-transformer`装饰器提供的规则应用在实体/DTO类中，如下所示：

### 排除属性

我们假设要从一个用户实体中自动排除`password`属性。我们给实体做如下注释：

```typescript
import { Exclude } from 'class-transformer';

export class UserEntity {
  id: number;
  firstName: string;
  lastName: string;

  @Exclude()
  password: string;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
```
然后，直接在控制器的方法中调用就能获得此类的实例。

```typescript
@UseInterceptors(ClassSerializerInterceptor)
@Get()
findOne(): UserEntity {
  return new UserEntity({
    id: 1,
    firstName: 'Kamil',
    lastName: 'Mysliwiec',
    password: 'password',
  });
}
```
!> 我们必须返回一个类的实体。如果你返回一个普通的JavaScript对象，例如，`{user: new UserEntity()}`,该对象将不会被正常序列化。

?> 提示: `@ClassSerializerInterceptor()` 装饰器来源于 `@nestjs/common` 包。

现在当你调用此服务时，将收到以下响应结果：

```json
{
  "id": 1,
  "firstName": "Kamil",
  "lastName": "Mysliwiec"
}
```

注意，拦截器可以应用于整个应用程序（见[这里](https://docs.nestjs.com/interceptors#binding-interceptors)）。拦截器和实体类声明的组合确保返回 `UserEntity` 的任何方法都将确保删除 `password` 属性。这给你一个业务规则的强制、集中的评估。

### 公开属性

您可以使用 `@Expose()` 装饰器来为属性提供别名，或者执行一个函数来计算属性值(类似于 `getter` 函数)，如下所示。

```typescript
@Expose()
get fullName(): string {
  return `${this.firstName} ${this.lastName}`;
}
```
### 变换

您可以使用 `@Transform()` 装饰器执行其他数据转换。例如，您要选择一个名称  `RoleEntity` 而不是返回整个对象。

```typescript
@Transform(role => role.name)
role: RoleEntity;
```

### 传递选项

你可能想要修改转换函数的默认行为。要覆盖默认设置，请使用 `@SerializeOptions()` 装饰器来将其传递给一个`options`对象。

```typescript
@SerializeOptions({
  excludePrefixes: ['_'],
})
@Get()
findOne(): UserEntity {
  return {};
}
```

?> 提示: `@SerializeOptions()` 装饰器来源于 `@nestjs/common` 包。

通过 `@SerializeOptions()` 传递的选项作为底层 `classToPlain()` 函数的第二个参数传递。在本例中，我们自动排除了所有以_前缀开头的属性。

### Websockets 和 微服务

虽然本章展示了使用 `HTTP` 风格的应用程序的例子(例如，`Express` 或 `Fastify` )，但是 `ClassSerializerInterceptor`对于 `WebSockets` 和微服务的工作方式是一样的，不管使用的是哪种传输方法。

### 更多

想了解有关装饰器选项的更多信息，请访问此[页面](https://github.com/typestack/class-transformer)。

## 定时任务

定时任务允许你按照指定的日期/时间、一定时间间隔或者一定时间后单次执行来调度(`scheduling`)任意代码（方法/函数）。在`Linux`世界中，这经常通过操作系统层面的`cron`包等执行。在`Node.js`应用中，有几个不同的包可以模拟cron包的功能。Nest提供了`@nestjs/schedule`包，其集成了流行的Node.js的`node-cron`包，我们将在本章中应用该包。

### 安装

我们首先从安装需要的依赖开始。

```bash
$ npm install --save @nestjs/schedule
```
要激活工作调度,从根`AppModule`中导入`ScheduleModule`并运行`forRoot()`静态方法，如下：

> app.module.ts

```typescript
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot()
  ],
})
export class AppModule {}
```
`.forRoot()`调用初始化调度器并且注册在你应用中任何声明的`cron jobs`,`timeouts`和`intervals`。注册开始于`onApplicationBootstrap`生命周期钩子发生时，保证所有模块都已经载入，任何计划工作已经声明。

### 声明计时工作(cron job)

一个计时工作调度任何函数（方法调用）以自动运行， 计时工作可以：
- 单次，在指定日期/时间
- 重复循环：重复工作可以在指定周期中指定执行（例如，每小时，每周，或者每5分钟）

在包含要运行代码的方法定义前使用`@Cron()`装饰器声明一个计时工作，如下：

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  @Cron('45 * * * * *')
  handleCron() {
    this.logger.debug('Called when the current second is 45');
  }
}
```
在这个例子中，`handleCron()`方法将在当前时间为`45秒`时定期执行。换句话说，该方法每分钟执行一次，在第45秒执行。

`@Cron()`装饰器支持标准的[cron patterns](http://crontab.org/):
- 星号通配符 (也就是 *)
- 范围（也就是 1-3,5)
- 步长（也就是 */2)

在上述例子中，我们给装饰器传递了`45 * * * * *`，下列键展示了每个位置的计时模式字符串的意义：

```bash
* * * * * *
| | | | | |
| | | | | day of week
| | | | month
| | | day of month
| | hour
| minute
second (optional)
```
一些示例的计时模式包括：

|名称|含义|
|---|---|
|* * * * * *|每秒|
|45 * * * * *|每分钟第45秒|
|* 10 * * * *|每小时，从第10分钟开始|
|0 */30 9-17 * * *|上午9点到下午5点之间每30分钟|
|0 30 11 * * 1-5|周一至周五上午11:30|

`@nestjs/schedule`包提供一个方便的枚举

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  @Cron(CronExpression.EVERY_45_SECONDS)
  handleCron() {
    this.logger.debug('Called every 45 seconds');
  }
}
```

在本例中，`handleCron()`方法每`45`秒执行一次。

可选地，你可以为将一个`JavaScript`的`Date`对象传递给`@Cron()`装饰器。这样做可以让工作在指定日期执行一次。

?> 使用`JavaScript`日期算法来关联当前日期和计划工作。`@Cron(new Date(Date.now()+10*1000))`用于在应用启动10秒后运行。

你可以在声明后访问并控制一个定时任务，或者使用[动态API](https://docs.nestjs.com/techniques/task-scheduling#dynamic-schedule-module-api)动态创建一个定时任务（其定时模式在运行时定义）。要通过API声明定时任务,你必须通过将选项对象中的`name`属性作为可选的第二个参数传递给装饰器，从而将工作和名称联系起来。

```typescript
@Cron('* * 8 * * *', {
  name: 'notifications',
})
triggerNotifications() {}

```
### 声明间隔

要声明一个以一定间隔运行的方法，使用`@Interval()`装饰器前缀。以毫秒单位的`number`传递间隔值，如下：

```typescript
@Interval(10000)
handleInterval() {
  this.logger.debug('Called every 10 seconds');
}
```
?> 本机制在底层使用`JavaScript`的`setInterval()`函数。你也可以使用定期调度工作来应用一个定时任务。

如果你希望在声明类之外通过[动态API](https://docs.nestjs.com/techniques/task-scheduling#dynamic-schedule-module-api)控制你声明的时间间隔。使用下列结构将名称与间隔关联起来。

```typescript
@Interval('notifications', 2500)
handleInterval() {}
```
动态API也支持动态创建时间间隔，间隔属性在运行时定义，可以列出和删除他们。

### 声明延时任务

要声明一个在指定时间后运行（一次）的方法，使用`@Timeout()`装饰器前缀。将从应用启动的相关时间偏移量（毫秒）传递给装饰器，如下：

```typescript
@Timeout(5000)
handleTimeout() {
  this.logger.debug('Called once after 5 seconds');
}
```
?> 本机制在底层使用JavaScript的`setTimeout()`方法

如果你想要在声明类之外通过动态API控制你声明的超时时间，将超时时间和一个名称以如下结构关联：

```typescript
@Timeout('notifications', 2500)
handleTimeout() {}
```
动态API同时支持创建动态超时时间，超时时间在运行时定义，可以列举和删除他们。

### 动态规划模块API

`@nestjs/schedule`模块提供了一个支持管理声明定时、超时和间隔任务的动态API。该API也支持创建和管理动态定时、超时和间隔，这些属性在运行时定义。

### 动态定时任务

使用`SchedulerRegistry`API从你代码的任何地方获取一个`CronJob`实例的引用。首先，使用标准构造器注入`ScheduleRegistry`。

```typescript
constructor(private schedulerRegistry: SchedulerRegistry) {}
```

?> 从`@nestjs/schedule`包导入`SchedulerRegistry`。

使用下列类，假设通过下列定义声明一个定时任务：

```typescript
@Cron('* * 8 * * *', {
  name: 'notifications',
})
triggerNotifications() {}
```
如下获取本工作：

```typescript
const job = this.schedulerRegistry.getCronJob('notifications');

job.stop();
console.log(job.lastDate());
```
`getCronJob()`方法返回一个命名的定时任务。然后返回一个包含下列方法的`CronJob`对象：
- stop()-停止一个按调度运行的任务
- start()-重启一个停止的任务
- setTime(time:CronTime)-停止一个任务，为它设置一个新的时间，然后再启动它
- lastDate()-返回一个表示工作最后执行日期的字符串
- nextDates(count:number)-返回一个`moment`对象的数组（大小`count`)，代表即将执行的任务日期

?> 在`moment`对象中使用`toDate()`来渲染成易读的形式。

使用`SchedulerRegistry.addCronJob()`动态创建一个新的定时任务，如下：

```typescript
addCronJob(name: string, seconds: string) {
  const job = new CronJob(`${seconds} * * * * *`, () => {
    this.logger.warn(`time (${seconds}) for job ${name} to run!`);
  });

  this.scheduler.addCronJob(name, job);
  job.start();

  this.logger.warn(
    `job ${name} added for each minute at ${seconds} seconds!`,
  );
}
```
在这个代码中，我们使用`cron`包中的`CronJob`对象来创建定时任务。`CronJob`构造器采用一个定时模式（类似`@Cron()`[装饰器](https://docs.nestjs.com/techniques/task-scheduling#declarative-cron-jobs)作为其第一个参数，以及一个将执行的回调函数作为其第二个参数。`SchedulerRegistry.addCronJob()`方法有两个参数：一个`CronJob`名称，以及一个`CronJob`对象自身。

!> 记得在使用前注入`SchedulerRegistry`，从`cron`包中导入 `CronJob`。

使用`SchedulerRegistry.deleteCronJob()`方法删除一个命名的定时任务，如下：

```typescript
deleteCron(name: string) {
  this.scheduler.deleteCronJob(name);
  this.logger.warn(`job ${name} deleted!`);
}
```
使用`SchedulerRegistry.getCronJobs()`方法列出所有定时任务，如下：

```typescript
getCrons() {
  const jobs = this.scheduler.getCronJobs();
  jobs.forEach((value, key, map) => {
    let next;
    try {
      next = value.nextDates().toDate();
    } catch (e) {
      next = 'error: next fire date is in the past!';
    }
    this.logger.log(`job: ${key} -> next: ${next}`);
  });
}
```
`getCronJobs()`方法返回一个`map`。在这个代码中，我们遍历该`map`并且尝试获取每个`CronJob`的`nextDates()`方法。在`CronJob`API中，如果一个工作已经执行了并且没有下一次执行的日期，将抛出异常。

### 动态间隔

使用`SchedulerRegistry.getInterval()`方法获取一个时间间隔的引用。如上，使用标准构造注入`SchedulerRegistry`。

```typescript
constructor(private schedulerRegistry: SchedulerRegistry) {}
```

如下使用：

```typescript
const interval = this.schedulerRegistry.getInterval('notifications');
clearInterval(interval);
```
使用`SchedulerRegistry.addInterval() `方法创建一个新的动态间隔，如下：

```typescript
addInterval(name: string, seconds: string) {
  const callback = () => {
    this.logger.warn(`Interval ${name} executing at time (${seconds})!`);
  };

  const interval = setInterval(callback, seconds);
  this.scheduler.addInterval(name, interval);
}
```
在该代码中，我们创建了一个标准的JavaScript间隔，然后将其传递给`ScheduleRegistry.addInterval()`方法。该方法包括两个参数：一个时间间隔的名称，和时间间隔本身。

如下使用`SchedulerRegistry.deleteInterval()`删除一个命名的时间间隔：
```typescript
deleteInterval(name: string) {
  this.scheduler.deleteInterval(name);
  this.logger.warn(`Interval ${name} deleted!`);
}
```
使用`SchedulerRegistry.getIntervals()`方法如下列出所有的时间间隔：

```typescript
getIntervals() {
  const intervals = this.scheduler.getIntervals();
  intervals.forEach(key => this.logger.log(`Interval: ${key}`));
}
```

### 动态超时

使用`SchedulerRegistry.getTimeout()`方法获取一个超时引用，如上，使用标准构造注入`SchedulerRegistry`：
```typescript
constructor(private schedulerRegistry: SchedulerRegistry) {}
```
并如下使用：
```typescript
const timeout = this.schedulerRegistry.getTimeout('notifications');
clearTimeout(timeout);
```
使用`SchedulerRegistry.addTimeout()`方法创建一个新的动态超时，如下：

```typescript
addTimeout(name: string, seconds: string) {
  const callback = () => {
    this.logger.warn(`Timeout ${name} executing after (${seconds})!`);
  });

  const timeout = setTimeout(callback, seconds);
  this.scheduler.addTimeout(name, timeout);
}
```
在该代码中，我们创建了个一个标准的JavaScript超时任务，然后将其传递给`ScheduleRegistry.addTimeout()`方法，该方法包含两个参数：一个超时的名称，以及超时对象自身。

使用`SchedulerRegistry.deleteTimeout()`方法删除一个命名的超时，如下：
```typescript
deleteTimeout(name: string) {
  this.scheduler.deleteTimeout(name);
  this.logger.warn(`Timeout ${name} deleted!`);
}
```
使用`SchedulerRegistry.getTimeouts()`方法列出所有超时任务：
```typescript
getTimeouts() {
  const timeouts = this.scheduler.getTimeouts();
  timeouts.forEach(key => this.logger.log(`Timeout: ${key}`));
}
```
### 示例

一个可用的例子见[这里](https://github.com/nestjs/nest/tree/master/sample/27-scheduling)。

## 压缩


压缩可以大大减小响应主体的大小，从而提高 `Web` 应用程序的速度。

在大业务量的生产环境网站中，强烈推荐将压缩功能从应用服务器中卸载——典型做法是使用反向代理（例如Nginx)。在这种情况下，你不应该使用压缩中间件。

### 配合Express使用（默认）

使用[压缩中间件](https://github.com/expressjs/compression)启用 `gzip` 压缩。

首先，安装所需的包：

```
$ npm i --save compression
```

安装完成后，将其应用为全局中间件。

```typescript
import * as compression from 'compression';
// somewhere in your initialization file
app.use(compression());
```
### 配合Fastify使用

如果你在使用的是 `FastifyAdapter`，请考虑使用 [fastify-compress](https://github.com/fastify/fastify-compress)。

```
$ npm i --save fastify-compress
```
安装完成后，将其应用为全局中间件。

```typescript
import * as compression from 'fastify-compress';
// somewhere in your initialization file
app.register(compression);
```
默认地，如果浏览器支持编码，`fastify-compress`使用`Brotli`压缩(`Node>=11.7.0`)。`Brotli`在压缩比方面非常有效，但也非常慢。鉴于此，你可能想告诉`fastify-compress`仅使用`deflate`和`gzip`来压缩相应，你最终会得到一个较大的相应但是可以传输的更快。

要指定编码，向`app.register`提供第二个参数：

```typescript
app.register(compression, { encodings: ['gzip', 'deflate'] });
```
上述内容告诉`fastify-compress`仅使用gzip和deflate编码，如果客户端同时支持两种，则以gzip优先。

## 安全

在本章中，您将学习一些可以提高应用程序安全性的技术。

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

### CSRF

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


## 队列

队列是一种有用的设计模式，可以帮助你处理一般应用规模和性能的挑战。一些队列可以帮助你处理的问题示例包括：

- 平滑输出峰值。例如，如果用户可以在任何时间创建资源敏感型任务，你可以将其添加到一个消息队列中而不是同步执行。然后你可以通过工作者进程从队列中以一个可控的方式取出进程。在应用规模增大时，你可以轻松添加新的队列消费者来提高后端任务处理能力。
- 将可能阻塞`Node.js`事件循环的整体任务打碎。例如，如果一个用户请求是CPU敏感型工作，例如音频转码，你可以将其委托给其他进程，从而保证用户接口进程保持响应。
- 在不同的服务间提供一个可信的通讯通道。例如，你可以将任务（工作）加入一个进程或服务，并由另一个进程或服务来消费他们。你可以在由其他任何进程或服务执行的工作完成、错误或者其他状态变化时得到通知（通过监听状态事件）。当队列生产者或者消费者失败时，他们的状态会被保留，任务将在node重启后自动重启。
  
Nest提供了`@nestjs/bull`包，这是[Bull](https://github.com/OptimalBits/bull)包的一个包装器，Bull是一个流行的、支持良好的、高性能的基于Nodejs的消息队列系统应用。该包将Bull队列以Nest友好的方式添加到你的应用中。

Bull使用[Redis](https://redis.io/)持久化工作数据，因此你需要在你的系统中安装Redis。因为他是基于Redis的，你的队列结构可以是完全分布式的并且和平台无关。例如，你可以有一些队列[生产者](https://docs.nestjs.com/techniques/queues#producers)、[消费者](https://docs.nestjs.com/techniques/queues#consumers)和[监听者](https://docs.nestjs.com/techniques/queues#event-listeners)，他们运行在Nest的一个或多个节点上，同时，其他生产者、消费者和监听者在其他Node.js平台或者其他网络节点上。

本章使用`@nestjs/bull`包，我们同时推荐阅读[BUll文档](https://github.com/OptimalBits/bull/blob/master/REFERENCE.md)来获取更多背景和应用细节。

### 安装

要开始使用，我们首先安装需要的依赖：

```typescript
$ npm install --save @nestjs/bull bull
$ npm install --save-dev @types/bull
```
一旦安装过程完成，我们可以在根`AppModule`中导入`BullModule`。

> app.module.ts

```typescript
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'audio',
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
  ],
})
export class AppModule {}
```
`registerQueue()`方法用于实例化并/或注册队列。队列在不同的模块和进程之间共享，在底层则通过同样的凭据连接到同样的Redis数据库。每个队列由其`name`属性区分（如下），当共享队列（跨模块/进程）时，第一个`registerQueue()`方法同时实例化该队列并向模块注册它。其他模块（在相同或者不同进程下）则简单地注册队列。队列注册创建一个`injection token`，它可以被用在给定Nest模块中获取队列。

针对每个队列，传递一个包含下列属性的配置对象：

-`name:string`- 一个队列名称，它可以被用作`injection token`(用于将队列注册到控制器/提供者)，也可以作为装饰器参数来将消费者类和监听者与队列联系起来。是必须的。
-`limiter:RateLimiter`-该选项用于确定消息队列处理速率，查看[RateLimiter](https://github.com/OptimalBits/bull/blob/master/REFERENCE.md#queue)获取更多信息。可选的。
-`redis:RedisOpts`-该选项用于配置Redis连接，查看[RedisOpts](https://github.com/OptimalBits/bull/blob/master/REFERENCE.md#queue)获取更多信息。可选的。
-`prefix: string`-队列所有键的前缀。可选的。
-`defaultJobOptions: JobOpts`-选项用以控制新任务的默认属性。查看[JobOpts](https://github.com/OptimalBits/bull/blob/master/REFERENCE.md#queueadd)获取更多信息。可选的。
-`settings: AdvancedSettings`-高级队列配置设置。这些通常不需要改变。查看[AdvancedSettings](https://github.com/OptimalBits/bull/blob/master/REFERENCE.md#queue)获取更多信息。可选的。

注意，`name`属性是必须的。其他选项是可选的，为队列行为提供更细节的控制。这些会直接传递给Bull的`Queue`构造器。在[这里](https://github.com/OptimalBits/bull/blob/master/REFERENCE.md#queue)阅读更多选项。当在第二个或者子模块中注册一个队列时，最佳时间是省略配置对象中除`name`属性之外的所有选项。这些选项仅应该在实例化队列的模块中确定。

?> 在`registerQueue()`方法中传递多个逗号分隔的选项对象来创建多个队列。

由于任务在Redis中是持久化的，每次当一个特定名称的队列被实例化时（例如，当一个app启动/重启时），它尝试处理任何可能在前一个旧的任务遗留未完成的`session`。

每个队里可能有一个或很多生产者、消费者以及监听者。消费者从一个特定命令队列中获取任务：FIFO（默认，先进先出），LIFO(后进先出)或者依据优先级。

控制队列处理命令在[这里](https://docs.nestjs.com/techniques/queues#consumers)讨论。

### 生产者

任务生产者添加任务到队列中。生产者是典型的应用服务（Nest [提供者](https://docs.nestjs.com/providers)）。要添加工作到一个队列，首先注册队列到服务中：

```typescript
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

@Injectable()
export class AudioService {
  constructor(@InjectQueue('audio') private audioQueue: Queue) {}
}
```

?> `@InjectQueue()`装饰器由其名称指定队列，像它在`registerQueue()`方法中提供的那样（例如，`audio`）。

现在，通过调用队列的`add()`方法添加一个任务，传递一个用户定义的任务对象。任务表现为序列化的`JavaScript`对象（因为它们被存储在Redis数据库中）。你传递的任务形式是可选的；用它来在语义上表示你任务对象：

```typescript
const job = await this.audioQueue.add({
  foo: 'bar',
});
```
### 命名的任务

任务需要独一无二的名字。这允许你创建专用的[消费者](https://docs.nestjs.com/techniques/queues#consumers),这将仅处理给定名称的处理任务。

```typescript
const job = await this.audioQueue.add('transcode', {
  foo: 'bar',
});
```

!> 当使用命名任务时，你必须为每个添加到队列中的特有名称创建处理者，否则队列会反馈缺失了给定任务的处理器。查看[这里](https://docs.nestjs.com/techniques/queues#consumers)阅读更多关于消费命名任务的信息。

### 任务选项

任务可以包括附加选项。在`Quene.add()`方法的`job`参数之后传递选项对象。任务选项属性有：
- `priority: number`-选项优先级值。范围从1（最高优先）到MAX_INT（最低优先）。注意使用属性对性能有轻微影响，因此要小心使用。
- `delay: number`- 任务执行前等待的时间（毫秒）。注意，为了精确延时，服务端和客户端时钟应该同步。
- `attempts: number`-任务结束前总的尝试次数。
- `repeat: RepeatOpts`-按照定时设置重复任务记录，查看[RepeatOpts](https://github.com/OptimalBits/bull/blob/master/REFERENCE.md#queueadd)。
- `backoff: number | BackoffOpts`- 如果任务失败，自动重试闪避设置，查看[BackoffOpts](https://github.com/OptimalBits/bull/blob/master/REFERENCE.md#queueadd)。
- `lifo: boolean`-如果为`true`，从队列右端添加任务以替代从左边添加（默认为 false)。
- `timeout: number`-任务超时失败的毫秒数。
- `jobId: number | string`- 覆盖任务ID-默认地，任务ID是唯一的整数，但你可以使用该参数覆盖它。如果你使用这个选项，你需要保证`jobId`是唯一的。如果你尝试添加一个包含已有id的任务，它不会被添加。
- `removeOnComplete: boolean | number`-如果为`true`，当任务完成时移除任务。一个数字用来指定要保存的任务数。默认行为是将完成的工作保存在已完成的设置中。
- `removeOnFail: boolean | number`-如果为`true`，当所有尝试失败时移除任务。一个数字用来指定要保存的任务数。默认行为是将失败的任务保存在已失败的设置中。
- `stackTraceLimit: number`-限制在`stacktrace`中保存的堆栈跟踪线。

这里是一些带有任务选项的自定义任务示例。

要延迟任务的开始，使用`delay`配置属性：

```typescript
const job = await this.audioQueue.add(
  {
    foo: 'bar',
  },
  { delay: 3000 }, // 3 seconds delayed
);
```

要从右端添加任务到队列（以LIFO（后进先出）处理任务），设置配置对象的`lifo`属性为`true`。

```typescript
const job = await this.audioQueue.add(
  {
    foo: 'bar',
  },
  { lifo: true },
);
```

要优先一个任务，使用`priority`属性。

```typescript

const job = await this.audioQueue.add(
  {
    foo: 'bar',
  },
  { priority: 2 },
);

```

### 消费者

消费者是一个类，定义的方法要么处理添加到队列中的任务，要么监听队列的事件，或者两者皆有。使用`@Processor()`装饰器来定义消费者类，如下：

```typescript
import { Processor } from '@nestjs/bull';

@Processor('audio')
export class AudioConsumer {}
```
装饰器的字符串参数（例如,`audio`)是和类方法关联的队列名称。

在消费者类中，使用`@Process()`装饰器来装饰任务处理者。

```typescript
import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';

@Processor('audio')
export class AudioConsumer {
  @Process()
  async transcode(job: Job<unknown>) {
    let progress = 0;
    for (i = 0; i < 100; i++) {
      await doSomething(job.data);
      progress += 10;
      job.progress(progress);
    }
    return {};
  }
}
```
装饰器方法（例如`transcode()`) 在工作空闲或者队列中有消息要处理的时候被调用。该处理器方法接受`job`对象作为其仅有的参数。处理器方法的返回值被保存在任务对象中，可以在之后被访问，例如，在用于完成事件的监听者中。

`Job`对象有多个方法，允许你和他们的状态交互。例如，上述代码使用`progress()`方法来更新工作进程。查看[这里](https://github.com/OptimalBits/bull/blob/master/REFERENCE.md#job)以了解完整的`Job`对象API参照。

你可以指定一个任务处理方法，仅处理指定类型（包含特定`name`的任务）的任务，这可以通过如下所述的将`name`传递给`@Process()`装饰器完成。你在一个给定消费者类中可以有多个`@Process()`处理器，以反应每个任务类型（`name`)，确保每个`name`有相应的处理者。

```typescript

@Process('transcode')
async transcode(job: Job<unknown>) { ... }
```

### 事件监听者

当队列和/或任务状态改变时，`Bull`生成一个有用的事件集合。Nest提供了一个装饰器集合，允许订阅一系列标准核心事件集合。他们从`@nestjs/bull`包中导出。

事件监听者必须在一个[消费者](https://docs.nestjs.com/techniques/queues#consumers)类中声明（通过`@Processor()`装饰器）。要监听一个事件，使用如下表格之一的装饰器来声明一个事件处理器。例如，当一个任务进入`audio`队列活跃状态时，要监听其发射的事件，使用下列结构：

```typescript
import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';

@Processor('audio')
export class AudioConsumer {

  @OnQueueActive()
  onActive(job: Job) {
    console.log(
      `Processing job ${job.id} of type ${job.name} with data ${job.data}...`,
    );
  }
```
鉴于BUll运行于分布式（多node）环境，它定义了本地事件概念。该概念可以辨识出一个由完整的单一进程触发的事件，或者由不同进程共享的队列。一个本地事件是指在本地进程中触发的一个队列行为或者状态变更。换句话说，当你的事件生产者和消费者是本地单进程时，队列中所有事件都是本地的。

当一个队列在多个进程中共享时，我们可能要遇到全局事件。对一个由其他进程触发的事件通知器进程的监听者来说，它必须注册为全局事件。

当相应事件发射时事件处理器被唤醒。该处理器被下表所示的签名调用，提供访问事件相关的信息。我们讨论下面签名中本地和全局事件处理器。

|本地事件监听者|全局事件监听者|处理器方法签名/当触发时|
|---|---|---|
|@OnQueueError()|@OnGlobalQueueError()|handler(error: Error) - 当错误发生时，`error`包括触发错误
|@OnQueueWaiting()|@OnGlobalQueueWaiting()|handler(jobId: number | string)-一旦工作者空闲就等待执行的任务，`jobId`包括进入此状态的id
|@OnQueueActive()|@OnGlobalQueueActive()|handler(job: Job)-`job`任务已启动
|@OnQueueStalled()|@OnGlobalQueueStalled()|handler(job: Job)-`job`任务被标记为延迟。这在时间循环崩溃或暂停时进行调试工作时是很有效的
|@OnQueueProgress()|@OnGlobalQueueProgress()|handler(job: Job, progress: number)-`job`任务进程被更新为`progress`值
|@OnQueueCompleted()|@OnGlobalQueueCompleted()|handler(job: Job, result: any) `job`任务进程成功以`result`结束
|@OnQueueFailed()|@OnGlobalQueueFailed()|handler(job: Job, err: Error)`job`任务以`err`原因失败
|@OnQueuePaused()|@OnGlobalQueuePaused()|handler()队列被暂停
|@OnQueueResumed()|@OnGlobalQueueResumed()|handler(job: Job)队列被恢复
|@OnQueueCleaned()|@OnGlobalQueueCleaned()|handler(jobs: Job[], type: string) 旧任务从队列中被清理，`job`是一个清理任务数组，`type`是要清理的任务类型
|@OnQueueDrained()|@OnGlobalQueueDrained()|handler()在队列处理完所有等待的任务（除非有些尚未处理的任务被延迟）时发射出
|@OnQueueRemoved()|@OnGlobalQueueRemoved()|handler(job: Job)`job`任务被成功移除

当监听全局事件时，签名方法可能和本地有一点不同。特别地，本地版本的任何方法签名接受`job`对象的方法签名而不是全局版本的`jobId(number)`。要在这种情况下获取实际的`job`对象的引用，使用`Queue#getJob`方法。这种调用可能需要等待，因此处理者应该被声明为`async`，例如：

```typescript
@OnGlobalQueueCompleted()
async onGlobalCompleted(jobId: number, result: any) {
  const job = await this.immediateQueue.getJob(jobId);
  console.log('(Global) on completed: job ', job.id, ' -> result: ', result);
}
```
?> 要获取一个`Queue`对象（使用`getJob()`调用)，你当然必须注入它。同时，队列必须注册到你要注入的模块中。

在特定事件监听器装饰器之外，你可以使用通用的`@OnQueueEvent()`装饰器与`BullQueueEvents`或者`BullQueueGlobalEvents`枚举相结合。在[这里](https://github.com/OptimalBits/bull/blob/master/REFERENCE.md#events)阅读更多有关事件的内容。

### 队列管理

队列有一个API来实现管理功能比如暂停、恢复、检索不同状态的任务数量等。你可以在[这里](https://github.com/OptimalBits/bull/blob/master/REFERENCE.md#queue)找到完整的队列API。直接在`Queue`对象上调用这些方法，如下所示的暂停/恢复示例。

使用`pause()`方法调用来暂停队列。一个暂停的队列在恢复前将不会处理新的任务，但会继续处理完当前执行的任务。

```typescript
await audioQueue.pause();
```
要恢复一个暂停的队列，使用`resume()`方法，如下：

```typescript
await audioQueue.resume();
```

### 异步配置

你可能需要异步而不是静态传递队列选项。在这种情况下，使用`registerQueueAsync()`方法，可以提供不同的异步配置方法。

一个方法是使用工厂函数：

```typescript
BullModule.registerQueueAsync({
  name: 'audio',
  useFactory: () => ({
    redis: {
      host: 'localhost',
      port: 6379,
    },
  }),
});
```

我们的工厂函数方法和其他[异步提供者](https://docs.nestjs.com/fundamentals/async-providers)(它可以是`async`的并可以使用`inject`来注入)方法相同。

```typescript
BullModule.registerQueueAsync({
  name: 'audio',
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => ({
    redis: {
      host: configService.get('QUEUE_HOST'),
      port: +configService.get('QUEUE_PORT'),
    },
  }),
  inject: [ConfigService],
});
```

可选的，你可以使用`useClass`语法。

```typescript
BullModule.registerQueueAsync({
  name: 'audio',
  useClass: BullConfigService,
});
```
上述结构在`BullModule`中实例化`BullConfigService`，并通过调用`createBullOptions()`来用它提供一个选项对象。注意这意味着`BullConfigService`要实现`BullOptionsFactory`工厂接口，如下：

```typescript
@Injectable()
class BullConfigService implements BullOptionsFactory {
  createBullOptions(): BullModuleOptions {
    return {
      redis: {
        host: 'localhost',
        port: 6379,
      },
    };
  }
}
```
要阻止在`BullModule`中创建`BullConfigService`并使用一个从其他模块导入的提供者，可以使用`useExisting`语法。

```typescript
BullModule.registerQueueAsync({
  name: 'audio',
  imports: [ConfigModule],
  useExisting: ConfigService,
});
```

这个结构和`useClass`有一个根本区别——`BullModule`将查找导入的模块来重用现有的`ConfigServie`而不是实例化一个新的。

### 示例

一个可用的示例见[这里](https://github.com/nestjs/nest/tree/master/sample/26-queues)。

## 日志


 `Nest`附带一个默认的内部日志记录器实现，它在实例化过程中以及在一些不同的情况下使用，比如发生异常等等（例如系统记录）。这由`@nestjs/common`包中的`Logger`类实现。你可以全面控制如下的日志系统的行为：
 
- 完全禁用日志
- 指定日志系统详细水平（例如，展示错误，警告，调试信息等）
- 完全覆盖默认日志记录器
- 通过扩展自定义默认日志记录器
- 使用依赖注入来简化编写和测试你的应用

你也可以使用内置日志记录器，或者创建你自己的应用来记录你自己应用水平的事件和消息。

更多高级的日志功能，可以使用任何`Node.js`日志包，比如[Winston](https://github.com/winstonjs/winston)，来生成一个完全自定义的生产环境水平的日志系统。

### 基础自定义

要禁用日志，在（可选的）Nest应用选项对象中向`NestFactory.create()`传递第二个参数设置`logger`属性为`false`。

```typescript
const app = await NestFactory.create(ApplicationModule, {
  logger: false,
});
await app.listen(3000);
```

你也可以只启用特定日志级别，设置一个字符串形式的`logger`属性数组以确定要显示的日志水平，如下：

```typescript
const app = await NestFactory.create(ApplicationModule, {
  logger: ['error', 'warn'],
});
await app.listen(3000);
```
数组中的字符串可以是以下字符串的任意组合：`log`,`error`,`warn`,`debug`和`verbose`。

### 自定义应用

你可以提供一个自定义日志记录器应用，并由Nest作为系统记录使用，这需要设置`logger`属性到一个满足`LoggerService`接口的对象。例如，你可以告诉Nest使用内置的全局JavaScript`console`对象（其应用了`LoggerService`接口），如下：

```typescript
const app = await NestFactory.create(ApplicationModule, {
  logger: console,
});
await app.listen(3000);
```
应用你的自定义记录器很简单。只要简单实现以下`LoggerService`接口中的每个方法就可以：

```typescript
import { LoggerService } from '@nestjs/common';

export class MyLogger implements LoggerService {
  log(message: string) {
    /* your implementation */
  }
  error(message: string, trace: string) {
    /* your implementation */
  }
  warn(message: string) {
    /* your implementation */
  }
  debug(message: string) {
    /* your implementation */
  }
  verbose(message: string) {
    /* your implementation */
  }
}
```
你可以通过`logger`属性为Nest应用的选项对象提供一个`MyLogger`实例：

```typescript
const app = await NestFactory.create(ApplicationModule, {
  logger: new MyLogger(),
});
await app.listen(3000);
```
这个技术虽然很简单，但是没有为`MyLogger`类应用依赖注入。这会带来一些挑战，尤其在测试方面，同时也限制了`MyLogger`的重用性。更好的解决方案参见如下的[依赖注入](https://docs.nestjs.com/techniques/logger#dependency-injection)部分。


### 扩展内置的日志类

很多实例操作需要创建自己的日志。你不必完全重新发明轮子。只需扩展内置 `Logger` 类以部分覆盖默认实现，并使用 `super` 将调用委托给父类。

```typescript
import { Logger } from '@nestjs/common';

export class MyLogger extends Logger {
  error(message: string, trace: string) {
    // add your tailored logic here
    super.error(message, trace);
  }
}
```
你可以按如下[使用应用记录器来记录](https://docs.nestjs.com/techniques/logger#dependency-injection)部分所述，从你的特征模块中使用扩展记录器，也可以按照如下的[依赖注入](https://docs.nestjs.com/techniques/logger#dependency-injection)部分。如果你这样做，你在调用`super`时要小心，如上述代码示例，要委托一个特定的日志方法，调用其父（内置）类，以便Nest可以依赖需要的内置特征。

### 依赖注入

你可能需要利用依赖注入的优势来使用高级的日志记录功能。例如，你可能想把`ConfigService`注入到你的记录器中来对它自定义，然后把自定义记录器注入到其他控制器和/或提供者中。要为你的自定义记录器启用依赖注入，创建一个实现`LoggerService`的类并将其作为提供者注册在某些模块中，例如，你可以：

1. 定义一个`MyLogger`类来扩展内置的`Logger`或者完全覆盖它，如前节所述。
2. 创建一个`LoggerModule`如下所示，从该模块中提供`MyLogger`。

```typescript
import { Module } from '@nestjs/common';
import { MyLogger } from './my-logger.service.ts';

@Module({
  providers: [MyLogger],
  exports: [MyLogger],
})
export class LoggerModule {}
```
通过这个结构，你现在可以提供你的自定义记录器供其他任何模块使用。因为你的`MyLogger`类是模块的一部分，它也可以使用依赖注入（例如，注入一个`ConfigService`）。提供自定义记录器供使用还需要一个技术，即Nest的系统记录（例如，供`bootstrapping`和`error handling`)。

由于应用实例化(`NestFactory.create()`)在任何模块上下文之外发生，它不能参与初始化时正常的依赖注入阶段。因此我们必须保证至少一个应用模块导入了`LoggerModule`来触发`Nest`，从而生成一个我们的`MyLogger`类的单例。我们可以在之后按照下列知道来告诉Nest使用同一个`MyLogger`实例。

```typescript
const app = await NestFactory.create(ApplicationModule, {
  logger: false,
});
app.useLogger(app.get(MyLogger));
await app.listen(3000);
```

在这里我们在`NestApplication`实例中用了`get()`方法以获取`MyLogger`对象的单例。这个技术在根本上是一个“注入”`logger`实例供`Nest`使用的方法。`app.get()`调用获取`MyLogger`单例，并且像之前所述的那样依赖于第一个注入到其他模块的实例。

你也可以在你的特征类中注入这个`MyLogger`提供者，从而保证`Nest`系统记录和应用记录行为一致。参见如下为应用记录使用记录器部分。

### 为应用记录使用记录器

我们可以组合上述几种技术来提供一致性的行为和格式化以保证我们的应用事件/消息记录和Nest系统记录一致。在本部分，我们采用以下步骤：

1. 我们扩展内置记录器并自定义记录消息的`context`部分（例如，如下的方括号中的`NestFactory`的形式）。
   ```bash
    [Nest] 19096   - 12/08/2019, 7:12:59 AM   [NestFactory] Starting Nest application...
   ```
2. 我们注入一个[暂态的](https://docs.nestjs.com/fundamentals/injection-scopes)`Logger`实例在我们的特征模块中，从而使它们包含各自的自定义上下文。
3. 我们提供扩展的记录器供Nest在系统记录中使用。

要开始，使用类似如下的内置记录器代码。我们提供`scope`选项作为一个`Logger`类的配置元数据，指定瞬态范围，以保证我们在每个特征模块中有独一无二的`Logger`的实例。例如，我们没有扩展每个单独的`Logger`方法（例如 `log()`,`warn()`等），尽管你可能选择要这样做。

```typescript
import { Injectable, Scope, Logger } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class MyLogger extends Logger {}
```

然后，我们采用如下结构创建一个`LoggerModule`：

```typescript
import { Module } from '@nestjs/common';
import { MyLogger } from './my-logger.service';

@Module({
  providers: [MyLogger],
  exports: [MyLogger],
})
export class LoggerModule {}
```

接下来，在你的特征模块中导入`LoggerModule`，然后设置记录器上下文，并开始使用包含上下文的自定义记录器，如下：

```typescript
import { Injectable } from '@nestjs/common';
import { MyLogger } from './my-logger.service';

@Injectable()
export class CatsService {
  private readonly cats: Cat[] = [];

  constructor(private myLogger: MyLogger) {
    this.myLogger.setContext('CatsService');
  }

  findAll(): Cat[] {
    this.myLogger.warn('About to return cats!');
    return this.cats;
  }
}
```
最后，告诉Nest在你如下的`main.ts`文件中使用一个自定义记录器实例。当然，在本例中，我们没有实际自定义记录器行为（通过扩展`Logger`方法例如`log()`、`warn()`等），因此该步骤并不是必须的。但如果你为这些方法添加了自定义逻辑，并且希望Nest使用它们时就应该这样做：

```typescript
const app = await NestFactory.create(ApplicationModule, {
  logger: false,
});
app.useLogger(new MyLogger());
await app.listen(3000);

```
### 使用外部记录器

生产环境应用通常包括特定的记录需求，包括高级过滤器，格式化和中心化记录。`Nest`的内置记录器用于监控Nest系统状态，在开发时也可以为你的特征模块提供实用的基础的文本格式的记录，但生产环境可能更倾向于使用类似[Winston](https://github.com/winstonjs/winston)的模块，这是一个标准的Node.js应用，你可以在Nest中体验到类似模块的优势。

## 文件上传

为了处理文件上传，`Nest` 提供了一个内置的基于[multer](https://github.com/expressjs/multer)中间件包的 `Express`模块。`Multer` 处理以 `multipart/form-data` 格式发送的数据，该格式主要用于通过 `HTTP POST` 请求上传文件。这个模块是完全可配置的，您可以根据您的应用程序需求调整它的行为。

!> `Multer`无法处理不是受支持的多部分格式（`multipart/form-data`）的数据。 另外，请注意此程序包与 `FastifyAdapter`不兼容。

### 基本实例

当我们要上传单个文件时, 我们只需将 `FileInterceptor()` 与处理程序绑定在一起, 然后使用 `@UploadedFile()` 装饰器从 `request` 中取出 `file`。

```typescript
@Post('upload')
@UseInterceptors(FileInterceptor('file'))
uploadFile(@UploadedFile() file) {
  console.log(file);
}
```

?> `FileInterceptor()` 装饰器是 `@nestjs/platform-express` 包提供的， `@UploadedFile()` 装饰是 `@nestjs/common` 包提供的。

`FileInterceptor()` 接收两个参数：

 - 一个 `fieldName` (指向包含文件的 HTML 表单的字段) 
 
 - 可选 `options` 对象。这些 `MulterOptions` 等效于传入 `multer` 构造函数 ([此处](https://github.com/expressjs/multer#multeropts)有更多详细信息)


### 文件数组

为了上传文件数组，我们使用 `FilesInterceptor()`。请使用 `FilesInterceptor()` 装饰器(注意装饰器名称中的复数文件)。这个装饰器有三个参数:

- `fieldName`:（保持不变）

- `maxCount`:可选的数字，定义要接受的最大文件数

- `options`:可选的 `MulterOptions` 对象 ，如上所述

使用 `FilesInterceptor()` 时，使用 `@UploadedFiles()` 装饰器从请求中提取文件。

```typescript
@Post('upload')
@UseInterceptors(FilesInterceptor('files'))
uploadFile(@UploadedFiles() files) {
  console.log(files);
}
```

?> `FilesInterceptor()` 装饰器需要导入 `@nestjs/platform-express`，而 `@UploadedFiles()` 导入  `@nestjs/common`。

### 多个文件

要上传多个文件（全部使用不同的键），请使用 `FileFieldsInterceptor()` 装饰器。这个装饰器有两个参数:

- `uploadedFields`:对象数组，其中每个对象指定一个必需的 `name` 属性和一个指定字段名的字符串值(如上所述)，以及一个可选的 `maxCount` 属性(如上所述)

- `options`:可选的 `MulterOptions` 对象，如上所述

使用 `FileFieldsInterceptor()` 时，使用 `@UploadedFiles()` 装饰器从 `request` 中提取文件。

```typescript
@Post('upload')
@UseInterceptors(FileFieldsInterceptor([
  { name: 'avatar', maxCount: 1 },
  { name: 'background', maxCount: 1 },
]))
uploadFile(@UploadedFiles() files) {
  console.log(files);
}
```
### 任何文件

要使用任意字段名称键上载所有字段，请使用 `AnyFilesInterceptor()` 装饰器。该装饰器可以接受如上所述的可选选项对象。

使用 `FileFieldsInterceptor()` 时，使用 `@UploadedFiles()` 装饰器从 `request` 中提取文件。

```typescript
@Post('upload')
@UseInterceptors(AnyFilesInterceptor())
uploadFile(@UploadedFiles() files) {
  console.log(files);
}
```

### 默认选项

您可以像上面描述的那样在文件拦截器中指定 `multer` 选项。要设置默认选项，可以在导入 `MulterModule` 时调用静态 `register()` 方法，传入受支持的选项。您可以使用[这里](https://github.com/expressjs/multer#multeropts)列出的所有选项。

```typescript
MulterModule.register({
  dest: '/upload',
});
```
?> `MulterModule`类从`@nestjs/platform-express`包中导出

### 异步配置

当需要异步而不是静态地设置 `MulterModule` 选项时，请使用 `registerAsync()` 方法。与大多数动态模块一样，`Nest` 提供了一些处理异步配置的技术。

第一种可能的方法是使用工厂函数：

```typescript
MulterModule.registerAsync({
  useFactory: () => ({
    dest: '/upload',
  }),
});
```

与其他工厂提供程序一样，我们的工厂函数可以是异步的，并且可以通过注入注入依赖。

```typescript
MulterModule.registerAsync({
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => ({
    dest: configService.getString('MULTER_DEST'),
  }),
  inject: [ConfigService],
});
```
或者，您可以使用类而不是工厂来配置 `MulterModule`，如下所示:

```typescript
MulterModule.registerAsync({
  useClass: MulterConfigService,
});
```

上面的构造在 `MulterModule` 中实例化 `MulterConfigService` ，使用它来创建所需的 `options` 对象。注意，在本例中，`MulterConfigService` 必须实现 `MulterOptionsFactory` 接口，如下所示。`MulterModule` 将在提供的类的实例化对象上调用 `createMulterOptions()` 方法。

```typescript
@Injectable()
class MulterConfigService implements MulterOptionsFactory {
  createMulterOptions(): MulterModuleOptions {
    return {
      dest: '/upload',
    };
  }
}
```

为了防止创建 `MulterConfigService` 内部 `MulterModule` 并使用从不同模块导入的提供程序，您可以使用  `useExisting` 语法。

```typescript
MulterModule.registerAsync({
  imports: [ConfigModule],
  useExisting: ConfigService,
});
```


## HTTP 模块

[Axios](https://github.com/axios/axios) 是丰富功能的 `HTTP` 客户端, 广泛应用于许多应用程序中。这就是为什么 `Nest` 包装这个包, 并公开它默认为内置 `HttpModule`。`HttpModule` 导出 `HttpService`, 它只是公开了基于 `axios` 的方法来执行 `HTTP` 请求, 而且还将返回类型转换为 `Observables`。

为了使用 `httpservice`，我们需要导入 `HttpModule`。

```typescript
@Module({
  imports: [HttpModule],
  providers: [CatsService],
})
export class CatsModule {}
```

?> `HttpModule` 是 `@nestjs/common` 包提供的

然后，你可以注入 `HttpService`。这个类可以从` @nestjs/common` 包中获取。

```typescript
@Injectable()
export class CatsService {
  constructor(private readonly httpService: HttpService) {}

  findAll(): Observable<AxiosResponse<Cat[]>> {
    return this.httpService.get('http://localhost:3000/cats');
  }
}
```

所有方法都返回 `AxiosResponse`, 并使用 `Observable` 对象包装。

### 配置

`Axios` 提供了许多选项，您可以利用这些选项来增加您的 `HttpService` 功能。[在这里](https://github.com/axios/axios#request-config)阅读更多相关信息。要配置底层库实例，请使用 `register()` 方法的 `HttpModule`。所有这些属性都将传递给 `axios` 构造函数。

```typescript
@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  providers: [CatsService],
})
export class CatsModule {}
```


### 异步配置

通常，您可能希望异步传递模块属性，而不是事先传递它们。在这种情况下，使用  `registerAsync()` 方法，提供了几种处理异步数据的方法。

第一种可能的方法是使用工厂函数：

```typescript
HttpModule.registerAsync({
  useFactory: () => ({
    timeout: 5000,
    maxRedirects: 5,
  }),
});
```

显然，我们的工厂表现得与其他工厂一样（ async 能够通过 inject 注入依赖关系）。

```typescript
HttpModule.registerAsync({
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => ({
    timeout: configService.getString('HTTP_TIMEOUT'),
    maxRedirects: configService.getString('HTTP_MAX_REDIRECTS'),
  }),
  inject: [ConfigService],
});
```

或者，您可以使用类而不是工厂。

```typescript
HttpModule.registerAsync({
  useClass: HttpConfigService,
});
```

上面的构造将在 `HttpModule` 中实例化 `HttpConfigService`，并利用它来创建 `options` 对象。 `HttpConfigService` 必须实现 `HttpModuleOptionsFactory` 接口。

```typescript
@Injectable()
class HttpConfigService implements HttpModuleOptionsFactory {
  createHttpOptions(): HttpModuleOptions {
    return {
      timeout: 5000,
      maxRedirects: 5,
    };
  }
}
```

为了防止在 `HttpModule` 中创建 `HttpConfigService` 并使用从不同模块导入的提供者，您可以使用 `useExisting` 语法。

```typescript
HttpModule.registerAsync({
  imports: [ConfigModule],
  useExisting: ConfigService,
});
```

它的工作原理与 `useClass` 相同，但有一个关键的区别: `HttpModule` 将查找导入的模块来重用已经创建的 `ConfigService`，而不是自己实例化它。

## MVC

`Nest` 默认使用 `Express` 库，因此有关` Express` 中的 `MVC`（模型 - 视图 - 控制器）模式的每个教程都与 `Nest` 相关。首先，让我们使用 `CLI` 工具搭建一个简单的 `Nest` 应用程序：

```bash
$ npm i -g @nestjs/cli
$ nest new project
```

为了创建一个简单的 `MVC` 应用程序，我们必须安装一个[模板引擎](http://expressjs.com/en/guide/using-template-engines.html)：

```bash
$ npm install --save hbs
```

我们决定使用 [hbs](https://github.com/pillarjs/hbs#readme) 引擎，但您可以使用任何符合您要求的内容。安装过程完成后，我们需要使用以下代码配置 `express` 实例：

> main.ts

``` typescript
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
  );

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');

  await app.listen(3000);
}
bootstrap();
```

我们告诉 `express`，该 `public` 目录将用于存储静态文件，  `views` 将包含模板，并且 `hbs` 应使用模板引擎来呈现 `HTML` 输出。

`app.useStaticAssets` 还支持第二个参数来设置虚拟目录。

``` typescript
app.useStaticAssets(join(__dirname, '..', 'public'), { 
  prefix: '/static'
});
```

### 模板渲染

现在，让我们在该文件夹内创建一个 `views` 目录和一个 `index.hbs` 模板。在模板内部，我们将打印从控制器传递的 `message`：

> index.hbs

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>App</title>
  </head>
  <body>
    {{ message }}
  </body>
</html>
```

然后, 打开 `app.controller` 文件, 并用以下代码替换 `root()` 方法:

> app.controller.ts

```typescript
import { Get, Controller, Render } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  @Render('index')
  root() {
    return { message: 'Hello world!' };
  }
}
```


在这个代码中，我们指定模板使用`@Render()`装饰器，同时将路径处理器方法的返回值被传递给要渲染的模板。注意，该返回值是一个包含`message`属性的对象，和我们之前创建模板中的`message`占位符对应。

在应用程序运行时，打开浏览器访问 `http://localhost:3000/` 你应该看到这个 `Hello world!` 消息。

### 动态模板渲染

如果应用程序逻辑必须动态决定要呈现哪个模板，那么我们应该使用 `@Res()`装饰器，并在路由处理程序中提供视图名，而不是在 `@Render()` 装饰器中:

?> 当 `Nest` 检测到 `@Res()` 装饰器时，它将注入特定于库的响应对象。我们可以使用这个对象来动态呈现模板。在[这里](http://expressjs.com/en/api.html)了解关于响应对象 `API` 的更多信息。

> app.controller.ts

```typescript

import { Get, Controller, Render } from '@nestjs/common';
import { Response } from 'express';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  root(@Res() res: Response) {
    return res.render(
      this.appService.getViewName(),
      { message: 'Hello world!' },
    );
  }
}
```

[这里](https://github.com/nestjs/nest/tree/master/sample/15-mvc)有一个可用的例子。

### Fastify

如本章所述，我们可以将任何兼容的 `HTTP` 提供程序与 `Nest` 一起使用。比如  [Fastify](https://github.com/fastify/fastify) 。为了创建具有 `fastify` 的 `MVC` 应用程序，我们必须安装以下包：

```bash
$ npm i --save fastify point-of-view handlebars
```

接下来的步骤几乎涵盖了与 `express` 库相同的内容(差别很小)。安装过程完成后，我们需要打开 `main.ts` 文件并更新其内容:

> main.ts

```typescript
import { NestFactory } from '@nestjs/core';
import { NestFastifyApplication, FastifyAdapter } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  app.useStaticAssets({
    root: join(__dirname, '..', 'public'),
    prefix: '/public/',
  });
  app.setViewEngine({
    engine: {
      handlebars: require('handlebars'),
    },
    templates: join(__dirname, '..', 'views'),
  });
  await app.listen(3000);
}
bootstrap();
```

Fastify的`API` 略有不同，但这些方法调用背后的想法保持不变。使用Fastify时一个明显的需要注意的区别是传递到 `@Render()` 装饰器中的模板名称包含文件扩展名。

> app.controller.ts

```typescript
import { Get, Controller, Render } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  @Render('index.hbs')
  root() {
    return { message: 'Hello world!' };
  }
}
```

在应用程序运行时，打开浏览器并导航至 `http://localhost:3000/` 。你应该看到这个 `Hello world!` 消息。

[这里](https://github.com/nestjs/nest/tree/master/sample/17-mvc-fastify)有一个可用的例子。

## 性能（Fastify）

在底层，`Nest` 使用了[Express](https://expressjs.com/)框架，但如前所述，它提供了与各种其他库的兼容性，例如 [Fastify](https://github.com/fastify/fastify)。`Nest`应用一个框架适配器，其主要功能是代理中间件和处理器到适当的特定库应用中，从而达到框架的独立性。

?> 注意要应用框架适配器，目标库必须提供在`Express` 类似的请求/响应管道处理

`Fastify` 非常适合这里，因为它以与 `express` 类似的方式解决设计问题。然而，`fastify` 的速度要快得多，达到了几乎两倍的基准测试结果。问题是，为什么 `Nest` 仍然使用 `express` 作为默认的HTTP提供程序？因为 `express` 是应用广泛、广为人知的，而且拥有一套庞大的兼容中间件。

但是由于 `Nest` 提供了框架独立性，因此您可以轻松地在它们之间迁移。当您对快速的性能给予很高的评价时，`Fastify` 可能是更好的选择。要使用 `Fastify`，只需选择 `FastifyAdapter`本章所示的内置功能。

### 安装

首先，我们需要安装所需的软件包：

```bash
$ npm i --save @nestjs/platform-fastify
```

### 适配器（Adapter）

安装fastify后，我们可以使用 `FastifyAdapter`。

```typescript
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ApplicationModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    ApplicationModule,
    new FastifyAdapter()
  );
  await app.listen(3000);
}
bootstrap();
```

默认情况下，`Fastify`仅在 `localhost 127.0.0.1` 接口上监听（了解[更多](https://www.fastify.io/docs/latest/Getting-Started/#your-first-server)信息）。如果要接受其他主机上的连接，则应`'0.0.0.0'`在 `listen()` 呼叫中指定：

```typescript
async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    ApplicationModule,
    new FastifyAdapter()
  );
  await app.listen(3000, '0.0.0.0');
}
```

### 平台特定的软件包

请记住，当您使用 `FastifyAdapter` 时，`Nest` 使用 `Fastify` 作为 `HTTP` 提供程序。 这意味着依赖 `Express` 的每个配方都可能不再起作用。 您应该改为使用 `Fastify` 等效程序包。

### 重定向响应

`Fastify` 处理重定向响应的方式与 `Express` 有所不同。要使用 `Fastify` 进行正确的重定向，请同时返回状态代码和 `URL`，如下所示：

```typescript
@Get()
index(@Res() res) {
  res.status(302).redirect('/login');
}
```
### Fastify 选项

您可以通过构造函数将选项传递给 `Fastify`的构造 `FastifyAdapter` 函数。例如：

```typescript
new FastifyAdapter({ logger: true })
```

### 例子

[这里](https://github.com/nestjs/nest/tree/master/sample/10-fastify)有一个工作示例


 ### 译者署名

| 用户名 | 头像 | 职能 | 签名 |
|---|---|---|---|
| [@zuohuadong](https://github.com/zuohuadong)  | <img class="avatar-66 rm-style" src="https://i.loli.net/2020/03/24/ed8yXDRGni4paQf.jpg">  |  翻译  | 专注于 caddy 和 nest，[@zuohuadong](https://github.com/zuohuadong/) at Github  |
| [@Drixn](https://drixn.com/)  | <img class="avatar-66 rm-style" src="https://cdn.drixn.com/img/src/avatar1.png">  |  翻译  | 专注于 nginx 和 C++，[@Drixn](https://drixn.com/) |
[@Armor](https://github.com/Armor-cn)  | <img class="avatar-66 rm-style" height="70" src="https://avatars3.githubusercontent.com/u/31821714?s=460&v=4">  |  翻译  | 专注于 Java 和 Nest，[@Armor](https://armor.ac.cn/) |
| [@Erchoc](https://github.com/erchoc)  | <img class="avatar-66 rm-style" height="70" src="https://avatars1.githubusercontent.com/u/19908809?s=400&u=e935620bf39d85bfb749a4ce4b3758b086a57de5&v=4">  |  翻译  | 学习更优雅的架构方式，做更贴切用户的产品。[@Erchoc](https://github/erchoc) at Github |
| [@havef](https://havef.github.io)  | <img class="avatar-66 rm-style" height="70" src="https://avatars1.githubusercontent.com/u/54462?s=460&v=4">  |  校正  | 数据分析、机器学习、TS/JS技术栈 [@havef](https://havef.github.io) |
| [@weizy0219](https://github.com/weizy0219)  | <img class="avatar-66 rm-style" height="70" src="https://avatars3.githubusercontent.com/u/19883738?s=60&v=4">  |  翻译  | 专注于TypeScript全栈、物联网和Python数据科学，[@weizhiyong](https://www.weizhiyong.com) | 
