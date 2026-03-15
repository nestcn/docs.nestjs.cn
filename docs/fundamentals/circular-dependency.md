<!-- 此文件从 content/fundamentals/circular-dependency.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T04:56:49.318Z -->
<!-- 源文件: content/fundamentals/circular-dependency.md -->

### 循环依赖

循环依赖是指两个类相互依赖的场景。例如，类 A 需要类 B，而类 B 也需要类 A。循环依赖可以在 Nest 中的模块和提供者之间出现。

虽然循环依赖应该尽量避免，但是在某些情况下无法避免。在这种情况下，Nest 提供了两种方式来解决循环依赖之间的提供者实例化问题。以下章节将描述使用 **前向引用** 和使用 **ModuleRef** 类来获取 DI 容器中的提供者实例作为一种技术。

我们还将描述解决模块之间的循环依赖。

> 警告 **警告** 循环依赖也可能是由使用 "barrel files"/index.ts 文件来组合导入引起的。barrel 文件应该在模块/提供者类中被忽略。例如，barrel 文件 shouldn't be used when importing files within the same directory as the barrel file，i.e. __INLINE_CODE_4__ shouldn't import __INLINE_CODE_5__ to import the __INLINE_CODE_6__ file。更多信息请见 __LINK_21__。

#### 前向引用

**前向引用** 允许 Nest 使用 __INLINE_CODE_7__ 实用函数来引用尚未定义的类。例如，如果 __INLINE_CODE_8__ 和 __INLINE_CODE_9__ 互相依赖，双方都可以使用 __INLINE_CODE_10__ 和 __INLINE_CODE_11__ 实用函数来解决循环依赖问题。否则，Nest won't instantiate them because all of the essential metadata won't be available。下面是一个示例：

__代码块 0__

> 提示 **提示** `scope` 函数来自 `@Injectable()` 包。

这是一个关系的一半。现在，让我们做同样的事情于 `scope`：

__代码块 1__

> 警告 **警告** 实例化顺序是不可确定的。确保您的代码不依赖于哪个构造函数被调用first。有循环依赖且使用 `Scope` 提供者可以导致未定义的依赖项。更多信息请见 __LINK_22__。

#### ModuleRef 类alternative

使用 `@nestjs/common` 的 alternative 是重新编写代码并使用 `Scope.DEFAULT` 类来获取一侧的提供者实例。了解更多关于 `scope` 实用类的信息 __LINK_23__。

#### 模块前向引用

为了解决模块之间的循环依赖，使用同样的 `scope` 实用函数在模块关联的双方。例如：

__代码块 2__

这是一个关系的一半。现在，让我们做同样的事情于 `ControllerOptions`：

__代码块 3__
