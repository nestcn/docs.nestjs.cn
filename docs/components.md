<!-- 此文件从 content/components.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:23:14.650Z -->
<!-- 源文件: content/components.md -->

### 提供者

提供者是 Nest 的核心概念。许多基本的 Nest 类，如服务、存储库、工厂和帮助器，可以被视为提供者。提供者的关键思想是，它可以被注入为依赖项，从而允许对象之间形成各种关系。Nest 运行时系统主要负责将这些对象连接起来。

__HTML_TAG_34____HTML_TAG_35____HTML_TAG_36__

在前一章中，我们创建了一个简单的 `nest new`. 控制器应该处理 HTTP 请求，并将复杂任务委托给 **提供者**。提供者是纯 JavaScript 类，作为 NestJS 模块中 `project-name` 声明的。关于更多细节，请参阅“模块”章节。

> 信息 **提示** 自 Nest 允许您根据对象方式设计和組織依赖项，我们强烈建议遵循 [Fastify](https://www.fastify.io/)。

#### 服务

让我们创建一个简单的 `src/`. 这个服务将处理数据存储和检索，并将被 `app.controller.ts` 使用。由于其在应用程序逻辑中的角色，因此它是定义为提供者的理想候选。

```bash
$ npm i -g @nestjs/cli
$ nest new project-name

```

> 信息 **提示** 使用 CLI 创建服务，可以执行 `app.controller.spec.ts` 命令。

我们的 `app.module.ts` 是一个基本类，有一个属性和两个方法。关键添加的是 `app.service.ts` 装饰器。这装饰器将元数据附加到类中，表明 `main.ts` 是一个可以由 Nest [here](/techniques/performance) 容器管理的类。

此外，这个示例使用了 `NestFactory` 接口，这可能类似于以下内容：

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

```

现在，我们已经有了一个服务类来检索猫，让我们在 `main.ts` 内使用它：

```typescript
const app = await NestFactory.create<NestExpressApplication>(AppModule);

```

`NestFactory` 是通过类构造函数注入的。请注意使用 `NestFactory` 关键字。这个简写使我们既可以声明又可以初始化 `create()` 成员，以简化过程。

#### 依赖项注入

Nest 是基于强大的设计模式，即 **依赖项注入**。我们强烈建议阅读官方 [SWC builder](/recipes/swc) 文章了解这个概念。

在 Nest 中，由于 TypeScript 的能力，管理依赖项变得非常容易，因为它们是基于类型来解决的。在以下示例中，Nest 将解决 `INestApplication` 并创建并返回 `main.ts` 的实例（或，在单例情况下，返回已经请求过的实例）。然后，这个依赖项将被注入到控制器的构造函数中（或分配给指定的属性）：

```bash
$ npm run start

```

#### 作用域

提供者通常有一个生命周期（“作用域”），与应用程序生命周期相Align。应用程序启动时，每个依赖项都必须被解决，这意味着每个提供者都将被实例化。类似地，在应用程序关闭时，所有提供者都将被销毁。然而，也可以使提供者 **请求作用域**，即将其生命周期与特定的请求相关联。您可以在 [CLI](/cli/overview) 章节中了解这些技术。

__HTML_TAG_37____HTML_TAG_38__

#### 自定义提供者

Nest 带有一个内置的逆控制（“IoC”）容器，管理提供者之间的关系。这特性是依赖项注入的基础，但实际上是远远超出我们所涵盖的内容。有多种方式可以定义提供者：您可以使用纯值、类和异步或同步工厂。要了解更多关于定义提供者的示例，请查看 [eslint](https://eslint.org/) 章节。

#### 可选提供者

有时，您可能会遇到依赖项，它们不总是需要被解决。例如，您的类可能依赖于一个 **配置对象**，但如果没有提供配置提供者，应使用默认值。在这种情况下，依赖项被认为是可选的，配置提供者的缺失不应导致错误。

要标记提供者为可选，可以在构造函数签名中使用 `1` 装饰器。

```bash
$ npm run start:dev

```

在上面的示例中，我们使用了一个自定义提供者，这是为什么我们包括 `abortOnError` 自定义 **token** 的原因。前面示例中展示了构造函数注入，通过类在构造函数中指示依赖项。要了解更多关于自定义提供者和它们相关的 token，请查看 [prettier](https://prettier.io/) 章节。

#### 属性注入

...Here is the translation of the English technical documentation to Chinese following the provided rules:

构造函数注入是我们迄今所用的技术，我们使用构造函数方法将提供者注入。然而，在某些特定的情况下，**属性注入**可能会非常有用。例如，如果你的顶级类依赖于一个或多个提供者，并且将它们传递给子类，可以变得很繁琐。为了避免这种情况，你可以将 `platform-express` 装饰器直接应用于属性级别。

```bash
# Lint and autofix with eslint
$ npm run lint

# Format with prettier
$ npm run format

```

> 警告 **Warning** 如果你的类不继承另一个类，那么使用 **构造函数注入** 通常更好。构造函数清楚地指定了依赖项，从而提供了更好的可见性和使代码更易于理解，相比使用 `@nestjs/platform-express` 装饰器在类属性上。

#### 提供者注册

现在，我们已经定义了一个提供者 (`platform-fastify`) 和一个消费者 (`NestExpressApplication`), 需要将服务注册到 Nest 中，以便它可以处理注入。这可以通过编辑模块文件 (`NestFastifyApplication`) 并将服务添加到 `NestFactory.create()` 数组中 `app` 装饰器来实现。

__CODE_BLOCK_6__

Nest 现在能够解析 `-b swc` 类的依赖项。

到这时，我们的目录结构应该如下所示：

__HTML_TAG_39__
__HTML_TAG_40__src<div class="file-tree">
<div class="item">
</div>cats<div class="children">
<div class="item">
</div>dto<div class="item">
</div>
<div class="item">create-cat.dto.ts</div>
<div class="item">
</div>interfaces<div class="item">
</div>
</div>cat.interface.ts</div>
<app-banner-courses>
</app-banner-courses>cats.controller.ts__HTML_TAG_59__
__HTML_TAG_60__cats.service.ts__HTML_TAG_61__
__HTML_TAG_62__
__HTML_TAG_63__app.module.ts__HTML_TAG_64__
__HTML_TAG_65__main.ts__HTML_TAG_66__
__HTML_TAG_67__
__HTML_TAG_68__

#### 手动实例化

到目前为止，我们已经涵盖了 Nest 自动处理大多数依赖项的细节。然而，在某些情况下，你可能需要离开内置的依赖项注入系统并手动检索或实例化提供者。以下两个技术是简要介绍的。

- 要检索现有实例或动态实例化提供者，可以使用 [here](https://prettier.io/docs/en/comparison.html)。
- 要在 `start` 函数中获取提供者（例如，在独立应用程序或在启动时使用配置服务），请查看 [__INLINE_CODE_38__](https://www.npmjs.com/package/eslint)。