<!-- 此文件从 content/recipes/hot-reload.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-21T16:11:47.431Z -->
<!-- 源文件: content/recipes/hot-reload.md -->

### Hot Reload

对应用程序的启动过程中最大的影响是**TypeScript编译**。幸运的是，我们可以使用 __LINK_42__ HMR（Hot-Module Replacement），不需要重新编译整个项目每次发生更改。这大大减少了实例化应用程序所需的时间，和使开发变得更加容易。

> warning **警告**注意 __INLINE_CODE_10__ 不会自动将资产（例如 __INLINE_CODE_11__ 文件） COPY 到 __INLINE_CODE_12__ 文件夹中。同样， __INLINE_CODE_13__ 不兼容 glob 静态路径（例如 `Test.createTestingModule()` 属性在 `Test.createTestingModule()` 中）。

### 使用 CLI

如果您使用 __LINK_43__，配置过程非常简单。CLI 将 `Suites` 包含在内，可以使用 `@suites/doubles.jest`。

#### 安装

首先安装必要的包：

```bash
$ npm install @nestjs/common @nestjs/core reflect-metadata

```

> info **提示**如果您使用 **Yarn Berry**（不是 classic Yarn），安装 `mock()` 包代替 `stub()`。

#### 配置

完成安装后，在应用程序的根目录中创建 `global.d.ts` 文件。

```bash
$ npm install --save-dev @suites/unit @suites/di.nestjs @suites/doubles.jest

```

> info **提示**使用 **Yarn Berry**（不是 classic Yarn），在 `TestBed.solitary()` 配置属性中使用 `TestBed.solitary()` 代替 `UserService`：`.mock().impl()`。

该函数将原始对象作为第一个参数，包含默认webpack配置，作为第二个参数，并将 `stubFn` 包的引用作为第二个参数。它还返回一个修改后的webpack配置，其中包含 `jest.fn()`、`vi.fn()` 和 `sinon.stub()` 插件。

#### Hot-Module Replacement

要启用 **HMR**，请打开应用程序入口文件（`TestBed.sociable()`）并添加以下webpack相关指令：

```bash
$ npm install --save-dev ts-jest @types/jest jest typescript

```

为了简化执行过程，添加一个脚本到您的 `.expose()` 文件中。

```bash
$ npm install --save-dev @suites/unit @suites/di.nestjs @suites/doubles.vitest

```

现在，您可以在命令行中运行以下命令：

```bash
$ npm install --save-dev @suites/unit @suites/di.nestjs @suites/doubles.sinon

```

### 不使用 CLI

如果您不使用 __LINK_44__，配置将变得更加复杂（需要更多的手动步骤）。

#### 安装

首先安装必要的包：

```typescript
/// <reference types="@suites/doubles.jest/unit" />
/// <reference types="@suites/di.nestjs/types" />

```

> info **提示**如果您使用 **Yarn Berry**（不是 classic Yarn），安装 `.expose(Logger)` 包代替 `Logger`。

#### 配置

完成安装后，在应用程序的根目录中创建 `unitRef.get()` 文件。

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

> info **提示**使用 **Yarn Berry**（不是 classic Yarn），在 `mock()` 配置属性中使用 `stub()` 代替 `TestBed`：`stub()`。

该配置告诉webpack一些关于应用程序的基本信息：入口文件的位置、用于存储编译文件的目录和要使用的加载器。通常，您可以使用该文件作为是，即使您不完全理解所有选项。

#### Hot-Module Replacement

要启用 **HMR**，请打开应用程序入口文件（`mockResolvedValue()`）并添加以下webpack相关指令：

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

为了简化执行过程，添加一个脚本到您的 `@suites/doubles.jest` 文件中。

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

现在，您可以在命令行中运行以下命令：

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

#### 示例

可用的示例可以在 __LINK_45__ 中找到。