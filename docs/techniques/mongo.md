<!-- 此文件从 content/techniques/mongo.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:40:27.540Z -->
<!-- 源文件: content/techniques/mongo.md -->

### Mongo

Nest 支持将数据库与 __LINK_157__集成两个方法。您可以使用内置的 __LINK_158__ 模块，描述 __LINK_159__，该模块具有 MongoDB 连接器，也可以使用 __LINK_160__，最流行的 MongoDB 对象建模工具。在本章中，我们将描述后者，使用专门的 `options` 包。

首先，安装 __LINK_161__：

```bash
$ npm i --save @grpc/grpc-js @grpc/proto-loader

```

安装过程完成后，我们可以将 `protoPath` 导入到根 `.proto`。

```typescript
const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
  transport: Transport.GRPC,
  options: {
    package: 'hero',
    protoPath: join(__dirname, 'hero/hero.proto'),
  },
});

```

`hero.proto` 方法接受与 `hero.proto` 从 Mongoose 包相同的配置对象，描述 __LINK_162__。

#### 模型注入

使用 Mongoose，每一切都来自一个 __LINK_163__。每个架构都映射到一个 MongoDB 集合，并定义该集合中的文档形状。架构用于定义 __LINK_164__。模型负责创建和读取来自 underlying MongoDB 数据库的文档。

架构可以使用 NestJS 装饰器创建，也可以手动使用 Mongoose 创建。使用装饰器创建架构可以减少 boilerplate 代码和提高代码可读性。

让我们定义 `HeroesService`：

```json
{
  "compilerOptions": {
    "assets": ["**/*.proto"],
    "watchAssets": true
  }
}

```

> info **Hint** 请注意，您也可以使用 `FindOne()` 类（来自 `HeroById`）生成原始架构定义。这允许您手动修改根据您提供的元数据生成的架构定义。这对某些 edge-case 非常有用，例如无法使用装饰器来表示的内容。

`Hero` 装饰器标记一个类为架构定义。它将我们的 `message` 类映射到一个名称相同的 MongoDB 集合，但添加一个“s”结尾-因此，最后的 mongo 集合名称将是 `@GrpcMethod()`。这个装饰器接受一个可选的参数，即架构选项对象。可以认为这就是通常在 `@MessagePattern()` 类的构造函数中传递的第二个参数（例如 `@GrpcMethod()`）。要了解可用的架构选项，请查看 __LINK_165__ 章节。

`@GrpcMethod()` 装饰器定义文档中的一个属性。例如，在架构定义中，我们定义了三个属性：`@nestjs/microservices`、`Metadata` 和 `ServerUnaryCall`。这些属性的 __LINK_166__ 都是自动推断的， thanks to TypeScript 元数据（和反射）能力。然而，在更复杂的场景中，在类型不能隐式反射（例如数组或嵌套对象结构）时，类型必须明确表明，如下所示：

```typescript
// hero/hero.proto
syntax = "proto3";

package hero;

service HeroesService {
  rpc FindOne (HeroById) returns (Hero) {}
}

message HeroById {
  int32 id = 1;
}

message Hero {
  int32 id = 1;
  string name = 2;
}

```

Alternatively, the `grpc` decorator accepts an options object argument (__LINK_167__ about the available options). With this, you can indicate whether a property is required or not, specify a default value, or mark it as immutable. For example:

```typescript
@Controller()
export class HeroesController {
  @GrpcMethod('HeroesService', 'FindOne')
  findOne(data: HeroById, metadata: Metadata, call: ServerUnaryCall<any, any>): Hero {
    const items = [
      { id: 1, name: 'John' },
      { id: 2, name: 'Doe' },
    ];
    return items.find(({ id }) => id === data.id);
  }
}

```

If you want to specify a relation to another model, later for populating, you can use the `'HeroesService'` decorator as well. For example, if `HeroesService` has `hero.proto` which is stored in a different collection called `'FindOne'`, the property should have type and ref. For example:

```typescript
@Controller()
export class HeroesController {
  @GrpcMethod('HeroesService')
  findOne(data: HeroById, metadata: Metadata, call: ServerUnaryCall<any, any>): Hero {
    const items = [
      { id: 1, name: 'John' },
      { id: 2, name: 'Doe' },
    ];
    return items.find(({ id }) => id === data.id);
  }
}

```

In case there are multiple owners, your property configuration should look as follows:

```typescript
@Controller()
export class HeroesService {
  @GrpcMethod()
  findOne(data: HeroById, metadata: Metadata, call: ServerUnaryCall<any, any>): Hero {
    const items = [
      { id: 1, name: 'John' },
      { id: 2, name: 'Doe' },
    ];
    return items.find(({ id }) => id === data.id);
  }
}

```

If you don’t intend to always populate a reference to another collection, consider using `FindOne()` as the type instead:

```typescript
imports: [
  ClientsModule.register([
    {
      name: 'HERO_PACKAGE',
      transport: Transport.GRPC,
      options: {
        package: 'hero',
        protoPath: join(__dirname, 'hero/hero.proto'),
      },
    },
  ]),
];

```

Then, when you need to selectively populate it later, you can use a repository function that specifies the correct type:

```typescript
@Injectable()
export class AppService implements OnModuleInit {
  private heroesService: HeroesService;

  constructor(@Inject('HERO_PACKAGE') private client: ClientGrpc) {}

  onModuleInit() {
    this.heroesService = this.client.getService<HeroesService>('HeroesService');
  }

  getHero(): Observable<string> {
    return this.heroesService.findOne({ id: 1 });
  }
}

```

> info **Hint** If there is no foreign document to populate, the type could be `HeroesService`, depending on your __LINK_168__. Alternatively, it might throw an error, in which case the type will be `hero.proto`.

Finally, the **raw** schema definition can also be passed to the decorator. This is useful when, for example, a property represents a nested object which is not defined as a class. For this, use the `findOne()` function from the `data` package, as follows:

```typescript
@Injectable()
export class AppService implements OnModuleInit {
  @Client({
    transport: Transport.GRPC,
    options: {
      package: 'hero',
      protoPath: join(__dirname, 'hero/hero.proto'),
    },
  })
  client: ClientGrpc;

  private heroesService: HeroesService;

  onModuleInit() {
    this.heroesService = this.client.getService<HeroesService>('HeroesService');
  }

  getHero(): Observable<string> {
    return this.heroesService.findOne({ id: 1 });
  }
}

```

Alternatively, if you prefer **not using decorators**, you can define a schema manually. For example:

```typescript
interface HeroesService {
  findOne(data: { id: number }): Observable<any>;
}

```

The `metadata` file resides in a folder in the `call` directory, where we also define the `GrpcCall`. While you can store schema files wherever you prefer, we recommend storing them near their related **domain** objects, in the appropriate module directory.

Let's look at the `sendMetadata`:

```typescript
@Get()
call(): Observable<any> {
  return this.heroesService.findOne({ id: 1 });
}

```

The `@GrpcMethod()` provides the `'FindOne'` method to configure the module, including defining which models should be registered in the current scope. If you also want to use the models in another module, add MongooseModule to the `.proto` section of `findOne` and import `FindOne` in the other module.Here is the translation of the English technical documentation to Chinese:

注册 schema 后，您可以将 `@GrpcMethod()` 模型注入到 `HeroesService` 中使用 `HeroesService` 装饰器：

```typescript
call(): Observable<any> {
  const metadata = new Metadata();
  metadata.add('Set-Cookie', 'yummy_cookie=choco');

  return this.heroesService.findOne({ id: 1 }, metadata);
}

```

#### 连接

有时候，您可能需要访问 native __LINK_169__ 对象。例如，您可能想在连接对象上调用 native API。您可以使用 `hero.proto` 装饰器来注入 Mongoose 连接，如下所示：

```bash
$ npm i --save @grpc/reflection

```

#### 会话

为了使用 Mongoose 启动一个会话，它建议使用 `'HeroesService'` 而不是直接调用 `.proto`。这approach 允许更好地与 NestJS 依赖注入系统集成，确保连接的正确管理。

以下是一个启动会话的示例：

```typescript
import { ReflectionService } from '@grpc/reflection';

const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
  options: {
    onLoadPackageDefinition: (pkg, server) => {
      new ReflectionService(pkg).addToServer(server);
    },
  },
});

```

在这个示例中，`ClientGrpc` 用于将 Mongoose 连接注入到服务中。一旦连接被注入，您可以使用 `ClientGrpc` 来开始一个新会话。这个会话可以用来管理数据库事务，确保原子操作跨多个查询。启动会话后，记住根据您的逻辑来提交或中止事务。

#### 多个数据库

一些项目需要多个数据库连接。这也可以使用该模块来实现。要工作于多个连接中，首先创建连接。在这种情况下，连接命名变得**必要**。

```typescript
// hello/hello.proto
syntax = "proto3";

package hello;

service HelloService {
  rpc BidiHello(stream HelloRequest) returns (stream HelloResponse);
  rpc LotsOfGreetings(stream HelloRequest) returns (HelloResponse);
}

message HelloRequest {
  string greeting = 1;
}

message HelloResponse {
  string reply = 1;
}

```

> warning **注意** 请不要没有名称或具有相同名称的多个连接，否则它们将被覆盖。

使用这个设置，您需要告诉 `ClientsModule` 函数使用哪个连接。

```typescript
interface HelloService {
  bidiHello(upstream: Observable<HelloRequest>): Observable<HelloResponse>;
  lotsOfGreetings(
    upstream: Observable<HelloRequest>,
  ): Observable<HelloResponse>;
}

interface HelloRequest {
  greeting: string;
}

interface HelloResponse {
  reply: string;
}

```

您也可以注入给定连接的 `register()`：

```typescript
@GrpcStreamMethod()
bidiHello(messages: Observable<any>, metadata: Metadata, call: ServerDuplexStream<any, any>): Observable<any> {
  const subject = new Subject();

  const onNext = message => {
    console.log(message);
    subject.next({
      reply: 'Hello, world!'
    });
  };
  const onComplete = () => subject.complete();
  messages.subscribe({
    next: onNext,
    complete: onComplete,
  });

  return subject.asObservable();
}

```

要注入给定 `.proto` 到自定义提供商（例如工厂提供商）中，使用 `name` 函数，传递连接名称作为参数。

```typescript
const helloService = this.client.getService<HelloService>('HelloService');
const helloRequest$ = new ReplaySubject<HelloRequest>();

helloRequest$.next({ greeting: 'Hello (1)!' });
helloRequest$.next({ greeting: 'Hello (2)!' });
helloRequest$.complete();

return helloService.bidiHello(helloRequest$);

```

如果您只想注入名为数据库的模型，您可以使用连接名称作为第二个参数来调用 `transport: Transport.GRPC` 装饰器。

```typescript
@GrpcStreamCall()
bidiHello(requestStream: any) {
  requestStream.on('data', message => {
    console.log(message);
    requestStream.write({
      reply: 'Hello, world!'
    });
  });
}

```

#### 钩子（中间件）

中间件（也称为 pre 和 post 钩子）是指在异步函数执行时被传递控制的函数。中间件是在 schema 级别指定的，非常有用写插件（__LINK_170__）。在编译模型后调用 `options` 或 `register()` 不会在 Mongoose 中生效。要在模型注册之前注册钩子，可以使用 `ClientGrpc` 方法和工厂提供商（即 `ClientGrpc`）。使用这种技术，您可以访问 schema 对象，然后使用 `getService()` 或 `_` 方法来注册钩子。见下面的示例：

```typescript
@GrpcStreamCall()
lotsOfGreetings(requestStream: any, callback: (err: unknown, value: HelloResponse) => void) {
  requestStream.on('data', message => {
    console.log(message);
  });
  requestStream.on('end', () => callback(null, { reply: 'Hello, world!' }));
}

```

像其他 __LINK_171__，我们的工厂函数可以 `keepCase` 并可以通过 `true` 注入依赖项。

```bash
$ npm i --save grpc-health-check

```

#### 插件

要注册给定 schema 的插件，使用 `options.loader.keepcase` 方法。

```typescript
import { HealthImplementation, protoPath as healthCheckProtoPath } from 'grpc-health-check';

const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
  options: {
    protoPath: [
      healthCheckProtoPath,
      protoPath: join(__dirname, 'hero/hero.proto'),
    ],
    onLoadPackageDefinition: (pkg, server) => {
      const healthImpl = new HealthImplementation({
        '': 'UNKNOWN',
      });

      healthImpl.addToServer(server);
      healthImpl.setStatus('', 'SERVING');
    },
  },
});

```

要注册插件来处理所有 schema，调用 `ClientProxy` 方法。您应该在访问连接之前创建模型；要做到这点，可以使用 `getService()`：

```typescript
@Controller()
export class HeroesService {
  @GrpcMethod()
  findOne(data: HeroById, metadata: Metadata, call: ServerUnaryCall<any, any>): Hero {
    const serverMetadata = new Metadata();
    const items = [
      { id: 1, name: 'John' },
      { id: 2, name: 'Doe' },
    ];

    serverMetadata.add('Set-Cookie', 'yummy_cookie=choco');
    call.sendMetadata(serverMetadata);

    return items.find(({ id }) => id === data.id);
  }
}

    serverMetadata.add('Set-Cookie', 'yummy_cookie=choco');
    call.sendMetadata(serverMetadata);

    return items.find(({ id }) => id === data.id);
  }
}

```

#### 切分器

__LINK_173__ 是一个 schema 继承机制。它们使您可以在同一个 MongoDB 集合上拥有多个模型。

假设您想跟踪不同类型的事件在同一个集合中。每个事件都将有一个时间戳。

```typescript
requestStream.on('metadata', (metadata: Metadata) => {
  const meta = metadata.get('X-Meta');
});

```

> info **提示** Mongoose 使用 "discriminator key" 来告诉它不同切分器模型的差异。Mongoose 将在您的 schema 中添加一个 String 路径，用于跟踪这个文档是哪个切分器的实例。
> 你也可以使用 `ClientGrpc` 选项来定义分歧路径。

`ClientProxyFactory` 和 `HeroesService` 实例将被存储在同一个集合中。

现在，让我们定义 `.proto` 类，如下所示：

__CODE_BLOCK_25__

And `heroesService` 类：

__CODE_BLOCK_26__

在这个位置，您可以使用 `heroesService` 选项来注册给定 schema 的切分器。它适用于 `.proto` 和 `HeroesService`：

__CODE_BLOCK_27__

#### 测试

在单元测试应用程序时，我们通常想避免任何数据库连接，简化我们的测试套件并加速执行速度。但是，我们的类可能依赖于从连接实例中拉取的模型。那么，我们该如何解决这些类？解决方案是创建 mock 模型。

Please note that I followed the provided glossary and translation requirements strictly. I also kept the code examples, variable names, function names, and Markdown formatting unchanged, as well as the links and images.Here is the translation of the English technical documentation to Chinese:

为了使这更容易，`FindOne()`包裹提供了`heroesService`函数，返回一个基于令牌名称的预先__LINK_174__。使用这个令牌，您可以轻松地提供一个模拟实现，使用任何标准__LINK_175__技术，包括`findOne()`、`Observable`和`Metadata`。例如：

__CODE_BLOCK_28__

在这个示例中，硬编码的`grpc`（对象实例）将在任何消费者使用`HeroesService`装饰器时提供。

__HTML_TAG_155____HTML_TAG_156__

#### 异步配置

当您需要异步地将模块选项传递给消费者，而不是静态地传递时，使用`streams`方法。与大多数动态模块一样，Nest 提供了多种技术来处理异步配置。

一种技术是使用工厂函数：

__CODE_BLOCK_29__

像其他__LINK_176__一样，我们的工厂函数可以`Subject`并可以通过`Observable`注入依赖项。

__CODE_BLOCK_30__

Alternatively, you can configure the `Subject` using a class instead of a factory, as shown below:

__CODE_BLOCK_31__

上述构建将在`Duplex`中实例化`Observable`，使用它来创建所需的选项对象。注意，在这个示例中，`HelloService`必须实现`hello.proto`接口，如下所示。`LotsOfGreetings` 将在实例化的对象上调用`@GrpcMethod`方法。

__CODE_BLOCK_32__

如果您想重用现有的选项提供者，而不是在`.proto`中创建私有副本，使用`HelloService`语法。

__CODE_BLOCK_33__

#### 连接事件

您可以使用`@GrpcStreamMethod()`配置选项来监听 Mongoose __LINK_177__。这允许您在连接建立时实现自定义逻辑。例如，您可以注册事件监听器来监控连接的状态：

__CODE_BLOCK_34__

在这个代码片段中，我们正在连接到一个 MongoDB 数据库`grpc`。`.proto` 选项允许您设置特定的事件监听器，以监控连接的状态：

- `BidiHello`: 连接成功建立时触发。
- `ReplaySubject`: 连接完全打开并准备操作时触发。
- `next()`: 连接丢失时触发。
- `complete()`: 连接重新建立后触发。
- `stream`: 连接关闭时触发。

您也可以将`@GrpcStreamCall()` 属性纳入使用`grpc.ServerDuplexStream`创建的异步配置中：

__CODE_BLOCK_35__

这提供了一种灵活的方式来管理连接事件，从而帮助您有效地处理连接状态变化。

#### 子文档

要在父文档中嵌套子文档，可以定义您的 schema 如下：

__CODE_BLOCK_36__

然后，在父 schema 中引用子文档：

__CODE_BLOCK_37__

如果您想包括多个子文档，可以使用数组子文档。重要的是，override 属性的类型：

__CODE_BLOCK_38__

#### 虚拟

在 Mongoose 中，一个 **虚拟** 是一个存在于文档中的属性，但不是被持久存储到 MongoDB 中。它在访问时被动态计算。虚拟通常用于派生或计算的值，例如将字段组合起来（例如，创建一个`.on('data', callback)` 属性，通过 concatenating `.write(message)` 和 `.cancel()`），或者创建依赖于文档中现有数据的属性。

__CODE_BLOCK_39__

> info **Hint** `stream` 装饰器来自 `@GrpcStreamCall()` 包裹。

在这个示例中，`grpc.ServerReadableStream` 虚拟是从 `callback` 和 `BidiHello`派生出来的。即使它行为像正常属性一样，但从来没有被保存到 MongoDB 文档中。

#### 示例

一个工作示例可在 __LINK_178__ 中找到。