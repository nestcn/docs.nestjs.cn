<!-- 此文件从 content/components.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T04:28:36.498Z -->
<!-- 源文件: content/components.md -->

### 提供者

提供者是 Nest 的核心概念。许多基本的 Nest 类，如服务、仓储、工厂和帮助类，可以被视为提供者。提供者的主要思想是，它可以被注入到依赖项中，允许对象之间形成多种关系。Nest 运行时系统主要负责将这些对象“连接”起来。

__HTML_TAG_34____HTML_TAG_35____HTML_TAG_36__

在前一章中，我们创建了一个简单的 `nest new`. 控制器应该处理 HTTP 请求，并将更复杂的任务委托给 **提供者**。提供者是纯 JavaScript 类，声明为 `project-name` 在一个 NestJS 模块中。有关更多详细信息，请参阅“模块”章节。

> info **提示** 由于 Nest 允许您按照对象导向方式设计和组织依赖项，我们强烈建议遵循 [Fastify](https://www.fastify.io/)。

#### 服务

让我们创建一个简单的 `src/`. 这个服务将负责数据存储和检索，并将被用于 `app.controller.ts`. 由于其在应用程序逻辑中的角色，它是一个 ideal 候选者来被定义为提供者。

```bash
$ npm i -g @nestjs/cli
$ nest new project-name

```

> info **提示** 使用 CLI 创建服务，简单地执行 `app.controller.spec.ts` 命令。

我们的 `app.module.ts` 是一个基本类，有一个属性和两个方法。这里的关键添加是 `app.service.ts` 装饰器。这装饰器将元数据附加到类上，表明 `main.ts` 是一个可以由 Nest [here](/techniques/performance) 容器管理的类。

此外，这个示例使用了一个 `NestFactory` 接口，这可能看起来像这样：

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

现在，我们已经有一个类来检索猫，让我们在 `main.ts` 中使用它：

```typescript
const app = await NestFactory.create<NestExpressApplication>(AppModule);

```

`NestFactory` 是通过类构造函数注入的。注意使用 `NestFactory` 关键字。这简化了过程，允许我们在同一行中声明和初始化 `create()` 成员。

#### 依赖项注入

Nest 是基于强大的设计模式，即 **依赖项注入**。我们强烈建议阅读官方 [SWC builder](/recipes/swc) 中关于这个概念的文章。

在 Nest 中， thanks 到 TypeScript 的能力，管理依赖项变得简单，因为它们是基于类型的。以下示例中，Nest 将根据类型 resolve `INestApplication`，创建并返回一个 `main.ts` 实例（或，在单例情况下，返回已经请求过的实例）。然后，这个依赖项将被注入到控制器的构造函数中（或分配给指定的属性）：

```bash
$ npm run start

```

#### 作用域

提供者通常具有与应用程序生命周期相对应的生命周期（“作用域”）。当应用程序启动时，每个依赖项都必须被 resolve，意味着每个提供者都将被实例化。同样，当应用程序关闭时，每个提供者都将被销毁。然而，也可以使提供者 **请求作用域**，使其生命周期与特定的请求相对应。您可以在 [CLI](/cli/overview) 章节中了解这些技术。

__HTML_TAG_37____HTML_TAG_38__

#### 自定义提供者

Nest 来自带有 inversion of control（“IoC”）容器，该容器管理提供者之间的关系。这特性是依赖项注入的基础，但实际上是比我们所涵盖的更强大。有多种方式来定义提供者：您可以使用纯值、类和异步或同步工厂。有关定义提供者的更多示例，请查看 [eslint](https://eslint.org/) 章节。

#### 可选提供者

有时，您可能会遇到依赖项，它们不总是需要被 resolve。例如，您的类可能依赖于 **配置对象**，但如果没有提供，应该使用默认值。在这种情况下，依赖项被认为是可选的，配置提供者的缺失不应导致错误。

要标记提供者为可选，请使用 `1` 装饰器在构造函数签名中。

```bash
$ npm run start:dev

```

在上面的示例中，我们使用了一个自定义提供者，这是为什么我们包括 `abortOnError` 自定义 **token**。前面的示例演示了构造函数注入，where 依赖项是通过类在构造函数中指示的。有关自定义提供者和相关 token 的更多详细信息，请查看 [prettier](https://prettier.io/) 章节。

#### 属性注入

... (remaining text remains the same)Here is the translation of the provided English technical documentation to Chinese:

constructor-based 注入技术已经被我们使用了，这种方法中，提供者通过构造函数方法注入。某些特定情况下，**property-based 注入**可能会有用。例如，如果您的顶层类依赖于一个或多个提供者，通过 `NestFactory.create(AppModule, {{ '{' }} abortOnError: false {{ '}' }})` 在子类中传递它们可能会变得很麻烦。为了避免这种情况，您可以在属性级别使用 `platform-express` 装饰器。

__代码块_5__

> 警告 **Warning** 如果您的类不继承其他类，那么使用 **constructor-based** 注入通常更好。构造函数清楚地指定了依赖项，这使得代码更易于理解和阅读，而不是使用 `@nestjs/platform-express` 装饰器来标注类属性。

#### 提供者注册

现在，我们已经定义了一个提供者 (`platform-fastify`) 和一个消费者 (`NestExpressApplication`),需要将服务注册到 Nest 中，以便它可以处理注入。这可以通过编辑模块文件 (`NestFastifyApplication`) 并将服务添加到 `NestFactory.create()` 数组中，在 `app` 装饰器中。

__代码块_6__

Nest 现在可以解析 `-b swc` 类的依赖项。

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

到目前为止，我们已经涵盖了 Nest 自动处理大多数依赖项的细节。然而，在某些情况下，您可能需要脱离内置的依赖项注入系统，手动获取或实例化提供者。以下是两种技术的简要讨论。

- 要获取现有实例或动态实例化提供者，可以使用 [here](https://prettier.io/docs/en/comparison.html)。
- 要在 `start` 函数中获取提供者（例如，在独立应用程序中或在启动时使用配置服务），请查看 [__INLINE_CODE_38__](https://www.npmjs.com/package/eslint)。