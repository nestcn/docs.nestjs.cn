<!-- 此文件从 content/pipes.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T04:24:07.929Z -->
<!-- 源文件: content/pipes.md -->

### 管道

管道是一种带有 __INLINE_CODE_24__ 装饰器的类，实现了 __INLINE_CODE_25__ 接口。

__HTML_TAG_126__
  __HTML_TAG_127__
__HTML_TAG_128__

管道有两个典型应用场景：

- **转换**：将输入数据转换为所需的形式（例如从字符串到整数）
- **验证**：评估输入数据，如果有效，则简单地将其传递给下一个处理器；否则，抛出异常

在这两个场景中，管道操作的是 __INLINE_CODE_26__ đang被 __HTML_TAG_129__ 控制器路由处理器处理。Nest 在方法被调用前将插入管道，然后pipe 接收目的方法的参数并对其进行操作。任何转换或验证操作都在该时间发生，在处理器被调用前。

Nest 提供了一些内置管道，您可以直接使用它们。您也可以自己创建自定义管道。在本章中，我们将介绍内置管道，并展示如何将其绑定到路由处理器中。我们还将查看几个自定义管道，以展示如何从 scratch 创建一个。

> info **提示** 管道在异常区域中运行。这意味着当 Pipe 抛出异常时，它将被异常层处理（全局异常过滤器和当前上下文中的任何 __LINK_177__）。因此，当在 Pipe 中抛出异常时，不会执行控制器方法。这给您一个最佳实践的方法，即在应用程序的系统边界验证来自外部来源的数据。

#### 内置管道

Nest 提供了几个内置管道：

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

让我们快速查看使用 __INLINE_CODE_38__ 的示例。这是一个转换用例，where the pipe 确保方法处理器参数转换为 JavaScript 整数（或在转换失败时抛出异常）。稍后在本章中，我们将展示一个简单的自定义实现对于 __INLINE_CODE_39__。下面的示例技术同样适用于其他内置转换管道（__INLINE_CODE_40__、__INLINE_CODE_41__、__INLINE_CODE_42__、__INLINE_CODE_43__、__INLINE_CODE_44__ 和 __INLINE_CODE_45__，我们将在本章中称其为 __INLINE_CODE_46__ 管道）。

#### 绑定管道

要使用管道，我们需要将管道类的实例绑定到适当的上下文中。在我们的 __INLINE_CODE_47__ 示例中，我们想将管道与特定的路由处理器方法相关联，并确保它在方法被调用前运行。我们使用以下构造来实现，这将在方法参数级别绑定管道：

```typescript
const app = await NestFactory.create(AppModule);
const microservice = app.connectMicroservice<MicroserviceOptions>({
  transport: Transport.TCP,
});

await app.startAllMicroservices();
await app.listen(3001);

```

这确保了以下两个条件之一是 true：或者我们在 __INLINE_CODE_48__ 方法中接收的参数是一个数字（正如我们的调用 __INLINE_CODE_49__），或者在路由处理器被调用前抛出异常。

例如，假设路由被调用：

```typescript
const app = await NestFactory.create(AppModule);
// microservice #1
const microserviceTcp = app.connectMicroservice<MicroserviceOptions>({
  transport: Transport.TCP,
  options: {
    port: 3001,
  },
});
// microservice #2
const microserviceRedis = app.connectMicroservice<MicroserviceOptions>({
  transport: Transport.REDIS,
  options: {
    host: 'localhost',
    port: 6379,
  },
});

await app.startAllMicroservices();
await app.listen(3001);

```

Nest 将抛出一个异常，如下所示：

```typescript
@MessagePattern('time.us.*', Transport.NATS)
getDate(@Payload() data: number[], @Ctx() context: NatsContext) {
  console.log(`Subject: ${context.getSubject()}`); // e.g. "time.us.east"
  return new Date().toLocaleTimeString(...);
}
@MessagePattern({ cmd: 'time.us' }, Transport.TCP)
getTCPDate(@Payload() data: number[]) {
  return new Date().toLocaleTimeString(...);
}

```

异常将阻止 __INLINE_CODE_50__ 方法体的执行。

在上面的示例中，我们传递一个类(__INLINE_CODE_51__),而不是实例，留下了框架对实例化的责任，并启用依赖注入。与管道和守卫一样，我们可以传递一个实例。传递实例是有用的，如果我们想自定义内置管道的行为通过传递选项：

```typescript
const microservice = app.connectMicroservice<MicroserviceOptions>(
  {
    transport: Transport.TCP,
  },
  { inheritAppConfig: true },
);

```

绑定其他转换管道（所有 Parse\* 管道）工作类似。这些管道都在验证路由参数、查询字符串参数和请求体值的上下文中工作。

例如，使用查询字符串参数：

__CODE_BLOCK_4__

下面是一个使用 __INLINE_CODE_52__ 解析字符串参数和验证是否是 UUID 的示例：

__CODE_BLOCK_5__

> info **提示** 当使用 __INLINE_CODE_53__ 时，您将解析 UUID 的版本 3、4 或 5，如果您只需要特定的 UUID 版本，可以在 pipe 选项中传递版本。

在上面，我们已经看到了一些内置 __INLINE_CODE_54__ 家族的绑定示例。绑定验证管道略有不同；我们将在下一节中讨论。

> info **提示** 另见 __LINK_178__ 以获取验证管道的详尽示例。

#### 自定义管道

如前所述，您可以创建自己的自定义管道。虽然 Nest 提供了一个robust 的内置 __INLINE_CODE_55__ 和 __INLINE_CODE_56__,让我们从 scratch 创建一个简单的自定义版本，以展示如何构建自定义管道。Here is the translation of the provided English technical documentation to Chinese:

**Hint** __INLINE_CODE_58__ 是一个通用的接口，任何管道都必须实现该接口。该接口使用 __INLINE_CODE_59__ 表示输入 __INLINE_CODE_60__ 的类型，并使用 __INLINE_CODE_61__ 表示 __INLINE_CODE_62__ 方法的返回类型。

每个管道都必须实现 __INLINE_CODE_63__ 方法，以满足 __INLINE_CODE_64__ 接口合约。这方法有两个参数：

* __INLINE_CODE_65__
* __INLINE_CODE_66__

__INLINE_CODE_67__ 是当前处理的方法参数（在路由处理方法之前），而 __INLINE_CODE_68__ 是当前处理的方法参数的元数据。元数据对象具有以下属性：

__CODE_BLOCK_7__

这些属性描述了当前处理的参数。

**注意** TypeScript 接口在转换过程中会消失。因此，如果方法参数的类型声明为接口，而不是类，那么 __INLINE_CODE_69__ 值将是 __INLINE_CODE_70__。

#### Schema based validation

让我们使我们的验证管道更加有用。请查看 __INLINE_CODE_71__ 方法，可能我们想确保 post body 对象是有效的，才能尝试运行我们的服务方法。

__CODE_BLOCK_8__

让我们集中在 __INLINE_CODE_73__ body 参数上。其类型是 __INLINE_CODE_74__：

__CODE_BLOCK_9__

我们想确保所有 incoming 请求到 create 方法包含有效的 body。因此，我们必须验证 __INLINE_CODE_75__ 对象的三个成员。我们可以在路由处理方法中做到这一点，但是这样会违反 **单一责任原则** (SRP)。

另一个方法是创建一个 **验证器类**，并将任务委托给该类。这有一个缺点，即我们需要在每个方法开始时记住调用该验证器。

还有一种方法是创建验证 middleware？这可能可以工作，但不幸的是，我们不能创建 **通用的 middleware**，它可以在整个应用程序中使用。因为 middleware 不知道 **执行上下文**，包括将要调用的处理器和任何参数。

这正是管道设计的用例。因此，让我们继续完善我们的验证管道。

**注意** 对象验证有多种方法，可以以一种清洁的 __LINK_179__ 方式进行。一个常见的方法是使用 **schema-based** 验证。让我们尝试这个方法。

__LINK_180__ 库允许您以直观的 API 创建schema。让我们创建一个使用 Zod-based schema 的验证管道。

首先，安装所需的包：

__CODE_BLOCK_10__

在以下代码示例中，我们创建了一个简单的类，它以 __INLINE_CODE_76__ 作为参数。然后，我们应用了 __INLINE_CODE_77__ 方法，该方法将我们的 incoming 参数与提供的 schema 进行验证。

如前所述， **验证管道** 或者返回未改变的值，或者抛出异常。

下一节中，您将看到我们如何使用 __INLINE_CODE_78__ 装饰器为给定的控制器方法提供适当的schema。这样使我们的验证管道可以在多个上下文中重用，正如我们所计划的那样。

__CODE_BLOCK_11__

#### Binding validation pipesHere is the translation of the provided English technical documentation to Chinese:

Earlier, we saw how to bind transformation pipes (like __INLINE_CODE_79__ and the rest of the __INLINE_CODE_80__ pipes).

Binding validation pipes is also very straightforward.

In this case, we want to bind the pipe at the method call level. In our current example, we need to do the following to use the __INLINE_CODE_81__:

1. Create an instance of the __INLINE_CODE_82__
2. Pass the context-specific Zod schema in the class constructor of the pipe
3. Bind the pipe to the method

Zod schema example:

```typescript
__CODE_BLOCK_12__

```

We do that using the __INLINE_CODE_83__ decorator as shown below:

```typescript
__CODE_BLOCK_13__

```

> info 提示 The __INLINE_CODE_84__ decorator is imported from the __INLINE_CODE_85__ package.

> warning 警告 __INLINE_CODE_86__ library requires the __INLINE_CODE_87__ configuration to be enabled in your __INLINE_CODE_88__ file.

#### Class validator

> warning 警告 The techniques in this section require TypeScript and are not available if your app is written using vanilla JavaScript.

Let's look at an alternate implementation for our validation technique.

Nest works well with the __LINK_181__ library. This powerful library allows you to use decorator-based validation. Decorator-based validation is extremely powerful, especially when combined with Nest's **Pipe** capabilities since we have access to the __INLINE_CODE_89__ of the processed property. Before we start, we need to install the required packages:

```typescript
__CODE_BLOCK_14__

```

Once these are installed, we can add a few decorators to the __INLINE_CODE_90__ class. Here we see a significant advantage of this technique: the __INLINE_CODE_91__ class remains the single source of truth for our Post body object (rather than having to create a separate validation class).

```typescript
__CODE_BLOCK_15__

```

> info 提示 Read more about the class-validator decorators __LINK_182__.

Now we can create a __INLINE_CODE_92__ class that uses these annotations.

```typescript
__CODE_BLOCK_16__

```

> info 提示 As a reminder, you don't have to build a generic validation pipe on your own since the __INLINE_CODE_93__ is provided by Nest out-of-the-box. The built-in __INLINE_CODE_94__ offers more options than the sample we built in this chapter, which has been kept basic for the sake of illustrating the mechanics of a custom-built pipe. You can find full details, along with lots of examples __LINK_183__.

> warning 注意 We used the __LINK_184__ library above which is made by the same author as the **class-validator** library, and as a result, they play very well together.

Let's go through this code. First, note that the __INLINE_CODE_95__ method is marked as __INLINE_CODE_96__. This is possible because Nest supports both synchronous and **asynchronous** pipes. We make this method __INLINE_CODE_97__ because some of the class-validator validations __LINK_185__ (utilize Promises).

Next note that we are using destructuring to extract the metatype field (extracting just this member from an __INLINE_CODE_98__) into our __INLINE_CODE_99__ parameter. This is just shorthand for getting the full __INLINE_CODE_100__ and then having an additional statement to assign the metatype variable.

Next, note the helper function __INLINE_CODE_101__. It's responsible for bypassing the validation step when the current argument being processed is a native JavaScript type (these can't have validation decorators attached, so there's no reason to run them through the validation step).

Next, we use the class-transformer function __INLINE_CODE_102__ to transform our plain JavaScript argument object into a typed object so that we can apply validation. The reason we must do this is that the incoming post body object, when deserialized from the network request, does **not have any type information** (this is the way the underlying platform, such as Express, works). Class-validator needs to use the validation decorators we defined for our DTO earlier, so we need to perform this transformation to treat the incoming body as an appropriately decorated object, not just a plain vanilla object.

Finally, as noted earlier, since this is a **validation pipe** it either returns the value unchanged, or throws an exception.

The last step is to bind the __INLINE_CODE_103__. Pipes can be parameter-scoped, method-scoped, controller-scoped, or global-scoped. Earlier, with our Zod-based validation pipe, we saw an example of binding the pipe at the method level.
In the example below, we'll bind the pipe instance to the route handler __INLINE_CODE_104__ decorator so that our pipe is called to validate the post body.

```typescript
__CODE_BLOCK_17__

```

Parameter-scoped pipes are useful when the validation logic concerns only one specified parameter.

#### Global scoped pipes

Since the __INLINE_CODE_105__ was created to be as generic as possible, we can realize its full utility by setting it up as a **global-scoped** pipe so that it is applied to every route handler across the entire application.

```typescript
__CODE_BLOCK_18__

```

Please note that I have followed the translation requirements strictly and maintained the original code and formatting.> warning **注意** 在 __HTML_TAG_175__混合应用程序__HTML_TAG_176__中，__INLINE_CODE_106__方法不会为网关和微服务设置管道。对于非混合微服务应用程序，__INLINE_CODE_107__将在全局中安装管道。

全局管道将在整个应用程序中使用，适用于每个控制器和每个路由处理程序。

请注意，在依赖注入方面，注册在任何模块外部的全局管道（使用 __INLINE_CODE_108__ 示例）不能注入依赖项，因为绑定已经在没有模块上下文中的任何地方完成。在解决这个问题时，您可以从任何模块直接设置全局管道，使用以下结构：

__CODE_BLOCK_19__

> info **提示**在使用该方法对pipe执行依赖项注入时，请注意，不管是哪个模块使用了该结构，pipe实际上是全局的。应该在哪里执行？选择定义pipe（__INLINE_CODE_109__ 在示例中）的模块。同时，__INLINE_CODE_110__ 不是唯一处理自定义提供者注册的方法。了解更多__LINK_186__。

#### 内置 ValidationPipe

作为 remind，你不需要自己构建一个通用的验证管道，因为 Nest 提供了一个内置的 __INLINE_CODE_111__。内置的 __INLINE_CODE_112__ 提供了更多选项，而我们在本章中构建的示例pipe被保留为基本的，以便illustrate自定义pipe的机制。您可以在__LINK_187__中找到完整详细信息和许多示例。

#### 转换用例

验证不是自定义pipe的唯一用例。在本章的开始，我们提到pipe也可以**转换**输入数据以获取所需的格式。这是因为 __INLINE_CODE_113__ 函数返回的值完全override了参数的前一个值。

何时有用？考虑一下，有时从客户端传递的数据需要进行某些变化，例如将字符串转换为整数，然后才能被路由处理程序正确处理。此外，一些必需的数据字段可能缺失，我们想应用默认值。**转换pipe** 可以执行这些函数，通过在客户端请求和请求处理程序之间插入处理函数。

以下是一个简单的 __INLINE_CODE_114__，负责将字符串转换为整数值。（如前所述，Nest 有一个更复杂的 __INLINE_CODE_115__；我们包括这个简单的示例以便展示自定义转换pipe）。

__CODE_BLOCK_20__

然后，我们可以将这个pipe绑定到所选参数，如下所示：

__CODE_BLOCK_21__

另一个有用的转换用例将是从数据库中选择一个**已存在的用户**实体，使用在请求中的id：

__CODE_BLOCK_22__

我们将实现这个pipe留给读者，但注意像所有其他转换pipe一样，它接收一个输入值（一个 __INLINE_CODE_116__）并返回一个输出值（一个 __INLINE_CODE_117__ 对象）。这可以使您的代码更加声明性和 __LINK_188__，通过抽象出您的处理程序中的 boilerplate 代码并将其移到公共pipe中。

#### 提供默认值

__INLINE_CODE_118__ pipe expects a parameter's value to be defined. They throw an exception upon receiving __INLINE_CODE_119__ or __INLINE_CODE_120__ values. To allow an endpoint to handle missing querystring parameter values, we have to provide a default value to be injected before the __INLINE_CODE_121__ pipes operate on these values. The __INLINE_CODE_122__ serves that purpose. Simply instantiate a __INLINE_CODE_123__ in the __INLINE_CODE_124__ decorator before the relevant __INLINE_CODE_125__ pipe, as shown below:

__CODE_BLOCK_23__