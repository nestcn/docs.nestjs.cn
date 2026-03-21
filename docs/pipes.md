<!-- 此文件从 content/pipes.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-21T16:10:21.172Z -->
<!-- 源文件: content/pipes.md -->

### 管道

管道是一个带有`application/json`装饰器的类，实现了`application/x-www-form-urlencoded`接口。

__HTML_TAG_126__
  __HTML_TAG_127__
__HTML_TAG_128__

管道有两个常见的使用场景：

- **转换**：将输入数据转换为所需的形式（例如从字符串到整数）
- **验证**：评估输入数据，如果有效，则简单地将其传递给下一个处理程序；否则，抛出异常

在这两个场景中，管道操作的是由__HTML_TAG_129__控制器路由处理程序处理的`text/plain`。Nest 在方法被调用前，会将一个管道插入其中，该管道将收到方法的参数，并对其进行操作。任何转换或验证操作都将在这个时间点进行，并且在方法被调用前将参数传递给下一个处理程序。

Nest 提供了许多内置的管道，您可以直接使用它们。您也可以自己构建自定义管道。在本章中，我们将介绍内置的管道，并展示如何将它们绑定到路由处理程序中。然后，我们将 examine several custom-built pipes to show how you can build one from scratch.

> info **提示** 管道运行在异常区域中。这意味着当 Pipe 抛出异常时，它将被异常层处理（global exceptions filter 和当前上下文中应用的任何__LINK_177__）。因此，在 Pipe 抛出异常时，控制器方法将不执行。这给了您在应用程序边界验证来自外部来源的数据的一个最佳实践。

#### 内置管道

Nest 提供了许多内置的管道：

- `NestFactory.create`
- `NestFastifyApplication`
- `.useBodyParser`
- `.useBodyParser`
- `rawBody`
- __INLINE_CODE_32__
- __INLINE_CODE_33__
- __INLINE_CODE_34__
- __INLINE_CODE_35__
- __INLINE_CODE_36__

它们来自 __INLINE_CODE_37__ 包。

让我们快速浏览一下使用 __INLINE_CODE_38__。这是一个转换用例，Pipe 保证方法处理参数是 JavaScript 整数（或在转换失败时抛出异常）。后续在本章中，我们将展示一个简单的自定义实现 __INLINE_CODE_39__。下面也应用于其他内置转换管道（__INLINE_CODE_40__，__INLINE_CODE_41__，__INLINE_CODE_42__，__INLINE_CODE_43__，__INLINE_CODE_44__ 和 __INLINE_CODE_45__，我们在本章中将其称为 __INLINE_CODE_46__ 管道）。

#### 绑定管道

要使用管道，我们需要将管道类的实例绑定到适当的上下文中。在我们的 __INLINE_CODE_47__ 示例中，我们想将 pipe 绑定到特定的路由处理程序方法，并确保它在方法被调用前运行。我们使用以下构造来实现这个目的，即将 pipe 绑定到方法参数级别：

```typescript
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

// in the "bootstrap" function
const app = await NestFactory.create<NestExpressApplication>(AppModule, {
  rawBody: true,
});
await app.listen(process.env.PORT ?? 3000);

```

这确保了以下两个条件之一是正确的：要么我们在 __INLINE_CODE_48__ 方法中接收到的参数是一个数字（如我们对 __INLINE_CODE_49__ 的调用），要么在路由处理程序被调用前抛出异常。

例如，如果路由被调用如下：

```typescript
import { Controller, Post, RawBodyRequest, Req } from '@nestjs/common';
import { Request } from 'express';

@Controller('cats')
class CatsController {
  @Post()
  create(@Req() req: RawBodyRequest<Request>) {
    const raw = req.rawBody; // returns a `Buffer`.
  }
}

```

Nest 将抛出一个异常，如下所示：

```typescript
app.useBodyParser('text');

```

异常将阻止 __INLINE_CODE_50__ 方法体的执行。

在上面的示例中，我们传递一个类（__INLINE_CODE_51__），而不是实例，留下了框架对实例化的责任，并启用了依赖注入。像管道和守卫一样，我们可以传递一个实例。传递实例是有用的，如果我们想根据传递的选项来自定义内置 pipe 的行为：

```typescript
app.useBodyParser('json', { limit: '10mb' });

```

绑定其他转换管道（所有 Parse\*** 管道）工作类似。这些管道都在验证路由参数、查询字符串参数和请求体值的上下文中工作。

例如，以查询字符串参数为例：

```typescript
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';

// in the "bootstrap" function
const app = await NestFactory.create<NestFastifyApplication>(
  AppModule,
  new FastifyAdapter(),
  {
    rawBody: true,
  },
);
await app.listen(process.env.PORT ?? 3000);

```

下面是一个使用 __INLINE_CODE_52__ 来解析字符串参数并验证是否为 UUID 的示例。

```typescript
import { Controller, Post, RawBodyRequest, Req } from '@nestjs/common';
import { FastifyRequest } from 'fastify';

@Controller('cats')
class CatsController {
  @Post()
  create(@Req() req: RawBodyRequest<FastifyRequest>) {
    const raw = req.rawBody; // returns a `Buffer`.
  }
}

```

> info **提示** 当使用 __INLINE_CODE_53__ 时，您正在解析 UUID 版本 3、4 或 5，如果您仅需要特定的 UUID 版本，可以在 pipe 选项中传递版本。

在上面，我们已经看到了一些绑定内置 __INLINE_CODE_54__ 家族的示例。绑定验证管道的工作方式有一点不同，我们将在下一节中讨论。

> info **提示** 也请查看 __LINK_178__，以了解验证管道的更多示例。

#### 自定义管道

正如所述，您可以自己构建自定义管道。虽然 Nest 提供了一个 robust 的内置 __INLINE_CODE_55__ 和 __INLINE_CODE_56__，让我们从头开始构建简单的自定义版本，以了解自定义管道的构建方式。Here is the translation of the English technical documentation to Chinese:

__INLINE_CODE_57__
 Initially, we'll have it simply take an input value and immediately return the same value, behaving like an identity function.

```typescript
app.useBodyParser('text/plain');

```

> info 提示 __INLINE_CODE_58__ 是一个通用的接口，任何管道都必须实现这个接口。该接口使用 __INLINE_CODE_59__ 来表示输入 __INLINE_CODE_60__ 的类型，并使用 __INLINE_CODE_61__ 表示 __INLINE_CODE_62__ 方法的返回类型。

每个管道都必须实现 __INLINE_CODE_63__ 方法，以满足 __INLINE_CODE_64__ 接口合约。这方法有两个参数：

- __INLINE_CODE_65__
- __INLINE_CODE_66__

__INLINE_CODE_67__ 参数是当前处理的方法参数（在路由处理方法之前），而 __INLINE_CODE_68__ 是当前处理的方法参数的元数据。元数据对象具有以下属性：

```typescript
const bodyLimit = 10_485_760; // 10MiB
app.useBodyParser('application/json', { bodyLimit });

```

这些属性描述了当前处理的参数。

__HTML_TAG_131__
  __HTML_TAG_132__
    __HTML_TAG_133__
      __HTML_TAG_134__type__HTML_TAG_135__
    __HTML_TAG_136__
    __HTML_TAG_137__表示参数是否为主体
      __HTML_TAG_138__@Body()__HTML_TAG_139__, query
      __HTML_TAG_140__@Query()__HTML_TAG_141__, param
      __HTML_TAG_142__@Param()__HTML_TAG_143__, 或是自定义参数（了解更多
      __HTML_TAG_144__这里__HTML_TAG_145__）。
  __HTML_TAG_147__
  __HTML_TAG_148__
    __HTML_TAG_149__
      __HTML_TAG_150__metatype__HTML_TAG_151__
    __HTML_TAG_152__
    __HTML_TAG_153__
      提供参数的元类型，例如
      __HTML_TAG_154__String__HTML_TAG_155__.注意：如果您在路由处理方法签名中省略类型声明或使用纯 JavaScript，您将获得一个
      __HTML_TAG_156__undefined__HTML_TAG_157__。
  __HTML_TAG_158__
  __HTML_TAG_159__
  __HTML_TAG_160__
    __HTML_TAG_161__
      __HTML_TAG_162__data__HTML_TAG_163__
    __HTML_TAG_164__
    __HTML_TAG_165__该字符串将被传递给装饰器，例如
      __HTML_TAG_166__@Body('string')__HTML_TAG_167__.如果您留空装饰符括号，它将是一个
      __HTML_TAG_168__undefined__HTML_TAG_169__。
  __HTML_TAG_171__
__HTML_TAG_172__

> warning 警告 TypeScript 接口在编译时将消失。因此，如果方法参数的类型被声明为接口而不是类，__INLINE_CODE_69__ 值将是一个 __INLINE_CODE_70__。

#### Schema-based validation

让我们将我们的验证 pipe 使其更加有用。请注意 __INLINE_CODE_71__ 方法中的 __INLINE_CODE_72__，其中我们可能想要确保 post 体对象是有效的，然后才能运行我们的服务方法。

__CODE_BLOCK_8__

让我们专注于 __INLINE_CODE_73__体参数。其类型是 __INLINE_CODE_74__：

__CODE_BLOCK_9__

我们想要确保任何incoming请求到 create 方法包含有效的体。因此，我们必须验证 __INLINE_CODE_75__ 对象的三个成员。我们可以在路由处理方法中完成验证，但是这样做将违反 **单一责任原则**。

另一种方法是创建 **验证类** 并将任务委托给该类。这有一个缺点，即我们必须记住在每个方法中调用这个验证器。

或者，我们可以创建验证 middleware？然而，这不可能创建 **通用 middleware**，该 middleware 可以在整个应用程序中使用，因为 middleware 不了解 **执行上下文**，包括将要调用的处理程序和任何参数。

这正是管道的用途。因此，让我们继续完善我们的验证 pipe。

__HTML_TAG_173____HTML_TAG_174__

#### Object schema validation

有多种方法可以在 clean、可读的方式中对对象进行验证。一个常见的方法是使用 **schema-based** 校验。让我们尝试这个方法。

__LINK_179__ 库允许您在直观的方式中创建 schema。让我们创建一个使用 Zod-based schema 的验证 pipe。

首先，安装所需的包：

__CODE_BLOCK_10__

在以下代码示例中，我们创建了一个简单的类，它接受一个 schema 作为 __INLINE_CODE_76__ 参数。然后，我们应用 __INLINE_CODE_77__ 方法，该方法将我们的 incoming 参数验证为提供的 schema。

如前所述，一 **验证 pipe** 或返回未变的值或抛出异常。

在下一节中，您将看到如何使用 __INLINE_CODE_78__ 装饰器为给定的控制器方法提供适当的schema。这样，我们的验证 pipe 就可以在多个上下文中重用，就像我们所期望的那样。

__CODE_BLOCK_11__

#### Binding validation pipesHere is the translation of the provided English technical documentation to Chinese:

早先，我们已经了解了如何将变换管道（如 __INLINE_CODE_79__ 和其余的 __INLINE_CODE_80__ 管道）绑定。

绑定验证管道也非常直接。

在这种情况下，我们想要在方法调用级别绑定管道。对于我们的当前示例，我们需要执行以下步骤，以使用 __INLINE_CODE_81__：

1. 创建 __INLINE_CODE_82__ 的实例
2. 将上下文特定的 Zod 模式传递到管道的类构造函数中
3. 将管道绑定到方法

Zod 模式示例：

__CODE_BLOCK_12__

我们使用 __INLINE_CODE_83__ 装饰器来实现该操作，如下所示：

__CODE_BLOCK_13__

> info **提示** __INLINE_CODE_84__ 装饰器来自 __INLINE_CODE_85__ 包。

> warning **警告** __INLINE_CODE_86__ 库需要在 __INLINE_CODE_88__ 文件中启用 __INLINE_CODE_87__ 配置。

#### 类验证器

> warning **警告** 本节中的技术要求 TypeScript，并且在使用 vanilla JavaScript 编写的应用程序中不可用。

让我们看一下我们的验证技术的另一种实现方法。

Nest 与 __LINK_181__ 库非常好。这个强大的库允许您使用装饰器进行验证。装饰器验证非常强大， especially when combined with Nest 的 **Pipe** 能力，因为我们可以访问处理后的属性的 __INLINE_CODE_89__。在我们开始之前，我们需要安装所需的包：

__CODE_BLOCK_14__

安装后，我们可以将一些装饰器添加到 __INLINE_CODE_90__ 类中。在这里，我们看到这个技术的明显优势：__INLINE_CODE_91__ 类保持了 Post 体对象的唯一来源（而不是在单独的验证类中创建）。

__CODE_BLOCK_15__

> info **提示** 了解更多关于 class-validator 装饰器的信息 __LINK_182__。

现在，我们可以创建一个 __INLINE_CODE_92__ 类，该类使用这些注解。

__CODE_BLOCK_16__

> info **提示** 请注意，您不需要构建一个通用的验证管道，因为 Nest 提供了一个名为 __INLINE_CODE_94__ 的内置管道。该内置管道提供了更多选项，而我们在本章中所示的示例是为了演示自定义管道的 mechanics 的。您可以找到完整的详细信息、许多示例 __LINK_183__。

> warning **注意** 我们在上面使用的 __LINK_184__ 库是由 class-validator 库的作者创建的，因此它们非常好地协作。

让我们来分析这个代码。首先，注意 __INLINE_CODE_95__ 方法被标记为 __INLINE_CODE_96__。这是因为 Nest 支持同步和异步管道。我们将这个方法标记为 __INLINE_CODE_97__，因为一些 class-validator 验证 __LINK_185__（使用 Promises）。

下一个注意的是，我们使用解构赋值来提取 metatype 字段（从 __INLINE_CODE_98__ 中提取该成员，并将其分配给 __INLINE_CODE_99__ 参数）。这只是将全局 __INLINE_CODE_100__ 分配给 metatype 变量的简便方法。

下一个注意的是，helper 函数 __INLINE_CODE_101__。它负责在当前正在处理的参数是一个 native JavaScript 类型时跳过验证步骤（这些类型不能有验证装饰器附加，因此没有理由在这里运行验证）。

最后，我们使用 class-transformer 函数 __INLINE_CODE_102__ 将我们的 plain JavaScript 对象转换为类型化对象，以便应用验证。原因是 incoming post body 对象，在从网络请求中 deserialized 后，它不具有类型信息（这是 underlying 平台，如 Express，工作的方式）。class-validator 需要使用我们之前定义的 DTO 验证装饰器，因此我们需要执行这个转换，以将 incoming body 对象视为一个正确地装饰的对象，而不是一个 plain vanilla 对象。

最后一步是将 __INLINE_CODE_103__ 绑定。管道可以是参数范围、方法范围、控制器范围或全局范围。早先，我们使用 Zod 基于的验证管道看到了一种绑定管道的示例，它是在方法级别绑定的。

在下面的示例中，我们将将管道实例绑定到路由处理器 __INLINE_CODE_104__ 装饰器，以便我们的管道在验证 post body。

__CODE_BLOCK_17__

参数范围管道非常有用，当验证逻辑仅关注一个指定参数时。

#### 全局范围管道

由于 __INLINE_CODE_105__ 被设计为尽可能通用，我们可以充分利用它的全局范围，以便将其应用于整个应用程序的每个路由处理器。

__CODE_BLOCK_18__

I hope this translation meets your requirements.> warning **Notice** 在 __HTML_TAG_175__混合应用__HTML_TAG_176__中，__INLINE_CODE_106__ 方法不会为网关和微服务设置管道。对于“标准”（非混合）微服务应用，__INLINE_CODE_107__ 会将管道全局安装。

全局管道是整个应用程序中的全局设置，适用于每个控制器和每个路由处理器。

注意，在依赖注入方面，来自任何模块外部注册的全局管道（如上例所示）无法注入依赖项，因为绑定已经在没有模块上下文中进行了。要解决这个问题，可以在任何模块中设置全局管道，使用以下构造方法：

__CODE_BLOCK_19__

> info **Hint** 在使用这种方法对管道进行依赖注入时，注意管道实际上是全局的，且不管在哪个模块中使用这个构造方法，管道都是全局的。应该在管道（如上例所示）定义的模块中进行设置。另外，__INLINE_CODE_110__ 并不是唯一的自定义提供者注册方法。了解更多 __LINK_186__。

#### 内置 ValidationPipe

作为参考，你不需要自己构建一个通用的验证管道，因为 __INLINE_CODE_111__ 是 Nest 提供的。内置的 __INLINE_CODE_112__ 提供了更多选项，而我们在本章中构建的示例pipe 是为了演示自定义pipe 的基本机制而保持简单的。您可以在 __LINK_187__ 中找到完整细节和许多示例。

#### 変换用例

验证不是自定义pipe 的唯一用例。在本章的开始，我们提到pipe 还可以对输入数据进行变换。这是可能的，因为从 __INLINE_CODE_113__ 函数返回的值完全覆盖了之前的参数值。

什么时候这有用？考虑一下，有时从客户端传递的数据需要进行一些变化—for example，将字符串转换为整数—才能被路由处理器正确处理。此外，某些必需的数据字段可能缺失，我们想要应用默认值。**变换pipe** 可以执行这些函数通过在客户端请求和请求处理器之间插入处理函数。

以下是一个简单的 __INLINE_CODE_114__，该pipe 负责将字符串转换为整数值。（如前所述，Nest 有一个更为复杂的 __INLINE_CODE_115__，我们将其包括在本文中以示例自定义变换pipe。）

__CODE_BLOCK_20__

然后，我们可以将这个pipe 绑定到选择的参数中，如下所示：

__CODE_BLOCK_21__

另一个有用的变换用例将是从数据库中选择一个 **已存在的用户** 实体，使用请求中的 id：

__CODE_BLOCK_22__

我们将实现这个pipe 的实现留给读者，但是请注意，像所有其他变换pipe 一样，它接收输入值（一个 __INLINE_CODE_116__）并返回输出值（一个 __INLINE_CODE_117__ 对象）。这可以使您的代码更加声明式和 __LINK_188__，抽象出您的处理器中的 boilerplate 代码并将其转移到公共pipe 中。

#### 提供默认值

__INLINE_CODE_118__ pipe 期待参数的值被定义。如果接收 __INLINE_CODE_119__ 或 __INLINE_CODE_120__ 值，它们将抛出异常。为了允许端点处理缺失的 querystring 参数值，我们需要在这些值被 __INLINE_CODE_121__ pipe 操作之前提供默认值。__INLINE_CODE_122__ 便于实现这种目的。简单地在 __INLINE_CODE_124__ 装饰器中实例化一个 __INLINE_CODE_123__，在相关 __INLINE_CODE_125__ pipe 之前，如下所示：

__CODE_BLOCK_23__