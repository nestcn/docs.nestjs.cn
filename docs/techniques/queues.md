<!-- 此文件从 content/techniques\queues.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-03T07:09:52.761Z -->
<!-- 源文件: content/techniques\queues.md -->

### 队列

队列是一种强大的设计模式，可以帮助您应对常见的应用程序扩展和性能挑战。队列可以帮助您解决的一些问题示例包括：

- 平滑处理峰值。例如，如果用户可以在任意时间启动资源密集型任务，您可以将这些任务添加到队列中，而不是同步执行它们。然后，您可以让工作进程以受控方式从队列中提取任务。随着应用程序的扩展，您可以轻松添加新的队列消费者来扩展后端任务处理。
- 分解可能会阻塞 Node.js 事件循环的整体任务。例如，如果用户请求需要 CPU 密集型工作（如音频转码），您可以将此任务委托给其他进程，释放面向用户的进程以保持响应。
- 提供跨各种服务的可靠通信渠道。例如，您可以在一个进程或服务中排队任务（作业），并在另一个进程或服务中消费它们。您可以在作业生命周期中的完成、错误或其他状态变化时（通过监听状态事件）从任何进程或服务收到通知。当队列生产者或消费者失败时，它们的状态会被保留，并且当节点重新启动时，任务处理可以自动重启。

Nest 提供了用于 BullMQ 集成的 `@nestjs/bullmq` 包和用于 Bull 集成的 `@nestjs/bull` 包。这两个包都是各自库的抽象/包装器，由同一团队开发。Bull 当前处于维护模式，团队专注于修复错误，而 BullMQ 正在积极开发中，具有现代 TypeScript 实现和不同的功能集。如果 Bull 满足您的要求，它仍然是一个可靠且经过实战检验的选择。Nest 包使您可以轻松地以友好的方式将 BullMQ 或 Bull 队列集成到 Nest 应用程序中。

BullMQ 和 Bull 都使用 [Redis](https://redis.io/) 来持久化作业数据，因此您需要在系统上安装 Redis。由于它们是由 Redis 支持的，您的队列架构可以完全分布式且平台无关。例如，您可以让一些队列 <a href="techniques/queues#生产者">生产者</a>、<a href="techniques/queues#消费者">消费者</a> 和 <a href="techniques/queues#事件监听器">监听器</a> 在一个（或多个）节点上的 Nest 中运行，而其他生产者、消费者和监听器在其他网络节点上的其他 Node.js 平台上运行。

本章涵盖 `@nestjs/bullmq` 和 `@nestjs/bull` 包。我们还建议阅读 [BullMQ](https://docs.bullmq.io/) 和 [Bull](https://github.com/OptimalBits/bull/blob/master/REFERENCE.md) 文档，以了解更多背景和特定实现细节。

#### BullMQ 安装

要开始使用 BullMQ，我们首先安装所需的依赖。

```bash
$ npm install --save @nestjs/bullmq bullmq

```

安装过程完成后，我们可以将 `BullModule` 导入到根 `AppModule` 中。

```typescript
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

`forRoot()` 方法用于注册一个 `bullmq` 包配置对象，该对象将被应用程序中注册的所有队列使用（除非另有说明）。供您参考，配置对象中的以下是几个属性：

- `connection: ConnectionOptions` - 配置 Redis 连接的选项。有关更多信息，请参阅 [Connections](https://docs.bullmq.io/guide/connections)。可选。
- `prefix: string` - 所有队列键的前缀。可选。
- `defaultJobOptions: JobOpts` - 控制新作业默认设置的选项。有关更多信息，请参阅 [JobOpts](https://github.com/OptimalBits/bull/blob/master/REFERENCE.md#queueadd)。可选。
- `settings: AdvancedSettings` - 高级队列配置设置。这些通常不应更改。有关更多信息，请参阅 [AdvancedSettings](https://github.com/OptimalBits/bull/blob/master/REFERENCE.md#queue)。可选。
- `extraOptions` - 模块初始化的额外选项。请参阅 [Manual Registration](/techniques/queues#manual-registration)

所有选项都是可选的，提供对队列行为的详细控制。这些直接传递给 BullMQ `Queue` 构造函数。有关这些选项和其他选项的更多信息，请 [点击这里](https://api.docs.bullmq.io/interfaces/v4.QueueOptions.html)。

要注册队列，导入 `BullModule.registerQueue()` 动态模块，如下所示：

```typescript
BullModule.registerQueue({
  name: 'audio',
});

```

> info **提示** 通过向 `registerQueue()` 方法传递多个逗号分隔的配置对象来创建多个队列。

`registerQueue()` 方法用于实例化和/或注册队列。队列在连接到相同底层 Redis 数据库并使用相同凭据的模块和进程之间共享。每个队列通过其 name 属性唯一。队列名称既用作注入令牌（用于将队列注入到控制器/提供者中），也用作装饰器的参数，以将消费者类和监听器与队列关联。

您还可以为特定队列覆盖一些预配置的选项，如下所示：

```typescript
BullModule.registerQueue({
  name: 'audio',
  connection: {
    port: 6380,
  },
});

```

BullMQ 还支持作业之间的父子关系。此功能使创建作业作为任意深度树节点的流程成为可能。要了解更多信息，请查看 [这里](https://docs.bullmq.io/guide/flows)。

要添加流，您可以执行以下操作：

```typescript
BullModule.registerFlowProducer({
  name: 'flowProducerName',
});

```

由于作业在 Redis 中持久化，每次实例化特定命名队列时（例如，当应用程序启动/重启时），它会尝试处理可能存在的任何来自先前未完成会话的旧作业。

每个队列可以有一个或多个生产者、消费者和监听器。消费者以特定顺序从队列中检索作业：FIFO（默认）、LIFO 或根据优先级。控制队列处理顺序将在 <a href="techniques/queues#消费者">这里</a> 讨论。

<app-banner-enterprise></app-banner-enterprise>

#### 命名配置

如果您的队列连接到多个不同的 Redis 实例，您可以使用一种称为**命名配置**的技术。此功能允许您在指定的键下注册多个配置，然后您可以在队列选项中引用这些配置。

例如，假设您有一个额外的 Redis 实例（除了默认实例之外），由应用程序中注册的几个队列使用，您可以如下注册其配置：

```typescript
BullModule.forRoot('alternative-config', {
  connection: {
    port: 6381,
  },
});

```

在上面的示例中，`'alternative-config'` 只是一个配置键（它可以是任何任意字符串）。

有了这个，您现在可以在 `registerQueue()` 选项对象中指向此配置：

```typescript
BullModule.registerQueue({
  configKey: 'alternative-config',
  name: 'video',
});

```

#### 生产者

作业生产者将作业添加到队列中。生产者通常是应用程序服务（Nest [](/overview/providers)）。要向队列添加作业，首先将队列注入到服务中，如下所示：

```typescript
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';

@Injectable()
export class AudioService {
  constructor(@InjectQueue('audio') private audioQueue: Queue) {}
}

```

> info **提示** `@InjectQueue()` 装饰器通过其名称标识队列，如在 `registerQueue()` 方法调用中提供的那样（例如 `'audio'`）。

现在，通过调用队列的 `add()` 方法，传递用户定义的作业对象来添加作业。作业表示为可序列化的 JavaScript 对象（因为它们就是这样存储在 Redis 数据库中的）。您传递的作业的形状是任意的；使用它来表示您的作业对象的语义。您还需要给它一个名称。这允许您创建专门的 <a href="techniques/queues#消费者">消费者</a>，它们只会处理具有给定名称的作业。

```typescript
const job = await this.audioQueue.add('transcode', {
  foo: 'bar',
});

```

#### 作业选项

作业可以具有与其关联的附加选项。在 `Queue.add()` 方法中的 `job` 参数之后传递一个选项对象。一些作业选项属性是：

- `priority`: `number` - 可选优先级值。范围从 1（最高优先级）到 MAX_INT（最低优先级）。请注意，使用优先级对性能有轻微影响，因此请谨慎使用。
- `delay`: `number` - 等待此作业可以处理的时间量（毫秒）。请注意，为了准确延迟，服务器和客户端都应该同步时钟。
- `attempts`: `number` - 尝试作业直到完成的总次数。
- `repeat`: `RepeatOpts` - 根据 cron 规范重复作业。请参阅 [RepeatOpts](https://github.com/OptimalBits/bull/blob/master/REFERENCE.md#queueadd)。
- `backoff`: `number | BackoffOpts` - 如果作业失败，自动重试的退避设置。请参阅 [BackoffOpts](https://github.com/OptimalBits/bull/blob/master/REFERENCE.md#queueadd)。
- `lifo`: `boolean` - 如果为 true，则将作业添加到队列的右端而不是左端（默认 false）。
- `jobId`: `number` | `string` - 覆盖作业 ID - 默认情况下，作业 ID 是唯一的整数，但您可以使用此设置覆盖它。如果使用此选项，由您负责确保 jobId 是唯一的。如果您尝试添加具有已存在 ID 的作业，它将不会被添加。
- `removeOnComplete`: `boolean | number` - 如果为 true，则在作业成功完成时删除它。数字指定要保留的作业数量。默认行为是将作业保留在已完成集合中。
- `removeOnFail`: `boolean | number` - 如果为 true，则在作业在所有尝试后失败时删除它。数字指定要保留的作业数量。默认行为是将作业保留在失败集合中。
- `stackTraceLimit`: `number` - 限制将在堆栈跟踪中记录的堆栈跟踪行数。

以下是使用作业选项自定义作业的几个示例。

要延迟作业的开始，请使用 `delay` 配置属性。

```typescript
const job = await this.audioQueue.add(
  'transcode',
  {
    foo: 'bar',
  },
  { delay: 3000 }, // 延迟 3 秒
);

```

要将作业添加到队列的右端（将作业作为 **LIFO**（后进先出）处理），将配置对象的 `lifo` 属性设置为 `true`。

```typescript
const job = await this.audioQueue.add(
  'transcode',
  {
    foo: 'bar',
  },
  { lifo: true },
);

```

要为作业设置优先级，请使用 `priority` 属性。

```typescript
const job = await this.audioQueue.add(
  'transcode',
  {
    foo: 'bar',
  },
  { priority: 2 },
);

```

有关选项的完整列表，请查看 API 文档 [这里](https://api.docs.bullmq.io/types/v4.JobsOptions.html) 和 [这里](https://api.docs.bullmq.io/interfaces/v4.BaseJobOptions.html)。

#### 消费者

消费者是一个**类**，定义了处理添加到队列中的作业、监听队列上的事件或两者兼有的方法。使用 `@Processor()` 装饰器声明消费者类，如下所示：

```typescript
import { Processor } from '@nestjs/bullmq';

@Processor('audio')
export class AudioConsumer {}

```

> info **提示** 消费者必须注册为 `providers`，以便 `@nestjs/bullmq` 包可以拾取它们。

其中装饰器的字符串参数（例如 `'audio'`）是要与类方法关联的队列的名称。

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

每当工作进程空闲且队列中有作业要处理时，就会调用 process 方法。此处理程序方法接收 `job` 对象作为其唯一参数。处理程序方法返回的值存储在作业对象中，稍后可以访问，例如在完成事件的监听器中。

`Job` 对象有多种方法允许您与它们的状态交互。例如，上面的代码使用 `updateProgress()` 方法来更新作业的进度。有关完整的 `Job` 对象 API 参考，请参见 [这里](https://api.docs.bullmq.io/classes/v4.Job.html)。

在旧版本的 Bull 中，您可以通过将该 `name` 传递给 `@Process()` 装饰器来指定作业处理程序方法将**仅**处理特定类型的作业（具有特定 `name` 的作业），如下所示。

> warning **警告** 这在 BullMQ 中不起作用，请继续阅读。

```typescript
@Process('transcode')
async transcode(job: Job<unknown>) { ... }

```

由于它产生的混淆，此行为在 BullMQ 中不受支持。相反，您需要使用 switch 语句为每个作业名称调用不同的服务或逻辑：

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

这在 BullMQ 文档的 [命名处理器](https://docs.bullmq.io/patterns/named-processor) 部分中有所介绍。

#### 请求作用域消费者

当消费者被标记为请求作用域时（了解更多关于注入作用域 [这里](/fundamentals/provider-scopes#提供者作用域)），将为每个作业创建该类的新实例。该实例将在作业完成后被垃圾回收。

```typescript
@Processor({
  name: 'audio',
  scope: Scope.REQUEST,
})

```

由于请求作用域消费者类是动态实例化的并且作用域限定为单个作业，您可以通过构造函数使用标准方法注入 `JOB_REF`。

```typescript
constructor(@Inject(JOB_REF) jobRef: Job) {
  console.log(jobRef);
}

```

> info **提示** `JOB_REF` 令牌从 `@nestjs/bullmq` 包导入。

#### 事件监听器

当队列和/或作业状态发生变化时，BullMQ 会生成一组有用的事件。这些事件可以在 Worker 级别使用 `@OnWorkerEvent(event)` 装饰器订阅，或在 Queue 级别使用专用的监听器类和 `@OnQueueEvent(event)` 装饰器订阅。

Worker 事件必须在 <a href="techniques/queues#消费者">消费者</a> 类中声明（即，在使用 `@Processor()` 装饰器装饰的类中）。要监听事件，请使用 `@OnWorkerEvent(event)` 装饰器和您想要处理的事件。例如，要监听 `audio` 队列中作业进入活动状态时发出的事件，请使用以下构造：

```typescript
import { Processor, Process, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('audio')
export class AudioConsumer {
  @OnWorkerEvent('active')
  onActive(job: Job) {
    console.log(
      `Processing job ${job.id} of type ${job.name} with data ${job.data}...`,
    );
  }

  // ...
}

```

您可以在 [这里](https://api.docs.bullmq.io/interfaces/v4.WorkerListener.html) 看到完整的事件列表及其作为 WorkerListener 属性的参数。

QueueEvent 监听器必须使用 `@QueueEventsListener(queue)` 装饰器并扩展 `@nestjs/bullmq` 提供的 `QueueEventsHost` 类。要监听事件，请使用 `@OnQueueEvent(event)` 装饰器和您想要处理的事件。例如，要监听 `audio` 队列中作业进入活动状态时发出的事件，请使用以下构造：

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

> info **提示** QueueEvent 监听器必须注册为 `providers`，以便 `@nestjs/bullmq` 包可以拾取它们。

您可以在 [这里](https://api.docs.bullmq.io/interfaces/v4.QueueEventsListener.html) 看到完整的事件列表及其作为 QueueEventsListener 属性的参数。

#### 队列管理

队列有一个 API，允许您执行管理功能，如暂停和恢复，检索各种状态下的作业计数等。您可以在 [这里](https://api.docs.bullmq.io/classes/v4.Queue.html) 找到完整的队列 API。直接在 `Queue` 对象上调用这些方法，如下所示的暂停/恢复示例。

使用 `pause()` 方法调用暂停队列。暂停的队列在恢复之前不会处理新作业，但正在处理的当前作业将继续直到完成。

```typescript
await audioQueue.pause();

```

要恢复暂停的队列，请使用 `resume()` 方法，如下所示：

```typescript
await audioQueue.resume();

```

#### 单独进程

作业处理程序也可以在单独的（分叉的）进程中运行（[来源](https://docs.bullmq.io/guide/workers/sandboxed-processors)）。这有几个优点：

- 进程被沙箱化，因此如果它崩溃，不会影响工作进程。
- 您可以运行阻塞代码而不会影响队列（作业不会停滞）。
- 更好地利用多核 CPU。
- 更少的 Redis 连接。

```typescript
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { join } from 'node:path';

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

> warning **警告** 请注意，因为您的函数在分叉进程中执行，所以依赖注入（和 IoC 容器）将不可用。这意味着您的处理器函数需要包含（或创建）它需要的所有外部依赖项实例。

#### 异步配置

您可能希望异步传递 `bullmq` 选项，而不是静态传递。在这种情况下，使用 `forRootAsync()` 方法，该方法提供了几种处理异步配置的方法。同样，如果您想异步传递队列选项，请使用 `registerQueueAsync()` 方法。

一种方法是使用工厂函数：

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

我们的工厂行为类似于任何其他 [异步提供者](/fundamentals/async-components)（例如，它可以是 `async` 并且能够通过 `inject` 注入依赖项）。

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

或者，您可以使用 `useClass` 语法：

```typescript
BullModule.forRootAsync({
  useClass: BullConfigService,
});

```

上面的构造将在 `BullModule` 内部实例化 `BullConfigService`，并使用它通过调用 `createSharedConfiguration()` 来提供选项对象。请注意，这意味着 `BullConfigService` 必须实现 `SharedBullConfigurationFactory` 接口，如下所示：

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

为了防止在 `BullModule` 内部创建 `BullConfigService` 并使用从不同模块导入的提供者，您可以使用 `useExisting` 语法。

```typescript
BullModule.forRootAsync({
  imports: [ConfigModule],
  useExisting: ConfigService,
});

```

此构造的工作方式与 `useClass` 相同，但有一个关键区别 - `BullModule` 将查找导入的模块以重用现有的 `ConfigService`，而不是实例化新的。

同样，如果您想异步传递队列选项，请使用 `registerQueueAsync()` 方法，只需记住在工厂函数外部指定 `name` 属性。

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

默认情况下，`BullModule` 会在 `onModuleInit` 生命周期函数中自动注册 BullMQ 组件（队列、处理器和事件监听器服务）。然而，在某些情况下，这种行为可能不理想。要防止自动注册，请在 `BullModule` 中启用 `manualRegistration`，如下所示：

```typescript
BullModule.forRoot({
  extraOptions: {
    manualRegistration: true,
  },
});

```

要手动注册这些组件，请注入 `BullRegistrar` 并调用 `register` 函数，理想情况下在 `OnModuleInit` 或 `OnApplicationBootstrap` 中。

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

除非您调用 `BullRegistrar#register` 函数，否则没有 BullMQ 组件会工作 - 这意味着没有作业会被处理。

#### Bull 安装

> warning **注意** 如果您决定使用 BullMQ，请跳过此部分和以下章节。

要开始使用 Bull，我们首先安装所需的依赖。

```bash
$ npm install --save @nestjs/bull bull

```

安装过程完成后，我们可以将 `BullModule` 导入到根 `AppModule` 中。

```typescript
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

`forRoot()` 方法用于注册一个 `bull` 包配置对象，该对象将被应用程序中注册的所有队列使用（除非另有说明）。配置对象由以下属性组成：

- `limiter: RateLimiter` - 控制队列作业处理速率的选项。有关更多信息，请参阅 [RateLimiter](https://github.com/OptimalBits/bull/blob/master/REFERENCE.md#queue)。可选。
- `redis: RedisOpts` - 配置 Redis 连接的选项。有关更多信息，请参阅 [RedisOpts](https://github.com/OptimalBits/bull/blob/master/REFERENCE.md#queue)。可选。
- `prefix: string` - 所有队列键的前缀。可选。
- `defaultJobOptions: JobOpts` - 控制新作业默认设置的选项。有关更多信息，请参阅 [JobOpts](https://github.com/OptimalBits/bull/blob/master/REFERENCE.md#queueadd)。可选。**注意：如果您通过 FlowProducer 调度作业，这些不会生效。请参阅 [bullmq#1034](https://github.com/taskforcesh/bullmq/issues/1034) 了解解释。**
- `settings: AdvancedSettings` - 高级队列配置设置。这些通常不应更改。有关更多信息，请参阅 [AdvancedSettings](https://github.com/OptimalBits/bull/blob/master/REFERENCE.md#queue)。可选。

所有选项都是可选的，提供对队列行为的详细控制。这些直接传递给 Bull `Queue` 构造函数。有关这些选项的更多信息，请 [点击这里](https://github.com/OptimalBits/bull/blob/master/REFERENCE.md#queue)。

要注册队列，导入 `BullModule.registerQueue()` 动态模块，如下所示：

```typescript
BullModule.registerQueue({
  name: 'audio',
});

```

> info **提示** 通过向 `registerQueue()` 方法传递多个逗号分隔的配置对象来创建多个队列。

`registerQueue()` 方法用于实例化和/或注册队列。队列在连接到相同底层 Redis 数据库并使用相同凭据的模块和进程之间共享。每个队列通过其 name 属性唯一。队列名称既用作注入令牌（用于将队列注入到控制器/提供者中），也用作装饰器的参数，以将消费者类和监听器与队列关联。

您还可以为特定队列覆盖一些预配置的选项，如下所示：

```typescript
BullModule.registerQueue({
  name: 'audio',
  redis: {
    port: 6380,
  },
});

```

由于作业在 Redis 中持久化，每次实例化特定命名队列时（例如，当应用程序启动/重启时），它会尝试处理可能存在的任何来自先前未完成会话的旧作业。

每个队列可以有一个或多个生产者、消费者和监听器。消费者以特定顺序从队列中检索作业：FIFO（默认）、LIFO 或根据优先级。控制队列处理顺序将在 <a href="techniques/queues#消费者">这里</a> 讨论。

<app-banner-enterprise></app-banner-enterprise>

#### 命名配置

如果您的队列连接到多个 Redis 实例，您可以使用一种称为**命名配置**的技术。此功能允许您在指定的键下注册多个配置，然后您可以在队列选项中引用这些配置。

例如，假设您有一个额外的 Redis 实例（除了默认实例之外），由应用程序中注册的几个队列使用，您可以如下注册其配置：

```typescript
BullModule.forRoot('alternative-config', {
  redis: {
    port: 6381,
  },
});

```

在上面的示例中，`'alternative-config'` 只是一个配置键（它可以是任何任意字符串）。

有了这个，您现在可以在 `registerQueue()` 选项对象中指向此配置：

```typescript
BullModule.registerQueue({
  configKey: 'alternative-config',
  name: 'video',
});

```

#### 生产者

作业生产者将作业添加到队列中。生产者通常是应用程序服务（Nest [](/overview/providers)）。要向队列添加作业，首先将队列注入到服务中，如下所示：

```typescript
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

@Injectable()
export class AudioService {
  constructor(@InjectQueue('audio') private audioQueue: Queue) {}
}

```

> info **提示** `@InjectQueue()` 装饰器通过其名称标识队列，如在 `registerQueue()` 方法调用中提供的那样（例如 `'audio'`）。

现在，通过调用队列的 `add()` 方法，传递用户定义的作业对象来添加作业。作业表示为可序列化的 JavaScript 对象（因为它们就是这样存储在 Redis 数据库中的）。您传递的作业的形状是任意的；使用它来表示您的作业对象的语义。

```typescript
const job = await this.audioQueue.add({
  foo: 'bar',
});

```

#### 命名作业

作业可以有唯一的名称。这允许您创建专门的 <a href="techniques/queues#消费者">消费者</a>，它们只会处理具有给定名称的作业。

```typescript
const job = await this.audioQueue.add('transcode', {
  foo: 'bar',
});

```

> Warning **警告** 使用命名作业时，您必须为添加到队列的每个唯一名称创建处理器，否则队列会抱怨您缺少给定作业的处理器。有关消费命名作业的更多信息，请参阅 <a href="techniques/queues#消费者">这里</a>。

#### 作业选项

作业可以具有与其关联的附加选项。在 `Queue.add()` 方法中的 `job` 参数之后传递一个选项对象。作业选项属性是：

- `priority`: `number` - 可选优先级值。范围从 1（最高优先级）到 MAX_INT（最低优先级）。请注意，使用优先级对性能有轻微影响，因此请谨慎使用。
- `delay`: `number` - 等待此作业可以处理的时间量（毫秒）。请注意，为了准确延迟，服务器和客户端都应该同步时钟。
- `attempts`: `number` - 尝试作业直到完成的总次数。
- `repeat`: `RepeatOpts` - 根据 cron 规范重复作业。请参阅 [RepeatOpts](https://github.com/OptimalBits/bull/blob/master/REFERENCE.md#queueadd)。
- `backoff`: `number | BackoffOpts` - 如果作业失败，自动重试的退避设置。请参阅 [BackoffOpts](https://github.com/OptimalBits/bull/blob/master/REFERENCE.md#queueadd)。
- `lifo`: `boolean` - 如果为 true，则将作业添加到队列的右端而不是左端（默认 false）。
- `timeout`: `number` - 作业应在多长时间（毫秒）后因超时错误而失败。
- `jobId`: `number` | `string` - 覆盖作业 ID - 默认情况下，作业 ID 是唯一的整数，但您可以使用此设置覆盖它。如果使用此选项，由您负责确保 jobId 是唯一的。如果您尝试添加具有已存在 ID 的作业，它将不会被添加。
- `removeOnComplete`: `boolean | number` - 如果为 true，则在作业成功完成时删除它。数字指定要保留的作业数量。默认行为是将作业保留在已完成集合中。
- `removeOnFail`: `boolean | number` - 如果为 true，则在作业在所有尝试后失败时删除它。数字指定要保留的作业数量。默认行为是将作业保留在失败集合中。
- `stackTraceLimit`: `number` - 限制将在堆栈跟踪中记录的堆栈跟踪行数。

以下是使用作业选项自定义作业的几个示例。

要延迟作业的开始，请使用 `delay` 配置属性。

```typescript
const job = await this.audioQueue.add(
  {
    foo: 'bar',
  },
  { delay: 3000 }, // 延迟 3 秒
);

```

要将作业添加到队列的右端（将作业作为 **LIFO**（后进先出）处理），将配置对象的 `lifo` 属性设置为 `true`。

```typescript
const job = await this.audioQueue.add(
  {
    foo: 'bar',
  },
  { lifo: true },
);

```

要为作业设置优先级，请使用 `priority` 属性。

```typescript
const job = await this.audioQueue.add(
  {
    foo: 'bar',
  },
  { priority: 2 },
);

```

#### 消费者

消费者是一个**类**，定义了处理添加到队列中的作业、监听队列上的事件或两者兼有的方法。使用 `@Processor()` 装饰器声明消费者类，如下所示：

```typescript
import { Processor } from '@nestjs/bull';

@Processor('audio')
export class AudioConsumer {}

```

> info **提示** 消费者必须注册为 `providers`，以便 `@nestjs/bull` 包可以拾取它们。

其中装饰器的字符串参数（例如 `'audio'`）是要与类方法关联的队列的名称。

在消费者类中，通过使用 `@Process()` 装饰器装饰处理程序方法来声明作业处理程序。

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

每当工作进程空闲且队列中有作业要处理时，就会调用装饰的方法（例如 `transcode()`）。此处理程序方法接收 `job` 对象作为其唯一参数。处理程序方法返回的值存储在作业对象中，稍后可以访问，例如在完成事件的监听器中。

`Job` 对象有多种方法允许您与它们的状态交互。例如，上面的代码使用 `progress()` 方法来更新作业的进度。有关完整的 `Job` 对象 API 参考，请参见 [这里](https://github.com/OptimalBits/bull/blob/master/REFERENCE.md#job)。

您可以通过将该 `name` 传递给 `@Process()` 装饰器来指定作业处理程序方法将**仅**处理特定类型的作业（具有特定 `name` 的作业），如下所示。在给定的消费者类中，您可以有多个 `@Process()` 处理程序，对应于每种作业类型（`name`）。使用命名作业时，请确保为每个名称都有一个处理程序。

```typescript
@Process('transcode')
async transcode(job: Job<unknown>) { ... }

```

> warning **警告** 为同一队列定义多个消费者时，`@Process({{ '{' }} concurrency: 1 {{ '}' }})` 中的 `concurrency` 选项不会生效。最小 `concurrency` 将匹配定义的消费者数量。即使 `@Process()` 处理程序使用不同的 `name` 来处理命名作业，这也适用。

#### 请求作用域消费者

当消费者被标记为请求作用域时（了解更多关于注入作用域 [这里](/fundamentals/provider-scopes#提供者作用域)），将为每个作业创建该类的新实例。该实例将在作业完成后被垃圾回收。

```typescript
@Processor({
  name: 'audio',
  scope: Scope.REQUEST,
})

```

由于请求作用域消费者类是动态实例化的并且作用域限定为单个作业，您可以通过构造函数使用标准方法注入 `JOB_REF`。

```typescript
constructor(@Inject(JOB_REF) jobRef: Job) {
  console.log(jobRef);
}

```

> info **提示** `JOB_REF` 令牌从 `@nestjs/bull` 包导入。

#### 事件监听器

当队列和/或作业状态发生变化时，Bull 会生成一组有用的事件。Nest 提供了一组装饰器，允许订阅一组核心标准事件。这些从 `@nestjs/bull` 包导出。

事件监听器必须在 <a href="techniques/queues#消费者">消费者</a> 类中声明（即，在使用 `@Processor()` 装饰器装饰的类中）。要监听事件，请使用下表中的装饰器之一来声明事件的处理程序。例如，要监听 `audio` 队列中作业进入活动状态时发出的事件，请使用以下构造：

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

由于 Bull 在分布式（多节点）环境中运行，它定义了事件局部性的概念。这个概念认识到事件可能在单个进程内完全触发，或者在不同进程的共享队列上触发。**本地**事件是指当本地进程中队列上的操作或状态更改触发时产生的事件。换句话说，当您的事件生产者和消费者在单个进程本地时，队列上发生的所有事件都是本地的。

当队列在多个进程之间共享时，我们会遇到**全局**事件的可能性。对于一个进程中的监听器接收由另一个进程触发的事件通知，它必须注册全局事件。

事件处理程序在其相应事件发出时被调用。处理程序以下表中显示的签名调用，提供对与事件相关的信息的访问。我们在下面讨论本地和全局事件处理程序签名之间的一个关键区别。

<table>
  <tr>
    <th>本地事件监听器</th>
    <th>全局事件监听器</th>
    <th>处理程序方法签名 / 触发时机</th>
  </tr>
  <tr>
    <td><code>@OnQueueError()</code></td><td><code>@OnGlobalQueueError()</code></td><td><code>handler(error: Error)</code> - 发生错误。<code>error</code> 包含触发错误。</td>
  </tr>
  <tr>
    <td><code>@OnQueueWaiting()</code></td><td><code>@OnGlobalQueueWaiting()</code></td><td><code>handler(jobId: number | string)</code> - 作业等待处理，一旦工作进程空闲。<code>jobId</code> 包含进入此状态的作业的 ID。</td>
  </tr>
  <tr>
    <td><code>@OnQueueActive()</code></td><td><code>@OnGlobalQueueActive()</code></td><td><code>handler(job: Job)</code> - 作业 <code>job</code> 已开始。</td>
  </tr>
  <tr>
    <td><code>@OnQueueStalled()</code></td><td><code>@OnGlobalQueueStalled()</code></td><td><code>handler(job: Job)</code> - 作业 <code>job</code> 已被标记为停滞。这对于调试崩溃或暂停事件循环的作业工作进程很有用。</td>
  </tr>
  <tr>
    <td><code>@OnQueueProgress()</code></td><td><code>@OnGlobalQueueProgress()</code></td><td><code>handler(job: Job, progress: number)</code> - 作业 <code>job</code> 的进度已更新为值 <code>progress</code>。</td>
  </tr>
  <tr>
    <td><code>@OnQueueCompleted()</code></td><td><code>@OnGlobalQueueCompleted()</code></td><td><code>handler(job: Job, result: any)</code> 作业 <code>job</code> 成功完成，结果为 <code>result</code>。</td>
  </tr>
  <tr>
    <td><code>@OnQueueFailed()</code></td><td><code>@OnGlobalQueueFailed()</code></td><td><code>handler(job: Job, err: Error)</code> 作业 <code>job</code> 失败，原因是 <code>err</code>。</td>
  </tr>
  <tr>
    <td><code>@OnQueuePaused()</code></td><td><code>@OnGlobalQueuePaused()</code></td><td><code>handler()</code> 队列已暂停。</td>
  </tr>
  <tr>
    <td><code>@OnQueueResumed()</code></td><td><code>@OnGlobalQueueResumed()</code></td><td><code>handler(job: Job)</code> 队列已恢复。</td>
  </tr>
  <tr>
    <td><code>@OnQueueCleaned()</code></td><td><code>@OnGlobalQueueCleaned()</code></td><td><code>handler(jobs: Job[], type: string)</code> 旧作业已从队列中清理。<code>jobs</code> 是清理作业的数组，<code>type</code> 是清理的作业类型。</td>
  </tr>
  <tr>
    <td><code>@OnQueueDrained()</code></td><td><code>@OnGlobalQueueDrained()</code></td><td><code>handler()</code> 当队列处理完所有等待的作业时发出（即使可能有一些延迟的作业尚未处理）。</td>
  </tr>
  <tr>
    <td><code>@OnQueueRemoved()</code></td><td><code>@OnGlobalQueueRemoved()</code></td><td><code>handler(job: Job)</code> 作业 <code>job</code> 已成功删除。</td>
  </tr>
</table>

监听全局事件时，方法签名可能与本地对应版本略有不同。具体来说，任何在本地版本中接收 `job` 对象的方法签名，在全局版本中改为接收 `jobId` (`number`)。要在这种情况下获取对实际 `job` 对象的引用，请使用 `Queue#getJob` 方法。此调用应被等待，因此处理程序应声明为 `async`。例如：

```typescript
@OnGlobalQueueCompleted()
async onGlobalCompleted(jobId: number, result: any) {
  const job = await this.immediateQueue.getJob(jobId);
  console.log('(Global) on completed: job ', job.id, ' -> result: ', result);
}

```

> info **提示** 要访问 `Queue` 对象（进行 `getJob()` 调用），您当然必须注入它。此外，队列必须在您注入它的模块中注册。

除了特定的事件监听器装饰器外，您还可以使用通用的 `@OnQueueEvent()` 装饰器，结合 `BullQueueEvents` 或 `BullQueueGlobalEvents` 枚举。有关事件的更多信息，请 [点击这里](https://github.com/OptimalBits/bull/blob/master/REFERENCE.md#事件)。

#### 队列管理

队列有一个 API，允许您执行管理功能，如暂停和恢复，检索各种状态下的作业计数等。您可以在 [这里](https://github.com/OptimalBits/bull/blob/master/REFERENCE.md#queue) 找到完整的队列 API。直接在 `Queue` 对象上调用这些方法，如下所示的暂停/恢复示例。

使用 `pause()` 方法调用暂停队列。暂停的队列在恢复之前不会处理新作业，但正在处理的当前作业将继续直到完成。

```typescript
await audioQueue.pause();

```

要恢复暂停的队列，请使用 `resume()` 方法，如下所示：

```typescript
await audioQueue.resume();

```

#### 单独进程

作业处理程序也可以在单独的（分叉的）进程中运行（[来源](https://github.com/OptimalBits/bull#独立进程)）。这有几个优点：

- 进程被沙箱化，因此如果它崩溃，不会影响工作进程。
- 您可以运行阻塞代码而不会影响队列（作业不会停滞）。
- 更好地利用多核 CPU。
- 更少的 Redis 连接。

```ts
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

请注意，因为您的函数在分叉进程中执行，所以依赖注入（和 IoC 容器）将不可用。这意味着您的处理器函数需要包含（或创建）它需要的所有外部依赖项实例。

```ts
import { Job, DoneCallback } from 'bull';

export default function (job: Job, cb: DoneCallback) {
  console.log(`[${process.pid}] ${JSON.stringify(job.data)}`);
  cb(null, 'It works');
}

```

#### 异步配置

您可能希望异步传递 `bull` 选项，而不是静态传递。在这种情况下，使用 `forRootAsync()` 方法，该方法提供了几种处理异步配置的方法。

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

我们的工厂行为类似于任何其他 [异步提供者](/fundamentals/async-components)（例如，它可以是 `async` 并且能够通过 `inject` 注入依赖项）。

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

或者，您可以使用 `useClass` 语法：

```typescript
BullModule.forRootAsync({
  useClass: BullConfigService,
});

```

上面的构造将在 `BullModule` 内部实例化 `BullConfigService`，并使用它通过调用 `createSharedConfiguration()` 来提供选项对象。请注意，这意味着 `BullConfigService` 必须实现 `SharedBullConfigurationFactory` 接口，如下所示：

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

为了防止在 `BullModule` 内部创建 `BullConfigService` 并使用从不同模块导入的提供者，您可以使用 `useExisting` 语法。

```typescript
BullModule.forRootAsync({
  imports: [ConfigModule],
  useExisting: ConfigService,
});

```

此构造的工作方式与 `useClass` 相同，但有一个关键区别 - `BullModule` 将查找导入的模块以重用现有的 `ConfigService`，而不是实例化新的。

同样，如果您想异步传递队列选项，请使用 `registerQueueAsync()` 方法，只需记住在工厂函数外部指定 `name` 属性。

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

可用的工作示例[在这里](https://github.com/nestjs/nest/tree/master/sample/26-queues)。