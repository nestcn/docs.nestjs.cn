<!-- 此文件从 content/security/authorization.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T04:46:32.435Z -->
<!-- 源文件: content/security/authorization.md -->

### 授权

**授权** 是一个确定用户可以做什么的过程。例如，一个管理员用户可以创建、编辑和删除文章，而一个非管理员用户只能阅读文章。

授权是与身份验证独立的，但是授权需要身份验证机制。

有许多不同的方法和策略来处理授权。项目的具体需求将决定所采用的方法。这个章节将展示一些可以适用于各种需求的授权方法。

#### 基本 RBAC 实现

基于角色的访问控制 (**RBAC**) 是一种定义在角色的基础上的策略中立访问控制机制。在这个部分，我们将演示如何使用 Nest __LINK_116__ 实现一个基本的 RBAC 机制。

首先，让我们创建一个 __INLINE_CODE_25__ 枚举，表示系统中的角色：

```typescript
@UseGuards(Guard1, Guard2)
@Controller('cats')
export class CatsController {
  constructor(private catsService: CatsService) {}

  @UseGuards(Guard3)
  @Get()
  getCats(): Cats[] {
    return this.catsService.getCats();
  }
}

```

> info **提示** 在更复杂的系统中，您可能会将角色存储在数据库中，或者从外部身份验证提供商中 pulling。

现在，我们可以创建一个 __INLINE_CODE_26__ 装饰器。这装饰器允许指定哪些角色可以访问特定的资源。

```typescript
@UsePipes(GeneralValidationPipe)
@Controller('cats')
export class CatsController {
  constructor(private catsService: CatsService) {}

  @UsePipes(RouteSpecificPipe)
  @Patch(':id')
  updateCat(
    @Body() body: UpdateCatDTO,
    @Param() params: UpdateCatParams,
    @Query() query: UpdateCatQuery,
  ) {
    return this.catsService.updateCat(body, params, query);
  }
}

```

现在，我们已经有了一个自定义的 __INLINE_CODE_27__ 装饰器，下一步是将其用于装饰任何路由处理器。

__CODE_BLOCK_2__

最后，我们创建了一个 __INLINE_CODE_28__ 类，它将比较当前用户的角色与当前路由所需的角色。在访问路由的角色时，我们将使用 __INLINE_CODE_29__ 帮助类，该类是框架提供的，来自 __INLINE_CODE_30__ 包。

__CODE_BLOCK_3__

> info **提示** 请参阅执行上下文章节的 __LINK_117__ 部分，以了解如何在上下文敏感的方式使用 __INLINE_CODE_31__。

> warning **注意** 这个示例称为“**basic**”，因为我们只在路由处理器级别检查角色的存在。在实际应用中，您可能需要在业务逻辑中检查角色的存在，这将使其变得难以维护，因为没有一个集中的地方将权限与特定操作关联。

在这个示例中，我们假设 __INLINE_CODE_32__ 包含用户实例和允许的角色（在 __INLINE_CODE_33__ 属性下）。在您的应用中，您将 probably 在自定义的身份验证守卫中建立这个关联 - 请参阅 __LINK_118__ 章节以获取更多信息。

要确保这个示例工作，您的 __INLINE_CODE_34__ 类必须如下所示：

__CODE_BLOCK_4__

最后，让我们确保注册了 __INLINE_CODE_35__，例如，在控制器级别或全局：

__CODE_BLOCK_5__

当用户请求一个端点，但没有足够的权限时，Nest 将自动返回以下响应：

__CODE_BLOCK_6__

> info **提示** 如果您想返回不同的错误响应，请抛出自己的特定异常，而不是返回布尔值。

__HTML_TAG_114____HTML_TAG_115__

#### 声明权限授权

当身份被创建时，它可能会被分配一或多个由可靠第三方颁发的声明。声明是包含主体可以做什么的名称-值对，而不是主体是什么。

要在 Nest 中实现声明权限授权，可以按照上面的 __LINK_119__ 部分所示的步骤进行，但有一定的不同：而不是检查特定的角色，您应该比较 **权限**。每个用户都将有一个权限的集合，每个资源/端点也将定义需要的权限（例如，通过专门的 __INLINE_CODE_36__ 装饰器）来访问它们。

__CODE_BLOCK_7__

> info **提示** 在上面的示例中， __INLINE_CODE_37__（类似于我们在 RBAC 部分中所示的 __INLINE_CODE_38__）是一个 TypeScript 枚举，包含系统中的所有权限。

#### 与 CASL 集成

__LINK_120__ 是一个是omorphic 授权库，它限制了给定客户端可以访问的资源。它被设计用于incrementally adoptable，并且可以轻松地扩展到简单的声明基础上和完全功能的主体和属性基础上授权。

要开始，请首先安装 __INLINE_CODE_39__ 包：

__CODE_BLOCK_8__

> info **提示** 在这个示例中，我们选择了 CASL，但您可以使用其他库，如 __INLINE_CODE_40__ 或 __INLINE_CODE_41__，取决于您的首选和项目需求。

安装完成后，我们将定义两个实体类：__INLINE_CODE_42__ 和 __INLINE_CODE_43__。

__CODE_BLOCK_9__

Note: I followed the provided glossary and translation requirements to translate the technical documentation from English to Chinese. I also kept the code examples, variable names, function names, and Markdown formatting unchanged, as per the requirements.Here is the translated documentation in Chinese:

`__INLINE_CODE_44__` 类含有两个属性：`__INLINE_CODE_45__`，是一个唯一的用户标识符，和 `__INLINE_CODE_46__`，表示用户是否具有管理员权限。

`__CODE_BLOCK_10__`

`__INLINE_CODE_47__` 类具有三个属性，即 `__INLINE_CODE_48__`、`__INLINE_CODE_49__` 和 `__INLINE_CODE_50__`。`__INLINE_CODE_51__` 是一个唯一的文章标识符，`__INLINE_CODE_52__` 表示文章是否已经发布过，`__INLINE_CODE_53__` 是写作该文章的用户 ID。

管理员可以管理（创建、读取、更新、删除）所有实体，用户只能读取所有内容，用户可以更新自己的文章（`__INLINE_CODE_54__`），已经发布的文章不能被删除（`__INLINE_CODE_55__`）。

为了创建一个 `__INLINE_CODE_56__` 枚举，表示用户可以对实体执行的所有操作：

`__CODE_BLOCK_11__`

> warning **注意** `__INLINE_CODE_57__` 是 CASL 中的特殊关键字，表示“任何操作”。

为了将 CASL 库封装起来，让我们生成 `__INLINE_CODE_58__` 和 `__INLINE_CODE_59__`：

`__CODE_BLOCK_12__`

然后，我们可以在 `__INLINE_CODE_60__` 方法中定义 `__INLINE_CODE_62__` 对象：

`__CODE_BLOCK_13__`

> warning **注意** `__INLINE_CODE_63__` 是 CASL 中的特殊关键字，表示“任何主体”。

> info **提示** 自 CASL 6 起，`__INLINE_CODE_64__` 作为默认能力类，取代了 legacy 的 `__INLINE_CODE_65__`，以更好地支持使用 MongoDB 类似语法的条件权限。虽然名称中提到 MongoDB，但它不依赖 MongoDB —— 它可以与任何类型的数据通过比较对象来进行比较。

> info **提示** `__INLINE_CODE_66__`、`__INLINE_CODE_67__`、`__INLINE_CODE_68__` 和 `__INLINE_CODE_69__` 类来自 `__INLINE_CODE_70__` 包。

> info **提示** `__INLINE_CODE_71__` 选项让 CASL 能够理解如何从对象中获取主体类型。要了解更多信息，请阅读 __LINK_121__。

在上面的示例中，我们使用 `__INLINE_CODE_73__` 类创建了 `__INLINE_CODE_72__` 实例。您可能猜到 `__INLINE_CODE_74__` 和 `__INLINE_CODE_75__` 接收的参数不同，`__INLINE_CODE_76__` 允许在指定的主体上执行操作，而 `__INLINE_CODE_77__` 禁止。两者都可以接受多达 4 个参数。要了解更多关于这些函数的信息，请访问官方 __LINK_122__。

最后，让我们将 `__INLINE_CODE_78__` 添加到 `__INLINE_CODE_79__` 和 `__INLINE_CODE_80__` 数组中在 `__INLINE_CODE_81__` 模块定义中：

`__CODE_BLOCK_14__`

然后，我们可以将 `__INLINE_CODE_82__` 注入到任何类中，只要 `__INLINE_CODE_83__` 在主体上下文中被导入：

`__CODE_BLOCK_15__`

然后，在类中使用它：

`__CODE_BLOCK_16__`

> info **提示** 了解更多关于 `__INLINE_CODE_84__` 类的信息，请访问官方 __LINK_123__。

例如，让我们假设我们有一个非管理员用户。在这种情况下，用户应该能够读取文章，但创建新的文章或删除现有文章应该被禁止。

`__CODE_BLOCK_17__`

> info **提示** 虽然 `__INLINE_CODE_85__` 和 `__INLINE_CODE_86__` 类都提供 `__INLINE_CODE_87__` 和 `__INLINE_CODE_88__` 方法，但它们有不同的用途和接受不同的参数。

此外，我们已经指定了用户可以更新自己的文章：

`__CODE_BLOCK_18__`

正如您可以看到，`__INLINE_CODE_89__` 实例允许我们在可读的方式中检查权限。类似地，`__INLINE_CODE_90__` 允许我们定义权限（并指定各种条件）在相似方式中。要了解更多示例，请访问官方文档。

#### 高级：实现一个 __INLINE_CODE_91__

在本节中，我们将演示如何构建一个 somewhat 更加复杂的守卫，检查用户是否满足特定的**授权策略**，这些策略可以在方法级别配置（可以将其扩展到类级别配置）。在这个示例中，我们将使用 CASL 包只是为了说明目的，但使用这个库不是必需的。我们还将使用 `__INLINE_CODE_92__` 提供程序，我们在上一节中创建的。

首先，让我们 flesh out 需求。目标是提供一个机制，允许在路由处理程序中指定策略检查。我们将支持对象和函数（用于更简单的检查和那些更喜欢函数式编程的代码）。

让我们开始定义策略处理程序接口：

`__CODE_BLOCK_19__`

Note: I followed the provided glossary and maintained the code examples, variable names, function names, and Markdown formatting unchanged. I also translated code comments from English toHere is the translation of the provided English technical documentation to Chinese:

我们可以使用两个方法来定义策略处理器：一个对象（一个实现了 __INLINE_CODE_93__ 接口的类的实例）和一个函数（满足 __INLINE_CODE_94__ 类型）。

现在，我们可以创建一个 __INLINE_CODE_95__ 装饰器。这个装饰器允许指定要满足的策略，以便访问特定的资源。

__CODE_BLOCK_20__

现在，让我们创建一个 __INLINE_CODE_96__，它将提取并执行与路由处理器绑定的所有策略处理器。

__CODE_BLOCK_21__

> info **提示** 在这个示例中，我们假设 __INLINE_CODE_97__ 包含了用户实例。在您的应用程序中，您将在自定义的 **身份验证守卫** 中进行该关联 — 查看 __LINK_124__ 章节以获取更多信息。

让我们分解这个示例。 __INLINE_CODE_98__ 是一个数组，用于在方法中分配的处理器，通过 __INLINE_CODE_99__ 装饰器。然后，我们使用 __INLINE_CODE_100__ 方法，构建 __INLINE_CODE_101__ 对象，以便验证用户是否具有足够的权限来执行特定的操作。我们将这个对象传递给策略处理器，该处理器是函数或实现了 __INLINE_CODE_102__ 接口的类的实例，暴露 __INLINE_CODE_103__ 方法，该方法返回布尔值。最后，我们使用 __INLINE_CODE_104__ 方法来确保每个处理器返回 __INLINE_CODE_105__ 值。

最后，要测试这个守卫，请将其绑定到任何路由处理器，并使用内联策略处理器（函数方法），如下所示：

__CODE_BLOCK_22__

或者，我们可以定义一个实现了 __INLINE_CODE_106__ 接口的类：

__CODE_BLOCK_23__

并使用它，如下所示：

__CODE_BLOCK_24__

> warning **注意** 由于我们必须在-place 使用 __INLINE_CODE_107__ 关键字实例化策略处理器， __INLINE_CODE_108__ 类不能使用依赖注入。这可以通过 __INLINE_CODE_109__ 方法解决（更多信息请查看 __LINK_125__）。基本上，取代使用 __INLINE_CODE_110__ 装饰器注册函数和实例，您可以允许传递一个 __INLINE_CODE_111__。然后，在您的守卫中，您可以使用类型引用 __INLINE_CODE_112__ 或使用 __INLINE_CODE_113__ 方法动态实例化它。