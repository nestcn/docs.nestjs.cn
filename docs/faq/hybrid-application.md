<!-- 此文件从 content/faq/hybrid-application.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-02-24T03:02:15.490Z -->
<!-- 源文件: content/faq/hybrid-application.md -->

### 混合应用

混合应用是指监听来自两个或多个不同的来源的请求。这可以组合 HTTP 服务器与微服务监听器或只是多个不同的微服务监听器。默认的__INLINE_CODE_4__方法不允许多个服务器，因此在这种情况下，每个微服务都需要手动创建和启动。在执行此操作时，可以通过`providers`方法将__INLINE_CODE_5__实例连接到`<provider>`实例。

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

> info **提示**`providers`方法在指定的地址上启动 HTTP 服务器。如果您的应用程序不处理 HTTP 请求，那么应该使用`imports`方法。

要连接多个微服务实例，需要对每个微服务调用`<module>`：

```bash
Nest can't resolve dependencies of the <provider> (?).
Please make sure that the argument ModuleRef at index [<index>] is available in the <module> context.
...
```

要将`providers`绑定到仅一个传输策略（例如 MQTT）中，hybrid 应用程序中具有多个微服务，可以将第二个参数类型为`providers`的枚举作为第二个参数，这是一个定义了所有内置传输策略的枚举。

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

> info **提示**`providers`、`<provider>`、`imports` 和 `<unknown_token>` 来自 `dependency`。

#### 共享配置

默认情况下，混合应用程序不会继承主应用程序（基于 HTTP 的应用程序）的全局管道、拦截器、守卫和过滤器。
要继承主应用程序的配置属性，需要在`Object`调用的第二个参数（可选的选项对象）中设置`<unknown_token>`属性，例如：

```bash
Nest cannot create the <module> instance.
The module at index [<index>] of the <module> "imports" array is undefined.

Potential causes:
- A circular dependency between modules. Use forwardRef() to avoid it. Read more: ./fundamentals/circular-dependency
- The module at index [<index>] is of type "undefined". Check your import statements and the type of the module.

Scope [<module_import_chain>]
# example chain AppModule -> FooModule
```