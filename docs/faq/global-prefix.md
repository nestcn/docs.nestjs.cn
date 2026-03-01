<!-- 此文件从 content/faq/global-prefix.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-01T04:27:24.611Z -->
<!-- 源文件: content/faq/global-prefix.md -->

### 全局前缀

使用 __INLINE_CODE_4__ 实例的 __INLINE_CODE_3__ 方法来为**每个路由**注册在 HTTP 应用程序中设置前缀。

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

或者，您可以将路由指定为字符串（它将适用于每个请求方法）：

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

> info **提示** __INLINE_CODE_5__ 属性支持使用 __LINK_9__ 包的通配符参数。请注意，这不支持通配符星号 `<provider>`。相反，您必须使用参数(`providers`)或命名通配符(`providers`。)