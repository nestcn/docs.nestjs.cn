### 缓存

缓存是一种强大且直接的**技术** ，可显著提升应用程序性能。作为临时存储层，它能快速访问常用数据，减少重复获取或计算相同信息的需要，从而实现更快的响应时间和更高的整体效率。

#### 安装

要在 Nest 中开始使用缓存，您需要安装 `@nestjs/cache-manager` 包以及 `cache-manager` 包。

```bash
$ npm install @nestjs/cache-manager cache-manager
```

默认情况下所有内容都存储在内存中；由于 `cache-manager` 底层使用 [Keyv](https://keyv.org/docs/)，您只需安装相应包即可轻松切换到更高级的存储解决方案（如 Redis）。我们将在后续详细讨论这一点。

#### 内存缓存

要在应用程序中启用缓存功能，需导入 `CacheModule` 并通过 `register()` 方法进行配置：

```typescript
import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { AppController } from './app.controller';

@Module({
  imports: [CacheModule.register()],
  controllers: [AppController],
})
export class AppModule {}
```

此配置将以默认设置初始化内存缓存，使您能够立即开始缓存数据。

#### 与缓存存储交互

要与缓存管理器实例交互，请使用 `CACHE_MANAGER` 令牌将其注入到你的类中，如下所示：

```typescript
constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}
```

> info **注意** `Cache` 类是从 `cache-manager` 导入的，而 `CACHE_MANAGER` 令牌则来自 `@nestjs/cache-manager` 包。

`Cache` 实例（来自 `cache-manager` 包）上的 `get` 方法用于从缓存中检索项目。如果缓存中不存在该项目，将返回 `null`。

```typescript
const value = await this.cacheManager.get('key');
```

要向缓存添加项目，请使用 `set` 方法：

```typescript
await this.cacheManager.set('key', 'value');
```

> warning **注意** 内存缓存存储仅能保存[结构化克隆算法](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm#javascript_types)支持类型的值。

您可以为该特定键手动指定 TTL（过期时间，以毫秒为单位），如下所示：

```typescript
await this.cacheManager.set('key', 'value', 1000);
```

其中 `1000` 表示 TTL 毫秒数——在此情况下，缓存项将在一秒后过期。

要禁用缓存过期，请将 `ttl` 配置属性设为 `0`：

```typescript
await this.cacheManager.set('key', 'value', 0);
```

要从缓存中移除某个项目，请使用 `del` 方法：

```typescript
await this.cacheManager.del('key');
```

要清除整个缓存，请使用 `clear` 方法：

```typescript
await this.cacheManager.clear();
```

#### 自动缓存响应

> warning **警告** 在 [GraphQL](/graphql/quick-start) 应用中，拦截器会针对每个字段解析器单独执行。因此，`CacheModule`（使用拦截器来缓存响应）将无法正常工作。

要启用自动缓存响应，只需在你想要缓存数据的地方绑定 `CacheInterceptor`。

```typescript
@Controller()
@UseInterceptors(CacheInterceptor)
export class AppController {
  @Get()
  findAll(): string[] {
    return [];
  }
}
```

> warning **警告** 只有 `GET` 端点会被缓存。此外，注入原生响应对象(`@Res()`)的 HTTP 服务器路由无法使用缓存拦截器。详情请参阅 [响应映射](https://docs.nestjs.com/interceptors#response-mapping) 。

为了减少所需的样板代码，你可以将 `CacheInterceptor` 全局绑定到所有端点：

```typescript
import { Module } from '@nestjs/common';
import { CacheModule, CacheInterceptor } from '@nestjs/cache-manager';
import { AppController } from './app.controller';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [CacheModule.register()],
  controllers: [AppController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
})
export class AppModule {}
```

#### 生存时间（TTL）

`ttl` 的默认值为 `0`，表示缓存永不过期。要指定自定义 [TTL](https://en.wikipedia.org/wiki/Time_to_live)，可以在 `register()` 方法中提供 `ttl` 选项，如下所示：

```typescript
CacheModule.register({
  ttl: 5000, // milliseconds
});
```

#### 全局使用模块

当您需要在其他模块中使用 `CacheModule` 时，需要先导入它（这是 Nest 模块的标准用法）。或者，通过将选项对象的 `isGlobal` 属性设置为 `true` 将其声明为[全局模块](https://docs.nestjs.com/modules#global-modules) ，如下所示。在这种情况下，一旦在根模块（如 `AppModule`）中加载后，就无需在其他模块中导入 `CacheModule`。

```typescript
CacheModule.register({
  isGlobal: true,
});
```

#### 全局缓存覆盖

当启用全局缓存时，缓存条目会存储在基于路由路径自动生成的 `CacheKey` 下。您可以在每个方法基础上覆盖特定的缓存设置（`@CacheKey()` 和 `@CacheTTL()`），从而为单个控制器方法定制缓存策略。这在需要使用[不同缓存存储](https://docs.nestjs.com/techniques/caching#different-stores)时可能最为相关。

您可以在控制器级别应用 `@CacheTTL()` 装饰器，为整个控制器设置缓存 TTL。当同时定义了控制器级别和方法级别的缓存 TTL 设置时，方法级别指定的缓存 TTL 设置将优先于控制器级别的设置。

```typescript
@Controller()
@CacheTTL(50)
export class AppController {
  @CacheKey('custom_key')
  @CacheTTL(20)
  findAll(): string[] {
    return [];
  }
}
```

> info **注意** `@CacheKey()` 和 `@CacheTTL()` 装饰器是从 `@nestjs/cache-manager` 包导入的。

`@CacheKey()` 装饰器可以单独使用，也可以与 `@CacheTTL()` 装饰器配合使用，反之亦然。开发者可以选择仅覆盖 `@CacheKey()` 或仅覆盖 `@CacheTTL()`。未被装饰器覆盖的配置将使用全局注册的默认值（参见[自定义缓存](https://docs.nestjs.com/techniques/caching#customize-caching) ）。

#### WebSocket 与微服务

您也可以将 `CacheInterceptor` 应用于 WebSocket 订阅者以及微服务模式（无论使用何种传输方式）。

```typescript
@@filename()
@CacheKey('events')
@UseInterceptors(CacheInterceptor)
@SubscribeMessage('events')
handleEvent(client: Client, data: string[]): Observable<string[]> {
  return [];
}
@@switch
@CacheKey('events')
@UseInterceptors(CacheInterceptor)
@SubscribeMessage('events')
handleEvent(client, data) {
  return [];
}
```

但需要额外使用 `@CacheKey()` 装饰器来指定用于后续存储和检索缓存数据的键。同时请注意**不应缓存所有内容** ，执行业务操作而非单纯查询数据的操作永远不应被缓存。

此外，您可以使用 `@CacheTTL()` 装饰器指定缓存过期时间（TTL），这将覆盖全局默认的 TTL 值。

```typescript
@@filename()
@CacheTTL(10)
@UseInterceptors(CacheInterceptor)
@SubscribeMessage('events')
handleEvent(client: Client, data: string[]): Observable<string[]> {
  return [];
}
@@switch
@CacheTTL(10)
@UseInterceptors(CacheInterceptor)
@SubscribeMessage('events')
handleEvent(client, data) {
  return [];
}
```

> **提示** `@CacheTTL()` 装饰器可以单独使用，也可以与对应的 `@CacheKey()` 装饰器配合使用。

#### 调整追踪方式

默认情况下，Nest 使用请求 URL（在 HTTP 应用中）或缓存键（在 WebSocket 和微服务应用中，通过 `@CacheKey()` 装饰器设置）来将缓存记录与端点关联。不过有时您可能需要基于不同因素设置追踪方式，例如使用 HTTP 头（如 `Authorization` 来正确识别 `profile` 端点）。

为此，需创建 `CacheInterceptor` 的子类并重写 `trackBy()` 方法。

```typescript
@Injectable()
class HttpCacheInterceptor extends CacheInterceptor {
  trackBy(context: ExecutionContext): string | undefined {
    return 'key';
  }
}
```

#### 使用其他缓存存储方案

切换到不同的缓存存储方案非常简单。首先安装相应的包，例如要使用 Redis 需安装 `@keyv/redis` 包：

```bash
$ npm install @keyv/redis
```

完成上述步骤后，您就可以像下面这样注册支持多存储的 `CacheModule` 模块：

```typescript
import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { AppController } from './app.controller';
import { createKeyv } from '@keyv/redis';
import { Keyv } from 'keyv';
import { CacheableMemory } from 'cacheable';

@Module({
  imports: [
    CacheModule.registerAsync({
      useFactory: async () => {
        return {
          stores: [
            new Keyv({
              store: new CacheableMemory({ ttl: 60000, lruSize: 5000 }),
            }),
            createKeyv('redis://localhost:6379'),
          ],
        };
      },
    }),
  ],
  controllers: [AppController],
})
export class AppModule {}
```

在此示例中，我们注册了两个存储库：`CacheableMemory` 和 `KeyvRedis`。其中 `CacheableMemory` 是一个简单的内存存储，而 `KeyvRedis` 则是 Redis 存储。`stores` 数组用于指定要使用的存储库，数组中的第一个存储库为默认存储，其余为备用存储。

更多关于可用存储库的信息，请参阅 [Keyv 文档](https://keyv.org/docs/) 。

#### 异步配置

您可能需要异步传入模块选项，而非在编译时静态传递。这种情况下，请使用 `registerAsync()` 方法，它提供了多种处理异步配置的方式。

一种方法是使用工厂函数：

```typescript
CacheModule.registerAsync({
  useFactory: () => ({
    ttl: 5,
  }),
});
```

我们的工厂行为与其他异步模块工厂类似（可以是 `async` 的，并且能够通过 `inject` 注入依赖项）。

```typescript
CacheModule.registerAsync({
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => ({
    ttl: configService.get('CACHE_TTL'),
  }),
  inject: [ConfigService],
});
```

或者，您可以使用 `useClass` 方法：

```typescript
CacheModule.registerAsync({
  useClass: CacheConfigService,
});
```

上述构造将在 `CacheModule` 内部实例化 `CacheConfigService`，并使用它来获取选项对象。`CacheConfigService` 必须实现 `CacheOptionsFactory` 接口才能提供配置选项：

```typescript
@Injectable()
class CacheConfigService implements CacheOptionsFactory {
  createCacheOptions(): CacheModuleOptions {
    return {
      ttl: 5,
    };
  }
}
```

若希望使用从其他模块导入的现有配置提供程序，请使用 `useExisting` 语法：

```typescript
CacheModule.registerAsync({
  imports: [ConfigModule],
  useExisting: ConfigService,
});
```

其工作原理与 `useClass` 相同，但存在一个关键区别——`CacheModule` 会查找已导入的模块以复用任何已创建的 `ConfigService`，而非实例化自身的副本。

> info **提示**：`CacheModule#register`、`CacheModule#registerAsync` 和 `CacheOptionsFactory` 具有可选的泛型（类型参数），用于收窄存储特定的配置选项，从而确保类型安全。

您还可以向 `registerAsync()` 方法传递所谓的 `extraProviders`。这些提供程序将与模块提供程序合并。

```typescript
CacheModule.registerAsync({
  imports: [ConfigModule],
  useClass: ConfigService,
  extraProviders: [MyAdditionalProvider],
});
```

这在您需要为工厂函数或类构造函数提供额外依赖项时非常有用。

#### 示例

一个可用的示例[在此处](https://github.com/nestjs/nest/tree/master/sample/20-cache)查看。
