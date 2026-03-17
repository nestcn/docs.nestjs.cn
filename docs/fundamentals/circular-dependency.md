<!-- 此文件从 content/fundamentals/circular-dependency.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:11:24.376Z -->
<!-- 源文件: content/fundamentals/circular-dependency.md -->

### 循环依赖

循环依赖是指两个类之间存在依赖关系。例如，类 A 需要类 B，而类 B 也需要类 A。循环依赖可以在 Nest 之间的模块和提供者之间出现。

虽然循环依赖应该尽量避免，但是在某些情况下是无法避免的。在这种情况下，Nest 可以通过两种方式来解决循环依赖之间的提供者实例。其中一种是使用 **forward referencing** 技术，另一种是使用 **ModuleRef** 类从 DI 容器中获取提供者实例。

本章还将描述解决模块之间的循环依赖。

> 警告 **警告** 循环依赖也可能是由使用 "barrel files"/index.ts 文件来组合导入的结果。这些barrel文件在模块/提供者类中应该被忽略。例如，不应该在同一目录下使用 barrel 文件来导入文件，即 __INLINE_CODE_4__ shouldn't import __INLINE_CODE_5__ to import the __INLINE_CODE_6__ file。更多信息请见 __LINK_21__。

#### 前向引用

**前向引用** 允许 Nest 对于尚未定义的类进行引用，使用 __INLINE_CODE_7__ 实用函数。例如，如果 __INLINE_CODE_8__ 和 __INLINE_CODE_9__ 互相依赖，那么两边都可以使用 __INLINE_CODE_10__ 和 __INLINE_CODE_11__ 实用函数来解决循环依赖。否则，Nest 就不会实例化它们，因为所有必要的元数据都不可用。下面是一个示例：

```typescript title="示例"

```typescript
import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.REQUEST })
export class CatsService {}

```

```

> 提示 **提示** `scope` 函数来自 `@Injectable()` 包。

这是关系的一半。现在让我们继续处理 `scope`：

```typescript title="示例"

```typescript
{
  provide: 'CACHE_MANAGER',
  useClass: CacheManager,
  scope: Scope.TRANSIENT,
}

```

```

> 警告 **警告** 实例化顺序是不可预测的。确保您的代码不依赖于哪个构造函数被调用首先。具有 `Scope` 的提供者之间的循环依赖可能会导致未定义的依赖关系。更多信息请见 __LINK_22__。

#### ModuleRef 类替代方案

使用 `@nestjs/common` 的替代方案是使用 `Scope.DEFAULT` 类来获取提供者实例，位于循环关系的另一侧。了解更多关于 `scope` 实用类的信息 __LINK_23__。

#### 模块前向引用

为了解决模块之间的循环依赖，可以在模块之间使用相同的 `scope` 实用函数。例如：

```typescript title="示例"

```typescript
@Controller({
  path: 'cats',
  scope: Scope.REQUEST,
})
export class CatsController {}

```

```

这是关系的一半。现在让我们继续处理 `ControllerOptions`：

```typescript title="示例"

```typescript
import { Injectable, Scope, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

@Injectable({ scope: Scope.REQUEST })
export class CatsService {
  constructor(@Inject(REQUEST) private request: Request) {}
}

```

```

Note: I followed the provided glossary and translation requirements to translate the text. I also kept the code examples, variable names, function names, and Markdown formatting unchanged. I translated code comments from English to Chinese and did not explain or modify placeholders like __INLINE_CODE_N__, __CODE_BLOCK_N__, __LINK_N__, __HTML_TAG_N__.