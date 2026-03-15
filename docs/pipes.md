<!-- 此文件从 content/pipes.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T04:46:13.905Z -->
<!-- 源文件: content/pipes.md -->

### 管道

管道是一种使用 __INLINE_CODE_24__ 装饰器注释的类，实现了 __INLINE_CODE_25__ 接口。

__HTML_TAG_126__
  __HTML_TAG_127__
__HTML_TAG_128__

管道有两个常见的使用场景：

- **转换**：将输入数据转换为所需的形式（例如，从字符串到整数）
- **验证**：评估输入数据，如果有效，则简单地将其通过未经修改；否则，抛出异常

在这两个场景中，管道操作的是 __INLINE_CODE_26__正在由 __HTML_TAG_129__ 控制器路由处理器处理的数据。Nest 在方法被调用之前对管道进行插入，并将要传递给方法的参数传递给管道。管道可以在这个时候对参数进行转换或验证，操作完成后，路由处理器将被调用，以传递可能已经转换的参数。

Nest 附带了一些内置管道，您可以立即使用它们。您也可以构建自己的自定义管道。在本章中，我们将介绍内置管道，并展示如何将其绑定到路由处理器中。然后，我们将查看一些自定义.PIPE示例，以展示如何从头开始构建一个。

> info **Hint** 管道在 exceptions zone 中运行。这意味着当 Pipe 抛出异常时，它将被 exceptions 层 (全局异常过滤器和当前上下文中应用的所有过滤器) 处理。考虑到上述情况，当 Pipe 抛出异常时，不会执行任何控制器方法。这给您提供了一种最佳实践的方法来验证来自外部源的数据在系统边界上。

#### 内置管道

Nest 附带了一些内置管道：

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

让我们快速查看一下使用 __INLINE_CODE_38__。这是一个转换用例， Pipe 确保方法处理程序参数被转换为 JavaScript 整数（或在转换失败时抛出异常）。在本章后面，我们将展示一个简单的自定义实现 __INLINE_CODE_39__。下面的示例技术也适用于其他内置转换管道（__INLINE_CODE_40__、__INLINE_CODE_41__、__INLINE_CODE_42__、__INLINE_CODE_43__、__INLINE_CODE_44__ 和 __INLINE_CODE_45__，我们在本章中将其称为 __INLINE_CODE_46__ 管道）。

#### 绑定管道

要使用管道，我们需要将管道类的实例绑定到适当的上下文中。在我们的 __INLINE_CODE_47__ 示例中，我们想要将管道与特定路由处理器方法关联，并确保在方法被调用之前对其进行插入。我们使用以下构造来实现这一点，这将被称为在方法参数级别绑定管道：

```typescript
const app = await NestFactory.create(AppModule);
const microservice = app.connectMicroservice<MicroserviceOptions>({
  transport: Transport.TCP,
});

await app.startAllMicroservices();
await app.listen(3001);

```

这确保了以下两种情况之一：要么我们接收到的参数是数字（正如我们对 __INLINE_CODE_49__ 的调用），要么在路由处理器被调用之前抛出异常。

例如，假设路由被调用如下：

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

Nest 将抛出以下异常：

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

在上面的示例中，我们传递的是一个类 (__INLINE_CODE_51__),而不是实例，留下了对框架实例化的责任，并启用了依赖注入。与 Pipe 和-guard 一样，我们可以将实例直接传递。将实例传递是有用的，因为我们可以在将 Pipe 的行为自定义时传递选项：

```typescript
const microservice = app.connectMicroservice<MicroserviceOptions>(
  {
    transport: Transport.TCP,
  },
  { inheritAppConfig: true },
);

```

绑定其他转换管道（所有 **Parse** 管道）工作方式相同。这些管道都在验证路由参数、查询字符串参数和请求体值的上下文中工作。

例如，在查询字符串参数中：

__CODE_BLOCK_4__

以下是一个使用 __INLINE_CODE_52__ 将字符串参数解析为 UUID 的示例：

__CODE_BLOCK_5__

> info **Hint** 使用 __INLINE_CODE_53__ 时，您正在解析版本 3、4 或 5 的 UUID，如果您只需要特定的 UUID 版本，可以在 Pipe 选项中传递版本。

在上面，我们已经看到了一些绑定内置 __INLINE_CODE_54__ 家族的示例。绑定验证管道的方式不同，我们将在下一节中讨论。

> info **Hint** 另见 __LINK_178__ 以获取验证管道的详细示例。Here is the translation of the provided English technical documentation to Chinese:

**Hint** __INLINE_CODE_58__ 是一个泛型接口，任何管道都必须实现它。该泛型接口使用 __INLINE_CODE_59__ 指定输入 __INLINE_CODE_60__ 的类型，并使用 __INLINE_CODE_61__ 指定 __INLINE_CODE_62__ 方法的返回类型。

每个管道都必须实现 __INLINE_CODE_63__ 方法，以满足 __INLINE_CODE_64__ 接口合约。这方法有两个参数：

* __INLINE_CODE_65__
* __INLINE_CODE_66__

__INLINE_CODE_67__ 参数是当前处理的方法参数（在路由处理方法之前），而 __INLINE_CODE_68__ 是当前处理的方法参数的元数据。元数据对象具有以下属性：

__CODE_BLOCK_7__

这些属性描述了当前处理的参数。

**中间件** __HTML_TAG_131__
  **中间件** __HTML_TAG_132__
    **中间件** __HTML_TAG_133__
      **type** __HTML_TAG_134__ __HTML_TAG_135__
    **中间件** __HTML_TAG_136__
    **中间件** __HTML_TAG_137__ 表示参数是否为 body
      **@Body()** __HTML_TAG_138__, query
      **@Query()** __HTML_TAG_140__, param
      **@Param()** __HTML_TAG_142__, 或自定义参数（了解更多
      **here** __HTML_TAG_144__）__.__HTML_TAG_146__
  **中间件** __HTML_TAG_147__
  **中间件** __HTML_TAG_148__
    **中间件** __HTML_TAG_149__
      **metatype** __HTML_TAG_150__ __HTML_TAG_151__
    **中间件** __HTML_TAG_152__
    **中间件** __HTML_TAG_153__
      提供参数的元类型，例如，
      **String** __HTML_TAG_154__. 请注意，值为 undefined，如果你省略了类型声明在路由处理方法签名中，或者使用纯 JavaScript。
    **中间件** __HTML_TAG_158__
  **中间件** __HTML_TAG_159__
  **中间件** __HTML_TAG_160__
    **中间件** __HTML_TAG_161__
      **data** __HTML_TAG_162__ __HTML_TAG_163__
    **中间件** __HTML_TAG_164__
    **中间件** __HTML_TAG_165__ 字符串传递给装饰器，例如
      **@Body('string')** __HTML_TAG_166__. 如果你留下装饰器括号为空，它将为 undefined。
    **中间件** __HTML_TAG_170__
__HTML_TAG_172__

**警告** TypeScript 接口在编译时会消失。因此，如果方法参数的类型声明为接口，而不是类，那么 __INLINE_CODE_69__ 值将为 __INLINE_CODE_70__。

####基于模式的验证

让我们使我们的验证管道更加有用。请注意 __INLINE_CODE_71__ 方法中的 __INLINE_CODE_72__，在那里我们可能想确保 POST 请求体对象是有效的，之前尝试运行我们的服务方法。

__CODE_BLOCK_8__

让我们关注 __INLINE_CODE_73__ body 参数。它的类型是 __INLINE_CODE_74__：

__CODE_BLOCK_9__

我们想确保任何 incoming 请求到 create 方法包含有效的 body。因此，我们需要验证 __INLINE_CODE_75__ 对象的三个成员。我们可以在路由处理方法中实现这一点，但这样做将违反 **单一责任原则** (SRP)。

另一个方法是创建一个 **验证类** 并将任务委托给该类。这有缺点，即我们需要记住在每个方法开始时调用验证器。

如何创建验证中间件？这将工作，但不幸的是，我们无法创建 **通用中间件**，该中间件可以在整个应用程序中使用。原因是中间件不知道 **执行上下文**，包括将被调用的处理程序和任何参数。

这正是管道设计的用途。因此，让我们继续完善我们的验证管道。

**验证管道** __HTML_TAG_173____HTML_TAG_174__

#### 对象模式验证

有多种方法可以在一种 __LINK_179__ 的方式中执行对象验证。一个常见的方法是使用 **模式** 验证。让我们尝试该方法。

__LINK_180__ 库允许您以直观的 API 创建模式。在下面的代码示例中，我们创建了一个简单的类，它将schema作为 __INLINE_CODE_76__ 参数。然后，我们应用 __INLINE_CODE_77__ 方法，该方法将我们的输入参数验证为提供的模式。

正如前面所提到的，验证管道将返回值或抛出异常。

在下一节中，您将看到我们如何使用 __INLINE_CODE_78__ 装饰器为给定的控制器方法提供适当的模式。这样，使我们的验证管道在不同的上下文中可重用，就像我们预期的那样。

__CODE_BLOCK_11__

#### 将验证管道绑定

Please note that I have followed the provided glossHere is the translation of the provided English technical documentation to Chinese:

 earlier, we saw how to bind transformation pipes (like __INLINE_CODE_79__ and the rest of the __INLINE_CODE_80__ pipes).

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

>  **Hint** The __INLINE_CODE_84__ decorator is imported from the __INLINE_CODE_85__ package.

>  **Warning** __INLINE_CODE_86__ library requires the __INLINE_CODE_87__ configuration to be enabled in your __INLINE_CODE_88__ file.

#### Class validator

>  **Warning** The techniques in this section require TypeScript and are not available if your app is written using vanilla JavaScript.

Let's look at an alternate implementation for our validation technique.

Nest works well with the __LINK_181__ library. This powerful library allows you to use decorator-based validation. Decorator-based validation is extremely powerful, especially when combined with Nest's **Pipe** capabilities since we have access to the __INLINE_CODE_89__ of the processed property. Before we start, we need to install the required packages:

```typescript
__CODE_BLOCK_14__

```

Once these are installed, we can add a few decorators to the __INLINE_CODE_90__ class. Here we see a significant advantage of this technique: the __INLINE_CODE_91__ class remains the single source of truth for our Post body object (rather than having to create a separate validation class).

```typescript
__CODE_BLOCK_15__

```

>  **Hint** Read more about the class-validator decorators __LINK_182__.

Now we can create a __INLINE_CODE_92__ class that uses these annotations.

```typescript
__CODE_BLOCK_16__

```

>  **Hint** As a reminder, you don't have to build a generic validation pipe on your own since the __INLINE_CODE_93__ is provided by Nest out-of-the-box. The built-in __INLINE_CODE_94__ offers more options than the sample we built in this chapter, which has been kept basic for the sake of illustrating the mechanics of a custom-built pipe. You can find full details, along with lots of examples __LINK_183__.

>  **Notice** We used the __LINK_184__ library above which is made by the same author as the **class-validator** library, and as a result, they play very well together.

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

```> warning **注意** 在 __HTML_TAG_175__混合应用__HTML_TAG_176__ 中,__INLINE_CODE_106__ 方法不会为网关和微服务设置管道。对于非混合微服务应用,__INLINE_CODE_107__ 会全局 mount 管道。

全局管道在整个应用程序中使用，适用于每个控制器和每个路由处理程序。

请注意，在依赖注入方面，外部注册的全局管道（如上面的示例）无法注入依赖项，因为绑定已经在没有模块上下文的情况下完成。在解决这个问题时，可以从任何模块中设置全局管道，使用以下结构：

__CODE_BLOCK_19__

> info **提示** 使用该方法进行依赖注入时，请注意，管道无论在哪个模块中使用，都将是全局的。应该在哪里做这个？选择定义管道的模块（如上面的示例）。此外，__INLINE_CODE_110__ 是解决自定义提供者注册的另一种方法。了解更多 __LINK_186__。

#### 内置 ValidationPipe

作为提醒，你不需要自己构建通用的验证管道，因为 Nest 提供了 __INLINE_CODE_111__。内置的 __INLINE_CODE_112__ 提供了更多选项，而我们在本章中构建的示例只是为了演示自定义管道的基本概念。您可以在 __LINK_187__ 中找到完整的详细信息和示例。

#### 变换用例

验证不是自定义管道的唯一用例。我们在本章开头提到，管道也可以对输入数据进行变换。这是可能的，因为 __INLINE_CODE_113__ 函数返回的值完全覆盖了参数的初始值。

何时有用？考虑到客户端传递的数据需要某些变化——例如将字符串转换为整数——以便路由处理程序可以正确处理。同时，某些必需的数据字段可能缺失，我们想应用默认值。**变换管道** 可以执行这些函数，通过在客户端请求和请求处理程序之间插入处理函数。

下面是一个将字符串转换为整数值的简单 __INLINE_CODE_114__ (注意，Nest 有一个更复杂的 __INLINE_CODE_115__，我们包括这个示例以演示自定义变换管道)：

__CODE_BLOCK_20__

然后，我们可以将这个管道绑定到选定的参数，如下所示：

__CODE_BLOCK_21__

另一个有用的变换情况将是从数据库中选择一个 **已存在的用户** 实体，使用在请求中提供的 id：

__CODE_BLOCK_22__

我们将实现这个管道的实现留给读者，但注意像所有其他变换管道一样，它接收输入值（一个 __INLINE_CODE_116__）并返回输出值（一个 __INLINE_CODE_117__ 对象）。这可以使您的代码更加声明式和 __LINK_188__，通过抽象出路由处理程序中的-boilerplate代码并将其移至公共管道中。

#### 提供默认值

__INLINE_CODE_118__ 管道期望参数的值被定义。如果接收 __INLINE_CODE_119__ 或 __INLINE_CODE_120__ 值，它们将抛出异常。要允许端点处理缺失的查询字符串参数值，我们需要提供一个默认值，以便在 __INLINE_CODE_121__ 管道操作这些值之前注入。__INLINE_CODE_122__ 服务这个目的。简单地在 __INLINE_CODE_124__ 装饰器中 instantiate 一个 __INLINE_CODE_123__，如以下所示：

__CODE_BLOCK_23__