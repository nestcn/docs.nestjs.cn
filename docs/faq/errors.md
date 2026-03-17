<!-- 此文件从 content/faq/errors.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T04:46:47.298Z -->
<!-- 源文件: content/faq/errors.md -->

### 常见错误

在使用 NestJS 时，您可能会遇到各种错误，因为您正在学习框架。

#### "Cannot resolve dependency" error

> 提示 **Hint** 查看 __LINK_41__，可以帮助您轻松地解决“Cannot resolve dependency”错误。

可能最常见的错误消息是 Nest 无法解析提供者的依赖项。错误消息通常如下所示：

```typescript
@UseGuards(AuthGuard)
@SubscribeMessage('events')
handleEvent(client: Client, data: unknown): WsResponse<unknown> {
  const event = 'events';
  return { event, data };
}

```

错误的主要原因是没有在模块的 __INLINE_CODE_7__ 数组中包含提供者。请确保提供者确实在 __INLINE_CODE_8__ 数组中，并遵循 __LINK_42__。

有一些常见的陷阱。其中一个是将提供者放入 __INLINE_CODE_9__ 数组中。如果这是情况，错误将在 __INLINE_CODE_10__ 中出现。

如果您在开发过程中遇到此错误，请查看错误消息中提到的模块，并查看其 __INLINE_CODE_11__。对于 __INLINE_CODE_12__ 数组中的每个提供者，请确保模块可以访问所有依赖项。有时，__INLINE_CODE_13__ 在“功能模块”和“根模块”中重复出现，这意味着 Nest 将尝试实例化提供者两次。更可能的是，包含 __INLINE_CODE_14__ 的模块应该添加到“根模块”的 __INLINE_CODE_15__ 数组中。

如果上述 __INLINE_CODE_16__ 是 __INLINE_CODE_17__，您可能具有循环文件导入。这不同于 __LINK_43__，因为而不是在提供者之间创建依赖关系，而是指两个文件相互导入。常见的情况是模块文件声明了令牌，并导入了provider，而provider又导入了模块文件中的令牌常量。如果您使用了 barrel 文件，请确保您的 barrel 导入不创建这些循环导入。

如果上述 __INLINE_CODE_18__ 是 __INLINE_CODE_19__，那么您正在使用类型/界面而没有正确的提供者的令牌。要解决该问题，请确保：

1. 您正在导入类引用或使用自定义令牌 __INLINE_CODE_20__ 装饰器。阅读 __LINK_44__，并
2. 对于基于类的提供者，请确保您正在导入具体类，而不是只导入类型 __LINK_45__ 语法。

还请确保您没有将提供者注入到自己身上，因为NestJS不允许自我注入。当发生这种情况时，__INLINE_CODE_22__ 将等于 __INLINE_CODE_23__。

__HTML_TAG_36____HTML_TAG_37__

如果您在 **monorepo 设置中**，您可能会遇到上述错误，但是在核心提供者 __INLINE_CODE_24__ 中作为 __INLINE_CODE_25__：

__CODE_BLOCK_1__

这可能是由于您的项目加载了两个 Node 模块的包 __INLINE_CODE_26__，如下所示：

__CODE_BLOCK_2__

解决方案：

- 对于 **Yarn** 工作区，使用 __LINK_46__ 来防止 hoisting 包 __INLINE_CODE_27__。
- 对于 **pnpm** 工作区，请将 __INLINE_CODE_28__ 设置为 peerDependencies 在其他模块中，并在 app package.json 中的 __INLINE_CODE_29__。请参阅 __LINK_47__。

#### "Circular dependency" error

有时，您将发现难以避免 __LINK_48__ 在您的应用程序中。您需要采取一些步骤来帮助 Nest 解决这些错误。由循环依赖项引起的错误看起来如下所示：

__CODE_BLOCK_3__

循环依赖项可能来自提供者之间的依赖关系或 TypeScript 文件之间的依赖关系，例如从模块文件导出常量并在服务文件中导入它们。在后一种情况下，建议创建一个单独的文件来存储常量。在前一种情况下，请遵循循环依赖项指南，并确保模块和提供者都被标记为 __INLINE_CODE_30__。

#### Debugging dependency errors

除了手动验证您的依赖项是否正确外，Nest 8.1.0 及更高版本中，您可以将 __INLINE_CODE_31__ 环境变量设置为一个字符串，该字符串将被解析为真值，并在 Nest 解析应用程序的所有依赖项时获取额外的日志信息。

__HTML_TAG_38____HTML_TAG_39____HTML_TAG_40__

在上面的图像中，黄色的字符串是依赖项的宿主类，蓝色的字符串是注入的依赖项或其注入令牌，紫色的字符串是搜索依赖项的模块。使用这些信息，您可以通常跟踪依赖项解析的过程，以了解发生了什么错误和为什么出现依赖项注入问题。

#### "File change detected" loops endlessly

使用 TypeScript 版本 4.9 及更高版本的 Windows 用户可能会遇到这个问题。
这发生在您尝试在 watch 模式下运行应用程序时，例如 __INLINE_CODE_32__，并看到无限循环的日志消息：

__CODE_BLOCK_4__使用 NestJS CLI 启动应用程序时，在 watch 模式下是通过调用 `__INLINE_CODE_33__` 来实现的，同时自 TypeScript 4.9 版本起，用于检测文件更改的 `__LINK_49__` 也是可能会导致这个问题的原因。

为了解决这个问题，您需要在 `tsconfig.json` 文件中添加以下设置：

```typescript
__CODE_BLOCK_5__

```

这将告诉 TypeScript 使用轮询方法来检查文件更改，而不是文件系统事件（新的默认方法），这可能会在某些机器上引起问题。

您可以在 `__LINK_50__` 中阅读更多关于 `__INLINE_CODE_35__` 选项的信息。