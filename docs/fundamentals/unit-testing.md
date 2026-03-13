<!-- 此文件从 content/fundamentals/unit-testing.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:38:52.363Z -->
<!-- 源文件: content/fundamentals/unit-testing.md -->

### 测试

任何严肃的软件开发努力都认为自动测试是必要的一部分。自动化使得可以快速和轻松地重复单个测试或测试套件，这有助于确保发布满足质量和性能目标。自动化提高了开发者个人的生产力，并确保测试在关键开发生命周期阶段，如源代码控制检查入、特性集成和版本发布时运行。

通常，这些测试涵盖了多种类型，包括单元测试、end-to-end (e2e) 测试、集成测试等。虽然benefits 是无可争辩的，但设置它们可以是繁琐的。Nest旨在推广开发最佳实践，包括有效的测试，因此包括以下功能来帮助开发者和团队构建和自动化测试。Nest：

- 自动化组件和应用程序的默认单元测试和e2e测试
- 提供默认工具（例如测试运行器，构建独立模块/应用程序加载器）
- 提供与 __LINK_150__ 和 __LINK_151__ 的集成，保持agnostic 到测试工具
- 将Nest 依赖注入系统提供在测试环境中，以便轻松地模拟组件

正如所提到的，你可以使用任何 **testing framework**，因为Nest不强制使用特定的工具。简单地替换所需的元素（例如测试运行器），你仍然可以享受Nest的ready-made 测试设施。

#### 安装

要开始，请首先安装所需的包：

```typescript
import { createCipheriv, randomBytes, scrypt } from 'node:crypto';
import { promisify } from 'node:util';

const iv = randomBytes(16);
const password = 'Password used to generate key';

// The key length is dependent on the algorithm.
// In this case for aes256, it is 32 bytes.
const key = (await promisify(scrypt)(password, 'salt', 32)) as Buffer;
const cipher = createCipheriv('aes-256-ctr', key, iv);

const textToEncrypt = 'Nest';
const encryptedText = Buffer.concat([
  cipher.update(textToEncrypt),
  cipher.final(),
]);

```

#### 单元测试

以下示例中，我们测试两个类：__INLINE_CODE_13__ 和 __INLINE_CODE_14__。正如所提到的，__LINK_152__ 作为默认的测试框架，提供测试运行器和断言函数，以及mocking、spying 等测试双 utility。以下基本测试中，我们手动实例化这些类，并确保控制器和服务满足 API 合约。

```typescript
import { createDecipheriv } from 'node:crypto';

const decipher = createDecipheriv('aes-256-ctr', key, iv);
const decryptedText = Buffer.concat([
  decipher.update(encryptedText),
  decipher.final(),
]);

```

> info **提示** 请将您的测试文件与它们测试的类保持在一起。测试文件应该具有 __INLINE_CODE_15__ 或 __INLINE_CODE_16__ 后缀。

由于上面的示例是简单的，我们并没有真正测试 Nest特定的内容。实际上，我们甚至没有使用依赖注入（注意我们将 __INLINE_CODE_17__ 实例传递给我们的 __INLINE_CODE_18__）。这种测试形式，即手动实例化被测试的类，是独立于框架的常见形式。让我们介绍一些更复杂的功能，帮助您测试使用 Nest 特性更广泛的应用程序。

#### 测试 utilities

__INLINE_CODE_19__ 包含了一组 utilities，用于提高测试过程的robustness。让我们重写前面的示例，使用内置的 __INLINE_CODE_20__ 类：

```shell
$ npm i bcrypt
$ npm i -D @types/bcrypt

```

__INLINE_CODE_21__ 类对应用程序执行上下文进行了mocking，提供了使其轻松管理类实例的hook。__INLINE_CODE_22__ 类有一个 __INLINE_CODE_23__ 方法，该方法接受模块元数据对象作为参数（与你传递给 __INLINE_CODE_24__ 装饰器的同一个对象）。这方法返回一个 __INLINE_CODE_25__ 实例，该实例提供了一些方法。对于单元测试，重要的是 __INLINE_CODE_26__ 方法。该方法在模块中bootstrap其依赖项（类似于使用 __INLINE_CODE_28__ 文件中的 __INLINE_CODE_29__ 方法），并返回一个已经编译好的模块。

> info **提示** __INLINE_CODE_29__ 方法是 **异步** 的，因此需要使用 `await` 关键字。模块编译完成后，您可以使用 __INLINE_CODE_30__ 方法获取任何 **静态** 实例（控制器和提供者）。

__INLINE_CODE_31__ 继承自 __LINK_153__ 类，因此可以动态地解决作用域提供者（瞬态或请求作用域）。使用 __INLINE_CODE_32__ 方法（__INLINE_CODE_33__ 方法只能获取静态实例）。

```typescript
import * as bcrypt from 'bcrypt';

const saltOrRounds = 10;
const password = 'random_password';
const hash = await bcrypt.hash(password, saltOrRounds);

```

> warning **警告** __INLINE_CODE_34__ 方法返回一个唯一的提供者实例，从其自己的 **DI 容器子树** 中获取。每个子树都有唯一的上下文标识符。因此，如果您调用这个方法多次，并比较实例引用，您将看到它们不相等。

> info **提示** 了解更多关于模块引用功能的信息 __LINK_154__。Here is the translation of the English technical documentation to Chinese:

** Override  **

在开发中，您可以使用 __LINK_155__ 来替换生产环境中的提供者，以便进行测试。例如，您可以模拟数据库服务，而不是连接到实际数据库。我们将在下一节中 discusses overrides，但它们也适用于单元测试。

__HTML_TAG_90____HTML_TAG_91__

#### 自动 mocks

Nest 还允许您定义一个 mock 工厂来应用于所有缺少依赖项。这对于在类中拥有大量依赖项并且模拟它们将需要很长时间和大量设置的情况非常有用。要使用这个特性，您需要将 __INLINE_CODE_35__ 链接到 __INLINE_CODE_36__ 方法，并将依赖项 mock 工厂作为参数传递。这个工厂可以返回一个 mock 实现，或者可以使用一个可选的 token，这是一个有效的 Nest 提供者实例 token。下面是一个使用 __LINK_156__ 和 __INLINE_CODE_39__ 创建一个通用 mock 工厂的示例。

```typescript
const salt = await bcrypt.genSalt();

```

您也可以从测试容器中检索这些 mock，正如您通常检索自定义提供者一样 __INLINE_CODE_40__。

> info **提示** 一个通用 mock 工厂，例如 __INLINE_CODE_41__ 从 __LINK_157__，可以直接传递。

> info **提示** __INLINE_CODE_43__ 和 __INLINE_CODE_44__ 提供者无法自动 mocks，因为它们已经在上下文中预定义了。然而，它们可以使用自定义提供语法或 __INLINE_CODE_45__ 方法来重写。

#### end-to-end 测试

与单元测试不同，end-to-end (e2e) 测试将关注于类和模块之间的交互，更加接近于用户将与生产系统进行交互的方式。随着应用程序的增长，手动测试每个 API 端点的 end-to-end 行为变得越来越难。自动化 end-to-end 测试可以确保系统的整体行为正确，并满足项目要求。为了进行 e2e 测试，我们使用了类似的配置，既在 **单元测试** 部分中介绍的那样。另外，Nest 还使得使用 __LINK_158__ 库来模拟 HTTP 请求变得很容易。

```typescript
const isMatch = await bcrypt.compare(password, hash);

```

> info **提示** 如果您使用 __LINK_159__ 作为 HTTP 适配器，它需要不同的配置，并具有内置的测试功能：
>
> __CODE_BLOCK_6__

在这个示例中，我们基于前面提到的概念。除了 __INLINE_CODE_46__ 方法，我们现在使用 __INLINE_CODE_47__ 方法来实例化完整的 Nest 运行时环境。

需要注意的一点是，在使用 __INLINE_CODE_48__ 方法编译应用程序时，__INLINE_CODE_49__ 将在那时是 undefined 的。这是因为在这个编译阶段，还没有创建 HTTP 适配器或服务器。如果您的测试需要 __INLINE_CODE_50__，您应该使用 __INLINE_CODE_51__ 方法创建应用程序实例，或者重新设计项目以避免在初始化依赖项图时出现这种依赖关系。

好的，让我们分解这个示例：

我们将运行的应用程序保存在 __INLINE_CODE_52__ 变量中，以便在模拟 HTTP 请求时使用它。

我们使用 __INLINE_CODE_53__ 函数从 Supertest 来模拟 HTTP 测试。我们想要这些 HTTP 请求路由到我们的运行 Nest 应用程序，所以我们将 __INLINE_CODE_54__ 函数传递一个对 HTTP 监听器的引用，这个监听器可能是由 Express 平台提供的。因此，构建了 __INLINE_CODE_55__。对 __INLINE_CODE_56__ 的调用返回一个包装的 HTTP 服务器，现在连接到 Nest 应用程序，这个服务器 expose 方法来模拟实际 HTTP 请求。例如，使用 __INLINE_CODE_57__ 将初始化一个请求到 Nest 应用程序，这个请求与实际 HTTP 请求 __INLINE_CODE_58__ 类似。

在这个示例中，我们还提供了 __INLINE_CODE_59__ 的一个替代实现，这个实现简单地返回一个硬编码的值，我们可以测试它。使用 __INLINE_CODE_60__ 来提供这样的替代实现。类似地，Nest 提供了方法来重写模块、守卫、拦截器、过滤器和管道使用 __INLINE_CODE_61__, __INLINE_CODE_62__, __INLINE_CODE_63__, __INLINE_CODE_64__, 和 __INLINE_CODE_65__ 方法分别。Here is the translation of the English technical documentation to Chinese:

另一个方法是,__INLINE_CODE_70__返回一个对象，其中包含__INLINE_CODE_71__方法，您可以使用该方法来提供一个模块，以 Override原始模块，请参阅以下代码：

__CODE_BLOCK_7__

每个 Override 方法类型都返回一个__INLINE_CODE_72__实例，可以链式调用其他方法在__LINK_161__中。请在链式调用中使用__INLINE_CODE_73__，以便 Nest 实例化和初始化模块。

有时，您可能需要提供一个自定义日志记录器，例如在测试中（例如，在CI服务器上）。使用__INLINE_CODE_74__方法，并传入实现__INLINE_CODE_75__接口的对象，以便__INLINE_CODE_76__在测试中如何日志记录（默认情况下，仅将“错误”日志记录到控制台）。

编译后的模块具有以下有用的方法，见以下表：

__HTML_TAG_92__
  __HTML_TAG_93__
    __HTML_TAG_94__
      __HTML_TAG_95__createNestApplication()__HTML_TAG_96__
    __HTML_TAG_97__
    __HTML_TAG_98__
      创建并返回一个Nest应用程序（__HTML_TAG_99__INestApplication__HTML_TAG_100__实例）基于给定的模块。
      请注意，您需要手动初始化应用程序使用__HTML_TAG_101__init()__HTML_TAG_102__方法。
    __HTML_TAG_103__
  __HTML_TAG_104__
  __HTML_TAG_105__
    __HTML_TAG_106__
      __HTML_TAG_107__createNestMicroservice()__HTML_TAG_108__
    __HTML_TAG_109__
    __HTML_TAG_110__
      创建并返回一个Nest微服务（__HTML_TAG_111__INestMicroservice__HTML_TAG_112__实例）基于给定的模块。
    __HTML_TAG_113__
  __HTML_TAG_114__
  __HTML_TAG_115__
    __HTML_TAG_116__
      __HTML_TAG_117__get()__HTML_TAG_118__
    __HTML_TAG_119__
    __HTML_TAG_120__
      检索一个静态实例控制器或提供程序（包括守卫、过滤器等）在应用程序上下文中。继承自__HTML_TAG_121__module reference__HTML_TAG_122__类。
    __HTML_TAG_123__
  __HTML_TAG_124__
  __HTML_TAG_125__
     __HTML_TAG_126__
      __HTML_TAG_127__resolve()__HTML_TAG_128__
    __HTML_TAG_129__
    __HTML_TAG_130__
      检索一个动态创建的作用域实例（请求或瞬态）控制器或提供程序（包括守卫、过滤器等）在应用程序上下文中。继承自__HTML_TAG_131__module reference__HTML_TAG_132__类。
    __HTML_TAG_133__
  __HTML_TAG_134__
  __HTML_TAG_135__
    __HTML_TAG_136__
      __HTML_TAG_137__select()__HTML_TAG_138__
    __HTML_TAG_139__
    __HTML_TAG_140__
      在模块的依赖关系图中导航；可以用于检索特定实例从选择的模块（与严格模式__HTML_TAG_141__strict: true__HTML_TAG_142__在__HTML_TAG_143__get()__HTML_TAG_144__方法中使用）。
    __HTML_TAG_145__
  __HTML_TAG_146__
__HTML_TAG_147__

> 提示 **Hint** 将 e2e 测试文件放置在__INLINE_CODE_77__目录中。测试文件应具有__INLINE_CODE_78__后缀。

#### Override 全局注册的增强器

如果您已注册了一个全局守卫（或管道、拦截器或过滤器），则需要更少的步骤来 Override该增强器。为了总结原始注册如下所示：

__CODE_BLOCK_8__

这将注册守卫作为一个“多”-提供商通过__INLINE_CODE_79__令牌。要 Override__INLINE_CODE_80__，注册需要使用现有的提供商在该槽位：

__CODE_BLOCK_9__

> 提示 **Hint** 将__INLINE_CODE_81__更改为__INLINE_CODE_82__以引用已注册的提供商，而不是让 Nest 实例化它在后台。

现在__INLINE_CODE_83__可供 Nest 作为一个常规提供商，该可以在创建__INLINE_CODE_84__时被 Override：

__CODE_BLOCK_10__

现在所有测试都将使用__INLINE_CODE_85__在每个请求中。

#### 测试请求作用域实例

__LINK_162__提供程序为每个 incoming 请求唯一创建。实例在请求处理完成后被垃圾回收。这个问题是，我们无法访问为测试请求生成的依赖关系树