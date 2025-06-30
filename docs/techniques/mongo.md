### Mongo

Nest 提供了两种与 [MongoDB](https://www.mongodb.com/) 数据库集成的方法。您可以使用内置的 [TypeORM](https://github.com/typeorm/typeorm) 模块（其描述见[此处](/techniques/database) ），该模块包含 MongoDB 连接器；或者使用最流行的 MongoDB 对象建模工具 [Mongoose](https://mongoosejs.com)。本章我们将介绍后者，使用专用的 `@nestjs/mongoose` 包。

首先安装 [所需依赖项](https://github.com/Automattic/mongoose) ：

```bash
$ npm i @nestjs/mongoose mongoose
```

安装完成后，我们可以将 `MongooseModule` 导入根模块 `AppModule`。

```typescript title="app.module"
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [MongooseModule.forRoot('mongodb://localhost/nest')],
})
export class AppModule {}
```

`forRoot()` 方法接收与 Mongoose 包中 `mongoose.connect()` 相同的配置对象，具体描述见[此处](https://mongoosejs.com/docs/connections.html) 。

#### 模型注入

在 Mongoose 中，所有内容都源自 [Schema](http://mongoosejs.com/docs/guide.html)。每个模式映射到一个 MongoDB 集合，并定义该集合中文档的结构。模式用于定义 [Models](https://mongoosejs.com/docs/models.html)。模型负责从底层 MongoDB 数据库创建和读取文档。

模式可以通过 NestJS 装饰器创建，也可以直接使用 Mongoose 手动创建。使用装饰器创建模式能显著减少样板代码并提高整体代码可读性。

我们来定义 `CatSchema`：

```typescript title="schemas/cat.schema"
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

> info **提示** 请注意，你也可以使用 `DefinitionsFactory` 类（来自 `nestjs/mongoose`）生成原始模式定义。这允许你手动修改基于所提供元数据生成的模式定义。对于某些难以完全用装饰器表示的边缘情况，这非常有用。

`@Schema()` 装饰器将一个类标记为模式定义。它将我们的 `Cat` 类映射到同名的 MongoDB 集合，但末尾会添加一个"s"——因此最终的 Mongo 集合名称将是 `cats`。该装饰器接受一个可选参数，即模式选项对象。可以将其视为通常作为 `mongoose.Schema` 类构造函数的第二个参数传递的对象（例如 `new mongoose.Schema(_, options)` ）。要了解有关可用模式选项的更多信息，请参阅[本章](https://mongoosejs.com/docs/guide.html#options) 。

`@Prop()` 装饰器用于在文档中定义属性。例如在上述模式定义中，我们定义了三个属性：`name`、`age` 和 `breed`。得益于 TypeScript 的元数据（和反射）能力，这些属性的[模式类型](https://mongoosejs.com/docs/schematypes.html)会被自动推断。但在更复杂的场景中（例如数组或嵌套对象结构），当类型无法被隐式反射时，就必须显式指明类型，如下所示：

```typescript
@Prop([String])
tags: string[];
```

或者，`@Prop()` 装饰器也可以接受一个选项对象参数（ [了解更多](https://mongoosejs.com/docs/schematypes.html#schematype-options)可用选项）。通过这种方式，您可以指定属性是否为必需项、设置默认值或将其标记为不可变。例如：

```typescript
@Prop({ required: true })
name: string;
```

如果您需要指定与另一个模型的关联关系以便后续填充，同样可以使用 `@Prop()` 装饰器。例如，若 `Cat` 有一个存储在名为 `owners` 的不同集合中的 `Owner`，则该属性应包含类型和引用。例如：

```typescript
import * as mongoose from 'mongoose';
import { Owner } from '../owners/schemas/owner.schema';

// inside the class definition
@Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Owner' })
owner: Owner;
```

若存在多个所有者，您的属性配置应如下所示：

```typescript
@Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Owner' }] })
owners: Owner[];
```

如果您不打算总是填充对另一个集合的引用，考虑使用 `mongoose.Types.ObjectId` 作为类型替代：

```typescript
@Prop({ type: { type: mongoose.Schema.Types.ObjectId, ref: 'Owner' } })
// This ensures the field is not confused with a populated reference
owner: mongoose.Types.ObjectId;
```

之后，当需要选择性填充时，您可以使用指定了正确类型的存储库函数：

```typescript
import { Owner } from './schemas/owner.schema';

// e.g. inside a service or repository
async findAllPopulated() {
  return this.catModel.find().populate<{ owner: Owner }>("owner");
}
```

> info **提示** 若无外联文档可供填充，类型可能是 `Owner | null`，具体取决于您的 [Mongoose 配置](https://mongoosejs.com/docs/populate.html#doc-not-found) 。或者，它可能会抛出错误，此时类型将为 `Owner`。

最后，也可以将**原始**模式定义传递给装饰器。这在某些场景下非常有用，例如当某个属性表示一个未定义为类的嵌套对象时。为此，请使用 `@nestjs/mongoose` 包中的 `raw()` 函数，如下所示：

```typescript
@Prop(raw({
  firstName: { type: String },
  lastName: { type: String }
}))
details: Record<string, any>;
```

或者，如果您更倾向于**不使用装饰器** ，也可以手动定义模式。例如：

```typescript
export const CatSchema = new mongoose.Schema({
  name: String,
  age: Number,
  breed: String,
});
```

`cat.schema` 文件位于 `cats` 目录下的一个文件夹中，我们同时在此定义了 `CatsModule`。虽然您可以将模式文件存储在任何位置，但我们建议将其存放在相关**领域**对象附近的适当模块目录中。

让我们看看 `CatsModule`：

```typescript title="cats.module"
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

`MongooseModule` 提供了 `forFeature()` 方法来配置模块，包括定义哪些模型应在当前作用域中注册。如果还想在其他模块中使用这些模型，请将 MongooseModule 添加到 `CatsModule` 的 `exports` 部分，并在其他模块中导入 `CatsModule`。

注册完模式后，就可以使用 `@InjectModel()` 装饰器将 `Cat` 模型注入到 `CatsService` 中：

```typescript title="cats.service"
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
```

#### 连接

有时可能需要访问原生的 [Mongoose Connection](https://mongoosejs.com/docs/api.html#Connection) 对象。例如，可能想在连接对象上调用原生 API。可以通过如下方式使用 `@InjectConnection()` 装饰器注入 Mongoose 连接：

```typescript
import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class CatsService {
  constructor(@InjectConnection() private connection: Connection) {}
}
```

#### 会话

建议使用 `@InjectConnection` 注入数据库连接来启动 Mongoose 会话，而非直接调用 `mongoose.startSession()`。这种方式能更好地与 NestJS 依赖注入系统集成，确保连接管理的正确性。

以下是启动会话的示例：

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

本示例中，`@InjectConnection()` 用于将 Mongoose 连接注入服务。注入连接后，即可通过 `connection.startSession()` 启动新会话。该会话可用于管理数据库事务，确保跨多个查询的原子操作。启动会话后，请根据业务逻辑提交或中止事务。

#### 多数据库

某些项目需要连接多个数据库。使用本模块同样可以实现这一需求。要使用多个连接，首先需要创建这些连接。在这种情况下， **必须**为连接命名。

```typescript title="app.module"
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

> warning **注意** 请勿创建多个未命名或同名的连接，否则它们会被覆盖。

在此配置下，您需要告知 `MongooseModule.forFeature()` 函数应使用哪个连接。

```typescript
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Cat.name, schema: CatSchema }], 'cats'),
  ],
})
export class CatsModule {}
```

你也可以为指定连接注入 `Connection`：

```typescript
import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class CatsService {
  constructor(@InjectConnection('cats') private connection: Connection) {}
}
```

要将指定的 `Connection` 注入到自定义提供者（例如工厂提供者），可使用 `getConnectionToken()` 函数并以连接名称作为参数传入。

```typescript
{
  provide: CatsService,
  useFactory: (catsConnection: Connection) => {
    return new CatsService(catsConnection);
  },
  inject: [getConnectionToken('cats')],
}
```

如果仅需从命名数据库注入模型，可将连接名称作为 `@InjectModel()` 装饰器的第二个参数使用。

```typescript title="cats.service"
@Injectable()
export class CatsService {
  constructor(@InjectModel(Cat.name, 'cats') private catModel: Model<Cat>) {}
}
```

#### 钩子（中间件）

中间件（也称为前置和后置钩子）是在异步函数执行期间传递控制权的函数。中间件在模式层级指定，适用于编写插件（ [来源](https://mongoosejs.com/docs/middleware.html) ）。在 Mongoose 中编译模型后调用 `pre()` 或 `post()` 无效。要在模型注册**之前**注册钩子，需使用 `MongooseModule` 的 `forFeatureAsync()` 方法配合工厂提供者（即 `useFactory`）。通过该技术可访问模式对象，然后使用 `pre()` 或 `post()` 方法在该模式上注册钩子。示例如下：

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

与其他[工厂提供者](https://docs.nestjs.com/fundamentals/custom-providers#factory-providers-usefactory)类似，我们的工厂函数可以是 `async` 异步的，并能通过 `inject` 注入依赖项。

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

#### 插件

要为指定模式注册[插件](https://mongoosejs.com/docs/plugins.html) ，请使用 `forFeatureAsync()` 方法。

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

要一次性为所有模式注册插件，请调用 `Connection` 对象的 `.plugin()` 方法。您应在创建模型前访问连接，为此可使用 `connectionFactory`：

```typescript title="app.module"
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

#### 鉴别器

[鉴别器](https://mongoosejs.com/docs/discriminators.html)是一种模式继承机制。它允许您在同一个 MongoDB 集合上建立具有重叠模式的多个模型。

假设您需要在单个集合中追踪不同类型的事件。每个事件都将包含时间戳。

```typescript title="event.schema"
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

> info **提示** Mongoose 通过"鉴别键"来区分不同的鉴别器模型，默认情况下该键为 `__t`。Mongoose 会在您的模式中添加一个名为 `__t` 的字符串路径，用于跟踪该文档属于哪个鉴别器的实例。您也可以使用 `discriminatorKey` 选项来定义鉴别路径。

`SignedUpEvent` 和 `ClickedLinkEvent` 实例将与通用事件存储在同一集合中。

现在，我们来定义 `ClickedLinkEvent` 类，如下所示：

```typescript title="click-link-event.schema"
@Schema()
export class ClickedLinkEvent {
  kind: string;
  time: Date;

  @Prop({ type: String, required: true })
  url: string;
}

export const ClickedLinkEventSchema = SchemaFactory.createForClass(ClickedLinkEvent);
```

以及 `SignUpEvent` 类：

```typescript title="sign-up-event.schema"
@Schema()
export class SignUpEvent {
  kind: string;
  time: Date;

  @Prop({ type: String, required: true })
  user: string;
}

export const SignUpEventSchema = SchemaFactory.createForClass(SignUpEvent);
```

配置完成后，使用 `discriminators` 选项为指定模式注册鉴别器。该选项同时适用于 `MongooseModule.forFeature` 和 `MongooseModule.forFeatureAsync` ：

```typescript title="event.module"
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Event.name,
        schema: EventSchema,
        discriminators: [
          { name: ClickedLinkEvent.name, schema: ClickedLinkEventSchema },
          { name: SignUpEvent.name, schema: SignUpEventSchema },
        ],
      },
    ]),
  ]
})
export class EventsModule {}
```

#### 测试

在进行应用程序单元测试时，我们通常希望避免任何数据库连接，从而使测试套件更易于设置且执行更快。但我们的类可能依赖于从连接实例获取的模型。如何解析这些类？解决方案是创建模拟模型。

为简化此过程，`@nestjs/mongoose` 包提供了 `getModelToken()` 函数，该函数会基于模型名称返回预制的[注入令牌](https://docs.nestjs.com/fundamentals/custom-providers#di-fundamentals) 。使用此令牌，您可以通过标准[自定义提供者](/fundamentals/custom-providers)技术（包括 `useClass`、`useValue` 和 `useFactory`）轻松提供模拟实现。例如：

```typescript
@Module({
  providers: [
    CatsService,
    {
      provide: getModelToken(Cat.name),
      useValue: catModel,
    },
  ],
})
export class CatsModule {}
```

本示例中，当任何消费者使用 `@InjectModel()` 装饰器注入 `Model<Cat>` 时，将始终提供硬编码的 `catModel`（对象实例）。

#### 异步配置

当需要异步传递模块选项而非静态传递时，请使用 `forRootAsync()` 方法。与大多数动态模块一样，Nest 提供了多种处理异步配置的技术。

其中一种技术是使用工厂函数：

```typescript
MongooseModule.forRootAsync({
  useFactory: () => ({
    uri: 'mongodb://localhost/nest',
  }),
});
```

与其他[工厂提供者](https://docs.nestjs.com/fundamentals/custom-providers#factory-providers-usefactory)类似，我们的工厂函数可以是 `async` 异步的，并能通过 `inject` 注入依赖项。

```typescript
MongooseModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => ({
    uri: configService.get<string>('MONGODB_URI'),
  }),
  inject: [ConfigService],
});
```

或者，您也可以使用类而非工厂来配置 `MongooseModule`，如下所示：

```typescript
MongooseModule.forRootAsync({
  useClass: MongooseConfigService,
});
```

上述结构在 `MongooseModule` 内部实例化 `MongooseConfigService`，用它来创建所需的配置对象。请注意，此例中的 `MongooseConfigService` 必须实现 `MongooseOptionsFactory` 接口，如下所示。`MongooseModule` 会在提供的类实例上调用 `createMongooseOptions()` 方法。

```typescript
@Injectable()
export class MongooseConfigService implements MongooseOptionsFactory {
  createMongooseOptions(): MongooseModuleOptions {
    return {
      uri: 'mongodb://localhost/nest',
    };
  }
}
```

若想复用现有的配置提供者而非在 `MongooseModule` 内创建私有副本，请使用 `useExisting` 语法。

```typescript
MongooseModule.forRootAsync({
  imports: [ConfigModule],
  useExisting: ConfigService,
});
```

#### 连接事件

您可以通过使用 `onConnectionCreate` 配置选项来监听 Mongoose 的[连接事件](https://mongoosejs.com/docs/connections.html#connection-events) 。这使您能够在建立连接时实现自定义逻辑。例如，您可以注册以下事件监听器：`connected`、`open`、`disconnected`、`reconnected` 和 `disconnecting` 事件，如下所示：

```typescript
MongooseModule.forRoot('mongodb://localhost/test', {
  onConnectionCreate: (connection: Connection) => {
    connection.on('connected', () => console.log('connected'));
    connection.on('open', () => console.log('open'));
    connection.on('disconnected', () => console.log('disconnected'));
    connection.on('reconnected', () => console.log('reconnected'));
    connection.on('disconnecting', () => console.log('disconnecting'));

    return connection;
  },
}),
```

在此代码片段中，我们正在建立与 MongoDB 数据库的连接，地址为 `mongodb://localhost/test`。`onConnectionCreate` 选项允许您设置特定的事件监听器来监控连接状态：

- `connected`：当连接成功建立时触发。
- `open`：当连接完全打开并准备好进行操作时触发。
- `disconnected`：当连接丢失时调用。
- `reconnected`：在断开连接后重新建立连接时调用。
- `disconnecting`：当连接正在关闭过程中时发生。

您还可以将 `onConnectionCreate` 属性集成到使用 `MongooseModule.forRootAsync()` 创建的异步配置中：

```typescript
MongooseModule.forRootAsync({
  useFactory: () => ({
    uri: 'mongodb://localhost/test',
    onConnectionCreate: (connection: Connection) => {
      // Register event listeners here
      return connection;
    },
  }),
}),
```

这提供了一种灵活的方式来管理连接事件，使您能够有效处理连接状态的变化。

#### 子文档

要在父文档中嵌套子文档，您可以按如下方式定义模式：

```typescript title="name.schema"
@Schema()
export class Name {
  @Prop()
  firstName: string;

  @Prop()
  lastName: string;
}

export const NameSchema = SchemaFactory.createForClass(Name);
```

然后在父模式中引用子文档：

```typescript title="person.schema"
@Schema()
export class Person {
  @Prop(NameSchema)
  name: Name;
}

export const PersonSchema = SchemaFactory.createForClass(Person);

export type PersonDocumentOverride = {
  name: Types.Subdocument<Types.ObjectId> & Name;
};

export type PersonDocument = HydratedDocument<Person, PersonDocumentOverride>;
```

如果需要包含多个子文档，可以使用子文档数组。重要的是要相应地覆盖属性的类型：

```typescript title="name.schema"
@Schema()
export class Person {
  @Prop([NameSchema])
  name: Name[];
}

export const PersonSchema = SchemaFactory.createForClass(Person);

export type PersonDocumentOverride = {
  name: Types.DocumentArray<Name>;
};

export type PersonDocument = HydratedDocument<Person, PersonDocumentOverride>;
```

#### 虚拟字段

在 Mongoose 中， **虚拟字段**是存在于文档上但不会持久化到 MongoDB 中的属性。它不存储在数据库中，而是在每次访问时动态计算。虚拟字段通常用于派生或计算值，例如组合字段（如通过拼接 `firstName` 和 `lastName` 创建 `fullName` 属性），或创建依赖于文档中现有数据的属性。

```ts
class Person {
  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Virtual({
    get: function (this: Person) {
      return `${this.firstName} ${this.lastName}`;
    },
  })
  fullName: string;
}
```

> info **提示** `@Virtual()` 装饰器是从 `@nestjs/mongoose` 包中导入的。

在此示例中，`fullName` 虚拟属性由 `firstName` 和 `lastName` 派生而来。虽然访问时表现得像普通属性，但它永远不会被保存到 MongoDB 文档中。

#### 示例

一个可用的示例[在此处](https://github.com/nestjs/nest/tree/master/sample/06-mongoose)查看。
