<!-- 此文件从 content/techniques/queues.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T05:00:29.495Z -->
<!-- 源文件: content/techniques/queues.md -->

### 队列

队列是一种强大的设计模式，帮助您解决常见的应用程序扩展和性能挑战。一些队列可以帮助您解决的问题是：

- 平滑处理处理峰值。例如，如果用户可以在任意时间点启动资源密集型任务，可以将这些任务添加到队列中，而不是同步执行它们。然后，您可以有 Worker 进程从队列中pull 任务，以控制方式。您可以轻松地添加新队列消费者来扩展后端任务处理，以适应应用程序的扩展。
- 将 monolithic 任务分解，以免阻塞 Node.js 事件循环。例如，如果用户请求需要 CPU 密集型工作，如音频转码，可以将该任务委派给其他进程，从而释放用户界面进程以保持响应。
- 提供可靠的跨服务通信渠道。例如，您可以在一个进程或服务中队列任务（工作），并在另一个进程或服务中消费它们。在任务生命周期中的完成、错误或其他状态变化时，您可以收到通知（通过监听状态事件）。当队列生产者或消费者失败时，他们的状态将被保留，并且任务处理可以在节点重启时自动重启。

Nest 提供了 __INLINE_CODE_60__ 和 __INLINE_CODE_61__ 包，以整合 BullMQ 和 Bull。两个包都是它们相应库的包装器，由同一团队开发。Bull 目前处于维护模式，团队正在专注于修复错误，而 BullMQ 则是活动开发的 TypeScript 实现，具有不同的特性。如果 Bull meet 您的需求，它仍然是一个可靠的选择。Nest 包使得在 Nest 应用程序中轻松地整合 BullMQ 或 Bull 队列。

BullMQ 和 Bull 都使用 __LINK_501__ 来持久化工作数据，因此您需要在系统中安装 Redis。由于它们是 Redis 支持的，因此您的队列架构可以完全分布式和平台独立。例如，您可以有某些队列 __HTML_TAG_273__生产者__HTML_TAG_274__ 和 __HTML_TAG_275__消费者__HTML_TAG_276__ 和 __HTML_TAG_277__监听器__HTML_TAG_278__ 在 Nest 中运行，然后在其他 Node.js 平台上运行其他生产者、消费者和监听器。

本章涵盖了 __INLINE_CODE_62__ 和 __INLINE_CODE_63__ 包。我们还建议阅读 __LINK_502__ 和 __LINK_503__ 文档，以获取更多背景信息和实现细节。

#### BullMQ 安装

要开始使用 BullMQ，我们首先安装必要的依赖项。

```bash
$ npm install --save graphql-query-complexity

```

安装过程完成后，我们可以将 __INLINE_CODE_64__ 导入到根 __INLINE_CODE_65__ 中。

```typescript
import { GraphQLSchemaHost } from '@nestjs/graphql';
import { Plugin } from '@nestjs/apollo';
import {
  ApolloServerPlugin,
  BaseContext,
  GraphQLRequestListener,
} from '@apollo/server';
import { GraphQLError } from 'graphql';
import {
  fieldExtensionsEstimator,
  getComplexity,
  simpleEstimator,
} from 'graphql-query-complexity';

@Plugin()
export class ComplexityPlugin implements ApolloServerPlugin {
  constructor(private gqlSchemaHost: GraphQLSchemaHost) {}

  async requestDidStart(): Promise<GraphQLRequestListener<BaseContext>> {
    const maxComplexity = 20;
    const { schema } = this.gqlSchemaHost;

    return {
      async didResolveOperation({ request, document }) {
        const complexity = getComplexity({
          schema,
          operationName: request.operationName,
          query: document,
          variables: request.variables,
          estimators: [
            fieldExtensionsEstimator(),
            simpleEstimator({ defaultComplexity: 1 }),
          ],
        });
        if (complexity > maxComplexity) {
          throw new GraphQLError(
            `Query is too complex: ${complexity}. Maximum allowed complexity: ${maxComplexity}`,
          );
        }
        console.log('Query Complexity:', complexity);
      },
    };
  }
}

```

__INLINE_CODE_66__ 方法用于注册一个 __INLINE_CODE_67__ 包配置对象，该对象将被所有队列在应用程序中注册（除非指定其他）用于配置队列。以下是一些配置对象中的属性：

- __INLINE_CODE_68__ - Redis 连接配置选项。见 __LINK_504__ 获取更多信息。可选。
- __INLINE_CODE_69__ - 所有队列键的前缀。可选。
- __INLINE_CODE_70__ - 对新任务的默认设置。见 __LINK_505__ 获取更多信息。可选。
- __INLINE_CODE_71__ - 高级队列配置设置。这些通常不需要更改。见 __LINK_506__ 获取更多信息。可选。
- __INLINE_CODE_72__ - 模块初始化时的额外选项。见 __LINK_507__

所有选项都是可选的，提供了对队列行为的详细控制。这些选项将直接传递给 BullMQ __INLINE_CODE_73__ 构造函数。了解更多关于这些选项和其他选项 __LINK_508__。

要注册队列，导入 __INLINE_CODE_74__ 动态模块，如下所示：

```typescript
@Field({ complexity: 3 })
title: string;

```

> info **提示** 使用 __INLINE_CODE_75__ 方法创建多个队列。

__INLINE_CODE_76__ 方法用于实例化和/或注册队列。队列是跨模块和进程共享的，在连接到同一个 Redis 数据库的同一个凭证下运行。每个队列都是唯一的，它的名称将作为注入令牌（用于将队列注入控制器/提供者中）和作为装饰器的参数来关联消费者类和监听器。

您也可以为特定队列 override一些预配置的选项，例如：

```typescript
@Field({ complexity: (options: ComplexityEstimatorArgs) => ... })
title: string;

```

BullMQ 还支持工作之间的父-子关系。这种功能使得可以创建树形结构的工作，其中工作是树的节点，可以具有任意深度。要了解更多信息，请查看 __LINK_509__。

要添加一个流，您可以执行以下操作：

```typescript
@Query({ complexity: (options: ComplexityEstimatorArgs) => options.args.count * options.childComplexity })
items(@Args('count') count: number) {
  return this.itemsService.getItems({ count });
}

```Since jobs are persisted in Redis, each time a specific named queue is instantiated (e.g., when an app is started/restarted), it attempts to process any old jobs that may exist from a previous unfinished session.

每个队列都可以有多个生产者、消费者和监听器。消费者从队列中检索作业，以特定的顺序：FIFO（默认）、LIFO或根据优先级。控制队列处理顺序的讨论可以在 __LINK_510__ 中找到。

#### 命名配置

如果您的队列连接到多个不同的 Redis 实例，您可以使用一种称为 **named configurations** 的技术。这种特性允许您注册多个配置，使用指定的键，然后在队列选项中引用它们。

例如，假设您有一个额外的 Redis 实例（除了默认的实例），用于某些队列在您的应用程序中，您可以将其配置注册如下：

__CODE_BLOCK_5__

在上面的示例中，__INLINE_CODE_77__ 只是一个配置键（可以是任意的字符串）。

现在，您可以在 __INLINE_CODE_78__ 选项对象中指向该配置：

__CODE_BLOCK_6__

#### 生产者

作业生产者将作业添加到队列中。生产者通常是 Nest 应用程序服务（Nest __LINK_510__）。要将作业添加到队列中，首先将队列注入到服务中，方法如下：

__CODE_BLOCK_7__

> 信息 **Hint** __INLINE_CODE_79__ 装饰器通过提供的 __INLINE_CODE_80__ 方法调用来标识队列名称（例如 __INLINE_CODE_81__）。

现在，添加作业通过调用队列的 __INLINE_CODE_82__ 方法，传递一个自定义的作业对象。作业由可序列化的 JavaScript 对象表示（因为它存储在 Redis 数据库中）。作业对象的形状是任意的，使用它来表示作业的语义。您还需要为作业命名。这允许您创建专门的 __HTML_TAG_283__ 消费者 __HTML_TAG_284__，它们将仅处理具有给定名称的作业。

__CODE_BLOCK_8__

#### 作业选项

作业可以具有附加的选项。将选项对象传递到 __INLINE_CODE_83__ 方法的 __INLINE_CODE_84__ 参数后。某些作业选项属性包括：

- __INLINE_CODE_85__: __INLINE_CODE_86__ - 可选的优先级值。范围从 1 到 MAX_INT。请注意，使用优先级可能会影响性能，因此使用它们时要小心。
- __INLINE_CODE_87__: __INLINE_CODE_88__ - 等待作业处理的时间（毫秒）。请注意，准确的延迟需要服务器和客户端的时钟同步。
- __INLINE_CODE_89__: __INLINE_CODE_90__ - 尝试作业的总次数。
- __INLINE_CODE_91__: __INLINE_CODE_92__ - 根据 cron 规则重复作业。请查看 __LINK_511__。
- __INLINE_CODE_93__: __INLINE_CODE_94__ - 自动重试时的退化设置。请查看 __LINK_512__。
- __INLINE_CODE_95__: __INLINE_CODE_96__ - 如果 true，添加作业到队列的右端（默认为 false）。
- __INLINE_CODE_97__: __INLINE_CODE_98__ | __INLINE_CODE_99__ - Override 作业 ID - 默认情况下，作业 ID 是唯一的整数，但您可以使用该设置来override它。 如果您使用该选项，需要确保 jobId 是唯一的。如果您尝试添加具有相同 ID 的作业，它将不被添加。
- __INLINE_CODE_100__: __INLINE_CODE_101__ - 如果 true，删除作业 quando  it successfully completes。一个数字指定要保留的作业数量。默认行为是保留作业在完成队列中。
- __INLINE_CODE_102__: __INLINE_CODE_103__ - 如果 true，删除作业 quando  it fails after all attempts。一个数字指定要保留的作业数量。默认行为是保留作业在失败队列中。
- __INLINE_CODE_104__: __INLINE_CODE_105__ - 限制记录在 stacktrace 中的栈跟踪行数。

以下是一些使用作业选项的自定义示例。

要延迟作业的开始，使用 __INLINE_CODE_106__ 配置属性。

__CODE_BLOCK_9__

要将作业添加到队列的右端（处理作业如 **LIFO**），将 __INLINE_CODE_107__ 属性设置为 __INLINE_CODE_108__。

__CODE_BLOCK_10__

要优先化作业，使用 __INLINE_CODE_109__ 属性。

__CODE_BLOCK_11__

要查看完整的选项列表，请查看 API 文档 __LINK_513__ 和 __LINK_514__。

#### 消费者

消费者是一种 **class**，定义了处理队列中的作业或监听队列事件的方法。使用 __INLINE_CODE_110__ 装饰器声明消费者类，方法如下：

__CODE_BLOCK_12__

> 信息 **Hint**Here is the translation of the English technical documentation to Chinese:

###  Decorator 中的字符串参数

__INLINE_CODE_113__ 是要与类方法关联的队列名称。

__CODE_BLOCK_13__

当 worker 处于空闲状态且队列中有任务时，process 方法将被调用。该 handler 方法仅接受 __INLINE_CODE_114__ 对象作为参数。handler 方法返回的值将被存储在任务对象中，可以在完成事件的监听器中访问。

__INLINE_CODE_115__ 对象具有多个方法，允许您与其状态进行交互。例如，以上代码使用 __INLINE_CODE_116__ 方法更新任务的进度。请参阅 __LINK_515__ 获取完整的 __INLINE_CODE_117__ 对象 API 参考。

在较旧的版本中，Bull 可以将 job 函数 handler 方法限制为处理特定类型的任务（具有特定 __INLINE_CODE_118__ 的任务）通过将该 __INLINE_CODE_119__ 作为 __INLINE_CODE_120__ 装饰器的参数，如下所示。

> warning **Warning** 请继续阅读。

__CODE_BLOCK_14__

由于 BullMQ 生成的混淆，这种行为在 BullMQ 中不受支持。相反，您需要使用 switch cases 来调用不同的服务或逻辑以处理每个任务名称：

__CODE_BLOCK_15__

这在 BullMQ 文档的 __LINK_516__ 部分中有详细介绍。

#### 请求范围消费者

当消费者被标记为请求范围（了解更多关于注射范围 __LINK_517__），将为每个任务创建一个新的实例。该实例将在任务完成后被回收。

__CODE_BLOCK_16__

由于请求范围消费者类实例是动态创建的且作用于单个任务，您可以使用标准方法在构造函数中注入 __INLINE_CODE_121__。

__CODE_BLOCK_17__

> info **Hint** __INLINE_CODE_122__ token 来自 __INLINE_CODE_123__ 包。

#### 事件监听器

BullMQ 在队列和/或任务状态变化时生成了一组有用的事件。这些事件可以在 Worker 水平使用 __INLINE_CODE_124__ 装饰器订阅，或者在 Queue 水平使用专门的监听器类和 __INLINE_CODE_125__ 装饰器。

Worker 事件必须在 __HTML_TAG_285__ 消费者 __HTML_TAG_286__ 类中声明（即在使用 __INLINE_CODE_126__ 装饰器的类中）。要监听事件，请使用 __INLINE_CODE_127__ 装饰器指定要处理的事件。例如，要监听 __INLINE_CODE_128__ 队列中任务激活状态的事件，请使用以下构造：

__CODE_BLOCK_18__

可以在 WorkerListener __LINK_518__ 中查看完整的事件列表和参数。

QueueEvent 监听器必须使用 __INLINE_CODE_129__ 装饰器扩展 __INLINE_CODE_130__ 类（由 __INLINE_CODE_131__ 提供）。要监听事件，请使用 __INLINE_CODE_132__ 装饰器指定要处理的事件。例如，要监听 __INLINE_CODE_133__ 队列中任务激活状态的事件，请使用以下构造：

__CODE_BLOCK_19__

> info **Hint** QueueEvent 监听器必须注册为 __INLINE_CODE_134__，以便 __INLINE_CODE_135__ 包能找到它们。

可以在 QueueEventsListener __LINK_519__ 中查看完整的事件列表和参数。

#### 队列管理

队列具有 API，可以执行管理函数，如暂停和恢复、获取不同状态下的任务数量等等。您可以在 __LINK_520__ 中找到完整的队列 API。您可以在 __INLINE_CODE_136__ 对象上直接调用这些方法，如以下暂停和恢复队列的示例。

暂停队列使用 __INLINE_CODE_137__ 方法调用。暂停队列将不处理新的任务直到恢复，但当前任务正在处理将继续直到完成。

__CODE_BLOCK_20__

要恢复暂停队列，请使用 __INLINE_CODE_138__ 方法，如以下所示：

__CODE_BLOCK_21__

#### 分离进程

任务处理器也可以在独立（forked）进程中运行（__LINK_521__）。这有多个优点：

- 进程被sandboxed，如果进程崩溃不会影响 worker。
- 可以运行阻塞代码而不影响队列（任务将不会卡顿）。
- 更好地利用多核 CPU。
- 连接数少。

__CODE_BLOCK_22__

> warning **Warning** 请注意，因为您的函数是在 forked 进程中执行的，Dependency Injection（和 IoC 容器）将不可用。因此，处理器函数需要包含（或创建）外部依赖项的实例。

#### 异步配置You may want to pass __INLINE_CODE_139__ options asynchronously instead of statically. In this case, use the __INLINE_CODE_140__ method which provides several ways to deal with async configuration. Likewise, if you want to pass queue options asynchronously, use the __INLINE_CODE_141__ method.

一个方法是使用工厂函数：

```

__CODE_BLOCK_23__

```

Our factory behaves like any other __LINK_522__ (e.g., it can be __INLINE_CODE_142__ and it's able to inject dependencies through __INLINE_CODE_143__).

```

__CODE_BLOCK_24__

```

Alternatively, you can use the __INLINE_CODE_144__ syntax:

```

__CODE_BLOCK_25__

```

The construction above will instantiate __INLINE_CODE_145__ inside __INLINE_CODE_146__ and use it to provide an options object by calling __INLINE_CODE_147__. Note that this means that the __INLINE_CODE_148__ has to implement the __INLINE_CODE_149__ interface, as shown below:

```

__CODE_BLOCK_26__

```

In order to prevent the creation of __INLINE_CODE_150__ inside __INLINE_CODE_151__ and use a provider imported from a different module, you can use the __INLINE_CODE_152__ syntax.

```

__CODE_BLOCK_27__

```

This construction works the same as __INLINE_CODE_153__ with one critical difference - __INLINE_CODE_154__ will lookup imported modules to reuse an existing __INLINE_CODE_155__ instead of instantiating a new one.

Likewise, if you want to pass queue options asynchronously, use the __INLINE_CODE_156__ method, just keep in mind to specify the __INLINE_CODE_157__ attribute outside the factory function.

```

__CODE_BLOCK_28__

```

#### 自动注册

默认情况下,__INLINE_CODE_158__ 将自动注册 BullMQ 组件（队列、处理器和事件监听服务）。然而，在某些情况下，这种行为可能不理想。要防止自动注册，启用 __INLINE_CODE_160__ 在 __INLINE_CODE_161__ 中，如下所示：

```

__CODE_BLOCK_29__

```

To register these components manually, inject __INLINE_CODE_162__ and call the __INLINE_CODE_163__ function, ideally within __INLINE_CODE_164__ or __INLINE_CODE_165__.

```

__CODE_BLOCK_30__

```

Unless you call the __INLINE_CODE_166__ function, no BullMQ components will work—meaning no jobs will be processed.

#### Bull 安装

> warning **注意** 如果您决定使用 BullMQ， skip 这个部分和下面的章节。

要开始使用 Bull，我们首先安装所需的依赖项。

```

__CODE_BLOCK_31__

```

安装过程完成后，我们可以将 __INLINE_CODE_167__ 导入到根 __INLINE_CODE_168__ 中。

```

__CODE_BLOCK_32__

```

The __INLINE_CODE_169__ method is used to register a __INLINE_CODE_170__ package configuration object that will be used by all queues registered in the application (unless specified otherwise). A configuration object consists of the following properties:

- __INLINE_CODE_171__ - Options to control the rate at which the queue's jobs are processed. See __LINK_523__ for more information. Optional.
- __INLINE_CODE_172__ - Options to configure the Redis connection. See __LINK_524__ for more information. Optional.
- __INLINE_CODE_173__ - Prefix for all queue keys. Optional.
- __INLINE_CODE_174__ - Options to control the default settings for new jobs. See __LINK_525__ for more information. Optional. **Note: These do not take effect if you schedule jobs via a FlowProducer. See __LINK_526__ for explanation.**
- __INLINE_CODE_175__ - Advanced Queue configuration settings. These should usually not be changed. See __LINK_527__ for more information. Optional.

All the options are optional, providing detailed control over queue behavior. These are passed directly to the Bull __INLINE_CODE_176__ constructor. Read more about these options __LINK_528__.

To register a queue, import the __INLINE_CODE_177__ dynamic module, as follows:

```

__CODE_BLOCK_33__

```

> info **提示** 创建多个队列通过将多个逗号分隔的配置对象传递给 __INLINE_CODE_178__ 方法。

The __INLINE_CODE_179__ method is used to instantiate and/or register queues. Queues are shared across modules and processes that connect to the same underlying Redis database with the same credentials. Each queue is unique by its name property. A queue name is used as both an injection token (for injecting the queue into controllers/providers), and as an argument to decorators to associate consumer classes and listeners with queues.

You can also override some of the pre-configured options for a specific queue, as follows:

```

__CODE_BLOCK_34__

```

Since jobs are persisted in Redis, each time a specific named queue is instantiated (e.g., when an app is started/restarted), it attempts to process any old jobs that may exist from a previous unfinished session.

Each queue can have one or many producers, consumers, and listeners. Consumers retrieve jobs from the queue in a specific order: FIFO (the default), LIFO, or according to priorities. Controlling queue processing order is discussed __HTML_TAG_287__here__HTML_TAG_288__.Here is the translation of the provided English technical documentation to Chinese, following the given requirements:

#### 命名配置

如果你的队列连接到多个 Redis 实例，你可以使用一种技术叫做 **命名配置**。这个特性允许你注册多个配置项，并使用它们在队列选项中引用。

例如，假设你有另一个 Redis 实例（除了默认实例），用于注册在你的应用程序中的几个队列。你可以将其配置注册如下所示：

```typescript
this.app.providers.register('my-redis', {
  // 你的 Redis 配置
});

```

在上面的示例中，`my-redis` 是只是一个配置项键（可以是任意字符串）。

现在，你可以在 `__INLINE_CODE_181__` 选项对象中引用这个配置：

```typescript
this.app.queue('my-queue', {
  // 你的队列配置
  redis: 'my-redis',
});

```

#### 生产者

作业生产者将作业添加到队列中。生产者通常是 Nest 应用程序服务（Nest 提供者）。要将作业添加到队列中，首先将队列注入到服务中：

```typescript
@Injectable()
export class MyService {
  constructor(private readonly queue: Queue) {}

  async process() {
    await this.queue.addJob('my-job', {
      // 你的作业对象
    });
  }
}

```

> info **提示** `@Injectable()` 装饰器标识队列通过其名称（在 `__INLINE_CODE_183__` 方法调用中指定，例如 `my-job`）。

现在，你可以通过调用队列的 `__INLINE_CODE_185__` 方法来添加作业，传递一个自定义的作业对象。作业对象是可序列化的 JavaScript 对象（因为它们是存储在 Redis 数据库中的），作业对象的形状是任意的；使用它来表示作业的语义。

```typescript
async process() {
  await this.queue.addJob('my-job', {
    // 你的作业对象
  });
}

```

#### 命名作业

作业可能具有唯一的名称。这允许你创建特殊的 **消费者**（消费者）来处理具有给定名称的作业。

```typescript
@Injectable()
export class MyConsumer {
  constructor(private readonly queue: Queue) {}

  @Processor('my-job')
  async processJob(job: Job) {
    // 处理作业
  }
}

```

> Warning **警告** 当使用命名作业时，你必须创建每个唯一名称的处理器，以便队列不抱怨你缺少处理器来处理给定的作业。请查看 __HTML_TAG_293__here__HTML_TAG_294__ 了解如何消费命名作业。

#### 作业选项

作业可以具有额外的选项。将选项对象传递给 `__INLINE_CODE_187__` 方法的 `__INLINE_CODE_186__` 参数。作业选项属性是：

- __INLINE_CODE_188__: __INLINE_CODE_189__ - 可选的优先级值。范围从 1（最高优先级）到 MAX_INT（最低优先级）。注意使用优先级可能会影响性能，因此使用它们时请小心。
- __INLINE_CODE_190__: __INLINE_CODE_191__ - 等待作业处理的时间（毫秒）。请注意，为了确保准确的延迟，服务器和客户端应该同步时间。
- __INLINE_CODE_192__: __INLINE_CODE_193__ - 尝试作业的总次数。
- __INLINE_CODE_194__: __INLINE_CODE_195__ - 依据 cron 规定重复作业。查看 __LINK_530__。
- __INLINE_CODE_196__: __INLINE_CODE_197__ - 自动重试失败作业的退后设置。查看 __LINK_531__。
- __INLINE_CODE_198__: __INLINE_CODE_199__ - 如果 true，添加作业到队列的右端（默认 false）。
- __INLINE_CODE_200__: __INLINE_CODE_201__ - 作业超时的毫秒数。
- __INLINE_CODE_202__: __INLINE_CODE_203__ | __INLINE_CODE_204__ - 覆盖作业 ID - 默认情况下，作业 ID 是一个唯一的整数，但你可以使用这个设置来覆盖它。如果你使用这个选项，它将是你的责任确保作业 ID 是唯一的。如果你尝试添加一个已经存在的作业 ID，它将不会被添加。
- __INLINE_CODE_205__: __INLINE_CODE_206__ - 如果 true，删除完成的作业。一个数字指定要保留的作业数量。默认行为是保留作业在完成的集合中。
- __INLINE_CODE_207__: __INLINE_CODE_208__ - 如果 true，删除失败的作业。一个数字指定要保留的作业数量。默认行为是保留作业在失败的集合中。
- __INLINE_CODE_209__: __INLINE_CODE_210__ - 限制记录在栈跟踪中的线数。

以下是一些自定义作业选项的示例。

要延迟作业的开始，使用 `__INLINE_CODE_211__` 配置属性。

```Here is the translation of the English technical documentation to Chinese:

在消费者类中，使用__INLINE_CODE_219__装饰器来声明作业处理程序。

__CODE_BLOCK_44__

装饰的方法（例如__INLINE_CODE_220__）在 worker 空闲且队列中有作业时被调用。该处理方法仅接收__INLINE_CODE_221__对象作为参数。处理方法返回的值将被存储在作业对象中，可以在完成事件监听器中访问。

__INLINE_CODE_222__对象具有多种方法，允许您与其状态交互。例如，上述代码使用__INLINE_CODE_223__方法更新作业的进度。请查看__LINK_532__以获取完整__INLINE_CODE_224__对象 API 参考。

您可以使用__INLINE_CODE_227__装饰器指定作业处理程序将只处理特定类型的作业（具有特定__INLINE_CODE_225__的作业）。您可以在给定的消费者类中拥有多个__INLINE_CODE_228__处理程序，相应于每个作业类型（__INLINE_CODE_229__）。在使用命名作业时，请确保有对应于每个名称的处理程序。

__CODE_BLOCK_45__

> 警告 **Warning** 定义同一个队列的多个消费者时，__INLINE_CODE_231__选项在__INLINE_CODE_230__中不会生效。最小__INLINE_CODE_232__将与定义的消费者数匹配。这也适用于，即使__INLINE_CODE_233__处理程序使用不同的__INLINE_CODE_234__来处理命名作业。

#### 请求作用域消费者

当消费者被标记为请求作用域（了解更多关于注入作用域__LINK_533__），将为每个作业创建一个新的实例。该实例将在作业完成后被垃圾收集。

__CODE_BLOCK_46__

由于请求作用域消费者类实例是动态创建的且作用于单个作业，因此可以使用标准方法通过构造函数注入一个__INLINE_CODE_235__。

__CODE_BLOCK_47__

> 提示 **Hint** __INLINE_CODE_236__令牌来自__INLINE_CODE_237__包。

#### 事件监听器

Bull 在队列和/或作业状态变化时生成了一系列有用的事件。Nest 提供了一些装饰器，允许订阅核心事件集。这些事件从__INLINE_CODE_238__包导出。

事件监听器必须在__HTML_TAG_295__consumer__HTML_TAG_296__类中声明（即在装饰器__INLINE_CODE_239__装饰的类中）。要监听事件，请使用下表中的装饰器在事件处理程序中声明一个处理程序。例如，要监听__INLINE_CODE_240__队列中的作业进入活动状态的事件，可以使用以下构造：

__CODE_BLOCK_48__

由于 Bull 在分布式（多节点）环境中操作，因此定义了事件局部性概念。这概念recognizes 事件可能会在单个进程中完全触发，也可能在共享队列中由不同进程触发。一个**本地**事件是指在队列中触发的事件，这些事件是在本地进程中产生的。换言之，当事件生产者和消费者都在单个进程中时，队列中的所有事件都是本地事件。

当队列跨越多个进程时，我们遇到了**全局**事件。要使一个进程的监听器接收另一个进程触发的事件通知，它必须注册全局事件。

事件处理程序在对应事件被触发时被调用。处理程序将使用下表中的签名，提供访问事件相关信息的机会。我们将讨论本地和全局事件处理程序签名之间的一种关键差异。Here is the translation of the English technical documentation to Chinese:

 __HTML_TAG_297__
  __HTML_TAG_298__
    __HTML_TAG_299__本地事件监听器__HTML_TAG_300__
    __HTML_TAG_301__全局事件监听器__HTML_TAG_302__
    __HTML_TAG_303__处理方法签名 / 触发时__HTML_TAG_304__
  __HTML_TAG_305__
  __HTML_TAG_306__
    __HTML_TAG_307____HTML_TAG_308__@OnQueueError()__HTML_TAG_309____HTML_TAG_310____HTML_TAG_311____HTML_TAG_312__@OnGlobalQueueError()__HTML_TAG_313____HTML_TAG_314____HTML_TAG_315____HTML_TAG_316__handler(error: Error)__HTML_TAG_317__ - 发生错误。__HTML_TAG_318__error__HTML_TAG_319__包含触发错误的信息。__HTML_TAG_320__
  __HTML_TAG_321__
  __HTML_TAG_322__
    __HTML_TAG_323____HTML_TAG_324__@OnQueueWaiting()__HTML_TAG_325____HTML_TAG_326____HTML_TAG_327____HTML_TAG_328__@OnGlobalQueueWaiting()__HTML_TAG_329____HTML_TAG_330____HTML_TAG_331____HTML_TAG_332__handler(jobId: number | string)__HTML_TAG_333__ - 任务 __HTML_TAG_334__jobId__HTML_TAG_335__正在等待处理。__HTML_TAG_336__
  __HTML_TAG_337__
  __HTML_TAG_338__
    __HTML_TAG_339____HTML_TAG_340__@OnQueueActive()__HTML_TAG_341____HTML_TAG_342____HTML_TAG_343____HTML_TAG_344__@OnGlobalQueueActive()__HTML_TAG_345____HTML_TAG_346____HTML_TAG_347____HTML_TAG_348__handler(job: Job)__HTML_TAG_349__ - 任务 __HTML_TAG_350__job__HTML_TAG_351__已经开始。__HTML_TAG_352__
  __HTML_TAG_353__
  __HTML_TAG_354__
    __HTML_TAG_355____HTML_TAG_356__@OnQueueStalled()__HTML_TAG_357____HTML_TAG_358____HTML_TAG_359____HTML_TAG_360__@OnGlobalQueueStalled()__HTML_TAG_361____HTML_TAG_362____HTML_TAG_363____HTML_TAG_364__handler(job: Job)__HTML_TAG_365__ - 任务 __HTML_TAG_366__job__HTML_TAG_367__已被标记为阻塞。__HTML_TAG_368__
  __HTML_TAG_369__
  __HTML_TAG_370__
    __HTML_TAG_371____HTML_TAG_372__@OnQueueProgress()__HTML_TAG_373____HTML_TAG_374____HTML_TAG_375____HTML_TAG_376__@OnGlobalQueueProgress()__HTML_TAG_377____HTML_TAG_378____HTML_TAG_379____HTML_TAG_380__handler(job: Job, progress: number)__HTML_TAG_381__ - 任务 __HTML_TAG_382__job__HTML_TAG_383__的进度已被更新到__HTML_TAG_384__progress__HTML_TAG_385__。__HTML_TAG_386__
  __HTML_TAG_387__
  __HTML_TAG_388__
    __HTML_TAG_389____HTML_TAG_390__@OnQueueCompleted()__HTML_TAG_391____HTML_TAG_392____HTML_TAG_393____HTML_TAG_394__@OnGlobalQueueCompleted()__HTML_TAG_395____HTML_TAG_396____HTML_TAG_397____HTML_TAG_398__handler(job: Job, result: anyHere is the translated text:

__HTML_TAG_498__
  __HTML_TAG_499__
__HTML_TAG_500__.在监听全局事件时，方法签名可能会与本地counterpart不同。具体来说，在本地版本中，任何接收__INLINE_CODE_241__对象的方法签名，在全局版本中将接收一个__INLINE_CODE_242__ (__INLINE_CODE_243__)。要获取实际__INLINE_CODE_244__对象的引用，在这种情况下，可以使用__INLINE_CODE_245__方法。这个调用应该被异步等待，因此处理程序应该被声明为__INLINE_CODE_246__。例如：

__CODE_BLOCK_49__

> info **Hint**要访问__INLINE_CODE_247__对象（以便执行__INLINE_CODE_248__调用），您必须将其注入。同时，队列必须在您注入它的模块中注册。

除了特定的事件监听器装饰器外，您还可以使用通用__INLINE_CODE_249__装饰器，结合__INLINE_CODE_250__或__INLINE_CODE_251__枚举。了解更多关于事件的信息__LINK_534__。

#### 队列管理

队列具有API，允许您执行管理功能，如暂停和恢复、检索队列中的作业数量等。您可以在__LINK_535__中找到队列的完整API。直接在__INLINE_CODE_252__对象上调用这些方法，如下所示，使用pause/resume示例。

暂停队列使用__INLINE_CODE_253__方法调用。暂停队列将不会处理新的作业，直到恢复，但当前正在处理的作业将继续直到它们完成。

__CODE_BLOCK_50__

恢复暂停队列使用__INLINE_CODE_254__方法，例如：

__CODE_BLOCK_51__

#### 分离进程

作业处理程序也可以在分离的（forked）进程中运行(__LINK_536__).这有几个优点：

- 进程被sandboxed，因此如果它崩溃不会影响worker。
- 您可以运行阻塞代码，而不会影响队列（作业将不会卡住）。
- 对多核 CPU 的使用率更高。
- 连接数更少。

__CODE_BLOCK_52__

请注意，因为您的函数在分离进程中执行，依赖注入（和 IoC 容器）将不可用。因此，您的处理函数需要包含（或创建）外部依赖项的实例。

__CODE_BLOCK_53__

#### 异步配置

您可能想异步地传递__INLINE_CODE_255__选项，而不是静态地传递。在这种情况下，使用__INLINE_CODE_256__方法，它提供了多种方式来处理异步配置。

一种方法是使用工厂函数：

__CODE_BLOCK_54__

我们的工厂行为与任何其他__LINK_537__相同（例如，可以__INLINE_CODE_257__，并通过__INLINE_CODE_258__注入依赖项）。

__CODE_BLOCK_55__

或者，您可以使用__INLINE_CODE_259__语法：

__CODE_BLOCK_56__

上面的构造将在__INLINE_CODE_261__中实例化__INLINE_CODE_260__，并使用它来提供选项对象，通过调用__INLINE_CODE_262__。请注意，这意味着__INLINE_CODE_263__需要实现__INLINE_CODE_264__接口，如下所示：

__CODE_BLOCK_57__

以防止在__INLINE_CODE_266__中创建__INLINE_CODE_265__并使用来自不同模块的提供程序，您可以使用__INLINE_CODE_267__语法。

__CODE_BLOCK_58__

这个构造与__INLINE_CODE_268__相同，但有一点不同 - __INLINE_CODE_269__将在imported 模块中搜索重用__INLINE_CODE_270__而不是实例化新的一个。

类似地，如果您想异步地传递队列选项，使用__INLINE_CODE_271__方法，只需注意在工厂函数外指定__INLINE_CODE_272__属性。

__CODE_BLOCK_59__

#### 示例

有一个可工作的示例__LINK_538__.