<!-- 此文件从 content/recipes/mongodb.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-02T04:12:19.808Z -->
<!-- 源文件: content/recipes/mongodb.md -->

### MongoDB（Mongoose）

> **警告** 本文将 teaches you how to create a __INLINE_CODE_8__ based on the **Mongoose** package from scratch using custom components. As a consequence, this solution contains a lot of overhead that you can omit using ready to use and available out-of-the-box dedicated __INLINE_CODE_9__ package. To learn more, see __LINK_35__.

__LINK_36__ 是最受欢迎的 __LINK_37__ 对象模型工具。

####Getting started

要开始使用这个库，我们需要安装所有 required 依赖项：

```bash
$ npm i -D @compodoc/compodoc
```

首先，我们需要使用 __INLINE_CODE_10__ 函数建立与我们的数据库的连接。 __INLINE_CODE_11__ 函数返回一个 __INLINE_CODE_12__,因此我们需要创建一个 __LINK_38__。

```bash
$ npx @compodoc/compodoc -p tsconfig.json -s
```

> info **提示** 我们遵循 best practices， declare the custom provider 在一个具有 __INLINE_CODE_13__ 后缀的单独文件中。

然后，我们需要将这些提供者导出，以使它们对应用程序的其余部分可访问。

__CODE_BLOCK_2__

现在，我们可以使用 __INLINE_CODE_15__ 装饰器注入 __INLINE_CODE_14__ 对象。每个依赖于 __INLINE_CODE_16__ 异步提供者的类都将等待 __INLINE_CODE_17__ 解决。

#### Model injection

使用 Mongoose， everything 是从一个 __LINK_39__派生出来的。让我们定义 __INLINE_CODE_18__：

__CODE_BLOCK_3__

__INLINE_CODE_19__ 属于 __INLINE_CODE_20__ 目录。这目录表示 __INLINE_CODE_21__。

现在是时候创建一个 **Model** 提供者：

__CODE_BLOCK_4__

> warning **警告** 在实际应用中，你应该避免 **magic strings**。Both __INLINE_CODE_22__ 和 __INLINE_CODE_23__ 应该在单独的 __INLINE_CODE_24__ 文件中。

现在，我们可以使用 __INLINE_CODE_27__ 装饰器将 __INLINE_CODE_25__ 注入到 __INLINE_CODE_26__：

__CODE_BLOCK_5__

在上面的示例中，我们使用了 __INLINE_CODE_28__ 接口。该接口扩展了 __INLINE_CODE_29__ 从 Mongoose 包：

__CODE_BLOCK_6__

数据库连接是 **异步** 的，但 Nest 使这个过程对最终用户完全不可见。 __INLINE_CODE_30__ 类等待 db 连接，而 __INLINE_CODE_31__ 延迟直到模型准备使用。整个应用程序可以在每个类被实例化时开始。

以下是一个最终的 __INLINE_CODE_32__：

__CODE_BLOCK_7__

> info **提示** 不要忘记将 __INLINE_CODE_33__ 导入根 __INLINE_CODE_34__。

#### Example

可用的工作示例在 __LINK_40__。