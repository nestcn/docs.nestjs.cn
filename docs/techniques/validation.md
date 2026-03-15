<!-- 此文件从 content/techniques/validation.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T05:20:08.032Z -->
<!-- 源文件: content/techniques/validation.md -->

### Validation

Nest 提供了多个内置的管道，以自动验证 Web 应用程序接收到的数据。为了验证 incoming 请求，Nest 提供了以下管道：

- __INLINE_CODE_27__
- __INLINE_CODE_28__
- __INLINE_CODE_29__
- __INLINE_CODE_30__
- __INLINE_CODE_31__

__INLINE_CODE_32__ 使用了强大的 __LINK_345__ 包和它的声明式验证装饰器。 __INLINE_CODE_33__ 提供了一个便捷的方法，用于为所有 incoming 客户端负载强制实施验证规则，其中规则以简单注释在每个模块中的本地类/DTO 声明中声明。

#### 概述

在 __LINK_346__ 章节中，我们已经介绍了简单的 pipe 和将其绑定到控制器、方法或全局应用程序的过程，以便更好地理解本章的主题。在这里，我们将关注 __INLINE_CODE_34__ 的多种实际应用场景，并展示一些高级自定义特性。

#### 使用内置的 ValidationPipe

首先，我们需要安装所需的依赖项。

```bash
$ npm install --save @nestjs/bullmq bullmq

```

> 提示 **Hint** __INLINE_CODE_35__ 是来自 __INLINE_CODE_36__ 包的导出。

由于这个管道使用了 __LINK_347__ 和 __LINK_348__ 库，因此有许多可选项。这些设置可以通过传递给管道的配置对象来配置。以下是内置选项：

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

此外，所有 __INLINE_CODE_39__ 选项（来自 __INLINE_CODE_40__ 接口）都可用：

（Note: I have translated the content according to the provided glossary and technical terms. I have also kept the code examples and formatting unchanged. I have removed the @@switch blocks and content after them, and converted @@filename(xxx) to rspress syntax. I have kept internal anchors unchanged and relative links as-is. Let me know if there's anything else I can help you with!)&lt;h2&gt;__HTML_TAG_118__&lt;/h2&gt;

&lt;p&gt;__HTML_TAG_119__ __HTML_TAG_123__&lt;/p&gt;

&lt;p&gt;__HTML_TAG_125__&lt;/p&gt;

&lt;p&gt;__HTML_TAG_126__&lt;/p&gt;

&lt;ol&gt;
  &lt;li&gt;&lt;p&gt;__HTML_TAG_127__:&lt;/p&gt;
    &lt;ul&gt;
      &lt;li&gt;&lt;p&gt;__HTML_TAG_131__:&lt;/p&gt;&lt;/li&gt;
      &lt;li&gt;&lt;p&gt;__HTML_TAG_135__&lt;/p&gt;&lt;/li&gt;
    &lt;/ul&gt;&lt;/li&gt;
&lt;/ol&gt;

&lt;p&gt;__HTML_TAG_137__&lt;/p&gt;

&lt;ol&gt;
  &lt;li&gt;&lt;p&gt;__HTML_TAG_139__:&lt;/p&gt;
    &lt;ul&gt;
      &lt;li&gt;&lt;p&gt;__HTML_TAG_143__:&lt;/p&gt;&lt;/li&gt;
      &lt;li&gt;&lt;p&gt;__HTML_TAG_147__&lt;/p&gt;&lt;/li&gt;
    &lt;/ul&gt;&lt;/li&gt;
&lt;/ol&gt;

&lt;p&gt;__HTML_TAG_149__&lt;/p&gt;

&lt;ol&gt;
  &lt;li&gt;&lt;p&gt;__HTML_TAG_151__:&lt;/p&gt;
    &lt;ul&gt;
      &lt;li&gt;&lt;p&gt;__HTML_TAG_155__:&lt;/p&gt;&lt;/li&gt;
      &lt;li&gt;&lt;p&gt;__HTML_TAG_159__&lt;/p&gt;&lt;/li&gt;
    &lt;/ul&gt;&lt;/li&gt;
&lt;/ol&gt;

&lt;p&gt;__HTML_TAG_161__&lt;/p&gt;

&lt;ol&gt;
  &lt;li&gt;&lt;p&gt;__HTML_TAG_163__:&lt;/p&gt;
    &lt;ul&gt;
      &lt;li&gt;&lt;p&gt;__HTML_TAG_167__:&lt;/p&gt;&lt;/li&gt;
      &lt;li&gt;&lt;p&gt;__HTML_TAG_171__&lt;/p&gt;&lt;/li&gt;
    &lt;/ul&gt;&lt;/li&gt;
&lt;/ol&gt;

&lt;p&gt;__HTML_TAG_173__&lt;/p&gt;

&lt;ol&gt;
  &lt;li&gt;&lt;p&gt;__HTML_TAG_175__:&lt;/p&gt;
    &lt;ul&gt;
      &lt;li&gt;&lt;p&gt;__HTML_TAG_179__:&lt;/p&gt;&lt;/li&gt;
      &lt;li&gt;&lt;p&gt;__HTML_TAG_183__&lt;/p&gt;&lt;/li&gt;
    &lt;/ul&gt;&lt;/li&gt;
&lt;/ol&gt;

&lt;p&gt;__HTML_TAG_185__&lt;/p&gt;

&lt;ol&gt;
  &lt;li&gt;&lt;p&gt;__HTML_TAG_187__:&lt;/p&gt;
    &lt;ul&gt;
      &lt;li&gt;&lt;p&gt;__HTML_TAG_191__:&lt;/p&gt;&lt;/li&gt;
      &lt;li&gt;&lt;p&gt;__HTML_TAG_195__&lt;/p&gt;&lt;/li&gt;
    &lt;/ul&gt;&lt;/li&gt;
&lt;/ol&gt;

&lt;p&gt;__HTML_TAG_197__&lt;/p&gt;

&lt;ol&gt;
  &lt;li&gt;&lt;p&gt;__HTML_TAG_199__:&lt;/p&gt;
    &lt;ul&gt;
      &lt;li&gt;&lt;p&gt;__HTML_TAG_203__:&lt;/p&gt;&lt;/li&gt;
      &lt;li&gt;&lt;p&gt;__HTML_TAG_207__&lt;/p&gt;&lt;/li&gt;
    &lt;/ul&gt;&lt;/li&gt;
&lt;/ol&gt;

&lt;p&gt;__HTML_TAG_209__&lt;/p&gt;

&lt;ol&gt;
  &lt;li&gt;&lt;p&gt;__HTML_TAG_211__:&lt;/p&gt;
    &lt;ul&gt;
      &lt;li&gt;&lt;p&gt;__HTML_TAG_215__:&lt;/p&gt;&lt;/li&gt;
      &lt;li&gt;&lt;p&gt;__HTML_TAG_219__&lt;/p&gt;&lt;/li&gt;
    &lt;/ul&gt;&lt;/li&gt;
&lt;/ol&gt;

&lt;p&gt;__HTML_TAG_221__&lt;/p&gt;

&lt;ol&gt;
  &lt;li&gt;&lt;p&gt;__HTML_TAG_223__:&lt;/p&gt;
    &lt;Here is the translation of the provided English technical documentation to Chinese:

</a>
    <a href="techniques/queues#消费者"></a>严格组组<a href="techniques/queues#事件监听器"></a>
    <a href="techniques/queues#消费者"></a>boolean<app-banner-enterprise></app-banner-enterprise>
    <a href="techniques/queues#消费者">如果 </a> 组组<a href="techniques/queues#消费者"> 没有给出或为空，则忽略至少有一个组的装饰器</a>
  <a href="techniques/queues#消费者">
  </a>
    <app-banner-enterprise></app-banner-enterprise>dismissDefaultMessages<a href="techniques/queues#消费者"></a>
    <a href="techniques/queues#消费者"></a>boolean<a href="techniques/queues#消费者"></a>
    <table>如果设置为 true，验证将不会使用默认消息。错误消息总是将是 <tr> undefined <th>，如果没有明确设置</th>
  <th>
  </th>
    <th></th>validationError.target</tr><tr>
    <td><code>boolean</code></td>
    <td>表示是否将目标暴露在 <code> ValidationError </code> 中</td>
  <td>
  <code>
    </code><code>validationError.value</code></td>
    </tr><tr>boolean<td><code>
    </code>表示是否将验证值暴露在 </td> ValidationError <td> 中<code>
  </code>
  </td>
    <td><code>stopAtFirstError</code><code>
    </code></td>boolean</tr><tr>
    <td>当设置为 true 时，给定属性的验证将在遇到第一个错误时停止。默认值为 false<code>
  </code>
</td>

> info **注意**更多关于 __INLINE_CODE_41__ 包的信息，请查看其 __LINK_349__。

#### 自动验证

我们将开始绑定 __INLINE_CODE_42__，以确保所有端点都受到保护，从而防止接收错误数据。

```typescript
BullModule.registerQueue({
  name: 'audio',
});

```

为了测试我们的管道，让我们创建一个基本端点。

```typescript
BullModule.registerQueue({
  name: 'audio',
  connection: {
    port: 6380,
  },
});

```

> info **提示**由于 TypeScript 不存储关于 **泛型或接口** 的元数据，使用它们在 DTO 中时,__INLINE_CODE_43__ 可能不能正确地验证 incoming 数据。因此，考虑使用具体类在 DTO 中。

> info **提示**在导入 DTO 时，不要使用类型-only 导入，因为那样将被擦除在 runtime 中，i.e.记住使用 __INLINE_CODE_44__ 而不是 __INLINE_CODE_45__。

现在，我们可以在我们的 __INLINE_CODE_46__ 中添加一些验证规则。我们使用 __INLINE_CODE_47__ 提供的装饰器，详细描述在 __LINK_350__ 中。在这种方式下，如果使用 __INLINE_CODE_48__ 的路由，则自动执行这些验证规则。

```typescript
BullModule.registerFlowProducer({
  name: 'flowProducerName',
});

```

这些规则生效后，如果请求体到达我们的端点，并且请求体中包含无效 __INLINE_CODE_49__ 属性，应用程序将自动响应 __INLINE_CODE_50__ 代码，并返回以下响应体：

```typescript
BullModule.forRoot('alternative-config', {
  connection: {
    port: 6381,
  },
});

```

此外，__INLINE_CODE_51__ 可以与其他请求对象属性一起使用。想象我们想要在端点路径中接受 __INLINE_CODE_52__。为了确保只接受数字，可以使用以下构造：

```typescript
BullModule.registerQueue({
  configKey: 'alternative-config',
  name: 'video',
});

```

__INLINE_CODE_53__，像 DTO 一样，是一个定义验证规则的类。它将如下所示：

```typescript
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';

@Injectable()
export class AudioService {
  constructor(@InjectQueue('audio') private audioQueue: Queue) {}
}

```

#### 禁用详细错误

错误消息可以帮助解释请求中有什么错误。然而，一些生产环境可能prefer禁用详细错误。通过将选项对象传递给 __INLINE_CODE_55__，可以实现：

```typescript
const job = await this.audioQueue.add('transcode', {
  foo: 'bar',
});

```

因此，详细错误消息将不再显示在响应体中。

#### 删除属性

我们的 __INLINE_CODE_56__ 也可以过滤掉不应该由方法处理器接收的属性。在这种情况下，我们可以 **白名单** 可以接受的属性，然后将不在白名单中的任何属性自动删除。例如，如果我们的处理器期望 __INLINE_CODE_57__ 和 __INLINE_CODE_58#### 转换 payload 对象

网络上传来的 payloads 是plain JavaScript 对象。`forRoot()` 可以自动将 payloads 转换为根据DTO 类型的对象。要启用自动转换，请将 `bullmq` 设置为 `connection: ConnectionOptions`。这可以在方法级别实现：

```typescript
const job = await this.audioQueue.add(
  'transcode',
  {
    foo: 'bar',
  },
  { lifo: true },
);

```

要在全局管道中启用此行为，请将选项设置为：

```typescript
const job = await this.audioQueue.add(
  'transcode',
  {
    foo: 'bar',
  },
  { priority: 2 },
);

```

启用自动转换后，`prefix: string` 还将对原始类型进行转换。在以下示例中，`defaultJobOptions: JobOpts` 方法接受一个参数，该参数表示提取的 `settings: AdvancedSettings` 路径参数：

```typescript
import { Processor } from '@nestjs/bullmq';

@Processor('audio')
export class AudioConsumer {}

```

默认情况下，每个路径参数和查询参数都将在网络上以 `extraOptions` 的形式传输。在上述示例中，我们指定了 `Queue` 类型为 `BullModule.registerQueue()` (在方法签名中)。因此，`registerQueue()` 将尝试自动将字符串标识符转换为数字。

#### 显式转换

在上一节中，我们展示了`registerQueue()` 可以隐式地根据预期类型转换查询和路径参数。但是，这个功能需要启用自动转换。

Alternatively (在自动转换禁用时)，可以使用`'alternative-config'` 或 `registerQueue()` 显式地将值转换（注意 `@InjectQueue()` 不需要，因为，如前所述，每个路径参数和查询参数都将在网络上以 `registerQueue()` 的形式传输）。

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

> info **Hint** `'audio'` 和 `add()` 是来自 `job` 包的导出。

#### 映射类型

当您构建CRUD（Create/Read/Update/Delete）功能时，通常需要构建基于基元类型的变体。Nest 提供了多个实用函数，用于执行类型转换，以使这项任务更加方便。

> **Warning** 如果您的应用程序使用 `Queue.add()` 包，请查看 __LINK_351__以了解更多关于映射类型的信息。类似地，如果您使用 `priority` 包，请查看 __LINK_352__。这两个包都依赖于类型，因此需要使用不同的导入方式。如果您使用 `number` (而不是适当的导入方式，即 `delay` 或 `number`，取决于您的应用程序类型），您可能会遇到未 documented 的副作用。

在构建输入验证类型（也称为DTOs）时，通常需要构建“create”和“update”变体，以便在同一个类型上。例如，“create”变体可能需要所有字段，而“update”变体可能使所有字段可选。

Nest 提供了 `attempts` 实用函数，用于简化此任务并减少 boilerplate。

`number` 函数返回一个类型（class），其中所有输入类型的属性都设置为可选。例如，如果我们有一个“create”类型如下：

```typescript
@Process('transcode')
async transcode(job: Job<unknown>) { ... }

```

默认情况下，这些字段都是必需的。要创建一个具有相同字段，但每个字段都是可选的类型，请使用 `repeat` 将类引用（`RepeatOpts`）作为参数：

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

> info **Hint** `backoff` 函数来自 `number | BackoffOpts` 包。

`lifo` 函数构建一个新的类型（class），从输入类型中选择一组属性。例如，如果我们从以下类型开始：

```typescript
@Processor({
  name: 'audio',
  scope: Scope.REQUEST,
})

```

我们可以使用 `boolean` 实用函数从该类中选择一组属性：

```typescript
constructor(@Inject(JOB_REF) jobRef: Job) {
  console.log(jobRef);
}

```

> info **Hint** `jobId` 函数来自 `number` 包。

`string` 函数构建一个类型，通过从输入类型中删除特定的键来从输入类型中删除一组键。例如，如果我们从以下类型开始：

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

我们可以生成一个衍生类型，该类型具有除 `removeOnComplete` 外的所有属性。以下 construct 中的第二个参数是数组类型名。

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

> info **Hint** `removeOnFail` 函数来自 `boolean | number` 包。

`stackTraceLimit` 函数将两个类型组合到一个新的类型（class）中。例如，如果我们从以下两个类型开始：

```typescript
await audioQueue.pause();

```

我们可以生成一个新的类型，该类型组合了这两个类型中的所有属性。

```typescript
await audioQueue.resume();

```

> info **Hint** `number` 函数来自 `delay` 包。

类型映射实用函数是可组合的。例如，以下将生成一个类型（class），该类型具有 `lifo` 类型中的所有属性，除了 `true`，并将这些属性设置为可选：

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

#### 解析和验证数组

Note: I followed the provided glossary and terminology to translate the text. I also kept the code examples, variable names, function names unchanged, and maintained Markdown formatting, links, images, tables unchanged. I translated code comments from English to Chinese and kept internal anchors unchanged.TypeScript 不存储关于泛型或接口的元数据，因此当您在 DTO 中使用它们时，`priority`可能无法正确地验证 incoming 数据。例如，在以下代码中，`@Processor()`将不会被正确地验证：

```typescript
// ```typescript
BullModule.forRootAsync({
  useFactory: () => ({
    connection: {
      host: 'localhost',
      port: 6379,
    },
  }),
});

```

```

要验证数组，请创建一个专门的类，其中包含包围数组的属性，或者使用`providers`。

```typescript
// ```typescript
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

```

此外，在解析查询参数时，`@nestjs/bullmq`也可能会很有帮助。让我们考虑一个`'audio'`方法，它根据查询参数中的标识符返回用户。

```typescript
// ```typescript
BullModule.forRootAsync({
  useClass: BullConfigService,
});

```

```

这个构造将验证来自 HTTP `job`请求的 incoming 查询参数，如以下所示：

```typescript
// ```typescript
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

```

#### WebSocket 和微服务

虽然本章展示了使用 HTTP 风格应用程序（如 Express 或 Fastify）的示例，但`Job`对 WebSocket 和微服务无论使用何种传输方法都有效。

#### 了解更多

了解更多关于自定义验证器、错误信息和`updateProgress()`包提供的可用装饰器的信息，请查看 __LINK_353__。

Note: I followed the provided glossary and translation requirements, preserving the code and format, and translating the comments and content as instructed.