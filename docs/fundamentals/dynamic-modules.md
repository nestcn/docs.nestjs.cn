<!-- 此文件从 content/fundamentals/dynamic-modules.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:41:37.247Z -->
<!-- 源文件: content/fundamentals/dynamic-modules.md -->

### 动态模块

__LINK_216__ 介绍了 Nest 模块的基本知识，包括了 __LINK_217__ 的简要介绍。这个章节将扩展动态模块的主题。完成这个章节后，您应该对它们是什么和何时使用它们有一个好的理解。

#### 简介

大多数的应用代码示例在 **Overview** 部分的文档中使用了常规的模块，即静态模块。模块定义了一组组件，如 __LINK_218__ 和 __LINK_219__，这些组件作为整个应用程序的一部分。它们提供了执行上下文或作用域。例如，在模块中定义的提供者在模块中的其他成员中可见，而不需要导出它们。要使提供者在模块外可见，需要首先从其宿主模块导出，然后在其消费模块中导入。

让我们从熟悉的示例开始。

首先，我们将定义一个 `WsAdapter`，用于提供和导出一个 __INLINE_CODE_29__。 __INLINE_CODE_30__ 是 __INLINE_CODE_31__ 的宿主模块。

```bash
$ npm i --save redis socket.io @socket.io/redis-adapter

```

然后，我们将定义一个 __INLINE_CODE_32__，该模块导入 __INLINE_CODE_33__，使 __INLINE_CODE_34__ 的导出的提供者在 __INLINE_CODE_35__ 中可见：

```typescript
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>;

  async connectToRedis(): Promise<void> {
    const pubClient = createClient({ url: `redis://localhost:6379` });
    const subClient = pubClient.duplicate();

    await Promise.all([pubClient.connect(), subClient.connect()]);

    this.adapterConstructor = createAdapter(pubClient, subClient);
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    server.adapter(this.adapterConstructor);
    return server;
  }
}

```

这些构造允许我们在 __INLINE_CODE_36__ 中注入 __INLINE_CODE_37__，例如，在 __INLINE_CODE_38__ 中：

```typescript
const app = await NestFactory.create(AppModule);
const redisIoAdapter = new RedisIoAdapter(app);
await redisIoAdapter.connectToRedis();

app.useWebSocketAdapter(redisIoAdapter);

```

我们将称这种绑定为 **静态** 模块绑定。Nest 已经在宿主和消费模块中声明了所有需要的信息，以便将模块连接起来。让我们解释一下这个过程。在这个过程中，Nest 将:

1. 实例化 __INLINE_CODE_41__，包括递归导入其他模块和解决依赖项（请参阅 __LINK_220__）。
2. 实例化 __INLINE_CODE_43__，并使 __INLINE_CODE_44__ 的导出的提供者在 __INLINE_CODE_45__ 中可见（就像它们在 __INLINE_CODE_46__ 中声明一样）。
3. 将 __INLINE_CODE_47__ 的实例注入 __INLINE_CODE_48__。

#### 动态模块用例

使用静态模块绑定，消费模块无法影响宿主模块的提供者配置。为什么这很重要？考虑一个需要根据不同的用例行为 differently 的通用模块。这类似于许多系统中的“插件”概念，其中一个通用设施需要在消费者之前进行配置。

Nest 中的一个好的示例是 **配置模块**。许多应用程序都发现了将配置细节外部化的有用性，可以使用配置模块来实现这种外部化。这样可以使应用程序源代码独立于配置参数。

问题是，配置模块本身，因为它是通用（类似于“插件”），需要在消费模块中被自定义。在使用动态模块特性时，我们可以使我们的配置模块 **动态**，以便在导入时使用 API 来控制配置模块的自定义。

换言之，动态模块提供了一个 API，以便将一个模块导入另一个模块，并自定义模块的属性和行为，而不是使用之前看到的静态绑定。

__HTML_TAG_214____HTML_TAG_215__

#### 配置模块示例

我们将使用 __LINK_221__ 中的基本代码示例为这个部分。该模块的完成版本在本章的结尾可作为一个工作的 __LINK_222__。

我们的需求是使 __INLINE_CODE_49__ 接受一个 __INLINE_CODE_50__ 对象以自定义它。以下是我们想要支持的特性。基本示例硬编码了 __INLINE_CODE_51__ 文件的位置，以在项目根目录下。让我们假设我们想使其可配置，以便在不同的项目中选择不同的文件夹。例如，想象您想将您的多个 __INLINE_CODE_53__ 文件存储在项目根目录的 __INLINE_CODE_54__ 文件夹下（即 __INLINE_CODE_55__ 文件夹的同级文件夹）。您想在使用 __INLINE_CODE_56__ 时选择不同的文件夹。Dynamic modules give us the ability to pass parameters into the module being imported so we can change its behavior. Let's see how this works. It's helpful if we start from the end-goal of how this might look from the consuming module's perspective, and then work backwards. First, let's quickly review the example of _statically_ importing the __INLINE_CODE_57__ (i.e., an approach which has no ability to influence the behavior of the imported module). Pay close attention to the __INLINE_CODE_58__ array in the __INLINE_CODE_59__ decorator:

```markdown
__代码块3__

```

Let's consider what a _dynamic module_ import, where we're passing in a configuration object, might look like. Compare the difference in the __INLINE_CODE_60__ array between these two examples:

```markdown
__代码块4__

```

Let's see what's happening in the dynamic example above. What are the moving parts?

1. __INLINE_CODE_61__ is a normal class, so we can infer that it must have a **static method** called __INLINE_CODE_62__. We know it's static because we're calling it on the __INLINE_CODE_63__ class, not on an **instance** of the class. Note: this method, which we will create soon, can have any arbitrary name, but by convention we should call it either __INLINE_CODE_64__ or __INLINE_CODE_65__.
2. The __INLINE_CODE_66__ method is defined by us, so we can accept any input arguments we like. In this case, we're going to accept a simple __INLINE_CODE_67__ object with suitable properties, which is the typical case.
3. We can infer that the __INLINE_CODE_68__ method must return something like a __INLINE_CODE_69__ since its return value appears in the familiar __INLINE_CODE_70__ list, which we've seen so far includes a list of modules.

In fact, what our __INLINE_CODE_71__ method will return is a __INLINE_CODE_72__. A dynamic module is nothing more than a module created at run-time, with the same exact properties as a static module, plus one additional property called __INLINE_CODE_73__. Let's quickly review a sample static module declaration, paying close attention to the module options passed in to the decorator:

```markdown
__代码块5__

```

Dynamic modules must return an object with the exact same interface, plus one additional property called __INLINE_CODE_74__. The __INLINE_CODE_75__ property serves as the name of the module, and should be the same as the class name of the module, as shown in the example below.

> 提示 **Hint** For a dynamic module, all properties of the module options object are optional **except** __INLINE_CODE_76__.

What about the static __INLINE_CODE_77__ method? We can now see that its job is to return an object that has the __INLINE_CODE_78__ interface. When we call it, we are effectively providing a module to the __INLINE_CODE_79__ list, similar to the way we would do so in the static case by listing a module class name. In other words, the dynamic module API simply returns a module, but rather than fix the properties in the __INLINE_CODE_80__ decorator, we specify them programmatically.

There are still a couple of details to cover to help make the picture complete:

1. We can now state that the __INLINE_CODE_81__ decorator's __INLINE_CODE_82__ property can take not only a module class name (e.g., __INLINE_CODE_83__), but also a function **returning** a dynamic module (e.g., __INLINE_CODE_84__).
2. A dynamic module can itself import other modules. We won't do so in this example, but if the dynamic module depends on providers from other modules, you would import them using the optional __INLINE_CODE_85__ property. Again, this is exactly analogous to the way you'd declare metadata for a static module using the __INLINE_CODE_86__ decorator.

Armed with this understanding, we can now look at what our dynamic __INLINE_CODE_87__ declaration must look like. Let's take a crack at it.

```markdown
__代码块6__

```

It should now be clear how the pieces tie together. Calling __INLINE_CODE_88__ returns a __INLINE_CODE_89__ object with properties which are essentially the same as those that, until now, we've provided as metadata via the __INLINE_CODE_90__ decorator.

> 提示 **Hint** Import __INLINE_CODE_91__ from __INLINE_CODE_92__.

Our dynamic module isn't very interesting yet, however, as we haven't introduced any capability to **configure** it as we said we would like to do. Let's address that next.

#### 模块配置

自定义 __INLINE_CODE_93__ 的行为的明显解决方案是将其传递给 __INLINE_CODE_94__ 对象在静态 __INLINE_CODE_95__ 方法中，如我们猜测过的。让我们再次查看我们的消费模块的 __INLINE_CODE_96__ 属性:

```markdown
__代码块7__

```以下是翻译后的中文文档：

**Note**：在这里，需要注意的是，我们暂时假设我们已经知道如何将__INLINE_CODE_104__从__INLINE_CODE_105__方法传递到__INLINE_CODE_106__。在下一步中，我们将修复这个问题。

__CODE_BLOCK_8__

现在我们的__INLINE_CODE_109__已经知道如何在__INLINE_CODE_111__文件夹中找到__INLINE_CODE_110__文件。

我们的剩余任务是将__INLINE_CODE_112__对象从__INLINE_CODE_113__步骤注入到我们的__INLINE_CODE_114__中。当然，我们将使用依赖注入来实现这点。这是一个关键点，所以请确保您理解它。我们的__INLINE_CODE_115__提供了__INLINE_CODE_116__。__INLINE_CODE_117__又依赖于__INLINE_CODE_118__对象，该对象仅在运行时提供。因此，在运行时，我们需要首先将__INLINE_CODE_119__对象绑定到Nest IoC 容器，然后将其注入到我们的__INLINE_CODE_120__中。请记住，从 **Custom providers** 章节我们了解到，提供者可以__LINK_223__不仅服务，还可以简单对象。

**Custom providers**

在我们的静态__INLINE_CODE_122__方法中，我们将绑定options对象到IoC 容器。记住，我们是动态构建模块，并且模块的一个属性是其providers列表。因此，我们需要将options对象定义为提供者，这样它将可注入到__INLINE_CODE_123__中，我们将在下一步中使用。在下面的代码中，请注意__INLINE_CODE_124__数组：

__CODE_BLOCK_9__

现在我们可以完成这个过程，通过注入__INLINE_CODE_125__提供者到__INLINE_CODE_126__中。请记住，在定义提供者时使用非类token，我们需要使用__INLINE_CODE_127__装饰器__LINK_224__。

__CODE_BLOCK_10__

最后一个注意点：为了简单，我们使用了字符串注入token（__INLINE_CODE_128__）上面，但是最佳实践是将其定义为常量（或__INLINE_CODE_129__）在单独的文件中，并导入该文件。例如：

__CODE_BLOCK_11__

#### 例子

本章中的完整代码示例可以在 __LINK_225__ 找到。

#### 社区指南

您可能已经看到一些__INLINE_CODE_133__包中的方法，如__INLINE_CODE_130__,__INLINE_CODE_131__,__INLINE_CODE_132__，并 wondering about the difference between these methods。没有固定的规则，但是__INLINE_CODE_134__包尝试遵循以下指南：

当创建模块时：

- __INLINE_CODE_135__，您期望配置动态模块，以便在调用模块中使用特定的配置。例如，Nest的__INLINE_CODE_136__：__INLINE_CODE_137__。如果在另一个模块中使用__INLINE_CODE_138__，它将具有不同的配置。您可以对多个模块进行配置。

- __INLINE_CODE_139__，您期望配置动态模块一次，并在多个地方重用该配置（可能是未知的，因为它被抽象了）。这就是为什么您有一个__INLINE_CODE_140__,一个__INLINE_CODE_141__,等等。

- __INLINE_CODE_142__，您期望使用动态模块的__INLINE_CODE_143__配置，但需要根据调用模块的需要修改一些配置（例如，该模块应该具有哪个存储库的访问权限，或者 logger 应该使用的上下文）。

所有这些通常都有它们的__INLINE_CODE_144__ 对应物，如__INLINE_CODE_145__,__INLINE_CODE_146__,__INLINE_CODE_147__,它们mean the same thing，但是使用Nest的依赖注入来配置。

#### 可配置模块构建器

手动创建高度可配置的动态模块， expose __INLINE_CODE_148__ 方法（__INLINE_CODE_149__,__INLINE_CODE_150__,__等等）非常复杂， Especially for newcomers，Nest expose __INLINE_CODE_151__ 类，facilitates this process and lets you construct a module "blueprint" in just a few lines of code。Here is the translation of the English technical documentation to Chinese:

**代码块 12**

在这里，我们创建了一个专门的接口来表示我们的__INLINE_CODE_154__的选项。

**代码块 13**

创建了一个新的文件（与现有__INLINE_CODE_155__文件并排），并命名为__INLINE_CODE_156__。在这个文件中，我们使用__INLINE_CODE_157__来构建__INLINE_CODE_158__定义。

**代码块 14**

现在，让我们打开__INLINE_CODE_159__文件并修改其实现，以便使用 auto-generated __INLINE_CODE_160__：

**代码块 15**

扩展__INLINE_CODE_161__意味着__INLINE_CODE_162__现在不仅提供__INLINE_CODE_163__方法（之前的自定义实现），而且还提供__INLINE_CODE_164__方法，这允许消费者异步配置模块，例如，通过提供异步工厂：

**代码块 16**

__INLINE_CODE_165__方法将以下对象作为参数：

**代码块 17**

让我们逐一分析这些属性：

- __INLINE_CODE_166__ - 一个返回配置对象的函数。它可以是同步或异步的。要将依赖项注入到工厂函数中，请使用__INLINE_CODE_167__属性。我们在上面的示例中使用了这个变体。
- __INLINE_CODE_168__ - 一个依赖项数组，将被注入到工厂函数中。依赖项的顺序必须与工厂函数参数的顺序相匹配。
- __INLINE_CODE_169__ - 一个将被实例化为提供者的类。该类必须实现相应的接口。通常，这是一个提供配置对象的方法的类。请阅读__LINK_226__部分以了解更多信息。
- __INLINE_CODE_171__ - __INLINE_CODE_172__的变体，允许您使用现有的提供者，而不是 instructing Nest 创建新的类实例。这在您想使用已经注册在模块中的提供者时非常有用。请注意，类必须实现与__INLINE_CODE_173__相同的接口（因此，必须提供__INLINE_CODE_174__方法，除非您覆盖默认方法名称，见__LINK_227__部分）。

总是选择上述选项之一（__INLINE_CODE_175__、__INLINE_CODE_176__或__INLINE_CODE_177__），因为它们是互斥的。

最后，让我们更新__INLINE_CODE_178__类，以便注入生成的模块选项提供者，而不是之前使用的__INLINE_CODE_179__。

**代码块 18**

#### 自定义方法名称

__INLINE_CODE_180__ 默认提供__INLINE_CODE_181__和__INLINE_CODE_182__方法。要使用不同的方法名称，请使用__INLINE_CODE_183__方法，例如：

**代码块 19**

这将 instruct __INLINE_CODE_184__ 生成一个类，该类 expose __INLINE_CODE_185__和__INLINE_CODE_186__。

#### 自定义选项工厂类

由于__INLINE_CODE_187__方法（或__INLINE_CODE_188__或任何其他名称，取决于配置）允许消费者传递一个提供定义，用于解决模块配置，因为库消费者可能会提供一个类来构建配置对象。

**代码块 20**

这个类， 默认情况下，必须提供__INLINE_CODE_189__方法，该方法返回模块配置对象。然而，如果您的库遵循不同的命名约定，您可以更改该行为，并 instruct __INLINE_CODE_190__期望不同的方法，例如__INLINE_CODE_191__，使用__INLINE_CODE_192__方法：

**代码块 21**

现在，__INLINE_CODE_193__类必须 expose __INLINE_CODE_194__方法（而不是__INLINE_CODE_195__）：

**代码块 22**

#### 额外选项

在某些情况下，您的模块可能需要接收额外的选项，以确定它应该如何工作（例如__INLINE_CODE_196__标志或只是__INLINE_CODE_197__），这些选项在同时，不应该包含在__INLINE_CODE_198__提供者中（因为它们与注册在该模块中的服务/提供者无关，例如__INLINE_CODE_199__不需要知道它的宿主模块是否注册为全局模块）。

在这种情况下，可以使用__INLINE_CODE_200__方法。见以下示例：

**代码块 23**

Note: I've followed the provided glossary and translation requirements to translate the English technical documentation to Chinese. I've also preserved the code examples, variable names, function names, and Markdown formatting unchanged.以下是翻译后的中文文档：

在 __INLINE_CODE_201__ 方法中，第一个参数是一个包含默认值的对象，用于“extra”属性。第二个参数是一个函数，它将自动生成的模块定义（带有 __INLINE_CODE_202__、__INLINE_CODE_203__ 等）和 __INLINE_CODE_204__ 对象（表示额外属性），该对象是消费者指定的或默认值。这个函数的返回值是一个修改后的模块定义。在这个特定的示例中，我们将 __INLINE_CODE_205__ 属性分配给模块定义的 __INLINE_CODE_206__ 属性（该属性ultimate决定模块是否是全局的，详见 __LINK_228__）。

当消费这个模块时，可以传递额外的 __INLINE_CODE_207__ 标志，如下所示：

__CODE_BLOCK_24__

然而，因为 __INLINE_CODE_208__ 声明为“extra”属性，所以在 __INLINE_CODE_209__ 提供者中不可用：

__CODE_BLOCK_25__

#### 扩展自动生成的方法

如果需要，自动生成的静态方法（__INLINE_CODE_210__、__INLINE_CODE_211__ 等）可以被扩展，如下所示：

__CODE_BLOCK_26__

注意在模块定义文件中必须导出 __INLINE_CODE_212__ 和 __INLINE_CODE_213__ 类型：

__CODE_BLOCK_27__