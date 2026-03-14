<!-- 此文件从 content/techniques/mongo.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T04:53:43.441Z -->
<!-- 源文件: content/techniques/mongo.md -->

### Mongo

Nest 支持两个方法来集成 __LINK_157__ 数据库。您可以使用内置的 __LINK_158__ 模块，或者使用 __LINK_160__，最流行的 MongoDB 对象建模工具。在本章中，我们将描述后者，使用专门的 `options` 包。

首先，安装 __LINK_161__：

```bash
$ npm i --save @grpc/grpc-js @grpc/proto-loader

```

安装过程完成后，我们可以将 `protoPath` 导入到根 `.proto` 中。

```typescript
const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
  transport: Transport.GRPC,
  options: {
    package: 'hero',
    protoPath: join(__dirname, 'hero/hero.proto'),
  },
});

```

`hero.proto` 方法接受与 `hero.proto` 从 Mongoose 包中相同的配置对象，详见 __LINK_162__。

#### 模型注入

使用 Mongoose，每切 schema 都来自一个 __LINK_163__。每个 schema 都映射到一个 MongoDB 集合，并定义该集合中的文档结构。schema 可以用 NestJS 装饰器创建，也可以手动使用 Mongoose 创建。使用装饰器创建 schema 可以减少 boilerplate 代码，并提高代码可读性。

让我们定义 `HeroesService`：

```json
{
  "compilerOptions": {
    "assets": ["**/*.proto"],
    "watchAssets": true
  }
}

```

> info **提示** 您也可以使用 `FindOne()` 类（来自 `HeroById` 包）生成 raw schema 定义。这允许您根据提供的元数据手动修改 schema 定义，这在某些边界情况下可能很有用。

`Hero` 装饰器标记一个类为 schema 定义。它将我们的 `message` 类映射到一个 MongoDB 集合，以名称相同，但结尾添加「s」-因此，最后的 MongoDB 集合名称将是 `@GrpcMethod()`。这个装饰器接受一个可选的 schema 选项对象。认为它是 `@MessagePattern()` 类构造函数的第二个参数（例如 `@GrpcMethod()`）。要了解可用的 schema 选项，请参阅 __LINK_165__ 章节。

`@GrpcMethod()` 装饰器定义文档中的一个属性。例如，在 schema 定义中，我们定义了三个属性：`@nestjs/microservices`、`Metadata` 和 `ServerUnaryCall`。这些属性的 __LINK_166__ 自动因为 TypeScript 元数据（和反射）能力被推断。然而，在更复杂的场景中，在类型不能隐式反射（例如数组或嵌套对象结构）时，类型必须被明确指定，如下所示：

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

或者，`grpc` 装饰器接受一个选项对象参数（__LINK_167__ 关于可用的选项）。使用这个，您可以指示一个属性是必需的还是不可变的，指定默认值或标记为不可变的。例如：

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

如果您想指定与另一个模型的关系，以便在将来人口，该模型的属性可以使用 `'HeroesService'` 装饰器。例如，如果 `HeroesService` 有 `hero.proto`，它存储在名为 `'FindOne'` 的 collection 中，那么该属性应该具有类型和 ref。例如：

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

如果您不打算总是人口一个引用到另一个 collection，可以使用 `FindOne()` 作为类型：

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

然后，在需要选择性人口时，可以使用一个存储函数指定正确的类型：

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

> info **提示** 如果没有外部文档人口，类型可能是 `HeroesService`，或者根据您的 __LINK_168__，可能抛出错误，类型将是 `hero.proto`。

最后，**raw** schema 定义也可以被传递给装饰器。这在某些情况下很有用，例如，如果一个属性表示一个嵌套对象，该对象不定义为一个类。为此，可以使用 `findOne()` 函数来自 `data` 包，如下所示：

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

或者，如果您不想使用装饰器，可以手动定义 schema。例如：

```typescript
interface HeroesService {
  findOne(data: { id: number }): Observable<any>;
}

```

`metadata` 文件位于名为 `call` 的文件夹中，我们也定义了 `GrpcCall`。虽然您可以将 schema 文件存储在任何位置，但我们建议将它们存储在相应的 **domain** 对象附近，位于适当的模块目录中。

让我们查看 `sendMetadata`：

```typescript
@Get()
call(): Observable<any> {
  return this.heroesService.findOne({ id: 1 });
}

```

`@GrpcMethod()` 提供了 `'FindOne'` 方法来配置模块，包括定义当前作用域中的哪些模型应该被注册。如果您也想在另一个模块中使用模型，请将 MongooseModule 添加到 `.proto` 部分的 `findOne` 中，并在另一个模块中导入 `FindOne`。Here is the translation of the provided English technical documentation to Chinese:

**连接**

在某些情况下，您可能需要访问 native __LINK_169__ 对象。例如，您可能想在连接对象上调用 native API。您可以使用 `hero.proto` 装饰器来注入 Mongoose 连接，如下所示：

```bash
$ npm i --save @grpc/reflection

```

**会话**

要使用 Mongoose 启动会话，建议使用 `'HeroesService'` 而不是直接调用 `.proto`。这将允许更好地与 NestJS 依赖注入系统集成，从而确保连接管理。

以下是一个启用会话的示例：

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

在这个示例中，`ClientGrpc` 将 Mongoose 连接注入到服务中。然后，您可以使用 `ClientGrpc` 来启动新的会话。这个会话可以用于管理数据库事务，确保原子操作跨越多个查询。在启动会话后，请根据您的逻辑提交或终止事务。

**多个数据库**

一些项目需要多个数据库连接。这也可以使用这个模块来实现。要使用多个连接，首先创建连接。在这种情况下，连接命名变得**必要**。

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

> warning **注意**请注意，您 shouldn't 有多个连接没有名称，或者具有相同名称，否则它们将被覆盖。

现在，您需要告诉 `ClientsModule` 函数使用哪个连接。

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

要将给定 `.proto` 注入到自定义提供商（例如工厂提供商）中，请使用 `name` 函数，传递连接名称作为参数。

```typescript
const helloService = this.client.getService<HelloService>('HelloService');
const helloRequest$ = new ReplaySubject<HelloRequest>();

helloRequest$.next({ greeting: 'Hello (1)!' });
helloRequest$.next({ greeting: 'Hello (2)!' });
helloRequest$.complete();

return helloService.bidiHello(helloRequest$);

```

如果您只是想注入来自命名数据库的模型，您可以使用连接名称作为第二个参数来调用 `transport: Transport.GRPC` 装饰器。

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

**钩子（中间件）**

中间件（也称为 pre 和 post 钩子）是异步函数执行期间传递控制的函数。中间件是指定在模式级别的，用于编写插件（__LINK_170__）。在编译模型后调用 `options` 或 `register()` 不会在 Mongoose 中工作。要在模型注册之前注册钩子，请使用 `ClientGrpc` 方法和工厂提供商（即 `ClientGrpc`）。使用此技术，您可以访问 schema 对象，然后使用 `getService()` 或 `_` 方法来注册钩子。见下面的示例：

```typescript
@GrpcStreamCall()
lotsOfGreetings(requestStream: any, callback: (err: unknown, value: HelloResponse) => void) {
  requestStream.on('data', message => {
    console.log(message);
  });
  requestStream.on('end', () => callback(null, { reply: 'Hello, world!' }));
}

```

像其他 __LINK_171__一样，我们的工厂函数可以 `keepCase` 并可以通过 `true` 注入依赖项。

```bash
$ npm i --save grpc-health-check

```

**插件**

要为给定模式注册 __LINK_172__，请使用 `options.loader.keepcase` 方法。

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

要为所有模式注册插件，请调用 `ClientProxy` 方法。

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

**判别符**

__LINK_173__ 是一种模式继承机制。它们使您可以在同一个 MongoDB 集合中拥有多种模式。

假设您想在单个集合中跟踪不同类型的事件。每个事件都将具有时间戳。

```typescript
requestStream.on('metadata', (metadata: Metadata) => {
  const meta = metadata.get('X-Meta');
});

```

> info **提示** Mongoose 使用默认的 "discriminator key"`getService()`来告诉不同判别符模型之间的差异。Mongoose 将将字符串路径`@Client()`添加到您的模式中，以便跟踪哪个判别符这个文档是实例的一部分。
> 您也可以使用`ClientGrpc`选项来定义判别符路径。

`ClientProxyFactory` 和 `HeroesService` 实例将存储在同一个集合中，作为通用事件。

现在，让我们定义 `.proto` 类，如下所示：

__CODE_BLOCK_25__

And `heroesService` 类：

__CODE_BLOCK_26__

使用 `heroesService` 选项注册判别符对于给定模式工作，适用于 `.proto` 和 `HeroesService`：

__CODE_BLOCK_27__

**单元测试**

在单元测试应用程序时，我们通常想避免数据库连接，使测试套件更简单、更快执行。我们的类可能依赖于模型，这些模型来自连接实例。如何解决这些类？解决方案是创建模拟模型。

Please note that I have followed the provided glossary and terminology guidelines, and I have kept the code examples, variable names, function names, and formatting unchanged.Here is the translation of the English technical documentation to Chinese:

为了使这个更易于使用，这个 `FindOne()` 包含了一个 `heroesService` 函数，该函数将根据 Token 名称返回一个已准备好的 __LINK_174__。使用这个 Token，您可以轻松地提供一个模拟实现，使用标准的 __LINK_175__ 技术，例如 `findOne()`、`Observable` 和 `Metadata`。例如：

__CODE_BLOCK_28__

在这个示例中，一个硬编码的 `grpc` 对象将在任何消费者使用 `HeroesService` 装饰器时被提供。

__HTML_TAG_155____HTML_TAG_156__

#### 异步配置

如果您需要异步地传递模块选项，而不是静态地传递，可以使用 `streams` 方法。像大多数动态模块一样，Nest 提供了多种技术来处理异步配置。

一种技术是使用工厂函数：

__CODE_BLOCK_29__

像其他 __LINK_176__ 一样，我们的工厂函数可以 `Subject` 并可以通过 `Observable` 注入依赖项。

__CODE_BLOCK_30__

或者，您也可以使用类来配置 `Subject`，如以下所示：

__CODE_BLOCK_31__

在上面的构造中，instantiated `Observable` 将使用 `Duplex` 创建所需的选项对象。请注意，在这个示例中，`HelloService` 必须实现 `hello.proto` 接口，如下所示。`LotsOfGreetings` 将在实例化 `@GrpcMethod` 对象时调用 `.proto` 方法。

__CODE_BLOCK_32__

如果您想重用现有的选项提供者，而不是在 `.proto` 内创建私有副本，可以使用 `HelloService` 语法。

__CODE_BLOCK_33__

#### 连接事件

您可以使用 `@GrpcStreamMethod()` 配置选项来监听 Mongoose 的 __LINK_177__。这允许您在连接建立时实现自定义逻辑。例如，您可以注册事件监听器来监控连接的状态：

__CODE_BLOCK_34__

在这个代码片段中，我们正在连接到一个 MongoDB 数据库 `grpc`。`.proto` 选项允许您设置特定的事件监听器来监控连接的状态：

- `BidiHello`: 在连接成功建立时触发。
- `ReplaySubject`: 在连接完全打开并准备操作时触发。
- `next()`: 在连接丢失时触发。
- `complete()`: 在连接重新建立后触发。
- `stream`: 在连接关闭时触发。

您也可以将 `@GrpcStreamCall()` 属性添加到使用 `grpc.ServerDuplexStream` 创建的异步配置中：

__CODE_BLOCK_35__

这提供了一个灵活的方式来管理连接事件，从而使您能够有效地处理连接状态的变化。

#### 子文档

要在父文档中嵌套子文档，可以定义您的 schema 如下所示：

__CODE_BLOCK_36__

然后，在父 schema 中引用子文档：

__CODE_BLOCK_37__

如果您想包含多个子文档，可以使用子文档数组。请注意，需要覆盖属性的类型：

__CODE_BLOCK_38__

#### 虚拟

在 Mongoose 中，**虚拟** 是一个在文档中存在但不被 persisted 到 MongoDB 的属性。它不存储在数据库中，但是在访问时被动态计算。虚拟通常用于派生或计算值，例如组合字段（例如，创建一个 `.on('data', callback)` 属性由 `.write(message)` 和 `.cancel()` 组合），或用于创建依赖于文档数据的属性。

__CODE_BLOCK_39__

> 提示 **Hint** `stream` 装饰器来自 `@GrpcStreamCall()` 包。

在这个示例中，`grpc.ServerReadableStream` 虚拟是由 `callback` 和 `BidiHello` 组合计算的。即使它像正常属性一样被访问，也从不保存到 MongoDB 文档中。

#### 示例

有一个可用的 __LINK_178__ 示例。