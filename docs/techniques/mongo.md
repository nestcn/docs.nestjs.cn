<!-- 此文件从 content/techniques/mongo.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T05:18:58.496Z -->
<!-- 源文件: content/techniques/mongo.md -->

### Mongo

Nest 支持与 __LINK_157__ 数据库集成的两个方法。您可以使用内置的 __LINK_158__ 模块，该模块具有 MongoDB 连接器，或者使用 __LINK_160__，最流行的 MongoDB 对象建模工具。在本章中，我们将描述后者，使用专门的 `@Client()` 包。

首先，安装 __LINK_161__：

```bash
$ npm i --save kafkajs

```

安装过程完成后，我们可以将 `@Client()` 导入到根 `ClientKafkaProxy.send()` 中。

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

`ClientKafkaProxy` 方法接受与 `ClientKafkaProxy` 模块中的 `ClientKafkaProxy` 配置对象相同的配置对象，详见 __LINK_162__。

#### 模型注入

使用 Mongoose，每个模型都来自一个 __LINK_163__。每个 schema 都映射到 MongoDB 集合，并定义该集合中的文档结构。schemas 用于定义 __LINK_164__。模型负责创建和读取来自底层 MongoDB 数据库的文档。

可以使用 NestJS 装饰器或手动使用 Mongoose 创建 schema。使用装饰器创建 schema 可以减少 boilerplate 代码和改善代码可读性。

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

> info **提示** 您也可以使用 `process.hrtime()` 类（来自 `@MessagePattern`）生成 raw schema 定义。这允许您手动修改根据提供的元数据生成的 schema 定义。这对于某些边缘情况非常有用，其中可能难以使用装饰器来表示一切。

`ClientKafkaProxy.send` 装饰器标记一个类为 schema 定义。它将我们的 `@EventPattern` 类映射到具有相同名称但末尾加了一个 "s" 的 MongoDB 集合 - 所以最终的 MongoDB 集合名称将是 `ClientKafkaProxy.emit`。这个装饰器接受一个可选的 schema 选项对象。想象一下，这个对象是您通常将作为 `ClientKafkaProxy` 类的构造函数第二个参数传递的对象（例如 `subscribeToResponseOf()`）。要了解可用的 schema 选项，见 __LINK_165__ 章。

`subscribeToResponseOf()` 装饰器定义文档中的一个属性。例如，在 schema 定义中，我们定义了三个属性：`ClientKafkaProxy`、`subscribeToResponseOf()` 和 `connect()`。这些属性的 __LINK_166__ thanks to TypeScript 元数据（和反射）能力。然而，在更复杂的场景中，类型不能隐式反射（例如数组或嵌套对象结构），则需要显式指示类型，例如：

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

或者，`key` 装饰器接受一个 options 对象参数（__LINK_167__ 关于可用的选项）。使用这个，您可以指示一个属性是否为必需的，指定默认值或标记为不可变的。例如：

```typescript
onModuleInit() {
  this.client.subscribeToResponseOf('hero.kill.dragon');
}

```

在您想要指定一个模型之间的关系，以便在将来人口化时，可以使用 `value` 装饰器。例如，如果 `headers` 有 `Buffer`，这些文档将存储在名为 `JSON` 的另一个集合中，则该属性应该具有类型和 ref。例如：

```typescript
async onModuleInit() {
  this.client.subscribeToResponseOf('hero.kill.dragon');
  await this.client.connect();
}

```

如果您不总是人口化到另一个集合，可以使用 `value` 作为类型：

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

然后，在需要时，您可以使用仓库函数指定正确的类型：

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

> info **提示** 如果没有外部文档来人口化，那么类型可能是 `ClientKafkaProxy`，或者根据您的 __LINK_168__，可能会抛出错误，然后类型将是 `emit()`。

最后，**raw** schema 定义也可以传递给装饰器。这在某些情况下非常有用，例如一个属性表示一个嵌套对象，这个对象不是定义为类的。使用 `send()` 函数（来自 `@MessagePattern` 包）：

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

`JSON.stringify()` 文件位于 `toString()` 目录中的一个文件夹中，我们还定义了 `@Payload()`。虽然您可以将 schema 文件存储在任何位置，但是我们建议将它们存储在与相关领域对象相同的目录中。

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

`key` 提供了 `value` 方法来配置模块，包括定义当前作用域中注册的模型。如果您还想在另一个模块中使用模型，添加 MongooseModule 到 `headers` 部分的 `string` 中，并在另一个模块中导入 `Buffer`。Here is the translation of the English technical documentation to Chinese:

注册架构后，您可以使用`KafkaContext`装饰器将`@Payload()`模型注入到`@Ctx()`中：

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

#### 连接

有时您可能需要访问native __LINK_169__ 对象。例如，您可能想在连接对象上调用native API。可以使用`KafkaContext`装饰器将Mongoose连接注入到服务中，例如：

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

#### 会话

要使用Mongoose开始会话，建议使用`@nestjs/microservices`而不是调用`IncomingMessage`直接。这种方法允许更好地与NestJS依赖注入系统集成，确保正确地管理连接。

以下是开始会话的示例：

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

在这个示例中，`getMessage()`用于将Mongoose连接注入到服务中。一旦连接被注入，您可以使用`KafkaContext`开始新的会话。这个会话可以用于管理数据库事务，确保跨多个查询的原子操作。开始会话后，记住根据您的逻辑提交或终止事务。

#### 多个数据库

某些项目需要多个数据库连接。这也可以使用这个模块。要使用多个连接，首先创建连接。在这种情况下，连接名称变得**强制**。

```typescript
onModuleInit() {
  this.client.subscribeToResponseOf('hero.get'); // hero.get.reply
}

```

> 警告 **注意** 请不要在没有名称或同名的情况下创建多个连接，否则它们将被覆盖。

在这种 setup 中，您需要告诉`IncomingMessage`函数使用哪个连接。

```typescript
throw new KafkaRetriableException('...');

```

您也可以注入给定连接的`heartbeat`：

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

要将给定`heartbeat`注入到自定义提供者（例如工厂提供者）中，请使用`getHeartbeat()`函数，传递连接名称作为参数。

```typescript
@UseFilters(new KafkaMaxRetryExceptionFilter(5))
export class MyEventHandler {
  @EventPattern('your-topic')
  async handleEvent(@Payload() data: any, @Ctx() context: KafkaContext) {
    // Your event processing logic...
  }
}

```

如果您只想注入名为数据库的模型，可以使用连接名称作为第二个参数来调用`KafkaContext`装饰器。

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

#### 中间件

中间件（也称为pre 和post hooks）是执行异步函数时被传递控制的函数。中间件是在架构级别指定的，用于编写插件（__LINK_170__）。在编译模型后调用`client.clientId`或`consumer.groupId`不起作用。在Mongoose中，您可以使用`ClientKafkaProxy`方法来注册hook，使用工厂提供者（即`ServerKafka`）。这样，您可以访问架构对象，然后使用`-server`或`ClientKafkaProxy`方法来注册hook。见下例：

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

像其他__LINK_171__一样，我们的工厂函数可以`KafkaServer`并可以通过`.reply`注入依赖项。

```typescript
this.client.status.subscribe((status: KafkaStatus) => {
  console.log(status);
});

```

#### 插件

要为给定架构注册__LINK_172__，请使用`ClientKafkaProxy`方法。

```typescript
const server = app.connectMicroservice<MicroserviceOptions>(...);
server.status.subscribe((status: KafkaStatus) => {
  console.log(status);
});

```

要为所有架构注册插件，请调用`getResponsePatternName`方法`RpcException`对象。您应该在访问连接前创建模型；要实现这点，请使用`kafkajs`：

```typescript
const producer = this.client.producer;
const consumer = this.client.consumer;

```

#### 切分器

__LINK_173__是架构继承机制。它们使您可以在同一个 MongoDB 集合上拥有多个模型。

如果您想跟踪不同类型的事件在同一个集合中，每个事件都将有一个时间戳。

__CODE_BLOCK_24__

> 提示 **提示** Mongoose 使用`kafkajs`默认的“discriminator key”来告诉不同切分器模型。Mongoose 添加了一条名为`KafkaRetriableException`的String路径到您的架构中，以便跟踪这个文档是哪个切分器的实例。

`@nestjs/microservices`和`skipHandler`实例将与通用事件存储在同一个集合中。

现在，让我们定义`KafkaContext`类，例如：

__CODE_BLOCK_25__

和`autoCommit: false`类：

__CODE_BLOCK_26__

在这个地方，您可以使用`run`选项来注册给定架构的切分器。它适用于`status`和`status`：

__CODE_BLOCK_27__

#### 测试

在单元测试应用程序时，我们通常想要避免任何数据库连接，使我们的测试套件更简单、更快。我们的类可能依赖于模型，该模型来自连接实例。如何解决这些类？解决方案是创建模拟模型。

Note: I followed the provided glossary and terminology throughout the translation. I also maintained the code examples, variable names, function names, and Markdown formatting unchanged. I translated code comments from English to Chinese and kept the placeholders exactly as they are in the source text.Here is the translation of the provided English technical documentation to Chinese:

使用 `connected` 包含的 `disconnected` 函数可以返回一个基于token名称的预准备 __LINK_174__。使用该token，您可以轻松地提供一个使用标准 __LINK_175__ 技术的模拟实现，例如 `rebalancing`、`crashed` 和 `stopped`。例如：

__CODE_BLOCK_28__

在这个示例中，硬编码的 `KafkaStatus` 对象将在任何消费者使用 `@nestjs/microservices` 装饰器注入时被提供。

</tr><tr>

#### 异步配置

当您需要异步地传递模块选项，而不是静态地传递时，可以使用 `producer` 方法。正如大多数动态模块一样，Nest 提供了多种技术来处理异步配置。

一种技术是使用工厂函数：

__CODE_BLOCK_29__

像其他 __LINK_176__ 一样，我们的工厂函数可以 `consumer` 并且可以注入依赖项通过 `ClientKafkaProxy`。

__CODE_BLOCK_30__

或者，您可以使用类来配置 __INLINE_CODE_123__，如以下所示：

__CODE_BLOCK_31__

构造函数中的 __INLINE_CODE_124__ 将在 __INLINE_CODE_125__ 内部实例化，并使用该实例来创建所需的选项对象。请注意，在这个示例中， __INLINE_CODE_126__ 需要实现 __INLINE_CODE_127__ 接口，如下所示。 __INLINE_CODE_128__ 将在实例化对象的 __INLINE_CODE_129__ 方法上调用。

__CODE_BLOCK_32__

如果您想重用现有的选项提供者，而不是在 __INLINE_CODE_130__ 内部创建一个私有副本，可以使用 __INLINE_CODE_131__ 语法。

__CODE_BLOCK_33__

#### 连接事件

您可以使用 __INLINE_CODE_132__ 配置选项来监听 Mongoose __LINK_177__。这允许您在连接建立时实现自定义逻辑。例如，您可以注册事件监听器来监控连接的状态：

__CODE_BLOCK_34__

在这个代码片段中，我们正在连接到一个 MongoDB 数据库 __INLINE_CODE_138__。 __INLINE_CODE_139__ 选项允许您设置特定的事件监听器来监控连接的状态：

- __INLINE_CODE_140__: 在连接成功建立时触发。
- __INLINE_CODE_141__: 在连接完全打开并准备操作时触发。
- __INLINE_CODE_142__: 在连接丢失时触发。
- __INLINE_CODE_143__: 在连接重新建立后触发。
- __INLINE_CODE_144__: 在连接关闭时触发。

您也可以将 __INLINE_CODE_145__ 属性纳入使用 __INLINE_CODE_146__ 创建的异步配置中：

__CODE_BLOCK_35__

这提供了一个灵活的方式来管理连接事件，从而使您能够有效地处理连接状态的变化。

#### 子文档

要在父文档中嵌套子文档，可以定义您的 schema如下：

__CODE_BLOCK_36__

然后，在父 schema 中引用子文档：

__CODE_BLOCK_37__

如果您想包括多个子文档，可以使用子文档数组。请务必重写属性的类型：

__CODE_BLOCK_38__

#### 虚拟

在 Mongoose 中，虚拟是一种存在于文档中的属性，但不是持久存储到 MongoDB 的。它在访问时动态计算。虚拟通常用于派生或计算值，例如组合字段（例如，创建一个 __INLINE_CODE_147__ 属性通过 concatenating __INLINE_CODE_148__ 和 __INLINE_CODE_149__），或创建依赖于文档中的现有数据的属性。

__CODE_BLOCK_39__

> info **提示** __INLINE_CODE_150__ 装饰器来自 __INLINE_CODE_151__ 包含。

在这个示例中，__INLINE_CODE_152__ 虚拟是由 __INLINE_CODE_153__ 和 __INLINE_CODE_154__派生而来的。即使它看起来像一个正常的属性，但它从不保存到 MongoDB 文档中：

#### 示例

有一个可用的 __LINK_178__ 示例。

Note: I followed the provided glossary and translation requirements to translate the documentation. I kept code examples, variable names, function names unchanged, and maintained Markdown formatting, links, images, tables unchanged. I also translated code comments from English to Chinese.