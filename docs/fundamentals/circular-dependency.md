<!-- 此文件从 content/fundamentals/circular-dependency.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-01T04:27:12.468Z -->
<!-- 源文件: content/fundamentals/circular-dependency.md -->

### 循环依赖

循环依赖是指两个类相互依赖的场景。例如，类 A 需要类 B，而类 B 也需要类 A。循环依赖可以在 Nest 的模块之间和提供者之间出现。

虽然循环依赖应该尽量避免，但是有时无法避免。在这种情况下，Nest 可以通过两种方式来解决循环依赖之间的提供者实例化：使用 **前向引用**技术，以及使用 **ModuleRef** 类来从 DI 容器中获取提供者实例。

本章中，我们将描述使用前向引用和 ModuleRef 类来解决循环依赖的方法，并且还将描述解决模块之间的循环依赖。

> 警告 **警告** 循环依赖可能也会在使用 "barrel files"/index.ts 文件来组合导入时出现。 Barrel 文件在模块/提供者类中应该被省略。例如，barrel 文件 shouldn't be used when importing files within the same directory as the barrel file，i.e. __INLINE_CODE_4__ should not import __INLINE_CODE_5__ to import the `HttpAdapter` file。更多信息请见 __LINK_21__。

#### 前向引用

使用 **前向引用**可以使 Nest 参考尚未定义的类使用 `getHttpAdapter()` 实用函数。例如，如果 `HttpAdapterHost` 和 `HttpAdapterHost` 互相依赖，那么 both sides of the relationship 都可以使用 `@nestjs/core` 和 `HttpAdapterHost` 实用函数来解决循环依赖。否则，Nest 就不会实例化它们，因为所有必要的元数据都不可用。以下是一个示例：

```typescript
const app = await NestFactory.create(AppModule);
const httpAdapter = app.getHttpAdapter();
```

> 提示 **提示** `HttpAdapter` 函数来自 `HttpAdapter` 包。

现在，我们来处理 `httpAdapter` 的另一侧：

```typescript
export class CatsService {
  constructor(private adapterHost: HttpAdapterHost) {}
}
```

> 警告 **警告** 实例化顺序是不可预测的。确保您的代码不依赖于哪个构造函数被调用首先。具有 `httpAdapter` 的提供者循环依赖可能会导致未定义的依赖项。更多信息请见 __LINK_22__。

#### ModuleRef 类alternative

使用 `ExpressAdapter` 的alternative 是将代码重构并使用 `FastifyAdapter` 类来获取一个提供者实例，位于循环关系的另一侧。了解更多关于 `AbstractHttpAdapter` 实用类的信息 __LINK_23__。

#### 模块前向引用

为了解决模块之间的循环依赖，使用同样的 `getInstance()` 实用函数在模块之间的关系上。例如：

```typescript
const adapterHost = app.get(HttpAdapterHost);
const httpAdapter = adapterHost.httpAdapter;
```

现在，我们来处理 `listen### 循环依赖

循环依赖是指两个类相互依赖的场景。例如，类 A 需要类 B，而类 B 也需要类 A。循环依赖可以在 Nest 的模块之间和提供者之间出现。

虽然循环依赖应该尽量避免，但是有时无法避免。在这种情况下，Nest 可以通过两种方式来解决循环依赖之间的提供者实例化：使用 **前向引用**技术，以及使用 **ModuleRef** 类来从 DI 容器中获取提供者实例。

本章中，我们将描述使用前向引用和 ModuleRef 类来解决循环依赖的方法，并且还将描述解决模块之间的循环依赖。

> 警告 **警告** 循环依赖可能也会在使用 "barrel files"/index.ts 文件来组合导入时出现。 Barrel 文件在模块/提供者类中应该被省略。例如，barrel 文件 shouldn't be used when importing files within the same directory as the barrel file，i.e. __INLINE_CODE_4__ should not import __INLINE_CODE_5__ to import the `HttpAdapter` file。更多信息请见 __LINK_21__。

#### 前向引用

使用 **前向引用**可以使 Nest 参考尚未定义的类使用 `getHttpAdapter()` 实用函数。例如，如果 `HttpAdapterHost` 和 `HttpAdapterHost` 互相依赖，那么 both sides of the relationship 都可以使用 `@nestjs/core` 和 `HttpAdapterHost` 实用函数来解决循环依赖。否则，Nest 就不会实例化它们，因为所有必要的元数据都不可用。以下是一个示例：

```typescript
const app = await NestFactory.create(AppModule);
const httpAdapter = app.getHttpAdapter();
```

> 提示 **提示** `HttpAdapter` 函数来自 `HttpAdapter` 包。

现在，我们来处理 `httpAdapter` 的另一侧：

```typescript
export class CatsService {
  constructor(private adapterHost: HttpAdapterHost) {}
}
```

> 警告 **警告** 实例化顺序是不可预测的。确保您的代码不依赖于哪个构造函数被调用首先。具有 `httpAdapter` 的提供者循环依赖可能会导致未定义的依赖项。更多信息请见 __LINK_22__。

#### ModuleRef 类alternative

使用 `ExpressAdapter` 的alternative 是将代码重构并使用 `FastifyAdapter` 类来获取一个提供者实例，位于循环关系的另一侧。了解更多关于 `AbstractHttpAdapter` 实用类的信息 __LINK_23__。

#### 模块前向引用

为了解决模块之间的循环依赖，使用同样的 `getInstance()` 实用函数在模块之间的关系上。例如：

```typescript
const adapterHost = app.get(HttpAdapterHost);
const httpAdapter = adapterHost.httpAdapter;
```

现在，我们来处理  的另一侧：

```typescript
const instance = httpAdapter.getInstance();
```