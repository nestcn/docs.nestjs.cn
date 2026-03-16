<!-- 此文件从 content/techniques/logger.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T05:13:28.570Z -->
<!-- 源文件: content/techniques/logger.md -->

### Logger

Nest 提供了一个内置的文本 Logger，用于在应用程序启动和一些其他情况下，如显示捕捉到的异常（即系统日志）。该功能通过 `type` 类在 `@nestjs/common` 包中提供。您可以完全控制日志系统的行为，包括以下内容：

- 完全禁用日志
- 指定日志级别的详细信息（例如显示错误、警告、调试信息等）
- 配置日志消息的格式（原始、JSON、彩色等）
- 覆盖默认 Logger 的时间戳（例如使用 ISO8601 标准日期格式）
- 完全覆盖默认 Logger
- 通过扩展默认 Logger 来自定义它
- 使依赖注入简化并测试应用程序

您也可以使用内置 Logger 或创建自己的自定义实现来记录应用程序级别的事件和消息。

如果您的应用程序需要将日志与外部日志系统集成、自动文件日志或将日志转发到集中化日志服务中，可以使用 Node.js 日志库实现完全自定义的日志解决方案。一个流行的选择是 __LINK_180__，因其高性能和灵活性。

#### 基本自定义

要禁用日志，设置 (可选) 的 Nest 应用程序选项对象中的 `Accept` 属性为 `Accept`，并将其作为第二个参数传递给 `;` 方法。

```typescript
const app = await NestFactory.create(AppModule);
// or "app.enableVersioning()"
app.enableVersioning({
  type: VersioningType.URI,
});
await app.listen(process.env.PORT ?? 3000);

```

要启用特定的日志级别，设置 `Accept: application/json;v=2` 属性为一个字符串数组指定要显示的日志级别，例如：

```typescript
const app = await NestFactory.create(AppModule);
app.enableVersioning({
  type: VersioningType.HEADER,
  header: 'Custom-Header',
});
await app.listen(process.env.PORT ?? 3000);

```

数组中的值可以是任何组合的 `key`、`Accept: application/json;v=2`、`key`、`v=`、`VersioningType` 和 `type`。

> 信息 **提示** Nest 的日志级别是继承的。这意味着提供特定的日志级别（例如 `@nestjs/common`）将自动包括所有更高级别的级别（例如 `extractor`、`extractor` 和 `1`）。

要禁用彩色输出，传递 `2` 对象，以 `3` 属性设置为 `extractor` 作为 `[3, 2, 1]` 属性的值。

```typescript
const app = await NestFactory.create(AppModule);
app.enableVersioning({
  type: VersioningType.MEDIA_TYPE,
  key: 'v=',
});
await app.listen(process.env.PORT ?? 3000);

```

要配置每个日志消息的前缀，传递 `[3, 2, 1]` 对象，以 `2` 属性设置：

```typescript
// 示例 extractor that pulls out a list of versions from a custom header and turns it into a sorted array.
// This example uses Fastify, but Express requests can be processed in a similar way.
const extractor = (request: FastifyRequest): string | string[] =>
  [request.headers['custom-versioning-field'] ?? '']
     .flatMap(v => v.split(','))
     .filter(v => !!v)
     .sort()
     .reverse()

const app = await NestFactory.create(AppModule);
app.enableVersioning({
  type: VersioningType.CUSTOM,
  extractor,
});
await app.listen(process.env.PORT ?? 3000);

```

以下是所有可用的选项列表：

(Note: I followed the provided glossary and kept the code examples, variable names, function names unchanged. I also maintained Markdown formatting, links, images, tables unchanged, and translated code comments from English to Chinese. I did not explain or modify placeholders, and kept them exactly as they are in the source text.)| 选项          | 描述                                                                                                                                                                                                                                                                                                                                          | Default                                        |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| `1`       |启用日志级别。                                                                                                                                                                                                                                                                                                                                  | `2` |
| `3`       |如果启用，会在当前和前一个日志消息之间打印时间戳（时间差）。注意：这选项在 `extractor` 启用时不生效。                                                                                                                                                                                                             | `extractor`                                        |
| `404`          |用于每个日志消息的前缀。注意：这选项在 `404` 启用时不生效。                                                                                                                                                                                                                                                      | `VERSION_NEUTRAL`                                         |
| `VERSION_NEUTRAL`            |如果启用，会将日志消息打印为 JSON 格式。                                                                                                                                                                                                                                                                                               | `VERSION_NEUTRAL`                                        |
| `defaultVersion`          |如果启用，会将日志消息打印为颜色。默认情况下，如果 json Disabled，则为真，否则为假。                                                                                                                                                                                                                                                  | `MiddlewareConsumer.forRoutes()`                                         |
| `LoggerMiddleware`         |日志器的上下文。                                                                                                                                                                                                                                                                                                                           | `/cats`                                    |
| `URI`         |如果启用，会将日志消息打印到单个行，即使它是一个对象具有多个属性。如果设置为数字，則将最多n个内层元素 unite 到单个行，同时确保所有属性都可以 fit 到 breakLength 中。短数组元素也将被组合在一起。                                                                 | `Header`                                         |
| `Media Type`  |指定当格式化时要包括的数组、TypedArray、Map、Set、WeakMap 和 WeakSet 元素的最大数量。设置为 null 或 Infinity 将显示所有元素。设置为 0 或负数将显示无元素。忽略在 `Custom` 启用时，colorsdisabled，并且 __INLINE_CODE_60__ 设置为真，因为它生产可 parseable 的 JSON 输出。             | __INLINE_CODE_61__                                          |
| __INLINE_CODE_62__ |指定当格式化时要包括的字符的最大数量。设置为 null 或 Infinity 将显示所有元素。设置为 0 或负数将显示无字符。忽略在 __INLINE_CODE_63__ 启用时，colorsdisabled，并且 __INLINE_CODE_64__ 设置为真，因为它生产可 parseable 的 JSON 输出。                                                           | __INLINE_CODE_65__                                        |
| __INLINE_CODE_66__          |如果启用，则会对对象的键进行排序。也可以是一个自定义的排序函数。Here is the translated text:

#### JSON记录

JSON记录对于现代应用程序可观察性和日志管理系统集成非常重要。要在NestJS应用程序中启用JSON记录，configure __INLINE_CODE_80__ 对象的 __INLINE_CODE_81__ 属性设置为 __INLINE_CODE_82__。然后，在创建应用程序实例时，提供该 logger 配置作为 __INLINE_CODE_83__ 属性的值。

```

```typescript
@Controller({
  version: '1',
})
export class CatsControllerV1 {
  @Get('cats')
  findAll(): string {
    return 'This action returns all cats for version 1';
  }
}

```

```

该配置将输出日志以结构化的 JSON 格式，使其更易于与外部系统集成，例如 **AWS ECS** (Elastic Container Service)。这些平台原生支持 JSON 日志，启用了 advanced 特性，如：

- **Log Filtering**：根据日志级别、时间戳或自定义元数据轻松地过滤日志。
- **Search and Analysis**：使用查询工具来分析和跟踪应用程序行为的趋势。

此外，如果您使用 __LINK_181__，JSON记录简化了查看日志的过程，使其变得更加有序和结构化，这对于调试和性能监控非常有用。

> info **Note** 当 __INLINE_CODE_84__ 设置为 __INLINE_CODE_85__， __INLINE_CODE_86__ 将自动禁用文本颜色化，并将 __INLINE_CODE_87__ 属性设置为 __INLINE_CODE_88__。这确保输出的 JSON 是有效的，无格式 artifact。然而，在开发时，您可以Override 这个行为，明确设置 __INLINE_CODE_89__ 属性为 __INLINE_CODE_90__。这将添加颜色化的 JSON 日志，使日志条目在本地调试中变得更加可读。

当启用 JSON记录时，日志输出将如下所示（在单行中）：

```

```typescript
import { Controller, Get, Version } from '@nestjs/common';

@Controller()
export class CatsController {
  @Version('1')
  @Get('cats')
  findAllV1(): string {
    return 'This action returns all cats for version 1';
  }

  @Version('2')
  @Get('cats')
  findAllV2(): string {
    return 'This action returns all cats for version 2';
  }
}

@Controller()
export class CatsController {
  @Version('1')
  @Get('cats')
  findAllV1() {
    return 'This action returns all cats for version 1';
  }

  @Version('2')
  @Get('cats')
  findAllV2() {
    return 'This action returns all cats for version 2';
  }
}

```

```

您可以在这个 __LINK_182__ 中看到不同的变体。

#### 使用 logger 进行应用程序记录

我们可以组合多个技术以提供一致的行为和格式，跨越 Nest 系统日志和我们的应用程序事件/消息日志记录。

一个好的实践是，在每个服务中实例化 __INLINE_CODE_91__ 类，并从 __INLINE_CODE_92__ 中获取该实例。我们可以将服务名称作为 __INLINE_CODE_93__ argument 传递给 __INLINE_CODE_94__ 构造函数，例如：

```

```typescript
@Controller({
  version: ['1', '2'],
})
export class CatsController {
  @Get('cats')
  findAll(): string {
    return 'This action returns all cats for version 1 or 2';
  }
}

```

```

在默认 logger 实现中，__INLINE_CODE_95__ 将在方括号中打印，如 __INLINE_CODE_96__ 在以下示例中所示：

```

```typescript
import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';

@Controller({
  version: VERSION_NEUTRAL,
})
export class CatsController {
  @Get('cats')
  findAll(): string {
    return 'This action returns all cats regardless of version';
  }
}

@Controller({
  version: VERSION_NEUTRAL,
})
export class CatsController {
  @Get('cats')
  findAll() {
    return 'This action returns all cats regardless of version';
  }
}

```

```

如果我们提供自定义 loggervia __INLINE_CODE_97__，那么它将被 Nest 内部使用。这意味着我们的代码保持实现agnostic，而我们可以轻松地将默认 logger 替换为自定义 logger，通过调用 __INLINE_CODE_98__。

这样，如果我们遵循上一节中的步骤并调用 __INLINE_CODE_99__，然后将 __INLINE_CODE_100__ 从 __INLINE_CODE_101__ 中调用，结果将是对 __INLINE_CODE_102__ 方法的调用，来自 __INLINE_CODE_103__ 实例。

这应该适用于大多数情况。但是，如果您需要更多自定义（如添加和调用自定义方法），请转到下一节。

#### 带时间戳的日志

要启用每个日志消息的时间戳记录，可以使用可选的 __INLINE_CODE_104__ 设置，创建 logger 实例时。

```

```typescript
app.enableVersioning({
  // ...
  defaultVersion: '1'
  // or
  defaultVersion: ['1', '2']
  // or
  defaultVersion: VERSION_NEUTRAL
});

```

```

这将产生以下格式的输出：

```

```typescript
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { CatsModule } from './cats/cats.module';
import { CatsController } from './cats/cats.controller';

@Module({
  imports: [CatsModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: 'cats', method: RequestMethod.GET, version: '2' });
  }
}

```

```Here is the translation of the English technical documentation to Chinese:

#### 自定义实现

您可以为 Nest 提供一个自定义的 logger 实现，以便在系统日志中使用。为此，您需要将 __INLINE_CODE_105__ 属性设置为实现了 __INLINE_CODE_106__ 接口的对象的实例。例如，您可以让 Nest 使用内置的全局 JavaScript __INLINE_CODE_108__ 对象（它实现了 __INLINE_CODE_109__ 接口），如下所示：

__CODE_BLOCK_10__

实现自己的自定义 logger 很简单。只需实现 __INLINE_CODE_110__ 接口的每个方法，如下所示。

__CODE_BLOCK_11__

然后，您可以通过 Nest 应用程序选项对象的 __INLINE_CODE_112__ 属性提供 __INLINE_CODE_111__ 实例的实例。

__CODE_BLOCK_12__

此技术虽然简单，但并没有使用依赖注入来注入 __INLINE_CODE_113__ 类。这可能会在测试和重用 __INLINE_CODE_114__ 中遇到挑战。为了获得更好的解决方案，请查看 __HTML_TAG_166__ 依赖注入 __HTML_TAG_167__ 部分。

#### 扩展内置 logger

而不是从头开始编写 logger，您可能可以通过扩展内置 __INLINE_CODE_115__ 类并覆盖默认实现的部分行为来满足您的需求。

__CODE_BLOCK_13__

您可以在特性模块中使用这样一个扩展 logger，如 __HTML_TAG_168__ 使用 logger 应用日志 __HTML_TAG_169__ 部分所示。

您可以通过将 __INLINE_CODE_116__ 属性设置为扩展 logger 的实例来让 Nest 使用您的扩展 logger（如 __HTML_TAG_170__ 自定义实现 __HTML_TAG_171__ 部分所示），或使用 __HTML_TAG_172__ 依赖注入 __HTML_TAG_173__ 部分所示的技术。如果您这样做，请务必在示例代码中显示的位置调用 __INLINE_CODE_117__，以便将特定的日志方法调用委托给父类（内置类），以便 Nest 可以依赖内置的特性。

__HTML_TAG_174____HTML_TAG_175__

#### 依赖注入

对于更高级的日志功能，您将想利用依赖注入。例如，您可能想将 __INLINE_CODE_118__ 注入到 logger 中以进行自定义，并将自定义 logger 注入到其他控制器或提供者中。要启用依赖注入，您需要创建一个实现 __INLINE_CODE_119__ 接口的类，并将该类注册为某个模块的提供者。例如，您可以

1. 定义一个 __INLINE_CODE_120__ 类，该类扩展了内置 __INLINE_CODE_121__ 或完全覆盖它，如前所示。确保实现 __INLINE_CODE_122__ 接口。
2. 创建一个 __INLINE_CODE_123__，如下所示，并提供 __INLINE_CODE_124__ 从该模块。

__CODE_BLOCK_14__

现在，您已经为其他模块提供了自定义 logger。因为您的 __INLINE_CODE_125__ 类是模块的一部分，可以使用依赖注入（例如，注入 __INLINE_CODE_126__）。还有一个技术需要提供这个自定义 logger，以便 Nest 对系统日志进行使用（例如，用于引导和错误处理）。

因为应用程序实例化（__INLINE_CODE_127__）发生在任何模块的上下文外，因此不参与正常的依赖注入初始化阶段。因此，我们必须确保至少有一个应用程序模块导入 __INLINE_CODE_128__，以便 Nest 实例化 __INLINE_CODE_129__ 类的单例实例。

然后，我们可以将 __INLINE_CODE_130__ 属性设置为 __INLINE_CODE_131__，以便让 Nest 使用相同的单例实例。

__CODE_BLOCK_15__

> info **注意** 在示例中，我们将 __INLINE_CODE_131__ 设置为 __INLINE_CODE_132__，以便确保所有日志都将被缓冲直到自定义 logger 被附加（在本例中是 __INLINE_CODE_133__）并且应用程序初始化过程完成或失败。如果初始化过程失败，Nest 将 fallback 到原始 __INLINE_CODE_134__ 打印出任何报告的错误信息。同时，您可以将 __INLINE_CODE_135__ 设置为 __INLINE_CODE_136__（默认 __INLINE_CODE_137__）以手动刷新日志（使用 __INLINE_CODE_138__ 方法）。以下是翻译后的中文文档：

#### 注入自定义日志器

首先，您可以通过以下代码扩展内置的日志器。我们将 __INLINE_CODE_145__ 选项作为 __INLINE_CODE_146__ 类的配置元数据，指定一个 __LINK_183__ 作用域，以确保在每个特性模块中都有一个唯一的 __INLINE_CODE_147__ 实例。在这个示例中，我们并没有扩展单个 __INLINE_CODE_148__ 方法（如 __INLINE_CODE_149__、__INLINE_CODE_150__ 等），但您可能会选择这样做。

__CODE_BLOCK_16__

然后，创建一个 __INLINE_CODE_151__，构造如下：

__CODE_BLOCK_17__

接下来，在您的特性模块中导入 __INLINE_CODE_152__。由于我们扩展了默认 __INLINE_CODE_153__，我们拥有使用 __INLINE_CODE_154__ 方法的便捷性。因此，我们可以使用上下文感知的自定义日志器，如下所示：

__CODE_BLOCK_18__

最后，在您的 __INLINE_CODE_155__ 文件中， instruct Nest 使用自定义日志器的实例，如下所示。当然，在这个示例中，我们并没有实际自定义日志行为（通过扩展 __INLINE_CODE_156__ 方法，如 __INLINE_CODE_157__、__INLINE_CODE_158__ 等），因此这个步骤实际上不是必需的。但是，如果您添加了自定义逻辑到这些方法中，并想让 Nest 使用同一个实现，那么这个步骤将是必需的。

__CODE_BLOCK_19__

> info **提示**Alternatively，您可以将 __INLINE_CODE_159__ 设置为 __INLINE_CODE_160__，或者使用 __INLINE_CODE_161__ 指令来临时禁用日志器。请注意，如果您提供 __INLINE_CODE_162__ 到 __INLINE_CODE_163__，那么直到您调用 __INLINE_CODE_164__，nothing 将被记录，因此您可能会错过一些重要的初始化错误。如果您不介意一些初始消息被记录到默认日志器中，您可以简单地忽略 __INLINE_CODE_165__ 选项。

#### 使用外部日志器

生产应用程序通常具有特定的日志要求，包括高级过滤、格式化和集中化日志记录。Nest 的内置日志器用于监控 Nest 系统行为，可以用于基本格式化文本日志记录在特性模块中，而在开发中，但生产应用程序通常利用专门的日志模块，如 __LINK_184__。正如任何标准 Node.js 应用程序一样，您可以在 Nest 中充分利用这些模块。