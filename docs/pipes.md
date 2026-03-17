<!-- 此文件从 content/pipes.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T04:32:52.908Z -->
<!-- 源文件: content/pipes.md -->

### 管道

管道是一种带有 `Mocked<T>` 装饰器的类，实现了 `.mock().impl()` 接口。

__HTML_TAG_126__
  __HTML_TAG_127__
__HTML_TAG_128__

管道有两个典型用例：

- **转换**：将输入数据转换为所需的形式（例如，从字符串到整数）
- **验证**：评估输入数据，如果有效，则简单地将其传递给下一个处理程序；否则，抛出异常

在这两个用例中，管道操作正在被 __HTML_TAG_129__ 控制器路由处理程序处理的 `stubFn`。Nest 在方法被调用之前将插入一个管道，然后该管道将接收由方法所需的参数，并对其进行操作。任何转换或验证操作都将在该时刻发生，然后路由处理程序将被调用，以可能已被转换的参数。

Nest 带有许多内置的管道，可以直接使用。您也可以创建自己的自定义管道。在本章中，我们将介绍内置的管道，展示如何将它们绑定到路由处理程序，然后 examine  several 自定义管道，以展示如何从 scratch 创建一个。

> info **提示** 管道在异常区运行。这意味着当 Pipe 抛出异常时，它将被异常层（全局异常过滤器和当前上下文中的__LINK_177__）处理。鉴于上述原因，当在 Pipe 中抛出异常时，控制器方法将不再执行。这为您提供了在应用程序从外部来源接收数据时验证数据的最佳实践技术。

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

让我们快速浏览一下使用 `mock()`。这是一种转换用例，其中管道确保了方法处理程序参数是 JavaScript 整数（或在转换失败时抛出异常）。稍后在本章中，我们将展示一个简单的自定义实现，以便创建一个 `stub()`。以下示例技术也适用于其他内置转换管道（`mockResolvedValue()`、`@suites/doubles.jest`、`mock()`、`createMock`、`@golevelup/ts-jest` 和 `createMock`，我们将在本章中将其称为 `Test.createTestingModule()` 管道）。

#### 绑定管道

要使用管道，我们需要将管道类的实例绑定到适当的上下文。在我们的 `Test.createTestingModule()` 示例中，我们想要将管道与特定的路由处理程序方法相关联，并确保在方法被调用之前将其运行。我们使用以下构造来实现这一点，该构造将被称为绑定管道到方法参数级别：

```bash
$ npm install @nestjs/common @nestjs/core reflect-metadata

```

这 ensure 以下两种情况之一：或者我们在 __INLINE_CODE_48__ 方法中收到的参数是一个数字（与我们的 __INLINE_CODE_49__ 调用中期望的一样），或者在路由处理程序被调用之前抛出异常。

例如，假设路由被调用如下：

```bash
$ npm install --save-dev @suites/unit @suites/di.nestjs @suites/doubles.jest

```

Nest 将抛出以下异常：

```bash
$ npm install --save-dev ts-jest @types/jest jest typescript

```

异常将防止 __INLINE_CODE_50__ 方法体的执行。

在上面的示例中，我们传递了一个类（__INLINE_CODE_51__），而不是实例，留下了框架的责任来实例化，并启用依赖注入。与管道和守卫一样，我们可以将实例传递过来。将实例传递过来是有用的，如果我们想通过传递选项来自定义内置管道的行为：

```bash
$ npm install --save-dev @suites/unit @suites/di.nestjs @suites/doubles.vitest

```

绑定其他转换管道（所有的 **Parse\*** 管道）工作相同。这些管道都在验证路由参数、查询字符串参数和请求体值的上下文中工作。

例如，对于查询字符串参数：

```bash
$ npm install --save-dev @suites/unit @suites/di.nestjs @suites/doubles.sinon

```

以下是一个使用 __INLINE_CODE_52__ 来解析字符串参数和验证是否为 UUID 的示例：

```typescript
/// <reference types="@suites/doubles.jest/unit" />
/// <reference types="@suites/di.nestjs/types" />

```

> info **提示** 使用 __INLINE_CODE_53__ 时，您将解析 UUID 版本 3、4 或 5，如果您只需要特定的 UUID 版本，可以将版本传递给管道选项。

以上，我们已经看到了一些绑定内置 __INLINE_CODE_54__ 家族的示例。绑定验证管道有所不同；我们将在下一节中讨论。

> info **提示** 还可以查看 __LINK_178__ 以获取验证管道的详细示例。

#### 自定义管道

正如所提到的，您可以创建自己的自定义管道。虽然 Nest 提供了强大的内置 __INLINE_CODE_55__ 和 __INLINE_CODE_56__，让我们从 scratch 创建简单的自定义版本，以了解如何构建自定义管道。Here is the translation of the English technical documentation to Chinese:

**简单的__INLINE_CODE_57__**

从一开始，我们将简单地将输入值返回相同的值，行为像身份函数。

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

>info **提示** __INLINE_CODE_58__是一个泛型接口，任何管道都必须实现该接口。该泛型接口使用 __INLINE_CODE_59__来表示输入 __INLINE_CODE_60__ 的类型，并使用 __INLINE_CODE_61__ 来表示 __INLINE_CODE_62__ 方法的返回类型。

任何管道都必须实现 __INLINE_CODE_63__ 方法，以满足 __INLINE_CODE_64__ 接口合同。这方法有两个参数：

- __INLINE_CODE_65__
- __INLINE_CODE_66__

__INLINE_CODE_67__ 参数是当前处理的方法参数（在方法处理器方法之前），__INLINE_CODE_68__ 是当前处理的方法参数的元数据。元数据对象具有以下属性：

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
    __HTML_TAG_137__是否是请求体
      __HTML_TAG_138__@Body()__HTML_TAG_139__, 查询
      __HTML_TAG_140__@Query()__HTML_TAG_141__, 参数
      __HTML_TAG_142__@Param()__HTML_TAG_143__, 或自定义参数（了解更多
      __HTML_TAG_144__这里__HTML_TAG_145__）[__HTML_TAG_146__]
  __HTML_TAG_147__
  __HTML_TAG_148__
    __HTML_TAG_149__
      __HTML_TAG_150__metatype__HTML_TAG_151__
    __HTML_TAG_152__
    __HTML_TAG_153__
      提供参数的元类型，例如
      __HTML_TAG_154__String__HTML_TAG_155__.注意：如果您在路由处理程序方法签名中省略类型声明或使用vanilla JavaScript，值将是
      __HTML_TAG_156__undefined__HTML_TAG_157__。
    __HTML_TAG_158__
  __HTML_TAG_159__
  __HTML_TAG_160__
    __HTML_TAG_161__
      __HTML_TAG_162__data__HTML_TAG_163__
    __HTML_TAG_164__
    __HTML_TAG_165__字符串被传递到装饰器中，例如
      __HTML_TAG_166__@Body('string')__HTML_TAG_167__.如果您留下装饰器括号为空，它将是
      __HTML_TAG_168__undefined__HTML_TAG_169__。
  __HTML_TAG_170__
__HTML_TAG_172__

>警告 **警告** TypeScript接口在编译时消失。因此，如果方法参数的类型被声明为接口，而不是类，__INLINE_CODE_69__值将是__INLINE_CODE_70__。

####基于Schema的验证

让我们使我们的验证管道更加有用。查看__INLINE_CODE_71__方法中的__INLINE_CODE_72__，我们可能想要确保post体对象是有效的，然后才能尝试运行我们的服务方法。

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

让我们集中注意__INLINE_CODE_73__体参数。其类型是__INLINE_CODE_74__：

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

我们想要确保任何incoming请求到create方法包含有效的body。因此，我们需要验证__INLINE_CODE_75__对象的三个成员。我们可以在路由处理程序方法中执行该验证，但是这样将违反**单一责任原则**（SRP）。

另一种方法是创建**验证器类**并将任务委派给那里。这有缺点，即我们需要记住在每个方法中调用验证器。

或者，我们可以创建验证中间件？这将工作，但是不幸的是，我们不能创建**通用中间件**，它可以在整个应用程序中用于所有上下文。这是因为中间件不知道**执行上下文**，包括将要调用的处理器和任何参数。

这正是管道的设计用途。因此，让我们继续完善我们的验证管道。

__HTML_TAG_173____HTML_TAG_174__

####对象Schema验证

有多种方法可以在一种干净的__LINK_179__方式中执行对象验证。一个常见的方法是使用**基于Schema**的验证。让我们尝试该方法。

__LINK_180__库允许您以直观的方式创建schema。让我们创建一个验证管道，该管道使用Zod-based schema。

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

在以下代码示例中，我们创建了一个简单的类，该类将schema作为__INLINE_CODE_76__参数。然后，我们应用__INLINE_CODE_77__方法，该方法将我们的incoming参数与提供的schema进行验证。

如前所述，验证管道将返回值或抛出异常。

在下一节中，您将看到我们如何为给定的控制器方法提供适当的schema，使用__INLINE_CODE_78__装饰器。这样，使我们的验证管道在上下文中可重用，就像我们所期望的那样。

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

####将验证Earlier, we saw how to bind transformation pipes (like __INLINE_CODE_79__ and the rest of the __INLINE_CODE_80__ pipes).

Binding validation pipes is also very straightforward.

In this case, we want to bind the pipe at the method call level. In our current example, we need to do the following to use the __INLINE_CODE_81__:

1. Create an instance of the __INLINE_CODE_82__
2. Pass the context-specific Zod schema in the class constructor of the pipe
3. Bind the pipe to the method

Zod schema example:

```typescript
title=“```typescript
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

```”

```

We do that using the __INLINE_CODE_83__ decorator as shown below:

```typescript
title=“```typescript
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

```”

```

>info 提示 The __INLINE_CODE_84__ decorator is imported from the __INLINE_CODE_85__ package.

> warning 警告 __INLINE_CODE_86__ library requires the __INLINE_CODE_87__ configuration to be enabled in your __INLINE_CODE_88__ file.

#### Class validator

> warning 警告 The techniques in this section require TypeScript and are not available if your app is written using vanilla JavaScript.

Let's look at an alternate implementation for our validation technique.

Nest works well with the __LINK_181__ library. This powerful library allows you to use decorator-based validation. Decorator-based validation is extremely powerful, especially when combined with Nest's **Pipe** capabilities since we have access to the __INLINE_CODE_89__ of the processed property. Before we start, we need to install the required packages:

```typescript
title=“__CODE_BLOCK_14__”

```

Once these are installed, we can add a few decorators to the __INLINE_CODE_90__ class. Here we see a significant advantage of this technique: the __INLINE_CODE_91__ class remains the single source of truth for our Post body object (rather than having to create a separate validation class).

```typescript
title=“__CODE_BLOCK_15__”

```

> info 提示 Read more about the class-validator decorators __LINK_182__.

Now we can create a __INLINE_CODE_92__ class that uses these annotations.

```typescript
title=“__CODE_BLOCK_16__”

```

> info 提示 As a reminder, you don't have to build a generic validation pipe on your own since the __INLINE_CODE_93__ is provided by Nest out-of-the-box. The built-in __INLINE_CODE_94__ offers more options than the sample we built in this chapter, which has been kept basic for the sake of illustrating the mechanics of a custom-built pipe. You can find full details, along with lots of examples __LINK_183__.

> warning 注意 We used the __LINK_184__ library above which is made by the same author as the **class-validator** library, and as a result, they play very well together.

Let's go through this code. First, note that the __INLINE_CODE_95__ method is marked as __INLINE_CODE_96__. This is possible because Nest supports both synchronous and **asynchronous** pipes. We make this method __INLINE_CODE_97__ because some of the class-validator validations __LINK_185__ (utilize Promises).

Next note that we are using destructuring to extract the metatype field (extracting just this member from an __INLINE_CODE_98__) into our __INLINE_CODE_99__ parameter. This is just shorthand for getting the full __INLINE_CODE_100__ and then having an additional statement to assign the metatype variable.

Next, note the helper function __INLINE_CODE_101__. It's responsible for bypassing the validation step when the current argument being processed is a native JavaScript type (these can't have validation decorators attached, so there's no reason to run them through the validation step).

Next, we use the class-transformer function __INLINE_CODE_102__ to transform our plain JavaScript argument object into a typed object so that we can apply validation. The reason we must do this is that the incoming post body object, when deserialized from the network request, does **not have any type information** (this is the way the underlying platform, such as Express, works). Class-validator needs to use the validation decorators we defined for our DTO earlier, so we need to perform this transformation to treat the incoming body as an appropriately decorated object, not just a plain vanilla object.

Finally, as noted earlier, since this is a **validation pipe** it either returns the value unchanged, or throws an exception.

The last step is to bind the __INLINE_CODE_103__. Pipes can be parameter-scoped, method-scoped, controller-scoped, or global-scoped. Earlier, with our Zod-based validation pipe, we saw an example of binding the pipe at the method level.
In the example below, we'll bind the pipe instance to the route handler __INLINE_CODE_104__ decorator so that our pipe is called to validate the post body.

```typescript
title=“__CODE_BLOCK_17__”

```

Parameter-scoped pipes are useful when the validation logic concerns only one specified parameter.

#### Global scoped pipes

Since the __INLINE_CODE_105__ was created to be as generic as possible, we can realize its full utility by setting it up as a **global-scoped** pipe so that it is applied to every route handler across the entire application.

```typescript
title=“__CODE_BLOCK_18__”

```> warning **Notice** 在__HTML_TAG_175__混合应用__HTML_TAG_176__中,__INLINE_CODE_106__方法不会为网关和微服务设置管道。对于“标准”（非混合）微服务应用,__INLINE_CODE_107__将全局地安装管道。

全局管道将在整个应用程序中，针对每个控制器和每个路由处理器使用。

注意，在依赖注入方面，注册在任何模块外（如示例中使用__INLINE_CODE_108__）的全局管道不能注入依赖项，因为绑定已经在没有模块上下文中进行了。要解决这个问题，可以在任何模块中直接设置全局管道，使用以下构造：

__CODE_BLOCK_19__

> info **Hint** 在使用这种方法来对pipe进行依赖注入时，注意，即使在使用这个构造的地方进行模块，这个pipe实际上仍然是全局的。应该在pipe（如示例中使用__INLINE_CODE_109__）所定义的模块中执行该操作。另外,__INLINE_CODE_110__也不是注册自定义提供者的唯一方式。了解更多__LINK_186__。

#### 内置的 ValidationPipe

作为一个提示，您不需要自己构建一个通用的验证管道，因为Nest提供了__INLINE_CODE_111__。内置的__INLINE_CODE_112__提供了更多选项，而我们在本章中构建的示例只是为了演示自定义pipe的基本 mechanics。您可以在__LINK_187__中找到更多详细信息和示例。

#### 转换用例

验证不是自定义pipe的唯一用例。我们在本章开头提到，pipe也可以**转换**输入数据以达到所需的格式。这是因为__INLINE_CODE_113__函数返回的值完全覆盖了参数的前一个值。

何时有用？考虑一下，客户端传递的数据需要在处理路由处理器方法之前进行一些修改——例如将字符串转换为整数——或者一些必填数据字段可能缺失，我们想要应用默认值。**转换pipe**可以执行这些操作 bằng在客户端请求和请求处理器之间插入一个处理函数。

以下是一个简单的__INLINE_CODE_114__，负责将字符串解析为整数值。(如上所述，Nest有一个更加复杂的__INLINE_CODE_115__；我们包括这个示例，以便演示自定义转换pipe)。

__CODE_BLOCK_20__

然后，我们可以将这个pipe绑定到所选参数，如下所示：

__CODE_BLOCK_21__

另一个有用的转换用例将是从数据库中选择**现有用户**实体，使用请求中的id：

__CODE_BLOCK_22__

我们将实现这个pipe的实现留给读者，但注意，这些转换pipe接收输入值（一个__INLINE_CODE_116__）并返回输出值（一个__INLINE_CODE_117__对象）。这可以使您的代码更加声明式和__LINK_188__，通过将 boilerplate 代码抽象到常见pipe中。

#### 提供默认值

__INLINE_CODE_118__ pipe期望参数的值被定义。它们在接收__INLINE_CODE_119__或__INLINE_CODE_120__值时抛出异常。要允许端点处理缺少querystring参数值，我们必须在__INLINE_CODE_121__ pipe操作这些值之前提供默认值。__INLINE_CODE_122__ 服务这个目的。简单地在__INLINE_CODE_124__装饰器中实例化一个__INLINE_CODE_123__，在相关__INLINE_CODE_125__ pipe之前，如下所示：

__CODE_BLOCK_23__