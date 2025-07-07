### 常见错误

在使用 NestJS 进行开发时，随着对框架的学习，您可能会遇到各种错误。

#### "无法解析依赖项"错误

> info **提示** 查看 [NestJS Devtools](./devtools/overview#调查无法解析依赖项错误) 可以帮助您轻松解决"无法解析依赖项"错误。

最常见的错误消息是关于 Nest 无法解析提供者的依赖项。错误消息通常如下所示：

```bash
Nest 无法解析 <provider> 的依赖项（?）。请确保索引 [<index>] 处的参数 <unknown_token> 在 <module> 上下文中可用。

可能的解决方案：
- <module> 是否为有效的 NestJS 模块？
- 如果 <unknown_token> 是提供者，它是否属于当前 <module>？
- 如果 <unknown_token> 从单独的 @Module 导出，该模块是否已在 <module> 中导入？
  @Module({
    imports: [ /* 包含 <unknown_token> 的模块 */ ]
  })
```

导致此错误最常见的原因是没有将 `<provider>` 放入模块的 `providers` 数组中。请确保该提供者确实位于 `providers` 数组中，并遵循[标准 NestJS 提供者实践](./fundamentals/custom-providers#di-基础)。

有几个常见的陷阱需要注意。其中之一是将提供者放入了 `imports` 数组中。如果是这种情况，错误消息中会在 `<module>` 应该出现的位置显示提供者的名称。

在开发过程中遇到此错误时，请查看错误信息中提到的模块及其 `providers` 配置。对于 `providers` 数组中的每个提供者，请确保该模块能访问所有依赖项。常见情况是 `providers` 在"功能模块"和"根模块"中被重复声明，导致 Nest 会尝试实例化两次提供者。大多数情况下，包含重复 `<provider>` 的模块应该被添加到"根模块"的 `imports` 数组中。

如果上文的 `<unknown_token>` 是 `dependency`，可能存在循环文件导入。这与下文[循环依赖](#循环依赖错误)不同——不是指提供者在其构造函数中相互依赖，而是两个文件最终相互导入。典型场景是：模块文件声明令牌时导入提供者，而提供者又从模块文件导入令牌常量。如果使用桶文件，请确保桶文件导入不会形成此类循环导入关系。

如果上方的 `<unknown_token>` 显示为 `Object`，说明您正在使用没有提供者令牌的类型/接口进行注入。要解决此问题，请确保：

1.  您已导入类引用或使用带有 `@Inject()` 装饰器的自定义令牌。请阅读[自定义提供者页面](./fundamentals/custom-providers)，以及
2.  对于基于类的提供者，您导入的是具体类而不仅仅是 [`import type ...`](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-8.html#type-only-imports-and-export) 语法引入的类型。

同时请确保没有出现提供者自我注入的情况，因为 NestJS 不允许自我注入。当发生这种情况时，`<unknown_token>` 很可能会等于 `<provider>`。

如果你处于 **monorepo 设置**中，可能会遇到与上述相同的错误，但核心提供者 `ModuleRef` 会显示为 `<unknown_token>`：

```bash
Nest 无法解析 <provider> 的依赖项（?）。
请确保索引 [<index>] 处的参数 ModuleRef 在 <module> 上下文中可用。
...
```

这种情况通常发生在你的项目最终加载了两个 `@nestjs/core` 包的 Node 模块时，例如：

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

解决方案：

- 对于 **Yarn** Workspaces，使用 [nohoist 特性](https://classic.yarnpkg.com/blog/2018/02/15/nohoist)来阻止提升 `@nestjs/core` 包。
- 对于 **pnpm** 工作区，请在其他模块中将 `@nestjs/core` 设置为 peerDependencies，并在导入该模块的应用 package.json 中添加 `"dependenciesMeta": {"other-module-name": {"injected": true}}` 。参见：[dependenciesmetainjected](https://pnpm.io/package_json#dependenciesmetainjected)

#### "循环依赖"错误

有时您会发现应用中难以避免[循环依赖](./fundamentals/circular-dependency)问题。您需要采取一些措施帮助 Nest 解决这些问题。由循环依赖引发的错误通常如下所示：

```bash
Nest 无法创建 <module> 实例。
<module> "imports" 数组中索引 [<index>] 处的模块未定义。

可能的原因：
- 模块间存在循环依赖。使用 forwardRef() 避免此问题。了解更多：./fundamentals/circular-dependency
- 索引 [<index>] 处的模块类型为 "undefined"。检查您的导入语句和模块类型。

作用域 [<module_import_chain>]
# 示例链：AppModule -> FooModule
```

循环依赖可能源于提供者之间相互依赖，或是 TypeScript 文件间因常量而相互依赖（例如从模块文件导出常量并在服务文件中导入）。对于后者，建议为常量创建单独的文件。对于前者，请遵循循环依赖指南，确保模块**和**提供者都使用 `forwardRef` 进行标记。

#### 调试依赖项错误

除了手动验证依赖项是否正确外，从 Nest 8.1.0 开始，您可以将 `NEST_DEBUG` 环境变量设置为可解析为真值的字符串，这样在 Nest 解析应用程序所有依赖项时就能获取额外的日志信息。

![](/assets/injector_logs.png)

在上图中，黄色字符串表示被注入依赖项的主机类，蓝色字符串表示被注入依赖项的名称或其注入令牌，紫色字符串表示搜索该依赖项的模块。通过这些信息，通常可以追溯依赖项解析过程，了解发生了什么以及为何会出现依赖项注入问题。

#### "检测到文件更改"无限循环

使用 TypeScript 4.9 及以上版本的 Windows 用户可能会遇到此问题。当您尝试以监视模式运行应用程序时（例如 `npm run start:dev`），会出现日志消息的无限循环：

```bash
XX:XX:XX AM - 检测到文件变更。开始增量编译...
XX:XX:XX AM - 发现 0 个错误。正在监视文件变更。
```

当您使用 NestJS CLI 以监视模式启动应用程序时，实际上是通过调用 `tsc --watch` 实现的。从 TypeScript 4.9 版本开始，采用了一种 [新的策略](https://devblogs.microsoft.com/typescript/announcing-typescript-4-9/#file-watching-now-uses-file-system-events) 来检测文件变更，这很可能是导致此问题的原因。要解决此问题，您需要在 tsconfig.json 文件的 `"compilerOptions"` 选项后添加如下设置：

```json
  "watchOptions": {
    "watchFile": "fixedPollingInterval"
  }
```

这将指示 TypeScript 使用轮询方法（而非新的默认文件系统事件方法）来检查文件变更，后者在某些机器上可能会引发问题。您可以在 [TypeScript 文档](https://www.typescriptlang.org/tsconfig#watch-watchDirectory) 中阅读更多关于 `"watchFile"` 选项的信息。
