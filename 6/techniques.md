## 认证（Authentication）


身份验证是大多数现有应用程序的重要组成部分。有许多不同的方法、策略和方法来处理用户授权。我们最终决定使用什么取决于特定的应用程序要求，并且与它们的需求密切相关。

passport 是目前最流行的 node.js 认证库，为社区所熟知，并相继应用于许多生产应用中。将此工具与 Nest 框架集成起来非常简单。为了演示，我们将设置 passport-http-bearer 和 passport-jwt 策略。

### 安装

我们必须安装一些基本的包才能开始使用。此外，我们将首先实施承载策略，因此我们需要安装 passport-http-bearer 包。



```bash
$ npm install --save @nestjs/passport passport passport-http-bearer
```

### 承载

首先，我们将实施 passport-http-bearer 。让我们从创建 `AuthService` 类开始，承载令牌通常用于保护 API 接口，通常使用 OAuth 2.0 。HTTP 承载认证策略使用承载令牌对用户进行认证。

它将公开一个函数 `validateUser()`， 该函数的责任是通过提供的承载令牌查询用户。

> auth.service.ts

```typescript
import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async validateUser(token: string): Promise<any> {
    // Validate if token passed along with HTTP request
    // is associated with any registered account in the database
    return await this.usersService.findOneByToken(token);
  }
}
```

`validateUser()` 函数将 `token` 作为参数。此 token 是从  HTTP 请求中的 `Authorization` 提取的。`findOneByToken()` 函数的职责是验证传递的 token 是否确实存在，并与数据库中的所有注册帐户关联。

完成 `AuthService` 后，我们必须创建相应的策略，passport 将使用该策略来验证请求。

> http.strategy.ts

```typescript
import { Strategy } from 'passport-http-bearer';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class HttpStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super();
  }

  async validate(token: string) {
    const user = await this.authService.validateUser(token);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
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

 `AuthGuard` 是 `@nestjs/passport` 包中提供的。`bearer` 是 passport 将使用的策略的名称。让我们检查接口是否有效保护。为了确保一切正常，我们将在users 不设置有效令牌的情况下对资源执行 GET 请求。
``` bash
$ curl localhost:3000/users
```

应用程序应响应 401 Unauthorized 状态代码和以下响应正文：

```
"statusCode": 401,
"error": "Unauthorized"
```
如果您事先创建了有效令牌并将其与 HTTP 请求一起传递，则应用程序将分别标识用户，将其对象附加到请求，并允许进一步的请求处理。

```bash
$ curl localhost:3000/users -H "Authorization: Bearer TOKEN"
```

### 默认策略

要确定默认策略行为，您可以注册 PassportModule。

> auth.module.ts

```typescript
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { HttpStrategy } from './http.strategy';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'bearer' }),
    UsersModule,
  ],
  providers: [AuthService, HttpStrategy],
  exports: [PassportModule, AuthService]
})
export class AuthModule {}
```

`defaultStrategy` 设置完成后，您不再需要在 `@AuthGuard()` 装饰器中手动传递策略名称。

```typescript
@Get('users')
@UseGuards(AuthGuard())
findAll() {
  return [];
}
```

?> 请记住，每个使用该模块的模块 PassportModule 或 AuthModule 必须导入 AuthGuard。


### 用户对象

当正确验证请求时，用户实体将附加到请求对象并可通过 user 属性访问（例如req.user）。要更改属性名称，请设置 property 选项对象。

```typescript
PassportModule.register({ property: 'profile' });
```

### 自定义护照
 
根据所使用的策略，护照会采用一系列影响库行为的属性。使用 register() 方法将选项对象直接传递给护照实例。

```typescript
PassportModule.register({ session: true });
```

### 继承

在大多数情况下，AuthGuard 就足够了。但是，为了调整默认错误处理或身份验证逻辑，您可以在子类中扩展类和覆盖方法。

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
    // Add your custom authentication logic here
    // for example, call super.logIn(request) to establish a session.
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}

```



### JWT

第二种描述的方法是使用 JSON web token (JWT) 对接口进行身份验证，我们需要安装所需的包。

```bash
$ npm install --save @nestjs/jwt passport-jwt
```


让我们关注 AuthService 类。我们需要从token 验证切换到基于负载的验证逻辑, 并提供一种方法来为特定用户创建 JWT 令牌, 然后可用于对传入请求进行身份验证。

> auth.service.ts

```typescript
import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(): Promise<string> {
    // In the real-world app you shouldn't expose this method publicly
    // instead, return a token once you verify user credentials
    const user: JwtPayload = { email: 'user@email.com' };
    return this.jwtService.sign(user);
  }

  async validateUser(payload: JwtPayload): Promise<any> {
    return await this.usersService.findOneByEmail(payload.email);
  }
}
```

?> JwtPayload 是只有 email 一个属性的接口，表示已解码的 JWT 令牌。

为了简化示例，我们创建了一个假用户。第二步是创建一个对应的 `JwtStrategy`。

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

  async validate(payload: JwtPayload) {
    const user = await this.authService.validateUser(payload);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
```



`JwtStrategy` 使用 `AuthService` 来验证解码的有效负载。有效负载有效(用户存在)时，passport允许进一步处理请求。否则, 用户将收到 `401 (Unauthorized)` 响应

之后，我们可以转到 `AuthModule`。

> auth.module.ts

```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secretOrPrivateKey: 'secretKey',
      signOptions: {
        expiresIn: 3600,
      },
    }),
    UsersModule,
  ],
  providers: [AuthService, JwtStrategy],
  exports: [PassportModule, AuthService],
})
export class AuthModule {}
```

?> 为了使用 `UsersService`, `AuthModule` 导入了 `UsersModule`。内部实现在这里并不重要。此外，JwtModule 已经静态注册。要切换到异步配置，请在[此处](https://github.com/nestjs/passport)阅读更多内容。


此外，到期时间和 secretKey 是硬编码的(在实际应用中，您应该考虑使用环境变量)。


然后，您可以在想要启用身份验证的任何位置使用 `AuthGuard`。

```typescript
@Get('users')
@UseGuards(AuthGuard())
findAll() {
  return [];
}
```


让我们检查端点是否有效保护。为了确保一切正常，我们将在 users 不设置有效令牌的情况下对资源执行 GET 请求。

```bash
$ curl localhost:3000/users
```


应用程序应响应 `401 Unauthorized` 状态代码和以下响应正文：

```
"statusCode": 401,
"error": "Unauthorized"
```

如果您事先创建了有效令牌并将其与 HTTP 请求一起传递，则应用程序将分别标识用户，将其对象附加到请求，并允许进一步的请求处理。

```bash
$ curl localhost:3000/users -H "Authorization: Bearer TOKEN
```

### 示例

一个完整的工作示例，请[点击这里](https://github.com/nestjs/nest/tree/master/sample/19-auth)。



### 多种策略


通常，您最终会在整个应用程序中重复使用单一策略。但是，有时您可能希望针对不同的范围使用不同的策略。在多个策略的情况下，将第二个参数传递给PassportStrategy 函数。通常，此参数是策略的名称。

```typescript
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt')
```

在上面的例子中，jwt 变成了 JwtStrategy。之后，您可以用 @AuthGuard('jwt') 像以前一样使用。

### GraphQL

为了将 AuthGuard 与 GraphQ L一起使用，您必须扩展内置 AuthGuard 类和覆盖 getRequest() 函数。

```typescript
@Injectable()
export class GqlAuthGuard extends AuthGuard('jwt') {
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }
}
```

我们假设 req（请求）已作为上下文值的一部分传递。我们必须在模块设置中设置此行为。

```typescript
GraphQLModule.forRoot({
  context: ({ req }) => ({ req }),
});
```
而现在，上下文价值将具有 req 属性。


## 数据库（TypeORM）

为了减少开始与数据库进行连接所需的样板, Nest 提供了随时可用的 `@nestjs/typeorm` 软件包。我们选择了 [TypeORM](https://github.com/typeorm/typeorm), 因为它绝对是 Node.js 中可用的最成熟的对象关系映射器 (ORM)。由于它是用TypeScript编写的，所以它在Nest框架下运行得非常好。

首先，我们需要安装所有必需的依赖关系：

```bash
$ npm install --save @nestjs/typeorm typeorm mysql
```

?> 在本章中，我们将使用 MySQL 数据库，但 TypeORM 提供了许多不同的支持，如 PostgreSQL【推荐】，SQLite 甚至MongoDB（NoSQL）。

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
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
  ],
})
export class ApplicationModule {}
```

`forRoot()` 函数接受与 [TypeORM](https://github.com/typeorm/typeorm) 包中的 `createConnection()` 相同的配置对象。此外, 我们可以在项目根目录中创建一个 `ormconfig.json` 文件, 而不是将任何内容传递给它。

> ormconfig.json

```javascript
{
  "type": "mysql",
  "host": "localhost",
  "port": 3306,
  "username": "root",
  "password": "root",
  "database": "test",
  "entities": ["src/**/*.entity{.ts,.js}"],
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

该 TypeORM 支持库的设计模式，使每个实体都有自己的仓库。这些存储库可以从数据库连接中获取。

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

  async findAll(): Promise<Photo[]> {
    return await this.photoRepository.find();
  }
}
```

> 不要忘记将 `PhotoModule` 导入根 `ApplicationModule`。

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
export class ApplicationModule {}
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
    private readonly entityManager: EntityManager,
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



### 定制存储库

TypeORM 提供称为自定义存储库的功能。要了解有关它的更多信息，请访问此页面。基本上，自定义存储库允许您扩展基本存储库类，并使用几种特殊方法对其进行丰富。

要创建自定义存储库，请使用 @EntityRepository() 装饰器和扩展 Repository 类。

```typescript
@EntityRepository(Author)
export class AuthorRepository extends Repository<Author> {}
```


?>  @EntityRepository() 和 Repository 来自 typeorm 包。

创建类后，下一步是将实例化责任移交给 Nest。为此，我们必须将 AuthorRepository 类传递给 TypeOrm.forFeature() 函数。

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

通常，您可能希望异步传递模块选项，而不是事先传递它们。在这种情况下，使用 forRootAsync() 函数，提供了几种处理异步数据的方法。

第一种可能的方法是使用工厂功能：

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

显然，我们的工厂表现得与其他工厂一样（可能 async 并且能够通过注入依赖关系 inject）。

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

上面的构造将 TypeOrmConfigService 在内部进行实例化 TypeOrmModule，并将利用它来创建选项对象。在 TypeOrmConfigService 必须实现 TypeOrmOptionsFactory 的接口。

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

为了防止创建 TypeOrmConfigService 内部 TypeOrmModule 并使用从不同模块导入的提供程序，您可以使用 useExisting 语法。

```typescript
TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  useExisting: ConfigService,
});
```

它的工作原理 useClass 与一个关键区别相同 - TypeOrmModule 将查找导入的模块以重新创建已经创建的模块 ConfigService，而不是单独实例化它。

### 示例

[这儿](https://github.com/nestjs/nest/tree/master/sample/05-sql-typeorm)有一个可用的例子。



## Mongo

｛待更新｝

有两种方法可以操作 MongoDB 数据库。既使用[ORM](https://github.com/typeorm/typeorm) 提供的 MongoDB 支撑或对象建模工具 [Mongoose](http://mongoosejs.com/)。选择 ORM 的话你可以按照以前的步骤使用 typeorm 。否则请使用我们 Nest 专用包: @nestjs/mongoose


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
export class ApplicationModule {}
```

该 forRoot() 和 [mongoose](http://mongoosejs.com/) 包中的 mongoose.connect() 一样的参数对象。

### 模型注入

使用 Mongoose，一切都来自 [Schema](http://mongoosejs.com/docs/guide.html) 。让我们来定义 CatSchema：

> cats/schemas/cat.schema.ts

```
import * as mongoose from 'mongoose';

export const CatSchema = new mongoose.Schema({
  name: String,
  age: Number,
  breed: String,
});
```

CatsSchema 属于 cats 目录。这个目录代表了 CatsModule 。当然这是由您决定是否保留这样的文件目录结构。从我们的角度来看，在相应的模块目录中，最好的方法是将它们保存在一致的目录中。

我们来看看 CatsModule：

> cats/cats.module.ts

```
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

该模块使用 forFeature() 方法来定义哪些模型应在当前范围内注册。多亏了这一点，我们可以注入 CatModel 的到 CatsService 用的 @InjectModel() 装饰器:

> cats/cats.service.ts

```
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

在单元测试我们的应用程序时，我们通常希望避免任何数据库连接，使我们的测试套件独立并尽可能快地执行它们。但是我们的类可能依赖于从连接实例中提取的模型。那是什么？解决方案是创建假模型。为了实现这一点，我们应该设置[自定义提供者](https://docs.nestjs.com/fundamentals/custom-providers)。实际上，每个注册的模型都由 NameModeltoken 表示，其中 Name 是模型的名称。

该 `@nestjs/mongoose` 包公开了 `getModelToken()` 基于给定模型名称返回准备好的令牌的函数。

```
@Module({
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

现在硬编码 catModel 将被用作 Model<Cat>。每当任何提供者要求 Model<Cat> 使用 `@InjectModel()` 装饰器时，Nest 将使用注册的 catModel 对象。

### 异步配置

通常，您可能希望异步传递模块选项，而不是事先传递它们。在这种情况下，使用 `forRootAsync()` 方法，提供了几种处理异步数据的方法。

第一种可能的方法是使用工厂功能：

```
MongooseModule.forRootAsync({
  useFactory: () => ({
    uri: 'mongodb://localhost/nest',
  }),
})
```

显然，我们的工厂表现得像其他每一个（可能 async 并且能够通过注入依赖关系 inject）。

```typescript
MongooseModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => ({
    uri: configService.getString('MONGODB_URI'),
  }),
  inject: [ConfigService],
})
```

或者，您可以使用类而不是工厂:

```
MongooseModule.forRootAsync({
  useClass: MongooseConfigService,
})
```

上面的构造将 `MongooseConfigService` 在内部实例化 `MongooseModule` ，并将利用它来创建选项对象。在`MongooseConfigService` 必须实现 `MongooseOptionsFactory` 的接口。

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

```
MongooseModule.forRootAsync({
  imports: [ConfigModule],
  useExisting: ConfigService,
})
```

它的作用 useClass 与一个关键区别相同 - `MongooseModule` 将查找导入的模块以重新使用已创建的 `ConfigService`，而不是单独实例化它。

## 文件上传



为了处理文件上传，Nest使用了[multer](https://github.com/expressjs/multer)中间件。这个中间件是完全可配置的，您可以根据您的应用需求调整其行为。

Multer 是用于处理 `multipart/form-data` 的中间件 ，主要用于上传文件。

!> Multer 不会处理任何不是 multipart（multipart/form-data）的表单。此外，这个包不适用于 FastifyAdapter。

### 基本实例

当我们要上传单个文件时, 我们只需将 `FileInterceptor ()` 与处理程序绑定在一起, 然后使用 `@UploadedFile ()` 装饰器从 `request` 中取出 `file`。

```typescript
@Post('upload')
@UseInterceptors(FileInterceptor('file'))
uploadFile(@UploadedFile() file) {
  console.log(file);
}
```

?> `FileInterceptor()`装饰是`@nestjs/platform-express`包提供的， `@UploadedFile()` 装饰是 `@nestjs/common` 包提供的。

`FileInterceptor()` 接收两个参数, 一个 `fieldName` (指向包含文件的 HTML 表单的字段) 和可选 `options` 对象。这些 `MulterOptions` 等效于传入 multer 构造函数 ([此处](https://github.com/expressjs/multer#multeropts)有更多详细信息)


### 文件数组

为了上传文件数组，我们使用 FilesInterceptor()。这个拦截器有三个参数。 A fieldName（保持不变）， maxCount 即可以同时上载的最大文件数，以及可选MulterOptions 对象。另外，要从 request 对象中选择文件，我们使用 @UploadedFiles() 装饰器。

```typescript
@Post('upload')
@UseInterceptors(FilesInterceptor('files'))
uploadFile(@UploadedFiles() files) {
  console.log(files);
}
```

?> FilesInterceptor() 装饰器需要导入 @nestjs/platform-express ，而 @UploadedFiles() 导入 @nestjs/common。


### 多个文件

要上传多个文件（全部使用不同的键），我们使用 FileFieldsInterceptor() 装饰器。

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

### 默认选项

要自定义 multer 行为，您可以注册 MulterModule。我们支持[此处](https://github.com/expressjs/multer#multeropts)列出的所有选项。

```typescript
MulterModule.register({
  dest: '/upload',
});
```

### 异步配置

通常，您可能希望异步传递模块选项，而不是事先传递它们。在这种情况下，使用 registerAsync() 方法，提供了几种处理异步数据的方法。

第一种可能的方法是使用工厂功能：

```typescript
MulterModule.registerAsync({
  useFactory: () => ({
    dest: '/upload',
  }),
});
```

显然，我们的工厂表现得与其他工厂一样（并且 async并 够通过 inject 注入依赖关系）。

```typescript
MulterModule.registerAsync({
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => ({
    dest: configService.getString('MULTER_DEST'),
  }),
  inject: [ConfigService],
});
```
或者，您可以使用类而不是工厂。

```typescript
MulterModule.registerAsync({
  useClass: MulterConfigService,
});
```

上面的构造将 MulterConfigService 在内部实例化 MulterModule，并将利用它来创建选项对象。在 MulterConfigService 必须实现 MulterOptionsFactory 的接口。

```typescript
@Injectable()
class MulterConfigService implements MulterOptionsFactory {
  createMulterOptions(): MulterModuleOptions {
    return {
      dest: '/upload',
    };
  }
}
````

为了防止创建 MulterConfigService 内部 MulterModule 并使用从不同模块导入的提供程序，您可以使用 useExisting 语法。

```typescript
MulterModule.registerAsync({
  imports: [ConfigModule],
  useExisting: ConfigService,
});
```

它的工作原理与使用 Class 相同，但与 MulterModule 有本质区别。MulterModule 将查找导入的模块来重用已创建的配置服务, 而不是自行实例化它。


## 验证


验证是任何现有Web应用程序的基本功能。为了自动验证传入请求，我们利用了内置使用底层的 [class-validator](https://github.com/typestack/class-validator) 包 `ValidationPipe`。它`ValidationPipe` 提供了一种方便的方法，可以使用各种强大的验证规则验证传入的客户端有效负载。

### 概览
在 [Pipes](https://docs.nestjs.com/pipes) 一章中，我们完成了构建简化验证管道的过程。为了更好地了解我们在幕后所做的工作，我们强烈建议您阅读本文。在这里，我们将主要关注真实的用例。

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

```
@Post()
create(@Body() createUserDto: CreateUserDto) {
  return 'This action adds a new user';
}
```

然后，在我们的中添加一些验证规则 CreateCatDto。

```typescript
import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}
```

现在，当某人使用无效 email 执行对我们的接口的请求时，应用程序将响应 `400 Bad Request` 代码并跟随响应主体。

```
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

显然，响应机构不是唯一的用例 `ValidationPipe`。想象一下，我们希望 `:id` 在端点路径中接受。但是只有数字才有效。这也很简单。

```typescript
@Get(':id')
findOne(@Param() params: FindOneParams) {
  return 'This action returns a user';
}
```

而 `FindOneParams` 看起来像下面这样。

```typescript
import { IsNumberString } from 'class-validator';

export class FindOneParams {
  @IsNumberString()
  id: number;
}
```

### 禁用详细错误

错误消息有很多帮助，以便理解通过网络发送的数据有什么问题。但是，在生产环境中，您可能希望禁用详细错误。

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    disableErrorMessages: true,
  }),
);
```

现在，不会将错误消息返回给最终用户。

### 剥离属性

很多时候，我们希望只传递预定义（列入白名单）的属性。例如，如果我们期望 `email` 和 `password`属性，当有人发送时 age ，该属性应该被剥离并且在 DTO 中不可用。要启用此类行为，请设置 `whitelist` 为 true。

```
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
  }),
);
```

此设置将启用自动剥离非白名单（不包含任何装饰器）属性。但是，如果要完全停止请求处理，并向用户返回错误响应，请使用 `forbidNonWhitelisted`。

### 自动有效负载转换

该 `ValidationPipe` 不会自动将您的有效载荷到相应的 DTO 类。如果您查看控制器方法中的任何一个 `createCatDto` 或 `findOneParams` 在控制器方法中，您会注意到它们不是这些类的实际实例。要启用自动转换，请设置 `transform` 为 true。

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    transform: true,
  }),
);

```

### Websockets和微服务
无论使用何种传输方法，所有这些指南都包括 WebSockets 和微服务。

### 学到更多
要阅读有关自定义验证器，错误消息和可用装饰器的更多信息，请访问[此页面](https://github.com/typestack/class-validator)。

## 高速缓存（Caching）

缓存是一种非常简单的技术，有助于提高应用程序的性能。它充当临时数据存储，访问非常高效。


### 安装

我们首先需要安装所需的包：

```bash
$ npm install --save cache-manager
```

### 内存缓存

**[译者注：查看相关使用方法](https://www.jianshu.com/p/e7b0f3eb3aed)**

Nest 为各种缓存存储提供统一的 API。内置的是内存中的数据存储。但是，您可以轻松切换到更全面的解决方案，例如Redis。为了启用缓存，首先导入 CacheModule 并调用其 register() 方法。

```typescript
import { CacheModule, Module } from '@nestjs/common';
import { AppController } from './app.controller';

@Module({
  imports: [CacheModule.register()],
  controllers: [AppController],
})
export class ApplicationModule {}
```

然后挂载 CacheInterceptor 到某个实体（译者注: 向某个实体注入单例缓存对象）:

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

> 警告: 只有使用 @Get() 方式声明的节点会被缓存。

### 全局缓存

为了减少重复代码量，可以一次绑定 CacheInterceptor 到每个现有节点:

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

### WebSockets和微服务

显然，您可以毫不费力地使用 CacheInterceptor WebSocket 订阅者模式以及 Microservice 的模式（无论使用何种服务间的传输方法）。
> 译者注: 微服务架构中服务之间的调用需要依赖某种通讯协议介质，在 nest 中不限制你是用消息队列中间价，RPC/gRPC 协议或者对外公开 API 的 HTTP 协议。

```typescript
@CacheKey('events')
@UseInterceptors(CacheInterceptor)
@SubscribeMessage('events')
handleEvent(client: Client, data: string[]): Observable<string[]> {
  return [];
}
```
> 提示: @CacheKey() 装饰器来源于 @nestjs/common 包。

但是， @CacheKey() 需要附加装饰器以指定用于随后存储和检索缓存数据的密钥。此外，请注意，开发者不应该缓存所有内容。缓存数据是用来执行某些业务操作，而一些简单数据查询是不应该被缓存的。

### 自定义缓存

所有缓存数据都有自己的到期时间（TTL）。要自定义默认值，请将配置选项填写在 register() 方法中。

```typescript
CacheModule.register({
  ttl: 5, // seconds
  max: 10, // maximum number of items in cache
});
```

### 不同的缓存库

我们充分利用了[缓存管理器](https://github.com/BryanDonovan/node-cache-manager)。该软件包支持各种实用的商店，例如[Redis商店](https://github.com/dabroek/node-cache-manager-redis-store)（此处列出[完整列表](https://github.com/BryanDonovan/node-cache-manager#store-engines)）。要设置 Redis 存储，只需将包与 correspoding 选项一起传递给 register() 方法即可。

> 译者注: 缓存方案库目前可选的有 redis, fs, mongodb, memcached等。 

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

默认情况下， Nest 通过 @CacheKey() 装饰器设置的请求路径（在 HTTP 应用程序中）或缓存中的 key（在 websockets 和微服务中）来缓存记录与您的节点数据相关联。然而有时您可能希望根据不同因素设置跟踪，例如，使用 HTTP 头部字段（例如 Authorization 字段关联身份鉴别节点服务）。

> 本文中节点可以理解为服务，也就是一个一个被调用的方法。

为了实现这一点，创建一个子类 CacheInterceptor 并覆盖其中 trackBy() 方法。

```typescript
@Injectable()
class HttpCacheInterceptor extends CacheInterceptor {
  trackBy(context: ExecutionContext): string | undefined {
    return 'key';
  }
}
```
### 异步配置

通常，您可能希望异步传递模块选项，而不是事先传递它们。在这种情况下，使用 registerAsync() 方法，提供了几种处理异步数据的方法。

第一种可能的方法是使用工厂功能：

```typescript
CacheModule.forRootAsync({
  useFactory: () => ({
    ttl: 5,
  }),
});
```
显然，我们的工厂要看起来能让每一个调用用使用。（可以变成顺序执行的同步代码，并且能够通过注入依赖使用）。

```typescript
acheModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => ({
    ttl: configService.getString('CACHE_TTL'),
  }),
  inject: [ConfigService],
});
```

或者，您可以使用类而不是工厂:

```typescript
CacheModule.forRootAsync({
  useClass: CacheConfigService,
});
```

上面的构造将 CacheConfigService 在内部实例化为 CacheModule ，并将利用它来创建选项对象。在 CacheConfigService 中必须实现 CacheOptionsFactory 的接口。

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

为了防止 CacheConfigService 内部创建 CacheModule 并使用从不同模块导入的提供程序，您可以使用 useExisting 语法。

```typescript
CacheModule.forRootAsync({
  imports: [ConfigModule],
  useExisting: ConfigService,
});
```
它和 useClass 的用法有一个关键的相同点: CacheModule 将查找导入的模块以重新使用已创建的 ConfigService 实例，而不是重复实例化。


## 序列化（Serialization）


在发送实际响应之前， Serializers 为数据操作提供了干净的抽象层。例如，应始终从最终响应中排除敏感数据（如用户密码）。此外，某些属性可能需要额外的转换，比方说，我们不想发送整个数据库实体。相反，我们只想选择 id 和 name 。其余部分应自动剥离。不幸的是，手动映射所有实体可能会带来很多麻烦。

> 译者注: Serialization 实现可类比 composer 库中 fractal ，响应给用户的数据不仅仅要剔除设计安全的属性，还需要剔除一些无用字段如 create_time, delete_time, update_time 和其他属性。在JAVA的实体类中定义N个属性的话就会返回N个字段，解决方法可以使用范型编程，否则操作实体类回影响数据库映射字段。

### 概要
为了提供一种直接的方式来执行这些操作， Nest 附带了这个 ClassSerializerInterceptor 类。它使用[类转换器](https://github.com/typestack/class-transformer)来提供转换对象的声明性和可扩展方式。基于此类基础下，可以从类转换器 ClassSerializerInterceptor 中获取方法和调用 classToPlain() 函数返回的值。

### 排除属性

让我们假设一下，如何从一个含有多属性的实体中剔除 password 属性？

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
然后，直接在控制器的方法中调用就能获得此类 UserEntity 的实例。

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
?> 提示: @SerializeOptions()装饰器来源于 @nestjs/common 包。
现在当你调用此服务时，将收到以下响应结果：

```json
{
  "id": 1,
  "firstName": "Kamil",
  "lastName": "Mysliwiec"
}
```

### 公开属性

如果要暴露早期预先计算的属性，只需使用 @Expose() 装饰器即可。

```typescript
@Expose()
get fullName(): string {
  return `${this.firstName} ${this.lastName}`;
}
```
### 变换

您可以使用@Transform()装饰器执行其他数据转换。例如，您要选择一个名称 RoleEntity 而不是返回整个对象。

```typescript
@Transform(role => role.name)
role: RoleEntity;
```

### 通过属性

可变选项可能因某些因素而异。要覆盖默认设置，请使用 @SerializeOptions() 装饰器。

```typescript
@SerializeOptions({
  excludePrefixes: ['_'],
})
@Get()
findOne(): UserEntity {
  return {};
}
```

> 提示: @SerializeOptions() 装饰器来源于 @nestjs/common 包。

这些属性将作为 classToPlain() 函数的第二个参数传递。

### Websockets 和微服务

无论使用哪种传输介质，所有的使用指南都包括了 WebSockets 和微服务。

### 更多

想了解有关装饰器选项的更多信息，请访问此[页面](https://github.com/typestack/class-transformer)。

## 日志

Nest 在对象实例化后的几种情况下，内部实现了 Logger 日志记录，例如发生异常时候。但有时，您可能希望完全禁用日志记录，或者实现自定义日志模块并自行处理日志消息。想要关闭记录器，我们得使用 Nest 的选项对象。

```typescript
const app = await NestFactory.create(ApplicationModule, {
  logger: false,
});
await app.listen(3000);
```

尽管如此，我们可能希望在 hook 下使用不同的记录器，而不是禁用整个日志记录机制。为了做到这一点，我们必须传递一个实现 LoggerService 接口的对象。比如说可以是内置的 console。

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

然后，我们可以 MyLogger 直接应用实例：

```typescript
const app = await NestFactory.create(ApplicationModule, {
  logger: new MyLogger(),
});
await app.listen(3000);
```

### 扩展内置的日志类

很多实例操作需要创建自己的日志。你不必完全重新发明轮子。只需扩展内置 Logger 类以部分覆盖默认实现，并使用 super 将调用委托给父类。

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

如果要在 Logger 类中启用依赖项注入，则必须使 MyLogger 该类成为实际应用程序的一部分。例如，您可以创建一个 LoggerModule:

```typescript
import { Module } from '@nestjs/common';
import { MyLogger } from './my-logger.service.ts';

@Module({
  providers: [MyLogger],
  exports: [MyLogger],
})
export class LoggerModule {}
```

一旦 LoggerModule 在其他地方导入，框架将负责创建 Logger 类的实例。现在，要在整个应用程序中使用相同的 Logger 实例，包括引导和错误处理的东西，请使用以下方式：

```typescript
const app = await NestFactory.create(ApplicationModule, {
  logger: false,
});
app.useLogger(app.get(MyLogger));
await app.listen(3000);
```

此解决方案的唯一缺点是您的第一个初始化消息将不会由您的 Logger 实例处理，但此时这点并不重要。

## 安全

在本章中，您将学习一些可以提高应用程序安全性的技术。

### Helmet
通过适当地设置 HTTP 头，[Helmet](https://github.com/helmetjs/helmet) 可以帮助保护您的应用免受一些众所周知的 Web 漏洞的影响。通常，Helmet 只是12个较小的中间件函数的集合，它们设置与安全相关的 HTTP 头（[阅读更多](https://github.com/helmetjs/helmet#how-it-works)）。首先，安装所需的包：

```
$ npm i --save helmet
```

安装完成后，将其应用为全局中间件。

```typescript
import * as helmet from 'helmet';
// somewhere in your initialization file
app.use(helmet());
```

### CORS

跨源资源共享（CORS）是一种允许从另一个域请求资源的机制。在引擎盖下，Nest 使用了 [cors](https://github.com/expressjs/cors) 包，它提供了一系列选项，您可以根据自己的要求进行自定义。为了启用 CORS，您必须调用 enableCors() 方法。

```typescript
const app = await NestFactory.create(ApplicationModule);
app.enableCors();
await app.listen(3000);
```

此外，您可以将配置对象作为此函数的参数传递。可用的属性在官方 [cors](https://github.com/expressjs/cors) 存储库中详尽描述。另一种方法是使用 Nest 选项对象：

```typescript
const app = await NestFactory.create(ApplicationModule, { cors: true });
await app.listen(3000);
```

您也可以使用 cors 配置对象（[更多信息](https://github.com/expressjs/cors#configuration-options)），而不是传递布尔值。

### CSRF

跨站点请求伪造（称为 CSRF 或 XSRF）是一种恶意利用网站，其中未经授权的命令从Web应用程序信任的用户传输。要减轻此类攻击，您可以使用 [csurf](https://github.com/expressjs/csurf) 软件包。首先，安装所需的包：

```bash
$ npm i --save csurf
```

安装完成后，将其应用为全局中间件。

```typescript
import * as csurf from 'csurf';
// somewhere in your initialization file
app.use(csurf());
```


### 限速

为了保护您的应用程序免受暴力攻击，您必须实现某种速率限制。幸运的是，NPM 上已经有很多各种中间件可用。其中之一是[express-rate-limit](https://github.com/nfriedly/express-rate-limit)。

```
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

> 提示: 如果您在 FastifyAdapter 下开发，请考虑使用 [fastify-rate-limit](https://github.com/fastify/fastify-rate-limit)。

## Configuration



用于在不同的环境中运行的应用程序。根据环境的不同，应该使用各种配置变量。例如，很可能本地环境会针对特定数据库凭证进行中继，仅对本地数据库实例有效。为了解决这个问题，我们过去利用了 `.env` 包含键值对的文件，每个键代表一个特定的值，因为这种方法非常方便。


但是, 当我们使用进程全局对象时, 很难保持我们的测试不被污染, 因为测试类可能会直接使用它。另一种方法是创建一个抽象层, 即一个 ConfigModule, 它公开了一个 ConfigService, 其中包含加载的配置变量。

### 安装

某些平台会自动将我们的环境变量附加到 process.env 全局。但是，在本地环境中，我们必须手动处理它。为了解析我们的环境文件，我们将使用一个 [dotenv](https://github.com/motdotla/dotenv) 软件包。

```bash
$ npm i --save dotenv
```

### Service

首先，我们来创建一个 `ConfigService` 类。

```typescript
import * as dotenv from 'dotenv';
import * as fs from 'fs';

export class ConfigService {
  private readonly envConfig: { [key: string]: string };

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
DATABASE_USER = test;
DATABASE_PASSWORD = test;
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

### 高级配置

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
import * as dotenv from 'dotenv';
import * as Joi from 'joi';
import * as fs from 'fs';

export interface EnvConfig {
  [key: string]: string;
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

## 压缩


压缩可以大大减小响应主体的大小，从而提高 Web 应用程序的速度。使用[压缩中间件](https://github.com/expressjs/compression)启用 gzip 压缩。

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

> 提示: 如果你在使用的是 FastifyAdapter，请考虑使用 [fastify-compress](https://github.com/fastify/fastify-compress) 代替。

对于生产中的高流量网站，实施压缩的最佳方法是在反向代理级别实施。在这种情况下，您不需要使用压缩中间件。

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
所有方法都返回 AxiosResponse, 并使用 Observable 对象包装。


### 配置

Axios 提供了许多选项，您可以利用这些选项来增加您的 HttpService 功能。[在这里](https://github.com/axios/axios#request-config)阅读更多相关信息。要配置底层库实例，请使用 register() 方法的 HttpModule。

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

所有这些属性都将传递给 axios 构造函数。

### 异步配置

通常，您可能希望异步传递模块属性，而不是事先传递它们。在这种情况下，使用 registerAsync() 方法，提供了几种处理异步数据的方法。

第一种可能的方法是使用工厂功能：

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


以上构造将在 HttpModule 中实例化 Httpconcisservice, 并将利用它来创建选项对象。在 HttpConfigService 必须实现 HttpOptionsFactory厂接口。

```typescript
@Injectable()
class HttpConfigService implements HttpOptionsFactory {
  createHttpOptions(): HttpModuleOptions {
    return {
      timeout: 5000,
      maxRedirects: 5,
    };
  }
}
```

为了防止在 HttpModule 中创建 Httpconcecunservice, 并使用从不同模块导入的提供程序, 可以使用现有语法。

```typescript
HttpModule.registerAsync({
  imports: [ConfigModule],
  useExisting: ConfigService,
});
```
它的工作原理与使用类具有一个本质区别  HttpModule 将查找导入的模块来重用已创建的配置服务, 而不是自行实例化它。



## MVC


Nest 默认使用 Express 库，因此有关 Express 中的 MVC（模型 - 视图 - 控制器）模式的每个教程都与 Nest 相关。首先，让我们使用 CLI 工具搭建一个简单的Nest 应用程序：

```bash
$ npm i -g @nestjs/cli
$ nest new project
```

为了创建一个简单的MVC应用程序，我们必须安装一个[模板引擎](http://expressjs.com/en/guide/using-template-engines.html)：

```bash
$ npm install --save hbs
```

我们决定使用 `hbs` 引擎，但您可以使用任何符合您要求的内容。安装过程完成后，我们需要使用以下代码配置 express 实例：

> main.ts

``` typescript
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { ApplicationModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    ApplicationModule,
  );

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');

  await app.listen(3000);
}
bootstrap();
```

我们告诉 express，该 `public` 目录将用于存储静态文件，  `views` 将包含模板，并且 `hbs` 应使用模板引擎来呈现 HTML 输出。

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

?> 事实上，当 Nest 检测到 `@Res()` 装饰器时，它会注入 `response` 对象。在[这里](http://www.expressjs.com.cn/4x/api.html)了解更多关于它的能力。

在应用程序运行时，打开浏览器访问 `http://localhost:3000/` 你应该看到这个 Hello world! 消息。

[这里](https://github.com/nestjs/nest/tree/master/sample/15-mvc)有一个可用的例子。

### MVC（fastify）

如本章所述，我们可以将任何兼容的 HTTP 提供程序与 Nest 一起使用。比如  [Fastify](https://github.com/fastify/fastify) 。为了创建具有 fastify 的 MVC 应用程序，我们必须安装以下包：


```bash
$ npm i --save fastify point-of-view handlebars
```

接下来的步骤几乎涵盖了与 express 库相同的内容(差别很小)。安装过程完成后，我们需要打开 `main.ts` 文件并更新其内容:

> main.ts

```typescript
import { NestFactory } from '@nestjs/core';
import { NestFastifyApplication, FastifyAdapter } from '@nestjs/platform-fastify';
import { ApplicationModule } from './app.module';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    ApplicationModule,
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

API 略有不同，但这些方法调用背后的想法保持不变。此外，我们还必须确保传递到 `@Render()` 装饰器中的模板名称包含文件扩展名。

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

在应用程序运行时，打开浏览器并导航至`http://localhost:3000/`。你应该看到这个 Hello world! 消息。

[这里](https://github.com/nestjs/nest/tree/master/sample/17-mvc-fastify)有 一个可用的例子。

## 性能（Fastify）


在底层，Nest 使用了[Express](https://expressjs.com/)，但如前所述，它提供了与各种其他库的兼容性，例如 [Fastify](https://github.com/fastify/fastify)。它是怎么工作的？事实上，Nest需要使用您最喜欢的库，它是一个兼容的适配器，它主要将相应的处理程序代理到适当的库特定的方法。此外，您的库必须至少提供与 express 类似的请求-响应周期管理。

Fastify 非常适合这里，因为它以与 express 类似的方式解决设计问题。然而，fastify 的速度要快得多，达到了几乎两倍的基准测试结果。问题是，为什么Nest仍然使用express作为默认的HTTP提供程序？因为express是应用广泛、广为人知的，而且拥有一套庞大的兼容中间件。

但我们并没有将人们锁定在单一的模式中。我们让他们使用任何他们需要的东西。如果您关心真正出色的性能，Fastify 是一个更好的选择，这就是为什么我们提供内置 `FastifyAdapter` 有助于将此库与 Nest 整合在一起的原因。

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
    new FastifyAdapter(),
  );
  await app.listen(3000);
}
bootstrap();
```

如果您在 docker 容器中运行 Nest 实例，则需要指定主机，如下所示：

```typescript
await app.listen(3000, '0.0.0.0');
```


就这样。此外，您还可以通过 `FastifyAdapter` 构造函数将选项传递到 fastify 构造函数中。请记住，Nest现在使用 fastify 作为 HTTP 提供程序，这意味着在express 上转发的每个配置都将不再起作用。您应该使用 fastify 等效软件包。

## 热重载（Webpack）

对应用程序的引导过程影响最大的是TypeScript编译。但问题是，每次发生变化时，我们是否必须重新编译整个项目？一点也不。这就是为什么 [webpack](https://github.com/webpack/webpack) HMR（Hot-Module Replacement）大大减少了实例化您的应用程序所需的时间。

### 安装

首先，我们安装所需的软件包：

```bash
$ npm i --save-dev webpack webpack-cli webpack-node-externals ts-loader
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


 ### 译者署名

| 用户名 | 头像 | 职能 | 签名 |
|---|---|---|---|
| [@zuohuadong](https://github.com/zuohuadong)  | <img class="avatar-66 rm-style" src="https://wx3.sinaimg.cn/large/006fVPCvly1fmpnlt8sefj302d02s742.jpg">  |  翻译  | 专注于 caddy 和 nest，[@zuohuadong](https://github.com/zuohuadong/) at Github  |
| [@Drixn](https://drixn.com/)  | <img class="avatar-66 rm-style" src="https://cdn.drixn.com/img/src/avatar1.png">  |  翻译  | 专注于 nginx 和 C++，[@Drixn](https://drixn.com/) |
| [@Erchoc](https://github.com/erchoc)  | <img class="avatar-66 rm-style" height="70" src="https://avatars1.githubusercontent.com/u/19908809?s=400&u=e935620bf39d85bfb749a4ce4b3758b086a57de5&v=4">  |  翻译  | 学习更优雅的架构方式，做更贴切用户的产品。[@Erchoc](https://github/erchoc) at Github |
| [@havef](https://havef.github.io)  | <img class="avatar-66 rm-style" height="70" src="https://avatars1.githubusercontent.com/u/54462?s=460&v=4">  |  校正  | 数据分析、机器学习、TS/JS技术栈 [@havef](https://havef.github.io) |
