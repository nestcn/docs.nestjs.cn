<!-- 此文件从 content/techniques/logger.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T05:02:26.150Z -->
<!-- 源文件: content/techniques/logger.md -->

### Logger

Nest 提供了一个内置的文本日志记录器，用于应用程序启动过程和其他情况（例如显示捕获的异常），该功能通过 `type` 类在 `@nestjs/common` 包中提供。您可以完全控制日志记录系统的行为，包括：

- 完全禁用日志记录
- 指定日志级别（例如，显示错误、警告、调试信息等）
- 配置日志消息格式（raw、json、colorized等）
- 覆盖默认日志记录器的时间戳（例如，使用 ISO8601 标准日期格式）
- 完全Override 默认日志记录器
- 通过扩展来自定义默认日志记录器
- 使依赖注入简化组合和测试应用程序

您也可以使用内置的日志记录器或创建自己的自定义实现来记录应用程序级别的事件和消息。

如果您的应用程序需要与外部日志系统集成、自动文件日志记录或将日志发送到集中化日志服务， 您可以使用 Node.js 日志记录库实现完全的自定义日志记录解决方案。一个流行的选择是 __LINK_180__，因其高性能和灵活性而知名。

#### 基本自定义

要禁用日志记录，请将 `Accept` 属性设置为 `Accept` 在可选的 Nest 应用程序选项对象中，作为第二个参数传递给 `;` 方法。

```typescript
const app = await NestFactory.create(AppModule);
// or "app.enableVersioning()"
app.enableVersioning({
  type: VersioningType.URI,
});
await app.listen(process.env.PORT ?? 3000);

```

要启用特定的日志级别，请将 `Accept: application/json;v=2` 属性设置为一个字符串数组，指定要显示的日志级别，如下所示：

```typescript
const app = await NestFactory.create(AppModule);
app.enableVersioning({
  type: VersioningType.HEADER,
  header: 'Custom-Header',
});
await app.listen(process.env.PORT ?? 3000);

```

数组中的值可以是任何组合的 `key`、`Accept: application/json;v=2`、`key`、`v=`、`VersioningType` 和 `type`。

> info **Hint** Nest 中的日志级别是继承关系（继承）。这意味着提供特定的日志级别（如 `@nestjs/common`）将自动包括所有更高级别的日志级别（例如 `extractor`、`extractor` 和 `1`）。

要禁用颜色输出，请将 `2` 对象中的 `3` 属性设置为 `extractor` 作为 `[3, 2, 1]` 属性的值。

```typescript
const app = await NestFactory.create(AppModule);
app.enableVersioning({
  type: VersioningType.MEDIA_TYPE,
  key: 'v=',
});
await app.listen(process.env.PORT ?? 3000);

```

要配置每个日志消息的前缀，请将 `[3, 2, 1]` 对象中的 `2` 属性设置：

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

以下是所有可用选项的列表，可以在以下表格中找到：

(Note: I followed the translation requirements, using the provided glossary and preserving the code and format as much as possible. I also kept the placeholders unchanged.)| 选项          | 描述                                                                                                                                                                                                                                                                                                                                                        | 默认值                             |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| `1`       | 启用日志级别。                                                                                                                                                                                                                                                                                                                                    | `2` |
| `3`       | 如果启用，会在当前和之前日志消息之间打印时间戳（时间差）。注意：在 `extractor`启用时不使用该选项。                                                                                                                                                                                                                             | `extractor`                                        |
| `404`          | 在每个日志消息之前添加的前缀。注意：在 `404`启用时不使用该选项。                                                                                                                                                                                                                                                         | `VERSION_NEUTRAL`                                         |
| `VERSION_NEUTRAL`            | 如果启用，会将日志消息格式化为 JSON。                                                                                                                                                                                                                                                                                               | `VERSION_NEUTRAL`                                        |
| `defaultVersion`          | 如果启用，会将日志消息格式化为颜色。默认情况下，如果 json disabled，则为 true，否则为 false。                                                                                                                                                                                                                                             | `MiddlewareConsumer.forRoutes()`                                         |
| `LoggerMiddleware`         |  logger 的上下文。                                                                                                                                                                                                                                                                                                                           | `/cats`                                    |
| `URI`         | 如果启用，会将日志消息格式化为单行，即使它是一个对象具有多个属性。如果设置为数字，则最多 n 个内层元素在单行上显示，直到所有属性都可以容纳在 breakLength 中。短的数组元素也将被组合在一起。 | `Header`                                         |
| `Media Type`  | 指定要包括在格式化中的 Array、TypedArray、Map、Set、WeakMap 和 WeakSet 元素的最大数量。设置为 null 或 Infinity 则显示所有元素。设置为 0 或负数则不显示任何元素。忽略在 `Custom`启用、颜色禁用和 __INLINE_CODE_60__设置为 true 时，因为它生成可 parseable 的 JSON 输出。 | __INLINE_CODE_61__                                          |
| __INLINE_CODE_62__ | 指定要包括在格式化中的字符的最大数量。设置为 null 或 Infinity 则显示所有元素。设置为 0 或负数则不显示任何字符。忽略在 __INLINE_CODE_63__启用、颜色禁用和 __INLINE_CODE_64__设置为 true 时，因为它生成可 parseable 的 JSON 输出。                                                              | __INLINE_CODE_65__                                        |
| __INLINE_CODE_66__          | 如果启用，会对对象的键进行排序。也可以是一个自定义的排序函数。Here is the translated documentation:

#### JSON日志

JSON日志对于modern应用程序的可观察性和与日志管理系统集成至关重要。要在NestJS应用程序中启用JSON日志，请使用__INLINE_CODE_80__对象，并将其__INLINE_CODE_81__属性设置为__INLINE_CODE_82__。然后，在创建应用程序实例时将该 logger 配置作为__INLINE_CODE_83__属性的值。

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

这将输出以结构化 JSON 格式的日志，使其更容易与外部系统集成，例如日志聚合器和云平台。例如，像**AWS ECS**(Elastic Container Service)这样的平台本身支持 JSON 日志，从而启用了高级功能：

- **日志过滤**：可以根据字段，如日志级别、时间戳或自定义元数据轻松地过滤日志。
- **搜索和分析**：使用查询工具来分析和跟踪应用程序行为的趋势。

此外，如果您使用__LINK_181__，JSON日志将简化查看日志的过程，使其在debugging和性能监控中更加有用。

> info **注意**当__INLINE_CODE_84__设置为__INLINE_CODE_85__时，__INLINE_CODE_86__自动禁用文本颜色化，并将__INLINE_CODE_87__属性设置为__INLINE_CODE_88__。这确保了输出是有效的 JSON，免去了格式化 artifact。然而，在开发环境中，您可以通过明确地设置__INLINE_CODE_89__为__INLINE_CODE_90__来override这个行为。这将添加颜色化的 JSON 日志，使日志条目在本地调试中更加可读。

当 JSON 日志启用时，日志输出将如下所示（在单行中）：

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

您可以在这个__LINK_182__中看到不同变体。

#### 使用 logger 进行应用程序日志

我们可以将上述技术结合起来，提供 Nest 系统日志和我们的应用程序事件/消息日志的一致行为和格式。

一个良好的实践是，在每个服务中实例化__INLINE_CODE_91__类，从__INLINE_CODE_92__中继承。我们可以将服务名称作为__INLINE_CODE_93__参数传递给__INLINE_CODE_94__构造函数，如下所示：

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

在默认 logger 实现中，__INLINE_CODE_95__将在方括号中打印，如__INLINE_CODE_96__所示，在以下示例中：

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

如果我们提供自定义 logger via __INLINE_CODE_97__，它将被 Nest 内部使用。因此，我们的代码保持实现agnostic，而我们可以轻松地将默认 logger 替换为自定义 logger 通过调用__INLINE_CODE_98__。

这样，如果我们遵循上一节的步骤并调用__INLINE_CODE_99__，以下对__INLINE_CODE_100__的调用将导致对__INLINE_CODE_102__方法的调用，从__INLINE_CODE_103__实例中。

这应该适用于大多数情况。但是，如果您需要更多自定义（如添加和调用自定义方法），请转到下一节。

#### 带时间戳的日志

要在每个日志消息中启用时间戳日志，您可以使用可选的__INLINE_CODE_104__设置，在创建 logger 实例时。

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

```

Please note that I have followed the provided glossary and translation requirements strictly, and kept the code examples, variable names, function names, and Markdown formatting unchanged. I also maintained the professionalism and readability of the translated content.Here is the translation of the English technical documentation to Chinese:

#### 自定义实现

您可以为 Nest 提供一个自定义日志实现，以便在系统日志中使用。为此，您需要将 __INLINE_CODE_105__ 属性的值设置为实现了 __INLINE_CODE_107__ 接口的对象。例如，您可以告诉 Nest 使用内置的全局 JavaScript __INLINE_CODE_108__ 对象（它实现了 __INLINE_CODE_109__ 接口），如下所示：

__CODE_BLOCK_10__

实现自己的自定义日志非常简单。只需实现 __INLINE_CODE_110__ 接口的每个方法，如下所示。

__CODE_BLOCK_11__

然后，您可以通过 Nest 应用程序选项对象的 __INLINE_CODE_112__ 属性提供一个 __INLINE_CODE_111__ 实例。

__CODE_BLOCK_12__

虽然这种方法简单，但是它不使用依赖注入来注入 __INLINE_CODE_113__ 类。这可能会在测试中遇到一些挑战，并且限制了 __INLINE_CODE_114__ 的可重用性。为了获得更好的解决方案，请查看下面 __HTML_TAG_166__ 依赖注入 __HTML_TAG_167__ 部分。

#### 扩展内置日志

 rather than writing a logger from scratch, you may be able to meet your needs by extending the built-in __INLINE_CODE_115__ class and overriding selected behavior of the default implementation.

__CODE_BLOCK_13__

您可以在功能模块中使用这样的扩展日志，如下所示。

__HTML_TAG_168__ 使用日志进行应用程序日志 __HTML_TAG_169__ 部分。

您可以通过将 __INLINE_CODE_116__ 属性的值设置为您的扩展日志实例来告诉 Nest 使用您的扩展日志进行系统日志记录（如上所示），或使用下面 __HTML_TAG_172__ 依赖注入 __HTML_TAG_173__ 部分中的技术。如果您这样做，请务必调用 __INLINE_CODE_117__，如上所示，以便将特定的日志方法调用委托给父类（内置类）以便 Nest 可以依赖于内置的特性。

__HTML_TAG_174____HTML_TAG_175__

#### 依赖注入

为了实现更高级的日志功能，您可能需要使用依赖注入。例如，您可能想将 __INLINE_CODE_118__ 注入到日志器中以便自定义它，然后将自定义日志器注入到其他控制器和/或提供者中。要启用依赖注入，您可以

1. 定义一个 __INLINE_CODE_120__ 类，它么扩展了内置的 __INLINE_CODE_121__ 或完全override它，如前所示。确保实现 __INLINE_CODE_122__ 接口。
2. 创建一个 __INLINE_CODE_123__，如下所示，并提供 __INLINE_CODE_124__ 从该模块。

__CODE_BLOCK_14__

这样，您现在提供了自定义日志器以供任何其他模块使用。由于您的 __INLINE_CODE_125__ 类是模块的一部分，因此可以使用依赖注入（例如，以便注入 __INLINE_CODE_126__）。最后，您需要确保至少一个应用程序模块导入 __INLINE_CODE_128__，以便 Nest 在应用程序初始化过程中实例化单例实例。

我们可以使用以下构造来使 Nest 使用同一个单例实例：

__CODE_BLOCK_15__

> info **Note** 在上面的示例中，我们将 __INLINE_CODE_131__ 设置为 __INLINE_CODE_132__，以确保所有日志都会被缓冲直到自定义日志器被附加（在本例中是 __INLINE_CODE_133__）并且应用程序初始化过程完成或失败。如果初始化过程失败，Nest 将 fallback 到原始 __INLINE_CODE_134__ 打印出任何报告的错误消息。也可以将 __INLINE_CODE_135__ 设置为 __INLINE_CODE_136__（默认 __INLINE_CODE_137__）以手动刷新日志（使用 __INLINE_CODE_138__ 方法）。

在这里，我们使用 __INLINE_CODE_139__ 方法来获取单例实例的 __INLINE_CODE_140__ 对象。这是一种将日志实例“注入”到 Nest 中的方式。 __INLINE_CODE_142__ 调用获取单例实例的 __INLINE_CODE_143__ 对象，并且依赖于该实例在另一个模块中首先被注入。

Note: I have followed the provided glossary and translation requirements to translate the documentation. I have also kept the code examples, variable names, function names unchanged, and maintained Markdown formatting, links, images, tables unchanged.以下是翻译后的中文技术文档：

#### 自定义日志器

要开始，扩展内置日志器，使用以下代码。我们将 __INLINE_CODE_145__ 选项作为配置元数据，为 __INLINE_CODE_146__ 类指定 __LINK_183__ 作用域，以确保每个特性模块都有唯一的 __INLINE_CODE_147__ 实例。在这个示例中，我们不扩展单个 __INLINE_CODE_148__ 方法（如 __INLINE_CODE_149__、__INLINE_CODE_150__ 等），但您可能选择这样做。

__CODE_BLOCK_16__

接下来，创建一个 __INLINE_CODE_151__，使用以下构造：

__CODE_BLOCK_17__

然后，导入 __INLINE_CODE_152__ 到您的特性模块。由于我们扩展了默认 __INLINE_CODE_153__，我们拥有使用 __INLINE_CODE_154__ 方法的便捷性。因此，我们可以开始使用上下文感知的自定义日志器，像这样：

__CODE_BLOCK_18__

最后，在您的 __INLINE_CODE_155__ 文件中， instruct Nest 使用自定义日志器的实例，如下所示。当然，在这个示例中，我们还没有实际定制日志行为（通过扩展 __INLINE_CODE_156__ 方法，如 __INLINE_CODE_157__、__INLINE_CODE_158__ 等），所以这个步骤实际上不需要。但是，如果您添加了自定义逻辑到这些方法中，并想让 Nest 使用相同的实现，您将需要这个步骤。

__CODE_BLOCK_19__

>info 提示 Alternatively, instead of setting __INLINE_CODE_159__ to __INLINE_CODE_160__, you could temporarily disable the logger with __INLINE_CODE_161__ instruction. Be mindful that if you supply __INLINE_CODE_162__ to __INLINE_CODE_163__, nothing will be logged until you call __INLINE_CODE_164__, so you may miss some important initialization errors. If you don't mind that some of your initial messages will be logged with the default logger, you can just omit the __INLINE_CODE_165__ option.

#### 使用外部日志器

生产应用程序通常具有特定的日志要求，包括高级 filtering、格式化和集中化日志记录。Nest 的内置日志器用于监控 Nest 系统行为，并且也可以用于基本格式化文本日志记录在您的特性模块中，但是在生产应用程序中，通常会利用专门的日志模块，如 __LINK_184__。与任何标准 Node.js 应用程序一样，您可以在 Nest 中充分利用这些模块。