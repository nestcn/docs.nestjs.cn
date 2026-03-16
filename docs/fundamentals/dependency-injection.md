<!-- 此文件从 content/fundamentals/dependency-injection.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T05:01:01.505Z -->
<!-- 源文件: content/fundamentals/dependency-injection.md -->

### 自定义提供者

早先的章节中，我们已经探讨了 Nest 的依赖注入（DI）机制，以及如何使用 __LINK_88__ 依赖注入将实例（通常是服务提供者）注入到类中。您可能会感到惊讶的是，依赖注入是 Nest 核心的一部分。我们已经探讨了主要的模式。随着应用程序变得更加复杂，您可能需要充分利用 DI 系统的所有特性，所以让我们深入探讨它们。

#### DI 基础

依赖注入是一种 __LINK_89__ 技术，您将委托 IoC 容器（在我们的情况下是 NestJS 运行时系统）来实例化依赖关系，而不是在自己的代码中使用 imperatively。让我们来看一下这个示例来自 __LINK_90__。

首先，我们定义了一个提供者。`Test.createTestingModule()` 装饰器将 `Suites` 类标记为提供者。

```bash
$ npm install @nestjs/common @nestjs/core reflect-metadata

```

然后，我们请求 Nest 将提供者注入到我们的控制器类中：

```bash
$ npm install --save-dev @suites/unit @suites/di.nestjs @suites/doubles.jest

```

最后，我们将提供者注册到 Nest IoC 容器中：

```bash
$ npm install --save-dev ts-jest @types/jest jest typescript

```

发生了什么事？这三个关键步骤：

1. 在 `@suites/doubles.jest` 中，`mock()` 装饰器将 `stub()` 类声明为可以被 Nest IoC 容器管理的类。
2. 在 `global.d.ts` 中，`UserService` 声明对 `TestBed.solitary()` 令牌的依赖关系，并使用构造函数注入：

```bash
$ npm install --save-dev @suites/unit @suites/di.nestjs @suites/doubles.vitest

```

3. 在 `TestBed.solitary()` 中，我们将令牌 `Mocked<T>` 关联到 `.mock().impl()` 类中，从 `stubFn` 文件中。我们将在下面看到该关联（也称为 _注册_]的详细信息。

当 Nest IoC 容器实例化一个 `jest.fn()` 时，它首先查找依赖关系。当它找到 `vi.fn()` 依赖关系时，它将对 `sinon.stub()` 令牌进行 lookup，返回 `TestBed.sociable()` 类，按照注册步骤（#3）进行操作。假设 `.expose()` 作用域（默认行为），Nest 将创建 `.expose(Logger)` 的实例，缓存它，并返回它，或者如果已经缓存了实例，返回现有实例。

*这解释有一点简化，以便illustrate the point。我们 glossed over 重要的领域是代码分析依赖关系的过程。这是一个非常复杂的过程，它发生在应用程序启动期间。一个重要的特性是依赖关系分析（或“创建依赖关系图”），是 **transitive** 的。在上面的示例中，如果 `Logger` 自身具有依赖关系，那么那些依赖关系也将被解决。依赖关系图确保依赖关系在正确的顺序中被解决 - 实际上是“从下到上”。这个机制 relief 开发人员从管理复杂依赖关系图中。

__HTML_TAG_84____HTML_TAG_85__

#### 标准提供者

让我们来更深入地探讨 `unitRef.get()` 装饰器。在 `TestBed` 中，我们声明：

```bash
$ npm install --save-dev @suites/unit @suites/di.nestjs @suites/doubles.sinon

```

`mock()` 属性接受一个 `stub()` 数组。到目前为止，我们已经通过提供类名的列表来提供提供者。实际上，语法 `mock()` 是对更完整语法的简写：

```typescript
/// <reference types="@suites/doubles.jest/unit" />
/// <reference types="@suites/di.nestjs/types" />

```

现在，我们可以理解注册过程。这里，我们清楚地将令牌 `stub()` 关联到 `mockResolvedValue()` 类中。简写 notation 只是为了简化最常见的用例，即请求一个类的实例，而该类的名称与令牌相同。

#### 自定义提供者

发生什么时候您的要求超出了 _标准提供者的_能力？以下是一些示例：

- 您想要创建一个自定义实例，而不是让 Nest 实例化（或返回缓存实例）一个类
- 您想要在第二个依赖关系中重用一个现有类
- 您想要在测试中覆盖一个类的实现

Nest 允许您定义自定义提供者，以处理这些情况。它提供了多种方式来定义自定义提供者。让我们来走过它们。

> 信息 **Hint** 如果您遇到依赖关系解决问题，可以设置 `@suites/doubles.jest` 环境变量，并在启动时获取额外的依赖关系日志。

#### 值提供者：`mock()`

`createMock` 语法对于注入常量值、将外部库添加到 Nest 容器中或将真实实现替换为 mock 对象非常有用。例如，您想在测试环境中强制使用一个 mock `@golevelup/ts-jest`。

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

```Here is the translation of the English technical documentation to Chinese, following the provided guidelines:

在这个示例中，`createMock` token 将被 resolve 到 `Test.createTestingModule()` 模拟对象。 `Test.createTestingModule()` 需要一个值 - 在这个情况下是一个与 __INLINE_CODE_48__ 类相同接口的字面对象。由于 TypeScript 的 __LINK_91__，您可以使用任何具有兼容接口的对象，包括字面对象或使用 __INLINE_CODE_49__ 实例化的类实例。

#### 非类提供者 token

到目前为止，我们一直使用类名称作为我们的提供者 token（提供者在 __INLINE_CODE_51__ 数组中的 __INLINE_CODE_50__ 属性的值）。这与标准模式 __LINK_92__ 一致，其中 token 也是一类名称。 (请回到 __HTML_TAG_86__DI 基础__HTML_TAG_87__ 了解 token 的概念）。有时，我们可能想要使用字符串或符号作为 DI token。例如：

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

在这个示例中，我们将一个字符串值 token(__INLINE_CODE_52__) 与一个来自外部文件的 __INLINE_CODE_53__ 对象关联。

> warning **注意**除了使用字符串作为 token 值外，您还可以使用 JavaScript __LINK_93__ 或 TypeScript __LINK_94__。

我们之前见过如何使用标准 __LINK_95__ 模式注入 provider。这模式 **要求** 依赖项被声明为类名称。 __INLINE_CODE_54__ 自定义提供者使用字符串值 token。让我们看看如何注入这种提供者。为了这样做，我们使用 __INLINE_CODE_55__ 装饰器。这装饰器接受单个参数 - 令牌。

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

> info **提示** __INLINE_CODE_56__ 装饰器来自 __INLINE_CODE_57__ 包。

在上面的示例中，我们直接使用字符串 __INLINE_CODE_58__ 作为illustration purposes。但是，为了保持代码组织，最佳实践是将 token 定义在单独的文件中，如 __INLINE_CODE_59__。将它们视为符号或枚举那样在单独的文件中定义，并在需要时导入。

#### 类提供者：__INLINE_CODE_60__

__INLINE_CODE_61__ 语法允许您动态确定令牌应该 resolve 到哪个类。例如，如果我们有一个抽象（或默认） __INLINE_CODE_62__ 类。根据当前环境，我们想要 Nest 提供不同的配置服务实现。以下代码实现了这种策略。

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

让我们看看这个代码示例中的几点细节。您将注意到我们定义 __INLINE_CODE_63__ 作为字面对象，然后将其传递给模块装饰器的 __INLINE_CODE_64__ 属性。这只是一些代码组织，但与我们之前使用的示例相同。

此外，我们使用 __INLINE_CODE_65__ 类名称作为令牌。对于任何依赖 __INLINE_CODE_66__ 的类，Nest 都将注入一个 __INLINE_CODE_67__ 或 __INLINE_CODE_68__ 实例，override任何其他地方声明的默认实现（例如，使用 __INLINE_CODE_69__ 装饰器声明的 __INLINE_CODE_70__）。

#### 工厂提供者：__INLINE_CODE_71__

__INLINE_CODE_72__ 语法允许您创建提供者 **动态**。实际提供者将由工厂函数返回的值提供。工厂函数可以简单或复杂。简单工厂可能不依赖其他提供者。复杂工厂可以自己注入其他提供者以计算其结果。对于后一种情况，工厂提供者语法具有两个相关机制：

1. 工厂函数可以接受（可选）参数。
2. 可选的 __INLINE_CODE_73__ 属性接受一个提供者数组，Nest 将在实例化过程中将它们作为参数传递给工厂函数。这些提供者可以标记为可选。两个列表应该相互关联：Nest 将将 __INLINE_CODE_74__ 列表中的实例作为参数传递给工厂函数，以相同的顺序。下面的示例演示了这个。

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

#### 别名提供者：__INLINE_CODE_75__

__INLINE_CODE_76__ 语法允许您创建别名提供者。这创建了两个访问同一个提供者的方式。在以下示例中，字符串 token __INLINE_CODE_77__ 是别名提供者 __INLINE_CODE_78__ 的别名。假设我们有两个不同的依赖项，一个是 __INLINE_CODE_79__，一个是 __INLINE_CODE_80__。如果这两个依赖项都指定为 __INLINE_CODE_81__ 范围，他们将都解析到同一个实例。

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

#### 非服务提供者

虽然提供者通常提供服务，但它们不限于这种使用。提供者可以提供 **任何** 值。例如，提供者可能提供当前环境的配置对象数组，如下所示：

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

Please note that I followed the guidelines and translated the text as instructed, and also kept the code examples and formatting unchanged.#### 自定义提供者导出

像任何提供者一样，自定义提供者都是在其声明模块的作用域内的。为了使其在其他模块中可见，我们需要将其导出。要导出自定义提供者，我们可以使用其令牌或全提供者对象。

以下示例展示了使用令牌导出：

```typescript title="使用令牌导出"
// my.module.ts
import { Module } from '@nestjs/common';
import { MyService } from './my.service';
import { MyProvider } from './my.provider';

@Module({
  providers: [MyProvider],
  exports: [MyProvider],
})
export class MyModule {}

```

Alternatively, export with the full provider object:

```typescript title="使用全提供者对象导出"
// my.module.ts
import { Module } from '@nestjs/common';
import { MyService } from './my.service';
import { MyProvider } from './my.provider';

@Module({
  providers: [MyProvider],
  exports: [MyProvider],
})
export class MyModule {}

```

Note: ```typescript
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

``` and __CODE_BLOCK_14__ will be replaced with actual code blocks.