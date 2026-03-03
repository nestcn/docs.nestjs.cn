<!-- 此文件从 content/techniques/versioning.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-03T04:17:57.612Z -->
<!-- 源文件: content/techniques/versioning.md -->

### 版本控制

> info **提示** 本章节仅适用于基于 HTTP 的应用程序。

版本控制允许您在同一个应用程序中拥有 **不同版本** 的控制器或个体路由。应用程序变化非常频繁，很少会出现需要支持之前版本的应用程序，而又需要对应用程序进行更新的情况。

支持 4 种版本控制：

<table>
  <tr>
    <td><a href='techniques/versioning#uri-versioning-type'><code>URI 版本控制</code></a></td>
    <td>版本将通过请求的 URI 传递（默认）</td>
  </tr>
  <tr>
    <td><a href='techniques/versioning#header-versioning-type'><code>Header 版本控制</code></a></td>
    <td>自定义请求头将指定版本</td>
  </tr>
  <tr>
    <td><a href='techniques/versioning#media-type-versioning-type'><code>Media Type 版本控制</code></a></td>
    <td>请求的 <code>Accept</code> 标头将指定版本</td>
  </tr>
  <tr>
    <td><a href='techniques/versioning#custom-versioning-type'><code>自定义版本控制</code></a></td>
    <td>请求的任何方面都可以用于指定版本。提供了一个自定义函数来提取所述版本。</td>
  </tr>
</table>

#### URI 版本控制类型

URI 版本控制使用请求 URI 中的版本，例如 `https://example.com/v1/route` 和 `https://example.com/v2/route`。

> warning **注意** 使用 URI 版本控制时，版本将自动添加到 URI 中，位于全局路径前缀（如果存在）之后，控制器或路由路径之前。

要为您的应用程序启用 URI 版本控制，请执行以下操作：

```typescript
@@filename(main)
const app = await NestFactory.create(AppModule);
// 或使用 "app.enableVersioning()"
app.enableVersioning({
  type: VersioningType.URI,
});
await app.listen(process.env.PORT ?? 3000);
```

> warning **注意** URI 中的版本默认会自动加上 `v` 前缀，但可以通过将 `prefix` 键设置为您所需的前缀来配置前缀值，或者如果您希望禁用它，则设置为 `false`。

> info **提示** `VersioningType` 枚举可用于 `type` 属性，并从 `@nestjs/common` 包中导入。

#### Header 版本控制类型

Header 版本控制使用自定义的、用户指定的请求头来指定版本，其中标头的值将是要用于请求的版本。

Header 版本控制的 HTTP 请求示例：

要为您的应用程序启用 **Header 版本控制**，请执行以下操作：

```typescript
@@filename(main)
const app = await NestFactory.create(AppModule);
app.enableVersioning({
  type: VersioningType.HEADER,
  header: 'Custom-Header',
});
await app.listen(process.env.PORT ?? 3000);
```

`header` 属性应该是包含请求版本的标头的名称。

> info **提示** `VersioningType` 枚举可用于 `type` 属性，并从 `@nestjs/common` 包中导入。

#### Media Type 版本控制类型

Media Type 版本控制使用请求的 `Accept` 标头来指定版本。

在 `Accept` 标头中，版本通过分号 `;` 与媒体类型分隔。然后它应该包含一个表示要用于请求的版本的键值对，例如 `Accept: application/json;v=2`。在确定版本时，键被更多地视为前缀，将配置为包括键和分隔符。

要为您的应用程序启用 **Media Type 版本控制**，请执行以下操作：

```typescript
@@filename(main)
const app = await NestFactory.create(AppModule);
app.enableVersioning({
  type: VersioningType.MEDIA_TYPE,
  key: 'v=',
});
await app.listen(process.env.PORT ?? 3000);
```

`key` 属性应该是包含版本的键值对的键和分隔符。对于示例 `Accept: application/json;v=2`，`key` 属性将被设置为 `v=`。

> info **提示** `VersioningType` 枚举可用于 `type` 属性，并从 `@nestjs/common` 包中导入。

#### 自定义版本控制类型

自定义版本控制使用请求的任何方面来指定版本（或多个版本）。使用 `extractor` 函数分析传入请求，该函数返回字符串或字符串数组。

如果请求者提供了多个版本，提取器函数可以返回一个字符串数组，按从大/最高版本到最小/最低版本的顺序排序。版本按从高到低的顺序与路由匹配。

如果 `extractor` 返回空字符串或数组，则不匹配任何路由并返回 404。

例如，如果传入请求指定它支持版本 `1`、`2` 和 `3`，提取器 **必须** 返回 `[3, 2, 1]`。这确保首先选择最高可能的路由版本。

如果提取了版本 `[3, 2, 1]`，但仅存在版本 `2` 和 `1` 的路由，则选择匹配版本 `2` 的路由（版本 `3` 自动被忽略）。

> warning **注意** 由于设计限制，基于从 `extractor` 返回的数组选择最高匹配版本 **在 Express 适配器中无法可靠工作**。单个版本（字符串或 1 个元素的数组）在 Express 中工作正常。Fastify 正确支持最高匹配版本选择和单个版本选择。

要为您的应用程序启用 **自定义版本控制**，请创建一个 `extractor` 函数并将其传递到您的应用程序中，如下所示：

```typescript
@@filename(main)
// 示例提取器，从自定义标头中提取版本列表并将其转换为排序数组。
// 本示例使用 Fastify，但 Express 请求的处理方式类似。
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

#### 用法

版本控制允许您对控制器、单个路由进行版本控制，并提供了一种让某些资源退出版本控制的方法。无论您的应用程序使用哪种版本控制类型，版本控制的用法都是相同的。

> warning **注意** 如果为应用程序启用了版本控制，但控制器或路由未指定版本，则对该控制器/路由的任何请求都将返回 `404` 响应状态。 同样，如果收到的请求包含一个没有对应控制器或路由的版本，也将返回 `404` 响应状态。

#### 控制器版本

可以将版本应用于控制器，为控制器内的所有路由设置版本。

要为控制器添加版本，请执行以下操作：

```typescript
@@filename(cats.controller)
@Controller({
  version: '1',
})
export class CatsControllerV1 {
  @Get('cats')
  findAll(): string {
    return 'This action returns all cats for version 1';
  }
}
@@switch
@Controller({
  version: '1',
})
export class CatsControllerV1 {
  @Get('cats')
  findAll() {
    return 'This action returns all cats for version 1';
  }
}
```

#### 路由版本

可以将版本应用于单个路由。此版本将覆盖影响该路由的任何其他版本，例如控制器版本。

要为单个路由添加版本，请执行以下操作：

```typescript
@@filename(cats.controller)
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
@@switch
import { Controller, Get, Version } from '@nestjs/common';

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

#### 多个版本

可以将多个版本应用于控制器或路由。要使用多个版本，您可以将版本设置为数组。

要添加多个版本，请执行以下操作：

```typescript
@@filename(cats.controller)
@Controller({
  version: ['1', '2'],
})
export class CatsController {
  @Get('cats')
  findAll(): string {
    return 'This action returns all cats for version 1 or 2';
  }
}
@@switch
@Controller({
  version: ['1', '2'],
})
export class CatsController {
  @Get('cats')
  findAll() {
    return 'This action returns all cats for version 1 or 2';
  }
}
```

#### 版本“Neutral”

某些控制器或路由可能不关心版本，并且无论版本如何都具有相同的功能。为了适应这种情况，可以将版本设置为 `VERSION_NEUTRAL` 符号。

传入请求将被映射到 `VERSION_NEUTRAL` 控制器或路由，无论请求中发送的版本如何，此外如果请求根本不包含版本。

> warning **注意** 对于 URI 版本控制，`VERSION_NEUTRAL` 资源在 URI 中不会出现版本。

要添加版本 neutral 控制器或路由，请执行以下操作：

```typescript
@@filename(cats.controller)
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
@@switch
import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';

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

#### 全局默认版本

如果您不想为每个控制器/或单个路由提供版本，或者如果您希望为每个未指定版本的控制器/路由设置特定版本作为默认版本，您可以如下设置 `defaultVersion`：

```typescript
@@filename(main)
app.enableVersioning({
  // ...
  defaultVersion: '1'
  // 或
  defaultVersion: ['1', '2']
  // 或
  defaultVersion: VERSION_NEUTRAL
});
```

#### 中间件版本控制

[中间件](./middleware) 也可以使用版本控制元数据来为特定路由的版本配置中间件。 为此，请将版本号提供为 `MiddlewareConsumer.forRoutes()` 方法的参数之一：

```typescript
@@filename(app.module)
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

使用上面的代码，`LoggerMiddleware` 将仅应用于 `/cats` 端点的版本 '2'。

> info **注意** 中间件适用于本节中描述的任何版本控制类型：`URI`、`Header`、`Media Type` 或 `Custom`。