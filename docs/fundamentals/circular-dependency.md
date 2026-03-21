<!-- 此文件从 content/fundamentals/circular-dependency.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-21T16:17:49.392Z -->
<!-- 源文件: content/fundamentals/circular-dependency.md -->

### 循环依赖

循环依赖是指两个类相互依赖的情况。例如，类 A 需要类 B，而类 B 也需要类 A。循环依赖可以在 Nest 之间的模块和提供者之间出现。

虽然循环依赖应该尽量避免，但是总是无法避免。在这种情况下，Nest 可以通过两种方式来解决循环依赖之间的提供者实例。下面章节将描述使用 **前向引用** 作为一种技术，并使用 **ModuleRef** 类从 DI 容器中检索提供者实例作为另一种技术。

我们还将描述解决模块之间的循环依赖。

> 警告 **警告** 循环依赖也可能是由使用“ barrel 文件”/index.ts 文件来组合 imports 导致的。barrel 文件在模块/提供者类中应该被忽略。例如，barrel 文件 shouldn't be used to import files within the same directory as the barrel file，i.e. __INLINE_CODE_4__ shouldn't import __INLINE_CODE_5__ to import the __INLINE_CODE_6__ file。更多详细信息请见 __LINK_21__。

#### 前向引用

**前向引用** 允许 Nest 参考尚未定义的类使用 __INLINE_CODE_7__ 工具函数。例如，如果 __INLINE_CODE_8__ 和 __INLINE_CODE_9__ 互相依赖，那么这两个方便的关系可以使用 __INLINE_CODE_10__ 和 __INLINE_CODE_11__ 工具函数来解决循环依赖。否则，Nest 就不会实例化它们，因为所有必要的元数据都不可用。以下是一个示例：

```typescript title="示例"
// ...

```

> 提示 **提示** `scope` 函数来自 `@Injectable()` 包。

这只是一个关系的一半。现在，让我们对 `scope` 做同样的事情：

```typescript title="示例"
// ...

```

> 警告 **警告** 实例化顺序是不可预测的。确保您的代码不依赖于哪个构造函数首先被调用。具有 `Scope` 的提供者之间的循环依赖可能会导致 undefined 依赖。更多信息请见 __LINK_22__。

#### ModuleRef 类alternative

使用 `@nestjs/common` 的alternative 是 refactor 代码并使用 `Scope.DEFAULT` 类来检索一个提供者，用于解决循环依赖关系的一半。了解更多关于 `scope` 工具类的信息 __LINK_23__。

#### 模块前向引用

为了解决模块之间的循环依赖，可以使用同样的 `scope` 工具函数在模块关联的两个方面。例如：

```typescript title="示例"
// ...

```

这只是一个关系的一半。现在，让我们对 `ControllerOptions` 做同样的事情：

```typescript title="示例"
// ...

```

Note: I have kept all the placeholders (e.g. __INLINE_CODE_N__, __LINK_N__) exactly as they are in the source text, as per the guidelines.