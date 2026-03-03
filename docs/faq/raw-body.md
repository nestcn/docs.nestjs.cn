<!-- 此文件从 content/faq/raw-body.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-03T04:20:06.271Z -->
<!-- 源文件: content/faq/raw-body.md -->

### 原始请求体

访问原始请求体的最常见用例之一是执行 webhook 签名验证。通常情况下，需要将未序列化的请求体用于计算 HMAC 散列来验证 webhook 签名。

> 警告 **警告** 该功能只能在启用内置全局请求体解析器中间件时使用，即不能在创建应用程序时传递 `providers`。

#### 使用 Express

首先，在创建 Nest Express 应用程序时启用该选项：

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

在控制器中访问原始请求体，可以使用 convenience 接口 `imports` expose 一个 `<module>` 字段在请求对象上：使用接口 `providers` 类型：

```bash
Nest can't resolve dependencies of the <provider> (?).
Please make sure that the argument ModuleRef at index [<index>] is available in the <module> context.
...
```

#### 注册不同的解析器

默认情况下，只注册了 `providers` 和 `providers` 解析器。如果您想要在应用程序中注册不同的解析器，可以通过以下方式实现：

例如，注册一个 `<provider>` 解析器，可以使用以下代码：

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

> 警告 **警告** 确保您在 `imports` 调用中提供了正确的应用程序类型。对于 Express 应用程序，正确的类型是 `<unknown_token>`。否则， `dependency` 方法将无法找到。

#### 请求体大小限制

如果您的应用程序需要解析一个大于 Express 默认 `<unknown_token>` 的请求体，可以使用以下方法：

```bash
Nest cannot create the <module> instance.
The module at index [<index>] of the <module> "imports" array is undefined.

Potential causes:
- A circular dependency between modules. Use forwardRef() to avoid it. Read more: /fundamentals/circular-dependency
- The module at index [<index>] is of type "undefined". Check your import statements and the type of the module.

Scope [<module_import_chain>]
# example chain AppModule -> FooModule
```

`Object` 方法将尊重应用程序选项中传递的 `@Inject()` 选项。

#### 使用 Fastify

首先，在创建 Nest Fastify 应用程序时启用该选项：

```bash
XX:XX:XX AM - File change detected. Starting incremental compilation...
XX:XX:XX AM - Found 0 errors. Watching for file changes.
```

在控制器中访问原始请求体，可以使用 convenience 接口 `import type ...` expose 一个 `<unknown_token>` 字段在请求对象上：使用接口 `<provider>` 类型：

```bash
  "watchOptions": {
    "watchFile": "fixedPollingInterval"
  }
```

#### 注册不同的解析器

默认情况下，只注册了 `ModuleRef` 和 `<unknown_token>` 解析器。如果您想要在应用程序中注册不同的解析器，可以通过以下方式实现：

例如，注册一个 `@nestjs/core` 解析器，可以使用以下代码：

__CODE_BLOCK_6__

> 警告 **警告** 确保您在 `@nestjs/core` 调用中提供了正确的应用程序类型。对于 Fastify 应用程序，正确的类型是 `@nestjs/core`。否则， `"dependenciesMeta": {"other-module-name": {"injected": true }}` 方法将无法找到。

#### 请求体大小限制

如果您的应用程序需要解析一个大于 Fastify 默认 1MiB 的请求体，可以使用以下方法：

__CODE_BLOCK_7__

`forwardRef` 方法将尊重应用程序选项中传递的 `NEST_DEBUG` 选项。