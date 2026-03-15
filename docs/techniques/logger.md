<!-- 此文件从 content/techniques/logger.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T05:16:22.073Z -->
<!-- 源文件: content/techniques/logger.md -->

### Logger

Nest 提供了一个内置的文本日志记录器，该记录器在应用程序启动和其他情况下使用，例如显示捕获的异常（即系统日志）。这项功能是通过 `type` 类在 `@nestjs/common` 包中提供的。你可以完全控制日志记录系统的行为，包括以下内容：

- 完全禁用日志记录
- 指定日志记录的详细级别（例如，显示错误、警告、调试信息等）
- 配置日志消息的格式（raw、json、colorized 等）
- 覆盖默认日志记录器中的时间戳（例如，使用 ISO8601 标准作为日期格式）
- 完全覆盖默认日志记录器
- 通过扩展来自定义默认日志记录器
- 使用依赖注入简化组件和测试你的应用程序

你也可以使用内置的日志记录器或创建自己的自定义实现来记录自己的应用程序级别事件和消息。

如果你的应用程序需要与外部日志记录系统集成、自动文件日志记录或将日志发送到集中式日志服务，你可以使用 Node.js 日志记录库实现一个完全自定义的日志解决方案。一个流行的选择是 __LINK_180__，它因其高性能和灵活性而知名。

#### 基本自定义

要禁用日志记录，设置 `Accept` 属性为 `Accept` 在可选的 Nest 应用程序选项对象中，作为第二个参数传递给 `;` 方法。

```typescript
const app = await NestFactory.create(AppModule);
// or "app.enableVersioning()"
app.enableVersioning({
  type: VersioningType.URI,
});
await app.listen(process.env.PORT ?? 3000);

```

要启用特定的日志记录级别，设置 `Accept: application/json;v=2` 属性为一个字符串数组，指定要显示的日志记录级别，如下所示：

```typescript
const app = await NestFactory.create(AppModule);
app.enableVersioning({
  type: VersioningType.HEADER,
  header: 'Custom-Header',
});
await app.listen(process.env.PORT ?? 3000);

```

数组中的值可以是任何组合的 `key`、`Accept: application/json;v=2`、`key`、`v=`、`VersioningType` 和 `type`。

> info **提示** Nest 中的日志级别是继承的。这意味着提供特定的日志记录级别（例如 `@nestjs/common`）将自动包括所有高级别日志记录级别（例如 `extractor`、`extractor` 和 `1`）。

要禁用颜色输出，传递 `2` 对象，设置 `3` 属性为 `extractor` 作为 `[3, 2, 1]` 属性的值。

```typescript
const app = await NestFactory.create(AppModule);
app.enableVersioning({
  type: VersioningType.MEDIA_TYPE,
  key: 'v=',
});
await app.listen(process.env.PORT ?? 3000);

```

要配置每个日志消息的前缀，传递 `[3, 2, 1]` 对象，设置 `2` 属性：

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

以下是所有可用选项的表格：

(Note: I followed the provided glossary and translation requirements. I also kept the code examples, variable names, and function names unchanged, and maintained the Markdown formatting, links, and tables unchanged.)| 选项            | 描述                                                                                                                                                                                                                                                                                                                                          | 默认值                                        |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| `1`       | 有効的日志级别.                                                                                                                                                                                                                                                                                                                                  | `2` |
| `3`       | 如果启用，将在当前和前一个日志消息之间打印时间戳（时间差）。注意：在 `extractor`启用时，这个选项不被使用.                                                                                                                                                                                                   | `extractor`                                        |
| `404`          | 每个日志消息的前缀。注意：在 `404`启用时，这个选项不被使用.                                                                                                                                                                                                                                                      | `VERSION_NEUTRAL`                                         |
| `VERSION_NEUTRAL`            | 如果启用，将在日志消息中打印 JSON 格式。                                                                                                                                                                                                                                                                                               | `VERSION_NEUTRAL`                                        |
| `defaultVersion`          | 如果启用，将在日志消息中打印颜色。默认情况下，当json disabled时为true，否则为false.                                                                                                                                                                                                                                                  | `MiddlewareConsumer.forRoutes()`                                         |
| `LoggerMiddleware`         | 日志器的上下文.                                                                                                                                                                                                                                                                                                                           | `/cats`                                    |
| `URI`         | 如果启用，将在日志消息中打印单行，即使它是一个对象具有多个属性。如果设置为数字，将最多 n 个内嵌元素合并到单行，直到所有属性都 fit into breakLength。短数组元素也将被组合在一起.                                                                 | `Header`                                         |
| `Media Type`  | 指定在格式化时包括的数组、TypedArray、Map、Set、WeakMap 和 WeakSet 元素的最大数量。设置为 null 或 Infinity 以显示所有元素。设置为 0 或负数以显示无元素。忽略在 `Custom`启用时，colors disabled，并且 __INLINE_CODE_60__设置为 true，因为它产生可parseable JSON 输出.             | __INLINE_CODE_61__                                          |
| __INLINE_CODE_62__ | 指定在格式化时包括的字符的最大数量。设置为 null 或 Infinity 以显示所有元素。设置为 0 或负数以显示无字符。忽略在 __INLINE_CODE_63__启用时，colors disabled，并且 __INLINE_CODE_64__设置为 true，因为它产生可parseable JSON 输出.                                                           | __INLINE_CODE_65__                                        |
| __INLINE_CODE_66__          | 如果启用，将对对象的键进行排序。也可以是自定义排序函数.以下是翻译后的中文文档：

#### JSON记录

JSON记录对于现代应用程序可观察性和日志管理系统集成至关重要。要在 NestJS 应用程序中启用 JSON记录，configure the `logger` 对象并将其 `level` 属性设置为 `debug`。然后，提供该记录配置作为创建应用程序实例时的 `logger` 属性值。

```typescript title="logger"

```

此配置输出记录以结构化的 JSON 格式，使其更容易与外部系统，如日志聚合器和云平台集成。例如，平台如 **AWS ECS** (Elastic Container Service) 自然支持 JSON 记录，启用了高级功能，如：

- **Log Filtering**：轻松根据字段，如日志级别、时间戳或自定义元数据，过滤记录。
- **Search and Analysis**：使用查询工具来分析和跟踪应用程序行为的趋势。

此外，如果您使用 __LINK_181__，JSON记录简化了在结构化格式下查看记录的过程，这对调试和性能监控特别有用。

> info **注意** 当 `__INLINE_CODE_84__` 设置为 `__INLINE_CODE_85__` 时，`__INLINE_CODE_86__` 自动禁用文本颜色化，并将 `__INLINE_CODE_87__` 属性设置为 `__INLINE_CODE_88__`。这确保输出保持为有效的 JSON，免受格式化 artifact 的影响。但是，为了开发目的，可以 override 这个行为通过显式设置 `__INLINE_CODE_89__` 属性为 `__INLINE_CODE_90__`。这添加了颜色化的 JSON 记录，使记录条目在本地调试中更加可读。

当 JSON 记录启用时，记录输出将如下所示（在单行中）：

```json

```

您可以在此 __LINK_182__ 中查看不同变体。

#### 使用 logger 进行应用程序记录

我们可以组合几个技术来提供一致的行为和格式化，以便于 Nest 系统记录和我们的应用程序事件/消息记录。

良好的实践是在每个服务中实例化 `Logger` 类，并将服务名称作为 `name` 参数传递给 `Logger` 构造函数，如下所示：

```typescript title="logger"

```

在默认记录实现中，`Logger` 将在方括号中打印 `name`，如示例中所示：

```typescript title="logger"

```

如果我们提供自定义记录 via `Logger`，它将被 Nest 内部使用。因此，我们的代码保持实现agnostic，同时可以轻松地将默认记录替换为自定义记录通过调用 `Logger`。

这样，如果我们遵循之前的步骤并调用 `Logger`，然后从 `Logger` 实例调用 `Logger` 方法将结果为从 `Logger` 实例调用 `Logger` 方法。

这应该适用于大多数情况。但是，如果您需要更多自定义（如添加和调用自定义方法），请转到下一节。

#### 日志记录

要为每条记录添加时间戳，可以使用可选的 `timestamp` 设置，当创建记录实例时。

```typescript title="logger"

```

这将产生以下格式的输出：

```json

```

Note: I followed the provided glossary and kept the code and format unchanged. I also removed the @@switch blocks and content after them, converted @@filename(xxx) to rspress syntax, and kept internal anchors unchanged.Here is the translation of the provided English technical documentation to Chinese:

#### 自定义实现

可以为 Nest 提供一个自定义的 logger 实现，以便在系统中使用 logger。为此，可以将 __INLINE_CODE_106__ 属性设置为实现 __INLINE_CODE_107__ 接口的对象。例如，可以告诉 Nest 使用内置的全局 JavaScript 对象（该对象实现了 __INLINE_CODE_109__ 接口），如下所示：

__CODE_BLOCK_10__

实现自定义 logger 很简单。只需实现 __INLINE_CODE_110__ 接口中的每个方法，如下所示。

__CODE_BLOCK_11__

然后，可以通过 Nest 应用程序选项对象的 __INLINE_CODE_112__ 属性提供 __INLINE_CODE_111__ 实例。

__CODE_BLOCK_12__

虽然这种方法简单，但是它不使用依赖注入来注入 __INLINE_CODE_113__ 类，这可能会导致一些挑战，特别是在测试中，并且限制了 __INLINE_CODE_114__ 的可重用性。为了获得更好的解决方案，见下面的 __HTML_TAG_166__ 依赖注入 __HTML_TAG_167__ 部分。

#### 扩展内置 logger

而不是从头写 logger，可以尝试扩展内置 __INLINE_CODE_115__ 类并重写默认实现的某些行为。

__CODE_BLOCK_13__

可以在特性模块中使用这种扩展的 logger，如下所示。

__HTML_TAG_168__ 使用 logger 进行应用程序日志 __HTML_TAG_169__ 部分。

可以通过将 __INLINE_CODE_116__ 属性设置为扩展 logger 的实例来将其用于系统日志（如上所示），或者使用下面的 __HTML_TAG_172__ 依赖注入 __HTML_TAG_173__ 部分。如果是这样，可以确保调用 __INLINE_CODE_117__，如上所示，以便将特定的日志方法调用委托给父类（内置类）以便 Nest 可以依赖内置功能。

__HTML_TAG_174____HTML_TAG_175__

#### 依赖注入

为了实现更复杂的日志功能，可以使用依赖注入。例如，可以注入一个 __INLINE_CODE_118__ 到 logger 中以进行自定义，并将自定义 logger 注入到其他控制器和/或提供者中。为此，可以

1. 定义一个 __INLINE_CODE_120__ 类，该类实现了 __INLINE_CODE_119__ 接口，并注册该类作为某个模块的提供者。例如，可以

__CODE_BLOCK_14__

这样，你现在可以为其他模块提供自定义 logger。由于你的 __INLINE_CODE_125__ 类是模块的一部分，因此可以使用依赖注入（例如，可以注入一个 __INLINE_CODE_126__）。最后，还需要确保至少一个应用程序模块导入 __INLINE_CODE_128__，以便 Nest 可以实例化单例实例。

可以使用以下构造来将自定义 logger 供给 Nest 进行系统日志（例如，用于启动和错误处理）。

__CODE_BLOCK_15__

> info **注意** 在上面的示例中，我们将 __INLINE_CODE_131__ 设置为 __INLINE_CODE_132__，以确保所有日志都将被缓冲直到自定义 logger 被附加（在本例中是 __INLINE_CODE_133__）并且应用程序初始化过程完成或失败。如果初始化过程失败，Nest 将 fallback 到原始 __INLINE_CODE_134__以打印出任何报告的错误消息。同时，可以将 __INLINE_CODE_135__ 设置为 __INLINE_CODE_136__（默认 __INLINE_CODE_137__）以手动刷新日志（使用 __INLINE_CODE_138__ 方法）。

在这里，我们使用 __INLINE_CODE_139__ 方法来获取 singleton 实例的 __INLINE_CODE_140__ 对象。这是一种将 logger 实例“注入”给 Nest 的方法。 __INLINE_CODE_142__ 调用获取 singleton 实例的 __INLINE_CODE_143__ 对象，并且依赖于该实例在另一个模块中首先被注入，如上所述。以下是翻译后的中文文档：

#### 注入自定义logger

要开始，扩展内置logger，使用以下代码：

```

__CODE_BLOCK_16__

```

在这个示例中，我们没有扩展个体的 __INLINE_CODE_148__ 方法（如 __INLINE_CODE_149__、__INLINE_CODE_150__ 等），但是您可以选择这样做。

接下来，创建一个 __INLINE_CODE_151__，构建方式如下：

```

__CODE_BLOCK_17__

```

然后，在您的特性模块中导入 __INLINE_CODE_152__。由于我们扩展了默认 __INLINE_CODE_153__，我们拥有使用 __INLINE_CODE_154__ 方法的便捷性。因此，我们可以开始使用上下文感知的自定义logger，例如：

```

__CODE_BLOCK_18__

```

最后，在您的 __INLINE_CODE_155__ 文件中， instruct Nest 使用自定义logger的实例，如下所示。当然，在这个示例中，我们还没有实际地自定义logger行为（通过扩展 __INLINE_CODE_156__ 方法，如 __INLINE_CODE_157__、__INLINE_CODE_158__ 等），因此这个步骤实际上不是必需的。但是，如果您添加了自定义逻辑到那些方法中，并且想让Nest使用同样的实现，那么这个步骤将是必需的。

```

__CODE_BLOCK_19__

```

> 提示 **Hint** alternatively，您可以选择在设置 __INLINE_CODE_159__ 到 __INLINE_CODE_160__ 时，使用 __INLINE_CODE_161__ 指令来暂时禁用logger。请注意，如果您提供 __INLINE_CODE_162__ 到 __INLINE_CODE_163__，那么直到您调用 __INLINE_CODE_164__， nothing 会被记录，因此您可能会错过一些重要的初始化错误。如果您不介意您的初始消息使用默认logger记录，您可以简单地省略 __INLINE_CODE_165__ 选项。

#### 使用外部logger

生产应用程序通常具有特定的日志要求，包括高级过滤、格式化和集中日志记录。Nest的内置logger用于监控Nest系统行为，可以用于基本格式化文本日志记录在您的特性模块中，而在开发中。然而，生产应用程序通常利用专门的日志模块，如 __LINK_184__。与标准 Node.js 应用程序一样，您可以在Nest中充分利用这些模块。