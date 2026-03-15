<!-- 此文件从 content/recipes/swc.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T04:51:11.614Z -->
<!-- 源文件: content/recipes/swc.md -->

### SWC

__LINK_81__ (Speedy Web Compiler) 是一个基于 Rust 的可扩展平台，可以用于编译和捆绑。使用 SWC 和 Nest CLI 是一种简单的方法，可以大大加速您的开发过程。

> 信息 **提示** SWC approximately **x20 times faster** than the default TypeScript compiler。

#### 安装

要开始使用，首先安装以下包：

```bash
$ npm install --save @sentry/nestjs @sentry/profiling-node

```

#### 开始使用

安装过程完成后，您可以使用 __INLINE_CODE_25__ 建设者与 Nest CLI 一起，例如：

```typescript
const Sentry = require("@sentry/nestjs");
const { nodeProfilingIntegration } = require("@sentry/profiling-node");

// Ensure to call this before requiring any other modules!
Sentry.init({
  dsn: SENTRY_DSN,
  integrations: [
    // Add our Profiling integration
    nodeProfilingIntegration(),
  ],

  // Add Tracing by setting tracesSampleRate
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,

  // 设置 sampling rate for profiling
  // This is relative to tracesSampleRate
  profilesSampleRate: 1.0,
});

```

> 信息 **提示** 如果您的仓库是一个 monorepo，请查看 __LINK_82__。

在不传递 __INLINE_CODE_26__ 标志的情况下，您也可以将 __INLINE_CODE_27__ 属性设置为 __INLINE_CODE_28__ 在您的 __INLINE_CODE_29__ 文件中，例如：

```typescript
// 导入 this first!
import "./instrument";

// Now import other modules
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}

bootstrap();

```

要自定义 builder 的行为，可以传递一个对象，其中包含两个属性：__INLINE_CODE_30__ (__INLINE_CODE_31__) 和 __INLINE_CODE_32__, 例如：

```typescript
import { Module } from "@nestjs/common";
import { SentryModule } from "@sentry/nestjs/setup";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

@Module({
  imports: [
    SentryModule.forRoot(),
    // ...other modules
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

```

例如，要使 swc 编译 __INLINE_CODE_33__ 和 __INLINE_CODE_34__ 文件，执行以下命令：

```typescript
import { Catch, ExceptionFilter } from '@nestjs/common';
import { SentryExceptionCaptured } from '@sentry/nestjs';

@Catch()
export class YourCatchAllExceptionFilter implements ExceptionFilter {
  @SentryExceptionCaptured()
  catch(exception, host): void {
    // your implementation here
  }
}

```

要在 watch 模式下运行应用程序，请使用以下命令：

```typescript
import { Module } from "@nestjs/common";
import { APP_FILTER } from "@nestjs/core";
import { SentryGlobalFilter } from "@sentry/nestjs/setup";

@Module({
  providers: [
    {
      provide: APP_FILTER,
      useClass: SentryGlobalFilter,
    },
    // ..other providers
  ],
})
export class AppModule {}

```

#### 类型检查

SWC 不会执行任何类型检查（与默认的 TypeScript 编译器不同），因此要启用它，您需要使用 __INLINE_CODE_35__ 标志：

```bash
npx @sentry/wizard@latest -i sourcemaps

```

这个命令将 instruct Nest CLI 使用 __INLINE_CODE_36__ 在 __INLINE_CODE_37__ 模式下执行 SWC，同时异步执行类型检查。与传递 __INLINE_CODE_38__ 标志相似，您也可以在您的 __INLINE_CODE_41__ 文件中设置 __INLINE_CODE_39__ 属性为 __INLINE_CODE_40__, 例如：

```typescript
@Get("debug-sentry")
getError() {
  throw new Error("My first Sentry error!");
}

```

#### CLI 插件（SWC）

__INLINE_CODE_42__ 标志将自动执行 **NestJS CLI 插件**，并生成一个可序列化的元数据文件，然后可以在应用程序的运行时被加载。

#### SWC 配置

SWC 建设器预先配置为满足 NestJS 应用程序的要求。但是，您可以自定义配置通过在根目录创建一个 __INLINE_CODE_43__ 文件，并调整选项。

__CODE_BLOCK_8__

#### monorepo

如果您的仓库是一个 monorepo，那么您需要使用 __INLINE_CODE_45__ 配置 __INLINE_CODE_46__。

首先，让我们安装所需的包：

__CODE_BLOCK_9__

安装完成后，创建一个 __INLINE_CODE_47__ 文件在应用程序的根目录中，内容如下：

__CODE_BLOCK_10__

#### monorepo 和 CLI 插件

现在，如果您使用 CLI 插件，__INLINE_CODE_48__ 将不自动加载它们。相反，您需要创建一个单独的文件来手动加载它们。要这样做，请声明一个 __INLINE_CODE_49__ 文件在 __INLINE_CODE_50__ 文件附近，内容如下：

__CODE_BLOCK_11__

> 信息 **提示** 在这个示例中，我们使用了 __INLINE_CODE_51__ 插件，但您可以使用任何插件。

__INLINE_CODE_52__ 方法接受以下选项：

|                    |                                                                                                |
| ------------------ | ---------------------------------------------------------------------------------------------- |
| __INLINE_CODE_53__            | 是否监视项目的变化。                                                      |
| __INLINE_CODE_54__     | __INLINE_CODE_55__ 文件的路径。相对于当前工作目录（__INLINE_CODE_56__）。 |
| __INLINE_CODE_57__        | 将元数据文件保存到的目录。                                   |
| __INLINE_CODE_58__         | 一个数组，用于生成元数据的访问者。                                   |
| __INLINE_CODE_59__         | 元数据文件的名称。默认为 __INLINE_CODE_60__。                                      |
| __INLINE_CODE_61__ | 是否将诊断信息打印到控制台。默认为 __INLINE_CODE_62__。                               |

最后，您可以在单独的终端窗口中运行 __INLINE_CODE_63__ 脚本，使用以下命令：

__CODE_BLOCK_12__

#### 常见问题

如果您使用 TypeORM/MikroORM 或其他 ORM 在应用程序中，您可能会遇到循环依赖问题。SWC 不善于处理 **循环依赖**，因此您需要使用以下 workaround：

__CODE_BLOCK_13__

> 信息 **提示** __INLINE_CODE_64__ 类型来自 __INLINE_CODE_65__ 包。

这样可以防止在 transpiled 代码中保存属性的类型metadata，这样可以避免循环依赖问题。

如果您的 ORM 没有提供类似的 workaround，您可以自己定义包装类型：

__CODE_BLOCK_14__

对于您的项目中的所有 __LINK_83__，您也需要使用自定义包装类型，例如：

__CODE_BLOCK_15__

### Jest + SWCHere is the translation of the provided English technical documentation to Chinese, following the provided rules:

使用 SWC 与 Jest 时，您需要安装以下包：

```typescript
// __CODE_BLOCK_16__

```

安装完成后，您需要更新 __INLINE_CODE_66__/__INLINE_CODE_67__ 文件（根据您的配置）以包含以下内容：

```typescript
// __CODE_BLOCK_17__

```

此外，您还需要将以下 __INLINE_CODE_68__ 属性添加到您的 __INLINE_CODE_69__ 文件中：__INLINE_CODE_70__, __INLINE_CODE_71__：

```typescript
// __CODE_BLOCK_18__

```

如果您使用 NestJS CLI 插件在项目中，您需要手动运行 __INLINE_CODE_72__。了解更多信息，请访问 __LINK_84__。

### Vitest

__LINK_85__ 是一个快速、轻量级的测试运行器，旨在与 Vite 集成。它提供了一个现代、快速和易于使用的测试解决方案，可以与 NestJS 项目集成。

#### 安装

要开始使用，首先安装所需的包：

```typescript
// __CODE_BLOCK_19__

```

#### 配置

在应用程序的根目录下创建一个 __INLINE_CODE_73__ 文件，并添加以下内容：

```typescript
// __CODE_BLOCK_20__

```

这个配置文件设置了 Vitest 的环境、根目录和 SWC 插件。您还需要创建一个单独的配置文件用于 e2e 测试，添加一个 __INLINE_CODE_74__ 字段来指定测试路径正则表达式：

```typescript
// __CODE_BLOCK_21__

```

此外，您可以设置 __INLINE_CODE_75__ 选项来支持 TypeScript 路径在测试中：

```typescript
// __CODE_BLOCK_22__

```

### 路径别名

与 Jest 不同，Vitest 不会自动解析 TypeScript 路径别名，如 __INLINE_CODE_76__。这可能会导致在测试时出现依赖项解析错误。要解决这个问题，请在您的 __INLINE_CODE_78__ 文件中添加以下配置：

```typescript
// __CODE_BLOCK_23__

```

这确保 Vitest 正确解析模块导入，从而防止由于缺少依赖项而出现错误。

#### 更新 E2E 测试中的 imports

将 E2E 测试中的所有 imports 从 __INLINE_CODE_79__ 更换为 __INLINE_CODE_80__。这是在 Vitest bundled with Vite 中使用默认导入 supertest 时必要的。使用命名空间导入可能会在这个特定的配置下出现问题。

最后，更新您的 package.json 文件中的 test scripts，以以下内容：

```typescript
// __CODE_BLOCK_24__

```

这些脚本配置了 Vitest 的测试运行、监听更改、生成代码覆盖报告和调试。test:e2e 脚本用于运行 E2E 测试，以一个自定义的配置文件。

使用这个设置，您现在可以在您的 NestJS 项目中使用 Vitest，包括更快的测试执行和更现代的测试体验。

> info **提示** 您可以在这个 __LINK_86__ 中查看一个工作示例。