### 队列

队列是一种强大的设计模式，能帮助您应对常见的应用扩展和性能挑战。以下是队列可协助解决的问题示例：

- 平滑处理峰值负载。例如，当用户可能随时发起资源密集型任务时，您可以将这些任务加入队列而非同步执行。随后通过工作进程以可控方式从队列中提取任务。随着应用规模扩大，您能轻松添加新的队列消费者来扩展后端任务处理能力。
- 分解可能阻塞 Node.js 事件循环的庞杂任务。例如，当用户请求需要执行音频转码等 CPU 密集型工作时，可将任务委派给其他进程处理，从而确保面向用户的进程保持响应能力。
- 提供跨多种服务的可靠通信通道。例如，您可以在一个进程或服务中排队任务（作业），并在另一个进程或服务中消费这些任务。您可以通过监听状态事件，在任何进程或服务中获知作业生命周期中的完成、错误或其他状态变更。当队列生产者或消费者发生故障时，其状态会被保留，任务处理可在节点重启时自动恢复。

Nest 为 BullMQ 集成提供了 `@nestjs/bullmq` 包，为 Bull 集成提供了 `@nestjs/bull` 包。这两个包都是对各自底层库的抽象封装，这些库由同一团队开发。Bull 目前处于维护模式，团队主要专注于修复错误，而 BullMQ 正在积极开发中，采用现代 TypeScript 实现并提供不同的功能集。如果 Bull 满足您的需求，它仍然是一个经过实战检验的可靠选择。Nest 封装包让您能够以友好的方式将 BullMQ 或 Bull 队列轻松集成到 Nest 应用中。

BullMQ 和 Bull 都使用 [Redis](https://redis.io/) 来持久化任务数据，因此您需要在系统中安装 Redis。由于它们基于 Redis，您的队列架构可以完全分布式且与平台无关。例如，您可以让一些队列[生产者](techniques/queues#producers) 、 [消费者](techniques/queues#consumers)和[监听器](techniques/queues#event-listeners)在一个（或多个）节点上的 Nest 中运行，而其他生产者、消费者和监听器可以在其他网络节点上的其他 Node.js 平台上运行。

本章节涵盖 `@nestjs/bullmq` 和 `@nestjs/bull` 包。我们还建议阅读 [BullMQ](https://docs.bullmq.io/) 和 [Bull](https://github.com/OptimalBits/bull/blob/master/REFERENCE.md) 文档以获取更多背景知识和具体实现细节。

#### BullMQ 安装

要开始使用 BullMQ，我们首先需要安装所需的依赖项。

```bash
$ npm install --save @nestjs/bullmq bullmq
```

安装完成后，我们可以将 `BullModule` 导入根 `AppModule` 中。

```typescript title="app.module"
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: 'localhost',
        port: 6379,
      },
    }),
  ],
})
export class AppModule {}
```

`forRoot()` 方法用于注册一个 `bullmq` 包的配置对象，该对象将被应用中所有已注册的队列使用（除非另有指定）。以下是配置对象中的部分属性供参考：

- `connection: ConnectionOptions` - 用于配置 Redis 连接的选项。更多信息请参阅 [Connections](https://docs.bullmq.io/guide/connections)。可选参数。
- `prefix: string` - 所有队列键的前缀。可选参数。
- `defaultJobOptions: JobOpts` - 控制新任务默认设置的选项。详见 [JobOpts](https://github.com/OptimalBits/bull/blob/master/REFERENCE.md#queueadd)。可选参数。
- `settings: AdvancedSettings` - 高级队列配置设置。通常无需修改。详见 [AdvancedSettings](https://github.com/OptimalBits/bull/blob/master/REFERENCE.md#queue)。可选参数。
- `extraOptions` - 模块初始化的额外选项。详见[手动注册](https://docs.nestjs.com/techniques/queues#manual-registration)

所有选项均为可选参数，用于对队列行为进行精细控制。这些参数将直接传递给 BullMQ 的 `Queue` 构造函数。更多选项及相关说明请参阅[此处](https://api.docs.bullmq.io/interfaces/v4.QueueOptions.html) 。

要注册队列，请导入动态模块 `BullModule.registerQueue()`，如下所示：

```typescript
BullModule.registerQueue({
  name: 'audio',
});
```

> info **提示** 通过向 `registerQueue()` 方法传递多个以逗号分隔的配置对象，可以创建多个队列。

`registerQueue()` 方法用于实例化和/或注册队列。队列在连接到具有相同凭证的同一底层 Redis 数据库的模块和进程之间共享。每个队列通过其 name 属性保持唯一性。队列名称既用作注入令牌（用于将队列注入控制器/提供者），也用作装饰器的参数，以将消费者类和监听器与队列关联起来。

您还可以按如下方式覆盖特定队列的某些预配置选项：

```typescript
BullModule.registerQueue({
  name: 'audio',
  connection: {
    port: 6380,
  },
});
```

BullMQ 还支持任务间的父子关系。这一功能允许创建任意深度的树状任务流，其中每个任务作为树的节点。了解更多信息请点击[此处](https://docs.bullmq.io/guide/flows) 。

要添加任务流，您可以执行以下操作：

```typescript
BullModule.registerFlowProducer({
  name: 'flowProducerName',
});
```

由于任务持久化存储在 Redis 中，每次实例化特定命名队列时（例如应用启动/重启时），系统会尝试处理之前未完成会话中可能存在的旧任务。

每个队列可以拥有一个或多个生产者、消费者及监听器。消费者按照特定顺序从队列中获取任务：FIFO（默认）、LIFO 或根据优先级。控制队列处理顺序的讨论详见[此处](techniques/queues#consumers) 。

#### 命名配置

如果您的队列需要连接到多个不同的 Redis 实例，可以使用名为**命名配置**的技术。该功能允许您在指定键下注册多个配置，然后可以在队列选项中引用这些配置。

例如，假设您的应用程序中注册的某些队列使用了额外的 Redis 实例（除了默认实例之外），您可以按如下方式注册其配置：

```typescript
BullModule.forRoot('alternative-config', {
  connection: {
    port: 6381,
  },
});
```

在上面的示例中，`'alternative-config'` 只是一个配置键（可以是任意字符串）。

完成上述配置后，您现在可以在 `registerQueue()` 选项对象中指向此配置：

```typescript
BullModule.registerQueue({
  configKey: 'alternative-config',
  name: 'video',
});
```

#### 生产者

作业生产者将任务添加到队列中。生产者通常是应用程序服务（Nest [提供者](/providers) ）。要向队列添加任务，首先需要按以下方式将队列注入服务：

```typescript
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';

@Injectable()
export class AudioService {
  constructor(@InjectQueue('audio') private audioQueue: Queue) {}
}
```

> info **提示** `@InjectQueue()` 装饰器通过队列名称来标识队列，该名称在 `registerQueue()` 方法调用中提供（例如 `'audio'`）。

现在，通过调用队列的 `add()` 方法来添加任务，传入一个用户自定义的任务对象。任务以可序列化的 JavaScript 对象形式表示（因为它们会存储在 Redis 数据库中）。传入的任务对象结构可以自由定义，用于体现任务对象的语义。同时需要为任务指定名称，这样就能创建专门的[消费者](techniques/queues#consumers)来仅处理特定名称的任务。

```typescript
const job = await this.audioQueue.add('transcode', {
  foo: 'bar',
});
```

#### 任务选项

任务可以关联额外的选项。在 `Queue.add()` 方法中的 `job` 参数后传入选项对象。部分任务选项属性包括：

- `priority`: `number` - 可选优先级数值。范围从 1（最高优先级）到 MAX_INT（最低优先级）。注意使用优先级会对性能产生轻微影响，请谨慎使用。
- `delay`: `number` - 等待处理此任务的时间量（毫秒）。注意：要实现精确延迟，服务器和客户端的时钟需保持同步。
- `attempts`: `number` - 任务完成前的最大尝试次数。
- `repeat`: `RepeatOpts` - 按照 cron 表达式重复执行任务。详见 [RepeatOpts](https://github.com/OptimalBits/bull/blob/master/REFERENCE.md#queueadd)。
- `backoff`: `number | BackoffOpts` - 任务失败时自动重试的回退设置。详见 [BackoffOpts](https://github.com/OptimalBits/bull/blob/master/REFERENCE.md#queueadd)。
- `lifo`: `boolean` - 若为 true，则将任务添加至队列右端而非左端（默认为 false）。
- `jobId`: `number` | `string` - 覆盖任务 ID - 默认情况下任务 ID 是唯一整数，但可通过此设置进行覆盖。使用此选项时需自行确保 jobId 的唯一性。若尝试添加已存在 ID 的任务，该任务将不会被添加。
- `removeOnComplete`: `boolean | number` - 若为 true，则在任务成功完成后移除。数值类型可指定保留的任务数量。默认行为是将任务保留在已完成集合中。
- `removeOnFail`: `boolean | number` - 若为 true，则在任务重试全部失败后移除。数值类型可指定保留的任务数量。默认行为是将任务保留在失败集合中。
- `stackTraceLimit`: `number` - 限制将被记录在堆栈跟踪中的堆栈跟踪行数。

以下是使用作业选项自定义作业的几个示例。

要延迟作业的启动，请使用 `delay` 配置属性。

```typescript
const job = await this.audioQueue.add(
  'transcode',
  {
    foo: 'bar',
  },
  { delay: 3000 } // 3 seconds delayed
);
```

要将作业添加到队列的右端（以 **LIFO**（后进先出）方式处理作业），请将配置对象的 `lifo` 属性设置为 `true`。

```typescript
const job = await this.audioQueue.add(
  'transcode',
  {
    foo: 'bar',
  },
  { lifo: true }
);
```

要为任务设置优先级，请使用 `priority` 属性。

```typescript
const job = await this.audioQueue.add(
  'transcode',
  {
    foo: 'bar',
  },
  { priority: 2 }
);
```

完整选项列表请查阅 API 文档[此处](https://api.docs.bullmq.io/types/v4.JobsOptions.html)和[此处](https://api.docs.bullmq.io/interfaces/v4.BaseJobOptions.html) 。

#### 消费者

消费者是一个**类** ，它定义了处理队列任务或监听队列事件的方法，或两者兼具。使用 `@Processor()` 装饰器声明消费者类如下：

```typescript
import { Processor } from '@nestjs/bullmq';

@Processor('audio')
export class AudioConsumer {}
```

> info **提示** 消费者必须注册为 `providers`，这样 `@nestjs/bullmq` 包才能识别它们。

装饰器的字符串参数（例如 `'audio'`）表示要与类方法关联的队列名称。

```typescript
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('audio')
export class AudioConsumer extends WorkerHost {
  async process(job: Job<any, any, string>): Promise<any> {
    let progress = 0;
    for (let i = 0; i < 100; i++) {
      await doSomething(job.data);
      progress += 1;
      await job.updateProgress(progress);
    }
    return {};
  }
}
```

每当工作线程空闲且队列中有待处理作业时，就会调用 process 方法。该处理方法接收 `job` 对象作为其唯一参数。处理方法返回的值会存储在作业对象中，后续可被访问，例如在 completed 事件的监听器中。

`Job` 对象具有多种方法可用于与其状态交互。例如，上述代码使用 `progress()` 方法来更新作业进度。完整 `Job` 对象 API 参考请见 [此处](https://api.docs.bullmq.io/classes/v4.Job.html) 。

在旧版本 Bull 中，您可以通过将特定 `name` 传递给 `@Process()` 装饰器来指定某个任务处理方法**仅**处理特定类型的任务（具有特定 `name` 的任务），如下所示。

> warning **注意** 这在 BullMQ 中无效，请继续阅读。

```typescript
@Process('transcode')
async transcode(job: Job<unknown>) { ... }
```

由于可能导致的混淆问题，BullMQ 不再支持此行为。您需要使用 switch 语句根据不同任务名称调用不同服务或逻辑：

```typescript
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('audio')
export class AudioConsumer extends WorkerHost {
  async process(job: Job<any, any, string>): Promise<any> {
    switch (job.name) {
      case 'transcode': {
        let progress = 0;
        for (i = 0; i < 100; i++) {
          await doSomething(job.data);
          progress += 1;
          await job.progress(progress);
        }
        return {};
      }
      case 'concatenate': {
        await doSomeLogic2();
        break;
      }
    }
  }
}
```

相关内容请参阅 BullMQ 文档中的[命名处理器](https://docs.bullmq.io/patterns/named-processor)章节。

#### 请求作用域的消费者

当消费者被标记为请求作用域时（了解更多关于注入作用域的信息[此处](/fundamentals/injection-scopes#provider-scope) ），系统会为每个作业专门创建该类的新实例。该实例将在作业完成后被垃圾回收。

```typescript
@Processor({
  name: 'audio',
  scope: Scope.REQUEST,
})
```

由于请求作用域的消费者类是动态实例化且仅作用于单个作业，因此您可以使用标准方法通过构造函数注入 `JOB_REF`。

```typescript
constructor(@Inject(JOB_REF) jobRef: Job) {
  console.log(jobRef);
}
```

> info **提示** `JOB_REF` 令牌是从 `@nestjs/bullmq` 包导入的。

#### 事件监听器

当队列和/或任务状态发生变化时，BullMQ 会生成一系列有用的事件。这些事件可以通过在 Worker 级别使用 `@OnWorkerEvent(event)` 装饰器来订阅，或者在 Queue 级别通过专门的监听器类和 `@OnQueueEvent(event)` 装饰器来订阅。

Worker 事件必须在 [consumer](techniques/queues#consumers) 类中声明（即在使用 `@Processor()` 装饰器修饰的类中）。要监听某个事件，请使用 `@OnWorkerEvent(event)` 装饰器并指定要处理的事件。例如，要监听 `audio` 队列中任务进入活动状态时发出的事件，可以使用以下结构：

```typescript
import { Processor, Process, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('audio')
export class AudioConsumer {
  @OnWorkerEvent('active')
  onActive(job: Job) {
    console.log(
      `Processing job ${job.id} of type ${job.name} with data ${job.data}...`
    );
  }

  // ...
}
```

您可以在[此处](https://api.docs.bullmq.io/interfaces/v4.WorkerListener.html)查看完整的事件列表及其参数，它们作为 WorkerListener 的属性存在。

队列事件监听器必须使用 `@QueueEventsListener(queue)` 装饰器并继承 `QueueEventsHost` 类（由 `@nestjs/bullmq` 提供）。要监听事件，需使用 `@OnQueueEvent(event)` 装饰器并指定要处理的事件。例如，要监听 `audio` 队列中任务进入激活状态时发出的事件，可采用以下结构：

```typescript
import {
  QueueEventsHost,
  QueueEventsListener,
  OnQueueEvent,
} from '@nestjs/bullmq';

@QueueEventsListener('audio')
export class AudioEventsListener extends QueueEventsHost {
  @OnQueueEvent('active')
  onActive(job: { jobId: string; prev?: string }) {
    console.log(`Processing job ${job.jobId}...`);
  }

  // ...
}
```

> **提示** 队列事件监听器必须注册为 `providers`，这样 `@nestjs/bullmq` 包才能识别它们。

完整事件列表及其参数可作为 QueueEventsListener 的属性[在此查看](https://api.docs.bullmq.io/interfaces/v4.QueueEventsListener.html) 。

#### 队列管理

队列提供了一套 API，支持执行管理功能，如暂停和恢复、获取不同状态下作业数量等操作。完整队列 API 可[在此查看](https://api.docs.bullmq.io/classes/v4.Queue.html) 。直接在 `Queue` 对象上调用这些方法，如下所示的暂停/恢复示例。

通过 `pause()` 方法调用暂停队列。暂停的队列将不会处理新作业，但正在处理的当前作业会继续执行直至完成。

```typescript
await audioQueue.pause();
```

要恢复已暂停的队列，请使用如下所示的 `resume()` 方法：

```typescript
await audioQueue.resume();
```

#### 独立进程

作业处理器也可以在独立的（forked）进程中运行（ [来源](https://docs.bullmq.io/guide/workers/sandboxed-processors) ）。这具有以下优势：

- 该进程运行在沙箱环境中，即使崩溃也不会影响工作线程。
- 可以运行阻塞代码而不会影响队列（任务不会停滞）。
- 能显著提高多核 CPU 的利用率。
- 减少与 Redis 的连接数。

```typescript title="app.module"
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { join } from 'path';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'audio',
      processors: [join(__dirname, 'processor.js')],
    }),
  ],
})
export class AppModule {}
```

> warning **警告** 请注意，由于您的函数在分叉进程中执行，依赖注入（及 IoC 容器）将不可用。这意味着您的处理器函数需要包含（或创建）其所依赖的所有外部实例。

#### 异步配置

您可能需要异步传递 `bullmq` 选项而非静态配置。这种情况下，可使用提供多种异步配置处理方式的 `forRootAsync()` 方法。同样地，若要异步传递队列选项，请使用 `registerQueueAsync()` 方法。

一种解决方案是使用工厂函数：

```typescript
BullModule.forRootAsync({
  useFactory: () => ({
    connection: {
      host: 'localhost',
      port: 6379,
    },
  }),
});
```

我们的工厂行为与其他[异步提供者](https://docs.nestjs.com/fundamentals/async-providers)一样（例如，它可以是 `async` 的，并且能够通过 `inject` 注入依赖项）。

```typescript
BullModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => ({
    connection: {
      host: configService.get('QUEUE_HOST'),
      port: configService.get('QUEUE_PORT'),
    },
  }),
  inject: [ConfigService],
});
```

或者，您也可以使用 `useClass` 语法：

```typescript
BullModule.forRootAsync({
  useClass: BullConfigService,
});
```

上述构造将在 `BullModule` 内部实例化 `BullConfigService`，并通过调用 `createSharedConfiguration()` 来提供配置对象。请注意，这意味着 `BullConfigService` 必须实现 `SharedBullConfigurationFactory` 接口，如下所示：

```typescript
@Injectable()
class BullConfigService implements SharedBullConfigurationFactory {
  createSharedConfiguration(): BullModuleOptions {
    return {
      connection: {
        host: 'localhost',
        port: 6379,
      },
    };
  }
}
```

为了避免在 `BullModule` 内部创建 `BullConfigService`，而是使用从其他模块导入的提供者，您可以使用 `useExisting` 语法。

```typescript
BullModule.forRootAsync({
  imports: [ConfigModule],
  useExisting: ConfigService,
});
```

这种构造方式与 `useClass` 的工作原理相同，但有一个关键区别——`BullModule` 会查找已导入的模块来重用现有的 `ConfigService`，而不是实例化一个新的。

同样地，如果您想异步传递队列选项，可以使用 `registerQueueAsync()` 方法，只需记住将 `name` 属性指定在工厂函数外部。

```typescript
BullModule.registerQueueAsync({
  name: 'audio',
  useFactory: () => ({
    redis: {
      host: 'localhost',
      port: 6379,
    },
  }),
});
```

#### 手动注册

默认情况下，`BullModule` 会在 `onModuleInit` 生命周期函数中自动注册 BullMQ 组件（队列、处理器和事件监听服务）。但在某些情况下，这种行为可能并不理想。要阻止自动注册，可以像这样在 `BullModule` 中启用 `manualRegistration`：

```typescript
BullModule.forRoot({
  extraOptions: {
    manualRegistration: true,
  },
});
```

要手动注册这些组件，请注入 `BullRegistrar` 并调用 `register` 函数，最好在 `OnModuleInit` 或 `OnApplicationBootstrap` 中完成。

```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';
import { BullRegistrar } from '@nestjs/bullmq';

@Injectable()
export class AudioService implements OnModuleInit {
  constructor(private bullRegistrar: BullRegistrar) {}

  onModuleInit() {
    if (yourConditionHere) {
      this.bullRegistrar.register();
    }
  }
}
```

除非调用 `BullRegistrar#register` 函数，否则所有 BullMQ 组件都将无法工作——这意味着不会处理任何任务。

#### Bull 安装

> **注意** 如果决定使用 BullMQ，请跳过本节及后续章节。

要开始使用 Bull，我们首先需要安装所需的依赖项。

```bash
$ npm install --save @nestjs/bull bull
```

安装过程完成后，我们可以将 `BullModule` 导入根模块 `AppModule` 中。

```typescript title="app.module"
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
  ],
})
export class AppModule {}
```

`forRoot()` 方法用于注册一个 `bull` 包配置对象，该对象将被应用程序中注册的所有队列使用（除非另有指定）。配置对象包含以下属性：

- `limiter: RateLimiter` - 用于控制队列任务处理速率的选项。更多信息请参阅 [RateLimiter](https://github.com/OptimalBits/bull/blob/master/REFERENCE.md#queue)。可选参数。
- `redis: RedisOpts` - 用于配置 Redis 连接的选项。详见 [RedisOpts](https://github.com/OptimalBits/bull/blob/master/REFERENCE.md#queue)。可选配置。
- `prefix: string` - 所有队列键的前缀。可选配置。
- `defaultJobOptions: JobOpts` - 控制新任务默认设置的选项。详见 [JobOpts](https://github.com/OptimalBits/bull/blob/master/REFERENCE.md#queueadd)。可选配置。 **注意：通过 FlowProducer 调度任务时这些选项不会生效。原因说明参见 [bullmq#1034](https://github.com/taskforcesh/bullmq/issues/1034)。**
- `settings: AdvancedSettings` - 高级队列配置设置。通常无需修改。详见 [AdvancedSettings](https://github.com/OptimalBits/bull/blob/master/REFERENCE.md#queue)。可选配置。

所有选项均为可选，提供了对队列行为的细粒度控制。这些选项会直接传递给 Bull 的 `Queue` 构造函数。更多详细信息请查阅[此处](https://github.com/OptimalBits/bull/blob/master/REFERENCE.md#queue) 。

注册队列时，请导入动态模块 `BullModule.registerQueue()`，如下所示：

```typescript
BullModule.registerQueue({
  name: 'audio',
});
```

> info **提示** 通过向 `registerQueue()` 方法传入多个逗号分隔的配置对象，可以创建多个队列。

`registerQueue()` 方法用于实例化或注册队列。队列会被共享给连接到同一 Redis 底层数据库且使用相同凭证的模块和进程。每个队列通过其名称属性保持唯一性。队列名称既作为注入令牌（用于将队列注入控制器/提供者），也作为装饰器的参数来将消费者类与监听器同队列关联起来。

您也可以针对特定队列覆盖部分预配置选项，如下所示：

```typescript
BullModule.registerQueue({
  name: 'audio',
  redis: {
    port: 6380,
  },
});
```

由于作业会持久化存储在 Redis 中，每次实例化特定命名队列时（例如应用启动/重启时），系统都会尝试处理之前未完成会话中可能遗留的旧作业。

每个队列可以拥有一个或多个生产者、消费者和监听器。消费者会按照特定顺序从队列中获取作业：FIFO（默认）、LIFO 或根据优先级。控制队列处理顺序的讨论请参见[此处](techniques/queues#consumers) 。

#### 命名配置

如果您的队列连接到多个 Redis 实例，可以使用名为**命名配置**的技术。此功能允许您在指定键下注册多个配置，随后便可在队列选项中引用这些配置。

例如，假设您的应用程序中注册的少数队列使用了除默认实例外的另一个 Redis 实例，可以按如下方式注册其配置：

```typescript
BullModule.forRoot('alternative-config', {
  redis: {
    port: 6381,
  },
});
```

上例中的 `'alternative-config'` 仅是一个配置键（可以是任意字符串）。

完成此设置后，您现在可以在 `registerQueue()` 选项对象中指向此配置：

```typescript
BullModule.registerQueue({
  configKey: 'alternative-config',
  name: 'video',
});
```

#### 生产者

任务生产者负责将任务添加至队列。生产者通常是应用服务（Nest [提供者](/providers) ）。要将任务加入队列，首先需按以下方式将队列注入服务：

```typescript
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

@Injectable()
export class AudioService {
  constructor(@InjectQueue('audio') private audioQueue: Queue) {}
}
```

> **提示** `@InjectQueue()` 装饰器通过队列名称进行标识，该名称需与 `registerQueue()` 方法调用时提供的名称一致（例如 `'audio'`）。

通过调用队列的 `add()` 方法并传入用户自定义的任务对象即可添加任务。任务以可序列化的 JavaScript 对象形式表示（因为它们将存储在 Redis 数据库中）。传入的任务对象结构可自定义，用于体现任务语义。

```typescript
const job = await this.audioQueue.add({
  foo: 'bar',
});
```

#### 命名作业

作业可以具有唯一名称。这允许您创建专门的[消费者](techniques/queues#consumers) ，这些消费者仅处理具有特定名称的作业。

```typescript
const job = await this.audioQueue.add('transcode', {
  foo: 'bar',
});
```

warning **警告** 使用命名作业时，必须为添加到队列中的每个唯一名称创建处理器，否则队列会报错提示缺少对应作业的处理器。有关消费命名作业的更多信息，请参阅[此处](techniques/queues#consumers) 。

#### 作业选项

任务可以关联额外的选项。在 `Queue.add()` 方法的 `job` 参数后传递一个选项对象即可。任务选项属性包括：

- `priority`: `number` - 可选优先级值。范围从 1（最高优先级）到 MAX_INT（最低优先级）。请注意使用优先级会对性能产生轻微影响，需谨慎使用。
- `delay`: `number` - 等待处理该任务的毫秒数。请注意要实现精确延迟，服务器和客户端的时钟需保持同步。
- `attempts`: `number` - 任务完成前的尝试总次数。
- `repeat`: `RepeatOpts` - 根据 cron 表达式重复执行任务。详见 [RepeatOpts](https://github.com/OptimalBits/bull/blob/master/REFERENCE.md#queueadd)。
- `backoff`: `number | BackoffOpts` - 任务失败时自动重试的回退设置。详见 [BackoffOpts](https://github.com/OptimalBits/bull/blob/master/REFERENCE.md#queueadd)。
- `lifo`: `boolean` - 若为 true，将任务添加到队列右端而非左端（默认为 false）。
- `timeout`: `number` - 超时毫秒数，超过此时长任务将因超时错误而失败。
- `jobId`: `number` | `string` - 覆盖任务 ID - 默认情况下，任务 ID 是一个唯一的整数，但你可以通过此设置进行覆盖。如果使用此选项，你需要自行确保 jobId 的唯一性。如果尝试添加一个已存在 ID 的任务，该任务将不会被添加。
- `removeOnComplete`: `boolean | number` - 如果为 true，任务成功完成后将被移除。数字参数指定保留的任务数量。默认行为是将任务保留在已完成集合中。
- `removeOnFail`: `boolean | number` - 如果为 true，任务在所有尝试都失败后将被移除。数字参数指定保留的任务数量。默认行为是将任务保留在失败集合中。
- `stackTraceLimit`: `number` - 限制将被记录在堆栈跟踪中的堆栈跟踪行数。

以下是几个使用作业选项自定义作业的示例。

要延迟作业的开始，请使用 `delay` 配置属性。

```typescript
const job = await this.audioQueue.add(
  {
    foo: 'bar',
  },
  { delay: 3000 } // 3 seconds delayed
);
```

若要将作业添加到队列右端（以 **LIFO**（后进先出）方式处理作业），请将配置对象的 `lifo` 属性设为 `true`。

```typescript
const job = await this.audioQueue.add(
  {
    foo: 'bar',
  },
  { lifo: true }
);
```

要优先处理作业，请使用 `priority` 属性。

```typescript
const job = await this.audioQueue.add(
  {
    foo: 'bar',
  },
  { priority: 2 }
);
```

#### 消费者

消费者是一个**类** ，它定义了处理添加到队列中的作业、监听队列事件或同时执行这两种操作的方法。使用 `@Processor()` 装饰器声明消费者类如下：

```typescript
import { Processor } from '@nestjs/bull';

@Processor('audio')
export class AudioConsumer {}
```

> info **注意** 消费者必须注册为 `providers`，这样 `@nestjs/bull` 包才能识别它们。

其中装饰器的字符串参数（例如 `'audio'`）是与类方法关联的队列名称。

在消费者类中，通过使用 `@Process()` 装饰器修饰处理方法来声明任务处理器。

```typescript
import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';

@Processor('audio')
export class AudioConsumer {
  @Process()
  async transcode(job: Job<unknown>) {
    let progress = 0;
    for (let i = 0; i < 100; i++) {
      await doSomething(job.data);
      progress += 1;
      await job.progress(progress);
    }
    return {};
  }
}
```

当工作线程空闲且队列中有待处理任务时，就会调用被装饰的方法（例如 `transcode()`）。该处理方法接收 `job` 对象作为唯一参数，处理方法返回的值会被存储在 job 对象中，后续可被访问，例如在监听完成事件时。

`Job` 对象提供多种方法用于与其状态交互。例如上述代码使用 `progress()` 方法来更新任务进度。完整 `Job` 对象 API 参考请见[此处](https://github.com/OptimalBits/bull/blob/master/REFERENCE.md#job) 。

您可以通过将特定`名称`传递给 `@Process()` 装饰器来指定某个任务处理方法**仅**处理特定类型的任务（具有特定`名称`的任务），如下所示。在给定的消费者类中，您可以有多个 `@Process()` 处理器，分别对应每种任务类型（ `名称` ）。当使用命名任务时，请确保为每个名称都配置对应的处理器。

```typescript
@Process('transcode')
async transcode(job: Job<unknown>) { ... }
```

> warning **注意** 当为同一队列定义多个消费者时， `@Process({ concurrency: 1 })` 中的 `concurrency` 选项将不会生效。最低 `concurrency` 值将与定义的消费者数量匹配。即使 `@Process()` 处理器使用不同的`名称`来处理命名任务，此规则同样适用。

#### 请求作用域的消费者

当消费者被标记为请求作用域时（了解更多关于注入作用域的信息请[点击此处](/fundamentals/injection-scopes#provider-scope) ），系统会为每个任务专门创建该类的新实例。该实例将在任务完成后被垃圾回收。

```typescript
@Processor({
  name: 'audio',
  scope: Scope.REQUEST,
})
```

由于请求作用域的消费者类是动态实例化且限定于单个作业的，因此您可以通过标准方式在构造函数中注入 `JOB_REF`。

```typescript
constructor(@Inject(JOB_REF) jobRef: Job) {
  console.log(jobRef);
}
```

> info **提示** `JOB_REF` 令牌是从 `@nestjs/bull` 包导入的。

#### 事件监听器

当队列和/或作业状态发生变化时，Bull 会生成一系列有用的事件。Nest 提供了一组装饰器，允许订阅核心的标准事件集。这些装饰器从 `@nestjs/bull` 包导出。

事件监听器必须在[消费者](techniques/queues#consumers)类中声明（即在使用 `@Processor()` 装饰器修饰的类中）。要监听事件，请使用下表中的某个装饰器来声明事件处理程序。例如，要监听 `audio` 队列中作业进入活动状态时发出的事件，请使用以下结构：

```typescript
import { Processor, Process, OnQueueActive } from '@nestjs/bull';
import { Job } from 'bull';

@Processor('audio')
export class AudioConsumer {

  @OnQueueActive()
  onActive(job: Job) {
    console.log(
      `Processing job ${job.id} of type ${job.name} with data ${job.data}...`,
    );
  }
  ...
```

由于 Bull 运行在分布式（多节点）环境中，它定义了事件局部性的概念。这一概念认识到事件可能完全在单个进程内触发，也可能来自不同进程的共享队列。 **本地**事件是指在本地进程中的队列上触发操作或状态更改时产生的事件。换句话说，当您的事件生产者和消费者都位于单个进程内时，队列上发生的所有事件都是本地的。

当队列在多个进程间共享时，我们可能会遇到**全局**事件的情况。一个进程中的监听器要接收由另一个进程触发的事件通知，必须注册为全局事件。

每当触发相应事件时，事件处理程序就会被调用。处理程序会按照下表中显示的签名进行调用，从而提供对事件相关信息的访问权限。下面我们将讨论本地和全局事件处理程序签名之间的一个关键区别。

| 本地事件监听器      | 全局事件监听器            | 处理方法签名/触发时机                                                                                         |
| ------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| @OnQueueError()     | @OnGlobalQueueError()     | handler(error: Error) - 发生错误。error 包含触发的错误对象。                                                  |
| @OnQueueWaiting()   | @OnGlobalQueueWaiting()   | handler(jobId: number                                                                                         | string) - 当工作线程空闲时，一个待处理任务将立即被处理。jobId 包含进入此状态的任务 ID。 |
| @OnQueueActive()    | @OnGlobalQueueActive()    | handler(job: Job) - 任务 job 已启动。                                                                         |
| @OnQueueStalled()   | @OnGlobalQueueStalled()   | handler(job: Job) - 任务 job 已被标记为停滞状态。这对于调试崩溃或暂停事件循环的工作线程非常有用。             |
| @OnQueueProgress()  | @OnGlobalQueueProgress()  | handler(job: Job, progress: number) 作业 job 的进度已更新为值 progress。                                      |
| @OnQueueCompleted() | @OnGlobalQueueCompleted() | handler(job: Job, result: any) 作业 job 成功完成，结果为 result。                                             |
| @OnQueueFailed()    | @OnGlobalQueueFailed()    | handler(job: Job, err: Error) 作业 job 因原因 err 失败。                                                      |
| @OnQueuePaused()    | @OnGlobalQueuePaused()    | handler() 队列已暂停。                                                                                        |
| @OnQueueResumed()   | @OnGlobalQueueResumed()   | handler(job: Job) 队列已恢复。                                                                                |
| @OnQueueCleaned()   | @OnGlobalQueueCleaned()   | handler(jobs: Job\[\], type: string) 旧任务已从队列中清理。jobs 是被清理的任务数组，type 是被清理的任务类型。 |
| @OnQueueDrained()   | @OnGlobalQueueDrained()   | handler() 当队列处理完所有等待中的任务时触发（即使可能还存在一些延迟任务尚未处理）。                          |
| @OnQueueRemoved()   | @OnGlobalQueueRemoved()   | handler(job: Job) 任务 job 已成功移除。                                                                       |

监听全局事件时，方法签名可能与本地版本略有不同。具体来说，本地版本中接收 `job` 对象的方法签名，在全局版本中会改为接收 `jobId`（`number` 类型）。要在此情况下获取实际 `job` 对象的引用，请使用 `Queue#getJob` 方法。此调用需要等待，因此处理程序应声明为 `async`。例如：

```typescript
@OnGlobalQueueCompleted()
async onGlobalCompleted(jobId: number, result: any) {
  const job = await this.immediateQueue.getJob(jobId);
  console.log('(Global) on completed: job ', job.id, ' -> result: ', result);
}
```

> **提示** 要访问 `Queue` 对象（以进行 `getJob()` 调用），当然需要先注入它。此外，Queue 必须在你执行注入的模块中完成注册。

除了特定的事件监听器装饰器外，你还可以使用通用的 `@OnQueueEvent()` 装饰器，配合 `BullQueueEvents` 或 `BullQueueGlobalEvents` 枚举使用。了解更多关于事件的信息[请点击这里](https://github.com/OptimalBits/bull/blob/master/REFERENCE.md#events) 。

#### 队列管理

队列提供了一套 API，允许您执行管理功能，如暂停和恢复、获取不同状态下作业的数量等更多操作。完整的队列 API 可[在此](https://github.com/OptimalBits/bull/blob/master/REFERENCE.md#queue)查看。您可以直接在 `Queue` 对象上调用这些方法，如下所示的暂停/恢复示例。

通过调用 `pause()` 方法暂停队列。暂停的队列将不会处理新作业，但当前正在处理的作业会继续执行直至完成。

```typescript
await audioQueue.pause();
```

要恢复已暂停的队列，请使用如下所示的 `resume()` 方法：

```typescript
await audioQueue.resume();
```

#### 独立进程

作业处理器也可以在独立的（forked）进程中运行（ [来源](https://github.com/OptimalBits/bull#separate-processes) ）。这具有以下几个优势：

- 该进程处于沙箱环境中，因此即使崩溃也不会影响工作线程。
- 可以运行阻塞代码而不影响队列（任务不会停滞）。
- 能更充分地利用多核 CPU 资源。
- 减少与 Redis 的连接。

```ts title="app.module"
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { join } from 'path';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'audio',
      processors: [join(__dirname, 'processor.js')],
    }),
  ],
})
export class AppModule {}
```

请注意，由于您的函数是在分叉进程中执行的，依赖注入（及 IoC 容器）将不可用。这意味着您的处理器函数需要包含（或创建）所需的所有外部依赖实例。

```ts title="processor"
import { Job, DoneCallback } from 'bull';

export default function (job: Job, cb: DoneCallback) {
  console.log(`[${process.pid}] ${JSON.stringify(job.data)}`);
  cb(null, 'It works');
}
```

#### 异步配置

您可能希望异步传递 `bull` 选项而非静态传递。在这种情况下，可使用 `forRootAsync()` 方法，该方法提供了多种处理异步配置的方式。

一种方法是使用工厂函数：

```typescript
BullModule.forRootAsync({
  useFactory: () => ({
    redis: {
      host: 'localhost',
      port: 6379,
    },
  }),
});
```

我们的工厂与任何其他[异步提供者](https://docs.nestjs.com/fundamentals/async-providers)行为一致（例如，它可以是 `async` 的，并且能够通过 `inject` 注入依赖项）。

```typescript
BullModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => ({
    redis: {
      host: configService.get('QUEUE_HOST'),
      port: configService.get('QUEUE_PORT'),
    },
  }),
  inject: [ConfigService],
});
```

或者，您也可以使用 `useClass` 语法：

```typescript
BullModule.forRootAsync({
  useClass: BullConfigService,
});
```

上述构造方式将在 `BullModule` 内部实例化 `BullConfigService`，并通过调用 `createSharedConfiguration()` 来提供配置对象。需要注意的是，这意味着 `BullConfigService` 必须实现 `SharedBullConfigurationFactory` 接口，如下所示：

```typescript
@Injectable()
class BullConfigService implements SharedBullConfigurationFactory {
  createSharedConfiguration(): BullModuleOptions {
    return {
      redis: {
        host: 'localhost',
        port: 6379,
      },
    };
  }
}
```

若要避免在 `BullModule` 内部创建 `BullConfigService`，转而使用从其他模块导入的提供者，可以采用 `useExisting` 语法。

```typescript
BullModule.forRootAsync({
  imports: [ConfigModule],
  useExisting: ConfigService,
});
```

这种构造方式与 `useClass` 的工作原理相同，但有一个关键区别——`BullModule` 会查找已导入的模块来重用现有的 `ConfigService`，而不是实例化一个新的。

同样地，如果您想异步传递队列选项，可以使用 `registerQueueAsync()` 方法，只需记住要在工厂函数外部指定 `name` 属性。

```typescript
BullModule.registerQueueAsync({
  name: 'audio',
  useFactory: () => ({
    redis: {
      host: 'localhost',
      port: 6379,
    },
  }),
});
```

#### 示例

一个可用的示例[在此处](https://github.com/nestjs/nest/tree/master/sample/26-queues)查看。
