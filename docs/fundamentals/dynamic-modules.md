<!-- 此文件从 content/fundamentals/dynamic-modules.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-21T16:24:16.642Z -->
<!-- 源文件: content/fundamentals/dynamic-modules.md -->

### 动态模块

__LINK_216__ 中介绍了 Nest 模块的基本知识，包括 __LINK_217__ 的简要介绍。 本章将扩展动态模块的主题。 完成本章后，您将了解它们是什么和何时、何地使用它们。

#### 简介

在 **Overview** 部分的大多数应用程序代码示例中，我们使用的是常规或静态模块。 模块定义了组件，如 __LINK_218__ 和 __LINK_219__，这些组件是应用程序的可组合部分。 模块提供执行上下文或作用域，以便这些组件可以在其中工作。 例如，模块中定义的提供者对模块中的其他成员可见，不需要它们。 当需要在模块外部访问提供者时，它们首先在其宿主模块中被导出，然后在其消费模块中被导入。

让我们从熟悉的示例开始。

首先，我们将定义一个 `WsAdapter`，用于提供和导出一个 __INLINE_CODE_29__。 __INLINE_CODE_30__ 是 __INLINE_CODE_31__ 的宿主模块。

```bash
$ npm i --save redis socket.io @socket.io/redis-adapter

```

接下来，我们将定义一个 __INLINE_CODE_32__，该模块导入 __INLINE_CODE_33__，使 __INLINE_CODE_34__ 的导出提供者在 __INLINE_CODE_35__ 中可见：

```typescript
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>;

  async connectToRedis(): Promise<void> {
    const pubClient = createClient({ url: `redis://localhost:6379` });
    const subClient = pubClient.duplicate();

    await Promise.all([pubClient.connect(), subClient.connect()]);

    this.adapterConstructor = createAdapter(pubClient, subClient);
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    server.adapter(this.adapterConstructor);
    return server;
  }
}

```

这些构造允许我们在 __INLINE_CODE_37__ 中注入 __INLINE_CODE_36__，例如，在 __INLINE_CODE_38__ 中：

```typescript
const app = await NestFactory.create(AppModule);
const redisIoAdapter = new RedisIoAdapter(app);
await redisIoAdapter.connectToRedis();

app.useWebSocketAdapter(redisIoAdapter);

```

我们将称之为 **静态** 模块绑定。 在宿主和消费模块中已经声明了 Nest 需要的所有信息以便将模块连接起来。 让我们解释一下此过程。 Nest 将 __INLINE_CODE_39__ 使 __INLINE_CODE_40__ 可见：

1. 实例化 __INLINE_CODE_41__，包括对其他模块的转换性导入和对依赖项的转换性解决（见 __LINK_220__）。
2. 实例化 __INLINE_CODE_43__，并将 __INLINE_CODE_44__ 的导出提供者提供给 __INLINE_CODE_45__ 中的组件（就像它们在 __INLINE_CODE_46__ 中被声明一样）。
3. 在 __INLINE_CODE_48__ 中注入 __INLINE_CODE_47__ 的实例。

#### 动态模块用例

使用静态模块绑定，消费模块不能影响宿主模块的提供者的配置。 为什么这重要？ 考虑一个需要在不同用例中行为不同的通用模块的情况。这类似于许多系统中的“插件”概念，其中一个通用设施需要在消费者使用前进行配置。

使用 Nest 的一个好的示例是 **配置模块**。许多应用程序发现将配置细节外部化使用配置模块是有用的。这使得在不同的部署中动态更改应用程序设置变得容易：例如，开发数据库用于开发者， staging 数据库用于 staging 测试环境等。通过将配置参数委托给配置模块，应用程序源代码保持独立于配置参数。

挑战是，配置模块本身由于是通用（类似于“插件”），需要在其消费模块中被自定义。 这是 _动态模块_ 发挥作用的地方。 使用动态模块特性，我们可以使我们的配置模块 **动态**，以便在其导入时消费模块可以使用 API 来控制模块的自定义。

换言之，动态模块提供了一个 API，以便将一个模块导入另一个模块，并在导入时自定义模块的属性和行为，而不是使用静态绑定所见。

__HTML_TAG_214____HTML_TAG_215__

#### 配置模块示例

我们将使用来自 __LINK_221__ 的基本示例代码来进行本节。 本章结束时的完整示例代码可作为一个工作 __LINK_222__。

我们的要求是使 __INLINE_CODE_49__ 接受一个 __INLINE_CODE_50__ 对象以自定义它。 这个基本示例硬编码了 __INLINE_CODE_51__ 文件的位置，以在项目根目录下。 让我们假设我们想使这可配置，以便在不同的项目中选择不同的文件夹。例如，我们想将不同的 __INLINE_CODE_53__ 文件存储在项目根目录下的一个子文件夹 __INLINE_CODE_54__ 中（即 __INLINE_CODE_55__ 的同级文件夹）。我们想在不同的项目中选择不同的文件夹。Here is the translated documentation in Chinese:

**动态模块**

动态模块允许我们将参数传递给被导入的模块，以便改变其行为。让我们从最终目标开始，了解如何实现这一点，然后再回退。

首先，我们需要了解静态导入的示例，了解如何导入 __INLINE_CODE_57__。请注意 __INLINE_CODE_58__ 数组在 __INLINE_CODE_59__ 装饰器中的位置：

```bash
$ npm i --save @nestjs/platform-ws

```

接下来，让我们考虑动态导入模块，传递配置对象的情况。比较这两个示例的 __INLINE_CODE_60__ 数组：

```typescript
const app = await NestFactory.create(AppModule);
app.useWebSocketAdapter(new WsAdapter(app));

```

现在，让我们了解动态示例中发生了什么事情？

1. __INLINE_CODE_61__ 是一个正常的类，因此我们可以推断它必须有一个静态方法 __INLINE_CODE_62__。我们知道这是静态方法，因为我们在 __INLINE_CODE_63__ 类上调用它，而不是在该类的实例上。
2. __INLINE_CODE_66__ 方法由我们定义，因此我们可以接受任何输入参数。例如，我们将接受一个简单的 __INLINE_CODE_67__ 对象，这是典型情况。
3. 我们可以推断 __INLINE_CODE_68__ 方法必须返回一个 __INLINE_CODE_69__，因为它的返回值出现在熟悉的 __INLINE_CODE_70__ 列表中，这些列表中包含了模块的列表。

事实上，我们的 __INLINE_CODE_71__ 方法将返回一个 __INLINE_CODE_72__。动态模块实际上是一种在运行时创建的模块，它具有与静态模块相同的属性，除了一个额外的属性 __INLINE_CODE_73__。

让我们快速回顾一下静态模块的声明，注意模块选项在装饰器中的位置：

```typescript
const wsAdapter = new WsAdapter(app, {
  // To handle messages in the [event, data] format
  messageParser: (data) => {
    const [event, payload] = JSON.parse(data.toString());
    return { event, data: payload };
  },
});

```

动态模块必须返回一个具有相同接口的对象，除了一个额外的属性 __INLINE_CODE_74__。__INLINE_CODE_75__ 属性是模块的名称，应该与模块类的名称相同，如下所示。

> 提示 **注意** 对于动态模块，模块选项对象的所有属性都可选，除了 __INLINE_CODE_76__。

现在，我们可以看到 __INLINE_CODE_77__ 静态方法的作用是返回一个具有 __INLINE_CODE_78__ 接口的对象。我们调用它时，实际上是在将模块提供给 __INLINE_CODE_79__ 列表，类似于在静态情况下将模块类名提供给 __INLINE_CODE_80__ 装饰器中一样。换言之，动态模块 API 只是返回一个模块，但是我们不是在 __INLINE_CODE_81__ 装饰器中固定模块的属性，而是在程序中指定它们。

还有几个细节需要涵盖，以便完整地了解情况：

1. 我们现在可以说 __INLINE_CODE_81__ 装饰器的 __INLINE_CODE_82__ 属性不仅可以是模块类名（例如 __INLINE_CODE_83__），而且可以是返回动态模块的函数（例如 __INLINE_CODE_84__）。
2. 动态模块本身可以导入其他模块。我们不会在这个示例中这样做，但如果动态模块依赖于其他模块的提供者，你将使用可选的 __INLINE_CODE_85__ 属性来导入它们。同样，这正是使用 __INLINE_CODE_86__ 装饰器来声明静态模块的元数据一样。

现在，我们可以了解动态 __INLINE_CODE_87__ 声明的样子。让我们尝试一下。

```typescript
import * as WebSocket from 'ws';
import { WebSocketAdapter, INestApplicationContext } from '@nestjs/common';
import { MessageMappingProperties } from '@nestjs/websockets';
import { Observable, fromEvent, EMPTY } from 'rxjs';
import { mergeMap, filter } from 'rxjs/operators';

export class WsAdapter implements WebSocketAdapter {
  constructor(private app: INestApplicationContext) {}

  create(port: number, options: any = {}): any {
    return new WebSocket.Server({ port, ...options });
  }

  bindClientConnect(server, callback: Function) {
    server.on('connection', callback);
  }

  bindMessageHandlers(
    client: WebSocket,
    handlers: MessageMappingProperties[],
    process: (data: any) => Observable<any>,
  ) {
    fromEvent(client, 'message')
      .pipe(
        mergeMap(data => this.bindMessageHandler(data, handlers, process)),
        filter(result => result),
      )
      .subscribe(response => client.send(JSON.stringify(response)));
  }

  bindMessageHandler(
    buffer,
    handlers: MessageMappingProperties[],
    process: (data: any) => Observable<any>,
  ): Observable<any> {
    const message = JSON.parse(buffer.data);
    const messageHandler = handlers.find(
      handler => handler.message === message.event,
    );
    if (!messageHandler) {
      return EMPTY;
    }
    return process(messageHandler.callback(message.data));
  }

  close(server) {
    server.close();
  }
}

```

现在，应该清楚如何将所有部分结合起来。调用 __INLINE_CODE_88__ 返回一个 __INLINE_CODE_89__ 对象，它的属性实际上是与我们以前通过 __INLINE_CODE_90__ 装饰器提供的元数据相同的。

> 提示 **注意** 从 __INLINE_CODE_91__ 导入 __INLINE_CODE_92__。

我们的动态模块还不太有趣，因为我们还没有引入自适应它的能力。让我们解决这个问题。

#### 模块配置

修改 __INLINE_CODE_93__ 的行为的明显解决方案是将其作为 __INLINE_CODE_94__ 对象传递给静态 __INLINE_CODE_95__ 方法，我们上面已经猜测过了。让我们再次查看我们的消费模块的 __INLINE_CODE_96__ 属性：

```typescript
const app = await NestFactory.create(AppModule);
app.useWebSocketAdapter(new WsAdapter(app));

```Here is the translation of the English technical documentation to Chinese:

如何使用 __INLINE_CODE_97__ 对象在动态模块中？让我们考虑一下这个问题。我们知道,__INLINE_CODE_98__ 是一个提供和导出可注入服务的宿主 - __INLINE_CODE_101__ -供其他提供者使用。实际上,__INLINE_CODE_102__ 需要读取 __INLINE_CODE_103__ 对象以自定义其行为。假设我们知道如何将 __INLINE_CODE_104__ 从 __INLINE_CODE_105__ 方法传递到 __INLINE_CODE_106__,那么我们可以根据 __INLINE_CODE_107__ 对象的属性来自定义服务的行为。(**注意**：由于我们还没有确定如何将其传递，所以我们将硬编码 __INLINE_CODE_108__。我们将在下一分钟解决这个问题）。

__CODE_BLOCK_8__

现在,__INLINE_CODE_109__ 已经知道如何在 __INLINE_CODE_111__ 文件夹中找到 __INLINE_CODE_110__ 文件。

我们的最后一个任务是将 __INLINE_CODE_112__ 对象从 __INLINE_CODE_113__ 步骤注入到我们的 __INLINE_CODE_114__ 中。当然，我们将使用依赖注入来实现这点。这是一个关键点，请确保您理解它。我们的 __INLINE_CODE_115__ 提供 __INLINE_CODE_116__, __INLINE_CODE_117__ 依赖于 __INLINE_CODE_118__ 对象，这个对象只在运行时提供。因此，在运行时，我们需要首先将 __INLINE_CODE_119__ 对象绑定到 Nest IoC 容器，然后将其注入到我们的 __INLINE_CODE_120__ 中。请记住，从 **Custom providers** 章节中，我们可以使用依赖注入来处理简单的 __INLINE_CODE_121__ 对象。

让我们首先绑定 options 对象到 IoC 容器中。我们在静态 __INLINE_CODE_122__ 方法中执行这个操作。请记住，我们正在动态构建模块，并且模块的一个属性是其提供程序列表。因此，我们需要将 options 对象定义为提供程序。这将使其可注入到 __INLINE_CODE_123__ 中，我们将在下一步中利用这个特点。在以下代码中，注意 __INLINE_CODE_124__ 数组：

__CODE_BLOCK_9__

现在，我们可以完成这个过程，通过将 __INLINE_CODE_125__ 提供程序注入到 __INLINE_CODE_126__ 中。请记住，在定义提供程序时，我们需要使用 __INLINE_CODE_127__ 装饰器 __LINK_224__。

__CODE_BLOCK_10__

最后一个注意点：为了简单，我们使用字符串注入 token (__INLINE_CODE_128__)，但最佳实践是将其定义为常量（或 __INLINE_CODE_129__）在独立文件中，并导入该文件。例如：

__CODE_BLOCK_11__

#### 例子

本章中的完整代码示例可以在 __LINK_225__ 找到。

#### 社区指南

您可能已经看到一些 __INLINE_CODE_133__ 包的使用方法，如 __INLINE_CODE_130__, __INLINE_CODE_131__, 和 __INLINE_CODE_132__。您可能会 wondered what the difference is between these methods. 没有硬性规则，但 __INLINE_CODE_134__ 包们试图遵循以下指南：

当创建一个模块时：

- __INLINE_CODE_135__, 您期待配置一个动态模块与特定的配置，以供调用模块使用。例如，Nest 的 __INLINE_CODE_136__: __INLINE_CODE_137__。如果在另一个模块中使用 __INLINE_CODE_138__, 它将具有不同的配置。您可以在多个模块中使用。

- __INLINE_CODE_139__, 您期待配置一个动态模块一次，并在多个地方重用该配置（尽管可能是抽象化后的）。这是为什么您有一个 __INLINE_CODE_140__, 一个 __INLINE_CODE_141__, 等。

- __INLINE_CODE_142__, 您期待使用动态模块的 __INLINE_CODE_143__ 配置，但需要根据调用模块的需要修改一些配置（例如，该模块应该访问哪个存储库，或者 logger 应该使用哪个上下文）。

所有这些通常都有它们的 __INLINE_CODE_144__ 对应项，如 __INLINE_CODE_145__, __INLINE_CODE_146__, 和 __INLINE_CODE_147__,它们的意思相同，但使用 Nest 的依赖注入来配置。

#### 可配置模块构建器

手动创建高度可配置的动态模块，以 expose __INLINE_CODE_148__ 方法 (__INLINE_CODE_149__, __INLINE_CODE_150__, 等）非常复杂，尤其是对于新手来说。因此，Nest expose 了 __INLINE_CODE_151__ 类，这使您可以在几行代码中构建模块“蓝图”。Here is the translation of the provided English technical documentation to Chinese, following the specified rules:

**文件名：** __INLINE_CODE_156__

**模块** __INLINE_CODE_157__ 的定义

__CODE_BLOCK_12__

在这个地方，我们创建了一个专门的接口来代表 __INLINE_CODE_154__ 的选项。

__CODE_BLOCK_13__

现在，让我们创建一个新的文件 __INLINE_CODE_156__，并在其中使用 __INLINE_CODE_157__ 构建 __INLINE_CODE_158__ 定义。

__CODE_BLOCK_14__

现在，让我们打开 __INLINE_CODE_159__ 文件，并将其实现修改为使用自动生成的 __INLINE_CODE_160__：

__CODE_BLOCK_15__

扩展 __INLINE_CODE_161__意味着 __INLINE_CODE_162__ 现在不仅提供了 __INLINE_CODE_163__ 方法（之前使用自定义实现），而且还提供了 __INLINE_CODE_164__ 方法，这允许消费者异步配置模块，例如，通过提供异步工厂：

__CODE_BLOCK_16__

__INLINE_CODE_165__ 方法接受以下对象作为参数：

__CODE_BLOCK_17__

让我们逐一分析这些属性：

- __INLINE_CODE_166__ - 一个返回配置对象的函数。它可以是同步或异步的。要将依赖项注入到工厂函数中，请使用 __INLINE_CODE_167__ 属性。我们在上面的示例中使用了这种变体。
- __INLINE_CODE_168__ - 一个依赖项数组，会被注入到工厂函数中。依赖项的顺序必须与工厂函数的参数顺序相匹配。
- __INLINE_CODE_169__ - 一个将被实例化为提供者的类。该类必须实现相应的接口。通常，这是提供一个 __INLINE_CODE_170__ 方法的类，该方法返回配置对象。更多信息，请参阅 __LINK_226__ 部分。
- __INLINE_CODE_171__ - __INLINE_CODE_172__ 的变体，允许您使用现有的提供者，而不是 instructing Nest 创建一个新的类实例。这对于使用已经注册在模块中的提供者非常有用。请注意，类必须实现同一个接口作为 __INLINE_CODE_173__ (并且必须提供 __INLINE_CODE_174__ 方法，除非您覆盖默认方法名称，见 __LINK_227__ 部分）。

总是选择上述选项中的一个（__INLINE_CODE_175__、__INLINE_CODE_176__ 或 __INLINE_CODE_177__），因为它们是互-exclusive 的。

最后，让我们更新 __INLINE_CODE_178__ 类，以便将生成的模块选项提供者注入到 __INLINE_CODE_179__ 中。

__CODE_BLOCK_18__

#### 自定义方法名称

__INLINE_CODE_180__ 默认提供 __INLINE_CODE_181__ 和 __INLINE_CODE_182__ 方法。要使用不同的方法名称，请使用 __INLINE_CODE_183__ 方法，例如：

__CODE_BLOCK_19__

这将 instruct __INLINE_CODE_184__ 生成一个 expose __INLINE_CODE_185__ 和 __INLINE_CODE_186__ 的类。示例：

__CODE_BLOCK_20__

#### 自定义选项工厂类

由于 __INLINE_CODE_187__ 方法（或 __INLINE_CODE_188__ 或其他名称，取决于配置）允许消费者传递一个提供定义，用于解析模块配置，一些库消费者可能会提供一个类来用于构建配置对象。

__CODE_BLOCK_21__

这个类默认必须提供 __INLINE_CODE_189__ 方法，该方法返回模块配置对象。但是，如果您的库遵循不同的命名约定，您可以使用 __INLINE_CODE_192__ 方法来改变该行为，并 instruct __INLINE_CODE_190__ expectancy 一个不同的方法，例如 __INLINE_CODE_191__：

__CODE_BLOCK_22__

现在，__INLINE_CODE_193__ 类必须 expose __INLINE_CODE_194__ 方法（而不是 __INLINE_CODE_195__）：

__CODE_BLOCK_23__

#### 额外选项

在某些情况下，您的模块可能需要接受额外选项，以确定它应该如何行为（例如，__INLINE_CODE_196__ 标志或 simplement __INLINE_CODE_197__），这些选项不应该包含在 __INLINE_CODE_198__ 提供者中（因为它们与注册在该模块中的服务/提供者无关，例如 __INLINE_CODE_199__ 不需要知道它的宿主模块是否注册为全局模块）。

在这种情况下，可以使用 __INLINE_CODE_200__ 方法。请参阅以下示例：

__CODE_BLOCK_24__

Note: I followed the provided glossary and maintained the original code and formatting, translated code comments from English to Chinese, and kept placeholders unchanged.以下是翻译后的中文技术文档：

在 __INLINE_CODE_201__ 方法的第一个参数中传递了一个对象，它包含了 “extra” 属性的默认值。第二个参数是一个函数，它接受一个由 __INLINE_CODE_202__, __INLINE_CODE_203__, 等生成的模块定义（带有 __INLINE_CODE_204__ 对象，表示额外属性（由消费者指定或默认值））。该函数返回的值是一个修改后的模块定义。在这个特定的示例中，我们将 __INLINE_CODE_205__ 属性分配给模块定义的 __INLINE_CODE_206__ 属性（从而确定模块是否是全局的，更多信息请查看 __LINK_228__）。

在消费这个模块时，可以传递额外的 __INLINE_CODE_207__ 标志，以下是一个示例：

__CODE_BLOCK_24__

然而，因为 __INLINE_CODE_208__ 声明为“extra” 属性，所以在 __INLINE_CODE_209__ 提供者中不可用：

__CODE_BLOCK_25__

#### 扩展自动生成的方法

如果需要，可以扩展自动生成的静态方法（如 __INLINE_CODE_210__, __INLINE_CODE_211__, 等），如下所示：

__CODE_BLOCK_26__

注意在模块定义文件中必须导出 __INLINE_CODE_212__ 和 __INLINE_CODE_213__ 类型：

__CODE_BLOCK_27__