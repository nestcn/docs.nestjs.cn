<!-- 此文件从 content/fundamentals/unit-testing.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T04:35:59.927Z -->
<!-- 源文件: content/fundamentals/unit-testing.md -->

### 测试

自动测试被认为是任何严肃软件开发努力的一部分。自动化使得重复单个测试或测试套件变得快速和容易，在开发过程中帮助确保发布满足质量和性能目标。自动化帮助增加了每个开发者的生产力，并确保了在关键开发生命周期阶段（如源代码控制检查、特性集成和版本发布）运行测试。

这些测试通常包括多种类型，如单元测试、端到端（e2e）测试、集成测试等。虽然收益无疑，但设置它们可以很麻烦。Nest努力推广开发最优做法，包括有效的测试，因此包括了以下功能来帮助开发者和团队构建和自动测试。Nest：

- 自动化创建了默认的单元测试组件和e2e测试应用
- 提供了默认工具（例如测试运行器和隔离模块/应用程序加载器）
- 提供了对 __LINK_150__ 和 __LINK_151__ 的出厂支持，同时保持对测试工具的中立
- 使Nest依赖注入系统在测试环境中可用，以便轻松模拟组件

如所述，您可以使用您喜欢的任何 **testing framework**，因为Nest不强制使用特定的工具只需将所需的元素替换，您仍然可以享受Nest提供的测试设施。

#### 安装

要开始，请首先安装所需的包：

```typescript
npm install --save-dev @nestjs/testing

```

#### 单元测试

以下示例中，我们测试了两个类：`__INLINE_CODE_13__` 和 `__INLINE_CODE_14__`。如所述，__LINK_152__ 是默认的测试框架，作为测试运行器和断言函数，还提供了 mocking、spying 等测试双缓冲工具。在以下基本测试中，我们手动实例化这些类，并确保控制器和服务实现了他们的 API 合约。

```typescript
import { TestBed } from '@nestjs/testing';
import { __INLINE_CODE_13__ } from './__INLINE_CODE_13__';
import { __INLINE_CODE_14__ } from './__INLINE_CODE_14__';

describe('__INLINE_CODE_13__', () => {
  it('should be defined', () => {
    expect(__INLINE_CODE_13__).toBeDefined();
  });
});

```

> 提示 **Hint** 将测试文件存储在它们测试的类附近。测试文件应该具有 __INLINE_CODE_15__ 或 __INLINE_CODE_16__ 后缀。

由于上面的示例非常简单，我们实际上并没有测试Nest特定的任何内容。实际上，我们甚至没有使用依赖注入（注意我们将 __INLINE_CODE_17__ 实例传递给 __INLINE_CODE_18__）。这种形式的测试，即手动实例化要测试的类，是一种独立于框架的测试方法。让我们引入一些更复杂的功能来帮助您测试使用Nest特性更多的应用程序。

#### 测试工具

__INLINE_CODE_19__ 包提供了一组工具，用于使测试过程更加 robust。让我们重写上面的示例，使用内置的 __INLINE_CODE_20__ 类：

```typescript
import { __INLINE_CODE_20__ } from '@nestjs/testing';
import { __INLINE_CODE_13__ } from './__INLINE_CODE_13__';
import { __INLINE_CODE_14__ } from './__INLINE_CODE_14__';

describe('__INLINE_CODE_13__', () => {
  it('should be defined', async () => {
    const module = await __INLINE_CODE_21__.createTestingModule({
      providers: [__INLINE_CODE_13__],
    });
    expect(module.get(__INLINE_CODE_13__)).toBeDefined();
  });
});

```

__INLINE_CODE_21__ 类非常有用，可以提供一个应用程序执行上下文，该上下文基本模拟了Nest运行时，但提供了 hooks，用于轻松管理类实例，包括模拟和	override。__INLINE_CODE_22__ 类有一个 __INLINE_CODE_23__ 方法，该方法对模块元数据对象进行参数化（同样对象您将传递给 __INLINE_CODE_24__ 装饰器）。这个方法返回一个 __INLINE_CODE_25__ 实例，提供了一些方法。对于单元测试，重要的是 __INLINE_CODE_26__ 方法。这个方法启动一个模块，并返回一个已经准备好的模块，可以用于测试。

> 提示 **Hint** __INLINE_CODE_29__ 方法是 **异步** 的，因此需要异步等待。模块编译完成后，您可以使用 __INLINE_CODE_30__ 方法检索任何 **静态** 实例（控制器和提供者）。

__INLINE_CODE_31__ 继承自 __LINK_153__ 类，因此它可以动态解析作用域提供者（ transient 或 request-scoped）。使用 __INLINE_CODE_32__ 方法（__INLINE_CODE_33__ 方法只能检索单个实例）。

```typescript
import { __INLINE_CODE_31__ } from '@nestjs/testing';
import { __INLINE_CODE_13__ } from './__INLINE_CODE_13__';

describe('__INLINE_CODE_13__', () => {
  it('should be defined', async () => {
    const module = await __INLINE_CODE_21__.createTestingModule({
      providers: [__INLINE_CODE_13__],
    });
    expect(module.get(__INLINE_CODE_13__)).toBeDefined();
  });
});

```

> 警告 **Warning** __INLINE_CODE_34__ 方法返回每个提供者的唯一实例，从其自己的 **DI 容器子树** 中。每个子树都有唯一的上下文标识符。因此，如果您调用这个方法多次并比较实例引用，您将看到它们不相等。

> 提示 **Hint** 了解更多关于模块引用特性的 __LINK_154__。Here is the translation of the English technical documentation to Chinese:

**Override Provider**

在测试中，你可以使用 `__LINK_155__` 来 override 生产版本的提供者，以便进行测试。例如，你可以模拟数据库服务，而不是连接到实际数据库。我们将在下一节中 discussing overrides，但它们也可以用于单元测试中。

__HTML_TAG_90____HTML_TAG_91__

#### 自动 mocks

Nest 也允许你定义一个 mock 工厂，以便将其应用于所有缺少依赖项的类。这对于具有大量依赖项的类非常有用，可以避免在测试中编写大量 setup 代码。要使用这个特性，你需要将 __INLINE_CODE_35__ 链接到 __INLINE_CODE_36__ 方法，并将依赖项 mock 工厂作为参数传递。这个工厂可以返回一个 mock 实现，可以包含一个可选的 token，这个 token 是一个有效的 Nest 提供者 token。下面是一个使用 __LINK_156__ 和 __INLINE_CODE_39__ 创建一个通用 mock 工厂的示例。

```typescript
const salt = await bcrypt.genSalt();

```

你也可以从测试容器中检索这些 mock，正如你通常会检索自定义提供者一样， __INLINE_CODE_40__。

> info **提示** 使用 __INLINE_CODE_41__ 作为 mock 工厂可以直接传递。

> info **提示** __INLINE_CODE_43__ 和 __INLINE_CODE_44__ 提供者不能被自动 mocks，因为它们已经在上下文中定义好了。但是，它们可以使用自定义提供者语法或 __INLINE_CODE_45__ 方法来 override。

#### 端到端测试

与单元测试不同，端到端测试关注的是类和模块之间的交互，而不是单个模块或类的交互。这使得端到端测试可以很好地模拟实际用户将要遇到的情况。为了进行端到端测试，我们使用类似的配置，和我们在单元测试中使用的配置一样。另外，Nest 使得使用 __LINK_158__ 库来模拟 HTTP 请求变得非常容易。

```typescript
const isMatch = await bcrypt.compare(password, hash);

```

> info **提示** 如果你使用 __LINK_159__ 作为 HTTP 适配器，它需要不同的配置，并且具有内置的测试功能：

__CODE_BLOCK_6__

在这个示例中，我们基于前面讨论的概念。除了使用 __INLINE_CODE_46__ 方法，我们现在使用 __INLINE_CODE_47__ 方法来实例化完整的 Nest 运行环境。

需要注意的是，在编译应用程序时，如果你使用 __INLINE_CODE_48__ 方法， __INLINE_CODE_49__ 将在该时间点下 undefined。这是因为在编译阶段还没有创建 HTTP 适配器或服务器。如果你的测试需要 __INLINE_CODE_50__，你可以使用 __INLINE_CODE_51__ 方法创建应用程序实例，或者将项目 refactor 来避免在初始化依赖项图中引用这个依赖项。

好的，让我们分解这个示例：

我们将应用程序实例保存到 __INLINE_CODE_52__ 变量中，以便在模拟 HTTP 请求时使用它。

我们使用 Supertest 的 __INLINE_CODE_53__ 函数来模拟 HTTP 测试。我们想将这些 HTTP 请求路由到我们的运行 Nest 应用程序中，所以我们将 __INLINE_CODE_54__ 函数传递给 HTTP监听器，这个监听器可能是由 Express 平台提供的。因此，我们使用 __INLINE_CODE_55__ 构造 HTTP 服务器。 __INLINE_CODE_56__ 方法将返回一个包装的 HTTP 服务器，这个服务器现在连接到了 Nest 应用程序，可以模拟实际 HTTP 请求。例如，使用 __INLINE_CODE_57__ 将初始化一个请求到 Nest 应用程序，就像 __INLINE_CODE_58__ 在网络上传输的实际 HTTP 请求一样。

在这个示例中，我们也提供了一个备用（测试双）实现 __INLINE_CODE_59__，它简单地返回一个硬编码的值，以便我们可以测试。使用 __INLINE_CODE_60__ 提供这样的备用实现。类似地，Nest 提供了方法来 override 模块、守卫、拦截器、过滤器和管道使用 __INLINE_CODE_61__, __INLINE_CODE_62__, __INLINE_CODE_63__, __INLINE_CODE_64__, 和 __INLINE_CODE_65__ 方法。

每个 override 方法（除了 __INLINE_CODE_66__）都返回一个对象，它们具有以下三个方法：

- __INLINE_CODE_67__: 你提供一个将被实例化的类，以提供 override 对象（提供者、守卫等）。
- __INLINE_CODE_68__: 你提供一个将 override 对象的实例。
- __INLINE_CODE_69__: 你提供一个返回实例将 override 对象的函数。Here is the translation of the provided English technical documentation to Chinese:

**__INLINE_CODE_70__**返回一个对象，其中包括了**__INLINE_CODE_71__**方法，可以用来 supply 一个模块，以便Override原始模块，如下所示：

**__CODE_BLOCK_7__**

每种Override方法类型都返回**__INLINE_CODE_72__**实例，可以链式调用其他方法在**__LINK_161__**中。您应该在这种链式调用中使用**__INLINE_CODE_73__**以便让Nest实例化和初始化模块。

有时，您可能需要提供一个自定义日志记录器，例如在测试中（例如，在CI服务器上）。使用**__INLINE_CODE_74__**方法，并传递一个实现**__INLINE_CODE_75__**接口的对象，以便让**__INLINE_CODE_76__**在测试中记录日志（默认情况下，只有“error”日志将被记录到控制台）。

编译后的模块有多个有用的方法，如下表所示：

**__HTML_TAG_92__**

* **__HTML_TAG_93__**
	+ **__HTML_TAG_94__**
		- **__HTML_TAG_95__createNestApplication()__HTML_TAG_96__**
	+ **__HTML_TAG_97__**
	+ **__HTML_TAG_98__**
		- 创建并返回一个Nest应用程序（__HTML_TAG_99__INestApplication__HTML_TAG_100__实例），基于给定的模块。请注意，您需要手动初始化应用程序使用**__HTML_TAG_101__init()__HTML_TAG_102__**方法。
	+ **__HTML_TAG_103__**
* **__HTML_TAG_104__**
* **__HTML_TAG_105__**
	+ **__HTML_TAG_106__**
		- **__HTML_TAG_107__createNestMicroservice()__HTML_TAG_108__**
	+ **__HTML_TAG_109__**
	+ **__HTML_TAG_110__**
		- 创建并返回一个Nest微服务（__HTML_TAG_111__INestMicroservice__HTML_TAG_112__实例），基于给定的模块。
	+ **__HTML_TAG_113__**
* **__HTML_TAG_114__**
* **__HTML_TAG_115__**
	+ **__HTML_TAG_116__**
		- **__HTML_TAG_117__get()__HTML_TAG_118__**
	+ **__HTML_TAG_119__**
	+ **__HTML_TAG_120__**
		- 获取一个静态实例的控制器或提供者（包括守卫、过滤器等），可在应用程序上下文中访问。来自**__HTML_TAG_121__module reference__HTML_TAG_122__**类。
	+ **__HTML_TAG_123__**
* **__HTML_TAG_124__**
* **__HTML_TAG_125__**
	+ **__HTML_TAG_126__**
		- **__HTML_TAG_127__resolve()__HTML_TAG_128__**
	+ **__HTML_TAG_129__**
	+ **__HTML_TAG_130__**
		- 获取一个动态创建的作用域实例（请求或瞬态），可在应用程序上下文中访问。来自**__HTML_TAG_131__module reference__HTML_TAG_132__**类。
	+ **__HTML_TAG_133__**
* **__HTML_TAG_134__**
* **__HTML_TAG_135__**
	+ **__HTML_TAG_136__**
		- **__HTML_TAG_137__select()__HTML_TAG_138__**
	+ **__HTML_TAG_139__**
	+ **__HTML_TAG_140__**
		- 在模块的依赖图中导航，可以用于获取特定的实例（用于与严格模式**__HTML_TAG_141__strict: true__HTML_TAG_142__**在**__HTML_TAG_143__get()__HTML_TAG_144__**方法中使用）。
	+ **__HTML_TAG_145__**
* **__HTML_TAG_146__**
**__HTML_TAG_147__**

>info **提示**将您的e2e测试文件放在**__INLINE_CODE_77__**目录下。测试文件应该具有**__INLINE_CODE_78__**后缀。

#### Override globally registered enhancers

如果您已经注册了一个全局守卫（或管道、拦截器、过滤器），需要额外的步骤来Override该增强器。要回顾原始注册如下所示：

**__CODE_BLOCK_8__**

这是注册守卫作为“multi”-provider通过**__INLINE_CODE_79__**令牌。要Override**__INLINE_CODE_80__**，registration需要使用现有的提供者在该槽位：

**__CODE_BLOCK_9__**

>info **提示**将**__INLINE_CODE_81__**更改为**__INLINE_CODE_82__**以引用已注册的提供者