<!-- 此文件从 content/pipes.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:27:12.106Z -->
<!-- 源文件: content/pipes.md -->

### 管道

管道是一种带有 __INLINE_CODE_N__ 装饰器的类，实现了 __INLINE_CODE_M__ 接口。

__HTML_TAG_126__
  __HTML_TAG_127__
__HTML_TAG_128__

管道有两个典型应用场景：

- **转换**：将输入数据转换为所需的形式（例如，从字符串到整数）
- **验证**：评估输入数据，如果有效，则简单地将其传递；否则，抛出异常

在这两个场景中，管道操作正在被 __HTML_TAG_129__ 控制器路由处理程序处理的 __INLINE_CODE_26__。Nest 在方法调用前插入管道，然后将接收到的参数传递给管道，管道对它们进行操作。任何转换或验证操作都在这个时候发生，接着路由处理程序将被调用，以任何可能已经转换的参数。

Nest 提供了一些内置管道，您可以无需修改即可使用。您也可以自行构建自定义管道。在本章中，我们将介绍内置管道，并展示如何将它们绑定到路由处理程序中。然后，我们将 examine  several custom-built pipes to show how you can build one from scratch.

> info **提示** 管道在异常区域中运行。这意味着当 Pipe 抛出异常时，它将被异常层处理（全局异常 filter 和当前上下文中的任何 __LINK_177__）。因此，应该清楚的是，当 Pipe 抛出异常时，控制器方法将不会被执行。这为您提供了一种最佳实践，可以在应用程序边界验证来自外部来源的数据。

#### 内置管道

Nest 来自 __INLINE_CODE_37__ 包含以下内置管道：

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

它们是从 __INLINE_CODE_37__ 包中导出的。

让我们快速查看 __INLINE_CODE_38__。这是一种 **转换** 应用场景，管道确保方法处理程序参数被转换为 JavaScript 整数（或在转换失败时抛出异常）。在本章后面，我们将展示一个简单的自定义实现 __INLINE_CODE_39__。以下示例技术也适用于其他内置转换管道（__INLINE_CODE_40__、__INLINE_CODE_41__、__INLINE_CODE_42__、__INLINE_CODE_43__、__INLINE_CODE_44__ 和 __INLINE_CODE_45__，在本章中，我们将将其称为 __INLINE_CODE_46__ 管道）。

#### 绑定管道

要使用管道，我们需要将管道类的实例绑定到适当的上下文中。在我们的 __INLINE_CODE_47__ 示例中，我们想要将管道与特定的路由处理程序方法关联，并确保在方法调用前运行它。我们使用以下构造来实现这点：

```typescript
const app = await NestFactory.create(AppModule);
const microservice = app.connectMicroservice<MicroserviceOptions>({
  transport: Transport.TCP,
});

await app.startAllMicroservices();
await app.listen(3001);

```

这确保了下面两个条件之一是真的：要么我们在 __INLINE_CODE_48__ 方法中接收到的参数是一个数字（正如我们的调用 __INLINE_CODE_49__），要么在路由处理程序被调用前抛出异常。

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

Nest 将抛出异常如下：

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

异常将防止 __INLINE_CODE_50__ 方法体的执行。

在上面的示例中，我们传递一个类 __INLINE_CODE_51__，而不是实例，留下责任给框架并启用依赖注入。与管道和守卫一样，我们可以传递实例。传递实例是有用的，如果我们想自定义内置管道的行为通过传递选项：

```typescript
const microservice = app.connectMicroservice<MicroserviceOptions>(
  {
    transport: Transport.TCP,
  },
  { inheritAppConfig: true },
);

```

绑定其他转换管道（所有 **Parse\*** 管道）工作类似。这些管道都在验证路由参数、查询字符串参数和请求体值的上下文中工作。

例如，对于查询字符串参数：

__CODE_BLOCK_4__

下面是一个使用 __INLINE_CODE_52__ 将字符串参数解析为 UUID 的示例：

__CODE_BLOCK_5__

> info **提示** 使用 __INLINE_CODE_53__ 时，您正在解析 UUID 的版本 3、4 或 5，如果您只需要特定的 UUID 版本，可以在 pipe 选项中传递版本。

在上面，我们已经看到了一些绑定内置 __INLINE_CODE_54__ 家族的示例。绑定验证管道有一点不同；我们将在下一节中讨论。

> info **提示** 请查看 __LINK_178__ 来了解验证管道的更多示例。

#### 自定义管道

正如所述，您可以构建自己的自定义管道。虽然 Nest 提供了 robust 的内置 __INLINE_CODE_55__ 和 __INLINE_CODE_56__，让我们从头开始构建简单的自定义版本，以了解自定义管道的构建方式。Here is the translation of the English technical documentation to Chinese:

**简单地__INLINE_CODE_57__**

__CODE_BLOCK_6__

>info 提示 __INLINE_CODE_58__ 是一个通用的接口，任何管道都必须实现它。该通用接口使用 __INLINE_CODE_59__ 表示输入 __INLINE_CODE_60__ 的类型，并使用 __INLINE_CODE_61__ 表示 __INLINE_CODE_62__ 方法的返回类型。

任何管道都必须实现 __INLINE_CODE_63__ 方法，以满足 __INLINE_CODE_64__ 接口契约。该方法有两个参数：

- __INLINE_CODE_65__
- __INLINE_CODE_66__

__INLINE_CODE_67__ 参数是当前处理的方法参数（在路由处理方法之前），而 __INLINE_CODE_68__ 是当前处理的方法参数的元数据。元数据对象具有以下属性：

__CODE_BLOCK_7__

这些属性描述当前处理的参数。

__HTML_TAG_131__
  __HTML_TAG_132__
    __HTML_TAG_133__
      __HTML_TAG_134__type__HTML_TAG_135__
    __HTML_TAG_136__
    __HTML_TAG_137__表示参数是否是请求体
      __HTML_TAG_138__@Body()__HTML_TAG_139__, 查询
      __HTML_TAG_140__@Query()__HTML_TAG_141__, 参数
      __HTML_TAG_142__@Param()__HTML_TAG_143__, 或自定义参数（了解更多__HTML_TAG_144__here__HTML_TAG_145__）).__HTML_TAG_146__
  __HTML_TAG_147__
  __HTML_TAG_148__
    __HTML_TAG_149__
      __HTML_TAG_150__metatype__HTML_TAG_151__
    __HTML_TAG_152__
    __HTML_TAG_153__
      提供参数的元类型，例如，__HTML_TAG_154__String__HTML_TAG_155__。注意：如果您在路由处理方法签名中省略了类型声明或使用了纯 JavaScript，则值将为__HTML_TAG_156__undefined__HTML_TAG_157__。
  __HTML_TAG_158__
  __HTML_TAG_159__
  __HTML_TAG_160__
    __HTML_TAG_161__
      __HTML_TAG_162__data__HTML_TAG_163__
    __HTML_TAG_164__
    __HTML_TAG_165__字符串被传递到装饰器中，例如，__HTML_TAG_166__@Body('string')__HTML_TAG_167__。如果您留下装饰器括号为空，则值将为__HTML_TAG_168__undefined__HTML_TAG_169__。
  __HTML_TAG_170__
__HTML_TAG_172__

>警告 **Warning** TypeScript 接口在编译过程中消失。因此，如果方法参数的类型被声明为接口，而不是类，则 __INLINE_CODE_69__ 值将为 __INLINE_CODE_70__。

####基于架构的验证

让我们使我们的验证管道更加有用。查看 __INLINE_CODE_71__ 方法中的 __INLINE_CODE_72__，我们可能希望确保POST请求体对象有效 przed 我们的服务方法尝试运行。

__CODE_BLOCK_8__

让我们集中注意力在 __INLINE_CODE_73__ 请求体参数上。其类型是 __INLINE_CODE_74__：

__CODE_BLOCK_9__

我们想要确保任何 incoming 请求到 create 方法包含有效的请求体。因此，我们需要验证 __INLINE_CODE_75__ 对象的三个成员。我们可以在路由处理方法中执行此操作，但这将违反 **单一责任原则** (SRP)。

另一种方法是创建 **验证器类** 并将任务委托给该类。然而，这将需要我们记住在每个方法中调用验证器。

可能的解决方案是创建验证 middleware？然而，这不可能创建 **通用 middleware**，该 middleware 可以在整个应用程序中使用。原因是 middleware 不了解 **执行上下文**，包括将要调用的处理器和任何参数。

这正是管道设计的用例。因此，让我们继续完善我们的验证管道。

__HTML_TAG_173____HTML_TAG_174__

####对象架构验证

有多种方法可以在__LINK_179__的方式中进行对象验证。一个常见的方法是使用 **架构基于** 的验证。让我们尝试使用该方法。

__LINK_180__ 库允许您以直观的方式创建架构，具有可读的 API。让我们创建一个使用 Zod-based 架构的验证管道。

首先，安装所需的包：

__CODE_BLOCK_10__

在以下代码示例中，我们创建了一个简单的类，该类将一个架构作为 __INLINE_CODE_76__ 参数。然后，我们应用 __INLINE_CODE_77__ 方法，验证我们的 incoming 参数对该架构。

如前所述，验证管道将返回未修改的值或抛出异常。

在下一部分中，您将看到我们如何使用 __INLINE_CODE_78__ 装饰器为给定的控制器方法提供适当的架构。这样，我们的验证管道将在上下文中可重用，就像我们所设定的那样。

__CODE_BLOCK_11__

####将验证管道绑定

Note: Please keep in mind that I haveHere is the translation of the English technical documentation to Chinese:

早期，我们已经看到如何绑定转换管道（如__INLINE_CODE_79__和其他__INLINE_CODE_80__管道）。

绑定验证管道也非常直接。

在这种情况下，我们需要在方法调用级别绑定管道。在我们的当前示例中，我们需要执行以下步骤以使用__INLINE_CODE_81__：

1. 创建__INLINE_CODE_82__的实例
2. 将上下文相关的Zod schema传递给管道的类构造函数
3. 将管道绑定到方法

Zod schema 示例：

__CODE_BLOCK_12__

我们使用__INLINE_CODE_83__装饰器来实现，如下所示：

__CODE_BLOCK_13__

> 提示 **提示** __INLINE_CODE_84__装饰器来自__INLINE_CODE_85__包。

> 警告 **警告** __INLINE_CODE_86__库需要在__INLINE_CODE_88__文件中启用__INLINE_CODE_87__配置。

#### 类验证器

> 警告 **警告** 本节中的技术要求 TypeScript，且不能在使用 vanilla JavaScript 的应用程序中使用。

让我们来看一个备用的实现我们的验证技术。

Nest 与__LINK_181__库非常好。这个强大的库允许您使用装饰器进行验证。装饰器验证非常强大，尤其是在与 Nest 的**Pipe**结合使用时，因为我们可以访问已处理的属性__INLINE_CODE_89__。在我们开始之前，我们需要安装所需的包：

__CODE_BLOCK_14__

一旦安装完成，我们可以将几个装饰器添加到__INLINE_CODE_90__类中。在这里，我们看到这个技术的明显优势：__INLINE_CODE_91__类保持了我们的 Post body 对象的唯一来源（而不是创建一个单独的验证类）。

__CODE_BLOCK_15__

> 提示 **提示** 了解更多关于__LINK_182__中的类验证器装饰器。

现在，我们可以创建一个__INLINE_CODE_92__类，该类使用这些注释。

__CODE_BLOCK_16__

> 提示 **提示** 作为提示，您不需要创建通用的验证管道，因为 Nest 提供了一个名为__INLINE_CODE_94__的内置验证管道，该管道提供了更多选项。您可以在__LINK_183__中找到完整详细信息。

> 警告 **注意** 我们在上面使用了__LINK_184__库，该库由__INLINE_CODE_96__库的作者创造，它们之间有很好的一致性。

让我们来查看这个代码。首先，注意__INLINE_CODE_95__方法被标记为__INLINE_CODE_96__。这是因为 Nest 支持同步和异步管道。我们将这个方法标记为__INLINE_CODE_97__，因为一些 class-validator 验证__LINK_185__（使用 Promises）。

下一个注意的是，我们使用解构语法来提取 metatype 字段（从__INLINE_CODE_98__中提取只包含该成员的对象）并将其赋值给__INLINE_CODE_99__参数。这只是简写形式，获取完整的__INLINE_CODE_100__并在另一个语句中将 metatype 变量赋值。

下一个注意的是，helper 函数__INLINE_CODE_101__。它负责在当前被处理的参数是一个原生 JavaScript 类型（这些类型无法附加验证装饰器，因此没有理由运行它们）时跳过验证步骤。

最后，我们使用 class-transformer 函数__INLINE_CODE_102__将我们的原生 JavaScript 对象转换为类型化对象，以便应用验证。我们需要这样做是因为 incoming post body 对象，在从网络请求中反序列化时，**没有类型信息**（这是底层平台，如 Express，工作的方式）。Class-validator 需要使用我们之前定义的 DTO 验证装饰符，所以我们需要执行这个转换，以将 incoming body 对象视为一个适当装饰的对象，而不是一个普通对象。

最后一步是绑定__INLINE_CODE_103__。管道可以是参数作用域、方法作用域、控制器作用域或全局作用域。之前，我们使用 Zod 基础验证管道看到了一种绑定管道的示例，在方法级别绑定管道。

在下面的示例中，我们将绑定(pipe 实例)到路由处理程序__INLINE_CODE_104__装饰器，以便我们的 pipe 被调用以验证 post body。

__CODE_BLOCK_17__

参数作用域的管道非常有用，因为验证逻辑仅关心一个指定的参数。

#### 全局作用域的管道

由于__INLINE_CODE_105__旨在尽可能通用，所以我们可以使其达到其全面的利用方式是将其设置为**全局作用域**的管道，以便它应用于整个应用程序中的每个路由处理程序。

__CODE_BLOCK_18__> warning **注意** 在 __HTML_TAG_175__混合应用程序__HTML_TAG_176__中，__INLINE_CODE_106__方法不会为网关和微服务设置管道。对于非混合（标准）微服务应用程序，__INLINE_CODE_107__将将管道全局安装。

全局管道将在整个应用程序中使用，适用于每个控制器和每个路由处理程序。

请注意，在依赖注入方面，注册的全局管道（如上面的示例）不能注入依赖项，因为在任何模块的上下文中没有绑定依赖项。要解决这个问题，可以在任何模块中直接设置全局管道，使用以下构造：

__CODE_BLOCK_19__

> info **提示** 使用这种方法来执行依赖项注入时，请注意，不管是在哪个模块中使用这个构造，该管道实际上都是全局的。应该在哪个模块中执行？选择定义该管道的模块（在上面的示例中为__INLINE_CODE_109__）。此外，__INLINE_CODE_110__并不是唯一的自定义提供者注册方法。了解更多 __LINK_186__。

#### 内置ValidationPipe

作为提醒，您不需要自己构建一个通用的验证管道，因为Nest提供了一个内置的__INLINE_CODE_111__。内置的__INLINE_CODE_112__提供了更多选项 than the sample we built in this chapter, which has been kept basic for the sake of illustrating the mechanics of a custom-built pipe. 您可以在 __LINK_187__中找到详细信息和许多示例。

#### 变换用例

验证不是自定义管道的唯一用例。正如本章开头所提到的，管道也可以 **转换** 输入数据以获取所需的格式。这是因为__INLINE_CODE_113__函数返回的值完全覆盖了之前的参数值。

何时有用？考虑一下，有时从客户端传递的数据需要进行一些变化—for example，将字符串转换为整数—才能被路由处理程序正确处理。此外，一些必需的数据字段可能缺失，我们想应用默认值。 **转换管道** 可以执行这些函数，以在客户端请求和请求处理程序之间插入处理函数。

以下是一个简单的 __INLINE_CODE_114__，负责将字符串转换为整数值。（如前所述，Nest有一个更加复杂的__INLINE_CODE_115__；我们包括这作为一个简单的自定义转换管道示例）。

__CODE_BLOCK_20__

然后，我们可以将这个管道绑定到选择的参数，如下所示：

__CODE_BLOCK_21__

另一个有用的转换案例将是从数据库中选择一个 **现有用户** 实体使用在请求中的id：

__CODE_BLOCK_22__

我们留下了对这个pipe的实现，但注意像所有其他转换管道一样，它接收一个输入值（一个 __INLINE_CODE_116__）并返回一个输出值（一个 __INLINE_CODE_117__ 对象）。这可以使您的代码更加声明式和 __LINK_188__，通过将 boilerplate 代码抽象出来，移到一个常见的pipe中。

#### 提供默认值

__INLINE_CODE_118__ 管道期望参数的值被定义。它们在收到 __INLINE_CODE_119__ 或 __INLINE_CODE_120__ 值时抛出异常。要允许端点处理缺少的查询字符串参数值，我们需要在 __INLINE_CODE_121__ 管道之前提供默认值。__INLINE_CODE_122__ 供该目的。简单地在 __INLINE_CODE_123__ 装饰器中实例化一个 __INLINE_CODE_124__，如以下所示：

__CODE_BLOCK_23__