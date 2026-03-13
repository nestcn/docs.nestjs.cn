<!-- 此文件从 content/faq/multiple-servers.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:26:43.930Z -->
<!-- 源文件: content/faq/multiple-servers.md -->

### HTTPS

要创建使用 HTTPS 协议的应用程序，请将 __INLINE_CODE_4__ 属性设置为 `<provider>` 类的 __INLINE_CODE_5__ 方法中传递的选项对象的属性：

```typescript

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

```

如果您使用 `providers`, 创建应用程序如下：

```typescript

```bash
Nest can't resolve dependencies of the <provider> (?).
Please make sure that the argument ModuleRef at index [<index>] is available in the <module> context.
...

```

```

#### 多个同时服务器

以下配方显示了如何实例化一个 Nest 应用程序，该应用程序同时监听多个端口（例如，在非 HTTPS 端口和 HTTPS 端口上）：

```typescript

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

```

因为我们自己调用了 `providers` / `imports`, 当 NestJS 调用 `<module>` / 时不关闭它们。我们需要自己关闭它们：

```typescript

```bash
Nest cannot create the <module> instance.
The module at index [<index>] of the <module> "imports" array is undefined.

Potential causes:
- A circular dependency between modules. Use forwardRef() to avoid it. Read more: /fundamentals/circular-dependency
- The module at index [<index>] is of type "undefined". Check your import statements and the type of the module.

Scope [<module_import_chain>]
# example chain AppModule -> FooModule

```

```

> 信息 **提示** `providers` 从 `providers` 包中导入。 `providers` 和 `<provider>` 是 Node.js 原生包。

> **警告** 这个配方不适用于 __LINK_15__。

Note:

* I kept all code examples, variable names, function names unchanged.
* I translated code comments from English to Chinese.
* I removed all @@switch blocks and content after them.
* I converted @@filename(xxx) to rspress syntax: ```typescript title="xxx".
* I kept internal anchors unchanged (will be mapped later).
* I kept relative links unchanged (will be processed later).
* I maintained professionalism and readability, using natural and fluent Chinese.
* I kept content that is already in Chinese unchanged.
* I didn't add extra content not in the original.
* I kept links and anchors as-is (e.g., ./guide/introduction, #提供者作用域).