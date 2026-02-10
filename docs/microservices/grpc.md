### gRPC

[gRPC](https://github.com/grpc/grpc-node) 是一种现代开源的高性能 RPC 框架，可在任何环境中运行。它能够高效地连接数据中心内及跨数据中心的服务，并支持可插拔的负载均衡、链路追踪、健康检查和身份验证功能。

与许多 RPC 系统类似，gRPC 的核心思想是通过可远程调用的函数（方法）来定义服务。您需要为每个方法定义参数和返回类型。这些服务、参数和返回类型都通过 Google 开源的与语言无关的 [protocol buffers](https://protobuf.dev) 机制，在 `.proto` 文件中进行定义。

通过 gRPC 传输器，Nest 使用 `.proto` 文件动态绑定客户端和服务器，从而轻松实现远程过程调用，并自动对结构化数据进行序列化和反序列化。

#### 安装

要开始构建基于 gRPC 的微服务，首先需要安装所需的软件包：

```bash
$ npm i --save @grpc/grpc-js @grpc/proto-loader
```

#### 概述

与其他 Nest 微服务传输层实现类似，您可以通过传递给 `createMicroservice()` 方法的选项对象中的 `transport` 属性来选择 gRPC 传输机制。在以下示例中，我们将设置一个英雄服务。`options` 属性提供了有关该服务的元数据；其属性描述见[下文](#选项) 。

 ```typescript title="main.ts"
const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
  transport: Transport.GRPC,
  options: {
    package: 'hero',
    protoPath: join(__dirname, 'hero/hero.proto'),
  },
});
```

:::info 提示
`join()` 函数是从 `path` 包导入的；`Transport` 枚举是从 `@nestjs/microservices` 包导入的。
:::

在 `nest-cli.json` 文件中，我们添加了 `assets` 属性以允许分发非 TypeScript 文件，以及 `watchAssets` 属性用于开启对所有非 TypeScript 资源的监视。在本例中，我们希望 `.proto` 文件能自动复制到 `dist` 文件夹。

```json
{
  "compilerOptions": {
    "assets": ["**/*.proto"],
    "watchAssets": true
  }
}
```

#### 选项

**gRPC** 传输器选项对象公开了以下描述的属性。

| 选项          | 描述                                                                                                                              |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| `package`    | Protobuf 包名（需与 .proto 文件中的 package 设置匹配）。必填项                                                                     |
| `protoPath`  | 根目录的绝对（或相对）路径指向 .proto 文件。必需                                                                                   |
| `url`        | 连接 URL。格式为 IP 地址/DNS 名称:端口的字符串（例如 Docker 服务器使用 `'0.0.0.0:50051'`），定义传输器建立连接的地址/端口。可选。默认为 `'localhost:5000'` |
| `protoLoader` | 用于加载 .proto 文件的工具 NPM 包名称。可选。默认为 `'@grpc/proto-loader'`                                                         |
| `loader`     | `@grpc/proto-loader` 选项。这些选项提供对 .proto 文件行为的精细控制。可选。参见点击此处查看更多详情                                  |
| `credentials` | 服务器凭证（可选）。了解更多                                                                                                      |

#### 示例 gRPC 服务

让我们定义名为 `HeroesService` 的示例 gRPC 服务。在上述 `options` 对象中，`protoPath` 属性设置了指向协议定义文件 `hero.proto` 的路径。该 `hero.proto` 文件采用 [protocol buffers](https://developers.google.com/protocol-buffers) 格式编写，其内容如下：

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

我们的 `HeroesService` 公开了一个 `FindOne()` 方法。该方法期望接收一个 `HeroById` 类型的输入参数，并返回一个 `Hero` 消息（协议缓冲区使用 `message` 元素来定义参数类型和返回类型）。

接下来我们需要实现该服务。为了定义一个满足此要求的处理程序，我们在控制器中使用 `@GrpcMethod()` 装饰器，如下所示。该装饰器提供了将方法声明为 gRPC 服务方法所需的元数据。

:::info 提示
在前面的微服务章节中介绍的 `@MessagePattern()` 装饰器（ [了解更多](/microservices/basics#请求-响应) ）不适用于基于 gRPC 的微服务。对于基于 gRPC 的微服务，`@GrpcMethod()` 装饰器有效地取代了它的位置。
:::

 ```typescript title="heroes.controller.ts"
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

:::info 提示
`@GrpcMethod()` 装饰器是从 `@nestjs/microservices` 包导入的，而 `Metadata` 和 `ServerUnaryCall` 则来自 `grpc` 包。
:::

上述装饰器接收两个参数。第一个是服务名称（例如 `'HeroesService'`），对应 `hero.proto` 文件中的 `HeroesService` 服务定义。第二个参数（字符串 `'FindOne'`）对应 `hero.proto` 文件里 `HeroesService` 服务中定义的 `FindOne()` rpc 方法。

`findOne()` 处理方法接收三个参数：调用者传递的 `data` 数据、存储 gRPC 请求元数据的 `metadata`，以及用于获取 `GrpcCall` 对象属性（如向客户端发送元数据的 `sendMetadata`）的 `call` 参数。

`@GrpcMethod()` 装饰器的两个参数都是可选的。如果调用时不传第二个参数（例如 `'FindOne'`），Nest 会根据处理方法名自动将其转换为大驼峰命名（例如将 `findOne` 处理方法关联到 `FindOne` rpc 调用定义）来关联 `.proto` 文件中的 rpc 方法。如下所示。

 ```typescript title="heroes.controller.ts"
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

你也可以省略第一个 `@GrpcMethod()` 参数。在这种情况下，Nest 会根据定义处理程序的 **class** 名称，自动将该处理程序与 proto 定义文件中的服务定义关联起来。例如，在以下代码中，类 `HeroesService` 会基于名称 `'HeroesService'` 的匹配，将其处理程序方法与 `hero.proto` 文件中的 `HeroesService` 服务定义相关联。

 ```typescript title="heroes.controller.ts"
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

#### 客户端

Nest 应用程序可以作为 gRPC 客户端，使用定义在 `.proto` 文件中的服务。你可以通过 `ClientGrpc` 对象访问远程服务。获取 `ClientGrpc` 对象有多种方式。

首选技术是导入 `ClientsModule` 模块。使用 `register()` 方法将.proto 文件中定义的服务包绑定到注入令牌，并进行服务配置。`name` 属性即为注入令牌。对于 gRPC 服务，需使用 `transport: Transport.GRPC` 配置。`options` 属性是一个对象，其包含的属性与[前文](#选项)所述相同。

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

:::info 提示
`register()` 方法接收对象数组作为参数。通过提供以逗号分隔的注册对象列表，可同时注册多个服务包。
:::



注册完成后，我们可以通过 `@Inject()` 注入配置好的 `ClientGrpc` 对象。然后使用该对象的 `getService()` 方法获取服务实例，如下所示。

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

error **警告** ：除非在 proto 加载器配置中将 `keepCase` 选项设置为 `true`（即微服务传输器配置中的 `options.loader.keepcase`），否则 gRPC 客户端不会发送名称中包含下划线 `_` 的字段。

请注意，与其他微服务传输方法相比存在细微差异。我们不再使用 `ClientProxy` 类，而是改用提供 `getService()` 方法的 `ClientGrpc` 类。这个 `getService()` 泛型方法接收服务名称作为参数，并返回其实例（如果可用）。

或者，您也可以使用 `@Client()` 装饰器来实例化 `ClientGrpc` 对象，如下所示：

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

最后，对于更复杂的场景，我们可以使用 `ClientProxyFactory` 类注入动态配置的客户端，具体方法如[此处](/microservices/basics#客户端)所述。

无论是哪种情况，我们最终都会获得一个指向 `HeroesService` 代理对象的引用，该对象暴露了与 `.proto` 文件内定义的相同方法集。当我们访问这个代理对象（即 `heroesService`）时，gRPC 系统会自动序列化请求、将其转发至远程系统、返回响应并反序列化响应结果。由于 gRPC 为我们屏蔽了这些网络通信细节，`heroesService` 的表现就如同本地服务提供者一般。

请注意，所有服务方法都采用**小驼峰命名法** （遵循语言的自然约定）。例如，虽然我们的 `.proto` 文件中 `HeroesService` 定义包含 `FindOne()` 函数，但 `heroesService` 实例将提供 `findOne()` 方法。

```typescript
interface HeroesService {
  findOne(data: { id: number }): Observable<any>;
}
```

消息处理器也可以返回一个 `Observable`，在这种情况下，结果值将持续发射直到流完成。

 ```typescript title="heroes.controller.ts"
@Get()
call(): Observable<any> {
  return this.heroesService.findOne({ id: 1 });
}
```

要发送 gRPC 元数据（随请求一起），您可以传入第二个参数，如下所示：

```typescript
call(): Observable<any> {
  const metadata = new Metadata();
  metadata.add('Set-Cookie', 'yummy_cookie=choco');

  return this.heroesService.findOne({ id: 1 }, metadata);
}
```

:::info 提示
`Metadata` 类是从 `grpc` 包中导入的。
:::

请注意，这将需要我们更新之前几步中定义的 `HeroesService` 接口。

#### 示例

一个可用的示例[在此处](https://github.com/nestjs/nest/tree/master/sample/04-grpc)查看。

#### gRPC 反射

[gRPC 服务器反射规范](https://grpc.io/docs/guides/reflection/#概述)是一项标准，允许 gRPC 客户端获取服务器暴露的 API 详细信息，类似于为 REST API 提供 OpenAPI 文档。这可以显著简化开发者使用调试工具（如 grpc-ui 或 postman）的工作流程。

要为您的服务器添加 gRPC 反射支持，首先需要安装所需的实现包：

```bash
$ npm i --save @grpc/reflection
```

然后可以通过 gRPC 服务器选项中的 `onLoadPackageDefinition` 钩子将其集成到 gRPC 服务器，如下所示：

 ```typescript title="main.ts"
import { ReflectionService } from '@grpc/reflection';

const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
  options: {
    onLoadPackageDefinition: (pkg, server) => {
      new ReflectionService(pkg).addToServer(server);
    },
  },
});
```

现在您的服务器将能够根据反射规范响应请求 API 详情的消息。

#### gRPC 流式传输

gRPC 本身支持长期实时连接，通常称为`流(streams)`。流式传输适用于聊天、观察或分块数据传输等场景。更多细节请参阅官方文档[此处](https://grpc.io/docs/guides/concepts/) 。

Nest 支持两种 GRPC 流处理方式：

- RxJS `Subject` + `Observable` 处理程序：可直接在控制器方法内编写响应，或传递给 `Subject`/`Observable` 消费者
- 纯 GRPC 调用流处理器：可将其传递给某些执行器，该执行器将处理 Node 标准 `Duplex` 流处理器的其余分发工作。

#### 流式传输示例

让我们定义一个名为 `HelloService` 的新示例 gRPC 服务。`hello.proto` 文件使用 [protocol buffers](https://developers.google.com/protocol-buffers) 构建结构。其内容如下：

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

info **提示**由于返回的流可以发出多个值，`LotsOfGreetings` 方法可以简单地用 `@GrpcMethod` 装饰器实现（如上文示例所示）。

基于这个 `.proto` 文件，我们来定义 `HelloService` 接口：

```typescript
interface HelloService {
  bidiHello(upstream: Observable<HelloRequest>): Observable<HelloResponse>;
  lotsOfGreetings(
    upstream: Observable<HelloRequest>
  ): Observable<HelloResponse>;
}

interface HelloRequest {
  greeting: string;
}

interface HelloResponse {
  reply: string;
}
```

:::info 提示
proto 接口可以通过 [ts-proto](https://github.com/stephenh/ts-proto) 包自动生成，了解更多 [here](https://github.com/stephenh/ts-proto/blob/main/NESTJS.markdown)。
:::

#### 主题策略

`@GrpcStreamMethod()` 装饰器将函数参数作为 RxJS 的 `Observable` 提供。因此，我们可以接收并处理多条消息。

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

:::warning 警告
为了支持与 `@GrpcStreamMethod()` 装饰器的全双工交互，控制器方法必须返回一个 RxJS 的 `Observable` 对象。
:::

:::info 提示
`Metadata` 和 `ServerUnaryCall` 类/接口是从 `grpc` 包中导入的。
:::

根据服务定义（在 `.proto` 文件中），`BidiHello` 方法应该向服务端流式传输请求。为了从客户端向流发送多个异步消息，我们利用了 RxJS 的 `ReplaySubject` 类。

```typescript
const helloService = this.client.getService<HelloService>('HelloService');
const helloRequest$ = new ReplaySubject<HelloRequest>();

helloRequest$.next({ greeting: 'Hello (1)!' });
helloRequest$.next({ greeting: 'Hello (2)!' });
helloRequest$.complete();

return helloService.bidiHello(helloRequest$);
```

在上面的示例中，我们向流写入了两条消息（`next()` 调用）并通知服务端已完成数据发送（`complete()` 调用）。

#### 调用流处理器

当方法返回值定义为 `stream` 时，`@GrpcStreamCall()` 装饰器会将函数参数作为 `grpc.ServerDuplexStream` 提供，它支持标准方法如 `.on('data', callback)`、`.write(message)` 或 `.cancel()`。完整的方法文档可查阅[此处](https://grpc.github.io/grpc/node/grpc-ClientDuplexStream.html) 。

或者，当方法返回值不是 `stream` 时，`@GrpcStreamCall()` 装饰器会提供两个函数参数，分别是 `grpc.ServerReadableStream`（详见[此处](https://grpc.github.io/grpc/node/grpc-ServerReadableStream.html) ）和 `callback`。

让我们从实现支持全双工交互的 `BidiHello` 开始。

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

:::info 注意
该装饰器不需要提供任何特定的返回参数。预期该流将像处理其他标准流类型一样被处理。
:::


在上面的示例中，我们使用了 `write()` 方法将对象写入响应流。作为第二个参数传入 `.on()` 方法的回调函数会在服务每次接收到新数据块时被调用。

让我们实现 `LotsOfGreetings` 方法。

```typescript
@GrpcStreamCall()
lotsOfGreetings(requestStream: any, callback: (err: unknown, value: HelloResponse) => void) {
  requestStream.on('data', message => {
    console.log(message);
  });
  requestStream.on('end', () => callback(null, { reply: 'Hello, world!' }));
}
```

这里我们使用 `callback` 回调函数在 `requestStream` 处理完成后发送响应。

#### 健康检查

在 Kubernetes 等编排器中运行 gRPC 应用时，可能需要确认其是否正常运行且状态健康。[gRPC 健康检查规范](https://grpc.io/docs/guides/health-checking/)作为标准协议，允许 gRPC 客户端暴露健康状态，使编排器能够据此采取相应措施。

要添加 gRPC 健康检查支持，首先安装 [grpc-node](https://github.com/grpc/grpc-node/tree/master/packages/grpc-health-check) 包：

```bash
$ npm i --save grpc-health-check
```

随后可通过 gRPC 服务器选项中的 `onLoadPackageDefinition` 钩子将其集成到 gRPC 服务中，如下所示。注意 `protoPath` 需同时包含健康检查与 hero 包的定义。

 ```typescript title="main.ts"
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

:::info 提示
[gRPC 健康探针](https://github.com/grpc-ecosystem/grpc-health-probe)是一个实用的 CLI 工具，可用于容器化环境中测试 gRPC 健康检查。
:::



#### gRPC 元数据

元数据是以键值对列表形式存在的特定 RPC 调用相关信息，其中键为字符串，值通常是字符串但也可以是二进制数据。元数据对 gRPC 本身是不透明的——它允许客户端向服务器提供与调用相关的信息，反之亦然。元数据可能包含认证令牌、用于监控的请求标识符和标签，以及数据集记录数等数据信息。

要在 `@GrpcMethod()` 处理程序中读取元数据，请使用第二个参数(metadata)，其类型为从 `grpc` 包导入的 `Metadata`。

要从处理程序返回元数据，请使用 `ServerUnaryCall#sendMetadata()` 方法（处理程序的第三个参数）。

 ```typescript title="heroes.controller.ts"
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
```

同样地，要读取带有 `@GrpcStreamMethod()` 注解的处理程序（ [主题策略](#主题策略) ）中的元数据，需使用第二个参数（metadata），其类型为 `Metadata`（从 `grpc` 包导入）。

要从处理程序返回元数据，请使用 `ServerDuplexStream#sendMetadata()` 方法（第三个处理程序参数）。

要从[调用流处理程序](#调用流处理程序) （带有 `@GrpcStreamCall()` 装饰器注解的处理程序）内部读取元数据，需监听 `requestStream` 引用上的 `metadata` 事件，如下所示：

```typescript
requestStream.on('metadata', (metadata: Metadata) => {
  const meta = metadata.get('X-Meta');
});
```
