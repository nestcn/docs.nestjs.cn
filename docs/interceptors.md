<!-- 此文件从 content/interceptors.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T04:45:47.999Z -->
<!-- 源文件: content/interceptors.md -->

### 拦截器

拦截器是一个带有 __INLINE_CODE_12__ 装饰器的类，实现了 __INLINE_CODE_13__ 接口。

__HTML_TAG_86____HTML_TAG_87____HTML_TAG_88__

拦截器具有许多有用的能力，这些能力是基于 __LINK_91__ (AOP) 技术的。它们使得我们能够：

* 在方法执行前/后绑定额外的逻辑
* 将函数返回的结果转换
* 将函数抛出的异常转换
* 扩展基本函数行为
* 完全override函数，根据特定的条件（例如，用于缓存目的）

#### 基础

每个拦截器都实现了 __INLINE_CODE_14__ 方法，该方法接受两个参数。第一个参数是 __INLINE_CODE_15__ 实例（与 __LINK_92__ 中的实例相同），__INLINE_CODE_16__ 继承自 __INLINE_CODE_17__。我们之前在异常过滤器章节中见过 __INLINE_CODE_18__。那里，我们看到它是一个对原始处理程序传递的参数的包装器，包含不同的参数数组，根据应用程序的类型。您可以回顾一下 __LINK_93__以获取更多信息。

#### 执行上下文

通过继承 __INLINE_CODE_19__，__INLINE_CODE_20__ 也添加了几个新的帮助方法，这些方法提供了当前执行过程的额外信息。这些信息可以帮助我们构建更通用的拦截器，它们可以在广泛的控制器、方法和执行上下文中工作。了解更多关于 __INLINE_CODE_21__ 的信息请查看 __LINK_94__。

#### 调用处理器

第二个参数是 __INLINE_CODE_22__。__INLINE_CODE_23__ 接口实现了 __INLINE_CODE_24__ 方法，您可以使用该方法来调用路由处理器方法在某个时刻在拦截器中。如果您在实现 __INLINE_CODE_26__ 方法中不调用 __INLINE_CODE_25__ 方法，路由处理器方法将不会被执行。

这种方法意味着 __INLINE_CODE_27__ 方法实际上**包装**了请求/响应流。因此，我们可以在 __INLINE_CODE_28__ 方法中编写代码，执行**在**调用 __INLINE_CODE_29__ 之前，但是如何影响后续的执行？因为 __INLINE_CODE_30__ 方法返回的是 __INLINE_CODE_31__，我们可以使用强大的 __LINK_95__ 操作符来进一步操纵响应。使用面向对象编程术语，路由处理器的调用（即调用 __INLINE_CODE_32__）被称为__LINK_96__，表示我们插入的额外逻辑的插入点。

例如，考虑一个 incoming __INLINE_CODE_33__ 请求。这请求将被送到 __INLINE_CODE_34__ 处理器中，该处理器定义在 __INLINE_CODE_35__ 中。如果在途中有一个拦截器没有调用 __INLINE_CODE_36__ 方法，__INLINE_CODE_37__ 方法将不会被执行。等 __INLINE_CODE_38__ 被调用（并且其 __INLINE_CODE_39__ 已经被返回），__INLINE_CODE_40__ 处理器将被触发。等响应流通过 __INLINE_CODE_41__ 被接收，additional 操作可以被执行在流中，并最终结果被返回给调用的程序。

__HTML_TAG_89____HTML_TAG_90__

####Aspect 拦截

我们现在将讨论的是使用拦截器来记录用户交互（例如，存储用户调用，异步分派事件或计算时间戳）。我们展示了一个简单的 __INLINE_CODE_42__：

```typescript
const app = await NestFactory.create(AppModule);
app.setGlobalPrefix('v1');

```

> info **提示** __INLINE_CODE_43__ 是一个通用的接口，其中 __INLINE_CODE_44__ 表示 __INLINE_CODE_45__ 类型的值（支持响应流），和 __INLINE_CODE_46__ 是 __INLINE_CODE_47__ 包装的值类型。

> warning **注意** 拦截器，像控制器、提供者、守卫和其他类，可以**注入依赖项**通过它们的 __INLINE_CODE_48__。

因为 __INLINE_CODE_49__ 返回 RxJS __INLINE_CODE_50__，我们有了很多操作符可以使用来操纵流。在上面的示例中，我们使用了 __INLINE_CODE_51__ 操作符，invoke 我们的匿名日志函数在可靠或异常终止可观察流时，但是不干扰响应周期。

#### 绑定拦截器

要设置拦截器，我们使用 __INLINE_CODE_52__ 装饰器，从 __INLINE_CODE_53__ 包中导入。像 __LINK_97__ 和 __LINK_98__，拦截器可以是控制器作用域、方法作用域或全局作用域。

```typescript
app.setGlobalPrefix('v1', {
  exclude: [{ path: 'health', method: RequestMethod.GET }],
});

```

> info **提示** __INLINE_CODE_54__ 装饰器来自 __INLINE_CODE_55__ 包。

使用上述构建，每个在 __INLINE_CODE_56__ 中定义的路由处理器都将使用 __INLINE_CODE_57__。当someone 调用 __INLINE_CODE_58__ 端口时，您将在标准输出中看到以下输出：

```typescript
app.setGlobalPrefix('v1', { exclude: ['cats'] });

```Here is the translation of the provided English technical documentation to Chinese:

**Note**：我们使用了 `__INLINE_CODE_59__` 类（而不是实例），将责任交给框架，启用依赖注入。像管道、守卫和异常过滤器一样，我们也可以传递在-place 实例：

**__CODE_BLOCK_3__**

正如前所述，以上构造将拦截器附加到该控制器声明的每个处理程序。如果我们想将拦截器的作用域限制到单个方法，我们 simplement 应用装饰器在**方法级别**。

为了设置全局拦截器，我们使用 Nest 应用程序实例的 `__INLINE_CODE_60__` 方法：

**__CODE_BLOCK_4__**

全局拦截器在整个应用程序中使用，每个控制器和路由处理程序都将使用。在依赖注入方面，全局拦截器注册于外部模块（使用 `__INLINE_CODE_61__`，如上面的示例）不能注入依赖项，因为这是在模块上下文外完成的。在解决这个问题时，您可以在任何模块中设置拦截器，使用以下构造：

**__CODE_BLOCK_5__**

> info **提示** 使用这种方法在拦截器中进行依赖注入时，请注意，无论在哪个模块中使用这种构造，拦截器实际上是全局的。在哪里执行？选择在拦截器（如上面的示例）定义的模块中。此外，`__INLINE_CODE_63__` 不是唯一的自定义提供者注册方式。了解更多信息__LINK_99__。

#### 响应映射

我们已经知道 `__INLINE_CODE_64__` 返回 `__INLINE_CODE_65__`。流包含路由处理程序返回的值，因此我们可以使用 RxJS 的 `__INLINE_CODE_66__` 操作符轻松地将其 mutate。

> warning **警告** 响应映射功能不适用于库特定的响应策略（使用 `__INLINE_CODE_67__` 对象直接 forbidden）。

让我们创建一个 `__INLINE_CODE_68__`，它将在每个响应上进行简单的修改，以示例该过程。它将使用 RxJS 的 `__INLINE_CODE_69__` 操作符将响应对象分配给一个新的对象的 `__INLINE_CODE_70__` 属性，并将新的对象返还给客户端。

**__CODE_BLOCK_6__**

> info **提示** Nest 拦截器可以与同步和异步 `__INLINE_CODE_71__` 方法一起工作。您可以简单地将方法切换到 `__INLINE_CODE_72__`，如果需要。

使用上述构造，当 someone 调用 `__INLINE_CODE_73__` 端口时，响应将如下所示（假设路由处理程序返回一个空数组 `__INLINE_CODE_74__`）：

**__CODE_BLOCK_7__**

拦截器在整个应用程序中具有很高的价值。例如，假设我们需要将每个 `__INLINE_CODE_75__` 值转换为一个空字符串 `__INLINE_CODE_76__`。我们可以使用一行代码并将拦截器绑定到全局，以便自动使用每个注册的处理程序。

**__CODE_BLOCK_8__**

#### 异常映射

另一个有趣的用例是使用 RxJS 的 `__INLINE_CODE_77__` 操作符来override thrown 异常：

**__CODE_BLOCK_9__**

#### 流_OVERRIDE

有多种原因，我们可能需要完全防止调用处理程序并返回不同的值。一个明显的例子是实现缓存以提高响应速度。让我们看看一个简单的**缓存拦截器**，它将返回缓存的响应。在实际示例中，我们将考虑其他因素，如 TTL、缓存无效、缓存大小等，但是这超出了讨论的范围。在这里，我们将提供一个基本示例，展示主要概念。

**__CODE_BLOCK_10__**

我们的 `__INLINE_CODE_78__` posséd un variable __INLINE_CODE_79__ 和一个硬编码的响应 `__INLINE_CODE_80__`。关键点是，我们在这里返回了一个新的流，使用 RxJS 的 `__INLINE_CODE_81__` 操作符，因此处理程序**不会被调用**。当 someone 调用一个使用 `__INLINE_CODE_82__` 的端口时，响应（一个硬编码的空数组）将被立即返回。在创建通用解决方案时，您可以使用 `__INLINE_CODE_83__` 创建自定义装饰器。 `__INLINE_CODE_84__` 在 __LINK_100__ 章节中有更详细的描述。

#### 更多操作符

使用 RxJS 操作符来 manipulate 流提供了许多可能性。让我们考虑另一个常见的用例。假设您想在路由请求中处理**超时**。当端口不返回任何内容时，您想终止并返回错误响应。以下构造使得这一点成为可能：

**__CODE_BLOCK_11__**

在 5 秒后，请求处理将被取消。您也可以在抛出 `__INLINE_CODE_85__` 之前添加自定义逻辑（例如释放资源）。