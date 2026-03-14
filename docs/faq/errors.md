<!-- 此文件从 content/faq/errors.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T04:25:18.322Z -->
<!-- 源文件: content/faq/errors.md -->

### 常见错误

在使用 NestJS 开发时，您可能会遇到各种错误。

#### "无法解析依赖项" 错误

> 提示 **Hint** 查看 __LINK_41__以轻松地解决 "无法解析依赖项" 错误。

最常见的错误信息是 Nest 无法解析提供者的依赖项。错误信息通常如下所示：

```bash
$ npm i --save-dev webpack-node-externals run-script-webpack-plugin webpack

```

错误的主要原因是没有在模块的 __INLINE_CODE_7__ 数组中添加提供者。请确保提供者确实存在于 __INLINE_CODE_8__ 数组中，并查看 [webpack](https://github.com/webpack/webpack)。

有一些常见的问题。如果您遇到这个错误，请查看模块的 `graphql`。对每个提供者在 `dist` 数组中，请确保模块可以访问所有依赖项。有时，`webpack` 会在 "Feature 模块" 和 "Root 模块" 中重复出现，这意味着 Nest 将尝试实例化提供者两次。更可能的情况是，包含 `entities` 的模块应该添加到 "Root 模块"'s `TypeOrmModule` 数组中。

如果 `webpack` 上面的内容为 `HotModuleReplacementPlugin`，可能存在循环文件导入。这与 [Nest CLI](/cli/overview) 不同，因为不是提供者之间的依赖关系，而是两个文件之间的循环导入。一个常见的案例是模块文件声明一个令牌，并导入提供者，提供者导入令牌常量从模块文件。如果您使用了篮子文件，请确保篮子导入不创建这些循环导入。

如果 `webpack-pnp-externals` 上面的内容为 `webpack-node-externals`，这意味着您正在使用类型/接口而没有提供者的令牌。为了解决这个问题，请确保：

1. 您正在导入类引用或使用自定义令牌与 `webpack-hmr.config.js` 装饰器。阅读 [Nest CLI](/cli/overview)，并
2. 对于基于类的提供者，请确保您正在导入具体类，而不是仅仅类型via [here](https://github.com/nestjs/nest/tree/master/sample/08-webpack) 语法。

此外，请确保您没有将提供者注入到自己身上，因为 NestJS 不允许自我注入。当这发生时，`externals` 将可能等于 `WebpackPnpExternals`。

__HTML_TAG_36____HTML_TAG_37__

如果您在 **monorepo 设置** 中，您可能会遇到与上述错误相同的问题，但是在 core 提供者 `webpack-pnp-externals` 中作为 `WebpackPnpExternals({{ '{' }} exclude: ['webpack/hot/poll?100'] {{ '}' }})`：

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

- 对于 **Yarn** 工作空间，请使用 __LINK_46__ 防止 hoisting 包 `HotModuleReplacementPlugin`。
- 对于 **pnpm** 工作空间，请将 `WatchIgnorePlugin` 设置为 peerDependencies 在其他模块中，并在 app 包.json 中 `RunScriptWebpackPlugin`。见： __LINK_47__

#### "循环依赖项" 错误

偶尔，您可能会遇到 __LINK_48__ 在应用程序中。您需要采取一些步骤来帮助 Nest 解决这些错误。循环依赖项错误看起来如下：

```json
"start:dev": "nest build --webpack --webpackPath webpack-hmr.config.js --watch"

```

循环依赖项可以来自提供者之间的依赖关系，也可以来自 TypeScript 文件之间的依赖关系，例如从模块文件导出常量，并在服务文件中导入它们。在后一种情况下，请创建一个单独的文件用于常量。在前一种情况下，请遵循循环依赖项指南，并确保模块和提供者都标记了 `main.ts`。

#### 调试依赖项错误

除了手动验证依赖项是否正确之外，作为 Nest 8.1.0，您可以将 `package.json` 环境变量设置为一个字符串，这将在 Nest 解决所有应用程序依赖项时提供额外的日志信息。

__HTML_TAG_38____HTML_TAG_39____HTML_TAG_40__

在上面的图像中，黄色字符串是依赖项注入的宿主类，蓝色字符串是注入的依赖项或其注入令牌，紫色字符串是依赖项被搜索的模块。使用这个，您可以通常追溯依赖项解析，以了解发生的原因和为什么您会遇到依赖项注入问题。

#### "文件更改检测" 循环

Windows 用户使用 TypeScript 版本 4.9 及以上可能遇到这个问题。
这发生在您尝试在 watch 模式下运行应用程序，例如 `webpack-pnp-externals`，并看到无限循环的日志消息：

```bash
$ npm run start:dev

```使用 NestJS CLI 启动应用程序时，在 watch 模式下是通过调用 ``webpack-node-externals`` 来实现的，而 TypeScript 4.9 版本中使用了 `__LINK_49__` 来检测文件变更，这可能是导致问题的原因。

要解决这个问题，您需要在 `tsconfig.json` 文件中添加一个设置，作为 ``webpack.config.js`` 选项后的内容，例如：

```json

```bash
$ npm i --save-dev webpack webpack-cli webpack-node-externals ts-loader run-script-webpack-plugin

```

```

这将告诉 TypeScript 使用轮询方法来检查文件变更，而不是文件系统事件（新的默认方法），这可能在某些机器上引起问题。

您可以在 `__LINK_50__` 中阅读更多关于 ``nodeExternals`` 选项的信息。