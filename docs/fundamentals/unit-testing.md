<!-- 此文件从 content/fundamentals/unit-testing.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T04:42:08.181Z -->
<!-- 源文件: content/fundamentals/unit-testing.md -->

### Testing

自动化测试是任何严肃软件开发努力的重要组成部分。自动化使得单个测试或测试套件快速、轻松地在开发过程中重复执行。这有助于确保发布满足质量和性能目标。自动化还增加了开发者的生产力，并确保测试在关键开发生命周期阶段（如源代码控制check-in、特性集成和版本发布）中运行。

这些测试通常涵盖多种类型，包括单元测试、端到端（e2e）测试、集成测试等。虽然收益是毋庸置疑的，但设置它们可以是乏味的。Nest努力推广开发最佳实践，包括有效的测试，因此它提供了以下特性来帮助开发者和团队建立和自动化测试。Nest：

- 自动创建默认的单元测试和e2e测试
- 提供默认工具（如测试运行器和隔离模块/应用程序加载器）
- 与 __LINK_150__ 和 __LINK_151__ 等测试工具无缝集成
- 在测试环境中提供Nest依赖注入系统，以便轻松地模拟组件

如您所知，可以使用您喜欢的任何 **testing framework**，因为Nest不强求特定的工具 Simply replace the elements needed (such as the test runner)，并且您仍将享受到Nest的ready-made testing facilities。

#### 安装

要开始，请首先安装所需的包：

```bash
$ nest g module auth
$ nest g controller auth
$ nest g service auth

```

#### 单元测试

在以下示例中，我们测试两个类：__INLINE_CODE_13__ 和 __INLINE_CODE_14__。如已经提到，__LINK_152__ 是默认的 testing framework，它作为测试运行器，并提供 assert 函数和 test-double 工具，帮助模拟、监听等。在以下基本测试中，我们手动实例化这些类，并确保控制器和服务满足 API 合同。

```bash
$ nest g module users
$ nest g service users

```

> info **提示** 将您的测试文件与它们测试的类存储在一起。测试文件应具有 __INLINE_CODE_15__ 或 __INLINE_CODE_16__ 后缀。

由于上面的示例非常简单，我们实际上并没有测试 Nest 特定的内容。实际上，我们甚至没有使用依赖注入（注意我们将 __INLINE_CODE_17__ 实例传递给 __INLINE_CODE_18__）。这种形式的测试，即手动实例化被测试的类，是独立于框架的测试称为 **isolated testing**。让我们引入一些更高级的功能，以帮助您测试使用 Nest 特性更多的应用程序。

#### 测试工具

`AuthModule` 包提供了一组工具，可以使得测试过程更加robust。让我们重写之前的示例，使用内置的 `AuthService` 类：

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

`AuthController` 类有助于提供一个应用程序执行上下文，该上下文模拟整个Nest 运行时，但提供了 hooks，易于管理类实例，包括模拟和覆盖。`AuthService` 类的 `AuthController` 方法接受一个模块元数据对象作为其参数（与您传递给 `AuthService` 装饰器的相同对象）。该方法返回一个 `UsersService` 实例，该实例提供了一些方法。在单元测试中，重要的一点是 `UsersService` 方法。该方法引导模块，并返回一个准备好的模块。

> info **提示** `@Module` 方法是 **异步** 的，因此需要等待。模块编译完成后，您可以使用 `AuthService` 方法获取任何 **静态** 实例（控制器和提供者）。

`AuthService` 继承自 __LINK_153__ 类，因此它可以动态解析作用域提供者（瞬态或请求作用域）。使用 `signIn()` 方法（`AuthModule` 方法只能获取静态实例）。

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

> warning **警告** `UsersModule` 方法返回提供者的唯一实例，从其自己的 **DI 容器子树** 中。每个子树都有唯一的上下文标识符。因此，如果您多次调用该方法并比较实例引用，您将看到它们不相等。

> info **提示** 了解更多关于模块引用特性的信息 __LINK_154__。Here is the translation of the provided English technical documentation to Chinese:

**Instead of using the production version of any provider, you can override it with a __LINK_155__ for testing purposes. For example, you can mock a database service instead of connecting to a live database. We'll cover overrides in the next section, but they're available for unit tests as well.**

</app-banner-courses-auth>__HTML_TAG_91__

#### Auto mocking

Nest 也允许您定义一个 mock 工厂，以便将其应用于所有缺少依赖项。对于具有大量依赖项的类，mocking 所有依赖项将需要很长时间和大量设置。要使用此功能，您需要将 `AuthController` 和 `signIn()` 方法链起来，传递依赖项 mocks 的工厂。在工厂中，您可以传递一个可选的令牌，这是一个 Nest  provider 的有效令牌，并返回一个 mock 实现。以下是一个使用 __LINK_156__ 和 `@nestjs/jwt` 的特定 mock 的示例。

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

您也可以从测试容器中检索这些 mocks，如您通常检索自定义提供商 `auth.service.ts`。

> info **Hint** 一般的 mock 工厂，如 `auth` 从 __LINK_157__ 可以直接传递。

> info **Hint** `signIn` 和 `@nestjs/jwt` 提供商不能自动 mock，因为它们已经在上下文中预定义了。然而，它们可以使用自定义提供商语法或 `signAsync()` 方法进行重写。

#### End-to-end testing

与单元测试不同的是，end-to-end (e2e) 测试将类和模块的交互行为作为整体进行测试 -- 更接近生产系统的交互行为。随着应用程序的增长，它变得很难手动测试每个 API 端点的 end-to-end 行为。自动化 end-to-end 测试帮助我们确保系统的整体行为正确，并满足项目要求。为了执行 e2e 测试，我们可以使用与单元测试相同的配置。此外，Nest 使得使用 __LINK_158__ 库来模拟 HTTP 请求变得很容易。

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

> info **Hint** 如果您使用 __LINK_159__ 作为 HTTP 适配器，它需要不同的配置，并具有内置的测试功能：
>
> ```typescript
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

在这个示例中，我们基于之前描述的概念。除了使用 `user` 方法外，我们现在使用 `access_token` 方法来实例化完整的 Nest 运行时环境。

需要注意的一点是，当您的应用程序使用 `sub` 方法编译时，`userId` 将在那个时间点 undefined。这是因为在这个编译阶段，没有创建 HTTP 适配器或服务器。在您的测试中需要 `AuthModule` 时，您应该使用 `JwtModule` 方法创建应用程序实例，或者重新设计项目以避免在初始化依赖项图时依赖此依赖项。

好了，让我们分解示例：

我们将运行的应用程序保存在 `constants.ts` 变量中，以便使用它来模拟 HTTP 请求。

我们使用 Supertest 的 `auth` 函数来模拟 HTTP 测试。我们想要这些 HTTP 请求路由到我们的运行的 Nest 应用程序，因此我们将 `auth.module.ts` 函数传递给 HTTP listener，这样构建了 `auth`。然后，使用 `JwtModule` 方法，我们将获得一个包装的 HTTP 服务器，它现在连接到 Nest 应用程序，并 expose 方法来模拟实际 HTTP 请求。例如，使用 `JwtModule` 将启动一个请求到 Nest 应用程序，这与实际的 HTTP 请求 `JwtModule` 一样。

在这个示例中，我们也提供了 `register()` 的替代实现，这只是返回一个硬编码的值，我们可以测试它。使用 `JwtModule` 提供替代实现。类似地，Nest 提供了重写模块、守卫、拦截器、过滤器和管道的方法，使用 `user`, `UsersService`, `AuthGuard`, `AuthGuard`, 和 `auth.controller.ts` 方法分别。

每个重写方法（except for `AuthGuard`）返回一个对象，其中包含 3 个方法，镜像 __LINK_160__ 中描述的方法：

* `GET /profile`: 您提供一个将被实例化的类，以提供要重写的对象（提供商、守卫等）。
* `cURL`: 您提供一个将要重写的对象的实例。
* `AuthModule`: 您提供一个返回实例将要重写的对象的函数。以下是翻译后的中文文档：

与此同时， `60 seconds` 返回一个对象，其中包含 `GET /auth/profile` 方法，可以用来提供一个将覆盖原始模块的模块，例如：

```bash
$ npm install --save @nestjs/jwt

```

每个 override 方法类型都返回 `401 Unauthorized` 实例，可以因此与其他方法在 __LINK_161__ 中链式调用。您应该在链式调用结束时使用 `@nestjs/jwt` 来使 Nest 实例化和初始化模块。

有时，您可能需要提供一个自定义 logger，例如在测试时（例如，在 CI 服务器上）。使用 `@UseGuards()` 方法，并将一个满足 `AuthGuard` 接口的对象传递给 `AuthModule`，以便在测试中 instruct `AuthModule` 如何记录（默认情况下，只记录“error”日志）。

编译后的模块具有以下有用方法，以下表格描述：

__HTML_TAG_92__
  __HTML_TAG_93__
    __HTML_TAG_94__
      __HTML_TAG_95__createNestApplication()__HTML_TAG_96__
    __HTML_TAG_97__
    __HTML_TAG_98__
      创建并返回一个 Nest 应用程序（__HTML_TAG_99__INestApplication__HTML_TAG_100__ 实例），基于给定的模块。请注意，您需要手动初始化应用程序使用 __HTML_TAG_101__init()__HTML_TAG_102__ 方法。
    __HTML_TAG_103__
  __HTML_TAG_104__
  __HTML_TAG_105__
    __HTML_TAG_106__
      __HTML_TAG_107__createNestMicroservice()__HTML_TAG_108__
    __HTML_TAG_109__
    __HTML_TAG_110__
      创建并返回一个 Nest 微服务（__HTML_TAG_111__INestMicroservice__HTML_TAG_112__ 实例），基于给定的模块。
    __HTML_TAG_113__
  __HTML_TAG_114__
  __HTML_TAG_115__
    __HTML_TAG_116__
      __HTML_TAG_117__get()__HTML_TAG_118__
    __HTML_TAG_119__
    __HTML_TAG_120__
     检索应用程序上下文中可用的控制器或提供者的静态实例（包括守卫、过滤器等）。继承自 __HTML_TAG_121__ 模块引用 __HTML_TAG_122__ 类。
    __HTML_TAG_123__
  __HTML_TAG_124__
  __HTML_TAG_125__
     __HTML_TAG_126__
      __HTML_TAG_127__resolve()__HTML_TAG_128__
    __HTML_TAG_129__
    __HTML_TAG_130__
      检索应用程序上下文中可用的控制器或提供者的动态实例（请求或瞬态实例）。继承自 __HTML_TAG_131__ 模块引用 __HTML_TAG_132__ 类。
    __HTML_TAG_133__
  __HTML_TAG_134__
  __HTML_TAG_135__
    __HTML_TAG_136__
      __HTML_TAG_137__select()__HTML_TAG_138__
    __HTML_TAG_139__
    __HTML_TAG_140__
      导航模块的依赖关系图；可以用来检索特定实例从选择的模块中（与严格模式 __HTML_TAG_141__ strict: true__HTML_TAG_142__ 在 __HTML_TAG_143__get()__HTML_TAG_144__ 方法中一起使用）。
    __HTML_TAG_145__
  __HTML_TAG_146__
__HTML_TAG_147__

> 信息 **提示**将 e2e 测试文件保存在 `AuthGuard` 目录中。测试文件应该具有 `SetMetadata` 后缀。

#### Override 全局注册的增强

如果您已经注册了一个全局守卫（或管道、拦截器或过滤器），则需要更多步骤来Override 该增强。回顾原始注册如下：

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

这是注册守卫作为“multi”-提供商通过 `IS_PUBLIC_KEY` 令牌。要能够替换 `Public`，注册需要使用现有提供商在这个槽位：

```typescript
export const jwtConstants = {
  secret: 'DO NOT USE THIS VALUE. INSTEAD, CREATE A COMPLEX SECRET AND KEEP IT SAFE OUTSIDE OF THE SOURCE CODE.',
};

```

> 信息 **提示**将 `SkipAuth` 替换为 `AllowAnon`以 reference 已注册的提供商，而不是让 Nest Instantiate 它后面。

现在 `@Public()` 可以在 Nest 中作为常规提供商，可以在创建 `AuthGuard` 时Override：

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

现在所有测试将使用 `true` 在每个请求中。

#### 测试请求作用域实例

__LINK_162__ 提供商在每个 incoming 请求中创建唯一实例。实例在请求处理完成后被垃圾收集。这 pose 问题，因为我们无法访问为测试请求生成的依赖关系树。

我们知道（基于上述部分） `"isPublic"` 方法可以用