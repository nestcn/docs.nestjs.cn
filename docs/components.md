<!-- 此文件从 content/components.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T04:49:32.474Z -->
<!-- 源文件: content/components.md -->

### 提供者

提供者是 Nest 的核心概念。在 Nest 中，许多基本的类，如服务、存储库、工厂和帮助器，可以被视为提供者。提供者的主要思想是，它可以被注入为依赖项，允许对象之间形成多种关系。Nest 运行时系统主要负责这些对象之间的关系。

__HTML_TAG_34____HTML_TAG_35____HTML_TAG_36__

在前一章中，我们创建了一个简单的 `nest new`. 控制器应该处理 HTTP 请求，并将复杂任务委派给 **提供者**。提供者是 JavaScript 平台类，可以在 NestJS 模块中声明为 `project-name`。更多信息，请参阅“模块”章节。

> info **提示**由于 Nest 允许您以面向对象的方式设计和组织依赖项，我们强烈建议遵循 [Fastify](https://www.fastify.io/)。

#### 服务

让我们开始创建一个简单的 `src/`. 这个服务将负责数据存储和检索，并将被用于 `app.controller.ts`. 由于其在应用程序逻辑中的角色，它是一个理想的候选人来被定义为提供者。

```bash
$ npm i -g @nestjs/cli
$ nest new project-name

```

> info **提示**使用 CLI 创建服务，只需执行 `app.controller.spec.ts` 命令。

我们的 `app.module.ts` 是一个基本的类，有一个属性和两个方法。这个类的关键添加是 `app.service.ts` 装饰器。这个装饰器将元数据附加到类上，表明 `main.ts` 是一个可以由 Nest [here](/techniques/performance) 容器管理的类。

此外，这个示例还使用了 `NestFactory` 接口，这可能类似于以下内容：

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

现在，我们已经有了一个服务类来检索猫，让我们在 `main.ts` 中使用它：

```typescript
const app = await NestFactory.create<NestExpressApplication>(AppModule);

```

`NestFactory` 是通过类构造函数注入的。注意使用 `NestFactory` 关键字。这个简写允许我们同时声明和初始化 `create()` 成员，简化了过程。

#### 依赖项注入

Nest 是基于强大设计模式，即 **依赖项注入**。我们强烈建议阅读官方 [SWC builder](/recipes/swc) 文章中的相关概念。

在 Nest 中， thanks to TypeScript 的能力，管理依赖项变得简单，因为它们是根据类型进行解决的。在以下示例中，Nest 将解决 `INestApplication` 依赖项，创建并返回 `main.ts` 的实例（或者，在单例的情况下，返回已请求的实例）。这个依赖项然后被注入到控制器的构造函数中（或分配到指定的属性）。

```bash
$ npm run start

```

#### 作用域

提供者通常具有与应用程序生命周期相同的生命周期。当应用程序启动时，每个依赖项都需要被解决，这意味着每个提供者都将被实例化。类似地，当应用程序关闭时，所有提供者都将被销毁。然而，也可以使提供者 **请求作用域**，即其生命周期与特定请求相关。您可以在 [CLI](/cli/overview) 章节中了解更多关于这些技术的信息。

__HTML_TAG_37____HTML_TAG_38__

#### 自定义提供者

Nest 提供了内置的 inversion of control（“IoC”）容器来管理提供者之间的关系。这特性是依赖项注入的基础，但实际上是更强大的。有多种方式来定义提供者：可以使用plain values、类和异步或同步工厂。要了解更多关于定义提供者的示例，请查看 [eslint](https://eslint.org/) 章节。

#### 可选提供者

有时，您可能需要依赖项，但不一定需要解决。例如，您的类可能依赖于 **配置对象**，但如果没有提供配置提供者，应该使用默认值。在这种情况下，依赖项被认为是可选的，配置提供者的缺失不应该导致错误。

要标记提供者为可选，请在构造函数签名中使用 `1` 装饰器。

```bash
$ npm run start:dev

```

在上面的示例中，我们使用了自定义提供者，这是为什么我们包括 `abortOnError` 自定义 **token** 的。前面的示例演示了构造函数注入，where 依赖项通过类在构造函数中表示。要了解更多关于自定义提供者及其关联 token 的信息，请查看 [prettier](https://prettier.io/) 章节。

#### 属性注入

...Here is the translation of the English technical documentation to Chinese:

我们之前使用的技术是基于构造函数的注入，通过构造函数方法将提供者注入。某些特定的情况下，**属性基于注入**可能会非常有用。例如，如果您的顶级类依赖于一个或多个提供者，并且将它们传递给子类的所有继承层次，可以变得很麻烦。为了避免这种情况，您可以在属性级别使用 `platform-express` 装饰器。

```bash
# Lint and autofix with eslint
$ npm run lint

# Format with prettier
$ npm run format

```

> warning **警告** 如果您的类不继承另一个类，那么使用 **基于构造函数** 的注入通常是更好的选择。构造函数清楚地指定了所需的依赖项，提供了更好的可见性，使代码更易于理解，相比于使用 `@nestjs/platform-express` 来注解类属性。

#### 提供者注册

现在，我们已经定义了一个提供者(`platform-fastify`)和一个消费者(`NestExpressApplication`),我们需要将服务注册到 Nest 中，以便它可以处理注入。这可以通过编辑模块文件(`NestFastifyApplication`)并将服务添加到 `NestFactory.create()` 数组中来实现。

__CODE_BLOCK_6__

Nest 现在可以解决 `-b swc` 类的依赖项。

此时，我们的目录结构应该如下所示：

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

到目前为止，我们已经涵盖了 Nest 自动处理大多数依赖项的细节。然而，在某些情况下，您可能需要超出内置的依赖项注入系统并手动检索或实例化提供者。以下两个技术简要介绍了这两种方法。

- 通过使用 [here](https://prettier.io/docs/en/comparison.html) 可以检索现有实例或动态实例化提供者。
- 在 `start` 函数中检索提供者（例如，在 standalone 应用程序或在启动过程中使用配置服务），请查看 [__INLINE_CODE_38__](https://www.npmjs.com/package/eslint)。