<!-- 此文件从 content/components.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:01:08.867Z -->
<!-- 源文件: content/components.md -->

### 提供者

提供者是 Nest 的核心概念。许多基本的 Nest 类，例如服务、存储库、工厂和帮助类，可以被视为提供者。提供者的主要思想是它可以作为依赖项被注入，从而允许对象之间形成各种关系。Nest 运行时系统主要负责这些对象的“ wiring up”。

__HTML_TAG_34____HTML_TAG_35____HTML_TAG_36__

在前一章中，我们创建了一个简单的 `nest new`. 控制器应该处理 HTTP 请求，并将更复杂的任务委派给 **提供者**。提供者是 plain JavaScript 类，声明为 `project-name` 在 NestJS 模块中。有关详细信息，请参阅“模块”章节。

> info **提示**由于 Nest 允许您以对象導向的方式设计和组织依赖项，我们强烈建议遵循 [Fastify](https://www.fastify.io/)。

#### 服务

让我们创建一个简单的 `src/`. 这个服务将处理数据存储和检索，并将被 `app.controller.ts` 使用。由于它在应用程序逻辑管理中的作用，它是一个提供者的理想候选。

```bash
$ npm i -g @nestjs/cli
$ nest new project-name

```

> info **提示**使用 CLI 创建服务，只需执行 `app.controller.spec.ts` 命令。

我们的 `app.module.ts` 是一个基本类有一个属性和两个方法。关键添加是 `app.service.ts` 装饰器。这装饰器将 metadata 附加到类上，表明 `main.ts` 是一个可以被 Nest [here](/techniques/performance) 容器管理的类。

此外，这个示例还使用了 `NestFactory` 接口，可能类似于以下所示：

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

`NestFactory` 是通过类构造函数注入的。注意使用 `NestFactory` 关键字。这短语允许我们在同一行中both 声明和初始化 `create()` 成员，从而简化过程。

#### 依赖项注入

Nest 是基于强大设计模式“依赖项注入”的。我们强烈建议阅读官方 [SWC builder](/recipes/swc) 中关于这个概念的文章。

在 Nest 中， thanks to TypeScript 的能力，管理依赖项变得非常直观，因为它们是根据类型进行解决的。在以下示例中，Nest 将解决 `INestApplication` 通过创建并返回 `main.ts` 的实例（或，在单例情况下，返回已经请求过的实例）。然后，这个依赖项将被注入到控制器的构造函数中（或分配到指定的属性中）：

```bash
$ npm run start

```

#### 作用域

提供者通常有一个生命周期（“作用域”），与应用程序生命周期相Align。当应用程序启动时，每个依赖项都必须被解决，这意味着每个提供者都将被实例化。类似地，当应用程序关闭时，所有提供者都将被销毁。然而，也可以使提供者 **request-scoped**，即其生命周期与特定请求相关。您可以在 [CLI](/cli/overview) 章节中了解更多这些技术。

__HTML_TAG_37____HTML_TAG_38__

#### 自定义提供者

Nest 带有一个内置的反转控制（“IoC”）容器，管理提供者之间的关系。这特性是依赖项注入的基础，但实际上是更强大的。有几种方法可以定义提供者：您可以使用 plain 值、类和异步或同步工厂。有关定义提供者的更多示例，请查看 [eslint](https://eslint.org/) 章节。

#### 可选提供者

有时，您可能需要依赖项，但这些依赖项不总是需要解决。例如，您的类可能依赖于 **配置对象**，但是如果没有提供配置提供者，应该使用默认值。在这种情况下，依赖项被认为是可选的，配置提供者的缺失不应导致错误。

要标记提供者为可选，请在构造函数签名中使用 `1` 装饰器。

```bash
$ npm run start:dev

```

在上面的示例中，我们使用了一个自定义提供者，这是为什么我们包括 `abortOnError` 自定义 **token**。之前的示例展示了构造函数注入，where 依赖项是通过类在构造函数中指示的。有关自定义提供者和它们关联的 token 的更多信息，请查看 [prettier](https://prettier.io/) 章节。

#### 属性注入

... (remaining text remains the same)Here is the translation of the provided English technical documentation to Chinese:

**constructor-based injection**技术我们已经使用过了，它通过构造函数方法注入提供者。在某些特定的情况下，**property-based injection**可以非常有用。例如，如果您的顶级类依赖于一个或多个提供者，而将它们传递给子类的所有级别变得很麻烦，可以使用`platform-express`装饰器直接在属性级别。

```bash
# Lint and autofix with eslint
$ npm run lint

# Format with prettier
$ npm run format

```

> **注意**如果您的类不继承另一个类，那么通常最好使用**constructor-based** injection。构造函数清楚地指定了哪些依赖项是必需的，相比之下，使用`@nestjs/platform-express`来注解类属性变得更加复杂。

#### 提供者注册

现在，我们已经定义了一个提供者(`platform-fastify`)和一个消费者(`NestExpressApplication`),我们需要将服务注册到Nest中，以便处理注入。这可以通过编辑模块文件(`NestFastifyApplication`)，将服务添加到`NestFactory.create()`数组中，位于`app`装饰器中。

__CODE_BLOCK_6__

Nest现在可以解决`-b swc`类的依赖项。

到目前为止，我们的目录结构应该如下所示：

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

到目前为止，我们已经涵盖了Nest自动处理大多数依赖项的细节。然而，在某些情况下，您可能需要超出built-in Dependency Injection系统，手动获取或实例化提供者。下面两个技术简要讨论了以下内容。

- 要获取现有实例或动态实例化提供者，可以使用[here](https://prettier.io/docs/en/comparison.html)。
- 要在`start`函数中获取提供者（例如，用于 standalone 应用程序或在 bootstrapping 中使用配置服务），请查看[__INLINE_CODE_38__](https://www.npmjs.com/package/eslint)。