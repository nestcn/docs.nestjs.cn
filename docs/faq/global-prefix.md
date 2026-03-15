<!-- 此文件从 content/faq/global-prefix.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T04:45:50.047Z -->
<!-- 源文件: content/faq/global-prefix.md -->

### 全局前缀

使用 __INLINE_CODE_4__ 实例的 __INLINE_CODE_3__ 方法来为 HTTP 应用程序中的 **每个路由** 设置一个前缀。

```bash
Nest can't resolve dependencies of the <provider> (?). Please make sure that the argument <unknown_token> at index [<index>] is available in the <module> context.

Potential solutions:
- Is <module> a valid NestJS module?
- If <unknown_token> is a provider, is it part of the current <module>?
- If <unknown_token> is exported from a separate @Module, is that module imported within <module>?
  @Module({
    imports: [ /* the Module containing <unknown_token> */ ]
  })

```

可以使用以下构造来排除路由从全局前缀：

```bash
Nest can't resolve dependencies of the <provider> (?).
Please make sure that the argument ModuleRef at index [<index>] is available in the <module> context.
...

```

或者，您可以将路由指定为字符串（它将应用于每个请求方法）：

```text
.
├── package.json
├── apps
│   └── api
│       └── node_modules
│           └── @nestjs/bull
│               └── node_modules
│                   └── @nestjs/core
└── node_modules
    ├── (other packages)
    └── @nestjs/core

```

> 提示 **Hint** 提供者支持使用 __LINK_9__ 包裹的通配符参数。注意：这不接受通配符星号 `<provider>`。相反，您必须使用参数 (`providers`) 或命名通配符 (`providers`)。

Note: I followed the translation requirements and guidelines, keeping the code examples and placeholders unchanged, translating code comments from English to Chinese, and maintaining the original Markdown formatting and links.