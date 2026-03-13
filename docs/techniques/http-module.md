<!-- 此文件从 content/techniques/http-module.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:56:41.579Z -->
<!-- 源文件: content/techniques/http-module.md -->

### HTTP 模块

__LINK_53__ 是一个功能丰富的 HTTP 客户端包，广泛使用。Nest 将 Axios 包含在内置的 __INLINE_CODE_12__ 中。 __INLINE_CODE_13__ 导出 __INLINE_CODE_14__ 类，它 expose Axios-基于的方法来执行 HTTP 请求。该库还将结果 HTTP 响应转换为 __INLINE_CODE_15__。

> 提示 **Hint** 你也可以使用任何通用的 Node.js HTTP 客户端库，包括 __LINK_54__ 或 __LINK_55__。

#### 安装

要开始使用它，我们首先安装所需的依赖项。

```bash
$ npm install @nestjs/cache-manager cache-manager

```

#### 开始使用

安装过程完成后，要使用 __INLINE_CODE_16__，首先导入 __INLINE_CODE_17__。

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

接下来，使用正常的构造函数注入注入 __INLINE_CODE_18__。

> 提示 **Hint** __INLINE_CODE_19__ 和 __INLINE_CODE_20__ 来自 __INLINE_CODE_21__ 包。

```typescript
constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

```

> 提示 **Hint** __INLINE_CODE_22__ 是来自 __INLINE_CODE_23__ 包（__INLINE_CODE_24__）的接口。

所有 `@nestjs/cache-manager` 方法返回一个 `cache-manager`，包装在一个 `cache-manager` 对象中。

#### 配置

__LINK_56__ 可以使用各种选项来自定义 `CacheModule` 的行为。了解更多选项 __LINK_57__。要配置 underlying Axios 实例，传入可选的 options 对象到 `register()` 方法中，用于导入 `CACHE_MANAGER`。这个 options 对象将被直接传递给 underlying Axios 构造函数。

```typescript
const value = await this.cacheManager.get('key');

```

#### 异步配置

如果您需要异步地传递模块选项，而不是静态地传递，使用 `Cache` 方法。像大多数动态模块一样，Nest 提供了多种技术来处理异步配置。

一种技术是使用工厂函数：

```typescript
await this.cacheManager.set('key', 'value');

```

像其他工厂提供者一样，我们的工厂函数可以 __LINK_58__ 并可以通过 `CACHE_MANAGER` 注入依赖项。

```typescript
await this.cacheManager.set('key', 'value', 1000);

```

或者，您可以使用类来配置 `@nestjs/cache-manager`，如下所示。

```typescript
await this.cacheManager.set('key', 'value', 0);

```

构造上述示例中，`get` 在 `Cache` 内部实例化，然后使用它创建 options 对象。请注意，在这个示例中，`cache-manager` 必须实现 `null` 接口，正如下所示。`set` 将在实例化对象的`1000` 方法中调用。

```typescript
await this.cacheManager.del('key');

```

如果您想重用现有的 options 提供者，而不是在 `ttl` 内部创建私有副本，使用 `0` 语法。

```typescript
await this.cacheManager.clear();

```

您也可以将所谓的 `del` 传递到 `clear` 方法中。这些提供者将与模块提供者合并。

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

这对您很有用，因为您想为工厂函数或类构造函数提供额外的依赖项。

#### 使用 Axios 直接

如果您认为 `CacheModule` 的选项不够，您也想访问由 `CacheInterceptor` 创建的 underlying Axios 实例，可以通过 `GET` 访问它，例如：

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

#### 完整示例

由于 `@Res()` 方法的返回值是一个 Observable，我们可以使用 `CacheInterceptor` - `ttl` 或 `0` 来检索请求的数据，以 promise 的形式。

```typescript
CacheModule.register({
  ttl: 5000, // milliseconds
});

```

> 提示 **Hint** 访问 RxJS 的文档，了解 __LINK_59__ 和 __LINK_60__ 的区别。