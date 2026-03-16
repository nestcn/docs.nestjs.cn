<!-- 此文件从 content/fundamentals/unit-testing.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T05:00:13.383Z -->
<!-- 源文件: content/fundamentals/unit-testing.md -->

### 测试

自动测试被认为是任何严肃软件开发努力的一部分。自动化使得快速重复单个测试或测试套件变得容易，这有助于确保发布满足质量和性能目标。自动化增加了开发者的生产力，并确保在关键开发生命周期阶段，如源代码控制检查、功能集成和版本发布时，测试被运行。

这些测试通常包括多种类型，如单元测试、端到端(e2e)测试、集成测试等。虽然好处是毋庸置疑，但设置它们可以很麻烦。Nest旨在促进开发最佳实践，包括有效的测试，所以它包括以下特性来帮助开发者和团队建立和自动化测试。Nest:

- 自动创建默认单元测试和e2e测试
- 提供默认工具（如测试运行器，构建隔离模块/应用程序加载器）
- 与 __LINK_150__ 和 __LINK_151__ 出厂集成，同时保持agnostic于测试工具
- 使Nest依赖注入系统在测试环境中可用，以便轻松模拟组件

如所提到，您可以使用任何 **测试框架**，因为Nest不强制使用特定的工具只需替换所需的元素（如测试运行器），您仍然可以享受Nest的ready-made测试设施。

#### 安装

要开始，请首先安装所需的包：

```shell
$ nest g resource

```

#### 单元测试

在以下示例中，我们测试两个类：`UsersService` 和 `User`。如前所述，__LINK_152__ 作为默认测试框架，提供了test-runner和assert函数，帮助mocking、spying等。在以下基本测试中，我们手动实例化这些类，并确保控制器和服务满足API契约。

```typescript
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}

```

> 提示 **Hint** 将测试文件located near the classes they test。测试文件应该有 __INLINE_CODE_15__ 或 __INLINE_CODE_16__ 后缀。

由于上述示例太简单，我们并没有真正测试Nest特性。实际上，我们甚至没有使用依赖注入（注意我们将__INLINE_CODE_17__ 实例传递给 __INLINE_CODE_18__）。这种测试形式通常称为 **isolation testing**，因为它独立于框架。让我们引入一些更advanced的功能，以帮助您测试使用Nest特性更广泛的应用程序。

#### 测试工具

__INLINE_CODE_19__ 包提供了一组工具，用于实现更 robust 的测试过程。让我们重写前一个示例，使用内置的 __INLINE_CODE_20__ 类：

```shell
$ nest g resource users

> ? What transport layer do you use? GraphQL (code first)
> ? Would you like to generate CRUD entry points? Yes
> CREATE src/users/users.module.ts (224 bytes)
> CREATE src/users/users.resolver.spec.ts (525 bytes)
> CREATE src/users/users.resolver.ts (1109 bytes)
> CREATE src/users/users.service.spec.ts (453 bytes)
> CREATE src/users/users.service.ts (625 bytes)
> CREATE src/users/dto/create-user.input.ts (195 bytes)
> CREATE src/users/dto/update-user.input.ts (281 bytes)
> CREATE src/users/entities/user.entity.ts (187 bytes)
> UPDATE src/app.module.ts (312 bytes)

```

__INLINE_CODE_21__ 类有助于提供一个应用程序执行上下文，使其 mock整个Nest 运行时，但提供了 hooks使得您可以轻松管理类实例，包括mocking和override。__INLINE_CODE_22__ 类的 __INLINE_CODE_23__ 方法接受模块元数据对象作为参数（您在 __INLINE_CODE_24__ 装饰器中传递的同一个对象）。这方法返回一个 __INLINE_CODE_25__ 实例，该实例提供了一些方法。在单元测试中，重要的是 __INLINE_CODE_26__ 方法。这方法启动了模块，并返回一个准备好用于测试的模块。

> 提示 **Hint** __INLINE_CODE_29__ 方法是 **异步** 的，因此需要等待。模块编译完成后，您可以使用 __INLINE_CODE_30__ 方法检索任何 **静态** 实例（控制器和提供者）。

__INLINE_CODE_31__ 继承自 __LINK_153__ 类，因此它可以动态解析作用域提供者（瞬态或请求作用域）。使用 __INLINE_CODE_32__ 方法（ __INLINE_CODE_33__ 方法只能检索单个实例）来实现。

```typescript
import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Mutation(() => User)
  createUser(@Args('createUserInput') createUserInput: CreateUserInput) {
    return this.usersService.create(createUserInput);
  }

  @Query(() => [User], { name: 'users' })
  findAll() {
    return this.usersService.findAll();
  }

  @Query(() => User, { name: 'user' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.usersService.findOne(id);
  }

  @Mutation(() => User)
  updateUser(@Args('updateUserInput') updateUserInput: UpdateUserInput) {
    return this.usersService.update(updateUserInput.id, updateUserInput);
  }

  @Mutation(() => User)
  removeUser(@Args('id', { type: () => Int }) id: number) {
    return this.usersService.remove(id);
  }
}

```

> 警告 **Warning** __INLINE_CODE_34__ 方法返回提供者的唯一实例，从其自己的 **DI 容器子树** 中。每个子树都有唯一的上下文标识符。因此，如果您多次调用该方法并比较实例引用，您将看到它们不相等。

> 提示 **Hint** 了解模块参考特性 __LINK_154__。Here is the translation of the provided English technical documentation to Chinese:

**.override**

在测试中，您可以使用 __LINK_155__ 来覆盖生产环境中的提供者，以便进行测试。例如，您可以模拟数据库服务，而不是连接到实际数据库。我们将在下一节中 discussing overrides，但它们也可以用于单元测试中。

__HTML_TAG_90____HTML_TAG_91__

#### 自动 mocks

Nest 也允许您定义一个 mock 工厂，以便将其应用于所有缺失的依赖项。这对于在类中存在大量依赖项的场景非常有用。例如，使用 __INLINE_CODE_35__ 和 __INLINE_CODE_36__ 方法将 mock 工厂与依赖项 mocks 链接起来。这个工厂可以返回一个 mock 实现，可以选择性地接收一个 token，这是一个有效的 Nest 提供者实例。下面是一个使用 __LINK_156__ 和 __INLINE_CODE_38__ 的 mock 工厂的示例。

__CODE_BLOCK_4__

您也可以从 testing 容器中检索这些 mocks，如您通常检索自定义提供者的方式。

> info **提示** 可以将通用的 mock 工厂，例如 __INLINE_CODE_41__ 从 __LINK_157__ 中直接传递。

> info **提示** __INLINE_CODE_43__ 和 __INLINE_CODE_44__ 提供者不能自动 mock，因为它们已经在上下文中预定义了。然而，它们可以使用自定义提供语法或 __INLINE_CODE_45__ 方法进行重写。

#### 端到端测试

与单元测试不同，端到端（e2e）测试关注的是类和模块之间的交互关系，在更高的抽象层次上关注的是用户与生产系统的交互关系。随着应用程序的增长，它变得难以手动测试每个 API 端点的端到端行为。自动端到端测试帮助我们确保系统的整体行为正确地满足项目要求。要进行 e2e 测试，我们使用与单元测试相同的配置。此外，Nest 使得使用 __LINK_158__ 库来模拟 HTTP 请求变得非常容易。

__CODE_BLOCK_5__

> info **提示** 如果您使用 __LINK_159__ 作为 HTTP 适配器，它需要不同的配置，并且具有内置的测试功能：
>
> __CODE_BLOCK_6__

在这个示例中，我们基于前面的概念继续。除了使用 __INLINE_CODE_46__ 方法，我们现在使用 __INLINE_CODE_47__ 方法来实例化完整的 Nest 运行环境。

有一些需要注意的限制之一是，当应用程序使用 __INLINE_CODE_48__ 方法编译时，__INLINE_CODE_49__ 将在该时间点是 undefined 的。这是因为在这个编译阶段，还没有创建 HTTP 适配器或服务器。如果您的测试需要 __INLINE_CODE_50__，您可以使用 __INLINE_CODE_51__ 方法创建应用程序实例，或者重构项目以避免在初始化依赖关系图时出现这个依赖关系。

好的，让我们分解这个示例：

我们将运行的应用程序保存在我们的 __INLINE_CODE_52__ 变量中，以便使用它来模拟 HTTP 请求。

我们使用 __INLINE_CODE_53__ 函数从 Supertest 中模拟 HTTP 测试。我们想这些 HTTP 请求都路由到我们的运行的 Nest 应用程序，所以我们将 __INLINE_CODE_54__ 函数传递给 HTTP listener，这是 Nest 应用程序的基础（可能由 Express 平台提供）。因此，构造 __INLINE_CODE_55__。调用 __INLINE_CODE_56__ 返回一个包装的 HTTP 服务器，现在连接到 Nest 应用程序，该服务器公开方法来模拟实际 HTTP 请求。例如，使用 __INLINE_CODE_57__ 将初始化一个请求到 Nest 应用程序，这与实际 HTTP 请求 __INLINE_CODE_58__ 类似。

在这个示例中，我们还提供了 __INLINE_CODE_59__ 的替代实现，这只是返回一个硬编码的值，我们可以测试它。使用 __INLINE_CODE_60__ 提供替代实现。类似地，Nest 提供了重写模块、守卫、拦截器、过滤器和管道的方法，以便使用 __INLINE_CODE_61__、__INLINE_CODE_62__、__INLINE_CODE_63__、__INLINE_CODE_64__ 和 __INLINE_CODE_65__ 方法。

每个重写方法（except __INLINE_CODE_66__）都返回一个对象，其中包含三个方法，类似于 __LINK_160__：

- __INLINE_CODE_67__: 您提供一个将被实例化以提供实例以重写对象（提供者、守卫等）的类。
- __INLINE_CODE_68__: 您提供一个将重写对象的实例。
- __INLINE_CODE_69__: 您提供一个返回实例将重写对象的函数。Here is the translation of the English technical documentation to Chinese:

On the other hand, 提供者返回一个对象，其中包含了__INLINE_CODE_71__方法，可以用来提供一个将会覆盖原始模块的模块，例如：

__CODE_BLOCK_7__

每种覆盖方法都返回__INLINE_CODE_72__实例，可以链式调用其他方法在__LINK_161__中。您应该在链式调用结束时使用__INLINE_CODE_73__来使Nest实例化和初始化模块。

在某些情况下，您可能想要提供一个自定义的日志记录器，例如在测试中（例如，在CI服务器上）。使用__INLINE_CODE_74__方法并传递一个实现__INLINE_CODE_75__接口的对象来告诉__INLINE_CODE_76__如何在测试中记录日志（默认情况下，只会记录“error”日志到控制台）。

编译后的模块具有以下有用的方法，如下表所示：

__HTML_TAG_92__
  __HTML_TAG_93__
    __HTML_TAG_94__
      __HTML_TAG_95__createNestApplication()__HTML_TAG_96__
    __HTML_TAG_97__
    __HTML_TAG_98__
      创建并返回一个Nest应用程序（__HTML_TAG_99__INestApplication__HTML_TAG_100__实例），基于给定的模块。
     请注意，您必须手动初始化应用程序使用__HTML_TAG_101__init()__HTML_TAG_102__方法。
    __HTML_TAG_103__
  __HTML_TAG_104__
  __HTML_TAG_105__
    __HTML_TAG_106__
      __HTML_TAG_107__createNestMicroservice()__HTML_TAG_108__
    __HTML_TAG_109__
    __HTML_TAG_110__
      创建并返回一个Nest微服务（__HTML_TAG_111__INestMicroservice__HTML_TAG_112__实例），基于给定的模块。
    __HTML_TAG_113__
  __HTML_TAG_114__
  __HTML_TAG_115__
    __HTML_TAG_116__
      __HTML_TAG_117__get()__HTML_TAG_118__
    __HTML_TAG_119__
    __HTML_TAG_120__
      获取应用程序上下文中可用的控制器或提供者的静态实例（包括守卫、过滤器等）。继承自__HTML_TAG_121__module reference__HTML_TAG_122__类。
    __HTML_TAG_123__
  __HTML_TAG_124__
  __HTML_TAG_125__
     __HTML_TAG_126__
      __HTML_TAG_127__resolve()__HTML_TAG_128__
    __HTML_TAG_129__
    __HTML_TAG_130__
      获取动态创建的作用域实例（请求或瞬态）中的控制器或提供者（包括守卫、过滤器等），可用在应用程序上下文中。继承自__HTML_TAG_131__module reference__HTML_TAG_132__类。
    __HTML_TAG_133__
  __HTML_TAG_134__
  __HTML_TAG_135__
    __HTML_TAG_136__
      __HTML_TAG_137__select()__HTML_TAG_138__
    __HTML_TAG_139__
    __HTML_TAG_140__
      在模块的依赖图中导航，可以用来获取特定的实例（在__HTML_TAG_141__strict: true__HTML_TAG_142__模式下，与__HTML_TAG_143__get()__HTML_TAG_144__方法一起使用）。
    __HTML_TAG_145__
  __HTML_TAG_146__
__HTML_TAG_147__

> info **Hint** 将您的e2e测试文件放在__INLINE_CODE_77__目录中。测试文件应该具有__INLINE_CODE_78__后缀。

#### Override globally registered enhancers

如果您已经注册了一个全局守卫（或pipe、拦截器、过滤器），您需要更多的步骤来Override该增强器。以原始注册为例：

__CODE_BLOCK_8__

这是注册守卫作为“multi”-provider通过__INLINE_CODE_79__令牌。要能够替换__INLINE_CODE_80__，注册需要使用现有的提供者在该槽位：

__CODE_BLOCK_9__

> info **Hint** 将__INLINE_CODE_81__更改为__INLINE_CODE_82__以引用已注册的提供者，而不是让Nest将其实例化后。

现在__INLINE_CODE_83__可以在创建__INLINE_CODE_84__时被override：

__CODE_BLOCK_10__

现在所有测试都将使用__INLINE_CODE_85__在每个请求中。

#### Testing request-scoped instances

__LINK_162__提供者在每个incoming **请求**中创建唯一实例。实例在请求处理完成后被垃圾回收。这种情况存在问题，因为我们无法访问特定请求的依赖注入子树。

我们知道（基于上述部分）__INLINE_CODE_86__方法可以用来获取动态实例化的类。