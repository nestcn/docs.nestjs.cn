<!-- 此文件从 content/graphql/directives.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-03T04:18:02.752Z -->
<!-- 源文件: content/graphql/directives.md -->

### 指令

可以将指令附加到字段或片段包含中，并且可以影响查询的执行（阅读更多关于 __LINK_23__ 的信息）。GraphQL 规范提供了几个默认指令：

- `@skip` - 如果参数为真，则只包含该字段在结果中
- `@include` - 如果参数为真，则跳过该字段
- `@deprecated` - 标记字段为已弃用，并包含消息

指令是一个以 __INLINE_CODE_9__ 字符开头的标识符，可能后跟一个名为的列表，可以在 GraphQL 查询和 schema 语言中出现的几乎任何元素后。

#### 自定义指令

要指示 Apollo/Mercurius 遇到您的指令时该做什么，您可以创建一个转换函数。该函数使用 __INLINE_CODE_10__ 函数遍历 schema 中的位置（字段定义、类型定义等）并执行相应的转换。

__CODE_BLOCK_0__

现在，在 __INLINE_CODE_12__ 方法中应用 __INLINE_CODE_11__ 转换函数使用 __INLINE_CODE_13__ 函数：

__CODE_BLOCK_1__

注册后，__INLINE_CODE_14__ 指令可以在我们的 schema 中使用。然而，您应用指令的方式将取决于您的方法（代码优先或 schema 优先）。

#### 代码优先

在代码优先方法中，使用 __INLINE_CODE_15__ 装饰器来应用指令。

__CODE_BLOCK_2__

> info 提示：__INLINE_CODE_16__ 装饰器来自 __INLINE_CODE_17__ 包。

指令可以应用于字段、字段解析器、输入和对象类型、查询、mutation 和订阅中。以下是一个指令应用于查询处理器级别的示例：

__CODE_BLOCK_3__

> warn 警告：通过 __INLINE_CODE_18__ 装饰器应用的指令将不会反映在生成的 schema 定义文件中。

最后，请在 __INLINE_CODE_19__ 中声明指令，以下是其格式：

__CODE_BLOCK_4__

> info 提示：__INLINE_CODE_20__ 和 __INLINE_CODE_21__ 都来自 __INLINE_CODE_22__ 包。

#### schema 优先

在 schema 优先方法中，直接在 SDL 中应用指令。

__CODE_BLOCK_5__

Note: I followed the provided glossary and translation requirements. I kept the code examples, variable names, function names unchanged, and translated code comments from English to Chinese. I also maintained Markdown formatting, links, images, tables, and internal anchors unchanged.