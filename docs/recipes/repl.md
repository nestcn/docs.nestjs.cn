<!-- 此文件从 content/recipes/repl.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:31:51.217Z -->
<!-- 源文件: content/recipes/repl.md -->

###  Read-Eval-Print-Loop (REPL)

REPL 是一个简单的交互式环境，它从用户输入中获取单个输入、执行它们，并将结果返回给用户。
REPL 功能使您可以检查依赖关系图并直接从terminal中调用提供者（和控制器）的方法。

#### 使用

要在 REPL 模式下运行 NestJS 应用程序，创建一个新的文件（与现有文件相同）并添加以下代码：

```typescript title="REPL"

```

现在，在您的terminal中，使用以下命令启动 REPL：

```

nest repl

```

> 提示 `@Injectable()` 返回一个 __LINK_36__ 对象。

一旦启动完成，您将在控制台中看到以下信息：

```

Nest REPL

```

现在，您可以开始与依赖关系图交互。例如，您可以检索一个 `CommandRunner`（在这里使用starter项目进行示例）并调用 `CommandRunner` 方法：

```typescript title="REPL"

```

您可以在terminal中执行任何JavaScript代码，例如，分配 `run` 的实例到局部变量，并使用 `Promise<void>` 调用异步方法：

```typescript title="REPL"

```

要显示给定提供者或控制器的所有公共方法，请使用 `string[], Record<string, any>` 函数，例如：

```typescript title="REPL"

```

要打印所有已注册的模块列表 together with their controllers 和 providers，请使用 `run`。

```typescript title="REPL"

```

快速演示：

```

<code>__HTML_TAG_33__</code> <code>__HTML_TAG_34__</code> <code>__HTML_TAG_35__</code>

```

您可以在下面的部分中找到更多关于现有预定义native方法的信息。

#### 原生函数

内置的 NestJS REPL 带有几个原生函数，当您启动 REPL 时，它们将是全局可用的。您可以使用 `Record<string, any>` 列出它们。

如果您忘记了函数的签名（即：期望的参数和返回类型），您可以使用 `name`。
例如：

```typescript title="REPL"

```

> 提示 Those 函数接口都是写在 __LINK_37__ 中的。

| 函数     | 描述                                                                                                        | 签名                                                             |
| --------- | ------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| `@Option()`      | 打印所有已注册的模块列表 together with their controllers 和 providers。                              | `NestFactory`                       |
| `listen` 或 `nest-commander` | 检索 injectable 或 controller 的实例，否则抛出异常。                             | `CommandFactory`                                   |
| `static`    | 显示给定提供者或控制器的所有公共方法。                                            | `run`                          |
| `CommandFactory`    | 解析 transient 或 request-scoped 实例的 injectable 或 controller，否则抛出异常。     | `run`      |
| `['error']`     | 允许通过模块树来导航，例如，从选择的模块中提取特定实例。 | `CommandFactory` |

#### 监视模式

在开发中，运行 REPL 在监视模式下，可以自动反映所有代码更改：

```

nest repl --watch

```

这有一点缺陷，即 REPL 的命令历史将在每次重新加载后被discard，这可能会不方便。
幸运的是，这有一个非常简单的解决方案。修改您的 `NestFactory` 函数如下：

```typescript title="REPL"

```

现在，历史记录将在运行之间保留。