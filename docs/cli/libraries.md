<!-- 此文件从 content/cli/libraries.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-12T12:02:29.160Z -->
<!-- 源文件: content/cli/libraries.md -->

### Libraries

许多应用程序需要解决类似的通用问题，或者在多个不同的上下文中重用模块化组件。Nest有几种方法来解决这个问题，每种方法都在不同的层次上解决问题，以便满足不同的架构和组织目标。

Nest提供器是为在单个应用程序中共享组件提供执行上下文的有用的方式。模块也可以与提供器一起打包，创建可重用的库，可以在不同的项目中安装。这可以是一种有效的方法，来分布可配置的、可重用的库，可以由不同的、松散连接或未affiliated的组织使用（例如，通过分布/安装第三方库）。

在紧密组织的组合中（例如，公司/项目边界），有一种轻量级的方法来共享组件。Monorepos已经出现了，作为一种构造，以便启用这种方式。在一个Nest monorepo中，使用库可以轻松地组装应用程序，该应用程序共享组件。实际上，这鼓励了monolithic应用程序的分解和开发过程的聚焦，集中于构建和组装模块化组件。

#### Nest libraries

一个Nest库是一种Nest项目，它与应用程序不同的是，它不能单独运行。库必须被导入到包含应用程序中，以便其代码执行。标准模式项目可以使用npm包来实现类似的功能。

例如，组织可能会开发一个`AuthModule`，该模块管理身份验证，实现公司对内应用程序的策略。相比之下，不要在每个应用程序中单独构建该模块，或者将代码与npm一起打包，要求每个项目安装该模块。monorepo可以将该模块定义为库。当组织方式这样，那么所有消费该库模块的应用程序都可以看到最新的`AuthModule`版本，这可以对组件开发和组装产生有意义的益处，并简化端到端测试。

#### 创建 libraries

任何可重用的功能都是library的候选项。决定什么应该是库，什么应该是应用程序，是一个架构设计决策。创建library涉及更多的设计决策，需要在库中 decouple 代码从应用程序。这可能需要更多的前期时间，并迫使一些设计决策，你可能在更紧密耦合的代码中不需要。然而，这些额外的努力可以在library可以用来启用快速应用程序组装时付出。

要开始创建library，请运行以下命令：

```bash
$ nest g library my-library

```

当您运行命令时，`library` 模板会提示您为库指定一个前缀（也称为别名）：

```bash
What prefix would you like to use for the library (default: @app)?

```

这创建了一个名为`my-library`的新项目在您的工作区下。
library 类型的项目，像应用程序类型的项目一样，是在名为`libs`的文件夹下生成的。Nest在第一次创建library时创建了`libs`文件夹。

library 生成的文件与应用程序生成的文件略有不同。在执行上述命令后，`libs` 文件夹的内容如下：

<div class="file-tree">
  <div class="item">libs</div>
  <div class="children">
    <div class="item">my-library</div>
    <div class="children">
      <div class="item">src</div>
      <div class="children">
        <div class="item">index.ts</div>
        <div class="item">my-library.module.ts</div>
        <div class="item">my-library.service.ts</div>
      </div>
      <div class="item">tsconfig.lib.json__HTML_TAG