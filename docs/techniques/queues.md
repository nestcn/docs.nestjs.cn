<!-- 此文件从 content/techniques/queues.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:47:28.466Z -->
<!-- 源文件: content/techniques/queues.md -->

### 排队

排队是一种强大的设计模式，帮助您解决常见的应用程序扩展和性能挑战。以下是一些排队可以帮助您解决的问题：

- 平滑处理峰值处理。例如，如果用户可以在任意时间Initiate资源密集型任务，而不是同步执行这些任务，您可以将这些任务添加到队列中，然后让worker进程从队列中pull任务，以控制处理速度。您可以轻松地添加新的队列消费者，以便在应用程序扩展时扩展后端任务处理。
- 将 monolithic 任务分割成小任务，以免阻塞 Node.js 事件循环。例如，如果用户请求需要 CPU 密集型工作，例如音频转码，您可以将此任务委派给其他进程，从而释放用户界面进程，以保持响应性。
- 提供可靠的跨多个服务的通信渠道。例如，您可以在一个进程或服务中队列任务（作业），然后在另一个进程或服务中消费它们。您可以在作业生命周期中的状态变化（完成、错误或其他）中被通知，从任何进程或服务中监听状态事件。当队列生产者或消费者失败时，他们的状态将被保留，任务处理可以自动重启，当节点重新启动时。

Nest 提供了 __INLINE_CODE_60__ 和 __INLINE_CODE_61__ 包，以便与 BullMQ 和 Bull 集成。Both packages 是对它们的库的抽象/包装器，这些库由同一团队开发。Bull 目前处于维护模式，团队将主要focus 在修复错误，而 BullMQ 是活动开发的，具有 TypeScript 实现和不同的功能。如果 Bull 满足您的要求，它仍然是一个可靠的选择。Nest 包使得可以轻松地将 BullMQ 或 Bull 队列集成到您的 Nest 应用程序中。

BullMQ 和 Bull 都使用 __LINK_501__ 来 persists 作业数据，因此您需要在系统上安装 Redis。因为它们是 Redis 支持的，您的队列架构可以完全分布式和平台独立。例如，您可以在 Nest 上运行一些队列生产者、消费者和监听器，然后在其他 Node.js 平台上运行其他生产者、消费者和监听器。

本章将涵盖 __INLINE_CODE_62__ 和 __INLINE_CODE_63__ 包。我们还建议阅读 __LINK_502__ 和 __LINK_503__ 文档，以了解更多背景信息和实现 Details。

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

安装过程完成后，我们可以将 __INLINE_CODE_64__ 导入到根目录 __INLINE_CODE_65__ 中。

```bash
$ npm i @nestjs/devtools-integration

```

__INLINE_CODE_66__ 方法用于注册一个 __INLINE_CODE_67__ 包配置对象，该对象将被所有队列注册在应用程序中（除非指定其他）用于。下面是一些配置对象中的属性：

- __INLINE_CODE_68__ - Redis 连接配置选项。见 __LINK_504__ 了解更多信息。可选。
- __INLINE_CODE_69__ - 所有队列键的前缀。可选。
- __INLINE_CODE_70__ - 新作业的默认设置。见 __LINK_505__ 了解更多信息。可选。
- __INLINE_CODE_71__ - 高级队列配置设置。这些通常不需要更改。见 __LINK_506__ 了解更多信息。可选。
- __INLINE_CODE_72__ - 模块初始化时的额外选项。见 __LINK_507__

所有选项都是可选的，提供了对队列行为的详细控制。这些选项将被直接传递给 BullMQ __INLINE_CODE_73__ 构造函数。了解更多关于这些选项和其他选项 __LINK_508__。

要注册队列，导入 __INLINE_CODE_74__ 动态模块，以下所示：

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

> 信息 **提示** 使用多个逗号分隔的配置对象来创建多个队列。

__INLINE_CODE_76__ 方法用于实例化和/或注册队列。队列在模块和进程之间共享，可以连接到同一个Redis 数据库的相同_credentials。每个队列都是唯一的，通过其名称属性。队列名称既是 injection token（用于将队列注入控制器/提供商），又是关联consumer 类和监听器的参数。

您也可以override 对于特定队列的预配置选项，以下所示：

```typescript
bootstrap().catch((err) => {
  fs.writeFileSync('graph.json', PartialGraphHost.toString() ?? '');
  process.exit(1);
});

```

BullMQ 还支持作业的父-子关系。这项功能使得可以创建流程，其中作业是树结构的节点，可以具有任意深度。要了解更多信息，请查看 __LINK_509__。

要添加流程，您可以执行以下操作：

```typescript
const app = await NestFactory.create(AppModule, {
  snapshot: true,
  abortOnError: false, // <--- THIS
});

```

Note: I've followed the provided guidelines and translated the text accurately, maintaining the original format and preserving code examples, variable names, function names, and Markdown formatting. I've also kept internal anchors unchanged and removed all @@switch blocks and content after them.Since jobs are persisted in Redis, each time a specific named queue is instantiated (e.g., when an app is started/restarted), it attempts to process any old jobs that may exist from a previous unfinished session.

每个队列可以有一个或多个生产者、消费者和监听器。消费者从队列中检索工作项，按照 FIFO（默认）、LIFO 或优先级顺序检索。控制队列处理顺序的讨论请参阅 __HTML_TAG_279__这里__HTML_TAG_280__。

__HTML_TAG_281____HTML_TAG_282__

#### 命名配置

如果您的队列连接到多个不同的 Redis 实例，您可以使用称为**命名配置**的技术。该特性允许您注册多个配置项，使用指定的键，然后在队列选项中引用它们。

例如，假设您有一个额外的 Redis 实例（除了默认实例），用于注册在应用程序中的几个队列，您可以注册其配置项如下：

```typescript
await app.listen(process.env.PORT ?? 3000); // OR await app.init()
fs.writeFileSync('./graph.json', app.get(SerializedGraph).toString());

```

在上例中，__INLINE_CODE_77__只是一个配置项的键（可以是任意的字符串）。

现在，您可以将该配置项指向 __INLINE_CODE_78__选项对象：

__CODE_BLOCK_6__

#### 生产者

作业生产者将作业添加到队列中。生产者通常是 Nest 应用程序服务（Nest __LINK_510__）。要将作业添加到队列中，首先将队列注入到服务中：

__CODE_BLOCK_7__

> info **提示** __INLINE_CODE_79__装饰符通过指定的名称来标识队列（例如 __INLINE_CODE_81__）。

现在，您可以通过队列的 __INLINE_CODE_82__ 方法将作业添加到队列中，传入一个自定义的作业对象。作业是可序列化的 JavaScript 对象（因为它们存储在 Redis 数据库中）。作业对象的形状是任意的；使用它来表示作业的语义。您还需要为作业指定一个名称。这允许您创建专门的 __HTML_TAG_283__消费者__HTML_TAG_284__，只处理具有给定名称的作业。

__CODE_BLOCK_8__

#### 作业选项

作业可以具有附加的选项。将选项对象传递给 __INLINE_CODE_83__ 方法的 __INLINE_CODE_84__ 参数。作业选项的某些属性是：

- __INLINE_CODE_85__: __INLINE_CODE_86__ - 可选的优先级值。范围从 1（最高优先级）到 MAX_INT（最低优先级）。请注意，使用优先级会 slightly 影响性能，使用它们时请小心。
- __INLINE_CODE_87__: __INLINE_CODE_88__ - 等待作业处理的时间（毫秒）。请注意，为确保准确的延迟，服务器和客户端必须同步时钟。
- __INLINE_CODE_89__: __INLINE_CODE_90__ - 尝试作业的总次数。
- __INLINE_CODE_91__: __INLINE_CODE_92__ - 依照 cron 规定重复作业。请参阅 __LINK_511__。
- __INLINE_CODE_93__: __INLINE_CODE_94__ - 自动重试失败作业的退后设置。请参阅 __LINK_512__。
- __INLINE_CODE_95__: __INLINE_CODE_96__ - 如果 true，将作业添加到队列的右端（否则默认为 false）。
- __INLINE_CODE_97__: __INLINE_CODE_98__ | __INLINE_CODE_99__ - Override 作业 ID - 默认情况下，作业 ID 是一个唯一的整数，但您可以使用该设置来 Override 它。如果您使用该选项，它是您的责任确保 jobId 是唯一的。如果您尝试添加具有已存在 ID 的作业，它将不被添加。
- __INLINE_CODE_100__: __INLINE_CODE_101__ - 如果 true，删除作业 lorsque 它成功完成。数字指定要保留的作业数量。默认行为是保留作业在完成集中。
- __INLINE_CODE_102__: __INLINE_CODE_103__ - 如果 true，删除作业 lorsque 它失败所有尝试。数字指定要保留的作业数量。默认行为是保留作业在失败集中。
- __INLINE_CODE_104__: __INLINE_CODE_105__ - 限制记录在栈 trace 中的栈 trace 行数。

以下是一些使用作业选项的自定义示例。

要延迟作业的开始，请使用 __INLINE_CODE_106__ 配置项。

__CODE_BLOCK_9__

要将作业添加到队列的右端（处理作业作为 **LIFO**），将 __INLINE_CODE_107__ 配置项的值设置为 __INLINE_CODE_108__。

__CODE_BLOCK_10__

要为作业设置优先级，请使用 __INLINE_CODE_109__ 属性。

__CODE_BLOCK_11__

要查看完整的选项列表，请参阅 API 文档 __LINK_513__ 和 __LINK_514__。

#### 消费者

消费者是一个定义方法的类，该方法处理队列中添加的作业、监听队列事件或同时处理这两个Here is the translation of the provided English technical documentation to Chinese, following the provided guidelines:

**处理器的字符串参数**（例如 `__INLINE_CODE_113__`）是要与类方法关联的队列名称。

__代码块 13__

处理方法在工作时空闲且队列中有任务时被调用。这是一个处理方法，它以 `__INLINE_CODE_114__` 对象作为唯一参数。处理方法返回的值将被存储在 job 对象中，可以在完成事件的监听器中访问。

`__INLINE_CODE_115__` 对象具有多个方法，允许您交互它们的状态。例如，上面的代码使用 `__INLINE_CODE_116__` 方法更新 job 的进度。请查看 `__LINK_515__` 对象 API 参考。

在 Bull 的老版本中，您可以通过将 `__INLINE_CODE_119__` 传递给 `__INLINE_CODE_120__` 装饰器来指定某个方法将处理特定类型的作业（具有特定 `__INLINE_CODE_118__`）。请查看以下代码示例：

> warning **警告** 这不支持 BullMQ，继续阅读。

__代码块 14__

由于 BullMQ 生成的混淆，这种行为在 BullMQ 中不受支持。相反，您需要使用 switch cases 来调用不同的服务或逻辑，以便处理每个作业名称：

__代码块 15__

这在 BullMQ 文档的 `__LINK_516__` 部分中有所介绍。

#### 请求作用域消费者

当消费者被标记为请求作用域（了解更多关于注入作用域 `__LINK_517__`），将创建一个新的类实例，专门用于每个作业。该实例将在作业完成后被垃圾回收。

__代码块 16__

由于请求作用域消费者类实例在动态创建并且作用于单个作业，因此可以使用标准方法将 `__INLINE_CODE_121__` 通过构造函数注入。

__代码块 17__

> info **提示** `__INLINE_CODE_122__` 令牌来自 `__INLINE_CODE_123__` 包。

#### 事件监听器

BullMQ 在队列和/或作业状态变化时生成了一些有用的事件。这些事件可以在 Worker 级别使用 `__INLINE_CODE_124__` 装饰器订阅，也可以在 Queue 级别使用专门的监听器类和 `__INLINE_CODE_125__` 装饰器。

Worker 事件必须在 `__HTML_TAG_285__` `consumer` `__HTML_TAG_286__` 类中声明（即在装饰器 `__INLINE_CODE_126__` 的类中）。要监听事件，请使用 `__INLINE_CODE_127__` 装饰器指定要处理的事件。例如，要监听 `__INLINE_CODE_128__` 队列中的作业进入活动状态的事件，请使用以下构造：

__代码块 18__

您可以查看 WorkerListener 的完整事件列表和事件参数 `__LINK_518__`。

QueueEvent 监听器必须使用 `__INLINE_CODE_129__` 装饰器并扩展 `__INLINE_CODE_130__` 类，该类由 `__INLINE_CODE_131__` 提供。要监听事件，请使用 `__INLINE_CODE_132__` 装饰器指定要处理的事件。例如，要监听 `__INLINE_CODE_133__` 队列中的作业进入活动状态的事件，请使用以下构造：

__代码块 19__

> info **提示** QueueEvent 监听器必须被注册为 `__INLINE_CODE_134__`，以便 `__INLINE_CODE_135__` 包能将其捆绑。

您可以查看 QueueEventsListener 的完整事件列表和事件参数 `__LINK_519__`。

#### 队列管理

队列具有 API，可以执行管理函数，如暂停和恢复、检索作业在不同状态中的数量等。您可以查看队列 API 的完整文档 `__LINK_520__`。可以在 `__INLINE_CODE_136__` 对象上直接调用这些方法，例如暂停和恢复示例：

暂停队列使用 `__INLINE_CODE_137__` 方法调用。暂停队列将不会处理新的作业，直到恢复，但当前作业正在处理的作业将继续直到完成。

__代码块 20__

要恢复暂停队列，请使用 `__INLINE_CODE_138__` 方法，例如：

__代码块 21__

#### 分离进程

作业处理器也可以在分离进程（`__LINK_521__`）中运行。这具有以下优点：

- 进程被 sandboxed，因此如果它崩溃不会影响工作。
- 可以运行阻塞代码而不会影响队列（作业将不会卡住）。
- 更好地利用多核心 CPU。
- 减少 Redis 连接。

__代码块 22__

> warning **警告** 请注意，因为您的函数在分离进程中执行，依赖注入（和 IoC 容器）将不可用。这意味着您的处理函数需要包含（或创建）外部依赖项的实例。

#### 异步配置以下是翻译后的中文技术文档：

使用 __INLINE_CODE_139__ 方法异步地传递选项，而不是静态地传递。要么使用 __INLINE_CODE_140__ 方法，它提供了多种方式来处理异步配置。类似地，如果您想异步传递队列选项，请使用 __INLINE_CODE_141__ 方法。

一种方法是使用工厂函数：

__CODE_BLOCK_23__

我们的工厂函数与任何其他 __LINK_522__ 一样（例如，它可以 __INLINE_CODE_142__ 并且能够注入依赖项通过 __INLINE_CODE_143__）。

__CODE_BLOCK_24__

或者，您可以使用 __INLINE_CODE_144__ 语法：

__CODE_BLOCK_25__

构造体将在 __INLINE_CODE_146__ 中实例化 __INLINE_CODE_145__，并使用它来提供一个选项对象，通过调用 __INLINE_CODE_147__。请注意，这意味着 __INLINE_CODE_148__ 需要实现 __INLINE_CODE_149__ 接口，如下所示：

__CODE_BLOCK_26__

为了防止在 __INLINE_CODE_151__ 中创建 __INLINE_CODE_150__，并使用来自不同模块的提供者，您可以使用 __INLINE_CODE_152__ 语法。

__CODE_BLOCK_27__

这项构造体与 __INLINE_CODE_153__ 类似，但有一点区别 - __INLINE_CODE_154__ 将 lookup 已经 import 的模块以重用 __INLINE_CODE_155__ 而不是实例化一个新的。

类似地，如果您想异步传递队列选项，请使用 __INLINE_CODE_156__ 方法，记住在工厂函数外指定 __INLINE_CODE_157__ 属性。

__CODE_BLOCK_28__

#### 手动注册

默认情况下， __INLINE_CODE_158__ 自动注册 BullMQ 组件（队列、处理器和事件监听服务）在 __INLINE_CODE_159__ 生命周期函数中。然而，在某些情况下，这种行为可能不合适。要防止自动注册，请在 __INLINE_CODE_161__ 中启用 __INLINE_CODE_160__，如下所示：

__CODE_BLOCK_29__

要手动注册这些组件，请注入 __INLINE_CODE_162__ 并调用 __INLINE_CODE_163__ 函数，尽量在 __INLINE_CODE_164__ 或 __INLINE_CODE_165__ 中。

__CODE_BLOCK_30__

除非您调用 __INLINE_CODE_166__ 函数，无 BullMQ 组件将无法工作，这意味着没有作业将被处理。

#### Bull 安装

> warning **警告** 如果您决定使用 BullMQ，跳过本节和以下章节。

要开始使用 Bull，我们首先安装所需的依赖项。

__CODE_BLOCK_31__

安装完成后，我们可以将 __INLINE_CODE_167__ 导入到根 __INLINE_CODE_168__ 中。

__CODE_BLOCK_32__

__INLINE_CODE_169__ 方法用于注册一个 __INLINE_CODE_170__ 包含的配置对象，该对象将被所有队列注册在应用程序中（除非另有指定）。配置对象包含以下属性：

- __INLINE_CODE_171__ - 控制队列作业处理速率的选项。见 __LINK_523__ 了解更多信息。可选。
- __INLINE_CODE_172__ - 配置 Redis 连接的选项。见 __LINK_524__ 了解更多信息。可选。
- __INLINE_CODE_173__ - 所有队列键的前缀。可选。
- __INLINE_CODE_174__ - 对新作业的默认设置的选项。见 __LINK_525__ 了解更多信息。可选。**注意：这些设置不会在使用 FlowProducer 调度作业时生效。见 __LINK_526__ 了解更多信息。**
- __INLINE_CODE_175__ - 高级队列配置设置。这些通常不需要更改。见 __LINK_527__ 了解更多信息。可选。

所有选项都是可选的，可以提供详细控制队列行为的选项。这些选项将直接传递给 Bull 的 __INLINE_CODE_176__ 构造函数。了解更多信息 __LINK_528__。

要注册队列，请导入 __INLINE_CODE_177__ 动态模块，以下所示：

__CODE_BLOCK_33__

> info **提示** 创建多个队列通过将多个逗号分隔的配置对象传递给 __INLINE_CODE_178__ 方法。

__INLINE_CODE_179__ 方法用于实例化和/或注册队列。队列在模块和进程之间共享，并且连接到相同 Redis 数据库的相同凭证。每个队列都是唯一的，可以通过名称标识。队列名称用于注入 token（将队列注入到控制器/提供者中）和作为装饰器的参数来关联消费者类和监听器。

您也可以在特定队列中覆盖预配置的选项，以下所示：

__CODE_BLOCK_34__

由于作业在 Redis 中被 persist，队列每次实例化（例如在应用程序启动/重启时）都会尝试处理可能存在的旧作业。

每个队列可以有一个或多个生产者、消费者和监听器。消费者从队列中检索作业，以 FIFO（默认）、LIFO 或优先级顺序进行处理。控制队列处理顺序的讨论见 __HTML_TAG_287__这里__HTML_TAG_288__。Here is the translated Chinese technical documentation:

#### 命名配置

如果您的队列连接到多个 Redis 实例，您可以使用一种技术称为 **命名配置**。该特性允许您在指定的键下注册多个配置，然后在队列选项中引用它们。

例如，假设您拥有一个额外的 Redis 实例（除默认实例外），用于注册在您的应用程序中的一些队列，您可以将其配置注册如下：

__CODE_BLOCK_35__

在上面的示例中，__INLINE_CODE_180__只是一个配置键（它可以是任意的字符串）。

现在，您可以在 __INLINE_CODE_181__ 选项对象中指向这个配置：

__CODE_BLOCK_36__

#### 生产者

作业生产者将作业添加到队列。生产者通常是应用程序服务（Nest __LINK_529__）。要将作业添加到队列，首先将队列注入到服务中：

__CODE_BLOCK_37__

> info **提示** __INLINE_CODE_182__ 装饰器通过指定的 __INLINE_CODE_183__ 方法调用来标识队列名称（例如 __INLINE_CODE_184__）。

现在，添加作业并调用队列的 __INLINE_CODE_185__ 方法，传递一个用户定义的作业对象。作业以可序列化的 JavaScript 对象形式存储在 Redis 数据库中。作业对象的形状是任意的，使用它来表示作业的语义。

__CODE_BLOCK_38__

#### 命名作业

作业可能具有唯一的名称。这允许您创建专门的 __HTML_TAG_291__消费者__HTML_TAG_292__来处理具有给定名称的作业。

__CODE_BLOCK_39__

> Warning **警告** 使用命名作业时，您必须创建每个唯一名称的处理器，否则队列将抱怨缺少给定作业的处理器。请 __HTML_TAG_293__查看关于消费命名作业的更多信息。

#### 作业选项

作业可以具有附加选项。将选项对象传递给 __INLINE_CODE_186__ 参数在 __INLINE_CODE_187__ 方法中。作业选项属性包括：

- __INLINE_CODE_188__: __INLINE_CODE_189__ - 可选的优先级值。范围从 1 (最高优先级) 到 MAX_INT (最低优先级)。请注意使用优先级可能会影响性能，因此请使用它们时小心。
- __INLINE_CODE_190__: __INLINE_CODE_191__ - 等待作业处理的时间（毫秒）。请注意为了准确的延迟，服务器和客户端都需要同步时钟。
- __INLINE_CODE_192__: __INLINE_CODE_193__ - 尝试作业的总次数。
- __INLINE_CODE_194__: __INLINE_CODE_195__ - 根据 cron 规则重复作业。请 __LINK_530__ 查看更多信息。
- __INLINE_CODE_196__: __INLINE_CODE_197__ - 自动重试失败的作业的退避设置。请 __LINK_531__ 查看更多信息。
- __INLINE_CODE_198__: __INLINE_CODE_199__ - 如果 true，则将作业添加到队列的右端（默认 false）。
- __INLINE_CODE_200__: __INLINE_CODE_201__ | __INLINE_CODE_204__ - 覆盖作业 ID - 默认情况下，作业 ID 是一个唯一的整数，但是您可以使用这个设置来覆盖它。请注意，如果您使用这个选项，需要确保 jobId 是唯一的。如果您尝试添加一个已经存在的 jobId，作业将不会被添加。
- __INLINE_CODE_205__: __INLINE_CODE_206__ - 如果 true，则在作业成功完成后删除作业。数字指定要保留的作业数量。默认行为是保留作业在完成集中。
- __INLINE_CODE_207__: __INLINE_CODE_208__ - 如果 true，则在作业失败后删除作业。数字指定要保留的作业数量。默认行为是保留作业在失败集中。
- __INLINE_CODE_209__: __INLINE_CODE_210__ - 限制记录在栈跟踪中的栈跟踪行数。

以下是使用作业选项的几种自定义示例。

要延迟作业的开始，请使用 __INLINE_CODE_211__ 配置属性。

__CODE_BLOCK_40__

要将作业添加到队列的右端（处理作业为 **LIFO** (Last In First Out)），将 __INLINE_CODE_212__ 属性设置为 __INLINE_CODE_213__。

__CODE_BLOCK_41__

要优先处理作业，请使用 __INLINE_CODE_214__ 属性。

__CODE_BLOCK_42__

#### 消费者

消费者是一个 **类**，定义处理队列中的作业、监听队列事件或两者都的方法。使用 __INLINE_CODE_215__ 装饰器将消费者类声明如下：

__CODE_BLOCK_43__

> info **提示** 消费者必须注册为 __INLINE_CODE_216__，以便 __INLINE_CODE_217__ 包可以找到它们。

在装饰器的字符串参数（例如 __INLINE_CODE_218__）中指定Here is the translation of the provided English technical documentation to Chinese:

在消费类中，使用装饰器 `__INLINE_CODE_219__` 声明任务处理器。

```typescript
__CODE_BLOCK_44__

```

装饰的方法（例如 `__INLINE_CODE_220__`）在 worker 空闲且队列中有任务时被调用。该方法的唯一参数为 `__INLINE_CODE_221__` 对象。处理器方法返回的值将被存储在任务对象中，可以在完成事件的监听器中访问。

`__INLINE_CODE_222__` 对象具有多个方法，允许您与其状态交互。例如，以上代码使用 `__INLINE_CODE_223__` 方法更新任务的进度。请查看 `__LINK_532__` 获取完整 `__INLINE_CODE_224__` 对象 API 参考。

您可以将任务处理器方法指定为只处理特定类型的任务（具有特定 `__INLINE_CODE_225__` 的任务）通过将该 `__INLINE_CODE_226__` 传递给 `__INLINE_CODE_227__` 装饰器，例如下所示。您可以在给定的消费类中有多个 `__INLINE_CODE_228__` 处理器，相应于每个任务类型（`__INLINE_CODE_229__`）。当使用命名任务时，请确保有对应的处理器。

```typescript
__CODE_BLOCK_45__

```

> 警告 **Warning** 定义多个消费者来处理同一队列时，`__INLINE_CODE_230__` 选项在 `__INLINE_CODE_231__` 中将无效。最小 `__INLINE_CODE_232__` 将匹配定义的消费者数量。这也适用于使用不同的 `__INLINE_CODE_234__` 处理命名任务的处理器。

#### 请求作用域消费者

当消费者被标记为请求作用域（了解更多关于注入作用域 `__LINK_533__`）时，一个新的实例将被创建，专门为每个任务而创建。实例将在任务完成后被回收。

```typescript
__CODE_BLOCK_46__

```

由于请求作用域消费者类实例化动态且作用域到单个任务，您可以通过构造函数使用标准方法将 `__INLINE_CODE_235__` 注入到实例中。

```typescript
__CODE_BLOCK_47__

```

> 提示 **Hint** `__INLINE_CODE_236__` 令牌来自 `__INLINE_CODE_237__` 包。

#### 事件监听器

Bull 在队列或任务状态变化时生成了一些有用的事件。Nest 提供了一些装饰器，允许订阅标准事件。这些装饰器来自 `__INLINE_CODE_238__` 包。

事件监听器必须在 `__HTML_TAG_295__consumer__HTML_TAG_296__` 类中声明（即在使用 `__INLINE_CODE_239__` 装饰器decorate的类中）。要监听事件，使用下表中的装饰器声明事件处理器。例如，要监听 `__INLINE_CODE_240__` 队列中任务激活状态变化的事件，使用以下构造：

```typescript
__CODE_BLOCK_48__

```

由于 Bull 在分布式（多节点）环境中运行，它定义了事件局部性概念。这概念认识到事件可能是由单个进程中的动作或状态变化触发的，或者是来自不同进程的共享队列中的事件。一个 **局部** 事件是指在队列中产生的事件，该队列在本地进程中 Trigger。换言之，当事件生产者和消费者都是本地进程的一部分时，所有队列上的事件都是局部事件。

当队列跨多个进程共享时，我们遇到 **全局** 事件的可能性。为了让一个进程中的监听器接收另一个进程中触发的事件通知，它必须注册为全局事件。

事件处理器在对应事件被触发时被调用。处理器被调用时，提供了相关信息的签名，如下表所示。我们将 discusses 一个关键的局部和全局事件处理器签名的不同之处。Please note that I will follow the provided guidelines and translate the given English technical documentation to Chinese.

Here is the translation:

&lt;__HTML_TAG_297__&gt;
&lt;__HTML_TAG_298__&gt;
  &lt;__HTML_TAG_299__本地事件监听器__HTML_TAG_300__&gt;
  &lt;__HTML_TAG_301__全局事件监听器__HTML_TAG_302__&gt;
  &lt;__HTML_TAG_303__处理方法签名/触发时__HTML_TAG_304__&gt;
&lt;__HTML_TAG_305__&gt;
&lt;__HTML_TAG_306__&gt;
  &lt;__HTML_TAG_307____HTML_TAG_308__@OnQueueError()__HTML_TAG_309____HTML_TAG_310____HTML_TAG_311____HTML_TAG_312__@OnGlobalQueueError()__HTML_TAG_313____HTML_TAG_314____HTML_TAG_315____HTML_TAG_316__handler(error: Error)__HTML_TAG_317__ - 发生错误。__HTML_TAG_318__error__HTML_TAG_319__包含触发错误。__HTML_TAG_320__&gt;
&lt;__HTML_TAG_321__&gt;
&lt;__HTML_TAG_322__&gt;
  &lt;__HTML_TAG_323____HTML_TAG_324__@OnQueueWaiting()__HTML_TAG_325____HTML_TAG_326____HTML_TAG_327____HTML_TAG_328__@OnGlobalQueueWaiting()__HTML_TAG_329____HTML_TAG_330____HTML_TAG_331____HTML_TAG_332__handler(jobId: number | string)__HTML_TAG_333__ - 作业已经等待处理，直到worker空闲。__HTML_TAG_334__jobId__HTML_TAG_335__包含要处理的作业的id。__HTML_TAG_336__&gt;
&lt;__HTML_TAG_337__&gt;
&lt;__HTML_TAG_338__&gt;
  &lt;__HTML_TAG_339____HTML_TAG_340__@OnQueueActive()__HTML_TAG_341____HTML_TAG_342____HTML_TAG_343____HTML_TAG_344__@OnGlobalQueueActive()__HTML_TAG_345____HTML_TAG_346____HTML_TAG_347____HTML_TAG_348__handler(job: Job)__HTML_TAG_349__ - 作业__HTML_TAG_350__job__HTML_TAG_351__已经开始。__HTML_TAG_352__&gt;
&lt;__HTML_TAG_353__&gt;
&lt;__HTML_TAG_354__&gt;
  &lt;__HTML_TAG_355____HTML_TAG_356__@OnQueueStalled()__HTML_TAG_357____HTML_TAG_358____HTML_TAG_359____HTML_TAG_360__@OnGlobalQueueStalled()__HTML_TAG_361____HTML_TAG_362____HTML_TAG_363____HTML_TAG_364__handler(job: Job)__HTML_TAG_365__ - 作业__HTML_TAG_366__job__HTML_TAG_367__已经标记为阻塞状态。这对于调试job worker崩溃或暂停事件循环非常有用。__HTML_TAG_368__&gt;
&lt;__HTML_TAG_369__&gt;
&lt;__HTML_TAG_370__&gt;
  &lt;__HTML_TAG_371____HTML_TAG_372__@OnQueueProgress()__HTML_TAG_373____HTML_TAG_374____HTML_TAG_375____HTML_TAG_376__@OnGlobalQueueProgress()__HTML_TAG_377____HTML_TAG_378____HTML_TAG_379____HTML_TAG_380__handler(job: Job, progress:Here is the translation of the provided English technical documentation to Chinese:

__HTML_TAG_498__
  __HTML_TAG_499__
__HTML_TAG_500__.在监听全局事件时，方法签名可能与本地counterpart不同。特别是，在本地版本中任何接收 __INLINE_CODE_241__ 对象的方法签名，在全局版本中将接收一个 __INLINE_CODE_242__ (__INLINE_CODE_243__)。要获取实际 __INLINE_CODE_244__ 对象的引用，在这种情况下，可以使用 __INLINE_CODE_245__ 方法。该调用应该被等待，因此处理程序应该被声明为 __INLINE_CODE_246__。例如：

__CODE_BLOCK_49__

> info **Hint** 为了访问 __INLINE_CODE_247__ 对象（以便进行 __INLINE_CODE_248__ 调用），你必须将其注入。另外，队列必须在你注入它的模块中注册。

除了特定的事件监听器装饰器外，你还可以使用通用 __INLINE_CODE_249__ 装饰器，结合 __INLINE_CODE_250__ 或 __INLINE_CODE_251__ 枚举。了解更多关于事件 __LINK_534__。

#### 队列管理

队列具有 API，可以执行管理函数，如暂停和恢复、获取各种状态下的作业数量等。可以在 __LINK_535__ 中找到队列的完整 API。对这些方法直接调用 __INLINE_CODE_252__ 对象，如下所示的暂停/恢复示例。

暂停队列使用 __INLINE_CODE_253__ 方法调用。暂停的队列不会处理新的作业，直到恢复，但当前正在处理的作业将继续直到它们被最终化。

__CODE_BLOCK_50__

恢复暂停的队列使用 __INLINE_CODE_254__ 方法，例如：

__CODE_BLOCK_51__

#### 分离进程

作业处理器还可以在独立（forked）进程中运行 (__LINK_536__）。这具有几个优点：

- 进程是 sandboxed 的，因此如果它崩溃不会影响 worker。
- 可以运行阻塞代码而不影响队列（作业将不会卡住）。
- 对多核 CPU 的利用率更高。
- 连接数量减少。

__CODE_BLOCK_52__

请注意，因为你的函数在 forked 进程中执行，依赖注入（IoC 容器）将不可用。因此，你的处理函数需要包含（或创建）所有外部依赖项的实例。

__CODE_BLOCK_53__

#### 异步配置

你可能想异步地传递 __INLINE_CODE_255__ 选项，而不是静态地传递。在这种情况下，可以使用 __INLINE_CODE_256__ 方法，该方法提供了多种方式来处理异步配置。

一种方法是使用工厂函数：

__CODE_BLOCK_54__

我们的工厂行为像任何其他 __LINK_537__（例如，它可以 __INLINE_CODE_257__ 并可以通过 __INLINE_CODE_258__ 注入依赖项）。

__CODE_BLOCK_55__

另外，你可以使用 __INLINE_CODE_259__ 语法：

__CODE_BLOCK_56__

构造上述将在 __INLINE_CODE_260__ 内部实例化 __INLINE_CODE_261__，并使用它来提供选项对象，通过调用 __INLINE_CODE_262__。请注意，这意味着 __INLINE_CODE_263__ 需要实现 __INLINE_CODE_264__ 接口，如下所示：

__CODE_BLOCK_57__

要防止在 __INLINE_CODE_265__ 内部创建 __INLINE_CODE_266__，并使用来自不同模块的提供程序，可以使用 __INLINE_CODE_267__ 语法。

__CODE_BLOCK_58__

这两种构造方法都与 __INLINE_CODE_268__ 类似，但有一点不同 - __INLINE_CODE_269__ 将在导入模块中查找现有的 __INLINE_CODE_270__ 而不是实例化一个新的。

类似地，如果你想异步地传递队列选项，可以使用 __INLINE_CODE_271__ 方法，只要记住在工厂函数外指定 __INLINE_CODE_272__ 属性。

__CODE_BLOCK_59__

#### 示例

有一个可运行的示例 __LINK_538__。