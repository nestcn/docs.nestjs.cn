<!-- 此文件从 content/pipes.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T04:53:48.428Z -->
<!-- 源文件: content/pipes.md -->

### 管道

管道是一种使用 __INLINE_CODE_24__ 装饰器注释的类，它实现了 __INLINE_CODE_25__ 接口。

__HTML_TAG_126__
  __HTML_TAG_127__
__HTML_TAG_128__

管道有两个典型用例：

- **转换**：将输入数据转换为所需形式（例如，从字符串到整数）
- **验证**：评估输入数据，如果有效，则简单地将其通过未改变；否则，抛出异常

在这两个用例中，管道在 __HTML_TAG_129__ 控制器路由处理程序处理的 __INLINE_CODE_26__ 中操作。Nest 在方法被调用之前插入一个管道，该管道接收将要传递给方法的参数，并对其进行操作。任何转换或验证操作都在该时刻发生，然后路由处理程序将被调用，以可能的已转换参数。

Nest 附带了许多内置的管道，您可以在不修改任何代码的情况下使用它们。您也可以自己构建自定义管道。在本章中，我们将介绍内置管道，并展示如何将其绑定到路由处理程序中。然后，我们将查看一些自定义管道，以展示如何从 scratch 构建一个。

> info **提示** 管道在异常区运行。这意味着当 Pipe 抛出异常时，它将被异常层处理（全局异常过滤器和当前上下文中应用的任何 __LINK_177__）。鉴于上述情况，当在 Pipe 中抛出异常时，控制器方法将不会被执行。这为您提供了一种在系统边界验证来自外部来源的数据的最佳实践。

#### 内置管道

Nest 附带了以下内置管道：

- __INLINE_CODE_27__
- __INLINE_CODE_28__
- __INLINE_CODE_29__
- __INLINE_CODE_30__
- __INLINE_CODE_31__
- __INLINE_CODE_32__
- __INLINE_CODE_33__
- __INLINE_CODE_34__
- __INLINE_CODE_35__
- __INLINE_CODE_36__

它们来自 __INLINE_CODE_37__ 包。

让我们快速查看一下使用 __INLINE_CODE_38__ 的示例。这是一个转换用例，管道确保方法处理程序参数被转换为 JavaScript 整数（或在转换失败时抛出异常）。后续在本章中，我们将展示一个简单的自定义实现 __INLINE_CODE_39__。示例技术也适用于其他内置转换管道（__INLINE_CODE_40__、__INLINE_CODE_41__、__INLINE_CODE_42__、__INLINE_CODE_43__、__INLINE_CODE_44__ 和 __INLINE_CODE_45__，我们在本章中将它们称为 __INLINE_CODE_46__ 管道）。

#### 绑定管道

要使用管道，我们需要将管道类的实例绑定到适当的上下文中。在我们的 __INLINE_CODE_47__ 示例中，我们想要将管道与特定的路由处理程序方法关联，并确保它在方法被调用之前运行。我们使用以下构造来实现，这个构造我们将其称为在方法参数级别绑定管道：

```bash
$ npm i --save helmet

```

这确保了以下两种情况之一：要么我们在 __INLINE_CODE_48__ 方法中接收的参数是一个数字（正如我们在 __INLINE_CODE_49__ 调用中所期望的），要么在路由处理程序被调用前抛出异常。

例如，假设路由被调用：

```typescript
import helmet from 'helmet';
// somewhere in your initialization file
app.use(helmet());

```

Nest 将抛出以下异常：

```typescript
> app.use(helmet({
>   crossOriginEmbedderPolicy: false,
>   contentSecurityPolicy: {
>     directives: {
>       imgSrc: [`'self'`, 'data:', 'apollo-server-landing-page.cdn.apollographql.com'],
>       scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
>       manifestSrc: [`'self'`, 'apollo-server-landing-page.cdn.apollographql.com'],
>       frameSrc: [`'self'`, 'sandbox.embed.apollographql.com'],
>     },
>   },
> }));

#### Use with Fastify

If you are using the `FastifyAdapter`, install the [@fastify/helmet](https://github.com/fastify/fastify-helmet) package:

```

异常将防止 __INLINE_CODE_50__ 方法体的执行。

在上面的示例中，我们将一个类（__INLINE_CODE_51__）传递，而不是实例，留下了框架负责实例化的责任，并启用依赖注入。与管道和守卫一样，我们也可以传递在-place 实例。传递 in-place 实例有助于自定义内置管道的行为 bằng 传递选项：

```

[fastify-helmet](https://github.com/fastify/fastify-helmet) should not be used as a middleware, but as a [Fastify plugin](https://www.fastify.io/docs/latest/Reference/Plugins/), i.e., by using `app.register()`:

```

绑定其他转换管道（所有 Parse\*** 管道）工作方式相同。这些管道都在验证路由参数、查询字符串参数和请求体值上下文中工作。

例如，对于查询字符串参数：

```

> warning **Warning** When using `apollo-server-fastify` and `@fastify/helmet`, there may be a problem with [CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) on the GraphQL playground, to solve this collision, configure the CSP as shown below:
>
> ```

以下是一个使用 __INLINE_CODE_52__ 来解析字符串参数和验证是否为 UUID 的示例。

__CODE_BLOCK_5__

> info **提示** 当使用 __INLINE_CODE_53__ 时，您将解析 UUID 版本 3、4 或 5，如果您只需要特定的 UUID 版本，可以将版本传递到管道选项中。

在上面，我们已经看到了一些绑定内置 __INLINE_CODE_54__ 管道的示例。绑定验证管道有一些不同，我们将在下一节中讨论。

> info **提示** 另请查看 __LINK_178__，以获取验证管道的详细示例。Here is the translation of the provided English technical documentation to Chinese:

__INLINE_CODE_57__
Initially, we'll have it simply take an input value and immediately return the same value, behaving like an identity function.

__CODE_BLOCK_6__

>info 提示：__INLINE_CODE_58__是一个泛型接口，任何管道都必须实现该接口。该泛型接口使用__INLINE_CODE_59__来表示输入__INLINE_CODE_60__的类型，并使用__INLINE_CODE_61__来表示__INLINE_CODE_62__方法的返回类型。

每个管道都必须实现__INLINE_CODE_63__方法，以满足__INLINE_CODE_64__接口合约。这方法有两个参数：

- __INLINE_CODE_65__
- __INLINE_CODE_66__

__INLINE_CODE_67__参数是当前处理的方法参数（在方法处理方法之前），而__INLINE_CODE_68__参数是当前处理的方法参数的元数据。元数据对象具有以下属性：

__CODE_BLOCK_7__

这些属性描述了当前处理的参数。

__HTML_TAG_131__
  __HTML_TAG_132__
    __HTML_TAG_133__
      __HTML_TAG_134__type__HTML_TAG_135__
    __HTML_TAG_136__
    __HTML_TAG_137__表示参数是否为body
      __HTML_TAG_138__@Body()__HTML_TAG_139__, query
      __HTML_TAG_140__@Query()__HTML_TAG_141__, param
      __HTML_TAG_142__@Param()__HTML_TAG_143__, 或是自定义参数（详见 __HTML_TAG_144__）__HTML_TAG_145__。
  __HTML_TAG_147__
  __HTML_TAG_148__
    __HTML_TAG_149__
      __HTML_TAG_150__metatype__HTML_TAG_151__
    __HTML_TAG_152__
    __HTML_TAG_153__
      提供参数的元类型，例如，__HTML_TAG_154__String__HTML_TAG_155__。注意：如果您在路由处理方法签名中省略类型声明，或者使用vanilla JavaScript，值将是__HTML_TAG_156__undefined__HTML_TAG_157__。
  __HTML_TAG_159__
  __HTML_TAG_160__
    __HTML_TAG_161__
      __HTML_TAG_162__data__HTML_TAG_163__
    __HTML_TAG_164__
    __HTML_TAG_165__字符串被传递给装饰器，例如__HTML_TAG_166__@Body('string')__HTML_TAG_167__。如果您留下装饰器括号为空，字符串将是__HTML_TAG_168__undefined__HTML_TAG_169__。
  __HTML_TAG_171__
__HTML_TAG_172__

>warning 警告：TypeScript接口在转译时将消失。因此，如果方法参数的类型被声明为接口，而不是类，__INLINE_CODE_69__值将是__INLINE_CODE_70__。

#### Schema based validation

让我们使我们的验证管道更加有用。查看__INLINE_CODE_71__方法中的__INLINE_CODE_72__，在这里我们可能想要确保 post body 对象有效，以便在运行我们的服务方法之前。

__CODE_BLOCK_8__

让我们关注__INLINE_CODE_73__ body 参数。它的类型是__INLINE_CODE_74__：

__CODE_BLOCK_9__

我们想要确保任何 incoming 请求到 create 方法包含有效的 body。因此，我们需要验证__INLINE_CODE_75__对象的三个成员。我们可以在路由处理方法中执行此操作，但这样做将违反 **single responsibility principle**（SRP）。

另一种方法是创建一个 **validator class**，并将任务委托给该类。这有一个缺点，即我们需要记住在每个方法中调用这个验证器。

或者，我们可以创建 validation middleware？这将工作，但不幸的是，无法创建 **generic middleware**，它可以在整个应用程序中用于所有上下文。因为 middleware 不了解 **execution context**，包括将被调用的处理器和参数。

这正是管道的用途。因此，让我们继续完善我们的验证管道。

__HTML_TAG_173____HTML_TAG_174__

#### Object schema validation

有多种方法可以在clean,__LINK_179__的方式中执行对象验证。一个常见的方法是使用 **schema-based** 验证。让我们尝试使用该方法。

__LINK_180__库允许您以直观的方式创建schema。让我们创建一个验证管道，该管道使用 Zod-based schema。

首先，安装所需的包：

__CODE_BLOCK_10__

在下面的代码示例中，我们创建了一个简单的类，该类将 schema 作为 __INLINE_CODE_76__参数。然后，我们应用 __INLINE_CODE_77__ 方法，该方法将我们的 incoming 参数验证为提供的 schema。

如前所述，验证管道将返回值或抛出异常。

在下一节中，您将看到如何使用 __INLINE_CODE_78__ 装饰器提供适当的 schema，以便在给定的控制器方法中使用我们的验证管道。这样，我们的验证管道将在所有上下文中可重用，就像我们所期望的那样。

__CODE_BLOCK_11__

#### Binding validation pipesEarlier, we saw how to bind transformation pipes (like __INLINE_CODE_79__ and the rest of the __INLINE_CODE_80__ pipes).

Binding validation pipes is also very straightforward.

In this case, we want to bind the pipe at the method call level. In our current example, we need to do the following to use the __INLINE_CODE_81__:

1. Create an instance of the __INLINE_CODE_82__
2. Pass the context-specific Zod schema in the class constructor of the pipe
3. Bind the pipe to the method

Zod schema example:

```typescript title="schema"

```

We do that using the __INLINE_CODE_83__ decorator as shown below:

```typescript title="schema"

```

> info **Hint** The __INLINE_CODE_84__ decorator is imported from the __INLINE_CODE_85__ package.

> warning **Warning** __INLINE_CODE_86__ library requires the __INLINE_CODE_87__ configuration to be enabled in your __INLINE_CODE_88__ file.

#### Class validator

> warning **Warning** The techniques in this section require TypeScript and are not available if your app is written using vanilla JavaScript.

Let's look at an alternate implementation for our validation technique.

Nest works well with the __LINK_181__ library. This powerful library allows you to use decorator-based validation. Decorator-based validation is extremely powerful, especially when combined with Nest's **Pipe** capabilities since we have access to the __INLINE_CODE_89__ of the processed property. Before we start, we need to install the required packages:

```typescript title="package"

```

Once these are installed, we can add a few decorators to the __INLINE_CODE_90__ class. Here we see a significant advantage of this technique: the __INLINE_CODE_91__ class remains the single source of truth for our Post body object (rather than having to create a separate validation class).

```typescript title="class"

```

> info **Hint** Read more about the class-validator decorators __LINK_182__.

Now we can create a __INLINE_CODE_92__ class that uses these annotations.

```typescript title="class"

```

> info **Hint** As a reminder, you don't have to build a generic validation pipe on your own since the __INLINE_CODE_93__ is provided by Nest out-of-the-box. The built-in __INLINE_CODE_94__ offers more options than the sample we built in this chapter, which has been kept basic for the sake of illustrating the mechanics of a custom-built pipe. You can find full details, along with lots of examples __LINK_183__.

> warning **Notice** We used the __LINK_184__ library above which is made by the same author as the **class-validator** library, and as a result, they play very well together.

Let's go through this code. First, note that the __INLINE_CODE_95__ method is marked as __INLINE_CODE_96__. This is possible because Nest supports both synchronous and **asynchronous** pipes. We make this method __INLINE_CODE_97__ because some of the class-validator validations __LINK_185__ (utilize Promises).

Next note that we are using destructuring to extract the metatype field (extracting just this member from an __INLINE_CODE_98__) into our __INLINE_CODE_99__ parameter. This is just shorthand for getting the full __INLINE_CODE_100__ and then having an additional statement to assign the metatype variable.

Next, note the helper function __INLINE_CODE_101__. It's responsible for bypassing the validation step when the current argument being processed is a native JavaScript type (these can't have validation decorators attached, so there's no reason to run them through the validation step).

Next, we use the class-transformer function __INLINE_CODE_102__ to transform our plain JavaScript argument object into a typed object so that we can apply validation. The reason we must do this is that the incoming post body object, when deserialized from the network request, does **not have any type information** (this is the way the underlying platform, such as Express, works). Class-validator needs to use the validation decorators we defined for our DTO earlier, so we need to perform this transformation to treat the incoming body as an appropriately decorated object, not just a plain vanilla object.

Finally, as noted earlier, since this is a **validation pipe** it either returns the value unchanged, or throws an exception.

The last step is to bind the __INLINE_CODE_103__. Pipes can be parameter-scoped, method-scoped, controller-scoped, or global-scoped. Earlier, with our Zod-based validation pipe, we saw an example of binding the pipe at the method level.
In the example below, we'll bind the pipe instance to the route handler __INLINE_CODE_104__ decorator so that our pipe is called to validate the post body.

```typescript title="pipe"

```

Parameter-scoped pipes are useful when the validation logic concerns only one specified parameter.

#### Global scoped pipes

Since the __INLINE_CODE_105__ was created to be as generic as possible, we can realize its full utility by setting it up as a **global-scoped** pipe so that it is applied to every route handler across the entire application.

```typescript title="pipe"

```> warning **注意** 在 __HTML_TAG_175__混合应用__HTML_TAG_176__中，__INLINE_CODE_106__方法不会为网关和微服务设置管道。对于“标准”（非混合）微服务应用，__INLINE_CODE_107__将在全局范围内 mount 管道。

全局管道将在整个应用程序中使用，适用于每个控制器和每个路由处理器。

请注意，在依赖注入方面，来自任何模块外（如上面的示例）注册的全局管道无法注入依赖项，因为绑定已经在任何模块的上下文之外进行了。要解决这个问题，可以在任何模块中直接设置全局管道，使用以下构造：

__CODE_BLOCK_19__

> info **提示** 使用该方法在管道中执行依赖注入时，请注意，无论是哪个模块使用了该构造，管道实际上都是全局的。在哪里应该这样做？选择定义管道（如上面的示例）的模块。同时，__INLINE_CODE_110__不是唯一的自定义提供者注册方式。了解更多 __LINK_186__。

#### 内置 ValidationPipe

作为一个提示，你不需要自己构建通用验证管道，因为 Nest 提供了一个内置的 __INLINE_CODE_111__。内置的 __INLINE_CODE_112__ 提供了更多选项，而我们在本章中构建的示例是为了演示自定义管道的机制。您可以在 __LINK_187__ 中找到完整信息和许多示例。

#### 转换用例

验证不是自定义管道的唯一用例。如本章开头所示，管道也可以 **转换** 输入数据以获取所需的格式。这是可能的，因为 __INLINE_CODE_113__ 函数返回的值完全override 了参数的之前值。

何时有用？考虑一下，有时候从客户端传递的数据需要进行一些变化 - 例如将字符串转换为整数 - 才能被路由处理器正确处理。此外，有些必需的数据字段可能缺失，我们想应用默认值。 **转换管道** 可以通过在客户端请求和请求处理器之间插入处理函数来执行这些功能。

以下是一个简单的 __INLINE_CODE_114__，负责将字符串解析为整数值。 (如上所提到的，Nest 有一个更复杂的 __INLINE_CODE_115__；我们包括这个示例，以便演示自定义转换管道)。

__CODE_BLOCK_20__

然后，我们可以将该管道绑定到选择的参数上，如下所示：

__CODE_BLOCK_21__

另一个有用的转换用例是从数据库中选择 **现有用户** 实体，使用请求中提供的 ID：

__CODE_BLOCK_22__

我们将实现这个管道的实现留给读者，但请注意，像所有其他转换管道一样，它接收输入值（一个 __INLINE_CODE_116__）并返回输出值（一个 __INLINE_CODE_117__ 对象）。这可以使您的代码更加声明式和 __LINK_188__，将 boilerplate 代码从处理器中抽象到公共管道中。

#### 提供默认值

__INLINE_CODE_118__ 管道期望参数的值已经定义。如果收到 __INLINE_CODE_119__ 或 __INLINE_CODE_120__ 值，抛出异常。为了使端点能够处理缺失的查询字符串参数值，我们必须提供一个默认值，以便在 __INLINE_CODE_121__ 管道操作这些值之前注入。 __INLINE_CODE_122__ 服务这个目的。简单地在 __INLINE_CODE_123__ 装饰器中实例化一个 __INLINE_CODE_124__，然后在相关 __INLINE_CODE_125__ 管道之前，如下所示：

__CODE_BLOCK_23__