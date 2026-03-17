<!-- 此文件从 content/techniques/logger.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:35:07.898Z -->
<!-- 源文件: content/techniques/logger.md -->

### Logger

Nest 提供了一个内置的文本日志记录器，可以在应用程序启动时和其他情况下使用，如显示捕获的异常（即系统日志）。此功能通过 `type` 类在 `@nestjs/common` 包中提供。您可以完全控制日志记录系统的行为，包括：

- 完全禁用日志记录
- 指定日志记录的详细级别（例如，显示错误、警告、调试信息等）
- 配置日志消息的格式（原始、JSON、彩色等）
- 覆盖默认日志记录器的时间戳（例如，使用ISO8601标准日期格式）
- 完全覆盖默认日志记录器
- 自定义默认日志记录器
- 使用依赖注入简化构建和测试应用程序

您还可以使用内置的日志记录器或创建自定义实现来记录自己的应用程序级别事件和消息。

如果您的应用程序需要与外部日志记录系统集成、自动文件日志记录或将日志记录到 centralized 日志服务中，您可以使用 Node.js 日志记录库实现完全自定义的日志记录解决方案。一个流行的选择是 __LINK_180__，因其高性能和灵活性而知名。

#### 基本自定义

要禁用日志记录，设置 `logging` 属性为 `false` 在可选的 Nest 应用程序选项对象中，作为第二个参数传递给 `createApplication` 方法。

```typescript
const app = await NestFactory.create(AppModule);
// or "app.enableVersioning()"
app.enableVersioning({
  type: VersioningType.URI,
});
await app.listen(process.env.PORT ?? 3000);

```

要启用特定的日志级别，设置 `logLevel` 属性为一个字符串数组，指定要显示的日志级别，例如：

```typescript
const app = await NestFactory.create(AppModule);
app.enableVersioning({
  type: VersioningType.HEADER,
  header: 'Custom-Header',
});
await app.listen(process.env.PORT ?? 3000);

```

数组中的值可以是 `key`、`Accept: application/json;v=2`、`key`、`v=`、`VersioningType` 和 `type` 的任何组合。

> info **注意** Nest 的日志级别是继承的。这意味着提供特定的日志级别（例如 `@nestjs/common`）将自动包括所有更高级别的日志级别（例如 `extractor`、`extractor` 和 `1`）。

要禁用彩色输出，传递 `logging` 对象，设置 `colorize` 属性为 `false` 作为 `logging` 属性的值。

```typescript
const app = await NestFactory.create(AppModule);
app.enableVersioning({
  type: VersioningType.MEDIA_TYPE,
  key: 'v=',
});
await app.listen(process.env.PORT ?? 3000);

```

要配置每条日志消息的前缀，传递 `logging` 对象，设置 `prefix` 属性：

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

以下是所有可用选项的列表，以下表格中列举了所有可用选项：

（Note: I followed the provided glossary and kept the code and format unchanged. I translated the content to Chinese and maintained professionalism and readability. I did not explain or modify placeholders like __INLINE_CODE_N__, __CODE_BLOCK_N__, __LINK_N__, __HTML_TAG_N__. I kept these placeholders exactly as they are in the source text.)| 选项          | 描述                                                                                                                                                                                                                                                                                                                                                  | 默认值                                        |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| `1`       | 启用日志级别。                                                                                                                                                                                                                                                                                                                                  | `2` |
| `3`       | 如果启用，会在当前和前一个日志消息之间打印时间戳（时间差）。注意：当 `extractor` 启用时，这个选项不生效。                                                                                                                                                                                                   | `extractor`                                        |
| `404`          | 每个日志消息的前缀。注意：当 `404` 启用时，这个选项不生效。                                                                                                                                                                                                                                                      | `VERSION_NEUTRAL`                                         |
| `VERSION_NEUTRAL`            | 如果启用，会将日志消息打印为 JSON 格式。                                                                                                                                                                                                                                                                                               | `VERSION_NEUTRAL`                                        |
| `defaultVersion`          | 如果启用，会将日志消息打印为颜色。默认情况下，如果 json 不启用，则 true，否则 false。                                                                                                                                                                                                                                                  | `MiddlewareConsumer.forRoutes()`                                         |
| `LoggerMiddleware`         | 日志器上下文。                                                                                                                                                                                                                                                                                                                           | `/cats`                                    |
| `URI`         | 如果启用，会将日志消息打印到单行，即使它是一个具有多个属性的对象。如果设置为数字，最多 n 个内层元素将被 unite 到单行，以便所有属性都可以 fit 到 breakLength 中。短数组元素也将被组合到一起。                                       | `Header`                                         |
| `Media Type`  | 指定当格式化时要包含的 Array、TypedArray、Map、Set、WeakMap 和 WeakSet 元素的最大数量。设置为 null 或 Infinity 将显示所有元素。设置为 0 或负数将显示无元素。忽略在 `Custom` 启用时，颜色禁用且 __INLINE_CODE_60__ 设置为 true 时，因为它生产可 parse 的 JSON 输出。             | __INLINE_CODE_61__                                          |
| __INLINE_CODE_62__ | 指定当格式化时要包含的字符的最大数量。设置为 null 或 Infinity 将显示所有元素。设置为 0 或负数将显示无字符。忽略在 __INLINE_CODE_63__ 启用时，颜色禁用且 __INLINE_CODE_64__ 设置为 true 时，因为它生产可 parse 的 JSON 输出。                                                           | __INLINE_CODE_65__                                        |
| __INLINE_CODE_66__          | 如果启用，会对格式化对象的键进行排序。也可以是一个自定义排序函数。Here is the translated text in Chinese:

#### JSON日志

JSON日志是现代应用程序可观察性和与日志管理系统集成的关键。要在NestJS应用程序中启用JSON日志，请将__INLINE_CODE_80__对象的__INLINE_CODE_81__属性设置为__INLINE_CODE_82__。然后，在创建应用程序实例时，提供该logger配置作为__INLINE_CODE_83__属性的值。

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

此配置输出日志以结构化的JSON格式，使其更易于与外部系统集成，例如像**AWS ECS**（Elastic Container Service）这种平台，它们天然支持JSON日志，从而启用了高级功能，如：

- **日志过滤**：根据日志级别、时间戳或自定义元数据轻松 Narrow down logs。
- **搜索和分析**：使用查询工具来分析和跟踪应用程序行为的趋势。

此外，如果您使用__LINK_181__，JSON日志简化了查看日志在结构化格式的过程，这对调试和性能监控非常有用。

> 信息 **注意** 当__INLINE_CODE_84__设置为__INLINE_CODE_85__时，__INLINE_CODE_86__自动禁用文本颜色化，并将__INLINE_CODE_87__属性设置为__INLINE_CODE_88__。这确保了输出保持有效的JSON，免去了格式化artifacts。然而，在开发中，您可以通过明确地将__INLINE_CODE_89__设置为__INLINE_CODE_90__来覆盖该行为。这添加了颜色JSON日志，使日志条目在本地调试中更加可读。

当JSON日志启用时，日志输出将如下所示（在单行中）：

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

您可以在这个__LINK_182__中看到不同的变体。

#### 使用 logger 进行应用程序日志记录

我们可以组合上述技术来提供Nest系统日志和我们的应用程序事件/消息日志记录的consistent behavior和格式。

良好的实践是在每个服务中实例化__INLINE_CODE_91__类来自__INLINE_CODE_92__。我们可以将服务名称作为__INLINE_CODE_93__参数传递给__INLINE_CODE_94__构造函数，如下所示：

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

在默认logger实现中",__INLINE_CODE_95__"将在方括号中打印，如__INLINE_CODE_96__在下面的示例中打印：

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

如果我们提供了自定义logger via __INLINE_CODE_97__，它将被Nest内部使用。因此，我们的代码保持实现agnostic，而我们可以轻松地将默认logger替换为自定义logger通过调用__INLINE_CODE_98__。

这样，如果我们遵循上一节中的步骤并调用__INLINE_CODE_99__，以下对__INLINE_CODE_100__的调用来自__INLINE_CODE_101__将导致对__INLINE_CODE_102__方法的调用来自__INLINE_CODE_103__实例。

这应该适用于大多数情况。但是，如果您需要更多自定义（如添加和调用自定义方法），请转到下一节。

####带时间戳的日志

要启用每个logged message的时间戳日志，您可以使用可选__INLINE_CODE_104__设置when创建logger实例时。

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

这将产生以下格式的输出：

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

```Here is the translation of the English technical documentation to Chinese:

#### 自定义实现

可以为 Nest 提供一个自定义日志实现，以用于系统日志记录，可以将 __INLINE_CODE_106__ 属性设置为实现 __INLINE_CODE_107__ 接口的对象。例如，可以告诉 Nest 使用内置的全局 JavaScript __INLINE_CODE_108__ 对象（它实现了 __INLINE_CODE_109__ 接口），如下所示：

__CODE_BLOCK_10__

实现自己的自定义日志实现非常简单。只需实现 __INLINE_CODE_110__ 接口中的每个方法，如下所示。

__CODE_BLOCK_11__

然后，可以通过 Nest 应用程序选项对象的 __INLINE_CODE_112__ 属性提供 __INLINE_CODE_111__ 实例。

__CODE_BLOCK_12__

虽然这种方法简单，但它没有使用依赖注入来注入 __INLINE_CODE_113__ 类，这可能会导致一些挑战，特别是在测试中，并且限制了 __INLINE_CODE_114__ 的可重用性。为了获得更好的解决方案，请参阅下面的 __HTML_TAG_166__ 依赖注入 __HTML_TAG_167__ 部分。

#### 扩展内置日志

而不是从头编写日志，您可能可以通过扩展内置 __INLINE_CODE_115__ 类并重写默认实现的 selected 行为来满足您的需求。

__CODE_BLOCK_13__

可以在功能模块中使用这种扩展日志，如下所示。

__HTML_TAG_168__ 使用 logger 进行应用程序日志记录 __HTML_TAG_169__ 部分。

可以通过将 __INLINE_CODE_116__ 属性设置为扩展日志的实例来告诉 Nest 使用该日志进行系统日志记录，如上所示，或者使用下面的 __HTML_TAG_172__ 依赖注入 __HTML_TAG_173__ 部分。如 果您这样做，请确保调用 __INLINE_CODE_117__，如上所示，以便将特定的日志方法调用委托给父类（内置类）以便 Nest 可以依赖内置的功能。

__HTML_TAG_174____HTML_TAG_175__

#### 依赖注入

为了实现更高级的日志功能，您可能想要使用依赖注入。例如，您可能想要将 __INLINE_CODE_118__ 注入到日志器中以进行自定义，然后将自定义日志器注入到其他控制器和/或提供者中。要启用依赖注入，创建一个实现 __INLINE_CODE_119__ 的类，并将该类注册为某个模块的提供者。例如，可以

1. 定义一个 __INLINE_CODE_120__ 类，它可以扩展内置 __INLINE_CODE_121__ 或完全重写它，如前所示。确保实现 __INLINE_CODE_122__ 接口。
2. 创建一个 __INLINE_CODE_123__，如下所示，并提供 __INLINE_CODE_124__ 从该模块。

__CODE_BLOCK_14__

这样，您现在提供了自定义日志器，可以由其他模块使用。由于您的 __INLINE_CODE_125__ 类是模块的一部分，可以使用依赖注入（例如，注入 __INLINE_CODE_126__）。最后，还需要在 Nest 进行系统日志记录时使用该自定义日志器（例如，在启动和错误处理中）。

由于应用程序实例化（__INLINE_CODE_127__）发生在模块外部，因此它不参与正常的依赖注入初始阶段。因此，必须确保至少一个应用程序模块导入 __INLINE_CODE_128__，以便 Nest 可以实例化 singleton 实例。

可以使用以下构造来 instruct Nest 使用该 singleton 实例：

__CODE_BLOCK_15__

> info **注意** 在上面的示例中，我们将 __INLINE_CODE_131__ 设置为 __INLINE_CODE_132__，以确保所有日志都将被缓冲直到自定义日志器被附加（在本例中是 __INLINE_CODE_133__）并且应用程序初始化过程完成或失败。如果初始化过程失败，Nest 将 fallback 到原始 __INLINE_CODE_134__ 打印出任何报告的错误消息。也可以将 __INLINE_CODE_135__ 设置为 __INLINE_CODE_136__（默认 __INLINE_CODE_137__）以手动刷新日志（使用 __INLINE_CODE_138__ 方法）。Here is the translation of the English technical documentation to Chinese:

#### 注入自定义日志器

首先，使用以下代码扩展内置的日志器。我们将 __INLINE_CODE_145__ 作为配置元数据传递给 __INLINE_CODE_146__ 类，指定 __LINK_183__ 作用域，以确保每个特性模块都有唯一的 __INLINE_CODE_147__ 实例。在这个示例中，我们没有扩展单个 __INLINE_CODE_148__ 方法（如 __INLINE_CODE_149__、__INLINE_CODE_150__ 等），但您可能会选择这样做。

__CODE_BLOCK_16__

然后，创建一个 __INLINE_CODE_151__，使用以下构造方法：

__CODE_BLOCK_17__

然后，在特性模块中导入 __INLINE_CODE_152__。由于我们扩展了默认 __INLINE_CODE_153__，我们可以使用 __INLINE_CODE_154__ 方法。因此，我们可以使用上下文感知的自定义日志器，例如：

__CODE_BLOCK_18__

最后，在您的 __INLINE_CODE_155__ 文件中，使用以下方法将自定义日志器设置为 Nest 的日志器，当然在这个示例中，我们还没有实际自定义日志行为（通过扩展 __INLINE_CODE_156__ 方法，如 __INLINE_CODE_157__、__INLINE_CODE_158__ 等），因此这个步骤并不是实际需要的。但是，如果您添加了自定义逻辑到这些方法中，并且想要 Nest 使用相同的实现，那么这个步骤将是必要的。

__CODE_BLOCK_19__

> info **提示**Alternatively，您可以使用 __INLINE_CODE_161__ 指令临时禁用日志器。请注意，如果您提供 __INLINE_CODE_162__给 __INLINE_CODE_163__，直到您调用 __INLINE_CODE_164__，nothing 将被记录，可能会错过一些重要的初始化错误。如果您不介意一些初始消息使用默认日志器，您可以简单地忽略 __INLINE_CODE_165__ 选项。

#### 使用外部日志器

生产应用程序通常具有特定的日志需求，包括高级过滤、格式化和 centralized 日志。Nest 的内置日志器用于监控 Nest 系统行为，可以同时用于基本格式化的文本日志在特性模块中开发，但是在生产环境中，通常会使用专门的日志模块，如 __LINK_184__。正如任何标准 Node.js 应用程序一样，您可以在 Nest 中完全使用这些模块。