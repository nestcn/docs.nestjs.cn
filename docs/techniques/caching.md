<!-- 此文件从 content/techniques/caching.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T04:50:15.464Z -->
<!-- 源文件: content/techniques/caching.md -->

### 缓存

缓存是一种强有力的、直接的技术，以提高应用程序的性能。作为临时存储层，它允许快速访问频繁使用的数据，减少了重复地获取或计算相同信息的需求。这将导致更快的响应时间和整体效率的提高。

#### 安装

要在 Nest 中启用缓存，您需要安装 __INLINE_CODE_25__ 包及其 __INLINE_CODE_26__ 包。

```bash
$ npm i @nestjs/mongoose mongoose

```

默认情况下，所有内容都存储在内存中；由于 __INLINE_CODE_27__ 使用 __LINK_105__ 底层，您可以轻松地切换到更高级的存储解决方案，如 Redis，通过安装相应的包。我们将在后续详细介绍。

#### 内存缓存

要在应用程序中启用缓存，请导入 __INLINE_CODE_28__ 并使用 __INLINE_CODE_29__ 方法进行配置：

```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [MongooseModule.forRoot('mongodb://localhost/nest')],
})
export class AppModule {}

```

这将初始化内存缓存，以便您可以立即开始缓存数据。

#### 与缓存存储交互

要与缓存管理器实例交互，请将其注入到您的类中，使用 __INLINE_CODE_30__ 令牌，例如：

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

__INLINE_CODE_34__ 方法在 __INLINE_CODE_35__ 实例（来自 __INLINE_CODE_36__ 包）中使用来检索缓存项。如果缓存项不存在，__INLINE_CODE_37__ 将返回。

```typescript
@Prop([String])
tags: string[];

```

要将项添加到缓存中，使用 __INLINE_CODE_38__ 方法：

```typescript
@Prop({ required: true })
name: string;

```

> warning **注意** 内存缓存存储只能存储 __LINK_106__ 支持的值类型。

您可以手动指定该特定键的 TTL（毫秒），如下所示：

```typescript
import * as mongoose from 'mongoose';
import { Owner } from '../owners/schemas/owner.schema';

// inside the class definition
@Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Owner' })
owner: Owner;

```

其中 __INLINE_CODE_39__ 是 TTL 在毫秒内 - 在这个情况下，缓存项将在一秒后过期。

要禁用缓存的过期，请将 `@nestjs/mongoose` 配置属性设置为 `MongooseModule`：

```typescript
@Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Owner' }] })
owners: Owner[];

```

要从缓存中移除项，请使用 `AppModule` 方法：

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

> warning **警告** 在 __LINK_107__ 应用程序中，拦截器将单独执行每个字段解析器。因此，`mongoose.connect()`（使用拦截器来缓存响应）将无法正常工作。

要启用自动缓存响应，请将 `CatSchema` 关联到您想要缓存数据的位置。

```typescript
@Prop(raw({
  firstName: { type: String },
  lastName: { type: String }
}))
details: Record<string, any>;

```

> warning **警告** 只有 `DefinitionsFactory` endpoints 会被缓存。同时，HTTP 服务器路由，如果注入了原生响应对象（`nestjs/mongoose`），无法使用 Cache 拦截器。请查看
> __HTML_TAG_103__ 响应映射__HTML_TAG_104__ 获取更多信息。

要减少 Boilerplate 需要，您可以将 `@Schema()` 绑定到所有 endpoints 全球：

```typescript
export const CatSchema = new mongoose.Schema({
  name: String,
  age: Number,
  breed: String,
});

```

#### 有效期（TTL）

`Cat` 的默认值为 `cats`，这意味着缓存将永不过期。要指定自定义 __LINK_108__，您可以在 `new mongoose.Schema(_, options)` 方法中提供 `mongoose.Schema` 选项，例如：

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

当您想在其他模块中使用 `@Prop()` 时，您需要导入它（与任何 Nest 模块一样）。或者，您可以将其声明为 __LINK_109__，将 options 对象的 `name` 属性设置为 `age`，如下所示。在这种情况下，您不需要在其他模块中导入 `breed`，因为它已经在根模块中加载（例如 `@Prop()`）。

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

#### 全局缓存override

在启用全局缓存时，缓存项将存储在自动生成的 `@Prop()` 路径下。您可以在 per-method 基础上override Certain cache 设置（`Cat` 和 `Owner`），从而实现个体化的缓存策略。这个可能在使用 __LINK_110__ 时最为相关。

您可以在控制器基础上应用 `owners` 装饰器，以设置控制器的缓存 TTL。在情况下，既定的控制器级别和方法级别缓存 TTL 设置都存在时，方法级别的缓存 TTL 设置将优先于控制器级别的设置。

```typescript
import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class CatsService {
  constructor(@InjectConnection() private connection: Connection) {}
}

```

> info **提示** `mongoose.Types.ObjectId` 和 `Owner | null` 装饰器来自 `Owner` 包。Here is the translated text from English to Chinese:

#### WebSocket 与微服务

可以将 `raw()` 装饰器应用于 WebSocket 订阅者和 Microservice 模式（无论使用哪种传输方法）。

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

然而，需要使用 `CatsModule` 装饰器来指定用于后续存储和检索缓存数据的键。请注意，你**不应该缓存一切**。执行业务操作而不是简单地查询数据的动作应该永远不被缓存。

此外，您可以使用 `MongooseModule` 装饰器指定缓存过期时间（TTL），这将覆盖全局默认 TTL 值。

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

> 信息 **提示** `forFeature()` 装饰器可以单独使用，也可以与对应的 `exports` 装饰器一起使用。

#### 调整跟踪

默认情况下，Nest 使用请求 URL（在 HTTP 应用程序中）或缓存键（在 WebSocket 和 Microservice 应用程序中，通过 `CatsModule` 装饰器设置）将缓存记录关联到您的端点。然而，有时候您可能想根据不同的因素设置跟踪，例如使用 HTTP 头（例如 `CatsModule` 来正确标识 `Cat` 端点）。

要实现这一点，请创建 `CatsService` 的子类并重写 `@InjectModel()` 方法。

```typescript
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Cat.name, schema: CatSchema }], 'cats'),
  ],
})
export class CatsModule {}

```

#### 使用备用缓存存储

切换到不同的缓存存储是简单的。首先，安装适当的包。例如，要使用 Redis，安装 `@InjectConnection()` 包：

```typescript
import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class CatsService {
  constructor(@InjectConnection('cats') private connection: Connection) {}
}

```

在这种情况下，您可以使用多个存储注册 `@InjectConnection`，如下所示：

```typescript
{
  provide: CatsService,
  useFactory: (catsConnection: Connection) => {
    return new CatsService(catsConnection);
  },
  inject: [getConnectionToken('cats')],
}

```

在这个示例中，我们注册了两个存储：`mongoose.startSession()` 和 `@InjectConnection()`。`connection.startSession()` 存储是一个简单的内存存储，而 `MongooseModule.forFeature()` 是 Redis 存储。`Connection` 数组用于指定您想要使用的存储。第一个存储在数组中是默认存储，剩余的存储是备用存储。

查看 __LINK_112__ 以获取更多关于可用存储的信息。

#### 异步配置

您可能想异步传递模块选项，而不是在编译时静态传递它们。在这种情况下，使用 `Connection` 方法，该方法提供了多种方式来处理异步配置。

一种方法是使用工厂函数：

```typescript
@Injectable()
export class CatsService {
  constructor(@InjectModel(Cat.name, 'cats') private catModel: Model<Cat>) {}
}

```

我们的工厂行为与所有其他异步模块工厂相同（它可以被 `getConnectionToken()` 并能够注入依赖项通过 `@InjectModel()`）。

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

或者，您可以使用 `pre()` 方法：

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

上述构造将在 `post()` 中实例化 `forFeatureAsync()` 并使用它来获取选项对象。`MongooseModule` 需要实现 `useFactory` 接口以提供配置选项：

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

如果您想使用来自不同模块的现有配置提供商，使用 `pre()` 语法：

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

这与 `post()` 一样，但是有一些关键区别- `async` 将查找导入的模块以重用已经创建的 `inject`，而不是实例化自己的。

> 信息 **提示** `forFeatureAsync()`、`.plugin()` 和 `Connection` 可以使用可选的泛型（类型参数）来缩小存储特定的配置选项，使其类型安全。

您也可以将所谓的 `connectionFactory` 传递给 `__t` 方法。这些提供商将与模块提供商合并。

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

这对于要提供 additional 依赖项到工厂函数或类构造器非常有用。

#### 示例

有一个可用的示例 __LINK_113__。