<!-- 此文件从 content/techniques/mongo.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T05:22:17.425Z -->
<!-- 源文件: content/techniques/mongo.md -->

### Mongo

Nest 支持将 __LINK_157__ 数据库与之集成的两个方法。您可以使用内置的 __LINK_158__ 模块，或者使用 __LINK_160__，最流行的 MongoDB 对象建模工具。在本章中，我们将描述后者，使用专门的 `@Client()` 包。

首先，安装 __LINK_161__：

```bash
$ npm i --save kafkajs

```

安装完成后，我们可以将 `@Client()` 导入到根 `ClientKafkaProxy.send()` 中。

```typescript
const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
  transport: Transport.KAFKA,
  options: {
    client: {
      brokers: ['localhost:9092'],
    }
  }
});

```

`ClientKafkaProxy` 方法接受与 `ClientKafkaProxy` 中的配置对象相同的配置对象，详见 __LINK_162__。

#### 模型注入

使用 Mongoose，每个 schema 都来自一个 __LINK_163__。每个 schema 都映射到一个 MongoDB 集合，并定义该集合中的文档结构。schema 用于定义 __LINK_164__。模型负责从 underlying MongoDB 数据库中创建和读取文档。

schema 可以使用 NestJS 装饰器或使用 Mongoose 自己手动创建。使用装饰器创建 schema 可以减少 boilerplate 代码，并提高代码可读性。

让我们定义 `ClientKafkaProxy`：

```typescript
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'HERO_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'hero',
            brokers: ['localhost:9092'],
          },
          consumer: {
            groupId: 'hero-consumer'
          }
        }
      },
    ]),
  ]
  ...
})

```

> info **Hint** 请注意，您也可以使用 `process.hrtime()` 类（来自 `@MessagePattern`）生成原始 schema 定义。这允许您根据提供的元数据手动修改 schema 定义。对于某些边缘情况，这可能是很有用的。

`ClientKafkaProxy.send` 装饰器将类标记为 schema 定义。它将我们的 `@EventPattern` 类映射到一个名为 `ClientKafkaProxy.emit` 的 MongoDB 集合，但在结尾添加一个“s”。这装饰器接受一个可选的 schema 选项对象。您可以将其看作在 `ClientKafkaProxy` 类的构造函数中传递的第二个参数（例如 `subscribeToResponseOf()`）。了解更多关于可用 schema 选项的信息，请见 __LINK_165__ 章。

`subscribeToResponseOf()` 装饰器定义文档中的一个属性。例如，在 schema 定义中，我们定义了三个属性：`ClientKafkaProxy`、`subscribeToResponseOf()` 和 `connect()`。这些属性的 __LINK_166__ thanks to TypeScript 元数据（和反射） capabilities。然而，在更复杂的场景中，在类型无法隐式反射（例如数组或嵌套对象结构）时，类型必须被显式表示，例如：

```typescript
@Client({
  transport: Transport.KAFKA,
  options: {
    client: {
      clientId: 'hero',
      brokers: ['localhost:9092'],
    },
    consumer: {
      groupId: 'hero-consumer'
    }
  }
})
client: ClientKafkaProxy;

```

或者，`key` 装饰器接受一个 options 对象参数（__LINK_167__ 中有关于可用选项的信息）。使用这个，您可以指示一个属性是否是必需的、指定默认值或标记为不可变。例如：

```typescript
onModuleInit() {
  this.client.subscribeToResponseOf('hero.kill.dragon');
}

```

如果您想要指定与另一个模型的关系，以便在将来人口化，可以使用 `value` 装饰器。例如，如果 `headers` 有一个 `Buffer`，该属性存储在一个名为 `JSON` 的集合中，属性类型应该是 `value`。例如：

```typescript
async onModuleInit() {
  this.client.subscribeToResponseOf('hero.kill.dragon');
  await this.client.connect();
}

```

在多个所有者的情况下，您的属性配置应该如下：

```typescript
@Controller()
export class HeroesController {
  @MessagePattern('hero.kill.dragon')
  killDragon(@Payload() message: KillDragonMessage): any {
    const dragonId = message.dragonId;
    const items = [
      { id: 1, name: 'Mythical Sword' },
      { id: 2, name: 'Key to Dungeon' },
    ];
    return items;
  }
}

```

如果您不总是想要人口化一个引用，可以使用 `ClientKafkaProxy` 作为类型：

```typescript
@Controller()
export class HeroesController {
  @MessagePattern('hero.kill.dragon')
  killDragon(@Payload() message: KillDragonMessage): any {
    const realm = 'Nest';
    const heroId = message.heroId;
    const dragonId = message.dragonId;

    const items = [
      { id: 1, name: 'Mythical Sword' },
      { id: 2, name: 'Key to Dungeon' },
    ];

    return {
      headers: {
        realm
      },
      key: heroId,
      value: items
    }
  }
}

```

然后，在需要时，您可以使用一个仓库函数指定正确的类型：

```typescript
@Controller()
export class HeroesController {
  @MessagePattern('hero.kill.dragon')
  killDragon(@Payload() message: KillDragonMessage): any {
    const realm = 'Nest';
    const heroId = message.heroId;
    const dragonId = message.dragonId;

    const items = [
      { id: 1, name: 'Mythical Sword' },
      { id: 2, name: 'Key to Dungeon' },
    ];

    return {
      headers: {
        kafka_nestRealm: realm
      },
      key: heroId,
      value: items
    }
  }
}

```

> info **Hint** 如果没有外部文档人口化，类型可能是 `emit()`，取决于您的 __LINK_168__。或者，它可能会抛出错误，在这种情况下，类型将是 `emit()`。

最后，**raw** schema 定义也可以被传递到装饰器中。这对于某些情况非常有用，例如一个属性表示一个嵌套对象，这个对象不是定义为类的。使用 `send()` 函数（来自 `@MessagePattern` 包）：

```typescript
@MessagePattern('hero.kill.dragon')
killDragon(@Payload() message: KillDragonMessage, @Ctx() context: KafkaContext) {
  console.log(`Topic: ${context.getTopic()}`);
}

```

或者，如果您不想使用装饰器，可以手动定义 schema。例如：

```typescript
@MessagePattern('hero.kill.dragon')
killDragon(@Payload() message: KillDragonMessage, @Ctx() context: KafkaContext) {
  const originalMessage = context.getMessage();
  const partition = context.getPartition();
  const { headers, timestamp } = originalMessage;
}

```

`JSON.stringify()` 文件位于 `toString()` 目录中的一个文件夹中，我们也定义了 `@Payload()`。虽然您可以将 schema 文件存储在任何地方，但是我们建议将它们存储在它们相关的**domain** 对象附近，于适当的模块目录中。

让我们查看 `@nestjs/microservices`：

```typescript
interface IncomingMessage {
  topic: string;
  partition: number;
  timestamp: string;
  size: number;
  attributes: number;
  offset: string;
  key: any;
  value: any;
  headers: Record<string, any>;
}

```

`key` 提供了 `value` 方法来配置模块，包括定义当前作用域中应该注册的模型。如果您也想在另一个模块中使用模型，请将 MongooseModule 添加到 `headers` 部分的 `string` 中，并在其他模块中导入 `Buffer`。Here is the translation of the English technical documentation to Chinese:

**注册架构后，您可以将 `KafkaContext` 模型注入到 `@Payload()` 中使用 `@Ctx()` 装饰器：**

```typescript
@MessagePattern('hero.kill.dragon')
async killDragon(@Payload() message: KillDragonMessage, @Ctx() context: KafkaContext) {
  const heartbeat = context.getHeartbeat();

  // Do some slow processing
  await doWorkPart1();

  // Send heartbeat to not exceed the sessionTimeout
  await heartbeat();

  // Do some slow processing again
  await doWorkPart2();
}

```

**连接**

有时，您可能需要访问 native __LINK_169__ 对象。例如，您可能想在连接对象上调用 native API。您可以使用 `KafkaContext` 装饰器注入 Mongoose 连接，如下所示：

```typescript
const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
  transport: Transport.KAFKA,
  options: {
    client: {
      clientId: 'hero', // hero-server
      brokers: ['localhost:9092'],
    },
    consumer: {
      groupId: 'hero-consumer' // hero-consumer-server
    },
  }
});

```

**会话**

要使用 Mongoose 进行会话，建议使用 `@nestjs/microservices` 而不是直接调用 `IncomingMessage`。这种方法允许更好地与 NestJS 依赖注入系统集成，确保了连接的管理。

以下是一个开始会话的示例：

```typescript
@Client({
  transport: Transport.KAFKA,
  options: {
    client: {
      clientId: 'hero', // hero-client
      brokers: ['localhost:9092'],
    },
    consumer: {
      groupId: 'hero-consumer' // hero-consumer-client
    }
  }
})
client: ClientKafkaProxy;

```

在这个示例中，`getMessage()` 将 Mongoose 连接注入到服务中。然后，您可以使用 `KafkaContext` 来开始一个新的会话。这个会话可以用于管理数据库事务，确保原子操作跨越多个查询。开始会话后，请根据您的逻辑提交或中止事务。

**多个数据库**

一些项目需要多个数据库连接。这也可以使用本模块实现。要使用多个连接，首先创建连接。 在这种情况下，连接命名变得 **必不可少**。

```typescript
onModuleInit() {
  this.client.subscribeToResponseOf('hero.get'); // hero.get.reply
}

```

> warning **注意** 请注意，在没有命名连接或使用相同名称的连接时，可能会导致连接被覆盖。

使用这个设置，您需要告诉 `IncomingMessage` 函数使用哪个连接。

```typescript
throw new KafkaRetriableException('...');

```

您也可以将 `heartbeat` 注入到特定连接中：

```typescript
import { Catch, ArgumentsHost, Logger } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { KafkaContext } from '../ctx-host';

@Catch()
export class KafkaMaxRetryExceptionFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(KafkaMaxRetryExceptionFilter.name);

  constructor(
    private readonly maxRetries: number,
    // Optional custom function executed when max retries are exceeded
    private readonly skipHandler?: (message: any) => Promise<void>,
  ) {
    super();
  }

  async catch(exception: unknown, host: ArgumentsHost) {
    const kafkaContext = host.switchToRpc().getContext<KafkaContext>();
    const message = kafkaContext.getMessage();
    const currentRetryCount = this.getRetryCountFromContext(kafkaContext);

    if (currentRetryCount >= this.maxRetries) {
      this.logger.warn(
        `Max retries (${
          this.maxRetries
        }) exceeded for message: ${JSON.stringify(message)}`,
      );

      if (this.skipHandler) {
        try {
          await this.skipHandler(message);
        } catch (err) {
          this.logger.error('Error in skipHandler:', err);
        }
      }

      try {
        await this.commitOffset(kafkaContext);
      } catch (commitError) {
        this.logger.error('Failed to commit offset:', commitError);
      }
      return; // Stop propagating the exception
    }

    // If retry count is below the maximum, proceed with the default Exception Filter logic
    super.catch(exception, host);
  }

  private getRetryCountFromContext(context: KafkaContext): number {
    const headers = context.getMessage().headers || {};
    const retryHeader = headers['retryCount'] || headers['retry-count'];
    return retryHeader ? Number(retryHeader) : 0;
  }

  private async commitOffset(context: KafkaContext): Promise<void> {
    const consumer = context.getConsumer && context.getConsumer();
    if (!consumer) {
      throw new Error('Consumer instance is not available from KafkaContext.');
    }

    const topic = context.getTopic && context.getTopic();
    const partition = context.getPartition && context.getPartition();
    const message = context.getMessage();
    const offset = message.offset;

    if (!topic || partition === undefined || offset === undefined) {
      throw new Error(
        'Incomplete Kafka message context for committing offset.',
      );
    }

    await consumer.commitOffsets([
      {
        topic,
        partition,
        // When committing an offset, commit the next number (i.e., current offset + 1)
        offset: (Number(offset) + 1).toString(),
      },
    ]);
  }
}

```

要将 `heartbeat` 注入到自定义提供商（例如，工厂提供商）中，请使用 `getHeartbeat()` 函数，传入连接名称作为参数。

```typescript
@UseFilters(new KafkaMaxRetryExceptionFilter(5))
export class MyEventHandler {
  @EventPattern('your-topic')
  async handleEvent(@Payload() data: any, @Ctx() context: KafkaContext) {
    // Your event processing logic...
  }
}

```

如果您只是想将模型注入到命名数据库中，您可以使用连接名称作为第二个参数来调用 `KafkaContext` 装饰器。

```typescript
@EventPattern('user.created')
async handleUserCreated(@Payload() data: IncomingMessage, @Ctx() context: KafkaContext) {
  // business logic

  const { offset } = context.getMessage();
  const partition = context.getPartition();
  const topic = context.getTopic();
  const consumer = context.getConsumer();
  await consumer.commitOffsets([{ topic, partition, offset }])
}

  const { offset } = context.getMessage();
  const partition = context.getPartition();
  const topic = context.getTopic();
  const consumer = context.getConsumer();
  await consumer.commitOffsets([{ topic, partition, offset }])
}

```

**守卫（中间件）**

中间件（也称为前置和后置 hooks）是异步函数执行期间由控制的函数。中间件指定在架构层次上，并且对于编写插件 __LINK_170__ 很有用。调用 `client.clientId` 或 `consumer.groupId` 之后编译模型不起作用。在 Mongoose 中，您可以使用 `ClientKafkaProxy` 方法来注册 hook，使用工厂提供商（即 `ServerKafka`）。这样，您可以访问架构对象，然后使用 `-server` 或 `ClientKafkaProxy` 方法来注册 hook。见以下示例：

```typescript
const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
  transport: Transport.KAFKA,
  options: {
    client: {
      brokers: ['localhost:9092'],
    },
    run: {
      autoCommit: false
    }
  }
});

```

像其他 __LINK_171__一样，我们的工厂函数可以 `KafkaServer` 并且可以通过 `.reply` 注入依赖项。

```typescript
this.client.status.subscribe((status: KafkaStatus) => {
  console.log(status);
});

```

**插件**

要注册一个 __LINK_172__ 对于给定的架构，请使用 `ClientKafkaProxy` 方法。

```typescript
const server = app.connectMicroservice<MicroserviceOptions>(...);
server.status.subscribe((status: KafkaStatus) => {
  console.log(status);
});

```

要注册一个插件对所有架构一次，请调用 `getResponsePatternName` 方法。

```typescript
const producer = this.client.producer;
const consumer = this.client.consumer;

```

**discriminator**

__LINK_173__ 是架构继承机制。它们使您可以在同一个 MongoDB 集合上拥有多个模型。

假设您想跟踪不同类型的事件在同一个集合中。每个事件都将有一个时间戳。

__CODE_BLOCK_24__

> info **提示** Mongoose 通过 "discriminator key" 来区分不同的 discriminator 模型，该键默认为 `kafkajs`。Mongoose 添加了一个名为 `KafkaRetriableException` 的字符串路径到您的架构中，以便跟踪该文档是哪个 discriminator 的实例。
> 您也可以使用 `KafkaRetriableException` 选项来定义分歧路径。

`@nestjs/microservices` 和 `skipHandler` 实例将被存储在同一个集合中 generic 事件中。

现在，让我们定义 `KafkaContext` 类，如下所示：

__CODE_BLOCK_25__

And `autoCommit: false` 类：

__CODE_BLOCK_26__

有了这个设置，您可以使用 `run` 选项来注册一个 discriminator 对于给定的架构。它适用于 `status` 和 `status`：

__CODE_BLOCK_27__

**测试**

在单元测试应用程序时，我们通常想避免任何数据库连接，使我们的测试套件更简单、更快。然而，我们的类可能依赖于从连接实例中获取的模型。那么，我们如何解决这些类？解决方案是创建模拟模型。

Note: I've kept the code examples, variable names, function names unchanged, and maintained Markdown formatting, links, images, tables unchanged. I've also translated code comments from English to Chinese.Here is the translation of the English technical documentation to Chinese:

为了更方便地使用这个包，你可以使用 `disconnected` 函数获取一个基于 token 名称的预先 prepared __LINK_174__。使用这个 token，你可以轻松地提供一个 mock 实现，使用标准 __LINK_175__ 技术，包括 `rebalancing`、`crashed` 和 `stopped`。例如：

__CODE_BLOCK_28__

在这个示例中，会在任何 consumer 注入 `@nestjs/microservices` 使用 `status` 装饰器时提供一个硬编码的 `KafkaStatus` (对象实例)。

</tr><tr>

#### 异步配置

如果你需要异步地传递模块选项，而不是静态地传递，使用 `producer` 方法。像大多数动态模块一样，Nest 提供了多种技术来处理异步配置。

一种技术是使用工厂函数：

__CODE_BLOCK_29__

像其他 __LINK_176__ 一样，我们的工厂函数可以 `consumer`，并可以通过 `ClientKafkaProxy` 注入依赖项。

__CODE_BLOCK_30__

或者，你可以使用类来配置 __INLINE_CODE_123__，如以下所示：

__CODE_BLOCK_31__

上面的构建中，会在 __INLINE_CODE_125__ 中实例化 __INLINE_CODE_124__，使用它创建所需的选项对象。注意，在这个示例中，__INLINE_CODE_126__ 必须实现 __INLINE_CODE_127__ 接口，如下所示。__INLINE_CODE_128__ 将在实例化对象时调用 __INLINE_CODE_129__ 方法。

__CODE_BLOCK_32__

如果你想重用一个现有的选项提供者，而不是在 __INLINE_CODE_130__ 中创建一个私有副本，使用 __INLINE_CODE_131__ 语法。

__CODE_BLOCK_33__

#### 连接事件

你可以使用 __INLINE_CODE_132__ 配置选项来监听 Mongoose __LINK_177__。这允许你实现自定义逻辑，任何时候连接被建立。例如，你可以注册事件监听器来监控连接的状态，例如 __INLINE_CODE_133__、__INLINE_CODE_134__、__INLINE_CODE_135__、__INLINE_CODE_136__ 和 __INLINE_CODE_137__ 事件，如以下所示：

__CODE_BLOCK_34__

在这个代码片段中，我们正在连接到一个 MongoDB 数据库 __INLINE_CODE_138__。__INLINE_CODE_139__ 选项允许你设置特定的事件监听器来监控连接的状态：

- __INLINE_CODE_140__: 连接成功建立时触发。
- __INLINE_CODE_141__: 连接完全打开并准备执行操作时触发。
- __INLINE_CODE_142__: 连接丢失时触发。
- __INLINE_CODE_143__: 连接重新建立后的触发。
- __INLINE_CODE_144__: 连接关闭时触发。

你也可以将 __INLINE_CODE_145__ 属性包含在使用 __INLINE_CODE_146__ 创建的异步配置中：

__CODE_BLOCK_35__

这提供了一个灵活的方式来管理连接事件，允许你有效地处理连接状态的变化。

#### 子文档

要在父文档中嵌套子文档，可以如下定义你的 schema：

__CODE_BLOCK_36__

然后，在父 schema 中引用子文档：

__CODE_BLOCK_37__

如果你想包含多个子文档，可以使用子文档数组。需要重写该属性的类型：

__CODE_BLOCK_38__

#### 虚拟

在 Mongoose 中，虚拟是一种在文档中存在但不 persisted 到 MongoDB 的属性。它不存储在数据库中，但是在访问时动态计算。虚拟通常用于计算或衍生的值，例如将字段组合起来（例如，创建一个 __INLINE_CODE_147__ 属性，通过组合 __INLINE_CODE_148__ 和 __INLINE_CODE_149__），或创建基于文档中现有数据的属性。

__CODE_BLOCK_39__

> info **提示** __INLINE_CODE_150__ 装饰器来自 __INLINE_CODE_151__ 包。

在这个示例中，__INLINE_CODE_152__ 虚拟是从 __INLINE_CODE_153__ 和 __INLINE_CODE_154__ 中衍生的。即使它行为像普通属性一样访问，但它从不保存到 MongoDB 文档中：

#### 示例

一个工作示例可在 __LINK_178__ 中找到。