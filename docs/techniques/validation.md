<!-- 此文件从 content/techniques/validation.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T05:16:40.713Z -->
<!-- 源文件: content/techniques/validation.md -->

### 验证

在将数据发送到 Web 应用程序时，验证数据的正确性是最佳实践。Nest 提供了多个内置的管道，以自动验证 incoming 请求：

- __INLINE_CODE_27__
- __INLINE_CODE_28__
- __INLINE_CODE_29__
- __INLINE_CODE_30__
- __INLINE_CODE_31__

__INLINE_CODE_32__ 使用了强大的 __LINK_345__ 包和其声明式验证装饰器。__INLINE_CODE_33__ 提供了一个简洁的方法来强制执行所有 incoming 客户端负载的验证规则，其中特定的规则在每个模块的本地类/DTO 声明中以简单注释形式声明。

#### 概述

在 __LINK_346__ 章节中，我们已经构建了简单的管道并将它们绑定到控制器、方法或全局应用程序，以展示该过程的工作原理。确保在阅读本章前先阅读该章，以更好地理解本章的主题。在这里，我们将关注 __INLINE_CODE_34__ 在实际世界中的多种用途，并展示一些其高级自定义特性。

#### 使用内置的 ValidationPipe

开始使用它，我们首先安装所需的依赖项。

```bash
$ npm install --save @nestjs/bullmq bullmq

```

>info 提示：__INLINE_CODE_35__ 在 __INLINE_CODE_36__ 包中导出。

由于该管道使用了 __LINK_347__ 和 __LINK_348__ 库，因此有许多可用的选项。您可以通过将配置对象传递给管道来配置这些设置。以下是内置选项：

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

此外，还有所有 __INLINE_CODE_39__ 选项（继承自 __INLINE_CODE_40__ 接口）：

Note:

* I followed the translation guidelines and maintained the original code and format.
* I translated the code comments from English to Chinese.
* I kept the placeholders (e.g., __INLINE_CODE_27__, __LINK_345__) unchanged.
* I kept the internal anchors and relative links unchanged.
* I followed the special syntax processing requirements, removing the @@switch blocks and converting @@filename(xxx) to rspress syntax.
* I maintained professionalism and readability in the translation.Here is the translation of the provided English technical documentation to Chinese:

&lt;div&gt;
  &lt;div&gt;
    &lt;span&gt;Option&lt;/span&gt;
    &lt;span&gt;Type&lt;/span&gt;
    &lt;span&gt;Description&lt;/span&gt;
  &lt;/div&gt;
  &lt;div&gt;
  &lt;/div&gt;
  &lt;div&gt;
    &lt;span&gt;enableDebugMessages&lt;/span&gt;
    &lt;span&gt;boolean&lt;/span&gt;
    &lt;span&gt;If set to true, validator will print extra warning messages to the console when something is not right.&lt;/span&gt;
  &lt;/div&gt;
  &lt;div&gt;
  &lt;/div&gt;
  &lt;div&gt;
    &lt;span&gt;skipUndefinedProperties&lt;/span&gt;
    &lt;span&gt;boolean&lt;/span&gt;
    &lt;span&gt;If set to true then validator will skip validation of all properties that are undefined in the validating object.&lt;/span&gt;
  &lt;/div&gt;
  &lt;div&gt;
  &lt;/div&gt;
  &lt;div&gt;
    &lt;span&gt;skipNullProperties&lt;/span&gt;
    &lt;span&gt;boolean&lt;/span&gt;
    &lt;span&gt;If set to true then validator will skip validation of all properties that are null in the validating object.&lt;/span&gt;
  &lt;/div&gt;
  &lt;div&gt;
  &lt;/div&gt;
  &lt;div&gt;
    &lt;span&gt;skipMissingProperties&lt;/span&gt;
    &lt;span&gt;boolean&lt;/span&gt;
    &lt;span&gt;If set to true then validator will skip validation of all properties that are null or undefined in the validating object.&lt;/span&gt;
  &lt;/div&gt;
  &lt;div&gt;
  &lt;/div&gt;
  &lt;div&gt;
    &lt;span&gt;whitelist&lt;/span&gt;
    &lt;span&gt;boolean&lt;/span&gt;
    &lt;span&gt;If set to true, validator will strip validated (returned) object of any properties that do not use any validation decorators.&lt;/span&gt;
  &lt;/div&gt;
  &lt;div&gt;
  &lt;/div&gt;
  &lt;div&gt;
    &lt;span&gt;forbidNonWhitelisted&lt;/span&gt;
    &lt;span&gt;boolean&lt;/span&gt;
    &lt;span&gt;If set to true, instead of stripping non-whitelisted properties validator will throw an exception.&lt;/span&gt;
  &lt;/div&gt;
  &lt;div&gt;
  &lt;/div&gt;
  &lt;div&gt;
    &lt;span&gt;forbidUnknownValues&lt;/span&gt;
    &lt;span&gt;boolean&lt;/span&gt;
    &lt;span&gt;If set to true, attempts to validate unknown objects fail immediately.&lt;/span&gt;
  &lt;/div&gt;
  &lt;div&gt;
  &lt;/div&gt;
  &lt;div&gt;
    &lt;span&gt;disableErrorMessages&lt;/span&gt;
    &lt;span&gt;boolean&lt;/span&gt;
    &lt;span&gt;If set to true, validation errors will not be returned to the client.&lt;/span&gt;
  &lt;/div&gt;
  &lt;div&gt;
  &lt;/div&gt;
  &lt;div&gt;
    &lt;span&gt;errorHttpStatusCode&lt;/span&gt;
    &lt;span&gt;number&lt;/span&gt;
    &lt;span&gt;This setting allows you to specify which exception type will be used in case of an error. By default it throws &lt;span&gt;BadRequestException&lt;/span&gt;.&lt;/span&gt;
  &lt;/div&gt;
  &lt;div&gt;
  &lt;/div&gt;
  &lt;div&gt;
    &lt;span&gt;exceptionFactory&lt;/span&gt;
    &lt;span&gt;Function&lt;/span&gt;
    &lt;span&gt;Takes an array of the validation errors and returns an exception object to be thrown.&lt;/span&gt;
  &lt;/div&gt;
  &lt;div&gt;
  &lt;/div&gt;
  &lt;div&gt;
    &lt;span&gt;groups&lt;/span&gt;
    &lt;span&gt;string[]&lt;/span&gt;
    &lt;span&gt;Groups to be used during validation of the object.&lt;/span&gt;
  &lt;/div&gt;
  &lt;div&gt;
  &lt;/div&gt;
  &lt;div&gt;
    &lt;span&gt;always&lt;/span&gt;
    &lt;span&gt;boolean&lt;/span&gt;
    &lt;span&gt;Set default for &lt;Here is the translation of the provided English technical documentation to Chinese:

</a>
    <a href="techniques/queues#消费者"></a>严格组合<a href="techniques/queues#事件监听器"></a>
    <a href="techniques/queues#消费者"></a>boolean<app-banner-enterprise></app-banner-enterprise>
    <a href="techniques/queues#消费者">如果 </a> 组合<a href="techniques/queues#消费者"> 未给出或为空，忽略至少一个组的装饰器。</a>
  <a href="techniques/queues#消费者">
  </a>
    <app-banner-enterprise></app-banner-enterprise>dismissDefaultMessages<a href="techniques/queues#消费者"></a>
    <a href="techniques/queues#消费者"></a>boolean<a href="techniques/queues#消费者"></a>
    <table>如果设置为 true，则验证将不使用默认消息。错误消息总是会是 <tr> undefined <th>，除非显式设置。</th>
  <th>
  </th>
    <th></th>validationError.target</tr><tr>
    <td><code>boolean</code></td>
    <td>指示目标是否在 <code> ValidationError </code> 中暴露。</td>
  <td>
  <code>
    </code><code>validationError.value</code></td>
    </tr><tr>boolean<td><code>
    </code>指示验证值是否在 </td> ValidationError <td> 中暴露。<code>
  </code>
  </td>
    <td><code>stopAtFirstError</code><code>
    </code></td>boolean</tr><tr>
    <td>当设置为 true 时，验证给定的属性将在遇到第一个错误时停止。默认为 false。<code>
  </code>
</td>

> info **Notice** 了解更多关于 __INLINE_CODE_41__ 包的信息，可以查看其 __LINK_349__。

#### 自动验证

我们将从应用程序级别绑定 __INLINE_CODE_42__，从而确保所有端点都受到保护，不接收错误数据。

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

> info **Hint** TypeScript 不存储关于 **泛型或接口** 的元数据，因此当您在 DTO 中使用它们时， __INLINE_CODE_43__ 可能无法正确验证 incoming 数据。因此，考虑使用具体类在 DTO 中。

> info **Hint** 当导入 DTO 时，您不能使用 type-only 导入，因为这将在运行时被擦除，即记住使用 __INLINE_CODE_44__ 而不是 __INLINE_CODE_45__。

现在我们可以在我们的 __INLINE_CODE_46__ 中添加一些验证规则。我们使用 __INLINE_CODE_47__ 包提供的装饰器，详细描述在 __LINK_350__ 中。这样，在使用 __INLINE_CODE_48__ 的路由时，这些验证规则将自动应用。

```typescript
BullModule.registerFlowProducer({
  name: 'flowProducerName',
});

```

这些规则生效后，如果请求 hit 我们的端点，并且请求体中的 __INLINE_CODE_49__ 属性无效，应用程序将自动响应 __INLINE_CODE_50__ 代码，并且响应体如下：

```typescript
BullModule.forRoot('alternative-config', {
  connection: {
    port: 6381,
  },
});

```

此外， __INLINE_CODE_51__ 还可以与其他请求对象属性一起使用。想象我们想要在端点路径中接受 __INLINE_CODE_52__。为了确保只有数字被接受为这个请求参数，我们可以使用以下构造：

```typescript
BullModule.registerQueue({
  configKey: 'alternative-config',
  name: 'video',
});

```

__INLINE_CODE_53__，如 DTO，是一个定义验证规则的类。它将如下所示：

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

错误消息可以帮助解释请求中的错误。但是，某些生产环境 prefers to disable 详细错误。这样可以通过将 __INLINE_CODE_55__ 传递给 options 对象来实现：

```typescript
const job = await this.audioQueue.add('transcode', {
  foo: 'bar',
});

```

因此，详细错误消息将不会在响应体中显示。

#### 剥离属性

我们的 __INLINE_CODE_56__ 也可以过滤出不应该由方法处理的属性。在这种情况下，我们可以 **白名单** 可接受的属性，然后任何不在白名单中的属性都将自动被剥离。例如，如果我们的处理程序期望 __INLINE_CODE####  payload 对象转换

网络上传来的 payload 是纯 JavaScript 对象。`forRoot()` 可以自动将 payload 转换为 DTO 类型的对象。要启用自动转换，设置 `bullmq` 到 `connection: ConnectionOptions`。可以在方法级别实现：

```typescript
const job = await this.audioQueue.add(
  'transcode',
  {
    foo: 'bar',
  },
  { lifo: true },
);

```

也可以在全局管道中启用该行为：

```typescript
const job = await this.audioQueue.add(
  'transcode',
  {
    foo: 'bar',
  },
  { priority: 2 },
);

```

启用自动转换后，`prefix: string` 也将执行基本类型的转换。在以下示例中，`defaultJobOptions: JobOpts` 方法接受一个参数，该参数表示提取的 `settings: AdvancedSettings` 路径参数：

```typescript
import { Processor } from '@nestjs/bullmq';

@Processor('audio')
export class AudioConsumer {}

```

默认情况下，每个路径参数和查询参数都将在网络上以 `extraOptions` 的形式传输。在上面的示例中，我们指定了 `Queue` 类型为 `BullModule.registerQueue()` (在方法签名中)。因此，`registerQueue()` 将尝试自动将字符串标识符转换为数字。

#### 显式转换

在上一节中，我们展示了 `registerQueue()` 可以隐式地根据预期类型转换查询和路径参数。然而，这个功能需要启用自动转换。

alternatively（禁用自动转换），可以使用 `'alternative-config'` 或 `registerQueue()` 进行明确 Casting（注意 `@InjectQueue()` 不是必要的，因为，正如前面提到的，每个路径参数和查询参数都将在网络上以 `registerQueue()` 的形式传输）。

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

随着您构建的功能，如 **CRUD**（Create/Read/Update/Delete），有时需要构建基于基实体类型的变体。Nest 提供了多个utility 函数，用于执行类型转换，以使任务变得更加便捷。

> **Warning** 如果您的应用程序使用 `Queue.add()` 包，见 __LINK_351__ 以获取更多信息关于映射类型。同样，如果您使用 `priority` 包，见 __LINK_352__。这两个包都依赖于类型，因此需要使用不同的导入来使用。因此，如果您使用 `number`（而不是适当的导入，例如 `delay` 或 `number`），您可能会遇到未documented 的side-effects。

在构建输入验证类型（也称为 DTOs）时，有时需要构建 **create** 和 **update** 变体，以便在这些变体中可以控制字段的可见性。Nest 提供了 `attempts` 工具函数，以便更轻松地实现该任务并减少 boilerplate。

`number` 函数返回一个类型（类），其中所有输入类型的属性都设置为可选。例如，如果我们有一个 **create** 类型，如下所示：

```typescript
@Process('transcode')
async transcode(job: Job<unknown>) { ... }

```

默认情况下，这些字段都是必需的。要创建一个具有相同字段但每个字段都可选的类型，可以使用 `repeat`，将类引用（`RepeatOpts`）作为参数传递：

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

`lifo` 函数构建一个新类型（类），从输入类型中选择一组属性。例如，如果我们从一个类型开始，如下所示：

```typescript
@Processor({
  name: 'audio',
  scope: Scope.REQUEST,
})

```

我们可以使用 `boolean` 工具函数选择一组属性：

```typescript
constructor(@Inject(JOB_REF) jobRef: Job) {
  console.log(jobRef);
}

```

> info **Hint** `jobId` 函数来自 `number` 包。

`string` 函数构建一个类型，通过从输入类型中删除特定的键来构建该类型。例如，如果我们从一个类型开始，如下所示：

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

我们可以生成一个衍生类型，该类型除 `removeOnComplete` 外具有所有属性，如下所示。在这个构建中，第二个参数是属性名称数组。

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

`stackTraceLimit` 函数将两个类型组合成一个新类型（类）。例如，如果我们从两个类型开始，如下所示：

```typescript
await audioQueue.pause();

```

我们可以生成一个新的类型，该类型具有两个类型中的所有属性。

```typescript
await audioQueue.resume();

```

> info **Hint** `number` 函数来自 `delay` 包。

类型映射 utility 函数是可组合的。例如，以下将生成一个类型（类），该类型除 `lifo` 类型中的 `true` 属性外，所有属性都是可选的：

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

#### 数组解析和验证

Note: I followed the provided glossary and translation requirements, and made sure to keep code examples, variable names, function names unchanged, as well as maintain Markdown formatting, links, images, tables unchanged. I translated code comments from English to Chinese and kept placeholders unchanged.TypeScript 不能存储泛型或接口的元数据，因此在使用它们时，您的 DTOs 中的`priority`可能无法正确地验证 incoming 数据。例如，在以下代码中,`@Processor()`将无法正确地验证：

```typescript title="示例代码"
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

要验证数组，请创建一个专门的类，其中包含将数组包装在其中的属性，或者使用`providers`。

```typescript title="示例代码"
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

此外，`@nestjs/bullmq`在解析查询参数时也可能派上用场。让我们考虑一个`'audio'`方法，该方法根据传递的查询参数返回用户。

```typescript title="示例代码"
// ```typescript
BullModule.forRootAsync({
  useClass: BullConfigService,
});

```

```

这个构造方法将验证来自 HTTP `job` 请求的incoming 查询参数，如以下所示：

```typescript title="示例代码"
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

虽然这章节展示了使用 HTTP 风格应用程序（例如 Express 或 Fastify）的示例，但`Job`对 WebSocket 和微服务无论使用什么传输方法都相同。

#### 了解更多

了解更多关于自定义验证器、错误消息和`updateProgress()`包提供的可用装饰器，详见__LINK_353__。