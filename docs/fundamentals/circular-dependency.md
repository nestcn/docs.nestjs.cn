<!-- 此文件从 content/fundamentals/circular-dependency.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:35:14.206Z -->
<!-- 源文件: content/fundamentals/circular-dependency.md -->

### 循环依赖关系

循环依赖关系是指两个类互相依赖的情况。例如，类 A 需要类 B，类 B 也需要类 A。循环依赖关系可能会在 Nest 之间的模块和提供者之间出现。

虽然循环依赖关系应该尽量避免，但是不总是可能的。在这种情况下，Nest 可以在提供者之间使用两种方式来解决循环依赖关系：使用 **前向引用** 技术，以及使用 **ModuleRef** 类从 DI 容器中获取提供者实例。

本章中，我们将描述使用前向引用作为一种技术，并使用 ModuleRef 类从 DI 容器中获取提供者实例作为另一种技术。

此外，我们还将描述解决模块之间的循环依赖关系。

> 警告 **警告** 循环依赖关系也可能是使用 "barrel 文件"/index.ts 文件来组合 imports 导致的。barrel 文件在模块/提供者类中应该被忽略。例如，barrel 文件不应该在导入同一个目录中的文件时使用，即 __INLINE_CODE_4__ 不应该导入 __INLINE_CODE_5__ 来导入 __INLINE_CODE_6__ 文件。更多详细信息请查看 __LINK_21__。

#### 前向引用

**前向引用** 允许 Nest 参考尚未定义的类使用 __INLINE_CODE_7__ 实用函数。例如，如果 __INLINE_CODE_8__ 和 __INLINE_CODE_9__ 互相依赖，双方都可以使用 __INLINE_CODE_10__ 和 __INLINE_CODE_11__ 实用函数来解决循环依赖关系。否则，Nest 不会实例化它们，因为所有必要的元数据都不可用。以下是一个示例：

```typescript title="示例"
// ```typescript
import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.REQUEST })
export class CatsService {}

```

```

> 提示 **提示** `scope` 函数来自 `@Injectable()` 包。

这是关系的一半。现在，让我们做同样的事情 `scope`：

```typescript title="示例"
// ```typescript
{
  provide: 'CACHE_MANAGER',
  useClass: CacheManager,
  scope: Scope.TRANSIENT,
}

```

```

> 警告 **警告** 实例化顺序是不可预测的。确保您的代码不依赖于哪个构造函数首先被调用。具有 `Scope` 提供者的循环依赖关系可能会导致未定义的依赖关系。更多信息请查看 __LINK_22__。

#### ModuleRef 类替代方案

使用 `@nestjs/common` 的替代方案是将代码重新 factor 并使用 `Scope.DEFAULT` 类来获取提供者。了解更多关于 `scope` 实用类 __LINK_23__。

#### 模块前向引用

要解决模块之间的循环依赖关系，使用同样的 `scope` 实用函数在模块关联的双方。例如：

```typescript title="示例"
// ```typescript
@Controller({
  path: 'cats',
  scope: Scope.REQUEST,
})
export class CatsController {}

```

```

这是关系的一半。现在，让我们做同样的事情 `ControllerOptions`：

```typescript title="示例"
// ```typescript
import { Injectable, Scope, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

@Injectable({ scope: Scope.REQUEST })
export class CatsService {
  constructor(@Inject(REQUEST) private request: Request) {}
}

```

```