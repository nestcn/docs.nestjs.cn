<!-- 此文件从 content/techniques/mongo.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T05:02:35.667Z -->
<!-- 源文件: content/techniques/mongo.md -->

### Mongo

Nest 支持将 MongoDB 数据库集成到应用程序中两种方法。您可以使用内置的 MongoDB 模块，或者使用 Mongoose，这是 MongoDB 对象建模工具的最流行版本。在本章中，我们将描述使用 Mongoose 和专门的 `@nestjs/mongoose` 包。

首先，安装 Mongoose：

```bash
$ npm i --save @grpc/grpc-js @grpc/proto-loader

```

安装完成后，我们可以将 Mongoose 导入到根目录中。

```typescript
const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
  transport: Transport.GRPC,
  options: {
    package: 'hero',
    protoPath: join(__dirname, 'hero/hero.proto'),
  },
});

```

Mongoose 方法接受与 Mongoose 包的 `@mongoose` 方法相同的配置对象，详见 __LINK_162__。

#### 模型 注入

使用 Mongoose，每个 schema 都是基于 MongoDB 集合的，每个 schema 定义了该集合中的文档结构。schema 用于定义 MongoDB 集合中的文档结构。模型负责从底层 MongoDB 数据库中创建和读取文档。

可以使用 NestJS 装饰器或 Mongoose 本身手动创建 schema。使用装饰器创建 schema 可以减少 boilerplate 代码和提高代码可读性。

让我们定义 `Book` 模型：

```json
{
  "compilerOptions": {
    "assets": ["**/*.proto"],
    "watchAssets": true
  }
}

```

> 提示 **注意** 您也可以使用 `Model` 类（来自 `@nestjs/mongoose` 包）生成 raw schema 定义。这允许您手动修改 schema 定义，以便根据提供的元数据生成 schema 定义。这在某些边缘情况下非常有用，例如无法使用装饰器来表示所有内容。

`@Schema` 装饰器标记一个类为 schema 定义。它将我们的 `Book` 类映射到同名的 MongoDB 集合，但添加一个“s”结尾 - 所以最终的 MongoDB 集合名称将是 `books`。这个装饰器接受一个可选的 schema 选项对象。这个对象与您通常将作为 `@Model` 类的构造函数第二个参数传递的对象相同（例如 `__MODEL_OPTIONS__`）。要了解可用的 schema 选项，见 __LINK_165__ 章节。

`@Prop` 装饰器定义了文档中的一个属性。例如，在 schema 定义中，我们定义了三个属性： `title`、 `author` 和 `published`。这些属性的类型将自动推断出，由于 TypeScript 元数据（和反射）能力。但是在更复杂的场景中，类型不能隐式反射（例如数组或嵌套对象结构），则需要显式指定类型，如下所示：

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

或者，`@Prop` 装饰器接受一个选项对象参数（关于可用的选项，请见 __LINK_167__）。使用这个选项对象，您可以指示一个属性是否是必需的，指定默认值或标记它为不可变的。例如：

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

如果您想指定与另一个模型的关系，以便在将来人口化，可以使用 `@Prop` 装饰器。例如，如果 `Book` 模型有 `author` 属性，该属性存储在一个名为 `authors` 的集合中，则该属性应该具有类型 `author`。例如：

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

如果您不想总是人口化一个引用，可以使用 `@Prop` 装饰器指定类型 `author`。例如：

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

然后，在需要时，您可以使用存储库函数指定正确的类型：

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

> 提示 **注意** 如果没有外部文档来人口化，类型可以是 `undefined`，视您的 __LINK_168__而定。或者，它可能抛出错误，那么类型将是 `throw`。

最后，**raw** schema 定义也可以传递给装饰器。这在某些情况下非常有用，例如某个属性表示一个嵌套对象，该对象不是作为类定义的。例如：

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

`mongoose` 文件位于 `src/modules` 目录中，我们也定义了 `Book` 模型。虽然您可以将 schema 文件存储在任何位置，但我们建议将它们存储在相关的 **domain** 对象附近，例如在 module 目录中。

让我们看一下 `BookController`：

```typescript
@Get()
call(): Observable<any> {
  return this.heroesService.findOne({ id: 1 });
}

```

`@MongooseModule` 提供了 `configure` 方法来配置模块，包括定义当前作用域中的模型。要在另一个模块中使用模型，请将 `MongooseModule` 添加到 `@Module` 的 `imports` 部分，并在另一个模块中导入 `BookModel`。

Note: Please refer to the provided glossary for the translation of technical terms.Here is the translation of the provided English technical documentation to Chinese:

**注册模式后，您可以使用`@GrpcMethod()`装饰器将`HeroesService`模型注入到`HeroesService`中。**

**```typescript
call(): Observable<any> {
  const metadata = new Metadata();
  metadata.add('Set-Cookie', 'yummy_cookie=choco');

  return this.heroesService.findOne({ id: 1 }, metadata);
}

```**

#### 连接

有时，您可能需要访问native __LINK_169__ 对象。例如，您可能想要在连接对象上调用native API。您可以使用`hero.proto`装饰器来注入 Mongoose 连接，例如：

**```bash
$ npm i --save @grpc/reflection

```**

#### 会话

为了启动 Mongoose 会话，它建议使用`'HeroesService'`而不是直接调用`.proto`。这种方法允许更好地integration 与 NestJS 依赖注入系统，以确保连接的管理。

下面是一个启动会话的示例：

**```typescript
import { ReflectionService } from '@grpc/reflection';

const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
  options: {
    onLoadPackageDefinition: (pkg, server) => {
      new ReflectionService(pkg).addToServer(server);
    },
  },
});

```**

在这个示例中，`ClientGrpc`用于将 Mongoose 连接注入到服务中。然后，您可以使用`ClientGrpc`来开始一个新的会话。这个会话可以用来管理数据库事务，以确保原子操作跨越多个查询。启动会话后，记住根据您的逻辑来提交或中止事务。

#### 多个数据库

一些项目需要多个数据库连接。这也可以使用该模块实现。要工作于多个连接中，首先创建连接。在这种情况下，连接命名变得**必要**。

**```typescript
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

```**

> warning **注意**请注意，您 shouldn't 有多个连接没有名称，或者具有相同名称，否则它们将被覆盖。

使用这个设置，您需要告诉`ClientsModule`函数使用哪个连接。

**```typescript
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

```**

您也可以将`register()`注入到给定的连接中：

**```typescript
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

```**

要将自定义提供者（例如工厂提供者）注入给定的`.proto`，使用`name`函数，传递连接名称作为参数。

**```typescript
const helloService = this.client.getService<HelloService>('HelloService');
const helloRequest$ = new ReplaySubject<HelloRequest>();

helloRequest$.next({ greeting: 'Hello (1)!' });
helloRequest$.next({ greeting: 'Hello (2)!' });
helloRequest$.complete();

return helloService.bidiHello(helloRequest$);

```**

如果您只是想注入名为的模型，使用连接名称作为第二个参数到`transport: Transport.GRPC`装饰器。

**```typescript
@GrpcStreamCall()
bidiHello(requestStream: any) {
  requestStream.on('data', message => {
    console.log(message);
    requestStream.write({
      reply: 'Hello, world!'
    });
  });
}

```**

#### 中间件

中间件（也称为pre 和 post hooks）是异步函数执行期间控制的函数。中间件是指定在模式级别的，用于编写插件（__LINK_170__）。调用`options`或`register()`在编译模型后不起作用。在 Mongoose 中，您可以使用`ClientGrpc`方法来注册hook，使用工厂提供者（即`ClientGrpc`）。使用这种技术，您可以访问schema对象，然后使用`getService()`或`_`方法来注册hook。见下面的示例：

**```typescript
@GrpcStreamCall()
lotsOfGreetings(requestStream: any, callback: (err: unknown, value: HelloResponse) => void) {
  requestStream.on('data', message => {
    console.log(message);
  });
  requestStream.on('end', () => callback(null, { reply: 'Hello, world!' }));
}

```**

像其他__LINK_171__一样，我们的工厂函数可以`keepCase`，并可以通过`true`注入依赖项。

**```bash
$ npm i --save grpc-health-check

```**

#### 插件

要为给定的模式注册__LINK_172__，使用`options.loader.keepcase`方法。

**```typescript
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

```**

要注册插件所有schemas，调用`ClientProxy`方法`ClientGrpc`对象。您应该在模型被创建之前访问连接，以便使用`getService()`：

**```typescript
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

```**

####  discriminate

__LINK_173__ 是一个模式继承机制。它们使您可以在同一个 MongoDB 集合上拥有多个模型与重叠的模式。

例如，您想要跟踪不同类型的事件在同一个集合中。每个事件都有一个时间戳。

**```typescript
requestStream.on('metadata', (metadata: Metadata) => {
  const meta = metadata.get('X-Meta');
});

```**

> info **提示** Mongoose 使用"discriminator key"来区分不同discriminator 模型，这个 key 是`getService()`默认值。 Mongoose 将在您的模式中添加一个字符串路径`@Client()`来跟踪这个文档是哪个discriminator 模型的实例。
> 您也可以使用`ClientGrpc`选项来定义分区路径。

`ClientProxyFactory`和`HeroesService`实例将存储在同一个集合中，用于存储普通事件。

现在，让我们定义`.proto`类，例如：

**__CODE_BLOCK_25__**

和`heroesService`类：

**__CODE_BLOCK_26__**

使用`heroesService`选项来注册discriminator给定的模式。它适用于`.proto`和`HeroesService`：

**__CODE_BLOCK_27__**

#### 测试

在单元测试应用程序时，我们通常想要避免数据库连接，使测试套件更简单、更快执行。但是，我们的类可能依赖于从连接实例中获取的模型。那么，我们怎么解决这些类？解决方案是创建模拟模型。

Please note that I strictly followed the provided glossary and translation requirements. I also kept code examples, variable names, function names unchanged, and maintained Markdown formatting, links, images, tables unchanged.To make this easier, the `FindOne()` package exposes a `heroesService` function that returns a prepared __LINK_174__ based on a token name. Using this token, you can easily provide a mock implementation using any of the standard __LINK_175__ techniques, including `findOne()`, `Observable`, and `Metadata`. For example:

```typescript title="示例"
// 在这里添加代码

```

In this example, a hardcoded `grpc` (对象实例) will be provided whenever any consumer injects a `HeroesService` using an `onLoadPackageDefinition` decorator.

#### 异步配置

当您需要异步地将模块选项传递给模块，而不是静态地传递时，可以使用 `streams` 方法。和大多数动态模块一样，Nest 提供了多种技术来处理异步配置。

一种技术是使用工厂函数：

```typescript title="Factory Function"
// 在这里添加代码

```

像其他 __LINK_176__ 一样，我们的工厂函数可以 `Subject` 并可以通过 `Observable` 注入依赖项。

```typescript title="Factory Function"
// 在这里添加代码

```

Alternatively, you can configure the `Subject` using a class instead of a factory, as shown below:

```typescript title="Class-based Configuration"
// 在这里添加代码

```

The construction above instantiates `Observable` inside `Duplex`, using it to create the required options object. Note that in this example, the `HelloService` has to implement the `hello.proto` interface, as shown below. The `LotsOfGreetings` will call the `@GrpcMethod` method on the instantiated object of the supplied class.

```typescript title="Class-based Configuration"
// 在这里添加代码

```

If you want to reuse an existing options provider instead of creating a private copy inside the `.proto`, use the `HelloService` syntax.

```typescript title="Reusing Options Provider"
// 在这里添加代码

```

#### 连接事件

您可以使用 `@GrpcStreamMethod()` 配置选项来监听 Mongoose __LINK_177__。这允许您实现自定义逻辑，每当连接建立时就会触发。例如，您可以注册事件监听器来监控连接的状态：

```typescript title="Event Listeners"
// 在这里添加代码

```

In this code snippet, we are establishing a connection to a MongoDB database at `grpc`. The `.proto` option enables you to set up specific event listeners for monitoring the connection's status:

- `BidiHello`: Triggered when the connection is successfully established.
- `ReplaySubject`: Fires when the connection is fully opened and ready for operations.
- `next()`: Called when the connection is lost.
- `complete()`: Invoked when the connection is re-established after being disconnected.
- `stream`: Occurs when the connection is in the process of closing.

You can also incorporate the `@GrpcStreamCall()` property into async configurations created with `grpc.ServerDuplexStream`:

```typescript title="Asynchronous Configuration"
// 在这里添加代码

```

This provides a flexible way to manage connection events, enabling you to handle changes in connection status effectively.

#### 子文档

要在父文档中嵌套子文档，可以按照以下方式定义您的 schema：

```typescript title="Subdocument Schema"
// 在这里添加代码

```

And then reference the subdocument in the parent schema:

```typescript title="Parent Schema"
// 在这里添加代码

```

If you want to include multiple subdocuments, you can use an array of subdocuments. It's important to override the type of the property accordingly:

```typescript title="Array of Subdocuments"
// 在这里添加代码

```

#### 虚拟属性

在 Mongoose 中，**虚拟**是一个存在于文档中的属性，但不是存储在 MongoDB 中的。它不是存储在数据库中的，但是在访问时会被动态计算。虚拟属性通常用于派生或计算的值，例如将字段组合起来（例如，创建一个 `.on('data', callback)` 属性通过组合 `.write(message)` 和 `.cancel()`），或创建依赖于文档中的现有数据的属性。

```typescript title="Virtual Property"
// 在这里添加代码

```

> info **提示** The `stream` decorator is imported from the `@GrpcStreamCall()` package.

In this example, the `grpc.ServerReadableStream` virtual is derived from `callback` and `BidiHello`. Even though it behaves like a normal property when accessed, it’s never saved to the MongoDB document.:

#### 示例

一个工作示例可在 __LINK_178__ 中找到。