# 安全

## 认证（Authentication）

身份认证是大多数应用程序的 **重要** 组成部分。有很多不同的方法和策略来处理身份认证。任何项目采用的方法取决于其特定的应用程序要求。本章介绍了几种可以适应各种不同要求的身份认证方法。

让我们完善一下我们的需求。在这个用例中，客户端将首先使用用户名和密码进行身份认证。一旦通过身份认证，服务器会下发一个 `JWT` ，该 `JWT` 可以在后续请求的授权头中作为 [bearer token](https://tools.ietf.org/html/rfc6750) 发送，以实现身份认证。我们还将创建一个受保护的路由，只有携带了有效的 `JWT` 的请求才能访问它。

我们将从第一个需求开始：认证用户。然后，我们将进一步实现发放 `JWT` 。最后，我们将创建一个受保护的路由，它会检查请求中是否携带有效的 `JWT` 。

### 创建一个认证模块

我们将首先生成一个 `AuthModule` ，接着在其中生成一个 `AuthService` 和一个 `AuthController`。我们将使用 `AuthService` 来实现认证逻辑，使用 `AuthController` 来暴露认证接口。

```bash
$ nest g module auth
$ nest g controller auth
$ nest g service auth
```

在实现 `AuthService` 过程中，我们会发现将用户操作封装到 `UsersService` 中很有用，因此，让我们现在生成这样一个用户模块和用户服务。

```bash
$ nest g module users
$ nest g service users
```

按照下方所示，替换掉这些生成文件中的默认内容。在我们的示例应用中，`UsersService` 只是在内存中维护一个硬编码的用户列表，以及一个根据用户名查找单个用户的 `find` 方法。在真正的应用中，这是您使用您选择的库（例如 `TypeORM`、`Sequelize`、`Mongoose` 等）构建用户模型和持久层的地方。

> users/users.service.ts

```typescript
import { Injectable } from '@nestjs/common';

// 这应该是一个真正的类/接口，代表一个用户实体
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

在 `UsersModule` 中，唯一需要的更改是将 `UsersService` 添加到 `@Module` 装饰器的导出数组中，以便可以在此模块外访问到它（我们马上会在 `AuthService` 中用到它）。

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

### 实现「登录」接口

我们的 `AuthService` 负责获取一个用户并验证密码。为了实现这个功能，我们创建一个 `signIn()` 方法。在下面的代码中，我们使用 ES6 中便捷的扩展运算符，来在返回之前删除用户对象中的密码属性。这是返回用户对象时的一种普遍做法，因为您不会想将密码、密钥之类的敏感字段暴露出去。

> auth/auth.service.ts

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
    // TODO: 生成一个 JWT，并在这里返回
    // 而不是返回一个用户对象
    return result;
  }
}
```

?> 当然，在真正的应用程序中，您不会以纯文本形式存储密码。取而代之的是使用带有加密单向哈希算法的 [bcrypt](https://github.com/kelektiv/node.bcrypt.js#readme) 之类的库。使用这种方法，您只需存储散列密码，然后将存储的密码与 **输入** 密码的散列版本进行比较，这样就不会以纯文本的形式存储或暴露用户密码。为了保持我们的示例应用的简单性，我们违反了这个绝对命令并使用纯文本。**不要在真正的应用程序中这样做!**

现在，我们更新 `AuthModule` 来引入 `UsersModule` 。

> auth/auth.module.ts

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
```

有了这些，让我们打开 `AuthController` 并往里面添加一个 `signIn()` 方法。这个方法会被客户端调用来认证用户。它会接收请求体中的用户名和密码，如果用户认证通过了，它会返回一个 `JWT` 。

> auth/auth.controller.ts

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

?> 理想情况下，我们应该使用一个 DTO 类来定义请求体的结构，而不是使用 `Record<string, any>` 类型。要查看更多信息，请 [查看本章](/10/techniques.md?id=验证) 。

### JWT 令牌

我们已经准备好进入认证系统的 JWT 部分。让我们回顾并完善我们的要求：

- 允许用户使用用户名/密码进行身份验证，返回 `JWT` 以便在后续调用受保护的 API 接口时使用。我们正在努力满足这一要求。为了完成它，我们需要编写发放 `JWT` 的代码。

- 创建受保护的 API 路由，这些路由通过检查是否存在有效的 JWT 而受到保护。

我们需要安装更多的包来支持我们的 `JWT` 需求:

```bash
$ npm install --save @nestjs/jwt
```

?> `@nestjs/jwt` 包是一个实用程序包，可帮助进行 JWT 操作，包括生成和验证 `JWT` 令牌。（在  [这里](https://github.com/nestjs/jwt) 查看更多内容）。

为了使我们的服务保持简洁的模块化，我们将在 `authService` 中处理 `JWT` 的生成。在 `auth` 文件夹中，打开 `auth.service.ts` 文件，注入 `JwtService` ，接着按照下方所示，更新 `signIn` 方法来生成 `JWT` 令牌。

> auth/auth.service.ts

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

  async signIn(username, pass) {
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

我们正在使用 `@nestjs/jwt` 类库，它提供了一个 `signAsync()` 函数来从「用户」属性的子集中生成 `JWT` ，接着我们再把 `JWT` 作为 `access_token` 属性，返回一个简单的对象。注意：为了与 JWT 标准保持一致，我们选择了 `sub` 作为属性名来保存 `userId` 。另外不要忘记在 `AuthService` 中注入 `JwtService` 作为提供者。

我们现在需要更新 `AuthModule` 来引入新的依赖，并配置 `JwtModule` 。

首先，在 `auth` 文件夹下创建 `constants.ts` 文件，然后加入以下代码：

> auth/constants.ts

```typescript
export const jwtConstants = {
  secret: 'DO NOT USE THIS VALUE. INSTEAD, CREATE A COMPLEX SECRET AND KEEP IT SAFE OUTSIDE OF THE SOURCE CODE.',
};
```

我们将使用上方的对象来在 `JWT` 的生成和验证步骤之间共享密钥。

!> **不要公共地暴露这个密钥。** 我们这里这样做是为了清楚地说明代码正在做什么，但在生产系统中，你必须要使用恰当的措施来 **保护这个密钥** ，例如机密库 、环境变量、配置服务等。

现在，打开 `auth` 文件夹下的 `auth.module.ts` ，并将其更新为如下所示：

> auth/auth.module.ts

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
```

?> 我们正在将 `JwtModule` 注册为全局，以方便我们。这意味着我们不需要在应用的其他地方再去引入 `JwtModule` 。

我们使用 `register()` 来配置 `JwtModule` ，并传入一个配置对象。要了解更多 Nest `JwtModule` 的信息，请查看 [这里](https://github.com/nestjs/jwt/blob/master/README.md) ；要了解可用配置项的详细信息，请查看 [这里](https://github.com/auth0/node-jsonwebtoken#usage) 。

让我们再次使用 cURL 来测试路由。您可以使用 `UsersService` 中硬编码的任何 `user` 对象进行测试。

```bash
$ # POST to /auth/login
$ curl -X POST http://localhost:3000/auth/login -d '{"username": "john", "password": "changeme"}' -H "Content-Type: application/json"
{"access_token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}
$ # 注意：上方的 JWT 省略了一部分
```

### 实现认证守卫

我们现在可以实现最后一个需求：通过要求请求中携带有效的 JWT 来保护接口。我们将通过创建一个用于保护路由的 `AuthGuard` 来做到这一点。 

> auth/auth.guard.ts

```typescript
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
      // 💡 在这里我们将 payload 挂载到请求对象上
      // 以便我们可以在路由处理器中访问它
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

我们现在可以实现受保护的路由，并注册 `AuthGuard` 来保护它。

打开 `auth.controller.ts` 文件，按照下方所示更新它：

> auth.controller.ts

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

我们正在将我们刚刚创建的 `AuthGuard` 应用到 `GET /profile` 路由上，来实现对它的保护。

确保应用正在运行，接着使用 cURL 来测试该路由。

```bash
$ # GET /profile
$ curl http://localhost:3000/auth/profile
{"statusCode":401,"message":"Unauthorized"}

$ # POST /auth/login
$ curl -X POST http://localhost:3000/auth/login -d '{"username": "john", "password": "changeme"}' -H "Content-Type: application/json"
{"access_token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2Vybm..."}

$ # GET /profile 使用上一步返回的 JWT 作为 bearer code
$ curl http://localhost:3000/auth/profile -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2Vybm..."
{"sub":1,"username":"john","iat":...,"exp":...}
```

注意在 `AuthModule` 中，我们配置了 JWT 的过期时间是 `60 秒` 。这是一个很短的时间，而且处理 JWT 过期和刷新的细节超出了本文的讨论范围。然而，我们仍然选择了这样设置，以演示 JWT 的这个重要特性。如果您在尝试 `GET /auth/profile` 请求之前等待超过了 60 秒，您会收到 `401 Unauthorized` 的响应。这是因为 `@nestjs/jwt` 会自动检查 JWT 的过期时间，省去了您在应用中这样做的麻烦。

我们现在已经完成了 JWT 认证的实现。JavaScript 客户端（例如 Angular/React/Vue）和其他 JavaScript 应用现在可以安全地使用我们的 API 服务器进行认证和通信。

### 开启全局认证

如果您的大部分接口默认都应该受到保护，您可以将认证守卫注册为 [全局守卫](/10/guards.md?id=绑定守卫) ，接着，您只需要标记哪些路由应为公共路由，而无需在每一个控制器的上方都使用 `@UseGuards()` 装饰器。

首先，在任意一个模块中，（例如在 `AuthModule` 中）使用下方的结构将 `AuthGuard` 注册为全局守卫。

```typescript
providers: [
  {
    provide: APP_GUARD,
    useClass: AuthGuard,
  },
],
```

有了这些，Nest 会自动将 `AuthGuard` 绑定到所有接口上。

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

最后，当元数据 `"isPublic"` 被找到时，我们需要 `AuthGuard` 返回 `true` 。为了实现它，我们将使用 `Reflector` 类（ [了解更多](/10/guards.md?id=小结) ）。

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
      // 💡 在这里我们将 payload 挂载到请求对象上
      // 以便我们可以在路由处理器中访问它
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

### 集成 Passport

[Passport](https://github.com/jaredhanson/passport) 是最流行的 node.js 认证库，为社区所熟知，并成功地应用于许多生产应用中。使用 `@nestjs/passport` 模块，可以很容易地将这个库与 **Nest** 应用集成。

要了解如何在 NestJS 中集成 Passport ，查看 [此章节](/10/recipes.md?id=Passport)

## 权限（Authorization）

权限是指确定一个用户可以做什么的过程。例如，管理员用户可以创建、编辑和删除文章，非管理员用户只能授权阅读文章。

权限和认证是相互独立的。但是权限需要依赖认证机制。

有很多方法和策略来处理权限。这些方法取决于其应用程序的特定需求。本章提供了一些可以灵活运用在不同需求条件下的权限实现方式。

### 基础的 RBAC 实现

基于角色的访问控制（**RBAC**)是一个基于角色和权限等级的中立的访问控制策略。本节通过使用`Nest`[守卫](8/guards)来实现一个非常基础的`RBAC`。

首先创建一个`Role`枚举来表示系统中的角色：

> role.enum.ts

```TypeScript
export enum Role {
  User = 'user',
  Admin = 'admin',
}
```

?> 在更复杂的系统中，角色信息可能会存储在数据库里，或者从一个外部认证提供者那里获取。

然后，创建一个`@Roles()`的装饰器，该装饰器允许某些角色拥有获取特定资源访问权。

> roles.decorator.ts

```TypeScript
import { SetMetadata } from '@nestjs/common';
import { Role } from '../enums/role.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
```

现在可以将`@Roles()`装饰器应用于任何路径处理程序。

> cats.controller.ts

```TypeScript
@Post()
@Roles(Role.Admin)
create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}
```

最后，我们创建一个`RolesGuard`类来比较当前用户拥有的角色和当前路径需要的角色。为了获取路径的角色（自定义元数据），我们使用`Reflector`辅助类，这是个`@nestjs/core`提供的一个开箱即用的类。

> roles.guard.ts

```TypeScript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}
```

?> 参见[应用上下文](<(8/fundamentals)>)章节的反射与元数据部分，了解在上下文敏感的环境中使用`Reflector`的细节。

!> 该例子被称为“基础的”是因为我们仅仅在路径处理层面检查了用户权限。在实际项目中，你可能有包含不同操作的终端/处理程序，它们各自需要不同的权限组合。在这种情况下，你可能要在你的业务逻辑中提供一个机制来检查角色，这在一定程度上会变得难以维护，因为缺乏一个集中的地方来关联不同的操作与权限。

在这个例子中，我们假设`request.user`包含用户实例以及允许的角色(在`roles`属性中)。在你的应用中，需要将其与你的认证守卫关联起来，参见[认证](#认证（Authentication）)。

要确保该示例可以工作，你的`User`类看上去应该像这样：

```TypeScript
class User {
  // ...other properties
  roles: Role[];
}
```

最后，在控制层或者全局注册`RolesGuard`。

```TypeScript
providers: [
  {
    provide: APP_GUARD,
    useClass: RolesGuard,
  },
],
```

当一个没有有效权限的用户访问一个终端时，Nest 自动返回以下响应：

```JSON
{
  "statusCode": 403,
  "message": "Forbidden resource",
  "error": "Forbidden"
}
```

?> 如果你想返回一个不同的错误响应，需要抛出特定异常来代替返回一个布尔值。

### 基于权利（Claims）的权限

一个身份被创建后，可能关联来来自信任方的一个或者多个权利。权利是指一个表示对象可以做什么，而不是对象是什么的键值对。

要在 Nest 中实现基于权利的权限，你可以参考我们在`RBAC`部分的步骤，仅仅有一个显著区别：比较`许可(permissions)`而不是角色。每个用户应该被授予了一组许可，相似地，每个资源/终端都应该定义其需要的许可（例如通过专属的`@RequirePermissions()`装饰器）。

> cats.controller.ts

```TypeScript
@Post()
@RequirePermissions(Permission.CREATE_CAT)
create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}
```

?> 在这个例子中，`许可`(和 RBAC 部分的`角色`类似)是一个 TypeScript 的枚举，它包含了系统中所有的许可。

### 与`CASL`集成

`CASL`是一个权限库，用于限制用户可以访问哪些资源。它被设计为可渐进式增长的，从基础权利权限到完整的基于主题和属性的权限都可以实现。

首先，安装`@casl/ability`包：

```bash
$ npm i @casl/ability
```

?> 在本例中，我们选择`CASL`，但也可以根据项目需要选择其他类似库例如`accesscontrol`或者`acl`。

安装完成后，为了说明 CASL 的机制，我们定义了两个类实体，`User`和`Article`。

```TypeScript
class User {
  id: number;
  isAdmin: boolean;
}
```

`User`类包含两个属性，`id`是用户的唯一标识，`isAdmin`代表用户是否有管理员权限。

```TypeScript
class Article {
  id: number;
  isPublished: boolean;
  authorId: number;
}
```

`Article`类包含三个属性，分别是`id`、`isPublished`和`authorId`，`id`是文章的唯一标识，`isPublished`代表文章是否发布，`authorId`代表发表该文章的用户 id。

接下来回顾并确定本示例中的需求：

- 管理员可以管理（创建、阅读、更新、删除/CRUD)所有实体
- 用户对所有内容有阅读权限
- 用户可以更新自己的文章(`article.authorId===userId`)
- 已发布的文章不能被删除 (`article.isPublised===true`)

基于这些需求，我们开始创建`Action`枚举，包含了用户可能对实体的所有操作。

```TypeScript
export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}
```

!> `manage`是 CASL 的关键词，代表`任何`操作。

要封装 CASL 库，需要创建`CaslModule`和`CaslAbilityFactory`。

```bash
$ nest g module casl
$ nest g class casl/casl-ability.factory
```

创建完成后，在`CaslAbilityFactory`中定义`createForUser()`方法。该方法将为用户创建`Ability`对象。

```TypeScript
type Subjects = InferSubjects<typeof Article | typeof User> | 'all';

export type AppAbility = Ability<[Action, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: User) {
    const { can, cannot, build } = new AbilityBuilder<
      Ability<[Action, Subjects]>
    >(Ability as AbilityClass<AppAbility>);

    if (user.isAdmin) {
      can(Action.Manage, 'all'); // read-write access to everything
    } else {
      can(Action.Read, 'all'); // read-only access to everything
    }

    can(Action.Update, Article, { authorId: user.id });
    cannot(Action.Delete, Article, { isPublished: true });

    return build({
      // Read https://casl.js.org/v5/en/guide/subject-type-detection#use-classes-as-subject-types for details
      detectSubjectType: item => item.constructor as ExtractSubjectType<Subjects>
    });
  }
}
```

!> `all`是 CASL 的关键词，代表`任何对象`。

?> `Ability`,`AbilityBuilder`,和`AbilityClass`从`@casl/ability`包中导入。

在上述例子中，我们使用`AbilityBuilder`创建了`Ability`实例，如你所见，`can`和`cannot`接受同样的参数，但代表不同含义，`can`允许对一个对象执行操作而`cannot`禁止操作，它们各能接受 4 个参数，参见[CASL 文档](https://casl.js.org/v4/en/guide/intro)。

最后，将`CaslAbilityFactory`添加到提供者中，并在`CaslModule`模块中导出。

```TypeScript
import { Module } from '@nestjs/common';
import { CaslAbilityFactory } from './casl-ability.factory';

@Module({
  providers: [CaslAbilityFactory],
  exports: [CaslAbilityFactory],
})
export class CaslModule {}
```

现在，只要将`CaslModule`引入对象的上下文中，就可以将`CaslAbilityFactory`注入到任何标准类中。

```TypeScript
constructor(private caslAbilityFactory: CaslAbilityFactory) {}
```

在类中使用如下：

```TypeScript
const ability = this.caslAbilityFactory.createForUser(user);
if (ability.can(Action.Read, 'all')) {
  // "user" has read access to everything
}
```

?> `Ability`类更多细节参见[CASL 文档](https://casl.js.org/v4/en/guide/intro)。

例如，一个非管理员用户，应该可以阅读文章，但不允许创建一篇新文章或者删除一篇已有文章。

```TypeScript
const user = new User();
user.isAdmin = false;

const ability = this.caslAbilityFactory.createForUser(user);
ability.can(Action.Read, Article); // true
ability.can(Action.Delete, Article); // false
ability.can(Action.Create, Article); // false
```

?> 虽然`Ability`和`AlbilityBuilder`类都提供`can`和`cannot`方法，但其目的并不一样，接受的参数也略有不同。

依照我们的需求，一个用户应该能更新自己的文章。

```TypeScript
const user = new User();
user.id = 1;

const article = new Article();
article.authorId = user.id;

const ability = this.caslAbilityFactory.createForUser(user);
ability.can(Action.Update, article); // true

article.authorId = 2;
ability.can(Action.Update, article); // false
```

如你所见，`Ability`实例允许我们通过一种可读的方式检查许可。`AbilityBuilder`采用类似的方式允许我们定义许可（并定义不同条件）。查看官方文档了解更多示例。

### 进阶：通过策略守卫的实现

本节我们说明如何声明一个更复杂的守卫，用来配置在方法层面（也可以配置在类层面）检查用户是否满足权限策略。在本例中，将使用 CASL 包进行说明，但它并不是必须的。同样，我们将使用前节创建的`CaslAbilityFactory`提供者。

首先更新我们的需求。目的是提供一个机制来检查每个路径处理程序的特定权限。我们将同时支持对象和方法（分别针对简易检查和面向函数式编程的目的）。

从定义接口和策略处理程序开始。

```TypeScript
import { AppAbility } from '../casl/casl-ability.factory';

interface IPolicyHandler {
  handle(ability: AppAbility): boolean;
}

type PolicyHandlerCallback = (ability: AppAbility) => boolean;

export type PolicyHandler = IPolicyHandler | PolicyHandlerCallback;
```

如上所述，我们提供了两个可能的定义策略处理程序的方式，一个对象（实现了`IPolicyHandle`接口的类的实例）和一个函数（满足`PolicyHandlerCallback`类型）。

接下来创建一个`@CheckPolicies()`装饰器，该装饰器允许配置访问特定资源需要哪些权限。

```TypeScript
export const CHECK_POLICIES_KEY = 'check_policy';
export const CheckPolicies = (...handlers: PolicyHandler[]) =>
  SetMetadata(CHECK_POLICIES_KEY, handlers);
```

现在创建一个`PoliciesGuard`，它将解析并执行所有和路径相关的策略程序。

```TypeScript
@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private caslAbilityFactory: CaslAbilityFactory,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const policyHandlers =
      this.reflector.get<PolicyHandler[]>(
        CHECK_POLICIES_KEY,
        context.getHandler(),
      ) || [];

    const { user } = context.switchToHttp().getRequest();
    const ability = this.caslAbilityFactory.createForUser(user);

    return policyHandlers.every((handler) =>
      this.execPolicyHandler(handler, ability),
    );
  }

  private execPolicyHandler(handler: PolicyHandler, ability: AppAbility) {
    if (typeof handler === 'function') {
      return handler(ability);
    }
    return handler.handle(ability);
  }
}
```

?> 在本例中，我们假设`request.user`包含了用户实例。在你的应用中，可能将其与你自定义的认证守卫关联。参见认证章节。

我们分析一下这个例子。`policyHandlers`是一个通过`@CheckPolicies()`装饰器传递给方法的数组，接下来，我们用`CaslAbilityFactory#create`方法创建`Ability`对象，允许我们确定一个用户是否拥有足够的许可去执行特定行为。我们将这个对象传递给一个可能是函数或者实现了`IPolicyHandler`类的实例的策略处理程序，暴露出`handle()`方法并返回一个布尔量。最后，我们使用`Array#every`方法来确保所有处理程序返回`true`。

为了测试这个守卫，我们绑定任意路径处理程序，并且注册一个行内的策略处理程序（函数实现），如下：

```TypeScript
@Get()
@UseGuards(PoliciesGuard)
@CheckPolicies((ability: AppAbility) => ability.can(Action.Read, Article))
findAll() {
  return this.articlesService.findAll();
}
```

我们也可以定义一个实现了`IPolicyHandler`的类来代替函数。

```TypeScript
export class ReadArticlePolicyHandler implements IPolicyHandler {
  handle(ability: AppAbility) {
    return ability.can(Action.Read, Article);
  }
}
```

并这样使用。

```TypeScript
@Get()
@UseGuards(PoliciesGuard)
@CheckPolicies(new ReadArticlePolicyHandler())
findAll() {
  return this.articlesService.findAll();
}
```

!> 由于我们必须使用 `new`关键词来实例化一个策略处理函数，`CreateArticlePolicyHandler`类不能使用注入依赖。这在`ModuleRef#get`方法中强调过，参见[这里](8/fundamentals.md#依赖注入))。基本上，要替代通过`@CheckPolicies()`装饰器注册函数和实例，你需要允许传递一个`Type<IPolicyHandler>`，然后在守卫中使用一个类型引用(`moduleRef.get(YOUR_HANDLER_TYPE`)获取实例，或者使用`ModuleRef#create`方法进行动态实例化。

## 加密和散列

`加密`是一个信息编码的过程。这个过程将原始信息，即明文，转换为密文。理想情况下，只有授权方可以将密文解密为明文。加密本身并不能防止干扰，但是会将可理解内容拒绝给一个可能的拦截器。加密是个双向的函数，包含加密以及使用正确的`key`解密。

`哈希`是一个将给定值转换成另一个值的过程。哈希函数使用数学算法来创建一个新值。一旦哈希完成，是无法从输出值计算回输入值的。

### 加密

`Node.js`提供了一个内置的[crypto 模块](https://nodejs.org/api/crypto.html)可用于加密和解密字符串，数字，Buffer，流等等。Nest 未在此基础上提供额外的包以减少不必要的干扰。

一个使用`AES(高级加密系统) aes-256-ctr`算法，CTR 加密模式。

```TypeScript
import { createCipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';

const iv = randomBytes(16);
const password = 'Password used to generate key';

// The key length is dependent on the algorithm.
// In this case for aes256, it is 32 bytes.
const key = (await promisify(scrypt)(password, 'salt', 32)) as Buffer;
const cipher = createCipheriv('aes-256-ctr', key, iv);

const textToEncrypt = 'Nest';
const encryptedText = Buffer.concat([
  cipher.update(textToEncrypt),
  cipher.final(),
]);
```

接下来，解密`encryptedText`值。

```TypeScript
import { createDecipheriv } from 'crypto';

const decipher = createDecipheriv('aes-256-ctr', key, iv);
const decryptedText = Buffer.concat([
  decipher.update(encryptedText),
  decipher.final(),
]);
```

### 散列

散列方面推荐使用 [bcrypt](https://www.npmjs.com/package/bcrypt) 或 [argon2](https://www.npmjs.com/package/argon2)包. Nest 自身并未提供任何这些模块的包装器以减少不必要的抽象（让学习曲线更短）。

例如，使用`bcrypt`来哈希一个随机密码。

首先安装依赖。

```bash
$ npm i bcrypt
$ npm i -D @types/bcrypt
```

依赖安装后，可以使用哈希函数。

```TypeScript
import * as bcrypt from 'bcrypt';

const saltOrRounds = 10;
const password = 'random_password';
const hash = await bcrypt.hash(password, saltOrRounds);
```

使用`genSalt`函数来生成哈希需要的盐。

```TypeScript
const salt = await bcrypt.genSalt();
```

使用`compare`函数来比较/检查密码。

```TypeScript
const isMatch = await bcrypt.compare(password, hash);
```

更多函数参见[这里](https://www.npmjs.com/package/bcrypt)。

## Helmet

通过适当地设置 `HTTP` 头，[Helmet](https://github.com/helmetjs/helmet) 可以帮助保护您的应用免受一些众所周知的 `Web` 漏洞的影响。通常，`Helmet` 只是`14`个较小的中间件函数的集合，它们设置与安全相关的 `HTTP` 头（[阅读更多](https://github.com/helmetjs/helmet#how-it-works)）。

?> 要在全局使用`Helmet`，需要在调用`app.use()`之前或者可能调用`app.use()`函数之前注册。这是由平台底层机制中(EXpress 或者 Fastify)中间件/路径的定义决定的。如果在定义路径之后使用`helmet`或者`cors`中间件，其之前的路径将不会应用这些中间件，而仅在定义之后的路径中应用。

### 在 Express 中使用（默认）

首先，安装所需的包：

```bash
$ npm i --save helmet
```

安装完成后，将其应用为全局中间件。

```typescript
import * as helmet from 'helmet';
// somewhere in your initialization file
app.use(helmet());
```

?> 如果在引入`helmet`时返回`This expression is not callable`错误。你可能需要将项目中`tsconfig.json`文件的`allowSyntheticDefaultImports`和`esModuleInterop`选项配置为`true`。在这种情况下，将引入声明修改为：`import helmet from 'helmet'`。

### 在 Fastify 中使用

如果使用`FastifyAdapter`，安装`fastify-helmet`包：

```bash
$ npm i --save fastify-helmet
```

`fastify-helmet`需要作为`Fastify`插件而不是中间件使用，例如，用`app.register()`调用。

```typescript
import * as helmet from 'fastify-helmet';
// somewhere in your initialization file
app.register(helmet);
```

!> 在使用`apollo-server-fastify`和`fastify-helmet`时，在`GraphQL`应用中与[CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)使用时可能出问题，需要如下配置 CSP。

```TypeScript
app.register(helmet, {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: [`'self'`],
      styleSrc: [`'self'`, `'unsafe-inline'`, 'cdn.jsdelivr.net', 'fonts.googleapis.com'],
      fontSrc: [`'self'`, 'fonts.gstatic.com'],
      imgSrc: [`'self'`, 'data:', 'cdn.jsdelivr.net'],
      scriptSrc: [`'self'`, `https: 'unsafe-inline'`, `cdn.jsdelivr.net`],
    },
  },
});

// If you are not going to use CSP at all, you can use this:
app.register(helmet, {
  contentSecurityPolicy: false,
});
```

## CORS

跨源资源共享（`CORS`）是一种允许从另一个域请求资源的机制。在底层，`Nest` 使用了 Express 的[cors](https://github.com/expressjs/cors) 包，它提供了一系列选项，您可以根据自己的要求进行自定义。

### 开始

为了启用 `CORS`，必须调用 `enableCors()` 方法。

```typescript
const app = await NestFactory.create(AppModule);
app.enableCors();
await app.listen(3000);
```

`enableCors()`方法需要一个可选的配置对象参数。这个对象的可用属性在官方 <a href="https://github.com/expressjs/cors#configuration-options" style="color:red;">CORS</a> 文档中有所描述。另一种方法是传递一个<a href="https://github.com/expressjs/cors#configuring-cors-asynchronously" style="color:red;">回调函数</a>，来让你根据请求异步地定义配置对象。

或者通过 `create()` 方法的选项对象启用 CORS。将 `cors`属性设置为`true`，以使用默认设置启用 CORS。又或者，传递一个 <a href="https://github.com/expressjs/cors#configuration-options" style="color:red;">CORS 配置对象</a> 或 <a href="https://github.com/expressjs/cors#configuring-cors-asynchronously" style="color:red;">回调函数</a> 作为 `cors` 属性的值来自定义其行为。

```typescript
const app = await NestFactory.create(AppModule, { cors: true });
await app.listen(3000);
```

## `CSRF`保护

跨站点请求伪造（称为 `CSRF` 或 `XSRF`）是一种恶意利用网站，其中未经授权的命令从 `Web` 应用程序信任的用户传输。要减轻此类攻击，您可以使用 [csurf](https://github.com/expressjs/csurf) 软件包。

### 在 Express 中使用（默认）

首先，安装所需的包：

```bash
$ npm i --save csurf
```

!> 正如 `csurf` 中间件页面所解释的，`csurf` 模块需要首先初始化会话中间件或 `cookie` 解析器。有关进一步说明，请参阅该[文档](https://github.com/expressjs/csurf#csurf)。

安装完成后，将其应用为全局中间件。

```typescript
import * as csurf from 'csurf';
// somewhere in your initialization file
app.use(csurf());
```

### 在 Fastify 中使用

首先，安装所需的包：

```bash
$ npm i --save fastify-csrf
```

安装完成后，将其注册为`fastify-csrf`插件。

```typescript
import fastifyCsrf from 'fastify-csrf';
// somewhere in your initialization file
app.register(fastifyCsrf);
```

## 限速

为了保护您的应用程序免受暴力攻击，您必须实现某种速率限制。幸运的是，`NPM`上已经有很多各种中间件可用。其中之一是[express-rate-limit](https://github.com/nfriedly/express-rate-limit)。

```bash
$ npm i --save express-rate-limit
```

安装完成后，将其应用为全局中间件。

```typescript
import rateLimit from 'express-rate-limit';
// somewhere in your initialization file
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  })
);
```

如果在服务器和以太网之间存在负载均衡或者反向代理，Express 可能需要配置为信任 proxy 设置的头文件，从而保证最终用户得到正确的 IP 地址。要如此，首先使用`NestExpressApplication`平台[接口](https://docs.nestjs.com/first-steps#platform)来创建你的`app`实例，然后配置[trust proxy](https://expressjs.com/en/guide/behind-proxies.html)设置。

```TypeScript
const app = await NestFactory.create<NestExpressApplication>(AppModule);
// see https://expressjs.com/en/guide/behind-proxies.html
app.set('trust proxy', 1);
```

?> 如果使用 `FastifyAdapter`，用 [fastify-rate-limit](https://github.com/fastify/fastify-rate-limit)替换。

### 译者署名

| 用户名                                     | 头像                                                                                                          | 职能 | 签名                                                                                        |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------- | ---- | ------------------------------------------------------------------------------------------- |
| [@weizy0219](https://github.com/weizy0219) | <img class="avatar-66 rm-style" height="70" src="https://avatars3.githubusercontent.com/u/19883738?s=60&v=4"> | 翻译 | 专注于 TypeScript 全栈、物联网和 Python 数据科学，[@weizhiyong](https://www.weizhiyong.com) |
| [@ThisIsLoui](https://github.com/ThisIsLoui) | <img class="avatar-66 rm-style" height="70" src="https://avatars.githubusercontent.com/u/69883404?s=96&v=4"> | 翻译 | 你好，这里是 Loui |
