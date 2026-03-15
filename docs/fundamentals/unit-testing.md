<!-- 此文件从 content/fundamentals/unit-testing.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T05:00:32.328Z -->
<!-- 源文件: content/fundamentals/unit-testing.md -->

### 测试

自动测试被认为是任何严肃软件开发努力的必要组成部分。自动化使得可以快速和轻松地重复单个测试或测试套件，帮助确保发布满足质量和性能目标。自动化还可以增加覆盖率，提供快速反馈回路，以便开发者更好地了解测试结果。自动化不仅提高了单个开发者的生产力，还确保了在关键开发生命周期阶段，例如源代码控制检查入、特性集成和版本发布时，测试被运行。

这些测试通常包括多种类型，例如单元测试、端到端(e2e)测试、集成测试等。虽然其优点无可争辩，但设置它们可能很繁琐。Nest 强调开发最佳实践，包括有效的测试，因此它包括以下功能帮助开发者和团队构建和自动化测试。Nest：

- 自动创建默认单元测试和 e2e 测试
- 提供默认工具（例如测试运行器和隔离模块/应用程序加载器）
- 与 __LINK_150__ 和 __LINK_151__ 等测试工具无缝集成，从而保持了agnosticism
- 将 Nest 依赖注入系统在测试环境中提供，以便轻松地模拟组件

正如所述，您可以使用任何测试框架，因为 Nest 不强求特定的工具 Simply replace the elements needed (such as the test runner), and you will still enjoy the benefits of Nest's ready-made testing facilities.

#### 安装

要开始，请首先安装所需的包：

```bash
$ npm i --save redis socket.io @socket.io/redis-adapter

```

#### 单元测试

以下示例中，我们测试两个类：`WsAdapter` 和 `ws`。正如所述，__LINK_152__ 作为默认测试框架，作为测试运行器和 assert 函数和 test-double 实用工具，帮助模拟、监视等。在以下基本测试中，我们手动实例化这些类，并确保控制器和服务满足 API 合同。

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

> info **提示**请将测试文件与它们测试的类保持在一起。测试文件应该具有 `socket.io` 或 `ws` 后缀。

由于上述示例非常简单，我们实际上并没有测试 Nest 特定的内容。实际上，我们甚至没有使用依赖注入（注意我们将 `@WebSocketGateway({{ '{' }} path: '/users' {{ '}' }})` 实例传递给 `ws`）。这种形式的测试，即我们手动实例化被测试的类，是被称为 **孤立测试** 的，因为它独立于框架。让我们引入一些更高级的功能，以便更好地测试使用 Nest 特性的应用程序。

#### 测试实用工具

`WsAdapter` 包提供了一组实用工具，以便实现更强大的测试过程。让我们重写前面的示例，使用内置的 `@nestjs/platform-ws` 类：

```typescript
const app = await NestFactory.create(AppModule);
const redisIoAdapter = new RedisIoAdapter(app);
await redisIoAdapter.connectToRedis();

app.useWebSocketAdapter(redisIoAdapter);

```

`wsAdapter` 类非常有用，用于提供一个应用程序执行上下文，该上下文模拟了完整的 Nest 运行时，但提供了 hooks，使得您可以轻松地管理类实例，包括模拟和override。`{{ '{' }} event: string, data: any {{ '}' }}` 类具有 `setMessageParser` 方法，该方法接受一个模块元数据对象作为其参数（与您在 `@nestjs/platform-ws` 装饰器中传递的同一个对象）。该方法返回一个 `WsAdapter` 实例，该实例提供了一些方法。对于单元测试，重要的一点是 `WsAdapter` 方法。该方法启动了一个模块及其依赖项（类似于在 conventional `useWebSocketAdapter()` 文件中使用 `WsAdapter`），并返回一个准备好的模块。

> info **提示**__INLINE_CODE_29__ 方法是 **异步** 的，因此需要等待。模块编译完成后，您可以使用 __INLINE_CODE_30__ 方法获取任何 **静态** 实例（控制器和提供者）。

__INLINE_CODE_31__ 继承自 __LINK_153__ 类，因此它可以动态地解决作用域提供者（瞬态或请求作用域）。使用 __INLINE_CODE_32__ 方法（__INLINE_CODE_33__ 方法只能获取静态实例）。

```bash
$ npm i --save @nestjs/platform-ws

```

> warning **警告**__INLINE_CODE_34__ 方法返回该提供者的唯一实例，从其自己的 **DI 容器子树** 中。每个子树都有唯一的上下文标识符。因此，如果您多次调用该方法并比较实例引用，您将看到它们不相等。

> info **提示**了解更多关于模块引用功能 __LINK_154__。Here is the translation of the English technical documentation to Chinese:

** overrides  **

Nest 可以将生产环境中的提供者覆盖为__LINK_155__以供测试使用。例如，可以模拟数据库服务，而不是连接到在线数据库。我们将在下一节中 discussing overrides，但它们也可用于单元测试中。

__HTML_TAG_90____HTML_TAG_91__

#### 自动模拟

Nest 允许您定义一个 mock 工厂来应用于所有 missing 依赖项。这在你有一个大型类中，多个依赖项时非常有用。在使用该功能时，需要将 __INLINE_CODE_35__ 方法与 __INLINE_CODE_36__ 方法链式调用，并传入依赖项 mock 的工厂。该工厂可以带有可选的 token，它是一个 Nest 提供者的实例 token，返回一个 mock 实现。下面是一个使用 __LINK_156__ 和 __INLINE_CODE_38__ 的特定 mock 示例。

```typescript
const app = await NestFactory.create(AppModule);
app.useWebSocketAdapter(new WsAdapter(app));

```

你也可以从testing 容器中检索这些 mock，正如你通常处理自定义提供者一样 __INLINE_CODE_40__。

> 提示 **Hint** 一般的 mock 工厂，如 __INLINE_CODE_41__ 从 __LINK_157__ 可以直接传递。

> 提示 **Hint** __INLINE_CODE_43__ 和 __INLINE_CODE_44__ 提供者不能被自动模拟，因为它们已经在上下文中预定义了。然而，它们可以使用自定义提供语法或 __INLINE_CODE_45__ 方法进行重写。

#### 结果到结果测试

与单元测试不同，结果到结果（e2e）测试将类和模块的交互行为更好地模拟，更加接近生产系统的交互行为。随着应用程序的增长，手动测试 API endpoints 的交互行为变得越来越困难。自动 e2e 测试帮助我们确保系统的整体行为正确，并满足项目要求。为了执行 e2e 测试，我们使用与单元测试相同的配置。另外，Nest 使得使用 __LINK_158__ 库来模拟 HTTP 请求变得非常容易。

```typescript
const wsAdapter = new WsAdapter(app, {
  // To handle messages in the [event, data] format
  messageParser: (data) => {
    const [event, payload] = JSON.parse(data.toString());
    return { event, data: payload };
  },
});

```

> 提示 **Hint** 如果你使用 __LINK_159__ 作为 HTTP 适配器，它需要不同的配置，有内置测试功能：
>
> ```typescript
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

在这个示例中，我们基于之前描述的概念。除了我们之前使用的 __INLINE_CODE_46__ 方法，我们现在使用 __INLINE_CODE_47__ 方法来实例化一个完整的 Nest 运行环境。

需要注意的是，在你的应用程序使用 __INLINE_CODE_48__ 方法编译时， __INLINE_CODE_49__ 将在那个时间点处于 undefined 状态。这是因为在这个编译阶段，没有创建 HTTP 适配器或服务器。你的测试需要 __INLINE_CODE_50__，你应该使用 __INLINE_CODE_51__ 方法创建应用程序实例，或者重构项目以避免这个依赖项在初始化依赖项图时。

好的，让我们分解示例：

我们将 running app 的引用保存在 __INLINE_CODE_52__ 变量中，以便使用它来模拟 HTTP 请求。

我们使用 Supertest 的 __INLINE_CODE_53__ 函数来模拟 HTTP 测试。我们想要这些 HTTP 请求路由到 our running Nest app，所以我们将 __INLINE_CODE_54__ 函数传递给 HTTP监听器，该监听器可能由 Express 平台提供。因此，构造 __INLINE_CODE_55__。 __INLINE_CODE_56__ 方法返回一个包装的 HTTP 服务器，现在连接到 Nest app，可以模拟实际 HTTP 请求。例如，使用 __INLINE_CODE_57__ 将发起一个到 Nest app 的请求， identical 到一个实际 HTTP 请求，如 __INLINE_CODE_58__。

在这个示例中，我们也提供了一个 alternate（test-double）实现 __INLINE_CODE_59__，它简单地返回一个硬编码值，我们可以测试它。使用 __INLINE_CODE_60__ 提供这样的 alternate 实现。同样，Nest 提供了方法来重写模块、守卫、拦截器、过滤器和管道使用 __INLINE_CODE_61__、__INLINE_CODE_62__、__INLINE_CODE_63__、__INLINE_CODE_64__ 和 __INLINE_CODE_65__ 方法。

每个重写方法（除了 __INLINE_CODE_66__）返回一个对象，其中包含3个不同的方法，类似于 __LINK_160__：

- __INLINE_CODE_67__: 你提供一个将被实例化的类，以提供 override 对象（提供者、守卫等）的实例。
- __INLINE_CODE_68__: 你提供一个将 override 对象的实例。
- __INLINE_CODE_69__: 你提供一个返回实例将 override 对象的函数。Here is the translation of the English technical documentation to Chinese:

有一些时候，__INLINE_CODE_70__将返回一个对象，其中包含__INLINE_CODE_71__方法，可以用来提供一个将覆盖原始模块的模块，例如：

```typescript
const app = await NestFactory.create(AppModule);
app.useWebSocketAdapter(new WsAdapter(app));

```

每种覆盖方法类型都返回__INLINE_CODE_72__实例，可以链式地与其他方法在__LINK_161__中使用。请在链式中使用__INLINE_CODE_73__来使Nest实例化和初始化模块。

有时候，您可能想提供一个自定义的日志记录器，例如在测试中运行（例如，在CI服务器上）。使用__INLINE_CODE_74__方法，并将一个实现__INLINE_CODE_75__接口的对象传递给__INLINE_CODE_76__，以便__INLINE_CODE_76__在测试中如何记录日志（默认情况下，只有“error”日志将被记录到控制台）。

编译后的模块具有以下有用的方法，如下表所示：

__HTML_TAG_92__
  __HTML_TAG_93__
    __HTML_TAG_94__
      __HTML_TAG_95__createNestApplication()__HTML_TAG_96__
    __HTML_TAG_97__
    __HTML_TAG_98__
      创建并返回一个Nest应用程序（__HTML_TAG_99__INestApplication__HTML_TAG_100__实例），根据给定的模块。
      请注意，您需要手动初始化应用程序使用__HTML_TAG_101__init()__HTML_TAG_102__方法。
    __HTML_TAG_103__
  __HTML_TAG_104__
  __HTML_TAG_105__
    __HTML_TAG_106__
      __HTML_TAG_107__createNestMicroservice()__HTML_TAG_108__
    __HTML_TAG_109__
    __HTML_TAG_110__
      创建并返回一个Nest微服务（__HTML_TAG_111__INestMicroservice__HTML_TAG_112__实例），根据给定的模块。
    __HTML_TAG_113__
  __HTML_TAG_114__
  __HTML_TAG_115__
    __HTML_TAG_116__
      __HTML_TAG_117__get()__HTML_TAG_118__
    __HTML_TAG_119__
    __HTML_TAG_120__
      获取应用程序上下文中可用的控制器或提供者的静态实例（包括守卫、过滤器等）。继承自__HTML_TAG_121__module reference__HTML_TAG_122__类。
    __HTML_TAG_123__
  __HTML_TAG_124__
  __HTML_TAG_125__
     __HTML_TAG_126__
      __HTML_TAG_127__resolve()__HTML_TAG_128__
    __HTML_TAG_129__
    __HTML_TAG_130__
      获取应用程序上下文中可用的控制器或提供者的动态实例（请求或瞬态）。继承自__HTML_TAG_131__module reference__HTML_TAG_132__类。
    __HTML_TAG_133__
  __HTML_TAG_134__
  __HTML_TAG_135__
    __HTML_TAG_136__
      __HTML_TAG_137__select()__HTML_TAG_138__
    __HTML_TAG_139__
    __HTML_TAG_140__
      在模块的依赖关系图中导航，可以用来获取特定的实例（在strict模式下__HTML_TAG_141__strict: true__HTML_TAG_142__在__HTML_TAG_143__get()__HTML_TAG_144__方法中使用）。
    __HTML_TAG_145__
  __HTML_TAG_146__
__HTML_TAG_147__

> 提示 **Hint** 将e2e测试文件放置在__INLINE_CODE_77__目录中。测试文件应该具有__INLINE_CODE_78__后缀。

#### 覆盖全局注册的增强器

如果您已经注册了一个全局守卫（或管道、拦截器或过滤器），则需要更多步骤来覆盖该增强器。总之，原始注册如下所示：

__CODE_BLOCK_8__

这将注册守卫作为“multi”-提供者，通过__INLINE_CODE_79__令牌。要能够替换__INLINE_CODE_80__，注册需要使用现有的提供者在这个slot：

__CODE_BLOCK_9__

> 提示 **Hint** 将__INLINE_CODE_81__更换为__INLINE_CODE_82__以引用已注册的提供者，而不是让Nest在后台实例化它。

现在__INLINE_CODE_83__可供Nest作为一个普通提供者，以便在创建__INLINE_CODE_84__时被覆盖：

__CODE_BLOCK_10__

现在所有测试都将使用__INLINE_CODE_85__在每个请求中。

#### 测试请求作用域实例

__LINK_162__提供者在每个incoming **请求**中创建唯一的实例。该实例在请求处理完成后被垃圾收集。这对我们来说是一个问题，因为我们无法访问测试请求生成的依赖注入子树。

我们知道