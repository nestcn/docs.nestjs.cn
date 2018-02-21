# 微服务

## 基本

「微服务」在这里不是合适的词。实际上，Nest microservice 只是一个使用不同传输层（不是HTTP）的应用程序。、

![](https://docs.nestjs.com/assets/Microservices_1.png)

Nest 提供两种通信支持 - TCP 和 Redis pub/sub，但通过 CustomTransportStrategy 接口很容易实现新的传输策略。要创建 Nest 微服务，我们使用包 @nestjs/core 中的 NestFactory 。

我们来创建一个简单的微服务，它将通过 TCP 协议来侦听消息。我们要从 bootstrap() 功能开始。

> main.ts

```typescript
import { NestFactory } from '@nestjs/core';
import { ApplicationModule } from './app.module';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(ApplicationModule, {
    transport: Transport.TCP,
  });
  app.listen(() => console.log('Microservice is listening'));
}
bootstrap();
```

!> Transport 是一个帮助器枚举。

该 createMicroservice() 方法的第二个参数是一个选项对象。该对象可能有3个成员：

|||
|----|----|
|transport |指定传输方法（Transport.TCP 或者 Transport.REDIS 可以立即使用）
|port | 确定要使用的端口 |
| url | 确定使用 * 仅用于 Redis 的 url。 |
| strategy | 确定使用 * 仅用于自定义策略的策略|


### 模式（Patterns）

Nest 的 microService 通过识别消息模式。该模式是一个普通的 JavaScript 值 - 对象，字符串甚至数字。
要创建模式处理程序, 我们正在使用从 @nestjs/microservices 包中导入的 @MessagePattern () 修饰器。

> math.controller.ts

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

!> 我们只能在 @Controller() 类中注册模式处理程序。

上述处理程序正在监听满足该c md: 'sum' 模式的消息。每个模式处理程序都有一个参数，data 从客户端传递。在这种情况下，数据是一组数字，必须累积。

### 异步响应

每个模式处理程序都可以async，所以你可以返回 Promise。而且，你可以返回 RxJS Observable，所以这些值将被返回，直到流完成。

> math.controller.ts

```typescript
@MessagePattern({ cmd: 'sum' })
sum(data: number[]): Observable<number> {
  return Observable.from([1, 2, 3]);
}
```

上面的消息处理程序将响应3次（来自数组中的每个项）。

### 客户端

要连接 Nest microservice，我们使用的是 ClientProxy 类，由 @Client()decorator 将该实例分配给属性。这个装饰器接受与 Nest microservice 选项对象相同的对象的单个参数。

```typescript
@Client({ transport: Transport.TCP, port: 5667 })
client: ClientProxy
```

!> 这两种 @Client() 装饰器和 ClientProxy 从 @nestjs/microservices 包引入。

该 ClientProxy 有一个 send() 方法。此方法旨在调用微服务并返回 Observable 响应。

```typescript
@Get()
call(): Observable<number> {
  const pattern = { cmd: 'sum' };
  const data = [1, 2, 3, 4, 5];

  return this.client.send<number>(pattern, data);
}
```

它需要2个参数, 模式 和 data。模式必须与 @MessagePattern() 修饰符中声明的样式相同。就这样。


## Redis

还有另一种方式可以与 Nest 微服务 一起使用。我们可以使用伟大的 Redis 功能 - 发布/订阅 （publish / subscribe）来代替 TCP 通信 。

![](https://docs.nestjs.com/assets/Redis_1.png)

要从TCP传输策略切换到 Redis pub/sub，我们只需要更改传递给 createMicroservice() 方法的选项对象即可。

> main.ts

```typescript
const app = await NestFactory.createMicroservice(ApplicationModule, {
  transport: Transport.REDIS,
  url: 'redis://localhost:6379',
});
```

?> 不要忘记更改 Transport.REDIS 的 @Client() 装饰器。

## 异常过滤器

websockets 异常层的工作原理与 prime 层完全相同。唯一的区别是 不要使用 HttpException，你应该使用 RpcException 。

```typescript
throw new RpcException('Invalid credentials.');
```

?> 该 RpcException 类需要引入 @nestjs/microservices 包。


Nest 会处理这个异常并使用 exception 发出带有以下数据的消息：

```typescript
{
  status: 'error',
  message: 'Invalid credentials.'
}
```

该异常过滤器是也很相似，其工作方式与主程序完全相同。唯一的区别是该catch()方法应该返回一个 Observable。

> RPC-exception.filter.ts

```typescript
import { Catch, RpcExceptionFilter } from '@nestjs/common';
import { Observable } from 'rxjs/Observable';
import { RpcException } from '@nestjs/microservices';
import 'rxjs/add/observable/throw';

@Catch(RpcException)
export class ExceptionFilter implements RpcExceptionFilter {
  catch(exception: RpcException): Observable<any> {
    return Observable.throw(exception.getError());
  }
}
```

!> 全局设置微服务异常过滤器是不可能的。


## 管道

微服务管道和普通管道没有区别。你应该知道的唯一一件事情就是，不要使用 HttpException，你应该使用 RpcException。

!> RpcException 需要引入 @nestjs/microservices。

## 看守器

常规看守器和微服务看守器之间有一个区别。微服务看守器 data 从客户端传递而不是将 expressjs 请求对象作为 canActivate() 函数的参数。另外，当看守器返回时 false，它会抛出 RpcException（而不是 HttpException）。

!> RpcException 需要引入 @nestjs/microservices。

## 拦截器

常规拦截器和微服务拦截器 之间有一个区别。微服务拦截器 data 从客户端传递而不是将 expressjs 请求对象作为 intercept() 函数的参数。

## 自定义传输

Nest具有通过 TCP 和 Redis 的内置传输，但其他通信方案可以通过 CustomTransportStrategy 接口实现。出于演示目的，我们将使用 ampqlib 库移植RabbitMQ 传输策略。

### 服务器

让我们从将传入消息与正确消息处理程序匹配的 RabbitMQServer 开始。

> rabbitmq-server.ts

```typescript
import * as amqp from 'amqplib';
import { Server, CustomTransportStrategy } from '@nestjs/microservices';
import { Observable } from 'rxjs/Observable';

export class RabbitMQServer extends Server implements CustomTransportStrategy {
    private server: amqp.Connection = null;
    private channel: amqp.Channel = null;

    constructor(
      private readonly host: string,
      private readonly queue: string) {
        super();
      }

  public async listen(callback: () => void) {
    await this.init();
    this.channel.consume(`${this.queue}_sub`, this.handleMessage.bind(this), {
      noAck: true,
    });
  }

  public close() {
    this.channel && this.channel.close();
    this.server && this.server.close();
  }

  private async handleMessage(message) {
    const { content } = message;
    const messageObj = JSON.parse(content.toString());

    const handlers = this.getHandlers();
    const pattern = JSON.stringify(messageObj.pattern);
    if (!this.messageHandlers[pattern]) {
        return;
    }

    const handler = this.messageHandlers[pattern];
    const response$ = this.transformToObservable(await handler(messageObj.data)) as Observable<any>;
    response$ && this.send(response$, (data) => this.sendMessage(data));
  }

  private sendMessage(message) {
    const buffer = Buffer.from(JSON.stringify(message));
    this.channel.sendToQueue(`${this.queue}_pub`, buffer);
  }

  private async init() {
    this.server = await amqp.connect(this.host);
    this.channel = await this.server.createChannel();
    this.channel.assertQueue(`${this.queue}_sub`, { durable: false });
    this.channel.assertQueue(`${this.queue}_pub`, { durable: false });
  }
}
```

CustomTransportStrategy 强制执行两种基本方法 listen() 和 close()。此外, RabbitMQServer 将扩展抽象 server 类。此类提供核心getHandlers()和send()方法, 以及帮助器 transformToObservable () 方法。

最后一步是设置 RabbitMQServer:

> main.ts

```typescript
const app = await NestFactory.createMicroservice(ApplicationModule, {
    strategy: new RabbitMQServer('amqp://localhost', 'channel'),
});
```

### 客户端

RabbitMQ 服务器正在侦听消息。现在是创建客户端类的时候了, 它将扩展抽象 ClientProxy 类。为了使其正常工作, 我们只需要重写 sendSingleMessage() 方法。

> rabbitmq-client.ts

```typescript
import * as amqp from 'amqplib';
import { ClientProxy } from '@nestjs/microservices';

export class RabbitMQClient extends ClientProxy {
  constructor(
    private readonly host: string,
    private readonly queue: string) {
      super();
    }

  protected async sendSingleMessage(messageObj, callback: (err, result, disposed?: boolean) => void) {
    const server = await amqp.connect(this.host);
    const channel = await server.createChannel();

    const { sub, pub } = this.getQueues();
    channel.assertQueue(sub, { durable: false });
    channel.assertQueue(pub, { durable: false });

    channel.consume(pub, (message) => this.handleMessage(message, server, callback), { noAck: true });
    channel.sendToQueue(sub, Buffer.from(JSON.stringify(messageObj)));
  }

  private handleMessage(message, server, callback: (err, result, disposed?: boolean) => void) {
    const { content } = message;
    const { err, response, disposed } = JSON.parse(content.toString());
    if (disposed) {
        server.close();
    }
    callback(err, response, disposed);
  }

  private getQueues() {
    return { pub: `${this.queue}_pub`, sub: `${this.queue}_sub` };
  }
}
```

早些时候, Nest 负责创建客户端类的实例。我们一直在使用 @Client() 装饰器。现在, 当我们创建了自己的解决方案时, 我们只需使用 new 运算符就可以直接创建 RabbitMQClient 实例。

```typescript
this.client = new RabbitMQClient('amqp://localhost', 'example');
```

