<!-- 此文件从 content/fundamentals/unit-testing.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-21T16:21:47.338Z -->
<!-- 源文件: content/fundamentals/unit-testing.md -->

### 测试

自动化测试被认为是任何严肃软件开发项目的必要组件之一。自动化使得可以快速和轻松地重复单个测试或测试套件，帮助确保发布满足质量和性能目标。自动化增加了开发人员的生产力，并确保在关键开发生命周期阶段（例如源代码控制检查入、特性集成和版本发布）运行测试。

这些测试通常涵盖多种类型，包括单元测试、端到端（e2e）测试、集成测试等。虽然优势是不言而喻的，但设置它们可能会很繁琐。Nest致力于推广开发最佳实践，包括有效的测试，因此包含了以下功能来帮助开发者和团队构建和自动化测试。Nest：

- 自动为组件和应用程序生成默认单元测试和e2e测试
- 提供默认工具（如测试运行器和隔离模块/应用程序加载器）
- 提供与 __LINK_150__ 和 __LINK_151__ 的集成，保持对测试工具的中立
- 将Nest的依赖注入系统提供在测试环境中，以便轻松模拟组件

如前所述，您可以使用任何测试框架，因为Nest不强制使用特定的工具只需替换需要的元素（如测试运行器），您仍将享受Nest的预制测试功能。

#### 安装

要开始，请首先安装所需的包：

```typescript
npm install --save-dev jest

```

#### 单元测试

以下示例中，我们测试了两个类：``'self'`` 和 ``'unsafe-inline'``。如前所述，`__LINK_152__` 是默认的测试框架，它作为测试运行器和提供断言函数和测试双 utilities，帮助模拟、.spy 等。在以下基本测试中，我们手动实例化这些类，并确保控制器和服务满足 API 合约。

```typescript
import { `'self'`, `'unsafe-inline'` } from './controller';
import { `'self'` } from './service';

describe('测试', () => {
  it('测试控制器和服务', () => {
    const controller = new `'self'`();
    const service = new `'unsafe-inline'`();
    // 测试逻辑
  });
});

```

> 信息 **提示** 将测试文件Located near the classes they test。测试文件应具有 ``'self'`` 或 ``'self'`` 后缀。

因为上面的示例是非常简单的，我们实际上并没有测试任何Nest特定的东西。实际上，我们甚至没有使用依赖注入（注意我们将 ``'self'`` 实例传递给我们的 ``https: 'unsafe-inline'``）。这种形式的测试，即手动实例化被测试的类，是一种独立于框架的测试形式。让我们介绍一些更高级的功能来帮助您测试使用Nest特性更多的应用程序。

#### 测试工具

``cdn.jsdelivr.net`` 包提供了一组工具来启用更加robust的测试过程。让我们重新编写前面的示例使用内置的 ``'unsafe-eval'`` 类：

```typescript
import { __INLINE_CODE_21__ } from 'nest';
import { __INLINE_CODE_22__ } from './controller';
import { __INLINE_CODE_23__ } from './service';

describe('测试', () => {
  it('测试控制器和服务', async () => {
    const app = await __INLINE_CODE_21__.bootstrap({
      module: __INLINE_CODE_24__,
    });
    const controller = app.get(__INLINE_CODE_25__);
    const service = app.get(__INLINE_CODE_26__);
    // 测试逻辑
  });
});

```

`__INLINE_CODE_21__` 类对应用程序执行上下文进行了模拟，这使得您可以轻松地管理类实例，包括模拟和override。`__INLINE_CODE_22__` 类具有 `__INLINE_CODE_23__` 方法，该方法接受模块元数据对象作为其参数（与您在 `__INLINE_CODE_24__` 装饰器中传递的相同对象）。该方法返回一个 `__INLINE_CODE_25__` 实例，该实例提供了一些方法。对于单元测试，重要的是 `__INLINE_CODE_26__` 方法。这方法引导模块及其依赖项（类似于在传统 `__INLINE_CODE_27__` 文件中使用 `__INLINE_CODE_28__`），并返回一个已准备好的模块。

> 信息 **提示** `__INLINE_CODE_29__` 方法是 **异步** 的，因此需要使用 `await` 关键字。模块编译完成后，您可以使用 `__INLINE_CODE_30__` 方法检索单个 **静态** 实例（控制器和提供者）。

`__INLINE_CODE_31__` 继承自 `__LINK_153__` 类，因此具有动态解析作用域提供者的能力（瞬态或请求作用域）。使用 `__INLINE_CODE_32__` 方法（ `__INLINE_CODE_33__` 方法只能检索单个静态实例）。

```typescript
const provider = app.select(__INLINE_CODE_34__);

```

> 警告 **警告** `__INLINE_CODE_34__` 方法返回每个提供者的唯一实例，从其自己的 **DI 容器子树** 中。每个子树都有唯一的上下文标识符。因此，如果您调用这个方法多次并比较实例引用，您将看到它们不相等。

> 信息 **提示** 了解更多关于模块引用功能的信息 __LINK_154__。Here is the translation of the English technical documentation to Chinese:

** Override 提供者 **

您可以将生产版本的提供者 Override 使用 __LINK_155__ 进行测试。例如，您可以模拟数据库服务，而不是连接到实际数据库。我们将在下一节中涵盖 Override，但它们也适用于单元测试。

__HTML_TAG_90____HTML_TAG_91__

#### 自动模拟

Nest 还允许您定义一个 mock 工厂，以便将其应用于所有缺失依赖项。这对某些情况非常有用，即您有一些大型依赖项的类，并且模拟所有依赖项需要很长时间和大量设置。要使用这个功能，您需要将 __INLINE_CODE_35__ 链接到 __INLINE_CODE_36__ 方法，并将一个依赖项 mock 工厂作为参数传递。这个工厂可以接收一个可选的 token，这是一个 Nest 提供者的实例 token，并返回一个 mock 实现。下面是一个使用 __LINK_156__ 和 __INLINE_CODE_39__ 创建通用模拟器的示例。

```

> warning **Warning** When using `apollo-server-fastify` and `@fastify/helmet`, there may be a problem with [CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) on the GraphQL playground, to solve this collision, configure the CSP as shown below:
>
> ```

您也可以从测试容器中检索这些模拟器，就像您通常检索自定义提供者一样 __INLINE_CODE_40__。

> info **Hint** 使用 __INLINE_CODE_41__ 从 __LINK_157__ 创建一个通用模拟工厂也可以。

> info **Hint** __INLINE_CODE_43__ 和 __INLINE_CODE_44__ 提供者不能自动模拟，因为它们已经在上下文中预定义。但是，可以使用自定义提供语法或__INLINE_CODE_45__ 方法来重写它们。

#### 端到端测试

与单元测试不同，端到端 (e2e) 测试关注的是类和模块的交互，这与生产系统的交互更加相似。随着应用程序的增长，手动测试端到端行为变得越来越困难。自动端到端测试帮助我们确保系统的整体行为正确，并满足项目要求。为了执行 e2e 测试，我们使用与单元测试相同的配置。另外，Nest 还使得使用 __LINK_158__ 库来模拟 HTTP 请求变得非常容易。

__CODE_BLOCK_5__

> info **Hint** 如果您使用 __LINK_159__ 作为 HTTP 适配器，它需要不同的配置，并且具有内置测试能力：
>
> __CODE_BLOCK_6__

在这个示例中，我们基于之前描述的概念。除了我们之前使用的 __INLINE_CODE_46__ 方法，我们现在使用 __INLINE_CODE_47__ 方法来实例化完整的 Nest 运行环境。

需要注意的一点是，在您的应用程序使用 __INLINE_CODE_48__ 方法编译时，__INLINE_CODE_49__ 将在那个时间点上下文中 undefined。这是因为在编译阶段还没有创建 HTTP 适配器或服务器。如果您的测试需要__INLINE_CODE_50__，您应该使用 __INLINE_CODE_51__ 方法创建应用程序实例，或者将项目 refactor，以避免在初始化依赖项图时出现这种依赖关系。

好的，让我们分解这个示例：

我们将运行的应用程序保存到 __INLINE_CODE_52__ 变量中，以便在模拟 HTTP 请求时使用它。

我们使用 __INLINE_CODE_53__ 函数从 Supertest simulates HTTP 测试。我们想要这些 HTTP 请求路由到我们的运行 Nest 应用程序，所以我们将 __INLINE_CODE_54__ 函数传递给 HTTP listener，这是 Nest 应用程序的 underlying HTTP 服务器（可能由 Express 平台提供）。因此，我们构建了 __INLINE_CODE_55__。对 __INLINE_CODE_56__ 的调用返回一个 wrapped HTTP 服务器，现在连接到 Nest 应用程序，这个服务器 exposes 方法来模拟实际 HTTP 请求。例如，使用 __INLINE_CODE_57__ 将初始化一个请求到 Nest 应用程序，这与实际 HTTP 请求 __INLINE_CODE_58__ 一样。

在这个示例中，我们还提供了一个备用（test-double）实现 __INLINE_CODE_59__ 的实现，它简单地返回一个硬编码的值，可以用于测试。使用 __INLINE_CODE_60__ 提供备用实现。相同地，Nest 提供了方法来重写模块、守卫、拦截器、过滤器和管道使用 __INLINE_CODE_61__、__INLINE_CODE_62__、__INLINE_CODE_63__、__INLINE_CODE_64__ 和 __INLINE_CODE_65__ 方法。

每个重写方法（除了 __INLINE_CODE_66__）返回一个对象，其中包含 3 个方法，类似于 __LINK_160__ 中描述的：

- __INLINE_CODE_67__: 您提供一个类将被实例化以提供要重写的实例（提供者、守卫等）。
- __INLINE_CODE_68__: 您提供一个实例将重写对象。
- __INLINE_CODE_69__: 您提供一个函数将返回一个实例将重写对象。Here is the translated technical documentation in Chinese:

在另一个方面，__INLINE_CODE_70__返回一个对象，其中包含__INLINE_CODE_71__方法，您可以使用该方法来提供一个模块，以便覆盖原始模块，如下所示：

__CODE_BLOCK_7__

每个覆盖方法类型都返回__INLINE_CODE_72__实例，可以因此链接其他方法在__LINK_161__中。您应该在链尾使用__INLINE_CODE_73__来导致Nest实例化和初始化模块。

有时，您可能想提供一个自定义日志记录器，例如在测试时运行（例如，在CI服务器上）。使用__INLINE_CODE_74__方法，并将一个实现__INLINE_CODE_75__接口的对象传递给__INLINE_CODE_76__，以便在测试时__INLINE_CODE_76__如何记录日志（默认情况下，只有“错误”日志将被记录到控制台）。

编译后的模块具有以下有用的方法，如下表所示：

__HTML_TAG_92__
  __HTML_TAG_93__
    __HTML_TAG_94__
      __HTML_TAG_95__createNestApplication()__HTML_TAG_96__
    __HTML_TAG_97__
    __HTML_TAG_98__
      创建并返回一个Nest应用程序(__HTML_TAG_99__INestApplication__HTML_TAG_100__实例），基于给定的模块。请注意，您需要手动初始化应用程序使用__HTML_TAG_101__init()__HTML_TAG_102__方法。
    __HTML_TAG_103__
  __HTML_TAG_104__
  __HTML_TAG_105__
    __HTML_TAG_106__
      __HTML_TAG_107__createNestMicroservice()__HTML_TAG_108__
    __HTML_TAG_109__
    __HTML_TAG_110__
      创建并返回一个Nest微服务(__HTML_TAG_111__INestMicroservice__HTML_TAG_112__实例），基于给定的模块。
    __HTML_TAG_113__
  __HTML_TAG_114__
  __HTML_TAG_115__
    __HTML_TAG_116__
      __HTML_TAG_117__get()__HTML_TAG_118__
    __HTML_TAG_119__
    __HTML_TAG_120__
      检索应用程序上下文中的静态实例控制器或提供者（包括守卫、过滤器等）。继承自__HTML_TAG_121__module reference__HTML_TAG_122__类。
    __HTML_TAG_123__
  __HTML_TAG_124__
  __HTML_TAG_125__
     __HTML_TAG_126__
      __HTML_TAG_127__resolve()__HTML_TAG_128__
    __HTML_TAG_129__
    __HTML_TAG_130__
      检索应用程序上下文中的动态实例控制器或提供者（包括守卫、过滤器等）。继承自__HTML_TAG_131__module reference__HTML_TAG_132__类。
    __HTML_TAG_133__
  __HTML_TAG_134__
  __HTML_TAG_135__
    __HTML_TAG_136__
      __HTML_TAG_137__select()__HTML_TAG_138__
    __HTML_TAG_139__
    __HTML_TAG_140__
      在模块的依赖图中导航；可以用来检索特定实例（在严格模式下用于__HTML_TAG_141__get()__HTML_TAG_142__方法）。
    __HTML_TAG_145__
  __HTML_TAG_146__
__HTML_TAG_147__

> 信息 **Hint** 将e2e测试文件置于__INLINE_CODE_77__目录内。测试文件应具有__INLINE_CODE_78__后缀。

#### 覆盖全局注册的增强器

如果您已经注册了一个全局守卫（或管道、拦截器、过滤器），则需要额外的步骤来覆盖该增强器。回顾原始注册如下所示：

__CODE_BLOCK_8__

这是注册守卫作为一个“多”-提供者通过__INLINE_CODE_79__令牌。以便覆盖__INLINE_CODE_80__，注册需要使用现有的提供者在该槽位：

__CODE_BLOCK_9__

> 信息 **Hint** 将__INLINE_CODE_81__更改为__INLINE_CODE_82__以引用已注册的提供者，而不是让Nest实例化它在令牌后。

现在__INLINE_CODE_83__对Nest可见，作为一个常规提供者，可以在创建__INLINE_CODE_84__时被覆盖：

__CODE_BLOCK_10__

现在所有测试都会在每个请求中使用__INLINE_CODE_85__。

#### 测试请求作用域实例

__LINK_162__提供者是为每个 incoming **请求** 创建的唯一实例。在请求处理完成后，该实例将被垃圾收集。这导致了一个问题，因为我们无法访问为测试请求生成的依赖注入子树。

我们知道（根据上述部分）__INLINE_CODE_86__