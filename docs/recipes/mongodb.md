<!-- 此文件从 content/recipes/mongodb.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-01T04:20:27.936Z -->
<!-- 源文件: content/recipes/mongodb.md -->

### MongoDB (Mongoose)

> **警告** 在本文中，您将学习如何使用自定义组件从头开始创建基于 **Mongoose** 包的__INLINE_CODE_8__。由于这解决方案包含了许多可以省略的 overhead，您可以使用现有的和可出-of-the-box的专门__INLINE_CODE_9__包。欲了解更多，请查看 __LINK_35__。

__LINK_36__ 是最受欢迎的 __LINK_37__ 对象模型工具。

#### Getting started

要开始使用这个库，我们需要安装所有所需的依赖项：

```bash
$ npm i -D @compodoc/compodoc
```

首先，我们需要使用 __INLINE_CODE_10__ 函数establish 数据库连接。 __INLINE_CODE_11__ 函数返回一个 __INLINE_CODE_12__,因此我们需要创建一个 __LINK_38__。

```bash
$ npx @compodoc/compodoc -p tsconfig.json -s
```

> 信息 **提示** 我们遵循best practices，声明了自定义提供者在一个具有 __INLINE_CODE_13__ 后缀的单独文件中。

然后，我们需要导出这些提供者，以使它们对应用程序的其余部分变得 **可访问**。

__CODE_BLOCK_2__

现在，我们可以使用 __INLINE_CODE_15__ 装饰器注入 __INLINE_CODE_14__ 对象。每个依赖于 __INLINE_CODE_16__ async 提供者的类将等待 __INLINE_CODE_17__ 解决。

#### Model injection

使用 Mongoose，everything 都来自一个 __LINK_39__。让我们定义一个 __INLINE_CODE_18__：

__CODE_BLOCK_3__

__INLINE_CODE_19__ 属于 __INLINE_CODE_20__ 目录。这目录表示 __INLINE_CODE_21__。

现在是时候创建一个 **Model** 提供者：

__CODE_BLOCK_4__

> 警告 **警告** 在实际应用程序中，您应该避免 **magic strings**。 __INLINE_CODE_22__ 和 __INLINE_CODE_23__ 应该在单独的 __INLINE_CODE_24__ 文件中保持。

现在，我们可以使用 __INLINE_CODE_27__ 装饰器将 __INLINE_CODE_25__ 注入 __INLINE_CODE_26__：

__CODE_BLOCK_5__

在上面的示例中，我们使用了 __INLINE_CODE_28__ 接口。这接口扩展了 __INLINE_CODE_29__ 从 mongoose 包：

__CODE_BLOCK_6__

数据库连接 **异步**，但 Nest 使这个过程对用户完全不可见。 __INLINE_CODE_30__ 类等待 db 连接， __INLINE_CODE_31__ 延迟直到模型准备好使用。整个应用程序可以在每个类实例化时启动。

以下是最终 __INLINE_CODE_32__：

__CODE_BLOCK_7__

> 信息 **提示** 不要忘记将 __INLINE_CODE_33__ 导入根 __INLINE_CODE_34__。

#### Example

一个工作示例可以在 __LINK_40__ 找到。