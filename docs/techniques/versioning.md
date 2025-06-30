# 版本控制

> info **提示** 本章节仅适用于基于 HTTP 的应用程序。

版本控制允许你在同一应用程序中运行**不同版本**的控制器或独立路由。应用程序经常发生变化，在需要支持旧版本的同时进行破坏性变更的情况并不罕见。

支持 4 种类型的版本控制：

<table>
  <tr>
    <td><a href='techniques/versioning#uri-versioning-type'><code>URI Versioning</code></a></td>
    <td>版本将通过请求的 URI 传递（默认）</td>
  </tr>
  <tr>
    <td><a href='techniques/versioning#header-versioning-type'><code>Header Versioning</code></a></td>
    <td>自定义请求头将指定版本</td>
  </tr>
  <tr>
    <td><a href='techniques/versioning#media-type-versioning-type'><code>Media Type Versioning</code></a></td>
    <td>请求的 <code>Accept</code> 头将指定版本</td>
  </tr>
  <tr>
    <td><a href='techniques/versioning#custom-versioning-type'><code>Custom Versioning</code></a></td>
    <td>请求的任何部分都可用于指定版本(s)。提供自定义函数来提取所述版本(s)。</td>
  </tr>
</table>

#### URI 版本控制类型

URI 版本控制使用请求 URI 中传递的版本号，例如 `https://example.com/v1/route` 和 `https://example.com/v2/route`。

> warning **注意** 使用 URI 版本控制时，版本号会自动添加到 URI 中，位于<a href="faq/global-prefix">全局路径前缀</a>（如果存在）之后，任何控制器或路由路径之前。

要为您的应用程序启用 URI 版本控制，请执行以下操作：

```typescript title="main"
const app = await NestFactory.create(AppModule);
// or "app.enableVersioning()"
app.enableVersioning({
  type: VersioningType.URI,
});
await app.listen(process.env.PORT ?? 3000);
```

> warning **注意** URI 中的版本号默认会自动添加前缀 `v`，但您可以通过设置 `prefix` 键来自定义前缀值，或设为 `false` 来禁用该功能。

> info **提示** `VersioningType` 枚举可用于 `type` 属性，它从 `@nestjs/common` 包中导入。

#### 头部版本控制类型

头部版本控制通过自定义的用户指定请求头来指定版本，该请求头的值将作为请求使用的版本号。

头部版本控制的 HTTP 请求示例：

要为您的应用程序启用**头部版本控制** ，请执行以下操作：

```typescript title="main"
const app = await NestFactory.create(AppModule);
app.enableVersioning({
  type: VersioningType.HEADER,
  header: 'Custom-Header',
});
await app.listen(process.env.PORT ?? 3000);
```

`header` 属性应为包含请求版本的头部名称。

> info **提示** `VersioningType` 枚举可用于 `type` 属性，该枚举从 `@nestjs/common` 包导入。

#### 媒体类型版本控制类型

媒体类型版本控制使用请求的 `Accept` 头部来指定版本。

在 `Accept` 头部中，版本号与媒体类型之间用分号 `;` 分隔。它应包含一个表示请求所用版本的键值对，例如 `Accept: application/json;v=2`。在确定要配置的版本时，该键更多地被视为前缀，配置时将包含键和分隔符。

要为应用程序启用**媒体类型版本控制** ，请执行以下操作：

```typescript title="main"
const app = await NestFactory.create(AppModule);
app.enableVersioning({
  type: VersioningType.MEDIA_TYPE,
  key: 'v=',
});
await app.listen(process.env.PORT ?? 3000);
```

`key` 属性应作为包含版本信息的键值对的键名和分隔符。例如 `Accept: application/json;v=2` 中，`key` 属性应设置为 `v=`。

> info **提示** `VersioningType` 枚举可用于 `type` 属性，该枚举从 `@nestjs/common` 包导入。

#### 自定义版本控制类型

自定义版本控制可使用请求的任何方面来指定版本（或多个版本）。通过 `extractor` 提取函数分析传入请求，该函数返回字符串或字符串数组。

如果请求方提供了多个版本，提取器函数可以返回一个字符串数组，按版本从高到低的顺序排序。版本会按照从高到低的顺序依次匹配路由。

如果从 `extractor` 返回空字符串或空数组，则不会匹配任何路由并返回 404。

例如，如果传入请求指定支持版本 `1`、`2` 和 `3`，则 `extractor` **必须**返回 `[3, 2, 1]`。这确保会优先选择最高可能的路由版本。

如果提取的版本是 `[3, 2, 1]`，但仅存在版本 `2` 和 `1` 的路由，则会选中匹配版本 `2` 的路由（版本 `3` 会被自动忽略）。

> warning **注意** 由于设计限制，基于 `extractor` 返回的数组选择最高匹配版本**在 Express 适配器中无法可靠工作**。单一版本（字符串或单元素数组）在 Express 中可正常工作。Fastify 则能正确支持最高匹配版本选择和单一版本选择。

要为应用启用 **自定义版本控制** ，请创建 `extractor` 函数并按如下方式传入应用：

```typescript title="main"
// 从自定义头部提取版本列表并转换为排序数组的示例提取器。
// 此示例使用 Fastify，但 Express 请求也可以类似处理。
const extractor = (request: FastifyRequest): string | string[] =>
  [request.headers['custom-versioning-field'] ?? '']
     .flatMap(v => v.split(','))
     .filter(v => !!v)
     .sort()
     .reverse()
```

const app = await NestFactory.create(AppModule);
app.enableVersioning({
  type: VersioningType.CUSTOM,
  extractor,
});
await app.listen(process.env.PORT ?? 3000);
```

#### 使用方法

版本控制功能允许您对控制器、单个路由进行版本管理，同时也为某些资源提供了退出版本控制的选项。无论应用使用何种版本控制类型，其使用方式都保持一致。

> warning **注意** 如果应用程序启用了版本控制，但控制器或路由未指定版本，对该控制器/路由的任何请求都将返回 `404` 响应状态。同样，如果收到的请求包含没有对应控制器或路由的版本，也将返回 `404` 响应状态。

#### 控制器版本

可以将版本应用于控制器，为该控制器内的所有路由设置版本。

要为控制器添加版本，请执行以下操作：

```typescript title="cats.controller"
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

#### 路由版本

可以为单个路由应用版本。该版本将覆盖所有会影响该路由的其他版本，例如控制器版本。

要为单个路由添加版本，请执行以下操作：

```typescript title="cats.controller"
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
```

#### 多版本

可以对控制器或路由应用多个版本。要使用多个版本，您需要将版本设置为数组。

添加多个版本的操作如下：

```typescript title="cats.controller"
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

#### 版本"中性"

某些控制器或路由可能不关心版本，无论版本如何都具有相同的功能。为了适应这种情况，可以将版本设置为 `VERSION_NEUTRAL` 符号。

无论请求中是否包含版本号，传入的请求都将被映射到 `VERSION_NEUTRAL` 控制器或路由。

> **注意** 对于 URI 版本控制，`VERSION_NEUTRAL` 资源不会在 URI 中包含版本号。

要添加版本中立的控制器或路由，请执行以下操作：

```typescript title="cats.controller"
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
```

#### 全局默认版本

如果您不想为每个控制器/单独路由提供版本，或者希望为所有未指定版本的控制器/路由设置默认版本，可以按如下方式配置 `defaultVersion`：

```typescript title="main"
app.enableVersioning({
  // ...
  defaultVersion: '1'
  // or
  defaultVersion: ['1', '2']
  // or
  defaultVersion: VERSION_NEUTRAL
});
```

#### 中间件版本控制

[中间件](https://docs.nestjs.com/middleware)同样可以利用版本元数据来为特定路由版本配置中间件。为此，需将版本号作为 `MiddlewareConsumer.forRoutes()` 方法的参数之一：

```typescript title="app.module"
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

通过上述代码，`LoggerMiddleware` 将仅应用于'2'版本的 `/cats` 端点。

> info **提示** 中间件适用于本节描述的任何版本控制类型：`URI`、`Header`、`Media Type` 或 `Custom`。
