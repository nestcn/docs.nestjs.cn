<!-- 此文件从 content/websockets/gateways.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T04:53:33.092Z -->
<!-- 源文件: content/websockets/gateways.md -->

### Gateways

大多数讨论在其他部分的概念，例如依赖注入、装饰器、异常过滤器、管道、守卫和拦截器，在gateways中都适用。Nest尽量抽象实现细节，以便在HTTP平台、WebSockets和微服务中运行相同的组件。这个部分涵盖Nest特定的WebSocket方面。

在Nest中，一个gateway只是一个带有__INLINE_CODE_16__装饰器的类。技术上，gateways是平台无关的，这使它们可以与任何WebSocket库一起工作，只要创建了适配器。现有两个WS平台支持：[here](https://github.com/nestjs/jwt/blob/master/README.md)和[here](https://github.com/auth0/node-jsonwebtoken#用法)。您可以选择适合您需求的其中一个，也可以根据[global guard](/guards#绑定守卫)创建自己的适配器。

__HTML_TAG_58____HTML_TAG_59____HTML_TAG_60__

> info **提示** Gateways可以被视为[here](/guards#putting-it-all-together)；这意味着它们可以通过类构造函数注入依赖项。同时，gateways也可以被其他类（提供者和控制器）注入。

#### 安装

要开始构建WebSocket应用程序，首先安装所需的包：

```bash
$ nest g module auth
$ nest g controller auth
$ nest g service auth

```

#### 概述

通常，每个gateway都监听与**HTTP 服务器**相同的端口，除非您的应用程序不是Web应用程序或您手动更改了端口。这个默认行为可以通过将__INLINE_CODE_17__装饰器的参数设置为一个选择的端口号来修改。您也可以使用以下构建来设置gateway使用的[Passport](https://github.com/jaredhanson/passport)：

```bash
$ nest g module users
$ nest g service users

```

> warning **警告** Gateways直到在现有模块的提供者数组中被引用时实例化。

您可以将任何支持的[chapter](/recipes/passport)传递给socket构造函数，以第二个参数传递给`AuthModule`装饰器，例如：

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

gateway现在正在监听，但是我们还没有订阅任何 incoming 消息。让我们创建一个处理器来订阅`AuthService` 消息并将 exact相同的数据回送给用户。

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

> info **提示** `AuthController`和`AuthService`装饰器来自`AuthController`包。

一旦gateway创建完毕，我们可以将其注册到我们的模块中。

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

您也可以将property key传递给装饰器以从 incoming 消息体中提取：

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

如果您不想使用装饰器，以下代码是等效的：

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

在上面的示例中，`AuthService`函数有两个参数。第一个是平台特定的[here](https://github.com/nestjs/nest/tree/master/sample/19-auth-jwt)，第二个是从客户端接收的数据。这种方法不推荐，因为它需要在每个单元测试中模拟`UsersService`实例。

一旦收到`UsersService` 消息，处理器将发送包含相同数据的确认信号。另外，也可以使用库特定的方法来 emit 消息，例如使用`UsersModule`方法。为了访问连接的socket实例，使用`UsersService`装饰器。

```bash
$ npm install --save @nestjs/jwt

```

> info **提示** `@Module`装饰器来自`AuthService`包。

然而，在这种情况下，您不能使用拦截器。如果您不想回送用户，您可以简单地跳过`AuthService`语句（或明确地返回一个“falsy”值，例如`signIn()`）。

现在，当客户端 emit 消息如下：

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

`AuthModule`方法将被执行。在 order to listen for messages emitted from within the above handler，the client must attach a corresponding acknowledgment listener：

```typescript
export const jwtConstants = {
  secret: 'DO NOT USE THIS VALUE. INSTEAD, CREATE A COMPLEX SECRET AND KEEP IT SAFE OUTSIDE OF THE SOURCE CODE.',
};

```

在返回值来自消息处理器时，隐式地发送确认信号。但是在 advanced 场景中，需要直接控制确认回调。

`UsersModule`参数装饰器允许将`AuthController`回调函数直接注入到消息处理器中。
没有使用装饰器，这个回调函数作为方法的第三个参数传递。

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

#### 多个响应

确认信号只会被 dispatch 一次。此外，native WebSockets 实现不支持确认信号。为了解决这个限制，您可以返回一个对象，该对象包含两个属性。`signIn()`是 emitted 事件的名称，`Record<string, any>`是需要将其转发给客户端的数据。

```bash
$ # POST to /auth/login
$ curl -X POST http://localhost:3000/auth/login -d '{"username": "john", "password": "changeme"}' -H "Content-Type: application/json"
{"access_token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}
$ # Note: above JWT truncated

```

> info **提示** `@nestjs/jwt`接口来自`authService`包。

> warning **警告** 如果您的`auth`字段依赖于`JwtService`，则应该返回实现`auth.service.ts`的类实例，因为它忽略了 JavaScript 对象响应。以下是翻译后的中文技术文档：

为了监听 incoming response(s)，客户端需要添加另一个事件监听器。

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

#### 异步响应

消息处理器可以同步或**异步**地响应。因此，`signIn` 方法也被支持。消息处理器还可以返回一个 `@nestjs/jwt`，在这种情况下，结果值将直到流完成后被 emit。

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

在上面的示例中，消息处理器将在**3次**（每个数组项）中响应。

#### 生命周期钩子

有 3 个有用的生命周期钩子可用。所有它们都有相应的接口，并在以下表格中描述：

__HTML_TAG_61__
  __HTML_TAG_62__
    __HTML_TAG_63__
      __HTML_TAG_64__OnGatewayInit__HTML_TAG_65__
    __HTML_TAG_66__
    __HTML_TAG_67__
      强制实现 __HTML_TAG_68__afterInit()__HTML_TAG_69__ 方法。该方法接受库特定的服务器实例作为参数（并传递其他参数，如果需要）。
    __HTML_TAG_70__
  __HTML_TAG_71__
  __HTML_TAG_72__
    __HTML_TAG_73__
      __HTML_TAG_74__OnGatewayConnection__HTML_TAG_75__
    __HTML_TAG_76__
    __HTML_TAG_77__
      强制实现 __HTML_TAG_78__handleConnection()__HTML_TAG_79__ 方法。该方法接受库特定的客户端套接字实例作为参数。
    __HTML_TAG_80__
  __HTML_TAG_81__
  __HTML_TAG_82__
    __HTML_TAG_83__
      __HTML_TAG_84__OnGatewayDisconnect__HTML_TAG_85__
    __HTML_TAG_86__
    __HTML_TAG_87__
      强制实现 __HTML_TAG_88__handleDisconnect()<app-banner-courses-auth> 方法。该方法接受库特定的客户端套接字实例作为参数。
    </app-banner-courses-auth>
  __HTML_TAG_91__
__HTML_TAG_92__

> 提示 **Hint** 每个生命周期接口都来自 `signAsync()` 包。

#### 服务器和命名空间

有时，您可能需要对native、**平台特定的** 服务器实例进行直接访问。服务器实例的引用将作为 `user` 方法 (`access_token` 接口）的参数传递。另一个选项是使用 `sub` 装饰器。

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

此外，您可以使用 `userId` 属性来获取相应的命名空间，例如：

```typescript
providers: [
  {
    provide: APP_GUARD,
    useClass: AuthGuard,
  },
],

```

`AuthModule` 装饰器将服务器实例注入到存储在 `JwtModule` 装饰器中的元数据中。如果您将命名空间选项传递给 `constants.ts` 装饰器，`auth` 装饰器将返回一个 `auth.module.ts` 实例，而不是 `auth` 实例。

> 警告 **Notice** `JwtModule` 装饰器来自 `JwtModule` 包。

Nest 将自动将服务器实例分配给该属性，以便在准备使用时使用。

__HTML_TAG_93____HTML_TAG_94__

#### 示例

有一个可工作的示例可在 __LINK_102__ 中找到。