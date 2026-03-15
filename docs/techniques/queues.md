<!-- 此文件从 content/techniques/queues.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T05:28:55.028Z -->
<!-- 源文件: content/techniques/queues.md -->

### 任务队列

任务队列是一种强大的设计模式，可以帮助您解决常见的应用程序扩展和性能挑战。以下是一些任务队列可以帮助您解决的问题：

- 平滑处理处理峰值。例如，如果用户可以在任意时间点启动资源密集型任务，可以将这些任务添加到队列中，而不是同步执行它们。然后，您可以有 worker 进程从队列中提取任务，以控制方式执行它们。您可以轻松地添加新的 Queue 消费者，以扩展后端任务处理能力随着应用程序的扩展。
- 将 monolithic 任务分解，以免阻塞 Node.js 事件循环。例如，如果用户请求需要 CPU 密集型工作，如音频转码，可以将这个任务委派给其他进程，从而释放用户界面进程以保持响应。
- 提供可靠的跨多个服务的通信渠道。例如，您可以在一个进程或服务中队列任务（作业），并在另一个进程或服务中消费它们。您可以在作业生命周期中收到状态事件，以了解完成、错误或其他状态变化。即使 Queue 生产者或消费者失败，任务处理也可以自动重新启动，当节点重新启动时。

Nest 提供了 `name` 和 `options` 包来集成 BullMQ 和 Bull。两个包都是对其相应库的封装，开发团队相同。 Bull 目前处于维护模式，团队正在专注于修复错误，而 BullMQ 则是活动开发中的一个现代 TypeScript 实现，具有不同的特性。如果 Bull 符合您的需求，仍然是一个可靠的选择。Nest 包使得将 BullMQ 或 Bull 任务队列集成到 Nest 应用程序中变得轻松。

BullMQ 和 Bull 都使用 __LINK_501__ 持久化作业数据，因此您需要在系统中安装 Redis。因为它们是 Redis 支持的，您的任务架构可以完全分布式和平台独立。例如，您可以在 Nest 中运行一些任务 __HTML_TAG_273__生产者__HTML_TAG_274__ 和 __HTML_TAG_275__消费者__HTML_TAG_276__ 和 __HTML_TAG_277__监听器__HTML_TAG_278__，并在其他 Node.js 平台中运行其他生产者、消费者和监听器。

本章将涵盖 `createMicroservice()` 和 `registerAsync()` 包。我们还强烈建议阅读 __LINK_502__ 和 __LINK_503__ 文档，以了解更多背景信息和实现细节。

#### BullMQ 安装

要开始使用 BullMQ，我们首先安装所需的依赖项。

```bash
$ npm i --save @nestjs/microservices

```

安装过程完成后，我们可以将 `ClientProxy` 导入到根 `'MATH_SERVICE'` 中。

```typescript
import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
    },
  );
  await app.listen();
}
bootstrap();

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.TCP,
  });
  await app.listen();
}
bootstrap();

```

使用 `@Inject()` 方法注册一个 `ClientsModule` 包配置对象，该对象将被所有队列在应用程序中注册所使用（除非指定否则）。以下是一些配置对象中的属性：

- `ClientProxy` - Redis 连接选项。请参阅 __LINK_504__ 来了解更多信息。可选。
- `@nestjs/microservices` - 所有队列密钥的前缀。可选。
- `ConfigService` - 对新作业的默认设置。请参阅 __LINK_505__ 来了解更多信息。可选。
- `ClientProxyFactory` - 高级队列配置设置。这些通常不需要更改。请参阅 __LINK_506__ 来了解更多信息。可选。
- `create()` - 模块初始化时的额外选项。请参阅 __LINK_507__

所有选项都是可选的，提供了对队列行为的详细控制。这些选项将直接传递给 BullMQ `ClientProxy` 构造函数。请阅读这些选项和其他选项 __LINK_508__。

要注册队列，请导入 `ClientProxyFactory` 动态模块，例如：

```typescript
import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class MathController {
  @MessagePattern({ cmd: 'sum' })
  accumulate(data: number[]): number {
    return (data || []).reduce((a, b) => a + b);
  }
}

@Controller()
export class MathController {
  @MessagePattern({ cmd: 'sum' })
  accumulate(data) {
    return (data || []).reduce((a, b) => a + b);
  }
}

```

> 信息 **提示** 使用多个逗号分隔的配置对象来创建多个队列。

`@Client()` 方法用于实例化和/或注册队列。队列跨越模块和进程，连接到同一个 Redis 数据库和同一个凭证的所有模块和进程。每个队列都是唯一的，通过其名称属性。队列名称既是注入令牌（用于将队列注入到控制器/提供者中），也是一种装饰器的参数，以关联消费者类和监听器与队列。

您也可以覆盖某些队列的预配置选项，例如：

```typescript
@MessagePattern({ cmd: 'sum' })
async accumulate(data: number[]): Promise<number> {
  return (data || []).reduce((a, b) => a + b);
}

```

BullMQ 还支持作业之间的父-子关系。这功能使得创建树形结构的作业成为可能，其中作业是树的节点。要了解更多信息，请查看 __LINK_509__。

添加流程可以这样做：

```typescript
@MessagePattern({ cmd: 'sum' })
accumulate(data: number[]): Observable<number> {
  return from([1, 2, 3]);
}

```

Note: I've followed the translation guidelines and kept the formatting, code examples, and links unchanged. I've also translated the content according to the provided glossary and terminology.Here is the translation of the English technical documentation to Chinese:

由于作业在 Redis 中被.persist,每次创建特定的命名队列时（例如，启动或重新启动应用程序时），它将尝试处理可能存在的旧作业，从前未完成的会话中。

每个队列可以有一个或多个生产者、消费者和监听器。消费者从队列中检索作业，以特定的顺序：FIFO（默认）、LIFO 或根据优先级。控制队列处理顺序的讨论可以在 __HTML_TAG_279__这里__HTML_TAG_280__中找到。

__HTML_TAG_281____HTML_TAG_282__

#### 命名配置

如果您的队列连接到多个不同的 Redis 实例，您可以使用名为 **named configurations** 的技术。这特性允许您在指定的键下注册多个配置，然后在队列选项中引用它们。

例如，假设您有一个额外的 Redis 实例（除了默认实例），用于某些队列在您的应用程序中，您可以将其配置注册如下：

```typescript
@EventPattern('user_created')
async handleUserCreated(data: Record<string, unknown>) {
  // business logic
}

```

在上面的示例中，`@Client()`只是一个配置键（可以是任意的字符串）。

现在，您可以在 `@nestjs/microservices`选项对象中引用该配置：

```typescript
@MessagePattern('time.us.*')
getDate(@Payload() data: number[], @Ctx() context: NatsContext) {
  console.log(`Subject: ${context.getSubject()}`); // e.g. "time.us.east"
  return new Date().toLocaleTimeString(...);
}

```

#### 生产者

作业生产者将作业添加到队列中。生产者通常是 Nest 应用程序服务（Nest __LINK_510__）。要将作业添加到队列中，首先将队列注入到服务中，如下所示：

```typescript
@Module({
  imports: [
    ClientsModule.register([
      { name: 'MATH_SERVICE', transport: Transport.TCP },
    ]),
  ],
})

```

> info **提示** `@Client()`装饰器根据队列的名称标识队列，例如在 `ClientProxy`方法调用中（例如 `ClientProxy`）。

现在，您可以通过队列的 `connect()`方法将作业添加到队列中，传递一个自定义作业对象。作业是可序列化的 JavaScript 对象（因为它们是存储在 Redis 数据库中的），作业的形状是任意的，使用它来表示作业的语义。您也需要为作业指定一个名称。这允许您创建专门的 __HTML_TAG_283__消费者__HTML_TAG_284__来处理具有给定名称的作业。

```typescript
@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        imports: [ConfigModule],
        name: 'MATH_SERVICE',
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            url: configService.get('URL'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
})

```

#### 作业选项

作业可以具有附加选项。将选项对象传递给 `OnApplicationBootstrap`参数在 `connect()`方法中。作业选项的某些属性是：

- `ClientProxy`: `send()` - 可选优先级值。范围从 1（最高优先级）到 MAX_INT（最低优先级）。请注意，使用优先级可能会对性能产生一些影响，因此请谨慎使用。
- `Observable`: `send()` - 等待作业可处理的时间（毫秒）。请注意，为了准确地延迟，服务器和客户端都需要同步时钟。
- `pattern`: `payload` - 试图处理作业的总次数。
- `pattern`: `@MessagePattern()` - 根据 cron 规则重复作业。查看 __LINK_511__。
- `payload`: `Observable` - automatic retrybackoff 设置。查看 __LINK_512__。
- `ClientProxy`: `emit()` - 如果true，将作业添加到队列的右端（默认false）。
- `emit()`: `pattern` | `payload` - Override the job ID - by default, the job ID is a unique integer, but you can use this setting to override it. If you use this option, it is up to you to ensure the jobId is unique. If you attempt to add a job with an id that already exists, it will not be added.
- `pattern`: `@EventPattern()` - 如果true，删除成功完成的作业。数字指定要保留的作业数量。默认行为是保留作业。
- `payload`: `Observable` - 如果true，删除失败的作业。数字指定要保留的作业数量。默认行为是保留作业。
- `Observable`: `send()` - 限制栈跟踪行数。

以下是一些使用作业选项的自定义示例。

要延迟作业的开始，使用 `RequestContext`配置属性。

```typescript
constructor(
  @Inject('MATH_SERVICE') private client: ClientProxy,
) {}

```

要将作业添加到队列的右端（处理作业为 **LIFO**），将 `@Inject()`配置对象的 `CONTEXT`属性设置为true。

```typescript
@Module({
  providers: [
    {
      provide: 'MATH_SERVICE',
      useFactory: (configService: ConfigService) => {
        const mathSvcOptions = configService.getMathSvcOptions();
        return ClientProxyFactory.create(mathSvcOptions);
      },
      inject: [ConfigService],
    }
  ]
  ...
})

```

要将作业优先级设置为 `RequestContext`，使用 `data`配置对象的 `pattern`属性。

```typescript
@Client({ transport: Transport.TCP })
client: ClientProxy;

```

要查看完整的选项列表，查看 API 文档 __LINK_513__和 __LINK_514__。

#### 消费者

消费者是一个 **class**，定义方法来Here is the translation of the provided English technical documentation to Chinese:

### decorator 的字符串参数（例如 `status`）是要与 class 方法关联的队列名称。

```typescript
accumulate(): Observable<number> {
  const pattern = { cmd: 'sum' };
  const payload = [1, 2, 3];
  return this.client.send<number>(pattern, payload);
}

```

当 worker 空闲且队列中有待处理的任务时，将调用 process 方法。这個处理方法将接收 `connected` 对象作为唯一参数。处理方法返回的值将被存储在任务对象中，并且可以在完成事件的监听器中访问。

`disconnected` 对象具有多个方法，可以与它们的状态进行交互。例如，上面的代码使用 `TcpStatus` 方法来更新任务的进度。请参阅 __LINK_515__以获取完整的 `@nestjs/microservices` 对象 API 参考。

在 Bull 旧版本中，您可以通过将 `error` 传递给 `on()` 装饰器来指定某个作业处理方法将处理特定类型的作业（具有特定的 `status`）。

> 警告 **Warning** 请注意，这不适用于 BullMQ。

```typescript
async publish() {
  this.client.emit<number>('user_created', new UserCreatedEvent());
}

```

由于 BullMQ 不支持该行为，因此您需要使用 switch cases 来调用不同的服务或逻辑以处理每个作业名称：

```typescript
import { Injectable, Scope, Inject } from '@nestjs/common';
import { CONTEXT, RequestContext } from '@nestjs/microservices';

@Injectable({ scope: Scope.REQUEST })
export class CatsService {
  constructor(@Inject(CONTEXT) private ctx: RequestContext) {}
}

```

这在 BullMQ 文档的 __LINK_516__ 部分中有所提到。

#### 请求范围消费者

当消费者被标记为请求范围（了解更多关于注射范围 __LINK_517__），将创建一个新的 class 实例，专门为每个作业实例化。实例将在作业完成后被垃圾回收。

```typescript
export interface RequestContext<T = any> {
  pattern: string | Record<string, any>;
  data: T;
}

```

由于请求范围消费者类实例是在动态创建的且scoped 到单个作业，因此可以使用标准方法将 `TcpEvents` 通过构造函数注入。

```typescript
this.client.status.subscribe((status: TcpStatus) => {
  console.log(status);
});

```

> 提示 **Hint** `@nestjs/microservices` token 来自 `unwrap()` 包。

#### 事件监听器

BullMQ 在队列和/或作业状态更改时生成了一组有用的事件。这些事件可以在 Worker级别使用 `Server` 装饰器订阅，也可以在 Queue级别使用专门的监听器类和 `net` 装饰器。

Worker 事件必须在 __HTML_TAG_285__consumer__HTML_TAG_286__ 类中声明（即在使用 `timeout` 装饰器的类中）。要监听事件，请使用 `rxjs` 装饰器指定要处理的事件。例如，要监听在 `timeout` 队列中作业进入活动状态的事件，请使用以下结构：

```typescript
const server = app.connectMicroservice<MicroserviceOptions>(...);
server.status.subscribe((status: TcpStatus) => {
  console.log(status);
});

```

您可以查看 WorkerListener 的完整事件列表和它们的参数 __LINK_518__。

QueueEvent 监听器必须使用 `timeout` 装饰器并扩展 `rxjs/operators` 类，该类由 `tlsOptions` 提供。要监听事件，请使用 `tlsOptions` 装饰器指定要处理的事件。例如，要监听在 `ClientProxy` 队列中作业进入活动状态的事件，请使用以下结构：

```typescript
this.client.on('error', (err) => {
  console.error(err);
});

```

> 提示 **Hint** QueueEvent 监听器必须被注册为 `@Inject()`，以便 `TLS` 包可以捕捉它们。

您可以查看 QueueEventsListener 的完整事件列表和它们的参数 __LINK_519__。

#### 队列管理

队列具有 API，可以执行管理函数，如暂停和恢复、获取作业在不同状态中的数量等。您可以在 __LINK_520__ 中找到完整的队列 API。可以直接在 `ConfigService` 对象上调用这些方法，如下所示，以暂停和恢复队列：

暂停队列使用 `@nestjs/config` 方法调用。暂停队列将不处理新的作业，直到恢复，但当前正在处理的作业将继续直到完成。

```typescript
server.on<TcpEvents>('error', (err) => {
  console.error(err);
});

```

要恢复暂停的队列，请使用 `AsyncMicroserviceOptions` 方法，例如：

```typescript
const netServer = this.client.unwrap<Server>();

```

#### 分离进程

作业处理器也可以在分离的进程（__LINK_521__）中运行。这具有多个优点：

* 进程是 sandboxed 的，如果它崩溃将不影响 worker。
* 可以运行阻塞代码而不影响队列（作业将不阻塞）。
* 更好地利用多核心 CPU。
* 减少对 Redis 的连接。

```typescript
const netServer = server.unwrap<Server>();

```

> 警告 **Warning** 请注意，因为您的函数是在分离的进程中执行的，因此 Dependency Injection（和 IoC 容器）将不可用。因此，您的处理器函数需要包含（或创建）所有外部依赖项实例。

#### 异步配置以下是翻译后的中文技术文档：

使用 `ConfigService` 方法异步地传递选项，而不是静态地传递。使用 __INLINE_CODE_140__ 方法，可以实现多种方式来处理异步配置。类似地，如果您想异步传递队列选项，可以使用 __INLINE_CODE_141__ 方法。

一种方法是使用工厂函数：

```typescript
this.client
  .send<TResult, TInput>(pattern, data)
  .pipe(timeout(5000));

```

我们的工厂行为类似于任何其他 __LINK_522__（例如，它可以被 __INLINE_CODE_142__ 并且可以注入依赖项通过 __INLINE_CODE_143__）。

```typescript
import * as fs from 'fs';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const key = fs.readFileSync('<pathToKeyFile>', 'utf8').toString();
  const cert = fs.readFileSync('<pathToCertFile>', 'utf8').toString();

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        tlsOptions: {
          key,
          cert,
        },
      },
    },
  );

  await app.listen();
}
bootstrap();

```

Alternatively, you can use the __INLINE_CODE_144__ syntax:

```typescript
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'MATH_SERVICE',
        transport: Transport.TCP,
        options: {
          tlsOptions: {
            ca: [fs.readFileSync('<pathToCaFile>', 'utf-8').toString()],
          },
        },
      },
    ]),
  ],
})
export class AppModule {}

```

construction above will instantiate __INLINE_CODE_145__ inside __INLINE_CODE_146__ and use it to provide an options object by calling __INLINE_CODE_147__. Note that this means that the __INLINE_CODE_148__ has to implement the __INLINE_CODE_149__ interface, as shown below:

```typescript
import { ConfigService } from '@nestjs/config';
import { AsyncMicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<AsyncMicroserviceOptions>(
    AppModule,
    {
      useFactory: (configService: ConfigService) => ({
        transport: Transport.TCP,
        options: {
          host: configService.get<string>('HOST'),
          port: configService.get<number>('PORT'),
        },
      }),
      inject: [ConfigService],
    },
  );

  await app.listen();
}
bootstrap();

```

为了防止在 __INLINE_CODE_150__ 内部创建 __INLINE_CODE_151__ 并使用来自不同模块的提供者，可以使用 __INLINE_CODE_152__ 语法。

__CODE_BLOCK_27__

This construction works the same as __INLINE_CODE_153__ with one critical difference - __INLINE_CODE_154__ will lookup imported modules to reuse an existing __INLINE_CODE_155__ instead of instantiating a new one.

类似地，如果您想异步传递队列选项，可以使用 __INLINE_CODE_156__ 方法，只需注意在工厂函数外指定 __INLINE_CODE_157__ 属性。

__CODE_BLOCK_28__

#### Manual registration

默认情况下，__INLINE_CODE_158__ 自动注册 BullMQ 组件（队列、处理器和事件监听服务）在 __INLINE_CODE_159__ 生命周期函数中。然而，在某些情况下，这种行为可能不适合。要防止自动注册，启用 __INLINE_CODE_160__ 在 __INLINE_CODE_161__ 中，如下所示：

__CODE_BLOCK_29__

要手动注册这些组件，inject __INLINE_CODE_162__ 并调用 __INLINE_CODE_163__ 函数，preferably within __INLINE_CODE_164__ or __INLINE_CODE_165__。

__CODE_BLOCK_30__

除非您调用 __INLINE_CODE_166__ 函数，没有 BullMQ 组件将工作，这意味着没有作业将被处理。

#### Bull 安装

> warning **Note** 如果您决定使用 BullMQ，忽略本章节和以下章节。

要使用 Bull，首先安装所需的依赖项。

__CODE_BLOCK_31__

安装过程完成后，我们可以将 __INLINE_CODE_167__ 导入到根 __INLINE_CODE_168__ 中。

__CODE_BLOCK_32__

__INLINE_CODE_169__ 方法用于注册 __INLINE_CODE_170__ 包含的配置对象，该对象将被所有队列在应用程序中注册（除非另有指定）。配置对象包含以下属性：

- __INLINE_CODE_171__ - 控制队列作业处理率的选项。见 __LINK_523__ 进一步信息。可选。
- __INLINE_CODE_172__ - 配置 Redis 连接的选项。见 __LINK_524__ 进一步信息。可选。
- __INLINE_CODE_173__ - 所有队列键的前缀。可选。
- __INLINE_CODE_174__ - 对新作业的默认设置。见 __LINK_525__ 进一步信息。可选。 **注意：这些设置不会在使用 FlowProducer 调度作业时生效。见 __LINK_526__ 详细信息。**
- __INLINE_CODE_175__ - 高级队列配置设置。这些通常不需要更改。见 __LINK_527__ 进一步信息。可选。

所有选项都是可选的，可以提供详细的队列行为控制。这些选项将直接传递给 Bull __INLINE_CODE_176__ 构造函数。了解更多关于这些选项的信息 __LINK_528__。

要注册队列，请导入 __INLINE_CODE_177__ 动态模块，如下所示：

__CODE_BLOCK_33__

> info **Hint** 创建多个队列通过将多个逗号分隔的配置对象传递给 __INLINE_CODE_178__ 方法。

__INLINE_CODE_179__ 方法用于实例化和/或注册队列。队列是跨模块和进程共享的，可以连接到同一个 Redis 数据库的同一个凭证。每个队列都是唯一的，通过其名称属性。队列名称用作注入令牌（用于将队列注入控制器/提供者）和关联消费者类和监听器的参数。

您也可以覆盖特定队列的预配置选项，例如：

__CODE_BLOCK_34__

由于作业被存储在 Redis 中，每当特定名称的队列被实例化（例如，应用程序启动/重新启动时），它将尝试处理以前未完成的会话中的作业。

每个队列可以有一个或多个生产者、消费者和监听器。消费者从队列中检索作业，按照 FIFO（默认）、LIFO 或根据优先级顺序进行排序。控制队列处理顺序的讨论见 __HTML_TAG_287__here__HTML_TAG_288__。Here is the translation of the provided English technical documentation to Chinese:

#### 命名配置

如果您的队列连接到多个 Redis 实例，您可以使用一种技术称为 **命名配置**。这种特性允许您注册多个配置项，并将它们在队列选项中引用。

例如，如果您有一个额外的 Redis 实例（除了默认实例），用于注册在应用程序中的少数队列，您可以将其配置项注册如下：

__CODE_BLOCK_35__

在上面的示例中，__INLINE_CODE_180__只是一个配置项键（可以是任意的字符串）。

现在，您可以在 __INLINE_CODE_181__ 选项对象中引用这个配置项：

__CODE_BLOCK_36__

#### 生产者

作业生产者将作业添加到队列中。生产者通常是 Nest 应用程序服务（Nest __LINK_529__）。要将作业添加到队列中，首先将队列注入到服务中，如下所示：

__CODE_BLOCK_37__

> info **提示** __INLINE_CODE_182__ 装饰器通过使用 __INLINE_CODE_183__ 方法调用中的名称标识队列（例如 __INLINE_CODE_184__）。

现在，您可以通过调用队列的 __INLINE_CODE_185__ 方法，传递一个自定义的作业对象来添加作业。作业对象是可序列化的 JavaScript 对象（因为它们是存储在 Redis 数据库中的），您可以根据需要来表示作业的语义。

__CODE_BLOCK_38__

#### 命名作业

作业可能具有唯一的名称。这允许您创建特殊的 __HTML_TAG_291__消费者__HTML_TAG_292__，只处理具有给定名称的作业。

__CODE_BLOCK_39__

> Warning **警告** 使用命名作业时，您必须创建每个唯一名称的处理器，以便队列不抱怨缺少给定作业的处理器。见 __HTML_TAG_293__这里__HTML_TAG_294__ untuk 更多关于消费命名作业的信息。

#### 作业选项

作业可以具有额外的选项。将选项对象传递给 __INLINE_CODE_186__ 方法后的 __INLINE_CODE_187__ 参数。作业选项属性是：

- __INLINE_CODE_188__: __INLINE_CODE_189__ - 可选的优先级值。范围从 1（最高优先级）到 MAX_INT（最低优先级）。请注意使用优先级会对性能产生轻微影响，因此请使用它们谨慎。
- __INLINE_CODE_190__: __INLINE_CODE_191__ - 等待该作业可被处理的时间（毫秒）。请注意，为了确保准确的延迟，服务器和客户端都应同步时钟。
- __INLINE_CODE_192__: __INLINE_CODE_193__ - 尝试该作业的总次数。
- __INLINE_CODE_194__: __INLINE_CODE_195__ - 根据 cron 规则重复作业。见 __LINK_530__。
- __INLINE_CODE_196__: __INLINE_CODE_197__ - 自动重试失败的作业的后退设置。见 __LINK_531__。
- __INLINE_CODE_198__: __INLINE_CODE_199__ - 如果为 true，将作业添加到队列的右端，而不是默认的左端。
- __INLINE_CODE_200__: __INLINE_CODE_201__ - 作业失败后应失败的毫秒数。
- __INLINE_CODE_202__: __INLINE_CODE_203__ | __INLINE_CODE_204__ - Override 作业 ID - 默认情况下，作业 ID 是一个唯一的整数，但您可以使用这个设置来override它。如果您使用这个选项，它是您的责任确保作业 ID 是唯一的。如果您尝试添加具有已存在 ID 的作业，它将不会被添加。
- __INLINE_CODE_205__: __INLINE_CODE_206__ - 如果为 true，删除作业当它成功完成。一个数字指定要保留的作业数量。默认行为是保留作业在完成队列中。
- __INLINE_CODE_207__: __INLINE_CODE_208__ - 如果为 true，删除作业当它失败所有尝试。一个数字指定要保留的作业数量。默认行为是保留作业在失败队列中。
- __INLINE_CODE_209__: __INLINE_CODE_210__ - 限制记录在栈跟踪中的栈跟踪行数。

以下是一些使用作业选项的自定义示例。

要延迟作业的开始，使用 __INLINE_CODE_211__ 配置项。

__CODE_BLOCK_40__

要将作业添加到队列的右端（处理作业为 LIFO），设置配置对象的 __INLINE_CODE_212__ 属性为 __INLINE_CODE_213__。

__CODE_BLOCK_41__

要优先处理作业，使用 __INLINE_CODE_214__ 属性。

__CODE_BLOCK_42__

#### 消费者

消费者是一种 **class**，定义方法来处理队列中的作业或监听队列事件，或者两者。使用 __INLINE_CODE_215__ 装饰器将消费者类声明如下：

__CODE_BLOCK_43__

> info **提示** 消费者必须Here is the translation of the provided English technical documentation to Chinese:

在消费者类中，使用__INLINE_CODE_219__装饰器来声明作业处理程序。

__CODE_BLOCK_44__

装饰的方法（例如__INLINE_CODE_220__）在 worker 空闲且队列中有作业时被调用。该处理方法仅接受__INLINE_CODE_221__对象作为参数。处理程序返回的值将被存储在作业对象中，并且可以在完成事件的监听器中访问。

__INLINE_CODE_222__对象具有多个方法，可以与它们的状态进行交互。例如，上述代码使用__INLINE_CODE_223__方法更新作业的进度。请查看__LINK_532__以获取完整的__INLINE_CODE_224__对象 API 参考。

您可以使用__INLINE_CODE_227__装饰器将作业处理程序方法限定为只能处理特定类型的作业（具有特定的__INLINE_CODE_225__）。例如，如下所示。您可以在给定消费者类中拥有多个__INLINE_CODE_228__处理程序，相应于每个作业类型（__INLINE_CODE_229__）。当使用命名作业时，请确保每个名称都有相应的处理程序。

__CODE_BLOCK_45__

> warning **Warning** 定义同一个队列的多个消费者时，__INLINE_CODE_231__选项在__INLINE_CODE_230__中没有生效。最小__INLINE_CODE_232__将匹配定义的消费者数量。这也适用于使用不同__INLINE_CODE_234__处理命名作业的__INLINE_CODE_233__处理程序。

#### 请求作用域消费者

当消费者被标记为请求作用域时（了解更多关于注入作用域__LINK_533__），将创建一个专门为每个作业实例的类实例。实例将在作业完成后被垃圾回收。

__CODE_BLOCK_46__

由于请求作用域消费者类实例是在动态创建的且作用域于单个作业，因此可以使用标准方法通过构造函数注入一个__INLINE_CODE_235__。

__CODE_BLOCK_47__

> info **Hint** __INLINE_CODE_236__令牌来自__INLINE_CODE_237__包。

#### 事件监听器

Bull 在队列和/或作业状态更改时生成了一组有用的事件。Nest 提供了一组装饰器，允许订阅核心事件集。这些装饰器来自__INLINE_CODE_238__包。

事件监听器必须在__HTML_TAG_295__consumer__HTML_TAG_296__类中声明（即在使用__INLINE_CODE_239__装饰器装饰的类中）。要监听事件，请使用以下构造来声明一个事件处理程序。例如，要监听__INLINE_CODE_240__队列中的作业进入活动状态时发出的事件，请使用以下构造：

__CODE_BLOCK_48__

由于 Bull 在分布式（多节点）环境中运行，它定义了事件局部性概念。这概念认识到事件可能是在单个进程中触发的，也可能是在共享队列中的多个进程中触发的。局部事件是指在队列中触发的事件，而不是在共享队列中的事件。在其他进程中触发的事件称为全局事件。

事件处理程序在其相应事件被发射时被调用。处理程序的签名如表所示，提供对事件相关信息的访问。我们将讨论局部和全局事件处理程序签名的主要差异。Here is the translation of the provided English technical documentation to Chinese:

<span id="HTML_TAG_297"></span>
<span id="HTML_TAG_298"></span>
  <span id="HTML_TAG_299">本地事件监听器</span>
  <span id="HTML_TAG_301">全局事件监听器</span>
  <span id="HTML_TAG_303">处理方法签名/触发时</span>
<span id="HTML_TAG_305"></span>
<span id="HTML_TAG_306"></span>
  <span id="HTML_TAG_307"></span>
  <span id="HTML_TAG_308">@OnQueueError()</span>
  <span id="HTML_TAG_309"></span>
  <span id="HTML_TAG_310"></span>
  <span id="HTML_TAG_311"></span>
  <span id="HTML_TAG_312">@OnGlobalQueueError()</span>
  <span id="HTML_TAG_313"></span>
  <span id="HTML_TAG_314"></span>
  <span id="HTML_TAG_315"></span>
  <span id="HTML_TAG_316">handler(error: Error)</span>
  <span id="HTML_TAG_317">- 发生错误。</span>
  <span id="HTML_TAG_318">error</span>
  <span id="HTML_TAG_319">包含触发错误的信息。</span>
<span id="HTML_TAG_321"></span>
<span id="HTML_TAG_322"></span>
  <span id="HTML_TAG_323"></span>
  <span id="HTML_TAG_324">@OnQueueWaiting()</span>
  <span id="HTML_TAG_325"></span>
  <span id="HTML_TAG_326"></span>
  <span id="HTML_TAG_327"></span>
  <span id="HTML_TAG_328">@OnGlobalQueueWaiting()</span>
  <span id="HTML_TAG_329"></span>
  <span id="HTML_TAG_330"></span>
  <span id="HTML_TAG_331"></span>
  <span id="HTML_TAG_332">handler(jobId: number | string)</span>
  <span id="HTML_TAG_333">- 有一个作业正在等待处理，直到worker空闲。 </span>
  <span id="HTML_TAG_334">jobId</span>
  <span id="HTML_TAG_335">包含要处理的作业的id。</span>
<span id="HTML_TAG_337"></span>
<span id="HTML_TAG_338"></span>
  <span id="HTML_TAG_339"></span>
  <span id="HTML_TAG_340">@OnQueueActive()</span>
  <span id="HTML_TAG_341"></span>
  <span id="HTML_TAG_342"></span>
  <span id="HTML_TAG_343"></span>
  <span id="HTML_TAG_344">@OnGlobalQueueActive()</span>
  <span id="HTML_TAG_345"></span>
  <span id="HTML_TAG_346"></span>
  <span id="HTML_TAG_347"></span>
  <span id="HTML_TAG_348">handler(job: Job)</span>
  <span id="HTML_TAG_349">- 作业</span>
  <span id="HTML_TAG_350">job</span>
  <span id="HTML_TAG_351">已经启动。</span>
<span id="HTML_TAG_353"></span>
<span id="HTML_TAG_354"></span>
  <span id="HTML_TAG_355"></span>
  <span id="HTML_TAG_356">@OnQueueStalled()</span>
  <span id="HTML_TAG_357"></span>
  <span id="Here is the translated documentation to Chinese:

 __HTML_TAG_498__
  __HTML_TAG_499__
__HTML_TAG_500__.当监听全局事件时，方法签名可能与本地版本不同。特别是任何在本地版本中接收__INLINE_CODE_241__对象的方法签名，在全局版本中将接收一个__INLINE_CODE_242__ (__INLINE_CODE_243__)。要获取实际__INLINE_CODE_244__对象的引用，在这种情况下，使用__INLINE_CODE_245__方法。该调用应异步等待，因此处理程序应该声明为__INLINE_CODE_246__。例如：

__CODE_BLOCK_49__

> info **Hint** 要访问__INLINE_CODE_247__对象（以便进行__INLINE_CODE_248__调用），您必须将其注入。同时，队列必须在您注入它的模块中注册。

除了特定的事件监听装饰器外，您还可以使用通用的__INLINE_CODE_249__装饰器，结合__INLINE_CODE_250__或__INLINE_CODE_251__枚举。了解更多关于事件__LINK_534__。

#### 队列管理

队列具有API，可以执行管理功能，如暂停和恢复、获取各种状态下的作业计数等。您可以在__LINK_535__中找到完整的队列API。直接在__INLINE_CODE_252__对象上调用这些方法，如下所示，使用暂停/恢复示例。

使用__INLINE_CODE_253__方法调用暂停队列。暂停队列将不处理新的作业，直到恢复，但是当前正在处理的作业将继续直到它们被最终化。

__CODE_BLOCK_50__

要恢复暂停的队列，使用__INLINE_CODE_254__方法，例如：

__CODE_BLOCK_51__

#### 分离进程

任务处理程序也可以在分离的（forked）进程中运行(__LINK_536__）。这有几个优点：

- 进程是沙箱式的，如果它崩溃，它不会影响工作者。
- 可以运行阻塞代码而不影响队列（作业将不阻塞）。
- 对多核 CPU 的利用率更高。
- 连接数更少。

__CODE_BLOCK_52__

请注意，因为您的函数在分离的进程中执行，依赖注入（和 IoC 容器）将不可用。这意味着您的处理函数需要包含（或创建）所有外部依赖项的实例。

__CODE_BLOCK_53__

#### 异步配置

您可能想异步地传递__INLINE_CODE_255__选项，而不是静态地传递。在这种情况下，使用__INLINE_CODE_256__方法，该方法提供了多种方式来处理异步配置。

一种方法是使用工厂函数：

__CODE_BLOCK_54__

我们的工厂行为像任何其他__LINK_537__（例如，可以__INLINE_CODE_257__并通过__INLINE_CODE_258__注入依赖项）。

__CODE_BLOCK_55__

Alternatively, you can use the __INLINE_CODE_259__ syntax:

__CODE_BLOCK_56__

构造上述将在__INLINE_CODE_261__中实例化__INLINE_CODE_260__并使用它来提供选项对象，通过调用__INLINE_CODE_262__。请注意，这意味着__INLINE_CODE_263__必须实现__INLINE_CODE_264__接口，如下所示：

__CODE_BLOCK_57__

为了防止在__INLINE_CODE_266__中创建__INLINE_CODE_265__并使用来自不同模块的提供商，您可以使用__INLINE_CODE_267__语法。

__CODE_BLOCK_58__

这构造与__INLINE_CODE_268__相同，但有一個关键差异 - __INLINE_CODE_269__将查找导入模块以重用现有__INLINE_CODE_270__，而不是实例化新的一个。

类似地，如果您想异步地传递队列选项，使用__INLINE_CODE_271__方法，但请注意指定__INLINE_CODE_272__属性在工厂函数外部。

__CODE_BLOCK_59__

#### 示例

有一个可用的工作示例__LINK_538__。