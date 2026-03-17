<!-- 此文件从 content/faq/errors.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:17:12.645Z -->
<!-- 源文件: content/faq/errors.md -->

### 普通错误

在使用 NestJS 时，您可能会遇到各种错误。

#### "无法解析依赖关系"错误

> info **提示** 请查看__LINK_41__以轻松解决 "无法解析依赖关系"错误。

可能最常见的错误消息是 Nest 无法解析提供程序的依赖关系。错误消息通常如下所示：

```bash
$ nest g module auth
$ nest g controller auth
$ nest g service auth

```

该错误的常见原因是没有在模块的__INLINE_CODE_7__数组中包含提供程序。请确保提供程序确实在__INLINE_CODE_8__数组中，并遵循__LINK_42__。

有一些常见的陷阱。其中一个是将提供程序添加到__INLINE_CODE_9__数组中。如果是这种情况，错误将显示提供程序的名称，而不是__INLINE_CODE_10__。

如果在开发期间遇到此错误，请查看错误消息中提到的模块，并查看其__INLINE_CODE_11__。对于每个提供程序在__INLINE_CODE_12__数组中，请确保模块可以访问所有依赖项。通常情况下，__INLINE_CODE_13__在“功能模块”和“根模块”中重复，这意味着 Nest 将尝试实例化提供程序两次。更可能的情况是，模块包含重复的__INLINE_CODE_14__应该添加到“根模块”的__INLINE_CODE_15__数组中。

如果__INLINE_CODE_16__上述代码是__INLINE_CODE_17__，可能存在循环文件导入。这不同于__LINK_43__，因为不是提供程序之间的依赖关系，而是两个文件相互导入。常见情况是模块文件声明令牌并导入提供程序，而提供程序导入令牌常量从模块文件。如果您使用了barrel文件，确保您的barrel导入不创建这些循环导入。

如果__INLINE_CODE_18__上述代码是`AuthModule`，这意味着您正在使用类型/接口而没有合适的提供程序令牌。要解决这个问题，请确保：

1. 您正在导入类引用或使用自定义令牌`AuthService`装饰器。阅读__LINK_44__，并
2. 对于基于类的提供程序，您正在导入具体类，而不是仅仅使用类型__LINK_45__语法。

此外，请确保您没有在NestJS中 Self-injecting提供程序，因为 Self-injections在NestJS中不可用。當這發生時，`AuthService`将等于`AuthController`。

__HTML_TAG_36____HTML_TAG_37__

如果您在**monorepo设置**中，您可能会遇到与上述错误相同的错误，但是在core提供程序`AuthService`中作为`UsersService`：

```bash
$ nest g module users
$ nest g service users

```

這可能是因为您的项目加载了两个Node模块包`UsersService`，如下所示：

```typescript
import { Injectable } from '@nestjs/common';

// This should be a real class/interface representing a user entity
export type User = any;

@Injectable()
export class UsersService {
  private readonly users = [
    {
      userId: 1,
      username: 'john',
      password: 'changeme',
    },
    {
      userId: 2,
      username: 'maria',
      password: 'guess',
    },
  ];

  async findOne(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username);
  }
}

@Injectable()
export class UsersService {
  constructor() {
    this.users = [
      {
        userId: 1,
        username: 'john',
        password: 'changeme',
      },
      {
        userId: 2,
        username: 'maria',
        password: 'guess',
      },
    ];
  }

  async findOne(username) {
    return this.users.find(user => user.username === username);
  }
}

```

解决方案：

- 对于**Yarn** Workspaces，请使用__LINK_46__来防止 hoisting包`UsersModule`。
- 对于**pnpm** Workspaces，请将`UsersService`设置为peerDependencies在其他模块中和`@Module`在应用程序的package.json中，其中模块被导入。见：__LINK_47__

#### "循环依赖关系"错误

有时您可能会遇到难以避免__LINK_48__在应用程序中。您需要采取一些步骤来帮助Nest解决这些错误。从循环依赖关系引发的错误看起来像这样：

```typescript
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';

@Module({
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

@Module({
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

```

循环依赖关系可以来自提供程序之间的依赖关系，也可以来自 TypeScript 文件之间的依赖关系，例如在模块文件中导出常量并在服务文件中导入它们。在后一种情况下，建议创建一个单独的文件来存储常量。在前一种情况下，请遵循循环依赖关系指南，并确保模块和提供程序都标记了`AuthService`。

#### 调试依赖关系错误

除了手动验证依赖项正确性之外，Nest 8.1.0 及更高版本中，您可以将`AuthService`环境变量设置为一个字符串，该字符串将被解析为truthy，并在 Nest 解决所有应用程序依赖项时获取额外的日志信息。

__HTML_TAG_38____HTML_TAG_39____HTML_TAG_40__

在上面的图片中，黄色字符串是依赖项的主类，蓝色字符串是注入的依赖项名称或其注入令牌，紫色字符串是模块，其中依赖项被搜索。使用这个，您可以通常跟踪依赖项解决问题的步骤和原因。

#### "文件更改检测"循环永不停止

Windows 用户使用TypeScript 4.9 及更高版本可能会遇到这个问题。
这发生在您尝试在 watch 模式下运行应用程序，例如`signIn()`，并看到无限循环的日志消息：

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async signIn(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    if (user?.password !== pass) {
      throw new UnauthorizedException();
    }
    const { password, ...result } = user;
    // 待办： Generate a JWT and return it here
    // instead of the user object
    return result;
  }
}

@Injectable()
@Dependencies(UsersService)
export class AuthService {
  constructor(usersService) {
    this.usersService = usersService;
  }

  async signIn(username: string, pass: string) {
    const user = await this.usersService.findOne(username);
    if (user?.password !== pass) {
      throw new UnauthorizedException();
    }
    const { password, ...result } = user;
    // 待办： Generate a JWT and return it here
    // instead of the user object
    return result;
  }
}

```当使用 NestJS CLI 启动应用程序时，在 watch 模式下是通过调用 `AuthModule` 来实现的，而 TypeScript 的版本 4.9 中使用了 __LINK_49__ 进行文件更改检测，这可能是导致问题的原因。

要解决这个问题，您需要在 tsconfig.json 文件中添加一个设置，具体如下：

```typescript
{
  // ...
  "compilerOptions": {
    // ...
    "incremental": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "outDir": "dist",
    "rootDir": "src",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true
  }
}

```

这将告知 TypeScript 使用轮询方法来检查文件更改，而不是文件系统事件（新的默认方法），这可能会在某些机器上引起问题。

您可以在 __LINK_50__ 中阅读更多关于 `AuthController` 选项的信息。