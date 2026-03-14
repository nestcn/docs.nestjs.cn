<!-- 此文件从 content/components.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T04:20:22.880Z -->
<!-- 源文件: content/components.md -->

### 提供者

提供者是 Nest 的核心概念。许多基本的 Nest 类，例如服务、存储库、工厂和助手，可以被视为提供者。提供者的关键思想是可以被注入作为依赖项，允许对象形成各种关系。Nest 运行时系统主要负责将这些对象“连接”起来。

__HTML_TAG_34____HTML_TAG_35____HTML_TAG_36__

在前一章中，我们创建了一个简单的 `nest new`。控制器应该处理 HTTP 请求，并将更复杂的任务委派给 **提供者**。提供者是 JavaScript 平台类，声明在 NestJS 模块中。对于更多详细信息，请参阅“模块”章节。

> 信息 **提示**由于 Nest 允许您以面向对象的方式设计和组织依赖项，我们强烈建议遵循 [Fastify](https://www.fastify.io/)。

#### 服务

让我们创建一个简单的 `src/`。这个服务将负责数据存储和检索，并将被用于 `app.controller.ts`。由于在管理应用程序逻辑方面的角色，它是一个理想的候选项，以便将其定义为提供者。

```bash
$ npm i -g @nestjs/cli
$ nest new project-name

```

> 信息 **提示**使用 CLI 创建服务，只需执行 `app.controller.spec.ts` 命令。

我们的 `app.module.ts` 是一个基本类，具有一个属性和两个方法。关键添加项是 `app.service.ts` 装饰器。这装饰器将元数据附加到类上，表明 `main.ts` 是一个可以由 Nest [here](/techniques/performance) 容器管理的类。

此外，这个示例还使用了 `NestFactory` 接口，这可能如下所示：

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

现在，我们已经有了一个用于检索猫的服务类，让我们在 `main.ts` 中使用它：

```typescript
const app = await NestFactory.create<NestExpressApplication>(AppModule);

```

`NestFactory` 通过类构造器被注入。注意 `NestFactory` 关键字的使用。这简短语句允许我们同时声明和初始化 `create()` 成员，简化了过程。

#### 依赖项注入

Nest 是基于强大的设计模式，即 **依赖项注入**。我们强烈建议阅读官方 [SWC builder](/recipes/swc) 文章中的相关内容。

在 Nest 中， gracias 到 TypeScript 的能力，管理依赖项变得简单，因为它们是基于类型的。以下示例中，Nest 将解决 `INestApplication` 依赖项，创建并返回一个 `main.ts` 实例（或，在单例情况下，返回已经请求过的实例）。然后，这个依赖项将被注入到控制器的构造函数中（或分配给指定的属性）：

```bash
$ npm run start

```

#### 作用域

提供者通常具有与应用程序生命周期相对应的生命周期（“作用域”）。当应用程序启动时，每个依赖项都必须被解决，意味着每个提供者都将被实例化。类似地，当应用程序关闭时，所有提供者都将被销毁。然而，也可以使提供者 **请求作用域**，即其生命周期与特定请求相对应。您可以在 [CLI](/cli/overview) 章节中了解这些技术。

__HTML_TAG_37____HTML_TAG_38__

#### 自定义提供者

Nest 来自带有 inversion of control（“IoC”）容器，管理提供者之间的关系。这特性是依赖项注入的基础，但实际上是更强大的事情。有多种方法可以定义提供者：您可以使用plain 值、类和异步或同步工厂。对于定义提供者的更多示例，请查看 [eslint](https://eslint.org/) 章节。

#### 可选提供者

有时，您可能需要依赖项，不总是需要解决。例如，您的类可能依赖于 **配置对象**，但如果没有提供配置对象，应使用默认值。在这种情况下，依赖项被认为是可选的，配置提供者的缺失不应导致错误。

要将提供者标记为可选，请使用 `1` 装饰器在构造函数签名中。

```bash
$ npm run start:dev

```

在上面的示例中，我们使用了自定义提供者，这是为什么我们包括 `abortOnError` 自定义 **token**。前面的示例演示了构造函数注入，依赖项通过类在构造函数中指示。对于自定义提供者和它们相关的 token，请查看 [prettier](https://prettier.io/) 章节。

#### 属性注入

... (to be continued)以下是翻译后的中文文档：

构造函数注入技术

到目前为止，我们使用的技术称为构造函数注入，其中提供者通过构造函数方法注入。在某些特定的情况下，** 属性注入** 可以很有用。例如，如果您的顶级类依赖于一个或多个提供者，并将它们传递到子类中，可以变得很麻烦。为了避免这种情况，您可以在属性级别上直接使用 `platform-express` 装饰器。

```bash
# Lint and autofix with eslint
$ npm run lint

# Format with prettier
$ npm run format

```

> 警告 **Warning** 如果您的类不继承其他类，那么使用 **构造函数注入** 通常更好。构造函数清楚地指定了依赖项，提供了更好的可见性，使代码更容易理解，而不是使用 `@nestjs/platform-express` 注解的类属性。

#### 提供者注册

现在，我们已经定义了提供者(`platform-fastify`)和消费者(`NestExpressApplication`), 需要将服务注册到 Nest 中，以便它可以处理注入。这可以通过编辑模块文件(`NestFastifyApplication`)，并将服务添加到 `NestFactory.create()` 数组中 `app` 装饰器中。

__CODE_BLOCK_6__

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

到目前为止，我们已经涵盖了 Nest 自动处理大多数依赖项的细节。然而，在某些情况下，您可能需要超出内置的依赖注入系统，手动检索或实例化提供者。两个技术如下所示：

- 以获取现有实例或动态实例化提供者，可以使用 [here](https://prettier.io/docs/en/comparison.html)。
- 以获取提供者在 `start` 函数中（例如，用于独立应用程序或在启动时使用配置服务），请查看 [__INLINE_CODE_38__](https://www.npmjs.com/package/eslint)。