<!-- 此文件从 content/cli/libraries.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-02T04:20:33.588Z -->
<!-- 源文件: content/cli/libraries.md -->

### Libraries

很多应用程序需要解决同样的基本问题，或者将模块化组件重用在不同的上下文中。Nest 有一些方式来解决这个问题，但是每种方式都工作在不同的级别，以便满足不同的架构和组织目标。

Nest 提供者是为提供执行上下文，从而在单个应用程序中共享组件。模块也可以与提供者一起打包，创建可重用的库，这个库可以安装在不同的项目中。这可以是一种有效的方式来分发可配置、可重用的库，这些库可以被不同的、松散连接或无关的组织使用（例如，分发/安装第三方库）。

在紧密组织的组中（例如，公司/项目边界），分享代码可以是一个更轻量级的方法。Monorepos 就是这样一种构造，可以使得分享代码变得轻松。 Within a monorepo, a **library** 提供了一个简单、轻量级的方式来分享代码。在一个 Nest monorepo 中，使用库使得轻松地组装应用程序，这些应用程序共享组件。实际上，这鼓励了 monolithic 应用程序的分解和开发过程的聚焦于构建和组装模块化组件。

#### Nest libraries

Nest 库是一个 Nest 项目，它与应用程序不同的是，它不能单独运行。库必须被导入到包含它的应用程序中，以便其代码执行。标准模式项目可以使用 npm 包来实现类似的功能。

例如，一家组织可能会开发一个 `AuthModule`，用于管理身份验证，它遵循公司对所有内部应用程序的政策。 plutôt than 在每个应用程序中单独构建该模块，或者将代码与 npm 一起打包，要求每个项目安装该模块，monorepo 可以将该模块定义为库。当组织方式这样，所有使用该库模块的消费者都可以看到该模块的最新版本，因为它是提交的。这可以对组件开发和组装产生有意义的好处，并简化 end-to-end 测试。

#### 创建库

任何可重用的功能都可以作为库候选。决定什么应该是库，什么应该是应用程序，是一个架构设计决策。创建库涉及更多的操作，除了简单地从现有应用程序中复制代码。当作为库打包时，库代码必须与应用程序分离。这可能需要更多的前期时间，并强制一些设计决策，这些决策可能不会遇到在更紧密耦合的代码中遇到的问题。但是，这些额外的努力可以在库可以被用来启用快速应用程序组装时产生回报。

要开始创建库，请运行以下命令：

```bash
$ nest g library my-library
```

When you run the command, the `library` schematic prompts you for a prefix (AKA alias) for the library:

```bash
What prefix would you like to use for the library (default: @app)?
```

This creates a new project in your workspace called `my-library`.
A library-type project, like an application-type project, is generated into a named folder using a schematic. Libraries are managed under the `libs` folder of the monorepo root. Nest creates the `libs` folder the first time a library is created.

The files generated for a library are slightly different from those generated for an application. Here is the contents of the `libs` folder after executing the command above:

<div class="file-tree">
  <div class="item">libs</div>
  <div class="children">
    <div class="item">my-library</div>
    <div class="children">
      <div class="item">src</div>
      <div class="children">
        <div class="item">index.ts</div>
        <div class="item">my-library.module