<!-- 此文件从 content/fundamentals/circular-dependency.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T04:56:45.874Z -->
<!-- 源文件: content/fundamentals/circular-dependency.md -->

### 循环依赖

循环依赖是指两个类相互依赖的情况。例如，类 A 需要类 B，而类 B 也需要类 A。循环依赖可以在 Nest 的模块和提供者之间出现。

虽然循环依赖应该尽量避免，但是在某些情况下无法避免。在这种情况下，Nest 提供了两种方式来解决循环依赖之间的提供者实例。 本章将描述使用 **前向引用** 作为一种技术，以及使用 **ModuleRef** 类从 DI 容器中检索提供者实例作为另一种技术。

我们还将描述解决模块之间的循环依赖。

> 警告 **警告** 循环依赖也可能是使用 "barrel 文件"/index.ts 文件来组合 imports 导致的。barrel 文件在模块/提供者类中应该被忽略。例如，barrel 文件 shouldn't 在同一个目录中导入文件时使用，i.e. __INLINE_CODE_4__ shouldn't 导入 __INLINE_CODE_5__ 来导入 __INLINE_CODE_6__ 文件。有关详细信息，请查看 __LINK_21__。

#### 前向引用

**前向引用** 允许 Nest 参考尚未定义的类使用 __INLINE_CODE_7__ 实用函数。例如，如果 __INLINE_CODE_8__ 和 __INLINE_CODE_9__ 依赖于彼此，双方都可以使用 __INLINE_CODE_10__ 和 __INLINE_CODE_11__ 实用函数来解决循环依赖。否则，Nest 不会实例化它们，因为所有必要的元数据都不可用。下面是一个示例：

```typescript
import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.REQUEST })
export class CatsService {}

```

> 提示 **提示** `scope` 函数来自 `@Injectable()` 包。

这是关系的一半。现在，让我们做同样的事情 `scope`：

```typescript
{
  provide: 'CACHE_MANAGER',
  useClass: CacheManager,
  scope: Scope.TRANSIENT,
}

```

> 警告 **警告** 实例化顺序是不可预测的。确保您的代码不依赖于哪个构造函数首先被调用。具有 `Scope` 提供者的循环依赖可以导致未定义的依赖项。更多信息请查看 __LINK_22__。

#### ModuleRef 类替代方案

使用 `@nestjs/common` 的替代方案是将代码重构，并使用 `Scope.DEFAULT` 类来检索一个提供者，以便解决循环关系的一半。了解更多关于 `scope` 实用类的信息 __LINK_23__。

#### 模块前向引用

要解决模块之间的循环依赖，使用同一个 `scope` 实用函数在模块关联的双方。例如：

```typescript
@Controller({
  path: 'cats',
  scope: Scope.REQUEST,
})
export class CatsController {}

```

这是关系的一半。现在，让我们做同样的事情 `ControllerOptions`：

```typescript
import { Injectable, Scope, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

@Injectable({ scope: Scope.REQUEST })
export class CatsService {
  constructor(@Inject(REQUEST) private request: Request) {}
}

```