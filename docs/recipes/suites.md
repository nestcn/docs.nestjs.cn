<!-- 此文件从 content/recipes/suites.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-12T12:02:29.229Z -->
<!-- 源文件: content/recipes/suites.md -->

### Suites

Suites 是一个用于 TypeScript 依赖注入框架的测试框架，专为 NestJS 设计。它可以作为 `Test.createTestingModule` 的替代品，用于避免手动创建 mock、冗长的测试设置和多个 mock 配置，或使用未类型化的测试 doubles（如 mock 和 stub）。

Suites 可以从 NestJS 服务的元数据中读取，并自动生成完全类型化的 mock 对象，以减少 mock 设置的样板代码并确保类型安全的测试。

> 信息 **信息** Suites 是一个第三方包，不是 NestJS 核心团队维护的。请将任何问题报告到 [Suites GitHub 仓库](https://github.com/suitesjs/suites)。

#### 开始使用

本指南展示了如何使用 Suites 测试 NestJS 服务。它涵盖了孤立测试（所有依赖项 mock）和集成测试（选择实际实现）。

#### 安装 Suites

首先，安装必要的依赖：

```bash
npm install --save-dev @suitesjs/core @suitesjs/nestjs @suitesjs/doubles-jest

```

如果使用 Vitest 而不是 Jest：

```bash
npm install --save-dev @suitesjs/core @suitesjs/nestjs @suitesjs/doubles-vitest

```

如果使用 Sinon：

```bash
npm install --save-dev @suitesjs/core @suitesjs/nestjs @suitesjs/doubles-sinon

```

#### 设置类型定义

在项目根目录创建 `suites.d.ts` 文件：

```typescript
import '@suitesjs/core';
import '@suitesjs/nestjs';
import '@suitesjs/doubles-jest'; // 或其他 doubles 适配器

```

#### 创建示例服务

本指南使用一个简单的 `UserService`，具有两个依赖项：

```typescript
import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { EmailService } from './email.service';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly emailService: EmailService,
  ) {}

  async createUser(name: string, email: string): Promise<{ id: number; name: string; email: string }> {
    const user = await this.userRepository.create({ name, email });
    await this.emailService.sendWelcomeEmail(user.email);
    return user;
  }

  async getUserById(id: number): Promise<{ id: number; name: string; email: string } | null> {
    return this.userRepository.findById(id);
  }
}

```

#### 编写单元测试

使用 Suites 创建孤立测试，所有依赖项 mock：

```typescript
import { describe, it, expect } from '@jest/globals';
import { suite } from '@suitesjs/core';
import { UserService } from './user.service';

describe('UserService', () => {
  const { unit, mock } = suite(UserService);

  it('should create user and send welcome email', async () => {
    // 配置 mock 行为
    mock.userRepository.create.mockResolvedValue({ id: 1, name: 'John', email: 'john@example.com' });
    mock.emailService.sendWelcomeEmail.mockResolvedValue(undefined);

    // 调用被测方法
    const result = await unit.createUser('John', 'john@example.com');

    // 验证结果
    expect(result).toEqual({ id: 1, name: 'John', email: 'john@example.com' });
    expect(mock.userRepository.create).toHaveBeenCalledWith({ name: 'John', email: 'john@example.com' });
    expect(mock.emailService.sendWelcomeEmail).toHaveBeenCalledWith('john@example.com');
  });

  it('should get user by id', async () => {
    // 配置 mock 行为
    mock.userRepository.findById.mockResolvedValue({ id: 1, name: 'John', email: 'john@example.com' });

    // 调用被测方法
    const result = await unit.getUserById(1);

    // 验证结果
    expect(result).toEqual({ id: 1, name: 'John', email: 'john@example.com' });
    expect(mock.userRepository.findById).toHaveBeenCalledWith(1);
  });
});

```

`suite()` 函数分析构造函数，创建类型安全的 mock 对象。`mock` 对象提供 IntelliSense 支持用于 mock 配置。

#### 预编译 mock 配置

在编译前配置 mock 行为使用 `mock()` 函数：

```typescript
import { describe, it, expect } from '@jest/globals';
import { suite, mock } from '@suitesjs/core';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';

describe('UserService', () => {
  const { unit } = suite(UserService, {
    userRepository: mock<UserRepository>({
      create: jest.fn().mockResolvedValue({ id: 1, name: 'John', email: 'john@example.com' }),
      findById: jest.fn().mockResolvedValue({ id: 1, name: 'John', email: 'john@example.com' }),
    }),
  });

  it('should create user', async () => {
    const result = await unit.createUser('John', 'john@example.com');
    expect(result).toEqual({ id: 1, name: 'John', email: 'john@example.com' });
  });
});

```

`mock()` 参数对应于安装的 doubles 适配器（`@suitesjs/doubles-jest`、`@suitesjs/doubles-vitest`、`@suitesjs/doubles-sinon`）。

#### 使用实际依赖项测试

使用 `use()` 和 `useValue()` 使用实际实现的依赖项：

```typescript
import { describe, it, expect } from '@jest/globals';
import { suite, use } from '@suitesjs/core';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { EmailService } from './email.service';

describe('UserService', () => {
  const { unit } = suite(UserService, {
    userRepository: use(new UserRepository()),
    // emailService 仍然是 mock
  });

  it('should create user', async () => {
    const result = await unit.createUser('John', 'john@example.com');
    expect(result).toHaveProperty('id');
    expect(result.name).toBe('John');
    expect(result.email).toBe('john@example.com');
  });
});

```

`use()` 创建 `UserRepository` 的实际实现实例，同时保持其他依赖项 mock。

#### 基于令牌的依赖项

Suites 处理自定义注入令牌（字符串或符号）：

```typescript
import { Inject, Injectable, Module, Provider } from '@nestjs/common';
import { suite, useValue } from '@suitesjs/core';

const CONFIG_TOKEN = 'CONFIG';

interface Config {
  apiKey: string;
  apiUrl: string;
}

@Injectable()
export class ApiService {
  constructor(@Inject(CONFIG_TOKEN) private readonly config: Config) {}

  getApiUrl(): string {
    return this.config.apiUrl;
  }
}

describe('ApiService', () => {
  const { unit } = suite(ApiService, {
    [CONFIG_TOKEN]: useValue({ apiKey: 'test-key', apiUrl: 'https://api.example.com' }),
  });

  it('should return api url', () => {
    expect(unit.getApiUrl()).toBe('https://api.example.com');
  });
});

```

使用 `useValue()` 访问令牌依赖项。

#### 直接使用 mock() 和 stub()

对于那些喜欢直接控制而不是使用 `suite()`，doubles 适配器包提供了 `mock()` 和 `stub()` 函数：

```typescript
import { describe, it, expect } from '@jest/globals';
import { mock } from '@suitesjs/doubles-jest';
import { UserRepository } from './user.repository';

describe('UserRepository', () => {
  const userRepository = mock<UserRepository>();

  it('should call findById', async () => {
    userRepository.findById.mockResolvedValue({ id: 1, name: 'John', email: 'john@example.com' });
    const result = await userRepository.findById(1);
    expect(result).toEqual({ id: 1, name: 'John', email: 'john@example.com' });
  });
});

```

`mock()` 创建类型安全的 mock 对象，`stub()` 将底层 mocking 库（Jest 在本例中）封装为提供方法 like `mockResolvedValue`。

这些函数来自安装的 doubles 适配器（`@suitesjs/doubles-jest`），该适配器适配了测试框架的 native mocking 能力。

> 提示 **提示** `mock()` 函数是 `jest.mock()` 函数的替代品，来自 `@suitesjs/doubles-jest`。两者创建类型安全的 mock 对象。

#### 总结

**使用 `Test.createTestingModule` 用于：**
- 验证模块配置和提供者 wiring
- 测试装饰器、守卫、拦截器和管道
- 验证跨模块的依赖项注入
- 测试完整应用程序上下文中的中间件

**使用 Suites 用于：**
- 快速单元测试，集中在业务逻辑上
- 自动生成多个依赖项的 mock
- 类型安全的测试 doubles 有 IntelliSense 支持

根据测试目的组织测试：使用 Suites 进行单元测试，验证单个服务行为，并使用 `Test.createTestingModule` 进行集成测试，验证模块配置。

更多信息：
- [Suites 官方文档](https://suitesjs.com/)
- [Suites GitHub 仓库](https://github.com/suitesjs/suites)
- [NestJS 测试文档](/fundamentals/unit-testing)