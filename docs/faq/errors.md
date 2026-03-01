<!-- 此文件从 content/faq/errors.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-01T04:28:34.341Z -->
<!-- 源文件: content/faq/errors.md -->

### 通常错误

在使用 NestJS 时，您可能会遇到各种错误，因为您是在学习框架。

#### "无法解决依赖项"错误

> 提示 **查看** __LINK_41__ 可以帮助您轻松地解决 "无法解决依赖项"错误。

可能最常见的错误消息是 Nest 无法解决提供者的依赖项。错误消息通常类似于以下内容：

```bash
$ nest g library my-library
```

通常，错误的主要原因是没有将提供者添加到模块的 `AuthModule` 数组中。请确保提供者确实添加到 `library` 数组中，并遵循 __LINK_42__。

有一些常见的陷阱。其中一个是将提供者添加到 `my-library` 数组中。如果是这样，错误将在 `libs` 中出现。

如果您在开发时遇到这个错误，请查看错误消息中提到的模块，并查看其 `libs`。对于每个提供者在 `libs` 数组中，请确保模块可以访问所有依赖项。通常， `nest-cli.json` 在 "Feature 模块" 和 "Root 模块" 中重复，这意味着 Nest 将尝试实例化提供者两次。更可能的是，包含 `"projects"` 的模块应该添加到 "Root 模块"'s `nest-cli.json` 数组中，而不是 "Feature 模块"'s `my-library` 数组中。

如果 `"type"` 等于 `"library"`，可能会出现循环文件导入。这不同于 __LINK_43__，因为它只是意味着两个文件相互导入，而不是提供者之间的依赖关系。一个常见的场景是模块文件声明了一个 token，並导入了提供者，然后提供者导入了 token 常量从模块文件。如果您使用了 barrel 文件，请确保您的 barrel 导入不会创建这些循环导入。

如果 `"application"` 等于 `"entryFile"`，意味着您使用了类型/接口而没有正确的提供者的 token。要解决这个问题，请确保：

1. 您正在导入类引用或使用自定义 token with `"index"` 装饰器。阅读 __LINK_44__，并
2. 对于基于类的提供者，请确保您正在导入具体类，而不是仅仅导入类型 via __LINK_45__ 语法。

此外，请确保您没有将提供者注入到自己身上，因为 NestJS 不允许自我注入。当发生这种情况时，`index.js` 将等于 `tsconfig.lib.json`。

__HTML_TAG_36____HTML_TAG_37__

如果您在 **monorepo 设置** 中，您可能会遇到与上述错误相同的错误，但是在 core 提供者 `tsconfig.json` 中作为 `MyLibraryService`：

```bash
What prefix would you like to use for the library (default: @app)?
```

这可能是您的项目加载了两个 Node 模块的包 `my-library`，如下所示：

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

- 对于 **Yarn** 工作区，请使用 __LINK_46__ 防止 hoisting 包 `my-project`。
- 对于 **pnpm** 工作区，请将 `MyLibraryService` 设置为 peerDependencies 在其他模块中，并在 app package.json 中的 `my-project/src/app.module.ts`。请查看 __LINK_47__。

#### "循环依赖项"错误

 occasionally 您将发现难以避免 __LINK_48__ 在您的应用程序中。您需要采取一些步骤来帮助 Nest 解决这些错误。从循环依赖项中出现的错误消息类似于以下内容：

```bash
$ nest build my-library
```

循环依赖项可能来自提供者之间的依赖关系，或者 TypeScript 文件之间的依赖关系，例如在模块文件中导出常量，并在服务文件中导入这些常量。在后一种情况下，建议创建一个单独的文件来存储常量。在前一种情况下，请遵循循环依赖项指南，并确保双方的模块和提供者都标记为 `MyLibraryModule`。

#### 调试依赖项错误

除了手动验证依赖项是否正确之外，作为 Nest 8.1.0，您可以将 `@app` 环境变量设置为一个字符串，这将在 Nest 尝试解决应用程序中的所有依赖项时提供额外的日志信息。

__HTML_TAG_38____HTML_TAG_39__<div class="file-tree">

在上面的图片中，黄色字符串是依赖项的宿主类，蓝色字符串是注入