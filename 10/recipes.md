# 秘籍

## REPL

REPL 是一个简单的交互式环境，它接受单个用户输入，执行这些输入，并将结果返回给用户。REPL 功能允许您直接从终端检查依赖关系图并调用提供程序（和控制器）上的方法。

### 用法

若要在 REPL 模式下运行 NestJS 应用程序，请创建一个新 `repl.ts` 文件 (与现有的 `main.ts` 文件放在一起) ，并在其中添加以下代码：

```typescript
@@filename(repl)
import { repl } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  await repl(AppModule);
}
bootstrap();
@@switch
import { repl } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  await repl(AppModule);
}
bootstrap();
```

现在可以在终端中，使用以下命令启动 REPL：

```bash
$ npm run start -- --entryFile repl
```

> info **提示** `repl` 返回 [Node.js REPL server](https://nodejs.org/api/repl.html) 对象.

启动并运行后，您应该会在控制台中看到以下消息：

```bash
LOG [NestFactory] Starting Nest application...
LOG [InstanceLoader] AppModule dependencies initialized
LOG REPL initialized
```

现在你可以开始与依赖图交互了。例如，您可以检索 `AppService` (我们在这里使用 starter 项目作为示例)并调用 `getHello()` 方法:

```typescript
> get(AppService).getHello()
'Hello World!'
```

您可以从终端中执行任何 JavaScript 代码，例如，将 AppController 的 实例分配给局部变量，并使用 `await` 调用异步方法：

```typescript
> appController = get(AppController)
AppController { appService: AppService {} }
> await appController.getHello()
'Hello World!'
```

要显示给定 provider 或 controller 中可用的所有公共方法，请使用 `methods()` 函数，如下所示:

```typescript
> methods(AppController)

Methods:
 ◻ getHello
```

To print all registered modules as a list together with their controllers and providers, use `debug()`.
要将所有注册的模块以及它们的控制器和提供者打印为一个列表，请使用 `debug()`。

```typescript
> debug()

AppModule:
 - controllers:
  ◻ AppController
 - providers:
  ◻ AppService
```

快速演示：

<figure><img src="/assets/repl.gif" alt="REPL example" /></figure>

您可以在下面的小节中找到有关现有的、预定义的本机方法的更多信息。

### 原生函数

内置的 NestJS REPL 提供了一些全局可用的原生函数。你可以调用 `help()` 来列出它们。

If you don't recall what's the signature (ie: expected parameters and a return type) of a function, you can call `<function_name>.help`.
For instance:

如果你不记得函数的签名是什么(即:预期参数和返回类型)，你可以调用 `<function_name>.help`。
例如

```text
> $.help
Retrieves an instance of either injectable or controller, otherwise, throws exception.
Interface: $(token: InjectionToken) => any
```

> info **提示** 这些函数接口使用[TypeScript函数类型表达式语法](https://www.typescriptlang.org/docs/handbook/2/functions.html#function-type-expressions)编写。

| Function     | Description                                                                                                        | Signature                                                             |
| ------------ | --------------------------------------------------------- | --------------------------------------------------------------------- |
| `debug`      | 将所有注册的模块以及它们的控制器和提供者打印为一个列表。       | `debug(moduleCls?: ClassRef \| string) => void`                       |
| `get` or `$` | 获取可注入对象或控制器的实例，否则抛出异常。                  | `get(token: InjectionToken) => any`                                   |
| `methods`    | 显示给定提供程序或控制器上可用的所有公共方法。                | `methods(token: ClassRef \| string) => void`                          |
| `resolve`    | 解析可注入对象或控制器的瞬态或请求作用域实例，否则抛出异常。   | `resolve(token: InjectionToken, contextId: any) => Promise<any>`      |
| `select`     | 允许在模块树中导航，例如，从选定的模块中拉出特定实例。         | `select(token: DynamicModule \| ClassRef) => INestApplicationContext` |

### 监视模式

在开发过程中，可以在监视模式下运行REPL，以自动反映所有代码更改:

```bash
$ npm run start -- --watch --entryFile repl
```

这有一个缺陷，REPL的命令历史记录在每次重新加载后都会被丢弃，这可能很麻烦。
幸运的是，有一个非常简单的解决方案。像这样修改你的 `bootstrap` 函数:

```typescript
async function bootstrap() {
  const replServer = await repl(AppModule);
  replServer.setupHistory(".nestjs_repl_history", (err) => {
    if (err) {
      console.error(err);
    }
  });
}
```

现在，在运行/重新加载之间保存历史记录。

## CRUD生成器

在一个项目的生命周期中，当我们新增特性的时候，我们通常需要在应用中添加新的资源。这些资源通常需要我们在每次新增资源的时候进行一些重复操作。

### 介绍

想象一下真实世界中的场景，我们需要通过两个CRUD的终端暴露`User`和`Product`两个实体。参考最佳实践，我们为每个实体进行以下操作。

- 生成一个模块 (nest g mo) 来组织代码，使其保持清晰的界限（将相关模块分组）
- 生成一个控制器 (nest g co) 来定义CRUD路径（或者GraphQL应用的查询和变更）
- 生成一个服务 (nest g s) 来表示/隔离业务逻辑
- 生成一个实体类/接口来代表资源数据类型
- 生成数据转换对象（或者`GraphQL`应用输入）来决定数据如何通过网络传输

很多步骤！

为了加速执行重复步骤，`Nest CLI`提供了一个生成器（`schematic(原理)`）可以自动生成所有的模板文件以减少上述步骤，同时让开发者感觉更易用。

> 该`schematic`支持生成`HTTP`控制器，`微服务`控制器，`GraphQL`处理器（代码优先或者原理优先），以及`WebSocket`网关等。

### 生成新资源

在项目根目录下执行以下代码来生成资源。

```bash
$ nest g resource
```

`nest g resource`命令不仅仅生成所有Nestjs构件模块(模块，服务，控制器类)也生成实体类，`DTO`类和测试(.spec)文件。

如下是一个生成的控制器 (`REST API`):

```TypeScript
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
```

它也自动生成了所有CRUD终端占位符（REST API路径，GraphQL查询和编译，微服务和WebSocket网关的消息订阅器）--一键所有内容。

!> 生成的资源类未与任何特定ORM（或者数据源）绑定，以在任何项目下通用。默认地，所有方法都包含了占位符，允许你用特定项目的数据源填充。类似地，如果你需要生成GraphQL应用的处理器，只要在传输层选择GraphQL（代码优先）或者GraphQL(原理优先)即可。

这里生成一个处理器类而不是一个REST API控制器：

```bash
$ nest g resource users

> ? What transport layer do you use? GraphQL (code first)
> ? Would you like to generate CRUD entry points? Yes
> CREATE src/users/users.module.ts (224 bytes)
> CREATE src/users/users.resolver.spec.ts (525 bytes)
> CREATE src/users/users.resolver.ts (1109 bytes)
> CREATE src/users/users.service.spec.ts (453 bytes)
> CREATE src/users/users.service.ts (625 bytes)
> CREATE src/users/dto/create-user.input.ts (195 bytes)
> CREATE src/users/dto/update-user.input.ts (281 bytes)
> CREATE src/users/entities/user.entity.ts (187 bytes)
> UPDATE src/app.module.ts (312 bytes)
```

?> 像这样传递`--no-spec`参数`nest g resource users --no-spec`来避免生成测试文件。

在下面我们可以看到，不仅生成了所有变更和查询的样板文件，也把他们绑定到了一起，我们可以使用`UsersService`, `User Entity`, 和`DTO`。

```TypeScript
import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Mutation(() => User)
  createUser(@Args('createUserInput') createUserInput: CreateUserInput) {
    return this.usersService.create(createUserInput);
  }

  @Query(() => [User], { name: 'users' })
  findAll() {
    return this.usersService.findAll();
  }

  @Query(() => User, { name: 'user' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.usersService.findOne(id);
  }

  @Mutation(() => User)
  updateUser(@Args('updateUserInput') updateUserInput: UpdateUserInput) {
    return this.usersService.update(updateUserInput.id, updateUserInput);
  }

  @Mutation(() => User)
  removeUser(@Args('id', { type: () => Int }) id: number) {
    return this.usersService.remove(id);
  }
}
```

## SWC (快速编译器)

（待翻译）

## Passport (认证)

[Passport](https://github.com/jaredhanson/passport) 是最流行的 node.js 认证库，为社区所熟知，并成功地应用于许多生产应用中。使用 `@nestjs/passport` 模块，可以很容易地将这个库与 **Nest** 应用集成。从高层次来看，`Passport` 执行一系列步骤以：

- 通过验证用户的"凭证"(例如用户名/密码、`JSON Web`令牌( [JWT](https://jwt.io/) )或身份提供者的身份令牌)来验证用户的身份。

- 管理经过身份验证的状态(通过发出可移植的令牌，例如 `JWT`，或创建一个 `Express` 会话)

- 将有关经过身份验证的用户的信息附加到请求对象，以便在路由处理程序中进一步使用

`Passport`具有丰富的[策略](http://www.passportjs.org/)生态系统，可实施各种身份验证机制。 尽管概念上很简单，但是您可以选择的 `Passport` 策略集非常多，并且有很多种类。 `Passport` 将这些不同的步骤抽象为标准模式，而 `@nestjs/passport` 模块将该模式包装并标准化为熟悉的 Nest 构造。

在本章中，我们将使用这些强大而灵活的模块为 `RESTful API`服务器实现完整的端到端身份验证解决方案。您可以使用这里描述的概念来实现 `Passport` 策略，以定制您的身份验证方案。您可以按照本章中的步骤来构建这个完整的示例。

### 认证要求

让我们充实一下我们的需求。对于此用例，客户端将首先使用用户名和密码进行身份验证。一旦通过身份验证，服务器将发出 `JWT`，该 `JWT` 可以在后续请求的授权头中作为 `token`发送，以验证身份验证。我们还将创建一个受保护的路由，该路由仅对包含有效 `JWT` 的请求可访问。

我们将从第一个需求开始:验证用户。然后我们将通过发行 `JWT` 来扩展它。最后，我们将创建一个受保护的路由，用于检查请求上的有效 `JWT` 。

首先，我们需要安装所需的软件包。`Passport` 提供了一种名为 `Passport-local` 的策略，它实现了一种用户名/密码身份验证机制，这符合我们在这一部分用例中的需求。

```bash
$ npm install --save @nestjs/passport passport passport-local
$ npm install --save-dev @types/passport-local
```

?> 对于您选择的 **任何**  `Passport` 策略，都需要 `@nestjs/Passport` 和 `Passport` 包。然后，需要安装特定策略的包(例如，`passport-jwt` 或 `passport-local`)，它实现您正在构建的特定身份验证策略。此外，您还可以安装任何 `Passport`策略的类型定义，如上面的 `@types/passport-local` 所示，它在编写 `TypeScript` 代码时提供了帮助。

### 实现 Passport 策略

现在可以实现身份认证功能了。我们将首先概述用于 **任何** `Passport` 策略的流程。将 `Passport` 本身看作一个框架是有帮助的。框架的优雅之处在于，它将身份验证过程抽象为几个基本步骤，您可以根据实现的策略对这些步骤进行自定义。它类似于一个框架，因为您可以通过提供定制参数(作为 `JSON` 对象)和回调函数( `Passport` 在适当的时候调用这些回调函数)的形式来配置它。 `@nestjs/passport` 模块将该框架包装在一个 `Nest` 风格的包中，使其易于集成到 `Nest` 应用程序中。下面我们将使用 `@nestjs/passport` ，但首先让我们考虑一下 `vanilla Passport` 是如何工作的。

在 `vanilla Passport` 中，您可以通过提供以下两项配置策略:

1. 特定于该策略的选项。例如，在 `JWT` 策略中，您可以提供一个秘令来对令牌进行签名。

2. "验证回调"，在这里您可以告诉 `Passport` 如何与您的用户存储交互(在这里您可以管理用户帐户)。在这里，验证用户是否存在(或创建一个新用户)，以及他们的凭据是否有效。`Passport` 库期望这个回调在验证成功时返回完整的用户消息，在验证失败时返回 `null`(失败定义为用户没有找到，或者在使用 `Passport-local` 的情况下，密码不匹配)。

使用 `@nestjs/passport` ，您可以通过扩展 `PassportStrategy` 类来配置 `passport` 策略。通过调用子类中的 `super()` 方法传递策略选项(上面第 1 项)，可以选择传递一个 `options` 对象。通过在子类中实现 `validate()` 方法，可以提供`verify` 回调(上面第 2 项)。

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

// 这应该是代表一个用户实体的真正的类/接口
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
    return this.users.find((user) => user.username === username);
  }
}
```

在 `UsersModule` 中，唯一需要做的更改是将 `UsersService` 添加到 `@Module` 装饰器的 `exports` 数组中，以便提供给其他模块外部可见(我们很快将在 `AuthService` 中使用它)。

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

### 实现 Passport local

现在我们可以实现 `Passport` 本地身份验证策略。在 auth 文件夹中创建一个名为 `local.strategy.ts` 文件，并添加以下代码:

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

我们遵循了前面描述的所有 `Passport` 策略。在我们的 `passport-local` 用例中，没有配置选项，因此我们的构造函数只是调用 `super()` ，没有 `options` 对象。

?> 我们可以在调用 `super()` 时传递一个选项对象，以自定义 `Passport` 策略的行为。在本例中，`passport-local` 策略默认在请求体中使用名为 `username` 和 `password` 的属性。传递一个选项对象可指定不同的属性名称，例如 `super({{ '{' }} usernameField: 'email' {{ '}' }})` 。 要了解更多信息，请查看 [Passport 文档](http://www.passportjs.org/docs/configure/) 。

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

### 内置 Passport 守卫

守卫章节描述了守卫的主要功能：确定请求是否由路由处理程序。这仍然是正确的，我们将很快使用这个标准功能。但是，在使用 `@nestjs/passport` 模块的情况下，我们还将引入一个新的小问题，这个问题一开始可能会让人感到困惑，现在让我们来讨论一下。从身份验证的角度来看，您的应用程序可以以两种状态存在:

1. 用户/客户端 **未** 登录(未通过身份验证)
2. 用户/客户端 **已** 登录(已通过身份验证)

在第一种情况下(用户没有登录)，我们需要执行两个不同的功能:

- 限制未经身份验证的用户可以访问的路由（即拒绝访问受限制的路由）。 我们将使用熟悉的警卫来处理这个功能，方法是在受保护的路由上放置一个警卫。我们将在这个守卫中检查是否存在有效的 `JWT` ，所以我们稍后将在成功发出 `JWT` 之后处理这个守卫。

- 当以前未经身份验证的用户尝试登录时，启动身份验证步骤。这时我们向有效用户发出 `JWT` 的步骤。考虑一下这个问题，我们知道需要 `POST` 用户名/密码凭证来启动身份验证，所以我们将设置 `POST` `/auth/login` 路径来处理这个问题。这就提出了一个问题:在这条路由上，我们究竟如何实施 `Passport-local` 战略?

答案很简单:使用另一种稍微不同类型的守卫。`@nestjs/passport` 模块为我们提供了一个内置的守卫，可以完成这一任务。这个保护调用 `Passport` 策略并启动上面描述的步骤(检索凭证、运行`verify` 函数、创建用户属性等)。

上面列举的第二种情况(登录用户)仅仅依赖于我们已经讨论过的标准类型的守卫，以便为登录用户启用对受保护路由的访问。

### 登录路由

有了这个策略，我们现在就可以实现一个简单的 `/auth/login` 路由，并应用内置的守卫来启动 `Passport-local` 流。
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

对于 `@UseGuard(AuthGuard('local'))`，我们使用的是一个 `AuthGuard` ，它是在我们扩展 `Passport-local` 策略时 `@nestjs/passportautomatic` 为我们准备的。我们来分析一下。我们的 `Passport` 本地策略默认名为`"local"` 。我们在 `@UseGuards()` 装饰器中引用这个名称，以便将它与 `Passport-local` 包提供的代码关联起来。这用于消除在应用程序中有多个 `Passport` 策略时调用哪个策略的歧义(每个策略可能提供一个特定于策略的 `AuthGuard` )。虽然到目前为止我们只有一个这样的策略，但我们很快就会添加第二个，所以这是消除歧义所需要的。

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

我们已经准备好进入 JWT 部分的认证系统。让我们回顾并完善我们的需求:

- 允许用户使用用户名/密码进行身份验证，返回 `JWT` 以便在后续调用受保护的 `API` 端点时使用。我们正在努力满足这一要求。为了完成它，我们需要编写发出 `JWT` 的代码。

- 创建基于`token` 的有效`JWT` 的存在而受保护的 API 路由。

我们需要安装更多的包来支持我们的 `JWT` 需求:

```bash
$ npm install --save @nestjs/jwt passport-jwt
$ npm install @types/passport-jwt --save-dev
```

`@nest/jwt` 包是一个实用程序包，可以帮助 `jwt` 操作。`passport-jwt` 包是实现 `JWT` 策略的 `Passport`包，`@types/passport-jwt` 提供 `TypeScript` 类型定义。

让我们仔细看看如何处理 `POST` `/auth/login` 请求。我们使用 `Passport-local` 策略提供的内置`AuthGuard` 来装饰路由。这意味着:

1. **只有在用户验证通过之后** ，才会调用路由处理程序

2. req 参数将包含一个用户属性(在 passport-local 身份验证流期间由 `Passport` 填充)

考虑到这一点，我们现在终于可以生成一个真正的 `JWT` ，并以这种方式返回它。为了使我们的服务保持干净的模块化，我们将在 `authService` 中生成 `JWT` 。在 auth 文件夹中添加 `auth.service.ts` 文件，并添加 `login()` 方法，导入`JwtService` ，如下所示:

> auth/auth.service.ts

```typescript
import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService, private readonly jwtService: JwtService) {}

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

首先，在 auth 文件夹下创建 `auth/constants.ts`，并添加以下代码:

> auth/constants.ts

```typescript
export const jwtConstants = {
  secret: 'secretKey',
};
```

我们将使用上方的对象来在 `JWT` 的生成和验证步骤之间共享密钥。

!> **不要公共地暴露这个密钥。** 我们这里这样做是为了清楚地说明代码正在做什么，但在生产系统中，你必须要使用恰当的措施来 **保护这个密钥** ，例如机密库 、环境变量、配置服务等。

现在，打开 `auth` 文件夹下的 `auth.module.ts` ，并将其更新为如下所示：

```typescript
auth / auth.module.ts;

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

我们使用 `register()` 来配置 `JwtModule` ，并传入一个配置对象。要了解更多 Nest `JwtModule` 的信息，请查看 [这里](https://github.com/nestjs/jwt/blob/master/README.md) ；要了解可用配置项的详细信息，请查看 [这里](https://github.com/auth0/node-jsonwebtoken#usage) 。

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

让我们再次使用 cURL 来测试路由。您可以使用 `UsersService` 中硬编码的任何 `user` 对象进行测试。

```bash
$ # POST to /auth/login
$ curl -X POST http://localhost:3000/auth/login -d '{"username": "john", "password": "changeme"}' -H "Content-Type: application/json"
{"access_token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}
$ # 注意：上方的 JWT 省略了一部分
```

### 实现 Passport JWT

我们现在可以实现最后一个需求：通过要求请求中携带有效的 JWT 来保护接口。`Passport` 这里也能帮到我们。它提供了用于用 `JSON Web` 标记保护 `RESTful` 接口的 [passport-jwt](https://github.com/mikenicholson/passport-jwt) 策略。在 `auth` 文件夹中创建文件 `jwt.strategy.ts`，并添加以下代码:

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

`ignoreExpiration`:为了明确起见，我们选择默认的 `false` 设置，它将确保 `JWT` 没有过期的责任委托给 `Passport` 模块。这意味着，如果我们的路由提供了一个过期的 `JWT` ，请求将被拒绝，并发送 `401 Unauthorized` 的响应。`Passport` 会自动为我们办理。

`secretOrKey`:我们使用权宜的选项来提供对称的秘密来签署令牌。其他选项，如 `pemo` 编码的公钥，可能更适合于生产应用程序(有关更多信息，请参见[此处](https://github.com/mikenicholson/passport-jwt#extracting-the-jwt-from-the-request))。如前所述，无论如何， **不要把这个秘密公开** 。

`validate()` 方法值得讨论一下。对于 `JWT` 策略，`Passport` 首先验证 `JWT` 的签名并解码 `JSON `。然后调用我们的 `validate()` 方法，该方法将解码后的 `JSON` 作为其单个参数传递。根据 `JWT` 签名的工作方式，我们可以保证接收到之前已签名并发给有效用户的有效 `token` 令牌。

因此，我们对 `validate()` 回调的响应很简单:我们只是返回一个包含 `userId` 和 `username` 属性的对象。再次回忆一下，`Passport` 将基于 `validate()` 方法的返回值构建一个`user` 对象，并将其作为属性附加到请求对象上。

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

通过导入 `JWT` 签名时使用的相同密钥，我们可以确保 `Passport` 执行的验证阶段和 `AuthService` 执行的签名阶段使用一个公共密钥。

最后，我们定义 `JwtAuthGuard` 类，它扩展了内置的 `AuthGuard` :

> auth/jwt-auth.guard

```typescript
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

### 实现受保护的路由和 JWT 策略守卫

我们现在可以实现受保护的路由及其相关的守卫。

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

同样，我们将应用 `AuthGuard` 守卫，在我们配置 `passport-jwt` 模块时 `@nestjs/passport` 模块自动为我们提供过它。这个守卫由它的默认名称 `jwt` 引用。当我们请求` GET /profile` 路由时，守卫程序将自动调用我们的 `passport-jwt` 自定义配置逻辑，验证 `J

确保应用程序正在运行，并使用 `cURL` 测试路由。

```bash
$ # GET /profile
$ curl http://localhost:3000/profile
$ # result -> {"statusCode":401,"error":"Unauthorized"}

$ # POST /auth/login
$ curl -X POST http://localhost:3000/auth/login -d '{"username": "john", "password": "changeme"}' -H "Content-Type: application/json"
$ # result -> {"access_token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2Vybm... }

$ # GET /profile 使用上一步返回的 JWT 作为 bearer code
$ curl http://localhost:3000/profile -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2Vybm..."
$ # result -> {"userId":1,"username":"john"}
```

注意在 `AuthModule` 中，我们配置了 `JWT` 的过期时间是 `60 秒` 。这是一个很短的时间，而且处理 `JWT` 过期和刷新的细节超出了本文的讨论范围。然而，我们仍然选择了这样设置，以演示 `JWT` 的这个重要特性。如果您在尝试 `GET /auth/profile` 请求之前等待超过了 60 秒，您会收到 `401 Unauthorized` 的响应。这是因为 `Passport` 会自动检查 `JWT` 的过期时间，从而省去了在应用程序中这样做的麻烦。

我们现在已经完成了 `JWT` 认证的实现。JavaScript 客户端（例如 Angular/React/Vue）和其他 JavaScript 应用现在可以安全地使用我们的 API 服务器进行认证和通信。

### 扩展守卫

在大多数情况下，默认提供好的 `AuthGuard` 类已经足够用了。然而，在有些用例中，您会想要简单地扩展默认的错误处理或认证逻辑。为了实现它，您可以扩展内置的类并在子类中覆盖方法。

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
    // 在这里添加您自定义的认证逻辑
    // 例如，调用 super.logIn(request) 来建立一个 session
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    // 您可以基于 "info" 或 "err" 参数抛一个错误
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
```

除了扩展默认的错误处理或认证逻辑，我们可以通过一系列链式策略来进行身份验证。第一个成功、重定向或出错的策略将终止调用链。身份验证失败时，将依次通过每个策略，如果所有策略都失败，则最终失败。

```typescript
export class JwtAuthGuard extends AuthGuard(['strategy_jwt_1', 'strategy_jwt_2', '...']) { ... }
```

### 启用全局身份验证

如果您的大部分接口默认都应该受到保护，您可以将认证守卫注册为 [全局守卫](/10/guards.md?id=绑定守卫) ，接着，您只需要标记哪些路由应为公共路由，而无需在每一个控制器的上方都使用 `@UseGuards()` 装饰器。

首先，在任意一个模块中，（例如在 `AuthModule` 中）使用下方的结构将 `AuthGuard` 注册为全局守卫。

```typescript
providers: [
  {
    provide: APP_GUARD,
    useClass: JwtAuthGuard,
  },
],
```

有了这些，Nest 会自动将 `JwtAuthGuard` 绑定到所有接口上。

现在我们必须提供一个将路由声明为公共路由的机制。为了实现它，我们可以使用 `SetMetadata` 装饰器工厂函数，创建一个自定义装饰器。

```typescript
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

在上面的文件中，我们导出了两个常量。一个是名为 `IS_PUBLIC_KEY` 的元数据键；另一个是名为 `Public` 的新装饰器（您也可以把它命名为任何适用于您项目的名称，例如 `SkipAuth` 或 `AllowAnon`）。

现在我们有了自定义的 `@Public()` 装饰器，我们可以用它来装饰任意方法，如下所示：

```typescript
@Public()
@Get()
findAll() {
  return [];
}
```

最后，当元数据 `"isPublic"` 被找到时，我们需要 `JwtAuthGuard` 返回 `true` 。为了实现它，我们将使用 `Reflector` 类（ [了解更多](/10/guards.md?id=小结) ）。

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

### 请求范围策略

passport API 基于将策略注册到库的全局实例。因此策略并没有设计为依赖请求的选项的或者根据每个请求动态生成实例（更多内容见[请求范围提供者](/10/fundamentals.md?id=所有请求注入)）。当你配置你的策略为请求范围时，`Nest`永远不会将其实例化，因为它并没有和任何特定路径绑定。并没有一个物理方法来决定哪个"请求范围"策略会根据每个请求执行。

然而，在策略中总有办法动态处理请求范围提供者。我们在这里利用[模块参考](/10/fundamentals.md?id=模块参考)特性。

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

在下一步中，请求的实例将被用于获取一个当前上下文标识，而不是生成一个新的（更多关于请求上下文的内容见[这里](/10/fundamentals.md?id=模块参考))。

现在，在`LocalStrategy`类的`validate()`方法中，使用`ContextIdFactory`类中的`getByRequest()`方法来创建一个基于请求对象的上下文 id，并将其传递给`resolve()`调用：

```typescript

async validate(
  request: Request,
  username: string,
  password: string,
) {
  const contextId = ContextIdFactory.getByRequest(request);
  // "AuthService" 是一个请求范围的提供者
  const authService = await this.moduleRef.resolve(AuthService, contextId);
  ...
}
```

在上述例子中，`resolve()`方法会异步返回`AuthService`提供者的请求范围实例（我们假设`AuthService`被标示为一个请求范围提供者）。

### 自定义 Passport

使用 `register()` 方法，任何标准的 Passport 自定义选项都能以相同的方式传递。可用的选项取决于实施的策略。例如：

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

看看 [Passport Website](http://www.passportjs.org/docs/oauth/) 官方文档吧。

### 命名策略

在实现策略时，可以通过向 `PassportStrategy` 函数传递第二个参数来为其提供名称。如果你不这样做，每个策略将有一个默认的名称(例如，"jwt"的 `jwt`策略 ):

```typescript
export class JwtStrategy extends PassportStrategy(Strategy, 'myjwt')
```

然后，通过一个像 `@AuthGuard('myjwt')` 这样的装饰器来引用它。

### GraphQL

为了使用带有 [GraphQL](https://docs.nestjs.com/graphql/quick-start) 的 `AuthGuard` ，扩展内置的 `AuthGuard` 类并覆盖 `getRequest()` 方法。

```typescript
@Injectable()
export class GqlAuthGuard extends AuthGuard('jwt') {
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }
}
```

要在 `graphql` 解析器中获得当前经过身份验证的用户，可以定义一个`@CurrentUser()`装饰器:

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const CurrentUser = createParamDecorator((data: unknown, context: ExecutionContext) => {
  const ctx = GqlExecutionContext.create(context);
  return ctx.getContext().req.user;
});
```

要在解析器中使用上述装饰器，请确保将其作为查询的参数:

```typescript
@Query(returns => User)
@UseGuards(GqlAuthGuard)
whoAmI(@CurrentUser() user: User) {
  return this.userService.findById(user.id);
}
```

## 热重载

对应用程序的引导过程影响最大的是 `TypeScript` 编译。但问题是，每次发生变化时，我们是否必须重新编译整个项目？一点也不。这就是为什么 [webpack](https://github.com/webpack/webpack) `HMR`（Hot-Module Replacement）大大减少了实例化您的应用程序所需的时间。


?> 请注意，`webpack`这不会自动将（例如 `graphql` 文件）复制到 `dist` 文件夹中。类似地，`webpack` 与全局静态路径（例如中的 `entities` 属性 `TypeOrmModule` ）不兼容。

### CLI

如果使用的是 `Nest CLI`，则配置过程非常简单。`CLI` 包装 `webpack`，允许使用 `HotModuleReplacementPlugin`。

### 安装

首先，我们安装所需的软件包：

```bash
$ npm i --save-dev webpack-node-externals run-script-webpack-plugin webpack
```

### 配置（Configuration）

然后，我们需要创建一个` webpack-hmr.config.js`，它是webpack的一个配置文件，并将其放入根目录。

```typescript
const nodeExternals = require('webpack-node-externals');
const { RunScriptWebpackPlugin } = require('run-script-webpack-plugin');

module.exports = function (options, webpack) {
  return {
    ...options,
    entry: ['webpack/hot/poll?100', options.entry],
    externals: [
      nodeExternals({
        allowlist: ['webpack/hot/poll?100'],
      }),
    ],
    plugins: [
      ...options.plugins,
      new webpack.HotModuleReplacementPlugin(),
      new webpack.WatchIgnorePlugin({
        paths: [/\.js$/, /\.d\.ts$/],
      }),
      new RunScriptWebpackPlugin({ name: options.output.filename }),
    ],
  };
};
```

此函数获取包含默认 `webpack` 配置的原始对象，并返回一个已修改的对象和一个已应用的 `HotModuleReplacementPlugin` 插件。

### 热模块更换

为了启用 `HMR`，请打开应用程序入口文件（ `main.ts` ）并添加一些与 `Webpack`相关的说明，如下所示：

```typescript
declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
```

就这样。为了简化执行过程，请将这两行添加到 `package.json` 文件的脚本中。

```json
"start:dev": "nest build --webpack --webpackPath webpack-hmr.config.js --watch"
```

现在只需打开你的命令行并运行下面的命令：

```bash
$ npm run start:dev
```

### 没有使用 CLI

如果您没有使用 `Nest CLI` ，配置将稍微复杂一些(需要更多的手动步骤)。

### 安装

首先安装所需的软件包：

```bash
$ npm i --save-dev webpack webpack-cli webpack-node-externals ts-loader run-script-webpack-plugin
```

### 配置

然后，我们需要创建一个` webpack.config.js`，它是 `webpack` 的一个配置文件，并将其放入根目录。

```typescript
const webpack = require('webpack');
const path = require('path');
const nodeExternals = require('webpack-node-externals');
const { RunScriptWebpackPlugin } = require('run-script-webpack-plugin');

module.exports = {
  entry: ['webpack/hot/poll?100', './src/main.ts'],
  target: 'node',
  externals: [
    nodeExternals({
      allowlist: ['webpack/hot/poll?100'],
    }),
  ],
  module: {
    rules: [
      {
        test: /.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  mode: 'development',
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new RunScriptWebpackPlugin({ name: 'server.js' }),
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'server.js',
  },
};
```

这个配置告诉 `webpack` 关于我们的应用程序的一些基本信息。入口文件位于何处，应使用哪个目录保存已编译的文件，以及我们要使用哪种装载程序来编译源文件。基本上，您不必担心太多，根本不需要了解该文件的内容。

### 热模块更换

为了启用 `HMR` ，我们必须打开应用程序入口文件（ `main.ts` ），并添加一些与 `Webpack` 相关的说明。

```typescript
declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
```

为了简化执行过程，请将两个脚本添加到 `package.json` 文件中。

```bash
"start:dev": "webpack --config webpack.config.js --watch"
```

现在，只需打开命令行并运行以下命令：

```bash
$ npm run start:dev
```

[这里](https://github.com/nestjs/nest/tree/master/sample/08-webpack)有一个可用的例子

## mikroorm

(待翻译)







## TypeORM

**本章仅适用于TypeScript**

!> 在本文中，您将学习如何使用自定义提供者机制从零开始创建基于 **TypeORM** 包的 `DatabaseModule` 。由于该解决方案包含许多开销，因此您可以使用开箱即用的 `@nestjs/typeorm` 软件包。要了解更多信息，请参阅 [此处](/8/techniques.md?id=数据库)。


[TypeORM](https://github.com/typeorm/typeorm) 无疑是 `node.js` 世界中最成熟的对象关系映射器（`ORM` ）。由于它是用 `TypeScript` 编写的，所以它在 `Nest` 框架下运行得非常好。

### 入门

在开始使用这个库前，我们必须安装所有必需的依赖关系

```bash
$ npm install --save typeorm mysql2
```

我们需要做的第一步是使用从 `typeorm` 包导入的 `createConnection()` 函数建立与数据库的连接。`createConnection()` 函数返回一个 `Promise`，因此我们必须创建一个[异步提供者](/8/fundamentals.md?id=异步提供者 ( `Asynchronous providers` ))。

> database.providers.ts

```typescript
import { DataSource } from 'typeorm';

export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    useFactory: async () => {
      const dataSource = new DataSource({
        type: 'mysql',
        host: 'localhost',
        port: 3306,
        username: 'root',
        password: 'root',
        database: 'test',
        entities: [
            __dirname + '/../**/*.entity{.ts,.js}',
        ],
        synchronize: true,
      });

      return dataSource.initialize();
    },
  },
];
```

!> 警告：设置 synchronize: true 不能被用于生产环境，否则您可能会丢失生产环境数据。

?> 按照最佳实践，我们在分离的文件中声明了自定义提供者，该文件带有 `*.providers.ts` 后缀。

然后，我们需要导出这些提供者，以便应用程序的其余部分可以 **访问** 它们。

> database.module.ts

```typescript
import { Module } from '@nestjs/common';
import { databaseProviders } from './database.providers';

@Module({
  providers: [...databaseProviders],
  exports: [...databaseProviders],
})
export class DatabaseModule {}
```

现在我们可以使用 `@Inject()` 装饰器注入 `Connection` 对象。依赖于 `Connection` 异步提供者的每个类都将等待 `Promise` 被解析。

### 存储库模式

[TypeORM](https://github.com/typeorm/typeorm) 支持存储库设计模式，因此每个实体都有自己的存储库。这些存储库可以从数据库连接中获取。

但首先，我们至少需要一个实体。我们将重用官方文档中的 `Photo` 实体。

> photo.entity.ts

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

`Photo` 实体属于 `photo` 目录。此目录代表 `PhotoModule` 。现在，让我们创建一个 **存储库** 提供者:

> photo.providers.ts

```typescript
import { DataSource } from 'typeorm';
import { Photo } from './photo.entity';

export const photoProviders = [
  {
    provide: 'PHOTO_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Photo),
    inject: ['DATA_SOURCE'],
  },
];
```

!> 请注意，在实际应用程序中，您应该避免使用魔术字符串。`PhotoRepositoryToken` 和 `DbConnectionToken` 都应保存在分离的 `constants.ts` 文件中。

在实际应用程序中，应该避免使用魔法字符串。`PHOTO_REPOSITORY` 和 `DATABASE_CONNECTION` 应该保持在单独的 `constants.ts` 文件中。

现在我们可以使用 `@Inject()` 装饰器将 `Repository<Photo>` 注入到 `PhotoService` 中：

> photo.service.ts

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Photo } from './photo.entity';

@Injectable()
export class PhotoService {
  constructor(
    @Inject('PHOTO_REPOSITORY')
    private photoRepository: Repository<Photo>,
  ) {}

  async findAll(): Promise<Photo[]> {
    return this.photoRepository.find();
  }
}
```

数据库连接是 **异步的**，但 `Nest` 使最终用户完全看不到这个过程。`PhotoRepository` 正在等待数据库连接时，并且`PhotoService` 会被延迟，直到存储库可以使用。整个应用程序可以在每个类实例化时启动。

这是一个最终的 `PhotoModule` ：

> photo.module.ts

```typescript
import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { photoProviders } from './photo.providers';
import { PhotoService } from './photo.service';

@Module({
  imports: [DatabaseModule],
  providers: [
    ...photoProviders,
    PhotoService,
  ],
})
export class PhotoModule {}
```

?> 不要忘记将 `PhotoModule` 导入到根 `ApplicationModule` 中。

## Mongoose

!> 在本文中，您将学习如何使用自定义提供者机制从零开始创建基于 **Mongoose** 包的 `DatabaseModule`。由于该解决方案包含许多开销，因此您可以使用开箱即用的 `@nestjs/mongoose` 软件包。要了解更多信息，请参阅 [此处](https://docs.nestjs.com/techniques/mongodb)。

[Mongoose](http://mongoosejs.com/) 是最受欢迎的[MongoDB](https://www.mongodb.org/) 对象建模工具。

### 入门

在开始使用这个库前，我们必须安装所有必需的依赖关系

```bash
$ npm install --save mongoose
$ npm install --save-dev @types/mongoose
```

我们需要做的第一步是使用 `connect()` 函数建立与数据库的连接。`connect()` 函数返回一个 `Promise`，因此我们必须创建一个 [异步提供者](/8/fundamentals.md?id=异步提供者 (Asynchronous providers))。

> database.providers.ts

```typescript
import * as mongoose from 'mongoose';

export const databaseProviders = [
  {
    provide: 'DATABASE_CONNECTION',
    useFactory: (): Promise<typeof mongoose> =>
      mongoose.connect('mongodb://localhost/nest'),
  },
];
```

?> 按照最佳实践，我们在分离的文件中声明了自定义提供者，该文件带有 `*.providers.ts` 后缀。

然后，我们需要导出这些提供者，以便应用程序的其余部分可以 **访问** 它们。

> database.module.ts

```typescript
import { Module } from '@nestjs/common';
import { databaseProviders } from './database.providers';

@Module({
  providers: [...databaseProviders],
  exports: [...databaseProviders],
})
export class DatabaseModule {}
```

现在我们可以使用 `@Inject()` 装饰器注入 `Connection` 对象。依赖于 `Connection` 异步提供者的每个类都将等待 `Promise` 被解析。

### 模型注入

使用Mongoose，一切都来自[Schema](https://mongoosejs.com/docs/guide.html)。 让我们定义 `CatSchema` ：

> schemas/cats.schema.ts

```typescript
import * as mongoose from 'mongoose';

export const CatSchema = new mongoose.Schema({
  name: String,
  age: Number,
  breed: String,
});
```

`CatsSchema` 属于 `cats` 目录。此目录代表 `CatsModule` 。

现在，让我们创建一个 **模型** 提供者:

> cats.providers.ts

```typescript
import { Connection } from 'mongoose';
import { CatSchema } from './schemas/cat.schema';

export const catsProviders = [
  {
    provide: 'CAT_MODEL',
    useFactory: (connection: Connection) => connection.model('Cat', CatSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];
```

!> 请注意，在实际应用程序中，您应该避免使用魔术字符串。`CAT_MODEL` 和 `DATABASE_CONNECTION` 都应保存在分离的 `constants.ts` 文件中。

现在我们可以使用 `@Inject()` 装饰器将 `CAT_MODEL` 注入到 `CatsService` 中：

> cats.service.ts

```typescript
import { Model } from 'mongoose';
import { Injectable, Inject } from '@nestjs/common';
import { Cat } from './interfaces/cat.interface';
import { CreateCatDto } from './dto/create-cat.dto';

@Injectable()
export class CatsService {
  constructor(
    @Inject('CAT_MODEL')
    private catModel: Model<Cat>,
  ) {}

  async create(createCatDto: CreateCatDto): Promise<Cat> {
    const createdCat = new this.catModel(createCatDto);
    return createdCat.save();
  }

  async findAll(): Promise<Cat[]> {
    return this.catModel.find().exec();
  }
}
```

在上面的例子中，我们使用了 `Cat` 接口。 此接口扩展了来自 `mongoose` 包的 `Document` ：

```typescript
import { Document } from 'mongoose';

export interface Cat extends Document {
  readonly name: string;
  readonly age: number;
  readonly breed: string;
}
```

数据库连接是 **异步的**，但 `Nest` 使最终用户完全看不到这个过程。`CatModel` 正在等待数据库连接时，并且`CatsService` 会被延迟，直到存储库可以使用。整个应用程序可以在每个类实例化时启动。

这是一个最终的 `CatsModule` ：

> cats.module.ts

```typescript
import { Module } from '@nestjs/common';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';
import { catsProviders } from './cats.providers';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [CatsController],
  providers: [
    CatsService,
    ...catsProviders,
  ],
})
export class CatsModule {}
```

?> 不要忘记将 `CatsModule` 导入到根 `ApplicationModule` 中。


## Sequelize

### SQL (Sequelize)

本章仅适用于 `TypeScript`

!> 在本文中，您将学习如何使用自定义提供者机制从零开始创建基于 **Sequelize** 包的 `DatabaseModule`。由于该解决方案包含许多开销，因此您可以使用开箱即用的 `@nestjs/sequelize` 软件包。要了解更多信息，请参阅 [此处](https://docs.nestjs.com/techniques/database#sequelize-integration)。

`Sequelize` 是一个用普通 `JavaScript` 编写的流行对象关系映射器( `ORM` )，但是有一个 `Sequelize-TypeScript` 包装器，它为基本 `Sequelize` 提供了一组装饰器和其他附加功能。

### 入门

要开始使用这个库，我们必须安装以下附件:

```bash
$ npm install --save sequelize sequelize-typescript mysql2
$ npm install --save-dev @types/sequelize
```

我们需要做的第一步是创建一个 `Sequelize` 实例，并将一个 `options` 对象传递给构造函数。另外，我们需要添加所有模型（替代方法是使用 `modelPaths` 属性）并同步数据库表。

> database.providers.ts

```typescript

import { Sequelize } from 'sequelize-typescript';
import { Cat } from '../cats/cat.entity';

export const databaseProviders = [
  {
    provide: 'SEQUELIZE',
    useFactory: async () => {
      const sequelize = new Sequelize({
        dialect: 'mysql',
        host: 'localhost',
        port: 3306,
        username: 'root',
        password: 'password',
        database: 'nest',
      });
      sequelize.addModels([Cat]);
      await sequelize.sync();
      return sequelize;
    },
  },
];
```
!> 按照最佳实践，我们在分隔的文件中声明了带有 `*.providers.ts` 后缀的自定义提供程序。

然后，我们需要导出这些提供程序，使它们可用于应用程序的其他部分。

```typescript
import { Module } from '@nestjs/common';
import { databaseProviders } from './database.providers';

@Module({
  providers: [...databaseProviders],
  exports: [...databaseProviders],
})
export class DatabaseModule {}
```

现在我们可以使用 `@Inject()` 装饰器注入 `Sequelize` 对象。 每个将依赖于 `Sequelize` 异步提供程序的类将等待 `Promise` 被解析。

### 模型注入

在 `Sequelize` 中，模型在数据库中定义了一个表。该类的实例表示数据库行。首先，我们至少需要一个实体:

> cat.entity.ts

```typescript
import { Table, Column, Model } from 'sequelize-typescript';

@Table
export class Cat extends Model<Cat> {
  @Column
  name: string;

  @Column
  age: number;

  @Column
  breed: string;
}
```

`Cat` 实体属于 `cats` 目录。 此目录代表 `CatsModule` 。 现在是时候创建一个存储库提供程序了：

> cats.providers.ts

```typescript

import { Cat } from './cat.entity';

export const catsProviders = [
  {
    provide: 'CATS_REPOSITORY',
    useValue: Cat,
  },
];
```

?> 在实际应用中，应避免使用魔术字符串。 `CATS_REPOSITORY` 和 `SEQUELIZE` 都应保存在单独的 `constants.ts` 文件中。

在 `Sequelize` 中，我们使用静态方法来操作数据，因此我们在这里创建了一个别名。

现在我们可以使用 `@Inject()` 装饰器将 `CATS_REPOSITORY` 注入到 `CatsService` 中:

> cats.service.ts

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { CreateCatDto } from './dto/create-cat.dto';
import { Cat } from './cat.entity';

@Injectable()
export class CatsService {
  constructor(
    @Inject('CATS_REPOSITORY') private readonly CATS_REPOSITORY: typeof Cat) {}

  async findAll(): Promise<Cat[]> {
    return this.catsRepository.findAll<Cat>();
  }
}
```

数据库连接是异步的，但是 `Nest` 使此过程对于最终用户完全不可见。 `CATS_REPOSITORY` 提供程序正在等待数据库连接，并且 `CatsService` 将延迟，直到准备好使用存储库为止。 实例化每个类时，启动整个应用程序。

这是最终的 `CatsModule`：

> cats.module.ts

```typescript
import { Module } from '@nestjs/common';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';
import { catsProviders } from './cats.providers';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [CatsController],
  providers: [
    CatsService,
    ...catsProviders,
  ],
})
export class CatsModule {}
```

?> 不要忘记将 `CatsModule` 导入到根 `ApplicationModule` 中。



## 路由模块

【待翻译】

## Swagger

[OpenAPI](https://swagger.io/specification/)(Swagger)规范是一种用于描述 `RESTful API` 的强大定义格式。 `Nest` 提供了一个专用[模块](https://github.com/nestjs/swagger)来使用它。

### 安装

首先，您必须安装所需的包：

```bash
$ npm install --save @nestjs/swagger swagger-ui-express
```

如果你正在使用 `fastify` ，你必须安装 `fastify-swagger` 而不是 `swagger-ui-express` ：

```bash
$ npm install --save @nestjs/swagger fastify-swagger
```

### 引导（Bootstrap）

安装过程完成后，打开引导文件（主要是 `main.ts` ）并使用 `SwaggerModule` 类初始化 Swagger：

```typescript
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ApplicationModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(ApplicationModule);

  const options = new DocumentBuilder()
    .setTitle('Cats example')
    .setDescription('The cats API description')
    .setVersion('1.0')
    .addTag('cats')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
```

`DocumentBuilder` 有助于构建符合 OpenAPI 规范的基础文档。它提供了几种允许设置诸如标题，描述，版本等属性的方法。为了创建一个完整的文档（使用已定义的 HTTP 路由），我们使用 `SwaggerModule` 类的 `createDocument()` 方法。 此方法接收两个参数，即应用程序实例和 Swagger 选项对象。

一旦创建完文档，我们就可以调用 `setup()` 方法。 它接收：

1. Swagger UI 的挂载路径
2. 应用程序实例
3. 上面已经实例化的文档对象

现在，您可以运行以下命令来启动 `HTTP` 服务器：

```bash
$ npm run start
```

应用程序运行时，打开浏览器并导航到 `http://localhost:3000/api` 。 你应该可以看到 Swagger UI

![img](https://docs.nestjs.com/assets/swagger1.png)

`SwaggerModule` 自动反映所有端点。同时，为了展现 Swagger UI，`@nestjs/swagger`依据平台使用 `swagger-ui-express` 或 `fastify-swagger`。

?> 生成并下载 Swagger JSON 文件，只需在浏览器中导航到 `http://localhost:3000/api-json` （如果您的 Swagger 文档是在 `http://localhost:3000/api` 下）。

### 路由参数

`SwaggerModule` 在路由处理程序中查找所有使用的 `@Body()` ， `@Query()` 和 `@Param()` 装饰器来生成 API 文档。该模块利用反射创建相应的模型定义。 看看下面的代码：

```typescript
@Post()
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}
```

!> 要显式地设置主体定义，可以使用 `@ApiBody()` 装饰器（ `@nestjs/swagger` 包）。

基于 `CreateCatDto` ，将创建模块定义：

![img](https://docs.nestjs.com/assets/swagger-dto.png)

如您所见，虽然该类具有一些声明的属性，但定义为空。 为了使类属性对 `SwaggerModule` 可见，我们必须用 `@ApiProperty()` 装饰器对其进行注释或者使用 CLI 插件自动完成（更多请阅读**插件**小节）：

```typescript
import { ApiProperty } from '@nestjs/swagger';

export class CreateCatDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  age: number;

  @ApiProperty()
  breed: string;
}
```

?> 考虑使用 Swagger 插件（请阅读**插件**小节），它会自动帮你完成。

让我们打开浏览器并验证生成的 `CreateCatDto` 模型：

![img](https://docs.nestjs.com/assets/swagger-dto2.png)

另外，`@ApiProperty()` 装饰器允许设计不同[模式对象](https://swagger.io/specification/#schemaObject) 属性:

```typescript
@ApiProperty({
  description: 'The age of a cat',
  min: 1,
  default: 1,
})
age: number;
```

?> 避免显式地输入 `{{"@ApiProperty({ required: false })"}}`，你可以使用 `@ApiPropertyOptional()` 短手装饰器。

为了显式地设置属性的类型，使用`type`键

```typescript
@ApiProperty({
  type: Number,
})
age: number;
```

### 数组

当属性实际上是一个数组时，我们必须手动指定一个类型：

```typescript
@ApiProperty({ type: [String] })
names: string[];
```
?> 考虑使用 Swagger 插件（请阅读**插件**小节），它会自动发现数组。

只需将您的类型作为数组的第一个元素（如上所示）或将 `isArray` 属性设置为 `true` 。

### 循环依赖

当类之间具有循环依赖关系时，请使用惰性函数为 `SwaggerModule` 提供类型信息：

```typescript
@ApiProperty({ type: () => Node })
node: Node;
```
?> 考虑使用 Swagger 插件（请阅读**插件**小节），它会自动发现循环依赖。

### 泛型和接口

由于 TypeScript 不会存储有关泛型或接口的元数据，因此当您在 DTO 中使用它们时，`SwaggerModule` 可能无法在运行时正确生成模型定义。例如，以下代码将不会被 Swagger 模块正确检查：

```typescript
createBulk(@Body() usersDto: CreateUserDto[])
```

为了克服此限制，可以显式设置类型：

```typescript
@ApiBody({ type: [CreateUserDto] })
createBulk(@Body() usersDto: CreateUserDto[])
```
### 类型映射

在你建立例如CRUD（创建/读取/更新/删除）的功能时，基于一个基础的实体类型通常会比较有用。Nest提供了几个有用的函数以实现类型转换，让这个任务更方便一些。

当建立一个输入验证类型（也叫DTO）时，通常会采用同一个类型来建立**crete**和**update**。例如，**create**变量可能需要所有的字段，而**update**则可能需要让所有字段都是可选的。

Nest提供了`PartialType()`函数来保证简化任务并最小化模版。

`PartialType()`函数返回一个类型（类），并将所有输入类型设置为可选的。例如，我们由如下类型开始：

```typescript
import { ApiProperty } from '@nestjs/swagger';

export class CreateCatDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  age: number;

  @ApiProperty()
  breed: string;
}
```
默认地，所有字段都需要。要使用同一字段创建类型，但每个都是可选的，使用`PartialType()`，并传递类型引用（`CreateCatDto`）作为其参数：
```typescript
export class UpdateCatDto extends PartialType(CreateCatDto) {}
```
?> `PartialType()`从`@nestjs/swagger`中导入。

`PickType()`功能从一个输入类型中选择一部分属性来创建一个新类型（类）。例如，我们由如下类型开始：

```typescript
import { ApiProperty } from '@nestjs/swagger';

export class CreateCatDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  age: number;

  @ApiProperty()
  breed: string;
}
```

我们可以使用PickType()函数从这个类中选取一部分属性：
```typescript
export class UpdateCatAgeDto extends PickType(CreateCatDto, ['age'] as const) {}
```
?> `PickType()`从`@nestjs/swagger`中导入。

`OmitType()`函数从一个输入类型中取出所有属性然后移除一些键。例如，我们由如下类型开始：

```typescript
import { ApiProperty } from '@nestjs/swagger';

export class CreateCatDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  age: number;

  @ApiProperty()
  breed: string;
}
```
我们可以生成并获取一个如下所示的`name`属性，在这个结构中，`OmitType`的第二个参数是属性名称的数组：

```typescript
export class UpdateCatDto extends OmitType(CreateCatDto, ['name'] as const) {}
```

?> `OmitType()`从`@nestjs/swagger`中导入。

`IntersectionType()`函数将两种类型组合成一个新类型（类）。例如，我们由如下类型开始：

```typescript
import { ApiProperty } from '@nestjs/swagger';

export class CreateCatDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  breed: string;
}

export class AdditionalCatInfo {
  @ApiProperty()
  color: string;
}
```
我们可以生成一个新类型，将两个类型中所有属性组合在一起。
```typescript
export class UpdateCatDto extends IntersectionType(CreateCatDto, AdditionalCatInfo) {}
```
?> `IntersectionType()`从`@nestjs/swagger`中导入。

类型映射函数是可以组合的。例如，下列示例将产生一个类（类型），其拥有`name`除外的`CreateCatDto`类型的所有属性，这些属性都被设置为可选的：
```typescript
export class UpdateCatDto extends PartialType(
  OmitType(CreateCatDto, ['name'] as const),
) {}
```

### 枚举

为了定义一个 `enum`，我们必须手动在 `@ApiProperty` 上设置 `enum` 属性为数值数组。

```typescript
@ApiProperty({ enum: ['Admin', 'Moderator', 'User']})
role: UserRole;
```

或者，如下定义实际的 TypeScript 枚举：

```typescript
export enum UserRole {
  Admin = 'Admin',
  Moderator = 'Moderator',
  User = 'User'
}
```

你可以直接将枚举在 `@Query()` 参数装饰器里使用，并结合 `@ApiQuery()` 装饰器。

```typescript
@ApiQuery({ name: 'role', enum: UserRole })
async filterByRole(@Query('role') role: UserRole = UserRole.User) {}
```

![img](https://docs.nestjs.com/assets/enum_query.gif)

将 `isArray` 设置为 **true** ，`enum` 可以**多选**：

![img](https://docs.nestjs.com/assets/enum_query_array.gif)

### 枚举 schema

默认地，`enum`属性将在参数中添加一个`[Enum](https://swagger.io/docs/specification/data-models/enums/)`的原生定义。

```typescript
- breed:
    type: 'string'
    enum:
      - Persian
      - Tabby
      - Siamese
```
上述情况在大部分情况下都能正常工作。然而，如果你使用工具将该定义作为输入来生成客户端代码，你可能在生成代码时会遇到包含两层枚举的问题。考虑如下代码：

```typescript
// generated client-side code
export class CatDetail {
  breed: CatDetailEnum;
}

export class CatInformation {
  breed: CatInformationEnum;
}

export enum CatDetailEnum {
  Persian = 'Persian',
  Tabby = 'Tabby',
  Siamese = 'Siamese',
}

export enum CatInformationEnum {
  Persian = 'Persian',
  Tabby = 'Tabby',
  Siamese = 'Siamese',
}
```
?> 上述代码使用一个叫做[NSwag](https://github.com/RicoSuter/NSwag)的工具生成。

你可以看到你现在有两个同样的枚举。要强调这个问题，你可以在你的装饰器中`enum`属性旁传递一个`enumName`。
```typescript
export class CatDetail {
  @ApiProperty({ enum: CatBreed, enumName: 'CatBreed' })
  breed: CatBreed;
}
```
`enumName`属性使能`@nestjs/swagger`来将`CatBreed`转换成它自身的`schema`从而使`CatBreed`枚举可重用，如下：

```typescript
CatDetail:
  type: 'object'
  properties:
    ...
    - breed:
        schema:
          $ref: '#/components/schemas/CatBreed'
CatBreed:
  type: string
  enum:
    - Persian
    - Tabby
    - Siamese
```
?> 任何使用`enum`作为属性的装饰器也会使用`enumName`。

### 原生定义

在某些特定情况下（例如，深度嵌套的数组，矩阵），您可能需要手动描述类型。

```typescript
@ApiProperty({
  type: 'array',
  items: {
    type: 'array',
    items: {
      type: 'number',
    },
  },
})
coords: number[][];
```

同样，为了在控制器类中手动定义输入/输出内容，请使用 `schema` 属性：

```typescript
@ApiBody({
  schema: {
    type: 'array',
    items: {
      type: 'array',
      items: {
        type: 'number',
      },
    },
  },
})
async create(@Body() coords: number[][]) {}
```

### 额外模型

为了定义其他应由 Swagger 模块检查的模型，请使用 `@ApiExtraModels()` 装饰器：

```typescript
@ApiExtraModels(ExtraModel)
export class CreateCatDto {}
```

然后，您可以使用 `getSchemaPath(ExtraModel)` 获取对模型的引用(`$ref`)：

```typescript
'application/vnd.api+json': {
   schema: { $ref: getSchemaPath(ExtraModel) },
},
```

#### oneOf, anyOf, allOf

为了合并模式（schemas），您可以使用 `oneOf`，`anyOf` 或 `allOf` 关键字 ([阅读更多](https://swagger.io/docs/specification/data-models/oneof-anyof-allof-not/)).

```typescript
@ApiProperty({
  oneOf: [
    { $ref: getSchemaPath(Cat) },
    { $ref: getSchemaPath(Dog) },
  ],
})
pet: Cat | Dog;
```
如果你想定义一个多态数组（例如，数组成员包含多个schema），你可以使用原生定义（如上）来手动定义你的类型。

```typescript
type Pet = Cat | Dog;

@ApiProperty({
  type: 'array',
  items: {
    oneOf: [
      { $ref: getSchemaPath(Cat) },
      { $ref: getSchemaPath(Dog) },
    ],
  },
})
pets: Pet[];
```

?> `getSchemaPath()` 函数是从 `@nestjs/swagger`进行导入的

必须使用 `@ApiExtraModels()` 装饰器（在类级别）将 `Cat` 和 `Dog` 都定义为额外模型。

### 多种规格

`SwaggerModuler`还提供了一种支持多种规格的方法。 换句话说，您可以在不同的端点上使用不同的 UI 提供不同的文档。

为了支持多规格，您的应用程序必须使用模块化方法编写。 `createDocument()` 方法接受的第三个参数：`extraOptions` ，它是一个包含 `include` 属性的对象。`include` 属性的值是一个模块数组。

您可以设置多个规格支持，如下所示：

```typescript
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ApplicationModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(ApplicationModule);

  /**
   * createDocument(application, configurationOptions, extraOptions);
   *
   * createDocument method takes in an optional 3rd argument "extraOptions"
   * which is an object with "include" property where you can pass an Array
   * of Modules that you want to include in that Swagger Specification
   * E.g: CatsModule and DogsModule will have two separate Swagger Specifications which
   * will be exposed on two different SwaggerUI with two different endpoints.
   */

  const options = new DocumentBuilder()
    .setTitle('Cats example')
    .setDescription('The cats API description')
    .setVersion('1.0')
    .addTag('cats')
    .build();

  const catDocument = SwaggerModule.createDocument(app, options, {
    include: [CatsModule]
  });
  SwaggerModule.setup('api/cats', app, catDocument);

  const secondOptions = new DocumentBuilder()
    .setTitle('Dogs example')
    .setDescription('The dogs API description')
    .setVersion('1.0')
    .addTag('dogs')
    .build();

  const dogDocument = SwaggerModule.createDocument(app, secondOptions, {
    include: [DogsModule]
  });
  SwaggerModule.setup('api/dogs', app, dogDocument);

  await app.listen(3000);
}
bootstrap();
```

现在，您可以使用以下命令启动服务器：

```bash
$ npm run start
```

导航到 `http://localhost:3000/api/cats` 查看 Swagger UI 里的 cats：

![img](https://docs.nestjs.com/assets/swagger-cats.png)

`http://localhost:3000/api/dogs` 查看 Swagger UI 里的 dogs：

![img](https://docs.nestjs.com/assets/swagger-dogs.png)

### 标签（Tags）

要将控制器附加到特定标签，请使用 `@ApiTags(...tags)` 装饰器。

```typescript
@ApiUseTags('cats')
@Controller('cats')
export class CatsController {}
```

### HTTP 头字段

要定义自定义 HTTP 标头作为请求一部分，请使用 `@ApiHeader()` 。

```typescript
@ApiHeader({
  name: 'Authorization',
  description: 'Auth token'
})
@Controller('cats')
export class CatsController {}
```

### 响应

要定义自定义 `HTTP` 响应，我们使用 `@ApiResponse()` 装饰器。

```typescript
@Post()
@ApiResponse({ status: 201, description: 'The record has been successfully created.'})
@ApiResponse({ status: 403, description: 'Forbidden.'})
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}
```

与异常过滤器部分中定义的常见 `HTTP` 异常相同，Nest 还提供了一组可重用的 **API 响应** ，这些响应继承自核心 `@ApiResponse` 装饰器：

- `@ApiOkResponse()`
- `@ApiCreatedResponse()`
- `@ApiBadRequestResponse()`
- `@ApiUnauthorizedResponse()`
- `@ApiNotFoundResponse()`
- `@ApiForbiddenResponse()`
- `@ApiMethodNotAllowedResponse()`
- `@ApiNotAcceptableResponse()`
- `@ApiRequestTimeoutResponse()`
- `@ApiConflictResponse()`
- `@ApiGoneResponse()`
- `@ApiPayloadTooLargeResponse()`
- `@ApiUnsupportedMediaTypeResponse()`
- `@ApiUnprocessableEntityResponse()`
- `@ApiInternalServerErrorResponse()`
- `@ApiNotImplementedResponse()`
- `@ApiBadGatewayResponse()`
- `@ApiServiceUnavailableResponse()`
- `@ApiGatewayTimeoutResponse()`
- `@ApiDefaultResponse()`

```typescript
@Post()
@ApiCreatedResponse({ description: 'The record has been successfully created.'})
@ApiForbiddenResponse({ description: 'Forbidden.'})
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}
```

要为请求指定返回模型，必须创建一个类并使用 `@ApiProperty()` 装饰器注释所有属性。

```typescript
export class Cat {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  age: number;

  @ApiProperty()
  breed: string;
}
```

之后，必须将 `Cat` 模型与响应装饰器的 `type` 属性结合使用。

```typescript
@ApiTags('cats')
@Controller('cats')
export class CatsController {
  @Post()
  @ApiCreatedResponse({
    description: 'The record has been successfully created.',
    type: Cat
  })
  async create(@Body() createCatDto: CreateCatDto): Promise<Cat> {
    return this.catsService.create(createCatDto);
  }
}
```

打开浏览器，验证生成的 `Cat` 模型:

![img](https://docs.nestjs.com/assets/swagger-response-type.png)

### 全局前缀

要忽略通过 `setGlobalPrefix()` 设置的路由的全局前缀，请使用 `ignoreGlobalPrefix`:

```typescript
const document = SwaggerModule.createDocument(app, options, {
  ignoreGlobalPrefix: true
});
```

### 安全

要定义针对特定操作应使用的安全性机制，请使用 `@ApiSecurity()` 装饰器。

```typescript
@ApiSecurity('basic')
@Controller('cats')
export class CatsController {}
```

在运行应用程序之前，请记住使用 `DocumentBuilder` 将安全性定义添加到您的基本文档中：

```typescript
const options = new DocumentBuilder().addSecurity('basic', {
  type: 'http',
  scheme: 'basic'
});
```

一些最流行的身份验证技术是预定义的（例如 `basic` 和 `bearer`），因此，您不必如上所述手动定义安全性机制。

### 基础认证

为了使用基础认证，使用 `@ApiBasicAuth()`。

```typescript
@ApiBasicAuth()
@Controller('cats')
export class CatsController {}
```

在运行应用程序之前，请记住使用 `DocumentBuilder` 将安全性定义添加到基本文档中：

```typescript
const options = new DocumentBuilder().addBasicAuth();
```

### Bearer 认证

为了使用 bearer 认证， 使用 `@ApiBearerAuth()`。

```typescript
@ApiBearerAuth()
@Controller('cats')
export class CatsController {}
```

在运行应用程序之前，请记住使用 `DocumentBuilder` 将安全性定义添加到基本文档中：

```typescript
const options = new DocumentBuilder().addBearerAuth();
```

### OAuth2 认证

为了使用 OAuth2 认证，使用 `@ApiOAuth2()`。

```typescript
@ApiOAuth2(['pets:write'])
@Controller('cats')
export class CatsController {}
```

在运行应用程序之前，请记住使用 `DocumentBuilder` 将安全性定义添加到基本文档中：

```typescript
const options = new DocumentBuilder().addOAuth2();
```
### Cookie 认证

使用`@ApiCookieAuth()`来使能cookie认证。
```typescript
@ApiCookieAuth()
@Controller('cats')
export class CatsController {}
```
在你运行应用前，记得使用`DocumentBuilder`来向你的基础文档添加安全定义。

```typescript
const options = new DocumentBuilder().addCookieAuth('optional-session-id');
```

### 文件上传

您可以使用 `@ApiBody` 装饰器和 `@ApiConsumes()` 为特定方法启用文件上载。 这里是使用[文件上传](https://docs.nestjs.com/techniques/file-upload)技术的完整示例：

```typescript
@UseInterceptors(FileInterceptor('file'))
@ApiConsumes('multipart/form-data')
@ApiBody({
  description: 'List of cats',
  type: FileUploadDto,
})
uploadFile(@UploadedFile() file) {}
```

`FileUploadDto` 如下所定义：

```typescript
class FileUploadDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;
}
```

### 扩展

要使用`@ApiExtension()`装饰器添加一个扩展，扩展名称必须以`x-`作为前缀。
```typescript
@ApiExtension('x-foo', { hello: 'world' })
```

### 装饰器

所有可用的 OpenAPI 装饰器都有一个 `Api` 前缀，可以清楚地区分核心装饰器。 以下是导出的装饰器的完整列表，以及可以应用装饰器的级别的名称。

|                          |                     |
| :----------------------: | :-----------------: |
|    `@ApiOperation()`     |       Method        |
|     `@ApiResponse()`     | Method / Controller |
|     `@ApiProduces()`     | Method / Controller |
|     `@ApiConsumes()`     | Method / Controller |
|    `@ApiBearerAuth()`    | Method / Controller |
|      `@ApiOAuth2()`      | Method / Controller |
|    `@ApiBasicAuth()`     | Method / Controller |
|     `@ApiSecurity()`     | Method / Controller |
|   `@ApiExtraModels()`    | Method / Controller |
|       `@ApiBody()`       |       Method        |
|      `@ApiParam()`       |       Method        |
|      `@ApiQuery()`       |       Method        |
|      `@ApiHeader()`      | Method / Controller |
| `@ApiExcludeEndpoint()`  |       Method        |
|       `@ApiTags()`       | Method / Controller |
|     `@ApiProperty()`     |        Model        |
| `@ApiPropertyOptional()` |        Model        |
|   `@ApiHideProperty()`   |        Model        |
|   `@ApiExtension()`      |        Model        |

### 插件

TypeScript 的元数据反射系统具有几个限制，这些限制使得例如无法确定类包含哪些属性或无法识别给定属性是可选属性还是必需属性。但是，其中一些限制可以在编译时解决。 Nest 提供了一个插件，可以增强 TypeScript 编译过程，以减少所需的样板代码量。

?> 该插件是**选择性**的。可以手动声明所有装饰器，也可以只声明需要的特定装饰器。

Swagger 插件会自动：

- 除非使用 `@ApiHideProperty`，否则用 `@ApiProperty` 注释所有 DTO 属性
- 根据问号标记设置 `required` 属性（例如，`name?: string` 将设置 `required: false`）
- 根据类型设置 `type` 或 `enum` 属性（也支持数组）
- 根据分配的默认值设置 `default` 属性
- 根据 `class-validator` 装饰器设置多个验证规则（如果 `classValidatorShim` 设置为 `true`）
- 向具有正确状态和 `type`（响应模型）的每个端点添加响应装饰器

请注意，你的文件名必须包含如下前缀之一：['.dto.ts', '.entity.ts'] (例如, create-user.dto.ts) 从而能让插件对其进行分析。

以前，如果您想通过 Swagger UI 提供交互式体验，您必须重复很多代码，以使程序包知道应如何在规范中声明您的模型/组件。例如，您可以定义一个简单的 `CreateUserDto` 类，如下所示：

```typescript
export class CreateUserDto {
  @ApiProperty()
  email: string;

  @ApiProperty()
  password: string;

  @ApiProperty({ enum: RoleEnum, default: [], isArray: true })
  roles: RoleEnum[] = [];

  @ApiProperty({ required: false, default: true })
  isEnabled?: boolean = true;
}
```

尽管对于中型项目而言这并不是什么大问题，但是一旦您拥有大量的类，它就会变得冗长而笨拙。

现在，在启用 Swagger 插件的情况下，可以简单地声明上述类定义：

```typescript
export class CreateUserDto {
  email: string;
  password: string;
  roles: RoleEnum[] = [];
  isEnabled?: boolean = true;
}
```

该插件会基于**抽象语法树**动态添加适当的装饰器。因此，您不必再为分散在整个项目中的 `@ApiProperty` 装饰器而苦恼。

?> 该插件将自动生成所有缺少的 swagger 属性，但是如果您需要覆盖它们，则只需通过 `@ApiProperty()` 显式设置它们即可。

为了启用该插件，只需打开 `nest-cli.json`（如果使用[Nest CLI](/cli/overview)) 并添加以下`plugins`配置：

```javascript
{
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "plugins": ["@nestjs/swagger/plugin"]
  }
}
```

您可以使用 `options` 属性来自定义插件的行为。

```javascript
"plugins": [
  {
    "name": "@nestjs/swagger/plugin",
    "options": {
      "classValidatorShim": false
    }
  }
]
```

`options` 属性必须满足以下接口：

```typescript
export interface PluginOptions {
  dtoFileNameSuffix?: string[];
  controllerFileNameSuffix?: string[];
  classValidatorShim?: boolean;
}
```

<table>
  <tr>
    <th>选项(Option)</th>
    <th>默认(Default)</th>
    <th>描述(Description)</th>
  </tr>
  <tr>
    <td><code>dtoFileNameSuffix</code></td>
    <td><code>['.dto.ts', '.entity.ts']</code></td>
    <td>DTO（数据传输对象）文件后缀</td>
  </tr>
  <tr>
    <td><code>controllerFileNameSuffix</code></td>
    <td><code>.controller.ts</code></td>
    <td>控制器文件后缀</td>
  </tr>
  <tr>
    <td><code>classValidatorShim</code></td>
    <td><code>true</code></td>
    <td>如果设置为true，则模块将重用 <code>class-validator</code> 验证装饰器 (例如 <code>@Max(10)</code> 会将 <code>max: 10</code> 添加到 schema 定义中) </td>
  </tr>
</table>

如果您不使用 CLI，而是使用自定义的 `webpack` 配置，则可以将此插件与 `ts-loader` 结合使用：

```javascript
getCustomTransformers: (program: any) => ({
  before: [require('@nestjs/swagger/plugin').before({}, program)]
}),
```

### 移植到 4.0

如果你现在正在使用 `@nestjs/swagger@3.*`，请注意版本 4.0 中的以下重大更改/ API 更改。

以下装饰器已经被更改/重命名：

- `@ApiModelProperty` 现在是 `@ApiProperty`
- `@ApiModelPropertyOptional` 现在是 `@ApiPropertyOptional`
- `@ApiResponseModelProperty` 现在是 `@ApiResponseProperty`
- `@ApiImplicitQuery` 现在是 `@ApiQuery`
- `@ApiImplicitParam` 现在是 `@ApiParam`
- `@ApiImplicitBody` 现在是 `@ApiBody`
- `@ApiImplicitHeader` 现在是 `@ApiHeader`
- `@ApiOperation({{ '{' }} title: 'test' {{ '}' }})` 现在是 `@ApiOperation({{ '{' }} summary: 'test' {{ '}' }})`
- `@ApiUseTags` 现在是 `@ApiTags`

`DocumentBuilder` 重大更改（更新的方法签名）:

- `addTag`
- `addBearerAuth`
- `addOAuth2`
- `setContactEmail` 现在是 `setContact`
- `setHost` 已经被移除
- `setSchemes` 已经被移除

如下方法被添加：

- `addServer`
- `addApiKey`
- `addBasicAuth`
- `addSecurity`
- `addSecurityRequirements`

### 示例

请参考这里的[示例](https://github.com/nestjs/nest/tree/master/sample/11-swagger)。

## 健康检查(Terminus)

Nestjs Terminus集成提供了可读的/实时的健康检查。在复杂的后台设置中健康检查是非常重要的。简而言之，在web开发领域所说的健康检查通常由一系列特定地址组成，例如，https://my-website.com/health/readiness  通过一个服务，或者一个你的基础设施的一个部件（例如Kubernetes）来持续检查这个地址。依赖于向这一地址发出的`GET`请求返回的HTTP状态码，该服务会在收到“不健康”响应时采取行动。由于你的服务中对“健康”和“不健康”的定义可能有所不同，Nestjs Teminus支持一系列健康指示。

作为示例，如果你的服务器使用 MongoDB来存储数据，MongoDB是否正常运行就成了一个至关重要的信息。在这种情况下，你可以使用`MongooseHealthIndicator`。如果配置正常--按后续内容配置--你的健康检查地址将根据MongoDB是否运行来返回健康或者不健康HTTP状态码。

### 入门

要开始使用 `@nestjs/terminus` ，我们需要安装所需的依赖项。

```bash
$ npm install --save @nestjs/terminus
```

### 建立一个健康检查

健康检查表示健康指标的摘要。健康指示器执行服务检查，无论是否处于健康状态。 如果所有分配的健康指示符都已启动并正在运行，则运行状况检查为正。由于许多应用程序需要类似的健康指标，因此 `@nestjs/terminus` 提供了一组预定义的健康指标，例如：

- `DNSHealthIndicator`
- `TypeOrmHealthIndicator`
- `MongooseHealthIndicator`
- `MicroserviceHealthIndicator`
- `GRPCHealthIndicator`
- `MemoryHealthIndicator`
- `DiskHealthIndicator`

要开始我们第一个健康检查，我们需要在`AppModule`引入`TerminusModule`。

> app.module.ts

```typescript
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

@Module({
  imports: [TerminusModule]
})
export class AppModule { }
```

我们的健康检查可以使用控制器来执行，使用`Nestjs CLI`可以快速配置：

```typescript
$ nest generate controller health
```

?> 强烈建议在你的应用程序中使用关机钩子。如果启用，Terminus将使用其生命周期事件。在[这里](https://docs.nestjs.com/fundamentals/lifecycle-events#application-shutdown)阅读更多关于关机钩子的内容。

### DNS 健康检查

我们安装了`@nestjs/terminus`后，导入`TerminusModule`并创建一个新的控制器，我们就准备好创建一个新的健康检查了。

> health.controller.ts

```typescript
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private dns: DNSHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.dns.pingCheck('nestjs-docs', 'https://docs.nestjs.com'),
    ]);
  }
}
```
我们的健康检查现在将发送一个Get请求到`https://docs.nestjs.com`地址，如果我们从该地址得到一个健康响应，我们的路径`http://localhost:3000/health`将在返回200状态码同时返回一个如下对象。

```json
{
  "status": "ok",
  "info": {
    "nestjs-docs": {
      "status": "up"
    }
  },
  "error": {},
  "details": {
    "nestjs-docs": {
      "status": "up"
    }
  }
}
```
该返回对象可以接口可以通过`@nestjs/terminus`包的`HealthCheckResult`接口来访问。

名称|内容|类型
--|--|--
status|如果任何健康检查失败了，状态将是'error'。如果NestJS应用即将关闭，但仍然能接受HTTP请求，状态检查将会返回'shutting_down'状态|'error'\|'ok'\|'shutting_down'
info|对象包括每个状态是`up`（或者说健康）的健康指示器的信息|`object`
error|对象包括每个状态是`down`（或者说不健康）的健康指示器的信息|`object`
details|对象包括每个健康指示器的所有信息|`object`


### 自定义健康指标

在某些情况下，`@nestjs/terminus` 提供的预定义健康指标不会涵盖您的所有健康检查要求。 在这种情况下，您可以根据需要设置自定义运行状况指示器。

让我们开始创建一个代表我们自定义健康指标的服务。为了基本了解健康指标的结构，我们将创建一个示例 `DogHealthIndicator` 。如果每个 `Dog` 对象都具有 `goodboy` 类型，则此健康指示器应具有 `'up'` 状态，否则将抛出错误，然后健康指示器将被视为 `'down'` 。

> dog.health.ts

```typescript
import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';

export interface Dog {
  name: string;
  type: string;
}

@Injectable()
export class DogHealthIndicator extends HealthIndicator {
  private dogs: Dog[] = [
    { name: 'Fido', type: 'goodboy' },
    { name: 'Rex', type: 'badboy' },
  ];

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const badboys = this.dogs.filter(dog => dog.type === 'badboy');
    const isHealthy = badboys.length === 0;
    const result = this.getStatus(key, isHealthy, { badboys: badboys.length });

    if (isHealthy) {
      return result;
    }
    throw new HealthCheckError('Dogcheck failed', result);
  }
}
```

我们需要做的下一件事是将健康指标注册为提供者。

> app.module.ts

```typescript
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { DogHealthIndicator } from './dog.health';

@Module({
  controllers: [HealthController],
  imports: [TerminusModule],
  providers: [DogHealthIndicator]
})
export class AppModule { }
```

?> 在应用程序中，`DogHealthIndicator` 应该在一个单独的模块中提供，例如 `DogModule` ，然后由 `AppModule` 导入。

最后需要做的是在所需的运行状况检查端点中添加现在可用的运行状况指示器。 为此，我们返回到 `HealthController` 并将其实现到 `check` 函数中。

> health.controller.ts

```typescript
import { HealthCheckService } from '@nestjs/terminus';
import { Injectable } from '@nestjs/common';
import { DogHealthIndicator } from './dog.health';

@Injectable()
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private dogHealthIndicator: DogHealthIndicator
  ) {}

  @Get()
  @HealthCheck()
  healthCheck() {
    return this.health.check([
      async () => this.dogHealthIndicator.isHealthy('dog'),
    ])
  }
}
```


## CQRS

可以用下列步骤来描述一个简单的 **[CRUD](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete)** 应用程序流程:

1. **控制器层**处理 HTTP 请求并将任务委派给服务层。
2. **服务层**是处理大部分业务逻辑。
3. 服务使用**存储库或 DAOs** 来更改/保存实体。
4. 实体充当值的容器，具有 `setter` 和 `getter` 。

在大部分情况下，这种模式对中小型应用来说是足够的。然而，当我们的需求变得更加复杂时，**CQRS** 模型可能更合适并且易于扩展。

为了简化这个模型，`Nest` 提供了一个轻量级的 [CQRS](https://github.com/nestjs/cqrs) 模块，本章描述如何使用它。

### 安装

首先安装需要的包

```bash
$ npm install --save @nestjs/cqrs
```

### 指令

在本模块中，每个行为都被称为一个 **Command** 。当任何命令被分派时，应用程序必须对其作出反应。命令可以从服务中分派(或直接来自控制器/网关)并在相应的 **Command 处理程序** 中使用。


> heroes-game.service.ts

```typescript
@Injectable()
export class HeroesGameService {
  constructor(private commandBus: CommandBus) {}

  async killDragon(heroId: string, killDragonDto: KillDragonDto) {
    return this.commandBus.execute(
      new KillDragonCommand(heroId, killDragonDto.dragonId)
    );
  }
}
```

这是一个示例服务, 它调度 `KillDragonCommand` 。让我们来看看这个命令:

> kill-dragon.command.ts

```typescript
export class KillDragonCommand {
  constructor(
    public readonly heroId: string,
    public readonly dragonId: string,
  ) {}
}
```

这个 `CommandBus` 是一个命令 **流** 。它将命令委托给等效的处理程序。每个命令必须有相应的命令处理程序：

> kill-dragon.handler.ts

```typescript
@CommandHandler(KillDragonCommand)
export class KillDragonHandler implements ICommandHandler<KillDragonCommand> {
  constructor(private repository: HeroRepository) {}

  async execute(command: KillDragonCommand) {
    const { heroId, dragonId } = command;
    const hero = this.repository.findOneById(+heroId);

    hero.killEnemy(dragonId);
    await this.repository.persist(hero);
  }
}
```

现在，每个应用程序状态更改都是**Command**发生的结果。 逻辑封装在处理程序中。 如果需要，我们可以简单地在此处添加日志，甚至更多，我们可以将命令保留在数据库中（例如用于诊断目的）。

### 事件（Events）

由于我们在处理程序中封装了命令，所以我们阻止了它们之间的交互-应用程序结构仍然不灵活，不具有**响应性**。解决方案是使用**事件**。

> hero-killed-dragon.event.ts

```typescript
export class HeroKilledDragonEvent {
  constructor(
    public readonly heroId: string,
    public readonly dragonId: string,
  ) {}
}
```

事件是异步的。它们可以通过**模型**或直接使用 `EventBus` 发送。为了发送事件，模型必须扩展 `AggregateRoot` 类。。

> hero.model.ts

```typescript
export class Hero extends AggregateRoot {
  constructor(private readonly id: string) {
    super();
  }

  killEnemy(enemyId: string) {
    // logic
    this.apply(new HeroKilledDragonEvent(this.id, enemyId));
  }
}
```

`apply()` 方法尚未发送事件，因为模型和 `EventPublisher` 类之间没有关系。如何关联模型和发布者？ 我们需要在我们的命令处理程序中使用一个发布者 `mergeObjectContext()` 方法。

> kill-dragon.handler.ts

```typescript
@CommandHandler(KillDragonCommand)
export class KillDragonHandler implements ICommandHandler<KillDragonCommand> {
  constructor(
    private repository: HeroRepository,
    private publisher: EventPublisher,
  ) {}

  async execute(command: KillDragonCommand) {
    const { heroId, dragonId } = command;
    const hero = this.publisher.mergeObjectContext(
      await this.repository.findOneById(+heroId),
    );
    hero.killEnemy(dragonId);
    hero.commit();
  }
}
```

现在，一切都按我们预期的方式工作。注意，我们需要 `commit()` 事件，因为他们不会立即被发布。显然，对象不必预先存在。我们也可以轻松地合并类型上下文:

```typescript
const HeroModel = this.publisher.mergeContext(Hero);
new HeroModel('id');
```

就是这样。模型现在能够发布事件。我们得处理他们。此外，我们可以使用 `EventBus` 手动发出事件。

```typescript
this.eventBus.publish(new HeroKilledDragonEvent());
```

?> `EventBus` 是一个可注入的类。

每个事件都可以有许多事件处理程序。

> hero-killed-dragon.handler.ts

```typescript
@EventsHandler(HeroKilledDragonEvent)
export class HeroKilledDragonHandler implements IEventHandler<HeroKilledDragonEvent> {
  constructor(private readonly repository: HeroRepository) {}

  handle(event: HeroKilledDragonEvent) {
    // logic
  }
}
```

现在，我们可以将写入逻辑移动到事件处理程序中。

### Sagas

这种类型的 **事件驱动架构** 可以提高应用程序的 **反应性** 和 **可伸缩性** 。现在, 当我们有了事件, 我们可以简单地以各种方式对他们作出反应。**Sagas**是建筑学观点的最后一个组成部分。

`sagas` 是一个非常强大的功能。单 `saga` 可以监听 1..* 事件。它可以组合，合并，过滤事件流。[RxJS](https://github.com/ReactiveX/rxjs) 库是`sagas`的来源地。简单地说, 每个 `sagas` 都必须返回一个包含命令的Observable。此命令是 **异步** 调用的。

> heroes-game.saga.ts

```typescript
@Injectable()
export class HeroesGameSagas {
  @Saga()
  dragonKilled = (events$: Observable<any>): Observable<ICommand> => {
    return events$.pipe(
      ofType(HeroKilledDragonEvent),
      map((event) => new DropAncientItemCommand(event.heroId, fakeItemID)),
    );
  }
}
```

?> `ofType` 运算符从 `@nestjs/cqrs` 包导出。

我们宣布一个规则 - 当任何英雄杀死龙时，古代物品就会掉落。 之后，`DropAncientItemCommand` 将由适当的处理程序调度和处理。

### 查询

`CqrsModule` 对于查询处理可能也很方便。 `QueryBus` 与 `CommandsBus` 的工作方式相同。 此外，查询处理程序应实现 `IQueryHandler` 接口并使用 `@QueryHandler()` 装饰器进行标记。


### 建立

我们要处理的最后一件事是建立整个机制。

> heroes-game.module.ts

```typescript
export const CommandHandlers = [KillDragonHandler, DropAncientItemHandler];
export const EventHandlers =  [HeroKilledDragonHandler, HeroFoundItemHandler];

@Module({
  imports: [CqrsModule],
  controllers: [HeroesGameController],
  providers: [
    HeroesGameService,
    HeroesGameSagas,
    ...CommandHandlers,
    ...EventHandlers,
    HeroRepository,
  ]
})
export class HeroesGameModule {}
```

### 概要

`CommandBus` ，`QueryBus` 和 `EventBus` 都是**Observables**。这意味着您可以轻松地订阅整个流, 并通过  **Event Sourcing** 丰富您的应用程序。

完整的源代码在[这里](https://github.com/kamilmysliwiec/nest-cqrs-example) 。



## 文档

**Compodoc**是 `Angular` 应用程序的文档工具。 `Nest` 和 `Angular` 看起来非常相似，因此，**Compodoc**也支持 `Nest` 应用程序。

### 建立

在现有的 `Nest` 项目中设置 `Compodoc` 非常简单。 安装[npm](https://www.npmjs.com/)后，只需在 `OS` 终端中使用以下命令添加 `dev-dependency` ：

```bash
$ npm i -D @compodoc/compodoc
```

### 生成
在[官方文档](https://compodoc.app/guides/usage.html)之后，您可以使用以下命令( `npx`需要`npm 6` )生成文档:

```bash
$ npx compodoc -p tsconfig.json -s
```

打开浏览器并导航到 `http://localhost:8080` 。 您应该看到一个初始的 `Nest CLI` 项目：

![img](https://docs.nestjs.com/assets/documentation-compodoc-1.jpg)

![img](https://docs.nestjs.com/assets/documentation-compodoc-2.jpg)

### 贡献

您可以[在此](https://github.com/compodoc/compodoc)参与 `Compodoc` 项目并为其做出贡献。

## Prisma

[Prisma](https://www.prisma.io/) 是用于 Node.js 和 TypeScript 的 [开源](https://github.com/prisma/prisma) ORM。 它被用作编写原生 SQL 或使用其他数据库访问工具例如 SQL query builders（如 [knex.js](https://knexjs.org/)）或 ORM（如 [TypeORM](https://typeorm.io/) 和 [Sequelize](https://sequelize.org/)）的替代方法。 Prisma 目前支持 PostgreSQL、MySQL、SQL Server、SQLite、MongoDB 和 CockroachDB（[查看详情](https://www.prisma.io/docs/reference/database-reference/supported-databases)）。

虽然 Prisma 可以与原生 JavaScript 一起使用，但它支持 TypeScript， 并提供了超越 TypeScript 生态系统中其他 ORM 的类型安全保证。 您可以在[此处](https://www.prisma.io/docs/concepts/more/comparisons/prisma-and-typeorm#type-safety)深入比较 Prisma 和 TypeORM 的类型安全保证。

?> 如果您想快速了解 Prisma 的工作原理，可以按照[快速入门](https://www.prisma.io/docs/getting-started/quickstart)或阅读[文档](https://www.prisma.io/docs)中的简介。 [prisma-examples](https://github.com/prisma/prisma-examples/) 存储库中还有 [REST](https://github.com/prisma/prisma-examples/tree/latest/typescript/rest-nestjs) 和 [GraphQL](https://github.com/prisma/prisma-examples/tree/latest/typescript/graphql-nestjs) 的现成运行示例。

### 起步

在本秘籍中，您将了解如何从头开始使用NestJS和Prisma。您将使用REST API构建一个NestJS应用程序，它可以在数据库中读写数据。

为达到本指南的目的，您将使用[SQLite](https://sqlite.org/index.html)数据库来保存设置数据库服务器的开销。请注意，即使您使用的是PostgreSQL或MySQL，您仍然可以遵循本指南——您会在合适的地方获得使用这些数据库的额外说明。

?> 如果您已经有了一个现有的项目并考虑迁移到Prisma，您可以按照指南[将Prisma添加到现有的项目中](https://www.prisma.io/docs/getting-started/setup-prisma/add-to-existing-project/relational-databases-typescript-postgres)。如果您正在从TypeORM迁移，您可以阅读[从TypeORM迁移到Prisma指南](https://www.prisma.io/docs/guides/migrate-to-prisma/migrate-from-typeorm)。

### 创建你的NestJS项目

首先，使用以下命令安装NestJS CLI并创建您的应用框架：
```bash
$ npm install -g @nestjs/cli
$ nest new hello-prisma
```

请参见[第一步](/10/firststeps.md)页以了解有关通过上述命令创建的项目文件的详细信息。现在可以运行 `npm start` 来启动应用程序。在 `http://localhost:3000/` 上运行的REST API目前只提供一个在 `src/app.controller.ts` 中实现的路由。在本指南的学习过程中，您将实现其他路由来存储和检索有关*用户和帖子*的数据。

### 安装Prisma

首先，在你的项目上以 `development dependency` 方式安装 Prisma Cli：
```bash
$ cd hello-prisma
$ npm install prisma --save-dev
```

下一步，我们将利用[Prisma Cli](https://www.prisma.io/docs/concepts/components/prisma-cli)。最佳实践是使用 `npx` 在本地调用CLI：
```bash
$ npx prisma
```

<details>
<summary>使用Yarn</summary>

如果您正在使用Yarn，则可以按如下所示安装Prisma CLI：

```bash
$ yarn add prisma --dev
```

安装后，您可以通过给它添加 `yarn` 前缀来调用它：

```bash
$ yarn prisma
```
</details>

现在使用Prisma CLI的 `init` 命令创建初始的Prisma设置：
```bash
$ npx prisma init
```

此命令创建一个新的 `prisma` 目录，其内容如下：
* `schema.prisma` :指定数据库连接并包含数据库schema
* `.env` ：[dotenv](https://github.com/motdotla/dotenv)文件，通常用于将数据库凭据存储在一组环境变量中

### 设置数据库连接

数据库连接是在 `schema.prisma` 文件的 `datasource` 块中配置的。默认设置为 `postgresql` ，但由于您在本指南中使用的是SQLite数据库，因此需要将 `datasource` 块的 `provider` 字段调整为 `sqlite` ：

```
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}
```

接下来，打开 `.env` 并将 `DATABASE_URL` 环境变量调整为如下所示：

```bash
DATABASE_URL="file:./dev.db"
```

SQLite数据库是简单的文件；不需要服务器来使用SQLite数据库。因此，您不必使用主机和端口配置连接URL，只需将其指向本地文件，在本例中该文件名为 `dev.db` 。此文件将在下一步中创建。


<details>
<summary>使用PostgreSQL或MySQL</summary>

对于PostgreSQL和MySQL，您需要配置数据库服务器的URL。您可以在[此处](https://www.prisma.io/docs/reference/database-reference/connection-urls)了解关于所需连接的URL格式的详细信息。

#### PostgreSQL

如果您使用的是PostgreSQL，则必须调整schema.prisma和.env文件，如下所示：

`schema.prisma`
```
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}
```

`.env`
```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=SCHEMA"
```

将占位符(全是大写字符的字符串)替换为您的数据库凭据。请注意，如果您不确定为 `SCHEMA` 占位符提供什么，则很可能是默认值 `public`：
```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
```

如果你想学习如何建立一个PostgreSQL数据库，你可以按照这个指南[在Heroku上建立一个免费的PostgreSQL数据库](https://dev.to/prisma/how-to-setup-a-free-postgresql-database-on-heroku-1dc1)。

#### MySQL

如果您使用的是MySQL，则必须按如下方式调整 `schema.prisma` 和 `.env` 文件：

`schema.prisma`
```
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}
```

`.env`
```
DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DATABASE"
```

将所有大写字母拼写的占位符替换为您的数据库凭据。
</details>


### 使用Prisma Migrate创建两个数据库表

在本节中，您将使用[Prisma Migrate](https://www.prisma.io/docs/concepts/components/prisma-migrate)在数据库中创建两个新表。Prisma Migrate为Prisma schema的声明性数据模型定义生成SQL迁移文件。这些迁移文件是完全可定制的，因此您可以配置底层数据库的任何附加功能或包括附加命令。

将以下两个模型添加到 `schema.prisma` 文件中：

```
model User {
  id    Int     @default(autoincrement()) @id
  email String  @unique
  name  String?
  posts Post[]
}

model Post {
  id        Int      @default(autoincrement()) @id
  title     String
  content   String?
  published Boolean? @default(false)
  author    User?    @relation(fields: [authorId], references: [id])
  authorId  Int?
}
```

创建Prisma模型后，您可以生成SQL迁移文件并在数据库运行它们。在终端中运行以下命令：

```bash
$ npx prisma migrate dev --name init
```

这个 `prisma migrate dev` 命令生成SQL文件并直接在数据库运行它们。在本例中，在现有 `prisma` 目录中创建了以下迁移文件：

```
$ tree prisma
prisma
├── dev.db
├── migrations
│   └── 20201207100915_init
│       └── migration.sql
└── schema.prisma
```

<details>
<summary>展开以查看生成的SQL语句</summary>

在SQLite数据库中创建了以下表格：

```
-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "name" TEXT
);

-- CreateTable
CREATE TABLE "Post" (
"id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
"title" TEXT NOT NULL,
"content" TEXT,
"published" BOOLEAN DEFAULT false,
"authorId" INTEGER,

    FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User.email_unique" ON "User"("email");
```

</details>

### 安装并生成Prisma客户端

Prisma Client是一个类型安全的数据库客户端，它是从Prisma模型定义*生成*的。由于这种方法，Prisma Client可以对外暴露为模型定制的[CRUD](https://www.prisma.io/docs/concepts/components/prisma-client/crud)操作。

要在项目中安装Prisma客户端，请在终端中运行以下命令：

```bash
$ npm install @prisma/client
```

请注意，在安装过程中，Prisma会自动为您调用 `prisma generate` 命令。将来，您需要在每次更改Prisma模型后运行此命令，以更新生成的Prisma客户端。

?> `prisma generate` 命令读取您的Prisma schema并更新 `node_modules/@prisma/client` 中生成的Prisma Client库。

### 在NestJS services中使用Prisma客户端

现在您可以使用Prisma Client发送数据库查询。如果您想了解更多关于使用Prisma Client构建查询的信息，请查看[API文档](https://www.prisma.io/docs/concepts/components/prisma-client/crud)。

在设置NestJS应用程序时，您可能希望将Prisma Client API抽象出来，用于服务中的数据库查询。开始时，您可以创建一个新的 `PrismaService`，负责实例化 `PrismaClient` 并连接到您的数据库。

在 `src` 目录中，创建一个新文件 `prisma.service.ts`，并向其中添加以下代码：
```typescript
import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }
}
```

?> `onModuleInit` 是可选的——如果不使用它，Prisma将在第一次调用数据库时延迟连接。我们不需要使用 `onModuleDestroy`，因为Prisma有自己的shutdown钩子，它会在那里销毁连接。有关 `enableShutdownHooks` 的详细信息，请参阅 <a href="/10/recipes?id=enableShutdownHooks的问题">enableShutdownHooks的问题</a>

接下来，您可以编写services，用于从Prisma schema中为 `User` 和 `Post` 模型进行数据库调用。

在src目录中，创建一个名为 `user.service.ts` 的新文件，并向其中添加以下代码：
```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { User, Prisma } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async user(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: userWhereUniqueInput,
    });
  }

  async users(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<User[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.user.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  async updateUser(params: {
    where: Prisma.UserWhereUniqueInput;
    data: Prisma.UserUpdateInput;
  }): Promise<User> {
    const { where, data } = params;
    return this.prisma.user.update({
      data,
      where,
    });
  }

  async deleteUser(where: Prisma.UserWhereUniqueInput): Promise<User> {
    return this.prisma.user.delete({
      where,
    });
  }
}
```

请注意您如何使用 Prisma Client 的生成类型来确保您的服务公开的方法类型正确。 因此，您可以节省键入模型和创建其他接口或 DTO 文件的样板文件。

现在对 `Post` 模型执行相同的操作。

仍然在 `src` 目录中，创建一个新文件 `post.service.ts` ，并向其中添加以下代码：
```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Post, Prisma } from '@prisma/client';

@Injectable()
export class PostService {
  constructor(private prisma: PrismaService) {}

  async post(
    postWhereUniqueInput: Prisma.PostWhereUniqueInput,
  ): Promise<Post | null> {
    return this.prisma.post.findUnique({
      where: postWhereUniqueInput,
    });
  }

  async posts(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.PostWhereUniqueInput;
    where?: Prisma.PostWhereInput;
    orderBy?: Prisma.PostOrderByWithRelationInput;
  }): Promise<Post[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.post.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createPost(data: Prisma.PostCreateInput): Promise<Post> {
    return this.prisma.post.create({
      data,
    });
  }

  async updatePost(params: {
    where: Prisma.PostWhereUniqueInput;
    data: Prisma.PostUpdateInput;
  }): Promise<Post> {
    const { data, where } = params;
    return this.prisma.post.update({
      data,
      where,
    });
  }

  async deletePost(where: Prisma.PostWhereUniqueInput): Promise<Post> {
    return this.prisma.post.delete({
      where,
    });
  }
}
```

您的 `UserService` 和 `PostService` 当前包装了Prisma客户端中可用的CRUD查询。在真实的应用程序中，services也是向应用程序添加业务逻辑的地方。例如，您可以在 `UserService` 中拥有一个名为 `updatePassword` 的方法用来负责更新用户的密码。

**在主应用控制器中实现 `REST API` 路由**

最后，您将使用您在前几节中创建的服务来实现应用的不同路由。在本指南中，您将把所有路由放入现有的 `AppController` 类中。

将 `app.controller.ts` 文件的内容替换为以下代码：
```typescript
import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Put,
  Delete,
} from '@nestjs/common';
import { UserService } from './user.service';
import { PostService } from './post.service';
import { User as UserModel, Post as PostModel } from '@prisma/client';

@Controller()
export class AppController {
  constructor(
    private readonly userService: UserService,
    private readonly postService: PostService,
  ) {}

  @Get('post/:id')
  async getPostById(@Param('id') id: string): Promise<PostModel> {
    return this.postService.post({ id: Number(id) });
  }

  @Get('feed')
  async getPublishedPosts(): Promise<PostModel[]> {
    return this.postService.posts({
      where: { published: true },
    });
  }

  @Get('filtered-posts/:searchString')
  async getFilteredPosts(
    @Param('searchString') searchString: string,
  ): Promise<PostModel[]> {
    return this.postService.posts({
      where: {
        OR: [
          {
            title: { contains: searchString },
          },
          {
            content: { contains: searchString },
          },
        ],
      },
    });
  }

  @Post('post')
  async createDraft(
    @Body() postData: { title: string; content?: string; authorEmail: string },
  ): Promise<PostModel> {
    const { title, content, authorEmail } = postData;
    return this.postService.createPost({
      title,
      content,
      author: {
        connect: { email: authorEmail },
      },
    });
  }

  @Post('user')
  async signupUser(
    @Body() userData: { name?: string; email: string },
  ): Promise<UserModel> {
    return this.userService.createUser(userData);
  }

  @Put('publish/:id')
  async publishPost(@Param('id') id: string): Promise<PostModel> {
    return this.postService.updatePost({
      where: { id: Number(id) },
      data: { published: true },
    });
  }

  @Delete('post/:id')
  async deletePost(@Param('id') id: string): Promise<PostModel> {
    return this.postService.deletePost({ id: Number(id) });
  }
}
```

该控制器实现以下路由：

`GET`
* `/post/:id`：获取 `id` 查询单个帖子
* `、feed`: 查询所有*已发布*的帖子
* `/filter-posts/:searchString`: 通过 `title` 或 `content` 字段过滤帖子

`POST`
* `/post`: 创建一个新的帖子
  * Body:
    * `title: String`(必选): 帖子的标题
    * `content: String`(可选): 帖子的内容
    * `authorEmail: String`(必选): 发帖人的邮箱
* `/user`: 创建一个新用户
  * Body：
    * `email: String`(必选): 用户的邮箱地址 
    * `name: String`(可选): 用户的名字

`PUT`
* `/publish/:id`：发布指定 `id` 的帖子

`DELETE`
* `/post/:id`：删除指定 `id` 的帖子

### enableShutdownHooks的问题

Prisma通过 `enableShutdownHooks` 干扰NestJS。Prisma监听关闭信号，并在应用程序关闭的回调钩子触发之前调用 `process.exit()`。要解决这个问题，您需要为Prisma `beforeExit` 事件添加一个监听器。

```typescript
// main.ts
...
import { PrismaService } from './services/prisma/prisma.service';
...
async function bootstrap() {
  ...
  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app)
  ...
}
bootstrap()
```

您可以[阅读更多](https://github.com/prisma/prisma/issues/2917#issuecomment-708340112)关于Prisma处理关闭信号和 `beforeExit` 事件的信息。

### 总结

在本秘籍中，您学习了如何使用通过Prisma和NestJS来实现REST API。实现API路由的控制器调用 `PrismaService`，`PrismaService` 通过Prisma客户端向数据库发送查询，以满足传入请求的数据需求。

如果您想了解更多有关将NestJS与Prisma结合使用的信息，请务必查看以下资源：
* [NestJS & Prisma](https://www.prisma.io/nestjs)
* [Ready-to-run example projects for REST & GraphQL](https://github.com/prisma/prisma-examples/)
* [Production-ready starter kit](https://github.com/notiz-dev/nestjs-prisma-starter#instructions)
* [Video: Accessing Databases using NestJS with Prisma (5min)](https://www.youtube.com/watch?v=UlVJ340UEuk) by [Marc Stammerjohann](https://github.com/marcjulian)









## 静态服务

为了像单页应用程序（ `SPA` ）一样提供静态内容，我们可以使用 `@nestjs/serve-static` 包中的`ServeStaticModule`。

### 安装

首先我们需要安装所需的软件包:

```bash
$ npm install --save @nestjs/serve-static
```

### bootstrap

安装过程完成后，我们可以将 `ServeStaticModule` 导入根 `AppModule`，并通过将配置对象传递给 `forRoot()` 方法来配置它。

```typescript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client'),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

有了这些之后，构建静态网站并将其内容放置在 `rootPath` 属性指定的位置。

### 总结

这里有一个工作[示例](https://github.com/nestjs/nest/tree/master/sample/24-serve-static)。


## Nest 构建命令行程序

！！！ 待翻译

## 异步本地存储

！！！ 待翻译

## Automock

！！！ 待翻译

### 译者署名

| 用户名 | 头像 | 职能 | 签名 |
|---|---|---|---|
| [@ThisIsLoui](https://github.com/ThisIsLoui) | <img class="avatar-66 rm-style" height="70" src="https://avatars.githubusercontent.com/u/69883404?s=96&v=4"> | 翻译 | 你好，这里是 Loui |
