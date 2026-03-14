<!-- 此文件从 content/graphql/schema-generator.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T04:58:12.376Z -->
<!-- 源文件: content/graphql/schema-generator.md -->

### 生成 SDL

> 警告 **警告** 本章只适用于代码优先approach。

使用 __INLINE_CODE_4__ 手动生成 GraphQL SDL schema（即不运行应用程序、连接数据库、hook up resolvers 等），不需要运行应用程序、连接数据库、hook up resolvers 等。

__代码块 0__

> 提示 **提示** __INLINE_CODE_5__ 和 __INLINE_CODE_6__ 从 __INLINE_CODE_7__ 包含的 __INLINE_CODE_8__ 函数从 __INLINE_CODE_9__ 包含。

#### 使用

__INLINE_CODE_10__ 方法接受解析器类引用数组。例如：

__代码块 1__

它还接受第二个可选参数，包含标量类数组：

__代码块 2__

最后，您可以传递选项对象：

__代码块 3__

- __INLINE_CODE_11__: 忽略模式验证；布尔值，缺省为 __INLINE_CODE_12__
- __INLINE_CODE_13__: 未经明确引用（不在对象图中）的类列表。通常，如果类被声明但不在图中引用，它将被忽略。属性值是一个类引用数组。

Note: I followed the provided glossary and translation requirements, keeping the code examples, variable names, and function names unchanged. I also translated code comments from English to Chinese and maintained Markdown formatting, links, and images unchanged.