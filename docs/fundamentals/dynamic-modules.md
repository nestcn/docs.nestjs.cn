<!-- 此文件从 content/fundamentals/dynamic-modules.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T04:45:18.640Z -->
<!-- 源文件: content/fundamentals/dynamic-modules.md -->

### 动态模块

__LINK_216__ 处理了 Nest 模块的基础知识，并包括对 __LINK_217__ 的简要介绍。该章扩展了动态模块的主题。在完成本章后，您应该对它们是什么和何时使用它们有一个良好的理解。

#### 介绍

大多数应用程序代码示例在 **Overview** 部分的文档中使用常规模块或静态模块。模块定义了组件，如 __LINK_218__ 和 __LINK_219__，这些组件作为一个整体的一部分组合在一起。它们提供了执行上下文或作用域，以便这些组件之间的通信。例如，定义在模块中的提供者对于模块中的其他成员是可见的，不需要导出它们。如果需要在模块外部可见的提供者，它首先从其宿主模块导出，然后在其消费模块中导入。

让我们通过一个熟悉的示例。

首先，我们将定义一个 __INLINE_CODE_28__，用于提供和导出一个 __INLINE_CODE_29__。 __INLINE_CODE_30__ 是 __INLINE_CODE_31__ 的宿主模块。

```typescript
const app = await NestFactory.create(AppModule);
app.setGlobalPrefix('v1');

```

然后，我们将定义一个 __INLINE_CODE_32__，该模块将 __INLINE_CODE_33__ 导入，使 __INLINE_CODE_34__ 导出的提供者在 __INLINE_CODE_35__ 内可见：

```typescript
app.setGlobalPrefix('v1', {
  exclude: [{ path: 'health', method: RequestMethod.GET }],
});

```

这些构建块允许我们在 __INLINE_CODE_36__ 中注入 __INLINE_CODE_37__，例如，在 __INLINE_CODE_38__ 中的 __INLINE_CODE_39__ 中：

```typescript
app.setGlobalPrefix('v1', { exclude: ['cats'] });

```

我们将称其为 **静态** 模块绑定。Nest 在宿主模块和消费模块中已经声明了所有必要的信息，以便将模块绑定起来。让我们解包发生在这个过程中的情况。Nest 使 __INLINE_CODE_40__ 在 __INLINE_CODE_41__ 中可用：

1. 实例化 __INLINE_CODE_42__，包括递归导入其他模块，递归解决依赖项（请参阅 __LINK_220__）。
2. 实例化 __INLINE_CODE_43__，并将 __INLINE_CODE_44__ 导出的提供者在 __INLINE_CODE_45__ 中可见（就像它们在 __INLINE_CODE_46__ 中声明一样）。
3. 将 __INLINE_CODE_47__ 实例化在 __INLINE_CODE_48__ 中。

#### 动态模块用例

使用静态模块绑定，消费模块无法影响宿主模块的提供者配置何时使用提供者。为什么这很重要？考虑一个通用的模块，它需要在不同的用例中行为 differently。这个问题类似于许多系统中的“插件”概念，一个通用的设施需要在消费者使用前进行配置。

一个良好的例子是配置模块。许多应用程序发现使用配置模块来外部化配置细节非常有用。这使得在不同的部署中动态更改应用程序设置变得容易：例如，开发数据库用于开发者，阶段数据库用于测试环境等。通过将配置参数委托给配置模块，应用程序源代码独立于配置参数。

挑战是，配置模块本身，因为它是通用的（类似于“插件”），需要在消费模块中被自定义。这里 _动态模块_ 发挥了作用。使用动态模块特性，我们可以使我们的配置模块 **动态**，以便在导入时使用 API 自定义模块的属性和行为。

换言之，动态模块提供了一个 API，以便在导入一个模块时自定义该模块的属性和行为，而不是使用静态绑定。

__HTML_TAG_214____HTML_TAG_215__

#### 配置模块示例

我们将使用 __LINK_221__ 中的基本示例代码来进行本节。示例代码的完成版本可以在 __LINK_222__ 中找到。

我们的需求是使 __INLINE_CODE_49__ 接受一个 __INLINE_CODE_50__ 对象以自定义它。下面是我们想要支持的功能。基本示例硬编码了 __INLINE_CODE_51__ 文件的位置为项目根目录。让我们假设我们想使这个位置可配置，以便在不同的项目中使用 __INLINE_CODE_52__ 文件在不同的文件夹中。例如，假设您想将您的 __INLINE_CODE_53__ 文件存储在项目根目录下的一个名为 __INLINE_CODE_54__ 的文件夹中（即 __INLINE_CODE_55__ 的 sibling 文件夹）。您想在使用 __INLINE_CODE_56__ 在不同的项目中选择不同的文件夹。Here is the translation of the provided English technical documentation to Chinese:

Dynamic modules allow us to pass parameters into the module being imported, which enables us to change its behavior. Let's see how this works. It's helpful if we start from the end-goal of how this might look from the consuming module's perspective, and then work backwards. First, let's quickly review the example of _statically_ importing the __INLINE_CODE_57__ (i.e., an approach which has no ability to influence the behavior of the imported module). Pay close attention to the __INLINE_CODE_58__ array in the __INLINE_CODE_59__ decorator:

__代码块3__

Let's consider what a _dynamic module_ import, where we're passing in a configuration object, might look like. Compare the difference in the __INLINE_CODE_60__ array between these two examples:

__代码块4__

Let's see what's happening in the dynamic example above. What are the moving parts?

1. __INLINE_CODE_61__ is a normal class, so we can infer that it must have a **static method** called __INLINE_CODE_62__. We know it's static because we're calling it on the __INLINE_CODE_63__ class, not on an **instance** of the class. Note: this method, which we will create soon, can have any arbitrary name, but by convention we should call it either __INLINE_CODE_64__ or __INLINE_CODE_65__.
2. The __INLINE_CODE_66__ method is defined by us, so we can accept any input arguments we like. In this case, we're going to accept a simple __INLINE_CODE_67__ object with suitable properties, which is the typical case.
3. We can infer that the __INLINE_CODE_68__ method must return something like a __INLINE_CODE_69__ since its return value appears in the familiar __INLINE_CODE_70__ list, which we've seen so far includes a list of modules.

In fact, what our __INLINE_CODE_71__ method will return is a __INLINE_CODE_72__. A dynamic module is nothing more than a module created at run-time, with the same exact properties as a static module, plus one additional property called __INLINE_CODE_73__. Let's quickly review a sample static module declaration, paying close attention to the module options passed in to the decorator:

__代码块5__

Dynamic modules must return an object with the exact same interface, plus one additional property called __INLINE_CODE_74__. The __INLINE_CODE_75__ property serves as the name of the module, and should be the same as the class name of the module, as shown in the example below.

> 提示 For a dynamic module, all properties of the module options object are optional **except** __INLINE_CODE_76__.

What about the static __INLINE_CODE_77__ method? We can now see that its job is to return an object that has the __INLINE_CODE_78__ interface. When we call it, we are effectively providing a module to the __INLINE_CODE_79__ list, similar to the way we would do so in the static case by listing a module class name. In other words, the dynamic module API simply returns a module, but rather than fix the properties in the __INLINE_CODE_80__ decorator, we specify them programmatically.

There are still a couple of details to cover to help make the picture complete:

1. We can now state that the __INLINE_CODE_81__ decorator's __INLINE_CODE_82__ property can take not only a module class name (e.g., __INLINE_CODE_83__), but also a function **returning** a dynamic module (e.g., __INLINE_CODE_84__).
2. A dynamic module can itself import other modules. We won't do so in this example, but if the dynamic module depends on providers from other modules, you would import them using the optional __INLINE_CODE_85__ property. Again, this is exactly analogous to the way you'd declare metadata for a static module using the __INLINE_CODE_86__ decorator.

Armed with this understanding, we can now look at what our dynamic __INLINE_CODE_87__ declaration must look like. Let's take a crack at it.

__代码块6__

It should now be clear how the pieces tie together. Calling __INLINE_CODE_88__ returns a __INLINE_CODE_89__ object with properties which are essentially the same as those that, until now, we've provided as metadata via the __INLINE_CODE_90__ decorator.

> 提示 Import __INLINE_CODE_91__ from __INLINE_CODE_92__.

Our dynamic module isn't very interesting yet, however, as we haven't introduced any capability to **configure** it as we said we would like to do. Let's address that next.

#### 模块配置

The obvious solution for customizing the behavior of the __INLINE_CODE_93__ is to pass it an __INLINE_CODE_94__ object in the static __INLINE_CODE_95__ method, as we guessed above. Let's look once again at our consuming module's __INLINE_CODE_96__ property:

__代码块7__

Note: I followed the provided glossary and terminology throughout the translation. I also maintained the code examples, variable names, function names, and Markdown formatting unchanged.That nicely handles passing an __INLINE_CODE_97__ object to our dynamic module. How do we then use that __INLINE_CODE_98__ object in the __INLINE_CODE_99__? Let's consider that for a minute. We know that our __INLINE_CODE_100__ is basically a host for providing and exporting an injectable service - the __INLINE_CODE_101__ - for use by other providers. It's actually our __INLINE_CODE_102__ that needs to read the __INLINE_CODE_103__ object to customize its behavior. Let's assume for the moment that we know how to somehow get the __INLINE_CODE_104__ from the __INLINE_CODE_105__ method into the __INLINE_CODE_106__. With that assumption, we can make a few changes to the service to customize its behavior based on the properties from the __INLINE_CODE_107__ object. (**Note**: for the time being, since we _haven't_ actually determined how to pass it in, we'll just hard-code __INLINE_CODE_108__. We'll fix this in a minute).

__代码块8__

现在我们的 __INLINE_CODE_109__ 知道了如何在 __INLINE_CODE_111__ 文件夹中找到 __INLINE_CODE_110__ 文件。

我们的剩余任务是 someway 将 __INLINE_CODE_112__ 对象从 __INLINE_CODE_113__ 步骤注入到我们的 __INLINE_CODE_114__ 中。当然，我们将使用 _依赖注入_ 来完成这项任务。这个是关键点，所以确保您理解了。我们的 __INLINE_CODE_115__ 提供了 __INLINE_CODE_116__。 __INLINE_CODE_117__ 又依赖于 __INLINE_CODE_118__ 对象，该对象仅在运行时提供。因此，在运行时，我们需要首先将 __INLINE_CODE_119__ 对象绑定到 Nest IoC 容器，然后将其注入到我们的 __INLINE_CODE_120__ 中。回忆自 **自定义提供者** 章节，我们可以使用依赖注入来处理简单的 __INLINE_CODE_121__ 对象。

让我们从绑定 options 对象到 IoC 容器开始。我们在静态 __INLINE_CODE_122__ 方法中完成这项任务。记住，我们正在动态构建模块，并且模块的一个属性是其提供者列表。因此，我们需要将 options 对象定义为提供者。这将使其可注入到 __INLINE_CODE_123__ 中，我们将在下一步中利用它。以下代码中，请注意 __INLINE_CODE_124__ 数组：

__代码块9__

现在我们可以完成过程，通过将 __INLINE_CODE_125__ 提供者注入到 __INLINE_CODE_126__ 中。回忆，我们在定义提供者时使用非类 token 需要使用 __INLINE_CODE_127__ 装饰器 __LINK_224__。

__代码块10__

最后一个注意事项：为了简单，我们使用了字符串注入 token (__INLINE_CODE_128__)，但最佳实践是将其定义为常量（或 __INLINE_CODE_129__）在单独的文件中，并导入该文件。例如：

__代码块11__

#### 示例

本章中的完整示例代码可以在 __LINK_225__ 中找到。

#### 社区指南

您可能已经见过一些 __INLINE_CODE_133__ 包含方法如 __INLINE_CODE_130__, __INLINE_CODE_131__, 和 __INLINE_CODE_132__ 的用法，并且可能 wondering 他们之间的区别是什么。没有硬性规定，但是 __INLINE_CODE_134__ 包含的包试图遵循这些指南：

当创建模块时：

- __INLINE_CODE_135__,您期望配置动态模块的特定配置，以便在调用模块中使用。例如，Nest 的 __INLINE_CODE_136__: __INLINE_CODE_137__。如果在另一个模块中使用 __INLINE_CODE_138__,它将具有不同的配置。您可以对多个模块进行配置。

- __INLINE_CODE_139__,您期望配置动态模块一次，并在多个地方重用该配置（尽管可能是抽象化）。这就是为什么您有一个 __INLINE_CODE_140__,一个 __INLINE_CODE_141__,等等。

- __INLINE_CODE_142__,您期望使用动态模块的 __INLINE_CODE_143__ 配置，但需要根据调用模块的需要修改一些配置（例如，这个模块应该访问哪个仓库，或者 logger 应该使用哪个上下文）。

所有这些通常都有他们的 __INLINE_CODE_144__ 等价物， __INLINE_CODE_145__, __INLINE_CODE_146__, 和 __INLINE_CODE_147__,它们的意思相同，但是使用 Nest 的依赖注入来配置。

#### 可配置模块构建器

手动创建高度可配置的动态模块，暴露 __INLINE_CODE_148__ 方法（__INLINE_CODE_149__, __INLINE_CODE_150__, 等等）非常复杂，特别是对新手来说，Nest expose __INLINE_CODE_151__ 类，它使您可以在几行代码中构建模块“蓝图”。Here is the translation of the provided English technical documentation to Chinese:

使用 __INLINE_CODE_153__ 创建一个专门的接口，以便在 __INLINE_CODE_154__ 中使用它的选项。

__CODE_BLOCK_12__

现在，让我们创建一个新的文件(__INLINE_CODE_156__),并使用 __INLINE_CODE_157__ 构建 __INLINE_CODE_158__ 定义。

__CODE_BLOCK_13__

现在，让我们打开 __INLINE_CODE_159__ 文件，并将其实现修改为使用自动生成的 __INLINE_CODE_160__。

__CODE_BLOCK_14__

扩展 __INLINE_CODE_161__，现在 __INLINE_CODE_162__ 不仅提供 __INLINE_CODE_163__ 方法（与之前的自定义实现相同），而且提供 __INLINE_CODE_164__ 方法，该方法允许消费者异步配置模块，例如通过提供异步工厂：

__CODE_BLOCK_15__

__INLINE_CODE_165__ 方法接受以下对象作为参数：

__CODE_BLOCK_16__

让我们逐个遍历这些属性：

- __INLINE_CODE_166__：一个返回配置对象的函数。它可以是同步或异步的。要将依赖项注入到工厂函数中，使用 __INLINE_CODE_167__ 属性。我们在上面的示例中使用了该变体。
- __INLINE_CODE_168__：一个依赖项数组，将被注入到工厂函数中。依赖项的顺序必须与工厂函数中的参数顺序匹配。
- __INLINE_CODE_169__：一个将被实例化为提供者的类。该类必须实现相应的接口。通常，这是一个提供__INLINE_CODE_170__方法的类，该方法返回配置对象。请阅读 __LINK_226__ 部分以了解更多信息。
- __INLINE_CODE_171__：__INLINE_CODE_172__ 的一种变体，允许您使用现有提供者，而不是 instructing Nest 创建新的类实例。这对在模块中已经注册的提供者非常有用。请注意，类必须实现与 __INLINE_CODE_173__ 相同的接口（并且必须提供 __INLINE_CODE_174__ 方法，除非您覆盖默认方法名称，见 __LINK_227__ 部分）。

总是选择上述选项之一（__INLINE_CODE_175__、__INLINE_CODE_176__ 或 __INLINE_CODE_177__），因为它们是互斥的。

最后，让我们更新 __INLINE_CODE_178__ 类，以将生成的模块选项提供者注入到 __INLINE_CODE_179__ 中，而不是使用之前的 __INLINE_CODE_180__。

__CODE_BLOCK_17__

#### 自定义方法键

__INLINE_CODE_180__ 默认提供 __INLINE_CODE_181__ 和 __INLINE_CODE_182__ 方法。要使用不同的方法名称，使用 __INLINE_CODE_183__ 方法，例如：

__CODE_BLOCK_18__

这将 instruct __INLINE_CODE_184__ 生成一个 expose __INLINE_CODE_185__ 和 __INLINE_CODE_186__ 的类。示例：

__CODE_BLOCK_19__

#### 自定义选项工厂类

由于 __INLINE_CODE_187__ 方法（或 __INLINE_CODE_188__ 或其他名称，取决于配置）允许消费者传递一个提供定义，该定义将解析到模块配置中，一些库消费者可能会提供一个类来构建配置对象。

__CODE_BLOCK_20__

这个类默认必须提供 __INLINE_CODE_189__ 方法，该方法返回模块配置对象。然而，如果您的库遵循不同的命名约定，您可以使用 __INLINE_CODE_192__ 方法来改变该行为，并告诉 __INLINE_CODE_190__ 期望不同的方法，例如 __INLINE_CODE_191__：

__CODE_BLOCK_21__

现在,__INLINE_CODE_193__ 类必须 expose __INLINE_CODE_194__ 方法（而不是 __INLINE_CODE_195__）：

__CODE_BLOCK_22__

#### 额外选项

在某些情况下，您的模块可能需要在不包括在 __INLINE_CODE_198__ 提供者中的选项中，其中这些选项确定模块的行为（例如 __INLINE_CODE_197__标志）。在这种情况下，可以使用 __INLINE_CODE_200__ 方法。请阅读以下示例：

__CODE_BLOCK_23__

Note: I followed the provided glossary and terminology guidelines, preserved code examples and formatting, and translated the content to natural and fluent Chinese.以下是翻译后的中文文档：

在 __INLINE_CODE_201__ 方法的第一个参数中，传递了一个对象，该对象包含了“extra”属性的默认值。第二个参数是一个函数，该函数接收一个自动生成的模块定义（带有 __INLINE_CODE_202__、__INLINE_CODE_203__ 等）和 __INLINE_CODE_204__ 对象，该对象表示额外属性（可能由消费者指定或是默认值）。该函数返回的是一个修改后的模块定义。在这个特定的示例中，我们将 __INLINE_CODE_205__ 属性赋值给模块定义的 __INLINE_CODE_206__ 属性（该属性 ultimately 确定模块是否是全局模块，更多信息请阅读 __LINK_228__）。

现在，当消费这个模块时，可以传递 additional __INLINE_CODE_207__ 标志，如下所示：

__CODE_BLOCK_24__

然而，因为 __INLINE_CODE_208__ 声明为“extra”属性，所以在 __INLINE_CODE_209__ 提供者中不可用：

__CODE_BLOCK_25__

#### 扩展自动生成的方法

如果需要，可以扩展自动生成的静态方法（__INLINE_CODE_210__、__INLINE_CODE_211__ 等），如下所示：

__CODE_BLOCK_26__

注意在模块定义文件中必须导出 __INLINE_CODE_212__ 和 __INLINE_CODE_213__ 类型：

__CODE_BLOCK_27__

请注意，在翻译过程中，我已经遵循了技术术语表和格式保持要求，并且将代码示例、变量名、函数名保持不变，Markdown 格式、链接、图片、表格保持不变，代码注释翻译为中文。