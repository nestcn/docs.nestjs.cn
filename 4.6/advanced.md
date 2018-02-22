# 高级

## 分层注入

Nest 的注入是分层的。要理解这处理方法, 首先必须熟悉创建类实例的过程。当任何类依赖于另一个类时, 它将试图在当前范围内查找适当的实例注入。当前范围并不总是类所属的模块。

让我们来考虑一个例子。我们有一个 CoreModule:

> core.module.ts

```typescript
@Module({
  imports: [CommonModule],
  components: [CoreService, ContextService],
})
export class CoreModule {}
```
本模块导入 CommonModule 并包含2个组件, 先后是 CoreService 和 ContextService。CommonModule 包含单个组件 CommonService。此组件已导出, 因此在 CoreModule 中也可用。

> common.module.ts

```typescript
@Module({
  components: [CommonService],
  exports: [CommonService],
})
export class CommonModule {}
```
现在让我们来看看 ContextService:

> core/context.service.ts

```typescript
@Component()
export class ContextService {
  constructor(private readonly commonService: CommonService) {}
}
```

此类取决于 CommonService。此服务是从子模块 (CommonModule) 导入的, 因此这是一个典型的情况。现在有些令人惊讶的事情, CommonService:

> common/common.service.ts

```typescript
@Component()
export class CommonService {
  constructor(private readonly coreService: CoreService) {}
}
```

CommonService 取决于 CoreService。这是有可能的, 因为 CommonService 实例是在 CoreModule `context` (由组件注入的, 它属于父模块)。

### 动机 （Motivation）

这种技术使得使用无限抽象来创建可重用模块成为可能。此外，它允许使用自定义组件功能覆盖导入模块中的每个组件。例如，您可以在特征模块内创建该类的默认实现，但在当前处理的上下文中重载它。

这种技术使得可以使用无穷抽象创建可重用模块。此外, 它还允许使用自定义组件功能覆盖 import 模块中的每个组件。例如, 可以在功能模块内创建类的默认实现, 但在当前处理的 `context` 中重载它。

!> 这种技术非常强大, 但也非常危险。当你要使用这个功能时要小心, 并确保你完全知道你在做什么。

## Mixin 类

TypeScript 2.2 增加了对 ECMAScript 2015 Mixin 类模式的支持。这种模式非常有用，因为将自定义参数传递给某些嵌套应用程序构建块（如拦截器或看守器）并不容易。mixin 类有更多的应用程序, 但在这里, 我们将关注这个单一的用例。


为了演示目的, 让我们重写我们在拦截器部分中构建的 CacheInterceptor, 并提取 isCached 条件。

> cache.interceptor.ts

```typescript
import { Interceptor, NestInterceptor, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

@Interceptor()
export abstract class CacheInterceptor implements NestInterceptor {
  protected abstract readonly isCached: () => boolean;

  intercept(dataOrRequest, context: ExecutionContext, stream$: Observable<any>): Observable<any> {
    if (this.isCached()) {
      return Observable.of([]);
    }
    return stream$;
  }
}
```

现在, CacheInterceptor 是抽象的, 包含了单个抽象成员-isCached 函数。基于这个类, 我们将创建 mixinCacheInterceptor 函数。

> mixin-cache.interceptor.ts

```typescript
import { mixin } from '@nestjs/common';
import { CacheInterceptor } from './cache.interceptor';

export function mixinCacheInterceptor(isCached: () => boolean) {
  return mixin(class extends CacheInterceptor {
    protected readonly isCached = isCached;
  });
}
```

!> mixin() 是一个帮助器函数。无论何时创建 mixin 类, 都要使用它。

此函数以 isCached() 谓词作为参数, 并将其赋给 mixin 类。最后一步是设置拦截器:

```typescript
@UseInterceptors(mixinCacheInterceptor(() => true))
async findAll(): Promise<Cat[]> {
  return this.catsService.findAll();
}
```
mixin() 函数返回类, 所以你可以像使用普通的自创类一样使用它。
