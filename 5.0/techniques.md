## 认证（Authentication）

身份验证是大多数现有应用程序的重要组成部分。有许多不同的方法、策略和方法来处理用户授权。我们最终决定使用什么取决于特定的应用程序要求，并且与它们的需求密切相关。

passport 是目前最流行的 node.js 认证库，为社区所熟知，并相继应用于许多生产应用中。将此工具与 Nest 框架集成起来非常简单。为了演示，我们将设置 passport-http-bearer 和 passport-jwt 策略。

### 安装

```bash
$ npm install --save @nestjs/passport passport passport-jwt passport-http-bearer jsonwebtoken
```

### 承载

首先，我们将实现 passport-http-bearer 库。让我们从创建 `AuthService` 类开始，它将公开一个方法 `validateUser()`， 该方法的责任是通过提供的承载令牌查询用户。

> auth.service.ts

```typescript
import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async validateUser(token: string): Promise<any> {
    return await this.usersService.findOneByToken(token);
  }
}
```

`validateUser()` 方法将 `token` 作为参数。此 token 是从与HTTP请求一起传递的授权标头中提取的。`findOneByToken()` 方法的职责是验证传递的 token 是否确实存在，并与数据库中的所有注册帐户关联。

完成 `AuthService` 后，我们必须创建相应的策略，passport 将使用该策略来验证请求。

> http.strategy.ts

```typescript
import { BearerStrategy } from 'passport-http-bearer';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class HttpStrategy extends PassportStrategy(BearerStrategy) {
  constructor(private readonly authService: AuthService) {
    super();
  }

  async validate(token: any, done: Function) {
    const user = await this.authService.validateUser(token);
    if (!user) {
      return done(new UnauthorizedException(), false);
    }
    done(null, user);
  }
}
```

 `HttpStrategy` 使用 `AuthService` 来验证 token。当 token 有效时, passport 允许进行进一步的请求处理。否则, 用户将收到 `401 (Unauthorized)` 响应。

 然后，我们可以创建 `AuthModule`。

> auth.module.ts

```typescript
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { HttpStrategy } from './http.strategy';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  providers: [AuthService, HttpStrategy],
})
export class AuthModule {}

```

?> 为了使用 `UsersService`, `AuthModule` 导入了 `UsersModule`。内部实现在这里并不重要。

然后，您可以在想要启用身份验证的任何位置使用 `AuthGuard`。

```typescript
@Get('users')
@UseGuards(AuthGuard('bearer'))
findAll() {
  return [];
}
```

?> `AuthGuard` 是 `@nestjs/passport` 包中提供的。

`bearer` 是 passport 将使用的策略的名称。此外，`AuthGuard` 还接受第二个参数，`options` 对象，您可以通过该对象来确定 passport 行为。

### JWT

第二种描述的方法是使用 JSON web token (JWT) 对端点进行身份验证。首先，让我们关注 AuthService 类。我们需要从token验证切换到基于负载的验证逻辑, 并提供一种方法来为特定用户创建 JWT 令牌, 然后可用于对传入请求进行身份验证。

> auth.service.ts

```typescript
import * as jwt from 'jsonwebtoken';
import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async createToken() {
    const user: JwtPayload = { email: 'user@email.com' };
    return jwt.sign(user, 'secretKey', { expiresIn: 3600 });
  }

  async validateUser(payload: JwtPayload): Promise<any> {
    return await this.usersService.findOneByEmail(payload.email);
  }
}
```

?> 在最佳情况下，`jwt` package 和 token configuration (密钥和到期时间)应注册为 [custom providers]()。

为了简化一个示例，我们创建了一个假用户。此外，到期时间和 `secretKey` 是硬编码的(在实际应用中，您应该考虑使用环境变量)。第二步是创建相应的 `JwtStrategy`。

> jwt.strategy.ts

```typescript
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'secretKey',
    });
  }

  async validate(payload: JwtPayload, done: Function) {
    const user = await this.authService.validateUser(payload);
    if (!user) {
      return done(new UnauthorizedException(), false);
    }
    done(null, user);
  }
}
```

`JwtStrategy` 使用 `AuthService` 来验证解码的有效负载。有效负载有效(用户存在)时，passport允许进一步处理请求。否则, 用户将收到 `401 (Unauthorized)` 响应

之后，我们可以转到 `AuthModule`。

> auth.module.ts

```typescript
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
```

?> 为了使用 `UsersService`, `AuthModule` 导入了 `UsersModule`。内部实现在这里并不重要。

然后，您可以在想要启用身份验证的任何位置使用 `AuthGuard`。

```typescript
@Get('users')
@UseGuards(AuthGuard('jwt'))
findAll() {
  return [];
}
```

?> `AuthGuard` 是 `@nestjs/passport` 包中提供的。

`jwt` 是 passport 将使用的策略的名称。此外，`AuthGuard` 还接受第二个参数，`options` 对象，您可以通过该对象来确定 passport 行为。[这里](https://github.com/nestjs/nest/tree/master/sample/19-auth)提供了一个完整的工作示例。

## 数据库（TypeORM）

为了减少开始与数据库进行连接所需的样板, Nest 提供了随时可用的 `@nestjs/typeorm` 软件包。我们选择了 [TypeORM](https://github.com/typeorm/typeorm), 因为它绝对是 Node.js 中可用的最成熟的对象关系映射器 (ORM)。由于它是用TypeScript编写的，所以它在Nest框架下运行得非常好。

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

`forRoot()` 方法接受与 [TypeORM](https://github.com/typeorm/typeorm) 包中的 `createConnection()` 相同的配置对象。此外, 我们可以在项目根目录中创建一个 `ormconfig.json` 文件, 而不是将任何内容传递给它。

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

之后，`Connection` 和 `EntityManager` 将可用于注入整个项目（无需导入任何其他模块），例如以这种方式：

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

首先，我们至少需要一个实体。我们将重用 `Photo` 官方文档中的实体。

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

让我们看看 `PhotoModule`:

> photo/photo.module.ts

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

此模块使用 `forFeature()` 方法定义定义哪些存储库应在当前范围内注册。

现在, 我们可以使用 `@InjectRepository()` 修饰器向 `PhotoService` 注入 `PhotoRepository`:

> photo/photo.service.ts

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Photo } from './photo.entity';

@Injectable()
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

?> 不要忘记将 `PhotoModule` 导入根 `ApplicationModule`。

### 多个数据库

某些项目可能需要多个数据库连接。幸运的是，这也可以通过本模块实现。要使用多个连接，首先要做的是创建这些连接。在这种情况下，连接命名成为必填项。

假设你有一个 `Person` 实体和一个 `Album` 实体，每个实体都存储在他们自己的数据库中。

```typescript
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host:  'photo_db_host',
      port: 5432,
      username: 'user',
      password: 'password',
      database: 'db',
      entities: [Photo],
      synchronize: true
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      name: 'personsConnection',
      host:  'person_db_host',
      port: 5432,
      username: 'user',
      password: 'password',
      database: 'db',
      entities: [Person],
      synchronize: true
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      name: 'albumsConnection',
      host:  'album_db_host',
      port: 5432,
      username: 'user',
      password: 'password',
      database: 'db',
      entities: [Album],
      synchronize: true
    })
  ]
})
export class ApplicationModule {}
```

?> 如果未为连接设置任何 `name` ，则该连接的名称将设置为 `default`。请注意，不应该有多个没有名称或同名的连接，否则它们会被覆盖。

此时，您的 `Photo` 、 `Person` 和 `Album` 实体中的每一个都已在各自的连接中注册。通过此设置，您必须告诉 `TypeOrmModule.forFeature()` 函数和 `@InjectRepository()` 装饰器应该使用哪种连接。如果不传递任何连接名称，则使用 `default` 连接。

```typescript
@Module({
  // ...
  TypeOrmModule.forFeature([Photo]),
  TypeOrmModule.forFeature([Person], 'personsConnection'),
  TypeOrmModule.forFeature([Album], 'albumsConnection')
})    
export class ApplicationModule {}
```

您也可以为给定的连接注入 `Connection` 或 `EntityManager`：

```typescript
@Injectable()
export class PersonService {
  constructor(
    @InjectConnection('personsConnection')
    private readonly connection: Connection,
    @InjectEntityManager('personsConnection')
    private readonly entityManager: EntityManager
  ) {}
}
```

### 测试

在单元测试我们的应用程序时，我们通常希望避免任何数据库连接，从而使我们的测试适合于独立，并使它们的执行过程尽可能快。但是我们的类可能依赖于从连接实例中提取的存储库。那是什么？解决方案是创建假存储库。为了实现这一点，我们应该设置 custom providers。事实上，每个注册的存储库都由 `entitynamereposition` 标记表示，其中 `EntityName` 是实体类的名称。

`@nestjs/typeorm` 包提供了基于给定实体返回准备好token的 `getRepositoryToken()` 函数。

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

现在, 将使用硬编码 `mockRepository` 作为 `PhotoRepository`。每当任何提供程序使用 `@InjectRepository()` 修饰器请求 `PhotoRepository` 时, Nest 会使用注册的 `mockRepository` 对象。

[这儿](https://github.com/nestjs/nest/tree/master/sample/05-sql-typeorm)有一个可用的例子。

## Mongo

## 文件上传

为了处理文件上传，Nest使用了[multer](https://github.com/expressjs/multer)中间件。这个中间件是完全可配置的，您可以根据您的应用需求调整其行为。

### 基本实例

当我们要上传单个文件时, 我们只需将 `FileInterceptor ()` 与处理程序绑定在一起, 然后使用 `@UploadedFile ()` 装饰器从 `request` 中取出 `file`。

```typescript
@Post('upload')
@UseInterceptors(FileInterceptor('file'))
uploadFile(@UploadedFile() file) {
  console.log(file);
}
```

?> `FileInterceptor()` 和 `@UploadedFile()` 装饰都是 `@nestjs/common` 包提供的。

`FileInterceptor()` 接收两个参数, 一个 `fieldName` (指向包含文件的 HTML 表单的字段) 和可选 `options` 对象。这些 `MulterOptions` 等效于传入 multer 构造函数 ([此处](https://github.com/expressjs/multer#multeropts)有更多详细信息)

### 多个文件

为了同时上传多个文件，我们使用 `FilesInterceptor()`。这个拦截器需要三个参数。`fieldName`(保持不变)、可同时上载的最大文件数 `maxCount` 以及可选的 `MulterOptions` 对象。此外，要从 `request` 对象中选择文件，我们使用 `@UploadedFiles()` 装饰器

```typescript
@Post('upload')
@UseInterceptors(FilesInterceptor('files'))
uploadFile(@UploadedFiles() files) {
  console.log(files);
}
```

?> `FilesInterceptor()` 和 `@UploadedFiles()` 装饰都是 `@nestjs/common` 包提供的。

## 日志记录（Logger）

Nest附带了一个默认的内部 `Logger` 实现，它在实例化过程中使用，并且在几个不同的情况下使用，例如 occurred exception 等。但有时，您可能希望完全禁用日志记录，或者提供自定义实现并自行处理消息。为了关闭 logger，我们使用 Nest 的 options 对象。


```typescript
const app = await NestFactory.create(ApplicationModule, {
  logger: false,
});
await app.listen(3000);
```

不过, 我们可能希望在底层使用不同的 logger, 而不是禁用整个日志机制。为了达到这个目的, 我们必须传递一个满足 `LoggerService` 接口的对象。例如, 可以是内置的 `console`。

```typescript
const app = await NestFactory.create(ApplicationModule, {
  logger: console,
});
await app.listen(3000);
```

但这不是个好主意。但是，我们可以轻松创建自己的记录器。

```typescript
import { LoggerService } from '@nestjs/common';

export class MyLogger implements LoggerService {
  log(message: string) {}
  error(message: string, trace: string) {}
  warn(message: string) {}
}
```

然后，我们可以直接应用 `MyLogger` 实例:

```typescript
const app = await NestFactory.create(ApplicationModule, {
  logger: new MyLogger(),
});
await app.listen(3000);
```
### 扩展内置 logger

很多用例需要创建自己的 logger。你不必完全重新发明轮子。只需扩展内置 logger 类来覆盖默认实现，并使用 super 将调用委托给父类。

```typescript
import { Logger } from '@nestjs/common';

export class MyLogger extends Logger {
  error(message: string, trace: string) {
    // add your custom business logic
    super.error(message, trace);
  }
}
```
### 依赖注入

如果要在 logger 中启用依赖项注入，则必须使 MyLogger 类成为实际应用程序的一部分。例如，您可以创建一个 LoggerModule 。

```typescript
import { Module } from '@nestjs/common';
import { MyLogger } from './my-logger.service.ts';

@Module({
  providers: [MyLogger],
  exports: [MyLogger],
})
export class LoggerModule {};
```
一旦LoggerModule 在任何地方 import，框架将负责创建 logger 的实例。现在，要在整个应用程序中使用相同的 logger 实例，包括引导和错误处理的东西，请使用以下构造：

```typescript
const app = await NestFactory.create(ApplicationModule, {
  logger: false,
});
app.useLogger(app.get(MyLogger));
await app.listen(3000);
```

此解决方案的唯一缺点是您的第一个初始化消息将不会由您的 logger 实例处理，但它并不重要。


## CORS

跨源资源共享（CORS）是一种允许从另一个域请求资源的机制。在引擎盖下，Nest 使用了 [cors](https://github.com/expressjs/cors) 软件包，该软件包提供了一些选项，您可以根据自己的要求进行自定义。为了启用CORS，你必须调用 `enableCors()` 方法。

```typescript
const app = await NestFactory.create(ApplicationModule);
app.enableCors();
await app.listen(3000);
```

而且，你可以传递一个配置对象作为这个函数的参数。可用的属性在官方的 [cors](https://github.com/expressjs/cors) 仓库中详细描述。另一种方法是使用Nest选项对象：

```typescript
const app = await NestFactory.create(ApplicationModule, { cors: true });
await app.listen(3000);
```

您也可以使用cors配置对象，而不是传递布尔值。

## Configuration

用于在不同的环境中运行的应用程序。根据环境的不同，应该使用各种配置变量。例如，很可能本地环境会针对特定数据库凭证进行中继，仅对本地数据库实例有效。为了解决这个问题，我们过去利用了 `.env` 包含键值对的文件，每个键代表一个特定的值，因为这种方法非常方便。

### 安装

为了解析我们的环境文件，我们将使用一个 [dotenv](https://github.com/motdotla/dotenv) 软件包。

```bash
$ npm i --save dotenv
```

### Service

首先，我们来创建一个 `ConfigService` 类。

```typescript
import * as dotenv from 'dotenv';
import * as fs from 'fs';

export class ConfigService {
  private readonly envConfig: { [prop: string]: string };

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
      useValue: new ConfigService(`${process.env.NODE_ENV}.env`),
    },
  ],
  exports: [ConfigService],
})
export class ConfigModule {}
```

`ConfigModule` 会注册 `ConfigService` 并将其导出。此外，我们还传递了 `.env` 文件的路径。此路径将因实际执行环境而异。现在，您可以简单地在任何位置插入 `ConfigService`，并根据传递的密钥提取特定值Sample。`.env`文件可能如下所示:

> development.env

```
DATABASE_USER=test
DATABASE_PASSWORD=test
```

### 使用ConfigService

要从 `ConfigService` 访问环境变量，我们需要注入它。因此我们首先需要导入该模块。

> app.module.ts

```typescript
@Module({
  imports: [ConfigModule],
  ...
})
```

之后，您可以使用注入标记来注入它。默认情况下，标记等于类名（在我们的例子中 `ConfigService`）。

> app.service.ts

```typescript
@Injectable()
export class AppService {
  private isAuthEnabled: boolean;
  constructor(config: ConfigService) {
    // Please take note that this check is case sensitive!
    this.isAuthEnabled = config.get('IS_AUTH_ENABLED') === 'true' ? true : false;
  }
}
```

您也可以将 `ConfigModule` 声明为全局模块，而不是在所有模块中重复导入 `ConfigModule`。

### 高级配置（可选）

我们刚刚实现了一个基础 `ConfigService`。但是，这种方法有几个缺点，我们现在将解决这些缺点:

* 缺少环境变量的名称和类型（无智能感知）
* 缺少提供对 `.env` 文件的验证
* env文件将布尔值作为string ('`true`'),提供，因此每次都必须将它们转换为 `boolean`

### 验证

我们将从验证提供的环境变量开始。如果未提供所需的环境变量或者它们不符合您的预定义要求，则可以抛出错误。为此，我们将使用npm包 [Joi](https://github.com/hapijs/joi)。通过Joi，您可以定义一个对象模式（schema）并根据它来验证JavaScript对象。

安装Joi和它的类型（用于TypeScript用户）：

```bash
$ npm install --save joi
$ npm install --save-dev @types/joi
```

安装软件包后，我们就可以转到 `ConfigService`。

> config.service.ts

```typescript
import * as Joi from 'joi';
import * as fs from 'fs';

export interface EnvConfig {
  [prop: string]: string;
}

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
        .valid(['development', 'production', 'test', 'provision'])
        .default('development'),
      PORT: Joi.number().default(3000),
      API_AUTH_ENABLED: Joi.boolean().required(),
    });

    const { error, value: validatedEnvConfig } = Joi.validate(
      envConfig,
      envVarsSchema,
    );
    if (error) {
      throw new Error(`Config validation error: ${error.message}`);
    }
    return validatedEnvConfig;
  }
}
```

由于我们为 `NODE_ENV` 和 `PORT` 设置了默认值，因此如果不在环境文件中提供这些变量，验证将不会失败。然而, 我们需要明确提供 `API_AUTH_ENABLED`。如果我们的.env文件中的变量不是模式（schema）的一部分, 则验证也会引发错误。此外，Joi 还会尝试将env字符串转换为正确的类型。

### 类属性

对于每个配置属性，我们必须添加一个getter方法。

> config.service.ts

```typescript
get isApiAuthEnabled(): boolean {
  return Boolean(this.envConfig.API_AUTH_ENABLED);
}
```

### 用法示例

现在我们可以直接访问类属性。

> config.service.ts

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

## HTTP模块

[Axios](https://github.com/axios/axios) 是丰富功能的 HTTP 客户端, 广泛应用于许多应用程序中。这就是为什么Nest包装这个包, 并公开它默认为内置 `HttpModule`。`HttpModule` 导出 `HttpService`, 它只是公开了基于 axios 的方法来执行 HTTP 请求, 而且还将返回类型转换为 `Observables`。

为了使用 `httppservice`，我们需要导入 `HttpModule`。

```typescript
@Module({
  imports: [HttpModule],
  providers: [CatsService],
})
export class CatsModule {}
```

？> `HttpModule` 是 `@nestjs/common` 包提供的

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

## MVC

Nest 默认使用 Express 库，因此有关 Express 中的 MVC（模型 - 视图 - 控制器）模式的每个教程都与 Nest 相关。首先，让我们使用CLI工具搭建一个简单的Nest应用程序：

```bash
$ npm i -g @nestjs/cli
$ nest new project
```

为了创建一个简单的MVC应用程序，我们必须安装一个[模板引擎](http://expressjs.com/en/guide/using-template-engines.html)：

```bash
$ npm install --save hbs
```

我们决定使用 `hbs` 引擎，但您可以使用任何符合您要求的内容。安装过程完成后，我们需要使用以下代码配置快速实例：

> main.ts

``` typescript
import { NestFactory } from '@nestjs/core';
import { ApplicationModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(ApplicationModule);

  app.useStaticAssets(__dirname + '/public');
  app.setBaseViewsDir(__dirname + '/views');
  app.setViewEngine('hbs');

  await app.listen(3000);
}
bootstrap();
```

我们告诉express，该 `public` 目录将用于存储静态文件，  `views` 将包含模板，并且 `hbs` 应使用模板引擎来呈现 HTML 输出。

现在，让我们在该文件夹内创建一个 `views` 目录和一个 `index.hbs` 模板。在模板内部，我们将打印从控制器传递的 `message`：

> index.hbs

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
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

?> 事实上，当 Nest 检测到 `@Res()` 装饰器时，它会注入 `response` 对象。在[这里](http://www.expressjs.com.cn/4x/api.html)了解更多关于它的能力。

在应用程序运行时，打开浏览器访问 `http://localhost:3000/` 你应该看到这个 Hello world! 消息。

[这里](https://github.com/nestjs/nest/tree/master/sample/15-mvc)有一个可用的例子

### Fastify

如[本章](https://docs.nestjs.com/v5/)所述，我们可以将任何兼容的HTTP提供程序与Nest一起使用。其中一个是[fastify](https://github.com/fastify/fastify)库。为了创建一个具有fastify的MVC应用程序，我们必须安装以下软件包:

```bash
$ npm i --save fastify point-of-view handlebars
```

接下来的步骤几乎涵盖了与express库相同的内容(差别很小)。安装过程完成后，我们需要打开 `main.ts` 文件并更新其内容:

> main.ts

```typescript
import { NestFactory } from '@nestjs/core';
import { ApplicationModule } from './app.module';
import { FastifyAdapter } from '@nestjs/core/adapters/fastify-adapter';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(ApplicationModule, new FastifyAdapter());
  app.useStaticAssets({
    root: join(__dirname, 'public'),
    prefix: '/public/',
  });
  app.setViewEngine({
    engine: {
      handlebars: require('handlebars'),
    },
    templates: join(__dirname, 'views'),
  });
  await app.listen(3000);
}
bootstrap();
```

API略有不同，但这些方法调用背后的想法保持不变。此外，我们还必须确保传递到 `@Render()` 装饰器中的模板名称包含文件扩展名。

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

在应用程序运行时，打开浏览器并导航至`http://localhost:3000/`。你应该看到这个Hello world!消息。

[这里](https://github.com/nestjs/nest/tree/master/sample/17-mvc-fastify)有 一个可用的例子。

## 性能（Fastify）

在底层，Nest使用了[Express](https://expressjs.com/)，但如前所述，它提供了与各种其他库的兼容性，例如 [Fastify](https://github.com/fastify/fastify)。它是怎么工作的？事实上，Nest需要使用您最喜欢的库，它是一个兼容的适配器，它主要将相应的处理程序代理到适当的库特定的方法。此外，您的库必须至少提供与express类似的请求-响应周期管理。

Fastify非常适合这里，因为它以与express类似的方式解决设计问题。然而，fastify的速度要快得多，达到了几乎两倍的基准测试结果。问题是，为什么Nest仍然使用express作为默认的HTTP提供程序？因为express是应用广泛、广为人知的，而且拥有一套庞大的兼容中间件。

但我们并没有将人们锁定在单一的模式中。我们让他们使用任何他们需要的东西。如果您关心真正出色的性能，Fastify是一个更好的选择，这就是为什么我们提供内置 `FastifyAdapter` 有助于将此库与Nest整合在一起的原因。

### 安装

首先，我们需要安装所需的软件包：

```bash
$ npm i --save fastify fastify-formbody
```

### 适配器（Adapter）

安装fastify后，我们可以使用 `FastifyAdapter`。

```typescript
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter } from '@nestjs/core/adapters';
import { ApplicationModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(ApplicationModule, new FastifyAdapter());
  await app.listen(3000);
}
bootstrap();
```

就这样。此外，您还可以通过 `FastifyAdapter` 构造函数将选项传递到fastify构造函数中。请记住，Nest现在使用fastify作为HTTP提供程序，这意味着在express上转发的每个配方都将不再起作用。您应该使用fastify等效软件包。

## 热重载（Webpack）

对应用程序的引导过程影响最大的是TypeScript编译。但问题是，每次发生变化时，我们是否必须重新编译整个项目？一点也不。这就是为什么 [webpack](https://github.com/webpack/webpack) HMR（Hot-Module Replacement）大大减少了实例化您的应用程序所需的时间。

### 安装

首先，我们安装所需的软件包：

```bash
$ npm i --save-dev webpack webpack-cli webpack-node-externals
```

### 配置（Configuration）

然后，我们需要创建一个` webpack.config.js`，它是webpack的一个配置文件，并将其放入根目录。

```typescript
const webpack = require('webpack');
const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: ['webpack/hot/poll?100', './src/main.ts'],
  watch: true,
  target: 'node',
  externals: [
    nodeExternals({
      whitelist: ['webpack/hot/poll?100'],
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
  plugins: [new webpack.HotModuleReplacementPlugin()],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'server.js',
  },
};
```

此配置告诉webpack关于我们的应用程序的一些基本内容。其中有一个入口文件，应该使用哪个目录来保存编译后的文件，以及为了编译源文件我们要使用哪种加载程序。基本上，你不应该担心太多，你根本不需要理解这个文件的内容。

### 热模块更换

为了启用HMR，我们必须打开Nest应用程序入口文件（这是 `main.ts`）并添加一些关键的事情。

```typescript
declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(ApplicationModule);
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
"start": "node dist/server",
"webpack": "webpack --config webpack.config.js"
```

现在只需打开你的命令行并运行下面的命令：

```bash
$ npm run webpack
```

webpack开始监视文件后，在另一个命令行窗口中运行另一个命令:

```bash
$ npm run start
```

[这里](https://github.com/nestjs/nest/tree/master/sample/08-webpack)有一个可用的例子
