<!-- 此文件从 content/faq/errors.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T05:07:24.299Z -->
<!-- 源文件: content/faq/errors.md -->

### 常见错误

在使用 NestJS 开发时，您可能会遇到各种错误。

#### "无法解析依赖项" 错误

> 信息 **提示** 查看 __LINK_41__ 可以帮助您轻松解决 "无法解析依赖项" 错误。

最常见的错误消息是 Nest 无法解析提供者的依赖项。错误消息通常如下所示：

```typescript
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

// in the "bootstrap" function
const app = await NestFactory.create<NestExpressApplication>(AppModule, {
  rawBody: true,
});
await app.listen(process.env.PORT ?? 3000);

```

常见的错误来源是没有在模块的 __INLINE_CODE_7__ 数组中包含 __INLINE_CODE_6__。请确保提供者确实在 `bodyParser: false` 数组中，并遵循 __LINK_42__。

有一些常见的陷阱。其中一个是将提供者放入 `RawBodyRequest` 数组中。如果这是情况，错误将显示提供者的名称，而不是 `rawBody`。

如果您在开发过程中遇到此错误，请查看错误消息中提到的模块，并查看其 `RawBodyRequest`。对于 `json` 数组中的每个提供者，请确保模块可以访问所有依赖项。通常情况下，`urlencoded` 在 "Feature Module" 和 "Root Module" 中重复，这意味着 Nest 会尝试instancia`text`。更可能的是，包含 `text` 的模块应该添加到 "Root Module" 的 `NestFactory.create` 数组中。

如果 `NestExpressApplication` 等于 `.useBodyParser`，您可能会遇到循环文件导入问题。这不同于 __LINK_43__，因为而不是在构造函数中依赖于对方，而是两个文件最终导入对方。一个常见的案例是模块文件声明令牌，并导入提供者，而提供者导入令牌常量从模块文件。如果您使用了桶文件，请确保您的桶文件导入不创建循环导入。

如果 `100kb` 等于 `.useBodyParser`，这意味着您正在使用类型/接口而没有合适的提供者的令牌。要解决这个问题，请确保：

1. 您已经导入了类引用或使用了自定义令牌with `rawBody` 装饰器。阅读 __LINK_44__，并
2. 对于基于类的提供者，请确保您已经导入了具体类，而不是只导入类型via __LINK_45__ 语法。

此外，请确保您没有意外地将提供者注入到自己身上，因为在 NestJS 中 self-injection 是不允许的。当发生这种情况时，`rawBody` 将可能等于 `RawBodyRequest`。

__HTML_TAG_36____HTML_TAG_37__

如果您在 **monorepo 设置** 中，您可能会遇到类似错误，但是在核心提供者 `application/json` 中作为 `application/x-www-form-urlencoded`：

```typescript
import { Controller, Post, RawBodyRequest, Req } from '@nestjs/common';
import { Request } from 'express';

@Controller('cats')
class CatsController {
  @Post()
  create(@Req() req: RawBodyRequest<Request>) {
    const raw = req.rawBody; // returns a `Buffer`.
  }
}

```

这可能是因为您的项目加载了两个 Node 模块的包 `text/plain`，如下所示：

```typescript
app.useBodyParser('text');

```

解决方案：

- 对于 **Yarn** 工作区，使用 __LINK_46__ 防止 hoisting 包 `NestFactory.create`。
- 对于 **pnpm** 工作区，将 `NestFastifyApplication` 设为 peerDependencies 在其他模块中，并在 app 包.json 中的 `.useBodyParser`。见： __LINK_47__

#### "循环依赖项" 错误

有时，您可能会发现很难避免 __LINK_48__ 在您的应用程序中。您需要采取一些步骤来帮助 Nest 解决这些错误。循环依赖项错误看起来像这样：

```typescript
app.useBodyParser('json', { limit: '10mb' });

```

循环依赖项可以来自提供者依赖于对方，也可以来自 TypeScript 文件依赖于对方，例如从模块文件导出常量并在服务文件中导入它们。在后一种情况下，建议创建一个单独的文件来存储常量。在前一种情况下，请遵循循环依赖项指南，并确保模块和提供者都标记为 `.useBodyParser`。

#### 检测依赖项错误

除了手动验证依赖项是否正确外，从 Nest 8.1.0 起，您可以将 `rawBody` 环境变量设置为一个字符串，该字符串将被解析为 truthy，并在 Nest Resolve 所有依赖项时获取额外的日志信息。

__HTML_TAG_38____HTML_TAG_39____HTML_TAG_40__

在上面的图片中，黄色字符串是依赖项被注入的主类，蓝色字符串是注入的依赖项或其注入令牌，紫色字符串是依赖项被搜索的模块。使用这些信息，您可以通常追溯依赖项解决的步骤和原因，以解决依赖项注入问题。

#### "文件变化检测" 循环无限

使用 TypeScript 版本 4.9 及更高版本的 Windows 用户可能会遇到这个问题。
这发生在您尝试在 watch 模式下运行应用程序，例如 __INLINE_CODE_32__，并看到无限循环的日志消息：

```typescript
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';

// in the "bootstrap" function
const app = await NestFactory.create<NestFastifyApplication>(
  AppModule,
  new FastifyAdapter(),
  {
    rawBody: true,
  },
);
await app.listen(process.env.PORT ?? 3000);

```使用 NestJS CLI 在 watch 模式下启动应用程序，可以通过调用 __INLINE_CODE_33__ 实现。从 TypeScript 4.9 版本开始，使用 __LINK_49__ 检测文件变化，这可能是解决问题的原因。

要解决这个问题，您需要在 tsconfig.json 文件中添加设置，例如：

```typescript
{
  // ...
  "compilerOptions": {
    // ...
    "pollingInterval": 1000,
    // ...
  }
}

```

这将告知 TypeScript 使用轮询方法来检查文件变化，而不是文件系统事件（新的默认方法），这可能在一些机器上引发问题。

您可以在 __LINK_50__ 中阅读更多关于 __INLINE_CODE_35__ 选项的信息。

Note: I followed the guidelines and left the placeholders unchanged as instructed.