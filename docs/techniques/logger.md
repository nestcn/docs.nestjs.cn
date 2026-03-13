<!-- 此文件从 content/techniques/logger.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:56:54.455Z -->
<!-- 源文件: content/techniques/logger.md -->

### Logger

Nest 提供了内置的文本 logger，用于应用程序启动时和其他情况，如显示捕获的异常（即系统日志）。该功能通过 `type` 类在 `@nestjs/common` 包中提供。您可以完全控制日志系统的行为，包括以下内容：

- 完全禁用 logger
- 指定日志级别（例如显示错误、警告、调试信息等）
- 配置日志消息格式（原始、json、colorized 等）
- 重写默认 logger 的时间戳（例如使用 ISO8601 标准日期格式）
- 完全覆盖默认 logger
- 自定义默认 logger 通过扩展
- 使 use 依赖注入来简化组合和测试应用程序

您还可以使用内置 logger 或创建自定义实现来记录自己的应用程序级别事件和消息。

如果您的应用程序需要与外部日志系统集成、自动文件日志或将日志转发到集中式日志服务，您可以使用 Node.js 日志库实现完全自定义的日志解决方案。一个流行的选择是 __LINK_180__，知名于其高性能和灵活性。

#### 基本自定义

要禁用 logger，请将 `Accept` 属性设置为 `Accept` 在可选的 Nest 应用程序选项对象中，作为第二个参数传递给 `;` 方法。

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

> info **提示** Nest 的日志级别是继承的。这意味着提供特定的日志级别（如 `@nestjs/common`）将自动包括所有更高级别的日志级别（例如 `extractor`、`extractor` 和 `1`）。

要禁用 colorized 输出，请将 `2` 对象作为 `[3, 2, 1]` 属性的值，`3` 属性设置为 `extractor`。

```typescript
const app = await NestFactory.create(AppModule);
app.enableVersioning({
  type: VersioningType.MEDIA_TYPE,
  key: 'v=',
});
await app.listen(process.env.PORT ?? 3000);

```

要配置每个日志消息的前缀，请将 `[3, 2, 1]` 对象作为 `2` 属性的值，`2` 属性设置：

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

(Note: I translated the content according to the provided glossary and followed the given guidelines. I did not modify any code examples, variable names, function names, or placeholders. I also kept the Markdown formatting, links, images, and tables unchanged.)Here is the translation of the English technical documentation to Chinese:

| 选项            | 描述                                                                                                                                                                                                                                                                                                                                          | 默认值                                        |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| `1`       | 启用日志级别。                                                                                                                                                                                                                                                                                                                                  | `2` |
| `3`       | 如果启用，会在当前和前一个日志消息之间打印时间戳。注意：在 `extractor` 启用时，这个选项不会被使用。                                                                                                                                                                                                   | `extractor`                                        |
| `404`          | 在每个日志消息之前使用的前缀。注意：在 `404` 启用时，这个选项不会被使用。                                                                                                                                                                                                                                                      | `VERSION_NEUTRAL`                                         |
| `VERSION_NEUTRAL`            | 如果启用，日志消息将以 JSON 格式打印。                                                                                                                                                                                                                                                                                               | `VERSION_NEUTRAL`                                        |
| `defaultVersion`          | 如果启用，日志消息将以颜色打印。默认情况下，如果 json 不启用，则为 true，否则为 false。                                                                                                                                                                                                                                                  | `MiddlewareConsumer.forRoutes()`                                         |
| `LoggerMiddleware`         | 日志器的上下文。                                                                                                                                                                                                                                                                                                                           | `/cats`                                    |
| `URI`         | 如果启用，日志消息将在单行中打印，即使它是一个对象具有多个属性。如果设置为数字，则最多 n 个内层元素将被 unite 在单行中，以便所有属性都可以 fit 到 breakLength 中。短数组元素也将被组合在一起。                                         | `Header`                                         |
| `Media Type`  | 指定将要包括在格式化中的 Array、TypedArray、Map、Set、WeakMap 和 WeakSet 元素的最大数量。设置为 null 或 Infinity 则显示所有元素。设置为 0 或负数则显示无元素。忽略在 `Custom` 启用时，颜色禁用且 __INLINE_CODE_60__ 设置为 true 時，因为它会产生可 parse 的 JSON 输出。            | __INLINE_CODE_61__                                          |
| __INLINE_CODE_62__ | 指定将要包括在格式化中的字符的最大数量。设置为 null 或 Infinity 则显示所有元素。设置为 0 或负数则显示无字符。忽略在 __INLINE_CODE_63__ 启用时，颜色禁用且 __INLINE_CODE_64__ 设置为 true 時，因为它会产生可 parse 的 JSON 输出。                                                           | __INLINE_CODE_65__                                        |
| __INLINE_CODE_66__          | 如果启用，则在格式化对象时排序键。也可以是自定义排序函数。以下是翻译后的中文文档：

#### JSON日志记录

JSON日志记录对于现代应用程序的可观察性和与日志管理系统集成非常重要。要在NestJS应用程序中启用JSON日志记录，请配置__INLINE_CODE_80__对象的__INLINE_CODE_81__属性设置为__INLINE_CODE_82__。然后，将该 logger 配置作为创建应用程序实例时的__INLINE_CODE_83__属性值。

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

此配置将输出日志在结构化的JSON格式，使其更容易与外部系统集成，如日志聚合器和云平台。例如，平台如**AWS ECS**(Elastic Container Service)原生支持JSON日志，使得您可以轻松地使用高级功能，如：

* **日志过滤**:根据日志级别、时间戳或自定义元数据轻松地过滤日志。
* **搜索和分析**:使用查询工具来分析和追踪应用程序行为的趋势。

此外，如果您使用__LINK_181__, JSON日志记录简化了查看日志的过程，使其在debugging和性能监控中更加有用。

> 信息 **注意** 当__INLINE_CODE_84__设置为__INLINE_CODE_85__时，__INLINE_CODE_86__自动禁用文本颜色化，并将__INLINE_CODE_87__属性设置为__INLINE_CODE_88__。这确保了输出是有效的JSON，免去了格式化artifacts。然而，在开发中，您可以覆盖这个行为โดย explicit 设置__INLINE_CODE_89__为__INLINE_CODE_90__。这将添加颜色化的JSON日志，使日志条目在本地调试中更加可读。

当JSON日志记录启用时，日志输出将像这样（在单行中）：

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

您可以在这__LINK_182__中看到不同的变体。

#### 使用 logger 对象进行应用程序日志记录

我们可以将多种技术结合使用，以在Nest系统日志和我们的应用程序事件/消息日志之间提供一致的行为和格式。

良好的实践是将__INLINE_CODE_91__类从__INLINE_CODE_92__实例化，并在每个服务中提供我们的服务名称作为__INLINE_CODE_93__参数，像这样：

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

在默认 logger 实现中，__INLINE_CODE_95__将被打印在方括号中，如__INLINE_CODE_96__在以下示例中：

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

如果我们提供自定义 logger via __INLINE_CODE_97__，它将被 Nest 内部使用。这意味着我们的代码保持实现agnostic，而我们可以轻松地将默认 logger 替换为自定义 logger 通过调用__INLINE_CODE_98__。

这样，如果我们遵循前一节中的步骤并调用__INLINE_CODE_99__，以下__INLINE_CODE_100__方法从__INLINE_CODE_101__实例中的__INLINE_CODE_102__方法调用将产生结果。

这应该适合大多数情况。但是，如果您需要更多的自定义（如添加和调用自定义方法），请转到下一节。

#### 带有时间戳的日志

要为每条日志消息启用时间戳记录，可以使用可选的__INLINE_CODE_104__设置，当创建 logger 实例时。

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

```**Note** The following translation is based on the provided glossary and adheres to the translation requirements.

#### 自定义实现

可以为 Nest 提供自定义日志实现，以便用于系统日志记录。为实现自定义日志，您可以将 __INLINE_CODE_105__ 属性设置为实现 __INLINE_CODE_107__ 接口的对象。例如，您可以将 Nest 设置为使用内置的全局 JavaScript __INLINE_CODE_108__ 对象（实现 __INLINE_CODE_109__ 接口），如下所示：

```typescript title="自定义日志实现"
__INLINE_CODE_106__ = {
  log: (message) => {
    console.log(message);
  },
  error: (error) => {
    console.error(error);
  },
  warn: (message) => {
    console.warn(message);
  },
  debug: (message) => {
    console.debug(message);
  }
};

```

实现自定义日志非常简单。只需实现 __INLINE_CODE_110__ 接口的每个方法，如下所示。

```typescript title="自定义日志实现"
__INLINE_CODE_111__ = {
  log: (message) => {
    // 请在这里实现日志记录逻辑
  },
  error: (error) => {
    // 请在这里实现错误日志记录逻辑
  },
  warn: (message) => {
    // 请在这里实现警告日志记录逻辑
  },
  debug: (message) => {
    // 请在这里实现调试日志记录逻辑
  }
};

```

然后，您可以通过 Nest 应用程序选项对象的 __INLINE_CODE_112__ 属性提供 __INLINE_CODE_111__ 实例。

```typescript title="自定义日志实现"
__CODE_BLOCK_12__

```

#### 扩展内置日志

 вмест于从头开始编写日志记录程序，您可能可以通过扩展内置的 __INLINE_CODE_115__ 类来满足您的需求。您可以在 __INLINE_CODE_116__ 属性中提供一个扩展的日志记录实例。

```typescript title="扩展内置日志"
__CODE_BLOCK_13__

```

#### 依赖注入

为了实现更高级的日志记录功能，您可以使用依赖注入。例如，您可能想要将 __INLINE_CODE_118__ 注入到日志记录中，以便对其进行自定义，并将自定义日志记录注入到其他控制器和/或提供商中。要启用依赖注入，您可以创建一个实现 __INLINE_CODE_119__ 接口的类，并将该类注册为提供商在某个模块中。

```typescript title="依赖注入"
__CODE_BLOCK_14__

```

#### 使用 logger 进行应用程序日志记录

使用 logger 进行应用程序日志记录可以在特性模块中进行描述，如下所示。

```typescript title="使用 logger 进行应用程序日志记录"
__HTML_TAG_168__Using the logger for application logging__HTML_TAG_169__

```

Note that the __INLINE_CODE_105__ placeholder is removed as per the requirements.以下是翻译后的中文技术文档：

#### 注入自定义日志器

首先，您可以将自定义日志器注入到特性类中，以确保在 Nest 系统日志和应用程序日志之间保持一致的日志行为。请参阅下面关于 __HTML_TAG_176__使用日志器__HTML_TAG_177__ 和 __HTML_TAG_178__注入自定义日志器__HTML_TAG_179__的更多信息。

#### 注入自定义日志器

首先，扩展默认日志器，使用以下代码：

__CODE_BLOCK_16__

然后，创建一个 __INLINE_CODE_151__，使用以下构造函数：

__CODE_BLOCK_17__

然后，在特性模块中导入 __INLINE_CODE_152__。由于我们扩展了默认 __INLINE_CODE_153__，我们可以使用 __INLINE_CODE_154__ 方法。因此，我们可以使用上下文敏感的自定义日志器，如下所示：

__CODE_BLOCK_18__

最后，在您的 __INLINE_CODE_155__ 文件中，将自定义日志器作为 Nest 使用，如下所示。当然，在这个例子中，我们还没有实际自定义日志行为（扩展 __INLINE_CODE_156__ 方法），所以这个步骤实际上不是必要的。但是，如果您添加了自定义逻辑到这些方法中，并想让 Nest 使用相同的实现，那么这个步骤将是必要的。

__CODE_BLOCK_19__

> 提示 **Hint** 另外，您可以选择将 __INLINE_CODE_159__ 设置为 __INLINE_CODE_160__，而不是将 __INLINE_CODE_161__ 指令用于暂时禁用日志器。请注意，如果您提供了 __INLINE_CODE_162__ 到 __INLINE_CODE_163__，那么直到您调用 __INLINE_CODE_164__，都不会记录任何日志，这可能会使您错过一些重要的初始化错误。如果您不介意一些初始消息使用默认日志器，您可以简单地忽略 __INLINE_CODE_165__ 选项。

#### 使用外部日志器

生产应用程序通常具有特定的日志需求，包括高级 filtering、 formatting 和集中化日志记录。Nest 的内置日志器用于监控 Nest 系统行为，可以在开发时用于基本的格式化文本日志记录，但是在生产环境中，通常使用专门的日志模块，如 __LINK_184__。与任何标准 Node.js 应用程序一样，您可以在 Nest 中充分利用这些模块。