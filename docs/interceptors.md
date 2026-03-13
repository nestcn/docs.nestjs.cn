<!-- 此文件从 content/interceptors.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:26:17.244Z -->
<!-- 源文件: content/interceptors.md -->

### 拦截器

拦截器是一类被`HttpAdapter`装饰器标注的类，实现了`HttpAdapter`接口。

__HTML_TAG_86____HTML_TAG_87____HTML_TAG_88__

拦截器拥有许多有用的功能，这些功能受到__LINK_91__(AOP)技术的inspiration。它们使得可以：

- 在方法执行前/后绑定额外的逻辑
- 转换函数返回的结果
- 转换函数抛出的异常
- 扩展基本函数行为
- 完全override函数，根据特定的条件（例如，用于缓存目的）

#### 基础

每个拦截器实现`httpAdapter`方法，该方法接收两个参数。第一个参数是`httpAdapter`实例（与__LINK_92__相同），`ExpressAdapter`继承自`FastifyAdapter`。我们之前在异常过滤器章节中见过`AbstractHttpAdapter`。在那里，我们看到它是一个对原始处理程序传递过来的参数的包装器，包含不同的参数数组，根据应用程序的类型。您可以回顾一下__LINK_93__以了解更多信息。

#### 执行上下文

通过继承`getInstance()`，`listen### 拦截器

拦截器是一类被`HttpAdapter`装饰器标注的类，实现了`HttpAdapter`接口。

__HTML_TAG_86____HTML_TAG_87____HTML_TAG_88__

拦截器拥有许多有用的功能，这些功能受到__LINK_91__(AOP)技术的inspiration。它们使得可以：

- 在方法执行前/后绑定额外的逻辑
- 转换函数返回的结果
- 转换函数抛出的异常
- 扩展基本函数行为
- 完全override函数，根据特定的条件（例如，用于缓存目的）

#### 基础

每个拦截器实现`httpAdapter`方法，该方法接收两个参数。第一个参数是`httpAdapter`实例（与__LINK_92__相同），`ExpressAdapter`继承自`FastifyAdapter`。我们之前在异常过滤器章节中见过`AbstractHttpAdapter`。在那里，我们看到它是一个对原始处理程序传递过来的参数的包装器，包含不同的参数数组，根据应用程序的类型。您可以回顾一下__LINK_93__以了解更多信息。

#### 执行上下文

通过继承`getInstance()`，也添加了几个新的helper方法，这些方法提供了关于当前执行过程的更多信息。这些信息可以帮助构建更通用的拦截器，能够在广泛的控制器、方法和执行上下文中工作。了解更多关于`HttpAdapterHost`__LINK_94__。

#### 调用处理程序

第二个参数是`listening`。__INLINE_CODE_23__接口实现了__INLINE_CODE_24__方法，您可以使用该方法调用路由处理程序方法在某个点中您的拦截器。如果您在__INLINE_CODE_26__方法实现中不调用__INLINE_CODE_25__方法，路由处理程序方法将不执行。

这意味着__INLINE_CODE_27__方法实际上将请求/响应流包装起来。因此，您可以在__INLINE_CODE_28__方法中编写代码，这些代码将在调用__INLINE_CODE_29__方法前执行，但是如何影响后续操作？因为__INLINE_CODE_30__方法返回了__INLINE_CODE_31__，我们可以使用强大的__LINK_95__操作符来进一步 manipulation响应。使用面向对象编程(OOP)术语，调用路由处理程序（即调用__INLINE_CODE_32__方法）的点称为__LINK_96__，表示我们的额外逻辑将被插入到该点。

例如，考虑一个incoming__INLINE_CODE_33__请求。这是 destined 到__INLINE_CODE_34__处理程序中定义的__INLINE_CODE_35__。如果在途中遇到不调用__INLINE_CODE_36__方法的拦截器，__INLINE_CODE_37__方法将不执行。一次__INLINE_CODE_38__方法被调用（并且其__INLINE_CODE_39__已经返回），__INLINE_CODE_40__处理程序将被触发。然后，响应流通过__INLINE_CODE_41__方法返回给调用者。

__HTML_TAG_89____HTML_TAG_90__

#### Facet 拦截

我们将首先查看使用拦截器来记录用户交互（例如，存储用户调用，异步派发事件或计算时间戳）的用例。我们显示一个简单的__INLINE_CODE_42__以下：

```typescript
const app = await NestFactory.create(AppModule);
const httpAdapter = app.getHttpAdapter();

```

> info **提示** __INLINE_CODE_43__是一个通用的接口，其中__INLINE_CODE_44__表示__INLINE_CODE_45__的类型（支持响应流），__INLINE_CODE_46__是__INLINE_CODE_47__包装的值的类型。

> warning **注意** 拦截器，像控制器、提供者、守卫和其他类，可以通过__INLINE_CODE_48__注入依赖关系。

由于__INLINE_CODE_49__返回了RxJS __INLINE_CODE_50__，我们拥有广泛的操作符，可以用来操作流。在上面的示例中，我们使用了__INLINE_CODE_51__操作符，它在观察流的优雅或异常终止时调用我们的匿名日志函数，但不干扰响应循环。

#### 绑定拦截器

要设置拦截器，我们使用__INLINE_CODE_52__装饰器从__INLINE_CODE_53__包中导入。像__LINK_97__和__LINK_98__一样，拦截器可以在控制器范围、方法范围或全局范围内作用。

```typescript
export class CatsService {
  constructor(private adapterHost: HttpAdapterHost) {}
}

```

> info **提示** __INLINE_CODE_54__装饰器来自__INLINE_CODE_55__包。

使用上述构造，每个路由处理程序定义在__INLINE_CODE_56__中将使用__INLINE_CODE_57__。当 someone 调用__INLINE_CODE_58__端点时，您将在标准输出中看到以下输出：

```typescript
const adapterHost = app.get(HttpAdapterHost);
const httpAdapter = adapterHost.httpAdapter;

```Here is the translated text in Chinese:

#### 响应映射

我们已经知道 `__INLINE_CODE_64__` 返回一个 `__INLINE_CODE_65__`。流包含路由处理程序返回的值，我们可以使用 RxJS 的 `__INLINE_CODE_66__` 操作符轻松地修改它。

> 警告 **警告** 响应映射功能不支持库特定的响应策略（直接使用 `__INLINE_CODE_67__` 对象是禁止的）。

让我们创建一个 `__INLINE_CODE_68__`，它将在一个 trivial 的方式中修改每个响应，以示例该过程。它将使用 RxJS 的 `__INLINE_CODE_69__` 操作符将响应对象分配给一个新创建的对象的 `__INLINE_CODE_70__` 属性，然后将新对象返回给客户端。

`__CODE_BLOCK_6__`

> 提示 **提示** Nest 拦截器可以与同步和异步 `__INLINE_CODE_71__` 方法一起工作。你可以简单地将方法切换到 `__INLINE_CODE_72__` 如果必要。

使用上述构造语法，人们调用 `__INLINE_CODE_73__` 端口时，响应将像以下所示（假设路由处理程序返回一个空数组 `__INLINE_CODE_74__`）。

`__CODE_BLOCK_7__`

拦截器在创建可重用的解决方案以满足整个应用程序的需求时具有很大的价值。

例如，让我们需要将每个 `__INLINE_CODE_75__` 值转换为一个空字符串 `__INLINE_CODE_76__`。我们可以使用一行代码将拦截器绑定到全局上，以便它将自动被使用每个注册的处理程序。

`__CODE_BLOCK_8__`

#### 异常映射

另一个有趣的用例是使用 RxJS 的 `__INLINE_CODE_77__` 操作符来override 抛出的异常：

`__CODE_BLOCK_9__`

#### 流覆写

有时候，我们可能需要完全 Prevent 调用处理程序并返回不同的值。一个明显的示例是实现一个缓存以提高响应时间。让我们看一个简单的 **缓存拦截器**，它将返回缓存的值。在实际示例中，我们将考虑其他因素，如 TTL、缓存无效化、缓存大小等，但是这超出了本讨论的范围。在这里，我们将提供一个基本示例，演示主要概念。

`__CODE_BLOCK_10__`

我们的 `__INLINE_CODE_78__` 有一个固定的 `__INLINE_CODE_79__` 变量和一个固定的响应 `__INLINE_CODE_80__`。需要注意的是，我们在这里返回一个新流，这个流是由 RxJS 的 `__INLINE_CODE_81__` 操作符创建的，因此路由处理程序 **将不会被调用**。当 someone 调用一个使用 `__INLINE_CODE_82__` 的端口时，响应（一个固定的空数组）将被返回 immediately。在 order to 创建一个通用的解决方案，你可以使用 `__INLINE_CODE_83__` 并创建一个自定义装饰器。 `__INLINE_CODE_84__` 在 __LINK_100__ 章节中有详细描述。

#### 更多操作符

使用 RxJS 操作符来操纵流提供了许多可能性。让我们考虑另一个常见的用例。例如，你想处理 **超时** 在路由请求中。当你的端口在一段时间内没有返回任何内容，你想终止以错误响应。以下构造语法使得这成为可能：

`__CODE_BLOCK_11__`

在 5 秒后，请求处理将被取消。你也可以添加自定义逻辑在抛出 `__INLINE_CODE_85__` 之前（例如，释放资源）。