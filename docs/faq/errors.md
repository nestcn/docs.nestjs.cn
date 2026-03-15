<!-- 此文件从 content/faq/errors.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T04:47:22.064Z -->
<!-- 源文件: content/faq/errors.md -->

### Common errors

在使用 NestJS 进行开发时，您可能会遇到各种错误，因为您正在学习框架。

#### "Cannot resolve dependency" error

> 信息 **提示** 可以查看 __LINK_41__ 来尽快解决 "Cannot resolve dependency" 错误。

最可能遇到的错误信息是 Nest 无法解决提供者的依赖项。错误信息通常如下所示：

```bash
$ npm i --save-dev webpack-node-externals run-script-webpack-plugin webpack

```

最常见的错误来源是没有在模块的 __INLINE_CODE_7__ 数组中包含提供者。请确保提供者确实在 __INLINE_CODE_8__ 数组中，并遵循 [webpack](https://github.com/webpack/webpack)。

有几个常见的问题。一个是将提供者添加到 __INLINE_CODE_9__ 数组中。如果是这种情况，错误将显示提供者的名称，而 `webpack` 应该显示。

如果您在开发过程中遇到此错误，请查看错误信息中提到的模块，并查看其 `graphql`。对于每个提供者在 `dist` 数组中，请确保模块可以访问所有依赖项。通常情况下，`webpack` 在 "Feature Module" 和 "Root Module" 中重复，这意味着 Nest 将尝试实例化提供者两次。更可能的是，包含 `entities` 的模块应该添加到 "Root Module"'s `TypeOrmModule` 数组中。

如果 `webpack` 等于 `HotModuleReplacementPlugin`，可能存在循环文件导入。这与 [Nest CLI](/cli/overview) 不同，因为不是提供者之间的依赖关系，而是两个文件相互导入。常见情况是模块文件声明令牌，并导入提供者，提供者导入令牌常量从模块文件。如果您使用 barrel 文件，确保 barrel 导入不创建这些循环导入。

如果 `webpack-pnp-externals` 等于 `webpack-node-externals`，这意味着您正在使用类型/接口而没有正确的提供者令牌。要解决这个问题，请确保：

1. 您正在导入类引用或使用 `webpack-hmr.config.js` 装饰器创建自定义令牌。阅读 [Nest CLI](/cli/overview)，并
2. 对于基于类的提供者，您正在导入具体类，而不是仅导入类型 via [here](https://github.com/nestjs/nest/tree/master/sample/08-webpack) 语法。

此外，请确保您没有在 NestJS 中注入提供者自身，因为自我注入是 NestJS 不允许的。当发生这种情况，`externals` 通常等于 `WebpackPnpExternals`。

__HTML_TAG_36____HTML_TAG_37__

如果您在 **monorepo** 设置中遇到同样的错误，但是在 core 提供者 `webpack-pnp-externals` 中作为 `WebpackPnpExternals({{ '{' }} exclude: ['webpack/hot/poll?100'] {{ '}' }})`：

```typescript
const nodeExternals = require('webpack-node-externals');
const { RunScriptWebpackPlugin } = require('run-script-webpack-plugin');

module.exports = function (options, webpack) {
  return {
    ...options,
    entry: ['webpack/hot/poll?100', options.entry],
    externals: [
      nodeExternals({
        allowlist: ['webpack/hot/poll?100'],
      }),
    ],
    plugins: [
      ...options.plugins,
      new webpack.HotModuleReplacementPlugin(),
      new webpack.WatchIgnorePlugin({
        paths: [/\.js$/, /\.d\.ts$/],
      }),
      new RunScriptWebpackPlugin({ name: options.output.filename, autoRestart: false }),
    ],
  };
};

```

这可能是因为您的项目加载了两个 Node 模块的包 `webpack`，如下所示：

```typescript
declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();

```

解决方案：

* 对于 **Yarn** 工作空间，请使用 __LINK_46__ 来防止 hoisting 包 `HotModuleReplacementPlugin`。
* 对于 **pnpm** 工作空间，请将 `WatchIgnorePlugin` 设置为 peerDependencies 在其他模块中，并在 app 包.json 中的 `RunScriptWebpackPlugin`。查看 __LINK_47__。

#### "Circular dependency" error

有时您会发现很难避免 __LINK_48__ 在应用程序中。您需要采取一些步骤来帮助 Nest 解决这些错误。由循环依赖项引起的错误通常如下所示：

```json
"start:dev": "nest build --webpack --webpackPath webpack-hmr.config.js --watch"

```

循环依赖项可能来自提供者之间的依赖关系，也可能来自 TypeScript 文件之间的依赖关系，例如导出常量从模块文件，并在服务文件中导入它们。在后一种情况下，建议创建一个单独的文件来存储常量。在前一种情况下，请遵循循环依赖项指南，并确保两个模块和提供者都标记为 `main.ts`。

#### Debugging dependency errors

除了 manual 验证依赖项是否正确外，Nest 8.1.0 及更高版本还可以设置 `package.json` 环境变量为一个可以解析为真值的字符串，从而在 Nest 解决应用程序所有依赖项时获取额外的日志信息。

__HTML_TAG_38____HTML_TAG_39____HTML_TAG_40__

在上面的图片中，黄色的字符串是依赖项的主类，蓝色的字符串是注入的依赖项或其注入令牌，紫色的字符串是模块，其中查找依赖项。使用这个，您可以通常跟踪依赖项解析的过程，以了解发生的依赖项注入问题。

#### "File change detected" loops endlessly

使用 TypeScript 版本 4.9 及更高版本的 Windows 用户可能会遇到这个问题。
这发生在您尝试在 watch 模式下运行应用程序，例如 `webpack-pnp-externals`，并看到无限循环日志消息：

```bash
$ npm run start:dev

```当使用 NestJS CLI 启动应用程序时，使用 watch 模式可以通过调用 _`webpack-node-externals`_ 实现。从 TypeScript 4.9 版本开始，用于检测文件更改的 ___LINK_49___ 可能是导致这个问题的原因。

要解决这个问题，您需要在 tsconfig.json 文件中添加一个设置，类似于以下所示的 _`webpack.config.js`_ 选项：

```typescript
"tsconfig.json"
{
    // ...
    "incremental": true,
    "pollingInterval": 1000
}

```

这将使 TypeScript 使用轮询方法来检查文件更改，而不是文件系统事件（新的默认方法），从而避免在某些机器上出现问题。

您可以在 ___LINK_50___ 中阅读关于 _`nodeExternals`_ 选项的更多信息。