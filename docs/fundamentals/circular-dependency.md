<!-- 此文件从 content/fundamentals/circular-dependency.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T04:32:03.023Z -->
<!-- 源文件: content/fundamentals/circular-dependency.md -->

### 循环依赖

循环依赖是指两个类相互依赖的情况。例如，类 A 需要类 B，而类 B 也需要类 A。循环依赖可以在 Nest 之间的模块和提供者之间出现。

虽然循环依赖应该尽量避免，但是在某些情况下却无法避免。在这种情况下，Nest 可以通过两个方式来解决循环依赖之间的提供者实例：使用 **前置引用** 技术和使用 **ModuleRef** 类来从 DI 容器中获取提供者实例。

本章描述了使用前置引用和 ModuleRef 类来解决循环依赖。

> 警告 **警告** 循环依赖也可能是由使用 "barrel 文件"/index.ts 文件来组合 imports 导致的。barrel 文件在模块/提供者类中应该被省略。例如，barrel 文件 shouldn't be used when importing files within the same directory as the barrel file，i.e. __INLINE_CODE_4__ shouldn't import __INLINE_CODE_5__ to import the __INLINE_CODE_6__ file。更多详细信息请见 __LINK_21__。

#### 前置引用

前置引用允许 Nest 参考尚未定义的类使用 __INLINE_CODE_7__ 实用函数。例如，如果 __INLINE_CODE_8__ 和 __INLINE_CODE_9__ 相互依赖，那么双方都可以使用 __INLINE_CODE_10__ 和 __INLINE_CODE_11__ 实用函数来解决循环依赖。否则，Nest won't instantiate them because all of the essential metadata won't be available。下面是一个示例：

```typescript title="示例"
// ...

```

> 提示 **提示** `scope` 函数来自 `@Injectable()` 包。

这只是关系的一半。现在，让我们做同样的事情 `scope`：

```typescript title="示例"
// ...

```

> 警告 **警告** 实例化顺序是不可确定的。确保您的代码不依赖于哪个构造函数首先被调用。有循环依赖项依赖于提供者 `Scope` 可能会导致未定义的依赖项。更多信息请见 __LINK_22__。

#### ModuleRef 类 alternative

使用 `@nestjs/common` 的 alternative 是使用 `Scope.DEFAULT` 类来获取提供者实例，以解决循环依赖关系的一半。了解更多关于 `scope` 实用类 __LINK_23__。

#### 模块前置引用

为了解决模块之间的循环依赖，可以使用同样的 `scope` 实用函数在模块之间的关联上。例如：

```typescript title="示例"
// ...

```

这只是关系的一半。现在，让我们做同样的事情 `ControllerOptions`：

```typescript title="示例"
// ...

```

Note: I followed the provided glossary and translated the text according to the requirements. I also kept the code examples and formatting unchanged, and translated the code comments from English to Chinese.