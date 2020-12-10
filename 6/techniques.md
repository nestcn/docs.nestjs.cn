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

1. 只有在验证了用户之后，才会调用路由处理程序

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

> auth/auth.module.tsJS

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

我们现在可以处理我们的最终需求:通过要求在请求时提供有效的 `JWT` 来保护端点。护照对我们也有帮助。它提供了用于用 `JSON Web` 标记保护 `RESTful` 端点的 `passport-jwt` 策略。在 `auth` 文件夹中创建 `jwt.strategy.ts`文件，并添加以下代码:

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

`secretOrkey`:我们使用权宜的选项来提供对称的密钥来签署令牌。其他选项，如 `pemo` 编码的公钥，可能更适合于生产应用程序(有关更多信息，请参见[此处](https://github.com/mikenicholson/passport-jwt#extracting-the-jwt-from-the-request))。如前所述，无论如何，不要把这个密钥公开。

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

我们现在已经完成了 `JWT` 身份验证实现。`JavaScript` 客户端(如 `Angular/React/Vue` )和其他 `JavaScript` 应用程序现在可以安全地与我们的 `API` 服务器进行身份验证和通信。

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

### 自定义 Passport
 
根据所使用的策略，护照会采用一系列影响库行为的属性。使用  `register()` 方法将选项对象直接传递给护照实例。

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

在实现策略时，可以通过向 `PassportStrategy` 函数传递第二个参数来为其提供名称。如果你不这样做，每个战略将有一个默认的名称(例如，"jwt"的 `jwt`策略 ):

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

要在 `graphql` 解析器中获得当前经过身份验证的用户，可以定义一个用户装饰器:

```typescript
import { createParamDecorator } from '@nestjs/common';
export const CurrentUser = createParamDecorator(
  (data, [root, args, ctx, info]) => ctx.req.user,
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

为了方便起见，`Nest` 还提供了与现成的 `TypeORM` 与 `@nestjs/typeorm` 的紧密集成，我们将在本章中对此进行介绍，而与 `@nestjs/mongoose` 的紧密集成将在本章中介绍。这些集成提供了附加的特定于 `nestjs` 的特性，比如模型/存储库注入、可测试性和异步配置，从而使访问您选择的数据库更加容易。

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

 `forRoot()` 方法接受与来自 `TypeORM`包的 `createConnection()` 相同的配置对象。另外，我们可以创建 `ormconfig.json` ，而不是将配置对象传递给 `forRoot()`。

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

?> 静态全局路径(例如 `dist/**/*.entity{ .ts,.js}` )不适用于Webpack热重载。

然后，我们可以调用 `forRoot()` 没有任何选项:

> app.module.ts

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forRoot()],
})
export class AppModule {}
```

一旦完成，`TypeORM` 连接和 `EntityManager` 对象就可以在整个项目中注入(不需要导入任何模块)，例如:

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

为了继续这个示例，我们需要至少一个实体。我们将使用官方TypeORM文档中的 `Photo` 实体。

> photo/photo.entity.ts

```typescript
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Photo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 500 })
  name: string;

  @Column('text')
  description: string;

  @Column()
  filename: string;

  @Column('int')
  views: number;

  @Column()
  isPublished: boolean;
}
```

该 `Photo` 实体属于该 `photo` 目录。这个目录代表了 `PhotoModule`。这是你决定在哪里保留你的模型文件。从我的观点来看，最好的方法是将它们放在他们的域中, 放在相应的模块目录中。

开始使用 `photo` 实体，我们需要让 `TypeORM` 知道它插入实体数组:

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
      entities: [Photo],
      synchronize: true,
    }),
  ],
})
export class AppModule {}
```

现在让我们看一下 `PhotoModule`：

> photo.module.ts

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PhotoService } from './photo.service';
import { PhotoController } from './photo.controller';
import { Photo } from './photo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Photo])],
  providers: [PhotoService],
  controllers: [PhotoController],
})
export class PhotoModule {}
```

此模块使用 `forFeature()` 方法定义在当前范围中注册哪些存储库。这样，我们就可以使用 `@InjectRepository()`装饰器将 `PhotoRepository` 注入到 `PhotoService` 中:

> photo.service.ts

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Photo } from './photo.entity';

@Injectable()
export class PhotoService {
  constructor(
    @InjectRepository(Photo)
    private readonly photoRepository: Repository<Photo>,
  ) {}

  findAll(): Promise<Photo[]> {
    return this.photoRepository.find();
  }
}
```

?> 不要忘记将 `PhotoModule` 导入根 `ApplicationModule`。

如果要在导入`TypeOrmModule.forFeature` 的模块之外使用存储库，则需要重新导出由其生成的提供程序。 您可以通过导出整个模块来做到这一点，如下所示：

> photo.module.ts

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Photo } from './photo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Photo])],
  exports: [TypeOrmModule]
})
export class PhotoModule {}
```
现在，如果我们在 `PhotoHttpModule` 中导入 `PhotoModule` ，我们可以在后一个模块的提供者中使用 `@InjectRepository(Photo)`。

> photo-http.module.ts

```typescript
import { Module } from '@nestjs/common';
import { PhotoModule } from './photo.module';
import { PhotoService } from './photo.service';
import { PhotoController } from './photo.controller';

@Module({
  imports: [PhotoModule],
  providers: [PhotoService],
  controllers: [PhotoController]
})
export class PhotoHttpModule {}
```

### 多个数据库

某些项目可能需要多个数据库连接。幸运的是，这也可以通过本模块实现。要使用多个连接，首先要做的是创建这些连接。在这种情况下，连接命名成为必填项。

假设你有一个 `Person` 实体和一个 `Album` 实体，每个实体都存储在他们自己的数据库中。

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
      host: 'photo_db_host',
      entities: [Photo],
    }),
    TypeOrmModule.forRoot({
      ...defaultOptions,
      name: 'personsConnection',
      host: 'person_db_host',
      entities: [Person],
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

此时，您的 `Photo` 、 `Person` 和 `Album` 实体中的每一个都已在各自的连接中注册。通过此设置，您必须告诉 `TypeOrmModule.forFeature()` 函数和 `@InjectRepository()` 装饰器应该使用哪种连接。如果不传递任何连接名称，则使用 `default` 连接。

```typescript
@Module({
  imports: [
    TypeOrmModule.forFeature([Photo]),
    TypeOrmModule.forFeature([Person], 'personsConnection'),
    TypeOrmModule.forFeature([Album], 'albumsConnection'),
  ],
})
export class AppModule {}
```

您也可以为给定的连接注入 `Connection` 或 `EntityManager`：

```typescript
@Injectable()
export class PersonService {
  constructor(
    @InjectConnection('personsConnection')
    private readonly connection: Connection,
    @InjectEntityManager('personsConnection')
    private readonly entityManager: EntityManager,
  ) {}
}
```

### 测试

在单元测试我们的应用程序时，我们通常希望避免任何数据库连接，从而使我们的测试适合于独立，并使它们的执行过程尽可能快。但是我们的类可能依赖于从连接实例中提取的存储库。那是什么？解决方案是创建假存储库。为了实现这一点，我们设置了自定义提供者。事实上，每个注册的存储库都由 `entitynamereposition` 标记表示，其中 `EntityName` 是实体类的名称。

`@nestjs/typeorm` 包提供了基于给定实体返回准备好 `token` 的 `getRepositoryToken()` 函数。

```typescript
@Module({
  providers: [
    PhotoService,
    {
      provide: getRepositoryToken(Photo),
      useValue: mockRepository,
    },
  ],
})
export class PhotoModule {}
```

现在, 将使用硬编码 `mockRepository` 作为 `PhotoRepository`。每当任何提供程序使用 `@InjectRepository()` 装饰器请求 `PhotoRepository` 时, `Nest` 会使用注册的 `mockRepository` 对象。

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

我们的工厂的行为与任何其他异步提供者一样(例如，它可以是异步的，并且它能够通过注入注入依赖)。

```typescript
TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => ({
    type: 'mysql',
    host: configService.getString('HOST'),
    port: configService.getString('PORT'),
    username: configService.getString('USERNAME'),
    password: configService.getString('PASSWORD'),
    database: configService.getString('DATABASE'),
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    synchronize: true,
  }),
  inject: [ConfigService],
});
```

或者，您可以使用类而不是工厂。

```typescript
TypeOrmModule.forRootAsync({
  useClass: TypeOrmConfigService,
});
```

上面的构造将 `TypeOrmConfigService` 在内部进行实例化 `TypeOrmModule`，并将利用它来创建选项对象。在 `TypeOrmConfigService` 必须实现 `TypeOrmOptionsFactory` 的接口。

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

## Mongo

`Nest`支持两种与 [MongoDB](http://www.mongodb.org/) 数据库集成的方式。既使用[ORM](https://github.com/typeorm/typeorm) 提供的 MongoDB 支撑或对象建模工具 [Mongoose](http://mongoosejs.com/)。选择 `ORM` 的话你可以按照以前的步骤使用 `typeorm`  。否则请使用我们 `Nest` 专用包: `@nestjs/mongoose`。

首先，我们需要安装所有必需的依赖项：

```
$ npm install --save @nestjs/mongoose mongoose
```

安装过程完成后，我们可以将其 `MongooseModule` 导入到根目录中 `ApplicationModule` 。

> app.module.ts

```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [MongooseModule.forRoot('mongodb://localhost/nest')],
})
export class AppModule {}
```

该 `forRoot()` 和 [mongoose](http://mongoosejs.com/) 包中的 `mongoose.connect()` 一样的参数对象。如下所述。

### 模型注入

`cat.schema.ts` 文件驻在 `cats` 目录中的一个文件夹中，我们还在其中定义了 `CatsModule`。虽然您可以将模式文件存储在您喜欢的任何地方，但是我们建议将它们存储在相关的域对象附近的适当模块目录中。

让我们来看看:

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

`MongooseModule` 提供了 `forFeature()` 方法来配置模块，包括定义应该在当前范围内注册哪些模型。如果您还想在另一个模块中使用模型，请将 `MongooseModule` 添加到 `CatsModule` 的导出部分，并在另一个模块中导入`CatsModule`。

注册模式后，可以使用 `@InjectModel()` 装饰器将 `Cat` 模型注入到 `CatsService` 中:

> cats.service.ts

```typescript
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cat } from './interfaces/cat.interface';
import { CreateCatDto } from './dto/create-cat.dto';

@Injectable()
export class CatsService {
  constructor(@InjectModel('Cat') private readonly catModel: Model<Cat>) {}

  async create(createCatDto: CreateCatDto): Promise<Cat> {
    const createdCat = new this.catModel(createCatDto);
    return await createdCat.save();
  }

  async findAll(): Promise<Cat[]> {
    return await this.catModel.find().exec();
  }
}
```

### 测试

在单元测试我们的应用程序时，我们通常希望避免任何数据库连接，使我们的测试套件独立并尽可能快地执行它们。但是我们的类可能依赖于从连接实例中提取的模型。

为了简化这一过程，`@nestjs/mongoose` 包公开了一个 `getModelToken()` 函数，该函数根据一个 `token` 名称返回一个准备好的注入`token`。使用此 `token`，您可以轻松地使用任何标准自定义提供程序技术(包括 `useClass`、`useValue` 和 `useFactory`)提供模拟实现。例如:

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

通常，您可能希望异步传递模块选项，而不是事先传递它们。在这种情况下，使用 `forRootAsync()` 方法，提供了几种处理异步数据的方法。

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
## 配置

应用程序通常在不同的环境中运行。根据环境的不同，应该使用不同的配置设置。例如，通常本地环境依赖于特定的数据库凭据，仅对本地DB实例有效。生产环境将使用一组单独的DB凭据。由于配置变量会更改，所以最佳实践是将[配置变量](https://12factor.net/config)存储在环境中。

通过 `process.env` 全局，`xternal` 定义的环境变量在` Node.js` 内部可见。 我们可以尝试通过在每个环境中分别设置环境变量来解决多个环境的问题。 这会很快变得难以处理，尤其是在需要轻松模拟或更改这些值的开发和测试环境中。

在 `Node.js` 应用程序中，通常使用 `.env` 文件，其中包含键值对，其中每个键代表一个特定的值，以代表每个环境。 在不同的环境中运行应用程序仅是交换正确的`.env` 文件的问题。

在 `Nest` 中使用这种技术的一个好方法是创建一个 `ConfigModule` ，它公开一个 `ConfigService` ，根据 `$NODE_ENV` 环境变量加载适当的 `.env` 文件。

### 安装

为了解析我们的环境文件，我们将使用 `dotenv` 包。

```bash
$ npm i --save dotenv
$ npm i --save-dev @types/dotenv
```

### 服务

首先，我们创建一个 `ConfigService` 类，它将执行必要的 `.env` 文件解析并提供读取配置变量的接口。

> config/config.service.ts

```typescript
import * as dotenv from 'dotenv';
import * as fs from 'fs';

export class ConfigService {
  private readonly envConfig: Record<string, string>;

  constructor(filePath: string) {
    this.envConfig = dotenv.parse(fs.readFileSync(filePath))
  }

  get(key: string): string {
    return this.envConfig[key];
  }
}
```

这个类只有一个参数，`filePath` 是你的 `.env` 文件的路径。提供 `get()` 方法以启用对私有 `envConfig` 对象的访问，该对象包含在环境文件中定义的每个属性。

最后一步是创建一个 `ConfigModule`。

```typescript
import { Module } from '@nestjs/common';
import { ConfigService } from './config.service';

@Module({
  providers: [
    {
      provide: ConfigService,
      useValue: new ConfigService(`${process.env.NODE_ENV || 'development'}.env`),
    },
  ],
  exports: [ConfigService],
})
export class ConfigModule {}
```

`ConfigModule` 注册一个 `ConfigService` ，并将其导出为在其他消费模块中可见。此外，我们使用 `useValue` 语法(参见自定义提供程序)来传递到 `.env` 文件的路径。此路径将根据 `NODE_ENV` 环境变量中包含的实际执行环境而不同(例如，'开发'、'生产'等)。

现在您可以简单地在任何地方注入 `ConfigService` ，并根据传递的密钥检索特定的配置值。

> development.env

```
DATABASE_USER = test;
DATABASE_PASSWORD = test;
```

### 使用 ConfigService

要从 `ConfigService` 访问环境变量，我们需要注入它。因此我们首先需要导入该模块。

> app.module.ts

```typescript
@Module({
  imports: [ConfigModule],
  ...
})
```

然后我们可以使用标准的构造函数注入，并在我们的类中使用它:

> app.service.ts

```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from './config/config.service';

@Injectable()
export class AppService {
  private isAuthEnabled: boolean;
  constructor(config: ConfigService) {
    // Please take note that this check is case sensitive!
    this.isAuthEnabled = config.get('IS_AUTH_ENABLED') === 'true';
  }
```

?> 您可以选择将 `ConfigModule` 声明为全局模块，而不是在每个模块中导入 `ConfigModule`。

### 高级配置

我们刚刚实现了一个基础 `ConfigService`。但是，这种方法有几个缺点，我们现在将解决这些缺点:

* 缺少环境变量的名称和类型（无智能感知）
* 缺少提供对 `.env` 文件的验证
* env文件将布尔值作为string (`'true'`),提供，因此每次都必须将它们转换为 `boolean`

### 验证

我们将从验证提供的环境变量开始。如果未提供所需的环境变量或者它们不符合您的预定义要求，则可以抛出错误。为此，我们将使用 `npm` 包 [Joi](https://github.com/hapijs/joi)。通过 `Joi`，您可以定义一个对象模式（ `schema` ）并根据它来验证  `JavaScript` 对象。

安装 `Joi` 和它的类型（用于 `TypeScript` 用户）：

```bash
$ npm install --save @hapi/joi
$ npm install --save-dev @types/hapi__joi
```

安装软件包后，我们就可以转到 `ConfigService`。

> config.service.ts

```typescript
import * as dotenv from 'dotenv';
import * as Joi from '@hapi/joi';
import * as fs from 'fs';

export type EnvConfig = Record<string, string>;

export class ConfigService {
  private readonly envConfig: EnvConfig;

  constructor(filePath: string) {
    const config = dotenv.parse(fs.readFileSync(filePath));
    this.envConfig = this.validateInput(config);
  }

  /**
   * Ensures all needed variables are set, and returns the validated JavaScript object
   * including the applied default values.
   */
  private validateInput(envConfig: EnvConfig): EnvConfig {
    const envVarsSchema: Joi.ObjectSchema = Joi.object({
      NODE_ENV: Joi.string()
        .valid('development', 'production', 'test', 'provision')
        .default('development'),
      PORT: Joi.number().default(3000),
      API_AUTH_ENABLED: Joi.boolean().required(),
    });

    const { error, value: validatedEnvConfig } = envVarsSchema.validate(
      envConfig,
    );
    if (error) {
      throw new Error(`Config validation error: ${error.message}`);
    }
    return validatedEnvConfig;
  }
}
```

由于我们为 `NODE_ENV` 和 `PORT` 设置了默认值，因此如果不在环境文件中提供这些变量，验证将不会失败。然而, 我们需要明确提供 `API_AUTH_ENABLED`。如果我们的 `.env` 文件中的变量不是模式（ `schema` ）的一部分, 则验证也会引发错误。此外，`Joi` 还会尝试将 `env` 字符串转换为正确的类型。

### 类属性

对于每个配置属性，我们必须添加一个getter方法。

> config.service.ts

```typescript
get isApiAuthEnabled(): boolean {
  return Boolean(this.envConfig.API_AUTH_ENABLED);
}
```

现在我们可以像下面这样使用getter函数:

> app.service.ts

```typescript
@Injectable()
export class AppService {
  constructor(config: ConfigService) {
    if (config.isApiAuthEnabled) {
      // Authorization is enabled
    }
  }
}
```

## 验证

验证是任何现有 `Web` 应用程序的基本功能。为了自动验证传入请求，`Nest` 提供了一个内置的 `ValidationPipe` ，它使用了功能强大的[class-validator](https://github.com/typestack/class-validator)包及其声明性验证装饰器。 `ValidationPipe` 提供了一种对所有传入的客户端有效负载强制执行验证规则的便捷方法，其中在每个模块的本地类/ `DTO` 声明中使用简单的注释声明特定的规则。

### 概览

在 [Pipes](/6/pipes.md) 一章中，我们完成了构建简化验证管道的过程。为了更好地了解我们在幕后所做的工作，我们强烈建议您阅读本文。在这里，我们将重点讨论 `ValidationPipe` 的各种实际用例，并使用它的一些高级定制特性。

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
现在我们可以在 `CreateUserDto` 中添加一些验证规则。我们使用 `class-validator` 包提供的装饰器来实现这一点，这里有详细的描述。以这种方式，任何使用 `CreateUserDto` 的路由都将自动执行这些验证规则。

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
  "message": [
    {
      "target": {},
      "property": "email",
      "children": [],
      "constraints": {
        "isEmail": "email must be an email"
      }
    }
  ]
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

### 自动有效负载转换

来自网络的有效负载是普通的 `JavaScript` 对象。`ValidationPipe` 可以根据对象的 `DTO` 类自动将有效负载转换为对象类型。若要启用自动转换，请将转换设置为 `true`。

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    transform: true,
  })
);
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

**[译者注：查看相关使用方法](https://www.jianshu.com/p/e7b0f3eb3aed)**

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

?> 警告: 只有使用 `@Get()` 方式声明的节点会被缓存。此外，注入本机响应对象( `@Res()` )的 `HTTP` 服务器路由不能使用缓存拦截器。有关详细信息，请参见响应映射。

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

### WebSockets 和 微服务

显然，您可以毫不费力地使用 `CacheInterceptor WebSocket` 订阅者模式以及 `Microservice` 的模式（无论使用何种服务间的传输方法）。

?> 译者注: 微服务架构中服务之间的调用需要依赖某种通讯协议介质，在 `nest` 中不限制你是用消息队列中间价，`RPC/gRPC` 协议或者对外公开 `API` 的 `HTTP` 协议。

```typescript
@CacheKey('events')
@UseInterceptors(CacheInterceptor)
@SubscribeMessage('events')
handleEvent(client: Client, data: string[]): Observable<string[]> {
  return [];
}
```
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


在发送实际响应之前， `Serializers` 为数据操作提供了干净的抽象层。例如，应始终从最终响应中排除敏感数据（如用户密码）。此外，某些属性可能需要额外的转换，比方说，我们不想发送整个数据库实体。相反，我们只想选择 `id` 和 `name` 。其余部分应自动剥离。不幸的是，手动映射所有实体可能会带来很多麻烦。

?> 译者注: `Serialization` 实现可类比 `composer` 库中 `fractal` ，响应给用户的数据不仅仅要剔除设计安全的属性，还需要剔除一些无用字段如 `create_time`,  `delete_time`,` update_time` 和其他属性。在 `JAVA` 的实体类中定义 `N` 个属性的话就会返回 `N` 个字段，解决方法可以使用范型编程，否则操作实体类回影响数据库映射字段。

### 概要

为了提供一种直接的方式来执行这些操作， `Nest` 附带了这个  `ClassSerializerInterceptor` 类。它使用[类转换器](https://github.com/typestack/class-transformer)来提供转换对象的声明性和可扩展方式。基于此类基础下，可以从类转换器 `ClassSerializerInterceptor` 中获取方法和调用  `classToPlain()` 函数返回的值。

### 排除属性

让我们假设一下，如何从一个含有多属性的实体中剔除 `password` 属性 ？

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
然后，直接在控制器的方法中调用就能获得此类 `UserEntity` 的实例。

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

?> 提示: `@ClassSerializerInterceptor()` 装饰器来源于 `@nestjs/common` 包。

现在当你调用此服务时，将收到以下响应结果：

```json
{
  "id": 1,
  "firstName": "Kamil",
  "lastName": "Mysliwiec"
}
```

注意，拦截器可以应用于整个应用程序。拦截器和实体类声明的组合确保返回 `UserEntity` 的任何方法都将确保删除 `password` 属性。

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

### 通过属性

可变选项可能因某些因素而异。要覆盖默认设置，请使用 `@SerializeOptions()` 装饰器。

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

（更新中）

## 压缩


压缩可以大大减小响应主体的大小，从而提高 `Web` 应用程序的速度。使用[压缩中间件](https://github.com/expressjs/compression)启用 `gzip` 压缩。

### 安装

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

?> 提示: 如果你在使用的是 `FastifyAdapter`，请考虑使用 [fastify-compress](https://github.com/fastify/fastify-compress) 代替。

对于生产中的高流量网站，实施压缩的最佳方法是在反向代理级别实施。在这种情况下，您不需要使用压缩中间件。

## 安全

在本章中，您将学习一些可以提高应用程序安全性的技术。

### Helmet

通过适当地设置 `HTTP` 头，[Helmet](https://github.com/helmetjs/helmet) 可以帮助保护您的应用免受一些众所周知的 `Web` 漏洞的影响。通常，`Helmet` 只是`12`个较小的中间件函数的集合，它们设置与安全相关的 `HTTP` 头（[阅读更多](https://github.com/helmetjs/helmet#how-it-works)）。首先，安装所需的包：

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

跨源资源共享（`CORS`）是一种允许从另一个域请求资源的机制。在引擎盖下，`Nest` 使用了 [cors](https://github.com/expressjs/cors) 包，它提供了一系列选项，您可以根据自己的要求进行自定义。为了启用 `CORS`，您必须调用 `enableCors()` 方法。

```typescript
const app = await NestFactory.create(ApplicationModule);
app.enableCors();
await app.listen(3000);
```

此外，您可以将配置对象作为此函数的参数传递。可用的属性在官方 [cors](https://github.com/expressjs/cors) 存储库中详尽描述。另一种方法是使用 `Nest` 选项对象：

```typescript
const app = await NestFactory.create(ApplicationModule, { cors: true });
await app.listen(3000);
```

您也可以使用 `cors` 配置对象（[更多信息](https://github.com/expressjs/cors#configuration-options)），而不是传递布尔值。

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

?> 提示: 如果您在 `FastifyAdapter` 下开发，请考虑使用 [fastify-rate-limit](https://github.com/fastify/fastify-rate-limit)。


## 日志


 `Nest`附带一个默认的内部日志记录器实现，它在实例化过程中以及在一些不同的情况下使用，比如发生异常等等。但是，有时您可能希望完全禁用日志记录，或者提供自定义实现并自己处理消息。为了关闭记录器，我们使用 `Nest` 应用程序选项对象。

```typescript
const app = await NestFactory.create(ApplicationModule, {
  logger: false,
});
await app.listen(3000);
```

你也可以只启用某些类型的日志:

```typescript
const app = await NestFactory.create(ApplicationModule, {
  logger: ['error', 'warn'],
});
await app.listen(3000);
```

在某些场景中，我们可能希望在底层使用不同的日志记录器。为此，我们必须传递一个实现 `LoggerService` 接口的对象。例如，一个内置的控制台。

```typescript
const app = await NestFactory.create(ApplicationModule, {
  logger: console,
});
await app.listen(3000);
```

但这不是一个最好的办法，我们也可以选择创建自定义的记录器：

```typescript
import { LoggerService } from '@nestjs/common';

export class MyLogger implements LoggerService {
  log(message: string) {}
  error(message: string, trace: string) {}
  warn(message: string) {}
  debug(message: string) {}
  verbose(message: string) {}
}
```

然后，我们可以 `MyLogger` 直接应用实例：

```typescript
const app = await NestFactory.create(ApplicationModule, {
  logger: new MyLogger(),
});
await app.listen(3000);
```

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

### 依赖注入

如果要在 `Logger` 类中启用依赖项注入，则必须使 `MyLogger` 该类成为实际应用程序的一部分。例如，您可以创建一个 `LoggerModule`:

```typescript
import { Module } from '@nestjs/common';
import { MyLogger } from './my-logger.service.ts';

@Module({
  providers: [MyLogger],
  exports: [MyLogger],
})
export class LoggerModule {}
```

一旦 `LoggerModule` 在其他地方导入，框架将负责创建 `Logger` 类的实例。现在，要在整个应用程序中使用相同的 `Logger` 实例，包括引导和错误处理的东西，请使用以下方式：

```typescript
const app = await NestFactory.create(ApplicationModule, {
  logger: false,
});
app.useLogger(app.get(MyLogger));
await app.listen(3000);
```

此解决方案的唯一缺点是您的第一个初始化消息将不会由您的 `Logger` 实例处理，但此时这点并不重要。


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

为了使用 `httppservice`，我们需要导入 `HttpModule`。

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

`Axios` 提供了许多选项，您可以利用这些选项来增加您的 `HttpService` 功能。[在这里](https://github.com/axios/axios#request-config)阅读更多相关信息。要配置底层库实例，请使用 `register()` 方法的 `HttpModule`。

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

所有这些属性都将传递给 `axios` 构造函数。

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

?> 事实上，当 `Nest` 检测到 `@Res()` 装饰器时，它会注入 `response` 对象。在[这里](http://www.expressjs.com.cn/4x/api.html)了解更多关于它的能力。

在应用程序运行时，打开浏览器访问 `http://localhost:3000/` 你应该看到这个 `Hello world!` 消息。

### 动态模板渲染

如果应用程序逻辑必须动态决定要呈现哪个模板，那么我们应该使用 `@Res()`装饰器，并在路由处理程序中提供视图名，而不是在 `@Render()` 装饰器中:

当 `Nest` 检测到 `@Res()` 装饰器时，它将注入特定于库的响应对象。我们可以使用这个对象来动态呈现模板。在[这里](http://expressjs.com/en/api.html)了解关于响应对象 `API` 的更多信息。

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

### MVC（fastify）

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

`API` 略有不同，但这些方法调用背后的想法保持不变。此外，我们还必须确保传递到 `@Render()` 装饰器中的模板名称包含文件扩展名。

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

[这里](https://github.com/nestjs/nest/tree/master/sample/17-mvc-fastify)有 一个可用的例子。

## 性能（Fastify）

在底层，`Nest` 使用了[Express](https://expressjs.com/)，但如前所述，它提供了与各种其他库的兼容性，例如 [Fastify](https://github.com/fastify/fastify)。它是怎么工作的？事实上，`Nest`需要使用您最喜欢的库，它是一个兼容的适配器，它主要将相应的处理程序代理到适当的库特定的方法。此外，您的库必须至少提供与  `express` 类似的请求-响应周期管理。

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



（更新中）

 ### 译者署名

| 用户名 | 头像 | 职能 | 签名 |
|---|---|---|---|
| [@zuohuadong](https://www.zhihu.com/people/dongcang)  | <img class="avatar-66 rm-style" src="https://pic.downk.cc/item/5f4cafe7160a154a67c4047b.jpg">  |  翻译  | 专注于 caddy 和 nest，[@zuohuadong](https://github.com/zuohuadong/) at Github  |
| [@Drixn](https://drixn.com/)  | <img class="avatar-66 rm-style" src="https://cdn.drixn.com/img/src/avatar1.png">  |  翻译  | 专注于 nginx 和 C++，[@Drixn](https://drixn.com/) |
[@Armor](https://github.com/Armor-cn)  | <img class="avatar-66 rm-style" height="70" src="https://avatars3.githubusercontent.com/u/31821714?s=460&v=4">  |  翻译  | 专注于 Java 和 Nest，[@Armor](https://armor.ac.cn/) |
| [@Erchoc](https://github.com/erchoc)  | <img class="avatar-66 rm-style" height="70" src="https://avatars1.githubusercontent.com/u/19908809?s=400&u=e935620bf39d85bfb749a4ce4b3758b086a57de5&v=4">  |  翻译  | 学习更优雅的架构方式，做更贴切用户的产品。[@Erchoc](https://github/erchoc) at Github |
| [@havef](https://havef.github.io)  | <img class="avatar-66 rm-style" height="70" src="https://avatars1.githubusercontent.com/u/54462?s=460&v=4">  |  校正  | 数据分析、机器学习、TS/JS技术栈 [@havef](https://havef.github.io) |
