<!-- 此文件从 content/components.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T04:42:05.557Z -->
<!-- 源文件: content/components.md -->

### 提供者

提供者是 Nest 的核心概念。许多基本的 Nest 类，如服务、存储库、工厂和帮助器，可以被视为提供者。提供者的关键思想是，它可以作为依赖项被注入，从而允许对象之间形成各种关系。Nest 运行时系统主要负责将这些对象"连接"起来。

__HTML_TAG_34____HTML_TAG_35____HTML_TAG_36__

在前一章中，我们创建了一个简单的 `@nestjs/common`. 控制器应该处理 HTTP 请求，并将更复杂的任务委派给 __提供者__。提供者是简单的 JavaScript 类，声明为 `rxjs` 在一个 NestJS 模块中。对于更多信息，please refer to the "Modules" chapter.

> info **提示**由于 Nest 允许您以对象导向的方式设计和组织依赖项，我们强烈建议遵循 __LINK_69__。

#### 服务

让我们开始创建一个简单的 `reflect-metadata`. 这个服务将处理数据存储和检索，并将被用于 __INLINE_CODE_10__.由于其在应用程序逻辑管理中的角色，它是一个理想的候选人，以被定义为提供者。

```bash
$ npm i -g @nestjs/cli
$ nest new project-name

```

> info **提示**要使用 CLI 创建一个服务，简单地执行 __INLINE_CODE_11__ 命令。

我们的 __INLINE_CODE_12__ 是一个基本的类，有一个属性和两个方法。关键的添加是 __INLINE_CODE_13__ 装饰器。这装饰器将元数据附加到类上，表明 __INLINE_CODE_14__ 是一个可以被 Nest __LINK_70__ 容器管理的类。

此外，该示例还使用了一个 __INLINE_CODE_15__ 接口，这可能类似于以下内容：

```bash
$ git clone https://github.com/nestjs/typescript-starter.git project
$ cd project
$ npm install
$ npm run start

```

现在，我们已经有了一个服务类来检索猫，让我们在 __INLINE_CODE_16__ 内部使用它：

__CODE_BLOCK_2__

__INLINE_CODE_17__ 通过类构造函数被注入。注意 __INLINE_CODE_18__ 关键字的使用。这简语法允许我们在同一行both 声明和初始化 __INLINE_CODE_19__ 成员，简化了过程。

#### 依赖项注入

Nest 是基于强大的设计模式，即 **依赖项注入**。我们强烈推荐阅读官方 __LINK_71__ 中关于该概念的文章。

在 Nest 中， thanks to TypeScript 的能力，管理依赖项变得简单，因为它们是根据类型进行解决的。在以下示例中，Nest 将解决 __INLINE_CODE_20__ bằng创建并返回一个 __INLINE_CODE_21__ 实例（或，在单例情况下，返回已经请求过的实例）。然后，这个依赖项将被注入到控制器的构造函数中（或分配到指定的属性中）：

__CODE_BLOCK_3__

#### 作用域

提供者通常具有与应用程序生命周期相对应的生命周期（“作用域”）。当应用程序启动时，每个依赖项都必须被解决，即每个提供者都将被实例化。同样，当应用程序关闭时，所有提供者都将被销毁。然而，也可能使提供者 **请求作用域**，即其生命周期与特定的请求相关。您可以在 __LINK_72__ 章中了解这些技术。

__HTML_TAG_37____HTML_TAG_38__

#### 自定义提供者

Nest 来自带有反转控制（“IoC”）容器，它管理提供者之间的关系。这特性是依赖项注入的基础，但实际上是比我们所涵盖的还要更加强大。有几种方式可以定义提供者：您可以使用纯值、类和异步或同步工厂。要了解更多关于定义提供者的示例，请查看 __LINK_73__ 章。

#### 可选提供者

有时，您可能需要依赖项，但这些依赖项并不总是需要被解决。例如，您的类可能依赖于一个 **配置对象**，但如果没有提供该对象，应该使用默认值。在这种情况下，依赖项被认为是可选的，并且配置提供者的缺失不应导致错误。

要标记提供者为可选，请在构造函数签名中使用 __INLINE_CODE_22__ 装饰器。

__CODE_BLOCK_4__

在上面的示例中，我们使用了一个自定义提供者，这是为什么我们包括 __INLINE_CODE_23__ 自定义 **token**。前面的示例展示了构造函数注入，where 依赖项通过类在构造函数中被指示。要了解更多关于自定义提供者和相关 token 的信息，请查看 __LINK_74__ 章。

#### 属性注入

... (rest of the translation)Here is the translation of the provided technical documentation from English to Chinese:

我们之前使用的技术称为构造函数注入方法，其中提供者通过构造函数方法注入。某些特定的情况下，**属性注入**可能非常有用。例如，如果您的顶级类依赖于一个或多个提供者，而将它们传递到子类中变得很复杂，可以在属性级别使用 __INLINE_CODE_25__ 装饰器。

__CODE_BLOCK_5__

> 警告 **Warning** 如果您的类不继承另一个类，那么使用 **构造函数注入** 通常更好。构造函数清楚地指定了所需的依赖项，提供了更好的可见性，使代码变得更加易于理解，相比于类属性上使用 __INLINE_CODE_26__。

#### 提供者注册

现在，我们已经定义了一个提供者(__INLINE_CODE_27__)和一个消费者(__INLINE_CODE_28__),需要将服务注册到 Nest 中，以便它可以处理注入。这可以通过编辑模块文件(__INLINE_CODE_29__)，将服务添加到 __INLINE_CODE_30__ 数组中，方法是使用 __INLINE_CODE_31__ 装饰器。

__CODE_BLOCK_6__

Nest 现在将能够解析 __INLINE_CODE_32__ 类的依赖项。

到目前为止，我们的目录结构应该如下所示：

__HTML_TAG_39__
__HTML_TAG_40__src__HTML_TAG_41__
__HTML_TAG_42__
__HTML_TAG_43__cats__HTML_TAG_44__
__HTML_TAG_45__
__HTML_TAG_46__dto__HTML_TAG_47__
__HTML_TAG_48__
__HTML_TAG_49__create-cat.dto.ts__HTML_TAG_50__
__HTML_TAG_51__
__HTML_TAG_52__interfaces__HTML_TAG_53__
__HTML_TAG_54__
__HTML_TAG_55__cat.interface.ts__HTML_TAG_56__
__HTML_TAG_57__
__HTML_TAG_58__cats.controller.ts__HTML_TAG_59__
__HTML_TAG_60__cats.service.ts__HTML_TAG_61__
__HTML_TAG_62__
__HTML_TAG_63__app.module.ts__HTML_TAG_64__
__HTML_TAG_65__main.ts__HTML_TAG_66__
__HTML_TAG_67__
__HTML_TAG_68__

#### 手动实例化

到目前为止，我们已经涵盖了 Nest 自动处理大多数依赖项的细节。然而，在某些情况下，您可能需要超出内置的依赖项注入系统，并手动获取或实例化提供者。以下是两种技术的简要讨论。

- 若要获取现有实例或动态实例化提供者，可以使用 __LINK_75__。
- 若要在 __INLINE_CODE_33__ 函数中获取提供者（例如，用于独立应用程序或在启动时使用配置服务），请查看 __LINK_76__。