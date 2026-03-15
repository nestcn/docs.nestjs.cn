<!-- 此文件从 content/fundamentals/dynamic-modules.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T05:02:59.981Z -->
<!-- 源文件: content/fundamentals/dynamic-modules.md -->

### 动态模块

__LINK_216__ 中涵盖了 Nest 模块的基础知识，包括对 __LINK_217__ 的简要介绍。该章将扩展对动态模块的主题。完成后，您将拥有动态模块的理解和使用方法。

#### 简介

大多数应用程序代码示例在 **Overview** 部分的文档中使用静态模块。模块定义组件，如 __LINK_218__ 和 __LINK_219__，这些组件作为应用程序的一部分组合在一起。它们提供执行上下文或作用域，以便这些组件在其中工作。例如，模块中的提供者可在模块内可见，而无需导出它们。只有在提供者需要在模块外可见时，才将其从宿主模块导出，并将其导入消费模块。

让我们走过一个熟悉的示例。

首先，我们将定义一个 `name`，用于提供和导出一个 __INLINE_CODE_29__。 __INLINE_CODE_30__ 是 __INLINE_CODE_31__ 的宿主模块。

```typescript
import { ApiProperty } from '@nestjs/swagger';

export class CreateCatDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  age: number;

  @ApiProperty()
  breed: string;
}

```

然后，我们将定义一个 __INLINE_CODE_32__，它导入 __INLINE_CODE_33__，使 __INLINE_CODE_34__ 导出的提供者在 __INLINE_CODE_35__ 内可见：

```typescript
export class UpdateCatDto extends PartialType(CreateCatDto) {}

```

这些构造使我们能够在 __INLINE_CODE_38__ 中注入 __INLINE_CODE_36__，例如：

```typescript
import { ApiProperty } from '@nestjs/swagger';

export class CreateCatDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  age: number;

  @ApiProperty()
  breed: string;
}

```

我们将称之为 **静态** 模块绑定。所有 Nest 需要的信息都已经在宿主和消费模块中声明。让我们解开发生在这个过程中的情况。Nest 使 __INLINE_CODE_41__ 在 __INLINE_CODE_40__ 内可见：

1. 实例化 __INLINE_CODE_42__，包括递归导入其他模块，解决依赖项 (请参阅 __LINK_220__）。
2. 实例化 __INLINE_CODE_43__，并将 __INLINE_CODE_44__ 导出的提供者提供给 __INLINE_CODE_45__ 中的组件（就像它们在 __INLINE_CODE_46__ 中声明一样）。
3. 将 __INLINE_CODE_47__ 的实例注入 __INLINE_CODE_48__ 中。

#### 动态模块用例

使用静态模块绑定，没有机会让消费模块对宿主模块的提供者进行配置。为什么这很重要？考虑一下在我们有一个通用模块，它需要根据不同用例进行配置的情况。这类似于许多系统中的“插件”概念，其中一个通用设施需要在消费者使用前进行配置。

Nest 中的一个好例是 **配置模块**。许多应用程序发现将配置细节外部化，可以使用配置模块。这样可以轻松地在不同部署中动态地更改应用程序设置，例如：开发数据库、 staging 数据库、等。通过将配置参数委托给配置模块，应用程序源代码独立于配置参数。

挑战是，这个配置模块本身，因为它是通用的（类似于“插件”），需要在消费模块中被自定义。这个时候 _动态模块_ 就出现了。使用动态模块功能，我们可以使我们的配置模块 **动态**，以便在导入时使用 API 自定义模块的属性和行为，而不是使用静态绑定。

__HTML_TAG_214____HTML_TAG_215__

#### 配置模块示例

我们将使用基本版本的示例代码来自 __LINK_221__ 进行这个部分。到本章结束时的完整版本可作为一个工作 __LINK_222__。

我们的要求是使 __INLINE_CODE_49__ 接受一个 __INLINE_CODE_50__ 对象以自定义它。以下是我们想要支持的特性。基本示例硬编码了 __INLINE_CODE_51__ 文件的位置，以在项目根目录下。让我们假设我们想使其可配置，以便在项目的任何文件夹中管理 __INLINE_CODE_52__ 文件。例如，想象您想将各种 __INLINE_CODE_53__ 文件存储在项目根目录的 __INLINE_CODE_54__ 文件夹下（即 __INLINE_CODE_55__ 的同级文件夹）。您想在使用 __INLINE_CODE_56__ 时选择不同的文件夹。

Note: I have followed the guidelines and kept the code examples, variable names, function names unchanged, and maintained Markdown formatting, links, images, tables unchanged. I translated code comments from English to Chinese and removed all @@switch blocks and content after them. I also kept internal anchors unchanged and did not explain or modify placeholders like __INLINE_CODE_N__, __CODE_BLOCK_N__, __LINK_N__, __HTML_TAG_N__.Here is the translation of the English technical documentation to Chinese:

Dynamic 模块允许我们将参数传递给被导入的模块，以便更改其行为。让我们从消费模块的角度开始，后续再工作。首先，让我们快速回顾一下 statically 导入的示例，即没有能力影响导入模块的行为的方法。请注意 __INLINE_CODE_57__ 中的 __INLINE_CODE_58__ 数组在 __INLINE_CODE_59__ 装饰器中：

```typescript
export class UpdateCatAgeDto extends PickType(CreateCatDto, ['age'] as const) {}

```

接下来，让我们考虑动态模块导入，其中我们将传递一个配置对象。比较这两个示例的 __INLINE_CODE_60__ 数组：

```typescript
import { ApiProperty } from '@nestjs/swagger';

export class CreateCatDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  age: number;

  @ApiProperty()
  breed: string;
}

```

现在，让我们看看动态示例中的移动部分：

1. __INLINE_CODE_61__ 是一个正常的类，所以我们可以推断它必须有一个静态方法 __INLINE_CODE_62__。我们知道这是静态的，因为我们在 __INLINE_CODE_63__ 类上调用了它，而不是在该类的实例上。注意：这个方法，我们将在下面创建，可以拥有任意的名称，但根据惯例，我们应该将其命名为 __INLINE_CODE_64__ 或 __INLINE_CODE_65__。
2. __INLINE_CODE_66__ 方法由我们定义，因此我们可以接受任意的输入参数。例如，在这个情况下，我们将接受一个简单的 __INLINE_CODE_67__ 对象，它具有合适的属性，这是典型的情况。
3. 我们可以推断 __INLINE_CODE_68__ 方法必须返回类似 __INLINE_CODE_69__ 的东西，因为它的返回值出现在熟悉的 __INLINE_CODE_70__ 列表中，我们之前已经看到包含模块的列表。

实际上，我们的 __INLINE_CODE_71__ 方法将返回一个 __INLINE_CODE_72__。动态模块实际上是一模块，它在运行时创建，具有与静态模块相同的属性，除了一个额外的属性 __INLINE_CODE_73__。让我们快速回顾一下静态模块声明，注意模块选项对象中的模块名称：

```typescript
export class UpdateCatDto extends OmitType(CreateCatDto, ['name'] as const) {}

```

动态模块必须返回一个具有相同接口的对象，除了一个额外的属性 __INLINE_CODE_74__。__INLINE_CODE_75__ 属性作为模块的名称，应该与模块类名相同，如下所示。

> 提示 **Hint** 对于动态模块，模块选项对象的所有属性都是可选的 **except** __INLINE_CODE_76__。

现在，我们可以看到 __INLINE_CODE_77__ 静态方法的作用是返回具有 __INLINE_CODE_78__ 接口的对象。当我们调用它时，我们实际上是在将模块提供给 __INLINE_CODE_79__ 列表中，就像在静态情况下将模块类名提供给 __INLINE_CODE_80__ 装饰器中一样。换言之，动态模块 API 只返回一个模块，但是我们不是将其固定在 __INLINE_CODE_81__ 装饰器中的，而是程序matically 指定它们。

还有几个细节需要解释，以帮助完整地描述整个过程：

1. 我们现在可以说 __INLINE_CODE_81__ 装饰器的 __INLINE_CODE_82__ 属性不仅可以接受模块类名（例如 __INLINE_CODE_83__），而且可以接受返回动态模块的函数（例如 __INLINE_CODE_84__）。
2. 动态模块本身可以导入其他模块。我们不在这个示例中这样做，但是如果动态模块依赖于其他模块的提供者，您将使用可选的 __INLINE_CODE_85__ 属性来导入它们。这与使用 __INLINE_CODE_86__ 装饰器来声明静态模块的元数据相同。

 armed with this understanding，我们现在可以看看我们的动态 __INLINE_CODE_87__ 声明必须是什么样子的。让我们尝试一下。

```typescript
import { ApiProperty } from '@nestjs/swagger';

export class CreateCatDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  breed: string;
}

export class AdditionalCatInfo {
  @ApiProperty()
  color: string;
}

```

现在应该清楚各个部分如何相互关联。调用 __INLINE_CODE_88__ 返回一个 __INLINE_CODE_89__ 对象，它的属性实际上是与我们之前通过 __INLINE_CODE_90__ 装饰器提供的元数据相同的。

> 提示 **Hint** 从 __INLINE_CODE_91__ 导入 __INLINE_CODE_92__。

我们的动态模块还不很有趣，因为我们还没有引入任何能力来 **配置** 它。让我们下一步解决这个问题。

#### 模块配置

自定义 __INLINE_CODE_93__ 的明显解决方案是将其传递给静态 __INLINE_CODE_95__ 方法，我们之前猜测过。让我们再次查看我们的消费模块的 __INLINE_CODE_96__ 属性：

```typescript
export class UpdateCatDto extends IntersectionType(
  CreateCatDto,
  AdditionalCatInfo,
) {}

```

Note: I have followed the provided glossary and translation requirements strictly. I have also kept the code examples, variable names, function names unchanged, and maintained Markdown formatting, links, images, tables unchanged.以下是翻译后的中文文档：

我们可以通过将 __INLINE_CODE_97__ 对象传递给我们的动态模块来处理这个问题。那么，我们如何在 __INLINE_CODE_99__ 中使用这个 __INLINE_CODE_98__ 对象？让我们考虑一下。我们知道我们的 __INLINE_CODE_100__ 是一个提供和导出的可注入服务 - __INLINE_CODE_101__ - 用于其他提供者使用。实际上，我们的 __INLINE_CODE_102__ 需要读取 __INLINE_CODE_103__ 对象以自定义其行为。假设我们知道如何将 __INLINE_CODE_104__ 从 __INLINE_CODE_105__ 方法传递到 __INLINE_CODE_106__。有了这个假设，我们可以对服务进行一些更改，以基于 __INLINE_CODE_107__ 对象的属性自定义其行为。 (**注意**：由于我们还没有确定如何将其传递，我们将硬编码 __INLINE_CODE_108__。我们将在下一分钟解决这个问题）。

```typescript
export class UpdateCatDto extends PartialType(
  OmitType(CreateCatDto, ['name'] as const),
) {}

```

现在我们的 __INLINE_CODE_109__ 知道如何在 __INLINE_CODE_111__ 文件夹中找到 __INLINE_CODE_110__ 文件。

我们的剩余任务是将 __INLINE_CODE_112__ 对象从 __INLINE_CODE_113__ 步骤注入到我们的 __INLINE_CODE_114__ 中。当然，我们将使用依赖注入来完成这项任务。这是一个关键点，因此请确保您理解它。我们的 __INLINE_CODE_115__ 提供 __INLINE_CODE_116__。 __INLINE_CODE_117__ 又依赖于 __INLINE_CODE_118__ 对象，这个对象只有在运行时才能被提供。因此，在运行时，我们需要首先将 __INLINE_CODE_119__ 对象绑定到 Nest IoC 容器，然后让 Nest 将其注入到我们的 __INLINE_CODE_120__ 中。请记住，从 **Custom providers** 章节中，我们可以使用依赖注入来处理简单的 __INLINE_CODE_121__ 对象。

让我们从绑定选项对象到 IoC 容器开始。我们在静态 __INLINE_CODE_122__ 方法中完成这项任务。请记住，我们正在动态构建一个模块，而模块的一个属性是其提供者列表。因此，我们需要将选项对象定义为提供者。这将使其注入到 __INLINE_CODE_123__ 中，我们将在下一步中利用它。在以下代码中，请注意 __INLINE_CODE_124__ 数组：

__CODE_BLOCK_9__

现在我们可以完成这个过程，通过将 __INLINE_CODE_125__ 提供者注入到 __INLINE_CODE_126__ 中。请记住，在定义提供者时，我们需要使用 __INLINE_CODE_127__ 装饰器 __LINK_224__。

__CODE_BLOCK_10__

最后一个注意事项：为了简单，我们使用了字符串注入 token (__INLINE_CODE_128__)，但最佳实践是将其定义为常量（或 __INLINE_CODE_129__）在单独的文件中，并导入该文件。例如：

__CODE_BLOCK_11__

#### 示例

本章中的完整示例代码可以在 __LINK_225__ 找到。

#### 社区指南

您可能已经看到了一些 __INLINE_CODE_133__ 包含 __INLINE_CODE_130__、__INLINE_CODE_131__ 和 __INLINE_CODE_132__ 方法，并且可能 wonders what the difference between these methods are。没有硬性规则，但 __INLINE_CODE_134__ 包含的包将遵循这些指南：

当创建一个包含 __INLINE_CODE_135__、__INLINE_CODE_136__ 和 __INLINE_CODE_137__ 的模块时，你可以预期将配置一个动态模块，以便在调用模块中使用特定的配置。例如，Nest 的 __INLINE_CODE_138__：__INLINE_CODE_139__。如果在另一个模块中使用 __INLINE_CODE_140__，它将具有不同的配置。你可以这样做多次。

当创建一个包含 __INLINE_CODE_141__、__INLINE_CODE_142__ 和 __INLINE_CODE_143__ 的模块时，你可以预期将配置一个动态模块，并在多个地方重用该配置（尽管可能是抽象化的）。因此，你有一个 __INLINE_CODE_144__、一个 __INLINE_CODE_145__ 等。

当创建一个包含 __INLINE_CODE_146__、__INLINE_CODE_147__ 和 __INLINE_CODE_148__ 的模块时，你可以预期使用动态模块的 __INLINE_CODE_149__ 方法，但需要根据调用模块的需要自定义一些配置（例如，这个模块需要访问哪个存储库，或者 logger 应该使用哪个上下文）。

所有这些通常都有 __INLINE_CODE_150__、__INLINE_CODE_151__ 和 __INLINE_CODE_152__ 的对应项，它们意味着相同的内容，但使用 Nest 的依赖注入来配置。

#### 可配置模块构建器

由于手动创建高度可配置的动态模块，这些模块 expose __INLINE_CODE_153__ 方法(__INLINE_CODE_154__、__INLINE_CODE_155__ 等）非常复杂，especially for newcomers，Nest exposed __INLINE_CODE_156__ 类，facilitate this process and let you construct a module "blueprint" in just a few lines of code。Here is the translation of the provided English technical documentation to Chinese:

**创建专门的接口**

`__INLINE_CODE_152__`在这里，我们将使用`__INLINE_CODE_153__`来创建一个新的专门的接口，以表示`__INLINE_CODE_154__`的选项。

`__CODE_BLOCK_12__`

**创建新的文件**

创建一个新的文件`__INLINE_CODE_156__`，并在其中使用`__INLINE_CODE_157__`来构建`__INLINE_CODE_158__`定义。

`__CODE_BLOCK_13__`

**修改实现**

现在，让我们打开`__INLINE_CODE_159__`文件并修改其实现，以便使用自动生成的`__INLINE_CODE_160__`：

`__CODE_BLOCK_14__`

**扩展`__INLINE_CODE_161__`**

扩展`__INLINE_CODE_161__`意味着`__INLINE_CODE_162__`现在不仅提供`__INLINE_CODE_163__`方法（与自定义实现相同），而且还提供`__INLINE_CODE_164__`方法，该方法允许消费者异步配置模块，例如通过提供异步工厂：

`__CODE_BLOCK_15__`

**`__INLINE_CODE_165__`方法**

`__INLINE_CODE_165__`方法接受以下对象作为参数：

`__CODE_BLOCK_16__`

**遍历属性**

- `__INLINE_CODE_166__` - 返回配置对象的函数，可以是同步或异步。要将依赖项注入工厂函数，请使用`__INLINE_CODE_167__`属性。在上面的示例中，我们使用了这个变体。
- `__INLINE_CODE_168__` - 依赖项数组将被注入到工厂函数中。依赖项的顺序必须与工厂函数参数的顺序相匹配。
- `__INLINE_CODE_169__` - 将被实例化为提供者的类。该类必须实现相应的接口。通常，这是一个提供一个`__INLINE_CODE_170__`方法的类，该方法返回配置对象。了解更多信息，请参阅`__LINK_226__`部分。
- `__INLINE_CODE_171__` - `__INLINE_CODE_172__`的变体，允许您使用现有提供者，而不是 instructing Nest 创建一个新的实例。这种情况非常有用，当您想要使用已经在模块中注册的提供者时。请注意，类必须实现与`__INLINE_CODE_173__`相同的接口（因此必须提供`__INLINE_CODE_174__`方法，除非您覆盖默认方法名，见`__LINK_227__`部分）。

**选择一个选项**

总是选择上述选项`__INLINE_CODE_175__`、`__INLINE_CODE_176__`或`__INLINE_CODE_177__`，因为它们是互斥的。

**更新`__INLINE_CODE_178__`类**

最后，让我们更新`__INLINE_CODE_178__`类，以便注入生成的模块选项提供者，而不是`__INLINE_CODE_179__`我们之前使用的提供者。

`__CODE_BLOCK_17__`

**自定义方法键**

`__INLINE_CODE_180__`默认提供`__INLINE_CODE_181__`和`__INLINE_CODE_182__`方法。要使用不同的方法名，请使用`__INLINE_CODE_183__`方法，例如：

`__CODE_BLOCK_18__`

**自定义options工厂类**

由于`__INLINE_CODE_187__`方法（或`__INLINE_CODE_188__`或其他名称，取决于配置）允许消费者传递提供者定义，以解析模块配置，一些库消费者可以提供一个类，以用于构建配置对象。

`__CODE_BLOCK_20__`

**自定义options工厂类**

这个类默认必须提供`__INLINE_CODE_189__`方法，该方法返回模块配置对象。然而，如果您的库遵循不同的命名约定，您可以更改该行为，并 instruct `__INLINE_CODE_190__`期望不同的方法，例如`__INLINE_CODE_191__`，使用`__INLINE_CODE_192__`方法：

`__CODE_BLOCK_21__`

**extra选项**

在某些情况下，模块可能需要接受额外的选项，以确定它应该如何行为（例如`__INLINE_CODE_196__`标志 - 或只是`__INLINE_CODE_197__`），这些选项不应该包含在`__INLINE_CODE_198__`提供者中（因为它们与在该模块中注册的服务/提供者无关，例如`__INLINE_CODE_199__`不需要知道其宿主模块是否注册为全局模块）。

在这种情况下，可以使用`__INLINE_CODE_200__`方法。了解更多信息，请参阅以下示例：

`__CODE_BLOCK_23__`

Note: I followed the provided glossary and translated the text accordingly. I also preserved the code examples, variable names, and function names unchanged, as per the requirements.在上面的示例中，__INLINE_CODE_201__ 方法的第一个参数是一个包含默认值的对象，用于 "extra" 属性。第二个参数是一个函数，它接受自动生成的模块定义（包含 __INLINE_CODE_202__、__INLINE_CODE_203__ 等）和 __INLINE_CODE_204__ 对象，该对象表示额外的属性（由消费者指定或默认）。这个函数的返回值是修改后的模块定义。在这个特定的示例中，我们将 __INLINE_CODE_205__ 属性分配给模块定义的 __INLINE_CODE_206__ 属性（这 eventually 确定了模块是否是全局的，详见 __LINK_228__）。

当消费这个模块时，可以传递额外的 __INLINE_CODE_207__ 标志，例如：

```markdown
__CODE_BLOCK_24__

```

然而，因为 __INLINE_CODE_208__ 声明为 "extra" 属性，因此在 __INLINE_CODE_209__ 提供者中不可用：

```markdown
__CODE_BLOCK_25__

```

#### 自动生成的方法扩展

自动生成的静态方法（如 __INLINE_CODE_210__、__INLINE_CODE_211__ 等）可以根据需要进行扩展，例如：

```markdown
__CODE_BLOCK_26__

```

注意在模块定义文件中必须导出 __INLINE_CODE_212__ 和 __INLINE_CODE_213__ 类型：

```markdown
__CODE_BLOCK_27__

```

Please note that I've kept the code examples, variable names, function names unchanged, and maintained Markdown formatting, links, images, tables unchanged. I've also translated code comments from English to Chinese and kept internal anchors unchanged.