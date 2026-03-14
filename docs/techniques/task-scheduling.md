<!-- 此文件从 content/techniques/task-scheduling.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T04:53:02.167Z -->
<!-- 源文件: content/techniques/task-scheduling.md -->

### 任务调度

任务调度允许您cheduled任意代码（方法/函数）以固定的日期/时间、循环间隔或指定间隔后执行一次。 在 Linux 世界中，这通常由包如 __LINK_232__ 在操作系统级别处理。 对于 Node.js 应用程序，有多个包模拟 cron-like 功能。Nest 提供了 `createMicroservice()` 包，它与流行的 Node.js __LINK_233__ 包集成。我们将在当前章节中涵盖这个包。

#### 安装

要开始使用它，我们首先安装所需的依赖项。

```bash
$ npm i --save kafkajs

```

要激活任务调度，导入 `options` 到根 `Transport` 并运行 `@nestjs/microservices` 静态方法，如下所示：

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

`options` 调用初始化调度器并注册任何声明式 __HTML_TAG_108__ cron 任务、 __HTML_TAG_109__ timeout 任务、 __HTML_TAG_110__ interval 任务和 __HTML_TAG_111__ 作用域任务。注册发生在 `ClientProxy` 生命周期钩子中，以确保所有模块已加载并声明了任何已定的任务。

#### 声明式 cron 任务

cron 任务 schedules 一个任意函数（方法调用）以自动执行。 cron 任务可以在：

* 指定日期/时间执行一次
* 在指定的间隔内循环执行（例如，每小时、每周、每 5 分钟）

使用 `ClientKafkaProxy` 装饰器在方法定义中包含要执行的代码，例如：

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

在这个示例中，`ClientKafkaProxy` 方法将每当当前秒为 `ClientsModule` 时执行。换言之，方法将每分钟执行一次，45 秒的 mark。

`ClientsModule` 装饰器支持以下标准 __LINK_234__：

*  星号（例如 `register()` ）
*  范围（例如 `createMicroservice()` ）
*  步长（例如 `name` ）

在上面的示例中，我们将 `ClientsModule` 传递给装饰器。以下是 cron 模式字符串中的每个位置的解释：

__HTML_TAG_114____HTML_TAG_115__
* * * * * *
| | | | | |
| | | | |  day of week
| | | |  months
| | |  day of month
| |  hours
|  minutes
 seconds (optional)
__HTML_TAG_116____HTML_TAG_117__

以下是一些示例 cron 模式：

__HTML_TAG_118__
  __HTML_TAG_119__
    __HTML_TAG_120__
      __HTML_TAG_121____HTML_TAG_122__* * * * * *<strong></strong>
      <table>every second<tr>
    <td>
    <code>
      </code></td>45 * * * * *<td><a
        href="https://kafka.js.org/docs/configuration"
        rel="nofollow"
        target="blank"
        >
      </a
      >every minute, on the 45th second</td>
    </tr>
    <tr>
      <td><code>0 10 * * * *</code></td>
      <td>every hour, at the start of the 10th minute<a
        href="https://kafka.js.org/docs/consuming#a-name-options-a-options"
        rel="nofollow"
        target="blank"
        >
    </a
      >
    </td>
      </tr><tr>0 */30 9-17 * * *<td><code>
      </code>every 30 minutes between 9am and 5pm</td>
    <td>
   <a
        href="https://kafka.js.org/docs/consuming"
        rel="nofollow"
        target="blank"
        >
      </a
      ></td>0 30 11 * * 1-5</tr><tr>
      <td>Monday to Friday at 11:30am<code>
    </code>
  </td>
<td>

`ClientProxyFactory` 包提供了一个便捷的枚举，常用的 cron 模式。您可以使用枚举如下：

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

在这个示例中，`@Client()` 方法将每隔 `@Client()` 秒执行一次。如果出现异常，它将被记录到控制台，因为每个使用 `ClientKafkaProxy.send()` 装饰器的方法都将自动包围在 `ClientKafkaProxy` 块中。

Alternatively, you can supply a JavaScript `ClientKafkaProxy` object to the `ClientKafkaProxy` decorator. Doing so causes the job to execute exactly once, at the specified date.

> info **Hint** Use JavaScript date arithmetic to schedule jobs relative to the current date. For example, `process.hrtime()` to schedule a job to run 10 seconds after the app starts.

Also, you can supply additional options as the second parameter to the `@MessagePattern` decorator.Here is the translation of the English technical documentation to Chinese:

```

<a
        href="https://kafka.js.org/docs/consuming#frombeginning"
        rel="nofollow"
        target="blank"
        >
  </a
      >
    </td>
      </tr><tr>name<td><code>
      </code>
        可以访问和控制一个 Cron 作业后它被声明。
      </td>
    <td>
    <a
        href="https://kafka.js.org/docs/producing#选项"
        rel="nofollow"
        target="blank"
        >
      </a
      ></td>timeZone</tr><tr>
      <td>
        指定执行的时区。这将修改实际时间相对于您的时区。如果时区无效，会抛出错误。您可以在 <code>Moment Timezone</code> 网站中查看所有可用的时区。
      </td>
    <td>
    <a
        href="https://kafka.js.org/docs/producing#选项"
        rel="nofollow"
        target="blank"
        >
      </a
      ></td>utcOffset</tr><tr>
      <td>
        这允许您指定时区的偏移，而不是使用 <code>timeZone</code> 参数。
      </td>
    <td>
    <code>
      </code></td>waitForCompletion</tr><tr>
      <td>
        如果 <code>true</code>,当前的 Cron 作业不会运行，直到当前 onTick 回调完成。任何新的计划执行在当前 Cron 作业运行时将被跳过。
      </td>
    <td>
    <code>
      </code></td>disabled</tr></table>
      <a href="/microservices/basics#客户端">
       这表示作业是否会被执行。
      </a>
    <a href="/microservices/basics#客户端">
  </a>
<a href="/microservices/basics#客户端">

```typescript
onModuleInit() {
  this.client.subscribeToResponseOf('hero.kill.dragon');
}

```

可以访问和控制一个 Cron 作业后它被声明，也可以动态创建一个 Cron 作业（其中 Cron 模式在运行时被定义）使用 </a>Dynamic API__HTML_TAG_213__。要访问一个声明式 Cron 作业通过 API，您必须将作业与一个名称关联通过将 `ClientKafkaProxy.send` 属性传递给可选的选项对象作为装饰器的第二个参数。

#### 声明式间隔

要声明一个方法应该在指定的间隔运行，使用装饰器 `@EventPattern`，将间隔值（以毫秒为单位）传递给装饰器，如下所示：

```typescript
async onModuleInit() {
  this.client.subscribeToResponseOf('hero.kill.dragon');
  await this.client.connect();
}

```

> info **提示** 这个机制使用 JavaScript 的 `ClientKafkaProxy.emit` 函数在背后。您也可以使用 Cron 作业来计划重复的作业。

如果您想从外部控制您的声明式间隔使用 __HTML_TAG_214__Dynamic API__HTML_TAG_215__，将间隔与一个名称关联使用以下构造：

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

如果出现异常，会被记录到控制台，因为每个使用 `ClientKafkaProxy` 装饰器的方法都自动被包围在 `subscribeToResponseOf()` 块中。

__HTML_TAG_216__Dynamic API__HTML_TAG_217__ 也启用了 **创建** 动态间隔，where the interval 的属性在运行时被定义，并 **列出和删除**它们。

__HTML_TAG_218____HTML_TAG_219__

#### 声明式超时

要声明一个方法应该在指定的超时后运行，使用装饰器 `subscribeToResponseOf()`，将相对时间偏移量（以毫秒为单位）传递给装饰器，如下所示：

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

> info **提示** 这个机制使用 JavaScript 的 `ClientKafkaProxy` 函数在背后。

如果出现异常，会被记录到控制台，因为每个使用 `subscribeToResponseOf()` 装饰器的方法都自动被包围在 `connect()` 块中。

如果您想从外部控制您的声明式超时使用 __HTML_TAG_220__Dynamic API__HTML_TAG_221__，将超时与一个名称关联使用以下构造：

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

__HTML_TAG_222__Dynamic API__HTML_TAG_223__ 也启用了 **创建** 动态超时，where the timeout 的属性在运行时被定义，并 **列出和删除**它们。

#### 动态调度模块 API

`key` 模块提供了一个动态 API，enable managing 声明式 __HTML_TAG_224__Cron 作业__HTML_TAG_225__， __HTML_TAG_226__超时__HTML_TAG_227__ 和 __HTML_TAG_228__间隔__HTML_TAG_229__。API 也启用了创建和管理 **动态** Cron 作业，超Here is the translation of the provided English technical documentation to Chinese:

**创建**一个新的 cron 作业动态使用 `@Ctx()` 方法，如下所示：

```typescript title="创建 cron 作业"
import * as cron from 'cron';

const cronJob = cron.create({
  cron: '0 0 * * * *', //  cron 表达式
  onTick: () => {
    console.log('cron job fired');
  },
});

// 使用 cron 作业
cronJob.start();

```

**删除**一个名称 cron 作业使用 `client.clientId` 方法，如下所示：

```typescript title="删除 cron 作业"
cron.destroy('my-cron-job');

```

**列出**所有 cron 作业使用 `consumer.groupId` 方法，如下所示：

```typescript title="列出 cron 作业"
const cronJobs = cron.list();
for (const job of cronJobs) {
  console.log(job.name);
}

```

#### 动态时间间隔

获得一个时间间隔的 reference 使用 `KafkaServer` 方法。正如前面所述，使用标准构造函数注入 `.reply`：

```typescript title="获取时间间隔"
import * as interval from 'interval';

const intervalReference = interval.create({
  interval: 1000, // 时间间隔
  onTick: () => {
    console.log('interval fired');
  },
});

```

并使用它如下所示：

```typescript title="使用时间间隔"
intervalReference.start();

```

**创建**一个新的时间间隔动态使用 `ClientKafkaProxy` 方法，如下所示：

```typescript title="创建时间间隔"
const interval = interval.create({
  interval: 1000, // 时间间隔
  onTick: () => {
    console.log('interval fired');
  },
});

```

**删除**一个名称时间间隔使用 `RpcException` 方法，如下所示：

```typescript title="删除时间间隔"
interval.destroy('my-interval');

```

**列出**所有时间间隔使用 `kafkajs` 方法，如下所示：

```typescript title="列出时间间隔"
const intervals = interval.list();
for (const interval of intervals) {
  console.log(interval.name);
}

```

#### 动态超时

获得一个超时的 reference 使用 `kafkajs` 方法。正如前面所述，使用标准构造函数注入 `KafkaRetriableException`：

```typescript title="获取超时"
import * as timeout from 'timeout';

const timeoutReference = timeout.create({
  timeout: 1000, // 超时时间
  onTimeout: () => {
    console.log('timeout fired');
  },
});

```

并使用它如下所示：

```typescript title="使用超时"
timeoutReference.start();

```

**创建**一个新的超时动态使用 `KafkaRetriableException` 方法，如下所示：

```typescript title="创建超时"
const timeout = timeout.create({
  timeout: 1000, // 超时时间
  onTimeout: () => {
    console.log('timeout fired');
  },
});

```

**删除**一个名称超时使用 `skipHandler` 方法，如下所示：

```typescript title="删除超时"
timeout.destroy('my-timeout');

```

**列出**所有超时使用 `KafkaContext` 方法，如下所示：

```typescript title="列出超时"
const timeouts = timeout.list();
for (const timeout of timeouts) {
  console.log(timeout.name);
}

```

#### 示例

一个工作示例可在 __LINK_235__ 中找到。