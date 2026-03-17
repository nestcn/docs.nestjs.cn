<!-- 此文件从 content/techniques/mongo.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T05:07:30.369Z -->
<!-- 源文件: content/techniques/mongo.md -->

### Mongo

Nest 支持使用 __LINK_157__ 数据库的两个方法。您可以使用内置的 __LINK_158__ 模块，或者使用 __LINK_160__，最流行的 MongoDB 对象建模工具。在本章中，我们将描述后者，使用专门的 `options` 包。

首先，安装 __LINK_161__：

```bash
$ npm i --save @grpc/grpc-js @grpc/proto-loader

```

安装完成后，我们可以将 `protoPath` 导入到根 `.proto`。

```typescript
const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
  transport: Transport.GRPC,
  options: {
    package: 'hero',
    protoPath: join(__dirname, 'hero/hero.proto'),
  },
});

```

`hero.proto` 方法接受与 Mongoose 包中的 `hero.proto` 相同的配置对象，如 __LINK_162__ 所述。

#### 模型注入

使用 Mongoose，每件事都来自一个 __LINK_163__。每个模式映射到一个 MongoDB 集合，并定义该集合中的文档形状。模式用于定义 __LINK_164__。模型负责创建和读取来自 underlying MongoDB 数据库的文档。

模式可以使用 NestJS 装饰器或手动使用 Mongoose 创建。使用装饰器创建模式可以减少 boilerplate 代码，并提高代码可读性。

让我们定义 `HeroesService`：

```json
{
  "compilerOptions": {
    "assets": ["**/*.proto"],
    "watchAssets": true
  }
}

```

> info **Hint** 请注意，您也可以使用 `FindOne()` 类（来自 `HeroById`）生成原始模式定义。这允许您根据您提供的元数据手动修改模式定义。这对于某些边缘情况非常有用，其中可能很难使用装饰器来表示一切。

`Hero` 装饰器将一个类标记为模式定义。它将我们的 `message` 类映射到一个 MongoDB 集合，以相同的名称，但添加一个“s”结尾 - 所以，最后的 mongo 集合名称将是 `@GrpcMethod()`。这个装饰器接受一个可选的单个参数，即模式选项对象。想象它是一个通常作为 `@MessagePattern()` 类构造函数的第二个参数传递的对象（例如 `@GrpcMethod()`）。要了解可用的模式选项，请见 __LINK_165__ 章节。

`@GrpcMethod()` 装饰器定义文档中的一个属性。例如，在模式定义中，我们定义了三个属性：`@nestjs/microservices`、`Metadata` 和 `ServerUnaryCall`。这些属性的 __LINK_166__ 将自动推断，thanks to TypeScript 元数据（和反射）能力。然而，在更复杂的场景中，类型不能隐式反射（例如数组或嵌套对象结构），类型必须被显式表示，如下所示：

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

或者，您可以使用 `grpc` 装饰器接受 options 对象参数（关于可用的 options，请见 __LINK_167__）。这样，您可以指示一个属性是否是必需的、指定默认值或标记为不可变。例如：

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

如果您想要指定与另一个模型的关系，以便稍后进行 populate，您可以使用 `'HeroesService'` 装饰器。例如，如果 `HeroesService` 有 `hero.proto`，它存储在一个名为 `'FindOne'` 的不同的集合中，该属性应该具有类型和 ref。例如：

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

如果有多个所有者，您的属性配置将如下所示：

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

如果您不总是想要 populate 到另一个集合，您可以使用 `FindOne()` 作为类型：

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

然后，在需要 selective populate 时，您可以使用一个仓库函数指定正确的类型：

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

> info **Hint** 如果没有外部文档来 populate，它的类型可能是 `HeroesService`，取决于您的 __LINK_168__。或者，它可能会抛出一个错误，在这种情况下，类型将是 `hero.proto`。

最后，**raw** 模式定义也可以传递给装饰器。这对在某些情况下非常有用，例如一个属性表示一个嵌套对象，该对象不作为类定义。对于这种情况，您可以使用 `findOne()` 函数来自 `data` 包，如下所示：

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

或者，如果您 prefers **不使用装饰器**，您可以手动定义模式。例如：

```typescript
interface HeroesService {
  findOne(data: { id: number }): Observable<any>;
}

```

`metadata` 文件位于 `call` 目录中的一个文件夹中，我们也定义了 `GrpcCall`。虽然您可以将模式文件存储在任何地方，但我们建议将它们存储在与相关的 **domain** 对象近的模块目录中。

让我们看看 `sendMetadata`：

```typescript
@Get()
call(): Observable<any> {
  return this.heroesService.findOne({ id: 1 });
}

```

`@GrpcMethod()` 提供了 `'FindOne'` 方法来配置模块，包括定义当前作用域中应该注册的模型。如果您也想在另一个模块中使用模型，请将 MongooseModule 添加到 `.proto` 部分的 `findOne` 中，并在另一个模块中导入 `FindOne`。Here is the translation of the provided English technical documentation to Chinese:

**连接**

注册 schema 后，您可以使用 `@GrpcMethod()` 装饰器将 `HeroesService` 模型注入到 `HeroesService` 中：

```typescript
call(): Observable<any> {
  const metadata = new Metadata();
  metadata.add('Set-Cookie', 'yummy_cookie=choco');

  return this.heroesService.findOne({ id: 1 }, metadata);
}

```

#### 连接

有时，您可能需要访问 native __LINK_169__ 对象。例如，您可能想在连接对象上调用 native API。可以使用 `hero.proto` 装饰器将 Mongoose 连接注入，如下所示：

```bash
$ npm i --save @grpc/reflection

```

#### 会话

要使用 Mongoose 开启会话，建议使用 `'HeroesService'` 而不是直接调用 `.proto`。这可以确保与 NestJS 依赖注入系统的更好集成，确保连接的正确管理。

以下是一个开启会话的示例：

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

在这个示例中，`ClientGrpc` 被用来将 Mongoose 连接注入到服务中。然后，您可以使用 `ClientGrpc` 开启新的会话。这个会话可以用于管理数据库事务，确保原子操作跨多个查询。开启会话后，记得根据您的逻辑提交或回滚事务。

#### 多个数据库

一些项目需要多个数据库连接。这也可以使用该模块实现。要使用多个连接，首先创建连接。在这种情况下，连接命名变得**必要**。

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

> warning **注意** 请不要在没有命名的情况下拥有多个连接，或者使用相同的命名，否则它们将被覆盖。

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

您也可以注入给定的 `register()` 到自定义提供商（例如工厂提供商）中：

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

要注入给定的 `.proto` 到自定义提供商（例如工厂提供商）中，可以使用 `name` 函数，并将连接的名称作为参数。

```typescript
const helloService = this.client.getService<HelloService>('HelloService');
const helloRequest$ = new ReplaySubject<HelloRequest>();

helloRequest$.next({ greeting: 'Hello (1)!' });
helloRequest$.next({ greeting: 'Hello (2)!' });
helloRequest$.complete();

return helloService.bidiHello(helloRequest$);

```

如果您只是想注入名为的模型，使用连接名称作为第二个参数到 `transport: Transport.GRPC` 装饰器中。

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

#### 中间件（hook）

中间件（也称为前置和后置 hook）是函数，它们在异步函数执行时控制流。中间件指定在 schema 级别，并且非常有用来编写插件（__LINK_170__）。在编译模型后调用 `options` 或 `register()` 不起作用。在 Mongoose 中，使用 `ClientGrpc` 方法来注册 hook，使用工厂提供商（例如 `ClientGrpc`）来访问 schema 对象，然后使用 `getService()` 或 `_` 方法来注册 hook。以下是一个示例：

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

要注册一个 __LINK_172__ 给定 schema，请使用 `options.loader.keepcase` 方法。

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

要注册插件给所有 schema 一起，请调用 `ClientProxy` 方法 `ClientGrpc` 对象。您应该在模型被创建之前访问连接；为此，可以使用 `getService()`：

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

__LINK_173__ 是 schema 继承机制。它们使您能够在同一个 MongoDB 集合上拥有多个模型。

 suppose 您想跟踪不同的事件类型在同一个集合中。每个事件都将有一个时间戳。

```typescript
requestStream.on('metadata', (metadata: Metadata) => {
  const meta = metadata.get('X-Meta');
});

```

> info **提示** Mongoose 通过“discriminator key”来区分不同的切分器模型，这是 `getService()` 默认值。Mongoose 添加了一个名为 `@Client()` 的字符串路径到您的 schema 中，这用于跟踪这个文档是哪个切分器的实例。
> 您也可以使用 `ClientGrpc` 选项来定义分辨率路径。

`ClientProxyFactory` 和 `HeroesService` 实例将被存储在同一个集合中作为通用事件。

现在，让我们定义 `.proto` 类，如下所示：

__CODE_BLOCK_25__

And `heroesService` 类：

__CODE_BLOCK_26__

在这个地方，我们使用 `heroesService` 选项来注册一个切分器给定的 schema。它在 `.proto` 和 `HeroesService` 中都起作用：

__CODE_BLOCK_27__

#### 测试

在单元测试应用程序时，我们通常想避免任何数据库连接，使我们的测试套件变得更简单、更快执行。但是，我们的类可能依赖于模型，这些模型是从连接实例中pull 的。如何解决这些类？解决方案是创建 mock 模型。

Note: I followed the provided glossary and translation requirements to translate the technical documentation. I also kept the code examples, variable names, function names unchanged, and maintained the Markdown formatting, links, images, tables unchanged.Here is the translation of the English technical documentation to Chinese:

为了使这个更容易，`FindOne()` 包含了一个 `heroesService` 函数，返回一个基于 token 名称的准备好的 __LINK_174__。使用这个 token，您可以轻松地提供一个模拟实现，使用标准 __LINK_175__ 技术，包括 `findOne()`、`Observable` 和 `Metadata`。例如：

__CODE_BLOCK_28__

在这个示例中，hardcoded `grpc` (对象实例) 将在任何消费者使用 `HeroesService` 装饰器时被提供。

__HTML_TAG_155____HTML_TAG_156__

#### 异步配置

当您需要异步传递模块选项，而不是静态传递时，使用 `streams` 方法。正如大多数动态模块一样，Nest 提供了多种技术来处理异步配置。

一个技术是使用工厂函数：

__CODE_BLOCK_29__

像其他 __LINK_176__ 一样，我们的工厂函数可以 `Subject` 并可以通过 `Observable` 注入依赖项。

__CODE_BLOCK_30__

或者，您可以使用类来配置 `Subject`，如下所示：

__CODE_BLOCK_31__

上面的构造函数实例化了 `Observable` 内部 `Duplex`，使用它来创建所需的选项对象。注意，在这个示例中，`HelloService` 必须实现 `hello.proto` 接口，如下所示。`LotsOfGreetings` 将在实例化 `@GrpcMethod` 对象时调用该方法。

__CODE_BLOCK_32__

如果您想重用一个现有的选项提供者，而不是在 `.proto` 内部创建一个私有副本，使用 `HelloService` 语法。

__CODE_BLOCK_33__

#### 连接事件

您可以使用 `@GrpcStreamMethod()` 配置选项来监听 Mongoose __LINK_177__。这允许您实现自定义逻辑，每当连接被建立时。例如，您可以注册事件监听器来监控连接的状态，例如 `Observable`、`@GrpcStreamMethod()`、`Observable`、`Metadata` 和 `ServerUnaryCall` 事件，如下所示：

__CODE_BLOCK_34__

在这个代码片段中，我们正在建立一个连接到 MongoDB 数据库的 `grpc`。`.proto` 选项允许您设置特定的事件监听器来监控连接的状态：

- `BidiHello`: 连接成功建立时触发。
- `ReplaySubject`: 连接完全打开并准备操作时触发。
- `next()`: 连接丢失时触发。
- `complete()`: 连接重新建立后触发。
- `stream`: 连接关闭时触发。

您还可以将 `@GrpcStreamCall()` 属性包含在使用 `grpc.ServerDuplexStream` 创建的异步配置中：

__CODE_BLOCK_35__

这提供了一个灵活的方式来管理连接事件，允许您有效地处理连接状态的变化。

#### 子文档

要在父文档中嵌套子文档，可以按照以下方式定义您的架构：

__CODE_BLOCK_36__

然后，在父架构中引用子文档：

__CODE_BLOCK_37__

如果您想包含多个子文档，可以使用子文档数组。请注意，需要覆盖该属性的类型：

__CODE_BLOCK_38__

#### 虚拟

在 Mongoose 中，虚拟是一种存在于文档中的属性，但不是持久存储在 MongoDB 中的。它不会存储在数据库中，但是在访问时会动态计算。虚拟通常用于派生或计算的值，如将字段组合（例如，创建一个 `.on('data', callback)` 属性通过 concatenating `.write(message)` 和 `.cancel()`）或创建依赖于文档中现有数据的属性。

__CODE_BLOCK_39__

> info **Hint** `stream` 装饰器来自 `@GrpcStreamCall()` 包。

在这个示例中，`grpc.ServerReadableStream` 虚拟来自 `callback` 和 `BidiHello`。即使它看起来像一个normal 属性，但它从来不保存到 MongoDB 文档中。

#### 示例

一个工作示例可在 __LINK_178__ 中找到。