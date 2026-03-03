<!-- 此文件从 content/graphql/directives.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-02T04:16:57.590Z -->
<!-- 源文件: content/graphql/directives.md -->

### 指令

一个指令可以附加到字段或片段包含中，并影响查询的执行方式（了解更多 __LINK_23__）。GraphQL 规范提供了一些默认指令：

- __INLINE_CODE_6__ - 只在 argument 是 true 时包含该字段
- __INLINE_CODE_7__ - 如果 argument 是 true，跳过该字段
- __INLINE_CODE_8__ - 将字段标记为已弃用，并提供消息

指令是一个由 __INLINE_CODE_9__ 字符开头的标识符，可以在 GraphQL 查询和 schema 语言中出现，以前的任何元素后面。

#### 自定义指令

要 instruct Apollo/Mercurius 何时遇到你的指令，你可以创建一个转换函数。这个函数使用 __INLINE_CODE_10__ 函数遍历 schema 中的位置（字段定义、类型定义等），并执行相应的转换。

__CODE_BLOCK_0__

现在，在 __INLINE_CODE_12__ 方法中使用 __INLINE_CODE_13__ 函数应用 __INLINE_CODE_11__ 转换函数：

__CODE_BLOCK_1__

注册后，__INLINE_CODE_14__ 指令可以在我们的 schema 中使用。然而，应用指令的方式取决于你使用的方法（代码优先还是 schema 优先）。

#### 代码优先

在代码优先方法中，使用 __INLINE_CODE_15__ 装饰器应用指令。

__CODE_BLOCK_2__

> info **提示** __INLINE_CODE_16__ 装饰器来自 __INLINE_CODE_17__ 包。

指令可以应用于字段、字段解析器、输入和对象类型，以及查询、mutation 和订阅中。下面是一个指令在查询处理器级别的应用：

__CODE_BLOCK_3__

> warn **警告** 通过 __INLINE_CODE_18__ 装饰器应用的指令将不反映在生成的 schema 定义文件中。

最后，确保在 __INLINE_CODE_19__ 中声明指令，例如：

__CODE_BLOCK_4__

> info **提示** __INLINE_CODE_20__ 和 __INLINE_CODE_21__ 都来自 __INLINE_CODE_22__ 包。

#### schema 优先

在 schema 优先方法中，直接在 SDL 中应用指令。

__CODE_BLOCK_5__