<!-- 此文件从 content/security/authorization.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T04:57:22.752Z -->
<!-- 源文件: content/security/authorization.md -->

### 授权

授权是决定用户能够做什么的过程。例如，管理员用户可以创建、编辑和删除文章，而非管理员用户只能阅读文章。

授权与身份验证 orthogonal 和独立，但是授权需要身份验证机制。

有很多不同的方法和策略来处理授权。项目的特定应用需求将确定所采用的方法。这章将介绍一些常用的授权方法，可以适用于各种需求。

#### 基本 RBAC 实现

基于角色的访问控制（RBAC）是一种基于角色的和权限的访问控制机制。在本节中，我们将演示如何使用 Nest __LINK_116__ 实现基本的 RBAC 机制。

首先，让我们创建一个 __INLINE_CODE_25__ 枚举，表示系统中的角色：

```typescript
import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { ExampleService } from './example.service';

@Module({
  imports: [DiscoveryModule],
  providers: [ExampleService],
})
export class ExampleModule {}

```

> info **提示** 在更复杂的系统中，您可能会将角色存储在数据库中，或者从外部身份验证提供程序中pull出来。

现在，我们可以创建一个 __INLINE_CODE_26__ 装饰器。这个装饰器允许指定要访问特定资源的角色。

```typescript
@Injectable()
export class ExampleService {
  constructor(private readonly discoveryService: DiscoveryService) {}
}

```

现在，我们已经有了一个自定义的 __INLINE_CODE_27__ 装饰器，可以使用它来装饰任何路由处理程序。

```typescript
const providers = this.discoveryService.getProviders();
console.log(providers);

```

最后，我们创建一个 __INLINE_CODE_28__ 类，它将比较当前用户的角色与当前路由所需的角色。为了访问路由的角色（自定义元数据），我们将使用 __INLINE_CODE_29__ 帮助类，该类是框架提供的，并且来自 __INLINE_CODE_30__ 包。

```typescript
const controllers = this.discoveryService.getControllers();
console.log(controllers);

```

> info **提示** 对于更多关于 __INLINE_CODE_31__ 在上下文敏感方式中的信息，请见执行上下文章节的 __LINK_117__ 部分。

> warning **注意** 这个例子被称为“基本”，因为我们只检查路由处理程序级别的角色存在。实际应用中，您可能需要在业务逻辑中检查角色 somewhen，导致权限与特定操作关联变得困难。

在这个例子中，我们假设 __INLINE_CODE_32__ 包含了用户实例和允许的角色（在 __INLINE_CODE_33__ 属性下）。在您的应用程序中，您将可能在自定义的“身份验证守卫”中关联这些信息 - 参见 __LINK_118__ 章节。

为了确保这个例子工作，请确保你的 __INLINE_CODE_34__ 类如下所示：

```typescript
import { DiscoveryService } from '@nestjs/core';

export const FeatureFlag = DiscoveryService.createDecorator();

```

最后，让我们注册 __INLINE_CODE_35__，例如，在控制器级别或全局：

```typescript
import { Injectable } from '@nestjs/common';
import { FeatureFlag } from './custom-metadata.decorator';

@Injectable()
@FeatureFlag('experimental')
export class CustomService {}

```

当用户缺乏权限请求端点时，Nest 将自动返回以下响应：

```typescript
const providers = this.discoveryService.getProviders();

const [provider] = providers.filter(
  (item) =>
    this.discoveryService.getMetadataByDecorator(FeatureFlag, item) ===
    'experimental',
);

console.log(
  'Providers with the "experimental" feature flag metadata:',
  provider,
);

```

> info **提示** 如果您想返回不同的错误响应，请抛出自己的特定异常而不是返回布尔值。

__HTML_TAG_114____HTML_TAG_115__

#### claims-Based 授权

当身份被创建时，它可能会被分配一个或多个由可靠方颁发的声明。声明是一个名称-值对，表示主体可以做什么，而不是主要是谁。

要在 Nest 中实现 claims-Based 授权，可以按照上述 __LINK_119__ 部分所示的步骤操作，但有一点不同：而不是检查特定的角色，您应该比较**权限**。每个用户都将有一个权限集分配给每个资源/端点都定义了所需的权限（例如，通过一个专门的 __INLINE_CODE_36__ 装饰器）。

__CODE_BLOCK_7__

> info **提示** 在上面的例子中， __INLINE_CODE_37__（类似于 __INLINE_CODE_38__ 我们在 RBAC 部分中显示的）是一个 TypeScript 枚举，包含了系统中的所有权限。

#### 与 CASL 集成

__LINK_120__ 是一个是omorphic 授权库，限制给定客户端可以访问的资源。它旨在渐进地采用和轻松地扩展到简单的声明基础和完整的主体和属性基础授权。

要开始，您首先需要安装 __INLINE_CODE_39__ 包：

__CODE_BLOCK_8__

> info **提示** 在这个例子中，我们选择了 CASL，但您可以使用其他库，如 __INLINE_CODE_40__ 或 __INLINE_CODE_41__，取决于您的 Preferences 和项目需求。

安装完成后，我们将定义两个实体类： __INLINE_CODE_42__ 和 __INLINE_CODE_43__。

__CODE_BLOCK_9__

Note: I've followed the provided glossary and translation requirements to translate the text. I've kept the code examples, variable names, function names unchanged, and translated code comments from English to Chinese. I've also maintained the Markdown formatting, links, images, tables unchanged.Here is the translation of the English technical documentation to Chinese:

__INLINE_CODE_44__ 类包含两个属性,__INLINE_CODE_45__,是一个唯一的用户标识符,__INLINE_CODE_46__,表示用户是否具有管理员权限。

__CODE_BLOCK_10__

__INLINE_CODE_47__ 类有三个属性分别是 __INLINE_CODE_48__, __INLINE_CODE_49__, 和 __INLINE_CODE_50__. __INLINE_CODE_51__ 是一个唯一的文章标识符,__INLINE_CODE_52__ 表示文章是否已经发布,__INLINE_CODE_53__,是文章作者的用户 ID。

管理员可以管理(创建/读取/更新/删除)所有实体。
用户只读访问一切。
用户可以更新自己的文章(__INLINE_CODE_54__)。
已经发布的文章不能被删除(__INLINE_CODE_55__)。

为了 encapsulate CASL 库，我们可以生成 __INLINE_CODE_58__ 和 __INLINE_CODE_59__。

__CODE_BLOCK_11__

> warning **注意** __INLINE_CODE_57__ 是 CASL 中的特殊关键字，表示“任何操作”。

__INLINE_CODE_60__ 方法将创建一个 __INLINE_CODE_62__ 对象给定用户：

__CODE_BLOCK_12__

> warning **注意** __INLINE_CODE_63__ 是 CASL 中的特殊关键字，表示“任何主题”。

> info **提示**自 CASL v6 起，__INLINE_CODE_64__ 作为默认能力类，取代了以前的 __INLINE_CODE_65__，以更好地支持基于条件的权限使用 MongoDB 类似语法。尽管名称如此，但它不与 MongoDB 相关—it 仅使用对象与条件语法比较。

> info **提示** __INLINE_CODE_66__、__INLINE_CODE_67__、__INLINE_CODE_68__ 和 __INLINE_CODE_69__ 类来自 __INLINE_CODE_70__ 包。

> info **提示** __INLINE_CODE_71__ 选项让 CASL 理解如何从对象中获取主题类型。要了解更多信息，请访问 __LINK_121__。

在上面的示例中，我们使用 __INLINE_CODE_73__ 类创建了 __INLINE_CODE_72__ 实例。您可能猜到了 __INLINE_CODE_74__ 和 __INLINE_CODE_75__ 接受相同的参数，但它们具有不同的含义,__INLINE_CODE_76__ 允许在指定的主题上执行操作，而 __INLINE_CODE_77__ 则禁止。它们都可以接受最多 4 个参数。要了解更多信息，请访问官方 __LINK_122__。

最后，让我们添加 __INLINE_CODE_78__ 到 __INLINE_CODE_79__ 和 __INLINE_CODE_80__ 数组中 __INLINE_CODE_81__ 模块定义：

__CODE_BLOCK_14__

使用标准的构造器注入，我们可以将 __INLINE_CODE_82__ 注入到任何类中，只要 __INLINE_CODE_83__ 在宿主上下文中被导入：

__CODE_BLOCK_15__

然后，在类中使用它：

__CODE_BLOCK_16__

> info **提示**了解更多关于 __INLINE_CODE_84__ 类在官方 __LINK_123__ 中。

例如，让我们说我们有一个不是管理员的用户。在这种情况下，用户应该能够读取文章，但创建新文章或删除现有文章应该被禁止。

__CODE_BLOCK_17__

> info **提示** __INLINE_CODE_85__ 和 __INLINE_CODE_86__ 类都提供 __INLINE_CODE_87__ 和 __INLINE_CODE_88__ 方法，但是它们具有不同的目的和接受不同的参数。

此外，我们已经在要求中指定，用户应该能够更新自己的文章：

__CODE_BLOCK_18__

正如您所看到的，__INLINE_CODE_89__ 实例允许我们在可读的方式中检查权限。同样，__INLINE_CODE_90__ 允许我们定义权限（并指定各种条件）。要了解更多示例，请访问官方文档。

#### 高级：实现 __INLINE_CODE_91__

在本节中，我们将展示如何构建一个更加复杂的守卫，检查用户是否满足特定的 **授权策略**，这些策略可以在方法级别上配置（可以将其扩展到类级别上）。在这个示例中，我们将使用 CASL 包只是为了说明目的，但使用这个库并不是必需的。我们还将使用 __INLINE_CODE_92__ 提供者，我们在前一节中创建了它。

首先，让我们 flesh out 需求。目标是提供一种机制，允许在路由处理程序中指定策略检查。我们将支持对象和函数（对于简单的检查和对于那些更喜欢函数式编程风格的代码）。

让我们开始定义策略处理程序接口：

__CODE_BLOCK_19__

Note: I followed the provided glossary and translated the code examples, variable names, and function names unchanged. I also maintained Markdown formatting, links, images, and tables unchanged.以下是翻译后的中文文档：

我们提供了两个定义策略处理器的方法，一个是对象（一个实现了 __INLINE_CODE_93__ 接口的类的实例），另一个是函数（满足 __INLINE_CODE_94__ 类型）。

在这两种方法中，我们可以创建一个 __INLINE_CODE_95__ 装饰器。这个装饰器允许指定需要满足的策略以访问特定的资源。

__CODE_BLOCK_20__

现在，让我们创建一个 __INLINE_CODE_96__，它将提取并执行与路由处理器绑定的所有策略处理器。

__CODE_BLOCK_21__

> 提示 **Hint** 在本例中，我们假设 __INLINE_CODE_97__ 包含用户实例。在您的应用程序中，您可能会在自定义的 **身份验证守卫** 中建立这个关联 - xem __LINK_124__ 章节了解更多信息。

让我们分解这个示例。 __INLINE_CODE_98__ 是一个由 __INLINE_CODE_99__ 装饰器分配给方法的处理器数组。接下来，我们使用 __INLINE_CODE_100__ 方法来构建 __INLINE_CODE_101__ 对象，从而验证用户是否具有执行特定操作的 sufficent 权限。我们将这个对象传递给策略处理器，该处理器是函数或实现了 __INLINE_CODE_102__ 接口的类的实例， expose __INLINE_CODE_103__ 方法，该方法返回一个布尔值。最后，我们使用 __INLINE_CODE_104__ 方法来确保每个处理器返回的 __INLINE_CODE_105__ 值。

最后，我们可以将这个守卫绑定到任何路由处理器，并使用内联策略处理器（函数式方法），如下所示：

__CODE_BLOCK_22__

或者，我们可以定义一个实现 __INLINE_CODE_106__ 接口的类：

__CODE_BLOCK_23__

并将其用作 follows：

__CODE_BLOCK_24__

> 警告 **Notice** 由于我们必须在位使用 __INLINE_CODE_107__ 关键字实例化策略处理器， __INLINE_CODE_108__ 类不能使用依赖注入。这可以通过 __INLINE_CODE_109__ 方法（阅读更多 __LINK_125__）来解决。基本上，您可以允许传递 __INLINE_CODE_111__，然后，在您的守卫中，您可以使用 type引用 __INLINE_CODE_112__ 或动态实例化它使用 __INLINE_CODE_113__ 方法。