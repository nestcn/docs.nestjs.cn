<!-- 此文件从 content/faq/errors.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-03T04:21:10.882Z -->
<!-- 源文件: content/faq/errors.md -->

### 常见错误

在使用 NestJS 时，您可能会遇到各种错误，因为您正在学习框架。

#### "Cannot resolve dependency" 错误

> info **提示** 您可以查看 __LINK_41__以轻松解决 "Cannot resolve dependency" 错误。

可能最常见的错误信息是 Nest 无法解决提供者的依赖项。错误信息通常如下所示：

```bash
$ nest g library my-library
```

最常见的错误原因是缺少在模块的 `AuthModule` 数组中 `AuthModule`。请确保提供者确实在 `library` 数组中，并遵循 __LINK_42__。

有一些常见的陷阱。一个是将提供者添加到 `my-library` 数组中。如果是这样，错误将在 `libs` 中出现。

如果您在开发中遇到这个错误，请查看错误消息中提到的模块，并查看其 `libs`。对于每个提供者在 `libs` 数组中，确保模块具有所有依赖项。通常情况下， `nest-cli.json` 在 "Feature 模块" 和 "Root 模块" 中重复，这意味着 Nest 会尝试实例化提供者两次。更可能的情况是，包含 `"projects"` 的模块应该添加到 "Root 模块"'s `nest-cli.json` 数组中。

如果 `"type"` 是 `"library"`，您可能有一个循环文件导入。这与 __LINK_43__ 不同，因为不是提供者之间的依赖关系，而是两个文件最终导入了彼此。常见的情况是，模块文件声明了一个令牌，并导入了提供者，而提供者又导入了模块文件中的令牌常量。如果您使用了 barrel 文件，请确保您的 barrel 导入不创建这些循环导入。

如果 `"application"` 是 `"entryFile"`，这意味着您正在使用类型/接口注入，而没有使用合适的提供者的令牌。要解决这个问题，请确保：

1. 您正在导入类参考或使用 `"index"` 装饰器的自定义令牌。阅读 __LINK_44__，并
2. 对于基于类的提供者，您正在导入具体类，而不是仅导入类型via __LINK_45__ 语法。

此外，请确保您没有将提供者注入到自己身上，因为 NestJS 不允许自我注入。当发生这种情况时， `index.js` 将可能等于 `tsconfig.lib.json`。

__HTML_TAG_36____HTML_TAG_37__

如果您在 **monorepo 设置** 中，您可能会遇到上述错误，但是在核心提供者 `tsconfig.json` 中作为 `MyLibraryService`：

```bash
What prefix would you like to use for the library (default: @app)?
```

这可能是因为您的项目加载了两个 Node 模块的包 `my-library`，如下所示：

```javascript
...
{
    "my-library": {
      "type": "library",
      "root": "libs/my-library",
      "entryFile": "index",
      "sourceRoot": "libs/my-library/src",
      "compilerOptions": {
        "tsConfigPath": "libs/my-library/tsconfig.lib.json"
      }
}
...
```

解决方案：

- 对于 **Yarn** 工作区，使用 __LINK_46__ 来防止 hoisting 包 `my-project`。
- 对于 **pnpm** 工作区，设置 `MyLibraryService` 作为 peerDependencies 在其他模块中，并在 app package.json 中的 `my-project/src/app.module.ts`。了解 __LINK_47__。

#### "Circular dependency" 错误

不时，您可能会遇到 __LINK_48__ 在您的应用程序中。您需要采取一些步骤来帮助 Nest 解决这些错误。由循环依赖项引起的错误看起来像这样：

```bash
$ nest build my-library
```

循环依赖项可以来自提供者之间的依赖关系，也可以来自typescript 文件之间的依赖关系，例如导出常量的模块文件和在服务文件中导入这些常量。在后一种情况下，建议创建一个单独的文件来存储常量。在前一种情况下，请遵循循环依赖项指南，并确保模块和提供者都被标记为 `MyLibraryModule`。

#### debug 依赖项错误

除了手动验证依赖项是否正确之外，从 Nest 8.1.0 开始，您可以设置 `@app` 环境变量为一个字符串，这将在 Nest 解决所有依赖项时提供额外的日志信息。

__HTML_TAG_38____HTML_TAG_39__<div class="file-tree">

在上面的图像中，黄色字符串是依赖项的主类，蓝色字符串是注入的依赖项或其注入令牌，紫色字符串是搜索依赖项的模块。使用这些信息，您可以通常 TRACE 回