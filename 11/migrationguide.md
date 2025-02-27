# 迁移指南

本文提供了一套从 Nest 10 迁移到 Nest 11 的指南。要了解更多关于 Nest 11 中添加的新功能，请查看此[链接](https://trilon.io/blog/announcing-nestjs-11-whats-new)。

## 升级包

尽管您可以手动升级软件包，但我们建议使用 [npm-check-updates](https://npmjs.com/package/npm-check-updates) 以获得更简化的过程 

## Express V5 版本

经过多年的开发，Express v5 于 2024 年正式发布，并于 2025 年成为稳定版本。在 NestJS 11 中，Express v5 现在是集成到框架中的默认版本。虽然此更新对大多数用户来说是无缝的，但重要的是要知道 Express v5 引入了一些重大变化。有关详细指南，请参阅 [Express v5 迁移指南](https://expressjs.com/en/guide/migrating-5.html)。

Express v5 中最值得注意的更新之一是修改后的路径路由匹配算法。对路径字符串与传入请求的匹配方式引入了以下更改：

- 通配符 `*`必须有一个名称，与参数的行为匹配：使用 `/*splat` 或 `/{*splat}` 而不是 `/*` , splat 只是通配符参数的名称，没有特殊含义。你可以将其命名为任何你喜欢的名称，例如 `*wildcard`

- 不再支持可选字符 ?，请改用大括号：`/:file{.:ext}`。

- 不支持正则表达式字符。

- 为避免在升级 `(()[]?+!) ` 期间产生混淆，已保留某些字符，请使用 `\` 来转义它们。

- 参数名称现在支持有效的 JavaScript 标识符，或像 `:"this"` 一样用引号引起来。

也就是说，以前在 Express v4 中工作的路由可能无法在 Express v5 中工作。例如：

```
@Get('users/*')
findAll() {
  // In NestJS 11, this will be automatically converted to a valid Express v5 route.
  // While it may still work, it's no longer advisable to use this wildcard syntax in Express v5.
  return 'This route should not work in Express v5';
}
```

要解决此问题，你可以更新路由以使用命名通配符：

```
@Get('users/*splat')
findAll() {
  return 'This route will work in Express v5';
}
```

!> 请注意，`*splat` 是一个命名通配符，可匹配任何没有根路径的路径。如果你还需要匹配根路径`（/users`），则可以使用 `/users/{*splat}`，将通配符括在括号中（可选组）。请注意，splat 只是通配符参数的名称，没有特殊含义。你可以将其命名为任何你喜欢的名称，例如 *wildcard。


比如，如果你有一个在所有路由上运行的中间件，则可能需要更新路径以使用命名通配符：

```
// In NestJS 11, this will be automatically converted to a valid Express v5 route.
// While it may still work, it's no longer advisable to use this wildcard syntax in Express v5.
forRoutes('*'); // <-- This should not work in Express v5
```

相反，你可以更新路径以使用命名通配符：

```
forRoutes('{*splat}'); // <-- This will work in Express v5
```

?> 请注意，{*splat} 是一个命名通配符，可匹配任何路径（包括根路径）。外括号使路径成为可选项。



## 查询参数解析

?> 此更改仅适用于 Express v5。

在 Express V5 中，默认情况下不再使用 qs 库解析查询参数。相反，使用 simple 解析器，它不支持嵌套对象或数组。

因此，查询字符串如下：

```
?filter[where][name]=John&filter[where][age]=30
?item[]=1&item[]=2
```

将不再按预期进行解析。要恢复到以前的行为，你可以通过将 query parser 选项设置为 extended 将 Express 配置为使用 extended 解析器（Express v4 中的默认解析器）：

```
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule); // <-- Make sure to use <NestExpressApplication>
  app.set('query parser', 'extended'); // <-- Add this line
  await app.listen(3000);
}
bootstrap();
```



## Fastify V5

@nestjs/platform-fastify v11 现在终于支持 Fastify v5。此更新对于大多数用户来说应该是无缝的；但是，Fastify v5 引入了一些重大更改，尽管这些更改不太可能影响大多数 NestJS 用户。有关更多详细信息，请参阅 [Fastify v5 迁移指南](https://fastify.dev/docs/v5.1.x/Guides/Migration-Guide-V5/)。

?> Fastify v5 中的路径匹配没有任何变化（中间件除外，请参阅下面的部分），因此你可以继续像以前一样使用通配符语法。行为保持不变，使用通配符定义的路由（如 *）仍将按预期工作。

## Fastify 中间件注册

NestJS 11 现在使用最新版本的 path-to-regexp 包来匹配 @nestjs/platform-fastify 中的中间件路径。因此，用于匹配所有路径的 (.*) 语法不再受支持。相反，你应该使用命名通配符。

例如，如果你有一个适用于所有路由的中间件：

```
.forRoutes('(.*)');
```

你需要将其更新为使用命名通配符：

```
.forRoutes('*splat');
```

其中 splat 只是通配符参数的任意名称。你可以将其命名为任何你喜欢的名称。



## 模块解析算法

迁移指南
本文提供了从 NestJS 版本 10 迁移到版本 11 的全面指南。要探索 v11 中引入的新功能，请查看 此文章。虽然更新包含一些小的重大更改，但它们不太可能影响大多数用户。你可以查看完整的更改列表 此处。


升级包#
虽然你可以手动升级软件包，但我们建议使用 npm-check-updates (ncu) 以获得更简化的流程。


Express v5#
经过多年的发展，Express v5 于 2024 年正式发布，并于 2025 年成为稳定版本。使用 NestJS 11，Express v5 现在是集成到框架中的默认版本。虽然此更新对大多数用户来说是无缝的，但重要的是要注意 Express v5 引入了一些重大更改。有关详细指导，请参阅 Express v5 迁移指南。

Express v5 中最显着的更新之一是修订的路径路由匹配算法。对路径字符串与传入请求的匹配的方式进行了以下更改：

通配符 * 必须有一个名称，与参数的行为匹配：使用 /*splat 或 /{*splat} 而不是 /*。splat 只是通配符参数的名称，没有特殊含义。你可以将其命名为任何你喜欢的名称，例如 *wildcard

不再支持可选字符 ?，请改用大括号：/:file{.:ext}。

不支持正则表达式字符。

为避免在升级 (()[]?+!) 期间产生混淆，已保留某些字符，请使用 \ 来转义它们。

参数名称现在支持有效的 JavaScript 标识符，或像 :"this" 一样用引号引起来。

也就是说，以前在 Express v4 中工作的路由可能无法在 Express v5 中工作。例如：



@Get('users/*')
findAll() {
  // In NestJS 11, this will be automatically converted to a valid Express v5 route.
  // While it may still work, it's no longer advisable to use this wildcard syntax in Express v5.
  return 'This route should not work in Express v5';
}
要解决此问题，你可以更新路由以使用命名通配符：

¥To fix this issue, you can update the route to use a named wildcard:



@Get('users/*splat')
findAll() {
  return 'This route will work in Express v5';
}
警告
请注意，*splat 是一个命名通配符，可匹配任何没有根路径的路径。如果你还需要匹配根路径（/users），则可以使用 /users/{*splat}，将通配符括在括号中（可选组）。请注意，splat 只是通配符参数的名称，没有特殊含义。你可以将其命名为任何你喜欢的名称，例如 *wildcard。
类似地，如果你有一个在所有路由上运行的中间件，则可能需要更新路径以使用命名通配符：

¥Similarly, if you have a middleware that runs on all routes, you may need to update the path to use a named wildcard:



// In NestJS 11, this will be automatically converted to a valid Express v5 route.
// While it may still work, it's no longer advisable to use this wildcard syntax in Express v5.
forRoutes('*'); // <-- This should not work in Express v5
相反，你可以更新路径以使用命名通配符：



forRoutes('{*splat}'); // <-- This will work in Express v5
请注意，{*splat} 是一个命名通配符，可匹配任何路径（包括根路径）。外括号使路径成为可选项。


查询参数解析#
注意
此更改仅适用于 Express v5。
在 Express v5 中，默认情况下不再使用 qs 库解析查询参数。相反，使用 simple 解析器，它不支持嵌套对象或数组。

因此，查询字符串如下：

¥As a result, query strings like these:


?filter[where][name]=John&filter[where][age]=30
?item[]=1&item[]=2
将不再按预期进行解析。要恢复到以前的行为，你可以通过将 query parser 选项设置为 extended 将 Express 配置为使用 extended 解析器（Express v4 中的默认解析器）：

¥will no longer be parsed as expected. To revert to the previous behavior, you can configure Express to use the extended parser (the default in Express v4) by setting the query parser option to extended:



import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule); // <-- Make sure to use <NestExpressApplication>
  app.set('query parser', 'extended'); // <-- Add this line
  await app.listen(3000);
}
bootstrap();

Fastify v5#
@nestjs/platform-fastify v11 现在终于支持 Fastify v5。此更新对于大多数用户来说应该是无缝的；但是，Fastify v5 引入了一些重大更改，尽管这些更改不太可能影响大多数 NestJS 用户。有关更多详细信息，请参阅 Fastify v5 迁移指南。

提示
Fastify v5 中的路径匹配没有任何变化（中间件除外，请参阅下面的部分），因此你可以继续像以前一样使用通配符语法。行为保持不变，使用通配符定义的路由（如 *）仍将按预期工作。

Fastify 中间件注册#
¥Fastify middleware registration

NestJS 11 现在使用最新版本的 path-to-regexp 包来匹配 @nestjs/platform-fastify 中的中间件路径。因此，用于匹配所有路径的 (.*) 语法不再受支持。相反，你应该使用命名通配符。

¥NestJS 11 now uses the latest version of the path-to-regexp package to match middleware paths in @nestjs/platform-fastify. As a result, the (.*) syntax for matching all paths is no longer supported. Instead, you should use named wildcards.

例如，如果你有一个适用于所有路由的中间件：

¥For example, if you have a middleware that applies to all routes:



// In NestJS 11, this will automatically be converted to a valid route, even if you don't update it.
.forRoutes('(.*)');
你需要将其更新为使用命名通配符：



.forRoutes('*splat');
其中 splat 只是通配符参数的任意名称。你可以将其命名为任何你喜欢的名称。


模块解析算法#


从 NestJS 11 开始，模块解析算法得到了改进，以提高性能并减少大多数应用的内存使用量。此更改不需要任何手动干预，但在某些极端情况下，行为可能与以前的版本不同。

在 NestJS v10 及更早版本中，动态模块被分配了一个从模块的动态元数据生成的唯一不透明密钥。此键用于在模块注册表中标识模块。例如，如果你将 `TypeOrmModule.forFeature([User])` 包含在多个模块中，NestJS 会对模块进行数据去重，并将它们视为注册表中的单个模块节点。此过程称为节点数据去重。

随着 NestJS v11 的发布，我们不再为动态模块生成可预测的哈希值。相反，现在使用对象引用来确定一个模块是否等同于另一个模块。要在多个模块之间共享相同的动态模块，只需将其分配给变量并在需要的地方导入它即可。这种新方法提供了更大的灵活性，并确保更有效地处理动态模块。

如果你使用大量动态模块，此新算法可能会影响你的集成测试，因为如果没有上面提到的手动数据去重，你的 TestingModule 可能会有多个依赖实例。这使得存根方法变得有点棘手，因为你需要定位正确的实例。你应该：

- 对你想要存根的动态模块进行数据去重

- 使用 `module.select(ParentModule).get(Target)` 查找正确的实例

- 使用 `module.get(Target, { each: true })` 存根所有实例

- 或者使用 `Test.createTestingModule({}, { moduleIdGeneratorAlgorithm: 'deep-hash' })` 将测试切换回旧算法




## 反射器类型推断

NestJS 11 对 `Reflector` 类进行了多项改进，增强了其功能和元数据值的类型推断。这些更新在使用元数据时提供了更直观、更强大的体验。

1. 当只有一个元数据条目并且 `value` 属于 `object` 类型时，`getAllAndMerge` 现在返回一个对象而不是包含单个元素的数组。此更改提高了处理基于对象的元数据时的一致性。

2. `getAllAndOverride` 返回类型已更新为 `T | undefined` 而不是 `T`。此更新更好地反映了未找到元数据的可能性，并确保正确处理未定义的情况。

3. `ReflectableDecorator` 的转换类型参数现在可以在所有方法中正确推断。

这些增强功能通过在 NestJS 11 中提供更好的类型安全性和元数据处理来改善整体开发者体验。






## 生命周期钩子执行顺序

终止生命周期钩子现在以与其初始化对应项相反的顺序执行。也就是说，像 `OnModuleDestroy`、`BeforeApplicationShutdown` 和 `OnApplicationShutdown` 这样的钩子现在以相反的顺序执行。

例如以下场景：

```
// Where A, B, and C are modules and "->" represents the module dependency.
A -> B -> C
```

在这种情况下，`OnModuleInit` 钩子按以下顺序执行：

```
C -> B -> A
```

虽然 OnModuleDestroy 钩子以相反的顺序执行：

```
A -> B -> C
```

?> 全局模块被视为依赖于所有其他模块。这意味着全局模块首先初始化，最后销毁。



## 弃中间件注册顺序

在 NestJS v11 中，中间件注册的行为已更新。以前，中间件注册的顺序由模块依赖图的拓扑排序决定，其中与根模块的距离定义了中间件注册的顺序，无论中间件是在全局模块还是常规模块中注册。在这方面，全局模块被视为常规模块，这导致行为不一致，尤其是与其他框架功能相比时。

从 v11 开始，现在首先执行在全局模块中注册的中间件，无论其在模块依赖图中的位置如何。此更改可确保全局中间件始终在导入模块中的任何中间件之前运行，从而保持一致且可预测的顺序。

## 缓存模块

CacheModule（来自 @nestjs/cache-manager 包）已更新，以支持最新版本的 cache-manager 包。此更新带来了一些重大变化，包括迁移到 Keyv，它通过存储适配器为跨多个后端存储的键值存储提供了统一的接口。

上一版本和新版本之间的主要区别在于外部存储的配置。在之前的版本中，要注册 Redis 存储，你可能会像这样配置它：

```
// 老版本，不再支持
CacheModule.registerAsync({
  useFactory: async () => {
    const store = await redisStore({
      socket: {
        host: 'localhost',
        port: 6379,
      },
    });

    return {
      store,
    };
  },
}),
```

在新版本中，你应该使用 Keyv 适配器来配置存储：

```
// 新版本支持
CacheModule.registerAsync({
  useFactory: async () => {
    return {
      stores: [
        new KeyvRedis('redis://localhost:6379'),
      ],
    };
  },
}),
```

其中 KeyvRedis 是从 @keyv/redis 包导入的。请参阅 [缓存文档](/11/techniques/caching) 了解更多信息

!> 在此更新中，Keyv 库处理的缓存数据现在被构造为包含 value 和 expires 字段的对象，例如：`{"value": "yourData", "expires": 1678901234567}`。虽然 Keyv 在通过其 API 访问数据时会自动检索 value 字段，但如果你直接与缓存数据交互（例如，在缓存管理器 API 之外）或需要支持使用以前版本的 `@nestjs/cache-manager` 编写的数据，则务必注意此更改。


## 配置模块

如果你使用的是 @nestjs/config 包中的 ConfigModule，请注意 @nestjs/config@4.0.0 中引入的几个重大更改。最值得注意的是，ConfigService#get 方法读取配置变量的顺序已更新。新顺序为：

- 内部配置（配置命名空间和自定义配置文件）

- 已验证的环境变量（如果已启用验证并提供了架构）

- process.env 对象

以前，首先读取经过验证的环境变量和 process.env 对象，以防止它们被内部配置覆盖。通过此更新，内部配置现在将始终优先于环境变量。

此外，ignoreEnvVars 配置选项（以前允许禁用对 process.env 对象的验证）已被弃用。相反，使用 validatePredefined 选项（设置为 false 以禁用对预定义环境变量的验证）。预定义环境变量是指在导入模块之前设置的 process.env 变量。例如，如果你使用 PORT=3000 node main.js 启动应用，则 PORT 变量被视为预定义变量。但是，ConfigModule 从 .env 文件加载的变量不属于预定义变量。

还引入了一个新的 skipProcessEnv 选项。此选项允许你完全阻止 ConfigService#get 方法访问 process.env 对象，这在你想要限制服务直接读取环境变量时很有用。


## Terminus 模块

如果你正在使用 `TerminusModule` 并构建了自己的自定义健康指标，则版本 11 中引入了一个新的 API。新的 `HealthIndicatorService` 旨在增强自定义健康指标的可读性和可测试性。

在版本 11 之前，健康指标可能看起来像这样：


```
@Injectable()
export class DogHealthIndicator extends HealthIndicator {
  constructor(private readonly httpService: HttpService) {
    super();
  }

  async isHealthy(key: string) {
    try {
      const badboys = await this.getBadboys();
      const isHealthy = badboys.length === 0;

      const result = this.getStatus(key, isHealthy, {
        badboys: badboys.length,
      });

      if (!isHealthy) {
        throw new HealthCheckError('Dog check failed', result);
      }

      return result;
    } catch (error) {
      const result = this.getStatus(key, isHealthy);
      throw new HealthCheckError('Dog check failed', result);
    }
  }

  private getBadboys() {
    return firstValueFrom(
      this.httpService.get<Dog[]>('https://example.com/dog').pipe(
        map((response) => response.data),
        map((dogs) => dogs.filter((dog) => dog.state === DogState.BAD_BOY)),
      ),
    );
  }
}

```


从版本 11 开始，建议使用新的 `HealthIndicatorService` API，它简化了实现过程。以下是现在可以实现相同健康指标的方法：


```
@Injectable()
export class DogHealthIndicator {
  constructor(
    private readonly httpService: HttpService,
    //  Inject the `HealthIndicatorService` provided by the `TerminusModule`
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  async isHealthy(key: string) {
    // Start the health indicator check for the given key
    const indicator = this.healthIndicatorService.check(key);

    try {
      const badboys = await this.getBadboys();
      const isHealthy = badboys.length === 0;

      if (!isHealthy) {
        // Mark the indicator as "down" and add additional info to the response
        return indicator.down({ badboys: badboys.length });
      }

      // Mark the health indicator as up
      return indicator.up();
    } catch (error) {
      return indicator.down('Unable to retrieve dogs');
    }
  }

  private getBadboys() {
    // ...
  }
}

```

关键变化:

`HealthIndicatorService` 取代了传统的 `HealthIndicator` 和 `HealthCheckError` 类，为健康检查提供了更清晰的 API。

check 方法允许轻松进行状态跟踪（up 或 down），同时支持在健康检查响应中包含其他元数据。


>? 请注意，HealthIndicator 和 HealthCheckError 类已被标记为已弃用，并计划在下一个主要版本中删除。



>! 此版本放弃了对 Node v16 和 18  的支持。我们强烈建议使用最新的 LTS 版本。


 ### 译者署名

| 用户名 | 头像 | 职能 | 签名 |
|---|---|---|---|
