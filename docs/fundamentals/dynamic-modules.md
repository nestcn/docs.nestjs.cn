<!-- 此文件从 content/fundamentals/dynamic-modules.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:17:56.908Z -->
<!-- 源文件: content/fundamentals/dynamic-modules.md -->

### 动态模块

__LINK_216__ 对 Nest 模块的基础知识进行了概述，包括了对 __LINK_217__ 的简要介绍。这篇章将扩展动态模块的主题。完成后，您应该对其了解和使用。

#### 简介

大多数应用程序代码示例在 **Overview** 部分的文档中都使用了常规或静态的模块。模块定义了组件，如 __LINK_218__ 和 __LINK_219__，这些组件作为一个整体的应用程序的一部分。它们提供了执行上下文或作用域。例如，在模块中定义的提供者对模块中的其他成员可见，而不需要导出它们。要使提供者在模块外部可见，需要首先从其宿主模块中导出，然后在其消费模块中导入。

让我们从熟悉的示例中开始。

首先，我们将定义一个 __INLINE_CODE_28__，提供和导出一个 __INLINE_CODE_29__。__INLINE_CODE_30__ 是 __INLINE_CODE_31__ 的宿主模块。

```bash
$ npm i csrf-csrf

```

然后，我们将定义一个 __INLINE_CODE_32__，该模块将 __INLINE_CODE_33__ 导入，使 __INLINE_CODE_34__ 的导出提供者在 __INLINE_CODE_35__ 中可见：

```typescript
import { doubleCsrf } from 'csrf-csrf';
// ...
// somewhere in your initialization file
const {
  invalidCsrfTokenError, // This is provided purely for convenience if you plan on creating your own middleware.
  generateToken, // Use this in your routes to generate and provide a CSRF hash, along with a token cookie and token.
  validateRequest, // Also a convenience if you plan on making your own middleware.
  doubleCsrfProtection, // This is the default CSRF protection middleware.
} = doubleCsrf(doubleCsrfOptions);
app.use(doubleCsrfProtection);

```

这些构造允许我们在 __INLINE_CODE_37__ 中注入 __INLINE_CODE_36__，例如，__INLINE_CODE_38__：

```bash
$ npm i --save @fastify/csrf-protection

```

我们将称之为 **静态** 模块绑定。Nest 需要的所有信息都已经在宿主模块和消费模块中声明。让我们解释这个过程。Nest 在 __INLINE_CODE_40__ 中使 __INLINE_CODE_39__ 可见：

1. 实例化 __INLINE_CODE_41__，包括将其他模块 __INLINE_CODE_42__ 载入，解决依赖项 (参见 __LINK_220__ )。
2. 实例化 __INLINE_CODE_43__，并将 __INLINE_CODE_44__ 的导出提供者在 __INLINE_CODE_45__ 中可见（就像在 __INLINE_CODE_46__ 中声明一样）。
3. 在 __INLINE_CODE_48__ 中注入 __INLINE_CODE_47__ 的实例。

#### 动态模块用例

使用静态模块绑定，消费模块无法影响宿主模块的提供者配置。为什么这很重要？考虑一个需要在不同情况下行为不同的通用模块。这类似于许多系统中的“插件”概念，其中一个通用设施需要在消费者中进行配置以使用。

Nest 的一个好的示例是配置模块。许多应用程序发现将配置详细信息外部化非常有用，可以使用配置模块。这样可以轻松地在不同的部署中更改应用程序设置，例如，开发数据库、 staging 数据库等。通过将配置参数委托给配置模块，应用程序代码保持独立。

挑战是配置模块本身，因为它是通用的（类似于“插件”），需要在消费模块中被自定义。这是 _动态模块_ 的地方。使用动态模块功能，我们可以使我们的配置模块 **动态**，这样消费模块可以使用 API 在模块被导入时控制模块的自定义。

换言之，动态模块提供了导入一个模块到另一个模块的 API，并且在模块被导入时可以自定义模块的属性和行为，而不是使用静态绑定。

__HTML_TAG_214____HTML_TAG_215__

#### 配置模块示例

我们将使用 __LINK_221__ 的基本版本来实现这部分。章节结束时的完整版本可以作为一个工作 __LINK_222__。

我们的要求是使 __INLINE_CODE_49__ 接受一个 __INLINE_CODE_50__ 对象以自定义它。以下是我们想要支持的功能。基本示例硬编码了 __INLINE_CODE_51__ 文件的位置在项目根目录中。让我们假设我们想要使这个配置可变，以便在不同的项目中管理 __INLINE_CODE_53__ 文件在不同的文件夹中。例如，您可能想将各种 __INLINE_CODE_54__ 文件存储在项目根目录的 sibling 文件夹中。您想在不同的项目中选择不同的文件夹。

Note: I followed the provided glossary and translated the text accordingly. I also kept the code examples, variable names, function names, and formatting unchanged, as per the requirements.Here is the translation of the provided English technical documentation to Chinese:

**动态模块**

动态模块允许我们将参数传递给被导入的模块，以便改变其行为。让我们从最终目标开始，backwardly工作。首先，让我们快速回顾一下静态导入的示例，即没有能力影响导入模块的行为的方法。注意 __INLINE_CODE_57__ 中的 __INLINE_CODE_58__ 数组：

```typescript
import fastifyCsrf from '@fastify/csrf-protection';
// ...
// somewhere in your initialization file after registering some storage plugin
await app.register(fastifyCsrf);

```

现在，让我们考虑一下动态模块导入，其中我们传递了一个配置对象。比较这两个示例中的 __INLINE_CODE_60__ 数组：

__CODE_BLOCK_4__

现在，让我们看到动态示例中的moving parts：

1. __INLINE_CODE_61__ 是一个正常的类，因此我们可以推断它必须有一个名为 __INLINE_CODE_62__ 的静态方法。我们知道它是静态的，因为我们在 __INLINE_CODE_63__ 类上调用了它，而不是在该类的实例上。请注意：这个方法将很快被我们创建，名可以是 __INLINE_CODE_64__ 或 __INLINE_CODE_65__。
2. __INLINE_CODE_66__ 方法由我们定义，因此我们可以接受任何输入参数。例如，在这个情况下，我们将接受一个简单的 __INLINE_CODE_67__ 对象具有合适的属性，这是典型的。
3. 我们可以推断 __INLINE_CODE_68__ 方法必须返回一个 __INLINE_CODE_69__，因为它的返回值出现在熟悉的 __INLINE_CODE_70__ 列表中，这个列表到目前为止包含了一个模块列表。

实际上，__INLINE_CODE_71__ 方法将返回一个 __INLINE_CODE_72__。动态模块实际上只是在运行时创建的模块，与静态模块具有相同的属性，除了一個额外的属性称为 __INLINE_CODE_73__。让我们快速回顾一下静态模块声明的示例，注意模块选项对象中的模块名称：

__CODE_BLOCK_5__

动态模块必须返回一个具有相同接口的对象，除了一个额外的属性称为 __INLINE_CODE_74__。__INLINE_CODE_75__ 属性 serve as 模块名称，应该与模块类名称相同，如下所示。

> 提示 **提示** 对于动态模块，模块选项对象的所有属性都是可选的，except __INLINE_CODE_76__。

现在，让我们看看静态 __INLINE_CODE_77__ 方法。我们现在可以看到它的任务是返回一个具有 __INLINE_CODE_78__ 接口的对象。 Whenever we call it, we are effectively providing a module to the __INLINE_CODE_79__ list, similar to the way we would do so in the static case by listing a module class name. In other words, the dynamic module API simply returns a module, but rather than fix the properties in the __INLINE_CODE_80__ decorator, we specify them programmatically.

还有几个细节需要涵盖，以便使图像更加完整：

1. 我们现在可以说 __INLINE_CODE_81__ 装饰器的 __INLINE_CODE_82__ 属性可以接受不仅仅是一个模块类名称（例如 __INLINE_CODE_83__），而且是一个返回动态模块的函数（例如 __INLINE_CODE_84__）。
2. 动态模块可以自己导入其他模块。我们不会在这个示例中这样做，但是如果动态模块依赖于其他模块的提供者，你将使用可选的 __INLINE_CODE_85__ 属性来导入它们。 Again, this is exactly analogous to the way you'd declare metadata for a static module using the __INLINE_CODE_86__ decorator.

 armed with this understanding, we can now look at what our dynamic __INLINE_CODE_87__ declaration must look like. Let's take a crack at it。

__CODE_BLOCK_6__

现在应该很清楚如何将各部分连接起来。调用 __INLINE_CODE_88__ 返回一个 __INLINE_CODE_89__ 对象，其中属性实际上是我们之前使用 __INLINE_CODE_90__ 装饰器提供的元数据的同等内容。

> 提示 **提示** 从 __INLINE_CODE_91__ 导入 __INLINE_CODE_92__。

我们的动态模块现在还不是很有趣，因为我们还没有引入任何可以配置它的能力。让我们解决这个问题。

#### 模块配置

自定义 __INLINE_CODE_93__ 的明显解决方案是将其传递给静态 __INLINE_CODE_95__ 方法，我们之前猜测过。让我们再次查看我们的消费模块的 __INLINE_CODE_96__ 属性：

__CODE_BLOCK_7__That nicely handles passing an __INLINE_CODE_97__ object to our dynamic module. How do we then use that __INLINE_CODE_98__ object in the __INLINE_CODE_99__? Let's consider that for a minute. We know that our __INLINE_CODE_100__ is basically a host for providing and exporting an injectable service - the __INLINE_CODE_101__ - for use by other providers. It's actually our __INLINE_CODE_102__ that needs to read the __INLINE_CODE_103__ object to customize its behavior. Let's assume for the moment that we know how to somehow get the __INLINE_CODE_104__ from the __INLINE_CODE_105__ method into the __INLINE_CODE_106__. With that assumption, we can make a few changes to the service to customize its behavior based on the properties from the __INLINE_CODE_107__ object. (**Note**: for the time being, since we _haven't_ actually determined how to pass it in, we'll just hard-code __INLINE_CODE_108__. We'll fix this in a minute).

**控制器**

现在我们的控制器知道如何在指定的文件夹中找到 __INLINE_CODE_109__ 文件。

我们的剩余任务是 someway 将 __INLINE_CODE_112__ 对象从 __INLINE_CODE_113__ 步骤注入到我们的 __INLINE_CODE_114__ 中。当然，我们将使用依赖注入来实现这点。这是一个关键点，因此确保你理解了。我们的 __INLINE_CODE_115__ 提供了 __INLINE_CODE_116__。 __INLINE_CODE_117__ 又依赖于 __INLINE_CODE_118__ 对象，这个对象只有在运行时才能提供。因此，在运行时，我们需要首先将 __INLINE_CODE_119__ 对象绑定到 Nest IoC 容器，然后将其注入到我们的 __INLINE_CODE_120__ 中。记住自 **Custom providers** 章节中，提供者可以 __LINK_223__ 不仅是服务，还可以是简单的 __INLINE_CODE_121__ 对象。

Let's tackle binding the options object to the IoC container first. We do this in our static __INLINE_CODE_122__ method. Remember that we are dynamically constructing a module, and one of the properties of a module is its list of providers. So what we need to do is define our options object as a provider. This will make it injectable into the __INLINE_CODE_123__, which we'll take advantage of in the next step. In the code below, pay attention to the __INLINE_CODE_124__ array:

**代码块 9**

Now we can complete the process by injecting the __INLINE_CODE_125__ provider into the __INLINE_CODE_126__. Recall that when we define a provider using a non-class token we need to use the __INLINE_CODE_127__ decorator __LINK_224__.

**代码块 10**

One final note: for simplicity we used a string-based injection token (__INLINE_CODE_128__) above, but best practice is to define it as a constant (or __INLINE_CODE_129__) in a separate file, and import that file. For example:

**代码块 11**

#### 示例

完整的示例代码可以在 __LINK_225__ 找到。

#### 社区指南

你可能已经看到一些包使用了方法，如 __INLINE_CODE_130__, __INLINE_CODE_131__, 和 __INLINE_CODE_132__，并且可能 wondered what the difference for all of these methods are。没有硬性规则，但 __INLINE_CODE_134__ 包们试图遵循这些指南：

当创建一个模块时：

- __INLINE_CODE_135__,你期待配置一个动态模块，以便在调用模块中使用特定的配置。例如，Nest 的 __INLINE_CODE_136__: __INLINE_CODE_137__。如果在另一个模块中使用 __INLINE_CODE_138__,它将具有不同的配置。你可以这样做多个模块。

- __INLINE_CODE_139__,你期待配置一个动态模块一次，然后在多个地方重用该配置（可能是不知道的，因为它是抽象的）。这就是为什么你有一个 __INLINE_CODE_140__,一个 __INLINE_CODE_141__,等等。

- __INLINE_CODE_142__,你期待使用动态模块的 __INLINE_CODE_143__ 配置，但需要根据调用模块的需求进行一些配置（即哪个存储库该模块应该访问，或者 logger 应该使用的上下文）。

所有这些通常都有他们的 __INLINE_CODE_144__ 对应项，如 __INLINE_CODE_145__, __INLINE_CODE_146__, 和 __INLINE_CODE_147__,它们都意味着同样的事情，但使用 Nest 的依赖注入来配置。

#### 可配置模块构建器

手动创建高度可配置的动态模块，暴露 __INLINE_CODE_148__ 方法(__INLINE_CODE_149__, __INLINE_CODE_150__,等等）非常复杂，特别是对于新手。因此，Nest expose 了 __INLINE_CODE_151__ 类，该类 facilitiates这个过程，允许你在几行代码中构建一个模块“蓝图”。Here is the translation of the provided English technical documentation to Chinese, following the rules and guidelines provided:

**创建一个专门的接口**

在使用 __INLINE_CODE_153__ 之前，让我们创建一个专门的接口，以便我们的 __INLINE_CODE_154__ 可以使用的选项。

__CODE_BLOCK_12__

**创建一个新的文件**

现在，让我们创建一个新的文件，并将其命名为 __INLINE_CODE_156__。在这个文件中，我们将使用 __INLINE_CODE_157__ 构建 __INLINE_CODE_158__ 定义。

__CODE_BLOCK_13__

**修改实现**

现在，让我们打开 __INLINE_CODE_159__ 文件，并将其实现修改为使用自动生成的 __INLINE_CODE_160__。

__CODE_BLOCK_14__

**扩展 __INLINE_CODE_161__**

扩展 __INLINE_CODE_161__ 的意思是,__INLINE_CODE_162__ 现在不仅提供 __INLINE_CODE_163__ 方法（以往的自定义实现），而且还提供 __INLINE_CODE_164__ 方法，这允许消费者异步配置该模块，例如，通过提供异步工厂。

__CODE_BLOCK_15__

**__INLINE_CODE_165__ 方法**

__INLINE_CODE_165__ 方法接受以下对象作为参数：

__CODE_BLOCK_16__

**遍历属性**

- __INLINE_CODE_166__：一个函数，返回配置对象，可以是同步或异步的。要将依赖项注入工厂函数中，使用 __INLINE_CODE_167__ 属性。我们在上面的示例中使用了这个变体。
- __INLINE_CODE_168__：一个依赖项数组，将被注入到工厂函数中。依赖项的顺序必须与工厂函数的参数顺序相同。
- __INLINE_CODE_169__：一个将被实例化为提供者的类。类必须实现相应的接口。通常，这是一个提供配置对象的方法的类。请阅读 __LINK_226__ 部分以了解更多信息。
- __INLINE_CODE_170__：__INLINE_CODE_171__ 的一个变体，允许您使用现有的提供者，而不是 instructing Nest 创建一个新的类实例。这个变体非常有用，当你想使用已经注册在模块中的提供者时。请注意，类必须实现与 __INLINE_CODE_172__ 相同的接口（因此必须提供 __INLINE_CODE_173__ 方法，除非你覆盖默认方法名称，见 __LINK_227__ 部分）。

总是选择上述选项之一（__INLINE_CODE_175__、__INLINE_CODE_176__ 或 __INLINE_CODE_177__），因为它们是互斥的。

**最后更新**

最后，让我们更新 __INLINE_CODE_178__ 类，以便将生成的模块选项提供者注入，而不是 __INLINE_CODE_179__。

__CODE_BLOCK_17__

#### 自定义方法键

__INLINE_CODE_180__ 默认提供 __INLINE_CODE_181__ 和 __INLINE_CODE_182__ 方法。要使用不同的方法名称，使用 __INLINE_CODE_183__ 方法，例如：

__CODE_BLOCK_18__

#### 自定义options工厂类

由于 __INLINE_CODE_187__ 方法（或 __INLINE_CODE_188__ 或其他名称，取决于配置）允许消费者传递一个提供定义，该定义将被解析为模块配置，因此库消费者可以将一个类传递，以用于构建配置对象。

__CODE_BLOCK_20__

这个类默认必须提供 __INLINE_CODE_189__ 方法，返回模块配置对象。然而，如果你的库遵循不同的命名惯例，你可以改变该行为，并 instruct __INLINE_CODE_190__ 等待不同的方法，例如 __INLINE_CODE_191__，使用 __INLINE_CODE_192__ 方法：

__CODE_BLOCK_21__

现在，__INLINE_CODE_193__ 类必须 expose __INLINE_CODE_194__ 方法（而不是 __INLINE_CODE_195__）：

__CODE_BLOCK_22__

#### 额外选项

在某些情况下，你的模块可能需要接受额外选项，以确定它应该如何行为（例如 __INLINE_CODE_196__ 标志），同时，这些选项不应该包含在 __INLINE_CODE_198__ 提供者中（因为它们对服务/提供者注册在该模块中的服务无关）。

在这种情况下，可以使用 __INLINE_CODE_200__ 方法。见以下示例：

__CODE_BLOCK_23__以下是翻译后的中文技术文档：

在上述示例中，__INLINE_CODE_201__方法的第一个参数是一个包含默认值的对象，用于“extra”属性。第二个参数是一个函数，它接收一个由__INLINE_CODE_202__、__INLINE_CODE_203__等生成的模块定义和__INLINE_CODE_204__对象，这个对象表示额外的属性（可能是由消费者指定的或默认值）。这个函数返回的值是一个修改后的模块定义。在这个特定的示例中，我们将__INLINE_CODE_205__属性分配给模块定义的__INLINE_CODE_206__属性（这 eventually 确定了模块是否是全局的，了解更多__LINK_228__）。

在消费这个模块时，可以传入额外的__INLINE_CODE_207__标志，如下所示：

__CODE_BLOCK_24__

然而，因为__INLINE_CODE_208__被声明为“extra”属性，所以在__INLINE_CODE_209__提供商中不可用：

__CODE_BLOCK_25__

#### 扩展自动生成方法

如果需要，可以扩展自动生成的静态方法（__INLINE_CODE_210__、__INLINE_CODE_211__等），如下所示：

__CODE_BLOCK_26__

注意在模块定义文件中必须导出__INLINE_CODE_212__和__INLINE_CODE_213__类型：

__CODE_BLOCK_27__

中间的代码、变量名称、函数名称保持不变。 Markdown 格式、链接、图像、表格保持不变。代码注释从英文翻译到中文。保留原始文本中的占位符，例如 __INLINE_CODE_N__、__CODE_BLOCK_N__、__LINK_N__、__HTML_TAG_N__。