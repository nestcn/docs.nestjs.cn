<!-- 此文件从 content/techniques/queues.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T05:14:15.285Z -->
<!-- 源文件: content/techniques/queues.md -->

### 排队

排队是一种强大的设计模式，可以帮助您解决常见的应用程序扩展和性能挑战。一些排队可以帮助您解决的问题是：

- 平滑处理峰值处理。例如，如果用户可以在任意时间启动资源密集型任务，而不是同步地执行它们，您可以将这些任务添加到队列中，然后由工作进程在控制的方式从队列中提取任务。您可以轻松地添加新的队列消费者，以便在应用程序扩展时扩展后端任务处理。
- 分解 monolithic 任务，以免阻塞 Node.js 事件循环。例如，如果用户请求需要 CPU 密集型工作，如音频转码，您可以将这个任务委派给其他进程，从而释放用户-facing 进程，以保持响应。
- 提供可靠的跨多个服务的通信渠道。例如，您可以在一个进程或服务中排队任务（作业），然后在另一个进程或服务中消费它们。在作业生命期的任何状态变化（完成、错误或其他）时，您可以收到通知，从任何进程或服务中监听状态事件。当队列生产者或消费者失败时，它们的状态将被保留，并且任务处理可以在节点重启时自动恢复。

Nest 提供了 __INLINE_CODE_60__ 和 __INLINE_CODE_61__ 包以便与 BullMQ 和 Bull 集成，这两个包都是对相应库的抽象包装，开发团队相同。Bull 目前处于维护模式，团队集中于修复错误，而 BullMQ 则是活动开发的 TypeScript 实现，具有不同的功能。如果 Bull 满足您的要求，它仍然是一个可靠的选择。Nest 包使得将 BullMQ 或 Bull 排队集成到您的 Nest 应用程序中变得非常简单。

BullMQ 和 Bull 都使用 __LINK_501__ persists 作业数据，因此您需要在系统中安装 Redis。因为它们是基于 Redis 的，您的排队架构可以完全分布式和平台无关。例如，您可以在 Nest 中运行一些队列生产者、消费者和监听器，然后在其他 Node.js 平台上运行其他生产者、消费者和监听器。

本章将涵盖 __INLINE_CODE_62__ 和 __INLINE_CODE_63__ 包，我们还建议阅读 __LINK_502__ 和 __LINK_503__ 文档，以获取更多背景信息和具体实现细节。

#### BullMQ 安装

要开始使用 BullMQ，我们首先安装所需的依赖项。

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    snapshot: true,
  });
  await app.listen(process.env.PORT ?? 3000);
}

```

安装过程完成后，我们可以将 __INLINE_CODE_64__ 导入到根 __INLINE_CODE_65__ 中。

```bash
$ npm i @nestjs/devtools-integration

```

__INLINE_CODE_66__ 方法用于注册一个 __INLINE_CODE_67__ 包含队列配置对象，该对象将被所有队列在应用程序中注册使用（除非另有指定）。以下是一些配置对象的属性：

- __INLINE_CODE_68__ - Redis 连接配置选项。见 __LINK_504__ 了解更多信息。可选。
- __INLINE_CODE_69__ - 所有队列密钥的前缀。可选。
- __INLINE_CODE_70__ - 新作业的默认设置控制选项。见 __LINK_505__ 了解更多信息。可选。
- __INLINE_CODE_71__ - 高级队列配置设置。通常不需要更改。见 __LINK_506__ 了解更多信息。可选。
- __INLINE_CODE_72__ - 模块初始化额外选项。见 __LINK_507__

所有选项都是可选的，提供了队列行为的详细控制。这些选项将被直接传递给 BullMQ __INLINE_CODE_73__ 构造函数。了解更多关于这些选项和其他选项 __LINK_508__。

要注册队列，请导入 __INLINE_CODE_74__ 动态模块，以下是注册队列的方法：

```typescript
@Module({
  imports: [
    DevtoolsModule.register({
      http: process.env.NODE_ENV !== 'production',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

```

> info **提示** 使用逗号分隔的多个配置对象来创建多个队列。

__INLINE_CODE_76__ 方法用于实例化和/或注册队列。队列在模块和进程之间共享，可以连接到同一个 Redis 数据库的相同凭证。每个队列都是唯一的，它的名称作为注入令牌（将队列注入控制器/提供者）和作为装饰器的参数关联消费者类和监听器。

您也可以覆盖某些队列的预配置选项，以便：

```typescript
bootstrap().catch((err) => {
  fs.writeFileSync('graph.json', PartialGraphHost.toString() ?? '');
  process.exit(1);
});

```

BullMQ 还支持作业之间的父-子关系。这种功能使得创建树形结构的作业成为可能，其中作业是树的节点。要了解更多，请查看 __LINK_509__。

要添加一个流，请执行以下操作：

```typescript
const app = await NestFactory.create(AppModule, {
  snapshot: true,
  abortOnError: false, // <--- THIS
});

```Since jobs are persisted in Redis, each time a specific named queue is instantiated (e.g., when an app is started/restarted), it attempts to process any old jobs that may exist from a previous unfinished session.

每个队列都可以有一个或多个生产者、消费者和监听器。消费者从队列中检索工作项按照特定的顺序：FIFO（默认）、LIFO 或根据优先级。控制队列处理顺序被讨论在__HTML_TAG_279__这里__HTML_TAG_280__。

__HTML_TAG_281____HTML_TAG_282__

#### 命名配置

如果您的队列连接到多个不同的 Redis 实例，您可以使用名为**named configurations**的技术。该特性允许您注册多个配置项，并将其在队列选项中引用。

例如，假设您有一个额外的 Redis 实例（除了默认实例），用于注册在应用程序中的几个队列，您可以将其配置项注册如下：

```typescript
await app.listen(process.env.PORT ?? 3000); // OR await app.init()
fs.writeFileSync('./graph.json', app.get(SerializedGraph).toString());

```

在上面的示例中，__INLINE_CODE_77__只是一个配置项键（它可以是任意的字符串）。

现在，您可以将该配置项指向__INLINE_CODE_78__选项对象：

__CODE_BLOCK_6__

#### 生产者

工作生产者将工作项添加到队列中。生产者通常是 Nest 应用程序服务（Nest __LINK_510__）。要添加工作项到队列，首先将队列注入到服务中：

__CODE_BLOCK_7__

> info **提示** __INLINE_CODE_79__装饰器将队列标识为其名称，正如在__INLINE_CODE_80__方法调用中所提供的（例如__INLINE_CODE_81__）。

现在，添加一个工作项通过调用队列的__INLINE_CODE_82__方法，传递一个自定义的工作对象。工作项是可序列化的 JavaScript 对象（因为它们存储在 Redis 数据库中）。工作对象的形状是任意的；使用它来表示您的工作对象的语义。您还需要为它命名。这允许您创建专门的__HTML_TAG_283__消费者__HTML_TAG_284__，只处理具有给定名称的工作项。

__CODE_BLOCK_8__

#### 工作项选项

工作项可以具有附加选项。传递一个选项对象作为__INLINE_CODE_83__参数在__INLINE_CODE_84__方法中。一些工作选项属性是：

- __INLINE_CODE_85__: __INLINE_CODE_86__ - 可选的优先级值。范围从 1（最高优先级）到 MAX_INT（最低优先级）。请注意，使用优先级将对性能产生轻微影响，因此请使用它们时小心。
- __INLINE_CODE_87__: __INLINE_CODE_88__ - 等待该工作项被处理的时间（毫秒）。请注意，对于准确的延迟，服务器和客户端都应该同步时钟。
- __INLINE_CODE_89__: __INLINE_CODE_90__ - 尝试该工作项的总次数 jusqu'à ce qu'il soit terminé。
- __INLINE_CODE_91__: __INLINE_CODE_92__ - 使工作项根据 cron 规定重复。见__LINK_511__。
- __INLINE_CODE_93__: __INLINE_CODE_94__ - 自动重试失败的工作项的退后设置。见__LINK_512__。
- __INLINE_CODE_95__: __INLINE_CODE_96__ - 如果 true，添加工作项到队列的右端（默认 false）。
- __INLINE_CODE_97__: __INLINE_CODE_98__ | __INLINE_CODE_99__ - Override 工作项的 ID - 默认情况下，工作项的 ID 是一个唯一的整数，但您可以使用该设置来Override 它。 如果您使用该选项，它将是您的责任确保 jobId 是唯一的。 如果您尝试添加一个已经存在的 jobId 的工作项，它将不会被添加。
- __INLINE_CODE_100__: __INLINE_CODE_101__ - 如果 true，删除成功完成的工作项。一个数字指定要保留的工作项数量。默认行为是保留工作项在完成的集合中。
- __INLINE_CODE_102__: __INLINE_CODE_103__ - 如果 true，删除失败的工作项。一个数字指定要保留的工作项数量。默认行为是保留工作项在失败的集合中。
- __INLINE_CODE_104__: __INLINE_CODE_105__ - 限制记录的堆栈跟踪行数。

以下是一个自定义工作项选项的示例。

要延迟工作项的开始，使用__INLINE_CODE_106__配置项。

__CODE_BLOCK_9__

要将工作项添加到队列的右端（处理工作项作为 **LIFO**（Last In First Out）），将__INLINE_CODE_107__配置项的__INLINE_CODE_108__设置为 true。

__CODE_BLOCK_10__

要优先处理工作项，使用__INLINE_CODE_109__选项。

__CODE_BLOCK_11__

要查看完整的选项列表，请查看 API 文档__LINK_513__和__LINK_514__。

#### 消费者

消费者是一个定义方法的 **class**，这些方法将处理队列Here is the translation of the provided English technical documentation to Chinese:

**Decorator中的字符串参数**

在 Decorator 中的字符串参数（例如 __INLINE_CODE_113__）是要与类方法关联的队列名称。

__CODE_BLOCK_13__

当 worker 空闲且队列中有任务时，process 方法将被调用。该处理方法将接收 __INLINE_CODE_114__ 对象作为唯一参数。处理方法返回的值将被存储在任务对象中，可以在完成事件的监听器中访问。

__INLINE_CODE_115__ 对象具有多个方法，允许您与其状态交互。例如，上述代码使用 __INLINE_CODE_116__ 方法更新任务的进度。见 __LINK_515__ 对象 API 参考。

在 Bull older 版本中，您可以使用 __INLINE_CODE_120__ 装饰器来指定一个作业处理方法将只处理特定类型的作业（具有特定 __INLINE_CODE_118__ 的作业）：

> warning **警告** 这不适用于 BullMQ，继续阅读。

__CODE_BLOCK_14__

由于 BullMQ 生成的混淆，这种行为不再支持。相反，您需要使用 switch cases 来调用不同的服务或逻辑，以便每个作业：

__CODE_BLOCK_15__

这在 BullMQ 文档的 __LINK_516__ 部分中进行了介绍。

#### 请求作用域消费者

当消费者被标记为请求作用域时（了解更多关于注入作用域的 __LINK_517__），将为每个作业创建一个新的类实例。该实例将在作业完成后被垃圾回收。

__CODE_BLOCK_16__

由于请求作用域消费者类实例是动态创建的且作用域于单个作业，您可以通过构造函数注入一个 __INLINE_CODE_121__。

__CODE_BLOCK_17__

> info **提示** __INLINE_CODE_122__ token 来自 __INLINE_CODE_123__ 包。

#### 事件监听器

BullMQ 在队列和/或作业状态变化时生成了一些有用的事件。这些事件可以在 Worker 级别使用 __INLINE_CODE_124__ 装饰器订阅，或者在 Queue 级别使用专门的监听器类和 __INLINE_CODE_125__ 装饰器。

Worker 事件必须在 __HTML_TAG_285__consumer__HTML_TAG_286__ 类（即使用 __INLINE_CODE_126__ 装饰器的类）中声明。要监听事件，使用 __INLINE_CODE_127__ 装饰器指定要处理的事件。例如，要监听 __INLINE_CODE_128__ 队列中的作业进入活动状态事件，使用以下构造：

__CODE_BLOCK_18__

可以查看 WorkerListener 的完整事件列表和事件参数 __LINK_518__。

QueueEvent 监听器必须使用 __INLINE_CODE_129__ 装饰器并扩展 __INLINE_CODE_130__ 类提供的 __INLINE_CODE_131__。要监听事件，使用 __INLINE_CODE_132__ 装饰器指定要处理的事件。例如，要监听 __INLINE_CODE_133__ 队列中的作业进入活动状态事件，使用以下构造：

__CODE_BLOCK_19__

> info **提示** QueueEvent 监听器必须被注册为 __INLINE_CODE_134__，以便 __INLINE_CODE_135__ 包可以发现它们。

可以查看 QueueEventsListener 的完整事件列表和事件参数 __LINK_519__。

#### 队列管理

队列具有 API，可以执行管理函数，如暂停和恢复、获取作业在各种状态中的计数等等。可以在 __LINK_520__ 中找到队列的完整 API。可以在 __INLINE_CODE_136__ 对象上直接调用这些方法，例如，使用 pause/resume 示例。

暂停队列使用 __INLINE_CODE_137__ 方法调用。暂停的队列将不处理新的作业，直到恢复当前作业正在处理的作业将继续到最后。

__CODE_BLOCK_20__

恢复暂停的队列使用 __INLINE_CODE_138__ 方法，例如：

__CODE_BLOCK_21__

#### 分开进程

作业处理器也可以在分开的（forked）进程中运行 (__LINK_521__）。这具有以下优点：

- 进程被sandboxed，崩溃时不会影响 worker。
- 可以运行阻塞代码而不会影响队列（作业不会阻塞）。
- 更好地利用多核心 CPU。
- 减少 Redis 连接。

__CODE_BLOCK_22__

> warning **警告** 请注意，因为您的函数是在 forked 进程中执行的，因此 Dependency Injection（和 IoC 容器）将不可用。因此，您的处理函数需要包含（或创建）所有外部依赖项的实例。

#### Async 配置Here is the translation of the English technical documentation to Chinese:

**使用 __INLINE_CODE_139__ 方法异步传递选项**

如果你想将 __INLINE_CODE_139__ 方法的选项传递给 __INLINE_CODE_140__ 方法，可以使用 __INLINE_CODE_141__ 方法。

一种方法是使用工厂函数：

__CODE_BLOCK_23__

我们的工厂函数像其他 __LINK_522__ 一样，可以被 __INLINE_CODE_142__ 并且可以注入依赖项通过 __INLINE_CODE_143__。

__CODE_BLOCK_24__

或者，你可以使用 __INLINE_CODE_144__ 语法：

__CODE_BLOCK_25__

上述构建将在 __INLINE_CODE_146__ 中实例化 __INLINE_CODE_145__ 并使用它来提供选项对象，通过调用 __INLINE_CODE_147__。注意，这意味着 __INLINE_CODE_148__ 需要实现 __INLINE_CODE_149__ 接口，如下所示：

__CODE_BLOCK_26__

为了防止在 __INLINE_CODE_151__ 中创建 __INLINE_CODE_150__ 并使用来自不同模块的提供程序，你可以使用 __INLINE_CODE_152__ 语法。

__CODE_BLOCK_27__

这构建与 __INLINE_CODE_153__ 相同，但有一点不同的是 __INLINE_CODE_154__ 将查找导入的模块以重用现有的 __INLINE_CODE_155__ 而不是实例化新的一个。

**异步传递队列选项**

如果你想将队列选项异步传递，可以使用 __INLINE_CODE_156__ 方法，但请记住在工厂函数外指定 __INLINE_CODE_157__ 属性。

__CODE_BLOCK_28__

#### 手动注册

默认情况下，__INLINE_CODE_158__ 将自动注册 BullMQ 组件（队列、处理器和事件监听服务）。然而，在某些情况下，这可能不太理想。要防止自动注册，启用 __INLINE_CODE_160__ 在 __INLINE_CODE_161__ 中，如下所示：

__CODE_BLOCK_29__

要手动注册这些组件，请注入 __INLINE_CODE_162__ 并调用 __INLINE_CODE_163__ 函数，最佳是在 __INLINE_CODE_164__ 或 __INLINE_CODE_165__ 中。

__CODE_BLOCK_30__

除非你调用 __INLINE_CODE_166__ 函数，无 BullMQ 组件将无法工作，这意味着没有作业将被处理。

#### Bull 安装

> warning **注意** 如果你决定使用 BullMQ，跳过本节和以下章节。

要开始使用 Bull，我们首先安装所需的依赖项。

__CODE_BLOCK_31__

安装完成后，我们可以将 __INLINE_CODE_167__ 导入到根 __INLINE_CODE_168__ 中。

__CODE_BLOCK_32__

__INLINE_CODE_169__ 方法用于注册一个 __INLINE_CODE_170__ 包含配置对象的包配置对象，该对象将被所有队列在应用程序中注册（除非指定其他）的一个配置对象。配置对象包含以下属性：

- __INLINE_CODE_171__ - 控制队列作业处理速率的选项。见 __LINK_523__ 了解更多信息。可选。
- __INLINE_CODE_172__ - 配置 Redis 连接选项。见 __LINK_524__ 了解更多信息。可选。
- __INLINE_CODE_173__ - 所有队列键的前缀。可选。
- __INLINE_CODE_174__ - 对新作业的默认设置控制选项。见 __LINK_525__ 了解更多信息。可选。 **注意：这些选项在使用 FlowProducer 定时作业时不生效。见 __LINK_526__ 了解详细信息。**
- __INLINE_CODE_175__ - 高级队列配置设置。这些通常不需要修改。见 __LINK_527__ 了解更多信息。可选。

所有选项都是可选的，可以提供详细的队列行为控制。这些选项将直接传递给 Bull __INLINE_CODE_176__ 构造函数。了解更多关于这些选项的信息 __LINK_528__。

要注册队列，请导入 __INLINE_CODE_177__ 动态模块，如下所示：

__CODE_BLOCK_33__

> info **提示** 使用多个逗号分隔的配置对象来创建多个队列。

__INLINE_CODE_179__ 方法用于实例化和/或注册队列。队列在模块和进程之间共享，并且连接到相同 underlying Redis 数据库的相同凭证。每个队列都是唯一的，因为其名称属性。队列名称用作注入令牌（用于注入队列到控制器/提供程序）和装饰器的参数，以将消费者类和监听器与队列关联。

你也可以覆盖特定队列的预配置选项，如下所示：

__CODE_BLOCK_34__

由于作业在 Redis 中被 persist，队列每次实例化（例如，当应用程序启动/重新启动时）都会尝试处理可能存在的旧作业。

每个队列可以有一个或多个生产者、消费者和监听器。消费者从队列中检索作业，以 FIFO（默认）、LIFO 或根据优先级的顺序。控制队列处理顺序的讨论 __HTML_TAG_287__这里__HTML_TAG_288__。__HTML_TAG_289____HTML_TAG_290__

#### 命名配置

如果您的队列连接到多个 Redis 实例，您可以使用名为 **named configurations** 的技术。该特性允许您注册多个配置，以指定的键，然后在队列选项中引用它们。

例如，假设您拥有一个额外的 Redis 实例（除了默认实例），用于注册在您的应用程序中的少数队列，您可以将其配置注册如下：

__CODE_BLOCK_35__

在上面的示例中，__INLINE_CODE_180__只是一个配置键（可以是任意的字符串）。

现在，您可以在 __INLINE_CODE_181__ 选项对象中指向该配置：

__CODE_BLOCK_36__

#### 生产者

作业生产者将作业添加到队列中。生产者通常是 Nest应用程序服务（Nest __LINK_529__）。要将作业添加到队列中，首先将队列注入服务如下：

__CODE_BLOCK_37__

> info **提示** __INLINE_CODE_182__ 装饰器通过 __INLINE_CODE_183__ 方法调用中的名称来标识队列（例如 __INLINE_CODE_184__）。

现在，添加作业通过队列的 __INLINE_CODE_185__ 方法，传递一个用户定义的作业对象。作业对象是可序列化的JavaScript 对象（因为它们将被存储在 Redis 数据库中）。作业对象的形状是任意的；使用它来表示作业的语义。

__CODE_BLOCK_38__

#### 命名作业

作业可能具有唯一的名称。这允许您创建专门的 __HTML_TAG_291__消费者__HTML_TAG_292__，只处理具有给定名称的作业。

__CODE_BLOCK_39__

> Warning **警告** 使用命名作业时，您必须创建处理每个唯一名称的处理器，否则队列将抱怨您缺少给定作业的处理器。请查看 __HTML_TAG_293__这里__HTML_TAG_294__以获取更多关于消费命名作业的信息。

#### 作业选项

作业可以具有附加选项。将选项对象传递给 __INLINE_CODE_186__ 方法的 __INLINE_CODE_187__ 参数。作业选项属性是：

- __INLINE_CODE_188__: __INLINE_CODE_189__ - 可选的优先级值。范围从 1（最高优先级）到 MAX_INT（最低优先级）。请注意使用优先级可能会对性能产生轻微影响，因此请使用它们时小心。
- __INLINE_CODE_190__: __INLINE_CODE_191__ - 等待作业处理的时间（毫秒）。请注意为了准确地延迟，服务器和客户端都需要同步时钟。
- __INLINE_CODE_192__: __INLINE_CODE_193__ - 尝试作业的总次数。
- __INLINE_CODE_194__: __INLINE_CODE_195__ -  Cron 规定的重复作业。请查看 __LINK_530__。
- __INLINE_CODE_196__: __INLINE_CODE_197__ - 自动重试失败作业的退后设置。请查看 __LINK_531__。
- __INLINE_CODE_198__: __INLINE_CODE_199__ - 如果 true，将作业添加到队列的右端（默认 false）。
- __INLINE_CODE_200__: __INLINE_CODE_201__ - 作业超时后的毫秒数。
- __INLINE_CODE_202__: __INLINE_CODE_203__ | __INLINE_CODE_204__ - Override 作业 ID - 默认情况下，作业 ID 是唯一的整数，但您可以使用这个设置来override它。如果您使用这个选项，需要确保作业 ID 是唯一的。如果您尝试添加具有已存在 ID 的作业，它将不会被添加。
- __INLINE_CODE_205__: __INLINE_CODE_206__ - 如果 true，删除成功完成的作业。数字指定要保留的作业数量。默认行为是保留作业在完成集中。
- __INLINE_CODE_207__: __Inlining_code_208__ - 如果 true，删除失败的作业。数字指定要保留的作业数量。默认行为是保留作业在失败集中。
- __INLINE_CODE_209__: __INLINE_CODE_210__ - 限制记录在堆栈中的栈 trace 行数。

以下是一些使用作业选项的自定义示例。

要延迟作业的开始，使用 __INLINE_CODE_211__ 配置属性。

__CODE_BLOCK_40__

要将作业添加到队列的右端（处理作业的最后一个），将 __INLINE_CODE_212__ 属性设置为 __INLINE_CODE_213__。

__CODE_BLOCK_41__

要优先处理作业，使用 __INLINE_CODE_214__ 属性。

__CODE_BLOCK_42__

#### 消费者

消费者是一个定义方法的 **class**，这些方法将处理添加到队列中的作业，或者监听队列上的事件，或者 both。使用 __INLINE_CODE_215__ 装饰器如下：

__CODE_BLOCK_43__

> info **提示** 消费者必须注册为 __INLINE_CODE_216__，以便 __INLINE_CODE_217__ 包可以将其选取。

其中装饰器的字符串参数Here is the translated Chinese technical documentation:

在消费者类中，使用__INLINE_CODE_219__装饰器来声明工作处理程序。

__CODE_BLOCK_44__

装饰的方法（例如__INLINE_CODE_220__）在 worker 空闲时被调用，队列中有工作待处理时。该方法接收 __INLINE_CODE_221__ 对象作为唯一参数。处理方法返回的值将被存储在工作对象中，可以在完成事件的监听器中访问。

__INLINE_CODE_222__ 对象具有多个方法，允许您与其状态进行交互。例如，上述代码使用 __INLINE_CODE_223__ 方法更新工作的进度。请查看 __LINK_532__ 获取完整 __INLINE_CODE_224__ 对象 API 参考。

您可以使用 __INLINE_CODE_227__ 装饰器指定一个工作处理程序将只处理特定类型的工作（具有特定 __INLINE_CODE_225__ 的工作），如以下所示。您可以在一个给定的消费者类中拥有多个 __INLINE_CODE_228__ 处理程序，相应于每个工作类型（__INLINE_CODE_229__）。当您使用命名工作时，请确保有对应的处理程序。

__CODE_BLOCK_45__

> 警告 **Warning** 定义同一队列的多个消费者时，__INLINE_CODE_231__ 选项在 __INLINE_CODE_231__ 中不起作用。最小 __INLINE_CODE_232__ 将匹配定义的消费者数量。这也适用于 __INLINE_CODE_233__ 处理程序使用不同的 __INLINE_CODE_234__ 处理命名工作。

#### 请求作用域消费者

当消费者被标记为请求作用域（了解更多关于注入作用域 __LINK_533__）时，会创建一个新的类实例，专门为每个工作创建。实例将在工作完成后被回收。

__CODE_BLOCK_46__

由于请求作用域消费者类实例在动态创建并且作用于单个工作，因此可以使用标准方法通过构造函数注入一个 __INLINE_CODE_235__。

__CODE_BLOCK_47__

> 提示 **Hint** __INLINE_CODE_236__ 令牌来自 __INLINE_CODE_237__ 包。

#### 事件监听器

Bull 在队列和/或工作状态变化时生成了一组有用的事件。Nest 提供了一些装饰器，允许订阅标准事件的一些核心事件。这些事件来自 __INLINE_CODE_238__ 包。

事件监听器必须在 __HTML_TAG_295__consumer__HTML_TAG_296__ 类中声明（即在装饰了 __INLINE_CODE_239__ 装饰器的类中）。要监听事件，请使用下面的 construct 声明事件处理程序，例如，以监听__INLINE_CODE_240__队列中的活动状态更改事件：

__CODE_BLOCK_48__

由于 Bull 在分布式（多节点）环境中操作，因此定义了事件局部性概念。这概念认知事件可能是单个进程中触发的，或者是来自不同进程的共享队列的事件。一个 **local** 事件是指在队列中触发的事件，它们是由本地进程中的事件生产者和消费者产生的。换言之，当事件生产者和消费者都是本地进程时，所有队列事件都是本地事件。

当队列跨越多个进程时，我们遇到 **global** 事件的可能性。为了让一个进程中的监听器接收来自另一个进程触发的事件通知，它必须注册为全局事件。

事件处理程序在其对应事件被触发时被调用。处理程序将使用以下签名，提供对事件相关信息的访问。我们将讨论 local 和 global 事件处理程序签名之间的一键差异。Here is the translated text in Chinese:

__HTML_TAG_297__
  __HTML_TAG_298__
    __HTML_TAG_299__本地事件监听器__HTML_TAG_300__
    __HTML_TAG_301__全局事件监听器__HTML_TAG_302__
    __HTML_TAG_303__处理方法签名/触发时__HTML_TAG_304__
  __HTML_TAG_305__
  __HTML_TAG_306__
    __HTML_TAG_307____HTML_TAG_308__@OnQueueError()__HTML_TAG_309____HTML_TAG_310____HTML_TAG_311____HTML_TAG_312__@OnGlobalQueueError()__HTML_TAG_313____HTML_TAG_314____HTML_TAG_315____HTML_TAG_316__handler(error: Error)__HTML_TAG_317__ - 发生错误。__HTML_TAG_318__error__HTML_TAG_319__包含触发错误的信息。__HTML_TAG_320__
  __HTML_TAG_321__
  __HTML_TAG_322__
    __HTML_TAG_323____HTML_TAG_324__@OnQueueWaiting()__HTML_TAG_325____HTML_TAG_326____HTML_TAG_327____HTML_TAG_328__@OnGlobalQueueWaiting()__HTML_TAG_329____HTML_TAG_330____HTML_TAG_331____HTML_TAG_332__handler(jobId: number | string)__HTML_TAG_333__ - 一份作业正在等待处理，直到有空闲的工作者。__HTML_TAG_334__jobId__HTML_TAG_335__包含作业的 ID。__HTML_TAG_336__
  __HTML_TAG_337__
  __HTML_TAG_338__
    __HTML_TAG_339____HTML_TAG_340__@OnQueueActive()__HTML_TAG_341____HTML_TAG_342____HTML_TAG_343____HTML_TAG_344__@OnGlobalQueueActive()__HTML_TAG_345____HTML_TAG_346____HTML_TAG_347____HTML_TAG_348__handler(job: Job)__HTML_TAG_349__ - 作业__HTML_TAG_350__job__HTML_TAG_351__已经开始。__HTML_TAG_352__
  __HTML_TAG_353__
  __HTML_TAG_354__
    __HTML_TAG_355____HTML_TAG_356__@OnQueueStalled()__HTML_TAG_357____HTML_TAG_358____HTML_TAG_359____HTML_TAG_360__@OnGlobalQueueStalled()__HTML_TAG_361____HTML_TAG_362____HTML_TAG_363____HTML_TAG_364__handler(job: Job)__HTML_TAG_365__ - 作业__HTML_TAG_366__job__HTML_TAG_367__已经标记为已挂起。这个是非常有用的，因为它可以帮助调试工作者崩溃或暂停事件循环。__HTML_TAG_368__
  __HTML_TAG_369__
  __HTML_TAG_370__
    __HTML_TAG_371____HTML_TAG_372__@OnQueueProgress()__HTML_TAG_373____HTML_TAG_374____HTML_TAG_375____HTML_TAG_376__@OnGlobalQueueProgress()__HTML_TAG_377____HTML_TAG_378____HTML_TAG_379____HTML_TAG_380__handler(job: Job, progress: number)__HTML_TAG_381__ - 作业__HTML_TAG_382__job__HTML_TAG_383__'s 进度被更新到值__HTML_TAG_384__progress__HTML_TAG_385__。__HTML_TAG_386__
  __HTML_TAG_387__
  __HTML_TAG_388__
    __HTML_TAG_389____HTML_TAG_390__@OnQueueCompleted()__HTML_TAG_391____HTML_TAG_392____HTML_TAG_393____HTML_TAGHere is the translation of the provided English technical documentation to Chinese:

__HTML_TAG_498__
  __HTML_TAG_499__
__HTML_TAG_500__.当您监听全局事件时，方法签名可能不同于其本地对应版本。具体来说，在本地版本中接受 __INLINE_CODE_241__ 对象的方法签名，在全局版本中将接收一个 __INLINE_CODE_242__ (__INLINE_CODE_243__)。要获取实际 __INLINE_CODE_244__ 对象的引用，在这种情况下，您可以使用 __INLINE_CODE_245__ 方法。该调用需要等待，因此处理程序应该声明为 __INLINE_CODE_246__。例如：

__CODE_BLOCK_49__

> info **Hint** 要访问 __INLINE_CODE_247__ 对象（以便执行 __INLINE_CODE_248__ 调用），您必须将其注入。同时，队列必须在您注入它的模块中注册。

除了特定的事件监听装饰器外，您还可以使用通用的 __INLINE_CODE_249__ 装饰器，结合 __INLINE_CODE_250__ 或 __INLINE_CODE_251__ 枚举。了解更多关于事件的信息 __LINK_534__。

#### 队列管理

队列具有一个 API，可以执行管理函数，如暂停和恢复、获取各种状态下的作业数量等。您可以在 __LINK_535__ 中找到队列的完整 API。可以在 __INLINE_CODE_252__ 对象上直接调用这些方法，如下所示的暂停/恢复示例。

使用 __INLINE_CODE_253__ 方法调用暂停队列。暂停的队列将不会处理新的作业，直到恢复，但当前正在处理的作业将继续直到它们被最终化。

__CODE_BLOCK_50__

要恢复暂停的队列，使用 __INLINE_CODE_254__ 方法，例如：

__CODE_BLOCK_51__

#### 分离进程

作业处理程序也可以在一个单独的（分离的）进程中运行 (__LINK_536__）。这具有以下优点：

- 进程是 sandboxed 的，因此如果它崩溃它不会影响工作者。
- 您可以运行阻塞代码，而不会影响队列（作业将不会卡住）。
- 对于多核 CPU 的利用率更好。
- 连接到 Redis 的数量更少。

__CODE_BLOCK_52__

请注意，因为您的函数在一个分离的进程中执行，依赖注入（和 IoC 容器）将不可用。这意味着您的处理程序需要包含（或创建）所有外部依赖项的实例。

__CODE_BLOCK_53__

####异步配置

您可能想异步地传递 __INLINE_CODE_255__ 选项，而不是静态地传递。在这种情况下，可以使用 __INLINE_CODE_256__ 方法，该方法提供了多种方式来处理异步配置。

一种方法是使用工厂函数：

__CODE_BLOCK_54__

我们的工厂行为就像任何其他 __LINK_537__ 一样（例如，它可以 __INLINE_CODE_257__ 并且可以通过 __INLINE_CODE_258__ 注入依赖项）。

__CODE_BLOCK_55__

或者，您可以使用 __INLINE_CODE_259__ 语法：

__CODE_BLOCK_56__

上述构建将在 __INLINE_CODE_261__ 中实例化 __INLINE_CODE_260__ 并使用它来提供选项对象，同时调用 __INLINE_CODE_262__。请注意，这意味着 __INLINE_CODE_263__ 必须实现 __INLINE_CODE_264__ 接口，例如：

__CODE_BLOCK_57__

要防止在 __INLINE_CODE_266__ 中创建 __INLINE_CODE_265__ 并使用来自不同模块的提供者，您可以使用 __INLINE_CODE_267__ 语法。

__CODE_BLOCK_58__

上述构建与 __INLINE_CODE_268__ 相似，但有一点不同的是 __INLINE_CODE_269__ 将在导入模块中寻找现有 __INLINE_CODE_270__ 而不是实例化新的一个。

类似地，如果您想异步地传递队列选项，可以使用 __INLINE_CODE_271__ 方法，只需注意在工厂函数外指定 __INLINE_CODE_272__ 属性。

__CODE_BLOCK_59__

#### 示例

一个工作示例可在 __LINK_538__ 中找到。