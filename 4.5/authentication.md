## 身份验证 （Passport）

Passport 是最受欢迎的认证库，几乎全球所有的 node.js 开发人员都知道，并且已经在很多生产应用程序中使用。将此工具与 Nest 框架集成非常简单。为了演示目的，我将设置 Passport-jwt 策略。

要使用这个库，我们必须安装所有必需的依赖关系：

```bash
$ npm install --save passport passport-jwt jsonwebtoken
```

首先，我们要创建一个 AuthService。该类将包含2种方法，（1）使用假用户创建令牌，（2）从解码的 JWT（硬编码true）中验证签名用户。

> auth.service.ts

```typescript
import * as jwt from 'jsonwebtoken';
import { Component } from '@nestjs/common';

@Component()
export class AuthService {
  async createToken() {
    const expiresIn = 60 * 60, secretOrKey = 'secret';
    const user = { email: 'thisis@example.com' };
    const token = jwt.sign(user, secretOrKey, { expiresIn });
    return {
      expires_in: expiresIn,
      access_token: token,
    };
  }

  async validateUser(signedUser): Promise<boolean> {
    // put some validation logic here
    // for example query user by id / email / username
    return true;
  }
}
```

?> 在最佳情况下，jwt 对象和令牌配置（密钥和过期时间）应作为自定义组件提供并通过构造函数注入。

Passport 使用策略的概念来认证请求。在本章中，我们将扩展 passport-jwt 包提供的策略 JwtStrategy：

> jwt.strategy.ts

```typescript
import * as passport from 'passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Component, Inject } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Component()
export class JwtStrategy extends Strategy {
  constructor(private readonly authService: AuthService) {
    super(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        passReqToCallback: true,
        secretOrKey: 'secret',
      },
      async (req, payload, next) => await this.verify(req, payload, next)
    );
    passport.use(this);
  }

  public async verify(req, payload, done) {
    const isValid = await this.authService.validateUser(payload);
    if (!isValid) {
      return done('Unauthorized', false);
    }
    done(null, payload);
  }
}
```


JwtStrategy 使用 AuthService 来验证有效负载 (已签名的用户)。当有效载荷有效时, 该请求可以由路由处理程序处理。否则, 用户将收到 401 Unauthorized 响应。

最后一步是创建一个 AuthModule:

> auth.module.ts

```typescript
import * as passport from 'passport';
import {
  Module,
  NestModule,
  MiddlewaresConsumer,
  RequestMethod,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtStrategy } from './passport/jwt.strategy';
import { AuthController } from './auth.controller';

@Module({
  components: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule implements NestModule {
  public configure(consumer: MiddlewaresConsumer) {
    consumer
      .apply(passport.authenticate('jwt', { session: false }))
      .forRoutes({ path: '/auth/authorized', method: RequestMethod.ALL });
  }
}
```

技巧是提供一个 JwtStrategy 作为组件, 并在实例创建后立即设置策略 (在构造函数内)。此外, 我们还将功能中间件绑定到/auth/authorized 的路由 (仅用于测试目的)。

完整的源代码在[这里](https://github.com/nestjs/nest/tree/master/examples/08-passport)可用。

