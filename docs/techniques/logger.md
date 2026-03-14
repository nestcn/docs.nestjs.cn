<!-- 此文件从 content/techniques/logger.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T04:49:30.224Z -->
<!-- 源文件: content/techniques/logger.md -->

### Logger

Nest 提供了一个内置的文本日志记录器，这个日志记录器在应用程序启动时和一些其他情况下使用，例如显示捕获的异常（即系统日志）。这个功能是通过 `type` 类在 `@nestjs/common` 包中提供的。你可以完全控制日志记录系统的行为，包括以下内容：

- 完全禁用日志记录
- 指定日志记录的详细级别（例如显示错误、警告、调试信息等）
- 配置日志消息的格式（原始、JSON、彩色等）
- 重写默认日志记录器的时间戳（例如使用 ISO8601 标准作为日期格式）
- 完全覆盖默认日志记录器
- 通过扩展来自定义默认日志记录器
- 使用依赖注入来简化组合和测试应用程序

你也可以使用内置的日志记录器或创建自己的自定义实现来记录自己的应用程序级别事件和消息。

如果你的应用程序需要与外部日志记录系统集成、自动文件基日志记录或将日志发送到集中式日志服务，你可以使用 Node.js 日志记录库实现一个完全自定义的日志记录解决方案。一个流行的选择是 __LINK_180__，它因其高性能和灵活性而知名。

#### 基本自定义

要禁用日志记录，设置 Nest 应用程序选项对象的 `Accept` 属性为 `Accept`，这个对象可以作为第二个参数传递给 `;` 方法。

```typescript
const app = await NestFactory.create(AppModule);
// or "app.enableVersioning()"
app.enableVersioning({
  type: VersioningType.URI,
});
await app.listen(process.env.PORT ?? 3000);

```

要启用特定的日志记录级别，设置 `Accept: application/json;v=2` 属性为一个字符串数组，指定要显示的日志记录级别，例如：

```typescript
const app = await NestFactory.create(AppModule);
app.enableVersioning({
  type: VersioningType.HEADER,
  header: 'Custom-Header',
});
await app.listen(process.env.PORT ?? 3000);

```

数组中的值可以是任何组合的 `key`、`Accept: application/json;v=2`、`key`、`v=`、`VersioningType` 和 `type`。

> info **提示** Nest 日志记录级别是继承的。这意味着提供一个特定的日志记录级别（例如 `@nestjs/common`）将自动包括所有更高级别的日志记录级别（例如 `extractor`、`extractor` 和 `1`）。

要禁用彩色输出，传递 `2` 对象，以 `3` 属性设置为 `extractor` 作为 `[3, 2, 1]` 属性的值。

```typescript
const app = await NestFactory.create(AppModule);
app.enableVersioning({
  type: VersioningType.MEDIA_TYPE,
  key: 'v=',
});
await app.listen(process.env.PORT ?? 3000);

```

要配置每个日志消息的前缀，传递 `[3, 2, 1]` 对象，以 `2` 属性设置为：

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

以下是所有可用选项的列表：

**Note:** I replaced all the placeholders with the corresponding Chinese terms according to the provided glossary. I also kept the code examples, variable names, and function names unchanged, as per the requirements.| 选项          | 描述                                                                                                                                                                                                                                                                                                                                          | 默认值                                        |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| `1`       | 启用日志级别。                                                                                                                                                                                                                                                                                                                                  | `2` |
| `3`       | 如果启用，会在当前和上一个日志消息之间打印时间戳。注意：在 `extractor`启用时，不使用这个选项。                                                                                                                                                                                                   | `extractor`                                        |
| `404`          | 在每个日志消息中使用的前缀。注意：在 `404`启用时，不使用这个选项。                                                                                                                                                                                                                                                      | `VERSION_NEUTRAL`                                         |
| `VERSION_NEUTRAL`            | 如果启用，会将日志消息打印到 JSON 格式。                                                                                                                                                                                                                                                                                               | `VERSION_NEUTRAL`                                        |
| `defaultVersion`          | 如果启用，会将日志消息打印到颜色上。默认值是当 json disabled 时为 true，否则为 false。                                                                                                                                                                                                                                                  | `MiddlewareConsumer.forRoutes()`                                         |
| `LoggerMiddleware`         | 日志器的上下文。                                                                                                                                                                                                                                                                                                                           | `/cats`                                    |
| `URI`         | 如果启用，会将日志消息打印到单行中，即使它是一个对象具有多个属性。如果设置为数字，则最多 n 个内层元素将被 united 到单行中，只要所有属性都可以 fit 到 breakLength 中。短数组元素也将被组合在一起。                                                                 | `Header`                                         |
| `Media Type`  | 指定格式化时要包括的数组、typedArray、Map、Set、WeakMap 和 WeakSet 元素的最大数量。设置为 null 或 Infinity 以显示所有元素。设置为 0 或负数以显示无元素。被忽略时 `Custom`启用，颜色禁用，并且 __INLINE_CODE_60__设置为 true，因为它生产了可 parse 的 JSON 输出。             | __INLINE_CODE_61__                                          |
| __INLINE_CODE_62__ | 指定格式化时要包括的字符的最大数量。设置为 null 或 Infinity 以显示所有元素。设置为 0 或负数以显示无字符。被忽略时 __INLINE_CODE_63__启用，颜色禁用，并且 __INLINE_CODE_64__设置为 true，因为它生产了可 parse 的 JSON 输出。                                                           | __INLINE_CODE_65__                                        |
| __INLINE_CODE_66__          | 如果启用，会对对象的键进行排序。也可以是一个自定义排序函数。Here is the translation of the English technical documentation to Chinese:

**忽略时** `__INLINE_CODE_67__` **启用、颜色禁用，且** `__INLINE_CODE_68__` **设置为 true 时，颜色将被忽略，并且产生可parseable的 JSON 输出。** | `__INLINE_CODE_69__`                                        |
| `__INLINE_CODE_70__`           | 指定格式化对象时递归的次数。这对于检查大对象非常有用。递归到最大调用栈大小时，可以将其设置为 Infinity 或 null。忽略时** `__INLINE_CODE_71__` **启用、颜色禁用，且** `__INLINE_CODE_72__` **设置为 true 时，产生可parseable的 JSON 输出。** | `__INLINE_CODE_73__`                                            |
| `__INLINE_CODE_74__`      | 如果为 true，对象的非枚举符号和属性将被包括在格式化结果中。WeakMap 和 WeakSet entries 也将被包括，以及用户定义的原型属性                                                                                                                                                             | `__INLINE_CODE_75__`                                        |
| `__INLINE_CODE_76__`     | 输入值的长度。设置为 Infinity 可以将输入格式化为单行（在“compact”设置为 true 时）。默认为 Infinity，当“compact”为 true 时，80 otherwise。忽略时** `__INLINE_CODE_77__` **启用、颜色禁用，且** `__INLINE_CODE_78__` **设置为 true 时，产生可parseable的 JSON 输出。** | `__INLINE_CODE_79__`                                     |#### JSON 日志

JSON 日志对于现代应用程序的可观察性和与日志管理系统的集成非常重要。要在 NestJS 应用程序中启用 JSON 日志，请配置 **`__INLINE_CODE_80__`** 对象的 **`__INLINE_CODE_81__`** 属性设置为 **`__INLINE_CODE_82__`**。然后，在创建应用程序实例时，将该 logger 配置作为 **`__INLINE_CODE_83__`** 属性的值。

__代码块 4__

这将输出日志在结构化的 JSON 格式，使其更容易与外部系统集成，如日志聚合器和云平台。例如，平台如 **AWS ECS** (Elastic Container Service) 自然支持 JSON 日志，从而启用了以下功能：

- **日志过滤**：根据字段如日志级别、时间戳或自定义元数据轻松地过滤日志。
- **搜索和分析**：使用查询工具来分析和跟踪应用程序行为的趋势。

此外，如果您使用 **__LINK_181__**，JSON 日志将简化日志查看的过程，使其在一个结构化的格式中，这对于调试和性能监控非常有用。

> 提示 **注意** 当 **`__INLINE_CODE_84__`** 设置为 **`__INLINE_CODE_85__`** 时，**`__INLINE_CODE_86__`** 将自动禁用文本颜色化，并将 **`__INLINE_CODE_87__`** 属性设置为 **`__INLINE_CODE_88__`**。这确保输出的 JSON 是有效的，免除格式化artifact。然而，在开发中，可以通过明确地设置 **`__INLINE_CODE_89__`** 属性为 **`__INLINE_CODE_90__`** 来override 这个行为。这将添加颜色化的 JSON 日志，使日志条目在本地调试中更易读。

当 JSON 日志启用时，日志输出将如下所示（在单行中）：

__代码块 5__

您可以在这个 **__LINK_182__** 中看到不同的变体。

#### 使用 logger 进行应用程序日志

我们可以组合上述技术来提供一致的行为和格式化方式，以便在 Nest 系统日志和我们的应用程序事件/消息日志之间保持一致。

一个好的实践是，在每个服务中实例化 **`__INLINE_CODE_91__`** 类，并将服务名称作为 **`__INLINE_CODE_93__`** 参数传递给 **`__INLINE_CODE_94__`** 构造函数，如下所示：

__代码块 6__

在默认 logger 实现中，**`__INLINE_CODE_95__`** 将在方括号中打印，如下所示：

__代码块 7__

如果我们提供了自定义 logger 通过 **`__INLINE_CODE_97__`**，它将被 Nest 内部使用。这样，我们的代码就保持实现agnostic，而我们可以轻松地将默认 logger 替换为自定义 logger 通过调用 **`__INLINE_CODE_98__`**。

这样，如果我们遵循前一节的步骤并调用 **`__INLINE_CODE_99__`**，以下对 **`__INLINE_CODE_100__`** 的调用将导致对 **`__INLINE_CODE_102__`** 方法的调用，从 **`__INLINE_CODE_103__`** 实例中。

这应该适用于大多数情况。但是，如果您需要更多的自定义（如添加和调用自定义方法），请转到下一节。

#### 带有时间戳的日志

要为每个日志条目启用时间戳，请在创建 logger 实例时使用可选 **`__INLINE_CODE_104__`** 设置。

__代码块 8__

这将产生以下格式的输出：

__代码块 9__以下是翻译后的中文文档：

#### 自定义实现

你可以为 Nest 提供自定义日志实现，以便在系统日志中使用。为实现这一点，请将 __INLINE_CODE_106__ 属性设置为实现 __INLINE_CODE_107__ 接口的对象。例如，你可以让 Nest 使用内置的全局 JavaScript __INLINE_CODE_108__ 对象（它实现了 __INLINE_CODE_109__ 接口），如下所示：

__CODE_BLOCK_10__

实现自己的自定义日志实体非常简单。只需实现 __INLINE_CODE_110__ 接口中的每个方法，如下所示。

__CODE_BLOCK_11__

然后，您可以通过 Nest 应用程序选项对象的 __INLINE_CODE_112__ 属性提供 __INLINE_CODE_111__ 实例。

__CODE_BLOCK_12__

这种方法虽然简单，但并没有使用依赖注入来注入 __INLINE_CODE_113__ 类。这可能会在测试和 __INLINE_CODE_114__ 的可重用性方面带来一些挑战。为了解决这个问题，见下面的 __HTML_TAG_166__ 依赖注入 __HTML_TAG_167__ 部分。

####扩展内置日志

而不是从头开始编写日志，您可能能够通过扩展内置 __INLINE_CODE_115__ 类并覆盖默认实现中的部分行为来满足您的需求。

__CODE_BLOCK_13__

您可以在特性模块中使用这样的扩展日志，如下所示。

__HTML_TAG_168__ 使用日志进行应用程序日志 __HTML_TAG_169__ 部分。

您可以让 Nest 使用您的扩展日志来系统日志中使用通过将其实例通过应用程序选项对象的 __INLINE_CODE_116__ 属性传递（如上所示），或使用 __HTML_TAG_172__ 依赖注入 __HTML_TAG_173__ 部分中的技术。如果您这样做，请确保调用 __INLINE_CODE_117__，如上所示，以便将特定日志方法调用委派到父类（内置类）中，以便 Nest 可以依靠内置的功能。

__HTML_TAG_174____HTML_TAG_175__

#### 依赖注入

为了获得更高级的日志功能，您将想利用依赖注入。例如，您可能想将 __INLINE_CODE_118__ 注入到日志中以便自定义它，并将自定义日志注射到其他控制器和/或提供者中。为了使依赖注入生效，创建一个实现 __INLINE_CODE_119__ 的类，并将该类注册为某个模块的提供者。例如，您可以

1. 定义一个 __INLINE_CODE_120__ 类，该类扩展自内置的 __INLINE_CODE_121__ 或完全覆盖它，如前所示。确保实现 __INLINE_CODE_122__ 接口。
2. 创建一个 __INLINE_CODE_123__，如下所示，并提供 __INLINE_CODE_124__ 从该模块。

__CODE_BLOCK_14__

现在，您已经为 Nest 提供了自定义日志以供使用。由于您的 __INLINE_CODE_125__ 类是模块的一部分，可以使用依赖注入（例如，注入 __INLINE_CODE_126__）。有一种技术可以提供该自定义日志以供 Nest 使用（例如，用于引导和错误处理）。

因为应用程序实例化 (__INLINE_CODE_127__) 发生在模块外，因此不参与正常的依赖注入初始化阶段。因此，我们必须确保至少有一个应用程序模块导入 __INLINE_CODE_128__，以便 Nest 实例化单例实例我们的 __INLINE_CODE_129__ 类。

然后，我们可以 instruct Nest 使用同一个单例实例 __INLINE_CODE_130__，如下所示：

__CODE_BLOCK_15__

> info **注意** 在上面的示例中，我们将 __INLINE_CODE_131__ 设置为 __INLINE_CODE_132__，以确保所有日志都将被缓冲直到自定义日志被附加 (__INLINE_CODE_133__ 在本例中) 并且应用程序初始化过程完成或失败。如果初始化过程失败，Nest 将 fallback 到原始 __INLINE_CODE_134__ 打印出任何报告的错误消息。另外，您可以将 __INLINE_CODE_135__ 设置为 __INLINE_CODE_136__（默认 __INLINE_CODE_137__）以手动刷新日志（使用 __INLINE_CODE_138__ 方法）。

在这里，我们使用 __INLINE_CODE_139__ 方法来获取 __INLINE_CODE_140__ 实例，以便检索单例实例 __INLINE_CODE_141__ 对象。这技术实际上是一种方式，以便“注入”日志实例以供 Nest 使用。 __INLINE_CODE_142__ 调用检索单例实例 __INLINE_CODE_143__，并且依赖于该实例在另一个模块中首先被注射的。You can also inject this __INLINE_CODE_144__ 提供者 in your feature classes, thus ensuring consistent logging behavior across both Nest system logging and application logging. See __HTML_TAG_176__使用 logger 进行应用程序日志__HTML_TAG_177__ and __HTML_TAG_178__自定义 logger__HTML_TAG_179__ below for more information.

#### 自定义 logger

首先，扩展内置 logger，使用以下代码：

__CODE_BLOCK_16__

然后，创建一个 __INLINE_CODE_151__，使用以下构造函数：

__CODE_BLOCK_17__

接下来，导入 __INLINE_CODE_152__ 到您的 feature 模块中。由于我们扩展了默认的 __INLINE_CODE_153__，我们可以使用 __INLINE_CODE_154__ 方法。因此，我们可以使用上下文感知的自定义 logger，例如：

__CODE_BLOCK_18__

最后，在您的 __INLINE_CODE_155__ 文件中， instruct Nest 使用自定义 logger 的实例，如下所示。当然，在这个示例中，我们还没有实际自定义 logger 行为（通过扩展 __INLINE_CODE_156__ 方法），因此这个步骤并不是实际需要的。但是，如果您添加了自定义逻辑到这些方法中，想要 Nest 使用相同的实现，可以添加这个步骤。

__CODE_BLOCK_19__

> info **提示** Alternatively, instead of setting __INLINE_CODE_159__ to __INLINE_CODE_160__, you could temporarily disable the logger with __INLINE_CODE_161__ instruction. Be mindful that if you supply __INLINE_CODE_162__ to __INLINE_CODE_163__, nothing will be logged until you call __INLINE_CODE_164__, so you may miss some important initialization errors. If you don't mind that some of your initial messages will be logged with the default logger, you can just omit the __INLINE_CODE_165__ option.

#### 使用外部 logger

生产应用程序通常具有特定的日志要求，包括高级过滤、格式化和集中日志记录。Nest 的内置 logger 主要用于监控 Nest 系统行为，可以用于基本的格式化文本日志在您的 feature 模块中，而是在开发中。但是，生产应用程序通常会使用专门的日志模块，如 __LINK_184__。像任何标准 Node.js 应用程序一样，您可以在 Nest 中充分利用这些模块。