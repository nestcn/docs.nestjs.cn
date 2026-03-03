<!-- 此文件从 content/techniques/http-module.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-03T04:10:37.518Z -->
<!-- 源文件: content/techniques/http-module.md -->

### HTTP 模块

__LINK_53__ 是一个功能强大的 HTTP 客户端包，广泛使用。Nest 将 Axios 包装并将其暴露给内置的 __INLINE_CODE_12__。__INLINE_CODE_13__ 导出 __INLINE_CODE_14__ 类，该类暴露 Axios 基于的方法来执行 HTTP 请求。该库还将结果 HTTP 响应转换为 __INLINE_CODE_15__。

> 信息 **提示** 您也可以使用任何一般 Node.js HTTP 客户端库，包括 __LINK_54__ 或 __LINK_55__。

#### 安装

要开始使用它，我们首先安装所需的依赖项。

```bash
$ npm install @nestjs/cache-manager cache-manager
```

#### 获取开始

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

接下来，使用正常的构造函数注入注入 __INLINE_CODE_18__。

> 信息 **提示** __INLINE_CODE_19__ 和 __INLINE_CODE_20__ 由 __INLINE_CODE_21__ 包含。

```typescript
constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}
```

> 信息 **提示** __INLINE_CODE_22__ 是从 __INLINE_CODE_23__ 包含的接口 (__INLINE_CODE_24__）。

所有 `@nestjs/cache-manager` 方法返回一个 `cache-manager`，包装在一个 `cache-manager` 对象中。

#### 配置

__LINK_56__ 可以使用各种选项来自定义 `CacheModule` 的行为。了解更多信息 __LINK_57__。要配置 underlying Axios 实例，使用 `register()` 方法在导入 `CACHE_MANAGER` 时传递可选的 options 对象。这个 options 对象将直接传递给 underlying Axios 构造函数。

```typescript
const value = await this.cacheManager.get('key');
```

#### 异步配置

当您需要异步地传递模块选项而不是静态地时，使用 `Cache` 方法。与大多数动态模块一样，Nest 提供了多种技术来处理异步配置。

一种技术是使用工厂函数：

```typescript
await this.cacheManager.set('key', 'value');
```

像其他工厂提供程序一样，我们的工厂函数可以 __LINK_58__ 并可以通过 `CACHE_MANAGER` 注入依赖项。

```typescript
await this.cacheManager.set('key', 'value', 1000);
```

Alternatively, you can configure the `@nestjs/cache-manager` using a class instead of a factory, as shown below.

```typescript
await this.cacheManager.set('key', 'value', 0);
```

上述构建将在 `get` 内部实例化 `Cache`，使用它创建 options 对象。注意，在这个示例中，`cache-manager` 必须实现 `null` 接口，如下所示。`set` 将在实例化对象的 `1000` 方法上调用。

```typescript
await this.cacheManager.del('key');
```

如果您想要重用现有 options 提供程序，而不是在 `ttl` 中创建私有副本，使用 `0` 语法。

```typescript
await this.cacheManager.clear();
```

您也可以将称为 `del` 的提供程序传递给 `clear` 方法。这些提供程序将与模块提供程序合并。

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

这对在工厂函数或类构造函数中提供额外依赖项非常有用。

#### 使用 Axios 直接

如果您认为 `CacheModule` 的选项不足或只是想访问 underlying Axios 实例由 `CacheInterceptor` 创建，可以访问它使用 `GET`，如下所示：

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

#### 全部示例

由于 `@Res()` 方法的返回值是可观察的，我们可以使用 `CacheInterceptor` - `ttl` 或 `0` Retrieve the data of the request in the form of a promise。

```typescript
CacheModule.register({
  ttl: 5000, // milliseconds
});
```

> 信息 **提示** 访问 RxJS 的文档了解 __LINK_59__ 和 __LINK_60__ 的区别。