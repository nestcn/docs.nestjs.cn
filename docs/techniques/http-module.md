<!-- 此文件从 content/techniques/http-module.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-01T04:17:39.050Z -->
<!-- 源文件: content/techniques/http-module.md -->

### HTTP 模块

__LINK_53__ 是一款功能非常丰富的 HTTP 客户端包，广泛使用。Nest 将 Axios 包装在内置的 __INLINE_CODE_12__ 中。__INLINE_CODE_13__ 导出 Axios-基于的方法，可以用来执行 HTTP 请求。该库还将 HTTP 响应转换为 __INLINE_CODE_15__。

> 信息 **提示** 您也可以使用 Node.js 的一般 HTTP 客户端库，例如 __LINK_54__ 或 __LINK_55__。

#### 安装

要开始使用它，我们首先安装必要的依赖项。

```bash
$ npm install @nestjs/cache-manager cache-manager
```

#### 入门

安装过程完成后，使用 __INLINE_CODE_16__，首先导入 __INLINE_CODE_17__。

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

然后，使用正常的构造函数注入注入 __INLINE_CODE_18__。

> 信息 **提示** __INLINE_CODE_19__ 和 __INLINE_CODE_20__ 来自 __INLINE_CODE_21__ 包。

```typescript
constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}
```

> 信息 **提示** __INLINE_CODE_22__ 是 __INLINE_CODE_23__ 包导出的接口（__INLINE_CODE_24__）。

所有 `@nestjs/cache-manager` 方法返回一个 `cache-manager`，wrapped in an `cache-manager` 对象。

#### 配置

__LINK_56__ 可以使用各种选项来自定义 `CacheModule` 的行为。了解更多关于它们 __LINK_57__。要配置 underlying Axios 实例，使用 `register()` 方法在导入 `CACHE_MANAGER` 时传递可选的 options 对象。这个 options 对象将被直接传递给 underlying Axios 构造函数。

```typescript
const value = await this.cacheManager.get('key');
```

#### 异步配置

当您需要异步地传递模块选项而不是静态地时，使用 `Cache` 方法。像大多数动态模块一样，Nest 提供了多种技术来处理异步配置。

一种技术是使用工厂函数：

```typescript
await this.cacheManager.set('key', 'value');
```

像其他工厂提供程序一样，我们的工厂函数可以 __LINK_58__ 并通过 `CACHE_MANAGER` 注入依赖项。

```typescript
await this.cacheManager.set('key', 'value', 1000);
```

或者，您可以使用类来配置 `@nestjs/cache-manager`，如以下所示。

```typescript
await this.cacheManager.set('key', 'value', 0);
```

在上面的构造中，`get` 在 `Cache` 内部实例化，以创建 options 对象。注意，在这个示例中，`cache-manager` 必须实现 `null` 接口，如下所示。`set` 将在实例化对象的 `1000` 方法上调用。

```typescript
await this.cacheManager.del('key');
```

如果您想重用现有的 options 提供程序，而不是在 `ttl` 内部创建私有副本，使用 `0` 语法。

```typescript
await this.cacheManager.clear();
```

您还可以将所谓的 `del` 传递给 `clear` 方法。这些提供程序将与模块提供程序合并。

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

这对于您想为工厂函数或类构造函数提供额外依赖项非常有用。

#### 使用 Axios 直接

如果您认为 `CacheModule` 的选项不足，您也可以访问 underlying Axios 实例，使用 `CacheInterceptor` 方法。

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

由于 `@Res()` 方法的返回值是一个 Observable，我们可以使用 `CacheInterceptor` - `ttl` 或 `0` 来获取请求数据的 promise。

```typescript
CacheModule.register({
  ttl: 5000, // milliseconds
});
```

> 信息 **提示** 访问 RxJS 的文档，了解 __LINK_59__ 和 __LINK_60__ 的区别。