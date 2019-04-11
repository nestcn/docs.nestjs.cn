# 微服务

## 基本

Nest 微服务是一种使用与 HTTP 不同的传输层的应用程序。

![](https://docs.nestjs.com/assets/Microservices_1.png)

### 安装

首先，我们需要安装所需的软件包：

```
$ npm i --save @nestjs/microservices
```

### 概述

通常，Nest支持一系列内置的传输器。它们基于 **请求-响应** 范式，整个通信逻辑隐藏在抽象层之后。多亏了这一点，您可以轻松地在传输器之间切换，而无需更改任何代码行。我们不支持具有基于日志的持久性的流平台，例如 [Kafka](https://docs.confluent.io/3.0.0/streams/)或 [NATS](https://github.com/nats-io/node-nats-streaming)流，因为它们是为解决不同范围的问题而创建的。但是，您仍然可以通过使用执行上下文功能将它们与Nest一起使用。

为了创建微服务，我们使用 `NestFactory` 类的 `createMicroservice()` 方法。默认情况下，微服务通过 **TCP协议** 监听消息。

> main.ts

```typescript
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { ApplicationModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(ApplicationModule, {
    transport: Transport.TCP,
  });
  app.listen(() => console.log('Microservice is listening'));
}
bootstrap();
```

`createMicroservice ()` 方法的第二个参数是options对象。此对象可能有两个成员:

|                      |                                  |
| :------------------- | :------------------------------- |
| `transport`          | 指定传输器                         |
| `options`            | 确定传输器行为的传输器特定选项对象     |


`options` 对象根据所选的传送器而不同。TCP传输器暴露了下面描述的几个属性。

|                        |                            |
| :--------------------- | :------------------------- |
| `host`                 | 连接主机名                   |
| `port`                 | 连接端口                     |
| `retryAttempts`        | 连接尝试的总数                |
| `retryDelay`           | 连接重试延迟（ms）            |

### 模式（patterns）

微服务通过 **模式** 识别消息。模式是一个普通值，例如对象、字符串或甚至数字。为了创建模式处理程序，我们使用从 `@nestjs/microservices` 包的 `@MessagePattern()` 装饰器。

>  math.controller.ts

```typescript
import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class MathController {
  @MessagePattern({ cmd: 'sum' })
  sum(data: number[]): number {
    return (data || []).reduce((a, b) => a + b);
  }
}
```

`sum ()` 处理程序正在监听符合 `cmd :'sum'` 模式的消息。模式处理程序采用单个参数，即从客户端传递的 `data` 。在这种情况下，数据是必须累加的数字数组。

### 异步响应

每个模式处理程序都能够同步或异步响应。因此，支持 `async` (异步)方法。

> math.controller.ts

```typescript
@MessagePattern({ cmd: 'sum' })
async sum(data: number[]): Promise<number> {
  return (data || []).reduce((a, b) => a + b);
}
```

此外，我们能够返回 [Rx](https://github.com/reactivex/rxjs) `Observable`，因此这些值将被发出，直到流完成。

> math.controller.ts

```typescript
@MessagePattern({ cmd: 'sum' })
sum(data: number[]): Observable<number> {
  return from([1, 2, 3]);
}
```

以上消息处理程序将响应3次(对数组中的每个项)。

### 客户端

为了连接 Nest 的微服务，我们使用 `ClientProxy` 类，该类实例通过 `@Client()` 装饰器分配给属性。这个装饰器只需要一个参数。即与 Nest 微服务选项对象相同的对象。

```typescript
@Client({ transport: Transport.TCP })
client: ClientProxy;
```

!> `@Client()` 和 `ClientProxy` 需要引入 `@nestjs/microservices` 。

另一种解决方案是 ClientProxy 使用 ClientProxyFactory（从 @nestjs/microservices 包中导出）手动创建实例。

```typescript
constructor() {
  this.client = ClientProxyFactory.create({
    transport: Transport.TCP
  });
}
```

ClientProxy 是惰性的。它不会立即启动连接。相反，它将在第一次微服务请求之前建立，然后在每次后续请求中重复使用。但是，如果要延迟应用程序的引导过程并手动初始化连接，则可以在 OnModuleInit 生命周期钩子中使用函数 connect()。

```typescript
async onModuleInit() {
  await this.client.connect();
}
```
如果无法创建连接，则该 `connect()` 方法将拒绝相应的错误对象。

该 `ClientProxy` 公开了一个 `send()` 方法。此方法旨在调用微服务并返回 `Observable` 其响应，这意味着，我们可以轻松地订阅发出的值。

```typescript
@Get()
call(): Observable<number> {
  const pattern = { cmd: 'sum' };
  const payload = [1, 2, 3];
  return this.client.send<number>(pattern, payload);
}
```
send() 函数接受两个参数，pattern 和 payload。模式必须等于 @MessagePattern() 修饰符中定义的这个模式，而 payload 是我们想要传输到另一个微服务的消息


## Redis

第二个内置传输器基于 [Redis](https://redis.io/) 数据库。此传输器利用发布/订阅功能。

![](https://docs.nestjs.com/assets/Redis_1.png)

### 安装

在开始之前，我们必须安装所需的软件包:

```
$ npm i --save redis
```

### 概述

为了从TCP传输策略切换到Redis **pub/sub**，我们需要更改传递给 `createMicroservice()` 方法的选项对象。

> main.ts

```typescript
const app = await NestFactory.createMicroservice(ApplicationModule, {
  transport: Transport.REDIS,
  options: {
    url: 'redis://localhost:6379',
  },
});
```

### 选项

有许多可用的选项可以确定传输器的行为。

|                        |                             |
| :--------------------- | :-------------------------- |
| `url`                  | 连接网址                     |
| `retryAttempts`        | 连接尝试的总数                |
| `retryDelay`           | 连接重试延迟（ms）            |

## MQTT

[MQTT](http://mqtt.org/)是一个轻量级消息协议，用于高延迟优化。（译者注：MQTT 协议在智能家居等硬件通信领域十分广泛，是首选协议）

### 安装

在我们开始之前，我们必须安装所需的包：

```
npm i --save mqtt
```
### 概览

为了切换到 `MQTT` 传输协议，我们需要修改传递给该 `createMicroservice()` 函数的选项对象。

> main.ts

```typescript
const app = await NestFactory.createMicroservice(ApplicationModule, {
  transport: Transport.MQTT,
  options: {
    host: 'localhost',
    port: 1883,
  },
});
```
### 选项

有很多可用的选项可以决定传输器的行为。更多描述请[查看](https://github.com/mqttjs/MQTT.js)。


## NATS

[NATS](https://nats.io) 是一个简单、高性能的开源消息传递系统。

### 安装

在开始之前，我们必须安装所需的软件包:

```
$ npm i --save nats
```

### 概述

为了切换到 **NATS** 传输器，我们需要修改传递到 `createMicroservice()` 方法的选项对象。

> main.ts

```typescript
const app = await NestFactory.createMicroservice(ApplicationModule, {
  transport: Transport.NATS,
  options: {
    url: 'nats://localhost:4222',
  },
});
```

### 选项

有许多可用的选项可以确定传输器的行为。它们在 [这里](https://github.com/nats-io/node-nats#connect-options) 有很好的描述。

## RabbitMQ

[RabbitMQ](https://www.rabbitmq.com/) 是部署最广泛的开源消息代理。

### 安装

在开始之前，我们必须安装所需的包：

```bash
$ npm i --save amqplib amqp-connection-manager
```

### 传输器

为了切换到 RabbitMQ 传输器，我们需要修改传递给该 createMicroservice() 方法的属性对象。

> main.ts

```typescript
const app = await NestFactory.createMicroservice(ApplicationModule, {
  transport: Transport.RMQ,
  options: {
    urls: [`amqp://localhost:5672`],
    queue: 'cats_queue',
    queueOptions: { durable: false },
  },
});
```

?> Transport 枚举 需要import  @nestjs/microservices 包。

### 属性


有许多可用属性可确定传输器行为。

|  |  | 
| :--- | ----: | 
| urls |	连接地址 |
| queue |	您的服务器将监听的队列名称 |
| prefetchCount |	设置通道的预取计数 |
| isGlobalPrefetchCount	 | 启用每个通道预取|
| queueOptions |	其他队列选项。它们在[这里](https://www.squaremobius.net/amqp.node/channel_api.html#assertQueue)有很好的描述 |
| socketOptions	 | 其他套接字选项。它们在[这里](https://www.squaremobius.net/amqp.node/channel_api.html#socket-options)有很好的描述 |



## gRPC

[gRPC](https://github.com/grpc/grpc-node) 是一个高性能、开源的通用RPC框架。

### 安装

在开始之前，我们必须安装所需的软件包:

```
$ npm i --save grpc @grpc/proto-loader
```

### 传输器

为了切换到 **gRPC** 传输器，我们需要修改传递到 `createMicroservice()` 方法的选项对象。

> main.ts

```typescript
const app = await NestFactory.createMicroservice(ApplicationModule, {
  transport: Transport.GRPC,
  options: {
    package: 'hero',
    protoPath: join(__dirname, 'hero/hero.proto'),
  },
});
```

!> 该 join() 功能使用import path 封装，而 Transport枚举是从 @nestjs/microservices 而来。

### 选项

|                |                         |
| :------------- | :---------------------- |
| `url`          | 连接网址               |
|`protoLoader`| NPM包名称（如果要使用其他原型加载器） |
| `protoPath`    | 绝对（或相对于根目录） `.proto` 文件的路径 |
|`loader` | @grpc/proto-loader 选项。[了解更多](https://github.com/grpc/grpc-node/tree/master/packages/grpc-protobufjs#usage) |
| `package`      | `protobuf` 包名       |
| `credentials`  | 服务器证书([阅读更多](https://grpc.io/grpc/node/grpc.ServerCredentials.html))

### 概述

通常，`package` 属性设置 [protobuf](https://developers.google.com/protocol-buffers/docs/proto) 包名称，而 `protoPath` 是 `.proto` 文件的路径。`hero.proto` 文件是使用协议缓冲区语言构建的。

> hero.proto

```
syntax = "proto3";

package hero;

service HeroService {
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

在上面的示例中，我们定义了一个 `HeroService`，它暴露了一个 `FindOne()` gRPC处理程序，该处理程序期望 `HeroById` 作为输入并返回一个 `Hero` 消息。为了定义一个能够实现这个 protobuf 定义的处理程序，我们必须使用 `@GrpcRoute()` 装饰器。之前的 `@MessagePattern()` 将不再有用。

> hero.controller.ts

```typescript
@GrpcMethod('HeroService', 'FindOne')
findOne(data: HeroById, metadata: any): Hero {
  const items = [
    { id: 1, name: 'John' },
    { id: 2, name: 'Doe' },
  ];
  return items.find(({ id }) => id === data.id);
}
```

!> `@GrpcRoute()` 需要引入 `@nestjs/microservices` 。

`HeroService` 是服务的名称，而 `FindOne` 指向 `FindOne()` gRPC处理程序。对应的 `findOne()` 方法接受两个参数，即从调用方传递的 `data` 和存储gRPC请求元数据的 `metadata`。

此外，`FindOne` 这里实际上是多余的。如果没有传递第二个参数 `@GrpcMethod()`，Nest 将自动使用带有大写首字母的方法名称，例如 findOne-> FindOne 。

> hero.controller.ts

```typescript
@Controller()
export class HeroService {
  @GrpcMethod()
  findOne(data: HeroById, metadata: any): Hero {
    const items = [
      { id: 1, name: 'John' },
      { id: 2, name: 'Doe' },
    ];
    return items.find(({ id }) => id === data.id);
  }
}
```

同样，您可能不会传递任何参数。在这种情况下，Nest将使用类名。

> hero.controller.ts

```typescript
@Controller()
export class HeroService {
  @GrpcMethod()
  findOne(data: HeroById, metadata: any): Hero {
    const items = [
      { id: 1, name: 'John' },
      { id: 2, name: 'Doe' },
    ];
    return items.find(({ id }) => id === data.id);
  }
}
```

### 客户端

为了创建客户端实例，我们需要使用 `@Client()` 装饰器。

> hero.controller.ts

```typescript
@Client({
  transport: Transport.GRPC,
  options: {
    package: 'hero',
    protoPath: join(__dirname, 'hero/hero.proto'),
  },
})
client: ClientGrpc;
```

与前面的例子相比有一点差别。我们使用提供 `getService()` 方法的 `ClientGrpc`，而不是 `ClientProxy` 类。`getService()` 泛型方法将服务的名称作为参数，并返回其实例(如果可用)。

> hero.controller.ts

```typescript
onModuleInit() {
  this.heroService = this.client.getService<HeroService>('HeroService');
}
```

`heroService` 对象暴露了 `.proto` 文件中定义的同一组方法。注意，所有这些都是 **小写** (为了遵循自然惯例)。基本上，我们的gRPC `HeroService` 定义包含 `FindOne()` 函数。这意味着 `heroService` 实例将提供 `findOne()` 方法。

```typescript
interface HeroService {
  findOne(data: { id: number }): Observable<any>;
}
```

所有服务的方法都返回 `Observable`。由于 Nest 支持 [RxJS](https://github.com/reactivex/rxjs) 流并且与它们很好地协作，所以我们也可以在HTTP处理程序中返回它们。

> hero.controller.ts

```typescript
@Get()
call(): Observable<any> {
  return this.heroService.findOne({ id: 1 });
}
```

[这里](https://github.com/nestjs/nest/tree/master/sample/04-grpc) 提供了一个完整的示例。

## 异常过滤器 (Exception filters)

HTTP异常过滤器层和相应的微服务层之间的唯一区别在于，不要使用 `HttpException`，而应该使用 `RpcException`。

```typescript
throw new RpcException('Invalid credentials.');
```

?> `RpcException` 类是从 `@nestjs/microservices` 包导入的。

Nest将处理引发的异常，并因此返回具有以下结构的 `error` 对象:

```
{
  status: 'error',
  message: 'Invalid credentials.'
}
```

### 过滤器

**异常过滤器** 的工作方式与主过滤器相同，只有一个小的区别。`catch()` 方法必须返回一个 `Observable`。

> rpc-exception.filter.ts

```typescript
import { Catch, RpcExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { RpcException } from '@nestjs/microservices';

@Catch(RpcException)
export class ExceptionFilter implements RpcExceptionFilter<RpcException> {
  catch(exception: RpcException, host: ArgumentsHost): Observable<any> {
    return throwError(exception.getError());
  }
}
```

!> 不能设置全局的微服务异常过滤器。

下面是一个使用手动实例化 **方法作用域** 过滤器(也可以使用类作用域)的示例:

```typescript
@UseFilters(new ExceptionFilter())
@MessagePattern({ cmd: 'sum' })
sum(data: number[]): number {
  return (data || []).reduce((a, b) => a + b);
}
```

### 继承

通常，您将创建完全自定义的异常过滤器，以满足您的应用程序要求。虽然您希望重用已经实现的核心异常过滤器并根据某些因素覆盖行为，但可能存在用例。

为了将异常处理委托给基本过滤器，您需要扩展 `BaseExceptionFilter` 并调用继承的 `catch()` 函数。此外，`HttpServer` 必须注入并传递给 `super()` 调用。

```typescript
import { Catch, ArgumentsHost } from '@nestjs/common';
import { BaseRpcExceptionFilter } from '@nestjs/microservices';

@Catch()
export class AllExceptionsFilter extends BaseRpcExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    return super.catch(exception, host);
  }
}
```

显然，您应该使用您量身定制的业务逻辑（例如添加各种条件）来增强上述实现。


## 管道 (Pipes)

微服务管道和普通管道没有区别。唯一需要注意的是，不要抛出 `HttpException` ，而应该使用 `RpcException`。

?> `RpcException` 类是从 `@nestjs/microservices` 包引入的。

下面是一个使用手动实例化 **方法作用域** 管道(也可以使用类作用域)的示例:

```typescript
@UsePipes(new ValidationPipe())
@MessagePattern({ cmd: 'sum' })
sum(data: number[]): number {
  return (data || []).reduce((a, b) => a + b);
}
```

## 看守器 (Guards)

微服看守器和普通看守器没有区别。唯一需要注意的是，不要抛出 `HttpException` ，而应该使用 `RpcException`。

?> `RpcException` 类是从 `@nestjs/microservices` 包引入的。

下面是一个使用 **方法作用域** 看守器(也可以使用类作用域)的示例:

```typescript
@UseGuards(AuthGuard)
@MessagePattern({ cmd: 'sum' })
sum(data: number[]): number {
  return (data || []).reduce((a, b) => a + b);
}
```

## 拦截器 (Interceptors)

常规拦截器和微服务拦截器之间没有区别。下面是一个使用手动实例化 **方法作用域** 拦截器(也可以使用类作用域)的示例:

```typescript
@UseInterceptors(new TransformInterceptor())
@MessagePattern({ cmd: 'sum' })
sum(data: number[]): number {
  return (data || []).reduce((a, b) => a + b);
}
```
 ### 译者署名

| 用户名 | 头像 | 职能 | 签名 |
|---|---|---|---|
| [@zuohuadong](https://github.com/zuohuadong)  | <img class="avatar-66 rm-style" src="https://wx3.sinaimg.cn/large/006fVPCvly1fmpnlt8sefj302d02s742.jpg">  |  翻译  | 专注于 caddy 和 nest，[@zuohuadong](https://github.com/zuohuadong/) at Github  |
| [@Drixn](https://drixn.com/)  | <img class="avatar-66 rm-style" src="https://cdn.drixn.com/img/src/avatar1.png">  |  翻译  | 专注于 nginx 和 C++，[@Drixn](https://drixn.com/) |
