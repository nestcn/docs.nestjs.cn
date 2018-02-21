## MVC

Nest 使用 Express 库，因此有关 Express 中的 MVC（模型 - 视图 - 控制器）模式的每个教程都与 Nest 相关。首先，我们来克隆一个 Nest starter 项目：

```typescript
$ git clone https://github.com/nestjs/typescript-starter.git project
$ cd project
$ npm install
$ npm run start
```

为了创建一个简单的MVC应用程序，我们必须安装一个模板引擎：

```bash
$ npm install --save jade
```

我选择了，jade因为它是目前最受欢迎的引擎，但个人而言，我更喜欢[Mustache](https://github.com/bryanburgers/node-mustache-express)。安装过程完成后，我们需要使用以下代码配置快速实例：

> main.ts

``` typescript
import * as express from 'express';
import * as path from 'path';
import { NestFactory } from '@nestjs/core';
import { ApplicationModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(ApplicationModule);

  app.use(express.static(path.join(__dirname, 'public')));
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');

  await app.listen(3000);
}
bootstrap();
```

我们明确表示该 public 目录将用于存储静态文件，  views 将包含模板，并且 jade 应使用模板引擎来呈现 HTML 输出。

现在，让我们在该文件夹内创建一个 views 目录和一个 index.jade 模板。在模板内部，我们要打印一张 message 从控制器传来的信息：

> index.jade

```typescript
html
head
body
  p= message
```

然后, 打开 app.controller 文件, 并用下面的代码替换 root() 方法:

> app.controller.ts

```typescript
@Get()
root(@Res() res) {
  res.render('index', { message: 'Hello world!' });
}
```

事实上，当 Nest 检测到 @Res() 装饰器时，它会注入 response 对象。在[这里](http://www.expressjs.com.cn/4x/api.html)了解更多关于它的能力。

就这样。在应用程序运行时，打开浏览器访问 http://localhost:3000/ 你应该看到这个 Hello world! 消息。

## SQL

为了减少开始与数据库进行连接所需的样板, Nest 提供了随时可用的 @nestjs/typeorm 软件包。我们选择了 TypeORM, 因为它绝对是 Node.js 中可用的最成熟的对象关系映射器 (ORM)。由于它是用TypeScript编写的，所以它在Nest框架下运行得非常好。

首先，我们需要安装所有必需的依赖关系：

```bash
$ npm install --save @nestjs/typeorm typeorm mysql
```

?> 在本章中，我们将使用MySQL数据库，但TypeORM提供了许多不同的支持，如PostgreSQL，SQLite甚至MongoDB（NoSQL）。

一旦安装完成，我们可以将其 TypeOrmModule 导入到根目录中 ApplicationModule 。

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
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
  ],
})
export class ApplicationModule {}
```

forRoot() 方法接受与 TypeORM 包中的 createConnection() 相同的配置对象。此外, 我们可以在项目根目录中创建一个 ormconfig.json 文件, 而不是将任何内容传递给它。

> ormconfig.json

```javascript
{
  "type": "mysql",
  "host": "localhost",
  "port": 3306,
  "username": "root",
  "password": "root",
  "database": "test",
  "entities": ["src/**/**.entity{.ts,.js}"],
  "synchronize": true
}
```

现在我们可以简单地将圆括号留空：

> app.module.ts

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forRoot()],
})
export class ApplicationModule {}
```

之后，Connection 和 EntityManager 将可用于注入整个项目（无需导入任何其他模块），例如以这种方式：

> app.module.ts

```typescript
import { Connection } from 'typeorm';

@Module({
  imports: [TypeOrmModule.forRoot(), PhotoModule],
})
export class ApplicationModule {
  constructor(private readonly connection: Connection) {}
}
```

### 存储库模式

该TypeORM支持库的设计模式，使每个实体都有自己的仓库。这些存储库可以从数据库连接中获取。

首先，我们至少需要一个实体。我们将重用 Photo 官方文档中的实体。

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

该 Photo 实体属于该 photo 目录。这个目录代表了 PhotoModule。这是你决定在哪里保留你的模型文件。从我的观点来看，最好的方法是将它们放在他们的域中, 放在相应的模块目录中。

让我们看看 PhotoModule:

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PhotoService } from './photo.service';
import { PhotoController } from './photo.controller';
import { Photo } from './photo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Photo])],
  components: [PhotoService],
  controllers: [PhotoController],
})
export class PhotoModule {}
```


此模块使用 forFeature() 方法定义应在当前范围内注册的存储库。

现在, 我们可以使用 @InjectRepository() 修饰器向 PhotoService 注入 PhotoRepository:

> photo/photo.service.ts

```typescript
import { Component, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Photo } from './photo.entity';

@Component()
export class PhotoService {
  constructor(
    @InjectRepository(Photo)
    private readonly photoRepository: Repository<Photo>,
  ) {}

  async findAll(): Promise<Photo[]> {
    return await this.photoRepository.find();
  }
}
```

就这样。完整的源代码在[这里](https://github.com/nestjs/nest/tree/master/examples/05-sql-typeorm)可用。

?> 不要忘记将 PhotoModule 导入根 ApplicationModule。

## MongoDB

(待翻译，不建议使用 MongoDB)




## 身份验证（Passport）

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

