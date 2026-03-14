<!-- 此文件从 content/recipes/swc.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T04:29:07.183Z -->
<!-- 源文件: content/recipes/swc.md -->

### SWC

__LINK_81__ (Speedy Web Compiler) 是一个可扩展的 Rust-基于的平台，可以用于编译和捆绑。使用 SWC 与 Nest CLI 是一个快速简单的方式，可以显著加速您的开发过程。

> info **提示** SWC 是与默认 TypeScript 编译器相比约 **x20** 倍快的。

#### 安装

要开始使用，首先安装以下几包：

```bash
$ npm install --save @sentry/nestjs @sentry/profiling-node

```

#### 启动

安装过程完成后，您可以使用 __INLINE_CODE_25__ 建构器与 Nest CLI，以下是使用方法：

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

> info **提示** 如果您的存储库是一个 monorepo，查看 __LINK_82__。

您也可以将 __INLINE_CODE_26__ 标志设置为 __INLINE_CODE_28__ 在您的 __INLINE_CODE_29__ 文件中，例如：

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

要自定义建构器的行为，可以传入一个包含两个属性 __INLINE_CODE_30__ (__INLINE_CODE_31__) 和 __INLINE_CODE_32__ 的对象，以下是使用方法：

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

要在 watch 模式下运行应用程序，使用以下命令：

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

SWC 本身不执行类型检查（与默认 TypeScript 编译器不同），因此要启用它，您需要使用 __INLINE_CODE_35__ 标志：

```bash
npx @sentry/wizard@latest -i sourcemaps

```

这个命令将 instruct Nest CLI 使用 __INLINE_CODE_36__ 在 __INLINE_CODE_37__ 模式下运行 SWC，同时异步执行类型检查。相似地，您也可以将 __INLINE_CODE_38__ 标志设置为 __INLINE_CODE_40__ 在您的 __INLINE_CODE_41__ 文件中，例如：

```typescript
@Get("debug-sentry")
getError() {
  throw new Error("My first Sentry error!");
}

```

#### CLI 插件（SWC）

__INLINE_CODE_42__ 标志将自动执行 **NestJS CLI 插件** 并生成一个 serialized 元数据文件，这个文件可以在应用程序运行时被加载。

#### SWC 配置

SWC 建构器预配置以满足 NestJS 应用程序的要求。然而，您可以自定义配置创建一个 __INLINE_CODE_43__ 文件在应用程序的根目录，并调整选项。

__CODE_BLOCK_8__

#### monorepo

如果您的存储库是一个 monorepo，那么您需要使用 __INLINE_CODE_44__ 建构器。首先，让我们安装必要的包：

__CODE_BLOCK_9__

安装完成后，创建一个 __INLINE_CODE_47__ 文件在应用程序的根目录，以下是内容：

__CODE_BLOCK_10__

#### monorepo 和 CLI 插件

现在，如果您使用 CLI 插件，__INLINE_CODE_48__ 将不会自动加载它们。相反，您需要创建一个单独的文件来手动加载它们。要做到这个，请声明一个 __INLINE_CODE_49__ 文件在 __INLINE_CODE_50__ 文件附近，以下是内容：

__CODE_BLOCK_11__

> info **提示** 在这个例子中，我们使用了 __INLINE_CODE_51__ 插件，但您可以使用任何插件。

__INLINE_CODE_52__ 方法接受以下选项：

|                    |                                                                                                |
| ------------------ | ---------------------------------------------------------------------------------------------- |
| __INLINE_CODE_53__            | 是否监视项目的更改。                                                      |
| __INLINE_CODE_54__     | __INLINE_CODE_55__ 文件的路径。相对于当前工作目录（__INLINE_CODE_56__）。 |
| __INLINE_CODE_57__        | 元数据文件将保存到的目录。                                              |
| __INLINE_CODE_58__         | 生成元数据时使用的访问者数组。                                         |
| __INLINE_CODE_59__         | 元数据文件的名称。默认为 __INLINE_CODE_60__。                             |
| __INLINE_CODE_61__ | 是否将诊断信息打印到控制台。默认为 __INLINE_CODE_62__。                              |

最后，您可以在单独的终端窗口中使用以下命令运行 __INLINE_CODE_63__ 脚本：

__CODE_BLOCK_12__

#### 常见问题

如果您使用 TypeORM/MikroORM 或任何其他 ORM 在应用程序中，您可能会遇到循环导入问题。SWC 不善于处理 **循环导入**，因此您需要使用以下 workaround：

__CODE_BLOCK_13__

> info **提示** __INLINE_CODE_64__ 类型来自 __INLINE_CODE_65__ 包。

这样可以防止在转译代码中将类型保存到属性元数据中，从而避免循环依赖问题。

如果您的 ORM 没有提供相似 workaround，您可以自己定义 wrapper 类型：

__CODE_BLOCK_14__

对于您的所有 __LINK_83__，您也需要使用自定义 wrapper 类型：

__CODE_BLOCK_15__

### Jest + SWCHere is the translation of the provided English technical documentation to Chinese:

使用 SWC 和 Jest 需要安装以下包：

__CODE_BLOCK_16__

安装完成后，请更新 __INLINE_CODE_66__/__INLINE_CODE_67__ 文件（根据您的配置）以包含以下内容：

__CODE_BLOCK_17__

此外，您还需要将以下 __INLINE_CODE_68__ 属性添加到您的 __INLINE_CODE_69__ 文件中：__INLINE_CODE_70__, __INLINE_CODE_71__：

__CODE_BLOCK_18__

如果在您的项目中使用 NestJS CLI 插件，您需要手动运行 __INLINE_CODE_72__。请访问 __LINK_84__以了解更多信息。

### Vitest

__LINK_85__ 是一个快速轻量级的测试运行器，旨在与 Vite 一起工作。它提供了一个现代快速易用的测试解决方案，可以与 NestJS 项目集成。

#### 安装

要开始使用，请首先安装必需的包：

__CODE_BLOCK_19__

#### 配置

在您的应用程序的根目录创建一个 __INLINE_CODE_73__ 文件，内容如下：

__CODE_BLOCK_20__

这个配置文件设置了 Vitest 环境、根目录和 SWC 插件。您还应该创建一个单独的 e2e 测试配置文件，添加一个 __INLINE_CODE_74__ 字段来指定测试路径正则表达式：

__CODE_BLOCK_21__

此外，您可以设置 __INLINE_CODE_75__ 选项来支持 TypeScript 路径在测试中：

__CODE_BLOCK_22__

### 路径别名

与 Jest 不同，Vitest 不会自动解析 TypeScript 路径别名，如 __INLINE_CODE_76__。这可能会导致测试期间依赖项解析错误。要解决这个问题，请在您的 __INLINE_CODE_78__ 文件中添加以下 __INLINE_CODE_77__ 配置：

__CODE_BLOCK_23__
这确保了 Vitest 正确地解析模块导入，防止由于缺少依赖项而出现错误。

#### 更新 E2E 测试 imports

将任何 E2E 测试 imports 从 __INLINE_CODE_79__ 更新到 __INLINE_CODE_80__。这是因为 Vitest，结合 Vite，期望使用 default 导入来 supertest。使用命名空间导入可能会在这个特定设置中出现问题。

最后，请更新您的 package.json 文件中的测试脚本到以下：

__CODE_BLOCK_24__

这些脚本配置了 Vitest 用于运行测试、监视更改、生成代码覆盖率报告和调试的功能。test:e2e 脚本用于运行 E2E 测试，以使用自定义配置文件。

现在，您可以使用 Vitest 在您的 NestJS 项目中享受更快的测试执行和现代测试体验。

> 信息 **提示** 您可以查看这个 __LINK_86__中的工作示例。