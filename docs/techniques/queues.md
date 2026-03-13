<!-- 此文件从 content/techniques/queues.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T05:09:15.460Z -->
<!-- 源文件: content/techniques/queues.md -->

### 队列

队列是一种强大的设计模式，可以帮助您解决常见的应用程序扩展和性能挑战。例如，您可以使用队列来平滑处理高峰峰值。如果用户可以在任意时间启动资源密集型任务，可以将这些任务添加到队列中，而不是同步执行。然后，您可以使用 worker 进程从队列中pull 任务，以控制方式执行。您可以轻松地添加新的队列消费者，以扩展后端任务处理能力随着应用程序的扩展。

- 分割 monolithic 任务，以免阻塞 Node.js 事件循环。例如，如果用户请求需要 CPU 密集型工作，如音频转码，可以将该任务委派给其他进程，从而释放用户界面进程，以保持响应。
- 提供可靠的跨服务通信渠道。例如，您可以在一个进程或服务中队列任务（作业），并在另一个进程或服务中消费它们。您可以在作业生命周期中的状态变化（完成、错误等）中收到通知，从任何进程或服务中监听。

Nest 提供了 __INLINE_CODE_60__ 包，以集成 BullMQ，并提供了 __INLINE_CODE_61__ 包以集成 Bull。两个包都是它们相应库的抽象/包装器，开发者团队相同。Bull 目前处于维护模式，团队集中于修复bug，而 BullMQ 是活动开发的，具有现代 TypeScript 实现和不同的功能。如果 Bull 满足您的要求，它仍然是一个可靠的选择。Nest 包使得在 Nest 应用程序中轻松地集成 BullMQ 或 Bull 队列。

BullMQ 和 Bull 都使用 __LINK_501__ persists job 数据，因此您需要在系统中安装 Redis。因为它们是 Redis 支持的，您的队列架构可以是完全分布式和平台独立的。例如，您可以在 Nest 中运行一些队列 __HTML_TAG_273__生产者__HTML_TAG_274__和__HTML_TAG_275__消费者__HTML_TAG_276__和__HTML_TAG_277__监听器__HTML_TAG_278__，并在其他 Node.js 平台上运行其他生产者、消费者和监听器。

本章涵盖了 __INLINE_CODE_62__ 和 __INLINE_CODE_63__ 包，我们还建议阅读 __LINK_502__ 和 __LINK_503__ 文档，以了解更多背景信息和实现细节。

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

__INLINE_CODE_66__ 方法用于注册 __INLINE_CODE_67__ 包配置对象，该对象将被所有在应用程序中注册的队列使用（除非另行指定）。以下是一些配置对象的属性：

- __INLINE_CODE_68__ - Redis 连接选项。见 __LINK_504__ 进行更多信息。可选。
- __INLINE_CODE_69__ - 所有队列键的前缀。可选。
- __INLINE_CODE_70__ - 新作业的默认设置。见 __LINK_505__ 进行更多信息。可选。
- __INLINE_CODE_71__ - 高级队列配置设置。通常不需要更改。见 __LINK_506__ 进行更多信息。可选。
- __INLINE_CODE_72__ - 模块初始化额外选项。见 __LINK_507__

所有选项都是可选的，可以提供详细的队列行为控制。这些选项将直接传递给 BullMQ __INLINE_CODE_73__ 构造函数。了解更多关于这些选项和其他选项 __LINK_508__。

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

> info **提示** 使用多个逗号分隔的配置对象来创建多个队列。

__INLINE_CODE_76__ 方法用于实例化和/或注册队列。队列在模块和进程之间共享，可以连接到同一个 underlying Redis 数据库，以相同的凭证。每个队列都是唯一的，它的名称用作 both 注入令牌（将队列注入控制器/提供商）和装饰器中的参数，以关联消费者类和监听器。

您也可以覆盖特定队列的预配置选项，以下所示：

```typescript
bootstrap().catch((err) => {
  fs.writeFileSync('graph.json', PartialGraphHost.toString() ?? '');
  process.exit(1);
});

```

BullMQ 还支持作业父-子关系。该功能使得创建树形结构，其中作业是节点，可以创建任意深度的树。了解更多关于它们 __LINK_509__。

要添加流，可以执行以下操作：

```typescript
const app = await NestFactory.create(AppModule, {
  snapshot: true,
  abortOnError: false, // <--- THIS
});

```

Note: I've kept the code and format unchanged, and only translated the content. I've also removed the @@switch blocks and content after them, and converted @@filename(xxx) to rspress syntax.Here is the translation of the English technical documentation to Chinese:

由于作业在 Redis 中被持久化，每当特定的命名队列实例化（例如，当应用程序启动/重启时），它将尝试处理可能存在的以前未完成的作业。

每个队列都可以具有一个或多个生产者、消费者和监听器。消费者从队列中检索作业，按照 FIFO（默认）、LIFO 或优先级顺序。控制队列处理顺序的讨论请见 __HTML_TAG_279__这里__HTML_TAG_280__。

__HTML_TAG_281____HTML_TAG_282__

#### 命名配置

如果您的队列连接到多个不同 Redis 实例，您可以使用一种称为 **named configurations** 的技术。这一特性允许您注册多个配置，以便在队列选项中引用它们。

例如，假设您拥有一个额外的 Redis 实例（除默认实例外），用于注册在应用程序中的一些队列，可以将其配置注册如下：

```typescript
await app.listen(process.env.PORT ?? 3000); // OR await app.init()
fs.writeFileSync('./graph.json', app.get(SerializedGraph).toString());

```

在上面的示例中，__INLINE_CODE_77__只是一个配置键（可以是任意的字符串）。

现在，您可以将该配置指向队列选项对象：

__CODE_BLOCK_6__

#### 生产者

作业生产者将作业添加到队列中。生产者通常是 Nest __LINK_510__应用程序服务。要将作业添加到队列，首先将队列注入到服务中，如下所示：

__CODE_BLOCK_7__

> info **提示** __INLINE_CODE_79__ 装饰器通过其名称标识队列，例如在 __INLINE_CODE_80__ 方法调用中（例如 __INLINE_CODE_81__）。

现在，添加一个作业，通过调用队列的 __INLINE_CODE_82__ 方法，并传入自定义的作业对象。作业是可序列化的 JavaScript 对象（因为它们是存储在 Redis 数据库中的）。作业的形状是任意的；使用它来表示作业的语义。您还需要为作业指定一个名称。这允许您创建专门的 __HTML_TAG_283__消费者__HTML_TAG_284__，只处理具有给定名称的作业。

__CODE_BLOCK_8__

#### 作业选项

作业可以具有附加的选项。将选项对象传递给 __INLINE_CODE_83__ 方法的 __INLINE_CODE_84__ 参数。作业选项的某些属性是：

- __INLINE_CODE_85__: __INLINE_CODE_86__ - 可选的优先级值。范围从 1（最高优先级）到 MAX_INT（最低优先级）。请注意，使用优先级可能会对性能产生轻微影响，因此请小心。
- __INLINE_CODE_87__: __INLINE_CODE_88__ - 等待处理作业的时间（毫秒）。请注意，为确保准确的延迟，服务器和客户端应具有同步的时钟。
- __INLINE_CODE_89__: __INLINE_CODE_90__ - 尝试完成作业的总次数。
- __INLINE_CODE_91__: __INLINE_CODE_92__ - 根据 cron 规则重复作业。见 __LINK_511__。
- __INLINE_CODE_93__: __INLINE_CODE_94__ - 自动重试失败作业的后退设置。见 __LINK_512__。
- __INLINE_CODE_95__: __INLINE_CODE_96__ - 如果 true，作业将被添加到队列的右端，而不是默认的左端（false）。
- __INLINE_CODE_97__: __INLINE_CODE_98__ | __INLINE_CODE_99__ - Override 作业 ID - 默认情况下，作业 ID 是一个唯一的整数，但您可以使用该设置来Override它。如果您使用该选项，需要确保作业 ID 是唯一的。如果您尝试添加具有已存在 ID 的作业，它将不会被添加。
- __INLINE_CODE_100__: __INLINE_CODE_101__ - 如果 true，作业将在成功完成时被删除。数字指定要保留的作业数量。默认行为是保留作业在完成集。
- __INLINE_CODE_102__: __INLINE_CODE_103__ - 如果 true，作业将在所有尝试失败后被删除。数字指定要保留的作业数量。默认行为是保留作业在失败集。
- __INLINE_CODE_104__: __INLINE_CODE_105__ - 限制记录在 stacktrace 中的栈追踪行数。

以下是一些使用作业选项的自定义示例。

要延迟作业的开始，使用 __INLINE_CODE_106__ 配置属性。

__CODE_BLOCK_9__

要将作业添加到队列的右端（以 LIFO 顺序处理作业），将 __INLINE_CODE_107__ 属性设置为 __INLINE_CODE_108__。

__CODE_BLOCK_10__

要优先处理作业，使用 __INLINE_CODE_109__ 属性。

__CODE_BLOCK_11__

对于完整的选项列表，请查看 API 文档 __LINK_513__ 和 __LINK_514__。

#### 消费者

消费者是定义处理队列作业、监听队列事件或 both 的Here is the translation of the English technical documentation to Chinese:

**Decorator的字符串参数（例如__INLINE_CODE_113__）是要与类方法关联的队列名称。**

__CODE_BLOCK_13__

worker方法在 idle 状态下被调用，并且队列中有任务要处理。这個处理方法将收到一个__INLINE_CODE_114__对象作为唯一参数。处理方法返回的值将被存储在任务对象中，并可以在完成事件监听器中访问。

__INLINE_CODE_115__对象具有多个方法，可以与它们的状态进行交互。例如，上面的代码使用__INLINE_CODE_116__方法来更新任务的进度。请见__LINK_515__以获取__INLINE_CODE_117__对象完整API参考。

在更旧版本的Bull中，你可以使用__INLINE_CODE_119__作为参数来指定一个方法将处理特定的任务类型（具有特定的__INLINE_CODE_118__）。如下所示：

> warning **警告** 这在BullMQ中不起作用，继续阅读。

__CODE_BLOCK_14__

由于BullMQ中出现了混淆，因此不能在BullMQ中使用该行为。相反，你需要使用switch cases来调用不同的服务或逻辑以便处理每个任务名称：

__CODE_BLOCK_15__

这在BullMQ文档的__LINK_516__部分中有所涵盖。

#### 请求范围内的消费者

当一个消费者被标记为请求范围内的（了解更多关于依赖注入作用域的__LINK_517__），那么对每个任务都会创建一个新的实例。实例将在任务完成后被垃圾回收。

__CODE_BLOCK_16__

由于请求范围内的消费者类实例是在动态创建的且与单个任务相关的，因此可以使用标准方法将__INLINE_CODE_121__注入到构造函数中。

__CODE_BLOCK_17__

> info **提示** __INLINE_CODE_122__令牌来自__INLINE_CODE_123__包。

#### 事件监听器

BullMQ在队列和/或任务状态变化时生成了一组有用的事件。这些事件可以在Worker级别使用__INLINE_CODE_124__装饰器订阅，也可以在Queue级别使用专门的监听器类和__INLINE_CODE_125__装饰器。

Worker事件必须在__HTML_TAG_285__consumer__HTML_TAG_286__类中声明（即在使用__INLINE_CODE_126__装饰器装饰的类中）。要监听一个事件，使用__INLINE_CODE_127__装饰器指定要处理的事件。例如，要监听__INLINE_CODE_128__队列中任务进入活动状态的事件，使用以下构造：

__CODE_BLOCK_18__

你可以在WorkerListener的__LINK_518__中查看完整的事件列表和它们的参数。

QueueEvent监听器必须使用__INLINE_CODE_129__装饰器继承__INLINE_CODE_130__类，该类由__INLINE_CODE_131__提供。要监听一个事件，使用__INLINE_CODE_132__装饰器指定要处理的事件。例如，要监听__INLINE_CODE_133__队列中任务进入活动状态的事件，使用以下构造：

__CODE_BLOCK_19__

> info **提示** QueueEvent监听器必须注册为__INLINE_CODE_134__以便__INLINE_CODE_135__包可以发现它们。

你可以在QueueEventsListener的__LINK_519__中查看完整的事件列表和它们的参数。

#### 队列管理

队列具有API，可以对队列进行管理操作，如暂停和恢复、获取不同状态下的任务数等。可以在__LINK_520__中找到完整的队列API。可以直接在__INLINE_CODE_136__对象上调用这些方法，如下所示，使用pause/resume示例。

使用__INLINE_CODE_137__方法暂停队列。暂停的队列将不会处理新的任务，直到恢复当前任务将继续执行直到完成。

__CODE_BLOCK_20__

要恢复暂停的队列，使用__INLINE_CODE_138__方法，如下所示：

__CODE_BLOCK_21__

#### 分离进程

任务处理器也可以在分离的进程中运行（__LINK_521__）。这有多种优势：

- 进程是沙箱的， 如果进程崩溃，它不会影响worker。
- 可以运行阻塞代码而不会影响队列（任务将不会阻塞）。
- 对多核CPU的利用率更好。
-  fewer connections to redis。

__CODE_BLOCK_22__

> warning **警告** 请注意，因为您的函数是在分离的进程中执行的，因此依赖注入（和IoC容器）不可用。因此，processor函数需要包含或创建所有外部依赖项。

#### 异步配置以下是翻译后的中文文档：

使用 __INLINE_CODE_139__ 方法异步传递选项，而不是静态地传递。使用 __INLINE_CODE_140__ 方法，可以选择多种方式来处理异步配置。

一种方法是使用工厂函数：

__CODE_BLOCK_23__

我们的工厂函数像任何其他 __LINK_522__ 一样，可以被 __INLINE_CODE_142__ 并且可以注入依赖项通过 __INLINE_CODE_143__。

__CODE_BLOCK_24__

Alternatively, you can use the __INLINE_CODE_144__ syntax:

__CODE_BLOCK_25__

上述构造将在 __INLINE_CODE_146__ 中实例化 __INLINE_CODE_145__ 并使用它来提供一个选项对象，通过调用 __INLINE_CODE_147__。请注意，这意味着 __INLINE_CODE_148__ 需要实现 __INLINE_CODE_149__ 接口，如下所示：

__CODE_BLOCK_26__

要防止 __INLINE_CODE_150__ 在 __INLINE_CODE_151__ 中创建，并使用来自不同模块的提供者，可以使用 __INLINE_CODE_152__ 语法。

__CODE_BLOCK_27__

这个构造与 __INLINE_CODE_153__ 相同，但 __INLINE_CODE_154__ 将查找导入的模块以重用现有的 __INLINE_CODE_155__ 而不是实例化新的一个。

类似地，如果您想异步传递队列选项，可以使用 __INLINE_CODE_156__ 方法，记住在工厂函数外指定 __INLINE_CODE_157__ 属性。

__CODE_BLOCK_28__

#### 手动注册

默认情况下，__INLINE_CODE_158__ 将自动注册 BullMQ 组件（队列、处理器和事件监听器服务）在 __INLINE_CODE_159__ 生命周期函数中。然而，在某些情况下，这种行为可能不合适。要防止自动注册，启用 __INLINE_CODE_160__ 在 __INLINE_CODE_161__ 中，如下所示：

__CODE_BLOCK_29__

要手动注册这些组件，注入 __INLINE_CODE_162__ 并调用 __INLINE_CODE_163__ 函数，尽量在 __INLINE_CODE_164__ 或 __INLINE_CODE_165__ 中。

__CODE_BLOCK_30__

除非您调用 __INLINE_CODE_166__ 函数，否则 BullMQ 组件将无法工作，这意味着没有作业将被处理。

#### Bull 安装

> warning **注意** 如果您决定使用 BullMQ，跳过本节和以下章节。

要开始使用 Bull，我们首先安装所需的依赖项。

__CODE_BLOCK_31__

安装过程完成后，我们可以将 __INLINE_CODE_167__ 导入到根 __INLINE_CODE_168__ 中。

__CODE_BLOCK_32__

__INLINE_CODE_169__ 方法用于注册一个 __INLINE_CODE_170__ 包含配置对象，该对象将被所有队列注册在应用程序中（除非指定其他）使用。配置对象包含以下属性：

- __INLINE_CODE_171__ - 控制队列作业处理速率的选项。见 __LINK_523__ 了解更多信息。可选。
- __INLINE_CODE_172__ - 配置 Redis 连接选项。见 __LINK_524__ 了解更多信息。可选。
- __INLINE_CODE_173__ - 所有队列键的前缀。可选。
- __INLINE_CODE_174__ - 对新作业的默认设置。见 __LINK_525__ 了解更多信息。可选。**注意：这些设置在使用 FlowProducer 定制作业时不生效。见 __LINK_526__ 了解详细信息。**
- __INLINE_CODE_175__ - 高级队列配置设置。这些通常不需要更改。见 __LINK_527__ 了解更多信息。可选。

所有选项都是可选的，提供了详细的队列行为控制。这些选项将直接传递给 Bull __INLINE_CODE_176__ 构造函数。了解更多关于这些选项的信息 __LINK_528__。

要注册一个队列，导入 __INLINE_CODE_177__ 动态模块，如下所示：

__CODE_BLOCK_33__

> info **提示** 创建多个队列通过将多个逗号分隔的配置对象传递给 __INLINE_CODE_178__ 方法。

__INLINE_CODE_179__ 方法用于实例化和/或注册队列。队列在模块和进程之间共享，连接到同一个 Redis 数据库相同的 Credentials。每个队列都由其名称唯一标识。队列名称用作 both 注入令牌（将队列注入到控制器/提供者中）和关联consumer classes 和监听器的参数。

您也可以覆盖特定队列的预配置选项，如下所示：

__CODE_BLOCK_34__

由于作业被 persisted 到 Redis 中，每当特定命名队列被实例化（例如，当应用程序启动/重启时），它将尝试处理可能存在的前一 unfinished 会话中的作业。

每个队列都可以具有一个或多个生产者、消费者和监听器。消费者从队列中获取作业，以 FIFO（默认）、LIFO 或根据优先级的顺序。控制队列处理顺序的信息见 __HTML_TAG_287__这里__HTML_TAG_288__。Here is the translated text:

#### 命名配置

如果您的队列连接到多个 Redis 实例，您可以使用一种技术称为 **命名配置**。这项功能允许您注册多个配置项，并将其在队列选项中引用。

例如，假设您有一个额外的 Redis 实例（除了默认实例），用于注册在应用程序中的少数队列，您可以将其配置项注册如下所示：

__CODE_BLOCK_35__

在上面的示例中，__INLINE_CODE_180__ 是一个配置项键（可以是任意字符串）。

现在，您可以将该配置项引用到 __INLINE_CODE_181__ 选项对象中：

__CODE_BLOCK_36__

#### 生产者

作业生产者将作业添加到队列中。生产者通常是 Nest 应用程序服务（__LINK_529__）。要将作业添加到队列中，首先将队列注入到服务中，如下所示：

__CODE_BLOCK_37__

> info **提示** __INLINE_CODE_182__ 装饰器通过指定的 __INLINE_CODE_183__ 方法调用来标识队列名称（例如 __INLINE_CODE_184__）。

现在，您可以通过调用队列的 __INLINE_CODE_185__ 方法，传递一个自定义的作业对象来添加作业。作业对象是一个可序列化的 JavaScript 对象（因为它们在 Redis 数据库中被存储），您可以将其用作作业 semantics 的表示形式。

__CODE_BLOCK_38__

#### 命名作业

作业可能具有唯一的名称。这允许您创建特殊的 __HTML_TAG_291__consumer__HTML_TAG_292__，只处理具有给定名称的作业。

__CODE_BLOCK_39__

> Warning **警告** 使用命名作业时，您必须创建每个唯一名称的处理器，否则队列将抱怨缺少该作业的处理器。请参阅 __HTML_TAG_293__here__HTML_TAG_294__以获取更多关于消费命名作业的信息。

#### 作业选项

作业可以具有附加选项。将选项对象传递到 __INLINE_CODE_186__ 参数后，在 __INLINE_CODE_187__ 方法中。作业选项属性包括：

- __INLINE_CODE_188__: __INLINE_CODE_189__ - 可选的优先级值。范围从 1（最高优先级）到 MAX_INT（最低优先级）。请注意使用优先级可能会对性能产生一些影响，因此请谨慎使用。
- __INLINE_CODE_190__: __INLINE_CODE_191__ - 等待处理作业的时间（毫秒）。请注意，为了确保准确的延迟，服务器和客户端都应同步时钟。
- __INLINE_CODE_192__: __INLINE_CODE_193__ - 尝试处理作业的总次数。
- __INLINE_CODE_194__: __INLINE_CODE_195__ - 重新处理作业按照 cron 规则。请参阅 __LINK_530__。
- __INLINE_CODE_196__: __INLINE_CODE_197__ - 自动重试失败作业的超时设置。请参阅 __LINK_531__。
- __INLINE_CODE_198__: __INLINE_CODE_199__ - 如果 true，添加作业到队列的右端，而不是默认的左端（false）。
- __INLINE_CODE_200__: __INLINE_CODE_201__ - 作业超时的毫秒数。
- __INLINE_CODE_202__: __INLINE_CODE_203__ | __INLINE_CODE_204__ - Override 作业 ID - 默认情况下，作业 ID 是一个唯一的整数，但是您可以使用这个设置来覆盖它。如果您使用这个选项，需要确保作业 ID 是唯一的。如果您尝试添加具有已存在 ID 的作业，它将不会被添加。
- __INLINE_CODE_205__: __INLINE_CODE_206__ - 如果 true，删除成功完成的作业。数字指定要保留的作业数量。默认行为是保留作业。
- __INLINE_CODE_207__: __INLINE_CODE_208__ - 如果 true，删除失败的作业。数字指定要保留的作业数量。默认行为是保留作业。
- __INLINE_CODE_209__: __INLINE_CODE_210__ - 限制记录在 stacktrace 中的栈跟踪线的数量。

以下是一些使用作业选项的自定义示例。

要延迟作业的开始，请使用 __INLINE_CODE_211__ 配置属性。

__CODE_BLOCK_40__

要将作业添加到队列的右端（处理作业像 LIFO），请将 __INLINE_CODE_212__ 配置项的值设置为 __INLINE_CODE_213__。

__CODE_BLOCK_41__

要优先处理作业，请使用 __INLINE_CODE_214__ 属性。

__CODE_BLOCK_42__

#### 消费者

消费者是一个定义方法的 **class**，这些方法可以处理队列中的作业、监听队列中的事件或同时处理这两种情况。使用 __INLINE_CODE_215__ 装饰器声明一个消费者类，如下所示：

__CODE_BLOCK_43__

> info **提示** 消费者必须注册为 __INLINE_CODE_216__，以便 __INLINE_CODE_Here is the translation of the provided English technical documentation to Chinese:

在消费者类中，使用 __INLINE_CODE_219__ 装饰器来声明作业处理器。

__CODE_BLOCK_44__

装饰的方法（例如 __INLINE_CODE_220__）在 worker 空闲且队列中有作业时被调用。这个处理器方法只接受一个 __INLINE_CODE_221__ 对象作为参数。处理器方法返回的值将被存储在作业对象中，可以在完成事件的监听器中访问。

__INLINE_CODE_222__ 对象具有多个方法，允许您与其状态进行交互。例如，上面的代码使用 __INLINE_CODE_223__ 方法更新作业的进度。请查看 __LINK_532__ 以获取完整的 __INLINE_CODE_224__ 对象 API 参考。

您可以使用 __INLINE_CODE_227__ 装饰器指定某个作业处理器方法将只处理特定类型的作业（拥有特定 __INLINE_CODE_225__ 的作业）如以下所示。您可以在同一个消费者类中拥有多个 __INLINE_CODE_228__ 处理器，每个处理器对应一个作业类型（__INLINE_CODE_229__）。在使用命名作业时，请确保每个名称都有相应的处理器。

__CODE_BLOCK_45__

> warning **警告** 定义同一个队列的多个消费者时， __INLINE_CODE_230__ 选项在 __INLINE_CODE_231__ 中不会生效。最小 __INLINE_CODE_232__ 将与定义的消费者数量相匹配。这也适用于 __INLINE_CODE_233__ 处理器使用不同的 __INLINE_CODE_234__ 处理命名作业。

#### 请求作用域消费者

当消费者被标记为请求作用域（了解更多关于注入作用域 __LINK_533__）时，一个新的类实例将被创建，专门用于每个作业。该实例将在作业完成后被垃圾回收。

__CODE_BLOCK_46__

由于请求作用域消费者类实例动态创建并且作用于单个作业，您可以使用标准方法在构造函数中注入一个 __INLINE_CODE_235__。

__CODE_BLOCK_47__

> info **提示** __INLINE_CODE_236__ token 来自 __INLINE_CODE_237__ 包。

#### 事件监听器

Bull 在队列和/或作业状态变化时生成了一组有用的事件。Nest 提供了一组装饰器，允许订阅标准事件。这些装饰器来自 __INLINE_CODE_238__ 包。

事件监听器必须在 __HTML_TAG_295__consumer__HTML_TAG_296__ 类中声明（即在使用 __INLINE_CODE_239__ 装饰器装饰的类中）。要监听事件，请使用下面表格中的一种装饰器来声明事件处理器。例如，要监听 __INLINE_CODE_240__ 队列中作业进入活动状态的事件，请使用以下结构：

__CODE_BLOCK_48__

由于 Bull 在分布式（多节点）环境中运作，它定义了事件局部性概念。这概念认可事件可能是产生于单个进程中的，或者来自不同进程的共享队列。一个 **本地** 事件是指在队列中触发的事件，产生于本地进程。换言之，当您的事件生产者和消费者都在单个进程中时，所有队列上的事件都是本地事件。

当队列跨越多个进程时，我们遇到 **全局** 事件的可能性。为了让一个进程中的监听器接收另一个进程触发的事件通知，它必须注册全局事件。

事件处理器在对应事件被触发时被调用。处理器被调用时提供了相关信息的签名，如下表所示。我们将讨论本地事件处理器签名与全局事件处理器签名的一些关键差异。Here is the translation of the provided English technical documentation to Chinese:

`__HTML_TAG_297__`
`__HTML_TAG_298__`
  `__HTML_TAG_299__本地事件监听器__HTML_TAG_300__`
  `__HTML_TAG_301__全局事件监听器__HTML_TAG_302__`
  `__HTML_TAG_303__处理方法签名 / 发生时__HTML_TAG_304__`
`__HTML_TAG_305__`
`__HTML_TAG_306__`
    `__HTML_TAG_307____HTML_TAG_308__@OnQueueError()__HTML_TAG_309____HTML_TAG_310____HTML_TAG_311____HTML_TAG_312__@OnGlobalQueueError()__HTML_TAG_313____HTML_TAG_314____HTML_TAG_315____HTML_TAG_316__handler(error: Error)__HTML_TAG_317__ - 发生错误。__HTML_TAG_318__error__HTML_TAG_319__包含触发错误的信息。__HTML_TAG_320__`
`__HTML_TAG_321__`
`__HTML_TAG_322__`
    `__HTML_TAG_323____HTML_TAG_324__@OnQueueWaiting()__HTML_TAG_325____HTML_TAG_326____HTML_TAG_327____HTML_TAG_328__@OnGlobalQueueWaiting()__HTML_TAG_329____HTML_TAG_330____HTML_TAG_331____HTML_TAG_332__handler(jobId: number | string)__HTML_TAG_333__ - 作业正在等待处理，直到工作者空闲。__HTML_TAG_334__jobId__HTML_TAG_335__包含该作业的 ID。__HTML_TAG_336__`
`__HTML_TAG_337__`
`__HTML_TAG_338__`
    `__HTML_TAG_339____HTML_TAG_340__@OnQueueActive()__HTML_TAG_341____HTML_TAG_342____HTML_TAG_343____HTML_TAG_344__@OnGlobalQueueActive()__HTML_TAG_345____HTML_TAG_346____HTML_TAG_347____HTML_TAG_348__handler(job: Job)__HTML_TAG_349__ - 作业__HTML_TAG_350__job__HTML_TAG_351__已经开始。__HTML_TAG_352__`
`__HTML_TAG_353__`
`__HTML_TAG_354__`
    `__HTML_TAG_355____HTML_TAG_356__@OnQueueStalled()__HTML_TAG_357____HTML_TAG_358____HTML_TAG_359____HTML_TAG_360__@OnGlobalQueueStalled()__HTML_TAG_361____HTML_TAG_362____HTML_TAG_363____HTML_TAG_364__handler(job: Job)__HTML_TAG_365__ - 作业__HTML_TAG_366__job__HTML_TAG_367__已经标记为卡住。这对于调试工作者崩溃或暂停事件循环非常有用。__HTML_TAG_368__`
`__HTML_TAG_369__`
`__HTML_TAG_370__`
    `__HTML_TAG_371____HTML_TAG_372__@OnQueueProgress()__HTML_TAG_373____HTML_TAG_374____HTML_TAG_375____HTML_TAG_376__@OnGlobalQueueProgress()__HTML_TAG_377____HTML_TAG_378____HTML_TAG_379____HTML_TAG_380__handler(job: Job, progress: number)__HTML_TAG_381__ - 作业__HTML_TAG_382__job__HTML_TAG_383__'s 进度已更新为__HTML_TAG_384__progress__HTML_TAG_385__。__HTML_TAG_386__`
`__HTML_TAG_387__`
`__HTML_TAG_388__`
    `__HTML_TAG_389____HTML__HTML_TAG_498__
  __HTML_TAG_499__
__HTML_TAG_500__.當你監聽全局事件時，方法簽名可能不同於本地對等。 Specifically,任何在本地版本中接收 __INLINE_CODE_241__ 物件的方法簽名，在全局版本中則接收一個 __INLINE_CODE_242__ (__INLINE_CODE_243__)。要獲得實際 __INLINE_CODE_244__ 物件的參考，在這種情況下使用 __INLINE_CODE_245__ 方法。這個呼叫應該是同步執行的，因此處理器應該聲明 __INLINE_CODE_246__。例如：

__CODE_BLOCK_49__

> info **Hint**要訪問 __INLINE_CODE_247__ 物件（以進行 __INLINE_CODE_248__ 呼叫），你必須將其注入。還有，Queue 在你注入它的模組中必須被註冊。

除了特定的事件监听装饰器，你還可以使用通用的 __INLINE_CODE_249__ 装饰器，與 __INLINE_CODE_250__ 或 __INLINE_CODE_251__ 枚举组合。了解更多關於事件的信息 __LINK_534__。

#### 排队管理

Queue 的 API 允許你執行管理操作，例如暫停和恢復、取得不同狀態下的作業數量等。可以在 __INLINE_CODE_252__ 物件上直接調用這些方法，例如暫停/恢復示例。

暫停一個排隊使用 __INLINE_CODE_253__ 方法呼叫。暫停的排隊將不會處理新的作業，直到恢復，但當前正在處理的作業將繼續執行，直到他們被最終化。

__CODE_BLOCK_50__

恢復暫停的排隊使用 __INLINE_CODE_254__ 方法，以下是一個示例：

__CODE_BLOCK_51__

#### 分離進程

作業處理器也可以在分離的進程中執行（__LINK_536__）。這有幾個優點：

* 進程是 sandboxed 的，作業崩潰不會影響worker。
* 你可以執行阻塞代碼，作業不會被阻塞。
* 多核心 CPU 的使用率更高。
* 對 Redis 的連接數量減少。

__CODE_BLOCK_52__

請注意，因為你的函數在分離的進程中執行，Dependency Injection (和 IoC 容器) 不可用。那麼你的處理器函數需要包含（或創建）所有外部依賴關聯的實例。

__CODE_BLOCK_53__

#### 非同步配置

你可能想要通過非同步方式傳遞 __INLINE_CODE_255__ 选項，而不是靜態方式。在這種情況下，使用 __INLINE_CODE_256__ 方法，它提供了多種處理非同步配置的方法。

一種方法是使用工廠函數：

__CODE_BLOCK_54__

我們的工廠就像任何其他 __LINK_537__ 一樣（例如，它可以被 __INLINE_CODE_257__），並且可以注入依賴關聯通過 __INLINE_CODE_258__。

__CODE_BLOCK_55__

或者，你可以使用 __INLINE_CODE_259__ 語法：

__CODE_BLOCK_56__

該構造將在 __INLINE_CODE_261__ 中 instantiate __INLINE_CODE_260__，並使用它來提供選項對象，通過調用 __INLINE_CODE_262__。請注意，這意味著 __INLINE_CODE_263__ 需要實現 __INLINE_CODE_264__介面，以下是一個示例：

__CODE_BLOCK_57__

為了防止在 __INLINE_CODE_266__ 中創建 __INLINE_CODE_265__，并使用來自不同模組的提供者，你可以使用 __INLINE_CODE_267__ 語法。

__CODE_BLOCK_58__

該構造與 __INLINE_CODE_268__ 相同，只有一個區別 - __INLINE_CODE_269__ 將在已經存在的 __INLINE_CODE_270__ 中尋找，而不是創建新的。

同樣，如果你想要通過非同步方式傳遞排隊選項，使用 __INLINE_CODE_271__ 方法，只要注意在工廠函數外指定 __INLINE_CODE_272__ 屬性。

__CODE_BLOCK_59__

#### 示例

有個可運行的示例 __LINK_538__。