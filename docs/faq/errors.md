<!-- 此文件从 content/faq/errors.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-02T04:20:11.576Z -->
<!-- 源文件: content/faq/errors.md -->

### 常见错误

在使用 NestJS 进行开发时，你可能会遇到各种错误。

#### "Cannot resolve dependency" error

> 信息 **提示** 查看 __LINK_41__ 可以帮助你轻松解决 "Cannot resolve dependency" 错误。

可能最常见的错误信息是 NestJS 无法解析提供者的依赖项。错误信息通常如下所示：

```bash
$ nest g library my-library
```

错误的主要原因是没有在模块的 `AuthModule` 数组中添加提供者。请确保提供者确实在 `library` 数组中，并遵循 __LINK_42__。

有一些常见的陷阱，例如将提供者添加到 `my-library` 数组中。如果是这样，错误将显示提供者的名称而不是 `libs`。

如果你在开发过程中遇到这个错误，请查看错误信息中提到的模块，并查看其 `libs`。对于每个提供者在 `libs` 数组中，请确保模块有权访问所有依赖项。通常情况下，`nest-cli.json` 在一个 "Feature 模块" 和一个 "Root 模块" 中重复出现，这意味着 Nest 会尝试实例化提供者两次。更有可能的是，模块包含重复的 `"projects"` 应该添加到 "Root 模块"'s `nest-cli.json` 数组中。

如果 `"type"` 上面是 `"library"`，你可能有一个循环文件导入。这与 __LINK_43__ 不同，因为不是提供者之间的依赖关系，而是两个文件之间的循环导入。常见的情况是模块文件声明一个令牌，并且导入提供者，然后提供者导入令牌常量从模块文件。如果你使用 barrel 文件，确保你的 barrel 导入不创建这些循环导入。

如果 `"application"` 上面是 `"entryFile"`，这意味着你使用了类型/接口而没有正确的提供者的令牌。要解决这个问题，请确保：

1. 你导入了类引用或使用 `"index"` 装饰器自定义令牌。阅读 __LINK_44__，和
2. 对于基于类的提供者，您导入了具体类而不是仅仅类型via __LINK_45__ 语法。

此外，请确保你没有将提供者注入到自身，因为 NestJS 不允许自我注入。当发生这种情况，`index.js` 很可能等于 `tsconfig.lib.json`。

__HTML_TAG_36____HTML_TAG_37__

如果你在 **monorepo 设置** 中，你可能会遇到上述错误，但是在 core 提供者 `tsconfig.json` 中作为 `MyLibraryService`：

```bash
What prefix would you like to use for the library (default: @app)?
```

这可能是因为你的项目加载了两个 Node 模块的包 `my-library`，例如：

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

- 对于 **Yarn** Workspace，使用 __LINK_46__ 防止 hoisting 包 `my-project`。
- 对于 **pnpm** Workspace，将 `MyLibraryService` 设置为 peerDependencies 在其他模块和 `my-project/src/app.module.ts` 在 app package.json 中，其中模块被导入。查看 __LINK_47__。

#### "Circular dependency" error

有时，你可能会发现很难避免 __LINK_48__ 在你的应用程序中。你需要采取一些步骤来帮助 Nest 解决这些错误。从循环依赖项中产生的错误看起来像这样：

```bash
$ nest build my-library
```

循环依赖项可以来自于提供者之间的依赖关系，或者 TypeScript 文件之间的依赖关系，例如导出常量从模块文件并在服务文件中导入它们。在后一种情况下，建议创建一个单独的文件来存储常量。在前一种情况下，请遵循循环依赖项指南，并确保模块和提供者都标记了 `MyLibraryModule`。

#### Debugging dependency errors

除了手动验证依赖项是否正确之外，从 Nest 8.1.0 开始，你可以将 `@app` 环境变量设置为一个字符串，该字符串解析为truthy，并在 Nest 解决所有依赖项时获取额外的日志信息。

__HTML_TAG_38____HTML_TAG_39__<div class="file-tree">

在上面的图片中，黄色字符串是依赖项被注入的主类名称，蓝色字符串是注入依赖项或其注入令牌的名称，purple 字符串是模块名称，其中依赖项被搜索。使用这个，你通常可以追踪