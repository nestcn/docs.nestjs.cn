<!-- 此文件从 content/security/authorization.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T04:57:32.404Z -->
<!-- 源文件: content/security/authorization.md -->

### 授权

**授权** 是决定用户可以执行什么操作的过程。例如，管理员用户可以创建、编辑和删除帖子，而非管理员用户只能阅读帖子。

授权与身份验证是独立的，但是授权需要身份验证机制。

有许多不同的方法和策略来处理授权。任何项目的approach都取决于其特定的应用需求。以下是在不同需求下可以适应的授权方法。

#### 基本 RBAC 实现

基于角色的访问控制 (**RBAC**) 是围绕角色和权限定义的一种策略中立的访问控制机制。在本节中，我们将展示如何使用 Nest __LINK_116__ 实现一个基本的 RBAC 机制。

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

> info **提示** 在更复杂的系统中，您可能会将角色存储在数据库中，或者从外部身份验证提供商中pull它们。

现在，我们可以创建一个 __INLINE_CODE_26__ 装饰器。这个装饰器允许指定某些资源所需的角色。

```typescript
@Injectable()
export class ExampleService {
  constructor(private readonly discoveryService: DiscoveryService) {}
}

```

现在，我们已经有了一个自定义的 __INLINE_CODE_27__ 装饰器，可以将其用于装饰任何路由处理程序。

```typescript
const providers = this.discoveryService.getProviders();
console.log(providers);

```

最后，我们创建一个 __INLINE_CODE_28__ 类，这个类将比较当前用户分配的角色与当前路由处理程序所需的角色。在访问当前路由时，我们将使用 __INLINE_CODE_29__ 助手类，它是框架提供的默认类，来自 __INLINE_CODE_30__ 包。

```typescript
const controllers = this.discoveryService.getControllers();
console.log(controllers);

```

> info **提示** 请参阅执行上下文章节中的 __LINK_117__ 部分，以了解如何在上下文敏感的方式使用 __INLINE_CODE_31__。

> warning **注意** 这个示例被命名为 "**基本**"，因为我们只在路由处理程序级别检查角色 presence。在实际应用中，您可能需要在业务逻辑中检查角色 somewhare，making it somewhat harder to maintain，因为将没有一个 centralized 位置将权限与特定的操作关联。

在这个示例中，我们假设 __INLINE_CODE_32__ 包含用户实例和允许的角色（在 __INLINE_CODE_33__ 属性下）。在您的应用程序中，您将 probably 在自定义身份验证守卫中进行该关联 - 请参阅 __LINK_118__ 章节了解更多细节。

为了确保这个示例工作，您的 __INLINE_CODE_34__ 类必须如下所示：

```typescript
import { DiscoveryService } from '@nestjs/core';

export const FeatureFlag = DiscoveryService.createDecorator();

```

最后，让我们确保注册了 __INLINE_CODE_35__，例如，在控制器级别或全局：

```typescript
import { Injectable } from '@nestjs/common';
import { FeatureFlag } from './custom-metadata.decorator';

@Injectable()
@FeatureFlag('experimental')
export class CustomService {}

```

当一个用户没有足够的权限请求一个端点时，Nest 将自动返回以下响应：

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

> info **提示** 如果您想返回不同的错误响应，请抛出自己的特定异常。

__HTML_TAG_114____HTML_TAG_115__

#### 声明式授权

当一个身份被创建时，它可能被分配一个或多个由可靠第三方颁发的声明。一个声明是一个名称-值对，它表示主体可以执行的操作，而不是主体是什么。

要在 Nest 中实现声明式授权，可以遵循上述 __LINK_119__ 部分中的步骤，但是有一個重要的区别：而不是检查特定的角色，您应该比较 **权限**。每个用户都将有一个分配的权限集。类似地，每个资源/端点都将定义所需的权限（例如，通过一个 dedicated __INLINE_CODE_36__ 装饰器）来访问它们。

__CODE_BLOCK_7__

> info **提示** 在上面的示例中， __INLINE_CODE_37__（类似于 __INLINE_CODE_38__ 我们在 RBAC 部分中展示的）是一个 TypeScript 枚举，它包含了您的系统中的所有权限。

####  integrating CASL

__LINK_120__ 是一个是omorphic 授权库，它限制了给定客户端可以访问的资源。它是 incrementally adoptable 可以轻松地扩展到简单的声明式授权和完整的主体和属性基于授权。

要开始，请首先安装 __INLINE_CODE_39__ 包：

__CODE_BLOCK_8__

> info **提示** 在这个示例中，我们选择了 CASL，但是您可以使用其他库，如 __INLINE_CODE_40__ 或 __INLINE_CODE_41__，取决于您的喜好和项目需求。

安装完成后，我们将定义两个实体类： __INLINE_CODE_42__ 和 __INLINE_CODE_43__。

__CODE_BLOCK_9__Here is the translation of the provided technical documentation to Chinese:

` __INLINE_CODE_44__` 类包含两个属性，`__INLINE_CODE_45__` 是一个唯一的用户标识符，`__INLINE_CODE_46__` 表示用户是否拥有管理员权限。

`__CODE_BLOCK_10__`

`__INLINE_CODE_47__` 类有三个属性，分别是 `__INLINE_CODE_48__`、`__INLINE_CODE_49__` 和 `__INLINE_CODE_50__`。`__INLINE_CODE_51__` 是一个唯一的文章标识符，`__INLINE_CODE_52__` 表示文章是否已经发布过，`__INLINE_CODE_53__` 是文章作者的用户 ID。

现在让我们来回顾和完善我们的要求：

- 管理员可以管理（创建、读取、更新、删除）所有实体
- 用户只能读取所有内容
- 用户可以更新他们的文章（`__INLINE_CODE_54__`）
- 已经发布的文章不能被删除（`__INLINE_CODE_55__`）

基于这些要求，我们可以开始创建一个 `__INLINE_CODE_56__` 枚举，代表用户可以对实体执行的所有操作：

`__CODE_BLOCK_11__`

> 警告 **注意** `__INLINE_CODE_57__` 是 CASL 中的特殊关键字，表示“任何操作”。

为了将 CASL 库封装起来，让我们生成 `__INLINE_CODE_58__` 和 `__INLINE_CODE_59__`。

`__CODE_BLOCK_12__`

现在，我们可以在 `__INLINE_CODE_60__` 方法中定义 `__INLINE_CODE_61__` 对象，为给定的用户创建 `__INLINE_CODE_62__` 对象：

`__CODE_BLOCK_13__`

> 警告 **注意** `__INLINE_CODE_63__` 是 CASL 的特殊关键字，表示“任何主题”。

> 提示 **提示** 自 CASL v6 起，`__INLINE_CODE_64__` 作为默认能力类，取代了遗留的 `__INLINE_CODE_65__`，以更好地支持使用 MongoDB-like 语法的基于条件的权限。尽管名称如此，它并不是与 MongoDB 相关联的——它可以与任何类型的数据一起使用，只要简单地将对象与 Mongo-like 语法的条件比较。

> 提示 **提示** `__INLINE_CODE_66__`、`__INLINE_CODE_67__`、`__INLINE_CODE_68__` 和 `__INLINE_CODE_69__` 类来自 `__INLINE_CODE_70__` 包。

> 提示 **提示** `__INLINE_CODE_71__` 选项让 CASL 可以理解如何从对象中获取主题类型。要了解更多信息，请阅读 __LINK_121__。

在上面的示例中，我们使用 `__INLINE_CODE_72__` 实例来创建 `__INLINE_CODE_73__` 对象。您可能已经猜到了，`__INLINE_CODE_74__` 和 `__INLINE_CODE_75__` 接受同样的参数，但有不同的含义，`__INLINE_CODE_76__` 允许在指定的主题上执行操作，而 `__INLINE_CODE_77__` 禁止。两个都可以接受最多 4 个参数。要了解更多关于这些函数的信息，请访问官方 __LINK_122__。

最后，让我们将 `__INLINE_CODE_78__` 添加到 `__INLINE_CODE_79__` 和 `__INLINE_CODE_80__` 数组中，位于 `__INLINE_CODE_81__` 模块定义中：

`__CODE_BLOCK_14__`

现在，我们可以将 `__INLINE_CODE_82__` 注入到任何类中，使用标准构造函数注入，只要 `__INLINE_CODE_83__` 在宿主上下文中被导入：

`__CODE_BLOCK_15__`

然后，在类中使用它：

`__CODE_BLOCK_16__`

> 提示 **提示** 了解更多关于 `__INLINE_CODE_84__` 类在官方 __LINK_123__。

例如，让我们说我们有一个非管理员用户。在这种情况下，用户应该可以读取文章，但是创建新文章或删除现有文章应该被禁止。

`__CODE_BLOCK_17__`

> 提示 **提示** 尽管 `__INLINE_CODE_85__` 和 `__INLINE_CODE_86__` 类都提供 `__INLINE_CODE_87__` 和 `__INLINE_CODE_88__` 方法，但它们有不同的目的是接受略微不同的参数。

此外，我们已经指定了用户可以更新他们的文章：

`__CODE_BLOCK_18__`

正如您所看到的，`__INLINE_CODE_89__` 实例允许我们在可读的方式中检查权限。类似地，`__INLINE_CODE_90__` 允许我们定义权限（并指定各种条件）。要了解更多示例，请访问官方文档。

#### 高级：实现一个 __INLINE_CODE_91__

在本节中，我们将展示如何构建一个 somewhat 更加复杂的守卫，它检查用户是否满足特定的 **授权策略**，这些策略可以在方法级别（您可以将其扩展到类级别）上配置。在这个示例中，我们将使用 CASL 包只是为了说明purposes，但使用这个库不是必需的。我们还将使用 `__INLINE_CODE_92__` 提供者，我们在前一部分中创建了。

首先，让我们 flesh out 需求。目标是提供一个机制，允许在路由处理程序上指定策略检查。我们将支持对象和函数（Here is the translation of the provided English technical documentation to Chinese:

我们提供了两个定义策略处理程序的方法：一个对象（控制器实例，实现了 __INLINE_CODE_93__ 接口）和一个函数（满足 __INLINE_CODE_94__ 类型）。

在这两个方法中，我们可以创建一个 __INLINE_CODE_95__ 装饰器。这个装饰器允许指定访问特定资源所需满足的策略。

__CODE_BLOCK_20__

现在，让我们创建一个 __INLINE_CODE_96__，它将提取并执行与路由处理程序绑定的所有策略处理程序。

__CODE_BLOCK_21__

>info **提示** 在这个示例中，我们假设 __INLINE_CODE_97__ 包含用户实例。在您的应用程序中，您可能会在自定义的 **身份验证守卫** 中建立这个关联 —— 请参阅 __LINK_124__ 章节获取更多信息。

让我们分解这个示例。 __INLINE_CODE_98__ 是一个方法通过 __INLINE_CODE_99__ 装饰器分配的处理程序数组。下一步，我们使用 __INLINE_CODE_100__ 方法构建 __INLINE_CODE_101__ 对象，以便验证用户是否具有执行特定操作的足够权限。然后，我们将这个对象传递给策略处理程序，它可以是一个函数或一个实现 __INLINE_CODE_102__ 接口的类，暴露 __INLINE_CODE_103__ 方法，该方法返回布尔值。最后，我们使用 __INLINE_CODE_104__ 方法确保每个处理程序返回 __INLINE_CODE_105__ 值。

最后，我们可以将这个守卫绑定到任何路由处理程序，然后注册 inline 策略处理程序（函数式方法），如下所示：

__CODE_BLOCK_22__

或者，我们可以定义一个实现 __INLINE_CODE_106__ 接口的类：

__CODE_BLOCK_23__

然后，使用它如下所示：

__CODE_BLOCK_24__

>警告 **注意** 由于我们必须使用 __INLINE_CODE_107__ 关键字在-place 实例化策略处理程序， __INLINE_CODE_108__ 类不能使用依赖注入。这可以通过使用 __INLINE_CODE_109__ 方法来解决（了解更多 __LINK_125__）。基本上，您可以允许传递 __INLINE_CODE_111__，然后，在守卫中，您可以使用 type 参考 __INLINE_CODE_112__ 或者动态实例化它使用 __INLINE_CODE_113__ 方法。