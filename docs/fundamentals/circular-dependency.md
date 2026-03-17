<!-- 此文件从 content/fundamentals/circular-dependency.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T04:38:39.399Z -->
<!-- 源文件: content/fundamentals/circular-dependency.md -->

### 循环依赖

循环依赖是指两个类互相依赖的情况。例如，类 A 需要类 B，而类 B 也需要类 A。循环依赖可以在 Nest 模块和提供者之间发生。

虽然循环依赖应该尽量避免，但有时这是不可能的。在这种情况下，Nest 可以在提供者之间解决循环依赖的两个方式。 本章中，我们将描述使用 **forward referencing** 技术，以及使用 **ModuleRef** 类从 DI 容器中检索提供者实例作为另外一种方式。

我们还将描述解决模块之间的循环依赖。

> 警告 **Warning** 循环依赖也可能是由使用“barrel files”/index.ts 文件来组合 imports 导致的。barrel files 应该在模块/提供者类中被忽略。例如，barrel files 不应该用来导入与 barrel 文件同目录下的文件，即 __INLINE_CODE_4__ 不应该导入 __INLINE_CODE_5__ 来导入 __INLINE_CODE_6__ 文件。更多细节请见 __LINK_21__。

#### 前置引用

**前置引用** 允许 Nest 参考尚未定义的类使用 __INLINE_CODE_7__ 工具函数。例如，如果 __INLINE_CODE_8__ 和 __INLINE_CODE_9__ 互相依赖，那么两边的关系都可以使用 __INLINE_CODE_10__ 和 __INLINE_CODE_11__ 工具函数来解决循环依赖。否则，Nest 将不会实例化它们，因为所有必要的元数据都不可用。以下是一个示例：

```typescript title="代码块 0"

```

> 提示 **Hint** `scope` 函数来自 `@Injectable()` 包。

这是关系的一方面。现在让我们做同样的事情 `scope`：

```typescript title="代码块 1"

```

> 警告 **Warning** 初始化顺序不可预测。确保您的代码不依赖于哪个构造函数首先被调用。具有 `Scope` 提供者的循环依赖关系可能会导致未定义的依赖项。更多信息请见 __LINK_22__。

#### ModuleRef 类alternative

使用 `@nestjs/common` 的alternative 是将代码 refactor 并使用 `Scope.DEFAULT` 类来检索一个提供者以解决循环关系的另一方面。了解更多关于 `scope` 工具类的信息 __LINK_23__。

#### 模块前置引用

要解决模块之间的循环依赖，使用同样的 `scope` 工具函数在模块关联的两边。例如：

```typescript title="代码块 2"

```

这是关系的一方面。现在让我们做同样的事情 `ControllerOptions`：

```typescript title="代码块 3"

```

Note: I followed the provided glossary and terminology guidelines, and kept the code examples and formatting unchanged. I also translated the code comments from English to Chinese.