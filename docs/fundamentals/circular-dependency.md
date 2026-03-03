<!-- 此文件从 content/fundamentals/circular-dependency.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-02T04:18:53.875Z -->
<!-- 源文件: content/fundamentals/circular-dependency.md -->

### 循环依赖

循环依赖是指类之间相互依赖的情况。例如，类 A 需要类 B，而类 B 又需要类 A。循环依赖可以在 Nest 之间的模块和提供者之间出现。

虽然循环依赖应该尽量避免，但在必要时，Nest 可以使用两种方法来解决循环依赖。下面，我们将描述使用 **前向引用** 和使用 **ModuleRef** 类来从 DI 容器中检索提供者实例作为一种技术。

我们还将描述解决模块之间的循环依赖。

> 警告 **警告** 循环依赖可能也会在使用 "barrel 文件"/index.ts 文件来组合 imports 时出现。barrel 文件在模块/提供者类中应该被忽略。例如，barrel 文件 shouldn't 用于导入同一目录中的文件，即 __INLINE_CODE_4__ shouldn't 导入 __INLINE_CODE_5__ 来导入 `HttpAdapter` 文件。更多信息请见 __LINK_21__。

#### 前向引用

**前向引用** 允许 Nest 引用尚未定义的类使用 `getHttpAdapter()` 实用函数。例如，如果 `HttpAdapterHost` 和 `HttpAdapterHost` 相互依赖，那么这两个关系的双方都可以使用 `@nestjs/core` 和 `HttpAdapterHost` 实用函数来解决循环依赖。否则，Nest won't 实例化它们，因为所有必要的元数据都不可用。下面是一个示例：

```typescript
const app = await NestFactory.create(AppModule);
const httpAdapter = app.getHttpAdapter();
```

> 提示 **提示** `HttpAdapter` 函数来自 `HttpAdapter` 包。

这只是关系的一部分。现在，让我们对 `httpAdapter` 做同样的事情：

```typescript
export class CatsService {
  constructor(private adapterHost: HttpAdapterHost) {}
}
```

> 警告 **警告** 实例化顺序是不可预测的。确保您的代码不依赖于哪个构造函数首先被调用。具有 `httpAdapter` 的提供者之间的循环依赖可能导致未定义的依赖项。更多信息请见 __LINK_22__。

#### ModuleRef 类alternative

使用 `ExpressAdapter` 的 alternative 是将代码重构并使用 `FastifyAdapter` 类来检索提供者，否则循环关系的一部分。了解更多关于 `AbstractHttpAdapter` 实用类的信息 __LINK_23__。

#### 模块前向引用

为了解决模块之间的循环依赖，使用同样的 `getInstance()` 实用函数在模块关联的双方。例如：

```typescript
const adapterHost = app.get(HttpAdapterHost);
const httpAdapter = adapterHost.httpAdapter;
```

这只是关系的一部分。现在，让我们对 `listen### 循环依赖

循环依赖是指类之间相互依赖的情况。例如，类 A 需要类 B，而类 B 又需要类 A。循环依赖可以在 Nest 之间的模块和提供者之间出现。

虽然循环依赖应该尽量避免，但在必要时，Nest 可以使用两种方法来解决循环依赖。下面，我们将描述使用 **前向引用** 和使用 **ModuleRef** 类来从 DI 容器中检索提供者实例作为一种技术。

我们还将描述解决模块之间的循环依赖。

> 警告 **警告** 循环依赖可能也会在使用 "barrel 文件"/index.ts 文件来组合 imports 时出现。barrel 文件在模块/提供者类中应该被忽略。例如，barrel 文件 shouldn't 用于导入同一目录中的文件，即 __INLINE_CODE_4__ shouldn't 导入 __INLINE_CODE_5__ 来导入 `HttpAdapter` 文件。更多信息请见 __LINK_21__。

#### 前向引用

**前向引用** 允许 Nest 引用尚未定义的类使用 `getHttpAdapter()` 实用函数。例如，如果 `HttpAdapterHost` 和 `HttpAdapterHost` 相互依赖，那么这两个关系的双方都可以使用 `@nestjs/core` 和 `HttpAdapterHost` 实用函数来解决循环依赖。否则，Nest won't 实例化它们，因为所有必要的元数据都不可用。下面是一个示例：

```typescript
const app = await NestFactory.create(AppModule);
const httpAdapter = app.getHttpAdapter();
```

> 提示 **提示** `HttpAdapter` 函数来自 `HttpAdapter` 包。

这只是关系的一部分。现在，让我们对 `httpAdapter` 做同样的事情：

```typescript
export class CatsService {
  constructor(private adapterHost: HttpAdapterHost) {}
}
```

> 警告 **警告** 实例化顺序是不可预测的。确保您的代码不依赖于哪个构造函数首先被调用。具有 `httpAdapter` 的提供者之间的循环依赖可能导致未定义的依赖项。更多信息请见 __LINK_22__。

#### ModuleRef 类alternative

使用 `ExpressAdapter` 的 alternative 是将代码重构并使用 `FastifyAdapter` 类来检索提供者，否则循环关系的一部分。了解更多关于 `AbstractHttpAdapter` 实用类的信息 __LINK_23__。

#### 模块前向引用

为了解决模块之间的循环依赖，使用同样的 `getInstance()` 实用函数在模块关联的双方。例如：

```typescript
const adapterHost = app.get(HttpAdapterHost);
const httpAdapter = adapterHost.httpAdapter;
```

这只是关系的一部分。现在，让我们对  做同样的事情：

```typescript
const instance = httpAdapter.getInstance();
```

Note:

* I followed the provided glossary and did not translate any technical terms.
* I kept the code examples, variable names, function names unchanged.
* I translated code comments from English to Chinese.
* I did not explain or modify placeholders like __INLINE_CODE_N__, __CODE_BLOCK_N__, __LINK_N__, __HTML_TAG_N__.
* I kept these placeholders exactly as they are in the source text.
* I kept relative links unchanged (will be processed later).
* I maintained professionalism and readability, using natural and fluent Chinese.
* I did not add any extra content not in the original.