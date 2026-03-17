<!-- 此文件从 content/pipes.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:05:29.398Z -->
<!-- 源文件: content/pipes.md -->

### 管道

管道是一种使用 `Mocked<T>` 装饰器注解的类，实现了 `.mock().impl()` 接口。

__HTML_TAG_126__
  __HTML_TAG_127__
__HTML_TAG_128__

管道有两个典型用例：

- **转换**：将输入数据转换为所需的形式（例如，从字符串到整数）
- **验证**：评估输入数据，如果有效，则简单地将其传递给下一个处理程序；否则，抛出异常

在这两个用例中，管道都在处理 `stubFn` 的 __HTML_TAG_129__ 控制器路由处理程序中操作。Nest 在方法被调用之前插入管道，并将该方法的参数传递给管道，然后在该方法中操作。如果管道执行了转换或验证操作，则将参数传递给下一个处理程序。

Nest 提供了一些内置的管道，您可以直接使用它们。您也可以创建自己的自定义管道。在本章中，我们将介绍内置的管道，并展示如何将它们绑定到路由处理程序中。然后，我们将查看一些自定义管道，以展示如何从 scratch 创建一个。

> 信息 **提示** 管道在异常区域中运行。这意味着当 Pipe 抛出异常时，它将被异常层处理（全局异常过滤器和当前上下文中的任何 __LINK_177__）。因此，应该清楚的是，当在 Pipe 中抛出异常时，不会执行路由处理程序的方法。这给出了一个在应用程序的系统边界验证来自外部来源的数据的最佳实践。

#### 内置管道

Nest 提供了以下内置管道：

- `jest.fn()`
- `vi.fn()`
- `sinon.stub()`
- `TestBed.sociable()`
- `.expose()`
- `.expose(Logger)`
- `Logger`
- `unitRef.get()`
- `TestBed`
- `mock()`

它们来自 `stub()` 包。

让我们快速浏览一下使用 `mock()` 的示例。这是一个 **转换** 的用例，pipe 确保方法处理程序参数被转换为 JavaScript 整数（或抛出异常如果转换失败）。在本章后面，我们将展示一个简单的自定义实现 `stub()`。以下示例技术也适用于其他内置转换管道（`mockResolvedValue()`、`@suites/doubles.jest`、`mock()`、`createMock`、`@golevelup/ts-jest` 和 `createMock`，在本章中我们将其称为 `Test.createTestingModule()` 管道）。

#### 绑定管道

要使用管道，我们需要将管道类的实例绑定到适当的上下文中。在我们的 `Test.createTestingModule()` 示例中，我们想要将管道与特定的路由处理程序方法相关联，并确保它在方法被调用之前运行。我们使用以下构造来实现该操作，该构造将被称为在方法参数级别绑定管道：

```bash
$ npm install @nestjs/common @nestjs/core reflect-metadata

```

这确保了以下两个条件之一：或者我们在 __INLINE_CODE_48__ 方法中接收的参数是一个数字（正如我们对 __INLINE_CODE_49__ 的调用），或者在路由处理程序被调用之前抛出异常。

例如，假设路由被调用如下：

```bash
$ npm install --save-dev @suites/unit @suites/di.nestjs @suites/doubles.jest

```

Nest 将抛出以下异常：

```bash
$ npm install --save-dev ts-jest @types/jest jest typescript

```

异常将防止 __INLINE_CODE_50__ 方法的主体执行。

在上面的示例中，我们传递了一个类 (__INLINE_CODE_51__),而不是实例，留下了框架的责任来实例化，并启用依赖注入。像管道和守卫一样，我们也可以传递实时实例。传递实时实例有助于自定义内置管道的行为通过传递选项：

```bash
$ npm install --save-dev @suites/unit @suites/di.nestjs @suites/doubles.vitest

```

绑定其他转换管道（所有 **Parse\*** 管道）工作方式类似。这些管道都在验证路由参数、查询字符串参数和请求体值的上下文中工作。

例如，对于查询字符串参数：

```bash
$ npm install --save-dev @suites/unit @suites/di.nestjs @suites/doubles.sinon

```

以下是一个使用 __INLINE_CODE_52__ 将字符串参数解析为 UUID 的示例：

```typescript
/// <reference types="@suites/doubles.jest/unit" />
/// <reference types="@suites/di.nestjs/types" />

```

> 信息 **提示** 使用 __INLINE_CODE_53__ 时，您将在版本 3、4 或 5 中解析 UUID。如果您只需要特定的 UUID 版本，您可以在 pipe 选项中传递版本。

在上面，我们看到了一些绑定 __INLINE_CODE_54__ 内置管道的示例。绑定验证管道有所不同，我们将在下一节中讨论。

> 信息 **提示** 请查看 __LINK_178__ 以获取验证管道的广泛示例。

#### 自定义管道

正如提到的，您可以创建自己的自定义管道。虽然 Nest 提供了一个 robust 的 __INLINE_CODE_55__ 和 __INLINE_CODE_56__,让我们从 scratch 创建一个简单的自定义版本，以便了解自定义管道是如何构建的。Here is the translated Chinese version of the technical documentation:

**警告** __INLINE_CODE_57__ 的初始实现将简单地将输入值 immediate return, behaves like an identity function。

```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserRepository {
  async findById(id: string): Promise<User | null> {
    // Database query
  }

  async save(user: User): Promise<User> {
    // Database save
  }
}

```

> 提示 **Hint** __INLINE_CODE_58__ 是一个泛型接口，任何管道都必须实现该接口。该泛型接口使用 __INLINE_CODE_59__ 表示输入 __INLINE_CODE_60__ 的类型，并使用 __INLINE_CODE_61__ 表示 __INLINE_CODE_62__ 方法的返回类型。

任何管道都必须实现 __INLINE_CODE_63__ 方法，以满足 __INLINE_CODE_64__ 接口合约。该方法有两个参数：

- __INLINE_CODE_65__
- __INLINE_CODE_66__

__INLINE_CODE_67__ 参数是当前处理的方法参数（在路由处理方法之前），而 __INLINE_CODE_68__ 是当前处理的方法参数的元数据。元数据对象具有以下属性：

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { Logger } from '@nestjs/common';

@Injectable()
export class UserService {
  constructor(
    private repository: UserRepository,
    private logger: Logger,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.repository.findById(id);
    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }
    this.logger.log(`Found user ${id}`);
    return user;
  }

  async create(email: string, name: string): Promise<User> {
    const user = { id: generateId(), email, name };
    await this.repository.save(user);
    this.logger.log(`Created user ${user.id}`);
    return user;
  }
}

```

这些属性描述了当前处理的参数。

__HTML_TAG_131__
  __HTML_TAG_132__
    __HTML_TAG_133__
      __HTML_TAG_134__type__HTML_TAG_135__
    __HTML_TAG_136__
    __HTML_TAG_137__表示参数是否为 body
      __HTML_TAG_138__@Body()__HTML_TAG_139__, query
      __HTML_TAG_140__@Query()__HTML_TAG_141__, param
      __HTML_TAG_142__@Param()__HTML_TAG_143__, 或自定义参数（请参阅
      __HTML_TAG_144__这里__HTML_TAG_145__）。__HTML_TAG_146__
  __HTML_TAG_147__
  __HTML_TAG_148__
    __HTML_TAG_149__
      __HTML_TAG_150__metatype__HTML_TAG_151__
    __HTML_TAG_152__
    __HTML_TAG_153__
      提供参数的元类型，例如，
      __HTML_TAG_154__String__HTML_TAG_155__. 注意：值为
      __HTML_TAG_156__undefined__HTML_TAG_157__ 如果你在路由处理方法签名中省略了类型声明，或者使用了原生 JavaScript。
    __HTML_TAG_158__
  __HTML_TAG_159__
  __HTML_TAG_160__
    __HTML_TAG_161__
      __HTML_TAG_162__data__HTML_TAG_163__
    __HTML_TAG_164__
    __HTML_TAG_165__传递给装饰器的字符串，例如
      __HTML_TAG_166__@Body('string')__HTML_TAG_167__. 如果你留下了装饰器括号为空，它将
      __HTML_TAG_168__undefined__HTML_TAG_169__。
  __HTML_TAG_170__
__HTML_TAG_172__

> 警告 **Warning** TypeScript 接口在转换时消失。因此，如果方法参数的类型声明为接口，而不是类，__INLINE_CODE_69__ 值将变为 __INLINE_CODE_70__。

#### 基于架构的验证

让我们使我们的验证 pipe 更加有用。查看 __INLINE_CODE_71__ 方法中的 __INLINE_CODE_72__，我们可能想确保 post body 对象是有效的，然后才能尝试运行我们的服务方法。

```typescript
import { TestBed, type Mocked } from '@suites/unit';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { Logger } from '@nestjs/common';

describe('User Service Unit Spec', () => {
  let userService: UserService;
  let repository: Mocked<UserRepository>;
  let logger: Mocked<Logger>;

  beforeAll(async () => {
    const { unit, unitRef } = await TestBed.solitary(UserService).compile();

    userService = unit;
    repository = unitRef.get(UserRepository);
    logger = unitRef.get(Logger);
  });

  it('should find user by id', async () => {
    const user = { id: '1', email: 'test@example.com', name: 'Test' };
    repository.findById.mockResolvedValue(user);

    const result = await userService.findById('1');

    expect(result).toEqual(user);
    expect(logger.log).toHaveBeenCalled();
  });
});

```

让我们聚焦于 __INLINE_CODE_73__ body 参数。其类型为 __INLINE_CODE_74__：

```typescript
import { TestBed } from '@suites/unit';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';

describe('User Service Unit Spec - pre-configured', () => {
  let unit: UserService;
  let repository: Mocked<UserRepository>;
  
  beforeAll(async () => {
    const { unit: underTest, unitRef } = await TestBed.solitary(UserService)
      .mock(UserRepository)
      .impl(stubFn => ({
        findById: stubFn().mockResolvedValue({ id: '1', email: 'test@example.com', name: 'Test' })
      }))
      .compile();
    
    repository = unitRef.get(UserRepository);
    unit = underTest;
  })
  
  it('should find user with pre-configured mock', async () => {
    const result = await unit.findById('1');
    
    expect(repository.findById).toHaveBeenCalled();
    expect(result.email).toBe('test@example.com');
  });
});

```

我们想确保每个 incoming 请求到 create 方法包含有效的 body。因此，我们需要验证 __INLINE_CODE_75__ 对象的三个成员。我们可以在路由处理方法中执行验证，但这样将违反 **单一责任原则** (SRP)。

另一种方法是创建 **验证器类**，并将验证任务委派给该类。这有了一个缺点，即我们需要记住在每个方法中调用该验证器。

还有一种方法是创建验证 middleware。然而，这种方法不可行，因为 middleware 不知道 **执行上下文**，包括将被调用的处理程序和任何参数。

这正是管道设计的用途。因此，让我们继续完善我们的验证 pipe。

__HTML_TAG_173____HTML_TAG_174__

#### 对象架构验证

有多种方法可以进行对象验证，以保持 __LINK_179__ 的干净方式。一个常见的方法是使用 **架构基于** 的验证。让我们尝试该方法。

__LINK_180__ 库允许您以直观的方式创建架构，具有可读的 API。让我们创建一个使用 Zod-based 架构的验证 pipe。

首先，安装所需的包：

```typescript
import { TestBed, Mocked } from '@suites/unit';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { Logger } from '@nestjs/common';

describe('UserService - with real logger', () => {
  let userService: UserService;
  let repository: Mocked<UserRepository>;

  beforeAll(async () => {
    const { unit, unitRef } = await TestBed.sociable(UserService)
      .expose(Logger)
      .compile();

    userService = unit;
    repository = unitRef.get(UserRepository);
  });

  it('should log when finding user', async () => {
    const user = { id: '1', email: 'test@example.com' };
    repository.findById.mockResolvedValue(user);

    await userService.findById('1');

    // Logger actually executes, no mock needed
  });
});

```

在下面的代码示例中，我们创建了一个简单的类，它将 schema 作为 __INLINE_CODE_76__ 参数。然后，我们应用 __INLINE_CODE_77__ 方法，该方法将我们的 incoming 参数验证为提供的架构。

如前所述，验证 pipe 或返回未修改的值或抛出异常。

在下一节中，您将看到我们如何使用 __INLINE_CODE_78__ 装饰器为给定的控制器方法提供适当的架构。这样使我们的验证 pipe 可以在多个上下文中重用，如我们所设想。

```typescript
import { Injectable, Inject } from '@nestjs/common';

export const CONFIG_OPTIONS = 'CONFIG_OPTIONS';

@Injectable()
export class ConfigService {
  constructor(
    @Inject(CONFIG_OPTIONS) private options: { apiKey: string },
  ) {}

  getApiKey(): string {
    return this.options.apiKey;
  }
}

```

#### 绑定Here is the translation of the English technical documentation to Chinese:

之前，我们已经了解了如何将变换管道（如__INLINE_CODE_79__和其他__INLINE_CODE_80__管道）绑定。

绑定验证管道也非常简单。

在这种情况下，我们需要在方法调用级别绑定管道。在我们的当前示例中，我们需要执行以下步骤，以使用__INLINE_CODE_81__：

1. 创建__INLINE_CODE_82__的实例
2. 将特定的Zod模式在__INLINE_CODE_82__类构造函数中传递
3. 将管道绑定到方法中

Zod模式示例：

```typescript
import { TestBed } from '@suites/unit';
import { ConfigService, CONFIG_OPTIONS, ConfigOptions } from './config.service';

describe('Config Service Unit Spec', () => {
  let configService: ConfigService;
  let options: ConfigOptions;

  beforeAll(async () => {
    const { unit, unitRef } = await TestBed.solitary(ConfigService).compile();
    configService = unit;

    options = unitRef.get<ConfigOptions>(CONFIG_OPTIONS);
  });

  it('should return api key', () => { ... });
});

```

我们使用__INLINE_CODE_83__装饰器来实现，如下所示：

```typescript
import { mock } from '@suites/unit';
import { UserRepository } from './user.repository';

describe('User Service Unit Spec', () => {
  it('should work with direct mocks', async () => {
    const repository = mock<UserRepository>();
    const logger = mock<Logger>();

    const service = new UserService(repository, logger);

    // ...
  });
});

```

> info **提示**__INLINE_CODE_84__装饰器来自__INLINE_CODE_85__包。

> warning **警告**__INLINE_CODE_86__库需要在__INLINE_CODE_88__文件中启用__INLINE_CODE_87__配置。

#### Class validator

> warning **警告**本节中的技术要求 TypeScript，並且在使用 vanilla JavaScript 的应用程序中不可用。

让我们来看一下我们的验证技术的另一种实现。

Nest 和__LINK_181__库非常搭配。这款强大的库允许您使用装饰器进行验证。装饰器验证非常强大，特别是在结合 Nest 的**Pipe**能力时，因为我们可以访问处理后的属性的__INLINE_CODE_89__。在开始前，我们需要安装 required 包：

__CODE_BLOCK_14__

安装完成后，我们可以将几个装饰器添加到__INLINE_CODE_90__类中。在这里，我们看到这个技术的优点：__INLINE_CODE_91__类保持了我们的 Post体对象的唯一来源（而不是创建一个单独的验证类）。

__CODE_BLOCK_15__

> info **提示**了解更多关于 class-validator 装饰器的信息__LINK_182__。

现在，我们可以创建一个__INLINE_CODE_92__类，该类使用这些注解。

__CODE_BLOCK_16__

> info **提示**作为一个提示，你不需要自己构建一个通用验证管道，因为Nest已经提供了一个 out-of-the-box 的__INLINE_CODE_93__。该内置的__INLINE_CODE_94__提供了更多选项，而我们在本章中构建的示例只是为了演示自定义管道的机制。你可以找到完整信息、许多示例__LINK_183__。

> warning **注意**我们在上面使用了__LINK_184__库，该库的作者也是 class-validator 库的作者，因此他们之间非常相互协作。

让我们来看一下这段代码。首先，注意__INLINE_CODE_95__方法被标记为__INLINE_CODE_96__。这是因为Nest 支持同步和异步的管道。我们将这个方法标记为__INLINE_CODE_97__，因为一些class-validator验证__LINK_185__（使用 Promise）。

接下来，注意我们使用解构赋值来提取 metatype 字段（从__INLINE_CODE_98__中提取只有这个成员）到我们的__INLINE_CODE_99__参数。这只是对获取整个__INLINE_CODE_100__并将 metatype 变量分配的简写形式。

接下来，注意 helper 函数__INLINE_CODE_101__。它负责 bypassing 验证步骤，当当前被处理的参数是 native JavaScript 类型时（这些类型不能有验证装饰器附加，因此没有理由运行它们通过验证步骤）。

最后，我们使用 class-transformer 函数__INLINE_CODE_102__将我们的plain JavaScript 参数对象转换为类型化对象，以便应用验证。我们需要这样做，因为 incoming post body 对象，在从网络请求中反序列化时，没有类型信息（这是底层平台，如 Express，工作的方式）。class-validator 需要使用我们之前定义的 DTO 验证装饰器，因此我们需要执行这个转换，以将 incoming body 对象视为一个适当装饰的对象，而不是一个plain vanilla 对象。

最后一步是绑定__INLINE_CODE_103__。管道可以是参数范围、方法范围、控制器范围或全局范围。之前，我们已经在 Zod 基础上的验证管道中看到过一个方法级别的绑定示例。在下面的示例中，我们将绑定管道实例到路由处理程序__INLINE_CODE_104__装饰器，以便我们的 pipe 被调用以验证 post body。

__CODE_BLOCK_17__

参数范围管道非常有用，因为验证逻辑只关心一个指定参数。

#### Global scoped pipes

由于__INLINE_CODE_105__被创建为尽可能通用的，因此我们可以通过将其设置为**全局范围**管道，以便将其应用于应用程序的每个路由处理程序。

__CODE_BLOCK_18__> 警告 **注意** 在__HTML_TAG_175__混合应用__HTML_TAG_176__中,__INLINE_CODE_106__方法不会为网关和微服务设置管道。对于标准（非混合）微服务应用,__INLINE_CODE_107__将全局安装管道。

全局管道在整个应用程序中使用，每个控制器和路由处理程序都可以使用。

请注意，在依赖注入方面，注册在模块外（如上面的示例）global pipe 不能注入依赖项，因为绑定已经在没有模块上下文中的位置进行了。在解决这个问题时，可以在任何模块中直接使用以下结构来设置全局管道：

__CODE_BLOCK_19__

> 提示 **提示** 使用这种方法对pipe进行依赖注入时，请注意，管道无论是在哪个模块中使用，都将是全局的。应该在pipe定义的模块中进行该操作。也可以使用__INLINE_CODE_110__来处理自定义提供者注册。了解更多__LINK_186__。

#### 内置 ValidationPipe

作为回忆，你不需要自己构建通用验证管道，因为Nest提供了__INLINE_CODE_111__。内置__INLINE_CODE_112__提供了更多选项，而我们在本章中构建的示例pipe保持基本，以便illustrate 自定义pipe的 mechanics。你可以在__LINK_187__中找到详细信息和大量示例。

#### 变换用例

验证不是自定义pipe的唯一用例。我们在本章开头提到，pipe也可以**转换**输入数据到所需格式。这是因为__INLINE_CODE_113__函数返回的值完全覆盖了参数的前一个值。

什么时候这是有用的？考虑一下，客户端传递的数据需要进行一些变化——例如将字符串转换为整数——才能被路由处理程序正确处理。此外，一些必需的数据字段可能缺失，我们想应用默认值。**转换pipe**可以在客户端请求和请求处理程序之间插入处理函数。

以下是一个简单的__INLINE_CODE_114__，用于将字符串转换为整数值（如上所述，Nest有一个更复杂的__INLINE_CODE_115__；我们包括这个示例以便展示自定义转换pipe）。

__CODE_BLOCK_20__

然后，我们可以将该pipe绑定到所选参数，如下所示：

__CODE_BLOCK_21__

另一个有用的转换用例是从数据库中选择一个**现有用户**实体，使用请求中的id：

__CODE_BLOCK_22__

我们将留下该pipe的实现，但注意像所有其他转换pipe一样，它接收输入值（一个__INLINE_CODE_116__）并返回输出值（一个__INLINE_CODE_117__对象）。这可以使您的代码更声明式和__LINK_188__，通过将 boilerplate 代码抽象到pipe中从而简化您的处理程序。

#### 提供默认值

__INLINE_CODE_118__ pipe 期望参数的值是已定义的。它们在收到__INLINE_CODE_119__或__INLINE_CODE_120__值时抛出异常。为了允许端点处理缺少的查询字符串参数值，我们需要在__INLINE_CODE_121__ pipe 运行之前提供默认值。__INLINE_CODE_122__ 便于实现该目的。简单地在 __INLINE_CODE_124__ 装饰器中实例化一个 __INLINE_CODE_123__，如下所示：

__CODE_BLOCK_23__