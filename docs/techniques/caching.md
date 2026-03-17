<!-- 此文件从 content/techniques/caching.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T05:04:00.130Z -->
<!-- 源文件: content/techniques/caching.md -->

### 缓存

缓存是一种简单且强大的技术，可以提高应用程序的性能。通过作为临时存储层，它允许快速访问频繁使用的数据，从而减少了重复获取或计算相同信息的需求。这样可以提高响应速度和整体效率。

#### 安装

要在Nest中启用缓存，您需要安装 __INLINE_CODE_25__ 和 __INLINE_CODE_26__ 包。

```bash
$ npm i @nestjs/mongoose mongoose

```

默认情况下，所有内容都存储在内存中；由于 __INLINE_CODE_27__ 使用 __LINK_105__ 作为底层实现，您可以轻松地切换到更高级的存储解决方案，例如Redis，安装相应的包。我们将在后续详细介绍。

#### 内存缓存

要在应用程序中启用缓存，import __INLINE_CODE_28__ 并使用 __INLINE_CODE_29__ 方法配置它：

```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [MongooseModule.forRoot('mongodb://localhost/nest')],
})
export class AppModule {}

```

这将初始化内存缓存的默认设置，允许您立即开始缓存数据。

#### 与缓存存储交互

要与缓存管理器实例交互，请使用 __INLINE_CODE_30__ 令牌将其注入到您的类中，如下所示：

```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CatDocument = HydratedDocument<Cat>;

@Schema()
export class Cat {
  @Prop()
  name: string;

  @Prop()
  age: number;

  @Prop()
  breed: string;
}

export const CatSchema = SchemaFactory.createForClass(Cat);

```

> info **提示** __INLINE_CODE_31__ 类和 __INLINE_CODE_32__ 令牌来自 __INLINE_CODE_33__ 包。

__INLINE_CODE_34__ 方法在 __INLINE_CODE_35__ 实例（来自 __INLINE_CODE_36__ 包）中用于检索缓存项。如果缓存项不存在，__INLINE_CODE_37__ 将被返回。

```typescript
@Prop([String])
tags: string[];

```

要将项添加到缓存中，请使用 __INLINE_CODE_38__ 方法：

```typescript
@Prop({ required: true })
name: string;

```

> warning **注意** 内存缓存存储只能存储__LINK_106__支持的值类型。

您可以手动指定该键的TTL（毫秒）如下所示：

```typescript
import * as mongoose from 'mongoose';
import { Owner } from '../owners/schemas/owner.schema';

// inside the class definition
@Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Owner' })
owner: Owner;

```

其中 __INLINE_CODE_39__ 是TTL在毫秒中的值 - 在这种情况下，缓存项将在1秒后过期。

要禁用缓存的过期，请设置 `@nestjs/mongoose` 配置属性为 `MongooseModule`：

```typescript
@Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Owner' }] })
owners: Owner[];

```

要从缓存中删除项，请使用 `AppModule` 方法：

```typescript
@Prop({ type: { type: mongoose.Schema.Types.ObjectId, ref: 'Owner' } })
// This ensures the field is not confused with a populated reference
owner: mongoose.Types.ObjectId;

```

要清除整个缓存，请使用 `forRoot()` 方法：

```typescript
import { Owner } from './schemas/owner.schema';

// e.g. inside a service or repository
async findAllPopulated() {
  return this.catModel.find().populate<{ owner: Owner }>("owner");
}

```

#### 自动缓存响应

> warning **注意** 在 __LINK_107__ 应用程序中，拦截器将单独执行每个字段解析器。因此，`mongoose.connect()`（使用拦截器来缓存响应）将不起作用。

要启用自动缓存响应，请将 `CatSchema` 绑定到您想要缓存数据的位置。

```typescript
@Prop(raw({
  firstName: { type: String },
  lastName: { type: String }
}))
details: Record<string, any>;

```

> warning **注意** 只有 `DefinitionsFactory` 端口缓存数据。同时，HTTP 服务器路由，inject native response object（`nestjs/mongoose`）不能使用缓存拦截器。请查看
> __HTML_TAG_103__response mapping__HTML_TAG_104__ 获取更多信息。

要减少 boilerplate 代码，可以将 `@Schema()` 绑定到所有端口：

```typescript
export const CatSchema = new mongoose.Schema({
  name: String,
  age: Number,
  breed: String,
});

```

#### 有效期（TTL）

`Cat` 的默认值为 `cats`，即缓存永不过期。要指定自定义 __LINK_108__，可以在 `new mongoose.Schema(_, options)` 方法中提供 `mongoose.Schema` 选项，例如以下所示：

```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';
import { Cat, CatSchema } from './schemas/cat.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Cat.name, schema: CatSchema }])],
  controllers: [CatsController],
  providers: [CatsService],
})
export class CatsModule {}

```

#### 使用模块全局

当您想在其他模块中使用 `@Prop()` 时，您需要导入它（与任何Nest模块一样）。或者，可以将其声明为 __LINK_109__，设置选项对象的 `name` 属性为 `age`，如下所示。在这种情况下，您不需要在其他模块中导入 `breed` 一旦它在根模块（例如 `@Prop()`）中被加载。

```typescript
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cat } from './schemas/cat.schema';
import { CreateCatDto } from './dto/create-cat.dto';

@Injectable()
export class CatsService {
  constructor(@InjectModel(Cat.name) private catModel: Model<Cat>) {}

  async create(createCatDto: CreateCatDto): Promise<Cat> {
    const createdCat = new this.catModel(createCatDto);
    return createdCat.save();
  }

  async findAll(): Promise<Cat[]> {
    return this.catModel.find().exec();
  }
}

@Injectable()
@Dependencies(getModelToken(Cat.name))
export class CatsService {
  constructor(catModel) {
    this.catModel = catModel;
  }

  async create(createCatDto) {
    const createdCat = new this.catModel(createCatDto);
    return createdCat.save();
  }

  async findAll() {
    return this.catModel.find().exec();
  }
}

```

#### 全局缓存覆盖

在启用全局缓存时，缓存项将存储在一个由路由路径自动生成的 `@Prop()` 下。您可以在 per-method 基础上覆盖某些缓存设置（`Cat` 和 `Owner`），允许自定义缓存策略。对于使用 __LINK_110__ 的情况，这可能是最有用的。

您可以在 controller 层应用 `owners` 装饰器来设置整个 controller 的缓存 TTL。对于在 controller 层和 method 层都定义了缓存 TTL 设置的情况，method 层的缓存 TTL 设置将优先于 controller 层的设置。

```typescript
import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class CatsService {
  constructor(@InjectConnection() private connection: Connection) {}
}

```

> info **提示** `mongoose.Types.ObjectId` 和 `Owner | null` 装饰器来自 `Owner` 包。Here is the translation of the English technical documentation to Chinese:

#### WebSocket和微服务

可以使用 `raw()` 装饰器来 WebSocket 订阅器和微服务模式（无论使用哪种传输方法）。

```typescript
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class CatsService {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  async startTransaction() {
    const session = await this.connection.startSession();
    session.startTransaction();
    // Your transaction logic here
  }
}

```

然而，需要在使用 WebSocket 订阅器或微服务模式时添加 `CatsModule` 装饰器，以便指定用于后续存储和检索缓存数据的关键。请注意，不应缓存所有内容。执行某些商业操作的动作，而不是简单地查询数据，永远 shouldn't 缓存。

此外，您可以使用 `MongooseModule` 装饰器来指定缓存过期时间（TTL），以 Override 全局默认 TTL 值.

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

> 信息 **提示** `forFeature()` 装饰器可以单独使用或与 `exports` 装饰器结合使用.

#### 调整跟踪

默认情况下，Nest 使用请求 URL（在 HTTP 应用程序中）或缓存 key（在 WebSocket 和微服务应用程序中，通过 `CatsModule` 装饰器设置）来关联缓存记录与您的端点。然而，有时您可能想根据不同的因素设置跟踪，例如使用 HTTP 头（例如 `CatsModule` 来正确标识 `Cat` 端点）。

要实现该功能，创建 `CatsService` 的子类并重写 `@InjectModel()` 方法.

```typescript
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Cat.name, schema: CatSchema }], 'cats'),
  ],
})
export class CatsModule {}

```

#### 使用备用缓存存储

切换到不同的缓存存储是简单的。首先，安装适当的包。例如，要使用 Redis，安装 `@InjectConnection()` 包:

```typescript
import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class CatsService {
  constructor(@InjectConnection('cats') private connection: Connection) {}
}

```

现在，您可以使用多个存储注册 `@InjectConnection`，如下所示:

```typescript
{
  provide: CatsService,
  useFactory: (catsConnection: Connection) => {
    return new CatsService(catsConnection);
  },
  inject: [getConnectionToken('cats')],
}

```

在这个示例中，我们注册了两个存储：`mongoose.startSession()` 和 `@InjectConnection()`。`connection.startSession()` 存储是一个简单的内存存储，而 `MongooseModule.forFeature()` 是 Redis 存储。`Connection` 数组用于指定您想要使用的存储。第一个存储在数组中是默认存储，其他存储是备用存储。

查看 __LINK_112__以获取更多关于可用的存储的信息.

#### 异步配置

您可能想异步地传递模块选项，而不是在编译时静态地传递它们。在这种情况下，使用 `Connection` 方法，它提供了多种方式来处理异步配置。

一种方法是使用工厂函数:

```typescript
@Injectable()
export class CatsService {
  constructor(@InjectModel(Cat.name, 'cats') private catModel: Model<Cat>) {}
}

```

我们的工厂行为与所有其他异步模块工厂相同（可以 `getConnectionToken()` 并且可以注入依赖项通过 `@InjectModel()`）.

```typescript
@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Cat.name,
        useFactory: () => {
          const schema = CatsSchema;
          schema.pre('save', function () {
            console.log('Hello from pre save');
          });
          return schema;
        },
      },
    ]),
  ],
})
export class AppModule {}

```

Alternatively, you can use the `pre()` method:

```typescript
@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Cat.name,
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => {
          const schema = CatsSchema;
          schema.pre('save', function() {
            console.log(
              `${configService.get('APP_NAME')}: Hello from pre save`,
            ),
          });
          return schema;
        },
        inject: [ConfigService],
      },
    ]),
  ],
})
export class AppModule {}

```

上面的构造将在 `post()` 内实例化 `forFeatureAsync()` 并使用它来获取选项对象。`MongooseModule` 必须实现 `useFactory` 接口，以便提供配置选项:

```typescript
@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Cat.name,
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

如果您想使用来自其他模块的现有配置提供者，使用 `pre()` 语法:

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

这与 `post()` 一样，但有一個关键的区别 - `async` 将 lookup 已经创建的 `inject`，而不是实例化自己的.

> 信息 **提示** `forFeatureAsync()`、`.plugin()` 和 `Connection` 可以使用可选的泛型（类型参数）来限定存储特定配置选项，实现类型安全.

您也可以将所谓的 `connectionFactory` 传递给 `__t` 方法。这些提供者将与模块提供者合并.

```typescript
@Schema({ discriminatorKey: 'kind' })
export class Event {
  @Prop({
    type: String,
    required: true,
    enum: [ClickedLinkEvent.name, SignUpEvent.name],
  })
  kind: string;

  @Prop({ type: Date, required: true })
  time: Date;
}

export const EventSchema = SchemaFactory.createForClass(Event);

```

这对您有用时，您想为工厂函数或类构造函数提供额外的依赖项.

#### 示例

可用的工作示例在 __LINK_113__中。